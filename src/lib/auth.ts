import { supabase, supabaseAdmin } from './supabase';
import { Session } from '@supabase/supabase-js';
import { Account } from '@/types';

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

    // Check if user is an admin (check both admin_users table and is_admin flag)
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('email', data.user.email)
      .single();

    // Also check is_admin flag in users table
    const { data: userWithAdminFlag, error: userFlagError } = await supabase
      .from('users')
      .select('email, full_name, role, is_admin')
      .eq('id', data.user.id)
      .single();

    const isAdminByTable = !adminError && adminUser;
    const isAdminByFlag = !userFlagError && userWithAdminFlag?.is_admin;

    if (!isAdminByTable && !isAdminByFlag) {
      // Sign out if not an admin by either method
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



    // First check if user is an admin (check both admin_users table and is_admin flag)
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('email', user.email)
      .single();

    // Also check is_admin flag in users table
    const { data: userWithAdminFlag, error: userFlagError } = await supabase
      .from('users')
      .select('email, full_name, role, is_admin')
      .eq('id', user.id)
      .single();

    const isAdminByTable = !adminError && adminUser;
    const isAdminByFlag = !userFlagError && userWithAdminFlag?.is_admin;

    if (isAdminByTable || isAdminByFlag) {
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

      // Prioritize admin_users data if available, else use users table data
      const userInfo = isAdminByTable ? adminUser : userWithAdminFlag;
      
      const authUser: AuthUser = {
        id: user.id,
        email: userInfo.email,
        fullName: userInfo.full_name || undefined,
        role: userInfo.role || undefined,
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
export async function createUser(
  authUser: Pick<User, 'id' | 'email'> & {
    fullName?: string;
    role?: string;
    profilePicture?: string;
    authProvider?: string;
  }
): Promise<AuthResponse<User>> {
  try {
    const { data, error } = await supabase
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
): Promise<AuthResponse<{ user: User; session: Session; account?: Account }>> {
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
      return {
        data: {
          user: userResult.data!,
          session: data.session,
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
      accountId: accountResult.data!.id,
      hasSession: !!data.session
    });

    return {
      data: {
        user: userResult.data!,
        session: data.session,
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
    const accountQuery = supabase
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
      supabase
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

    return (accounts || []).map(account => ({
      id: account.id,
      owner_id: account.owner_id,
      name: account.name,
      description: account.description,
      settings: {},
      created_at: account.created_at,
      updated_at: account.updated_at
    }));
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

    if (!adminError && adminUser) {
      return true;
    }

    // Check is_admin flag in users table
    const { data: userWithAdminFlag, error: userFlagError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    return !userFlagError && userWithAdminFlag?.is_admin === true;
  } catch (error) {
    console.error('Error checking system admin status:', error);
    return false;
  }
} 