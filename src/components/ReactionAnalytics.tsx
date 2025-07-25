'use client';

import { useState, useEffect } from 'react';
import { Heart, TrendingUp, BarChart, RefreshCw } from 'lucide-react';

interface ReactionData {
  like: number;
  dislike: number;
  love: number;
  confused: number;
  total: number;
}

interface ReactionTrend {
  period: string;
  data: ReactionData;
}

interface ReactionAnalyticsProps {
  timeRange: '24h' | '7d' | '30d' | '1y';
  className?: string;
  showTrends?: boolean;
  itemId?: string; // If provided, show analytics for specific item
  data?: ReactionData; // Accept data as props to avoid independent API calls
  loading?: boolean; // Accept loading state from parent
}

const REACTION_CONFIG = [
  {
    type: 'like' as const,
    icon: '👍',
    label: 'Likes',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    barColor: 'bg-green-500'
  },
  {
    type: 'love' as const,
    icon: '❤️',
    label: 'Loves',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    barColor: 'bg-red-500'
  },
  {
    type: 'confused' as const,
    icon: '😕',
    label: 'Confused',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    barColor: 'bg-yellow-500'
  },
  {
    type: 'dislike' as const,
    icon: '👎',
    label: 'Dislikes',
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    barColor: 'bg-gray-500'
  }
];

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-3">
        <Heart className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No reactions yet</h3>
      <p className="text-gray-600">
        Reaction data will appear here once users start interacting with your content.
      </p>
    </div>
  );
}

export default function ReactionAnalytics({ 
  timeRange, 
  className = '', 
  showTrends = false,
  itemId,
  data: propData,
  loading: propLoading = false
}: ReactionAnalyticsProps) {
  const [data, setData] = useState<ReactionData | null>(null);
  const [trends, setTrends] = useState<ReactionTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use prop data if provided, otherwise fetch data
  useEffect(() => {
    if (propData) {
      // Use data passed as props
      setData(propData);
      setLoading(propLoading);
      setError(null);
      return;
    }

    // Fallback: fetch data if not provided as props (for itemId case)
    if (itemId) {
      const fetchReactionData = async () => {
        setLoading(true);
        setError(null);

        try {
          const url = `/api/items/${itemId}/reactions`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch reaction data: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success && result.data) {
            setData(result.data);
          } else {
            throw new Error(result.error || 'Invalid response format');
          }
        } catch (error) {
          console.error('Error fetching reaction data:', error);
          setError(error instanceof Error ? error.message : 'Failed to load reaction data');
          
          // Set empty data as fallback
          setData({
            like: 0,
            dislike: 0,
            love: 0,
            confused: 0,
            total: 0
          });
        } finally {
          setLoading(false);
        }
      };

      fetchReactionData();
    } else {
      // No data provided and no itemId - set empty state
      setData({
        like: 0,
        dislike: 0,
        love: 0,
        confused: 0,
        total: 0
      });
      setLoading(false);
    }
  }, [propData, propLoading, itemId]);

  // Calculate percentages
  const getPercentage = (value: number, total: number): number => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  // Get the maximum value for bar chart scaling
  const getMaxValue = (data: ReactionData): number => {
    return Math.max(data.like, data.dislike, data.love, data.confused, 1);
  };

  // Format number for display
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

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reaction Analytics</h3>
          <Heart className="w-5 h-5 text-gray-500" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reaction Analytics</h3>
          <Heart className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <Heart className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-red-600 font-medium">Failed to load reaction data</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-600 hover:text-red-700 underline flex items-center space-x-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Reaction Analytics</h3>
          <Heart className="w-5 h-5 text-gray-500" />
        </div>
        <EmptyState />
      </div>
    );
  }

  const maxValue = getMaxValue(data);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reaction Analytics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Breakdown of user reactions for {timeRange === '24h' ? '24 hours' : 
                                            timeRange === '7d' ? '7 days' : 
                                            timeRange === '30d' ? '30 days' : '1 year'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-gray-500" />
          <span className="text-lg font-semibold text-gray-900">
            {formatNumber(data.total)}
          </span>
        </div>
      </div>

      {/* Reaction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {REACTION_CONFIG.map((config) => {
          const count = data[config.type];
          const percentage = getPercentage(count, data.total);
          
          return (
            <div 
              key={config.type}
              className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200`}
            >
              <div className="text-2xl mb-2">{config.icon}</div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {formatNumber(count)}
              </p>
              <p className="text-sm text-gray-600 mb-2">{config.label}</p>
              <div className={`text-xs font-medium ${config.textColor}`}>
                {percentage.toFixed(1)}% of total
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar Chart Visualization */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-700">Reaction Distribution</h4>
        </div>
        <div className="space-y-3">
          {REACTION_CONFIG.map((config) => {
            const count = data[config.type];
            const percentage = getPercentage(count, data.total);
            const barWidth = maxValue > 0 ? (count / maxValue) * 100 : 0;
            
            return (
              <div key={config.type} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600 flex items-center space-x-1">
                  <span className="text-base">{config.icon}</span>
                  <span className="text-xs">{config.label}</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className={`${config.barColor} h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(barWidth, count > 0 ? 5 : 0)}%` }}
                  >
                    {count > 0 && (
                      <span className="text-white text-xs font-medium">
                        {formatNumber(count)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 text-right text-xs text-gray-500">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(data.like + data.love)}
            </div>
            <div className="text-sm text-green-600">Positive Reactions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(data.dislike + data.confused)}
            </div>
            <div className="text-sm text-red-600">Negative Reactions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {((data.like + data.love) / Math.max(data.total, 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600">Positivity Rate</div>
          </div>
        </div>
      </div>

      {/* Trends Section (if enabled and data available) */}
      {showTrends && trends.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">Reaction Trends</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trends.slice(0, 4).map((trend, index) => (
              <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">
                  {formatNumber(trend.data.total)}
                </div>
                <div className="text-xs text-blue-600">{trend.period}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-gray-500">Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-gray-600">
            <div>Time Range: {timeRange}</div>
            <div>Item ID: {itemId || 'System-wide'}</div>
            <div>Total Reactions: {data.total}</div>
            <div>Data: {JSON.stringify(data)}</div>
          </div>
        </details>
      )}
    </div>
  );
} 