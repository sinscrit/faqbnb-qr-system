# REQ-E02-031: Create useCommonTranslations Convenience Hook - Detailed Task Breakdown

*Generated: 2026-01-20 23:55:00 UTC*
*Last Modified: 2026-01-20 23:55:00 UTC*

## Reference

- **Request**: REQ-E02-031
- **Overview Document**: docs/REQ-E02-031-create-usecommontranslations-convenience-hook-overview.md
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.11
- **Size**: S (Small)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation), Task 2H.1 (Common namespace structure)
- **Optional**: Yes (marked as optional in Plan-111)

---

## Executive Summary

This document provides a detailed, step-by-step implementation guide for creating the `useCommonTranslations` convenience hook. The hook wraps next-intl's `useTranslations` to provide typed, memoized, and categorized access to frequently used UI translation strings from the `common` namespace.

**Total Estimated Tasks**: 8 granular tasks
**Estimated Total Effort**: ~4-6 hours

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with the `common` namespace
- [ ] `useTranslations` hook from next-intl works in the project
- [ ] TypeScript strict mode is enabled
- [ ] `/src/hooks/` directory exists

### Verification Commands

```bash
# Verify next-intl is installed
grep "next-intl" package.json

# Verify messages file exists
cat messages/en.json | head -50

# Verify hooks directory exists
ls -la src/hooks/
```

---

## Task Breakdown

### Task 1: Create Type Definitions File

**File**: `/src/hooks/useCommonTranslations.ts` (types section)
**Effort**: ~30 minutes
**Dependencies**: None

#### Description

Define all TypeScript types for the hook including key union types for each translation category and the hook's return interface.

#### Implementation Details

Create the types section at the top of the hook file:

```typescript
// ============ Type Definitions ============

/**
 * Keys for action button translations (save, cancel, delete, etc.)
 * Mapped to: common.{key} in translation files
 */
export type CommonActionKey =
  | 'save'
  | 'cancel'
  | 'delete'
  | 'edit'
  | 'create'
  | 'submit'
  | 'close'
  | 'back'
  | 'next'
  | 'confirm'
  | 'reset'
  | 'clear'
  | 'search'
  | 'filter'
  | 'sort'
  | 'view'
  | 'download'
  | 'upload'
  | 'copy'
  | 'share'
  | 'more'
  | 'less'
  | 'select'
  | 'yes'
  | 'no';

/**
 * Keys for status message translations
 * Mapped to: common.{key} in translation files
 */
export type CommonStatusKey =
  | 'loading'
  | 'error'
  | 'success';

/**
 * Keys for common labels and text
 * Mapped to: common.{key} in translation files
 */
export type CommonLabelKey =
  | 'actions'
  | 'all'
  | 'none'
  | 'optional'
  | 'required';
```

#### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `/src/hooks/useCommonTranslations.ts` | CREATE | New hook file with types |

#### Acceptance Criteria

- [ ] Type file compiles without TypeScript errors
- [ ] All key types match keys in `/messages/en.json` common namespace
- [ ] Types are exported for external use
- [ ] Union types provide autocomplete in IDE

---

### Task 2: Implement Core Hook Structure

**File**: `/src/hooks/useCommonTranslations.ts`
**Effort**: ~45 minutes
**Dependencies**: Task 1

#### Description

Implement the main hook function that wraps `useTranslations('common')` and provides the basic structure.

#### Implementation Details

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';

// ... types from Task 1 ...

/**
 * Return type for the useCommonTranslations hook
 */
export interface UseCommonTranslationsReturn {
  /** Get action button label (save, cancel, delete, etc.) */
  action: (key: CommonActionKey) => string;

  /** Get status message (loading, success, error) */
  status: (key: CommonStatusKey) => string;

  /** Get common label (actions, all, none, etc.) */
  label: (key: CommonLabelKey) => string;

  /** Raw translation function for edge cases */
  t: ReturnType<typeof useTranslations>;
}

/**
 * Convenience hook for accessing common translation strings.
 * Provides typed, memoized access to the 'common' namespace.
 */
export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  // Implementation continues in Task 3...

  return useMemo(() => ({
    action: (key) => t(key),
    status: (key) => t(key),
    label: (key) => t(key),
    t,
  }), [t]);
}

export default useCommonTranslations;
```

#### Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `/src/hooks/useCommonTranslations.ts` | MODIFY | Add core hook structure |

#### Acceptance Criteria

- [ ] Hook compiles without errors
- [ ] Hook can be imported and called in a test component
- [ ] Hook returns the expected interface shape
- [ ] No runtime errors when accessing translations

---

### Task 3: Implement Memoized Category Functions

**File**: `/src/hooks/useCommonTranslations.ts`
**Effort**: ~30 minutes
**Dependencies**: Task 2

#### Description

Implement memoized category accessor functions using `useCallback` to prevent unnecessary re-renders.

#### Implementation Details

```typescript
export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  // Memoize action accessor
  const action = useCallback(
    (key: CommonActionKey): string => t(key),
    [t]
  );

  // Memoize status accessor
  const status = useCallback(
    (key: CommonStatusKey): string => t(key),
    [t]
  );

  // Memoize label accessor
  const label = useCallback(
    (key: CommonLabelKey): string => t(key),
    [t]
  );

  // Return memoized object to prevent re-renders
  return useMemo(
    () => ({
      action,
      status,
      label,
      t,
    }),
    [action, status, label, t]
  );
}
```

#### Acceptance Criteria

- [ ] Each category function is wrapped with `useCallback`
- [ ] Return object is wrapped with `useMemo`
- [ ] Functions maintain referential equality across renders (verified in tests)
- [ ] Type inference works correctly for function parameters

---

### Task 4: Add JSDoc Documentation

**File**: `/src/hooks/useCommonTranslations.ts`
**Effort**: ~20 minutes
**Dependencies**: Task 3

#### Description

Add comprehensive JSDoc documentation to the hook including purpose, usage examples, and parameter descriptions.

#### Implementation Details

```typescript
/**
 * Convenience hook for accessing common translation strings.
 *
 * Provides typed, memoized access to frequently used UI strings
 * from the 'common' namespace. This hook wraps next-intl's
 * useTranslations hook and organizes translations by category.
 *
 * @returns Object with categorized translation accessors
 *
 * @example Basic usage
 * ```tsx
 * 'use client';
 * import { useCommonTranslations } from '@/hooks/useCommonTranslations';
 *
 * function SaveButton({ onSave, isSaving }: Props) {
 *   const { action, status } = useCommonTranslations();
 *
 *   return (
 *     <button onClick={onSave} disabled={isSaving}>
 *       {isSaving ? status('loading') : action('save')}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Using multiple categories
 * ```tsx
 * function ActionPanel({ onSave, onCancel, onDelete }) {
 *   const { action, label } = useCommonTranslations();
 *
 *   return (
 *     <div>
 *       <span>{label('actions')}</span>
 *       <button onClick={onSave}>{action('save')}</button>
 *       <button onClick={onCancel}>{action('cancel')}</button>
 *       <button onClick={onDelete}>{action('delete')}</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Using raw t function for edge cases
 * ```tsx
 * const { t } = useCommonTranslations();
 * // Access any key in the common namespace
 * const customText = t('someCustomKey');
 * ```
 *
 * @see {@link https://next-intl-docs.vercel.app/} next-intl documentation
 */
export function useCommonTranslations(): UseCommonTranslationsReturn {
  // ... implementation
}
```

#### Acceptance Criteria

- [ ] JSDoc includes @returns tag
- [ ] At least 3 usage examples are provided
- [ ] Examples compile without errors
- [ ] Documentation appears in IDE hover tooltips

---

### Task 5: Add Error Handling and Fallbacks

**File**: `/src/hooks/useCommonTranslations.ts`
**Effort**: ~20 minutes
**Dependencies**: Task 3

#### Description

Add graceful error handling for missing translation keys and edge cases.

#### Implementation Details

```typescript
// Add development-only warning for missing keys
const createTranslationAccessor = <T extends string>(category: string) => {
  return useCallback(
    (key: T): string => {
      const result = t(key);

      // In development, warn if key appears to be missing
      // (next-intl returns the key path when translation is missing)
      if (process.env.NODE_ENV === 'development') {
        if (result === key || result.startsWith('common.')) {
          console.warn(
            `[useCommonTranslations] Missing translation key: ${key} in ${category} category`
          );
        }
      }

      return result;
    },
    [t]
  );
};
```

#### Acceptance Criteria

- [ ] Development warnings appear for missing keys
- [ ] Warnings do not appear in production
- [ ] Hook does not throw errors for missing keys
- [ ] Fallback behavior returns the key name (next-intl default)

---

### Task 6: Create Unit Tests

**File**: `/src/hooks/__tests__/useCommonTranslations.test.ts`
**Effort**: ~45 minutes
**Dependencies**: Task 5

#### Description

Create comprehensive unit tests for the hook covering basic usage, type safety, and memoization.

#### Implementation Details

```typescript
// /src/hooks/__tests__/useCommonTranslations.test.ts

import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { useCommonTranslations } from '../useCommonTranslations';
import type { ReactNode } from 'react';

// Mock messages
const mockMessages = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    actions: 'Actions',
  },
};

// Wrapper component for testing
function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

describe('useCommonTranslations', () => {
  it('returns action translation functions', () => {
    const { result } = renderHook(() => useCommonTranslations(), {
      wrapper: TestWrapper,
    });

    expect(result.current.action('save')).toBe('Save');
    expect(result.current.action('cancel')).toBe('Cancel');
    expect(result.current.action('delete')).toBe('Delete');
  });

  it('returns status translation functions', () => {
    const { result } = renderHook(() => useCommonTranslations(), {
      wrapper: TestWrapper,
    });

    expect(result.current.status('loading')).toBe('Loading...');
    expect(result.current.status('success')).toBe('Success');
    expect(result.current.status('error')).toBe('Error');
  });

  it('returns label translation functions', () => {
    const { result } = renderHook(() => useCommonTranslations(), {
      wrapper: TestWrapper,
    });

    expect(result.current.label('actions')).toBe('Actions');
  });

  it('provides raw t function for edge cases', () => {
    const { result } = renderHook(() => useCommonTranslations(), {
      wrapper: TestWrapper,
    });

    expect(typeof result.current.t).toBe('function');
    expect(result.current.t('save')).toBe('Save');
  });

  it('memoizes return values across renders', () => {
    const { result, rerender } = renderHook(() => useCommonTranslations(), {
      wrapper: TestWrapper,
    });

    const firstAction = result.current.action;
    const firstStatus = result.current.status;

    rerender();

    expect(result.current.action).toBe(firstAction);
    expect(result.current.status).toBe(firstStatus);
  });
});
```

#### Files to Create

| File | Action | Description |
|------|--------|-------------|
| `/src/hooks/__tests__/useCommonTranslations.test.ts` | CREATE | Unit test file |

#### Acceptance Criteria

- [ ] All tests pass: `npm test -- --testPathPattern=useCommonTranslations`
- [ ] Test coverage includes basic usage
- [ ] Test coverage includes memoization verification
- [ ] Tests use proper next-intl test setup

---

### Task 7: Export Hook from Barrel File

**File**: `/src/hooks/index.ts` (create if doesn't exist)
**Effort**: ~10 minutes
**Dependencies**: Task 5

#### Description

Add the hook export to the hooks barrel file for easy importing.

#### Implementation Details

Check if `/src/hooks/index.ts` exists. If not, create it:

```typescript
// /src/hooks/index.ts
// Barrel exports for all hooks

// Localization hooks
export { useCommonTranslations } from './useCommonTranslations';
export type {
  CommonActionKey,
  CommonStatusKey,
  CommonLabelKey,
  UseCommonTranslationsReturn,
} from './useCommonTranslations';

// Other existing hooks (if barrel file exists)
export { useLanguagePreference } from './useLanguagePreference';
export { useDashboardTier } from './useDashboardTier';
// ... etc
```

If barrel file already exists, just add the new export.

#### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `/src/hooks/index.ts` | CREATE/MODIFY | Add hook exports |

#### Acceptance Criteria

- [ ] Hook can be imported via `@/hooks/useCommonTranslations`
- [ ] Hook can be imported via `@/hooks` (barrel export)
- [ ] All types are exported and accessible
- [ ] No circular dependency warnings

---

### Task 8: Demonstrate Usage with Component Refactor

**File**: Example component (e.g., `/src/components/LogoutButton.tsx` or similar)
**Effort**: ~30 minutes
**Dependencies**: Task 7

#### Description

Refactor at least one existing component to use the new hook, demonstrating the code simplification.

#### Implementation Details

Find a component that currently uses `useTranslations('common')` directly and refactor it:

**Before (example):**
```typescript
'use client';
import { useTranslations } from 'next-intl';

function ActionButtons() {
  const t = useTranslations('common');

  return (
    <div>
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
      {isLoading && <span>{t('loading')}</span>}
    </div>
  );
}
```

**After:**
```typescript
'use client';
import { useCommonTranslations } from '@/hooks/useCommonTranslations';

function ActionButtons() {
  const { action, status } = useCommonTranslations();

  return (
    <div>
      <button>{action('save')}</button>
      <button>{action('cancel')}</button>
      {isLoading && <span>{status('loading')}</span>}
    </div>
  );
}
```

#### Files to Modify

| File | Action | Description |
|------|--------|-------------|
| Component TBD | MODIFY | Refactor to use new hook |

#### Acceptance Criteria

- [ ] At least one component is refactored to use the hook
- [ ] Component continues to function correctly
- [ ] Code is cleaner/more readable than before
- [ ] Application builds without errors: `npm run build`

---

## Complete Implementation File

Below is the complete implementation for reference:

```typescript
// /src/hooks/useCommonTranslations.ts
// REQ-E02-031: Common Translations Convenience Hook
// Created: 2026-01-20
// Last Modified: 2026-01-20

'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';

// ============ Type Definitions ============

/**
 * Keys for action button translations (save, cancel, delete, etc.)
 * These keys map directly to the common namespace in translation files.
 */
export type CommonActionKey =
  | 'save'
  | 'cancel'
  | 'delete'
  | 'edit'
  | 'create'
  | 'submit'
  | 'close'
  | 'back'
  | 'next'
  | 'confirm'
  | 'reset'
  | 'clear'
  | 'search'
  | 'filter'
  | 'sort'
  | 'view'
  | 'download'
  | 'upload'
  | 'copy'
  | 'share'
  | 'more'
  | 'less'
  | 'select'
  | 'yes'
  | 'no';

/**
 * Keys for status message translations
 */
export type CommonStatusKey =
  | 'loading'
  | 'error'
  | 'success';

/**
 * Keys for common labels and text
 */
export type CommonLabelKey =
  | 'actions'
  | 'all'
  | 'none'
  | 'optional'
  | 'required';

/**
 * Return type for the useCommonTranslations hook
 */
export interface UseCommonTranslationsReturn {
  /** Get action button label (save, cancel, delete, etc.) */
  action: (key: CommonActionKey) => string;

  /** Get status message (loading, success, error) */
  status: (key: CommonStatusKey) => string;

  /** Get common label (actions, all, none, etc.) */
  label: (key: CommonLabelKey) => string;

  /** Raw translation function for edge cases or advanced usage */
  t: ReturnType<typeof useTranslations>;
}

// ============ Hook Implementation ============

/**
 * Convenience hook for accessing common translation strings.
 *
 * Provides typed, memoized access to frequently used UI strings
 * from the 'common' namespace. This hook wraps next-intl's
 * useTranslations hook and organizes translations by category.
 *
 * @returns Object with categorized translation accessors
 *
 * @example Basic usage
 * ```tsx
 * 'use client';
 * import { useCommonTranslations } from '@/hooks/useCommonTranslations';
 *
 * function SaveButton({ onSave, isSaving }: Props) {
 *   const { action, status } = useCommonTranslations();
 *
 *   return (
 *     <button onClick={onSave} disabled={isSaving}>
 *       {isSaving ? status('loading') : action('save')}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Using multiple categories
 * ```tsx
 * function ActionPanel({ onSave, onCancel, onDelete }) {
 *   const { action, label } = useCommonTranslations();
 *
 *   return (
 *     <div>
 *       <span>{label('actions')}</span>
 *       <button onClick={onSave}>{action('save')}</button>
 *       <button onClick={onCancel}>{action('cancel')}</button>
 *       <button onClick={onDelete}>{action('delete')}</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Using raw t function for edge cases
 * ```tsx
 * const { t } = useCommonTranslations();
 * // Access any key in the common namespace
 * const customText = t('someCustomKey');
 * ```
 */
export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  // Memoized action accessor for button labels
  const action = useCallback(
    (key: CommonActionKey): string => {
      const result = t(key);

      // Development warning for missing translations
      if (process.env.NODE_ENV === 'development' && result === key) {
        console.warn(`[useCommonTranslations] Missing action key: ${key}`);
      }

      return result;
    },
    [t]
  );

  // Memoized status accessor for loading/success/error states
  const status = useCallback(
    (key: CommonStatusKey): string => {
      const result = t(key);

      if (process.env.NODE_ENV === 'development' && result === key) {
        console.warn(`[useCommonTranslations] Missing status key: ${key}`);
      }

      return result;
    },
    [t]
  );

  // Memoized label accessor for common labels
  const label = useCallback(
    (key: CommonLabelKey): string => {
      const result = t(key);

      if (process.env.NODE_ENV === 'development' && result === key) {
        console.warn(`[useCommonTranslations] Missing label key: ${key}`);
      }

      return result;
    },
    [t]
  );

  // Return memoized object to maintain referential equality
  return useMemo(
    () => ({
      action,
      status,
      label,
      t,
    }),
    [action, status, label, t]
  );
}

export default useCommonTranslations;
```

---

## Validation Checklist

### Implementation Validation

- [ ] Hook file exists at `/src/hooks/useCommonTranslations.ts`
- [ ] Hook has `'use client'` directive
- [ ] Hook wraps `useTranslations('common')` from next-intl
- [ ] Hook exports types for all key categories
- [ ] Hook return object includes all categories plus raw `t`

### Type Safety Validation

- [ ] TypeScript types defined for all category keys
- [ ] IDE autocomplete works for all categories
- [ ] Invalid keys produce TypeScript errors
- [ ] Types can be imported separately

### Memoization Validation

- [ ] Category functions use `useCallback`
- [ ] Return object uses `useMemo`
- [ ] Referential equality maintained across renders (verify in tests)

### Documentation Validation

- [ ] JSDoc comments explain hook purpose
- [ ] At least 3 usage examples included in comments
- [ ] Each category function is documented

### Testing Validation

- [ ] Test file exists at `/src/hooks/__tests__/useCommonTranslations.test.ts`
- [ ] Tests pass: `npm test -- --testPathPattern=useCommonTranslations`
- [ ] Tests cover basic usage
- [ ] Tests verify memoization behavior

### Integration Validation

- [ ] Hook exported from barrel file
- [ ] At least one component refactored to use hook
- [ ] Application builds without errors: `npm run build`
- [ ] Hook works at runtime with actual translations

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type definitions out of sync with JSON keys | Medium | Low | Keep types and JSON in sync; automated validation possible |
| Test setup complexity with next-intl | Medium | Low | Use documented test patterns from next-intl docs |
| Breaking existing imports | Low | Low | This is additive; existing patterns still work |
| Performance regression | Very Low | Low | Memoization ensures no extra renders |

---

## Notes

### Alignment with Existing Patterns

This implementation follows patterns established in the codebase:

| Pattern | Example | Applied Here |
|---------|---------|--------------|
| Hook file naming | `useLanguagePreference.ts` | `useCommonTranslations.ts` |
| Client directive | `'use client'` in hooks | Same |
| Type exports | Named exports in hooks | Same |
| JSDoc documentation | Comprehensive in existing hooks | Same |
| Test location | `/src/hooks/__tests__/` | Same |
| Memoization | useCallback/useMemo patterns | Same |

### Optional Nature

As noted in Plan-111, this hook is **optional**. Components can always use `useTranslations('common')` directly. The hook exists to:

1. Improve developer experience with autocomplete
2. Prevent typos in translation keys
3. Standardize access patterns
4. Reduce cognitive load

### Future Enhancements

Potential future improvements (not in current scope):

1. **Auto-generated types**: Generate TypeScript types from JSON files
2. **Additional namespaces**: Similar hooks for `errors`, `auth` namespaces
3. **Rich text support**: Helpers for `t.rich()` usage
4. **Missing key tracking**: Production error tracking for missing translations

---

*End of Detailed Task Breakdown*
