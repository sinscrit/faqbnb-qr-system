# REQ-100: Specific Item Selection Step - Implementation Breakdown

**Document Generated:** 2026-01-05 22:45 UTC
**Last Modified:** 2026-01-05 22:45 UTC
**Request Reference:** REQ-100 (Specific Item Selection Step in Item Creation Workflow)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 2 - Selection Steps (1-3)
**Task ID:** 2.3

---

## Overview

This document provides a detailed implementation breakdown for the Specific Item Selection Step component, the third step in the Item Creation Workflow. The component enables users to select a specific item within the chosen room and item type category. Users can either select from contextual suggestions based on their previous selections, or enter a custom item name. The component auto-generates an item name following the "Room - Item" format pattern.

### Context from Implementation Plan

From the Implementation Plan (Phase 2, Task 2.3):

> **Task 2.3: Specific Item Selection Step [1 day]**
> - [ ] Create `SpecificItemStep.tsx` component
> - [ ] Implement `useSuggestions` hook for dynamic suggestions
> - [ ] Create `SuggestionButton.tsx` for suggestion items
> - [ ] Create `ItemNameEditor.tsx` for editable name field
> - [ ] Show previously created items (grayed out)
> - [ ] Auto-generate name as "Room - Item"

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
- `src/components/ItemCreationWorkflow/hooks/useSuggestions.ts`
- `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

**Acceptance Criteria:**
- Displays contextual suggestions based on selected room and item type
- Users can select a suggestion by clicking/tapping a SuggestionButton
- Users can enter a custom item name via free-text input
- Previously created items in the session appear grayed out (disabled)
- Item name is auto-generated as "Room - Item" format
- Users can edit the auto-generated name via ItemNameEditor
- Continue button is disabled until a specific item is selected/entered
- Selected item is stored in workflow state (`specificItem` and `itemName`)
- Component follows established patterns from previous step implementations

---

## Current State Analysis

### Existing Infrastructure

The workflow foundation and previous steps are fully implemented:

| Component | Status | Location |
|-----------|--------|----------|
| **Type Definitions** | Complete | `ItemCreationWorkflow.types.ts` |
| **Constants (rooms, item types)** | Complete | `utils/constants.ts` |
| **Suggestion Matrix** | Complete | `utils/suggestionMatrix.ts` |
| **State Machine Hook** | Complete | `hooks/useWorkflowState.ts` |
| **RoomSelectionStep** | Complete | `components/steps/RoomSelectionStep.tsx` |
| **ItemTypeStep** | Complete | `components/steps/ItemTypeStep.tsx` |
| **Main Workflow Component** | Complete | `ItemCreationWorkflow.tsx` |
| **Step Barrel Export** | Ready (commented) | `components/steps/index.ts` |
| **Shared Components Barrel** | Ready (commented) | `components/shared/index.ts` |

### Available Suggestion Matrix

From `utils/suggestionMatrix.ts`:

```typescript
export const SUGGESTION_MATRIX: Record<RoomType, Record<ItemType, string[]>> = {
  kitchen: {
    appliance: ['Stove/Oven', 'Refrigerator', 'Microwave', 'Dishwasher', ...],
    'room-item': ['Pantry', 'Cabinets', 'Sink/Faucet', 'Ice Maker'],
    'general-info': ['Trash & Recycling'],
  },
  laundry: {
    appliance: ['Washer', 'Dryer', 'Washer/Dryer Combo'],
    'room-item': ['Ironing Board', 'Drying Rack', 'Laundry Supplies'],
    'general-info': ['Detergent Instructions'],
  },
  // ... (full matrix for all 9 room types)
};

export function getSuggestions(room: RoomType, itemType: ItemType): string[] {
  return SUGGESTION_MATRIX[room]?.[itemType] ?? [];
}
```

### State Management Integration

The `useWorkflowState` hook provides:

```typescript
// Selection action
selectSpecificItem: (item: string) => void;

// Name editing action
setItemName: (name: string) => void;

// State access
state.currentItem?.room        // Previously selected room
state.currentItem?.itemType    // Previously selected item type
state.currentItem?.specificItem // Selected specific item
state.currentItem?.itemName    // Generated/edited item name
state.session.items            // Previously created items (for graying out)

// Navigation
canGoNext: boolean;            // True when specificItem is non-empty
nextStep: () => void;          // Advance to content-source-selection
```

**Auto-Generated Name Logic:** Already implemented in `useWorkflowState.ts`:
```typescript
case 'SELECT_SPECIFIC_ITEM': {
  if (!state.currentItem) return state;
  const roomLabel = ROOM_LABELS[state.currentItem.room] || state.currentItem.room;
  const autoName = `${roomLabel} - ${action.payload}`;
  const updatedItem: CurrentItemState = {
    ...state.currentItem,
    specificItem: action.payload,
    itemName: autoName,
  };
  // ...
}
```

### Room Labels Mapping

From `utils/constants.ts`:

```typescript
export const ROOM_LABELS: Record<RoomTypeConst, string> = {
  kitchen: 'Kitchen',
  laundry: 'Laundry Room',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  'living-room': 'Living Room',
  garage: 'Garage',
  outdoor: 'Outdoor/Patio',
  general: 'General/Whole Property',
  other: 'Other',
};
```

---

## Technical Approach

### Component Architecture

```
SpecificItemStep.tsx
├── Step heading ("What specific item?")
├── Step description
├── Suggestions Section
│   ├── Section label ("Suggestions")
│   └── Suggestion buttons grid
│       ├── SuggestionButton (suggestion 1)
│       ├── SuggestionButton (suggestion 2)
│       ├── SuggestionButton (suggestion N - grayed if already created)
│       └── SuggestionButton (custom "Other" option)
├── Custom Input Section (when "Other" selected or no suggestions)
│   └── Text input for custom item name
├── Item Name Preview/Editor
│   └── ItemNameEditor (shows auto-generated name, allows editing)
└── Continue button (enabled when valid selection)
```

### useSuggestions Hook Architecture

```typescript
interface UseSuggestionsOptions {
  room: RoomType;
  itemType: ItemType;
  existingItems: SessionItem[];
}

interface UseSuggestionsReturn {
  /** All suggestions for the room + item type combination */
  suggestions: string[];
  /** Suggestions that have already been created in this session */
  createdSuggestions: Set<string>;
  /** Whether a suggestion has been created (for graying out) */
  isCreated: (suggestion: string) => boolean;
  /** Whether there are any suggestions available */
  hasSuggestions: boolean;
}
```

### Props Interfaces

**SpecificItemStep:**
```typescript
export interface SpecificItemStepProps {
  /** Currently selected room */
  currentRoom: RoomType;
  /** Currently selected item type */
  currentItemType: ItemType;
  /** Currently selected specific item */
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

**SuggestionButton:**
```typescript
export interface SuggestionButtonProps {
  /** The suggestion text */
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

**ItemNameEditor:**
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

---

## Implementation Tasks

### Task 1: Create useSuggestions Hook [25 min]

**File:** `src/components/ItemCreationWorkflow/hooks/useSuggestions.ts`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `UseSuggestionsOptions` and `UseSuggestionsReturn` interfaces
3. Implement hook using `useMemo` for memoization
4. Use `getSuggestions()` from suggestionMatrix.ts
5. Calculate which suggestions have been created based on session items
6. Return suggestions array, createdSuggestions Set, and helper functions

**Implementation:**
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

import { useMemo, useCallback } from 'react';
import type { RoomType, ItemType, SessionItem } from '../ItemCreationWorkflow.types';
import { getSuggestions } from '../utils/suggestionMatrix';

export interface UseSuggestionsOptions {
  room: RoomType;
  itemType: ItemType;
  existingItems: SessionItem[];
}

export interface UseSuggestionsReturn {
  suggestions: string[];
  createdSuggestions: Set<string>;
  isCreated: (suggestion: string) => boolean;
  hasSuggestions: boolean;
}

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
      // Match by room + specific item name (case-insensitive)
      if (item.room === room) {
        // Check if any suggestion matches this item's specific item name
        for (const suggestion of suggestions) {
          // Item name format is "Room - SpecificItem", so check if it contains the suggestion
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

### Task 2: Create SuggestionButton Component [20 min]

**File:** `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `SuggestionButtonProps` interface
3. Implement button with selection and created (grayed out) states
4. Add keyboard accessibility (Enter/Space)
5. Apply Airbnb design system styling

**Implementation:**
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

export interface SuggestionButtonProps {
  label: string;
  isSelected: boolean;
  isCreated: boolean;
  onSelect: (label: string) => void;
  className?: string;
}

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
        // Touch targets
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
      <span className="text-sm font-medium">
        {label}
      </span>

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

### Task 3: Create ItemNameEditor Component [20 min]

**File:** `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `ItemNameEditorProps` interface
3. Implement editable input field with label
4. Add character counter
5. Apply consistent styling with other form inputs

**Implementation:**
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

export interface ItemNameEditorProps {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

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

### Task 4: Create SpecificItemStep Component [35 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `SpecificItemStepProps` interface
3. Implement step header and description
4. Integrate useSuggestions hook
5. Render SuggestionButton grid
6. Add custom item input with "Other" option
7. Integrate ItemNameEditor
8. Implement Continue button
9. Handle custom vs. suggestion selection states

**Implementation Outline:**
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

export interface SpecificItemStepProps {
  currentRoom: RoomType;
  currentItemType: ItemType;
  currentSpecificItem: string;
  currentItemName: string;
  existingSessionItems: SessionItem[];
  onSelectSpecificItem: (item: string) => void;
  onSetItemName: (name: string) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}

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
      onSelectSpecificItem(suggestion);
    },
    [onSelectSpecificItem]
  );

  // Handle "Other" / custom option
  const handleOtherClick = useCallback(() => {
    setIsCustomMode(true);
    // Clear current selection when entering custom mode
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

  // Determine if a suggestion is currently selected (not custom)
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

      {/* Item name editor (shows auto-generated name) */}
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

### Task 5: Update Barrel Exports [10 min]

**Files to Update:**

1. **Hooks Barrel Export:** `src/components/ItemCreationWorkflow/hooks/index.ts`

```typescript
// Task 2.3: useSuggestions
export { useSuggestions } from './useSuggestions';
export type { UseSuggestionsOptions, UseSuggestionsReturn } from './useSuggestions';
```

2. **Shared Components Barrel:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

```typescript
// Task 2.3: SuggestionButton
export { SuggestionButton } from './SuggestionButton';
export type { SuggestionButtonProps } from './SuggestionButton';

// Task 2.3: ItemNameEditor
export { ItemNameEditor } from './ItemNameEditor';
export type { ItemNameEditorProps } from './ItemNameEditor';
```

3. **Steps Barrel Export:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

```typescript
// Task 2.3: SpecificItemStep
export { SpecificItemStep } from './SpecificItemStep';
export type { SpecificItemStepProps } from './SpecificItemStep';
```

### Task 6: Integrate with Main Workflow [15 min]

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Subtasks:**
1. Import `SpecificItemStep` from steps index
2. Add `selectSpecificItem` and `setItemName` to destructured values from `useWorkflowState`
3. Replace `StepPlaceholder` in `case 'specific-item-selection'` with `SpecificItemStep`
4. Pass required props from workflow state and actions

**Integration:**
```tsx
// Add to imports
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep } from './components/steps';

// Add to useWorkflowState destructuring
const {
  state,
  nextStep,
  prevStep,
  // ... existing
  selectRoom,
  selectItemType,
  selectSpecificItem, // ADD THIS
  setItemName,        // ADD THIS
  // ...
} = useWorkflowState();

// In renderCurrentStep switch statement:
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

### Task 7: Write Unit Tests [45 min]

**Files to Create:**

1. **useSuggestions Hook Tests:** `src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts`
2. **SuggestionButton Tests:** `src/components/ItemCreationWorkflow/components/shared/__tests__/SuggestionButton.test.tsx`
3. **ItemNameEditor Tests:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor.test.tsx`
4. **SpecificItemStep Tests:** `src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx`

**Test Cases:**

**useSuggestions Hook:**
- Returns suggestions for valid room + item type combinations
- Returns empty array for 'other' room
- Correctly identifies created suggestions based on session items
- `isCreated()` returns true for matching items
- `hasSuggestions` reflects suggestion availability

**SuggestionButton:**
- Renders label text correctly
- Shows checkmark when selected
- Shows "Created" label when isCreated is true
- Calls onSelect when clicked (and not created)
- Does not call onSelect when disabled (isCreated)
- Has correct aria-checked state
- Has correct aria-disabled state
- Keyboard navigation works (Enter/Space)

**ItemNameEditor:**
- Renders input with current value
- Calls onChange when text changes
- Shows character counter
- Character counter changes color near limit
- Disabled state prevents input
- Has accessible label and hint text

**SpecificItemStep:**
- Renders suggestions from useSuggestions hook
- Clicking suggestion calls onSelectSpecificItem
- "Other" option enables custom input
- Custom input updates specificItem
- Shows ItemNameEditor when item is selected
- ItemNameEditor shows auto-generated name
- Editing name calls onSetItemName
- Created suggestions appear grayed out
- Continue button disabled when no item selected
- Continue button enabled when item selected
- Continue button calls onNext
- Correct aria-labels and accessibility attributes

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/hooks/useSuggestions.ts` | Dynamic suggestions hook |
| `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | Suggestion button component |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Editable item name component |
| `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Main step component |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts` | Hook unit tests |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/SuggestionButton.test.tsx` | Component unit tests |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ItemNameEditor.test.tsx` | Component unit tests |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx` | Step component unit tests |

### Files to Modify

| File Path | Modification | Functions/Sections |
|-----------|--------------|-------------------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Uncomment/add useSuggestions export | Lines 31-32 (add new export) |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Uncomment SuggestionButton, ItemNameEditor exports | Lines 36-42 |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Uncomment SpecificItemStep export | Lines 20-22 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import SpecificItemStep, add selectSpecificItem/setItemName, replace placeholder | Imports section (~line 19), useWorkflowState destructuring (~line 103), `renderCurrentStep()` case 'specific-item-selection' (~line 168-169) |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for `RoomType`, `ItemType`, `SessionItem`, `CurrentItemState` |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `ROOM_LABELS` for name generation display |
| `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` | `getSuggestions()`, `SUGGESTION_MATRIX` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `selectSpecificItem`, `setItemName` actions, `canGoNext` logic |
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Pattern reference for step structure |
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Pattern reference for step structure |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Pattern reference for selection button |

---

## Integration Points

### With useWorkflowState Hook

The step component receives and uses:
- `state.currentItem?.room` - Previously selected room (for suggestions)
- `state.currentItem?.itemType` - Previously selected item type (for suggestions)
- `state.currentItem?.specificItem` - Currently selected/entered item
- `state.currentItem?.itemName` - Auto-generated or edited item name
- `state.session.items` - Items created in session (for graying out suggestions)
- `selectSpecificItem(item)` - Action to update selected item
- `setItemName(name)` - Action to update item name
- `canGoNext` - Computed validation (checks `specificItem.length > 0` for this step)
- `nextStep()` - Navigation to next step (`content-source-selection`)

**Auto-Name Generation:** Handled by reducer in `SELECT_SPECIFIC_ITEM` action:
```typescript
case 'SELECT_SPECIFIC_ITEM': {
  const roomLabel = ROOM_LABELS[state.currentItem.room] || state.currentItem.room;
  const autoName = `${roomLabel} - ${action.payload}`;
  // Sets both specificItem and itemName
}
```

### With useSuggestions Hook

The hook receives:
- `room` - Current room selection
- `itemType` - Current item type selection
- `existingItems` - Session items for created detection

Returns:
- `suggestions` - Array of suggestion strings
- `isCreated(suggestion)` - Check if suggestion already created
- `hasSuggestions` - Boolean for conditional rendering

### With Shared Components

- **SuggestionButton:** Receives suggestion label, selection state, created state
- **ItemNameEditor:** Receives current name, onChange handler

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
| Disabled Background | gray-50 | `bg-gray-50` |
| Disabled Text | gray-400 | `text-gray-400` |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Step Title | 24px (2xl) | Semi-bold (600) |
| Step Description | 16px (base) | Normal (400) |
| Section Label | 14px (sm) | Medium (500), uppercase |
| Suggestion Button | 14px (sm) | Medium (500) |
| Input Text | 16px (base) | Normal (400) |
| Button | 18px (lg) | Semi-bold (600) |

### Spacing (8px Grid)

- Container padding: 24px (`p-6`)
- Suggestion grid gap: 12px (`gap-3`)
- Section spacing: 24px (`mb-6`)
- Button border-top margin: 24px (`pt-6`)

### Touch Targets

- Minimum: 48x48px (WCAG 2.5.5)
- Suggestion buttons: 48px min-height (`min-h-[48px]`)
- Input fields: 48px+ (`py-3` = ~46px internal)
- Continue button: Full width, 56px min-height (`min-h-[56px]`)

---

## Dependencies

### Required (Already Installed)

| Package | Usage |
|---------|-------|
| `react` | Component framework |
| `lucide-react` | Icons (Check, Pencil) |
| `@/lib/utils` | `cn()` utility for class merging |

### No New Dependencies Required

The implementation uses only existing infrastructure.

---

## Risk Assessment

### Low Risk
- **Component Structure:** Follows established patterns from `RoomSelectionStep` and `ItemTypeStep`
- **State Integration:** Uses existing `selectSpecificItem` and `setItemName` actions
- **Styling:** Consistent with design system tokens
- **Hook Pattern:** Standard React hooks pattern with `useMemo` and `useCallback`

### Medium Risk
- **Created Detection Logic:** Matching suggestions to session items requires careful string comparison
  - **Mitigation:** Use case-insensitive matching, test with various item names

### Verification Needed
- **Suggestion Matrix Completeness:** Ensure all room/itemType combinations have appropriate suggestions
  - Already verified in `utils/suggestionMatrix.ts`
- **Custom Item Flow:** Test that custom items properly generate names and advance step

### Edge Cases
- User navigates back from later step - selection should be preserved
- User types custom item, then selects suggestion - custom input should clear
- Room "other" has no suggestions - custom input shown by default
- Very long item names - maxLength constraints and UI truncation
- All suggestions already created - user must use custom input

---

## Success Criteria

Per REQ-100 Acceptance Criteria:

- [ ] Displays contextual suggestions based on selected room and item type
- [ ] Users can select a suggestion by clicking/tapping a SuggestionButton
- [ ] Users can enter a custom item name via "Other" option or free-text input
- [ ] Previously created items in the session appear grayed out (disabled)
- [ ] Item name is auto-generated as "Room - Item" format
- [ ] Users can edit the auto-generated name via ItemNameEditor
- [ ] Continue button is disabled until a specific item is selected/entered
- [ ] Selected item is stored in workflow state (`specificItem` and `itemName`)
- [ ] Component follows established patterns from previous step implementations

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Create useSuggestions hook | 25 min |
| Task 2: Create SuggestionButton component | 20 min |
| Task 3: Create ItemNameEditor component | 20 min |
| Task 4: Create SpecificItemStep component | 35 min |
| Task 5: Update barrel exports | 10 min |
| Task 6: Integrate with main workflow | 15 min |
| Task 7: Write unit tests | 45 min |
| **Total** | **~3 hours** |

---

## References

- [REQ-100 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Suggestion Matrix](/src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts)
- [Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [RoomSelectionStep Component](/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx)
- [ItemTypeStep Component](/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx)
- [useWorkflowState Hook](/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [REQ-098 Overview (Pattern Reference)](/docs/REQ-098-room-selection-step-overview.md)
- [REQ-099 Overview (Pattern Reference)](/docs/REQ-099-item-type-selection-step-overview.md)
