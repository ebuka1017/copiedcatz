import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function verifyAuth(req: NextRequest | Request) {
    // MOCK: Return a test user for now
    // In production, verify JWT from Authorization header
    // const token = req.headers.get('Authorization')?.split(' ')[1];

    // For now, we'll just return the first user in the DB or a mock user
    // This allows the app to work without a full auth system for the demo

    // Check if we have a user in DB
    const user = await db.user.findFirst();

    if (user) {
        return user;
    }

    // If no user exists, create a mock one for testing
    return await db.user.create({
        data: {
            email: 'demo@copiedcatz.com',
            name: 'Demo User',
            password_hash: 'mock_hash',
            plan: 'PRO',
            credits_remaining: 100,
        }
    });
}

export async function verifyJWT(token: string) {
    // MOCK: Verify token
    // In production, verify actual JWT signature
    if (!token) return null;

    const user = await db.user.findFirst();
    return user ? { sub: user.id } : null;
}
