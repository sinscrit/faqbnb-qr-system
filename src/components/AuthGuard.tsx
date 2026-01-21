'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
// REQ-023: Unified Route Architecture - Permission System Integration
import { DashboardSection, PERMISSIONS, type PermissionKey } from '@/types/permissions';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSystemAdmin?: boolean;
  requiredPermissions?: PermissionKey[];
  requiredDashboardSection?: DashboardSection;
  fallback?: ReactNode;
  redirectTo?: string;
  permissionFallback?: ReactNode;
}

interface LoadingSpinnerProps {
  message?: string;
}

// Loading spinner component
function LoadingSpinner({ message }: LoadingSpinnerProps) {
  const tLoading = useTranslations('common.loading');
  const displayMessage = message ?? tLoading('auth.authenticating');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{displayMessage}</p>
        <p className="text-gray-500 text-sm mt-2">{tLoading('auth.verifyingCredentials')}</p>
      </div>
    </div>
  );
}

// Unauthorized access component
function UnauthorizedAccess({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

// Permission denied component for insufficient permissions
function PermissionDenied({ message, requiredPermission }: { message: string; requiredPermission?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-9V5a2 2 0 00-2-2h-4.586a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-4.586a1 1 0 01.293-.707l2.414-2.414a1 1 0 01.707-.293H21"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h1>
        <p className="text-gray-600 mb-2">{message}</p>
        {requiredPermission && (
          <p className="text-sm text-gray-500 mb-6">
            Required permission: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{requiredPermission}</code>
          </p>
        )}
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign Out & Login
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AuthGuard component to protect routes with authentication and permissions (REQ-023)
 *
 * @param children - Components to render if authenticated and authorized
 * @param requireAdmin - Whether admin role is required (legacy)
 * @param requireSystemAdmin - Whether system admin role is required
 * @param requiredPermissions - Array of permission keys that are required
 * @param requiredDashboardSection - Specific dashboard section access requirement
 * @param fallback - Custom component to render during loading
 * @param permissionFallback - Custom component for permission denied
 * @param redirectTo - Custom redirect path (default: /login)
 */
export default function AuthGuard({
  children,
  requireAdmin = false,
  requireSystemAdmin = false,
  requiredPermissions = [],
  requiredDashboardSection,
  fallback,
  permissionFallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const {
    user,
    loading,
    isAdmin: userIsAdmin,
    hasPermission,
    permissionsLoading,
    canNavigateToSection,
    dashboardPermissions
  } = useAuth();

  useEffect(() => {
    // Note: Redirect logic removed - middleware handles authentication
    // This prevents redirect loops between client and server auth
    if (!loading && !user) {
      console.log('AuthGuard: User not authenticated (middleware should handle redirect)');
    }
  }, [user, loading]);

  // Show loading state
  if (loading || permissionsLoading) {
    return fallback || <LoadingSpinner />;
  }

  // No user authenticated
  if (!user) {
    return (
      <UnauthorizedAccess message="You must be logged in to access this page." />
    );
  }

  // Check system admin requirement (highest priority)
  if (requireSystemAdmin && !userIsAdmin) {
    return permissionFallback || (
      <PermissionDenied
        message="System administrator privileges are required to access this page."
        requiredPermission={PERMISSIONS.ACCESS_SYSTEM_ADMIN}
      />
    );
  }

  // Check admin requirement (legacy support)
  if (requireAdmin && !userIsAdmin) {
    return permissionFallback || (
      <PermissionDenied
        message="Administrator privileges are required to access this page."
        requiredPermission={PERMISSIONS.ACCESS_ADMIN_FEATURES}
      />
    );
  }

  // Check specific permission requirements
  if (requiredPermissions.length > 0) {
    const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));

    if (missingPermissions.length > 0) {
      const firstMissing = missingPermissions[0];
      return permissionFallback || (
        <PermissionDenied
          message={`You don't have the required permissions to access this page.`}
          requiredPermission={firstMissing}
        />
      );
    }
  }

  // Check dashboard section access
  if (requiredDashboardSection && !canNavigateToSection(requiredDashboardSection)) {
    return permissionFallback || (
      <PermissionDenied
        message={`You don't have access to the ${requiredDashboardSection} section.`}
        requiredPermission={`Access to ${requiredDashboardSection}`}
      />
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

/**
 * Higher-order component version of AuthGuard with permission support (REQ-023)
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function GuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Higher-order component for admin-only access (legacy support)
 */
export function withAdminGuard<P extends object>(Component: React.ComponentType<P>) {
  return withAuthGuard(Component, { requireAdmin: true });
}

/**
 * Higher-order component for system admin-only access (REQ-023)
 */
export function withSystemAdminGuard<P extends object>(Component: React.ComponentType<P>) {
  return withAuthGuard(Component, { requireSystemAdmin: true });
}

/**
 * Higher-order component for permission-based access (REQ-023)
 */
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: PermissionKey[]
) {
  return withAuthGuard(Component, { requiredPermissions });
}

/**
 * Hook to check authentication status and throw if not authenticated (REQ-023 enhanced)
 */
export function useRequireAuth(requireAdmin: boolean = false, requiredPermissions: PermissionKey[] = []) {
  const {
    user,
    loading,
    permissionsLoading,
    isAdmin: userIsAdmin,
    hasPermission
  } = useAuth();

  if (loading || permissionsLoading) {
    throw new Error('Authentication is still loading');
  }

  if (!user) {
    throw new Error('User must be authenticated');
  }

  if (requireAdmin && !userIsAdmin) {
    throw new Error('Admin privileges required');
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));
    if (missingPermissions.length > 0) {
      throw new Error(`Missing required permissions: ${missingPermissions.join(', ')}`);
    }
  }

  return user;
}

/**
 * Hook to require system admin privileges (REQ-023)
 */
export function useRequireSystemAdmin() {
  return useRequireAuth(true); // requireAdmin = true means system admin
}

/**
 * Hook to require specific permissions (REQ-023)
 */
export function useRequirePermissions(requiredPermissions: PermissionKey[]) {
  return useRequireAuth(false, requiredPermissions);
}

/**
 * Component for protected admin sections (legacy support)
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin: userIsAdmin, loading } = useAuth();

  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  if (!userIsAdmin) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Component for protected system admin sections (REQ-023)
 */
export function SystemAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin: userIsAdmin, loading } = useAuth();

  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  if (!userIsAdmin) {
    return fallback || (
      <PermissionDenied
        message="System administrator privileges are required to access this section."
        requiredPermission={PERMISSIONS.ACCESS_SYSTEM_ADMIN}
      />
    );
  }

  return <>{children}</>;
}

/**
 * Component for permission-based conditional rendering (REQ-023)
 */
export function PermissionGate({
  children,
  permissions,
  fallback
}: {
  children: ReactNode;
  permissions: PermissionKey[];
  fallback?: ReactNode;
}) {
  const { hasPermission, permissionsLoading } = useAuth();

  if (permissionsLoading) {
    return fallback || <LoadingSpinner />;
  }

  const hasAllPermissions = permissions.every(permission => hasPermission(permission));

  if (!hasAllPermissions) {
    return fallback || null;
  }

  return <>{children}</>;
} 