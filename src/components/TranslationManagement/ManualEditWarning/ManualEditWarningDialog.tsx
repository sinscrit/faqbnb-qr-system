'use client';

/**
 * ManualEditWarningDialog Component
 *
 * Warning dialog that protects property owners from accidentally losing
 * manually edited translations when updating source content. Displays
 * affected languages and provides options to keep manual edits or
 * re-translate all content.
 *
 * Uses amber/yellow warning theme (not red error theme) to indicate
 * caution without suggesting immediate danger.
 *
 * @module TranslationManagement/ManualEditWarning
 * @see docs/REQ-E05-022-create-manualeditwarningdialog-component-overview.md
 * @created 2026-01-24
 * @lastModified 2026-01-24 (REQ-E05-022)
 *
 * @example
 * <ManualEditWarningDialog
 *   isOpen={showWarning}
 *   manuallyEditedLanguages={['fr', 'de', 'es']}
 *   onKeepManual={handleKeepManual}
 *   onOverwrite={handleOverwrite}
 *   onCancel={() => setShowWarning(false)}
 *   loading={isProcessing}
 * />
 */

import React from 'react';
import { AlertTriangle, Loader2, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Props for the ManualEditWarningDialog component.
 */
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Array of language codes with manual translations that will be affected */
  manuallyEditedLanguages: string[];

  /** Callback when user chooses to keep manual edits (mark as stale) */
  onKeepManual: () => void;

  /** Callback when user chooses to overwrite manual edits with re-translation */
  onOverwrite: () => void;

  /** Callback when dialog is cancelled/dismissed */
  onCancel: () => void;

  /** Loading state during async operations */
  loading?: boolean;

  /** Entity type being edited (currently unused but reserved for future) */
  entityType?: 'item' | 'article';

  /** Additional CSS classes for the dialog container */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Display names for supported language codes.
 * Uses i18n-friendly codes that map to translation keys.
 */
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  nl: 'Dutch',
  en: 'English',
  pt: 'Portuguese',
};

/** Maximum number of languages to display before showing scroll */
const MAX_VISIBLE_LANGUAGES = 6;

// ============================================================================
// Main Component
// ============================================================================

export function ManualEditWarningDialog({
  isOpen,
  manuallyEditedLanguages,
  onKeepManual,
  onOverwrite,
  onCancel,
  loading = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  entityType = 'item',
  className,
}: ManualEditWarningDialogProps) {
  // i18n translations
  const t = useTranslations('translation.manualEditWarning');
  const tLanguages = useTranslations('languages');

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle keyboard events for accessibility.
   * Escape key closes the dialog (when not loading).
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      e.preventDefault();
      onCancel();
    }
  };

  /**
   * Handle clicks on the backdrop to close the dialog.
   * Only closes if clicking directly on backdrop (not inner content).
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  // ============================================================================
  // Conditional Rendering
  // ============================================================================

  // Don't render if dialog is not open
  if (!isOpen) {
    return null;
  }

  // Don't render if there are no affected languages
  if (manuallyEditedLanguages.length === 0) {
    return null;
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="manual-edit-warning-title"
      aria-describedby="manual-edit-warning-description"
    >
      {/* Dialog Container */}
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle
              className="w-6 h-6 text-amber-600"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <h3
              id="manual-edit-warning-title"
              className="text-lg font-semibold text-gray-900"
            >
              {t('title')}
            </h3>
            <p
              id="manual-edit-warning-description"
              className="mt-2 text-sm text-gray-600"
            >
              {t('description')}
            </p>
          </div>
        </div>

        {/* Language list */}
        <div className="px-6 pb-4">
          <div className="mb-2 text-sm font-medium text-gray-700">
            {t('affectedLanguages')}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-h-48 overflow-y-auto">
            <ul
              className="space-y-2"
              aria-label={t('languageListLabel')}
            >
              {manuallyEditedLanguages.map((lang) => (
                <li
                  key={lang}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <Languages
                    className="w-4 h-4 text-amber-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-medium">
                    {tLanguages(lang as 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it' | 'pt') ||
                      LANGUAGE_DISPLAY_NAMES[lang] ||
                      lang.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Options description cards */}
        <div className="px-6 pb-4 space-y-3">
          {/* Keep Manual option card */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              {t('keepManualOption')}
            </h4>
            <p className="text-xs text-blue-700">
              {t('keepManualDescription')}
            </p>
          </div>

          {/* Re-translate option card */}
          <div className="border border-red-200 bg-red-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-red-900 mb-1">
              {t('retranslateOption')}
            </h4>
            <p className="text-xs text-red-700">
              {t('retranslateWarning')}
            </p>
          </div>
        </div>

        {/* Actions - Vertical button layout */}
        <div className="flex flex-col gap-3 p-6 pt-4 border-t border-gray-100">
          {/* Keep Manual button (Primary action - blue) */}
          <button
            type="button"
            onClick={onKeepManual}
            disabled={loading}
            className={cn(
              'w-full px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-white bg-blue-600',
              'hover:bg-blue-700 active:bg-blue-800',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'inline-flex items-center justify-center gap-2'
            )}
          >
            {loading ? (
              <>
                <Loader2
                  className="w-4 h-4 animate-spin"
                  aria-hidden="true"
                />
                <span>{t('processing')}</span>
              </>
            ) : (
              <>
                <Languages className="w-4 h-4" aria-hidden="true" />
                <span>{t('keepManualOption')}</span>
              </>
            )}
          </button>

          {/* Re-translate button (Destructive action - red) */}
          <button
            type="button"
            onClick={onOverwrite}
            disabled={loading}
            className={cn(
              'w-full px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-white bg-red-600',
              'hover:bg-red-700 active:bg-red-800',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'inline-flex items-center justify-center gap-2'
            )}
          >
            {loading ? (
              <>
                <Loader2
                  className="w-4 h-4 animate-spin"
                  aria-hidden="true"
                />
                <span>{t('processing')}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <span>{t('retranslateOption')}</span>
              </>
            )}
          </button>

          {/* Cancel button (Neutral action - gray) */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'w-full px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-gray-700 bg-gray-100',
              'hover:bg-gray-200 active:bg-gray-300',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualEditWarningDialog;
