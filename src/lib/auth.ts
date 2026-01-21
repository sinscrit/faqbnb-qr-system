import { supabase, supabaseAdmin } from './supabase';
import { Session } from '@supabase/supabase-js';
import { Account, AccountRole } from '@/types';

// Auth utility types with account context
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  isSystemAdmin?: boolean; // Added for REQ-016: System Admin Back Office
  // Account context for multi-tenant system
  currentAccount?: {
    id: string;
    name: string;
    role: string; // User's role in this specific account
    isOwner: boolean;
  } | null;
  availableAccounts?: Account[];
}

// Enhanced auth response with account context
export interface AuthContextResponse {
  user: AuthUser | null;
  accounts: Account[];
  currentAccount: Account | null;
  isLoading: boolean;
  error?: string;
}

// Account switching response
export interface AccountSwitchResponse {
  success: boolean;
  account?: Account;
  userRole?: string;
  error?: string;
}

// Property and user types for multi-tenant system
export interface Property {
  id: string;
  userId: string;
  propertyTypeId: string;
  nickname: string;
  address?: string;
  createdAt: string | null;
  updatedAt: string | null;
  accountId: string | null; // Added for multi-tenant support
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string | null;
  role: string | null;
  profilePicture?: string;
  authProvider?: string;
  createdAt: string;
  updatedAt: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthResponse<T = unknown> {
  data?: T;
  error?: string;
}

/**
 * Enhanced sign in with email and password that includes account context
 */
export async function signInWithEmail(
  email: string, 
  password: string
): Promise<AuthResponse<{ user: AuthUser; session: Session; accounts: Account[]; defaultAccount: Account | null }>> {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user || !data.session) {
      return { error: 'Login failed - no user or session returned' };
    }

    // Verify user is an admin
    if (!data.user.email) {
      await supabase.auth.signOut();
      return { error: 'Access denied - no email in user data' };
    }

    // Check if user is an admin using admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('email', data.user.email)
      .single();

    const isAdminByTable = !adminError && adminUser;

    // Check if user exists in our users table (regular users)
    const { data: regularUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', data.user.id)
      .single();

    const isRegularUser = !userError && regularUser;

    if (!isAdminByTable && !isRegularUser) {
      // Sign out if user is neither admin nor regular user
      await supabase.auth.signOut();
      return { error: 'Access denied - user not found in system' };
    }

    // Get user's available accounts
    const accounts = await getAccountsForUser(data.user.id);
    console.log('🔍 GETUSER_DEBUG: Accounts loaded from getAccountsForUser', {
      userId: data.user.id,
      accountsCount: accounts.length,
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        hasUserRole: !!acc.userRole,
        userRole: acc.userRole
      }))
    });
    
    // Get default account (first owned account or first available)
    const defaultAccount = await getDefaultAccountForUser(data.user.id) || 
                          (accounts.length > 0 ? accounts[0] : null);

    // Get user's role in the default account
    let currentAccountContext = null;
    if (defaultAccount) {
      const userRole = await getUserRoleInAccount(data.user.id, defaultAccount.id);
      currentAccountContext = {
        id: defaultAccount.id,
        name: defaultAccount.name,
        role: userRole || 'member',
        isOwner: defaultAccount.owner_id === data.user.id
      };
    }

    // Create user object based on whether they're admin or regular user
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      fullName: (isAdminByTable ? adminUser.full_name : regularUser?.full_name) || undefined,
      role: (isAdminByTable ? adminUser.role : 'user') || undefined,
      currentAccount: currentAccountContext,
      availableAccounts: accounts
    };

    console.log('🔍 GETUSER_DEBUG: Final return data', {
      userId: authUser.id,
      userEmail: authUser.email,
      accountsCount: accounts.length,
      hasCurrentAccount: !!currentAccountContext,
      currentAccountRole: currentAccountContext?.role,
      availableAccountsWithRoles: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        userRole: acc.userRole
      }))
    });

    return {
      data: {
        user: authUser,
        session: data.session,
        accounts,
        defaultAccount
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'An unexpected error occurred during sign in' };
  }
}

/**
 * Enhanced sign out that clears account context
 */
export async function signOut(): Promise<AuthResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }

    // Clear any cached account context
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentAccount');
      localStorage.removeItem('availableAccounts');
    }

    return { data: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'An unexpected error occurred during sign out' };
  }
}

/**
 * Get current session from Supabase with enhanced validation
 */
export async function getSession(): Promise<AuthResponse<Session | null>> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { error: error.message };
    }

    // Check session timeout
    if (session && session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      
      if (now > expiresAt) {
        // Session expired - clear account context
        await signOut();
        return { data: null };
      }
    }

    return { data: session };
  } catch (error) {
    console.error('Get session error:', error);
    return { error: 'Failed to retrieve session' };
  }
}

/**
 * Enhanced user information retrieval with account context
 * Optimized with LEFT JOIN queries for better performance
 */
export async function getUser(): Promise<AuthResponse<AuthUser | null>> {
  try {
    console.log('🔍 AUTH_DEBUG: getUser() called with enhanced account role fetching');
    const sessionResponse = await getSession();

    if (sessionResponse.error || !sessionResponse.data) {
      return { data: null };
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { data: null };
    }

    if (!user.email) {
      return { data: null };
    }

    // Enhanced logging for Gmail OAuth users
    const isGmailUser = user.email?.endsWith('@gmail.com');
    const isOAuthProvider = user.app_metadata?.provider === 'google';
    
    if (isGmailUser || isOAuthProvider) {
      console.log('🔍 GMAIL_OAUTH_DEBUG: User authentication detected', {
        timestamp: new Date().toISOString(),
        email: user.email,
        userId: user.id,
        provider: user.app_metadata?.provider,
        isGmailUser,
        isOAuthProvider,
        emailDomain: user.email?.split('@')[1],
        fullUserObject: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          phone: user.phone,
          created_at: user.created_at,
          updated_at: user.updated_at,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata,
          identities: user.identities
        }
      });
    }



    // First check if user is an admin (check both admin_users table and is_admin flag)
    const debugInfo = {
      userId: user.id,
      userEmail: user.email,
      emailLength: user.email?.length,
      emailCharCodes: user.email?.split('').map(c => c.charCodeAt(0)),
      authProvider: user.app_metadata?.provider,
      userMetadata: user.user_metadata
    };
    
    console.log('🔍 AUTH_DEBUG: Checking admin status for user:', debugInfo);
    
    // Extra logging for Gmail users
    if (isGmailUser || isOAuthProvider) {
      console.log('🔍 GMAIL_OAUTH_DEBUG: About to check admin_users table for Gmail user', {
        timestamp: new Date().toISOString(),
        email: user.email,
        emailBytes: new TextEncoder().encode(user.email),
        normalizedEmail: user.email?.toLowerCase().trim(),
        // Hardcoded credentials removed - all users go through standard Supabase auth
      });
    }
    
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('email', user.email)
      .single();
      
    console.log('🔍 AUTH_DEBUG: Admin user query result:', {
      adminUser,
      adminError: adminError?.message,
      adminErrorCode: adminError?.code,
      adminErrorDetails: adminError?.details
    });
    
    // Detailed Gmail OAuth logging for admin query
    if (isGmailUser || isOAuthProvider) {
      console.log('🔍 GMAIL_OAUTH_DEBUG: Admin query result for Gmail user', {
        timestamp: new Date().toISOString(),
        queryEmail: user.email,
        foundAdminUser: !!adminUser,
        adminUserData: adminUser,
        hasError: !!adminError,
        errorDetails: {
          message: adminError?.message,
          code: adminError?.code,
          details: adminError?.details,
          hint: adminError?.hint
        },
        sqlState: adminError?.code,
        isRLSError: adminError?.message?.includes('policy') || adminError?.message?.includes('RLS'),
        is406Error: adminError?.code === '406' || adminError?.message?.includes('406')
      });
    }

    // REMOVED: First users table query using regular client (was causing RLS issues)
    // We'll do the proper users table query later with admin client for regular users
    const userInfo = null; // Legacy variable kept for compatibility
    const userInfoError = null;

    const isAdminByTable = !adminError && adminUser;
    
    // All users go through standard Supabase admin_users table - no hardcoded privileges
    const isOAuthUser = user.app_metadata?.provider === 'google';
    
    console.log('🔍 AUTH_DEBUG: Admin check results:', {
      isAdminByTable,
      isOAuthUser,
      finalIsAdmin: isAdminByTable,
      willProceedToRegularUserCheck: !isAdminByTable
    });
    
    // SOLUTION 1: Comprehensive debug flow tracking with unique filter
    console.error('🔍 IOI7-DEBUG-FLOW: CHECKPOINT-A - After admin check', { 
      isAdminByTable, 
      userId: user.id, 
      timestamp: new Date().toISOString() 
    });
    
    console.log('🔍 AUTH_DEBUG: About to check isAdminByTable condition');
    
    // Final decision logging for Gmail/OAuth users
    if (isGmailUser || isOAuthProvider) {
      console.log('🔍 GMAIL_OAUTH_DEBUG: Final admin decision for Gmail user', {
        timestamp: new Date().toISOString(),
        email: user.email,
        decision: {
          isAdminByTable,
          isOAuthUser,
          finalIsAdmin: isAdminByTable,
          willGrantAccess: isAdminByTable
        },
        reasoning: {
          foundInAdminTable: isAdminByTable,
          isGoogleOAuth: isOAuthUser,
          standardAuthOnly: true
        }
      });
    }

    console.error('🔍 IOI7-DEBUG-FLOW: CHECKPOINT-B - Before isAdminByTable check', { 
      isAdminByTable, 
      aboutToTakeAdminPath: isAdminByTable 
    });
    
    if (isAdminByTable) {
      console.error('🔍 IOI7-DEBUG-FLOW: CHECKPOINT-C - Taking ADMIN path', {
        userId: user.id
      });
      // User is an admin - get account context with optimized LEFT JOIN query
      const accounts = await getAccountsForUser(user.id);

      // Try to get current account from localStorage or use default
      let currentAccount = null;
      if (typeof window !== 'undefined') {
        const storedAccountId = localStorage.getItem('currentAccount');
        if (storedAccountId) {
          currentAccount = accounts.find(acc => acc.id === storedAccountId) || null;
        }
      }

      if (!currentAccount && accounts.length > 0) {
        currentAccount = await getDefaultAccountForUser(user.id) || accounts[0];
      }

      let currentAccountContext = null;
      if (currentAccount) {
        // Enhanced: Get user role with improved error handling and logging
        const userRole = await getUserRoleInAccount(user.id, currentAccount.id);
        console.log('🔍 AUTH_DEBUG: Admin user account role lookup', {
          userId: user.id,
          accountId: currentAccount.id,
          role: userRole,
          accountOwner: currentAccount.owner_id
        });
        currentAccountContext = {
          id: currentAccount.id,
          name: currentAccount.name,
          role: userRole || 'member',
          isOwner: currentAccount.owner_id === user.id
        };
      }

      // Prioritize admin_users data if available, else use users table data, else OAuth user data
      const finalUserInfo = isAdminByTable ? adminUser : (userInfo || {
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        role: 'admin'
      });
      
      const authUser: AuthUser = {
        id: user.id,
        email: finalUserInfo.email,
        fullName: finalUserInfo.full_name || undefined,
        role: finalUserInfo.role || undefined,
        currentAccount: currentAccountContext,
        availableAccounts: accounts
      };
      
      // Log successful authentication for Gmail users
      if (isGmailUser || isOAuthProvider) {
        console.log('🔍 GMAIL_OAUTH_DEBUG: Successfully authenticated Gmail user', {
          timestamp: new Date().toISOString(),
          authUser: {
            id: authUser.id,
            email: authUser.email,
            fullName: authUser.fullName,
            role: authUser.role,
            accountsCount: authUser.availableAccounts?.length || 0,
            currentAccountId: authUser.currentAccount?.id
          },
          accessMethod: 'admin_table'
        });
      }
      
      return { data: authUser };
    }

    console.error('🔍 IOI7-DEBUG-FLOW: CHECKPOINT-D - Taking REGULAR USER path', {
      timestamp: new Date().toISOString(),
      isAdminByTable,
      userEmail: user.email,
      userId: user.id,
      message: 'Admin check complete, now checking for regular user'
    });

    // Check if user is a regular user
    // FIXED: Use supabaseAdmin for initial user data retrieval to bypass RLS policies
    // This is necessary because regular users might not have their auth context properly established yet
    const { data: regularUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .single();

    console.error('🔍 IOI7-DEBUG-FLOW: CHECKPOINT-E - Regular user query result', {
      regularUser,
      userError: userError?.message,
      userErrorCode: userError?.code,
      userErrorDetails: userError?.details,
      queryUserId: user.id,
      usingAdminClient: true,
      querySuccess: !userError && !!regularUser
    });

    if (userError || !regularUser) {
      // Enhanced debugging for regular user access failure
      console.log('🔍 AUTH_DEBUG: Regular user access failed', {
        timestamp: new Date().toISOString(),
        email: user.email,
        userId: user.id,
        errorDetails: {
          message: userError?.message,
          code: userError?.code,
          details: userError?.details,
          hint: userError?.hint
        },
        isRLSError: userError?.message?.includes('policy') || userError?.message?.includes('RLS'),
        is406Error: userError?.code === '406' || userError?.message?.includes('406'),
        checkedSources: {
          adminUsersTable: !isAdminByTable,
          usersTable: userError?.message || 'not found'
        },
        suggestedAction: 'User not found in users table - may need to be created'
      });
      
      // Log access denial for Gmail users
      if (isGmailUser || isOAuthProvider) {
        console.log('🔍 GMAIL_OAUTH_DEBUG: Access denied for Gmail user', {
          timestamp: new Date().toISOString(),
          email: user.email,
          userId: user.id,
          reason: 'Not found in admin_users table and users table query failed',
          checkedSources: {
            adminUsersTable: !isAdminByTable,
            usersTable: userError?.message || 'not found'
          },
          suggestedAction: 'User needs to be added to users table or admin_users table'
        });
      }
      return { data: null };
    }

    // Get account context for regular user
    // FIXED: Handle cases where regular users might not have accounts yet
    // This prevents the authentication from failing for users without account setup
    let accounts: Account[] = [];
    let currentAccount = null;
    let currentAccountContext = null;
    
    try {
      accounts = await getAccountsForUser(user.id);
      console.log('🔍 AUTH_DEBUG: Regular user accounts loaded:', {
        userId: user.id,
        accountsCount: accounts.length,
        accountIds: accounts.map(acc => acc.id)
      });
      
      // Regular users typically have access to fewer accounts
      if (typeof window !== 'undefined') {
        const storedAccountId = localStorage.getItem('currentAccount');
        if (storedAccountId) {
          currentAccount = accounts.find(acc => acc.id === storedAccountId) || null;
        }
      }
      
      if (!currentAccount && accounts.length > 0) {
        currentAccount = await getDefaultAccountForUser(user.id) || accounts[0];
      }

      if (currentAccount) {
        // Enhanced: Get user role with improved error handling and logging
        const userRole = await getUserRoleInAccount(user.id, currentAccount.id);
        console.log('🔍 AUTH_DEBUG: Regular user account role lookup', {
          userId: user.id,
          accountId: currentAccount.id,
          role: userRole,
          accountOwner: currentAccount.owner_id
        });
        currentAccountContext = {
          id: currentAccount.id,
          name: currentAccount.name,
          role: userRole || 'member',
          isOwner: currentAccount.owner_id === user.id
        };
      }
    } catch (accountError) {
      console.log('🔍 AUTH_DEBUG: Account context loading failed for regular user (this is OK for new users):', {
        userId: user.id,
        email: user.email,
        error: accountError instanceof Error ? accountError.message : String(accountError)
      });
      // Continue without account context - this is acceptable for regular users
    }

    const authUser: AuthUser = {
      id: user.id,
      email: regularUser.email,
      fullName: regularUser.full_name || undefined,
      role: regularUser.role || undefined,
      currentAccount: currentAccountContext,
      availableAccounts: accounts
    };

    return { data: authUser };
  } catch (error) {
    console.error('Get user error:', error);
    return { error: 'Failed to retrieve user information' };
  }
}

/**
 * Switch user's current account context
 */
export async function switchAccount(accountId: string): Promise<AccountSwitchResponse> {
  try {
    const userResponse = await getUser();
    
    if (userResponse.error || !userResponse.data) {
      return { success: false, error: 'User not authenticated' };
    }

    const user = userResponse.data;
    
    // Verify user has access to the requested account
    const hasAccess = await canAccessAccount(user.id, accountId);
    if (!hasAccess) {
      return { success: false, error: 'Access denied to requested account' };
    }

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return { success: false, error: 'Account not found' };
    }

    // Get user's role in the account
    const userRole = await getUserRoleInAccount(user.id, accountId);
    
    // Store current account in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentAccount', accountId);
    }

    const accountData: Account = {
      id: account.id,
      owner_id: account.owner_id,
      name: account.name,
      description: account.description,
      settings: (account.settings || {}) as Record<string, unknown>,
      created_at: account.created_at,
      updated_at: account.updated_at,
      userRole: userRole as AccountRole | null
    };

    return {
      success: true,
      account: accountData,
      userRole: userRole || 'member'
    };
  } catch (error) {
    console.error('Switch account error:', error);
    return { success: false, error: 'Failed to switch account' };
  }
}

/**
 * Create dedicated function to fetch account data with user's role
 * Uses LEFT JOIN for optimal performance
 */
export async function getAccountWithUserRole(accountId: string, userId: string): Promise<Account & { userRole: string | null } | null> {
  try {
    console.log('🔍 AUTH_DEBUG: Fetching account with user role', {
      accountId,
      userId
    });

    // Type for the query result with joined data
    type AccountWithJoin = {
      id: string;
      owner_id: string;
      name: string;
      description: string | null;
      created_at: string | null;
      updated_at: string | null;
      account_users?: Array<{ role: string }>;
    };

    // Use LEFT JOIN to get account data with user's role in one query
    const { data: accountData, error } = await supabaseAdmin
      .from('accounts')
      .select(`
        id,
        owner_id,
        name,
        description,
        created_at,
        updated_at,
        account_users!left(role)
      `)
      .eq('id', accountId)
      .eq('account_users.user_id', userId)
      .single() as { data: AccountWithJoin | null; error: unknown };

    if (error) {
      console.log('🔍 AUTH_DEBUG: Account with role query failed', {
        error: String(error || ''),
        accountId,
        userId
      });
      return null;
    }

    if (!accountData) {
      console.log('🔍 AUTH_DEBUG: No account found', { accountId, userId });
      return null;
    }

    // Extract user role from the joined data
    const userRole = (accountData.account_users?.[0]?.role as AccountRole | null) || null;

    console.log('🔍 AUTH_DEBUG: Account with role fetched successfully', {
      accountId,
      userId,
      accountName: accountData.name,
      userRole
    });

    return {
      id: accountData.id,
      owner_id: accountData.owner_id,
      name: accountData.name,
      description: accountData.description,
      settings: {} as Record<string, unknown>, // Default empty settings
      created_at: accountData.created_at,
      updated_at: accountData.updated_at,
      userRole
    };
  } catch (error) {
    console.error('Get account with user role error:', error);
    return null;
  }
}

/**
 * Get user's role in a specific account - Enhanced with detailed logging and error handling
 */
export async function getUserRoleInAccount(userId: string, accountId: string): Promise<string | null> {
  try {
    console.log('🔍 AUTH_DEBUG: getUserRoleInAccount called', {
      userId,
      accountId,
      timestamp: new Date().toISOString()
    });

    // FIXED: Use supabaseAdmin to ensure consistent access for regular users
    const { data: membership, error } = await supabaseAdmin
      .from('account_users')
      .select('role')
      .eq('user_id', userId)
      .eq('account_id', accountId)
      .single();

    if (error) {
      console.log('🔍 AUTH_DEBUG: getUserRoleInAccount query error', {
        userId,
        accountId,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      // Provide specific error feedback based on error type
      if (error.code === 'PGRST116') {
        console.log('🔍 AUTH_DEBUG: User is not a member of this account', { userId, accountId });
        return null; // User not found in account_users table
      }

      return null;
    }

    if (!membership) {
      console.log('🔍 AUTH_DEBUG: No membership found despite no error', {
        userId,
        accountId
      });
      return null;
    }

    console.log('🔍 AUTH_DEBUG: getUserRoleInAccount successful', {
      userId,
      accountId,
      role: membership.role
    });

    return membership.role;
  } catch (error) {
    console.error('🔍 AUTH_DEBUG: getUserRoleInAccount exception:', {
      userId,
      accountId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

/**
 * Clear current account context (useful for account switching)
 */
export function clearAccountContext(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentAccount');
  }
}

/**
 * Get stored current account ID from localStorage
 */
export function getStoredCurrentAccountId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentAccount');
  }
  return null;
}

/**
 * Server-side auth requirement helper with account context
 */
export async function requireAuth(): Promise<AuthUser> {
  const userResponse = await getUser();
  
  if (userResponse.error) {
    throw new Error(`Authentication error: ${userResponse.error}`);
  }
  
  if (!userResponse.data) {
    throw new Error('Authentication required');
  }

  if (!isAdmin(userResponse.data)) {
    throw new Error('Admin privileges required');
  }

  return userResponse.data;
}

/**
 * Enhanced auth requirement with account context validation
 */
export async function requireAuthWithAccount(requiredAccountId?: string): Promise<{ user: AuthUser; account: Account | null }> {
  const user = await requireAuth();
  
  let account = null;
  if (requiredAccountId) {
    // Verify user has access to required account
    const hasAccess = await canAccessAccount(user.id, requiredAccountId);
    if (!hasAccess) {
      throw new Error('Access denied to required account');
    }
    
    const { data: accountData, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', requiredAccountId)
      .single();
      
    if (error || !accountData) {
      throw new Error('Required account not found');
    }
    
    account = {
      id: accountData.id,
      owner_id: accountData.owner_id,
      name: accountData.name,
      description: accountData.description,
      settings: (accountData.settings || {}) as Record<string, unknown>,
      created_at: accountData.created_at,
      updated_at: accountData.updated_at
    };
  } else if (user.currentAccount) {
    // Use user's current account context
    const { data: accountData, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', user.currentAccount.id)
      .single();
      
    if (!error && accountData) {
      account = {
        id: accountData.id,
        owner_id: accountData.owner_id,
        name: accountData.name,
        description: accountData.description,
        settings: (accountData.settings || {}) as Record<string, unknown>,
        created_at: accountData.created_at,
        updated_at: accountData.updated_at
      };
    }
  }
  
  return { user, account };
}

/**
 * Check if a user has admin role
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'superadmin';
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<AuthResponse<Session | null>> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      return { error: error.message };
    }

    return { data: session };
  } catch (error) {
    console.error('Refresh session error:', error);
    return { error: 'Failed to refresh session' };
  }
}

/**
 * Check if session is about to expire (within 5 minutes)
 */
export function isSessionExpiringSoon(session: Session | null): boolean {
  if (!session || !session.expires_at) {
    return false;
  }

  const expiresAt = new Date(session.expires_at * 1000);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  return expiresAt <= fiveMinutesFromNow;
}

/**
 * Enhanced property access check with account context
 */
export async function canAccessProperty(userId: string, propertyId: string, accountId?: string): Promise<boolean> {
  try {
    // First check if user is an admin (admins can access all properties)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .single();

    if (adminUser && adminUser.role === 'admin') {
      return true;
    }

    // Check if property exists and get its account context
    const { data: property, error } = await supabase
      .from('properties')
      .select('user_id, account_id')
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      return false;
    }

    // If account context is specified, property must belong to that account
    if (accountId && property.account_id !== accountId) {
      return false;
    }

    // Check if user owns the property
    if (property.user_id === userId) {
      return true;
    }

    // Check if user has access to the property's account
    if (property.account_id) {
      return await canAccessAccount(userId, property.account_id);
    }

    return false;
  } catch (error) {
    console.error('Can access property error:', error);
    return false;
  }
}

/**
 * Get all properties for a specific user with account filtering
 */
export async function getUserProperties(userId: string, accountId?: string): Promise<Property[]> {
  try {
    let query = supabase
      .from('properties')
      .select(`
        id,
        user_id,
        property_type_id,
        nickname,
        address,
        account_id,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filter by account if specified
    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data: properties, error } = await query;

    if (error) {
      console.error('Get user properties error:', error);
      return [];
    }

    return (properties || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      propertyTypeId: p.property_type_id,
      nickname: p.nickname,
      address: p.address || undefined,
      accountId: p.account_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  } catch (error) {
    console.error('Get user properties error:', error);
    return [];
  }
}

/**
 * Create a new regular user in the multi-tenant system
 * If user already exists, returns the existing user instead of failing
 * Last Modified: 2026-01-16 - Added existing user check to handle OAuth re-registration
 */
export async function createUser(
  authUser: Pick<User, 'id' | 'email'> & {
    fullName?: string;
    role?: string;
    profilePicture?: string;
    authProvider?: string;
  }
): Promise<AuthResponse<User>> {
  try {
    // First, check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // If user exists, return them (handles re-registration attempts)
    if (existingUser && !fetchError) {
      console.log('createUser: User already exists, returning existing user', {
        userId: existingUser.id,
        email: existingUser.email
      });

      const user: User = {
        id: existingUser.id,
        email: existingUser.email,
        fullName: existingUser.full_name || undefined,
        full_name: existingUser.full_name,
        role: existingUser.role || 'user',
        profilePicture: existingUser.profile_picture || undefined,
        authProvider: existingUser.auth_provider || undefined,
        createdAt: existingUser.created_at || new Date().toISOString(),
        updatedAt: existingUser.updated_at || new Date().toISOString(),
        created_at: existingUser.created_at,
        updated_at: existingUser.updated_at,
      };

      return { data: user };
    }

    // User doesn't exist, create new one
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.fullName || null,
        role: authUser.role || 'user',
        profile_picture: authUser.profilePicture || null,
        auth_provider: authUser.authProvider || 'email',
      })
      .select()
      .single();

    if (error) {
      return { error: `Failed to create user: ${error.message}` };
    }

    const user: User = {
      id: data.id,
      email: data.email,
      fullName: data.full_name || undefined,
      full_name: data.full_name,
      role: data.role || 'user',
      profilePicture: data.profile_picture || undefined,
      authProvider: data.auth_provider || undefined,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { data: user };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: 'Failed to create user record' };
  }
}

/**
 * Enhanced property ownership check with account context
 */
export async function isPropertyOwner(userId: string, propertyId: string, accountId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('properties')
      .select('user_id, account_id')
      .eq('id', propertyId);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data: property, error } = await query.single();

    if (error || !property) {
      return false;
    }

    return property.user_id === userId;
  } catch (error) {
    console.error('Is property owner error:', error);
    return false;
  }
}

/**
 * Create a default account for a new user
 * If user already has an account as owner, returns the existing account
 * Last Modified: 2026-01-16 - Added existing account check to handle OAuth re-registration
 */
export async function createDefaultAccount(
  userId: string,
  userEmail: string
): Promise<AuthResponse<Account>> {
  try {
    console.log('🏢 CREATE_DEFAULT_ACCOUNT_START', {
      timestamp: new Date().toISOString(),
      userId: userId,
      userEmail: userEmail
    });

    // First, check if user already has an account as owner
    const { data: existingAccount, error: fetchError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('owner_id', userId)
      .single();

    // If user already has an account, return it
    if (existingAccount && !fetchError) {
      console.log('🏢 CREATE_DEFAULT_ACCOUNT_EXISTS', {
        timestamp: new Date().toISOString(),
        accountId: existingAccount.id,
        accountName: existingAccount.name,
        ownerId: existingAccount.owner_id,
        message: 'User already has an account, returning existing'
      });

      const account: Account = {
        id: existingAccount.id,
        name: existingAccount.name,
        description: existingAccount.description,
        owner_id: existingAccount.owner_id,
        settings: (existingAccount.settings && typeof existingAccount.settings === 'object') ? existingAccount.settings as Record<string, any> : {},
        created_at: existingAccount.created_at || new Date().toISOString(),
        updated_at: existingAccount.updated_at || new Date().toISOString(),
      };

      return { data: account };
    }

    // Create account record
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .insert({
        owner_id: userId,
        name: 'Default Account',
        description: `Default account for ${userEmail}`,
        settings: {}
      })
      .select()
      .single();

    if (error) {
      console.error('🏢 CREATE_DEFAULT_ACCOUNT_ERROR', {
        timestamp: new Date().toISOString(),
        error: error.message,
        userId: userId
      });
      return { error: `Failed to create default account: ${error.message}` };
    }

    const account: Account = {
      id: data.id,
      name: data.name,
      description: data.description,
      owner_id: data.owner_id,
      settings: (data.settings && typeof data.settings === 'object') ? data.settings as Record<string, any> : {},
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };

    console.log('🏢 CREATE_DEFAULT_ACCOUNT_SUCCESS', {
      timestamp: new Date().toISOString(),
      accountId: account.id,
      accountName: account.name,
      ownerId: account.owner_id
    });

    return { data: account };
  } catch (error) {
    console.error('🏢 CREATE_DEFAULT_ACCOUNT_ERROR:', error);
    return { error: 'Failed to create default account' };
  }
}

/**
 * Link a user to an account with a specific role
 */
export async function linkUserToAccount(
  userId: string, 
  accountId: string, 
  role: 'owner' | 'admin' | 'member' | 'viewer' = 'owner'
): Promise<AuthResponse<{ accountId: string; userId: string; role: string }>> {
  try {
    console.log('🔗 LINK_USER_TO_ACCOUNT_START', {
      timestamp: new Date().toISOString(),
      userId: userId,
      accountId: accountId,
      role: role
    });

    // Create account_users relationship
    const { data, error } = await supabaseAdmin
      .from('account_users')
      .insert({
        account_id: accountId,
        user_id: userId,
        role: role,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Check for duplicate relationship error
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        console.log('🔗 LINK_USER_TO_ACCOUNT_DUPLICATE', {
          timestamp: new Date().toISOString(),
          userId: userId,
          accountId: accountId,
          message: 'User already linked to account'
        });
        return { 
          data: { 
            accountId: accountId, 
            userId: userId, 
            role: role 
          } 
        };
      }

      console.error('🔗 LINK_USER_TO_ACCOUNT_ERROR', {
        timestamp: new Date().toISOString(),
        error: error.message,
        code: error.code,
        userId: userId,
        accountId: accountId
      });
      return { error: `Failed to link user to account: ${error.message}` };
    }

    console.log('🔗 LINK_USER_TO_ACCOUNT_SUCCESS', {
      timestamp: new Date().toISOString(),
      accountId: data.account_id,
      userId: data.user_id,
      role: data.role,
      joinedAt: data.joined_at
    });

    return { 
      data: { 
        accountId: data.account_id, 
        userId: data.user_id, 
        role: data.role 
      } 
    };
  } catch (error) {
    console.error('🔗 LINK_USER_TO_ACCOUNT_ERROR:', error);
    return { error: 'Failed to link user to account' };
  }
}

/**
 * Register a new user with Supabase Auth and create user record
 */
export async function registerUser(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse<{ user: User; session?: Session; account?: Account }>> {
  try {
    console.log('🔧 REGISTER_USER: STARTING', {
      timestamp: new Date().toISOString(),
      email,
      hasPassword: !!password,
      fullName
    });

    // Use admin client to create user (works in server-side API routes)
    // Browser client (supabase.auth.signUp) doesn't work properly server-side
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so user can log in immediately
      user_metadata: {
        full_name: fullName
      }
    });

    if (error) {
      console.error('🔧 REGISTER_USER: AUTH_CREATE_FAILED', {
        timestamp: new Date().toISOString(),
        error: error.message,
        code: error.code
      });
      return { error: error.message };
    }

    if (!data.user) {
      console.error('🔧 REGISTER_USER: NO_USER_RETURNED', {
        timestamp: new Date().toISOString()
      });
      return { error: 'Registration failed - no user returned' };
    }

    console.log('🔧 REGISTER_USER: AUTH_USER_CREATED', {
      timestamp: new Date().toISOString(),
      userId: data.user.id,
      email: data.user.email
    });

    // Create user record in the users table
    const userResult = await createUser({
      id: data.user.id,
      email: email,
      fullName: fullName,
      role: 'user',
    });

    if (userResult.error) {
      // If user record creation fails, we should clean up the auth user
      // but for now we'll just return the error
      return { error: userResult.error };
    }

    console.log('🔧 REGISTER_USER: USER_CREATED', {
      timestamp: new Date().toISOString(),
      userId: userResult.data!.id,
      email: userResult.data!.email
    });

    // Create default account for the new user
    const accountResult = await createDefaultAccount(userResult.data!.id, userResult.data!.email);
    
    if (accountResult.error) {
      console.error('🔧 REGISTER_USER: ACCOUNT_CREATION_FAILED', {
        timestamp: new Date().toISOString(),
        error: accountResult.error,
        userId: userResult.data!.id
      });
      // Return user without account - account creation is not critical for registration
      // Note: No session returned since we use admin API; client will sign in after registration
      return {
        data: {
          user: userResult.data!,
        },
      };
    }

    console.log('🔧 REGISTER_USER: ACCOUNT_CREATED', {
      timestamp: new Date().toISOString(),
      accountId: accountResult.data!.id,
      accountName: accountResult.data!.name
    });

    // Link user to the default account as owner
    const linkResult = await linkUserToAccount(userResult.data!.id, accountResult.data!.id, 'owner');
    
    if (linkResult.error) {
      console.error('🔧 REGISTER_USER: ACCOUNT_LINKING_FAILED', {
        timestamp: new Date().toISOString(),
        error: linkResult.error,
        userId: userResult.data!.id,
        accountId: accountResult.data!.id
      });
      // Continue without failing - user and account exist, just not linked
    } else {
      console.log('🔧 REGISTER_USER: ACCOUNT_LINKED', {
        timestamp: new Date().toISOString(),
        userId: linkResult.data!.userId,
        accountId: linkResult.data!.accountId,
        role: linkResult.data!.role
      });
    }

    console.log('🔧 REGISTER_USER: COMPLETE_SUCCESS', {
      timestamp: new Date().toISOString(),
      userId: userResult.data!.id,
      accountId: accountResult.data!.id
    });

    // Note: No session returned since we use admin API; client will sign in after registration
    return {
      data: {
        user: userResult.data!,
        account: accountResult.data!,
      },
    };
  } catch (error) {
    console.error('Register user error:', error);
    return { error: 'An unexpected error occurred during registration' };
  }
}

/**
 * Create or update admin user in database
 * This is typically called after successful Supabase Auth signup
 */
export async function createAdminUser(
  userId: string,
  email: string,
  fullName?: string,
  role: string = 'admin'
): Promise<AuthResponse<AuthUser>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        id: userId,
        email,
        full_name: fullName || null,
        role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: `Failed to create admin user: ${error.message}` };
    }

    const authUser: AuthUser = {
      id: data.id,
      email: data.email,
      fullName: data.full_name || undefined,
      role: data.role || undefined,
    };

    return { data: authUser };
  } catch (error) {
    console.error('Create admin user error:', error);
    return { error: 'Failed to create admin user record' };
  }
}

/**
 * Get all accounts that a user has access to (owner or member)
 */
export async function getAccountsForUser(userId: string): Promise<Account[]> {
  try {


    // Add timeout for database operations to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timeout')), 10000);
    });

    // First get the account IDs the user has access to
    // FIXED: Use supabaseAdmin to bypass potential RLS issues for regular users
    const accountQuery = supabaseAdmin
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId);

    const { data: userAccountRels, error: relError } = await Promise.race([
      accountQuery,
      timeoutPromise
    ]);

    if (relError) {
      console.error('Get user account relationships error:', relError);
      return [];
    }

    if (!userAccountRels || userAccountRels.length === 0) {
      console.log('No account relationships found for user:', userId);
      return [];
    }

    // Get the account details separately
    const accountIds = userAccountRels.map(rel => rel.account_id);
    const { data: accounts, error: accountsError } = await Promise.race([
      supabaseAdmin
        .from('accounts')
        .select('id, owner_id, name, description, created_at, updated_at')
        .in('id', accountIds)
        .order('created_at', { ascending: false }),
      timeoutPromise
    ]);

    if (accountsError) {
      console.error('Get accounts error:', accountsError);
      return [];
    }

    return (accounts || []).map(account => {
      // Find the user's role for this account
      const userAccountRel = userAccountRels.find(rel => rel.account_id === account.id);
      const userRole = (userAccountRel?.role as AccountRole | null) || null;

      return {
        id: account.id,
        owner_id: account.owner_id,
        name: account.name,
        description: account.description,
        settings: {} as Record<string, unknown>,
        created_at: account.created_at,
        updated_at: account.updated_at,
        userRole
      };
    });
  } catch (error) {
    console.error('Get accounts for user error:', error);
    // Return empty array instead of throwing to prevent auth context from getting stuck
    return [];
  }
}

/**
 * Check if a user has access to a specific account (owner or member)
 */
export async function canAccessAccount(userId: string, accountId: string): Promise<boolean> {
  try {
    // FIXED: Use supabaseAdmin to ensure consistent access for regular users
    const { data: membership, error } = await supabaseAdmin
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      return false;
    }

    return true; // User has some role in the account
  } catch (error) {
    console.error('Can access account error:', error);
    return false;
  }
}

/**
 * Check if a user is the owner of a specific account
 */
export async function validateAccountOwnership(userId: string, accountId: string): Promise<boolean> {
  try {
    // FIXED: Use supabaseAdmin to ensure consistent access for regular users
    const { data: membership, error } = await supabaseAdmin
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      return false;
    }

    return membership.role === 'owner';
  } catch (error) {
    console.error('Validate account ownership error:', error);
    return false;
  }
}

/**
 * Get the default account for a user (first owned account)
 */
export async function getDefaultAccountForUser(userId: string): Promise<Account | null> {
  try {
    // FIXED: Use supabaseAdmin to ensure consistent access for regular users
    const { data: userAccount, error } = await supabaseAdmin
      .from('account_users')
      .select(`
        account_id,
        accounts(
          id,
          owner_id,
          name,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .eq('role', 'owner')
      .order('created_at', { ascending: true, referencedTable: 'accounts' })
      .limit(1)
      .single();

    if (error || !userAccount || !userAccount.accounts) {
      return null;
    }

    const account = userAccount.accounts as any;
    return {
      id: account.id,
      owner_id: account.owner_id,
      name: account.name,
      description: account.description,
      settings: {}, // Default empty settings for now
      created_at: account.created_at,
      updated_at: account.updated_at
    };
  } catch (error) {
    console.error('Get default account for user error:', error);
    return null;
  }
}

/**
 * Check if a user is a system administrator
 * Part of REQ-016: System Admin Integration
 * @param userId User ID to check
 * @returns Promise resolving to true if user is a system admin
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
  try {
    // Check admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single();

    return !adminError && !!adminUser;
  } catch (error) {
    console.error('Error checking system admin status:', error);
    return false;
  }
}

/**
 * REQ-025: Sequential Authentication State Machine Implementation
 * Authentication orchestrator function - single entry point for all authentication scenarios
 */
export interface AuthResult {
  state: 'UNAUTHORIZED' | 'LOADING' | 'AUTHENTICATED' | 'ERROR';
  action?: 'SHOW_LOGIN' | 'SHOW_DASHBOARD' | 'SHOW_ERROR';
  user?: AuthUser;
  session?: Session;
  accounts?: Account[];
  currentAccount?: Account;
  error?: string;
}

export async function authenticateUser(): Promise<AuthResult> {
  const startTime = performance.now();
  console.log('🚀 AUTH_ORCHESTRATOR: Starting authentication process');

  try {
    // Step 1: Check existing session first
    console.log('🚀 AUTH_ORCHESTRATOR: Checking existing session');
    const session = await getSession();

    if (session.data?.user) {
      console.log('🚀 AUTH_ORCHESTRATOR: Valid session found, loading authenticated state', { userId: session.data.user.id });
      const authResult = await loadAuthenticatedState(session.data);
      console.log('🚀 AUTH_ORCHESTRATOR: Authentication successful', {
        state: authResult.state,
        userId: authResult.user?.id,
        currentAccountId: authResult.currentAccount?.id
      });
      return authResult;
    }

    // Step 2: Check for OAuth callback parameters
    console.log('🚀 AUTH_ORCHESTRATOR: Checking for OAuth callback');
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const code = urlParams?.get('code');
    const email = urlParams?.get('email');

    if (code && email) {
      console.log('🚀 AUTH_ORCHESTRATOR: OAuth callback detected, processing registration', { email });
      const oauthResult = await handleOAuthRegistration(code, email);
      console.log('🚀 AUTH_ORCHESTRATOR: OAuth registration completed', { state: oauthResult.state });
      return oauthResult;
    }

    // Step 3: No valid authentication found, show login
    console.log('🚀 AUTH_ORCHESTRATOR: No authentication found, showing login');
    const duration = performance.now() - startTime;
    console.log(`🚀 AUTH_ORCHESTRATOR: Completed in ${duration.toFixed(2)}ms - No authentication required`);
    return {
      state: 'UNAUTHORIZED',
      action: 'SHOW_LOGIN'
    };

  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('🚀 AUTH_ORCHESTRATOR: Authentication error:', error, `(${duration.toFixed(2)}ms)`);
    return {
      state: 'ERROR',
      action: 'SHOW_ERROR',
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

/**
 * REQ-025: Sequential State Loading Implementation
 * Load authenticated state for a valid session with sequential, predictable flow
 */
async function loadAuthenticatedState(session: Session): Promise<AuthResult> {
  const startTime = performance.now();
  console.log('🚀 SEQUENTIAL_LOAD: Starting authenticated state loading for user:', session.user.id);

  try {
    // Step 1: Load basic user profile with timeout and retry
    console.log('🚀 SEQUENTIAL_LOAD: Step 1 - Loading user profile');
    const step1Start = performance.now();
    const userResponse = await loadUserProfileWithRetry(session);
    const step1Duration = performance.now() - step1Start;
    console.log(`🚀 SEQUENTIAL_LOAD: Step 1 completed in ${step1Duration.toFixed(2)}ms`);

    if (userResponse.error || !userResponse.data) {
      throw new Error('Failed to load user profile after retries');
    }

    // Step 2: Load user accounts with roles
    console.log('🚀 SEQUENTIAL_LOAD: Step 2 - Loading user accounts with roles');
    const step2Start = performance.now();
    const accounts = await loadUserAccountsWithRetry(session.user.id);
    const step2Duration = performance.now() - step2Start;
    console.log(`🚀 SEQUENTIAL_LOAD: Step 2 completed in ${step2Duration.toFixed(2)}ms - Found ${accounts.length} accounts`);

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found for user after retries');
    }

    // Step 3: Determine current account with intelligent selection
    console.log('🚀 SEQUENTIAL_LOAD: Step 3 - Determining current account');
    const step3Start = performance.now();
    const currentAccount = await determineCurrentAccountOptimized(accounts, session.user.id);
    const step3Duration = performance.now() - step3Start;
    console.log(`🚀 SEQUENTIAL_LOAD: Step 3 completed in ${step3Duration.toFixed(2)}ms - Selected account: ${currentAccount.id}`);

    // Step 4: Validate account permissions (optional but recommended)
    console.log('🚀 SEQUENTIAL_LOAD: Step 4 - Validating account permissions');
    const step4Start = performance.now();
    await validateAccountPermissions(currentAccount, session.user.id);
    const step4Duration = performance.now() - step4Start;
    console.log(`🚀 SEQUENTIAL_LOAD: Step 4 completed in ${step4Duration.toFixed(2)}ms`);

    // Step 5: Return authenticated state with complete data
    const totalDuration = performance.now() - startTime;
    console.log(`🚀 SEQUENTIAL_LOAD: All steps completed successfully in ${totalDuration.toFixed(2)}ms`);

    return {
      state: 'AUTHENTICATED',
      action: 'SHOW_DASHBOARD',
      user: userResponse.data,
      session: session,
      accounts: accounts,
      currentAccount: currentAccount
    };

  } catch (error) {
    const totalDuration = performance.now() - startTime;
    console.error(`🚀 SEQUENTIAL_LOAD: Error loading authenticated state after ${totalDuration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Load user profile with retry logic
 */
async function loadUserProfileWithRetry(session: Session): Promise<any> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 USER_PROFILE_LOAD: Attempt ${attempt}/${maxRetries}`);
      const userResponse = await getUser();

      if (userResponse.data) {
        return userResponse;
      }

      throw new Error('User profile response missing data');

    } catch (error) {
      lastError = error as Error;
      console.warn(`🚀 USER_PROFILE_LOAD: Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        const delay = Math.pow(2, attempt - 1) * 500;
        console.log(`🚀 USER_PROFILE_LOAD: Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to load user profile after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Load user accounts with retry logic
 */
async function loadUserAccountsWithRetry(userId: string): Promise<Account[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 ACCOUNTS_LOAD: Attempt ${attempt}/${maxRetries} for user ${userId}`);
      const accounts = await getAccountsForUser(userId);

      if (accounts && accounts.length > 0) {
        return accounts;
      }

      throw new Error('No accounts returned or empty array');

    } catch (error) {
      lastError = error as Error;
      console.warn(`🚀 ACCOUNTS_LOAD: Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 500;
        console.log(`🚀 ACCOUNTS_LOAD: Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to load user accounts after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Determine current account with optimized selection logic
 */
async function determineCurrentAccountOptimized(accounts: Account[], userId: string): Promise<Account> {
  console.log('🚀 DETERMINE_CURRENT_ACCOUNT: Finding optimal current account for user:', userId);

  // Strategy 1: Prefer accounts where user is the owner
  const ownedAccounts = accounts.filter(account => account.owner_id === userId);
  if (ownedAccounts.length > 0) {
    const selected = ownedAccounts[0];
    console.log('🚀 DETERMINE_CURRENT_ACCOUNT: Selected owned account:', selected.id);
    return selected;
  }

  // Strategy 2: Check for most recently updated account
  const sortedByUpdate = [...accounts].sort((a, b) => {
    const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return bTime - aTime;
  });
  const selected = sortedByUpdate[0];
  console.log('🚀 DETERMINE_CURRENT_ACCOUNT: Selected most recent account:', selected.id);

  return selected;
}

/**
 * Validate account permissions for the current user
 */
async function validateAccountPermissions(account: Account, userId: string): Promise<void> {
  try {
    // Check if user has access to this account
    const userAccounts = await getAccountsForUser(userId);
    const hasAccess = userAccounts.some(acc => acc.id === account.id);

    if (!hasAccess) {
      throw new Error(`User ${userId} does not have access to account ${account.id}`);
    }

    console.log('🚀 PERMISSIONS_VALIDATION: Account access validated for user:', userId);
  } catch (error) {
    console.error('🚀 PERMISSIONS_VALIDATION: Failed to validate account permissions:', error);
    throw error;
  }
}

/**
 * Handle OAuth registration completion
 */
async function handleOAuthRegistration(code: string, email: string): Promise<AuthResult> {
  console.log('🚀 OAUTH_REGISTRATION: Processing OAuth registration', { code: code.substring(0, 10) + '...', email });

  try {
    // This would integrate with the existing OAuth registration endpoint
    // For now, return an error state since full OAuth implementation is complex
    console.log('🚀 OAUTH_REGISTRATION: OAuth registration not fully implemented yet');
    return {
      state: 'ERROR',
      action: 'SHOW_ERROR',
      error: 'OAuth registration not yet implemented in orchestrator'
    };

  } catch (error) {
    console.error('🚀 OAUTH_REGISTRATION: Error in OAuth registration:', error);
    throw error;
  }
}

/**
 * Determine the current account for a user
 */
async function determineCurrentAccount(accounts: Account[], userId: string): Promise<Account> {
  console.log('🚀 DETERMINE_CURRENT_ACCOUNT: Finding current account for user:', userId);

  // First, try to find an account where the user is the owner
  const ownedAccount = accounts.find(account => account.owner_id === userId);

  if (ownedAccount) {
    console.log('🚀 DETERMINE_CURRENT_ACCOUNT: Found owned account:', ownedAccount.id);
    return ownedAccount;
  }

  // If no owned account, use the first available account
  console.log('🚀 DETERMINE_CURRENT_ACCOUNT: Using first available account:', accounts[0].id);
  return accounts[0];
}
