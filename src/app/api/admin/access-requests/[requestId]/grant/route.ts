import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { AccessRequestStatus } from '@/types/admin';
import { randomBytes } from 'crypto';

interface RouteParams {
  params: {
    requestId: string;
  };
}

/**
 * Generate a secure access code for account access
 */
function generateAccessCode(): string {
  return randomBytes(16).toString('hex').substring(0, 12).toUpperCase();
}

/**
 * Generate email template for access grant notification
 */
function generateAccessGrantEmail(data: {
  requesterName?: string;
  accountName: string;
  accessCode: string;
  accountOwnerName?: string;
}) {
  const { requesterName, accountName, accessCode, accountOwnerName } = data;
  
  return {
    subject: `Access Granted: ${accountName} - Your Access Code`,
    body: `Hello ${requesterName || 'there'},

Great news! Your access request for "${accountName}" has been approved.

Your Access Details:
• Account: ${accountName}
• Access Code: ${accessCode}
• Owner: ${accountOwnerName || 'Account Owner'}

To complete your access setup:
1. Register or log in to your FAQBNB account
2. Enter your access code in the account access section
3. Start exploring the items and resources

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
The FAQBNB Team

---
This is an automated message. Please do not reply to this email.`,
    variables: {
      requesterName: requesterName || '',
      accountName,
      accessCode,
      accountOwnerName: accountOwnerName || ''
    }
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const authResult = await validateAdminAuth(request);

  if (authResult.error) {
    return authResult.error;
  }

  const { supabase, user } = authResult;
  const { requestId } = params;

  console.log('✅ ACCESS_GRANT_DEBUG: Authentication successful for request:', requestId);

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
    const { 
      approval_notes, 
      send_email = true,
      custom_access_code,
      email_template 
    } = body;

    // Get current request with account details
    const { data: accessRequest, error: fetchError } = await supabase
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
      .eq('id', requestId)
      .single();

    if (fetchError || !accessRequest) {
      console.error('❌ ACCESS_GRANT_DEBUG: Request not found:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Access request not found'
        },
        { status: 404 }
      );
    }

    // Validate request can be approved
    if (accessRequest.status !== AccessRequestStatus.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot approve request with status: ${accessRequest.status}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Generate or use provided access code
    const accessCode = custom_access_code || generateAccessCode();

    // Ensure access code is unique
    const { data: existingCode, error: codeCheckError } = await supabase
      .from('access_requests')
      .select('id')
      .eq('access_code', accessCode)
      .neq('id', requestId)
      .single();

    if (codeCheckError && codeCheckError.code !== 'PGRST116') {
      console.error('❌ ACCESS_GRANT_DEBUG: Error checking access code uniqueness:', codeCheckError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to validate access code'
        },
        { status: 500 }
      );
    }

    if (existingCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access code already exists, please try again',
          code: 'DUPLICATE_CODE'
        },
        { status: 409 }
      );
    }

    // Update request to approved status
    const updateData = {
      status: AccessRequestStatus.APPROVED,
      approval_date: new Date().toISOString(),
      approved_by: user.id,
      access_code: accessCode,
      approval_notes,
      updated_at: new Date().toISOString()
    };

    // Add email sent timestamp if sending email
    if (send_email) {
      updateData.email_sent_date = new Date().toISOString();
    }

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
      console.error('❌ ACCESS_GRANT_DEBUG: Update failed:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to approve access request'
        },
        { status: 500 }
      );
    }

    // Generate email template if sending email
    let emailData = null;
    if (send_email && accessRequest.account) {
      emailData = email_template || generateAccessGrantEmail({
        requesterName: accessRequest.requester_name,
        accountName: accessRequest.account.name,
        accessCode,
        accountOwnerName: accessRequest.account.owner?.full_name
      });
    }

    // Log approval action
    console.log('✅ ACCESS_GRANT_DEBUG: Request approved successfully', {
      requestId,
      approvedBy: user.email,
      accessCode,
      sendEmail: send_email
    });

    const response = {
      success: true,
      data: {
        request: updatedRequest,
        accessCode,
        emailSent: send_email,
        emailTemplate: emailData
      },
      message: 'Access request approved successfully'
    };

    // Add email instructions if email was not sent
    if (!send_email) {
      response.data.instructions = {
        nextSteps: [
          'Manually send the access code to the requester',
          'Provide them with registration instructions',
          'Monitor for successful registration completion'
        ],
        accessCode,
        registrationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register`
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ ACCESS_GRANT_DEBUG: API error:', error);
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

  const { supabase } = authResult;
  const { requestId } = params;

  console.log('✅ ACCESS_GRANT_RESEND_DEBUG: Authentication successful for request:', requestId);

  try {
    const body = await request.json();
    const { email_template } = body;

    // Get current request
    const { data: accessRequest, error: fetchError } = await supabase
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
      .eq('id', requestId)
      .single();

    if (fetchError || !accessRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access request not found'
        },
        { status: 404 }
      );
    }

    // Validate request is approved
    if (accessRequest.status !== AccessRequestStatus.APPROVED) {
      return NextResponse.json(
        {
          success: false,
          error: 'Can only resend email for approved requests',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    if (!accessRequest.access_code) {
      return NextResponse.json(
        {
          success: false,
          error: 'No access code found for this request'
        },
        { status: 400 }
      );
    }

    // Update email sent timestamp
    const { error: updateError } = await supabase
      .from('access_requests')
      .update({
        email_sent_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('❌ ACCESS_GRANT_RESEND_DEBUG: Update failed:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update email sent timestamp'
        },
        { status: 500 }
      );
    }

    // Generate email template
    const emailData = email_template || generateAccessGrantEmail({
      requesterName: accessRequest.requester_name,
      accountName: accessRequest.account?.name || 'Account',
      accessCode: accessRequest.access_code,
      accountOwnerName: accessRequest.account?.owner?.full_name
    });

    console.log('✅ ACCESS_GRANT_RESEND_DEBUG: Email resent successfully');

    return NextResponse.json({
      success: true,
      data: {
        emailTemplate: emailData,
        emailSent: true
      },
      message: 'Access email resent successfully'
    });

  } catch (error) {
    console.error('❌ ACCESS_GRANT_RESEND_DEBUG: API error:', error);
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