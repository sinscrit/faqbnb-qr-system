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
    '/dashboard2/create',
    '/item/5abcdef0-0000-4000-8000-000000000001',
  ])('bypasses the legacy session flow for exact route %s', (pathname) => {
    expect(isCanonicalMiddlewareOwnedRoute(pathname)).toBe(true);
  });

  it.each([
    '/dashboard2/',
    '/dashboard2/items',
    '/items/5abcdef0-0000-4000-8000-000000000001',
    '/login/legacy',
    '/auth/oauth/callback',
  ])('keeps noncanonical or nested route %s on its existing path', (pathname) => {
    expect(isCanonicalMiddlewareOwnedRoute(pathname)).toBe(false);
  });
});
