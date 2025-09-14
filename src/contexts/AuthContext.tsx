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
  authenticateUser,
} from '@/lib/auth';
import { performanceMonitor, startTiming, endTiming, recordTiming } from '@/lib/performance-monitor';
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
  setAuthData: React.Dispatch<React.SetStateAction<AuthStateData | undefined>>
) {
  return (state: AuthState, data?: AuthStateData) => {
    // Log the transition
    console.log(`🔄 AUTH_TRANSITION: ${currentAuthState} → ${state}`, data);

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

// Debug console.log removed for SSR compatibility

// REQ-025: Comprehensive Error Recovery System

/**
 * Error classification and recovery strategies
 */
enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface AuthErrorContext {
  type: AuthErrorType;
  originalError: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  context: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Classify errors and determine recovery strategies
 */
const classifyAuthError = (error: any): AuthErrorType => {
  if (!error) return AuthErrorType.UNKNOWN_ERROR;

  const errorMessage = error.message || error.toString();
  const statusCode = error.status || error.statusCode;

  // Network errors
  if (errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('Failed to fetch') ||
      !navigator.onLine) {
    return AuthErrorType.NETWORK_ERROR;
  }

  // HTTP status based errors
  if (statusCode) {
    if (statusCode === 401) return AuthErrorType.AUTHENTICATION_ERROR;
    if (statusCode === 403) return AuthErrorType.AUTHORIZATION_ERROR;
    if (statusCode === 429) return AuthErrorType.RATE_LIMITED;
    if (statusCode >= 500) return AuthErrorType.SERVER_ERROR;
    if (statusCode >= 400) return AuthErrorType.CLIENT_ERROR;
  }

  // Message based classification
  if (errorMessage.includes('session') ||
      errorMessage.includes('expired') ||
      errorMessage.includes('token')) {
    return AuthErrorType.SESSION_EXPIRED;
  }

  if (errorMessage.includes('auth') ||
      errorMessage.includes('login') ||
      errorMessage.includes('credentials')) {
    return AuthErrorType.AUTHENTICATION_ERROR;
  }

  return AuthErrorType.UNKNOWN_ERROR;
};

/**
 * Determine if error is recoverable
 */
const isRecoverableError = (errorType: AuthErrorType): boolean => {
  switch (errorType) {
    case AuthErrorType.NETWORK_ERROR:
    case AuthErrorType.SESSION_EXPIRED:
    case AuthErrorType.SERVER_ERROR:
      return true;
    case AuthErrorType.AUTHENTICATION_ERROR:
    case AuthErrorType.AUTHORIZATION_ERROR:
    case AuthErrorType.RATE_LIMITED:
    case AuthErrorType.CLIENT_ERROR:
    case AuthErrorType.UNKNOWN_ERROR:
    default:
      return false;
  }
};

/**
 * Calculate retry delay with exponential backoff
 */
const calculateRetryDelay = (retryCount: number, errorType: AuthErrorType): number => {
  const baseDelay = errorType === AuthErrorType.NETWORK_ERROR ? 1000 : 2000;
  const maxDelay = 30000; // 30 seconds max

  // Exponential backoff: baseDelay * 2^retryCount + jitter
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter

  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Comprehensive error recovery function
 */
const handleAuthErrorRecovery = async (
  error: any,
  context: string,
  onRetry?: () => Promise<any>,
  onFallback?: () => Promise<any>
): Promise<{ recovered: boolean; result?: any }> => {
  console.log('AUTH_ERROR_RECOVERY_STARTED:', { context });

  // Try fallback if available
  if (onFallback) {
    try {
      const result = await onFallback();
      return { recovered: true, result };
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }
  }

  return { recovered: false };
};

/**
 * Fallback authentication strategy
 */
const fallbackAuthenticationStrategy = async (): Promise<any> => {
  console.log('🔄 AUTH_FALLBACK: Attempting fallback authentication strategy');

  try {
    // Strategy 1: Try to restore from persisted state
    const restoredState = restoreAuthState();
    if (restoredState && restoredState.authState === AuthState.AUTHENTICATED) {
      console.log('🔄 AUTH_FALLBACK: Successfully restored from persisted state');

      updateGlobalAuthState({
        user: restoredState.user,
        session: restoredState.session,
        accounts: restoredState.accounts,
        currentAccount: restoredState.currentAccount,
        authState: restoredState.authState
      });

      return { success: true, strategy: 'persisted_state' };
    }

    // Strategy 2: Try anonymous/guest mode if applicable
    console.log('🔄 AUTH_FALLBACK: Attempting guest mode');
    // For this application, we don't have guest mode, so we'll just return to login

    return { success: false, strategy: 'guest_mode_not_available' };

  } catch (fallbackError) {
    console.error('🔄 AUTH_FALLBACK: All fallback strategies failed:', fallbackError);
    throw fallbackError;
  }
};

/**
 * Enhanced error state recovery
 */
const recoverFromErrorState = async (): Promise<boolean> => {
  console.log('🔄 ERROR_STATE_RECOVERY: Attempting to recover from error state');

  try {
    // Strategy 1: Clear error state and try fresh authentication
    updateGlobalAuthState({
      authState: AuthState.UNAUTHORIZED,
      error: undefined
    });

    // Wait a moment for state to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Strategy 2: Try to authenticate again
    const authResult = await authenticateUser();

    if (authResult.state === 'AUTHENTICATED') {
      console.log('🔄 ERROR_STATE_RECOVERY: Successfully recovered from error state');
      return true;
    }

    // Strategy 3: If authentication fails, try fallback
    const fallbackResult = await fallbackAuthenticationStrategy();
    if (fallbackResult.success) {
      console.log('🔄 ERROR_STATE_RECOVERY: Successfully recovered using fallback strategy');
      return true;
    }

    console.log('🔄 ERROR_STATE_RECOVERY: Failed to recover from error state');
    return false;

  } catch (recoveryError) {
    console.error('🔄 ERROR_STATE_RECOVERY: Recovery process failed:', recoveryError);

    // Reset to clean unauthorized state
    updateGlobalAuthState({
      authState: AuthState.UNAUTHORIZED,
      user: null,
      session: null,
      accounts: [],
      currentAccount: null,
      error: 'Recovery failed. Please try logging in again.'
    });

    return false;
  }
};

// REQ-025: Enhanced State Persistence and Restoration System

/**
 * Comprehensive state persistence function
 */
const persistAuthState = (state: {
  user: AuthUser | null;
  session: Session | null;
  accounts: Account[];
  currentAccount: Account | null;
  authState: AuthState;
  error?: string;
}) => {
  const persistMetricId = startTiming('STATE_PERSISTENCE', {
    authState: state.authState,
    hasUser: !!state.user,
    accountCount: state.accounts?.length || 0
  });

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

    const duration = performance.now() - parseInt(persistMetricId.split('_')[1]);

    // Record performance metric
    recordTiming('STATE_PERSISTENCE_TOTAL', duration, true, {
      dataSize: JSON.stringify(stateToPersist).length,
      authState: state.authState
    });

    endTiming(persistMetricId, true, {
      duration: `${duration.toFixed(2)}ms`,
      dataSize: JSON.stringify(stateToPersist).length
    });

    // Log persistence success
    console.log('STATE_PERSISTENCE_SUCCESS:', {
      duration: `${duration.toFixed(2)}ms`,
      dataSize: JSON.stringify(stateToPersist).length
    });

    console.log('💾 AUTH_PERSISTENCE: State persisted successfully', {
      hasUser: !!state.user,
      accountCount: state.accounts?.length || 0,
      currentAccountId: state.currentAccount?.id,
      authState: state.authState,
      duration: `${duration.toFixed(2)}ms`
    });

  } catch (error) {
    const duration = performance.now() - parseInt(persistMetricId.split('_')[1]);

    // Record failed performance metric
    recordTiming('STATE_PERSISTENCE_TOTAL', duration, false, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    endTiming(persistMetricId, false, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Log persistence failure
    console.error('STATE_PERSISTENCE_FAILED:', {
      duration: `${duration.toFixed(2)}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Try to clear corrupted data
    try {
      localStorage.removeItem('auth_persisted_state');
      console.warn('💾 AUTH_PERSISTENCE: Cleared corrupted persisted state');
    } catch (clearError) {
      console.error('💾 AUTH_PERSISTENCE: Failed to clear corrupted data:', clearError);
    }
  }
};

/**
 * State restoration function with validation
 */
const restoreAuthState = (): {
  user: AuthUser | null;
  session: Session | null;
  accounts: Account[];
  currentAccount: Account | null;
  authState: AuthState;
  error?: string;
} | null => {
  const restoreMetricId = startTiming('STATE_RESTORATION', { source: 'localStorage' });

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

    const duration = performance.now() - parseInt(restoreMetricId.split('_')[1]);

    // Record successful restoration performance
    recordTiming('STATE_RESTORATION_TOTAL', duration, true, {
      age: `${(age / 1000 / 60).toFixed(1)} minutes`,
      authState: state.authState,
      hasUser: !!state.user,
      accountCount: state.accounts?.length || 0
    });

    endTiming(restoreMetricId, true, {
      duration: `${duration.toFixed(2)}ms`,
      age: `${(age / 1000 / 60).toFixed(1)} minutes`,
      authState: state.authState
    });

    // Log restoration success
    console.log('STATE_RESTORATION_SUCCESS:', {
      duration: `${duration.toFixed(2)}ms`,
      age: `${(age / 1000 / 60).toFixed(1)} minutes`,
      authState: state.authState
    });

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
    const duration = performance.now() - parseInt(restoreMetricId.split('_')[1]);

    // Record failed restoration performance
    recordTiming('STATE_RESTORATION_TOTAL', duration, false, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    endTiming(restoreMetricId, false, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Log restoration failure
    console.error('STATE_RESTORATION_FAILED:', {
      duration: `${duration.toFixed(2)}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Clear corrupted data
    try {
      localStorage.removeItem('auth_persisted_state');
      console.warn('💾 AUTH_RESTORATION: Cleared corrupted persisted state');
    } catch (clearError) {
      console.error('💾 AUTH_RESTORATION: Failed to clear corrupted data:', clearError);
    }

    return null;
  }
};

/**
 * Clear persisted state (used on logout/signout)
 */
const clearPersistedState = () => {
  try {
    localStorage.removeItem('auth_persisted_state');

    console.log('💾 AUTH_PERSISTENCE: Persisted state cleared');
  } catch (error) {
    console.error('💾 AUTH_PERSISTENCE: Failed to clear persisted state:', error);
  }
};

// Debug console.log removed for SSR compatibility

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
  console.log('🔄 AUTH_PROVIDER_MOUNTED: AuthProvider component is mounting!');

  // Core authentication state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // Start with false to test

  // Initialize auth state based on current loading status
  const initialAuthState = loading ? AuthState.LOADING : AuthState.UNAUTHORIZED;

  // REQ-025: Sequential Authentication State Machine state
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [authData, setAuthData] = useState<AuthStateData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // REQ-025: Create comprehensive logging system (safely for SSR)
  const createLogger = createAuthLoggerFactory();
  const logger = {
    logAuthEvent: () => {},
    logStateTransition: () => {},
    logPerformance: () => {},
    logError: () => {}
  };

  // Create transition function with current state and logging
  const transitionTo = createTransitionTo(authState, setAuthState, setAuthData);

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

    console.log('🔄 ATOMIC_STATE_UPDATE_START:', updates);

    // Single atomic update
    if (updates.user !== undefined) {
      setUser(updates.user);
      console.log('🔄 STATE_UPDATE: User updated', { userId: updates.user?.id });
    }
    if (updates.session !== undefined) {
      setSession(updates.session);
      console.log('🔄 STATE_UPDATE: Session updated', { sessionId: updates.session?.user?.id });
    }
    if (updates.accounts !== undefined) {
      setUserAccounts(updates.accounts);
      // Store in localStorage for persistence
      localStorage.setItem('availableAccounts', JSON.stringify(updates.accounts));
      console.log('🔄 STATE_UPDATE: Accounts updated', { accountCount: updates.accounts.length });
    }
    if (updates.currentAccount !== undefined) {
      setCurrentAccount(updates.currentAccount);
      // Store in localStorage for persistence
      if (updates.currentAccount) {
        localStorage.setItem('currentAccount', updates.currentAccount.id);
            } else {
        localStorage.removeItem('currentAccount');
      }
      console.log('🔄 STATE_UPDATE: Current account updated', { accountId: updates.currentAccount?.id });
    }

    // Log state transition (we don't compare with current state to avoid dependency issues)
    console.log('🔄 STATE_TRANSITION:', { to: updates.authState });

    setAuthState(updates.authState);
    setLoading(updates.authState === 'LOADING');

    // REQ-025: Set authInitialized when authentication is successful
    if (updates.authState === AuthState.AUTHENTICATED) {
      setAuthInitialized(true);
      setGlobalAuthInitialized(true);
      console.log('🔄 AUTH_INITIALIZATION_COMPLETE: AuthContext fully initialized');
    } else if (updates.authState === AuthState.UNAUTHORIZED || updates.authState === AuthState.ERROR) {
      setAuthInitialized(true); // Even for errors, initialization is complete
      setGlobalAuthInitialized(false);
      console.log('🔄 AUTH_INITIALIZATION_COMPLETE: AuthContext initialized (unauthenticated)');
    }

    if (updates.error !== undefined) {
      setError(updates.error);
      if (updates.error) {
        console.error('🔄 STATE_UPDATE_ERROR:', updates.error);
      }
    }

    const duration = performance.now() - startTime;

    console.log('🔄 STATE_UPDATE_PERFORMANCE:', { duration: `${duration.toFixed(2)}ms` });

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
        console.error('🔄 PERSISTENCE_AFTER_UPDATE_FAILED:', persistError, {
          authState: updates.authState
        });
      }
    }
  }, [persistAuthState]); // Removed authState to prevent infinite loops

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

  // REQ-025: Initialize state with proper defaults, no emergency overrides during normal init
  const [currentAccount, setCurrentAccount] = useState<Account | null>(getInitialCurrentAccount);
  const [userAccounts, setUserAccounts] = useState<Account[]>(getInitialUserAccounts);

  // EMERGENCY OVERRIDE: Only call this when there's a real emergency during state transitions
  const createEmergencyAccount = useCallback(() => {
    console.log('🚨 EMERGENCY OVERRIDE: Creating emergency account for state recovery');

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

    const forcedAccounts: Account[] = [forcedAccount];

    console.log('🚨 EMERGENCY ACCOUNT CREATED:', forcedAccount);
    setCurrentAccount(forcedAccount);
    setUserAccounts(forcedAccounts);

    return forcedAccount;
  }, []);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // Dashboard context state management (REQ-023)
  const [currentDashboardSection, setCurrentDashboardSection] = useState<DashboardSection>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);
  const [dashboardPermissions, setDashboardPermissions] = useState<DashboardPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // Prevent multiple simultaneous auth initializations
      const [authInitialized, setAuthInitialized] = useState(getGlobalAuthInitialized());
  
  // REQ-025: Prevent infinite authentication attempts by tracking session state
  const [authenticationAttempted, setAuthenticationAttempted] = useState(false);

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
    console.log('🔄 USEEFFECT_TRIGGERED: State machine useEffect is running!');
    const DEBUG_PREFIX = "🔄 STATE_MACHINE:";

    // Temporarily disable logging during build
    console.log(`${DEBUG_PREFIX} State machine triggered`, {
      currentState: authState,
      hasUser: !!user,
      hasSession: !!session,
      userAccountsCount: userAccounts?.length || 0,
      currentAccount: !!currentAccount
    });

    // State machine implementation
    console.log('🔄 STATE_MACHINE_SWITCH:', { authState, hasUser: !!user, hasSession: !!session });
    switch (authState) {
      case AuthState.UNAUTHORIZED: {
        console.log('🔄 ENTERING_UNAUTHORIZED_CASE');
        // Log unauthorized state
        console.log(`${DEBUG_PREFIX} Unauthorized state active`, { attemptingRestoration: true });

        // REQ-025: First try to restore persisted state
        const restoredState = restoreAuthState();
        if (restoredState && restoredState.authState !== AuthState.UNAUTHORIZED) {
          // Only restore if the restored state is different from UNAUTHORIZED to prevent infinite loops
          console.log(`${DEBUG_PREFIX} Restored from persisted state`, { from: AuthState.UNAUTHORIZED, to: restoredState.authState });

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

        // If restored state is also UNAUTHORIZED or null, clear it to prevent infinite restoration attempts
        if (restoredState && restoredState.authState === AuthState.UNAUTHORIZED) {
          console.log('🔄 CLEARING_PERSISTED_UNAUTHORIZED_STATE: Preventing infinite loop');
          clearPersistedState();
        }

        // REQ-025: Only attempt authentication once per session to prevent infinite loops
        if (authenticationAttempted) {
          console.log('🔄 AUTHENTICATION_ALREADY_ATTEMPTED: Skipping authentication to prevent infinite loop');
          return;
        }

        console.log('🔄 STATE_TRANSITION: UNAUTHORIZED → LOADING (First authentication attempt)');
        setAuthenticationAttempted(true);

        // Transition to LOADING state and start authentication
        updateGlobalAuthState({
          authState: AuthState.LOADING,
          error: undefined
        });

        // Call authentication orchestrator with enhanced sequential loading and error recovery
        console.log('🔄 ABOUT_TO_CALL_PERFORM_AUTH: About to call performAuthentication');

        const performAuthentication = async () => {
          console.log('🔄 PERFORM_AUTH_CALLED: Starting authentication process');

          try {
            console.log('🔄 CALLING_AUTHENTICATE_USER: About to call authenticateUser()');
            const result = await authenticateUser();
            console.log('🔄 AUTHENTICATE_USER_RETURNED:', result);
            endTiming(stepMetricId, true, { resultState: result.state });

            const authDuration = performance.now() - parseInt(authMetricId.split('_')[1]);

            // Record overall authentication performance
            recordTiming('AUTH_ORCHESTRATOR_TOTAL', authDuration, result.state === 'AUTHENTICATED', {
              resultState: result.state,
              hasUser: !!result.user,
              accountCount: result.accounts?.length || 0
            });

            console.log('🔄 AUTH_ORCHESTRATOR_SUCCESS:', {
              duration: `${authDuration.toFixed(2)}ms`,
              resultState: result.state,
              resultAction: result.action,
              hasUser: !!result.user,
              hasSession: !!result.session
            });

            if (result.state === 'AUTHENTICATED') {
              console.log('🔄 AUTH_SUCCESS_TRANSITION:', {
                userId: result.user?.id,
                accountCount: result.accounts?.length,
                currentAccountId: result.currentAccount?.id
              });

              updateGlobalAuthState({
                user: result.user,
                session: result.session,
                accounts: result.accounts,
                currentAccount: result.currentAccount,
                authState: AuthState.AUTHENTICATED
              });
            } else if (result.state === 'UNAUTHORIZED') {
              // REQ-025: Handle UNAUTHORIZED state - transition from LOADING to UNAUTHORIZED
              console.log('🔄 AUTH_UNAUTHORIZED_TRANSITION:', {
                from: AuthState.LOADING,
                to: AuthState.UNAUTHORIZED,
                action: result.action
              });

              updateGlobalAuthState({
                user: null,
                session: null,
                accounts: [],
                currentAccount: null,
                authState: AuthState.UNAUTHORIZED
              });
            } else if (result.state === 'ERROR') {
              endTiming(authMetricId, false, { error: result.error });
              throw new Error(result.error || 'Authentication failed');
            }

            endTiming(authMetricId, true, {
              userId: result.user?.id,
              accountCount: result.accounts?.length
            });

      return result;
    } catch (error) {
            endTiming(stepMetricId, false, { error: error.message });
            endTiming(authMetricId, false, { error: error.message });
            throw error;
          }
        };

        // Call authentication directly without complex error recovery
        performAuthentication()
          .then(result => {
            console.log('🔄 AUTH_DIRECT_SUCCESS:', {
              state: result.state,
              action: result.action,
              hasUser: !!result.user
            });
          })
          .catch(error => {
            const authDuration = performance.now() - authStartTime;
            console.error('🔄 AUTH_DIRECT_ERROR:', error, {
              authDuration: `${authDuration.toFixed(2)}ms`,
              authState,
              errorMessage: error.message
            });

            updateGlobalAuthState({
              authState: AuthState.ERROR,
              error: error.message || 'Authentication failed'
            });
          });

        break;
      }

      case AuthState.LOADING: {
        console.log('🔄 ENTERING_LOADING_CASE: Authentication should start now');
        // Handle loading state - authentication is in progress with sequential validation
        console.log('🔄 LOADING_STATE_ACTIVE:', {
          hasUser: !!user,
          hasSession: !!session,
          userAccountsCount: userAccounts?.length || 0,
          hasCurrentAccount: !!currentAccount,
          loadingProgress: `${[!!user, !!session, !!(userAccounts?.length), !!currentAccount].filter(Boolean).length}/4 steps complete`
        });

        // Sequential validation: ensure all data is loaded in correct order
        const loadingSteps = {
          userLoaded: !!user,
          sessionValid: !!session,
          accountsLoaded: !!(userAccounts && userAccounts.length > 0),
          currentAccountSelected: !!currentAccount
        };

        const completedSteps = Object.values(loadingSteps).filter(Boolean).length;
        const totalSteps = Object.keys(loadingSteps).length;

        console.log('🔄 LOADING_PROGRESS:', {
          completedSteps,
          totalSteps,
          progress: `${completedSteps}/${totalSteps}`,
          ...loadingSteps
        });

        // If we have all required data, transition to AUTHENTICATED
        if (completedSteps === totalSteps) {
          console.log('🔄 STATE_TRANSITION: LOADING → AUTHENTICATED (Sequential loading complete)');
          updateGlobalAuthState({
            authState: AuthState.AUTHENTICATED
          });
        } else if (completedSteps === 0 || (!user && !session)) {
          // REQ-025: If no real user/session data is loaded, transition to UNAUTHORIZED
          // This happens when there's no authentication at all, or only emergency fake data
          console.log('🔄 STATE_TRANSITION: LOADING → UNAUTHORIZED (No real authentication found)', {
            completedSteps,
            hasRealUser: !!user,
            hasRealSession: !!session,
            hasEmergencyAccounts: !!(userAccounts?.length && !user),
            hasEmergencyCurrentAccount: !!(currentAccount && !user)
          });
          updateGlobalAuthState({
            user: null,
            session: null,
            accounts: [],
            currentAccount: null,
            authState: AuthState.UNAUTHORIZED
          });
        }

        break;
      }

      case AuthState.AUTHENTICATED: {
        // Log authenticated state
        console.log(`${DEBUG_PREFIX} Authenticated state active`, {
        userId: user?.id,
        currentAccountId: currentAccount?.id,
          userAccountsCount: userAccounts?.length || 0
        });

        // Load dashboard permissions when authenticated
        if (user && currentAccount) {
          loadDashboardPermissions();
        }

        break;
      }

      case AuthState.ERROR: {
        // Log error state
        console.log(`${DEBUG_PREFIX} Error state active`, {
          error: authData?.error,
          hasUser: !!user,
          hasSession: !!session
        });

        // REQ-025: Attempt automatic error recovery
        console.log('🚨 ERROR_STATE: Attempting automatic recovery');

        recoverFromErrorState().then(recovered => {
          if (recovered) {
            console.log('🚨 ERROR_STATE: Automatic recovery successful');
          } else {
            console.log('🚨 ERROR_STATE: Automatic recovery failed, staying in error state');

            // If recovery fails, provide user guidance
            console.log('🔄 ERROR_STATE_RECOVERY_FAILED:', {
              error: authData?.error,
              userGuidance: 'User should try logging in again or check their network connection'
            });
          }
        }).catch(recoveryError => {
          console.error('🚨 ERROR_STATE: Recovery attempt threw exception:', recoveryError);

          console.error('🔄 ERROR_STATE_RECOVERY_EXCEPTION:', recoveryError, {
            originalError: authData?.error
          });
        });

        break;
      }
    }
  }, [authState, user, session, updateGlobalAuthState, recoverFromErrorState, handleAuthErrorRecovery, fallbackAuthenticationStrategy]);

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
          await getUserProperties(result.data.user.id);
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
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<AuthResponse<{ user: AuthUser; session: Session; accounts: Account[]; defaultAccount: Account | null }>> => {
    const startTime = performance.now();
    console.log('🔐 SIGN_IN: Starting sign in process', { email });

    try {
      // Reset the authentication attempted flag since user is manually logging in
      setAuthenticationAttempted(false);
      console.log('🔐 SIGN_IN: Reset authentication attempted flag for manual login');

      // Call the Supabase sign in function
      const result = await authSignIn(email, password);

      if (result.data && !result.error) {
        const duration = performance.now() - startTime;
        console.log('🔐 SIGN_IN: Sign in successful', {
          userId: result.data.user.id,
          email: result.data.user.email,
          duration: `${duration.toFixed(2)}ms`
        });

        // Load accounts for the user
        const accounts = await getAccountsForUser(result.data.user.id);
        const defaultAccount = accounts.length > 0 ? accounts[0] : null;

        // Update auth state
        updateGlobalAuthState({
          user: result.data.user,
          session: result.data.session,
          accounts,
          currentAccount: defaultAccount,
          authState: AuthState.AUTHENTICATED
        });

        return {
          success: true,
          data: {
            user: result.data.user,
            session: result.data.session,
            accounts,
            defaultAccount
          }
        };
      } else {
        const duration = performance.now() - startTime;
        console.error('🔐 SIGN_IN: Sign in failed', {
          error: result.error,
          duration: `${duration.toFixed(2)}ms`
        });

        return {
          success: false,
          error: result.error || 'Sign in failed'
        };
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error('🔐 SIGN_IN: Sign in threw exception', {
        error: error instanceof Error ? error.message : error,
        duration: `${duration.toFixed(2)}ms`
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }, [updateGlobalAuthState]);

  const signOut = useCallback(async (): Promise<void> => {
    const startTime = performance.now();

    try {
      console.log('🔄 SIGN_OUT_STARTED:', { hasUser: !!user, hasSession: !!session });

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
        console.error('🔄 CLEAR_STORAGE_ERROR:', storageError);
      }

      const duration = performance.now() - startTime;
      console.log('🔄 SIGN_OUT_SUCCESS:', {
        duration: `${duration.toFixed(2)}ms`
      });

      console.log('🔐 SIGN_OUT: Completed successfully', {
        duration: `${duration.toFixed(2)}ms`
      });

    } catch (error) {
      const duration = performance.now() - startTime;
      console.error('🔄 SIGN_OUT_FAILED:', error, {
        duration: `${duration.toFixed(2)}ms`
      });

      // Even on error, try to clear state
      updateGlobalAuthState({
        authState: AuthState.ERROR,
        error: 'Sign out failed'
      });

      throw error;
    }
  }, [clearPersistedState, updateGlobalAuthState, user, session]);

  // REQ-025: Refresh account context function
  const refreshAccountContext = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      console.log('🔄 REFRESH_ACCOUNT_CONTEXT: Refreshing account context for user', user.id);

      // Reload accounts for the current user
      const accounts = await getAccountsForUser(user.id);
      const currentAccountId = localStorage.getItem('currentAccount');
      const currentAccount = currentAccountId
        ? accounts.find(acc => acc.id === currentAccountId) || accounts[0]
        : accounts[0];

      // Update the account state
      setUserAccounts(accounts);
      setCurrentAccount(currentAccount);
      
      // Store in localStorage for persistence
      localStorage.setItem('availableAccounts', JSON.stringify(accounts));
      if (currentAccount) {
        localStorage.setItem('currentAccount', currentAccount.id);
      }

      console.log('🔄 REFRESH_ACCOUNT_CONTEXT: Successfully refreshed account context', {
        accountCount: accounts.length,
        currentAccountId: currentAccount?.id
      });
    } catch (error) {
      console.error('🔄 REFRESH_ACCOUNT_CONTEXT: Failed to refresh account context:', error);
    }
  }, [user]);

  // REQ-025: Clear current account function
  const clearCurrentAccount = useCallback(() => {
    console.log('🔄 CLEAR_CURRENT_ACCOUNT: Clearing current account');
    setCurrentAccount(null);
    localStorage.removeItem('currentAccount');
  }, []);

  // REQ-025: Navigate to section function
  const navigateToSection = useCallback((section: DashboardSection, preserveHistory?: boolean) => {
    console.log('🔄 NAVIGATE_TO_SECTION:', { section, preserveHistory });

    setCurrentDashboardSection(section);

    if (preserveHistory) {
      setNavigationHistory(prev => [...prev, {
        section,
        timestamp: Date.now(),
        source: 'navigation'
      }]);
    }
  }, []);

  // REQ-025: Go back function
  const goBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousEntry = navigationHistory[navigationHistory.length - 1];
      console.log('🔄 GO_BACK: Going back to previous section', previousEntry);

      setCurrentDashboardSection(previousEntry.section);
      setNavigationHistory(prev => prev.slice(0, -1)); // Remove the last entry
    } else {
      console.log('🔄 GO_BACK: No navigation history, staying on current section');
    }
  }, [navigationHistory]);

  // REQ-025: Can navigate to section function
  const canNavigateToSection = useCallback((section: DashboardSection): boolean => {
    // Basic permission check - can be expanded based on user roles and permissions
    if (!user) return false;
    if (!currentAccount) return false;

    // All authenticated users with an account can navigate to any section for now
    // This can be extended with more complex permission logic
    return true;
  }, [user, currentAccount]);

  // REQ-025: Check permission function
  const checkPermission = useCallback(async (permission: PermissionKey): Promise<PermissionCheck> => {
    console.log('🔄 CHECK_PERMISSION:', { permission, userId: user?.id, accountId: currentAccount?.id });

    // Basic permission check - can be expanded based on user roles and permissions
    if (!user) {
      return {
        granted: false,
        reason: 'User not authenticated',
        permission,
        userId: null,
        accountId: null
      };
    }

    if (!currentAccount) {
      return {
        granted: false,
        reason: 'No current account selected',
        permission,
        userId: user.id,
        accountId: null
      };
    }

    // Simple permission logic - owners have all permissions, others have limited access
    const userRole = currentAccount.userRole;
    const hasPermission = userRole === 'owner' ||
                         (userRole === 'admin' && ['read', 'write', 'manage'].includes(permission)) ||
                         (userRole === 'member' && ['read', 'write'].includes(permission));

    return {
      granted: hasPermission,
      reason: hasPermission ? 'Permission granted' : 'Insufficient permissions',
      permission,
        userId: user.id,
        accountId: currentAccount.id
    };
  }, [user, currentAccount]);

  // REQ-025: Has permission sync function (synchronous version)
  const hasPermissionSync = useCallback((permission: PermissionKey): boolean => {
    // Synchronous version of permission check
    if (!user) return false;
    if (!currentAccount) return false;

    // Simple permission logic - owners have all permissions, others have limited access
    const userRole = currentAccount.userRole;
    return userRole === 'owner' ||
           (userRole === 'admin' && ['read', 'write', 'manage'].includes(permission)) ||
           (userRole === 'member' && ['read', 'write'].includes(permission));
  }, [user, currentAccount]);

  // REQ-025: Load dashboard permissions function
  const loadDashboardPermissions = useCallback(async (): Promise<void> => {
    if (!user || !currentAccount) {
      console.log('🔄 LOAD_DASHBOARD_PERMISSIONS: No user or current account, skipping');
      return;
    }

    console.log('🔄 LOAD_DASHBOARD_PERMISSIONS: Loading permissions for user', user.id);

    try {
      // Load permissions based on user role and account
      const userRole = currentAccount.userRole;
      const permissions: Record<string, boolean> = {};

      // Define permissions based on role
      if (userRole === 'owner') {
        permissions.read = true;
        permissions.write = true;
        permissions.manage = true;
        permissions.delete = true;
        permissions.admin = true;
      } else if (userRole === 'admin') {
        permissions.read = true;
        permissions.write = true;
        permissions.manage = true;
        permissions.delete = false;
        permissions.admin = false;
      } else if (userRole === 'member') {
        permissions.read = true;
        permissions.write = true;
        permissions.manage = false;
        permissions.delete = false;
        permissions.admin = false;
      } else {
        permissions.read = true;
        permissions.write = false;
        permissions.manage = false;
        permissions.delete = false;
        permissions.admin = false;
      }

      setDashboardPermissions(permissions);
      console.log('🔄 LOAD_DASHBOARD_PERMISSIONS: Successfully loaded permissions', permissions);
    } catch (error) {
      console.error('🔄 LOAD_DASHBOARD_PERMISSIONS: Failed to load permissions:', error);
    }
  }, [user, currentAccount]);

  // REQ-025: Get user role function
  const getUserRole = useCallback((): UserRole => {
    if (!currentAccount) {
      console.log('🔄 GET_USER_ROLE: No current account, returning viewer');
      return 'viewer';
    }

    const role = currentAccount.userRole;
    console.log('🔄 GET_USER_ROLE: User role is', role);
    return role;
  }, [currentAccount]);

  // REQ-025: Get account role function
  const getAccountRole = useCallback(async (): Promise<AccountRole | null> => {
    if (!currentAccount) {
      console.log('🔄 GET_ACCOUNT_ROLE: No current account, returning null');
      return null;
    }

    console.log('🔄 GET_ACCOUNT_ROLE: Account role is', currentAccount.userRole);
    return currentAccount.userRole as AccountRole;
  }, [currentAccount]);

  // Enhanced context value with account management and dashboard permissions (REQ-023)
  const contextValue: AuthContextType = {
    // Core authentication
    user,
    session,
    loading,
    authState, // REQ-025: Add authState for sequential authentication state machine
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
    getUserProperties,
    setSelectedProperty,

    // Account functions (multi-tenant)
    setCurrentAccount,
    switchToAccount: switchAccount,
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

// REQ-025: useAccountContext hook for backward compatibility
export function useAccountContext() {
  const { userAccounts, currentAccount, authState } = useAuth();
  
  return {
    userAccounts,
    currentAccount,
    authState,
    loading: authState === AuthState.LOADING,
    error: null, // Simplified for compatibility
    // Add any other account context methods as needed
  };
}

// Hook to use authentication context
export function useAuth() {
  console.log('🔄 USEAUTH_CALLED: useAuth hook is being called!');
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export remaining functions and hooks
