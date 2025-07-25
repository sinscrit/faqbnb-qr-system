import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/admin/property-types - List all property types
export async function GET(request: NextRequest) {
  try {
    // Property types are publicly readable, no auth required
    const { data: propertyTypes, error } = await supabase
      .from('property_types')
      .select('id, name, display_name, description')
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching property types:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch property types' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: propertyTypes || []
    });

  } catch (error) {
    console.error('Error in GET /api/admin/property-types:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 