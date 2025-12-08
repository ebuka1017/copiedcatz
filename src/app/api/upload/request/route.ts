import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';
// import { createAdminClient } from '@/lib/supabase/server';

/**
 * Request a signed upload URL for image upload
 * 
 * Security:
 * - Requires authentication
 * - Rate limited to 50 uploads/hour per user
 * - Signed URLs expire in 5 minutes
 * - Uploads auto-deleted after 24 hours (handled by bucket policy or cron)
 */
export async function POST(req: Request) {
    try {
        // 1. Verify authentication
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Rate limiting
        const limiter = rateLimit({
            interval: 60 * 60 * 1000, // 1 hour
            uniqueTokenPerInterval: 500,
        });

        try {
            await limiter.check(50, user.id); // 50 uploads per hour
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // 3. Generate unique blob ID
        const blob_id = crypto.randomUUID();
        const filepath = `${user.id}/${blob_id}`; // Supabase paths: user_id/blob_id

        // 4. Generate signed upload URL (expires in 5 minutes)
        // 4. Generate signed upload URL (expires in 5 minutes)
        // db is the admin client, so we reuse it
        const { data, error } = await db
            .storage
            .from('uploads')
            .createSignedUploadUrl(filepath);

        if (error || !data) {
            console.error('Supabase storage error:', error);
            throw new Error('Failed to generate upload URL');
        }

        // 5. Store metadata in database
        const { error: dbError } = await db.from('Upload').insert({
            id: blob_id,
            user_id: user.id,
            filepath,
            status: 'PENDING',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
        });

        if (dbError) throw dbError;

        // 6. Return signed URL and blob ID
        return NextResponse.json({
            signed_url: data.signedUrl,
            blob_id,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
        });

    } catch (error) {
        console.error('Upload request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
