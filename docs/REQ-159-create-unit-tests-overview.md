# REQ-159: Unit Tests for Purpose Selection Step Component - Implementation Overview

**Document Created:** 2026-01-09 23:45 UTC
**Last Modified:** 2026-01-09 23:45 UTC
**Request ID:** REQ-159
**Implementation Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
**Phase:** 2 - New Purpose Step
**Task ID:** 2.3

---

## 1. Summary

Create comprehensive unit tests for the PurposeStep component that verify state management, navigation behavior, auto-advance functionality, keyboard navigation, and accessibility compliance. These tests ensure the purpose selection interface functions correctly and meets WCAG accessibility standards.

---

## 2. Background & Context

### 2.1 Current State

The PurposeStep component is being created as part of Phase 2 of the UI/UX Workflow Improvements (Plan-094). This is a new component that allows users to select the purpose/intent of their item content (e.g., "How to Use", "How to Clean", "Troubleshooting").

The component follows existing patterns established by similar selection step components in the ItemCreationWorkflow:
- `ItemTypeStep` - Selection grid with cards, keyboard navigation, accessibility attributes
- `RoomSelectionStep` - Room card selection with similar interaction patterns
- `ContentTypeStep` - Radio group selection pattern

### 2.2 Dependencies

The PurposeStep component (Task 2.1) and its workflow integration (Task 2.2) must be completed before these tests can be executed. The tests should be developed in parallel with or immediately after component creation.

### 2.3 Test Framework & Patterns

The codebase uses the following test stack:
- **Vitest** - Test runner (configured in `vitest.config.ts`)
- **React Testing Library** - Component testing (`@testing-library/react`)
- **user-event** - User interaction simulation (`@testing-library/user-event`)
- **Jest DOM** - DOM matchers (`@testing-library/jest-dom`)

**Established test file location pattern:**
```
src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx
```

---

## 3. Requirements from REQ-159

### 3.1 Acceptance Criteria

| # | Criterion | Test Category |
|---|-----------|---------------|
| 1 | Tests verify that selecting a purpose correctly updates the component state | State Management |
| 2 | Tests verify the step auto-advances to the next step after purpose selection | Auto-advance Behavior |
| 3 | Tests verify keyboard navigation allows users to navigate and select purposes using keyboard only | Keyboard Navigation |
| 4 | Tests verify proper ARIA labels, roles, and other accessibility attributes are present | Accessibility |
| 5 | Tests achieve at least 90% code coverage for the purpose selection component | Coverage |
| 6 | All tests pass consistently and execute in under 5 seconds | Performance |
| 7 | Test descriptions clearly communicate what behavior is being validated | Documentation |

---

## 4. Technical Approach

### 4.1 Test File Structure

Following the established pattern from `ItemTypeStep.test.tsx` and `ContentTypeStep.test.tsx`:

```typescript
/**
 * PurposeStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test
 * @lastModified 2026-01-09 (REQ-159)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurposeStep } from '../PurposeStep';
import { PURPOSE_TYPES, PURPOSE_LABELS } from '../../../utils/constants';

describe('PurposeStep', () => {
  const defaultProps = {
    currentPurpose: null,
    onSelectPurpose: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Test sections follow...
});
```

### 4.2 Test Categories

#### 4.2.1 Rendering Tests
Verify the component renders all expected elements correctly.

```typescript
describe('Rendering', () => {
  it('renders step title "What is the purpose of this content?"');
  it('renders step description');
  it('renders all 7 purpose type options');
  it('renders purpose type labels correctly');
  it('renders purpose type descriptions');
  it('renders icons for each purpose type');
  it('applies custom className');
});
```

#### 4.2.2 State Management Tests (Acceptance Criterion #1)
Verify purpose selection updates component state correctly.

```typescript
describe('Selection State Management', () => {
  it('calls onSelectPurpose when clicking How to Use');
  it('calls onSelectPurpose when clicking How to Clean');
  it('calls onSelectPurpose when clicking Troubleshooting');
  it('calls onSelectPurpose when clicking Safety Information');
  it('calls onSelectPurpose when clicking Maintenance');
  it('calls onSelectPurpose when clicking Features & Tips');
  it('calls onSelectPurpose when clicking Other');
  it('shows selected state for currentPurpose');
  it('shows unselected state for non-selected purposes');
  it('only one purpose can be selected at a time');
  it('calls onSelectPurpose with correct type for each option');
});
```

#### 4.2.3 Auto-advance Behavior Tests (Acceptance Criterion #2)
Verify the component auto-advances after purpose selection.

```typescript
describe('Auto-advance Behavior', () => {
  it('provides visual feedback immediately on selection');
  it('calls onNext after brief delay for visual feedback');
  it('auto-advance delay is configurable or follows design spec');
  it('does not auto-advance if component unmounts during delay');
  it('clears auto-advance timer on new selection');
  it('auto-advance works for all purpose types');
});
```

#### 4.2.4 Keyboard Navigation Tests (Acceptance Criterion #3)
Verify full keyboard accessibility.

```typescript
describe('Keyboard Navigation', () => {
  it('purpose cards are focusable with Tab');
  it('Enter key triggers selection');
  it('Space key triggers selection');
  it('has visible focus ring on focus');
  it('Arrow keys navigate between purpose cards');
  it('ArrowRight moves focus to next card');
  it('ArrowLeft moves focus to previous card');
  it('ArrowDown moves focus to card below (in grid)');
  it('ArrowUp moves focus to card above (in grid)');
  it('focus wraps at grid boundaries (optional)');
});
```

#### 4.2.5 Accessibility Tests (Acceptance Criterion #4)
Verify ARIA compliance and screen reader support.

```typescript
describe('Accessibility', () => {
  it('has radiogroup role on cards container');
  it('has aria-label on radiogroup');
  it('all purpose options have radio role');
  it('each card has aria-checked attribute');
  it('each card has aria-describedby for description');
  it('aria-checked is true for selected purpose');
  it('aria-checked is false for unselected purposes');
  it('icons have aria-hidden="true"');
  it('has descriptive aria-label on each option');
  it('focus is managed correctly during navigation');
});
```

#### 4.2.6 Navigation Tests
Verify workflow navigation behavior.

```typescript
describe('Navigation', () => {
  it('Continue button is disabled when no purpose selected');
  it('Continue button is enabled when a purpose is selected');
  it('calls onNext when Continue is clicked with valid selection');
  it('does not call onNext when Continue is clicked without selection');
  it('Continue button has disabled styling when canNext is false');
  it('Continue button has enabled styling when canNext is true');
});
```

#### 4.2.7 Edge Cases & Styling
Cover edge cases and visual requirements.

```typescript
describe('Edge Cases', () => {
  it('renders with pre-selected purpose if provided');
  it('handles rapid selection changes without errors');
  it('cleans up timers on unmount');
});

describe('Styling', () => {
  it('applies correct grid classes for responsive layout');
  it('buttons have minimum touch target size (48px)');
  it('buttons have touch-manipulation for mobile');
  it('selected button has correct styling (border, background)');
  it('unselected buttons have hover states');
  it('buttons have active scale transition');
});
```

### 4.3 Mock Data

```typescript
// Constants to test against (from constants.ts)
const EXPECTED_PURPOSE_TYPES = [
  'how-to-use',
  'how-to-clean',
  'troubleshooting',
  'safety-info',
  'maintenance',
  'features',
  'other',
] as const;

const EXPECTED_PURPOSE_LABELS = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};
```

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx` | Main unit test file for PurposeStep component |

### 5.2 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Component under test |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | PurposeType and related types |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx` | Reference pattern for similar tests |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx` | Reference pattern for selection tests |

### 5.3 Exports to Update

| File Path | Export | Purpose |
|-----------|--------|---------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/index.ts` | `PurposeStep.test` | Export test file (if index exists) |

---

## 6. Implementation Tasks

### Task 1: Create Test File Structure
- [ ] Create `/components/steps/__tests__/PurposeStep.test.tsx`
- [ ] Add imports and mock setup
- [ ] Create defaultProps and beforeEach/afterEach hooks
- [ ] Set up fake timers for auto-advance testing

### Task 2: Implement Rendering Tests
- [ ] Test step title rendering
- [ ] Test step description rendering
- [ ] Test all 7 purpose options render
- [ ] Test labels and descriptions render correctly
- [ ] Test icons render for each option
- [ ] Test custom className application

### Task 3: Implement State Management Tests
- [ ] Test onSelectPurpose callback for each purpose type
- [ ] Test selected/unselected visual states
- [ ] Test single selection constraint
- [ ] Test correct payload for each option

### Task 4: Implement Auto-advance Tests
- [ ] Test visual feedback on selection
- [ ] Test onNext called after delay
- [ ] Test timer cleanup on unmount
- [ ] Test timer reset on new selection
- [ ] Test auto-advance for all purpose types

### Task 5: Implement Keyboard Navigation Tests
- [ ] Test Tab focusability
- [ ] Test Enter key selection
- [ ] Test Space key selection
- [ ] Test visible focus ring
- [ ] Test arrow key navigation (if implemented)

### Task 6: Implement Accessibility Tests
- [ ] Test radiogroup role
- [ ] Test aria-label on container
- [ ] Test radio role on options
- [ ] Test aria-checked attributes
- [ ] Test aria-describedby attributes
- [ ] Test aria-hidden on icons

### Task 7: Implement Navigation & Edge Case Tests
- [ ] Test Continue button enable/disable states
- [ ] Test onNext callback behavior
- [ ] Test pre-selected purpose handling
- [ ] Test rapid selection changes
- [ ] Test cleanup on unmount

### Task 8: Verify Coverage & Performance
- [ ] Run coverage report and verify >= 90%
- [ ] Verify all tests execute in under 5 seconds
- [ ] Review test descriptions for clarity

---

## 7. Expected Test Count Summary

| Category | Test Count |
|----------|------------|
| Rendering | ~7 tests |
| State Management | ~11 tests |
| Auto-advance Behavior | ~6 tests |
| Keyboard Navigation | ~10 tests |
| Accessibility | ~10 tests |
| Navigation | ~6 tests |
| Edge Cases | ~3 tests |
| Styling | ~6 tests |
| **Total** | **~59 tests** |

---

## 8. Dependencies & Prerequisites

### 8.1 Must Complete Before

| Task ID | Title | Status |
|---------|-------|--------|
| 2.1 | Create PurposeStep Component | Pending |
| 2.2 | Integrate PurposeStep into Workflow | Pending |

### 8.2 Types & Constants Required

From `constants.ts` (Task 1.1):
- `PURPOSE_TYPES` array
- `PURPOSE_LABELS` record
- `PURPOSE_DESCRIPTIONS` record
- `PURPOSE_ICONS` record

From `ItemCreationWorkflow.types.ts` (Task 1.1):
- `PurposeType` type definition

---

## 9. Testing Patterns to Follow

### 9.1 Component Props Interface (Expected)

```typescript
export interface PurposeStepProps {
  /** Currently selected purpose (null if none) */
  currentPurpose: PurposeType | null;
  /** Callback when purpose is selected */
  onSelectPurpose: (purpose: PurposeType) => void;
  /** Callback to proceed to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class */
  className?: string;
}
```

### 9.2 Selection Interaction Pattern

Based on `ItemTypeStep.test.tsx`:

```typescript
it('calls onSelectPurpose when clicking How to Clean', () => {
  render(<PurposeStep {...defaultProps} />);
  fireEvent.click(screen.getByText('How to Clean'));
  expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-clean');
});
```

### 9.3 Auto-advance Testing Pattern

```typescript
it('calls onNext after brief delay for visual feedback', async () => {
  render(<PurposeStep {...defaultProps} />);

  fireEvent.click(screen.getByText('How to Use'));

  // Verify immediate callback for selection
  expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');

  // Verify onNext not called immediately
  expect(defaultProps.onNext).not.toHaveBeenCalled();

  // Fast-forward timers
  jest.advanceTimersByTime(300); // or configured delay

  // Verify onNext called after delay
  expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
});
```

### 9.4 Keyboard Navigation Pattern

Based on `ItemTypeStep.test.tsx`:

```typescript
it('supports keyboard navigation with Enter key', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<PurposeStep {...defaultProps} />);

  const howToUseCard = screen.getByText('How to Use').closest('button');
  howToUseCard?.focus();
  await user.keyboard('{Enter}');

  expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');
});
```

---

## 10. Validation Checklist

Before marking this task complete, verify:

- [ ] All 7 purpose types have selection tests
- [ ] Auto-advance behavior is tested with fake timers
- [ ] Arrow key navigation tests pass (if implemented)
- [ ] All ARIA attributes are tested
- [ ] Coverage report shows >= 90% for PurposeStep
- [ ] `npm test` runs all tests in < 5 seconds
- [ ] Test descriptions are clear and descriptive
- [ ] Tests follow established patterns from ItemTypeStep
- [ ] No console warnings or errors during test runs

---

## 11. References

- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 2, Task 2.3)
- **Similar Test Files:**
  - `/src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx`
  - `/src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx`
  - `/src/components/ItemCapture/components/steps/__tests__/ContentTypeStep.test.tsx`
- **Hook Tests:**
  - `/src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
- **Test Configuration:** `vitest.config.ts`

---

*End of Document*
