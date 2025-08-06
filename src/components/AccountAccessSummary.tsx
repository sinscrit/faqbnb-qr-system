'use client';

interface AccountSummary {
  id: string;
  name: string;
  role?: string;
  itemCount: number;
  visitCount: number;
  createdAt?: string;
  accessGrantedAt?: string;
}

interface AccountAccessSummaryProps {
  userId: string;
  ownedAccounts: AccountSummary[];
  accessAccounts: AccountSummary[];
}

/**
 * Account Access Summary Component
 * Part of REQ-016: System Admin Back Office
 */
export default function AccountAccessSummary({
  userId,
  ownedAccounts,
  accessAccounts
}: AccountAccessSummaryProps) {
  
  // Get role badge styling
  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
      member: 'bg-blue-100 text-blue-800 border-blue-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return styles[role as keyof typeof styles] || styles.viewer;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get activity level based on visits
  const getActivityLevel = (visitCount: number) => {
    if (visitCount === 0) return { level: 'No Activity', color: 'text-gray-500' };
    if (visitCount < 10) return { level: 'Low Activity', color: 'text-yellow-600' };
    if (visitCount < 50) return { level: 'Moderate Activity', color: 'text-blue-600' };
    return { level: 'High Activity', color: 'text-green-600' };
  };

  const AccountCard = ({ 
    account, 
    isOwned = false 
  }: { 
    account: AccountSummary; 
    isOwned?: boolean;
  }) => {
    const activity = getActivityLevel(account.visitCount);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {account.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {isOwned ? 'Account Owner' : `Access Role: ${account.role || 'Member'}`}
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            {isOwned ? (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Owner
              </span>
            ) : (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(account.role || 'member')}`}>
                {account.role || 'Member'}
              </span>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {account.itemCount}
            </div>
            <div className="text-sm text-blue-800 font-medium">Items</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {account.visitCount}
            </div>
            <div className="text-sm text-green-800 font-medium">Visits</div>
          </div>
        </div>

        {/* Activity Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              activity.level === 'No Activity' ? 'bg-gray-400' :
              activity.level === 'Low Activity' ? 'bg-yellow-400' :
              activity.level === 'Moderate Activity' ? 'bg-blue-400' : 'bg-green-400'
            }`}></div>
            <span className={`text-sm font-medium ${activity.color}`}>
              {activity.level}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            {isOwned ? `Created ${formatDate(account.createdAt)}` : 
                     `Access granted ${formatDate(account.accessGrantedAt)}`}
          </div>
        </div>

        {/* Progress bar for visit activity */}
        {account.visitCount > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Visit Activity</span>
              <span>{account.visitCount} total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  activity.level === 'Low Activity' ? 'bg-yellow-400' :
                  activity.level === 'Moderate Activity' ? 'bg-blue-400' : 'bg-green-400'
                }`}
                style={{ 
                  width: `${Math.min(100, (account.visitCount / 100) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const totalOwnedItems = ownedAccounts.reduce((sum, acc) => sum + acc.itemCount, 0);
  const totalOwnedVisits = ownedAccounts.reduce((sum, acc) => sum + acc.visitCount, 0);
  const totalAccessItems = accessAccounts.reduce((sum, acc) => sum + acc.itemCount, 0);
  const totalAccessVisits = accessAccounts.reduce((sum, acc) => sum + acc.visitCount, 0);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Access Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{ownedAccounts.length}</div>
            <div className="text-sm text-gray-600">Owned Accounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{accessAccounts.length}</div>
            <div className="text-sm text-gray-600">Access Accounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalOwnedItems + totalAccessItems}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalOwnedVisits + totalAccessVisits}</div>
            <div className="text-sm text-gray-600">Total Visits</div>
          </div>
        </div>
      </div>

      {/* Owned Accounts Section */}
      {ownedAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Owned Accounts ({ownedAccounts.length})
            </h2>
            <div className="text-sm text-gray-500">
              {totalOwnedItems} items • {totalOwnedVisits} visits
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedAccounts.map((account) => (
              <AccountCard 
                key={account.id} 
                account={account} 
                isOwned={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Access Accounts Section */}
      {accessAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Access Accounts ({accessAccounts.length})
            </h2>
            <div className="text-sm text-gray-500">
              {totalAccessItems} items • {totalAccessVisits} visits
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessAccounts.map((account) => (
              <AccountCard 
                key={account.id} 
                account={account} 
                isOwned={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {ownedAccounts.length === 0 && accessAccounts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Account Access</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            This user doesn't own any accounts or have access to any shared accounts yet.
          </p>
        </div>
      )}
    </div>
  );
}