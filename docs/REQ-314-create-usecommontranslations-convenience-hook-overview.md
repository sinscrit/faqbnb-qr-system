# REQ-314: Create useCommonTranslations Convenience Hook - Implementation Overview

**Generated:** 2026-01-18 19:45:00 UTC
**Last Modified:** 2026-01-18 19:45:00 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #314
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.11
**Status:** DRAFT
**Size:** S (Small)
**Priority:** Optional Enhancement

---

## Summary

This task creates an optional convenience hook `useCommonTranslations` that simplifies access to the `common` namespace translations. The hook wraps the `useTranslations` hook from next-intl and provides a typed, structured interface for accessing shared translation categories such as buttons, forms, modals, notifications, empty states, loading states, confirmations, and date/time formatting utilities.

---

## Business Context

### Problem Statement

When developers build components that display common UI elements, they must:
1. Import `useTranslations` from next-intl
2. Manually construct translation key paths (e.g., `common.actions.save`)
3. Repeat this pattern across multiple components
4. Risk inconsistent key path construction and potential errors

### Solution

A convenience hook that:
- Provides pre-scoped access to the `common` namespace
- Returns structured accessors for each translation category
- Offers TypeScript autocompletion for all available keys
- Reduces boilerplate and enforces consistent patterns

### User Impact

Users indirectly benefit from:
- More consistent terminology across the application
- Uniform text for common UI elements (buttons, modals, etc.)
- Faster feature delivery due to reduced development friction

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
| `/src/hooks/useDashboardStats.ts` | JSDoc documentation, TypeScript interfaces, debug logging |
| `/src/hooks/useActiveProperty.ts` | Simple state management, SSR safety, clear return interface |
| `/src/contexts/PropertyContext.tsx` | Context re-export pattern |

### Expected Common Namespace Structure

From Plan-111-L10N-Epic2-Static-UI-Translation.md:

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "submit": "Submit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "confirm": "Confirm",
      "done": "Done",
      "continue": "Continue",
      "retry": "Retry",
      "refresh": "Refresh",
      "loading": "Loading...",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "clear": "Clear",
      "reset": "Reset",
      "apply": "Apply",
      "view": "View",
      "viewAll": "View All",
      "showMore": "Show More",
      "showLess": "Show Less",
      "selectAll": "Select All",
      "deselectAll": "Deselect All"
    },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "success": "Success",
      "error": "Error",
      "pending": "Pending",
      "completed": "Completed",
      "failed": "Failed",
      "active": "Active",
      "inactive": "Inactive",
      "enabled": "Enabled",
      "disabled": "Disabled"
    },
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "yes": "Yes",
      "no": "No"
    },
    "empty": {
      "noData": "No data available",
      "noResults": "No results found",
      "tryAgain": "Try again with different filters"
    },
    "time": {
      "justNow": "Just now",
      "minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago",
      "hoursAgo": "{count} {count, plural, one {hour} other {hours}} ago",
      "daysAgo": "{count} {count, plural, one {day} other {days}} ago",
      "today": "Today",
      "yesterday": "Yesterday"
    },
    "pagination": {
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}",
      "showing": "Showing {start} to {end} of {total}"
    },
    "validation": {
      "required": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be less than {max} characters"
    }
  }
}
```

---

## Implementation Approach

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
  /** Access action labels (save, cancel, delete, etc.) */
  actions: (key: ActionKey, params?: Record<string, unknown>) => string;

  /** Access status labels (loading, success, error, etc.) */
  status: (key: StatusKey, params?: Record<string, unknown>) => string;

  /** Access confirmation dialog strings */
  confirmation: (key: ConfirmationKey, params?: Record<string, unknown>) => string;

  /** Access empty state messages */
  empty: (key: EmptyKey, params?: Record<string, unknown>) => string;

  /** Access time/date relative expressions */
  time: (key: TimeKey, params?: Record<string, unknown>) => string;

  /** Access pagination labels */
  pagination: (key: PaginationKey, params?: Record<string, unknown>) => string;

  /** Access validation messages */
  validation: (key: ValidationKey, params?: Record<string, unknown>) => string;

  /** Raw access to common namespace (for edge cases) */
  t: ReturnType<typeof useTranslations>;
}

/**
 * Convenience hook for accessing common namespace translations.
 * Provides typed, structured access to shared translation categories.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { actions, status, confirmation } = useCommonTranslations();
 *
 *   return (
 *     <>
 *       <button>{actions('save')}</button>
 *       <span>{status('loading')}</span>
 *       <p>{confirmation('deleteMessage')}</p>
 *     </>
 *   );
 * }
 * ```
 */
export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  return useMemo(() => ({
    actions: (key, params) => t(`actions.${key}`, params),
    status: (key, params) => t(`status.${key}`, params),
    confirmation: (key, params) => t(`confirmation.${key}`, params),
    empty: (key, params) => t(`empty.${key}`, params),
    time: (key, params) => t(`time.${key}`, params),
    pagination: (key, params) => t(`pagination.${key}`, params),
    validation: (key, params) => t(`validation.${key}`, params),
    t,
  }), [t]);
}

export default useCommonTranslations;
```

### Type Definitions

```typescript
// /src/hooks/useCommonTranslations.types.ts

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
3. Ensure types match the common namespace structure in `/messages/en.json`

**Verification:**
- File compiles without TypeScript errors
- Types are importable from the file

### Task 2: Create the Hook Implementation

**File:** `/src/hooks/useCommonTranslations.ts`

**Actions:**
1. Create the hook file with 'use client' directive
2. Import `useTranslations` from next-intl
3. Import types from the types file
4. Implement the `useCommonTranslations` function
5. Return memoized object with category accessors
6. Include JSDoc documentation with usage examples
7. Add debug logging consistent with codebase patterns

**Verification:**
- Hook compiles without TypeScript errors
- Hook can be imported and used in a component
- TypeScript provides autocompletion for keys

### Task 3: Create Unit Tests

**File:** `/src/hooks/__tests__/useCommonTranslations.test.ts`

**Actions:**
1. Create test file following codebase testing patterns
2. Mock next-intl's `useTranslations` hook
3. Test each category accessor returns correct key paths
4. Test params are passed through correctly
5. Test memoization (stable references)

**Test Cases:**
- `actions('save')` calls `t('actions.save')`
- `status('loading')` calls `t('status.loading')`
- Parameters are passed: `time('minutesAgo', { count: 5 })`
- Hook returns stable reference when re-rendered

### Task 4: Export from Hooks Index (if applicable)

**File:** `/src/hooks/index.ts` (if exists)

**Actions:**
1. Add export for `useCommonTranslations`
2. Add export for types

### Task 5: Create Documentation

**File:** Update `/docs/i18n/glossary.md` or create `/docs/i18n/hooks.md`

**Actions:**
1. Document hook purpose and usage
2. Provide code examples
3. List available categories and keys
4. Explain when to use vs. direct `useTranslations`

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
| `/src/hooks/index.ts` | Add export for new hook (if index exists) |
| `/docs/i18n/glossary.md` | Add hook documentation (if file exists) |

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
    <button>{t('actions.save')}</button>
  );
}

// After (with convenience hook)
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function MyComponent() {
  const { actions } = useCommonTranslations();

  return (
    <button>{actions('save')}</button>
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

---

## Acceptance Criteria

From REQ-314:

- [ ] A custom React hook named `useCommonTranslations` exists and can be imported by components
- [ ] The hook returns structured access to all common namespace translation categories
- [ ] Methods exist for accessing button labels, form strings, modal content, notifications, empty states, loading states, confirmations, and date formatting utilities
- [ ] The hook leverages the underlying translation function with automatic namespace scoping to the common namespace
- [ ] TypeScript types provide autocomplete and type safety for all translation key paths accessed through the hook
- [ ] The hook follows React hooks conventions and can be used in any functional component
- [ ] Documentation explains the hook's purpose, usage patterns, and available translation categories
- [ ] Existing components that access common translations can optionally migrate to use the convenience hook
- [ ] The hook's implementation is efficient and does not cause unnecessary re-renders or performance overhead
- [ ] Error handling is included for cases where translation keys are not found or the translation system is not initialized
- [ ] The hook's interface is extensible to accommodate new common translation categories as they are added to the namespace

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete (next-intl not installed) | Medium | Critical | Block task until Epic 1 foundation verified |
| Common namespace structure differs from plan | Low | Medium | Verify `/messages/en.json` structure before implementation |
| Type union becomes stale as keys are added | Medium | Low | Use generated types or document update process |
| Developers don't adopt the hook | Low | Low | Include in component templates, document benefits |

---

## Testing Strategy

### Unit Tests

| Test Case | Expected Result |
|-----------|-----------------|
| `actions('save')` returns translation | Calls `t('actions.save')` |
| `status('loading')` returns translation | Calls `t('status.loading')` |
| Parameters passed correctly | `time('minutesAgo', { count: 5 })` calls `t('time.minutesAgo', { count: 5 })` |
| Hook returns stable references | Same object reference when deps unchanged |
| TypeScript catches invalid keys | Compile error for `actions('invalid')` |

### Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Component renders with hook | Displays translated text |
| Language switch updates text | New language text displayed |
| Missing key handled gracefully | Fallback or error message shown |

---

## Notes

- This task is marked as **optional** in the implementation plan (Task 2H.11)
- The hook provides developer convenience but is not strictly required for localization to work
- Consider implementing after core localization is verified working
- Pattern can be extended for other namespaces (e.g., `useAuthTranslations`, `useWorkflowTranslations`)

---

## References

- [REQ-314: Create Common Translations Convenience Hook](../gen_requests_epic2.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Plan-110-L10N-Epic1-Foundation.md](../prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [useDashboardStats.ts](../../src/hooks/useDashboardStats.ts) - Hook pattern reference
- [useActiveProperty.ts](../../src/hooks/useActiveProperty.ts) - Simple hook pattern reference
