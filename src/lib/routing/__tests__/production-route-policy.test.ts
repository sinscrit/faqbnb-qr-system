import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  isProductionBlockedRoute,
  PRODUCTION_BLOCKED_EXACT_ROUTES,
  PRODUCTION_BLOCKED_ROUTE_PREFIXES,
} from '../production-route-policy';

const CANONICAL_PRODUCTION_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/confirm',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/recovery/request',
  '/api/auth/recovery/update',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/dashboard2',
  '/dashboard2/items',
  '/item/public-id',
  '/api/public/items/public-id',
  '/api/user/properties',
  '/api/system/health',
];

const DEVELOPMENT_ONLY_ROUTE_SEGMENTS = /(?:^|\/)(?:test(?:-|\/|$)|[^/]*(?:demo|example)[^/]*|simple-(?:admin|login|auth))(?:\/|$)/;

function isKnownDevelopmentOnlyRoute(route: string): boolean {
  return (
    DEVELOPMENT_ONLY_ROUTE_SEGMENTS.test(route) ||
    route === '/version' ||
    route === '/api/version'
  );
}

function collectRouteFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory()
      ? collectRouteFiles(fullPath)
      : /(?:page|route)\.(?:ts|tsx)$/.test(entry)
        ? [fullPath]
        : [];
  });
}

function appFileToRoute(file: string): string {
  const appRoot = path.join(process.cwd(), 'src', 'app');
  const relative = path.relative(appRoot, file).replaceAll(path.sep, '/');
  const withoutHandler = relative.replace(/\/(?:page|route)\.(?:ts|tsx)$/, '');
  return withoutHandler ? `/${withoutHandler}` : '/';
}

describe('production route policy', () => {
  it('blocks every declared development-only surface in production', () => {
    for (const route of PRODUCTION_BLOCKED_EXACT_ROUTES) {
      expect(isProductionBlockedRoute(route, 'production')).toBe(true);
    }

    for (const prefix of PRODUCTION_BLOCKED_ROUTE_PREFIXES) {
      expect(isProductionBlockedRoute(prefix, 'production')).toBe(true);
      expect(isProductionBlockedRoute(`${prefix}/nested`, 'production')).toBe(true);
    }
  });

  it('keeps the prototype sources reachable in development', () => {
    for (const route of [
      ...PRODUCTION_BLOCKED_EXACT_ROUTES,
      ...PRODUCTION_BLOCKED_ROUTE_PREFIXES,
    ]) {
      expect(isProductionBlockedRoute(route, 'development')).toBe(false);
      expect(isProductionBlockedRoute(route, 'test')).toBe(false);
    }
  });

  it('does not gate canonical product routes or similar route names', () => {
    for (const route of [
      ...CANONICAL_PRODUCTION_ROUTES,
      '/testing',
      '/testimonials',
      '/api/simple-authentication',
    ]) {
      expect(isProductionBlockedRoute(route, 'production')).toBe(false);
    }
  });

  it('covers every active route whose name marks it as a test, demo, example, or simple duplicate', () => {
    const appRoot = path.join(process.cwd(), 'src', 'app');
    const developmentOnlyRoutes = collectRouteFiles(appRoot)
      .map(appFileToRoute)
      .filter(isKnownDevelopmentOnlyRoute);

    expect(developmentOnlyRoutes.length).toBeGreaterThan(0);
    for (const route of developmentOnlyRoutes) {
      expect(
        isProductionBlockedRoute(route, 'production'),
        `${route} must be covered by the production route policy`
      ).toBe(true);
    }
  });

  it('keeps every blocked route inside the statically analyzable middleware matcher', () => {
    const middlewareSource = readFileSync(
      path.join(process.cwd(), 'src', 'middleware.ts'),
      'utf8'
    );

    for (const route of PRODUCTION_BLOCKED_EXACT_ROUTES) {
      expect(middlewareSource).toContain(`'${route}'`);
    }

    for (const prefix of PRODUCTION_BLOCKED_ROUTE_PREFIXES) {
      expect(middlewareSource).toContain(`'${prefix}/:path*'`);
    }
  });
});
