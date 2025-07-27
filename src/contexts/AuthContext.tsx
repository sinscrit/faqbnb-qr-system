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

  // Initialize auth state with account context
  useEffect(() => {
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          await handleSignIn(session);
        } else if (event === 'SIGNED_OUT') {
          handleSignOut();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          await handleSessionRefresh(session);
        }
      }
    );

    // Set up session refresh interval
    const intervalId = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // Initialize authentication state with account context
  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log('🔍 Initializing auth with account context...');
      
      // Add timeout to prevent hanging
      const authTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 10000)
      );
      
      const authPromise = (async () => {
        console.log('📞 Getting session...');
        const sessionResponse = await getSession();
        console.log('📱 Session response:', { 
          hasError: !!sessionResponse.error, 
          hasData: !!sessionResponse.data,
          userId: sessionResponse.data?.user?.id 
        });
        
        if (sessionResponse.error || !sessionResponse.data) {
          console.log('❌ No valid session found');
          clearAuthState();
          return;
        }

        console.log('👤 Getting user data with account context...');
        const userResponse = await getUser();
        console.log('🔑 User response:', { 
          hasError: !!userResponse.error, 
          hasData: !!userResponse.data,
          hasCurrentAccount: !!userResponse.data?.currentAccount,
          availableAccountsCount: userResponse.data?.availableAccounts?.length || 0,
          error: userResponse.error 
        });
        
        if (userResponse.error || !userResponse.data) {
          console.log('❌ User verification failed:', userResponse.error);
          clearAuthState();
          return;
        }

        console.log('✅ Auth successful with account context:', {
          userEmail: userResponse.data.email,
          currentAccount: userResponse.data.currentAccount?.name,
          accountCount: userResponse.data.availableAccounts?.length || 0
        });
        
        setSession(sessionResponse.data);
        setUser(userResponse.data);
        
        // Set account context from user data
        if (userResponse.data?.availableAccounts) {
          setUserAccounts(userResponse.data.availableAccounts);
        }
        
        if (userResponse.data?.currentAccount && userResponse.data?.availableAccounts) {
          // Find the full account object from available accounts
          const fullAccount = userResponse.data.availableAccounts.find(
            acc => acc.id === userResponse.data.currentAccount?.id
          );
          if (fullAccount) {
            setCurrentAccount(fullAccount);
          }
        }
        
        // Load user properties (legacy support)
        if (userResponse.data && (userResponse.data.role === 'user' || userResponse.data.role === 'admin')) {
          try {
            const accountId = userResponse.data.currentAccount?.id;
            const properties = await getUserProperties(userResponse.data.id, accountId);
            setUserProperties(properties);
            
            // Auto-select first property if available
            if (properties.length > 0) {
              setSelectedProperty(properties[0]);
            }
          } catch (propertyError) {
            console.error('Failed to load properties during init:', propertyError);
            setUserProperties([]);
            setSelectedProperty(null);
          }
        }
      })();

      await Promise.race([authPromise, authTimeout]);
    } catch (error) {
      console.error('❌ Failed to initialize auth:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // Clear all authentication and account state
  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setUserProperties([]);
    setSelectedProperty(null);
    setCurrentAccount(null);
    setUserAccounts([]);
    setSwitchingAccount(false);
  }, []);

  // Handle successful sign in with account context
  const handleSignIn = async (session: Session) => {
    try {
      setSession(session);
      
      const userResponse = await getUser();
      if (userResponse.error || !userResponse.data) {
        // User is not valid - sign out
        await authSignOut();
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
          acc => acc.id === userResponse.data.currentAccount?.id
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
      if (userResponse.data?.availableAccounts) {
        setUserAccounts(userResponse.data.availableAccounts);
      }
      
      if (userResponse.data?.currentAccount && userResponse.data?.availableAccounts) {
        const fullAccount = userResponse.data.availableAccounts.find(
          acc => acc.id === userResponse.data.currentAccount?.id
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
        await loadUserProperties();
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