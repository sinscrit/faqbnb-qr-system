# REQ-102: Content Source Selection Step - Detailed Task Breakdown

**Document Generated:** 2026-01-05 22:45 UTC
**Last Modified:** 2026-01-06 06:02 UTC
**Implementation Status:** COMPLETED
**Request Reference:** REQ-102 (Content Source Selection Step for Item Creation Workflow)
**Overview Document:** [REQ-102-content-source-step-overview.md](./REQ-102-content-source-step-overview.md)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 3 - Content Selection Steps (4-5)
**Task ID:** 3.1

---

## Document Purpose

This document transforms the technical overview from REQ-102-content-source-step-overview.md into granular, actionable implementation tasks. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting implementation, ensure the following are complete:

- [x] RoomSelectionStep (Task 2.1) implemented
- [x] ItemTypeStep (Task 2.2) implemented
- [x] SpecificItemStep (Task 2.3) implemented
- [x] `useWorkflowState` hook includes `selectContentSource` action (lines 630-632)
- [x] `CONTENT_SOURCE_OPTIONS` defined in `utils/constants.ts` (lines 131-144)
- [x] Type `contentSource: 'existing' | 'create-new'` in `CurrentItemState` (types.ts)

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Main step component |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx` | Unit tests |

### Files to Modify

| File Path | Modification | Functions/Sections |
|-----------|--------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Uncomment exports | Lines 29-30 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import and integrate ContentSourceStep | Imports (line 19), useWorkflowState destructuring (~line 90-106), `renderCurrentStep()` case 'content-source-selection' (~line 184-185), useCallback dependencies (~line 200) |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `CONTENT_SOURCE_OPTIONS` reference |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `selectContentSource` action, `canGoNext` logic |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Pattern reference for card styling |
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Pattern reference for step structure |

---

## Implementation Tasks

### Task 1: Create ContentSourceStep Component File Structure

**Estimated Effort:** 20 minutes
**Story Points:** 0.25

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`

**Description:**
Create the component file with proper structure, 'use client' directive, JSDoc documentation, imports, and type definitions.

**Subtasks:**

1.1. Create the file at the specified path

1.2. Add 'use client' directive at the top

1.3. Add JSDoc header with module documentation:
```typescript
/**
 * ContentSourceStep Component
 *
 * Step 4 of the item creation workflow.
 * Presents two options: upload existing content or create new content.
 * The user's choice filters which content types are available in the next step.
 *
 * @module ItemCreationWorkflow/components/steps/ContentSourceStep
 * @see docs/REQ-102-content-source-step-overview.md
 * @lastModified 2026-01-05
 */
```

1.4. Add required imports:
```typescript
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Camera, Check, type LucideIcon } from 'lucide-react';
```

1.5. Define internal type definitions:
```typescript
type ContentSource = 'existing' | 'create-new';

interface ContentSourceCardData {
  icon: LucideIcon;
  title: string;
  description: string;
  examples: readonly string[];
}
```

1.6. Define and export the component props interface:
```typescript
export interface ContentSourceStepProps {
  currentContentSource: ContentSource | null;
  onSelectContentSource: (source: ContentSource) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}
```

**Verification Steps:**
- [ ] File exists at `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`
- [ ] 'use client' directive is first line
- [ ] JSDoc header is present and accurate
- [ ] All imports are valid (no TypeScript errors)
- [ ] `ContentSourceStepProps` interface is exported
- [ ] No linting errors

---

### Task 2: Define Content Source Card Data Constant

**Estimated Effort:** 15 minutes
**Story Points:** 0.25

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`

**Description:**
Define the `CONTENT_SOURCE_CARDS` constant containing card metadata for both content source options.

**Subtasks:**

2.1. Define the constant with proper typing:
```typescript
const CONTENT_SOURCE_CARDS: Record<ContentSource, ContentSourceCardData> = {
  existing: {
    icon: Upload,
    title: 'I have content',
    description: 'Upload existing videos, photos, PDFs, or paste text and URLs',
    examples: ['Upload Video', 'Upload Photo', 'Upload PDF', 'Paste Text', 'Paste URL'],
  },
  'create-new': {
    icon: Camera,
    title: 'Create now',
    description: 'Record videos, take photos, or write text instructions on the spot',
    examples: ['Record Video', 'Take Photo', 'Write Text'],
  },
};
```

2.2. Ensure examples align with `CONTENT_SOURCE_OPTIONS` from `utils/constants.ts`

**Verification Steps:**
- [ ] `CONTENT_SOURCE_CARDS` constant is defined with both 'existing' and 'create-new' keys
- [ ] Each entry has `icon`, `title`, `description`, and `examples` properties
- [ ] TypeScript compiles without errors
- [ ] Examples match the options available in `CONTENT_SOURCE_OPTIONS` (constants.ts lines 131-144)

---

### Task 3: Implement ContentSourceCard Inline Component

**Estimated Effort:** 35 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`

**Description:**
Create an inline card component following the `ItemTypeCard` pattern (components/shared/ItemTypeCard.tsx) but customized for content source selection with examples display.

**Subtasks:**

3.1. Define the inline component function signature:
```typescript
function ContentSourceCard({
  source,
  data,
  isSelected,
  onSelect,
}: {
  source: ContentSource;
  data: ContentSourceCardData;
  isSelected: boolean;
  onSelect: (source: ContentSource) => void;
}) {
```

3.2. Implement click handler:
```typescript
const handleClick = () => onSelect(source);
```

3.3. Implement keyboard handler for accessibility:
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onSelect(source);
  }
};
```

3.4. Implement JSX structure with:
- Button wrapper with `type="button"`, `role="radio"`, `aria-checked={isSelected}`
- Icon section (48x48px mobile, 56x56px desktop) with conditional styling
- Text content section with title, description, and examples chips
- Checkmark indicator when selected

3.5. Apply Tailwind classes matching ItemTypeCard pattern:
- Layout: `flex items-start gap-4`, `w-full rounded-xl border-2`
- Sizing: `min-h-[140px] p-4 sm:min-h-[160px] sm:p-6`
- States: `touch-manipulation select-none`, `transition-all duration-200`
- Focus: `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`
- Selection: `border-blue-500 bg-blue-50` when selected, `border-gray-200 bg-white hover:border-gray-300` when not

3.6. Implement examples chips display:
```tsx
<div className="flex flex-wrap gap-2 mt-3">
  {data.examples.map((example) => (
    <span
      key={example}
      className={cn(
        'inline-block px-2 py-1 text-xs rounded-full',
        isSelected
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-600'
      )}
    >
      {example}
    </span>
  ))}
</div>
```

**Verification Steps:**
- [ ] `ContentSourceCard` function is defined
- [ ] Click handler calls `onSelect` with correct source value
- [ ] Keyboard handler responds to Enter and Space keys
- [ ] Button has correct ARIA attributes (`role="radio"`, `aria-checked`)
- [ ] Icon renders with correct color based on selection state
- [ ] Examples chips display correctly
- [ ] Selected state shows blue styling, unselected shows gray
- [ ] Checkmark appears only when selected

---

### Task 4: Implement Main ContentSourceStep Component

**Estimated Effort:** 25 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`

**Description:**
Implement the main exported component that renders the step header, card container, and continue button.

**Subtasks:**

4.1. Create component function with props destructuring:
```typescript
export function ContentSourceStep({
  currentContentSource,
  onSelectContentSource,
  onNext,
  canNext,
  className,
}: ContentSourceStepProps) {
```

4.2. Implement `handleContinue` callback:
```typescript
const handleContinue = useCallback(() => {
  if (canNext) {
    onNext();
  }
}, [canNext, onNext]);
```

4.3. Define content sources array for iteration:
```typescript
const contentSources: ContentSource[] = ['existing', 'create-new'];
```

4.4. Implement JSX structure:
- Container: `<div className={cn('flex flex-col flex-1 p-6', className)}>`
- Step header with h2 title and p description
- Cards container with `role="radiogroup"` and `aria-label`
- Map over contentSources to render ContentSourceCard components
- Continue button section with border-top separator

4.5. Implement step header:
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    How would you like to add content?
  </h2>
  <p className="text-base text-[#717171]">
    Choose whether to upload existing materials or create new content
  </p>
</div>
```

4.6. Implement continue button with proper states:
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!canNext}
  className={cn(
    'w-full py-4 rounded-lg font-semibold text-lg',
    'transition-colors duration-150',
    'min-h-[56px]',
    canNext
      ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
  )}
  aria-disabled={!canNext}
>
  Continue
</button>
```

4.7. Add default export:
```typescript
export default ContentSourceStep;
```

**Verification Steps:**
- [ ] Component renders without errors
- [ ] Step header displays correct title and description
- [ ] Both content source cards are rendered
- [ ] Cards container has `role="radiogroup"` and `aria-label`
- [ ] Continue button is disabled when `canNext` is false
- [ ] Continue button is enabled when `canNext` is true
- [ ] Clicking enabled Continue button calls `onNext`
- [ ] Component is exported as both named and default export

---

### Task 5: Update Step Barrel Exports

**Estimated Effort:** 5 minutes
**Story Points:** 0.1

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Description:**
Uncomment the ContentSourceStep export lines to make the component available for import.

**Subtasks:**

5.1. Locate lines 29-30 in the file:
```typescript
// Task 3.1: ContentSourceStep
// export { ContentSourceStep } from './ContentSourceStep';
// export type { ContentSourceStepProps } from './ContentSourceStep';
```

5.2. Uncomment the export lines:
```typescript
// Task 3.1: ContentSourceStep
export { ContentSourceStep } from './ContentSourceStep';
export type { ContentSourceStepProps } from './ContentSourceStep';
```

**Verification Steps:**
- [ ] Lines 29-30 are uncommented
- [ ] `ContentSourceStep` is exported
- [ ] `ContentSourceStepProps` type is exported
- [ ] No TypeScript compilation errors
- [ ] Import from `./components/steps` works correctly

---

### Task 6: Integrate ContentSourceStep with Main Workflow

**Estimated Effort:** 20 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Description:**
Update the main workflow component to import and render ContentSourceStep, and wire up the necessary state actions.

**Subtasks:**

6.1. Update imports (line 19):
```typescript
// Change from:
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep } from './components/steps';

// To:
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep } from './components/steps';
```

6.2. Add `selectContentSource` to useWorkflowState destructuring (~line 90-106):
```typescript
const {
  state,
  nextStep,
  prevStep,
  goToStep,
  canGoBack,
  canGoNext,
  progressPercent,
  currentStepIndex,
  totalSteps,
  itemCount,
  reset,
  selectRoom,
  selectItemType,
  selectSpecificItem,
  setItemName,
  selectContentSource,  // ADD THIS LINE
} = useWorkflowState();
```

6.3. Replace placeholder in `renderCurrentStep` (~line 184-185):
```typescript
// Change from:
case 'content-source-selection':
  return <StepPlaceholder step="content-source-selection" {...commonProps} />;

// To:
case 'content-source-selection':
  return (
    <ContentSourceStep
      currentContentSource={state.currentItem?.contentSource ?? null}
      onSelectContentSource={selectContentSource}
      onNext={nextStep}
      canNext={canGoNext}
    />
  );
```

6.4. Update useCallback dependencies (~line 200):
```typescript
// Add selectContentSource to the dependency array:
}, [state.currentStep, state.currentItem, state.session.items, nextStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectContentSource]);
```

**Verification Steps:**
- [ ] `ContentSourceStep` is imported from steps index
- [ ] `selectContentSource` is destructured from useWorkflowState
- [ ] `renderCurrentStep` returns `ContentSourceStep` for 'content-source-selection' case
- [ ] Props passed to ContentSourceStep are correct
- [ ] useCallback dependency array includes `selectContentSource`
- [ ] No TypeScript compilation errors
- [ ] Component renders when navigating to content-source-selection step

---

### Task 7: Create Unit Test File Structure

**Estimated Effort:** 15 minutes
**Story Points:** 0.25

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx`

**Description:**
Create the test file with proper setup, imports, and default props structure.

**Subtasks:**

7.1. Create the `__tests__` directory if it doesn't exist

7.2. Create the test file with imports:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentSourceStep } from '../ContentSourceStep';
```

7.3. Set up default props and beforeEach:
```typescript
describe('ContentSourceStep', () => {
  const defaultProps = {
    currentContentSource: null,
    onSelectContentSource: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests will be added in subsequent tasks
});
```

**Verification Steps:**
- [ ] Test file exists at correct path
- [ ] Imports are valid
- [ ] Default props mock functions are defined
- [ ] `beforeEach` clears mocks between tests
- [ ] File runs without errors (even if no tests yet)

---

### Task 8: Write Rendering Tests

**Estimated Effort:** 20 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx`

**Description:**
Add tests to verify the component renders correctly with all expected elements.

**Subtasks:**

8.1. Add rendering test group:
```typescript
describe('Rendering', () => {
```

8.2. Test both content source options render:
```typescript
it('renders both content source options', () => {
  render(<ContentSourceStep {...defaultProps} />);

  expect(screen.getByText('I have content')).toBeInTheDocument();
  expect(screen.getByText('Create now')).toBeInTheDocument();
});
```

8.3. Test descriptions render:
```typescript
it('displays description for each option', () => {
  render(<ContentSourceStep {...defaultProps} />);

  expect(screen.getByText(/Upload existing videos, photos, PDFs/i)).toBeInTheDocument();
  expect(screen.getByText(/Record videos, take photos/i)).toBeInTheDocument();
});
```

8.4. Test examples chips render:
```typescript
it('displays content type examples for each option', () => {
  render(<ContentSourceStep {...defaultProps} />);

  // Existing option examples
  expect(screen.getByText('Upload Video')).toBeInTheDocument();
  expect(screen.getByText('Upload PDF')).toBeInTheDocument();
  expect(screen.getByText('Paste URL')).toBeInTheDocument();

  // Create new option examples
  expect(screen.getByText('Record Video')).toBeInTheDocument();
  expect(screen.getByText('Take Photo')).toBeInTheDocument();
});
```

8.5. Test step header renders:
```typescript
it('renders step header with correct text', () => {
  render(<ContentSourceStep {...defaultProps} />);

  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('How would you like to add content?');
});
```

**Verification Steps:**
- [ ] All rendering tests pass
- [ ] Tests verify both options are displayed
- [ ] Tests verify descriptions are present
- [ ] Tests verify example chips are rendered
- [ ] Tests verify step header is correct

---

### Task 9: Write Selection Tests

**Estimated Effort:** 25 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx`

**Description:**
Add tests to verify selection behavior works correctly.

**Subtasks:**

9.1. Add selection test group:
```typescript
describe('Selection', () => {
```

9.2. Test clicking "I have content" calls handler with 'existing':
```typescript
it('calls onSelectContentSource with existing when I have content is clicked', () => {
  render(<ContentSourceStep {...defaultProps} />);

  fireEvent.click(screen.getByText('I have content'));

  expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('existing');
  expect(defaultProps.onSelectContentSource).toHaveBeenCalledTimes(1);
});
```

9.3. Test clicking "Create now" calls handler with 'create-new':
```typescript
it('calls onSelectContentSource with create-new when Create now is clicked', () => {
  render(<ContentSourceStep {...defaultProps} />);

  fireEvent.click(screen.getByText('Create now'));

  expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('create-new');
  expect(defaultProps.onSelectContentSource).toHaveBeenCalledTimes(1);
});
```

9.4. Test selected styling appears:
```typescript
it('shows selected styling when existing option is selected', () => {
  render(<ContentSourceStep {...defaultProps} currentContentSource="existing" />);

  const selectedCard = screen.getByRole('radio', { checked: true });
  expect(selectedCard).toHaveClass('border-blue-500');
  expect(selectedCard).toHaveClass('bg-blue-50');
});
```

9.5. Test checkmark appears on selected option:
```typescript
it('displays checkmark on selected option', () => {
  render(<ContentSourceStep {...defaultProps} currentContentSource="create-new" />);

  // The checkmark should be inside the selected card
  const selectedCard = screen.getByRole('radio', { checked: true });
  expect(selectedCard.querySelector('svg')).toBeInTheDocument();
});
```

**Verification Steps:**
- [ ] All selection tests pass
- [ ] Clicking "I have content" calls handler with 'existing'
- [ ] Clicking "Create now" calls handler with 'create-new'
- [ ] Selected option has correct styling classes
- [ ] Checkmark appears on selected option

---

### Task 10: Write Navigation Tests

**Estimated Effort:** 15 minutes
**Story Points:** 0.25

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx`

**Description:**
Add tests to verify Continue button behavior.

**Subtasks:**

10.1. Add navigation test group:
```typescript
describe('Navigation', () => {
```

10.2. Test Continue button enabled when canNext is true:
```typescript
it('enables Continue button when canNext is true', () => {
  render(<ContentSourceStep {...defaultProps} canNext={true} />);

  const button = screen.getByRole('button', { name: /continue/i });
  expect(button).not.toBeDisabled();
});
```

10.3. Test Continue button disabled when canNext is false:
```typescript
it('disables Continue button when canNext is false', () => {
  render(<ContentSourceStep {...defaultProps} canNext={false} />);

  const button = screen.getByRole('button', { name: /continue/i });
  expect(button).toBeDisabled();
});
```

10.4. Test Continue button calls onNext when clicked and enabled:
```typescript
it('calls onNext when Continue is clicked and canNext is true', () => {
  render(<ContentSourceStep {...defaultProps} canNext={true} />);

  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
});
```

10.5. Test Continue button does not call onNext when disabled:
```typescript
it('does not call onNext when Continue is clicked and canNext is false', () => {
  render(<ContentSourceStep {...defaultProps} canNext={false} />);

  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  expect(defaultProps.onNext).not.toHaveBeenCalled();
});
```

**Verification Steps:**
- [ ] All navigation tests pass
- [ ] Continue button correctly reflects canNext state
- [ ] onNext is called only when canNext is true

---

### Task 11: Write Accessibility Tests

**Estimated Effort:** 20 minutes
**Story Points:** 0.5

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx`

**Description:**
Add tests to verify accessibility features are implemented correctly.

**Subtasks:**

11.1. Add accessibility test group:
```typescript
describe('Accessibility', () => {
```

11.2. Test radiogroup role is present:
```typescript
it('has radiogroup role on container', () => {
  render(<ContentSourceStep {...defaultProps} />);

  expect(screen.getByRole('radiogroup')).toBeInTheDocument();
});
```

11.3. Test aria-label on radiogroup:
```typescript
it('has aria-label on radiogroup', () => {
  render(<ContentSourceStep {...defaultProps} />);

  expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Select content source');
});
```

11.4. Test cards have radio role:
```typescript
it('renders cards with radio role', () => {
  render(<ContentSourceStep {...defaultProps} />);

  const radios = screen.getAllByRole('radio');
  expect(radios).toHaveLength(2);
});
```

11.5. Test keyboard selection with Enter:
```typescript
it('supports keyboard selection with Enter key', () => {
  render(<ContentSourceStep {...defaultProps} />);

  const card = screen.getByText('I have content').closest('button');
  fireEvent.keyDown(card!, { key: 'Enter' });

  expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('existing');
});
```

11.6. Test keyboard selection with Space:
```typescript
it('supports keyboard selection with Space key', () => {
  render(<ContentSourceStep {...defaultProps} />);

  const card = screen.getByText('Create now').closest('button');
  fireEvent.keyDown(card!, { key: ' ' });

  expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('create-new');
});
```

11.7. Test aria-checked updates:
```typescript
it('updates aria-checked when selection changes', () => {
  const { rerender } = render(<ContentSourceStep {...defaultProps} />);

  const radios = screen.getAllByRole('radio');
  expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  expect(radios[1]).toHaveAttribute('aria-checked', 'false');

  rerender(<ContentSourceStep {...defaultProps} currentContentSource="existing" />);
  expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  expect(radios[1]).toHaveAttribute('aria-checked', 'false');
});
```

**Verification Steps:**
- [ ] All accessibility tests pass
- [ ] radiogroup role is present on container
- [ ] aria-label describes the selection purpose
- [ ] Cards have radio role with correct aria-checked
- [ ] Keyboard navigation works for both Enter and Space

---

### Task 12: Run Full Test Suite and Fix Issues

**Estimated Effort:** 20 minutes
**Story Points:** 0.5

**Description:**
Run all tests, verify they pass, and fix any issues discovered.

**Subtasks:**

12.1. Run the test file:
```bash
npm test -- ContentSourceStep.test.tsx
```

12.2. Address any failing tests by checking:
- Component implementation matches test expectations
- Mock functions are properly reset between tests
- Selectors correctly target elements

12.3. Run the full test suite to ensure no regressions:
```bash
npm test
```

12.4. Verify TypeScript compilation:
```bash
npm run type-check
```

12.5. Run linting:
```bash
npm run lint
```

**Verification Steps:**
- [ ] All ContentSourceStep tests pass
- [ ] No regressions in other tests
- [ ] TypeScript compilation succeeds
- [ ] Linting passes with no errors

---

### Task 13: Manual Integration Testing

**Estimated Effort:** 15 minutes
**Story Points:** 0.25

**Description:**
Manually test the component in the browser to verify integration with the workflow.

**Subtasks:**

13.1. Start the development server:
```bash
npm run dev
```

13.2. Navigate to the item creation workflow

13.3. Progress through steps 1-3 (Room Selection, Item Type, Specific Item)

13.4. Verify on step 4 (Content Source Selection):
- Both "I have content" and "Create now" cards display
- Cards show correct icons, titles, descriptions, and examples
- Clicking a card selects it (blue styling, checkmark)
- Continue button enables after selection
- Clicking Continue advances to step 5

13.5. Test back navigation:
- Click back button from step 5
- Verify content source selection is preserved
- Verify can reselect and continue again

13.6. Test content source reset behavior:
- Select "I have content" and continue
- Navigate back and select "Create now"
- Verify state updates correctly

**Verification Steps:**
- [ ] Component renders correctly in browser
- [ ] Visual styling matches design system
- [ ] Selection behavior works as expected
- [ ] Navigation forward and backward works
- [ ] Selection state is preserved on back navigation
- [ ] Mobile responsiveness verified (use device toolbar)

---

## Summary

| Task | Description | Estimated Effort | Story Points |
|------|-------------|------------------|--------------|
| 1 | Create component file structure | 20 min | 0.25 |
| 2 | Define card data constant | 15 min | 0.25 |
| 3 | Implement ContentSourceCard component | 35 min | 0.5 |
| 4 | Implement main ContentSourceStep component | 25 min | 0.5 |
| 5 | Update step barrel exports | 5 min | 0.1 |
| 6 | Integrate with main workflow | 20 min | 0.5 |
| 7 | Create test file structure | 15 min | 0.25 |
| 8 | Write rendering tests | 20 min | 0.5 |
| 9 | Write selection tests | 25 min | 0.5 |
| 10 | Write navigation tests | 15 min | 0.25 |
| 11 | Write accessibility tests | 20 min | 0.5 |
| 12 | Run full test suite | 20 min | 0.5 |
| 13 | Manual integration testing | 15 min | 0.25 |
| **Total** | | **~4 hours** | **~4.5** |

---

## Acceptance Criteria Checklist

From REQ-102:

- [x] Two distinct choice cards are presented: "I have content" and "Create now"
- [x] Each card displays a clear title and description explaining the option
- [x] Each card shows examples of what content types will be available for that choice
- [x] User can select exactly one content source option by clicking a card
- [x] Selection state is visually indicated on the chosen card
- [x] Continue button is disabled until a content source is selected
- [x] Selecting "I have content" stores 'existing' in workflow state
- [x] Selecting "Create now" stores 'create-new' in workflow state
- [x] Component follows established patterns from ItemTypeStep and RoomSelectionStep implementations

**Implementation Notes (2026-01-06):**
- ContentSourceStep.tsx created with ContentSourceCard inline component
- Unit tests created in ContentSourceStep.test.tsx (rendering, selection, navigation, accessibility)
- Component integrated with main ItemCreationWorkflow.tsx
- Build verified successfully

---

## References

- [REQ-102 in gen_requests.md](./gen_requests.md) - Original request
- [REQ-102-content-source-step-overview.md](./REQ-102-content-source-step-overview.md) - Technical overview
- [Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md) - Implementation plan
- [ItemTypeCard.tsx](../src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx) - Pattern reference
- [ItemTypeStep.tsx](../src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx) - Step structure reference
- [useWorkflowState.ts](../src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts) - State management reference
