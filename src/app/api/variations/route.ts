import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

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
        // Mocking the call for now as we might not have the key or it's a serverless function
        // In production:
        /*
        const briaResponse = await fetch('https://api.bria.ai/v1/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.BRIA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: structured_prompt, // Need to convert structured prompt to text or Bria format
                seed: seed,
                // ... other params
            }),
        });
        const briaData = await briaResponse.json();
        const imageUrl = briaData.image_url;
        */

        // MOCK GENERATION
        const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`; // Placeholder
        const generationTime = 1500; // Mock time

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
