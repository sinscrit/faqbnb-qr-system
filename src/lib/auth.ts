import { supabase, supabaseAdmin } from './supabase';
import { Session } from '@supabase/supabase-js';
import { Account } from '@/types';

// Auth utility types with account context
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
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
  createdAt: string;
  updatedAt: string;
  accountId: string; // Added for multi-tenant support
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
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

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('email', data.user.email)
      .single();

    if (adminError || !adminUser) {
      // Sign out if not an admin
      await supabase.auth.signOut();
      return { error: 'Access denied - admin privileges required' };
    }

    // Get user's available accounts
    const accounts = await getAccountsForUser(data.user.id);
    
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

    const authUser: AuthUser = {
      id: data.user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role || undefined,
      currentAccount: currentAccountContext,
      availableAccounts: accounts
    };

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
 */
export async function getUser(): Promise<AuthResponse<AuthUser | null>> {
  try {
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

    // First check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('email', user.email)
      .single();

    if (!adminError && adminUser) {
      // User is an admin - get account context
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
        const userRole = await getUserRoleInAccount(user.id, currentAccount.id);
        currentAccountContext = {
          id: currentAccount.id,
          name: currentAccount.name,
          role: userRole || 'member',
          isOwner: currentAccount.owner_id === user.id
        };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: adminUser.email,
        fullName: adminUser.full_name || undefined,
        role: adminUser.role || undefined,
        currentAccount: currentAccountContext,
        availableAccounts: accounts
      };
      return { data: authUser };
    }

    // Check if user is a regular user
    const { data: regularUser, error: userError } = await supabase
      .from('users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .single();

    if (userError || !regularUser) {
      return { data: null };
    }

    // Get account context for regular user
    const accounts = await getAccountsForUser(user.id);
    
    // Regular users typically have access to fewer accounts
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
      const userRole = await getUserRoleInAccount(user.id, currentAccount.id);
      currentAccountContext = {
        id: currentAccount.id,
        name: currentAccount.name,
        role: userRole || 'member',
        isOwner: currentAccount.owner_id === user.id
      };
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
      settings: account.settings || {},
      created_at: account.created_at,
      updated_at: account.updated_at
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
 * Get user's role in a specific account
 */
export async function getUserRoleInAccount(userId: string, accountId: string): Promise<string | null> {
  try {
    const { data: membership, error } = await supabase
      .from('account_users')
      .select('role')
      .eq('user_id', userId)
      .eq('account_id', accountId)
      .single();

    if (error || !membership) {
      return null;
    }

    return membership.role;
  } catch (error) {
    console.error('Get user role in account error:', error);
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
      settings: accountData.settings || {},
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
        settings: accountData.settings || {},
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
 */
export async function createUser(authUser: Omit<User, 'createdAt' | 'updatedAt'>): Promise<AuthResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.fullName || null,
        role: authUser.role || 'user',
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
      role: data.role,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
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
 * Register a new user with Supabase Auth and create user record
 */
export async function registerUser(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse<{ user: User; session: Session }>> {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user || !data.session) {
      return { error: 'Registration failed - no user or session returned' };
    }

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

    return {
      data: {
        user: userResult.data!,
        session: data.session,
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
    const { data: userAccounts, error } = await supabase
      .from('account_users')
      .select(`
        account_id,
        role,
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
      .order('created_at', { ascending: false, referencedTable: 'accounts' });

    if (error) {
      console.error('Get accounts for user error:', error);
      return [];
    }

    return (userAccounts || [])
      .filter(ua => ua.accounts)
      .map(ua => {
        const account = ua.accounts as any;
        return {
          id: account.id,
          owner_id: account.owner_id,
          name: account.name,
          description: account.description,
          settings: {}, // Default empty settings for now
          created_at: account.created_at,
          updated_at: account.updated_at
        };
      });
  } catch (error) {
    console.error('Get accounts for user error:', error);
    return [];
  }
}

/**
 * Check if a user has access to a specific account (owner or member)
 */
export async function canAccessAccount(userId: string, accountId: string): Promise<boolean> {
  try {
    const { data: membership, error } = await supabase
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
    const { data: membership, error } = await supabase
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
    const { data: userAccount, error } = await supabase
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