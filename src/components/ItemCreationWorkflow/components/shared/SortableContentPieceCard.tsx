'use client';

/**
 * SortableContentPieceCard Component
 *
 * Wrapper that integrates ContentPieceCard with @dnd-kit's useSortable hook
 * to enable drag-and-drop reordering of content pieces.
 *
 * @module ItemCreationWorkflow/components/shared/SortableContentPieceCard
 * @see docs/REQ-108-multi-content-item-support-detailed.md
 * @lastModified 2026-01-05
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContentPieceCard } from './ContentPieceCard';
import type { ContentPiece } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

export interface SortableContentPieceCardProps {
  /** Unique ID for sortable context (typically content.id) */
  id: string;
  /** Content piece data */
  content: ContentPiece;
  /** Callback when remove button is clicked */
  onRemove?: (id: string) => void;
  /** Callback when retake button is clicked */
  onRetake?: (id: string) => void;
  /** Whether interactions are disabled (e.g., during save) */
  disabled?: boolean;
  /** Total count of content pieces (for determining if drag handle shows) */
  totalCount: number;
}

// =============================================================================
// Component
// =============================================================================

/**
 * SortableContentPieceCard wraps ContentPieceCard with drag-and-drop capabilities.
 * Uses @dnd-kit's useSortable hook for consistent drag behavior.
 */
export function SortableContentPieceCard({
  id,
  content,
  onRemove,
  onRetake,
  disabled = false,
  totalCount,
}: SortableContentPieceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  // Only show drag handle when there's more than one content piece
  const showDragHandle = totalCount > 1 && !disabled;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <ContentPieceCard
        content={content}
        onRemove={onRemove}
        onRetake={onRetake}
        disabled={disabled}
        showDragHandle={showDragHandle}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

export default SortableContentPieceCard;
