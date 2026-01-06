// src/components/SimpleDashboard/StatisticsCards.tsx
// REQ-124: Dashboard Statistics Cards Display Component
// REQ-134: Added property context label display
// REQ-136: Added tier-aware props for progressive UI
// REQ-137: Added empty state handling for new users
// Created: 2026-01-06 17:00:00 UTC
// Last Modified: 2026-01-06

'use client';

import { Package, Home, Tag, LucideIcon } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';
import { DashboardTier } from '@/hooks/useDashboardTier';
import { EmptyStateCard } from './EmptyStateCard';

/**
 * Props for the main StatisticsCards component
 */
export interface StatisticsCardsProps {
  /** Statistics data from useDashboardStats hook */
  stats: DashboardStats | null;
  /** Loading state - shows skeleton when true */
  isLoading: boolean;
  /** Optional error message */
  error?: string | null;
  /** REQ-136: Optional tier for tier-aware display */
  tier?: DashboardTier;
  /** REQ-136: Optional flag to show comparison view */
  showComparisonView?: boolean;
  /** REQ-136: Optional flag to show trend indicators */
  showTrendIndicators?: boolean;
  /** REQ-137: Callback for empty state CTA */
  onCreateItem?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * REQ-134: Keys for numeric stats (excludes propertyContext)
 */
type NumericStatKey = 'itemCount' | 'roomCount' | 'tagCount';

/**
 * Configuration for individual stat card
 */
interface StatCardConfig {
  /** Key matching DashboardStats numeric property */
  key: NumericStatKey;
  /** Display label below the number */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Tailwind class for icon color */
  iconColor: string;
  /** Tailwind class for icon background */
  iconBgColor: string;
}

/**
 * Props for individual StatCard sub-component
 */
interface StatCardProps {
  /** Card configuration */
  config: StatCardConfig;
  /** Numeric value to display */
  value: number;
}

/**
 * Individual statistics card component
 * Displays icon, large number, and label
 */
function StatCard({ config, value }: StatCardProps) {
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      {/* Icon Container */}
      <div className={`p-3 rounded-xl ${config.iconBgColor}`}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
      </div>

      {/* Value and Label */}
      <div>
        <p className="text-[32px] font-bold text-[#222222] leading-tight">
          {value}
        </p>
        <p className="text-sm text-[#717171]">
          {config.label}
        </p>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for statistics cards
 * Shows shimmer animation while data is loading
 */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 animate-pulse"
        >
          {/* Icon skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />

          {/* Content skeleton */}
          <div className="flex-1">
            <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard statistics cards displaying Items, Rooms, and Tags counts
 *
 * Features:
 * - Three cards in horizontal row (responsive to 1 column on mobile)
 * - Loading skeleton with shimmer animation
 * - Airbnb Design Language System styling
 * - Zero values displayed as "0"
 * - REQ-136: Tier-aware rendering (property context hidden for single tier)
 * - REQ-137: Empty state shown when all stats are zero
 *
 * @param stats - Statistics data from useDashboardStats hook
 * @param isLoading - Shows loading skeleton when true
 * @param error - Optional error message (currently unused, for future expansion)
 * @param tier - Optional dashboard tier for tier-aware display
 * @param showComparisonView - Show comparison mode (future enhancement)
 * @param showTrendIndicators - Show trend indicators (future enhancement)
 * @param onCreateItem - Callback for empty state CTA
 * @param className - Optional additional CSS classes
 */
export function StatisticsCards({
  stats,
  isLoading,
  error,
  tier,
  showComparisonView,
  showTrendIndicators,
  onCreateItem,
  className = ''
}: StatisticsCardsProps) {
  // Card configuration with Airbnb DLS colors
  const cardConfigs: StatCardConfig[] = [
    {
      key: 'itemCount',
      label: 'Items',
      icon: Package,
      iconColor: 'text-[#FF385C]',
      iconBgColor: 'bg-[#FFEEEF]'
    },
    {
      key: 'roomCount',
      label: 'Rooms',
      icon: Home,
      iconColor: 'text-[#00A699]',
      iconBgColor: 'bg-[#E6F7F6]'
    },
    {
      key: 'tagCount',
      label: 'Tags',
      icon: Tag,
      iconColor: 'text-[#484848]',
      iconBgColor: 'bg-gray-100'
    }
  ];

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // REQ-137: Check if all stats are zero (new user / empty state)
  const isEmptyState = stats &&
    stats.itemCount === 0 &&
    stats.roomCount === 0 &&
    stats.tagCount === 0;

  // REQ-137: Show empty state with CTA when all counts are zero
  if (isEmptyState && onCreateItem) {
    return (
      <div className={`bg-white rounded-xl shadow-sm ${className}`}>
        <EmptyStateCard
          icon={Package}
          title="Start tracking your items"
          description="Once you create items, you'll see helpful stats about how guests use your QR codes."
          actionLabel="Create Item"
          onAction={onCreateItem}
          variant="default"
        />
      </div>
    );
  }

  // REQ-136: Determine if property context should be shown
  // Hide for single tier, show for multi-property users
  const showPropertyContext = tier !== 'single' &&
    stats?.propertyContext &&
    stats.propertyContext.totalProperties > 1;

  return (
    <div className={className}>
      {/* REQ-134: Property context label - only show for multi-property users */}
      {/* REQ-136: Hidden for single tier */}
      {showPropertyContext && stats?.propertyContext && (
        <div className="mb-3 text-sm text-[#717171] flex items-center gap-1">
          {stats.propertyContext.isFiltered ? (
            <span className="font-medium text-[#222222]">
              {stats.propertyContext.propertyName}
            </span>
          ) : (
            <span>(all properties)</span>
          )}
        </div>
      )}

      {/* Statistics cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cardConfigs.map((config) => (
          <StatCard
            key={config.key}
            config={config}
            value={stats?.[config.key] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
