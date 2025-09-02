'use client';

import { Building2, Users, Crown, UserCheck } from 'lucide-react';

interface AccountAccessSummaryProps {
  ownedAccounts: Array<{
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    created_at: string;
  }>;
  accessibleAccounts: Array<{
    id: string;
    name: string;
    description: string | null;
    userRole: string;
    ownerName: string;
    memberCount: number;
    created_at: string;
  }>;
  summary: {
    totalOwnedAccounts: number;
    totalAccessibleAccounts: number;
    totalUsersWithAccess: number;
    totalMemberAccounts: number;
  };
  loading?: boolean;
}

export default function AccountAccessSummary({
  ownedAccounts,
  accessibleAccounts,
  summary,
  loading
}: AccountAccessSummaryProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Account Access</h3>
        <Users className="w-8 h-8 text-green-600" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Crown className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{summary.totalOwnedAccounts}</p>
          <p className="text-xs text-blue-700">Accounts Owned</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{summary.totalAccessibleAccounts}</p>
          <p className="text-xs text-green-700">Accounts Accessed</p>
        </div>
      </div>

      {/* Owned Accounts */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Crown className="w-4 h-4 mr-2 text-blue-600" />
          Accounts You Own
        </h4>
        <div className="space-y-3">
          {ownedAccounts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No owned accounts</p>
            </div>
          ) : (
            ownedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-900">{account.name}</p>
                      {account.description && (
                        <p className="text-xs text-blue-700 mt-1">{account.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-blue-600">
                    <Users className="w-3 h-3 mr-1" />
                    {account.memberCount} members
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Owner
                  </span>
                  <p className="text-xs text-blue-600 mt-1">
                    Created {new Date(account.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Accessible Accounts */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <UserCheck className="w-4 h-4 mr-2 text-green-600" />
          Accounts You Access
        </h4>
        <div className="space-y-3">
          {accessibleAccounts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No accessible accounts</p>
            </div>
          ) : (
            accessibleAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">{account.name}</p>
                      {account.description && (
                        <p className="text-xs text-green-700 mt-1">{account.description}</p>
                      )}
                      <p className="text-xs text-green-600 mt-1">by {account.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-green-600">
                    <Users className="w-3 h-3 mr-1" />
                    {account.memberCount} members
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.userRole === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : account.userRole === 'member'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.userRole}
                  </span>
                  <p className="text-xs text-green-600 mt-1">
                    Since {new Date(account.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Total Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total Accounts:</span>
          <span className="font-semibold">{summary.totalMemberAccounts}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
          <span>Total Users with Access:</span>
          <span className="font-semibold">{summary.totalUsersWithAccess}</span>
        </div>
      </div>
    </div>
  );
}