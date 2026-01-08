'use client';

/**
 * DeleteItemDialog Component
 *
 * Confirmation dialog for item deletion with media warning.
 * Shows warning about cascading deletion of associated resources.
 *
 * REQ-142: Enhanced Item Management - Delete Confirmation
 * @created 2026-01-08
 */

import { AlertTriangle, Loader2, FileText, Image, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeleteItemDialogProps } from '@/types';

export function DeleteItemDialog({
  isOpen,
  item,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteItemDialogProps) {
  if (!isOpen || !item) return null;

  const linksCount = item.links?.length || 0;
  const mediaCount = item.mediaCount || 0;
  const hasAssociatedContent = linksCount > 0 || mediaCount > 0;

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isDeleting) {
      e.preventDefault();
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3
              id="delete-dialog-title"
              className="text-lg font-semibold text-gray-900"
            >
              Delete Item
            </h3>
            <p
              id="delete-dialog-description"
              className="mt-2 text-sm text-gray-600"
            >
              Are you sure you want to delete <strong>&quot;{item.name}&quot;</strong>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Warning about associated content */}
        {hasAssociatedContent && (
          <div className="px-6 pb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    This will also delete:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    {linksCount > 0 && (
                      <li className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        <span>{linksCount} resource link{linksCount !== 1 ? 's' : ''}</span>
                      </li>
                    )}
                    {mediaCount > 0 && (
                      <li className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        <span>{mediaCount} media file{mediaCount !== 1 ? 's' : ''} from storage</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-gray-700 bg-gray-100',
              'hover:bg-gray-200 active:bg-gray-300',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-white bg-red-600',
              'hover:bg-red-700 active:bg-red-800',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'inline-flex items-center justify-center gap-2'
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Item'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteItemDialog;
