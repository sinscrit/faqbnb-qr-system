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
      case 401:
        // REQ-020 Task 4.3: OAuth session authentication errors
        code = ErrorCode.OAUTH_SESSION_EXPIRED;
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

  // REQ-020 Task 4.3: OAuth-specific error patterns
  if (error.toLowerCase().includes('oauth') && (error.toLowerCase().includes('session') || error.toLowerCase().includes('expired'))) {
    return {
      code: ErrorCode.OAUTH_SESSION_EXPIRED,
      message: "OAuth session expired - please sign in with Google again",
      actionable: true,
      nextSteps: "Click 'Continue with Google' to restart the authentication process"
    };
  }

  if (error.toLowerCase().includes('oauth') && error.toLowerCase().includes('registration')) {
    return {
      code: ErrorCode.OAUTH_REGISTRATION_CONFLICT,
      message: "OAuth registration conflict - account may already exist",
      actionable: true,
      nextSteps: "Try logging in instead, or contact support if the issue persists"
    };
  }

  if (error.toLowerCase().includes('oauth') && (error.toLowerCase().includes('auth') || error.toLowerCase().includes('invalid'))) {
    return {
      code: ErrorCode.OAUTH_AUTHENTICATION_FAILED,
      message: "OAuth authentication failed - please try again",
      actionable: true,
      nextSteps: "Click 'Continue with Google' to restart the OAuth process"
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
  
  // REQ-020 Task 4.3: OAuth-specific error classification
  if (errorStr.includes('oauth')) {
    if (errorStr.includes('session') || errorStr.includes('expired')) {
      return { type: 'business', severity: 'medium' };
    }
    if (errorStr.includes('conflict')) {
      return { type: 'business', severity: 'low' };
    }
    return { type: 'business', severity: 'medium' };
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
    // REQ-020 Task 4.3: OAuth-specific error durations
    case ErrorCode.OAUTH_SESSION_EXPIRED:
    case ErrorCode.OAUTH_AUTHENTICATION_FAILED:
      return 0; // Keep showing until user takes action (needs to re-authenticate)
    case ErrorCode.OAUTH_REGISTRATION_CONFLICT:
      return 12000; // 12 seconds (longer for user to read and understand)
    default:
      return 6000; // 6 seconds
  }
}