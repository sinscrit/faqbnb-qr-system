'use client';

/**
 * TranslationStatusItem Component
 *
 * Displays translation status for a single language as a row in the preview panel.
 * Shows flag emoji, language name, status icon, preview text, and action buttons.
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationStatusItem
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-24
 * @lastModified 2026-01-24 (REQ-E05-023)
 * @requestReference REQ-E05-008, REQ-E05-023
 *
 * @example
 * // Basic usage with required props
 * <TranslationStatusItem
 *   language="fr"
 *   status="completed"
 *   onEdit={(lang) => handleEdit(lang)}
 *   onRetranslate={(lang) => handleRetranslate(lang)}
 * />
 *
 * @example
 * // With preview text and selection checkbox
 * <TranslationStatusItem
 *   language="es"
 *   status="manual"
 *   previewText="Esta es una descripción de ejemplo..."
 *   isSelected={selectedLanguages.includes('es')}
 *   onSelectionChange={(lang, selected) => handleSelection(lang, selected)}
 *   onEdit={(lang) => handleEdit(lang)}
 *   onRetranslate={(lang) => handleRetranslate(lang)}
 * />
 *
 * @example
 * // Disabled state during API operations
 * <TranslationStatusItem
 *   language="de"
 *   status="processing"
 *   disabled={isLoading}
 * />
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  Clock,
  AlertCircle,
  Pencil,
  AlertTriangle,
  Circle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isTranslationStale } from '@/lib/translation-utils';
import type { SupportedLanguage } from '@/components/TranslationManagement/TranslationManagement.types';

// =============================================================================
// Component Props Interface
// =============================================================================

/**
 * Props for TranslationStatusItem component.
 *
 * @property language - Which language this row represents (e.g., 'fr', 'es', 'de')
 * @property status - Current translation status determining icon and available actions
 * @property previewText - First ~30 chars of translated content for quick preview
 * @property onSelectionChange - When provided, shows checkbox for bulk selection operations
 */
export interface TranslationStatusItemProps {
  /** Language code for this translation row */
  language: SupportedLanguage;
  /** Current translation status */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual' | 'stale' | 'missing';
  /** Preview of translated content (first ~30 characters) */
  previewText?: string | null;
  /** ISO timestamp of last update */
  lastUpdated?: string | null;
  /** Whether this row is selected (for bulk operations) */
  isSelected?: boolean;
  /** Grays out the row and prevents all interactions */
  disabled?: boolean;
  /** Called when user clicks Edit button */
  onEdit?: (language: SupportedLanguage) => void;
  /** Called when user clicks Re-translate button */
  onRetranslate?: (language: SupportedLanguage) => void;
  /** Called when user clicks Retry button (for failed translations) */
  onRetry?: (language: SupportedLanguage) => void;
  /** Called when user clicks the row (for preview) */
  onPreview?: (language: SupportedLanguage) => void;
  /** Called when checkbox selection changes. When provided, shows checkbox. */
  onSelectionChange?: (language: SupportedLanguage, selected: boolean) => void;
  /** Additional CSS classes */
  className?: string;

  // REQ-E05-023: Stale translation detection props
  /**
   * Timestamp when the translation was based on source content.
   * Used to detect if translation is stale (source has changed since).
   */
  sourceVersionAt?: Date | string | null;
  /**
   * Current timestamp of the source content.
   * When this is newer than sourceVersionAt, the translation is stale.
   */
  sourceUpdatedAt?: Date | string | null;
  /**
   * Callback when Update Translation button is clicked.
   * Only shown for stale manual translations.
   */
  onUpdateTranslation?: (language: SupportedLanguage) => void;
  /**
   * Whether translation is currently being updated (shows loading state).
   */
  isUpdating?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Maps language codes to flag emoji representations.
 */
const FLAG_EMOJIS: Record<string, string> = {
  en: '🇺🇸',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
  nl: '🇳🇱',
  it: '🇮🇹',
} as const;

/**
 * Visual configuration for each translation status.
 * Includes icon component, text color, background color, and border color.
 */
const STATUS_CONFIG: Record<
  string,
  {
    icon: typeof Check;
    color: string;
    bgColor: string;
    borderColor: string;
    animate?: string;
  }
> = {
  completed: {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  pending: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    animate: 'animate-spin',
  },
  failed: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  manual: {
    icon: Pencil,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  stale: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  missing: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    borderColor: 'border-gray-200 dark:border-gray-700',
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Truncates preview text to specified length with ellipsis.
 * Returns empty string if text is null/undefined.
 */
function truncatePreview(text: string | null | undefined, maxLength: number = 30): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Configuration for which action buttons to display.
 */
interface ActionButtonConfig {
  showEdit: boolean;
  showRetranslate: boolean;
  showRetry: boolean;
  showTranslate: boolean;
}

/**
 * Determines which action buttons should be displayed based on the translation status.
 */
function getActionButtons(status: string): ActionButtonConfig {
  switch (status) {
    case 'completed':
      return { showEdit: true, showRetranslate: true, showRetry: false, showTranslate: false };
    case 'manual':
      return { showEdit: true, showRetranslate: true, showRetry: false, showTranslate: false };
    case 'stale':
      return { showEdit: true, showRetranslate: true, showRetry: false, showTranslate: false };
    case 'failed':
      return { showEdit: true, showRetranslate: false, showRetry: true, showTranslate: false };
    case 'missing':
      return { showEdit: false, showRetranslate: false, showRetry: false, showTranslate: true };
    case 'pending':
    case 'processing':
    default:
      return { showEdit: false, showRetranslate: false, showRetry: false, showTranslate: false };
  }
}

// =============================================================================
// Component
// =============================================================================

export function TranslationStatusItem(props: TranslationStatusItemProps) {
  const {
    language,
    status,
    previewText,
    isSelected = false,
    disabled = false,
    onEdit,
    onRetranslate,
    onRetry,
    onPreview,
    onSelectionChange,
    className,
    // REQ-E05-023: Stale detection props
    sourceVersionAt,
    sourceUpdatedAt,
    onUpdateTranslation,
    isUpdating = false,
  } = props;

  // Translation hooks
  const t = useTranslations('translation.statusItem');
  const tLang = useTranslations('languages');

  // Get status configuration (will be updated below after stale detection)
  // This is a placeholder that gets resolved after we compute effectiveStatus
  const getStatusConfig = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.missing;

  // Get flag emoji
  const flagEmoji = FLAG_EMOJIS[language] || '🏳️';

  // Get localized language name
  const languageName = tLang(language);

  // REQ-E05-023: Detect stale status for manual translations
  // Only manual translations show stale warnings
  const isStale = useMemo(() => {
    return status === 'manual' && isTranslationStale(sourceVersionAt, sourceUpdatedAt);
  }, [status, sourceVersionAt, sourceUpdatedAt]);

  // Resolve effective status - stale overrides manual
  const effectiveStatus = isStale ? 'stale' : status;

  // Get status configuration using effective status
  const statusConfig = getStatusConfig(effectiveStatus);
  const StatusIcon = statusConfig.icon;

  // Compute action buttons based on effective status
  const actionButtons = useMemo(() => getActionButtons(effectiveStatus), [effectiveStatus]);

  // Compute truncated preview
  const truncatedPreview = useMemo(() => truncatePreview(previewText, 30), [previewText]);

  // Check if text is truncated
  const isTruncated = previewText ? previewText.length > 30 : false;

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handles checkbox state change.
   * Stops propagation to prevent row click.
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.stopPropagation();
    onSelectionChange?.(language, e.target.checked);
  };

  /**
   * Handles row click for preview navigation.
   */
  const handleRowClick = () => {
    if (disabled || !onPreview) return;
    onPreview(language);
  };

  /**
   * Handles Edit button click.
   * Stops propagation to prevent row click.
   */
  const handleEditClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onEdit?.(language);
  };

  /**
   * Handles Re-translate button click.
   * Stops propagation to prevent row click.
   */
  const handleRetranslateClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onRetranslate?.(language);
  };

  /**
   * Handles Retry button click.
   * Stops propagation to prevent row click.
   */
  const handleRetryClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onRetry?.(language);
  };

  /**
   * Handles Update Translation button click (REQ-E05-023).
   * Used for stale manual translations.
   * Stops propagation to prevent row click.
   */
  const handleUpdateTranslationClick = (e: React.MouseEvent) => {
    if (disabled || isUpdating) return;
    e.stopPropagation();
    onUpdateTranslation?.(language);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
        !disabled && onPreview && 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer',
        disabled && 'opacity-60 cursor-not-allowed',
        // REQ-E05-023: Amber styling for stale translations
        isStale
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
        className
      )}
      onClick={handleRowClick}
      role="listitem"
      aria-label={t('rowLabel', { language: languageName, status: t(`status.${effectiveStatus}`) })}
      aria-disabled={disabled}
      data-testid={`translation-status-${language}`}
    >
      {/* Checkbox for bulk selection */}
      {onSelectionChange && (
        <div className="shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
            aria-label={t('selectLanguage', { language: languageName })}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Flag and Language Name */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <span
          className="text-2xl"
          role="img"
          aria-label={t('flagFor', { language: languageName })}
        >
          {flagEmoji}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{languageName}</span>
      </div>

      {/* Status Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          statusConfig.bgColor
        )}
      >
        <StatusIcon
          className={cn('h-4 w-4', statusConfig.color, statusConfig.animate)}
          aria-hidden="true"
        />
      </div>
      <span className="sr-only">{t(`status.${effectiveStatus}`)}</span>

      {/* Preview Text */}
      <div className="flex-1 min-w-0">
        {previewText && (
          <p
            className={cn(
              'text-sm truncate',
              disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
            )}
            title={isTruncated ? previewText : undefined}
          >
            {truncatedPreview}
          </p>
        )}
        {!previewText && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">{t('noPreview')}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Edit Button */}
        {actionButtons.showEdit && onEdit && (
          <button
            onClick={handleEditClick}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('editTranslation', { language: languageName })}
            title={t('edit')}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        {/* Re-translate Button */}
        {actionButtons.showRetranslate && onRetranslate && (
          <button
            onClick={handleRetranslateClick}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('retranslate', { language: languageName })}
            title={t('retranslate')}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {/* Retry Button (for failed status) */}
        {actionButtons.showRetry && onRetry && (
          <button
            onClick={handleRetryClick}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('retry', { language: languageName })}
            title={t('retry')}
          >
            <AlertCircle className="h-4 w-4" />
          </button>
        )}

        {/* Translate Button (for missing status) */}
        {actionButtons.showTranslate && onRetranslate && (
          <button
            onClick={handleRetranslateClick}
            disabled={disabled}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('translate', { language: languageName })}
          >
            {t('translate')}
          </button>
        )}

        {/* REQ-E05-023: Update Translation Button (for stale manual translations) */}
        {isStale && onUpdateTranslation && (
          <button
            onClick={handleUpdateTranslationClick}
            disabled={disabled || isUpdating}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              'bg-amber-100 text-amber-700 hover:bg-amber-200',
              'dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label={t('updateTranslationAriaLabel', { language: languageName })}
            title={t('staleTooltip')}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span className="hidden sm:inline">{t('updating')}</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t('updateTranslation')}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
