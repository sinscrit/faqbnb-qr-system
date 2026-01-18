# REQ-316: Create Barrel Exports for Guest Components - Overview

**Document Created:** 2026-01-18
**Document Last Modified:** 2026-01-18
**Request Type:** ENHANCEMENT
**Size:** XS
**Priority:** Standard
**Phase:** 3 - Guest UI Components
**Task ID:** 3.6

---

## Summary

Create a centralized barrel export file for all guest components at `/src/components/guest/index.ts`, enabling clean and consistent import statements across the application. This follows the established project pattern of using barrel files for component directories.

---

## Background

### Current State

Guest components exist in individual files within the `/src/components/guest/` directory structure (created by prior tasks in Phase 3), but no centralized export file exists. Developers must import each guest component using its full path, creating verbose import statements with multiple lines when several guest components are needed in a single file.

### Desired State

A barrel file exists at `/src/components/guest/index.ts` that re-exports all guest components from their individual module files. Developers can import any combination of guest components using a single import statement that references the guest components directory.

---

## Dependencies

### Prerequisites (Must Be Complete)

| Dependency | Task ID | Description |
|------------|---------|-------------|
| GuestLanguageSwitcher Component | 3.1 | Creates `/src/components/guest/GuestLanguageSwitcher/` |
| TranslationBanner Component | 3.2 | Creates `/src/components/guest/TranslationBanner/` |
| MissingTranslationBanner Component | 3.3 | Creates `/src/components/guest/MissingTranslationBanner/` |
| ViewOriginalToggle Component | 3.4 | Creates `/src/components/guest/ViewOriginalToggle/` |
| LanguageIndicator Component | 3.5 | Creates `/src/components/guest/LanguageIndicator/` |

---

## Implementation Approach

### Pattern Reference

This implementation follows the existing barrel export patterns in the codebase. Examples:

**Pattern 1: Detailed with Documentation (ItemManager/index.ts)**
```typescript
/**
 * Module description and usage examples
 */
export { ComponentName } from './components/ComponentName';
export type { ComponentNameProps } from './components/ComponentName';
```

**Pattern 2: Simple with Comments (SimpleDashboard/index.ts)**
```typescript
// REQ-XXX: Component Description
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

**Pattern 3: Minimal (InstructionEditor/index.ts)**
```typescript
export { ComponentName } from './ComponentName';
export * from './ComponentName.types';
```

### Recommended Pattern

For this task, use Pattern 2 (Simple with Comments) which balances documentation with conciseness for a moderate-sized module.

---

## Technical Specification

### File Structure

```
/src/components/guest/
├── index.ts                             <-- NEW (this task)
├── GuestLanguageSwitcher/
│   ├── index.ts
│   ├── GuestLanguageSwitcher.tsx
│   └── GuestLanguageSwitcher.types.ts
├── TranslationBanner/
│   ├── index.ts
│   ├── TranslationBanner.tsx
│   └── TranslationBanner.types.ts
├── MissingTranslationBanner/
│   ├── index.ts
│   ├── MissingTranslationBanner.tsx
│   └── MissingTranslationBanner.types.ts
├── ViewOriginalToggle/
│   ├── index.ts
│   ├── ViewOriginalToggle.tsx
│   └── ViewOriginalToggle.types.ts
└── LanguageIndicator/
    ├── index.ts
    ├── LanguageIndicator.tsx
    └── LanguageIndicator.types.ts
```

### Barrel Export Content

The barrel file should export:

1. **GuestLanguageSwitcher** - Language selection dropdown for guests
2. **TranslationBanner** - "Translated from [Language]" indicator banner
3. **MissingTranslationBanner** - "Translation not available" info banner
4. **ViewOriginalToggle** - Toggle button between translation and original
5. **LanguageIndicator** - Compact language status indicator

Each component should export:
- The component itself (named export)
- The component's TypeScript props interface

---

## Authorized Files and Functions for Modification

### New Files

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/index.ts` | Barrel exports for all guest components |

### Files to Read (for validation)

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/GuestLanguageSwitcher/index.ts` | Verify export names |
| `/src/components/guest/TranslationBanner/index.ts` | Verify export names |
| `/src/components/guest/MissingTranslationBanner/index.ts` | Verify export names |
| `/src/components/guest/ViewOriginalToggle/index.ts` | Verify export names |
| `/src/components/guest/LanguageIndicator/index.ts` | Verify export names |

---

## Acceptance Criteria

- [ ] Index file exists at `/src/components/guest/index.ts` serving as the barrel export
- [ ] All existing guest components are re-exported from the barrel file
- [ ] Components include: GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, and LanguageIndicator
- [ ] Export statements use named exports to match the pattern of component definitions
- [ ] Import statements in existing files can successfully import guest components from the barrel path
- [ ] TypeScript compilation succeeds without errors after adding the barrel file
- [ ] The barrel file includes a comment header describing its purpose
- [ ] File follows the project's established patterns for barrel exports in other component directories

---

## Implementation Tasks

### Task 1: Create Barrel Export File

**File:** `/src/components/guest/index.ts`

**Steps:**
1. Create the barrel export file
2. Add header comment with module description, creation date, and related REQs
3. Export GuestLanguageSwitcher component and types
4. Export TranslationBanner component and types
5. Export MissingTranslationBanner component and types
6. Export ViewOriginalToggle component and types
7. Export LanguageIndicator component and types

**Expected Content Structure:**
```typescript
/**
 * Guest Components Barrel Export
 *
 * Public API for guest-facing localization components.
 * Import from '@/components/guest' for clean, predictable imports.
 *
 * @example
 * import { GuestLanguageSwitcher, TranslationBanner } from '@/components/guest';
 *
 * @module guest
 * @created 2026-01-18
 * @see Plan-111-L10N-Epic4-Guest-Experience.md
 */

// REQ-311: GuestLanguageSwitcher Component
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';

// REQ-312: TranslationBanner Component
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

// REQ-313: MissingTranslationBanner Component
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';

// REQ-314: ViewOriginalToggle Component
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';

// REQ-315: LanguageIndicator Component
export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator';
```

### Task 2: Verify TypeScript Compilation

**Steps:**
1. Run TypeScript compilation to verify no errors
2. Verify imports work from the barrel path

---

## Testing Approach

### Manual Verification

1. **Import Test:** Create a test import in a temporary file:
   ```typescript
   import {
     GuestLanguageSwitcher,
     TranslationBanner,
     MissingTranslationBanner,
     ViewOriginalToggle,
     LanguageIndicator,
   } from '@/components/guest';
   ```

2. **Type Import Test:** Verify type imports work:
   ```typescript
   import type {
     GuestLanguageSwitcherProps,
     TranslationBannerProps,
     MissingTranslationBannerProps,
     ViewOriginalToggleProps,
     LanguageIndicatorProps,
   } from '@/components/guest';
   ```

3. **Build Verification:** Run `npm run build` to ensure no compilation errors

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Prerequisite components not created | Medium | High | Verify all Phase 3 tasks (3.1-3.5) are complete before starting |
| Export name mismatch | Low | Low | Read individual component index files to confirm exact export names |
| Circular dependency | Low | Medium | Barrel file only re-exports, does not import internal dependencies |

---

## Effort Estimate

| Activity | Estimate |
|----------|----------|
| Create barrel file | 5 minutes |
| Verify exports | 5 minutes |
| Test compilation | 5 minutes |
| **Total** | **15 minutes** |

---

## References

- **Request Definition:** `/docs/gen_requests_epic4.md` (REQ-316)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Pattern Reference:** `/src/components/SimpleDashboard/index.ts`
- **Pattern Reference:** `/src/components/ItemManager/index.ts`
- **Pattern Reference:** `/src/components/dashboard/index.ts`
