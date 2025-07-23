'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

interface LoadingSpinnerProps {
  message?: string;
}

// Loading spinner component
function LoadingSpinner({ message = 'Authenticating...' }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{message}</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we verify your credentials</p>
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

/**
 * AuthGuard component to protect routes with authentication
 * 
 * @param children - Components to render if authenticated
 * @param requireAdmin - Whether admin role is required (default: true)
 * @param fallback - Custom component to render during loading
 * @param redirectTo - Custom redirect path (default: /login)
 */
export default function AuthGuard({
  children,
  requireAdmin = true,
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { user, loading, isAdmin: userIsAdmin } = useAuth();

  useEffect(() => {
    // Note: Redirect logic removed - middleware handles authentication
    // This prevents redirect loops between client and server auth
    if (!loading && !user) {
      console.log('AuthGuard: User not authenticated (middleware should handle redirect)');
    }
  }, [user, loading]);

  // Show loading state
  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  // No user authenticated
  if (!user) {
    return (
      <UnauthorizedAccess message="You must be logged in to access this page." />
    );
  }

  // Check admin requirement
  if (requireAdmin && !userIsAdmin) {
    return (
      <UnauthorizedAccess message="Admin privileges are required to access this page." />
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

/**
 * Higher-order component version of AuthGuard
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
 * Hook to check authentication status and throw if not authenticated
 */
export function useRequireAuth(requireAdmin: boolean = true) {
  const { user, loading, isAdmin: userIsAdmin } = useAuth();

  if (loading) {
    throw new Error('Authentication is still loading');
  }

  if (!user) {
    throw new Error('User must be authenticated');
  }

  if (requireAdmin && !userIsAdmin) {
    throw new Error('Admin privileges required');
  }

  return user;
}

/**
 * Component for protected admin sections
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin: userIsAdmin, loading } = useAuth();

  if (loading) {
    return fallback || <LoadingSpinner message="Checking permissions..." />;
  }

  if (!userIsAdmin) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Session timeout warning component
 */
export function SessionTimeoutWarning() {
  const { user, session, refreshSession } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  // Check if session is expiring soon
  useEffect(() => {
    if (!session || !user) {
      setIsExpiringSoon(false);
      setIsVisible(false);
      return;
    }

    const checkExpiry = () => {
      if (!session.expires_at) return false;

      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      return expiresAt <= fiveMinutesFromNow;
    };

    const expiring = checkExpiry();
    setIsExpiringSoon(expiring);
    
    // Show warning only when session is expiring soon
    if (expiring) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [session, user]);

  if (!user || !session || !isExpiringSoon || !isVisible) return null;

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      setIsVisible(false); // Hide after refreshing
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsExpiringSoon(false); // Don't show again until next check
  };

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-yellow-800">Session Expiring Soon</h3>
            <button
              onClick={handleClose}
              className="ml-2 flex-shrink-0 text-yellow-400 hover:text-yellow-600 transition-colors"
              aria-label="Close notification"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Your session will expire soon. Would you like to extend it?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleRefreshSession}
              className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md transition-colors"
            >
              Extend Session
            </button>
            <button
              onClick={handleClose}
              className="text-sm text-yellow-600 hover:text-yellow-800 px-3 py-1 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 