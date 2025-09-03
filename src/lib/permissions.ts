/**
 * Permission utilities for unified route architecture (REQ-023)
 * Implements role-based access control logic for dashboard functionality
 */

import {
  UserRole,
  AccountRole,
  DashboardPermissions,
  PERMISSIONS,
  PermissionCheck,
  PermissionContext,
  type PermissionKey
} from '../types/permissions';
import { User, Account, AccountUser } from '../types';

/**
 * Check if a user has the required user role
 * @param user - User object with role information
 * @param requiredRole - Required user role
 * @returns PermissionCheck result
 */
export function checkUserPermission(
  user: User | null,
  requiredRole: UserRole
): PermissionCheck {
  if (!user) {
    return {
      granted: false,
      reason: 'User not authenticated',
      requiredRole
    };
  }

  // Check system admin status first (from is_admin field)
  if (requiredRole === UserRole.SYSTEM_ADMIN) {
    const isSystemAdmin = user.role === 'admin' || (user as any).is_admin === true;
    return {
      granted: isSystemAdmin,
      reason: isSystemAdmin ? undefined : 'System admin access required',
      requiredRole,
      context: {
        userId: user.id,
        userRole: user.role === 'admin' ? UserRole.ADMIN : UserRole.USER,
        isSystemAdmin
      }
    };
  }

  // Check admin role
  if (requiredRole === UserRole.ADMIN) {
    const isAdmin = user.role === 'admin' || (user as any).is_admin === true;
    return {
      granted: isAdmin,
      reason: isAdmin ? undefined : 'Admin access required',
      requiredRole,
      context: {
        userId: user.id,
        userRole: isAdmin ? UserRole.ADMIN : UserRole.USER,
        isSystemAdmin: isAdmin
      }
    };
  }

  // Basic user access
  return {
    granted: true,
    context: {
      userId: user.id,
      userRole: UserRole.USER,
      isSystemAdmin: false
    }
  };
}

/**
 * Check if a user has the required account role within an account
 * @param user - User object
 * @param account - Account object
 * @param requiredRole - Required account role
 * @param accountUser - Account user relationship (optional, will be fetched if not provided)
 * @returns PermissionCheck result
 */
export async function checkAccountPermission(
  user: User | null,
  account: Account,
  requiredRole: AccountRole,
  accountUser?: AccountUser
): Promise<PermissionCheck> {
  if (!user) {
    return {
      granted: false,
      reason: 'User not authenticated',
      requiredRole
    };
  }

  // System admins have all account permissions
  const userCheck = checkUserPermission(user, UserRole.ADMIN);
  if (userCheck.granted) {
    return {
      granted: true,
      context: {
        userId: user.id,
        accountId: account.id,
        accountRole: requiredRole,
        userRole: UserRole.ADMIN,
        isSystemAdmin: true
      }
    };
  }

  // Account owner has all permissions
  if (account.owner_id === user.id) {
    return {
      granted: true,
      context: {
        userId: user.id,
        accountId: account.id,
        accountRole: AccountRole.OWNER,
        userRole: UserRole.USER,
        isSystemAdmin: false
      }
    };
  }

  // Check specific account role hierarchy
  const roleHierarchy: Record<AccountRole, number> = {
    [AccountRole.OWNER]: 4,
    [AccountRole.ADMIN]: 3,
    [AccountRole.MEMBER]: 2,
    [AccountRole.VIEWER]: 1
  };

  const requiredLevel = roleHierarchy[requiredRole];

  // If no account user relationship provided, assume viewer level (most restrictive)
  const userRole: AccountRole = accountUser?.role || AccountRole.VIEWER;
  const userLevel = roleHierarchy[userRole];

  const hasPermission = userLevel >= requiredLevel;

  return {
    granted: hasPermission,
    reason: hasPermission ? undefined : `Account ${requiredRole} role required`,
    requiredRole,
    context: {
      userId: user.id,
      accountId: account.id,
      accountRole: userRole,
      userRole: UserRole.USER,
      isSystemAdmin: false
    }
  };
}

/**
 * Check if user can access admin features
 * @param user - User object
 * @returns boolean
 */
export function canAccessAdminFeatures(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || (user as any).is_admin === true;
}

/**
 * Check if user can manage properties in an account
 * @param user - User object
 * @param account - Account object
 * @param accountUser - Account user relationship
 * @returns boolean
 */
export async function canManageProperties(
  user: User | null,
  account: Account,
  accountUser?: AccountUser
): Promise<boolean> {
  const permission = await checkAccountPermission(user, account, AccountRole.ADMIN, accountUser);
  return permission.granted;
}

/**
 * Check if user can view analytics for an account
 * @param user - User object
 * @param account - Account object
 * @param accountUser - Account user relationship
 * @returns boolean
 */
export async function canViewAnalytics(
  user: User | null,
  account: Account,
  accountUser?: AccountUser
): Promise<boolean> {
  // Analytics require at least member role
  const permission = await checkAccountPermission(user, account, AccountRole.MEMBER, accountUser);
  return permission.granted;
}

/**
 * Get comprehensive dashboard permissions for a user in an account context
 * @param user - User object
 * @param account - Account object (optional)
 * @param accountUser - Account user relationship (optional)
 * @returns DashboardPermissions object
 */
export async function getDashboardPermissions(
  user: User | null,
  account?: Account,
  accountUser?: AccountUser
): Promise<DashboardPermissions> {
  console.log('🔍 PERMISSION_DEBUG: getDashboardPermissions called', {
    userId: user?.id,
    userRole: user?.role,
    accountId: account?.id,
    accountName: account?.name,
    accountOwnerId: account?.owner_id,
    accountUserRole: accountUser?.role,
    accountUserRoleFromAccount: account?.userRole, // Enhanced: Check userRole field (REQ-024)
    hasAccountUser: !!accountUser,
    isSystemAdmin: user ? canAccessAdminFeatures(user) : false,
    isAccountOwner: account ? account.owner_id === user?.id : false
  });

  if (!user) {
    console.log('🔍 PERMISSION_DEBUG: No user provided, returning minimal permissions');
    return {
      canAccessDashboard: false,
      canAccessItems: false,
      canAccessProperties: false,
      canAccessAnalytics: false,
      canAccessAdminFeatures: false,
      canAccessSystemAdmin: false,
      canCreateItems: false,
      canEditItems: false,
      canDeleteItems: false,
      canCreateProperties: false,
      canEditProperties: false,
      canDeleteProperties: false,
      canManageUsers: false,
      canViewAllAccounts: false,
      canManageAnalytics: false,
      canExportData: false,
      canManageAccountUsers: false,
      canManageAccountSettings: false
    };
  }

  const isSystemAdmin = canAccessAdminFeatures(user);
  const isAccountOwner = account && account.owner_id === user.id;

  // Enhanced: Use account.userRole if available, otherwise fall back to accountUser.role (REQ-024)
  let userAccountRole: AccountRole;
  if (account?.userRole) {
    userAccountRole = account.userRole;
    console.log('🔍 PERMISSION_DEBUG: Using userRole from account object', {
      userAccountRole,
      source: 'account.userRole'
    });
  } else if (accountUser?.role) {
    userAccountRole = accountUser.role;
    console.log('🔍 PERMISSION_DEBUG: Using role from accountUser object', {
      userAccountRole,
      source: 'accountUser.role'
    });
  } else {
    userAccountRole = AccountRole.VIEWER;
    console.log('🔍 PERMISSION_DEBUG: No role found, defaulting to VIEWER', {
      userAccountRole,
      source: 'default'
    });
  }

  // Basic permissions based on authentication
  const basePermissions = {
    canAccessDashboard: true,
    canAccessItems: true,
    canAccessProperties: true,
    canAccessAnalytics: true
  };

  // Admin features access
  const adminPermissions = {
    canAccessAdminFeatures: isSystemAdmin,
    canAccessSystemAdmin: isSystemAdmin,
    canManageUsers: isSystemAdmin,
    canViewAllAccounts: isSystemAdmin,
    canManageAnalytics: isSystemAdmin,
    canExportData: isSystemAdmin
  };

  // Account-specific permissions
  let accountPermissions = {
    canCreateItems: false,
    canEditItems: false,
    canDeleteItems: false,
    canCreateProperties: false,
    canEditProperties: false,
    canDeleteProperties: false,
    canManageAccountUsers: false,
    canManageAccountSettings: false
  };

  if (account) {
    const canManageProps = await canManageProperties(user, account, accountUser);
    const canViewAnalytics = await canViewAnalytics(user, account, accountUser);

    // Enhanced: Detailed logging for account permission calculations (REQ-024)
    console.log('🔍 PERMISSION_DEBUG: Calculating account permissions', {
      userAccountRole,
      isAccountOwner,
      canManageProps,
      canViewAnalytics,
      permissionCalculations: {
        canCreateItems: userAccountRole !== AccountRole.VIEWER,
        canEditItems: userAccountRole !== AccountRole.VIEWER,
        canDeleteItems: [AccountRole.OWNER, AccountRole.ADMIN].includes(userAccountRole),
        canCreateProperties: canManageProps,
        canEditProperties: canManageProps,
        canDeleteProperties: isAccountOwner || userAccountRole === AccountRole.ADMIN,
        canManageAccountUsers: isAccountOwner || userAccountRole === AccountRole.ADMIN,
        canManageAccountSettings: isAccountOwner || userAccountRole === AccountRole.ADMIN
      }
    });

    accountPermissions = {
      canCreateItems: userAccountRole !== AccountRole.VIEWER,
      canEditItems: userAccountRole !== AccountRole.VIEWER,
      canDeleteItems: [AccountRole.OWNER, AccountRole.ADMIN].includes(userAccountRole),
      canCreateProperties: canManageProps,
      canEditProperties: canManageProps,
      canDeleteProperties: isAccountOwner || userAccountRole === AccountRole.ADMIN,
      canManageAccountUsers: isAccountOwner || userAccountRole === AccountRole.ADMIN,
      canManageAccountSettings: isAccountOwner || userAccountRole === AccountRole.ADMIN
    };
  }

  const finalPermissions = {
    ...basePermissions,
    ...adminPermissions,
    ...accountPermissions
  };

  // Enhanced: Log final permissions for debugging (REQ-024)
  console.log('🔍 PERMISSION_DEBUG: Final dashboard permissions', {
    userId: user.id,
    accountId: account?.id,
    userAccountRole,
    finalPermissions: {
      // Key permissions for validation
      canAccessDashboard: finalPermissions.canAccessDashboard,
      canAccessProperties: finalPermissions.canAccessProperties,
      canCreateProperties: finalPermissions.canCreateProperties,
      canManageProperties: finalPermissions.canEditProperties || finalPermissions.canDeleteProperties,
      canManageAccountUsers: finalPermissions.canManageAccountUsers,
      canManageAccountSettings: finalPermissions.canManageAccountSettings,
      // Count total permissions granted
      totalPermissionsGranted: Object.values(finalPermissions).filter(Boolean).length
    }
  });

  return finalPermissions;
}

/**
 * Check if user has a specific permission
 * @param user - User object
 * @param permission - Permission key to check
 * @param account - Account context (optional)
 * @param accountUser - Account user relationship (optional)
 * @returns boolean
 */
export async function hasPermission(
  user: User | null,
  permission: PermissionKey,
  account?: Account,
  accountUser?: AccountUser
): Promise<boolean> {
  const permissions = await getDashboardPermissions(user, account, accountUser);

  switch (permission) {
    case PERMISSIONS.VIEW_DASHBOARD:
      return permissions.canAccessDashboard;
    case PERMISSIONS.VIEW_ITEMS:
      return permissions.canAccessItems;
    case PERMISSIONS.VIEW_PROPERTIES:
      return permissions.canAccessProperties;
    case PERMISSIONS.VIEW_ANALYTICS:
      return permissions.canAccessAnalytics;
    case PERMISSIONS.ACCESS_ADMIN_FEATURES:
      return permissions.canAccessAdminFeatures;
    case PERMISSIONS.ACCESS_SYSTEM_ADMIN:
      return permissions.canAccessSystemAdmin;
    case PERMISSIONS.CREATE_ITEMS:
      return permissions.canCreateItems;
    case PERMISSIONS.EDIT_ITEMS:
      return permissions.canEditItems;
    case PERMISSIONS.DELETE_ITEMS:
      return permissions.canDeleteItems;
    case PERMISSIONS.CREATE_PROPERTIES:
      return permissions.canCreateProperties;
    case PERMISSIONS.EDIT_PROPERTIES:
      return permissions.canEditProperties;
    case PERMISSIONS.DELETE_PROPERTIES:
      return permissions.canDeleteProperties;
    case PERMISSIONS.MANAGE_USERS:
      return permissions.canManageUsers;
    case PERMISSIONS.VIEW_ALL_ACCOUNTS:
      return permissions.canViewAllAccounts;
    case PERMISSIONS.MANAGE_ANALYTICS:
      return permissions.canManageAnalytics;
    case PERMISSIONS.EXPORT_DATA:
      return permissions.canExportData;
    case PERMISSIONS.MANAGE_ACCOUNT_USERS:
      return permissions.canManageAccountUsers;
    case PERMISSIONS.MANAGE_ACCOUNT_SETTINGS:
      return permissions.canManageAccountSettings;
    default:
      return false;
  }
}
