import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
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

    // if user is signed in and the current path is /login, redirect to /admin
    if (session?.user && req.nextUrl.pathname === '/login') {
      console.log('🔄 Middleware: Redirecting authenticated user from login to admin');
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // if user is not signed in and trying to access admin, redirect to login
    // but be less aggressive - only redirect for specific admin paths
    // EXCEPTION: Allow brief grace period for post-login redirects from /login
    const isPostLoginRedirect = req.headers.get('referer')?.includes('/login');
    const shouldAllowGracePeriod = isPostLoginRedirect && req.nextUrl.pathname.startsWith('/admin');
    
    if (!session?.user && req.nextUrl.pathname.startsWith('/admin')) {
      if (shouldAllowGracePeriod) {
        console.log('🟡 AUTH_GRACE_PERIOD_DEBUG: ALLOWING_POST_LOGIN_REDIRECT', {
          timestamp: new Date().toISOString(),
          path: req.nextUrl.pathname,
          referer: req.headers.get('referer'),
          message: 'Allowing admin access for post-login redirect - session may be propagating'
        });
        // Allow the request to proceed - session should be available shortly
        return res;
      }
      
      console.log('🚨 AUTH_REDIRECT_BLOCK_DEBUG: MIDDLEWARE_BLOCKING_ADMIN_ACCESS', {
        timestamp: new Date().toISOString(),
        path: req.nextUrl.pathname,
        hasSession: !!session,
        hasUser: !!session?.user,
        userAgent: req.headers.get('user-agent')?.slice(0, 50),
        referer: req.headers.get('referer'),
        isPostLoginRedirect,
        sessionDetails: session ? {
          userId: session.user?.id,
          email: session.user?.email,
          exp: session.expires_at
        } : 'NO_SESSION'
      });
      return NextResponse.redirect(new URL('/login', req.url))
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
  matcher: ['/admin/:path*', '/admin', '/login'],
} 