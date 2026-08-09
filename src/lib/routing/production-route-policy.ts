/**
 * Development-only product surfaces that must not be reachable in production.
 *
 * Keep route source available for local component and workflow prototyping, but
 * do not expose duplicate sign-in, dashboard, demo, test, or error-triggering
 * paths to real users. Prefix matching is boundary-aware: `/test` blocks
 * `/test/foo`, but does not block `/testing`.
 */
export const PRODUCTION_BLOCKED_ROUTE_PREFIXES = [
  '/test',
  '/api/simple-auth',
] as const;

export const PRODUCTION_BLOCKED_EXACT_ROUTES = [
  '/test-file-upload',
  '/simple-admin',
  '/simple-login',
  '/qr-demo',
  '/sentry-example-page',
  '/version',
  '/api/sentry-example-api',
  '/api/version',
] as const;

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProductionBlockedRoute(
  pathname: string,
  environment: string | undefined = process.env.NODE_ENV
): boolean {
  if (environment !== 'production') {
    return false;
  }

  return (
    PRODUCTION_BLOCKED_EXACT_ROUTES.some((route) => pathname === route) ||
    PRODUCTION_BLOCKED_ROUTE_PREFIXES.some((prefix) =>
      matchesRoutePrefix(pathname, prefix)
    )
  );
}
