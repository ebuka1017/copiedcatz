import 'server-only';

const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    // 'BRIA_API_KEY', // Temporarily optional until we integrate real Bria
] as const;

export function validateEnv() {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.warn(
            `Missing required environment variables:\n${missing.join('\n')}\n\nPlease check your .env.local file.`
        );
    }
}
