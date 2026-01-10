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
 * @lastModified 2026-01-10 (Plan-094 Phase 5 Redesign, REQ-175)
 */

import { useState, useCallback, useMemo } from 'react';
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
import type { CurrentItemState, ContentPiece } from '../../ItemCreationWorkflow.types';
import { ItemNameEditor, ContentPieceCard, SortableContentPieceCard } from '../shared';
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
  /** Callback when item name changes */
  onUpdateItemName: (name: string) => void;
  /** Callback to remove a content piece */
  onRemoveContent: (contentId: string) => void;
  /** Callback to reorder content pieces */
  onReorderContent: (fromIndex: number, toIndex: number) => void;
  /** Callback to retake/replace content - navigates back to content creation */
  onRetake: () => void;
  /** Callback when save is triggered */
  onSave: () => Promise<{ id: string; qrCodeUrl: string }>;
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
}

function EmptyContentState({ onAddContent }: EmptyContentStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <Plus className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
      <p className="text-[#717171] mb-4">No content added yet</p>
      <button
        type="button"
        onClick={onAddContent}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
      >
        Add Content
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
 * Displays pre-populated item metadata (room, type, purpose) as a
 * semantic definition list. All fields are read-only and use label constants
 * for consistent display. Uses <dl>/<dt>/<dd> for accessibility.
 *
 * @param room - Room type for the item
 * @param itemType - Item type category
 * @param purpose - Purpose/intent (nullable)
 * @returns Definition list with item metadata
 */
interface ItemDetailsDisplayProps {
  room: string;
  itemType: string;
  purpose: string | null;
}

function ItemDetailsDisplay({ room, itemType, purpose }: ItemDetailsDisplayProps) {
  // Get human-readable labels from constants
  const roomLabel = ROOM_LABELS[room as RoomTypeConst] || room;
  const itemTypeLabel = ITEM_TYPE_LABELS[itemType as ItemTypeConst] || itemType;
  const purposeLabel = purpose
    ? PURPOSE_LABELS[purpose as PurposeTypeConst]
    : 'Not specified';

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Room Field */}
      <div className="space-y-1">
        <dt className="text-sm font-medium text-[#717171]">Room</dt>
        <dd className="text-base text-[#222222] bg-gray-50 px-3 py-2 rounded-md">
          {roomLabel}
        </dd>
      </div>
      {/* Item Type Field */}
      <div className="space-y-1">
        <dt className="text-sm font-medium text-[#717171]">Item Type</dt>
        <dd className="text-base text-[#222222] bg-gray-50 px-3 py-2 rounded-md">
          {itemTypeLabel}
        </dd>
      </div>
      {/* Purpose Field */}
      <div className="space-y-1">
        <dt className="text-sm font-medium text-[#717171]">Purpose</dt>
        <dd className="text-base text-[#222222] bg-gray-50 px-3 py-2 rounded-md">
          {purposeLabel}
        </dd>
      </div>
    </dl>
  );
}

// =============================================================================
// ItemDetailsSection Sub-Component
// =============================================================================

interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  disabled?: boolean;
}

function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  disabled,
}: ItemDetailsSectionProps) {
  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-labelledby="item-details-heading"
    >
      <h3
        id="item-details-heading"
        className="text-lg font-medium text-[#222222] mb-4"
      >
        Item Details
      </h3>

      {/* Read-only metadata fields - displayed first for context */}
      <ItemDetailsDisplay
        room={currentItem.room}
        itemType={currentItem.itemType}
        purpose={currentItem.purpose}
      />

      {/* Editable Title - using existing ItemNameEditor */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-medium text-[#717171] mb-2">
          Article Title
        </label>
        <ItemNameEditor
          value={currentItem.itemName}
          onChange={onUpdateItemName}
          disabled={disabled}
          maxLength={100}
          placeholder="Enter article title"
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
            Content
          </h3>
          <span
            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
            aria-label={`${contentCount} content pieces`}
          >
            {contentCount}
          </span>
        </div>
        {contentCount >= maxContentPieces && (
          <span className="text-sm text-amber-600 font-medium">
            Maximum reached
          </span>
        )}
      </div>

      {/* Content grid with previews */}
      {contentCount === 0 ? (
        <EmptyContentState onAddContent={onAddMore} />
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
              aria-label="Content pieces - drag to reorder"
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
          Add More
        </button>
      )}
    </section>
  );
}

// =============================================================================
// SuccessOverlay Sub-Component
// =============================================================================

interface SuccessOverlayProps {
  itemName: string;
  qrCodeUrl: string;
  onContinue: () => void;
}

function SuccessOverlay({ itemName, qrCodeUrl, onContinue }: SuccessOverlayProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-[#00A699] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-white" aria-hidden="true" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#222222] mb-4">
          Item Saved!
        </h2>

        {/* QR Code */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg inline-block mb-4 shadow-sm">
          <img
            src={qrCodeUrl}
            alt={`QR code for ${itemName}`}
            className="w-40 h-40"
          />
          <p className="mt-2 text-sm font-medium text-[#222222]">
            {itemName}
          </p>
        </div>

        {/* Description */}
        <p className="text-[#717171] mb-8">
          Your item has been saved and is ready for your guests!
        </p>

        {/* Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="px-8 py-3 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          Continue
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
  onRemoveContent,
  onReorderContent,
  onRetake,
  onSave,
  onCancel,
  onComplete,
  isSaving = false,
  className,
}: PreviewSaveStepProps) {
  // Local state
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedResult, setSavedResult] = useState<{ id: string; qrCodeUrl: string } | null>(null);
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
  const announcements: Announcements = useMemo(() => ({
    onDragStart({ active }) {
      const piece = contentArray.find(c => c.id === active.id);
      const position = contentArray.findIndex(c => c.id === active.id) + 1;
      const typeName = piece ? `${piece.type} content` : 'content piece';
      return `Picked up ${typeName}. Current position: ${position} of ${contentArray.length}. Use arrow keys to move.`;
    },
    onDragOver({ over }) {
      if (over) {
        const position = contentArray.findIndex(c => c.id === over.id) + 1;
        return `Over position ${position}`;
      }
      return undefined;
    },
    onDragEnd({ active, over }) {
      if (over && active.id !== over.id) {
        const piece = contentArray.find(c => c.id === active.id);
        const typeName = piece ? `${piece.type} content` : 'content piece';
        const newPosition = contentArray.findIndex(c => c.id === over.id) + 1;
        return `Dropped ${typeName}. New position: ${newPosition} of ${contentArray.length}`;
      }
      return 'Position unchanged.';
    },
    onDragCancel() {
      return 'Drag cancelled. Content returned to original position.';
    },
  }), [contentArray]);

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

  // Handle save
  const handleSave = useCallback(async () => {
    setSaveError(null);
    try {
      const result = await onSave();
      setSavedResult(result);
      setShowSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save item');
    }
  }, [onSave]);

  // Handle continue after success
  const handleContinue = useCallback(() => {
    setShowSuccess(false);
    onComplete();
  }, [onComplete]);

  // Check if save button should be disabled
  const canSave = contentArray.length > 0 && currentItem?.itemName?.trim().length > 0;

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
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#222222]" aria-hidden="true" />
        </button>
        <h2 className="text-xl font-semibold text-[#222222]">
          Preview & Save
        </h2>
      </div>

      {/* Item Details Section with metadata */}
      <ItemDetailsSection
        currentItem={currentItem}
        onUpdateItemName={onUpdateItemName}
        disabled={isSaving}
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
            Dismiss
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
            Saving...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" aria-hidden="true" />
            Save Item
          </>
        )}
      </button>

      {/* Success Overlay */}
      {showSuccess && savedResult && (
        <SuccessOverlay
          itemName={currentItem.itemName}
          qrCodeUrl={savedResult.qrCodeUrl}
          onContinue={handleContinue}
        />
      )}

      {/* Screen Reader Announcements */}
      <div aria-live="polite" className="sr-only">
        {showSuccess && 'Item saved successfully'}
        {saveError && `Error: ${saveError}`}
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
              Remove Last Content?
            </h3>
            <p className="text-[#717171] mb-6">
              This is the only piece of content. Removing it will leave this item empty.
              Are you sure you want to remove it?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelRemove}
                className="px-4 py-2 text-[#222222] border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewSaveStep;
