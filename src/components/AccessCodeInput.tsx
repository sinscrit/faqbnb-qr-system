/**
 * AccessCodeInput Component for Manual Entry Mode
 * REQ-019 Task 5.1: Manual Entry Form Creation
 * Created: August 7, 2025 14:08:15 CEST
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';

// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

interface AccessCodeInputProps {
  onCodeChange: (code: string, email: string) => void;
  onValidation: (isValid: boolean) => void;
  className?: string;
  disabled?: boolean;
}

interface ValidationState {
  code: {
    isValid: boolean;
    message: string;
    isValidating: boolean;
  };
  email: {
    isValid: boolean;
    message: string;
  };
}

export default function AccessCodeInput({ 
  onCodeChange, 
  onValidation, 
  className = "",
  disabled = false 
}: AccessCodeInputProps) {
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    code: { isValid: false, message: '', isValidating: false },
    email: { isValid: false, message: '' }
  });

  // Debug logging
  const DEBUG_PREFIX = "🔑 ACCESS_CODE_INPUT_DEBUG:";

  /**
   * Client-side validation for access code format
   * REQ-019 Task 5.2: Client-side validation
   */
  const validateAccessCode = useCallback((code: string): { isValid: boolean; message: string } => {
    if (!code) {
      return { isValid: false, message: 'Access code is required' };
    }
    
    if (code.length < 8) {
      return { isValid: false, message: 'Access code should be 8+ characters' };
    }
    
    if (!/^[A-Za-z0-9]{8,}$/.test(code)) {
      return { isValid: false, message: 'Access code should contain only letters and numbers' };
    }
    
    return { isValid: true, message: 'Valid access code format' };
  }, []);

  /**
   * Client-side validation for email format
   * REQ-019 Task 5.2: Client-side validation
   */
  const validateEmail = useCallback((email: string): { isValid: boolean; message: string } => {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true, message: 'Valid email format' };
  }, []);

  /**
   * Debounced validation to avoid excessive processing
   * REQ-019 Task 5.2: Debounce validation
   */
  const debouncedValidation = useCallback(
    debounce((code: string, email: string) => {
      const codeValidation = validateAccessCode(code);
      const emailValidation = validateEmail(email);
      
      setValidation(prev => ({
        code: { 
          ...codeValidation, 
          isValidating: false 
        },
        email: emailValidation
      }));

      const isValid = codeValidation.isValid && emailValidation.isValid;
      onValidation(isValid);
      
      if (isValid) {
        onCodeChange(code, email);
      }

      console.log(`${DEBUG_PREFIX} VALIDATION_COMPLETE`, {
        timestamp: new Date().toISOString(),
        codeValid: codeValidation.isValid,
        emailValid: emailValidation.isValid,
        overallValid: isValid
      });
    }, 500),
    [validateAccessCode, validateEmail, onValidation, onCodeChange]
  );

  // Handle access code changes
  const handleCodeChange = (value: string) => {
    setAccessCode(value);
    setValidation(prev => ({
      ...prev,
      code: { ...prev.code, isValidating: true }
    }));
    debouncedValidation(value, email);
  };

  // Handle email changes
  const handleEmailChange = (value: string) => {
    setEmail(value);
    debouncedValidation(accessCode, value);
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedValidation.cancel();
    };
  }, [debouncedValidation]);

  const ValidationIcon = ({ isValid, isValidating }: { isValid: boolean; isValidating?: boolean }) => {
    if (isValidating) {
      return <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
    }
    return isValid ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Manual Registration Entry</h3>
            <p className="text-sm text-blue-700 mt-1">
              Enter your access code and email address to proceed with registration.
            </p>
          </div>
        </div>
      </div>

      {/* Access Code Input */}
      <div className="space-y-2">
        <label htmlFor="access-code" className="block text-sm font-medium text-gray-700">
          Access Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="access-code"
            type={showCode ? "text" : "password"}
            value={accessCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter your 8+ character access code"
            className={`
              block w-full px-3 py-2 pr-20 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
              ${validation.code.isValid && accessCode ? 'border-green-300' : 
                accessCode && !validation.code.isValid ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            <ValidationIcon 
              isValid={validation.code.isValid && !!accessCode} 
              isValidating={validation.code.isValidating} 
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              disabled={disabled}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              title={showCode ? "Hide access code" : "Show access code"}
            >
              {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {accessCode && validation.code.message && (
          <p className={`text-sm ${validation.code.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.code.message}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Access code should be 8+ characters long and contain only letters and numbers
        </p>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter your email address"
            className={`
              block w-full px-3 py-2 pr-10 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
              ${validation.email.isValid && email ? 'border-green-300' : 
                email && !validation.email.isValid ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {email && (
              <ValidationIcon isValid={validation.email.isValid} />
            )}
          </div>
        </div>
        {email && validation.email.message && (
          <p className={`text-sm ${validation.email.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.email.message}
          </p>
        )}
      </div>

      {/* Beta Access Link - REQ-019 Task 6.2 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need an access code? Request beta access to get started
            </p>
            <a
              href="http://localhost:3000/#beta"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              target="_self"
            >
              <span>Request beta access here</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}