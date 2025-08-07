'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import RegistrationForm from '@/components/RegistrationForm';
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

export default function RegistrationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [message, setMessage] = useState<RegistrationMessage | null>(null);
  const [urlParams, setUrlParams] = useState<URLParams>({
    code: null,
    email: null,
    isValid: false,
    errors: []
  });
  const [isValidatingParams, setIsValidatingParams] = useState(true);

  // Debug logging for registration page
  const DEBUG_PREFIX = "🔒 REGISTRATION_PAGE_DEBUG:";
  
  console.log(`${DEBUG_PREFIX} REGISTRATION_PAGE_MOUNTED`, {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    authLoading,
    hasUser: !!user,
    userId: user?.id
  });

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
      const email = searchParams.get('email');
      const errors: string[] = [];
      
      console.log(`${DEBUG_PREFIX} VALIDATING_URL_PARAMS`, {
        timestamp: new Date().toISOString(),
        code: code ? `${code.substring(0, 4)}...` : null,
        email: email
      });

      // Validate access code parameter
      if (!code) {
        errors.push('Access code parameter is required');
      } else if (!/^[A-Za-z0-9]{8,}$/.test(code)) {
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
        code,
        email,
        isValid,
        errors
      });

      if (!isValid) {
        setMessage({
          type: 'error',
          message: `Registration link is invalid: ${errors.join(', ')}`
        });
      }

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

  // Show invalid URL error
  if (!urlParams.isValid) {
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

  // Valid URL parameters - show registration form
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
          
          {/* Access code info */}
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Shield className="w-3 h-3 mr-1" />
            Access code verified: {urlParams.code?.substring(0, 4)}...
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {/* URL Messages */}
          {message && <MessageAlert message={message} />}

          {/* Registration Form */}
          <RegistrationForm
            email={urlParams.email!}
            accessCode={urlParams.code!}
            onSuccess={(result) => {
              console.log('Registration successful:', result);
              setMessage({
                type: 'success',
                message: 'Account created successfully! Redirecting to dashboard...'
              });
              // TODO: Redirect to dashboard in next tasks
            }}
            onError={(error, userFriendlyError) => {
              console.error('Registration failed:', error);
              setMessage({
                type: 'error',
                message: error,
                userFriendlyError
              });
            }}
          />
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