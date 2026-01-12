'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FileText, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

/**
 * Instructions Page - Dashboard2 Placeholder
 *
 * REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
 * Phase 4, Task 4.1 (depends on REQ-195 pattern)
 *
 * Last Modified: 2026-01-12
 *
 * This page will display instructions/articles grouped by item.
 * Currently serves as a placeholder with navigation to the Items page.
 *
 * @see docs/REQ-205-update-navigationitems-in-layout-detailed.md
 */
export default function InstructionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

  const canViewItems = useCanAccess('view_items');

  // Loading state
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication check (layout handles this, but included for direct navigation)
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access instructions.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
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
        <p className="text-gray-600 mb-6">You do not have permission to view instructions.</p>
        <Link
          href="/dashboard2"
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
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
                Instructions
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              View and manage instructions for your items
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard2/items"
              aria-label="Navigate to items management"
              className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors flex items-center"
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
            Instructions Coming Soon
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            This page will display all instructions and articles grouped by item.
            For now, you can manage instructions through the Items page.
          </p>
          <Link
            href="/dashboard2/items"
            className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
          >
            Go to Items
          </Link>
        </div>
      </div>
    </div>
  );
}
