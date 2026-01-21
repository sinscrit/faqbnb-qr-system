'use client';

/**
 * ConfirmExitDialog Component
 *
 * Modal confirmation dialog to prevent accidental data loss when exiting
 * the workflow. Shows warning message based on session state (items created,
 * unsaved changes) and provides confirm/cancel actions.
 *
 * ## Features
 * - Focus trapping for accessibility (WAI-ARIA compliant)
 * - Dynamic messaging based on session progress
 * - Escape key handling for dismissal
 *
 * @example
 * ```tsx
 * <ConfirmExitDialog
 *   isOpen={showExitDialog}
 *   onClose={() => setShowExitDialog(false)}
 *   onConfirmExit={handleSessionExit}
 *   itemCount={3}
 *   hasUnsavedChanges={true}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ConfirmExitDialog
 * @see WorkflowHeader for exit button trigger
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '../../utils/accessibility';

// =============================================================================
// Type Definitions
// =============================================================================

export interface ConfirmExitDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close (cancelled) */
  onClose: () => void;
  /** Called when user confirms exit */
  onConfirmExit: () => void;
  /** Number of items created in session (for messaging) */
  itemCount?: number;
  /** Whether there are unsaved changes to current item */
  hasUnsavedChanges?: boolean;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate appropriate exit message based on session state.
 *
 * @param t - Translation function for workflow.dialogs.confirmExit namespace
 * @param itemCount - Number of items created in session
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @returns Exit confirmation message
 */
function getExitMessage(
  t: (key: string, params?: Record<string, unknown> | undefined) => string,
  itemCount: number,
  hasUnsavedChanges: boolean
): string {
  if (hasUnsavedChanges && itemCount > 0) {
    return t('messageUnsavedAndItems', { count: itemCount });
  }
  if (hasUnsavedChanges) {
    return t('messageUnsaved');
  }
  if (itemCount > 0) {
    return t('messageItems', { count: itemCount });
  }
  return t('messageDefault');
}

// =============================================================================
// Main Component
// =============================================================================

export function ConfirmExitDialog({
  isOpen,
  onClose,
  onConfirmExit,
  itemCount = 0,
  hasUnsavedChanges = false,
  className,
}: ConfirmExitDialogProps) {
  const tExit = useTranslations('workflow.dialogs.confirmExit');
  const tCommon = useTranslations('common.actions');

  // REQ-114: Focus trapping refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // REQ-114: Trap focus within dialog when open
  useFocusTrap(dialogRef, isOpen);

  // REQ-114: Focus cancel button when dialog opens
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Small delay to ensure dialog is rendered
      requestAnimationFrame(() => {
        cancelButtonRef.current?.focus();
      });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exit-dialog-title"
      aria-describedby="exit-dialog-description"
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
          "animate-in fade-in zoom-in-95 duration-200",
          "motion-reduce:animate-none",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3
              id="exit-dialog-title"
              className="text-lg font-semibold text-[#222222]"
            >
              {tExit('title')}
            </h3>
            <p
              id="exit-dialog-description"
              className="mt-2 text-sm text-[#717171]"
            >
              {getExitMessage(tExit as unknown as (key: string, params?: Record<string, unknown> | undefined) => string, itemCount, hasUnsavedChanges)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
              "text-gray-700 bg-gray-100",
              "hover:bg-gray-200 active:bg-gray-300",
              "transition-colors duration-150",
              "motion-reduce:transition-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            )}
          >
            {tExit('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
              "text-white",
              "hover:opacity-90 active:opacity-80",
              "transition-opacity duration-150",
              "motion-reduce:transition-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            )}
            style={{ backgroundColor: '#FF5A5F' }} // Airbnb destructive color
          >
            {tExit('exit')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmExitDialog;
