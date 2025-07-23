import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ReactionCounts } from '@/types/reactions';

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = await params;
    console.log('Item reactions query API called for publicId:', publicId);

    // Validate publicId is UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(publicId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid publicId format',
          code: 'INVALID_PUBLIC_ID'
        },
        { status: 400 }
      );
    }

    // Check if item exists first
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, name')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      console.error('Item not found:', itemError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Item not found',
          code: 'ITEM_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    console.log(`Found item: ${item.name} (ID: ${item.id})`);

    // Query reaction counts with aggregation
    const { data: reactionData, error: reactionError } = await supabase
      .from('item_reactions')
      .select('reaction_type')
      .eq('item_id', item.id);

    if (reactionError) {
      console.error('Error fetching reaction data:', reactionError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch reaction data',
          code: 'QUERY_FAILED'
        },
        { status: 500 }
      );
    }

    // Initialize reaction counts with zeros
    const reactionCounts: ReactionCounts = {
      like: 0,
      dislike: 0,
      love: 0,
      confused: 0,
      total: 0
    };

    // Count each reaction type
    if (reactionData && reactionData.length > 0) {
      reactionData.forEach(reaction => {
        const type = reaction.reaction_type as keyof Omit<ReactionCounts, 'total'>;
        if (type in reactionCounts) {
          reactionCounts[type]++;
          reactionCounts.total++;
        }
      });
    }

    console.log(`Reaction counts for ${item.name}:`, reactionCounts);

    return NextResponse.json({
      success: true,
      data: reactionCounts,
      meta: {
        publicId: publicId,
        itemName: item.name
      }
    });

  } catch (error) {
    console.error('Item reactions query API error:', error);
    
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