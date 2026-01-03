# REQ-059: Implement ItemRow Component - Detailed Task Breakdown

**Document Created:** 2026-01-03T02:52:24
**Last Modified:** 2026-01-03T14:40:00
**Implementation Status:** COMPLETED
**Overview Document:** `/docs/REQ-059-implement-itemrow-component-overview.md`
**Request Reference:** REQ-059 (ItemRow Component for List View Display)
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.5

---

## Document Purpose

This document provides granular, actionable implementation tasks for the ItemRow component. Each task is designed to be completed in a single focused session (1 story point or less) and includes specific verification steps. ItemRow is the list view counterpart to ItemCard, displaying comprehensive metadata in a horizontal row format with kebab menu actions and selection controls.

---

## Prerequisites

Before starting these tasks, ensure the following are complete:

- [x] Task 1.1: Directory structure exists at `src/components/ItemManager/`
- [x] Task 1.1: `ItemManager.types.ts` contains `ItemRecord` type definition
- [x] Task 1.2: `useItemManagerState.ts` hook exists with selection state management
- [x] Task 1.3: Basic `ItemManager.tsx` shell component exists

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemRow.tsx` | Main ItemRow component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `ItemRowProps` interface if not present |
| `src/components/ItemManager/index.ts` | Export `ItemRow` and `ItemRowProps` |

### Reference Files (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemsManagement.tsx` | Table row pattern reference |
| `src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Thumbnail/URL management pattern |
| `src/lib/utils.ts` | `cn()` utility function |
| `src/components/ItemCapture/ItemCapture.types.ts` | `ItemRecord`, `MediaItem` type definitions |
| `docs/REQ-058-implement-itemcard-component-detailed.md` | Parallel component reference |

---

## Task Breakdown

### Task 1: Add ItemRowProps Interface to Types File

**Estimated Effort:** 0.25 hours (15 minutes)
**Dependencies:** Task 1.1 complete

#### Description

Add the `ItemRowProps` interface to the ItemManager types file. This interface defines all props the ItemRow component will accept, including action handlers for the kebab menu.

#### Implementation Steps

1. Open `src/components/ItemManager/ItemManager.types.ts`
2. Import `ItemRecord` if not already imported
3. Add the `ItemRowProps` interface with the following properties:
   - `item: ItemRecord` - The item record to display
   - `onPreviewClick: (item: ItemRecord) => void` - Callback when row is clicked
   - `onSelectionChange: (id: string, selected: boolean) => void` - Callback for selection change
   - `isSelected: boolean` - Current selection state
   - `isSelectionMode: boolean` - Whether selection mode is active
   - `onEdit: (item: ItemRecord) => void` - Edit action callback
   - `onDelete: (item: ItemRecord) => void` - Delete action callback
   - `onManageAssets?: (item: ItemRecord) => void` - Optional manage assets callback
   - `onDuplicate?: (item: ItemRecord) => void` - Optional duplicate callback
   - `className?: string` - Optional additional CSS classes

#### Code Reference

```typescript
/**
 * Props for the ItemRow component.
 * Used for displaying items in list view with comprehensive metadata.
 */
export interface ItemRowProps {
  /** The item record to display */
  item: ItemRecord;
  /** Callback when row is clicked (for preview) */
  onPreviewClick: (item: ItemRecord) => void;
  /** Callback when selection checkbox changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  /** Whether the row is currently selected */
  isSelected: boolean;
  /** Whether selection mode is active (shows checkbox) */
  isSelectionMode: boolean;
  /** Callback when edit action is triggered */
  onEdit: (item: ItemRecord) => void;
  /** Callback when delete action is triggered */
  onDelete: (item: ItemRecord) => void;
  /** Optional callback for manage assets action */
  onManageAssets?: (item: ItemRecord) => void;
  /** Optional callback for duplicate action */
  onDuplicate?: (item: ItemRecord) => void;
  /** Optional additional CSS classes */
  className?: string;
}
```

#### Verification

- [ ] `ItemRowProps` interface exists in `ItemManager.types.ts`
- [ ] All required properties are defined with correct types
- [ ] Optional properties (`onManageAssets`, `onDuplicate`, `className`) are marked with `?`
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`

---

### Task 2: Create ItemRow Component File with Base Structure

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Task 1 complete

#### Description

Create the ItemRow component file with the basic component skeleton, imports, and base row container structure using flexbox layout.

#### Implementation Steps

1. Create file: `src/components/ItemManager/components/ItemRow.tsx`
2. Add `'use client'` directive at the top
3. Add file documentation header with module name and last modified date
4. Import required dependencies:
   - `useState`, `useEffect`, `useMemo`, `useRef` from 'react'
   - `MoreVertical`, `Edit`, `Trash2`, `Layers`, `Copy`, `Play`, `FileText`, `ImageIcon` from 'lucide-react'
   - `cn` from '@/lib/utils'
   - Types from '../ItemManager.types'
5. Create the function component signature accepting `ItemRowProps`
6. Implement the base container div with:
   - `role="row"` for accessibility
   - `tabIndex={0}` for keyboard navigation
   - Base Tailwind classes:
     - `flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200`
     - `hover:bg-gray-50 transition-colors cursor-pointer`
     - `focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500`
7. Add conditional `isSelected` styling: `bg-blue-50 border-l-4 border-l-blue-500`
8. Export as named export and default export

#### Code Reference

```typescript
'use client';

/**
 * ItemRow Component
 *
 * Displays an individual item in the ItemManager list view.
 * Features thumbnail preview, comprehensive metadata display,
 * kebab action menu, and selection mode support.
 *
 * @module ItemManager/components/ItemRow
 * @lastModified 2026-01-03 (REQ-059)
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  Copy,
  Play,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord, ItemRowProps } from '../ItemManager.types';

export function ItemRow({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
}: ItemRowProps) {
  // Component implementation...

  return (
    <div
      role="row"
      tabIndex={0}
      aria-label={`Item: ${item.title}`}
      className={cn(
        "flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200",
        "hover:bg-gray-50 transition-colors cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
        isSelected && "bg-blue-50 border-l-4 border-l-blue-500",
        className
      )}
    >
      {/* Row content sections */}
    </div>
  );
}

export default ItemRow;
```

#### Verification

- [ ] File exists at `src/components/ItemManager/components/ItemRow.tsx`
- [ ] Component renders without errors (add temporarily to a test page)
- [ ] Component accepts all props defined in `ItemRowProps`
- [ ] Hover states work (background changes to gray-50)
- [ ] Focus states work (blue ring on tab focus)
- [ ] Selected state shows blue background and left border
- [ ] TypeScript compilation succeeds

---

### Task 3: Implement Thumbnail Area with Object URL Management

**Estimated Effort:** 0.75 hours (45 minutes)
**Dependencies:** Task 2 complete

#### Description

Implement the compact thumbnail section (48x48px) with proper Object URL creation, memory management, loading states, and fallback icons. This follows the same pattern as ItemCard.

#### Implementation Steps

1. Add internal state for image loading/error:
   ```typescript
   const [imageLoading, setImageLoading] = useState(true);
   const [imageError, setImageError] = useState(false);
   ```

2. Implement Object URL creation with `useMemo`:
   ```typescript
   const objectUrl = useMemo(() => {
     const firstMedia = item.media[0];
     if (!firstMedia) return null;
     const blob = firstMedia.thumbnail || (firstMedia.type === 'image' ? firstMedia.file : null);
     if (!blob) return null;
     return URL.createObjectURL(blob);
   }, [item.media]);
   ```

3. Implement cleanup with `useEffect`:
   ```typescript
   useEffect(() => {
     return () => {
       if (objectUrl) {
         URL.revokeObjectURL(objectUrl);
       }
     };
   }, [objectUrl]);
   ```

4. Create thumbnail container div:
   - Container class: `flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100`

5. Render thumbnail image when objectUrl exists and no error:
   ```typescript
   {objectUrl && !imageError && (
     <img
       src={objectUrl}
       alt={`${item.title} thumbnail`}
       className={cn(
         'w-full h-full object-cover',
         imageLoading ? 'opacity-0' : 'opacity-100'
       )}
       onLoad={() => setImageLoading(false)}
       onError={() => { setImageError(true); setImageLoading(false); }}
     />
   )}
   ```

6. Add loading state:
   ```typescript
   {imageLoading && objectUrl && !imageError && (
     <div className="absolute inset-0 flex items-center justify-center">
       <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
     </div>
   )}
   ```

7. Add fallback icon with type-specific icons:
   - Video: `<Play className="w-6 h-6 text-red-400" />`
   - Image: `<ImageIcon className="w-6 h-6 text-green-400" />`
   - PDF: `<FileText className="w-6 h-6 text-blue-400" />`
   - Text-only: `<FileText className="w-6 h-6 text-purple-400" />`

#### Code Reference

```typescript
const getFallbackIcon = () => {
  const firstMedia = item.media[0];
  if (!firstMedia) {
    if (item.contentType === 'text-only') {
      return <FileText className="w-6 h-6 text-purple-400" />;
    }
    if (item.contentType === 'pdf-only') {
      return <FileText className="w-6 h-6 text-blue-400" />;
    }
    return <ImageIcon className="w-6 h-6 text-gray-400" />;
  }

  switch (firstMedia.type) {
    case 'video':
      return <Play className="w-6 h-6 text-red-400" />;
    case 'pdf':
      return <FileText className="w-6 h-6 text-blue-400" />;
    case 'image':
    default:
      return <ImageIcon className="w-6 h-6 text-green-400" />;
  }
};

// In render:
{(!objectUrl || imageError) && (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    {getFallbackIcon()}
  </div>
)}
```

#### Verification

- [ ] Thumbnail displays correctly when item has media with blob/thumbnail
- [ ] Loading spinner appears during image load
- [ ] Fallback icon appears when no media or on error
- [ ] No memory leaks: Object URL is revoked on unmount
- [ ] Different icons display for different media types
- [ ] Thumbnail container is 48x48px with rounded corners

---

### Task 4: Implement Title and Description Section

**Estimated Effort:** 0.25 hours (15 minutes)
**Dependencies:** Task 2 complete

#### Description

Add the main content section displaying the item title and optional instructions/description with proper truncation.

#### Implementation Steps

1. Add title/description section after thumbnail:
   ```typescript
   <div className="flex-1 min-w-0">
     <h3 className="font-medium text-gray-900 truncate">
       {item.title}
     </h3>
     {item.instructions && (
       <p className="text-sm text-gray-500 truncate">
         {item.instructions}
       </p>
     )}
   </div>
   ```

2. Use `min-w-0` to enable truncation in flex container
3. Use `truncate` class for single-line ellipsis

#### Verification

- [ ] Title displays with medium font weight
- [ ] Title truncates with ellipsis for long text
- [ ] Description/instructions shows when present
- [ ] Description is hidden when `item.instructions` is undefined/null
- [ ] Description truncates for long text

---

### Task 5: Implement Location Column

**Estimated Effort:** 0.15 hours (10 minutes)
**Dependencies:** Task 2 complete

#### Description

Add a dedicated column for displaying the item's location, hidden on mobile for responsive design.

#### Implementation Steps

1. Add location column after title section:
   ```typescript
   <div className="hidden md:flex w-24 items-center text-sm text-gray-500 truncate">
     {item.location || '-'}
   </div>
   ```

2. Use `hidden md:flex` for responsive hiding on mobile
3. Display dash when location is not provided

#### Verification

- [ ] Location displays when present
- [ ] Dash displays when location is undefined/null
- [ ] Column is hidden on mobile (< 768px)
- [ ] Column is visible on tablet/desktop (>= 768px)
- [ ] Long locations truncate with ellipsis

---

### Task 6: Implement Content Type Badge

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Task 2 complete

#### Description

Add the content type badge column with appropriate colors for each content type, matching the ItemCard implementation.

#### Implementation Steps

1. Create helper function for badge info:
   ```typescript
   const getContentTypeBadge = () => {
     const { contentType, media } = item;

     if (contentType === 'text-only') {
       return { label: 'TEXT', classes: 'bg-purple-100 text-purple-800 border-purple-200' };
     }
     if (contentType === 'pdf-only') {
       return { label: 'PDF', classes: 'bg-blue-100 text-blue-800 border-blue-200' };
     }
     if (contentType === 'mixed') {
       return { label: 'MIXED', classes: 'bg-orange-100 text-orange-800 border-orange-200' };
     }

     // For 'media' type, check first media item
     const firstMedia = media[0];
     if (firstMedia?.type === 'video') {
       return { label: 'VIDEO', classes: 'bg-red-100 text-red-800 border-red-200' };
     }
     return { label: 'PHOTO', classes: 'bg-green-100 text-green-800 border-green-200' };
   };
   ```

2. Add badge column:
   ```typescript
   <div className="hidden sm:flex w-20 items-center">
     <span className={cn(
       "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
       getContentTypeBadge().classes
     )}>
       {getContentTypeBadge().label}
     </span>
   </div>
   ```

#### Verification

- [ ] Badge displays correct label for each content type
- [ ] Video items show red "VIDEO" badge
- [ ] Image items show green "PHOTO" badge
- [ ] PDF items show blue "PDF" badge
- [ ] Text-only items show purple "TEXT" badge
- [ ] Mixed items show orange "MIXED" badge
- [ ] Badge is hidden on very small screens (< 640px)

---

### Task 7: Implement Tags Display with Overflow Handling

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Task 2 complete

#### Description

Add a tags column that displays up to 3 tags as compact chips, with a "+N" indicator for additional tags.

#### Implementation Steps

1. Define maximum visible tags constant:
   ```typescript
   const MAX_VISIBLE_TAGS = 3;
   ```

2. Create tags rendering function:
   ```typescript
   const renderTags = () => {
     if (!item.tags?.length) return null;

     const visibleTags = item.tags.slice(0, MAX_VISIBLE_TAGS);
     const remainingCount = item.tags.length - MAX_VISIBLE_TAGS;

     return (
       <div className="flex flex-wrap gap-1">
         {visibleTags.map((tag) => (
           <span
             key={tag}
             className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                        font-medium bg-gray-100 text-gray-700 border border-gray-200"
           >
             {tag}
           </span>
         ))}
         {remainingCount > 0 && (
           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                           font-medium bg-gray-50 text-gray-500">
             +{remainingCount}
           </span>
         )}
       </div>
     );
   };
   ```

3. Add tags column:
   ```typescript
   <div className="hidden lg:flex w-40">
     {renderTags()}
   </div>
   ```

#### Verification

- [ ] Tags display as compact chips
- [ ] Maximum 3 tags are visible
- [ ] "+N" indicator appears when more than 3 tags exist
- [ ] Column is hidden on mobile and tablet (< 1024px)
- [ ] Column is visible on large screens (>= 1024px)
- [ ] No tags section when `item.tags` is empty or undefined

---

### Task 8: Implement Date Column

**Estimated Effort:** 0.25 hours (15 minutes)
**Dependencies:** Task 2 complete

#### Description

Add a date column displaying the item's creation date in a readable format.

#### Implementation Steps

1. Create date formatting function:
   ```typescript
   const formatDate = (date: Date) => {
     return new Intl.DateTimeFormat('en-US', {
       year: 'numeric',
       month: 'short',
       day: 'numeric'
     }).format(date);
   };
   ```

2. Add date column:
   ```typescript
   <div className="hidden md:flex w-28 items-center text-sm text-gray-500">
     {formatDate(item.createdAt)}
   </div>
   ```

#### Verification

- [ ] Date displays in "Jan 3, 2026" format
- [ ] Column is hidden on mobile (< 768px)
- [ ] Column is visible on tablet/desktop (>= 768px)
- [ ] Date updates correctly for different items

---

### Task 9: Implement Selection Checkbox

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Task 2 complete

#### Description

Add the conditional selection checkbox that appears on the left side when `isSelectionMode` is true. The checkbox must stop click propagation to prevent triggering row preview.

#### Implementation Steps

1. Add checkbox section as first element in row (before thumbnail):
   ```typescript
   {isSelectionMode && (
     <div className="flex-shrink-0 w-8 flex items-center justify-center">
       <input
         type="checkbox"
         checked={isSelected}
         onChange={(e) => {
           e.stopPropagation();
           onSelectionChange(item.id, e.target.checked);
         }}
         onClick={(e) => e.stopPropagation()}
         className="w-5 h-5 rounded border-gray-300 text-blue-600
                    focus:ring-blue-500 cursor-pointer"
         aria-label={`Select ${item.title}`}
       />
     </div>
   )}
   ```

2. Ensure `stopPropagation` on both `onChange` and `onClick`

#### Verification

- [ ] Checkbox is hidden when `isSelectionMode` is false
- [ ] Checkbox is visible when `isSelectionMode` is true
- [ ] Checkbox is checked when `isSelected` is true
- [ ] Clicking checkbox calls `onSelectionChange` with correct id and state
- [ ] Clicking checkbox does NOT trigger `onPreviewClick`
- [ ] Checkbox has proper ARIA label for accessibility
- [ ] Touch target is adequate size (minimum 40px)

---

### Task 10: Implement Kebab Menu (Actions Dropdown)

**Estimated Effort:** 1 hour
**Dependencies:** Task 2 complete

#### Description

Implement the kebab menu (three dots icon) with dropdown containing Edit, Manage Assets, Duplicate, and Delete actions.

#### Implementation Steps

1. Add menu state:
   ```typescript
   const [menuOpen, setMenuOpen] = useState(false);
   const menuRef = useRef<HTMLDivElement>(null);
   ```

2. Implement click-outside detection:
   ```typescript
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
         setMenuOpen(false);
       }
     };

     if (menuOpen) {
       document.addEventListener('mousedown', handleClickOutside);
     }
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [menuOpen]);
   ```

3. Define menu items array:
   ```typescript
   const menuItems = [
     { icon: Edit, label: 'Edit', onClick: () => onEdit(item) },
     { icon: Layers, label: 'Manage Assets', onClick: () => onManageAssets?.(item), show: !!onManageAssets },
     { icon: Copy, label: 'Duplicate', onClick: () => onDuplicate?.(item), show: !!onDuplicate },
     { icon: Trash2, label: 'Delete', onClick: () => onDelete(item), danger: true },
   ];
   ```

4. Render menu button and dropdown:
   ```typescript
   <div className="flex-shrink-0 relative" ref={menuRef}>
     <button
       type="button"
       onClick={(e) => {
         e.stopPropagation();
         setMenuOpen(!menuOpen);
       }}
       className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                  rounded-lg transition-colors focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-blue-500"
       aria-label="Item actions"
       aria-haspopup="true"
       aria-expanded={menuOpen}
     >
       <MoreVertical className="w-5 h-5" />
     </button>

     {menuOpen && (
       <div
         role="menu"
         className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg
                    border border-gray-200 py-1 z-20"
       >
         {menuItems.filter((item) => item.show !== false).map((menuItem) => (
           <button
             key={menuItem.label}
             role="menuitem"
             type="button"
             onClick={(e) => {
               e.stopPropagation();
               menuItem.onClick();
               setMenuOpen(false);
             }}
             className={cn(
               "w-full flex items-center gap-2 px-4 py-2 text-sm text-left",
               "hover:bg-gray-50 transition-colors",
               menuItem.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
             )}
           >
             <menuItem.icon className="w-4 h-4" />
             {menuItem.label}
           </button>
         ))}
       </div>
     )}
   </div>
   ```

#### Verification

- [ ] Kebab button displays with three vertical dots
- [ ] Clicking kebab button opens dropdown menu
- [ ] Clicking kebab button does NOT trigger row click
- [ ] Menu closes when clicking outside
- [ ] Edit action calls `onEdit` callback
- [ ] Delete action calls `onDelete` callback
- [ ] Manage Assets only shows when `onManageAssets` is provided
- [ ] Duplicate only shows when `onDuplicate` is provided
- [ ] Delete button has red styling
- [ ] Menu has proper ARIA attributes

---

### Task 11: Implement Row Click Handler and Keyboard Navigation

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Tasks 9 and 10 complete

#### Description

Implement the row click handler for opening preview and keyboard navigation for accessibility. Ensure interactive elements (checkbox, menu) don't trigger preview.

#### Implementation Steps

1. Create click handler function:
   ```typescript
   const handleRowClick = (e: React.MouseEvent) => {
     const target = e.target as HTMLElement;
     if (
       target.tagName === 'INPUT' ||
       target.tagName === 'BUTTON' ||
       target.closest('button') ||
       target.closest('[role="menu"]')
     ) {
       return;
     }
     onPreviewClick(item);
   };
   ```

2. Create keyboard handler function:
   ```typescript
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       onPreviewClick(item);
     }
     if (e.key === 'Escape' && menuOpen) {
       setMenuOpen(false);
     }
   };
   ```

3. Add handlers to the root container:
   ```typescript
   <div
     role="row"
     tabIndex={0}
     aria-label={`Item: ${item.title}`}
     onClick={handleRowClick}
     onKeyDown={handleKeyDown}
     className={cn(/* ... */)}
   >
   ```

#### Verification

- [ ] Clicking row body triggers `onPreviewClick`
- [ ] Clicking checkbox does NOT trigger `onPreviewClick`
- [ ] Clicking menu button does NOT trigger `onPreviewClick`
- [ ] Clicking menu item does NOT trigger `onPreviewClick`
- [ ] Pressing Enter when row is focused triggers `onPreviewClick`
- [ ] Pressing Space when row is focused triggers `onPreviewClick`
- [ ] Pressing Escape closes the menu if open
- [ ] Tab navigation works to focus the row
- [ ] Focus ring is visible when row is focused via keyboard

---

### Task 12: Update Index File with Exports

**Estimated Effort:** 0.15 hours (10 minutes)
**Dependencies:** All previous tasks complete

#### Description

Update the ItemManager barrel export file to export the ItemRow component and its props type.

#### Implementation Steps

1. Open `src/components/ItemManager/index.ts`
2. Add import for ItemRow:
   ```typescript
   import { ItemRow } from './components/ItemRow';
   ```
3. Add export for ItemRow:
   ```typescript
   export { ItemRow };
   ```
4. Export `ItemRowProps` from types:
   ```typescript
   export type { ItemRowProps } from './ItemManager.types';
   ```

#### Verification

- [ ] `ItemRow` can be imported from `@/components/ItemManager`
- [ ] `ItemRowProps` type can be imported from `@/components/ItemManager`
- [ ] No circular dependency warnings
- [ ] TypeScript compilation succeeds

---

### Task 13: Create Visual Test Cases

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Task 12 complete

#### Description

Create test cases to verify all visual states of the ItemRow component.

#### Implementation Steps

1. Add ItemRow test section to test harness (e.g., `/test/item-manager/page.tsx`)
2. Create mock ItemRecord data covering these scenarios:
   - Item with video media (red VIDEO badge)
   - Item with image media (green PHOTO badge)
   - Item with PDF (blue PDF badge)
   - Text-only item (purple TEXT badge)
   - Mixed content item (orange MIXED badge)
   - Item with long title (test truncation)
   - Item with no location (verify dash displays)
   - Item with many tags (test overflow handling)
   - Item with no tags (verify empty state)
3. Render ItemRow in different states:
   - Default state (not selected, not in selection mode)
   - Selection mode active with item not selected
   - Selection mode active with item selected
   - With all optional callbacks provided
   - Without optional callbacks (Manage Assets, Duplicate hidden)

#### Mock Data Example

```typescript
const mockRowItems: ItemRecord[] = [
  {
    id: 'row-video-item',
    title: 'How to use the coffee maker in the kitchen - this is a very long title that should truncate properly',
    location: 'Kitchen',
    tags: ['appliances', 'morning', 'essential', 'daily', 'breakfast'],
    contentType: 'media',
    media: [{
      id: 'm1',
      type: 'video',
      file: new Blob(['video'], { type: 'video/mp4' }),
      order: 0,
      metadata: { mimeType: 'video/mp4', fileSize: 1024, source: 'capture' }
    }],
    instructions: 'Press the power button and wait for it to heat up',
    createdAt: new Date(),
  },
  // ... more test items for each scenario
];
```

#### Verification

- [ ] All content type badges display with correct colors
- [ ] Long titles truncate properly
- [ ] Tags display correctly with overflow indicator
- [ ] Selection checkbox appears/hides correctly
- [ ] Selected state styling applies correctly (blue background, left border)
- [ ] Kebab menu opens and closes correctly
- [ ] Rows render without console errors

---

### Task 14: Manual Functional Testing

**Estimated Effort:** 0.5 hours (30 minutes)
**Dependencies:** Task 13 complete

#### Description

Perform manual testing of all ItemRow functionality and fix any issues discovered.

#### Test Checklist

1. **Click Interactions:**
   - [ ] Clicking row body triggers preview callback
   - [ ] Clicking checkbox toggles selection
   - [ ] Clicking checkbox does NOT trigger preview
   - [ ] Clicking kebab menu opens dropdown
   - [ ] Clicking menu item triggers appropriate callback
   - [ ] Clicking outside menu closes it

2. **Keyboard Navigation:**
   - [ ] Tab moves focus to row
   - [ ] Enter on focused row triggers preview
   - [ ] Space on focused row triggers preview
   - [ ] Escape closes menu when open
   - [ ] Tab moves to next focusable element

3. **Selection Mode:**
   - [ ] Checkbox hidden when not in selection mode
   - [ ] Checkbox visible when in selection mode
   - [ ] Checkbox state reflects isSelected prop
   - [ ] Selection callback receives correct id and boolean

4. **Visual States:**
   - [ ] Default background is white
   - [ ] Hover shows gray-50 background
   - [ ] Selected shows blue-50 background with blue left border
   - [ ] Focus shows blue focus ring

5. **Menu Behavior:**
   - [ ] Edit option always visible
   - [ ] Delete option always visible with red styling
   - [ ] Manage Assets hidden when callback not provided
   - [ ] Duplicate hidden when callback not provided
   - [ ] Menu closes after action triggered

6. **Responsive Behavior:**
   - [ ] Checkbox and thumbnail always visible
   - [ ] Title always visible
   - [ ] Location hidden on mobile, visible on tablet+
   - [ ] Content type badge hidden on very small screens
   - [ ] Tags hidden on mobile/tablet, visible on desktop
   - [ ] Date hidden on mobile, visible on tablet+
   - [ ] Kebab menu always visible

7. **Thumbnail Behavior:**
   - [ ] Image loads and displays
   - [ ] Loading spinner shows during load
   - [ ] Fallback icon shows when no media
   - [ ] Appropriate icons for each media type

#### Verification

- [ ] All test checklist items pass
- [ ] No console errors during interactions
- [ ] Component behaves correctly across Chrome, Firefox, Safari
- [ ] Responsive breakpoints work as expected

---

## Implementation Summary

| Task | Description | Estimate | Files Modified |
|------|-------------|----------|----------------|
| 1 | Add ItemRowProps interface | 0.25 hr | `ItemManager.types.ts` |
| 2 | Create base component structure | 0.5 hr | `components/ItemRow.tsx` |
| 3 | Implement thumbnail with Object URL | 0.75 hr | `components/ItemRow.tsx` |
| 4 | Implement title/description section | 0.25 hr | `components/ItemRow.tsx` |
| 5 | Implement location column | 0.15 hr | `components/ItemRow.tsx` |
| 6 | Implement content type badge | 0.5 hr | `components/ItemRow.tsx` |
| 7 | Implement tags with overflow | 0.5 hr | `components/ItemRow.tsx` |
| 8 | Implement date column | 0.25 hr | `components/ItemRow.tsx` |
| 9 | Implement selection checkbox | 0.5 hr | `components/ItemRow.tsx` |
| 10 | Implement kebab menu | 1 hr | `components/ItemRow.tsx` |
| 11 | Implement click/keyboard handlers | 0.5 hr | `components/ItemRow.tsx` |
| 12 | Update index exports | 0.15 hr | `index.ts` |
| 13 | Create visual test cases | 0.5 hr | Test page |
| 14 | Manual functional testing | 0.5 hr | N/A |
| **Total** | | **6.3 hr** | |

---

## Acceptance Criteria Checklist

From REQ-059 and Overview Document:

- [x] ItemRow component file exists at `src/components/ItemManager/components/ItemRow.tsx`
- [x] Row displays thumbnail when item has media
- [x] Row shows placeholder icon when no thumbnail available
- [x] Title displayed prominently with truncation
- [x] Description/instructions displayed below title when present
- [x] Location displayed in dedicated column (hidden on mobile)
- [x] Content type badge visible with distinct styling per type
- [x] Tags displayed as chips with max 3 visible + overflow count
- [x] Creation date displayed in readable format
- [x] Row click triggers preview callback
- [x] Selection checkbox hidden by default
- [x] Selection checkbox visible when in selection mode
- [x] Checkbox triggers selection callback
- [x] Kebab menu provides Edit, Delete actions
- [x] Kebab menu has optional Manage Assets, Duplicate actions
- [x] Visual feedback on hover (background change)
- [x] Selected state styling (blue background, left border accent)
- [x] Responsive design adapts to screen width
- [x] Keyboard navigation works (Tab, Enter, Space, Escape)
- [x] ARIA labels present for accessibility
- [x] TypeScript compilation succeeds with no type errors

## Implementation Notes (2026-01-03)

All tasks completed successfully. Files created/modified:

1. **ItemManager.types.ts** - Added `ItemRowProps` interface with all required properties
2. **components/ItemRow.tsx** - Full implementation with all features:
   - Object URL management for thumbnails with proper cleanup
   - Content type badges (VIDEO, PHOTO, PDF, TEXT, MIXED)
   - Tags display with overflow handling (max 3 visible)
   - Kebab menu with click-outside detection
   - Selection mode with checkbox
   - Keyboard navigation (Enter, Space, Escape)
   - ARIA labels for accessibility
   - Responsive hiding of columns at breakpoints
3. **index.ts** - Added exports for `ItemRow` and `ItemRowProps`
4. **test/item-manager/page.tsx** - Added visual test cases for ItemRow

Build verification: `npm run build` passes with no errors.

---

## Responsive Breakpoints Summary

| Element | < 640px | 640-767px | 768-1023px | >= 1024px |
|---------|---------|-----------|------------|-----------|
| Checkbox | Visible* | Visible* | Visible* | Visible* |
| Thumbnail | Visible | Visible | Visible | Visible |
| Title | Visible | Visible | Visible | Visible |
| Location | Hidden | Hidden | Visible | Visible |
| Badge | Hidden | Visible | Visible | Visible |
| Tags | Hidden | Hidden | Hidden | Visible |
| Date | Hidden | Hidden | Visible | Visible |
| Menu | Visible | Visible | Visible | Visible |

*Checkbox only visible when `isSelectionMode` is true

---

## Related Documents

- [Overview Document](/docs/REQ-059-implement-itemrow-component-overview.md)
- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md)
- [PRD](/docs/prd/PRD_Item-capture-manager_Component.md)
- [ItemCard Detailed](/docs/REQ-058-implement-itemcard-component-detailed.md) - Parallel component
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts)
- [ItemsManagement](/src/components/ItemsManagement.tsx) - Table/list pattern reference
