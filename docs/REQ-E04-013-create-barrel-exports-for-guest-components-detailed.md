# REQ-E04-013: Create Barrel Export File for Guest Components - Detailed Task Breakdown

**Document Type:** Detailed Implementation Specification
**Request ID:** REQ-E04-013
**Epic:** L10N Epic 4 - Guest Experience
**Phase:** 3 - Guest UI Components
**Task ID:** 3.6
**Size:** XS
**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Executive Summary

This document provides granular, actionable implementation steps for creating the barrel export file at `/src/components/guest/index.ts`. The barrel file centralizes exports for all five guest-facing localization components (GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, LanguageIndicator), enabling clean single-line imports from `@/components/guest`.

**Estimated Total Effort:** 15 minutes
**Prerequisites:** Tasks 3.1-3.5 must be completed (all five guest components implemented)

---

## Pre-Implementation Checklist

Before starting implementation, verify the following:

- [ ] GuestLanguageSwitcher component exists at `/src/components/guest/GuestLanguageSwitcher/index.ts` (REQ-E04-008)
- [ ] TranslationBanner component exists at `/src/components/guest/TranslationBanner/index.ts` (REQ-E04-009)
- [ ] MissingTranslationBanner component exists at `/src/components/guest/MissingTranslationBanner/index.ts` (REQ-E04-010)
- [ ] ViewOriginalToggle component exists at `/src/components/guest/ViewOriginalToggle/index.ts` (REQ-E04-011)
- [ ] LanguageIndicator component exists at `/src/components/guest/LanguageIndicator/index.ts` (REQ-E04-012)
- [ ] Each component exports its main component and props type from its `index.ts`

---

## Task 1: Verify Component Export Names

**Objective:** Confirm the exact export names from each component's index.ts file before creating the barrel export.

### Step 1.1: Read GuestLanguageSwitcher Exports

**Action:** Read `/src/components/guest/GuestLanguageSwitcher/index.ts`

**Expected exports:**
```typescript
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher.types';
```

**Note any deviations from expected naming.**

### Step 1.2: Read TranslationBanner Exports

**Action:** Read `/src/components/guest/TranslationBanner/index.ts`

**Expected exports:**
```typescript
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner.types';
```

### Step 1.3: Read MissingTranslationBanner Exports

**Action:** Read `/src/components/guest/MissingTranslationBanner/index.ts`

**Expected exports:**
```typescript
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner.types';
```

### Step 1.4: Read ViewOriginalToggle Exports

**Action:** Read `/src/components/guest/ViewOriginalToggle/index.ts`

**Expected exports:**
```typescript
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle.types';
```

### Step 1.5: Read LanguageIndicator Exports

**Action:** Read `/src/components/guest/LanguageIndicator/index.ts`

**Expected exports:**
```typescript
export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator.types';
```

### Completion Criteria for Task 1:
- [ ] All five component index.ts files have been read
- [ ] Exact export names are confirmed for each component
- [ ] Exact export names are confirmed for each props type
- [ ] Any additional exports (constants, utility functions) are noted

---

## Task 2: Create Barrel Export File

**Objective:** Create `/src/components/guest/index.ts` with all component and type exports.

### Step 2.1: Create the File

**File to create:** `/src/components/guest/index.ts`

**Content:**

```typescript
// /src/components/guest/index.ts
// REQ-E04-013: Guest Components Barrel Exports
// Epic 4: Guest Experience - Phase 3.6
// Created: 2026-01-20
// Last Modified: 2026-01-20

/**
 * Guest-facing localization components for multilingual content display.
 *
 * These components enable guests to:
 * - Switch between available translation languages
 * - View translation status indicators
 * - Toggle between translated and original content
 * - See visual language indicators
 *
 * @module guest
 */

// GuestLanguageSwitcher - Language selector dropdown for guests (REQ-E04-008)
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';

// TranslationBanner - Shows "Translated from X" indicator (REQ-E04-009)
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

// MissingTranslationBanner - Shows when requested translation unavailable (REQ-E04-010)
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';

// ViewOriginalToggle - Toggle between translation and original (REQ-E04-011)
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';

// LanguageIndicator - Compact language display for header (REQ-E04-012)
export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator';
```

### Design Decisions:

1. **Named exports only** - No default export to ensure tree-shaking compatibility and explicit imports
2. **Separate type exports** - Using `export type` for props interfaces to enable `isolatedModules` compatibility
3. **Grouped by component** - Each component's exports are grouped together with REQ reference comments
4. **JSDoc module documentation** - Provides IDE hints when hovering over the module
5. **Chronological REQ ordering** - Components listed in the order they were implemented (REQ-008 through REQ-012)

### Completion Criteria for Task 2:
- [ ] File created at `/src/components/guest/index.ts`
- [ ] File header includes REQ reference and timestamps
- [ ] All five components are exported
- [ ] All five props types are exported with `export type` syntax
- [ ] Comments indicate REQ references for each component
- [ ] No business logic present in file (only re-exports)

---

## Task 3: Verify TypeScript Compilation

**Objective:** Confirm the barrel export file compiles without errors.

### Step 3.1: Run TypeScript Check

**Command:**
```bash
npx tsc --noEmit
```

**Expected output:** No errors related to `/src/components/guest/index.ts`

**Common issues to check:**
- Module not found errors (component path incorrect)
- Export not found errors (export name mismatch)
- Type export errors (using `export type` incorrectly)

### Step 3.2: Verify ESLint Passes

**Command:**
```bash
npm run lint -- --filter src/components/guest/index.ts
```

Or if that syntax is unsupported:
```bash
npm run lint
```

**Expected output:** No lint errors for the barrel file

### Completion Criteria for Task 3:
- [ ] TypeScript compilation succeeds without errors
- [ ] ESLint check passes without warnings
- [ ] No circular dependency warnings

---

## Task 4: Test Import Resolution

**Objective:** Verify that imports from the barrel file resolve correctly.

### Step 4.1: Create Test Import (Manual Verification)

Add temporary test code to verify imports work (to be removed after verification):

```typescript
// Test in any existing component or create a temporary test file
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
  ViewOriginalToggle,
  LanguageIndicator
} from '@/components/guest';

import type {
  GuestLanguageSwitcherProps,
  TranslationBannerProps,
  MissingTranslationBannerProps,
  ViewOriginalToggleProps,
  LanguageIndicatorProps
} from '@/components/guest';

// Verify components are defined
console.log(typeof GuestLanguageSwitcher); // Should be 'function'
console.log(typeof TranslationBanner);     // Should be 'function'
console.log(typeof MissingTranslationBanner); // Should be 'function'
console.log(typeof ViewOriginalToggle);    // Should be 'function'
console.log(typeof LanguageIndicator);     // Should be 'function'
```

### Step 4.2: Run Build Verification

**Command:**
```bash
npm run build
```

**Expected output:** Build succeeds without import resolution errors

### Completion Criteria for Task 4:
- [ ] All component imports resolve correctly
- [ ] All type imports resolve correctly
- [ ] Build process completes successfully
- [ ] Temporary test code removed (if created)

---

## Acceptance Criteria Verification

Map each acceptance criterion from the PRD to implementation verification:

| # | Acceptance Criterion | Verification Method | Status |
|---|---------------------|---------------------|--------|
| 1 | Barrel export file exists at `/src/components/guest/index.ts` | File exists check | [ ] |
| 2 | File exports GuestLanguageSwitcher component | Import test | [ ] |
| 3 | File exports TranslationBanner component | Import test | [ ] |
| 4 | File exports MissingTranslationBanner component | Import test | [ ] |
| 5 | File exports ViewOriginalToggle component | Import test | [ ] |
| 6 | File exports LanguageIndicator component | Import test | [ ] |
| 7 | All exports use named export syntax | Code review | [ ] |
| 8 | File includes no business logic, only re-exports | Code review | [ ] |
| 9 | TypeScript types are also re-exported | Import test for types | [ ] |
| 10 | Barrel file importable from `@/components/guest` | Import test | [ ] |
| 11 | No breaking changes to existing direct imports | Regression check (N/A - new file) | [ ] |

---

## Files Summary

### Files to Create

| File Path | Purpose | LOC |
|-----------|---------|-----|
| `/src/components/guest/index.ts` | Barrel export file for guest components | ~25 |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Verify export name |
| `/src/components/guest/TranslationBanner/index.ts` | Verify export name |
| `/src/components/guest/MissingTranslationBanner/index.ts` | Verify export name |
| `/src/components/guest/ViewOriginalToggle/index.ts` | Verify export name |
| `/src/components/guest/LanguageIndicator/index.ts` | Verify export name |

### Files NOT to Modify

- `/src/types/index.ts` - L10N types managed separately (REQ-E04-003)
- Individual component files under `/src/components/guest/*/`
- Any existing components outside the guest directory

---

## Pattern Compliance

This implementation follows established codebase patterns:

### SimpleDashboard Pattern (`/src/components/SimpleDashboard/index.ts`)
- **Adopted:** File header with REQ references and timestamps
- **Adopted:** Named exports with `export { X } from './X'` syntax
- **Adopted:** Type exports with `export type { XProps } from './X'`
- **Adopted:** Comments grouping exports by feature area

### LanguageSwitcher Pattern (`/src/components/LanguageSwitcher/index.ts`)
- **Adopted:** REQ reference in header comment
- **Adopted:** Separate type exports
- **Not adopted:** Default export (barrel files use named exports only)

### ItemManager/components Pattern (`/src/components/ItemManager/components/index.ts`)
- **Adopted:** JSDoc module documentation
- **Adopted:** Category comments for grouping

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Component not yet implemented | Low | High | Task scheduled after Tasks 3.1-3.5; verify prereqs before starting |
| Export name mismatch | Low | Low | Task 1 explicitly verifies export names before creating barrel |
| Circular dependency | Very Low | Medium | Guest components have no cross-dependencies; pure re-exports |
| Build failure | Very Low | Low | TypeScript/build verification in Tasks 3-4 catches issues early |

---

## Implementation Checklist

**Before Implementation:**
- [ ] Confirm all five guest components exist (REQ-E04-008 through REQ-E04-012 complete)
- [ ] Read this document fully

**During Implementation:**
- [ ] Task 1: Verify all component export names
- [ ] Task 2: Create barrel export file
- [ ] Task 3: Verify TypeScript compilation
- [ ] Task 4: Test import resolution

**After Implementation:**
- [ ] All acceptance criteria verified
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds
- [ ] Document any deviations from this specification

---

## References

- **Overview Document:** `/docs/REQ-E04-013-create-barrel-exports-for-guest-components-overview.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-E04-013)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Phase 3, Task 3.6)
- **Pattern Reference:** `/src/components/SimpleDashboard/index.ts`
- **Pattern Reference:** `/src/components/LanguageSwitcher/index.ts`
- **Pattern Reference:** `/src/components/ItemManager/components/index.ts`

---

## Expected Usage After Implementation

```typescript
// Before (verbose imports requiring knowledge of internal structure)
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import { ViewOriginalToggle } from '@/components/guest/ViewOriginalToggle';
import { LanguageIndicator } from '@/components/guest/LanguageIndicator';

// After (clean barrel import)
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
  ViewOriginalToggle,
  LanguageIndicator
} from '@/components/guest';

// Type imports
import type {
  GuestLanguageSwitcherProps,
  TranslationBannerProps,
  MissingTranslationBannerProps,
  ViewOriginalToggleProps,
  LanguageIndicatorProps
} from '@/components/guest';
```

---

*End of detailed task breakdown for REQ-E04-013*
