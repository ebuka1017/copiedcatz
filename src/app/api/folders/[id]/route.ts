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

        // Supabase select with relations.
        // children (Folder) - self relation on parent_id
        // templates (Template) - relation on folder_id
        const { data: folder, error: fetchError } = await db.from('Folder')
            .select(`
                *,
                children:Folder!parent_id(*),
                templates:Template(*)
            `)
            .eq('id', id)
            .single();

        if (fetchError || !folder) {
            if (fetchError && fetchError.code !== 'PGRST116') console.error(fetchError);
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
        const { data: existing, error: findError } = await db.from('Folder')
            .select('user_id')
            .eq('id', id)
            .single();

        if (findError || !existing) {
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

        const { data: updated, error: updateError } = await db.from('Folder')
            .update({
                name,
                parent_id,
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

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
        const { data: existing, error: findError } = await db.from('Folder')
            .select('user_id')
            .eq('id', id)
            .single();

        if (findError || !existing) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        if (existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete folder
        const { error: deleteError } = await db.from('Folder')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
