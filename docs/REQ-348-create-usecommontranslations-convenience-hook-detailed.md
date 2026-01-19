# REQ-348: Create useCommonTranslations Convenience Hook - Detailed Task Breakdown

**Generated:** 2026-01-19 23:15:00 UTC
**Last Modified:** 2026-01-19 23:15:00 UTC
**Overview Document:** docs/REQ-348-create-usecommontranslations-convenience-hook-overview.md
**Request Reference:** docs/gen_requests_epic2.md - Request #348
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.11
**Status:** READY FOR IMPLEMENTATION
**Size:** S (Small)
**Priority:** Optional Enhancement

---

## Executive Summary

This document provides a detailed, step-by-step task breakdown for implementing the `useCommonTranslations` convenience hook. The hook wraps next-intl's `useTranslations` to provide organized, typed access to common namespace translations, reducing boilerplate and improving developer experience.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with `common` namespace
- [ ] `/src/lib/i18n/config.ts` exists with locale configuration
- [ ] `useTranslations` hook works in existing components
- [ ] TypeScript strict mode enabled in codebase

---

## Task Breakdown

### Task 1: Create Type Definitions File

**File:** `/src/hooks/useCommonTranslations.types.ts`
**Estimated Effort:** 15 minutes
**Dependencies:** None

#### 1.1 Create the types file

Create a new file at `/src/hooks/useCommonTranslations.types.ts` with the following content:

```typescript
// src/hooks/useCommonTranslations.types.ts
// REQ-348: Type definitions for useCommonTranslations hook
// Created: 2026-01-XX
// Last Modified: 2026-01-XX

/**
 * Action key types for common action translations (buttons, links)
 * Maps to common.actions.* or flat common.* keys
 */
export type ActionKey =
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
  | 'done'
  | 'continue'
  | 'retry'
  | 'refresh'
  | 'loading'
  | 'search'
  | 'filter'
  | 'sort'
  | 'clear'
  | 'reset'
  | 'apply'
  | 'view'
  | 'viewAll'
  | 'showMore'
  | 'showLess'
  | 'selectAll'
  | 'deselectAll'
  | 'download'
  | 'upload'
  | 'copy'
  | 'share'
  | 'more'
  | 'less'
  | 'all'
  | 'none'
  | 'select'
  | 'actions';

/**
 * Status key types for loading/state translations
 * Maps to common.status.* or flat common.* keys
 */
export type StatusKey =
  | 'loading'
  | 'saving'
  | 'deleting'
  | 'success'
  | 'error'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'active'
  | 'inactive'
  | 'enabled'
  | 'disabled';

/**
 * Confirmation key types for dialog translations
 * Maps to common.confirmation.* keys
 */
export type ConfirmationKey =
  | 'title'
  | 'deleteTitle'
  | 'deleteMessage'
  | 'unsavedChanges'
  | 'yes'
  | 'no';

/**
 * Empty state key types
 * Maps to common.empty.* keys
 */
export type EmptyKey =
  | 'noData'
  | 'noResults'
  | 'tryAgain';

/**
 * Time/date relative expression key types
 * Maps to common.time.* keys
 */
export type TimeKey =
  | 'justNow'
  | 'minutesAgo'
  | 'hoursAgo'
  | 'daysAgo'
  | 'today'
  | 'yesterday';

/**
 * Pagination key types
 * Maps to common.pagination.* keys
 */
export type PaginationKey =
  | 'previous'
  | 'next'
  | 'page'
  | 'showing';

/**
 * Validation message key types
 * Maps to common.validation.* keys
 */
export type ValidationKey =
  | 'required'
  | 'invalidEmail'
  | 'tooShort'
  | 'tooLong'
  | 'optional';

/**
 * Form element key types (labels, placeholders)
 * Maps to common.form.* keys
 */
export type FormKey =
  | 'email'
  | 'password'
  | 'name'
  | 'description'
  | 'search'
  | 'optional'
  | 'required';

/**
 * Translation function type with optional interpolation params
 */
export type TranslationFunction<K extends string> = (
  key: K,
  params?: Record<string, string | number>
) => string;

/**
 * Return type for useCommonTranslations hook
 */
export interface UseCommonTranslationsReturn {
  /**
   * Raw translation function for common namespace
   * Use for edge cases or custom keys
   */
  t: (key: string, params?: Record<string, string | number>) => string;

  /**
   * Access action-related translations (save, cancel, delete, etc.)
   * @example actions('save') => "Save"
   */
  actions: TranslationFunction<ActionKey>;

  /**
   * Access status/state translations (loading, success, error, etc.)
   * @example status('loading') => "Loading..."
   */
  status: TranslationFunction<StatusKey>;

  /**
   * Access confirmation dialog translations
   * @example confirmation('deleteTitle') => "Confirm Delete"
   */
  confirmation: TranslationFunction<ConfirmationKey>;

  /**
   * Access empty state translations
   * @example empty('noData') => "No data available"
   */
  empty: TranslationFunction<EmptyKey>;

  /**
   * Access time/date relative expressions
   * @example time('minutesAgo', { count: 5 }) => "5 minutes ago"
   */
  time: TranslationFunction<TimeKey>;

  /**
   * Access pagination translations
   * @example pagination('page', { current: 1, total: 10 }) => "Page 1 of 10"
   */
  pagination: TranslationFunction<PaginationKey>;

  /**
   * Access validation message translations
   * @example validation('required') => "This field is required"
   */
  validation: TranslationFunction<ValidationKey>;

  /**
   * Access form element translations (labels, placeholders)
   * @example form('email') => "Email"
   */
  form: TranslationFunction<FormKey>;
}
```

#### 1.2 Verification Steps

1. Run TypeScript compiler: `npx tsc --noEmit`
2. Verify no compilation errors
3. Verify types can be imported: `import { ActionKey } from './useCommonTranslations.types'`

---

### Task 2: Create Hook Implementation

**File:** `/src/hooks/useCommonTranslations.ts`
**Estimated Effort:** 30 minutes
**Dependencies:** Task 1

#### 2.1 Create the main hook file

Create a new file at `/src/hooks/useCommonTranslations.ts`:

```typescript
// src/hooks/useCommonTranslations.ts
// REQ-348: Convenience hook for common namespace translations
// Created: 2026-01-XX
// Last Modified: 2026-01-XX

'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type {
  UseCommonTranslationsReturn,
  ActionKey,
  StatusKey,
  ConfirmationKey,
  EmptyKey,
  TimeKey,
  PaginationKey,
  ValidationKey,
  FormKey,
} from './useCommonTranslations.types';

// Re-export types for convenience
export type {
  UseCommonTranslationsReturn,
  ActionKey,
  StatusKey,
  ConfirmationKey,
  EmptyKey,
  TimeKey,
  PaginationKey,
  ValidationKey,
  FormKey,
} from './useCommonTranslations.types';

const DEBUG_PREFIX = '🌐 COMMON_TRANSLATIONS:';
const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

/**
 * Log debug messages in development mode
 */
function debugLog(message: string, data?: unknown): void {
  if (DEBUG_ENABLED) {
    console.log(`${DEBUG_PREFIX} ${message}`, data ?? '');
  }
}

/**
 * Creates a translation accessor function for a specific category.
 * Handles both nested (common.actions.save) and flat (common.save) structures.
 *
 * @param t - The base translation function from useTranslations('common')
 * @param category - The category name (e.g., 'actions', 'status')
 * @returns A function that resolves translation keys
 */
function createCategoryAccessor<K extends string>(
  t: ReturnType<typeof useTranslations>,
  category: string
): (key: K, params?: Record<string, string | number>) => string {
  return (key: K, params?: Record<string, string | number>): string => {
    // Strategy: Try nested path first, fall back to flat path
    // This accommodates both current flat structure and future nested structure

    try {
      // First attempt: nested path (e.g., common.actions.save)
      const nestedKey = `${category}.${key}`;
      const result = t(nestedKey, params);

      // If result equals the key, translation wasn't found
      if (result !== nestedKey) {
        debugLog(`Resolved nested key: ${nestedKey}`);
        return result;
      }
    } catch {
      // Nested path failed, try flat path
      debugLog(`Nested key failed, trying flat: ${key}`);
    }

    try {
      // Second attempt: flat path (e.g., common.save)
      const result = t(key, params);
      debugLog(`Resolved flat key: ${key}`);
      return result;
    } catch (error) {
      // Both failed, return the key as fallback
      debugLog(`Translation not found for: ${category}.${key}`, error);
      return key;
    }
  };
}

/**
 * Convenience hook for accessing common namespace translations.
 *
 * Provides organized, typed access to frequently used translations
 * grouped by category (actions, status, confirmation, etc.).
 *
 * @returns Object with category-specific translation functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { actions, status, confirmation } = useCommonTranslations();
 *
 *   return (
 *     <div>
 *       <button>{actions('save')}</button>
 *       <span>{status('loading')}</span>
 *       <p>{confirmation('deleteMessage')}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With interpolation
 * ```tsx
 * function TimeDisplay({ minutes }: { minutes: number }) {
 *   const { time } = useCommonTranslations();
 *
 *   return <span>{time('minutesAgo', { count: minutes })}</span>;
 * }
 * ```
 */
export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  // Memoize the return object to prevent unnecessary re-renders
  // Each accessor function is stable because t is stable
  const translationAccessors = useMemo<UseCommonTranslationsReturn>(() => {
    debugLog('Creating translation accessors');

    return {
      // Raw t function for edge cases
      t: (key: string, params?: Record<string, string | number>) => {
        try {
          return t(key, params);
        } catch {
          debugLog(`Direct translation failed for: ${key}`);
          return key;
        }
      },

      // Category-specific accessors
      actions: createCategoryAccessor<ActionKey>(t, 'actions'),
      status: createCategoryAccessor<StatusKey>(t, 'status'),
      confirmation: createCategoryAccessor<ConfirmationKey>(t, 'confirmation'),
      empty: createCategoryAccessor<EmptyKey>(t, 'empty'),
      time: createCategoryAccessor<TimeKey>(t, 'time'),
      pagination: createCategoryAccessor<PaginationKey>(t, 'pagination'),
      validation: createCategoryAccessor<ValidationKey>(t, 'validation'),
      form: createCategoryAccessor<FormKey>(t, 'form'),
    };
  }, [t]);

  return translationAccessors;
}

export default useCommonTranslations;
```

#### 2.2 Verification Steps

1. Run TypeScript compiler: `npx tsc --noEmit`
2. Verify no compilation errors
3. Test import in a component:
   ```tsx
   import { useCommonTranslations } from '@/hooks/useCommonTranslations';
   ```

---

### Task 3: Create Unit Tests

**File:** `/src/hooks/__tests__/useCommonTranslations.test.ts`
**Estimated Effort:** 45 minutes
**Dependencies:** Tasks 1, 2

#### 3.1 Create the test file

Create a new file at `/src/hooks/__tests__/useCommonTranslations.test.ts`:

```typescript
// src/hooks/__tests__/useCommonTranslations.test.ts
// REQ-348: Unit Tests for useCommonTranslations Hook
// Created: 2026-01-XX
// Last Modified: 2026-01-XX

import { renderHook } from '@testing-library/react';
import { useCommonTranslations } from '../useCommonTranslations';
import type { ActionKey, StatusKey, TimeKey } from '../useCommonTranslations.types';

// Mock next-intl
const mockT = jest.fn();
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => mockT),
}));

describe('useCommonTranslations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock: return the key for any translation
    mockT.mockImplementation((key: string) => key);
  });

  describe('hook initialization', () => {
    it('should return an object with all category accessors', () => {
      const { result } = renderHook(() => useCommonTranslations());

      expect(result.current).toHaveProperty('t');
      expect(result.current).toHaveProperty('actions');
      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('confirmation');
      expect(result.current).toHaveProperty('empty');
      expect(result.current).toHaveProperty('time');
      expect(result.current).toHaveProperty('pagination');
      expect(result.current).toHaveProperty('validation');
      expect(result.current).toHaveProperty('form');
    });

    it('should return functions for all category accessors', () => {
      const { result } = renderHook(() => useCommonTranslations());

      expect(typeof result.current.t).toBe('function');
      expect(typeof result.current.actions).toBe('function');
      expect(typeof result.current.status).toBe('function');
      expect(typeof result.current.confirmation).toBe('function');
      expect(typeof result.current.empty).toBe('function');
      expect(typeof result.current.time).toBe('function');
      expect(typeof result.current.pagination).toBe('function');
      expect(typeof result.current.validation).toBe('function');
      expect(typeof result.current.form).toBe('function');
    });
  });

  describe('actions accessor', () => {
    it('should call t with nested key path for action translations', () => {
      mockT.mockImplementation((key: string) => {
        if (key === 'actions.save') return 'Save';
        return key;
      });

      const { result } = renderHook(() => useCommonTranslations());
      const translation = result.current.actions('save');

      expect(translation).toBe('Save');
    });

    it('should fall back to flat key if nested key not found', () => {
      mockT.mockImplementation((key: string) => {
        if (key === 'actions.save') return 'actions.save'; // Not found
        if (key === 'save') return 'Save'; // Found in flat structure
        return key;
      });

      const { result } = renderHook(() => useCommonTranslations());
      const translation = result.current.actions('save');

      expect(translation).toBe('Save');
    });

    it('should pass params to translation function', () => {
      mockT.mockImplementation((key: string, params?: Record<string, unknown>) => {
        if (key === 'actions.loading' && params) {
          return `Loading ${params.item}...`;
        }
        return key;
      });

      const { result } = renderHook(() => useCommonTranslations());
      const translation = result.current.actions('loading', { item: 'data' });

      expect(translation).toBe('Loading data...');
    });
  });

  describe('status accessor', () => {
    it('should return status translations', () => {
      mockT.mockImplementation((key: string) => {
        if (key === 'status.loading') return 'Loading...';
        if (key === 'loading') return 'Loading...';
        return key;
      });

      const { result } = renderHook(() => useCommonTranslations());
      const translation = result.current.status('loading');

      expect(translation).toBe('Loading...');
    });
  });

  describe('time accessor', () => {
    it('should handle pluralization with count param', () => {
      mockT.mockImplementation((key: string, params?: Record<string, unknown>) => {
        if (key === 'time.minutesAgo' && params?.count === 5) {
          return '5 minutes ago';
        }
        if (key === 'minutesAgo' && params?.count === 5) {
          return '5 minutes ago';
        }
        return key;
      });

      const { result } = renderHook(() => useCommonTranslations());
      const translation = result.current.time('minutesAgo', { count: 5 });

      expect(translation).toBe('5 minutes ago');
    });
  });

  describe('raw t function', () => {
    it('should allow direct access to any key', () => {
      mockT.mockImplementation((key: string) => {
        if (key === 'customKey') return 'Custom Value';
        return key;
      });

      const { result } = renderHook(() => useCommonTranslations());
      const translation = result.current.t('customKey');

      expect(translation).toBe('Custom Value');
    });
  });

  describe('memoization', () => {
    it('should return stable object reference between renders', () => {
      const { result, rerender } = renderHook(() => useCommonTranslations());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });

  describe('error handling', () => {
    it('should return key when translation not found', () => {
      mockT.mockImplementation((key: string) => {
        throw new Error('Translation not found');
      });

      const { result } = renderHook(() => useCommonTranslations());
      const translation = result.current.actions('nonExistentKey' as ActionKey);

      expect(translation).toBe('nonExistentKey');
    });
  });
});
```

#### 3.2 Verification Steps

1. Run tests: `npm test -- --testPathPattern=useCommonTranslations`
2. Verify all tests pass
3. Check coverage: `npm test -- --coverage --testPathPattern=useCommonTranslations`

---

### Task 4: Create Barrel Export

**File:** `/src/hooks/index.ts`
**Estimated Effort:** 10 minutes
**Dependencies:** Tasks 1, 2

#### 4.1 Create or update the hooks index file

Create `/src/hooks/index.ts` if it doesn't exist, or add the export:

```typescript
// src/hooks/index.ts
// Barrel exports for hooks directory
// Last Modified: 2026-01-XX

// REQ-348: Common translations convenience hook
export {
  useCommonTranslations,
  default as useCommonTranslationsDefault,
} from './useCommonTranslations';
export type {
  UseCommonTranslationsReturn,
  ActionKey,
  StatusKey,
  ConfirmationKey,
  EmptyKey,
  TimeKey,
  PaginationKey,
  ValidationKey,
  FormKey,
} from './useCommonTranslations.types';

// Existing hook exports (add as needed)
export { useLanguagePreference } from './useLanguagePreference';
export { useDashboardStats } from './useDashboardStats';
export { useDashboardTier } from './useDashboardTier';
export { useActiveProperty } from './useActiveProperty';
export { usePropertyContext } from './usePropertyContext';
// ... add other existing hooks as needed
```

#### 4.2 Verification Steps

1. Verify import works: `import { useCommonTranslations } from '@/hooks'`
2. Verify types export: `import type { ActionKey } from '@/hooks'`
3. Run TypeScript compiler: `npx tsc --noEmit`

---

### Task 5: Integration Testing

**File:** Create test component (temporary)
**Estimated Effort:** 20 minutes
**Dependencies:** Tasks 1-4

#### 5.1 Create a test component to verify integration

Create a temporary test component to verify the hook works correctly with the real translation files:

```typescript
// src/components/__tests__/CommonTranslationsTest.tsx (temporary)
'use client';

import { useCommonTranslations } from '@/hooks/useCommonTranslations';

export function CommonTranslationsTest() {
  const { actions, status, validation, t } = useCommonTranslations();

  return (
    <div data-testid="common-translations-test">
      <h2>Common Translations Test</h2>

      <section>
        <h3>Actions</h3>
        <button>{actions('save')}</button>
        <button>{actions('cancel')}</button>
        <button>{actions('delete')}</button>
        <button>{actions('edit')}</button>
      </section>

      <section>
        <h3>Status</h3>
        <span>{status('loading')}</span>
        <span>{status('success')}</span>
        <span>{status('error')}</span>
      </section>

      <section>
        <h3>Validation</h3>
        <span>{validation('required')}</span>
      </section>

      <section>
        <h3>Raw t function</h3>
        <span>{t('yes')}</span>
        <span>{t('no')}</span>
      </section>
    </div>
  );
}
```

#### 5.2 Verification Steps

1. Import and render the test component
2. Verify translations display correctly
3. Switch languages and verify translations update
4. Check browser console for any debug messages
5. Delete the test component after verification

---

### Task 6: Documentation Update

**Estimated Effort:** 15 minutes
**Dependencies:** Tasks 1-5

#### 6.1 Add JSDoc examples to hook file (already included in Task 2)

The hook file already includes comprehensive JSDoc documentation.

#### 6.2 Verification Steps

1. Verify JSDoc comments appear in IDE tooltips
2. Verify TypeScript autocompletion works for category functions
3. Verify TypeScript autocompletion works for key parameters

---

## File Change Summary

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useCommonTranslations.ts` | Main hook implementation |
| `/src/hooks/useCommonTranslations.types.ts` | TypeScript type definitions |
| `/src/hooks/__tests__/useCommonTranslations.test.ts` | Unit tests |
| `/src/hooks/index.ts` | Barrel exports (create if doesn't exist) |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/hooks/index.ts` | Add export for new hook (if file exists) |

---

## Acceptance Criteria Verification

| Criteria | Task | Verification Method |
|----------|------|---------------------|
| Hook file created in hooks directory | Task 2 | File exists at `/src/hooks/useCommonTranslations.ts` |
| Uses `useTranslations` from next-intl | Task 2 | Code review |
| Returns object with category structure | Task 2 | Unit test, TypeScript types |
| Actions category works | Task 2, 3 | Unit test: `actions('save')` |
| Status category works | Task 2, 3 | Unit test: `status('loading')` |
| Confirmation category works | Task 2, 3 | Unit test: `confirmation('yes')` |
| Empty category works | Task 2, 3 | Unit test: `empty('noData')` |
| Time category works | Task 2, 3 | Unit test: `time('minutesAgo', { count: 5 })` |
| Pagination category works | Task 2, 3 | Unit test: `pagination('next')` |
| Validation category works | Task 2, 3 | Unit test: `validation('required')` |
| TypeScript types provided | Task 1 | TypeScript compilation passes |
| Importable in client components | Task 4, 5 | Integration test |
| Uses useMemo for performance | Task 2 | Code review, unit test |
| No breaking changes to existing code | Task 2 | Existing components continue to work |
| Integrates with next-intl type safety | Task 1, 2 | TypeScript autocompletion works |
| Unit tests pass | Task 3 | `npm test` passes |
| Usage examples provided | Task 2 | JSDoc comments in hook file |

---

## Testing Checklist

### Unit Tests

- [ ] Hook returns object with all category accessors
- [ ] Actions accessor calls correct translation keys
- [ ] Status accessor calls correct translation keys
- [ ] Confirmation accessor calls correct translation keys
- [ ] Empty accessor calls correct translation keys
- [ ] Time accessor handles interpolation params
- [ ] Pagination accessor handles interpolation params
- [ ] Validation accessor calls correct translation keys
- [ ] Raw `t` function works for custom keys
- [ ] Hook returns stable object reference (memoization)
- [ ] Error handling returns key when translation not found
- [ ] Both nested and flat key structures are supported

### Integration Tests

- [ ] Hook works in client component
- [ ] Translations display correctly
- [ ] Language switching updates translations
- [ ] No console errors in development
- [ ] No console errors in production build

### Manual Testing

- [ ] Import hook in existing component
- [ ] Verify TypeScript autocompletion for categories
- [ ] Verify TypeScript autocompletion for keys
- [ ] Test with current flat `/messages/en.json` structure
- [ ] Verify debug logging in development mode

---

## Rollback Plan

If issues are discovered after implementation:

1. Remove the barrel export from `/src/hooks/index.ts`
2. Delete `/src/hooks/useCommonTranslations.ts`
3. Delete `/src/hooks/useCommonTranslations.types.ts`
4. Delete `/src/hooks/__tests__/useCommonTranslations.test.ts`
5. Any components that adopted the hook can revert to direct `useTranslations('common')` usage

---

## Notes

- This is an **optional** enhancement (Task 2H.11)
- Existing code using `useTranslations('common')` directly continues to work
- The hook is designed to work with both the current flat structure in `/messages/en.json` and the planned nested structure in Plan-111
- Migration to this hook is optional and can be done incrementally
- Debug logging is only enabled in development mode

---

## References

- [REQ-348 Overview Document](./REQ-348-create-usecommontranslations-convenience-hook-overview.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [useLanguagePreference.ts](../src/hooks/useLanguagePreference.ts) - Hook pattern reference
- [useDashboardStats.ts](../src/hooks/useDashboardStats.ts) - Hook pattern reference
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
