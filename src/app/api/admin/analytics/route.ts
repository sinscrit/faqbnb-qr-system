import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header found');
      return { user: null, isAdmin: false, error: 'No authorization header' };
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

// Interface for system-wide analytics response
interface SystemAnalyticsResponse {
  success: boolean;
  data?: {
    overview: {
      totalItems: number;
      totalVisits: number;
      totalReactions: number;
      activeItems: number; // Items with visits in last 30 days
    };
    timeBasedVisits: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
      last365Days: number;
    };
    topItems: Array<{
      id: string;
      publicId: string;
      name: string;
      visitCount: number;
      reactionCount: number;
    }>;
    reactionTrends: {
      like: number;
      dislike: number;
      love: number;
      confused: number;
      total: number;
    };
    pagination?: {
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
  code?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('System analytics API called - validating authentication...');
    
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const propertyId = searchParams.get('propertyId') || '';

    console.log('System analytics request with params:', { page, limit, timeRange, propertyId });

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid pagination parameters',
          code: 'INVALID_PARAMS'
        },
        { status: 400 }
      );
    }

    // Get overview statistics
    console.log('Fetching overview statistics...');
    
    // Total items count (with property filtering if specified)
    let itemsQuery = supabase
      .from('items')
      .select('*', { count: 'exact', head: true });
    
    if (propertyId) {
      itemsQuery = itemsQuery.eq('property_id', propertyId);
    }
    
    const { count: totalItems, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Error fetching items count:', itemsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch items count',
          code: 'ITEMS_COUNT_FAILED'
        },
        { status: 500 }
      );
    }

    // Total visits count (with property filtering if specified)
    let totalVisits = 0;
    let visitsError = null;
    
    if (propertyId) {
      // For property filtering, we need to join with items table
      const { count, error } = await supabase
        .from('item_visits')
        .select('*, items!inner(property_id)', { count: 'exact', head: true })
        .eq('items.property_id', propertyId);
      totalVisits = count || 0;
      visitsError = error;
    } else {
      // Simple count without property filtering
      const { count, error } = await supabase
        .from('item_visits')
        .select('*', { count: 'exact', head: true });
      totalVisits = count || 0;
      visitsError = error;
    }

    if (visitsError) {
      console.error('Error fetching visits count:', visitsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch visits count',
          code: 'VISITS_COUNT_FAILED'
        },
        { status: 500 }
      );
    }

    // Total reactions count (with property filtering if specified)
    let totalReactions = 0;
    let reactionsError = null;
    
    if (propertyId) {
      // For property filtering, we need to join with items table
      const { count, error } = await supabase
        .from('item_reactions')
        .select('*, items!inner(property_id)', { count: 'exact', head: true })
        .eq('items.property_id', propertyId);
      totalReactions = count || 0;
      reactionsError = error;
    } else {
      // Simple count without property filtering
      const { count, error } = await supabase
        .from('item_reactions')
        .select('*', { count: 'exact', head: true });
      totalReactions = count || 0;
      reactionsError = error;
    }

    if (reactionsError) {
      console.error('Error fetching reactions count:', reactionsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch reactions count',
          code: 'REACTIONS_COUNT_FAILED'
        },
        { status: 500 }
      );
    }

    // Active items (with visits in last 30 days, with property filtering if specified)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let activeItemsData = null;
    let activeItemsError = null;
    
    if (propertyId) {
      // For property filtering, we need to join with items table
      const { data, error } = await supabase
        .from('item_visits')
        .select('item_id, items!inner(property_id)')
        .eq('items.property_id', propertyId)
        .gte('visited_at', thirtyDaysAgo.toISOString());
      activeItemsData = data;
      activeItemsError = error;
    } else {
      // Simple query without property filtering
      const { data, error } = await supabase
        .from('item_visits')
        .select('item_id')
        .gte('visited_at', thirtyDaysAgo.toISOString());
      activeItemsData = data;
      activeItemsError = error;
    }

    if (activeItemsError) {
      console.error('Error fetching active items:', activeItemsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch active items',
          code: 'ACTIVE_ITEMS_FAILED'
        },
        { status: 500 }
      );
    }

    const uniqueActiveItems = new Set(activeItemsData?.map(v => v.item_id) || []);
    const activeItems = uniqueActiveItems.size;

    // Time-based visits
    console.log('Calculating time-based visits...');
    const now = new Date();
    const timeRanges = {
      last24Hours: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      last7Days: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      last30Days: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      last365Days: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    };

    const timeBasedVisits = {
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0,
      last365Days: 0,
    };

    // Get all visits for time-based calculations (with property filtering if specified)
    let allVisitsData = null;
    let allVisitsError = null;
    
    if (propertyId) {
      // For property filtering, we need to join with items table
      const { data, error } = await supabase
        .from('item_visits')
        .select('visited_at, items!inner(property_id)')
        .eq('items.property_id', propertyId);
      allVisitsData = data;
      allVisitsError = error;
    } else {
      // Simple query without property filtering
      const { data, error } = await supabase
        .from('item_visits')
        .select('visited_at');
      allVisitsData = data;
      allVisitsError = error;
    }

    if (allVisitsError) {
      console.error('Error fetching all visits:', allVisitsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch visits data',
          code: 'VISITS_DATA_FAILED'
        },
        { status: 500 }
      );
    }

    // Calculate time-based counts manually
    const visits = allVisitsData || [];
    timeBasedVisits.last24Hours = visits.filter(v => 
      new Date(v.visited_at) >= timeRanges.last24Hours
    ).length;
    timeBasedVisits.last7Days = visits.filter(v => 
      new Date(v.visited_at) >= timeRanges.last7Days
    ).length;
    timeBasedVisits.last30Days = visits.filter(v => 
      new Date(v.visited_at) >= timeRanges.last30Days
    ).length;
    timeBasedVisits.last365Days = visits.filter(v => 
      new Date(v.visited_at) >= timeRanges.last365Days
    ).length;

    // Get top items with visit and reaction counts (with property filtering if specified)
    console.log('Fetching top items...');
    const offset = (page - 1) * limit;
    
    let topItemsQuery = supabase
      .from('items')
      .select('id, public_id, name')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (propertyId) {
      topItemsQuery = topItemsQuery.eq('property_id', propertyId);
    }
    
    const { data: itemsData, error: topItemsError } = await topItemsQuery;

    if (topItemsError) {
      console.error('Error fetching top items:', topItemsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch top items',
          code: 'TOP_ITEMS_FAILED'
        },
        { status: 500 }
      );
    }

    // Get visit and reaction counts for each item
    const topItems = await Promise.all(
      (itemsData || []).map(async (item) => {
        // Count visits for this item
        const { count: visitCount } = await supabase
          .from('item_visits')
          .select('*', { count: 'exact', head: true })
          .eq('item_id', item.id);

        // Count reactions for this item
        const { count: reactionCount } = await supabase
          .from('item_reactions')
          .select('*', { count: 'exact', head: true })
          .eq('item_id', item.id);

        return {
          id: item.id,
          publicId: item.public_id,
          name: item.name,
          visitCount: visitCount || 0,
          reactionCount: reactionCount || 0,
        };
      })
    );

    // Sort top items by visit count (descending)
    topItems.sort((a, b) => b.visitCount - a.visitCount);

    // Get reaction trends (with property filtering if specified)
    console.log('Calculating reaction trends...');
    let reactionsData = null;
    let reactionTrendsError = null;
    
    if (propertyId) {
      // For property filtering, we need to join with items table
      const { data, error } = await supabase
        .from('item_reactions')
        .select('reaction_type, items!inner(property_id)')
        .eq('items.property_id', propertyId);
      reactionsData = data;
      reactionTrendsError = error;
    } else {
      // Simple query without property filtering
      const { data, error } = await supabase
        .from('item_reactions')
        .select('reaction_type');
      reactionsData = data;
      reactionTrendsError = error;
    }

    if (reactionTrendsError) {
      console.error('Error fetching reaction trends:', reactionTrendsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch reaction trends',
          code: 'REACTION_TRENDS_FAILED'
        },
        { status: 500 }
      );
    }

    const reactionTrends = {
      like: 0,
      dislike: 0,
      love: 0,
      confused: 0,
      total: 0,
    };

    (reactionsData || []).forEach(reaction => {
      const type = reaction.reaction_type as keyof typeof reactionTrends;
      if (type in reactionTrends) {
        reactionTrends[type]++;
        reactionTrends.total++;
      }
    });

    // Calculate pagination info
    const totalPages = Math.ceil((totalItems || 0) / limit);
    
    const systemAnalytics: SystemAnalyticsResponse = {
      success: true,
      data: {
        overview: {
          totalItems: totalItems || 0,
          totalVisits: totalVisits || 0,
          totalReactions: totalReactions || 0,
          activeItems,
        },
        timeBasedVisits,
        topItems,
        reactionTrends,
        pagination: {
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };

    console.log(`System analytics calculated:`, {
      totalItems: totalItems || 0,
      totalVisits: totalVisits || 0,
      totalReactions: totalReactions || 0,
      activeItems,
      topItemsCount: topItems.length,
    });

    // Add audit log for admin operations
    console.log(`System analytics accessed by: ${authResult.user?.email}, page: ${page}, limit: ${limit}`);

    return NextResponse.json(systemAnalytics);

  } catch (error) {
    console.error('System analytics API error:', error);
    
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