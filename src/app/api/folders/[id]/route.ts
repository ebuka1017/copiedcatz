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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const folder = await db.folder.findUnique({
            where: { id },
            include: {
                children: true,
                // We don't include templates by default to keep payload light, 
                // but client might need them. Let's include them for now as it's a detail view.
                templates: true
            },
        });

        if (!folder) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        if (folder.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(folder);
    } catch (error) {
        console.error('Error fetching folder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, parent_id } = body;

        // Verify ownership
        const existing = await db.folder.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prevent circular reference if moving folder
        if (parent_id) {
            if (parent_id === id) {
                return NextResponse.json({ error: 'Cannot move folder into itself' }, { status: 400 });
            }
        }

        const updated = await db.folder.update({
            where: { id },
            data: {
                name,
                parent_id,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating folder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existing = await db.folder.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await db.folder.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
