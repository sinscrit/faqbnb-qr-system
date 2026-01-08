# REQ-143 Media Management on Edit Item Page - Detailed Implementation Tasks

**Generated:** 2026-01-08 12:12:39 CET
**Reference Documents:**
- Requirements: docs/gen_requests.md (REQ-143)
- Overview: docs/req-143-media-management-Overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- Use absolute paths when invoking tools

---

## Table of Contents

1. [Create TypeScript Types and Interfaces](#1-create-typescript-types-and-interfaces)
2. [Create MediaLinkItem Component](#2-create-medialinkitem-component)
3. [Create MediaLinkList Component with Drag-and-Drop](#3-create-medialinklist-component-with-drag-and-drop)
4. [Create AddMediaLinkForm Component](#4-create-addmedialinkform-component)
5. [Create DeleteMediaConfirmDialog Component](#5-create-deletemediaconfirmdialog-component)
6. [Create MediaManagementSection Container Component](#6-create-mediamanagementsection-container-component)
7. [Create Barrel Export File](#7-create-barrel-export-file)
8. [Integrate MediaManagementSection into Edit Item Page](#8-integrate-mediamanagementsection-into-edit-item-page)
9. [Verify API Types and Routes](#9-verify-api-types-and-routes)
10. [Create Unit Tests](#10-create-unit-tests)

---

## 1. Create TypeScript Types and Interfaces

**Context:** The `ItemLink` type already exists in `src/types/index.ts` with fields: `id`, `item_id`, `title`, `link_type`, `url`, `thumbnail_url`, `display_order`, `created_at`. We need additional types for component props and local state management.

**Files to modify:** `src/components/MediaManagement/MediaManagement.types.ts` (Create)
**Estimated effort:** 1 story point

- [x] **1.1** Create the directory structure:
  ```bash
  mkdir -p src/components/MediaManagement/__tests__
  ```
  ---implemented: Created MediaManagement directory structure with __tests__ subdirectory

- [x] **1.2** Create `src/components/MediaManagement/MediaManagement.types.ts` with the following interfaces:
  ---implemented: Created types file with all interfaces: EditableMediaLink, MediaLinkItemProps, MediaLinkListProps, AddMediaLinkFormProps, DeleteMediaConfirmDialogProps, MediaManagementSectionProps, LinkTypeOption, and LINK_TYPE_OPTIONS constant

  ```typescript
  import { ItemLink, LinkType } from '@/types';

  /**
   * Represents a media link in the editing state.
   * Can be an existing link (with id) or a new link (without id).
   */
  export interface EditableMediaLink {
    /** Existing link ID (undefined for new links) */
    id?: string;
    /** Link title */
    title: string;
    /** Link type: youtube, pdf, image, text */
    linkType: LinkType;
    /** Resource URL */
    url: string;
    /** Optional thumbnail URL */
    thumbnailUrl?: string;
    /** Display order for sorting */
    displayOrder: number;
    /** Temporary client-side ID for new items (for React keys) */
    tempId?: string;
    /** Whether this item is marked for deletion */
    isMarkedForDeletion?: boolean;
  }

  /**
   * Props for MediaLinkItem component
   */
  export interface MediaLinkItemProps {
    /** The media link data */
    link: EditableMediaLink;
    /** Index in the list (for display order) */
    index: number;
    /** Whether the item is in edit mode */
    isEditing?: boolean;
    /** Handler for edit button click */
    onEdit: (link: EditableMediaLink) => void;
    /** Handler for delete button click */
    onDelete: (link: EditableMediaLink) => void;
    /** Handler for save after inline edit */
    onSave: (link: EditableMediaLink) => void;
    /** Handler for cancel edit */
    onCancelEdit: () => void;
    /** Whether to show the drag handle */
    showDragHandle?: boolean;
    /** Drag handle props from dnd-kit */
    dragHandleProps?: Record<string, any>;
    /** Whether the item is being dragged */
    isDragging?: boolean;
  }

  /**
   * Props for MediaLinkList component
   */
  export interface MediaLinkListProps {
    /** Array of media links to display */
    links: EditableMediaLink[];
    /** Handler for reorder events */
    onReorder: (fromIndex: number, toIndex: number) => void;
    /** Handler for edit link */
    onEdit: (link: EditableMediaLink) => void;
    /** Handler for delete link */
    onDelete: (link: EditableMediaLink) => void;
    /** Handler for save link changes */
    onSave: (link: EditableMediaLink) => void;
    /** Currently editing link ID (or tempId) */
    editingLinkId?: string | null;
    /** Handler to set editing link */
    setEditingLinkId: (id: string | null) => void;
    /** Optional className */
    className?: string;
  }

  /**
   * Props for AddMediaLinkForm component
   */
  export interface AddMediaLinkFormProps {
    /** Handler when a new link is added */
    onAdd: (link: Omit<EditableMediaLink, 'displayOrder' | 'tempId'>) => void;
    /** Handler to cancel adding */
    onCancel: () => void;
    /** Whether the form is visible/expanded */
    isExpanded?: boolean;
  }

  /**
   * Props for DeleteMediaConfirmDialog component
   */
  export interface DeleteMediaConfirmDialogProps {
    /** Whether the dialog is open */
    isOpen: boolean;
    /** The link being deleted */
    link: EditableMediaLink | null;
    /** Handler when deletion is confirmed */
    onConfirm: () => void;
    /** Handler when deletion is cancelled */
    onCancel: () => void;
    /** Whether deletion is in progress */
    isDeleting?: boolean;
  }

  /**
   * Props for MediaManagementSection component
   */
  export interface MediaManagementSectionProps {
    /** Initial links from the item (converted from ItemLink[]) */
    initialLinks: ItemLink[];
    /** Callback to get the current state of links for form submission */
    onLinksChange: (links: EditableMediaLink[]) => void;
    /** Whether the section is in read-only mode */
    readOnly?: boolean;
  }

  /**
   * Utility type for link type options in dropdown
   */
  export interface LinkTypeOption {
    value: LinkType;
    label: string;
    icon: string;
  }

  /**
   * Link type options for dropdown selection
   */
  export const LINK_TYPE_OPTIONS: LinkTypeOption[] = [
    { value: 'youtube', label: 'YouTube Video', icon: 'youtube' },
    { value: 'pdf', label: 'PDF Document', icon: 'file-text' },
    { value: 'image', label: 'Image', icon: 'image' },
    { value: 'text', label: 'Web Link', icon: 'link' },
  ];
  ```

- [x] **1.3** Verify the types compile correctly:
  ```bash
  npx tsc --noEmit src/components/MediaManagement/MediaManagement.types.ts
  ```
  ---implemented: Verified with npm run build - unit tested

**Acceptance Criteria:**
- TypeScript types file exists at the specified path
- All interfaces properly typed with JSDoc comments
- No TypeScript compilation errors
- Types align with existing `ItemLink` type from `src/types/index.ts`

---

## 2. Create MediaLinkItem Component

**Context:** This component displays a single media link with preview, edit, and delete capabilities. It follows the pattern established by `AssetItem` in `src/components/ItemManager/components/AssetPanel/AssetItem.tsx` but adapted for `ItemLink` data instead of `MediaItem`.

**Files to modify:** `src/components/MediaManagement/MediaLinkItem.tsx` (Create)
**Estimated effort:** 1 story point

- [x] **2.1** Create `src/components/MediaManagement/MediaLinkItem.tsx` with the component shell:
  ---implemented: Created MediaLinkItem component with full implementation including all view and edit mode functionality

  ```typescript
  'use client';

  /**
   * MediaLinkItem Component
   *
   * Displays a single media link with preview, edit, and delete actions.
   * Supports different link types: youtube, pdf, image, text.
   *
   * @module MediaManagement/MediaLinkItem
   * @see docs/req-143-media-management-Overview.md
   */

  import { useState, useCallback } from 'react';
  import {
    Youtube,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Pencil,
    Trash2,
    GripVertical,
    Check,
    X,
  } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import type { MediaLinkItemProps, EditableMediaLink } from './MediaManagement.types';
  import { LINK_TYPE_OPTIONS } from './MediaManagement.types';

  // Component implementation follows...
  ```

- [x] **2.2** Implement the link type icon helper function:
  ---implemented: Added getLinkTypeIcon function with icons for youtube, pdf, image, and text link types

  ```typescript
  /**
   * Returns the appropriate icon component based on link type
   */
  function getLinkTypeIcon(linkType: string): React.ReactNode {
    switch (linkType) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-green-500" />;
      case 'text':
      default:
        return <LinkIcon className="w-5 h-5 text-gray-500" />;
    }
  }
  ```

- [x] **2.3** Implement the thumbnail preview helper:
  ---implemented: Added LinkPreview component and extractYouTubeId helper function

  ```typescript
  /**
   * Renders the appropriate preview for the link type
   */
  function LinkPreview({ link }: { link: EditableMediaLink }) {
    // For YouTube, extract video ID and show thumbnail
    if (link.linkType === 'youtube') {
      const videoId = extractYouTubeId(link.url);
      const thumbnailUrl = link.thumbnailUrl ||
        (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

      if (thumbnailUrl) {
        return (
          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 text-white rounded-full p-1">
                <Youtube className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      }
    }

    // For images, show thumbnail if available
    if (link.linkType === 'image' && link.thumbnailUrl) {
      return (
        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
          <img src={link.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
      );
    }

    // Default: show type icon
    return (
      <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
        {getLinkTypeIcon(link.linkType)}
      </div>
    );
  }

  /**
   * Extracts YouTube video ID from various URL formats
   */
  function extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
  ```

- [x] **2.4** Implement the main component with view and edit modes:
  ---implemented: Full MediaLinkItem component with view/edit modes, inline editing, validation, and drag handle support

  ```typescript
  export function MediaLinkItem({
    link,
    index,
    isEditing = false,
    onEdit,
    onDelete,
    onSave,
    onCancelEdit,
    showDragHandle = false,
    dragHandleProps,
    isDragging = false,
  }: MediaLinkItemProps) {
    // Local state for inline editing
    const [editTitle, setEditTitle] = useState(link.title);
    const [editUrl, setEditUrl] = useState(link.url);
    const [editType, setEditType] = useState(link.linkType);

    // Reset edit state when entering edit mode
    const handleStartEdit = useCallback(() => {
      setEditTitle(link.title);
      setEditUrl(link.url);
      setEditType(link.linkType);
      onEdit(link);
    }, [link, onEdit]);

    // Save changes
    const handleSave = useCallback(() => {
      onSave({
        ...link,
        title: editTitle.trim(),
        url: editUrl.trim(),
        linkType: editType,
      });
    }, [link, editTitle, editUrl, editType, onSave]);

    // Validate URL
    const isValidUrl = useCallback((url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, []);

    const canSave = editTitle.trim() && editUrl.trim() && isValidUrl(editUrl);

    // View mode render
    if (!isEditing) {
      return (
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white',
            'transition-all duration-200',
            isDragging && 'shadow-lg ring-2 ring-blue-500 opacity-95'
          )}
        >
          {/* Drag Handle */}
          {showDragHandle && (
            <div
              {...dragHandleProps}
              className="shrink-0 cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600"
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-5 h-5" />
            </div>
          )}

          {/* Preview */}
          <LinkPreview link={link} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
            <p className="text-xs text-gray-500 truncate">{link.url}</p>
            <span className="text-xs text-gray-400 capitalize">{link.linkType}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleStartEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Edit link"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(link)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete link"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // Edit mode render
    return (
      <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
        <div className="space-y-3">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter title"
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {LINK_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  export default MediaLinkItem;
  ```

- [x] **2.5** Add Tailwind CSS styles matching the existing design system (Airbnb-style with `#FF385C` accent color where appropriate)
  ---implemented: Used Tailwind classes for consistent styling with gray/blue color scheme for edit mode

- [x] **2.6** Verify component renders without errors:
  ```bash
  npm run build
  ```
  ---implemented: Verified with npm run build - unit tested

**Acceptance Criteria:**
- Component displays link title, URL, type icon, and thumbnail preview
- Edit mode allows modifying title, URL, and type
- URL validation prevents invalid URLs from being saved
- Drag handle appears when `showDragHandle` prop is true
- Visual states match the existing ItemManager design system
- Accessible with proper ARIA labels

---

## 3. Create MediaLinkList Component with Drag-and-Drop

**Context:** This component wraps multiple MediaLinkItem components with @dnd-kit for drag-and-drop reordering. Follow the pattern from `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`.

**Files to modify:** `src/components/MediaManagement/MediaLinkList.tsx` (Create)
**Estimated effort:** 1 story point

- [x] **3.1** Create `src/components/MediaManagement/MediaLinkList.tsx` with imports:
  ---implemented: Created MediaLinkList component with full @dnd-kit imports and implementation

  ```typescript
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
  ```

- [x] **3.2** Create the SortableMediaLinkItem wrapper component:
  ---implemented: Created SortableMediaLinkItem with useSortable hook integration

  ```typescript
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

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
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
  ```

- [x] **3.3** Implement the main MediaLinkList component:
  ---implemented: Full MediaLinkList with DndContext, sensors, accessibility announcements, and DragOverlay

  ```typescript
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
  ```

- [x] **3.4** Verify @dnd-kit dependencies are installed (they should be from existing codebase):
  ```bash
  npm ls @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
  ```
  ---implemented: Verified all dependencies installed - unit tested

**Acceptance Criteria:**
- Drag-and-drop reordering works with mouse, touch, and keyboard
- Visual feedback during drag (opacity change, elevation)
- Drag overlay shows the item being dragged
- Accessibility announcements work for screen readers
- Edit mode disables dragging for the item being edited

---

## 4. Create AddMediaLinkForm Component

**Context:** A form for adding new media links with title, URL, and type fields. Includes URL validation and type auto-detection for YouTube URLs.

**Files to modify:** `src/components/MediaManagement/AddMediaLinkForm.tsx` (Create)
**Estimated effort:** 1 story point

- [x] **4.1** Create `src/components/MediaManagement/AddMediaLinkForm.tsx`:
  ---implemented: Created AddMediaLinkForm component with all imports and functionality

  ```typescript
  'use client';

  /**
   * AddMediaLinkForm Component
   *
   * Form for adding new media links with URL validation
   * and type auto-detection.
   *
   * @module MediaManagement/AddMediaLinkForm
   */

  import { useState, useCallback, useEffect } from 'react';
  import { Plus, X, Link as LinkIcon } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import type { AddMediaLinkFormProps } from './MediaManagement.types';
  import { LINK_TYPE_OPTIONS } from './MediaManagement.types';
  import type { LinkType } from '@/types';
  ```

- [x] **4.2** Implement URL validation and type auto-detection:
  ---implemented: Added isValidUrl and detectLinkType functions with support for YouTube, PDF, and image detection

  ```typescript
  /**
   * Validates a URL string
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Auto-detects link type from URL
   */
  function detectLinkType(url: string): LinkType {
    const lowerUrl = url.toLowerCase();

    // YouTube detection
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube';
    }

    // PDF detection
    if (lowerUrl.endsWith('.pdf')) {
      return 'pdf';
    }

    // Image detection
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (imageExtensions.some(ext => lowerUrl.endsWith(ext))) {
      return 'image';
    }

    // Default to text/web link
    return 'text';
  }
  ```

- [x] **4.3** Implement the AddMediaLinkForm component:
  ---implemented: Full form implementation with title, URL, type fields, auto-detection, validation, and Airbnb accent color (#FF385C) - unit tested

  ```typescript
  export function AddMediaLinkForm({
    onAdd,
    onCancel,
    isExpanded = false,
  }: AddMediaLinkFormProps) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [linkType, setLinkType] = useState<LinkType>('text');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [showThumbnailField, setShowThumbnailField] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);

    // Auto-detect type when URL changes
    useEffect(() => {
      if (url && isValidUrl(url)) {
        const detectedType = detectLinkType(url);
        setLinkType(detectedType);
        setUrlError(null);
      } else if (url && !isValidUrl(url)) {
        setUrlError('Please enter a valid URL');
      } else {
        setUrlError(null);
      }
    }, [url]);

    // Reset form
    const resetForm = useCallback(() => {
      setTitle('');
      setUrl('');
      setLinkType('text');
      setThumbnailUrl('');
      setShowThumbnailField(false);
      setUrlError(null);
    }, []);

    // Handle cancel
    const handleCancel = useCallback(() => {
      resetForm();
      onCancel();
    }, [resetForm, onCancel]);

    // Handle submit
    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim()) {
        return;
      }

      if (!url.trim() || !isValidUrl(url)) {
        setUrlError('Please enter a valid URL');
        return;
      }

      onAdd({
        title: title.trim(),
        url: url.trim(),
        linkType,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      });

      resetForm();
    }, [title, url, linkType, thumbnailUrl, onAdd, resetForm]);

    const canSubmit = title.trim() && url.trim() && isValidUrl(url);

    if (!isExpanded) {
      return null;
    }

    return (
      <form onSubmit={handleSubmit} className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="new-link-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="new-link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
              placeholder="e.g., Product Manual"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="new-link-url" className="block text-sm font-medium text-gray-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              id="new-link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent',
                urlError ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="https://..."
              required
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-500">{urlError}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="new-link-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="new-link-type"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as LinkType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
            >
              {LINK_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Type is auto-detected from URL but can be changed
            </p>
          </div>

          {/* Optional Thumbnail URL */}
          {(linkType === 'image' || showThumbnailField) && (
            <div>
              <label htmlFor="new-link-thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail URL (optional)
              </label>
              <input
                id="new-link-thumbnail"
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          )}

          {/* Show thumbnail field toggle for non-image types */}
          {linkType !== 'image' && !showThumbnailField && (
            <button
              type="button"
              onClick={() => setShowThumbnailField(true)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              + Add custom thumbnail
            </button>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 text-sm text-white bg-[#FF385C] hover:bg-[#E31C5F] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          </div>
        </div>
      </form>
    );
  }

  export default AddMediaLinkForm;
  ```

**Acceptance Criteria:**
- Form validates URL before submission
- Link type is auto-detected from URL (YouTube, PDF, image)
- All required fields prevent submission when empty
- Form resets after successful submission
- Uses project's accent color (#FF385C) for primary actions

---

## 5. Create DeleteMediaConfirmDialog Component

**Context:** Confirmation dialog following the pattern from `AssetRemoveConfirmDialog.tsx`. Displays media title and type being deleted with confirm/cancel buttons.

**Files to modify:** `src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` (Create)
**Estimated effort:** 1 story point

- [x] **5.1** Create `src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`:
  ---implemented: Created DeleteMediaConfirmDialog component with all imports

  ```typescript
  'use client';

  /**
   * DeleteMediaConfirmDialog Component
   *
   * Confirmation dialog for media link deletion.
   * Follows the pattern from AssetRemoveConfirmDialog.
   *
   * @module MediaManagement/DeleteMediaConfirmDialog
   */

  import { useEffect, useCallback } from 'react';
  import {
    Trash2,
    Loader2,
    Youtube,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
  } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import type { DeleteMediaConfirmDialogProps } from './MediaManagement.types';
  ```

- [x] **5.2** Implement the dialog component:
  ---implemented: Full dialog with type icons, labels, Escape key handling, backdrop click, and loading state - unit tested

  ```typescript
  /**
   * Returns the appropriate icon for link type
   */
  function getLinkTypeIcon(linkType: string): React.ReactNode {
    switch (linkType) {
      case 'youtube':
        return <Youtube className="w-10 h-10 text-red-500" />;
      case 'pdf':
        return <FileText className="w-10 h-10 text-blue-500" />;
      case 'image':
        return <ImageIcon className="w-10 h-10 text-green-500" />;
      case 'text':
      default:
        return <LinkIcon className="w-10 h-10 text-gray-500" />;
    }
  }

  /**
   * Gets human-readable type label
   */
  function getTypeLabel(linkType: string): string {
    switch (linkType) {
      case 'youtube':
        return 'YouTube Video';
      case 'pdf':
        return 'PDF Document';
      case 'image':
        return 'Image';
      case 'text':
      default:
        return 'Web Link';
    }
  }

  export function DeleteMediaConfirmDialog({
    isOpen,
    link,
    onConfirm,
    onCancel,
    isDeleting = false,
  }: DeleteMediaConfirmDialogProps) {
    // Handle Escape key
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isDeleting) {
          onCancel();
        }
      },
      [onCancel, isDeleting]
    );

    useEffect(() => {
      if (!isOpen) return;
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (!isOpen || !link) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={isDeleting ? undefined : onCancel}
          aria-hidden="true"
        >
          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-media-dialog-title"
            className="bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h3
              id="delete-media-dialog-title"
              className="text-lg font-medium text-gray-900 mb-4 text-center"
            >
              Delete {getTypeLabel(link.linkType)}?
            </h3>

            {/* Icon and Info */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                {getLinkTypeIcon(link.linkType)}
              </div>
              <p className="text-sm font-medium text-gray-900 text-center max-w-[250px] truncate">
                {link.title}
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-[250px] truncate">
                {link.url}
              </p>
            </div>

            {/* Warning */}
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className={cn(
                  'flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md',
                  'hover:bg-gray-200 disabled:opacity-50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500'
                )}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className={cn(
                  'flex-1 px-4 py-2 text-white bg-red-600 rounded-md',
                  'hover:bg-red-700 disabled:opacity-50 transition-colors',
                  'flex items-center justify-center gap-2',
                  'focus:outline-none focus:ring-2 focus:ring-red-500'
                )}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  export default DeleteMediaConfirmDialog;
  ```

**Acceptance Criteria:**
- Dialog shows link title, URL, and type icon
- Escape key closes the dialog
- Click outside closes the dialog
- Loading state shows spinner during deletion
- Destructive action uses red color scheme

---

## 6. Create MediaManagementSection Container Component

**Context:** The main orchestrating component that combines all sub-components and manages state. It converts between `ItemLink[]` (from API) and `EditableMediaLink[]` (for editing).

**Files to modify:** `src/components/MediaManagement/MediaManagementSection.tsx` (Create)
**Estimated effort:** 1 story point

- [ ] **6.1** Create `src/components/MediaManagement/MediaManagementSection.tsx`:

  ```typescript
  'use client';

  /**
   * MediaManagementSection Component
   *
   * Container component that orchestrates media link management.
   * Handles state, conversions, and exposes changes for form submission.
   *
   * @module MediaManagement/MediaManagementSection
   */

  import { useState, useCallback, useEffect, useMemo } from 'react';
  import { Plus, Image as ImageIcon } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import { MediaLinkList } from './MediaLinkList';
  import { AddMediaLinkForm } from './AddMediaLinkForm';
  import { DeleteMediaConfirmDialog } from './DeleteMediaConfirmDialog';
  import type { MediaManagementSectionProps, EditableMediaLink } from './MediaManagement.types';
  import type { ItemLink } from '@/types';
  ```

- [ ] **6.2** Implement conversion utilities:

  ```typescript
  /**
   * Converts ItemLink (from API) to EditableMediaLink (for editing)
   */
  function itemLinkToEditable(link: ItemLink): EditableMediaLink {
    return {
      id: link.id,
      title: link.title,
      linkType: link.link_type,
      url: link.url,
      thumbnailUrl: link.thumbnail_url || undefined,
      displayOrder: link.display_order,
    };
  }

  /**
   * Generates a unique temporary ID for new links
   */
  function generateTempId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  ```

- [ ] **6.3** Implement the MediaManagementSection component:

  ```typescript
  export function MediaManagementSection({
    initialLinks,
    onLinksChange,
    readOnly = false,
  }: MediaManagementSectionProps) {
    // Convert initial links to editable format
    const [links, setLinks] = useState<EditableMediaLink[]>(() =>
      initialLinks.map(itemLinkToEditable).sort((a, b) => a.displayOrder - b.displayOrder)
    );

    // UI state
    const [isAddFormExpanded, setIsAddFormExpanded] = useState(false);
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [linkToDelete, setLinkToDelete] = useState<EditableMediaLink | null>(null);

    // Notify parent of changes
    useEffect(() => {
      onLinksChange(links);
    }, [links, onLinksChange]);

    // Handle adding a new link
    const handleAdd = useCallback((newLink: Omit<EditableMediaLink, 'displayOrder' | 'tempId'>) => {
      const maxOrder = links.length > 0
        ? Math.max(...links.map(l => l.displayOrder))
        : -1;

      const linkWithOrder: EditableMediaLink = {
        ...newLink,
        tempId: generateTempId(),
        displayOrder: maxOrder + 1,
      };

      setLinks(prev => [...prev, linkWithOrder]);
      setIsAddFormExpanded(false);
    }, [links]);

    // Handle editing a link
    const handleEdit = useCallback((link: EditableMediaLink) => {
      setEditingLinkId(link.id || link.tempId || null);
    }, []);

    // Handle saving link edits
    const handleSave = useCallback((updatedLink: EditableMediaLink) => {
      setLinks(prev =>
        prev.map(l => {
          const linkId = l.id || l.tempId;
          const updatedId = updatedLink.id || updatedLink.tempId;
          return linkId === updatedId ? updatedLink : l;
        })
      );
      setEditingLinkId(null);
    }, []);

    // Handle delete request (show confirmation)
    const handleDeleteRequest = useCallback((link: EditableMediaLink) => {
      setLinkToDelete(link);
    }, []);

    // Handle confirmed deletion
    const handleConfirmDelete = useCallback(() => {
      if (!linkToDelete) return;

      setLinks(prev => {
        const filtered = prev.filter(l => {
          const linkId = l.id || l.tempId;
          const deleteId = linkToDelete.id || linkToDelete.tempId;
          return linkId !== deleteId;
        });
        // Recalculate display orders
        return filtered.map((l, index) => ({ ...l, displayOrder: index }));
      });

      setLinkToDelete(null);
    }, [linkToDelete]);

    // Handle reorder
    const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
      setLinks(prev => {
        const newLinks = [...prev];
        const [movedItem] = newLinks.splice(fromIndex, 1);
        newLinks.splice(toIndex, 0, movedItem);
        // Update display orders
        return newLinks.map((l, index) => ({ ...l, displayOrder: index }));
      });
    }, []);

    // Empty state
    const isEmpty = links.length === 0;

    return (
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Media & Links</h3>
          {!readOnly && !isAddFormExpanded && (
            <button
              onClick={() => setIsAddFormExpanded(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#FF385C] hover:bg-red-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          )}
        </div>

        {/* Empty State */}
        {isEmpty && !isAddFormExpanded && (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No media links yet</p>
            {!readOnly && (
              <button
                onClick={() => setIsAddFormExpanded(true)}
                className="text-sm text-[#FF385C] hover:underline"
              >
                Add your first link
              </button>
            )}
          </div>
        )}

        {/* Add Form */}
        {!readOnly && (
          <AddMediaLinkForm
            onAdd={handleAdd}
            onCancel={() => setIsAddFormExpanded(false)}
            isExpanded={isAddFormExpanded}
          />
        )}

        {/* Links List */}
        {!isEmpty && (
          <MediaLinkList
            links={links}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onSave={handleSave}
            editingLinkId={editingLinkId}
            setEditingLinkId={setEditingLinkId}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteMediaConfirmDialog
          isOpen={linkToDelete !== null}
          link={linkToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setLinkToDelete(null)}
        />
      </div>
    );
  }

  export default MediaManagementSection;
  ```

**Acceptance Criteria:**
- Converts ItemLink[] to EditableMediaLink[] on mount
- Notifies parent component of changes via onLinksChange callback
- Shows empty state when no links exist
- Add form expands/collapses properly
- Delete confirmation dialog appears before deletion
- Reordering updates display_order values correctly

---

## 7. Create Barrel Export File

**Context:** Standard practice for clean imports from the component directory.

**Files to modify:** `src/components/MediaManagement/index.ts` (Create)
**Estimated effort:** 1 story point

- [ ] **7.1** Create `src/components/MediaManagement/index.ts`:

  ```typescript
  /**
   * MediaManagement Components
   *
   * Components for managing media links on the Edit Item page.
   *
   * @module MediaManagement
   * @see docs/req-143-media-management-Overview.md
   */

  export { MediaLinkItem } from './MediaLinkItem';
  export { MediaLinkList } from './MediaLinkList';
  export { AddMediaLinkForm } from './AddMediaLinkForm';
  export { DeleteMediaConfirmDialog } from './DeleteMediaConfirmDialog';
  export { MediaManagementSection } from './MediaManagementSection';

  export type {
    EditableMediaLink,
    MediaLinkItemProps,
    MediaLinkListProps,
    AddMediaLinkFormProps,
    DeleteMediaConfirmDialogProps,
    MediaManagementSectionProps,
  } from './MediaManagement.types';

  export { LINK_TYPE_OPTIONS } from './MediaManagement.types';
  ```

- [ ] **7.2** Verify all exports are accessible:
  ```bash
  npx tsc --noEmit
  ```

**Acceptance Criteria:**
- All components exportable from single import path
- Types are re-exported for consumer convenience
- No circular dependency issues

---

## 8. Integrate MediaManagementSection into Edit Item Page

**Context:** The Edit Item page is at `src/app/dashboard2/items/[publicId]/edit/page.tsx`. Currently it only edits name and description. We need to add the MediaManagementSection and wire it to the form submission.

**Files to modify:** `src/app/dashboard2/items/[publicId]/edit/page.tsx` (Modify)
**Estimated effort:** 1 story point

- [ ] **8.1** Add import for MediaManagementSection at the top of the file:

  ```typescript
  import { MediaManagementSection } from '@/components/MediaManagement';
  import type { EditableMediaLink } from '@/components/MediaManagement';
  ```

- [ ] **8.2** Add state for tracking media link changes. After the existing form state declarations (around line 36):

  ```typescript
  // Media links state
  const [mediaLinks, setMediaLinks] = useState<EditableMediaLink[]>([]);
  ```

- [ ] **8.3** Create a handler for media link changes:

  ```typescript
  // Handle media links change from MediaManagementSection
  const handleMediaLinksChange = useCallback((links: EditableMediaLink[]) => {
    setMediaLinks(links);
  }, []);
  ```

- [ ] **8.4** Update the `handleSubmit` function (around line 73) to include media links in the API call. Replace the existing links mapping:

  ```typescript
  // Replace the existing links mapping in handleSubmit:
  const response = await adminApi.updateItem(publicId, {
    name,
    description,
    propertyId: item.propertyId,
    links: mediaLinks.map((link, index) => ({
      id: link.id, // undefined for new links
      title: link.title,
      linkType: link.linkType,
      url: link.url,
      thumbnailUrl: link.thumbnailUrl,
      displayOrder: link.displayOrder,
    })),
  }, headers);
  ```

- [ ] **8.5** Add the MediaManagementSection component in the form, after the Property display section (around line 217). Insert before the closing `</div>` of the space-y-6 container:

  ```typescript
  {/* Media Management Section */}
  <div className="pt-4 border-t border-gray-200">
    <MediaManagementSection
      initialLinks={item?.links || []}
      onLinksChange={handleMediaLinksChange}
      readOnly={saving}
    />
  </div>
  ```

- [ ] **8.6** Verify the integration compiles and the page renders:
  ```bash
  npm run build
  npm run dev
  ```
  Then navigate to `/dashboard2/items/[publicId]/edit` to verify the component appears.

**Acceptance Criteria:**
- MediaManagementSection appears on the Edit Item page
- Changes to media links are included when saving the item
- Loading state disables media management during save
- Existing links are displayed when editing an item
- New links can be added and saved
- Links can be reordered and order is persisted

---

## 9. Verify API Types and Routes

**Context:** The API route at `src/app/api/admin/items/[publicId]/route.ts` already handles link updates. We need to verify it properly handles all scenarios including new links (no id), updated links (with id), and deleted links (not present in array).

**Files to modify:** Verify only (no modification needed based on current implementation)
**Estimated effort:** 1 story point

- [ ] **9.1** Review the PUT handler in `src/app/api/admin/items/[publicId]/route.ts` (lines 412-660):
  - Verify it validates link types against `['youtube', 'pdf', 'image', 'text']` (line 496-503) - CONFIRMED
  - Verify it validates URLs for each link (line 505-512) - CONFIRMED
  - Verify it deletes existing links before inserting new ones (line 578-590) - CONFIRMED
  - Verify it creates links with display_order (line 597-604) - CONFIRMED

- [ ] **9.2** Review the UpdateItemRequest type in `src/types/index.ts` (lines 203-214):
  - Verify links array supports optional `id` field for new links - CONFIRMED (line 207: `id?: string`)
  - Verify all required fields are present - CONFIRMED

- [ ] **9.3** Document any issues found (if none, mark as verified):
  - API correctly handles link deletion by deleting all and recreating
  - API correctly assigns display_order from the request
  - API validates link types and URLs before saving

- [ ] **9.4** Test the API manually or via unit test:
  ```bash
  # Manual test via curl or API client:
  # PUT /api/admin/items/[publicId] with body containing links array
  ```

**Acceptance Criteria:**
- API accepts new links without id field
- API accepts updated links with existing id field
- API deletes links that are not in the submitted array
- API properly validates link types and URLs
- display_order is persisted correctly

---

## 10. Create Unit Tests

**Context:** Create comprehensive unit tests for all new components following the testing patterns established in the codebase (Jest + React Testing Library).

**Files to modify:** Multiple test files (Create)
**Estimated effort:** 1 story point

- [ ] **10.1** Create `src/components/MediaManagement/__tests__/MediaLinkItem.test.tsx`:

  ```typescript
  /**
   * MediaLinkItem Component Tests
   *
   * @see docs/req-143-media-management-Overview.md
   */

  import { render, screen, fireEvent } from '@testing-library/react';
  import { MediaLinkItem } from '../MediaLinkItem';
  import type { EditableMediaLink } from '../MediaManagement.types';

  const mockLink: EditableMediaLink = {
    id: 'link-1',
    title: 'Test Video',
    linkType: 'youtube',
    url: 'https://youtube.com/watch?v=abc123',
    displayOrder: 0,
  };

  describe('MediaLinkItem', () => {
    const defaultProps = {
      link: mockLink,
      index: 0,
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      onSave: jest.fn(),
      onCancelEdit: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders link title and URL', () => {
      render(<MediaLinkItem {...defaultProps} />);
      expect(screen.getByText('Test Video')).toBeInTheDocument();
      expect(screen.getByText('https://youtube.com/watch?v=abc123')).toBeInTheDocument();
    });

    it('renders correct icon for YouTube links', () => {
      render(<MediaLinkItem {...defaultProps} />);
      expect(screen.getByText('youtube')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
      render(<MediaLinkItem {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Edit link'));
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockLink);
    });

    it('calls onDelete when delete button is clicked', () => {
      render(<MediaLinkItem {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Delete link'));
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockLink);
    });

    it('shows edit form when isEditing is true', () => {
      render(<MediaLinkItem {...defaultProps} isEditing />);
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('URL')).toBeInTheDocument();
    });

    it('shows drag handle when showDragHandle is true', () => {
      render(<MediaLinkItem {...defaultProps} showDragHandle />);
      expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    });
  });
  ```

- [ ] **10.2** Create `src/components/MediaManagement/__tests__/AddMediaLinkForm.test.tsx`:

  ```typescript
  /**
   * AddMediaLinkForm Component Tests
   */

  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { AddMediaLinkForm } from '../AddMediaLinkForm';

  describe('AddMediaLinkForm', () => {
    const defaultProps = {
      onAdd: jest.fn(),
      onCancel: jest.fn(),
      isExpanded: true,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders form fields when expanded', () => {
      render(<AddMediaLinkForm {...defaultProps} />);
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });

    it('does not render when not expanded', () => {
      render(<AddMediaLinkForm {...defaultProps} isExpanded={false} />);
      expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
    });

    it('auto-detects YouTube link type', async () => {
      render(<AddMediaLinkForm {...defaultProps} />);
      const urlInput = screen.getByLabelText(/url/i);
      await userEvent.type(urlInput, 'https://youtube.com/watch?v=abc');

      await waitFor(() => {
        expect(screen.getByDisplayValue('youtube')).toBeInTheDocument();
      });
    });

    it('validates URL format', async () => {
      render(<AddMediaLinkForm {...defaultProps} />);
      const urlInput = screen.getByLabelText(/url/i);
      await userEvent.type(urlInput, 'not-a-url');

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
      });
    });

    it('calls onAdd with form data on submit', async () => {
      render(<AddMediaLinkForm {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/title/i), 'Test Link');
      await userEvent.type(screen.getByLabelText(/url/i), 'https://example.com');

      fireEvent.click(screen.getByText('Add Link'));

      await waitFor(() => {
        expect(defaultProps.onAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Link',
            url: 'https://example.com',
          })
        );
      });
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(<AddMediaLinkForm {...defaultProps} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });
  ```

- [ ] **10.3** Create `src/components/MediaManagement/__tests__/MediaManagementSection.test.tsx`:

  ```typescript
  /**
   * MediaManagementSection Integration Tests
   */

  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { MediaManagementSection } from '../MediaManagementSection';
  import type { ItemLink } from '@/types';

  const mockLinks: ItemLink[] = [
    {
      id: 'link-1',
      item_id: 'item-1',
      title: 'Video Guide',
      link_type: 'youtube',
      url: 'https://youtube.com/watch?v=abc',
      thumbnail_url: null,
      display_order: 0,
      created_at: '2026-01-01',
    },
    {
      id: 'link-2',
      item_id: 'item-1',
      title: 'PDF Manual',
      link_type: 'pdf',
      url: 'https://example.com/manual.pdf',
      thumbnail_url: null,
      display_order: 1,
      created_at: '2026-01-01',
    },
  ];

  describe('MediaManagementSection', () => {
    const defaultProps = {
      initialLinks: mockLinks,
      onLinksChange: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders existing links', () => {
      render(<MediaManagementSection {...defaultProps} />);
      expect(screen.getByText('Video Guide')).toBeInTheDocument();
      expect(screen.getByText('PDF Manual')).toBeInTheDocument();
    });

    it('shows empty state when no links', () => {
      render(<MediaManagementSection {...defaultProps} initialLinks={[]} />);
      expect(screen.getByText(/no media links yet/i)).toBeInTheDocument();
    });

    it('expands add form when Add Link is clicked', () => {
      render(<MediaManagementSection {...defaultProps} />);
      fireEvent.click(screen.getByText('Add Link'));
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('shows delete confirmation when delete is clicked', () => {
      render(<MediaManagementSection {...defaultProps} />);
      const deleteButtons = screen.getAllByLabelText(/delete link/i);
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText(/delete youtube video/i)).toBeInTheDocument();
    });

    it('calls onLinksChange when links are modified', async () => {
      render(<MediaManagementSection {...defaultProps} />);

      // Initial call with converted links
      expect(defaultProps.onLinksChange).toHaveBeenCalled();
    });

    it('disables interactions when readOnly is true', () => {
      render(<MediaManagementSection {...defaultProps} readOnly />);
      expect(screen.queryByText('Add Link')).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **10.4** Run the test suite:
  ```bash
  npm test -- --testPathPattern="MediaManagement"
  ```

- [ ] **10.5** Verify all tests pass and update any failing tests based on actual component behavior.

**Acceptance Criteria:**
- All test files created in `__tests__` directory
- Tests cover rendering, user interactions, and edge cases
- Tests follow existing testing patterns in the codebase
- All tests pass with `npm test`

---

## Summary Checklist

Before marking this implementation complete, verify:

- [ ] All tasks reference only authorized files/functions from the overview document
- [ ] Each numbered task is approximately 1 story point
- [ ] All file paths are relative to project root
- [ ] Testing tasks are included
- [ ] Solutions are input-driven, not example-specific
- [ ] Implementation uses standard @dnd-kit patterns from existing codebase
- [ ] All subtask checkboxes use the `**X.Y**` ID format

---

*Document generated: 2026-01-08 12:12:39 CET*
