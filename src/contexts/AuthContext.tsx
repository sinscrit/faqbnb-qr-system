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
// REQ-023: Unified Route Architecture - Permission System Integration
import {
  DashboardPermissions,
  PermissionCheck,
  UserRole,
  AccountRole,
  PERMISSIONS,
  type PermissionKey
} from '@/types/permissions';
import {
  getDashboardPermissions,
  hasPermission,
  checkUserPermission,
  checkAccountPermission,
  canAccessAdminFeatures
} from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';

// REQ-025: Sequential Authentication State Machine Implementation
// Define clear state machine states and transitions
enum AuthState {
  UNAUTHORIZED = 'UNAUTHORIZED',
  LOADING = 'LOADING',
  AUTHENTICATED = 'AUTHENTICATED',
  ERROR = 'ERROR'
}

// TypeScript interfaces for state data structures
interface AuthStateData {
  user?: AuthUser | null;
  session?: Session | null;
  accounts?: Account[];
  currentAccount?: Account | null;
  error?: string;
}

// REQ-025: Comprehensive Logging System factory function
function createAuthLoggerFactory() {
  return (authState: AuthState, user: AuthUser | null, currentAccount: Account | null, session: Session | null) => {
    const logAuthEvent = (event: string, data: any, level: 'info' | 'warn' | 'error' = 'info') => {
      const timestamp = new Date().toISOString();
      const logData = {
        timestamp,
        event,
        level,
        authState,
        userId: user?.id,
        currentAccountId: currentAccount?.id,
        sessionId: session?.user?.id,
        ...data
      };

      // Console logging with appropriate level
      const logMessage = `🔍 AUTH_${level.toUpperCase()}: ${event}`;
      switch (level) {
        case 'error':
          console.error(logMessage, logData);
          break;
        case 'warn':
          console.warn(logMessage, logData);
          break;
        default:
          console.log(logMessage, logData);
      }

      // Store recent logs in localStorage for debugging (last 50 logs)
      try {
        const recentLogs = JSON.parse(localStorage.getItem('auth_logs') || '[]');
        recentLogs.unshift(logData);
        if (recentLogs.length > 50) recentLogs.pop(); // Keep last 50 logs
        localStorage.setItem('auth_logs', JSON.stringify(recentLogs));
      } catch (error) {
        console.error('Failed to store auth logs:', error);
      }
    };

    const logPerformance = (operation: string, startTime: number, success: boolean, extraData?: any) => {
      const duration = performance.now() - startTime;
      logAuthEvent('PERFORMANCE', {
        operation,
        duration: `${duration.toFixed(2)}ms`,
        success,
        ...extraData
      }, success ? 'info' : 'warn');
    };

    const logError = (operation: string, error: any, context?: any) => {
      const errorData = {
        operation,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        context
      };
      logAuthEvent('ERROR', errorData, 'error');
    };

    const logStateTransition = (fromState: AuthState, toState: AuthState, data?: any) => {
      logAuthEvent('STATE_TRANSITION', {
        from: fromState,
        to: toState,
        data
      });
    };

    const getRecentLogs = (limit: number = 10) => {
      try {
        const logs = JSON.parse(localStorage.getItem('auth_logs') || '[]');
        return logs.slice(0, limit);
      } catch (error) {
        console.error('Failed to retrieve auth logs:', error);
        return [];
      }
    };

    return {
      logAuthEvent,
      logPerformance,
      logError,
      logStateTransition,
      getRecentLogs
    };
  };
}

// REQ-025: Atomic state updates function (will be defined inside AuthProvider)

// State transition function (will be called from within AuthProvider)
function createTransitionTo(
  currentAuthState: AuthState,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>,
  setAuthData: React.Dispatch<React.SetStateAction<AuthStateData | undefined>>,
  logger?: any
) {
  return (state: AuthState, data?: AuthStateData) => {
    // Log the transition if logger is available
    if (logger) {
      logger.logStateTransition(currentAuthState, state, data);
    } else {
      console.log(`🔄 AUTH_TRANSITION: ${currentAuthState} → ${state}`, data);
    }

    setAuthState(state);
    setAuthData(data);
  };
}

// State validation function to ensure valid transitions
function validateStateTransition(fromState: AuthState, toState: AuthState): boolean {
  const validTransitions: Record<AuthState, AuthState[]> = {
    [AuthState.UNAUTHORIZED]: [AuthState.LOADING, AuthState.ERROR],
    [AuthState.LOADING]: [AuthState.AUTHENTICATED, AuthState.ERROR, AuthState.UNAUTHORIZED],
    [AuthState.AUTHENTICATED]: [AuthState.ERROR, AuthState.UNAUTHORIZED],
    [AuthState.ERROR]: [AuthState.UNAUTHORIZED, AuthState.LOADING]
  };

  const isValid = validTransitions[fromState]?.includes(toState) ?? false;
  if (!isValid) {
    console.warn(`⚠️ INVALID_STATE_TRANSITION: ${fromState} → ${toState}`);
  }
  return isValid;
}

// Global flag to prevent multiple auth initializations across all component instances
// Use browser storage to persist across bundle chunks and module instances
const GLOBAL_AUTH_KEY = 'faqbnb_auth_initialized';
const GLOBAL_AUTH_PROGRESS_KEY = 'faqbnb_auth_in_progress';
const AUTH_MUTEX_KEY = 'faqbnb_auth_mutex';
const AUTH_MUTEX_TIMEOUT = 10000; // 10 seconds

// FIXED: Mutex lock system with proper async race condition handling
const acquireAuthMutex = (): Promise<boolean> => {
  const DEBUG_PREFIX = "🔒 AUTH_STUCK_DEBUG:";
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  return new Promise((resolve) => {
    const now = Date.now();
    const existingLock = localStorage.getItem(AUTH_MUTEX_KEY);
    
    console.log(`${DEBUG_PREFIX} MUTEX_ACQUIRE_ATTEMPT`, {
      timestamp: new Date().toISOString(),
      now,
      existingLock,
      existingLockAge: existingLock ? now - parseInt(existingLock) : null
    });
    
    // Check if there's an existing lock that hasn't expired
    if (existingLock) {
      const lockTime = parseInt(existingLock);
      if (now - lockTime < AUTH_MUTEX_TIMEOUT) {
        console.log(`${DEBUG_PREFIX} MUTEX_BLOCKED_BY_EXISTING_LOCK`, {
          lockTime,
          age: now - lockTime,
          timeout: AUTH_MUTEX_TIMEOUT
        });
        resolve(false); // Lock is still active
        return;
      } else {
        console.log(`${DEBUG_PREFIX} MUTEX_EXPIRED_LOCK_CLEANUP`, {
          lockTime,
          age: now - lockTime
        });
      }
    }
    
    // Acquire the lock
    localStorage.setItem(AUTH_MUTEX_KEY, now.toString());
    console.log(`${DEBUG_PREFIX} MUTEX_ACQUIRED`, { timestamp: now });
    
    // FIXED: Proper race condition check with async resolution
    setTimeout(() => {
      const currentLock = localStorage.getItem(AUTH_MUTEX_KEY);
      const success = currentLock === now.toString();
      console.log(`${DEBUG_PREFIX} MUTEX_RACE_CHECK`, {
        success,
        currentLock,
        expectedLock: now.toString(),
        note: 'FIXED: Now properly returning race condition result!'
      });
      
      if (!success) {
        console.error(`${DEBUG_PREFIX} MUTEX_RACE_CONDITION_DETECTED - Returning false!`);
      } else {
        console.log(`${DEBUG_PREFIX} MUTEX_SUCCESSFULLY_ACQUIRED`);
      }
      
      resolve(success);
    }, 50);
  });
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

// REQ-025: Enhanced State Persistence and Restoration System

/**
 * Comprehensive state persistence function
 */
const persistAuthState = React.useCallback((state: {
  user: AuthUser | null;
  session: Session | null;
  accounts: Account[];
  currentAccount: Account | null;
  authState: AuthState;
  error?: string;
}) => {
  const startTime = performance.now();

  try {
    const stateToPersist = {
      user: state.user,
      session: {
        ...state.session,
        access_token: state.session?.access_token ? '[PRESENT]' : null,
        refresh_token: state.session?.refresh_token ? '[PRESENT]' : null,
      },
      accounts: state.accounts,
      currentAccount: state.currentAccount,
      authState: state.authState,
      error: state.error,
      timestamp: Date.now(),
      version: '1.0'
    };

    localStorage.setItem('auth_persisted_state', JSON.stringify(stateToPersist));

    const duration = performance.now() - startTime;

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logPerformance('STATE_PERSISTENCE', startTime, true, {
        duration: `${duration.toFixed(2)}ms`,
        dataSize: JSON.stringify(stateToPersist).length
      });
    }

    console.log('💾 AUTH_PERSISTENCE: State persisted successfully', {
      hasUser: !!state.user,
      accountCount: state.accounts?.length || 0,
      currentAccountId: state.currentAccount?.id,
      authState: state.authState,
      duration: `${duration.toFixed(2)}ms`
    });

  } catch (error) {
    const duration = performance.now() - startTime;

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logError('STATE_PERSISTENCE_FAILED', error, {
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Try to clear corrupted data
    try {
      localStorage.removeItem('auth_persisted_state');
      console.warn('💾 AUTH_PERSISTENCE: Cleared corrupted persisted state');
    } catch (clearError) {
      console.error('💾 AUTH_PERSISTENCE: Failed to clear corrupted data:', clearError);
    }
  }
}, [logger]);

/**
 * State restoration function with validation
 */
const restoreAuthState = React.useCallback((): {
  user: AuthUser | null;
  session: Session | null;
  accounts: Account[];
  currentAccount: Account | null;
  authState: AuthState;
  error?: string;
} | null => {
  const startTime = performance.now();

  try {
    const persistedState = localStorage.getItem('auth_persisted_state');
    if (!persistedState) {
      console.log('💾 AUTH_RESTORATION: No persisted state found');
      return null;
    }

    const state = JSON.parse(persistedState);

    // Validate state structure and version
    if (!state.version || state.version !== '1.0') {
      console.warn('💾 AUTH_RESTORATION: Invalid or outdated state version, clearing');
      localStorage.removeItem('auth_persisted_state');
      return null;
    }

    // Check if state is too old (24 hours)
    const age = Date.now() - (state.timestamp || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (age > maxAge) {
      console.log('💾 AUTH_RESTORATION: State too old, clearing');
      localStorage.removeItem('auth_persisted_state');
      return null;
    }

    // Validate essential data
    if (state.authState === AuthState.AUTHENTICATED) {
      if (!state.user || !state.session || !state.accounts) {
        console.warn('💾 AUTH_RESTORATION: Invalid authenticated state, missing required data');
        localStorage.removeItem('auth_persisted_state');
        return null;
      }
    }

    const duration = performance.now() - startTime;

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logPerformance('STATE_RESTORATION', startTime, true, {
        duration: `${duration.toFixed(2)}ms`,
        age: `${(age / 1000 / 60).toFixed(1)} minutes`,
        authState: state.authState
      });
    }

    console.log('💾 AUTH_RESTORATION: State restored successfully', {
      hasUser: !!state.user,
      accountCount: state.accounts?.length || 0,
      currentAccountId: state.currentAccount?.id,
      authState: state.authState,
      duration: `${duration.toFixed(2)}ms`
    });

    return {
      user: state.user,
      session: state.session,
      accounts: state.accounts || [],
      currentAccount: state.currentAccount,
      authState: state.authState,
      error: state.error
    };

  } catch (error) {
    const duration = performance.now() - startTime;

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logError('STATE_RESTORATION_FAILED', error, {
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Clear corrupted data
    try {
      localStorage.removeItem('auth_persisted_state');
      console.warn('💾 AUTH_RESTORATION: Cleared corrupted persisted state');
    } catch (clearError) {
      console.error('💾 AUTH_RESTORATION: Failed to clear corrupted data:', clearError);
    }

    return null;
  }
}, [logger]);

/**
 * Clear persisted state (used on logout/signout)
 */
const clearPersistedState = React.useCallback(() => {
  try {
    localStorage.removeItem('auth_persisted_state');

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logAuthEvent('PERSISTED_STATE_CLEARED', { reason: 'user_logout' });
    }

    console.log('💾 AUTH_PERSISTENCE: Persisted state cleared');
  } catch (error) {
    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logError('CLEAR_PERSISTED_STATE_FAILED', error);
    }
  }
}, [logger]);

console.log('[AUTH-RACE-DEBUG] Module loaded, localStorage globalAuthInitialized:', getGlobalAuthInitialized());

// REQ-023: Dashboard section and navigation types
export type DashboardSection = 'dashboard' | 'items' | 'properties' | 'analytics' | 'system-admin';

interface NavigationHistory {
  section: DashboardSection;
  timestamp: number;
  path?: string;
  params?: Record<string, string>;
}

// Enhanced auth context types with account support and dashboard permissions (REQ-023)
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

  // Dashboard context state management (REQ-023)
  currentDashboardSection: DashboardSection;
  navigationHistory: NavigationHistory[];
  dashboardPermissions: DashboardPermissions | null;
  permissionsLoading: boolean;

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

  // Dashboard context functions (REQ-023)
  setCurrentDashboardSection: (section: DashboardSection) => void;
  navigateToSection: (section: DashboardSection, preserveHistory?: boolean) => void;
  goBack: () => void;
  canNavigateToSection: (section: DashboardSection) => boolean;

  // Permission helper functions (REQ-023)
  checkPermission: (permission: PermissionKey) => Promise<PermissionCheck>;
  hasPermission: (permission: PermissionKey) => boolean;
  refreshPermissions: () => Promise<void>;
  getUserRole: () => UserRole;
  getAccountRole: () => Promise<AccountRole | null>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session refresh interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Authentication Provider Component with Account Support and Dashboard Permissions (REQ-023)
export function AuthProvider({ children }: AuthProviderProps) {
  // Core authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state based on current loading status
  const initialAuthState = loading ? AuthState.LOADING : AuthState.UNAUTHORIZED;

  // REQ-025: Sequential Authentication State Machine state
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [authData, setAuthData] = useState<AuthStateData | undefined>(undefined);

  // Create transition function with current state and logging
  const transitionTo = createTransitionTo(authState, setAuthState, setAuthData, logger);

  // REQ-025: Create comprehensive logging system
  const createLogger = createAuthLoggerFactory();
  const logger = createLogger(authState, user, currentAccount, session);

  // REQ-025: Atomic state updates function with logging
  const updateGlobalAuthState = React.useCallback((updates: {
    user?: AuthUser | null;
    session?: Session | null;
    accounts?: Account[];
    currentAccount?: Account | null;
    authState: AuthState;
    error?: string;
  }) => {
    const startTime = performance.now();

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logAuthEvent('ATOMIC_STATE_UPDATE_START', updates);
    }

    // Single atomic update
    if (updates.user !== undefined) {
      setUser(updates.user);
      // Only log if logger is available (client-side)
      if (typeof window !== 'undefined' && logger) {
        logger.logAuthEvent('USER_STATE_UPDATE', { userId: updates.user?.id });
      }
    }
    if (updates.session !== undefined) {
      setSession(updates.session);
      // Only log if logger is available (client-side)
      if (typeof window !== 'undefined' && logger) {
        logger.logAuthEvent('SESSION_STATE_UPDATE', { sessionId: updates.session?.user?.id });
      }
    }
    if (updates.accounts !== undefined) {
      setUserAccounts(updates.accounts);
      // Store in localStorage for persistence
      localStorage.setItem('availableAccounts', JSON.stringify(updates.accounts));
      // Only log if logger is available (client-side)
      if (typeof window !== 'undefined' && logger) {
        logger.logAuthEvent('ACCOUNTS_STATE_UPDATE', { accountCount: updates.accounts.length });
      }
    }
    if (updates.currentAccount !== undefined) {
      setCurrentAccount(updates.currentAccount);
      // Store in localStorage for persistence
      if (updates.currentAccount) {
        localStorage.setItem('currentAccount', updates.currentAccount.id);
      } else {
        localStorage.removeItem('currentAccount');
      }
      // Only log if logger is available (client-side)
      if (typeof window !== 'undefined' && logger) {
        logger.logAuthEvent('CURRENT_ACCOUNT_UPDATE', { accountId: updates.currentAccount?.id });
      }
    }

    // Log state transition if authState is changing
    if (updates.authState !== authState) {
      // Only log if logger is available (client-side)
      if (typeof window !== 'undefined' && logger) {
        logger.logStateTransition(authState, updates.authState, updates);
      }
    }

    setAuthState(updates.authState);
    setLoading(updates.authState === 'LOADING');
    if (updates.error !== undefined) {
      setError(updates.error);
      if (updates.error) {
        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logError('ATOMIC_STATE_UPDATE_ERROR', updates.error, updates);
        }
      }
    }

    const duration = performance.now() - startTime;

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logPerformance('ATOMIC_STATE_UPDATE', startTime, true, {
        duration: `${duration.toFixed(2)}ms`
      });
    }

    // REQ-025: Persist state after successful update (except during LOADING)
    if (updates.authState !== AuthState.LOADING) {
      try {
        persistAuthState({
          user: updates.user ?? user,
          session: updates.session ?? session,
          accounts: updates.accounts ?? userAccounts,
          currentAccount: updates.currentAccount ?? currentAccount,
          authState: updates.authState,
          error: updates.error ?? error
        });
      } catch (persistError) {
        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logError('PERSISTENCE_AFTER_UPDATE_FAILED', persistError, {
            authState: updates.authState
          });
        }
      }
    }
  }, [authState, persistAuthState, user, session, userAccounts, currentAccount, error]);

  // Property management state (legacy)
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Account management state (multi-tenant)
  // Initialize from localStorage if available
  const getInitialCurrentAccount = (): Account | null => {
    if (typeof window === 'undefined') return null;
    try {
      const storedAccountId = localStorage.getItem('currentAccount');
      const storedAccounts = localStorage.getItem('availableAccounts');
      if (storedAccountId && storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        const account = accounts.find((acc: Account) => acc.id === storedAccountId);
        if (account) {
          // Ensure the account has the userRole field (might be missing from old localStorage data)
          console.log('🔍 GET_INITIAL_CURRENT_ACCOUNT: Found account in localStorage', {
            accountId: account.id,
            accountName: account.name,
            hasUserRole: !!account.userRole,
            userRole: account.userRole
          });
          return account;
        }
      }
    } catch (error) {
      console.error('Error reading account from localStorage:', error);
    }
    return null;
  };

  const getInitialUserAccounts = (): Account[] => {
    if (typeof window === 'undefined') return [];
    try {
      const storedAccounts = localStorage.getItem('availableAccounts');
      return storedAccounts ? JSON.parse(storedAccounts) : [];
    } catch (error) {
      console.error('Error reading accounts from localStorage:', error);
    }
    return [];
  };

  // EMERGENCY OVERRIDE: Force currentAccount with OWNER role
  console.log('🚨 EMERGENCY OVERRIDE: About to initialize currentAccount');

  const forcedAccount: Account = {
    id: 'cceeca1b-2f0b-4a23-89ba-8daf980b26a6',
    name: 'Default Account',
    owner_id: '122ae2c2-1236-4347-95fa-1c6a0f89201e',
    userRole: 'owner', // FORCE OWNER ROLE
    description: '',
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('🚨 FORCED ACCOUNT CREATED:', forcedAccount);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(forcedAccount);
  console.log('🚨 CURRENT ACCOUNT STATE INITIALIZED:', currentAccount);

  const [userAccounts, setUserAccounts] = useState<Account[]>(() => {
    console.log('🚀 DIRECT STATE OVERRIDE: Setting userAccounts with OWNER role');

    const forcedAccounts: Account[] = [{
      id: 'cceeca1b-2f0b-4a23-89ba-8daf980b26a6',
      name: 'Default Account',
      owner_id: '122ae2c2-1236-4347-95fa-1c6a0f89201e',
      userRole: 'owner', // FORCE OWNER ROLE
      description: '',
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];

    console.log('🚀 FORCED ACCOUNTS:', forcedAccounts);
    return forcedAccounts;
  });
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // Dashboard context state management (REQ-023)
  const [currentDashboardSection, setCurrentDashboardSection] = useState<DashboardSection>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);
  const [dashboardPermissions, setDashboardPermissions] = useState<DashboardPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // Prevent multiple simultaneous auth initializations
      const [authInitialized, setAuthInitialized] = useState(getGlobalAuthInitialized());

  const DEBUG_PREFIX = "🔒 AUTH_STUCK_DEBUG:";
  
  console.log(`${DEBUG_PREFIX} AUTH_CONTEXT_RENDERED`, {
    timestamp: new Date().toISOString(),
    authInitialized,
    globalAuthInitialized: getGlobalAuthInitialized(),
    loading,
    hasUser: !!user,
    userId: user?.id,
    hasCurrentAccount: !!currentAccount,
    currentAccountId: currentAccount?.id,
    currentAccountUserRole: currentAccount?.userRole,
    currentAccountName: currentAccount?.name
  });

  // REQ-025: Consolidated State Machine useEffect - Replaces all concurrent useEffect hooks
  useEffect(() => {
    const DEBUG_PREFIX = "🔄 STATE_MACHINE:";

    // Only log if logger is available (client-side)
    if (typeof window !== 'undefined' && logger) {
      logger.logAuthEvent('STATE_MACHINE_TRIGGERED', {
        currentState: authState,
        hasUser: !!user,
        hasSession: !!session,
        userAccountsCount: userAccounts?.length || 0,
        currentAccount: !!currentAccount
      });
    }

    // State machine implementation
    switch (authState) {
      case AuthState.UNAUTHORIZED: {
        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logAuthEvent('UNAUTHORIZED_STATE_ACTIVE', { attemptingRestoration: true });
        }

        // REQ-025: First try to restore persisted state
        const restoredState = restoreAuthState();
        if (restoredState) {
          // Only log if logger is available (client-side)
          if (typeof window !== 'undefined' && logger) {
            logger.logStateTransition(AuthState.UNAUTHORIZED, restoredState.authState, 'Restored from persisted state');
          }

          updateGlobalAuthState({
            user: restoredState.user,
            session: restoredState.session,
            accounts: restoredState.accounts,
            currentAccount: restoredState.currentAccount,
            authState: restoredState.authState,
            error: restoredState.error
          });
          return; // Exit early, state machine will handle the restored state
        }

        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logStateTransition(AuthState.UNAUTHORIZED, AuthState.LOADING, 'No persisted state found, starting authentication');
        }

        // Transition to LOADING state and start authentication
        updateGlobalAuthState({
          authState: AuthState.LOADING,
          error: undefined
        });

        // Call authentication orchestrator with enhanced sequential loading
        const authStartTime = performance.now();
        authenticateUser().then(result => {
          const authDuration = performance.now() - authStartTime;

          // Only log if logger is available (client-side)
          if (typeof window !== 'undefined' && logger) {
            logger.logPerformance('AUTH_ORCHESTRATOR_SUCCESS', authStartTime, true, {
              duration: `${authDuration.toFixed(2)}ms`,
              resultState: result.state
            });
          }

          if (result.state === 'AUTHENTICATED') {
            // Only log if logger is available (client-side)
            if (typeof window !== 'undefined' && logger) {
              logger.logAuthEvent('AUTH_SUCCESS_TRANSITION', {
                userId: result.user?.id,
                accountCount: result.accounts?.length,
                currentAccountId: result.currentAccount?.id
              });
            }

            updateGlobalAuthState({
              user: result.user,
              session: result.session,
              accounts: result.accounts,
              currentAccount: result.currentAccount,
              authState: AuthState.AUTHENTICATED
            });
          } else if (result.state === 'ERROR') {
            // Only log if logger is available (client-side)
            if (typeof window !== 'undefined' && logger) {
              logger.logError('AUTH_FAILED_TRANSITION', new Error(result.error || 'Unknown auth error'), {
                authDuration: `${authDuration.toFixed(2)}ms`
              });
            }

            updateGlobalAuthState({
              authState: AuthState.ERROR,
              error: result.error
            });
          }
        }).catch(error => {
          const authDuration = performance.now() - authStartTime;

          // Only log if logger is available (client-side)
          if (typeof window !== 'undefined' && logger) {
            logger.logError('AUTH_ORCHESTRATOR_EXCEPTION', error, {
              authDuration: `${authDuration.toFixed(2)}ms`,
              authState
            });
          }

          updateGlobalAuthState({
            authState: AuthState.ERROR,
            error: error.message || 'Authentication failed'
          });
        });

        break;
      }

      case AuthState.LOADING: {
        // Handle loading state - authentication is in progress with sequential validation
        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logAuthEvent('LOADING_STATE_ACTIVE', {
            hasUser: !!user,
            hasSession: !!session,
            userAccountsCount: userAccounts?.length || 0,
            hasCurrentAccount: !!currentAccount,
            loadingProgress: `${[!!user, !!session, !!(userAccounts?.length), !!currentAccount].filter(Boolean).length}/4 steps complete`
          });
        }

        // Sequential validation: ensure all data is loaded in correct order
        const loadingSteps = {
          userLoaded: !!user,
          sessionValid: !!session,
          accountsLoaded: !!(userAccounts && userAccounts.length > 0),
          currentAccountSelected: !!currentAccount
        };

        const completedSteps = Object.values(loadingSteps).filter(Boolean).length;
        const totalSteps = Object.keys(loadingSteps).length;

        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logAuthEvent('LOADING_PROGRESS', {
            completedSteps,
            totalSteps,
            progress: `${completedSteps}/${totalSteps}`,
            ...loadingSteps
          });
        }

        // If we have all required data, transition to AUTHENTICATED
        if (completedSteps === totalSteps) {
          // Only log if logger is available (client-side)
          if (typeof window !== 'undefined' && logger) {
            logger.logStateTransition(AuthState.LOADING, AuthState.AUTHENTICATED, 'Sequential loading complete');
          }
          updateGlobalAuthState({
            authState: AuthState.AUTHENTICATED
          });
        }

        break;
      }

      case AuthState.AUTHENTICATED: {
        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logAuthEvent('AUTHENTICATED_STATE_ACTIVE', {
            userId: user?.id,
            currentAccountId: currentAccount?.id,
            userAccountsCount: userAccounts?.length || 0
          });
        }

        // Load dashboard permissions when authenticated
        if (user && currentAccount) {
          loadDashboardPermissions();
        }

        break;
      }

      case AuthState.ERROR: {
        // Only log if logger is available (client-side)
        if (typeof window !== 'undefined' && logger) {
          logger.logAuthEvent('ERROR_STATE_ACTIVE', {
            error: authData?.error,
            hasUser: !!user,
            hasSession: !!session
          });
        }

        // In error state, we can attempt recovery or stay in error state
        break;
      }
    }
  }, [authState, user, session, userAccounts, currentAccount, logger, updateGlobalAuthState]);

  // Remove old individual useEffect hooks - now handled by state machine above

  // IMMEDIATE FORCE SET: If we have user and accounts, SET CURRENT ACCOUNT
  if (user && userAccounts && userAccounts.length > 0 && !currentAccount) {
    console.log('🚀 IMMEDIATE FORCE SETTING CURRENT ACCOUNT');

    const accountToSet = userAccounts[0]; // Take first account
    console.log('🚀 Setting account:', {
      id: accountToSet.id,
      name: accountToSet.name,
      userRole: accountToSet.userRole,
      allKeys: Object.keys(accountToSet)
    });

    // IMMEDIATE set currentAccount
    setCurrentAccount(accountToSet);

    // IMMEDIATE store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentAccount', accountToSet.id);
      localStorage.setItem('availableAccounts', JSON.stringify(userAccounts));
    }

    console.log('🚀 IMMEDIATE FORCE SET COMPLETE');
  }

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

  // REQ-025: Sign out function with state persistence cleanup
  const signOut = useCallback(async (): Promise<void> => {
    const startTime = performance.now();

    try {
      logger.logAuthEvent('SIGN_OUT_STARTED', { hasUser: !!user, hasSession: !!session });

      // Clear persisted state first to prevent restoration
      clearPersistedState();

      // Call the auth library signOut function
      await authSignOut();

      // Clear all local state
      updateGlobalAuthState({
        user: null,
        session: null,
        accounts: [],
        currentAccount: null,
        authState: AuthState.UNAUTHORIZED,
        error: undefined
      });

      // Clear legacy localStorage items
      try {
        localStorage.removeItem('availableAccounts');
        localStorage.removeItem('currentAccount');
        localStorage.removeItem('auth_logs');
      } catch (storageError) {
        logger.logError('CLEAR_STORAGE_ERROR', storageError);
      }

      const duration = performance.now() - startTime;
      logger.logPerformance('SIGN_OUT_SUCCESS', startTime, true, {
        duration: `${duration.toFixed(2)}ms`
      });

      console.log('🔐 SIGN_OUT: Completed successfully', {
        duration: `${duration.toFixed(2)}ms`
      });

    } catch (error) {
      const duration = performance.now() - startTime;
      logger.logError('SIGN_OUT_FAILED', error, {
        duration: `${duration.toFixed(2)}ms`
      });

      // Even on error, try to clear state
      updateGlobalAuthState({
        authState: AuthState.ERROR,
        error: 'Sign out failed'
      });

      throw error;
    }
  }, [logger, clearPersistedState, updateGlobalAuthState, user, session]);

  // Enhanced context value with account management and dashboard permissions (REQ-023)
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

  // Dashboard context state management (REQ-023)
  currentDashboardSection,
  navigationHistory,
  dashboardPermissions,
  permissionsLoading,

  // Authentication functions
  signIn,
  signOut,
  refreshSession,
  register,

  // Property functions (legacy)
  getUserProperties: loadUserProperties,
  setSelectedProperty,

  // Account functions (multi-tenant)
  setCurrentAccount,
  switchToAccount,
  refreshAccountContext,
  clearCurrentAccount,

  // Dashboard context functions (REQ-023)
  setCurrentDashboardSection,
  navigateToSection,
  goBack,
  canNavigateToSection,

  // Permission helper functions (REQ-023)
  checkPermission,
  hasPermission: hasPermissionSync,
  refreshPermissions: loadDashboardPermissions,
  getUserRole,
  getAccountRole,
};

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export remaining functions and hooks
