import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

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
    if (!session?.user && req.nextUrl.pathname.startsWith('/admin')) {
      console.log('[MIDDLEWARE-DEBUG] Redirecting to login - no session found for admin path');
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