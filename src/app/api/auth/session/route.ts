import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAccountsForUser, getUserRoleInAccount, getDefaultAccountForUser } from '@/lib/auth';

// Enhanced session response interface
interface SessionResponse {
  success: boolean;
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    currentAccount?: {
      id: string;
      name: string;
      role: string;
      isOwner: boolean;
    } | null;
    availableAccounts?: Array<{
      id: string;
      name: string;
      description?: string;
      owner_id: string;
      created_at: string;
      updated_at: string;
    }>;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  accountContext?: {
    currentAccountId: string | null;
    totalAccounts: number;
    userRole: string | null;
  };
  message?: string;
  error?: string;
  code?: string;
}

// GET: Validate current session and return user info with account context
export async function GET(request: NextRequest): Promise<NextResponse<SessionResponse>> {
  try {
    console.log('Session validation request with account context...');

    // Get the session from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'No valid authorization header provided',
          code: 'NO_AUTH_HEADER'
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'No access token provided',
          code: 'NO_TOKEN'
        },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Server configuration error',
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      console.log('Token validation failed:', userError?.message);
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'User email not found in token',
          code: 'NO_EMAIL'
        },
        { status: 401 }
      );
    }

    // Check if user is an admin first
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();

    let validatedUser;
    let isAdmin = false;

    if (!adminError && adminUser) {
      // User is an admin
      validatedUser = {
        id: user.id,
        email: adminUser.email,
        fullName: adminUser.full_name || undefined,
        role: adminUser.role
      };
      isAdmin = adminUser.role === 'admin';
      console.log('Session validation for admin user:', validatedUser.email);
    } else {
      // Check if user is a regular user
      const { data: regularUser, error: userError } = await supabase
        .from('users')
        .select('email, full_name, role')
        .eq('id', user.id)
        .single();

      if (userError || !regularUser) {
        console.log('User not found in system:', { 
          userId: user.id, 
          email: user.email, 
          adminError: adminError?.message,
          userError: userError?.message
        });
        return NextResponse.json(
          { 
            success: false, 
            authenticated: false,
            error: 'User not found in system',
            code: 'USER_NOT_FOUND'
          },
          { status: 403 }
        );
      }

      validatedUser = {
        id: user.id,
        email: regularUser.email,
        fullName: regularUser.full_name || undefined,
        role: regularUser.role
      };
      console.log('Session validation for regular user:', validatedUser.email);
    }

    // Get account context for the user
    try {
      const accounts = await getAccountsForUser(user.id);
      console.log(`Found ${accounts.length} accounts for user:`, user.email);

      // Get current account from request header or localStorage hint
      let currentAccount = null;
      let currentAccountContext = null;
      let userRole = null;

      const requestedAccountId = request.headers.get('x-current-account') || 
                                request.nextUrl.searchParams.get('account_id');

      if (requestedAccountId && accounts.find(acc => acc.id === requestedAccountId)) {
        // Use requested account if user has access
        currentAccount = accounts.find(acc => acc.id === requestedAccountId);
        userRole = await getUserRoleInAccount(user.id, requestedAccountId);
      } else if (accounts.length > 0) {
        // Get default account (first owned account or first available)
        currentAccount = await getDefaultAccountForUser(user.id) || accounts[0];
        if (currentAccount) {
          userRole = await getUserRoleInAccount(user.id, currentAccount.id);
        }
      }

      if (currentAccount && userRole) {
        currentAccountContext = {
          id: currentAccount.id,
          name: currentAccount.name,
          role: userRole,
          isOwner: currentAccount.owner_id === user.id
        };
      }

             // Build enhanced user response with account context
       const enhancedUser = {
         ...validatedUser,
         currentAccount: currentAccountContext,
         availableAccounts: accounts.map(acc => ({
           id: acc.id,
           name: acc.name,
           description: acc.description || undefined,
           owner_id: acc.owner_id,
           created_at: acc.created_at,
           updated_at: acc.updated_at
         }))
       };

      const accountContext = {
        currentAccountId: currentAccount?.id || null,
        totalAccounts: accounts.length,
        userRole: userRole
      };

      console.log('Session validation successful with account context:', {
        userEmail: validatedUser.email,
        isAdmin,
        currentAccount: currentAccount?.name || 'none',
        totalAccounts: accounts.length
      });

      return NextResponse.json({
        success: true,
        authenticated: true,
        user: enhancedUser,
        accountContext,
        message: 'Session validation successful with account context'
      });

    } catch (accountError) {
      console.error('Failed to load account context:', accountError);
      
      // Return user without account context if account loading fails
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          ...validatedUser,
          currentAccount: null,
          availableAccounts: []
        },
        accountContext: {
          currentAccountId: null,
          totalAccounts: 0,
          userRole: null
        },
        message: 'Session validation successful (account context unavailable)'
      });
    }

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        authenticated: false,
        error: 'Session validation failed',
        code: 'VALIDATION_ERROR'
      },
      { status: 500 }
    );
  }
}

// POST: Refresh the current session with account context preservation
export async function POST(request: NextRequest): Promise<NextResponse<SessionResponse>> {
  try {
    console.log('Session refresh request with account context...');

    // Get refresh token from request body
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken;
    const currentAccountId = body.currentAccountId; // Preserve current account

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Refresh token is required',
          code: 'NO_REFRESH_TOKEN'
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Server configuration error',
          code: 'SERVER_CONFIG_ERROR'
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Refresh the session
    const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (refreshError || !sessionData.session) {
      console.log('Session refresh failed:', refreshError?.message);
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Failed to refresh session',
          code: 'REFRESH_FAILED'
        },
        { status: 401 }
      );
    }

    const { session, user } = sessionData;
    
    if (!user || !user.email) {
      return NextResponse.json(
        { 
          success: false, 
          authenticated: false,
          error: 'Invalid user data in refreshed session',
          code: 'INVALID_USER_DATA'
        },
        { status: 401 }
      );
    }

    // Validate user (admin or regular)
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();

    let validatedUser;
    let isAdmin = false;

    if (!adminError && adminUser) {
      // User is an admin
      validatedUser = {
        id: user.id,
        email: adminUser.email,
        fullName: adminUser.full_name || undefined,
        role: adminUser.role
      };
      isAdmin = adminUser.role === 'admin';
    } else {
      // Check if user is a regular user
      const { data: regularUser, error: userError } = await supabase
        .from('users')
        .select('email, full_name, role')
        .eq('id', user.id)
        .single();

      if (userError || !regularUser) {
        console.log('User validation failed during refresh:', { 
          userId: user.id, 
          email: user.email,
          adminError: adminError?.message,
          userError: userError?.message
        });
        return NextResponse.json(
          { 
            success: false, 
            authenticated: false,
            error: 'User not found in system',
            code: 'USER_NOT_FOUND'
          },
          { status: 403 }
        );
      }

      validatedUser = {
        id: user.id,
        email: regularUser.email,
        fullName: regularUser.full_name || undefined,
        role: regularUser.role
      };
    }

    // Get account context for the user
    try {
      const accounts = await getAccountsForUser(user.id);
      
      // Preserve current account if provided and valid, otherwise use default
      let currentAccount = null;
      let currentAccountContext = null;
      let userRole = null;

      if (currentAccountId && accounts.find(acc => acc.id === currentAccountId)) {
        currentAccount = accounts.find(acc => acc.id === currentAccountId);
        userRole = await getUserRoleInAccount(user.id, currentAccountId);
      } else if (accounts.length > 0) {
        currentAccount = await getDefaultAccountForUser(user.id) || accounts[0];
        if (currentAccount) {
          userRole = await getUserRoleInAccount(user.id, currentAccount.id);
        }
      }

      if (currentAccount && userRole) {
        currentAccountContext = {
          id: currentAccount.id,
          name: currentAccount.name,
          role: userRole,
          isOwner: currentAccount.owner_id === user.id
        };
      }

             // Build enhanced user response with account context
       const enhancedUser = {
         ...validatedUser,
         currentAccount: currentAccountContext,
         availableAccounts: accounts.map(acc => ({
           id: acc.id,
           name: acc.name,
           description: acc.description || undefined,
           owner_id: acc.owner_id,
           created_at: acc.created_at,
           updated_at: acc.updated_at
         }))
       };

      const accountContext = {
        currentAccountId: currentAccount?.id || null,
        totalAccounts: accounts.length,
        userRole: userRole
      };

      console.log('Session refresh successful with account context:', {
        userEmail: validatedUser.email,
        isAdmin,
        currentAccount: currentAccount?.name || 'none',
        totalAccounts: accounts.length
      });

      return NextResponse.json({
        success: true,
        authenticated: true,
        user: enhancedUser,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        },
        accountContext,
        message: 'Session refresh successful with account context'
      });

    } catch (accountError) {
      console.error('Failed to load account context during refresh:', accountError);
      
      // Return refreshed session without account context if account loading fails
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          ...validatedUser,
          currentAccount: null,
          availableAccounts: []
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        },
        accountContext: {
          currentAccountId: null,
          totalAccounts: 0,
          userRole: null
        },
        message: 'Session refresh successful (account context unavailable)'
      });
    }

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { 
        success: false, 
        authenticated: false,
        error: 'Session refresh failed',
        code: 'REFRESH_ERROR'
      },
      { status: 500 }
    );
  }
} 