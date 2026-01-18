# REQ-098: Room Selection Step - Implementation Breakdown

**Document Generated:** 2026-01-05 20:15 UTC
**Last Modified:** 2026-01-05 20:15 UTC
**Request Reference:** REQ-098 (Room Selection Step in Item Creation Workflow)
**Implementation Plan Reference:** [Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
**Phase:** 2 - Selection Steps (1-3)
**Task ID:** 2.1

---

## Overview

This document provides a detailed implementation breakdown for the Room Selection Step component, the first step in the Item Creation Workflow. The component enables users to select which room a household item belongs to by choosing from a predefined grid of room types or specifying a custom room name via the "Other" option.

### Context from Implementation Plan

From the Implementation Plan (Phase 2, Task 2.1):

> **Task 2.1: Room Selection Step [1 day]**
> - [ ] Create `RoomSelectionStep.tsx` component
> - [ ] Implement room grid with icons and labels
> - [ ] Add "Other" option with free-text input
> - [ ] Handle selection and navigation
> - [ ] Ensure large touch targets (48x48px minimum)

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx`

**Acceptance Criteria (from Plan):**
- Grid of room options with icons
- "Other" option opens text input
- Selection advances to next step
- Back navigation returns with selection preserved

---

## Current State Analysis

### Existing Infrastructure

The workflow foundation is fully implemented from Phase 1:

| Component | Status | Location |
|-----------|--------|----------|
| **Type Definitions** | ✅ Complete | `ItemCreationWorkflow.types.ts` |
| **Constants (rooms, icons)** | ✅ Complete | `utils/constants.ts` |
| **State Machine Hook** | ✅ Complete | `hooks/useWorkflowState.ts` |
| **RoomCard Component** | ✅ Complete | `components/shared/RoomCard.tsx` |
| **Main Workflow Component** | ✅ Complete | `ItemCreationWorkflow.tsx` |
| **Step Barrel Export** | ✅ Ready (commented) | `components/steps/index.ts` |

### Available Room Types

From `utils/constants.ts`:

```typescript
export const ROOM_TYPES = [
  'kitchen', 'laundry', 'bedroom', 'bathroom',
  'living-room', 'garage', 'outdoor', 'general', 'other'
] as const;
```

Each room type has corresponding labels and icon mappings in:
- `ROOM_LABELS`: Human-readable names
- `ROOM_ICONS`: Lucide icon identifiers

### State Management Integration

The `useWorkflowState` hook provides:

```typescript
// Selection action
selectRoom: (room: RoomType) => void;

// State access
state.currentItem?.room  // Currently selected room

// Navigation
canGoNext: boolean;      // True when room is selected
nextStep: () => void;    // Advance to item-type-selection or specific-item-selection
```

**Skip Logic:** When `room === 'general'`, the workflow automatically skips `item-type-selection` and proceeds directly to `specific-item-selection`, auto-setting `itemType` to `'general-info'`.

---

## Technical Approach

### Component Architecture

```
RoomSelectionStep.tsx
├── Step heading and description
├── Room grid (responsive CSS grid)
│   ├── RoomCard (kitchen)
│   ├── RoomCard (laundry)
│   ├── RoomCard (bedroom)
│   ├── RoomCard (bathroom)
│   ├── RoomCard (living-room)
│   ├── RoomCard (garage)
│   ├── RoomCard (outdoor)
│   ├── RoomCard (general)
│   └── RoomCard (other) → triggers custom input
├── Custom room input field (conditional, when "other" selected)
└── Continue button (enabled when valid selection)
```

### Props Interface

```typescript
export interface RoomSelectionStepProps {
  /** Current selected room type from state */
  currentRoom: RoomType | null;
  /** Handler to select a room */
  onSelectRoom: (room: RoomType) => void;
  /** Custom room name (for "other" option) */
  customRoomName?: string;
  /** Handler for custom room name changes */
  onCustomRoomNameChange?: (name: string) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}
```

### "Other" Option Behavior

When the user selects the "Other" room:
1. A text input field appears below the grid
2. The user enters a custom room name
3. The custom name is stored (potentially via a new action or by extending `SELECT_ROOM`)
4. The Continue button validates that custom name is not empty

**Implementation Options:**

**Option A - State Extension (Recommended):**
Add `customRoomName` field to `CurrentItemState` type and a new `SET_CUSTOM_ROOM_NAME` action:
```typescript
case 'SET_CUSTOM_ROOM_NAME': {
  if (!state.currentItem) return state;
  return {
    ...state,
    currentItem: {
      ...state.currentItem,
      customRoomName: action.payload
    }
  };
}
```

**Option B - Local Component State:**
Manage custom name in component state, pass to parent on navigation. Simpler but less consistent with reducer pattern.

**Recommendation:** Start with Option B for simplicity since the custom room name can be incorporated into `itemName` generation later. If persistence is needed, upgrade to Option A.

### Responsive Grid Layout

```css
/* Mobile: 2 columns */
grid-template-columns: repeat(2, 1fr);

/* Tablet: 3 columns */
@media (min-width: 640px) {
  grid-template-columns: repeat(3, 1fr);
}

/* Desktop: 4-5 columns */
@media (min-width: 1024px) {
  grid-template-columns: repeat(4, 1fr);
}
```

### Touch Target Compliance

Per WCAG 2.5.5 and PRD requirements:
- Minimum touch target: 48x48px
- Current `RoomCard` implementation uses: `min-h-[100px]` (mobile), `min-h-[120px]` (desktop)
- ✅ Already compliant

---

## Implementation Tasks

### Task 1: Create RoomSelectionStep Component [30 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx`

**Subtasks:**
1. Create file with 'use client' directive and JSDoc header
2. Define `RoomSelectionStepProps` interface
3. Implement component structure:
   - Step header with title "Select a Room"
   - Description text
   - Responsive grid container
   - Map through `ROOM_TYPES` to render `RoomCard` components
4. Wire up `onSelectRoom` and `currentRoom` for selection state
5. Apply consistent Tailwind styling per design system

**Code Structure:**
```typescript
'use client';

/**
 * RoomSelectionStep Component
 *
 * Step 1 of the item creation workflow.
 * Displays a grid of room options for user selection.
 *
 * @module ItemCreationWorkflow/components/steps/RoomSelectionStep
 * @see docs/REQ-098-room-selection-step-overview.md
 * @lastModified 2026-01-05
 */

import { cn } from '@/lib/utils';
import { RoomCard } from '../shared';
import { ROOM_TYPES, ROOM_LABELS, ROOM_ICONS } from '../../utils/constants';
import type { RoomType } from '../../ItemCreationWorkflow.types';

export interface RoomSelectionStepProps {
  currentRoom: RoomType | null;
  onSelectRoom: (room: RoomType) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}

export function RoomSelectionStep({
  currentRoom,
  onSelectRoom,
  onNext,
  canNext,
  className,
}: RoomSelectionStepProps) {
  // ... implementation
}
```

### Task 2: Implement Room Grid [20 min]

**Subtasks:**
1. Create responsive grid container with gap spacing
2. Map `ROOM_TYPES` to `RoomCard` components
3. Pass proper props: `room`, `label`, `icon`, `isSelected`, `onSelect`
4. Handle selection state visually (RoomCard already handles this)

**Grid Implementation:**
```tsx
<div
  role="radiogroup"
  aria-label="Select a room"
  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
>
  {ROOM_TYPES.map((room) => (
    <RoomCard
      key={room}
      room={room}
      label={ROOM_LABELS[room]}
      icon={ROOM_ICONS[room]}
      isSelected={currentRoom === room}
      onSelect={onSelectRoom}
    />
  ))}
</div>
```

### Task 3: Implement "Other" Custom Input [30 min]

**Subtasks:**
1. Add local state for custom room name: `const [customName, setCustomName] = useState('')`
2. Conditionally render input field when `currentRoom === 'other'`
3. Style input with Airbnb design system (border, focus states, padding)
4. Handle input validation (non-empty for continue)
5. Update `canNext` logic to check custom name validity

**Custom Input Implementation:**
```tsx
{currentRoom === 'other' && (
  <div className="mt-6">
    <label
      htmlFor="custom-room-input"
      className="block text-sm font-medium text-[#222222] mb-2"
    >
      Enter room name
    </label>
    <input
      id="custom-room-input"
      type="text"
      value={customName}
      onChange={(e) => setCustomName(e.target.value)}
      placeholder="e.g., Home Office, Wine Cellar"
      className={cn(
        "w-full px-4 py-3 border-2 rounded-lg",
        "text-base text-[#222222] placeholder:text-[#717171]",
        "transition-colors duration-150",
        "focus:outline-none focus:border-[#222222]",
        "border-gray-200"
      )}
      aria-required="true"
    />
  </div>
)}
```

### Task 4: Implement Continue Button [15 min]

**Subtasks:**
1. Add Continue button at bottom of step
2. Disable when selection is invalid:
   - No room selected
   - "Other" selected but custom name empty
3. Style with Airbnb brand colors (#FF385C)
4. Wire up `onNext` handler

**Button Implementation:**
```tsx
<button
  type="button"
  onClick={onNext}
  disabled={!isValid}
  className={cn(
    "w-full py-4 rounded-lg font-semibold text-lg",
    "transition-colors duration-150",
    isValid
      ? "bg-[#FF385C] text-white hover:bg-[#E31C5F]"
      : "bg-gray-200 text-gray-400 cursor-not-allowed"
  )}
>
  Continue
</button>
```

### Task 5: Update Barrel Exports [5 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Subtasks:**
1. Uncomment the `RoomSelectionStep` export lines
2. Verify export syntax is correct

```typescript
// Task 2.1: RoomSelectionStep
export { RoomSelectionStep } from './RoomSelectionStep';
export type { RoomSelectionStepProps } from './RoomSelectionStep';
```

### Task 6: Integrate with Main Workflow [15 min]

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Subtasks:**
1. Import `RoomSelectionStep` from steps index
2. Replace `StepPlaceholder` in `case 'room-selection'` with `RoomSelectionStep`
3. Pass required props from workflow state and actions
4. Handle custom room name if implementing Option B

**Integration:**
```tsx
case 'room-selection':
  return (
    <RoomSelectionStep
      currentRoom={state.currentItem?.room ?? null}
      onSelectRoom={selectRoom}
      onNext={nextStep}
      canNext={canGoNext}
    />
  );
```

### Task 7: Write Unit Tests [45 min]

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/RoomSelectionStep.test.tsx`

**Test Cases:**
1. **Rendering:**
   - Renders all 9 room options
   - Each room displays correct icon and label
   - Step header and description are visible

2. **Selection:**
   - Clicking a room calls `onSelectRoom` with correct room type
   - Selected room shows selected visual state
   - Re-selecting same room works correctly

3. **"Other" Option:**
   - Selecting "Other" reveals text input
   - Input accepts text entry
   - Empty input disables Continue button
   - Non-empty input enables Continue button

4. **Navigation:**
   - Continue button calls `onNext` when clicked
   - Continue button disabled when no selection
   - Continue button disabled when "Other" selected but input empty

5. **Accessibility:**
   - radiogroup role is present on grid
   - aria-label describes the selection purpose
   - Keyboard navigation works (Enter/Space to select)
   - Custom input has proper label association

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Description |
|-----------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Main step component |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/RoomSelectionStep.test.tsx` | Unit tests |

### Files to Modify

| File Path | Modification | Functions/Sections |
|-----------|--------------|-------------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Uncomment exports | Lines 12-14 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Replace placeholder | `renderCurrentStep()` case 'room-selection' (line 147-148) |

### Files to Reference (Read Only)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for `RoomType`, `CurrentItemState` |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `ROOM_TYPES`, `ROOM_LABELS`, `ROOM_ICONS` |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `selectRoom` action, `canGoNext` logic |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Existing card component to reuse |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ItemTypeCard.test.tsx` | Testing pattern reference |

---

## Integration Points

### With useWorkflowState Hook

The step component receives and uses:
- `state.currentItem?.room` - Currently selected room
- `selectRoom(room)` - Action to update selected room
- `canGoNext` - Computed validation (checks `room != null`)
- `nextStep()` - Navigation to next step

### With RoomCard Component

Reuse existing `RoomCard` component which provides:
- Icon mapping via `getRoomIcon()` utility
- Selection styling (blue border/background)
- Disabled styling (for previously used rooms, if needed)
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
| Selection Border | blue-500 | `border-blue-500` |
| Selection Background | blue-50 | `bg-blue-50` |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Step Title | 24px (2xl) | Semi-bold (600) |
| Step Description | 16px (base) | Normal (400) |
| Room Label | 14-16px | Medium (500) |
| Button | 18px (lg) | Semi-bold (600) |

### Spacing (8px Grid)

- Grid gap: 16px (`gap-4`)
- Container padding: 24px (`p-6`)
- Card padding: 16-24px (`p-4 sm:p-6`)
- Section spacing: 24px (`mt-6`)

### Touch Targets

- Minimum: 48x48px (WCAG 2.5.5)
- Room cards: 100px min-height (mobile), 120px (desktop)
- Continue button: Full width, 56px height (`py-4`)

---

## Dependencies

### Required (Already Installed)

| Package | Usage |
|---------|-------|
| `react` | Component framework |
| `lucide-react` | Room icons |
| `@/lib/utils` | `cn()` utility for class merging |

### No New Dependencies Required

The implementation uses only existing infrastructure.

---

## Risk Assessment

### Low Risk
- **Component Structure:** Follows established patterns from `RoomCard` and `ItemTypeCard`
- **State Integration:** Uses existing `selectRoom` action
- **Styling:** Consistent with design system tokens

### Medium Risk
- **Custom Room Name Handling:** Requires decision on state management approach
  - **Mitigation:** Start with local state, upgrade if persistence needed

### Validation Considerations
- Empty custom room name should be blocked
- Leading/trailing whitespace should be trimmed
- Consider max length for custom room names (e.g., 50 characters)

---

## Success Criteria

Per REQ-098 Acceptance Criteria:

- [ ] Room selection step displays a grid of predefined room options with icons and text labels
- [ ] Each room option has a minimum touch target size of 48x48 pixels for mobile accessibility
- [ ] An "Other" option is available for rooms not in the predefined list
- [ ] Selecting "Other" reveals a text input field for entering a custom room name
- [ ] Users can change their selection before proceeding to the next step
- [ ] The selected room (predefined or custom) is saved to the workflow state
- [ ] Navigation to the next workflow step is only possible after a valid room selection is made
- [ ] The step integrates seamlessly with the workflow's progress indicator and navigation pattern

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: Create component structure | 30 min |
| Task 2: Implement room grid | 20 min |
| Task 3: Implement "Other" input | 30 min |
| Task 4: Continue button | 15 min |
| Task 5: Update barrel exports | 5 min |
| Task 6: Integrate with workflow | 15 min |
| Task 7: Write unit tests | 45 min |
| **Total** | **~2.5 hours** |

---

## References

- [REQ-098 in gen_requests.md](/docs/gen_requests.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [RoomCard Component](/src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx)
- [useWorkflowState Hook](/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [ItemTypeCard Tests (Pattern Reference)](/src/components/ItemCreationWorkflow/components/shared/__tests__/ItemTypeCard.test.tsx)
