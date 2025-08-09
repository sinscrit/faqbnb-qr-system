'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  RegistrationRequest, 
  AccessCodeValidation, 
  RegistrationResult,
  UserFriendlyError,
  OAuthRegistrationRequest,
  OAuthRegistrationResult
} from '@/types';
import { translateErrorMessage, classifyError, getErrorDisplayDuration } from '@/lib/error-utils';

/**
 * Custom hook for registration business logic and API communication
 * Handles access code validation and user registration flow
 */

interface UseRegistrationState {
  isLoading: boolean;
  error: UserFriendlyError | null;
  isValidating: boolean;
  validationResult: AccessCodeValidationResult | null;
  errorHistory: UserFriendlyError[];
  lastErrorTimestamp: number | null;
}

// Types are now imported from @/types
type AccessCodeValidationResult = AccessCodeValidation;
type RegistrationData = RegistrationRequest;

export function useRegistration() {
  const [state, setState] = useState<UseRegistrationState>({
    isLoading: false,
    error: null,
    isValidating: false,
    validationResult: null,
    errorHistory: [],
    lastErrorTimestamp: null,
  });

  // Debug logging for registration hook
  const DEBUG_PREFIX = "🔒 REGISTRATION_HOOK_DEBUG:";

  /**
   * Add error to state with deduplication and history tracking
   */
  const addError = useCallback((rawError: string, statusCode?: number) => {
    const friendlyError = translateErrorMessage(rawError, statusCode);
    const timestamp = Date.now();
    
    setState(prev => {
      // Check for duplicate errors (same code within 5 seconds)
      const isDuplicate = prev.error && 
        prev.error.code === friendlyError.code && 
        prev.lastErrorTimestamp &&
        (timestamp - prev.lastErrorTimestamp) < 5000;
      
      if (isDuplicate) {
        console.log(`${DEBUG_PREFIX} DUPLICATE_ERROR_IGNORED`, {
          timestamp: new Date().toISOString(),
          errorCode: friendlyError.code
        });
        return prev; // Don't add duplicate error
      }

      // Keep last 3 errors in history
      const newHistory = [friendlyError, ...prev.errorHistory.slice(0, 2)];
      
      console.log(`${DEBUG_PREFIX} ERROR_ADDED`, {
        timestamp: new Date().toISOString(),
        errorCode: friendlyError.code,
        message: friendlyError.message,
        isActionable: friendlyError.actionable
      });

      return {
        ...prev,
        error: friendlyError,
        errorHistory: newHistory,
        lastErrorTimestamp: timestamp
      };
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    console.log(`${DEBUG_PREFIX} CLEAR_ALL_ERRORS`, {
      timestamp: new Date().toISOString()
    });
    
    setState(prev => ({ 
      ...prev, 
      error: null,
      lastErrorTimestamp: null
    }));
  }, []);

  /**
   * Validate access code asynchronously
   * Calls the validation API endpoint and returns validation status
   */
  const validateAccessCodeAsync = useCallback(async (
    code: string, 
    email: string
  ): Promise<AccessCodeValidationResult> => {
    console.log(`${DEBUG_PREFIX} VALIDATE_ACCESS_CODE_START`, {
      timestamp: new Date().toISOString(),
      code: code ? `${code.substring(0, 4)}...` : null,
      email: email
    });

    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      // Call the validation API endpoint
      const response = await fetch(`/api/auth/validate-code?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = `Validation failed: ${response.status} ${response.statusText}`;
        addError(errorMessage, response.status);
        
        setState(prev => ({ 
          ...prev, 
          isValidating: false, 
          validationResult: { isValid: false, error: errorMessage }
        }));

        return { isValid: false, error: errorMessage };
      }

      const result: AccessCodeValidationResult = await response.json();

      console.log(`${DEBUG_PREFIX} VALIDATE_ACCESS_CODE_SUCCESS`, {
        timestamp: new Date().toISOString(),
        isValid: result.isValid,
        hasRequest: !!result.request,
        hasAccount: !!result.account
      });

      setState(prev => ({ 
        ...prev, 
        isValidating: false, 
        validationResult: result 
      }));

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Access code validation failed';
      
      console.error(`${DEBUG_PREFIX} VALIDATE_ACCESS_CODE_ERROR:`, error);
      
      addError(errorMessage);
      
      setState(prev => ({ 
        ...prev, 
        isValidating: false, 
        validationResult: { isValid: false, error: errorMessage }
      }));

      return { isValid: false, error: errorMessage };
    }
  }, [addError]);

  /**
   * Submit registration data
   * Handles the complete registration process including account creation
   */
  const submitRegistration = useCallback(async (
    formData: RegistrationData
  ): Promise<RegistrationResult> => {
    console.log(`${DEBUG_PREFIX} SUBMIT_REGISTRATION_START`, {
      timestamp: new Date().toISOString(),
      email: formData.email,
      fullName: formData.fullName,
      accessCode: formData.accessCode ? `${formData.accessCode.substring(0, 4)}...` : null
    });

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call the registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          accessCode: formData.accessCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `Registration failed: ${response.status} ${response.statusText}`;
        addError(errorMessage, response.status);
        
        setState(prev => ({ ...prev, isLoading: false }));
        
        return { success: false, error: errorMessage };
      }

      const result: RegistrationResult = await response.json();

      console.log(`${DEBUG_PREFIX} SUBMIT_REGISTRATION_SUCCESS`, {
        timestamp: new Date().toISOString(),
        userId: result.user?.id,
        accountId: result.account?.id,
        hasSession: !!result.session
      });

      setState(prev => ({ ...prev, isLoading: false }));

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      console.error(`${DEBUG_PREFIX} SUBMIT_REGISTRATION_ERROR:`, error);
      
      addError(errorMessage);
      
      setState(prev => ({ ...prev, isLoading: false }));

      return { success: false, error: errorMessage };
    }
  }, [addError]);

  /**
   * Submit OAuth registration data
   * Handles OAuth registration completion using existing session
   * REQ-020 Task 4.2: OAuth Registration Function
   */
  const submitOAuthRegistration = useCallback(async (
    request: OAuthRegistrationRequest,
    sessionToken: string
  ): Promise<OAuthRegistrationResult> => {
    console.log(`${DEBUG_PREFIX} SUBMIT_OAUTH_REGISTRATION_START`, {
      timestamp: new Date().toISOString(),
      email: request.email,
      accessCode: request.accessCode ? `${request.accessCode.substring(0, 4)}...` : null,
      hasSessionToken: !!sessionToken
    });

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call the OAuth registration completion API endpoint
      const response = await fetch('/api/auth/complete-oauth-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `OAuth registration failed: ${response.status} ${response.statusText}`;
        addError(errorMessage, response.status);
        
        setState(prev => ({ ...prev, isLoading: false }));
        
        return { success: false, error: errorMessage };
      }

      const result: OAuthRegistrationResult = await response.json();

      console.log(`${DEBUG_PREFIX} SUBMIT_OAUTH_REGISTRATION_SUCCESS`, {
        timestamp: new Date().toISOString(),
        userId: result.user?.id,
        accountId: result.account?.id,
        registrationMethod: result.registrationMethod || 'oauth'
      });

      setState(prev => ({ ...prev, isLoading: false }));

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth registration failed';
      
      console.error(`${DEBUG_PREFIX} SUBMIT_OAUTH_REGISTRATION_ERROR:`, error);
      
      addError(errorMessage);
      
      setState(prev => ({ ...prev, isLoading: false }));

      return { success: false, error: errorMessage };
    }
  }, [addError]);

  /**
   * Retry mechanism for network failures
   * Retries the last operation with exponential backoff
   */
  const retryLastOperation = useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<any> => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${DEBUG_PREFIX} RETRY_ATTEMPT`, {
          timestamp: new Date().toISOString(),
          attempt,
          maxRetries
        });

        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt - 1);
          console.log(`${DEBUG_PREFIX} RETRY_WAITING`, {
            timestamp: new Date().toISOString(),
            attempt,
            delay,
            error: lastError.message
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`${DEBUG_PREFIX} RETRY_EXHAUSTED`, {
      timestamp: new Date().toISOString(),
      maxRetries,
      finalError: lastError?.message
    });

    throw lastError;
  }, []);

  /**
   * Clear any errors and reset state
   */
  const clearError = useCallback(() => {
    console.log(`${DEBUG_PREFIX} CLEAR_ERROR`, {
      timestamp: new Date().toISOString()
    });
    
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset all state to initial values
   */
  const resetState = useCallback(() => {
    console.log(`${DEBUG_PREFIX} RESET_STATE`, {
      timestamp: new Date().toISOString()
    });
    
    setState({
      isLoading: false,
      error: null,
      isValidating: false,
      validationResult: null,
    });
  }, []);

  /**
   * Automatic error clearing based on error type and duration
   * REQ-019 Task 8.2: Enhanced Error State Management
   */
  useEffect(() => {
    if (!state.error || !state.lastErrorTimestamp) {
      return;
    }

    const displayDuration = getErrorDisplayDuration(state.error);
    
    // Don't auto-clear actionable errors that need user action
    if (state.error.actionable && displayDuration === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log(`${DEBUG_PREFIX} AUTO_CLEAR_ERROR`, {
        timestamp: new Date().toISOString(),
        errorCode: state.error?.code,
        duration: displayDuration
      });
      clearError();
    }, displayDuration);

    return () => clearTimeout(timeoutId);
  }, [state.error, state.lastErrorTimestamp, clearError]);

  /**
   * Cleanup function for component unmount
   */
  useEffect(() => {
    return () => {
      console.log(`${DEBUG_PREFIX} CLEANUP`, {
        timestamp: new Date().toISOString()
      });
      // Cancel any pending operations here if needed
    };
  }, []);

  // Computed properties for enhanced error handling
  const hasActionableError = state.error?.actionable || false;
  const errorHistory = state.errorHistory;

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    isValidating: state.isValidating,
    validationResult: state.validationResult,
    
    // Enhanced error state
    hasActionableError,
    errorHistory,
    
    // Actions
    validateAccessCodeAsync,
    submitRegistration,
    submitOAuthRegistration,
    retryLastOperation,
    clearError,
    clearAllErrors,
    resetState,
  };
}