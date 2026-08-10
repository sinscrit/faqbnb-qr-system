import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'
import {
  detectUserLanguage,
  setLocaleCookie,
  LOCALE_COOKIE_NAME,
} from '@/lib/i18n'
import {
  detectGuestLanguage,
  setGuestLanguageCookie,
  GUEST_LANG_COOKIE_NAME,
} from '@/lib/i18n/guest-language'
import type { SupportedLanguage } from '@/types/l10n'
import { isProductionBlockedRoute } from '@/lib/routing/production-route-policy'
import { isCanonicalMiddlewareOwnedRoute } from '@/lib/routing/canonical-route-policy'

/**
 * Fetch user's language preference from the database.
 * Returns null if user not found, no preference set, or on error.
 *
 * @param supabase - Supabase client instance
 * @param userId - User's unique identifier
 * @returns User's preferred_language value or null
 */
async function getUserLanguagePreference(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string
): Promise<string | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', userId)
      .single();

    if (error || !user) {
      // Log only if it's not a "not found" error
      if (error && error.code !== 'PGRST116') {
        console.log('[i18n] Error fetching user language preference:', error.message);
      }
      return null;
    }

    return user.preferred_language ?? null;
  } catch (e) {
    console.log('[i18n] Exception fetching user language preference:', e);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  // Prototype and diagnostic source stays useful locally, but production users
  // get one canonical product path and no discoverable duplicate surfaces.
  // This must run before Supabase/session work so the route gate cannot fail open.
  if (isProductionBlockedRoute(req.nextUrl.pathname)) {
    return new NextResponse(null, {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }

  const res = NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/register/')) {
    return NextResponse.redirect(new URL('/register', req.url), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (req.nextUrl.pathname === '/auth/oauth/callback') {
    return NextResponse.redirect(new URL('/login?notice=google_unavailable', req.url), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Canonical email-auth pages, callbacks, and the exact dashboard own their
  // cookie/session behavior in request-bound route handlers. Bypass legacy
  // session, profile, role, language, and debug branches so they cannot create
  // a competing redirect or remote request before the canonical API responds.
  // Nested dashboard routes intentionally remain on the transition path.
  if (isCanonicalMiddlewareOwnedRoute(req.nextUrl.pathname)) {
    res.headers.set('Cache-Control', 'no-store');
    return res;
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

    // ============ LANGUAGE DETECTION ============
    // Detect user's preferred language using priority cascade:
    // 1. User DB preference (if authenticated)
    // 2. FAQBNB_LANG cookie
    // 3. Accept-Language header
    // 4. Default ('en')

    let userLocalePreference: { id: string; preferred_language?: string | null } | null = null;

    if (session?.user) {
      // Fetch user's language preference from database
      const dbPreference = await getUserLanguagePreference(supabase, session.user.id);
      userLocalePreference = {
        id: session.user.id,
        preferred_language: dbPreference,
      };
    }

    const detectedLocale = detectUserLanguage(req, userLocalePreference);

    // Set locale in response header for server components
    res.headers.set('x-locale', detectedLocale);

    // Only update cookie if locale changed (optimization)
    const currentCookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (currentCookieLocale !== detectedLocale) {
      setLocaleCookie(res, detectedLocale);
      console.log('[MIDDLEWARE-I18N] Updated locale cookie:', {
        previous: currentCookieLocale || 'none',
        new: detectedLocale,
      });
    }

    console.log('[MIDDLEWARE-I18N] Language detected:', {
      locale: detectedLocale,
      source: userLocalePreference?.preferred_language ? 'user_db' :
              req.cookies.get(LOCALE_COOKIE_NAME)?.value ? 'cookie' : 'detection',
      path: req.nextUrl.pathname,
    });
    // ============ END LANGUAGE DETECTION ============

    // ============ GUEST LANGUAGE DETECTION ============
    // Detect and persist guest language preferences for public item pages.
    // Priority: URL param > Cookie > Accept-Language header > Default (en)
    // Sets x-guest-language header for server components to read.
    // Only writes cookie if absent (optimization for repeat visitors).
    // Applies to ALL visitors (guests and authenticated users) to ensure
    // shareable links work consistently regardless of recipient's auth status

    const isPublicItemRoute = req.nextUrl.pathname.startsWith('/item/');

    if (isPublicItemRoute) {
      console.log('[MIDDLEWARE-I18N-GUEST] Detecting guest language for:', req.nextUrl.pathname);

      // Read URL parameter (highest priority in detection cascade)
      const urlLangParam = req.nextUrl.searchParams.get('lang');

      // Development performance monitoring - warn if detection > 10ms (target < 5ms)
      let guestLanguage: SupportedLanguage;

      if (process.env.NODE_ENV === 'development') {
        const startTime = performance.now();
        // detectGuestLanguage handles: URL param > Cookie > Accept-Language > Default
        guestLanguage = detectGuestLanguage(req, urlLangParam ?? undefined);
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (duration > 10) {
          console.warn('[MIDDLEWARE-PERF] Guest language detection slow:', {
            duration: `${duration.toFixed(2)}ms`,
            path: req.nextUrl.pathname,
          });
        }
      } else {
        guestLanguage = detectGuestLanguage(req, urlLangParam ?? undefined);
      }

      // Set language in response header for server components to read
      res.headers.set('x-guest-language', guestLanguage);

      // Only set cookie if it doesn't already exist (optimization to avoid unnecessary writes)
      const existingGuestCookie = req.cookies.get(GUEST_LANG_COOKIE_NAME)?.value;

      if (!existingGuestCookie) {
        setGuestLanguageCookie(guestLanguage, res);
        console.log('[MIDDLEWARE-I18N-GUEST] Set guest language cookie:', guestLanguage);
      }

      console.log('[MIDDLEWARE-I18N-GUEST] Guest language detected:', {
        language: guestLanguage,
        source: urlLangParam ? 'url_param' :
                existingGuestCookie ? 'cookie' : 'accept_language_or_default',
        path: req.nextUrl.pathname,
        cookieSet: !existingGuestCookie,
      });
    }
    // ============ END GUEST LANGUAGE DETECTION ============

    // If there's an error getting session, let the page handle it
    if (error) {
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
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/admin') ||
                            req.nextUrl.pathname.startsWith('/user') ||
                            req.nextUrl.pathname.startsWith('/dashboard2') ||
                            req.nextUrl.pathname.startsWith('/dashboard');

    if (!session?.user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // FIXED: Check if authenticated user has a user record in the database
    // This handles "orphaned" auth users who completed OAuth but didn't complete registration
    // Skip this check for /register/complete since that's where we send orphaned users
    const isCompleteRegistrationPage = req.nextUrl.pathname === '/register/complete';
    if (session?.user && (isProtectedRoute || req.nextUrl.pathname === '/login') && !isCompleteRegistrationPage) {
      try {
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (userError || !userRecord) {
          // Canonical auth never sends an orphaned identity into the removed
          // access-code/profile-completion journey or places email in a URL.
          return NextResponse.redirect(new URL('/login?notice=session_invalid', req.url), {
            headers: { 'Cache-Control': 'no-store' },
          });
        }
      } catch {
        // Don't block the user if the check fails - let the page handle it
      }
    }

    // FIXED: Add specific check for authenticated users trying to access login page
    // Redirect all users to dashboard2 (current dashboard)
    if (session?.user && req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard2', req.url))
    }

    return res;
  } catch {
    // If middleware fails, let the page handle authentication
    return res;
  }
}

export const config = {
  matcher: [
    '/test/:path*',
    '/test-file-upload',
    '/simple-admin',
    '/simple-login',
    '/qr-demo',
    '/sentry-example-page',
    '/version',
    '/api/simple-auth/:path*',
    '/api/sentry-example-api',
    '/api/version',
    '/request-access',
    '/api/access/redeem',
    '/api/public/access-request',
    '/api/auth/validate-code',
    '/api/auth/complete-oauth-registration',
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/dashboard/:path*',
    '/dashboard',
    '/dashboard2/:path*',
    '/dashboard2',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/auth/confirm',
    '/auth/oauth/callback',
    '/register',
    '/register/:path*',
    '/item/:path*',  // Guest language detection for public item pages (REQ-E04-020)
  ],
}
