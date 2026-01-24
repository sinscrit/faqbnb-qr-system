'use client';

/**
 * TranslationStatusAnnouncer Component
 *
 * A reusable ARIA live region component for announcing translation status changes
 * to screen readers. This component is visually hidden but provides critical
 * feedback to users relying on assistive technologies.
 *
 * @example
 * ```tsx
 * // Announce status change for a specific language
 * <TranslationStatusAnnouncer
 *   status="completed"
 *   language="French"
 * />
 *
 * // Custom message with assertive politeness (for errors)
 * <TranslationStatusAnnouncer
 *   message="Translation failed. Please try again."
 *   politeness="assertive"
 * />
 * ```
 *
 * REQ-E05-032: Accessibility features for translation management
 * @created 2026-01-24
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export interface TranslationStatusAnnouncerProps {
  /** The translation status to announce */
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'manual';
  /** The language being translated (e.g., "French", "Spanish") */
  language?: string;
  /** Custom message to announce (overrides status-based message) */
  message?: string;
  /** ARIA live region politeness level */
  politeness?: 'polite' | 'assertive';
}

/**
 * TranslationStatusAnnouncer provides screen reader announcements for translation
 * status changes. It uses an ARIA live region that is visually hidden but
 * announced by assistive technologies.
 */
export function TranslationStatusAnnouncer({
  status,
  language,
  message,
  politeness = 'polite',
}: TranslationStatusAnnouncerProps) {
  const t = useTranslations('translationManagement.announcements');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // If custom message provided, use it directly
    if (message) {
      setAnnouncement(message);
      return;
    }

    // Generate announcement based on status and language
    if (!status) {
      setAnnouncement('');
      return;
    }

    // Map status to announcement message
    const statusMessages: Record<string, string> = {
      pending: language ? t('pending', { language }) : t('pendingGeneric'),
      in_progress: language ? t('inProgress', { language }) : t('inProgressGeneric'),
      completed: language ? t('completed', { language }) : t('completedGeneric'),
      failed: language ? t('failed', { language }) : t('failedGeneric'),
      manual: language ? t('manual', { language }) : t('manualGeneric'),
    };

    setAnnouncement(statusMessages[status] || '');
  }, [status, language, message, t]);

  // Don't render anything if there's nothing to announce
  if (!announcement) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

export default TranslationStatusAnnouncer;
