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
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        // Call Bria AI API - use same approach as DNA extraction (dynamic import of client)
        let imageUrl: string;
        let generationTime = 0;

        try {
            const startTime = Date.now();
            const briaClient = await import('@/lib/bria/client');
            const result = await briaClient.generateImageV2({
                structured_prompt,
                seed,
                sync: true
            });
            generationTime = Date.now() - startTime;

            // Check for error response
            if ((result as any).error) {
                throw new Error((result as any).error);
            }

            // Extract image URL
            if (result.image_url) {
                imageUrl = result.image_url;
            } else if (result.result && result.result.length > 0) {
                imageUrl = result.result[0].url;
            } else {
                throw new Error('No image returned from Bria');
            }
        } catch (briaError: any) {
            console.error('Bria generation failed:', briaError);
            return NextResponse.json(
                { error: briaError.message || 'Failed to generate image' },
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

        if (varError) {
            console.error('Variation insert error:', varError);
            return NextResponse.json(
                { error: `Database error: ${varError.message}` },
                { status: 500 }
            );
        }

        // Deduct credit
        const newCredits = userRecord.credits_remaining - 1;
        await db.from('User')
            .update({ credits_remaining: newCredits })
            .eq('id', user.id);

        return NextResponse.json(variation);

    } catch (error: any) {
        console.error('Generation error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate variation' },
            { status: 500 }
        );
    }
}
