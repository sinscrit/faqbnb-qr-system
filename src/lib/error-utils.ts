/**
 * Error handling utilities for REQ-019
 * Provides user-friendly error message translation and classification
 * Created: August 7, 2025 13:56:39 CEST
 */

import { UserFriendlyError, ErrorCode, HTTP_ERROR_MAPPING } from '@/types';

/**
 * Translates technical error messages to user-friendly format
 * Handles patterns like "Validation failed: 409 Conflict"
 */
export function translateErrorMessage(error: string, statusCode?: number): UserFriendlyError {
  // Extract status code from error message if not provided
  let extractedStatusCode = statusCode;
  
  if (!extractedStatusCode && error) {
    // Extract status code from patterns like "Validation failed: 409 Conflict"
    const statusMatch = error.match(/(\d{3})\s*(?:Conflict|Not Found|Error|Bad Request)/i);
    if (statusMatch) {
      extractedStatusCode = parseInt(statusMatch[1], 10);
    }
  }

  // Map HTTP status codes to user-friendly errors
  if (extractedStatusCode && HTTP_ERROR_MAPPING[extractedStatusCode]) {
    const mapping = HTTP_ERROR_MAPPING[extractedStatusCode];
    let code: ErrorCode;
    
    switch (extractedStatusCode) {
      case 409:
        code = ErrorCode.USER_ALREADY_REGISTERED;
        break;
      case 404:
        code = ErrorCode.INVALID_ACCESS_CODE;
        break;
      case 400:
        code = ErrorCode.VALIDATION_FAILED;
        break;
      case 500:
        code = ErrorCode.NETWORK_ERROR;
        break;
      default:
        code = ErrorCode.VALIDATION_FAILED;
    }

    return {
      code,
      ...mapping
    };
  }

  // Handle specific error patterns
  if (error.toLowerCase().includes('email') && error.toLowerCase().includes('mismatch')) {
    return {
      code: ErrorCode.EMAIL_MISMATCH,
      message: "Email does not match the access request",
      actionable: true,
      nextSteps: "Please check that you're using the correct email address from your invitation"
    };
  }

  if (error.toLowerCase().includes('already registered') || error.toLowerCase().includes('user exists')) {
    return {
      code: ErrorCode.USER_ALREADY_REGISTERED,
      message: "User already registered - please try logging in instead",
      actionable: true,
      nextSteps: "Click 'Go to Login' to access your account"
    };
  }

  if (error.toLowerCase().includes('access code') || error.toLowerCase().includes('invalid code')) {
    return {
      code: ErrorCode.INVALID_ACCESS_CODE,
      message: "Invalid access code - please check your invitation",
      actionable: true,
      nextSteps: "Verify your access code, or request a new invitation"
    };
  }

  if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: "Connection error - please check your internet and try again",
      actionable: true,
      nextSteps: "Check your internet connection and retry"
    };
  }

  // Default fallback for unknown errors
  return {
    code: ErrorCode.VALIDATION_FAILED,
    message: "Something went wrong - please try again",
    actionable: true,
    nextSteps: "If the problem continues, please refresh the page or contact support"
  };
}

/**
 * Classifies errors by type and severity for appropriate handling
 */
export function classifyError(error: any): { 
  type: 'validation' | 'network' | 'business', 
  severity: 'low' | 'medium' | 'high' 
} {
  const errorStr = typeof error === 'string' ? error : error?.message || '';
  
  // Network errors
  if (errorStr.includes('fetch') || errorStr.includes('network') || errorStr.includes('connection')) {
    return { type: 'network', severity: 'medium' };
  }
  
  // Business logic errors (user issues)
  if (errorStr.includes('already registered') || errorStr.includes('access code') || errorStr.includes('email')) {
    return { type: 'business', severity: 'low' };
  }
  
  // Validation errors
  return { type: 'validation', severity: 'low' };
}

/**
 * Determines if error should be shown to user
 */
export function shouldShowError(error: UserFriendlyError): boolean {
  // Always show user-friendly errors
  return true;
}

/**
 * Gets display duration for error messages in milliseconds
 */
export function getErrorDisplayDuration(error: UserFriendlyError): number {
  switch (error.code) {
    case ErrorCode.USER_ALREADY_REGISTERED:
    case ErrorCode.INVALID_ACCESS_CODE:
      return 0; // Keep showing until user takes action
    case ErrorCode.NETWORK_ERROR:
      return 10000; // 10 seconds
    case ErrorCode.VALIDATION_FAILED:
      return 8000; // 8 seconds
    default:
      return 6000; // 6 seconds
  }
}