'use client';

import { useState } from 'react';
import { AccessRequest, AccessRequestStatus, AccessRequestSource } from '@/types/admin';
import { createRegistrationLinkWithCode } from '@/lib/email-templates';

interface AccessRequestTableProps {
  requests: AccessRequest[];
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
  onEmailClick: (request: AccessRequest) => void;
  onViewDetails?: (request: AccessRequest) => void;
  onQuickApprove?: (requestId: string) => void;
  onBatchApprove?: (requestIds: string[]) => void;
  isLoading?: boolean;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Access Request Table Component
 * Part of REQ-016: System Admin Back Office
 */
export default function AccessRequestTable({
  requests,
  onApprove,
  onDeny,
  onEmailClick,
  onViewDetails,
  onQuickApprove,
  onBatchApprove,
  isLoading = false
}: AccessRequestTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'request_date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Handle sorting
  const handleSort = (field: string) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Sort and filter requests
  const sortedAndFilteredRequests = requests
    .filter(request => {
      const matchesSearch = !searchTerm || 
        request.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.requester_name && request.requester_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || request.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesSource;
    })
    .sort((a, b) => {
      const { field, direction } = sortConfig;
      let aValue: any, bValue: any;

      switch (field) {
        case 'requester_email':
          aValue = a.requester_email.toLowerCase();
          bValue = b.requester_email.toLowerCase();
          break;
        case 'request_date':
          aValue = new Date(a.request_date);
          bValue = new Date(b.request_date);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'approval_date':
          aValue = a.approval_date ? new Date(a.approval_date) : new Date(0);
          bValue = b.approval_date ? new Date(b.approval_date) : new Date(0);
          break;
        default:
          aValue = a.requester_email;
          bValue = b.requester_email;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Get source badge styling
  const getSourceBadge = (source?: AccessRequestSource) => {
    if (!source) return { style: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown', icon: '❓' };
    
    const badges = {
      [AccessRequestSource.BETA_WAITLIST]: { 
        style: 'bg-purple-100 text-purple-800 border-purple-200', 
        label: 'Beta Waitlist', 
        icon: '🚀' 
      },
      [AccessRequestSource.ADMIN_CREATED]: { 
        style: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Admin Created', 
        icon: '👑' 
      },
      [AccessRequestSource.PUBLIC_FORM]: { 
        style: 'bg-teal-100 text-teal-800 border-teal-200', 
        label: 'Public Form', 
        icon: '📝' 
      },
      [AccessRequestSource.DIRECT_REQUEST]: { 
        style: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        label: 'Direct Request', 
        icon: '📞' 
      }
    };
    
    return badges[source] || { style: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown', icon: '❓' };
  };

  // Get status badge styling
  const getStatusBadge = (status: AccessRequestStatus) => {
    const styles = {
      [AccessRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [AccessRequestStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
      [AccessRequestStatus.DENIED]: 'bg-red-100 text-red-800 border-red-200',
      [AccessRequestStatus.REGISTERED]: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Calculate timeline info
  const getTimelineInfo = (request: AccessRequest) => {
    const requestDate = new Date(request.request_date);
    const now = new Date();
    const daysSinceRequest = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let approvalTime = null;
    if (request.approval_date) {
      const approvalDate = new Date(request.approval_date);
      approvalTime = Math.floor((approvalDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      daysSinceRequest,
      approvalTime,
      isOverdue: daysSinceRequest > 7 && request.status === AccessRequestStatus.PENDING
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle batch selection
  const handleSelectRequest = (requestId: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
    setShowBatchActions(newSelected.size > 0);
  };

  // Handle copy registration link to clipboard
  const handleCopyRegistrationLink = async (request: AccessRequest, event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('handleCopyRegistrationLink called', { request, event });
    
    if (!request.access_code || !request.requester_email) {
      console.log('Missing access code or email', { access_code: request.access_code, email: request.requester_email });
      alert('Access code or email not available for this request');
      return;
    }

    // Store button reference BEFORE async operation
    const button = event.currentTarget;
    console.log('Button element captured:', button, 'Original text:', button?.textContent);

    try {
      const registrationLink = createRegistrationLinkWithCode(request.access_code, request.requester_email);
      console.log('Generated registration link:', registrationLink);
      
      await navigator.clipboard.writeText(registrationLink);
      console.log('Successfully copied to clipboard');
      
      // Show success feedback on the specific button that was clicked
      if (button && button.textContent) {
        const originalText = button.textContent;
        console.log('Changing button text from', originalText, 'to "Copied"');
        button.textContent = 'Copied';
        button.style.color = '#059669'; // green-600
        
        setTimeout(() => {
          console.log('Restoring button text to', originalText);
          button.textContent = originalText;
          button.style.color = '#059669'; // Reset to green-600
        }, 5000);
      } else {
        console.log('Button element not available for visual feedback');
      }
    } catch (error) {
      console.error('Failed to copy registration link:', error);
      // Fallback: show alert with the link
      const registrationLink = createRegistrationLinkWithCode(request.access_code, request.requester_email);
      alert(`Copy this registration link:\n\n${registrationLink}`);
    }
  };

  const handleSelectAll = () => {
    const pendingRequests = sortedAndFilteredRequests
      .filter(r => r.status === AccessRequestStatus.PENDING)
      .map(r => r.id);
    
    if (selectedRequests.size === pendingRequests.length) {
      setSelectedRequests(new Set());
      setShowBatchActions(false);
    } else {
      setSelectedRequests(new Set(pendingRequests));
      setShowBatchActions(true);
    }
  };

  const handleQuickApprove = async (requestId: string) => {
    if (onQuickApprove) {
      await onQuickApprove(requestId);
      // Remove from selection if it was selected
      const newSelected = new Set(selectedRequests);
      newSelected.delete(requestId);
      setSelectedRequests(newSelected);
      setShowBatchActions(newSelected.size > 0);
    }
  };

  const handleBatchApprove = async () => {
    if (onBatchApprove && selectedRequests.size > 0) {
      await onBatchApprove(Array.from(selectedRequests));
      setSelectedRequests(new Set());
      setShowBatchActions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Access Requests</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading access requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            Access Requests ({sortedAndFilteredRequests.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value={AccessRequestStatus.PENDING}>Pending</option>
              <option value={AccessRequestStatus.APPROVED}>Approved</option>
              <option value={AccessRequestStatus.DENIED}>Denied</option>
              <option value={AccessRequestStatus.REGISTERED}>Registered</option>
            </select>

            {/* Source filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sources</option>
              <option value={AccessRequestSource.BETA_WAITLIST}>🚀 Beta Waitlist</option>
              <option value={AccessRequestSource.ADMIN_CREATED}>👑 Admin Created</option>
              <option value={AccessRequestSource.PUBLIC_FORM}>📝 Public Form</option>
              <option value={AccessRequestSource.DIRECT_REQUEST}>📞 Direct Request</option>
            </select>

            {/* Batch Actions */}
            {showBatchActions && onBatchApprove && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600">
                  {selectedRequests.size} selected
                </span>
                <button
                  onClick={handleBatchApprove}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Batch Approve & Email
                </button>
                <button
                  onClick={() => {
                    setSelectedRequests(new Set());
                    setShowBatchActions(false);
                  }}
                  className="px-3 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onBatchApprove && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedRequests.size > 0 && selectedRequests.size === sortedAndFilteredRequests.filter(r => r.status === AccessRequestStatus.PENDING).length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('requester_email')}
              >
                <div className="flex items-center space-x-1">
                  <span>Requester</span>
                  <span className="text-gray-400">{getSortIcon('requester_email')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('request_date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Request Date</span>
                  <span className="text-gray-400">{getSortIcon('request_date')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <span className="text-gray-400">{getSortIcon('status')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('approval_date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Approval</span>
                  <span className="text-gray-400">{getSortIcon('approval_date')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredRequests.map((request) => {
              const timeline = getTimelineInfo(request);
              
              return (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  {onBatchApprove && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === AccessRequestStatus.PENDING && (
                        <input
                          type="checkbox"
                          checked={selectedRequests.has(request.id)}
                          onChange={() => handleSelectRequest(request.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {request.requester_email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.requester_email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.requester_name || 'No name provided'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatDate(request.request_date)}</div>
                    <div className="text-xs text-gray-500">
                      {timeline.daysSinceRequest} days ago
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                    {timeline.isOverdue && (
                      <div className="text-xs text-red-600 mt-1">Overdue</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const sourceBadge = getSourceBadge(request.source);
                      return (
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${sourceBadge.style}`}>
                          <span className="mr-1">{sourceBadge.icon}</span>
                          {sourceBadge.label}
                        </span>
                      );
                    })()}
                    {request.source === AccessRequestSource.BETA_WAITLIST && !request.account_id && (
                      <div className="text-xs text-purple-600 mt-1">No account assigned</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {timeline.daysSinceRequest} days since request
                    </div>
                    {timeline.approvalTime !== null && (
                      <div className="text-xs">
                        Approved in {timeline.approvalTime} days
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.approval_date ? (
                      <div>
                        <div>{formatDate(request.approval_date)}</div>
                        {request.access_code && (
                          <div className="text-xs text-blue-600 font-mono">
                            {request.access_code}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {request.status === AccessRequestStatus.PENDING && (
                        <>
                          <button
                            onClick={() => onApprove(request.id)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            Approve
                          </button>
                          {onQuickApprove && (
                            <button
                              onClick={() => handleQuickApprove(request.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors font-medium"
                              title="Quick approve and send email"
                            >
                              ⚡ Quick
                            </button>
                          )}
                          <button
                            onClick={() => onDeny(request.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Deny
                          </button>
                        </>
                      )}
                      
                      {request.status === AccessRequestStatus.APPROVED && (
                        <>
                          <button
                            onClick={() => onEmailClick(request)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Send Email
                          </button>
                          <button
                            onClick={(e) => handleCopyRegistrationLink(request, e)}
                            className="text-green-600 hover:text-green-900 transition-colors font-medium"
                            title="Copy registration link to clipboard"
                          >
                            📋 Copy Link
                          </button>
                        </>
                      )}
                      
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(request)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {sortedAndFilteredRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg mb-2">No access requests found</div>
                    <div className="text-sm">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'No access requests have been submitted yet'
                      }
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Summary footer */}
      {requests.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">
                {requests.filter(r => r.status === AccessRequestStatus.PENDING).length}
              </span> pending
            </div>
            <div>
              <span className="font-medium">
                {requests.filter(r => r.status === AccessRequestStatus.APPROVED).length}
              </span> approved
            </div>
            <div>
              <span className="font-medium">
                {requests.filter(r => r.status === AccessRequestStatus.REGISTERED).length}
              </span> registered
            </div>
            <div>
              <span className="font-medium">
                {requests.filter(r => getTimelineInfo(r).isOverdue).length}
              </span> overdue
            </div>
          </div>
        </div>
      )}
    </div>
  );
}