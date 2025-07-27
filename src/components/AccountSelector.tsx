'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { Account } from '@/types';

// Account Selector Component Props
interface AccountSelectorProps {
  onAccountChange?: (account: Account | null) => void;
  disabled?: boolean;
  showAccountInfo?: boolean;
  className?: string;
}

// Account display component
interface AccountDisplayProps {
  account: Account;
  userRole?: string;
  isOwner?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showInfo?: boolean;
}

function AccountDisplay({ account, userRole, isOwner, isSelected, onClick, showInfo = true }: AccountDisplayProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 cursor-pointer transition-colors rounded-lg ${
        isSelected
          ? 'bg-blue-50 border-blue-200 border-2'
          : 'hover:bg-gray-50 border border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
          <BuildingOfficeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
              {account.name}
            </p>
            {isOwner && <span className="text-yellow-500">👑</span>}
          </div>
          {showInfo && account.description && (
            <p className={`text-xs truncate ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
              {account.description}
            </p>
          )}
          {showInfo && userRole && (
            <div className="flex items-center space-x-1 mt-1">
              <UserIcon className={`h-3 w-3 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            </div>
          )}
        </div>
      </div>
      {isSelected && (
        <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
      )}
    </div>
  );
}

// Main Account Selector Component
export function AccountSelector({ 
  onAccountChange, 
  disabled = false, 
  showAccountInfo = true, 
  className = '' 
}: AccountSelectorProps) {
  const { user } = useAuth();
  const { currentAccount, userAccounts, switchingAccount, switchToAccount } = useAccountContext();
  const [isOpen, setIsOpen] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Handle account switching
  const handleAccountSwitch = async (account: Account) => {
    try {
      setSwitchError(null);
      setIsOpen(false);
      
      if (account.id === currentAccount?.id) {
        return; // Already selected
      }

      console.log('Switching to account:', account.name);
      const result = await switchToAccount(account.id);
      
      if (!result.success) {
        setSwitchError(result.error || 'Failed to switch account');
        console.error('Account switch failed:', result.error);
        return;
      }

      // Notify parent component of account change
      if (onAccountChange) {
        onAccountChange(account);
      }

      console.log('Successfully switched to account:', account.name);
    } catch (error) {
      console.error('Account switch error:', error);
      setSwitchError('An unexpected error occurred');
    }
  };

  // Get user role in current account
  const getCurrentAccountRole = (accountId: string): string => {
    if (!user?.currentAccount) return 'member';
    return user.currentAccount.role;
  };

  // Check if user is owner of account
  const isAccountOwner = (account: Account): boolean => {
    return account.owner_id === user?.id;
  };

  // Don't render if no user or no accounts
  if (!user || userAccounts.length === 0) {
    return null;
  }

  // Single account - show as info display only
  if (userAccounts.length === 1) {
    const account = userAccounts[0];
    const userRole = getCurrentAccountRole(account.id);
    const isOwner = isAccountOwner(account);

    return (
      <div className={`${className}`}>
        <div className="text-xs font-medium text-gray-700 mb-2">Current Account</div>
        <AccountDisplay
          account={account}
          userRole={userRole}
          isOwner={isOwner}
          isSelected={true}
          showInfo={showAccountInfo}
        />
        {switchError && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {switchError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="text-xs font-medium text-gray-700 mb-2">Account</div>
      
      {/* Current Account Display / Dropdown Trigger */}
      <button
        type="button"
        className={`w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          disabled || switchingAccount ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => !disabled && !switchingAccount && setIsOpen(!isOpen)}
        disabled={disabled || switchingAccount}
      >
        {currentAccount ? (
          <AccountDisplay
            account={currentAccount}
            userRole={getCurrentAccountRole(currentAccount.id)}
            isOwner={isAccountOwner(currentAccount)}
            isSelected={false}
            showInfo={showAccountInfo}
          />
        ) : (
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Select an account...</span>
            </div>
          </div>
        )}
        
        {!disabled && !switchingAccount && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </button>

      {/* Loading State */}
      {switchingAccount && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !disabled && !switchingAccount && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-700 mb-2 px-1">Switch Account</div>
            <div className="space-y-1">
              {userAccounts.map((account) => (
                <AccountDisplay
                  key={account.id}
                  account={account}
                  userRole={getCurrentAccountRole(account.id)}
                  isOwner={isAccountOwner(account)}
                  isSelected={account.id === currentAccount?.id}
                  onClick={() => handleAccountSwitch(account)}
                  showInfo={showAccountInfo}
                />
              ))}
            </div>
            
            {/* Account Summary */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 px-1">
                {userAccounts.length} account{userAccounts.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {switchError && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{switchError}</span>
          </div>
          <button 
            className="mt-1 text-xs text-red-700 hover:text-red-800 underline"
            onClick={() => setSwitchError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Click Outside Handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Compact Account Selector for headers/toolbars
export function CompactAccountSelector({ 
  onAccountChange, 
  disabled = false, 
  className = '' 
}: Omit<AccountSelectorProps, 'showAccountInfo'>) {
  return (
    <AccountSelector
      onAccountChange={onAccountChange}
      disabled={disabled}
      showAccountInfo={false}
      className={`max-w-sm ${className}`}
    />
  );
}

// Account Info Display (read-only)
export function AccountInfo({ className = '' }: { className?: string }) {
  const { currentAccount, userAccounts } = useAccountContext();
  const { user } = useAuth();

  if (!currentAccount || !user) {
    return null;
  }

  const isOwner = currentAccount.owner_id === user.id;
  const userRole = user.currentAccount?.role || 'member';

  return (
    <div className={`${className}`}>
      <div className="text-xs font-medium text-gray-700 mb-2">Current Account</div>
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
        <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentAccount.name}
            </p>
            {isOwner && <span className="text-yellow-500">👑</span>}
          </div>
          {currentAccount.description && (
            <p className="text-xs text-gray-600 truncate">
              {currentAccount.description}
            </p>
          )}
          <div className="flex items-center space-x-1 mt-1">
            <UserIcon className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            <span className="text-xs text-gray-400">
              • {userAccounts.length} account{userAccounts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSelector; 