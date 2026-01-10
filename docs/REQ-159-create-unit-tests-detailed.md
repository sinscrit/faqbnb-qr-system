# REQ-159: Unit Tests for Purpose Selection Step Component - Detailed Task Breakdown

**Document Created:** 2026-01-09 23:55 UTC
**Last Modified:** 2026-01-09 23:55 UTC
**Request ID:** REQ-159
**Overview Document:** `docs/REQ-159-create-unit-tests-overview.md`
**Implementation Plan Reference:** `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
**Phase:** 2 - New Purpose Step
**Task ID:** 2.3

---

## 1. Executive Summary

This document provides a granular, step-by-step task breakdown for implementing comprehensive unit tests for the PurposeStep component. Each task is sized to approximately 1 story point (a few hours of focused work) and includes verification steps to ensure completeness.

---

## 2. Prerequisites

Before starting implementation, ensure the following are complete:

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Task 2.1: Create PurposeStep Component | Must be complete | Component under test |
| Task 2.2: Integrate PurposeStep into Workflow | Must be complete | Tests need integration context |
| constants.ts updated with PURPOSE_TYPES | Must be complete | Test data dependencies |
| ItemCreationWorkflow.types.ts with PurposeType | Must be complete | Type definitions for tests |

---

## 3. Authorized Files for Modification

### 3.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx` | Main unit test file for PurposeStep component |

### 3.2 Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Component under test |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | PurposeType and related types |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx` | Reference pattern for similar tests |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx` | Reference pattern for selection tests |
| `vitest.config.ts` | Test configuration |

---

## 4. Detailed Task Breakdown

### Task 1: Create Test File Structure and Setup (~1 story point)

**Objective:** Establish the test file with proper imports, mock setup, and test infrastructure.

#### 1.1 Create the Test File

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx`

**Actions:**
1. Create new file at path `src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx`
2. Add file header with module documentation and `@lastModified` annotation
3. Add testing library imports:
   - `render`, `screen`, `fireEvent`, `waitFor` from `@testing-library/react`
   - `userEvent` from `@testing-library/user-event`
4. Import component: `PurposeStep` from `../PurposeStep`
5. Import constants: `PURPOSE_TYPES`, `PURPOSE_LABELS`, `PURPOSE_DESCRIPTIONS` from `../../../utils/constants`

**Template:**
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
import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../../utils/constants';

describe('PurposeStep', () => {
  // Test setup follows...
});
```

#### 1.2 Define Default Props and Setup Hooks

**Actions:**
1. Create `defaultProps` object matching `PurposeStepProps` interface:
   ```typescript
   const defaultProps = {
     currentPurpose: null as PurposeType | null,
     onSelectPurpose: jest.fn(),
     onNext: jest.fn(),
     canNext: false,
   };
   ```
2. Add `beforeEach` hook to clear all mocks and set up fake timers
3. Add `afterEach` hook to run pending timers and restore real timers

**Template:**
```typescript
const defaultProps = {
  currentPurpose: null as PurposeType | null,
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
```

**Verification:**
- [ ] File created at correct path
- [ ] All imports resolve without errors
- [ ] `npm test -- PurposeStep.test.tsx` runs (may fail if component doesn't exist yet)
- [ ] No TypeScript errors in test file

---

### Task 2: Implement Rendering Tests (~1 story point)

**Objective:** Verify the component renders all expected elements correctly.

#### 2.1 Test Step Title and Description

**Actions:**
1. Create `describe('Rendering', () => { ... })` block
2. Add test: `'renders step title "What is the purpose of this content?"'`
   - Use `screen.getByRole('heading', { name: /what is the purpose/i })`
3. Add test: `'renders step description'`
   - Check for descriptive text explaining the purpose options

**Template:**
```typescript
describe('Rendering', () => {
  it('renders step title "What is the purpose of this content?"', () => {
    render(<PurposeStep {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: /what is the purpose of this content/i })
    ).toBeInTheDocument();
  });

  it('renders step description', () => {
    render(<PurposeStep {...defaultProps} />);
    expect(
      screen.getByText(/select the intent or category/i)
    ).toBeInTheDocument();
  });
});
```

#### 2.2 Test All Purpose Options Render

**Actions:**
1. Add test: `'renders all 7 purpose type options'`
   - Verify `screen.getAllByRole('radio')` returns 7 elements
2. Add test: `'renders purpose type labels correctly'`
   - Iterate through `PURPOSE_LABELS` and verify each label is present
3. Add test: `'renders purpose type descriptions'`
   - Verify descriptions from `PURPOSE_DESCRIPTIONS` are displayed
4. Add test: `'renders icons for each purpose type'`
   - Verify each option has an associated icon (aria-hidden="true" SVG)

**Template:**
```typescript
it('renders all 7 purpose type options', () => {
  render(<PurposeStep {...defaultProps} />);
  const radioButtons = screen.getAllByRole('radio');
  expect(radioButtons).toHaveLength(7);
});

it('renders purpose type labels correctly', () => {
  render(<PurposeStep {...defaultProps} />);
  expect(screen.getByText('How to Use')).toBeInTheDocument();
  expect(screen.getByText('How to Clean')).toBeInTheDocument();
  expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
  expect(screen.getByText('Safety Information')).toBeInTheDocument();
  expect(screen.getByText('Maintenance')).toBeInTheDocument();
  expect(screen.getByText('Features & Tips')).toBeInTheDocument();
  expect(screen.getByText('Other')).toBeInTheDocument();
});

it('renders purpose type descriptions', () => {
  render(<PurposeStep {...defaultProps} />);
  expect(screen.getByText(/operating instructions and controls/i)).toBeInTheDocument();
  expect(screen.getByText(/cleaning and care instructions/i)).toBeInTheDocument();
  expect(screen.getByText(/common issues and fixes/i)).toBeInTheDocument();
});

it('renders icons for each purpose type', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
```

#### 2.3 Test Custom ClassName Application

**Actions:**
1. Add test: `'applies custom className'`
   - Render with `className="custom-test-class"`
   - Verify class is applied to container

**Template:**
```typescript
it('applies custom className', () => {
  render(<PurposeStep {...defaultProps} className="custom-test-class" />);
  const container = screen
    .getByRole('heading', { name: /what is the purpose/i })
    .closest('div[class*="flex-col"]');
  expect(container).toHaveClass('custom-test-class');
});
```

**Verification:**
- [ ] All 7 rendering tests pass
- [ ] Tests verify static content correctly
- [ ] Tests use appropriate queries (getByRole, getByText)
- [ ] Run: `npm test -- PurposeStep.test.tsx`

---

### Task 3: Implement State Management Tests (~1 story point)

**Objective:** Verify purpose selection correctly updates component state via callbacks.

#### 3.1 Test onSelectPurpose Callback for Each Purpose Type

**Actions:**
1. Create `describe('Selection State Management', () => { ... })` block
2. Add test for each of the 7 purpose types:
   - `'calls onSelectPurpose when clicking How to Use'`
   - `'calls onSelectPurpose when clicking How to Clean'`
   - `'calls onSelectPurpose when clicking Troubleshooting'`
   - `'calls onSelectPurpose when clicking Safety Information'`
   - `'calls onSelectPurpose when clicking Maintenance'`
   - `'calls onSelectPurpose when clicking Features & Tips'`
   - `'calls onSelectPurpose when clicking Other'`

**Template:**
```typescript
describe('Selection State Management', () => {
  it('calls onSelectPurpose when clicking How to Use', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('How to Use'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');
  });

  it('calls onSelectPurpose when clicking How to Clean', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('How to Clean'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-clean');
  });

  it('calls onSelectPurpose when clicking Troubleshooting', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('Troubleshooting'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('troubleshooting');
  });

  it('calls onSelectPurpose when clicking Safety Information', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('Safety Information'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('safety-info');
  });

  it('calls onSelectPurpose when clicking Maintenance', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('Maintenance'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('maintenance');
  });

  it('calls onSelectPurpose when clicking Features & Tips', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('Features & Tips'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('features');
  });

  it('calls onSelectPurpose when clicking Other', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('Other'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('other');
  });
});
```

#### 3.2 Test Visual State Changes

**Actions:**
1. Add test: `'shows selected state for currentPurpose'`
   - Render with `currentPurpose="how-to-clean"`
   - Verify selected button has `aria-checked="true"`
2. Add test: `'shows unselected state for non-selected purposes'`
   - Verify other buttons have `aria-checked="false"`
3. Add test: `'only one purpose can be selected at a time'`
   - Verify exactly one radio is checked

**Template:**
```typescript
it('shows selected state for currentPurpose', () => {
  render(<PurposeStep {...defaultProps} currentPurpose="how-to-clean" />);
  const cleanButton = screen.getByText('How to Clean').closest('button');
  expect(cleanButton).toHaveAttribute('aria-checked', 'true');
});

it('shows unselected state for non-selected purposes', () => {
  render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
  const cleanButton = screen.getByText('How to Clean').closest('button');
  expect(cleanButton).toHaveAttribute('aria-checked', 'false');
});

it('only one purpose can be selected at a time', () => {
  render(<PurposeStep {...defaultProps} currentPurpose="troubleshooting" />);
  const radios = screen.getAllByRole('radio');
  const checkedRadios = radios.filter(
    (radio) => radio.getAttribute('aria-checked') === 'true'
  );
  expect(checkedRadios).toHaveLength(1);
});
```

#### 3.3 Test Comprehensive Type Mappings

**Actions:**
1. Add test: `'calls onSelectPurpose with correct type for each option'`
   - Iterate through all purpose types
   - Verify correct payload is sent for each

**Template:**
```typescript
it('calls onSelectPurpose with correct type for each option', () => {
  const typeMappings = [
    { label: 'How to Use', type: 'how-to-use' },
    { label: 'How to Clean', type: 'how-to-clean' },
    { label: 'Troubleshooting', type: 'troubleshooting' },
    { label: 'Safety Information', type: 'safety-info' },
    { label: 'Maintenance', type: 'maintenance' },
    { label: 'Features & Tips', type: 'features' },
    { label: 'Other', type: 'other' },
  ];

  typeMappings.forEach(({ label, type }) => {
    jest.clearAllMocks();
    const { unmount } = render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText(label));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith(type);
    unmount();
  });
});
```

**Verification:**
- [ ] All 11 state management tests pass
- [ ] Each purpose type has a dedicated test
- [ ] Tests verify correct callback payloads
- [ ] Run: `npm test -- PurposeStep.test.tsx`

---

### Task 4: Implement Auto-advance Behavior Tests (~1 story point)

**Objective:** Verify the component auto-advances after purpose selection with appropriate delay.

#### 4.1 Test Visual Feedback and Auto-advance Timing

**Actions:**
1. Create `describe('Auto-advance Behavior', () => { ... })` block
2. Add test: `'provides visual feedback immediately on selection'`
   - Verify `onSelectPurpose` is called immediately
3. Add test: `'calls onNext after brief delay for visual feedback'`
   - Use `jest.advanceTimersByTime(300)` to simulate delay
   - Verify `onNext` is called after timer

**Template:**
```typescript
describe('Auto-advance Behavior', () => {
  it('provides visual feedback immediately on selection', () => {
    render(<PurposeStep {...defaultProps} />);
    fireEvent.click(screen.getByText('How to Use'));
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');
  });

  it('calls onNext after brief delay for visual feedback', () => {
    render(<PurposeStep {...defaultProps} />);

    fireEvent.click(screen.getByText('How to Use'));

    // Verify immediate selection callback
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');

    // Verify onNext not called immediately
    expect(defaultProps.onNext).not.toHaveBeenCalled();

    // Fast-forward timers (300ms is typical auto-advance delay)
    jest.advanceTimersByTime(300);

    // Verify onNext called after delay
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });
});
```

#### 4.2 Test Timer Cleanup and Reset

**Actions:**
1. Add test: `'does not auto-advance if component unmounts during delay'`
   - Unmount component before timer fires
   - Verify `onNext` not called
2. Add test: `'clears auto-advance timer on new selection'`
   - Click multiple options quickly
   - Verify only one `onNext` call after delay
3. Add test: `'auto-advance works for all purpose types'`
   - Test each purpose type triggers auto-advance

**Template:**
```typescript
it('does not auto-advance if component unmounts during delay', () => {
  const { unmount } = render(<PurposeStep {...defaultProps} />);

  fireEvent.click(screen.getByText('How to Clean'));

  // Unmount before timer fires
  unmount();

  // Advance timers
  jest.advanceTimersByTime(500);

  // onNext should not have been called
  expect(defaultProps.onNext).not.toHaveBeenCalled();
});

it('clears auto-advance timer on new selection', () => {
  render(<PurposeStep {...defaultProps} />);

  // Click first option
  fireEvent.click(screen.getByText('How to Use'));

  // Immediately click another option
  fireEvent.click(screen.getByText('Troubleshooting'));

  // Advance past first timer
  jest.advanceTimersByTime(400);

  // Only one onNext call should occur
  expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
});

it('auto-advance works for all purpose types', () => {
  PURPOSE_TYPES.forEach((purposeType) => {
    jest.clearAllMocks();
    const { unmount } = render(<PurposeStep {...defaultProps} />);

    const label = PURPOSE_LABELS[purposeType];
    fireEvent.click(screen.getByText(label));

    jest.advanceTimersByTime(300);

    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    unmount();
  });
});
```

**Verification:**
- [ ] All 6 auto-advance tests pass
- [ ] Fake timers are used correctly
- [ ] Timer cleanup on unmount verified
- [ ] Run: `npm test -- PurposeStep.test.tsx`

---

### Task 5: Implement Keyboard Navigation Tests (~1 story point)

**Objective:** Verify full keyboard accessibility for navigation and selection.

#### 5.1 Test Basic Keyboard Selection

**Actions:**
1. Create `describe('Keyboard Navigation', () => { ... })` block
2. Add test: `'purpose cards are focusable with Tab'`
   - Verify cards can receive focus
3. Add test: `'Enter key triggers selection'`
   - Focus card, press Enter, verify callback
4. Add test: `'Space key triggers selection'`
   - Focus card, press Space, verify callback

**Template:**
```typescript
describe('Keyboard Navigation', () => {
  it('purpose cards are focusable with Tab', () => {
    render(<PurposeStep {...defaultProps} />);
    const firstCard = screen.getByText('How to Use').closest('button');
    expect(firstCard).not.toBeNull();
    firstCard?.focus();
    expect(document.activeElement).toBe(firstCard);
  });

  it('Enter key triggers selection', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PurposeStep {...defaultProps} />);

    const howToUseCard = screen.getByText('How to Use').closest('button');
    howToUseCard?.focus();
    await user.keyboard('{Enter}');

    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-use');
  });

  it('Space key triggers selection', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PurposeStep {...defaultProps} />);

    const cleanCard = screen.getByText('How to Clean').closest('button');
    cleanCard?.focus();
    await user.keyboard(' ');

    expect(defaultProps.onSelectPurpose).toHaveBeenCalledWith('how-to-clean');
  });
});
```

#### 5.2 Test Focus Visibility

**Actions:**
1. Add test: `'has visible focus ring on focus'`
   - Verify cards have `focus-visible:ring-2` class
2. Add test: `'cards have proper focus classes'`
   - Verify `focus:outline-none`, `focus-visible:ring-offset-2`

**Template:**
```typescript
it('has visible focus ring on focus', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio).toHaveClass('focus-visible:ring-2');
  });
});

it('cards have proper focus classes', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio).toHaveClass('focus:outline-none');
    expect(radio).toHaveClass('focus-visible:ring-2');
    expect(radio).toHaveClass('focus-visible:ring-offset-2');
  });
});
```

#### 5.3 Test Arrow Key Navigation (if implemented)

**Actions:**
1. Add test: `'ArrowRight moves focus to next card'` (optional, based on implementation)
2. Add test: `'ArrowLeft moves focus to previous card'` (optional)
3. Add test: `'ArrowDown moves focus to card below in grid'` (optional)
4. Add test: `'ArrowUp moves focus to card above in grid'` (optional)

**Template (conditional based on implementation):**
```typescript
// Only include if arrow key navigation is implemented in PurposeStep
it('ArrowRight moves focus to next card', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<PurposeStep {...defaultProps} />);

  const firstCard = screen.getByText('How to Use').closest('button');
  firstCard?.focus();
  await user.keyboard('{ArrowRight}');

  const secondCard = screen.getByText('How to Clean').closest('button');
  expect(document.activeElement).toBe(secondCard);
});
```

**Note:** Arrow key navigation tests should be included only if the component implements this behavior. Check PurposeStep.tsx implementation to confirm.

**Verification:**
- [ ] All keyboard navigation tests pass
- [ ] Tab focus works correctly
- [ ] Enter and Space trigger selection
- [ ] Focus visibility styles are present
- [ ] Run: `npm test -- PurposeStep.test.tsx`

---

### Task 6: Implement Accessibility Tests (~1 story point)

**Objective:** Verify ARIA compliance and screen reader support.

#### 6.1 Test ARIA Roles

**Actions:**
1. Create `describe('Accessibility', () => { ... })` block
2. Add test: `'has radiogroup role on cards container'`
3. Add test: `'has aria-label on radiogroup'`
4. Add test: `'all purpose options have radio role'`

**Template:**
```typescript
describe('Accessibility', () => {
  it('has radiogroup role on cards container', () => {
    render(<PurposeStep {...defaultProps} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('has aria-label on radiogroup', () => {
    render(<PurposeStep {...defaultProps} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/purpose|content type/i)
    );
  });

  it('all purpose options have radio role', () => {
    render(<PurposeStep {...defaultProps} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(7);
  });
});
```

#### 6.2 Test ARIA States

**Actions:**
1. Add test: `'each card has aria-checked attribute'`
2. Add test: `'aria-checked is true for selected purpose'`
3. Add test: `'aria-checked is false for unselected purposes'`
4. Add test: `'each card has aria-describedby for description'`

**Template:**
```typescript
it('each card has aria-checked attribute', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio).toHaveAttribute('aria-checked');
  });
});

it('aria-checked is true for selected purpose', () => {
  render(<PurposeStep {...defaultProps} currentPurpose="maintenance" />);
  const maintenanceCard = screen.getByText('Maintenance').closest('button');
  expect(maintenanceCard).toHaveAttribute('aria-checked', 'true');
});

it('aria-checked is false for unselected purposes', () => {
  render(<PurposeStep {...defaultProps} currentPurpose="maintenance" />);
  const otherCard = screen.getByText('Other').closest('button');
  expect(otherCard).toHaveAttribute('aria-checked', 'false');
});

it('each card has aria-describedby for description', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio).toHaveAttribute('aria-describedby');
  });
});
```

#### 6.3 Test Icon and Label Accessibility

**Actions:**
1. Add test: `'icons have aria-hidden="true"'`
2. Add test: `'has descriptive aria-label on each option'`
3. Add test: `'focus is managed correctly during navigation'`

**Template:**
```typescript
it('icons have aria-hidden="true"', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    const icon = radio.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});

it('has descriptive aria-label on each option', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio).toHaveAccessibleName();
  });
});

it('focus is managed correctly during navigation', () => {
  render(<PurposeStep {...defaultProps} />);
  const firstCard = screen.getByText('How to Use').closest('button');
  firstCard?.focus();
  expect(document.activeElement).toBe(firstCard);
});
```

**Verification:**
- [ ] All 10 accessibility tests pass
- [ ] ARIA roles are correctly applied
- [ ] ARIA states update based on selection
- [ ] Icons are hidden from screen readers
- [ ] Run: `npm test -- PurposeStep.test.tsx`

---

### Task 7: Implement Navigation and Edge Case Tests (~1 story point)

**Objective:** Cover workflow navigation behavior and edge cases.

#### 7.1 Test Navigation Controls

**Actions:**
1. Create `describe('Navigation', () => { ... })` block
2. Add test: `'Continue button is disabled when no purpose selected'`
3. Add test: `'Continue button is enabled when a purpose is selected'`
4. Add test: `'calls onNext when Continue is clicked with valid selection'`
5. Add test: `'does not call onNext when Continue is clicked without selection'`
6. Add test: `'Continue button has disabled styling when canNext is false'`
7. Add test: `'Continue button has enabled styling when canNext is true'`

**Template:**
```typescript
describe('Navigation', () => {
  it('Continue button is disabled when no purpose selected', () => {
    render(<PurposeStep {...defaultProps} currentPurpose={null} canNext={false} />);
    const button = screen.getByRole('button', { name: /continue/i });
    expect(button).toBeDisabled();
  });

  it('Continue button is enabled when a purpose is selected', () => {
    render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" canNext={true} />);
    const button = screen.getByRole('button', { name: /continue/i });
    expect(button).not.toBeDisabled();
  });

  it('calls onNext when Continue is clicked with valid selection', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" canNext={true} />);

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('does not call onNext when Continue is clicked without selection', () => {
    render(<PurposeStep {...defaultProps} currentPurpose={null} canNext={false} />);

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    expect(defaultProps.onNext).not.toHaveBeenCalled();
  });

  it('Continue button has disabled styling when canNext is false', () => {
    render(<PurposeStep {...defaultProps} canNext={false} />);
    const button = screen.getByRole('button', { name: /continue/i });
    expect(button).toHaveClass('bg-gray-200');
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('Continue button has enabled styling when canNext is true', () => {
    render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" canNext={true} />);
    const button = screen.getByRole('button', { name: /continue/i });
    expect(button).toHaveClass('bg-[#FF385C]');
  });
});
```

#### 7.2 Test Edge Cases

**Actions:**
1. Create `describe('Edge Cases', () => { ... })` block
2. Add test: `'renders with pre-selected purpose if provided'`
3. Add test: `'handles rapid selection changes without errors'`
4. Add test: `'cleans up timers on unmount'`

**Template:**
```typescript
describe('Edge Cases', () => {
  it('renders with pre-selected purpose if provided', () => {
    render(<PurposeStep {...defaultProps} currentPurpose="safety-info" />);
    const safetyButton = screen.getByText('Safety Information').closest('button');
    expect(safetyButton).toHaveAttribute('aria-checked', 'true');
  });

  it('handles rapid selection changes without errors', () => {
    render(<PurposeStep {...defaultProps} />);

    // Rapidly click multiple options
    fireEvent.click(screen.getByText('How to Use'));
    fireEvent.click(screen.getByText('How to Clean'));
    fireEvent.click(screen.getByText('Troubleshooting'));
    fireEvent.click(screen.getByText('Safety Information'));

    // Advance timers
    jest.advanceTimersByTime(500);

    // Should not throw errors, only last selection should trigger onNext
    expect(defaultProps.onSelectPurpose).toHaveBeenCalledTimes(4);
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('cleans up timers on unmount', () => {
    const { unmount } = render(<PurposeStep {...defaultProps} />);

    fireEvent.click(screen.getByText('How to Use'));

    // Unmount before timer
    unmount();

    // This should not throw or cause issues
    jest.runAllTimers();

    // onNext should not have been called
    expect(defaultProps.onNext).not.toHaveBeenCalled();
  });
});
```

**Verification:**
- [ ] All 9 navigation and edge case tests pass
- [ ] Continue button states work correctly
- [ ] Rapid selection changes handled gracefully
- [ ] No memory leaks from timers
- [ ] Run: `npm test -- PurposeStep.test.tsx`

---

### Task 8: Implement Styling Tests (~1 story point)

**Objective:** Verify visual styling requirements including responsive layout and touch targets.

#### 8.1 Test Layout and Responsive Classes

**Actions:**
1. Create `describe('Styling', () => { ... })` block
2. Add test: `'applies correct grid classes for responsive layout'`
3. Add test: `'displays grid layout for purpose cards'`

**Template:**
```typescript
describe('Styling', () => {
  it('applies correct grid classes for responsive layout', () => {
    render(<PurposeStep {...defaultProps} />);
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveClass('grid');
  });

  it('displays grid layout for purpose cards', () => {
    render(<PurposeStep {...defaultProps} />);
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveClass('grid-cols-1');
    expect(radiogroup).toHaveClass('sm:grid-cols-2');
  });
});
```

#### 8.2 Test Touch Targets and Mobile Optimization

**Actions:**
1. Add test: `'buttons have minimum touch target size (48px)'`
   - Verify `min-h-[48px]` or `min-h-[56px]` class
2. Add test: `'buttons have touch-manipulation for mobile'`
   - Verify `touch-manipulation` class
3. Add test: `'Continue button has minimum touch target height'`

**Template:**
```typescript
it('buttons have minimum touch target size', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    // Verify minimum height class (48px or larger)
    const hasMinHeight =
      radio.classList.contains('min-h-[48px]') ||
      radio.classList.contains('min-h-[56px]') ||
      radio.classList.contains('p-4'); // 16px padding on all sides provides adequate target
    expect(hasMinHeight).toBe(true);
  });
});

it('buttons have touch-manipulation for mobile', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio).toHaveClass('touch-manipulation');
  });
});

it('Continue button has minimum touch target height', () => {
  render(<PurposeStep {...defaultProps} />);
  const button = screen.getByRole('button', { name: /continue/i });
  expect(button).toHaveClass('min-h-[56px]');
});
```

#### 8.3 Test Selection Styling

**Actions:**
1. Add test: `'selected button has correct styling (border, background)'`
2. Add test: `'unselected buttons have hover states'`
3. Add test: `'buttons have active scale transition'`

**Template:**
```typescript
it('selected button has correct styling', () => {
  render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
  const selectedCard = screen.getByRole('radio', { checked: true });
  expect(selectedCard).toHaveClass('border-blue-500');
  expect(selectedCard).toHaveClass('bg-blue-50');
});

it('unselected buttons have proper base styling', () => {
  render(<PurposeStep {...defaultProps} currentPurpose="how-to-use" />);
  const unselectedCards = screen.getAllByRole('radio', { checked: false });
  unselectedCards.forEach((card) => {
    expect(card).toHaveClass('border-gray-200');
    expect(card).toHaveClass('bg-white');
  });
});

it('buttons have transition classes', () => {
  render(<PurposeStep {...defaultProps} />);
  const radios = screen.getAllByRole('radio');
  radios.forEach((radio) => {
    expect(radio).toHaveClass('transition-all');
    expect(radio).toHaveClass('duration-200');
  });
});
```

**Verification:**
- [ ] All 6 styling tests pass
- [ ] Touch targets meet 48px minimum
- [ ] Responsive grid classes are applied
- [ ] Selection styling is correct
- [ ] Run: `npm test -- PurposeStep.test.tsx`

---

### Task 9: Verify Coverage and Performance (~0.5 story point)

**Objective:** Ensure tests meet coverage and performance requirements.

#### 9.1 Run Coverage Report

**Actions:**
1. Run `npm test -- --coverage PurposeStep.test.tsx`
2. Verify coverage >= 90% for PurposeStep component
3. Identify any uncovered lines
4. Add tests for uncovered code paths if needed

**Verification Commands:**
```bash
# Run tests with coverage
npm test -- --coverage --collectCoverageFrom="src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx" PurposeStep.test.tsx

# Alternative: Run full coverage
npm test -- --coverage
```

**Coverage Targets:**
- [ ] Statements: >= 90%
- [ ] Branches: >= 90%
- [ ] Functions: >= 90%
- [ ] Lines: >= 90%

#### 9.2 Verify Performance

**Actions:**
1. Run `npm test -- PurposeStep.test.tsx` and record execution time
2. Verify all tests execute in under 5 seconds total
3. If tests are slow, identify and optimize (e.g., reduce unnecessary renders)

**Verification:**
- [ ] Test execution time < 5 seconds
- [ ] No memory leaks or warnings
- [ ] All tests pass consistently (run 3 times)

#### 9.3 Review Test Descriptions

**Actions:**
1. Review all `it()` descriptions for clarity
2. Ensure descriptions describe behavior, not implementation
3. Ensure test names follow established patterns from existing tests

**Good Description Patterns:**
- ✅ "calls onSelectPurpose when clicking How to Use"
- ✅ "Continue button is disabled when no purpose selected"
- ✅ "has radiogroup role on cards container"
- ❌ "tests the onSelectPurpose function"
- ❌ "button test"

**Verification:**
- [ ] All test descriptions are clear and descriptive
- [ ] Test descriptions follow established patterns
- [ ] No console warnings or errors during test runs

---

## 5. Final Validation Checklist

Before marking REQ-159 as complete, verify all of the following:

### 5.1 Functional Requirements

| # | Acceptance Criterion | Verification Method | Status |
|---|---------------------|---------------------|--------|
| 1 | Tests verify selecting a purpose updates state | Run state management tests | ☐ |
| 2 | Tests verify auto-advance after selection | Run auto-advance tests | ☐ |
| 3 | Tests verify keyboard navigation | Run keyboard tests | ☐ |
| 4 | Tests verify ARIA labels and roles | Run accessibility tests | ☐ |
| 5 | Tests achieve >= 90% coverage | Check coverage report | ☐ |
| 6 | All tests execute in < 5 seconds | Measure test runtime | ☐ |
| 7 | Test descriptions are clear | Manual review | ☐ |

### 5.2 Quality Gates

- [ ] All tests pass: `npm test -- PurposeStep.test.tsx`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Coverage >= 90%: `npm test -- --coverage`
- [ ] Execution time < 5 seconds
- [ ] No console warnings during tests
- [ ] Tests follow established patterns from ItemTypeStep.test.tsx

### 5.3 Documentation

- [ ] File header includes `@lastModified` annotation
- [ ] Test file uses consistent section comments
- [ ] Complex tests have explanatory comments

---

## 6. Expected Test Summary

| Category | Test Count |
|----------|------------|
| Rendering | 7 tests |
| State Management | 11 tests |
| Auto-advance Behavior | 6 tests |
| Keyboard Navigation | 5-10 tests |
| Accessibility | 10 tests |
| Navigation | 6 tests |
| Edge Cases | 3 tests |
| Styling | 6 tests |
| **Total** | **54-59 tests** |

---

## 7. References

- **Overview Document:** `docs/REQ-159-create-unit-tests-overview.md`
- **Implementation Plan:** `docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` (Phase 2, Task 2.3)
- **Reference Test Files:**
  - `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx`
  - `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx`
- **Test Configuration:** `vitest.config.ts`
- **Vitest Documentation:** https://vitest.dev/

---

*End of Document*
