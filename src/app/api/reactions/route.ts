import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ReactionType, ReactionSubmissionRequest, ReactionCounts } from '@/types/reactions';

const VALID_REACTIONS: ReactionType[] = ['like', 'dislike', 'love', 'confused'];

// Helper function to get reaction counts for an item
async function getReactionCounts(itemId: string): Promise<ReactionCounts> {
  const { data, error } = await supabase
    .from('item_reactions')
    .select('reaction_type')
    .eq('item_id', itemId);

  if (error) {
    console.error('Error fetching reaction counts:', error);
    throw error;
  }

  const counts: ReactionCounts = {
    like: 0,
    dislike: 0,
    love: 0,
    confused: 0,
    total: 0
  };

  if (data) {
    data.forEach(reaction => {
      const type = reaction.reaction_type as ReactionType;
      if (VALID_REACTIONS.includes(type)) {
        counts[type]++;
        counts.total++;
      }
    });
  }

  return counts;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Reaction submission API called');

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Parse request body
    const body: ReactionSubmissionRequest = await request.json();
    console.log('Reaction request body:', body);

    // Validate required fields
    if (!body.itemId || !body.reactionType || !body.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'itemId, reactionType, and sessionId are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate itemId is UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(body.itemId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid itemId format',
          code: 'INVALID_ITEM_ID'
        },
        { status: 400 }
      );
    }

    // Validate reaction type
    if (!VALID_REACTIONS.includes(body.reactionType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid reaction type. Must be one of: ${VALID_REACTIONS.join(', ')}`,
          code: 'INVALID_REACTION_TYPE'
        },
        { status: 400 }
      );
    }

    // Check if item exists
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id')
      .eq('id', body.itemId)
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

    // Check if user already has ANY reaction for this item
    const { data: existingReactions, error: checkError } = await supabase
      .from('item_reactions')
      .select('id, reaction_type')
      .eq('item_id', body.itemId)
      .eq('ip_address', clientIP !== 'unknown' ? clientIP : null);

    if (checkError) {
      console.error('Error checking existing reactions:', checkError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check existing reactions',
          code: 'CHECK_FAILED'
        },
        { status: 500 }
      );
    }

    // Check if user already has the same reaction type
    const sameReactionExists = existingReactions?.some(r => r.reaction_type === body.reactionType);
    
    if (sameReactionExists) {
      console.log('Same reaction already exists, returning current counts');
      const reactionCounts = await getReactionCounts(body.itemId);
      
      return NextResponse.json({
        success: true,
        message: 'Reaction already exists',
        data: reactionCounts
      });
    }

    // Remove any existing different reaction types from same user for this item
    if (existingReactions && existingReactions.length > 0) {
      console.log('Removing previous reactions before adding new one');
      const { error: deleteError } = await supabase
        .from('item_reactions')
        .delete()
        .eq('item_id', body.itemId)
        .eq('ip_address', clientIP !== 'unknown' ? clientIP : null);

      if (deleteError) {
        console.error('Error removing previous reactions:', deleteError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update reaction',
            code: 'UPDATE_FAILED'
          },
          { status: 500 }
        );
      }
    }

    // Insert new reaction
    const { error: insertError } = await supabase
      .from('item_reactions')
      .insert({
        item_id: body.itemId,
        reaction_type: body.reactionType,
        ip_address: clientIP !== 'unknown' ? clientIP : null,
        session_id: body.sessionId,
      });

    if (insertError) {
      console.error('Reaction insertion error:', insertError);
      
      // Handle UNIQUE constraint violation
      if (insertError.code === '23505') {
        console.log('Duplicate reaction detected, getting current counts');
        const reactionCounts = await getReactionCounts(body.itemId);
        
        return NextResponse.json({
          success: true,
          message: 'Reaction already exists',
          data: reactionCounts
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to record reaction',
          code: 'INSERT_FAILED'
        },
        { status: 500 }
      );
    }

    // Get updated reaction counts
    const reactionCounts = await getReactionCounts(body.itemId);

    console.log(`Reaction recorded successfully: ${body.sessionId} -> ${body.itemId} (${body.reactionType})`);

    return NextResponse.json({
      success: true,
      message: 'Reaction recorded successfully',
      data: reactionCounts
    });

  } catch (error) {
    console.error('Reaction submission API error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

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

export async function DELETE(request: NextRequest) {
  try {
    console.log('Reaction removal API called');

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Parse request body
    const body: { itemId: string; reactionType: ReactionType; sessionId: string } = await request.json();
    console.log('Reaction removal request body:', body);

    // Validate required fields
    if (!body.itemId || !body.reactionType || !body.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'itemId, reactionType, and sessionId are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate itemId is UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(body.itemId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid itemId format',
          code: 'INVALID_ITEM_ID'
        },
        { status: 400 }
      );
    }

    // Validate reaction type
    if (!VALID_REACTIONS.includes(body.reactionType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid reaction type. Must be one of: ${VALID_REACTIONS.join(', ')}`,
          code: 'INVALID_REACTION_TYPE'
        },
        { status: 400 }
      );
    }

    // Delete the reaction
    const { data, error: deleteError } = await supabase
      .from('item_reactions')
      .delete()
      .eq('item_id', body.itemId)
      .eq('reaction_type', body.reactionType)
      .eq('ip_address', clientIP !== 'unknown' ? clientIP : null)
      .select('id');

    if (deleteError) {
      console.error('Reaction deletion error:', deleteError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to remove reaction',
          code: 'DELETE_FAILED'
        },
        { status: 500 }
      );
    }

    // Check if anything was actually deleted
    if (!data || data.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reaction not found',
          code: 'REACTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Get updated reaction counts
    const reactionCounts = await getReactionCounts(body.itemId);

    console.log(`Reaction removed successfully: ${body.sessionId} -> ${body.itemId} (${body.reactionType})`);

    return NextResponse.json({
      success: true,
      message: 'Reaction removed successfully',
      data: reactionCounts
    });

  } catch (error) {
    console.error('Reaction removal API error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

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