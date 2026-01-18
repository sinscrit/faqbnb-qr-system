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
    const DEBUG_PREFIX = "🔒 AUTH_REDIRECT_DEBUG:";
    
    console.log(`${DEBUG_PREFIX} REDIRECT_HOOK_CHECK`, {
      timestamp: new Date().toISOString(),
      loading,
      hasUser: !!user,
      userId: user?.id,
      redirectPath,
      shouldRedirect: !loading && !!user
    });

    // Only perform redirect if auth state is fully loaded and a user exists.
    // This prevents redirects during initial auth checks or for unauthenticated users.
    if (!loading && user) {
      console.log(`${DEBUG_PREFIX} TRIGGERING_REDIRECT`, {
        timestamp: new Date().toISOString(),
        user: { id: user.id, email: user.email },
        redirectPath
      });
      
      // Add a small delay to ensure React state updates are fully processed
      setTimeout(async () => {
        console.log(`${DEBUG_PREFIX} EXECUTING_REDIRECT`, { redirectPath });
        
        try {
          // Test if router.push actually works
          console.log(`${DEBUG_PREFIX} ROUTER_PUSH_ATTEMPT`, {
            currentUrl: window.location.href,
            targetPath: redirectPath,
            routerReady: router ? 'available' : 'missing'
          });
          
          await router.push(redirectPath);
          
          // Check if navigation actually happened
          setTimeout(() => {
            console.log(`${DEBUG_PREFIX} POST_NAVIGATION_CHECK`, {
              currentUrl: window.location.href,
              expectedPath: redirectPath,
              navigationSuccess: window.location.pathname === redirectPath
            });
          }, 500);
          
        } catch (error) {
          console.error(`${DEBUG_PREFIX} ROUTER_PUSH_ERROR`, {
            error: error,
            errorMessage: error instanceof Error ? error.message : String(error)
          });
        }
      }, 100);
    }
  }, [user, loading, redirectPath, router]);
}
