'use client';

import { useState, useEffect } from 'react';
import { AccessRequest, AccessRequestStatus, AccessRequestSource } from '@/types/admin';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useAuth } from '@/contexts/AuthContext';
import AccessRequestTable from '@/components/AccessRequestTable';
import EmailPopup from '@/components/EmailPopup';

interface RequestFilters {
  status?: AccessRequestStatus;
  source?: AccessRequestSource;
  accountId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface RequestsData {
  requests: AccessRequest[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  summary: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    registeredUsers: number;
    overdueRequests: number;
  };
}

/**
 * Access Request Management Page
 * Part of REQ-016: System Admin Back Office
 */
export default function AccessRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<RequestsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RequestFilters>({});
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [emailPopupOpen, setEmailPopupOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    loading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false
  });

  // Load access requests data
  useEffect(() => {
    if (authLoading) return;

    async function loadAccessRequests() {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (filters.status) {
          params.append('status', filters.status);
        }
        if (filters.source) {
          params.append('source', filters.source);
        }
        if (filters.accountId) {
          params.append('account_id', filters.accountId);
        }
        if (filters.dateRange?.start) {
          params.append('start_date', filters.dateRange.start);
        }
        if (filters.dateRange?.end) {
          params.append('end_date', filters.dateRange.end);
        }
        params.append('limit', '100'); // Get more for admin view

        const response = await fetch(`/api/admin/access-requests?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to load access requests: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to load access requests');
        }

        setData(result.data);

      } catch (err) {
        console.error('Error loading access requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadAccessRequests();
  }, [authLoading, filters, refreshTrigger]);

  // Handle approve request
  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/grant-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          requestId: requestId,
          send_email: false // We'll handle email separately
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to approve request: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to approve request');
      }

      // Refresh data
      setRefreshTrigger(prev => prev + 1);

      // Show success message (you could add a toast notification here)
      console.log('Request approved successfully:', result.data.accessCode);

    } catch (err) {
      console.error('Error approving request:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    }
  };

  // Handle deny request
  const handleDeny = async (requestId: string) => {
    // Show confirmation modal
    setConfirmationModal({
      isOpen: true,
      title: 'Deny Access Request',
      message: 'Are you sure you want to deny this access request? This action cannot be undone.',
      onConfirm: () => performDeny(requestId),
      loading: false
    });
  };

  // Perform the actual deny operation
  const performDeny = async (requestId: string) => {
    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }));

      const response = await fetch(`/api/admin/deny-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          requestId: requestId,
          reason: 'Access denied by administrator'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to deny request: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to deny request');
      }

      console.log('Request denied successfully:', result.data);

      // Close modal and refresh data
      setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error('Error denying request:', err);
      setError(err instanceof Error ? err.message : 'Failed to deny request');
      setConfirmationModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle email click
  const handleEmailClick = (request: AccessRequest) => {
    setSelectedRequest(request);
    setEmailPopupOpen(true);
  };

  // Handle send email
  const handleSendEmail = async (emailData: { template: any; accessCode?: string }) => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/admin/access-requests/${selectedRequest.id}/grant`, {
        method: 'PUT', // Resend email
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email_template: emailData.template
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Refresh data
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error('Error sending email:', err);
      throw err; // Re-throw so EmailPopup can handle it
    }
  };

  // Handle view details
  const handleViewDetails = (request: AccessRequest) => {
    // Navigate to detail page or open detail modal
    console.log('View details for request:', request.id);
    // You could implement a detail modal or navigation here
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Access Request Management</h1>
            <p className="mt-2 text-gray-600">
              Review and manage user access requests across all accounts
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        {data?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.summary.totalRequests}</dd>
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
                      <span className="text-white font-semibold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.summary.pendingRequests}</dd>
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
                      <span className="text-white font-semibold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.summary.approvedRequests}</dd>
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
                      <span className="text-white font-semibold">👤</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Registered</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.summary.registeredUsers}</dd>
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
                      <span className="text-white font-semibold">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                      <dd className="text-lg font-medium text-gray-900">{data.summary.overdueRequests}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Access Requests Table */}
        <AccessRequestTable
          requests={data?.requests || []}
          onApprove={handleApprove}
          onDeny={handleDeny}
          onEmailClick={handleEmailClick}
          onViewDetails={handleViewDetails}
          isLoading={loading}
        />

        {/* Email Composition Popup */}
        {selectedRequest && (
          <EmailPopup
            isOpen={emailPopupOpen}
            request={selectedRequest}
            onClose={() => {
              setEmailPopupOpen(false);
              setSelectedRequest(null);
            }}
            onSend={handleSendEmail}
            accessCode={selectedRequest.access_code}
            accountName={selectedRequest.account?.name}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          loading={confirmationModal.loading}
          confirmText="Deny"
          confirmButtonColor="red"
        />
      </div>
    </div>
  );
}