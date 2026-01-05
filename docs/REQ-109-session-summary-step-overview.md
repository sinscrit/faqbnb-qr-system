# REQ-109: Session Summary Step Implementation Overview

**Created:** 2026-01-05 20:15:00 UTC
**Last Modified:** 2026-01-05 20:15:00 UTC
**Request Reference:** REQ-109 from docs/gen_requests.md
**Implementation Plan:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 6, Task 6.1)

---

## 1. Summary

This document provides the implementation breakdown for the Session Summary Step (Step 9) of the Item Creation Workflow. This step presents users with a comprehensive review of all content items created during their current session, along with access to previously created items in a collapsible section. Users can edit or remove any displayed item before proceeding to QR code generation.

---

## 2. Context from Implementation Plan

### Phase Context
- **Phase:** 6 - Session Summary & QR Generation
- **Task ID:** 6.1
- **Predecessor:** Task 5.2 (Multi-Content Item Support - REQ-108) - Must be complete
- **Successor:** Task 6.2 (PrintOptionsPanel) - Provides print scope selection

### Component Location in Architecture
```
ItemCreationWorkflow/
├── components/
│   ├── steps/
│   │   ├── NextActionStep.tsx           # Step 8 - Predecessor
│   │   └── SessionSummaryStep.tsx       # Step 9 - THIS COMPONENT
│   └── shared/
│       ├── SessionProgressBar.tsx       # Reuse for progress display
│       ├── SessionItemCard.tsx          # NEW - Item card in summary
│       ├── ContentPieceCard.tsx         # Existing - Content previews
│       └── ...
```

### Workflow State at This Step
When SessionSummaryStep renders, the workflow state contains:
```typescript
{
  currentStep: 'session-summary',
  session: {
    id: string,
    startedAt: Date,
    items: SessionItem[],    // Array of saved items (may be 0 to N)
    currentItem: null,       // No item being created
  },
  currentItem: null,         // Cleared
  isDirty: false,            // Session in review state
}
```

### Step Transitions from session-summary
Per `useWorkflowState.ts:53-54`:
```typescript
'session-summary': [],
```

This is a terminal step - navigation out is via:
1. **Exit** - Complete session via `onSessionComplete` callback
2. **Back** - Return to previous step (next-action) if allowed

---

## 3. Technical Requirements

### 3.1 SessionSummaryStep Component

**Purpose:** Display all session items with editing capabilities before QR generation

**Props Interface:**
```typescript
export interface SessionSummaryStepProps {
  /** Items created in the current session */
  sessionItems: SessionItem[];

  /** Items fetched from previous sessions (optional) */
  existingItems?: SessionItem[];

  /** Loading state for existing items fetch */
  isLoadingExisting?: boolean;

  /** Callback when user wants to edit an item */
  onEditItem: (itemId: string) => void;

  /** Callback when user wants to remove an item */
  onRemoveItem: (itemId: string) => void;

  /** Callback when user wants to add another item */
  onAddMoreItems: () => void;

  /** Callback to proceed to print options (Phase 6.2) */
  onProceedToPrint: () => void;

  /** Callback when user wants to finish without printing */
  onFinishWithoutPrint: () => void;

  /** Optional CSS class */
  className?: string;
}
```

**State Management:**
- Local state for collapsible section (expanded/collapsed)
- Item removal confirmation dialog state
- All data modifications dispatch to workflow state

### 3.2 SessionItemCard Component

**Purpose:** Display individual item with thumbnail, name, content count, and actions

**Props Interface:**
```typescript
export interface SessionItemCardProps {
  /** The session item to display */
  item: SessionItem;

  /** Whether this is a "new" session item (visual distinction) */
  isNew?: boolean;

  /** Callback when edit is clicked */
  onEdit?: (itemId: string) => void;

  /** Callback when remove is clicked */
  onRemove?: (itemId: string) => void;

  /** Whether actions are disabled */
  disabled?: boolean;

  /** Optional CSS class */
  className?: string;
}
```

---

## 4. Dependencies

### Internal Dependencies
| Component/Hook | Location | Purpose |
|----------------|----------|---------|
| `SessionProgressBar` | `components/shared/SessionProgressBar.tsx` | Display session stats |
| `ContentPieceCard` | `components/shared/ContentPieceCard.tsx` | Content thumbnails (reference pattern) |
| `cn` utility | `@/lib/utils` | Class name merging |
| Workflow Types | `../../ItemCreationWorkflow.types.ts` | SessionItem, ContentPiece types |
| Radix `Collapsible` | `@radix-ui/react-collapsible` | Expandable section for existing items |

### External Dependencies (Already Installed)
| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | Existing | Icons (ChevronDown, ChevronUp, Edit, Trash2, Plus, Printer) |
| `@radix-ui/react-collapsible` | Existing | Accessible collapsible sections |
| `@/lib/utils` (cn) | Existing | Class name merging |

---

## 5. UI/UX Specifications

### 5.1 Layout Structure

```
+-----------------------------------------------------------+
|                     Session Summary                         |
|               Review your items before printing             |
+-----------------------------------------------------------+
|                                                             |
|  +-------------------------------------------------------+  |
|  |  Session Progress: 4 items created                     |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  NEW ITEMS IN THIS SESSION                                  |
|  +-------------------------------------------------------+  |
|  |  [Thumb]  Kitchen - Dishwasher          [Edit][Remove]|  |
|  |           2 content pieces                             |  |
|  +-------------------------------------------------------+  |
|  |  [Thumb]  Laundry - Washer              [Edit][Remove]|  |
|  |           1 content piece                              |  |
|  +-------------------------------------------------------+  |
|  |  [Thumb]  Bathroom - Shower             [Edit][Remove]|  |
|  |           3 content pieces                             |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [+] Add More Items                                         |
|                                                             |
|  +-------------------------------------------------------+  |
|  | v Previously Created Items (12)                       |  |
|  +-------------------------------------------------------+  |
|  | (Collapsed by default, expandable)                     |  |
|  |  [Thumb]  Kitchen - Refrigerator        [Edit]         |  |
|  |  [Thumb]  Bedroom - AC Unit             [Edit]         |  |
|  |  ...                                                   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  [Print QR Codes]            [Skip & Finish]           |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-----------------------------------------------------------+
```

### 5.2 SessionItemCard Visual Design

**Card Structure:**
- Full-width, horizontal layout
- Height: auto (min 72px)
- Border radius: 8px (radius-md)
- Border: 1px solid gray-200
- Padding: 12px (space-3)
- Background: white (new items) / gray-50 (existing items)
- Hover: subtle shadow elevation

**Layout:**
```
+-------------------------------------------------------+
| [Thumbnail]  Name                    [Edit] [Remove]  |
| 48x48px      Kitchen - Dishwasher                     |
|              N content pieces  |  Room badge          |
+-------------------------------------------------------+
```

**Thumbnail:**
- 48x48px square, rounded (radius-md)
- Shows first content piece thumbnail or type icon
- Fallback to item type icon if no content

**Item Info:**
- Name: 16px, font-medium, text-[#222222]
- Subtitle: 14px, text-[#717171], "{N} content piece(s)"
- Room badge: small pill with room type label

**Actions:**
- Edit button: Ghost style with Edit icon
- Remove button: Ghost style with Trash2 icon (red on hover)
- 44x44px touch targets (icon + padding)

### 5.3 New Items Section

- Header: "New Items in This Session" with count
- Items displayed in creation order (newest first or oldest first TBD)
- Visual accent: subtle left border with brand color (2px solid #FF385C)
- "Add More Items" button at bottom (secondary style)

### 5.4 Existing Items Section (Collapsible)

- Uses Radix Collapsible for accessibility
- Header: "Previously Created Items ({count})" with chevron indicator
- Collapsed by default
- When expanded, shows all existing items in a scrollable list (max-height)
- Edit available, Remove hidden (don't allow removing existing items in this context)
- Visual distinction: no left accent, slightly muted styling

### 5.5 Empty States

**No New Items:**
```
+-------------------------------------------------------+
|  No items created yet in this session                  |
|                                                        |
|  [Tag Your First Item]                                 |
+-------------------------------------------------------+
```

**No Existing Items:**
- Collapsible section hidden entirely

### 5.6 Action Buttons

**Primary CTA: "Print QR Codes"**
- Full width or prominent placement
- Brand color button (#FF385C)
- Triggers navigation to PrintOptionsPanel (Task 6.2)

**Secondary: "Skip & Finish"**
- Ghost/outline style
- Completes session without printing

**Tertiary: "Add More Items"**
- Link-style button with Plus icon
- Navigates back to room-selection step

### 5.7 Accessibility Requirements

- Collapsible section uses Radix Collapsible (aria-expanded, aria-controls)
- Item cards are focusable with keyboard navigation
- Edit/Remove buttons have descriptive aria-labels
- Screen reader announces item count updates
- Focus management when items are removed
- Remove confirmation dialog is accessible (focus trap, escape to close)

### 5.8 Design System Tokens (Airbnb)

```css
/* Colors */
--color-text-primary: #222222;
--color-text-secondary: #717171;
--color-brand-primary: #FF385C;
--color-success: #00A699;
--color-error: #FF5A5F;
--color-border: #DDDDDD;
--color-background-muted: #F7F7F7;

/* Spacing */
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

---

## 6. Implementation Tasks

### Task 1: Create SessionItemCard Component
**File:** `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`
**Estimate:** 1 story point

**Subtasks:**
- [ ] Create component file with TypeScript interface
- [ ] Implement thumbnail display logic
  - [ ] Extract first content piece for thumbnail
  - [ ] Show appropriate icon fallback based on content type
  - [ ] Handle no-content case with item type icon
- [ ] Implement item info section
  - [ ] Display item name with truncation for long names
  - [ ] Show content piece count
  - [ ] Add room type badge
- [ ] Implement action buttons (Edit, Remove)
  - [ ] Style with hover states
  - [ ] Ensure 44px touch targets
  - [ ] Add aria-labels
- [ ] Apply visual distinction for isNew prop
- [ ] Add hover and focus states
- [ ] Ensure mobile-responsive layout

### Task 2: Create SessionSummaryStep Component
**File:** `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
**Estimate:** 2 story points

**Subtasks:**
- [ ] Create component file with TypeScript interface
- [ ] Implement page header with title and description
- [ ] Add SessionProgressBar integration
- [ ] Implement "New Items" section
  - [ ] Header with item count
  - [ ] Map sessionItems to SessionItemCard components
  - [ ] Handle empty state (no items created)
  - [ ] Add visual accent styling (left border)
- [ ] Implement "Add More Items" button
- [ ] Implement "Previously Created Items" collapsible section
  - [ ] Use Radix Collapsible component
  - [ ] Header with count and chevron indicator
  - [ ] Map existingItems to SessionItemCard components
  - [ ] Default to collapsed state
  - [ ] Add loading skeleton for isLoadingExisting
  - [ ] Hide section if no existing items
- [ ] Implement action buttons footer
  - [ ] "Print QR Codes" primary CTA
  - [ ] "Skip & Finish" secondary button
- [ ] Add remove confirmation dialog integration
- [ ] Apply Airbnb design tokens for styling
- [ ] Add accessibility attributes

### Task 3: Create Remove Confirmation Dialog
**File:** `src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Estimate:** 0.5 story points

**Subtasks:**
- [ ] Create dialog component using Radix Dialog or existing ConfirmExitDialog pattern
- [ ] Show item name in confirmation message
- [ ] "Remove" button (destructive style)
- [ ] "Cancel" button
- [ ] Proper focus management
- [ ] Escape key to close

### Task 4: Update Barrel Exports
**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`
**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`
**Estimate:** 0.25 story points

**Subtasks:**
- [ ] Add SessionItemCard export to shared/index.ts
- [ ] Add RemoveItemDialog export to shared/index.ts (if created separately)
- [ ] Uncomment/add SessionSummaryStep export to steps/index.ts
- [ ] Export prop types

### Task 5: Integrate with Main Workflow Component
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
**Estimate:** 1 story point

**Subtasks:**
- [ ] Import SessionSummaryStep component
- [ ] Replace StepPlaceholder for 'session-summary' step
- [ ] Implement handleEditItem callback:
  - [ ] Find item in session or existing items
  - [ ] Navigate to appropriate editing step (TBD: may require new flow)
- [ ] Implement handleRemoveItem callback:
  - [ ] Remove item from session.items array
  - [ ] Handle removal of last item (edge case)
- [ ] Implement handleAddMoreItems callback:
  - [ ] Dispatch START_NEW_ITEM to go back to room-selection
- [ ] Implement handleProceedToPrint callback:
  - [ ] Navigate to print options (may be modal or next step)
  - [ ] Pass session items for QR generation
- [ ] Implement handleFinishWithoutPrint callback:
  - [ ] Call onSessionComplete with printAction: 'skipped'
- [ ] Fetch existing items on session-summary step entry
- [ ] Pass all required props to SessionSummaryStep

### Task 6: Add Remove Item Action to Workflow State
**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
**Estimate:** 0.5 story points

**Subtasks:**
- [ ] Add `REMOVE_SESSION_ITEM` action type to WorkflowAction union
- [ ] Implement reducer case for REMOVE_SESSION_ITEM:
  - [ ] Filter out item by ID from session.items
  - [ ] Update any derived state if needed
- [ ] Add `removeSessionItem` action creator in hook return
- [ ] Update UseWorkflowStateReturn interface

### Task 7: Update Type Definitions
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Estimate:** 0.25 story points

**Subtasks:**
- [ ] Add REMOVE_SESSION_ITEM to WorkflowAction type
- [ ] Add SessionItemCardProps type
- [ ] Add SessionSummaryStepProps type
- [ ] Add RemoveItemDialogProps type (if applicable)

---

## 7. Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx` | Item card component for summary display |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/SessionItemCard.test.tsx` | Unit tests for SessionItemCard |
| `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Session summary step component |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/SessionSummaryStep.test.tsx` | Unit tests for SessionSummaryStep |
| `src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Remove confirmation dialog (optional, may reuse existing) |

### Existing Files to Modify
| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add SessionItemCard, RemoveItemDialog exports |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Uncomment/add SessionSummaryStep export |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add step rendering case, implement callbacks, fetch existing items |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Add REMOVE_SESSION_ITEM action and handler |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Add REMOVE_SESSION_ITEM action type, new component props |

### Files to Reference (Read-Only)
| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Thumbnail rendering patterns |
| `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Dialog patterns for remove confirmation |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Previous step patterns and styling |
| `src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | Progress display integration |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Room labels, content type configs |
| `src/components/ItemManager/components/ItemCard.tsx` | Item card display patterns (if exists) |

---

## 8. Integration Points

### 8.1 Workflow State Integration

**Reading State:**
```typescript
// Access session items
const sessionItems = state.session.items;
const itemCount = state.session.items.length;
```

**Actions to Dispatch:**
```typescript
// Remove an item from session
dispatch({ type: 'REMOVE_SESSION_ITEM', payload: itemId });

// Go back to create more items
dispatch({ type: 'START_NEW_ITEM' });
```

### 8.2 Main Component Integration

```typescript
// In ItemCreationWorkflow.tsx renderCurrentStep()
case 'session-summary':
  return (
    <SessionSummaryStep
      sessionItems={state.session.items}
      existingItems={existingItems}
      isLoadingExisting={isLoadingExistingItems}
      onEditItem={handleEditItem}
      onRemoveItem={handleRemoveItem}
      onAddMoreItems={startNewItem}
      onProceedToPrint={handleProceedToPrint}
      onFinishWithoutPrint={handleFinishWithoutPrint}
    />
  );

// Fetch existing items when entering session-summary
useEffect(() => {
  if (state.currentStep === 'session-summary') {
    setIsLoadingExistingItems(true);
    onFetchExistingItems()
      .then(items => setExistingItems(items))
      .catch(err => console.error('Failed to fetch existing items:', err))
      .finally(() => setIsLoadingExistingItems(false));
  }
}, [state.currentStep, onFetchExistingItems]);

// Handler for remove item
const handleRemoveItem = useCallback((itemId: string) => {
  dispatch({ type: 'REMOVE_SESSION_ITEM', payload: itemId });
}, [dispatch]);

// Handler for finish without print
const handleFinishWithoutPrint = useCallback(() => {
  onSessionComplete({
    id: state.session.id,
    newItems: state.session.items,
    existingItems: existingItems,
    completedAt: new Date(),
    printAction: 'skipped',
  });
}, [state.session, existingItems, onSessionComplete]);
```

### 8.3 New Action Implementation

```typescript
// In useWorkflowState.ts reducer
case 'REMOVE_SESSION_ITEM': {
  const itemId = action.payload;
  const updatedItems = state.session.items.filter(item => item.id !== itemId);
  return {
    ...state,
    session: {
      ...state.session,
      items: updatedItems,
    },
  };
}

// In WorkflowAction type
| { type: 'REMOVE_SESSION_ITEM'; payload: string }
```

### 8.4 Props Callback Flow

```
SessionSummaryStep
    ├── onEditItem(itemId) → handleEditItem → TBD (requires edit flow design)
    ├── onRemoveItem(itemId) → shows RemoveItemDialog → confirms → handleRemoveItem → dispatch REMOVE_SESSION_ITEM
    ├── onAddMoreItems() → startNewItem → dispatch START_NEW_ITEM → navigates to room-selection
    ├── onProceedToPrint() → handleProceedToPrint → navigates to PrintOptionsPanel or triggers print modal
    └── onFinishWithoutPrint() → handleFinishWithoutPrint → calls onSessionComplete with printAction: 'skipped'
```

---

## 9. Acceptance Criteria

Based on REQ-109 requirements:

- [ ] **AC1:** Session summary screen displays all items created in the current session
- [ ] **AC2:** Each item shows a visual thumbnail or icon representing its content type
- [ ] **AC3:** Previously created items are accessible through a collapsible section that is collapsed by default
- [ ] **AC4:** Each item card provides edit and remove actions that function correctly
- [ ] **AC5:** Visual design clearly distinguishes between new session items and historical items
- [ ] **AC6:** Users can proceed to QR code generation from the summary screen
- [ ] **AC7:** Users can skip printing and finish the session
- [ ] **AC8:** Remove action shows confirmation before removing item
- [ ] **AC9:** All interactive elements meet accessibility requirements (keyboard, ARIA)
- [ ] **AC10:** Touch targets are minimum 44x44px for mobile usability

---

## 10. Testing Considerations

### Unit Tests

**SessionItemCard:**
- Renders item name correctly
- Shows correct content piece count
- Displays thumbnail from first content piece
- Edit button triggers onEdit callback with item ID
- Remove button triggers onRemove callback with item ID
- isNew prop applies correct styling
- Handles long item names with truncation

**SessionSummaryStep:**
- Renders correct number of session items
- Renders session progress bar with correct count
- "New Items" section shows items from sessionItems prop
- Collapsible section defaults to collapsed
- Expanding collapsible shows existing items
- Empty state displays when no session items
- Existing items section hidden when no existing items
- "Print QR Codes" button triggers onProceedToPrint
- "Skip & Finish" button triggers onFinishWithoutPrint
- "Add More Items" button triggers onAddMoreItems
- Loading skeleton shown when isLoadingExisting is true

**RemoveItemDialog:**
- Opens when remove is clicked
- Shows item name in message
- Cancel closes dialog without action
- Confirm triggers removal callback
- Escape key closes dialog

### Integration Tests

- Removing an item updates session.items in workflow state
- Adding more items navigates to room-selection
- Finish without print calls onSessionComplete with correct data
- Edit item navigates to appropriate editing flow (once implemented)
- Existing items fetch is triggered on step entry
- Error handling for failed existing items fetch

### Accessibility Tests

- Collapsible section announces expanded/collapsed state
- Tab navigation works through all interactive elements
- Screen reader announces item count
- Focus moves appropriately after item removal
- Color contrast meets WCAG AA
- All buttons have accessible names

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Edit item flow not defined | High | Medium | Defer edit to Phase 7 or implement simple modal edit; document as known limitation |
| Large number of items impacts performance | Low | Medium | Virtualize list if >20 items; implement pagination for existing items |
| Existing items fetch fails | Medium | Low | Show error state with retry option; allow proceeding without existing items |
| Confusion about new vs existing | Medium | Low | Strong visual distinction; clear section headers |
| Remove last item edge case | Low | Medium | Allow proceeding with 0 items; show appropriate empty state |

---

## 12. Open Questions

1. **Edit Item Flow:** What happens when user clicks "Edit" on an item?
   - **Recommendation:** For V1, show a simplified modal or navigate back through workflow steps with item pre-populated. Full edit flow can be Phase 7.
   - **Alternative:** Disable edit in V1, only allow remove.

2. **Existing Items Actions:** Should users be able to remove existing (previously created) items?
   - **Recommendation:** No - only allow edit on existing items. Removing existing items should go through ItemManager.

3. **Item Ordering:** Should items be ordered by creation time (oldest first or newest first)?
   - **Recommendation:** Newest first for new items, as user likely cares more about recent additions.

4. **Thumbnail Generation:** How to generate thumbnails for different content types?
   - **Recommendation:** Reuse patterns from ContentPieceCard - video frame, photo thumbnail, PDF icon, text icon, URL favicon.

5. **Print Options Integration:** Is PrintOptionsPanel a separate step or inline in session summary?
   - **Recommendation:** Inline panel or modal triggered by "Print QR Codes" button (Task 6.2 will define).

---

*Implementation Overview generated on 2026-01-05 for REQ-109: Session Summary Step*
