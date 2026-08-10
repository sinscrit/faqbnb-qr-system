'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const LegacyDashboardShell = dynamic(() => import('./Dashboard2LayoutClient'));

/**
 * The exact P0 dashboard is provider-free. Nested transition routes retain the
 * legacy dashboard shell until each consumer receives its own canonical slice.
 */
export function Dashboard2ProviderBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/dashboard2') return children;
  return <LegacyDashboardShell>{children}</LegacyDashboardShell>;
}
