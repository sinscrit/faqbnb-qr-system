'use client';

/**
 * ConfirmDeleteDialog Component
 *
 * Confirmation dialog displayed before deleting items in ItemManager.
 * Shows item titles (up to 5) with overflow count for bulk deletions.
 *
 * @module ItemManager/components/dialogs/ConfirmDeleteDialog
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 3, Task 3.4)
 * @see docs/REQ-071-implement-confirmdeletedialog-detailed.md
 * @lastModified 2026-01-04 (REQ-071)
 */

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture';

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of item titles to display before showing overflow */
const MAX_VISIBLE_ITEMS = 5;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format item list for display with overflow handling.
 *
 * @param items - Array of items to format
 * @param maxVisible - Maximum number of items to display (default: 5)
 * @returns Object with visible items and overflow count
 */
export function formatItemList(
  items: ItemRecord[],
  maxVisible: number = MAX_VISIBLE_ITEMS
): {
  visibleItems: ItemRecord[];
  overflowCount: number;
} {
  if (items.length <= maxVisible) {
    return { visibleItems: items, overflowCount: 0 };
  }
  return {
    visibleItems: items.slice(0, maxVisible),
    overflowCount: items.length - maxVisible,
  };
}

/**
 * Generate appropriate title based on item count.
 *
 * @param t - Translation function for items.dialogs.delete namespace
 * @param count - Number of items being deleted
 * @param customTitle - Optional custom title to use instead
 * @returns Dialog title string
 */
export function getDeleteTitle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: any) => any,
  count: number,
  customTitle?: string
): string {
  if (customTitle) return customTitle;
  return count === 1 ? t('titleSingle') : t('titleMultiple');
}

/**
 * Generate confirmation message based on item count.
 *
 * @param t - Translation function for items.dialogs.delete namespace
 * @param count - Number of items being deleted
 * @returns Confirmation message string
 */
export function getDeleteMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: any) => any,
  count: number
): string {
  if (count === 1) {
    return t('messageSingle');
  }
  return t('messageMultiple', { count });
}

/**
 * Generate confirm button text based on item count.
 *
 * @param t - Translation function for items.dialogs.delete namespace
 * @param count - Number of items being deleted
 * @returns Button text string
 */
export function getConfirmButtonText(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: any) => any,
  count: number
): string {
  if (count === 1) {
    return t('confirmSingle');
  }
  return t('confirmMultiple', { count });
}

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Props for ConfirmDeleteDialog component.
 * @see REQ-071 - Delete Confirmation Dialog with Item Preview
 */
export interface ConfirmDeleteDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Items selected for deletion */
  items: ItemRecord[];

  /** Callback when deletion is confirmed */
  onConfirm: () => void;

  /** Callback when dialog is cancelled/dismissed */
  onCancel: () => void;

  /** Loading state during delete operation */
  loading?: boolean;

  /** Optional custom title */
  title?: string;

  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Confirmation dialog for deleting items.
 *
 * Displays item titles (up to 5) with overflow indicator for bulk deletions.
 * Uses destructive button styling to emphasize the irreversible nature.
 *
 * @example
 * <ConfirmDeleteDialog
 *   isOpen={showDeleteDialog}
 *   items={selectedItems}
 *   onConfirm={handleConfirmDelete}
 *   onCancel={() => setShowDeleteDialog(false)}
 *   loading={isDeleting}
 * />
 */
export function ConfirmDeleteDialog({
  isOpen,
  items,
  onConfirm,
  onCancel,
  loading = false,
  title,
  className,
}: ConfirmDeleteDialogProps) {
  const tDelete = useTranslations('itemDialogs.delete');
  const tCommon = useTranslations('common.actions');

  // Don't render if not open or no items
  if (!isOpen || items.length === 0) {
    return null;
  }

  const itemCount = items.length;
  const { visibleItems, overflowCount } = formatItemList(items);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      e.preventDefault();
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
          'animate-in fade-in zoom-in-95 duration-200',
          className
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
              {getDeleteTitle(tDelete, itemCount, title)}
            </h3>
            <p
              id="delete-dialog-description"
              className="mt-2 text-sm text-gray-600"
            >
              {getDeleteMessage(tDelete, itemCount)}
            </p>
          </div>
        </div>

        {/* Item list */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <ul className="space-y-2" aria-label={tDelete('itemsList')}>
              {visibleItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-gray-400 mt-0.5" aria-hidden="true">•</span>
                  <span className="flex-1 truncate" title={item.title}>
                    {item.title}
                  </span>
                </li>
              ))}
              {overflowCount > 0 && (
                <li className="flex items-start gap-2 text-sm text-gray-500 italic">
                  <span className="text-gray-400 mt-0.5" aria-hidden="true">•</span>
                  <span>{tDelete('andMore', { count: overflowCount })}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg',
              'text-gray-700 bg-gray-100',
              'hover:bg-gray-200 active:bg-gray-300',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
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
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{tDelete('deleting')}</span>
              </>
            ) : (
              getConfirmButtonText(tDelete, itemCount)
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteDialog;
