import { createAdminClient } from '@/lib/supabase/server';

// Create a fresh admin client for each request
// This avoids stale connections and ensures environment variables are available
export function getDb() {
    return createAdminClient();
}

// For backward compatibility - used by most API routes
// Creates a new client instance (safe because createAdminClient is lightweight)
export const db = createAdminClient();
