'use client';

import { useState } from 'react';
import { Users, Crown, UserCheck, Building2, Calendar } from 'lucide-react';

interface UserAccessTableProps {
  usersWithAccess: Array<{
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    accountId: string;
    accountName: string;
    userRoleInAccount: string;
    joinedAt: string;
  }>;
  loading?: boolean;
}

export default function UserAccessTable({ usersWithAccess, loading }: UserAccessTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'account' | 'role' | 'joined'>('joined');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedUsers = [...usersWithAccess].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (sortBy) {
      case 'name':
        aValue = a.fullName || a.email;
        bValue = b.fullName || b.email;
        break;
      case 'account':
        aValue = a.accountName;
        bValue = b.accountName;
        break;
      case 'role':
        aValue = a.userRoleInAccount;
        bValue = b.userRoleInAccount;
        break;
      case 'joined':
        aValue = a.joinedAt;
        bValue = b.joinedAt;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3" />;
      case 'admin':
        return <UserCheck className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  if (usersWithAccess.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Users with Account Access</h3>
          <Users className="w-8 h-8 text-orange-600" />
        </div>
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Users with Access</h4>
          <p className="text-gray-600">No other users currently have access to your accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Users with Account Access</h3>
        <Users className="w-8 h-8 text-orange-600" />
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserCheck className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-900">
              {usersWithAccess.length} user{usersWithAccess.length !== 1 ? 's' : ''} with access
            </span>
          </div>
          <div className="text-xs text-orange-700">
            Across {new Set(usersWithAccess.map(u => u.accountId)).size} account{new Set(usersWithAccess.map(u => u.accountId)).size !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-4 flex items-center space-x-4 text-sm">
        <span className="text-gray-600">Sort by:</span>
        <button
          onClick={() => handleSort('name')}
          className={`px-3 py-1 rounded ${sortBy === 'name' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('account')}
          className={`px-3 py-1 rounded ${sortBy === 'account' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Account {sortBy === 'account' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('role')}
          className={`px-3 py-1 rounded ${sortBy === 'role' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('joined')}
          className={`px-3 py-1 rounded ${sortBy === 'joined' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Joined {sortBy === 'joined' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* User List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedUsers.map((user) => (
          <div key={`${user.id}-${user.accountId}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-sm font-semibold text-orange-800">
                  {(user.fullName || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="font-medium text-gray-900">{user.fullName || user.email}</p>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center mt-1">
                  <Building2 className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{user.accountName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center justify-end mb-1">
                  {getRoleIcon(user.userRoleInAccount)}
                  <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.userRoleInAccount)}`}>
                    {user.userRoleInAccount}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(user.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-600">Total Users</p>
            <p className="text-lg font-semibold text-gray-900">{usersWithAccess.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Unique Accounts</p>
            <p className="text-lg font-semibold text-gray-900">{new Set(usersWithAccess.map(u => u.accountId)).size}</p>
          </div>
          <div>
            <p className="text-gray-600">Role Distribution</p>
            <div className="flex justify-center space-x-1 mt-1">
              {Object.entries(
                usersWithAccess.reduce((acc, user) => {
                  acc[user.userRoleInAccount] = (acc[user.userRoleInAccount] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([role, count]) => (
                <span key={role} className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {role}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
