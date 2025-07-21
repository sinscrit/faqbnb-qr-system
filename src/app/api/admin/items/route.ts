import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemsListResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin items API called');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('Query params:', { search, page, limit });
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query with search filtering
    let query = supabase
      .from('items')
      .select('id, public_id, name, created_at')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,public_id.ilike.%${search}%`);
    }

    console.log('Executing query...');
    const { data: items, error } = await query;

    if (error) {
      console.error('Database error:', error.message, error.details, error.hint);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch items', details: error.message },
        { status: 500 }
      );
    }

    console.log('Query successful, found items:', items?.length || 0);

    // Get link counts for each item
    const itemsWithCounts = await Promise.all(
      (items || []).map(async (item) => {
        const { count: linksCount } = await supabase
          .from('item_links')
          .select('*', { count: 'exact', head: true })
          .eq('item_id', item.id);

        return {
          id: item.id,
          publicId: item.public_id,
          name: item.name,
          linksCount: linksCount || 0,
          createdAt: item.created_at,
        };
      })
    );

    const response: ItemsListResponse = {
      success: true,
      data: itemsWithCounts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 