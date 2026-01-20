# REQ-E02-031: Create useCommonTranslations Convenience Hook - Implementation Overview

*Generated: 2026-01-20 23:50:00 UTC*
*Last Modified: 2026-01-20 23:50:00 UTC*

## Reference

- **Request**: REQ-E02-031 (Create useCommonTranslations Convenience Hook)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.11
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup), Task 2H.1 (Common namespace structure)
- **Optional**: Yes (marked as optional in Plan-111)

## Summary

Create a `useCommonTranslations` convenience hook that wraps next-intl's `useTranslations` hook to provide typed, memoized, and categorized access to commonly used UI translation strings from the `common` namespace. This hook improves developer experience by providing IDE autocomplete, preventing translation key typos, and reducing boilerplate code when accessing frequently used strings like button labels, status messages, and validation errors.

## Goals

1. Create a typed wrapper hook around `useTranslations('common')` with categorized access methods
2. Provide TypeScript types for all available translation keys enabling IDE autocomplete
3. Memoize returned functions to prevent unnecessary component re-renders
4. Organize translations into logical categories: actions, status, confirmation, empty, time, pagination, validation
5. Follow existing hook patterns established in the codebase (e.g., `useLanguagePreference`)
6. Export from a central location following project conventions
7. Include comprehensive JSDoc documentation and usage examples

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package (v4.7.0) | `package.json` | Installed |
| i18n config | `/i18n.ts` and `/src/lib/i18n/config.ts` | Configured |
| NextIntlClientProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |

### Current Translation Pattern

Components currently access translations directly:

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const tCommon = useTranslations('common');

  return (
    <button>{tCommon('save')}</button>
  );
}
```

### Target Convenience Pattern

After this task, components can use the convenience hook:

```typescript
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function MyComponent() {
  const { actions, status } = useCommonTranslations();

  return (
    <>
      <button>{actions('save')}</button>
      <span>{status('loading')}</span>
    </>
  );
}
```

### Common Namespace Structure (from Task 2H.1)

The `common` namespace will be expanded (Task 2H.1) to include:

```json
{
  "common": {
    "actions": { "save", "cancel", "delete", "edit", ... },    // ~26 keys
    "status": { "loading", "saving", "success", "error", ... }, // ~12 keys
    "confirmation": { "title", "deleteTitle", ... },            // ~6 keys
    "empty": { "noData", "noResults", "tryAgain" },             // ~3 keys
    "time": { "justNow", "minutesAgo", ... },                   // ~6 keys
    "pagination": { "previous", "next", "page", "showing" },    // ~4 keys
    "validation": { "required", "invalidEmail", ... }           // ~4 keys
  }
}
```

**Note**: This hook assumes the hierarchical common namespace structure from Task 2H.1 is in place. If Task 2H.1 is not yet complete, the hook can work with the current flat structure as a fallback.

## Implementation Order

### Step 1: Define TypeScript Types

Create comprehensive types for the hook's return value and all translation key categories:

```typescript
// Types for each category's available keys
type CommonActionKey = 'save' | 'cancel' | 'delete' | 'edit' | 'create' | ...;
type CommonStatusKey = 'loading' | 'saving' | 'success' | 'error' | ...;
type CommonConfirmationKey = 'title' | 'deleteTitle' | 'deleteMessage' | ...;
type CommonEmptyKey = 'noData' | 'noResults' | 'tryAgain';
type CommonTimeKey = 'justNow' | 'minutesAgo' | 'hoursAgo' | 'daysAgo' | ...;
type CommonPaginationKey = 'previous' | 'next' | 'page' | 'showing';
type CommonValidationKey = 'required' | 'invalidEmail' | 'tooShort' | 'tooLong';

// Hook return type
interface UseCommonTranslationsReturn {
  actions: (key: CommonActionKey) => string;
  status: (key: CommonStatusKey) => string;
  confirmation: (key: CommonConfirmationKey) => string;
  empty: (key: CommonEmptyKey) => string;
  time: (key: CommonTimeKey, params?: { count: number }) => string;
  pagination: (key: CommonPaginationKey, params?: Record<string, unknown>) => string;
  validation: (key: CommonValidationKey, params?: Record<string, unknown>) => string;
  t: ReturnType<typeof useTranslations>; // Raw access for advanced use cases
}
```

### Step 2: Implement Hook with Memoization

Create the hook file with proper memoization using `useMemo` and `useCallback`:

```typescript
import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';

export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  // Memoize category accessors
  const actions = useCallback(
    (key: CommonActionKey) => t(`actions.${key}`),
    [t]
  );

  const status = useCallback(
    (key: CommonStatusKey) => t(`status.${key}`),
    [t]
  );

  // ... other categories

  return useMemo(() => ({
    actions,
    status,
    confirmation,
    empty,
    time,
    pagination,
    validation,
    t, // Raw access for edge cases
  }), [actions, status, confirmation, empty, time, pagination, validation, t]);
}
```

### Step 3: Add Fallback Support

Handle the case where the hierarchical structure isn't in place (backward compatibility):

```typescript
const actions = useCallback(
  (key: CommonActionKey) => {
    // Try hierarchical path first, fall back to flat
    try {
      return t(`actions.${key}`);
    } catch {
      return t(key); // Fallback to flat structure
    }
  },
  [t]
);
```

### Step 4: Add JSDoc Documentation

Include comprehensive documentation with usage examples:

```typescript
/**
 * Convenience hook for accessing common translation strings.
 *
 * Provides typed, memoized access to frequently used UI strings
 * organized by category (actions, status, confirmation, etc.).
 *
 * @example
 * ```tsx
 * const { actions, status } = useCommonTranslations();
 *
 * return (
 *   <div>
 *     <button disabled={saving}>{saving ? status('saving') : actions('save')}</button>
 *     <button>{actions('cancel')}</button>
 *   </div>
 * );
 * ```
 *
 * @example With parameters (pluralization/interpolation)
 * ```tsx
 * const { time, pagination } = useCommonTranslations();
 *
 * return (
 *   <span>{time('minutesAgo', { count: 5 })}</span>
 *   <span>{pagination('page', { current: 1, total: 10 })}</span>
 * );
 * ```
 */
```

### Step 5: Create Test File

Add tests in `/src/hooks/__tests__/useCommonTranslations.test.ts`:

```typescript
describe('useCommonTranslations', () => {
  it('returns categorized translation functions');
  it('memoizes return values');
  it('handles missing keys gracefully');
  it('supports ICU parameters');
});
```

### Step 6: Demonstrate Usage

Refactor at least one component to use the new hook, showing code simplification.

## Authorized Files and Functions for Modification

### Files to Create

#### `/src/hooks/useCommonTranslations.ts`

- **Purpose**: New convenience hook for common translations
- **Content**: Hook implementation with types, memoization, and JSDoc
- **Export**: Named export `useCommonTranslations` and types
- **Size**: ~150-200 lines

```typescript
// File structure outline
'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';

// ============ Type Definitions ============

// Key types for each category (provides autocomplete)
export type CommonActionKey =
  | 'save' | 'cancel' | 'delete' | 'edit' | 'create' | 'submit' | 'close'
  | 'back' | 'next' | 'confirm' | 'done' | 'continue' | 'retry' | 'refresh'
  | 'loading' | 'search' | 'filter' | 'sort' | 'clear' | 'reset' | 'apply'
  | 'view' | 'viewAll' | 'showMore' | 'showLess' | 'selectAll' | 'deselectAll';

export type CommonStatusKey =
  | 'loading' | 'saving' | 'deleting' | 'success' | 'error' | 'pending'
  | 'completed' | 'failed' | 'active' | 'inactive' | 'enabled' | 'disabled';

export type CommonConfirmationKey =
  | 'title' | 'deleteTitle' | 'deleteMessage' | 'unsavedChanges' | 'yes' | 'no';

export type CommonEmptyKey = 'noData' | 'noResults' | 'tryAgain';

export type CommonTimeKey =
  | 'justNow' | 'minutesAgo' | 'hoursAgo' | 'daysAgo' | 'today' | 'yesterday';

export type CommonPaginationKey = 'previous' | 'next' | 'page' | 'showing';

export type CommonValidationKey =
  | 'required' | 'invalidEmail' | 'tooShort' | 'tooLong';

// Interface for time/pagination/validation params
export interface TimeParams { count: number; }
export interface PaginationPageParams { current: number; total: number; }
export interface PaginationShowingParams { start: number; end: number; total: number; }
export interface ValidationLengthParams { min?: number; max?: number; }

// Main hook return type
export interface UseCommonTranslationsReturn {
  /** Get action button labels (save, cancel, delete, etc.) */
  actions: (key: CommonActionKey) => string;

  /** Get status indicators (loading, success, error, etc.) */
  status: (key: CommonStatusKey) => string;

  /** Get confirmation dialog text */
  confirmation: (key: CommonConfirmationKey) => string;

  /** Get empty state messages */
  empty: (key: CommonEmptyKey) => string;

  /** Get relative time strings (requires count param for plural forms) */
  time: (key: CommonTimeKey, params?: TimeParams) => string;

  /** Get pagination labels (some require params) */
  pagination: {
    (key: 'previous' | 'next'): string;
    (key: 'page', params: PaginationPageParams): string;
    (key: 'showing', params: PaginationShowingParams): string;
  };

  /** Get validation error messages (some require params) */
  validation: {
    (key: 'required' | 'invalidEmail'): string;
    (key: 'tooShort' | 'tooLong', params: ValidationLengthParams): string;
  };

  /** Raw translation function for advanced/edge cases */
  t: ReturnType<typeof useTranslations>;
}

// ============ Hook Implementation ============

/**
 * Convenience hook for accessing common translation strings.
 * [Full JSDoc here]
 */
export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  // Implementation with useCallback for each category
  // ...

  // Return memoized object
  return useMemo(() => ({
    actions,
    status,
    confirmation,
    empty,
    time,
    pagination,
    validation,
    t,
  }), [/* dependencies */]);
}

export default useCommonTranslations;
```

#### `/src/hooks/__tests__/useCommonTranslations.test.ts`

- **Purpose**: Unit tests for the convenience hook
- **Content**: Tests for type safety, memoization, and fallback behavior
- **Size**: ~80-100 lines

### Files to Potentially Modify (for demonstration)

#### Component for Demo Refactoring

One component should be refactored to demonstrate the hook's value. Suggested candidates:

| Component | Location | Reason |
|-----------|----------|--------|
| `ConfirmationModal` | `/src/components/ConfirmationModal.tsx` | Uses multiple common strings |
| `LogoutButton` | `/src/components/LogoutButton.tsx` | Already uses tCommon pattern |
| `EmptyStateCard` | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | Uses empty state strings |

**Example Refactor (LogoutButton):**

```typescript
// BEFORE
const tCommon = useTranslations('common');
// ...
<button>{tCommon('cancel')}</button>

// AFTER
const { actions, confirmation } = useCommonTranslations();
// ...
<button>{actions('cancel')}</button>
<p>{confirmation('yes')}</p>
```

### Files NOT to Modify

- `/messages/*.json` - Translation files (handled in other tasks)
- `/src/lib/i18n/config.ts` - i18n configuration (no changes needed)
- `/src/lib/i18n/index.ts` - Barrel exports (hook goes in /hooks)
- `/i18n.ts` - Root config (no changes needed)
- `/src/app/layout.tsx` - Provider already configured

## Technical Specifications

### Hook API Design

The hook provides three access patterns:

#### 1. Parameterless Access (most common)

```typescript
const { actions, status } = useCommonTranslations();

actions('save');     // "Save"
actions('cancel');   // "Cancel"
status('loading');   // "Loading..."
status('success');   // "Success"
```

#### 2. Parameterized Access (for ICU format)

```typescript
const { time, pagination } = useCommonTranslations();

time('minutesAgo', { count: 5 });    // "5 minutes ago"
time('minutesAgo', { count: 1 });    // "1 minute ago"

pagination('page', { current: 1, total: 10 });        // "Page 1 of 10"
pagination('showing', { start: 1, end: 20, total: 100 }); // "Showing 1 to 20 of 100"
```

#### 3. Raw Access (escape hatch)

```typescript
const { t } = useCommonTranslations();

// For edge cases or dynamic keys
t('actions.custom');
t.rich('complex.key', { /* rich text params */ });
```

### Memoization Strategy

Each category function is wrapped with `useCallback` and the entire return object is wrapped with `useMemo`:

```typescript
// Each function memoized individually
const actions = useCallback(
  (key: CommonActionKey) => t(`actions.${key}`),
  [t]
);

// Return object memoized
return useMemo(() => ({
  actions,
  status,
  // ...
}), [actions, status, /* ... */]);
```

This ensures:
1. Functions maintain referential equality across renders
2. Components using destructured functions don't re-render unnecessarily
3. The hook follows React best practices for custom hooks

### Error Handling

The hook handles edge cases gracefully:

```typescript
// Fallback for missing keys
const actions = useCallback((key: CommonActionKey) => {
  const result = t(`actions.${key}`);
  if (result.startsWith('common.actions.')) {
    // Key not found, next-intl returns the key path
    console.warn(`[useCommonTranslations] Missing key: actions.${key}`);
    return key; // Return the key name as fallback
  }
  return result;
}, [t]);
```

### Type Safety

TypeScript provides autocomplete for all keys:

```typescript
// IDE shows: 'save' | 'cancel' | 'delete' | 'edit' | ...
actions('s'); // Autocomplete suggests 'save', 'submit', 'selectAll', etc.

// Type error for invalid keys
actions('invalid'); // TS Error: Argument of type '"invalid"' is not assignable
```

## Usage Patterns

### Basic Usage

```typescript
'use client';
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function SaveButton({ onSave, isSaving }: Props) {
  const { actions, status } = useCommonTranslations();

  return (
    <button onClick={onSave} disabled={isSaving}>
      {isSaving ? status('saving') : actions('save')}
    </button>
  );
}
```

### Confirmation Dialog Usage

```typescript
function DeleteConfirmDialog({ itemName, onConfirm, onCancel }: Props) {
  const { actions, confirmation } = useCommonTranslations();

  return (
    <Dialog>
      <DialogTitle>{confirmation('deleteTitle')}</DialogTitle>
      <DialogContent>
        {confirmation('deleteMessage')}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{confirmation('no')}</Button>
        <Button onClick={onConfirm}>{confirmation('yes')}</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Empty State Usage

```typescript
function ItemList({ items }: Props) {
  const { empty } = useCommonTranslations();

  if (items.length === 0) {
    return (
      <EmptyState
        title={empty('noResults')}
        description={empty('tryAgain')}
      />
    );
  }

  return <List items={items} />;
}
```

### Time-Relative Usage

```typescript
function ActivityTimestamp({ createdAt }: Props) {
  const { time } = useCommonTranslations();
  const minutesAgo = getMinutesAgo(createdAt);

  if (minutesAgo < 1) return <span>{time('justNow')}</span>;
  if (minutesAgo < 60) return <span>{time('minutesAgo', { count: minutesAgo })}</span>;

  const hoursAgo = Math.floor(minutesAgo / 60);
  return <span>{time('hoursAgo', { count: hoursAgo })}</span>;
}
```

## Comparison with Direct Usage

### Before (Direct useTranslations)

```typescript
function ActionPanel({ onSave, onCancel, onDelete, isLoading }) {
  const t = useTranslations('common');

  return (
    <div>
      <button disabled={isLoading}>
        {isLoading ? t('loading') : t('save')}
      </button>
      <button>{t('cancel')}</button>
      <button>{t('delete')}</button>
    </div>
  );
}
```

**Issues:**
- No autocomplete for keys
- Easy to typo `t('svae')` instead of `t('save')`
- No indication of which keys are valid
- Must remember the flat vs. nested structure

### After (useCommonTranslations)

```typescript
function ActionPanel({ onSave, onCancel, onDelete, isLoading }) {
  const { actions, status } = useCommonTranslations();

  return (
    <div>
      <button disabled={isLoading}>
        {isLoading ? status('loading') : actions('save')}
      </button>
      <button>{actions('cancel')}</button>
      <button>{actions('delete')}</button>
    </div>
  );
}
```

**Benefits:**
- Full autocomplete for all keys
- Type errors for invalid keys
- Clear categorization (actions vs. status)
- Self-documenting code
- Consistent patterns across codebase

## Success Validation Checklist

### Implementation Validation
- [ ] Hook file exists at `/src/hooks/useCommonTranslations.ts`
- [ ] Hook is a client component (`'use client'` directive)
- [ ] Hook wraps `useTranslations('common')` from next-intl
- [ ] Hook exports types for all key categories
- [ ] Hook return object includes all 7 categories plus raw `t`

### Type Safety Validation
- [ ] TypeScript types are defined for all category keys
- [ ] IDE autocomplete works for all categories
- [ ] Invalid keys produce TypeScript errors
- [ ] Parameterized functions have typed parameter objects

### Memoization Validation
- [ ] Category functions use `useCallback`
- [ ] Return object uses `useMemo`
- [ ] Referential equality maintained across renders

### Documentation Validation
- [ ] JSDoc comments explain hook purpose
- [ ] Usage examples included in comments
- [ ] Each category function is documented

### Testing Validation
- [ ] Test file exists at `/src/hooks/__tests__/useCommonTranslations.test.ts`
- [ ] Tests cover basic usage
- [ ] Tests verify type constraints
- [ ] Tests check memoization behavior

### Integration Validation
- [ ] At least one component refactored to use hook
- [ ] Application builds without errors: `npm run build`
- [ ] Hook works at runtime with actual translations

## Dependencies

### Required (Already Installed)
- `next-intl` v4.7.0 - Provides `useTranslations` hook
- `react` 18+ - Provides `useMemo`, `useCallback`
- TypeScript 5.x - Type definitions

### Required (From Other Tasks)
- Task 2H.1 (recommended): Hierarchical `common` namespace structure
  - Hook can work with flat structure but provides better DX with nested structure

### No New Dependencies Required
This task only creates a new hook file using existing packages.

## Risk Assessment

- **Risk Level**: Low
- **Rationale**:
  - Purely additive (new file, no changes to existing code)
  - No runtime side effects
  - TypeScript validates implementation
  - Easy to test in isolation
  - Does not replace existing pattern (components can still use `useTranslations` directly)

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Type definitions out of sync with actual keys | Medium | Low | Generate types from JSON schema or keep in sync manually |
| Nested namespace not yet implemented | Medium | Low | Fallback to flat key access |
| Memoization over-optimization | Low | Low | Test with React DevTools profiler |
| Over-adoption before namespace ready | Low | Medium | Document as optional, depends on 2H.1 |

## Future Considerations

### Potential Enhancements

1. **Auto-generated Types**: Could generate TypeScript types directly from JSON files
2. **Namespace Extension**: Could accept additional namespaces for domain-specific convenience hooks
3. **Rich Text Support**: Could add helpers for `t.rich()` usage
4. **Mark-missing Mode**: Development mode that highlights untranslated strings

### Related Future Tasks

- `useErrorTranslations()` - Similar convenience hook for `errors` namespace
- `useAuthTranslations()` - Similar convenience hook for `auth` namespace
- Type generation script from JSON files

## Notes

### Alignment with Project Patterns

This implementation follows patterns established in the codebase:

| Pattern | Example | Applied Here |
|---------|---------|--------------|
| Hook file naming | `useLanguagePreference.ts` | `useCommonTranslations.ts` |
| Client directive | `'use client'` in hooks | Same |
| Type exports | Named exports in `useLanguagePreference` | Same |
| JSDoc documentation | Comprehensive in existing hooks | Same |
| Test location | `/src/hooks/__tests__/` | Same |

### Optional Nature

As noted in Plan-111 Task 2H.11, this hook is **optional**. Components can always use `useTranslations('common')` directly. The hook exists to:

1. Improve developer experience with autocomplete
2. Prevent typos in translation keys
3. Standardize access patterns
4. Reduce cognitive load when accessing common strings

Teams can adopt it gradually as beneficial, not as a required pattern.

---

*End of Implementation Overview*
