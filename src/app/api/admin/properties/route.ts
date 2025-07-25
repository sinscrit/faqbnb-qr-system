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

// GET /api/admin/properties - List properties based on user role
export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;

    let propertiesQuery;
    if (userIsAdmin) {
      // Admin can see all properties with user information
      propertiesQuery = supabase
        .from('properties')
        .select(`
          id,
          nickname,
          address,
          created_at,
          updated_at,
          user_id,
          property_type_id,
          property_types!inner(id, name, display_name),
          users!inner(id, email, full_name)
        `)
        .order('created_at', { ascending: false });
    } else {
      // Regular user can only see their own properties
      propertiesQuery = supabase
        .from('properties')
        .select(`
          id,
          nickname,
          address,
          created_at,
          updated_at,
          property_type_id,
          property_types!inner(id, name, display_name)
        `)
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

    console.log(`Properties list accessed by: ${user.email}, found ${properties?.length || 0} properties`);

    return NextResponse.json({
      success: true,
      data: properties || [],
      isAdmin: userIsAdmin
    });

  } catch (error) {
    console.error('Error in GET /api/admin/properties:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;

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
    
    // Determine user_id for the property
    let targetUserId = user.id;
    
    // If admin is creating property for another user
    if (userIsAdmin && body.userId) {
      targetUserId = body.userId;
      
      // Verify the target user exists
      const { data: targetUser, error: targetUserError } = await supabase
        .from('users')
        .select('id')
        .eq('id', body.userId)
        .single();
        
      if (targetUserError || !targetUser) {
        return NextResponse.json(
          { success: false, error: 'Target user not found' },
          { status: 404 }
        );
      }
    } else if (!userIsAdmin && body.userId) {
      // Regular users cannot create properties for other users
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
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

    // Create the property
    const { data: newProperty, error: createError } = await supabase
      .from('properties')
      .insert({
        user_id: targetUserId,
        property_type_id: body.propertyTypeId,
        nickname: body.nickname.trim(),
        address: body.address?.trim() || null
      })
      .select(`
        id,
        nickname,
        address,
        created_at,
        updated_at,
        user_id,
        property_type_id,
        property_types!inner(id, name, display_name)
      `)
      .single();

    if (createError) {
      console.error('Error creating property:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create property' },
        { status: 500 }
      );
    }

    console.log(`Property created by: ${user.email}, property: ${newProperty.nickname}`);

    return NextResponse.json({
      success: true,
      data: newProperty,
      message: 'Property created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/admin/properties:', error);
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