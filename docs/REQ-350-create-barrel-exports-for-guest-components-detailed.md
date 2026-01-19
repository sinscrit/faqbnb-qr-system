# REQ-350: Create Barrel Exports for Guest Components - Detailed Task Breakdown

**Document Created:** 2026-01-19 21:15 UTC
**Last Modified:** 2026-01-19 21:15 UTC
**Request ID:** REQ-350
**Type:** ENHANCEMENT
**Size:** XS (Extra Small)
**Phase:** 3 - Guest UI Components (Task 3.6)
**Epic:** L10N Epic 4 - Guest Experience
**Overview Document:** `/docs/REQ-350-create-barrel-exports-for-guest-components-overview.md`
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
**Requirements Source:** `/docs/gen_requests_epic4.md` (Request #350)

---

## Executive Summary

This task creates a centralized barrel export file at `/src/components/guest/index.ts` that re-exports all five guest-facing localization components created in Phase 3 of Epic 4. This follows established project patterns from `/src/components/LanguageSwitcher/index.ts` and `/src/components/ItemManager/index.ts`. The task is straightforward but depends on all preceding Phase 3 tasks (REQ-345 through REQ-349) being completed.

---

## Prerequisites

### Required Completed Tasks (Blocking Dependencies)

| Task | Request | Component | Status Check |
|------|---------|-----------|--------------|
| 3.1 | REQ-345 | GuestLanguageSwitcher | `/src/components/guest/GuestLanguageSwitcher/index.ts` must exist |
| 3.2 | REQ-346 | TranslationBanner | `/src/components/guest/TranslationBanner/index.ts` must exist |
| 3.3 | REQ-347 | MissingTranslationBanner | `/src/components/guest/MissingTranslationBanner/index.ts` must exist |
| 3.4 | REQ-348 | ViewOriginalToggle | `/src/components/guest/ViewOriginalToggle/index.ts` must exist |
| 3.5 | REQ-349 | LanguageIndicator | `/src/components/guest/LanguageIndicator/index.ts` must exist |

### Expected Directory Structure After Prerequisites

```
/src/components/guest/
├── GuestLanguageSwitcher/
│   ├── index.ts                                # Exports component and types
│   ├── GuestLanguageSwitcher.tsx               # Main component
│   └── GuestLanguageSwitcher.types.ts          # TypeScript interfaces
├── TranslationBanner/
│   ├── index.ts                                # Exports component and types
│   ├── TranslationBanner.tsx                   # Main component
│   └── TranslationBanner.types.ts              # TypeScript interfaces
├── MissingTranslationBanner/
│   ├── index.ts                                # Exports component and types
│   ├── MissingTranslationBanner.tsx            # Main component
│   └── MissingTranslationBanner.types.ts       # TypeScript interfaces
├── ViewOriginalToggle/
│   ├── index.ts                                # Exports component and types
│   ├── ViewOriginalToggle.tsx                  # Main component
│   └── ViewOriginalToggle.types.ts             # TypeScript interfaces
└── LanguageIndicator/
    ├── index.ts                                # Exports component and types
    ├── LanguageIndicator.tsx                   # Main component
    └── LanguageIndicator.types.ts              # TypeScript interfaces
```

---

## Detailed Task Breakdown

### Task 1: Verify Prerequisites (Verification Only)
**Estimated Effort:** 5 minutes
**File Operations:** Read-only

#### 1.1 Verify Component Directories Exist

**Action:** Check that each component directory exists with its index.ts file.

**Commands to verify:**
```bash
# Verify all component directories exist
ls -la src/components/guest/GuestLanguageSwitcher/index.ts
ls -la src/components/guest/TranslationBanner/index.ts
ls -la src/components/guest/MissingTranslationBanner/index.ts
ls -la src/components/guest/ViewOriginalToggle/index.ts
ls -la src/components/guest/LanguageIndicator/index.ts
```

**Expected outcome:** All five index.ts files exist.

**If files don't exist:** STOP. This task cannot proceed until Tasks 3.1-3.5 are completed. Document which tasks are incomplete and return.

#### 1.2 Verify Component Exports

**Action:** Read each component's index.ts to confirm export names.

**Expected exports from each component directory:**

| Component Directory | Expected Named Export | Expected Type Export |
|--------------------|----------------------|---------------------|
| GuestLanguageSwitcher | `GuestLanguageSwitcher` | `GuestLanguageSwitcherProps` |
| TranslationBanner | `TranslationBanner` | `TranslationBannerProps` |
| MissingTranslationBanner | `MissingTranslationBanner` | `MissingTranslationBannerProps` |
| ViewOriginalToggle | `ViewOriginalToggle` | `ViewOriginalToggleProps` |
| LanguageIndicator | `LanguageIndicator` | `LanguageIndicatorProps` |

**Commands to verify:**
```bash
# Check each component's exports
grep -E "export.*\{" src/components/guest/GuestLanguageSwitcher/index.ts
grep -E "export.*\{" src/components/guest/TranslationBanner/index.ts
grep -E "export.*\{" src/components/guest/MissingTranslationBanner/index.ts
grep -E "export.*\{" src/components/guest/ViewOriginalToggle/index.ts
grep -E "export.*\{" src/components/guest/LanguageIndicator/index.ts
```

**Acceptance Criteria:**
- [ ] All 5 component directories exist
- [ ] Each directory has an index.ts file
- [ ] Each index.ts exports the component by name
- [ ] Each index.ts exports the Props type

---

### Task 2: Create Barrel Export File
**Estimated Effort:** 15 minutes
**Files to Create:** 1

#### 2.1 Create `/src/components/guest/index.ts`

**Action:** Create the main barrel export file at `/src/components/guest/index.ts`.

**File Path:** `/src/components/guest/index.ts`

**Complete File Content:**

```typescript
/**
 * Guest Components Barrel Export
 *
 * Centralized exports for all guest-facing localization components.
 * These components are used in guest-facing pages (e.g., QR code scans)
 * to display translated content and allow language selection.
 *
 * @module components/guest
 * @created 2026-01-19
 * @lastModified 2026-01-19
 * @epic L10N Epic 4 - Guest Experience
 * @task REQ-350
 *
 * @example
 * // Single component import
 * import { GuestLanguageSwitcher } from '@/components/guest';
 *
 * // Multiple component import
 * import {
 *   GuestLanguageSwitcher,
 *   TranslationBanner,
 *   LanguageIndicator
 * } from '@/components/guest';
 *
 * // Import with types
 * import {
 *   TranslationBanner,
 *   type TranslationBannerProps
 * } from '@/components/guest';
 */

// =============================================================================
// GuestLanguageSwitcher - Language Selection Dropdown (REQ-345, Task 3.1)
// =============================================================================

export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';

// =============================================================================
// TranslationBanner - "Translated from X" Banner (REQ-346, Task 3.2)
// =============================================================================

export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

// =============================================================================
// MissingTranslationBanner - "Translation not available" Banner (REQ-347, Task 3.3)
// =============================================================================

export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';

// =============================================================================
// ViewOriginalToggle - Toggle Translation/Original (REQ-348, Task 3.4)
// =============================================================================

export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';

// =============================================================================
// LanguageIndicator - Current Language Display (REQ-349, Task 3.5)
// =============================================================================

export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator';
```

**Acceptance Criteria:**
- [ ] File created at `/src/components/guest/index.ts`
- [ ] File contains JSDoc header with module, created date, epic, and task references
- [ ] File contains @example block showing usage patterns
- [ ] File uses section comment blocks matching ItemManager pattern (=== separators)
- [ ] Each section includes component name, description, and request reference
- [ ] GuestLanguageSwitcher exported with named export
- [ ] GuestLanguageSwitcherProps exported as type
- [ ] TranslationBanner exported with named export
- [ ] TranslationBannerProps exported as type
- [ ] MissingTranslationBanner exported with named export
- [ ] MissingTranslationBannerProps exported as type
- [ ] ViewOriginalToggle exported with named export
- [ ] ViewOriginalToggleProps exported as type
- [ ] LanguageIndicator exported with named export
- [ ] LanguageIndicatorProps exported as type

---

### Task 3: Verify TypeScript Compilation
**Estimated Effort:** 5 minutes
**File Operations:** None (verification only)

#### 3.1 Run TypeScript Type Check

**Action:** Run TypeScript compiler in check mode to verify no errors.

**Command:**
```bash
npx tsc --noEmit
```

**Expected outcome:** No errors related to `/src/components/guest/index.ts`.

**If errors occur:**
- Check that export names match what each component's index.ts actually exports
- Check that type names match (e.g., `GuestLanguageSwitcherProps` vs `GuestLanguageSwitcherProperties`)
- Fix mismatches in the barrel export file

#### 3.2 Check for Circular Dependencies

**Action:** Verify no circular dependency warnings during build.

**Command:**
```bash
npm run build 2>&1 | grep -i "circular"
```

**Expected outcome:** No circular dependency warnings involving guest components.

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` completes without errors
- [ ] No circular dependency warnings

---

### Task 4: Verify Import Functionality
**Estimated Effort:** 5 minutes
**File Operations:** None (verification only)

#### 4.1 Verify Imports in Test or Scratch File

**Action:** Create a temporary verification that imports work correctly.

**Verification method (choose one):**

**Option A: Check in existing test file (if tests exist for guest components)**
```typescript
// Add to test file temporarily
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
  ViewOriginalToggle,
  LanguageIndicator,
  type GuestLanguageSwitcherProps,
  type TranslationBannerProps,
  type MissingTranslationBannerProps,
  type ViewOriginalToggleProps,
  type LanguageIndicatorProps,
} from '@/components/guest';
```

**Option B: Use TypeScript compiler to validate**
```bash
# Create temp file, compile, then delete
echo "import { GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, LanguageIndicator } from '@/components/guest';" > /tmp/test-imports.ts
npx tsc /tmp/test-imports.ts --noEmit --esModuleInterop --moduleResolution node --baseUrl . --paths '{"@/*":["src/*"]}'
rm /tmp/test-imports.ts
```

**Option C: Verify during next build**
```bash
npm run build
```

**Acceptance Criteria:**
- [ ] Single component import resolves: `import { GuestLanguageSwitcher } from '@/components/guest'`
- [ ] Multiple component import resolves: `import { TranslationBanner, LanguageIndicator } from '@/components/guest'`
- [ ] Type imports resolve: `import type { TranslationBannerProps } from '@/components/guest'`
- [ ] Mixed import resolves: `import { TranslationBanner, type TranslationBannerProps } from '@/components/guest'`

---

### Task 5: Run Linting and Formatting
**Estimated Effort:** 5 minutes
**File Operations:** Potential auto-fixes

#### 5.1 Run ESLint

**Action:** Run ESLint on the barrel export file.

**Command:**
```bash
npm run lint -- --fix src/components/guest/index.ts
```

**Expected outcome:** No errors or warnings. Any auto-fixable issues are corrected.

#### 5.2 Run Prettier

**Action:** Run Prettier to ensure consistent formatting.

**Command:**
```bash
npx prettier --write src/components/guest/index.ts
```

**Expected outcome:** File formatted according to project standards.

**Acceptance Criteria:**
- [ ] ESLint reports no errors for `/src/components/guest/index.ts`
- [ ] Prettier formatting applied successfully

---

### Task 6: Final Build Verification
**Estimated Effort:** 5 minutes
**File Operations:** None (verification only)

#### 6.1 Run Full Build

**Action:** Execute full project build to ensure no regressions.

**Command:**
```bash
npm run build
```

**Expected outcome:** Build completes successfully without errors.

**Acceptance Criteria:**
- [ ] `npm run build` completes successfully
- [ ] No errors mentioning guest components or barrel export
- [ ] Build output shows components are bundled correctly

---

## Files Summary

### Files to Create

| File Path | Purpose | Lines (approx) |
|-----------|---------|----------------|
| `/src/components/guest/index.ts` | Main barrel export for all guest components | ~55 |

### Files to Read (Verification)

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Verify export names |
| `/src/components/guest/TranslationBanner/index.ts` | Verify export names |
| `/src/components/guest/MissingTranslationBanner/index.ts` | Verify export names |
| `/src/components/guest/ViewOriginalToggle/index.ts` | Verify export names |
| `/src/components/guest/LanguageIndicator/index.ts` | Verify export names |

### Files Modified

None. This task only creates a new file.

---

## Acceptance Criteria Checklist

### File Structure
- [ ] Barrel export file exists at `/src/components/guest/index.ts`

### Component Exports (5 total)
- [ ] `GuestLanguageSwitcher` exported as named export
- [ ] `TranslationBanner` exported as named export
- [ ] `MissingTranslationBanner` exported as named export
- [ ] `ViewOriginalToggle` exported as named export
- [ ] `LanguageIndicator` exported as named export

### Type Exports (5 total)
- [ ] `GuestLanguageSwitcherProps` exported as type
- [ ] `TranslationBannerProps` exported as type
- [ ] `MissingTranslationBannerProps` exported as type
- [ ] `ViewOriginalToggleProps` exported as type
- [ ] `LanguageIndicatorProps` exported as type

### Code Quality
- [ ] JSDoc header with @module, @created, @lastModified, @epic, @task
- [ ] Usage examples in JSDoc @example block
- [ ] Section comment blocks separating each component (matching ItemManager pattern)
- [ ] All exports use named export syntax (no default exports)
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied

### Build & Compilation
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No circular dependency warnings
- [ ] `npm run build` succeeds

### Import Verification
- [ ] Single component import works: `import { GuestLanguageSwitcher } from '@/components/guest'`
- [ ] Multiple component import works
- [ ] Type-only import works: `import type { TranslationBannerProps } from '@/components/guest'`
- [ ] Combined component + type import works

---

## Integration Points

### Downstream Consumers

Once created, this barrel export will be used by:

| Consumer File | Usage |
|---------------|-------|
| `/src/components/ItemDisplay.tsx` | Import all guest components for translation UI |
| `/src/app/item/[publicId]/page.tsx` | Import GuestLanguageSwitcher for header |
| Future guest pages | Centralized import point |

### Example Consumer Usage

```tsx
// In ItemDisplay.tsx (Task 5.2)
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
  ViewOriginalToggle,
  LanguageIndicator,
} from '@/components/guest';

// With types
import type {
  GuestLanguageSwitcherProps,
  TranslationBannerProps,
} from '@/components/guest';
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Component index files don't exist | Task 1 verification step will catch this early |
| Export names don't match | Task 1.2 explicitly verifies export names before creating barrel |
| Type export names differ from expected | Verify actual type names in each component's types file |
| Circular dependencies | Task 3.2 specifically checks for this |

---

## Notes for Implementation Agent

1. **Do not proceed if prerequisites fail:** Task 1 is a gate. If any component directories are missing, stop and report which tasks need completion.

2. **Match exact export names:** The export names in the barrel file MUST match what each component's index.ts actually exports. If a component exports `TranslationBannerProperties` instead of `TranslationBannerProps`, use the actual name.

3. **Use project patterns:** Follow the comment section style from `/src/components/ItemManager/index.ts` (=== separator lines) and JSDoc style from `/src/components/LanguageSwitcher/index.ts`.

4. **XS task scope:** This is an extra-small task. Do not expand scope to modify component files or update consumers. Only create the barrel export file.

---

## References

- **Overview Document:** `/docs/REQ-350-create-barrel-exports-for-guest-components-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 3.6)
- **Requirements:** `/docs/gen_requests_epic4.md` (Request #350)
- **Pattern References:**
  - `/src/components/LanguageSwitcher/index.ts` (simple barrel pattern)
  - `/src/components/ItemManager/index.ts` (comprehensive barrel pattern with sections)
  - `/src/components/dashboard/index.ts` (component + type export pattern)

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience implementation*
*Task 3.6: Create barrel exports for guest components*
