import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { db } from '@/lib/db';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

/**
 * Webhook endpoint for Bria API callbacks
 *
 * Bria calls this as it completes each category
 */
export async function POST(req: Request) {
    try {
        // Verify webhook signature (security)
        // const signature = req.headers.get('x-bria-signature');
        const body = await req.text();

        // TODO: Verify signature matches HMAC(body, BRIA_WEBHOOK_SECRET)

        const data = JSON.parse(body);
        const { job_id, user_id, category, category_data, status, progress, error } = data;

        // Update job status
        await db.extractionJob.update({
            where: { id: job_id },
            data: {
                status: status === 'completed' ? 'COMPLETED' : status === 'failed' ? 'FAILED' : 'PROCESSING',
                progress: progress,
                error: error || null,
                updated_at: new Date(),
            },
        });

        // Trigger Pusher event to client
        if (status === 'processing' && category && category_data) {
            // Category completed
            await pusher.trigger(`private-job-${job_id}`, 'category-complete', {
                category,
                data: category_data,
                progress,
            });

        } else if (status === 'completed') {
            // All categories done - create template
            const extractionJob = await db.extractionJob.findUnique({
                where: { id: job_id },
                include: { upload: true },
            });

            if (!extractionJob) {
                throw new Error('Job not found');
            }

            // Assemble structured prompt from all category data
            const structuredPrompt = data.structured_prompt;

            // Create template
            const template = await db.template.create({
                data: {
                    user_id,
                    name: 'Untitled Template',
                    original_image_url: `https://blob.copiedcatz.com/${extractionJob.upload.filepath}`,
                    structured_prompt: structuredPrompt,
                    folder_id: null,
                    is_public: false,
                    tags: [],
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });

            // Deduct credit
            await db.user.update({
                where: { id: user_id },
                data: {
                    credits_remaining: { decrement: 1 },
                },
            });

            // Notify client of completion
            await pusher.trigger(`private-job-${job_id}`, 'complete', {
                template_id: template.id,
                structured_prompt: structuredPrompt,
            });

        } else if (status === 'failed') {
            // Extraction failed
            await pusher.trigger(`private-job-${job_id}`, 'error', {
                message: error || 'Extraction failed',
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
