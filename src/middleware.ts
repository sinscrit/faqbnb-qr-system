import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase';

// Helper function to extract property ID from URL path
function extractPropertyIdFromPath(pathname: string): string | null {
  // Match patterns like /admin/properties/[propertyId] or /api/admin/properties/[propertyId]
  const propertyMatch = pathname.match(/\/(?:admin|api\/admin)\/properties\/([a-f0-9-]{36})/);
  if (propertyMatch) {
    return propertyMatch[1];
  }

  // Match patterns like /admin/items/[publicId] where we need to get the property from the item
  const itemMatch = pathname.match(/\/(?:admin|api\/admin)\/items\/([^\/]+)/);
  if (itemMatch) {
    // For item paths, we'll need to validate item ownership through property ownership
    // Return the item ID and handle validation in the calling code
    return itemMatch[1];
  }

  return null;
}

// Paths that require authentication
const PROTECTED_PATHS = [
  '/admin',
  '/api/admin',
];

// Property-specific paths that require property ownership validation
const PROPERTY_PATHS = [
  '/admin/properties/',
  '/admin/items/',
  '/admin/analytics/',
  '/api/admin/properties/',
  '/api/admin/items/',
  '/api/admin/analytics/',
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
  const isPropertyPath = PROPERTY_PATHS.some((path: string) => pathname.startsWith(path));
  const isProtectedPath = PROTECTED_PATHS.some((path: string) => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some((path: string) => pathname.startsWith(path));

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

      // Check if user is authenticated and valid
      if (!session.user.email) {
        console.log('Access denied - no email in session');
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(loginUrl);
      }

      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', session.user.email)
        .single();

      let isAdmin = false;
      if (!adminError && adminUser && adminUser.role === 'admin') {
        isAdmin = true;
        console.log('Admin access granted for:', session.user.email);
      } else {
        // Check if user is a regular user
        const { data: regularUser, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userError || !regularUser) {
          console.log('Access denied - user not found in system:', {
            userId: session.user.id,
            adminError: adminError?.message,
            userError: userError?.message,
          });

          // User is not in the system - sign them out and redirect to login
          await supabase.auth.signOut();
          const loginUrl = new URL('/login', req.url);
          loginUrl.searchParams.set('error', 'access_denied');
          return NextResponse.redirect(loginUrl);
        }

        console.log('Regular user access granted for:', session.user.email);
      }

      // Handle property-specific path validation for regular users
      if (!isAdmin && isPropertyPath) {
        const resourceId = extractPropertyIdFromPath(pathname);
        if (resourceId) {
          // Check if this is a property path or item path
          const isPropertyRoute = pathname.includes('/properties/');
          
          if (isPropertyRoute) {
            // Direct property access - check ownership
            const { data: property, error: propertyError } = await supabase
              .from('properties')
              .select('user_id')
              .eq('id', resourceId)
              .single();

            if (propertyError || !property || property.user_id !== session.user.id) {
              console.log('Access denied - property not owned by user:', {
                userId: session.user.id,
                propertyId: resourceId,
                propertyError: propertyError?.message,
              });

              const loginUrl = new URL('/login', req.url);
              loginUrl.searchParams.set('error', 'property_access_denied');
              return NextResponse.redirect(loginUrl);
            }
          } else {
            // Item path - check if user owns the property that owns the item
            const { data: itemWithProperty, error: itemError } = await supabase
              .from('items')
              .select(`
                id,
                property_id,
                properties!inner (
                  user_id
                )
              `)
              .eq('public_id', resourceId)
              .single();

            if (itemError || !itemWithProperty || itemWithProperty.properties.user_id !== session.user.id) {
              console.log('Access denied - item not owned by user through property:', {
                userId: session.user.id,
                itemId: resourceId,
                itemError: itemError?.message,
              });

              const loginUrl = new URL('/login', req.url);
              loginUrl.searchParams.set('error', 'item_access_denied');
              return NextResponse.redirect(loginUrl);
            }
          }
        }
      }
    }

    // Handle auth paths (like login page)
    if (isAuthPath && session) {
      // User is already authenticated - redirect to appropriate dashboard
      if (!session.user.email) {
        return res; // Skip redirect if no email
      }

      // PREVENT REDIRECT LOOPS: If already redirecting, don't redirect again
      const existingRedirect = req.nextUrl.searchParams.get('redirect');
      if (existingRedirect) {
        console.log('Middleware: Redirect loop detected, allowing login page to handle');
        return res; // Let the login page handle the redirect logic
      }

      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', session.user.email)
        .single();

      if (!adminError && adminUser && adminUser.role === 'admin') {
        // Admin user trying to access login page - redirect to admin panel
        const redirectUrl = '/admin';
        console.log('Middleware: Redirecting authenticated admin to:', redirectUrl);
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      } else {
        // Check if user is a regular user
        const { data: regularUser, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!userError && regularUser) {
          // Regular user trying to access login page - redirect to admin panel (they have access too)
          const redirectUrl = '/admin';
          console.log('Middleware: Redirecting authenticated user to:', redirectUrl);
          return NextResponse.redirect(new URL(redirectUrl, req.url));
        }
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