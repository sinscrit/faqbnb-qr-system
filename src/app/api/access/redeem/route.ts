import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AccessRequestStatus } from '@/types/admin';
import { trackRegistrationCompletion } from '@/lib/access-management';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { access_code, user_id } = body;

    console.log('🔑 ACCESS_REDEEM_DEBUG: Processing access code redemption', {
      accessCode: access_code,
      userId: user_id,
      timestamp: new Date().toISOString()
    });

    // Validation
    if (!access_code || !user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access code and user ID are required'
        },
        { status: 400 }
      );
    }

    // Validate access code format
    if (!/^[A-Z0-9]{12}$/.test(access_code)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid access code format'
        },
        { status: 400 }
      );
    }

    // Find the access request
    const { data: accessRequest, error: requestError } = await supabase
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
        )
      `)
      .eq('access_code', access_code)
      .single();

    if (requestError || !accessRequest) {
      console.log('🔑 ACCESS_REDEEM_DEBUG: Access code not found', { accessCode: access_code });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid access code'
        },
        { status: 404 }
      );
    }

    // Verify the request is in approved status
    if (accessRequest.status !== AccessRequestStatus.APPROVED) {
      console.log('🔑 ACCESS_REDEEM_DEBUG: Access code not in approved status', {
        accessCode: access_code,
        status: accessRequest.status
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Access code is not active',
          details: `Current status: ${accessRequest.status}`
        },
        { status: 400 }
      );
    }

    // Verify user exists and email matches
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      console.log('🔑 ACCESS_REDEEM_DEBUG: User not found', { userId: user_id });
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    // Verify email matches the access request
    if (user.email !== accessRequest.requester_email) {
      console.log('🔑 ACCESS_REDEEM_DEBUG: Email mismatch', {
        userEmail: user.email,
        requesterEmail: accessRequest.requester_email
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Access code does not match your account'
        },
        { status: 403 }
      );
    }

    // Check if user already has access to this account
    const { data: existingAccess, error: accessCheckError } = await supabase
      .from('account_users')
      .select('id, role')
      .eq('user_id', user_id)
      .eq('account_id', accessRequest.account_id)
      .single();

    if (accessCheckError && accessCheckError.code !== 'PGRST116') {
      console.error('🔑 ACCESS_REDEEM_DEBUG: Error checking existing access', accessCheckError);
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to verify account access'
        },
        { status: 500 }
      );
    }

    let accountAccessGranted = false;

    // Grant account access if not already granted
    if (!existingAccess) {
      const { error: grantError } = await supabase
        .from('account_users')
        .insert({
          user_id: user_id,
          account_id: accessRequest.account_id,
          role: 'member',
          created_at: new Date().toISOString()
        });

      if (grantError) {
        console.error('🔑 ACCESS_REDEEM_DEBUG: Error granting account access', grantError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to grant account access'
          },
          { status: 500 }
        );
      }

      accountAccessGranted = true;
      console.log('🔑 ACCESS_REDEEM_DEBUG: Account access granted', {
        userId: user_id,
        accountId: accessRequest.account_id
      });
    } else {
      console.log('🔑 ACCESS_REDEEM_DEBUG: User already has access', {
        userId: user_id,
        accountId: accessRequest.account_id,
        role: existingAccess.role
      });
    }

    // Use the access management utility to track completion
    const completionResult = await trackRegistrationCompletion(access_code);

    if (!completionResult.success) {
      console.error('🔑 ACCESS_REDEEM_DEBUG: Failed to track completion', completionResult.error);
      // Don't fail the redemption if tracking fails
    }

    console.log('✅ ACCESS_REDEEM_DEBUG: Access code redeemed successfully', {
      accessCode: access_code,
      userId: user_id,
      accountId: accessRequest.account_id,
      accountAccessGranted,
      registrationTracked: completionResult.success
    });

    return NextResponse.json({
      success: true,
      data: {
        account: accessRequest.account,
        access_granted: accountAccessGranted,
        existing_access: !accountAccessGranted,
        registration_completed: completionResult.success,
        user_role: existingAccess?.role || 'member'
      },
      message: 'Access code redeemed successfully'
    });

  } catch (error) {
    console.error('🔑 ACCESS_REDEEM_DEBUG: API error', error);
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const accessCode = url.searchParams.get('code');

  if (!accessCode) {
    return NextResponse.json(
      {
        success: false,
        error: 'Access code is required'
      },
      { status: 400 }
    );
  }

  try {
    // Validate access code without redeeming it
    const { data: accessRequest, error } = await supabase
      .from('access_requests')
      .select(`
        id,
        status,
        requester_email,
        requester_name,
        account:accounts(
          id,
          name,
          owner:users!accounts_owner_id_fkey(
            full_name
          )
        )
      `)
      .eq('access_code', accessCode)
      .single();

    if (error || !accessRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid access code'
        },
        { status: 404 }
      );
    }

    const isValid = accessRequest.status === AccessRequestStatus.APPROVED || 
                    accessRequest.status === AccessRequestStatus.REGISTERED;

    return NextResponse.json({
      success: true,
      data: {
        valid: isValid,
        status: accessRequest.status,
        account_name: accessRequest.account?.name,
        requester_email: accessRequest.requester_email,
        requester_name: accessRequest.requester_name,
        owner_name: accessRequest.account?.owner?.full_name
      }
    });

  } catch (error) {
    console.error('Access code validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}