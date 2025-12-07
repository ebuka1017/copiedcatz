import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Start extraction job (triggers Bria API with callback)
 */
export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let blob_id;
        try {
            const body = await req.json();
            blob_id = body.blob_id;
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        if (!blob_id) {
            return NextResponse.json({ error: 'Missing blob_id' }, { status: 400 });
        }

        // Fetch upload
        const upload = await db.upload.findUnique({
            where: { id: blob_id },
        });

        if (!upload || upload.user_id !== user.id) {
            return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
        }

        // Check credits
        const userRecord = await db.user.findUnique({
            where: { id: user.id },
        });

        if (!userRecord || userRecord.credits_remaining <= 0) {
            return NextResponse.json(
                { error: 'Insufficient credits' },
                { status: 402 }
            );
        }

        // Generate job ID
        const job_id = crypto.randomUUID();

        // Create extraction job record
        await db.extractionJob.create({
            data: {
                id: job_id,
                user_id: user.id,
                upload_id: blob_id,
                status: 'PROCESSING',
                progress: 0,
                created_at: new Date(),
            },
        });

        // Call Bria V2 API (Synchronous for now to ensure completion)
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${upload.filepath}`;

        // We use the Bria V2 client which handles the endpoint correctly
        // We use sync=true (implied by awaiting) or rely on the client's polling if it handles async
        // The generateStructuredPrompt in client.ts handles looking for status_url, so it behaves synchronously for us.

        try {
            // Dynamic import to avoid circular dep issues if any, though likely fine to static import
            // better to use the client function we verified
            const curModule = await import('@/lib/bria/client');
            const result = await curModule.generateStructuredPrompt({
                prompt: undefined, // Image only extraction
                images: [imageUrl]
            });

            // Create Template from result
            const template = await db.template.create({
                data: {
                    user_id: user.id,
                    name: `Extraction ${new Date().toLocaleString()}`,
                    original_image_url: imageUrl,
                    structured_prompt: result as any, // Verify this casts correctly to JSON
                    is_public: false,
                    tags: [],
                    variations: { create: [] }
                }
            });

            // Update job
            await db.extractionJob.update({
                where: { id: job_id },
                data: {
                    status: 'COMPLETED',
                    progress: 100,
                }
            });

            return NextResponse.json({
                job_id,
                status: 'COMPLETED',
                template_id: template.id
            });

        } catch (err: any) {
            console.error('Bria V2 Extraction failed:', err);
            await db.extractionJob.update({
                where: { id: job_id },
                data: {
                    status: 'FAILED',
                    error: err.message
                }
            });
            // Return failed status so client knows
            return NextResponse.json({ job_id, status: 'FAILED', error: err.message }, { status: 500 });
        }

    } catch (error) {
        console.error('Extraction start error:', error);
        return NextResponse.json(
            { error: 'Failed to start extraction' },
            { status: 500 }
        );
    }
}
