'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types';

/**
 * Custom hook to redirect authenticated users away from public pages (e.g., login, landing).
 * This hook is designed to prevent rendering of public pages if a user is already logged in,
 * avoiding flashes of content and redirect loops.
 *
 * @param user The authenticated user object from AuthContext.
 * @param loading The authentication loading state from AuthContext.
 * @param redirectPath The path to redirect to if the user is authenticated (e.g., '/admin').
 */
export function useRedirectIfAuthenticated(
  user: AuthUser | null,
  loading: boolean,
  redirectPath: string
) {
  const router = useRouter();

  useEffect(() => {
    // Only perform redirect if auth state is fully loaded and a user exists.
    // This prevents redirects during initial auth checks or for unauthenticated users.
    if (!loading && user) {
      console.log(`[RedirectHook] User is authenticated, redirecting to ${redirectPath}`);
      router.push(redirectPath);
    }
  }, [user, loading, redirectPath, router]);
}
