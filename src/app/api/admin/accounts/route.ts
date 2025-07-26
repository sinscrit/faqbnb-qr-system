import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Account } from '@/types';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header found');
      return { user: null, isAdmin: false, error: NextResponse.json(
        { success: false, error: 'Authentication required - no valid Authorization header' },
        { status: 401 }
      )};
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 Validating JWT token for admin access...');

    // Validate token with Supabase
    const { data: authResult, error: authError } = await supabase.auth.getUser(token);
    
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

// GET /api/admin/accounts - List user's accessible accounts
export async function GET(request: NextRequest) {
  try {
    console.log('Admin accounts API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    console.log('Authentication successful for user:', user?.email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Query accounts where user is owner or member using manual JOIN
    const { data: userAccounts, error: accountsError } = await supabase
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
      .eq('user_id', user.id);

    if (accountsError) {
      console.error('Error fetching user accounts:', accountsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch accounts' },
        { status: 500 }
      );
    }

    // Transform the data to Account interface format
    const accounts: Account[] = (userAccounts || [])
      .filter(ua => ua.accounts) // Ensure accounts data exists
      .map(ua => {
        const account = ua.accounts as any; // Type assertion for Supabase nested query
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

    console.log(`Accounts list accessed by: ${user.email}, found ${accounts.length} accounts`);

    return NextResponse.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('Error in GET /api/admin/accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 