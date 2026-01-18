import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Account } from '@/types';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: authResult, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authResult.user) {
      console.log('❌ Token validation failed:', authError?.message || 'No user data');
      return { user: null, isAdmin: false, error: NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )};
    }

    console.log('✅ Authentication successful:', authResult.user.id);
    return { 
      user: {
        id: authResult.user.id,
        email: authResult.user.email || ''
      }, 
      isAdmin: true 
    };
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    return { user: null, isAdmin: false, error: NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )};
  }
}

// Helper function to check if user has access to account
async function validateAccountAccess(userId: string, accountId: string): Promise<boolean> {
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

    return true;
  } catch (error) {
    console.error('Error checking account access:', error);
    return false;
  }
}

// Helper function to check if user is account owner or admin
async function validateAccountPermission(userId: string, accountId: string): Promise<boolean> {
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

    return membership.role === 'owner' || membership.role === 'admin';
  } catch (error) {
    console.error('Error checking account permission:', error);
    return false;
  }
}

// GET /api/admin/accounts/[accountId] - Get individual account details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    console.log('Individual account API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    const { accountId } = await params;
    
    console.log('Authentication successful for user:', user?.email, 'requesting account:', accountId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Validate user has access to this account
    const hasAccess = await validateAccountAccess(user.id, accountId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this account' },
        { status: 403 }
      );
    }

    // Get account details with membership info
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select(`
        id,
        owner_id,
        name,
        description,
        created_at,
        updated_at
      `)
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      console.error('Error fetching account:', accountError);
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Get membership information for this account
    const { data: members, error: membersError } = await supabase
      .from('account_users')
      .select('user_id, role, joined_at')
      .eq('account_id', accountId);

    if (membersError) {
      console.error('Error fetching account members:', membersError);
    }

    const accountWithMembers: Account & { members?: any[] } = {
      id: account.id,
      owner_id: account.owner_id,
      name: account.name,
      description: account.description,
      settings: {}, // Default empty settings for now
      created_at: account.created_at,
      updated_at: account.updated_at,
      members: members || []
    };

    console.log(`Account details accessed by: ${user.email} for account: ${account.name}`);

    return NextResponse.json({
      success: true,
      data: accountWithMembers
    });

  } catch (error) {
    console.error('Error in GET /api/admin/accounts/[accountId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/accounts/[accountId] - Update account details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    console.log('Account update API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    const { accountId } = await params;
    
    console.log('Authentication successful for user:', user?.email, 'updating account:', accountId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Validate user has permission to modify this account (owner or admin)
    const hasPermission = await validateAccountPermission(user.id, accountId);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to modify this account' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Account name is required' },
        { status: 400 }
      );
    }

    // Update account
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({
        name: name.trim(),
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select()
      .single();

    if (updateError || !updatedAccount) {
      console.error('Error updating account:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update account' },
        { status: 500 }
      );
    }

    const account: Account = {
      id: updatedAccount.id,
      owner_id: updatedAccount.owner_id,
      name: updatedAccount.name,
      description: updatedAccount.description,
      settings: {}, // Default empty settings for now
      created_at: updatedAccount.created_at,
      updated_at: updatedAccount.updated_at
    };

    console.log(`Account updated by: ${user.email} - account: ${account.name}`);

    return NextResponse.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/accounts/[accountId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 