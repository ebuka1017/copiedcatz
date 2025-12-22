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
        const { data: upload, error: uploadError } = await db.from('Upload')
            .select('*')
            .eq('id', blob_id)
            .single();

        if (uploadError || !upload || upload.user_id !== user.id) {
            return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
        }

        // Check credits
        const { data: userRecord, error: userError } = await db.from('User')
            .select('credits_remaining')
            .eq('id', user.id)
            .single();

        if (userError || !userRecord || userRecord.credits_remaining <= 0) {
            return NextResponse.json(
                { error: 'Insufficient credits' },
                { status: 402 }
            );
        }

        // Generate job ID
        const job_id = crypto.randomUUID();

        // Create extraction job record
        const { error: jobError } = await db.from('ExtractionJob').insert({
            id: job_id,
            user_id: user.id,
            upload_id: blob_id,
            status: 'PROCESSING',
            progress: 0,
            created_at: new Date().toISOString(),
        });

        if (jobError) throw jobError;

        // Call Bria V2 API (Synchronous for now to ensure completion)
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${upload.filepath}`;

        try {
            const curModule = await import('@/lib/bria/client');
            const result = await curModule.generateStructuredPrompt({
                prompt: undefined, // Image only extraction
                images: [imageUrl]
            });

            // Create Template from result
            const { data: template, error: temError } = await db.from('Template')
                .insert({
                    user_id: user.id,
                    name: `Extraction ${new Date().toLocaleString()}`,
                    original_image_url: imageUrl,
                    structured_prompt: result as any,
                    is_public: false,
                    tags: [],
                    folder_id: null // Explicitly null to satisfy constraints if any, or omit
                })
                .select()
                .single();

            if (temError || !template) throw temError;

            // Update job
            await db.from('ExtractionJob').update({
                status: 'COMPLETED',
                progress: 100,
            }).eq('id', job_id);

            return NextResponse.json({
                job_id,
                status: 'COMPLETED',
                template_id: template.id
            });

        } catch (err: any) {
            console.error('Bria V2 Extraction failed:', err);
            await db.from('ExtractionJob').update({
                status: 'FAILED',
                error: err.message
            }).eq('id', job_id);

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
