import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fetch original template
        const { data: originalTemplate, error: findError } = await db.from('Template')
            .select('*')
            .eq('id', id)
            .single();

        if (findError || !originalTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Create new template as a copy
        const { data: newTemplate, error: createError } = await db.from('Template')
            .insert({
                name: `Remix of ${originalTemplate.name}`,
                original_image_url: originalTemplate.original_image_url,
                structured_prompt: originalTemplate.structured_prompt,
                user_id: user.id,
                is_public: false, // Private by default
                folder_id: null,
                tags: originalTemplate.tags,
            })
            .select()
            .single();

        if (createError) throw createError;

        return NextResponse.json(newTemplate);

    } catch (error) {
        console.error('Remix error:', error);
        return NextResponse.json(
            { error: 'Failed to remix template' },
            { status: 500 }
        );
    }
}
