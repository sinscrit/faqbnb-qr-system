import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PropertyResponse {
  success: boolean;
  data?: any[];
  error?: string;
  code?: string;
}

// Validate user authentication (non-admin users allowed)
async function validateUserAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to get session from cookie (supabase already imported)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        return {
          error: NextResponse.json(
            { success: false, error: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
            { status: 401 }
          )
        };
      }
      
      // Use session token for auth
      const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
      
      if (userError || !user) {
        return {
          error: NextResponse.json(
            { success: false, error: 'Invalid session token', code: 'INVALID_TOKEN' },
            { status: 401 }
          )
        };
      }
      
      return { user, session };
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Invalid authorization token', code: 'INVALID_TOKEN' },
          { status: 401 }
        )
      };
    }
    
    return { user };
  } catch (error) {
    console.error('Auth validation error:', error);
    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication validation failed', code: 'AUTH_ERROR' },
        { status: 500 }
      )
    };
  }
}

// Get account context for the user
async function getAccountContext(request: NextRequest, userId: string, supabase: any) {
  try {
    // Get current account from header
    const currentAccountId = request.headers.get('x-current-account');
    
    // Get all accounts the user has access to
    const { data: userAccounts, error: accountsError } = await supabase
      .from('account_users')
      .select(`
        account_id,
        role,
        accounts!inner (
          id,
          name,
          description,
          owner_id,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (accountsError) {
      console.error('Error fetching user accounts:', accountsError);
      return { accounts: [], currentAccount: null };
    }

    const accounts = userAccounts?.map(ua => ({
      id: ua.accounts.id,
      name: ua.accounts.name,
      description: ua.accounts.description,
      owner_id: ua.accounts.owner_id,
      created_at: ua.accounts.created_at,
      userRole: ua.role
    })) || [];

    // Determine current account
    let currentAccount = null;
    if (currentAccountId) {
      currentAccount = accounts.find(acc => acc.id === currentAccountId) || null;
    }
    if (!currentAccount && accounts.length > 0) {
      // Default to first account if none specified
      currentAccount = accounts[0];
    }

    return { accounts, currentAccount };
  } catch (error) {
    console.error('Error getting account context:', error);
    return { accounts: [], currentAccount: null };
  }
}

// GET /api/user/properties - Get properties accessible to the user
export async function GET(request: NextRequest): Promise<NextResponse<PropertyResponse>> {
  try {
    console.log('User properties API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateUserAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    console.log('Authentication successful for user:', user?.email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 401 }
      );
    }

    // Use imported supabase client
    
    // Get account context
    const { accounts, currentAccount } = await getAccountContext(request, user.id, supabase);
    
    if (!currentAccount) {
      console.log('No accessible accounts found for user:', user.email);
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    console.log('Loading properties for account:', currentAccount.name, 'user:', user.email);

    // Get properties for the current account
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        description,
        account_id,
        created_at,
        updated_at
      `)
      .eq('account_id', currentAccount.id)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch properties', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    console.log(`Successfully loaded ${properties?.length || 0} properties for user ${user.email}`);
    
    return NextResponse.json({
      success: true,
      data: properties || []
    });

  } catch (error) {
    console.error('User properties API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}