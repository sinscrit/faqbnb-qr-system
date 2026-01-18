'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink, RefreshCw, Shield, ArrowRight } from 'lucide-react';

/**
 * Back Office Redirect Page
 * Part of REQ-023: Unified Route Architecture - System Admin Separation
 * This page has been moved to /admin/system/back-office for enhanced security
 */
export default function BackOfficeRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [redirectTimer, setRedirectTimer] = useState(5);

  // Preserve URL parameters for the redirect
  const currentParams = searchParams.toString();
  const targetUrl = currentParams
    ? `/admin/system/back-office?${currentParams}`
    : '/admin/system/back-office';

  // Auto-redirect countdown
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setRedirectTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace(targetUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, router, targetUrl]);

  const handleManualRedirect = () => {
    router.replace(targetUrl);
  };

  const handleGoToDashboard = () => {
    router.replace('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the system back office.</p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Admin Back Office
          </h1>
          <p className="text-lg text-gray-600">
            Enhanced Security & Access Control
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
          {/* Status Banner */}
          <div className="bg-red-600 text-white px-6 py-4">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
              <div>
                <h2 className="text-lg font-semibold">Route Migration in Progress</h2>
                <p className="text-red-100 text-sm">Redirecting to secure system admin area...</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="text-center">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Back Office Has Been Moved
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                For enhanced security and better organization, the back office functionality
                has been moved to a dedicated system administrator area. This ensures that
                sensitive administrative functions are properly protected and accessible
                only to authorized system administrators.
              </p>

              {/* Auto-redirect countdown */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-gray-600">Auto-redirecting in</span>
                  <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-lg">
                    {redirectTimer}
                  </span>
                  <span className="text-gray-600">seconds...</span>
                </div>
              </div>

              {/* New Location Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-blue-800 font-medium">New Location:</p>
                    <p className="text-blue-700 text-sm font-mono">
                      /admin/system/back-office
                    </p>
                    {currentParams && (
                      <p className="text-blue-600 text-sm mt-1">
                        Parameters preserved: {currentParams}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleManualRedirect}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Go to System Back Office
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>

                <button
                  onClick={handleGoToDashboard}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Part of REQ-023: Unified Route Architecture</span>
              <span>System Admin Area • Enhanced Security</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This change improves system security by separating administrative functions
            into dedicated secure areas with proper access controls.
          </p>
        </div>
      </div>
    </div>
  );
}