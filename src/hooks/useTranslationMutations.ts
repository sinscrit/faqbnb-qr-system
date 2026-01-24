/**
 * useTranslationMutations Hook
 *
 * Centralizes all translation mutation operations (save, retranslate, retry)
 * with loading states, error handling, and toast notifications.
 *
 * @module hooks/useTranslationMutations
 * @created 2026-01-24
 * @requestReference REQ-E05-030
 *
 * @example
 * ```tsx
 * import { useTranslationMutations } from '@/hooks/useTranslationMutations';
 *
 * function TranslationEditor() {
 *   const {
 *     saveTranslation,
 *     retranslate,
 *     retryFailed,
 *     isSaving,
 *     isRetranslating,
 *     isRetrying,
 *     error
 *   } = useTranslationMutations();
 *
 *   const handleSave = async () => {
 *     const success = await saveTranslation({
 *       entityType: 'item',
 *       entityId: '123',
 *       language: 'fr',
 *       content: { title: 'Mon titre', description: 'Ma description' }
 *     });
 *     if (success) {
 *       // Handle success
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleSave} disabled={isSaving}>
 *       {isSaving ? 'Saving...' : 'Save'}
 *     </button>
 *   );
 * }
 * ```
 */

'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Data required for updating a translation.
 */
export interface TranslationUpdateData {
  /** Entity type (item, article, link, tag) */
  entityType: 'item' | 'article' | 'link' | 'tag';
  /** Entity ID (publicId or id) */
  entityId: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Translated content fields */
  content: Record<string, string>;
}

/**
 * Data required for retranslation requests.
 */
export interface RetranslateData {
  /** Entity type (item, article, link, tag) */
  entityType: 'item' | 'article' | 'link' | 'tag';
  /** Entity ID (publicId or id) */
  entityId: string;
  /** Languages to retranslate */
  languages: SupportedLanguage[];
}

/**
 * Return type for useTranslationMutations hook.
 */
export interface UseTranslationMutationsReturn {
  /** Save a translation edit */
  saveTranslation: (data: TranslationUpdateData) => Promise<boolean>;
  /** Trigger retranslation for specified languages */
  retranslate: (data: RetranslateData) => Promise<boolean>;
  /** Retry a failed translation for a specific language */
  retryFailed: (data: Omit<RetranslateData, 'languages'> & { language: SupportedLanguage }) => Promise<boolean>;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Whether a retranslate operation is in progress */
  isRetranslating: boolean;
  /** Whether a retry operation is in progress */
  isRetrying: boolean;
  /** Most recent error, if any */
  error: Error | null;
  /** Clear the current error */
  clearError: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing translation mutation operations with loading states
 * and toast notifications.
 *
 * @returns Object with mutation functions, loading states, and error state
 */
export function useTranslationMutations(): UseTranslationMutationsReturn {
  // Translation function for toast messages
  const t = useTranslations('translationManagement');
  const { toast } = useToast();

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isRetranslating, setIsRetranslating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Error state
  const [error, setError] = useState<Error | null>(null);

  /**
   * Clear the current error state.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Save a translation edit.
   * Shows success toast on completion, error toast on failure.
   */
  const saveTranslation = useCallback(
    async (data: TranslationUpdateData): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch('/api/translations/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to save: ${response.statusText}`);
        }

        toast({
          title: t('success.saved'),
          variant: 'success',
        });

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);

        toast({
          title: t('errors.saveFailed'),
          description: error.message,
          variant: 'error',
        });

        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [t, toast]
  );

  /**
   * Trigger retranslation for specified languages.
   * Shows success toast on completion, error toast on failure.
   */
  const retranslate = useCallback(
    async (data: RetranslateData): Promise<boolean> => {
      setIsRetranslating(true);
      setError(null);

      try {
        const response = await fetch('/api/translations/retranslate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entities: [{ type: data.entityType, id: data.entityId }],
            languages: data.languages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to retranslate: ${response.statusText}`);
        }

        toast({
          title: t('success.retranslateStarted'),
          variant: 'success',
        });

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);

        toast({
          title: t('errors.retranslateFailed'),
          description: error.message,
          variant: 'error',
        });

        return false;
      } finally {
        setIsRetranslating(false);
      }
    },
    [t, toast]
  );

  /**
   * Retry a failed translation for a specific language.
   * Shows success toast on completion, error toast on failure.
   */
  const retryFailed = useCallback(
    async (data: Omit<RetranslateData, 'languages'> & { language: SupportedLanguage }): Promise<boolean> => {
      setIsRetrying(true);
      setError(null);

      try {
        const response = await fetch('/api/translations/retranslate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entities: [{ type: data.entityType, id: data.entityId }],
            languages: [data.language],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to retry: ${response.statusText}`);
        }

        toast({
          title: t('success.retryStarted'),
          variant: 'success',
        });

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);

        toast({
          title: t('errors.retryFailed'),
          description: error.message,
          variant: 'error',
        });

        return false;
      } finally {
        setIsRetrying(false);
      }
    },
    [t, toast]
  );

  return {
    saveTranslation,
    retranslate,
    retryFailed,
    isSaving,
    isRetranslating,
    isRetrying,
    error,
    clearError,
  };
}
