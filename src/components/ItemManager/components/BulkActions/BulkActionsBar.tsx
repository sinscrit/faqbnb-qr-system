'use client';

/**
 * BulkActionsBar Component
 *
 * A floating action bar that appears at the bottom of the viewport when items
 * are selected, providing bulk operation actions like delete, add tag, remove tag,
 * and move to property.
 *
 * @module ItemManager/components/BulkActions/BulkActionsBar
 * @see docs/REQ-070-build-bulkactionsbar-component-overview.md
 * @see docs/REQ-070-build-bulkactionsbar-component-detailed.md
 * @lastModified 2026-01-04 (REQ-070)
 */

import { Check, Trash2, Tag, Minus, FolderInput, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BulkActionsBarProps } from '../../ItemManager.types';

// =============================================================================
// Internal ActionButton Component
// =============================================================================

/**
 * Props for the ActionButton internal component
 */
interface ActionButtonProps {
  /** Icon component to render */
  icon: React.ElementType;
  /** Button label (hidden on mobile, visible on desktop) */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant affecting color styling */
  variant?: 'primary' | 'secondary' | 'destructive';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Variant-based styling for action buttons
 */
const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

/**
 * ActionButton - Reusable internal button component with consistent styling
 * for all action buttons in the bulk actions bar.
 *
 * Features:
 * - Minimum 44x44px touch target for accessibility
 * - Responsive label (hidden on mobile)
 * - Variant-based color styling
 * - Focus ring for keyboard navigation
 */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        // Base styles
        'flex items-center justify-center gap-1.5',
        // Minimum touch target size
        'min-h-[44px] min-w-[44px]',
        // Padding for content
        'px-3 py-2',
        // Border radius
        'rounded-md',
        // Typography
        'text-sm font-medium',
        // Transitions
        'transition-colors duration-150',
        // Focus ring for keyboard navigation
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'focus:ring-blue-500 focus:ring-offset-white',
        // Variant styles
        variantStyles[variant],
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// =============================================================================
// Main BulkActionsBar Component
// =============================================================================

/**
 * BulkActionsBar - Floating action bar for bulk item operations
 *
 * This component renders a fixed-position action bar at the bottom of the
 * viewport when items are selected. It provides quick access to bulk
 * operations and gracefully handles loading states.
 *
 * Features:
 * - Fixed positioning at viewport bottom
 * - iOS safe area support
 * - Slide-up animation on appear
 * - Responsive button layout (icons only on mobile)
 * - Loading state with spinner
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <BulkActionsBar
 *   selectedCount={5}
 *   onDelete={() => console.log('Delete')}
 *   onAddTag={() => console.log('Add tag')}
 *   onRemoveTag={() => console.log('Remove tag')}
 *   onExitSelection={() => console.log('Exit selection')}
 *   multiPropertyMode={false}
 * />
 * ```
 */
export function BulkActionsBar({
  selectedCount,
  onDelete,
  onAddTag,
  onRemoveTag,
  onMoveToProperty,
  onExitSelection,
  multiPropertyMode = false,
  loading = false,
  className,
}: BulkActionsBarProps) {
  // Don't render if no items selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label={`Bulk actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
      className={cn(
        // Fixed positioning at bottom
        'fixed bottom-0 left-0 right-0 z-40',
        // Background and border
        'bg-white border-t border-gray-200',
        // Shadow for elevation
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
        // Safe area padding for iOS
        'pb-[env(safe-area-inset-bottom)]',
        // Animation - slide up from bottom
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
    >
      {/* Content container with max width */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left section: Selection count indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 flex-shrink-0"
              aria-hidden="true"
            >
              <Check className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">
              {selectedCount} selected
            </span>
            {/* Screen reader announcement */}
            <span className="sr-only">
              Currently {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Center section: Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {/* Loading indicator */}
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span className="text-sm">Processing...</span>
              </div>
            ) : (
              <>
                {/* Delete button */}
                <ActionButton
                  icon={Trash2}
                  label="Delete"
                  onClick={onDelete}
                  variant="destructive"
                  disabled={loading}
                />

                {/* Add Tag button */}
                <ActionButton
                  icon={Tag}
                  label="Add Tag"
                  onClick={onAddTag}
                  variant="primary"
                  disabled={loading}
                />

                {/* Remove Tag button */}
                <ActionButton
                  icon={Minus}
                  label="Remove Tag"
                  onClick={onRemoveTag}
                  variant="secondary"
                  disabled={loading}
                />

                {/* Move to Property button (conditional) */}
                {multiPropertyMode && onMoveToProperty && (
                  <ActionButton
                    icon={FolderInput}
                    label="Move to Property"
                    onClick={onMoveToProperty}
                    variant="primary"
                    disabled={loading}
                  />
                )}
              </>
            )}
          </div>

          {/* Right section: Cancel button with divider */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Vertical divider (hidden on mobile) */}
            <div
              className="hidden sm:block w-px h-6 bg-gray-200"
              aria-hidden="true"
            />

            {/* Cancel/Exit button */}
            <button
              type="button"
              onClick={onExitSelection}
              aria-label="Cancel selection"
              title="Cancel selection"
              className={cn(
                'flex items-center justify-center',
                'min-h-[44px] min-w-[44px]',
                'px-2',
                'rounded-md',
                'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline ml-1.5 text-sm font-medium">
                Cancel
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export props type for convenience
export type { BulkActionsBarProps } from '../../ItemManager.types';

export default BulkActionsBar;
