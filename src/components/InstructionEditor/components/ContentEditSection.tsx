'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type Announcements,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Plus } from 'lucide-react';
import { SortableContentPieceCard, ContentPieceCard } from '@/components/ItemCreationWorkflow/components/shared';
import type { ContentPiece } from '@/components/ItemCreationWorkflow/ItemCreationWorkflow.types';
import type { ContentPieceState } from '../InstructionEditor.types';

export interface ContentEditSectionProps {
  content: ContentPieceState[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  onAddContent: () => void;
  disabled?: boolean;
}

/**
 * Helper function to convert ContentPieceState to ContentPiece format for card rendering
 * REQ-262: Added debug logging to trace type handling
 */
function toContentPiece(piece: ContentPieceState): ContentPiece {
  // Create the appropriate ContentData based on type
  let data: any;

  if (process.env.NODE_ENV === 'development') {
    console.log('[REQ-262] toContentPiece: Converting piece', piece.id, 'with type:', piece.type);
  }

  if (piece.type === 'text') {
    // For text content, decode from data URL if needed
    let textContent = piece.url;
    if (textContent.startsWith('data:text/plain;base64,')) {
      try {
        textContent = atob(textContent.substring('data:text/plain;base64,'.length));
      } catch (e) {
        textContent = '';
      }
    }
    data = { type: 'text', text: textContent };
  } else if (piece.type === 'url') {
    data = {
      type: 'url',
      url: piece.url,
      title: piece.title,
      thumbnailUrl: piece.thumbnailUrl || undefined,
    };
  } else if (piece.type === 'video') {
    data = {
      type: 'video',
      file: piece.file || new Blob(),
      url: piece.url,
      title: piece.title,
      thumbnailUrl: piece.thumbnailUrl || undefined,
    };
  } else if (piece.type === 'photo') {
    data = {
      type: 'photo',
      file: piece.file || new Blob(),
      url: piece.url,
      thumbnailUrl: piece.thumbnailUrl || undefined,
    };
  } else if (piece.type === 'pdf') {
    data = {
      type: 'pdf',
      file: piece.file || new Blob(),
      url: piece.url,
      title: piece.title,
    };
  } else {
    // Fallback to URL type
    data = { type: 'url', url: piece.url, title: piece.title };
  }

  return {
    id: piece.id,
    type: piece.type,
    data,
    order: piece.displayOrder,
  };
}

/**
 * ContentEditSection displays the editable content list with drag-to-reorder functionality
 * Reuses SortableContentPieceCard and DndKit patterns from PreviewSaveStep
 */
export function ContentEditSection({
  content,
  onReorder,
  onRemove,
  onAddContent,
  disabled = false,
}: ContentEditSectionProps) {
  const t = useTranslations('articles.content');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pieceToRemove, setPieceToRemove] = useState<string | null>(null);

  // Configure sensors for drag and drop
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
    const piece = content.find(c => c.id === activeId);
    return piece ? toContentPiece(piece) : null;
  }, [activeId, content]);

  // Drag event handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = content.findIndex(c => c.id === active.id);
    const newIndex = content.findIndex(c => c.id === over.id);

    if (oldIndex >= 0 && newIndex >= 0) {
      onReorder(oldIndex, newIndex);
    }
  }, [content, onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Accessibility announcements for screen readers
  const announcements: Announcements = useMemo(() => ({
    onDragStart({ active }) {
      const piece = content.find(c => c.id === active.id);
      const position = content.findIndex(c => c.id === active.id) + 1;
      const typeName = piece ? piece.type : 'content';
      return t('aria.pickedUp', { type: typeName, position, total: content.length });
    },
    onDragOver({ over }) {
      if (over) {
        const position = content.findIndex(c => c.id === over.id) + 1;
        return t('aria.overPosition', { position });
      }
      return undefined;
    },
    onDragEnd({ active, over }) {
      if (over && active.id !== over.id) {
        const piece = content.find(c => c.id === active.id);
        const typeName = piece ? piece.type : 'content';
        const newPosition = content.findIndex(c => c.id === over.id) + 1;
        return t('aria.dropped', { type: typeName, position: newPosition, total: content.length });
      }
      return t('aria.unchanged');
    },
    onDragCancel() {
      return t('aria.cancelled');
    },
  }), [content, t]);

  // Handle remove button click - show confirmation for last piece
  const handleRemoveClick = useCallback((contentId: string) => {
    if (content.length === 1) {
      // Show confirmation for last piece
      setPieceToRemove(contentId);
    } else {
      // Remove immediately for non-last pieces
      onRemove(contentId);
    }
  }, [content.length, onRemove]);

  // Confirm removal of last piece
  const handleConfirmRemove = useCallback(() => {
    if (pieceToRemove) {
      onRemove(pieceToRemove);
      setPieceToRemove(null);
    }
  }, [pieceToRemove, onRemove]);

  // Cancel removal
  const handleCancelRemove = useCallback(() => {
    setPieceToRemove(null);
  }, []);

  return (
    <>
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#222222]">
            {t('title')}
            <span className="ml-2 text-sm font-normal text-[#717171]">
              {t('count', { count: content.length })}
            </span>
          </h2>
        </div>

        {/* Content Grid with Drag-and-Drop */}
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
            items={content.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              role="list"
              aria-label={t('aria.dragToReorder')}
            >
              {content.map((piece) => (
                <SortableContentPieceCard
                  key={piece.id}
                  id={piece.id}
                  content={toContentPiece(piece)}
                  onRemove={handleRemoveClick}
                  disabled={disabled}
                  totalCount={content.length}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay modifiers={[restrictToParentElement]}>
            {activeContent && (
              <ContentPieceCard
                content={activeContent}
                className="shadow-xl ring-2 ring-[#FF385C] rotate-2 scale-105"
              />
            )}
          </DragOverlay>
        </DndContext>

        {/* Add Content Button */}
        <button
          type="button"
          onClick={onAddContent}
          disabled={disabled}
          className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span>{t('addContent')}</span>
        </button>
      </section>

      {/* Confirmation Dialog for Last Piece Removal */}
      {pieceToRemove && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-dialog-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3
              id="remove-dialog-title"
              className="text-lg font-semibold text-[#222222] mb-3"
            >
              {t('removeDialog.title')}
            </h3>
            <p className="text-[#717171] mb-6">
              {t('removeDialog.message')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelRemove}
                className="px-4 py-2 border border-gray-300 rounded-lg text-[#222222] hover:bg-gray-50 transition-colors"
              >
                {t('removeDialog.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
              >
                {t('removeDialog.remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
