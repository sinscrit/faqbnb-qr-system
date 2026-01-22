'use client';

/**
 * SessionRecoveryBanner Component
 *
 * Displays a notification banner when a previous session has been
 * recovered from localStorage after browser refresh. Allows user
 * to continue with recovered session or start fresh.
 *
 * @example
 * ```tsx
 * <SessionRecoveryBanner
 *   itemCount={3}
 *   contentNeedingReUpload={2}
 *   onContinue={handleContinue}
 *   onStartFresh={handleStartFresh}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/SessionRecoveryBanner
 * @see useSessionPersistence for recovery logic
 * @lastModified 2026-01-22 (REQ-E02-066 i18n translations)
 */

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, X, Upload, RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

export interface SessionRecoveryBannerProps {
  /** Number of items recovered in the session */
  itemCount: number;
  /** Number of content pieces needing re-upload (binary data lost) */
  contentNeedingReUpload: number;
  /** Callback when user chooses to continue with recovered session */
  onContinue: () => void;
  /** Callback when user chooses to start fresh */
  onStartFresh: () => void;
  /** Callback when banner is dismissed (auto or manual) */
  onDismiss: () => void;
  /** Whether to auto-dismiss after timeout (default: true) */
  autoDismiss?: boolean;
  /** Auto-dismiss delay in ms (default: 10000) */
  autoDismissDelay?: number;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_AUTO_DISMISS_DELAY = 10000; // 10 seconds

// =============================================================================
// Main Component
// =============================================================================

/**
 * Session recovery banner with continue/start fresh options.
 * Auto-dismisses after a configurable delay.
 */
export function SessionRecoveryBanner({
  itemCount,
  contentNeedingReUpload,
  onContinue,
  onStartFresh,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = DEFAULT_AUTO_DISMISS_DELAY,
  className,
}: SessionRecoveryBannerProps) {
  // REQ-E02-066: Translation hook for session recovery messages
  const t = useTranslations('workflow.shared.sessionRecovery');

  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss timer with progress bar
  useEffect(() => {
    if (!autoDismiss || !isVisible) return;

    const startTime = Date.now();
    const endTime = startTime + autoDismissDelay;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const progressPercent = (remaining / autoDismissDelay) * 100;
      setProgress(progressPercent);

      if (remaining <= 0) {
        handleDismiss();
      }
    };

    // Update progress every 100ms
    const intervalId = setInterval(updateProgress, 100);

    return () => clearInterval(intervalId);
  }, [autoDismiss, autoDismissDelay, isVisible]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss();
  }, [onDismiss]);

  const handleContinue = useCallback(() => {
    setIsVisible(false);
    onContinue();
  }, [onContinue]);

  const handleStartFresh = useCallback(() => {
    setIsVisible(false);
    onStartFresh();
  }, [onStartFresh]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'relative overflow-hidden',
        'bg-green-50 border border-green-200 rounded-lg',
        'shadow-sm',
        className
      )}
    >
      {/* Progress bar (auto-dismiss indicator) */}
      {autoDismiss && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-green-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-green-800">
                {t('title')}
              </h3>
              <p className="mt-1 text-sm text-green-700">
                {t('itemCount', { count: itemCount })}
                {contentNeedingReUpload > 0 && (
                  <span className="inline-flex items-center gap-1 ml-2 text-amber-700">
                    <Upload className="w-3 h-3" aria-hidden="true" />
                    {t('needsReUpload', { count: contentNeedingReUpload })}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 p-1.5 rounded-full',
              'text-green-600 hover:text-green-800',
              'hover:bg-green-100',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-green-500'
            )}
            aria-label={t('dismiss')}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          {/* Continue Button - Primary */}
          <button
            type="button"
            onClick={handleContinue}
            className={cn(
              'flex items-center justify-center gap-2',
              'px-4 py-2.5 min-h-[44px] sm:min-h-0',
              'text-sm font-medium rounded-lg',
              'bg-green-600 text-white',
              'hover:bg-green-700',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            )}
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            {t('continueSession')}
          </button>

          {/* Start Fresh Button - Secondary */}
          <button
            type="button"
            onClick={handleStartFresh}
            className={cn(
              'flex items-center justify-center gap-2',
              'px-4 py-2.5 min-h-[44px] sm:min-h-0',
              'text-sm font-medium rounded-lg',
              'border border-green-300',
              'bg-white text-green-700',
              'hover:bg-green-50',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            )}
          >
            <RefreshCcw className="w-4 h-4" aria-hidden="true" />
            {t('startFresh')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionRecoveryBanner;
