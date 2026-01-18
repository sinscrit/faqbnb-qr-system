# REQ-171: Update Test Coverage for Review Screen Redesign - Implementation Overview

**Document Created:** 2026-01-09 21:45:00 UTC
**Last Modified:** 2026-01-09 21:45:00 UTC
**Request Reference:** docs/gen_requests.md - Request #171
**Implementation Plan Reference:** docs/prd/Plan-094-UI-UX-Workflow-Improvements.md (Phase 5, Task 5.5)
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Status:** PENDING

---

## 1. Summary

This request implements comprehensive test coverage for the redesigned review screen (PreviewSaveStep) as part of the UI/UX Item Creation Workflow Improvements. The test suite validates:

1. **Content preview rendering** for all supported content types (video, photo, PDF, text, URL)
2. **Pre-populated fields** display correctly with accurate source information
3. **Title editing** functionality works as expected
4. **Empty state handling** manages missing/empty content gracefully

This task follows existing test patterns established in the codebase using **Vitest** and **React Testing Library**.

---

## 2. Background & Context

### 2.1 Review Screen Redesign (Plan-094, Phase 5)

The PreviewSaveStep component is being redesigned to:
- Show actual content previews instead of large "Add Media" / "Add Link" buttons
- Display pre-filled item details (Title, Room, Item Type, Purpose)
- Allow title editing (auto-generated or manual)
- Use the new ContentPreview component for rendering each content type
- Handle empty states when no content has been added

### 2.2 New Components to Test

| Component | Location | Purpose |
|-----------|----------|---------|
| `ContentPreview` | `components/shared/ContentPreview.tsx` (NEW) | Renders content previews for video, photo, PDF, text, URL |
| `PreviewSaveStep` | `components/steps/PreviewSaveStep.tsx` (MODIFIED) | Redesigned to show actual content and pre-populated fields |
| `titleGenerator` | `utils/titleGenerator.ts` (NEW) | Auto-generates article titles from purpose + item |

### 2.3 Existing Test Infrastructure

The codebase uses:
- **Vitest** as the test runner
- **React Testing Library** for component testing
- **@testing-library/user-event** for user interaction simulation
- **@testing-library/jest-dom** for custom matchers

Key existing test files providing patterns:
- `PreviewSaveStep.test.tsx` (405 lines) - Current PreviewSaveStep tests
- `ContentPieceCard.test.tsx` (385 lines) - Content type rendering patterns
- `ItemNameEditor.test.tsx` (289 lines) - Form field/input testing patterns
- `EmptyStateCard.test.tsx` (461 lines) - Empty state testing patterns

---

## 3. Implementation Tasks

### Task 1: Create ContentPreview Component Tests (NEW FILE)

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx`

#### 1.1 Test Content Type Rendering

Tests for each supported content type:

| Test Case | Description | Content Type |
|-----------|-------------|--------------|
| Video preview | Renders video thumbnail with duration badge | `video` |
| Photo preview | Renders image thumbnail | `photo` |
| PDF preview | Renders PDF icon with page count badge | `pdf` |
| Text preview | Renders truncated text with text icon | `text` |
| URL preview | Renders favicon, title, and domain | `url` |

**Example Test Structure:**
```typescript
describe('ContentPreview', () => {
  describe('video content', () => {
    it('renders video thumbnail');
    it('displays duration badge in mm:ss format');
    it('handles video without duration gracefully');
  });

  describe('photo content', () => {
    it('renders image thumbnail from blob URL');
    it('displays photo icon badge');
  });

  describe('pdf content', () => {
    it('renders PDF icon');
    it('displays page count badge');
    it('handles PDF without page count');
    it('uses singular "page" for count of 1');
  });

  describe('text content', () => {
    it('renders text preview with truncation at 100 chars');
    it('shows full text if under 100 chars');
    it('displays text icon');
  });

  describe('url content', () => {
    it('renders URL with title');
    it('renders URL with favicon when available');
    it('falls back to domain when no title');
    it('displays link icon');
  });
});
```

#### 1.2 Test Size Variants

```typescript
describe('size variants', () => {
  it('renders small size (64x64)');
  it('renders medium size (96x96)');
  it('renders large size (128x128)');
  it('defaults to medium when size not specified');
});
```

#### 1.3 Test Remove Button

```typescript
describe('remove button', () => {
  it('shows remove button when showRemove=true');
  it('hides remove button when showRemove=false');
  it('calls onRemove when clicked');
  it('disables remove button when disabled');
});
```

#### 1.4 Test Accessibility

```typescript
describe('accessibility', () => {
  it('has appropriate aria-label for content type');
  it('remove button has aria-label');
  it('image has alt text describing content type');
});
```

---

### Task 2: Update PreviewSaveStep Tests (MODIFY FILE)

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`

#### 2.1 Add Pre-populated Fields Tests

New test section for verifying pre-populated item details:

```typescript
describe('pre-populated fields', () => {
  it('displays room from currentItem.room');
  it('displays item type from currentItem.itemType');
  it('displays purpose from currentItem.purpose');
  it('displays auto-generated title in name field');
  it('renders room as read-only text (not editable)');
  it('renders item type as read-only text');
  it('renders purpose as read-only text');
});
```

#### 2.2 Enhanced Title Editing Tests

Expand existing item name editing tests:

```typescript
describe('title editing', () => {
  it('displays auto-generated title initially');
  it('allows user to edit title');
  it('preserves edited title on re-render');
  it('shows character counter during editing');
  it('validates title is not empty before save');
  it('validates title is not whitespace only');
  it('shows warning when title is near max length');
  it('disables title editing when saving');
});
```

#### 2.3 Content Preview Grid Tests

New test section for ContentPreview component integration:

```typescript
describe('content preview grid', () => {
  it('renders ContentPreview for each content piece');
  it('displays correct content count badge');
  it('renders content in correct order');
  it('handles reordering via drag and drop');
  it('removes content piece when remove clicked');
});
```

#### 2.4 Enhanced Empty State Tests

Expand empty state tests for the redesigned component:

```typescript
describe('empty state handling', () => {
  it('shows empty state message when no content');
  it('shows "Add Content" CTA button');
  it('CTA navigates to content type selection');
  it('hides content grid when empty');
  it('disables save button when no content');
  it('shows validation message if save attempted with no content');
});
```

---

### Task 3: Create TitleGenerator Unit Tests (NEW FILE)

**File:** `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts`

Tests for the auto-title generation utility:

```typescript
describe('generateArticleTitle', () => {
  describe('with purpose', () => {
    it('generates "How to Use - Fridge" for how-to-use purpose');
    it('generates "How to Clean - Oven" for how-to-clean purpose');
    it('generates "Troubleshooting - Dishwasher" for troubleshooting purpose');
    it('generates "Safety Information - Stove" for safety-info purpose');
    it('generates "Maintenance - Washing Machine" for maintenance purpose');
    it('generates "Features & Tips - TV" for features purpose');
    it('generates "Other - Item" for other purpose');
  });

  describe('without purpose', () => {
    it('returns just the specific item name');
    it('handles null purpose');
    it('handles undefined purpose');
  });

  describe('edge cases', () => {
    it('handles empty specific item name');
    it('handles special characters in item name');
    it('handles very long item names');
    it('preserves casing of item name');
  });
});
```

---

### Task 4: Add Integration Tests

**File:** `src/components/ItemCreationWorkflow/__tests__/ReviewScreenRedesign.integration.test.tsx` (NEW)

Integration tests for the complete review screen flow:

```typescript
describe('Review Screen Redesign Integration', () => {
  describe('complete flow', () => {
    it('displays pre-populated fields after workflow navigation');
    it('shows auto-generated title based on purpose selection');
    it('allows title editing and saves correct value');
    it('renders all content pieces in preview grid');
    it('saves item with correct data');
  });

  describe('content types in context', () => {
    it('video content displays with duration in preview');
    it('photo content displays thumbnail in preview');
    it('pdf content displays page count in preview');
    it('text content displays truncated preview');
    it('url content displays with title and domain');
  });

  describe('empty state flow', () => {
    it('shows empty state when entering without content');
    it('Add Content CTA navigates to content selection');
    it('returning from content creation shows new content');
  });
});
```

---

## 4. Authorized Files and Functions for Modification

### 4.1 Test Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx` | Unit tests for new ContentPreview component |
| `src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts` | Unit tests for title generation utility |
| `src/components/ItemCreationWorkflow/__tests__/ReviewScreenRedesign.integration.test.tsx` | Integration tests for redesigned review screen |

### 4.2 Test Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | Add pre-populated fields, enhanced title editing, content preview grid, empty state tests |

### 4.3 Test Helper Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` | Add `createMockCurrentItemWithPurpose()`, `createMockContentPreviewProps()` |
| `src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts` | Add `PURPOSE_TYPES` constant, update mock data generators |

---

## 5. Test Fixtures Required

### 5.1 Content Piece Fixtures

```typescript
// Mock content pieces for each type
const mockVideoContent: ContentPiece = {
  id: 'video-1',
  type: 'video',
  data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }), duration: 45 },
  order: 0,
};

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 0,
};

const mockPdfContent: ContentPiece = {
  id: 'pdf-1',
  type: 'pdf',
  data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 5 },
  order: 0,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'Sample text content for testing.' },
  order: 0,
};

const mockUrlContent: ContentPiece = {
  id: 'url-1',
  type: 'url',
  data: {
    type: 'url',
    url: 'https://example.com',
    title: 'Example Website',
    thumbnailUrl: 'https://example.com/thumb.jpg',
  },
  order: 0,
};
```

### 5.2 CurrentItemState with Purpose

```typescript
const mockCurrentItemWithPurpose: CurrentItemState = {
  room: 'kitchen',
  itemType: 'appliance',
  specificItem: 'Fridge',
  itemName: 'How to Clean - Fridge',
  purpose: 'how-to-clean',
  contentSource: 'create-new',
  contentType: 'video',
  content: [mockVideoContent],
};

const mockEmptyCurrentItem: CurrentItemState = {
  room: 'kitchen',
  itemType: 'appliance',
  specificItem: 'Fridge',
  itemName: '',
  purpose: null,
  contentSource: 'create-new',
  contentType: null,
  content: [],
};
```

---

## 6. Testing Patterns to Follow

### 6.1 Component Test Structure

Follow the established pattern from ContentPieceCard.test.tsx:

```typescript
/**
 * ComponentName Component Tests
 *
 * @module ItemCreationWorkflow/components/path/__tests__/ComponentName.test
 * @lastModified YYYY-MM-DD
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

// Mock setup
beforeAll(() => { /* global mocks */ });
beforeEach(() => { jest.clearAllMocks(); });

// Test fixtures
const mockData = { /* ... */ };

describe('ComponentName', () => {
  const defaultProps = { /* ... */ };

  describe('category 1', () => { /* tests */ });
  describe('category 2', () => { /* tests */ });
  describe('accessibility', () => { /* tests */ });
});
```

### 6.2 Utility Function Test Structure

Follow the pattern from useWorkflowState.test.ts:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { utilityFunction } from '../utilityFile';

describe('utilityFunction', () => {
  describe('normal cases', () => { /* tests */ });
  describe('edge cases', () => { /* tests */ });
});
```

### 6.3 Integration Test Structure

Follow the pattern from QRGeneration.integration.test.tsx:

```typescript
// Controllable mock state
let mockState = { /* ... */ };
const resetMockState = () => { /* reset */ };

vi.mock('@/hooks/useSomeHook', () => ({ /* mock */ }));

describe('Feature Integration', () => {
  beforeEach(() => { resetMockState(); });

  it('complete flow test', async () => { /* test */ });
});
```

---

## 7. Acceptance Criteria Mapping

| Acceptance Criteria | Test Coverage |
|---------------------|---------------|
| Tests verify content preview renders correctly for each supported content type | Task 1.1 - Content type rendering tests |
| Tests confirm pre-populated fields display accurate source information | Task 2.1 - Pre-populated fields tests |
| Tests validate title editing functionality works as expected | Task 2.2 - Title editing tests |
| Tests ensure empty state scenarios are handled gracefully without errors | Task 2.4 - Empty state handling tests |
| All new tests pass consistently in the test suite | Run `npm test` to verify |

---

## 8. Dependencies

### 8.1 Prerequisite Tasks from Plan-094

This test task depends on the completion of:

| Task ID | Description | Status |
|---------|-------------|--------|
| 5.1 | Create ContentPreview Component | Required |
| 5.2 | Redesign PreviewSaveStep Layout | Required |
| 5.3 | Update Content Display | Required |
| 5.4 | Pre-populate Fields | Required |
| 1.2 | Create Title Generator Utility | Required |

### 8.2 No External Dependencies

All testing dependencies are already installed in the project:
- `vitest` (test runner)
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`

---

## 9. Estimated Effort

| Task | Estimate | Confidence |
|------|----------|------------|
| Task 1: ContentPreview Tests | 2-3 hours | High |
| Task 2: PreviewSaveStep Tests Update | 2-3 hours | High |
| Task 3: TitleGenerator Tests | 1 hour | High |
| Task 4: Integration Tests | 2-3 hours | Medium |
| **Total** | **7-10 hours** | **High** |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ContentPreview component API changes | Medium | Medium | Coordinate with component development, update tests if API changes |
| Flaky integration tests | Low | Medium | Use waitFor/waitForElementToBeRemoved patterns, avoid timing-dependent tests |
| Mock data not matching actual types | Low | High | Use TypeScript strict mode, import types from source |
| Test coverage gaps | Low | Medium | Review coverage report, add missing cases |

---

## 11. References

- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Request Document:** `/docs/gen_requests.md` (REQ-171)
- **Existing Test Patterns:**
  - `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
  - `/src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPieceCard.test.tsx`
  - `/src/components/ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor.test.tsx`
  - `/src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx`
- **Vitest Config:** `/vitest.config.ts`
- **Test Setup:** `/vitest.setup.ts`

---

## 12. Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-01-09 | 1.0 | Technical Lead | Initial document creation |
