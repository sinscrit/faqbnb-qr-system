'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Account } from '@/types';
import {
  AuthUser,
  AuthResponse,
  Property,
  User,
  signInWithEmail as authSignIn,
  signOut as authSignOut,
  getUser,
  getSession,
  refreshSession,
  isSessionExpiringSoon,
  isAdmin,
  getUserProperties,
  registerUser,
  switchAccount,
  getAccountsForUser,
  clearAccountContext,
  AccountSwitchResponse,
} from '@/lib/auth';

// Global flag to prevent multiple auth initializations across all component instances
// Use browser storage to persist across bundle chunks and module instances
const GLOBAL_AUTH_KEY = 'faqbnb_auth_initialized';
const GLOBAL_AUTH_PROGRESS_KEY = 'faqbnb_auth_in_progress';
const AUTH_MUTEX_KEY = 'faqbnb_auth_mutex';
const AUTH_MUTEX_TIMEOUT = 10000; // 10 seconds

// Mutex lock system to prevent race conditions across multiple bundle instances
const acquireAuthMutex = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const now = Date.now();
  const existingLock = localStorage.getItem(AUTH_MUTEX_KEY);
  
  // Check if there's an existing lock that hasn't expired
  if (existingLock) {
    const lockTime = parseInt(existingLock);
    if (now - lockTime < AUTH_MUTEX_TIMEOUT) {
      console.log('[AUTH-MUTEX-DEBUG] Auth lock held by another instance, timestamp:', lockTime);
      return false; // Lock is still active
    } else {
      console.log('[AUTH-MUTEX-DEBUG] Expired lock found, cleaning up and acquiring new lock');
    }
  }
  
  // Acquire the lock
  localStorage.setItem(AUTH_MUTEX_KEY, now.toString());
  console.log('[AUTH-MUTEX-DEBUG] Auth mutex acquired at:', now);
  
  // Double-check we actually got the lock (race condition protection)
  setTimeout(() => {
    const currentLock = localStorage.getItem(AUTH_MUTEX_KEY);
    if (currentLock !== now.toString()) {
      console.log('[AUTH-MUTEX-DEBUG] Lost mutex race, another instance acquired it');
      return false;
    }
  }, 50);
  
  return true;
};

const releaseAuthMutex = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_MUTEX_KEY);
  console.log('[AUTH-MUTEX-DEBUG] Auth mutex released');
};

const waitForAuthCompletion = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const maxRetries = 20; // 10 seconds total
    let retries = 0;
    
    const checkAuth = () => {
      retries++;
      const isCompleted = getGlobalAuthInitialized();
      const isInProgress = getGlobalAuthInProgress();
      
      console.log('[AUTH-MUTEX-DEBUG] Waiting for auth completion, attempt:', retries, 'completed:', isCompleted, 'inProgress:', isInProgress);
      
      if (isCompleted || retries >= maxRetries) {
        resolve(isCompleted);
        return;
      }
      
      if (!isInProgress) {
        // Auth failed or stopped, try to acquire lock
        resolve(false);
        return;
      }
      
      setTimeout(checkAuth, 500);
    };
    
    checkAuth();
  });
};

const getGlobalAuthInitialized = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(GLOBAL_AUTH_KEY) === 'true';
};

const setGlobalAuthInitialized = (value: boolean) => {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(GLOBAL_AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(GLOBAL_AUTH_KEY);
  }
};

const getGlobalAuthInProgress = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(GLOBAL_AUTH_PROGRESS_KEY) === 'true';
};

const setGlobalAuthInProgress = (value: boolean) => {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(GLOBAL_AUTH_PROGRESS_KEY, 'true');
  } else {
    localStorage.removeItem(GLOBAL_AUTH_PROGRESS_KEY);
  }
};

console.log('[AUTH-RACE-DEBUG] Module loaded, localStorage globalAuthInitialized:', getGlobalAuthInitialized());

// Enhanced auth context types with account support
interface AuthContextType {
  // Core authentication
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  
  // Property management (legacy)
  userProperties: Property[];
  selectedProperty: Property | null;
  
  // Account management (multi-tenant)
  currentAccount: Account | null;
  userAccounts: Account[];
  switchingAccount: boolean;
  
  // Authentication functions
  signIn: (email: string, password: string) => Promise<AuthResponse<{ user: AuthUser; session: Session; accounts: Account[]; defaultAccount: Account | null }>>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<AuthResponse<{ user: User; session: Session }>>;
  
  // Property functions (legacy)
  getUserProperties: () => Promise<void>;
  setSelectedProperty: (property: Property | null) => void;
  
  // Account functions (multi-tenant)
  setCurrentAccount: (account: Account | null) => void;
  switchToAccount: (accountId: string) => Promise<AccountSwitchResponse>;
  refreshAccountContext: () => Promise<void>;
  clearCurrentAccount: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session refresh interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Authentication Provider Component with Account Support
export function AuthProvider({ children }: AuthProviderProps) {
  // Core authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Property management state (legacy)
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Account management state (multi-tenant)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // Prevent multiple simultaneous auth initializations
  const [authInitialized, setAuthInitialized] = useState(false);

  console.log('[AUTH-RACE-DEBUG] AuthContext component rendered, authInitialized:', authInitialized, 'globalAuthInitialized:', getGlobalAuthInitialized());

  // Initialize auth state with account context
  useEffect(() => {
    const initializeWithMutex = async () => {
      console.log('[AUTH-RACE-DEBUG] useEffect triggered, globalAuthInitialized:', getGlobalAuthInitialized(), 'globalAuthInProgress:', getGlobalAuthInProgress());
      
      // If auth is already completed globally, skip everything
      if (getGlobalAuthInitialized()) {
        console.log('[AUTH-RACE-DEBUG] Auth already completed globally, clearing loading state and loading session');
        setLoading(false); // Clear loading state for this instance
        
        // Load current session data for this instance since another instance completed auth
        try {
          const sessionResponse = await getSession();
          if (sessionResponse.data?.user) {
            console.log('[AUTH-RACE-DEBUG] Loading session data for this instance');
            const quickUser = await getQuickUserAuth(sessionResponse.data);
            if (quickUser) {
              setSession(sessionResponse.data);
              setUser(quickUser);
              console.log('[AUTH-RACE-DEBUG] Session loaded successfully for this instance');
            }
          } else {
            console.log('[AUTH-RACE-DEBUG] No session data available, auth may have failed globally');
          }
        } catch (error) {
          console.error('[AUTH-RACE-DEBUG] Failed to load session for this instance:', error);
        }
        
        return;
      }
      
      // Try to acquire the mutex lock
      if (!acquireAuthMutex()) {
        console.log('[AUTH-RACE-DEBUG] Could not acquire mutex, waiting for other instance to complete');
        
        // Wait for the other instance to complete authentication
        const authCompleted = await waitForAuthCompletion();
        if (authCompleted) {
          console.log('[AUTH-RACE-DEBUG] Other instance completed auth successfully, clearing loading state and loading session');
          setLoading(false); // Clear loading state since auth is complete
          
          // Load current session data for this instance
          try {
            const sessionResponse = await getSession();
            if (sessionResponse.data?.user) {
              console.log('[AUTH-RACE-DEBUG] Loading session data after waiting for other instance');
              const quickUser = await getQuickUserAuth(sessionResponse.data);
              if (quickUser) {
                setSession(sessionResponse.data);
                setUser(quickUser);
                console.log('[AUTH-RACE-DEBUG] Session loaded successfully after waiting');
              }
            } else {
              console.log('[AUTH-RACE-DEBUG] No session data available after waiting');
            }
          } catch (error) {
            console.error('[AUTH-RACE-DEBUG] Failed to load session after waiting:', error);
          }
          
        } else {
          console.log('[AUTH-RACE-DEBUG] Other instance failed or timed out, attempting to acquire lock again');
          if (!acquireAuthMutex()) {
            console.log('[AUTH-RACE-DEBUG] Still cannot acquire lock, giving up and clearing loading state');
            setLoading(false); // Clear loading state to prevent indefinite loading
            return;
          }
          // Fall through to initialize auth
        }
      }
      
      // Only initialize if we have the lock and auth isn't completed
      if (!getGlobalAuthInitialized()) {
        console.log('[AUTH-RACE-DEBUG] Setting up auth context - FIRST TIME GLOBALLY');
        console.log('[AUTH-RACE-DEBUG] useEffect dependencies check passed, calling initializeAuth');
        
        setGlobalAuthInProgress(true); // Mark as in progress
        
        try {
          await initializeAuth();
        } catch (error) {
          console.error('[AUTH-RACE-DEBUG] Auth initialization failed:', error);
        } finally {
          setGlobalAuthInProgress(false);
          releaseAuthMutex(); // Always release the lock
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[AUTH-RACE-DEBUG] Auth state changed:', event, session?.user?.id);
            
            if (event === 'SIGNED_IN' && session) {
              console.log('[AUTH-RACE-DEBUG] Handling SIGNED_IN event');
              await handleSignIn(session);
            } else if (event === 'SIGNED_OUT') {
              console.log('[AUTH-RACE-DEBUG] Handling SIGNED_OUT event');
              handleSignOut();
            } else if (event === 'TOKEN_REFRESHED' && session) {
              console.log('[AUTH-RACE-DEBUG] Handling TOKEN_REFRESHED event');
              await handleSessionRefresh(session);
            }
          }
        );

        // Set up session refresh interval
        const intervalId = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL);

        return () => {
          console.log('[AUTH-RACE-DEBUG] Cleaning up auth context');
          subscription?.unsubscribe();
          clearInterval(intervalId);
          // Note: Don't reset globalAuthInitialized here as other instances might still need it
        };
      } else {
        console.log('[AUTH-RACE-DEBUG] Auth completed while we were waiting, clearing loading state and loading session');
        setLoading(false); // Clear loading state since auth is complete
        
        // Load current session data for this instance
        try {
          const sessionResponse = await getSession();
          if (sessionResponse.data?.user) {
            console.log('[AUTH-RACE-DEBUG] Loading session data after auth completed while waiting');
            const quickUser = await getQuickUserAuth(sessionResponse.data);
            if (quickUser) {
              setSession(sessionResponse.data);
              setUser(quickUser);
              console.log('[AUTH-RACE-DEBUG] Session loaded successfully after auth completed while waiting');
            }
          } else {
            console.log('[AUTH-RACE-DEBUG] No session data available after auth completed while waiting');
          }
        } catch (error) {
          console.error('[AUTH-RACE-DEBUG] Failed to load session after auth completed while waiting:', error);
        }
        
        releaseAuthMutex(); // Release the lock since we're not using it
      }
    };
    
    initializeWithMutex();
  }, []); // Empty dependencies to prevent re-runs

  // Quick authentication fallback - bypasses complex account context
  const getQuickUserAuth = async (session: Session): Promise<AuthUser | null> => {
    if (!session.user?.email) return null;
    
    try {
      // Quick admin check with timeout
      const adminCheckPromise = supabase
        .from('admin_users')
        .select('email, full_name, role')
        .eq('email', session.user.email)
        .single();
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Quick auth timeout')), 3000)
      );
      
      const result = await Promise.race([adminCheckPromise, timeoutPromise]);
      
      if (result.data && !result.error) {
        return {
          id: session.user.id,
          email: result.data.email,
          fullName: result.data.full_name || undefined,
          role: result.data.role || 'admin',
          currentAccount: null, // Will be populated later if needed
          availableAccounts: []
        };
      }
      
      return null;
    } catch (error) {
      console.log('Quick auth failed:', error);
      return null;
    }
  };

  // Initialize authentication state with account context
  const initializeAuth = async () => {
    console.log('[AUTH-RACE-DEBUG] initializeAuth called - starting authentication process');
    
    try {
      setAuthInitialized(true); // Keep local state for compatibility
      console.log('[AUTH-RACE-DEBUG] setAuthInitialized(true) called - this may trigger re-render');
      setLoading(true);
      
      const isPopupWindow = window.location.pathname.includes('/qr-print');
      console.log('[QR-AUTH-DEBUG] Auth init started:', {
        url: window.location.href,
        isPopupWindow,
        timestamp: Date.now()
      });
      
      // Simplified session check without complex timeouts
      console.log('[QR-AUTH-DEBUG] Getting session...');
      const sessionStart = Date.now();
      const sessionResponse = await getSession();
      console.log('[QR-AUTH-DEBUG] Session response:', { 
        hasError: !!sessionResponse.error, 
        hasData: !!sessionResponse.data, 
        userId: sessionResponse.data?.user?.id,
        duration: Date.now() - sessionStart
      });
      
      if (sessionResponse.error) {
        console.log('[QR-AUTH-DEBUG] No valid session found');
        clearAuthState();
        setGlobalAuthInitialized(true); // Mark as complete even if no session
        return;
      }
      
      if (!sessionResponse.data) {
        console.log('[QR-AUTH-DEBUG] No session data');
        clearAuthState();
        setGlobalAuthInitialized(true); // Mark as complete even if no session
        return;
      }
      
      // Try quick auth first for better performance
      console.log('[QR-AUTH-DEBUG] Getting user data...');
      const quickStart = Date.now();
      
      try {
        const [quickUserResponse] = await Promise.all([
          getQuickUserAuth(sessionResponse.data)
          // Note: Don't preload account context here since we don't have a user yet
        ]);
        
        if (quickUserResponse) {
          console.log('[QR-AUTH-DEBUG] Quick auth successful:', {
            email: quickUserResponse.email,
            duration: Date.now() - quickStart
          });
          setSession(sessionResponse.data);
          setUser(quickUserResponse);
          setLoading(false);
          setGlobalAuthInitialized(true); // Mark as successfully completed
          return;
        }
      } catch (quickError) {
        console.log('[QR-AUTH-DEBUG] Quick auth failed, using basic auth:', quickError);
      }
      
      // Fallback to basic auth if quick auth fails
      console.log('[QR-AUTH-DEBUG] Using basic auth fallback');
      const basicUser: AuthUser = {
        id: sessionResponse.data.user!.id,
        email: sessionResponse.data.user!.email || '',
        role: 'user',
        currentAccount: null,
        availableAccounts: []
      };
      
      setSession(sessionResponse.data);
      setUser(basicUser);
      setLoading(false);
      
      // Load account context in background without blocking
      loadAccountContextInBackground(basicUser);
      
      setGlobalAuthInitialized(true); // Mark as successfully completed
      
    } catch (error) {
      console.error('[QR-AUTH-DEBUG] Auth initialization failed:', error);
      clearAuthState();
      setGlobalAuthInitialized(true); // Mark as complete even on error to prevent retry loops
    } finally {
      setLoading(false); // Ensure loading is always cleared
    }
  };

  const resetGlobalAuthFlags = () => {
    console.log('[AUTH-RACE-DEBUG] Resetting global auth flags and cleaning up mutex');
    setGlobalAuthInitialized(false);
    setGlobalAuthInProgress(false);
    releaseAuthMutex(); // Clean up any stale mutex locks
  };

  const clearAuthState = useCallback(() => {
    console.log('[AUTH-RACE-DEBUG] Clearing auth state and resetting global flags');
    setUser(null);
    setSession(null);
    setCurrentAccount(null);
    setUserAccounts([]);
    setSelectedProperty(null);
    setLoading(false);
    resetGlobalAuthFlags(); // Reset global flags so auth can be re-initialized
  }, []);

  // Load account context in background without blocking main auth flow
  const loadAccountContextInBackground = async (user: AuthUser) => {
    try {
      console.log('[QR-AUTH-DEBUG] Loading account context in background for:', user.email);
      
      // Get full user data with account context
      const userResponse = await getUser();
      if (userResponse.error || !userResponse.data) {
        console.log('[QR-AUTH-DEBUG] Background account loading failed, keeping basic auth');
        return;
      }

      // Update user with account context
      setUser(userResponse.data);
      
      if (userResponse.data.availableAccounts) {
        setUserAccounts(userResponse.data.availableAccounts);
      }
      
      if (userResponse.data.currentAccount && userResponse.data.availableAccounts) {
        const fullAccount = userResponse.data.availableAccounts.find(
          acc => acc.id === userResponse.data?.currentAccount?.id
        );
        if (fullAccount) {
          setCurrentAccount(fullAccount);
        }
      }
      
      // Load properties
      if (userResponse.data.role === 'user' || userResponse.data.role === 'admin') {
        try {
          const accountId = userResponse.data.currentAccount?.id;
          const properties = await getUserProperties(userResponse.data.id, accountId);
          setUserProperties(properties);
          
          if (properties.length > 0) {
            setSelectedProperty(properties[0]);
          }
        } catch (propertyError) {
          console.error('Background property loading failed:', propertyError);
        }
      }
      
      console.log('[QR-AUTH-DEBUG] Background account context loaded successfully');
    } catch (error) {
      console.error('[QR-AUTH-DEBUG] Background account loading failed:', error);
    }
  };

  // Handle successful sign in with account context
  const handleSignIn = async (session: Session) => {
    try {
      setSession(session);
      
      // Get user data with account context
      const userResponse = await getUser();
      if (userResponse.error || !userResponse.data) {
        console.error('Failed to get user data after sign in');
        clearAuthState();
        return;
      }

      setUser(userResponse.data);
      
      // Set account context from user data
      if (userResponse.data?.availableAccounts) {
        setUserAccounts(userResponse.data.availableAccounts);
      }
      
      if (userResponse.data?.currentAccount && userResponse.data?.availableAccounts) {
        // Find the full account object from available accounts
        const fullAccount = userResponse.data.availableAccounts.find(
          acc => acc.id === userResponse.data?.currentAccount?.id
        );
        if (fullAccount) {
          setCurrentAccount(fullAccount);
        }
      }
      
      // Load user properties for the current account context
      if (userResponse.data && (userResponse.data.role === 'user' || userResponse.data.role === 'admin')) {
        const accountId = userResponse.data.currentAccount?.id;
        const properties = await getUserProperties(userResponse.data.id, accountId);
        setUserProperties(properties);
        
        // Auto-select first property if available
        if (properties.length > 0) {
          setSelectedProperty(properties[0]);
        }
      }
    } catch (error) {
      console.error('Failed to handle sign in:', error);
      clearAuthState();
    }
  };

  // Handle sign out with account context clearing
  const handleSignOut = () => {
    clearAccountContext(); // Clear localStorage account context
    clearAuthState();
  };

  // Handle session refresh with account context preservation
  const handleSessionRefresh = async (session: Session) => {
    try {
      setSession(session);
      
      // Re-verify user and preserve account context
      const userResponse = await getUser();
      if (userResponse.error || !userResponse.data) {
        await authSignOut();
        clearAuthState();
        return;
      }

      setUser(userResponse.data);
      
      // Update account context if needed
      if (userResponse.data && userResponse.data.availableAccounts) {
        setUserAccounts(userResponse.data.availableAccounts);
      }
      
      if (userResponse.data && userResponse.data.currentAccount && userResponse.data.availableAccounts) {
        const fullAccount = userResponse.data.availableAccounts.find(
          acc => acc.id === userResponse.data?.currentAccount?.id
        );
        if (fullAccount) {
          setCurrentAccount(fullAccount);
        }
      }
    } catch (error) {
      console.error('Failed to handle session refresh:', error);
      await authSignOut();
      clearAuthState();
    }
  };

  // Check and refresh session if needed
  const checkAndRefreshSession = async () => {
    if (!session) return;

    try {
      if (isSessionExpiringSoon(session)) {
        console.log('Session expiring soon, refreshing...');
        await handleRefreshSession();
      }
    } catch (error) {
      console.error('Failed to check/refresh session:', error);
    }
  };

  // Enhanced sign in function with account context
  const signIn = async (email: string, password: string): Promise<AuthResponse<{ user: AuthUser; session: Session; accounts: Account[]; defaultAccount: Account | null }>> => {
    try {
      setLoading(true);
      
      const result = await authSignIn(email, password);
      
      if (result.error) {
        return result;
      }

      if (result.data) {
        setUser(result.data.user);
        setSession(result.data.session);
        setUserAccounts(result.data.accounts);
        
        if (result.data.defaultAccount) {
          setCurrentAccount(result.data.defaultAccount);
        }
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred during sign in' };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign out function with account context clearing
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await authSignOut(); // This also clears account context
      clearAuthState();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh session function
  const handleRefreshSession = async (): Promise<void> => {
    try {
      const result = await refreshSession();
      
      if (result.error || !result.data) {
        console.log('Session refresh failed, signing out');
        await signOut();
        return;
      }

      await handleSessionRefresh(result.data);
    } catch (error) {
      console.error('Refresh session error:', error);
      await signOut();
    }
  };

  // Get user properties function with account filtering
  const loadUserProperties = async (): Promise<void> => {
    if (!user?.id) {
      setUserProperties([]);
      setSelectedProperty(null);
      return;
    }

    try {
      const accountId = currentAccount?.id;
      const properties = await getUserProperties(user.id, accountId);
      setUserProperties(properties);
      
      // Auto-select first property if none selected
      if (properties.length > 0 && !selectedProperty) {
        setSelectedProperty(properties[0]);
      }
    } catch (error) {
      console.error('Failed to load user properties:', error);
      setUserProperties([]);
    }
  };

  // Account switching function
  const switchToAccount = async (accountId: string): Promise<AccountSwitchResponse> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setSwitchingAccount(true);
      
      const result = await switchAccount(accountId);
      
      if (result.success && result.account) {
        setCurrentAccount(result.account);
        
        // Update user's current account context
        if (user) {
          const updatedUser = {
            ...user,
            currentAccount: {
              id: result.account.id,
              name: result.account.name,
              role: result.userRole || 'member',
              isOwner: result.account.owner_id === user.id
            }
          };
          setUser(updatedUser);
        }
        
        // Reload properties for the new account context
        await loadUserProperties();
        
        console.log('✅ Successfully switched to account:', result.account.name);
      }
      
      return result;
    } catch (error) {
      console.error('Account switching error:', error);
      return { success: false, error: 'Failed to switch account' };
    } finally {
      setSwitchingAccount(false);
    }
  };

  // Refresh account context (reload user's accounts and current account)
  const refreshAccountContext = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      const accounts = await getAccountsForUser(user.id);
      setUserAccounts(accounts);
      
      // Update current account if it's still valid
      if (currentAccount) {
        const updatedCurrentAccount = accounts.find(acc => acc.id === currentAccount.id);
        if (updatedCurrentAccount) {
          setCurrentAccount(updatedCurrentAccount);
        } else {
          // Current account no longer accessible, clear it
          setCurrentAccount(null);
          clearAccountContext();
        }
      }
    } catch (error) {
      console.error('Failed to refresh account context:', error);
    }
  };

  // Clear current account context
  const clearCurrentAccount = useCallback(() => {
    setCurrentAccount(null);
    clearAccountContext();
    
    // Update user's current account context
    if (user) {
      const updatedUser = {
        ...user,
        currentAccount: null
      };
      setUser(updatedUser);
    }
    
    // Reload properties without account filtering
    loadUserProperties();
  }, [user]);

  // User registration function
  const register = async (
    email: string, 
    password: string, 
    fullName?: string
  ): Promise<AuthResponse<{ user: User; session: Session }>> => {
    try {
      setLoading(true);
      
      const result = await registerUser(email, password, fullName);
      
      if (result.error) {
        return result;
      }

      if (result.data) {
        // Convert User to AuthUser for context
        const authUser: AuthUser = {
          id: result.data.user.id,
          email: result.data.user.email,
          fullName: result.data.user.fullName,
          role: result.data.user.role,
        };
        
        setUser(authUser);
        setSession(result.data.session);
        
        // Initialize account context for new user
        await refreshAccountContext();
        
        // Load properties for new user
        if (result.data) {
          await loadUserProperties();
        }
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'An unexpected error occurred during registration' };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced context value with account management
  const contextValue: AuthContextType = {
    // Core authentication
    user,
    session,
    loading,
    isAdmin: user ? isAdmin(user) : false,
    
    // Property management (legacy)
    userProperties,
    selectedProperty,
    
    // Account management (multi-tenant)
    currentAccount,
    userAccounts,
    switchingAccount,
    
    // Authentication functions
    signIn,
    signOut,
    refreshSession: handleRefreshSession,
    register,
    
    // Property functions (legacy)
    getUserProperties: loadUserProperties,
    setSelectedProperty,
    
    // Account functions (multi-tenant)
    setCurrentAccount,
    switchToAccount,
    refreshAccountContext,
    clearCurrentAccount,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Hook to use account context specifically
export function useAccountContext() {
  const { currentAccount, userAccounts, switchingAccount, switchToAccount, clearCurrentAccount } = useAuth();
  
  return {
    currentAccount,
    userAccounts,
    switchingAccount,
    switchToAccount,
    clearCurrentAccount,
  };
}

// Higher-order component for authentication
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      // Redirect to login will be handled by middleware
      return null;
    }
    
    return <Component {...props} />;
  };
}

// Higher-order component for account-aware authentication
export function withAccountAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AccountAuthenticatedComponent(props: P) {
    const { user, loading, currentAccount, userAccounts } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return null;
    }
    
    // Show account selection if user has accounts but none selected
    if (userAccounts.length > 0 && !currentAccount) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please select an account to continue</p>
            {/* Account selector would be rendered here */}
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

// Hook to check if user is authenticated
export function useRequireAuth(): AuthUser {
  const { user, loading } = useAuth();
  
  if (loading) {
    throw new Error('Authentication is still loading');
  }
  
  if (!user) {
    throw new Error('User must be authenticated');
  }
  
  return user;
}

// Hook to require account context
export function useRequireAccount(): { user: AuthUser; account: Account } {
  const { user, loading, currentAccount } = useAuth();
  
  if (loading) {
    throw new Error('Authentication is still loading');
  }
  
  if (!user) {
    throw new Error('User must be authenticated');
  }
  
  if (!currentAccount) {
    throw new Error('Account context is required');
  }
  
  return { user, account: currentAccount };
} 