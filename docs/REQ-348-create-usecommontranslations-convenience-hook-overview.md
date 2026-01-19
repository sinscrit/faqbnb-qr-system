# REQ-348: Create useCommonTranslations Convenience Hook - Implementation Overview

**Generated:** 2026-01-19 22:45:00 UTC
**Last Modified:** 2026-01-19 22:45:00 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #348
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.11
**Status:** DRAFT
**Size:** S (Small)
**Priority:** Optional Enhancement

---

## Summary

Create a convenience hook `useCommonTranslations` that simplifies access to the `common` namespace translations from next-intl. The hook wraps multiple `useTranslations` calls and returns a structured, typed interface organized by translation category (actions, form, toast, modal, loading, confirm, empty). This is an optional developer experience enhancement that reduces boilerplate and improves consistency when working with shared UI strings.

---

## Business Context

### Problem Statement

When developers build components that display common UI elements, they must:
1. Import `useTranslations` from next-intl
2. Manually construct translation key paths (e.g., `common.actions.save`, `common.form.email`)
3. Repeat this pattern across many components
4. Invoke multiple hooks when accessing different common namespace categories
5. Risk inconsistent key path construction and potential typos

### Solution

A convenience hook that:
- Provides pre-scoped access to all common namespace categories through a single invocation
- Returns structured accessors organized by category (actions, form, toast, modal, loading, confirm, empty)
- Offers TypeScript autocompletion for all available keys
- Reduces boilerplate and enforces consistent patterns
- Integrates with next-intl's type safety

### User Impact

Users indirectly benefit from:
- More consistent terminology across the application
- Uniform text for common UI elements (buttons, forms, modals, etc.)
- Faster feature delivery due to reduced development friction
- Fewer translation bugs leading to better internationalized experience

### Business Value

- **Reduced Development Time:** Eliminates repetitive boilerplate code
- **Fewer Bugs:** Typed interface prevents translation key typos
- **Easier Onboarding:** Clear API for accessing common translations
- **Consistent UX:** Enforces reuse of shared translation keys

---

## Technical Context

### Dependencies from Epic 1

This task requires the following from Epic 1 (Plan-110-L10N-Epic1-Foundation.md):

| Dependency | Location | Purpose |
|------------|----------|---------|
| next-intl package | `package.json` | i18n framework providing `useTranslations` |
| i18n config | `/src/lib/i18n/config.ts` | Locale configuration and supported languages |
| IntlProvider | `/src/app/layout.tsx` | Provider wrapper for translations |
| Translation files | `/messages/*.json` | Translation storage with `common` namespace |

### Dependencies from Sub-Epic 2H

| Dependency | Task | Purpose |
|------------|------|---------|
| Common namespace structure | Task 2H.1 | `/messages/en.json` must have `common` namespace |
| Button labels | Task 2H.2 | `common.actions.*` keys |
| Modal strings | Task 2H.3 | `common.confirmation.*` keys |
| Form element strings | Task 2H.4 | `common.validation.*` keys |
| Toast messages | Task 2H.5 | Toast-related common keys |
| Empty state messages | Task 2H.6 | `common.empty.*` keys |
| Loading state messages | Task 2H.7 | `common.status.*` keys |
| Confirmation dialogs | Task 2H.8 | `common.confirmation.*` keys |
| Date/time translations | Task 2H.9 | `common.time.*`, `common.pagination.*` keys |

### Existing Patterns to Follow

Based on codebase analysis, the hook should follow patterns from:

| Reference File | Pattern |
|----------------|---------|
| `/src/hooks/useDashboardStats.ts` | JSDoc documentation, TypeScript interfaces, debug logging prefix |
| `/src/hooks/useLanguagePreference.ts` | 'use client' directive, comprehensive interface, clear structure |
| `/src/hooks/useActiveProperty.ts` | Simple state management, SSR safety, clear return interface |
| `/src/lib/i18n/config.ts` | Type exports, configuration constants |

### Current Translation File Structure

The `/messages/en.json` file currently has this common namespace structure:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "close": "Close",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "actions": "Actions",
    "yes": "Yes",
    "no": "No",
    "submit": "Submit",
    "reset": "Reset",
    "clear": "Clear",
    "select": "Select",
    "view": "View",
    "download": "Download",
    "upload": "Upload",
    "copy": "Copy",
    "share": "Share",
    "more": "More",
    "less": "Less",
    "all": "All",
    "none": "None",
    "optional": "Optional",
    "required": "Required"
  }
}
```

**Note:** The current common namespace is flat. The hook should be designed to work with both the current flat structure AND the expanded nested structure planned in Plan-111-L10N-Epic2-Static-UI-Translation.md (actions, status, confirmation, empty, time, pagination, validation categories).

---

## Implementation Approach

### Design Decisions

1. **Flexible Structure:** Support both flat and nested common namespace access
2. **Backward Compatibility:** Work with current flat structure while enabling future nested structure
3. **Performance:** Use `useMemo` for stable references to avoid unnecessary re-renders
4. **Type Safety:** Provide TypeScript types for key completion and validation
5. **Incremental Adoption:** Existing code continues to work; migration is optional

### Hook Design

```typescript
// /src/hooks/useCommonTranslations.ts

'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

/**
 * Return type for useCommonTranslations hook
 */
export interface UseCommonTranslationsReturn {
  /** Access any common translation by key (flat or nested) */
  t: (key: string, params?: Record<string, unknown>) => string;

  /** Access action-related translations (save, cancel, delete, etc.) */
  actions: (key: ActionKey, params?: Record<string, unknown>) => string;

  /** Access status-related translations (loading, success, error, etc.) */
  status: (key: StatusKey, params?: Record<string, unknown>) => string;

  /** Access confirmation dialog translations */
  confirmation: (key: ConfirmationKey, params?: Record<string, unknown>) => string;

  /** Access empty state translations */
  empty: (key: EmptyKey, params?: Record<string, unknown>) => string;

  /** Access time/date relative expressions */
  time: (key: TimeKey, params?: Record<string, unknown>) => string;

  /** Access pagination labels */
  pagination: (key: PaginationKey, params?: Record<string, unknown>) => string;

  /** Access validation message translations */
  validation: (key: ValidationKey, params?: Record<string, unknown>) => string;
}
```

### Type Definitions

```typescript
// Types based on Plan-111 expected structure

export type ActionKey =
  | 'save' | 'cancel' | 'delete' | 'edit' | 'create'
  | 'submit' | 'close' | 'back' | 'next' | 'confirm'
  | 'done' | 'continue' | 'retry' | 'refresh' | 'loading'
  | 'search' | 'filter' | 'sort' | 'clear' | 'reset'
  | 'apply' | 'view' | 'viewAll' | 'showMore' | 'showLess'
  | 'selectAll' | 'deselectAll';

export type StatusKey =
  | 'loading' | 'saving' | 'deleting' | 'success' | 'error'
  | 'pending' | 'completed' | 'failed' | 'active' | 'inactive'
  | 'enabled' | 'disabled';

export type ConfirmationKey =
  | 'title' | 'deleteTitle' | 'deleteMessage' | 'unsavedChanges'
  | 'yes' | 'no';

export type EmptyKey =
  | 'noData' | 'noResults' | 'tryAgain';

export type TimeKey =
  | 'justNow' | 'minutesAgo' | 'hoursAgo' | 'daysAgo'
  | 'today' | 'yesterday';

export type PaginationKey =
  | 'previous' | 'next' | 'page' | 'showing';

export type ValidationKey =
  | 'required' | 'invalidEmail' | 'tooShort' | 'tooLong';
```

---

## Ordered Implementation Tasks

### Task 1: Create Type Definitions File

**File:** `/src/hooks/useCommonTranslations.types.ts`

**Actions:**
1. Create the types file with all key type unions
2. Export all types for external use
3. Ensure types align with Plan-111 expected common namespace structure
4. Add JSDoc comments for each type

**Verification:**
- File compiles without TypeScript errors
- Types are importable from the file

### Task 2: Create the Hook Implementation

**File:** `/src/hooks/useCommonTranslations.ts`

**Actions:**
1. Add 'use client' directive (required for hooks using next-intl's useTranslations)
2. Import `useTranslations` from next-intl
3. Import `useMemo` from react
4. Import types from the types file
5. Implement the `useCommonTranslations` function
6. Create helper functions for each category with fallback handling
7. Return memoized object with category accessors
8. Include JSDoc documentation with usage examples
9. Add debug logging prefix consistent with codebase patterns (`🌐 COMMON_TRANSLATIONS:`)

**Verification:**
- Hook compiles without TypeScript errors
- Hook can be imported and used in a component
- TypeScript provides autocompletion for keys

### Task 3: Handle Flat vs Nested Namespace Compatibility

**File:** `/src/hooks/useCommonTranslations.ts`

**Actions:**
1. Implement smart key resolution that tries nested path first, then flat path
2. For current flat structure: `actions('save')` resolves to `t('save')`
3. For future nested structure: `actions('save')` resolves to `t('actions.save')`
4. Add fallback behavior with graceful degradation
5. Log warnings in development for missing keys

**Example:**
```typescript
// Smart resolution helper
const resolveKey = (category: string, key: string) => {
  // Try nested first: common.actions.save
  // Then try flat: common.save
  try {
    return t(`${category}.${key}`);
  } catch {
    return t(key);
  }
};
```

### Task 4: Create Unit Tests

**File:** `/src/hooks/__tests__/useCommonTranslations.test.ts`

**Actions:**
1. Create test file following codebase testing patterns
2. Mock next-intl's `useTranslations` hook
3. Test each category accessor returns correct key paths
4. Test params are passed through correctly
5. Test memoization (stable references)
6. Test fallback behavior for flat/nested structure

**Test Cases:**
- `actions('save')` calls the correct translation key
- `status('loading')` calls the correct translation key
- Parameters are passed: `time('minutesAgo', { count: 5 })`
- Hook returns stable reference when re-rendered
- TypeScript correctly types the return value

### Task 5: Export from Hooks Directory

**File:** `/src/hooks/index.ts` (create if doesn't exist)

**Actions:**
1. Add export for `useCommonTranslations`
2. Add re-exports for types

### Task 6: Create Usage Documentation

**File:** Update existing docs or add section to overview

**Actions:**
1. Document hook purpose and usage
2. Provide code examples for each category
3. Explain when to use vs. direct `useTranslations`
4. Document migration path for existing components

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useCommonTranslations.ts` | Main hook implementation |
| `/src/hooks/useCommonTranslations.types.ts` | TypeScript type definitions |
| `/src/hooks/__tests__/useCommonTranslations.test.ts` | Unit tests |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/hooks/index.ts` | Add export for new hook (create if doesn't exist) |

### Functions/Exports to Create

| Function/Export | File | Purpose |
|-----------------|------|---------|
| `useCommonTranslations` | `useCommonTranslations.ts` | Main hook export |
| `UseCommonTranslationsReturn` | `useCommonTranslations.ts` | Return type interface |
| `ActionKey` | `useCommonTranslations.types.ts` | Action key union type |
| `StatusKey` | `useCommonTranslations.types.ts` | Status key union type |
| `ConfirmationKey` | `useCommonTranslations.types.ts` | Confirmation key union type |
| `EmptyKey` | `useCommonTranslations.types.ts` | Empty state key union type |
| `TimeKey` | `useCommonTranslations.types.ts` | Time/date key union type |
| `PaginationKey` | `useCommonTranslations.types.ts` | Pagination key union type |
| `ValidationKey` | `useCommonTranslations.types.ts` | Validation key union type |

---

## Integration Contract

### Usage Pattern

```tsx
// Before (without convenience hook)
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
      <span>{t('loading')}</span>
    </div>
  );
}

// After (with convenience hook)
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function MyComponent() {
  const { actions, status } = useCommonTranslations();

  return (
    <div>
      <button>{actions('save')}</button>
      <button>{actions('cancel')}</button>
      <span>{status('loading')}</span>
    </div>
  );
}
```

### With Parameters (Interpolation)

```tsx
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function TimeAgo({ minutes }: { minutes: number }) {
  const { time } = useCommonTranslations();

  return <span>{time('minutesAgo', { count: minutes })}</span>;
}
```

### With Validation Messages

```tsx
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function FormField({ error }: { error?: string }) {
  const { validation } = useCommonTranslations();

  return (
    <div>
      {error === 'required' && (
        <span className="error">{validation('required')}</span>
      )}
    </div>
  );
}
```

### Direct Access (Raw t function)

```tsx
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function CustomComponent() {
  const { t } = useCommonTranslations();

  // Use t directly for edge cases or custom keys
  return <span>{t('customKey')}</span>;
}
```

---

## Acceptance Criteria

From REQ-348:

- [ ] A new `useCommonTranslations.ts` hook file is created in `/src/hooks/`
- [ ] The hook imports and uses `useTranslations` from next-intl for the common namespace
- [ ] The hook returns an object structure organizing translations by category: actions, form, toast, modal, loading, confirm, empty
- [ ] The `actions` category provides access to action label translations
- [ ] The `status` category provides access to status/loading state translations
- [ ] The `confirmation` category provides access to confirmation dialog translations
- [ ] The `empty` category provides access to empty state translations
- [ ] The `time` category provides access to time-related translations
- [ ] The `pagination` category provides access to pagination translations
- [ ] The `validation` category provides access to validation message translations
- [ ] TypeScript type definitions are provided for the hook's return value ensuring type safety
- [ ] The hook can be imported and used in any client component without additional configuration
- [ ] The hook implementation is efficient and does not cause unnecessary re-renders (uses useMemo)
- [ ] Existing components can optionally migrate to use the convenience hook without breaking changes
- [ ] The hook integrates with next-intl's type safety
- [ ] Unit tests verify the hook correctly returns translation functions organized by category
- [ ] Usage examples demonstrate accessing translations like `const { actions, status } = useCommonTranslations()`

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete (next-intl not installed) | Low | Critical | Verify Epic 1 foundation complete before implementation |
| Common namespace structure differs from plan | Medium | Medium | Design hook to work with both flat and nested structures |
| Type union becomes stale as keys are added | Medium | Low | Use flexible types, document update process |
| Developers don't adopt the hook | Low | Low | Include in documentation, demonstrate benefits |
| Performance overhead from multiple hooks | Low | Low | Use useMemo, measure performance |

---

## Testing Strategy

### Unit Tests

| Test Case | Expected Result |
|-----------|-----------------|
| `actions('save')` returns translation | Calls correct translation key |
| `status('loading')` returns translation | Calls correct translation key |
| Parameters passed correctly | `time('minutesAgo', { count: 5 })` passes params |
| Hook returns stable references | Same object reference when deps unchanged |
| TypeScript catches invalid keys | Compile error for invalid keys |
| Fallback to flat structure works | Works with current /messages/en.json |

### Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Component renders with hook | Displays translated text |
| Language switch updates text | New language text displayed |
| Missing key handled gracefully | Fallback or key displayed |

---

## Dependencies

### Upstream Dependencies

| Task | Status | Impact |
|------|--------|--------|
| Epic 1 Foundation (next-intl setup) | Must be complete | Required for useTranslations |
| Task 2H.1: Common namespace structure | Should be complete | Determines key structure |
| Task 2H.2-2H.9: String extraction | Can proceed in parallel | Populates keys used by hook |

### Downstream Dependencies

| Task | Impact |
|------|--------|
| None | This is an optional enhancement with no downstream blockers |

---

## Notes

- This task is marked as **optional** in the implementation plan (Task 2H.11)
- The hook provides developer convenience but is not strictly required for localization to work
- Consider implementing after core localization is verified working
- Pattern can be extended for other namespaces (e.g., `useAuthTranslations`, `useWorkflowTranslations`)
- The hook design accommodates both current flat structure and planned nested structure

---

## References

- [REQ-348: Create Common Translations Convenience Hook](../gen_requests_epic2.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Plan-110-L10N-Epic1-Foundation.md](../prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [useDashboardStats.ts](../../src/hooks/useDashboardStats.ts) - Hook pattern reference
- [useLanguagePreference.ts](../../src/hooks/useLanguagePreference.ts) - Hook pattern reference
- [/src/lib/i18n/config.ts](../../src/lib/i18n/config.ts) - i18n configuration reference
