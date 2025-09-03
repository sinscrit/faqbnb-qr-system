'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink, RefreshCw, Package } from 'lucide-react';

export default function AdminItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // Get property parameter from URL to preserve context
  const propertyId = searchParams.get('property');

  // Redirect to unified dashboard items after authentication check
  useEffect(() => {
    if (!loading && user) {
      // Small delay to show the redirect message, then redirect
      const timer = setTimeout(() => {
        const targetUrl = propertyId
          ? `/dashboard/items?property=${propertyId}`
          : '/dashboard/items';
        router.replace(targetUrl);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router, propertyId]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <p className="text-gray-600 mb-6">Please log in to access items management.</p>
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

  // Show redirect message while redirecting to unified dashboard items
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-4">Unified Items Management</h1>

          <p className="text-gray-600 mb-6">
            Items management has been unified with the dashboard for a better experience.
            Redirecting you to the new unified items management...
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-blue-800">
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">
                New Location: /dashboard/items{propertyId ? `?property=${propertyId}` : ''}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>You will be redirected automatically.</p>
            <p className="mt-1">If redirect doesn't work, <button
                onClick={() => {
                  const targetUrl = propertyId
                    ? `/dashboard/items?property=${propertyId}`
                    : '/dashboard/items';
                  router.push(targetUrl);
                }}
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
