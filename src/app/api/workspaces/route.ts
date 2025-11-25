import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Find workspaces where user is owner OR member
        const workspaces = await db.workspace.findMany({
            where: {
                OR: [
                    { owner_id: user.id },
                    {
                        members: {
                            some: {
                                user_id: user.id,
                            },
                        },
                    },
                ],
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

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

        // Create workspace and add owner as member in a transaction
        const workspace = await db.$transaction(async (tx) => {
            const ws = await tx.workspace.create({
                data: {
                    name,
                    owner_id: user.id,
                },
            });

            await tx.workspaceMember.create({
                data: {
                    workspace_id: ws.id,
                    user_id: user.id,
                    role: 'ADMIN',
                },
            });

            return ws;
        });

        return NextResponse.json(workspace);
    } catch (error) {
        console.error('Failed to create workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
