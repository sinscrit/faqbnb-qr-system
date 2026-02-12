'use client';

/**
 * REQ-214: Dedicated Single-Page Edit Experience - Edit Page
 * Created: 2026-01-12
 * @lastModified 2026-01-22 18:25 (REQ-E02-074 - L10N)
 *
 * Edit page for existing instruction articles using new InstructionEditor.
 * Routes to /dashboard2/instructions/[articleId]/edit
 * Simplified single-page edit experience (replaces ItemCreationWorkflow).
 *
 * @route /dashboard2/instructions/[articleId]/edit
 * @see docs/req-214-dedicated-edit-page-detailed.md
 */

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Loader2, Globe } from 'lucide-react';
import { InstructionEditor } from '@/components/InstructionEditor';
import type { ArticleEditData, UpdateArticlePayload } from '@/components/InstructionEditor';
import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { cn } from '@/lib/utils';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.articleId as string;
  const t = useTranslations('articles.edit');
  const tEditor = useTranslations('articles.editor');  // REQ-E05-028

  const { user } = useAuth();
  const { currentAccount } = useAccountContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [articleData, setArticleData] = useState<ArticleEditData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Translation panel state (REQ-E05-028)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [shouldAutoOpenPanel, setShouldAutoOpenPanel] = useState(false);

  // Translation status hook (REQ-E05-028)
  const { summary: status, isLoading: statusLoading, refetch: refetchStatus } = useTranslationStatus({
    entityType: 'article',
    entityId: articleId,
    enabled: !!articleId && !loading,
  });

  // Auto-open translation panel after save when translations need attention (REQ-E05-028)
  useEffect(() => {
    if (shouldAutoOpenPanel && status) {
      const shouldOpen =
        (status.pending > 0) ||
        (status.failed > 0);

      if (shouldOpen) {
        console.log('[REQ-E05-028] Auto-opening translation panel:', {
          pending: status.pending,
          failed: status.failed,
        });
        setIsPanelOpen(true);
      }

      // Reset flag to prevent repeated opens
      setShouldAutoOpenPanel(false);
    }
  }, [shouldAutoOpenPanel, status]);

  /**
   * Fetch article data and transform it into ArticleEditData format
   * @param articleId The UUID of the article to load
   */
  const fetchArticleData = useCallback(async (articleId: string) => {
    if (!user || !articleId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare headers with account context
      const headers: Record<string, string> = {};
      if (currentAccount) {
        headers['x-current-account'] = currentAccount.id;
      }

      // Fetch article data
      const articleResponse = await adminApi.getArticle(articleId, headers);

      if (!articleResponse.success || !articleResponse.data) {
        throw new Error(articleResponse.error || 'Failed to fetch article');
      }

      const article = articleResponse.data;

      // Item data is included in the article response
      const item = (article as any).item;

      if (!item) {
        throw new Error('Item data not found in article response');
      }

      // Transform to ArticleEditData format
      // REQ-262: Added debug logging to trace link type conversion
      const editData: ArticleEditData = {
        articleId: article.id,
        itemId: item.id,
        purpose: article.purpose,
        title: article.title || '',
        description: article.description || null,
        item: {
          id: item.id,
          name: item.name,
          tags: item.tags || [],
        },
        links: (article.links || []).map((link: any) => {
          const linkType = link.link_type || link.linkType;
          if (process.env.NODE_ENV === 'development') {
            console.log('[REQ-262] EditArticlePage: Link', link.id, 'link_type:', link.link_type, 'linkType:', link.linkType, '-> final:', linkType);
          }
          return {
            id: link.id,
            title: link.title,
            linkType,
            url: link.url,
            thumbnailUrl: link.thumbnail_url || link.thumbnailUrl,
            displayOrder: link.display_order || link.displayOrder || 0,
          };
        }),
      };

      setArticleData(editData);
      console.log('[REQ-262] Loaded article data for editing:', editData);
    } catch (err) {
      console.error('Error fetching article data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load article data'));
    } finally {
      setLoading(false);
    }
  }, [user, currentAccount]);

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, router]);

  // Fetch article data on mount
  useEffect(() => {
    if (user && articleId) {
      fetchArticleData(articleId);
    }
  }, [articleId, user, fetchArticleData]);

  /**
   * Handle save - process file uploads and update article
   */
  const handleSave = useCallback(async (payload: UpdateArticlePayload) => {
    if (!articleData || !currentAccount) {
      throw new Error('Missing data or account context');
    }

    setIsSaving(true);

    try {
      const headers: Record<string, string> = {
        'x-current-account': currentAccount.id,
      };

      // Process links with file uploads
      const processedLinks = await Promise.all(
        payload.links.map(async (link) => {
          // If there's a file to upload, handle it here
          // For now, we'll just pass through the link data
          // File upload handling will be added in Task 7
          return {
            id: link.id,
            title: link.title,
            linkType: link.linkType,
            url: link.url,
            thumbnailUrl: link.thumbnailUrl,
            displayOrder: link.displayOrder,
          };
        })
      );

      // Build API payload
      const apiPayload: any = {
        title: payload.title,
        links: processedLinks,
      };

      // Include item tags if they changed
      if (payload.itemTags) {
        apiPayload.itemTags = payload.itemTags;
      }

      // Update article
      const response = await adminApi.updateArticle(articleId, apiPayload, headers);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update article');
      }

      console.log('Article updated successfully:', response.data);

      // Set success flag for list page
      sessionStorage.setItem('editSuccess', 'true');

      // REQ-E05-028: Refresh translation status and trigger auto-open check
      await refetchStatus();
      setShouldAutoOpenPanel(true);

      // Conditional redirect: stay on page if translations need attention
      if (status?.pending || status?.failed) {
        console.log('[REQ-E05-028] Staying on page to show translation panel');
      } else {
        // Redirect to list page
        router.push('/dashboard2/instructions');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [articleId, articleData, currentAccount, router, refetchStatus, status]);

  /**
   * Handle cancel - return to instructions list
   */
  const handleCancel = useCallback(() => {
    router.push('/dashboard2/instructions');
  }, [router]);

  // Authentication check rendering
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">{t('loginRequired')}</p>
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
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">{t('loadError')}</h2>
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
              {t('backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render InstructionEditor
  if (!articleData) {
    return null; // Should not reach here due to loading/error checks above
  }

  return (
    <>
      {/* Translations button section (REQ-E05-028) */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsPanelOpen(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'border border-gray-300 bg-white',
              'hover:bg-gray-50 transition-colors',
              'text-gray-700 font-medium text-sm'
            )}
            aria-label={tEditor('translationsTooltip')}
          >
            <Globe className="w-4 h-4" />
            <span>{tEditor('translations')}</span>
            {/* Pending count badge */}
            {status?.pending && status.pending > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {status.pending}
              </span>
            )}
            {/* Failed count badge */}
            {status?.failed && status.failed > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                {status.failed}
              </span>
            )}
            {/* Loading indicator */}
            {statusLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <InstructionEditor
        articleData={articleData}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      {/* Translation Preview Panel (REQ-E05-028) */}
      <TranslationPreviewPanel
        entityId={articleId}
        entityType="article"
        sourceLanguage="en"
        sourceContent={{
          title: articleData.title,
          description: articleData.description || undefined,
        }}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onTranslationEdited={(language) => {
          // Navigate to translation edit page
          router.push(`/dashboard2/translations/article/${articleId}/${language}/edit`);
        }}
      />
    </>
  );
}
