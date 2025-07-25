'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  BarChart,
  RefreshCw,
  Clock,
  Users
} from 'lucide-react';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import ReactionAnalytics from '@/components/ReactionAnalytics';
import VisitCounter from '@/components/VisitCounter';

interface ItemDetails {
  id: string;
  publicId: string;
  name: string;
  description?: string;
  createdAt: string;
  linksCount: number;
}

interface ItemAnalyticsData {
  visitAnalytics: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
    last365Days: number;
    allTime: number;
  };
  reactionCounts: {
    like: number;
    dislike: number;
    love: number;
    confused: number;
    total: number;
  };
  visitHistory: Array<{
    date: string;
    visits: number;
  }>;
  engagementRate: number;
  averageTimeOnPage?: number;
  topReferrers?: Array<{
    source: string;
    count: number;
  }>;
}

interface ItemAnalyticsPageProps {
  params: {
    publicId: string;
  };
}

export default function ItemAnalyticsPage({ params }: ItemAnalyticsPageProps) {
  const router = useRouter();
  const { publicId } = params;
  
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [analytics, setAnalytics] = useState<ItemAnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch item details and analytics
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch item details
        const itemResponse = await fetch(`/api/admin/items/${publicId}`);
        if (!itemResponse.ok) {
          throw new Error(`Item not found: ${itemResponse.status}`);
        }
        const itemResult = await itemResponse.json();
        if (!itemResult.success) {
          throw new Error(itemResult.error || 'Failed to fetch item');
        }
        setItem(itemResult.data);

        // Fetch analytics data
        const analyticsResponse = await fetch(`/api/admin/items/${publicId}/analytics?timeRange=${selectedTimeRange}`);
        if (!analyticsResponse.ok) {
          throw new Error(`Analytics not found: ${analyticsResponse.status}`);
        }
        const analyticsResult = await analyticsResponse.json();
        if (!analyticsResult.success) {
          throw new Error(analyticsResult.error || 'Failed to fetch analytics');
        }
        
        // Transform analytics data
        const transformedAnalytics: ItemAnalyticsData = {
          visitAnalytics: {
            last24Hours: analyticsResult.data.last24Hours || 0,
            last7Days: analyticsResult.data.last7Days || 0,
            last30Days: analyticsResult.data.last30Days || 0,
            last365Days: analyticsResult.data.last365Days || 0,
            allTime: analyticsResult.data.allTime || 0
          },
          reactionCounts: {
            like: 0,
            dislike: 0,
            love: 0,
            confused: 0,
            total: 0
          },
          visitHistory: [],
          engagementRate: 0
        };

        // Fetch reaction data separately
        try {
          const reactionsResponse = await fetch(`/api/items/${publicId}/reactions`);
          if (reactionsResponse.ok) {
            const reactionsResult = await reactionsResponse.json();
            if (reactionsResult.success && reactionsResult.data) {
              transformedAnalytics.reactionCounts = reactionsResult.data;
              transformedAnalytics.engagementRate = transformedAnalytics.visitAnalytics.allTime > 0 
                ? (reactionsResult.data.total / transformedAnalytics.visitAnalytics.allTime * 100)
                : 0;
            }
          }
        } catch (reactionsError) {
          console.error('Failed to fetch reactions:', reactionsError);
        }

        setAnalytics(transformedAnalytics);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching item analytics:', error);
        setError(error instanceof Error ? error.message : 'Failed to load item analytics');
      } finally {
        setLoading(false);
      }
    };

    if (publicId) {
      fetchData();
    }
  }, [publicId, selectedTimeRange]);

  // Handle time range change
  const handleTimeRangeChange = (range: '24h' | '7d' | '30d' | '1y') => {
    setSelectedTimeRange(range);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num < 1000) return num.toLocaleString();
    if (num < 1000000) {
      const thousands = num / 1000;
      return thousands % 1 === 0 ? `${thousands.toFixed(0)}K` : `${thousands.toFixed(1)}K`;
    }
    const millions = num / 1000000;
    return millions % 1 === 0 ? `${millions.toFixed(0)}M` : `${millions.toFixed(1)}M`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-96"></div>
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-gray-700">Admin</Link>
          <span>/</span>
          <Link href="/admin/analytics" className="hover:text-gray-700">Analytics</Link>
          <span>/</span>
          <span className="text-gray-900">Item Analytics</span>
        </nav>

        {/* Error State */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <BarChart className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/admin/analytics"
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-700 transition-colors">Admin</Link>
        <span>/</span>
        <Link href="/admin/analytics" className="hover:text-gray-700 transition-colors">Analytics</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {item.name.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600 mt-1">Item Analytics Dashboard</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href={`/item/${publicId}`}
            target="_blank"
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Page</span>
          </Link>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Item Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Public ID</div>
            <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {publicId}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Created</div>
            <div className="text-sm text-gray-900">{formatDate(item.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Links</div>
            <div className="text-sm text-gray-900">{item.linksCount} resource{item.linksCount !== 1 ? 's' : ''}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Last Updated</div>
            <div className="text-sm text-gray-900">{lastUpdated.toLocaleString()}</div>
          </div>
        </div>
        {item.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-2">Description</div>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>
        )}
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TimeRangeSelector
          selectedRange={selectedTimeRange}
          onRangeChange={handleTimeRangeChange}
          variant="compact"
        />
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(analytics.visitAnalytics.allTime)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {formatNumber(analytics.visitAnalytics.last24Hours)} in last 24h
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reactions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(analytics.reactionCounts.total)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-red-600">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {analytics.reactionCounts.like} likes, {analytics.reactionCounts.love} loves
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analytics.engagementRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Reactions per visit
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(analytics.visitAnalytics.last7Days)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Views in last 7 days
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reaction Analytics */}
            <ReactionAnalytics 
              timeRange={selectedTimeRange}
              itemId={publicId}
              className="lg:col-span-1"
            />

            {/* Visit Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Visit Timeline</h3>
                <BarChart className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Last 24 hours</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(analytics.visitAnalytics.last24Hours)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Last 7 days</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(analytics.visitAnalytics.last7Days)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Last 30 days</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(analytics.visitAnalytics.last30Days)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">All time</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(analytics.visitAnalytics.allTime)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Trend Analysis</span>
                </div>
                <p className="text-sm text-blue-700">
                  {analytics.visitAnalytics.last7Days > analytics.visitAnalytics.last24Hours * 7 
                    ? 'Visits are trending upward over the past week.'
                    : analytics.visitAnalytics.last24Hours > 0
                    ? 'Recent activity detected in the last 24 hours.'
                    : 'No recent activity detected.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Manage this item or view related data</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin?search=${encodeURIComponent(item.name)}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit Item
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            View All Analytics
          </Link>
        </div>
      </div>
    </div>
  );
} 