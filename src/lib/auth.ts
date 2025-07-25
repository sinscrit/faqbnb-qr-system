import { supabase, supabaseAdmin } from './supabase';
import { Session } from '@supabase/supabase-js';

// Auth utility types
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
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
 * Sign in with email and password for admin users
 */
export async function signInWithEmail(
  email: string, 
  password: string
): Promise<AuthResponse<{ user: AuthUser; session: Session }>> {
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

    const authUser: AuthUser = {
      id: data.user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role || undefined,
    };

    return {
      data: {
        user: authUser,
        session: data.session,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'An unexpected error occurred during sign in' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }

    return { data: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'An unexpected error occurred during sign out' };
  }
}

/**
 * Get current session from Supabase
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
        // Session expired
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
 * Get current authenticated user information (handles both regular users and admins)
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
      // User is an admin
      const authUser: AuthUser = {
        id: user.id,
        email: adminUser.email,
        fullName: adminUser.full_name || undefined,
        role: adminUser.role || undefined,
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

    const authUser: AuthUser = {
      id: user.id,
      email: regularUser.email,
      fullName: regularUser.full_name || undefined,
      role: regularUser.role || undefined,
    };

    return { data: authUser };
  } catch (error) {
    console.error('Get user error:', error);
    return { error: 'Failed to retrieve user information' };
  }
}

/**
 * Server-side auth requirement helper
 * Throws an error if the user is not authenticated or not an admin
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
 * Check if a user can access a specific property
 */
export async function canAccessProperty(userId: string, propertyId: string): Promise<boolean> {
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

    // Check if user owns the property
    const { data: property, error } = await supabase
      .from('properties')
      .select('user_id')
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      return false;
    }

    return property.user_id === userId;
  } catch (error) {
    console.error('Can access property error:', error);
    return false;
  }
}

/**
 * Get all properties for a specific user
 */
export async function getUserProperties(userId: string): Promise<Property[]> {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        user_id,
        property_type_id,
        nickname,
        address,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
 * Check if a user owns a specific property
 */
export async function isPropertyOwner(userId: string, propertyId: string): Promise<boolean> {
  try {
    const { data: property, error } = await supabase
      .from('properties')
      .select('user_id')
      .eq('id', propertyId)
      .single();

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