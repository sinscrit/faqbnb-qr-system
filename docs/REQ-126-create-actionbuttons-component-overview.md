# REQ-126: Create ActionButtons Component - Implementation Overview

**Document Created:** 2026-01-06 16:00:00 UTC
**Last Modified:** 2026-01-06 16:00:00 UTC
**Request Reference:** docs/gen_requests.md - Request #126
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 3, Task 3.1)
**PRD Reference:** PRD_Dashboard_2_Simple_Dashboard.md
**Design System Reference:** docs/prd/airbnb_designsystem.md

---

## 1. Executive Summary

This document provides a technical implementation breakdown for creating the `ActionButtons` component for Dashboard 2. The component will display three primary action buttons (Create Item, View Items, Print QR Code) in a horizontal row, replacing the current 2-card grid layout. The implementation must adhere to the Airbnb Design Language System (DLS) and provide touch-friendly, accessible interactions.

---

## 2. Current State Analysis

### 2.1 Current Implementation (To Be Replaced)

**File:** `/src/app/dashboard2/page.tsx` (lines 37-80)

The current implementation uses a 2-card grid layout with:
- Create New Item card with dashed border style
- View My Items card with solid border style
- Cards use `hover:border-[#FF385C]` and `hover:border-green-500` respectively
- No "Print QR Code" action button exists

### 2.2 PRD Violations in Current State

| Issue | PRD Reference | Impact |
|-------|---------------|--------|
| 2-card layout instead of 3-button row | Feature 2 wireframe | Layout mismatch |
| Missing "Print QR Code" action | Feature 2.3, Feature 5 | Missing functionality |
| "Feature Highlights" section (lines 82-123) | Not in PRD | Unnecessary content |

### 2.3 Existing Patterns to Follow

**StatisticsCards Component:** `/src/components/SimpleDashboard/StatisticsCards.tsx`
- Configuration-driven approach using `StatCardConfig[]` array
- Separate sub-components for individual items
- Loading skeleton pattern with `animate-pulse`
- Responsive grid: `grid-cols-1 sm:grid-cols-3`
- Airbnb DLS color tokens: `text-[#FF385C]`, `text-[#222222]`, `text-[#717171]`

---

## 3. Technical Requirements

### 3.1 Component Specifications

| Requirement | Specification |
|-------------|---------------|
| Component Name | `ActionButtons` |
| Location | `/src/components/SimpleDashboard/ActionButtons.tsx` |
| Export | Named export + index.ts barrel export |
| Framework | React with TypeScript |
| Styling | Tailwind CSS 4 with inline Airbnb hex values |

### 3.2 Button Layout Requirements

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  + Create Item   │ │   View Items     │ │  Print QR Code   │
│     (Primary)    │ │   (Secondary)    │ │   (Secondary)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

- Three equal-width buttons in a horizontal row
- Responsive: Stack vertically on mobile (`grid-cols-1 md:grid-cols-3`)
- Gap between buttons: 16px (`gap-4`)

### 3.3 Button Styling Requirements per Airbnb DLS

#### Primary Button (Create Item)

```css
/* Gradient background per Airbnb DLS */
background: linear-gradient(to right, #E61E4D, #D70466);
color: #FFFFFF;
border-radius: 8px; /* rounded-lg */
padding: 14px 24px; /* min-height ensures 48px touch target */
font-weight: 500;
transition: transform 0.2s ease, background-color 0.2s ease;

/* Hover state */
transform: scale(1.02);
filter: brightness(0.95);
```

#### Secondary Buttons (View Items, Print QR Code)

```css
background: #FFFFFF;
color: #222222;
border: 1px solid #222222;
border-radius: 8px;
padding: 14px 24px;
font-weight: 500;
transition: transform 0.2s ease, background-color 0.2s ease;

/* Hover state */
transform: scale(1.02);
background: #F7F7F7;
```

### 3.4 Touch Target Requirements

- Minimum touch target size: 48x48 pixels (WCAG 2.5.5 Target Size)
- Achieved via `min-h-[48px]` class
- Padding provides additional touch area

### 3.5 Icon Requirements

| Button | Icon | Icon Library |
|--------|------|--------------|
| Create Item | `PlusCircle` or `Plus` | Lucide React |
| View Items | `Package` or `List` | Lucide React |
| Print QR Code | `QrCode` or `Printer` | Lucide React |

---

## 4. Navigation Logic

### 4.1 Button Actions

| Button | Action | Notes |
|--------|--------|-------|
| Create Item | `router.push('/dashboard2/create')` | Direct navigation |
| View Items | `router.push('/dashboard2/items')` | Direct navigation |
| Print QR Code | Conditional based on property count | See 4.2 |

### 4.2 Print QR Code Navigation Logic

Per PRD Feature 2.3 and Feature 5:

```typescript
const handlePrintQRCode = async () => {
  // Get user's properties count from context or API
  const properties = await getUserProperties(); // or from AuthContext

  if (properties.length === 1) {
    // Single property: Navigate directly to print flow
    router.push(`/dashboard2/print/${properties[0].id}`);
  } else {
    // Multiple properties: Show property selector first
    router.push('/dashboard2/print');
  }
};
```

**Note:** Property data can be sourced from:
1. `AuthContext` - `userProperties` array (if available)
2. API call to `/api/user/properties` endpoint

---

## 5. Component Interface

### 5.1 Props Interface

```typescript
/**
 * Props for ActionButtons component
 */
export interface ActionButtonsProps {
  /** Optional callback when Create button is clicked */
  onCreateClick?: () => void;
  /** Optional callback when View button is clicked */
  onViewClick?: () => void;
  /** Optional callback when Print button is clicked */
  onPrintClick?: () => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Disable all buttons (e.g., during loading) */
  disabled?: boolean;
}
```

### 5.2 Button Configuration Interface

```typescript
/**
 * Configuration for individual action button
 */
interface ActionButtonConfig {
  /** Unique key for React mapping */
  key: string;
  /** Button label text */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Button variant: 'primary' | 'secondary' */
  variant: 'primary' | 'secondary';
  /** Click handler */
  onClick: () => void;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}
```

---

## 6. Implementation Tasks

### 6.1 Task Breakdown

| # | Task | Estimate | Dependencies |
|---|------|----------|--------------|
| 1 | Create ActionButtons.tsx component file | 0.5h | None |
| 2 | Implement ActionButton sub-component | 0.5h | Task 1 |
| 3 | Implement primary button styling | 0.25h | Task 2 |
| 4 | Implement secondary button styling | 0.25h | Task 2 |
| 5 | Add hover/active animations | 0.25h | Tasks 3, 4 |
| 6 | Implement navigation handlers | 0.5h | Task 1 |
| 7 | Add Print QR Code property check logic | 0.5h | Task 6 |
| 8 | Update SimpleDashboard index.ts barrel export | 0.1h | Task 1 |
| 9 | Integrate into dashboard2/page.tsx | 0.25h | All above |
| 10 | Remove current 2-card layout and Feature Highlights | 0.25h | Task 9 |
| 11 | Add responsive styling | 0.25h | Task 9 |
| 12 | Add accessibility attributes (aria-labels, focus states) | 0.25h | Task 2 |
| **Total** | | **~3.5h** | |

### 6.2 Task Details

#### Task 1: Create ActionButtons.tsx

Create `/src/components/SimpleDashboard/ActionButtons.tsx` with:
- File header comment with REQ reference and timestamps
- Imports: React, Lucide icons, useRouter
- TypeScript interfaces
- Main component export

#### Task 6-7: Navigation Logic Implementation

```typescript
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ActionButtons({ className, onPrintClick }: ActionButtonsProps) {
  const router = useRouter();
  const { userProperties } = useAuth();

  const handlePrintQRCode = () => {
    if (onPrintClick) {
      onPrintClick();
      return;
    }

    // Default navigation logic
    if (userProperties.length === 1) {
      router.push(`/dashboard2/print/${userProperties[0].id}`);
    } else {
      router.push('/dashboard2/print');
    }
  };

  // ... component implementation
}
```

---

## 7. Authorized Files and Functions for Modification

### 7.1 Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Main ActionButtons component |

### 7.2 Files to MODIFY

| File Path | Lines | Modification |
|-----------|-------|--------------|
| `/src/components/SimpleDashboard/index.ts` | Add export | Add `export { ActionButtons } from './ActionButtons';` |
| `/src/app/dashboard2/page.tsx` | 16-17 | Add import for `ActionButtons` |
| `/src/app/dashboard2/page.tsx` | 37-80 | Remove current 2-card grid layout |
| `/src/app/dashboard2/page.tsx` | 82-123 | Remove "Feature Highlights" section |
| `/src/app/dashboard2/page.tsx` | After stats | Add `<ActionButtons />` component |

### 7.3 Files to NOT MODIFY

| File Path | Reason |
|-----------|--------|
| `/src/app/dashboard2/layout.tsx` | Already complete per Implementation Plan |
| `/src/app/dashboard2/create/page.tsx` | Already complete |
| `/src/app/dashboard2/items/page.tsx` | Already complete |
| `/src/components/QRCodePrintManager.tsx` | Reuse as-is |

---

## 8. Airbnb Design System Color Reference

### 8.1 Colors Used in This Component

| Usage | Tailwind Class | Hex Value |
|-------|----------------|-----------|
| Primary Button Gradient Start | `from-[#E61E4D]` | #E61E4D |
| Primary Button Gradient End | `to-[#D70466]` | #D70466 |
| Primary Button Text | `text-white` | #FFFFFF |
| Secondary Button Background | `bg-white` | #FFFFFF |
| Secondary Button Border | `border-[#222222]` | #222222 |
| Secondary Button Text | `text-[#222222]` | #222222 |
| Secondary Button Hover Background | `hover:bg-[#F7F7F7]` | #F7F7F7 |
| Icon Color (Primary) | `text-white` | #FFFFFF |
| Icon Color (Secondary) | `text-[#222222]` | #222222 |

### 8.2 Spacing Tokens

| Usage | Tailwind Class | Value |
|-------|----------------|-------|
| Button Grid Gap | `gap-4` | 16px |
| Button Padding X | `px-6` | 24px |
| Button Padding Y | `py-3.5` | 14px |
| Icon-to-Label Gap | `gap-2` | 8px |

---

## 9. Accessibility Requirements

### 9.1 WCAG Compliance

| Requirement | Implementation |
|-------------|----------------|
| 4.5:1 color contrast | White text on gradient (#E61E4D) passes |
| Keyboard navigation | All buttons focusable via Tab |
| Focus visible state | `focus-visible:ring-2 ring-[#222222]` |
| Touch target size | Minimum 48x48px via `min-h-[48px]` |
| Screen reader labels | `aria-label` on each button |

### 9.2 Focus State Styling

```css
/* Tailwind classes for focus state */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[#222222]
focus-visible:ring-offset-2
```

---

## 10. Testing Considerations

### 10.1 Unit Test Cases

| Test Case | Expected Result |
|-----------|-----------------|
| Render 3 buttons | All 3 buttons visible |
| Create button click | Navigates to /dashboard2/create |
| View button click | Navigates to /dashboard2/items |
| Print button click (1 property) | Navigates to /dashboard2/print/[id] |
| Print button click (2+ properties) | Navigates to /dashboard2/print |
| Keyboard Tab navigation | Focus moves through all buttons |
| Disabled state | All buttons non-interactive |

### 10.2 Visual Test Cases

| Test Case | Expected Result |
|-----------|-----------------|
| Desktop view | 3 buttons in row |
| Mobile view (<768px) | 3 buttons stacked vertically |
| Hover state (Primary) | Scale 1.02, slight darken |
| Hover state (Secondary) | Scale 1.02, background #F7F7F7 |
| Active state | Scale 0.98 |

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `userProperties` not available in AuthContext | Medium | Medium | Fallback to API call or show property selector |
| Print route doesn't exist yet | High | Low | Task 3.2-3.3 creates routes; can use placeholder navigation |
| Touch target too small on mobile | Low | High | Explicitly set `min-h-[48px]` class |
| Gradient doesn't render correctly | Low | Medium | Use standard Tailwind gradient syntax |

---

## 12. Dependencies

### 12.1 External Dependencies

| Dependency | Purpose | Already Installed |
|------------|---------|-------------------|
| `lucide-react` | Icon components | Yes |
| `next/navigation` | useRouter hook | Yes (Next.js) |

### 12.2 Internal Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| `/src/contexts/AuthContext` | Access userProperties | Available |
| `/src/components/SimpleDashboard/index.ts` | Barrel export | Exists |
| `/src/app/dashboard2/print/` routes | Print flow navigation | To be created (Task 3.2-3.3) |

---

## 13. Code Template

### 13.1 ActionButtons.tsx Skeleton

```typescript
// src/components/SimpleDashboard/ActionButtons.tsx
// REQ-126: Action Buttons Component for Dashboard Operations
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Package, QrCode, LucideIcon } from 'lucide-react';

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

    // Property-based navigation
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

---

## 14. Acceptance Criteria Checklist

Based on REQ-126 and Implementation Plan Task 3.1:

- [ ] Three buttons are displayed in equal widths within a single row (desktop)
- [ ] Buttons stack vertically on mobile viewports
- [ ] Each button meets minimum touch target size of 48x48 pixels
- [ ] Create button displays with red gradient background (`from-[#E61E4D] to-[#D70466]`) and white text
- [ ] View and Print buttons display with white background, black border, and black text
- [ ] All buttons show hover state with `scale(1.02)` transform
- [ ] Primary button hover darkens background slightly
- [ ] Secondary button hover changes background to `#F7F7F7`
- [ ] Active state applies `scale(0.98)` transform
- [ ] Each button has icon + text label
- [ ] Icons are from Lucide React library
- [ ] "Create New Item" navigates to `/dashboard2/create`
- [ ] "View Items" navigates to `/dashboard2/items`
- [ ] "Print QR Code" navigates based on property count
- [ ] All buttons have appropriate `aria-label` attributes
- [ ] Focus visible states use `ring-2 ring-[#222222]`
- [ ] Current 2-card layout removed from page.tsx
- [ ] "Feature Highlights" section removed from page.tsx

---

## 15. References

- [PRD: Dashboard 2 - Simple Dashboard](./prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Airbnb Design System](./prd/airbnb_designsystem.md) - Sections 7.1 (Buttons), 9 (Accessibility)
- [Implementation Plan - REVISED](./prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md) - Phase 3, Task 3.1
- [Existing StatisticsCards Component](../src/components/SimpleDashboard/StatisticsCards.tsx)
- [Existing QRCodePrintManager Component](../src/components/QRCodePrintManager.tsx)
