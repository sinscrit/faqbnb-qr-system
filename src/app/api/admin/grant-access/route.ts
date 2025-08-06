import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🔥[GRANT_SIMPLE_DEBUG] POST request received:', {
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString()
  });
  
  try {
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    const { supabase, user } = authResult;
    const body = await request.json();
    const { requestId, send_email = false } = body;

    if (!requestId) {
      return NextResponse.json({
        success: false,
        error: 'Request ID is required'
      }, { status: 400 });
    }

    console.log('🔥[GRANT_SIMPLE_DEBUG] Processing request:', {
      requestId,
      send_email,
      adminUserId: user.id
    });

    // Get the access request
    const { data: accessRequest, error: fetchError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !accessRequest) {
      console.error('🔥[GRANT_SIMPLE_DEBUG] Access request not found:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Access request not found'
      }, { status: 404 });
    }

    // Generate a unique access code
    const accessCode = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);

    // Update the access request
    const { error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: 'approved',
        access_code: accessCode,
        approval_date: new Date().toISOString(),
        approved_by: user.id
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('🔥[GRANT_SIMPLE_DEBUG] Update failed:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update access request'
      }, { status: 500 });
    }

    console.log('🔥[GRANT_SIMPLE_DEBUG] Successfully approved request:', {
      requestId,
      accessCode,
      requesterEmail: accessRequest.requester_email
    });

    return NextResponse.json({
      success: true,
      message: 'Access request approved successfully',
      data: {
        requestId,
        accessCode,
        requesterEmail: accessRequest.requester_email
      }
    });

  } catch (error) {
    console.error('🔥[GRANT_SIMPLE_DEBUG] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}