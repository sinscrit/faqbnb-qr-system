'use client';

/**
 * Dashboard2 Home Page
 *
 * Landing page for the new dashboard with quick access to create items
 * and manage existing items.
 *
 * @route /dashboard2
 * @created 2026-01-06
 */

import { useAuth } from '@/contexts/AuthContext';
import { StatisticsCards, ActionButtons } from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function Dashboard2Page() {
  const { user } = useAuth();
  const { stats, isLoading, error } = useDashboardStats();

  const firstName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
        <p className="text-white/80 text-lg">Create and manage your QR code items</p>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards stats={stats} isLoading={isLoading} error={error} />

      {/* Action Buttons - REQ-126 */}
      <ActionButtons />
    </div>
  );
}
