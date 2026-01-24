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
      userId: session?.user?.id || 'anonymous',
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
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/admin') ||
                            req.nextUrl.pathname.startsWith('/user') ||
                            req.nextUrl.pathname.startsWith('/dashboard2') ||
                            req.nextUrl.pathname.startsWith('/dashboard');

    if (!session?.user && isProtectedRoute) {
      console.log('🚨 MIDDLEWARE_REDIRECT_DEBUG: REDIRECTING_TO_LOGIN', {
        timestamp: new Date().toISOString(),
        path: req.nextUrl.pathname,
        hasSession: !!session,
        hasUser: !!session?.user,
        userAgent: req.headers.get('user-agent')?.slice(0, 50),
        referer: req.headers.get('referer'),
        reason: 'No authenticated session found for protected route',
        routeType: 'unified'
      });
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
          console.log('🔄 MIDDLEWARE_REDIRECT_DEBUG: ORPHANED_AUTH_USER_DETECTED', {
            timestamp: new Date().toISOString(),
            userId: session.user.id,
            userEmail: session.user.email,
            path: req.nextUrl.pathname,
            redirectingTo: '/register/complete',
            reason: 'Authenticated user has no user record - needs to complete registration',
            dbError: userError?.message
          });

          // Redirect orphaned users to complete registration
          // Pass email as query param so they can complete registration
          const completeUrl = new URL('/register/complete', req.url);
          completeUrl.searchParams.set('email', session.user.email || '');
          return NextResponse.redirect(completeUrl);
        }
      } catch (dbCheckError) {
        console.error('🔄 MIDDLEWARE: Error checking user record, continuing:', dbCheckError);
        // Don't block the user if the check fails - let the page handle it
      }
    }

    // FIXED: Add specific check for authenticated users trying to access login page
    // Redirect all users to dashboard2 (current dashboard)
    if (session?.user && req.nextUrl.pathname === '/login') {
      console.log('🔄 MIDDLEWARE_REDIRECT_DEBUG: AUTHENTICATED_USER_ON_LOGIN', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        userEmail: session.user.email,
        redirectingTo: '/dashboard2',
        reason: 'User already authenticated, redirecting to dashboard2',
        routeType: 'unified'
      });
      return NextResponse.redirect(new URL('/dashboard2', req.url))
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
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/dashboard/:path*',
    '/dashboard',
    '/dashboard2/:path*',
    '/dashboard2',
    '/login',
    '/auth/oauth/callback',
    '/register',
    '/register/:path*',
    '/item/:path*',  // Guest language detection for public item pages (REQ-E04-020)
  ],
} 