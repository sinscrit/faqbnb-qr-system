'use client';

/**
 * SourceContentSection Component
 *
 * Displays the source content (original language) in the TranslationPreviewPanel.
 * Shows entity name/title and description with proper formatting.
 *
 * @module TranslationManagement/TranslationPreviewPanel/SourceContentSection
 * @created 2026-01-24
 * @requestReference REQ-E05-007
 */

import { useTranslations } from 'next-intl';
import type { TranslationFieldContent } from '@/components/TranslationManagement/TranslationManagement.types';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

export interface SourceContentSectionProps {
  /** Entity type for label display */
  entityType: 'article' | 'item' | 'link';
  /** Source language code */
  sourceLanguage: SupportedLanguage;
  /** Source content fields */
  sourceContent: TranslationFieldContent | null;
  /** Optional CSS class */
  className?: string;
}

export function SourceContentSection({
  entityType,
  sourceLanguage,
  sourceContent,
  className,
}: SourceContentSectionProps) {
  const t = useTranslations('translation.previewPanel');

  if (!sourceContent) {
    return null;
  }

  const titleOrName = sourceContent.title || sourceContent.name;

  return (
    <div
      className={`px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 ${className || ''}`}
    >
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('sourceContent')} ({sourceLanguage.toUpperCase()})
      </h3>
      <div className="space-y-2">
        {titleOrName && (
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {entityType === 'item' ? t('name') : t('titleField')}:
            </span>
            <p className="text-sm text-gray-900 dark:text-white">{titleOrName}</p>
          </div>
        )}
        {sourceContent.description && (
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('description')}:
            </span>
            <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
              {sourceContent.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
