'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Eye, Heart, Users, Activity, RefreshCw, Building, Shield } from 'lucide-react';
import AnalyticsOverviewCards from '@/components/AnalyticsOverviewCards';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import PropertySelector from '@/components/PropertySelector';
import ReactionAnalytics from '@/components/ReactionAnalytics';
import AnalyticsExport from '@/components/AnalyticsExport';
import AnalyticsSkeleton from '@/components/AnalyticsSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { adminApi } from '@/lib/api';

interface AnalyticsData {
  timeBasedVisits: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
    last365Days: number;
    allTime: number;
  };
  reactionTrends: {
    like: number;
    dislike: number;
    love: number;
    confused: number;
    total: number;
  };
  topItems: Array<{
    id: string;
    publicId: string;
    name: string;
    visitCount: number;
    reactionCount: number;
  }>;
  engagementStats: {
    averageEngagementRate: number;
    totalUniqueVisitors: number;
    totalActiveItems: number;
  };
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
}

interface UserAnalyticsData {
  totalItems: number;
  totalViews: number;
  totalReactions: number;
  viewsLast24h: number;
  viewsLast7d: number;
  viewsLast30d: number;
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
  topItems: Array<{
    id: string;
    name: string;
    views: number;
    reactions: number;
  }>;
  reactionBreakdown: Array<{
    type: string;
    count: number;
    color: string;
  }>;
}

export default function DashboardAnalyticsPage() {
  const { user, loading: authLoading, isAdmin, selectedProperty: accountContext, currentAccount } = useAuth();

  // Enhanced: Use AuthContext account role integration (REQ-024)
  const { useCanAccess, permissions, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

  // Enhanced: Validate account role integration (REQ-024)
  console.log('🔍 ANALYTICS_PAGE_DEBUG: Account role integration validation', {
    userId: user?.id,
    accountId: currentAccount?.id,
    accountName: currentAccount?.name,
    accountUserRole: currentAccount?.userRole,
    isAccountOwner: currentAccount && user ? currentAccount.owner_id === user.id : false,
    permissionsLoading,
    hasPermissions: !!permissions
  });

  // Permission checks
  const canViewAnalytics = useCanAccess('view_analytics');
  const canViewAdminAnalytics = useCanAccess('view_admin_analytics');
  const canExportAnalytics = useCanAccess('export_analytics');

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('30d');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setPropertiesLoading(true);
        const response = await adminApi.listProperties();
        if (response.success && response.data) {
          setProperties(response.data);
        } else {
          console.warn('Failed to load properties:', response.error);
        }
      } catch (err) {
        console.warn('Failed to load properties:', err);
      } finally {
        setPropertiesLoading(false);
      }
    };

    if (user) {
      loadProperties();
    }
  }, [user]);

  // Fetch analytics data based on user role
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setAnalyticsLoading(true);
      setError(null);

      try {
        // Prepare headers with account context
        const headers: Record<string, string> = {};
        if (accountContext) {
          headers['x-current-account'] = accountContext.id;
        }

        if (isAdmin && canViewAdminAnalytics.granted) {
          // Admin analytics - comprehensive data
          const params = new URLSearchParams();
          params.set('timeRange', selectedTimeRange);
          params.set('detailed', 'true');
          if (selectedPropertyId) {
            params.set('propertyId', selectedPropertyId);
          }

          const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
            headers,
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch admin analytics: ${response.status}`);
          }

          const data = await response.json();
          if (data.success) {
            setAnalytics(data.data);
          } else {
            throw new Error(data.error || 'Failed to load analytics');
          }
        } else {
          // User analytics - limited to their own data
          const params = new URLSearchParams();
          params.set('timeRange', selectedTimeRange);
          if (selectedPropertyId) {
            params.set('propertyId', selectedPropertyId);
          }

          const response = await fetch(`/api/analytics/user?${params.toString()}`, {
            headers,
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch user analytics: ${response.status}`);
          }

          const data = await response.json();
          if (data.success) {
            // Transform the data to match our interface
            const transformedData: UserAnalyticsData = {
              totalItems: data.data?.totalItems || 0,
              totalViews: data.data?.totalViews || 0,
              totalReactions: data.data?.totalReactions || 0,
              viewsLast24h: data.data?.viewsLast24h || 0,
              viewsLast7d: data.data?.viewsLast7d || 0,
              viewsLast30d: data.data?.viewsLast30d || 0,
              dailyViews: data.data?.dailyViews || [],
              topItems: data.data?.topItems || [],
              reactionBreakdown: [
                { type: 'Like', count: data.data?.reactions?.like || 0, color: '#10B981' },
                { type: 'Love', count: data.data?.reactions?.love || 0, color: '#F59E0B' },
                { type: 'Confused', count: data.data?.reactions?.confused || 0, color: '#6B7280' },
                { type: 'Dislike', count: data.data?.reactions?.dislike || 0, color: '#EF4444' },
              ]
            };
            setUserAnalytics(transformedData);
          } else {
            throw new Error(data.error || 'Failed to load analytics');
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analytics data');

        // Set fallback data for development
        if (isAdmin && canViewAdminAnalytics.granted) {
          setAnalytics({
            timeBasedVisits: {
              last24Hours: 0,
              last7Days: 0,
              last30Days: 0,
              last365Days: 0,
              allTime: 0
            },
            reactionTrends: {
              like: 0,
              dislike: 0,
              love: 0,
              confused: 0,
              total: 0
            },
            topItems: [],
            engagementStats: {
              averageEngagementRate: 0,
              totalUniqueVisitors: 0,
              totalActiveItems: 0
            },
            dailyViews: []
          });
        } else {
          setUserAnalytics({
            totalItems: 0,
            totalViews: 0,
            totalReactions: 0,
            viewsLast24h: 0,
            viewsLast7d: 0,
            viewsLast30d: 0,
            dailyViews: [],
            topItems: [],
            reactionBreakdown: [
              { type: 'Like', count: 0, color: '#10B981' },
              { type: 'Love', count: 0, color: '#F59E0B' },
              { type: 'Confused', count: 0, color: '#6B7280' },
              { type: 'Dislike', count: 0, color: '#EF4444' },
            ]
          });
        }
      } finally {
        setAnalyticsLoading(false);
        setLastUpdated(new Date());
      }
    };

    if (user) {
      fetchAnalyticsData();
    }
  }, [user, selectedTimeRange, selectedPropertyId, isAdmin, canViewAdminAnalytics.granted, accountContext]);

  // Show loading state while authentication or permissions are being determined
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Check if user can access this page
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access analytics.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Check if user has permission to view analytics
  if (!canViewAnalytics.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view analytics.</p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }


  // Handle time range change
  const handleTimeRangeChange = (range: '24h' | '7d' | '30d' | '1y') => {
    setSelectedTimeRange(range);
  };

  // Handle property change
  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setAnalyticsLoading(true);
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.reload();
  };

  if (analyticsLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-red-100 text-red-600 rounded">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-900">Failed to load analytics data</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin && canViewAdminAnalytics.granted
                ? 'View comprehensive analytics and insights'
                : 'Track performance of your QR codes and items'
              }
              {accountContext && (
                <span className="block mt-1">
                  <Building className="w-4 h-4 inline mr-1 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    {accountContext.nickname}
                  </span>
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            </div>
            {canExportAnalytics.granted && (
              <AnalyticsExport
                variant="button"
                defaultTimeRange={selectedTimeRange}
                className="flex-shrink-0"
              />
            )}
            <button
              onClick={handleRefresh}
              disabled={analyticsLoading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-based Analytics Rendering */}
      {isAdmin && canViewAdminAnalytics.granted ? (
        // Admin Analytics - Full Featured
        <>
          {/* Time Range and Property Selectors */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeRangeSelector
              selectedRange={selectedTimeRange}
              onRangeChange={handleTimeRangeChange}
              variant="default"
              disabled={analyticsLoading}
            />

            <PropertySelector
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={handlePropertyChange}
              variant="default"
              disabled={analyticsLoading}
              loading={propertiesLoading}
              isAdmin={isAdmin}
              placeholder="All Properties"
            />
          </div>

          {/* Overview Cards */}
          <div className="mb-8">
            <AnalyticsOverviewCards
              timeRange={selectedTimeRange}
              className="mb-2"
              data={analytics}
              loading={analyticsLoading}
            />
          </div>

          {/* Main Analytics Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Reaction Analytics */}
            <ReactionAnalytics
              timeRange={selectedTimeRange}
              showTrends={true}
              className="lg:col-span-1"
              data={analytics?.reactionTrends}
              loading={analyticsLoading}
            />

            {/* Visit Trends Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Visit Trends</h3>
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Visit trends chart</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Advanced charting will be implemented in future updates
                  </p>
                  {analytics && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-900">
                          {(analytics.timeBasedVisits?.last24Hours ?? 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">24h</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-900">
                          {(analytics.timeBasedVisits?.allTime ?? 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">Total</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Engagement Insights</h3>
              <Users className="w-5 h-5 text-gray-500" />
            </div>

            {analyticsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {(analytics.engagementStats?.averageEngagementRate ?? 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">Average Engagement Rate</div>
                  <div className="text-xs text-blue-500 mt-1">
                    Reactions per visit
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {(analytics.engagementStats?.totalUniqueVisitors ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Estimated Unique Visitors</div>
                  <div className="text-xs text-green-500 mt-1">
                    Based on session tracking
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {analytics.engagementStats?.totalActiveItems ?? 0}
                  </div>
                  <div className="text-sm text-purple-600">Active Items</div>
                  <div className="text-xs text-purple-500 mt-1">
                    Items with recent activity
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>No engagement data available</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // User Analytics - Simplified View
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{userAnalytics?.totalItems || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-semibold text-gray-900">{userAnalytics?.totalViews || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Views (24h)</p>
                  <p className="text-2xl font-semibold text-gray-900">{userAnalytics?.viewsLast24h || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reactions</p>
                  <p className="text-2xl font-semibold text-gray-900">{userAnalytics?.totalReactions || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Views Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Views (Last 30 Days)</h3>
              <div className="h-64">
                {userAnalytics?.dailyViews && userAnalytics.dailyViews.length > 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <TrendingUp className="w-8 h-8 mr-2" />
                    <span>Chart visualization available in admin view</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No daily view data available
                  </div>
                )}
              </div>
            </div>

            {/* Reaction Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reactions Breakdown</h3>
              <div className="h-64">
                {userAnalytics?.reactionBreakdown && userAnalytics.reactionBreakdown.some(r => r.count > 0) ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Heart className="w-8 h-8 mr-2" />
                    <span>Pie chart visualization available in admin view</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No reactions data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Items Table */}
          {userAnalytics?.topItems && userAnalytics.topItems.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Performing Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reactions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userAnalytics.topItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{item.views}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{item.reactions}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open('/dashboard/items', '_blank')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Items</p>
                <p className="text-sm text-gray-600">Go to item management</p>
              </div>
            </div>
          </button>
          <button
            onClick={handleRefresh}
            disabled={analyticsLoading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                <RefreshCw className={`w-5 h-5 ${analyticsLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Refresh Data</p>
                <p className="text-sm text-gray-600">Update all analytics</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => window.open('/dashboard', '_blank')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Back to Dashboard</p>
                <p className="text-sm text-gray-600">Return to main dashboard</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Development Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-100 text-blue-600 rounded">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Unified Analytics Dashboard - REQ-023 Complete</p>
            <p className="text-sm text-blue-700">
              Role-based analytics system with admin comprehensive features and user simplified view.
              Permission integration and account context filtering implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
