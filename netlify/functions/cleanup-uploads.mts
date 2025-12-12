import type { Config, Context } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

/**
 * Netlify Scheduled Function for cleaning up expired uploads
 * Runs daily at 3:00 AM UTC
 */
export default async (req: Request, context: Context) => {
    console.log('Starting scheduled cleanup of expired uploads...');

    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables');
        return new Response('Server misconfiguration', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 1. Find expired uploads
        const { data: expiredUploads, error: findError } = await supabase
            .from('Upload')
            .select('*')
            .lt('expires_at', new Date().toISOString())
            .limit(100);

        if (findError) throw findError;

        if (!expiredUploads || expiredUploads.length === 0) {
            console.log('No expired uploads found');
            return Response.json({ message: 'No expired uploads found' });
        }

        console.log(`Found ${expiredUploads.length} expired uploads to clean up.`);

        // 2. Delete from Supabase Storage
        const filePaths = expiredUploads.map((u) => u.filepath);

        const { error: storageError } = await supabase.storage
            .from('uploads')
            .remove(filePaths);

        if (storageError) {
            console.error('Failed to delete files from storage:', storageError);
        }

        // 3. Delete from Database
        const { count, error: deleteError } = await supabase
            .from('Upload')
            .delete({ count: 'exact' })
            .in('id', expiredUploads.map((u) => u.id));

        if (deleteError) throw deleteError;

        console.log(`Cleanup successful: deleted ${count} records, processed ${filePaths.length} files`);

        return Response.json({
            message: 'Cleanup successful',
            deleted_count: count,
            files_processed: filePaths.length,
        });

    } catch (error) {
        console.error('Cleanup failed:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};

// Netlify scheduled function configuration
// Runs daily at 3:00 AM UTC
export const config: Config = {
    schedule: "@daily"
};
