// src/app/api/user/dashboard/stats/route.ts
// REQ-122: Dashboard Statistics API
// Created: 2026-01-06

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    // Task 2.1.2: Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Task 2.1.3: Get user's account context
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

    // Task 2.1.4: Get user's property IDs
    const { data: userProperties } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_id', accountId);

    const propertyIds = userProperties?.map(p => p.id) || [];

    // Initialize counts
    let itemCount = 0;
    let roomCount = 0;
    let tagCount = 0;

    if (propertyIds.length > 0) {
      // Task 2.1.5: Count total items
      const { count, error: itemsError } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .in('property_id', propertyIds);

      if (!itemsError) {
        itemCount = count || 0;
      }

      // Task 2.1.6: Count distinct locations
      const { data: locations, error: locationsError } = await supabase
        .from('items')
        .select('location')
        .in('property_id', propertyIds)
        .not('location', 'is', null);

      if (!locationsError && locations) {
        const uniqueLocations = new Set(
          locations
            .map(item => item.location)
            .filter(loc => loc && loc.trim() !== '')
        );
        roomCount = uniqueLocations.size;
      }

      // Task 2.1.7: Count distinct tags
      const { data: itemsWithTags, error: tagsError } = await supabase
        .from('items')
        .select('tags')
        .in('property_id', propertyIds)
        .not('tags', 'is', null);

      if (!tagsError && itemsWithTags) {
        const allTags = new Set<string>();
        itemsWithTags.forEach(item => {
          if (Array.isArray(item.tags)) {
            item.tags.forEach(tag => {
              if (tag && tag.trim() !== '') {
                allTags.add(tag);
              }
            });
          }
        });
        tagCount = allTags.size;
      }
    }

    // Task 2.1.8: Return response
    return NextResponse.json({
      success: true,
      data: {
        itemCount,
        roomCount,
        tagCount
      }
    });

  } catch (error) {
    // Task 2.1.9: Error handling
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
