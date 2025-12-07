import { NextRequest, NextResponse } from 'next/server';
import { upscale } from '@/lib/bria/client';
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

        const resultUrl = await upscale(image_url, 2); // Default to 2x upscale

        return NextResponse.json({ url: resultUrl });

    } catch (error: any) {
        console.error('Upscale error:', error);
        return NextResponse.json({ error: error.message || 'Failed to upscale image' }, { status: 500 });
    }
}
