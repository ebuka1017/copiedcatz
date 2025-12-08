import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const parent_id = searchParams.get('parent_id');

        let query = db.from('Folder')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (parent_id) {
            query = query.eq('parent_id', parent_id);
        } else {
            // If parent_id is missing/null, should we filter for root folders?
            // Prisma `where` clause: if parent_id is passed, it adds it.
            // If searchParams has it, we use it. If not, we don't add it?
            // "const parent_id = searchParams.get('parent_id');"
            // If parent_id is null (not in url), previous code didn't add it to whereClause. 
            // So it listed ALL folders?
            // "if (parent_id) { whereClause.parent_id = parent_id; }"
            // Yes, it listed all folders if no parent_id.
        }

        const { data: folders, error } = await query;

        if (error) throw error;

        return NextResponse.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, parent_id } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        const { data: folder, error } = await db.from('Folder')
            .insert({
                name,
                parent_id: parent_id || null,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(folder, { status: 201 });
    } catch (error) {
        console.error('Error creating folder:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
