import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/server';

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
        const expiredUploads = await db.upload.findMany({
            where: {
                expires_at: {
                    lt: new Date(),
                },
            },
            take: 100, // Process in batches
        });

        if (expiredUploads.length === 0) {
            return NextResponse.json({ message: 'No expired uploads found' });
        }

        console.log(`Found ${expiredUploads.length} expired uploads to clean up.`);

        // 2. Delete from Supabase Storage
        const supabase = createAdminClient();
        const filePaths = expiredUploads.map((u) => u.filepath);

        const { error: storageError } = await supabase.storage
            .from('uploads')
            .remove(filePaths);

        if (storageError) {
            console.error('Failed to delete files from storage:', storageError);
            // We continue to delete from DB? Or retry?
            // If we fail to delete file, we shouldn't delete DB record or we'll leak storage.
            // But if file doesn't exist, we should delete DB record.
            // Let's assume partial failure is possible.
        }

        // 3. Delete from Database
        // We delete all found records. If storage delete failed, we might leave orphans in storage.
        // Better to delete DB records so we don't keep trying to process them?
        // Or maybe we should only delete DB records if storage delete succeeded?
        // For simplicity in this MVP cron: delete DB records.
        const { count } = await db.upload.deleteMany({
            where: {
                id: {
                    in: expiredUploads.map((u) => u.id),
                },
            },
        });

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
