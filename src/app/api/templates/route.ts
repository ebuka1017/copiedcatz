import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const templates = await db.template.findMany({
            where: {
                user_id: user.id,
            },
            orderBy: {
                updated_at: 'desc',
            },
            include: {
                variations: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc',
                    },
                },
            },
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Failed to list templates:', error);
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
        const { name, original_image_url, structured_prompt, folder_id, is_public, tags } = body;

        if (!name || !original_image_url || !structured_prompt) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const template = await db.template.create({
            data: {
                user_id: user.id,
                name,
                original_image_url,
                structured_prompt,
                folder_id,
                is_public: is_public || false,
                tags: tags || [],
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Failed to create template:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
