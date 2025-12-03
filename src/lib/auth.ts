import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Verify user from Supabase Auth session
 * Use this in API routes instead of JWT
 */
export async function verifyAuth(req: NextRequest | Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        // Return Supabase user - you might want to fetch additional data from your DB
        return {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || null,
        };
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}
