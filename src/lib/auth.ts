import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';

export async function verifyAuth(req: NextRequest | Request) {
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return null;
    }

    try {
        const verified = await verifyJWT(token);
        if (!verified) return null;

        const user = await db.user.findUnique({
            where: { id: verified.sub as string },
        });

        return user;
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

export async function verifyJWT(token: string) {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}
