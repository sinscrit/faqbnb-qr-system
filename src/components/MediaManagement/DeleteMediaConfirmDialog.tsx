'use client';

/**
 * DeleteMediaConfirmDialog Component
 *
 * Confirmation dialog for media link deletion.
 * Follows the pattern from AssetRemoveConfirmDialog.
 *
 * @module MediaManagement/DeleteMediaConfirmDialog
 */

import { useEffect, useCallback } from 'react';
import {
  Trash2,
  Loader2,
  Youtube,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeleteMediaConfirmDialogProps } from './MediaManagement.types';

/**
 * Returns the appropriate icon for link type
 */
function getLinkTypeIcon(linkType: string): React.ReactNode {
  switch (linkType) {
    case 'youtube':
      return <Youtube className="w-10 h-10 text-red-500" />;
    case 'pdf':
      return <FileText className="w-10 h-10 text-blue-500" />;
    case 'image':
      return <ImageIcon className="w-10 h-10 text-green-500" />;
    case 'text':
    default:
      return <LinkIcon className="w-10 h-10 text-gray-500" />;
  }
}

/**
 * Gets human-readable type label
 */
function getTypeLabel(linkType: string): string {
  switch (linkType) {
    case 'youtube':
      return 'YouTube Video';
    case 'pdf':
      return 'PDF Document';
    case 'image':
      return 'Image';
    case 'text':
    default:
      return 'Web Link';
  }
}

export function DeleteMediaConfirmDialog({
  isOpen,
  link,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteMediaConfirmDialogProps) {
  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    },
    [onCancel, isDeleting]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !link) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={isDeleting ? undefined : onCancel}
        aria-hidden="true"
      >
        {/* Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-media-dialog-title"
          className="bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <h3
            id="delete-media-dialog-title"
            className="text-lg font-medium text-gray-900 mb-4 text-center"
          >
            Delete {getTypeLabel(link.linkType)}?
          </h3>

          {/* Icon and Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
              {getLinkTypeIcon(link.linkType)}
            </div>
            <p className="text-sm font-medium text-gray-900 text-center max-w-[250px] truncate">
              {link.title}
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-[250px] truncate">
              {link.url}
            </p>
          </div>

          {/* Warning */}
          <p className="text-gray-600 text-center mb-6">
            This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className={cn(
                'flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md',
                'hover:bg-gray-200 disabled:opacity-50 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-gray-500'
              )}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className={cn(
                'flex-1 px-4 py-2 text-white bg-red-600 rounded-md',
                'hover:bg-red-700 disabled:opacity-50 transition-colors',
                'flex items-center justify-center gap-2',
                'focus:outline-none focus:ring-2 focus:ring-red-500'
              )}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteMediaConfirmDialog;
