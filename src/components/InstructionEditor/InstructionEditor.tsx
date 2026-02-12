'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TagsEditor } from '@/components/ItemCreationWorkflow/components/shared';
import { ReadOnlyContextSection } from './components/ReadOnlyContextSection';
import { ContentEditSection } from './components/ContentEditSection';
import { AddContentModal } from './components/AddContentModal';
import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog';
import { useManualEditCheck } from '@/hooks/useManualEditCheck';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type {
  InstructionEditorProps,
  ContentPieceState,
  UpdateArticlePayload,
  ArticleLinkData,
} from './InstructionEditor.types';

/**
 * Helper function to map link type from API to content type
 * REQ-262: Added debug logging to trace type conversion issues
 */
function mapLinkTypeToContentType(linkType: string): ContentPieceState['type'] {
  let result: ContentPieceState['type'];
  switch (linkType) {
    case 'youtube':
    case 'video':
      result = 'video';
      break;
    case 'image':
      result = 'photo';
      break;
    case 'pdf':
      result = 'pdf';
      break;
    case 'text':
      result = 'text';
      break;
    case 'url':
      result = 'url';
      break;
    default:
      console.warn('[REQ-262] mapLinkTypeToContentType: Unknown linkType:', linkType, '- defaulting to url');
      result = 'url';
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('[REQ-262] mapLinkTypeToContentType:', linkType, '->', result);
  }
  return result;
}

/**
 * Helper function to map content type to link type for API
 * REQ-262: Added debug logging to trace type conversion issues
 */
function mapContentTypeToLinkType(contentType: ContentPieceState['type']): string {
  let result: string;
  switch (contentType) {
    case 'video':
      result = 'video';
      break;
    case 'photo':
      result = 'image';
      break;
    case 'pdf':
      result = 'pdf';
      break;
    case 'text':
      result = 'text';
      break;
    case 'url':
      result = 'url';
      break;
    default:
      console.warn('[REQ-262] mapContentTypeToLinkType: Unknown contentType:', contentType, '- defaulting to url');
      result = 'url';
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('[REQ-262] mapContentTypeToLinkType:', contentType, '->', result);
  }
  return result;
}

/**
 * Transform API links to internal ContentPieceState format
 * REQ-262: Added debug logging to trace transformation
 */
function transformLinksToContentState(links: ArticleLinkData[]): ContentPieceState[] {
  if (process.env.NODE_ENV === 'development') {
    console.log('[REQ-262] transformLinksToContentState: Transforming', links.length, 'links');
  }
  return links.map(link => {
    const contentType = mapLinkTypeToContentType(link.linkType);
    if (process.env.NODE_ENV === 'development') {
      console.log('[REQ-262] transformLinksToContentState: Link', link.id, 'type:', link.linkType, '->', contentType);
    }
    return {
      id: link.id,
      type: contentType,
      title: link.title,
      url: link.url,
      thumbnailUrl: link.thumbnailUrl,
      displayOrder: link.displayOrder,
    };
  });
}

/**
 * InstructionEditor - Main container component for editing instructions
 *
 * Single-page edit experience that:
 * - Shows read-only item context (Room, Item Type, Item Name)
 * - Allows editing Article Title, Tags, and Content/Media
 * - No workflow steps, no back arrow
 * - Save and Cancel actions
 */
export function InstructionEditor({
  articleData,
  onSave,
  onCancel,
  isSaving = false,
}: InstructionEditorProps) {
  const tLoading = useTranslations('common.loading');
  const t = useTranslations('articles.instructionEditor');
  const tEdit = useTranslations('articles.edit');

  // Editable article title
  const [articleTitle, setArticleTitle] = useState(articleData.title);

  // REQ-261: Separate system tags (room, item-type) from editable tags
  // System tags use special prefixes and should be preserved when editing other tags
  const systemTagPrefixes = ['#room.', '#item-type.', '#appliance.', '#room-item.', '#general-info.'];

  // Extract system tags (immutable) and editable tags (user can modify)
  const [systemTags] = useState<string[]>(() =>
    articleData.item.tags.filter(tag => systemTagPrefixes.some(prefix => tag.startsWith(prefix)))
  );

  // Editable tags (non-system tags that user can add/remove)
  const [editableTags, setEditableTags] = useState<string[]>(() =>
    articleData.item.tags.filter(tag => !systemTagPrefixes.some(prefix => tag.startsWith(prefix)))
  );

  // Combined tags for comparison and API submission
  const tags = useMemo(() => [...systemTags, ...editableTags], [systemTags, editableTags]);

  // Content pieces state
  const [content, setContent] = useState<ContentPieceState[]>(() =>
    transformLinksToContentState(articleData.links)
  );

  // Add content modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Track if any changes made
  const [isDirty, setIsDirty] = useState(false);

  // REQ-E05-024: Manual edit check integration
  const { checkForManualEdits, isChecking, error: manualEditCheckError } = useManualEditCheck();
  const [showManualEditWarning, setShowManualEditWarning] = useState(false);
  const [manuallyEditedLanguages, setManuallyEditedLanguages] = useState<SupportedLanguage[]>([]);
  const [pendingPayload, setPendingPayload] = useState<UpdateArticlePayload | null>(null);

  // REQ-E05-024: Log translation check errors (fail-safe allows save to proceed)
  useEffect(() => {
    if (manualEditCheckError) {
      console.error('[InstructionEditor] Translation check error:', manualEditCheckError);
    }
  }, [manualEditCheckError]);

  // Content handlers
  const handleReorderContent = useCallback((fromIndex: number, toIndex: number) => {
    setContent(prev => {
      const newContent = [...prev];
      const [moved] = newContent.splice(fromIndex, 1);
      newContent.splice(toIndex, 0, moved);
      // Update displayOrder for all items
      return newContent.map((item, idx) => ({ ...item, displayOrder: idx }));
    });
    setIsDirty(true);
  }, []);

  const handleRemoveContent = useCallback((id: string) => {
    setContent(prev => prev.filter(c => c.id !== id));
    setIsDirty(true);
  }, []);

  const handleAddContent = useCallback((newContent: ContentPieceState) => {
    setContent(prev => [...prev, { ...newContent, displayOrder: prev.length }]);
    setIsDirty(true);
  }, []);

  // Check if tags have changed
  const tagsChanged = useMemo(() => {
    return JSON.stringify(tags) !== JSON.stringify(articleData.item.tags);
  }, [tags, articleData.item.tags]);

  // Save handler - REQ-E05-024: Check for manual edits before save
  const handleSave = useCallback(async () => {
    const payload: UpdateArticlePayload = {
      title: articleTitle,
      links: content.map(c => ({
        id: c.isNew ? undefined : c.id,
        title: c.title,
        linkType: mapContentTypeToLinkType(c.type),
        url: c.url,
        thumbnailUrl: c.thumbnailUrl || undefined,
        displayOrder: c.displayOrder,
        file: c.file, // Include file for upload handling
      })),
      itemTags: tagsChanged ? tags : undefined,
    };

    // Check for manual translations before saving
    const result = await checkForManualEdits({
      entityType: 'article',
      entityId: articleData.articleId,
    });

    if (result.hasManualEdits) {
      // Show warning dialog for user decision
      setManuallyEditedLanguages(result.manuallyEditedLanguages);
      setPendingPayload(payload);
      setShowManualEditWarning(true);
      return;
    }

    // No manual edits, proceed with normal save
    await onSave(payload);
  }, [articleTitle, content, tags, tagsChanged, onSave, checkForManualEdits, articleData.articleId]);

  // REQ-E05-024: Handle keeping manual edits (mark as stale)
  const handleKeepManualEdits = useCallback(async () => {
    if (pendingPayload) {
      await onSave({ ...pendingPayload, skipRetranslation: true });
    }
    setShowManualEditWarning(false);
    setPendingPayload(null);
    setManuallyEditedLanguages([]);
  }, [pendingPayload, onSave]);

  // REQ-E05-024: Handle overwriting manual edits (re-translate)
  const handleOverwriteManualEdits = useCallback(async () => {
    if (pendingPayload) {
      await onSave({ ...pendingPayload, forceRetranslation: true });
    }
    setShowManualEditWarning(false);
    setPendingPayload(null);
    setManuallyEditedLanguages([]);
  }, [pendingPayload, onSave]);

  // REQ-E05-024: Handle cancelling the warning dialog
  const handleCancelWarning = useCallback(() => {
    setShowManualEditWarning(false);
    setPendingPayload(null);
    setManuallyEditedLanguages([]);
  }, []);

  // Cancel handler with unsaved changes warning
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(tEdit('unsavedChanges'));
      if (!confirmed) return;
    }
    onCancel();
  }, [isDirty, onCancel, tEdit]);

  // Check if save is allowed - REQ-E05-024: Include isChecking state
  const canSave = useMemo(() => {
    return (
      !isSaving &&
      !isChecking &&
      articleTitle.trim().length > 0 &&
      content.length > 0
    );
  }, [isSaving, isChecking, articleTitle, content.length]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-6">
      {/* Read-only context section */}
      <ReadOnlyContextSection articleData={articleData} />

      {/* Editable Article Title */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <label
          htmlFor="article-title"
          className="block text-sm font-medium text-[#717171] mb-2"
        >
          {t('articleTitle')}
        </label>
        <input
          id="article-title"
          type="text"
          value={articleTitle}
          onChange={(e) => {
            setArticleTitle(e.target.value);
            setIsDirty(true);
          }}
          disabled={isSaving}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg',
            'min-h-[48px]',
            'text-base text-[#222222] placeholder:text-[#717171]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#222222]',
            isSaving
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400'
          )}
          placeholder={t('articleTitlePlaceholder')}
          maxLength={100}
        />
      </section>

      {/* Tags Editor */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-[#717171] mb-2">
          {t('tags')}
        </label>
        <TagsEditor
          selectedTags={editableTags}
          onTagsChange={(newTags) => {
            // REQ-261: Only update editable tags, system tags are preserved automatically
            setEditableTags(newTags);
            setIsDirty(true);
          }}
          disabled={isSaving}
        />
      </section>

      {/* Content Edit Section */}
      <ContentEditSection
        content={content}
        onReorder={handleReorderContent}
        onRemove={handleRemoveContent}
        onAddContent={() => setIsAddModalOpen(true)}
        disabled={isSaving}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-lg shadow-lg">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className={cn(
            'px-6 py-3 border-2 border-gray-300 rounded-lg',
            'text-[#222222] font-medium',
            'transition-colors duration-150',
            isSaving
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50'
          )}
        >
          {tEdit('buttons.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'px-6 py-3 rounded-lg',
            'font-medium',
            'transition-colors duration-150',
            'flex items-center gap-2',
            canSave
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {(isSaving || isChecking) && <Loader2 className="w-5 h-5 animate-spin" />}
          {isChecking
            ? t('checkingTranslations')
            : isSaving
              ? tLoading('status.saving')
              : tEdit('buttons.save')}
        </button>
      </div>

      {/* Add Content Modal */}
      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddContent={handleAddContent}
        currentContentCount={content.length}
      />

      {/* REQ-E05-024: Manual Edit Warning Dialog */}
      <ManualEditWarningDialog
        isOpen={showManualEditWarning}
        manuallyEditedLanguages={manuallyEditedLanguages}
        onKeepManual={handleKeepManualEdits}
        onOverwrite={handleOverwriteManualEdits}
        onCancel={handleCancelWarning}
        loading={isSaving}
        entityType="article"
      />
    </div>
  );
}
