'use client';

/**
 * PreviewSaveStep Component
 *
 * Step 7 of ItemCreationWorkflow - Preview and save captured content.
 *
 * Redesigned in Plan-094 to show:
 * - Item Details section with pre-populated fields (title editable, room/type/purpose read-only)
 * - Content section with actual previews using ContentPreview component
 * - Small "+ Add More" link instead of large CTAs
 * - Content count badge
 * - Drag-to-reorder capability with keyboard support
 *
 * Key Changes (Plan-094):
 * - Removed large "Add Media" / "Add Link" buttons
 * - Added pre-populated fields from user selections
 * - Integrated ContentPreview for actual content display
 * - Simplified visual hierarchy to prioritize review over adding
 *
 * @module ItemCreationWorkflow/components/steps/PreviewSaveStep
 * @see docs/REQ-106-preview-save-step-overview.md (original)
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 5
 * @see docs/REQ-210-update-previewsavestep-display-detailed.md
 * @lastModified 2026-01-22 (REQ-E02-064 i18n Integration)
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Check, Loader2, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  type Announcements,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import type { TranslationFn } from '@/types/i18n';
import type { CurrentItemState, ContentPiece, RoomType, ItemType } from '../../ItemCreationWorkflow.types';
import { ItemNameEditor, ContentPieceCard, SortableContentPieceCard, TagsEditor } from '../shared';
import {
  MAX_CONTENT_PIECES,
  ROOM_LABELS,
  ITEM_TYPE_LABELS,
  PURPOSE_LABELS,
  type RoomTypeConst,
  type ItemTypeConst,
  type PurposeTypeConst,
} from '../../utils/constants';

// =============================================================================
// Types
// =============================================================================

export interface PreviewSaveStepProps {
  /** Current item state from workflow */
  currentItem: CurrentItemState;
  /** Callback when physical item name changes (for QR code label) */
  onUpdateItemName: (name: string) => void;
  /** Callback when item description changes */
  onUpdateItemDescription?: (description: string) => void;
  /** Callback when article title changes (optional) (REQ-210) */
  onUpdateArticleTitle?: (title: string) => void;
  /** Callback when room changes */
  onUpdateRoom?: (room: RoomType) => void;
  /** Callback when item type changes */
  onUpdateItemType?: (itemType: ItemType) => void;
  /** Callback when tags change (REQ-177) */
  onUpdateTags: (tags: string[]) => void;
  /** Callback to remove a content piece */
  onRemoveContent: (contentId: string) => void;
  /** Callback to reorder content pieces */
  onReorderContent: (fromIndex: number, toIndex: number) => void;
  /** Callback to retake/replace content - navigates back to content creation */
  onRetake: () => void;
  /** Callback when save is triggered. Returns QR code info and optionally the clean item name. */
  onSave: () => Promise<{ id: string; qrCodeUrl: string; itemName?: string }>;
  /** Callback when user cancels (goes back) */
  onCancel: () => void;
  /** Callback when save completes and user continues */
  onComplete: () => void;
  /** Whether save operation is in progress */
  isSaving?: boolean;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// EmptyContentState Sub-Component
// =============================================================================

interface EmptyContentStateProps {
  onAddContent: () => void;
  /** Translation function for preview namespace (REQ-E02-064) */
  t: TranslationFn;
}

function EmptyContentState({ onAddContent, t }: EmptyContentStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <Plus className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
      <p className="text-[#717171] mb-4">{t('empty.message')}</p>
      <button
        type="button"
        onClick={onAddContent}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
      >
        {t('empty.addButton')}
      </button>
    </div>
  );
}

// =============================================================================
// ItemDetailsDisplay Sub-Component (Accessible Definition List)
// =============================================================================

/**
 * ItemDetailsDisplay - Read-only metadata display
 *
 * Displays pre-populated item metadata (room, type) as a
 * semantic definition list. All fields are read-only and use label constants
 * for consistent display. Uses <dl>/<dt>/<dd> for accessibility.
 *
 * @param room - Room type for the item
 * @param itemType - Item type category
 * @returns Definition list with item metadata
 */
interface ItemDetailsDisplayProps {
  room: string;
  itemType: string;
  onUpdateRoom?: (room: RoomType) => void;
  onUpdateItemType?: (itemType: ItemType) => void;
  disabled?: boolean;
  /** Translation function for preview namespace (REQ-E02-064) */
  t: TranslationFn;
}

function ItemDetailsDisplay({ room, itemType, onUpdateRoom, onUpdateItemType, disabled, t }: ItemDetailsDisplayProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Room Dropdown */}
      <div className="space-y-2">
        <label htmlFor="room-select" className="block text-sm font-medium text-[#222222]">
          {t('details.roomLabel')}
        </label>
        <select
          id="room-select"
          value={room}
          onChange={(e) => onUpdateRoom?.(e.target.value as RoomType)}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg',
            'min-h-[48px]',
            'text-base text-[#222222]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#222222]',
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          )}
        >
          {Object.entries(ROOM_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      {/* Item Type Dropdown */}
      <div className="space-y-2">
        <label htmlFor="item-type-select" className="block text-sm font-medium text-[#222222]">
          {t('details.itemTypeLabel')}
        </label>
        <select
          id="item-type-select"
          value={itemType}
          onChange={(e) => onUpdateItemType?.(e.target.value as ItemType)}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg',
            'min-h-[48px]',
            'text-base text-[#222222]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#222222]',
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          )}
        >
          {Object.entries(ITEM_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// =============================================================================
// ItemDetailsSection Sub-Component
// =============================================================================

interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  /** Callback when physical item name changes (QR code label) */
  onUpdateItemName: (name: string) => void;
  /** Callback when item description changes */
  onUpdateItemDescription?: (description: string) => void;
  /** Callback when article title changes (optional, defaults to derived from purpose) */
  onUpdateArticleTitle?: (title: string) => void;
  /** Callback when room changes */
  onUpdateRoom?: (room: RoomType) => void;
  /** Callback when item type changes */
  onUpdateItemType?: (itemType: ItemType) => void;
  /** Callback when tags change */
  onUpdateTags: (tags: string[]) => void;
  disabled?: boolean;
  /** Translation function for preview namespace (REQ-E02-064) */
  t: TranslationFn;
}

function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  onUpdateItemDescription,
  onUpdateArticleTitle,
  onUpdateRoom,
  onUpdateItemType,
  onUpdateTags,
  disabled,
  t,
}: ItemDetailsSectionProps) {
  // Derive article title from purpose (REQ-210)
  // Default to purpose label + item name format
  const purposeLabel = currentItem.purpose
    ? PURPOSE_LABELS[currentItem.purpose as PurposeTypeConst]
    : '';
  const defaultArticleTitle = purposeLabel && currentItem.specificItem
    ? `${purposeLabel} - ${currentItem.specificItem}`
    : purposeLabel || 'Guides';
  const articleTitle = currentItem.currentArticle?.title || defaultArticleTitle;

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-label="Item details form"
    >
      {/* Item Name field - first field */}
      <div className="mb-4">
        <ItemNameEditor
          value={currentItem.specificItem}
          onChange={onUpdateItemName}
          disabled={disabled}
          maxLength={50}
          placeholder={t('details.itemNamePlaceholder')}
        />
      </div>

      {/* Item Description field */}
      <div className="mb-4">
        <label
          htmlFor="item-description-editor"
          className="block text-sm font-medium text-[#222222] mb-2"
        >
          {t('details.itemDescriptionLabel')}
        </label>
        <textarea
          id="item-description-editor"
          value={currentItem.itemDescription || ''}
          onChange={(e) => onUpdateItemDescription?.(e.target.value)}
          disabled={disabled}
          maxLength={500}
          rows={3}
          placeholder={t('details.itemDescriptionPlaceholder')}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg',
            'text-base text-[#222222] placeholder:text-[#717171]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#222222]',
            'resize-none',
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          )}
        />
      </div>

      {/* Room and Item Type dropdowns */}
      <div className="mb-4">
        <ItemDetailsDisplay
          room={currentItem.room}
          itemType={currentItem.itemType}
          onUpdateRoom={onUpdateRoom}
          onUpdateItemType={onUpdateItemType}
          disabled={disabled}
          t={t}
        />
      </div>

      {/* Guide/Article Title field - editable */}
      <div className="mb-4">
        <label
          htmlFor="article-title-editor"
          className="block text-sm font-medium text-[#222222] mb-2"
        >
          {t('details.articleTitleLabel')}
        </label>
        <input
          id="article-title-editor"
          type="text"
          value={articleTitle}
          onChange={(e) => onUpdateArticleTitle?.(e.target.value)}
          disabled={disabled}
          maxLength={100}
          placeholder={t('details.articleTitlePlaceholder')}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg',
            'min-h-[48px]',
            'text-base text-[#222222] placeholder:text-[#717171]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#222222]',
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          )}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-[#717171] mb-2">
          {t('details.tagsLabel')}
        </label>
        <TagsEditor
          selectedTags={currentItem.tags || []}
          onTagsChange={onUpdateTags}
          disabled={disabled}
          maxTags={10}
        />
      </div>
    </section>
  );
}

// =============================================================================
// ContentSection Sub-Component
// =============================================================================

interface ContentSectionProps {
  content: ContentPiece[];
  sensors: ReturnType<typeof useSensors>;
  activeId: string | null;
  activeContent: ContentPiece | null;
  announcements: Announcements;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  onRemoveContent: (contentId: string) => void;
  onRetake: () => void;
  onAddMore: () => void;
  maxContentPieces: number;
  disabled?: boolean;
  /** Translation function for preview namespace (REQ-E02-064) */
  t: TranslationFn;
}

function ContentSection({
  content,
  sensors,
  activeId,
  activeContent,
  announcements,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onRemoveContent,
  onRetake,
  onAddMore,
  maxContentPieces,
  disabled,
  t,
}: ContentSectionProps) {
  const contentCount = content.length;
  const canAddMore = contentCount < maxContentPieces;

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-labelledby="content-section-heading"
    >
      {/* Header with count badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3
            id="content-section-heading"
            className="text-lg font-medium text-[#222222]"
          >
            {t('content.title')}
          </h3>
          <span
            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
            aria-label={t('content.countLabel', { count: contentCount })}
          >
            {contentCount}
          </span>
        </div>
        {contentCount >= maxContentPieces && (
          <span className="text-sm text-amber-600 font-medium">
            {t('content.maxReached')}
          </span>
        )}
      </div>

      {/* Content grid with previews */}
      {contentCount === 0 ? (
        <EmptyContentState onAddContent={onAddMore} t={t} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
          modifiers={[restrictToParentElement]}
          accessibility={{ announcements }}
        >
          <SortableContext
            items={content.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              role="list"
              aria-label={t('content.dragHint')}
            >
              {content.map((piece) => (
                <SortableContentPieceCard
                  key={piece.id}
                  id={piece.id}
                  content={piece}
                  onRemove={onRemoveContent}
                  onRetake={onRetake}
                  disabled={disabled}
                  totalCount={contentCount}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay - floating preview during drag */}
          <DragOverlay>
            {activeContent && (
              <ContentPieceCard
                content={activeContent}
                className="shadow-xl ring-2 ring-[#FF385C] rotate-2 scale-105"
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Small "+ Add More" link - de-emphasized compared to old large button */}
      {canAddMore && contentCount > 0 && (
        <button
          type="button"
          onClick={onAddMore}
          disabled={disabled}
          className={cn(
            'mt-4 text-sm text-[#FF385C] hover:text-[#E31C5F]',
            'focus:outline-none focus:underline focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center gap-1'
          )}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('content.addMore')}
        </button>
      )}
    </section>
  );
}

// =============================================================================
// SuccessOverlay Sub-Component
// =============================================================================

/**
 * SuccessOverlay Sub-Component
 *
 * Displays the success state after saving an item, showing:
 * - Success confirmation icon
 * - Generated QR code image
 * - Physical item name as QR label
 * - Continue button to proceed to next step
 *
 * IMPORTANT (REQ-211): The itemName displayed is the physical item name
 * (e.g., "Cabinets"), NOT an article title (e.g., "How to Clean - Cabinets").
 * QR codes represent physical Items that can have multiple Articles.
 * Scanning the QR code leads to the Item landing page showing all Articles.
 *
 * @see docs/REQ-211-update-qr-code-generation-overview.md
 */
interface SuccessOverlayProps {
  /**
   * Physical item name to display as QR label.
   * Should be the item identity (e.g., "Cabinets", "Fridge"),
   * not an article title (e.g., "How to Clean").
   */
  itemName: string;
  /** Base64 data URL of the generated QR code image */
  qrCodeUrl: string;
  /** Callback when user clicks Continue button */
  onContinue: () => void;
  /** Translation function for preview namespace (REQ-E02-064) */
  t: TranslationFn;
}

function SuccessOverlay({ itemName, qrCodeUrl, onContinue, t }: SuccessOverlayProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-[#00A699] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-white" aria-hidden="true" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#222222] mb-4">
          {t('success.title')}
        </h2>

        {/* QR Code */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg inline-block mb-4 shadow-sm">
          <img
            src={qrCodeUrl}
            alt={t('success.qrAlt', { itemName })}
            className="w-40 h-40"
          />
          <p className="mt-2 text-sm font-medium text-[#222222]">
            {itemName}
          </p>
        </div>

        {/* Description */}
        <p className="text-[#717171] mb-8">
          {t('success.message')}
        </p>

        {/* Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="px-8 py-3 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          {t('success.continueButton')}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PreviewSaveStep({
  currentItem,
  onUpdateItemName,
  onUpdateItemDescription,  // New: callback for item description changes
  onUpdateArticleTitle,  // REQ-210: Optional callback for article title changes
  onUpdateRoom,  // Callback for room changes
  onUpdateItemType,  // Callback for item type changes
  onUpdateTags,
  onRemoveContent,
  onReorderContent,
  onRetake,
  onSave,
  onCancel,
  onComplete,
  isSaving = false,
  className,
}: PreviewSaveStepProps) {
  // Translation hooks (REQ-E02-064)
  const t = useTranslations('workflow.steps.preview');
  const tCommon = useTranslations('common');
  const tNotifications = useTranslations('common.notifications');
  const tLoading = useTranslations('common.loading');

  // Local state
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedResult, setSavedResult] = useState<{ id: string; qrCodeUrl: string; itemName: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Removal confirmation state
  const [pieceToRemove, setPieceToRemove] = useState<string | null>(null);
  const isRemovingLastPiece = pieceToRemove !== null && currentItem?.content?.length === 1;

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for mouse, touch, and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get active content piece for drag overlay
  const activeContent = useMemo(() => {
    if (!activeId || !currentItem?.content) return null;
    return currentItem.content.find(c => c.id === activeId) ?? null;
  }, [activeId, currentItem?.content]);

  // Drag event handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !currentItem?.content) return;

    const oldIndex = currentItem.content.findIndex(c => c.id === active.id);
    const newIndex = currentItem.content.findIndex(c => c.id === over.id);

    if (oldIndex >= 0 && newIndex >= 0) {
      onReorderContent(oldIndex, newIndex);
    }
  }, [currentItem?.content, onReorderContent]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Accessibility announcements for screen readers
  const contentArray = currentItem?.content ?? [];
  // DnD announcements for screen readers (REQ-E02-064)
  const announcements: Announcements = useMemo(() => ({
    onDragStart({ active }) {
      const piece = contentArray.find(c => c.id === active.id);
      const position = contentArray.findIndex(c => c.id === active.id) + 1;
      const typeName = piece
        ? t('dnd.contentType', { type: piece.type })
        : t('dnd.contentPiece');
      return t('dnd.pickedUp', { typeName, position, total: contentArray.length });
    },
    onDragOver({ over }) {
      if (over) {
        const position = contentArray.findIndex(c => c.id === over.id) + 1;
        return t('dnd.overPosition', { position });
      }
      return undefined;
    },
    onDragEnd({ active, over }) {
      if (over && active.id !== over.id) {
        const piece = contentArray.find(c => c.id === active.id);
        const typeName = piece
          ? t('dnd.contentType', { type: piece.type })
          : t('dnd.contentPiece');
        const newPosition = contentArray.findIndex(c => c.id === over.id) + 1;
        return t('dnd.dropped', { typeName, position: newPosition, total: contentArray.length });
      }
      return t('dnd.unchanged');
    },
    onDragCancel() {
      return t('dnd.cancelled');
    },
  }), [contentArray, t]);

  // Handle remove button click - show confirmation for last piece
  const handleRemoveClick = useCallback((contentId: string) => {
    if (contentArray.length === 1) {
      // Show confirmation for last piece
      setPieceToRemove(contentId);
    } else {
      // Remove immediately for non-last pieces
      onRemoveContent(contentId);
    }
  }, [contentArray.length, onRemoveContent]);

  // Handle confirmation of last piece removal
  const handleConfirmRemove = useCallback(() => {
    if (pieceToRemove) {
      onRemoveContent(pieceToRemove);
      setPieceToRemove(null);
    }
  }, [pieceToRemove, onRemoveContent]);

  // Handle cancel of removal
  const handleCancelRemove = useCallback(() => {
    setPieceToRemove(null);
  }, []);

  /**
   * Handle save button click.
   * Calls onSave() and displays success overlay with QR code.
   *
   * REQ-211: Uses clean item name for QR code label:
   * 1. Prefers result.itemName from save operation (already cleaned)
   * 2. Falls back to currentItem.specificItem (physical item name)
   * 3. Last resort: currentItem.itemName or 'Item'
   */
  const handleSave = useCallback(async () => {
    // Fallback item name if result doesn't provide one
    const fallbackItemName = currentItem?.specificItem || currentItem?.itemName || 'Item';
    setSaveError(null);
    try {
      const result = await onSave();
      setSavedResult({
        ...result,
        // REQ-211: Prefer clean item name from save result, fall back to specificItem
        itemName: result.itemName || fallbackItemName
      });
      setShowSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save item');
    }
  }, [onSave, currentItem?.specificItem, currentItem?.itemName]);

  // Handle continue after success
  const handleContinue = useCallback(() => {
    setShowSuccess(false);
    onComplete();
  }, [onComplete]);

  // Check if save button should be disabled
  // REQ-210: Use specificItem for validation (physical item name)
  const canSave = contentArray.length > 0 &&
    (currentItem?.specificItem?.trim().length > 0 || currentItem?.itemName?.trim().length > 0);

  // If showing success overlay, only render that (currentItem is null after save)
  if (showSuccess && savedResult) {
    return (
      <div className={cn('flex flex-col gap-6 p-6', className)}>
        <SuccessOverlay
          itemName={savedResult.itemName}
          qrCodeUrl={savedResult.qrCodeUrl}
          onContinue={handleContinue}
          t={t}
        />
      </div>
    );
  }

  // Guard: If currentItem is null (e.g., after save and returning from What's Next),
  // show a message instead of crashing. This can happen if the workflow state isn't
  // properly restored when navigating back to this step.
  if (!currentItem) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4 p-6 min-h-[300px]', className)}>
        <p className="text-[#717171] text-center">
          {t('errors.noItemData')}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          {tCommon('actions.goBack')}
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={cn(
            'p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={t('header.backAriaLabel')}
        >
          <ArrowLeft className="w-5 h-5 text-[#222222]" aria-hidden="true" />
        </button>
        <h2 className="text-xl font-semibold text-[#222222]">
          {t('header.title')}
        </h2>
      </div>

      {/* Item Details Section with metadata (REQ-210: Separate Item/Article fields) */}
      <ItemDetailsSection
        currentItem={currentItem}
        onUpdateItemName={onUpdateItemName}
        onUpdateItemDescription={onUpdateItemDescription}
        onUpdateArticleTitle={onUpdateArticleTitle}
        onUpdateRoom={onUpdateRoom}
        onUpdateItemType={onUpdateItemType}
        onUpdateTags={onUpdateTags}
        disabled={isSaving}
        t={t}
      />

      {/* Content Section with count badge and small add more link */}
      <ContentSection
        content={contentArray}
        sensors={sensors}
        activeId={activeId}
        activeContent={activeContent}
        announcements={announcements}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        onRemoveContent={handleRemoveClick}
        onRetake={onRetake}
        onAddMore={onRetake}
        maxContentPieces={MAX_CONTENT_PIECES}
        disabled={isSaving}
        t={t}
      />

      {/* Error Display */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{saveError}</p>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="mt-2 text-red-700 underline text-sm hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            {tCommon('actions.dismiss')}
          </button>
        </div>
      )}

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !canSave}
        className={cn(
          'w-full py-4 rounded-lg font-semibold text-lg',
          'flex items-center justify-center gap-2',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
          isSaving
            ? 'bg-[#FF385C]/70 text-white cursor-wait'
            : 'bg-[#FF385C] text-white hover:bg-[#E31C5F]',
          !canSave && !isSaving && 'bg-gray-300 cursor-not-allowed hover:bg-gray-300'
        )}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            {t('buttons.saving')}
          </>
        ) : (
          <>
            <Check className="w-5 h-5" aria-hidden="true" />
            {t('buttons.saveItem')}
          </>
        )}
      </button>

      {/* Screen Reader Announcements (REQ-E02-064) */}
      <div aria-live="polite" className="sr-only">
        {showSuccess && t('announcements.saved')}
        {saveError && t('announcements.error', { error: saveError })}
      </div>

      {/* Last Piece Removal Confirmation Dialog */}
      {isRemovingLastPiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-confirm-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-sm mx-4 p-6">
            <h3
              id="remove-confirm-title"
              className="text-lg font-semibold text-[#222222] mb-2"
            >
              {t('dialogs.removeLastContent.title')}
            </h3>
            <p className="text-[#717171] mb-6">
              {t('dialogs.removeLastContent.message')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelRemove}
                className="px-4 py-2 text-[#222222] border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              >
                {t('dialogs.removeLastContent.keepButton')}
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {t('dialogs.removeLastContent.removeButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewSaveStep;
