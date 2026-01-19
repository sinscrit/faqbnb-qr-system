# REQ-340: Update types/index.ts with L10N Exports - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Document Modified:** 2026-01-19
**Request ID:** REQ-340
**Phase:** 1 - Types and Utilities
**Task ID:** 1.3
**Epic:** L10N Epic 4 - Guest Experience
**Size:** XS
**Estimated Effort:** ~5 minutes

---

## Executive Summary

This task adds a single export statement to the main types index file (`/src/types/index.ts`) to re-export all localization types from the dedicated `l10n.ts` module created in REQ-338. This enables clean, consistent imports of localization types throughout the application using the standard `@/types` path alias.

---

## Prerequisites

| Prerequisite | Description | Status |
|--------------|-------------|--------|
| REQ-338 | Create localization types file (`/src/types/l10n.ts`) | **REQUIRED - Must be completed first** |

**Blocking Dependency:** This task cannot be completed until REQ-338 creates the `/src/types/l10n.ts` file. Attempting to add the export before the file exists will cause TypeScript compilation errors.

---

## Detailed Tasks

### Task 1: Add L10N Export Statement to types/index.ts

**File:** `/src/types/index.ts`

**Action:** Add a single line export statement

**Location:** After line 671 (`export * from './admin';`) and before line 673 (the existing Locale/i18n types section)

#### 1.1 Code to Add

```typescript
// Localization types (L10N Epic 4 - REQ-340)
export * from './l10n';
```

#### 1.2 Context - Surrounding Code

The export should be placed in the module exports section of the file. Here's the context showing where to insert:

**Before (current state around lines 669-682):**
```typescript
// Admin types
export * from './admin';

// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';
```

**After (expected state):**
```typescript
// Admin types
export * from './admin';

// Localization types (L10N Epic 4 - REQ-340)
export * from './l10n';

// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';
```

#### 1.3 Implementation Steps

1. Open `/src/types/index.ts`
2. Navigate to line 671 (after `export * from './admin';`)
3. Add a blank line after line 671
4. Add the comment: `// Localization types (L10N Epic 4 - REQ-340)`
5. Add the export statement: `export * from './l10n';`
6. Save the file

---

### Task 2: Verify TypeScript Compilation

**Command:** `npm run build`

**Expected Result:** Build completes successfully with no TypeScript errors related to the l10n export.

**Potential Errors:**
- If REQ-338 is not complete: `Cannot find module './l10n' or its corresponding type declarations`
  - **Resolution:** Wait for REQ-338 to be completed first
- If l10n.ts has export errors: Various TypeScript errors from the l10n module
  - **Resolution:** Fix issues in `/src/types/l10n.ts` (REQ-338 scope)

---

### Task 3: Verify Import Functionality

**Test:** Create a simple import verification in any existing file or use the TypeScript language server.

**Test Import Statement:**
```typescript
import { SupportedLanguage, LanguageInfo, SUPPORTED_LANGUAGES } from '@/types';
```

**Expected Result:** TypeScript recognizes all l10n types from the `@/types` path alias without errors.

**Verification Methods:**
1. **IDE Hover:** Hover over imported types to verify they resolve correctly
2. **Go to Definition:** Use IDE "Go to Definition" to verify it navigates to `/src/types/l10n.ts`
3. **Build Test:** Run `npm run build` to confirm no import resolution errors

---

## Types Expected to Be Available After This Task

After completing this task, the following types (defined in REQ-338's `l10n.ts`) will be importable from `@/types`:

| Export | Kind | Purpose |
|--------|------|---------|
| `SupportedLanguage` | Type Alias | Union type: `'en' \| 'fr' \| 'es' \| 'de' \| 'nl' \| 'it'` |
| `LanguageInfo` | Interface | Language metadata (code, name, nativeName, flag) |
| `TranslatedContent` | Interface | Base translation metadata interface |
| `TranslatedItem` | Interface | Item with translation fields |
| `TranslatedArticle` | Interface | Article with translation fields |
| `TranslatedLink` | Interface | Link with translation fields |
| `TranslatedTag` | Interface | Tag with translation fields |
| `GuestContentResponse` | Interface | API response format for guest content |
| `LanguageAvailabilityResponse` | Interface | API response for available translations |
| `SUPPORTED_LANGUAGES` | Constant | Array of LanguageInfo objects |

---

## Potential Naming Conflict Resolution

### Existing `SupportedLanguage` Export

The current `/src/types/index.ts` already re-exports a `SupportedLanguage` type from `@/contexts/LocaleContext` (lines 674-679):

```typescript
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';
```

### Resolution Strategy

**Option 1 (Recommended):** Verify REQ-338 uses the same `SupportedLanguage` definition
- If `l10n.ts` defines `SupportedLanguage` identically to `LocaleContext`, the re-export will work
- TypeScript will use whichever is exported first (l10n.ts in this case)

**Option 2:** Remove redundant LocaleContext re-export
- If `l10n.ts` becomes the canonical source, remove `SupportedLanguage` from the LocaleContext re-exports
- Keep other LocaleContext exports (`LocaleOption`, `LocaleChangeResult`, `LocaleContextValue`)

**Option 3:** Use explicit named exports from l10n.ts
- Instead of `export * from './l10n'`, use explicit named exports to avoid conflicts

**Current Recommendation:** Proceed with `export * from './l10n'` as specified. Monitor for TypeScript errors. If conflicts arise, coordinate with REQ-338 implementation to ensure consistent type definitions.

---

## Acceptance Criteria Checklist

- [ ] The types index file at `/src/types/index.ts` includes an export statement for localization types
- [ ] The export statement uses the pattern `export * from './l10n'`
- [ ] The export statement includes a comment referencing REQ-340
- [ ] The export is positioned after the admin exports and before the LocaleContext re-exports
- [ ] Localization types can be successfully imported from `@/types` path alias
- [ ] No existing imports or type references are broken by adding the export
- [ ] TypeScript compilation succeeds without errors (`npm run build`)

---

## Testing Verification

### Test 1: Build Verification
```bash
npm run build
```
**Expected:** Build completes successfully

### Test 2: Import Verification
Create a temporary test or verify in IDE:
```typescript
// Test imports from @/types
import {
  SupportedLanguage,
  LanguageInfo,
  TranslatedContent,
  SUPPORTED_LANGUAGES
} from '@/types';

// Verify type usage
const lang: SupportedLanguage = 'en';
const info: LanguageInfo = SUPPORTED_LANGUAGES[0];
```
**Expected:** No TypeScript errors, types resolve correctly

### Test 3: Existing Imports Verification
```bash
npm run build
```
**Expected:** All existing imports throughout the codebase continue to work

---

## Rollback Plan

If the export causes issues:

1. Remove the added lines from `/src/types/index.ts`:
   ```typescript
   // Localization types (L10N Epic 4 - REQ-340)
   export * from './l10n';
   ```

2. Run `npm run build` to verify rollback

3. Investigate the root cause (likely in REQ-338's `l10n.ts` implementation)

---

## Files Changed Summary

| File | Change Type | Lines Changed |
|------|-------------|---------------|
| `/src/types/index.ts` | Modified | +2 lines (comment + export) |

---

## Dependencies

### Upstream (This Task Depends On)
| Task ID | Request | Description |
|---------|---------|-------------|
| 1.1 | REQ-338 | Create `/src/types/l10n.ts` with all localization types |

### Downstream (Tasks That Depend On This)
All Epic 4 tasks that import localization types will benefit from this centralized export, including:
- REQ-339: Guest language utility module
- Phase 2-7 tasks for translation data layer, UI components, hooks, and page updates

---

## References

- **Overview Document:** `/docs/REQ-340-update-typesindexts-with-l10n-exports-overview.md`
- **Requirements:** `/docs/gen_requests_epic4.md` (REQ-340)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 1.3)
- **Target File:** `/src/types/index.ts`
- **Source Module:** `/src/types/l10n.ts` (created by REQ-338)
- **Existing Pattern:** Lines 533-671 in `/src/types/index.ts` show the barrel export pattern

---

## Notes for Implementation Agent

1. **Do NOT start this task until REQ-338 is complete** - the `l10n.ts` file must exist
2. This is a minimal change - do not add any additional functionality
3. Follow the exact placement specified (after admin exports, before LocaleContext exports)
4. Include the comment with the REQ number for traceability
5. Run the build after making changes to verify success
6. If there are type conflicts with existing exports, document them and report back

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience, Phase 1, Task 1.3*
