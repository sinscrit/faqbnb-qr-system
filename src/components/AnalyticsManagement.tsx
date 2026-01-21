'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, TrendingUp, Eye, Heart, Users, Activity, RefreshCw, Building, Shield } from 'lucide-react';
import AnalyticsOverviewCards from '@/components/AnalyticsOverviewCards';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import PropertySelector from '@/components/PropertySelector';
import ReactionAnalytics from '@/components/ReactionAnalytics';
import AnalyticsExport from '@/components/AnalyticsExport';
import AnalyticsSkeleton from '@/components/AnalyticsSkeleton';
import { usePermissions } from '@/hooks/usePermissions';

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

interface PropertyOption {
  id: string;
  nickname: string;
  users?: {
    email: string;
  };
}

interface AnalyticsManagementProps {
  // Data props
  analyticsData: AnalyticsData | null;
  userAnalyticsData: UserAnalyticsData | null;
  properties: PropertyOption[];
  loading: boolean;
  error: string | null;
  selectedTimeRange: '24h' | '7d' | '30d' | '1y';
  selectedPropertyId: string;
  propertiesLoading: boolean;
  lastUpdated: Date;

  // Permission props
  isAdmin: boolean;
  canViewAdminAnalytics: boolean;
  canExportAnalytics: boolean;

  // Context props
  accountContext?: any;

  // Event handlers
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '1y') => void;
  onPropertyChange: (propertyId: string) => void;
  onRefresh: () => void;

  // UI customization
  className?: string;
  showExportButton?: boolean;
  showPropertySelector?: boolean;
}

export function AnalyticsManagement({
  // Data props
  analyticsData,
  userAnalyticsData,
  properties,
  loading,
  error,
  selectedTimeRange,
  selectedPropertyId,
  propertiesLoading,
  lastUpdated,

  // Permission props
  isAdmin,
  canViewAdminAnalytics,
  canExportAnalytics,

  // Context props
  accountContext,

  // Event handlers
  onTimeRangeChange,
  onPropertyChange,
  onRefresh,

  // UI customization
  className = '',
  showExportButton = true,
  showPropertySelector = true
}: AnalyticsManagementProps) {
  const tEmpty = useTranslations('common.emptyStates');
  const { useCanAccess } = usePermissions(null, undefined, undefined);

  // Permission check for export
  const canExport = useCanAccess('export_analytics');

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            onClick={onRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin && canViewAdminAnalytics
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
            {showExportButton && canExportAnalytics && canExport.granted && (
              <AnalyticsExport
                variant="button"
                defaultTimeRange={selectedTimeRange}
                className="flex-shrink-0"
              />
            )}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permission Warning */}
      {(!canViewAdminAnalytics && isAdmin) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="text-yellow-800">
              <p className="text-sm font-medium">Limited Analytics Permissions</p>
              <p className="text-sm">
                You have access to basic analytics only. Contact administrator for full analytics access.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role-based Analytics Rendering */}
      {isAdmin && canViewAdminAnalytics ? (
        // Admin Analytics - Full Featured
        <>
          {/* Time Range and Property Selectors */}
          {showPropertySelector && (
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeRangeSelector
                selectedRange={selectedTimeRange}
                onRangeChange={onTimeRangeChange}
                variant="default"
                disabled={loading}
              />

              <PropertySelector
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onPropertyChange={onPropertyChange}
                variant="default"
                disabled={loading}
                loading={propertiesLoading}
                isAdmin={isAdmin}
                placeholder="All Properties"
              />
            </div>
          )}

          {/* Overview Cards */}
          <div className="mb-8">
            <AnalyticsOverviewCards
              timeRange={selectedTimeRange}
              className="mb-2"
              data={analyticsData}
              loading={loading}
            />
          </div>

          {/* Main Analytics Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Reaction Analytics */}
            <ReactionAnalytics
              timeRange={selectedTimeRange}
              showTrends={true}
              className="lg:col-span-1"
              data={analyticsData?.reactionTrends}
              loading={loading}
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
                  {analyticsData && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-900">
                          {(analyticsData.timeBasedVisits?.last24Hours ?? 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">24h</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-900">
                          {(analyticsData.timeBasedVisits?.allTime ?? 0).toLocaleString()}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Engagement Insights</h3>
              <Users className="w-5 h-5 text-gray-500" />
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : analyticsData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {(analyticsData.engagementStats?.averageEngagementRate ?? 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">Average Engagement Rate</div>
                  <div className="text-xs text-blue-500 mt-1">
                    Reactions per visit
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {(analyticsData.engagementStats?.totalUniqueVisitors ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Estimated Unique Visitors</div>
                  <div className="text-xs text-green-500 mt-1">
                    Based on session tracking
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {analyticsData.engagementStats?.totalActiveItems ?? 0}
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
                <p>{tEmpty('analytics.noEngagement')}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{userAnalyticsData?.totalItems || 0}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{userAnalyticsData?.totalViews || 0}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{userAnalyticsData?.viewsLast24h || 0}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{userAnalyticsData?.totalReactions || 0}</p>
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
                {userAnalyticsData?.dailyViews && userAnalyticsData.dailyViews.length > 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <TrendingUp className="w-8 h-8 mr-2" />
                    <span>Chart visualization available in admin view</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {tEmpty('analytics.noDailyViews')}
                  </div>
                )}
              </div>
            </div>

            {/* Reaction Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reactions Breakdown</h3>
              <div className="h-64">
                {userAnalyticsData?.reactionBreakdown && userAnalyticsData.reactionBreakdown.some(r => r.count > 0) ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Heart className="w-8 h-8 mr-2" />
                    <span>Pie chart visualization available in admin view</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {tEmpty('analytics.noReactions')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Items Table */}
          {userAnalyticsData?.topItems && userAnalyticsData.topItems.length > 0 && (
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
                    {userAnalyticsData.topItems.map((item) => (
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
            onClick={onRefresh}
            disabled={loading}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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
    </div>
  );
}
