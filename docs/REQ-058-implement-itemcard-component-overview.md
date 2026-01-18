# REQ-058: Implement ItemCard Component - Technical Overview

**Document Created:** 2026-01-03T09:15:00
**Last Modified:** 2026-01-03T09:15:00
**Request Reference:** REQ-058 (ItemCard Component for Grid View Display)
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.4

---

## 1. Executive Summary

This document provides a technical implementation breakdown for the `ItemCard` component (Task 1.4 in Phase 1). ItemCard is the visual representation of individual items in the ItemManager's grid view. It displays item thumbnails, metadata (title, location), content type badges, and supports both preview click actions and selection mode checkboxes.

### Dependencies
- **Prerequisite Tasks:**
  - Task 1.1: Directory structure and types (provides `ItemManager.types.ts`)
  - Task 1.2: Core state management hook (`useItemManagerState.ts`)
  - Task 1.3: Basic ItemManager shell (`ItemManager.tsx`)

- **Parallel Tasks:**
  - Task 1.5: ItemRow component (can be developed in parallel)

- **Dependent Tasks:**
  - Task 1.6: Grid and List views (requires ItemCard completion)

---

## 2. Component Specification

### 2.1 Purpose

ItemCard renders a single item within the ItemManager grid layout, providing:
- Visual thumbnail preview of the item's primary media
- Content type badge indicating media/content type (video, photo, PDF, text, mixed)
- Item metadata display (title, location)
- Click interaction to open item preview
- Selection checkbox for multi-select bulk operations
- Responsive design adapting to grid column widths

### 2.2 Visual Structure

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │       THUMBNAIL AREA            │ │ ← aspect-video (16:9)
│ │                                 │ │
│ │  [✓] checkbox (selection mode)  │ │ ← Top-left, conditional
│ │                     [BADGE]     │ │ ← Top-right content type
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Item Title (truncated)          │ │ ← line-clamp-2
│ │ Location • Room Name            │ │ ← text-sm, text-gray-500
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2.3 Props Interface

```typescript
// File: src/components/ItemManager/components/ItemCard.tsx

export interface ItemCardProps {
  /** The item record to display */
  item: ItemRecord;

  /** Callback when card is clicked (for preview) */
  onPreviewClick: (item: ItemRecord) => void;

  /** Callback when selection checkbox changes */
  onSelectionChange: (id: string, selected: boolean) => void;

  /** Whether the card is currently selected */
  isSelected: boolean;

  /** Whether selection mode is active (shows checkbox) */
  isSelectionMode: boolean;

  /** Optional additional CSS classes */
  className?: string;
}
```

### 2.4 State Requirements

The component is stateless with respect to selection (parent controls selection state). Internal state:
- `imageLoading: boolean` - Track thumbnail image load state
- `imageError: boolean` - Track thumbnail load failure

---

## 3. Implementation Details

### 3.1 Thumbnail Rendering Strategy

1. **Primary Strategy:** Use first media item's thumbnail blob if available
2. **Fallback Strategy:** Use first media item's file blob for images
3. **Icon Fallback:** Display type-specific icon when no visual available:
   - Video: `<Play />` icon with red accent
   - Image: `<ImageIcon />` icon with green accent
   - PDF: `<FileText />` icon with blue accent
   - Text-only: `<FileText />` icon with purple accent

**URL Management Pattern (from MediaThumbnail.tsx):**
```typescript
const objectUrl = useMemo(() => {
  const firstMedia = item.media[0];
  if (!firstMedia) return null;
  const blob = firstMedia.thumbnail || (firstMedia.type === 'image' ? firstMedia.file : null);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}, [item.media]);

useEffect(() => {
  return () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
}, [objectUrl]);
```

### 3.2 Content Type Badge

Display a badge in the top-right corner indicating the content type:

| Content Type | Label | Colors |
|--------------|-------|--------|
| `media` (video) | VIDEO | `bg-red-100 text-red-800 border-red-200` |
| `media` (image) | PHOTO | `bg-green-100 text-green-800 border-green-200` |
| `pdf-only` | PDF | `bg-blue-100 text-blue-800 border-blue-200` |
| `text-only` | TEXT | `bg-purple-100 text-purple-800 border-purple-200` |
| `mixed` | MIXED | `bg-orange-100 text-orange-800 border-orange-200` |

**Badge Pattern (from LinkCard.tsx):**
```typescript
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
  {label}
</span>
```

### 3.3 Selection Checkbox Behavior

1. **Visibility:** Only visible when `isSelectionMode === true`
2. **Position:** Top-left corner of thumbnail area, absolute positioned
3. **Interaction:** Clicking checkbox toggles selection; does NOT trigger preview
4. **Styling:** Semi-transparent background for visibility over any thumbnail

```typescript
{isSelectionMode && (
  <div className="absolute top-2 left-2 z-10">
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => {
        e.stopPropagation();
        onSelectionChange(item.id, e.target.checked);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-5 h-5 rounded border-gray-300 text-blue-600
                 focus:ring-blue-500 bg-white/80 cursor-pointer"
      aria-label={`Select ${item.title}`}
    />
  </div>
)}
```

### 3.4 Selected State Styling

When `isSelected === true`:
- Border color change: `border-blue-500`
- Ring effect: `ring-2 ring-blue-200`
- Background tint: Optional subtle blue overlay on thumbnail

```typescript
<div className={cn(
  "group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200",
  "hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden",
  isSelected && "border-blue-500 ring-2 ring-blue-200"
)}>
```

### 3.5 Click Handling

- **Card Click:** Triggers `onPreviewClick(item)` unless clicking on checkbox
- **Checkbox Click:** Triggers `onSelectionChange(id, selected)`, stops propagation
- **Hover State:** Scale effect on thumbnail (similar to LinkCard pattern)

```typescript
const handleCardClick = (e: React.MouseEvent) => {
  // Don't trigger preview if clicking checkbox
  if ((e.target as HTMLElement).tagName === 'INPUT') {
    return;
  }
  onPreviewClick(item);
};
```

---

## 4. Existing Patterns to Follow

### 4.1 Card Component Pattern (LinkCard.tsx)

**Key elements to adopt:**
- `group` class for hover state coordination
- `cursor-pointer` on card root
- `aspect-video` for thumbnail area
- `overflow-hidden` on card and thumbnail containers
- `rounded-xl shadow-sm border border-gray-200`
- `hover:shadow-lg hover:border-gray-300`
- `transition-all duration-200`
- `group-hover:scale-105` on thumbnail image

### 4.2 Thumbnail Pattern (MediaThumbnail.tsx)

**Key elements to adopt:**
- Object URL creation with `useMemo`
- Cleanup via `useEffect` return
- `imageLoading` / `imageError` state handling
- Loading spinner centered in container
- Error fallback with type-specific icon
- `object-cover` for image display

### 4.3 Styling Utilities

Use the established `cn()` utility from `@/lib/utils`:
```typescript
import { cn } from '@/lib/utils';
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemCard.tsx` | Main ItemCard component |

### 5.2 Files to Import From (Read Only)

| File Path | Imports |
|-----------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | `ItemRecord`, `ItemCardProps` (add to types file) |
| `src/lib/utils.ts` | `cn` utility function |
| `lucide-react` | `Play`, `FileText`, `ImageIcon`, `Video` icons |

### 5.3 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `ItemCardProps` interface if not present |
| `src/components/ItemManager/index.ts` | Export `ItemCard` and `ItemCardProps` |

---

## 6. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Thumbnail rendering | Object URL from blob | Consistent with MediaThumbnail pattern; proper memory management |
| Selection state | Parent-controlled | Centralized state in useItemManagerState reducer |
| Badge styling | Inline with Tailwind | Matches LinkCard pattern; no separate component needed |
| Click handling | Event delegation | Single click handler with propagation control |
| Responsive | Fluid within grid | Parent ItemGrid controls column sizing |

---

## 7. Accessibility Requirements

1. **Keyboard Navigation:**
   - Card should be focusable via tab
   - Enter/Space triggers preview action
   - Checkbox separately focusable in selection mode

2. **ARIA Labels:**
   - Checkbox: `aria-label="Select {item.title}"`
   - Card: `role="button"` with `aria-label="View {item.title}"`
   - Badge: Decorative (no ARIA needed)

3. **Focus Indicators:**
   - Visible focus ring on card focus
   - Standard checkbox focus styling

```typescript
<div
  role="button"
  tabIndex={0}
  aria-label={`View ${item.title}`}
  onClick={handleCardClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPreviewClick(item);
    }
  }}
  className={cn(
    // ... other classes
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
  )}
>
```

---

## 8. Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| ItemCard component file exists | Create `src/components/ItemManager/components/ItemCard.tsx` |
| Card displays thumbnail when item has media | Use first media item's thumbnail/blob with Object URL |
| Card shows placeholder when no thumbnail | Display type-specific icon with gradient background |
| Title with truncation | `line-clamp-2` class on title element |
| Location below title | Conditional render of `item.location` |
| Content type badge visible | Absolute positioned badge in thumbnail area |
| Card click triggers preview | `onClick` handler calls `onPreviewClick(item)` |
| Checkbox hidden by default | Conditional render based on `isSelectionMode` |
| Checkbox triggers selection | `onChange` calls `onSelectionChange(id, checked)` |
| Visual feedback on hover/active | Tailwind transition classes for shadow, scale |
| Responsive to grid widths | No fixed width; uses 100% of grid cell |
| TypeScript compilation | Full type safety with explicit interfaces |

---

## 9. Testing Considerations

### 9.1 Unit Test Cases

1. **Rendering:**
   - Renders with minimal props (item, callbacks)
   - Displays title correctly
   - Displays location when provided
   - Shows placeholder when no media

2. **Thumbnail:**
   - Creates Object URL from blob
   - Revokes URL on unmount
   - Shows loading state
   - Falls back to icon on error

3. **Selection:**
   - Checkbox hidden when not in selection mode
   - Checkbox visible when in selection mode
   - Checkbox state matches isSelected prop
   - Checkbox change calls onSelectionChange

4. **Clicks:**
   - Card click triggers onPreviewClick
   - Checkbox click does NOT trigger onPreviewClick
   - Keyboard Enter triggers onPreviewClick

### 9.2 Visual Test Cases

1. Grid of various content types
2. Long titles (truncation)
3. Missing locations
4. Selection mode on/off
5. Hover states
6. Mobile touch targets

---

## 10. Implementation Sequence

1. **Create file structure:**
   - Create `ItemCard.tsx` in `src/components/ItemManager/components/`

2. **Add type definitions:**
   - Add `ItemCardProps` to `ItemManager.types.ts`

3. **Implement base card:**
   - Card container with Tailwind classes
   - Thumbnail area with aspect ratio
   - Content section with title/location

4. **Add thumbnail logic:**
   - Object URL management
   - Loading/error states
   - Fallback icons

5. **Add content type badge:**
   - Badge styling per content type
   - Position in thumbnail area

6. **Add selection mode:**
   - Conditional checkbox
   - Selected state styling
   - Click handling separation

7. **Add accessibility:**
   - ARIA labels
   - Keyboard handlers
   - Focus styling

8. **Export from index:**
   - Update barrel export

---

## 11. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Full component plan
- [PRD](/docs/prd/PRD_Item-capture-manager_Component.md) - Product requirements
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - Type definitions to reuse
- [LinkCard](/src/components/LinkCard.tsx) - Card pattern reference
- [MediaThumbnail](/src/components/ItemCapture/components/shared/MediaThumbnail.tsx) - Thumbnail pattern reference

---

## 12. Estimated Effort

| Task | Estimate |
|------|----------|
| File creation and base structure | 0.5 hours |
| Thumbnail rendering with URL management | 1 hour |
| Content type badge implementation | 0.5 hours |
| Selection mode and click handling | 1 hour |
| Accessibility and keyboard navigation | 0.5 hours |
| Testing and refinement | 1 hour |
| **Total** | **4.5 hours** |

---

## Appendix A: Complete Component Skeleton

```typescript
'use client';

/**
 * ItemCard Component
 *
 * Displays an individual item in the ItemManager grid view.
 * Features thumbnail preview, content type badge, metadata display,
 * and selection mode support.
 *
 * @module ItemManager/components/ItemCard
 * @lastModified 2026-01-03 (REQ-058)
 */

import { useState, useEffect, useMemo } from 'react';
import { Play, FileText, ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '../ItemManager.types';

export interface ItemCardProps {
  item: ItemRecord;
  onPreviewClick: (item: ItemRecord) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  isSelected: boolean;
  isSelectionMode: boolean;
  className?: string;
}

export function ItemCard({
  item,
  onPreviewClick,
  onSelectionChange,
  isSelected,
  isSelectionMode,
  className,
}: ItemCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Object URL management
  const objectUrl = useMemo(() => {
    // Implementation here
  }, [item.media]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Content type badge logic
  const getContentTypeBadge = () => {
    // Implementation here
  };

  // Click handler
  const handleCardClick = (e: React.MouseEvent) => {
    // Implementation here
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${item.title}`}
      onClick={handleCardClick}
      className={cn(
        "group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200",
        "hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isSelected && "border-blue-500 ring-2 ring-blue-200",
        className
      )}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {/* Thumbnail image or fallback */}
        {/* Selection checkbox */}
        {/* Content type badge */}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        {item.location && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {item.location}
          </p>
        )}
      </div>
    </div>
  );
}

export default ItemCard;
```
