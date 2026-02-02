'use client';
/* eslint-disable react-hooks/rules-of-hooks */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DashboardPermissions,
  PermissionCheck,
  PermissionContext,
  UserRole,
  type PermissionKey
} from '../types/permissions';
import { User, Account, AccountUser } from '../types';
import type { AuthUser } from '@/lib/auth';
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
  user: User | AuthUser | null,
  account?: Account | null,
  accountUser?: AccountUser
) {
  // EMERGENCY FIX DISABLED: Was forcing OWNER permissions - removed to allow proper RBAC
  console.log('🚨 EMERGENCY PERMISSIONS FIX: Checking user', user?.email);

  if (false && user?.email === 'raphajunk@outlook.com') {
    console.log('🚨 EMERGENCY FIX: Forcing OWNER permissions for raphajunk@outlook.com');

    // Return hardcoded OWNER permissions
    return {
      permissions: {
        canAccessDashboard: true,
        canAccessItems: true,
        canAccessProperties: true,
        canAccessAnalytics: true,
        canAccessAdminFeatures: false,
        canAccessSystemAdmin: false,
        canCreateItems: true,
        canEditItems: true,
        canDeleteItems: true,
        canCreateProperties: true, // FORCE TRUE
        canEditProperties: true,   // FORCE TRUE
        canDeleteProperties: true, // FORCE TRUE
        canManageUsers: false,
        canViewAllAccounts: false,
        canManageAnalytics: false,
        canExportData: false,
        canManageAccountUsers: true,   // FORCE TRUE
        canManageAccountSettings: true // FORCE TRUE
      },
      isLoading: false,
      error: null,
      lastUpdated: Date.now(),
      context: {
        userId: user?.id || '',
        accountId: account?.id || 'cceeca1b-2f0b-4a23-89ba-8daf980b26a6',
        accountRole: 'owner',
        userRole: UserRole.USER,
        isSystemAdmin: false
      },
      isSystemAdmin: false,
      isAccountOwner: true,
      currentAccountRole: 'owner',
      useCanAccess: (permission: PermissionKey) => ({
        granted: ['create_properties', 'edit_properties', 'delete_properties', 'manage_account_users', 'manage_account_settings'].includes(permission),
        loading: false,
        error: null
      }),
      hasPermissionSync: (permission: PermissionKey) => {
        return ['create_properties', 'edit_properties', 'delete_properties', 'manage_account_users', 'manage_account_settings'].includes(permission);
      },
      loadPermissions: () => Promise.resolve(),
      refreshPermissions: () => {},
      clearPermissions: () => {}
    };
  }
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
    // Enhanced: Check both accountUser.role and account.userRole for comprehensive role context (REQ-024)
    const accountRoleFromUser = accountUser?.role;
    const accountRoleFromAccount = account?.userRole;

    console.log(`${DEBUG_PREFIX} LOAD_PERMISSIONS_START`, {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      userEmail: user?.email,
      accountId: account?.id,
      accountName: account?.name,
      accountRoleFromUser: accountRoleFromUser,
      accountRoleFromAccount: accountRoleFromAccount,
      hasAccountUser: !!accountUser,
      hasAccountWithRole: !!account?.userRole,
      accountOwnerId: account?.owner_id,
      isAccountOwner: account && user ? account.owner_id === user.id : false,
      currentAccountObject: account ? {
        id: account.id,
        name: account.name,
        owner_id: account.owner_id,
        userRole: account.userRole,
        allKeys: Object.keys(account)
      } : null,
      finalRoleUsed: accountRoleFromAccount || accountRoleFromUser || null
    });

    // Enhanced: Validate account role availability (REQ-024)
    if (!accountRoleFromUser && !accountRoleFromAccount && account) {
      console.warn(`${DEBUG_PREFIX} ACCOUNT_ROLE_WARNING: No account role found`, {
        userId: user?.id,
        accountId: account.id,
        accountName: account.name,
        hasAccountUser: !!accountUser,
        accountUserRole: accountUser?.role,
        accountUserRoleField: account?.userRole
      });
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permissions = await getDashboardPermissions(user, account, accountUser);

      const resolvedUserRole =
        user?.role === 'admin' ? UserRole.ADMIN :
        user?.role === 'system_admin' ? UserRole.SYSTEM_ADMIN :
        UserRole.USER;

      const context: PermissionContext = {
        userId: user?.id || '',
        accountId: account?.id,
        // Enhanced: Use account.userRole if available, otherwise fall back to accountUser.role (REQ-024)
        accountRole: accountRoleFromAccount || accountRoleFromUser || undefined,
        userRole: resolvedUserRole,
        isSystemAdmin: user ? canAccessAdminFeatures(user) : false
      };

      console.log(`${DEBUG_PREFIX} LOAD_PERMISSIONS_SUCCESS`, {
        timestamp: new Date().toISOString(),
        permissionsGranted: Object.keys(permissions).filter(key => permissions[key as keyof DashboardPermissions]).length,
        totalPermissions: Object.keys(permissions).length,
        keyPermissions: {
          canCreateProperties: permissions.canCreateProperties,
          canEditProperties: permissions.canEditProperties,
          canDeleteProperties: permissions.canDeleteProperties,
          canManageAccountUsers: permissions.canManageAccountUsers,
          canManageAccountSettings: permissions.canManageAccountSettings
        },
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
    // Enhanced: Check both account.userRole and accountUser.role for comprehensive role context (REQ-024)
    const roleFromAccount = account?.userRole;
    const roleFromUser = accountUser?.role;

    console.log(`${DEBUG_PREFIX} CURRENT_ACCOUNT_ROLE_CALCULATION`, {
      accountId: account?.id,
      roleFromAccount,
      roleFromUser,
      finalRole: roleFromAccount || roleFromUser || null,
      source: roleFromAccount ? 'account.userRole' : roleFromUser ? 'accountUser.role' : 'none'
    });

    return roleFromAccount || roleFromUser || null;
  }, [account?.userRole, accountUser?.role, account?.id]);

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
        accountRole: account?.userRole || accountUser?.role
      });
      loadPermissions();
    } else {
      clearPermissions();
    }
  }, [user?.id, account?.id, account?.userRole, accountUser?.role, loadPermissions, clearPermissions]);

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
