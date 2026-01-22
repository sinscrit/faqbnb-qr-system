// src/components/SimpleDashboard/PortfolioSummary.tsx
// REQ-136: Portfolio Summary Component for Dashboard
// Created: 2026-01-06
// Last Modified: 2026-01-22 08:00:00 UTC - REQ-E02-052: Internationalized all UI strings

'use client';

import { useTranslations } from 'next-intl';
import { Building2, TrendingUp, Activity } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';
import { SkeletonBase } from './skeletons';

/**
 * Props for PortfolioSummary component
 */
export interface PortfolioSummaryProps {
  /** Statistics data from useDashboardStats hook */
  stats: DashboardStats | null;
  /** Number of properties in the portfolio */
  propertyCount: number;
  /** Loading state - shows skeleton when true */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Loading skeleton for PortfolioSummary
 * REQ-138: Wrapped with SkeletonBase for accessibility
 */
function LoadingSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <SkeletonBase label={loadingLabel}>
      <div className="bg-gradient-to-r from-[#E61E4D] to-[#D70466] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg" />
          <div className="h-6 w-48 bg-white/20 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 rounded-lg p-4">
              <div className="h-8 w-20 bg-white/20 rounded mb-2" />
              <div className="h-4 w-24 bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonBase>
  );
}

/**
 * Individual summary stat component
 */
interface SummaryStatProps {
  /** Stat value */
  value: string | number;
  /** Stat label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
}

function SummaryStat({ value, label, icon }: SummaryStatProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-transform duration-200 hover:scale-[1.02]">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="opacity-80">{icon}</span>}
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-sm text-white/80">{label}</p>
    </div>
  );
}

/**
 * Portfolio-level summary cards for 'many' tier users (16+ properties)
 *
 * Features:
 * - Gradient header with Airbnb branding
 * - Total items across all properties
 * - Average items per property
 * - Properties with recent activity indicator
 * - Graceful handling of zero/null states
 *
 * @param stats - Statistics data from useDashboardStats hook
 * @param propertyCount - Number of properties in portfolio
 * @param isLoading - Shows loading skeleton when true
 * @param className - Optional additional CSS classes
 */
export function PortfolioSummary({
  stats,
  propertyCount,
  isLoading = false,
  className = '',
}: PortfolioSummaryProps) {
  const t = useTranslations('dashboard');

  // Show loading skeleton
  if (isLoading) {
    return <LoadingSkeleton loadingLabel={t('portfolio.loadingSummary')} />;
  }

  // Calculate derived stats
  const totalItems = stats?.itemCount ?? 0;
  const avgItemsPerProperty = propertyCount > 0
    ? Math.round(totalItems / propertyCount)
    : 0;

  // For now, we'll show total rooms as a simple metric
  // In future, this could be enhanced with actual activity data
  const totalRooms = stats?.roomCount ?? 0;

  return (
    <div
      className={`bg-gradient-to-r from-[#E61E4D] to-[#D70466] rounded-xl p-6 text-white shadow-lg ${className}`}
      role="region"
      aria-label={t('portfolio.ariaLabel')}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/20 rounded-lg">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold">{t('portfolio.title')}</h2>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryStat
          value={propertyCount}
          label={t('portfolio.totalProperties')}
          icon={<Building2 className="w-4 h-4" />}
        />
        <SummaryStat
          value={totalItems}
          label={t('portfolio.totalItems')}
          icon={<Activity className="w-4 h-4" />}
        />
        <SummaryStat
          value={avgItemsPerProperty}
          label={t('portfolio.avgItemsPerProperty')}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Optional: Quick insight */}
      {propertyCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm text-white/70">
            {t('portfolio.insight', { roomCount: totalRooms, propertyCount })}
          </p>
        </div>
      )}
    </div>
  );
}

export default PortfolioSummary;
