import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { AccessRequestStatus } from '@/types/admin';

interface RouteParams {
  params: {
    requestId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const authResult = await validateAdminAuth(request);

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;
  const { requestId } = params;

  console.log('✅ ACCESS_REQUEST_DETAIL_DEBUG: Authentication successful for request:', requestId);

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(requestId)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request ID format'
      },
      { status: 400 }
    );
  }

  try {
    // Get detailed request information
    const { data: accessRequest, error } = await supabase
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
          ),
          items_count:items(count),
          recent_visits:item_visits(count)
        ),
        approved_by_user:users!access_requests_approved_by_fkey(
          id,
          email,
          full_name
        )
      `)
      .eq('id', requestId)
      .single();

    if (error || !accessRequest) {
      console.error('❌ ACCESS_REQUEST_DETAIL_DEBUG: Request not found:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Access request not found'
        },
        { status: 404 }
      );
    }

    // Calculate timeline data
    const requestDate = new Date(accessRequest.request_date);
    const approvalDate = accessRequest.approval_date ? new Date(accessRequest.approval_date) : null;
    const registrationDate = accessRequest.registration_completed_date ? 
      new Date(accessRequest.registration_completed_date) : null;
    const emailSentDate = accessRequest.email_sent_date ? new Date(accessRequest.email_sent_date) : null;
    const now = new Date();

    const timeline = {
      daysSinceRequest: Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)),
      daysToApproval: approvalDate ? 
        Math.floor((approvalDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
      daysToRegistration: registrationDate ?
        Math.floor((registrationDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
      daysSinceEmailSent: emailSentDate ?
        Math.floor((now.getTime() - emailSentDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
      isPending: accessRequest.status === AccessRequestStatus.PENDING,
      isOverdue: Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)) > 7 && 
                 accessRequest.status === AccessRequestStatus.PENDING,
      events: [
        {
          type: 'request_created',
          date: accessRequest.request_date,
          description: 'Access request submitted'
        },
        ...(approvalDate ? [{
          type: 'request_approved',
          date: accessRequest.approval_date,
          description: 'Request approved by admin',
          user: accessRequest.approved_by_user
        }] : []),
        ...(emailSentDate ? [{
          type: 'email_sent',
          date: accessRequest.email_sent_date,
          description: 'Access email sent to requester'
        }] : []),
        ...(registrationDate ? [{
          type: 'user_registered',
          date: accessRequest.registration_completed_date,
          description: 'User completed registration'
        }] : [])
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };

    // Check if requester is already a user
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .eq('email', accessRequest.requester_email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.warn('⚠️ ACCESS_REQUEST_DETAIL_DEBUG: Error checking existing user:', userError);
    }

    // Get account statistics
    const accountStats = accessRequest.account ? {
      itemCount: accessRequest.account.items_count?.[0]?.count || 0,
      visitCount: accessRequest.account.recent_visits?.[0]?.count || 0
    } : null;

    const enrichedRequest = {
      ...accessRequest,
      timeline,
      existingUser: existingUser || null,
      accountStats,
      canApprove: accessRequest.status === AccessRequestStatus.PENDING,
      canSendEmail: accessRequest.status === AccessRequestStatus.APPROVED && !emailSentDate,
      canMarkRegistered: accessRequest.status === AccessRequestStatus.APPROVED && !!existingUser && !registrationDate
    };

    console.log('✅ ACCESS_REQUEST_DETAIL_DEBUG: Successfully retrieved request details');

    return NextResponse.json({
      success: true,
      data: enrichedRequest
    });

  } catch (error) {
    console.error('❌ ACCESS_REQUEST_DETAIL_DEBUG: API error:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const authResult = await validateAdminAuth(request);

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase, user } = authResult;
  const { requestId } = params;

  console.log('✅ ACCESS_REQUEST_UPDATE_DEBUG: Authentication successful for request:', requestId);

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(requestId)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request ID format'
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { status, notes, access_code, approval_notes } = body;

    // Validation
    if (status && !Object.values(AccessRequestStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status value'
        },
        { status: 400 }
      );
    }

    // Get current request
    const { data: currentRequest, error: fetchError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !currentRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access request not found'
        },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status !== undefined) {
      updateData.status = status;
      
      // Handle status-specific updates
      if (status === AccessRequestStatus.APPROVED && currentRequest.status === AccessRequestStatus.PENDING) {
        updateData.approval_date = new Date().toISOString();
        updateData.approved_by = user.id;
        if (access_code) {
          updateData.access_code = access_code;
        }
      } else if (status === AccessRequestStatus.REGISTERED && currentRequest.status === AccessRequestStatus.APPROVED) {
        updateData.registration_completed_date = new Date().toISOString();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (approval_notes !== undefined) {
      updateData.approval_notes = approval_notes;
    }

    if (access_code !== undefined && currentRequest.status === AccessRequestStatus.APPROVED) {
      updateData.access_code = access_code;
    }

    // Update request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('access_requests')
      .update(updateData)
      .eq('id', requestId)
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
      .single();

    if (updateError) {
      console.error('❌ ACCESS_REQUEST_UPDATE_DEBUG: Update failed:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update access request'
        },
        { status: 500 }
      );
    }

    console.log('✅ ACCESS_REQUEST_UPDATE_DEBUG: Request updated successfully');

    return NextResponse.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('❌ ACCESS_REQUEST_UPDATE_DEBUG: API error:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const authResult = await validateAdminAuth(request);

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase } = authResult;
  const { requestId } = params;

  console.log('✅ ACCESS_REQUEST_DELETE_DEBUG: Authentication successful for request:', requestId);

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(requestId)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request ID format'
      },
      { status: 400 }
    );
  }

  try {
    // Check if request exists
    const { data: existingRequest, error: fetchError } = await supabase
      .from('access_requests')
      .select('id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access request not found'
        },
        { status: 404 }
      );
    }

    // Delete request
    const { error: deleteError } = await supabase
      .from('access_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      console.error('❌ ACCESS_REQUEST_DELETE_DEBUG: Delete failed:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete access request'
        },
        { status: 500 }
      );
    }

    console.log('✅ ACCESS_REQUEST_DELETE_DEBUG: Request deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Access request deleted successfully'
    });

  } catch (error) {
    console.error('❌ ACCESS_REQUEST_DELETE_DEBUG: API error:', error);
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