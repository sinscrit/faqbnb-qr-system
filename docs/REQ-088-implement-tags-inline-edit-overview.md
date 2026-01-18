# REQ-088: Implement Tags Inline Edit - Implementation Overview

**Document Created:** 2026-01-03T14:30:00
**Last Modified:** 2026-01-03T14:30:00
**Request Reference:** `/docs/gen_requests.md` - REQ-088
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 6 - Inline Edit & Polish
**Task ID:** 6.3
**Status:** PENDING

---

## Overview

This document provides the technical implementation breakdown for inline tag editing within the ItemManager component. This task enables users to add and remove tags directly within the item view without navigating to a separate editing interface.

### Purpose

Enable property managers to quickly organize and categorize items by editing tags in place. This improves workflow efficiency by eliminating context switching and reduces friction in content management tasks.

### Key Deliverables

1. Create `TagsInlineEdit` component for in-place tag management
2. Implement tag suggestions from existing items across the collection
3. Build chip-based UI with removable tag chips
4. Integrate into ItemCard and ItemRow components
5. Connect to `onUpdateItem` callback for persistence

### Context Within ItemManager

As per the implementation plan, this is Task 6.3 in Phase 6:

```
6.1 InlineEdit Component (REQ-086) - PREREQUISITE
         │
         ▼
6.2 Title/Location Inline Edit (REQ-087) - PREREQUISITE
         │
         ▼
6.3 Tags Inline Edit (THIS TASK)
         │
         ▼
6.4 Mobile Polish
```

---

## Dependencies

### Hard Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| InlineEdit component | REQ-086 / Task 6.1 | Must be complete |
| Title/Location inline edit integration | REQ-087 / Task 6.2 | Must be complete |
| ItemCard component | REQ-058 / Task 1.4 | Must be complete |
| ItemRow component | REQ-059 / Task 1.5 | Must be complete |
| TagChip component | Task 1.1 shared components | Should exist or will be created |
| ItemManagerConfig type | Task 1.1 | Must be complete |

### Technical Dependencies

| Dependency | Source | Purpose |
|------------|--------|---------|
| InlineEdit patterns | `@/components/ItemManager/components/shared/InlineEdit` | State machine and keyboard patterns |
| cn() utility | `src/lib/utils.ts` | Class name merging with Tailwind |
| ItemRecord type | `ItemManager.types.ts` | Item data structure with tags |
| Lucide React | `lucide-react` | Icons (X, Plus, Tag) |
| Existing tag patterns | `MetadataStep.tsx` | Reference implementation for tag chips |
| SUGGESTED_TAGS constant | `ItemCapture/utils/constants.ts` | Default tag suggestions |
| METADATA_CONSTRAINTS | `ItemCapture/utils/constants.ts` | Tag validation constraints |

---

## Component Architecture

### TagsInlineEdit Component Interface

```typescript
// File: src/components/ItemManager/components/shared/TagsInlineEdit.tsx

export interface TagsInlineEditProps {
  /** Current tags array */
  tags: string[];

  /** Callback when tags are updated - should return Promise for loading state */
  onSave: (newTags: string[]) => Promise<void>;

  /** Optional callback when edit is cancelled */
  onCancel?: () => void;

  /** All existing tags from other items (for suggestions) */
  existingTags?: string[];

  /** Maximum number of tags allowed (default: 10) */
  maxTags?: number;

  /** Maximum characters per tag (default: 30) */
  maxTagLength?: number;

  /** Whether the component is disabled */
  disabled?: boolean;

  /** Placeholder text when no tags exist */
  placeholder?: string;

  /** Additional CSS classes for the container */
  className?: string;

  /** Accessible label for the component */
  ariaLabel?: string;
}
```

### State Machine

The component operates in three distinct states:

```typescript
type TagsEditState = 'display' | 'editing' | 'saving';
```

**State Transitions:**
```
┌─────────────┐
│   display   │ ◄────────────────────────────────────┐
└──────┬──────┘                                       │
       │ click on add/area                            │
       ▼                                              │
┌─────────────┐                                       │
│   editing   │ ───────click outside/Escape───────────┤
└──────┬──────┘                                       │
       │ changes detected on blur/confirm             │
       ▼                                              │
┌─────────────┐                                       │
│   saving    │ ─────success/failure──────────────────┘
└─────────────┘
```

### Internal State Structure

```typescript
interface InternalState {
  /** Current component state */
  status: TagsEditState;

  /** Working copy of tags during editing */
  editTags: string[];

  /** Original tags at edit start (for cancellation) */
  originalTags: string[];

  /** Current input value for adding new tag */
  inputValue: string;

  /** Filtered suggestions based on input */
  filteredSuggestions: string[];

  /** Index of focused suggestion (-1 for none) */
  focusedSuggestionIndex: number;

  /** Whether suggestions dropdown is open */
  showSuggestions: boolean;

  /** Error message if save fails */
  errorMessage: string | null;
}
```

---

## Implementation Details

### File Structure

```
src/components/ItemManager/components/shared/
├── TagsInlineEdit.tsx      # Main tags inline edit component
├── TagChip.tsx             # Individual tag chip component (if not exists)
├── InlineEdit.tsx          # Existing text inline edit (reference)
└── index.ts                # Update barrel export
```

### 1. TagChip Component

Reference existing implementation from `MetadataStep.tsx`:

```typescript
// File: src/components/ItemManager/components/shared/TagChip.tsx
'use client';

/**
 * TagChip Component
 *
 * A single tag chip with optional remove button.
 * Used in TagsInlineEdit and item display components.
 *
 * @module ItemManager/components/shared/TagChip
 * @lastModified 2026-01-03 (REQ-088)
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TagChipProps {
  /** Tag text to display */
  tag: string;

  /** Whether to show remove button */
  removable?: boolean;

  /** Callback when remove is clicked */
  onRemove?: () => void;

  /** Whether the chip is in a disabled state */
  disabled?: boolean;

  /** Variant: 'default' for blue, 'outline' for border-only */
  variant?: 'default' | 'outline';

  /** Additional CSS classes */
  className?: string;
}

export function TagChip({
  tag,
  removable = false,
  onRemove,
  disabled = false,
  variant = 'default',
  className,
}: TagChipProps) {
  const variantStyles = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-700 bg-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm',
        variantStyles[variant],
        disabled && 'opacity-60',
        className
      )}
    >
      {tag}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={cn(
            'p-0.5 hover:bg-blue-200 rounded-full transition-colors',
            'min-w-[20px] min-h-[20px] flex items-center justify-center',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            disabled && 'cursor-not-allowed hover:bg-transparent'
          )}
          aria-label={`Remove tag: ${tag}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

export default TagChip;
```

### 2. TagsInlineEdit Component

```typescript
// File: src/components/ItemManager/components/shared/TagsInlineEdit.tsx
'use client';

/**
 * TagsInlineEdit Component
 *
 * Inline editing component for item tags with:
 * - Chip-based tag display
 * - Add/remove functionality
 * - Typeahead suggestions from existing tags
 * - Keyboard navigation
 *
 * @module ItemManager/components/shared/TagsInlineEdit
 * @see docs/REQ-088-implement-tags-inline-edit-overview.md
 * @lastModified 2026-01-03 (REQ-088)
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
} from 'react';
import { Plus, Loader2, AlertCircle, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagChip } from './TagChip';
```

### Key Implementation Features

#### 1. Display Mode

- Shows current tags as chips
- "Add tag" button/placeholder visible
- Clicking activates edit mode
- Removable chips in display mode for quick removal (optional)

```typescript
// Display mode rendering
{status === 'display' && (
  <div
    className={cn(
      'flex flex-wrap gap-2 items-center',
      'rounded-md py-1 cursor-pointer',
      'hover:bg-gray-50 transition-colors',
      'group'
    )}
    onClick={enterEditMode}
    role="button"
    tabIndex={0}
    onKeyDown={handleDisplayKeyDown}
    aria-label={ariaLabel || 'Edit tags'}
  >
    {tags.length > 0 ? (
      <>
        {tags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            removable
            onRemove={() => handleQuickRemove(tag)}
          />
        ))}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Add tag"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </>
    ) : (
      <span className="text-gray-400 text-sm flex items-center gap-1">
        <Tag className="w-4 h-4" />
        {placeholder || 'Add tags...'}
      </span>
    )}
  </div>
)}
```

#### 2. Edit Mode with Input

- Input field for typing new tags
- Suggestions dropdown with existing tags
- Add on Enter or comma
- Remove on chip X click

```typescript
// Edit mode rendering
{status === 'editing' && (
  <div
    ref={containerRef}
    className={cn(
      'flex flex-wrap gap-2 p-2 border rounded-lg',
      'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
      'border-gray-300 bg-white'
    )}
  >
    {editTags.map((tag) => (
      <TagChip
        key={tag}
        tag={tag}
        removable
        onRemove={() => handleRemoveTag(tag)}
      />
    ))}

    <div className="relative flex-1 min-w-[120px]">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => setShowSuggestions(true)}
        placeholder={isAtMaxTags ? 'Max tags reached' : 'Type to add...'}
        disabled={isAtMaxTags}
        maxLength={maxTagLength}
        className={cn(
          'w-full px-2 py-1 outline-none bg-transparent',
          'placeholder:text-gray-400',
          isAtMaxTags && 'cursor-not-allowed'
        )}
        aria-label="Add new tag"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={suggestionsId}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <SuggestionsDropdown />
      )}
    </div>
  </div>
)}
```

#### 3. Tag Suggestions System

Collect and deduplicate tags from all items:

```typescript
// In ItemManager or passed as prop
const getAllExistingTags = useCallback(() => {
  const tagSet = new Set<string>();
  items.forEach(item => {
    (item.tags || []).forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}, [items]);
```

Filter suggestions based on input:

```typescript
const filteredSuggestions = useMemo(() => {
  if (!inputValue.trim()) {
    // Show all available suggestions when input is empty
    return existingTags.filter(
      tag => !editTags.some(t => t.toLowerCase() === tag.toLowerCase())
    ).slice(0, 10);
  }

  const searchLower = inputValue.toLowerCase().trim();
  return existingTags
    .filter(tag =>
      tag.toLowerCase().includes(searchLower) &&
      !editTags.some(t => t.toLowerCase() === tag.toLowerCase())
    )
    .slice(0, 10);
}, [inputValue, existingTags, editTags]);
```

#### 4. Keyboard Navigation

```typescript
const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ',':
      e.preventDefault();
      if (focusedSuggestionIndex >= 0) {
        // Add focused suggestion
        handleAddTag(filteredSuggestions[focusedSuggestionIndex]);
      } else if (inputValue.trim()) {
        // Add typed value
        handleAddTag(inputValue.trim());
      }
      break;

    case 'Backspace':
      if (!inputValue && editTags.length > 0) {
        // Remove last tag when input is empty
        handleRemoveTag(editTags[editTags.length - 1]);
      }
      break;

    case 'ArrowDown':
      e.preventDefault();
      setFocusedSuggestionIndex(prev =>
        Math.min(prev + 1, filteredSuggestions.length - 1)
      );
      break;

    case 'ArrowUp':
      e.preventDefault();
      setFocusedSuggestionIndex(prev => Math.max(prev - 1, -1));
      break;

    case 'Escape':
      e.preventDefault();
      handleCancel();
      break;

    case 'Tab':
      // Save changes on tab out
      if (inputValue.trim()) {
        handleAddTag(inputValue.trim());
      }
      // Note: Let blur handler save changes
      break;
  }
}, [inputValue, editTags, filteredSuggestions, focusedSuggestionIndex]);
```

#### 5. Saving Logic

```typescript
const handleSave = useCallback(async () => {
  // Only save if tags have changed
  const originalSet = new Set(originalTags);
  const editSet = new Set(editTags);

  const hasChanges =
    originalTags.length !== editTags.length ||
    originalTags.some(t => !editSet.has(t));

  if (!hasChanges) {
    setStatus('display');
    return;
  }

  setStatus('saving');

  try {
    await onSave(editTags);
    setOriginalTags(editTags);
    setStatus('display');
    setErrorMessage(null);
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : 'Failed to save tags'
    );
    setStatus('editing'); // Stay in edit mode on error
  }
}, [editTags, originalTags, onSave]);
```

### 3. Integration into ItemCard

```typescript
// File: src/components/ItemManager/components/ItemCard.tsx

// After title and location inline edit
{enableInlineEdit && onUpdateItem ? (
  <TagsInlineEdit
    tags={item.tags || []}
    onSave={async (newTags) => {
      await onUpdateItem({ ...item, tags: newTags.length > 0 ? newTags : undefined });
    }}
    existingTags={allExistingTags}
    placeholder="Add tags..."
    ariaLabel={`Edit tags for ${item.title}`}
    className="mt-2"
  />
) : (
  item.tags && item.tags.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-2">
      {item.tags.slice(0, 3).map(tag => (
        <TagChip key={tag} tag={tag} variant="outline" />
      ))}
      {item.tags.length > 3 && (
        <span className="text-xs text-gray-500">
          +{item.tags.length - 3} more
        </span>
      )}
    </div>
  )
)}
```

### 4. Integration into ItemRow

```typescript
// File: src/components/ItemManager/components/ItemRow.tsx

// Tags column
<div className="hidden lg:flex flex-1 items-center gap-1">
  {enableInlineEdit && onUpdateItem ? (
    <TagsInlineEdit
      tags={item.tags || []}
      onSave={async (newTags) => {
        await onUpdateItem({
          ...item,
          tags: newTags.length > 0 ? newTags : undefined
        });
      }}
      existingTags={allExistingTags}
      placeholder="Add tags"
      ariaLabel={`Edit tags for ${item.title}`}
      className="w-full"
    />
  ) : (
    <div className="flex flex-wrap gap-1">
      {(item.tags || []).slice(0, 2).map(tag => (
        <TagChip key={tag} tag={tag} variant="outline" />
      ))}
      {(item.tags || []).length > 2 && (
        <span className="text-xs text-gray-500">
          +{item.tags.length - 2}
        </span>
      )}
    </div>
  )}
</div>
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | Main tags inline edit component |
| `src/components/ItemManager/components/shared/TagChip.tsx` | Reusable tag chip component |

### Existing Files to Modify

| File | Modification |
|------|--------------|
| `src/components/ItemManager/components/shared/index.ts` | Add TagsInlineEdit and TagChip exports |
| `src/components/ItemManager/components/ItemCard.tsx` | Integrate TagsInlineEdit for tags display/edit |
| `src/components/ItemManager/components/ItemRow.tsx` | Integrate TagsInlineEdit for tags display/edit |
| `src/components/ItemManager/components/ItemGrid.tsx` | Pass existingTags prop to ItemCard |
| `src/components/ItemManager/components/ItemList.tsx` | Pass existingTags prop to ItemRow |
| `src/components/ItemManager/ItemManager.tsx` | Compute and pass allExistingTags to view components |
| `src/components/ItemManager/ItemManager.types.ts` | Add TagsInlineEditProps interface if centralizing types |

### Files to Import From (Read Only)

| File | Imports |
|------|---------|
| `src/lib/utils.ts` | `cn` utility function |
| `src/components/ItemCapture/utils/constants.ts` | `METADATA_CONSTRAINTS`, `SUGGESTED_TAGS` |
| `lucide-react` | Icons (X, Plus, Tag, Loader2, AlertCircle) |

### Files NOT to Modify

- InlineEdit.tsx (use patterns as reference only)
- Core ItemCapture components
- Global utility files
- Files from Phase 1-5 beyond integration points

---

## Validation and Error Handling

### Tag Validation

```typescript
const validateTag = (tag: string): string | null => {
  const trimmed = tag.trim();

  // Empty check
  if (!trimmed) {
    return 'Tag cannot be empty';
  }

  // Length check
  if (trimmed.length > maxTagLength) {
    return `Tag must be ${maxTagLength} characters or less`;
  }

  // Duplicate check
  if (editTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
    return 'Tag already exists';
  }

  // Max count check
  if (editTags.length >= maxTags) {
    return `Maximum ${maxTags} tags allowed`;
  }

  return null;
};
```

### Constants (from existing codebase)

```typescript
// From METADATA_CONSTRAINTS
const DEFAULT_MAX_TAGS = 10;
const DEFAULT_MAX_TAG_LENGTH = 30;
```

### Error State Display

```typescript
{errorMessage && (
  <p
    role="alert"
    className="flex items-center gap-1 mt-1 text-sm text-red-600"
  >
    <AlertCircle className="w-4 h-4" />
    {errorMessage}
  </p>
)}
```

---

## Interaction Design

### Click Behavior

| Action | Result |
|--------|--------|
| Click on tags area | Enter edit mode, focus input |
| Click on tag chip X | Remove that tag immediately |
| Click on suggestion | Add that tag |
| Click outside | Save changes and exit edit mode |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Add current input or focused suggestion as tag |
| Comma (,) | Add current input as tag |
| Backspace (empty input) | Remove last tag |
| Arrow Down | Move to next suggestion |
| Arrow Up | Move to previous suggestion |
| Escape | Cancel edit, revert to original tags |
| Tab | Add input if present, then exit (save on blur) |

### Visual Indicators

| State | Appearance |
|-------|------------|
| Display - empty | Gray placeholder text with tag icon |
| Display - with tags | Blue tag chips with hover effect |
| Display - hover | Plus icon appears, background highlights |
| Edit - active | Border with blue focus ring |
| Saving | Disabled input, subtle loading indicator |
| Error | Red border, error message below |

---

## Accessibility Requirements

### ARIA Attributes

```typescript
<div
  role="group"
  aria-label={ariaLabel}
>
  <input
    aria-label="Add new tag"
    aria-autocomplete="list"
    aria-expanded={showSuggestions}
    aria-controls={suggestionsId}
    aria-activedescendant={
      focusedSuggestionIndex >= 0
        ? `${suggestionsId}-${focusedSuggestionIndex}`
        : undefined
    }
  />

  <ul
    id={suggestionsId}
    role="listbox"
    aria-label="Tag suggestions"
  >
    {filteredSuggestions.map((tag, index) => (
      <li
        key={tag}
        id={`${suggestionsId}-${index}`}
        role="option"
        aria-selected={focusedSuggestionIndex === index}
      >
        {tag}
      </li>
    ))}
  </ul>
</div>
```

### Focus Management

1. Auto-focus input on entering edit mode
2. Return focus to container after save/cancel
3. Maintain focus within suggestions during keyboard navigation
4. Clear focus indicators in all states

### Screen Reader Announcements

- Announce when entering/exiting edit mode
- Announce when tag is added or removed
- Announce error messages via role="alert"
- Announce suggestion count when dropdown opens

---

## Suggestions Dropdown Styling

```typescript
{showSuggestions && filteredSuggestions.length > 0 && (
  <ul
    id={suggestionsId}
    role="listbox"
    className={cn(
      'absolute z-50 left-0 right-0 mt-1',
      'bg-white border border-gray-200 rounded-lg shadow-lg',
      'max-h-48 overflow-y-auto'
    )}
  >
    {filteredSuggestions.map((tag, index) => (
      <li
        key={tag}
        id={`${suggestionsId}-${index}`}
        role="option"
        aria-selected={focusedSuggestionIndex === index}
        onClick={() => handleAddTag(tag)}
        className={cn(
          'px-3 py-2 cursor-pointer transition-colors',
          'min-h-[40px] flex items-center',
          focusedSuggestionIndex === index
            ? 'bg-blue-50 text-blue-900'
            : 'hover:bg-gray-50'
        )}
      >
        <Tag className="w-4 h-4 mr-2 text-gray-400" />
        {tag}
      </li>
    ))}
  </ul>
)}
```

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Click on tags area enters edit mode
- [ ] Input automatically focuses on edit mode
- [ ] Typing shows filtered suggestions
- [ ] Arrow keys navigate suggestions
- [ ] Enter adds focused suggestion
- [ ] Enter adds typed value when no suggestion focused
- [ ] Comma adds current input as tag
- [ ] Backspace on empty input removes last tag
- [ ] Clicking suggestion adds it
- [ ] Clicking tag X removes the tag
- [ ] Escape cancels and reverts to original tags
- [ ] Clicking outside saves changes
- [ ] Duplicate tags are prevented
- [ ] Max tags limit is enforced
- [ ] Max tag length is enforced
- [ ] Loading state shows during save
- [ ] Error state displays on save failure
- [ ] Keyboard-only operation works fully
- [ ] Screen reader announces changes
- [ ] Mobile touch targets are 48px minimum
- [ ] Tags persist after save

### Integration Test Cases

1. **Add Tag Flow**:
   - Click tags → Type "new-tag" → Enter → onUpdateItem called → Tag appears

2. **Remove Tag Flow**:
   - Click X on chip → onUpdateItem called → Tag removed

3. **Suggestion Selection Flow**:
   - Click tags → Type "main" → Arrow down → Enter → "Maintenance" added

4. **Cancel Flow**:
   - Click tags → Add tag → Escape → Original tags restored

5. **Duplicate Prevention**:
   - Add "Kitchen" → Try adding "kitchen" → Rejected (case-insensitive)

6. **Max Tags Limit**:
   - Add 10 tags → Input shows disabled → "Max tags reached" placeholder

---

## Prop Propagation Chain

The `existingTags` prop flows through the component hierarchy:

```
ItemManager
    ↓ computes allExistingTags from items
    ↓
ItemGrid / ItemList
    ↓ passes existingTags
    ↓
ItemCard / ItemRow
    ↓ passes to TagsInlineEdit
    ↓
TagsInlineEdit
    → uses for suggestions
```

### Computing Existing Tags in ItemManager

```typescript
// In ItemManager.tsx
const allExistingTags = useMemo(() => {
  const tagSet = new Set<string>();

  // Add suggested tags as baseline
  SUGGESTED_TAGS.forEach(tag => tagSet.add(tag));

  // Add tags from all items
  items.forEach(item => {
    (item.tags || []).forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}, [items]);
```

---

## Task Checklist

- [ ] Create `TagChip.tsx` component with variant support
- [ ] Create `TagsInlineEdit.tsx` component
- [ ] Implement display mode with tag chips
- [ ] Implement edit mode with input field
- [ ] Add tag suggestions dropdown
- [ ] Implement keyboard navigation (Enter, Backspace, Arrow, Escape)
- [ ] Add comma as tag separator
- [ ] Implement tag validation (duplicates, length, max count)
- [ ] Add saving state with loading indicator
- [ ] Add error state with message display
- [ ] Export from shared/index.ts
- [ ] Integrate into ItemCard.tsx
- [ ] Integrate into ItemRow.tsx
- [ ] Add existingTags prop propagation through ItemGrid/ItemList
- [ ] Compute allExistingTags in ItemManager
- [ ] Add ARIA attributes and roles
- [ ] Test keyboard accessibility
- [ ] Test on mobile devices
- [ ] Verify persistence through onUpdateItem callback

---

## Effort Estimate

| Task | Estimate | Notes |
|------|----------|-------|
| TagChip component | 30 min | Simple styled component |
| TagsInlineEdit core component | 2-3 hours | State machine, input handling |
| Suggestions dropdown | 1 hour | Filtering, keyboard nav |
| ItemCard integration | 30 min | Props wiring |
| ItemRow integration | 30 min | Props wiring |
| Prop propagation (Grid/List/Manager) | 30 min | existingTags computation |
| Accessibility | 45 min | ARIA, focus, announcements |
| Testing and refinement | 1 hour | Edge cases, mobile |
| **Total** | **6-8 hours** | Single developer |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Click conflict with preview | Medium | Medium | Use stopPropagation on TagsInlineEdit click |
| Suggestions dropdown positioning | Low | Low | Use absolute positioning with z-index |
| Performance with many existing tags | Low | Low | Limit suggestions to 10, use memoization |
| Case sensitivity issues | Medium | Low | Normalize to lowercase for comparison |
| Mobile keyboard covering input | Medium | Medium | Use visualViewport API, scroll into view |
| Save race conditions | Low | Medium | Disable interactions during saving |

---

## Implementation Notes

### Quick Remove vs Edit Mode

The implementation supports two remove patterns:
1. **Quick Remove**: In display mode, clicking X on a chip triggers immediate save
2. **Edit Mode Remove**: In edit mode, removals are batched until blur/confirm

Choose based on UX preference:
- Quick remove = faster for single changes
- Edit mode only = prevents accidental changes, supports cancel

Recommendation: Implement **edit mode only** for consistency with InlineEdit pattern.

### Suggestions Source

Combine sources for comprehensive suggestions:
1. SUGGESTED_TAGS from constants (baseline)
2. Tags from all items in the collection (dynamic)
3. Deduplicate and sort alphabetically

### Optimistic Updates

Similar to REQ-087, use pessimistic updates by default:
- Wait for onSave to resolve before updating display
- Show error if save fails
- Can be enhanced to optimistic if needed later

---

## References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 6 details
- [REQ-086 InlineEdit](/docs/REQ-086-create-inlineedit-component-overview.md) - Component patterns
- [REQ-087 Title/Location](/docs/REQ-087-integrate-titlelocation-inline-edit-overview.md) - Integration patterns
- [MetadataStep](/src/components/ItemCapture/components/steps/MetadataStep.tsx) - Tag UI reference
- [ItemCapture Constants](/src/components/ItemCapture/utils/constants.ts) - SUGGESTED_TAGS, METADATA_CONSTRAINTS
- [Request #088](/docs/gen_requests.md) - Original feature request

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
