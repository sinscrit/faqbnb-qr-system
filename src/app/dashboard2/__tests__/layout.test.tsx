import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ pathname: '/dashboard2' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));
vi.mock('next/dynamic', () => ({
  default: () => ({ children }: { children: React.ReactNode }) => (
    <div data-testid="legacy-dashboard-shell">{children}</div>
  ),
}));
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

import Dashboard2Layout from '@/app/dashboard2/layout';

describe('dashboard provider boundary', () => {
  beforeEach(() => { navigation.pathname = '/dashboard2'; });

  it('keeps the exact canonical dashboard outside Dashboard2LayoutClient', () => {
    render(<Dashboard2Layout><p>canonical home</p></Dashboard2Layout>);
    expect(screen.getByText('canonical home')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-dashboard-shell')).not.toBeInTheDocument();
  });

  it.each(['/dashboard2/create', '/dashboard2/items', '/dashboard2/properties']) (
    'retains the dynamically separated legacy shell for nested route %s',
    (pathname) => {
      navigation.pathname = pathname;
      render(<Dashboard2Layout><p>legacy child</p></Dashboard2Layout>);
      expect(screen.getByTestId('legacy-dashboard-shell')).toContainElement(screen.getByText('legacy child'));
    }
  );
});
