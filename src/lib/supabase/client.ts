import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zljkcihttlwnvriycokw.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsamtjaWh0dGx3bnZyaXljb2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDgyODksImV4cCI6MjA4MDQyNDI4OX0.fZqod0QDSR9TavoJBeDPzMjrNXb8XoN1IpjEvoaWD28'
    );
}

/**
 * Get current session with Authorization header for edge function calls
 * Returns null if no active session
 */
export async function getAuthHeader(): Promise<string | null> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        return null;
    }

    return `Bearer ${session.access_token}`;
}

/**
 * Call a Supabase Edge Function with proper authentication
 * This ensures the Authorization header is always passed correctly
 */
export async function callEdgeFunction(
    functionName: string,
    options?: {
        body?: Record<string, unknown> | FormData;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    }
): Promise<any> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zljkcihttlwnvriycokw.supabase.co';
    const url = `${supabaseUrl}/functions/v1/${functionName}`;

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
    };

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!(options?.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        method: options?.method || 'POST',
        headers,
        body: options?.body instanceof FormData
            ? options.body
            : options?.body
                ? JSON.stringify(options.body)
                : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge function error: ${response.status} - ${errorText}`);
    }

    return response.json();
}
