import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PropertyDetailResponse {
  success: boolean;
  data?: any;
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
async function canAccessProperty(user: any, propertyId: string, supabase: any): Promise<{ canAccess: boolean; property?: any; error?: any }> {
  try {
    // Get property with account information
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        description,
        account_id,
        created_at,
        updated_at,
        accounts!inner (
          id,
          name
        )
      `)
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return { canAccess: false, error: 'Property not found' };
    }

    // Check if user has access to the account that owns this property
    const { data: accountAccess, error: accessError } = await supabase
      .from('account_users')
      .select('user_id, role')
      .eq('user_id', user.id)
      .eq('account_id', property.account_id)
      .single();

    if (accessError || !accountAccess) {
      return { canAccess: false, error: 'Access denied to this property' };
    }

    return { canAccess: true, property };
  } catch (error) {
    console.error('Error checking property access:', error);
    return { canAccess: false, error: 'Error checking property access' };
  }
}

// GET /api/user/properties/[propertyId] - Get specific property details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
): Promise<NextResponse<PropertyDetailResponse>> {
  try {
    console.log('User property detail API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateUserAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    const { propertyId } = await params;
    
    console.log('Authentication successful for user:', user?.email, 'requesting property:', propertyId);
    
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
      const statusCode = accessResult.error === 'Property not found' ? 404 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: accessResult.error || 'Access denied', 
          code: statusCode === 404 ? 'NOT_FOUND' : 'ACCESS_DENIED' 
        },
        { status: statusCode }
      );
    }

    console.log(`Successfully loaded property ${propertyId} for user ${user.email}`);
    
    return NextResponse.json({
      success: true,
      data: accessResult.property
    });

  } catch (error) {
    console.error('User property detail API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}