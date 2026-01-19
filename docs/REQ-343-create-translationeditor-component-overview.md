# REQ-343: Create TranslationEditor Component - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.5
**Depends On:** TranslationManagement types (Task 2.1), Epic 1 Foundation, Epic 3 Dynamic Content Translation

---

## Table of Contents

1. [Summary](#summary)
2. [Context](#context)
3. [Requirements](#requirements)
4. [Technical Approach](#technical-approach)
5. [Component Architecture](#component-architecture)
6. [Implementation Tasks](#implementation-tasks)
7. [Authorized Files and Functions for Modification](#authorized-files-and-functions-for-modification)
8. [Dependencies](#dependencies)
9. [Acceptance Criteria](#acceptance-criteria)
10. [Testing Strategy](#testing-strategy)
11. [Risks and Mitigations](#risks-and-mitigations)

---

## Summary

Create a TranslationEditor component that allows property owners to manually edit translations through a modal dialog with side-by-side comparison of original source content and translation text. The component uses Radix Dialog for accessibility, tracks dirty state to prevent accidental data loss, and displays character count with warnings when translation length differs significantly from source.

---

## Context

### Problem Statement

Property owners currently cannot manually review or modify automated translations to ensure quality, correct errors, or adjust tone to match their brand voice. There is no way to see source content and translation side by side during editing, making it difficult to ensure translation accuracy.

### Business Value

Empowers property owners to maintain high translation quality that matches their brand standards, improving guest trust and booking confidence for international travelers. Reduces guest confusion from poor automated translations by enabling owner curation.

### User Impact

Property owners who are multilingual or work with professional translators need the ability to refine automated translations. Seeing source and translation together ensures translations maintain the intended meaning and tone. Character count feedback helps owners ensure translations are appropriately detailed without being verbose. Dirty state tracking prevents accidental loss of editing work when navigating away from the modal.

---

## Requirements

### Functional Requirements

1. **Modal Trigger**: Modal opens when edit action is triggered for a translation
2. **Side-by-Side View**: Display original source content on the left (read-only) and editable translation on the right
3. **Character Count**: Show current character length below textarea with warning if translation length differs significantly from source
4. **Save/Cancel Actions**: Save button commits changes and closes modal; Cancel dismisses without saving
5. **Dirty State Tracking**: Prompt for confirmation if user attempts to close with unsaved edits
6. **Status Update**: Saved translations are marked with manually reviewed status

### Non-Functional Requirements

1. **Accessibility**: Use Radix Dialog for proper focus management and keyboard navigation
2. **Responsive Design**: Usable on tablet and desktop viewports
3. **Performance**: Textarea supports standard editing operations including undo/redo
4. **Consistency**: Follow existing modal patterns from ItemPreviewModal and ConfirmDeleteDialog

---

## Technical Approach

### Technology Stack

| Technology | Version | Usage |
|------------|---------|-------|
| Next.js | 15.5.9 | App Router framework |
| React | 19.x | Component framework |
| TypeScript | 5.x | Type safety (strict mode) |
| Radix UI Dialog | 1.1.14 | Accessible modal dialog (already installed) |
| Tailwind CSS | 4.x | Styling |
| Lucide React | 0.525.0+ | Icons |

### Existing Patterns to Follow

| Pattern | Reference File | Aspect to Reuse |
|---------|---------------|-----------------|
| Radix Dialog Structure | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Portal, Overlay, Content structure |
| Dialog Focus Management | ItemPreviewModal.tsx:165-184 | Focus trap implementation |
| iOS Scroll Lock Fix | ItemPreviewModal.tsx:69-90 | Body scroll lock pattern |
| Confirmation Dialog | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Warning icon, action buttons |
| Form State Pattern | InlineEdit.tsx:106-122 | useState for formData, validation, isDirty |
| Character Count | ItemCapture patterns | `{value.length}` display |
| Button Styling | ConfirmDeleteDialog.tsx:239-275 | Primary/secondary button patterns |
| Accessibility | ItemPreviewModal.tsx:358-422 | ARIA labels, alertdialog role |

### Component Integration

```
TranslationPreviewPanel (parent)
    └── TranslationStatusItem (triggers edit)
            └── TranslationEditor (this component)
                    ├── Source Content Pane (read-only)
                    ├── Translation Textarea Pane
                    ├── Character Count Display
                    ├── Exit Confirmation Dialog (nested)
                    └── Action Buttons (Save/Cancel)
```

---

## Component Architecture

### Directory Structure

```
/src/components/TranslationManagement/
├── TranslationEditor/
│   ├── index.ts                    # Public exports
│   ├── TranslationEditor.tsx       # Main modal component
│   ├── TranslationEditor.types.ts  # Component-specific types
│   └── __tests__/
│       └── TranslationEditor.test.tsx
```

### Props Interface

```typescript
// TranslationEditor.types.ts
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

/**
 * Translation content fields that can be edited
 */
export interface TranslationContent {
  title?: string;
  description?: string;
  name?: string;
}

/**
 * Translation data passed to the editor
 */
export interface TranslationData {
  /** Target language for this translation */
  language: SupportedLanguage;
  /** Current translated content */
  content: TranslationContent;
  /** Current translation status */
  status: string;
}

/**
 * Props for the TranslationEditor component
 */
export interface TranslationEditorProps {
  /** Translation to edit */
  translation: TranslationData;
  /** Source content for comparison (read-only display) */
  sourceContent: TranslationContent;
  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;
  /** Whether editor modal is open */
  isOpen: boolean;
  /** Save handler - receives updated translation content */
  onSave: (updated: TranslationContent) => Promise<void>;
  /** Cancel handler - closes modal without saving */
  onCancel: () => void;
  /** Optional: Entity type being edited (for context display) */
  entityType?: 'article' | 'item' | 'link';
  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * Form state for tracking edits
 */
export interface TranslationEditorFormState {
  title: string;
  description: string;
  name: string;
}

/**
 * Validation errors structure
 */
export interface TranslationEditorErrors {
  title?: string;
  description?: string;
  name?: string;
  general?: string;
}
```

### Component State

```typescript
// Internal state structure
interface EditorState {
  formData: TranslationEditorFormState;
  originalData: TranslationEditorFormState;
  errors: TranslationEditorErrors;
  isSubmitting: boolean;
  isDirty: boolean;
  showExitConfirm: boolean;
}
```

### Character Count Warning Logic

```typescript
/**
 * Calculate character count difference percentage
 * Warning shown if difference > 30%
 */
const getCharacterWarning = (
  sourceLength: number,
  translationLength: number
): { showWarning: boolean; message: string; severity: 'warning' | 'error' } => {
  if (sourceLength === 0) return { showWarning: false, message: '', severity: 'warning' };

  const diff = Math.abs(translationLength - sourceLength);
  const percentage = (diff / sourceLength) * 100;

  if (percentage > 50) {
    return {
      showWarning: true,
      severity: 'error',
      message: translationLength > sourceLength
        ? 'Translation is significantly longer than source'
        : 'Translation is significantly shorter than source'
    };
  } else if (percentage > 30) {
    return {
      showWarning: true,
      severity: 'warning',
      message: translationLength > sourceLength
        ? 'Translation is longer than source'
        : 'Translation is shorter than source'
    };
  }

  return { showWarning: false, message: '', severity: 'warning' };
};
```

---

## Implementation Tasks

### Task 2.5.1: Create TranslationEditor Types File

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.types.ts`

**Description:** Define TypeScript interfaces for the TranslationEditor component props, form state, and validation errors.

**Subtasks:**
1. Create TranslationContent interface for editable fields
2. Create TranslationData interface for translation input
3. Create TranslationEditorProps interface with all required props
4. Create TranslationEditorFormState interface for internal state
5. Create TranslationEditorErrors interface for validation
6. Add JSDoc comments for all exported types

**Estimated Effort:** 0.5 story points

---

### Task 2.5.2: Create TranslationEditor Component Shell

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Create the base component structure with Radix Dialog, state management, and layout scaffolding.

**Subtasks:**
1. Import Radix Dialog and required dependencies
2. Set up component with props destructuring
3. Initialize form state with useState hooks
4. Create useEffect for populating form data when modal opens
5. Create useEffect for resetting state when modal closes
6. Implement isDirty calculation (compare current vs original values)
7. Set up Radix Dialog structure following ItemPreviewModal pattern

**Code Pattern:**
```typescript
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, Languages, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  TranslationEditorProps,
  TranslationEditorFormState,
  TranslationEditorErrors
} from './TranslationEditor.types';

export function TranslationEditor({
  translation,
  sourceContent,
  sourceLanguage,
  isOpen,
  onSave,
  onCancel,
  entityType = 'article',
  className,
}: TranslationEditorProps) {
  // Refs for focus management
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // State management
  const [formData, setFormData] = useState<TranslationEditorFormState>({
    title: '',
    description: '',
    name: '',
  });
  const [originalData, setOriginalData] = useState<TranslationEditorFormState>({
    title: '',
    description: '',
    name: '',
  });
  const [errors, setErrors] = useState<TranslationEditorErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Calculate dirty state
  const isDirty = useMemo(() => {
    return (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.name !== originalData.name
    );
  }, [formData, originalData]);

  // ... rest of implementation
}
```

**Estimated Effort:** 1 story point

---

### Task 2.5.3: Implement Side-by-Side Layout

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Create the side-by-side view with source content on left (read-only) and translation textarea on right.

**Subtasks:**
1. Create responsive grid layout (single column mobile, two columns desktop/tablet)
2. Implement source content pane with read-only display
3. Implement translation pane with editable textarea
4. Add field labels for title, description, and name (conditionally rendered based on entityType)
5. Style source pane with distinct read-only appearance (gray background)
6. Add language labels with flag emoji to each pane header
7. Use SUPPORTED_LANGUAGES from translation-service.types for language display

**Layout Structure:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
  {/* Source Content Pane */}
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="text-lg">🇬🇧</span>
      <span className="text-sm font-medium text-gray-900">
        Original ({sourceLanguage.toUpperCase()})
      </span>
    </div>
    {/* Read-only fields with bg-gray-50 */}
    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
      {sourceContent.title && (
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">Title</span>
          <p className="text-gray-900">{sourceContent.title}</p>
        </div>
      )}
      {/* ... other fields */}
    </div>
  </div>

  {/* Translation Pane */}
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="text-lg">{languageFlag}</span>
      <span className="text-sm font-medium text-gray-900">
        Translation ({translation.language.toUpperCase()})
      </span>
    </div>
    {/* Editable fields */}
  </div>
</div>
```

**Estimated Effort:** 1 story point

---

### Task 2.5.4: Implement Character Count with Warnings

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add character count display below each textarea with warning indicators when translation length differs significantly from source.

**Subtasks:**
1. Create getCharacterWarning utility function (can be inline or extracted)
2. Add character count display below each textarea
3. Implement warning styling (amber-500 for >30% difference, red-500 for >50%)
4. Add AlertTriangle icon when warning threshold exceeded
5. Ensure counts update in real-time as user types

**UI Pattern:**
```tsx
<div className="flex justify-between items-center text-xs mt-1">
  <div className={cn(
    'flex items-center gap-1',
    charWarning.severity === 'error' ? 'text-red-500' :
    charWarning.showWarning ? 'text-amber-500' : 'text-gray-500'
  )}>
    {charWarning.showWarning && <AlertTriangle className="w-3 h-3" />}
    {charWarning.message}
  </div>
  <span className="text-gray-500">
    {formData.title.length} characters
    {(sourceContent.title?.length ?? 0) > 0 && ` (source: ${sourceContent.title?.length})`}
  </span>
</div>
```

**Estimated Effort:** 0.5 story points

---

### Task 2.5.5: Implement Save/Cancel Actions

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Create footer with Save and Cancel buttons, implement save handler that calls onSave prop and closes modal.

**Subtasks:**
1. Create footer section with button layout (Cancel left, Save right; flex-col-reverse on mobile)
2. Implement handleCancel function with dirty state check
3. Implement handleSave function with try/catch and error handling
4. Add loading state (Loader2 spinner) to Save button during submission
5. Disable both buttons during submission
6. Style buttons following ConfirmDeleteDialog pattern

**Button Styling:**
```tsx
{/* Cancel Button */}
<button
  ref={cancelButtonRef}
  type="button"
  onClick={handleCancel}
  disabled={isSubmitting}
  className={cn(
    'px-4 py-2.5 text-sm font-medium rounded-lg',
    'text-gray-700 bg-gray-100',
    'hover:bg-gray-200 active:bg-gray-300',
    'transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'min-h-[44px]'
  )}
>
  Cancel
</button>

{/* Save Button */}
<button
  type="button"
  onClick={handleSave}
  disabled={isSubmitting || !isDirty}
  className={cn(
    'px-4 py-2.5 text-sm font-medium rounded-lg',
    'text-white bg-blue-600',
    'hover:bg-blue-700 active:bg-blue-800',
    'transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'inline-flex items-center justify-center gap-2',
    'min-h-[44px]'
  )}
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      <span>Saving...</span>
    </>
  ) : (
    <>
      <Save className="w-4 h-4" aria-hidden="true" />
      <span>Save Translation</span>
    </>
  )}
</button>
```

**Estimated Effort:** 1 story point

---

### Task 2.5.6: Implement Dirty State Tracking and Exit Confirmation

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Track unsaved changes and prompt user for confirmation before closing if edits exist.

**Subtasks:**
1. Implement isDirty calculation comparing current vs original values (already in 2.5.2)
2. Create exit confirmation dialog following ConfirmDeleteDialog pattern
3. Handle close button click with dirty check
4. Handle overlay click with dirty check (use onPointerDownOutside)
5. Handle Escape key with dirty check (intercept onEscapeKeyDown)
6. Provide "Discard Changes" and "Keep Editing" options
7. Focus management: focus "Keep Editing" button when confirmation opens

**Exit Confirmation UI (nested within Dialog.Content):**
```tsx
{showExitConfirm && (
  <div
    className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="exit-confirm-title"
    aria-describedby="exit-confirm-description"
  >
    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
        </div>
        <div>
          <h3 id="exit-confirm-title" className="font-semibold text-lg text-gray-900">
            Discard changes?
          </h3>
          <p id="exit-confirm-description" className="text-sm text-gray-600 mt-2">
            You have unsaved changes. Are you sure you want to discard them?
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowExitConfirm(false)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 min-h-[44px]"
        >
          Keep Editing
        </button>
        <button
          onClick={() => {
            setShowExitConfirm(false);
            onCancel();
          }}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px]"
        >
          Discard
        </button>
      </div>
    </div>
  </div>
)}
```

**Estimated Effort:** 1 story point

---

### Task 2.5.7: Add Accessibility Features

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Ensure the modal is fully accessible with proper ARIA attributes, focus management, and keyboard navigation.

**Subtasks:**
1. Add aria-labelledby pointing to Dialog.Title
2. Add aria-describedby pointing to Dialog.Description (sr-only)
3. Add visible Dialog.Title with language name
4. Add Dialog.Description with sr-only context about editing translation
5. Add aria-live region for status announcements (save success/error)
6. Ensure focus moves to first editable field on open
7. Implement Ctrl+Enter / Cmd+Enter keyboard shortcut to save
8. Add role="alert" to error messages
9. Ensure 44x44px minimum touch targets for buttons
10. Test with VoiceOver (macOS) for screen reader compliance

**Keyboard Handler:**
```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  // Ctrl/Cmd + Enter to save
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isDirty && !isSubmitting) {
    e.preventDefault();
    handleSave();
  }
}, [isDirty, isSubmitting, handleSave]);
```

**Estimated Effort:** 0.5 story points

---

### Task 2.5.8: Create Index Export

**File:** `/src/components/TranslationManagement/TranslationEditor/index.ts`

**Description:** Create the barrel export file for the TranslationEditor module.

**Content:**
```typescript
/**
 * TranslationEditor Component Exports
 * Part of REQ-343: Create TranslationEditor Component
 *
 * @module TranslationManagement/TranslationEditor
 * @created 2026-01-19
 */

export { TranslationEditor } from './TranslationEditor';
export type {
  TranslationEditorProps,
  TranslationContent,
  TranslationData,
  TranslationEditorFormState,
  TranslationEditorErrors,
} from './TranslationEditor.types';
```

**Estimated Effort:** 0.25 story points

---

### Task 2.5.9: Write Unit Tests

**File:** `/src/components/TranslationManagement/TranslationEditor/__tests__/TranslationEditor.test.tsx`

**Description:** Create comprehensive unit tests for the TranslationEditor component.

**Test Cases:**
1. Renders modal when isOpen is true
2. Does not render modal when isOpen is false
3. Displays source content in read-only format
4. Displays translation content in editable textareas
5. Updates formData when user types in textarea
6. Shows character count for each field
7. Shows warning when translation length differs >30% from source
8. Shows error-level warning when translation length differs >50% from source
9. Calls onSave with updated content when Save clicked
10. Disables Save button when no changes made (isDirty false)
11. Calls onCancel when Cancel clicked (without dirty state)
12. Shows confirmation dialog when Cancel clicked with dirty state
13. Blocks close during submission (isSubmitting true)
14. Displays loading state during save
15. Handles save errors gracefully (shows error message)
16. Is keyboard accessible (focus trap, Escape triggers dirty check)
17. Ctrl+Enter triggers save when dirty

**Estimated Effort:** 2 story points

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationEditor/index.ts` | Module exports |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Main component |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.types.ts` | Type definitions |
| `/src/components/TranslationManagement/TranslationEditor/__tests__/TranslationEditor.test.tsx` | Unit tests |

### Files to Modify

| File Path | Modification |
|-----------|-------------|
| `/src/components/TranslationManagement/index.ts` | Add TranslationEditor export (create if not exists) |

### Functions to Create

| Function | File | Purpose |
|----------|------|---------|
| `TranslationEditor` | TranslationEditor.tsx | Main component function |
| `getCharacterWarning` | TranslationEditor.tsx | Calculate character count warning |
| `handleFieldChange` | TranslationEditor.tsx | Update form field values |
| `handleSave` | TranslationEditor.tsx | Save translation and close |
| `handleCancel` | TranslationEditor.tsx | Cancel with dirty state check |
| `handleAttemptClose` | TranslationEditor.tsx | Handle close attempts with confirmation |

---

## Dependencies

### Required Imports

```typescript
// React
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Radix UI (already installed: @radix-ui/react-dialog v1.1.14)
import * as Dialog from '@radix-ui/react-dialog';

// Icons (already installed: lucide-react)
import { X, AlertTriangle, Languages, Save, Loader2 } from 'lucide-react';

// Utilities
import { cn } from '@/lib/utils';

// Types from translation-service (Epic 1)
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import { SUPPORTED_LANGUAGES, getLanguageInfo } from '@/lib/translation-service/translation-service.types';
```

### Dependencies from Other Tasks

| Dependency | Source | Status |
|------------|--------|--------|
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts` | Available (Epic 1) |
| `SUPPORTED_LANGUAGES` constant | `/src/lib/translation-service/translation-service.types.ts` | Available (Epic 1) |
| `getLanguageInfo` function | `/src/lib/translation-service/translation-service.types.ts` | Available (Epic 1) |
| TranslationManagement parent directory | Task 2.1 | Required |
| PUT /api/translations/{entityType}/{entityId}/{language} | Task 1.2 | Required for save |

---

## Acceptance Criteria

### From Request Requirements

- [ ] Modal opens when edit action is triggered for a translation
- [ ] Modal uses Radix Dialog component for accessibility and keyboard navigation
- [ ] Left pane displays original source content in read-only format
- [ ] Right pane displays editable textarea populated with current translation text
- [ ] Character count displays below textarea showing current character length
- [ ] Character count includes warning indicator if translation length differs significantly from source
- [ ] Save button commits translation changes and closes modal
- [ ] Cancel button dismisses modal without saving changes
- [ ] Modal tracks dirty state and prompts for confirmation if user attempts to close with unsaved edits
- [ ] Saved translations are marked with manually reviewed status
- [ ] Modal is responsive and usable on tablet and desktop viewports
- [ ] Modal is keyboard accessible with proper focus management
- [ ] Textarea supports standard editing operations including undo/redo

### From Implementation Plan (Plan-111)

- [ ] File created at `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- [ ] Modal dialog uses Radix Dialog
- [ ] Side-by-side view: Original | Translation
- [ ] Textarea for editing
- [ ] Character count (with warning if applicable)
- [ ] Save/Cancel buttons
- [ ] Dirty state tracking

---

## Testing Strategy

### Unit Tests

1. Component rendering tests (open/close states)
2. Form state management tests
3. Character count calculation tests
4. Dirty state detection tests
5. Save/Cancel handler tests
6. Error handling tests

### Integration Tests

1. Integration with TranslationPreviewPanel (when implemented)
2. API call verification (mock)
3. Status update after save

### Accessibility Tests

1. Focus management on open/close
2. Keyboard navigation (Tab, Escape, Ctrl+Enter)
3. Screen reader announcements
4. ARIA attribute validation
5. Touch target size verification (44x44px minimum)

### Manual Testing Checklist

- [ ] Open modal via TranslationStatusItem edit button
- [ ] Verify source content displays correctly (read-only)
- [ ] Verify translation content is editable
- [ ] Type in textarea and verify character count updates
- [ ] Make translation significantly longer/shorter and verify warning appears
- [ ] Click Save and verify modal closes, data persists
- [ ] Click Cancel without changes and verify modal closes
- [ ] Make changes, click Cancel, verify confirmation dialog appears
- [ ] Test on tablet viewport (768px width)
- [ ] Test keyboard navigation (Tab through fields, Escape to close)
- [ ] Test Ctrl+Enter to save
- [ ] Test with VoiceOver screen reader

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationManagement parent directory not yet created | Medium | High | Create directory structure first, or stub locally |
| API endpoint not ready | Medium | High | Mock API response for development, add loading/error states |
| Content fields vary by entity type | Medium | Medium | Conditionally render fields based on entityType prop |
| Long text causes layout issues | Low | Medium | Use overflow-auto, max-height constraints on textareas |
| Character warning threshold unclear | Low | Low | Start with 30%/50% thresholds, adjust based on feedback |
| iOS scroll lock issues | Medium | Low | Follow ItemPreviewModal.tsx:69-90 pattern for scroll lock |

---

## Visual Reference

From Plan-111 UI Specifications:

```
┌───────────────────────────────────────────────────────────────────────┐
│ Edit Translation - French (FR)                                   [X] │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐  ┌─────────────────────────┐            │
│  │ 🇬🇧 Original (EN)        │  │ 🇫🇷 Translation (FR)      │            │
│  │                         │  │                          │            │
│  │ TITLE                   │  │ TITLE                    │            │
│  │ How to Use the          │  │ ┌──────────────────────┐ │            │
│  │ Dishwasher              │  │ │ Comment utiliser le  │ │            │
│  │                         │  │ │ lave-vaisselle       │ │            │
│  │ DESCRIPTION             │  │ └──────────────────────┘ │            │
│  │ Load dishes on the      │  │ 24 chars (source: 21)    │            │
│  │ lower and upper racks.  │  │                          │            │
│  │ Add detergent to the    │  │ DESCRIPTION              │            │
│  │ dispenser and select    │  │ ┌──────────────────────┐ │            │
│  │ your wash cycle.        │  │ │ Chargez la vaisselle │ │            │
│  │                         │  │ │ sur les paniers...   │ │            │
│  │                         │  │ └──────────────────────┘ │            │
│  │                         │  │ 156 chars (source: 148)  │            │
│  │                         │  │ ⚠ Slightly longer        │            │
│  └─────────────────────────┘  └──────────────────────────┘            │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                      [Cancel]  [💾 Save Translation]  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md`
- **Pattern Reference - Dialog:** `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- **Pattern Reference - Confirm:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- **Pattern Reference - Inline Edit:** `/src/components/ItemManager/components/shared/InlineEdit.tsx`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Radix Dialog Docs:** https://www.radix-ui.com/primitives/docs/components/dialog
- **Epic 5 PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`

---

*Document generated for FAQBNB REQ-343 - TranslationEditor Component*
*Generated: 2026-01-19*
