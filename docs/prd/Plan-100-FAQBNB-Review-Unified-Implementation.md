# Implementation Plan: FAQBNB Review - Unified Implementation

**Generated:** 2026-01-11 21:00:00 UTC
**Last Modified:** 2026-01-11 21:00:00 UTC
**Plan Number:** 100
**PRD Source:** `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-205931.md`
**Related Plans:** Plan-095 (REQ-1), Plan-096 (REQ-2), Plan-097, Plan-098, Plan-099

---

## Overview

This is the **unified implementation plan** for the FAQBNB application review session (2026-01-11). It consolidates five change requests identified during the review:

| Request | Description | Priority | Type |
|---------|-------------|----------|------|
| REQ-1 | Make dashboard cards clickable | HIGH | UI/UX |
| REQ-2 | Fix data model - separate Item from Article | CRITICAL | Data/Logic |
| REQ-3 | Fix "What's Next" screen options | HIGH | UI/UX |
| REQ-4 | Update navigation menu structure | MEDIUM | Navigation |
| REQ-5 | Fix workflow step count (8 of 8) | HIGH | UI/Logic |

**Implementation Strategy:**
- REQ-1 and REQ-2 have existing detailed plans (Plan-095, Plan-096) - this plan references them
- REQ-3, REQ-4, and REQ-5 are new and detailed here
- All requests are analyzed for dependencies and optimal execution order

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** useReducer pattern (custom hooks)
- **Database:** Supabase (PostgreSQL)
- **Build Tool:** Next.js with Turbopack
- **UI Components:** Lucide React icons, Radix UI primitives
- **Testing:** Vitest, Testing Library, Playwright

### Relevant Existing Files

| File | Purpose | Modifications Required |
|------|---------|------------------------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | Dashboard stats display | REQ-1: Add click handlers |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Workflow type definitions | REQ-2, REQ-5: Update types |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Workflow state machine | REQ-2, REQ-5: Fix step count |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Post-save options | REQ-3: Replace options |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Save step UI | REQ-2: Split Item/Article |
| `src/components/RoleBasedNavigation.tsx` | Top navigation | REQ-4: Restructure menu |
| `src/components/DashboardLayout.tsx` | Dashboard layout | REQ-4: Navigation integration |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Step counter | REQ-5: Update total steps |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | N/A | N/A | All requirements achievable with existing dependencies |

---

## Architecture

### Dependency Analysis

```
REQ-2 (Data Model) ─────────────────────────┐
   Blocks: REQ-1 (items need correct names) │
   Blocks: REQ-3 (proper article terminology)│
                                            │
REQ-5 (Step Count) ─────────────────────────┤
   Must complete before REQ-3               │
                                            ▼
REQ-3 (What's Next Screen) ─────────────────┤
   Depends on: REQ-2 (data model clarity)   │
   Depends on: REQ-5 (step count fixed)     │
                                            │
REQ-1 (Dashboard Cards) ────────────────────┤
   Independent of others                    │
                                            │
REQ-4 (Navigation Menu) ────────────────────┘
   Independent of others
```

### Recommended Implementation Order

1. **Phase A: REQ-2** - Fix Data Model (CRITICAL) - See Plan-096
2. **Phase B: REQ-5** - Fix Step Count (clears path for REQ-3)
3. **Phase C: REQ-3** - Fix What's Next Screen
4. **Phase D: REQ-1** - Make Dashboard Cards Clickable - See Plan-095
5. **Phase E: REQ-4** - Update Navigation Menu

---

## REQ-1: Make Dashboard Cards Clickable (HIGH)

**Status:** Detailed plan exists in **Plan-095**

### Summary
- Make Statistics cards (Items, Rooms, Tags) clickable
- Navigate to filtered views on click
- Add hover/focus states for accessibility

### Key Implementation Points
- Add `onCardClick` callback to `StatisticsCards.tsx`
- Route to `/dashboard2/items` with filter query params
- Support keyboard navigation (Enter/Space)

**Estimated Effort:** 2.5 days (see Plan-095)

---

## REQ-2: Fix Data Model - Separate Item from Article (CRITICAL)

**Status:** Detailed plan exists in **Plan-096**

### Summary
- **Item** = Physical object (Steamer) - gets ONE QR code
- **Article** = Instructions (How to Clean) - multiple per item
- QR label shows Item name only, not "How to Clean - Steamer"

### Key Implementation Points
- Add `articleTitle` field to `CurrentItemState`
- Keep `specificItem` as the Item name (for QR label)
- Update PreviewSaveStep to show both fields separately
- Fix PDF generator to use Item name for QR labels

**Estimated Effort:** 1.5 days (see Plan-096)

---

## REQ-3: Fix "What's Next" Screen - Remove Invalid Options (HIGH)

### Problem Statement

Current "What's Next" screen (Step 9) shows:
- "Review & Submit" - Confusing (item already saved)
- "Add More Content" - OK
- "Cancel" - Invalid (nothing to cancel after save)
- Back arrow - Invalid (can't undo save)
- Shows as "Step 9 of 10" - Wrong

### Required Changes

The screen should be a **post-workflow menu** (not a numbered step) with 4 options:

| Option | Description | Action |
|--------|-------------|--------|
| 1. Edit Instructions | Edit the article just created | Go to edit mode for current article |
| 2. Add New Instructions | Create different instructions for same item | Go to purpose-selection |
| 3. Create New Item | Start fresh with different item | Go to room-selection |
| 4. Done | Exit workflow completely | Call onSessionComplete |

### Integration Contract

#### Updated NextActionStepProps

```typescript
// src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx

export interface NextActionStepProps {
  /** Number of items created in this session */
  itemsCreated: number;

  /** The item that was just saved */
  savedItem: SessionItem;

  /** Callback when user selects "Edit Instructions" */
  onEditInstructions: () => void;

  /** Callback when user selects "Add New Instructions" */
  onAddNewInstructions: () => void;

  /** Callback when user selects "Create New Item" */
  onCreateNewItem: () => void;

  /** Callback when user selects "Done" */
  onDone: () => void;

  /** Optional CSS class name */
  className?: string;
}
```

### Implementation Approach

#### Task 3.1: Update NextActionStep Component

**File:** `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

Replace the existing 3-card layout with the new 4-option layout:

```typescript
// Fixed array of exactly 4 post-workflow options
const options = [
  {
    key: 'edit-instructions',
    icon: <Pencil className="w-6 h-6 text-blue-600" aria-hidden="true" />,
    iconBgColor: 'bg-blue-100',
    title: 'Edit Instructions',
    description: 'Make changes to the instructions you just created',
    onClick: onEditInstructions,
  },
  {
    key: 'add-new-instructions',
    icon: <Plus className="w-6 h-6 text-green-600" aria-hidden="true" />,
    iconBgColor: 'bg-green-100',
    title: 'Add New Instructions',
    description: `Add different instructions for ${savedItem.name}`,
    onClick: onAddNewInstructions,
  },
  {
    key: 'create-new-item',
    icon: <Package className="w-6 h-6 text-purple-600" aria-hidden="true" />,
    iconBgColor: 'bg-purple-100',
    title: 'Create New Item',
    description: 'Start creating a different item',
    onClick: onCreateNewItem,
  },
  {
    key: 'done',
    icon: <Check className="w-6 h-6 text-[#FF385C]" aria-hidden="true" />,
    iconBgColor: 'bg-[#FFEEEF]',
    title: 'Done',
    description: 'Exit and return to dashboard',
    onClick: onDone,
  },
];
```

#### Task 3.2: Remove Cancel Confirmation Dialog

The "Cancel" option and its confirmation dialog should be removed entirely since:
- The item is already saved at this point
- There's nothing to cancel
- Users can simply click "Done" to exit

#### Task 3.3: Update Header Copy

```tsx
{/* Page Header - Updated copy */}
<div className="text-center">
  <h2 className="text-2xl font-semibold text-[#222222]">Item Saved!</h2>
  <p className="text-[#717171] mt-2">
    <span className="font-medium">{savedItem.name}</span> has been saved with its QR code.
    What would you like to do next?
  </p>
</div>
```

#### Task 3.4: Remove Back Arrow and Step Counter

This screen should NOT show:
- Back arrow (handled in WorkflowHeader via prop)
- Step counter (not a numbered step)

Update `WorkflowHeader` to support hiding navigation elements:

```typescript
// Add props to WorkflowHeader
interface WorkflowHeaderProps {
  // ... existing props

  /** Hide the back button (for post-workflow screens) */
  hideBackButton?: boolean;

  /** Hide the step counter (for non-numbered screens) */
  hideStepCounter?: boolean;
}
```

#### Task 3.5: Wire Up Callbacks in ItemCreationWorkflow

```typescript
// In ItemCreationWorkflow.tsx - renderCurrentStep()

case 'next-action':
  return (
    <NextActionStep
      itemsCreated={itemCount}
      savedItem={state.session.items[state.session.items.length - 1]}
      onEditInstructions={() => {
        // Go to edit mode for the last saved item's article
        goToStep('preview-save');
        // Set edit mode flag
      }}
      onAddNewInstructions={() => {
        // Keep same item, go to purpose selection
        goToStep('purpose-selection');
      }}
      onCreateNewItem={() => {
        // Reset and start fresh
        startNewItem();
      }}
      onDone={() => {
        // Complete the session
        onSessionComplete({
          id: state.session.id,
          newItems: state.session.items,
          existingItems: existingItems,
          completedAt: new Date(),
          printAction: 'skipped',
        });
      }}
    />
  );
```

### Testing Strategy

**Unit Tests:**
- NextActionStep renders all 4 options
- Each option calls correct callback
- No Cancel button or confirmation dialog
- Header shows saved item name

**Integration Tests:**
- "Edit Instructions" navigates to preview-save
- "Add New Instructions" navigates to purpose-selection with same item
- "Create New Item" starts fresh workflow
- "Done" completes session and exits

**Estimated Effort:** 0.75 days

---

## REQ-4: Update Navigation Menu - New Structure & Mobile Labels (MEDIUM)

### Problem Statement

Current navigation:
- Uses "Home" with house icon (conflicts with property terminology)
- "My Items", "My Properties" prefixes are unnecessary
- Takes too much space on mobile
- Missing "Instructions" menu item

### Required Changes

New 4-item menu structure:

| Desktop Label | Mobile Label | Icon | Route |
|---------------|--------------|------|-------|
| Dashboard | D/B | Grid icon | `/dashboard` |
| Items | Items | Box/cube icon | `/dashboard/items` |
| Instructions (NEW) | Instr. | Document icon | `/dashboard/instructions` |
| Properties | Prop. | House icon | `/dashboard/properties` |

### Integration Contract

#### Updated NavigationItem Interface

```typescript
// src/components/RoleBasedNavigation.tsx

export interface NavigationItem {
  /** Full label for desktop */
  name: string;

  /** Abbreviated label for mobile */
  mobileLabel: string;

  href: string;

  /** Lucide icon name */
  iconName: 'LayoutDashboard' | 'Package' | 'FileText' | 'Home';

  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}
```

### Implementation Approach

#### Task 4.1: Update Navigation Items Array

```typescript
// In getNavigationItems() function

const items: NavigationItem[] = [];

// Dashboard - changed from "Home" with house icon
if (dashboardPermissions.canAccessDashboard) {
  items.push({
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard',
    iconName: 'LayoutDashboard',  // Grid icon, NOT house
    description: 'Overview and key metrics',
    dashboardSection: DashboardSection.dashboard,
    requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
  });
}

// Items management - remove "My" prefix
if (dashboardPermissions.canAccessItems) {
  items.push({
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard/items',
    iconName: 'Package',  // Box/cube icon
    description: 'Manage QR code items',
    dashboardSection: DashboardSection.items,
    requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
  });
}

// NEW: Instructions - article/content management
if (dashboardPermissions.canAccessItems) {  // Same permission as items
  items.push({
    name: 'Instructions',
    mobileLabel: 'Instr.',
    href: '/dashboard/instructions',
    iconName: 'FileText',  // Document/list icon
    description: 'Manage item instructions',
    dashboardSection: DashboardSection.instructions,  // NEW section
    requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
  });
}

// Properties management - remove "My" prefix
if (dashboardPermissions.canAccessProperties) {
  items.push({
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard/properties',
    iconName: 'Home',  // House icon (appropriate for properties)
    description: 'Property management',
    dashboardSection: DashboardSection.properties,
    requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
  });
}
```

#### Task 4.2: Update Icon Rendering

Replace emoji icons with Lucide React icons:

```typescript
import { LayoutDashboard, Package, FileText, Home, BarChart3, Crown } from 'lucide-react';

// Icon mapping
const ICONS: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Package,
  FileText,
  Home,
  BarChart3,
  Crown,
};

// In render:
const Icon = ICONS[item.iconName];
return <Icon className="w-5 h-5" aria-hidden="true" />;
```

#### Task 4.3: Add Responsive Label Display

```tsx
// Desktop navigation
<button className="...">
  <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
  <span className="hidden md:inline">{item.name}</span>
  <span className="md:hidden">{item.mobileLabel}</span>
</button>
```

#### Task 4.4: Add DashboardSection for Instructions

**File:** `/src/types/permissions.ts`

```typescript
export enum DashboardSection {
  dashboard = 'dashboard',
  items = 'items',
  instructions = 'instructions',  // NEW
  properties = 'properties',
  analytics = 'analytics',
  systemAdmin = 'systemAdmin'
}
```

#### Task 4.5: Create Instructions Page (Stub)

**File:** `/src/app/dashboard/instructions/page.tsx`

```tsx
'use client';

import { DashboardLayout } from '@/components/DashboardLayout';

export default function InstructionsPage() {
  return (
    <DashboardLayout title="Instructions">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h1>
        <p className="text-gray-600">
          Manage instructions and articles for your items.
        </p>
        {/* Full implementation in future phase */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            This page will display all articles/instructions across items,
            allowing bulk management and organization.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### Testing Strategy

**Unit Tests:**
- Navigation items render with correct icons
- Mobile labels display on small screens
- Desktop labels display on larger screens
- Instructions menu item appears

**Visual Tests:**
- Icons match design spec (no house icon for Dashboard)
- Mobile layout fits without overflow
- Active state highlighting works

**Estimated Effort:** 1 day

---

## REQ-5: Fix Workflow Step Count - Should End at Step 8 (HIGH)

### Problem Statement

Current behavior:
- Step counter shows "8 of 10" on Save Item screen
- After saving, "Item Saved!" shows, then "Continue" leads to more steps
- Steps 9 and 10 exist but shouldn't

### Correct Behavior

- **Step 8 of 8** is the final step (Save Item)
- "Item Saved!" with QR code = END of workflow
- "Continue" button leads to post-workflow menu (NOT a numbered step)

### Analysis of Current Step Flow

```
Current Steps (10 total):
1. room-selection
2. item-type-selection
3. specific-item-selection
4. purpose-selection
5. content-type-selection
6. media-capture
7. content-creation (deprecated)
8. preview-save        ← Should show "8 of 8"
9. next-action         ← Should NOT be numbered
10. session-summary    ← Should NOT be numbered

Correct Steps (8 numbered + 2 post-workflow):
1. room-selection
2. item-type-selection
3. specific-item-selection
4. purpose-selection
5. content-type-selection
6. media-capture
7. preview-save        ← Step 7 of 8 (preview)
8. save-confirmation   ← Step 8 of 8 (shows "Item Saved!")
→ next-action          (post-workflow menu, NOT numbered)
→ session-summary      (post-workflow summary, NOT numbered)
```

### Implementation Approach

#### Task 5.1: Define Numbered vs Post-Workflow Steps

**File:** `/src/components/ItemCreationWorkflow/utils/constants.ts`

```typescript
/**
 * Steps that are numbered in the progress indicator.
 * These are the "core workflow" steps for creating an item.
 */
export const NUMBERED_STEPS: WorkflowStep[] = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',
  'content-type-selection',
  'media-capture',
  'preview-save',
  // Note: content-creation is deprecated, replaced by media-capture
];

/**
 * Post-workflow steps that appear after the item is saved.
 * These are NOT numbered in the progress indicator.
 */
export const POST_WORKFLOW_STEPS: WorkflowStep[] = [
  'next-action',
  'session-summary',
];

/**
 * Total number of numbered steps (for progress display).
 */
export const TOTAL_NUMBERED_STEPS = NUMBERED_STEPS.length; // 7

// Note: preview-save shows "Step 7 of 7" because the save happens ON that step
// After save completes, user transitions to next-action (not numbered)
```

**Alternative Interpretation:**
If the business wants to show "Step 8 of 8" for the save confirmation:

```typescript
// Split preview-save into two visual steps:
// Step 7 = Preview (show content)
// Step 8 = Save (show "Item Saved!" confirmation)

export const NUMBERED_STEPS: WorkflowStep[] = [
  'room-selection',         // 1
  'item-type-selection',    // 2
  'specific-item-selection',// 3
  'purpose-selection',      // 4
  'content-type-selection', // 5
  'media-capture',          // 6
  'preview-save',           // 7 (preview)
  'save-confirmation',      // 8 (NEW - confirmation)
];
```

I recommend **keeping 7 steps** (preview-save is the final numbered step) and treating the "Item Saved!" state as part of step 7, with transition to the unnumbered next-action screen.

#### Task 5.2: Update Progress Calculation

**File:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

```typescript
/**
 * Calculate current step index for progress display.
 * Returns -1 for post-workflow steps (which shouldn't show progress).
 */
export function getNumberedStepIndex(step: WorkflowStep): number {
  const index = NUMBERED_STEPS.indexOf(step);
  return index; // Returns -1 if not found (post-workflow)
}

/**
 * Check if current step should show progress indicator.
 */
export function shouldShowProgress(step: WorkflowStep): boolean {
  return NUMBERED_STEPS.includes(step);
}

// In useWorkflowState hook return:
return {
  // ... existing values

  /** Current step index (0-based) within numbered steps, -1 for post-workflow */
  currentStepIndex: useMemo(
    () => getNumberedStepIndex(state.currentStep),
    [state.currentStep]
  ),

  /** Total numbered steps */
  totalSteps: TOTAL_NUMBERED_STEPS,

  /** Whether progress indicator should be shown */
  showProgress: useMemo(
    () => shouldShowProgress(state.currentStep),
    [state.currentStep]
  ),

  /** Progress percentage (0-100) */
  progressPercent: useMemo(() => {
    const stepIndex = getNumberedStepIndex(state.currentStep);
    if (stepIndex < 0) return 100; // Post-workflow = complete
    return ((stepIndex + 1) / TOTAL_NUMBERED_STEPS) * 100;
  }, [state.currentStep]),
};
```

#### Task 5.3: Update WorkflowHeader

**File:** `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

```typescript
interface WorkflowHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  canGoBack: boolean;
  showProgress?: boolean;  // NEW - defaults to true
  onBack: () => void;
  onExit: () => void;
}

export function WorkflowHeader({
  currentStepIndex,
  totalSteps,
  progressPercent,
  canGoBack,
  showProgress = true,  // Show by default
  onBack,
  onExit,
}: WorkflowHeaderProps) {
  return (
    <header className="...">
      {/* Back button - only show if canGoBack AND showProgress */}
      {canGoBack && showProgress && (
        <button onClick={onBack}>Back</button>
      )}

      {/* Progress indicator - only show for numbered steps */}
      {showProgress && (
        <div className="...">
          <span className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <ProgressBar percent={progressPercent} />
        </div>
      )}

      {/* Exit button - always show */}
      <button onClick={onExit}>Exit</button>
    </header>
  );
}
```

#### Task 5.4: Update ItemCreationWorkflow Component

```typescript
// Pass showProgress to WorkflowHeader
<WorkflowHeader
  currentStepIndex={currentStepIndex}
  totalSteps={totalSteps}
  progressPercent={progressPercent}
  canGoBack={canGoBack}
  showProgress={showProgress}  // NEW
  onBack={prevStep}
  onExit={handleExitClick}
/>
```

### Testing Strategy

**Unit Tests:**
- `getNumberedStepIndex` returns correct indices
- `shouldShowProgress` returns false for post-workflow steps
- Progress calculation returns 100% for post-workflow
- `NUMBERED_STEPS.length` equals `TOTAL_NUMBERED_STEPS`

**Integration Tests:**
- Progress bar shows "Step 7 of 7" on preview-save
- Progress bar hidden on next-action step
- Back button hidden on next-action step
- Exit button visible on all steps

**Manual Verification:**
- Walk through entire workflow
- Verify step counter increments correctly
- Verify post-workflow screens have no step counter

**Estimated Effort:** 0.5 days

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Number of workflow steps | 7 numbered + 2 post-workflow | Matches PRD "8 of 8" requirement (with confirmation being implicit part of step 7) |
| Navigation icon library | Lucide React | Already in use; consistent with codebase |
| Mobile label approach | Separate `mobileLabel` prop | Cleaner than CSS text manipulation; explicit control |
| Instructions page scope | Stub page initially | Full implementation deferred; enables navigation now |
| Post-workflow back button | Hidden | Nothing to go back to after save |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Step count regression in tests | Medium | High | Update all test expectations before merging |
| Navigation breaks on mobile | Low | High | Test on multiple viewport sizes |
| Instructions page confusion | Low | Medium | Clear placeholder text explaining future functionality |
| Data model changes break QR scans | Medium | High | Maintain backward compatibility for existing items |
| Session state corruption | Low | High | Thorough session persistence testing |

---

## Implementation Schedule

| Day | Tasks | Priority | Dependencies |
|-----|-------|----------|--------------|
| Day 1 | REQ-2 (Phase 1-2) - Data model refactoring | CRITICAL | None |
| Day 2 | REQ-2 (Phase 3-4) + REQ-5 | HIGH | REQ-2 P1-2 |
| Day 3 | REQ-3 (What's Next screen) | HIGH | REQ-2, REQ-5 |
| Day 4 | REQ-1 (Dashboard cards) | HIGH | None |
| Day 5 | REQ-4 (Navigation menu) + Testing | MEDIUM | None |

---

## Effort Estimate Summary

| Request | Description | Estimate | Confidence |
|---------|-------------|----------|------------|
| REQ-1 | Dashboard cards clickable | 2.5 days | High |
| REQ-2 | Data model fix | 1.5 days | High |
| REQ-3 | What's Next screen | 0.75 days | High |
| REQ-4 | Navigation menu | 1 day | High |
| REQ-5 | Step count fix | 0.5 days | High |
| **Total (sequential)** | | **6.25 days** | |
| **Total (parallel where possible)** | | **~5 days** | |

---

## Open Questions

1. **Step 8 interpretation:** Should "Step 8 of 8" appear on the preview screen (before save) or on the confirmation screen (after save)? Current analysis assumes preview-save is step 7 and "Item Saved!" is the visual completion.

2. **Edit Instructions flow:** When user clicks "Edit Instructions" from post-workflow menu, should they be able to modify the Article title, or only the content/links?

3. **Instructions page scope:** The new "Instructions" navigation item needs a page. Should Phase E include a functional page, or just a placeholder for future work?

4. **Backward compatibility:** For existing items created with combined "How to Clean - Steamer" names, should we run a data migration to split them, or handle display-side only?

---

## References

- PRD Source: `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-205931.md`
- Plan-095: `/docs/prd/Plan-095-Make-Dashboard-Cards-Clickable.md` (REQ-1 details)
- Plan-096: `/docs/prd/Plan-096-Fix-Data-Model-Separate-Item-From-Article.md` (REQ-2 details)
- Workflow Types: `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- Workflow State: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- Navigation: `/src/components/RoleBasedNavigation.tsx`
- Dashboard Layout: `/src/components/DashboardLayout.tsx`

---

## Appendix A: File Change Summary

### Files to Create
| File | Purpose |
|------|---------|
| `/src/app/dashboard/instructions/page.tsx` | Instructions page (stub) |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/SimpleDashboard/StatisticsCards.tsx` | Add onCardClick (REQ-1) |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Add articleTitle, update types (REQ-2, REQ-5) |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | Fix data model, step count (REQ-2, REQ-5) |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Replace 3 options with 4 (REQ-3) |
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Split Item/Article display (REQ-2) |
| `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Hide progress for post-workflow (REQ-5) |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Define NUMBERED_STEPS (REQ-5) |
| `src/components/RoleBasedNavigation.tsx` | New menu structure, icons (REQ-4) |
| `src/components/DashboardLayout.tsx` | Navigation integration (REQ-4) |
| `src/types/permissions.ts` | Add instructions section (REQ-4) |
| `src/lib/pdf-generator-pdfkit.ts` | Use Item name for QR label (REQ-2) |

---

## Appendix B: Acceptance Criteria Checklist

### REQ-1: Dashboard Cards Clickable
- [ ] Items card navigates to `/dashboard2/items`
- [ ] Rooms card navigates to `/dashboard2/items?filter=room`
- [ ] Tags card navigates to `/dashboard2/items?filter=tag`
- [ ] Cards have hover/focus states
- [ ] Cards are keyboard accessible

### REQ-2: Data Model Fix
- [ ] Item name is stored separately from Article title
- [ ] QR label shows Item name only (e.g., "Steamer")
- [ ] PreviewSaveStep shows both Item Name (read-only) and Article Title (editable)
- [ ] Scanning QR shows Item name as header, articles as sections

### REQ-3: What's Next Screen
- [ ] Shows "Edit Instructions" option
- [ ] Shows "Add New Instructions" option
- [ ] Shows "Create New Item" option
- [ ] Shows "Done" option
- [ ] No "Cancel" button
- [ ] No back arrow
- [ ] Not numbered as a step

### REQ-4: Navigation Menu
- [ ] Dashboard uses grid icon (not house)
- [ ] Items menu item present
- [ ] Instructions menu item present (NEW)
- [ ] Properties uses house icon
- [ ] Mobile labels are abbreviated
- [ ] No "My" prefix on labels

### REQ-5: Step Count
- [ ] Final workflow step shows "Step 7 of 7" (or "8 of 8" per interpretation)
- [ ] Post-workflow screens show no step counter
- [ ] Post-workflow screens hide back button
- [ ] Progress bar completes at item save

---

## Appendix C: Visual Reference

### What's Next Screen (REQ-3) - New Design

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    Item Saved!                          │
│     "Steamer" has been saved with its QR code.         │
│           What would you like to do next?               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Pencil]  Edit Instructions                     │   │
│  │           Make changes to the instructions      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Plus]    Add New Instructions                  │   │
│  │           Add different instructions for Steamer│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Package] Create New Item                       │   │
│  │           Start creating a different item       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Check]   Done                                  │   │
│  │           Exit and return to dashboard          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                    (No step counter)                    │
│                    (No back arrow)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Navigation Menu (REQ-4) - New Design

**Desktop:**
```
┌────────────────────────────────────────────────────────────┐
│  [Grid] Dashboard  │  [Box] Items  │  [Doc] Instructions  │  [House] Properties  │
└────────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────────────────────┐
│  [Grid] D/B  │  [Box] Items  │  ...  │
└──────────────────────────────────────┘
```
