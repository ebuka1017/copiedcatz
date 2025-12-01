import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pusher } from '@/lib/pusher';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { result, metadata, status, error } = body;
        const { job_id, user_id } = metadata || {};

        if (!job_id) {
            return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
        }

        // 1. Find the job and upload
        const job = await db.extractionJob.findUnique({
            where: { id: job_id },
            include: { upload: true },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // 2. Handle failure
        if (status === 'failed' || error) {
            await db.extractionJob.update({
                where: { id: job_id },
                data: {
                    status: 'FAILED',
                    error: error || 'Unknown error from Bria',
                },
            });

            await pusher.trigger(`private-job-${job_id}`, 'error', {
                message: error || 'Extraction failed',
            });

            return NextResponse.json({ received: true });
        }

        // 3. Handle success
        // Bria V1/V2 result structure might vary. Assuming 'result' contains the structured prompt.
        // If result is a string (JSON string), parse it.
        let structuredPrompt = result;
        if (typeof result === 'string') {
            try {
                structuredPrompt = JSON.parse(result);
            } catch (e) {
                console.error('Failed to parse result JSON', e);
            }
        }

        // Update job status
        await db.extractionJob.update({
            where: { id: job_id },
            data: {
                status: 'COMPLETED',
                progress: 100,
            },
        });

        // Create Template
        // Construct image URL from blob path
        // Note: Ensure this domain matches your Vercel Blob setup
        const imageUrl = `https://blob.copiedcatz.com/${job.upload.filepath}`;

        const template = await db.template.create({
            data: {
                user_id: user_id,
                name: 'Extracted Template', // Default name
                original_image_url: imageUrl,
                structured_prompt: structuredPrompt,
                is_public: false,
                tags: ['extracted'],
            },
        });

        // Trigger Pusher success
        await pusher.trigger(`private-job-${job_id}`, 'complete', {
            template_id: template.id,
            structured_prompt: structuredPrompt,
        });

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
