
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

        // Ensure user exists locally (JIT Sync)
        const { error: upsertError } = await db.from('User').upsert(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                last_login_at: new Date().toISOString(),
                // Preserves existing fields unless specified?
                // Supabase upsert updates match columns. We might overwrite plan/credits if we pass defaults?
                // We should ONLY update safe fields.
                // However, user.id is the key.
                // Better pattern: try to get user. If not found, insert. If found, update login time.
                // Or use onConflict to ignore other fields?
                // Upsert replaces the row if no specific columns mentioned?
                // "upsert" usually updates provided columns.
                // Warning: this simple upsert might reset other columns if row exists but we only provide these.
                // Supabase (PostgREST) upsert updates ONLY the columns in the payload for the matching row?
                // Actually it acts like INSERT ... ON CONFLICT DO UPDATE SET ...
                // So it will update name/email/last_login.
                // It will NOT reset 'plan' or 'credits_remaining' to null if they are not in the payload and exist in DB?
                // CORRECT: It updates the specified columns.
            },
            { onConflict: 'id' }
        );

        if (upsertError) throw upsertError;

        // Create upload record
        const { data: upload, error: createError } = await db.from('Upload')
            .insert({
                user_id: user.id,
                filepath: filepath,
                status: 'PENDING',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();

        if (createError) throw createError;

        return NextResponse.json(upload);

    } catch (error) {
        console.error('Upload record creation failed:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create upload record' },
            { status: 500 }
        );
    }
}
