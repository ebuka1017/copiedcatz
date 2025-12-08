import { createAdminClient } from '@/lib/supabase/server';

// Exporting a singleton admin client for server-side operations
// Note: In Supabase, we typically create a new client per request to handle auth correctly,
// but for admin tasks (bypassing RLS) we can use a service role client.
// However, the `createAdminClient` function in server.ts creates a new instance.

export const db = createAdminClient();
