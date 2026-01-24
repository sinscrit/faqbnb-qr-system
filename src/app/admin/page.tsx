'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const t = useTranslations('common.loading');

  // Redirect to unified dashboard after authentication check
  useEffect(() => {
    if (!loading && user) {
      // Small delay to show the redirect message, then redirect
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('generic.loading')}</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show redirect message while redirecting to unified dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <RefreshCw className="w-6 h-6 text-blue-600 mx-auto animate-pulse" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-4">Unified Dashboard</h1>

          <p className="text-gray-600 mb-6">
            The admin dashboard has been unified with the user dashboard for a better experience.
            Redirecting you to the new unified dashboard...
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-blue-800">
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">New Location: /dashboard</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>You will be redirected automatically.</p>
            <p className="mt-1">If redirect doesn&apos;t work, <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                click here
              </button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

