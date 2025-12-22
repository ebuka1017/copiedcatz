import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateImageV2Server } from '@/lib/bria/server';

export async function POST(req: Request) {
    console.log('[Variations] Starting variation generation...');

    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('[Variations] User authenticated:', user.id);

        const { template_id, structured_prompt, seed } = await req.json();
        console.log('[Variations] Request data - template_id:', template_id, 'seed:', seed);

        // Verify template ownership
        const { data: template, error: temError } = await db.from('Template')
            .select('user_id')
            .eq('id', template_id)
            .single();

        if (temError || !template || template.user_id !== user.id) {
            console.log('[Variations] Template not found or not owned');
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        console.log('[Variations] Template ownership verified');

        // Check credits
        const { data: userRecord, error: userError } = await db.from('User')
            .select('credits_remaining')
            .eq('id', user.id)
            .single();

        if (userError || !userRecord || userRecord.credits_remaining <= 0) {
            console.log('[Variations] Insufficient credits');
            return NextResponse.json(
                { error: 'Insufficient credits' },
                { status: 402 }
            );
        }
        console.log('[Variations] Credits available:', userRecord.credits_remaining);

        // Call Bria AI API
        let imageUrl: string;
        let generationTime = 0;

        try {
            console.log('[Variations] Calling Bria API...');
            const startTime = Date.now();
            const result = await generateImageV2Server({
                structured_prompt,
                seed,
                sync: true
            });
            generationTime = Date.now() - startTime;
            console.log('[Variations] Bria response received:', JSON.stringify(result).substring(0, 200));

            // Check for error response from edge function
            if ((result as any).error) {
                console.error('[Variations] Edge function error:', (result as any).error);
                throw new Error((result as any).error);
            }

            // Handle both response formats
            if (result.image_url) {
                imageUrl = result.image_url;
                console.log('[Variations] Got image_url:', imageUrl.substring(0, 50) + '...');
            } else if (result.result && result.result.length > 0) {
                imageUrl = result.result[0].url;
                console.log('[Variations] Got result[0].url:', imageUrl.substring(0, 50) + '...');
            } else {
                console.error('[Variations] Unexpected response format:', JSON.stringify(result));
                throw new Error('No image returned from Bria');
            }
        } catch (briaError: any) {
            console.error('[Variations] Bria generation failed:', briaError.message);
            return NextResponse.json(
                { error: briaError.message || 'Failed to generate image with Bria' },
                { status: 502 }
            );
        }

        // Store variation
        console.log('[Variations] Inserting variation into database...');
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
            console.error('[Variations] Database insert error:', varError);
            return NextResponse.json(
                { error: `Database error: ${varError.message}` },
                { status: 500 }
            );
        }
        console.log('[Variations] Variation saved:', variation.id);

        // Deduct credit
        const newCredits = userRecord.credits_remaining - 1;
        const { error: creditError } = await db.from('User')
            .update({ credits_remaining: newCredits })
            .eq('id', user.id);

        if (creditError) {
            console.error('[Variations] Credit deduction error:', creditError);
        } else {
            console.log('[Variations] Credits deducted, remaining:', newCredits);
        }

        console.log('[Variations] Success! Returning variation');
        return NextResponse.json(variation);

    } catch (error: any) {
        console.error('[Variations] Unhandled error:', error?.message || error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate variation' },
            { status: 500 }
        );
    }
}
