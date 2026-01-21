import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import {
  needsDefaultProperty,
  getDefaultPropertyType,
  createDefaultPropertyPayload,
  validatePropertyCreation
} from '@/lib/property-utils';

/**
 * POST /api/user/properties/default
 *
 * Creates a default property for a new user if they have none.
 * Returns existing properties if user already has some.
 *
 * REQ-142: Default Property Auto-Creation
 * @created 2026-01-08
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Default property API: Starting...');

    // Create Supabase client and get authenticated user
    const supabase = await createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('Default property API: User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Default property API: User authenticated:', user.email);

    // Check if user already has properties
    const { data: existingProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, nickname, property_type_id, address, created_at, updated_at, user_id, account_id')
      .eq('user_id', user.id);

    if (propertiesError) {
      console.error('Default property API: Error fetching properties:', propertiesError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing properties' },
        { status: 500 }
      );
    }

    // If user already has properties, return them
    if (!needsDefaultProperty(existingProperties)) {
      console.log('Default property API: User already has properties:', existingProperties?.length);
      return NextResponse.json({
        success: true,
        data: existingProperties,
        message: 'User already has properties',
        created: false,
      });
    }

    console.log('Default property API: User needs default property');

    // Get available property types
    const { data: propertyTypes, error: typesError } = await supabase
      .from('property_types')
      .select('id, name, display_name, description, created_at');

    if (typesError || !propertyTypes || propertyTypes.length === 0) {
      console.error('Default property API: No property types available:', typesError);
      return NextResponse.json(
        { success: false, error: 'No property types available' },
        { status: 500 }
      );
    }

    // Get default property type
    const defaultType = getDefaultPropertyType(propertyTypes);
    if (!defaultType) {
      return NextResponse.json(
        { success: false, error: 'Could not determine default property type' },
        { status: 500 }
      );
    }

    console.log('Default property API: Using property type:', defaultType.name);

    // Validate creation parameters
    const validation = validatePropertyCreation(user.id, defaultType.id);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Get user's account for property association
    const { data: accountUser, error: accountError } = await supabase
      .from('account_users')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (accountError) {
      console.warn('Default property API: Could not get user account:', accountError);
      // Continue without account_id - property will still be created
    }

    // Create default property
    const { data: newProperty, error: createError } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
        property_type_id: defaultType.id,
        account_id: accountUser?.account_id || null,
        nickname: 'My Property',
        address: null,
      })
      .select('id, nickname, property_type_id, address, created_at, account_id')
      .single();

    if (createError) {
      console.error('Default property API: Failed to create property:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create default property' },
        { status: 500 }
      );
    }

    console.log('Default property API: Created property:', newProperty.id);

    return NextResponse.json({
      success: true,
      data: [newProperty],
      message: 'Default property created successfully',
      created: true,
    });

  } catch (error) {
    console.error('Default property API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
