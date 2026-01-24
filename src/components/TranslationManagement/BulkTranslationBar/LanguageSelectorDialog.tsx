'use client';

/**
 * LanguageSelectorDialog Component
 *
 * Modal dialog for selecting multiple languages for bulk translation.
 * Uses custom dialog pattern consistent with BulkMoveDialog and BulkTagDialog.
 *
 * @module TranslationManagement/BulkTranslationBar
 * @lastModified 2026-01-24 (REQ-E05-019 - Created component)
 */

import React, { useState, useRef, useEffect, useId } from 'react';
import { X, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/lib/translation-service';
import { useFocusTrap } from '../../ItemManager/utils/a11yUtils';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Props for the LanguageSelectorDialog component.
 */
export interface LanguageSelectorDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed (cancel or outside click) */
  onClose: () => void;
  /** Callback when languages are confirmed */
  onConfirm: (selectedLanguages: SupportedLanguage[]) => void;
  /** Initially selected languages */
  initialSelection?: SupportedLanguage[];
  /** Dialog title (optional, defaults to i18n key) */
  title?: string;
  /** Dialog description (optional, defaults to i18n key) */
  description?: string;
  /** Confirm button text (optional, defaults to i18n key) */
  confirmText?: string;
  /** Cancel button text (optional, defaults to i18n key) */
  cancelText?: string;
  /** Additional CSS classes for the dialog */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Target languages for translation (excluding 'en' source language).
 */
const TARGET_LANGUAGES: SupportedLanguage[] = ['es', 'fr', 'de', 'nl', 'it'];

/**
 * Unicode emoji flags for each supported language.
 */
const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  nl: '🇳🇱',
  it: '🇮🇹',
  en: '🇬🇧',
};

// ============================================================================
// Main Component
// ============================================================================

export function LanguageSelectorDialog({
  isOpen,
  onClose,
  onConfirm,
  initialSelection,
  title,
  description,
  confirmText,
  cancelText,
  className,
}: LanguageSelectorDialogProps) {
  // i18n translations
  const t = useTranslations('translation.languageSelector');
  const tLang = useTranslations('languages');
  const tCommon = useTranslations('common.actions');

  // Refs and IDs
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // State
  const [selectedLanguages, setSelectedLanguages] = useState<SupportedLanguage[]>(
    initialSelection || []
  );

  // Sync initialSelection when dialog opens
  useEffect(() => {
    if (isOpen && initialSelection) {
      setSelectedLanguages(initialSelection);
    }
  }, [isOpen, initialSelection]);

  // Apply focus trap
  useFocusTrap(dialogRef, isOpen);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleToggleLanguage = (language: SupportedLanguage) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) {
        return prev.filter((lang) => lang !== language);
      }
      return [...prev, language];
    });
  };

  const handleSelectAll = () => {
    setSelectedLanguages([...TARGET_LANGUAGES]);
  };

  const handleDeselectAll = () => {
    setSelectedLanguages([]);
  };

  const handleConfirm = () => {
    if (selectedLanguages.length === 0) {
      return;
    }
    onConfirm(selectedLanguages);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && selectedLanguages.length > 0) {
      e.preventDefault();
      handleConfirm();
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (!isOpen) {
    return null;
  }

  // Compute confirm button text
  const confirmButtonText =
    selectedLanguages.length > 0
      ? t('confirmWithCount', { count: selectedLanguages.length })
      : confirmText || tCommon('confirm');

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Dialog Container */}
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6',
          'animate-in fade-in zoom-in-95 duration-200',
          'motion-reduce:animate-in motion-reduce:fade-in motion-reduce:duration-100',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title || t('title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            aria-label={tCommon('close')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <p id={descriptionId} className="text-sm text-gray-600 mb-4">
          {description || t('description')}
        </p>

        {/* Select All / Deselect All */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {t('selectAll')}
          </button>
          <span className="text-gray-400">|</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {t('deselectAll')}
          </button>
        </div>

        {/* Language Checkbox List */}
        <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
          {TARGET_LANGUAGES.map((language) => (
            <div
              key={language}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                id={`lang-${language}`}
                checked={selectedLanguages.includes(language)}
                onChange={() => handleToggleLanguage(language)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                aria-label={tLang(language)}
              />
              <label
                htmlFor={`lang-${language}`}
                className="flex items-center gap-2 flex-1 cursor-pointer select-none"
              >
                <span className="text-2xl" aria-hidden="true">
                  {LANGUAGE_FLAGS[language]}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {tLang(language)}
                </span>
              </label>
            </div>
          ))}
        </div>

        {/* ARIA Live Region for Selection Count */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {t('selectedCount', { count: selectedLanguages.length })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            {cancelText || tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedLanguages.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LanguageSelectorDialog;
