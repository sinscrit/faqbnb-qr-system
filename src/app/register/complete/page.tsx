'use client';

// Complete Registration Page
// Handles "orphaned" auth users who completed OAuth but didn't finish app registration
// Last Modified: 2026-01-16

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle, Home, Shield, LogOut } from 'lucide-react';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense for useSearchParams
export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompleteRegistrationContent />
    </Suspense>
  );
}

function CompleteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading, signOut } = useAuth();

  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const emailFromUrl = searchParams.get('email') || user?.email || '';

  const DEBUG_PREFIX = '🔧 COMPLETE_REGISTRATION:';

  useEffect(() => {
    console.log(`${DEBUG_PREFIX} PAGE_MOUNTED`, {
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      emailFromUrl,
      authLoading
    });
  }, [user, authLoading, emailFromUrl]);

  // If user is not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      console.log(`${DEBUG_PREFIX} NO_AUTH_SESSION`, {
        timestamp: new Date().toISOString(),
        redirectingTo: '/login'
      });
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    console.log(`${DEBUG_PREFIX} SUBMITTING_REGISTRATION`, {
      timestamp: new Date().toISOString(),
      accessCode: accessCode.substring(0, 4) + '...',
      email: emailFromUrl,
      userId: user?.id
    });

    try {
      if (!session?.access_token) {
        throw new Error('No valid session found. Please try logging in again.');
      }

      const response = await fetch('/api/auth/complete-oauth-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          accessCode: accessCode,
          email: emailFromUrl
        })
      });

      const result = await response.json();

      console.log(`${DEBUG_PREFIX} API_RESPONSE`, {
        timestamp: new Date().toISOString(),
        status: response.status,
        success: result.success,
        error: result.error
      });

      if (response.ok && result.success) {
        setSuccess(true);
        console.log(`${DEBUG_PREFIX} REGISTRATION_COMPLETED`, {
          timestamp: new Date().toISOString(),
          userId: result.user?.id,
          accountId: result.account?.id
        });

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard2');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error(`${DEBUG_PREFIX} ERROR:`, err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    console.log(`${DEBUG_PREFIX} SIGNING_OUT`, {
      timestamp: new Date().toISOString(),
      userId: user?.id
    });
    await signOut();
    router.push('/login');
  };

  // Show loading while checking auth
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

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
            <p className="text-gray-600 mb-4">Your account has been set up successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex flex-col justify-center">
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
              <p className="text-sm text-gray-600">Complete Registration</p>
            </div>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900">
            Almost there!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your Google sign-in was successful, but we need an access code to complete your registration.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Signed in as:</strong> {emailFromUrl}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Enter your access code to complete account setup.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
                Access Code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="accessCode"
                  name="accessCode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Enter your access code"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono tracking-wider"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Check your email for the access code from your invitation.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !accessCode}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing Registration...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>

          {/* Sign Out Option */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Wrong account? Sign out and try again.
            </p>
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
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
              href="/request-access"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Request Access Code
            </Link>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500">
              2024 FAQBNB. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
