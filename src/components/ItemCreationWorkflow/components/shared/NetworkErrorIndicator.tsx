'use client';

/**
 * NetworkErrorIndicator Component
 *
 * Displays a network error state with retry and proceed options
 * when URL preview fetch fails due to connectivity issues.
 *
 * @module ItemCreationWorkflow/components/shared/NetworkErrorIndicator
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05
 */

import { WifiOff, RefreshCw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

export interface NetworkErrorIndicatorProps {
  /** Whether a retry is currently in progress */
  isRetrying?: boolean;
  /** Callback when retry button is clicked */
  onRetry: () => void;
  /** Callback when proceed without preview is clicked */
  onProceedWithoutPreview: () => void;
  /** Optional error message to display */
  errorMessage?: string;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Network error indicator with retry and proceed options.
 * Follows Airbnb design system with amber warning colors.
 */
export function NetworkErrorIndicator({
  isRetrying = false,
  onRetry,
  onProceedWithoutPreview,
  errorMessage,
  className,
}: NetworkErrorIndicatorProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'bg-amber-50 border border-amber-200 rounded-lg p-4',
        'flex flex-col gap-4',
        className
      )}
    >
      {/* Error Message Section */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
          <WifiOff className="w-5 h-5 text-amber-600" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-800">
            Preview unavailable
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            {errorMessage || 'Unable to load preview due to network connectivity issues.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Retry Button - Primary */}
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            'inline-flex items-center justify-center gap-2',
            'px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-0',
            'text-sm font-medium rounded-lg',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
            isRetrying
              ? 'bg-amber-200 text-amber-600 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          )}
          aria-label={isRetrying ? 'Retrying...' : 'Try again'}
        >
          <RefreshCw
            className={cn('w-4 h-4', isRetrying && 'animate-spin')}
            aria-hidden="true"
          />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>

        {/* Proceed Without Preview Button - Secondary */}
        <button
          type="button"
          onClick={onProceedWithoutPreview}
          disabled={isRetrying}
          className={cn(
            'inline-flex items-center justify-center gap-2',
            'px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-0',
            'text-sm font-medium rounded-lg',
            'border border-amber-300',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
            isRetrying
              ? 'bg-amber-50 text-amber-400 cursor-not-allowed'
              : 'bg-white text-amber-700 hover:bg-amber-50'
          )}
          aria-label="Continue without preview"
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          Proceed Without Preview
        </button>
      </div>
    </div>
  );
}

export default NetworkErrorIndicator;
