# REQ-313: Create TranslationEditor Component - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.5
**Depends On:** REQ-309 (TranslationManagement types), Epic 1 Foundation, Epic 3 Dynamic Content Translation

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

Create a TranslationEditor component that allows property owners to manually edit translations through a modal dialog with side-by-side comparison of original source content and translation text. The component will use Radix Dialog for accessibility, track dirty state to prevent accidental data loss, and display character count with warnings when translation length differs significantly from source.

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
4. **Consistency**: Follow existing modal patterns from PropertyEditModal

---

## Technical Approach

### Technology Stack

| Technology | Usage |
|------------|-------|
| React 18 | Component framework |
| TypeScript | Type safety |
| Radix UI Dialog | Accessible modal dialog |
| Tailwind CSS | Styling |
| Lucide React | Icons |

### Existing Patterns to Follow

| Pattern | Reference File | Aspect to Reuse |
|---------|---------------|-----------------|
| Radix Dialog Structure | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Portal, Overlay, Content structure |
| Form State Management | PropertyEditModal.tsx:183-194 | useState for formData, errors, isSubmitting |
| Character Count Display | PropertyEditModal.tsx:328-337 | `{value.length}/{maxLength}` pattern |
| Responsive Layout | PropertyEditModal.tsx:363-384 | Desktop centered modal, mobile drawer |
| Dirty State Pattern | Similar to isSubmitting blocking | Track original vs current value |
| Button Styling | PropertyEditModal.tsx:536-554 | Gradient save, bordered cancel |
| Accessibility | PropertyEditModal.tsx:360-401 | ARIA labels, sr-only descriptions |

### Component Integration

```
TranslationPreviewPanel (parent)
    └── TranslationStatusItem (triggers edit)
            └── TranslationEditor (this component)
                    ├── Source Content Pane (read-only)
                    ├── Translation Textarea Pane
                    ├── Character Count Display
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
import { SupportedLanguage } from '../TranslationManagement.types';

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
): { showWarning: boolean; message: string } => {
  if (sourceLength === 0) return { showWarning: false, message: '' };

  const diff = Math.abs(translationLength - sourceLength);
  const percentage = (diff / sourceLength) * 100;

  if (percentage > 50) {
    return {
      showWarning: true,
      message: translationLength > sourceLength
        ? 'Translation is significantly longer than source'
        : 'Translation is significantly shorter than source'
    };
  } else if (percentage > 30) {
    return {
      showWarning: true,
      message: translationLength > sourceLength
        ? 'Translation is longer than source'
        : 'Translation is shorter than source'
    };
  }

  return { showWarning: false, message: '' };
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

**Estimated Effort:** 0.5 hours

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
7. Set up Radix Dialog structure following PropertyEditModal pattern

**Code Pattern:**
```typescript
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslationEditorProps, TranslationEditorFormState, TranslationEditorErrors } from './TranslationEditor.types';

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

**Estimated Effort:** 1.5 hours

---

### Task 2.5.3: Implement Side-by-Side Layout

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Create the side-by-side view with source content on left (read-only) and translation textarea on right.

**Subtasks:**
1. Create responsive grid layout (single column mobile, two columns desktop)
2. Implement source content pane with read-only display
3. Implement translation pane with editable textarea
4. Add field labels for title, description, and name (conditionally rendered)
5. Style source pane with distinct read-only appearance
6. Add language labels to each pane header

**Layout Structure:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Source Content Pane */}
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[#222222]">
        Original ({sourceLanguage.toUpperCase()})
      </span>
    </div>
    {/* Read-only fields */}
  </div>

  {/* Translation Pane */}
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[#222222]">
        Translation ({translation.language.toUpperCase()})
      </span>
    </div>
    {/* Editable fields */}
  </div>
</div>
```

**Estimated Effort:** 1.5 hours

---

### Task 2.5.4: Implement Character Count with Warnings

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Add character count display below each textarea with warning indicators when translation length differs significantly from source.

**Subtasks:**
1. Create getCharacterWarning utility function
2. Add character count display below each textarea
3. Implement warning styling (amber for moderate difference, red for significant)
4. Add warning icon and message when threshold exceeded
5. Ensure counts update in real-time as user types

**UI Pattern:**
```tsx
<div className="flex justify-between items-center text-xs mt-1">
  <div className={cn(
    'flex items-center gap-1',
    charWarning.showWarning ? 'text-amber-600' : 'text-[#717171]'
  )}>
    {charWarning.showWarning && <AlertTriangle className="w-3 h-3" />}
    {charWarning.message}
  </div>
  <span className="text-[#717171]">
    {value.length} characters
    {sourceLength > 0 && ` (source: ${sourceLength})`}
  </span>
</div>
```

**Estimated Effort:** 1 hour

---

### Task 2.5.5: Implement Save/Cancel Actions

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Create footer with Save and Cancel buttons, implement save handler that calls onSave prop and closes modal.

**Subtasks:**
1. Create footer section with button layout (flex-col-reverse on mobile)
2. Implement handleCancel function with dirty state check
3. Implement handleSave function with API call and error handling
4. Add loading state to Save button during submission
5. Block interactions during submission (overlay, close button)
6. Style buttons following PropertyEditModal pattern

**Estimated Effort:** 1 hour

---

### Task 2.5.6: Implement Dirty State Tracking and Exit Confirmation

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Track unsaved changes and prompt user for confirmation before closing if edits exist.

**Subtasks:**
1. Implement isDirty calculation comparing current vs original values
2. Create exit confirmation dialog (inline or separate component)
3. Handle close button click with dirty check
4. Handle overlay click with dirty check
5. Handle Escape key with dirty check
6. Provide "Discard Changes" and "Keep Editing" options

**Exit Confirmation UI:**
```tsx
{showExitConfirm && (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
      <h3 className="font-semibold text-lg text-[#222222]">Discard changes?</h3>
      <p className="text-sm text-[#717171] mt-2">
        You have unsaved changes. Are you sure you want to discard them?
      </p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setShowExitConfirm(false)}
          className="flex-1 px-4 py-2 border border-[#222222] rounded-lg"
        >
          Keep Editing
        </button>
        <button
          onClick={() => {
            setShowExitConfirm(false);
            onCancel();
          }}
          className="flex-1 px-4 py-2 bg-[#FF385C] text-white rounded-lg"
        >
          Discard
        </button>
      </div>
    </div>
  </div>
)}
```

**Estimated Effort:** 1.5 hours

---

### Task 2.5.7: Add Accessibility Features

**File:** `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Description:** Ensure the modal is fully accessible with proper ARIA attributes, focus management, and keyboard navigation.

**Subtasks:**
1. Add aria-labelledby and aria-describedby to Dialog.Content
2. Add Dialog.Title with visible title text
3. Add Dialog.Description with sr-only context
4. Add aria-live region for status announcements
5. Ensure focus moves to first editable field on open
6. Implement keyboard shortcuts (Escape to close, Ctrl+Enter to save)
7. Add role="alert" to error messages
8. Test with screen reader (VoiceOver/NVDA)

**Estimated Effort:** 1 hour

---

### Task 2.5.8: Create Index Export

**File:** `/src/components/TranslationManagement/TranslationEditor/index.ts`

**Description:** Create the barrel export file for the TranslationEditor module.

**Content:**
```typescript
// src/components/TranslationManagement/TranslationEditor/index.ts
// REQ-313: TranslationEditor Component Exports
// Created: 2026-01-18

export { TranslationEditor } from './TranslationEditor';
export type {
  TranslationEditorProps,
  TranslationContent,
  TranslationData,
  TranslationEditorFormState,
  TranslationEditorErrors,
} from './TranslationEditor.types';
```

**Estimated Effort:** 0.25 hours

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
7. Shows warning when translation length differs significantly from source
8. Calls onSave with updated content when Save clicked
9. Calls onCancel when Cancel clicked (without dirty state)
10. Shows confirmation dialog when Cancel clicked with dirty state
11. Blocks close during submission
12. Displays loading state during save
13. Handles save errors gracefully
14. Is keyboard accessible (focus trap, Escape key)

**Estimated Effort:** 2 hours

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
import { X, AlertTriangle, Languages, Save } from 'lucide-react';

// Utilities
import { cn } from '@/lib/utils';

// Types from TranslationManagement (REQ-309)
import type { SupportedLanguage } from '../TranslationManagement.types';
```

### Dependencies from Other Tasks

| Dependency | Task | Status |
|------------|------|--------|
| TranslationManagement.types.ts | REQ-309 Task 2.1 | Required |
| SupportedLanguage type | Epic 1 Foundation | Required |
| PUT /api/translations/{entityType}/{entityId}/{language} | REQ-305 Task 1.2 | Required for save |

---

## Acceptance Criteria

### From REQ-313 (gen_requests_epic5.md)

- [x] Modal opens when edit action is triggered for a translation
- [x] Modal uses Radix Dialog component for accessibility and keyboard navigation
- [x] Left pane displays original source content in read-only format
- [x] Right pane displays editable textarea populated with current translation text
- [x] Character count displays below textarea showing current character length
- [x] Character count includes warning indicator if translation length differs significantly from source
- [x] Save button commits translation changes and closes modal
- [x] Cancel button dismisses modal without saving changes
- [x] Modal tracks dirty state and prompts for confirmation if user attempts to close with unsaved edits
- [x] Saved translations are marked with manually reviewed status
- [x] Modal is responsive and usable on tablet and desktop viewports
- [x] Modal is keyboard accessible with proper focus management
- [x] Textarea supports standard editing operations including undo/redo

### From Implementation Plan (Plan-111)

- [x] Side-by-side view: Original | Translation
- [x] Dirty state tracking
- [x] Character count (with warning if applicable)

---

## Testing Strategy

### Unit Tests

1. Component rendering tests
2. Form state management tests
3. Character count calculation tests
4. Dirty state detection tests
5. Save/Cancel handler tests
6. Error handling tests

### Integration Tests

1. Integration with TranslationPreviewPanel
2. API call verification (mock)
3. Status update after save

### Accessibility Tests

1. Focus management on open/close
2. Keyboard navigation (Tab, Escape, Enter)
3. Screen reader announcements
4. ARIA attribute validation

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
- [ ] Test with VoiceOver/NVDA screen reader

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationManagement types not yet created | Medium | High | Create types file first (REQ-309), or stub types locally |
| API endpoint not ready | Medium | High | Mock API response for development, add loading/error states |
| Content fields vary by entity type | Medium | Medium | Conditionally render fields based on entityType prop |
| Long text causes layout issues | Low | Medium | Use overflow-auto, max-height constraints on textareas |
| Character warning threshold unclear | Low | Low | Start with 30%/50% thresholds, adjust based on feedback |

---

## Visual Reference

From Plan-111 UI Specifications:

```
┌───────────────────────────────────────────────────────────────────────┐
│ Edit Translation - French (FR)                                   [X] │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐  ┌─────────────────────────┐            │
│  │ Original (EN)           │  │ Translation (FR)         │            │
│  │                         │  │                          │            │
│  │ How to Use the          │  │ Comment utiliser le      │            │
│  │ Dishwasher              │  │ lave-vaisselle           │            │
│  │                         │  │                          │            │
│  │ Load dishes on the      │  │ Chargez la vaisselle sur │            │
│  │ lower and upper racks.  │  │ les paniers inférieur et │            │
│  │ Add detergent to the    │  │ supérieur. Ajoutez le    │            │
│  │ dispenser and select    │  │ détergent et sélect...   │            │
│  │ your wash cycle.        │  │                          │            │
│  │                         │  │ [                    ]   │            │
│  └─────────────────────────┘  │                          │            │
│                               │ 156 chars (source: 148)  │            │
│                               │ ⚠ Slightly longer        │            │
│                               └──────────────────────────┘            │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                      [Cancel]  [Save Translation]     │
└───────────────────────────────────────────────────────────────────────┘
```

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-313)
- **Pattern Reference:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- **Radix Dialog Docs:** https://www.radix-ui.com/primitives/docs/components/dialog
- **Epic 5 PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`

---

*Document generated for FAQBNB REQ-313 - TranslationEditor Component*
