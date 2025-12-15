import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zljkcihttlwnvriycokw.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsamtjaWh0dGx3bnZyaXljb2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDgyODksImV4cCI6MjA4MDQyNDI4OX0.fZqod0QDSR9TavoJBeDPzMjrNXb8XoN1IpjEvoaWD28',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zljkcihttlwnvriycokw.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsamtjaWh0dGx3bnZyaXljb2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg0ODI4OSwiZXhwIjoyMDgwNDI0Mjg5fQ.gD1hHbGCN8x4InO8AumwUJSzYKGKYa_WqSN6AaKNDLg',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
