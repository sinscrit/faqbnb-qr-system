import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser, isAdmin } from '@/lib/auth';

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

// Check if user can access specific property
async function canAccessProperty(user: any, propertyId: string): Promise<{ canAccess: boolean; isAdmin: boolean; property?: any }> {
  const userIsAdmin = isAdmin(user);

  // Get property with owner information
  const { data: property, error: propertyError } = await supabase
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
    .eq('id', propertyId)
    .single();

  if (propertyError || !property) {
    return { canAccess: false, isAdmin: userIsAdmin };
  }

  // Admin can access any property, regular user can only access their own
  const canAccess = userIsAdmin || property.user_id === user.id;

  return { canAccess, isAdmin: userIsAdmin, property };
}

// GET /api/admin/properties/[propertyId] - Get specific property
export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    // Get user and validate authentication
    const userResult = await getUser();
    if (userResult.error || !userResult.data) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = userResult.data;
    const { propertyId } = params;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Check access permissions
    const { canAccess, property } = await canAccessProperty(user, propertyId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('Error in GET /api/admin/properties/[propertyId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/properties/[propertyId] - Update specific property
export async function PUT(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    // Get user and validate authentication
    const userResult = await getUser();
    if (userResult.error || !userResult.data) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = userResult.data;
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

    // Check access permissions
    const { canAccess, property } = await canAccessProperty(user, propertyId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
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
      .single();

    if (updateError) {
      console.error('Error updating property:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update property' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/properties/[propertyId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/properties/[propertyId] - Delete specific property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    // Get session and validate authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { propertyId } = params;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Check access permissions
    const { canAccess } = await canAccessProperty(session, propertyId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      );
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

    // Delete the property
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (deleteError) {
      console.error('Error deleting property:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete property' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
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