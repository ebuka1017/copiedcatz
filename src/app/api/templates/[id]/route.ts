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
        const template = await db.template.findUnique({
            where: { id },
            include: { variations: true },
        });

        if (!template) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        if (template.user_id !== user.id && !template.is_public) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(template);
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
        const existing = await db.template.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const updated = await db.template.update({
            where: { id },
            data: {
                name: body.name,
                structured_prompt: body.structured_prompt,
                is_public: body.is_public,
                folder_id: body.folder_id,
                tags: body.tags,
                updated_at: new Date(),
            },
            include: { variations: true },
        });

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
        const existing = await db.template.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await db.template.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Failed to delete template:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
