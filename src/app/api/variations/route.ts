import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateImageV2 } from '@/lib/bria/client';

export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { template_id, structured_prompt, seed } = await req.json();

        // Verify template ownership
        const template = await db.template.findUnique({
            where: { id: template_id },
        });

        if (!template || template.user_id !== user.id) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
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

        // Call Bria AI API
        let imageUrl: string;
        let generationTime = 0;

        try {
            const startTime = Date.now();
            const result = await generateImageV2({
                structured_prompt,
                seed,
                sync: true // Force sync for now, consistent with current architecture
            });
            generationTime = Date.now() - startTime;

            if (result.result && result.result.length > 0) {
                imageUrl = result.result[0].url;
            } else {
                throw new Error('No image returned from Bria');
            }
        } catch (briaError) {
            console.error('Bria generation failed:', briaError);
            return NextResponse.json(
                { error: 'Failed to generate image with Bria' },
                { status: 502 }
            );
        }

        // Store variation
        const variation = await db.variation.create({
            data: {
                template_id,
                image_url: imageUrl,
                seed,
                modified_prompt: structured_prompt,
                generation_time_ms: generationTime,
                created_at: new Date(),
            },
        });

        // Deduct credit
        await db.user.update({
            where: { id: user.id },
            data: {
                credits_remaining: { decrement: 1 },
            },
        });

        return NextResponse.json(variation);

    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate variation' },
            { status: 500 }
        );
    }
}
