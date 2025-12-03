import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Sync Supabase Auth users to Prisma database
 * Configure in Supabase Dashboard → Authentication → Webhooks
 */
export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { type, record } = payload;

        // Verify webhook signature (recommended for production)
        // const signature = req.headers.get('x-supabase-signature');
        // ... verify signature

        if (type === 'INSERT' && record.email) {
            // Create user in Prisma when they sign up
            await db.user.upsert({
                where: { id: record.id },
                update: {
                    email: record.email,
                    name: record.raw_user_meta_data?.name || null,
                    email_verified: record.email_confirmed_at !== null,
                },
                create: {
                    id: record.id,
                    email: record.email,
                    name: record.raw_user_meta_data?.name || null,
                    email_verified: record.email_confirmed_at !== null,

                    plan: 'FREE',
                    credits_remaining: 10, // Free tier credits
                },
            });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Supabase webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
