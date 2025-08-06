import { supabase } from '@/lib/supabase';
import { AccessRequest, AccessRequestStatus } from '@/types/admin';
import { randomBytes } from 'crypto';

/**
 * Access Management Utility Functions
 * Part of REQ-016: System Admin Back Office
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ApprovalResult {
  success: boolean;
  accessCode?: string;
  error?: string;
  requestId: string;
}

export interface RegistrationCompletionResult {
  success: boolean;
  userId?: string;
  registrationDate?: string;
  error?: string;
}

/**
 * Generate a cryptographically secure access code
 */
export async function generateAccessCode(): Promise<string> {
  // Generate a 12-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let accessCode = '';
  
  // Use crypto.randomBytes for cryptographic security
  const bytes = randomBytes(12);
  
  for (let i = 0; i < 12; i++) {
    accessCode += characters[bytes[i] % characters.length];
  }
  
  // Ensure uniqueness by checking database
  const { data: existingCode } = await supabase
    .from('access_requests')
    .select('id')
    .eq('access_code', accessCode)
    .single();
  
  // If code exists, recursively generate a new one
  if (existingCode) {
    return generateAccessCode();
  }
  
  return accessCode;
}

/**
 * Validate access request data and business rules
 */
export async function validateAccessRequest(request: Partial<AccessRequest>): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!request.requester_email) {
    errors.push('Requester email is required');
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.requester_email)) {
      errors.push('Invalid email format');
    }
  }

  if (!request.account_id) {
    errors.push('Account ID is required');
  }

  // Business rule validations
  if (request.requester_email && request.account_id) {
    try {
      // Check for duplicate requests
      const { data: existingRequest, error: duplicateError } = await supabase
        .from('access_requests')
        .select('id, status')
        .eq('requester_email', request.requester_email)
        .eq('account_id', request.account_id)
        .in('status', [AccessRequestStatus.PENDING, AccessRequestStatus.APPROVED])
        .single();

      if (duplicateError && duplicateError.code !== 'PGRST116') {
        errors.push('Unable to check for duplicate requests');
      } else if (existingRequest) {
        errors.push(`A ${existingRequest.status} request already exists for this email and account`);
      }

      // Verify account exists
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id, name, owner_id')
        .eq('id', request.account_id)
        .single();

      if (accountError || !account) {
        errors.push('Account not found or inaccessible');
      } else {
        // Check if requester is already the owner
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', request.requester_email)
          .single();

        if (existingUser && account.owner_id === existingUser.id) {
          warnings.push('Requester is already the account owner');
        }

        // Check if user already has access
        if (existingUser) {
          const { data: existingAccess } = await supabase
            .from('account_users')
            .select('id')
            .eq('user_id', existingUser.id)
            .eq('account_id', request.account_id)
            .single();

          if (existingAccess) {
            warnings.push('User already has access to this account');
          }
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      errors.push('Unable to validate request due to system error');
    }
  }

  // Status validation if provided
  if (request.status && !Object.values(AccessRequestStatus).includes(request.status)) {
    errors.push('Invalid status value');
  }

  // Email length validation
  if (request.requester_email && request.requester_email.length > 255) {
    errors.push('Email address is too long (max 255 characters)');
  }

  // Name length validation
  if (request.requester_name && request.requester_name.length > 255) {
    errors.push('Requester name is too long (max 255 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Process access approval with complete workflow
 */
export async function processAccessApproval(
  requestId: string, 
  adminId: string,
  options?: {
    approvalNotes?: string;
    customAccessCode?: string;
    sendEmail?: boolean;
  }
): Promise<ApprovalResult> {
  try {
    // Validate request exists and is pending
    const { data: request, error: fetchError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return {
        success: false,
        error: 'Access request not found',
        requestId
      };
    }

    if (request.status !== AccessRequestStatus.PENDING) {
      return {
        success: false,
        error: `Cannot approve request with status: ${request.status}`,
        requestId
      };
    }

    // Generate or use provided access code
    const accessCode = options?.customAccessCode || await generateAccessCode();

    // Update request with approval
    const updateData = {
      status: AccessRequestStatus.APPROVED,
      approval_date: new Date().toISOString(),
      approved_by: adminId,
      access_code: accessCode,
      approval_notes: options?.approvalNotes,
      updated_at: new Date().toISOString()
    };

    // Add email sent timestamp if sending email
    if (options?.sendEmail) {
      updateData.email_sent_date = new Date().toISOString();
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('access_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Approval update error:', updateError);
      return {
        success: false,
        error: 'Failed to update request status',
        requestId
      };
    }

    return {
      success: true,
      accessCode,
      requestId
    };

  } catch (error) {
    console.error('Access approval error:', error);
    return {
      success: false,
      error: 'Internal error during approval process',
      requestId
    };
  }
}

/**
 * Track registration completion for access codes
 */
export async function trackRegistrationCompletion(accessCode: string): Promise<RegistrationCompletionResult> {
  try {
    // Find the access request by code
    const { data: request, error: requestError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('access_code', accessCode)
      .single();

    if (requestError || !request) {
      return {
        success: false,
        error: 'Access code not found'
      };
    }

    // Check if user exists with the requester email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', request.requester_email)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: 'User not found for this access code'
      };
    }

    // Check if already marked as registered
    if (request.status === AccessRequestStatus.REGISTERED) {
      return {
        success: true,
        userId: user.id,
        registrationDate: request.registration_completed_date || undefined
      };
    }

    // Update request to mark registration as completed
    const registrationDate = new Date().toISOString();
    const { data: updatedRequest, error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: AccessRequestStatus.REGISTERED,
        registration_completed_date: registrationDate,
        updated_at: registrationDate
      })
      .eq('access_code', accessCode)
      .select()
      .single();

    if (updateError) {
      console.error('Registration tracking error:', updateError);
      return {
        success: false,
        error: 'Failed to update registration status'
      };
    }

    // Add user to account if not already added
    const { data: existingAccess } = await supabase
      .from('account_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_id', request.account_id)
      .single();

    if (!existingAccess) {
      const { error: accessError } = await supabase
        .from('account_users')
        .insert({
          user_id: user.id,
          account_id: request.account_id,
          role: 'member',
          created_at: registrationDate
        });

      if (accessError) {
        console.error('Account access grant error:', accessError);
        // Don't fail the registration tracking, but log the error
      }
    }

    return {
      success: true,
      userId: user.id,
      registrationDate
    };

  } catch (error) {
    console.error('Registration completion tracking error:', error);
    return {
      success: false,
      error: 'Internal error during registration tracking'
    };
  }
}

/**
 * Check access code validity and status
 */
export async function validateAccessCode(accessCode: string): Promise<{
  isValid: boolean;
  request?: AccessRequest;
  error?: string;
}> {
  try {
    const { data: request, error } = await supabase
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
      .eq('access_code', accessCode)
      .single();

    if (error || !request) {
      return {
        isValid: false,
        error: 'Access code not found'
      };
    }

    if (request.status !== AccessRequestStatus.APPROVED && request.status !== AccessRequestStatus.REGISTERED) {
      return {
        isValid: false,
        error: 'Access code is not active'
      };
    }

    return {
      isValid: true,
      request
    };

  } catch (error) {
    console.error('Access code validation error:', error);
    return {
      isValid: false,
      error: 'Internal error during validation'
    };
  }
}

/**
 * Get access request analytics for a specific account
 */
export async function getAccessRequestAnalytics(accountId?: string): Promise<{
  total: number;
  pending: number;
  approved: number;
  registered: number;
  denied: number;
  averageApprovalTime: number;
  recentRequests: AccessRequest[];
}> {
  try {
    let query = supabase.from('access_requests').select('*');
    
    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data: requests, error } = await query;

    if (error) {
      throw error;
    }

    const total = requests?.length || 0;
    const pending = requests?.filter(r => r.status === AccessRequestStatus.PENDING).length || 0;
    const approved = requests?.filter(r => r.status === AccessRequestStatus.APPROVED).length || 0;
    const registered = requests?.filter(r => r.status === AccessRequestStatus.REGISTERED).length || 0;
    const denied = requests?.filter(r => r.status === AccessRequestStatus.DENIED).length || 0;

    // Calculate average approval time
    const approvedRequests = requests?.filter(r => 
      r.status === AccessRequestStatus.APPROVED && r.request_date && r.approval_date
    ) || [];

    let averageApprovalTime = 0;
    if (approvedRequests.length > 0) {
      const totalApprovalTime = approvedRequests.reduce((sum, req) => {
        const requestDate = new Date(req.request_date);
        const approvalDate = new Date(req.approval_date!);
        const diffTime = approvalDate.getTime() - requestDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return sum + diffDays;
      }, 0);
      
      averageApprovalTime = totalApprovalTime / approvedRequests.length;
    }

    // Get recent requests (last 10)
    const recentRequests = requests
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10) || [];

    return {
      total,
      pending,
      approved,
      registered,
      denied,
      averageApprovalTime,
      recentRequests
    };

  } catch (error) {
    console.error('Access request analytics error:', error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      registered: 0,
      denied: 0,
      averageApprovalTime: 0,
      recentRequests: []
    };
  }
}