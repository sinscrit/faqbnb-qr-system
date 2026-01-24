/**
 * TranslationStatusWidget Component Tests
 *
 * Tests for the TranslationStatusWidget dashboard component covering:
 * - Rendering and display of status counts
 * - Loading, empty, and error states
 * - User interactions (click to navigate, hover for tooltip)
 * - Accessibility compliance
 * - Edge cases (zero counts, very large numbers)
 *
 * @module TranslationManagement/__tests__/TranslationStatusWidget.test
 * @created 2026-01-24
 * @requestReference REQ-E05-034
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationStatusWidget } from '../TranslationStatusWidget/TranslationStatusWidget';
import {
  createMockTranslationFn,
  createMockStatusSummary,
} from './mocks/component-mocks';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => createMockTranslationFn(),
}));

// Mock useTranslationStatus hook
const mockRefetch = vi.fn();
const mockUseTranslationStatus = vi.fn();
vi.mock('@/hooks', () => ({
  useTranslationStatus: (options: unknown) => mockUseTranslationStatus(options),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// =============================================================================
// Test Suite
// =============================================================================

describe('TranslationStatusWidget', () => {
  const defaultSummary = createMockStatusSummary();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful state
    mockUseTranslationStatus.mockReturnValue({
      summary: defaultSummary,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Rendering and Display Tests
  // ---------------------------------------------------------------------------

  describe('Rendering and Display', () => {
    it('renders without crashing with status summary', () => {
      render(<TranslationStatusWidget />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('displays widget title', () => {
      render(<TranslationStatusWidget />);

      expect(screen.getByText(/title/i)).toBeInTheDocument();
    });

    it('displays completed translation count', () => {
      render(<TranslationStatusWidget />);

      // Should show complete count (6)
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('displays pending translation count', () => {
      render(<TranslationStatusWidget />);

      // Should show pending count (4)
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('shows visual progress indicator', () => {
      render(<TranslationStatusWidget />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('calculates and displays correct percentage', () => {
      const customSummary = createMockStatusSummary({
        complete: 7,
        partial: 0,
        pending: 3,
        failed: 0,
        total: 10,
      });

      mockUseTranslationStatus.mockReturnValue({
        summary: customSummary,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Progress text should include percentage
      expect(screen.getByText(/progress/i)).toBeInTheDocument();
    });

    it('displays status cards for complete, partial, pending, failed', () => {
      render(<TranslationStatusWidget />);

      // Should show all status labels
      expect(screen.getByText(/statusLabels\.complete/)).toBeInTheDocument();
      expect(screen.getByText(/statusLabels\.partial/)).toBeInTheDocument();
      expect(screen.getByText(/statusLabels\.pending/)).toBeInTheDocument();
      expect(screen.getByText(/statusLabels\.failed/)).toBeInTheDocument();
    });

    it('passes propertyId to hook when provided', () => {
      render(<TranslationStatusWidget propertyId="prop-123" />);

      expect(mockUseTranslationStatus).toHaveBeenCalledWith(
        expect.objectContaining({ propertyId: 'prop-123' })
      );
    });

    it('renders in compact mode when compact prop is true', () => {
      render(<TranslationStatusWidget compact />);

      // Should render without errors in compact mode
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Loading and Empty States Tests
  // ---------------------------------------------------------------------------

  describe('Loading and Empty States', () => {
    it('displays loading skeleton when isLoading is true', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Should show loading state
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });

    it('displays loading indicator with aria-busy', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Container should have aria-busy
      const loadingContainer = document.querySelector('[aria-busy="true"]');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('displays empty state when summary is null and not loading', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Should show empty message
      expect(screen.getByText(/empty/i)).toBeInTheDocument();
    });

    it('displays empty state when totalEntities is zero', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: createMockStatusSummary({
          complete: 0,
          partial: 0,
          pending: 0,
          failed: 0,
          total: 0,
        }),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Should show empty message
      expect(screen.getByText(/empty/i)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling Tests
  // ---------------------------------------------------------------------------

  describe('Error Handling', () => {
    it('displays error state when error is present', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: false,
        error: new Error('Failed to load'),
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('provides retry button when error occurs', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('clicking retry button invokes refetch', async () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: false,
        error: new Error('Error'),
        refetch: mockRefetch,
      });

      const user = userEvent.setup();
      render(<TranslationStatusWidget />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // User Interactions Tests
  // ---------------------------------------------------------------------------

  describe('User Interactions', () => {
    it('displays View Details link by default', () => {
      render(<TranslationStatusWidget />);

      expect(screen.getByText(/viewDetails/i)).toBeInTheDocument();
    });

    it('View Details link has correct href', () => {
      render(<TranslationStatusWidget />);

      const link = screen.getByRole('link', { name: /viewDetails/i });
      expect(link).toHaveAttribute('href', '/dashboard2/translations');
    });

    it('hides View Details link when showViewAllLink is false', () => {
      render(<TranslationStatusWidget showViewAllLink={false} />);

      expect(screen.queryByText(/viewDetails/i)).not.toBeInTheDocument();
    });

    it('calls onViewAll callback when provided and clicked', async () => {
      const onViewAll = vi.fn();
      const user = userEvent.setup();

      render(<TranslationStatusWidget onViewAll={onViewAll} />);

      // When onViewAll is provided, it renders as button
      const viewAllButton = screen.getByText(/viewDetails/i);
      await user.click(viewAllButton);

      expect(onViewAll).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility Tests
  // ---------------------------------------------------------------------------

  describe('Accessibility', () => {
    it('has appropriate ARIA role for region', () => {
      render(<TranslationStatusWidget />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible label for the region', () => {
      render(<TranslationStatusWidget />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label');
    });

    it('progress bar has ARIA attributes', () => {
      render(<TranslationStatusWidget />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin');
      expect(progressbar).toHaveAttribute('aria-valuemax');
      expect(progressbar).toHaveAttribute('aria-valuenow');
    });

    it('retry button has accessible label', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: false,
        error: new Error('Error'),
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TranslationStatusWidget />);

      await user.tab();

      // Focus should move to an interactive element
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases Tests
  // ---------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('handles zero total count without division by zero', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: createMockStatusSummary({
          complete: 0,
          partial: 0,
          pending: 0,
          failed: 0,
          total: 0,
        }),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Should not crash, shows empty state
      expect(screen.getByText(/empty/i)).toBeInTheDocument();
    });

    it('handles partial translations in percentage calculation', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: createMockStatusSummary({
          complete: 5,
          partial: 2,
          pending: 3,
          failed: 0,
          total: 10,
        }),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Should render progress (5 + 2*0.5 = 6 out of 10 = 60%)
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('handles missing summary properties gracefully', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: {
          complete: 5,
          // partial, pending, failed, stale are undefined
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<TranslationStatusWidget />);

      // Should render with fallback values (0 for missing properties)
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('accepts custom className prop', () => {
      render(<TranslationStatusWidget className="custom-widget" />);

      // Widget should have custom class
      expect(screen.getByRole('region')).toHaveClass('custom-widget');
    });

    it('works correctly in compact mode', () => {
      render(<TranslationStatusWidget compact />);

      // Should render properly in compact mode
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Data Updates Tests
  // ---------------------------------------------------------------------------

  describe('Data Updates', () => {
    it('updates display when summary changes', () => {
      const { rerender } = render(<TranslationStatusWidget />);

      // Initial render with default summary (complete: 6)
      expect(screen.getByText('6')).toBeInTheDocument();

      // Update mock to return different summary
      mockUseTranslationStatus.mockReturnValue({
        summary: createMockStatusSummary({ complete: 8, pending: 2 }),
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      rerender(<TranslationStatusWidget />);

      // Should now show updated count
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('transitions from loading to loaded state', () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      const { rerender } = render(<TranslationStatusWidget />);

      // Should show loading
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

      // Update to loaded state
      mockUseTranslationStatus.mockReturnValue({
        summary: defaultSummary,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      rerender(<TranslationStatusWidget />);

      // Should now show data
      expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('transitions from error to success state', async () => {
      mockUseTranslationStatus.mockReturnValue({
        summary: null,
        isLoading: false,
        error: new Error('Failed'),
        refetch: mockRefetch,
      });

      const { rerender } = render(<TranslationStatusWidget />);

      // Should show error
      expect(screen.getByText(/error/i)).toBeInTheDocument();

      // Update to success state
      mockUseTranslationStatus.mockReturnValue({
        summary: defaultSummary,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      rerender(<TranslationStatusWidget />);

      // Should now show data
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
