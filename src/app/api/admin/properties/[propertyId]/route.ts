import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    console.log('🔑 validateAdminAuth: Starting authentication validation...');
    const supabase = await createSupabaseServer();
    console.log('🔑 validateAdminAuth: Supabase server client created');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔑 validateAdminAuth: Got user from Supabase:', { user: user?.email, error: userError?.message });

    if (userError || !user) {
      console.log('🔑 validateAdminAuth: User session not found:', userError?.message);
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
      console.log('🔑 validateAdminAuth: No email in user data');
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
    console.log('🔑 validateAdminAuth: User email found:', user.email);

    // Check if user is an admin
    console.log('🔑 validateAdminAuth: Checking if user is admin...');
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();
    console.log('🔑 validateAdminAuth: Admin check result:', { adminUser, adminError: adminError?.message });

    if (adminError || !adminUser) {
      // If not admin, check if user is a regular user
      console.log('🔑 validateAdminAuth: Not admin, checking if regular user...');
      const { data: regularUser, error: userError } = await supabase
        .from('users')
        .select('email, full_name, role')
        .eq('id', user.id)
        .single();
      console.log('🔑 validateAdminAuth: Regular user check result:', { regularUser, userError: userError?.message });

      if (userError || !regularUser) {
        console.log('🔑 validateAdminAuth: User validation failed:', { 
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

      console.log('🔑 validateAdminAuth: Authentication successful for user:', validatedUser.email);
      return { user: validatedUser, isAdmin: false, supabase };
    }

    // Return admin user data
    const validatedUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role
    };

    console.log('🔑 validateAdminAuth: Authentication successful for admin:', validatedUser.email);
    return { user: validatedUser, isAdmin: adminUser.role === 'admin', supabase };

  } catch (error) {
    console.error('🔑 validateAdminAuth: Auth validation error:', error);
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

// Check if user can access specific property within account context
async function canAccessProperty(user: any, propertyId: string, isAdmin: boolean, accountId: string | null, supabase: any): Promise<{ canAccess: boolean; property?: any; error?: any }> {
  try {
    // Get property with owner and account information
    let propertyQuery = supabase
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
      .eq('id', propertyId);

    // Add account filtering if account context is specified
    if (accountId) {
      propertyQuery = propertyQuery.eq('account_id', accountId);
    }

    const { data: property, error: propertyError } = await propertyQuery.single();

  if (propertyError || !property) {
      return { 
        canAccess: false, 
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Property not found or not accessible within current account context',
            code: 'NOT_FOUND' 
          },
          { status: 404 }
        )
      };
    }

    // Admin can access any property within their account context
    if (isAdmin) {
      // If no account context, admin can access any property
      // If account context specified, property must belong to that account
      const canAccess = !accountId || property.account_id === accountId;
      
      if (!canAccess) {
        return { 
          canAccess: false, 
          error: NextResponse.json(
            { 
              success: false, 
              error: 'Property does not belong to the specified account',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      
      return { canAccess: true, property };
    } else {
      // Regular user can only access their own properties within their account
      const canAccess = property.user_id === user.id && 
                       accountId && property.account_id === accountId;
      
      if (!canAccess) {
        return { 
          canAccess: false, 
          error: NextResponse.json(
            { 
              success: false, 
              error: 'Access denied to property within account context',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      
      return { canAccess: true, property };
    }
  } catch (error) {
    console.error('Property access validation error:', error);
    return { 
      canAccess: false, 
      error: NextResponse.json(
        { 
          success: false, 
          error: 'Failed to validate property access',
          code: 'VALIDATION_ERROR' 
        },
        { status: 500 }
      )
    };
  }
}

// GET /api/admin/properties/[propertyId] - Get specific property with account context
export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase; // Get supabase client from authResult

    const { propertyId } = params;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;

    // Check access permissions with account context
    const { canAccess, property, error } = await canAccessProperty(user, propertyId, userIsAdmin, accountId, supabase);

    if (!canAccess || error) {
      return error;
    }

    console.log(`Property detail accessed by: ${user.email}, account: ${accountId || 'all'}, property: ${property.nickname}`);

    return NextResponse.json({
      success: true,
      data: property,
      accountContext: {
        accountId,
        accountRole
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/properties/[propertyId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/properties/[propertyId] - Update specific property with account validation
export async function PUT(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase; // Get supabase client from authResult

    const { propertyId } = params;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate property data
    const validationErrors = validatePropertyData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;

    // Check access permissions with account context
    const { canAccess, property, error } = await canAccessProperty(user, propertyId, userIsAdmin, accountId, supabase);

    if (!canAccess || error) {
      return error;
    }

    // Verify property type exists
    const { data: propertyType, error: propertyTypeError } = await supabase
      .from('property_types')
      .select('id')
      .eq('id', body.propertyTypeId)
      .single();

    if (propertyTypeError || !propertyType) {
      return NextResponse.json(
        { success: false, error: 'Invalid property type' },
        { status: 400 }
      );
    }

    // Update the property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update({
        property_type_id: body.propertyTypeId,
        nickname: body.nickname.trim(),
        address: body.address?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .eq('account_id', accountId || property.account_id) // Ensure account context is maintained
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
      .single();

    if (updateError) {
      console.error('Error updating property:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update property within account context' },
        { status: 500 }
      );
    }

    console.log(`Property updated by: ${user.email}, account: ${accountId || 'all'}, property: ${updatedProperty.nickname}`);

    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully',
      accountContext: {
        accountId,
        accountRole
      }
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/properties/[propertyId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/properties/[propertyId] - Delete specific property with account validation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase; // Get supabase client from authResult

    const { propertyId } = params;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;

    // Check access permissions with account context
    const { canAccess, property, error } = await canAccessProperty(user, propertyId, userIsAdmin, accountId, supabase);

    if (!canAccess || error) {
      return error;
    }

    // Check if property has any items
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id')
      .eq('property_id', propertyId)
      .limit(1);

    if (itemsError) {
      console.error('Error checking property items:', itemsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check property dependencies' },
        { status: 500 }
      );
    }

    if (items && items.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete property that contains items. Please move or delete all items first.' },
        { status: 409 }
      );
    }

    // Delete the property within account context
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('account_id', accountId || property.account_id); // Ensure account context is maintained

    if (deleteError) {
      console.error('Error deleting property:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete property within account context' },
        { status: 500 }
      );
    }

    console.log(`Property deleted by: ${user.email}, account: ${accountId || 'all'}, property: ${property.nickname}`);

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
      accountContext: {
        accountId,
        accountRole
      }
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/properties/[propertyId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Method not allowed handler
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
} 