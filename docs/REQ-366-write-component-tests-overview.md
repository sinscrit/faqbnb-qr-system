# REQ-366: Write Component Tests for Translation Management UI - Implementation Overview

**Last Modified:** 2026-01-19 10:30:00 UTC
**Request ID:** REQ-366
**Epic:** Localization Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.6
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

---

## Summary

Implement comprehensive component tests for three critical translation management UI components:
1. **TranslationPreviewPanel** - Slide-out panel showing translation status for all languages
2. **TranslationEditor** - Modal dialog for editing translations with save flow
3. **TranslationStatusWidget** - Dashboard widget showing translation summary counts

These tests ensure component reliability, prevent regressions, and validate user interactions.

---

## Prerequisites

### Dependencies from Epic 5 (Must Exist)
| Component | Location | Status |
|-----------|----------|--------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Required |
| TranslationStatusItem | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Required |
| TranslationProgressBar | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Required |
| TranslationEditor | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Required |
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Required |
| TranslationManagement.types.ts | `/src/components/TranslationManagement/TranslationManagement.types.ts` | Required |

### Testing Infrastructure (Already Exists)
| Dependency | Location | Notes |
|------------|----------|-------|
| Vitest | `vitest.config.ts` | Test runner with jsdom environment |
| Testing Library | `@testing-library/react` | Component testing utilities |
| User Event | `@testing-library/user-event` | User interaction simulation |
| Jest DOM | `@testing-library/jest-dom` | DOM matchers |
| Vitest Axe | `vitest-axe` | Accessibility testing matchers |
| Setup File | `vitest.setup.ts` | Global mocks (localStorage, ResizeObserver, etc.) |

---

## Technical Context

### Existing Test Patterns to Follow

The project has established testing patterns in:
- `/src/components/ItemManager/components/ItemPreview/__tests__/ItemPreviewModal.test.tsx` - Modal/panel testing pattern
- `/src/components/ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test.tsx` - Dialog testing pattern
- `/src/components/ItemCreationWorkflow/components/shared/__tests__/SessionProgressBar.test.tsx` - Progress/count widget testing

**Key patterns observed:**
1. **Mock data sections** - Clearly defined at top of test files
2. **Mock functions** - Using `vi.fn()` for callbacks
3. **Default props** - Reusable default prop objects
4. **Grouped describe blocks** - Organized by feature/behavior
5. **beforeEach cleanup** - `vi.clearAllMocks()` before each test
6. **ARIA testing** - Verifying accessibility attributes
7. **userEvent** - Preferred for user interaction simulation

### Component Interfaces (from Implementation Plan)

```typescript
// TranslationPreviewPanel Props
interface TranslationPreviewPanelProps {
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  sourceLanguage: SupportedLanguage;
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onTranslationEdited?: (language: SupportedLanguage) => void;
}

// TranslationEditor Props
interface TranslationEditorProps {
  translation: {
    language: SupportedLanguage;
    content: { title?: string; description?: string; name?: string };
    status: string;
  };
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  sourceLanguage: SupportedLanguage;
  isOpen: boolean;
  onSave: (updated: { title?: string; description?: string; name?: string }) => Promise<void>;
  onCancel: () => void;
}

// TranslationStatusWidget Props (inferred)
interface TranslationStatusWidgetProps {
  propertyId?: string;
  onViewDetails?: () => void;
}
```

### Translation Status Types
```typescript
type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
```

---

## Implementation Tasks

### Task 1: Create TranslationPreviewPanel Test Suite

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.test.tsx`

**Test Categories:**

#### 1.1 Rendering Tests
- [ ] Renders nothing when `isOpen` is false
- [ ] Renders panel when `isOpen` is true
- [ ] Displays source content (title, description) correctly
- [ ] Shows source language indicator (e.g., "English" or flag)
- [ ] Renders all six language rows (en, fr, es, de, nl, it)

#### 1.2 Status Indicator Tests
- [ ] Shows green checkmark (✓) for `completed` status
- [ ] Shows orange hourglass (⏳) for `pending` status
- [ ] Shows animated spinner for `processing` status
- [ ] Shows red X (❌) for `failed` status
- [ ] Shows purple pencil (✎) for `manual` status
- [ ] Shows yellow warning (⚠️) for stale translations

#### 1.3 Action Button Tests
- [ ] Edit button appears for `completed` and `manual` translations
- [ ] Re-translate button (↻) appears for completed translations
- [ ] Retry button appears only for `failed` translations
- [ ] Edit button triggers `onTranslationEdited` callback or opens editor
- [ ] Re-translate button initiates re-translation flow

#### 1.4 Progress Bar Tests
- [ ] Progress bar shows correct completion percentage
- [ ] Progress text shows "X/6 Complete" format
- [ ] Progress updates when status changes

#### 1.5 Panel Behavior Tests
- [ ] Close button calls `onClose`
- [ ] Clicking outside panel calls `onClose` (if applicable)
- [ ] Escape key closes panel
- [ ] Panel has correct ARIA attributes

---

### Task 2: Create TranslationEditor Test Suite

**File:** `/src/components/TranslationManagement/TranslationEditor/__tests__/TranslationEditor.test.tsx`

**Test Categories:**

#### 2.1 Rendering Tests
- [ ] Renders nothing when `isOpen` is false
- [ ] Renders modal when `isOpen` is true
- [ ] Displays source content in read-only section
- [ ] Displays current translation in editable textarea
- [ ] Shows language name in header (e.g., "Edit French Translation")
- [ ] Shows source language label

#### 2.2 Content Display Tests
- [ ] Source content section is read-only (not editable)
- [ ] Translation textarea is editable
- [ ] Pre-populates textarea with existing translation
- [ ] Shows character count (if applicable)

#### 2.3 Edit State Tests
- [ ] Save button disabled when no changes made
- [ ] Save button enabled when content changes
- [ ] Save button disabled when content is empty/invalid
- [ ] Tracks dirty state correctly

#### 2.4 Save Flow Tests
- [ ] Save button calls `onSave` with updated content
- [ ] Shows loading state during save
- [ ] Closes editor on successful save
- [ ] Translation marked as 'manual' status after save
- [ ] Error handling displays error message

#### 2.5 Cancel/Close Behavior Tests
- [ ] Cancel button with no changes calls `onCancel`
- [ ] Cancel button with unsaved changes shows confirmation
- [ ] Confirmation dialog offers Save, Discard, Cancel options
- [ ] "Save" in confirmation saves and closes
- [ ] "Discard" in confirmation discards and closes
- [ ] "Cancel" in confirmation returns to editor
- [ ] Escape key triggers cancel flow

#### 2.6 Accessibility Tests
- [ ] Modal has `role="dialog"` and `aria-modal="true"`
- [ ] Has proper `aria-labelledby` and `aria-describedby`
- [ ] Focus trapped within modal
- [ ] Focus returns to trigger on close

---

### Task 3: Create TranslationStatusWidget Test Suite

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx`

**Test Categories:**

#### 3.1 Summary Count Tests
- [ ] Displays count of complete translations
- [ ] Displays count of partial translations
- [ ] Displays count of pending translations
- [ ] Displays count of failed translations
- [ ] Shows "0" appropriately when no items in category
- [ ] Handles zero translations gracefully

#### 3.2 Progress Bar Tests
- [ ] Progress bar fills proportionally to completion percentage
- [ ] Progress at 0% shows empty bar
- [ ] Progress at 100% shows full bar
- [ ] Progress at 50% shows half-filled bar
- [ ] Progress bar has correct ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`)

#### 3.3 Data Update Tests
- [ ] UI re-renders when status counts change
- [ ] Loading state displayed while fetching data
- [ ] Error state displayed on fetch failure
- [ ] Empty state when no content exists

#### 3.4 Navigation Tests
- [ ] "View Details" link/button is rendered
- [ ] Clicking "View Details" calls `onViewDetails` callback
- [ ] Navigation includes correct parameters (if applicable)

#### 3.5 Accessibility Tests
- [ ] Widget has appropriate heading structure
- [ ] Status counts have clear labels
- [ ] Progress bar has descriptive `aria-label`

---

### Task 4: Create Test Utilities and Mocks

**File:** `/src/components/TranslationManagement/__tests__/test-utils.ts`

#### 4.1 Mock Data Factories
```typescript
// Create mock translation status data
const createMockTranslationStatus = (overrides?: Partial<TranslationStatus>) => {...}

// Create mock entity data (article, item, link)
const createMockEntity = (type: EntityType, overrides?: Partial<Entity>) => {...}

// Create mock translation summary for widget
const createMockTranslationSummary = (overrides?: Partial<TranslationSummary>) => {...}
```

#### 4.2 API Mocks
```typescript
// Mock useTranslationStatus hook
vi.mock('@/hooks/useTranslationStatus', () => ({
  useTranslationStatus: vi.fn()
}))

// Mock Supabase client for realtime subscriptions
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })
  }
}))
```

---

## Test File Structure

```
/src/components/TranslationManagement/
├── __tests__/
│   └── test-utils.ts                              # Shared mocks and factories
├── TranslationPreviewPanel/
│   └── __tests__/
│       └── TranslationPreviewPanel.test.tsx       # Panel tests (Task 1)
├── TranslationEditor/
│   └── __tests__/
│       └── TranslationEditor.test.tsx             # Editor tests (Task 2)
└── TranslationStatusWidget/
    └── __tests__/
        └── TranslationStatusWidget.test.tsx       # Widget tests (Task 3)
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/__tests__/test-utils.ts` | Shared test utilities and mock factories |
| `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.test.tsx` | TranslationPreviewPanel component tests |
| `/src/components/TranslationManagement/TranslationEditor/__tests__/TranslationEditor.test.tsx` | TranslationEditor component tests |
| `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx` | TranslationStatusWidget component tests |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/vitest.config.ts` | Add TranslationManagement to coverage include paths |

### Functions/Components Under Test (Read-Only Reference)

| Component | Location | Notes |
|-----------|----------|-------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Main test target |
| TranslationStatusItem | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Sub-component tested via panel |
| TranslationProgressBar | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Sub-component tested via panel |
| TranslationEditor | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Main test target |
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Main test target |

---

## Acceptance Criteria Checklist

### TranslationPreviewPanel Tests
- [ ] Component test suite exists for TranslationPreviewPanel component
- [ ] Tests verify component renders with mocked translation status data
- [ ] Tests verify correct status indicators display for all six languages
- [ ] Tests verify status indicators change appearance based on translation state
- [ ] Tests verify appropriate action buttons appear for each translation status
- [ ] Tests verify clicking edit button triggers expected callback or modal
- [ ] Tests verify clicking retry button initiates re-translation flow

### TranslationEditor Tests
- [ ] Component test suite exists for TranslationEditor component
- [ ] Tests verify component renders with source and translation content
- [ ] Tests verify source content displays in read-only section
- [ ] Tests verify translation content displays in editable text area
- [ ] Tests verify text input updates component state correctly
- [ ] Tests verify save button becomes enabled when content changes
- [ ] Tests verify save button remains disabled when content is invalid
- [ ] Tests verify successful save triggers API call with correct payload
- [ ] Tests verify successful save marks translation as manually reviewed
- [ ] Tests verify successful save closes the editor component
- [ ] Tests verify unsaved changes trigger confirmation prompt when closing
- [ ] Tests verify confirmation prompt offers save, discard, and cancel options

### TranslationStatusWidget Tests
- [ ] Component test suite exists for TranslationStatusWidget component
- [ ] Tests verify component displays count of complete translations
- [ ] Tests verify component displays count of partial translations
- [ ] Tests verify component displays count of pending translations
- [ ] Tests verify component displays count of failed translations
- [ ] Tests verify progress bar fills proportionally to completion percentage
- [ ] Tests verify progress bar updates when status counts change
- [ ] Tests verify view details link includes correct navigation parameters

### General Quality
- [ ] All component tests use appropriate mocking for Supabase client and API dependencies
- [ ] Tests isolate component behavior from external dependencies to ensure reliability
- [ ] Component tests achieve meaningful code coverage for rendering and interaction logic
- [ ] All tests pass consistently in both local development and continuous integration environments
- [ ] Test suite is maintainable with clear test descriptions and well-organized test structure

---

## Implementation Notes

### Testing Strategy
1. **Unit tests first** - Test individual components in isolation
2. **Mock external dependencies** - Supabase, API calls, hooks
3. **User-centric tests** - Test from user perspective using Testing Library best practices
4. **Accessibility included** - Verify ARIA attributes and keyboard navigation

### Mock Strategy
- Use `vi.fn()` for all callback props
- Mock `useTranslationStatus` hook to control test data
- Mock Supabase realtime subscriptions
- Create factory functions for consistent mock data

### Run Commands
```bash
# Run all translation management tests
npm test -- --filter="TranslationManagement"

# Run with coverage
npm test -- --coverage --filter="TranslationManagement"

# Run specific test file
npm test -- src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.test.tsx
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Components not yet implemented | Medium | High | Verify component existence before writing tests |
| Complex async flows hard to test | Medium | Medium | Use `waitFor`, `findBy*` queries; mock async operations |
| Flaky tests due to timing | Low | Medium | Avoid arbitrary timeouts; use proper async utilities |
| Mock drift from real implementation | Low | Medium | Keep mocks minimal; test contracts not internals |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Test Pattern Reference: `/src/components/ItemManager/components/ItemPreview/__tests__/ItemPreviewModal.test.tsx`
- Vitest Configuration: `/vitest.config.ts`
- Testing Library Docs: https://testing-library.com/docs/react-testing-library/intro/
