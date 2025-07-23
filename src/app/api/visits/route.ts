import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface VisitRequest {
  itemId: string;
  sessionId: string;
  referrer?: string;
}

// Rate limiting map to prevent spam
const visitRateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export async function POST(request: NextRequest) {
  try {
    console.log('Visit tracking API called');

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    // Parse request body
    const body: VisitRequest = await request.json();
    console.log('Visit request body:', body);

    // Validate required fields
    if (!body.itemId || !body.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'itemId and sessionId are required',
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

    // Rate limiting: max 1 visit per session per item per minute
    const rateLimitKey = `${body.sessionId}-${body.itemId}`;
    const now = Date.now();
    const lastVisit = visitRateLimit.get(rateLimitKey) || 0;
    
    if (now - lastVisit < RATE_LIMIT_WINDOW) {
      console.log('Visit rate limited for session:', body.sessionId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Max 1 visit per item per minute.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
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

    // Insert visit record
    const { error: insertError } = await supabase
      .from('item_visits')
      .insert({
        item_id: body.itemId,
        ip_address: clientIP !== 'unknown' ? clientIP : null,
        user_agent: userAgent || null,
        session_id: body.sessionId,
        referrer: body.referrer || referrer || null,
      });

    if (insertError) {
      console.error('Visit insertion error:', insertError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to record visit',
          code: 'INSERT_FAILED'
        },
        { status: 500 }
      );
    }

    // Update rate limit
    visitRateLimit.set(rateLimitKey, now);

    // Clean up old rate limit entries periodically
    if (Math.random() < 0.1) { // 10% chance
      for (const [key, timestamp] of visitRateLimit.entries()) {
        if (now - timestamp > RATE_LIMIT_WINDOW * 2) {
          visitRateLimit.delete(key);
        }
      }
    }

    console.log(`Visit recorded successfully: ${body.sessionId} -> ${body.itemId}`);

    return NextResponse.json({
      success: true,
      message: 'Visit recorded successfully',
    });

  } catch (error) {
    console.error('Visit tracking API error:', error);
    
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