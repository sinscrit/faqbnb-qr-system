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
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get user's properties with item counts
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        nickname,
        created_at
      `)
      .eq('user_id', user.id)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch properties'
      }, { status: 500 });
    }

    // For each property, get item count and last activity
    const propertySummaries = await Promise.all(
      (properties || []).map(async (property) => {
        // Count items for this property
        const { count: itemCount } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('property_id', property.id);

        // Get most recent item creation or update
        const { data: recentItem } = await supabase
          .from('items')
          .select('updated_at, created_at')
          .eq('property_id', property.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        return {
          id: property.id,
          nickname: property.nickname,
          itemCount: itemCount || 0,
          lastActivity: recentItem?.updated_at || recentItem?.created_at || property.created_at
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: propertySummaries
    });

  } catch (error) {
    console.error('Error fetching property summaries:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

