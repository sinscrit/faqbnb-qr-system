# Detailed Task Breakdown: REQ-E04-013 - Create Barrel Exports for Guest Components

| **Field** | **Value** |
|-----------|-----------|
| **Request Reference** | REQ-E04-013 |
| **Source File** | `docs/gen_requests_epic4.md` - Request #13 |
| **Original Request Date** | 2026-01-22 16:55 |
| **Overview Document** | `docs/REQ-E04-013-create-barrel-exports-for-guest-components-overview.md` |
| **Detailed Breakdown Created** | 2026-01-22 23:08 |
| **T-shirt Size** | XS |
| **Estimated Effort** | 30 minutes |
| **Phase** | 3 - Guest UI Components |
| **Task ID** | 3.6 |
| **Status** | PENDING |

---

## Overview

Create a centralized barrel export file (`src/components/guest/index.ts`) that consolidates all guest experience components (GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, LanguageIndicator) to enable clean imports throughout the application. This follows the established pattern used in other component directories like SimpleDashboard and ItemManager.

**Key Goals**:
1. Create `/src/components/guest/index.ts` barrel export file
2. Export all guest components created in Phase 3 (REQ-E04-008 through REQ-E04-012)
3. Export all TypeScript type definitions for props interfaces
4. Follow existing barrel export patterns from SimpleDashboard and ItemManager
5. Include descriptive comments documenting Epic 4 context
6. Enable clean imports: `import { GuestLanguageSwitcher } from '@/components/guest'`

---

## Critical Dependencies

**BLOCKING DEPENDENCIES** - All component implementation tasks must be completed before this barrel export can be created:

- **REQ-E04-008**: Create GuestLanguageSwitcher Component
  - Provides: `GuestLanguageSwitcher` component, `GuestLanguageSwitcherProps` type
  - Required: Component file and individual barrel export

- **REQ-E04-009**: Create TranslationBanner Component
  - Provides: `TranslationBanner` component, `TranslationBannerProps` type
  - Required: Component file and individual barrel export

- **REQ-E04-010**: Create MissingTranslationBanner Component
  - Provides: `MissingTranslationBanner` component, `MissingTranslationBannerProps` type
  - Required: Component file and individual barrel export

- **REQ-E04-011**: Create ViewOriginalToggle Component
  - Provides: `ViewOriginalToggle` component, `ViewOriginalToggleProps` type
  - Required: Component file and individual barrel export

- **REQ-E04-012**: Create LanguageIndicator Component
  - Provides: `LanguageIndicator` component, `LanguageIndicatorProps` type
  - Required: Component file and individual barrel export

**BLOCKS**:
- **REQ-E04-017**: Update ItemDisplay Component (requires clean imports from `@/components/guest`)

---

## Tasks

### Task 1: Verify All Component Dependencies

**Subtask 1.1** - Verify GuestLanguageSwitcher component exists
- [ ] Check file exists: `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`
- [ ] Check barrel export exists: `src/components/guest/GuestLanguageSwitcher/index.ts`
- [ ] Verify exports: `GuestLanguageSwitcher` component and `GuestLanguageSwitcherProps` type
- [ ] Document completion status of REQ-E04-008
- [ ] If missing, note dependency blocker

**Subtask 1.2** - Verify TranslationBanner component exists
- [ ] Check file exists: `src/components/guest/TranslationBanner/TranslationBanner.tsx`
- [ ] Check barrel export exists: `src/components/guest/TranslationBanner/index.ts`
- [ ] Verify exports: `TranslationBanner` component and `TranslationBannerProps` type
- [ ] Document completion status of REQ-E04-009
- [ ] If missing, note dependency blocker

**Subtask 1.3** - Verify MissingTranslationBanner component exists
- [ ] Check file exists: `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`
- [ ] Check barrel export exists: `src/components/guest/MissingTranslationBanner/index.ts`
- [ ] Verify exports: `MissingTranslationBanner` component and `MissingTranslationBannerProps` type
- [ ] Document completion status of REQ-E04-010
- [ ] If missing, note dependency blocker

**Subtask 1.4** - Verify ViewOriginalToggle component exists
- [ ] Check file exists: `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
- [ ] Check barrel export exists: `src/components/guest/ViewOriginalToggle/index.ts`
- [ ] Verify exports: `ViewOriginalToggle` component and `ViewOriginalToggleProps` type
- [ ] Document completion status of REQ-E04-011
- [ ] If missing, note dependency blocker

**Subtask 1.5** - Verify LanguageIndicator component exists
- [ ] Check file exists: `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`
- [ ] Check barrel export exists: `src/components/guest/LanguageIndicator/index.ts`
- [ ] Verify exports: `LanguageIndicator` component and `LanguageIndicatorProps` type
- [ ] Document completion status of REQ-E04-012
- [ ] If missing, note dependency blocker

**Subtask 1.6** - Verify directory structure
- [ ] Check that `src/components/guest/` directory exists
- [ ] Verify all 5 component subdirectories exist
- [ ] Verify no conflicting `index.ts` exists at `src/components/guest/index.ts`
- [ ] Document expected directory structure
- [ ] Note any structural issues

**Verification Checklist**:
- [ ] All 5 component files exist and are implemented
- [ ] All 5 component barrel exports exist
- [ ] All components export their Props interface
- [ ] No structural conflicts or issues
- [ ] Ready to proceed with barrel export creation

---

### Task 2: Reference Existing Barrel Export Patterns

**Subtask 2.1** - Read SimpleDashboard barrel export pattern
- [ ] Read file: `src/components/SimpleDashboard/index.ts`
- [ ] Document comment style and structure
- [ ] Note grouping approach (if any)
- [ ] Document type export pattern
- [ ] Note section dividers and JSDoc usage

**Subtask 2.2** - Read ItemManager barrel export pattern
- [ ] Read file: `src/components/ItemManager/components/index.ts`
- [ ] Document component grouping strategy
- [ ] Note type export approach
- [ ] Compare with SimpleDashboard pattern
- [ ] Identify common patterns to follow

**Subtask 2.3** - Define barrel export structure
- [ ] Choose comment style (JSDoc + section dividers)
- [ ] Define component grouping strategy (by functionality)
- [ ] Define type export pattern (explicit type exports)
- [ ] Document rationale for chosen approach
- [ ] Create structure template

**Subtask 2.4** - Define component groups
- [ ] Group 1: Language Controls (GuestLanguageSwitcher)
- [ ] Group 2: Translation Banners (TranslationBanner, MissingTranslationBanner)
- [ ] Group 3: Toggle Controls (ViewOriginalToggle)
- [ ] Group 4: Indicators (LanguageIndicator)
- [ ] Document group order and rationale

**Verification Checklist**:
- [ ] Reviewed existing barrel export patterns
- [ ] Defined consistent structure for guest components
- [ ] Component groups clearly defined
- [ ] Ready to create barrel export file

---

### Task 3: Create Barrel Export File Header

**Subtask 3.1** - Create file with header comment
- [ ] Create file: `src/components/guest/index.ts`
- [ ] Add module JSDoc comment: "Guest Components Barrel Export"
- [ ] Add Epic 4 context: "L10N Guest Experience Components"
- [ ] Add description: "Provides translation UI, language controls, and indicators for unauthenticated users."
- [ ] Add @module tag: `@module components/guest`

**Subtask 3.2** - Add last modified metadata
- [ ] Add @lastModified tag with current date (2026-01-22)
- [ ] Format header comment with proper JSDoc syntax
- [ ] Add empty line after header for readability
- [ ] Verify header comment formatting

**Subtask 3.3** - Verify file creation
- [ ] Confirm file exists at `src/components/guest/index.ts`
- [ ] Verify file is UTF-8 encoded
- [ ] Verify no BOM characters
- [ ] Check file permissions are correct

**Expected Output**:
```typescript
/**
 * Guest Components Barrel Export
 *
 * Epic 4: L10N Guest Experience Components
 * Provides translation UI, language controls, and indicators for unauthenticated users.
 *
 * @module components/guest
 * @lastModified 2026-01-22
 */
```

**Verification Checklist**:
- [ ] File created successfully
- [ ] Header comment properly formatted
- [ ] Module documentation complete
- [ ] Ready to add exports

---

### Task 4: Add Language Controls Exports (Group 1)

**Subtask 4.1** - Add Language Controls section divider
- [ ] Add section divider: `// =============================================================================`
- [ ] Add section title: `// Language Controls (REQ-E04-008)`
- [ ] Add closing divider: `// =============================================================================`
- [ ] Add empty line for spacing

**Subtask 4.2** - Add GuestLanguageSwitcher export
- [ ] Add JSDoc comment: "GuestLanguageSwitcher - Dropdown for selecting display language"
- [ ] Add features line: "Features: All 6 languages, flag emojis, checkmarks for available translations"
- [ ] Add component export: `export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';`
- [ ] Add type export: `export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';`

**Subtask 4.3** - Verify export syntax
- [ ] Verify named export syntax is correct
- [ ] Verify type-only export syntax uses `export type`
- [ ] Verify import paths use relative paths (./ComponentName)
- [ ] Verify no semicolons missing

**Subtask 4.4** - Add spacing after group
- [ ] Add empty line after Language Controls group
- [ ] Verify spacing between groups for readability

**Expected Output**:
```typescript
// =============================================================================
// Language Controls (REQ-E04-008)
// =============================================================================

/**
 * GuestLanguageSwitcher - Dropdown for selecting display language
 * Features: All 6 languages, flag emojis, checkmarks for available translations
 */
export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';
```

**Verification Checklist**:
- [ ] Section divider properly formatted
- [ ] Component export added with documentation
- [ ] Type export added with correct syntax
- [ ] Spacing correct

---

### Task 5: Add Translation Banners Exports (Group 2)

**Subtask 5.1** - Add Translation Banners section divider
- [ ] Add section divider: `// =============================================================================`
- [ ] Add section title: `// Translation Banners (REQ-E04-009, REQ-E04-010)`
- [ ] Add closing divider: `// =============================================================================`
- [ ] Add empty line for spacing

**Subtask 5.2** - Add TranslationBanner export
- [ ] Add JSDoc comment: "TranslationBanner - Shows when viewing translated content"
- [ ] Add features line: 'Features: Blue banner, "Translated from X", "View original" link'
- [ ] Add component export: `export { TranslationBanner } from './TranslationBanner';`
- [ ] Add type export: `export type { TranslationBannerProps } from './TranslationBanner';`

**Subtask 5.3** - Add spacing between banner components
- [ ] Add empty line after TranslationBanner exports
- [ ] Verify spacing for readability

**Subtask 5.4** - Add MissingTranslationBanner export
- [ ] Add JSDoc comment: "MissingTranslationBanner - Shows when translation unavailable (fallback content)"
- [ ] Add features line: 'Features: Gray muted banner, "X translation not available. Showing content in Y."'
- [ ] Add component export: `export { MissingTranslationBanner } from './MissingTranslationBanner';`
- [ ] Add type export: `export type { MissingTranslationBannerProps } from './MissingTranslationBanner';`

**Subtask 5.5** - Verify banner exports
- [ ] Verify both banner components exported
- [ ] Verify both type interfaces exported
- [ ] Verify features documentation is accurate
- [ ] Verify REQ references are correct

**Subtask 5.6** - Add spacing after group
- [ ] Add empty line after Translation Banners group
- [ ] Verify spacing between groups

**Expected Output**:
```typescript
// =============================================================================
// Translation Banners (REQ-E04-009, REQ-E04-010)
// =============================================================================

/**
 * TranslationBanner - Shows when viewing translated content
 * Features: Blue banner, "Translated from X", "View original" link
 */
export { TranslationBanner } from './TranslationBanner';
export type { TranslationBannerProps } from './TranslationBanner';

/**
 * MissingTranslationBanner - Shows when translation unavailable (fallback content)
 * Features: Gray muted banner, "X translation not available. Showing content in Y."
 */
export { MissingTranslationBanner } from './MissingTranslationBanner';
export type { MissingTranslationBannerProps } from './MissingTranslationBanner';
```

**Verification Checklist**:
- [ ] Section divider properly formatted
- [ ] Both banner components exported
- [ ] Both type interfaces exported
- [ ] Documentation accurate
- [ ] Spacing correct

---

### Task 6: Add Toggle Controls Exports (Group 3)

**Subtask 6.1** - Add Toggle Controls section divider
- [ ] Add section divider: `// =============================================================================`
- [ ] Add section title: `// Toggle Controls (REQ-E04-011)`
- [ ] Add closing divider: `// =============================================================================`
- [ ] Add empty line for spacing

**Subtask 6.2** - Add ViewOriginalToggle export
- [ ] Add JSDoc comment: "ViewOriginalToggle - Button to switch between translated and original content"
- [ ] Add features line: 'Features: Secondary button style, "View in original (X)" / "View translation"'
- [ ] Add component export: `export { ViewOriginalToggle } from './ViewOriginalToggle';`
- [ ] Add type export: `export type { ViewOriginalToggleProps } from './ViewOriginalToggle';`

**Subtask 6.3** - Verify toggle export
- [ ] Verify component export syntax
- [ ] Verify type export syntax
- [ ] Verify features documentation is accurate
- [ ] Verify REQ reference is correct

**Subtask 6.4** - Add spacing after group
- [ ] Add empty line after Toggle Controls group
- [ ] Verify spacing between groups

**Expected Output**:
```typescript
// =============================================================================
// Toggle Controls (REQ-E04-011)
// =============================================================================

/**
 * ViewOriginalToggle - Button to switch between translated and original content
 * Features: Secondary button style, "View in original (X)" / "View translation"
 */
export { ViewOriginalToggle } from './ViewOriginalToggle';
export type { ViewOriginalToggleProps } from './ViewOriginalToggle';
```

**Verification Checklist**:
- [ ] Section divider properly formatted
- [ ] Component exported
- [ ] Type interface exported
- [ ] Documentation accurate
- [ ] Spacing correct

---

### Task 7: Add Indicators Exports (Group 4)

**Subtask 7.1** - Add Indicators section divider
- [ ] Add section divider: `// =============================================================================`
- [ ] Add section title: `// Indicators (REQ-E04-012)`
- [ ] Add closing divider: `// =============================================================================`
- [ ] Add empty line for spacing

**Subtask 7.2** - Add LanguageIndicator export
- [ ] Add JSDoc comment: "LanguageIndicator - Compact display of current language with flag"
- [ ] Add features line: 'Features: Flag emoji + native name, optional "Translated from X" subtitle'
- [ ] Add use case line: "Use case: Headers, status bars"
- [ ] Add component export: `export { LanguageIndicator } from './LanguageIndicator';`
- [ ] Add type export: `export type { LanguageIndicatorProps } from './LanguageIndicator';`

**Subtask 7.3** - Verify indicator export
- [ ] Verify component export syntax
- [ ] Verify type export syntax
- [ ] Verify features documentation is accurate
- [ ] Verify use case line is helpful
- [ ] Verify REQ reference is correct

**Subtask 7.4** - Verify no trailing empty lines
- [ ] Verify file ends after LanguageIndicator exports
- [ ] No extra empty lines at end of file
- [ ] Single newline at end of file (standard)

**Expected Output**:
```typescript
// =============================================================================
// Indicators (REQ-E04-012)
// =============================================================================

/**
 * LanguageIndicator - Compact display of current language with flag
 * Features: Flag emoji + native name, optional "Translated from X" subtitle
 * Use case: Headers, status bars
 */
export { LanguageIndicator } from './LanguageIndicator';
export type { LanguageIndicatorProps } from './LanguageIndicator';
```

**Verification Checklist**:
- [ ] Section divider properly formatted
- [ ] Component exported
- [ ] Type interface exported
- [ ] Documentation accurate with use case
- [ ] Spacing correct
- [ ] File ends properly

---

### Task 8: Verify File Structure and Formatting

**Subtask 8.1** - Review complete barrel export structure
- [ ] Read entire `src/components/guest/index.ts` file
- [ ] Verify header comment is present and correct
- [ ] Verify all 4 groups are present (Language Controls, Translation Banners, Toggle Controls, Indicators)
- [ ] Verify all 5 components are exported
- [ ] Verify all 5 type interfaces are exported

**Subtask 8.2** - Verify export order
- [ ] Verify Group 1: Language Controls (GuestLanguageSwitcher)
- [ ] Verify Group 2: Translation Banners (TranslationBanner, MissingTranslationBanner)
- [ ] Verify Group 3: Toggle Controls (ViewOriginalToggle)
- [ ] Verify Group 4: Indicators (LanguageIndicator)
- [ ] Verify groups are in logical order (not alphabetical)

**Subtask 8.3** - Verify comment formatting
- [ ] Verify all section dividers use `// =============================================================================`
- [ ] Verify all component comments use JSDoc format (`/** */`)
- [ ] Verify all REQ references are present and correct
- [ ] Verify all features lines are accurate
- [ ] Verify spacing between sections is consistent

**Subtask 8.4** - Verify export syntax
- [ ] Verify all component exports use named export: `export { Component }`
- [ ] Verify all type exports use type-only export: `export type { ComponentProps }`
- [ ] Verify all import paths use relative paths: `'./Component'`
- [ ] Verify all statements end with semicolons
- [ ] Verify no syntax errors

**Subtask 8.5** - Count and verify exports
- [ ] Count total component exports: should be 5
- [ ] Count total type exports: should be 5
- [ ] Verify no duplicate exports
- [ ] Verify no missing exports
- [ ] Document export count

**Verification Checklist**:
- [ ] File structure correct
- [ ] All exports present
- [ ] Formatting consistent
- [ ] No syntax errors
- [ ] Ready for TypeScript validation

---

### Task 9: TypeScript Compilation Validation

**Subtask 9.1** - Run TypeScript compiler check
- [ ] Run command: `npm run typecheck` or `npx tsc --noEmit`
- [ ] Verify no compilation errors
- [ ] Document any errors related to guest components barrel export
- [ ] If errors exist, note line numbers and error messages

**Subtask 9.2** - Verify import path resolution
- [ ] Verify `@/components/guest` path alias resolves correctly
- [ ] Check tsconfig.json has correct path mapping: `"@/components/*": ["./src/components/*"]`
- [ ] Verify no "Cannot find module" errors for guest components
- [ ] Verify no "Module has no exported member" errors

**Subtask 9.3** - Verify component import resolution
- [ ] Verify GuestLanguageSwitcher import resolves: `'./GuestLanguageSwitcher'`
- [ ] Verify TranslationBanner import resolves: `'./TranslationBanner'`
- [ ] Verify MissingTranslationBanner import resolves: `'./MissingTranslationBanner'`
- [ ] Verify ViewOriginalToggle import resolves: `'./ViewOriginalToggle'`
- [ ] Verify LanguageIndicator import resolves: `'./LanguageIndicator'`

**Subtask 9.4** - Verify type export resolution
- [ ] Verify GuestLanguageSwitcherProps type resolves
- [ ] Verify TranslationBannerProps type resolves
- [ ] Verify MissingTranslationBannerProps type resolves
- [ ] Verify ViewOriginalToggleProps type resolves
- [ ] Verify LanguageIndicatorProps type resolves

**Subtask 9.5** - Fix any compilation errors
- [ ] If errors exist, identify root cause
- [ ] Fix import paths if incorrect
- [ ] Fix export syntax if incorrect
- [ ] Re-run typecheck after fixes
- [ ] Verify all errors resolved

**Verification Checklist**:
- [ ] TypeScript compilation successful
- [ ] No import resolution errors
- [ ] All component imports resolve
- [ ] All type exports resolve
- [ ] Ready for integration testing

---

### Task 10: Create Test Import Validation

**Subtask 10.1** - Create temporary test file
- [ ] Create file: `src/components/guest/__test-imports.ts` (temporary)
- [ ] Add comment: "Temporary file to validate barrel export imports"
- [ ] Document purpose: Verify all exports work correctly

**Subtask 10.2** - Test component imports
- [ ] Add import statement:
  ```typescript
  import {
    GuestLanguageSwitcher,
    TranslationBanner,
    MissingTranslationBanner,
    ViewOriginalToggle,
    LanguageIndicator,
  } from '@/components/guest';
  ```
- [ ] Verify TypeScript resolves all imports
- [ ] Verify no "Cannot find module" errors
- [ ] Verify no "Module has no exported member" errors

**Subtask 10.3** - Test type-only imports
- [ ] Add type import statement:
  ```typescript
  import type {
    GuestLanguageSwitcherProps,
    TranslationBannerProps,
    MissingTranslationBannerProps,
    ViewOriginalToggleProps,
    LanguageIndicatorProps,
  } from '@/components/guest';
  ```
- [ ] Verify TypeScript resolves all type imports
- [ ] Verify `import type` syntax works correctly

**Subtask 10.4** - Test mixed imports
- [ ] Add mixed import statement:
  ```typescript
  import {
    GuestLanguageSwitcher,
    type GuestLanguageSwitcherProps,
  } from '@/components/guest';
  ```
- [ ] Verify mixed component and type import works
- [ ] Verify TypeScript resolves correctly

**Subtask 10.5** - Run typecheck on test file
- [ ] Run: `npx tsc --noEmit src/components/guest/__test-imports.ts`
- [ ] Verify no compilation errors
- [ ] Verify all imports resolve correctly
- [ ] Document test results

**Subtask 10.6** - Clean up test file
- [ ] Delete temporary test file: `src/components/guest/__test-imports.ts`
- [ ] Verify file deleted
- [ ] Do not commit test file

**Verification Checklist**:
- [ ] Test file created successfully
- [ ] All component imports work
- [ ] All type imports work
- [ ] Mixed imports work
- [ ] Test file cleaned up

---

### Task 11: Verify Path Alias Configuration

**Subtask 11.1** - Read tsconfig.json configuration
- [ ] Read file: `tsconfig.json`
- [ ] Find `compilerOptions.paths` configuration
- [ ] Verify `@/components/*` path alias exists
- [ ] Verify it maps to `["./src/components/*"]`
- [ ] Document path alias configuration

**Subtask 11.2** - Test path alias resolution
- [ ] Verify `@/components/guest` resolves to `src/components/guest`
- [ ] Verify `@/components/guest/index.ts` is used for barrel export
- [ ] Verify no path alias conflicts exist
- [ ] Document path resolution behavior

**Subtask 11.3** - Verify Next.js configuration
- [ ] Check if `next.config.js` or `next.config.ts` has path overrides
- [ ] Verify no conflicting module resolution settings
- [ ] Document Next.js configuration if relevant

**Subtask 11.4** - Test import from different locations
- [ ] Test import from `src/components/` directory (sibling import)
- [ ] Test import from `src/app/` directory (cross-directory import)
- [ ] Test import from `src/lib/` directory (utility import)
- [ ] Verify all locations can import successfully

**Verification Checklist**:
- [ ] Path alias correctly configured
- [ ] `@/components/guest` resolves correctly
- [ ] No conflicting configurations
- [ ] Imports work from all locations

---

### Task 12: Document Import Usage Patterns

**Subtask 12.1** - Document clean import pattern (primary use case)
- [ ] Example: `import { GuestLanguageSwitcher, TranslationBanner } from '@/components/guest';`
- [ ] Document that this is the recommended approach
- [ ] Note benefits: Clean, concise, single import statement
- [ ] Document use case: External consumers (pages, other components)

**Subtask 12.2** - Document type-only import pattern
- [ ] Example: `import type { GuestLanguageSwitcherProps } from '@/components/guest';`
- [ ] Document use case: Type annotations, interfaces, generics
- [ ] Note benefits: Explicit type-only imports, optimized bundle
- [ ] Document when to use `import type` vs regular import

**Subtask 12.3** - Document mixed import pattern
- [ ] Example: `import { GuestLanguageSwitcher, type GuestLanguageSwitcherProps } from '@/components/guest';`
- [ ] Document use case: Component + types from same module
- [ ] Note benefits: Single import statement for related exports
- [ ] Document inline type modifier usage

**Subtask 12.4** - Document anti-patterns (what NOT to do)
- [ ] Anti-pattern: Guest components importing from barrel export (creates circular dependency)
- [ ] Anti-pattern: Using relative paths from outside components directory
- [ ] Anti-pattern: Importing individual component files directly instead of barrel export
- [ ] Document why these patterns should be avoided

**Subtask 12.5** - Create usage examples in comments
- [ ] Add usage examples to barrel export file header (optional)
- [ ] Document recommended import patterns
- [ ] Add to README or documentation if applicable

**Verification Checklist**:
- [ ] Import patterns documented
- [ ] Type-only imports explained
- [ ] Mixed imports explained
- [ ] Anti-patterns documented

---

### Task 13: Verify No Circular Dependencies

**Subtask 13.1** - Check GuestLanguageSwitcher for circular imports
- [ ] Read: `src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`
- [ ] Verify it does NOT import from `@/components/guest`
- [ ] Verify it only imports from specific paths (e.g., `@/types`, `@/lib`)
- [ ] Document import safety

**Subtask 13.2** - Check TranslationBanner for circular imports
- [ ] Read: `src/components/guest/TranslationBanner/TranslationBanner.tsx`
- [ ] Verify it does NOT import from `@/components/guest`
- [ ] Verify no circular dependencies
- [ ] Document import safety

**Subtask 13.3** - Check MissingTranslationBanner for circular imports
- [ ] Read: `src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`
- [ ] Verify it does NOT import from `@/components/guest`
- [ ] Verify no circular dependencies
- [ ] Document import safety

**Subtask 13.4** - Check ViewOriginalToggle for circular imports
- [ ] Read: `src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
- [ ] Verify it does NOT import from `@/components/guest`
- [ ] Verify no circular dependencies
- [ ] Document import safety

**Subtask 13.5** - Check LanguageIndicator for circular imports
- [ ] Read: `src/components/guest/LanguageIndicator/LanguageIndicator.tsx`
- [ ] Verify it does NOT import from `@/components/guest`
- [ ] Verify no circular dependencies
- [ ] Document import safety

**Subtask 13.6** - Verify component index files don't create cycles
- [ ] Check all component-level `index.ts` files
- [ ] Verify they only export from their own component file
- [ ] Verify they don't import from parent barrel export
- [ ] Document safe re-export pattern

**Verification Checklist**:
- [ ] No guest components import from barrel export
- [ ] No circular dependencies detected
- [ ] All component imports are safe
- [ ] Component-level barrel exports are safe

---

### Task 14: ESLint and Code Quality Validation

**Subtask 14.1** - Run ESLint on barrel export file
- [ ] Run command: `npx eslint src/components/guest/index.ts`
- [ ] Verify no linting errors
- [ ] Verify no linting warnings
- [ ] Document any issues found

**Subtask 14.2** - Fix any ESLint errors
- [ ] If errors exist, identify error codes
- [ ] Fix formatting issues (if any)
- [ ] Fix import/export issues (if any)
- [ ] Re-run ESLint after fixes

**Subtask 14.3** - Verify import/export consistency
- [ ] Verify all imports use consistent quote style (single vs double)
- [ ] Verify all exports use consistent formatting
- [ ] Verify semicolons are consistent (present or absent based on config)
- [ ] Verify spacing is consistent

**Subtask 14.4** - Run Prettier formatting (if configured)
- [ ] Run command: `npx prettier --write src/components/guest/index.ts`
- [ ] Verify file is properly formatted
- [ ] Verify no formatting changes needed
- [ ] Document formatting standards

**Subtask 14.5** - Verify code quality
- [ ] Verify no unused imports
- [ ] Verify no missing exports
- [ ] Verify export names match component names
- [ ] Verify type export names match prop interface names

**Verification Checklist**:
- [ ] ESLint passes with no errors
- [ ] Prettier formatting correct
- [ ] Code quality standards met
- [ ] No unused or missing exports

---

### Task 15: Build Validation

**Subtask 15.1** - Run Next.js build
- [ ] Run command: `npm run build`
- [ ] Verify build completes successfully
- [ ] Document build time
- [ ] Verify no build errors related to guest components

**Subtask 15.2** - Check build output for barrel export
- [ ] Verify barrel export is included in build output
- [ ] Verify components are bundled correctly
- [ ] Check for any warnings about barrel exports
- [ ] Verify tree shaking works correctly (no unused exports in bundle)

**Subtask 15.3** - Verify production build
- [ ] Verify barrel export works in production mode
- [ ] Check bundle size impact (should be minimal)
- [ ] Verify no runtime errors related to imports
- [ ] Document production build behavior

**Subtask 15.4** - Test build artifacts
- [ ] Verify `.next/` directory contains guest components
- [ ] Verify no missing module errors in build
- [ ] Verify component chunks are created correctly
- [ ] Document build artifacts

**Verification Checklist**:
- [ ] Build completes successfully
- [ ] No build errors
- [ ] Barrel export included in build
- [ ] Production build works correctly

---

### Task 16: Integration Testing Preparation

**Subtask 16.1** - Identify integration test locations
- [ ] Document that REQ-E04-017 (Update ItemDisplay) will test barrel export
- [ ] Identify any other components that will use guest components
- [ ] Document integration points
- [ ] Note that integration tests are out of scope for this task

**Subtask 16.2** - Document integration test scenarios
- [ ] Scenario 1: Import multiple guest components in ItemDisplay
- [ ] Scenario 2: Use type definitions for prop typing
- [ ] Scenario 3: Import from nested pages (app/item/[id]/page.tsx)
- [ ] Document expected behavior for each scenario

**Subtask 16.3** - Verify barrel export is ready for integration
- [ ] Verify all 5 components are exported
- [ ] Verify all 5 types are exported
- [ ] Verify TypeScript compilation passes
- [ ] Verify build succeeds
- [ ] Document readiness status

**Verification Checklist**:
- [ ] Integration test scenarios documented
- [ ] Barrel export ready for use
- [ ] Integration points identified
- [ ] Ready for REQ-E04-017

---

### Task 17: Documentation and Comments Verification

**Subtask 17.1** - Verify header documentation
- [ ] Verify header comment includes Epic 4 context
- [ ] Verify module description is accurate
- [ ] Verify @module tag is correct
- [ ] Verify @lastModified date is current (2026-01-22)

**Subtask 17.2** - Verify component documentation
- [ ] Verify each component has JSDoc comment
- [ ] Verify features list is accurate for each component
- [ ] Verify descriptions match component behavior
- [ ] Verify use case documented for LanguageIndicator

**Subtask 17.3** - Verify REQ references
- [ ] Verify Language Controls references REQ-E04-008
- [ ] Verify Translation Banners references REQ-E04-009, REQ-E04-010
- [ ] Verify Toggle Controls references REQ-E04-011
- [ ] Verify Indicators references REQ-E04-012

**Subtask 17.4** - Verify comment consistency
- [ ] Verify all section dividers use same format
- [ ] Verify all JSDoc comments use same structure
- [ ] Verify spacing between sections is consistent
- [ ] Verify no typos or grammatical errors

**Verification Checklist**:
- [ ] Header documentation complete
- [ ] Component documentation accurate
- [ ] REQ references correct
- [ ] Comments consistent and error-free

---

### Task 18: Verify Barrel Export Pattern Consistency

**Subtask 18.1** - Compare with SimpleDashboard pattern
- [ ] Read: `src/components/SimpleDashboard/index.ts`
- [ ] Compare comment style (should match or be similar)
- [ ] Compare export structure (should follow same pattern)
- [ ] Compare grouping approach (may differ by design)
- [ ] Document similarities and differences

**Subtask 18.2** - Compare with ItemManager pattern
- [ ] Read: `src/components/ItemManager/components/index.ts`
- [ ] Compare export syntax (should be consistent)
- [ ] Compare type export pattern (should match)
- [ ] Compare overall structure (should be similar)
- [ ] Document pattern consistency

**Subtask 18.3** - Verify consistency with project conventions
- [ ] Verify comment style matches project standards
- [ ] Verify export syntax matches project conventions
- [ ] Verify naming conventions are consistent
- [ ] Verify file structure follows project patterns

**Subtask 18.4** - Document pattern rationale
- [ ] Document why grouped comments are used
- [ ] Document why explicit type exports are used
- [ ] Document why components are grouped by functionality
- [ ] Document pattern benefits

**Verification Checklist**:
- [ ] Pattern consistent with SimpleDashboard
- [ ] Pattern consistent with ItemManager
- [ ] Follows project conventions
- [ ] Rationale documented

---

### Task 19: Verify Component-Level Barrel Exports

**Subtask 19.1** - Verify GuestLanguageSwitcher barrel export
- [ ] Read: `src/components/guest/GuestLanguageSwitcher/index.ts`
- [ ] Verify it exports GuestLanguageSwitcher component
- [ ] Verify it exports GuestLanguageSwitcherProps type
- [ ] Verify export syntax is correct
- [ ] Document component-level export pattern

**Subtask 19.2** - Verify TranslationBanner barrel export
- [ ] Read: `src/components/guest/TranslationBanner/index.ts`
- [ ] Verify it exports TranslationBanner component
- [ ] Verify it exports TranslationBannerProps type
- [ ] Verify export syntax is correct

**Subtask 19.3** - Verify MissingTranslationBanner barrel export
- [ ] Read: `src/components/guest/MissingTranslationBanner/index.ts`
- [ ] Verify it exports MissingTranslationBanner component
- [ ] Verify it exports MissingTranslationBannerProps type
- [ ] Verify export syntax is correct

**Subtask 19.4** - Verify ViewOriginalToggle barrel export
- [ ] Read: `src/components/guest/ViewOriginalToggle/index.ts`
- [ ] Verify it exports ViewOriginalToggle component
- [ ] Verify it exports ViewOriginalToggleProps type
- [ ] Verify export syntax is correct

**Subtask 19.5** - Verify LanguageIndicator barrel export
- [ ] Read: `src/components/guest/LanguageIndicator/index.ts`
- [ ] Verify it exports LanguageIndicator component
- [ ] Verify it exports LanguageIndicatorProps type
- [ ] Verify export syntax is correct

**Subtask 19.6** - Document two-level barrel export pattern
- [ ] Document that component-level barrel exports simplify imports
- [ ] Document that top-level barrel export re-exports from component-level
- [ ] Document pattern benefits: encapsulation, maintainability
- [ ] Verify pattern is consistent across all components

**Verification Checklist**:
- [ ] All component-level barrel exports exist
- [ ] All export correct component and type
- [ ] Export syntax consistent
- [ ] Two-level pattern documented

---

### Task 20: Create File Checklist for Completion

**Subtask 20.1** - Create pre-implementation checklist
- [ ] Document: REQ-E04-008 (GuestLanguageSwitcher) must be completed
- [ ] Document: REQ-E04-009 (TranslationBanner) must be completed
- [ ] Document: REQ-E04-010 (MissingTranslationBanner) must be completed
- [ ] Document: REQ-E04-011 (ViewOriginalToggle) must be completed
- [ ] Document: REQ-E04-012 (LanguageIndicator) must be completed
- [ ] Document: All component directories have index.ts barrel exports

**Subtask 20.2** - Create post-implementation checklist
- [ ] Document: File created at `src/components/guest/index.ts`
- [ ] Document: All 5 components exported
- [ ] Document: All 5 type interfaces exported
- [ ] Document: Comments include Epic 4 context
- [ ] Document: Components grouped by functionality
- [ ] Document: REQ references documented
- [ ] Document: TypeScript compiles without errors
- [ ] Document: Import path `@/components/guest` resolves

**Subtask 20.3** - Create validation checklist
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no errors
- [ ] Build succeeds
- [ ] No circular dependencies
- [ ] Path alias resolves correctly
- [ ] All imports work from test file

**Subtask 20.4** - Create integration readiness checklist
- [ ] All 5 guest components exist and are implemented
- [ ] Barrel export file created and validated
- [ ] TypeScript types exported correctly
- [ ] No compilation errors
- [ ] Ready for use in REQ-E04-017 (Update ItemDisplay)

**Verification Checklist**:
- [ ] Pre-implementation checklist complete
- [ ] Post-implementation checklist complete
- [ ] Validation checklist complete
- [ ] Integration readiness confirmed

---

### Task 21: Alternative Approaches Documentation

**Subtask 21.1** - Document alternative: Flat exports (no grouping)
- [ ] Describe approach: All exports without section dividers
- [ ] Pros: Simpler, less code
- [ ] Cons: No organization, harder to navigate
- [ ] Decision: Rejected - grouping provides better documentation

**Subtask 21.2** - Document alternative: Single export object
- [ ] Describe approach: `export const GuestComponents = { GuestLanguageSwitcher, ... }`
- [ ] Pros: Namespace all exports under single object
- [ ] Cons: Non-standard pattern, verbose imports
- [ ] Decision: Rejected - named exports are idiomatic

**Subtask 21.3** - Document alternative: Automated export generation
- [ ] Describe approach: Script to generate exports from directory
- [ ] Pros: No manual maintenance
- [ ] Cons: Loses explicit documentation, adds build complexity
- [ ] Decision: Rejected - manual export sufficient for 5 components

**Subtask 21.4** - Document chosen approach
- [ ] Approach: Manual grouped exports with documentation
- [ ] Rationale: Clear documentation, explicit API surface, manageable size
- [ ] Benefits: Self-documenting, maintainable, consistent with project patterns

**Verification Checklist**:
- [ ] Alternative approaches documented
- [ ] Pros and cons listed for each
- [ ] Chosen approach rationale clear
- [ ] Decision justifications documented

---

### Task 22: Maintenance Guidelines Documentation

**Subtask 22.1** - Document when to update barrel export
- [ ] Document: New guest component added to Epic 4
- [ ] Document: Component renamed or moved
- [ ] Document: Component removed or deprecated
- [ ] Document: Props interface renamed

**Subtask 22.2** - Document how to update barrel export
- [ ] Step 1: Add export in appropriate comment group
- [ ] Step 2: Export both component and types
- [ ] Step 3: Add descriptive JSDoc comment
- [ ] Step 4: Include REQ reference if applicable
- [ ] Step 5: Run typecheck to validate
- [ ] Step 6: Update overview document if needed

**Subtask 22.3** - Document adding new component groups
- [ ] Document when to create new group (new component category)
- [ ] Document group naming convention
- [ ] Document group ordering strategy
- [ ] Document section divider format

**Subtask 22.4** - Document maintenance best practices
- [ ] Best practice: Update barrel export when adding components
- [ ] Best practice: Update comments when components change functionality
- [ ] Best practice: Include barrel export in code review for component PRs
- [ ] Best practice: Run typecheck after barrel export changes

**Verification Checklist**:
- [ ] Update triggers documented
- [ ] Update steps documented
- [ ] New group guidelines documented
- [ ] Best practices documented

---

### Task 23: Risk Mitigation Verification

**Subtask 23.1** - Verify mitigation: Missing component files
- [ ] Risk: Barrel export created before all components exist
- [ ] Mitigation: Task 1 verifies all 5 components exist before creating barrel export
- [ ] Detection: TypeScript compilation errors if imports fail
- [ ] Verify mitigation is effective

**Subtask 23.2** - Verify mitigation: Type export consistency
- [ ] Risk: Inconsistent type names or missing type exports
- [ ] Mitigation: Each component exports its Props interface
- [ ] Pattern: All components export `export type { [ComponentName]Props }`
- [ ] Verify all component types are exported correctly

**Subtask 23.3** - Verify mitigation: Circular dependency
- [ ] Risk: Guest components import from barrel export
- [ ] Mitigation: Task 13 verifies no guest component imports from `@/components/guest`
- [ ] Rule: Only external consumers use barrel export
- [ ] Verify no circular dependencies exist

**Subtask 23.4** - Verify mitigation: Path alias resolution
- [ ] Risk: `@/components/guest` alias may not resolve
- [ ] Mitigation: Task 11 verifies tsconfig.json path mapping
- [ ] Existing: All other `@/components/*` imports work
- [ ] Verify path alias resolves correctly

**Subtask 23.5** - Verify mitigation: Stale exports
- [ ] Risk: Barrel export not updated when new components added
- [ ] Mitigation: Task 22 documents maintenance guidelines
- [ ] Future: Consider automated export generation tools
- [ ] Document ongoing maintenance responsibility

**Verification Checklist**:
- [ ] All risks identified and mitigated
- [ ] Mitigation strategies effective
- [ ] Verification tasks in place
- [ ] Ongoing maintenance documented

---

### Task 24: Final Validation and Completion

**Subtask 24.1** - Run complete build and test suite
- [ ] Run: `npm run build`
- [ ] Run: `npm run typecheck`
- [ ] Run: `npm run lint` (if applicable)
- [ ] Verify all commands succeed
- [ ] Document final validation results

**Subtask 24.2** - Verify all task checklist items
- [ ] Review all 24 tasks
- [ ] Verify all subtasks completed
- [ ] Verify all verification checklists satisfied
- [ ] Document any incomplete items

**Subtask 24.3** - Verify barrel export file is complete
- [ ] File exists at `src/components/guest/index.ts`
- [ ] Header comment complete with Epic 4 context
- [ ] All 5 components exported (GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, LanguageIndicator)
- [ ] All 5 types exported (Props interfaces)
- [ ] Comments include REQ references
- [ ] Grouped by functionality (4 groups)

**Subtask 24.4** - Verify integration readiness
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] No circular dependencies
- [ ] Path alias `@/components/guest` resolves
- [ ] Ready for use in REQ-E04-017 (Update ItemDisplay Component)

**Subtask 24.5** - Document completion status
- [ ] Task REQ-E04-013 completed successfully
- [ ] Barrel export file created and validated
- [ ] All dependencies satisfied (REQ-E04-008 through REQ-E04-012)
- [ ] Blocks REQ-E04-017 now unblocked
- [ ] Document completion timestamp

**Subtask 24.6** - Create completion summary
- [ ] Summary: Centralized barrel export created for all 5 guest components
- [ ] Summary: Enables clean imports via `@/components/guest`
- [ ] Summary: Follows established patterns from SimpleDashboard and ItemManager
- [ ] Summary: TypeScript compilation and build validation passed
- [ ] Summary: Ready for integration in REQ-E04-017

**Final Verification Checklist**:
- [ ] All tasks completed
- [ ] All verification checklists satisfied
- [ ] Build and typecheck pass
- [ ] Barrel export file complete
- [ ] Integration ready
- [ ] Documentation complete

---

## Build & Test Commands

### TypeScript Compilation
```bash
# Run type checking
npm run typecheck

# Or use tsc directly
npx tsc --noEmit

# Expected: No compilation errors related to guest components barrel export
```

### Linting
```bash
# Run ESLint on barrel export file
npx eslint src/components/guest/index.ts

# Expected: No linting errors or warnings
```

### Build
```bash
# Run Next.js production build
npm run build

# Expected: Build completes successfully, barrel export included in output
```

### Import Validation (Manual Testing)
```bash
# Create temporary test file to validate imports
cat > src/components/guest/__test-imports.ts << 'EOF'
// Test barrel export imports
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
  ViewOriginalToggle,
  LanguageIndicator,
} from '@/components/guest';

import type {
  GuestLanguageSwitcherProps,
  TranslationBannerProps,
  MissingTranslationBannerProps,
  ViewOriginalToggleProps,
  LanguageIndicatorProps,
} from '@/components/guest';

// Verify all imports resolve
console.log('All guest component imports resolved successfully');
EOF

# Run typecheck on test file
npx tsc --noEmit src/components/guest/__test-imports.ts

# Clean up test file
rm src/components/guest/__test-imports.ts

# Expected: No compilation errors, all imports resolve correctly
```

### Verify No Circular Dependencies
```bash
# Check for circular dependencies (if tool available)
npx madge --circular --extensions ts,tsx src/components/guest/

# Expected: No circular dependencies detected
```

### Directory Structure Validation
```bash
# Verify all component directories exist
ls -la src/components/guest/

# Expected output should show:
# - GuestLanguageSwitcher/
# - TranslationBanner/
# - MissingTranslationBanner/
# - ViewOriginalToggle/
# - LanguageIndicator/
# - index.ts (barrel export)
```

### Complete Validation Suite
```bash
# Run complete validation
npm run typecheck && \
npm run lint && \
npm run build

# Expected: All commands succeed with no errors
```

---

## Success Criteria

**Task is complete when**:
1. ✅ File `src/components/guest/index.ts` created
2. ✅ All 5 guest components exported (GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, LanguageIndicator)
3. ✅ All 5 type interfaces exported (Props interfaces)
4. ✅ Header comment includes Epic 4 context and module documentation
5. ✅ Components grouped by functionality (Language Controls, Translation Banners, Toggle Controls, Indicators)
6. ✅ Each export has descriptive JSDoc comment with features list
7. ✅ REQ references documented for each group
8. ✅ TypeScript compilation passes with no errors
9. ✅ ESLint passes with no errors or warnings
10. ✅ Build succeeds with barrel export included
11. ✅ Path alias `@/components/guest` resolves correctly
12. ✅ No circular dependencies detected
13. ✅ Component-level barrel exports verified (all 5 exist)
14. ✅ Import validation test passes
15. ✅ Pattern consistent with SimpleDashboard and ItemManager
16. ✅ Ready for integration in REQ-E04-017 (Update ItemDisplay)

**Integration ready when**:
- Consumers can import: `import { GuestLanguageSwitcher } from '@/components/guest';`
- Type imports work: `import type { GuestLanguageSwitcherProps } from '@/components/guest';`
- Mixed imports work: `import { Component, type ComponentProps } from '@/components/guest';`
- No compilation errors
- No runtime errors

---

## Notes

**Context from Overview Document**:
- This is Task 3.6 in Phase 3 (Guest UI Components)
- Depends on REQ-E04-008, REQ-E04-009, REQ-E04-010, REQ-E04-011, REQ-E04-012
- Blocks REQ-E04-017 (Update ItemDisplay Component)
- T-shirt size: XS (30 minutes estimated effort)
- Pure TypeScript re-exports, no runtime logic
- No unit tests required (barrel export has no logic to test)
- TypeScript compilation validates correctness

**Barrel Export Pattern Rationale**:
- **Clean Imports**: Single import statement for multiple components
- **Encapsulation**: Internal structure can change without affecting imports
- **Discoverability**: Single file shows all available components
- **Consistency**: Matches existing patterns in SimpleDashboard, ItemManager

**Component Grouping Strategy**:
- Language Controls: Interactive controls for changing language
- Translation Banners: Informational banners about translation status
- Toggle Controls: Buttons for switching between translations
- Indicators: Read-only display of language information

**Maintenance**:
- Update barrel export when adding new guest components
- Update comments when components change functionality
- Include barrel export in code review for component PRs
- Run typecheck after barrel export changes

---

**Last Modified**: 2026-01-22 23:08
