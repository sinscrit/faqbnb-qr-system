'use client';

/**
 * PreviewSaveStep Component
 *
 * Step 7 of ItemCreationWorkflow - Preview and save captured content.
 * Displays content preview, allows item name editing, and handles save.
 *
 * @module ItemCreationWorkflow/components/steps/PreviewSaveStep
 * @see docs/REQ-106-preview-save-step-overview.md
 * @lastModified 2026-01-05 (REQ-108 Multi-Content Item Support)
 */

import { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, Loader2, RotateCcw, Plus } from 'lucide-react';
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
import type { CurrentItemState } from '../../ItemCreationWorkflow.types';
import { ItemNameEditor, ContentPieceCard, SortableContentPieceCard } from '../shared';
import { MAX_CONTENT_PIECES } from '../../utils/constants';

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
  const isRemovingLastPiece = pieceToRemove !== null && currentItem.content.length === 1;

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
    if (!activeId) return null;
    return currentItem.content.find(c => c.id === activeId) ?? null;
  }, [activeId, currentItem.content]);

  // Drag event handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = currentItem.content.findIndex(c => c.id === active.id);
    const newIndex = currentItem.content.findIndex(c => c.id === over.id);

    if (oldIndex >= 0 && newIndex >= 0) {
      onReorderContent(oldIndex, newIndex);
    }
  }, [currentItem.content, onReorderContent]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Accessibility announcements for screen readers
  const announcements: Announcements = useMemo(() => ({
    onDragStart({ active }) {
      const piece = currentItem.content.find(c => c.id === active.id);
      const position = currentItem.content.findIndex(c => c.id === active.id) + 1;
      const typeName = piece ? `${piece.type} content` : 'content piece';
      return `Picked up ${typeName}. Current position: ${position} of ${currentItem.content.length}. Use arrow keys to move.`;
    },
    onDragOver({ over }) {
      if (over) {
        const position = currentItem.content.findIndex(c => c.id === over.id) + 1;
        return `Over position ${position}`;
      }
      return undefined;
    },
    onDragEnd({ active, over }) {
      if (over && active.id !== over.id) {
        const piece = currentItem.content.find(c => c.id === active.id);
        const typeName = piece ? `${piece.type} content` : 'content piece';
        const newPosition = currentItem.content.findIndex(c => c.id === over.id) + 1;
        return `Dropped ${typeName}. New position: ${newPosition} of ${currentItem.content.length}`;
      }
      return 'Position unchanged.';
    },
    onDragCancel() {
      return 'Drag cancelled. Content returned to original position.';
    },
  }), [currentItem.content]);

  // Handle remove button click - show confirmation for last piece
  const handleRemoveClick = useCallback((contentId: string) => {
    if (currentItem.content.length === 1) {
      // Show confirmation for last piece
      setPieceToRemove(contentId);
    } else {
      // Remove immediately for non-last pieces
      onRemoveContent(contentId);
    }
  }, [currentItem.content.length, onRemoveContent]);

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
  const canSave = currentItem.content.length > 0 && currentItem.itemName.trim().length > 0;

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
          <ArrowLeft className="w-5 h-5 text-[#222222]" />
        </button>
        <h2 className="text-xl font-semibold text-[#222222]">
          Preview & Save
        </h2>
      </div>

      {/* Item Name Section */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[#222222]">Item Name</h3>
        </div>
        <ItemNameEditor
          value={currentItem.itemName}
          onChange={onUpdateItemName}
          disabled={isSaving}
          maxLength={100}
          placeholder="Enter item name"
        />
      </section>

      {/* Content Section */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[#222222]">
            Content ({currentItem.content.length} of {MAX_CONTENT_PIECES} pieces)
          </h3>
          {currentItem.content.length >= MAX_CONTENT_PIECES && (
            <span className="text-sm text-amber-600 font-medium">
              Maximum reached
            </span>
          )}
        </div>

        {currentItem.content.length === 0 ? (
          <EmptyContentState onAddContent={onRetake} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={[restrictToParentElement]}
            accessibility={{ announcements }}
          >
            <SortableContext
              items={currentItem.content.map(c => c.id)}
              strategy={rectSortingStrategy}
            >
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                role="list"
                aria-label="Content pieces - drag to reorder"
              >
                {currentItem.content.map((piece) => (
                  <SortableContentPieceCard
                    key={piece.id}
                    id={piece.id}
                    content={piece}
                    onRemove={handleRemoveClick}
                    onRetake={() => onRetake()}
                    disabled={isSaving}
                    totalCount={currentItem.content.length}
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
      </section>

      {/* Retake / Replace All Button */}
      {currentItem.content.length > 0 && (
        <button
          type="button"
          onClick={onRetake}
          disabled={isSaving}
          className={cn(
            'w-full py-3 border-2 border-gray-200 rounded-lg',
            'flex items-center justify-center gap-2',
            'text-[#222222] font-medium',
            'hover:border-gray-300 hover:bg-gray-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <RotateCcw className="w-5 h-5" aria-hidden="true" />
          Retake / Replace All
        </button>
      )}

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
