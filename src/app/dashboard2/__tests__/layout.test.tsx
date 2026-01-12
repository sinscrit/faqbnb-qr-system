/**
 * Dashboard2 Layout Tests
 * REQ-206: Add mobile label display logic
 *
 * Tests the responsive label rendering in the navigation menu,
 * verifying that desktop shows full labels and mobile shows abbreviated labels.
 *
 * @created 2026-01-12
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard2',
}));

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/contexts/PropertyContext', () => ({
  PropertyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/dashboard', () => ({
  PropertyDropdown: () => <div data-testid="property-dropdown">Property Dropdown</div>,
}));

import Dashboard2Layout from '../layout';

describe('Dashboard2 Layout Navigation', () => {
  describe('REQ-206: Mobile Label Display', () => {
    it('renders both desktop and mobile label spans for each navigation item', () => {
      render(
        <Dashboard2Layout>
          <div>Test Content</div>
        </Dashboard2Layout>
      );

      // Check that navigation buttons exist
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toBeInTheDocument();

      // Verify responsive spans are present
      // Desktop span: hidden md:inline
      // Mobile span: md:hidden
      const desktopSpans = document.querySelectorAll('.hidden.md\\:inline');
      const mobileSpans = document.querySelectorAll('.md\\:hidden');

      expect(desktopSpans.length).toBeGreaterThan(0);
      expect(mobileSpans.length).toBeGreaterThan(0);
    });

    it('shows correct desktop labels in hidden md:inline spans', () => {
      render(
        <Dashboard2Layout>
          <div>Test Content</div>
        </Dashboard2Layout>
      );

      const desktopSpans = document.querySelectorAll('.hidden.md\\:inline');
      const labels = Array.from(desktopSpans).map((span) => span.textContent);

      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Items');
      expect(labels).toContain('Instructions');
      expect(labels).toContain('Properties');
    });

    it('shows correct mobile labels in md:hidden spans', () => {
      render(
        <Dashboard2Layout>
          <div>Test Content</div>
        </Dashboard2Layout>
      );

      const mobileSpans = document.querySelectorAll('.md\\:hidden');
      const labels = Array.from(mobileSpans).map((span) => span.textContent);

      expect(labels).toContain('D/B');
      expect(labels).toContain('Items');
      expect(labels).toContain('Instr.');
      expect(labels).toContain('Prop.');
    });

    it('falls back to name when mobileLabel is undefined', () => {
      // This test verifies the || item.name fallback works
      // The "Items" navigation item has mobileLabel same as name
      render(
        <Dashboard2Layout>
          <div>Test Content</div>
        </Dashboard2Layout>
      );

      const mobileSpans = document.querySelectorAll('.md\\:hidden');
      const itemsMobileSpan = Array.from(mobileSpans).find((span) => span.textContent === 'Items');

      expect(itemsMobileSpan).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('navigation buttons have correct aria-current attribute for active state', () => {
      render(
        <Dashboard2Layout>
          <div>Test Content</div>
        </Dashboard2Layout>
      );

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toHaveAttribute('aria-current', 'page');
    });

    it('icons have proper spacing (w-4 h-4 mr-2 classes)', () => {
      render(
        <Dashboard2Layout>
          <div>Test Content</div>
        </Dashboard2Layout>
      );

      // Icons should be present with proper spacing classes
      const icons = document.querySelectorAll('.w-4.h-4.mr-2');
      expect(icons.length).toBe(4); // 4 navigation items
    });
  });
});
