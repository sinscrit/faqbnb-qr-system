# Implementation Plan: FAQBNB Review 2026-01-11b

**Generated:** 2026-01-12 12:20:00 UTC
**Last Modified:** 2026-01-12 12:20:00 UTC
**Source PRD:** docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-121408.md
**Plan Number:** 107

---

## Overview

This plan implements 5 change requests from the FAQBNB application review session, all targeting the `/dashboard2/` route. The changes span UI/UX improvements, data model corrections, navigation restructuring, and workflow flow fixes. Implementation is organized by dependency order, starting with foundational data model changes (ITEM-02) which affect multiple downstream components, followed by workflow fixes (ITEM-05, ITEM-03), navigation updates (ITEM-04), and finally the dashboard card interactivity (ITEM-01).

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with App Router
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 4.x with custom design tokens (Airbnb DLS colors)
- **State Management:** React hooks (`useState`, `useReducer` patterns), Context API for global state
- **Build Tool:** Next.js with Turbopack (dev)
- **Testing:** Vitest + React Testing Library
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React

### Relevant Existing Patterns

| Pattern | Location | Description |
|---------|----------|-------------|
| Wizard State | `/src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer-based step navigation |
| Progress Indicator | `/src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | Stage-based display, 4 stages |
| Step Constants | `/src/components/ItemCapture/utils/constants.ts` | Step definitions and mappings |
| Dashboard Stats | `/src/components/SimpleDashboard/StatisticsCards.tsx` | KPI cards, currently static |
| Navigation Layout | `/src/app/dashboard2/layout.tsx` | Top nav with `navigationItems` array |
| Types | `/src/types/index.ts` | Item, Article, Property models |
| WhatsNextStep | `/src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Post-save decision screen |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | All requirements achievable with existing dependencies | N/A | N/A |

---

## Architecture

### Data Model Correction (ITEM-02)

The PRD identifies a fundamental data model misunderstanding that needs correction. The current implementation conflates Items and Articles:

**Current (Incorrect) Model:**
```
Item.name = "How to Clean - Cabinets"  // Combines purpose + item
QR Code label = "How to Clean - Cabinets"
```

**Correct Model:**
```
Item.name = "Cabinets"                  // Physical item only
Article.title = "How to Clean"          // Derived from Purpose
Article.purpose = "how-to-clean"        // Selected by user
QR Code label = "Cabinets"              // Item name only
```

**Relationship:**
```
Item (1) ---> (N) Articles
  |              |
  +-- name       +-- purpose (PurposeType)
  +-- qrCode     +-- title (generated from purpose + item name)
                 +-- links[]
```

### Component Structure

```
/dashboard2/
├── page.tsx                           # ITEM-01: Add card click handlers
├── layout.tsx                         # ITEM-04: Update navigation structure
└── create/
    └── page.tsx                       # ItemCapture integration

/components/ItemCapture/
├── ItemCapture.tsx                    # ITEM-03, ITEM-05: Flow changes
├── ItemCapture.types.ts               # Step type updates
├── utils/
│   └── constants.ts                   # ITEM-05: PROGRESS_STAGES update
├── hooks/
│   └── useItemCaptureState.ts         # Step transitions
└── components/
    ├── shared/
    │   └── ProgressIndicator.tsx      # ITEM-05: 8 steps max
    └── steps/
        ├── MetadataStep.tsx           # ITEM-02: Item Name clarity
        ├── ReviewStep.tsx             # ITEM-02: QR label display
        └── WhatsNextStep.tsx          # ITEM-03: Update options

/components/SimpleDashboard/
├── StatisticsCards.tsx                # ITEM-01: Make clickable
└── index.ts                           # Re-export updates
```

### State Management

The WhatsNextStep and workflow changes require:

1. **Remove step counter on WhatsNextStep**: Already implemented (`whats-next` has index `-1` in `STEP_TO_STAGE_INDEX`)
2. **Remove back navigation on WhatsNextStep**: Already handled in `ItemCapture.tsx` (`showWizardNav` excludes `whats-next`)
3. **WhatsNextStep options**: Update button labels and navigation targets

### Data Flow

**Dashboard Card Navigation (ITEM-01):**
```
StatisticsCards (click)
  -> router.push('/dashboard2/items' | '/dashboard2/rooms' | '/dashboard2/tags')
```

**Workflow Completion (ITEM-03, ITEM-05):**
```
ReviewStep (Submit)
  -> handleSubmit()
  -> assembleItemRecord()
  -> onComplete(record)
  -> goToStep('whats-next')
  -> WhatsNextStep (no step counter, no back arrow)
```

---

## Integration Contract

### Dashboard Stats Card Props (Updated)

```typescript
interface StatisticsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  error?: string | null;
  tier?: DashboardTier;
  onCreateItem?: () => void;
  // NEW: Navigation handlers for clickable cards
  onItemsClick?: () => void;
  onRoomsClick?: () => void;
  onTagsClick?: () => void;
  className?: string;
}
```

### Navigation Items Configuration (Updated)

```typescript
// ITEM-04: New navigation structure
const navigationItems = [
  {
    name: 'Dashboard',        // Changed from 'Home'
    mobileLabel: 'D/B',       // Short form for mobile
    href: '/dashboard2',
    icon: LayoutDashboard     // Changed from Home
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package
  },
  {
    name: 'Instructions',     // NEW
    mobileLabel: 'Instr.',
    href: '/dashboard2/instructions',
    icon: FileText
  },
  {
    name: 'Properties',       // Changed from 'My Properties'
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Home                // House icon moved here
  },
];
```

### WhatsNextStep Props (Updated)

```typescript
interface WhatsNextStepProps {
  savedItemId: string;
  savedItemName: string;
  // Updated callbacks for ITEM-03 requirements
  onEditInstructions: () => void;    // "Edit Instructions"
  onAddNewInstructions: () => void;  // "Add New Instructions"
  onCreateNewItem: () => void;       // "Create New Item"
  onDone: () => void;                // "Done" - return to dashboard
  className?: string;
}
```

### Usage Example

```tsx
// Dashboard Page with Clickable Cards
<ProgressiveStatisticsSection
  stats={stats}
  isLoading={isLoading}
  onCreateItem={() => router.push('/dashboard2/create')}
  onItemsClick={() => router.push('/dashboard2/items')}
  onRoomsClick={() => router.push('/dashboard2/rooms')}
  onTagsClick={() => router.push('/dashboard2/tags')}
/>
```

---

## Implementation Approach

### Phase 1: Foundation - Data Model Clarity (ITEM-02)
**Priority: CRITICAL**
**Effort: 1 day**

Update UI labels and help text to clarify the Item vs Article distinction. This does NOT require database schema changes - the schema already supports one-to-many Item:Article relationships via `item_articles` table.

- [ ] **Task 1.1:** Update MetadataStep UI labels
  - Change "Item Name" placeholder to emphasize physical item
  - Update help text: "This is the physical item (e.g., 'Cabinets'). Instructions like 'How to Clean' are captured separately."
  - Verify existing helper text is accurate

- [ ] **Task 1.2:** Update ReviewStep QR Code label preview
  - Ensure QR Code label shows Item Name only (not purpose concatenated)
  - Update preview text: "QR Code Label: [Item Name]"
  - Add tooltip explaining one QR code per item

- [ ] **Task 1.3:** Verify assembleItemRecord output
  - Confirm `ItemRecord.title` contains only item name
  - Verify `ItemRecord.contentPurpose` is passed separately
  - Add integration test for correct data assembly

### Phase 2: Workflow Step Count Fix (ITEM-05)
**Priority: HIGH**
**Effort: 0.5 days**

Fix the progress indicator to show correct step count (8 steps, not 10).

- [ ] **Task 2.1:** Audit current PROGRESS_STAGES
  - Current: 4 stages (Details, Content, Edit, Review)
  - Verify mapping covers all user-visible steps
  - Document actual user journey: Details -> Content Type -> Capture/Upload -> Edit -> Review -> Save

- [ ] **Task 2.2:** Update mobile progress display
  - Change "Step X of 10" to "Step X of 8" or match actual stages
  - If using 4-stage model, keep "Step X of 4"
  - Clarify save step is final (step 4 = Review + Save)

- [ ] **Task 2.3:** Update submit button label
  - Change from "Submit" to "Save Item" for clarity
  - Update button text in ReviewStep.tsx

- [ ] **Task 2.4:** Update post-save confirmation
  - "Continue" button leads to WhatsNextStep (post-workflow, unnumbered)
  - Consider renaming to "What's Next?" or "Done"

### Phase 3: WhatsNextStep Options Fix (ITEM-03)
**Priority: HIGH**
**Effort: 0.5 days**

Update the post-save decision screen to remove invalid options and provide clear actions.

- [ ] **Task 3.1:** Update WhatsNextStep button options
  - REMOVE: "Cancel" button (nothing to discard after save)
  - KEEP: "Edit Instructions" - navigate to edit article
  - KEEP: "Add New Instructions" - start new article for same item
  - KEEP: "Create New Item" - full wizard reset
  - KEEP: "Done" - return to dashboard

- [ ] **Task 3.2:** Verify navigation controls are hidden
  - Confirm back arrow is NOT shown (already handled by `showWizardNav`)
  - Confirm step counter is NOT shown (index -1 in mapping)
  - Add test case to verify

- [ ] **Task 3.3:** Update button descriptions
  - "Edit Instructions" -> "Review and modify the instructions you just created"
  - "Add New Instructions" -> "Create different instructions for [Item Name]"
  - "Create New Item" -> "Start fresh with a different item"
  - "Done" -> "Return to Dashboard"

### Phase 4: Navigation Menu Update (ITEM-04)
**Priority: MEDIUM**
**Effort: 1 day**

Restructure the navigation menu with new labels and icons.

- [ ] **Task 4.1:** Update navigationItems array in layout.tsx
  - Change "Home" -> "Dashboard"
  - Remove "My" prefix from labels
  - Add "Instructions" menu item (NEW)
  - Update icon assignments

- [ ] **Task 4.2:** Implement mobile label support
  - Add `mobileLabel` property to navigation items
  - Show short labels on mobile (e.g., "D/B", "Instr.", "Prop.")
  - Maintain full labels on desktop

- [ ] **Task 4.3:** Update icon assignments
  - Dashboard: `LayoutDashboard` icon (grid/dashboard icon)
  - Items: `Package` icon (keep current)
  - Instructions: `FileText` icon (document/list)
  - Properties: `Home` icon (house moved here)

- [ ] **Task 4.4:** Create Instructions placeholder page
  - Create `/dashboard2/instructions/page.tsx`
  - Show "Coming Soon" or list of articles grouped by item
  - Connect to article API when ready

### Phase 5: Dashboard Cards Clickable (ITEM-01)
**Priority: HIGH**
**Effort: 0.5 days**

Make the dashboard statistics cards interactive with navigation.

- [ ] **Task 5.1:** Add click handlers to StatisticsCards
  - Add `onClick` prop to individual cards
  - Implement navigation: Items -> `/dashboard2/items`
  - Implement navigation: Rooms -> `/dashboard2/rooms` (or items filtered by room)
  - Implement navigation: Tags -> `/dashboard2/tags` (or items filtered by tag)

- [ ] **Task 5.2:** Add visual affordance for interactivity
  - Add hover state (scale, shadow, border highlight)
  - Add cursor pointer
  - Add subtle arrow icon or indicator
  - Add focus ring for keyboard navigation

- [ ] **Task 5.3:** Update StatCard component
  - Change from `<div>` to `<button>` or `<Link>`
  - Add appropriate ARIA attributes
  - Ensure keyboard accessibility

- [ ] **Task 5.4:** Create rooms/tags list pages (if not exists)
  - `/dashboard2/rooms/page.tsx` - List rooms with item counts
  - `/dashboard2/tags/page.tsx` - List tags with item counts
  - Or redirect to Items page with filter pre-applied

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data Model | UI-only changes | Schema already supports Item:Article 1:N relationship via `item_articles` table |
| Step Count | Keep 4-stage model | Maps multiple wizard steps to logical stages, reduces visual complexity |
| Navigation Icons | Lucide React | Already in use, consistent with existing codebase |
| Mobile Labels | Inline config | Simple, no external state, follows existing pattern |
| Card Navigation | Button with router.push | Maintains accessibility, works with existing routing |
| Instructions Page | Placeholder first | Full implementation requires article list API |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing step navigation | Low | High | Comprehensive test coverage, phased rollout |
| User confusion during transition | Medium | Medium | Clear UI labels, help text updates |
| Instructions page API not ready | Medium | Low | Create placeholder page, link when ready |
| Rooms/Tags pages need new routes | Medium | Medium | Start with filtered Items view, add dedicated pages later |
| Mobile layout issues with new nav | Low | Medium | Test on multiple viewport sizes, use responsive design |

---

## Recommended Spike Work

**Not required** - All changes use established patterns and existing infrastructure.

However, if the Instructions page needs full functionality:

**Spike Goal:** Verify article listing API exists and returns expected data shape
**Timebox:** 2 hours
**Success Criteria:**
- API endpoint `/api/items/[id]/articles` returns articles for an item
- Articles can be listed across all items for a user

---

## Effort Estimate

| Phase | Estimate | Confidence |
|-------|----------|------------|
| Phase 1: Data Model Clarity | 1 day | High |
| Phase 2: Step Count Fix | 0.5 day | High |
| Phase 3: WhatsNextStep Options | 0.5 day | High |
| Phase 4: Navigation Update | 1 day | Medium |
| Phase 5: Dashboard Cards | 0.5 day | High |
| **Total** | **3.5 days** | Medium-High |

---

## Open Questions

1. **Rooms Page Destination:** Should clicking "Rooms" card go to a dedicated rooms list page, or to Items filtered by room? The PRD says "Navigate to Rooms list screen" but no such route currently exists.

2. **Tags Page Destination:** Same question for Tags - dedicated page or filtered Items view?

3. **Instructions Route:** The new "Instructions" nav item needs a destination. Should this show all articles across all items, or grouped by item?

4. **Mobile Navigation Width:** With 4 nav items, will horizontal space be sufficient on small screens? May need to consider bottom navigation or hamburger menu.

---

## References

- [PRD Source](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-121408.md)
- [ItemCapture Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/ItemCapture.tsx)
- [Dashboard2 Layout](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/dashboard2/layout.tsx)
- [StatisticsCards](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/SimpleDashboard/StatisticsCards.tsx)
- [WhatsNextStep](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/WhatsNextStep.tsx)
- [ProgressIndicator](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/shared/ProgressIndicator.tsx)
- [Types Index](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/types/index.ts)

---

## Implementation Order Summary

```
ITEM-02 (CRITICAL) -> ITEM-05 (HIGH) -> ITEM-03 (HIGH) -> ITEM-04 (MEDIUM) -> ITEM-01 (HIGH)
    |                     |                |                   |                  |
    v                     v                v                   v                  v
 Data Model          Step Count      WhatsNext           Navigation          Cards
 Clarity              8 of 8         Options             Structure          Clickable
```

This order ensures:
1. Foundation (data model) is correct before UI changes
2. Workflow flow is fixed before post-workflow screen
3. Navigation structure updated before adding clickable destinations
4. Dashboard cards link to finalized routes

---

## Files to Modify

| File | Changes |
|------|---------|
| `/src/components/ItemCapture/components/steps/MetadataStep.tsx` | ITEM-02: Update labels, help text |
| `/src/components/ItemCapture/components/steps/ReviewStep.tsx` | ITEM-02: QR label preview, ITEM-05: Button label |
| `/src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | ITEM-05: Verify stage mapping |
| `/src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | ITEM-03: Update options, descriptions |
| `/src/app/dashboard2/layout.tsx` | ITEM-04: Navigation restructure |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | ITEM-01: Clickable cards |
| `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx` | ITEM-01: Pass click handlers |
| `/src/app/dashboard2/page.tsx` | ITEM-01: Add navigation handlers |

## Files to Create

| File | Purpose |
|------|---------|
| `/src/app/dashboard2/instructions/page.tsx` | ITEM-04: Instructions listing (placeholder) |
| `/src/app/dashboard2/rooms/page.tsx` | ITEM-01: Rooms listing (optional) |
| `/src/app/dashboard2/tags/page.tsx` | ITEM-01: Tags listing (optional) |
