# Implementation Plan: FAQBNB Review - Master Implementation Plan

**Generated:** 2026-01-11 20:45:00 UTC
**Last Modified:** 2026-01-11 20:45:00 UTC
**Plan Number:** 098
**PRD Source:** `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-202611.md`
**Previous Plans:** Plan-095, Plan-096, Plan-097 (consolidated)

---

## Overview

This is the **master implementation plan** for the FAQBNB Application Review dated 2026-01-11. The PRD contains 5 change requests identified during a review session of the staging application (faqbnb-staging.up.railway.app v0.2 Build 55881d9).

This plan consolidates and cross-references existing plans while providing the definitive implementation guide with dependency ordering and effort estimates.

### Request Summary

| Request | Description | Priority | Type | Existing Plan | Status |
|---------|-------------|----------|------|---------------|--------|
| REQ-1 | Make dashboard cards clickable | HIGH | UI/UX | Plan-095 | Ready |
| REQ-2 | Fix data model - separate Item from Article | CRITICAL | Data/Logic | Plan-096 | Ready |
| REQ-3 | Fix "What's Next" screen options | HIGH | UI/UX | Plan-097 Phase 2 | Ready |
| REQ-4 | Update navigation menu structure | MEDIUM | Navigation | Plan-097 Phase 3 | Ready |
| REQ-5 | Fix workflow step count (8 of 8) | HIGH | UI/Logic | Plan-097 Phase 1 | Ready |

---

## Technical Context

### Existing Stack (Verified)
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x with strict mode
- **Styling:** Tailwind CSS v4
- **State Management:** Custom hooks (useReducer pattern) in `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Database:** Supabase (PostgreSQL)
- **Build Tool:** Next.js with Turbopack
- **UI Components:** Lucide React icons, Radix UI primitives
- **Testing:** Vitest + Testing Library

### Key Files Affected

| File | REQ | Change Type | Purpose |
|------|-----|-------------|---------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | REQ-1 | MODIFY | Add click handlers to stat cards |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | REQ-2 | MODIFY | Add `articleTitle` field, clarify data model |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | REQ-2, REQ-5 | MODIFY | Fix state model, update step count |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | REQ-3 | MAJOR | Replace options, remove Cancel/Back |
| `src/components/RoleBasedNavigation.tsx` | REQ-4 | MODIFY | Update menu structure, add Instructions |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | REQ-5 | MODIFY | Update WORKFLOW_STEPS to 8 |
| `src/lib/pdf-generator-pdfkit.ts` | REQ-2 | MODIFY | Use Item name for QR label |

### New Dependencies Required
None - all requirements achievable with existing dependencies.

---

## Dependency Analysis

### Critical Path

```
REQ-2 (CRITICAL: Data Model Fix)
    |
    v
REQ-5 (HIGH: Step Count Fix)
    |
    v
REQ-3 (HIGH: What's Next Options)
    |
    v
REQ-1 (HIGH: Dashboard Cards) ---- PARALLEL
    |
REQ-4 (MEDIUM: Navigation Menu) -- PARALLEL
```

### Implementation Order (Recommended)

| Order | Request | Reason | Estimated Effort |
|-------|---------|--------|------------------|
| 1 | REQ-2 | Foundation - data model must be correct first | 9-10 hours |
| 2 | REQ-5 | Depends on REQ-2 understanding; enables REQ-3 | 4 hours |
| 3 | REQ-3 | Depends on REQ-5; post-save flow | 8 hours |
| 4 | REQ-1 | Independent, can parallel with 3 | 2.5 days |
| 5 | REQ-4 | Lowest priority, independent | 8 hours |

**Total Estimated Effort:** 6-7 days (with parallelization: ~5 days)

---

## Architecture

### Current vs. Desired Data Model (REQ-2)

```
CURRENT (INCORRECT):                    DESIRED (CORRECT):
+-----------------------------+         +-----------------------------+
| Item                        |         | Item (Physical Object)      |
| name: "How to Clean-Steamer"|         | name: "Steamer"             |
| QR Label: "How to Clean..." |         | QR Label: "Steamer"         |
|                             |         |                             |
| Links (flat):               |         | Articles:                   |
|   - video.mp4               |         |   "How to Clean"            |
|   - manual.pdf              |         |     - video.mp4             |
+-----------------------------+         |   "How to Use"              |
                                        |     - manual.pdf            |
                                        +-----------------------------+
```

### Current vs. Desired Workflow (REQ-5)

```
CURRENT (10 steps):                     DESIRED (8 steps):
Step 1: Room Selection                  Step 1: Room Selection
Step 2: Item Type Selection             Step 2: Item Type Selection
Step 3: Specific Item Selection         Step 3: Specific Item Selection
Step 4: Purpose Selection               Step 4: Purpose Selection
Step 5: Content Type Selection          Step 5: Content Type Selection
Step 6: Media Capture                   Step 6: Media Capture
Step 7: Preview                         Step 7: Preview
Step 8: Save Item                       Step 8: Save Item (FINAL)
Step 9: What's Next (WRONG!)
Step 10: Session Summary (WRONG!)       [Post-Workflow - NOT numbered]
                                        - What's Next? menu
                                        - Session Summary (optional)
```

### Current vs. Desired What's Next (REQ-3)

```
CURRENT (3 options):                    DESIRED (4 options):
+-----------------------------+         +-----------------------------+
| Step 9 of 10                |         | (No step counter)           |
| What's Next?                |         | What's Next?                |
|                             |         |                             |
| [Review & Submit]           |         | [Edit Instructions]         |
| [Add More Content]          |         | [Add New Instructions]      |
| [Cancel] <- WRONG           |         | [Create New Item]           |
|                             |         | [Done]                      |
| [<- Back] <- WRONG          |         | (No back arrow)             |
+-----------------------------+         +-----------------------------+
```

### Current vs. Desired Navigation (REQ-4)

```
CURRENT (3 items):                      DESIRED (4 items):
[Home]   [My Items]   [My Properties]   [Dashboard] [Items] [Instructions] [Properties]
                                        [D/B]       [Items] [Instr.]       [Prop.]
                                        (mobile labels)
```

---

## Detailed Implementation Plan

### Phase 1: REQ-2 - Fix Data Model (CRITICAL)
**Reference:** Plan-096
**Effort:** 9-10 hours
**Files:** Types, useWorkflowState, PreviewSaveStep, pdf-generator-pdfkit

#### Key Changes:
1. Add `articleTitle` field to `CurrentItemState`
2. Keep `specificItem` as Item name (physical object)
3. `SELECT_PURPOSE` sets `articleTitle`, NOT `itemName`
4. QR label uses `specificItem` (e.g., "Steamer"), not article title
5. PreviewSaveStep shows Item Name (read-only) and Article Title (editable)

#### Acceptance Criteria:
- [ ] Item name is stored separately from Article title
- [ ] QR code label shows Item name only (e.g., "Steamer")
- [ ] When scanning QR, user sees Item header with Articles listed below
- [ ] PreviewSaveStep clearly distinguishes Item Name vs Article Title

---

### Phase 2: REQ-5 - Fix Workflow Step Count
**Reference:** Plan-097 Phase 1
**Effort:** 4 hours
**Files:** constants.ts, useWorkflowState.ts, WorkflowHeader.tsx, PreviewSaveStep.tsx

#### Key Changes:
1. Update `WORKFLOW_STEPS` constant to 8 numbered steps
2. Add `POST_WORKFLOW_SCREENS` for next-action and session-summary
3. Update progress calculation to use 8 steps
4. Conditionally hide step counter for post-workflow screens
5. PreviewSaveStep shows "Step 8 of 8"

#### Code Change - constants.ts:
```typescript
export const NUMBERED_WORKFLOW_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'preview',                  // Step 7
  'save-item',                // Step 8 - FINAL
] as const;

export const POST_WORKFLOW_SCREENS = [
  'next-action',
  'session-summary',
] as const;

export const TOTAL_NUMBERED_STEPS = 8;
```

#### Acceptance Criteria:
- [ ] Step counter shows "Step X of 8" (not 10)
- [ ] "Save Item" is clearly marked as the final workflow step
- [ ] "Item Saved!" confirmation with QR code appears after save
- [ ] What's Next screen has no step counter

---

### Phase 3: REQ-3 - Fix "What's Next" Screen
**Reference:** Plan-097 Phase 2
**Effort:** 8 hours
**Files:** NextActionStep.tsx, ItemCreationWorkflow.tsx

#### Key Changes:
1. Remove Cancel button and confirmation dialog
2. Remove back arrow/navigation
3. Replace 3 options with 4 new options:
   - Edit Instructions - Edit the article just created
   - Add New Instructions - Different instructions for same item
   - Create New Item - Start fresh with different item
   - Done - Exit workflow completely

#### Updated Props Interface:
```typescript
export interface NextActionStepProps {
  itemsCreated: number;
  savedItem: {
    id: string;
    publicId: string;
    name: string;
    qrCodeUrl: string;
  };
  onEditInstructions: () => void;
  onAddNewInstructions: () => void;
  onCreateNewItem: () => void;
  onDone: () => void;
  className?: string;
  // REMOVED: hasUnsavedContent, onCancel, onReviewSubmit, onAddMoreContent
}
```

#### Acceptance Criteria:
- [ ] 4 action cards displayed: Edit, Add New, Create New Item, Done
- [ ] No Cancel button present
- [ ] No back arrow present
- [ ] No step counter on this screen
- [ ] Screen shows "Your item [name] has been saved"

---

### Phase 4: REQ-1 - Make Dashboard Cards Clickable
**Reference:** Plan-095
**Effort:** 2.5 days
**Files:** StatisticsCards.tsx, ProgressiveStatisticsSection.tsx, dashboard2/page.tsx, items/page.tsx

#### Key Changes:
1. Add `onClick` prop to StatCard component
2. Add hover/focus styles for interactive state
3. Wire navigation handlers in dashboard page
4. Handle filter query params on Items page

#### Navigation Mapping:
| Card Clicked | Target URL |
|--------------|------------|
| Items | `/dashboard2/items` |
| Rooms | `/dashboard2/items?filter=room` |
| Tags | `/dashboard2/items?filter=tag` |

#### Acceptance Criteria:
- [ ] Click "3 Items" navigates to Items list
- [ ] Click "0 Rooms" navigates to Items filtered by room
- [ ] Click "2 Tags" navigates to Items filtered by tag
- [ ] Cards have hover/focus visual feedback
- [ ] Keyboard accessible (Tab + Enter)

---

### Phase 5: REQ-4 - Update Navigation Menu
**Reference:** Plan-097 Phase 3
**Effort:** 8 hours
**Files:** RoleBasedNavigation.tsx, permissions.ts, dashboard/instructions/page.tsx (new)

#### Key Changes:
1. Change "Home" to "Dashboard" with grid icon (not house)
2. Remove "My" prefix from Items and Properties
3. Add new "Instructions" menu item
4. Add mobile-optimized short labels

#### New Menu Structure:
| Desktop Label | Mobile Label | Icon | Route |
|---------------|--------------|------|-------|
| Dashboard | D/B | LayoutDashboard | /dashboard |
| Items | Items | Package | /dashboard/items |
| Instructions | Instr. | FileText | /dashboard/instructions |
| Properties | Prop. | Home | /dashboard/properties |

#### Acceptance Criteria:
- [ ] Navigation shows 4 items (Dashboard, Items, Instructions, Properties)
- [ ] Dashboard uses grid icon, not house icon
- [ ] No "My" prefix on any items
- [ ] Mobile labels are abbreviated
- [ ] Instructions page exists (stub acceptable for initial release)

---

## Testing Strategy

### Unit Tests (Per Phase)
- **Phase 1:** titleGenerator returns correct article title; useWorkflowState separates item/article
- **Phase 2:** Step count is 8; progress calculation correct; post-workflow has no counter
- **Phase 3:** NextActionStep renders 4 options; no cancel/back buttons; callbacks fire
- **Phase 4:** StatCard onClick fires; navigation routes correctly
- **Phase 5:** Navigation renders 4 items; mobile labels display

### Integration Tests
- Complete workflow from Room Selection to Save (8 steps)
- What's Next displays correctly after save
- Dashboard card clicks navigate to correct pages
- Navigation menu works on desktop and mobile

### Manual E2E Tests
- [ ] Create item: Kitchen > Appliance > "Steamer" > How to Clean
- [ ] Verify step counter shows "Step 8 of 8" on save screen
- [ ] Verify QR label shows "Steamer" not "How to Clean - Steamer"
- [ ] Verify What's Next has 4 options, no Cancel
- [ ] Verify dashboard cards are clickable
- [ ] Verify navigation shows Dashboard, Items, Instructions, Properties

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing tests | High | Medium | Update tests before merge; run full suite |
| Breaking session persistence | Medium | High | Test session recovery after changes |
| QR label regression | Medium | High | Add unit tests for PDF generator |
| User confusion with nav changes | Low | Medium | Add tooltip descriptions |
| Instructions page incomplete | Low | Low | Stub page with redirect to Items |

---

## Effort Estimate Summary

| Phase | Request | Estimate | Confidence | Dependencies |
|-------|---------|----------|------------|--------------|
| Phase 1 | REQ-2 (Data Model) | 9-10 hours | High | None |
| Phase 2 | REQ-5 (Step Count) | 4 hours | High | After Phase 1 |
| Phase 3 | REQ-3 (What's Next) | 8 hours | High | After Phase 2 |
| Phase 4 | REQ-1 (Dashboard) | 2.5 days | High | Parallel with 3 |
| Phase 5 | REQ-4 (Navigation) | 8 hours | Medium | Parallel with 3 |
| **Total** | | **~6 days** | High | |

With parallelization of Phases 4 and 5: **~5 days total**

---

## Open Questions

1. **Instructions Page Scope:** Full implementation or stub for initial release?
   - **Recommendation:** Stub with redirect to Items section

2. **Add New Instructions Flow:** Skip room/item selection when adding to same item?
   - **Recommendation:** Yes, jump directly to Purpose selection

3. **Edit Instructions:** In-place editing or navigate to separate page?
   - **Recommendation:** Navigate to edit page `/dashboard2/items/[publicId]/edit`

4. **Session Summary:** Still needed after What's Next?
   - **Recommendation:** Make optional; "Done" can exit directly

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review Plan-095 (REQ-1)
- [ ] Review Plan-096 (REQ-2)
- [ ] Review Plan-097 (REQ-3, REQ-4, REQ-5)
- [ ] Confirm Instructions page scope with stakeholders
- [ ] Create feature branch

### Implementation (In Order)
- [ ] **Phase 1:** Fix data model (Item vs Article)
- [ ] **Phase 2:** Fix workflow step count (8 of 8)
- [ ] **Phase 3:** Update What's Next screen (4 options)
- [ ] **Phase 4:** Make dashboard cards clickable
- [ ] **Phase 5:** Update navigation menu

### Post-Implementation
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual E2E verification on desktop
- [ ] Manual E2E verification on mobile
- [ ] Update @lastModified headers in all changed files
- [ ] Update PRD acceptance criteria
- [ ] Create PR with full test results

---

## References

### PRD Source
- `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-202611.md`

### Related Plans
- `/docs/prd/Plan-095-Make-Dashboard-Cards-Clickable.md`
- `/docs/prd/Plan-096-Fix-Data-Model-Separate-Item-From-Article.md`
- `/docs/prd/Plan-097-FAQBNB-Review-Consolidated-Changes.md`

### Key Source Files
- `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
- `/src/components/ItemCreationWorkflow/utils/constants.ts`
- `/src/components/SimpleDashboard/StatisticsCards.tsx`
- `/src/components/RoleBasedNavigation.tsx`
- `/src/lib/pdf-generator-pdfkit.ts`
- `/src/types/index.ts`

### Database Schema
- `/database/schema.sql` (items, item_articles, item_links tables)

---

## Appendix A: Quick Reference - What Changes Where

| What | Current | Desired | File |
|------|---------|---------|------|
| Item name | "How to Clean - Steamer" | "Steamer" | useWorkflowState.ts |
| QR label | "How to Clean - Steamer" | "Steamer" | pdf-generator-pdfkit.ts |
| Step count | "Step 8 of 10" | "Step 8 of 8" | constants.ts |
| What's Next options | 3 (Review, Add, Cancel) | 4 (Edit, Add New, Create, Done) | NextActionStep.tsx |
| Nav menu | Home, My Items, My Properties | Dashboard, Items, Instructions, Properties | RoleBasedNavigation.tsx |
| Dashboard icon | House | Grid | RoleBasedNavigation.tsx |
| Dashboard cards | Static display | Clickable navigation | StatisticsCards.tsx |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Item** | A physical object (e.g., Steamer, Fridge) that gets ONE QR code |
| **Article** | Instructions/content about an item (e.g., "How to Clean") - multiple per item |
| **Purpose** | Same as Article Title; the intent of the instructions |
| **Numbered Step** | A step that appears in the "Step X of Y" counter |
| **Post-Workflow Screen** | A screen shown after the workflow completes (not numbered) |
