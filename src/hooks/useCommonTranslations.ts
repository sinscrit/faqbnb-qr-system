// /src/hooks/useCommonTranslations.ts
// REQ-E02-031: Common Translations Convenience Hook
// Created: 2026-01-21
// Last Modified: 2026-01-21

'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';

// ============ Type Definitions ============

/**
 * Keys for action button translations (save, cancel, delete, etc.)
 * Mapped to: common.actions.{key} in translation files
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
  | 'done'
  | 'continue'
  | 'retry'
  | 'refresh'
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
  | 'select'
  | 'download'
  | 'upload'
  | 'copy'
  | 'share'
  | 'remove';

/**
 * Keys for status message translations
 * Mapped to: common.status.{key} in translation files
 */
export type CommonStatusKey =
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
 * Keys for confirmation dialog buttons
 * Mapped to: common.confirmations.buttons.{key} in translation files
 */
export type CommonConfirmationButtonKey =
  | 'confirm'
  | 'cancel'
  | 'delete'
  | 'remove'
  | 'yes'
  | 'no'
  | 'proceed'
  | 'goBack'
  | 'stay';

/**
 * Keys for empty state messages
 * Mapped to: common.emptyStates.generic.{key} in translation files
 */
export type CommonEmptyStateKey =
  | 'noData'
  | 'noResults'
  | 'noResultsSearch'
  | 'noResultsFilter'
  | 'tryAdjusting';

/**
 * Keys for form hints
 * Mapped to: common.form.hints.{key} in translation files
 */
export type CommonFormHintKey =
  | 'optional'
  | 'required';

/**
 * Return type for the useCommonTranslations hook
 */
export interface UseCommonTranslationsReturn {
  /** Get action button label (save, cancel, delete, etc.) */
  action: (key: CommonActionKey) => string;

  /** Get status message (loading, success, error, etc.) */
  status: (key: CommonStatusKey) => string;

  /** Get confirmation button label (confirm, cancel, yes, no, etc.) */
  confirmButton: (key: CommonConfirmationButtonKey) => string;

  /** Get empty state message (noData, noResults, etc.) */
  emptyState: (key: CommonEmptyStateKey) => string;

  /** Get form hint (optional, required) */
  formHint: (key: CommonFormHintKey) => string;

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
 *   const { action, confirmButton } = useCommonTranslations();
 *
 *   return (
 *     <div>
 *       <button onClick={onSave}>{action('save')}</button>
 *       <button onClick={onCancel}>{confirmButton('cancel')}</button>
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
 * const customText = t('notifications.success.changesSaved');
 * ```
 *
 * @see {@link https://next-intl-docs.vercel.app/} next-intl documentation
 */
export function useCommonTranslations(): UseCommonTranslationsReturn {
  const t = useTranslations('common');

  // Memoized action accessor for button labels
  // Maps to common.actions.{key}
  const action = useCallback(
    (key: CommonActionKey): string => {
      const result = t(`actions.${key}`);

      // Development warning for missing translations
      if (process.env.NODE_ENV === 'development' && result === `actions.${key}`) {
        console.warn(`[useCommonTranslations] Missing action key: ${key}`);
      }

      return result;
    },
    [t]
  );

  // Memoized status accessor for loading/success/error states
  // Maps to common.status.{key}
  const status = useCallback(
    (key: CommonStatusKey): string => {
      const result = t(`status.${key}`);

      if (process.env.NODE_ENV === 'development' && result === `status.${key}`) {
        console.warn(`[useCommonTranslations] Missing status key: ${key}`);
      }

      return result;
    },
    [t]
  );

  // Memoized confirmation button accessor
  // Maps to common.confirmations.buttons.{key}
  const confirmButton = useCallback(
    (key: CommonConfirmationButtonKey): string => {
      const result = t(`confirmations.buttons.${key}`);

      if (process.env.NODE_ENV === 'development' && result === `confirmations.buttons.${key}`) {
        console.warn(`[useCommonTranslations] Missing confirmButton key: ${key}`);
      }

      return result;
    },
    [t]
  );

  // Memoized empty state accessor
  // Maps to common.emptyStates.generic.{key}
  const emptyState = useCallback(
    (key: CommonEmptyStateKey): string => {
      const result = t(`emptyStates.generic.${key}`);

      if (process.env.NODE_ENV === 'development' && result === `emptyStates.generic.${key}`) {
        console.warn(`[useCommonTranslations] Missing emptyState key: ${key}`);
      }

      return result;
    },
    [t]
  );

  // Memoized form hint accessor
  // Maps to common.form.hints.{key}
  const formHint = useCallback(
    (key: CommonFormHintKey): string => {
      const result = t(`form.hints.${key}`);

      if (process.env.NODE_ENV === 'development' && result === `form.hints.${key}`) {
        console.warn(`[useCommonTranslations] Missing formHint key: ${key}`);
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
      confirmButton,
      emptyState,
      formHint,
      t,
    }),
    [action, status, confirmButton, emptyState, formHint, t]
  );
}

export default useCommonTranslations;
