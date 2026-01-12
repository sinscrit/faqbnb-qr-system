'use client';

/**
 * REQ-213: Edit Instruction Flow - Edit Page
 * Created: 2026-01-12
 * Last Modified: 2026-01-12
 *
 * Edit page for existing instruction articles.
 * Routes to /dashboard2/instructions/[articleId]/edit
 * Loads article data and displays ItemCreationWorkflow in edit mode.
 *
 * @route /dashboard2/instructions/[articleId]/edit
 * @see docs/req-213-edit-instruction-flow-detailed.md
 */

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { adminApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

// Type definitions for edit mode data will be imported after Task 3
// import { EditModeData } from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.articleId as string;

  const { user } = useAuth();
  const { currentAccount } = useAccountContext();
  const { selectedPropertyId } = usePropertyContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editData, setEditData] = useState<any | null>(null);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, router]);

  // Fetch article data on mount
  useEffect(() => {
    // Will implement in Task 4
    // fetchArticleData(articleId);
  }, [articleId]);

  // Authentication check rendering
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading article data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Article</h2>
          <p className="text-red-700 mb-4">{error.message}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/dashboard2/instructions')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Instructions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder for ItemCreationWorkflow (will be connected in later tasks)
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Instruction</h1>
        <p className="text-gray-600">ItemCreationWorkflow will be connected here in Task 5</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Article ID: {articleId}</p>
        </div>
      </div>
    </div>
  );
}
