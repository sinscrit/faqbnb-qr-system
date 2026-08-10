'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const LegacyApplicationProviders = dynamic(
  () => import('@/components/LegacyApplicationProviders').then(
    (module) => module.LegacyApplicationProviders
  )
);

const PROVIDER_FREE_AUTH_PAGES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/dashboard2',
  '/dashboard2/create',
]);

/**
 * Canonical auth pages use only their request-bound server-cookie APIs. The
 * legacy application providers remain available elsewhere until later surface
 * consolidation, but must not initialize AuthContext/localStorage/debug state
 * around login, registration, recovery, or the exact canonical dashboard.
 * Nested dashboard transition routes still retain the legacy provider stack.
 */
export function AuthPageProviderBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (PROVIDER_FREE_AUTH_PAGES.has(pathname) || pathname.startsWith('/item/')) return children;

  return <LegacyApplicationProviders>{children}</LegacyApplicationProviders>;
}
