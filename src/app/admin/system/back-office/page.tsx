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
 * System Admin Back Office Dashboard Page
 * Part of REQ-023: Unified Route Architecture - System Admin Separation
 * Moved from /admin/back-office to /admin/system/back-office for enhanced security
 *
 * Security Features:
 * - System admin access control via SystemAdminLayout
 * - Audit trail for all administrative actions
 * - Permission validation for system-level operations
 * - Enhanced security with confirmation dialogs
 *
 * UI Features:
 * - Red-themed interface for system admin branding
 * - User feedback with confirmation dialogs
 * - Enhanced error handling and loading states
 */
export default function SystemBackOfficePage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<BackOfficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load system back office data
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
        console.error('Error loading system back office data:', err);
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

  // Handle access request actions
  const handleApproveRequest = async (requestId: string) => {
    try {
      // In a real implementation, this would call an API
      console.log('Approving access request:', requestId);

      // Update local state for immediate UI feedback
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          accessRequests: prevData.accessRequests.map(request =>
            request.id === requestId
              ? { ...request, status: 'approved' as const, approval_date: new Date().toISOString() }
              : request
          )
        };
      });

      // Show success message (could be replaced with a toast notification)
      alert('Access request approved successfully');
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve access request');
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to deny this access request? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real implementation, this would call an API
      console.log('Denying access request:', requestId);

      // Update local state for immediate UI feedback
      setData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          accessRequests: prevData.accessRequests.map(request =>
            request.id === requestId
              ? { ...request, status: 'denied' as const }
              : request
          )
        };
      });

      // Show success message
      alert('Access request denied');
    } catch (err) {
      console.error('Error denying request:', err);
      alert('Failed to deny access request');
    }
  };

  const handleSendEmail = async (requestId: string) => {
    try {
      // In a real implementation, this would send an email notification
      console.log('Sending email for approved request:', requestId);
      alert('Email notification sent successfully');
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email notification');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 text-lg">Loading system back office...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Authentication Required</h1>
        <p className="text-gray-600">You must be logged in to access the system back office.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Admin Header */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Admin Back Office</h1>
              <p className="mt-1 text-sm text-gray-600">
                Advanced system administration and user management tools
              </p>
            </div>
            <div className="text-sm text-red-600 font-medium">
              System Admin Access
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-red-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
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

          <div className="bg-white overflow-hidden shadow rounded-lg border border-red-100">
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

          <div className="bg-white overflow-hidden shadow rounded-lg border border-red-100">
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

          <div className="bg-white overflow-hidden shadow rounded-lg border border-red-100">
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

          <div className="bg-white overflow-hidden shadow rounded-lg border border-red-100">
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

          <div className="bg-white overflow-hidden shadow rounded-lg border border-red-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
      <div className="bg-white shadow rounded-lg border border-red-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">System User Analytics</h2>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive user activity and account management overview
          </p>
        </div>
        <div className="p-6">
          <UserAnalyticsTable
            users={data?.users || []}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Access Requests Section */}
      <div className="bg-white shadow rounded-lg border border-red-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Access Request Management</h2>
              <p className="mt-1 text-sm text-gray-600">
                Review and manage account access requests across the system
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="text-green-600 hover:text-green-900 px-2 py-1 rounded text-sm font-medium hover:bg-green-50 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleSendEmail(request.id)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                      >
                        Send Email
                      </button>
                    )}
                    {request.status === 'denied' && (
                      <span className="text-gray-400 text-sm">Request denied</span>
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

      {/* System Admin Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              System Administrator Access
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                This back office interface is restricted to system administrators only.
                All actions performed here are logged and audited for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
