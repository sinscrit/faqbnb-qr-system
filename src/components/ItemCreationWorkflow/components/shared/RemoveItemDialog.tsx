'use client';

/**
 * RemoveItemDialog Component
 *
 * Confirmation dialog for removing an item from the session.
 * Follows the same pattern as ConfirmExitDialog.tsx.
 *
 * @module ItemCreationWorkflow/components/shared/RemoveItemDialog
 * @see docs/REQ-109-session-summary-step-overview.md
 * @see docs/REQ-114-accessibility-mobile-optimization-overview.md
 * @lastModified 2026-01-22 (REQ-E02-066 i18n - switched to workflow.shared.dialogs)
 */

import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '../../utils/accessibility';

// =============================================================================
// Type Definitions
// =============================================================================

export interface RemoveItemDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Name of the item being removed */
  itemName: string;
  /** Called when dialog should close (cancelled) */
  onClose: () => void;
  /** Called when user confirms removal */
  onConfirmRemove: () => void;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function RemoveItemDialog({
  isOpen,
  itemName,
  onClose,
  onConfirmRemove,
  className,
}: RemoveItemDialogProps) {
  // REQ-E02-066: Use shared namespace for dialogs
  const t = useTranslations('workflow.shared.dialogs.removeItem');
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // REQ-114: Focus trapping - trap focus within dialog when open
  useFocusTrap(dialogRef, isOpen);

  // REQ-114: Focus cancel button when dialog opens (safer option)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      requestAnimationFrame(() => {
        cancelButtonRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Truncate long item names for display
  const displayName = itemName.length > 50
    ? `${itemName.substring(0, 47)}...`
    : itemName;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="remove-dialog-title"
      aria-describedby="remove-dialog-description"
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
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3
              id="remove-dialog-title"
              className="text-lg font-semibold text-[#222222]"
            >
              {t('title')}
            </h3>
            <p
              id="remove-dialog-description"
              className="mt-2 text-sm text-[#717171]"
            >
              {t('message', { name: displayName })}
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
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2",
              "min-h-[44px]"
            )}
          >
            {t('cancel')}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirmRemove}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg",
              "text-white",
              "hover:opacity-90 active:opacity-80",
              "transition-opacity duration-150",
              "motion-reduce:transition-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
              "min-h-[44px]"
            )}
            style={{ backgroundColor: '#FF5A5F' }}
          >
            {t('remove')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RemoveItemDialog;
