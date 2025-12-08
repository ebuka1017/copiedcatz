import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Get public URL for uploaded blob
 * 
 * Security:
 * - Verifies user owns the upload
 * - Checks upload hasn't expired
 * - Returns public URL for Bria API consumption
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ blob_id: string }> }
) {
    try {
        const user = await verifyAuth(req as any);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { blob_id } = await params;

        // Fetch upload metadata
        // Fetch upload metadata
        const { data: upload, error: findError } = await db.from('Upload')
            .select('*')
            .eq('id', blob_id)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            console.error('Upload find error:', findError);
            // Proceed to 404 checks
        }

        if (!upload) {
            return NextResponse.json(
                { error: 'Upload not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (upload.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Check expiration
        if (new Date() > upload.expires_at) {
            return NextResponse.json(
                { error: 'Upload expired' },
                { status: 410 }
            );
        }

        // Return public URL
        // Use Supabase public URL
        const public_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${upload.filepath}`;

        return NextResponse.json({
            blob_id,
            public_url,
            uploaded_at: upload.created_at,
            expires_at: upload.expires_at,
        });

    } catch (error) {
        console.error('Upload fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
