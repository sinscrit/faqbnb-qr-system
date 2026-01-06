/**
 * Empty States Integration Tests
 *
 * Integration tests to verify empty state transitions and CTA
 * navigation across the dashboard components.
 *
 * REQ-137: Empty State Guidance with Contextual CTAs
 *
 * @module SimpleDashboard/__tests__/EmptyStates.integration.test
 * @lastModified 2026-01-06
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import { StatisticsCards } from '../StatisticsCards';
import { PropertySection } from '../PropertySection';
import { ProgressiveStatisticsSection } from '../ProgressiveStatisticsSection';
import { DashboardStats } from '@/hooks/useDashboardStats';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock useDashboardTier hook
vi.mock('@/hooks/useDashboardTier', () => ({
  useDashboardTier: vi.fn().mockReturnValue({
    tier: 'single',
    showPropertySelector: false,
    showAdvancedTools: false,
    showPortfolioAnalytics: false,
  }),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('Empty State Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // StatisticsCards Empty State Tests
  // ===========================================================================

  describe('StatisticsCards Empty State', () => {
    it('shows empty state when all counts are zero', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      const mockOnCreateItem = vi.fn();

      render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
          onCreateItem={mockOnCreateItem}
        />
      );

      expect(screen.getByText('Start tracking your items')).toBeInTheDocument();
      expect(screen.getByText(/Once you create items/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Item' })).toBeInTheDocument();
    });

    it('shows normal cards when any count > 0', () => {
      const statsWithItems: DashboardStats = {
        itemCount: 5,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      render(
        <StatisticsCards
          stats={statsWithItems}
          isLoading={false}
        />
      );

      // Should show the normal statistics cards, not empty state
      expect(screen.queryByText('Start tracking your items')).not.toBeInTheDocument();
      expect(screen.getByText('Items')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('clicking CTA triggers onCreateItem callback', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      const mockOnCreateItem = vi.fn();

      render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
          onCreateItem={mockOnCreateItem}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));
      expect(mockOnCreateItem).toHaveBeenCalledTimes(1);
    });

    it('shows loading skeleton when isLoading is true', () => {
      render(
        <StatisticsCards
          stats={null}
          isLoading={true}
        />
      );

      // Should show skeleton, not empty state
      expect(screen.queryByText('Start tracking your items')).not.toBeInTheDocument();
      // Check for skeleton elements (animate-pulse class)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not show empty state CTA when onCreateItem not provided', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
        />
      );

      // Without onCreateItem, should show normal cards with zeros
      expect(screen.queryByText('Start tracking your items')).not.toBeInTheDocument();
      // Multiple 0s exist (one for each card), use getAllByText
      expect(screen.getAllByText('0').length).toBe(3);
    });
  });

  // ===========================================================================
  // PropertySection Empty State Tests
  // ===========================================================================

  describe('PropertySection Empty State', () => {
    it('shows empty state when no properties', () => {
      (useAuth as Mock).mockReturnValue({
        userProperties: [],
        loading: false,
      });

      render(
        <PropertySection onAddProperty={vi.fn()} />
      );

      expect(screen.getByText("Let's add your property")).toBeInTheDocument();
      expect(screen.getByText(/A property is where your items live/)).toBeInTheDocument();
    });

    it('clicking CTA triggers onAddProperty callback', () => {
      (useAuth as Mock).mockReturnValue({
        userProperties: [],
        loading: false,
      });

      const mockOnAddProperty = vi.fn();

      render(
        <PropertySection onAddProperty={mockOnAddProperty} />
      );

      // Click the CTA button in empty state
      const ctaButton = screen.getByRole('button', { name: 'Add Property' });
      fireEvent.click(ctaButton);
      expect(mockOnAddProperty).toHaveBeenCalledTimes(1);
    });

    it('shows properties when they exist', () => {
      (useAuth as Mock).mockReturnValue({
        userProperties: [
          { id: '1', nickname: 'Beach House', user_id: 'user1' },
        ],
        loading: false,
      });

      render(
        <PropertySection onAddProperty={vi.fn()} />
      );

      expect(screen.queryByText("Let's add your property")).not.toBeInTheDocument();
      expect(screen.getByText('Beach House')).toBeInTheDocument();
    });

    it('shows loading skeleton when loading', () => {
      (useAuth as Mock).mockReturnValue({
        userProperties: null,
        loading: true,
      });

      render(
        <PropertySection onAddProperty={vi.fn()} />
      );

      // Should show skeleton
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(screen.queryByText("Let's add your property")).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // ProgressiveStatisticsSection Empty State Tests
  // ===========================================================================

  describe('ProgressiveStatisticsSection Empty State', () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({
        userProperties: [{ id: '1', nickname: 'Test Property' }],
        loading: false,
      });
    });

    it('passes onCreateItem to StatisticsCards', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      const mockOnCreateItem = vi.fn();

      render(
        <ProgressiveStatisticsSection
          stats={emptyStats}
          isLoading={false}
          onCreateItem={mockOnCreateItem}
        />
      );

      // The empty state should be shown from StatisticsCards
      expect(screen.getByText('Start tracking your items')).toBeInTheDocument();

      // Click the CTA
      fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));
      expect(mockOnCreateItem).toHaveBeenCalledTimes(1);
    });

    it('shows normal statistics when items exist', () => {
      const statsWithData: DashboardStats = {
        itemCount: 10,
        roomCount: 3,
        tagCount: 5,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      render(
        <ProgressiveStatisticsSection
          stats={statsWithData}
          isLoading={false}
          onCreateItem={vi.fn()}
        />
      );

      expect(screen.queryByText('Start tracking your items')).not.toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // State Transitions Tests
  // ===========================================================================

  describe('State Transitions', () => {
    it('StatisticsCards transitions from empty to normal view', async () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      const populatedStats: DashboardStats = {
        itemCount: 1,
        roomCount: 1,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      const mockOnCreateItem = vi.fn();

      const { rerender } = render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
          onCreateItem={mockOnCreateItem}
        />
      );

      // Initially shows empty state
      expect(screen.getByText('Start tracking your items')).toBeInTheDocument();

      // Rerender with populated stats
      rerender(
        <StatisticsCards
          stats={populatedStats}
          isLoading={false}
          onCreateItem={mockOnCreateItem}
        />
      );

      // Now shows normal cards
      expect(screen.queryByText('Start tracking your items')).not.toBeInTheDocument();
      expect(screen.getByText('Items')).toBeInTheDocument();
      // Multiple 1s exist (for itemCount and roomCount), use getAllByText
      expect(screen.getAllByText('1').length).toBe(2);
    });

    it('PropertySection transitions from empty to populated', async () => {
      // Mock empty properties initially
      (useAuth as Mock).mockReturnValue({
        userProperties: [],
        loading: false,
      });

      const { rerender } = render(
        <PropertySection onAddProperty={vi.fn()} />
      );

      expect(screen.getByText("Let's add your property")).toBeInTheDocument();

      // Mock with properties
      (useAuth as Mock).mockReturnValue({
        userProperties: [
          { id: '1', nickname: 'Test Vacation Home', user_id: 'user1' },
        ],
        loading: false,
      });

      rerender(<PropertySection onAddProperty={vi.fn()} />);

      expect(screen.queryByText("Let's add your property")).not.toBeInTheDocument();
      // Use more specific query to avoid issues with multiple elements
      expect(screen.getByRole('button', { name: /Edit property: Test Vacation Home/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('empty state has role="status"', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
          onCreateItem={vi.fn()}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('CTA button is focusable', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
          onCreateItem={vi.fn()}
        />
      );

      const button = screen.getByRole('button', { name: 'Create Item' });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  // ===========================================================================
  // Visual Distinction Tests
  // ===========================================================================

  describe('Visual Distinction', () => {
    it('empty state uses neutral icon color not error color', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
          onCreateItem={vi.fn()}
        />
      );

      // Check that the icon uses neutral gray color, not red (error)
      const hiddenIcon = document.querySelector('[aria-hidden="true"]');
      expect(hiddenIcon).toHaveClass('text-[#717171]');
    });

    it('empty state uses gradient CTA button', () => {
      const emptyStats: DashboardStats = {
        itemCount: 0,
        roomCount: 0,
        tagCount: 0,
        propertyContext: {
          isFiltered: false,
          totalProperties: 1,
        },
      };

      render(
        <StatisticsCards
          stats={emptyStats}
          isLoading={false}
          onCreateItem={vi.fn()}
        />
      );

      const button = screen.getByRole('button', { name: 'Create Item' });
      expect(button).toHaveClass('bg-gradient-to-r');
    });
  });
});
