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

export async function GET(request: NextRequest) {
  try {
    console.log('Reaction analytics API called - validating authentication...');
    
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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const propertyId = searchParams.get('propertyId') || '';

    console.log('Reaction analytics request with params:', { timeRange, propertyId, accountId });

    // Calculate date filter based on time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get reaction data for the specified time range with account filtering
    let reactionsQuery = supabase
      .from('item_reactions')
      .select('reaction_type, created_at, items!inner(property_id, properties!inner(account_id, user_id))')
      .gte('created_at', startDate.toISOString());

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

    const { data: reactions, error: reactionsError } = await reactionsQuery;

    if (reactionsError) {
      console.error('Error fetching reactions:', reactionsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch reaction data',
        code: 'REACTIONS_FETCH_FAILED'
      }, { status: 500 });
    }

    // Process reaction data
    const reactionCounts = {
      like: 0,
      dislike: 0,
      love: 0,
      confused: 0,
      total: 0
    };

    // Count reactions by type
    if (reactions) {
      reactions.forEach(reaction => {
        const type = reaction.reaction_type as keyof typeof reactionCounts;
        if (type in reactionCounts) {
          reactionCounts[type]++;
          reactionCounts.total++;
        }
      });
    }

    // Calculate trends (optional - can be enhanced later)
    const trends = [];
    
    // If showing trends, calculate historical data
    if (searchParams.get('includeTrends') === 'true') {
      // This could be enhanced to show day-by-day or week-by-week trends
      // For now, just return empty trends array
      trends.push({
        period: timeRange,
        data: reactionCounts
      });
    }

    console.log(`Reaction analytics calculated for account: ${accountId || 'all'}:`, {
      totalReactions: reactionCounts.total,
      breakdown: reactionCounts
    });

    console.log(`Reaction analytics accessed by: ${user.email}, account: ${accountId || 'all'}, timeRange: ${timeRange}`);

    return NextResponse.json({
      success: true,
      data: {
        reactionBreakdown: reactionCounts,
        trends: trends,
        timeRange,
        metadata: {
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          totalReactions: reactionCounts.total
        }
      },
      accountContext: {
        accountId,
        accountRole
      }
    });

  } catch (error) {
    console.error('Error in reactions analytics API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
} 