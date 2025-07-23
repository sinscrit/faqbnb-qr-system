import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/admin',
  '/api/admin',
];

// Temporary bypass for testing analytics endpoints
const BYPASS_PATHS = [
  '/api/admin/analytics',
  '/api/admin/items/',  // Allow analytics endpoints for testing
  '/api/admin/items',   // Allow admin items list for testing
];

// Paths that should redirect authenticated users (like login page)
const AUTH_PATHS = [
  '/login',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get the pathname
  const pathname = req.nextUrl.pathname;
  
  // Check if this is a protected path
  const isBypassPath = BYPASS_PATHS.some(path => pathname.startsWith(path));
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path)) && !isBypassPath;
  const isAuthPath = AUTH_PATHS.some(path => pathname.startsWith(path));

  try {
    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Enhanced debugging for session detection
    const cookies = req.headers.get('cookie') || '';
    const hasSessionCookies = cookies.includes('supabase');
    
    console.log(`Middleware Debug: ${pathname}`);
    console.log(`- Cookies present: ${hasSessionCookies ? 'YES' : 'NO'}`);
    console.log(`- Session result: ${session ? `User ${session.user.email} (${session.user.id})` : 'NONE'}`);
    
    if (sessionError) {
      console.error('Middleware session error:', sessionError.message);
      
      if (isProtectedPath) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      return res;
    }

    // Handle protected paths
    if (isProtectedPath) {
      if (!session) {
        // No session - redirect to login immediately
        console.log('Middleware: No session detected, redirecting to login');
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user is an admin
      if (!session.user.email) {
        console.log('Access denied - no email in session');
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(loginUrl);
      }

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', session.user.email)
        .single();

      if (adminError || !adminUser || adminUser.role !== 'admin') {
        console.log('Access denied - not an admin:', {
          userId: session.user.id,
          adminError: adminError?.message,
          adminUser,
        });

        // User is not an admin - sign them out and redirect to login
        await supabase.auth.signOut();
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(loginUrl);
      }

      console.log('Admin access granted for:', session.user.email);
    }

    // Handle auth paths (like login page)
    if (isAuthPath && session) {
      // User is already authenticated - check if they're an admin
      if (!session.user.email) {
        return res; // Skip redirect if no email
      }

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', session.user.email)
        .single();

      if (!adminError && adminUser && adminUser.role === 'admin') {
        // Admin user trying to access login page - redirect to admin panel
        const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/admin';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    // Refresh the session if it's close to expiring
    if (session && session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (expiresAt <= fiveMinutesFromNow) {
        console.log('Refreshing session in middleware');
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Failed to refresh session in middleware:', refreshError);
          
          if (isProtectedPath) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('redirect', pathname);
            loginUrl.searchParams.set('error', 'session_expired');
            return NextResponse.redirect(loginUrl);
          }
        }
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect protected paths to login
    if (isProtectedPath) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'auth_error');
      return NextResponse.redirect(loginUrl);
    }
    
    return res;
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 