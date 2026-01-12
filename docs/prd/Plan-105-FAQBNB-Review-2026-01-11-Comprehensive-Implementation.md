# Implementation Plan: FAQBNB Review 2026-01-11 Comprehensive Changes

**Generated:** 2026-01-11 23:30:00
**Last Modified:** 2026-01-11 23:30:00
**Source PRD:** docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-231607.md
**Plan ID:** Plan-105

---

## Overview

This plan addresses 5 change requests from the FAQBNB Application Review session dated 2026-01-11. The changes span UI/UX improvements, data model clarifications, navigation restructuring, and workflow optimizations. The implementation will follow a prioritized approach starting with the CRITICAL data model fix (REQ-2), followed by HIGH priority workflow and UI changes, and concluding with MEDIUM priority navigation updates.

---

## Technical Context

### Existing Stack
| Category | Technology |
|----------|------------|
| Framework | Next.js 15.5.9 with App Router |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x |
| State Management | React Context (AuthContext), Local component state |
| Build Tool | Next.js with Turbopack |
| UI Components | Radix UI primitives, Lucide React icons |
| Database | Supabase (PostgreSQL) |
| Testing | Vitest + Testing Library |

### Relevant Existing Patterns
- **Dashboard Layout**: `src/app/dashboard/layout.tsx` handles navigation with `RoleBasedNavigation` component
- **Item Capture Wizard**: `src/components/ItemCapture/` uses multi-step wizard pattern with `ProgressIndicator`
- **Data Types**: `src/types/index.ts` defines Item, ItemArticle, and related interfaces
- **Navigation**: `src/components/RoleBasedNavigation.tsx` manages role-based menu items

### New Dependencies Required
None - all required functionality can be implemented with existing dependencies.

---

## Request Analysis & Dependencies

### Request Summary

| REQ | Description | Priority | Type | Dependencies |
|-----|-------------|----------|------|--------------|
| REQ-2 | Fix data model - separate Item from Article | CRITICAL | Data/Logic | None (foundational) |
| REQ-1 | Make dashboard cards clickable | HIGH | UI/UX | None |
| REQ-3 | Fix "What's Next" screen options | HIGH | UI/UX | REQ-2, REQ-5 |
| REQ-5 | Fix workflow step count (8 of 8) | HIGH | UI/Logic | None |
| REQ-4 | Update navigation menu structure | MEDIUM | Navigation | None |

### Dependency Graph

```
REQ-2 (Data Model) ─────────┐
                            ├──▶ REQ-3 (What's Next Screen)
REQ-5 (Step Count) ─────────┘

REQ-1 (Dashboard Cards) ────▶ Independent
REQ-4 (Navigation Menu) ────▶ Independent
```

### Recommended Implementation Order

1. **Phase 0**: REQ-2 - Data Model Clarification (CRITICAL foundation)
2. **Phase 1**: REQ-5 - Workflow Step Count Fix (required for REQ-3)
3. **Phase 2**: REQ-3 - What's Next Screen Redesign
4. **Phase 3**: REQ-1 - Dashboard Cards Clickable
5. **Phase 4**: REQ-4 - Navigation Menu Update

---

## Architecture

### Current vs. Required Data Model (REQ-2)

**Current Confusion:**
The UI currently displays "Article Title" as "How to Clean - Steamer" combining the purpose (article) with the item name, creating user confusion about the relationship between Items, Articles, and QR codes.

**Correct Data Model:**

```
┌─────────────────────────────────────────────────────────────────┐
│                           ITEM                                   │
│  • Physical object (Steamer, Fridge, Coffee Maker)              │
│  • Gets ONE QR code                                             │
│  • QR code label shows Item Name only                           │
├─────────────────────────────────────────────────────────────────┤
│                     ▼ Has Many                                   │
├─────────────────────────────────────────────────────────────────┤
│                         ARTICLES                                 │
│  • Instructions/content about the item                          │
│  • Has a Purpose/Title (e.g., "How to Clean")                   │
│  • Multiple articles per item allowed                           │
│  • Each article has associated media/links                       │
└─────────────────────────────────────────────────────────────────┘
```

**Database Already Supports This:**
The existing schema in `database/schema.sql` correctly separates:
- `items` table: Physical items with `name` field
- `item_articles` table: Articles with `purpose` and `title` fields linked to items via `item_id`

**The Issue is UI/UX:**
The ItemCapture workflow conflates these concepts in the MetadataStep UI.

### Component Structure for Changes

```
src/
├── components/
│   ├── ItemCapture/
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   └── ProgressIndicator.tsx   # REQ-5: Update step count
│   │   │   └── steps/
│   │   │       ├── MetadataStep.tsx        # REQ-2: Clarify Item Name vs Article
│   │   │       ├── ReviewStep.tsx          # REQ-2: Update labels
│   │   │       └── WhatsNextStep.tsx       # REQ-3: NEW - Post-save menu
│   │   ├── ItemCapture.tsx                 # REQ-5: Step flow changes
│   │   └── ItemCapture.types.ts            # REQ-3: New step type
│   ├── KPIDashboardOverview.tsx            # REQ-1: Clickable cards
│   ├── UserDashboard.tsx                   # REQ-1: Clickable cards
│   └── RoleBasedNavigation.tsx             # REQ-4: Menu structure
├── app/
│   └── dashboard/
│       └── layout.tsx                      # REQ-4: Navigation update
└── types/
    └── index.ts                            # Verify Item/Article types
```

---

## Detailed Implementation

### Phase 0: REQ-2 - Data Model UI Clarification

**Goal:** Ensure the UI clearly distinguishes between Items (physical objects) and Articles (instructions/content).

#### Task 0.1: Update MetadataStep Labels and Help Text

**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`

**Current State (line ~339-384):**
```tsx
{/* Title Field (Required) */}
<div>
  <label htmlFor={titleId} className="...">
    Item Name <span className="text-red-500">*</span>
  </label>
  <input
    placeholder="Enter item name... (e.g., Steamer, Coffee Maker)"
    ...
  />
  <p className="text-gray-500 text-xs mt-1">
    The physical item this QR code will be attached to
  </p>
</div>
```

**Note:** The label was already updated to "Item Name" in a recent change (REQ-2 Task 0.1 per file comment). However, we need to:

1. Add clearer explanation that distinguishes Item from Article purpose
2. Remove any remaining references to "Article Title" in the UI

**Required Changes:**
- Verify placeholder text emphasizes physical item names only
- Add helper text explaining: "This is the name of the physical item (e.g., 'Steamer'). Instructions like 'How to Clean' are captured separately as articles."
- Ensure the error message refers to "Item name" not "Title"

#### Task 0.2: Update ReviewStep to Show Correct Labels

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Current State (line ~421-425):**
```tsx
{/* Title */}
<div>
  <dt className="text-sm font-medium text-gray-500">Title</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

**Required Changes:**
- Change label from "Title" to "Item Name"
- Add a section for "Purpose/Article" if the workflow captures article info
- Ensure QR code preview shows only item name

#### Task 0.3: Add Article Purpose Field (Future Enhancement)

**Note:** The current ItemCapture workflow captures item metadata but doesn't explicitly capture the article "purpose" (e.g., "How to Clean"). This should be added in a future iteration. For now:

- The Item Name field should capture only the physical item name
- Article purpose will be set during content editing/organization

**Deferred to Future:** Add a "Content Purpose" dropdown in the capture flow

#### Task 0.4: Update QR Code Label Display

**Files to check:**
- `src/hooks/useQRCodeGeneration.ts`
- Any QR code preview/display components

**Required Changes:**
- Ensure QR code labels display Item Name only (not "Purpose - Item Name")
- Verify PDF export shows correct labels

---

### Phase 1: REQ-5 - Fix Workflow Step Count

**Goal:** Change step counter from "Step 8 of 10" to "Step 8 of 8". The Save Item action should be the final workflow step.

#### Task 1.1: Update Progress Stages Constant

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`

**Current State (line ~54-59):**
```tsx
export const PROGRESS_STAGES: StepDefinition[] = [
  { id: 'details', label: 'Details', shortLabel: '1' },
  { id: 'content', label: 'Content', shortLabel: '2' },
  { id: 'edit', label: 'Edit', shortLabel: '3' },
  { id: 'review', label: 'Review', shortLabel: '4' },
];
```

**Analysis:** The current progress stages show 4 stages, not 10. The "8 of 10" mentioned in the PRD may refer to a different implementation or the old wizard. Let's verify by examining where step numbers are displayed.

**Required Investigation:**
- Check if there's a separate step counter that shows "8 of 10"
- The current `ProgressIndicator` correctly maps multiple wizard steps to 4 display stages
- If the issue exists elsewhere, identify and fix that component

#### Task 1.2: Ensure Save Is Final Step

**File:** `src/components/ItemCapture/ItemCapture.tsx`

**Current Flow:**
```
metadata → content-type → [capture steps] → add-more → review → [submit]
```

The `review` step has a Submit button that calls `handleSubmit()`. After successful submission:
1. `onComplete(record)` is called
2. `reset()` is called

**Required Verification:**
- Confirm there are no additional steps after the submit action
- The "What's Next" screen (REQ-3) should be a POST-workflow menu, not part of the step flow

#### Task 1.3: Update Step Count in Mobile View

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`

**Current State (line ~115-127):**
```tsx
{/* Mobile: Simple progress bar */}
<div className="md:hidden">
  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
    <span>Step {currentIndex + 1} of {totalStages}</span>
    ...
  </div>
</div>
```

**Required Changes:**
- Ensure `totalStages` reflects the correct count (currently 4)
- No changes needed if the count is already correct

---

### Phase 2: REQ-3 - Fix "What's Next" Screen

**Goal:** Replace the current post-save flow with a clean menu that offers:
1. Edit Instructions - Edit the article just created
2. Add New Instructions - Create different instructions for same item
3. Create New Item - Start fresh with a different item
4. Done - Exit the workflow

**Also:** Remove Cancel button and back arrow (nothing to cancel after save).

#### Task 2.1: Create WhatsNextStep Component

**New File:** `src/components/ItemCapture/components/steps/WhatsNextStep.tsx`

```tsx
'use client';

/**
 * WhatsNextStep Component
 *
 * Post-save menu displayed after an item is successfully saved.
 * This is NOT a numbered workflow step - it's a post-workflow decision point.
 *
 * Options:
 * 1. Edit Instructions - Navigate to edit the article just created
 * 2. Add New Instructions - Create different instructions for same item
 * 3. Create New Item - Start fresh with a different item
 * 4. Done - Exit the workflow completely
 *
 * @module ItemCapture/components/steps/WhatsNextStep
 * @see REQ-3 from PRD CPL-FAQBNB-Review-2026-01-11
 */

import React from 'react';
import { Edit, PlusCircle, Package, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WhatsNextStepProps {
  /** The item that was just saved */
  savedItemId: string;
  savedItemName: string;
  /** Callback for Edit Instructions action */
  onEditInstructions: () => void;
  /** Callback for Add New Instructions action */
  onAddNewInstructions: () => void;
  /** Callback for Create New Item action */
  onCreateNewItem: () => void;
  /** Callback for Done action */
  onDone: () => void;
  /** Optional CSS class */
  className?: string;
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
}

function ActionCard({ icon, title, description, onClick, variant = 'default' }: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all w-full",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variant === 'primary'
          ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        variant === 'primary' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
      )}>
        {icon}
      </div>
      <div>
        <h3 className={cn(
          "font-semibold",
          variant === 'primary' ? "text-blue-900" : "text-gray-900"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm mt-1",
          variant === 'primary' ? "text-blue-700" : "text-gray-600"
        )}>
          {description}
        </p>
      </div>
    </button>
  );
}

export function WhatsNextStep({
  savedItemId,
  savedItemName,
  onEditInstructions,
  onAddNewInstructions,
  onCreateNewItem,
  onDone,
  className,
}: WhatsNextStepProps) {
  return (
    <div className={cn("flex flex-col items-center py-8 px-4", className)}>
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Item Saved!</h2>
        <p className="text-gray-600 mt-2">
          <span className="font-medium">{savedItemName}</span> has been saved successfully.
        </p>
        <p className="text-gray-500 text-sm mt-1">What would you like to do next?</p>
      </div>

      {/* Action Options */}
      <div className="w-full max-w-md space-y-3">
        <ActionCard
          icon={<Edit className="w-5 h-5" />}
          title="Edit Instructions"
          description="Review and modify the instructions you just created"
          onClick={onEditInstructions}
        />

        <ActionCard
          icon={<PlusCircle className="w-5 h-5" />}
          title="Add New Instructions"
          description={`Create different instructions for "${savedItemName}"`}
          onClick={onAddNewInstructions}
          variant="primary"
        />

        <ActionCard
          icon={<Package className="w-5 h-5" />}
          title="Create New Item"
          description="Start fresh with a different item"
          onClick={onCreateNewItem}
        />

        <div className="pt-4 border-t border-gray-200 mt-4">
          <button
            type="button"
            onClick={onDone}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Done - Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default WhatsNextStep;
```

#### Task 2.2: Add WhatsNextStep to Wizard Types

**File:** `src/components/ItemCapture/ItemCapture.types.ts`

**Current State (line ~246-256):**
```tsx
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
  | 'review';
```

**Required Changes:**
- Add `'whats-next'` to the WizardStep union type
- Note: This step should NOT be included in the progress counter

#### Task 2.3: Integrate WhatsNextStep into ItemCapture Flow

**File:** `src/components/ItemCapture/ItemCapture.tsx`

**Changes Required:**

1. Import the new component
2. Update `handleSubmit` to transition to 'whats-next' instead of calling `reset()`
3. Add rendering logic for the 'whats-next' step
4. Implement the callback handlers

```tsx
// After successful submission:
// OLD:
onComplete(record);
reset();

// NEW:
onComplete(record);
goToStep('whats-next');
// Store savedItemId and savedItemName in state for the next screen
```

#### Task 2.4: Ensure No Navigation Controls on WhatsNextStep

The WhatsNextStep component should:
- NOT have a back button (can't undo a save)
- NOT have a cancel button (nothing to cancel)
- NOT be part of the numbered progress indicator
- Only show the 4 action options

**File:** `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`

**Changes:**
- Update `STEP_TO_STAGE_INDEX` to NOT include 'whats-next' (or map it to -1)
- Or: Hide the progress indicator entirely when on 'whats-next' step

---

### Phase 3: REQ-1 - Make Dashboard Cards Clickable

**Goal:** Dashboard summary cards (Items, Rooms, Properties) should navigate to their respective list views when clicked.

#### Task 3.1: Update KPIDashboardOverview Cards

**File:** `src/components/KPIDashboardOverview.tsx`

**Current State (line ~36-55):**
The KPICard component is a static display component.

**Required Changes:**

1. Add optional `href` or `onClick` prop to KPICard
2. Wrap card content in a clickable element when href/onClick is provided
3. Add hover states for interactive cards

```tsx
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean; };
  loading?: boolean;
  href?: string;        // NEW: Navigation target
  onClick?: () => void; // NEW: Click handler alternative
}

function KPICard({ title, value, subtitle, icon, trend, loading, href, onClick }: KPICardProps) {
  const isClickable = !!href || !!onClick;

  const cardContent = (/* existing content */);

  if (href) {
    return (
      <Link href={href} className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
        isClickable && "hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
      )}>
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(/* styles */)}>
        {cardContent}
      </button>
    );
  }

  return <div className="...">{cardContent}</div>;
}
```

#### Task 3.2: Wire Up Navigation Links

**File:** `src/components/KPIDashboardOverview.tsx`

**Update the KPI Cards section (line ~359-389):**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <KPICard
    title="Total Properties"
    value={analyticsData?.overview?.totalProperties || 0}
    subtitle="Across all accounts"
    icon={<Building2 className="w-6 h-6" />}
    loading={loading}
    href="/dashboard/properties"  // NEW
  />
  <KPICard
    title="Total Items"
    value={analyticsData?.overview?.totalItems || 0}
    subtitle={`${analyticsData?.overview?.averageItemsPerProperty || 0} avg per property`}
    icon={<BarChart3 className="w-6 h-6" />}
    loading={loading}
    href="/dashboard/items"  // NEW
  />
  {/* ... other cards */}
</div>
```

#### Task 3.3: Update UserDashboard Cards

**File:** `src/components/UserDashboard.tsx`

**Current State (line ~151-181):**
Stats cards are defined but not clickable.

**Required Changes:**
- Add `href` to the statsCards array items
- Update card rendering to use Link component

```tsx
const statsCards = [
  {
    title: 'Properties',
    value: stats.totalProperties,
    subtitle: 'Total properties',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600',
    href: '/dashboard/properties'  // NEW
  },
  {
    title: 'Items',
    value: stats.totalItems,
    subtitle: `${stats.recentItems} created recently`,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600',
    href: '/dashboard/items'  // NEW
  },
  // ... other cards with appropriate hrefs
];
```

#### Task 3.4: Add Visual Feedback for Clickable Cards

**Required CSS/Styling:**
- Hover state: shadow increase, subtle border color change
- Active state: slight scale reduction
- Focus state: visible focus ring for accessibility
- Cursor: pointer

---

### Phase 4: REQ-4 - Update Navigation Menu

**Goal:** Restructure navigation with:
- Dashboard (D/B on mobile) - grid/dashboard icon (NOT house)
- Items - box/cube icon
- Instructions (NEW) - document/list icon
- Properties (Prop. on mobile) - house/building icon

**Also:** Remove "My" prefix, make mobile labels shorter.

#### Task 4.1: Update Navigation Items Configuration

**File:** `src/components/RoleBasedNavigation.tsx`

**Current Navigation Items (line ~57-124):**
```tsx
items.push({
  name: compactMode ? 'Home' : 'Dashboard',
  href: '/dashboard',
  icon: <LayoutDashboard className="h-5 w-5" />,
  ...
});
```

**Required Changes:**

```tsx
const getNavigationItems = (): NavigationItem[] => {
  const items: NavigationItem[] = [];

  // Dashboard - use LayoutDashboard icon (grid), not house
  if (dashboardPermissions.canAccessDashboard) {
    items.push({
      name: 'Dashboard',
      mobileName: 'D/B',  // NEW: Separate mobile label
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />, // Grid icon - CORRECT
      ...
    });
  }

  // Items - use Package icon (box/cube)
  if (dashboardPermissions.canAccessItems) {
    items.push({
      name: 'Items',
      mobileName: 'Items',
      href: '/dashboard/items',
      icon: <Package className="h-5 w-5" />, // Box icon - CORRECT
      ...
    });
  }

  // Instructions - NEW menu item with FileText icon
  if (dashboardPermissions.canAccessItems) { // Same permission as items
    items.push({
      name: 'Instructions',
      mobileName: 'Instr.',
      href: '/dashboard/instructions',  // NEW route needed
      icon: <FileText className="h-5 w-5" />, // Document icon
      ...
    });
  }

  // Properties - use Home icon (house/building)
  if (dashboardPermissions.canAccessProperties) {
    items.push({
      name: 'Properties',
      mobileName: 'Prop.',
      href: '/dashboard/properties',
      icon: <Home className="h-5 w-5" />, // House icon - CORRECT
      ...
    });
  }

  // Analytics - admin only
  // ... existing code
};
```

#### Task 4.2: Add Mobile Label Support

**File:** `src/components/RoleBasedNavigation.tsx`

**Update NavigationItem interface:**
```tsx
export interface NavigationItem {
  name: string;
  mobileName?: string;  // NEW: Shorter label for mobile
  href: string;
  icon: React.ReactNode;
  // ... other properties
}
```

**Update rendering to use mobileName on mobile:**
```tsx
// In DesktopNavigation:
<span>{item.name}</span>

// In MobileNavigation:
<span>{item.mobileName || item.name}</span>
```

#### Task 4.3: Update Dashboard Layout Navigation

**File:** `src/app/dashboard/layout.tsx`

**Current State (line ~93-112):**
```tsx
const getNavigationItems = () => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard /> },
    { name: 'Items', href: '/dashboard/items', icon: <Package /> },
  ];
  // ...
};
```

**Required Changes:**
- Align with RoleBasedNavigation changes
- Add Instructions menu item
- Update mobile labels

#### Task 4.4: Create Instructions Page (Placeholder)

**New File:** `src/app/dashboard/instructions/page.tsx`

This page will list articles/instructions grouped by item. For now, create a placeholder that redirects to items or shows grouped instructions.

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

export default function InstructionsPage() {
  // Placeholder - could show instructions grouped by item
  // or redirect to items page with instructions filter
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Instructions
      </h1>
      <p className="text-gray-600">
        View and manage instructions for your items.
      </p>
      {/* TODO: Implement instructions list view */}
    </div>
  );
}
```

---

## Integration Contracts

### WhatsNextStep Props Interface

```typescript
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

### Updated KPICard Props Interface

```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean; };
  loading?: boolean;
  href?: string;        // Navigation target
  onClick?: () => void; // Alternative click handler
}
```

### Updated NavigationItem Interface

```typescript
interface NavigationItem {
  name: string;
  mobileName?: string;  // Shorter label for mobile
  href: string;
  icon: React.ReactNode;
  description?: string;
  requiredPermissions?: PermissionKey[];
  dashboardSection?: DashboardSection;
  adminOnly?: boolean;
  systemAdminOnly?: boolean;
}
```

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| WhatsNext as Wizard Step | Add to WizardStep type but exclude from progress counter | Maintains state management consistency while preserving UX that it's "post-workflow" |
| Clickable Cards Implementation | Use Next.js Link component | Better than onClick for SEO and accessibility; maintains navigation state |
| Mobile Labels | Add `mobileName` property | Cleaner separation vs. conditional logic in templates |
| Instructions Page | Create route with placeholder | Establishes navigation pattern even before full implementation |
| Data Model Clarification | UI changes only | Database schema already correct; issue is presentation |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing wizard flow | Medium | High | Comprehensive testing of all wizard paths; preserve existing step transitions |
| Navigation state loss on card click | Low | Medium | Use Next.js Link; verify state preservation |
| Mobile responsiveness issues with new nav | Medium | Medium | Test on multiple viewport sizes; use responsive utilities |
| Instructions page scope creep | Medium | Low | Create minimal placeholder; defer full implementation |
| QR code label changes break existing QR codes | Low | High | Verify changes are display-only; existing QR URLs unchanged |

---

## Testing Plan

### Phase 0 (REQ-2) Testing
- [ ] Verify Item Name field clearly distinguishes from article purpose
- [ ] Verify error messages reference "Item name" correctly
- [ ] Verify QR code preview shows item name only
- [ ] Manual test: Create item and confirm labels are clear

### Phase 1 (REQ-5) Testing
- [ ] Verify step counter shows correct total
- [ ] Verify Save is final numbered step
- [ ] Test on mobile viewport for step count display

### Phase 2 (REQ-3) Testing
- [ ] Test all 4 What's Next options
- [ ] Verify no back button or cancel button present
- [ ] Verify progress indicator is hidden
- [ ] Test keyboard navigation for action cards
- [ ] Screen reader test for accessibility

### Phase 3 (REQ-1) Testing
- [ ] Click each dashboard card and verify navigation
- [ ] Verify hover/focus states on cards
- [ ] Test on both KPIDashboard and UserDashboard
- [ ] Verify loading state doesn't break clickability

### Phase 4 (REQ-4) Testing
- [ ] Verify all navigation items display correctly
- [ ] Test mobile labels (D/B, Instr., Prop.)
- [ ] Verify icons match requirements
- [ ] Test Instructions page placeholder
- [ ] Verify existing routes still work

---

## Effort Estimates

| Phase | Description | Estimate | Confidence |
|-------|-------------|----------|------------|
| Phase 0 | Data Model UI Clarification | 2-3 hours | High |
| Phase 1 | Workflow Step Count Fix | 1-2 hours | High |
| Phase 2 | What's Next Screen | 4-6 hours | Medium |
| Phase 3 | Dashboard Cards Clickable | 2-3 hours | High |
| Phase 4 | Navigation Menu Update | 3-4 hours | Medium |
| Testing | All phases | 2-3 hours | Medium |
| **Total** | **Full Implementation** | **14-21 hours** | Medium |

---

## Open Questions

1. **Instructions Page Full Implementation:** What should the Instructions page display? Options:
   - List all articles grouped by item
   - Redirect to Items page with filter
   - Standalone article management view

2. **What's Next - Edit Instructions:** Should this navigate to an inline editor or a separate edit page?

3. **Tag-based Rooms:** The PRD mentions "Rooms" in dashboard cards but the current system uses tags. Should "Rooms" be a first-class entity or remain as tags?

4. **Mobile Navigation Collapse:** Should the new 4-item navigation collapse differently on mobile?

---

## References

- Source PRD: `docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11-20260111-231607.md`
- Database Schema: `database/schema.sql`
- ItemCapture Types: `src/components/ItemCapture/ItemCapture.types.ts`
- RoleBasedNavigation: `src/components/RoleBasedNavigation.tsx`
- Dashboard Layout: `src/app/dashboard/layout.tsx`
- KPIDashboard: `src/components/KPIDashboardOverview.tsx`
- UserDashboard: `src/components/UserDashboard.tsx`
- ProgressIndicator: `src/components/ItemCapture/components/shared/ProgressIndicator.tsx`
