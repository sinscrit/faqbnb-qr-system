import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's account context
    const { data: accountUser } = await supabase
      .from('account_users')
      .select('account_id')
      .eq('user_id', user.id)
      .single();

    const accountId = accountUser?.account_id;

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'No account found for user' },
        { status: 404 }
      );
    }

    // Count total properties for this user in their account
    const { count: totalProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('account_id', accountId);

    if (propertiesError) {
      console.error('Error counting properties:', propertiesError);
    }

    // Get all user's property IDs for further queries
    const { data: userProperties } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_id', accountId);

    const propertyIds = userProperties?.map(p => p.id) || [];

    let totalItems = 0;
    let recentItems = 0;
    let totalViews = 0;
    let last7DaysViews = 0;

    if (propertyIds.length > 0) {
      // Count total items across user's properties
      const { count: itemsCount, error: itemsError } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .in('property_id', propertyIds);

      if (!itemsError) {
        totalItems = itemsCount || 0;
      }

      // Count recent items (created in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentCount, error: recentError } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .in('property_id', propertyIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!recentError) {
        recentItems = recentCount || 0;
      }

      // Get all item IDs for view counting
      const { data: userItems } = await supabase
        .from('items')
        .select('id')
        .in('property_id', propertyIds);

      const itemIds = userItems?.map(i => i.id) || [];

      if (itemIds.length > 0) {
        // Count total views
        const { count: viewsCount, error: viewsError } = await supabase
          .from('item_visits')
          .select('*', { count: 'exact', head: true })
          .in('item_id', itemIds);

        if (!viewsError) {
          totalViews = viewsCount || 0;
        }

        // Count views in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: recentViewsCount, error: recentViewsError } = await supabase
          .from('item_visits')
          .select('*', { count: 'exact', head: true })
          .in('item_id', itemIds)
          .gte('visited_at', sevenDaysAgo.toISOString());

        if (!recentViewsError) {
          last7DaysViews = recentViewsCount || 0;
        }
      }
    }

    const stats = {
      totalProperties: totalProperties || 0,
      totalItems: totalItems,
      recentItems: recentItems,
      totalViews: totalViews,
      last7DaysViews: last7DaysViews
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

