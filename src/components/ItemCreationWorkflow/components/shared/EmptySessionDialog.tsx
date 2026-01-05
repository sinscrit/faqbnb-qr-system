'use client';

/**
 * EmptySessionDialog Component
 *
 * Confirmation dialog displayed when user attempts to complete
 * a session without creating any items.
 *
 * @module ItemCreationWorkflow/components/shared/EmptySessionDialog
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05
 */

import { useCallback, useEffect, useRef } from 'react';
import { AlertCircle, Plus, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Type Definitions
// =============================================================================

export interface EmptySessionDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close (cancelled or dismissed) */
  onClose: () => void;
  /** Called when user chooses to add items */
  onAddItems: () => void;
  /** Called when user chooses to exit session */
  onExitSession: () => void;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Empty session confirmation dialog.
 * Prompts user to add items or exit when session has no items.
 */
export function EmptySessionDialog({
  isOpen,
  onClose,
  onAddItems,
  onExitSession,
  className,
}: EmptySessionDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus first button when dialog opens
  useEffect(() => {
    if (isOpen && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in-0 duration-200'
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="empty-session-title"
      aria-describedby="empty-session-description"
    >
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full max-w-md mx-4',
          'bg-white rounded-xl shadow-xl',
          'animate-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4',
            'p-1.5 rounded-full',
            'text-gray-400 hover:text-gray-600',
            'hover:bg-gray-100',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-gray-500'
          )}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-blue-600" aria-hidden="true" />
            </div>
          </div>

          {/* Title */}
          <h2
            id="empty-session-title"
            className="text-lg font-semibold text-gray-900 text-center mb-2"
          >
            No Items Added
          </h2>

          {/* Description */}
          <p
            id="empty-session-description"
            className="text-sm text-gray-600 text-center mb-6"
          >
            No items added yet. Add items or exit session?
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Add Items - Primary */}
            <button
              ref={firstButtonRef}
              type="button"
              onClick={onAddItems}
              className={cn(
                'flex items-center justify-center gap-2',
                'w-full px-4 py-3 min-h-[48px]',
                'text-base font-medium text-white rounded-lg',
                'bg-[#FF385C] hover:bg-[#E31C5F]',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]'
              )}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Add Items
            </button>

            {/* Exit Session - Secondary */}
            <button
              type="button"
              onClick={onExitSession}
              className={cn(
                'flex items-center justify-center gap-2',
                'w-full px-4 py-3 min-h-[48px]',
                'text-base font-medium text-gray-700 rounded-lg',
                'bg-white border border-gray-300',
                'hover:bg-gray-50',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
              )}
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              Exit Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptySessionDialog;
