'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FileText, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

/**
 * Instructions Page - Placeholder
 *
 * REQ-195: Create Instructions Page (Placeholder)
 * Phase 4, Task 4.4
 *
 * Last Modified: 2026-01-12
 *
 * This page will display instructions/articles grouped by item.
 * Currently serves as a placeholder with navigation to the Items page.
 *
 * @see docs/REQ-195-create-instructions-page-placeholder-overview.md
 */
export default function InstructionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);
  const t = useTranslations('common.loading');

  const canViewItems = useCanAccess('view_items');

  // Loading state
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('pages.instructions')}</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access guides.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Authorization check
  if (!canViewItems.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view guides.</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Authorized view
  return (
    <div role="main" aria-labelledby="instructions-title">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-gray-600" aria-hidden="true" />
              <h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
                Guides
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              View and manage guides for your items
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              aria-label="Return to dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/dashboard/items"
              aria-label="Navigate to items management"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              View Items
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Guides Coming Soon
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            This page will display all guides and articles grouped by item.
            For now, you can manage guides through the Items page.
          </p>
          <Link
            href="/dashboard/items"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Items
          </Link>
        </div>
      </div>
    </div>
  );
}
