import { NextRequest, NextResponse } from 'next/server';
import { generateImageV2, generateStructuredPrompt } from '@/lib/bria/client';
import { verifyAuth } from '@/lib/auth';

// Proxy status check to avoid exposing API token
export async function GET(req: NextRequest) {
    const user = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusUrl = searchParams.get('url');

    if (!statusUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(statusUrl, {
            headers: {
                'api_token': process.env.BRIA_API_TOKEN!,
            },
        });

        if (!response.ok) {
            throw new Error(`Bria status check failed: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Status check error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, data } = body;

        if (!action || !data) {
            return NextResponse.json({ error: 'Missing action or data' }, { status: 400 });
        }

        if (action === 'generate_image') {
            // Allow client to specify sync, default to false (async) to prevent timeouts
            const sync = data.sync !== undefined ? data.sync : false;
            const result = await generateImageV2({ ...data, sync });
            return NextResponse.json(result);
        } else if (action === 'generate_structured_prompt') {
            const result = await generateStructuredPrompt(data);
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Bria API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
