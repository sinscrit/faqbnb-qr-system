/**
 * Instructions Page Unit Tests
 *
 * Tests for the Instructions page placeholder component.
 * Verifies authentication, authorization, loading states, and accessibility.
 *
 * @module tests/dashboard/instructions
 * @see REQ-195 - Create Instructions Page (Placeholder)
 * @created 2026-01-12
 * @modified 2026-01-12
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstructionsPage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock usePermissions hook
const mockUsePermissions = vi.fn();
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}));

describe('InstructionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: false, loading: true, error: null }),
        isLoading: true,
      });

      render(<InstructionsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows loading spinner while permissions are loading', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: false, loading: true, error: null }),
        isLoading: true,
      });

      render(<InstructionsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('shows login prompt when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: false, loading: false, error: null }),
        isLoading: false,
      });

      render(<InstructionsPage />);
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('Please log in to access guides.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to Login' })).toBeInTheDocument();
    });
  });

  describe('Authorization', () => {
    it('shows access denied when user lacks view_items permission', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: false, loading: false, error: null }),
        isLoading: false,
      });

      render(<InstructionsPage />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('You do not have permission to view guides.')).toBeInTheDocument();
    });

    it('shows access denied link to dashboard', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: false, loading: false, error: null }),
        isLoading: false,
      });

      render(<InstructionsPage />);
      const dashboardLink = screen.getByRole('link', { name: 'Back to Dashboard' });
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Authorized View', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: true, loading: false, error: null }),
        isLoading: false,
      });
    });

    it('shows placeholder content when authorized', () => {
      render(<InstructionsPage />);
      expect(screen.getByText('Guides')).toBeInTheDocument();
      expect(screen.getByText('Guides Coming Soon')).toBeInTheDocument();
    });

    it('shows page description', () => {
      render(<InstructionsPage />);
      expect(screen.getByText('View and manage guides for your items')).toBeInTheDocument();
    });

    it('shows placeholder message with guidance', () => {
      render(<InstructionsPage />);
      expect(screen.getByText(/This page will display all guides and articles/)).toBeInTheDocument();
      expect(screen.getByText(/For now, you can manage guides through the Items page/)).toBeInTheDocument();
    });

    it('has correct navigation links', () => {
      render(<InstructionsPage />);

      const dashboardLink = screen.getByLabelText('Return to dashboard');
      const itemsLink = screen.getByLabelText('Navigate to items management');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(itemsLink).toHaveAttribute('href', '/dashboard/items');
    });

    it('has Go to Items button', () => {
      render(<InstructionsPage />);
      const goToItemsButton = screen.getByRole('link', { name: 'Go to Items' });
      expect(goToItemsButton).toHaveAttribute('href', '/dashboard/items');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: true, loading: false, error: null }),
        isLoading: false,
      });
    });

    it('has proper ARIA attributes on main container', () => {
      render(<InstructionsPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby', 'instructions-title');
    });

    it('has title with correct id for aria-labelledby', () => {
      render(<InstructionsPage />);

      const title = screen.getByText('Guides');
      expect(title).toHaveAttribute('id', 'instructions-title');
    });

    it('has aria-labels on navigation links', () => {
      render(<InstructionsPage />);

      expect(screen.getByLabelText('Return to dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Navigate to items management')).toBeInTheDocument();
    });

    it('has aria-hidden on decorative icons', () => {
      render(<InstructionsPage />);

      // The FileText icons should have aria-hidden
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null,
      });

      mockUsePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: true, loading: false, error: null }),
        isLoading: false,
      });
    });

    it('renders header with responsive flex classes', () => {
      render(<InstructionsPage />);

      // The header container should have responsive classes
      const headerContainer = screen.getByRole('main').querySelector('.flex.flex-col');
      expect(headerContainer).toBeInTheDocument();
    });
  });
});
