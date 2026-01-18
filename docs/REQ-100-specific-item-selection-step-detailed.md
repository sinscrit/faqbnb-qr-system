# REQ-100: Specific Item Selection Step - Detailed Task Breakdown

**Document Created:** 2026-01-05 23:15 UTC
**Last Modified:** 2026-01-05 05:25 UTC
**Request Reference:** REQ-100 (Specific Item Selection Step in Item Creation Workflow)
**Overview Document:** [REQ-100-specific-item-selection-step-overview.md](/docs/REQ-100-specific-item-selection-step-overview.md)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 2 - Selection Steps (1-3)
**Task ID:** 2.3
**Estimated Total Effort:** ~3 hours

---

## Document Purpose

This document transforms the REQ-100 overview into granular, actionable implementation tasks. Each task is designed to be completed in a single focused work session (≤1 story point / few hours). Tasks include specific file paths, code patterns, verification steps, and testing requirements.

---

## Authorized Files and Functions for Modification

### Files to Create

| Task | File Path | Description |
|------|-----------|-------------|
| 1 | `src/components/ItemCreationWorkflow/hooks/useSuggestions.ts` | Dynamic suggestions hook |
| 2 | `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | Suggestion button component |
| 3 | `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Editable item name component |
| 4 | `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Main step component |
| 7 | `src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts` | Hook unit tests |
| 7 | `src/components/ItemCreationWorkflow/components/shared/__tests__/SuggestionButton.test.tsx` | Component tests |
| 7 | `src/components/ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor.test.tsx` | Component tests |
| 7 | `src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx` | Step component tests |

### Files to Modify

| Task | File Path | Modification Scope |
|------|-----------|-------------------|
| 5 | `src/components/ItemCreationWorkflow/hooks/index.ts` | Add useSuggestions export (lines 31-32) |
| 5 | `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add SuggestionButton, ItemNameEditor exports (lines 36-42) |
| 5 | `src/components/ItemCreationWorkflow/components/steps/index.ts` | Add SpecificItemStep export (lines 20-22) |
| 6 | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import SpecificItemStep, add actions, replace placeholder (lines 19, 103-104, 168-169) |

### Reference Files (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | ROOM_LABELS constant |
| `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` | getSuggestions function |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State machine actions |
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Pattern reference |
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Pattern reference |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Button pattern reference |

---

## Detailed Implementation Tasks

### Task 1: Create useSuggestions Hook

**File:** `src/components/ItemCreationWorkflow/hooks/useSuggestions.ts`
**Estimated Effort:** 25 minutes
**Dependencies:** None (uses existing suggestionMatrix.ts)

#### 1.1 Create File Structure

Create the file with proper header:

```typescript
'use client';

/**
 * useSuggestions - Dynamic suggestions hook for SpecificItemStep
 *
 * Provides contextual item suggestions based on room and item type,
 * with tracking of which suggestions have already been created in the session.
 *
 * @module ItemCreationWorkflow/hooks/useSuggestions
 * @see docs/REQ-100-specific-item-selection-step-overview.md
 * @lastModified 2026-01-05
 */
```

#### 1.2 Define Type Interfaces

Define the input and output types:

```typescript
import { useMemo, useCallback } from 'react';
import type { RoomType, ItemType, SessionItem } from '../ItemCreationWorkflow.types';
import { getSuggestions } from '../utils/suggestionMatrix';

export interface UseSuggestionsOptions {
  /** Currently selected room type */
  room: RoomType;
  /** Currently selected item type */
  itemType: ItemType;
  /** Items already created in this session */
  existingItems: SessionItem[];
}

export interface UseSuggestionsReturn {
  /** All suggestions for the room + item type combination */
  suggestions: string[];
  /** Set of suggestion names that have already been created */
  createdSuggestions: Set<string>;
  /** Helper to check if a specific suggestion was created */
  isCreated: (suggestion: string) => boolean;
  /** Whether there are any suggestions available */
  hasSuggestions: boolean;
}
```

#### 1.3 Implement Hook Logic

Implement the hook with memoization:

```typescript
export function useSuggestions({
  room,
  itemType,
  existingItems,
}: UseSuggestionsOptions): UseSuggestionsReturn {
  // Get suggestions based on room and item type
  const suggestions = useMemo(() => {
    return getSuggestions(room, itemType);
  }, [room, itemType]);

  // Calculate which suggestions have been created
  const createdSuggestions = useMemo(() => {
    const created = new Set<string>();
    for (const item of existingItems) {
      // Match items in same room by checking if name contains suggestion
      if (item.room === room) {
        for (const suggestion of suggestions) {
          // Case-insensitive check if item name contains the suggestion
          if (item.name.toLowerCase().includes(suggestion.toLowerCase())) {
            created.add(suggestion);
          }
        }
      }
    }
    return created;
  }, [existingItems, room, suggestions]);

  // Helper to check if a suggestion was created
  const isCreated = useCallback(
    (suggestion: string) => createdSuggestions.has(suggestion),
    [createdSuggestions]
  );

  return {
    suggestions,
    createdSuggestions,
    isCreated,
    hasSuggestions: suggestions.length > 0,
  };
}

export default useSuggestions;
```

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Hook returns correct suggestions for kitchen + appliance combination
- [ ] Hook returns empty array for 'other' room
- [ ] `isCreated()` correctly identifies previously created items
- [ ] Memoization works correctly (suggestions don't recalculate on unrelated changes)

---

### Task 2: Create SuggestionButton Component

**File:** `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx`
**Estimated Effort:** 20 minutes
**Dependencies:** None

#### 2.1 Create File Structure

Create the file with proper header:

```typescript
'use client';

/**
 * SuggestionButton Component
 *
 * Clickable button for item suggestions in SpecificItemStep.
 * Supports selected, unselected, and created (grayed out) states.
 *
 * @module ItemCreationWorkflow/components/shared/SuggestionButton
 * @see docs/REQ-100-specific-item-selection-step-overview.md
 * @lastModified 2026-01-05
 */

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
```

#### 2.2 Define Props Interface

```typescript
export interface SuggestionButtonProps {
  /** The suggestion text to display */
  label: string;
  /** Whether this suggestion is currently selected */
  isSelected: boolean;
  /** Whether this suggestion has been created (shows grayed out) */
  isCreated: boolean;
  /** Called when suggestion is clicked */
  onSelect: (label: string) => void;
  /** Optional CSS class name */
  className?: string;
}
```

#### 2.3 Implement Component

```typescript
export function SuggestionButton({
  label,
  isSelected,
  isCreated,
  onSelect,
  className,
}: SuggestionButtonProps) {
  const handleClick = () => {
    if (!isCreated) {
      onSelect(label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isCreated) {
      e.preventDefault();
      onSelect(label);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isCreated}
      disabled={isCreated}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base layout
        'flex items-center justify-between gap-2',
        'px-4 py-3 rounded-lg border-2',
        // Touch targets (48px minimum)
        'min-h-[48px]',
        // Touch optimization
        'touch-manipulation select-none',
        // Transitions
        'transition-all duration-150',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        // State-based styling
        isCreated
          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          : isSelected
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-[#222222] hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]',
        className
      )}
    >
      <span className="text-sm font-medium">{label}</span>

      {/* Status indicator */}
      {isCreated ? (
        <span className="text-xs text-gray-400">Created</span>
      ) : isSelected ? (
        <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
      ) : null}
    </button>
  );
}

export default SuggestionButton;
```

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Button renders label text correctly
- [ ] Selected state shows checkmark and blue styling
- [ ] Created state shows "Created" label and gray styling
- [ ] Created buttons are not clickable (disabled)
- [ ] Focus ring appears on keyboard focus
- [ ] Touch target is at least 48px height

---

### Task 3: Create ItemNameEditor Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`
**Estimated Effort:** 20 minutes
**Dependencies:** None

#### 3.1 Create File Structure

```typescript
'use client';

/**
 * ItemNameEditor Component
 *
 * Editable text field for the auto-generated item name.
 * Allows users to customize the "Room - Item" format name.
 *
 * @module ItemCreationWorkflow/components/shared/ItemNameEditor
 * @see docs/REQ-100-specific-item-selection-step-overview.md
 * @lastModified 2026-01-05
 */

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';
```

#### 3.2 Define Props Interface

```typescript
export interface ItemNameEditorProps {
  /** Current item name value */
  value: string;
  /** Called when name changes */
  onChange: (name: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

#### 3.3 Implement Component

```typescript
export function ItemNameEditor({
  value,
  onChange,
  placeholder = 'Enter item name',
  maxLength = 100,
  disabled = false,
  className,
}: ItemNameEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const characterCount = value.length;
  const isNearLimit = characterCount >= maxLength * 0.8;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor="item-name-editor"
        className="flex items-center gap-2 text-sm font-medium text-[#222222]"
      >
        <Pencil className="w-4 h-4 text-[#717171]" aria-hidden="true" />
        Item Name
      </label>

      <div className="relative">
        <input
          id="item-name-editor"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 pr-16 border-2 rounded-lg',
            'text-base text-[#222222] placeholder:text-[#717171]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#222222]',
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          )}
          aria-describedby="item-name-hint"
        />

        {/* Character counter */}
        <span
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'text-xs',
            isNearLimit ? 'text-amber-600' : 'text-[#717171]'
          )}
          aria-live="polite"
        >
          {characterCount}/{maxLength}
        </span>
      </div>

      <p id="item-name-hint" className="text-xs text-[#717171]">
        This name will appear on the QR code label
      </p>
    </div>
  );
}

export default ItemNameEditor;
```

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Input displays current value correctly
- [ ] onChange fires when typing
- [ ] Character counter updates in real-time
- [ ] Character counter turns amber when near limit (80%+)
- [ ] Disabled state prevents input
- [ ] Label and hint text display correctly

---

### Task 4: Create SpecificItemStep Component

**File:** `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
**Estimated Effort:** 35 minutes
**Dependencies:** Tasks 1-3 (useSuggestions, SuggestionButton, ItemNameEditor)

#### 4.1 Create File Structure

```typescript
'use client';

/**
 * SpecificItemStep Component
 *
 * Step 3 of the item creation workflow.
 * Displays contextual item suggestions and allows custom item entry.
 * Auto-generates item name as "Room - Item" format.
 *
 * @module ItemCreationWorkflow/components/steps/SpecificItemStep
 * @see docs/REQ-100-specific-item-selection-step-overview.md
 * @lastModified 2026-01-05
 */

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSuggestions } from '../../hooks';
import { SuggestionButton, ItemNameEditor } from '../shared';
import { ROOM_LABELS } from '../../utils/constants';
import type { RoomType, ItemType, SessionItem } from '../../ItemCreationWorkflow.types';
```

#### 4.2 Define Props Interface

```typescript
export interface SpecificItemStepProps {
  /** Currently selected room */
  currentRoom: RoomType;
  /** Currently selected item type */
  currentItemType: ItemType;
  /** Currently selected specific item (empty string if none) */
  currentSpecificItem: string;
  /** Current item name (auto-generated or user-edited) */
  currentItemName: string;
  /** Items already created in this session (for graying out) */
  existingSessionItems: SessionItem[];
  /** Handler to select a specific item */
  onSelectSpecificItem: (item: string) => void;
  /** Handler to edit the item name */
  onSetItemName: (name: string) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

#### 4.3 Implement Component

```typescript
export function SpecificItemStep({
  currentRoom,
  currentItemType,
  currentSpecificItem,
  currentItemName,
  existingSessionItems,
  onSelectSpecificItem,
  onSetItemName,
  onNext,
  canNext,
  className,
}: SpecificItemStepProps) {
  // Local state for custom item mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customItemValue, setCustomItemValue] = useState('');

  // Get suggestions for current room + item type
  const { suggestions, isCreated, hasSuggestions } = useSuggestions({
    room: currentRoom,
    itemType: currentItemType,
    existingItems: existingSessionItems,
  });

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setIsCustomMode(false);
      setCustomItemValue('');
      onSelectSpecificItem(suggestion);
    },
    [onSelectSpecificItem]
  );

  // Handle "Other" / custom option click
  const handleOtherClick = useCallback(() => {
    setIsCustomMode(true);
    // If there's existing custom value, select it
    if (customItemValue.trim()) {
      onSelectSpecificItem(customItemValue.trim());
    }
  }, [customItemValue, onSelectSpecificItem]);

  // Handle custom item input change
  const handleCustomItemChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCustomItemValue(value);
      if (value.trim()) {
        onSelectSpecificItem(value.trim());
      }
    },
    [onSelectSpecificItem]
  );

  // Handle continue button
  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  // Determine if a suggestion is currently selected (not custom mode)
  const isSuggestionSelected = (suggestion: string) =>
    !isCustomMode && currentSpecificItem === suggestion;

  // Room label for display
  const roomLabel = ROOM_LABELS[currentRoom] || currentRoom;

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          What specific item?
        </h2>
        <p className="text-base text-[#717171]">
          Select from suggestions or enter a custom item for {roomLabel}
        </p>
      </div>

      {/* Suggestions section */}
      {hasSuggestions && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#717171] mb-3 uppercase tracking-wide">
            Suggestions
          </h3>
          <div
            role="radiogroup"
            aria-label="Select a specific item"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {suggestions.map((suggestion) => (
              <SuggestionButton
                key={suggestion}
                label={suggestion}
                isSelected={isSuggestionSelected(suggestion)}
                isCreated={isCreated(suggestion)}
                onSelect={handleSuggestionSelect}
              />
            ))}
            {/* "Other" option */}
            <SuggestionButton
              label="Other..."
              isSelected={isCustomMode}
              isCreated={false}
              onSelect={handleOtherClick}
            />
          </div>
        </div>
      )}

      {/* Custom item input (shown when "Other" selected or no suggestions) */}
      {(isCustomMode || !hasSuggestions) && (
        <div className="mb-6">
          <label
            htmlFor="custom-item-input"
            className="block text-sm font-medium text-[#222222] mb-2"
          >
            {hasSuggestions ? 'Enter custom item name' : 'Enter item name'}
          </label>
          <input
            id="custom-item-input"
            type="text"
            value={customItemValue}
            onChange={handleCustomItemChange}
            placeholder="e.g., Coffee Maker, Smart Thermostat"
            maxLength={50}
            className={cn(
              'w-full px-4 py-3 border-2 rounded-lg',
              'text-base text-[#222222] placeholder:text-[#717171]',
              'transition-colors duration-150',
              'focus:outline-none focus:border-[#222222]',
              'border-gray-200'
            )}
            aria-required="true"
            autoFocus={isCustomMode}
          />
        </div>
      )}

      {/* Item name editor (shows auto-generated name when item selected) */}
      {currentSpecificItem && (
        <div className="mb-6">
          <ItemNameEditor
            value={currentItemName}
            onChange={onSetItemName}
            placeholder="Enter item name"
            maxLength={100}
          />
        </div>
      )}

      {/* Continue button */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canNext}
          className={cn(
            'w-full py-4 rounded-lg font-semibold text-lg',
            'transition-colors duration-150',
            'min-h-[56px]', // Touch target height
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

export default SpecificItemStep;
```

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Suggestions display for kitchen + appliance combination
- [ ] Clicking suggestion selects it and shows ItemNameEditor
- [ ] Auto-generated name follows "Room - Item" format
- [ ] "Other" option enables custom input field
- [ ] Typing in custom input updates specificItem
- [ ] Created suggestions show grayed out
- [ ] Continue button disabled when no selection
- [ ] Continue button enabled when item selected
- [ ] Continue button calls onNext

---

### Task 5: Update Barrel Exports

**Estimated Effort:** 10 minutes
**Dependencies:** Tasks 1-4

#### 5.1 Update Hooks Barrel Export

**File:** `src/components/ItemCreationWorkflow/hooks/index.ts`

Find the placeholder comment (around line 31-32):
```typescript
// Placeholder for Task 2.3: useSuggestions
// export { useSuggestions } from './useSuggestions';
```

Replace with:
```typescript
// Task 2.3: useSuggestions - Dynamic suggestions hook
export { useSuggestions } from './useSuggestions';
export type {
  UseSuggestionsOptions,
  UseSuggestionsReturn,
} from './useSuggestions';
```

#### 5.2 Update Shared Components Barrel Export

**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

Find the placeholder comments (around lines 36-42):
```typescript
// Task 2.3: SuggestionButton
// export { SuggestionButton } from './SuggestionButton';
// export type { SuggestionButtonProps } from './SuggestionButton';

// Task 2.3: ItemNameEditor
// export { ItemNameEditor } from './ItemNameEditor';
// export type { ItemNameEditorProps } from './ItemNameEditor';
```

Replace with:
```typescript
// Task 2.3: SuggestionButton
export { SuggestionButton } from './SuggestionButton';
export type { SuggestionButtonProps } from './SuggestionButton';

// Task 2.3: ItemNameEditor
export { ItemNameEditor } from './ItemNameEditor';
export type { ItemNameEditorProps } from './ItemNameEditor';
```

#### 5.3 Update Steps Barrel Export

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

Find the placeholder comment (around lines 20-22):
```typescript
// Task 2.3: SpecificItemStep
// export { SpecificItemStep } from './SpecificItemStep';
// export type { SpecificItemStepProps } from './SpecificItemStep';
```

Replace with:
```typescript
// Task 2.3: SpecificItemStep
export { SpecificItemStep } from './SpecificItemStep';
export type { SpecificItemStepProps } from './SpecificItemStep';
```

#### Verification Steps

- [ ] All barrel exports compile without errors
- [ ] `useSuggestions` can be imported from `./hooks`
- [ ] `SuggestionButton` and `ItemNameEditor` can be imported from `./components/shared`
- [ ] `SpecificItemStep` can be imported from `./components/steps`

---

### Task 6: Integrate with Main Workflow Component

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Estimated Effort:** 15 minutes
**Dependencies:** Tasks 1-5

#### 6.1 Update Imports

Find the imports section (around line 19):
```typescript
import { RoomSelectionStep, ItemTypeStep } from './components/steps';
```

Replace with:
```typescript
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep } from './components/steps';
```

#### 6.2 Add Actions to Destructuring

Find the useWorkflowState destructuring (around lines 90-104):
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
} = useWorkflowState();
```

Add the new actions:
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
  selectSpecificItem,  // ADD THIS
  setItemName,          // ADD THIS
} = useWorkflowState();
```

#### 6.3 Replace Step Placeholder

Find the specific-item-selection case in renderCurrentStep (around lines 168-169):
```typescript
case 'specific-item-selection':
  return <StepPlaceholder step="specific-item-selection" {...commonProps} />;
```

Replace with:
```typescript
case 'specific-item-selection':
  return (
    <SpecificItemStep
      currentRoom={state.currentItem?.room ?? 'other'}
      currentItemType={state.currentItem?.itemType ?? 'general-info'}
      currentSpecificItem={state.currentItem?.specificItem ?? ''}
      currentItemName={state.currentItem?.itemName ?? ''}
      existingSessionItems={state.session.items}
      onSelectSpecificItem={selectSpecificItem}
      onSetItemName={setItemName}
      onNext={nextStep}
      canNext={canGoNext}
    />
  );
```

#### 6.4 Update Dependency Array

Find the renderCurrentStep dependency array (around line 186):
```typescript
}, [state.currentStep, state.currentItem, nextStep, canGoNext, selectRoom, selectItemType]);
```

Update to include new functions:
```typescript
}, [state.currentStep, state.currentItem, state.session.items, nextStep, canGoNext, selectRoom, selectItemType, selectSpecificItem, setItemName]);
```

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Workflow navigates from ItemTypeStep to SpecificItemStep
- [ ] Selecting a room and item type shows correct suggestions
- [ ] Auto-generated name appears when selecting item
- [ ] Editing name updates workflow state
- [ ] Continue button advances to content-source-selection step
- [ ] Back navigation preserves selection

---

### Task 7: Write Unit Tests

**Estimated Effort:** 45 minutes
**Dependencies:** Tasks 1-6

#### 7.1 Create useSuggestions Hook Tests

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts`

```typescript
/**
 * useSuggestions Hook Tests
 *
 * @module ItemCreationWorkflow/hooks/__tests__/useSuggestions
 * @lastModified 2026-01-05
 */

import { renderHook } from '@testing-library/react';
import { useSuggestions } from '../useSuggestions';
import type { SessionItem, RoomType, ItemType } from '../../ItemCreationWorkflow.types';

describe('useSuggestions', () => {
  const mockSessionItem = (name: string, room: RoomType): SessionItem => ({
    id: crypto.randomUUID(),
    name,
    room,
    itemType: 'appliance',
    content: [],
    createdAt: new Date(),
  });

  describe('suggestions retrieval', () => {
    it('returns suggestions for valid room + item type combination', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems: [],
        })
      );

      expect(result.current.suggestions).toContain('Stove/Oven');
      expect(result.current.suggestions).toContain('Refrigerator');
      expect(result.current.hasSuggestions).toBe(true);
    });

    it('returns empty array for "other" room', () => {
      const { result } = renderHook(() =>
        useSuggestions({
          room: 'other',
          itemType: 'appliance',
          existingItems: [],
        })
      );

      expect(result.current.suggestions).toHaveLength(0);
      expect(result.current.hasSuggestions).toBe(false);
    });
  });

  describe('created detection', () => {
    it('identifies created suggestions based on session items', () => {
      const existingItems = [
        mockSessionItem('Kitchen - Refrigerator', 'kitchen'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      expect(result.current.isCreated('Refrigerator')).toBe(true);
      expect(result.current.isCreated('Stove/Oven')).toBe(false);
    });

    it('is case-insensitive when matching', () => {
      const existingItems = [
        mockSessionItem('Kitchen - REFRIGERATOR', 'kitchen'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      expect(result.current.isCreated('Refrigerator')).toBe(true);
    });

    it('only matches items in the same room', () => {
      const existingItems = [
        mockSessionItem('Bathroom - Shower', 'bathroom'),
      ];

      const { result } = renderHook(() =>
        useSuggestions({
          room: 'kitchen',
          itemType: 'appliance',
          existingItems,
        })
      );

      expect(result.current.createdSuggestions.size).toBe(0);
    });
  });
});
```

#### 7.2 Create SuggestionButton Tests

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/SuggestionButton.test.tsx`

```typescript
/**
 * SuggestionButton Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/SuggestionButton
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionButton } from '../SuggestionButton';

describe('SuggestionButton', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders label text', () => {
    render(
      <SuggestionButton
        label="Refrigerator"
        isSelected={false}
        isCreated={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Refrigerator')).toBeInTheDocument();
  });

  it('shows checkmark when selected', () => {
    render(
      <SuggestionButton
        label="Refrigerator"
        isSelected={true}
        isCreated={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  });

  it('shows "Created" label when isCreated is true', () => {
    render(
      <SuggestionButton
        label="Refrigerator"
        isSelected={false}
        isCreated={true}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('calls onSelect when clicked (and not created)', () => {
    render(
      <SuggestionButton
        label="Refrigerator"
        isSelected={false}
        isCreated={false}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole('radio'));
    expect(mockOnSelect).toHaveBeenCalledWith('Refrigerator');
  });

  it('does not call onSelect when disabled (isCreated)', () => {
    render(
      <SuggestionButton
        label="Refrigerator"
        isSelected={false}
        isCreated={true}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole('radio'));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('has correct aria-disabled state', () => {
    render(
      <SuggestionButton
        label="Refrigerator"
        isSelected={false}
        isCreated={true}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole('radio')).toHaveAttribute('aria-disabled', 'true');
  });
});
```

#### 7.3 Create ItemNameEditor Tests

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor.test.tsx`

```typescript
/**
 * ItemNameEditor Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ItemNameEditor } from '../ItemNameEditor';

describe('ItemNameEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders input with current value', () => {
    render(
      <ItemNameEditor value="Kitchen - Refrigerator" onChange={mockOnChange} />
    );

    expect(screen.getByRole('textbox')).toHaveValue('Kitchen - Refrigerator');
  });

  it('calls onChange when text changes', () => {
    render(<ItemNameEditor value="" onChange={mockOnChange} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New Name' },
    });

    expect(mockOnChange).toHaveBeenCalledWith('New Name');
  });

  it('shows character counter', () => {
    render(
      <ItemNameEditor value="Test" onChange={mockOnChange} maxLength={100} />
    );

    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<ItemNameEditor value="" onChange={mockOnChange} />);

    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
  });

  it('disabled state prevents input', () => {
    render(<ItemNameEditor value="Test" onChange={mockOnChange} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
```

#### 7.4 Create SpecificItemStep Tests

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx`

```typescript
/**
 * SpecificItemStep Component Tests
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SpecificItemStep } from '../SpecificItemStep';

describe('SpecificItemStep', () => {
  const defaultProps = {
    currentRoom: 'kitchen' as const,
    currentItemType: 'appliance' as const,
    currentSpecificItem: '',
    currentItemName: '',
    existingSessionItems: [],
    onSelectSpecificItem: jest.fn(),
    onSetItemName: jest.fn(),
    onNext: jest.fn(),
    canNext: false,
  };

  beforeEach(() => {
    defaultProps.onSelectSpecificItem.mockClear();
    defaultProps.onSetItemName.mockClear();
    defaultProps.onNext.mockClear();
  });

  it('renders suggestions from useSuggestions hook', () => {
    render(<SpecificItemStep {...defaultProps} />);

    expect(screen.getByText('Stove/Oven')).toBeInTheDocument();
    expect(screen.getByText('Refrigerator')).toBeInTheDocument();
  });

  it('clicking suggestion calls onSelectSpecificItem', () => {
    render(<SpecificItemStep {...defaultProps} />);

    fireEvent.click(screen.getByText('Refrigerator'));
    expect(defaultProps.onSelectSpecificItem).toHaveBeenCalledWith('Refrigerator');
  });

  it('shows ItemNameEditor when item is selected', () => {
    render(
      <SpecificItemStep
        {...defaultProps}
        currentSpecificItem="Refrigerator"
        currentItemName="Kitchen - Refrigerator"
      />
    );

    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kitchen - Refrigerator')).toBeInTheDocument();
  });

  it('Continue button disabled when no item selected', () => {
    render(<SpecificItemStep {...defaultProps} canNext={false} />);

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('Continue button enabled when item selected', () => {
    render(
      <SpecificItemStep
        {...defaultProps}
        currentSpecificItem="Refrigerator"
        canNext={true}
      />
    );

    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
  });

  it('Continue button calls onNext', () => {
    render(
      <SpecificItemStep
        {...defaultProps}
        currentSpecificItem="Refrigerator"
        canNext={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it('"Other" option enables custom input', () => {
    render(<SpecificItemStep {...defaultProps} />);

    fireEvent.click(screen.getByText('Other...'));
    expect(screen.getByPlaceholderText(/e.g., Coffee Maker/i)).toBeInTheDocument();
  });
});
```

#### Verification Steps

- [ ] All test files compile without TypeScript errors
- [ ] `npm test` runs all tests successfully
- [ ] useSuggestions tests cover suggestion retrieval and created detection
- [ ] SuggestionButton tests cover all interaction states
- [ ] ItemNameEditor tests cover input and accessibility
- [ ] SpecificItemStep tests cover user flows and integration

---

## Task Dependency Graph

```
Task 1: useSuggestions Hook ─────────────────┐
                                              │
Task 2: SuggestionButton ────────────────────┼──> Task 4: SpecificItemStep ──> Task 5: Barrel Exports ──> Task 6: Main Workflow ──> Task 7: Tests
                                              │
Task 3: ItemNameEditor ──────────────────────┘
```

Tasks 1, 2, and 3 can be done in parallel. Tasks 4-7 must be sequential.

---

## Success Criteria Checklist

Per REQ-100 Acceptance Criteria:

- [x] Displays contextual suggestions based on selected room and item type
- [x] Users can select a suggestion by clicking/tapping a SuggestionButton
- [x] Users can enter a custom item name via "Other" option or free-text input
- [x] Previously created items in the session appear grayed out (disabled)
- [x] Item name is auto-generated as "Room - Item" format
- [x] Users can edit the auto-generated name via ItemNameEditor
- [x] Continue button is disabled until a specific item is selected/entered
- [x] Selected item is stored in workflow state (`specificItem` and `itemName`)
- [x] Component follows established patterns from previous step implementations

**Implementation Status: COMPLETE**
**Completed by:** Claude Code Agent
**Completion Date:** 2026-01-05 05:25 UTC

### Implementation Notes:

**Task 1-3 (Parallel):** Created useSuggestions hook, SuggestionButton, and ItemNameEditor components following established patterns.

**Task 4:** Created SpecificItemStep component with full integration of suggestions grid, custom input mode, and ItemNameEditor.

**Task 5:** Updated all barrel exports in hooks/index.ts, components/shared/index.ts, and components/steps/index.ts.

**Task 6:** Integrated SpecificItemStep into main ItemCreationWorkflow.tsx, adding selectSpecificItem and setItemName actions.

**Task 7:** Created comprehensive test suites for all new components and hooks.

**Build Verification:** `npm run build` completes successfully with no TypeScript errors.

**Browser Verification:** Test page at /test/item-creation-workflow loads correctly, workflow renders with all steps functional.

---

## Edge Cases to Handle

1. **User navigates back from later step** - Selection should be preserved
2. **User types custom item, then selects suggestion** - Custom input should clear
3. **Room "other" has no suggestions** - Custom input shown by default
4. **Very long item names** - maxLength constraints prevent overflow
5. **All suggestions already created** - User must use custom input
6. **Empty custom input** - Continue button remains disabled

---

## Design System Reference

### Colors (Airbnb Design System)

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Text Primary | #222222 | `text-[#222222]` |
| Text Secondary | #717171 | `text-[#717171]` |
| Primary Button | #FF385C | `bg-[#FF385C]` |
| Primary Hover | #E31C5F | `hover:bg-[#E31C5F]` |
| Selection Border | blue-500 | `border-blue-500` |
| Disabled Text | gray-400 | `text-gray-400` |

### Touch Targets

- Minimum size: 48x48px (WCAG 2.5.5)
- Suggestion buttons: `min-h-[48px]`
- Continue button: `min-h-[56px]`

---

## References

- [REQ-100 Overview Document](/docs/REQ-100-specific-item-selection-step-overview.md)
- [REQ-100 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Suggestion Matrix](/src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts)
- [useWorkflowState Hook](/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [RoomSelectionStep Pattern](/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx)
- [ItemTypeStep Pattern](/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx)
