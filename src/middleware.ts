import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zljkcihttlwnvriycokw.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsamtjaWh0dGx3bnZyaXljb2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDgyODksImV4cCI6MjA4MDQyNDI4OX0.fZqod0QDSR9TavoJBeDPzMjrNXb8XoN1IpjEvoaWD28',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session to keep it alive
    // This is crucial for maintaining auth state across requests
    const { data: { session }, error } = await supabase.auth.getSession();

    // Add session info to response headers for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
        response.headers.set('x-auth-status', session ? 'authenticated' : 'unauthenticated');
    }

    // Redirect unauthenticated users trying to access protected routes
    const protectedPaths = ['/dashboard', '/editor', '/library', '/settings'];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    const authPaths = ['/login', '/signup'];
    const isAuthPath = authPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isAuthPath && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (they handle their own auth)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
};
