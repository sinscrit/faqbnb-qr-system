import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { AccessRequestStatus, AccessRequestSource } from '@/types/admin';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminAuth(request);

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;
  console.log('✅ ACCESS_REQUESTS_API_DEBUG: Authentication successful');

  // Parse query parameters
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const source = url.searchParams.get('source');
  const accountId = url.searchParams.get('account_id');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');

  console.log('🔍 ACCESS_REQUESTS_API_DEBUG: Query parameters:', {
    status, source, accountId, limit, offset, startDate, endDate
  });

  try {
    // Build query with joins
    let query = supabase
      .from('access_requests')
      .select(`
        *,
        account:accounts(
          id,
          name,
          owner:users!accounts_owner_id_fkey(
            id,
            email,
            full_name
          )
        ),
        approved_by_user:users!access_requests_approved_by_fkey(
          id,
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && Object.values(AccessRequestStatus).includes(status as AccessRequestStatus)) {
      query = query.eq('status', status);
    }

    if (source && Object.values(AccessRequestSource).includes(source as AccessRequestSource)) {
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

    const { data: accessRequests, error, count } = await query;

    if (error) {
      console.error('❌ ACCESS_REQUESTS_API_DEBUG: Query failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve access requests'
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('access_requests')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('⚠️ ACCESS_REQUESTS_API_DEBUG: Failed to get count:', countError);
    }

    // Transform and enrich data
    const enrichedRequests = accessRequests?.map(request => {
      const requestDate = new Date(request.request_date);
      const approvalDate = request.approval_date ? new Date(request.approval_date) : null;
      const registrationDate = request.registration_completed_date ? new Date(request.registration_completed_date) : null;
      const now = new Date();

      // Calculate timeline metrics
      const daysSinceRequest = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysToApproval = approvalDate ? 
        Math.floor((approvalDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
      const daysToRegistration = registrationDate ?
        Math.floor((registrationDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

      return {
        ...request,
        timeline: {
          daysSinceRequest,
          daysToApproval,
          daysToRegistration,
          isPending: request.status === AccessRequestStatus.PENDING,
          isOverdue: daysSinceRequest > 7 && request.status === AccessRequestStatus.PENDING
        },
        account: request.account || null,
        approvedBy: request.approved_by_user || null
      };
    }) || [];

    console.log(`✅ ACCESS_REQUESTS_API_DEBUG: Successfully retrieved ${enrichedRequests.length} requests`);

    return NextResponse.json({
      success: true,
      data: {
        requests: enrichedRequests,
        pagination: {
          limit,
          offset,
          total: totalCount || 0,
          hasMore: (offset + limit) < (totalCount || 0)
        },
        summary: {
          totalRequests: totalCount || 0,
          pendingRequests: enrichedRequests.filter(r => r.status === AccessRequestStatus.PENDING).length,
          approvedRequests: enrichedRequests.filter(r => r.status === AccessRequestStatus.APPROVED).length,
          registeredUsers: enrichedRequests.filter(r => r.status === AccessRequestStatus.REGISTERED).length,
          overdueRequests: enrichedRequests.filter(r => r.timeline.isOverdue).length
        }
      }
    });

  } catch (error) {
    console.error('❌ ACCESS_REQUESTS_API_DEBUG: API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'API_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminAuth(request);

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;
  console.log('✅ ACCESS_REQUESTS_CREATE_DEBUG: Authentication successful');

  try {
    const body = await request.json();
    const { requester_email, requester_name, account_id, notes, source } = body;

    // Validation
    if (!requester_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: requester_email'
        },
        { status: 400 }
      );
    }

    // Account ID is required unless it's a beta request
    if (!account_id && source !== AccessRequestSource.BETA_WAITLIST) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: account_id (unless creating beta request)'
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requester_email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Check for duplicate requests
    const { data: existingRequest, error: duplicateError } = await supabase
      .from('access_requests')
      .select('id, status')
      .eq('requester_email', requester_email)
      .eq('account_id', account_id)
      .in('status', [AccessRequestStatus.PENDING, AccessRequestStatus.APPROVED])
      .single();

    if (duplicateError && duplicateError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ ACCESS_REQUESTS_CREATE_DEBUG: Duplicate check failed:', duplicateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check for duplicate requests'
        },
        { status: 500 }
      );
    }

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'An access request already exists for this email and account',
          code: 'DUPLICATE_REQUEST',
          existing: existingRequest
        },
        { status: 409 }
      );
    }

    // Verify account exists (skip for beta requests)
    if (account_id) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id, name')
        .eq('id', account_id)
        .single();

      if (accountError || !account) {
        return NextResponse.json(
          {
            success: false,
            error: 'Account not found'
          },
          { status: 404 }
        );
      }
    } else if (source !== AccessRequestSource.BETA_WAITLIST) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account ID required for non-beta requests'
        },
        { status: 400 }
      );
    }

    // Create access request
    const { data: newRequest, error: createError } = await supabase
      .from('access_requests')
      .insert({
        requester_email,
        requester_name,
        account_id,
        request_date: new Date().toISOString(),
        status: AccessRequestStatus.PENDING,
        source: source || AccessRequestSource.ADMIN_CREATED,
        notes
      })
      .select(`
        *,
        account:accounts(
          id,
          name,
          owner:users!accounts_owner_id_fkey(
            id,
            email,
            full_name
          )
        )
      `)
      .single();

    if (createError) {
      console.error('❌ ACCESS_REQUESTS_CREATE_DEBUG: Insert failed:', createError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create access request'
        },
        { status: 500 }
      );
    }

    console.log('✅ ACCESS_REQUESTS_CREATE_DEBUG: Request created successfully:', newRequest?.id);

    return NextResponse.json({
      success: true,
      data: newRequest
    }, { status: 201 });

  } catch (error) {
    console.error('❌ ACCESS_REQUESTS_CREATE_DEBUG: API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'API_ERROR'
      },
      { status: 500 }
    );
  }
}