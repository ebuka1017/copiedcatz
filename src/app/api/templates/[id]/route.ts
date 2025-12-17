import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { data: template, error: findError } = await db.from('Template')
            .select('*, variations:Variation(*)')
            .eq('id', id)
            .single();

        if (findError || !template) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        if (template.user_id !== user.id && !template.is_public) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Ensure variations is always an array
        return NextResponse.json({
            ...template,
            variations: template.variations || []
        });
    } catch (error) {
        console.error('Failed to load template:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Verify ownership
        const { data: existing, error: findError } = await db.from('Template')
            .select('user_id')
            .eq('id', id)
            .single();

        if (findError || !existing) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { data: updated, error: updateError } = await db.from('Template')
            .update({
                name: body.name,
                structured_prompt: body.structured_prompt,
                is_public: body.is_public,
                folder_id: body.folder_id,
                tags: body.tags,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('*, variations:Variation(*)')
            .single();

        if (updateError) throw updateError;

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update template:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: existing, error: findError } = await db.from('Template')
            .select('user_id')
            .eq('id', id)
            .single();

        if (findError || !existing) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { error: deleteError } = await db.from('Template')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Failed to delete template:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
