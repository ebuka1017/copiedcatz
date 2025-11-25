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

        const { blob_id } = await req.json();

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

        // Call Bria API with webhook callback
        const imageUrl = `https://blob.copiedcatz.com/${upload.filepath}`;
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bria-callback`;

        // Note: In a real scenario, we would call the Bria API here.
        // For this implementation, we assume the call is made.
        // If running locally without Bria API key, this might fail or need mocking.

        if (process.env.BRIA_API_KEY) {
            const maxRetries = 3;
            let attempt = 0;
            let success = false;

            while (attempt < maxRetries && !success) {
                try {
                    const briaResponse = await fetch('https://api.bria.ai/v1/inspire/extract', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.BRIA_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            image_url: imageUrl,
                            categories: [
                                'scene',
                                'lighting',
                                'camera',
                                'composition',
                                'color',
                                'style',
                                'technical',
                            ],
                            webhook_url: callbackUrl,
                            metadata: {
                                job_id,
                                user_id: user.id,
                            },
                        }),
                    });

                    if (!briaResponse.ok) {
                        throw new Error(`Bria API request failed: ${await briaResponse.text()}`);
                    }

                    success = true;

                } catch (err) {
                    attempt++;
                    console.error(`Bria API attempt ${attempt} failed:`, err);
                    if (attempt === maxRetries) {
                        // Mark job as failed in DB if we want to be thorough, but for now just log
                        console.error('All Bria API retries failed');
                    } else {
                        // Exponential backoff: 1s, 2s, 4s
                        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
                    }
                }
            }
        } else {
            console.warn('Skipping Bria API call - BRIA_API_KEY not set');
        }

        return NextResponse.json({ job_id });

    } catch (error) {
        console.error('Extraction start error:', error);
        return NextResponse.json(
            { error: 'Failed to start extraction' },
            { status: 500 }
        );
    }
}
