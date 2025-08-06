import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSupabaseServer } from '@/lib/supabase-server';

// Debug prefix for easy filtering
const DEBUG_PREFIX = '🔍[ACCESS_REQ_DEBUG]';

export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log(`${DEBUG_PREFIX} === API CALL START ===`);
  console.log(`${DEBUG_PREFIX} Request URL:`, request.url);
  
  // Test 1: Environment Variables (with key validation)
  console.log(`${DEBUG_PREFIX} ENV_TEST:`, {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
    anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    nodeEnv: process.env.NODE_ENV
  });

  // Authentication (validate user is admin and use session-based client like other routes)
  console.log(`${DEBUG_PREFIX} AUTH_START: Calling validateAdminAuth...`);
  const authResult = await validateAdminAuth(request);
  console.log(`${DEBUG_PREFIX} AUTH_RESULT:`, { hasError: !!authResult.error, hasSupabase: !!authResult.supabase });

  if (authResult.error) {
    console.log(`${DEBUG_PREFIX} AUTH_FAILED: Returning auth error`);
    return authResult.error;
  }

  // Use session-based client (same pattern as working /api/admin/users/analytics)
  const { supabase } = authResult;
  console.log(`${DEBUG_PREFIX} CLIENT_PATTERN: Using session-based client like other working admin routes`);

  try {

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const accountId = searchParams.get('account_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`${DEBUG_PREFIX} QUERY_PARAMS:`, {
      status, source, accountId, limit, offset, startDate, endDate
    });

    // Build query with session-based client
    console.log(`${DEBUG_PREFIX} DB_QUERY: Building access requests query with session client...`);
    let query = supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    if (startDate) {
      query = query.gte('request_date', startDate);
    }
    if (endDate) {
      query = query.lte('request_date', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: accessRequests, error: queryError } = await query;
    
    console.log(`${DEBUG_PREFIX} DB_QUERY_RESULT:`, { 
      count: accessRequests?.length, 
      error: queryError,
      sampleColumns: accessRequests?.[0] ? Object.keys(accessRequests[0]) : []
    });
    
    if (queryError) {
      console.error(`${DEBUG_PREFIX} DB_QUERY_FAILED:`, queryError);
      return NextResponse.json({ 
        success: false, 
        error: 'Access requests query failed', 
        details: queryError,
        debugCode: 'ACCESS_REQUESTS_QUERY_FAILED'
      }, { status: 500 });
    }

    // Get total count for pagination (using working approach instead of count())
    console.log(`${DEBUG_PREFIX} COUNT_ALTERNATIVE: Using select().length instead of count()...`);
    const { data: allRequests, error: countTotalError } = await supabase
      .from('access_requests')
      .select('id');
    
    const totalCount = allRequests?.length || 0;
    
    if (countTotalError) {
      console.warn(`${DEBUG_PREFIX} COUNT_WARNING:`, countTotalError);
    } else {
      console.log(`${DEBUG_PREFIX} COUNT_SUCCESS: Found ${totalCount} total records`);
    }

    // Build response
    console.log(`${DEBUG_PREFIX} RESPONSE_BUILD: Creating final response...`);
    const response = {
      success: true,
      data: {
        requests: accessRequests || [],
        pagination: { 
          total: totalCount || accessRequests?.length || 0, 
          offset: offset, 
          limit: limit, 
          hasMore: (totalCount || 0) > (offset + limit)
        }
      },
      debug: {
        clientUsed: 'session-based client (same as users route)',
        testsCompleted: ['ENV', 'AUTH', 'ADMIN_DB_CONNECTION', 'ACCESS_REQUESTS_QUERY'],
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`${DEBUG_PREFIX} SUCCESS: Query completed, returning ${accessRequests?.length || 0} records`);
    return NextResponse.json(response);

  } catch (unexpectedError) {
    console.error(`${DEBUG_PREFIX} UNEXPECTED_ERROR:`, unexpectedError);
    console.error(`${DEBUG_PREFIX} ERROR_STACK:`, (unexpectedError as Error).stack);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error', 
      details: String(unexpectedError),
      debugCode: 'UNEXPECTED_ERROR'
    }, { status: 500 });
  }
}

// Simple POST for completeness
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log(`${DEBUG_PREFIX} POST called - not implemented`);
  return NextResponse.json({ 
    success: false, 
    error: 'POST not implemented in debug version',
    debugCode: 'POST_NOT_IMPLEMENTED'
  }, { status: 501 });
}