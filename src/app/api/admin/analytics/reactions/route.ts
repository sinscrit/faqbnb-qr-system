import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const propertyId = searchParams.get('propertyId') || '';

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

    // Get reaction data for the specified time range (with property filtering if specified)
    let reactions = null;
    let reactionsError = null;
    
    if (propertyId) {
      // For property filtering, we need to join with items table
      const { data, error } = await supabase
        .from('item_reactions')
        .select('reaction_type, created_at, items!inner(property_id)')
        .eq('items.property_id', propertyId)
        .gte('created_at', startDate.toISOString());
      reactions = data;
      reactionsError = error;
    } else {
      // Simple query without property filtering
      const { data, error } = await supabase
        .from('item_reactions')
        .select('reaction_type, created_at')
        .gte('created_at', startDate.toISOString());
      reactions = data;
      reactionsError = error;
    }

    if (reactionsError) {
      console.error('Error fetching reactions:', reactionsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch reaction data'
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
      }
    });

  } catch (error) {
    console.error('Error in reactions analytics API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 