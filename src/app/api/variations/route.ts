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
        const { data: template, error: temError } = await db.from('Template')
            .select('user_id')
            .eq('id', template_id)
            .single();

        if (temError || !template || template.user_id !== user.id) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
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
        const { data: variation, error: varError } = await db.from('Variation')
            .insert({
                template_id,
                image_url: imageUrl,
                seed,
                modified_prompt: structured_prompt,
                generation_time_ms: generationTime,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (varError) throw varError;

        // Deduct credit
        // Manual decrement since no atomic increment in JS SDK update (without RPC)
        const newCredits = userRecord.credits_remaining - 1;
        await db.from('User')
            .update({ credits_remaining: newCredits })
            .eq('id', user.id);

        return NextResponse.json(variation);

    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate variation' },
            { status: 500 }
        );
    }
}
