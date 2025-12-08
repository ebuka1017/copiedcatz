import { SignJWT } from 'jose';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_Admin_KEY; // Fallback or check naming

if (!supabaseUrl || !supabaseKey) {
    // If running in build context where envs might be missing, 
    // we should perhaps just skip or warn? 
    // But if someone runs this script, they need envs.
    // For build safety, let's allow it to compile but fail at runtime if missing.
}

const supabase = createClient(supabaseUrl!, supabaseKey!);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    // throw new Error('JWT_SECRET environment variable is not defined');
    console.warn('JWT_SECRET not defined');
}

async function generateToken() {
    if (!JWT_SECRET || !supabaseUrl || !supabaseKey) {
        console.error('Missing env vars');
        return;
    }

    // 1. Get or create a test user
    const { data: users } = await supabase.from('User').select('*').limit(1);
    let user = users && users.length > 0 ? users[0] : null;

    if (!user) {
        console.log('No user found, creating test user...');
        const { data: newUser, error } = await supabase.from('User').insert({
            email: 'test@copiedcatz.com',
            name: 'Test User',
            plan: 'PRO',
            credits_remaining: 100,
        }).select().single();

        if (error) {
            console.error('Failed to create user', error);
            return;
        }
        user = newUser;
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
    .finally(() => { });
