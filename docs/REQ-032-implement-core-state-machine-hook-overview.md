# REQ-032: Implementation Breakdown - Core State Machine Hook

**Document Created:** 2025-12-31 16:30
**Last Modified:** 2025-12-31 16:30
**Request Reference:** docs/gen_requests.md - Request #032
**Implementation Plan Reference:** docs/prd/item-capture-implementation-plan.md
**Phase:** 1 - Foundation
**Task ID:** 1.2

---

## Overview

This document provides a detailed implementation breakdown for the core state machine hook (`useItemCaptureState.ts`) that will manage the multi-step item capture wizard flow. This hook is a critical foundation piece that all subsequent ItemCapture phases depend upon.

### Purpose

The `useItemCaptureState` hook serves as the central state management system for the ItemCapture component, providing:

- Predictable step-by-step wizard navigation
- Centralized state for metadata, media items, and instructions
- Validation before step transitions
- Error handling with field-level granularity
- Camera and recording state tracking for resource management

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 1.1 - Directory Structure | **Required** | Types file must exist before implementing reducer |
| `ItemCapture.types.ts` | **Required** | All interfaces must be defined |

### Dependents (Blocked by this task)

- Task 1.3 - Wizard Navigation Scaffold
- Task 1.4 - MetadataStep
- Task 1.5 - ContentTypeStep
- All Phase 2-5 tasks

---

## Technical Approach

### Pattern Selection: useReducer + Context

Based on codebase analysis, this implementation will use React's `useReducer` pattern, which is the standard approach for complex state machines. While the existing codebase primarily uses `useState` for form state (e.g., `ItemForm.tsx`, `RegistrationForm.tsx`), the wizard flow complexity warrants a reducer pattern for:

1. **Predictable state transitions** - Actions explicitly define what mutations are allowed
2. **Complex validation logic** - Step transitions require validation of multiple fields
3. **Debugging** - Actions are logged and traceable
4. **Testing** - Reducer logic can be unit tested in isolation

### Existing Patterns to Follow

| Pattern | Source File | How to Apply |
|---------|-------------|--------------|
| State machine enum | `AuthContext.tsx:46-53` | Define `WizardStep` type for all valid states |
| Compound state object | `RegistrationForm.tsx`, `ItemForm.tsx` | Group related state (metadata, media, errors) |
| Field-level errors | `ItemForm.tsx:67-104` | Use `Record<string, string>` for error mapping |
| Error clearing on change | `PropertyForm.tsx:31-41` | Clear field error when updating that field |
| useCallback for handlers | `useRegistration.ts` | Wrap dispatch calls in memoized callbacks |

---

## State Architecture

### State Interface

```typescript
// /src/components/ItemCapture/hooks/useItemCaptureState.ts

interface ItemCaptureState {
  // Navigation
  currentStep: WizardStep;
  stepHistory: WizardStep[];      // For back navigation

  // Data
  metadata: ItemMetadata;
  mediaItems: MediaItem[];
  instructions: string;

  // Validation
  errors: Record<string, string>;  // Field-level errors

  // Resource states
  isRecording: boolean;
  isCameraActive: boolean;

  // UI state
  isSubmitting: boolean;
  isDirty: boolean;               // Track unsaved changes
}
```

### Wizard Steps Definition

```typescript
type WizardStep =
  | 'metadata'           // Step 1: Title, location, tags, appliance type
  | 'content-type'       // Step 2: Select Video/Photo/Text/Upload
  | 'capture-video'      // Step 3a: Video recording
  | 'capture-photo'      // Step 3b: Photo capture
  | 'upload-file'        // Step 3c: File upload
  | 'write-text'         // Step 3d: Markdown writing
  | 'edit-media'         // Step 4: Crop/rotate/trim
  | 'add-more'           // Step 5: Add another or continue
  | 'review';            // Step 6: Final review
```

### Action Types

```typescript
type ItemCaptureAction =
  // Metadata actions
  | { type: 'SET_METADATA'; payload: Partial<ItemMetadata> }

  // Media actions
  | { type: 'ADD_MEDIA'; payload: MediaItem }
  | { type: 'REMOVE_MEDIA'; payload: string }  // by id
  | { type: 'UPDATE_MEDIA'; payload: { id: string; updates: Partial<MediaItem> } }
  | { type: 'REORDER_MEDIA'; payload: { fromIndex: number; toIndex: number } }

  // Instructions
  | { type: 'SET_INSTRUCTIONS'; payload: string }

  // Navigation
  | { type: 'GO_TO_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

  // Errors
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }  // field name
  | { type: 'CLEAR_ALL_ERRORS' }

  // Resource states
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ACTIVATE_CAMERA' }
  | { type: 'DEACTIVATE_CAMERA' }

  // Submission
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET' };
```

---

## Step Transition Rules

### Valid Transitions Map

```typescript
const STEP_TRANSITIONS: Record<WizardStep, WizardStep[]> = {
  'metadata':       ['content-type'],
  'content-type':   ['capture-video', 'capture-photo', 'upload-file', 'write-text'],
  'capture-video':  ['edit-media', 'add-more'],
  'capture-photo':  ['edit-media', 'add-more'],
  'upload-file':    ['edit-media', 'add-more'],
  'write-text':     ['add-more', 'review'],
  'edit-media':     ['add-more', 'review'],
  'add-more':       ['content-type', 'review'],
  'review':         ['metadata', 'content-type']  // Allow editing
};
```

### Step Validation Requirements

| Step | Required Before Leaving | Validation Logic |
|------|------------------------|------------------|
| `metadata` | Title (non-empty) | `metadata.title.trim().length > 0` |
| `content-type` | Selection made | N/A (implicit from navigation) |
| `capture-video` | Video captured | `mediaItems.some(m => m.type === 'video')` |
| `capture-photo` | Photo captured | `mediaItems.some(m => m.type === 'image')` |
| `upload-file` | File selected | At least one file added |
| `write-text` | Text entered (if only content) | `instructions.trim().length > 0 OR mediaItems.length > 0` |
| `edit-media` | None (optional edits) | N/A |
| `add-more` | None | N/A |
| `review` | Title + (media OR text) | `metadata.title && (mediaItems.length > 0 \|\| instructions.length > 0)` |

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Main hook implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/ItemCapture.types.ts` | Add state/action types if not present |
| `src/components/ItemCapture/index.ts` | Export hook (if barrel exists) |

### Dependencies (Read-Only Reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/hooks/useRegistration.ts` | Pattern for error handling, useCallback usage |
| `src/contexts/AuthContext.tsx` | Pattern for state machine enum |
| `src/components/ItemForm.tsx` | Pattern for validation logic |
| `src/lib/utils.ts` | Utility function patterns |

---

## Implementation Tasks

### Task 1: Create Initial State and Types (30 min)

**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`

**Deliverables:**
- [ ] Define `WizardStep` type union
- [ ] Define `ItemCaptureState` interface
- [ ] Define `ItemCaptureAction` discriminated union
- [ ] Create `initialState` constant
- [ ] Export types for use by components

**Acceptance Criteria:**
- All types compile without errors
- Types match implementation plan specifications
- Types are exported for component consumption

### Task 2: Implement Reducer Function (1 hour)

**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`

**Deliverables:**
- [ ] Implement `itemCaptureReducer` function
- [ ] Handle all action types
- [ ] Implement step transition logic
- [ ] Implement error state management
- [ ] Implement media item management (add, remove, update, reorder)

**Acceptance Criteria:**
- All action types handled in switch statement
- Invalid actions return unchanged state
- State mutations are immutable (spread operator usage)
- No TypeScript errors or warnings

### Task 3: Implement Validation Functions (45 min)

**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`

**Deliverables:**
- [ ] Create `validateStepTransition(currentStep, nextStep, state)` function
- [ ] Create `validateMetadata(metadata)` function
- [ ] Create `canSubmit(state)` function
- [ ] Return validation errors in consistent format

**Validation Rules:**
```typescript
function validateMetadata(metadata: ItemMetadata): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!metadata.title.trim()) {
    errors.title = 'Title is required';
  } else if (metadata.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  // Location is optional, no validation
  // Tags are optional, no validation
  // Appliance type is optional, no validation

  return errors;
}
```

**Acceptance Criteria:**
- Validation returns empty object when valid
- Validation returns field-keyed error messages when invalid
- Step transitions are blocked when validation fails

### Task 4: Implement Custom Hook (1 hour)

**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`

**Deliverables:**
- [ ] Create `useItemCaptureState()` hook
- [ ] Initialize with `useReducer(itemCaptureReducer, initialState)`
- [ ] Create memoized action dispatchers with `useCallback`
- [ ] Return state and action dispatchers

**Hook Return Interface:**
```typescript
interface UseItemCaptureStateReturn {
  // State
  state: ItemCaptureState;

  // Navigation actions
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Data actions
  setMetadata: (metadata: Partial<ItemMetadata>) => void;
  addMedia: (media: MediaItem) => void;
  removeMedia: (id: string) => void;
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
  reorderMedia: (fromIndex: number, toIndex: number) => void;
  setInstructions: (text: string) => void;

  // Error actions
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  // Resource actions
  startRecording: () => void;
  stopRecording: () => void;
  activateCamera: () => void;
  deactivateCamera: () => void;

  // Submission
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;

  // Computed values
  canGoNext: boolean;
  canGoBack: boolean;
  canSubmit: boolean;
  hasUnsavedChanges: boolean;
}
```

**Acceptance Criteria:**
- Hook compiles and exports correctly
- All callbacks are memoized with useCallback
- Computed values use useMemo for performance
- Hook can be consumed by test component

### Task 5: Add State Persistence (Optional - 30 min)

**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`

**Note:** Per open question #1 in implementation plan, draft auto-save to localStorage is optional. Include scaffolding but guard behind feature flag.

**Deliverables:**
- [ ] Add `useDraftPersistence` option to hook params
- [ ] Implement localStorage save on state change (debounced)
- [ ] Implement draft restoration on mount
- [ ] Add `clearDraft()` action
- [ ] Guard behind config option (default: false)

**Acceptance Criteria:**
- Persistence is opt-in via config
- Draft is saved with unique key per session
- Draft clears on successful submit
- Graceful fallback if localStorage unavailable

### Task 6: Create Test Cases (30 min)

**File:** `src/components/ItemCapture/hooks/__tests__/useItemCaptureState.test.ts`

**Test Coverage:**
- [ ] Initial state is correct
- [ ] Metadata actions work correctly
- [ ] Media add/remove/update/reorder work correctly
- [ ] Step navigation respects validation
- [ ] Error state management works
- [ ] Camera/recording states toggle correctly
- [ ] Reset returns to initial state

**Example Test:**
```typescript
describe('useItemCaptureState', () => {
  describe('navigation', () => {
    it('prevents navigation from metadata without title', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.state.currentStep).toBe('metadata');
      expect(result.current.state.errors.title).toBe('Title is required');
    });

    it('allows navigation from metadata with valid title', () => {
      const { result } = renderHook(() => useItemCaptureState());

      act(() => {
        result.current.setMetadata({ title: 'Test Item' });
        result.current.nextStep();
      });

      expect(result.current.state.currentStep).toBe('content-type');
      expect(result.current.state.errors).toEqual({});
    });
  });
});
```

---

## Estimated Effort

| Task | Estimate | Complexity |
|------|----------|------------|
| Task 1: Types and Initial State | 30 min | Low |
| Task 2: Reducer Implementation | 1 hour | Medium |
| Task 3: Validation Functions | 45 min | Medium |
| Task 4: Custom Hook | 1 hour | Medium |
| Task 5: State Persistence (Optional) | 30 min | Low |
| Task 6: Test Cases | 30 min | Low |
| **Total** | **~4-5 hours** | Medium |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex step transition logic | Medium | Medium | Thorough unit tests for each transition |
| Inconsistent state between components | Low | High | Single source of truth via reducer |
| Performance with large media arrays | Low | Medium | Use immer or careful spread patterns |
| Race conditions with camera state | Medium | Medium | Use refs for immediate state access if needed |

---

## Testing Checklist

### Unit Tests
- [ ] Reducer returns unchanged state for unknown actions
- [ ] Each action type produces expected state mutation
- [ ] Validation functions return correct error objects
- [ ] Step transitions are validated
- [ ] Media reordering maintains array integrity

### Integration Tests
- [ ] Hook initializes with correct initial state
- [ ] Callbacks update state correctly
- [ ] Computed values (canGoNext, canSubmit) are accurate
- [ ] Multiple rapid state updates don't cause issues

### Manual Testing
- [ ] Create minimal test component using hook
- [ ] Verify step navigation with/without valid data
- [ ] Verify error display and clearing
- [ ] Verify reset functionality

---

## Code Standards

### Naming Conventions
- Use camelCase for functions and variables
- Use PascalCase for types and interfaces
- Prefix action types with descriptive verbs (SET_, ADD_, REMOVE_, etc.)

### Documentation
- JSDoc comments for exported functions and interfaces
- Inline comments for complex validation logic
- Type annotations for all function parameters and returns

### Error Messages
- User-facing error messages should be actionable
- Follow existing patterns from `RegistrationForm.tsx` validation

---

## References

- **Implementation Plan:** `docs/prd/item-capture-implementation-plan.md`
- **Request Definition:** `docs/gen_requests.md` - Request #032
- **Pattern Reference - State Machine:** `src/contexts/AuthContext.tsx:46-53`
- **Pattern Reference - Validation:** `src/components/RegistrationForm.tsx:186-240`
- **Pattern Reference - Custom Hook:** `src/hooks/useRegistration.ts`
- **Pattern Reference - Error Handling:** `src/lib/error-utils.ts`

---

## Appendix: Complete Hook Implementation Skeleton

```typescript
// src/components/ItemCapture/hooks/useItemCaptureState.ts
'use client';

import { useReducer, useCallback, useMemo } from 'react';
import type {
  WizardStep,
  ItemMetadata,
  MediaItem,
  ItemCaptureConfig
} from '../ItemCapture.types';

// ============================================
// Types
// ============================================

export interface ItemCaptureState {
  currentStep: WizardStep;
  stepHistory: WizardStep[];
  metadata: ItemMetadata;
  mediaItems: MediaItem[];
  instructions: string;
  errors: Record<string, string>;
  isRecording: boolean;
  isCameraActive: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export type ItemCaptureAction =
  | { type: 'SET_METADATA'; payload: Partial<ItemMetadata> }
  | { type: 'ADD_MEDIA'; payload: MediaItem }
  | { type: 'REMOVE_MEDIA'; payload: string }
  | { type: 'UPDATE_MEDIA'; payload: { id: string; updates: Partial<MediaItem> } }
  | { type: 'REORDER_MEDIA'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_INSTRUCTIONS'; payload: string }
  | { type: 'GO_TO_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ACTIVATE_CAMERA' }
  | { type: 'DEACTIVATE_CAMERA' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET' };

// ============================================
// Initial State
// ============================================

const createInitialState = (): ItemCaptureState => ({
  currentStep: 'metadata',
  stepHistory: [],
  metadata: {
    title: '',
    location: '',
    tags: [],
    applianceType: undefined,
  },
  mediaItems: [],
  instructions: '',
  errors: {},
  isRecording: false,
  isCameraActive: false,
  isSubmitting: false,
  isDirty: false,
});

// ============================================
// Validation
// ============================================

export function validateMetadata(metadata: ItemMetadata): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!metadata.title.trim()) {
    errors.title = 'Title is required';
  } else if (metadata.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  return errors;
}

// ============================================
// Reducer
// ============================================

function itemCaptureReducer(
  state: ItemCaptureState,
  action: ItemCaptureAction
): ItemCaptureState {
  switch (action.type) {
    case 'SET_METADATA':
      return {
        ...state,
        metadata: { ...state.metadata, ...action.payload },
        isDirty: true,
        // Clear errors for updated fields
        errors: Object.fromEntries(
          Object.entries(state.errors).filter(
            ([key]) => !Object.keys(action.payload).includes(key)
          )
        ),
      };

    // ... implement all other cases

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

// ============================================
// Hook
// ============================================

export interface UseItemCaptureStateOptions {
  config?: ItemCaptureConfig;
}

export function useItemCaptureState(options: UseItemCaptureStateOptions = {}) {
  const [state, dispatch] = useReducer(itemCaptureReducer, undefined, createInitialState);

  // Action dispatchers
  const setMetadata = useCallback((metadata: Partial<ItemMetadata>) => {
    dispatch({ type: 'SET_METADATA', payload: metadata });
  }, []);

  // ... implement all other dispatchers

  // Computed values
  const canGoNext = useMemo(() => {
    // Implementation based on current step validation
    return true;
  }, [state.currentStep, state.metadata, state.mediaItems]);

  const canSubmit = useMemo(() => {
    return state.metadata.title.trim().length > 0 &&
           (state.mediaItems.length > 0 || state.instructions.trim().length > 0);
  }, [state.metadata.title, state.mediaItems.length, state.instructions]);

  return {
    state,
    setMetadata,
    // ... all other returns
    canGoNext,
    canSubmit,
  };
}

export default useItemCaptureState;
```
