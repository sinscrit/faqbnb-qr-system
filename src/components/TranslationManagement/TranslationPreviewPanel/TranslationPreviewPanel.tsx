'use client';

/**
 * TranslationPreviewPanel Component
 *
 * A slide-in drawer component for previewing and managing translations.
 * Displays source content and translation status for all supported languages
 * with action buttons.
 *
 * @module TranslationManagement/TranslationPreviewPanel
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-22
 * @requestReference REQ-E05-007
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <TranslationPreviewPanel
 *   entityId="123"
 *   entityType="item"
 *   sourceLanguage="en"
 *   sourceContent={{ name: "Coffee Maker", description: "How to use the coffee maker" }}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onTranslationEdited={(lang) => console.log(`Edited ${lang}`)}
 * />
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  TranslationPreviewPanelProps,
  TranslationFieldContent,
} from '@/components/TranslationManagement/TranslationManagement.types';
import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';
// import { SourceContentSection } from './SourceContentSection';
import { TranslationStatusItem } from './TranslationStatusItem';
import { TranslationProgressBar } from './TranslationProgressBar';

/**
 * Supported target languages for translation.
 * English (en) is the source language and not included.
 */
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];

/**
 * Internal representation of translation status for a single language with action capabilities.
 */
type TranslationStatusData = {
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedAt?: string;
  isStale?: boolean;
  canEdit: boolean;
  canRetranslate: boolean;
  content?: TranslationFieldContent;
};

/**
 * Internal state for the TranslationPreviewPanel component.
 */
type PanelState = {
  translations: TranslationStatusData[];
  isLoading: boolean;
  error: Error | null;
  sourceContent: TranslationFieldContent | null;
  sourceLanguage: SupportedLanguage;
  entityName: string;
};

// Props interface extended with optional className
interface ExtendedTranslationPreviewPanelProps extends TranslationPreviewPanelProps {
  className?: string;
}

export function TranslationPreviewPanel(props: ExtendedTranslationPreviewPanelProps) {
  const {
    entityId,
    entityType,
    sourceLanguage,
    sourceContent,
    isOpen,
    onClose,
    onTranslationEdited,
    className,
  } = props;

  const t = useTranslations('translation.previewPanel');
  const tCommon = useTranslations('common.actions');

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  const [panelState, setPanelState] = useState<PanelState>({
    translations: [],
    isLoading: false,
    error: null,
    sourceContent: null,
    sourceLanguage: 'en',
    entityName: '',
  });

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchTranslationData = useCallback(async () => {
    setPanelState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `/api/translations/status?entityType=${entityType}&entityId=${entityId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();

      // Map response to translations array
      const translations: TranslationStatusData[] = SUPPORTED_LANGUAGES.map(lang => {
        const langData = data.items?.[0]?.translations?.find(
          (t: { language: SupportedLanguage }) => t.language === lang
        );
        return {
          language: lang,
          status: langData?.status || 'pending',
          translatedAt: langData?.translatedAt,
          isStale: langData?.isStale,
          canEdit: langData?.canEdit ?? true,
          canRetranslate: langData?.canRetranslate ?? true,
          content: langData?.content,
        };
      });

      setPanelState({
        translations,
        isLoading: false,
        error: null,
        sourceContent: data.items?.[0]?.sourceContent || null,
        sourceLanguage: data.items?.[0]?.sourceLanguage || 'en',
        entityName: data.items?.[0]?.entityName || '',
      });
    } catch (err) {
      setPanelState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }));
    }
  }, [entityType, entityId]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Fetch data when panel opens
  useEffect(() => {
    if (isOpen && entityId) {
      fetchTranslationData();
    }
  }, [isOpen, entityId, fetchTranslationData]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handleRetranslate = useCallback(
    async (language: SupportedLanguage) => {
      try {
        const response = await fetch('/api/translations/retranslate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entities: [{ type: entityType, id: entityId }],
            languages: [language],
          }),
        });

        if (response.ok) {
          await fetchTranslationData();
        }
      } catch (err) {
        console.error('Retranslate failed:', err);
      }
    },
    [entityType, entityId, fetchTranslationData]
  );

  const handleRetranslateAll = useCallback(async () => {
    try {
      const response = await fetch('/api/translations/retranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entities: [{ type: entityType, id: entityId }],
          languages: SUPPORTED_LANGUAGES,
        }),
      });

      if (response.ok) {
        await fetchTranslationData();
      }
    } catch (err) {
      console.error('Retranslate all failed:', err);
    }
  }, [entityType, entityId, fetchTranslationData]);

  const handleEdit = useCallback(
    (language: SupportedLanguage) => {
      onTranslationEdited?.(language);
    },
    [onTranslationEdited]
  );

  // Alias for retry - same as retranslate
  const handleRetry = handleRetranslate;

  // Keep linter happy
  void handleEdit;
  void handleRetry;

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel container */}
      <div
        ref={panelRef}
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[400px]',
          'bg-white dark:bg-gray-900 shadow-xl z-50',
          'transform transition-transform duration-300',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="panel-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {panelState.entityName || t('title')}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={tCommon('close')}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          {t('statusFor')} {SUPPORTED_LANGUAGES.length} {t('languages')}
        </div>

        {/* Source Content */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('sourceContent')} ({(panelState.sourceLanguage || sourceLanguage).toUpperCase()})
          </h3>
          <div className="space-y-2">
            {(panelState.sourceContent?.title ||
              panelState.sourceContent?.name ||
              sourceContent?.title ||
              sourceContent?.name) && (
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {entityType === 'item' ? t('name') : t('titleField')}:
                </span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {panelState.sourceContent?.title ||
                    panelState.sourceContent?.name ||
                    sourceContent?.title ||
                    sourceContent?.name}
                </p>
              </div>
            )}
            {(panelState.sourceContent?.description || sourceContent?.description) && (
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('description')}:
                </span>
                <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                  {panelState.sourceContent?.description || sourceContent?.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Translations List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Loading state */}
          {panelState.isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('loadingTranslations')}
              </p>
            </div>
          )}

          {/* Error state */}
          {panelState.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t('errorLoading')}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {panelState.error.message}
                  </p>
                  <button
                    onClick={fetchTranslationData}
                    className="text-sm text-red-600 dark:text-red-400 underline mt-2"
                  >
                    {t('retry')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success state with translations */}
          {!panelState.isLoading && !panelState.error && panelState.translations.length > 0 && (
            <>
              {/* Progress Bar */}
              <TranslationProgressBar
                completed={panelState.translations.filter(t => t.status === 'completed').length}
                pending={panelState.translations.filter(t => t.status === 'pending' || t.status === 'processing').length}
                failed={panelState.translations.filter(t => t.status === 'failed').length}
                stale={panelState.translations.filter(t => t.isStale).length}
                total={SUPPORTED_LANGUAGES.length}
                showLabels
                showPercentage
                size="md"
                className="mb-4"
              />

              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 mt-4">
                {t('translations')}
              </h3>

              <div className="space-y-2">
                {panelState.translations.map(trans => (
                  <TranslationStatusItem
                    key={trans.language}
                    language={trans.language}
                    status={trans.status}
                    previewText={trans.content?.title || trans.content?.name || trans.content?.description}
                    lastUpdated={trans.translatedAt}
                    onEdit={handleEdit}
                    onRetranslate={handleRetranslate}
                    onRetry={handleRetranslate}
                    disabled={panelState.isLoading}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
          <button
            onClick={handleRetranslateAll}
            disabled={panelState.isLoading || panelState.translations.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4" />
            {t('retranslateAll')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {tCommon('close')}
          </button>
        </div>
      </div>
    </>
  );
}
