'use client';

/**
 * REQ-212: Instructions List Page
 * Created: 2026-01-12
 * Last Modified: 2026-01-12
 *
 * Displays a list of instruction articles with joined item data.
 * Shows article title, item name, room (extracted from tags), purpose, and actions.
 *
 * @route /dashboard2/instructions
 * @see docs/req-212-instructions-list-page-detailed.md
 */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { adminApi } from '@/lib/api';
import { extractRoomFromTags } from '@/lib/room-utils';
import { InstructionsTable } from '@/components/InstructionsTable';
import type { InstructionRow } from '@/components/InstructionsTable';
import { FileText, Loader2, FileQuestion } from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// Main Page Component
// ============================================================================

export default function InstructionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentAccount } = useAccountContext();
  const { selectedPropertyId } = usePropertyContext();

  const [articles, setArticles] = useState<any[]>([]);
  const [instructionsData, setInstructionsData] = useState<InstructionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch articles and items from backend
  const fetchArticles = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // Prepare headers with account context
    const headers: Record<string, string> = {};
    if (currentAccount) {
      headers['x-current-account'] = currentAccount.id;
    }

    try {
      // NOTE: The API currently requires item_id parameter, so we need to fetch
      // items first and then fetch articles for each item (Task 8)
      // For now, we'll fetch all items and then fetch articles for each
      const itemsResponse = await adminApi.listItems(
        undefined, // search
        selectedPropertyId || undefined, // propertyId filter
        1,
        100,
        headers
      );

      if (!itemsResponse.success || !itemsResponse.data) {
        throw new Error(itemsResponse.error || 'Failed to fetch items');
      }

      const items = itemsResponse.data;

      // If no items, set empty articles and return
      if (items.length === 0) {
        setArticles([]);
        setInstructionsData([]);
        setLoading(false);
        return;
      }

      // Fetch articles for all items
      const allArticles: any[] = [];
      for (const item of items) {
        try {
          const articlesResponse = await adminApi.listArticles(
            item.id, // itemId
            undefined, // propertyId
            1,
            100,
            headers
          );

          if (articlesResponse.success && articlesResponse.data) {
            // Add item reference to each article
            articlesResponse.data.forEach((article: any) => {
              allArticles.push({
                ...article,
                item: {
                  id: item.id,
                  name: item.name,
                  tags: item.tags || []
                }
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching articles for item ${item.id}:`, err);
          // Continue with other items even if one fails
        }
      }

      setArticles(allArticles);

      // Process articles into InstructionRow format with room extraction
      const processedInstructions: InstructionRow[] = allArticles.map((article) => {
        const item = article.item;
        const room = extractRoomFromTags(item.tags || []);

        return {
          id: `${article.id}-${item.id}`, // Composite key for uniqueness
          articleId: article.id,
          articleTitle: article.title || 'Untitled',
          itemName: item.name || 'Unknown Item',
          itemId: item.id,
          room: room,
          purpose: article.purpose || 'other',
          createdAt: article.createdAt || new Date().toISOString(),
        };
      });

      setInstructionsData(processedInstructions);
      console.log('Processed instructions data:', processedInstructions);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch articles'));
    } finally {
      setLoading(false);
    }
  }, [user, currentAccount, selectedPropertyId]);

  // Fetch articles on mount and when dependencies change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Handle edit article action
  const handleEditArticle = useCallback((articleId: string) => {
    if (!articleId || typeof articleId !== 'string') {
      console.error('Invalid articleId:', articleId);
      return;
    }

    try {
      // Navigate to edit page with article ID
      router.push(`/dashboard2/instructions/${articleId}/edit`);
    } catch (error) {
      console.error('Error navigating to edit page:', error);
    }
  }, [router]);

  // Authentication check
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading instructions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Instructions</h2>
          <p className="text-red-700 mb-4">{error.message}</p>
          <button
            onClick={fetchArticles}
            className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No instructions yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Create items and add instruction articles to get started. Instructions help guests
            understand how to use items in your property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard2/create"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#FF385C] text-white text-base font-medium rounded-lg hover:bg-[#E31C5F] transition-colors shadow-sm"
            >
              Create Your First Item
            </Link>
            <Link
              href="/dashboard2/help"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div role="main" aria-labelledby="instructions-title">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
              <h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
                Instructions
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              Manage instruction articles for your items
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFEEEF] text-[#FF385C]">
                {articles.length} {articles.length === 1 ? 'article' : 'articles'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <InstructionsTable
          instructions={instructionsData}
          loading={loading}
          onEdit={handleEditArticle}
        />
      </div>
    </div>
  );
}
