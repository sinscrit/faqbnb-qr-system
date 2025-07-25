'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { AlertCircle, CheckCircle, Home } from 'lucide-react';

interface LoginMessage {
  type: 'error' | 'success' | 'info';
  message: string;
}

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loginMessage, setLoginMessage] = useState<LoginMessage | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Handle redirect loops by clearing sessions if we keep coming back to login
  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam && window.location.href.includes('redirect=')) {
      // If we're on login page with a redirect param, just clean up the URL
      // Don't clear sessions as this destroys valid Supabase authentication
      console.log('Login page with redirect param detected, cleaning URL');
      
      // Only remove the redirect parameter to clean up URL, don't clear sessions
      const url = new URL(window.location.href);
      const cleanParams = new URLSearchParams();
      
      // Keep non-redirect parameters but remove redirect to clean up URL
      url.searchParams.forEach((value, key) => {
        if (key !== 'redirect') {
          cleanParams.set(key, value);
        }
      });
      
      const cleanUrl = cleanParams.toString() ? `/login?${cleanParams.toString()}` : '/login';
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [searchParams]);

  // Handle URL parameters for messages
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      switch (error) {
        case 'access_denied':
          setLoginMessage({
            type: 'error',
            message: 'Access denied. Admin privileges are required to access this system.',
          });
          break;
        case 'session_expired':
          setLoginMessage({
            type: 'info',
            message: 'Your session has expired. Please sign in again.',
          });
          break;
        case 'auth_error':
          setLoginMessage({
            type: 'error',
            message: 'An authentication error occurred. Please try signing in again.',
          });
          break;
        case 'logout_error':
          setLoginMessage({
            type: 'error',
            message: 'There was an error during logout. Please try signing in again.',
          });
          break;
        default:
          setLoginMessage({
            type: 'error',
            message: 'An error occurred. Please try signing in again.',
          });
      }
    } else if (message) {
      switch (message) {
        case 'logged_out':
          setLoginMessage({
            type: 'success',
            message: 'You have been successfully signed out.',
          });
          break;
        default:
          setLoginMessage({
            type: 'info',
            message: message,
          });
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated (with better validation)
  useEffect(() => {
    // Only redirect if we're confident the user is properly authenticated
    if (!authLoading && user && user.email && user.role) {
      const redirectTo = searchParams.get('redirect') || '/admin';
      console.log('User already authenticated, redirecting to:', redirectTo);
      
      // Use Next.js router for proper client-side navigation
      router.push(redirectTo);
    }
  }, [user, authLoading, router, searchParams]);

  // Show loading if checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message if user is authenticated (but not if we're forcing login form)
  if (user && !showLoginForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = () => {
    setLoginMessage({
      type: 'success',
      message: 'Login successful! Redirecting...',
    });
  };

  const handleLoginError = (error: string) => {
    setLoginMessage({
      type: 'error',
      message: error,
    });
  };

  const MessageAlert = ({ message }: { message: LoginMessage }) => {
    const bgColor = {
      error: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200',
      info: 'bg-blue-50 border-blue-200',
    }[message.type];

    const textColor = {
      error: 'text-red-800',
      success: 'text-green-800',
      info: 'text-blue-800',
    }[message.type];

    const Icon = {
      error: AlertCircle,
      success: CheckCircle,
      info: AlertCircle,
    }[message.type];

    const iconColor = {
      error: 'text-red-400',
      success: 'text-green-400',
      info: 'text-blue-400',
    }[message.type];

    return (
      <div className={`p-4 border rounded-lg ${bgColor} mb-6`}>
        <div className="flex">
          <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="ml-3">
            <p className={`text-sm font-medium ${textColor}`}>
              {message.message}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center">
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
              <p className="text-sm text-gray-600">Admin Access</p>
            </div>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the FAQBNB administration panel
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {/* URL Messages */}
          {loginMessage && <MessageAlert message={loginMessage} />}

          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
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
            {/* Clear Session Button for stuck users */}
            {(user || showLoginForm) && (
              <button
                onClick={() => {
                  // Clear any stored sessions and force fresh login
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="text-sm text-red-600 hover:text-red-700 underline"
                title="Clear stored session and reload page"
              >
                Clear Session
              </button>
            )}
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
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                Secure Access
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                This area is restricted to authorized administrators only.
                All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 