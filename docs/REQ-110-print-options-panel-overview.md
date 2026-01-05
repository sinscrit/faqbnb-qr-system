# REQ-110: Print Options Panel - Implementation Overview

**Document Generated:** 2026-01-05 14:45 UTC
**Request Reference:** REQ-110 (docs/gen_requests.md)
**Implementation Plan:** docs/prd/Plan-093-Item-Creation-Workflow.md (Task 6.2)
**Phase:** 6 - Session Summary & QR Generation
**Estimated Size:** M

---

## 1. Summary

This document provides the implementation breakdown for the `PrintOptionsPanel` component, a shared UI component within the ItemCreationWorkflow that allows users to select which items to include in QR code printing and choose between PDF generation, direct printing, or skipping print entirely.

---

## 2. Task Context from Implementation Plan

**Phase 6 Task 6.2: Print Options Panel (1 day)**

From Plan-093-Item-Creation-Workflow.md:
```
#### Task 6.2: Print Options Panel [1 day]
- [ ] Create `PrintOptionsPanel.tsx` component
- [ ] Print scope selector: All items, New items only, Select items
- [ ] "Generate PDF" and "Print Directly" buttons
- [ ] "Just Review / Done for Now" option

**Files:**
- `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`
```

---

## 3. Dependencies

### 3.1 Upstream Dependencies (Must be completed first)

| Task ID | Component | Status |
|---------|-----------|--------|
| 6.1 | SessionSummaryStep.tsx | ✅ Completed (REQ-109) |
| 6.1 | SessionItemCard.tsx | ✅ Completed (REQ-109) |
| 1.1 | ItemCreationWorkflow.types.ts (PrintScope type) | ✅ Completed |

### 3.2 Parallel Dependencies (Can develop concurrently)

| Task ID | Component | Notes |
|---------|-----------|-------|
| 6.3 | QR Code Integration | Uses `useQRCodeGeneration` hook |
| 6.4 | PDF Generation Integration | Uses `pdf-generator.ts` services |

### 3.3 Downstream Consumers

- `SessionSummaryStep.tsx` - Will integrate PrintOptionsPanel
- `ItemCreationWorkflow.tsx` - May orchestrate print actions at top level

---

## 4. Technical Requirements

### 4.1 Functional Requirements (from REQ-110)

1. **Print Scope Selection**
   - All items: Include all items from session + existing items
   - New items only: Only items created in current session
   - Select items: Manual checkbox selection of specific items

2. **Action Buttons**
   - "Generate PDF" button → triggers PDF generation for selected scope
   - "Print Directly" button → triggers browser print for selected scope
   - "Just Review / Done for Now" option → exits without printing

3. **Item Display for Selection Mode**
   - When "Select items" is chosen, display selectable list of items
   - Show item thumbnails, names, and room locations
   - Support for selecting/deselecting individual items

### 4.2 Non-Functional Requirements

- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Touch Targets**: Minimum 48x48px for mobile usability
- **Responsive**: Mobile-first, tablet, and desktop layouts
- **Performance**: Handle up to 50 items efficiently

---

## 5. Existing Patterns to Follow

### 5.1 Component Structure Pattern

Following established ItemCreationWorkflow component structure:

```typescript
// File: src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx

'use client';

/**
 * PrintOptionsPanel Component
 *
 * Shared component for selecting print scope and triggering print actions.
 *
 * @module ItemCreationWorkflow/components/shared/PrintOptionsPanel
 * @see docs/REQ-110-print-options-panel-overview.md
 * @lastModified 2026-01-05 (REQ-110 Print Options Panel)
 */

// ... implementation
```

### 5.2 Type Patterns

The `PrintScope` type is already defined in `ItemCreationWorkflow.types.ts`:

```typescript
export type PrintScope =
  | { type: 'all' }
  | { type: 'new-only' }
  | { type: 'selected'; itemIds: string[] };
```

### 5.3 UI Patterns from Existing Components

**From SessionSummaryStep.tsx:**
- Sticky footer with action buttons
- Button styling with Airbnb design tokens
- Lucide React icons
- `cn()` utility for className merging

**From PDFExportOptions.tsx:**
- Radio button card selection pattern
- Checkbox option pattern
- Loading state with spinner
- Disabled state handling

**From SessionItemCard.tsx:**
- Thumbnail rendering for different content types
- Item info display (name, room, content count)
- Selection state styling

### 5.4 Color Tokens (Airbnb Design System)

```css
/* Primary brand */
--color-brand-primary: #FF385C;
--color-brand-hover: #E31C5F;
--color-brand-active: #C81856;

/* Text */
--color-text-primary: #222222;
--color-text-secondary: #717171;

/* States */
--color-success: #00A699;
--color-error: #FF5A5F;
```

---

## 6. Component API Design

### 6.1 Props Interface

```typescript
export interface PrintOptionsPanelProps {
  /** Items created in the current session (always available for printing) */
  sessionItems: SessionItem[];

  /** Previously existing items (optional, for "All items" scope) */
  existingItems?: SessionItem[];

  /** Callback when user selects "Generate PDF" */
  onGeneratePDF: (scope: PrintScope) => Promise<void>;

  /** Callback when user selects "Print Directly" */
  onPrintDirect: (scope: PrintScope) => Promise<void>;

  /** Callback when user selects "Done for Now" (skip printing) */
  onSkipPrint: () => void;

  /** Whether print operations are in progress */
  isProcessing?: boolean;

  /** Current processing status message */
  processingStatus?: string;

  /** Error message to display */
  error?: string | null;

  /** Callback to clear error */
  onClearError?: () => void;

  /** Optional CSS class */
  className?: string;
}
```

### 6.2 Internal State

```typescript
interface PrintOptionsPanelState {
  /** Currently selected scope type */
  scopeType: 'all' | 'new-only' | 'selected';

  /** Selected item IDs when scopeType is 'selected' */
  selectedItemIds: Set<string>;

  /** Whether the selection list is expanded */
  isSelectionExpanded: boolean;
}
```

---

## 7. Implementation Tasks

### Task 1: Base Component Structure (1 hour)

Create the component file with:
- Props interface and type definitions
- Internal state management with useState
- Basic layout structure (scope selector + actions)
- Module JSDoc header

**Acceptance Criteria:**
- [ ] Component renders without errors
- [ ] Props interface is complete and documented
- [ ] State initializes correctly

### Task 2: Scope Selection UI (2 hours)

Implement radio-card selection for scope options:
- "All Items" card with item count
- "New Items Only" card with session item count
- "Select Items" card that expands to show selection UI

**Acceptance Criteria:**
- [ ] Three scope options rendered as selectable cards
- [ ] Visual feedback for selected option (Airbnb brand color)
- [ ] Item counts displayed on cards
- [ ] Keyboard navigation works (Tab, Space/Enter)
- [ ] ARIA roles: radiogroup, radio, checked state

### Task 3: Item Selection List (2 hours)

When "Select Items" is chosen, render a scrollable list:
- Reuse `SessionItemCard` pattern for item display
- Add checkbox selection to each item
- Select All / Deselect All toggle
- Show selected count indicator

**Acceptance Criteria:**
- [ ] Selection list appears when "Select Items" chosen
- [ ] Checkboxes toggle individual item selection
- [ ] Select All / Deselect All works correctly
- [ ] Selected count updates in real-time
- [ ] Maximum height with scroll for long lists
- [ ] Focus management when list expands

### Task 4: Action Buttons (1.5 hours)

Implement the action footer:
- "Generate PDF" primary button
- "Print Directly" secondary button
- "Done for Now" text link/button
- Loading states with spinner
- Disabled states when no items selected

**Acceptance Criteria:**
- [ ] Generate PDF button triggers onGeneratePDF callback
- [ ] Print Directly button triggers onPrintDirect callback
- [ ] Done for Now triggers onSkipPrint callback
- [ ] Buttons disabled when isProcessing is true
- [ ] Buttons disabled when scopeType is 'selected' and no items selected
- [ ] Loading spinner shown during processing

### Task 5: Error Handling UI (0.5 hours)

Add error display and retry capability:
- Error banner with message
- Dismiss button
- Retry suggestion

**Acceptance Criteria:**
- [ ] Error banner displays when error prop is set
- [ ] Dismiss button clears error via onClearError
- [ ] Error styling matches Airbnb error color (#FF5A5F)

### Task 6: Unit Tests (1 hour)

Create comprehensive tests:
- Render tests for all states
- Scope selection interaction
- Item selection (when in 'selected' mode)
- Button click handlers
- Accessibility tests

**Acceptance Criteria:**
- [ ] Tests cover all scope selection scenarios
- [ ] Tests verify callback invocations with correct PrintScope
- [ ] Tests verify disabled/loading states
- [ ] Tests verify accessibility attributes

### Task 7: Barrel Export Update (0.1 hours)

Update the shared components barrel export:

```typescript
// In src/components/ItemCreationWorkflow/components/shared/index.ts
export { PrintOptionsPanel } from './PrintOptionsPanel';
export type { PrintOptionsPanelProps } from './PrintOptionsPanel';
```

---

## 8. Authorized Files and Functions for Modification

### 8.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Main component implementation |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/PrintOptionsPanel.test.tsx` | Unit tests |

### 8.2 Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add PrintOptionsPanel export |

### 8.3 Files for Reference Only (Do Not Modify)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | PrintScope type definition |
| `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx` | Item display pattern |
| `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Integration context |
| `src/components/PDFExportOptions.tsx` | Selection card patterns |
| `src/hooks/useQRCodeGeneration.ts` | QR generation patterns |
| `src/lib/pdf-generator.ts` | PDF generation integration |

---

## 9. Integration Points

### 9.1 Integration with SessionSummaryStep

The `PrintOptionsPanel` will be integrated into `SessionSummaryStep.tsx` after Task 6.2 is complete. The integration will:

1. Replace or augment the current "Print QR Codes" and "Skip & Finish" buttons
2. Show the panel when user clicks "Print QR Codes"
3. Handle the print scope callbacks

### 9.2 Integration with ItemCreationWorkflow Props

The main workflow component already has props for print operations:

```typescript
interface ItemCreationWorkflowProps {
  onGeneratePDF: (items: SessionItem[], scope: PrintScope) => Promise<Blob>;
  onPrintDirect: (items: SessionItem[], scope: PrintScope) => Promise<void>;
  // ...
}
```

The `PrintOptionsPanel` will call these via callbacks passed down from `SessionSummaryStep`.

---

## 10. Component Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│                   Print Options                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Which items would you like to print?                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ○  All Items                                    (12)    ││
│  │    Include new and existing items                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ●  New Items Only                               (4)     ││
│  │    Only items created in this session                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ○  Select Items                                         ││
│  │    Choose specific items to print                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              🖨️  Generate PDF                            ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              🖨️  Print Directly                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│              Just Review / Done for Now →                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Selection Mode Expanded:**

```
┌─────────────────────────────────────────────────────────────┐
│  ●  Select Items                               (2 selected) │
│  ├─────────────────────────────────────────────────────────┤│
│  │  ☑ All / ☐ None                                         ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ ☑  Kitchen - Stove      [📹]     Kitchen           │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ ☑  Laundry - Washer     [📷]     Laundry Room      │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ ☐  Bathroom - Shower    [📄]     Bathroom          │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ ☐  Living Room - TV     [🔗]     Living Room       │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Accessibility Considerations

### 11.1 ARIA Attributes

```jsx
<div role="radiogroup" aria-labelledby="scope-label">
  <label id="scope-label" className="sr-only">Select print scope</label>

  <div
    role="radio"
    aria-checked={scopeType === 'all'}
    tabIndex={scopeType === 'all' ? 0 : -1}
    onKeyDown={handleKeyDown}
  >
    All Items
  </div>

  {/* ... other options */}
</div>
```

### 11.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between scope options and action buttons |
| Space/Enter | Select focused radio option |
| Arrow Up/Down | Navigate between radio options (within radiogroup) |
| Escape | Close selection list (if expanded) |

### 11.3 Screen Reader Announcements

- Live region for selected count updates
- Announce processing status changes
- Announce errors when they occur

---

## 12. Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Large item list performance | Low | Medium | Virtual scrolling if >50 items; lazy rendering |
| Print dialog browser inconsistency | Medium | Low | Clear messaging about browser print dialog |
| PDF generation failure | Medium | Medium | Error handling with retry option |
| State sync with parent component | Low | Medium | Controlled component pattern with clear callbacks |

---

## 13. Definition of Done

- [ ] `PrintOptionsPanel.tsx` component created with full functionality
- [ ] All three scope selection options work correctly
- [ ] Item selection mode with checkboxes functional
- [ ] Generate PDF button triggers callback with correct PrintScope
- [ ] Print Directly button triggers callback with correct PrintScope
- [ ] Done for Now option triggers skip callback
- [ ] Loading/processing states display correctly
- [ ] Error states display with dismiss option
- [ ] Unit tests pass with >80% coverage
- [ ] Barrel export updated
- [ ] Keyboard navigation works correctly
- [ ] Touch targets meet 48x48px minimum
- [ ] Component renders correctly on mobile, tablet, desktop
- [ ] No console errors or warnings

---

## 14. References

- [PRD: Item Creation Workflow](../prd/PRD_Item_Creation_Workflow.md)
- [Implementation Plan: Task 6.2](../prd/Plan-093-Item-Creation-Workflow.md)
- [REQ-109: Session Summary Step](./REQ-109-session-summary-step-overview.md)
- [Airbnb Design System](../prd/airbnb_designsystem.md)
- [Existing PDFExportOptions Component](../../src/components/PDFExportOptions.tsx)

---

*Document generated for REQ-110: Print Options Panel*
*Last Modified: 2026-01-05 14:45 UTC*
