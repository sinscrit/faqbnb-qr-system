import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAccessRequest } from '@/lib/access-management';
import { AccessRequestStatus } from '@/types/admin';

/**
 * Public Access Request API
 * Allows users to submit access requests without being logged in
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { 
      requester_email, 
      requester_name, 
      account_identifier, 
      message 
    } = body;

    console.log('📝 PUBLIC_ACCESS_REQUEST: New request received', {
      email: requester_email,
      name: requester_name,
      identifier: account_identifier,
      timestamp: new Date().toISOString()
    });

    // Basic validation
    if (!requester_email || !requester_name || !account_identifier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, name, and account identifier are required'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requester_email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid email address'
        },
        { status: 400 }
      );
    }

    // Try to find matching account(s)
    let matchedAccounts = [];
    
    // Search by exact name match first
    const { data: exactNameMatch } = await supabase
      .from('accounts')
      .select('id, name, description')
      .ilike('name', account_identifier)
      .limit(5);

    if (exactNameMatch && exactNameMatch.length > 0) {
      matchedAccounts = exactNameMatch;
    } else {
      // Search by partial name match
      const { data: partialMatches } = await supabase
        .from('accounts')
        .select('id, name, description')
        .ilike('name', `%${account_identifier}%`)
        .limit(5);

      if (partialMatches && partialMatches.length > 0) {
        matchedAccounts = partialMatches;
      }
    }

    // If no matches found, create a "pending identification" request
    let accountId = null;
    let matchStatus = 'not_found';

    if (matchedAccounts.length === 1) {
      // Single match found
      accountId = matchedAccounts[0].id;
      matchStatus = 'matched';
    } else if (matchedAccounts.length > 1) {
      // Multiple matches - need clarification
      matchStatus = 'multiple_matches';
    }

    // Check for duplicate requests
    const { data: existingRequest } = await supabase
      .from('access_requests')
      .select('id, status, created_at')
      .eq('requester_email', requester_email)
      .eq('account_id', accountId)
      .in('status', [AccessRequestStatus.PENDING, AccessRequestStatus.APPROVED])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: `You already have a ${existingRequest.status} request for this account. Please wait for the admin to process it.`
        },
        { status: 409 }
      );
    }

    // Create the access request
    const requestData = {
      requester_email,
      requester_name,
      account_id: accountId, // null if no match
      account_identifier_provided: account_identifier,
      message: message || null,
      status: AccountRequestStatus.PENDING,
      request_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        match_status: matchStatus,
        matched_accounts: matchedAccounts.map(acc => ({
          id: acc.id,
          name: acc.name
        })),
        source: 'public_form',
        user_agent: request.headers.get('user-agent') || null
      }
    };

    const { data: createdRequest, error: createError } = await supabase
      .from('access_requests')
      .insert(requestData)
      .select()
      .single();

    if (createError) {
      console.error('📝 PUBLIC_ACCESS_REQUEST: Creation failed', createError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to submit access request. Please try again.'
        },
        { status: 500 }
      );
    }

    // Notify administrators (optional - you could send an email here)
    console.log('✅ PUBLIC_ACCESS_REQUEST: Request created successfully', {
      requestId: createdRequest.id,
      email: requester_email,
      matchStatus,
      accountId
    });

    // Prepare response based on match status
    let responseMessage = 'Your access request has been submitted successfully.';
    let additionalInfo = null;

    if (matchStatus === 'matched') {
      responseMessage = `Your access request for "${matchedAccounts[0].name}" has been submitted successfully.`;
    } else if (matchStatus === 'multiple_matches') {
      responseMessage = 'Your access request has been submitted. We found multiple accounts that might match your request.';
      additionalInfo = {
        possibleMatches: matchedAccounts.map(acc => acc.name)
      };
    } else {
      responseMessage = 'Your access request has been submitted. An admin will review the account information you provided.';
    }

    return NextResponse.json({
      success: true,
      data: {
        requestId: createdRequest.id,
        status: createdRequest.status,
        matchStatus,
        accountMatched: matchStatus === 'matched' ? matchedAccounts[0] : null,
        message: responseMessage,
        additionalInfo
      }
    });

  } catch (error) {
    console.error('📝 PUBLIC_ACCESS_REQUEST: API error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check request status (optional)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const requestId = searchParams.get('request_id');

  if (!email && !requestId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Email or request ID is required'
      },
      { status: 400 }
    );
  }

  try {
    let query = supabase
      .from('access_requests')
      .select(`
        id,
        status,
        request_date,
        approval_date,
        account_id,
        account_identifier_provided,
        accounts(name)
      `);

    if (requestId) {
      query = query.eq('id', requestId);
    } else {
      query = query.eq('requester_email', email);
    }

    const { data: requests, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve request status'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requests || []
    });

  } catch (error) {
    console.error('📝 PUBLIC_ACCESS_REQUEST: Status check error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Fix the status enum reference
const AccountRequestStatus = AccessRequestStatus;