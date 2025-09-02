import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('User session not found:', userError?.message);
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

    const { data: regularUser, error: regularUserError } = await supabase
      .from('users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .single();

    if (adminError && regularUserError) {
      console.log('User validation failed:', {
        userId: user.id,
        email: user.email,
        adminError: adminError?.message,
        regularUserError: regularUserError?.message
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

    // Return user data (either admin or regular user)
    if (!adminError && adminUser) {
      return {
        user: {
          id: user.id,
          email: adminUser.email,
          fullName: adminUser.full_name || undefined,
          role: adminUser.role
        },
        isAdmin: adminUser.role === 'admin'
      };
    } else if (!regularUserError && regularUser) {
      return {
        user: {
          id: user.id,
          email: regularUser.email,
          fullName: regularUser.full_name || undefined,
          role: regularUser.role
        },
        isAdmin: false
      };
    }

    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'User validation failed',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      )
    };

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

// Interface for user access response
interface UserAccessResponse {
  success: boolean;
  data?: {
    ownedAccounts: Array<{
      id: string;
      name: string;
      description: string | null;
      memberCount: number;
      created_at: string;
    }>;
    accessibleAccounts: Array<{
      id: string;
      name: string;
      description: string | null;
      userRole: string;
      ownerName: string;
      memberCount: number;
      created_at: string;
    }>;
    usersWithAccess: Array<{
      id: string;
      email: string;
      fullName: string | null;
      role: string;
      accountId: string;
      accountName: string;
      userRoleInAccount: string;
      joinedAt: string;
    }>;
    summary: {
      totalOwnedAccounts: number;
      totalAccessibleAccounts: number;
      totalUsersWithAccess: number;
      totalMemberAccounts: number;
    };
  };
  error?: string;
  code?: string;
}

// GET /api/admin/accounts/users - Get users with access to current user's accounts
export async function GET(request: NextRequest) {
  try {
    console.log('User access API called - validating authentication...');

    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;

    console.log('Authentication successful for user:', user.email, 'isAdmin:', userIsAdmin);

    // Get accounts owned by the current user
    console.log('Fetching owned accounts...');
    const { data: ownedAccountsData, error: ownedAccountsError } = await supabase
      .from('accounts')
      .select('id, name, description, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (ownedAccountsError) {
      console.error('Error fetching owned accounts:', ownedAccountsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch owned accounts',
          code: 'OWNED_ACCOUNTS_FAILED'
        },
        { status: 500 }
      );
    }

    // Get accounts the user has access to (but doesn't own)
    console.log('Fetching accessible accounts...');
    const { data: accessibleAccountsData, error: accessibleAccountsError } = await supabase
      .from('account_users')
      .select(`
        account_id,
        role,
        joined_at,
        accounts!inner(
          id,
          name,
          description,
          owner_id,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .neq('accounts.owner_id', user.id) // Exclude owned accounts
      .order('joined_at', { ascending: false });

    if (accessibleAccountsError) {
      console.error('Error fetching accessible accounts:', accessibleAccountsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch accessible accounts',
          code: 'ACCESSIBLE_ACCOUNTS_FAILED'
        },
        { status: 500 }
      );
    }

    // Get all account IDs that this user has some relationship with
    const allAccountIds = new Set([
      ...ownedAccountsData.map(acc => acc.id),
      ...accessibleAccountsData.map(acc => (acc.accounts as any).id)
    ]);

    // Get all users who have access to any of these accounts
    console.log('Fetching users with access to owned accounts...');
    const { data: usersWithAccessData, error: usersWithAccessError } = await supabase
      .from('account_users')
      .select(`
        user_id,
        account_id,
        role,
        joined_at,
        accounts!inner(
          id,
          name
        ),
        users!inner(
          id,
          email,
          full_name,
          role
        )
      `)
      .in('account_id', Array.from(allAccountIds))
      .neq('user_id', user.id) // Exclude current user
      .order('joined_at', { ascending: false });

    if (usersWithAccessError) {
      console.error('Error fetching users with access:', usersWithAccessError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch users with access',
          code: 'USERS_ACCESS_FAILED'
        },
        { status: 500 }
      );
    }

    // Process owned accounts with member counts
    const ownedAccounts = await Promise.all(
      (ownedAccountsData || []).map(async (account) => {
        const { count: memberCount } = await supabase
          .from('account_users')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', account.id);

        return {
          id: account.id,
          name: account.name,
          description: account.description,
          memberCount: memberCount || 0,
          created_at: account.created_at
        };
      })
    );

    // Process accessible accounts with member counts and owner info
    const accessibleAccounts = await Promise.all(
      (accessibleAccountsData || []).map(async (accountUser) => {
        const account = accountUser.accounts as any;
        const { count: memberCount } = await supabase
          .from('account_users')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', account.id);

        // Get account owner name
        const { data: ownerData } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', account.owner_id)
          .single();

        const ownerName = ownerData?.full_name || ownerData?.email || 'Unknown Owner';

        return {
          id: account.id,
          name: account.name,
          description: account.description,
          userRole: accountUser.role,
          ownerName,
          memberCount: memberCount || 0,
          created_at: account.created_at
        };
      })
    );

    // Process users with access data
    const usersWithAccess = (usersWithAccessData || []).map((accessRecord) => {
      const account = accessRecord.accounts as any;
      const userData = accessRecord.users as any;

      return {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        accountId: account.id,
        accountName: account.name,
        userRoleInAccount: accessRecord.role,
        joinedAt: accessRecord.joined_at
      };
    });

    // Calculate summary statistics
    const summary = {
      totalOwnedAccounts: ownedAccounts.length,
      totalAccessibleAccounts: accessibleAccounts.length,
      totalUsersWithAccess: usersWithAccess.length,
      totalMemberAccounts: ownedAccounts.length + accessibleAccounts.length
    };

    const response: UserAccessResponse = {
      success: true,
      data: {
        ownedAccounts,
        accessibleAccounts,
        usersWithAccess,
        summary
      }
    };

    console.log(`User access data retrieved for ${user.email}:`, {
      ownedAccounts: ownedAccounts.length,
      accessibleAccounts: accessibleAccounts.length,
      usersWithAccess: usersWithAccess.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('User access API error:', error);

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

// POST /api/admin/accounts/users - Future implementation for managing user access
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'POST method not implemented',
      code: 'NOT_IMPLEMENTED'
    },
    { status: 501 }
  );
}
