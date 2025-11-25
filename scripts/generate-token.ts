import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';

async function generateToken() {
    // 1. Get or create a test user
    let user = await prisma.user.findFirst();

    if (!user) {
        console.log('No user found, creating test user...');
        user = await prisma.user.create({
            data: {
                email: 'test@copiedcatz.com',
                name: 'Test User',
                password_hash: 'mock_hash', // We don't use this for JWT auth
                plan: 'PRO',
                credits_remaining: 100,
            }
        });
    }

    console.log(`Generating token for user: ${user.email} (${user.id})`);

    // 2. Sign a JWT for this user
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ sub: user.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);

    console.log('\n✅ Valid JWT Token:');
    console.log(token);
    console.log('\n📋 Curl Command Example:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/templates`);
}

generateToken()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
