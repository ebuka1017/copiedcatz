import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

export async function verifyAuth(req: NextRequest | Request) {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return null;
    }

    try {
        const verified = await verifyJWT(token);
        if (!verified) return null;

        const user = await db.user.findUnique({
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

                if(error || !user) {
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
