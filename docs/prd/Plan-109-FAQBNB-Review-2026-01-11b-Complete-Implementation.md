# Implementation Plan: FAQBNB Review 2026-01-11b - Complete Implementation

**Generated:** 2026-01-12 13:45:00 UTC
**Last Modified:** 2026-01-12 13:45:00 UTC
**Source PRD:** docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-132632.md
**Plan Number:** 109

---

## Route-to-Component Verification

### Traced Route Mapping

| Route | Page File | Component | Status |
|-------|-----------|-----------|--------|
| `/dashboard2/` | `src/app/dashboard2/page.tsx` | SimpleDashboard (via ProgressiveStatisticsSection) | Verified |
| `/dashboard2/create` | `src/app/dashboard2/create/page.tsx` | ItemCreationWorkflow | Verified |
| `/dashboard2/items` | `src/app/dashboard2/items/page.tsx` | ItemManager | Verified |

### Semantic Verification Findings

**Critical Discovery: Step Count Analysis**

The PRD states the workflow shows "Step 9 of 10" on the "What's Next?" screen, and should be "Step 8 of 8".

**Traced component analysis:**
- **ItemCreationWorkflow** (`src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`) uses `WORKFLOW_STEPS` from constants
- **WORKFLOW_STEPS** in `/src/components/ItemCreationWorkflow/utils/constants.ts` currently has **10 steps**:
  1. `room-selection`
  2. `item-type-selection`
  3. `specific-item-selection`
  4. `purpose-selection`
  5. `content-type-selection`
  6. `media-capture`
  7. `content-creation`
  8. `preview-save`
  9. `next-action`
  10. `session-summary`

- **WorkflowHeader** displays `Step {currentStepIndex + 1} of {totalSteps}` where `totalSteps = WORKFLOW_STEPS.length` (10)

**PRD Requirement:**
- PRD says "Save Item" should be "Step 8 of 8" (final step)
- `next-action` (What's Next) is "Step 9 of 10" - this should be a post-workflow menu, NOT a numbered step
- `session-summary` (Step 10) should also not be numbered

### Target Component Confirmation

| PRD Item | Target Component/File | Verified |
|----------|----------------------|----------|
| ITEM-01: Dashboard Cards Clickable | `src/components/SimpleDashboard/StatisticsCards.tsx` | Yes |
| ITEM-02: Data Model Separation | `src/components/ItemCreationWorkflow/` (types, hooks) | Yes |
| ITEM-03: What's Next Screen | `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Yes |
| ITEM-04: Navigation Menu | `src/app/dashboard2/layout.tsx` (navigationItems) | Yes |
| ITEM-05: Step Count Fix | `src/components/ItemCreationWorkflow/utils/constants.ts` (WORKFLOW_STEPS) | Yes |

---

## Overview

This implementation plan addresses 5 items from the FAQBNB Application Review session (2026-01-11). The changes involve:

1. Making dashboard statistics cards clickable with navigation
2. Fixing the data model to properly separate Items from Articles/Instructions
3. Redesigning the "What's Next" screen as a post-workflow menu with 4 clear options
4. Updating navigation menu structure with new labels and icons
5. Fixing workflow step count from "10 steps" to "8 steps"

All changes target the `/dashboard2/` route and its associated components.

---

## Technical Context

### Existing Stack

- **Framework:** Next.js 15.x (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** React hooks (useReducer pattern in workflow)
- **UI Components:** Radix UI primitives, Lucide React icons
- **Build Tool:** Next.js with Turbopack
- **Testing:** Vitest + Testing Library

### Key Existing Patterns

1. **Workflow State Machine:** `useWorkflowState` hook with reducer pattern
2. **Constants-Driven UI:** WORKFLOW_STEPS, PROGRESS_WEIGHTS define step flow
3. **Component Composition:** Step components receive callbacks from parent
4. **Airbnb DLS Colors:** `#FF385C` (primary), `#222222` (text), `#717171` (secondary)

### New Dependencies Required

None - all required libraries already present.

---

## Architecture

### Component Changes Overview

```
Changes by Component:
├── src/app/dashboard2/
│   └── layout.tsx                    # ITEM-04: Update navigationItems
│
├── src/components/SimpleDashboard/
│   └── StatisticsCards.tsx           # ITEM-01: Add onClick handlers
│
├── src/components/ItemCreationWorkflow/
│   ├── utils/constants.ts            # ITEM-05: Reduce WORKFLOW_STEPS to 8
│   ├── ItemCreationWorkflow.types.ts # ITEM-02: Add Article type
│   ├── ItemCreationWorkflow.tsx      # ITEM-03, ITEM-05: Header logic
│   ├── hooks/useWorkflowState.ts     # ITEM-05: Update step transitions
│   ├── components/shared/
│   │   └── WorkflowHeader.tsx        # ITEM-05: Conditional display
│   └── components/steps/
│       ├── NextActionStep.tsx        # ITEM-03: Replace with 4 options
│       └── PreviewSaveStep.tsx       # ITEM-02, ITEM-05: QR label logic
│
└── NEW: src/app/dashboard2/instructions/
    └── page.tsx                      # ITEM-04: New Instructions route
```

### Data Model Changes (ITEM-02)

**Current (Incorrect):**
```
Item = Article (conflated)
- name: "How to Clean - Cabinets"
- QR Code shows: "How to Clean - Cabinets"
```

**Target (Correct):**
```
Item (physical thing, ONE QR code)
├── id: string
├── name: string            # e.g., "Cabinets"
├── qrCodeLabel: string     # Equals item name
└── articles: Article[]     # One-to-many relationship

Article/Instruction (content about an item)
├── id: string
├── title: string           # e.g., "How to Clean"
├── purpose: PurposeType    # how-to-clean, how-to-use, etc.
└── content: ContentPiece[]
```

---

## Implementation Approach

### Phase 1: Fix Workflow Step Count (ITEM-05) - HIGH Priority

**Goal:** Change workflow from 10 steps to 8 steps. The "What's Next" and "Session Summary" are post-workflow screens, not numbered steps.

#### Task 1.1: Update WORKFLOW_STEPS constant

**File:** `src/components/ItemCreationWorkflow/utils/constants.ts`

**Current state (lines 450-461):**
```typescript
export const WORKFLOW_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'content-creation',         // Step 7 (compatibility)
  'preview-save',             // Step 8 (FINAL)
  'next-action',              // Post-workflow menu
  'session-summary',          // Post-workflow
] as const;
```

**Changes:**
- Create new constant `USER_VISIBLE_STEPS` with first 8 steps
- Keep `WORKFLOW_STEPS` for internal navigation (includes post-workflow)
- Update `PROGRESS_WEIGHTS` to reach 100% at `preview-save`

```typescript
/**
 * User-visible workflow steps (for progress indicator).
 * Steps 1-8 are numbered; post-workflow screens are not counted.
 */
export const USER_VISIBLE_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'content-creation',         // Step 7 (when used)
  'preview-save',             // Step 8 - FINAL
] as const;

/**
 * Post-workflow screens (no step counter shown).
 */
export const POST_WORKFLOW_SCREENS = [
  'next-action',
  'session-summary',
] as const;

/**
 * Complete navigation flow (internal use).
 */
export const WORKFLOW_STEPS = [
  ...USER_VISIBLE_STEPS,
  ...POST_WORKFLOW_SCREENS,
] as const;
```

#### Task 1.2: Update PROGRESS_WEIGHTS

**File:** `src/components/ItemCreationWorkflow/utils/constants.ts` (lines 495-506)

```typescript
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,          // Step 1 of 8
  'item-type-selection': 25,     // Step 2 of 8
  'specific-item-selection': 37, // Step 3 of 8
  'purpose-selection': 50,       // Step 4 of 8
  'content-type-selection': 62,  // Step 5 of 8
  'media-capture': 75,           // Step 6 of 8
  'content-creation': 87,        // Step 7 of 8
  'preview-save': 100,           // Step 8 of 8 - FINAL
  'next-action': 100,            // Post-workflow (no bar)
  'session-summary': 100,        // Post-workflow (no bar)
};
```

#### Task 1.3: Update WorkflowHeader to hide on post-workflow screens

**File:** `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

Add prop to conditionally hide step counter:

```typescript
export interface WorkflowHeaderProps {
  // ... existing props
  /** Whether to show the step counter */
  showStepCounter?: boolean;
}

// In render:
{showStepCounter !== false && (
  <div className="text-sm font-medium text-gray-700">
    Step {currentStepIndex + 1} of {totalSteps}
  </div>
)}
```

#### Task 1.4: Update ItemCreationWorkflow to use USER_VISIBLE_STEPS

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

Modify how `currentStepIndex` and `totalSteps` are calculated:

```typescript
import { USER_VISIBLE_STEPS, POST_WORKFLOW_SCREENS } from './utils/constants';

// Computed in component:
const isPostWorkflow = POST_WORKFLOW_SCREENS.includes(state.currentStep as any);
const displayStepIndex = USER_VISIBLE_STEPS.indexOf(state.currentStep as any);
const displayTotalSteps = USER_VISIBLE_STEPS.length; // 8

// Pass to WorkflowHeader:
<WorkflowHeader
  currentStepIndex={displayStepIndex >= 0 ? displayStepIndex : USER_VISIBLE_STEPS.length - 1}
  totalSteps={displayTotalSteps}
  progressPercent={progressPercent}
  canGoBack={isPostWorkflow ? false : canGoBack}
  onBack={prevStep}
  onExit={handleExitClick}
  showStepCounter={!isPostWorkflow}
/>
```

#### Task 1.5: Update useWorkflowState hook

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

Export new computed value:

```typescript
const isPostWorkflowStep = useMemo(() => {
  return ['next-action', 'session-summary'].includes(state.currentStep);
}, [state.currentStep]);

const userVisibleStepIndex = useMemo(() => {
  const index = USER_VISIBLE_STEPS.indexOf(state.currentStep as any);
  return index >= 0 ? index : USER_VISIBLE_STEPS.length - 1;
}, [state.currentStep]);

const userVisibleTotalSteps = USER_VISIBLE_STEPS.length;
```

- [ ] Update WORKFLOW_STEPS constant to separate user-visible steps
- [ ] Create USER_VISIBLE_STEPS and POST_WORKFLOW_SCREENS constants
- [ ] Update PROGRESS_WEIGHTS to reach 100% at preview-save
- [ ] Update WorkflowHeader with showStepCounter prop
- [ ] Update ItemCreationWorkflow to hide step counter on post-workflow
- [ ] Update useWorkflowState hook exports

---

### Phase 2: Fix "What's Next" Screen (ITEM-03) - HIGH Priority

**Goal:** Transform NextActionStep into a post-workflow decision menu with 4 options.

#### Task 2.1: Update NextActionStep component

**File:** `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Required Changes:**
1. Remove Cancel button (item already saved - nothing to cancel)
2. Add 4 new action options:
   - Edit Instructions
   - Add New Instructions
   - Create New Item
   - Done

**New interface:**
```typescript
export interface NextActionStepProps {
  /** The saved item details */
  savedItem: {
    id: string;
    name: string;
    articleTitle: string;
  };
  /** Callback: Edit the article just created */
  onEditInstructions: () => void;
  /** Callback: Add new instructions to same item */
  onAddNewInstructions: () => void;
  /** Callback: Start workflow for a new item */
  onCreateNewItem: () => void;
  /** Callback: Exit workflow entirely */
  onDone: () => void;
}
```

**Integrate existing WhatsNextStep component:**
- There's already a `WhatsNextStep` component at `src/components/ItemCapture/components/steps/WhatsNextStep.tsx`
- This component has the correct 4 options
- Move or refactor to use this implementation in ItemCreationWorkflow

#### Task 2.2: Remove back arrow from post-workflow header

Already addressed in Phase 1 Task 1.4 - set `canGoBack={false}` for post-workflow screens.

- [ ] Refactor NextActionStep to use 4-option layout
- [ ] Remove Cancel button
- [ ] Remove step counter reference
- [ ] Ensure back arrow is hidden

---

### Phase 3: Make Dashboard Cards Clickable (ITEM-01) - HIGH Priority

**Goal:** Add navigation when clicking Items, Rooms, and Tags cards.

#### Task 3.1: Update StatisticsCards component

**File:** `src/components/SimpleDashboard/StatisticsCards.tsx`

**Changes:**
1. Add navigation hrefs to card configs
2. Make cards clickable with proper accessibility
3. Add visual affordance (hover state, cursor)

```typescript
interface StatCardConfig {
  key: NumericStatKey;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  href: string;  // NEW: Navigation target
}

const cardConfigs: StatCardConfig[] = [
  {
    key: 'itemCount',
    label: 'Items',
    icon: Package,
    iconColor: 'text-[#FF385C]',
    iconBgColor: 'bg-[#FFEEEF]',
    href: '/dashboard2/items',
  },
  {
    key: 'roomCount',
    label: 'Rooms',
    icon: Home,
    iconColor: 'text-[#00A699]',
    iconBgColor: 'bg-[#E6F7F6]',
    href: '/dashboard2/rooms',  // May need new route
  },
  {
    key: 'tagCount',
    label: 'Tags',
    icon: Tag,
    iconColor: 'text-[#484848]',
    iconBgColor: 'bg-gray-100',
    href: '/dashboard2/tags',   // May need new route
  },
];
```

**Update StatCard to be clickable:**
```typescript
import Link from 'next/link';

function StatCard({ config, value }: StatCardProps) {
  const Icon = config.icon;

  return (
    <Link
      href={config.href}
      className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4
                 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer
                 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
      role="button"
      aria-label={`View ${config.label}: ${value}`}
    >
      {/* Icon Container */}
      <div className={`p-3 rounded-xl ${config.iconBgColor}`}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
      </div>

      {/* Value and Label */}
      <div className="flex-1">
        <p className="text-[32px] font-bold text-[#222222] leading-tight">
          {value}
        </p>
        <p className="text-sm text-[#717171]">
          {config.label}
        </p>
      </div>

      {/* Chevron indicator for clickability */}
      <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
    </Link>
  );
}
```

#### Task 3.2: Create placeholder routes for Rooms and Tags

**Files to create:**
- `src/app/dashboard2/rooms/page.tsx` (if not exists)
- `src/app/dashboard2/tags/page.tsx` (if not exists)

These can initially redirect to items with a filter or show a placeholder.

- [ ] Add href to StatCardConfig interface
- [ ] Update cardConfigs with navigation targets
- [ ] Make StatCard a clickable Link component
- [ ] Add hover/focus states and chevron indicator
- [ ] Create rooms and tags route placeholders if needed

---

### Phase 4: Update Navigation Menu (ITEM-04) - MEDIUM Priority

**Goal:** Update nav menu with new structure: Dashboard, Items, Instructions, Properties.

#### Task 4.1: Update navigationItems in layout

**File:** `src/app/dashboard2/layout.tsx`

**Current state (lines 28-32):**
```typescript
const navigationItems = [
  { name: 'Home', href: '/dashboard2', icon: Home },
  { name: 'My Items', href: '/dashboard2/items', icon: Package },
  { name: 'My Properties', href: '/dashboard2/properties', icon: Building2 },
];
```

**Target state:**
```typescript
import { LayoutDashboard, Package, FileText, Building2 } from 'lucide-react';

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
    name: 'Instructions',
    mobileLabel: 'Instr.',
    href: '/dashboard2/instructions',  // NEW
    icon: FileText
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2  // Keep Building2 (house-like)
  },
];
```

#### Task 4.2: Add mobile label display logic

```tsx
{navigationItems.map((item) => {
  const Icon = item.icon;
  return (
    <button key={item.name} /* ... */>
      <Icon className="w-4 h-4 mr-2" />
      {/* Desktop: full label, Mobile: abbreviated */}
      <span className="hidden md:inline">{item.name}</span>
      <span className="md:hidden">{item.mobileLabel || item.name}</span>
    </button>
  );
})}
```

#### Task 4.3: Create Instructions page

**File:** `src/app/dashboard2/instructions/page.tsx`

```tsx
'use client';

export default function InstructionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Instructions</h1>
      <p className="text-gray-600">
        View and manage all instructions across your items.
      </p>
      {/* Future: List of all articles/instructions */}
    </div>
  );
}
```

- [ ] Update navigationItems with new structure
- [ ] Change Dashboard icon from Home to LayoutDashboard
- [ ] Add mobile labels support
- [ ] Create Instructions page placeholder

---

### Phase 5: Fix Data Model - Separate Item from Article (ITEM-02) - CRITICAL Priority

**Goal:** Establish correct conceptual separation between Items and Articles.

This is a significant architectural change. For this iteration, we'll make UI-level changes to display correctly while planning the database migration separately.

#### Task 5.1: Update type definitions

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

Add Article type and update SessionItem:

```typescript
/**
 * An Article/Instruction associated with an Item.
 * Multiple articles can exist per item.
 */
export interface Article {
  /** Unique article identifier */
  id: string;
  /** Article title (equals purpose label, e.g., "How to Clean") */
  title: string;
  /** Purpose type that determines the article title */
  purpose: PurposeType;
  /** Content pieces for this article */
  content: ContentPiece[];
  /** When the article was created */
  createdAt: Date;
}

/**
 * A physical Item that gets ONE QR code.
 * Updated to separate item name from article content.
 */
export interface SessionItem {
  /** Unique item identifier (UUID) */
  id: string;
  /** Physical item name (e.g., "Cabinets", "Fridge") - appears on QR code */
  name: string;
  /** Room where the item is located */
  room: RoomType;
  /** Item type category */
  itemType: ItemType;
  /** When the item was created */
  createdAt: Date;
  /** Generated QR code URL (populated after save) */
  qrCodeUrl?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Articles/instructions for this item */
  articles?: Article[];

  // Legacy field - kept for compatibility
  /** @deprecated Use articles[].content instead */
  content?: ContentPiece[];
}
```

#### Task 5.2: Update CurrentItemState

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

```typescript
export interface CurrentItemState {
  /** Selected room */
  room: RoomType;
  /** Selected item type */
  itemType: ItemType;
  /** Physical item name only (e.g., "Cabinets") */
  specificItem: string;
  /** Physical item name - equals specificItem, shown on QR code */
  itemName: string;
  /** Current article being created */
  currentArticle: {
    /** Article title derived from purpose (e.g., "How to Clean") */
    title: string;
    /** Purpose selection */
    purpose: PurposeType | null;
    /** Content pieces for this article */
    content: ContentPiece[];
  };
  /** Content source for current article */
  contentSource: 'existing' | 'create-new';
  /** Selected content type for current piece */
  contentType: ContentType | null;
  /** Tags for the item */
  tags: string[];

  // Legacy fields - kept for compatibility
  /** @deprecated Use currentArticle.purpose */
  purpose?: PurposeType | null;
  /** @deprecated Use currentArticle.content */
  content?: ContentPiece[];
}
```

#### Task 5.3: Update PreviewSaveStep display

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

Display fields correctly:
- "Item Name" field: Shows physical item (e.g., "Cabinets")
- "Article Title" field: Shows purpose-derived title (e.g., "How to Clean")
- QR Code preview: Shows item name only

#### Task 5.4: Update QR code generation

**File:** `src/app/dashboard2/create/page.tsx` (handleSaveItem)

Ensure QR code label uses item name only, not article title.

- [ ] Add Article interface to types
- [ ] Update SessionItem with articles array
- [ ] Update CurrentItemState with currentArticle object
- [ ] Update PreviewSaveStep to show correct labels
- [ ] Ensure QR code uses item name only

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Step counter approach | Separate USER_VISIBLE_STEPS constant | Minimal code change, preserves internal navigation flow |
| Post-workflow header | Hide step counter, keep exit button | PRD says no step counter, but exit still useful |
| Card navigation | Next.js Link component | Better UX, prefetching, accessibility built-in |
| Mobile nav labels | CSS responsive classes | No JS needed, aligns with existing pattern |
| Data model update | Type-level changes first | DB migration is separate concern, UI can lead |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Step count logic breaks existing tests | Medium | High | Run test suite after each phase, update snapshots |
| Navigation menu layout shifts on mobile | Medium | Medium | Test on actual devices, use responsive grid |
| Data model changes affect save flow | High | High | Keep legacy fields for compatibility, migrate gradually |
| WhatsNextStep integration issues | Low | Medium | Component already exists, validate props interface |

---

## Recommended Implementation Order

1. **ITEM-05 (Phase 1)** - Fix step count first, as it affects testing baseline
2. **ITEM-03 (Phase 2)** - What's Next screen builds on step count fix
3. **ITEM-01 (Phase 3)** - Dashboard cards are independent, quick win
4. **ITEM-04 (Phase 4)** - Navigation update is medium priority
5. **ITEM-02 (Phase 5)** - Data model is most complex, do last

---

## Effort Estimate

| Phase | Description | Estimate | Confidence |
|-------|-------------|----------|------------|
| Phase 1 | Fix Step Count | 2-3 hours | High |
| Phase 2 | What's Next Screen | 1-2 hours | High |
| Phase 3 | Dashboard Cards | 1-2 hours | High |
| Phase 4 | Navigation Menu | 1-2 hours | High |
| Phase 5 | Data Model (UI only) | 3-4 hours | Medium |
| Testing & QA | All phases | 2-3 hours | Medium |
| **Total** | | **10-16 hours** | |

---

## Open Questions

1. **Rooms/Tags routes:** Do these routes exist? Should cards navigate to filtered item list instead?
2. **Instructions page:** What content should the Instructions page show? List of all articles across all items?
3. **Data model migration:** When should the database schema be updated to enforce Item -> Articles relationship?
4. **WhatsNextStep integration:** Should we use the existing component from ItemCapture or refactor NextActionStep?

---

## Testing Requirements

### Unit Tests to Update

- `src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts`
- `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/WorkflowHeader.test.tsx`

### Integration Tests to Update

- `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`
- `src/components/ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow.test.tsx`

### New Tests Needed

- StatisticsCards navigation tests
- Navigation menu mobile label tests
- Post-workflow header hiding tests

---

## References

- **Source PRD:** `docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-132632.md`
- **Related Plans:** Plan-094, Plan-106
- **Component Docs:** See JSDoc in each component file
- **Design System:** Airbnb DLS (colors, spacing documented in constants.ts)
