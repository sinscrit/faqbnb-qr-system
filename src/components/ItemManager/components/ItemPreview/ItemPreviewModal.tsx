'use client';

/**
 * ItemPreviewModal Component
 *
 * A responsive modal/drawer for displaying item preview content with action controls.
 * - Desktop/tablet (>=768px): Centered modal overlay
 * - Mobile (<768px): Slide-up drawer from bottom
 *
 * Features (REQ-079):
 * - Metadata display (title, location, tags)
 * - Action buttons (Edit, Manage Assets, Delete)
 * - Delete confirmation dialog with keyboard accessibility
 * - Focus management and trap
 *
 * Uses Radix UI Dialog for accessibility (focus trap, ARIA, keyboard nav).
 *
 * @module ItemManager/components/ItemPreview
 * @see docs/REQ-079-add-preview-actions-detailed.md
 * @lastModified 2026-01-03 (REQ-090 Task 8 - Enhanced accessibility)
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MapPin, Edit, Images, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemPreviewModalProps } from '../../ItemManager.types';

// =============================================================================
// Main Component
// =============================================================================

export function ItemPreviewModal({
  isOpen,
  onClose,
  item,
  title,
  children,
  className,
  contentClassName,
  onEditItem,
  onDeleteItems,
  onManageAssets,
  config,
}: ItemPreviewModalProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ---------------------------------------------------------------------------
  // Refs for focus management
  // ---------------------------------------------------------------------------
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const displayTitle = title ?? item?.title ?? 'Item Preview';
  const enableAssetManagement = config?.enableAssetManagement !== false;

  // ---------------------------------------------------------------------------
  // iOS Safari scroll lock fix
  // Radix Dialog handles scroll lock, but iOS Safari can be problematic.
  // This is an additional fallback for consistent cross-browser behavior.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      // Store original scroll position
      const scrollY = window.scrollY;

      // Apply iOS scroll lock fix
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore original styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Reset delete confirmation when modal closes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  const handleEdit = useCallback(() => {
    if (!item || !onEditItem) return;
    onEditItem(item);
    onClose();
  }, [item, onEditItem, onClose]);

  const handleManageAssets = useCallback(() => {
    if (!item || !onManageAssets) return;
    onManageAssets(item);
    onClose();
  }, [item, onManageAssets, onClose]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!item || !onDeleteItems) return;
    onDeleteItems([item.id]);
    setShowDeleteConfirm(false);
    onClose();
  }, [item, onDeleteItems, onClose]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    // Return focus to Delete button after dialog closes
    setTimeout(() => {
      deleteButtonRef.current?.focus();
    }, 0);
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard navigation for delete confirmation dialog
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!showDeleteConfirm) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCancelDelete();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDeleteConfirm, handleCancelDelete]);

  // ---------------------------------------------------------------------------
  // Focus management: move focus to Cancel button when dialog opens
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (showDeleteConfirm && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [showDeleteConfirm]);

  // ---------------------------------------------------------------------------
  // Focus trap for delete confirmation dialog
  // ---------------------------------------------------------------------------
  const handleDialogKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(
        Boolean
      ) as HTMLButtonElement[];

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out'
          )}
        />

        {/* Content container */}
        <Dialog.Content
          className={cn(
            // Base styles
            'fixed z-50 bg-white shadow-lg outline-none',
            'overflow-hidden flex flex-col',

            // Desktop: centered modal
            'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
            'md:max-w-[640px] md:w-[calc(100%-2rem)] md:max-h-[90vh]',
            'md:rounded-lg',

            // Mobile: slide-up drawer
            'max-md:inset-x-0 max-md:bottom-0',
            'max-md:max-h-[85vh] max-md:rounded-t-xl',

            // Animations
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out',
            'max-md:data-[state=open]:animate-drawer-in max-md:data-[state=closed]:animate-drawer-out',

            // Animation duration
            'duration-300',

            className
          )}
          onPointerDownOutside={(e) => e.preventDefault()} // Handled by overlay
        >
          {/* Header with title and close button */}
          <div className="relative flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            {/* Mobile drag handle indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />

            <Dialog.Title className="text-lg font-semibold text-gray-900 pr-8 truncate mt-2 md:mt-0">
              {displayTitle}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className={cn(
                  'absolute right-3 top-3 md:right-4 md:top-4',
                  'flex items-center justify-center',
                  'w-10 h-10 md:w-12 md:h-12', // 40px mobile, 48px desktop touch target
                  'rounded-full',
                  'text-gray-500 hover:text-gray-700',
                  'hover:bg-gray-100 focus:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'transition-colors'
                )}
                aria-label="Close preview"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Metadata Display Section (Task 4.6.1) */}
          {item && (
            <div className="border-b border-gray-200 px-4 md:px-6 py-4">
              {/* Title - prominently displayed */}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h2>

              {/* Location with MapPin icon */}
              {item.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{item.location}</span>
                </div>
              )}

              {/* Tags as pill badges */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content area */}
          <div
            className={cn(
              'flex-1 overflow-y-auto p-4 md:p-6',
              contentClassName
            )}
          >
            {children}
          </div>

          {/* Action Buttons Row (Task 4.6.2) */}
          {item && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 md:px-6 py-4 border-t border-gray-200">
              {/* Edit Button - Primary */}
              <button
                type="button"
                onClick={handleEdit}
                disabled={!onEditItem}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-4 py-2',
                  'bg-blue-600 text-white rounded-lg',
                  'hover:bg-blue-700 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'min-h-[44px]',
                  !onEditItem && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
                <span>Edit</span>
              </button>

              {/* Manage Assets Button - Secondary */}
              {enableAssetManagement && (
                <button
                  type="button"
                  onClick={handleManageAssets}
                  disabled={!onManageAssets}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-4 py-2',
                    'bg-white border border-gray-300 text-gray-700 rounded-lg',
                    'hover:bg-gray-50 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'min-h-[44px]',
                    !onManageAssets && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Images className="w-4 h-4" aria-hidden="true" />
                  <span>Manage Assets</span>
                </button>
              )}

              {/* Delete Button - Destructive (aligned right on desktop) */}
              <button
                ref={deleteButtonRef}
                type="button"
                onClick={handleDelete}
                disabled={!onDeleteItems}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-4 py-2',
                  'bg-red-600 text-white rounded-lg',
                  'hover:bg-red-700 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                  'min-h-[44px] sm:ml-auto',
                  !onDeleteItems && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>

      {/* Delete Confirmation Dialog (Task 4.6.5, REQ-090 - Enhanced accessibility) */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          aria-describedby="delete-confirm-description"
          onClick={handleCancelDelete}
          onKeyDown={handleDialogKeyDown}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="delete-confirm-title"
              className="text-lg font-medium text-gray-900 mb-4"
            >
              Delete Item
            </h3>
            <p
              id="delete-confirm-description"
              className="text-gray-600 mb-6"
            >
              Are you sure you want to delete &quot;{item?.title}&quot;?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={handleCancelDelete}
                className={cn(
                  'flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg',
                  'hover:bg-gray-200 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500',
                  'min-h-[44px]'
                )}
              >
                Cancel
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirmDelete}
                className={cn(
                  'flex-1 px-4 py-2 bg-red-600 text-white rounded-lg',
                  'hover:bg-red-700 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-red-500',
                  'min-h-[44px]'
                )}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader announcement for dialog state */}
      <div aria-live="polite" className="sr-only">
        {showDeleteConfirm && `Delete confirmation dialog opened for ${item?.title}`}
      </div>
    </Dialog.Root>
  );
}

export default ItemPreviewModal;
