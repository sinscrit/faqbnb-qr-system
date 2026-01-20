# REQ-E05-034: Write Component Tests - Implementation Overview

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 15:00 UTC
**Request ID:** REQ-E05-034
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.6
**Status:** Ready for Detailed Breakdown

---

## 1. Document References

| Reference | Location |
|-----------|----------|
| Requirements Document | `/docs/gen_requests_epic5.md` (REQ-E05-034) |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` |
| Test Infrastructure | `/vitest.config.ts` |
| Test Setup | `/vitest.setup.ts` |
| Component Test Pattern | `/src/components/ItemManager/components/ItemPreview/__tests__/ItemPreviewModal.test.tsx` |
| Simple Component Test Pattern | `/src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx` |
| Hook Test Pattern | `/src/components/ItemManager/hooks/__tests__/useItemSearch.test.ts` |

---

## 2. Request Summary

**From gen_requests_epic5.md (REQ-E05-034):**

The translation management system needs comprehensive component tests for TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget to verify rendering behavior, user interactions, and integration with data hooks.

**Implementation Plan Task 7.6:**
- Test TranslationPreviewPanel rendering
- Test TranslationEditor save flow
- Test TranslationStatusWidget counts

---

## 3. Testing Overview

### Purpose

This task creates comprehensive component tests for the three primary UI components in the Translation Management system. The tests will ensure correct rendering behavior, user interaction handling, accessibility compliance, and integration with the underlying hooks and API calls.

### Testing Framework

The project uses **Vitest** with **React Testing Library** and the following setup:

| Tool | Purpose |
|------|---------|
| `vitest` | Test runner with watch mode, coverage reporting |
| `@testing-library/react` | Component rendering and DOM queries |
| `@testing-library/user-event` | Realistic user interaction simulation |
| `vitest-axe` | Accessibility testing matchers |
| `@vitejs/plugin-react` | React JSX transformation |
| `jsdom` | Browser environment simulation |

### Test Configuration

From `/vitest.config.ts`:
- Globals enabled (no need to import `describe`, `it`, `expect`)
- jsdom environment
- Setup file at `./vitest.setup.ts` includes jest-dom matchers
- 10 second timeout for integration tests
- Coverage via V8 provider

---

## 4. Technical Context

### Existing Test Patterns to Follow

| Pattern | Reference File | Usage |
|---------|----------------|-------|
| Modal/Panel testing | `/src/components/ItemManager/components/ItemPreview/__tests__/ItemPreviewModal.test.tsx` | Dialog rendering, open/close, action buttons, keyboard navigation |
| Card component testing | `/src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx` | Props testing, variants, accessibility, styling verification |
| Form interaction testing | `/src/components/ItemManager/components/AssetPanel/__tests__/AssetDropZone.test.tsx` | User input, validation, error states |
| Hook mocking patterns | `/src/components/ItemManager/hooks/__tests__/useItemSearch.test.ts` | State simulation, computed values |

### Components Under Test

| Component | Location | Primary Responsibilities |
|-----------|----------|-------------------------|
| TranslationPreviewPanel | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Slide-in panel showing translation status for all languages |
| TranslationEditor | `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Modal for editing translation content with save/cancel flow |
| TranslationStatusWidget | `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Dashboard widget showing translation counts and progress |

### Dependencies to Mock

| Dependency | Mock Strategy |
|------------|---------------|
| `useTranslationStatus` hook | Return controllable test data with loading/error states |
| `useTranslationRealtime` hook | Simulate subscription events for status updates |
| Translation API calls | Mock fetch/API responses for save, retry, re-translate |
| Supabase client | Mock for any direct database interactions |
| `next/navigation` | Mock `useRouter` for navigation testing |
| `next-intl` | Mock `useTranslations` for i18n strings |

---

## 5. Test File Structure

### Directory Structure

```
/src/components/TranslationManagement/
├── __tests__/
│   ├── TranslationPreviewPanel.test.tsx   # Main panel tests
│   ├── TranslationEditor.test.tsx         # Editor modal tests
│   └── TranslationStatusWidget.test.tsx   # Dashboard widget tests
├── TranslationPreviewPanel/
│   └── __tests__/
│       ├── TranslationStatusItem.test.tsx      # Individual item tests
│       └── TranslationProgressBar.test.tsx     # Progress bar tests
├── TranslationEditor/
│   └── __tests__/
│       └── TranslationDiffView.test.tsx        # Diff view tests (if complex)
└── TranslationStatusWidget/
    └── __tests__/
        └── (covered by parent test file)
```

**Note:** Based on acceptance criteria, the test files should be created at:
- `/src/components/__tests__/TranslationPreviewPanel.test.tsx`
- `/src/components/__tests__/TranslationEditor.test.tsx`
- `/src/components/__tests__/TranslationStatusWidget.test.tsx`

---

## 6. Mock Data Definitions

### Translation Status Mock Data

```typescript
// Mock data factory for translation status
const createMockTranslationStatus = (overrides?: Partial<TranslationLanguageStatus>): TranslationLanguageStatus => ({
  language_code: 'fr',
  status: 'completed',
  translated_content: {
    title: 'Titre traduit',
    description: 'Description traduite',
  },
  translated_at: '2026-01-20T10:00:00Z',
  updated_at: '2026-01-20T10:00:00Z',
  is_stale: false,
  reviewed_by: null,
  ...overrides,
});

// Full translation status map for all languages
const mockTranslationStatusMap: TranslationStatusMap = {
  en: { status: 'original', ... },
  fr: { status: 'completed', ... },
  es: { status: 'completed', ... },
  de: { status: 'pending', ... },
  nl: { status: 'processing', ... },
  it: { status: 'failed', ... },
};

// Mock summary for widget
const mockTranslationSummary: TranslationStatusSummary = {
  total: 30,
  complete: 18,
  partial: 6,
  pending: 4,
  failed: 2,
};
```

---

## 7. Implementation Tasks

### Task 7.1: TranslationPreviewPanel Test Suite

**File:** `/src/components/__tests__/TranslationPreviewPanel.test.tsx`

**Test Categories:**

1. **Rendering Tests**
   - Renders with no translations showing empty state message
   - Renders translation rows for each configured language (6 languages)
   - Displays source content in header section
   - Shows entity type and name in panel title
   - Loading state displays skeleton loaders
   - Error state displays error message with retry option

2. **Status Indicator Tests**
   - Displays "Complete" status with green indicator for finished translations
   - Displays "Pending" status with yellow indicator for queued translations
   - Displays "Failed" status with red indicator for error translations
   - Displays "Manual" status with purple indicator for manually edited
   - Displays "Stale" status with warning indicator when source changed
   - Displays "Processing" status with animated indicator

3. **Action Button Tests**
   - Close button triggers onClose callback when clicked
   - Edit button opens TranslationEditor with correct translation data
   - Retry button triggers retryTranslation API call with correct parameters
   - Re-translate button triggers re-translation job creation
   - Re-translate All button queues jobs for all languages
   - Buttons disabled during loading/processing states

4. **Content Display Tests**
   - Translation content preview truncates long text with ellipsis
   - "View Original" toggle switches between translated and original content
   - Language labels display in current interface language
   - Timestamp display showing "Last updated 2 hours ago" format

5. **Responsive Tests**
   - Responsive layout adjusts for mobile viewport widths
   - Panel is full-width on mobile (<768px)

6. **Accessibility Tests**
   - Focus trap within panel when open
   - Escape key closes panel
   - Tab navigation through language items
   - ARIA labels on status indicators
   - Screen reader announces status changes

**Estimated Effort:** 3 story points

### Task 7.2: TranslationEditor Test Suite

**File:** `/src/components/__tests__/TranslationEditor.test.tsx`

**Test Categories:**

1. **Rendering Tests**
   - Renders with existing translation content pre-filled in textarea
   - Renders with empty textarea when no translation exists
   - Displays original source content in read-only reference section
   - Displays language indicator with correct language name and flag
   - Displays character count updating as user types
   - Displays word count alongside character count

2. **Form Validation Tests**
   - Save button disabled when textarea is empty
   - Save button enabled when valid content exists
   - Validation error when content exceeds maximum length
   - Character counter shows warning at threshold

3. **Save Flow Tests**
   - Save button triggers updateTranslation API call with textarea content
   - Successful save shows success toast notification
   - Successful save closes editor and refreshes parent component
   - API error displays error message below textarea
   - Loading spinner appears during save operation
   - Save button disabled during save to prevent double submission

4. **Cancel/Close Tests**
   - Cancel button closes editor without saving changes
   - Dirty state prevents close without confirmation dialog
   - Confirmation dialog appears when closing with unsaved changes
   - Confirmation dialog discard option closes without saving
   - Confirmation dialog keep editing option returns to editor

5. **Keyboard Shortcut Tests**
   - Cmd+S/Ctrl+S triggers save
   - Escape triggers cancel/close

6. **Accessibility Tests**
   - Focus management on open
   - ARIA labels for form elements
   - Error announcements for screen readers

**Estimated Effort:** 3 story points

### Task 7.3: TranslationStatusWidget Test Suite

**File:** `/src/components/__tests__/TranslationStatusWidget.test.tsx`

**Test Categories:**

1. **Rendering Tests**
   - Renders with zero translations showing empty state
   - Displays count of pending translation jobs
   - Displays count of completed translation jobs
   - Displays count of failed translation jobs
   - Displays total translation count across all statuses
   - Displays percentage completion progress bar
   - Progress bar visual width matches calculated percentage
   - Compact mode renders smaller layout for dashboard cards

2. **Interactive Tests**
   - Counts update when useTranslationStatus hook data changes
   - Clicking pending count filters to show only pending translations
   - Clicking failed count opens retry all failed dialog
   - Refresh button triggers data refetch
   - Tooltip shows breakdown on hover over progress bar

3. **State Tests**
   - Loading skeleton appears during initial data fetch
   - Error state displays error message with retry button
   - Auto-refresh when polling is enabled in hook configuration
   - Real-time updates when new translation job completes
   - Badge indicator shows alert when failed count is non-zero

4. **Accessibility Tests**
   - ARIA labels for progress bar
   - Interactive counts are keyboard accessible
   - Status announcements for screen readers

**Estimated Effort:** 2 story points

### Task 7.4: Test Infrastructure Setup

**Requirements:**
- Create mock factory functions for translation data
- Create reusable test utilities for common assertions
- Configure test coverage thresholds
- Add test script commands if needed

**Estimated Effort:** 1 story point

### Task 7.5: Hook Mocking Utilities

**File:** `/src/components/TranslationManagement/__tests__/testUtils.ts`

**Requirements:**
- Mock `useTranslationStatus` with controllable return values
- Mock `useTranslationRealtime` with event simulation
- Mock API calls with configurable responses and delays
- Cleanup utilities for timers and subscriptions

**Estimated Effort:** 1 story point

---

## 8. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation Task |
|---------------------|---------------------|
| Test file created at `/src/components/__tests__/TranslationPreviewPanel.test.tsx` | Task 7.1 |
| Test file created at `/src/components/__tests__/TranslationEditor.test.tsx` | Task 7.2 |
| Test file created at `/src/components/__tests__/TranslationStatusWidget.test.tsx` | Task 7.3 |
| Tests use React Testing Library for component rendering | All tasks |
| Tests use Jest as the test runner with appropriate matchers | All tasks (Vitest compatible) |
| Tests use @testing-library/user-event for realistic user interaction | All tasks |
| TranslationPreviewPanel renders with no translations showing empty state | Task 7.1 |
| TranslationPreviewPanel renders translation rows for each configured language | Task 7.1 |
| TranslationPreviewPanel displays status indicators with correct colors | Task 7.1 |
| TranslationPreviewPanel close button triggers onClose callback | Task 7.1 |
| TranslationPreviewPanel edit button opens TranslationEditor | Task 7.1 |
| TranslationPreviewPanel retry button triggers API call | Task 7.1 |
| TranslationEditor renders with existing content pre-filled | Task 7.2 |
| TranslationEditor displays character count updating as user types | Task 7.2 |
| TranslationEditor save button disabled when textarea empty | Task 7.2 |
| TranslationEditor save triggers updateTranslation API call | Task 7.2 |
| TranslationEditor confirmation dialog on close with unsaved changes | Task 7.2 |
| TranslationEditor keyboard shortcuts work (Cmd+S, Escape) | Task 7.2 |
| TranslationStatusWidget displays counts for all statuses | Task 7.3 |
| TranslationStatusWidget displays percentage progress bar | Task 7.3 |
| TranslationStatusWidget counts update when hook data changes | Task 7.3 |
| TranslationStatusWidget clicking pending count filters items | Task 7.3 |
| API mock functions return realistic translation status data | Task 7.5 |
| Mock data includes all required fields | Task 7.5 |
| All tests clean up timers and subscriptions | All tasks |
| Tests verify accessibility attributes (ARIA labels, roles) | All tasks |
| Tests verify correct CSS classes for status states | All tasks |
| Tests achieve minimum 80% code coverage | All tasks |
| Tests execute quickly (under 10 seconds) | All tasks |
| Test descriptions use clear naming convention | All tasks |
| Tests follow arrange-act-assert pattern | All tasks |

---

## 9. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/__tests__/TranslationPreviewPanel.test.tsx` | **PRIMARY TARGET** - Panel component tests |
| `/src/components/__tests__/TranslationEditor.test.tsx` | **PRIMARY TARGET** - Editor component tests |
| `/src/components/__tests__/TranslationStatusWidget.test.tsx` | **PRIMARY TARGET** - Widget component tests |
| `/src/components/TranslationManagement/__tests__/testUtils.ts` | Shared mock utilities and test helpers |

### Files to MODIFY (if needed)

| File Path | Modification |
|-----------|--------------|
| `/vitest.config.ts` | Add coverage include paths for TranslationManagement if not covered |
| `/package.json` | Add test scripts if needed (likely already configured) |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/components/ItemPreview/__tests__/ItemPreviewModal.test.tsx` | Modal/panel testing patterns |
| `/src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx` | Simple component testing patterns |
| `/src/components/ItemManager/hooks/__tests__/useItemSearch.test.ts` | Hook mocking patterns |
| `/vitest.setup.ts` | Available globals and matchers |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Component under test |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Component under test |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Component under test |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Type definitions |
| `/src/hooks/useTranslationStatus.ts` | Hook to mock |
| `/src/hooks/useTranslationRealtime.ts` | Hook to mock |

---

## 10. Dependencies and Blockers

### Required Before Implementation

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-E05-006: TranslationPreviewPanel component | Required | Component must exist to test |
| REQ-E05-009: TranslationEditor component | Required | Component must exist to test |
| REQ-E05-013: TranslationStatusWidget component | Required | Component must exist to test |
| REQ-E05-005: TranslationManagement.types.ts | Required | Types needed for mock data |
| REQ-E05-010: useTranslationStatus hook | Required | Hook to mock in tests |
| REQ-E05-011: useTranslationRealtime hook | Optional | Can stub if not complete |

### Unblocks

| Task | Description |
|------|-------------|
| Phase 7 completion | Tests validate all Epic 5 components work correctly |
| Production deployment | Test coverage enables confident releases |
| Future refactoring | Tests prevent regression during updates |

---

## 11. Implementation Notes

### Test Naming Convention

Follow the pattern: `"should [expected behavior] when [condition]"`

Examples:
- `"should display empty state message when no translations exist"`
- `"should trigger onClose callback when close button is clicked"`
- `"should show loading spinner when save operation is in progress"`

### Mock Hook Pattern

```typescript
// Mock useTranslationStatus hook
vi.mock('@/hooks/useTranslationStatus', () => ({
  useTranslationStatus: vi.fn(() => ({
    data: mockTranslationStatusMap,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

// Override in specific tests
const mockUseTranslationStatus = vi.mocked(useTranslationStatus);
mockUseTranslationStatus.mockReturnValue({
  data: null,
  isLoading: true,
  error: null,
  refetch: vi.fn(),
});
```

### API Mock Pattern

```typescript
// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  });
});

// Simulate API delay
mockFetch.mockImplementation(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ok: true, json: async () => ({ success: true }) };
});
```

### Accessibility Testing Pattern

```typescript
import { axe, toHaveNoViolations } from 'vitest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(
    <TranslationPreviewPanel {...defaultProps} />
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Cleanup Pattern

```typescript
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  cleanup(); // React Testing Library cleanup
});
```

---

## 12. Testing Considerations

### Coverage Requirements

- Minimum 80% code coverage for component logic
- 100% coverage for critical paths (save flow, error handling)
- Branch coverage for conditional rendering

### Performance

- Tests should complete in under 10 seconds for the entire suite
- Use `vi.useFakeTimers()` for animation and delay testing
- Avoid unnecessary waits with proper query strategies

### Maintainability

- Use data-testid sparingly, prefer semantic queries
- Query priority: role > label > placeholder > text > testId
- Create reusable render functions for common setups
- Document complex mock setups

---

## 13. Example Test Structure

```typescript
/**
 * TranslationPreviewPanel Component Tests
 *
 * Tests cover:
 * - Rendering states (loading, error, empty, populated)
 * - Status indicator display
 * - Action button interactions
 * - Accessibility compliance
 *
 * @module TranslationManagement/__tests__/TranslationPreviewPanel.test
 * @created 2026-01-20
 * @requestId REQ-E05-034
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TranslationPreviewPanel } from '../TranslationManagement/TranslationPreviewPanel';

// =============================================================================
// Mock Setup
// =============================================================================

vi.mock('@/hooks/useTranslationStatus');
vi.mock('@/hooks/useTranslationRealtime');

// =============================================================================
// Mock Data
// =============================================================================

const mockSourceContent = {
  title: 'How to Use the Dishwasher',
  description: 'Load dishes on the lower and upper racks...',
};

const defaultProps = {
  entityType: 'article' as const,
  entityId: 'test-article-1',
  sourceLanguage: 'en' as const,
  sourceContent: mockSourceContent,
  isOpen: true,
  onClose: vi.fn(),
};

// =============================================================================
// Test Setup
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Rendering Tests
// =============================================================================

describe('TranslationPreviewPanel', () => {
  describe('Rendering', () => {
    it('should render translation rows for each configured language', () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      // Verify all 6 languages are displayed
      expect(screen.getByText(/Francais/i)).toBeInTheDocument();
      expect(screen.getByText(/Espanol/i)).toBeInTheDocument();
      expect(screen.getByText(/Deutsch/i)).toBeInTheDocument();
      expect(screen.getByText(/Nederlands/i)).toBeInTheDocument();
      expect(screen.getByText(/Italiano/i)).toBeInTheDocument();
    });

    // Additional tests...
  });

  // Additional test categories...
});
```

---

## 14. Related Documents

- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [gen_requests_epic5.md](./gen_requests_epic5.md) - REQ-E05-034
- [REQ-E05-006-create-translationpreviewpanel-component-overview.md](./REQ-E05-006-create-translationpreviewpanel-component-overview.md)
- [REQ-E05-009-create-translationeditor-component-overview.md](./REQ-E05-009-create-translationeditor-component-overview.md)
- [REQ-E05-013-create-translationstatuswidget-component-overview.md](./REQ-E05-013-create-translationstatuswidget-component-overview.md)
- [REQ-E05-032-write-unit-tests-for-hooks-overview.md](./REQ-E05-032-write-unit-tests-for-hooks-overview.md)

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task: Write Component Tests for Translation Management UI Components*
