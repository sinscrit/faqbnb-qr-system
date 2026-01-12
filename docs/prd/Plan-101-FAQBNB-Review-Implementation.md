# Implementation Plan: FAQBNB Review Changes (CPL-FAQBNB-Review-2026-01-11)

**Generated:** 2026-01-11 21:45:00
**Last Modified:** 2026-01-11 21:45:00
**Source PRD:** docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-214039.md

---

## Overview

This implementation plan addresses five change requests identified during the FAQBNB application review session. The requests span UI/UX improvements, data model clarification, and workflow refinements. Changes are prioritized based on impact and interdependencies, with the CRITICAL data model fix (REQ-2) implemented first to establish correct terminology before UI changes.

**Priority Summary:**
- **CRITICAL (1):** REQ-2 - Fix Data Model Terminology
- **HIGH (3):** REQ-1, REQ-3, REQ-5 - Dashboard Cards, What's Next Screen, Workflow Step Count
- **MEDIUM (1):** REQ-4 - Navigation Menu Structure

---

## Technical Context

### Existing Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 15.5.9 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Radix UI, Lucide React | Latest |
| State Management | React Context, Local State | N/A |
| Build Tool | Next.js (Turbopack) | Integrated |
| Database | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth + Custom Session | SSR |

### Relevant Existing Patterns

1. **Dashboard Components:**
   - `/src/components/UserDashboard.tsx` - Stats cards display (lines 152-181)
   - `/src/components/KPIDashboardOverview.tsx` - KPI cards for admins
   - Both use static stat cards without click handlers

2. **Navigation:**
   - `/src/app/admin/layout.tsx` (lines 92-113) - Navigation items array with icons
   - `/src/components/RoleBasedNavigation.tsx` - Permission-based navigation
   - `/src/components/DashboardLayout.tsx` - Unified dashboard navigation

3. **Item Creation Workflow:**
   - `/src/components/ItemCreationWorkflow/` - Complete workflow module
   - `ItemCreationWorkflow.types.ts` - Type definitions including `WorkflowStep`
   - `utils/constants.ts` - Step configuration, progress weights
   - `components/steps/NextActionStep.tsx` - Current "What's Next" implementation

4. **Data Model:**
   - `/database/schema.sql` - Items, Articles, Links tables
   - `/src/types/index.ts` - TypeScript types for Item, ItemArticle, ItemLink
   - Existing Article concept with `purpose` field (REQ-151)

### New Dependencies Required
| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | All requirements achievable with existing stack | N/A | N/A |

---

## Architecture

### Component Structure

```
src/
├── components/
│   ├── UserDashboard.tsx               # MODIFY - Add clickable stats cards
│   ├── KPIDashboardOverview.tsx        # MODIFY - Add clickable KPI cards
│   ├── DashboardLayout.tsx             # MODIFY - Update navigation structure
│   ├── RoleBasedNavigation.tsx         # MODIFY - Update menu items & labels
│   └── ItemCreationWorkflow/
│       ├── ItemCreationWorkflow.tsx    # MODIFY - Update step flow
│       ├── ItemCreationWorkflow.types.ts # MODIFY - Update step types
│       ├── utils/
│       │   └── constants.ts            # MODIFY - Step count & weights
│       └── components/
│           ├── shared/
│           │   └── ProgressIndicator.tsx # MODIFY - Step count display
│           └── steps/
│               ├── NextActionStep.tsx    # MAJOR REFACTOR - New options
│               ├── PreviewSaveStep.tsx   # MODIFY - Terminology
│               └── SpecificItemStep.tsx  # MODIFY - Item naming clarity
├── app/
│   └── dashboard/
│       ├── layout.tsx                   # MODIFY - Navigation structure
│       └── instructions/                # NEW - Instructions list page
│           └── page.tsx
└── types/
    └── index.ts                         # MODIFY - Clarify Item vs Article
```

### Data Model Clarification (REQ-2)

**Correct Conceptual Model:**
```
Item (Physical Thing)     →  ONE QR Code
├── Article 1 (Purpose)   →  "How to Use"
│   ├── Link/Content 1
│   └── Link/Content 2
├── Article 2 (Purpose)   →  "How to Clean"
│   └── Link/Content 1
└── Article 3 (Purpose)   →  "Troubleshooting"
    └── Link/Content 1
```

**Example:**
- **Item:** "Steamer" (gets one QR code with label "Steamer")
- **Article 1:** "How to Use" (instructions for operating)
- **Article 2:** "How to Clean" (cleaning instructions)
- **When scanned:** User sees list of all articles for the Steamer

**Current Confusion (from PRD):**
- UI shows "Article Title: How to Clean - Steamer" on QR label
- Should show "Item Name: Steamer" on QR label
- "How to Clean" is the article/purpose, not part of item name

---

## Integration Contract

### REQ-1: Clickable Dashboard Stats

```typescript
// New ClickableStatCard component props
interface ClickableStatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  href: string;  // Navigation destination
  onClick?: () => void;  // Optional custom handler
}

// Usage in UserDashboard
<ClickableStatCard
  title="Items"
  value={stats.totalItems}
  subtitle={`${stats.recentItems} created recently`}
  icon={<BarChart3 />}
  color="bg-blue-100 text-blue-600"
  href="/dashboard/items"
/>
```

### REQ-3: NextActionStep Refactor

```typescript
// Updated NextActionStepProps
interface NextActionStepProps {
  /** QR code URL for the just-saved item */
  savedItemQrUrl?: string;
  /** Name of the just-saved item */
  savedItemName?: string;
  /** Callback handlers for new options */
  onEditInstructions: () => void;
  onAddNewInstructions: () => void;
  onCreateNewItem: () => void;
  onDone: () => void;
}

// Four action options (no cancel, no back)
const actionOptions = [
  { key: 'edit', label: 'Edit Instructions', description: 'Edit the instructions/article just created' },
  { key: 'add', label: 'Add New Instructions', description: 'Create different instructions for same item' },
  { key: 'new', label: 'Create New Item', description: 'Start fresh with a different item' },
  { key: 'done', label: 'Done', description: 'Exit the workflow completely' },
];
```

### REQ-4: Navigation Menu Structure

```typescript
// Updated navigation items for RoleBasedNavigation
const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard',
    icon: 'LayoutDashboard',  // NOT house icon
    dashboardSection: DashboardSection.dashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard/items',
    icon: 'Package',  // Box/cube icon
    dashboardSection: DashboardSection.items,
  },
  {
    name: 'Instructions',
    mobileLabel: 'Instr.',
    href: '/dashboard/instructions',
    icon: 'FileText',  // Document/list icon
    dashboardSection: DashboardSection.instructions,  // NEW
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard/properties',
    icon: 'Home',  // House/building icon
    dashboardSection: DashboardSection.properties,
  },
];
```

---

## Implementation Approach

### Phase 1: Data Model Terminology Fix (REQ-2) - CRITICAL
**Priority:** CRITICAL | **Estimated Effort:** 1 day

This must be done first as it establishes correct terminology for all subsequent changes.

- [ ] **Task 1.1:** Audit all UI components for Item/Article terminology confusion
  - Files: ItemForm, PreviewSaveStep, SpecificItemStep, ItemDisplay
  - Document all instances where "Article Title" appears on Item context

- [ ] **Task 1.2:** Update SpecificItemStep component
  - Change label from "Article Title" to "Item Name"
  - Ensure item name is just the item (e.g., "Steamer")
  - Path: `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`

- [ ] **Task 1.3:** Update PreviewSaveStep component
  - Separate "Item Name" (for QR label) from "Article Title" (purpose/instructions)
  - Display format: "Item: Steamer" and "Purpose: How to Clean"
  - Path: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

- [ ] **Task 1.4:** Update QR code generation/display
  - QR code label shows Item Name only (e.g., "Steamer")
  - When scanned, show list of all articles for that item
  - Paths:
    - `/src/components/QRCodePrintPreview.tsx`
    - `/src/lib/qrcode-utils.ts`
    - `/src/app/item/[publicId]/page.tsx`

- [ ] **Task 1.5:** Add type clarity to documentation
  - Update JSDoc comments in `/src/types/index.ts`
  - Clarify Item = physical thing, Article = purpose/instructions

### Phase 2: Workflow Step Count Fix (REQ-5) - HIGH
**Priority:** HIGH | **Estimated Effort:** 0.5 days

Must be done before REQ-3 as it affects the step structure.

- [ ] **Task 2.1:** Update WORKFLOW_STEPS constant
  - Remove steps 9 and 10 from workflow step count display
  - Path: `/src/components/ItemCreationWorkflow/utils/constants.ts`

- [ ] **Task 2.2:** Update PROGRESS_WEIGHTS
  - Recalculate weights for 8-step workflow
  - preview-save should be at 100% (final step)
  - Path: `/src/components/ItemCreationWorkflow/utils/constants.ts`

- [ ] **Task 2.3:** Update ProgressIndicator display
  - Change to "Step X of 8" format
  - Save Item is the FINAL workflow step
  - Path: `/src/components/ItemCreationWorkflow/components/shared/ProgressIndicator.tsx`

- [ ] **Task 2.4:** Reclassify next-action and session-summary
  - These are NOT workflow steps (no step numbers)
  - They are post-workflow menu screens
  - Update component documentation

### Phase 3: What's Next Screen Refactor (REQ-3) - HIGH
**Priority:** HIGH | **Estimated Effort:** 1.5 days

- [ ] **Task 3.1:** Redesign NextActionStep component
  - Remove Cancel button completely
  - Remove back arrow/navigation
  - This is a post-workflow menu, not a numbered step
  - Path: `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

- [ ] **Task 3.2:** Implement new action options
  ```
  Option 1: Edit Instructions    - Edit the instructions/article just created
  Option 2: Add New Instructions - Create different instructions for same item
  Option 3: Create New Item      - Start fresh with a different item
  Option 4: Done                 - Exit the workflow completely
  ```

- [ ] **Task 3.3:** Update ItemCreationWorkflow orchestration
  - Handle new callback patterns
  - Route "Edit Instructions" to PreviewSaveStep with edit mode
  - Route "Add New Instructions" to purpose-selection (same item context)
  - Route "Create New Item" to room-selection (new item)
  - Route "Done" to session complete/exit
  - Path: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

- [ ] **Task 3.4:** Display saved item confirmation
  - Show QR code preview of saved item
  - Display success message with item name
  - This confirms the workflow is complete

- [ ] **Task 3.5:** Update navigation state management
  - Prevent back navigation after save
  - Clear saved state appropriately
  - Path: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

### Phase 4: Dashboard Cards Clickable (REQ-1) - HIGH
**Priority:** HIGH | **Estimated Effort:** 1 day

- [ ] **Task 4.1:** Create ClickableStatCard component
  - Extract current stat card styling
  - Add click handler and href support
  - Add hover/focus states for interaction feedback
  - Path: `/src/components/ui/ClickableStatCard.tsx` (new)

- [ ] **Task 4.2:** Update UserDashboard
  - Replace static cards with ClickableStatCard
  - Configure navigation targets:
    - "Items" → /dashboard/items
    - "Properties" → /dashboard/properties
    - "Total Views" → /dashboard/analytics (admin only)
    - "Activity" → Keep as non-clickable (no destination)
  - Path: `/src/components/UserDashboard.tsx`

- [ ] **Task 4.3:** Update KPIDashboardOverview
  - Replace static KPI cards with clickable versions
  - Configure navigation targets:
    - "Total Properties" → /dashboard/properties
    - "Total Items" → /dashboard/items
    - "Total Views" → /dashboard/analytics
    - "Active Items" → /dashboard/items?filter=active
  - Path: `/src/components/KPIDashboardOverview.tsx`

- [ ] **Task 4.4:** Add keyboard accessibility
  - Cards should be focusable (tabIndex)
  - Enter/Space to activate
  - Proper ARIA labels

### Phase 5: Navigation Menu Update (REQ-4) - MEDIUM
**Priority:** MEDIUM | **Estimated Effort:** 1.5 days

- [ ] **Task 5.1:** Update navigation item definitions
  - Change "Home" to "Dashboard" with grid icon (NOT house)
  - Add "Instructions" menu item with document icon
  - Update mobile labels for space efficiency
  - Path: `/src/components/RoleBasedNavigation.tsx`

- [ ] **Task 5.2:** Create Instructions page
  - New route: /dashboard/instructions
  - List all articles/instructions grouped by item
  - Path: `/src/app/dashboard/instructions/page.tsx` (new)

- [ ] **Task 5.3:** Update DashboardSection enum
  - Add `instructions` section
  - Update permission checks
  - Path: `/src/types/permissions.ts`

- [ ] **Task 5.4:** Update admin layout navigation
  - Mirror new structure in admin layout
  - Ensure consistent labels across user/admin views
  - Paths:
    - `/src/app/admin/layout.tsx`
    - `/src/app/dashboard/layout.tsx`

- [ ] **Task 5.5:** Implement responsive mobile labels
  - Desktop: Full labels (Dashboard, Items, Instructions, Properties)
  - Mobile: Abbreviated labels (D/B, Items, Instr., Prop.)
  - Use CSS/Tailwind breakpoints

- [ ] **Task 5.6:** Update icon usage
  - Dashboard: `LayoutDashboard` icon (was `Home`)
  - Items: `Package` icon (box/cube)
  - Instructions: `FileText` icon (document/list)
  - Properties: `Home` icon (house/building)
  - Path: All navigation components

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No Cancel on post-workflow screen | Remove completely | Item is already saved, nothing to cancel |
| No back arrow on post-workflow | Remove completely | Cannot undo a database save |
| "Done" instead of explicit exit | New option | Clear UX for completing the workflow |
| Separate Item Name from Article Title | Distinct fields | Prevents confusion in QR labeling |
| 8-step workflow | Recounted | Save is the logical endpoint |
| Instructions as new menu item | Added | Articles need their own management view |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing saved items | Low | High | Read-only migration, no data changes |
| Navigation confusion during transition | Medium | Medium | Clear labeling, tooltips on icons |
| Workflow state corruption on step removal | Medium | High | Reset state when entering post-workflow |
| Mobile layout issues with new menu | Medium | Low | Responsive testing, abbreviation fallback |
| Article/Item confusion in existing code | High | Medium | Code review, terminology audit |

---

## Dependency Analysis

```
REQ-2 (Data Model)
├── REQ-5 (Step Count) - terminology affects step labels
│   └── REQ-3 (What's Next) - depends on correct step count
├── REQ-4 (Navigation) - needs Instructions concept defined
└── REQ-1 (Dashboard Cards) - independent, can run parallel

Recommended Order:
1. REQ-2 (CRITICAL) - Establishes correct terminology
2. REQ-5 (HIGH) - Fixes step structure
3. REQ-3 (HIGH) - Uses correct step structure
4. REQ-1 (HIGH) - Independent, can parallelize with 3
5. REQ-4 (MEDIUM) - Depends on Instructions concept from REQ-2
```

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| Phase 1: Data Model Terminology | 5 tasks | 1 day | High |
| Phase 2: Workflow Step Count | 4 tasks | 0.5 days | High |
| Phase 3: What's Next Refactor | 5 tasks | 1.5 days | Medium |
| Phase 4: Dashboard Cards | 4 tasks | 1 day | High |
| Phase 5: Navigation Menu | 6 tasks | 1.5 days | Medium |
| **Total** | **24 tasks** | **5.5 days** | Medium-High |

*Note: Some tasks can be parallelized. Phase 4 can run concurrently with Phase 3.*

---

## Testing Requirements

### Unit Tests
- [ ] ClickableStatCard component - click handlers, keyboard navigation
- [ ] NextActionStep - new option callbacks, no back/cancel buttons
- [ ] ProgressIndicator - "Step X of 8" display
- [ ] Navigation items - correct labels, icons, mobile abbreviations

### Integration Tests
- [ ] Dashboard card click → correct page navigation
- [ ] Workflow completion → post-workflow menu display
- [ ] Navigation menu → all routes accessible
- [ ] QR code label → shows Item Name only

### E2E Tests
- [ ] Complete workflow ending at step 8
- [ ] Post-workflow actions (all 4 options)
- [ ] Mobile navigation responsiveness
- [ ] Item vs Article terminology throughout UI

---

## Open Questions

1. **Instructions Page Design:** Should the Instructions page show a flat list of all articles, or group them by Item? (Recommendation: Group by Item for clarity)

2. **Edit Instructions Flow:** When user selects "Edit Instructions", should it edit the article metadata or the content links? (Recommendation: Edit the article content/links)

3. **Analytics Link:** Should "Total Views" on dashboard link to analytics page even for non-admin users? (Recommendation: Only show for admins, hide card for regular users or make non-clickable)

---

## References

- [PRD Source Document](/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-214039.md)
- [Plan-093 Item Creation Workflow](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Plan-094 UI/UX Workflow Improvements](/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md)
- [Database Schema](/database/schema.sql) - Items, Articles, Links structure
- [Item Types](/src/types/index.ts) - TypeScript interfaces

---

## File Change Summary

### Modified Files (15)
| File | Change Type | Description |
|------|-------------|-------------|
| `/src/components/UserDashboard.tsx` | Modify | Add clickable stat cards |
| `/src/components/KPIDashboardOverview.tsx` | Modify | Add clickable KPI cards |
| `/src/components/RoleBasedNavigation.tsx` | Modify | Update menu structure, icons, labels |
| `/src/components/DashboardLayout.tsx` | Modify | Update navigation items |
| `/src/app/admin/layout.tsx` | Modify | Update admin navigation |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Modify | Update step flow, callbacks |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Modify | Update step types |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Modify | Step count, weights |
| `/src/components/ItemCreationWorkflow/components/shared/ProgressIndicator.tsx` | Modify | Step X of 8 |
| `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Major Refactor | New 4 options |
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Modify | Terminology |
| `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Modify | Item naming |
| `/src/types/index.ts` | Modify | JSDoc clarity |
| `/src/types/permissions.ts` | Modify | Add instructions section |
| `/src/lib/qrcode-utils.ts` | Modify | QR label uses Item Name |

### New Files (2)
| File | Description |
|------|-------------|
| `/src/components/ui/ClickableStatCard.tsx` | Reusable clickable stat card component |
| `/src/app/dashboard/instructions/page.tsx` | Instructions list page |

---

## Acceptance Criteria

### REQ-1: Dashboard Cards Clickable
- [ ] Clicking "Items" card navigates to /dashboard/items
- [ ] Clicking "Properties" card navigates to /dashboard/properties
- [ ] Cards have visible hover/focus states
- [ ] Keyboard navigation works (Tab, Enter)

### REQ-2: Data Model Clarity
- [ ] Item Name shows just the item (e.g., "Steamer")
- [ ] Article Title shows purpose (e.g., "How to Clean")
- [ ] QR code label shows Item Name only
- [ ] Scanning QR shows all articles for that item

### REQ-3: What's Next Screen
- [ ] No Cancel button present
- [ ] No back arrow present
- [ ] 4 action options displayed as cards
- [ ] "Done" exits workflow completely

### REQ-4: Navigation Menu
- [ ] Dashboard uses grid icon (not house)
- [ ] Instructions menu item present
- [ ] Mobile labels abbreviated correctly
- [ ] All routes functional

### REQ-5: Workflow Step Count
- [ ] Displays "Step X of 8"
- [ ] Save Item is final step (8 of 8)
- [ ] Post-workflow screen has no step number
