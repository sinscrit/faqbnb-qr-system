import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

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
    // Get session and validate authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or regular user
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    const isAdmin = !adminError && adminUser && adminUser.role === 'admin';

    let propertiesQuery;
    if (isAdmin) {
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
        .eq('user_id', session.user.id)
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

    return NextResponse.json({
      success: true,
      data: properties || [],
      isAdmin
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
    // Get session and validate authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
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

    // Check if user is admin or regular user
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    const isAdmin = !adminError && adminUser && adminUser.role === 'admin';
    
    // Determine user_id for the property
    let targetUserId = session.user.id;
    
    // If admin is creating property for another user
    if (isAdmin && body.userId) {
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
    } else if (!isAdmin && body.userId) {
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