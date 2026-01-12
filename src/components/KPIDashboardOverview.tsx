'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Users, Building2, Eye, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  /** Optional navigation URL - renders card as Next.js Link */
  href?: string;
  /** Optional click handler - renders card as button */
  onClick?: () => void;
}

function KPICard({ title, value, subtitle, icon, trend, loading, href, onClick }: KPICardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Determine if card is interactive
  const isClickable = !!href || !!onClick;

  // Extract card content for reuse across wrapper types
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`ml-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </>
  );

  // Base card styles
  const baseStyles = "bg-white rounded-lg shadow-sm border border-gray-200 p-6";

  // Interactive styles for clickable cards (hover, focus, cursor)
  const interactiveStyles = isClickable
    ? "hover:shadow-md hover:border-blue-300 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    : "";

  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${interactiveStyles} block`}
        aria-label={`Navigate to ${title}`}
      >
        {cardContent}
      </Link>
    );
  }

  // Render as button if onClick is provided
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseStyles} ${interactiveStyles} text-left w-full`}
        aria-label={`View ${title}`}
      >
        {cardContent}
      </button>
    );
  }

  // Default: non-clickable div
  return (
    <div className={baseStyles}>
      {cardContent}
    </div>
  );
}

// Account Summary Component
interface AccountSummaryProps {
  ownedAccounts: Array<{
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    created_at: string;
  }>;
  accessibleAccounts: Array<{
    id: string;
    name: string;
    description: string | null;
    userRole: string;
    ownerName: string;
    memberCount: number;
    created_at: string;
  }>;
  loading?: boolean;
}

function AccountSummary({ ownedAccounts, accessibleAccounts, loading }: AccountSummaryProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>

      {/* Owned Accounts */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Building2 className="w-4 h-4 mr-2" />
          Accounts You Own ({ownedAccounts.length})
        </h4>
        <div className="space-y-2">
          {ownedAccounts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No owned accounts</p>
          ) : (
            ownedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">{account.name}</p>
                  <p className="text-xs text-blue-700">{account.memberCount} members</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Owner
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Accessible Accounts */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Accounts You Access ({accessibleAccounts.length})
        </h4>
        <div className="space-y-2">
          {accessibleAccounts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No accessible accounts</p>
          ) : (
            accessibleAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{account.name}</p>
                  <p className="text-xs text-gray-600">by {account.ownerName} • {account.memberCount} members</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                  {account.userRole}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Recent Activity Component
interface RecentActivityProps {
  mostActiveProperties: Array<{
    id: string;
    name: string;
    visitCount: number;
    lastVisit: string;
  }>;
  topViewedItems: Array<{
    id: string;
    name: string;
    publicId: string;
    visitCount: number;
  }>;
  loading?: boolean;
}

function RecentActivity({ mostActiveProperties, topViewedItems, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

      {/* Most Active Properties */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Most Active Properties (Last 30 Days)
        </h4>
        <div className="space-y-2">
          {mostActiveProperties.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No recent activity</p>
          ) : (
            mostActiveProperties.slice(0, 3).map((property, index) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-xs font-bold rounded-full mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-green-900">{property.name}</p>
                    <p className="text-xs text-green-700">Last visit: {new Date(property.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-800">
                  {property.visitCount} visits
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Viewed Items */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Top Viewed Items
        </h4>
        <div className="space-y-2">
          {topViewedItems.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No viewed items</p>
          ) : (
            topViewedItems.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-purple-900">{item.name}</p>
                    <p className="text-xs text-purple-700">ID: {item.publicId.substring(0, 8)}...</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-purple-800">
                  {item.visitCount} views
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
interface KPIDashboardOverviewProps {
  onRefresh?: () => void;
  className?: string;
}

export default function KPIDashboardOverview({ onRefresh, className = '' }: KPIDashboardOverviewProps) {
  // Get current account context from useAuth
  const { currentAccount } = useAuth();
  
  console.log('🔍 KPIDashboardOverview: currentAccount state:', currentAccount);
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [userAccessData, setUserAccessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Import apiRequest function directly to avoid tree-shaking issues
      const { apiRequest } = await import('@/lib/api');

      console.log('🔍 DEBUG: Using direct apiRequest calls with account:', currentAccount?.id);

      // Fetch analytics data directly with current account ID
      const analyticsResult = await apiRequest(
        `/admin/analytics${currentAccount?.id ? `?account_id=${currentAccount.id}` : ''}`, 
        {}, 
        true
      );

      // Fetch user access data directly
      const userAccessResult = await apiRequest('/admin/accounts/users', {}, true);

      if (analyticsResult.success) {
        setAnalyticsData(analyticsResult.data);
      } else {
        setError(`Analytics error: ${analyticsResult.error}`);
      }

      if (userAccessResult.success) {
        setUserAccessData(userAccessResult.data);
      } else {
        setError(`User access error: ${userAccessResult.error}`);
      }

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when we have a current account
    if (currentAccount?.id) {
      console.log('🔍 KPIDashboardOverview: Fetching with account:', currentAccount.id);
      fetchDashboardData();
    } else {
      console.log('🔍 KPIDashboardOverview: Waiting for currentAccount...');
    }
  }, [currentAccount]);

  const handleRefresh = () => {
    fetchDashboardData();
    onRefresh?.();
  };

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Dashboard Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your properties, accounts, and activity</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Properties"
          value={analyticsData?.overview?.totalProperties || 0}
          subtitle="Across all accounts"
          icon={<Building2 className="w-6 h-6" />}
          loading={loading}
          href="/dashboard2/properties"
        />
        <KPICard
          title="Total Items"
          value={analyticsData?.overview?.totalItems || 0}
          subtitle={`${analyticsData?.overview?.averageItemsPerProperty || 0} avg per property`}
          icon={<BarChart3 className="w-6 h-6" />}
          loading={loading}
          href="/dashboard2/items"
        />
        <KPICard
          title="Total Views"
          value={analyticsData?.overview?.totalVisits || 0}
          subtitle={`${analyticsData?.timeBasedVisits?.last24Hours || 0} in last 24h`}
          icon={<Eye className="w-6 h-6" />}
          loading={loading}
          href="/dashboard2/analytics"
        />
        <KPICard
          title="Active Items"
          value={analyticsData?.overview?.activeItems || 0}
          subtitle="With visits in last 30 days"
          icon={<TrendingUp className="w-6 h-6" />}
          loading={loading}
          href="/dashboard2/items?filter=active"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountSummary
          ownedAccounts={userAccessData?.ownedAccounts || []}
          accessibleAccounts={userAccessData?.accessibleAccounts || []}
          loading={loading}
        />

        <RecentActivity
          mostActiveProperties={analyticsData?.recentActivity?.mostActiveProperties || []}
          topViewedItems={analyticsData?.recentActivity?.topViewedItems || []}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/items"
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Manage Items
          </a>
          <a
            href="/admin/properties"
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Building2 className="w-5 h-5 mr-2" />
            Manage Properties
          </a>
          <a
            href="/admin/analytics"
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View Analytics
          </a>
        </div>
      </div>
    </div>
  );
}
