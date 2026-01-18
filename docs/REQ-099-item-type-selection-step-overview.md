# REQ-099: Item Type Selection Step - Implementation Breakdown

**Document Generated:** 2026-01-05 21:30 UTC
**Last Modified:** 2026-01-05 21:30 UTC
**Request Reference:** REQ-099 (Item Type Selection Step in Item Creation Workflow)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 2 - Selection Steps (1-3)
**Task ID:** 2.2

---

## Overview

This document provides a detailed implementation breakdown for the Item Type Selection Step component, the second step in the Item Creation Workflow. The component enables users to categorize the item they are documenting by selecting from three distinct categories: Appliance, Room Item, or General Information. When the user has previously selected "General" as the room type, this step is automatically bypassed.

### Context from Implementation Plan

From the Implementation Plan (Phase 2, Task 2.2):

> **Task 2.2: Item Type Selection Step [0.5 days]**
> - [ ] Create `ItemTypeStep.tsx` component
> - [ ] Three card options: Appliance, Room Item, General Info
> - [ ] Clear descriptions and examples on each card
> - [ ] Auto-skip if "General" room was selected

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`

**Acceptance Criteria (from Plan and REQ-099):**
- Three distinct card options are presented: Appliance, Room Item, and General Info
- Each card displays clear descriptions and practical examples
- User can select exactly one item type by clicking a card
- Selection state is visually indicated on the chosen card
- Continue button is disabled until an item type is selected
- When "General" room was previously selected, this step is automatically bypassed
- The selected item type is stored in workflow state
- Component follows established patterns from RoomSelectionStep implementation

---

## Current State Analysis

### Existing Infrastructure

The workflow foundation and previous step are fully implemented:

| Component | Status | Location |
|-----------|--------|----------|
| **Type Definitions** | ✅ Complete | `ItemCreationWorkflow.types.ts` |
| **Constants (item types, labels, descriptions)** | ✅ Complete | `utils/constants.ts` |
| **State Machine Hook** | ✅ Complete | `hooks/useWorkflowState.ts` |
| **ItemTypeCard Component** | ✅ Complete | `components/shared/ItemTypeCard.tsx` |
| **RoomSelectionStep** | ✅ Complete | `components/steps/RoomSelectionStep.tsx` |
| **Main Workflow Component** | ✅ Complete | `ItemCreationWorkflow.tsx` |
| **Step Barrel Export** | ✅ Ready (commented) | `components/steps/index.ts` |

### Available Item Types

From `utils/constants.ts`:

```typescript
export const ITEM_TYPES = ['appliance', 'room-item', 'general-info'] as const;

export const ITEM_TYPE_LABELS: Record<ItemTypeConst, string> = {
  appliance: 'Appliance',
  'room-item': 'Room Item',
  'general-info': 'General Info',
};

export const ITEM_TYPE_DESCRIPTIONS: Record<ItemTypeConst, string> = {
  appliance: 'Washer, dryer, stove, refrigerator, etc.',
  'room-item': 'Pantry, cabinets, closet, sink, etc.',
  'general-info': 'Trash schedule, WiFi info, house rules, etc.',
};
```

### ItemTypeCard Component

The `ItemTypeCard` shared component is already implemented at `components/shared/ItemTypeCard.tsx` with:
- Horizontal layout with icon, label, and description
- Selection visual states (blue border/background when selected)
- Checkmark indicator for selected state
- Icon mapping via `ITEM_TYPE_ICONS` export
- Full accessibility support (ARIA radio role, keyboard navigation)

### State Management Integration

The `useWorkflowState` hook provides:

```typescript
// Selection action
selectItemType: (itemType: ItemType) => void;

// State access
state.currentItem?.itemType  // Currently selected item type
state.currentItem?.room      // Previously selected room (for skip logic check)

// Navigation
canGoNext: boolean;          // True when itemType is selected
nextStep: () => void;        // Advance to specific-item-selection
```

**Auto-Skip Logic:** The step-skip behavior is already implemented in `useWorkflowState.ts`:
- `shouldSkipItemType(state)` returns `true` when `room === 'general'`
- When `room === 'general'`, the `SELECT_ROOM` action auto-sets `itemType` to `'general-info'`
- `getNextStep()` for `room-selection` returns `specific-item-selection` when skip condition is met

---

## Technical Approach

### Component Architecture

```
ItemTypeStep.tsx
├── Step heading ("What type of item is this?")
├── Step description
├── Item type cards (vertical stack)
│   ├── ItemTypeCard (appliance)
│   ├── ItemTypeCard (room-item)
│   └── ItemTypeCard (general-info)
└── Continue button (enabled when valid selection)
```

### Props Interface

```typescript
export interface ItemTypeStepProps {
  /** Current selected item type from state */
  currentItemType: ItemType | null;
  /** Handler to select an item type */
  onSelectItemType: (itemType: ItemType) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

### Skip Logic Verification

The skip logic is already handled by the state machine, but the main workflow component must properly route around this step. Current implementation in `ItemCreationWorkflow.tsx`:

```tsx
case 'item-type-selection':
  return <StepPlaceholder step="item-type-selection" {...commonProps} />;
```

This placeholder will be replaced with the actual component. The skip logic works because:
1. When user selects "General" room, `SELECT_ROOM` action sets `itemType` to `'general-info'`
2. `NEXT_STEP` from `room-selection` with `room === 'general'` goes directly to `specific-item-selection`
3. The user never sees `item-type-selection` step when this condition is met

### Layout Considerations

Unlike `RoomSelectionStep` which uses a grid, `ItemTypeStep` uses a vertical stack:
- Three cards displayed vertically for easier reading of descriptions
- Larger card height to accommodate description text (120-140px minimum)
- Full-width cards with horizontal internal layout (icon left, text right)
- Mobile-responsive with consistent spacing

---

## Implementation Tasks

### Task 1: Create ItemTypeStep Component [20 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `ItemTypeStepProps` interface
3. Implement component structure:
   - Step header with title "What type of item is this?"
   - Description text explaining the categorization
   - Vertical stack container for cards
4. Apply consistent Tailwind styling per design system

**Code Structure:**
```typescript
'use client';

/**
 * ItemTypeStep Component
 *
 * Step 2 of the item creation workflow.
 * Displays three item type options for user selection.
 * Auto-skipped when room is "General" (handled by state machine).
 *
 * @module ItemCreationWorkflow/components/steps/ItemTypeStep
 * @see docs/REQ-099-item-type-selection-step-overview.md
 * @lastModified 2026-01-05
 */

import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ItemTypeCard, ITEM_TYPE_ICONS } from '../shared';
import { ITEM_TYPES, ITEM_TYPE_LABELS, ITEM_TYPE_DESCRIPTIONS } from '../../utils/constants';
import type { ItemType } from '../../ItemCreationWorkflow.types';

export interface ItemTypeStepProps {
  currentItemType: ItemType | null;
  onSelectItemType: (itemType: ItemType) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}

export function ItemTypeStep({
  currentItemType,
  onSelectItemType,
  onNext,
  canNext,
  className,
}: ItemTypeStepProps) {
  // ... implementation
}
```

### Task 2: Implement Item Type Cards [20 min]

**Subtasks:**
1. Create vertical flex container for cards
2. Map `ITEM_TYPES` to `ItemTypeCard` components
3. Pass proper props: `itemType`, `label`, `description`, `icon`, `isSelected`, `onSelect`
4. Add appropriate spacing between cards (`gap-4` or `space-y-4`)
5. Ensure radiogroup role and aria-label for accessibility

**Cards Implementation:**
```tsx
<div
  role="radiogroup"
  aria-label="Select item type"
  className="flex flex-col gap-4"
>
  {ITEM_TYPES.map((type) => (
    <ItemTypeCard
      key={type}
      itemType={type}
      label={ITEM_TYPE_LABELS[type]}
      description={ITEM_TYPE_DESCRIPTIONS[type]}
      icon={ITEM_TYPE_ICONS[type]}
      isSelected={currentItemType === type}
      onSelect={onSelectItemType}
    />
  ))}
</div>
```

### Task 3: Implement Continue Button [10 min]

**Subtasks:**
1. Add Continue button at bottom of step (consistent with RoomSelectionStep)
2. Disable when no item type is selected
3. Style with Airbnb brand colors (#FF385C)
4. Wire up `onNext` handler
5. Add divider/border above button for visual separation

**Button Implementation:**
```tsx
<div className="mt-8 pt-6 border-t border-gray-200">
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
```

### Task 4: Update Barrel Exports [5 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Subtasks:**
1. Uncomment the `ItemTypeStep` export lines (lines 17-18)
2. Verify export syntax is correct

```typescript
// Task 2.2: ItemTypeStep
export { ItemTypeStep } from './ItemTypeStep';
export type { ItemTypeStepProps } from './ItemTypeStep';
```

### Task 5: Integrate with Main Workflow [15 min]

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Subtasks:**
1. Import `ItemTypeStep` from steps index
2. Add `selectItemType` to destructured values from `useWorkflowState`
3. Replace `StepPlaceholder` in `case 'item-type-selection'` with `ItemTypeStep`
4. Pass required props from workflow state and actions

**Integration:**
```tsx
// Add to imports
import { RoomSelectionStep, ItemTypeStep } from './components/steps';

// Add to useWorkflowState destructuring
const {
  state,
  nextStep,
  prevStep,
  // ... existing
  selectRoom,
  selectItemType, // ADD THIS
  // ...
} = useWorkflowState();

// In renderCurrentStep switch statement:
case 'item-type-selection':
  return (
    <ItemTypeStep
      currentItemType={state.currentItem?.itemType ?? null}
      onSelectItemType={selectItemType}
      onNext={nextStep}
      canNext={canGoNext}
    />
  );
```

### Task 6: Write Unit Tests [30 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx`

**Test Cases:**

1. **Rendering:**
   - Renders all 3 item type options
   - Each item type displays correct icon, label, and description
   - Step header and description are visible

2. **Selection:**
   - Clicking an item type card calls `onSelectItemType` with correct type
   - Selected item type shows selected visual state
   - Re-selecting same item type works correctly
   - Only one item can be selected at a time

3. **Navigation:**
   - Continue button calls `onNext` when clicked and `canNext` is true
   - Continue button disabled when `canNext` is false
   - Continue button has proper disabled styling

4. **Accessibility:**
   - radiogroup role is present on container
   - aria-label describes the selection purpose
   - Keyboard navigation works (Enter/Space to select)
   - Each card has aria-checked state
   - Description is connected via aria-describedby

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Main step component |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx` | Unit tests |

### Files to Modify

| File Path | Modification | Functions/Sections |
|-----------|--------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Uncomment exports | Lines 17-18 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import ItemTypeStep, add selectItemType, replace placeholder | Imports section, useWorkflowState destructuring (~line 103), `renderCurrentStep()` case 'item-type-selection' (~line 158-159) |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for `ItemType`, `CurrentItemState` |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `ITEM_TYPES`, `ITEM_TYPE_LABELS`, `ITEM_TYPE_DESCRIPTIONS` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `selectItemType` action, `canGoNext` logic, skip logic |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Card component to reuse, `ITEM_TYPE_ICONS` export |
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Pattern reference for step structure |

---

## Integration Points

### With useWorkflowState Hook

The step component receives and uses:
- `state.currentItem?.itemType` - Currently selected item type
- `selectItemType(itemType)` - Action to update selected item type
- `canGoNext` - Computed validation (checks `itemType != null` for this step)
- `nextStep()` - Navigation to next step (`specific-item-selection`)

**Skip Logic Already Implemented:**
From `useWorkflowState.ts` lines 95-97 and 115-119:
```typescript
export function shouldSkipItemType(state: WorkflowState): boolean {
  return state.currentItem?.room === 'general';
}

// In getNextStep():
if (currentStep === 'room-selection') {
  if (shouldSkipItemType(state)) {
    return 'specific-item-selection';
  }
  return 'item-type-selection';
}
```

When "General" room is selected, `SELECT_ROOM` action also auto-sets `itemType` to `'general-info'`:
```typescript
// From reducer, lines 210-221
case 'SELECT_ROOM': {
  const roomType = action.payload;
  const itemType = roomType === 'general' ? 'general-info' : null;
  // ...
}
```

### With ItemTypeCard Component

Reuse existing `ItemTypeCard` component which provides:
- Horizontal layout with icon, text, and checkmark
- Selection styling (blue border/background when selected)
- `ITEM_TYPE_ICONS` mapping (Zap, Package, Info from lucide-react)
- Keyboard accessibility (Enter/Space)
- ARIA radio role and states

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
| Card Label | 16-18px | Semi-bold (600) |
| Card Description | 14px (sm) | Normal (400) |
| Button | 18px (lg) | Semi-bold (600) |

### Spacing (8px Grid)

- Container padding: 24px (`p-6`)
- Card gap: 16px (`gap-4`)
- Card padding: 16-24px (`p-4 sm:p-6`)
- Section spacing: 24-32px (`mt-6`, `mt-8`)
- Button border-top margin: 32px (`mt-8 pt-6`)

### Touch Targets

- Minimum: 48x48px (WCAG 2.5.5)
- Item type cards: 120px min-height (mobile), 140px (desktop)
- Continue button: Full width, 56px min-height (`min-h-[56px]`)

---

## Dependencies

### Required (Already Installed)

| Package | Usage |
|---------|-------|
| `react` | Component framework |
| `lucide-react` | Item type icons (Zap, Package, Info) |
| `@/lib/utils` | `cn()` utility for class merging |

### No New Dependencies Required

The implementation uses only existing infrastructure.

---

## Risk Assessment

### Low Risk
- **Component Structure:** Follows established patterns from `RoomSelectionStep`
- **State Integration:** Uses existing `selectItemType` action
- **Styling:** Consistent with design system tokens
- **Card Component:** Reuses existing `ItemTypeCard`

### Verification Needed
- **Skip Logic Testing:** Verify that selecting "General" room properly skips this step
  - **Mitigation:** Include integration test in main workflow tests

### Edge Cases
- User navigates back from later step to this step - selection should be preserved
- User navigates back from this step - should return to room-selection with room preserved
- All handled by existing state machine

---

## Success Criteria

Per REQ-099 Acceptance Criteria:

- [ ] Three distinct card options are presented: Appliance, Room Item, and General Info
- [ ] Each card displays clear descriptions and practical examples
- [ ] User can select exactly one item type by clicking a card
- [ ] Selection state is visually indicated on the chosen card
- [ ] Continue button is disabled until an item type is selected
- [ ] When "General" room was previously selected, this step is automatically bypassed
- [ ] The selected item type is stored in workflow state
- [ ] Component follows established patterns from RoomSelectionStep implementation

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Create component structure | 20 min |
| Task 2: Implement item type cards | 20 min |
| Task 3: Continue button | 10 min |
| Task 4: Update barrel exports | 5 min |
| Task 5: Integrate with workflow | 15 min |
| Task 6: Write unit tests | 30 min |
| **Total** | **~1.5 hours** |

---

## References

- [REQ-099 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [ItemTypeCard Component](/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx)
- [RoomSelectionStep Component](/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx)
- [useWorkflowState Hook](/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [REQ-098 Overview (Pattern Reference)](/docs/REQ-098-room-selection-step-overview.md)
