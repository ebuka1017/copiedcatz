import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { template_id, image_url, seed, structured_prompt, generation_time_ms } = await req.json();

        if (!template_id || !image_url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify template ownership
        const { data: template, error: temError } = await db.from('Template')
            .select('user_id')
            .eq('id', template_id)
            .single();

        if (temError || !template || template.user_id !== user.id) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Store variation
        const { data: variation, error: varError } = await db.from('Variation')
            .insert({
                template_id,
                image_url,
                seed: seed || 0,
                modified_prompt: structured_prompt,
                generation_time_ms: generation_time_ms || 0,
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

        return NextResponse.json(variation);

    } catch (error: any) {
        console.error('Save variation error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to save variation' },
            { status: 500 }
        );
    }
}
