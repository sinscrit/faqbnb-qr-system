import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // if user is signed in and the current path is /login, redirect the user to /admin
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // if user is not signed in and the current path is not /login, redirect the user to /login
  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/login'],
} 