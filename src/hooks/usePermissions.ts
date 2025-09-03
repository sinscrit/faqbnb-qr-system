'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DashboardPermissions,
  PermissionCheck,
  PermissionContext,
  type PermissionKey
} from '../types/permissions';
import { User, Account, AccountUser } from '../types';
import {
  getDashboardPermissions,
  hasPermission,
  checkUserPermission,
  checkAccountPermission,
  canAccessAdminFeatures
} from '../lib/permissions';

/**
 * Permission hook state interface
 */
interface UsePermissionsState {
  permissions: DashboardPermissions | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  context: PermissionContext | null;
}

/**
 * Result of permission checking
 */
interface PermissionResult {
  granted: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for permission management in unified dashboard (REQ-023)
 * Provides role-based access control and permission checking utilities
 */
export function usePermissions(
  user: User | null,
  account?: Account,
  accountUser?: AccountUser
) {
  const [state, setState] = useState<UsePermissionsState>({
    permissions: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    context: null
  });

  // Debug logging for permissions hook
  const DEBUG_PREFIX = "🔐 PERMISSIONS_HOOK_DEBUG:";

  /**
   * Load comprehensive permissions for current user/account context
   */
  const loadPermissions = useCallback(async () => {
    console.log(`${DEBUG_PREFIX} LOAD_PERMISSIONS_START`, {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      accountId: account?.id,
      accountRole: accountUser?.role
    });

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permissions = await getDashboardPermissions(user, account, accountUser);

      const context: PermissionContext = {
        userId: user?.id || '',
        accountId: account?.id,
        accountRole: accountUser?.role,
        userRole: user?.role === 'admin' ? 'admin' : 'user',
        isSystemAdmin: user ? canAccessAdminFeatures(user) : false
      };

      console.log(`${DEBUG_PREFIX} LOAD_PERMISSIONS_SUCCESS`, {
        timestamp: new Date().toISOString(),
        permissions: Object.keys(permissions).filter(key => permissions[key as keyof DashboardPermissions]),
        context
      });

      setState(prev => ({
        ...prev,
        permissions,
        context,
        isLoading: false,
        lastUpdated: Date.now(),
        error: null
      }));

      return permissions;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load permissions';

      console.error(`${DEBUG_PREFIX} LOAD_PERMISSIONS_ERROR:`, error);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return null;
    }
  }, [user, account, accountUser]);

  /**
   * Check if user has a specific permission
   * @param permission - Permission key to check
   * @returns PermissionResult with granted status
   */
  const useCanAccess = useCallback((permission: PermissionKey): PermissionResult => {
    return useMemo(() => {
      if (state.isLoading) {
        return { granted: false, loading: true, error: null };
      }

      if (state.error) {
        return { granted: false, loading: false, error: state.error };
      }

      if (!state.permissions) {
        return { granted: false, loading: false, error: 'Permissions not loaded' };
      }

      const granted = hasPermissionSync(permission);

      return {
        granted,
        loading: false,
        error: null
      };
    }, [permission, state.permissions, state.isLoading, state.error]);
  }, [state.permissions, state.isLoading, state.error]);

  /**
   * Synchronous permission check (for already loaded permissions)
   */
  const hasPermissionSync = useCallback((permission: PermissionKey): boolean => {
    if (!state.permissions) return false;

    switch (permission) {
      case 'view_dashboard':
        return state.permissions.canAccessDashboard;
      case 'view_items':
        return state.permissions.canAccessItems;
      case 'view_properties':
        return state.permissions.canAccessProperties;
      case 'view_analytics':
        return state.permissions.canAccessAnalytics;
      case 'access_admin_features':
        return state.permissions.canAccessAdminFeatures;
      case 'access_system_admin':
        return state.permissions.canAccessSystemAdmin;
      case 'create_items':
        return state.permissions.canCreateItems;
      case 'edit_items':
        return state.permissions.canEditItems;
      case 'delete_items':
        return state.permissions.canDeleteItems;
      case 'create_properties':
        return state.permissions.canCreateProperties;
      case 'edit_properties':
        return state.permissions.canEditProperties;
      case 'delete_properties':
        return state.permissions.canDeleteProperties;
      case 'manage_users':
        return state.permissions.canManageUsers;
      case 'view_all_accounts':
        return state.permissions.canViewAllAccounts;
      case 'manage_analytics':
        return state.permissions.canManageAnalytics;
      case 'export_data':
        return state.permissions.canExportData;
      case 'manage_account_users':
        return state.permissions.canManageAccountUsers;
      case 'manage_account_settings':
        return state.permissions.canManageAccountSettings;
      default:
        return false;
    }
  }, [state.permissions]);

  /**
   * Check if current user is system admin
   */
  const isSystemAdmin = useMemo(() => {
    return user ? canAccessAdminFeatures(user) : false;
  }, [user]);

  /**
   * Check if current user is account owner
   */
  const isAccountOwner = useMemo(() => {
    return account && user && account.owner_id === user.id;
  }, [account, user]);

  /**
   * Get current user role in account context
   */
  const currentAccountRole = useMemo(() => {
    return accountUser?.role || null;
  }, [accountUser]);

  /**
   * Refresh permissions (useful when user/account context changes)
   */
  const refreshPermissions = useCallback(() => {
    console.log(`${DEBUG_PREFIX} REFRESH_PERMISSIONS`, {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      accountId: account?.id
    });
    loadPermissions();
  }, [loadPermissions, user?.id, account?.id]);

  /**
   * Clear permissions and reset state
   */
  const clearPermissions = useCallback(() => {
    console.log(`${DEBUG_PREFIX} CLEAR_PERMISSIONS`, {
      timestamp: new Date().toISOString()
    });

    setState({
      permissions: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
      context: null
    });
  }, []);

  /**
   * Auto-load permissions when user/account context changes
   */
  useEffect(() => {
    if (user) {
      console.log(`${DEBUG_PREFIX} CONTEXT_CHANGED_LOADING_PERMISSIONS`, {
        timestamp: new Date().toISOString(),
        userId: user.id,
        accountId: account?.id,
        accountRole: accountUser?.role
      });
      loadPermissions();
    } else {
      clearPermissions();
    }
  }, [user?.id, account?.id, accountUser?.role, loadPermissions, clearPermissions]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log(`${DEBUG_PREFIX} CLEANUP`, {
        timestamp: new Date().toISOString()
      });
    };
  }, []);

  // Return hook interface
  return {
    // State
    permissions: state.permissions,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    context: state.context,

    // Computed properties
    isSystemAdmin,
    isAccountOwner,
    currentAccountRole,

    // Permission checking
    useCanAccess,
    hasPermissionSync,

    // Actions
    loadPermissions,
    refreshPermissions,
    clearPermissions
  };
}
