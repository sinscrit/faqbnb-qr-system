'use client';

/**
 * BulkTranslationBar Component
 *
 * Contextual action bar for bulk translation operations.
 * Displays at the bottom of the viewport when items are selected,
 * providing actions for re-translation operations.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @lastModified 2026-01-24 (REQ-E05-018 - Created component)
 */

import { useState, useCallback, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Check, Loader2, X, AlertCircle, RotateCw, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Result of a bulk translation operation.
 * Returned by onRetranslateAll and onRetranslateLanguage callbacks.
 */
export interface BulkOperationResult {
  /** Whether the operation completed successfully */
  success: boolean;
  /** Number of translation jobs queued */
  jobCount: number;
  /** Number of items skipped (already translated, etc.) */
  skippedCount: number;
  /** Array of error messages, if any */
  errors?: string[];
}

/**
 * Supported target languages for translation.
 * These are the languages users can select for re-translation.
 */
export type SupportedLanguage = 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt';

/**
 * Props for the BulkTranslationBar component.
 */
export interface BulkTranslationBarProps {
  /** Array of selected item IDs */
  selectedIds: string[];
  /** Callback to re-translate all selected items to all languages */
  onRetranslateAll: (itemIds: string[]) => Promise<BulkOperationResult>;
  /** Callback to re-translate selected items to a specific language */
  onRetranslateLanguage: (itemIds: string[], language: SupportedLanguage) => Promise<BulkOperationResult>;
  /** Callback to clear the current selection */
  onClearSelection: () => void;
  /** Optional callback to cancel an in-progress operation */
  onCancelOperation?: () => void;
  /** Whether an operation is currently in progress (controlled from parent) */
  isProcessing?: boolean;
  /** Current progress percentage (0-100) for external progress tracking */
  progress?: number;
  /** Optional status message to display during processing */
  statusMessage?: string;
  /** Whether the bar is visible (defaults to true when items are selected) */
  isVisible?: boolean;
  /** Optional additional CSS class name */
  className?: string;
}

/**
 * Internal state for bulk operation tracking.
 */
interface BulkBarState {
  /** Current operation status */
  operationStatus: 'idle' | 'processing' | 'completed' | 'error';
  /** Progress percentage (0-100) */
  progress: number;
  /** Current item being processed (for status display) */
  currentItem?: string;
  /** Result of the completed operation */
  result?: BulkOperationResult;
  /** Error message if operation failed */
  error?: string;
}

// ============================================================================
// Language Constants
// ============================================================================

/**
 * Supported languages with display names and flag emojis.
 * Used in the language dropdown for re-translation selection.
 */
const LANGUAGE_OPTIONS = [
  { code: 'es' as const, labelKey: 'spanish', flag: '🇪🇸' },
  { code: 'fr' as const, labelKey: 'french', flag: '🇫🇷' },
  { code: 'de' as const, labelKey: 'german', flag: '🇩🇪' },
  { code: 'it' as const, labelKey: 'italian', flag: '🇮🇹' },
  { code: 'nl' as const, labelKey: 'dutch', flag: '🇳🇱' },
  { code: 'pt' as const, labelKey: 'portuguese', flag: '🇵🇹' },
] as const;

// ============================================================================
// ActionButton Subcomponent
// ============================================================================

interface ActionButtonProps {
  /** Icon component to render */
  icon: LucideIcon;
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant for styling */
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
}

const variantStyles = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100',
};

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center justify-center gap-1.5',
        'min-h-[44px] min-w-[44px]',
        'px-3 py-2',
        'rounded-md',
        'text-sm font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white',
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ============================================================================
// LanguageDropdownButton Subcomponent
// ============================================================================

interface LanguageDropdownButtonProps {
  /** Available languages to select from */
  languages: typeof LANGUAGE_OPTIONS;
  /** Callback when a language is selected */
  onSelectLanguage: (language: SupportedLanguage) => void;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
}

function LanguageDropdownButton({
  languages,
  onSelectLanguage,
  disabled = false,
}: LanguageDropdownButtonProps) {
  const t = useTranslations('translationManagement.bulkBar');
  const tLang = useTranslations('languages');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center gap-1.5',
          'min-h-[44px] px-3 py-2 rounded-md',
          'text-sm font-medium',
          'bg-gray-100 text-gray-700 hover:bg-gray-200',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-purple-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={t('actions.retranslateLanguage')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('actions.retranslateLanguage')}</span>
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="absolute bottom-full mb-2 right-0 z-20 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]"
            role="menu"
            aria-label={t('actions.retranslateLanguage')}
          >
            {languages.map(({ code, labelKey, flag }) => (
              <button
                key={code}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelectLanguage(code);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md transition-colors"
              >
                <span aria-hidden="true">{flag}</span>
                <span>{tLang(labelKey)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Main BulkTranslationBar Component
// ============================================================================

export function BulkTranslationBar({
  selectedIds,
  onRetranslateAll,
  onRetranslateLanguage,
  onClearSelection,
  onCancelOperation,
  isProcessing = false,
  progress = 0,
  statusMessage,
  className,
}: BulkTranslationBarProps) {
  // i18n translations - MUST be called before any conditional returns
  const t = useTranslations('translationManagement.bulkBar');

  // Internal state for operation tracking - MUST be called before any conditional returns
  const [barState, setBarState] = useState<BulkBarState>({
    operationStatus: 'idle',
    progress: 0,
  });

  // Handler for "Re-translate All" button - MUST be called before any conditional returns
  const handleRetranslateAll = useCallback(async () => {
    setBarState({ operationStatus: 'processing', progress: 0 });

    try {
      const result = await onRetranslateAll(selectedIds);

      if (result.success) {
        setBarState({
          operationStatus: 'completed',
          progress: 100,
          result,
        });
        // Auto-dismiss after 3 seconds on success
        setTimeout(() => {
          setBarState({ operationStatus: 'idle', progress: 0 });
          onClearSelection();
        }, 3000);
      } else {
        setBarState({
          operationStatus: 'error',
          progress: 0,
          error: t('operationFailed'),
          result,
        });
      }
    } catch (err) {
      setBarState({
        operationStatus: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : t('unknownError'),
      });
    }
  }, [selectedIds, onRetranslateAll, onClearSelection, t]);

  // Handler for language-specific re-translation - MUST be called before any conditional returns
  const handleRetranslateLanguage = useCallback(async (language: SupportedLanguage) => {
    setBarState({ operationStatus: 'processing', progress: 0 });

    try {
      const result = await onRetranslateLanguage(selectedIds, language);

      if (result.success) {
        setBarState({
          operationStatus: 'completed',
          progress: 100,
          result,
        });
        // Auto-dismiss after 3 seconds on success
        setTimeout(() => {
          setBarState({ operationStatus: 'idle', progress: 0 });
          onClearSelection();
        }, 3000);
      } else {
        setBarState({
          operationStatus: 'error',
          progress: 0,
          error: t('operationFailed'),
          result,
        });
      }
    } catch (err) {
      setBarState({
        operationStatus: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : t('unknownError'),
      });
    }
  }, [selectedIds, onRetranslateLanguage, onClearSelection, t]);

  // Handler for dismiss button - MUST be called before any conditional returns
  const handleDismiss = useCallback(() => {
    setBarState({ operationStatus: 'idle', progress: 0 });
    onClearSelection();
  }, [onClearSelection]);

  // Sync with external progress updates - MUST be called before any conditional returns
  useEffect(() => {
    if (isProcessing) {
      setBarState((prev) => ({
        ...prev,
        operationStatus: 'processing',
        progress: progress || prev.progress,
      }));
    }
  }, [isProcessing, progress]);

  // Keyboard accessibility - Escape to clear selection - MUST be called before any conditional returns
  useEffect(() => {
    // Only add listener if items are selected
    if (selectedIds.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && barState.operationStatus !== 'processing') {
        onClearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds.length, barState.operationStatus, onClearSelection]);

  // Current progress for display (internal or external)
  const displayProgress = isProcessing ? progress : barState.progress;

  // Don't render if no items selected - conditional return AFTER all hooks
  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label={t('ariaLabel', { count: selectedIds.length })}
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-40',
        // Background and border
        'bg-white border-t border-gray-200',
        // Shadow
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
        // Safe area padding for iOS
        'pb-[env(safe-area-inset-bottom)]',
        // Animation
        'animate-in slide-in-from-bottom duration-300',
        'motion-reduce:animate-in motion-reduce:fade-in motion-reduce:duration-200',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Idle State */}
        {barState.operationStatus === 'idle' && !isProcessing && (
          <div className="flex items-center gap-4 justify-between">
            {/* Left section - Selection count */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-50 flex-shrink-0"
                aria-hidden="true"
              >
                <Check className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900 truncate">
                {t('selected', { count: selectedIds.length })}
              </span>
              <span className="sr-only">
                {t('selectedAria', { count: selectedIds.length })}
              </span>
            </div>

            {/* Right section - Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <ActionButton
                icon={RotateCw}
                label={t('actions.retranslateAll')}
                onClick={handleRetranslateAll}
                variant="primary"
                disabled={isProcessing}
              />
              <LanguageDropdownButton
                languages={LANGUAGE_OPTIONS}
                onSelectLanguage={handleRetranslateLanguage}
                disabled={isProcessing}
              />
              <ActionButton
                icon={X}
                label={t('actions.clear')}
                onClick={onClearSelection}
                variant="ghost"
                disabled={isProcessing}
              />
            </div>
          </div>
        )}

        {/* Processing State */}
        {(barState.operationStatus === 'processing' || isProcessing) && (
          <div className="flex items-center gap-4 justify-between">
            {/* Progress section */}
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-900">
                  {statusMessage || t('processing', { count: selectedIds.length })}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full bg-purple-600 transition-all duration-100',
                    'motion-reduce:transition-none'
                  )}
                  style={{ width: `${displayProgress}%` }}
                  role="progressbar"
                  aria-valuenow={displayProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('progressLabel', { percent: displayProgress })}
                />
              </div>

              <div className="text-xs text-gray-600 mt-1 text-right">
                {displayProgress.toFixed(0)}%
              </div>

              {/* Screen reader announcement */}
              <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {t('progressAnnounce', { percent: displayProgress, count: selectedIds.length })}
              </div>
            </div>

            {/* Cancel button (if callback provided) */}
            {onCancelOperation && (
              <ActionButton
                icon={X}
                label={t('actions.cancel')}
                onClick={onCancelOperation}
                variant="destructive"
              />
            )}
          </div>
        )}

        {/* Completed State */}
        {barState.operationStatus === 'completed' && barState.result && (
          <div className="flex items-center gap-4 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-900">
                  {t('completed', {
                    queued: barState.result.jobCount,
                    skipped: barState.result.skippedCount,
                  })}
                </span>
              </div>
              <div className="sr-only" role="status">
                {t('completedAria', {
                  queued: barState.result.jobCount,
                  skipped: barState.result.skippedCount,
                })}
              </div>
            </div>

            <ActionButton
              icon={X}
              label={t('actions.dismiss')}
              onClick={handleDismiss}
              variant="ghost"
            />
          </div>
        )}

        {/* Error State */}
        {barState.operationStatus === 'error' && (
          <div className="flex items-center gap-4 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-900">
                  {barState.error || t('error')}
                </span>
              </div>
              <div className="sr-only" role="alert">
                {barState.error || t('errorAria')}
              </div>
            </div>

            <ActionButton
              icon={X}
              label={t('actions.dismiss')}
              onClick={handleDismiss}
              variant="ghost"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkTranslationBar;
