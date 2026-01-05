# REQ-107: Next Action Step Implementation Overview

**Created:** 2026-01-05 19:30:00 UTC
**Last Modified:** 2026-01-05 19:30:00 UTC
**Request Reference:** REQ-107 from docs/gen_requests.md
**Implementation Plan:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 5, Task 5.1)

---

## 1. Summary

This document provides the implementation breakdown for the Next Action Step (Step 8) of the Item Creation Workflow. This step presents users with a decision point after saving an item, offering three clear options: add more content to the current item, start tagging a new item, or finish the session. A session progress indicator shows the number of items created during the current session.

---

## 2. Context from Implementation Plan

### Phase Context
- **Phase:** 5 - Session Flow & Multi-Item
- **Task ID:** 5.1
- **Predecessor:** Task 4.2 (PreviewSaveStep) - Must be complete
- **Successor:** Task 5.2 (Multi-Content Item Support) - Extends "Add More" functionality

### Component Location in Architecture
```
ItemCreationWorkflow/
├── components/
│   ├── steps/
│   │   ├── PreviewSaveStep.tsx       # Step 7 - Predecessor
│   │   ├── NextActionStep.tsx        # Step 8 - THIS COMPONENT
│   │   └── SessionSummaryStep.tsx    # Step 9 - "I'm Done" destination
│   └── shared/
│       ├── SessionProgressBar.tsx    # Reuse for progress display
│       └── ...
```

### Workflow State at This Step
When NextActionStep renders, the workflow state contains:
```typescript
{
  currentStep: 'next-action',
  session: {
    id: string,
    startedAt: Date,
    items: SessionItem[],  // Array of saved items (at least 1)
    currentItem: null,     // Item just saved, cleared from currentItem
  },
  currentItem: null,       // Cleared after save
  isDirty: false,          // Session saved successfully
}
```

### Step Transitions from next-action
Per `useWorkflowState.ts:52-53`:
```typescript
'next-action': ['room-selection', 'session-summary'],
```

The step can navigate to:
1. **`room-selection`** - When "Tag New Item" is selected (START_NEW_ITEM action)
2. **`session-summary`** - When "I'm Done" is selected (COMPLETE_SESSION action)
3. **`content-source-selection`** - When "Add More to Item" is selected (requires restoring currentItem and navigating)

---

## 3. Technical Requirements

### 3.1 NextActionStep Component

**Purpose:** Present a decision point with three navigation options after item save

**Props Interface:**
```typescript
export interface NextActionStepProps {
  /** Number of items created in this session */
  itemsCreated: number;

  /** The last saved item (for "Add More" context) */
  lastSavedItem: SessionItem | null;

  /** Callback when user chooses to add more content to current item */
  onAddMore: () => void;

  /** Callback when user chooses to tag a new item */
  onTagNewItem: () => void;

  /** Callback when user chooses to finish the session */
  onDone: () => void;

  /** Optional CSS class */
  className?: string;
}
```

**State Management:**
- No local state required - this is a pure decision step
- All state changes are handled by workflow dispatch actions

### 3.2 Action Card Sub-Component

**Purpose:** Display each action option as a selectable card with icon and description

**Internal Structure:**
```typescript
interface ActionCardProps {
  /** Icon component or element */
  icon: React.ReactNode;

  /** Action title */
  title: string;

  /** Action description */
  description: string;

  /** Click handler */
  onClick: () => void;

  /** Optional variant for styling emphasis */
  variant?: 'default' | 'primary' | 'secondary';

  /** Optional CSS class */
  className?: string;
}
```

---

## 4. Dependencies

### Internal Dependencies
| Component/Hook | Location | Purpose |
|----------------|----------|---------|
| `SessionProgressBar` | `components/shared/SessionProgressBar.tsx` | Display items created count |
| `cn` utility | `@/lib/utils` | Class name merging |
| Workflow Types | `../../ItemCreationWorkflow.types.ts` | SessionItem, WorkflowStep types |
| `useWorkflowState` | `../../hooks/useWorkflowState.ts` | startNewItem, completeSession actions |

### External Dependencies (Already Installed)
| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | Existing | Icons (Plus, PlusCircle, Check, ArrowRight, Tag) |
| `@/lib/utils` (cn) | Existing | Class name merging |

---

## 5. UI/UX Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     What's Next?                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Session Progress                                    │   │
│  │  ████████████░░░░░░░░  4 items created              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [+]  Add More to This Item                         │   │
│  │       Add another video, photo, or document to      │   │
│  │       "Kitchen - Dishwasher"                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🏷]  Tag New Item                                  │   │
│  │       Start creating another item for your property │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [✓]  I'm Done                                      │   │
│  │       Review your items and print QR codes          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Action Cards Visual Design

**Card Structure:**
- Full-width, stacked vertically with 12px gap
- Minimum height: 80px
- Border radius: 12px (radius-lg)
- Border: 1px solid gray-200
- Padding: 16px (space-4)
- Hover: light gray background, subtle shadow
- Focus: 2px ring with brand color

**Icon Treatment:**
- Displayed in a 48x48px circle (meets touch target requirement)
- Icon size: 24x24px
- Background color varies by action type

**Typography:**
- Title: 16px, font-semibold, text-[#222222]
- Description: 14px, font-normal, text-[#717171]

### 5.3 Action Card Configurations

| Action | Icon | Icon BG | Title | Description |
|--------|------|---------|-------|-------------|
| Add More | `Plus` | `bg-blue-100` | "Add More to This Item" | "Add another video, photo, or document to "{lastItemName}"" |
| Tag New | `Tag` | `bg-green-100` | "Tag New Item" | "Start creating another item for your property" |
| I'm Done | `Check` | `bg-[#FF385C]/10` | "I'm Done" | "Review your items and print QR codes" |

### 5.4 Accessibility Requirements

- All action cards must be focusable (`tabindex="0"` or button element)
- Arrow key navigation between cards
- `Enter` or `Space` activates the focused card
- ARIA role: `button` or use semantic `<button>` element
- Each card has descriptive `aria-label`
- Session progress has `role="status"` for screen reader announcement
- Focus visible indicator (2px ring)
- Touch targets: 48x48px minimum (entire card is clickable)

### 5.5 Design System Tokens (Airbnb)

```css
/* Colors */
--color-text-primary: #222222;
--color-text-secondary: #717171;
--color-brand-primary: #FF385C;
--color-success: #00A699;

/* Spacing */
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;

/* Border Radius */
--radius-md: 8px;
--radius-lg: 12px;
```

---

## 6. Implementation Tasks

### Task 1: Create NextActionStep Component
**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
**Estimate:** 1.5 story points

**Subtasks:**
- [ ] Create component file with TypeScript interface
- [ ] Implement page header with "What's Next?" title
- [ ] Integrate SessionProgressBar component
- [ ] Create internal ActionCard sub-component
- [ ] Implement "Add More to This Item" action card
  - [ ] Display last item name in description
  - [ ] Handle click to trigger onAddMore callback
- [ ] Implement "Tag New Item" action card
  - [ ] Handle click to trigger onTagNewItem callback
- [ ] Implement "I'm Done" action card
  - [ ] Handle click to trigger onDone callback
- [ ] Apply Airbnb design tokens for styling
- [ ] Add accessibility attributes (aria-label, role, keyboard navigation)
- [ ] Add hover and focus states for cards
- [ ] Ensure mobile-responsive layout

### Task 2: Update Barrel Exports
**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`
**Estimate:** 0.25 story points

**Subtasks:**
- [ ] Uncomment/add NextActionStep export
- [ ] Export NextActionStepProps type

### Task 3: Integrate with Main Workflow Component
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Estimate:** 1 story point

**Subtasks:**
- [ ] Import NextActionStep component
- [ ] Replace StepPlaceholder for 'next-action' step with NextActionStep
- [ ] Implement handleAddMore callback:
  - [ ] Get last saved item from session.items
  - [ ] Restore currentItem state from last saved item
  - [ ] Navigate to 'content-source-selection' step
- [ ] Implement handleTagNewItem callback:
  - [ ] Dispatch START_NEW_ITEM action (resets to room-selection)
- [ ] Implement handleDone callback:
  - [ ] Dispatch COMPLETE_SESSION action (navigates to session-summary)
- [ ] Pass itemsCreated count from useWorkflowState
- [ ] Pass lastSavedItem from session.items[-1]

### Task 4: Add "Add More" Support to Workflow State
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Estimate:** 0.5 story points

**Subtasks:**
- [ ] Add `ADD_MORE_TO_ITEM` action type to WorkflowAction union
- [ ] Implement reducer case for ADD_MORE_TO_ITEM:
  - [ ] Restore currentItem from the provided SessionItem
  - [ ] Navigate to 'content-source-selection'
  - [ ] Update step history appropriately
- [ ] Update STEP_TRANSITIONS if needed:
  - [ ] Allow 'next-action' → 'content-source-selection' for "Add More" flow
- [ ] Add `addMoreToItem` action creator in hook return

### Task 5: Update Type Definitions (if needed)
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Estimate:** 0.25 story points

**Subtasks:**
- [ ] Add ADD_MORE_TO_ITEM to WorkflowAction type if not present
- [ ] Verify all required types are exported

---

## 7. Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Next action decision step component |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx` | Unit tests for NextActionStep |

### Existing Files to Modify
| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Uncomment/add NextActionStep export |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add step rendering case and callbacks |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Add ADD_MORE_TO_ITEM action and handler |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Add ADD_MORE_TO_ITEM action type |

### Files to Reference (Read-Only)
| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | Progress display pattern |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Preceding step patterns |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Workflow constants |
| `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Card styling patterns |
| `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Card styling patterns |

---

## 8. Integration Points

### 8.1 Workflow State Integration

**Actions to Dispatch:**
```typescript
// Add more content to last item
dispatch({ type: 'ADD_MORE_TO_ITEM', payload: lastSavedItem });
// Or in main component:
// 1. Restore currentItem from lastSavedItem
// 2. dispatch({ type: 'GO_TO_STEP', payload: 'content-source-selection' });

// Start a new item
dispatch({ type: 'START_NEW_ITEM' });

// Complete session (go to summary)
dispatch({ type: 'COMPLETE_SESSION' });
```

### 8.2 Main Component Integration

```typescript
// In ItemCreationWorkflow.tsx renderCurrentStep()
case 'next-action':
  const lastSavedItem = state.session.items[state.session.items.length - 1] || null;
  return (
    <NextActionStep
      itemsCreated={itemCount}
      lastSavedItem={lastSavedItem}
      onAddMore={() => handleAddMore(lastSavedItem)}
      onTagNewItem={() => startNewItem()}
      onDone={() => completeSession()}
    />
  );

// Handler for "Add More to This Item"
const handleAddMore = useCallback((item: SessionItem | null) => {
  if (!item) return;

  // Restore the item as currentItem for editing
  const restoredItem: CurrentItemState = {
    room: item.room,
    itemType: item.itemType,
    specificItem: item.name.split(' - ')[1] || item.name,
    itemName: item.name,
    contentSource: 'existing', // Default, user will choose again
    contentType: null,
    content: item.content, // Preserve existing content
  };

  // Dispatch action to restore and navigate
  dispatch({ type: 'ADD_MORE_TO_ITEM', payload: restoredItem });
}, [dispatch]);
```

### 8.3 New Action Implementation

```typescript
// In useWorkflowState.ts reducer
case 'ADD_MORE_TO_ITEM': {
  const restoredItem = action.payload;
  const newHistory = [...state.stepHistory, state.currentStep];
  return {
    ...state,
    currentStep: 'content-source-selection',
    stepHistory: newHistory,
    canGoBack: true,
    currentItem: restoredItem,
    isDirty: true,
    session: {
      ...state.session,
      currentStep: 'content-source-selection',
      currentItem: restoredItem,
    },
  };
}
```

---

## 9. Acceptance Criteria

Based on REQ-107 requirements:

- [ ] **AC1:** After item creation or editing completion, users are presented with three distinct action options
- [ ] **AC2:** Session progress indicator displays the number of items created in the current session
- [ ] **AC3:** Selecting "Add More to Item" navigates to the appropriate step for adding additional content to the current item
- [ ] **AC4:** Selecting "Tag New Item" initiates a new item creation flow while maintaining the session context
- [ ] **AC5:** Selecting "I'm Done" navigates to session summary/review step
- [ ] **AC6:** The last saved item name is displayed in the "Add More" option description
- [ ] **AC7:** All action cards meet accessibility requirements (keyboard navigation, ARIA labels)
- [ ] **AC8:** Touch targets are minimum 48x48px for mobile usability

---

## 10. Testing Considerations

### Unit Tests
- NextActionStep renders correctly with all three action cards
- Session progress displays correct item count
- Last item name appears in "Add More" description
- Each action card triggers its respective callback on click
- Keyboard navigation works between cards
- Cards are accessible with proper ARIA attributes

### Integration Tests
- "Tag New Item" resets workflow to room-selection step
- "I'm Done" navigates to session-summary step
- "Add More to Item" restores last item and navigates to content-source-selection
- Session items array is preserved through all navigation paths
- Progress count updates correctly as items are saved

### Accessibility Tests
- Keyboard navigation (Tab, Shift+Tab, Enter, Space)
- Screen reader announces step title and progress
- Focus visible on all interactive elements
- Color contrast meets WCAG AA standards

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| "Add More" flow complexity | Medium | Medium | Keep state restoration simple; reuse existing content array |
| Empty session edge case | Low | Low | Hide "Add More" option if no items saved yet (edge case) |
| Navigation history corruption | Low | High | Carefully manage stepHistory in ADD_MORE_TO_ITEM action |
| Mobile layout issues | Low | Medium | Test on various screen sizes; use responsive flex layout |

---

## 12. Open Questions

1. **Add More Destination:** Should "Add More" go to content-source-selection or directly to content-type-selection?
   - **Recommendation:** Go to content-source-selection to allow user to choose between upload/create

2. **Item State After Add More:** When user adds more content and saves, should it create a new item or update the existing?
   - **Recommendation:** Update existing item (requires backend support for item updates)
   - **V1 Alternative:** Create new item with combined content (simpler implementation)

3. **Cancel from Add More Flow:** If user cancels during "Add More" flow, where should they return?
   - **Recommendation:** Return to next-action step with the item still saved

4. **Maximum Content Pieces:** Is there a limit to content pieces per item during "Add More"?
   - **From Plan (Task 5.2):** 10 pieces per item maximum

---

*Implementation Overview generated on 2026-01-05 for REQ-107: Next Action Step*
