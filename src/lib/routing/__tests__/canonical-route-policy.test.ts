import { describe, expect, it } from 'vitest';
import { isCanonicalMiddlewareOwnedRoute } from '@/lib/routing/canonical-route-policy';

describe('canonical middleware-owned route policy', () => {
  it.each([
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/confirm',
    '/dashboard2',
  ])('bypasses the legacy session flow for exact route %s', (pathname) => {
    expect(isCanonicalMiddlewareOwnedRoute(pathname)).toBe(true);
  });

  it.each([
    '/dashboard2/',
    '/dashboard2/create',
    '/dashboard2/items',
    '/login/legacy',
    '/auth/oauth/callback',
  ])('keeps noncanonical or nested route %s on its existing path', (pathname) => {
    expect(isCanonicalMiddlewareOwnedRoute(pathname)).toBe(false);
  });
});
