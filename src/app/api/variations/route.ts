import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        console.log('[variations/POST] Starting...');

        const user = await verifyAuth(req as any);
        if (!user) {
            console.log('[variations/POST] Unauthorized - no user');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('[variations/POST] User authenticated:', user.id);

        const body = await req.json();
        const { template_id, image_url, seed, structured_prompt, generation_time_ms } = body;
        console.log('[variations/POST] Request body:', { template_id, image_url: image_url?.substring(0, 50) + '...', seed });

        if (!template_id || !image_url) {
            console.log('[variations/POST] Missing required fields');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getDb();

        // Verify template ownership
        console.log('[variations/POST] Verifying template ownership...');
        const { data: template, error: temError } = await db.from('Template')
            .select('user_id')
            .eq('id', template_id)
            .single();

        if (temError) {
            console.error('[variations/POST] Template query error:', temError);
            return NextResponse.json({ error: `Template error: ${temError.message}` }, { status: 500 });
        }

        if (!template || template.user_id !== user.id) {
            console.log('[variations/POST] Template not found or not owned by user');
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        console.log('[variations/POST] Template verified');

        // Store variation
        console.log('[variations/POST] Inserting variation...');
        const { data: variation, error: varError } = await db.from('Variation')
            .insert({
                template_id,
                image_url,
                seed: seed || 0,
                modified_prompt: structured_prompt,
                generation_time_ms: generation_time_ms || 0,
            })
            .select()
            .single();

        if (varError) {
            console.error('[variations/POST] Insert error:', JSON.stringify(varError, null, 2));
            return NextResponse.json(
                { error: `Database error: ${varError.message}`, details: varError },
                { status: 500 }
            );
        }

        console.log('[variations/POST] Variation saved:', variation.id);
        return NextResponse.json(variation);

    } catch (error: any) {
        console.error('[variations/POST] Caught error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to save variation' },
            { status: 500 }
        );
    }
}
