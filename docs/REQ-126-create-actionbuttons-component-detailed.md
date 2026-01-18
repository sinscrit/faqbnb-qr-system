# REQ-126: Create ActionButtons Component - Detailed Task Breakdown

**Document Created:** 2026-01-06 16:45:00 UTC
**Last Modified:** 2026-01-06 18:15:00 UTC
**Implementation Status:** COMPLETED
**Request Reference:** docs/gen_requests.md - REQ-126
**Overview Document:** docs/REQ-126-create-actionbuttons-component-overview.md
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 3, Task 3.1)
**PRD Reference:** PRD_Dashboard_2_Simple_Dashboard.md
**Design System Reference:** docs/prd/airbnb_designsystem.md

---

## Document Purpose

This document provides a granular, step-by-step task breakdown for implementing the ActionButtons component. Each task is designed to be approximately 1 story point (a few hours of focused work) and includes specific acceptance criteria and verification steps.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] Node.js development server can start (`npm run dev`) ✅
- [x] Existing `/src/components/SimpleDashboard/` directory exists ✅
- [x] `lucide-react` package is installed (v0.525.0) ✅
- [x] `/src/app/dashboard2/page.tsx` is accessible and readable ✅
- [x] `/src/contexts/AuthContext.tsx` exports `userProperties` in the context ✅

---

## Authorized Files and Functions

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `src/components/SimpleDashboard/ActionButtons.tsx` | Main ActionButtons component with ActionButton sub-component |

### Files to MODIFY

| File Path | Specific Changes |
|-----------|------------------|
| `src/components/SimpleDashboard/index.ts` | Add export for ActionButtons |
| `src/app/dashboard2/page.tsx` | Import ActionButtons, replace current card layout, remove Feature Highlights |

### Files to NOT MODIFY

| File Path | Reason |
|-----------|--------|
| `src/app/dashboard2/layout.tsx` | Already complete per Implementation Plan |
| `src/app/dashboard2/create/page.tsx` | Already complete |
| `src/app/dashboard2/items/page.tsx` | Already complete |
| `src/components/QRCodePrintManager.tsx` | Reuse as-is for future print flow |
| `src/contexts/AuthContext.tsx` | Only read from, do not modify |

---

## Task Breakdown

### Task 1: Create ActionButtons.tsx File Structure
**Estimate:** 0.5 story points (~1-2 hours)
**Dependencies:** None

#### Description
Create the initial file with proper header, imports, and TypeScript interfaces.

#### Implementation Steps

1. Create file at `src/components/SimpleDashboard/ActionButtons.tsx`

2. Add file header comment:
```typescript
// src/components/SimpleDashboard/ActionButtons.tsx
// REQ-126: Action Buttons Component for Dashboard Operations
// Created: [CURRENT_DATE]
// Last Modified: [CURRENT_DATE]
```

3. Add 'use client' directive (required for Next.js client components)

4. Add imports:
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Package, QrCode, LucideIcon } from 'lucide-react';
```

5. Define TypeScript interfaces:
```typescript
export interface ActionButtonsProps {
  onCreateClick?: () => void;
  onViewClick?: () => void;
  onPrintClick?: () => void;
  className?: string;
  disabled?: boolean;
}

interface ActionButtonConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary';
  onClick: () => void;
  ariaLabel: string;
}

interface ActionButtonProps {
  config: ActionButtonConfig;
  disabled?: boolean;
}
```

6. Add placeholder export:
```typescript
export function ActionButtons(props: ActionButtonsProps) {
  return <div>ActionButtons placeholder</div>;
}
```

#### Verification Steps
- [ ] File exists at `src/components/SimpleDashboard/ActionButtons.tsx`
- [ ] File has 'use client' directive
- [ ] All imports resolve without errors
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Interfaces are exported correctly

#### Acceptance Criteria
- File structure follows existing `StatisticsCards.tsx` pattern
- All TypeScript interfaces match overview document specifications
- No TypeScript compilation errors

---

### Task 2: Implement ActionButton Sub-Component
**Estimate:** 0.5 story points (~1-2 hours)
**Dependencies:** Task 1

#### Description
Create the individual ActionButton sub-component that renders a single button with icon and label.

#### Implementation Steps

1. Add the ActionButton component before the main export:
```typescript
function ActionButton({ config, disabled }: ActionButtonProps) {
  const Icon = config.icon;
  const isPrimary = config.variant === 'primary';

  const baseClasses = `
    flex items-center justify-center gap-2
    min-h-[48px] px-6 py-3.5
    rounded-lg font-medium text-base
    transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-[#222222] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = isPrimary
    ? `bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white
       hover:scale-[1.02] hover:brightness-95 active:scale-[0.98]`
    : `bg-white border border-[#222222] text-[#222222]
       hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]`;

  return (
    <button
      onClick={config.onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={config.ariaLabel}
    >
      <Icon className="w-5 h-5" />
      <span>{config.label}</span>
    </button>
  );
}
```

#### Verification Steps
- [ ] ActionButton accepts config and disabled props
- [ ] Icon renders with correct size (w-5 h-5)
- [ ] Label text displays next to icon
- [ ] Button has minimum height of 48px
- [ ] Focus state shows ring outline

#### Acceptance Criteria
- Sub-component follows the pattern from StatisticsCards (StatCard)
- Button meets 48x48px minimum touch target (via min-h-[48px] and padding)
- Icon and label have 8px gap (gap-2)

---

### Task 3: Implement Primary Button Styling
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Task 2

#### Description
Ensure the primary button (Create Item) has correct Airbnb DLS gradient styling.

#### Implementation Steps

1. Verify primary button uses these exact Tailwind classes:
```css
bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white
```

2. Add hover state:
```css
hover:scale-[1.02] hover:brightness-95
```

3. Add active/pressed state:
```css
active:scale-[0.98]
```

4. Test gradient renders correctly in browser

#### Verification Steps
- [ ] Gradient starts with #E61E4D (Radical Red)
- [ ] Gradient ends with #D70466 (cerise)
- [ ] Text is white (#FFFFFF)
- [ ] Hover state scales button to 1.02
- [ ] Hover state darkens gradient (brightness-95)
- [ ] Active state scales button to 0.98

#### Acceptance Criteria
- Primary button matches Airbnb DLS button specification
- Gradient is left-to-right
- Animations are smooth (200ms duration)

---

### Task 4: Implement Secondary Button Styling
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Task 2

#### Description
Ensure secondary buttons (View Items, Print QR Code) have correct Airbnb DLS styling.

#### Implementation Steps

1. Verify secondary button uses these exact Tailwind classes:
```css
bg-white border border-[#222222] text-[#222222]
```

2. Add hover state:
```css
hover:scale-[1.02] hover:bg-[#F7F7F7]
```

3. Add active/pressed state:
```css
active:scale-[0.98]
```

#### Verification Steps
- [ ] Background is white (#FFFFFF)
- [ ] Border is 1px solid #222222 (Mine Shaft)
- [ ] Text color is #222222
- [ ] Hover state scales button to 1.02
- [ ] Hover state changes background to #F7F7F7
- [ ] Active state scales button to 0.98

#### Acceptance Criteria
- Secondary buttons match Airbnb DLS outline button specification
- Border is visible and consistent
- Hover background provides visual feedback

---

### Task 5: Implement Main ActionButtons Component
**Estimate:** 0.5 story points (~1-2 hours)
**Dependencies:** Tasks 2, 3, 4

#### Description
Implement the main ActionButtons component with configuration-driven button rendering.

#### Implementation Steps

1. Implement the main component:
```typescript
export function ActionButtons({
  onCreateClick,
  onViewClick,
  onPrintClick,
  className = '',
  disabled = false,
}: ActionButtonsProps) {
  const router = useRouter();
  const { userProperties } = useAuth();

  const handlePrintQRCode = () => {
    if (onPrintClick) {
      onPrintClick();
      return;
    }

    // Property-based navigation per PRD Feature 2.3
    if (userProperties && userProperties.length === 1) {
      router.push(`/dashboard2/print/${userProperties[0].id}`);
    } else {
      router.push('/dashboard2/print');
    }
  };

  const buttonConfigs: ActionButtonConfig[] = [
    {
      key: 'create',
      label: 'Create New Item',
      icon: PlusCircle,
      variant: 'primary',
      onClick: onCreateClick || (() => router.push('/dashboard2/create')),
      ariaLabel: 'Create a new QR code item',
    },
    {
      key: 'view',
      label: 'View Items',
      icon: Package,
      variant: 'secondary',
      onClick: onViewClick || (() => router.push('/dashboard2/items')),
      ariaLabel: 'View all your items',
    },
    {
      key: 'print',
      label: 'Print QR Code',
      icon: QrCode,
      variant: 'secondary',
      onClick: handlePrintQRCode,
      ariaLabel: 'Print QR codes for your items',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {buttonConfigs.map((config) => (
        <ActionButton key={config.key} config={config} disabled={disabled} />
      ))}
    </div>
  );
}
```

#### Verification Steps
- [ ] Component renders 3 buttons
- [ ] Buttons are in a grid layout
- [ ] Create button is first (primary variant)
- [ ] View Items button is second (secondary variant)
- [ ] Print QR Code button is third (secondary variant)
- [ ] Each button has icon + label
- [ ] Configuration array drives rendering

#### Acceptance Criteria
- Three buttons render in correct order
- Configuration-driven approach matches StatisticsCards pattern
- useRouter and useAuth hooks are used correctly

---

### Task 6: Implement Navigation Handlers
**Estimate:** 0.5 story points (~1-2 hours)
**Dependencies:** Task 5

#### Description
Implement navigation logic for Create and View buttons.

#### Implementation Steps

1. Ensure Create button navigates to `/dashboard2/create`:
```typescript
onClick: onCreateClick || (() => router.push('/dashboard2/create'))
```

2. Ensure View button navigates to `/dashboard2/items`:
```typescript
onClick: onViewClick || (() => router.push('/dashboard2/items'))
```

3. Test navigation in browser by clicking buttons

#### Verification Steps
- [ ] Clicking "Create New Item" navigates to /dashboard2/create
- [ ] Clicking "View Items" navigates to /dashboard2/items
- [ ] Custom onCreateClick callback overrides default navigation
- [ ] Custom onViewClick callback overrides default navigation
- [ ] No console errors during navigation

#### Acceptance Criteria
- Navigation works without page reload (client-side routing)
- Optional callback props allow parent to override behavior

---

### Task 7: Implement Print QR Code Property Check Logic
**Estimate:** 0.5 story points (~1-2 hours)
**Dependencies:** Task 6

#### Description
Implement conditional navigation for Print QR Code based on user's property count per PRD Feature 2.3.

#### Implementation Steps

1. Access userProperties from AuthContext:
```typescript
const { userProperties } = useAuth();
```

2. Implement handlePrintQRCode function:
```typescript
const handlePrintQRCode = () => {
  // Allow custom handler to override
  if (onPrintClick) {
    onPrintClick();
    return;
  }

  // Property-based navigation per PRD Feature 2.3
  if (userProperties && userProperties.length === 1) {
    // Single property: Navigate directly to print flow
    router.push(`/dashboard2/print/${userProperties[0].id}`);
  } else {
    // Multiple properties or no properties: Show property selector
    router.push('/dashboard2/print');
  }
};
```

3. Note: The `/dashboard2/print` routes may not exist yet (created in Task 3.2-3.3 of Implementation Plan). The navigation should still work and will show 404 until routes are created.

#### Verification Steps
- [ ] userProperties is accessed from AuthContext
- [ ] Single property user navigates to /dashboard2/print/[propertyId]
- [ ] Multiple property user navigates to /dashboard2/print
- [ ] Zero property user navigates to /dashboard2/print
- [ ] Custom onPrintClick callback overrides default navigation

#### Acceptance Criteria
- Navigation logic correctly handles all property count scenarios
- Matches PRD Feature 2.3 requirements exactly

---

### Task 8: Update SimpleDashboard Barrel Export
**Estimate:** 0.1 story points (~15-30 minutes)
**Dependencies:** Task 5

#### Description
Add ActionButtons export to the SimpleDashboard index.ts barrel file.

#### Implementation Steps

1. Open `src/components/SimpleDashboard/index.ts`

2. Add export for ActionButtons:
```typescript
// src/components/SimpleDashboard/index.ts
// REQ-124: StatisticsCards Component
// REQ-126: ActionButtons Component
// Created: 2026-01-06 17:00:00 UTC
// Last Modified: [CURRENT_DATE]

export { StatisticsCards } from './StatisticsCards';
export type { StatisticsCardsProps } from './StatisticsCards';

export { ActionButtons } from './ActionButtons';
export type { ActionButtonsProps } from './ActionButtons';
```

#### Verification Steps
- [ ] index.ts exports ActionButtons
- [ ] index.ts exports ActionButtonsProps type
- [ ] Import `{ ActionButtons }` from `@/components/SimpleDashboard` works
- [ ] No TypeScript errors

#### Acceptance Criteria
- Clean barrel export following existing pattern
- Both component and props type are exported

---

### Task 9: Integrate ActionButtons into Dashboard Page
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Tasks 5, 8

#### Description
Add ActionButtons component to dashboard2/page.tsx.

#### Implementation Steps

1. Open `src/app/dashboard2/page.tsx`

2. Update imports (line 16):
```typescript
import { StatisticsCards, ActionButtons } from '@/components/SimpleDashboard';
```

3. Add ActionButtons after StatisticsCards section (after line 35):
```typescript
{/* Statistics Cards */}
<StatisticsCards stats={stats} isLoading={isLoading} error={error} />

{/* Action Buttons */}
<ActionButtons />
```

#### Verification Steps
- [ ] ActionButtons imports without errors
- [ ] ActionButtons renders below StatisticsCards
- [ ] All three buttons are visible
- [ ] Layout looks correct (3 buttons in row on desktop)

#### Acceptance Criteria
- Component renders in correct position
- No visual overlap with other sections

---

### Task 10: Remove Current 2-Card Layout
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Task 9

#### Description
Remove the existing 2-card grid layout (lines 37-81 of current page.tsx).

#### Implementation Steps

1. Open `src/app/dashboard2/page.tsx`

2. Locate the "Quick Actions" section (currently lines 37-81):
```typescript
{/* Quick Actions */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Create New Item Card */}
  ...
  {/* View Items Card */}
  ...
</div>
```

3. Remove the entire section (approximately 44 lines)

4. Ensure ActionButtons component from Task 9 replaces this section

#### Verification Steps
- [ ] Old 2-card layout is completely removed
- [ ] No orphaned code remains
- [ ] ActionButtons component is in place
- [ ] Page renders without errors
- [ ] Console shows no warnings

#### Acceptance Criteria
- Clean removal with no leftover code
- ActionButtons provides equivalent functionality

---

### Task 11: Remove Feature Highlights Section
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Task 10

#### Description
Remove the "Feature Highlights" section (lines 83-124 of current page.tsx) as it's not in the PRD.

#### Implementation Steps

1. Open `src/app/dashboard2/page.tsx`

2. Locate the "Feature Highlights" section (currently lines 83-124):
```typescript
{/* Feature Highlights */}
<div className="bg-white rounded-xl border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can do</h3>
  ...
</div>
```

3. Remove the entire section (approximately 42 lines)

4. Verify page structure is now:
   - Welcome Section
   - Statistics Cards
   - Action Buttons
   - (end of content)

#### Verification Steps
- [ ] Feature Highlights section is completely removed
- [ ] Page renders without errors
- [ ] No references to removed section remain
- [ ] Unused imports are removed (Sparkles icon may no longer be needed)

#### Acceptance Criteria
- Section removed cleanly
- No unused imports remain
- Page matches PRD layout

---

### Task 12: Add Responsive Styling
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Task 9

#### Description
Ensure ActionButtons component is fully responsive.

#### Implementation Steps

1. Verify grid classes are set correctly:
```typescript
className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}
```

2. Test at various breakpoints:
   - Mobile (<768px): Buttons stack vertically (1 column)
   - Tablet/Desktop (≥768px): Buttons in horizontal row (3 columns)

3. Verify touch targets are adequate on mobile:
   - min-h-[48px] ensures minimum height
   - Full-width buttons on mobile provide large tap area

#### Verification Steps
- [ ] Mobile view shows buttons stacked vertically
- [ ] Desktop view shows buttons in horizontal row
- [ ] Gap between buttons is 16px (gap-4)
- [ ] Buttons are equal width on desktop
- [ ] Touch targets are at least 48px tall
- [ ] No horizontal scroll on mobile

#### Acceptance Criteria
- Responsive behavior matches PRD wireframe
- Touch targets meet WCAG 2.5.5 requirements

---

### Task 13: Add Accessibility Attributes
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Task 5

#### Description
Ensure all accessibility requirements are met.

#### Implementation Steps

1. Verify each button has aria-label:
```typescript
aria-label={config.ariaLabel}
```

2. Verify focus states are visible:
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[#222222]
focus-visible:ring-offset-2
```

3. Test keyboard navigation:
   - Tab should move focus through all buttons
   - Enter/Space should activate focused button
   - Focus ring should be clearly visible

4. Add role if needed (buttons have implicit role="button")

#### Verification Steps
- [ ] All buttons have descriptive aria-labels
- [ ] Focus ring is visible when using keyboard navigation
- [ ] Tab order is logical (Create → View → Print)
- [ ] Enter key activates buttons
- [ ] Space key activates buttons
- [ ] Screen reader announces button labels correctly

#### Acceptance Criteria
- WCAG 2.1 AA compliant
- Fully keyboard navigable
- Screen reader accessible

---

### Task 14: Visual Testing and QA
**Estimate:** 0.5 story points (~1-2 hours)
**Dependencies:** All previous tasks

#### Description
Perform comprehensive visual and functional testing.

#### Implementation Steps

1. Start development server: `npm run dev`

2. Navigate to http://localhost:3000/dashboard2

3. Visual checks:
   - [ ] Three buttons visible
   - [ ] Create button has red gradient
   - [ ] View and Print buttons have white background with black border
   - [ ] Icons are visible on all buttons
   - [ ] Labels are readable
   - [ ] Spacing is consistent

4. Interaction checks:
   - [ ] Hover states work on all buttons
   - [ ] Active/click states show scale effect
   - [ ] Create button navigates to /dashboard2/create
   - [ ] View button navigates to /dashboard2/items
   - [ ] Print button navigates based on property count

5. Responsive checks (use browser dev tools):
   - [ ] Mobile (375px width): Buttons stacked
   - [ ] Tablet (768px width): Buttons in row
   - [ ] Desktop (1440px width): Buttons in row

6. Accessibility checks:
   - [ ] Tab through buttons
   - [ ] Verify focus ring visibility
   - [ ] Test with screen reader (optional)

#### Verification Steps
All items in Implementation Steps are verification steps.

#### Acceptance Criteria
- All visual checks pass
- All interaction checks pass
- All responsive checks pass
- All accessibility checks pass

---

### Task 15: Build Verification
**Estimate:** 0.25 story points (~30-60 minutes)
**Dependencies:** Task 14

#### Description
Verify the production build succeeds with no errors.

#### Implementation Steps

1. Run TypeScript check:
```bash
npx tsc --noEmit
```

2. Run production build:
```bash
npm run build
```

3. Review build output for warnings or errors

4. If build succeeds, optionally test production mode:
```bash
npm run start
```

#### Verification Steps
- [ ] TypeScript compilation succeeds with no errors
- [ ] Production build completes successfully
- [ ] No type errors in ActionButtons.tsx
- [ ] No unused imports warnings
- [ ] Bundle size is reasonable

#### Acceptance Criteria
- Build passes with zero errors
- No TypeScript errors
- Production site works correctly

---

## Final Checklist

Based on REQ-126 and Implementation Plan Task 3.1, verify:

- [x] Three buttons are displayed in equal widths within a single row (desktop) ✅
- [x] Buttons stack vertically on mobile viewports ✅
- [x] Each button meets minimum touch target size of 48x48 pixels ✅
- [x] Create button displays with red gradient background (`from-[#E61E4D] to-[#D70466]`) and white text ✅
- [x] View and Print buttons display with white background, black border, and black text ✅
- [x] All buttons show hover state with `scale(1.02)` transform ✅
- [x] Primary button hover darkens background slightly ✅
- [x] Secondary button hover changes background to `#F7F7F7` ✅
- [x] Active state applies `scale(0.98)` transform ✅
- [x] Each button has icon + text label ✅
- [x] Icons are from Lucide React library ✅
- [x] "Create New Item" navigates to `/dashboard2/create` ✅
- [x] "View Items" navigates to `/dashboard2/items` ✅
- [x] "Print QR Code" navigates based on property count ✅
- [x] All buttons have appropriate `aria-label` attributes ✅
- [x] Focus visible states use `ring-2 ring-[#222222]` ✅
- [x] Current 2-card layout removed from page.tsx ✅
- [x] "Feature Highlights" section removed from page.tsx ✅
- [x] TypeScript compiles without errors ✅
- [x] Production build succeeds ✅

**Implementation completed: 2026-01-06 18:15:00 UTC**

---

## Airbnb Design System Color Reference

| Usage | Tailwind Class | Hex Value |
|-------|----------------|-----------|
| Primary Button Gradient Start | `from-[#E61E4D]` | #E61E4D |
| Primary Button Gradient End | `to-[#D70466]` | #D70466 |
| Primary Button Text | `text-white` | #FFFFFF |
| Secondary Button Background | `bg-white` | #FFFFFF |
| Secondary Button Border | `border-[#222222]` | #222222 |
| Secondary Button Text | `text-[#222222]` | #222222 |
| Secondary Button Hover Background | `hover:bg-[#F7F7F7]` | #F7F7F7 |
| Focus Ring | `ring-[#222222]` | #222222 |

---

## Estimated Total Effort

| Task | Estimate |
|------|----------|
| Task 1: Create file structure | 0.5 SP |
| Task 2: ActionButton sub-component | 0.5 SP |
| Task 3: Primary button styling | 0.25 SP |
| Task 4: Secondary button styling | 0.25 SP |
| Task 5: Main component | 0.5 SP |
| Task 6: Navigation handlers | 0.5 SP |
| Task 7: Print QR property logic | 0.5 SP |
| Task 8: Barrel export | 0.1 SP |
| Task 9: Integration | 0.25 SP |
| Task 10: Remove 2-card layout | 0.25 SP |
| Task 11: Remove Feature Highlights | 0.25 SP |
| Task 12: Responsive styling | 0.25 SP |
| Task 13: Accessibility | 0.25 SP |
| Task 14: Visual testing | 0.5 SP |
| Task 15: Build verification | 0.25 SP |
| **Total** | **~4.85 SP** |

---

## References

- [REQ-126 Overview Document](./REQ-126-create-actionbuttons-component-overview.md)
- [Implementation Plan - REVISED](./prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](./prd/airbnb_designsystem.md)
- [Existing StatisticsCards Component](../src/components/SimpleDashboard/StatisticsCards.tsx)
- [Dashboard Page](../src/app/dashboard2/page.tsx)
