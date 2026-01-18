# REQ-059: Implement ItemRow Component - Technical Overview

**Document Created:** 2026-01-03T10:30:00
**Last Modified:** 2026-01-03T10:30:00
**Request Reference:** REQ-059 (ItemRow Component for List View Display)
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.5

---

## 1. Executive Summary

This document provides a technical implementation breakdown for the `ItemRow` component (Task 1.5 in Phase 1). ItemRow is the visual representation of individual items in the ItemManager's list view. Unlike ItemCard (grid view), ItemRow displays comprehensive metadata in a horizontal row format, including tags, dates, and provides quick access to item actions via a kebab menu and selection controls via checkboxes.

### Dependencies
- **Prerequisite Tasks:**
  - Task 1.1: Directory structure and types (provides `ItemManager.types.ts`)
  - Task 1.2: Core state management hook (`useItemManagerState.ts`)
  - Task 1.3: Basic ItemManager shell (`ItemManager.tsx`)

- **Parallel Tasks:**
  - Task 1.4: ItemCard component (can be developed in parallel)

- **Dependent Tasks:**
  - Task 1.6: Grid and List views (requires ItemRow completion)

---

## 2. Component Specification

### 2.1 Purpose

ItemRow renders a single item within the ItemManager list layout, providing:
- Compact thumbnail preview of the item's primary media
- Comprehensive metadata display (title, location, tags, creation/modification dates)
- Quick action access via kebab menu (edit, delete, manage assets, duplicate)
- Selection checkbox for multi-select bulk operations
- Click interaction to open item preview (when not clicking checkbox or menu)
- Responsive design adapting to various screen widths

### 2.2 Visual Structure

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [✓] │ ┌────┐ │ Item Title                    │ Kitchen │ 📷 PHOTO │ appliances │ 2026-01-02 │ ⋮ │
│     │ │ TH │ │ Optional description text...  │         │          │ morning    │            │   │
│     │ └────┘ │                                │         │          │            │            │   │
└─────┴────────┴────────────────────────────────┴─────────┴──────────┴────────────┴────────────┴───┘
  │       │              │                           │          │         │            │           │
  │       │              │                           │          │         │            │           └─ Kebab menu
  │       │              │                           │          │         │            └─ Creation date
  │       │              │                           │          │         └─ Tags (chips)
  │       │              │                           │          └─ Content type badge
  │       │              │                           └─ Location
  │       │              └─ Title + description
  │       └─ Thumbnail (48x48 or 64x64)
  └─ Selection checkbox (conditional on selection mode)
```

### 2.3 Props Interface

```typescript
// File: src/components/ItemManager/components/ItemRow.tsx

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

  /** Action handlers for the kebab menu */
  onEdit: (item: ItemRecord) => void;
  onDelete: (item: ItemRecord) => void;
  onManageAssets?: (item: ItemRecord) => void;
  onDuplicate?: (item: ItemRecord) => void;

  /** Optional additional CSS classes */
  className?: string;
}
```

### 2.4 State Requirements

The component is stateless with respect to selection (parent controls selection state). Internal state:
- `imageLoading: boolean` - Track thumbnail image load state
- `imageError: boolean` - Track thumbnail load failure
- `menuOpen: boolean` - Track kebab menu dropdown visibility

---

## 3. Implementation Details

### 3.1 Thumbnail Rendering Strategy

**Size:** 48x48px (compact) or 64x64px (standard) - configurable via className override

1. **Primary Strategy:** Use first media item's thumbnail blob if available
2. **Fallback Strategy:** Use first media item's file blob for images
3. **Icon Fallback:** Display type-specific icon when no visual available:
   - Video: `<Play />` icon with red accent
   - Image: `<ImageIcon />` icon with green accent
   - PDF: `<FileText />` icon with blue accent
   - Text-only: `<FileText />` icon with purple accent

**URL Management Pattern (consistent with ItemCard):**
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

Display a compact badge indicating the content type:

| Content Type | Label | Colors |
|--------------|-------|--------|
| `media` (video) | VIDEO | `bg-red-100 text-red-800 border-red-200` |
| `media` (image) | PHOTO | `bg-green-100 text-green-800 border-green-200` |
| `pdf-only` | PDF | `bg-blue-100 text-blue-800 border-blue-200` |
| `text-only` | TEXT | `bg-purple-100 text-purple-800 border-purple-200` |
| `mixed` | MIXED | `bg-orange-100 text-orange-800 border-orange-200` |

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

### 3.3 Tags Display

Display tags as compact chips, with overflow handling:

```typescript
const MAX_VISIBLE_TAGS = 3;

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

### 3.4 Date Display

Display creation date in a readable format:

```typescript
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};
```

**Optional: Relative dates for recent items**
```typescript
const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return formatDate(date);
};
```

### 3.5 Selection Checkbox Behavior

1. **Visibility:** Only visible when `isSelectionMode === true`
2. **Position:** Left side of row, fixed width column
3. **Interaction:** Clicking checkbox toggles selection; does NOT trigger preview
4. **Touch Target:** Minimum 44x44px for mobile accessibility

```typescript
{isSelectionMode && (
  <div className="flex-shrink-0 w-12 flex items-center justify-center">
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

### 3.6 Kebab Menu (Action Menu)

Dropdown menu triggered by kebab (three dots) icon:

```typescript
import { MoreVertical, Edit, Trash2, Layers, Copy } from 'lucide-react';

const [menuOpen, setMenuOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

// Close menu when clicking outside
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

const menuItems = [
  { icon: Edit, label: 'Edit', onClick: () => onEdit(item) },
  { icon: Layers, label: 'Manage Assets', onClick: () => onManageAssets?.(item), show: !!onManageAssets },
  { icon: Copy, label: 'Duplicate', onClick: () => onDuplicate?.(item), show: !!onDuplicate },
  { icon: Trash2, label: 'Delete', onClick: () => onDelete(item), danger: true },
];

// Menu rendering
<div className="relative" ref={menuRef}>
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
    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg
                    border border-gray-200 py-1 z-20">
      {menuItems.filter(item => item.show !== false).map((menuItem) => (
        <button
          key={menuItem.label}
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

### 3.7 Selected State Styling

When `isSelected === true`:
- Background color change: `bg-blue-50`
- Left border accent: `border-l-4 border-l-blue-500`

```typescript
<div className={cn(
  "flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200",
  "hover:bg-gray-50 transition-colors cursor-pointer",
  isSelected && "bg-blue-50 border-l-4 border-l-blue-500"
)}>
```

### 3.8 Click Handling

- **Row Click:** Triggers `onPreviewClick(item)` unless clicking on checkbox, menu, or menu items
- **Checkbox Click:** Triggers `onSelectionChange(id, selected)`, stops propagation
- **Menu Button Click:** Opens menu dropdown, stops propagation
- **Menu Item Click:** Executes action, closes menu, stops propagation

```typescript
const handleRowClick = (e: React.MouseEvent) => {
  // Check if click was on an interactive element
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

---

## 4. Existing Patterns to Follow

### 4.1 Table Row Pattern (ItemsManagement.tsx)

**Key elements to adopt:**
- `<tr>` or flexbox row structure
- `hover:bg-gray-50` for hover states
- `divide-y divide-gray-200` for row separation
- Column-based layout with consistent widths
- Action buttons in rightmost column

### 4.2 Thumbnail Pattern (MediaThumbnail.tsx / ItemCard.tsx)

**Key elements to adopt:**
- Object URL creation with `useMemo`
- Cleanup via `useEffect` return
- `imageLoading` / `imageError` state handling
- Loading spinner centered in container
- Error fallback with type-specific icon
- `object-cover` for image display
- `rounded-lg` for thumbnail container

### 4.3 Dropdown Menu Pattern

**Key elements to adopt:**
- `useRef` for menu container
- Click-outside detection for closing
- `position: absolute` with `z-index`
- `focus-visible` styling for keyboard navigation
- Proper ARIA attributes (`aria-haspopup`, `aria-expanded`)

### 4.4 Styling Utilities

Use the established `cn()` utility from `@/lib/utils`:
```typescript
import { cn } from '@/lib/utils';
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemRow.tsx` | Main ItemRow component |

### 5.2 Files to Import From (Read Only)

| File Path | Imports |
|-----------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | `ItemRecord` |
| `src/lib/utils.ts` | `cn` utility function |
| `lucide-react` | `MoreVertical`, `Edit`, `Trash2`, `Layers`, `Copy`, `Play`, `FileText`, `ImageIcon` icons |

### 5.3 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `ItemRowProps` interface if not present |
| `src/components/ItemManager/index.ts` | Export `ItemRow` and `ItemRowProps` |

---

## 6. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Layout | Flexbox row | More flexible than table for responsive behavior; easier to control column widths |
| Thumbnail size | 48x48px default | Compact enough for list view while still recognizable |
| Menu implementation | Local state dropdown | Simpler than Radix Dropdown for this use case; full control over styling |
| Tags overflow | Max 3 visible + count | Prevents row height explosion while showing most important tags |
| Date format | Short month format | Compact and readable; consistent with common UI patterns |
| Selection state | Parent-controlled | Centralized state in useItemManagerState reducer |

---

## 7. Accessibility Requirements

1. **Keyboard Navigation:**
   - Row should be focusable via tab
   - Enter/Space triggers preview action
   - Checkbox separately focusable in selection mode
   - Menu button focusable with Enter to open
   - Arrow keys for menu navigation (optional for V1)
   - Escape closes menu

2. **ARIA Labels:**
   - Checkbox: `aria-label="Select {item.title}"`
   - Row: `role="row"` with appropriate structure
   - Menu button: `aria-label="Item actions"`, `aria-haspopup="true"`, `aria-expanded`
   - Menu: `role="menu"` with `role="menuitem"` for items

3. **Focus Indicators:**
   - Visible focus ring on row focus
   - Standard checkbox focus styling
   - Menu button focus ring

```typescript
<div
  role="row"
  tabIndex={0}
  aria-label={`Item: ${item.title}`}
  onClick={handleRowClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPreviewClick(item);
    }
  }}
  className={cn(
    // ... other classes
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
  )}
>
```

---

## 8. Acceptance Criteria Mapping

| Criteria | Implementation |
|----------|----------------|
| ItemRow component file exists | Create `src/components/ItemManager/components/ItemRow.tsx` |
| Row displays thumbnail when item has media | Use first media item's thumbnail/blob with Object URL |
| Row shows placeholder when no thumbnail | Display type-specific icon with gradient background |
| Title displayed prominently | Font-medium or font-semibold, truncate with ellipsis |
| Location displayed | Separate column, text-gray-500 |
| Tags displayed as chips | `flex gap-1` with chip styling, max 3 visible |
| Creation date displayed | Formatted date in dedicated column |
| Content type badge visible | Inline badge near title or in dedicated column |
| Row click triggers preview | `onClick` handler calls `onPreviewClick(item)` |
| Checkbox hidden by default | Conditional render based on `isSelectionMode` |
| Checkbox triggers selection | `onChange` calls `onSelectionChange(id, checked)` |
| Kebab menu accessible | `MoreVertical` icon button with dropdown |
| Menu has Edit, Delete options | Menu items with proper callbacks |
| Menu has optional Manage Assets, Duplicate | Conditional render based on callback presence |
| Visual feedback on hover | `hover:bg-gray-50` transition |
| Responsive to list width | Flex-shrink/grow on appropriate columns |
| TypeScript compilation | Full type safety with explicit interfaces |

---

## 9. Testing Considerations

### 9.1 Unit Test Cases

1. **Rendering:**
   - Renders with minimal props (item, callbacks)
   - Displays title correctly
   - Displays location when provided
   - Shows placeholder when no media
   - Shows tags when provided
   - Shows formatted date

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
   - Checkbox click does NOT trigger onPreviewClick

4. **Clicks:**
   - Row click triggers onPreviewClick
   - Menu button click opens menu
   - Menu item click triggers appropriate callback
   - Menu closes after item click
   - Keyboard Enter triggers onPreviewClick

5. **Menu:**
   - Menu opens on button click
   - Menu closes on outside click
   - Menu closes on Escape key
   - Optional items hidden when callback not provided

### 9.2 Visual Test Cases

1. List of various content types
2. Long titles (truncation)
3. Missing locations
4. Many tags (overflow handling)
5. Selection mode on/off
6. Hover states
7. Menu open state
8. Mobile touch targets
9. Various date formats

---

## 10. Implementation Sequence

1. **Create file structure:**
   - Create `ItemRow.tsx` in `src/components/ItemManager/components/`

2. **Add type definitions:**
   - Add `ItemRowProps` to `ItemManager.types.ts`

3. **Implement base row:**
   - Row container with Tailwind flexbox classes
   - Thumbnail area with fixed dimensions
   - Content section with title/location

4. **Add thumbnail logic:**
   - Object URL management
   - Loading/error states
   - Fallback icons

5. **Add metadata columns:**
   - Location column
   - Content type badge
   - Tags with overflow
   - Date column

6. **Add selection mode:**
   - Conditional checkbox column
   - Selected state styling
   - Click handling separation

7. **Implement kebab menu:**
   - Menu button with icon
   - Dropdown positioning
   - Menu items with callbacks
   - Click-outside handling

8. **Add accessibility:**
   - ARIA labels
   - Keyboard handlers
   - Focus styling

9. **Export from index:**
   - Update barrel export

---

## 11. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Full component plan
- [PRD](/docs/prd/PRD_Item-capture-manager_Component.md) - Product requirements
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - Type definitions to reuse
- [ItemsManagement](/src/components/ItemsManagement.tsx) - Table/list pattern reference
- [ItemCard Overview](/docs/REQ-058-implement-itemcard-component-overview.md) - Parallel grid component
- [MediaThumbnail](/src/components/ItemCapture/components/shared/MediaThumbnail.tsx) - Thumbnail pattern reference

---

## 12. Estimated Effort

| Task | Estimate |
|------|----------|
| File creation and base structure | 0.5 hours |
| Thumbnail rendering with URL management | 0.5 hours |
| Metadata columns (location, tags, date) | 1 hour |
| Content type badge implementation | 0.25 hours |
| Selection mode and click handling | 0.75 hours |
| Kebab menu with dropdown | 1.5 hours |
| Accessibility and keyboard navigation | 0.5 hours |
| Testing and refinement | 1 hour |
| **Total** | **6 hours** |

---

## 13. Responsive Behavior

### 13.1 Desktop (>1024px)
- All columns visible
- Full tag display (up to 3)
- Comfortable spacing

### 13.2 Tablet (768px - 1024px)
- Hide location column or combine with title
- Reduce tag display (up to 2)
- Compact date format

### 13.3 Mobile (<768px)
- Stack title and metadata vertically
- Hide date column (show in detail view)
- Tags as single "+ n tags" indicator
- Larger touch targets for checkbox and menu

```typescript
// Responsive column visibility
<div className="hidden md:flex w-32 items-center text-sm text-gray-500">
  {item.location}
</div>

// Responsive tag display
<div className="hidden sm:flex flex-wrap gap-1">
  {renderTags()}
</div>
```

---

## Appendix A: Complete Component Skeleton

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
import type { ItemRecord } from '../ItemManager.types';

export interface ItemRowProps {
  item: ItemRecord;
  onPreviewClick: (item: ItemRecord) => void;
  onSelectionChange: (id: string, selected: boolean) => void;
  isSelected: boolean;
  isSelectionMode: boolean;
  onEdit: (item: ItemRecord) => void;
  onDelete: (item: ItemRecord) => void;
  onManageAssets?: (item: ItemRecord) => void;
  onDuplicate?: (item: ItemRecord) => void;
  className?: string;
}

const MAX_VISIBLE_TAGS = 3;

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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Object URL management
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

  // Close menu on outside click
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

  // Content type badge logic
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
    const firstMedia = media[0];
    if (firstMedia?.type === 'video') {
      return { label: 'VIDEO', classes: 'bg-red-100 text-red-800 border-red-200' };
    }
    return { label: 'PHOTO', classes: 'bg-green-100 text-green-800 border-green-200' };
  };

  // Date formatting
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Tags rendering
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

  // Click handler
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

  // Menu items
  const menuItems = [
    { icon: Edit, label: 'Edit', onClick: () => onEdit(item) },
    { icon: Layers, label: 'Manage Assets', onClick: () => onManageAssets?.(item), show: !!onManageAssets },
    { icon: Copy, label: 'Duplicate', onClick: () => onDuplicate?.(item), show: !!onDuplicate },
    { icon: Trash2, label: 'Delete', onClick: () => onDelete(item), danger: true },
  ];

  const badge = getContentTypeBadge();

  return (
    <div
      role="row"
      tabIndex={0}
      aria-label={`Item: ${item.title}`}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreviewClick(item);
        }
        if (e.key === 'Escape' && menuOpen) {
          setMenuOpen(false);
        }
      }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200",
        "hover:bg-gray-50 transition-colors cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
        isSelected && "bg-blue-50 border-l-4 border-l-blue-500",
        className
      )}
    >
      {/* Selection Checkbox */}
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

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
        {/* Thumbnail image or fallback icon */}
      </div>

      {/* Title & Description */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
        {item.instructions && (
          <p className="text-sm text-gray-500 truncate">{item.instructions}</p>
        )}
      </div>

      {/* Location */}
      <div className="hidden md:flex w-24 items-center text-sm text-gray-500 truncate">
        {item.location || '-'}
      </div>

      {/* Content Type Badge */}
      <div className="hidden sm:flex w-20 items-center">
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
          badge.classes
        )}>
          {badge.label}
        </span>
      </div>

      {/* Tags */}
      <div className="hidden lg:flex w-40">
        {renderTags()}
      </div>

      {/* Date */}
      <div className="hidden md:flex w-28 items-center text-sm text-gray-500">
        {formatDate(item.createdAt)}
      </div>

      {/* Actions Menu */}
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
    </div>
  );
}

export default ItemRow;
```
