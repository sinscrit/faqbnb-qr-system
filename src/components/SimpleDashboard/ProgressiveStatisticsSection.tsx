// src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx
// REQ-136: Progressive Statistics Section Wrapper
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardTier, DashboardTierOverrides } from '@/hooks/useDashboardTier';
import { StatisticsCards } from './StatisticsCards';
import { PortfolioSummary } from './PortfolioSummary';

/**
 * Props for ProgressiveStatisticsSection component
 */
export interface ProgressiveStatisticsSectionProps {
  /** Statistics data from useDashboardStats hook */
  stats: DashboardStats | null;
  /** Loading state - shows skeleton when true */
  isLoading: boolean;
  /** Optional error message */
  error?: string | null;
  /** Optional tier overrides for user preferences */
  overrides?: DashboardTierOverrides;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Progressive Statistics Section wrapper component
 * Adapts statistics display based on tier
 *
 * Features:
 * - Uses useDashboardTier hook to determine tier
 * - Single tier: Basic stats, no property context label
 * - Few tier: Current behavior with property filter
 * - Multiple tier: Add comparison hint text (future enhancement)
 * - Many tier: Shows PortfolioSummary above StatisticsCards
 *
 * @param stats - Statistics data from useDashboardStats hook
 * @param isLoading - Loading state
 * @param error - Optional error message
 * @param overrides - Optional tier overrides for user preferences
 * @param className - Optional additional CSS classes
 */
export function ProgressiveStatisticsSection({
  stats,
  isLoading,
  error,
  overrides,
  className = '',
}: ProgressiveStatisticsSectionProps) {
  const { userProperties } = useAuth();
  const propertyCount = userProperties?.length ?? 0;

  // Get tier configuration based on property count (with optional overrides)
  const tierConfig = useDashboardTier(propertyCount, overrides);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* REQ-136: Portfolio Summary - only show for 'many' tier (16+ properties) or when forced */}
      {tierConfig.showPortfolioAnalytics && (
        <PortfolioSummary
          stats={stats}
          propertyCount={propertyCount}
          isLoading={isLoading}
        />
      )}

      {/* REQ-136: Comparison hint for multiple tier */}
      {tierConfig.tier === 'multiple' && !isLoading && (
        <p className="text-sm text-[#717171]">
          Use the property selector to compare statistics across your properties.
        </p>
      )}

      {/* Statistics Cards with tier-aware rendering */}
      <StatisticsCards
        stats={stats}
        isLoading={isLoading}
        error={error}
        tier={tierConfig.tier}
      />
    </div>
  );
}

export default ProgressiveStatisticsSection;
