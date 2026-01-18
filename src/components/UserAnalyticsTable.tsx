'use client';

import { useState } from 'react';
import { UserAnalytics, UserFilters } from '@/types/admin';

interface UserAnalyticsTableProps {
  users: UserAnalytics[];
  onSort?: (field: string) => void;
  onFilter?: (filters: UserFilters) => void;
  isLoading?: boolean;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Reusable User Analytics Table Component
 * Part of REQ-016: System Admin Back Office
 */
export default function UserAnalyticsTable({
  users,
  onSort,
  onFilter,
  isLoading = false
}: UserAnalyticsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'email', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});

  // Handle sorting
  const handleSort = (field: string) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
    
    if (onSort) {
      onSort(`${field}:${direction}`);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const newFilters = { ...filters, email: value };
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (onFilter) {
      onFilter(updatedFilters);
    }
  };

  // Sort users locally if no external sort handler
  const sortedUsers = onSort ? users : [...users].sort((a, b) => {
    const { field, direction } = sortConfig;
    let aValue: any, bValue: any;

    switch (field) {
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'ownedAccounts':
        aValue = a.ownedAccounts.count;
        bValue = b.ownedAccounts.count;
        break;
      case 'accessAccounts':
        aValue = a.accessAccounts.count;
        bValue = b.accessAccounts.count;
        break;
      case 'totalItems':
        aValue = a.ownedAccounts.totalItems + a.accessAccounts.totalItems;
        bValue = b.ownedAccounts.totalItems + b.accessAccounts.totalItems;
        break;
      case 'totalVisits':
        aValue = a.ownedAccounts.totalVisits + a.accessAccounts.totalVisits;
        bValue = b.ownedAccounts.totalVisits + b.accessAccounts.totalVisits;
        break;
      default:
        aValue = a.email;
        bValue = b.email;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter users locally if no external filter handler
  const filteredUsers = onFilter ? sortedUsers : sortedUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOwnedAccounts = !filters.hasOwnedAccounts || user.ownedAccounts.count > 0;
    const matchesAccessAccounts = !filters.hasAccessAccounts || user.accessAccounts.count > 0;
    
    const totalVisits = user.ownedAccounts.totalVisits + user.accessAccounts.totalVisits;
    const matchesMinVisits = !filters.minVisits || totalVisits >= filters.minVisits;
    const matchesMaxVisits = !filters.maxVisits || totalVisits <= filters.maxVisits;

    return matchesSearch && matchesOwnedAccounts && matchesAccessAccounts && 
           matchesMinVisits && matchesMaxVisits;
  });

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">User Analytics</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading user analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with search and filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-medium text-gray-900">User Analytics</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Quick filters */}
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange({ 
                  hasOwnedAccounts: !filters.hasOwnedAccounts ? true : undefined 
                })}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  filters.hasOwnedAccounts 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Has Owned
              </button>
              <button
                onClick={() => handleFilterChange({ 
                  hasAccessAccounts: !filters.hasAccessAccounts ? true : undefined 
                })}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  filters.hasAccessAccounts 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Has Access
              </button>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-2 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  <span className="text-gray-400">{getSortIcon('email')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ownedAccounts')}
              >
                <div className="flex items-center space-x-1">
                  <span>Owned Accounts</span>
                  <span className="text-gray-400">{getSortIcon('ownedAccounts')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('accessAccounts')}
              >
                <div className="flex items-center space-x-1">
                  <span>Access Accounts</span>
                  <span className="text-gray-400">{getSortIcon('accessAccounts')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalItems')}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Items</span>
                  <span className="text-gray-400">{getSortIcon('totalItems')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalVisits')}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Visits</span>
                  <span className="text-gray-400">{getSortIcon('totalVisits')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.fullName || 'No name provided'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{user.ownedAccounts.count}</span>
                    {user.ownedAccounts.count > 0 && (
                      <div className="text-xs text-gray-500">
                        {user.ownedAccounts.totalItems} items, {user.ownedAccounts.totalVisits} visits
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{user.accessAccounts.count}</span>
                    {user.accessAccounts.count > 0 && (
                      <div className="text-xs text-gray-500">
                        {user.accessAccounts.totalItems} items, {user.accessAccounts.totalVisits} visits
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium">
                    {user.ownedAccounts.totalItems + user.accessAccounts.totalItems}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium">
                    {user.ownedAccounts.totalVisits + user.accessAccounts.totalVisits}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 transition-colors">
                      View Details
                    </button>
                    <button className="text-green-600 hover:text-green-900 transition-colors">
                      Manage Access
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg mb-2">No users found</div>
                    <div className="text-sm">
                      {searchTerm || Object.keys(filters).length > 0
                        ? 'Try adjusting your search or filters'
                        : 'No user data available'
                      }
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}