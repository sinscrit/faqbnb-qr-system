'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import RegistrationForm from '@/components/RegistrationForm';
import AccessCodeInput from '@/components/AccessCodeInput';
import { AlertCircle, CheckCircle, Home, Shield, ExternalLink } from 'lucide-react';
import { UserFriendlyError } from '@/types';

interface RegistrationMessage {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  userFriendlyError?: UserFriendlyError;
}

interface URLParams {
  code: string | null;
  email: string | null;
  isValid: boolean;
  errors: string[];
}

interface EntryModeDetection {
  mode: 'url' | 'manual';
  hasValidParams: boolean;
  missingParams: string[];
}

/**
 * Detect how the user is entering registration (URL params vs manual entry)
 * REQ-019 Task 4.1: Entry Mode Detection
 * Updated: Handle OAuth callback with code parameter vs access code registration
 */
function detectEntryMode(searchParams: ReadonlyURLSearchParams): EntryModeDetection {
  const code = searchParams.get('code');
  const accessCode = searchParams.get('accessCode');
  const email = searchParams.get('email');
  const state = searchParams.get('state');
  const missingParams: string[] = [];
  
  // Check if this is an OAuth callback (has code but might not have accessCode/email)
  const isOAuthCallback = !!code && !accessCode;
  
  if (isOAuthCallback) {
    // OAuth flow - check if we have state with access code info
    let hasStateData = false;
    if (state) {
      try {
        const stateData = JSON.parse(state);
        hasStateData = !!(stateData.accessCode && stateData.email);
      } catch (e) {
        // Invalid state, treat as regular OAuth
      }
    }
    
    // OAuth callback detected - treat as URL mode regardless of missing params
    return {
      mode: 'url',
      hasValidParams: true, // OAuth will handle authentication
      missingParams: []
    };
  }
  
  // Regular access code registration flow
  const codeToCheck = accessCode || code;
  if (!codeToCheck) missingParams.push('access code');
  if (!email) missingParams.push('email');
  
  // Validate parameter formats (non-blocking)
  const hasValidCode = codeToCheck && /^[A-Za-z0-9]{8,}$/.test(codeToCheck);
  const hasValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const hasValidParams = hasValidCode && hasValidEmail;
  const mode: 'url' | 'manual' = hasValidParams ? 'url' : 'manual';
  
  console.log('🔍 ENTRY_MODE_DETECTION', {
    timestamp: new Date().toISOString(),
    mode,
    hasValidParams,
    missingParams,
    codePresent: !!code,
    emailPresent: !!email
  });
  
  return { mode, hasValidParams, missingParams };
}

export default function RegistrationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading } = useAuth();
  
  const [message, setMessage] = useState<RegistrationMessage | null>(null);
  const [entryMode, setEntryMode] = useState<'url' | 'manual'>('url');
  const [urlParams, setUrlParams] = useState<URLParams>({
    code: null,
    email: null,
    isValid: false,
    errors: []
  });
  const [isValidatingParams, setIsValidatingParams] = useState(true);

  
  // Manual entry state (REQ-019 Task 5.3)
  const [manualEntry, setManualEntry] = useState({
    code: '',
    email: '',
    isValid: false
  });

  // Debug logging for registration page
  const DEBUG_PREFIX = "🔒 REGISTRATION_PAGE_DEBUG:";
  
  console.log(`${DEBUG_PREFIX} REGISTRATION_PAGE_MOUNTED`, {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server-side',
    authLoading,
    hasUser: !!user,
    userId: user?.id
  });
  
  // Enhanced logging for Gmail OAuth registration (using existing searchParams)
  const paramCode = searchParams.get('code');
  const paramEmail = searchParams.get('email');
  const paramAccessCode = searchParams.get('accessCode');
  
  if (paramEmail && paramEmail.endsWith('@gmail.com')) {
    console.log('🔍 GMAIL_REGISTRATION_DEBUG: Gmail OAuth registration detected', {
      timestamp: new Date().toISOString(),
      gmailEmail: paramEmail,
      hasOAuthCode: !!paramCode,
      oauthCode: paramCode?.substring(0, 10) + '...',
      hasAccessCode: !!paramAccessCode,
      accessCode: paramAccessCode?.substring(0, 10) + '...',
      isOAuthRegistration: !!paramCode && !paramAccessCode,
      isAccessCodeRegistration: !!paramAccessCode,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'server-side'
    });
  }

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      console.log(`${DEBUG_PREFIX} USER_ALREADY_AUTHENTICATED`, {
        timestamp: new Date().toISOString(),
        userId: user.id,
        redirecting: true
      });
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  // Validate URL parameters
  useEffect(() => {
    const validateUrlParams = () => {
      const code = searchParams.get('code');
      const accessCode = searchParams.get('accessCode');
      const email = searchParams.get('email');
      const state = searchParams.get('state');
      const errors: string[] = [];
      
      // Check if this is an OAuth callback
      const isOAuthCallback = !!code && !accessCode;
      
      console.log(`${DEBUG_PREFIX} VALIDATING_URL_PARAMS`, {
        timestamp: new Date().toISOString(),
        isOAuthCallback,
        code: code ? `${code.substring(0, 4)}...` : null,
        accessCode: accessCode ? `${accessCode.substring(0, 4)}...` : null,
        email: email,
        hasState: !!state
      });

      if (isOAuthCallback) {
        // This is NOT an OAuth callback - it's a registration link with a code parameter
        console.log(`${DEBUG_PREFIX} REGISTRATION_WITH_CODE_PARAM`, {
          timestamp: new Date().toISOString(),
          message: 'Registration page with code parameter - treating as valid registration link',
          code: code?.substring(0, 4) + '...',
          email: email
        });
        
        // Treat this as a valid registration link
        setUrlParams({
          code: code || '',
          email: email || '',
          isValid: true,
          errors: []
        });
        
        setIsValidatingParams(false);
        setEntryMode('url');
        return;
      }

      // Regular access code registration validation
      const codeToValidate = accessCode || code;
      
      if (!codeToValidate) {
        errors.push('Access code parameter is required');
      } else if (!/^[A-Za-z0-9]{8,}$/.test(codeToValidate)) {
        errors.push('Access code must be at least 8 characters long and contain only letters and numbers');
      }

      // Validate email parameter
      if (!email) {
        errors.push('Email parameter is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
      }

      const isValid = errors.length === 0;
      
      setUrlParams({
        code: codeToValidate || '',
        email: email || '',
        isValid,
        errors
      });

      // Set the detected entry mode
      const entryDetection = detectEntryMode(searchParams);
      setEntryMode(entryDetection.mode);
      
      // Update validation logic based on entry mode
      if (entryDetection.mode === 'url' && !isValid) {
        setMessage({
          type: 'error',
          message: `Registration link is invalid: ${errors.join(', ')}`
        });
      } else if (entryDetection.mode === 'manual') {
        // Clear any existing error messages for manual mode - allow graceful fallback
        setMessage(null);
      } else {
        setMessage(null);
      }

      console.log(`${DEBUG_PREFIX} VALIDATION_COMPLETE`, {
        timestamp: new Date().toISOString(),
        settingIsValidatingParams: false,
        entryMode: entryDetection.mode,
        isValid,
        errors: errors.length
      });
      
      setIsValidatingParams(false);
    };

    validateUrlParams();
  }, [searchParams]);

  // Handle URL message parameters
  useEffect(() => {
    const urlMessage = searchParams.get('message');
    const urlType = searchParams.get('type');

    if (urlMessage && !message) {
      setMessage({
        type: (urlType === 'success' || urlType === 'error' || urlType === 'info' || urlType === 'warning') ? urlType : 'info',
        message: decodeURIComponent(urlMessage),
      });
    }
  }, [searchParams, message]);

  // OAuth Success Detection and Registration Trigger (REQ-020 Task 3.1, REQ-021 Task 1.1)
  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const DEBUG_PREFIX_OAUTH = "🔗 OAUTH_SUCCESS_HANDLER:";
      
      // Detect OAuth success parameters
      const oauthSuccess = searchParams.get('oauth_success');
      const accessCode = searchParams.get('accessCode');
      const email = searchParams.get('email');
      
      // REQ-021 Task 1.1: Enhanced debug logging for user/session state tracking
      console.log(`${DEBUG_PREFIX_OAUTH} USEEFFECT_TRIGGERED`, {
        timestamp: new Date().toISOString(),
        oauthSuccess: oauthSuccess,
        hasAccessCode: !!accessCode,
        hasEmail: !!email,
        hasUser: !!user,
        userId: user?.id,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        authLoading: authLoading,
        url: typeof window !== 'undefined' ? window.location.href : 'server-side'
      });
      
      // Check if this is an OAuth success callback
      if (oauthSuccess === 'true' && accessCode && email && user) {
        console.log(`${DEBUG_PREFIX_OAUTH} OAUTH_SUCCESS_DETECTED`, {
          timestamp: new Date().toISOString(),
          email: email,
          accessCode: accessCode.substring(0, 4) + '...',
          userId: user.id,
          provider: 'google' // OAuth success indicates Google OAuth was used
        });
        
        try {
          // Get the current session for API authentication
          if (!session?.access_token) {
            throw new Error('No valid session found');
          }
          
          console.log(`${DEBUG_PREFIX_OAUTH} CALLING_REGISTRATION_API`, {
            timestamp: new Date().toISOString(),
            endpoint: '/api/auth/complete-oauth-registration',
            accessCode: accessCode.substring(0, 4) + '...',
            email: email
          });
          
          // Call the OAuth registration API
          const response = await fetch('/api/auth/complete-oauth-registration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              accessCode: accessCode,
              email: email
            })
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            console.log(`${DEBUG_PREFIX_OAUTH} REGISTRATION_COMPLETED`, {
              timestamp: new Date().toISOString(),
              userId: result.user?.id,
              email: result.user?.email,
              accountId: result.account?.id,
              registrationMethod: result.registrationMethod
            });
            
            // Success - redirect to success page
            router.push('/register/success');
          } else {
            console.error(`${DEBUG_PREFIX_OAUTH} REGISTRATION_FAILED`, {
              timestamp: new Date().toISOString(),
              status: response.status,
              error: result.error,
              errorCode: result.errorCode
            });
            
            // Show error message to user
            setMessage({
              type: 'error',
              message: `Registration failed: ${result.error || 'Unknown error'}`
            });
          }
          
        } catch (error) {
          console.error(`${DEBUG_PREFIX_OAUTH} API_CALL_ERROR:`, error);
          
          setMessage({
            type: 'error',
            message: `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
    };
    
    // Only trigger OAuth handling if we have a user and session (authenticated)
    if (user && session && !authLoading) {
      handleOAuthSuccess();
    }
  }, [searchParams, user, session, authLoading, router]);

  // Show loading indicator while authentication or parameter validation is in progress
  if (authLoading || isValidatingParams) {
    console.log(`${DEBUG_PREFIX} SHOWING_LOADING_STATE`, {
      timestamp: new Date().toISOString(),
      authLoading,
      isValidatingParams,
      hasUser: !!user
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Validating registration link...'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Debug: Check console for REGISTRATION_PAGE_DEBUG logs
          </p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  const MessageAlert = ({ message }: { message: RegistrationMessage }) => {
    const bgColor = {
      error: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200',
      info: 'bg-blue-50 border-blue-200',
      warning: 'bg-yellow-50 border-yellow-200',
    }[message.type];

    const textColor = {
      error: 'text-red-800',
      success: 'text-green-800',
      info: 'text-blue-800',
      warning: 'text-yellow-800',
    }[message.type];

    const Icon = {
      error: AlertCircle,
      success: CheckCircle,
      info: AlertCircle,
      warning: AlertCircle,
    }[message.type];

    const iconColor = {
      error: 'text-red-400',
      success: 'text-green-400',
      info: 'text-blue-400',
      warning: 'text-yellow-400',
    }[message.type];

    const friendlyError = message.userFriendlyError;
    const showActionButtons = friendlyError?.actionable && message.type === 'error';

    return (
      <div className={`p-4 border rounded-lg ${bgColor} mb-6`}>
        <div className="flex">
          <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>
              {friendlyError?.message || message.message}
            </p>
            {friendlyError?.nextSteps && (
              <p className={`text-xs mt-1 ${textColor} opacity-80`}>
                {friendlyError.nextSteps}
              </p>
            )}
            {showActionButtons && (
              <div className="mt-3 flex flex-wrap gap-2">
                {friendlyError.code === 'USER_ALREADY_REGISTERED' && (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Go to Login
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                )}
                {(friendlyError.code === 'INVALID_ACCESS_CODE' || friendlyError.code === 'EMAIL_MISMATCH') && (
                  <Link
                    href="/#beta"
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Request Beta Access
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show invalid URL error only for URL mode (not for manual entry mode)
  if (entryMode === 'url' && !urlParams.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
                <p className="text-sm text-gray-600">Registration</p>
              </div>
            </Link>
            
            <h2 className="text-3xl font-bold text-gray-900">
              Invalid Registration Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The registration link you followed is not valid
            </p>
          </div>

          {/* Error Card */}
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            {message && <MessageAlert message={message} />}
            
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Registration Link Issues
              </h3>
              <div className="text-sm text-gray-600 mb-6">
                <p className="mb-2">The following problems were found:</p>
                <ul className="list-disc list-inside text-left space-y-1">
                  {urlParams.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Please check your registration email for the correct link, or contact support for assistance.
                </p>
                
                <Link
                  href="/request-access"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Request New Access
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show registration form for both URL mode (with valid params) and manual entry mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <Image
              src="/faqbnb_logoshort.png"
              alt="FAQBNB Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
              <p className="text-sm text-gray-600">Account Registration</p>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete your registration to access FAQBNB
          </p>
          
          {/* Access code info - only show for URL mode */}
          {entryMode === 'url' && urlParams.isValid && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Access code verified: {urlParams.code?.substring(0, 4)}...
            </div>
          )}
        </div>

        {/* Registration Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {/* URL Messages */}
          {message && <MessageAlert message={message} />}

          {/* Manual Entry Mode - REQ-019 Task 5.3 */}
          {entryMode === 'manual' && (
            <div className="space-y-6">
              <AccessCodeInput
                onCodeChange={(code, email) => {
                  setManualEntry(prev => ({ ...prev, code, email }));
                }}
                onValidation={(isValid) => {
                  setManualEntry(prev => ({ ...prev, isValid }));
                }}
                disabled={isValidatingParams}
              />
              
              {/* Show registration form when manual entry is valid */}
              {manualEntry.isValid && manualEntry.code && manualEntry.email && (
                <div className="border-t border-gray-200 pt-6">
                  <RegistrationForm
                    email={manualEntry.email}
                    accessCode={manualEntry.code}
                    isManualEntry={true}
                    onSuccess={(result) => {
                      console.log('Manual registration successful:', result);
                      setMessage({
                        type: 'success',
                        message: 'Account created successfully! Redirecting to dashboard...'
                      });
                    }}
                    onError={(error, userFriendlyError) => {
                      console.error('Manual registration failed:', error);
                      setMessage({
                        type: 'error',
                        message: error,
                        userFriendlyError
                      });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* URL Mode - Original Registration Form */}
          {entryMode === 'url' && urlParams.isValid && (
            <RegistrationForm
              email={urlParams.email!}
              accessCode={urlParams.code!}
              isManualEntry={false}
              onSuccess={(result) => {
                console.log('URL registration successful:', result);
                setMessage({
                  type: 'success',
                  message: 'Account created successfully! Redirecting to dashboard...'
                });
              }}
              onError={(error, userFriendlyError) => {
                console.error('URL registration failed:', error);
                setMessage({
                  type: 'error',
                  message: error,
                  userFriendlyError
                });
              }}
            />
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6">
            <Link
              href="/"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Already have an account?
            </Link>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              © 2024 FAQBNB. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="fixed bottom-4 right-4 max-w-sm">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                Secure Registration
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Your registration is protected by access code validation.
                All registration attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}