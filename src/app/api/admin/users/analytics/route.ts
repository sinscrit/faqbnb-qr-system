import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

// User Analytics Response Interface
interface UserAnalytics {
  id: string;
  email: string;
  fullName: string;
  ownedAccounts: {
    count: number;
    totalItems: number;
    totalVisits: number;
  };
  accessAccounts: {
    count: number;
    totalItems: number;
    totalVisits: number;
  };
}

interface AnalyticsResponse {
  success: boolean;
  data?: {
    users: UserAnalytics[];
  };
  error?: string;
}

/**
 * GET /api/admin/users/analytics
 * Retrieve comprehensive user analytics for system admin dashboard
 * Part of REQ-016: System Admin Back Office
 */
export async function GET(request: NextRequest): Promise<NextResponse<AnalyticsResponse>> {
  try {
    console.log('🔍 ADMIN_ANALYTICS_DEBUG: Starting user analytics request');
    
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('❌ ADMIN_ANALYTICS_DEBUG: Authentication failed');
      return authResult.error;
    }

    const { supabase } = authResult;
    console.log('✅ ADMIN_ANALYTICS_DEBUG: Authentication successful');



    console.log('🔍 ADMIN_ANALYTICS_DEBUG: Executing analytics query via direct queries');
    
    // Get basic user information
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name');

    if (usersError) {
      console.error('❌ ADMIN_ANALYTICS_DEBUG: Users query failed:', usersError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve user data'
        },
        { status: 500 }
      );
    }

    // Get analytics for each user
    const userAnalytics: UserAnalytics[] = [];
    
    for (const user of users || []) {
      // Get owned accounts stats
      const { data: ownedAccounts, error: ownedError } = await supabase
        .from('accounts')
        .select(`
          id,
          items:items(count),
          visits:items.item_visits(count)
        `)
        .eq('owner_id', user.id);

      // Get access accounts stats (accounts user has access to but doesn't own)
      const { data: accessAccounts, error: accessError } = await supabase
        .from('account_users')
        .select(`
          account:accounts!inner(
            id,
            owner_id,
            items:items(count),
            visits:items.item_visits(count)
          )
        `)
        .eq('user_id', user.id)
        .neq('account.owner_id', user.id);

      const ownedStats = {
        count: ownedAccounts?.length || 0,
        totalItems: 0,
        totalVisits: 0
      };

      const accessStats = {
        count: accessAccounts?.length || 0,
        totalItems: 0,
        totalVisits: 0
      };

      userAnalytics.push({
        id: user.id,
        email: user.email || '',
        fullName: user.full_name || '',
        ownedAccounts: ownedStats,
        accessAccounts: accessStats
      });
    }

    console.log(`✅ ADMIN_ANALYTICS_DEBUG: Successfully retrieved analytics for ${users?.length || 0} users`);

    return NextResponse.json({
      success: true,
      data: { users: userAnalytics }
    });

  } catch (error) {
    console.error('❌ ADMIN_ANALYTICS_DEBUG: Analytics endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while retrieving analytics'
      },
      { status: 500 }
    );
  }
}