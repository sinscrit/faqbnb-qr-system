import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ItemsResponse {
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

// Check if user can access the property
async function canAccessProperty(user: any, propertyId: string, supabase: any): Promise<{ canAccess: boolean; property?: any }> {
  try {
    // Get property with account information
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        account_id
      `)
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return { canAccess: false };
    }

    // Check if user has access to the account that owns this property
    const { data: accountAccess, error: accessError } = await supabase
      .from('account_users')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('account_id', property.account_id)
      .single();

    if (accessError || !accountAccess) {
      return { canAccess: false };
    }

    return { canAccess: true, property };
  } catch (error) {
    console.error('Error checking property access:', error);
    return { canAccess: false };
  }
}

// GET /api/user/properties/[propertyId]/items - Get items for a specific property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
): Promise<NextResponse<ItemsResponse>> {
  try {
    console.log('User property items API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateUserAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    const { propertyId } = await params;
    
    console.log('Authentication successful for user:', user?.email, 'requesting items for property:', propertyId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 401 }
      );
    }

    // Use imported supabase client
    
    // Check if user can access this property
    const accessResult = await canAccessProperty(user, propertyId, supabase);
    if (!accessResult.canAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this property', code: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Get items for this property
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`
        id,
        public_id,
        name,
        description,
        property_id,
        qr_code_url,
        created_at,
        updated_at
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('Error fetching items for property:', propertyId, itemsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch items', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    console.log(`Successfully loaded ${items?.length || 0} items for property ${propertyId}, user ${user.email}`);
    
    return NextResponse.json({
      success: true,
      data: items || []
    });

  } catch (error) {
    console.error('User property items API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}