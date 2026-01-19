# REQ-343: Create TranslationEditor Component - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.5
**Overview Document:** REQ-343-create-translationeditor-component-overview.md

---

## Table of Contents

1. [Summary](#summary)
2. [Prerequisites](#prerequisites)
3. [Implementation Tasks](#implementation-tasks)
4. [File Structure](#file-structure)
5. [Verification Checklist](#verification-checklist)
6. [Testing Requirements](#testing-requirements)

---

## Summary

Create a TranslationEditor component that allows property owners to manually edit translations through a modal dialog with side-by-side comparison of original source content and translation text. The component uses Radix Dialog for accessibility, tracks dirty state to prevent accidental data loss, and displays character count with warnings when translation length differs significantly from source.

**Total Estimated Effort:** 7.75 story points (9 tasks)

---

## Prerequisites

Before starting implementation, verify the following dependencies are available:

| Dependency | Location | Verification Command |
|------------|----------|---------------------|
| Radix Dialog | `@radix-ui/react-dialog` | `npm list @radix-ui/react-dialog` |
| Lucide React icons | `lucide-react` | `npm list lucide-react` |
| Tailwind CSS utilities | `@/lib/utils` | Check file exists |
| Translation service types | `/src/lib/translation-service/translation-service.types.ts` | Check file exists |
| TranslationManagement directory | `/src/components/TranslationManagement/` | Create if not exists |

---

## Implementation Tasks

### Task 2.5.1: Create TranslationEditor Types File

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.types.ts`
**Effort:** 0.5 story points
**Dependencies:** Translation service types from Epic 1

#### Description

Define TypeScript interfaces for the TranslationEditor component props, form state, and validation errors. All types should be exported for use by parent components.

#### Implementation Steps

1. Create the directory structure:
   ```bash
   mkdir -p src/components/TranslationManagement/TranslationEditor/__tests__
   ```

2. Create the types file with the following interfaces:

```typescript
/**
 * TranslationEditor Component Types
 * Part of REQ-343: Create TranslationEditor Component
 *
 * @module TranslationManagement/TranslationEditor
 * @created 2026-01-19
 */

import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

/**
 * Translation content fields that can be edited.
 * Fields are optional as different entity types have different content.
 */
export interface TranslationContent {
  /** Title field (articles, items) */
  title?: string;
  /** Description field (articles, items) */
  description?: string;
  /** Name field (links, tags) */
  name?: string;
}

/**
 * Translation data passed to the editor.
 * Contains the current state of a translation.
 */
export interface TranslationData {
  /** Target language for this translation */
  language: SupportedLanguage;
  /** Current translated content */
  content: TranslationContent;
  /** Current translation status */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
}

/**
 * Props for the TranslationEditor component.
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
 * Form state for tracking edits within the editor.
 * All fields are required strings (empty string if not applicable).
 */
export interface TranslationEditorFormState {
  /** Edited title value */
  title: string;
  /** Edited description value */
  description: string;
  /** Edited name value */
  name: string;
}

/**
 * Validation errors structure.
 * Each field can have an optional error message.
 */
export interface TranslationEditorErrors {
  /** Title field error */
  title?: string;
  /** Description field error */
  description?: string;
  /** Name field error */
  name?: string;
  /** General form error */
  general?: string;
}

/**
 * Character warning result from length comparison.
 */
export interface CharacterWarning {
  /** Whether to show the warning */
  showWarning: boolean;
  /** Warning message to display */
  message: string;
  /** Severity level for styling */
  severity: 'warning' | 'error';
}
```

#### Acceptance Criteria

- [ ] File created at correct path
- [ ] All interfaces have JSDoc comments
- [ ] Imports SupportedLanguage from translation-service types
- [ ] TranslationContent interface defined with optional fields
- [ ] TranslationData interface defined with language, content, status
- [ ] TranslationEditorProps interface defined with all required props
- [ ] TranslationEditorFormState interface defined for internal state
- [ ] TranslationEditorErrors interface defined for validation
- [ ] CharacterWarning interface defined for character count warnings
- [ ] File compiles without TypeScript errors

---

### Task 2.5.2: Create TranslationEditor Component Shell

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Effort:** 1 story point
**Dependencies:** Task 2.5.1

#### Description

Create the base component structure with Radix Dialog, state management hooks, and layout scaffolding. This task establishes the component foundation without full UI implementation.

#### Implementation Steps

1. Create the component file with imports and base structure:

```typescript
'use client';

/**
 * TranslationEditor Component
 * Part of REQ-343: Create TranslationEditor Component
 *
 * Modal dialog for editing translation content with side-by-side comparison.
 *
 * @module TranslationManagement/TranslationEditor
 * @created 2026-01-19
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, Languages, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  TranslationEditorProps,
  TranslationEditorFormState,
  TranslationEditorErrors,
  CharacterWarning,
} from './TranslationEditor.types';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate character count difference percentage.
 * Warning shown if difference > 30%, error if > 50%.
 */
function getCharacterWarning(
  sourceLength: number,
  translationLength: number
): CharacterWarning {
  if (sourceLength === 0) {
    return { showWarning: false, message: '', severity: 'warning' };
  }

  const diff = Math.abs(translationLength - sourceLength);
  const percentage = (diff / sourceLength) * 100;

  if (percentage > 50) {
    return {
      showWarning: true,
      severity: 'error',
      message: translationLength > sourceLength
        ? 'Translation is significantly longer than source'
        : 'Translation is significantly shorter than source',
    };
  } else if (percentage > 30) {
    return {
      showWarning: true,
      severity: 'warning',
      message: translationLength > sourceLength
        ? 'Translation is longer than source'
        : 'Translation is shorter than source',
    };
  }

  return { showWarning: false, message: '', severity: 'warning' };
}

/**
 * Get language display name with flag emoji.
 */
function getLanguageDisplay(language: string): { flag: string; name: string } {
  const languages: Record<string, { flag: string; name: string }> = {
    en: { flag: '🇬🇧', name: 'English' },
    fr: { flag: '🇫🇷', name: 'French' },
    de: { flag: '🇩🇪', name: 'German' },
    es: { flag: '🇪🇸', name: 'Spanish' },
    it: { flag: '🇮🇹', name: 'Italian' },
    nl: { flag: '🇳🇱', name: 'Dutch' },
  };
  return languages[language] || { flag: '🌐', name: language.toUpperCase() };
}

// =============================================================================
// Main Component
// =============================================================================

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
  // ---------------------------------------------------------------------------
  // Refs for focus management
  // ---------------------------------------------------------------------------
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const keepEditingButtonRef = useRef<HTMLButtonElement>(null);

  // ---------------------------------------------------------------------------
  // State management
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const isDirty = useMemo(() => {
    return (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.name !== originalData.name
    );
  }, [formData, originalData]);

  const targetLanguageDisplay = getLanguageDisplay(translation.language);
  const sourceLanguageDisplay = getLanguageDisplay(sourceLanguage);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Populate form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialData: TranslationEditorFormState = {
        title: translation.content.title || '',
        description: translation.content.description || '',
        name: translation.content.name || '',
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setErrors({});
      setShowExitConfirm(false);
    }
  }, [isOpen, translation.content]);

  // Focus first editable field when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      // Small delay to ensure dialog is rendered
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus "Keep Editing" button when exit confirm opens
  useEffect(() => {
    if (showExitConfirm && keepEditingButtonRef.current) {
      keepEditingButtonRef.current.focus();
    }
  }, [showExitConfirm]);

  // ... (handlers and render will be implemented in subsequent tasks)

  return null; // Placeholder - full render in Task 2.5.3
}
```

#### Acceptance Criteria

- [ ] File created at correct path
- [ ] Component marked as 'use client'
- [ ] All necessary imports included (React hooks, Radix Dialog, icons, utils, types)
- [ ] getCharacterWarning helper function implemented
- [ ] getLanguageDisplay helper function implemented
- [ ] Component accepts all props from TranslationEditorProps
- [ ] State hooks initialized: formData, originalData, errors, isSubmitting, showExitConfirm
- [ ] isDirty computed value implemented with useMemo
- [ ] Effect to populate form data on modal open
- [ ] Effect for focus management on open
- [ ] Effect for focus management on exit confirm
- [ ] File compiles without TypeScript errors

---

### Task 2.5.3: Implement Side-by-Side Layout

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Effort:** 1 story point
**Dependencies:** Task 2.5.2

#### Description

Create the side-by-side view with source content on left (read-only) and translation textarea on right. Implement the Radix Dialog structure and responsive layout.

#### Implementation Steps

Replace the `return null` placeholder with the full Dialog structure:

```typescript
  // ---------------------------------------------------------------------------
  // Handlers (placeholder - implemented in subsequent tasks)
  // ---------------------------------------------------------------------------
  const handleFieldChange = useCallback(
    (field: keyof TranslationEditorFormState, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // ---------------------------------------------------------------------------
  // Determine which fields to show based on source content
  // ---------------------------------------------------------------------------
  const showTitle = sourceContent.title !== undefined;
  const showDescription = sourceContent.description !== undefined;
  const showName = sourceContent.name !== undefined;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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

        {/* Content container */}
        <Dialog.Content
          className={cn(
            // Base styles
            'fixed z-50 bg-white shadow-xl',
            // Positioning - centered
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            // Size constraints
            'w-[95vw] max-w-4xl max-h-[90vh]',
            // Layout
            'flex flex-col',
            // Appearance
            'rounded-xl border border-gray-200',
            // Animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
            'data-[state=open]:slide-in-from-left-1/2',
            'data-[state=open]:slide-in-from-top-[48%]',
            className
          )}
          aria-labelledby="translation-editor-title"
          aria-describedby="translation-editor-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-gray-500" aria-hidden="true" />
              <Dialog.Title
                id="translation-editor-title"
                className="text-lg font-semibold text-gray-900"
              >
                Edit Translation - {targetLanguageDisplay.name} ({translation.language.toUpperCase()})
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className={cn(
                  'p-2 rounded-lg text-gray-500',
                  'hover:bg-gray-100 hover:text-gray-700',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  'transition-colors duration-150'
                )}
                aria-label="Close editor"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Screen reader description */}
          <Dialog.Description id="translation-editor-description" className="sr-only">
            Edit the {targetLanguageDisplay.name} translation. Original content is shown on the left
            for reference. Make your changes in the text fields on the right.
          </Dialog.Description>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Source Content Pane (Left) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg" aria-hidden="true">
                    {sourceLanguageDisplay.flag}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    Original ({sourceLanguage.toUpperCase()})
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {showTitle && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Title
                      </span>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                        {sourceContent.title || '(empty)'}
                      </p>
                    </div>
                  )}

                  {showDescription && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Description
                      </span>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                        {sourceContent.description || '(empty)'}
                      </p>
                    </div>
                  )}

                  {showName && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Name
                      </span>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                        {sourceContent.name || '(empty)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Translation Pane (Right) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg" aria-hidden="true">
                    {targetLanguageDisplay.flag}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    Translation ({translation.language.toUpperCase()})
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Title field - implemented in Task 2.5.4 */}
                  {/* Description field - implemented in Task 2.5.4 */}
                  {/* Name field - implemented in Task 2.5.4 */}

                  {/* Placeholder for fields */}
                  {showTitle && (
                    <div>
                      <label
                        htmlFor="translation-title"
                        className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1"
                      >
                        Title
                      </label>
                      <textarea
                        ref={firstInputRef}
                        id="translation-title"
                        value={formData.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg border',
                          'text-gray-900 placeholder-gray-400',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          'resize-none',
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        )}
                        rows={2}
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'title-error' : undefined}
                      />
                      {/* Character count implemented in Task 2.5.4 */}
                    </div>
                  )}

                  {showDescription && (
                    <div>
                      <label
                        htmlFor="translation-description"
                        className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        ref={!showTitle ? firstInputRef : undefined}
                        id="translation-description"
                        value={formData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg border',
                          'text-gray-900 placeholder-gray-400',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          'resize-none',
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        )}
                        rows={5}
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? 'description-error' : undefined}
                      />
                      {/* Character count implemented in Task 2.5.4 */}
                    </div>
                  )}

                  {showName && (
                    <div>
                      <label
                        htmlFor="translation-name"
                        className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1"
                      >
                        Name
                      </label>
                      <textarea
                        ref={!showTitle && !showDescription ? firstInputRef : undefined}
                        id="translation-name"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg border',
                          'text-gray-900 placeholder-gray-400',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          'resize-none',
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        )}
                        rows={2}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {/* Character count implemented in Task 2.5.4 */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Implemented in Task 2.5.5 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {/* Buttons placeholder */}
          </div>

          {/* Exit Confirmation - Implemented in Task 2.5.6 */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
```

#### Acceptance Criteria

- [ ] Radix Dialog structure implemented (Root, Portal, Overlay, Content)
- [ ] Header with language name, flag, and close button
- [ ] Overlay with proper z-index and backdrop
- [ ] Responsive grid layout (single column mobile, two columns desktop)
- [ ] Source content pane with read-only display and gray background
- [ ] Translation pane with editable textareas
- [ ] Conditional field rendering based on sourceContent
- [ ] Language flags displayed in pane headers
- [ ] Scroll lock applied when modal opens (via Radix)
- [ ] Content area scrollable for long content
- [ ] Focus ref assigned to first editable field
- [ ] ARIA attributes: labelledby, describedby

---

### Task 2.5.4: Implement Character Count with Warnings

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Effort:** 0.5 story points
**Dependencies:** Task 2.5.3

#### Description

Add character count display below each textarea with warning indicators when translation length differs significantly from source. Warnings appear at 30% difference (amber), errors at 50% (red).

#### Implementation Steps

1. Add character count display below each textarea field. Update each field block to include:

```typescript
{/* Example for Title field - add after textarea */}
{showTitle && (
  <div>
    <label
      htmlFor="translation-title"
      className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1"
    >
      Title
    </label>
    <textarea
      ref={firstInputRef}
      id="translation-title"
      value={formData.title}
      onChange={(e) => handleFieldChange('title', e.target.value)}
      className={cn(
        'w-full px-3 py-2 rounded-lg border',
        'text-gray-900 placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'resize-none',
        errors.title ? 'border-red-300' : 'border-gray-300'
      )}
      rows={2}
      aria-invalid={!!errors.title}
      aria-describedby={
        errors.title ? 'title-error title-char-count' : 'title-char-count'
      }
    />
    {errors.title && (
      <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
        {errors.title}
      </p>
    )}
    <CharacterCountDisplay
      id="title-char-count"
      currentLength={formData.title.length}
      sourceLength={sourceContent.title?.length || 0}
    />
  </div>
)}
```

2. Create a CharacterCountDisplay sub-component (can be inline or extracted):

```typescript
// Add inside TranslationEditor.tsx or extract to separate file

interface CharacterCountDisplayProps {
  id: string;
  currentLength: number;
  sourceLength: number;
}

function CharacterCountDisplay({
  id,
  currentLength,
  sourceLength,
}: CharacterCountDisplayProps) {
  const warning = getCharacterWarning(sourceLength, currentLength);

  return (
    <div
      id={id}
      className="flex justify-between items-center text-xs mt-1"
      aria-live="polite"
    >
      <div
        className={cn(
          'flex items-center gap-1',
          warning.severity === 'error'
            ? 'text-red-500'
            : warning.showWarning
            ? 'text-amber-500'
            : 'text-gray-400'
        )}
      >
        {warning.showWarning && (
          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
        )}
        <span>{warning.message}</span>
      </div>
      <span className="text-gray-500">
        {currentLength} characters
        {sourceLength > 0 && ` (source: ${sourceLength})`}
      </span>
    </div>
  );
}
```

3. Apply the same pattern to description and name fields.

#### Acceptance Criteria

- [ ] Character count displays below each textarea
- [ ] Count shows "X characters" format
- [ ] Source length displayed in parentheses when available
- [ ] Warning (amber) shown when difference > 30%
- [ ] Error (red) shown when difference > 50%
- [ ] AlertTriangle icon appears with warning/error
- [ ] Warning message indicates if translation is longer or shorter
- [ ] Counts update in real-time as user types
- [ ] aria-live="polite" for screen reader announcements
- [ ] No warning shown when source length is 0

---

### Task 2.5.5: Implement Save/Cancel Actions

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Effort:** 1 story point
**Dependencies:** Task 2.5.4

#### Description

Create footer with Save and Cancel buttons, implement save handler that calls onSave prop and closes modal. Add loading state and disable buttons during submission.

#### Implementation Steps

1. Add handleSave and handleCancel callback functions:

```typescript
// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const handleSave = useCallback(async () => {
  if (!isDirty || isSubmitting) return;

  setIsSubmitting(true);
  setErrors({});

  try {
    // Build updated content object (only include non-empty values)
    const updated: TranslationContent = {};
    if (showTitle && formData.title) {
      updated.title = formData.title;
    }
    if (showDescription && formData.description) {
      updated.description = formData.description;
    }
    if (showName && formData.name) {
      updated.name = formData.name;
    }

    await onSave(updated);
    // onSave should close the modal via onCancel or separate handler
  } catch (error) {
    console.error('Failed to save translation:', error);
    setErrors({
      general:
        error instanceof Error
          ? error.message
          : 'Failed to save translation. Please try again.',
    });
  } finally {
    setIsSubmitting(false);
  }
}, [isDirty, isSubmitting, formData, showTitle, showDescription, showName, onSave]);

const handleCancel = useCallback(() => {
  if (isDirty) {
    setShowExitConfirm(true);
  } else {
    onCancel();
  }
}, [isDirty, onCancel]);
```

2. Update the footer section in the render:

```typescript
{/* Footer */}
<div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
  {/* General error message */}
  {errors.general && (
    <p className="flex-1 text-sm text-red-600 text-left" role="alert">
      {errors.general}
    </p>
  )}

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
      'min-h-[44px] min-w-[100px]'
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
      'min-h-[44px] min-w-[140px]'
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
</div>
```

#### Acceptance Criteria

- [ ] Footer section with proper spacing and styling
- [ ] Cancel button triggers handleCancel (with dirty check)
- [ ] Save button triggers handleSave (calls onSave prop)
- [ ] Save button disabled when no changes (isDirty false)
- [ ] Save button disabled during submission
- [ ] Cancel button disabled during submission
- [ ] Loading spinner shown on Save button during submission
- [ ] Button text changes to "Saving..." during submission
- [ ] Error message displayed if save fails
- [ ] Buttons use 44px minimum height for touch targets
- [ ] Buttons have focus-visible ring styles
- [ ] Responsive layout: stacked on mobile, inline on desktop

---

### Task 2.5.6: Implement Dirty State Tracking and Exit Confirmation

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Effort:** 1 story point
**Dependencies:** Task 2.5.5

#### Description

Track unsaved changes and prompt user for confirmation before closing if edits exist. Handle close button click, overlay click, and Escape key with dirty state check.

#### Implementation Steps

1. Add exit confirmation dialog inside Dialog.Content (after footer, before closing tag):

```typescript
{/* Exit Confirmation Overlay */}
{showExitConfirm && (
  <div
    className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-xl"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="exit-confirm-title"
    aria-describedby="exit-confirm-description"
    onClick={(e) => e.stopPropagation()}
  >
    <div
      className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setShowExitConfirm(false);
        }
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle
            className="w-5 h-5 text-amber-600"
            aria-hidden="true"
          />
        </div>
        <div>
          <h3
            id="exit-confirm-title"
            className="font-semibold text-lg text-gray-900"
          >
            Discard changes?
          </h3>
          <p
            id="exit-confirm-description"
            className="text-sm text-gray-600 mt-2"
          >
            You have unsaved changes. Are you sure you want to discard them?
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          ref={keepEditingButtonRef}
          onClick={() => setShowExitConfirm(false)}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium',
            'border border-gray-300 text-gray-700',
            'hover:bg-gray-50 active:bg-gray-100',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
            'min-h-[44px]'
          )}
        >
          Keep Editing
        </button>
        <button
          onClick={() => {
            setShowExitConfirm(false);
            onCancel();
          }}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium',
            'bg-red-600 text-white',
            'hover:bg-red-700 active:bg-red-800',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
            'min-h-[44px]'
          )}
        >
          Discard
        </button>
      </div>
    </div>
  </div>
)}
```

2. Update Dialog.Content to intercept close events:

```typescript
<Dialog.Content
  // ... existing props
  onPointerDownOutside={(e) => {
    if (isDirty) {
      e.preventDefault();
      setShowExitConfirm(true);
    }
  }}
  onEscapeKeyDown={(e) => {
    if (isDirty) {
      e.preventDefault();
      setShowExitConfirm(true);
    }
  }}
  onInteractOutside={(e) => {
    if (isDirty) {
      e.preventDefault();
    }
  }}
>
```

3. Update the close button to use handleCancel:

```typescript
<Dialog.Close asChild>
  <button
    onClick={(e) => {
      if (isDirty) {
        e.preventDefault();
        setShowExitConfirm(true);
      }
    }}
    // ... rest of props
  >
```

#### Acceptance Criteria

- [ ] Exit confirmation dialog appears when closing with unsaved changes
- [ ] "Keep Editing" button closes confirmation and returns to editor
- [ ] "Discard" button closes both confirmation and editor
- [ ] Clicking overlay with dirty state shows confirmation
- [ ] Pressing Escape with dirty state shows confirmation
- [ ] Clicking X button with dirty state shows confirmation
- [ ] Confirmation dialog has proper ARIA attributes (alertdialog, modal)
- [ ] Focus moves to "Keep Editing" button when confirmation opens
- [ ] Escape key in confirmation closes confirmation only
- [ ] Dialog content has amber warning icon
- [ ] Buttons meet 44px touch target requirement

---

### Task 2.5.7: Add Accessibility Features

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
**Effort:** 0.5 story points
**Dependencies:** Task 2.5.6

#### Description

Ensure the modal is fully accessible with proper ARIA attributes, focus management, keyboard navigation, and Ctrl+Enter save shortcut.

#### Implementation Steps

1. Add keyboard shortcut handler:

```typescript
// Add after existing handlers
const handleKeyDown = useCallback(
  (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isDirty && !isSubmitting) {
      e.preventDefault();
      handleSave();
    }
  },
  [isDirty, isSubmitting, handleSave]
);
```

2. Add the keyboard handler to Dialog.Content:

```typescript
<Dialog.Content
  // ... existing props
  onKeyDown={handleKeyDown}
>
```

3. Add status announcement region for screen readers:

```typescript
{/* Screen reader status announcements */}
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isSubmitting && 'Saving translation...'}
  {errors.general && `Error: ${errors.general}`}
</div>
```

4. Ensure all error messages have role="alert":

```typescript
{errors.title && (
  <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
    {errors.title}
  </p>
)}
```

5. Add keyboard shortcut hint to Save button (optional tooltip or visible text):

```typescript
{/* Add title attribute to Save button */}
<button
  type="button"
  onClick={handleSave}
  disabled={isSubmitting || !isDirty}
  title={isDirty ? 'Save (Ctrl+Enter)' : 'No changes to save'}
  // ... rest
>
```

#### Acceptance Criteria

- [ ] aria-labelledby points to Dialog.Title
- [ ] aria-describedby points to Dialog.Description
- [ ] Dialog.Title has visible text with language name
- [ ] Dialog.Description is sr-only with context about editing
- [ ] aria-live region announces status changes
- [ ] Error messages have role="alert"
- [ ] Focus moves to first editable field on open
- [ ] Ctrl+Enter / Cmd+Enter triggers save when dirty
- [ ] All buttons have min-h-[44px] for touch targets
- [ ] aria-invalid on textareas when errors exist
- [ ] aria-describedby links textareas to error messages

---

### Task 2.5.8: Create Index Export

**File:** `/src/components/TranslationManagement/TranslationEditor/index.ts`
**Effort:** 0.25 story points
**Dependencies:** Task 2.5.7

#### Description

Create the barrel export file for the TranslationEditor module to enable clean imports from parent components.

#### Implementation Steps

Create the file with the following content:

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
  CharacterWarning,
} from './TranslationEditor.types';
```

Also, create or update the parent TranslationManagement index:

```typescript
// /src/components/TranslationManagement/index.ts (create if not exists)

/**
 * TranslationManagement Component Exports
 * Epic 5 - Owner Translation Management
 *
 * @module TranslationManagement
 * @created 2026-01-19
 */

export * from './TranslationEditor';
// Future exports:
// export * from './TranslationPreviewPanel';
// export * from './TranslationStatusWidget';
```

#### Acceptance Criteria

- [ ] TranslationEditor/index.ts created with correct exports
- [ ] TranslationEditor component exported
- [ ] All type interfaces exported
- [ ] TranslationManagement/index.ts created or updated
- [ ] Imports resolve correctly from `/src/components/TranslationManagement`
- [ ] JSDoc comments on module exports

---

### Task 2.5.9: Write Unit Tests

**File:** `/src/components/TranslationManagement/TranslationEditor/__tests__/TranslationEditor.test.tsx`
**Effort:** 2 story points
**Dependencies:** Task 2.5.8

#### Description

Create comprehensive unit tests for the TranslationEditor component covering rendering, user interactions, validation, and accessibility.

#### Implementation Steps

Create the test file with the following test cases:

```typescript
/**
 * TranslationEditor Component Tests
 * Part of REQ-343: Create TranslationEditor Component
 *
 * @module TranslationManagement/TranslationEditor/__tests__
 * @created 2026-01-19
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationEditor } from '../TranslationEditor';
import type { TranslationEditorProps } from '../TranslationEditor.types';

// =============================================================================
// Test Setup
// =============================================================================

const defaultProps: TranslationEditorProps = {
  translation: {
    language: 'fr',
    content: {
      title: 'Comment utiliser le lave-vaisselle',
      description: 'Chargez la vaisselle sur les paniers.',
    },
    status: 'completed',
  },
  sourceContent: {
    title: 'How to Use the Dishwasher',
    description: 'Load dishes on the lower and upper racks.',
  },
  sourceLanguage: 'en',
  isOpen: true,
  onSave: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
  entityType: 'article',
};

describe('TranslationEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<TranslationEditor {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Edit Translation - French/)).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<TranslationEditor {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays source content in read-only format', () => {
      render(<TranslationEditor {...defaultProps} />);

      expect(screen.getByText('How to Use the Dishwasher')).toBeInTheDocument();
      expect(screen.getByText('Load dishes on the lower and upper racks.')).toBeInTheDocument();
    });

    it('displays translation content in editable textareas', () => {
      render(<TranslationEditor {...defaultProps} />);

      const titleTextarea = screen.getByLabelText(/title/i);
      const descTextarea = screen.getByLabelText(/description/i);

      expect(titleTextarea).toHaveValue('Comment utiliser le lave-vaisselle');
      expect(descTextarea).toHaveValue('Chargez la vaisselle sur les paniers.');
    });

    it('displays language flags in pane headers', () => {
      render(<TranslationEditor {...defaultProps} />);

      expect(screen.getByText(/Original \(EN\)/)).toBeInTheDocument();
      expect(screen.getByText(/Translation \(FR\)/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Form Interaction Tests
  // ===========================================================================

  describe('Form Interactions', () => {
    it('updates formData when user types in textarea', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const titleTextarea = screen.getByLabelText(/title/i);
      await user.clear(titleTextarea);
      await user.type(titleTextarea, 'New title');

      expect(titleTextarea).toHaveValue('New title');
    });

    it('shows character count for each field', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Title has 38 characters
      expect(screen.getByText(/38 characters/)).toBeInTheDocument();
    });

    it('shows warning when translation length differs >30% from source', () => {
      const props = {
        ...defaultProps,
        translation: {
          ...defaultProps.translation,
          content: {
            title: 'A', // Very short
            description: 'Short',
          },
        },
      };
      render(<TranslationEditor {...props} />);

      expect(screen.getByText(/significantly shorter than source/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Save/Cancel Tests
  // ===========================================================================

  describe('Save and Cancel', () => {
    it('calls onSave with updated content when Save clicked', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(<TranslationEditor {...defaultProps} onSave={onSave} />);

      // Make a change
      const titleTextarea = screen.getByLabelText(/title/i);
      await user.clear(titleTextarea);
      await user.type(titleTextarea, 'Updated title');

      // Click save
      const saveButton = screen.getByRole('button', { name: /save translation/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Updated title' })
        );
      });
    });

    it('disables Save button when no changes made', () => {
      render(<TranslationEditor {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save translation/i });
      expect(saveButton).toBeDisabled();
    });

    it('calls onCancel when Cancel clicked without dirty state', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<TranslationEditor {...defaultProps} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('shows confirmation dialog when Cancel clicked with dirty state', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      // Make a change
      const titleTextarea = screen.getByLabelText(/title/i);
      await user.clear(titleTextarea);
      await user.type(titleTextarea, 'Changed');

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.getByText(/discard changes\?/i)).toBeInTheDocument();
    });

    it('displays loading state during save', async () => {
      const user = userEvent.setup();
      // Create a delayed save
      const onSave = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<TranslationEditor {...defaultProps} onSave={onSave} />);

      // Make a change and save
      const titleTextarea = screen.getByLabelText(/title/i);
      await user.clear(titleTextarea);
      await user.type(titleTextarea, 'Changed');

      const saveButton = screen.getByRole('button', { name: /save translation/i });
      await user.click(saveButton);

      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Dirty State & Exit Confirmation Tests
  // ===========================================================================

  describe('Dirty State and Exit Confirmation', () => {
    it('blocks close during submission', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      const onCancel = vi.fn();
      render(<TranslationEditor {...defaultProps} onSave={onSave} onCancel={onCancel} />);

      // Make change and start save
      const titleTextarea = screen.getByLabelText(/title/i);
      await user.clear(titleTextarea);
      await user.type(titleTextarea, 'Changed');

      const saveButton = screen.getByRole('button', { name: /save translation/i });
      await user.click(saveButton);

      // Try to cancel during save
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('handles save errors gracefully', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<TranslationEditor {...defaultProps} onSave={onSave} />);

      // Make change and save
      const titleTextarea = screen.getByLabelText(/title/i);
      await user.clear(titleTextarea);
      await user.type(titleTextarea, 'Changed');

      const saveButton = screen.getByRole('button', { name: /save translation/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has proper ARIA attributes on dialog', () => {
      render(<TranslationEditor {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('triggers save with Ctrl+Enter when dirty', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(<TranslationEditor {...defaultProps} onSave={onSave} />);

      // Make a change
      const titleTextarea = screen.getByLabelText(/title/i);
      await user.clear(titleTextarea);
      await user.type(titleTextarea, 'Changed');

      // Press Ctrl+Enter
      fireEvent.keyDown(titleTextarea, { key: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });

    it('moves focus to first field on open', async () => {
      render(<TranslationEditor {...defaultProps} />);

      await waitFor(() => {
        const titleTextarea = screen.getByLabelText(/title/i);
        expect(document.activeElement).toBe(titleTextarea);
      });
    });
  });
});
```

#### Acceptance Criteria

- [ ] Test file created at correct path
- [ ] Tests use Vitest and React Testing Library
- [ ] Test for modal rendering when isOpen true
- [ ] Test for no render when isOpen false
- [ ] Test for source content display (read-only)
- [ ] Test for translation content in editable textareas
- [ ] Test for formData update on user input
- [ ] Test for character count display
- [ ] Test for character count warnings (>30%, >50%)
- [ ] Test for onSave called with updated content
- [ ] Test for Save button disabled when no changes
- [ ] Test for onCancel when Cancel clicked (no dirty state)
- [ ] Test for confirmation dialog on Cancel with dirty state
- [ ] Test for buttons disabled during submission
- [ ] Test for loading state display
- [ ] Test for error handling on save failure
- [ ] Test for Ctrl+Enter keyboard shortcut
- [ ] Test for proper ARIA attributes
- [ ] All tests pass with `npm run test`

---

## File Structure

After completing all tasks, the file structure should be:

```
/src/components/TranslationManagement/
├── index.ts                              # Module exports
├── TranslationEditor/
│   ├── index.ts                          # Component exports
│   ├── TranslationEditor.tsx             # Main component (~400-500 lines)
│   ├── TranslationEditor.types.ts        # Type definitions (~70 lines)
│   └── __tests__/
│       └── TranslationEditor.test.tsx    # Unit tests (~250-300 lines)
```

---

## Verification Checklist

### Pre-Implementation

- [ ] Node modules installed (`npm install`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Radix Dialog package available (`@radix-ui/react-dialog`)
- [ ] Translation service types available (`/src/lib/translation-service/`)

### Post-Implementation

- [ ] All files created at correct paths
- [ ] TypeScript compiles without errors
- [ ] Component renders in Storybook or test environment
- [ ] All unit tests pass
- [ ] Accessibility audit passes (keyboard nav, screen reader)
- [ ] Visual appearance matches design spec
- [ ] Responsive layout works (mobile, tablet, desktop)
- [ ] No console errors or warnings

### Integration Verification

- [ ] Component can be imported from `@/components/TranslationManagement`
- [ ] Component integrates with TranslationPreviewPanel (when available)
- [ ] Save operation calls API correctly (when integrated)
- [ ] Status updates to 'manual' after save

---

## Testing Requirements

### Unit Test Coverage

| Test Category | Minimum Coverage |
|--------------|------------------|
| Rendering | 90% |
| User Interactions | 85% |
| State Management | 90% |
| Error Handling | 80% |
| Accessibility | 75% |

### Manual Testing Checklist

- [ ] Open modal via TranslationStatusItem edit button
- [ ] Verify source content displays correctly (read-only)
- [ ] Verify translation content is editable
- [ ] Type in textarea and verify character count updates
- [ ] Make translation significantly longer/shorter - verify warning appears
- [ ] Click Save and verify modal closes, data persists
- [ ] Click Cancel without changes - verify modal closes
- [ ] Make changes, click Cancel - verify confirmation dialog appears
- [ ] Test on tablet viewport (768px width)
- [ ] Test keyboard navigation (Tab through fields, Escape to close)
- [ ] Test Ctrl+Enter to save
- [ ] Test with VoiceOver screen reader

---

## References

- **Overview Document:** `docs/REQ-343-create-translationeditor-component-overview.md`
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `docs/gen_requests_epic5.md` (REQ-313)
- **Pattern Reference - Dialog:** `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- **Pattern Reference - Confirm:** `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- **Radix Dialog Docs:** https://www.radix-ui.com/primitives/docs/components/dialog

---

*Document generated for FAQBNB REQ-343 - TranslationEditor Component Detailed Task Breakdown*
*Generated: 2026-01-19*
