'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for registration business logic and API communication
 * Handles access code validation and user registration flow
 */

interface UseRegistrationState {
  isLoading: boolean;
  error: string | null;
  isValidating: boolean;
  validationResult: AccessCodeValidationResult | null;
}

interface AccessCodeValidationResult {
  isValid: boolean;
  request?: any;
  account?: any;
  error?: string;
}

interface RegistrationData {
  email: string;
  password: string;
  fullName?: string;
  accessCode: string;
}

interface RegistrationResult {
  success: boolean;
  user?: any;
  account?: any;
  session?: any;
  error?: string;
}

export function useRegistration() {
  const [state, setState] = useState<UseRegistrationState>({
    isLoading: false,
    error: null,
    isValidating: false,
    validationResult: null,
  });

  // Debug logging for registration hook
  const DEBUG_PREFIX = "🔒 REGISTRATION_HOOK_DEBUG:";

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
      // Call the validation API endpoint (will be implemented in task 2.1)
      const response = await fetch(`/api/auth/validate-code?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status} ${response.statusText}`);
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
      
      setState(prev => ({ 
        ...prev, 
        isValidating: false, 
        error: errorMessage,
        validationResult: { isValid: false, error: errorMessage }
      }));

      return { isValid: false, error: errorMessage };
    }
  }, []);

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
      // Call the registration API endpoint (will be enhanced in task 4.1)
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
        throw new Error(errorData.error || `Registration failed: ${response.status} ${response.statusText}`);
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
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

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

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    isValidating: state.isValidating,
    validationResult: state.validationResult,
    
    // Actions
    validateAccessCodeAsync,
    submitRegistration,
    retryLastOperation,
    clearError,
    resetState,
  };
}