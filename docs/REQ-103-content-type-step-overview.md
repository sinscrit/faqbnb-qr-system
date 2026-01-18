# REQ-103: Content Type Selection Step with Dynamic Options - Implementation Breakdown

**Document Generated:** 2026-01-05 23:15 UTC
**Last Modified:** 2026-01-05 23:15 UTC
**Request Reference:** REQ-103 (Content Type Selection Step with Dynamic Options)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 3 - Content Selection Steps (4-5)
**Task ID:** 3.2

---

## Overview

This document provides a detailed implementation breakdown for the Content Type Selection Step component, the fifth step in the Item Creation Workflow. The component enables users to select the specific type of content they want to add, with available options dynamically filtered based on their previous content source selection. For users who chose "I have content" (existing), the component displays upload-oriented options. For users who chose "Create now" (create-new), the component displays creation-oriented options.

### Context from Implementation Plan

From the Implementation Plan (Phase 3, Task 3.2):

> **Task 3.2: Content Type Step [1 day]**
> - [ ] Create `ContentTypeStep.tsx` component
> - [ ] Dynamic options based on content source selection
> - [ ] Icon-labeled cards for each content type
> - [ ] For "I have content": Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
> - [ ] For "Create now": Record Video, Take Photo, Write Text

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Acceptance Criteria (from Plan and REQ-103):**
- Content type options are rendered as icon-labeled cards
- For "I have content" source, exactly five options appear: Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
- For "Create now" source, exactly three options appear: Record Video, Take Photo, Write Text
- Each card displays an appropriate icon representing the content type
- Each card displays a clear, descriptive label matching the content type
- User can select exactly one content type by clicking a card
- Selected card shows visual indication of active selection state
- Continue button is disabled until a content type is selected
- Selected content type is stored in workflow state as content-type field
- Component retrieves content source from workflow state to determine which options to display
- Component follows established patterns from previous step implementations
- Component is exported from steps index file for integration into workflow renderer
- Icon selections are visually distinct and clearly communicate each content type's purpose

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
| **ContentSourceStep** | Complete | `components/steps/ContentSourceStep.tsx` |
| **Main Workflow Component** | Complete | `ItemCreationWorkflow.tsx` |
| **Step Barrel Export** | Ready (commented) | `components/steps/index.ts` |

### Content Type Definition

From `ItemCreationWorkflow.types.ts` (lines 88-91):

```typescript
/**
 * Content type categories for item content.
 */
export type ContentType = 'video' | 'photo' | 'pdf' | 'text' | 'url';
```

### Current Item State Content Type Field

From `ItemCreationWorkflow.types.ts` (lines 152-153):

```typescript
/** Selected content type (null until chosen) */
contentType: ContentType | null;
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
selectContentType: (type: ContentType) => void;

// State access
state.currentItem?.contentType     // Currently selected content type
state.currentItem?.contentSource   // Content source determining available options

// Navigation
canGoNext: boolean;          // True when contentType is set
nextStep: () => void;        // Advance to content-creation
```

**Reducer Action (from `useWorkflowState.ts` lines 308-319):**
```typescript
case 'SELECT_CONTENT_TYPE': {
  if (!state.currentItem) return state;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    contentType: action.payload,
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

**canGoNext Logic (from `useWorkflowState.ts` lines 708-709):**
```typescript
case 'content-type-selection':
  return state.currentItem?.contentType != null;
```

**Step Transition (from `useWorkflowState.ts` lines 48-49):**
```typescript
'content-source-selection': ['content-type-selection'],
'content-type-selection': ['content-creation'],
```

---

## Technical Approach

### Component Architecture

```
ContentTypeStep.tsx
├── Step heading (dynamic based on content source)
├── Step description (contextual)
├── Content type cards (grid layout)
│   ├── ContentTypeCard[] (varies by content source)
│   │   ├── For "existing": 5 cards (Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL)
│   │   └── For "create-new": 3 cards (Record Video, Take Photo, Write Text)
└── Continue button (enabled when valid selection)
```

### Props Interface

```typescript
export interface ContentTypeStepProps {
  /** Current content source from state (determines available options) */
  currentContentSource: 'existing' | 'create-new';
  /** Current selected content type from state */
  currentContentType: ContentType | null;
  /** Handler to select a content type */
  onSelectContentType: (type: ContentType) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

### Content Type Card Component (Inline)

Following the established pattern from `ContentSourceStep.tsx`, the card component will be implemented inline within the step component. Each card displays:
- Icon representing the specific content type and action
- Label describing the content type (e.g., "Upload Video", "Record Video")

### Content Type Card Data

```typescript
type ContentTypeOption = {
  type: ContentType;
  label: string;
  icon: LucideIcon;
};

// For "I have content" (existing)
const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon },
  { type: 'pdf', label: 'Upload PDF', icon: FileText },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];

// For "Create now" (create-new)
const CREATE_NEW_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Record Video', icon: Video },
  { type: 'photo', label: 'Take Photo', icon: Camera },
  { type: 'text', label: 'Write Text', icon: PenLine },
];
```

### Icon Selection Rationale

| Content Type | "Existing" Icon | "Create New" Icon | Rationale |
|--------------|-----------------|-------------------|-----------|
| Video | Upload | Video | Upload shows file transfer; Video shows recording |
| Photo | Image | Camera | Image shows file; Camera shows capture |
| PDF | FileText | N/A | PDF is upload-only |
| Text | Type | PenLine | Type shows pasting; PenLine shows writing |
| URL | Link | N/A | URL is paste-only |

### Layout Considerations

- Cards displayed in a responsive grid (2 columns on desktop, 1 on mobile)
- Each card is full-width within its column
- Card height: compact to fit more options (~80-100px)
- Gap between cards: 12px (`gap-3`)
- Grid layout: `grid-cols-1 sm:grid-cols-2`
- Continue button at bottom with separator border

### Dynamic Header Text

The step header should reflect the content source selection:
- For "existing": "What type of content will you upload?"
- For "create-new": "What type of content will you create?"

---

## Implementation Tasks

### Task 1: Create ContentTypeStep Component Structure [20 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `ContentTypeStepProps` interface
3. Define `ContentTypeOption` type
4. Define `EXISTING_CONTENT_OPTIONS` and `CREATE_NEW_OPTIONS` arrays
5. Implement component structure with dynamic step header
6. Apply consistent Tailwind styling per design system

**Code Structure:**
```typescript
'use client';

/**
 * ContentTypeStep Component
 *
 * Step 5 of the item creation workflow.
 * Displays content type options dynamically based on the user's content source selection.
 * For "I have content": Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
 * For "Create now": Record Video, Take Photo, Write Text
 *
 * @module ItemCreationWorkflow/components/steps/ContentTypeStep
 * @see docs/REQ-103-content-type-step-overview.md
 * @lastModified 2026-01-05
 */

import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Type,
  Link,
  Video,
  Camera,
  PenLine,
  Check,
  type LucideIcon,
} from 'lucide-react';
import type { ContentType } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Type Definitions
// =============================================================================

interface ContentTypeOption {
  type: ContentType;
  label: string;
  icon: LucideIcon;
}

export interface ContentTypeStepProps {
  currentContentSource: 'existing' | 'create-new';
  currentContentType: ContentType | null;
  onSelectContentType: (type: ContentType) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}

// =============================================================================
// Content Type Options
// =============================================================================

const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon },
  { type: 'pdf', label: 'Upload PDF', icon: FileText },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];

const CREATE_NEW_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Record Video', icon: Video },
  { type: 'photo', label: 'Take Photo', icon: Camera },
  { type: 'text', label: 'Write Text', icon: PenLine },
];

export function ContentTypeStep({
  currentContentSource,
  currentContentType,
  onSelectContentType,
  onNext,
  canNext,
  className,
}: ContentTypeStepProps) {
  // ... implementation
}
```

### Task 2: Implement Content Type Cards [30 min]

**Subtasks:**
1. Create inline `ContentTypeCard` component
2. Apply compact card styling (icon + label)
3. Add selection styling (blue border/background when selected)
4. Add checkmark indicator for selected state
5. Add radiogroup role and aria-label for accessibility
6. Implement keyboard navigation (Enter/Space)

**Card Implementation:**
```tsx
// Inline ContentTypeCard component
function ContentTypeCard({
  option,
  isSelected,
  onSelect,
}: {
  option: ContentTypeOption;
  isSelected: boolean;
  onSelect: (type: ContentType) => void;
}) {
  const Icon = option.icon;

  const handleClick = () => onSelect(option.type);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(option.type);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Layout - horizontal with icon left, label right
        'flex items-center gap-3',
        'w-full rounded-xl border-2',
        // Sizing - compact card
        'min-h-[80px] p-4',
        // Touch optimization
        'touch-manipulation select-none',
        // Transitions
        'transition-all duration-200',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        // Selection states
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'
      )}
    >
      {/* Icon Section */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12',
          'flex items-center justify-center',
          'rounded-lg',
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5 sm:w-6 sm:h-6',
            isSelected ? 'text-blue-600' : 'text-gray-500'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Label Section */}
      <span
        className={cn(
          'flex-1 text-left text-base sm:text-lg font-medium',
          isSelected ? 'text-blue-700' : 'text-gray-900'
        )}
      >
        {option.label}
      </span>

      {/* Checkmark indicator for selected state */}
      {isSelected && (
        <div className="flex-shrink-0">
          <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
        </div>
      )}
    </button>
  );
}
```

### Task 3: Implement Main Component with Dynamic Options [20 min]

**Subtasks:**
1. Use `useMemo` to select options based on content source
2. Create responsive grid container for cards
3. Iterate over content type options and render cards
4. Pass proper props: option, isSelected, onSelect
5. Add appropriate spacing between cards (`gap-3`)
6. Ensure radiogroup role and aria-label for accessibility
7. Implement dynamic header and description text

**Main Component Implementation:**
```tsx
export function ContentTypeStep({
  currentContentSource,
  currentContentType,
  onSelectContentType,
  onNext,
  canNext,
  className,
}: ContentTypeStepProps) {
  // Determine which options to show based on content source
  const contentOptions = useMemo(() => {
    return currentContentSource === 'existing'
      ? EXISTING_CONTENT_OPTIONS
      : CREATE_NEW_OPTIONS;
  }, [currentContentSource]);

  // Dynamic header text based on content source
  const headerText = currentContentSource === 'existing'
    ? 'What type of content will you upload?'
    : 'What type of content will you create?';

  const descriptionText = currentContentSource === 'existing'
    ? 'Select the format of your existing content'
    : 'Choose how you want to capture this item';

  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          {headerText}
        </h2>
        <p className="text-base text-[#717171]">
          {descriptionText}
        </p>
      </div>

      {/* Content type cards grid */}
      <div
        role="radiogroup"
        aria-label="Select content type"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {contentOptions.map((option) => (
          <ContentTypeCard
            key={option.type}
            option={option}
            isSelected={currentContentType === option.type}
            onSelect={onSelectContentType}
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

export default ContentTypeStep;
```

### Task 4: Update Barrel Exports [5 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Subtasks:**
1. Uncomment the `ContentTypeStep` export lines (lines 33-34)
2. Verify export syntax is correct

**Change:**
```typescript
// Task 3.2: ContentTypeStep
export { ContentTypeStep } from './ContentTypeStep';
export type { ContentTypeStepProps } from './ContentTypeStep';
```

### Task 5: Integrate with Main Workflow [15 min]

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Subtasks:**
1. Import `ContentTypeStep` from steps index
2. Add `selectContentType` to destructured values from `useWorkflowState`
3. Replace `StepPlaceholder` in `case 'content-type-selection'` with `ContentTypeStep`
4. Pass required props from workflow state and actions

**Integration Changes:**

1. **Update imports (line 19):**
```tsx
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep } from './components/steps';
```

2. **Add to useWorkflowState destructuring (~line 90-107):**
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
  selectContentSource,
  selectContentType,  // ADD THIS
} = useWorkflowState();
```

3. **Replace placeholder in renderCurrentStep (~line 194-195):**
```tsx
case 'content-type-selection':
  return (
    <ContentTypeStep
      currentContentSource={state.currentItem?.contentSource ?? 'existing'}
      currentContentType={state.currentItem?.contentType ?? null}
      onSelectContentType={selectContentType}
      onNext={nextStep}
      canNext={canGoNext}
    />
  );
```

4. **Update useCallback dependencies (~line 208):**
```tsx
}, [state.currentStep, state.currentItem, state.session.items, nextStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName, selectContentSource, selectContentType]);
```

### Task 6: Write Unit Tests [40 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx`

**Test Cases:**

1. **Rendering for "existing" content source:**
   - Renders exactly five content type options
   - Displays Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
   - Each option has correct icon
   - Step header shows "What type of content will you upload?"

2. **Rendering for "create-new" content source:**
   - Renders exactly three content type options
   - Displays Record Video, Take Photo, Write Text
   - Each option has correct icon
   - Step header shows "What type of content will you create?"

3. **Selection:**
   - Clicking a content type card calls `onSelectContentType` with correct type
   - Selected option shows selected visual state (blue styling)
   - Checkmark appears on selected option
   - Only one option can be selected at a time

4. **Navigation:**
   - Continue button calls `onNext` when clicked and `canNext` is true
   - Continue button disabled when `canNext` is false
   - Continue button has proper disabled styling

5. **Accessibility:**
   - radiogroup role is present on container
   - aria-label describes the selection purpose
   - Each card has role="radio" and aria-checked state
   - Keyboard navigation works (Enter/Space to select)

**Test Template:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentTypeStep } from '../ContentTypeStep';

describe('ContentTypeStep', () => {
  const defaultPropsExisting = {
    currentContentSource: 'existing' as const,
    currentContentType: null,
    onSelectContentType: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  const defaultPropsCreateNew = {
    currentContentSource: 'create-new' as const,
    currentContentType: null,
    onSelectContentType: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering for existing content source', () => {
    it('renders exactly five content type options', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(5);
    });

    it('displays correct labels for existing content', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByText('Upload Video')).toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      expect(screen.getByText('Paste Text')).toBeInTheDocument();
      expect(screen.getByText('Paste URL')).toBeInTheDocument();
    });

    it('renders correct header for upload context', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByRole('heading')).toHaveTextContent(
        'What type of content will you upload?'
      );
    });
  });

  describe('Rendering for create-new content source', () => {
    it('renders exactly three content type options', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
    });

    it('displays correct labels for create-new content', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      expect(screen.getByText('Record Video')).toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
      expect(screen.getByText('Write Text')).toBeInTheDocument();
    });

    it('renders correct header for creation context', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      expect(screen.getByRole('heading')).toHaveTextContent(
        'What type of content will you create?'
      );
    });

    it('does not show upload-only options', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      expect(screen.queryByText('Upload PDF')).not.toBeInTheDocument();
      expect(screen.queryByText('Paste URL')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelectContentType with video when Upload Video is clicked', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      fireEvent.click(screen.getByText('Upload Video'));

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('video');
    });

    it('calls onSelectContentType with photo when Take Photo is clicked', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      fireEvent.click(screen.getByText('Take Photo'));

      expect(defaultPropsCreateNew.onSelectContentType).toHaveBeenCalledWith('photo');
    });

    it('shows selected styling when option is selected', () => {
      render(
        <ContentTypeStep {...defaultPropsExisting} currentContentType="video" />
      );

      const selectedCard = screen.getByRole('radio', { checked: true });
      expect(selectedCard).toHaveClass('border-blue-500');
    });

    it('shows checkmark on selected option', () => {
      render(
        <ContentTypeStep {...defaultPropsExisting} currentContentType="photo" />
      );

      // The checkmark should be visible for the selected option
      const selectedCard = screen.getByText('Upload Photo').closest('button');
      expect(selectedCard?.querySelector('[aria-hidden="true"]')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('enables Continue button when canNext is true', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={true} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Continue button when canNext is false', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={false} />);

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeDisabled();
    });

    it('calls onNext when Continue is clicked and canNext is true', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={true} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultPropsExisting.onNext).toHaveBeenCalled();
    });

    it('does not call onNext when Continue is clicked and canNext is false', () => {
      render(<ContentTypeStep {...defaultPropsExisting} canNext={false} />);

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(defaultPropsExisting.onNext).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has radiogroup role on container', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has aria-label on radiogroup', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        'Select content type'
      );
    });

    it('supports keyboard selection with Enter key', () => {
      render(<ContentTypeStep {...defaultPropsExisting} />);

      const card = screen.getByText('Upload Video').closest('button');
      fireEvent.keyDown(card!, { key: 'Enter' });

      expect(defaultPropsExisting.onSelectContentType).toHaveBeenCalledWith('video');
    });

    it('supports keyboard selection with Space key', () => {
      render(<ContentTypeStep {...defaultPropsCreateNew} />);

      const card = screen.getByText('Write Text').closest('button');
      fireEvent.keyDown(card!, { key: ' ' });

      expect(defaultPropsCreateNew.onSelectContentType).toHaveBeenCalledWith('text');
    });

    it('each card has correct aria-checked state', () => {
      render(
        <ContentTypeStep {...defaultPropsExisting} currentContentType="pdf" />
      );

      const pdfCard = screen.getByText('Upload PDF').closest('button');
      const videoCard = screen.getByText('Upload Video').closest('button');

      expect(pdfCard).toHaveAttribute('aria-checked', 'true');
      expect(videoCard).toHaveAttribute('aria-checked', 'false');
    });
  });
});
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Main step component |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx` | Unit tests |

### Files to Modify

| File Path | Modification | Functions/Sections |
|-----------|--------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Uncomment exports | Lines 33-34 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import ContentTypeStep, add selectContentType, replace placeholder | Imports (line 19), useWorkflowState destructuring (~line 90-107), `renderCurrentStep()` case 'content-type-selection' (~line 194-195), useCallback dependencies (~line 208) |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for ContentType |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `CONTENT_SOURCE_OPTIONS` for reference |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `selectContentType` action, `canGoNext` logic |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Pattern reference for card styling |
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Direct predecessor, pattern reference |
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Pattern reference for step structure |

---

## Integration Points

### With useWorkflowState Hook

The step component receives and uses:
- `state.currentItem?.contentSource` - Determines which options to display
- `state.currentItem?.contentType` - Currently selected content type
- `selectContentType(type)` - Action to update selected content type
- `canGoNext` - Computed validation (checks `contentType != null` for this step)
- `nextStep()` - Navigation to next step (`content-creation`)

### With Content Source Step (Previous Step)

The content source selection directly affects this step:
- When `contentSource === 'existing'`: Show Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
- When `contentSource === 'create-new'`: Show Record Video, Take Photo, Write Text

The filtering is handled by this component using the `currentContentSource` prop.

### With Content Creation Step (Next Step)

The content type selection determines the content creation interface:
- `video` → Video capture/upload interface
- `photo` → Photo capture/upload interface
- `pdf` → PDF upload interface
- `text` → Text editor interface
- `url` → URL input interface

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

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Step Title | 24px (2xl) | Semi-bold (600) |
| Step Description | 16px (base) | Normal (400) |
| Card Label | 16-18px | Medium (500) |
| Button | 18px (lg) | Semi-bold (600) |

### Spacing (8px Grid)

- Container padding: 24px (`p-6`)
- Card gap: 12px (`gap-3`)
- Card padding: 16px (`p-4`)
- Section spacing: 24px (`mb-6`)
- Button border-top margin: 32px (`mt-8 pt-6`)

### Touch Targets

- Minimum: 48x48px (WCAG 2.5.5)
- Content type cards: 80px min-height
- Continue button: Full width, 56px min-height (`min-h-[56px]`)

---

## Dependencies

### Required (Already Installed)

| Package | Usage |
|---------|-------|
| `react` | Component framework |
| `lucide-react` | Icons (Upload, Image, FileText, Type, Link, Video, Camera, PenLine, Check) |
| `@/lib/utils` | `cn()` utility for class merging |

### No New Dependencies Required

The implementation uses only existing infrastructure.

---

## Risk Assessment

### Low Risk
- **Component Structure:** Follows established patterns from `ContentSourceStep`
- **State Integration:** Uses existing `selectContentType` action
- **Styling:** Consistent with design system tokens
- **Dynamic Options:** Simple conditional rendering based on content source

### Verification Needed
- **Icon Import Names:** Verify `Image` doesn't conflict with Next.js Image (using `ImageIcon` alias)
  - **Mitigation:** Import as `Image as ImageIcon`

### Edge Cases
- User navigates back from Content Creation step - content type selection should be preserved
- User returns to Content Source step and changes selection - content type should be reset to null (handled by existing reducer)
- All handled by existing state machine

---

## Success Criteria

Per REQ-103 Acceptance Criteria:

- [ ] Content type options are rendered as icon-labeled cards
- [ ] For "I have content" source, exactly five options appear: Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
- [ ] For "Create now" source, exactly three options appear: Record Video, Take Photo, Write Text
- [ ] Each card displays an appropriate icon representing the content type
- [ ] Each card displays a clear, descriptive label matching the content type
- [ ] User can select exactly one content type by clicking a card
- [ ] Selected card shows visual indication of active selection state
- [ ] Continue button is disabled until a content type is selected
- [ ] Selected content type is stored in workflow state as content-type field
- [ ] Component retrieves content source from workflow state to determine which options to display
- [ ] Component follows established patterns from previous step implementations
- [ ] Component is exported from steps index file for integration into workflow renderer
- [ ] Icon selections are visually distinct and clearly communicate each content type's purpose

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Create component structure | 20 min |
| Task 2: Implement content type cards | 30 min |
| Task 3: Implement main component | 20 min |
| Task 4: Update barrel exports | 5 min |
| Task 5: Integrate with workflow | 15 min |
| Task 6: Write unit tests | 40 min |
| **Total** | **~2.5 hours** |

---

## References

- [REQ-103 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [ContentSourceStep Component](/src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx)
- [ItemTypeCard Component](/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx)
- [useWorkflowState Hook](/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [REQ-102 Overview (Pattern Reference)](/docs/REQ-102-content-source-step-overview.md)
