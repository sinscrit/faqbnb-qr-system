# REQ-086: Create InlineEdit Component - Implementation Overview

**Document Created:** 2026-01-03T09:45:00
**Last Modified:** 2026-01-03T09:45:00
**Request Reference:** `/docs/gen_requests.md` - REQ-086
**Implementation Plan Reference:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 6 - Inline Edit & Polish
**Task ID:** 6.1
**Status:** PENDING

---

## Overview

This document provides the technical implementation breakdown for the InlineEdit component, a reusable click-to-edit text field component that will be used throughout the ItemManager for inline editing of item titles, locations, and other text-based fields.

### Purpose

The InlineEdit component enables users to edit text values directly in context without navigating to separate forms. It provides:
- Click-to-edit activation
- Keyboard navigation (Escape to cancel, Enter/blur to save)
- Loading state during save operations
- Error state display for failed saves
- Smooth transitions between display and edit modes

### Context Within ItemManager

As per the implementation plan, InlineEdit is a shared component located in:
```
src/components/ItemManager/components/shared/InlineEdit.tsx
```

It serves as a foundational component for Phase 6 tasks:
- Task 6.1: Create InlineEdit component (this task)
- Task 6.2: Integrate title/location inline edit (depends on 6.1)
- Task 6.3: Implement tags inline edit (depends on 6.1)

---

## Dependencies

### Hard Dependencies (Phase 5 must be complete)
- Phase 1-5 of ItemManager implementation must be complete
- ItemManager types and structure established

### Technical Dependencies
| Dependency | Source | Purpose |
|------------|--------|---------|
| `cn()` utility | `src/lib/utils.ts` | Class name merging with Tailwind |
| Lucide React | `lucide-react` | Icons (Loader2, Check, X, AlertCircle) |
| React hooks | react | useState, useRef, useCallback, useEffect |

### No New Dependencies Required
This component uses only existing codebase dependencies.

---

## Component Architecture

### Props Interface

```typescript
// File: src/components/ItemManager/components/shared/InlineEdit.tsx

export interface InlineEditProps {
  /** Current text value to display and edit */
  value: string;

  /** Callback when save is triggered - should return Promise for loading state */
  onSave: (newValue: string) => Promise<void>;

  /** Optional callback when edit is cancelled */
  onCancel?: () => void;

  /** Placeholder text when value is empty */
  placeholder?: string;

  /** Whether the component is disabled */
  disabled?: boolean;

  /** Maximum character length for input */
  maxLength?: number;

  /** Minimum character length for validation */
  minLength?: number;

  /** Custom validation function - returns error message or null */
  validate?: (value: string) => string | null;

  /** Additional CSS classes for the container */
  className?: string;

  /** Additional CSS classes for the display text */
  displayClassName?: string;

  /** Additional CSS classes for the input field */
  inputClassName?: string;

  /** Accessible label for the input */
  ariaLabel?: string;

  /** Whether to trim whitespace on save (default: true) */
  trimOnSave?: boolean;

  /** Input type (default: 'text') */
  inputType?: 'text' | 'email' | 'url';

  /** Whether to allow saving empty values (default: false) */
  allowEmpty?: boolean;
}
```

### State Machine

The component operates in four distinct states:

```typescript
type InlineEditState = 'display' | 'editing' | 'saving' | 'error';
```

**State Transitions:**
```
┌─────────────┐
│   display   │ ◄────────────────────────────────┐
└──────┬──────┘                                   │
       │ click/focus                              │
       ▼                                          │
┌─────────────┐                                   │
│   editing   │ ───────Escape─────────────────────┤
└──────┬──────┘                                   │
       │ Enter/blur                               │
       ▼                                          │
┌─────────────┐                                   │
│   saving    │ ─────success──────────────────────┤
└──────┬──────┘                                   │
       │ failure                                  │
       ▼                                          │
┌─────────────┐                                   │
│   error     │ ───────retry/dismiss──────────────┘
└─────────────┘
```

### Internal State Structure

```typescript
interface InternalState {
  /** Current component state */
  status: InlineEditState;

  /** Value being edited (preserved during edit session) */
  editValue: string;

  /** Original value at edit start (for cancellation) */
  originalValue: string;

  /** Error message from failed save or validation */
  errorMessage: string | null;
}
```

---

## Implementation Details

### File Structure

```
src/components/ItemManager/components/shared/
├── InlineEdit.tsx          # Main component
├── InlineEdit.test.tsx     # Unit tests (optional for this phase)
└── index.ts                # Update barrel export
```

### Component Implementation Pattern

Following existing patterns from `MetadataStep.tsx` and `ValidationMessage.tsx`:

```typescript
'use client';

/**
 * InlineEdit Component
 *
 * A reusable click-to-edit text field component with loading state,
 * error handling, and keyboard navigation support.
 *
 * @module ItemManager/components/shared/InlineEdit
 * @see docs/REQ-086-create-inlineedit-component-overview.md
 * @lastModified 2026-01-03 (REQ-086)
 */

import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
import { Loader2, Check, X, AlertCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
```

### Key Implementation Features

#### 1. Click-to-Edit Activation
- Display mode shows text with visual indicator (subtle underline or pencil icon on hover)
- Clicking transforms to input field with automatic focus
- Cursor positioned at end of text

#### 2. Keyboard Navigation
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    handleCancel();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    handleSave();
  }
};
```

#### 3. Blur Handling
- Blur triggers save (same as Enter)
- Must handle blur during saving to prevent double-save
- Ignore blur when clicking save/cancel buttons (use mousedown)

#### 4. Loading State
- Input disabled during save
- Loader2 spinner displayed
- Visual styling indicates processing

#### 5. Error Display
- Error message appears below input
- Input styled with error border (red)
- Error clears on next edit attempt or explicit dismiss

### Styling Patterns

Following existing Tailwind patterns from the codebase:

```typescript
// Display mode styling
const displayStyles = cn(
  'cursor-pointer rounded px-2 py-1',
  'hover:bg-gray-100 transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500',
  'group'
);

// Input field styling (matching MetadataStep patterns)
const inputStyles = cn(
  'w-full px-3 py-2 border rounded-lg transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  'min-h-[40px]',
  hasError
    ? 'border-red-300 bg-red-50'
    : 'border-gray-300 hover:border-gray-400'
);

// Loading state
const loadingStyles = cn(
  'opacity-75 cursor-not-allowed',
  'bg-gray-50'
);

// Error message (matching ValidationMessage patterns)
const errorStyles = cn(
  'flex items-center gap-1 mt-1 text-sm text-red-600'
);
```

### Accessibility Requirements

Following patterns from existing components:

1. **ARIA Labels**
```typescript
<input
  aria-label={ariaLabel}
  aria-invalid={!!errorMessage}
  aria-describedby={errorMessage ? errorId : undefined}
/>
```

2. **Focus Management**
- Auto-focus input on entering edit mode
- Return focus to trigger element after save/cancel
- Proper tabIndex handling

3. **Screen Reader Announcements**
```typescript
{errorMessage && (
  <p id={errorId} role="alert" className={errorStyles}>
    <AlertCircle className="w-4 h-4" />
    {errorMessage}
  </p>
)}
```

4. **Keyboard-Only Operation**
- Component fully operable without mouse
- Clear focus indicators
- Escape/Enter shortcuts documented

---

## Authorized Files and Functions for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ItemManager/components/shared/InlineEdit.tsx` | Main InlineEdit component implementation |

### Existing Files to Modify

| File | Modification |
|------|--------------|
| `src/components/ItemManager/components/shared/index.ts` | Add InlineEdit export (create if not exists) |
| `src/components/ItemManager/index.ts` | Re-export InlineEdit if needed for external use |
| `src/components/ItemManager/ItemManager.types.ts` | Add InlineEditProps interface if centralizing types |

### Files NOT to Modify

- Core ItemCapture components (read-only reference)
- Global utility files (use existing patterns only)
- Any Phase 1-5 components (modifications deferred to tasks 6.2-6.3)

---

## Validation and Error Handling

### Built-in Validation

```typescript
const validateValue = (value: string): string | null => {
  const trimmed = trimOnSave ? value.trim() : value;

  // Empty check
  if (!allowEmpty && !trimmed) {
    return 'Value cannot be empty';
  }

  // Min length
  if (minLength && trimmed.length < minLength) {
    return `Minimum ${minLength} characters required`;
  }

  // Max length
  if (maxLength && trimmed.length > maxLength) {
    return `Maximum ${maxLength} characters allowed`;
  }

  // Custom validation
  if (validate) {
    return validate(trimmed);
  }

  return null;
};
```

### Error State Recovery

1. User can edit the value again (clears error)
2. User can press Escape to cancel entirely
3. User can dismiss error and retry save
4. Error auto-clears after successful save

---

## Integration Contract

### Usage Example

```tsx
// In ItemCard.tsx or ItemRow.tsx (Phase 6.2)
import { InlineEdit } from '../shared/InlineEdit';

function ItemCard({ item, onUpdateItem }: ItemCardProps) {
  const handleTitleSave = async (newTitle: string) => {
    await onUpdateItem({ ...item, title: newTitle });
  };

  return (
    <div className="p-4 border rounded-lg">
      <InlineEdit
        value={item.title}
        onSave={handleTitleSave}
        placeholder="Enter title..."
        ariaLabel="Edit item title"
        maxLength={100}
        className="font-semibold text-lg"
      />

      <InlineEdit
        value={item.location || ''}
        onSave={async (newLocation) => {
          await onUpdateItem({ ...item, location: newLocation || undefined });
        }}
        placeholder="Add location..."
        ariaLabel="Edit item location"
        allowEmpty
        className="text-gray-600 text-sm"
      />
    </div>
  );
}
```

### Callback Contract

The `onSave` callback:
1. Receives the new trimmed value (if `trimOnSave: true`)
2. Must return a Promise
3. Throwing an error transitions to error state with error.message
4. Resolving successfully transitions to display state

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Click to enter edit mode
- [ ] Focus automatically set to input
- [ ] Enter key triggers save
- [ ] Escape key cancels edit
- [ ] Blur (clicking outside) triggers save
- [ ] Loading spinner appears during async save
- [ ] Input disabled during save
- [ ] Error message displays on save failure
- [ ] Error clears when editing resumes
- [ ] Empty value validation works
- [ ] MaxLength constraint works
- [ ] Custom validation works
- [ ] Keyboard-only navigation works
- [ ] Screen reader announces state changes
- [ ] Touch targets are 48px minimum (mobile)

### Edge Cases

1. **Double-click**: Should not trigger double-edit or double-save
2. **Rapid clicks**: Debounce or ignore during transitions
3. **Very long text**: Handle overflow with ellipsis in display mode
4. **Network timeout**: onSave should handle timeout and throw error
5. **Component unmount**: Cleanup any pending async operations

---

## Styling Reference

### Visual States

| State | Background | Border | Text | Indicator |
|-------|------------|--------|------|-----------|
| Display | transparent | none | normal | Pencil icon on hover |
| Editing | white | gray-300 | normal | - |
| Saving | gray-50 | gray-300 | gray-500 | Loader2 spinner |
| Error | red-50 | red-300 | normal | AlertCircle + message |

### Hover/Focus States

```css
/* Display mode */
.display:hover { background: gray-100 }
.display:focus { ring-2 ring-blue-500 }

/* Input mode */
.input:focus { ring-2 ring-blue-500, border-transparent }
.input.error:focus { ring-2 ring-red-500 }
```

---

## Task Checklist

- [ ] Create `InlineEdit.tsx` with full TypeScript types
- [ ] Implement display mode with click handler
- [ ] Implement edit mode with input field
- [ ] Add Enter key save handler
- [ ] Add Escape key cancel handler
- [ ] Add blur save handler (with double-save prevention)
- [ ] Implement loading state with spinner
- [ ] Implement error state with message display
- [ ] Add built-in validation (empty, minLength, maxLength)
- [ ] Support custom validation function
- [ ] Ensure full keyboard accessibility
- [ ] Add proper ARIA attributes
- [ ] Export from shared/index.ts
- [ ] Verify integration with cn() utility
- [ ] Test on mobile (48px touch targets)

---

## Effort Estimate

| Task | Estimate | Notes |
|------|----------|-------|
| Core component implementation | 2-3 hours | State machine, handlers |
| Styling and transitions | 1 hour | Tailwind classes, animations |
| Accessibility | 30 min | ARIA, focus management |
| Testing and refinement | 1 hour | Edge cases, mobile |
| **Total** | **4-5 hours** | Single developer |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Blur/save race conditions | Medium | Medium | Use refs to track state during async |
| Mobile touch handling | Low | Medium | Test on iOS/Android simulators |
| Focus management edge cases | Low | Low | Follow existing MetadataStep patterns |

---

## References

- [Implementation Plan](/docs/prd/item-capture-manager-implementation-plan.md) - Phase 6 details
- [MetadataStep](/src/components/ItemCapture/components/steps/MetadataStep.tsx) - Input field patterns
- [ValidationMessage](/src/components/ItemCapture/components/shared/ValidationMessage.tsx) - Error display patterns
- [ConfirmationModal](/src/components/ConfirmationModal.tsx) - Loading state patterns
- [cn() utility](/src/lib/utils.ts) - Class merging utility

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 | Tech Lead Agent | Initial document creation |
