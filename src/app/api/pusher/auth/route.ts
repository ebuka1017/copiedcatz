import { NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Authenticate user for private Pusher channels
 */
export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.text();
        const params = new URLSearchParams(body);
        const socketId = params.get('socket_id');
        const channelName = params.get('channel_name');

        if (!socketId || !channelName) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Verify user has access to this channel
        // Channel format: private-job-{job_id}
        const jobId = channelName.replace('private-job-', '');

        const job = await db.extractionJob.findUnique({
            where: { id: jobId },
        });

        if (!job || job.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Authorize
        const authResponse = pusher.authorizeChannel(socketId, channelName);

        return NextResponse.json(authResponse);

    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
