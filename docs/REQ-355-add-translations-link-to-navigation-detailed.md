# REQ-355: Add Translations Navigation Link to Dashboard - Detailed Task Breakdown

**Document Created:** 2026-01-19 23:45:00 UTC
**Last Modified:** 2026-01-19 23:45:00 UTC
**Request Reference:** docs/gen_requests_epic5.md - Request #355
**Overview Document:** docs/REQ-355-add-translations-link-to-navigation-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md (Phase 4, Task 4.4)
**PRD Reference:** PRD_L10N_Epic5_Owner_Translation_Management.md
**Epic Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Executive Summary

This document provides granular, implementation-ready tasks for adding a "Translations" navigation link to the Dashboard 2 layout. The implementation involves two small modifications to `/src/app/dashboard2/layout.tsx`: adding the `Languages` icon import and adding a new navigation item to the existing array. This is an XS-sized task with minimal risk and no complex dependencies.

**Total Estimated Effort:** ~10 minutes (XS)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Access to `/src/app/dashboard2/layout.tsx`
- [ ] `lucide-react` package is installed (confirmed - already in use)
- [ ] `Languages` icon is available in lucide-react (confirmed)
- [ ] Build and lint commands work: `npm run build`, `npm run lint`

---

## Task 1: Add Languages Icon Import

**Task ID:** REQ-355-T1
**Estimate:** 2 minutes
**Story Points:** 0.5
**Dependencies:** None
**Risk Level:** Very Low

### Description

Add the `Languages` icon to the existing lucide-react import statement in the dashboard layout file.

### File to Modify

| File | Line | Type |
|------|------|------|
| `/src/app/dashboard2/layout.tsx` | 20 | MODIFY |

### Current Code (Line 20)

```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

### Target Code (Line 20)

```typescript
import { Building2, FileText, Languages, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

### Implementation Steps

1. Open `/src/app/dashboard2/layout.tsx`
2. Locate line 20 containing the lucide-react import
3. Add `Languages` to the import list (maintaining alphabetical order: after `FileText`, before `LayoutDashboard`)
4. Save the file

### Verification Steps

1. Ensure TypeScript shows no errors for the import
2. Verify `Languages` icon is recognized by hovering over it in the IDE
3. Run `npm run lint` to check for import errors

### Acceptance Criteria

- [ ] `Languages` is imported from `lucide-react`
- [ ] Import maintains alphabetical ordering
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings or errors

---

## Task 2: Add Translations Navigation Item

**Task ID:** REQ-355-T2
**Estimate:** 3 minutes
**Story Points:** 0.5
**Dependencies:** REQ-355-T1
**Risk Level:** Very Low

### Description

Add a new navigation item object to the `navigationItems` array, placing it after "Properties" as the last item in the main navigation.

### File to Modify

| File | Lines | Type |
|------|-------|------|
| `/src/app/dashboard2/layout.tsx` | 42-67 | MODIFY |

### Current Code (Lines 42-67)

```typescript
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

### Target Code (Lines 42-73)

```typescript
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
  {
    name: 'Translations',
    mobileLabel: 'Trans.',
    href: '/dashboard2/translations',
    icon: Languages,
  },
];
```

### Implementation Steps

1. Open `/src/app/dashboard2/layout.tsx`
2. Locate the `navigationItems` array (lines 42-67)
3. Add a trailing comma after the Properties object closing brace (line 66)
4. Add the new Translations navigation item object after Properties
5. Ensure proper indentation matches existing items
6. Save the file

### New Navigation Item Configuration

| Property | Value | Notes |
|----------|-------|-------|
| `name` | `'Translations'` | Full label for desktop viewport |
| `mobileLabel` | `'Trans.'` | Abbreviated label for mobile viewport |
| `href` | `'/dashboard2/translations'` | Route to Translation Management page |
| `icon` | `Languages` | Lucide React icon component |

### Verification Steps

1. TypeScript shows no errors for the new navigation item
2. Verify the item matches the `NavItem` interface structure
3. Run `npm run lint` to check for syntax errors
4. Run `npm run build` to verify compilation

### Acceptance Criteria

- [ ] New navigation item is added to `navigationItems` array
- [ ] Item is positioned after "Properties" (last item)
- [ ] All required properties are set: `name`, `mobileLabel`, `href`, `icon`
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings or errors

---

## Task 3: Verify Build and Navigation Functionality

**Task ID:** REQ-355-T3
**Estimate:** 5 minutes
**Story Points:** 1
**Dependencies:** REQ-355-T1, REQ-355-T2
**Risk Level:** Very Low

### Description

Run the build process and manually verify the navigation link appears correctly and functions as expected.

### Verification Commands

```bash
# 1. Run TypeScript type check
npm run lint

# 2. Run production build
npm run build

# 3. Start development server (if not running)
npm run dev
```

### Manual Test Cases

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Desktop viewport visibility | View dashboard at 1024px+ width | "Translations" label with Languages icon visible |
| 2 | Mobile viewport visibility | View dashboard at <768px width | "Trans." abbreviated label visible |
| 3 | Navigation click | Click "Translations" nav item | Browser navigates to `/dashboard2/translations` |
| 4 | Active state - main page | Navigate to `/dashboard2/translations` | Link shows active styling (red border, red text) |
| 5 | Active state - sub-route | Navigate to `/dashboard2/translations/any-path` | Link shows active styling |
| 6 | Inactive state | Navigate to `/dashboard2/items` | Translations link shows inactive styling |
| 7 | Keyboard navigation | Tab through nav items | Translations button is focusable, Enter navigates |
| 8 | Icon rendering | Inspect nav item | Languages icon renders at 16x16px (w-4 h-4) |

### Visual Verification Checklist

- [ ] Icon renders correctly at all viewport sizes
- [ ] Text aligns with other navigation items
- [ ] Spacing matches existing navigation items
- [ ] Active state styling matches other nav items (border-[#FF385C] text-[#FF385C])
- [ ] Hover state transitions smoothly (text-gray-700 border-gray-300)
- [ ] Focus ring appears on keyboard focus (ring-[#222222])

### Expected URL Behavior

| URL Path | Expected Nav State |
|----------|-------------------|
| `/dashboard2` | Dashboard active, Translations inactive |
| `/dashboard2/items` | Items active, Translations inactive |
| `/dashboard2/instructions` | Guides active, Translations inactive |
| `/dashboard2/properties` | Properties active, Translations inactive |
| `/dashboard2/translations` | Translations active |
| `/dashboard2/translations/item/123` | Translations active |

### Acceptance Criteria

- [ ] Build completes successfully without errors
- [ ] Lint passes without warnings
- [ ] Navigation link is visible on desktop viewports
- [ ] Navigation link shows abbreviated label on mobile viewports
- [ ] Clicking the link navigates to `/dashboard2/translations`
- [ ] Active state styling applies correctly
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] No visual regressions in existing navigation

---

## Consolidated Code Changes

### File: `/src/app/dashboard2/layout.tsx`

#### Change 1: Import Statement (Line 20)

**Before:**
```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

**After:**
```typescript
import { Building2, FileText, Languages, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

#### Change 2: Navigation Items Array (Lines 42-67 → 42-73)

**Before (ending at line 67):**
```typescript
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

**After (ending at line 73):**
```typescript
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
  {
    name: 'Translations',
    mobileLabel: 'Trans.',
    href: '/dashboard2/translations',
    icon: Languages,
  },
];
```

---

## Files Summary

### Files to MODIFY

| File Path | Lines | Changes |
|-----------|-------|---------|
| `/src/app/dashboard2/layout.tsx` | 20 | Add `Languages` to import |
| `/src/app/dashboard2/layout.tsx` | 66-67 | Add new nav item after Properties |

### Files to NOT MODIFY

| File Path | Reason |
|-----------|--------|
| `/src/app/dashboard2/translations/page.tsx` | Separate REQ (REQ-354) - Translation Management page |
| `/src/components/TranslationManagement/*` | Separate component tasks |
| `/src/components/LanguageSwitcher/*` | Unrelated - language UI switching |
| `/src/app/dashboard2/page.tsx` | Dashboard home page - not affected |

---

## Accessibility Compliance

### WCAG 2.1 Requirements (Already Satisfied by Existing Pattern)

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| 2.1.1 Keyboard | `<button>` element with Tab navigation | ✓ Inherited |
| 2.4.3 Focus Order | Sequential in DOM order | ✓ Inherited |
| 2.4.7 Focus Visible | `focus-visible:ring-2 focus-visible:ring-[#222222]` | ✓ Inherited |
| 2.4.8 Current Page | `aria-current="page"` for active state | ✓ Inherited |
| 2.5.5 Touch Target | `px-3 pt-4 pb-4` padding (meets 44x44px minimum) | ✓ Inherited |

### No Additional Accessibility Work Required

The new navigation item automatically inherits all accessibility features from the existing navigation rendering logic.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Route doesn't exist (REQ-354 incomplete) | Medium | Low | 404 is acceptable during phased development |
| Navigation overflow on mobile | Low | Medium | "Trans." abbreviation keeps it compact (5 chars) |
| Icon not in lucide-react | Very Low | Low | Confirmed `Languages` exists; fallback to `Globe` |
| TypeScript errors | Very Low | Low | Uses existing type-safe pattern |

---

## Dependencies

### Pre-requisite Tasks

| Dependency | Description | Status | Required For |
|------------|-------------|--------|--------------|
| REQ-354 | Translation Management Page | Should exist at `/dashboard2/translations` | Full functionality |
| Epic 1 | Foundation (translation tables) | Required | Data availability |
| Epic 3 | Dynamic Content Translation | Required | Translation trigger system |

### Post-Implementation Notes

- If REQ-354 is not complete, clicking the nav link will show a 404 page - this is expected
- Once REQ-354 is deployed, the navigation will seamlessly connect to the management page

---

## Definition of Done

- [ ] `Languages` icon imported from `lucide-react`
- [ ] New navigation item added to `navigationItems` array
- [ ] Position is after "Properties" (5th item)
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully
- [ ] Manual testing confirms:
  - [ ] Desktop: "Translations" label visible with icon
  - [ ] Mobile: "Trans." abbreviated label visible
  - [ ] Click navigates to `/dashboard2/translations`
  - [ ] Active state styling works correctly
  - [ ] Keyboard navigation works
- [ ] No visual regressions in existing navigation items

---

## Acceptance Criteria (from REQ-355)

| # | Criteria | Task Reference |
|---|----------|----------------|
| 1 | Navigation link labeled "Translations" appears in the dashboard sidebar navigation | REQ-355-T2 |
| 2 | Link displays an icon representing language or translation functionality | REQ-355-T1, REQ-355-T2 |
| 3 | Clicking the link navigates to the Translation Management page without page reload | REQ-355-T3 |
| 4 | Active state styling applies when viewing the translations section | REQ-355-T3 |
| 5 | Navigation link appears for all authenticated property owners with content access | Inherited from layout |
| 6 | Link position in navigation follows logical information architecture principles | REQ-355-T2 |
| 7 | Navigation remains accessible and visible across all viewport sizes supported by the dashboard | REQ-355-T3 |

---

## References

- [Overview Document](./REQ-355-add-translations-link-to-navigation-overview.md)
- [Implementation Plan: L10N Epic 5](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md) - Phase 4, Task 4.4
- [Request Document: Epic 5](./gen_requests_epic5.md) - REQ-355
- [Dashboard Layout Source](../src/app/dashboard2/layout.tsx)
- [Lucide React Icons - Languages](https://lucide.dev/icons/languages)

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Task 4.4: Add translations link to navigation*
