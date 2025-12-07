import { NextRequest, NextResponse } from 'next/server';
import { removeBackground } from '@/lib/bria/client';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const user = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { image_url } = body;

        if (!image_url) {
            return NextResponse.json({ error: 'Missing image_url' }, { status: 400 });
        }

        const resultUrl = await removeBackground(image_url);

        return NextResponse.json({ url: resultUrl });

    } catch (error: any) {
        console.error('Remove BG error:', error);
        return NextResponse.json({ error: error.message || 'Failed to remove background' }, { status: 500 });
    }
}
