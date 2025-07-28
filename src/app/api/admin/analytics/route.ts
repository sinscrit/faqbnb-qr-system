import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('User session not found:', userError?.message);
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

// Helper function to extract account context from request
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean) {
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
      // Admin can see all accounts - no specific filtering unless requested
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
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  error?: string;
  code?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('System analytics API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    
    console.log('Authentication successful for user:', user.email, 'account:', accountId || 'all');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const propertyId = searchParams.get('propertyId') || '';

    console.log('System analytics request with params:', { page, limit, timeRange, propertyId, accountId });

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

    // Get overview statistics with account filtering
    console.log('Fetching overview statistics...');
    
    // Total items count (with account and property filtering)
    let itemsQuery = supabase
      .from('items')
      .select('*, properties!inner(account_id, user_id)', { count: 'exact', head: true });
    
    // Apply account filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all items when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's items
      itemsQuery = itemsQuery.eq('properties.account_id', accountId);
    } else {
      // Regular user can only see items within their account context
      itemsQuery = itemsQuery
        .eq('properties.account_id', accountId)
        .eq('properties.user_id', user.id);
    }
    
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

    // Total visits count (with account filtering through items->properties relationship)
    let totalVisits = 0;
    let visitsError = null;
    
    let visitsQuery = supabase
        .from('item_visits')
      .select('*, items!inner(property_id, properties!inner(account_id, user_id))', { count: 'exact', head: true });

    // Apply account filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all visits when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's visits
      visitsQuery = visitsQuery.eq('items.properties.account_id', accountId);
    } else {
      // Regular user can only see visits within their account context
      visitsQuery = visitsQuery
        .eq('items.properties.account_id', accountId)
        .eq('items.properties.user_id', user.id);
    }
    
    if (propertyId) {
      visitsQuery = visitsQuery.eq('items.property_id', propertyId);
    }
    
    const { count, error } = await visitsQuery;
    totalVisits = count || 0;
    visitsError = error;

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

    // Total reactions count (with account filtering through items->properties relationship)
    let totalReactions = 0;
    let reactionsError = null;
    
    let reactionsQuery = supabase
        .from('item_reactions')
      .select('*, items!inner(property_id, properties!inner(account_id, user_id))', { count: 'exact', head: true });

    // Apply account filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all reactions when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's reactions
      reactionsQuery = reactionsQuery.eq('items.properties.account_id', accountId);
    } else {
      // Regular user can only see reactions within their account context
      reactionsQuery = reactionsQuery
        .eq('items.properties.account_id', accountId)
        .eq('items.properties.user_id', user.id);
    }
    
    if (propertyId) {
      reactionsQuery = reactionsQuery.eq('items.property_id', propertyId);
    }
    
    const { count: reactionCount, error: reactionError } = await reactionsQuery;
    totalReactions = reactionCount || 0;
    reactionsError = reactionError;

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

    // Active items (with visits in last 30 days, with account filtering)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let activeItemsQuery = supabase
      .from('item_visits')
      .select('item_id, items!inner(property_id, properties!inner(account_id, user_id))')
      .gte('visited_at', thirtyDaysAgo.toISOString());

    // Apply account filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all active items when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's active items
      activeItemsQuery = activeItemsQuery.eq('items.properties.account_id', accountId);
    } else {
      // Regular user can only see active items within their account context
      activeItemsQuery = activeItemsQuery
        .eq('items.properties.account_id', accountId)
        .eq('items.properties.user_id', user.id);
    }
    
    if (propertyId) {
      activeItemsQuery = activeItemsQuery.eq('items.property_id', propertyId);
    }

    const { data: activeItemsData, error: activeItemsError } = await activeItemsQuery;

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

    // Get all visits for time-based calculations (with account filtering)
    let allVisitsQuery = supabase
      .from('item_visits')
      .select('visited_at, items!inner(property_id, properties!inner(account_id, user_id))');

    // Apply account filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all visits when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's visits
      allVisitsQuery = allVisitsQuery.eq('items.properties.account_id', accountId);
    } else {
      // Regular user can only see visits within their account context
      allVisitsQuery = allVisitsQuery
        .eq('items.properties.account_id', accountId)
        .eq('items.properties.user_id', user.id);
    }
    
    if (propertyId) {
      allVisitsQuery = allVisitsQuery.eq('items.property_id', propertyId);
    }

    const { data: allVisitsData, error: allVisitsError } = await allVisitsQuery;

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

    // Get top items with visit and reaction counts (with account filtering)
    console.log('Fetching top items...');
    const offset = (page - 1) * limit;
    
    let topItemsQuery = supabase
      .from('items')
      .select('id, public_id, name, properties!inner(account_id, user_id)')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply account filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all items when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's items
      topItemsQuery = topItemsQuery.eq('properties.account_id', accountId);
    } else {
      // Regular user can only see items within their account context
      topItemsQuery = topItemsQuery
        .eq('properties.account_id', accountId)
        .eq('properties.user_id', user.id);
    }
    
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

    // Get reaction trends (with account filtering)
    console.log('Calculating reaction trends...');
    let reactionTrendsQuery = supabase
      .from('item_reactions')
      .select('reaction_type, items!inner(property_id, properties!inner(account_id, user_id))');

    // Apply account filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all reactions when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's reactions
      reactionTrendsQuery = reactionTrendsQuery.eq('items.properties.account_id', accountId);
    } else {
      // Regular user can only see reactions within their account context
      reactionTrendsQuery = reactionTrendsQuery
        .eq('items.properties.account_id', accountId)
        .eq('items.properties.user_id', user.id);
    }
    
    if (propertyId) {
      reactionTrendsQuery = reactionTrendsQuery.eq('items.property_id', propertyId);
    }

    const { data: reactionsData, error: reactionTrendsError } = await reactionTrendsQuery;

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
      accountContext: {
        accountId,
        accountRole
      }
    };

    console.log(`System analytics calculated for account: ${accountId || 'all'}:`, {
      totalItems: totalItems || 0,
      totalVisits: totalVisits || 0,
      totalReactions: totalReactions || 0,
      activeItems,
      topItemsCount: topItems.length,
    });

    console.log(`System analytics accessed by: ${user.email}, account: ${accountId || 'all'}, page: ${page}, limit: ${limit}`);

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