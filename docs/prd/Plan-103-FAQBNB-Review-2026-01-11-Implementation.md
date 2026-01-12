# Implementation Plan: FAQBNB Application Review - 2026-01-11

**Generated:** 2026-01-11 22:30:00
**Last Modified:** 2026-01-11 22:30:00
**Source PRD:** docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-222621.md
**Project:** FAQBNB

---

## Overview

This implementation plan addresses 5 change requests from the FAQBNB application review session. The requests span UI/UX improvements, data model clarifications, navigation updates, and workflow fixes. This plan consolidates all requests into a unified implementation strategy with prioritized phases.

**Priority Summary:**
- CRITICAL (1): REQ-2 - Fix Data Model (Item vs Article separation)
- HIGH (3): REQ-1 (Dashboard Cards), REQ-3 (What's Next Screen), REQ-5 (Step Count)
- MEDIUM (1): REQ-4 (Navigation Menu)

---

## Technical Context

### Existing Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 15.5.9 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Radix UI + Lucide Icons | Latest |
| State Management | React Context (AuthContext) | - |
| Build Tool | Next.js Turbopack | - |
| Database | Supabase (PostgreSQL) | - |
| Testing | Vitest + Testing Library | - |

### Relevant Existing Patterns

1. **Dashboard Components:**
   - `src/components/UserDashboard.tsx` - Stats cards pattern (non-clickable)
   - `src/components/KPIDashboardOverview.tsx` - KPI card pattern
   - Stats cards display Properties, Items, Views, Activity counts

2. **Navigation:**
   - `src/app/dashboard/layout.tsx` - Dashboard navigation with Lucide icons
   - `src/components/RoleBasedNavigation.tsx` - Role-based menu system
   - Current icons: `LayoutDashboard`, `Package`, `Home`, `BarChart3`

3. **Item Capture Wizard:**
   - `src/components/ItemCapture/` - Multi-step wizard
   - `ProgressIndicator.tsx` - 4-stage display (Details, Content, Edit, Review)
   - `CaptureWizard.tsx` - Container with progress + navigation
   - Current steps: metadata, content-type, capture, edit-media, add-more, review

4. **Data Model:**
   - `src/types/index.ts` - Item, ItemArticle, ItemLink types
   - Items have `name` (item name) and `description`
   - Articles have `purpose` (e.g., "how-to-use") and `title`
   - Links belong to Articles or directly to Items

---

## Request Analysis & Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Request Dependency Graph                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  REQ-2 (Data Model) ──────────┐                                      │
│       │                        │                                      │
│       ├──► REQ-3 (What's Next) ┼──► REQ-5 (Step Count)               │
│       │                        │                                      │
│       └──► Affects labels shown│                                      │
│            in workflow         │                                      │
│                                                                       │
│  REQ-1 (Dashboard Cards) ─────── Independent                         │
│                                                                       │
│  REQ-4 (Navigation) ───────────── Independent (can add Instructions) │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Dependency Notes:**
- REQ-2 should be implemented first as it affects terminology throughout the workflow
- REQ-3 and REQ-5 are tightly coupled (both involve post-save workflow)
- REQ-1 and REQ-4 are independent and can be done in parallel

---

## Architecture

### Component Changes Overview

```
src/
├── app/
│   └── dashboard/
│       ├── layout.tsx                    # REQ-4: Update nav icons/labels
│       ├── page.tsx                      # REQ-1: Clickable card routing
│       └── instructions/                 # REQ-4: NEW route
│           └── page.tsx
│
├── components/
│   ├── UserDashboard.tsx                # REQ-1: Clickable stats cards
│   ├── KPIDashboardOverview.tsx         # REQ-1: Clickable stats cards
│   ├── RoleBasedNavigation.tsx          # REQ-4: Update navigation items
│   │
│   └── ItemCapture/
│       ├── ItemCapture.tsx              # REQ-3/5: Post-workflow menu
│       ├── components/
│       │   ├── shared/
│       │   │   ├── ProgressIndicator.tsx # REQ-5: Update step count
│       │   │   └── PostWorkflowMenu.tsx  # REQ-3: NEW component
│       │   └── steps/
│       │       ├── MetadataStep.tsx      # REQ-2: Item name field
│       │       └── ReviewStep.tsx        # REQ-2: Label updates
│       └── ItemCapture.types.ts          # REQ-2: Type clarifications
│
└── types/
    └── index.ts                          # REQ-2: Type documentation
```

---

## REQ-1: Make Dashboard Cards Clickable

### Current State
Dashboard shows summary cards (Properties, Items, Views, Activity) as static, non-interactive elements in both `UserDashboard.tsx` and `KPIDashboardOverview.tsx`.

### Required Changes

1. **UserDashboard.tsx Stats Cards** (Lines 152-181)
   - Add `onClick` handlers and `cursor-pointer` styling
   - Route clicks to appropriate list pages:
     - Properties → `/dashboard/properties`
     - Items → `/dashboard/items`
     - Views → `/dashboard/analytics` (admin only)
     - Activity → (no navigation, informational only)

2. **KPIDashboardOverview.tsx KPI Cards** (Lines 360-389)
   - Same pattern for admin dashboard cards
   - Navigate to admin routes

### Implementation Details

```typescript
// UserDashboard.tsx - Enhanced statsCards
const statsCards = [
  {
    title: 'Properties',
    value: stats.totalProperties,
    subtitle: 'Total properties',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/properties',  // NEW
    clickable: true,                 // NEW
  },
  {
    title: 'Items',
    value: stats.totalItems,
    subtitle: `${stats.recentItems} created recently`,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/items',       // NEW
    clickable: true,                // NEW
  },
  // ... etc
];

// Render with clickable wrapper
{statsCards.map((card, index) => (
  card.clickable ? (
    <Link href={card.href} key={index}>
      <div className="...cursor-pointer hover:shadow-md transition-shadow">
        {/* card content */}
      </div>
    </Link>
  ) : (
    <div key={index} className="...">
      {/* card content */}
    </div>
  )
))}
```

### Files to Modify
- `src/components/UserDashboard.tsx`
- `src/components/KPIDashboardOverview.tsx`

### Effort: 0.5 days

---

## REQ-2: Fix Data Model - Separate Item from Article

### Problem Analysis

The current UI conflates two distinct concepts:
1. **Item** = A physical thing (e.g., "Steamer") that gets ONE QR code
2. **Article** = Instructions/content about that item (e.g., "How to Clean")

The QR code should show the **Item Name** only, and scanning reveals all related articles.

### Current Data Model (Correct)

```
items (id, name, description, qr_code_url, ...)
  └── item_articles (id, item_id, purpose, title, ...)
        └── item_links (id, article_id, title, link_type, url, ...)
```

The database structure is already correct. The issue is in the UI labeling and workflow understanding.

### UI Label Changes Required

| Location | Current Label | Correct Label |
|----------|--------------|---------------|
| MetadataStep title field | "Article Title" or "Name" | "Item Name" |
| MetadataStep help text | "How to Clean - Steamer" | "Steamer" |
| QR Code label generation | Uses full title | Uses Item Name only |
| ReviewStep header | "Item Details" | "Item Details" (keep) |
| Article creation step | N/A | "Purpose" or "Instructions Title" |

### Implementation Details

1. **MetadataStep.tsx Updates:**
   ```tsx
   // Change field label
   <label>Item Name</label>
   <input placeholder="e.g., Steamer, Oven, Coffee Machine" />
   <p className="text-gray-500">
     The name of the physical item. This will appear on the QR code label.
   </p>
   ```

2. **Article Creation (ContentTypeStep or new step):**
   - When adding content, capture the "Purpose" (what are these instructions for?)
   - Purpose options: "How to Use", "How to Clean", "Troubleshooting", etc.
   - Article title auto-generates from purpose (or is entered manually)

3. **QR Code Label Generation:**
   - Ensure `qr_code_url` endpoint uses `item.name` not article title
   - Verify in `src/lib/pdf-generator.ts` or QR generation utilities

### Files to Modify
- `src/components/ItemCapture/components/steps/MetadataStep.tsx`
- `src/components/ItemCapture/ItemCapture.types.ts` (documentation)
- `src/lib/pdf-generator.ts` or related QR utilities
- `src/components/ItemCapture/components/steps/ReviewStep.tsx` (labeling)

### Effort: 1 day

---

## REQ-3: Fix "What's Next" Screen

### Current State
After saving an item, shows "What's Next?" with:
- "Review & Submit" button
- "Add More Content" button
- "Cancel" button (invalid - item already saved)
- Back arrow (invalid - can't undo save)
- Step counter shows "Step 9 of 10"

### Required Changes

Remove cancel and back navigation. Replace with post-workflow menu:

```
┌──────────────────────────────────────────────────────┐
│          Item Saved Successfully!                     │
│                                                       │
│  [QR Code Preview]                                    │
│                                                       │
│  What would you like to do next?                     │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ Edit Instructions                             │   │
│  │ Edit the instructions you just created        │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ Add New Instructions                          │   │
│  │ Create different instructions for this item   │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ Create New Item                               │   │
│  │ Start fresh with a different item             │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ Done                                          │   │
│  │ Return to dashboard                           │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Implementation Details

1. **Create PostWorkflowMenu Component:**

```typescript
// src/components/ItemCapture/components/shared/PostWorkflowMenu.tsx

interface PostWorkflowMenuProps {
  itemId: string;
  itemName: string;
  articleId?: string;
  qrCodeUrl?: string;
  onEditInstructions: () => void;
  onAddNewInstructions: () => void;
  onCreateNewItem: () => void;
  onDone: () => void;
}

export function PostWorkflowMenu({
  itemName,
  qrCodeUrl,
  onEditInstructions,
  onAddNewInstructions,
  onCreateNewItem,
  onDone,
}: PostWorkflowMenuProps) {
  return (
    <div className="flex flex-col items-center py-8 px-4">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Item Saved Successfully!
      </h2>
      <p className="text-gray-600 mb-6">"{itemName}" has been saved.</p>

      {qrCodeUrl && (
        <div className="mb-8">
          <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
        </div>
      )}

      <div className="w-full max-w-md space-y-3">
        <MenuOption
          title="Edit Instructions"
          description="Edit the instructions you just created"
          icon={<Edit className="w-5 h-5" />}
          onClick={onEditInstructions}
        />
        <MenuOption
          title="Add New Instructions"
          description="Create different instructions for this item"
          icon={<Plus className="w-5 h-5" />}
          onClick={onAddNewInstructions}
        />
        <MenuOption
          title="Create New Item"
          description="Start fresh with a different item"
          icon={<Package className="w-5 h-5" />}
          onClick={onCreateNewItem}
        />
        <MenuOption
          title="Done"
          description="Return to dashboard"
          icon={<Home className="w-5 h-5" />}
          onClick={onDone}
          variant="primary"
        />
      </div>
    </div>
  );
}
```

2. **Integrate into ItemCapture.tsx:**
   - After successful submission, show `PostWorkflowMenu` instead of resetting
   - Pass callbacks for each action
   - Remove step counter display for this screen

### Files to Create
- `src/components/ItemCapture/components/shared/PostWorkflowMenu.tsx`

### Files to Modify
- `src/components/ItemCapture/ItemCapture.tsx`
- `src/components/ItemCapture/components/CaptureWizard.tsx`

### Effort: 1 day

---

## REQ-4: Update Navigation Menu

### Current State
Menu has 3 items: Dashboard, Items, Properties (+ Analytics for admin)
- "Home" icon used for dashboard conflicts with property terminology
- Missing "Instructions" menu item
- Mobile labels not optimized

### Required Changes

| Desktop Label | Mobile Label | Icon | Route |
|--------------|--------------|------|-------|
| Dashboard | D/B | `LayoutDashboard` (grid icon) | /dashboard |
| Items | Items | `Package` (box/cube) | /dashboard/items |
| Instructions | Instr. | `FileText` (document) | /dashboard/instructions |
| Properties | Prop. | `Building2` (house/building) | /dashboard/properties |
| Analytics | Stats | `BarChart3` (chart) | /dashboard/analytics |

### Implementation Details

1. **Update dashboard/layout.tsx navigation:**

```typescript
const getNavigationItems = () => {
  const baseItems = [
    {
      name: 'Dashboard',
      mobileLabel: 'D/B',  // NEW
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Items',
      mobileLabel: 'Items',
      href: '/dashboard/items',
      icon: <Package className="h-5 w-5" />
    },
    {
      name: 'Instructions',  // NEW
      mobileLabel: 'Instr.',
      href: '/dashboard/instructions',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Properties',
      mobileLabel: 'Prop.',
      href: '/dashboard/properties',
      icon: <Building2 className="h-5 w-5" />
    },
  ];
  // ...
};
```

2. **Create Instructions page:**

```typescript
// src/app/dashboard/instructions/page.tsx
export default function InstructionsPage() {
  return (
    <div>
      <h1>Instructions</h1>
      {/* List all articles/instructions across items */}
    </div>
  );
}
```

3. **Update RoleBasedNavigation.tsx:**
   - Add Instructions navigation item
   - Support mobile label display

### Files to Create
- `src/app/dashboard/instructions/page.tsx`

### Files to Modify
- `src/app/dashboard/layout.tsx`
- `src/components/RoleBasedNavigation.tsx`

### Effort: 0.5 days

---

## REQ-5: Fix Workflow Step Count

### Current State
- ProgressIndicator shows 4 stages: Details, Content, Edit, Review
- Step counter shows "Step 8 of 10" on Save screen
- Steps 9 and 10 shown after save (should be post-workflow menu, not numbered)

### Required Changes

1. **Clarify step count:**
   - Wizard ends at step 8 (Save/Review)
   - After save = post-workflow menu (NOT a numbered step)
   - Update ProgressIndicator to show "Step X of 8" where appropriate

2. **ProgressIndicator.tsx updates:**
   - Keep 4-stage display (Details, Content, Edit, Review)
   - Ensure "review" step shows 100% complete
   - Post-workflow menu should NOT show progress indicator

### Implementation Details

1. **Update PROGRESS_STAGES constant:**

```typescript
// Current: 4 stages (correct)
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

2. **Add post-workflow state to WizardStep type:**

```typescript
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'add-url'
  | 'edit-media'
  | 'add-more'
  | 'review'
  | 'success';  // NEW: Post-save state (no step number)
```

3. **Hide progress indicator for success state:**

```typescript
// In ItemCapture.tsx
const showProgressIndicator = state.currentStep !== 'success';
```

### Files to Modify
- `src/components/ItemCapture/ItemCapture.types.ts`
- `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
- `src/components/ItemCapture/ItemCapture.tsx`
- `src/components/ItemCapture/components/CaptureWizard.tsx`

### Effort: 0.5 days

---

## Integration Contract

### Dashboard Cards (REQ-1)

```typescript
interface ClickableStatsCard {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  href?: string;      // Navigation destination
  clickable?: boolean; // Enable click behavior
}
```

### PostWorkflowMenu (REQ-3)

```typescript
interface PostWorkflowMenuProps {
  /** ID of the saved item */
  itemId: string;
  /** Name of the saved item (for display) */
  itemName: string;
  /** ID of the article created (if any) */
  articleId?: string;
  /** QR code URL for preview */
  qrCodeUrl?: string;
  /** Navigate to edit the current article */
  onEditInstructions: () => void;
  /** Add new instructions to the same item */
  onAddNewInstructions: () => void;
  /** Start creating a new item */
  onCreateNewItem: () => void;
  /** Return to dashboard */
  onDone: () => void;
}
```

### Navigation Item (REQ-4)

```typescript
interface NavigationItem {
  name: string;          // Desktop label
  mobileLabel?: string;  // Compact mobile label
  href: string;
  icon: React.ReactNode;
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
}
```

---

## Implementation Approach

### Phase 1: Foundation & Critical Fixes (Day 1)

**REQ-2: Data Model Clarity**
- [ ] Update MetadataStep field labels (Item Name vs Article Title)
- [ ] Add helper text explaining Item = physical thing
- [ ] Verify QR code label uses Item Name only
- [ ] Update type documentation in ItemCapture.types.ts
- [ ] Test item creation flow with new labels

### Phase 2: Workflow Improvements (Day 2)

**REQ-3 & REQ-5: Post-Workflow Menu & Step Count**
- [ ] Add 'success' step to WizardStep type
- [ ] Create PostWorkflowMenu component
- [ ] Integrate PostWorkflowMenu after successful save
- [ ] Hide progress indicator for success state
- [ ] Remove Cancel/Back buttons from post-save view
- [ ] Implement all 4 menu options (Edit, Add New, Create Item, Done)
- [ ] Test complete workflow end-to-end

### Phase 3: Dashboard & Navigation (Day 3)

**REQ-1: Clickable Dashboard Cards**
- [ ] Update UserDashboard statsCards with href and clickable props
- [ ] Update KPIDashboardOverview with same pattern
- [ ] Add Link wrapper for clickable cards
- [ ] Add hover states and cursor styling
- [ ] Test navigation from cards

**REQ-4: Navigation Menu Update**
- [ ] Create /dashboard/instructions page (placeholder)
- [ ] Update navigation items with new structure
- [ ] Add mobile label support
- [ ] Verify icon changes (LayoutDashboard vs Home)
- [ ] Test responsive navigation

### Phase 4: Testing & Polish (Day 4)

- [ ] End-to-end testing of all 5 requirements
- [ ] Cross-browser testing
- [ ] Mobile responsiveness verification
- [ ] Accessibility audit (keyboard navigation, screen readers)
- [ ] Performance verification (no regressions)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Post-workflow as step | Add 'success' step type | Cleaner state management than separate flag |
| Mobile labels | Separate `mobileLabel` prop | Flexible without breaking desktop |
| Instructions page | Simple list initially | MVP to unblock REQ-4; enhance later |
| Card click wrapper | Next.js Link component | Consistent with existing patterns |
| QR label source | `item.name` field | Matches data model intent |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Workflow state conflicts | Medium | High | Add 'success' as explicit step, not post-action |
| Navigation breaking mobile | Low | Medium | Test responsive layout thoroughly |
| QR label change affects existing | Low | High | Verify existing items still work |
| Instructions page scope creep | Medium | Medium | Keep initial implementation minimal |

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| Phase 1: Data Model | REQ-2 | 1 day | High |
| Phase 2: Workflow | REQ-3, REQ-5 | 1 day | High |
| Phase 3: Dashboard/Nav | REQ-1, REQ-4 | 1 day | High |
| Phase 4: Testing | All | 0.5 day | Medium |
| **Total** | | **3.5 days** | |

---

## Open Questions

1. **Instructions Page Scope:** Should the new Instructions page list all articles across all items, or be filterable by item/property? (Recommend: Start simple, enhance later)

2. **Edit Instructions Flow:** After clicking "Edit Instructions" from post-workflow menu, where does user go? (Recommend: Back to ReviewStep with edit mode)

3. **Analytics Access from Cards:** Should non-admin users see Views card as clickable if they don't have analytics access? (Recommend: Hide href, show as static)

---

## References

- PRD: `docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-222621.md`
- Existing Implementation Plans: `docs/prd/Plan-093-*`, `Plan-094-*`
- Database Schema: `database/schema.sql`
- Type Definitions: `src/types/index.ts`, `src/components/ItemCapture/ItemCapture.types.ts`
- Dashboard Components: `src/components/UserDashboard.tsx`, `src/components/KPIDashboardOverview.tsx`
- Navigation: `src/app/dashboard/layout.tsx`, `src/components/RoleBasedNavigation.tsx`
- Item Capture: `src/components/ItemCapture/ItemCapture.tsx`
