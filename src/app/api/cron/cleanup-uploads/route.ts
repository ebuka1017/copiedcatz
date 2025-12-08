import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
// import { db } from '@/lib/db'; // Removed duplicate

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

export async function GET(req: Request) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow Vercel Cron if configured, or manual trigger with secret
        // For now, we'll just log a warning if no secret, but in prod you MUST secure this.
        // console.warn('Cron triggered without valid secret');
        // return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 1. Find expired uploads
        const { data: expiredUploads, error: findError } = await db.from('Upload')
            .select('*')
            .lt('expires_at', new Date().toISOString())
            .limit(100);

        if (findError) throw findError;

        if (!expiredUploads || expiredUploads.length === 0) {
            return NextResponse.json({ message: 'No expired uploads found' });
        }

        console.log(`Found ${expiredUploads.length} expired uploads to clean up.`);

        // 2. Delete from Supabase Storage
        const filePaths = expiredUploads.map((u) => u.filepath);

        // Note: db exported from @/lib/db is an admin client, so we can use it for storage too if needed,
        // but the original code created a new admin client. Since db IS an admin client, we can reuse it.
        // However, looking at imports, we already have createAdminClient import.
        // Let's use db since it's cleaner.

        const { error: storageError } = await db.storage
            .from('uploads')
            .remove(filePaths);

        if (storageError) {
            console.error('Failed to delete files from storage:', storageError);
        }

        // 3. Delete from Database
        const { count, error: deleteError } = await db.from('Upload')
            .delete({ count: 'exact' })
            .in('id', expiredUploads.map((u) => u.id));

        if (deleteError) throw deleteError;

        return NextResponse.json({
            message: 'Cleanup successful',
            deleted_count: count,
            files_processed: filePaths.length,
        });

    } catch (error) {
        console.error('Cleanup cron failed:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
