'use client';

/**
 * QRGenerationProgress Component
 *
 * Visual feedback component showing QR code generation progress,
 * status per item, and error states with retry capability.
 *
 * @module ItemCreationWorkflow/components/shared/QRGenerationProgress
 * @see docs/REQ-111-qr-code-integration-overview.md
 * @lastModified 2026-01-05 (REQ-111 QR Code Integration)
 */

import { Loader2, Check, X, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions (Task 4.4)
// =============================================================================

/**
 * Status of QR code generation for an individual item.
 */
export type QRProgressItemStatus = 'pending' | 'generating' | 'completed' | 'failed';

/**
 * Item representation for the progress display.
 */
export interface QRProgressItem {
  /** Unique item identifier */
  id: string;
  /** Display name of the item */
  name: string;
  /** Current generation status */
  status: QRProgressItemStatus;
  /** Generated QR code URL (if completed) */
  qrCodeUrl?: string;
}

/**
 * Props for the QRGenerationProgress component.
 */
export interface QRGenerationProgressProps {
  /** Whether QR generation is currently in progress */
  isGenerating: boolean;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Statistics about generation progress */
  stats: {
    total: number;
    completed: number;
    failed: number;
    remaining: number;
  };
  /** Items being processed with their status */
  items: QRProgressItem[];
  /** Current error message, if any */
  error?: string | null;
  /** Callback to retry all failed items */
  onRetry?: () => void;
  /** Callback to retry a specific item */
  onRetryItem?: (itemId: string) => void;
  /** Callback to cancel the generation */
  onCancel?: () => void;
  /** Callback to continue despite failures */
  onContinue?: () => void;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Sub-Components (Task 4.5 - Task 4.8)
// =============================================================================

/**
 * Progress bar showing overall QR code generation progress.
 * Task 4.5
 */
interface ProgressBarProps {
  progress: number;
  stats: { total: number; completed: number; failed: number; remaining: number };
  isGenerating: boolean;
}

function ProgressBar({ progress, stats, isGenerating }: ProgressBarProps) {
  // Determine the status message
  let statusMessage = 'Ready to generate';
  if (stats.total > 0) {
    if (progress === 100) {
      if (stats.failed === 0) {
        statusMessage = 'Complete!';
      } else {
        statusMessage = `${stats.completed} completed, ${stats.failed} failed`;
      }
    } else if (stats.failed === stats.total) {
      statusMessage = 'Generation failed';
    } else if (isGenerating) {
      statusMessage = `Generating QR code ${Math.min(stats.completed + 1, stats.total)} of ${stats.total}...`;
    } else {
      statusMessage = `${stats.completed} of ${stats.total} completed`;
    }
  }

  return (
    <div className="space-y-2">
      {/* Progress bar container */}
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="QR code generation progress"
      >
        {/* Progress fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            stats.failed > 0 && stats.failed === stats.total
              ? 'bg-[#FF5A5F]' // All failed - red
              : stats.failed > 0
              ? 'bg-amber-500' // Some failed - amber
              : 'bg-[#FF385C]' // Normal - pink
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress text */}
      <p className="text-sm text-[#717171]">{statusMessage}</p>
    </div>
  );
}

/**
 * Individual item status row with retry capability.
 * Task 4.6
 */
interface ItemStatusRowProps {
  item: QRProgressItem;
  onRetry?: (itemId: string) => void;
}

function ItemStatusRow({ item, onRetry }: ItemStatusRowProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'pending':
        return (
          <div
            className="w-5 h-5 rounded-full bg-gray-300"
            aria-hidden="true"
          />
        );
      case 'generating':
        return (
          <Loader2
            className="w-5 h-5 text-[#FF385C] animate-spin"
            aria-hidden="true"
          />
        );
      case 'completed':
        return (
          <Check
            className="w-5 h-5 text-[#00A699]"
            aria-hidden="true"
          />
        );
      case 'failed':
        return (
          <X
            className="w-5 h-5 text-[#FF5A5F]"
            aria-hidden="true"
          />
        );
    }
  };

  const getStatusLabel = () => {
    switch (item.status) {
      case 'pending':
        return 'Pending';
      case 'generating':
        return 'Generating...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <div
      className="flex items-center gap-3 py-2"
      role="listitem"
    >
      {/* Status icon */}
      <div className="flex-shrink-0 w-5 flex items-center justify-center">
        {getStatusIcon()}
      </div>

      {/* Item name */}
      <span
        className={cn(
          'flex-1 truncate text-sm',
          item.status === 'failed' ? 'text-[#FF5A5F]' : 'text-[#222222]'
        )}
        title={item.name}
      >
        {item.name}
      </span>

      {/* Status label for screen readers */}
      <span className="sr-only">{getStatusLabel()}</span>

      {/* Retry button for failed items */}
      {item.status === 'failed' && onRetry && (
        <button
          type="button"
          onClick={() => onRetry(item.id)}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded',
            'text-xs font-medium text-[#FF385C]',
            'hover:bg-pink-50',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
            'transition-colors duration-150'
          )}
          aria-label={`Retry QR generation for ${item.name}`}
        >
          <RefreshCw className="w-3 h-3" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Error banner with batch retry and skip options.
 * Task 4.7
 */
interface ErrorBannerProps {
  error: string | null;
  failedCount: number;
  onRetryAll?: () => void;
  onContinue?: () => void;
}

function ErrorBanner({ error, failedCount, onRetryAll, onContinue }: ErrorBannerProps) {
  // Only show if there's an error or failed items
  if (!error && failedCount === 0) {
    return null;
  }

  const message = error || `${failedCount} item${failedCount !== 1 ? 's' : ''} failed to generate`;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex flex-col gap-3 p-3 rounded-lg',
        'bg-red-50 border-l-4 border-[#FF5A5F]'
      )}
    >
      {/* Error message */}
      <div className="flex items-start gap-2">
        <AlertCircle
          className="w-5 h-5 text-[#FF5A5F] flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-sm text-[#222222]">{message}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 ml-7">
        {onRetryAll && failedCount > 0 && (
          <button
            type="button"
            onClick={onRetryAll}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'text-sm font-medium',
              'border border-[#FF385C] text-[#FF385C]',
              'hover:bg-pink-50',
              'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
              'transition-colors duration-150'
            )}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry Failed
          </button>
        )}

        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className={cn(
              'text-sm font-medium text-[#717171]',
              'hover:text-[#222222]',
              'focus:outline-none focus:underline',
              'transition-colors duration-150'
            )}
          >
            Skip & Continue
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Cancel button shown during QR generation.
 * Task 4.8
 */
interface CancelButtonProps {
  onCancel?: () => void;
}

function CancelButton({ onCancel }: CancelButtonProps) {
  if (!onCancel) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onCancel}
      className={cn(
        'inline-flex items-center gap-1.5',
        'text-sm font-medium text-[#717171]',
        'hover:text-[#222222]',
        'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded',
        'transition-colors duration-150'
      )}
      aria-label="Cancel QR code generation"
    >
      <XCircle className="w-4 h-4" aria-hidden="true" />
      Cancel
    </button>
  );
}

// =============================================================================
// Main Component (Task 4.9)
// =============================================================================

/**
 * QRGenerationProgress Component
 *
 * Displays a progress bar, per-item status list, and error handling
 * for QR code generation within the ItemCreationWorkflow.
 */
export function QRGenerationProgress({
  isGenerating,
  progress,
  stats,
  items,
  error,
  onRetry,
  onRetryItem,
  onCancel,
  onContinue,
  className,
}: QRGenerationProgressProps) {
  // Don't render if there are no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      <ProgressBar
        progress={progress}
        stats={stats}
        isGenerating={isGenerating}
      />

      {/* Cancel button (only during generation) */}
      {isGenerating && (
        <div className="flex justify-center">
          <CancelButton onCancel={onCancel} />
        </div>
      )}

      {/* Item status list */}
      <div
        role="list"
        aria-label="QR code generation status"
        className={cn(
          'max-h-[200px] md:max-h-[280px] overflow-y-auto',
          'border border-gray-200 rounded-lg p-3',
          'space-y-1'
        )}
      >
        {items.map(item => (
          <ItemStatusRow
            key={item.id}
            item={item}
            onRetry={onRetryItem}
          />
        ))}
      </div>

      {/* Error banner (only when there are errors or failures) */}
      {(error || stats.failed > 0) && !isGenerating && (
        <ErrorBanner
          error={error}
          failedCount={stats.failed}
          onRetryAll={onRetry}
          onContinue={onContinue}
        />
      )}
    </div>
  );
}

export default QRGenerationProgress;
