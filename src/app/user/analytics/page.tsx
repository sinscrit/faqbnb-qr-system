'use client';

import { useState, useEffect } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
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

export default function UserAnalyticsPage() {
  const { user, loading } = useAuth();
  const { currentAccount } = useAccountContext();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, currentAccount]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      setError(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      const response = await fetch('/api/admin/analytics', {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to load analytics: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Transform the data to match our interface
        const transformedData: AnalyticsData = {
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
        setAnalytics(transformedData);
      } else {
        throw new Error(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
        <p className="text-gray-600 mt-1">Track performance of your QR codes and items</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingAnalytics && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
      )}

      {/* Analytics Content */}
      {!loadingAnalytics && !error && analytics && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalViews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Views (24h)</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.viewsLast24h}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reactions</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalReactions}</p>
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
                {analytics.dailyViews.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.dailyViews}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
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
                {analytics.reactionBreakdown.some(r => r.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.reactionBreakdown.filter(r => r.count > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, count }) => `${type}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.reactionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No reactions data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Items Table */}
          {analytics.topItems.length > 0 && (
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
                    {analytics.topItems.map((item) => (
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
    </div>
  );
}
