# Implementation Plan: FAQBNB Review 2026-01-11 - Comprehensive Changes

**Generated:** 2026-01-11 23:15:00 UTC
**Last Modified:** 2026-01-11 23:15:00 UTC
**Plan Number:** 104
**PRD Source:** `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-225141.md`

---

## Overview

This implementation plan addresses 5 change requests identified during the FAQBNB application review session on 2026-01-11. The requests span UI/UX improvements, data model corrections, navigation enhancements, and workflow refinements.

**Priority Breakdown:** 1 CRITICAL | 3 HIGH | 1 MEDIUM

### Summary of Changes:

| REQ | Description | Priority | Type |
|-----|-------------|----------|------|
| REQ-1 | Make dashboard cards clickable | HIGH | UI/UX |
| REQ-2 | Fix data model - separate Item from Article | CRITICAL | Data/Logic |
| REQ-3 | Fix "What's Next" screen - remove invalid options | HIGH | UI/UX |
| REQ-4 | Update navigation menu - new structure & mobile labels | MEDIUM | Navigation |
| REQ-5 | Fix workflow step count (8 of 8, not 8 of 10) | HIGH | UI/Logic |

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** useReducer pattern, Context API
- **Build Tool:** Next.js with Turbopack
- **UI Components:** Lucide React icons, Radix UI primitives
- **Backend:** Supabase (PostgreSQL)
- **Testing:** Vitest + React Testing Library

### Relevant Existing Patterns:
- `/src/components/ItemCapture/` - Item capture wizard components
- `/src/components/UserDashboard.tsx` - User dashboard with stats cards
- `/src/components/RoleBasedNavigation.tsx` - Permission-based navigation
- `/src/app/dashboard/layout.tsx` - Dashboard layout with navigation
- Reducer-based state management in custom hooks
- Type definitions in `/src/types/` and component-specific `.types.ts` files

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | N/A | N/A | All requirements achievable with existing dependencies |

---

## Request Analysis & Dependencies

### Dependency Graph

```
REQ-2 (CRITICAL: Data Model) ──────────────────┐
                                                │
REQ-3 (HIGH: What's Next Screen) ◄─────────────┤
                                                │
REQ-5 (HIGH: Step Count) ◄─────────────────────┘
         │
         └──► (REQ-3 and REQ-5 depend on understanding the correct data model)

REQ-1 (HIGH: Clickable Dashboard Cards) ──────► Independent

REQ-4 (MEDIUM: Navigation Menu) ──────────────► Independent
```

### Implementation Order

1. **Phase 0:** REQ-2 - Fix data model (foundational understanding)
2. **Phase 1:** REQ-5 - Fix step count (workflow structure)
3. **Phase 2:** REQ-3 - Fix "What's Next" screen (post-workflow menu)
4. **Phase 3:** REQ-1 - Make dashboard cards clickable (UI enhancement)
5. **Phase 4:** REQ-4 - Update navigation menu (UI enhancement)

---

## Phase 0: REQ-2 - Fix Data Model (CRITICAL)

### Problem Statement

The application conflates Item and Article concepts. The current UI shows "Article Title" as "How to Clean - Steamer" suggesting this will appear on the QR code label, which is incorrect.

### Correct Data Model

| Concept | Description | Example |
|---------|-------------|---------|
| **Item** | A physical thing. Gets ONE QR code. | Fridge, Oven, Steamer |
| **Article** | Instructions/content about an item. Multiple per item. | "How to Clean", "How to Turn Off" |
| **Purpose** | Same as Article Title | "How to Clean" |
| **QR Code** | ONE per Item (not per article) | Scan "Fridge" → see all articles |

### Required Changes

1. **MetadataStep field labels:** "Item Name" should show the item (e.g., "Steamer"), NOT "How to Clean - Steamer"
2. **QR Code label:** Shows Item Name only (e.g., "Steamer")
3. **Article Title:** Equals Purpose (e.g., "How to Clean")
4. **QR Code scan result:** User scans QR for "Steamer" → sees list of all articles

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/components/ItemCapture/components/steps/MetadataStep.tsx` | MODIFY | Update "Title" label to "Item Name", add helper text clarifying this is the physical item name |
| `/src/components/ItemCapture/ItemCapture.types.ts` | MODIFY | Update JSDoc comments to clarify `title` is Item Name |
| `/src/components/ItemCapture/utils/constants.ts` | MODIFY | Update METADATA_CONSTRAINTS labels if needed |
| `/src/components/ItemCapture/components/steps/ReviewStep.tsx` | MODIFY | Update "Title" label to "Item Name" in summary |

### Implementation Tasks

- [ ] **Task 0.1:** Update MetadataStep.tsx - Change "Title" label to "Item Name"
  - Change line 345: `Title <span className="text-red-500">*</span>` to `Item Name <span className="text-red-500">*</span>`
  - Update placeholder: "Enter item name..." (e.g., "Steamer", "Coffee Maker")
  - Add helper text: "The physical item this QR code will be attached to"

- [ ] **Task 0.2:** Update ReviewStep.tsx - Change summary label from "Title" to "Item Name"
  - Update the description list term on line 422

- [ ] **Task 0.3:** Update type documentation in ItemCapture.types.ts
  - Clarify that `title` field in ItemMetadata represents the Item Name (physical object)

- [ ] **Task 0.4:** Verify QR code generation uses Item Name correctly
  - Review `/src/lib/qr-generation.ts` or equivalent to ensure label shows Item Name only

---

## Phase 1: REQ-5 - Fix Workflow Step Count (HIGH)

### Problem Statement

Step counter shows "8 of 10" on the Save Item screen. After saving, it shows "Item Saved!" with QR code, then "Continue" leads to more steps. The workflow should end at step 8.

### Required Changes

1. Change step counter to "Step 8 of 8" (not 8 of 10)
2. "Save Item" is the FINAL workflow step
3. "Item Saved!" with QR code = END of workflow
4. "Continue" button leads to post-workflow menu (NOT a numbered step)

### Analysis of Current Step Structure

The ItemCapture component uses a stage-based progress display (4 stages) mapped from internal wizard steps:

```typescript
// Current PROGRESS_STAGES in ProgressIndicator.tsx
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

The issue is likely in a different workflow component (ItemCreationWorkflow) that uses numbered steps differently.

### Files to Identify

Need to locate the component showing "Step 8 of 10":
- Search for step count display
- Likely in `/src/components/ItemCreationWorkflow/` if it exists
- Or in a separate wizard container

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `ProgressIndicator.tsx` or equivalent | MODIFY | Ensure total step count is 8, not 10 |
| Workflow orchestrator component | MODIFY | Remove steps 9 and 10 as numbered steps |
| Post-save component | MODIFY | Change "Continue" to lead to unnumbered menu |

### Implementation Tasks

- [ ] **Task 1.1:** Locate the component displaying "Step X of 10"
  - Search codebase for pattern like `of 10` or step count calculation

- [ ] **Task 1.2:** Update total step count constant
  - Change from 10 to 8

- [ ] **Task 1.3:** Update step progression logic
  - Ensure "Save Item" is step 8
  - Ensure "Item Saved!" confirmation is end of numbered steps

- [ ] **Task 1.4:** Update "Continue" button behavior
  - Navigate to post-workflow menu without step number display

---

## Phase 2: REQ-3 - Fix "What's Next" Screen (HIGH)

### Problem Statement

Current "What's Next" screen (Step 9) shows:
- "Review & Submit"
- "Add More Content"
- "Cancel" (nonsensical - item already saved)
- Back arrow (nonsensical - can't go back after saving)

### Required Changes

1. **REMOVE** the Cancel button
2. **REMOVE** the back arrow
3. This screen should be a **post-workflow menu**, NOT a numbered step
4. New menu structure with 4 options:
   - Edit Instructions - Edit the instructions/article just created
   - Add New Instructions - Create different instructions for the same item
   - Create New Item - Start fresh with a different item
   - Done - Exit the workflow completely

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `NextActionStep.tsx` or equivalent | MAJOR MODIFY | Redesign as post-workflow menu |
| Workflow orchestrator | MODIFY | Don't include this as a numbered step |
| Navigation component | MODIFY | Hide back button on this screen |

### Implementation Tasks

- [ ] **Task 2.1:** Remove Cancel button from post-save menu
  - The item is already saved, Cancel makes no sense

- [ ] **Task 2.2:** Remove back arrow/button from post-save menu
  - Cannot undo a save operation

- [ ] **Task 2.3:** Update menu options to 4 clear choices:
  ```tsx
  const postWorkflowOptions = [
    { id: 'edit-instructions', label: 'Edit Instructions', description: 'Edit the instructions you just created' },
    { id: 'add-instructions', label: 'Add New Instructions', description: 'Create different instructions for the same item' },
    { id: 'create-item', label: 'Create New Item', description: 'Start fresh with a different item' },
    { id: 'done', label: 'Done', description: 'Exit the workflow' },
  ];
  ```

- [ ] **Task 2.4:** Implement handler for each option:
  - Edit Instructions → Navigate to edit page for the article
  - Add New Instructions → Reset workflow but keep Item selected
  - Create New Item → Full workflow reset
  - Done → Navigate to dashboard or items list

- [ ] **Task 2.5:** Remove step indicator from this screen
  - This is a menu, not a workflow step

---

## Phase 3: REQ-1 - Make Dashboard Cards Clickable (HIGH)

### Problem Statement

Dashboard shows summary cards with counts (3 Items, 0 Rooms, 2 Tags) but they are static and non-interactive. Users expect to click on dashboard statistics to drill down into details.

### Required Changes

1. Click "X Items" → Navigate to Items list
2. Click "X Rooms" → Navigate to Rooms list (filtered view or dedicated page)
3. Click "X Tags" → Navigate to Tags list (filtered view or dedicated page)

### Analysis of Current Implementation

In `UserDashboard.tsx`, the stats cards are rendered as static `<div>` elements:

```typescript
// Current statsCards structure (line 152-181)
const statsCards = [
  { title: 'Properties', value: stats.totalProperties, ... },
  { title: 'Items', value: stats.totalItems, ... },
  { title: 'Total Views', value: stats.totalViews, ... },
  { title: 'Activity', value: recentActivity.length, ... },
];
```

Note: PRD mentions "3 Items, 0 Rooms, 2 Tags" but current implementation shows:
- Properties
- Items
- Total Views
- Activity

Need to clarify if we should add Rooms and Tags, or if the PRD refers to a different dashboard version.

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/components/UserDashboard.tsx` | MODIFY | Make stats cards clickable |
| `/src/components/KPIDashboardOverview.tsx` | MODIFY | Make admin dashboard cards clickable if applicable |

### Implementation Tasks

- [ ] **Task 3.1:** Update statsCards structure to include navigation hrefs
  ```typescript
  const statsCards = [
    { title: 'Properties', value: stats.totalProperties, href: '/dashboard/properties', ... },
    { title: 'Items', value: stats.totalItems, href: '/dashboard/items', ... },
    { title: 'Total Views', value: stats.totalViews, href: '/dashboard/analytics', ... },
    { title: 'Activity', value: recentActivity.length, href: null, ... }, // Or activity log page
  ];
  ```

- [ ] **Task 3.2:** Convert stats card rendering from `<div>` to clickable elements
  ```tsx
  {statsCards.map((card, index) => {
    const CardWrapper = card.href ? 'a' : 'div';
    return (
      <CardWrapper
        key={index}
        href={card.href}
        className={cn(
          "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
          card.href && "cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
        )}
      >
        {/* card content */}
      </CardWrapper>
    );
  })}
  ```

- [ ] **Task 3.3:** Add visual feedback for interactive cards
  - Hover state: subtle shadow/border change
  - Focus state: ring indicator for keyboard navigation
  - Cursor: pointer for clickable cards

- [ ] **Task 3.4:** Add accessibility attributes
  - `role="link"` or use actual anchor tags
  - `aria-label` describing the navigation action

- [ ] **Task 3.5:** Consider adding "Rooms" and "Tags" cards if applicable
  - Verify if application tracks rooms and tags separately
  - Add navigation to filtered views if needed

---

## Phase 4: REQ-4 - Update Navigation Menu (MEDIUM)

### Problem Statement

Current menu has 3 items: Home, My Items, My Properties
- "Home" conflicts with property homes
- "My" prefix is unnecessary
- Takes too much space on mobile
- Missing "Instructions" menu item

### Required Changes

New 4-item menu structure:

| Desktop Label | Mobile Label | Icon |
|--------------|--------------|------|
| Dashboard | D/B | Dashboard/grid icon (NOT house) |
| Items | Items | Box/cube icon |
| Instructions (NEW) | Instr. | Document/list icon |
| Properties | Prop. | House/building icon |

### Current Implementation Analysis

From `RoleBasedNavigation.tsx`:

```typescript
// Current navigation items include:
// - Dashboard (LayoutDashboard icon)
// - Items (Package icon)
// - Properties (Home icon)
// - Analytics (admin only, BarChart3 icon)
// - System Admin (admin only, Crown icon)
```

Current uses:
- `LayoutDashboard` for Dashboard ✓ (already correct, not house)
- `Package` for Items ✓ (box/cube icon)
- `Home` for Properties ✓ (house icon for properties)

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/components/RoleBasedNavigation.tsx` | MODIFY | Add Instructions menu item, update labels |
| `/src/app/dashboard/layout.tsx` | MODIFY | Update navigation if using separate nav |
| NEW: `/src/app/dashboard/instructions/page.tsx` | CREATE | Instructions list page |

### Implementation Tasks

- [ ] **Task 4.1:** Add "Instructions" navigation item
  ```typescript
  items.push({
    name: compactMode ? 'Instr.' : 'Instructions',
    href: '/dashboard/instructions',
    icon: <FileText className="h-5 w-5" />,
    description: 'Manage instructions and articles',
    dashboardSection: DashboardSection.instructions, // Need to add this
    requiredPermissions: [PERMISSIONS.MANAGE_ITEMS] // Or new permission
  });
  ```

- [ ] **Task 4.2:** Update mobile labels for compact display
  - Dashboard → "D/B" on mobile
  - Instructions → "Instr." on mobile
  - Properties → "Prop." on mobile

- [ ] **Task 4.3:** Implement responsive label switching
  ```typescript
  // In navigation item rendering
  <span className="hidden sm:inline">{item.name}</span>
  <span className="sm:hidden">{item.mobileLabel || item.name}</span>
  ```

- [ ] **Task 4.4:** Create Instructions page route
  - `/src/app/dashboard/instructions/page.tsx`
  - List all articles/instructions across items

- [ ] **Task 4.5:** Add Instructions to DashboardSection enum
  - Update `/src/types/permissions.ts`
  - Add appropriate permissions

- [ ] **Task 4.6:** Update dashboard layout navigation if it differs from RoleBasedNavigation
  - Check `/src/app/dashboard/layout.tsx` line 93-112

---

## Integration Contract

### No API Changes Required

All changes are frontend UI/UX modifications. The existing API contracts remain unchanged.

### Navigation Pattern

```typescript
// Stats card click handler pattern
const handleCardClick = (href: string | null) => {
  if (href) {
    router.push(href);
  }
};
```

### Post-Workflow Menu Interface

```typescript
interface PostWorkflowMenuProps {
  /** The item that was just saved */
  savedItem: {
    id: string;
    name: string;
    publicId: string;
  };
  /** The article/instructions that were created */
  savedArticle?: {
    id: string;
    purpose: string;
    title: string;
  };
  /** Handler for menu option selection */
  onOptionSelect: (option: PostWorkflowOption) => void;
}

type PostWorkflowOption =
  | 'edit-instructions'
  | 'add-instructions'
  | 'create-item'
  | 'done';
```

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Make cards clickable vs add separate buttons | Clickable cards | Standard UX pattern for dashboards; entire card as click target is more intuitive |
| Post-workflow as modal vs page | Inline menu | Simpler flow; modal would require managing more state |
| Mobile nav abbreviations | Custom short labels | Maintains clarity while saving space |
| Instructions as new route | `/dashboard/instructions` | Follows existing route structure pattern |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Existing tests may break due to label changes | Medium | Low | Update test assertions to match new labels |
| Navigation changes affect existing bookmarks | Low | Low | Use redirects if needed for old routes |
| Post-workflow menu options unclear to users | Low | Medium | Add clear descriptions under each option |
| Mobile label abbreviations confusing | Low | Low | Use tooltips/titles for full labels |

---

## Testing Requirements

### Unit Tests

1. **MetadataStep** - Verify "Item Name" label renders correctly
2. **ReviewStep** - Verify "Item Name" appears in summary
3. **StatsCards** - Verify click handlers navigate correctly
4. **Navigation** - Verify new Instructions item renders and navigates
5. **PostWorkflowMenu** - Verify all 4 options render and trigger correct handlers

### Integration Tests

1. Dashboard → Items navigation flow
2. Dashboard → Properties navigation flow
3. Workflow completion → Post-workflow menu → Each option
4. Navigation on mobile viewport (label abbreviations)

### Manual Testing Checklist

- [ ] Verify "Item Name" label in MetadataStep
- [ ] Verify stats cards are clickable and navigate correctly
- [ ] Verify step counter shows "Step X of 8" (not 10)
- [ ] Verify post-workflow menu has no Cancel or Back buttons
- [ ] Verify post-workflow menu has all 4 options working
- [ ] Verify navigation has Instructions item
- [ ] Verify mobile navigation labels are abbreviated
- [ ] Verify keyboard navigation works for clickable cards

---

## Implementation Approach

### Phase 1: Foundation (REQ-2 + REQ-5)
**Estimated Effort:** 2-3 hours

1. Update MetadataStep label to "Item Name"
2. Update ReviewStep summary label
3. Locate and fix step count display
4. Update total steps from 10 to 8

### Phase 2: Post-Workflow Menu (REQ-3)
**Estimated Effort:** 3-4 hours

1. Redesign NextActionStep as post-workflow menu
2. Remove Cancel and Back buttons
3. Implement 4 new options
4. Remove step indicator from this screen

### Phase 3: Dashboard Interactivity (REQ-1)
**Estimated Effort:** 2-3 hours

1. Add hrefs to stats cards
2. Convert to clickable elements
3. Add hover/focus states
4. Add accessibility attributes

### Phase 4: Navigation Update (REQ-4)
**Estimated Effort:** 3-4 hours

1. Add Instructions navigation item
2. Create Instructions page route
3. Implement mobile label abbreviations
4. Update DashboardSection enum

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| Phase 0: Data Model Labels | 4 tasks | 1-2 hours | High |
| Phase 1: Step Count | 4 tasks | 2-3 hours | Medium |
| Phase 2: Post-Workflow Menu | 5 tasks | 3-4 hours | Medium |
| Phase 3: Dashboard Cards | 5 tasks | 2-3 hours | High |
| Phase 4: Navigation | 6 tasks | 3-4 hours | High |
| Testing & QA | - | 2-3 hours | High |
| **Total** | **24 tasks** | **13-19 hours** | **Medium-High** |

---

## Open Questions

1. **Rooms and Tags on Dashboard:** PRD mentions "3 Items, 0 Rooms, 2 Tags" but current implementation shows Properties, Items, Views, Activity. Should we add Rooms and Tags cards?

2. **Instructions Page Content:** What should the Instructions page display? All articles across all items? Or should it be a filtered view?

3. **Analytics Card Navigation:** For non-admin users who don't have analytics access, should the "Total Views" card navigate somewhere else?

4. **Post-Workflow "Add New Instructions" Flow:** Should this pre-populate the Item selection or show a confirmation step?

---

## References

- PRD Source: `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-225141.md`
- Related Plan: Plan-094 (UI/UX Workflow Improvements)
- Component Locations:
  - `/src/components/ItemCapture/` - Capture wizard
  - `/src/components/UserDashboard.tsx` - User dashboard
  - `/src/components/RoleBasedNavigation.tsx` - Navigation
  - `/src/app/dashboard/layout.tsx` - Dashboard layout
