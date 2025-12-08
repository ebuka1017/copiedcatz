import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get workspaces where user is a member
        const { data: memberships } = await db.from('WorkspaceMember')
            .select('workspace_id')
            .eq('user_id', user.id);

        const memberWorkspaceIds = memberships?.map(m => m.workspace_id) || [];

        // 2. Fetch workspaces where owner OR member
        // Construct OR filter: owner_id.eq.USER_ID,id.in.(...ids)
        // Note: usage of explicit syntax string for OR
        let query = db.from('Workspace')
            .select(`
                *,
                members:WorkspaceMember(
                    user:User(id, name, email)
                ),
                owner:User(id, name, email)
            `)
            .order('created_at', { ascending: false });

        if (memberWorkspaceIds.length > 0) {
            query = query.or(`owner_id.eq.${user.id},id.in.(${memberWorkspaceIds.join(',')})`);
        } else {
            query = query.eq('owner_id', user.id);
        }

        const { data: workspaces, error } = await query;

        if (error) throw error;

        return NextResponse.json(workspaces);
    } catch (error) {
        console.error('Failed to list workspaces:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ message: 'Missing workspace name' }, { status: 400 });
        }

        // Create workspace
        const { data: workspace, error: createError } = await db.from('Workspace')
            .insert({
                name,
                owner_id: user.id
            })
            .select()
            .single();

        if (createError || !workspace) throw createError;

        // Add owner as ADMIN member
        const { error: memberError } = await db.from('WorkspaceMember')
            .insert({
                workspace_id: workspace.id,
                user_id: user.id,
                role: 'ADMIN'
            });

        if (memberError) {
            // Rollback attempt (best effort)
            await db.from('Workspace').delete().eq('id', workspace.id);
            throw memberError;
        }

        return NextResponse.json(workspace);
    } catch (error) {
        console.error('Failed to create workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
