import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🔥[DENY_DEBUG] POST request received:', {
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
    const { requestId, reason = 'Access denied by administrator' } = body;

    if (!requestId) {
      return NextResponse.json({
        success: false,
        error: 'Request ID is required'
      }, { status: 400 });
    }

    console.log('🔥[DENY_DEBUG] Processing request:', {
      requestId,
      reason,
      adminUserId: user.id
    });

    // Update the access request status to denied
    const now = new Date().toISOString();
    const { data: updatedRequest, error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: 'denied',
        denial_date: now,
        denial_reason: reason,
        processed_by: user.id,
        processed_at: now,
        updated_at: now
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('🔥[DENY_DEBUG] Database update failed:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to deny access request',
        details: updateError.message
      }, { status: 500 });
    }

    console.log('🔥[DENY_DEBUG] Request denied successfully:', {
      requestId,
      requesterEmail: updatedRequest.requester_email,
      denialDate: updatedRequest.denial_date
    });

    return NextResponse.json({
      success: true,
      message: 'Access request denied successfully',
      data: {
        requestId: updatedRequest.id,
        requesterEmail: updatedRequest.requester_email,
        status: updatedRequest.status,
        denialDate: updatedRequest.denial_date,
        denialReason: updatedRequest.denial_reason
      }
    });

  } catch (error) {
    console.error('🔥[DENY_DEBUG] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error while denying access request',
      details: String(error)
    }, { status: 500 });
  }
}