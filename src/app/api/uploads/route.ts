
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { filepath } = body;

        if (!filepath) {
            return NextResponse.json({ error: 'Missing filepath' }, { status: 400 });
        }

        // Create upload record
        const upload = await db.upload.create({
            data: {
                user_id: user.id,
                filepath: filepath,
                status: 'PENDING',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });

        return NextResponse.json(upload);

    } catch (error) {
        console.error('Upload record creation failed:', error);
        return NextResponse.json(
            { error: 'Failed to create upload record' },
            { status: 500 }
        );
    }
}
