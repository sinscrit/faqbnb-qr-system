import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required - no valid Authorization header',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    const token = authHeader.substring(7);
    if (!token) {
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required - no token provided',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    // Create a Supabase client to validate the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Server configuration error',
            code: 'SERVER_ERROR' 
          },
          { status: 500 }
        )
      };
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Validate the token and get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.log('Token validation failed:', userError?.message);
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Invalid or expired token',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    if (!user.email) {
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'User email not found in token',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();

    if (adminError || !adminUser) {
      // If not admin, check if user is a regular user
      const { data: regularUser, error: userError } = await supabase
        .from('users')
        .select('email, full_name, role')
        .eq('id', user.id)
        .single();

      if (userError || !regularUser) {
        console.log('User validation failed:', { 
          userId: user.id, 
          email: user.email, 
          adminError: adminError?.message,
          userError: userError?.message
        });
        return {
          error: NextResponse.json(
            { 
              success: false, 
              error: 'User not found in system',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }

      // Return regular user data
      const validatedUser = {
        id: user.id,
        email: regularUser.email,
        fullName: regularUser.full_name || undefined,
        role: regularUser.role
      };

      console.log('Authentication successful for user:', validatedUser.email);
      return { user: validatedUser, isAdmin: false };
    }

    // Return admin user data
    const validatedUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role
    };

    console.log('Authentication successful for admin:', validatedUser.email);
    return { user: validatedUser, isAdmin: adminUser.role === 'admin' };

  } catch (error) {
    console.error('Auth validation error:', error);
    return {
      error: NextResponse.json(
        { 
          success: false, 
          error: 'Authentication validation failed',
          code: 'AUTH_ERROR' 
        },
        { status: 500 }
      )
    };
  }
}

// Interface for account list response
interface AccountsListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    description?: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    userRole: string; // Role of current user in this account
    isOwner: boolean;
    memberCount?: number;
  }>;
  metadata?: {
    totalAccounts: number;
    userIsAdmin: boolean;
    userEmail: string;
  };
  error?: string;
  code?: string;
}

// GET /api/admin/accounts - List accounts user belongs to
export async function GET(request: NextRequest) {
  try {
    console.log('Account management API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    
    console.log('Authentication successful for user:', user.email, 'isAdmin:', userIsAdmin);

    // Get accounts user belongs to through account_users table
    const { data: userAccounts, error: accountsError } = await supabase
      .from('account_users')
      .select(`
        account_id,
        role,
        created_at,
        accounts!inner(
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('Error fetching user accounts:', accountsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch user accounts',
          code: 'ACCOUNTS_FETCH_FAILED'
        },
        { status: 500 }
      );
    }

    if (!userAccounts || userAccounts.length === 0) {
      console.log('No accounts found for user:', user.email);
      return NextResponse.json({
        success: true,
        data: [],
        metadata: {
          totalAccounts: 0,
          userIsAdmin,
          userEmail: user.email
        }
      });
    }

    // Transform and enrich account data
    const enrichedAccounts = await Promise.all(
      userAccounts.map(async (userAccount) => {
        const account = (userAccount as any).accounts;
        
        // Get member count for each account
        const { count: memberCount } = await supabase
          .from('account_users')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', account.id);

        return {
          id: account.id,
          name: account.name,
          description: account.description || undefined,
          owner_id: account.owner_id,
          created_at: account.created_at,
          updated_at: account.updated_at,
          userRole: userAccount.role,
          isOwner: account.owner_id === user.id,
          memberCount: memberCount || 0
        };
      })
    );

    // Sort accounts by user role (owner first, then by creation date)
    enrichedAccounts.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const response: AccountsListResponse = {
      success: true,
      data: enrichedAccounts,
      metadata: {
        totalAccounts: enrichedAccounts.length,
        userIsAdmin,
        userEmail: user.email
      }
    };

    console.log(`Account list response for ${user.email}:`, {
      totalAccounts: enrichedAccounts.length,
      accountNames: enrichedAccounts.map(a => a.name),
      userRoles: enrichedAccounts.map(a => a.userRole)
    });

    console.log(`Account management accessed by: ${user.email}, found ${enrichedAccounts.length} accounts`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Account management API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/accounts - Create new account (future implementation)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Account creation not yet implemented',
      code: 'NOT_IMPLEMENTED' 
    },
    { status: 501 }
  );
}

// PUT /api/admin/accounts - Update account (future implementation)  
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Account update not yet implemented',
      code: 'NOT_IMPLEMENTED' 
    },
    { status: 501 }
  );
}

// DELETE /api/admin/accounts - Delete account (future implementation)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Account deletion not yet implemented',
      code: 'NOT_IMPLEMENTED' 
    },
    { status: 501 }
  );
} 