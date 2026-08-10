const CANONICAL_MIDDLEWARE_OWNED_ROUTES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/confirm',
  '/dashboard2',
  '/dashboard2/create',
]);

/**
 * These exact routes own authentication and recovery through their request-bound
 * APIs. They must not initialize the legacy middleware session/profile flow.
 * Nested dashboard routes remain on the legacy transition path until migrated.
 */
export function isCanonicalMiddlewareOwnedRoute(pathname: string): boolean {
  return CANONICAL_MIDDLEWARE_OWNED_ROUTES.has(pathname) || pathname.startsWith('/item/');
}
