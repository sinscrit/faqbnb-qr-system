'use client';

/**
 * SortableAssetList Component
 *
 * Provides drag-and-drop reordering for assets in the AssetPanel.
 * Uses @dnd-kit for cross-platform support including:
 * - Mouse drag (desktop)
 * - Touch drag with long-press activation (mobile)
 * - Keyboard navigation (Space to pick up, Arrows to move, Space to drop)
 *
 * @module ItemManager/components/AssetPanel/SortableAssetList
 * @see docs/REQ-084-add-drag-and-drop-reordering-detailed.md
 * @lastModified 2026-01-03 (REQ-084 Tasks 4-5)
 *
 * @example
 * <SortableAssetList
 *   assets={assets}
 *   onReorder={(from, to) => dispatch({ type: 'REORDER_ASSETS', payload: { fromIndex: from, toIndex: to } })}
 *   onRemove={(id) => dispatch({ type: 'REMOVE_ASSET', payload: id })}
 * />
 */

import { useState, useCallback, useMemo } from 'react';
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { AssetItem } from './AssetItem';
import type { MediaItem } from '@/components/ItemCapture';
import type {
  SortableAssetListProps,
  SortableAssetItemProps,
  PendingAsset,
} from '../../ItemManager.types';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get display name for an asset (for accessibility announcements).
 */
function getAssetName(asset: MediaItem | PendingAsset | undefined): string {
  if (!asset) return 'item';
  if ('metadata' in asset && asset.metadata?.originalFilename) {
    return asset.metadata.originalFilename;
  }
  if ('file' in asset && asset.file) {
    return asset.file.name;
  }
  return `${asset.type} item`;
}

// =============================================================================
// SortableAssetItem Component
// =============================================================================

/**
 * Wrapper component that makes an AssetItem sortable via drag-and-drop.
 * Handles CSS transforms, drag state, and passes drag listeners to the drag handle.
 */
function SortableAssetItem({
  asset,
  id,
  index,
  onRemove,
  onRestore,
  isPending,
  isMarkedForRemoval,
  totalCount,
  draggableCount,
}: SortableAssetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isMarkedForRemoval,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  // Only show drag handle when there's more than one draggable item
  const showDragHandle = draggableCount > 1 && !isMarkedForRemoval;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      role="listitem"
    >
      <AssetItem
        asset={asset}
        index={index}
        onRemove={onRemove}
        onRestore={onRestore}
        isPending={isPending}
        isMarkedForRemoval={isMarkedForRemoval}
        showDragHandle={showDragHandle}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

// =============================================================================
// SortableAssetList Component
// =============================================================================

/**
 * SortableAssetList provides drag-and-drop reordering for assets in the AssetPanel.
 */
export function SortableAssetList({
  assets,
  onReorder,
  onRemove,
  onRestore,
  isPendingAddition,
  isPendingRemoval,
  markedForRemovalIds = new Set(),
  className,
}: SortableAssetListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for mouse, touch, and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press for touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate draggable asset count (excluding marked for removal)
  const draggableCount = useMemo(() => {
    return assets.filter((a) => !markedForRemovalIds.has(a.id)).length;
  }, [assets, markedForRemovalIds]);

  // Get array of draggable IDs for SortableContext
  const draggableIds = useMemo(() => {
    return assets
      .filter((a) => !markedForRemovalIds.has(a.id))
      .map((a) => a.id);
  }, [assets, markedForRemovalIds]);

  // Accessibility announcements for screen readers
  const announcements: Announcements = useMemo(() => ({
    onDragStart({ active }) {
      const asset = assets.find((a) => a.id === active.id);
      const position = assets.findIndex((a) => a.id === active.id) + 1;
      const name = getAssetName(asset);
      return `Picked up ${name}. Current position: ${position} of ${assets.length}. Use arrow keys to move.`;
    },
    onDragOver({ active, over }) {
      if (over) {
        const overIndex = assets.findIndex((a) => a.id === over.id) + 1;
        return `Over position ${overIndex}`;
      }
      return undefined;
    },
    onDragEnd({ active, over }) {
      if (over && active.id !== over.id) {
        const asset = assets.find((a) => a.id === active.id);
        const name = getAssetName(asset);
        const newPosition = assets.findIndex((a) => a.id === over.id) + 1;
        return `Dropped ${name}. New position: ${newPosition} of ${assets.length}`;
      }
      const asset = assets.find((a) => a.id === active.id);
      const name = getAssetName(asset);
      return `${name} dropped. Position unchanged.`;
    },
    onDragCancel({ active }) {
      const asset = assets.find((a) => a.id === active.id);
      const name = getAssetName(asset);
      return `Drag cancelled. ${name} returned to original position.`;
    },
  }), [assets]);

  // Event handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return; // No action needed
    }

    const oldIndex = assets.findIndex((a) => a.id === active.id);
    const newIndex = assets.findIndex((a) => a.id === over.id);

    // Bounds checking
    if (oldIndex < 0 || newIndex < 0) {
      console.warn('Invalid reorder indices:', { oldIndex, newIndex });
      return;
    }

    onReorder(oldIndex, newIndex);
  }, [assets, onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Get active asset for drag overlay
  const activeAsset = activeId
    ? assets.find((a) => a.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{ announcements }}
    >
      <SortableContext
        items={draggableIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          role="list"
          aria-label="Reorderable asset list"
          className={cn('space-y-2', className)}
        >
          {assets.map((asset, index) => {
            const isMarkedForRemoval = markedForRemovalIds.has(asset.id);
            const isPending = isPendingAddition?.(asset.id) ?? false;

            return (
              <SortableAssetItem
                key={asset.id}
                id={asset.id}
                asset={asset}
                index={index}
                onRemove={onRemove}
                onRestore={onRestore}
                isPending={isPending}
                isMarkedForRemoval={isMarkedForRemoval}
                totalCount={assets.length}
                draggableCount={draggableCount}
              />
            );
          })}
        </div>
      </SortableContext>

      {/* Drag Overlay - the floating preview of the dragged item */}
      <DragOverlay>
        {activeAsset ? (
          <AssetItem
            asset={activeAsset}
            index={-1}
            onRemove={() => {}}
            showDragHandle={false}
            isDragging
            className="shadow-xl bg-white ring-2 ring-blue-500"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default SortableAssetList;
