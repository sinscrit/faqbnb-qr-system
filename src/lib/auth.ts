import { supabase, supabaseAdmin } from './supabase';
import { Session } from '@supabase/supabase-js';

// Auth utility types
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
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
 * Get current authenticated user information
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

    // Get admin user details
    if (!user.email) {
      return { data: null };
    }

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('email', user.email)
      .single();

    if (adminError || !adminUser) {
      return { data: null };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role || undefined,
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