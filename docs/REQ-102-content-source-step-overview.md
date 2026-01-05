# REQ-102: Content Source Selection Step - Implementation Breakdown

**Document Generated:** 2026-01-05 22:30 UTC
**Last Modified:** 2026-01-05 22:30 UTC
**Request Reference:** REQ-102 (Content Source Selection Step for Item Creation Workflow)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 3 - Content Selection Steps (4-5)
**Task ID:** 3.1

---

## Overview

This document provides a detailed implementation breakdown for the Content Source Selection Step component, the fourth step in the Item Creation Workflow. The component enables users to choose whether they have existing content ready to upload (videos, photos, PDFs, text, URLs) or prefer to create new content on the spot using device capabilities. This choice influences which content type options appear in the subsequent Content Type Selection step.

### Context from Implementation Plan

From the Implementation Plan (Phase 3, Task 3.1):

> **Task 3.1: Content Source Step [0.5 days]**
> - [ ] Create `ContentSourceStep.tsx` component
> - [ ] Two options: "I have content" vs "Create now"
> - [ ] Clear descriptions for each option
> - [ ] Store selection in state for next step filtering

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`

**Acceptance Criteria (from Plan and REQ-102):**
- Two distinct choice cards are presented: "I have content" and "Create now"
- Each card displays a clear title and description explaining the option
- Each card shows examples of what content types will be available for that choice
- User can select exactly one content source option by clicking a card
- Selection state is visually indicated on the chosen card
- Continue button is disabled until a content source is selected
- Selecting "I have content" stores 'existing' in workflow state
- Selecting "Create now" stores 'create-new' in workflow state
- Component follows established patterns from ItemTypeStep and RoomSelectionStep implementations

---

## Current State Analysis

### Existing Infrastructure

The workflow foundation and previous steps are fully implemented:

| Component | Status | Location |
|-----------|--------|----------|
| **Type Definitions** | Complete | `ItemCreationWorkflow.types.ts` |
| **Constants (content source options)** | Complete | `utils/constants.ts` |
| **State Machine Hook** | Complete | `hooks/useWorkflowState.ts` |
| **ItemTypeCard Component** | Complete | `components/shared/ItemTypeCard.tsx` |
| **RoomSelectionStep** | Complete | `components/steps/RoomSelectionStep.tsx` |
| **ItemTypeStep** | Complete | `components/steps/ItemTypeStep.tsx` |
| **SpecificItemStep** | Complete | `components/steps/SpecificItemStep.tsx` |
| **Main Workflow Component** | Complete | `ItemCreationWorkflow.tsx` |
| **Step Barrel Export** | Ready (commented) | `components/steps/index.ts` |

### Content Source Type Definition

From `ItemCreationWorkflow.types.ts` (lines 149-150):

```typescript
/** Content source choice: existing upload or create new */
contentSource: 'existing' | 'create-new';
```

### Available Content Source Options

From `utils/constants.ts` (lines 127-144):

```typescript
export const CONTENT_SOURCE_OPTIONS = {
  existing: {
    video: 'Upload Video',
    photo: 'Upload Photo',
    pdf: 'Upload PDF',
    text: 'Paste Text',
    url: 'Paste URL',
  },
  'create-new': {
    video: 'Record Video',
    photo: 'Take Photo',
    text: 'Write Text',
  },
} as const;
```

### State Management Integration

The `useWorkflowState` hook provides:

```typescript
// Selection action
selectContentSource: (source: 'existing' | 'create-new') => void;

// State access
state.currentItem?.contentSource  // Currently selected content source

// Navigation
canGoNext: boolean;          // True when contentSource is set
nextStep: () => void;        // Advance to content-type-selection
```

**Reducer Action (from `useWorkflowState.ts` lines 290-306):**
```typescript
case 'SELECT_CONTENT_SOURCE': {
  if (!state.currentItem) return state;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    contentSource: action.payload,
    contentType: null, // Reset content type when source changes
  };
  return {
    ...state,
    currentItem: updatedItem,
    isDirty: true,
    session: {
      ...state.session,
      currentItem: updatedItem,
    },
  };
}
```

**canGoNext Logic (from `useWorkflowState.ts` lines 706-707):**
```typescript
case 'content-source-selection':
  return state.currentItem?.contentSource != null;
```

---

## Technical Approach

### Component Architecture

```
ContentSourceStep.tsx
├── Step heading ("How would you like to add content?")
├── Step description
├── Content source cards (vertical stack)
│   ├── ContentSourceCard ("I have content" - existing)
│   └── ContentSourceCard ("Create now" - create-new)
└── Continue button (enabled when valid selection)
```

### Props Interface

```typescript
export interface ContentSourceStepProps {
  /** Current selected content source from state */
  currentContentSource: 'existing' | 'create-new' | null;
  /** Handler to select a content source */
  onSelectContentSource: (source: 'existing' | 'create-new') => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

### Content Source Card Component (Inline)

Rather than creating a new shared component, the card will be implemented inline within the step component following the pattern of ItemTypeCard but simplified for the two-option use case. Each card displays:
- Icon representing the content source type
- Title: "I have content" or "Create now"
- Description explaining the option
- Examples of content types available for that choice

### Card Content Definitions

```typescript
const CONTENT_SOURCE_CARDS = {
  existing: {
    icon: Upload,  // from lucide-react
    title: 'I have content',
    description: 'Upload existing videos, photos, PDFs, or paste text and URLs',
    examples: ['Upload Video', 'Upload Photo', 'Upload PDF', 'Paste Text', 'Paste URL'],
  },
  'create-new': {
    icon: Camera,  // from lucide-react
    title: 'Create now',
    description: 'Record videos, take photos, or write text instructions on the spot',
    examples: ['Record Video', 'Take Photo', 'Write Text'],
  },
} as const;
```

### Layout Considerations

- Two cards displayed vertically in a flex column
- Each card is full-width with horizontal internal layout (icon left, text right)
- Card height should accommodate title, description, and examples list
- Minimum height: 140px (mobile), 160px (desktop)
- Gap between cards: 16px (`gap-4`)
- Continue button at bottom with separator border

---

## Implementation Tasks

### Task 1: Create ContentSourceStep Component Structure [25 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `ContentSourceStepProps` interface
3. Define `CONTENT_SOURCE_CARDS` constant with card data
4. Implement component structure with step header
5. Apply consistent Tailwind styling per design system

**Code Structure:**
```typescript
'use client';

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

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Camera, Check, type LucideIcon } from 'lucide-react';

// Type definitions
type ContentSource = 'existing' | 'create-new';

interface ContentSourceCardData {
  icon: LucideIcon;
  title: string;
  description: string;
  examples: readonly string[];
}

export interface ContentSourceStepProps {
  currentContentSource: ContentSource | null;
  onSelectContentSource: (source: ContentSource) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}

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

export function ContentSourceStep({
  currentContentSource,
  onSelectContentSource,
  onNext,
  canNext,
  className,
}: ContentSourceStepProps) {
  // ... implementation
}
```

### Task 2: Implement Content Source Cards [30 min]

**Subtasks:**
1. Create inline card component within the file
2. Map content source types to card components
3. Display icon, title, description, and examples list
4. Apply selection styling (blue border/background when selected)
5. Add checkmark indicator for selected state
6. Add radiogroup role and aria-label for accessibility

**Card Implementation:**
```tsx
// Inline ContentSourceCard component
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
  const Icon = data.icon;

  const handleClick = () => onSelect(source);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(source);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-describedby={`${source}-description`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-start gap-4',
        'w-full rounded-xl border-2',
        'min-h-[140px] p-4 sm:min-h-[160px] sm:p-6',
        'touch-manipulation select-none',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'
      )}
    >
      {/* Icon Section */}
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14',
          'flex items-center justify-center',
          'rounded-lg',
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        )}
      >
        <Icon
          className={cn(
            'w-6 h-6 sm:w-7 sm:h-7',
            isSelected ? 'text-blue-600' : 'text-gray-500'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Text Content Section */}
      <div className="flex-1 text-left">
        <span
          className={cn(
            'block text-base sm:text-lg font-semibold',
            isSelected ? 'text-blue-700' : 'text-gray-900'
          )}
        >
          {data.title}
        </span>
        <span
          id={`${source}-description`}
          className={cn(
            'block mt-1 text-sm',
            isSelected ? 'text-blue-600' : 'text-gray-500'
          )}
        >
          {data.description}
        </span>
        {/* Examples list */}
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
      </div>

      {/* Checkmark indicator for selected state */}
      {isSelected && (
        <div className="flex-shrink-0 self-center">
          <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
        </div>
      )}
    </button>
  );
}
```

### Task 3: Implement Main Component with Cards [15 min]

**Subtasks:**
1. Create vertical flex container for cards
2. Iterate over content source types and render cards
3. Pass proper props: source, data, isSelected, onSelect
4. Add appropriate spacing between cards (`gap-4`)
5. Ensure radiogroup role and aria-label for accessibility

**Main Component Implementation:**
```tsx
export function ContentSourceStep({
  currentContentSource,
  onSelectContentSource,
  onNext,
  canNext,
  className,
}: ContentSourceStepProps) {
  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  const contentSources: ContentSource[] = ['existing', 'create-new'];

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          How would you like to add content?
        </h2>
        <p className="text-base text-[#717171]">
          Choose whether to upload existing materials or create new content
        </p>
      </div>

      {/* Content source cards */}
      <div
        role="radiogroup"
        aria-label="Select content source"
        className="flex flex-col gap-4"
      >
        {contentSources.map((source) => (
          <ContentSourceCard
            key={source}
            source={source}
            data={CONTENT_SOURCE_CARDS[source]}
            isSelected={currentContentSource === source}
            onSelect={onSelectContentSource}
          />
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
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
      </div>
    </div>
  );
}

export default ContentSourceStep;
```

### Task 4: Update Barrel Exports [5 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Subtasks:**
1. Uncomment the `ContentSourceStep` export lines (lines 29-30)
2. Verify export syntax is correct

**Change:**
```typescript
// Task 3.1: ContentSourceStep
export { ContentSourceStep } from './ContentSourceStep';
export type { ContentSourceStepProps } from './ContentSourceStep';
```

### Task 5: Integrate with Main Workflow [15 min]

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Subtasks:**
1. Import `ContentSourceStep` from steps index
2. Add `selectContentSource` to destructured values from `useWorkflowState`
3. Replace `StepPlaceholder` in `case 'content-source-selection'` with `ContentSourceStep`
4. Pass required props from workflow state and actions

**Integration Changes:**

1. **Update imports (line 19):**
```tsx
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep } from './components/steps';
```

2. **Add to useWorkflowState destructuring (~line 102-106):**
```tsx
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
  selectContentSource,  // ADD THIS
} = useWorkflowState();
```

3. **Replace placeholder in renderCurrentStep (~line 184-185):**
```tsx
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

4. **Update useCallback dependencies (~line 200):**
```tsx
}, [state.currentStep, state.currentItem, state.session.items, nextStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectContentSource]);
```

### Task 6: Write Unit Tests [35 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentSourceStep.test.tsx`

**Test Cases:**

1. **Rendering:**
   - Renders both content source options ("I have content" and "Create now")
   - Each option displays correct icon, title, and description
   - Each option displays content type examples as chips
   - Step header and description are visible

2. **Selection:**
   - Clicking "I have content" card calls `onSelectContentSource` with 'existing'
   - Clicking "Create now" card calls `onSelectContentSource` with 'create-new'
   - Selected option shows selected visual state (blue styling)
   - Checkmark appears on selected option
   - Only one option can be selected at a time

3. **Navigation:**
   - Continue button calls `onNext` when clicked and `canNext` is true
   - Continue button disabled when `canNext` is false
   - Continue button has proper disabled styling

4. **Accessibility:**
   - radiogroup role is present on container
   - aria-label describes the selection purpose
   - Each card has role="radio" and aria-checked state
   - Keyboard navigation works (Enter/Space to select)
   - Description is connected via aria-describedby

**Test Template:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentSourceStep } from '../ContentSourceStep';

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

  describe('Rendering', () => {
    it('renders both content source options', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByText('I have content')).toBeInTheDocument();
      expect(screen.getByText('Create now')).toBeInTheDocument();
    });

    it('displays content type examples for each option', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByText('Upload Video')).toBeInTheDocument();
      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByText('Upload PDF')).toBeInTheDocument();
    });

    it('renders step header with correct text', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByRole('heading')).toHaveTextContent('How would you like to add content?');
    });
  });

  describe('Selection', () => {
    it('calls onSelectContentSource with existing when I have content is clicked', () => {
      render(<ContentSourceStep {...defaultProps} />);

      fireEvent.click(screen.getByText('I have content'));

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('existing');
    });

    it('calls onSelectContentSource with create-new when Create now is clicked', () => {
      render(<ContentSourceStep {...defaultProps} />);

      fireEvent.click(screen.getByText('Create now'));

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('create-new');
    });

    it('shows selected styling when option is selected', () => {
      render(<ContentSourceStep {...defaultProps} currentContentSource="existing" />);

      const selectedCard = screen.getByRole('radio', { checked: true });
      expect(selectedCard).toHaveClass('border-blue-500');
    });
  });

  describe('Navigation', () => {
    it('enables Continue button when canNext is true', () => {
      render(<ContentSourceStep {...defaultProps} canNext={true} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Continue button when canNext is false', () => {
      render(<ContentSourceStep {...defaultProps} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('calls onNext when Continue is clicked and canNext is true', () => {
      render(<ContentSourceStep {...defaultProps} canNext={true} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultProps.onNext).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has radiogroup role on container', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<ContentSourceStep {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Select content source');
    });

    it('supports keyboard selection with Enter key', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const card = screen.getByText('I have content').closest('button');
      fireEvent.keyDown(card!, { key: 'Enter' });

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('existing');
    });

    it('supports keyboard selection with Space key', () => {
      render(<ContentSourceStep {...defaultProps} />);

      const card = screen.getByText('Create now').closest('button');
      fireEvent.keyDown(card!, { key: ' ' });

      expect(defaultProps.onSelectContentSource).toHaveBeenCalledWith('create-new');
    });
  });
});
```

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
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import ContentSourceStep, add selectContentSource, replace placeholder | Imports (line 19), useWorkflowState destructuring (~line 102-106), `renderCurrentStep()` case 'content-source-selection' (~line 184-185), useCallback dependencies (~line 200) |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for content source type |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `CONTENT_SOURCE_OPTIONS` for reference |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `selectContentSource` action, `canGoNext` logic |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Pattern reference for card styling |
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Pattern reference for step structure |
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Pattern reference for step structure |

---

## Integration Points

### With useWorkflowState Hook

The step component receives and uses:
- `state.currentItem?.contentSource` - Currently selected content source
- `selectContentSource(source)` - Action to update selected content source
- `canGoNext` - Computed validation (checks `contentSource != null` for this step)
- `nextStep()` - Navigation to next step (`content-type-selection`)

**Content Source Resets Content Type:**
From `useWorkflowState.ts` lines 290-306, when `SELECT_CONTENT_SOURCE` is dispatched, the reducer automatically resets `contentType` to `null`. This ensures the user must re-select a content type if they change their content source choice.

### With Content Type Step (Next Step)

The content source selection directly affects the Content Type Step:
- When `contentSource === 'existing'`: Show Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
- When `contentSource === 'create-new'`: Show Record Video, Take Photo, Write Text

This filtering will be handled by ContentTypeStep using the `CONTENT_SOURCE_OPTIONS` constant.

### With Main Workflow

The step will be rendered by `ItemCreationWorkflow.tsx` in the `renderCurrentStep()` switch statement. Props are passed from the workflow's state hook.

---

## Design System Compliance

### Colors (Airbnb Design System)

| Element | Color | Token |
|---------|-------|-------|
| Text Primary | #222222 | `text-[#222222]` |
| Text Secondary | #717171 | `text-[#717171]` |
| Primary Button | #FF385C | `bg-[#FF385C]` |
| Primary Hover | #E31C5F | `hover:bg-[#E31C5F]` |
| Primary Active | #D70466 | `active:bg-[#D70466]` |
| Selection Border | blue-500 | `border-blue-500` |
| Selection Background | blue-50 | `bg-blue-50` |
| Selection Icon Background | blue-100 | `bg-blue-100` |
| Example Chips | gray-100/blue-100 | Varies by selection state |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Step Title | 24px (2xl) | Semi-bold (600) |
| Step Description | 16px (base) | Normal (400) |
| Card Title | 16-18px | Semi-bold (600) |
| Card Description | 14px (sm) | Normal (400) |
| Example Chips | 12px (xs) | Normal (400) |
| Button | 18px (lg) | Semi-bold (600) |

### Spacing (8px Grid)

- Container padding: 24px (`p-6`)
- Card gap: 16px (`gap-4`)
- Card padding: 16-24px (`p-4 sm:p-6`)
- Section spacing: 24-32px (`mt-6`, `mt-8`)
- Button border-top margin: 32px (`mt-8 pt-6`)
- Example chips margin-top: 12px (`mt-3`)
- Example chips gap: 8px (`gap-2`)

### Touch Targets

- Minimum: 48x48px (WCAG 2.5.5)
- Content source cards: 140px min-height (mobile), 160px (desktop)
- Continue button: Full width, 56px min-height (`min-h-[56px]`)

---

## Dependencies

### Required (Already Installed)

| Package | Usage |
|---------|-------|
| `react` | Component framework |
| `lucide-react` | Icons (Upload, Camera, Check) |
| `@/lib/utils` | `cn()` utility for class merging |

### No New Dependencies Required

The implementation uses only existing infrastructure.

---

## Risk Assessment

### Low Risk
- **Component Structure:** Follows established patterns from `ItemTypeStep`
- **State Integration:** Uses existing `selectContentSource` action
- **Styling:** Consistent with design system tokens
- **Card Pattern:** Similar to ItemTypeCard but inline

### Verification Needed
- **Content Source Reset Logic:** Verify that changing content source resets content type
  - **Mitigation:** Add test case for state reset behavior

### Edge Cases
- User navigates back from Content Type step - content source selection should be preserved
- User changes content source - content type should be reset to null
- All handled by existing state machine

---

## Success Criteria

Per REQ-102 Acceptance Criteria:

- [ ] Two distinct choice cards are presented: "I have content" and "Create now"
- [ ] Each card displays a clear title and description explaining the option
- [ ] Each card shows examples of what content types will be available for that choice
- [ ] User can select exactly one content source option by clicking a card
- [ ] Selection state is visually indicated on the chosen card
- [ ] Continue button is disabled until a content source is selected
- [ ] Selecting "I have content" stores 'existing' in workflow state
- [ ] Selecting "Create now" stores 'create-new' in workflow state
- [ ] Component follows established patterns from ItemTypeStep and RoomSelectionStep implementations

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Create component structure | 25 min |
| Task 2: Implement content source cards | 30 min |
| Task 3: Implement main component | 15 min |
| Task 4: Update barrel exports | 5 min |
| Task 5: Integrate with workflow | 15 min |
| Task 6: Write unit tests | 35 min |
| **Total** | **~2 hours** |

---

## References

- [REQ-102 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [ItemTypeCard Component](/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx)
- [ItemTypeStep Component](/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx)
- [RoomSelectionStep Component](/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx)
- [useWorkflowState Hook](/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [REQ-099 Overview (Pattern Reference)](/docs/REQ-099-item-type-selection-step-overview.md)
