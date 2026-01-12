# Implementation Plan: FAQBNB Review 2026-01-11b - Comprehensive Implementation

**Generated:** 2026-01-12 13:30:00 UTC
**Last Modified:** 2026-01-12 13:30:00 UTC
**Source PRD:** docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-131111.md
**Plan Number:** 108

---

## Route-to-Component Verification

### Route Trace Results

| Route | Page File | Component | Status |
|-------|-----------|-----------|--------|
| /dashboard2/ | `src/app/dashboard2/page.tsx` | SimpleDashboard (via ProgressiveStatisticsSection) | VERIFIED |
| /dashboard2/create | `src/app/dashboard2/create/page.tsx` | ItemCreationWorkflow -> ItemCapture | VERIFIED |
| /dashboard2/items | `src/app/dashboard2/items/page.tsx` | ItemManager | VERIFIED |

### Semantic Verification Findings

**PRD Reference:** "Step 9 of 10" in What's Next screen

**Codebase Finding:**
- `ProgressIndicator.tsx` (line 54-59): Uses 4-stage model: Details, Content, Edit, Review
- `STEP_TO_STAGE_INDEX` maps `whats-next` to index `-1` (hidden from progress)
- Mobile view shows "Step X of 4" (not 10)
- The PRD screenshot showing "Step 9 of 10" is from an older version

**Confirmation:** The component structure matches PRD intent. The `ItemCapture` component manages the workflow through:
- `ItemCapture.tsx` - Main orchestrator
- `useItemCaptureState.ts` - State management hook
- `ProgressIndicator.tsx` - Step display (4 stages, not 10)
- `WhatsNextStep.tsx` - Post-save decision screen (no step counter)

**Target Components Confirmed:**
- **ITEM-01 (Dashboard Cards):** `StatisticsCards.tsx` in `/src/components/SimpleDashboard/`
- **ITEM-02 (Data Model):** `MetadataStep.tsx`, `ReviewStep.tsx`, `assembleItemRecord.ts` in `/src/components/ItemCapture/`
- **ITEM-03 (What's Next):** `WhatsNextStep.tsx` in `/src/components/ItemCapture/components/steps/`
- **ITEM-04 (Navigation):** `layout.tsx` in `/src/app/dashboard2/`
- **ITEM-05 (Step Count):** `ProgressIndicator.tsx`, `constants.ts` in `/src/components/ItemCapture/`

---

## Overview

This plan implements 5 change requests from the FAQBNB application review session (CPL-FAQBNB-Review-2026-01-11b), all targeting the `/dashboard2/` route. Analysis reveals that **significant implementation has already been completed** (REQ-187 through REQ-195). This plan documents the current state, identifies remaining work, and provides implementation details for any gaps.

**Priority Breakdown:**
- CRITICAL: 1 (ITEM-02: Data Model)
- HIGH: 3 (ITEM-01, ITEM-03, ITEM-05)
- MEDIUM: 1 (ITEM-04: Navigation)

---

## Technical Context

### Existing Stack

| Technology | Version | Notes |
|------------|---------|-------|
| Framework | Next.js 15.5.9 | App Router with Turbopack |
| Language | TypeScript 5.x | Strict mode enabled |
| Styling | Tailwind CSS 4.x | Custom Airbnb DLS tokens |
| State Management | React Hooks | useReducer patterns, Context API |
| Icons | Lucide React 0.525.0 | `@heroicons/react` also available |
| Backend | Supabase | PostgreSQL, Auth, Storage |
| Testing | Vitest + RTL | 90%+ coverage target |

### Relevant Existing Patterns

| Pattern | Location | Description |
|---------|----------|-------------|
| Wizard State | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Reducer-based step navigation with `WizardStep` type |
| Progress Display | `src/components/ItemCapture/components/shared/ProgressIndicator.tsx` | 4-stage model with `STEP_TO_STAGE_INDEX` mapping |
| Dashboard Stats | `src/components/SimpleDashboard/StatisticsCards.tsx` | KPI cards with `StatCard` sub-component |
| Post-Save Flow | `src/components/ItemCapture/components/steps/WhatsNextStep.tsx` | Decision menu after item save |
| Navigation | `src/app/dashboard2/layout.tsx` | `navigationItems` array with icon assignments |
| Types | `src/types/index.ts` | Item, ItemArticle, Property, PurposeType definitions |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | All requirements achievable with existing dependencies | N/A | N/A |

---

## Architecture

### Data Model Relationship (ITEM-02)

The PRD identifies a conceptual distinction between Items and Articles that needs UI clarity:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CORRECT MODEL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Item (Physical Thing)              Article (Instructions)      │
│   ─────────────────────              ─────────────────────      │
│   • name: "Cabinets"         ───>    • purpose: "how-to-clean"  │
│   • qrCodeUrl: "..."          1:N    • title: "How to Clean"    │
│   • propertyId: "..."                • links: [...]             │
│                                                                  │
│   QR Code Label = Item.name only ("Cabinets")                   │
│   When scanned: Show all articles for that item                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Existing Schema Support:**
- `items` table: `id`, `public_id`, `name`, `property_id`
- `item_articles` table: `id`, `item_id`, `purpose`, `title`, `display_order`
- `item_links` table: `id`, `item_id`, `article_id` (nullable FK)

The database already supports the one-to-many Item:Article relationship. Changes are UI/UX only.

### Component Structure

```
src/
├── app/dashboard2/
│   ├── page.tsx                           # ITEM-01: Dashboard with clickable cards
│   ├── layout.tsx                         # ITEM-04: Navigation structure
│   ├── create/page.tsx                    # ItemCreationWorkflow integration
│   ├── items/page.tsx                     # Items list (navigation target)
│   ├── instructions/page.tsx              # ITEM-04: NEW - Instructions list
│   ├── rooms/page.tsx                     # ITEM-01: Optional rooms list
│   └── tags/page.tsx                      # ITEM-01: Optional tags list
│
├── components/ItemCapture/
│   ├── ItemCapture.tsx                    # Main orchestrator
│   ├── ItemCapture.types.ts               # WizardStep includes 'whats-next'
│   ├── utils/
│   │   └── constants.ts                   # PROGRESS_STAGES (4 stages)
│   ├── hooks/
│   │   └── useItemCaptureState.ts         # State machine
│   └── components/
│       ├── shared/
│       │   └── ProgressIndicator.tsx      # ITEM-05: Stage display
│       └── steps/
│           ├── MetadataStep.tsx           # ITEM-02: Item Name field
│           ├── ReviewStep.tsx             # ITEM-02: QR label, ITEM-05: Submit button
│           └── WhatsNextStep.tsx          # ITEM-03: Post-save options
│
└── components/SimpleDashboard/
    ├── StatisticsCards.tsx                # ITEM-01: Clickable cards
    ├── ProgressiveStatisticsSection.tsx   # Wrapper with tier logic
    └── index.ts                           # Exports
```

### State Flow

**Dashboard Card Navigation (ITEM-01):**
```
User clicks "Items" card
  → StatisticsCards onClick handler
  → router.push('/dashboard2/items')
  → Items page renders
```

**Workflow Completion (ITEM-03, ITEM-05):**
```
ReviewStep: User clicks "Save Item"
  → handleSubmit() in ItemCapture.tsx
  → validateItemCapture()
  → assembleItemRecord()
  → onComplete(record) callback
  → goToStep('whats-next')
  → WhatsNextStep renders (no step counter, no back arrow)
```

---

## Implementation Status Assessment

### Already Implemented

| Item | Status | Evidence |
|------|--------|----------|
| ITEM-03: WhatsNextStep component | COMPLETE | `WhatsNextStep.tsx` exists with 4 action buttons |
| ITEM-03: No Cancel button | COMPLETE | WhatsNextStep has Edit/Add/Create/Done, no Cancel |
| ITEM-03: No back arrow | COMPLETE | `showWizardNav` excludes 'whats-next' step |
| ITEM-03: No step counter | COMPLETE | `STEP_TO_STAGE_INDEX['whats-next'] = -1` |
| ITEM-05: Step count fixed | COMPLETE | 4-stage model in ProgressIndicator.tsx |
| ITEM-04: Navigation updated | COMPLETE | REQ-193, REQ-194, REQ-195 implemented |
| ITEM-04: Instructions page | COMPLETE | `/dashboard2/instructions/page.tsx` exists |
| ITEM-04: Mobile labels | COMPLETE | REQ-194 implementation |
| ITEM-01: KPI cards clickable | PARTIAL | REQ-190/191/192/193 show dashboard work done |

### Requires Verification/Completion

| Item | Status | Action Required |
|------|--------|-----------------|
| ITEM-02: Data Model UI | NEEDS REVIEW | Verify MetadataStep labels clarify Item vs Article |
| ITEM-02: QR Label display | NEEDS REVIEW | Verify ReviewStep shows Item Name only |
| ITEM-01: SimpleDashboard cards | NEEDS VERIFICATION | Confirm StatisticsCards have click handlers |
| ITEM-01: Rooms/Tags navigation | UNCLEAR | Routes may not exist |
| ITEM-05: Submit button label | NEEDS REVIEW | Should say "Save Item" not "Submit" |

---

## Integration Contract

### StatisticsCards Props (Current)

```typescript
// File: src/components/SimpleDashboard/StatisticsCards.tsx
interface StatisticsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  error?: string | null;
  tier?: DashboardTier;
  showComparisonView?: boolean;
  showTrendIndicators?: boolean;
  onCreateItem?: () => void;
  className?: string;
}
```

### Required Enhancement for ITEM-01

```typescript
interface StatisticsCardsProps {
  // ... existing props ...

  // NEW: Navigation handlers for clickable cards
  onItemsClick?: () => void;
  onRoomsClick?: () => void;
  onTagsClick?: () => void;
}
```

### WhatsNextStep Props (Current)

```typescript
// File: src/components/ItemCapture/components/steps/WhatsNextStep.tsx
interface WhatsNextStepProps {
  savedItemId: string;
  savedItemName: string;
  onEditInstructions: () => void;
  onAddNewInstructions: () => void;
  onCreateNewItem: () => void;
  onDone: () => void;
  className?: string;
}
```

**Status:** Matches ITEM-03 requirements. No Cancel button present.

### Navigation Items Configuration (Current)

```typescript
// File: src/app/dashboard2/layout.tsx (REQ-141)
const navigationItems = [
  { name: 'Home', href: '/dashboard2', icon: Home },
  { name: 'My Items', href: '/dashboard2/items', icon: Package },
  { name: 'My Properties', href: '/dashboard2/properties', icon: Building2 },
];
```

**ITEM-04 Required Update:**

```typescript
const navigationItems = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard  // Changed from Home
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package
  },
  {
    name: 'Instructions',  // NEW
    mobileLabel: 'Instr.',
    href: '/dashboard2/instructions',
    icon: FileText
  },
  {
    name: 'Properties',  // Removed "My" prefix
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Home  // House icon moved here
  },
];
```

---

## Implementation Approach

### Phase 1: Verification and Gap Analysis
**Effort: 0.5 days**

- [ ] **Task 1.1:** Verify StatisticsCards clickability
  - File: `src/components/SimpleDashboard/StatisticsCards.tsx`
  - Check if StatCard has onClick handlers
  - Check if cards are buttons or divs
  - Verify visual affordance (hover states, cursor pointer)

- [ ] **Task 1.2:** Verify MetadataStep labels (ITEM-02)
  - File: `src/components/ItemCapture/components/steps/MetadataStep.tsx`
  - Check "Item Name" field label and help text
  - Verify no conflation with Article/Instructions

- [ ] **Task 1.3:** Verify ReviewStep QR label (ITEM-02)
  - File: `src/components/ItemCapture/components/steps/ReviewStep.tsx`
  - Check QR Code Label preview shows Item Name only
  - Verify not showing "Purpose - Item Name" format

- [ ] **Task 1.4:** Verify navigation structure (ITEM-04)
  - File: `src/app/dashboard2/layout.tsx`
  - Check if "Dashboard" label is used (not "Home")
  - Check if "Instructions" nav item exists
  - Check if icon assignments match PRD

- [ ] **Task 1.5:** Verify submit button label (ITEM-05)
  - File: `src/components/ItemCapture/components/steps/ReviewStep.tsx`
  - Check button text (should be "Save Item", not "Submit")

### Phase 2: Make Dashboard Cards Clickable (ITEM-01)
**Effort: 1 day**
**Priority: HIGH**

If cards are not already clickable:

- [ ] **Task 2.1:** Update StatCard component
  - File: `src/components/SimpleDashboard/StatisticsCards.tsx`
  - Change `<div>` to `<button>` element
  - Add `onClick` prop
  - Add cursor-pointer class
  - Add hover state (scale, shadow)
  - Add focus ring for keyboard nav
  - Add ARIA label

```typescript
function StatCard({ config, value, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 w-full text-left",
        "transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02]",
        "focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2",
        onClick && "cursor-pointer"
      )}
      role="group"
      aria-label={`${config.label}: ${value}. Click to view ${config.label.toLowerCase()}`}
    >
      {/* ... existing content ... */}
    </button>
  );
}
```

- [ ] **Task 2.2:** Add navigation props to StatisticsCards
  - Add `onItemsClick`, `onRoomsClick`, `onTagsClick` props
  - Pass to individual StatCard components
  - Update ProgressiveStatisticsSection to accept and forward these props

- [ ] **Task 2.3:** Wire up navigation in dashboard page
  - File: `src/app/dashboard2/page.tsx`
  - Pass click handlers to ProgressiveStatisticsSection:

```typescript
<ProgressiveStatisticsSection
  stats={stats}
  isLoading={isLoading}
  onCreateItem={handleCreateItem}
  onItemsClick={() => router.push('/dashboard2/items')}
  onRoomsClick={() => router.push('/dashboard2/items?filter=rooms')}
  onTagsClick={() => router.push('/dashboard2/items?filter=tags')}
/>
```

- [ ] **Task 2.4:** Add visual affordance indicator
  - Add subtle arrow icon to cards on hover
  - Use ChevronRight from lucide-react
  - Position at right edge of card

### Phase 3: Fix Data Model UI Clarity (ITEM-02)
**Effort: 0.5 days**
**Priority: CRITICAL**

- [ ] **Task 3.1:** Update MetadataStep field labels
  - File: `src/components/ItemCapture/components/steps/MetadataStep.tsx`
  - Ensure "Item Name" label is clear
  - Update placeholder: "e.g., Cabinets, Coffee Maker, Thermostat"
  - Add help text: "This is the physical item that will have a QR code attached."

- [ ] **Task 3.2:** Update ReviewStep QR Code preview
  - File: `src/components/ItemCapture/components/steps/ReviewStep.tsx`
  - Ensure QR Code Label section shows:
    ```
    QR Code Label: [Item Name]
    Tip: When guests scan this code, they'll see all instructions for this item.
    ```
  - Do NOT concatenate purpose with item name

- [ ] **Task 3.3:** Verify assembleItemRecord output
  - File: `src/components/ItemCapture/utils/assembleItemRecord.ts`
  - Confirm `ItemRecord.title` = item name only
  - Confirm `ItemRecord.contentPurpose` is separate field
  - Add test to verify separation

### Phase 4: Fix Submit Button Label (ITEM-05)
**Effort: 0.25 days**
**Priority: HIGH**

- [ ] **Task 4.1:** Update button text in ReviewStep
  - File: `src/components/ItemCapture/components/steps/ReviewStep.tsx`
  - Change "Submit" to "Save Item"
  - Update loading state text: "Saving..."

```typescript
<button type="button" onClick={onSubmit} disabled={isSubmitting || !isValid}>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      <span>Saving...</span>
    </>
  ) : (
    <>
      <Check className="w-4 h-4" aria-hidden="true" />
      <span>Save Item</span>
    </>
  )}
</button>
```

### Phase 5: Update Navigation Structure (ITEM-04)
**Effort: 0.5 days**
**Priority: MEDIUM**

If not already updated:

- [ ] **Task 5.1:** Update navigationItems array
  - File: `src/app/dashboard2/layout.tsx`
  - Change "Home" to "Dashboard"
  - Remove "My" prefix
  - Add "Instructions" item
  - Reorder: Dashboard, Items, Instructions, Properties

- [ ] **Task 5.2:** Update icon assignments
  - Import `LayoutDashboard` from lucide-react
  - Dashboard: LayoutDashboard (grid icon)
  - Items: Package (keep)
  - Instructions: FileText
  - Properties: Home (house)

- [ ] **Task 5.3:** Implement mobile label support
  - Add `mobileLabel` to NavItem type
  - Show short labels on screens < md breakpoint
  - Example: "Dashboard" -> "D/B", "Instructions" -> "Instr."

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card click handling | `<button>` element | Better accessibility than click handlers on divs |
| Navigation targets | Existing routes + filters | Avoid creating unnecessary new pages |
| Data model changes | UI-only | Schema already supports Item:Article 1:N |
| Step count | Keep 4-stage model | Proven approach, already implemented |
| Mobile labels | Inline property | Simple, matches existing patterns |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cards already clickable | Medium | Low | Verify first, skip if done |
| Navigation already updated | High | Low | Verify first, skip if done |
| Rooms/Tags pages don't exist | Medium | Low | Use Items page with query params |
| Breaking existing tests | Low | Medium | Run test suite after each change |
| Mobile layout issues | Low | Medium | Test on multiple viewports |

---

## Effort Estimate

| Phase | Estimate | Confidence | Notes |
|-------|----------|------------|-------|
| Phase 1: Verification | 0.5 day | High | Quick code review |
| Phase 2: Clickable Cards | 1 day | High | If not already done |
| Phase 3: Data Model UI | 0.5 day | High | Label updates only |
| Phase 4: Submit Button | 0.25 day | High | Simple text change |
| Phase 5: Navigation | 0.5 day | Medium | May already be done |
| **Total** | **2.75 days** | Medium | Much may already be complete |

**Note:** Actual effort may be significantly less if verification phase confirms prior implementation.

---

## Open Questions

1. **Rooms Navigation Target:** Does `/dashboard2/rooms` exist? If not, should clicking "Rooms" card filter the Items list by room, or create a dedicated rooms page?

2. **Tags Navigation Target:** Same question for Tags - dedicated page or filtered Items view?

3. **Instructions Page Content:** The Instructions page was created as a placeholder (REQ-195). What content should it display? Options:
   - All articles across all items
   - Articles grouped by item
   - Empty state with "Coming Soon"

4. **Mobile Navigation Width:** With 4 navigation items, will horizontal space be sufficient on narrow screens? Consider:
   - Shorter labels (already planned)
   - Horizontal scrolling
   - Bottom navigation bar
   - Hamburger menu

---

## Files to Modify

| File | Changes | Phase |
|------|---------|-------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | Make cards clickable | 2 |
| `src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx` | Forward click handlers | 2 |
| `src/app/dashboard2/page.tsx` | Add navigation handlers | 2 |
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | Update labels | 3 |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | QR label, button text | 3, 4 |
| `src/app/dashboard2/layout.tsx` | Navigation structure | 5 |

## Files to Create

| File | Purpose | Phase |
|------|---------|-------|
| None | All pages exist or can use query params | N/A |

---

## References

- [PRD Source](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-131111.md)
- [ItemCapture Component](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/ItemCapture.tsx)
- [StatisticsCards](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/SimpleDashboard/StatisticsCards.tsx)
- [WhatsNextStep](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/WhatsNextStep.tsx)
- [Dashboard Layout](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/dashboard2/layout.tsx)
- [ProgressIndicator](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/shared/ProgressIndicator.tsx)
- [ReviewStep](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/ReviewStep.tsx)
- [MetadataStep](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemCapture/components/steps/MetadataStep.tsx)
- [Prior Plan 107](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/prd/Plan-107-FAQBNB-Review-2026-01-11b-Implementation.md)

---

## Implementation Priority Summary

```
┌────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION ORDER                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. VERIFY (Phase 1)                                               │
│     └── Check what's already implemented                           │
│                                                                     │
│  2. ITEM-02 (CRITICAL) - Phase 3                                   │
│     └── Data Model UI Clarity                                      │
│         └── MetadataStep labels                                    │
│         └── ReviewStep QR preview                                  │
│                                                                     │
│  3. ITEM-05 (HIGH) - Phase 4                                       │
│     └── Submit Button Label                                        │
│         └── "Submit" -> "Save Item"                                │
│                                                                     │
│  4. ITEM-01 (HIGH) - Phase 2                                       │
│     └── Clickable Dashboard Cards                                  │
│         └── StatCard as button                                     │
│         └── Navigation handlers                                    │
│                                                                     │
│  5. ITEM-04 (MEDIUM) - Phase 5                                     │
│     └── Navigation Structure                                       │
│         └── Labels, icons, mobile support                          │
│                                                                     │
│  Note: ITEM-03 (WhatsNextStep) appears COMPLETE                    │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Verification Checklist

Before starting implementation, verify these items are NOT already complete:

- [ ] StatisticsCards: Cards are NOT buttons (just divs)
- [ ] StatisticsCards: No onClick handlers present
- [ ] StatisticsCards: No hover/focus states for interactivity
- [ ] MetadataStep: Labels DO conflate Item with Article
- [ ] ReviewStep: QR label DOES show "Purpose - Item Name"
- [ ] ReviewStep: Submit button says "Submit" (not "Save Item")
- [ ] Layout: Navigation uses "Home" (not "Dashboard")
- [ ] Layout: "Instructions" nav item is MISSING
- [ ] Layout: Icons are NOT updated per PRD

If any of these are already correct, skip the corresponding task.
