/**
 * Permission system types for unified route architecture (REQ-023)
 * Defines role-based access control for dashboard functionality
 */

// User roles from users table
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SYSTEM_ADMIN = 'system_admin'
}

// Account roles from account_users table
export enum AccountRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// Permission level interface combining user and account context
export interface PermissionLevel {
  userRole: UserRole;
  accountRole?: AccountRole;
  accountId?: string;
  isSystemAdmin: boolean;
}

// Dashboard-specific permissions interface
export interface DashboardPermissions {
  // Basic navigation permissions
  canAccessDashboard: boolean;
  canAccessItems: boolean;
  canAccessProperties: boolean;
  canAccessAnalytics: boolean;

  // Administrative permissions
  canAccessAdminFeatures: boolean;
  canAccessSystemAdmin: boolean;

  // CRUD permissions
  canCreateItems: boolean;
  canEditItems: boolean;
  canDeleteItems: boolean;
  canCreateProperties: boolean;
  canEditProperties: boolean;
  canDeleteProperties: boolean;

  // Advanced permissions
  canManageUsers: boolean;
  canViewAllAccounts: boolean;
  canManageAnalytics: boolean;
  canExportData: boolean;

  // Account-specific permissions
  canManageAccountUsers: boolean;
  canManageAccountSettings: boolean;
}

// Permission constants for consistent checking
export const PERMISSIONS = {
  // Navigation permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ITEMS: 'view_items',
  VIEW_PROPERTIES: 'view_properties',
  VIEW_ANALYTICS: 'view_analytics',

  // Administrative permissions
  ACCESS_ADMIN_FEATURES: 'access_admin_features',
  ACCESS_SYSTEM_ADMIN: 'access_system_admin',

  // CRUD permissions
  CREATE_ITEMS: 'create_items',
  EDIT_ITEMS: 'edit_items',
  DELETE_ITEMS: 'delete_items',
  CREATE_PROPERTIES: 'create_properties',
  EDIT_PROPERTIES: 'edit_properties',
  DELETE_PROPERTIES: 'delete_properties',

  // Advanced permissions
  MANAGE_USERS: 'manage_users',
  VIEW_ALL_ACCOUNTS: 'view_all_accounts',
  MANAGE_ANALYTICS: 'manage_analytics',
  EXPORT_DATA: 'export_data',

  // Account-specific permissions
  MANAGE_ACCOUNT_USERS: 'manage_account_users',
  MANAGE_ACCOUNT_SETTINGS: 'manage_account_settings'
} as const;

// Type for permission keys
export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Permission context for role-based decisions
export interface PermissionContext {
  userId: string;
  accountId?: string;
  accountRole?: AccountRole;
  userRole: UserRole;
  isSystemAdmin: boolean;
}

// Permission check result
export interface PermissionCheck {
  granted: boolean;
  reason?: string;
  requiredRole?: UserRole | AccountRole;
  context?: PermissionContext;
}

// Dashboard section types for navigation tracking (REQ-023)
// Used by RoleBasedNavigation, DashboardLayout, and AuthGuard components
// Last Modified: 2026-01-12
export const DashboardSection = {
  dashboard: 'dashboard',
  items: 'items',
  properties: 'properties',
  analytics: 'analytics',
  systemAdmin: 'system-admin',
  instructions: 'instructions', // REQ-195: Instructions page
} as const;

export type DashboardSection = typeof DashboardSection[keyof typeof DashboardSection];
