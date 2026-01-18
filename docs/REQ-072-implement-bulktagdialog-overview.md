# REQ-072: Implement BulkTagDialog - Technical Implementation Overview

**Document Created:** 2026-01-03T19:30:00
**Last Modified:** 2026-01-03T19:30:00
**Request Reference:** REQ-072 (Bulk Tag Management Dialog)
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 3 - Selection & Bulk Actions
**Task ID:** 3.5

---

## 1. Executive Summary

This document provides the technical implementation breakdown for building the `BulkTagDialog` component (Task 3.5 in Phase 3). This dialog enables users to add or remove tags from multiple selected items simultaneously, with autocomplete suggestions and a preview of affected items.

### Scope

The `BulkTagDialog` component will:
- Display as a modal dialog when triggered from BulkActionsBar
- Support two modes: "add tags" and "remove tags"
- Provide a tag input field with autocomplete suggestions from existing tags
- Show a preview list of items that will be affected by the operation
- Allow users to confirm or cancel the bulk tag operation
- Emit appropriate callbacks for tag modifications

### Dependencies

- **Prerequisite Tasks:**
  - Task 3.1: `useItemSelection` hook (`src/components/ItemManager/hooks/useItemSelection.ts`)
  - Task 3.2: Selection UI Integration (checkboxes, selection mode)
  - Task 3.3: BulkActionsBar component (`src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`)
  - Task 1.1: ItemManager types (`src/components/ItemManager/ItemManager.types.ts`)

- **Parallel Tasks:**
  - Task 3.4: ConfirmDeleteDialog (can be developed simultaneously)

- **Downstream Tasks:**
  - Task 3.6: BulkMoveDialog (similar dialog pattern)

---

## 2. Technical Context

### 2.1 Existing Stack & Patterns

| Technology | Details | Source |
|------------|---------|--------|
| Framework | Next.js 15.5.9 with React 19.1.0 | `package.json` |
| Language | TypeScript 5.x (strict mode) | `tsconfig.json` |
| Styling | Tailwind CSS 4.x with `cn()` utility | `src/lib/utils.ts` |
| Icons | Lucide React 0.525.0 | `package.json` |
| UI Primitives | Radix UI (dialog, dropdown) | `package.json` |
| Modal Pattern | Fixed overlay with centered card | `src/components/ConfirmationModal.tsx` |

### 2.2 Reference Patterns from Codebase

**Modal Pattern (from `src/components/ConfirmationModal.tsx`):**
```typescript
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
    {/* Content */}
  </div>
</div>
```

**Tag Input Pattern (from `src/components/ItemCapture/components/steps/MetadataStep.tsx:495-587`):**
```typescript
// Pill-based tag display with embedded input
<div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px]">
  {tags.map(tag => (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
      {tag}
      <button onClick={() => removeTag(tag)}>
        <X className="w-3 h-3" />
      </button>
    </span>
  ))}
  <input className="flex-1 min-w-[120px] px-2 py-1 outline-none bg-transparent" />
</div>

// Suggested tags section
<div className="flex flex-wrap gap-2">
  {suggestions.map(tag => (
    <button className="px-3 py-1.5 rounded-full border border-gray-300 text-sm">
      + {tag}
    </button>
  ))}
</div>
```

### 2.3 Types from Implementation Plan

From `ItemManager.types.ts`:

```typescript
// Item record with tags
interface ItemRecord {
  id: string;
  title: string;
  tags?: string[];
  // ... other fields
}

// Callback for item updates
onUpdateItem: (item: ItemRecord) => void;
```

### 2.4 Integration with BulkActionsBar

From REQ-070 BulkActionsBar implementation:

```typescript
// BulkActionsBar triggers tag dialogs
<ActionButton
  icon={Tag}
  label="Add Tag"
  onClick={onAddTag}  // Opens BulkTagDialog in 'add' mode
  variant="primary"
/>

<ActionButton
  icon={Minus}
  label="Remove Tag"
  onClick={onRemoveTag}  // Opens BulkTagDialog in 'remove' mode
  variant="secondary"
/>
```

---

## 3. Implementation Approach

### 3.1 Component Architecture

The `BulkTagDialog` is a modal component that manages its own tag input state while receiving selected items and callbacks from the parent.

```typescript
interface BulkTagDialogProps {
  /** Dialog mode - determines add or remove operation */
  mode: 'add' | 'remove';

  /** Array of selected items to apply tag operation to */
  selectedItems: ItemRecord[];

  /** All existing tags in the system for autocomplete suggestions */
  existingTags: string[];

  /** Callback when tags are confirmed */
  onConfirm: (tags: string[]) => void;

  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;

  /** Loading state during operation */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}
```

### 3.2 Visual Layout

**Add Mode Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  ✕                                                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏷️ Add Tags to 5 Items                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [tag1] [tag2] [Type to add tag...]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Suggested tags:                                                │
│  ┌──────┐ ┌────────┐ ┌─────────┐ ┌──────────┐                  │
│  │+wifi │ │+kitchen│ │+bedroom │ │+bathroom │                  │
│  └──────┘ └────────┘ └─────────┘ └──────────┘                  │
│                                                                 │
│  Items to be tagged:                                            │
│  • Coffee Maker                                                 │
│  • Dishwasher                                                   │
│  • Smart Thermostat                                             │
│  • (and 2 more...)                                              │
│                                                                 │
│  ┌──────────┐  ┌──────────────────┐                            │
│  │  Cancel  │  │   Add 2 Tags     │                            │
│  └──────────┘  └──────────────────┘                            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Remove Mode Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  ✕                                                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🗑️ Remove Tags from 5 Items                                   │
│                                                                 │
│  Tags to remove:                                                │
│  ┌──────────┐ ┌────────────┐ ┌─────────────┐                   │
│  │ ☐ wifi   │ │ ☑ kitchen  │ │ ☐ appliance │                   │
│  └──────────┘ └────────────┘ └─────────────┘                   │
│                                                                 │
│  Items affected:                                                │
│  • Coffee Maker (has: kitchen, appliance)                       │
│  • Dishwasher (has: kitchen, appliance)                         │
│  • Smart Thermostat (has: wifi)                                 │
│  • (and 2 more...)                                              │
│                                                                 │
│  ┌──────────┐  ┌────────────────────┐                          │
│  │  Cancel  │  │   Remove 1 Tag     │                          │
│  └──────────┘  └────────────────────┘                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 3.3 State Management

```typescript
// Internal state for add mode
const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
const [tagInputValue, setTagInputValue] = useState('');

// Internal state for remove mode
const [tagsToRemove, setTagsToRemove] = useState<Set<string>>(new Set());

// Computed values
const allTagsOnSelectedItems = useMemo(() => {
  const tagSet = new Set<string>();
  selectedItems.forEach(item => {
    (item.tags || []).forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}, [selectedItems]);

const filteredSuggestions = useMemo(() => {
  return existingTags.filter(tag =>
    !tagsToAdd.includes(tag) &&
    tag.toLowerCase().includes(tagInputValue.toLowerCase())
  );
}, [existingTags, tagsToAdd, tagInputValue]);
```

### 3.4 Mode-Specific Behavior

**Add Mode:**
- User types in input field or selects from suggestions
- Multiple tags can be added before confirming
- Shows all existing system tags as suggestions (minus already-added tags)
- Confirmation adds all selected tags to all selected items

**Remove Mode:**
- Shows checkbox list of all tags present on selected items
- User selects which tags to remove
- Preview shows which items have each tag
- Confirmation removes selected tags from all items that have them

### 3.5 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Escape** | Close dialog without saving |
| **Enter** | Add typed tag (add mode) / Confirm operation |
| **Backspace** | Remove last tag when input empty (add mode) |

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Main bulk tag dialog component |

### 4.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemManager/components/BulkActions/index.ts` | Add export for BulkTagDialog |
| `src/components/ItemManager/ItemManager.tsx` | Add tag dialog state and handlers |
| `src/components/ItemManager/ItemManager.types.ts` | Add BulkTagDialogProps interface if not present |

### 4.3 Functions to Implement

| Function | File | Purpose |
|----------|------|---------|
| `BulkTagDialog` | `BulkTagDialog.tsx` | Main component function |
| `TagInput` | `BulkTagDialog.tsx` | Internal tag input with pills component |
| `TagCheckboxList` | `BulkTagDialog.tsx` | Internal checkbox list for remove mode |
| `ItemPreviewList` | `BulkTagDialog.tsx` | Internal component showing affected items |
| `handleBulkTagConfirm` | `ItemManager.tsx` | Process tag additions/removals |
| `collectExistingTags` | `ItemManager.tsx` | Gather all unique tags from items |

---

## 5. Detailed Task Breakdown

### Task 3.5.1: Create BulkTagDialog Component Structure

**File:** `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`

```typescript
'use client';

/**
 * BulkTagDialog Component
 *
 * Modal dialog for adding or removing tags from multiple selected items.
 * Supports two modes: 'add' for applying new tags and 'remove' for
 * stripping existing tags from selected items.
 *
 * @module ItemManager/components/BulkActions/BulkTagDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.5)
 * @lastModified 2026-01-03 (REQ-072)
 */

import React, { useState, useMemo, useCallback, useRef, useEffect, useId } from 'react';
import { X, Tag, Minus, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface BulkTagDialogProps {
  /** Dialog mode - determines add or remove operation */
  mode: 'add' | 'remove';

  /** Array of selected items to apply tag operation to */
  selectedItems: ItemRecord[];

  /** All existing tags in the system for autocomplete suggestions */
  existingTags: string[];

  /** Callback when tags are confirmed */
  onConfirm: (tags: string[]) => void;

  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;

  /** Loading state during operation */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_PREVIEW_ITEMS = 5;
const MAX_TAG_LENGTH = 30;
const MAX_TAGS_TO_ADD = 10;

// =============================================================================
// Internal Components
// =============================================================================

// TagInput - pill-based input for add mode
// TagCheckboxList - checkbox list for remove mode
// ItemPreviewList - shows affected items

// =============================================================================
// Main Component
// =============================================================================

export function BulkTagDialog({
  mode,
  selectedItems,
  existingTags,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: BulkTagDialogProps) {
  // ... implementation
}

export default BulkTagDialog;
```

### Task 3.5.2: Implement Add Mode UI

The add mode provides:
- Tag input field with pill display
- Autocomplete suggestions from existing tags
- Ability to add custom tags
- Preview of items to receive tags

```typescript
// State for add mode
const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
const [tagInputValue, setTagInputValue] = useState('');
const tagInputRef = useRef<HTMLInputElement>(null);

// Add tag handler
const handleAddTag = useCallback((tag: string) => {
  const trimmedTag = tag.trim().toLowerCase();
  if (!trimmedTag) return;
  if (tagsToAdd.includes(trimmedTag)) return;
  if (tagsToAdd.length >= MAX_TAGS_TO_ADD) return;
  if (trimmedTag.length > MAX_TAG_LENGTH) return;

  setTagsToAdd(prev => [...prev, trimmedTag]);
  setTagInputValue('');
  tagInputRef.current?.focus();
}, [tagsToAdd]);

// Remove tag from pending list
const handleRemoveTagFromList = useCallback((tag: string) => {
  setTagsToAdd(prev => prev.filter(t => t !== tag));
}, []);

// Keyboard handler
const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' && tagInputValue.trim()) {
    e.preventDefault();
    handleAddTag(tagInputValue);
  } else if (e.key === 'Backspace' && !tagInputValue && tagsToAdd.length > 0) {
    setTagsToAdd(prev => prev.slice(0, -1));
  }
}, [tagInputValue, tagsToAdd, handleAddTag]);

// Filtered suggestions (exclude already added tags)
const filteredSuggestions = useMemo(() => {
  const lowerInput = tagInputValue.toLowerCase();
  return existingTags
    .filter(tag =>
      !tagsToAdd.includes(tag.toLowerCase()) &&
      tag.toLowerCase().includes(lowerInput)
    )
    .slice(0, 8);
}, [existingTags, tagsToAdd, tagInputValue]);
```

### Task 3.5.3: Implement Remove Mode UI

The remove mode provides:
- Checkbox list of all tags present on selected items
- Visual indication of which items have each tag
- Ability to select multiple tags for removal

```typescript
// State for remove mode
const [tagsToRemove, setTagsToRemove] = useState<Set<string>>(new Set());

// Collect all tags from selected items
const allTagsOnSelectedItems = useMemo(() => {
  const tagMap = new Map<string, number>();
  selectedItems.forEach(item => {
    (item.tags || []).forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}, [selectedItems]);

// Toggle tag for removal
const handleToggleTagForRemoval = useCallback((tag: string) => {
  setTagsToRemove(prev => {
    const next = new Set(prev);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    return next;
  });
}, []);
```

### Task 3.5.4: Implement Items Preview

```typescript
interface ItemPreviewListProps {
  items: ItemRecord[];
  maxDisplay?: number;
}

function ItemPreviewList({ items, maxDisplay = MAX_PREVIEW_ITEMS }: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - displayItems.length;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Items to be updated:
      </p>
      <ul className="space-y-1 text-sm text-gray-600">
        {displayItems.map(item => (
          <li key={item.id} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span className="truncate">{item.title}</span>
          </li>
        ))}
        {remainingCount > 0 && (
          <li className="text-gray-400 italic">
            (and {remainingCount} more...)
          </li>
        )}
      </ul>
    </div>
  );
}
```

### Task 3.5.5: Update BulkActions Index

**File:** `src/components/ItemManager/components/BulkActions/index.ts`

```typescript
/**
 * BulkActions Components Barrel Export
 * @module ItemManager/components/BulkActions
 * @lastModified 2026-01-03 (REQ-072)
 */

export { BulkActionsBar } from './BulkActionsBar';
export type { BulkActionsBarProps } from './BulkActionsBar';

export { BulkTagDialog } from './BulkTagDialog';
export type { BulkTagDialogProps } from './BulkTagDialog';

// Future exports:
// export { BulkMoveDialog } from './BulkMoveDialog';
```

### Task 3.5.6: Integrate in ItemManager

**File:** `src/components/ItemManager/ItemManager.tsx`

```typescript
import { BulkActionsBar, BulkTagDialog } from './components/BulkActions';

function ItemManager({ items, onUpdateItem, ...props }: ItemManagerProps) {
  const {
    selectedIds,
    selectedCount,
    getSelectedItems,
    getSelectedArray,
    clearSelection,
  } = useItemSelection({ /* ... */ });

  // Tag dialog state
  const [tagDialogMode, setTagDialogMode] = useState<'add' | 'remove' | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Collect all existing tags from all items
  const existingTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => {
      (item.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  // Handle bulk tag add
  const handleBulkAddTag = useCallback(() => {
    setTagDialogMode('add');
  }, []);

  // Handle bulk tag remove
  const handleBulkRemoveTag = useCallback(() => {
    setTagDialogMode('remove');
  }, []);

  // Confirm tag operation
  const handleTagConfirm = useCallback(async (tags: string[]) => {
    if (tags.length === 0) return;

    const selectedItemsList = getSelectedItems(items);
    setBulkLoading(true);

    try {
      for (const item of selectedItemsList) {
        let updatedTags: string[];

        if (tagDialogMode === 'add') {
          // Add tags (avoid duplicates)
          const currentTags = item.tags || [];
          const newTags = tags.filter(t => !currentTags.includes(t));
          updatedTags = [...currentTags, ...newTags];
        } else {
          // Remove tags
          updatedTags = (item.tags || []).filter(t => !tags.includes(t));
        }

        await onUpdateItem({
          ...item,
          tags: updatedTags,
        });
      }

      setTagDialogMode(null);
      clearSelection();
    } finally {
      setBulkLoading(false);
    }
  }, [tagDialogMode, getSelectedItems, items, onUpdateItem, clearSelection]);

  return (
    <div className="flex flex-col h-full relative">
      {/* ... toolbar, grid/list ... */}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onDelete={handleBulkDelete}
        onAddTag={handleBulkAddTag}
        onRemoveTag={handleBulkRemoveTag}
        onExitSelection={exitSelectionMode}
        loading={bulkLoading}
      />

      {/* Bulk Tag Dialog */}
      {tagDialogMode && (
        <BulkTagDialog
          mode={tagDialogMode}
          selectedItems={getSelectedItems(items)}
          existingTags={existingTags}
          onConfirm={handleTagConfirm}
          onCancel={() => setTagDialogMode(null)}
          loading={bulkLoading}
        />
      )}
    </div>
  );
}
```

---

## 6. Visual Design Specifications

### 6.1 Modal Container

```typescript
// Modal backdrop
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  {/* Modal content */}
  <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
    {/* ... */}
  </div>
</div>
```

### 6.2 Header Styling

```typescript
// Header with close button
<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
      {mode === 'add' ? (
        <Tag className="w-5 h-5 text-blue-600" />
      ) : (
        <Minus className="w-5 h-5 text-orange-600" />
      )}
    </div>
    <h2 className="text-lg font-semibold text-gray-900">
      {mode === 'add' ? 'Add Tags' : 'Remove Tags'} to {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
    </h2>
  </div>
  <button
    onClick={onCancel}
    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
    aria-label="Close dialog"
  >
    <X className="w-5 h-5 text-gray-500" />
  </button>
</div>
```

### 6.3 Tag Input (Add Mode)

Following the MetadataStep pattern:

```typescript
<div className={cn(
  'flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px]',
  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
  'border-gray-300'
)}>
  {/* Tag Pills */}
  {tagsToAdd.map(tag => (
    <span
      key={tag}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
    >
      {tag}
      <button
        type="button"
        onClick={() => handleRemoveTagFromList(tag)}
        className="p-1 hover:bg-blue-200 rounded-full transition-colors"
        aria-label={`Remove tag: ${tag}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  ))}

  {/* Input */}
  <input
    ref={tagInputRef}
    type="text"
    value={tagInputValue}
    onChange={e => setTagInputValue(e.target.value)}
    onKeyDown={handleTagInputKeyDown}
    placeholder={tagsToAdd.length === 0 ? 'Type a tag and press Enter...' : 'Add another tag...'}
    className="flex-1 min-w-[120px] px-2 py-1 outline-none bg-transparent placeholder:text-gray-400"
    maxLength={MAX_TAG_LENGTH}
    disabled={tagsToAdd.length >= MAX_TAGS_TO_ADD}
  />
</div>
```

### 6.4 Tag Suggestions (Add Mode)

```typescript
{filteredSuggestions.length > 0 && (
  <div className="mt-3">
    <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
    <div className="flex flex-wrap gap-2">
      {filteredSuggestions.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => handleAddTag(tag)}
          className={cn(
            'px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700',
            'hover:bg-gray-100 hover:border-gray-400 transition-colors',
            'min-h-[36px]'
          )}
        >
          + {tag}
        </button>
      ))}
    </div>
  </div>
)}
```

### 6.5 Tag Checkboxes (Remove Mode)

```typescript
<div className="space-y-2">
  <p className="text-sm font-medium text-gray-700">Select tags to remove:</p>
  <div className="flex flex-wrap gap-2">
    {allTagsOnSelectedItems.map(({ tag, count }) => (
      <label
        key={tag}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
          tagsToRemove.has(tag)
            ? 'border-red-300 bg-red-50 text-red-800'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input
          type="checkbox"
          checked={tagsToRemove.has(tag)}
          onChange={() => handleToggleTagForRemoval(tag)}
          className="sr-only"
        />
        <span className={cn(
          'w-4 h-4 rounded border flex items-center justify-center',
          tagsToRemove.has(tag)
            ? 'bg-red-600 border-red-600'
            : 'border-gray-400'
        )}>
          {tagsToRemove.has(tag) && <Check className="w-3 h-3 text-white" />}
        </span>
        <span>{tag}</span>
        <span className="text-xs text-gray-400">({count})</span>
      </label>
    ))}
  </div>
</div>
```

### 6.6 Footer Actions

```typescript
<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
  <button
    type="button"
    onClick={onCancel}
    disabled={loading}
    className={cn(
      'px-4 py-2 rounded-lg text-sm font-medium',
      'text-gray-700 bg-white border border-gray-300',
      'hover:bg-gray-50 transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    Cancel
  </button>
  <button
    type="button"
    onClick={handleConfirmClick}
    disabled={loading || confirmDisabled}
    className={cn(
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
      mode === 'add'
        ? 'text-white bg-blue-600 hover:bg-blue-700'
        : 'text-white bg-red-600 hover:bg-red-700',
      'transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {mode === 'add'
      ? `Add ${tagsToAdd.length} Tag${tagsToAdd.length !== 1 ? 's' : ''}`
      : `Remove ${tagsToRemove.size} Tag${tagsToRemove.size !== 1 ? 's' : ''}`
    }
  </button>
</div>
```

---

## 7. Accessibility Requirements

### 7.1 ARIA Attributes

```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  className="..."
>
  <h2 id={titleId}>{mode === 'add' ? 'Add Tags' : 'Remove Tags'}</h2>

  {/* Form elements with proper labels */}
  <label htmlFor={inputId}>Tag input</label>
  <input
    id={inputId}
    aria-describedby={helpTextId}
    aria-invalid={!!error}
  />
</div>
```

### 7.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Move focus between interactive elements |
| **Escape** | Close dialog |
| **Enter** | Add tag (in input) / Confirm operation (on button) |
| **Backspace** | Remove last tag (when input empty) |
| **Space** | Toggle checkbox (remove mode) |

### 7.3 Focus Management

- Focus moves to input field when dialog opens (add mode)
- Focus moves to first checkbox when dialog opens (remove mode)
- Focus returns to trigger button when dialog closes
- Focus trapped within dialog while open

---

## 8. Acceptance Criteria Mapping

| Criteria (from REQ-072) | Implementation |
|-------------------------|----------------|
| Dialog can be opened when items selected | Triggered from BulkActionsBar buttons |
| User can toggle between add/remove modes | Separate modes via `mode` prop |
| Tag input displays suggestions | Filtered `existingTags` shown below input |
| Dialog shows preview of affected items | `ItemPreviewList` component shows first 5 items |
| User can confirm and items are updated | `onConfirm` callback processes all selected items |

---

## 9. Testing Requirements

### 9.1 Unit Test Cases

| Test Case | Description |
|-----------|-------------|
| Renders in add mode | Dialog shows add mode UI with input |
| Renders in remove mode | Dialog shows remove mode UI with checkboxes |
| Adds tag on Enter key | Tag added to list when Enter pressed |
| Adds tag from suggestion click | Tag added when suggestion button clicked |
| Removes tag from list | Tag removed when X button clicked |
| Toggles checkbox in remove mode | Tag toggled when checkbox clicked |
| Disables confirm when no tags | Button disabled when nothing to add/remove |
| Shows correct item count | Header shows accurate selected item count |
| Shows item preview list | Preview shows item titles (max 5) |
| Calls onCancel when cancelled | Callback invoked on Cancel/X click |
| Calls onConfirm with tags | Callback invoked with tag array on confirm |

### 9.2 Integration Test Cases

| Test Case | Description |
|-----------|-------------|
| Add tag flow end-to-end | Open → type tag → confirm → items updated |
| Remove tag flow end-to-end | Open → select tags → confirm → tags removed |
| Suggestions filter correctly | Typing filters suggestion list |
| Escape key closes dialog | Pressing Escape calls onCancel |
| Focus returns after close | Focus returns to triggering button |

### 9.3 Accessibility Test Cases

| Test Case | Description |
|-----------|-------------|
| Dialog has correct role | `role="dialog"` with `aria-modal="true"` |
| Focus trapped in dialog | Tab cycles within dialog elements |
| Keyboard navigation works | All controls accessible via keyboard |
| Screen reader labels | All elements have accessible names |

---

## 10. Performance Considerations

### 10.1 Memoization

```typescript
// Memoize expensive computations
const allTagsOnSelectedItems = useMemo(() => { ... }, [selectedItems]);
const filteredSuggestions = useMemo(() => { ... }, [existingTags, tagsToAdd, tagInputValue]);

// Memoize callbacks
const handleAddTag = useCallback(() => { ... }, [tagsToAdd]);
const handleTagInputKeyDown = useCallback(() => { ... }, [tagInputValue, tagsToAdd, handleAddTag]);
```

### 10.2 Render Optimization

- Use `React.memo` for internal components if needed
- Limit preview list to MAX_PREVIEW_ITEMS
- Limit suggestions to 8 items

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large tag suggestion list | Medium | Low | Limit suggestions to 8, add scroll |
| Many selected items slow preview | Low | Low | Limit preview to 5 items |
| Duplicate tag handling | Medium | Medium | Case-insensitive duplicate check |
| Focus management issues | Medium | Medium | Use FocusTrap or manual focus management |
| Bulk update performance | Low | Medium | Process updates sequentially, show progress |

---

## 12. Implementation Sequence

1. **Create BulkTagDialog component structure** (Task 3.5.1)
   - Set up file with imports, types, and skeleton
   - Create modal container with backdrop

2. **Implement Add Mode UI** (Task 3.5.2)
   - Build tag input with pills (following MetadataStep pattern)
   - Add suggestions section
   - Handle keyboard shortcuts

3. **Implement Remove Mode UI** (Task 3.5.3)
   - Build checkbox list for existing tags
   - Show tag counts per item

4. **Implement Items Preview** (Task 3.5.4)
   - Create ItemPreviewList component
   - Handle "and X more" overflow

5. **Update BulkActions Index** (Task 3.5.5)
   - Export new component

6. **Integrate in ItemManager** (Task 3.5.6)
   - Add dialog state management
   - Create confirm handler
   - Wire up to BulkActionsBar

7. **Testing**
   - Unit tests for component behavior
   - Integration tests for full flow
   - Accessibility testing

---

## 13. Related Documents

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 3, Task 3.5
- [BulkActionsBar](/docs/REQ-070-build-bulkactionsbar-component-overview.md) - Task 3.3 reference
- [ConfirmDeleteDialog](/docs/REQ-071-implement-confirmdeletedialog-overview.md) - Task 3.4 reference
- [MetadataStep](/src/components/ItemCapture/components/steps/MetadataStep.tsx) - Tag input pattern reference
- [ConfirmationModal](/src/components/ConfirmationModal.tsx) - Modal pattern reference

---

## 14. Estimated Effort

| Task | Estimate |
|------|----------|
| Create component structure | 30 minutes |
| Implement add mode UI | 2 hours |
| Implement remove mode UI | 1.5 hours |
| Implement items preview | 45 minutes |
| Update exports | 15 minutes |
| Integrate in ItemManager | 1.5 hours |
| Unit tests | 1.5 hours |
| Integration tests | 1 hour |
| Accessibility testing | 30 minutes |
| **Total** | **9.5 hours** |

---

## Appendix A: Complete Component Implementation

```typescript
'use client';

/**
 * BulkTagDialog Component
 *
 * Modal dialog for adding or removing tags from multiple selected items.
 * Supports two modes: 'add' for applying new tags and 'remove' for
 * stripping existing tags from selected items.
 *
 * @module ItemManager/components/BulkActions/BulkTagDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.5)
 * @lastModified 2026-01-03 (REQ-072)
 */

import React, { useState, useMemo, useCallback, useRef, useEffect, useId } from 'react';
import { X, Tag, Minus, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface BulkTagDialogProps {
  /** Dialog mode - determines add or remove operation */
  mode: 'add' | 'remove';

  /** Array of selected items to apply tag operation to */
  selectedItems: ItemRecord[];

  /** All existing tags in the system for autocomplete suggestions */
  existingTags: string[];

  /** Callback when tags are confirmed */
  onConfirm: (tags: string[]) => void;

  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;

  /** Loading state during operation */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_PREVIEW_ITEMS = 5;
const MAX_TAG_LENGTH = 30;
const MAX_TAGS_TO_ADD = 10;
const MAX_SUGGESTIONS = 8;

// =============================================================================
// Internal Components
// =============================================================================

interface ItemPreviewListProps {
  items: ItemRecord[];
  maxDisplay?: number;
}

function ItemPreviewList({ items, maxDisplay = MAX_PREVIEW_ITEMS }: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - displayItems.length;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Items to be updated:
      </p>
      <ul className="space-y-1 text-sm text-gray-600 max-h-32 overflow-y-auto">
        {displayItems.map(item => (
          <li key={item.id} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </li>
        ))}
        {remainingCount > 0 && (
          <li className="text-gray-400 italic pl-3.5">
            (and {remainingCount} more...)
          </li>
        )}
      </ul>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function BulkTagDialog({
  mode,
  selectedItems,
  existingTags,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: BulkTagDialogProps) {
  const uniqueId = useId();
  const titleId = `bulk-tag-title-${uniqueId}`;
  const inputId = `bulk-tag-input-${uniqueId}`;

  // Add mode state
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Remove mode state
  const [tagsToRemove, setTagsToRemove] = useState<Set<string>>(new Set());

  // Collect all tags from selected items (for remove mode)
  const allTagsOnSelectedItems = useMemo(() => {
    const tagMap = new Map<string, number>();
    selectedItems.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [selectedItems]);

  // Filtered suggestions for add mode
  const filteredSuggestions = useMemo(() => {
    const lowerInput = tagInputValue.toLowerCase();
    return existingTags
      .filter(tag => {
        const lowerTag = tag.toLowerCase();
        return !tagsToAdd.some(t => t.toLowerCase() === lowerTag) &&
               lowerTag.includes(lowerInput);
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [existingTags, tagsToAdd, tagInputValue]);

  // Focus input on mount (add mode)
  useEffect(() => {
    if (mode === 'add' && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [mode]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Add tag handler
  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Case-insensitive duplicate check
    if (tagsToAdd.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) return;
    if (tagsToAdd.length >= MAX_TAGS_TO_ADD) return;
    if (trimmedTag.length > MAX_TAG_LENGTH) return;

    setTagsToAdd(prev => [...prev, trimmedTag]);
    setTagInputValue('');
    tagInputRef.current?.focus();
  }, [tagsToAdd]);

  // Remove tag from pending list
  const handleRemoveTagFromList = useCallback((tag: string) => {
    setTagsToAdd(prev => prev.filter(t => t !== tag));
  }, []);

  // Keyboard handler for tag input
  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInputValue.trim()) {
      e.preventDefault();
      handleAddTag(tagInputValue);
    } else if (e.key === 'Backspace' && !tagInputValue && tagsToAdd.length > 0) {
      setTagsToAdd(prev => prev.slice(0, -1));
    }
  }, [tagInputValue, tagsToAdd, handleAddTag]);

  // Toggle tag for removal
  const handleToggleTagForRemoval = useCallback((tag: string) => {
    setTagsToRemove(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  // Confirm handler
  const handleConfirmClick = useCallback(() => {
    const tags = mode === 'add' ? tagsToAdd : Array.from(tagsToRemove);
    onConfirm(tags);
  }, [mode, tagsToAdd, tagsToRemove, onConfirm]);

  // Determine if confirm should be disabled
  const confirmDisabled = mode === 'add'
    ? tagsToAdd.length === 0
    : tagsToRemove.size === 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden',
          'flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              mode === 'add' ? 'bg-blue-100' : 'bg-orange-100'
            )}>
              {mode === 'add' ? (
                <Tag className="w-5 h-5 text-blue-600" aria-hidden="true" />
              ) : (
                <Minus className="w-5 h-5 text-orange-600" aria-hidden="true" />
              )}
            </div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Add Tags' : 'Remove Tags'} from {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {mode === 'add' ? (
            /* Add Mode UI */
            <>
              <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
                Tags to add ({tagsToAdd.length}/{MAX_TAGS_TO_ADD})
              </label>

              {/* Tag Input with Pills */}
              <div className={cn(
                'flex flex-wrap gap-2 p-3 border rounded-lg min-h-[48px]',
                'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
                'border-gray-300'
              )}>
                {tagsToAdd.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTagFromList(tag)}
                      disabled={loading}
                      className="p-1 hover:bg-blue-200 rounded-full transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
                      aria-label={`Remove tag: ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <input
                  ref={tagInputRef}
                  type="text"
                  id={inputId}
                  value={tagInputValue}
                  onChange={e => setTagInputValue(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder={tagsToAdd.length === 0 ? 'Type a tag and press Enter...' : 'Add another...'}
                  className="flex-1 min-w-[120px] px-2 py-1 outline-none bg-transparent placeholder:text-gray-400"
                  maxLength={MAX_TAG_LENGTH}
                  disabled={loading || tagsToAdd.length >= MAX_TAGS_TO_ADD}
                />
              </div>

              {/* Suggestions */}
              {filteredSuggestions.length > 0 && tagsToAdd.length < MAX_TAGS_TO_ADD && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSuggestions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        disabled={loading}
                        className={cn(
                          'px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700',
                          'hover:bg-gray-100 hover:border-gray-400 transition-colors',
                          'min-h-[36px] disabled:opacity-50'
                        )}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Remove Mode UI */
            <>
              {allTagsOnSelectedItems.length === 0 ? (
                <p className="text-gray-500 italic">No tags found on selected items.</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-3">Select tags to remove:</p>
                  <div className="flex flex-wrap gap-2">
                    {allTagsOnSelectedItems.map(({ tag, count }) => (
                      <label
                        key={tag}
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                          tagsToRemove.has(tag)
                            ? 'border-red-300 bg-red-50 text-red-800'
                            : 'border-gray-300 hover:border-gray-400',
                          loading && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={tagsToRemove.has(tag)}
                          onChange={() => handleToggleTagForRemoval(tag)}
                          disabled={loading}
                          className="sr-only"
                        />
                        <span className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                          tagsToRemove.has(tag)
                            ? 'bg-red-600 border-red-600'
                            : 'border-gray-400'
                        )}>
                          {tagsToRemove.has(tag) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </span>
                        <span>{tag}</span>
                        <span className="text-xs text-gray-400">({count})</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Items Preview */}
          <ItemPreviewList items={selectedItems} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'text-gray-700 bg-white border border-gray-300',
              'hover:bg-gray-50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={loading || confirmDisabled}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              mode === 'add'
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-white bg-red-600 hover:bg-red-700',
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'add'
              ? `Add ${tagsToAdd.length} Tag${tagsToAdd.length !== 1 ? 's' : ''}`
              : `Remove ${tagsToRemove.size} Tag${tagsToRemove.size !== 1 ? 's' : ''}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkTagDialog;
```

---

## Appendix B: Test File Template

```typescript
/**
 * BulkTagDialog Component Tests
 *
 * @module ItemManager/components/BulkActions/__tests__/BulkTagDialog.test
 * @lastModified 2026-01-03 (REQ-072)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkTagDialog } from '../BulkTagDialog';

const mockItems = [
  { id: '1', title: 'Coffee Maker', tags: ['kitchen', 'appliance'], contentType: 'media' as const, media: [], createdAt: new Date() },
  { id: '2', title: 'Dishwasher', tags: ['kitchen', 'appliance'], contentType: 'media' as const, media: [], createdAt: new Date() },
  { id: '3', title: 'Thermostat', tags: ['wifi', 'smart'], contentType: 'media' as const, media: [], createdAt: new Date() },
];

const existingTags = ['kitchen', 'appliance', 'wifi', 'smart', 'bedroom', 'bathroom'];

describe('BulkTagDialog', () => {
  const defaultProps = {
    mode: 'add' as const,
    selectedItems: mockItems,
    existingTags,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Mode', () => {
    it('renders add mode UI', () => {
      render(<BulkTagDialog {...defaultProps} />);
      expect(screen.getByText(/Add Tags/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Type a tag/)).toBeInTheDocument();
    });

    it('adds tag on Enter key', async () => {
      render(<BulkTagDialog {...defaultProps} />);
      const input = screen.getByPlaceholderText(/Type a tag/);

      await userEvent.type(input, 'newtag{Enter}');

      expect(screen.getByText('newtag')).toBeInTheDocument();
    });

    it('adds tag from suggestion click', async () => {
      render(<BulkTagDialog {...defaultProps} />);

      await userEvent.click(screen.getByText('+ bedroom'));

      expect(screen.getByText('bedroom')).toBeInTheDocument();
    });

    it('removes tag when X clicked', async () => {
      render(<BulkTagDialog {...defaultProps} />);
      const input = screen.getByPlaceholderText(/Type a tag/);

      await userEvent.type(input, 'newtag{Enter}');
      await userEvent.click(screen.getByLabelText('Remove tag: newtag'));

      expect(screen.queryByText('newtag')).not.toBeInTheDocument();
    });

    it('disables confirm when no tags added', () => {
      render(<BulkTagDialog {...defaultProps} />);
      expect(screen.getByText(/Add 0 Tag/)).toBeDisabled();
    });

    it('calls onConfirm with tags', async () => {
      render(<BulkTagDialog {...defaultProps} />);
      const input = screen.getByPlaceholderText(/Type a tag/);

      await userEvent.type(input, 'newtag{Enter}');
      await userEvent.click(screen.getByText('+ bedroom'));
      await userEvent.click(screen.getByText(/Add 2 Tag/));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith(['newtag', 'bedroom']);
    });
  });

  describe('Remove Mode', () => {
    it('renders remove mode UI with existing tags', () => {
      render(<BulkTagDialog {...defaultProps} mode="remove" />);
      expect(screen.getByText(/Remove Tags/)).toBeInTheDocument();
      expect(screen.getByText('kitchen')).toBeInTheDocument();
      expect(screen.getByText('appliance')).toBeInTheDocument();
    });

    it('toggles tag selection on click', async () => {
      render(<BulkTagDialog {...defaultProps} mode="remove" />);

      await userEvent.click(screen.getByText('kitchen').closest('label')!);

      expect(screen.getByText(/Remove 1 Tag/)).toBeInTheDocument();
    });

    it('shows tag counts', () => {
      render(<BulkTagDialog {...defaultProps} mode="remove" />);
      expect(screen.getByText('(2)')).toBeInTheDocument(); // kitchen appears on 2 items
    });

    it('calls onConfirm with selected tags', async () => {
      render(<BulkTagDialog {...defaultProps} mode="remove" />);

      await userEvent.click(screen.getByText('kitchen').closest('label')!);
      await userEvent.click(screen.getByText(/Remove 1 Tag/));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith(['kitchen']);
    });
  });

  describe('Common Behavior', () => {
    it('shows item preview list', () => {
      render(<BulkTagDialog {...defaultProps} />);
      expect(screen.getByText('Coffee Maker')).toBeInTheDocument();
      expect(screen.getByText('Dishwasher')).toBeInTheDocument();
    });

    it('calls onCancel when Cancel clicked', async () => {
      render(<BulkTagDialog {...defaultProps} />);
      await userEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when X clicked', async () => {
      render(<BulkTagDialog {...defaultProps} />);
      await userEvent.click(screen.getByLabelText('Close dialog'));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel on Escape key', () => {
      render(<BulkTagDialog {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('shows loading state', () => {
      render(<BulkTagDialog {...defaultProps} loading={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Input should be disabled
      expect(screen.getByPlaceholderText(/Type a tag/)).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has correct dialog role', () => {
      render(<BulkTagDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has labeled title', () => {
      render(<BulkTagDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });
});
```
