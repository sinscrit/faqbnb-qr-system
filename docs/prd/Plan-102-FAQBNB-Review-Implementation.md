# Implementation Plan: FAQBNB Review - Comprehensive Implementation

**Generated:** 2026-01-11 22:05:00
**Last Modified:** 2026-01-11 22:05:00
**PRD Source:** `docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-220026.md`
**Plan Number:** 102

---

## Overview

This implementation plan addresses 5 change requests from the FAQBNB Application Review session (2026-01-11). The changes span UI/UX improvements, data model clarification, workflow fixes, and navigation restructuring. The implementation is organized into 5 phases based on dependencies and complexity, with REQ-2 (Critical data model fix) being prioritized first.

## Priority Breakdown

| Request | Description | Priority | Type | Estimated Effort |
|---------|-------------|----------|------|------------------|
| REQ-2 | Fix data model - separate Item from Article | CRITICAL | Data/Logic | 4-6 hours |
| REQ-1 | Make dashboard cards clickable | HIGH | UI/UX | 1-2 hours |
| REQ-3 | Fix "What's Next" screen options | HIGH | UI/UX | 2-3 hours |
| REQ-5 | Fix workflow step count (8 of 8) | HIGH | UI/Logic | 1-2 hours |
| REQ-4 | Update navigation menu structure | MEDIUM | Navigation | 2-3 hours |

**Total Estimated Effort:** 10-16 hours

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15 with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** React Context + useReducer pattern
- **Build Tool:** Next.js with Turbopack
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React, Heroicons
- **Relevant Existing Patterns:**
  - Workflow state machine in `useWorkflowState.ts`
  - Dashboard layout with role-based navigation
  - KPI cards in `KPIDashboardOverview.tsx` and `UserDashboard.tsx`
  - Item/Article data model with purpose-based articles

### Key Files to Modify

| File | Changes Required |
|------|------------------|
| `src/components/UserDashboard.tsx` | Add click handlers to stats cards |
| `src/components/KPIDashboardOverview.tsx` | Add click handlers to KPI cards |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Redesign with 4 new action options |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Update field labels for Item/Article clarity |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Update WORKFLOW_STEPS to 8 steps |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Update step count and transitions |
| `src/app/dashboard/layout.tsx` | Update navigation menu structure |
| `src/components/RoleBasedNavigation.tsx` | Add Instructions menu, update icons |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | All required dependencies already installed | N/A | N/A |

---

## Architecture

### Component Structure

Changes affect existing components. No new component directories required.

```
src/
├── components/
│   ├── UserDashboard.tsx         # REQ-1: Add clickable cards
│   ├── KPIDashboardOverview.tsx  # REQ-1: Add clickable cards
│   ├── RoleBasedNavigation.tsx   # REQ-4: Update menu structure
│   └── ItemCreationWorkflow/
│       ├── components/
│       │   └── steps/
│       │       ├── NextActionStep.tsx      # REQ-3: Redesign options
│       │       └── PreviewSaveStep.tsx     # REQ-2: Update labels
│       ├── hooks/
│       │   └── useWorkflowState.ts         # REQ-5: Update step count
│       └── utils/
│           └── constants.ts                # REQ-5: Update workflow config
└── app/
    └── dashboard/
        └── layout.tsx                      # REQ-4: Update navigation
```

### State Management

No new state management patterns required. Changes utilize existing:
- `useWorkflowState` reducer pattern for workflow changes
- `useRouter` from Next.js for navigation
- Props/callbacks for dashboard card click handling

### Data Flow

**REQ-1 - Dashboard Cards:**
```
StatsCard (click) → useRouter.push → Navigate to list page
```

**REQ-2 - Item/Article Distinction:**
```
Current: itemName = "How to Clean - Steamer"  (WRONG: conflates Item + Article)
Fixed:   itemName = "Steamer", articleTitle = "How to Clean"  (CORRECT: separate)
```

**REQ-3 - NextActionStep Flow:**
```
After Save → NextActionStep (4 options)
  ├── Edit Instructions → PreviewSaveStep (edit current)
  ├── Add New Instructions → PurposeStep (same item, new article)
  ├── Create New Item → RoomSelectionStep (fresh item)
  └── Done → Exit workflow
```

**REQ-5 - Step Count:**
```
Current: Steps 1-10 (incorrect, confusing)
Fixed:   Steps 1-8 (workflow ends at Save)
         NextActionStep = Post-workflow menu (NOT numbered)
```

---

## Integration Contract

### REQ-1: Clickable Dashboard Cards

```typescript
interface ClickableStatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;  // NEW: Navigation target
  color?: string;
}
```

### REQ-2: Item/Article Label Clarification

No API changes. UI label updates only:

```typescript
// PreviewSaveStep - ItemDetailsSection
// Current:
<label>Article Title</label>  // WRONG: shows combined name

// Fixed:
<label>Item Name</label>       // Shows: "Steamer"
<label>Article Title</label>   // Shows: "How to Clean" (derived from purpose)
```

### REQ-3: NextActionStep Redesign

```typescript
interface NextActionStepProps {
  itemsCreated: number;
  // REMOVE: hasUnsavedContent - no longer relevant post-save
  onEditInstructions: () => void;     // NEW
  onAddNewInstructions: () => void;   // NEW
  onCreateNewItem: () => void;        // NEW
  onDone: () => void;                 // NEW
  // REMOVE: onReviewSubmit, onAddMoreContent, onCancel
}
```

### REQ-4: Navigation Menu

```typescript
interface NavigationItem {
  name: string;
  mobileLabel: string;  // NEW: abbreviated for mobile
  href: string;
  icon: string;         // UPDATED: different icons
  description?: string;
}
```

### REQ-5: Workflow Step Count

```typescript
// constants.ts - Updated
export const WORKFLOW_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'preview-save',             // Step 7 (was 8)
  'next-action',              // Step 8 (FINAL) - shows "Item Saved!" then menu
] as const;

// REMOVED: 'content-creation', 'session-summary' from numbered steps
```

---

## Implementation Approach

### Phase 1: REQ-2 - Data Model Clarification (CRITICAL)

**Goal:** Fix Item/Article naming confusion in UI

- [ ] **Task 1.1:** Update `PreviewSaveStep.tsx` - Separate Item Name and Article Title fields
  - Change "Article Title" label to "Item Name" for the item identifier
  - Add read-only "Article Title" display derived from purpose selection
  - Update field descriptions for clarity
  - **File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
  - **Effort:** 1 hour

- [ ] **Task 1.2:** Update `ItemDetailsSection` in PreviewSaveStep
  - Reorder fields: Item Name (editable), Article Title (read-only from purpose)
  - Update helper text to clarify: "Item Name appears on QR code label"
  - **File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 1.3:** Update `SpecificItemStep.tsx` - Label as "Item Name"
  - Change heading from "Name your item" to "What is this item called?"
  - Update placeholder text: "e.g., Steamer, Washing Machine, Coffee Maker"
  - **File:** `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 1.4:** Update title generation logic
  - Item Name = specificItem only (e.g., "Steamer")
  - Article Title = PURPOSE_LABELS[purpose] (e.g., "How to Clean")
  - QR Code label = Item Name only
  - **File:** `src/components/ItemCreationWorkflow/utils/titleGenerator.ts`
  - **Effort:** 1 hour

- [ ] **Task 1.5:** Update useWorkflowState for separate item/article handling
  - Ensure `itemName` stores ONLY the item name (not combined)
  - Add `articleTitle` derived field based on purpose
  - **File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
  - **Effort:** 1 hour

### Phase 2: REQ-5 - Fix Workflow Step Count (HIGH)

**Goal:** Change step counter from "8 of 10" to "8 of 8"

- [ ] **Task 2.1:** Update WORKFLOW_STEPS constant
  - Keep only 8 steps (remove session-summary from numbered display)
  - Treat NextActionStep as "Step 8 - Save Complete"
  - **File:** `src/components/ItemCreationWorkflow/utils/constants.ts`
  - **Effort:** 0.5 hours

- [ ] **Task 2.2:** Update PROGRESS_WEIGHTS for 8 steps
  - Recalculate weights: each step ~12.5%
  - `preview-save` = 87.5%, `next-action` = 100%
  - **File:** `src/components/ItemCreationWorkflow/utils/constants.ts`
  - **Effort:** 0.25 hours

- [ ] **Task 2.3:** Update WorkflowHeader display logic
  - When on `next-action` step, show "Item Saved!" instead of step count
  - Hide back arrow and step indicator on post-save screens
  - **File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 2.4:** Update totalSteps calculation in useWorkflowState
  - Return 8 instead of 10 for steps shown to user
  - `session-summary` becomes internal transition, not displayed step
  - **File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
  - **Effort:** 0.5 hours

### Phase 3: REQ-3 - Redesign NextActionStep (HIGH)

**Goal:** Replace Cancel with proper post-workflow menu

- [ ] **Task 3.1:** Remove Cancel button and back arrow
  - These make no sense after item is saved
  - Update WorkflowHeader to hide back button on this step
  - **File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
  - **Effort:** 0.25 hours

- [ ] **Task 3.2:** Create 4 new action cards
  - **Edit Instructions** - Edit the article just created
  - **Add New Instructions** - Create new article for same item
  - **Create New Item** - Start fresh with different item
  - **Done** - Exit workflow completely
  - **File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
  - **Effort:** 1 hour

- [ ] **Task 3.3:** Update action card styling
  - Green for Edit (pencil icon)
  - Blue for Add New (plus icon)
  - Purple for Create New Item (box icon)
  - Gray for Done (check icon)
  - **File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 3.4:** Implement navigation handlers
  - `onEditInstructions` → Navigate back to PreviewSaveStep with current item
  - `onAddNewInstructions` → Navigate to PurposeStep with same item context
  - `onCreateNewItem` → Call startNewItem() and go to RoomSelectionStep
  - `onDone` → Call onSessionComplete/onSessionExit
  - **File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
  - **Effort:** 1 hour

- [ ] **Task 3.5:** Update props and remove legacy options
  - Remove `hasUnsavedContent`, `onReviewSubmit`, `onAddMoreContent`, `onCancel`
  - Add new callbacks as defined in contract
  - **File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
  - **Effort:** 0.5 hours

### Phase 4: REQ-1 - Make Dashboard Cards Clickable (HIGH)

**Goal:** Dashboard cards navigate to respective list pages

- [ ] **Task 4.1:** Update UserDashboard stats cards
  - Add click handlers to navigate:
    - Properties → `/dashboard/properties`
    - Items → `/dashboard/items`
    - Total Views → `/dashboard/analytics` (admin) or stay (user)
    - Activity → `/dashboard/items` (recent filter)
  - **File:** `src/components/UserDashboard.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 4.2:** Update KPIDashboardOverview KPI cards
  - Add click handlers to navigate:
    - Total Properties → `/dashboard/properties`
    - Total Items → `/dashboard/items`
    - Total Views → `/dashboard/analytics`
    - Active Items → `/dashboard/items?filter=active`
  - **File:** `src/components/KPIDashboardOverview.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 4.3:** Add visual affordance for clickable cards
  - Add hover effect: `hover:shadow-md hover:border-blue-300`
  - Add cursor pointer: `cursor-pointer`
  - Add subtle transition: `transition-all duration-200`
  - **Files:** `UserDashboard.tsx`, `KPIDashboardOverview.tsx`
  - **Effort:** 0.25 hours

- [ ] **Task 4.4:** Add keyboard accessibility
  - Cards should be focusable and activatable via Enter/Space
  - Add appropriate ARIA labels
  - **Files:** `UserDashboard.tsx`, `KPIDashboardOverview.tsx`
  - **Effort:** 0.25 hours

### Phase 5: REQ-4 - Update Navigation Menu (MEDIUM)

**Goal:** New 4-item menu with improved labels and icons

- [ ] **Task 5.1:** Update navigation items in RoleBasedNavigation
  - Replace "Home" with "Dashboard" (grid icon, NOT house)
  - Keep "Items" (box icon)
  - Add "Instructions" NEW (document/list icon)
  - Rename "Properties" (house icon - now appropriate)
  - **File:** `src/components/RoleBasedNavigation.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 5.2:** Add mobile labels
  - Dashboard → "D/B"
  - Items → "Items" (unchanged, short enough)
  - Instructions → "Instr."
  - Properties → "Prop."
  - **File:** `src/components/RoleBasedNavigation.tsx`
  - **Effort:** 0.25 hours

- [ ] **Task 5.3:** Update navigation in dashboard layout
  - Mirror changes in `src/app/dashboard/layout.tsx`
  - Ensure consistency between layouts
  - **File:** `src/app/dashboard/layout.tsx`
  - **Effort:** 0.5 hours

- [ ] **Task 5.4:** Create Instructions list page
  - New route: `/dashboard/instructions`
  - Lists all articles grouped by item
  - Filter by purpose type
  - **Files:**
    - `src/app/dashboard/instructions/page.tsx` (NEW)
    - `src/components/InstructionsManagement.tsx` (NEW)
  - **Effort:** 1-2 hours

- [ ] **Task 5.5:** Update icon imports
  - Replace house icon (Home) with grid icon (LayoutDashboard from Lucide)
  - Add FileText icon for Instructions
  - **Files:** All navigation-related components
  - **Effort:** 0.25 hours

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Item Name storage | Store only item name, derive article title from purpose | Matches correct data model; prevents UI confusion |
| Step count display | 8 numbered steps, post-save as unnumbered menu | Matches user mental model; "Save" is final action |
| Cancel button removal | Remove entirely on post-save screen | Nothing to cancel after successful save |
| Instructions menu | New dedicated menu item | Clear separation of Items (physical) vs Instructions (content) |
| Mobile labels | Abbreviated versions | Space constraint on mobile; maintains scannability |
| Card click navigation | Direct router.push | Consistent with existing patterns; fast navigation |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data model change breaks existing items | Medium | High | Changes are UI-only; database schema unchanged |
| Step count change confuses existing users | Low | Medium | Clear visual transition; "Item Saved!" confirmation |
| New Instructions page requires API changes | Low | Medium | Reuse existing article API endpoints |
| Mobile navigation overflow | Low | Low | Abbreviated labels tested; responsive design |
| Back navigation after workflow changes | Medium | Medium | Comprehensive testing of step history |

---

## Effort Estimate

| Phase | Description | Estimate | Confidence |
|-------|-------------|----------|------------|
| Phase 1 | REQ-2: Data Model Clarification | 4 hours | High |
| Phase 2 | REQ-5: Fix Step Count | 2 hours | High |
| Phase 3 | REQ-3: Redesign NextActionStep | 3 hours | Medium |
| Phase 4 | REQ-1: Clickable Dashboard Cards | 1.5 hours | High |
| Phase 5 | REQ-4: Navigation Menu | 2.5-3.5 hours | Medium |
| **Total** | | **13-14 hours** | Medium-High |

---

## Testing Requirements

### Unit Tests
- [ ] Test useWorkflowState step transitions with new 8-step flow
- [ ] Test NextActionStep action handlers
- [ ] Test clickable card navigation in dashboard components

### Integration Tests
- [ ] Test complete workflow: Room → Purpose → Content → Save → Next Action
- [ ] Test "Add New Instructions" flow creates new article for same item
- [ ] Test navigation menu routing to all 4 sections

### Manual Testing
- [ ] Verify QR code label shows Item Name only (not combined)
- [ ] Verify step counter shows "Step 8 of 8" on save screen
- [ ] Verify "Item Saved!" confirmation appears after save
- [ ] Verify back arrow hidden on post-save menu
- [ ] Verify all 4 action cards navigate correctly
- [ ] Verify dashboard cards are clickable and navigate
- [ ] Verify navigation menu works on mobile with abbreviated labels

---

## Open Questions

1. **Instructions Page Content:** Should the new Instructions page show all articles, or only those for the current account/property context?
   - *Recommendation:* Follow existing Items page pattern - respect account/property context.

2. **Done Button Behavior:** Should "Done" navigate to dashboard or show session summary?
   - *Recommendation:* Navigate to dashboard for clean exit; session summary is optional review.

3. **Edit Instructions vs Add New:** Should "Edit Instructions" allow changing the purpose, or only the content?
   - *Recommendation:* Allow full editing including purpose change.

---

## References

- [PRD Source](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-220026.md)
- [Plan-094 UI/UX Workflow Improvements](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
- [ItemCreationWorkflow Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx)
- [useWorkflowState Hook](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)
- [Workflow Constants](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCreationWorkflow/utils/constants.ts)
- [UserDashboard Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/UserDashboard.tsx)
- [KPIDashboardOverview Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/KPIDashboardOverview.tsx)
- [RoleBasedNavigation Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/RoleBasedNavigation.tsx)
- [Dashboard Layout](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/dashboard/layout.tsx)

---

## Appendix A: Correct Data Model Reference

### Item vs Article Terminology

| Concept | Description | Example | Where Displayed |
|---------|-------------|---------|-----------------|
| **Item** | A physical thing. Gets ONE QR code. | Fridge, Oven, Steamer | QR code label, Item lists |
| **Article** | Instructions/content about an item. Multiple per item. | "How to Clean", "How to Turn Off" | Article title, scan result |
| **Purpose** | = Article Title (same thing) | "How to Clean" | Derived from purpose selection |
| **QR Code** | ONE per Item (not per article) | Scan "Fridge" = see all articles | Physical label |

### Current vs Fixed UI Labels

| Location | Current (Wrong) | Fixed (Correct) |
|----------|-----------------|-----------------|
| SpecificItemStep | "Name your item: How to Clean - Steamer" | "Item Name: Steamer" |
| PreviewSaveStep | "Article Title: How to Clean - Steamer" | "Item Name: Steamer" + "Article: How to Clean" |
| QR Code Label | "How to Clean - Steamer" | "Steamer" |
| Scan Result | Single article | List of all articles for item |

---

## Appendix B: Navigation Menu Specification

### Desktop Layout

| Position | Label | Icon (Lucide) | Route |
|----------|-------|---------------|-------|
| 1 | Dashboard | LayoutDashboard | /dashboard |
| 2 | Items | Package | /dashboard/items |
| 3 | Instructions | FileText | /dashboard/instructions |
| 4 | Properties | Home | /dashboard/properties |

### Mobile Layout

| Position | Label | Icon (Lucide) | Route |
|----------|-------|---------------|-------|
| 1 | D/B | LayoutDashboard | /dashboard |
| 2 | Items | Package | /dashboard/items |
| 3 | Instr. | FileText | /dashboard/instructions |
| 4 | Prop. | Home | /dashboard/properties |

---

## Appendix C: NextActionStep Redesign

### New Action Cards

| Order | Card Title | Description | Icon | Color | Action |
|-------|------------|-------------|------|-------|--------|
| 1 | Edit Instructions | Edit the instructions/article just created | Pencil | Green | Navigate to PreviewSaveStep |
| 2 | Add New Instructions | Create different instructions for the same item | Plus | Blue | Navigate to PurposeStep |
| 3 | Create New Item | Start fresh with a different item | Package | Purple | Reset and go to RoomSelectionStep |
| 4 | Done | Exit the workflow completely | Check | Gray | Exit workflow |

### Removed Elements
- Cancel button (makes no sense post-save)
- Back arrow (can't undo a save)
- Step counter (this is post-workflow menu, not a numbered step)
