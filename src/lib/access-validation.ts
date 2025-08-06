/**
 * Enhanced Access Validation Library for Registration
 * Extends existing access-management.ts functions for registration-specific needs
 * Part of REQ-018: Registration Page with Access Code and OAuth
 */

import { validateAccessCode } from '@/lib/access-management';
import { supabaseAdmin } from '@/lib/supabase';
import { AccessRequest, AccessRequestStatus } from '@/types/admin';

// Enhanced validation result for registration purposes
export interface AccessCodeRegistrationValidation {
  isValid: boolean;
  request?: AccessRequest;
  account?: {
    id: string;
    name: string;
    owner?: {
      id: string;
      email: string;
      full_name: string | null;
    };
  };
  metadata?: AccessCodeMetadata;
  error?: string;
  errorCode?: 'NOT_FOUND' | 'EMAIL_MISMATCH' | 'ALREADY_USED' | 'INVALID_STATUS' | 'INTERNAL_ERROR';
}

// Metadata extracted from access request for registration
export interface AccessCodeMetadata {
  requestId: string;
  requestDate: string;
  approvalDate?: string;
  source: string;
  hasAccount: boolean;
  accountId?: string;
  accountName?: string;
  notes?: string;
}

// Result of consuming an access code
export interface ConsumeAccessCodeResult {
  success: boolean;
  requestId?: string;
  registrationDate?: string;
  error?: string;
  errorCode?: 'NOT_FOUND' | 'ALREADY_USED' | 'UPDATE_FAILED' | 'INVALID_STATUS' | 'INTERNAL_ERROR';
}

/**
 * Enhanced validation specifically for registration flow
 * Includes email matching, usage checking, and metadata extraction
 */
export async function validateAccessCodeForRegistration(
  code: string, 
  email: string
): Promise<AccessCodeRegistrationValidation> {
  const DEBUG_PREFIX = "🔒 ACCESS_VALIDATION_REGISTRATION:";
  
  try {
    console.log(`${DEBUG_PREFIX} VALIDATE_START`, {
      timestamp: new Date().toISOString(),
      code: `${code.substring(0, 4)}...`,
      email: email
    });

    // Use existing validation function
    const baseValidation = await validateAccessCode(code);
    
    if (!baseValidation.isValid || !baseValidation.request) {
      console.log(`${DEBUG_PREFIX} BASE_VALIDATION_FAILED`, {
        timestamp: new Date().toISOString(),
        error: baseValidation.error
      });
      
      return {
        isValid: false,
        error: baseValidation.error || 'Access code validation failed',
        errorCode: 'NOT_FOUND'
      };
    }

    const request = baseValidation.request;

    // Verify email matches
    if (request.requester_email !== email) {
      console.log(`${DEBUG_PREFIX} EMAIL_MISMATCH`, {
        timestamp: new Date().toISOString(),
        providedEmail: email,
        requestEmail: `${request.requester_email.substring(0, 3)}...`
      });
      
      return {
        isValid: false,
        error: 'Email does not match the access request',
        errorCode: 'EMAIL_MISMATCH'
      };
    }

    // Check if code has already been used for registration
    if (request.status === AccessRequestStatus.REGISTERED) {
      console.log(`${DEBUG_PREFIX} ALREADY_REGISTERED`, {
        timestamp: new Date().toISOString(),
        registrationDate: request.registration_date
      });
      
      return {
        isValid: false,
        error: 'This access code has already been used for registration',
        errorCode: 'ALREADY_USED'
      };
    }

    // Verify status is approved (ready for registration)
    if (request.status !== AccessRequestStatus.APPROVED) {
      console.log(`${DEBUG_PREFIX} INVALID_STATUS`, {
        timestamp: new Date().toISOString(),
        status: request.status
      });
      
      return {
        isValid: false,
        error: 'Access code is not approved for registration',
        errorCode: 'INVALID_STATUS'
      };
    }

    // Generate metadata
    const metadata = generateAccessCodeMetadata(request);

    // Extract account information if available
    let accountInfo = null;
    if (request.account_id && (request as any).account) {
      accountInfo = (request as any).account;
    }

    console.log(`${DEBUG_PREFIX} VALIDATION_SUCCESS`, {
      timestamp: new Date().toISOString(),
      requestId: request.id,
      hasAccount: !!accountInfo,
      source: request.source
    });

    return {
      isValid: true,
      request: request,
      account: accountInfo,
      metadata: metadata
    };

  } catch (error) {
    console.error(`${DEBUG_PREFIX} INTERNAL_ERROR:`, error);
    return {
      isValid: false,
      error: 'Internal error during validation',
      errorCode: 'INTERNAL_ERROR'
    };
  }
}

/**
 * Mark an access code as consumed after successful registration
 * Updates the access_requests table to prevent reuse
 */
export async function consumeAccessCode(
  code: string, 
  userId?: string
): Promise<ConsumeAccessCodeResult> {
  const DEBUG_PREFIX = "🔒 CONSUME_ACCESS_CODE:";
  
  try {
    console.log(`${DEBUG_PREFIX} CONSUME_START`, {
      timestamp: new Date().toISOString(),
      code: `${code.substring(0, 4)}...`,
      hasUserId: !!userId
    });

    const now = new Date().toISOString();

    // Update the access request to mark as registered
    const { data: updatedRequest, error } = await supabaseAdmin
      .from('access_requests')
      .update({
        status: AccessRequestStatus.REGISTERED,
        registration_date: now,
        updated_at: now,
        // Add user reference if provided (for future user-request linking)
        ...(userId && { processed_by: userId })
      })
      .eq('access_code', code)
      .eq('status', AccessRequestStatus.APPROVED) // Only update if currently approved
      .select('id, registration_date')
      .single();

    if (error) {
      console.error(`${DEBUG_PREFIX} UPDATE_ERROR:`, error);
      
      // Check if it's because the code was already used
      if (error.code === 'PGRST116') { // No rows updated
        return {
          success: false,
          error: 'Access code not found or already used',
          errorCode: 'ALREADY_USED'
        };
      }
      
      return {
        success: false,
        error: 'Failed to mark access code as used',
        errorCode: 'UPDATE_FAILED'
      };
    }

    if (!updatedRequest) {
      console.log(`${DEBUG_PREFIX} NO_UPDATE_PERFORMED`, {
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: 'Access code not found or already used',
        errorCode: 'ALREADY_USED'
      };
    }

    console.log(`${DEBUG_PREFIX} CONSUME_SUCCESS`, {
      timestamp: new Date().toISOString(),
      requestId: updatedRequest.id,
      registrationDate: updatedRequest.registration_date
    });

    return {
      success: true,
      requestId: updatedRequest.id,
      registrationDate: updatedRequest.registration_date
    };

  } catch (error) {
    console.error(`${DEBUG_PREFIX} INTERNAL_ERROR:`, error);
    return {
      success: false,
      error: 'Internal error while consuming access code',
      errorCode: 'INTERNAL_ERROR'
    };
  }
}

/**
 * Generate metadata from an access request for registration purposes
 * Extracts relevant information for the registration process
 */
export function generateAccessCodeMetadata(request: AccessRequest): AccessCodeMetadata {
  return {
    requestId: request.id,
    requestDate: request.request_date,
    approvalDate: request.approval_date || undefined,
    source: request.source || 'unknown',
    hasAccount: !!request.account_id,
    accountId: request.account_id || undefined,
    // Extract account name if available from joined data
    accountName: (request as any).account?.name || undefined,
    notes: request.notes || undefined
  };
}

/**
 * Validate access code format for registration
 * Ensures the code meets the expected format requirements
 */
export function validateAccessCodeFormat(code: string): { isValid: boolean; error?: string } {
  if (!code) {
    return { isValid: false, error: 'Access code is required' };
  }
  
  if (typeof code !== 'string') {
    return { isValid: false, error: 'Access code must be a string' };
  }
  
  if (code.length !== 12) {
    return { isValid: false, error: 'Access code must be 12 characters long' };
  }
  
  if (!/^[A-Z0-9]{12}$/.test(code)) {
    return { isValid: false, error: 'Access code must contain only uppercase letters and numbers' };
  }
  
  return { isValid: true };
}

/**
 * Validate email format for registration
 * Basic email format validation
 */
export function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a string' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Get registration analytics for an access code
 * Provides insights into the usage and status of access codes
 */
export async function getAccessCodeRegistrationAnalytics(
  timeWindow: 'day' | 'week' | 'month' = 'week'
): Promise<{
  totalCodes: number;
  usedCodes: number;
  pendingCodes: number;
  recentRegistrations: number;
  conversionRate: number;
}> {
  const DEBUG_PREFIX = "🔒 ACCESS_CODE_ANALYTICS:";
  
  try {
    const now = new Date();
    const windowStart = new Date();
    
    switch (timeWindow) {
      case 'day':
        windowStart.setDate(now.getDate() - 1);
        break;
      case 'week':
        windowStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        windowStart.setMonth(now.getMonth() - 1);
        break;
    }

    // Get counts for different statuses
    const { data: analytics, error } = await supabaseAdmin
      .from('access_requests')
      .select('status, registration_date, created_at')
      .gte('created_at', windowStart.toISOString());

    if (error) {
      console.error(`${DEBUG_PREFIX} ANALYTICS_ERROR:`, error);
      return {
        totalCodes: 0,
        usedCodes: 0,
        pendingCodes: 0,
        recentRegistrations: 0,
        conversionRate: 0
      };
    }

    const totalCodes = analytics?.length || 0;
    const usedCodes = analytics?.filter(r => r.status === AccessRequestStatus.REGISTERED).length || 0;
    const pendingCodes = analytics?.filter(r => r.status === AccessRequestStatus.APPROVED).length || 0;
    const recentRegistrations = analytics?.filter(r => 
      r.status === AccessRequestStatus.REGISTERED && 
      r.registration_date && 
      new Date(r.registration_date) >= windowStart
    ).length || 0;
    
    const conversionRate = totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0;

    console.log(`${DEBUG_PREFIX} ANALYTICS_SUCCESS`, {
      timestamp: new Date().toISOString(),
      timeWindow,
      totalCodes,
      usedCodes,
      pendingCodes,
      recentRegistrations,
      conversionRate: `${conversionRate.toFixed(1)}%`
    });

    return {
      totalCodes,
      usedCodes,
      pendingCodes,
      recentRegistrations,
      conversionRate
    };

  } catch (error) {
    console.error(`${DEBUG_PREFIX} INTERNAL_ERROR:`, error);
    return {
      totalCodes: 0,
      usedCodes: 0,
      pendingCodes: 0,
      recentRegistrations: 0,
      conversionRate: 0
    };
  }
}