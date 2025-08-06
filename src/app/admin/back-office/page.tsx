'use client';

import { useState, useEffect } from 'react';
import { UserAnalytics, AdminDashboardStats, AccessRequest } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import UserAnalyticsTable from '@/components/UserAnalyticsTable';

interface BackOfficeData {
  users: UserAnalytics[];
  stats: AdminDashboardStats;
  accessRequests: AccessRequest[];
}

/**
 * Back Office Main Dashboard Page
 * Part of REQ-016: System Admin Back Office
 */
export default function BackOfficePage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<BackOfficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load back office data
  useEffect(() => {
    if (authLoading) return;

    async function loadBackOfficeData() {
      try {
        setLoading(true);
        setError(null);

        // Load user analytics
        const analyticsResponse = await fetch('/api/admin/users/analytics', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!analyticsResponse.ok) {
          throw new Error(`Analytics request failed: ${analyticsResponse.status}`);
        }

        const analyticsData = await analyticsResponse.json();

        if (!analyticsData.success) {
          throw new Error(analyticsData.error || 'Failed to load user analytics');
        }

        // Mock additional data for now (these would be separate API endpoints)
        const mockStats: AdminDashboardStats = {
          totalUsers: analyticsData.data.users.length,
          totalAccounts: analyticsData.data.users.reduce((sum: number, user: UserAnalytics) => 
            sum + user.ownedAccounts.count, 0),
          totalItems: analyticsData.data.users.reduce((sum: number, user: UserAnalytics) => 
            sum + user.ownedAccounts.totalItems + user.accessAccounts.totalItems, 0),
          totalVisits: analyticsData.data.users.reduce((sum: number, user: UserAnalytics) => 
            sum + user.ownedAccounts.totalVisits + user.accessAccounts.totalVisits, 0),
          pendingAccessRequests: 2, // Would come from API
          recentRegistrations24h: 0
        };

        const mockAccessRequests: AccessRequest[] = [
          {
            id: '1',
            requester_email: 'john.doe@example.com',
            requester_name: 'John Doe',
            account_id: 'acc-1',
            request_date: new Date().toISOString(),
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            requester_email: 'jane.smith@example.com',
            requester_name: 'Jane Smith',
            account_id: 'acc-2',
            request_date: new Date(Date.now() - 86400000).toISOString(),
            status: 'approved',
            approval_date: new Date().toISOString(),
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        setData({
          users: analyticsData.data.users,
          stats: mockStats,
          accessRequests: mockAccessRequests
        });

      } catch (err) {
        console.error('Error loading back office data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadBackOfficeData();
  }, [authLoading]);

  // Filter functions
  const filteredAccessRequests = data?.accessRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  }) || [];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">System Admin Back Office</h1>
            <p className="mt-2 text-gray-600">
              Manage users, accounts, and access requests across the system
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">🏠</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Accounts</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.stats.totalAccounts}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">📦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.stats.totalItems}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">👁️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Visits</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.stats.totalVisits}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.stats.pendingAccessRequests}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">🆕</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">New (24h)</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.stats.recentRegistrations24h}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Analytics Section */}
        <div className="mb-8">
          <UserAnalyticsTable 
            users={data?.users || []}
            isLoading={loading}
          />
        </div>

        {/* Access Requests Section */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Access Requests</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="registered">Registered</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccessRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.requester_email}</div>
                          <div className="text-sm text-gray-500">{request.requester_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.request_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'denied' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              Approve
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Deny
                            </button>
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <button className="text-blue-600 hover:text-blue-900">
                            Send Email
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredAccessRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No access requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}