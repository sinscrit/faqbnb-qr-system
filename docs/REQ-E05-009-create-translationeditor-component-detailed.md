# REQ-E05-009: Create TranslationEditor Component - Detailed Task Breakdown

## Document Metadata

**Date Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Status:** READY FOR IMPLEMENTATION
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.5
**Size:** M (Medium)
**Estimated Tasks:** 12 tasks (1 story point each)

---

## Overview

This document provides a detailed, step-by-step task breakdown for implementing the TranslationEditor component - a modal dialog that enables property owners to manually edit machine-generated translations with a side-by-side view comparing original source content and editable translation text.

**Reference Documents:**
- Overview: `/docs/REQ-E05-009-create-translationeditor-component-overview.md`
- Request: `/docs/gen_requests_epic5.md` (REQ-E05-010)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Dependencies

### Required Before Starting

| Dependency | Source | Status Check |
|------------|--------|--------------|
| Translation table schema | Epic 1 | Verify `translation_status` column exists |
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts` | Import available |
| `SUPPORTED_LANGUAGES` constant | `/src/lib/translation-service/translation-service.types.ts` | Import available |
| Manual translation update API | REQ-E05-002 | `PUT /api/translations/[entityType]/[entityId]/[language]` |
| TranslationManagement types file | REQ-E05-006 | `/src/components/TranslationManagement/TranslationManagement.types.ts` |
| Radix UI Dialog | npm package | `@radix-ui/react-dialog` (already installed) |

### Existing Patterns to Follow

| Pattern | Reference File | Relevant Lines |
|---------|---------------|----------------|
| Radix Dialog Modal | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Full file - Dialog.Root, Portal, Overlay, Content |
| Character Counter | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Lines 63-112 |
| Unsaved Changes Confirmation | `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Full file |
| Focus Trap Hook | `/src/components/ItemCreationWorkflow/utils/accessibility.ts` | `useFocusTrap` hook |

---

## Task Breakdown

### Task 1: Create TranslationEditor Types File

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.types.ts`

**Description:** Create the TypeScript type definitions for the TranslationEditor component including props interface, internal state types, and any utility types specific to the editor.

**Acceptance Criteria:**
- [ ] File created at specified path
- [ ] `TranslationEditorProps` interface defined with all required/optional props
- [ ] `TranslationContent` interface defined for content structure
- [ ] `CharacterCountState` type defined for counter logic
- [ ] Types properly exported for use in main component
- [ ] JSDoc comments added for complex types

**Implementation Details:**

```typescript
// TranslationEditor.types.ts

import { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';

/**
 * Props for the TranslationEditor component.
 * Controls the side-by-side translation editing modal.
 */
export interface TranslationEditorProps {
  /** Whether editor modal is open */
  isOpen: boolean;

  /** Entity being translated */
  entityType: 'article' | 'item' | 'link';
  entityId: string;

  /** Target language for editing */
  language: SupportedLanguage;

  /** Source content (original language) - read-only display */
  sourceContent: TranslationContent;

  /** Source language code */
  sourceLanguage: SupportedLanguage;

  /** Existing translation content (if any) */
  existingTranslation?: TranslationContent & {
    status?: TranslationStatus;
  };

  /** Maximum character limit for warnings (optional) */
  maxCharacters?: number;

  /** Save handler - receives updated content */
  onSave: (content: TranslationContent) => Promise<void>;

  /** Cancel/close handler */
  onCancel: () => void;
}

/**
 * Content structure for translations.
 * Matches database column structure for translation tables.
 */
export interface TranslationContent {
  title?: string;
  description?: string;
  name?: string;
}

/**
 * Character count state for a single field.
 */
export interface CharacterCountState {
  current: number;
  max: number;
  isWarning: boolean;
  isError: boolean;
  percentage: number;
}

/**
 * Internal editor state.
 */
export interface TranslationEditorState {
  editedContent: TranslationContent;
  isDirty: boolean;
  isSaving: boolean;
  showConfirmDiscard: boolean;
  error: string | null;
}
```

**Verification:**
- TypeScript compiles without errors
- Types are importable from the types file

---

### Task 2: Create Barrel Export File

**File:** `/src/components/TranslationManagement/TranslationEditor/index.ts`

**Description:** Create the barrel export file for the TranslationEditor module to enable clean imports.

**Acceptance Criteria:**
- [ ] File created at specified path
- [ ] Exports TranslationEditor component
- [ ] Exports all types from types file
- [ ] Named exports used (not default)

**Implementation Details:**

```typescript
// index.ts

export { TranslationEditor } from './TranslationEditor';
export type {
  TranslationEditorProps,
  TranslationContent,
  CharacterCountState,
  TranslationEditorState,
} from './TranslationEditor.types';
```

**Verification:**
- Imports work: `import { TranslationEditor } from '@/components/TranslationManagement/TranslationEditor'`

---

### Task 3: Create Main Component Shell with Radix Dialog

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Create the main TranslationEditor component file with Radix Dialog structure, state initialization, and basic modal rendering without internal content.

**Acceptance Criteria:**
- [ ] 'use client' directive at top
- [ ] Component function signature matches props interface
- [ ] Dialog.Root with controlled open state
- [ ] Dialog.Portal with Overlay and Content
- [ ] Overlay has backdrop blur/dim effect
- [ ] Content has responsive max-width (max-w-4xl)
- [ ] Basic animation classes for open/close
- [ ] Component exported as named export

**Implementation Details:**

```typescript
'use client';

/**
 * TranslationEditor Component
 *
 * Modal dialog for manual translation editing with side-by-side
 * source/translation comparison.
 *
 * @module TranslationManagement/TranslationEditor
 * @see docs/REQ-E05-009-create-translationeditor-component-detailed.md
 * @lastModified 2026-01-20
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  getLanguageInfo,
} from '@/lib/translation-service/translation-service.types';
import type { TranslationEditorProps, TranslationContent } from './TranslationEditor.types';

export function TranslationEditor({
  isOpen,
  entityType,
  entityId,
  language,
  sourceContent,
  sourceLanguage,
  existingTranslation,
  maxCharacters = 500,
  onSave,
  onCancel,
}: TranslationEditorProps) {
  // State will be added in Task 4

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        {/* Overlay backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out'
          )}
        />

        {/* Modal content */}
        <Dialog.Content
          className={cn(
            // Base positioning
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            // Sizing
            'w-[calc(100%-2rem)] max-w-4xl max-h-[90vh]',
            // Styling
            'bg-white rounded-lg shadow-xl',
            'flex flex-col overflow-hidden',
            // Animation
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out',
            'duration-300'
          )}
        >
          {/* Content sections will be added in subsequent tasks */}
          <div className="p-6">
            <p>TranslationEditor - Content coming in next tasks</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Verification:**
- Component renders when `isOpen={true}`
- Modal appears centered with overlay
- Clicking overlay calls `onCancel`

---

### Task 4: Add State Management and Dirty Detection

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add state management for edited content, dirty state detection, save loading state, and confirmation dialog visibility.

**Acceptance Criteria:**
- [ ] `editedContent` state initialized from `existingTranslation` or empty
- [ ] `isDirty` computed by comparing `editedContent` to `existingTranslation`
- [ ] `isSaving` state for loading indicator during save
- [ ] `showConfirmDiscard` state for unsaved changes dialog
- [ ] `error` state for API error messages
- [ ] State resets when modal closes/reopens

**Implementation Details:**

Add to component after props destructuring:

```typescript
// =============================================================================
// State Management
// =============================================================================

const [editedContent, setEditedContent] = useState<TranslationContent>(
  existingTranslation ?? {}
);
const [isSaving, setIsSaving] = useState(false);
const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
const [error, setError] = useState<string | null>(null);

// Compute dirty state
const isDirty = useMemo(() => {
  const original = existingTranslation ?? {};
  return JSON.stringify(editedContent) !== JSON.stringify(original);
}, [editedContent, existingTranslation]);

// Reset state when modal opens/closes or existingTranslation changes
useEffect(() => {
  if (isOpen) {
    setEditedContent(existingTranslation ?? {});
    setError(null);
    setShowConfirmDiscard(false);
  }
}, [isOpen, existingTranslation]);
```

**Verification:**
- `isDirty` is `false` initially
- `isDirty` becomes `true` when content is edited
- State resets when modal reopens

---

### Task 5: Implement Modal Header with Language Display

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add the modal header section displaying the language flag, language name, and close button.

**Acceptance Criteria:**
- [ ] Header displays flag emoji from SUPPORTED_LANGUAGES
- [ ] Header shows "Edit {Language Name} Translation" text
- [ ] Close button (X) in top-right corner
- [ ] Close button has 44px touch target
- [ ] Close button triggers cancel workflow (with confirmation if dirty)
- [ ] Dialog.Title used for accessibility

**Implementation Details:**

```typescript
// Get language info for display
const languageInfo = getLanguageInfo(language);
const languageDisplay = languageInfo
  ? `${languageInfo.flag} Edit ${languageInfo.name} Translation`
  : `Edit ${language.toUpperCase()} Translation`;

// Handle close attempt
const handleCloseAttempt = useCallback(() => {
  if (isDirty) {
    setShowConfirmDiscard(true);
  } else {
    onCancel();
  }
}, [isDirty, onCancel]);

// JSX for header (inside Dialog.Content)
<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
  <Dialog.Title className="text-lg font-semibold text-gray-900">
    {languageDisplay}
  </Dialog.Title>

  <Dialog.Close asChild>
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        handleCloseAttempt();
      }}
      className={cn(
        'flex items-center justify-center',
        'w-11 h-11', // 44px touch target
        'rounded-full',
        'text-gray-500 hover:text-gray-700',
        'hover:bg-gray-100 focus:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'transition-colors'
      )}
      aria-label="Close editor"
    >
      <X className="w-5 h-5" />
    </button>
  </Dialog.Close>
</div>
```

**Verification:**
- Flag emoji and language name display correctly for all 6 languages
- Close button visible and focusable
- Clicking X when dirty shows confirmation dialog

---

### Task 6: Implement Side-by-Side Content Layout

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Create the main content area with side-by-side layout showing source content on the left (read-only) and translation textarea on the right (editable).

**Acceptance Criteria:**
- [ ] Desktop (≥768px): Two equal columns (50% each)
- [ ] Mobile (<768px): Stacked layout with source on top
- [ ] Left column: Read-only source with gray background
- [ ] Right column: Editable textarea(s)
- [ ] Column headers: "Original ({Source Language})" and "Translation ({Target Language})"
- [ ] Scrollable content area if content exceeds max height

**Implementation Details:**

```typescript
// Get source language info
const sourceLanguageInfo = getLanguageInfo(sourceLanguage);
const targetLanguageInfo = getLanguageInfo(language);

// Content area JSX
<div className="flex-1 overflow-y-auto">
  <div className={cn(
    'grid gap-6 p-6',
    // Desktop: side-by-side
    'md:grid-cols-2',
    // Mobile: stacked
    'grid-cols-1'
  )}>
    {/* Left Column: Source Content (Read-only) */}
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">
        Original ({sourceLanguageInfo?.name ?? sourceLanguage})
      </h3>

      <div className="space-y-4">
        {/* Title field */}
        {sourceContent.title !== undefined && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Title
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
              {sourceContent.title || <span className="text-gray-400 italic">No title</span>}
            </div>
          </div>
        )}

        {/* Name field (for items) */}
        {sourceContent.name !== undefined && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Name
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
              {sourceContent.name || <span className="text-gray-400 italic">No name</span>}
            </div>
          </div>
        )}

        {/* Description field */}
        {sourceContent.description !== undefined && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm min-h-[100px] whitespace-pre-wrap">
              {sourceContent.description || <span className="text-gray-400 italic">No description</span>}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Right Column: Translation (Editable) */}
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">
        Translation ({targetLanguageInfo?.name ?? language})
      </h3>

      {/* Editable fields added in Task 7 */}
    </div>
  </div>
</div>
```

**Verification:**
- On desktop (≥768px): columns display side by side
- On mobile (<768px): columns stack vertically
- Source content displays in read-only style with gray background

---

### Task 7: Implement Editable Textarea Fields

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add editable textarea fields for translation content with auto-expand behavior and change handlers.

**Acceptance Criteria:**
- [ ] Textarea for title/name (single line styled)
- [ ] Textarea for description (multi-line, auto-expand)
- [ ] Only show fields that exist in sourceContent
- [ ] Auto-expand up to max height (300px)
- [ ] Change handlers update `editedContent` state
- [ ] Proper font size and spacing matching source display

**Implementation Details:**

```typescript
// Content update handler
const handleContentChange = useCallback((
  field: keyof TranslationContent,
  value: string
) => {
  setEditedContent(prev => ({
    ...prev,
    [field]: value,
  }));
  setError(null); // Clear any previous error
}, []);

// Editable fields JSX (in right column)
<div className="space-y-4">
  {/* Title field */}
  {sourceContent.title !== undefined && (
    <div>
      <label
        htmlFor="translation-title"
        className="block text-xs font-medium text-gray-500 mb-1"
      >
        Title
      </label>
      <textarea
        id="translation-title"
        value={editedContent.title ?? ''}
        onChange={(e) => handleContentChange('title', e.target.value)}
        disabled={isSaving}
        className={cn(
          'w-full p-3 border rounded-lg text-sm',
          'resize-none overflow-hidden',
          'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        rows={1}
        style={{ minHeight: '44px' }}
        aria-describedby="title-char-count"
      />
    </div>
  )}

  {/* Name field */}
  {sourceContent.name !== undefined && (
    <div>
      <label
        htmlFor="translation-name"
        className="block text-xs font-medium text-gray-500 mb-1"
      >
        Name
      </label>
      <textarea
        id="translation-name"
        value={editedContent.name ?? ''}
        onChange={(e) => handleContentChange('name', e.target.value)}
        disabled={isSaving}
        className={cn(
          'w-full p-3 border rounded-lg text-sm',
          'resize-none overflow-hidden',
          'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        rows={1}
        style={{ minHeight: '44px' }}
        aria-describedby="name-char-count"
      />
    </div>
  )}

  {/* Description field */}
  {sourceContent.description !== undefined && (
    <div>
      <label
        htmlFor="translation-description"
        className="block text-xs font-medium text-gray-500 mb-1"
      >
        Description
      </label>
      <textarea
        id="translation-description"
        value={editedContent.description ?? ''}
        onChange={(e) => handleContentChange('description', e.target.value)}
        disabled={isSaving}
        className={cn(
          'w-full p-3 border rounded-lg text-sm',
          'resize-y',
          'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        rows={4}
        style={{ minHeight: '100px', maxHeight: '300px' }}
        aria-describedby="description-char-count"
      />
    </div>
  )}
</div>
```

**Verification:**
- Typing in textarea updates `editedContent` state
- `isDirty` becomes `true` when content differs from original
- Textareas are disabled when `isSaving` is true

---

### Task 8: Implement Character Counter Component

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add character counter below each editable field showing current count, max limit, and visual progress indicator with warning/error states.

**Acceptance Criteria:**
- [ ] Display format: "{current} / {max} characters"
- [ ] Progress bar beneath text label
- [ ] Normal state: blue progress bar
- [ ] Warning state (≥90%): yellow/orange progress bar
- [ ] Error state (>100%): red progress bar and text
- [ ] `aria-live="polite"` for screen reader updates
- [ ] Progress bar has proper ARIA attributes

**Implementation Details:**

```typescript
// CharacterCounter sub-component
interface CharacterCounterProps {
  current: number;
  max: number;
  id: string;
}

function CharacterCounter({ current, max, id }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const warningThreshold = max * 0.9;
  const isWarning = current >= warningThreshold && current <= max;
  const isError = current > max;

  return (
    <div className="flex items-center justify-between text-xs mt-1.5" id={id}>
      <span
        className={cn(
          'tabular-nums',
          isError && 'text-red-600 font-medium',
          isWarning && 'text-yellow-600',
          !isWarning && !isError && 'text-gray-500'
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {current.toLocaleString()} / {max.toLocaleString()} characters
      </span>

      <div
        className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden ml-2"
        aria-hidden="true"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isError && 'bg-red-500',
            isWarning && 'bg-yellow-500',
            !isWarning && !isError && 'bg-blue-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

// Add after each textarea:
<CharacterCounter
  current={editedContent.description?.length ?? 0}
  max={maxCharacters}
  id="description-char-count"
/>
```

**Verification:**
- Counter updates in real-time as user types
- Colors change at warning (90%) and error (>100%) thresholds
- Progress bar animates smoothly

---

### Task 9: Implement Dirty State Indicator

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add visual indicator showing when there are unsaved changes to the translation.

**Acceptance Criteria:**
- [ ] Indicator displays only when `isDirty` is true
- [ ] Uses amber/yellow color to indicate unsaved state
- [ ] Positioned below character counter or in footer area
- [ ] Text: "● Unsaved changes"
- [ ] Icon uses filled circle indicator

**Implementation Details:**

```typescript
// Dirty state indicator (add below translation column or in footer)
{isDirty && (
  <div
    className="flex items-center gap-1.5 text-amber-600 text-sm mt-3"
    role="status"
    aria-live="polite"
  >
    <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
    <span>Unsaved changes</span>
  </div>
)}
```

**Verification:**
- Indicator hidden when content matches original
- Indicator appears when any field is modified
- Indicator disappears after successful save

---

### Task 10: Implement Footer with Save/Cancel Buttons

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add the modal footer with Cancel and Save buttons, including proper states (disabled, loading) and handlers.

**Acceptance Criteria:**
- [ ] Cancel button: gray secondary style
- [ ] Save button: blue primary style
- [ ] Save button disabled when `isDirty` is false
- [ ] Save button shows loading spinner when `isSaving`
- [ ] Cancel triggers confirmation if dirty
- [ ] Save calls `onSave` prop with edited content
- [ ] Error message displays below buttons if save fails

**Implementation Details:**

```typescript
// Save handler
const handleSave = useCallback(async () => {
  setIsSaving(true);
  setError(null);

  try {
    await onSave(editedContent);
    // onSave should close the modal on success
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to save translation. Please try again.'
    );
    setIsSaving(false);
  }
}, [editedContent, onSave]);

// Footer JSX
<div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
  {/* Error message */}
  {error && (
    <div
      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
      role="alert"
    >
      {error}
    </div>
  )}

  {/* Buttons */}
  <div className="flex justify-end gap-3">
    <button
      type="button"
      onClick={handleCloseAttempt}
      disabled={isSaving}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg',
        'text-gray-700 bg-gray-100',
        'hover:bg-gray-200',
        'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors min-h-[44px]'
      )}
    >
      Cancel
    </button>

    <button
      type="button"
      onClick={handleSave}
      disabled={!isDirty || isSaving}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg',
        'text-white bg-blue-600',
        'hover:bg-blue-700',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors min-h-[44px]',
        'inline-flex items-center gap-2'
      )}
    >
      {isSaving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {isSaving ? 'Saving...' : 'Save Changes'}
    </button>
  </div>
</div>
```

**Verification:**
- Save button disabled when no changes made
- Save button shows spinner during save
- Error displays if save fails
- Cancel shows confirmation when dirty

---

### Task 11: Implement Unsaved Changes Confirmation Dialog

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add nested confirmation dialog that appears when user tries to close the modal with unsaved changes.

**Acceptance Criteria:**
- [ ] Dialog appears when closing with `isDirty` true
- [ ] Title: "Discard Changes?"
- [ ] Message explains unsaved changes will be lost
- [ ] "Keep Editing" button returns to editor
- [ ] "Discard Changes" button closes modal without saving
- [ ] Focus trapped within confirmation dialog
- [ ] Escape key closes confirmation (not whole modal)

**Implementation Details:**

```typescript
// Confirmation dialog handlers
const handleConfirmDiscard = useCallback(() => {
  setShowConfirmDiscard(false);
  onCancel();
}, [onCancel]);

const handleKeepEditing = useCallback(() => {
  setShowConfirmDiscard(false);
}, []);

// Confirmation dialog JSX (render after main Dialog)
{showConfirmDiscard && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="discard-dialog-title"
    aria-describedby="discard-dialog-description"
    onClick={handleKeepEditing}
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleKeepEditing();
      }
    }}
  >
    <div
      className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h3
        id="discard-dialog-title"
        className="text-lg font-medium text-gray-900 mb-2"
      >
        Discard Changes?
      </h3>
      <p
        id="discard-dialog-description"
        className="text-gray-600 text-sm mb-6"
      >
        You have unsaved changes to this translation.
        Are you sure you want to discard them?
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleKeepEditing}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg',
            'text-gray-700 bg-gray-100',
            'hover:bg-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-gray-500',
            'min-h-[44px]'
          )}
          autoFocus
        >
          Keep Editing
        </button>
        <button
          type="button"
          onClick={handleConfirmDiscard}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg',
            'text-white bg-red-600',
            'hover:bg-red-700',
            'focus:outline-none focus:ring-2 focus:ring-red-500',
            'min-h-[44px]'
          )}
        >
          Discard Changes
        </button>
      </div>
    </div>
  </div>
)}
```

**Verification:**
- Confirmation appears when clicking Cancel/X with unsaved changes
- "Keep Editing" returns to editor without losing changes
- "Discard Changes" closes modal completely
- Escape key closes confirmation dialog only

---

### Task 12: Add Keyboard and Accessibility Features

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add keyboard handling (Escape key), focus management, and ARIA attributes for full accessibility.

**Acceptance Criteria:**
- [ ] Escape key triggers cancel workflow (with confirmation if dirty)
- [ ] Focus moves to first textarea when modal opens
- [ ] Focus returns to trigger element when modal closes
- [ ] All interactive elements have accessible labels
- [ ] Screen reader announcements for state changes
- [ ] Tab order is logical (left-to-right, top-to-bottom)

**Implementation Details:**

```typescript
// Refs for focus management
const firstTextareaRef = useRef<HTMLTextAreaElement>(null);

// Focus first textarea when modal opens
useEffect(() => {
  if (isOpen) {
    // Small delay to ensure modal is rendered
    requestAnimationFrame(() => {
      firstTextareaRef.current?.focus();
    });
  }
}, [isOpen]);

// Handle Escape key on Dialog.Content
<Dialog.Content
  onEscapeKeyDown={(e) => {
    e.preventDefault();
    handleCloseAttempt();
  }}
  // ... other props
>

// Add ref to first textarea
<textarea
  ref={firstTextareaRef}
  id="translation-title"
  // ... other props
/>

// Screen reader announcement for save state
<div aria-live="polite" className="sr-only">
  {isSaving && 'Saving translation...'}
  {error && `Error: ${error}`}
</div>
```

**Verification:**
- Escape key shows confirmation when dirty
- Escape key closes modal directly when clean
- First textarea receives focus on open
- Screen readers announce status changes

---

### Task 13: Update TranslationManagement Barrel Exports

**File:** `/src/components/TranslationManagement/index.ts`

**Description:** Update the main TranslationManagement barrel export file to include the new TranslationEditor component.

**Acceptance Criteria:**
- [ ] TranslationEditor exported from index.ts
- [ ] TranslationEditor types exported
- [ ] No duplicate exports
- [ ] Maintains existing exports

**Implementation Details:**

```typescript
// /src/components/TranslationManagement/index.ts

// Existing exports (if any)
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export { TranslationStatusItem } from './TranslationPreviewPanel/TranslationStatusItem';

// New exports
export { TranslationEditor } from './TranslationEditor';
export type {
  TranslationEditorProps,
  TranslationContent,
} from './TranslationEditor';
```

**Note:** If the TranslationManagement folder doesn't exist yet, create it along with the index.ts file.

**Verification:**
- Import works: `import { TranslationEditor } from '@/components/TranslationManagement'`
- TypeScript compiles without errors

---

## Testing Checklist

### Unit Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Dirty state detection with no changes | `isDirty` is false |
| Dirty state detection with changes | `isDirty` is true |
| Character count calculation | Correct count displayed |
| Warning threshold (90%) | Yellow styling applied |
| Error threshold (>100%) | Red styling applied |

### Component Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Modal opens when `isOpen` is true | Modal visible |
| Modal closes when `onCancel` called | Modal hidden |
| Focus moves to textarea on open | First textarea focused |
| Escape key triggers cancel | Confirmation shown if dirty |
| Save button disabled when clean | Button has `disabled` attribute |
| Save button enabled when dirty | Button clickable |
| Loading state during save | Spinner visible, controls disabled |
| Error state after failed save | Error message displayed |
| Confirmation dialog on dirty cancel | Dialog appears |

### Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Save calls onSave with content | Content passed correctly |
| Error handling from API | Error displayed in UI |
| Language flag display | Correct flag for each language |

---

## Visual Reference

### Desktop Layout (≥768px)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🇫🇷 Edit French Translation                               [X]   │
├─────────────────────────────────────────────────────────────────┤
│  Original (English)           │  Translation (Français)         │
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐   │
│  │ Title                   │  │  │ [Title textarea]        │   │
│  │ How to Use...           │  │  │                         │   │
│  └─────────────────────────┘  │  └─────────────────────────┘   │
│                               │  45 / 100 characters ━━━━━░░░░  │
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐   │
│  │ Description             │  │  │ [Description textarea]  │   │
│  │ Load dishes on the...   │  │  │                         │   │
│  │                         │  │  │                         │   │
│  └─────────────────────────┘  │  └─────────────────────────┘   │
│                               │  125 / 500 characters ━━━━░░░░  │
│                               │  ● Unsaved changes             │
├─────────────────────────────────────────────────────────────────┤
│                                      [Cancel]  [Save Changes]   │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌───────────────────────────────┐
│ 🇫🇷 Edit French...       [X]  │
├───────────────────────────────┤
│ Original (English)            │
│ ┌───────────────────────────┐ │
│ │ Title: How to Use...      │ │
│ │ Description: Load...      │ │
│ └───────────────────────────┘ │
│                               │
│ Translation (Français)        │
│ ┌───────────────────────────┐ │
│ │ [Title textarea]          │ │
│ └───────────────────────────┘ │
│ 45 / 100 ━━━━░░░              │
│ ┌───────────────────────────┐ │
│ │ [Description textarea]    │ │
│ │                           │ │
│ └───────────────────────────┘ │
│ 125 / 500 ━━━░░░              │
│ ● Unsaved changes             │
├───────────────────────────────┤
│     [Cancel] [Save Changes]   │
└───────────────────────────────┘
```

---

## File Summary

### Files to Create

| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/TranslationEditor/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Main component |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.types.ts` | Type definitions |

### Files to Modify

| File | Modification |
|------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add TranslationEditor exports (create if needed) |

---

## Implementation Order

1. **Task 1:** Create types file
2. **Task 2:** Create barrel exports
3. **Task 3:** Create component shell with Radix Dialog
4. **Task 4:** Add state management
5. **Task 5:** Implement header
6. **Task 6:** Implement side-by-side layout
7. **Task 7:** Implement editable textareas
8. **Task 8:** Implement character counter
9. **Task 9:** Implement dirty state indicator
10. **Task 10:** Implement footer with buttons
11. **Task 11:** Implement confirmation dialog
12. **Task 12:** Add keyboard/accessibility features
13. **Task 13:** Update barrel exports

---

## References

- Radix UI Dialog: https://www.radix-ui.com/primitives/docs/components/dialog
- Overview Document: `/docs/REQ-E05-009-create-translationeditor-component-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request: `/docs/gen_requests_epic5.md` (REQ-E05-010)
