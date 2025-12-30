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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const days = parseInt(searchParams.get('days') || '7');

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

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

    // Get user's properties
    const { data: userProperties } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_id', accountId);

    const propertyIds = userProperties?.map(p => p.id) || [];

    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get recent items created
    const { data: recentItems, error: itemsError } = await supabase
      .from('items')
      .select(`
        id,
        public_id,
        name,
        created_at,
        property_id,
        properties!inner(
          id,
          nickname
        )
      `)
      .in('property_id', propertyIds)
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (itemsError) {
      console.error('Error fetching recent items:', itemsError);
    }

    // Format activity items
    const activity = (recentItems || []).map(item => ({
      id: item.id,
      type: 'item_created',
      title: `Created item: ${item.name}`,
      timestamp: item.created_at,
      publicId: item.public_id,
      propertyId: item.property_id,
      propertyName: (item.properties as any)?.nickname || 'Unknown Property'
    }));

    return NextResponse.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

