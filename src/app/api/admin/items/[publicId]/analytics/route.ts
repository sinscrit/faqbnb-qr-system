import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AnalyticsResponse, VisitAnalytics } from '@/types/analytics';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header found');
      return { user: null, isAdmin: false, error: 'Authentication required - no valid Authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 Validating JWT token for admin access...');

    // Validate token with Supabase
    const { data: authResult, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authResult.user) {
      console.log('❌ Token validation failed:', authError?.message || 'No user data');
      return { user: null, isAdmin: false, error: 'Invalid or expired token' };
    }

    // Check if user exists in admin_users table with proper role
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authResult.user.id)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminUser) {
      console.log('❌ User not found in admin_users or insufficient privileges');
      return { user: authResult.user, isAdmin: false, error: 'Insufficient privileges' };
    }

    console.log('✅ Admin authentication successful:', adminUser.email);
    return { 
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }, 
      isAdmin: true 
    };
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    return { user: null, isAdmin: false, error: 'Authentication failed' };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    console.log('Admin analytics API called - validating authentication...');
    
    // Validate authentication and admin role
    const authResult = await validateAdminAuth(request);
    
    if (!authResult.isAdmin || !authResult.user) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error || 'Authentication required',
          code: authResult.error === 'Insufficient privileges' ? 'FORBIDDEN' : 'UNAUTHORIZED'
        },
        { status: authResult.error === 'Insufficient privileges' ? 403 : 401 }
      );
    }
    
    console.log('Authentication successful for user:', authResult.user.email);

    const { publicId } = await params;
    console.log('Admin analytics request for publicId:', publicId);

    // Validate publicId is UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(publicId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid publicId format',
          code: 'INVALID_PUBLIC_ID'
        },
        { status: 400 }
      );
    }

    // Check if item exists first
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, name')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      console.error('Item not found:', itemError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Item not found',
          code: 'ITEM_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    console.log(`Found item: ${item.name} (ID: ${item.id})`);

    // Execute time-based analytics query with SQL aggregation
    const { data: analyticsData, error: analyticsError } = await supabase
      .rpc('get_item_visit_analytics', { 
        target_item_id: item.id 
      });

    // If the RPC function doesn't exist, fall back to manual query
    if (analyticsError && (analyticsError.code === '42883' || analyticsError.code === 'PGRST202')) {
      console.log('RPC function not found, using manual query approach');
      
      // Manual query approach using raw SQL
      const { data: visitData, error: visitError } = await supabase
        .from('item_visits')
        .select('visited_at')
        .eq('item_id', item.id);

      // Analytics query successful

      if (visitError) {
        console.error('Error fetching visit data:', visitError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to fetch analytics data',
            code: 'QUERY_FAILED'
          },
          { status: 500 }
        );
      }

      // Calculate time-based counts manually
      const now = new Date();
      const visits = visitData || [];
      
      const analytics: VisitAnalytics = {
        itemId: item.id,
        last24Hours: visits.filter(v => {
          const visitDate = new Date(v.visited_at);
          return now.getTime() - visitDate.getTime() <= 24 * 60 * 60 * 1000;
        }).length,
        last7Days: visits.filter(v => {
          const visitDate = new Date(v.visited_at);
          return now.getTime() - visitDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        }).length,
        last30Days: visits.filter(v => {
          const visitDate = new Date(v.visited_at);
          return now.getTime() - visitDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        }).length,
        last365Days: visits.filter(v => {
          const visitDate = new Date(v.visited_at);
          return now.getTime() - visitDate.getTime() <= 365 * 24 * 60 * 60 * 1000;
        }).length,
        allTime: visits.length
      };

      console.log(`Analytics for ${item.name}:`, analytics);

      // Add audit log for admin operations
      console.log(`Admin analytics accessed by: ${authResult.user.email}, item: ${item.name} (${publicId})`);

      const response: AnalyticsResponse = {
        success: true,
        data: analytics
      };

      return NextResponse.json(response);
    }

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch analytics data',
          code: 'ANALYTICS_FAILED'
        },
        { status: 500 }
      );
    }

    // Transform RPC result to VisitAnalytics format
    const analyticsResult = analyticsData?.[0];
    const analytics: VisitAnalytics = {
      itemId: item.id,
      last24Hours: analyticsResult?.last_24_hours || 0,
      last7Days: analyticsResult?.last_7_days || 0,
      last30Days: analyticsResult?.last_30_days || 0,
      last365Days: analyticsResult?.last_365_days || 0,
      allTime: analyticsResult?.all_time || 0
    };

    console.log(`Analytics for ${item.name}:`, analytics);

    // Add audit log for admin operations
    console.log(`Admin analytics accessed by: ${authResult.user.email}, item: ${item.name} (${publicId})`);

    const response: AnalyticsResponse = {
      success: true,
      data: analytics
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Admin analytics API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
} 