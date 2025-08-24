import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // ============ OAUTH CALLBACK DETECTION LOGGING ============
  if (req.nextUrl.pathname === '/auth/oauth/callback') {
    console.log('🔗 MIDDLEWARE: OAUTH_CALLBACK_DETECTED', {
      timestamp: new Date().toISOString(),
      path: req.nextUrl.pathname,
      searchParams: Object.fromEntries(req.nextUrl.searchParams.entries()),
      hasCode: !!req.nextUrl.searchParams.get('code'),
      hasAccessCode: !!req.nextUrl.searchParams.get('accessCode'),
      hasEmail: !!req.nextUrl.searchParams.get('email'),
      userAgent: req.headers.get('user-agent')?.slice(0, 100),
      referer: req.headers.get('referer'),
      nextStep: 'ALLOWING_REQUEST_TO_PROCEED_TO_OAUTH_HANDLER'
    });
    // Allow OAuth callback to proceed without session check
    return res;
  }

  // Also log when users hit /register after OAuth (potential redirect target)
  if (req.nextUrl.pathname === '/register' && req.nextUrl.searchParams.get('oauth_success')) {
    console.log('🔗 MIDDLEWARE: OAUTH_REGISTER_REDIRECT_DETECTED', {
      timestamp: new Date().toISOString(),
      path: req.nextUrl.pathname,
      searchParams: Object.fromEntries(req.nextUrl.searchParams.entries()),
      hasOAuthSuccess: req.nextUrl.searchParams.get('oauth_success') === 'true',
      hasAccessCode: !!req.nextUrl.searchParams.get('accessCode'),
      hasEmail: !!req.nextUrl.searchParams.get('email'),
      referer: req.headers.get('referer'),
      nextStep: 'CHECKING_SESSION_FOR_OAUTH_REGISTRATION_COMPLETION'
    });
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  )

  // Exempt QR print pages from middleware authentication
  // They handle authentication internally with better error messages
  if (req.nextUrl.pathname.includes('/qr-print')) {
    console.log('🖨️ Middleware: Exempting QR print page from auth redirect:', req.nextUrl.pathname);
    return res;
  }

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    console.log('[MIDDLEWARE-DEBUG] Session check for path:', req.nextUrl.pathname, {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      hasError: !!error,
      errorMessage: error?.message,
      timestamp: Date.now()
    });

    // If there's an error getting session, let the page handle it
    if (error) {
      console.log('🔄 Middleware: Session error, letting page handle:', error.message);
      return res;
    }

    // This check is now handled below with better logging

    // Special protection for back office routes (requires system admin)
    if (session?.user && req.nextUrl.pathname.startsWith('/admin/back-office')) {
      console.log('🔐 Middleware: Checking system admin access for back office');
      
      try {
        // Check both admin_users table and is_admin flag
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        const { data: userWithAdminFlag, error: userFlagError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        const isAdminByTable = !adminError && adminUser;
        const isAdminByFlag = !userFlagError && userWithAdminFlag?.is_admin;

        if (!isAdminByTable && !isAdminByFlag) {
          console.log('🚨 Middleware: Access denied to back office - not system admin');
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        
        console.log('✅ Middleware: System admin access granted to back office');
      } catch (adminCheckError) {
        console.error('🔄 Middleware: Error checking admin status, redirecting to admin:', adminCheckError);
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    // Protected routes access control
    // if user is not signed in and trying to access protected routes, redirect to login
    if (!session?.user && (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/user'))) {
      console.log('🚨 MIDDLEWARE_REDIRECT_DEBUG: REDIRECTING_TO_LOGIN', {
        timestamp: new Date().toISOString(),
        path: req.nextUrl.pathname,
        hasSession: !!session,
        hasUser: !!session?.user,
        userAgent: req.headers.get('user-agent')?.slice(0, 50),
        referer: req.headers.get('referer'),
        reason: 'No authenticated session found for protected route'
      });
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // FIXED: Add specific check for authenticated users trying to access login page
    // Redirect regular users to user dashboard, admins to admin dashboard
    if (session?.user && req.nextUrl.pathname === '/login') {
      // Check if user is admin to determine redirect target
      let redirectTarget = '/user'; // Default for regular users
      
      try {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (adminUser) {
          redirectTarget = '/admin'; // Admin users go to admin panel
        }
      } catch (error) {
        // If error checking admin status, default to user dashboard
        console.log('Middleware: Could not check admin status, defaulting to user dashboard');
      }

      console.log('🔄 MIDDLEWARE_REDIRECT_DEBUG: AUTHENTICATED_USER_ON_LOGIN', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        userEmail: session.user.email,
        redirectingTo: redirectTarget,
        reason: 'User already authenticated, redirecting to appropriate dashboard'
      });
      return NextResponse.redirect(new URL(redirectTarget, req.url))
    }

    console.log('[MIDDLEWARE-DEBUG] Allowing request to proceed');
    return res;
  } catch (middlewareError) {
    // If middleware fails, let the page handle authentication
    console.error('🔄 Middleware: Error, letting page handle auth:', middlewareError);
    return res;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/user/:path*', '/user', '/login', '/auth/oauth/callback', '/register'],
} 