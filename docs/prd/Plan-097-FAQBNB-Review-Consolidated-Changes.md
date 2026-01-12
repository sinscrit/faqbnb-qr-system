# Implementation Plan: FAQBNB Review - Consolidated Changes

**Generated:** 2026-01-11 20:35:00 UTC
**Last Modified:** 2026-01-11 20:35:00 UTC
**Plan Number:** 097
**PRD Source:** `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-201535.md`

---

## Overview

This is a **consolidated implementation plan** for all 5 change requests identified during the FAQBNB application review session on 2026-01-11. The PRD contains requests ranging from UI/UX improvements to critical data model corrections.

**Priority Breakdown:**
- CRITICAL: 1 (REQ-2)
- HIGH: 3 (REQ-1, REQ-3, REQ-5)
- MEDIUM: 1 (REQ-4)

**Request Summary:**
| Request | Description | Priority | Type | Status |
|---------|-------------|----------|------|--------|
| REQ-1 | Make dashboard cards clickable | HIGH | UI/UX | **Plan-095 exists** |
| REQ-2 | Fix data model - separate Item from Article | CRITICAL | Data/Logic | **Plan-096 exists** |
| REQ-3 | Fix "What's Next" screen options | HIGH | UI/UX | **NEW** |
| REQ-4 | Update navigation menu structure | MEDIUM | Navigation | **NEW** |
| REQ-5 | Fix workflow step count (8 of 8) | HIGH | UI/Logic | **NEW** |

This plan focuses on REQ-3, REQ-4, and REQ-5 while providing integration guidance with existing plans.

---

## Technical Context

### Existing Stack
- **Framework:** Next.js 15.5.9 with React 19.1.0
- **Language:** TypeScript 5.x with strict mode
- **Styling:** Tailwind CSS v4
- **State Management:** Custom hooks (useReducer pattern)
- **Build Tool:** Next.js with Turbopack
- **UI Components:** Lucide React icons, Radix UI primitives
- **Testing:** Vitest + Testing Library
- **Relevant Existing Patterns:**
  - `/src/components/ItemCreationWorkflow/` - Multi-step workflow with state machine
  - `/src/components/RoleBasedNavigation.tsx` - Dashboard navigation component
  - `/src/components/DashboardLayout.tsx` - Layout wrapper with navigation
  - `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` - Target for REQ-3
  - `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` - Workflow state management

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | N/A | N/A | All requirements achievable with existing dependencies |

---

## Dependency Analysis

### Request Dependencies

```
REQ-2 (CRITICAL: Data Model Fix)
  └── Should be implemented FIRST - foundational change
      Existing Plan: Plan-096

REQ-5 (HIGH: Step Count Fix)
  ├── Depends on: REQ-2 (to understand final step is Save, not What's Next)
  └── Affects: Step counter display, progress bar

REQ-3 (HIGH: What's Next Options)
  ├── Depends on: REQ-5 (What's Next is no longer a numbered step)
  └── Affects: Post-workflow menu options

REQ-1 (HIGH: Dashboard Clickable Cards)
  └── Independent - can be done in parallel
      Existing Plan: Plan-095

REQ-4 (MEDIUM: Navigation Menu)
  └── Independent - can be done in parallel
```

### Recommended Implementation Order

1. **REQ-2** - Data Model Fix (Plan-096) - CRITICAL foundation
2. **REQ-5** - Step Count Fix - Aligns step counting with workflow reality
3. **REQ-3** - What's Next Options - Updates post-workflow menu
4. **REQ-1** - Dashboard Cards (Plan-095) - Independent, can parallel
5. **REQ-4** - Navigation Menu - Lowest priority, independent

---

## Architecture

### REQ-3: What's Next Screen - Component Changes

```
CURRENT:
┌─────────────────────────────────────────────┐
│            What's Next?                      │
│           Step 9 of 10                       │  <- WRONG: This is post-workflow
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ [✓] Review & Submit                 │    │  <- OK
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ [+] Add More Content                │    │  <- WRONG: Should be "Add New Instructions"
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ [X] Cancel                          │    │  <- WRONG: Nothing to cancel
│  └─────────────────────────────────────┘    │
│                                              │
│  [← Back]                                   │  <- WRONG: Can't go back after save
└─────────────────────────────────────────────┘

DESIRED:
┌─────────────────────────────────────────────┐
│           What's Next?                       │
│                                              │  <- NO step counter (post-workflow)
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ [✏️] Edit Instructions               │    │  <- Edit the article just created
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ [+] Add New Instructions            │    │  <- Different instructions for SAME item
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ [📦] Create New Item                 │    │  <- Start fresh with DIFFERENT item
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ [✓] Done                            │    │  <- Exit workflow completely
│  └─────────────────────────────────────┘    │
│                                              │
│                                              │  <- NO back arrow
└─────────────────────────────────────────────┘
```

### REQ-4: Navigation Menu - Structure Changes

```
CURRENT MENU (3 items):
┌──────────────────────────────────────────────────────────┐
│  [🏠 Home]     [📦 My Items]     [🏘️ My Properties]     │
└──────────────────────────────────────────────────────────┘

DESIRED MENU (4 items):
Desktop:
┌──────────────────────────────────────────────────────────────────────────┐
│  [📊 Dashboard]    [📦 Items]    [📄 Instructions]    [🏠 Properties]   │
└──────────────────────────────────────────────────────────────────────────┘

Mobile:
┌────────────────────────────────────────────────────────────────┐
│  [📊 D/B]    [📦 Items]    [📄 Instr.]    [🏠 Prop.]          │
└────────────────────────────────────────────────────────────────┘
```

### REQ-5: Step Count - Flow Changes

```
CURRENT WORKFLOW:
Step 1: Room Selection
Step 2: Item Type Selection
Step 3: Specific Item Selection
Step 4: Purpose Selection
Step 5: Content Type Selection
Step 6: Media Capture
Step 7: Preview & Save
Step 8: (Save Item)
Step 9: What's Next?        <- WRONG: This is post-workflow
Step 10: Session Summary    <- WRONG: This is post-workflow

DESIRED WORKFLOW:
Step 1: Room Selection
Step 2: Item Type Selection
Step 3: Specific Item Selection
Step 4: Purpose Selection
Step 5: Content Type Selection
Step 6: Media Capture
Step 7: Preview
Step 8: Save Item           <- FINAL STEP - Item Saved! with QR code

[Post-Workflow - NOT numbered]
- What's Next? menu (from REQ-3)
- Session Summary (optional)
```

---

## Integration Contract

### REQ-3: NextActionStep Props Interface (Updated)

```typescript
// src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx

export interface NextActionStepProps {
  /** Number of items created in this session */
  itemsCreated: number;
  /** The item that was just saved (for Edit and Add actions) */
  savedItem: {
    id: string;
    publicId: string;
    name: string;
    qrCodeUrl: string;
  };
  /** Callback when user selects "Edit Instructions" */
  onEditInstructions: () => void;
  /** Callback when user selects "Add New Instructions" (same item) */
  onAddNewInstructions: () => void;
  /** Callback when user selects "Create New Item" */
  onCreateNewItem: () => void;
  /** Callback when user selects "Done" */
  onDone: () => void;
  /** Optional CSS class name */
  className?: string;
}
```

### REQ-4: NavigationItem Type Updates

```typescript
// src/components/RoleBasedNavigation.tsx

export interface NavigationItem {
  name: string;           // Full name for desktop
  shortName?: string;     // Abbreviated for mobile (NEW)
  href: string;
  icon: string;           // Emoji icon
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}
```

### REQ-5: Step Count Configuration

```typescript
// src/components/ItemCreationWorkflow/utils/constants.ts

// Update step sequence - last numbered step is 'preview-save'
export const WORKFLOW_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'preview-save',             // Step 7
  'save-complete',            // Step 8 (NEW - final numbered step)
] as const;

// Post-workflow screens (NOT numbered)
export const POST_WORKFLOW_SCREENS = [
  'next-action',      // What's Next? menu
  'session-summary',  // Optional summary
] as const;

export const TOTAL_NUMBERED_STEPS = 8;  // Was 10
```

---

## Implementation Approach

### Phase 0: Execute Existing Plans (Reference)

#### Task 0.1: Implement Plan-095 (REQ-1 - Dashboard Cards)
- [ ] Follow Plan-095 implementation steps
- [ ] Make StatisticsCards clickable with navigation
- [ ] Test card navigation to Items/Rooms/Tags views
- **Effort:** 2.5 days (per Plan-095)

#### Task 0.2: Implement Plan-096 (REQ-2 - Data Model)
- [ ] Follow Plan-096 implementation steps
- [ ] Fix Item vs Article separation
- [ ] Update QR code labels to use Item name only
- **Effort:** 9-10 hours (per Plan-096)

---

### Phase 1: Fix Workflow Step Count (REQ-5)
**Priority:** HIGH | **Effort:** 0.5 day

#### Task 1.1: Update Step Constants
**File:** `/src/components/ItemCreationWorkflow/utils/constants.ts`

```typescript
// Update step definitions
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

// For backward compatibility
export const ALL_WORKFLOW_STEPS = [
  ...NUMBERED_WORKFLOW_STEPS,
  ...POST_WORKFLOW_SCREENS,
] as const;

export const TOTAL_NUMBERED_STEPS = NUMBERED_WORKFLOW_STEPS.length; // 8
```

#### Task 1.2: Update useWorkflowState Progress Calculation
**File:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

```typescript
// Update progress calculation
const getProgressPercent = (currentStep: WorkflowStep): number => {
  const stepIndex = NUMBERED_WORKFLOW_STEPS.indexOf(currentStep as any);

  // For numbered steps, calculate percentage
  if (stepIndex >= 0) {
    return Math.round(((stepIndex + 1) / TOTAL_NUMBERED_STEPS) * 100);
  }

  // Post-workflow screens show 100%
  return 100;
};

// Update step counter display logic
const isNumberedStep = (step: WorkflowStep): boolean => {
  return NUMBERED_WORKFLOW_STEPS.includes(step as any);
};
```

#### Task 1.3: Update WorkflowHeader Display
**File:** `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`

```typescript
// Conditionally show step counter only for numbered steps
<header className="flex items-center justify-between p-4 border-b">
  <button onClick={onBack} disabled={!canGoBack}>
    <ArrowLeft />
  </button>

  <div className="text-center">
    {isNumberedStep && (
      <p className="text-sm text-gray-500">
        Step {currentStepIndex + 1} of {TOTAL_NUMBERED_STEPS}
      </p>
    )}
    <h2 className="text-lg font-semibold">{stepTitle}</h2>
  </div>

  <button onClick={onClose}>Close</button>
</header>
```

#### Task 1.4: Update PreviewSaveStep as Final Step
**File:** `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

- Rename internal step to "Save Item" in UI
- Show "Step 8 of 8" (not 8 of 10)
- After save success, show "Item Saved!" with QR code
- "Continue" button leads to What's Next (unnumbered)

**Deliverables:**
- Step counter shows "Step X of 8" (not 10)
- Post-workflow screens have no step counter
- Save Item is clearly the final step

---

### Phase 2: Fix "What's Next" Screen (REQ-3)
**Priority:** HIGH | **Effort:** 1 day

#### Task 2.1: Remove Back Arrow and Cancel Button
**File:** `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

```typescript
// REMOVE the cancel card from cards array
const cards = [
  {
    key: 'edit-instructions',
    icon: <Edit className="w-6 h-6 text-blue-600" />,
    iconBgColor: 'bg-blue-100',
    title: 'Edit Instructions',
    description: 'Edit the instructions you just created',
    onClick: onEditInstructions,
  },
  {
    key: 'add-new-instructions',
    icon: <Plus className="w-6 h-6 text-green-600" />,
    iconBgColor: 'bg-green-100',
    title: 'Add New Instructions',
    description: 'Create different instructions for the same item',
    onClick: onAddNewInstructions,
  },
  {
    key: 'create-new-item',
    icon: <Package className="w-6 h-6 text-purple-600" />,
    iconBgColor: 'bg-purple-100',
    title: 'Create New Item',
    description: 'Start fresh with a different item',
    onClick: onCreateNewItem,
  },
  {
    key: 'done',
    icon: <Check className="w-6 h-6 text-gray-600" />,
    iconBgColor: 'bg-gray-100',
    title: 'Done',
    description: 'Exit the workflow',
    onClick: onDone,
  },
];
// REMOVED: Cancel card
```

#### Task 2.2: Remove Step Counter from Header
```typescript
// In NextActionStep, do NOT show step indicator
return (
  <div className="flex flex-col gap-6 p-4 md:p-6">
    {/* NO WorkflowHeader with step counter */}

    {/* Page Header - standalone */}
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-[#222222]">What's Next?</h2>
      <p className="text-[#717171] mt-2">
        Your item "{savedItem.name}" has been saved
      </p>
    </div>

    {/* Action Cards */}
    {/* ... */}
  </div>
);
```

#### Task 2.3: Update Props Interface
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
  // REMOVED: hasUnsavedContent (nothing to cancel)
  // REMOVED: onCancel (no cancel option)
  // REMOVED: onReviewSubmit (already saved)
  // REMOVED: onAddMoreContent (renamed to onAddNewInstructions)
}
```

#### Task 2.4: Wire Up New Callbacks in Parent
**File:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

```typescript
// Handle "Edit Instructions" - navigate to edit the just-saved article
const handleEditInstructions = useCallback(() => {
  if (state.lastSavedItem) {
    // Navigate to edit page for the saved item
    router.push(`/dashboard2/items/${state.lastSavedItem.publicId}/edit`);
  }
}, [state.lastSavedItem, router]);

// Handle "Add New Instructions" - create new article for same item
const handleAddNewInstructions = useCallback(() => {
  if (state.lastSavedItem) {
    // Reset to purpose selection with same item context
    goToStep('purpose-selection');
    // Keep specificItem, clear article/content state
  }
}, [state.lastSavedItem, goToStep]);

// Handle "Create New Item" - full reset
const handleCreateNewItem = useCallback(() => {
  reset();
  goToStep('room-selection');
}, [reset, goToStep]);

// Handle "Done" - exit workflow
const handleDone = useCallback(() => {
  onSessionComplete?.(state.session);
  router.push('/dashboard2');
}, [onSessionComplete, state.session, router]);
```

#### Task 2.5: Update Tests
**File:** `/src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`

- Remove tests for "Cancel" button
- Remove tests for back navigation
- Add tests for new 4-option structure
- Verify no step counter is rendered

**Deliverables:**
- 4 action cards: Edit, Add New Instructions, Create New Item, Done
- No Cancel button
- No back arrow
- No step counter on this screen

---

### Phase 3: Update Navigation Menu (REQ-4)
**Priority:** MEDIUM | **Effort:** 1 day

#### Task 3.1: Update Navigation Items Configuration
**File:** `/src/components/RoleBasedNavigation.tsx`

```typescript
const getNavigationItems = (): NavigationItem[] => {
  if (!user || !dashboardPermissions || permissionsLoading) return [];

  const items: NavigationItem[] = [];

  // Dashboard - icon changed from house to grid
  if (dashboardPermissions.canAccessDashboard) {
    items.push({
      name: 'Dashboard',
      shortName: 'D/B',
      href: '/dashboard',
      icon: 'LayoutDashboard',  // Changed from house icon
      description: 'Overview and key metrics',
      dashboardSection: DashboardSection.dashboard,
      requiredPermissions: [PERMISSIONS.ACCESS_DASHBOARD]
    });
  }

  // Items (removed "My" prefix)
  if (dashboardPermissions.canAccessItems) {
    items.push({
      name: 'Items',
      shortName: 'Items',
      href: '/dashboard/items',
      icon: 'Package',  // Box/cube icon
      description: 'Manage QR code items',
      dashboardSection: DashboardSection.items,
      requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
    });
  }

  // NEW: Instructions
  items.push({
    name: 'Instructions',
    shortName: 'Instr.',
    href: '/dashboard/instructions',  // NEW route needed
    icon: 'FileText',  // Document/list icon
    description: 'Manage item instructions',
    dashboardSection: DashboardSection.instructions,  // NEW section
    requiredPermissions: [PERMISSIONS.MANAGE_ITEMS]
  });

  // Properties (removed "My" prefix)
  if (dashboardPermissions.canAccessProperties) {
    items.push({
      name: 'Properties',
      shortName: 'Prop.',
      href: '/dashboard/properties',
      icon: 'Home',  // House/building icon
      description: 'Property management',
      dashboardSection: DashboardSection.properties,
      requiredPermissions: [PERMISSIONS.MANAGE_PROPERTIES]
    });
  }

  // ... rest unchanged (Analytics, System Admin)

  return items;
};
```

#### Task 3.2: Add Responsive Label Display
```typescript
// In navigation item rendering
{navigationItems.map((item) => (
  <button
    key={item.name}
    onClick={() => handleNavigation(item.href, item)}
    className={cn(
      'inline-flex items-center px-3 pt-4 pb-4 border-b-2 text-sm font-medium',
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    )}
  >
    <span className="mr-2">{getIcon(item.icon)}</span>
    {/* Show short name on mobile, full name on desktop */}
    <span className="hidden md:inline">{item.name}</span>
    <span className="md:hidden">{item.shortName || item.name}</span>
  </button>
))}
```

#### Task 3.3: Create Instructions Page (Stub)
**File:** `/src/app/dashboard/instructions/page.tsx`

```typescript
'use client';

/**
 * Instructions Page
 *
 * Lists all instructions/articles grouped by item.
 * NEW page added per REQ-4 navigation changes.
 *
 * @route /dashboard/instructions
 * @created 2026-01-11
 */

export default function InstructionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Instructions</h1>
      <p className="text-gray-600">
        View and manage all instructions across your items.
      </p>
      {/* TODO: Implement instructions list with article grouping */}
      <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-800">
          This page is under development. Instructions are currently
          managed through the Items section.
        </p>
      </div>
    </div>
  );
}
```

#### Task 3.4: Update Icon Imports
**File:** Add to imports in RoleBasedNavigation.tsx

```typescript
import {
  LayoutDashboard,  // For Dashboard (replaces Home icon usage)
  Package,          // For Items
  FileText,         // For Instructions
  Home,             // For Properties
  BarChart3,        // For Analytics
  Shield,           // For System Admin
} from 'lucide-react';
```

#### Task 3.5: Update DashboardSection Enum
**File:** `/src/types/permissions.ts`

```typescript
export enum DashboardSection {
  dashboard = 'dashboard',
  items = 'items',
  instructions = 'instructions',  // NEW
  properties = 'properties',
  analytics = 'analytics',
  systemAdmin = 'systemAdmin',
}
```

**Deliverables:**
- 4-item navigation: Dashboard, Items, Instructions, Properties
- Mobile-optimized short labels
- No "My" prefix
- Dashboard icon changed from house to grid
- New Instructions page (stub)

---

### Phase 4: Testing and Integration
**Priority:** HIGH | **Effort:** 0.5 day

#### Task 4.1: Update Existing Tests
- [ ] Fix tests that expect step count of 10
- [ ] Fix tests that expect "Cancel" in What's Next
- [ ] Add tests for new navigation structure

#### Task 4.2: Integration Testing
- [ ] Complete workflow from Room to Save (8 steps)
- [ ] Verify "Item Saved!" screen shows correctly
- [ ] Verify What's Next has 4 options (no Cancel)
- [ ] Verify navigation menu shows 4 items
- [ ] Test on mobile viewport

#### Task 4.3: Accessibility Testing
- [ ] Keyboard navigation through What's Next options
- [ ] Screen reader announcements for new nav items
- [ ] Focus management after save complete

#### Task 4.4: Update Documentation
- [ ] Update workflow step comments in all files
- [ ] Add @lastModified headers to changed files

**Deliverables:**
- All tests passing
- Manual verification complete
- Documentation updated

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Step count base | 8 numbered steps | Matches actual workflow - save is final action |
| What's Next as post-workflow | Not numbered | It's a menu after save, not a workflow step |
| Instructions as separate nav | New page | Clarifies data model separation (Item vs Article) |
| Mobile labels | Abbreviated | Space constraints on mobile devices |
| Dashboard icon | Grid (LayoutDashboard) | Avoids conflict with Properties "Home" icon |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing tests | High | Medium | Update tests in Phase 4 before merge |
| User confusion with new nav | Low | Medium | Instructions page explains relationship |
| Step count change affects progress persistence | Medium | Low | Progress stored by step name, not number |
| Instructions page incomplete | Low | Low | Stub page redirects to Items for now |

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| Phase 0: Plan-095 + Plan-096 | REQ-1, REQ-2 | 3.5 days | High |
| Phase 1: Step Count Fix (REQ-5) | Tasks 1.1-1.4 | 0.5 day | High |
| Phase 2: What's Next Fix (REQ-3) | Tasks 2.1-2.5 | 1 day | High |
| Phase 3: Navigation Menu (REQ-4) | Tasks 3.1-3.5 | 1 day | Medium |
| Phase 4: Testing & Integration | Tasks 4.1-4.4 | 0.5 day | High |
| **Total (excluding existing plans)** | | **3 days** | **High** |
| **Total (including existing plans)** | | **6.5 days** | **High** |

---

## Open Questions

1. **Instructions Page Scope:** Should the new Instructions page be a fully functional list view, or is a stub with redirect acceptable for initial release?

2. **Add New Instructions Flow:** When user selects "Add New Instructions" for the same item, should we skip Room/ItemType/SpecificItem selection since we know the item?

3. **Edit Instructions Navigation:** Should "Edit Instructions" open in-place editing or navigate to a separate page?

4. **Session Summary:** Is the Session Summary screen still needed after What's Next, or should "Done" exit directly to dashboard?

---

## References

- Source PRD: `/docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-201535.md`
- Related Plan-095: `/docs/prd/Plan-095-Make-Dashboard-Cards-Clickable.md`
- Related Plan-096: `/docs/prd/Plan-096-Fix-Data-Model-Separate-Item-From-Article.md`
- Workflow Component: `/src/components/ItemCreationWorkflow/`
- Navigation Component: `/src/components/RoleBasedNavigation.tsx`
- Existing NextActionStep: `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
- Workflow State Hook: `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

---

## Appendix A: File Change Summary

| File | REQ | Change Type | Description |
|------|-----|-------------|-------------|
| `utils/constants.ts` | REQ-5 | MODIFY | Update step count from 10 to 8 |
| `hooks/useWorkflowState.ts` | REQ-5 | MODIFY | Update progress calculation |
| `WorkflowHeader.tsx` | REQ-5 | MODIFY | Conditionally hide step counter |
| `PreviewSaveStep.tsx` | REQ-5 | MODIFY | Mark as final step |
| `NextActionStep.tsx` | REQ-3 | MAJOR | Replace 3 options with 4, remove cancel/back |
| `ItemCreationWorkflow.tsx` | REQ-3 | MODIFY | Wire new callbacks |
| `RoleBasedNavigation.tsx` | REQ-4 | MODIFY | Add Instructions, update labels/icons |
| `permissions.ts` | REQ-4 | MODIFY | Add instructions section |
| `instructions/page.tsx` | REQ-4 | NEW | Create stub page |

---

## Appendix B: Implementation Checklist

### Pre-Implementation
- [ ] Review and understand Plan-095 (REQ-1)
- [ ] Review and understand Plan-096 (REQ-2)
- [ ] Confirm Instructions page scope with stakeholders

### Implementation
- [ ] Phase 1: Fix workflow step count
- [ ] Phase 2: Update What's Next screen
- [ ] Phase 3: Update navigation menu
- [ ] Phase 4: Testing and documentation

### Post-Implementation
- [ ] All tests passing
- [ ] Manual verification on desktop and mobile
- [ ] Update PRD acceptance criteria
- [ ] Move PRD to completed folder
