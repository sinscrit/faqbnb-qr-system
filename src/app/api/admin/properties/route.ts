import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth-server';

// Helper function to extract account context from request
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean, supabase: any) {
  try {
    // Extract account_id from query parameters or headers
    const { searchParams } = new URL(request.url);
    const requestedAccountId = searchParams.get('account_id') || request.headers.get('x-account-id');
    
    if (requestedAccountId) {
      // Validate user has access to the requested account
      const { data: accountAccess, error: accessError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('account_id', requestedAccountId)
        .eq('user_id', userId)
        .single();
        
      if (accessError || !accountAccess) {
        return {
          error: NextResponse.json(
            { 
              success: false, 
              error: 'Access denied to requested account',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      
      return { accountId: requestedAccountId, accountRole: accountAccess.role };
    }
    
    // If no specific account requested, get user's default account
    if (isAdmin) {
      // For admins: try to get their primary account or allow null for system-wide operations
      const { data: adminAccounts, error: adminAccountsError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
      if (!adminAccountsError && adminAccounts) {
        return { accountId: adminAccounts.account_id, accountRole: adminAccounts.role };
      }
      
      // Fallback for system admin operations
      return { accountId: null, accountRole: 'admin' };
    } else {
      // Regular user: get their primary account
      const { data: userAccounts, error: accountsError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
      if (accountsError || !userAccounts) {
        return {
          error: NextResponse.json(
            { 
              success: false, 
              error: 'No account access found for user',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      
      return { accountId: userAccounts.account_id, accountRole: userAccounts.role };
    }
  } catch (error) {
    console.error('Account context extraction error:', error);
    return {
      error: NextResponse.json(
        { 
          success: false, 
          error: 'Failed to determine account context',
          code: 'ACCOUNT_ERROR' 
        },
        { status: 500 }
      )
    };
  }
}

// Property validation helper
function validatePropertyData(data: any) {
  const errors: string[] = [];
  
  if (!data.nickname || typeof data.nickname !== 'string' || data.nickname.trim().length === 0) {
    errors.push('Property nickname is required');
  } else if (data.nickname.trim().length > 100) {
    errors.push('Property nickname must be 100 characters or less');
  }
  
  if (data.address && typeof data.address !== 'string') {
    errors.push('Property address must be a string');
  }
  
  if (!data.propertyTypeId || typeof data.propertyTypeId !== 'string') {
    errors.push('Property type is required');
  }
  
  return errors;
}

// GET /api/admin/properties - List properties based on user role and account context
export async function GET(request: NextRequest) {
  try {
    console.error('🚨 PROPERTIES_API_DEBUG: Admin properties API called - validating authentication...');
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase; // Get supabase client from authResult

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;

    let propertiesQuery;
    if (userIsAdmin && !accountId) {
      // Admin can see all properties when no specific account is requested
      propertiesQuery = supabase
        .from('properties')
        .select(`
          id,
          nickname,
          address,
          created_at,
          updated_at,
          user_id,
          account_id,
          property_type_id,
          property_types!inner(id, name, display_name),
          users!inner(id, email, full_name)
        `)
        .order('created_at', { ascending: false });
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's properties
      propertiesQuery = supabase
        .from('properties')
        .select(`
          id,
          nickname,
          address,
          created_at,
          updated_at,
          user_id,
          account_id,
          property_type_id,
          property_types!inner(id, name, display_name),
          users!inner(id, email, full_name)
        `)
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });
    } else {
      // Regular user can only see properties within their account context
      propertiesQuery = supabase
        .from('properties')
        .select(`
          id,
          nickname,
          address,
          created_at,
          updated_at,
          property_type_id,
          account_id,
          property_types!inner(id, name, display_name)
        `)
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    }

    const { data: properties, error: propertiesError } = await propertiesQuery;

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    console.log(`Properties list accessed by: ${user.email}, account: ${accountId || 'all'}, found ${properties?.length || 0} properties`);

    return NextResponse.json({
      success: true,
      data: properties || [],
      isAdmin: userIsAdmin,
      accountContext: {
        accountId,
        accountRole
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/properties:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/properties - Create new property within account context
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 POST /api/admin/properties - Starting property creation...');
    
    // Validate authentication
    console.log('🔍 Step 1: Validating authentication...');
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('❌ Authentication failed');
      return authResult.error;
    }
    console.log('✅ Authentication successful');

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase; // Get supabase client from authResult
    console.log('👤 User info:', { email: user.email, isAdmin: userIsAdmin });

    // Get account context
    console.log('🔍 Step 2: Getting account context...');
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      console.log('❌ Account context failed');
      return accountContext.error;
    }
    console.log('✅ Account context successful');

    const { accountId, accountRole } = accountContext;
    console.log('🏢 Account context:', { accountId, accountRole });

    // Ensure we have an account context for property creation
    if (!accountId) {
      console.log('❌ No account context for property creation');
      return NextResponse.json(
        { success: false, error: 'Account context required for property creation' },
        { status: 400 }
      );
    }

    // Parse request body
    console.log('🔍 Step 3: Parsing request body...');
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    // Validate property data
    console.log('🔍 Step 4: Validating property data...');
    const validationErrors = validatePropertyData(body);
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    console.log('✅ Property data validation successful');
    
    // Determine user_id for the property
    let targetUserId = user.id;
    console.log('👤 Target user ID:', targetUserId);
    
    // If admin is creating property for another user within the account
    if (userIsAdmin && body.userId) {
      targetUserId = body.userId;
      console.log('🔧 Admin creating for another user:', targetUserId);
      
      // Verify the target user exists and has access to this account
      const { data: targetUserAccess, error: targetUserError } = await supabase
        .from('account_users')
        .select('user_id')
        .eq('account_id', accountId)
        .eq('user_id', body.userId)
        .single();
        
      if (targetUserError || !targetUserAccess) {
        console.log('❌ Target user not found or no access:', targetUserError);
        return NextResponse.json(
          { success: false, error: 'Target user not found in account or does not have access' },
          { status: 404 }
        );
      }
    } else if (!userIsAdmin && body.userId) {
      // Regular users cannot create properties for other users
      console.log('❌ Regular user trying to create for another user');
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify property type exists
    console.log('🔍 Step 5: Verifying property type exists...');
    console.log('🏷️ Property type ID:', body.propertyTypeId);
    const { data: propertyType, error: propertyTypeError } = await supabase
      .from('property_types')
      .select('id')
      .eq('id', body.propertyTypeId)
      .single();

    if (propertyTypeError || !propertyType) {
      console.log('❌ Property type validation failed:', propertyTypeError);
      return NextResponse.json(
        { success: false, error: 'Invalid property type' },
        { status: 400 }
      );
    }
    console.log('✅ Property type exists:', propertyType);

    // Create the property within the account context
    console.log('🔍 Step 6: Creating property in database...');
    const propertyData = {
      user_id: targetUserId,
      account_id: accountId,
      property_type_id: body.propertyTypeId,
      nickname: body.nickname.trim(),
      address: body.address?.trim() || null
    };
    console.log('📝 Property data to insert:', propertyData);
    
    const { data: newProperty, error: createError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select(`
        id,
        nickname,
        address,
        created_at,
        updated_at,
        user_id,
        account_id,
        property_type_id,
        property_types!inner(id, name, display_name)
      `)
      .single();

    if (createError) {
      console.error('❌ Error creating property:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create property' },
        { status: 500 }
      );
    }

    console.log('✅ Property created successfully:', newProperty);
    console.log(`🎉 Property created by: ${user.email}, account: ${accountId}, property: ${newProperty.nickname}`);

    return NextResponse.json({
      success: true,
      data: newProperty,
      message: 'Property created successfully',
      accountContext: {
        accountId,
        accountRole
      }
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Error in POST /api/admin/properties:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Method not allowed handlers
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
} 