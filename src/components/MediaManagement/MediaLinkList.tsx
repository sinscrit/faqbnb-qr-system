'use client';

/**
 * MediaLinkList Component
 *
 * Provides drag-and-drop reordering for media links.
 * Uses @dnd-kit for cross-platform support.
 *
 * @module MediaManagement/MediaLinkList
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
import { MediaLinkItem } from './MediaLinkItem';
import type { MediaLinkListProps, EditableMediaLink } from './MediaManagement.types';

interface SortableMediaLinkItemProps {
  link: EditableMediaLink;
  index: number;
  isEditing: boolean;
  onEdit: (link: EditableMediaLink) => void;
  onDelete: (link: EditableMediaLink) => void;
  onSave: (link: EditableMediaLink) => void;
  onCancelEdit: () => void;
  showDragHandle: boolean;
}

function SortableMediaLinkItem({
  link,
  index,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  showDragHandle,
}: SortableMediaLinkItemProps) {
  const id = link.id || link.tempId || `temp-${index}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  // Don't spread attributes that disable child elements when editing
  const safeAttributes = isEditing ? {} : attributes;

  return (
    <div ref={setNodeRef} style={style} {...safeAttributes}>
      <MediaLinkItem
        link={link}
        index={index}
        isEditing={isEditing}
        onEdit={onEdit}
        onDelete={onDelete}
        onSave={onSave}
        onCancelEdit={onCancelEdit}
        showDragHandle={showDragHandle && !isEditing}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

export function MediaLinkList({
  links,
  onReorder,
  onEdit,
  onDelete,
  onSave,
  editingLinkId,
  setEditingLinkId,
  className,
}: MediaLinkListProps) {
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

  // Get sortable IDs
  const sortableIds = useMemo(() => {
    return links.map((link, index) => link.id || link.tempId || `temp-${index}`);
  }, [links]);

  // Show drag handles when more than one link
  const showDragHandle = links.length > 1;

  // Accessibility announcements
  const announcements: Announcements = useMemo(() => ({
    onDragStart({ active }) {
      const link = links.find((l, i) => (l.id || l.tempId || `temp-${i}`) === active.id);
      return `Picked up ${link?.title || 'item'}. Use arrow keys to move.`;
    },
    onDragEnd({ active, over }) {
      if (over && active.id !== over.id) {
        const link = links.find((l, i) => (l.id || l.tempId || `temp-${i}`) === active.id);
        return `Dropped ${link?.title || 'item'}. Position updated.`;
      }
      return 'Position unchanged.';
    },
    onDragCancel() {
      return 'Drag cancelled.';
    },
    onDragOver({ active, over }) {
      if (over && active.id !== over.id) {
        return 'Item moved.';
      }
      return undefined;
    },
  }), [links]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.indexOf(active.id as string);
    const newIndex = sortableIds.indexOf(over.id as string);

    if (oldIndex >= 0 && newIndex >= 0) {
      onReorder(oldIndex, newIndex);
    }
  }, [sortableIds, onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Get active link for drag overlay
  const activeLink = activeId
    ? links.find((l, i) => (l.id || l.tempId || `temp-${i}`) === activeId)
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
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div role="list" aria-label="Media links list" className={cn('space-y-2', className)}>
          {links.map((link, index) => {
            const id = link.id || link.tempId || `temp-${index}`;
            const isEditing = editingLinkId === id;

            return (
              <SortableMediaLinkItem
                key={id}
                link={link}
                index={index}
                isEditing={isEditing}
                onEdit={(l) => {
                  setEditingLinkId(l.id || l.tempId || null);
                  onEdit(l);
                }}
                onDelete={onDelete}
                onSave={(l) => {
                  setEditingLinkId(null);
                  onSave(l);
                }}
                onCancelEdit={() => setEditingLinkId(null)}
                showDragHandle={showDragHandle}
              />
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeLink ? (
          <MediaLinkItem
            link={activeLink}
            index={-1}
            onEdit={() => {}}
            onDelete={() => {}}
            onSave={() => {}}
            onCancelEdit={() => {}}
            showDragHandle={false}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default MediaLinkList;
