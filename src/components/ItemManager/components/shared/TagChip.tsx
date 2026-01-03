'use client';

/**
 * TagChip Component
 *
 * A reusable tag chip component that displays a single tag with optional
 * remove functionality. Used by TagsInlineEdit and for displaying tags
 * in read-only mode throughout ItemManager.
 *
 * Features:
 * - Pill-shaped container with rounded-full styling
 * - Two variants: 'default' (blue) and 'outline' (gray border)
 * - Conditional remove button with accessible label
 * - Disabled state with reduced opacity
 * - Minimum 24px touch target for remove button
 *
 * @module ItemManager/components/shared/TagChip
 * @lastModified 2026-01-03 (REQ-088 Task 1)
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the TagChip component
 */
export interface TagChipProps {
  /** The tag text to display */
  tag: string;
  /** Whether to show the remove button */
  removable?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Disabled state - reduces opacity and prevents interaction */
  disabled?: boolean;
  /** Visual variant */
  variant?: 'default' | 'outline';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function TagChip({
  tag,
  removable = false,
  onRemove,
  disabled = false,
  variant = 'default',
  className,
}: TagChipProps) {
  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled && onRemove) {
      onRemove();
    }
  };

  const handleRemoveKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onRemove) {
      e.stopPropagation();
      e.preventDefault();
      onRemove();
    }
  };

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const chipStyles = cn(
    // Base styles
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
    'transition-colors',
    // Variant styles
    variant === 'default' && 'bg-blue-100 text-blue-800 border border-blue-200',
    variant === 'outline' && 'bg-white text-gray-700 border border-gray-300',
    // Disabled state
    disabled && 'opacity-60 cursor-not-allowed',
    className
  );

  const removeButtonStyles = cn(
    // Base styles for remove button
    'inline-flex items-center justify-center',
    'min-w-[24px] min-h-[24px] -mr-1', // Ensure minimum 24px touch target
    'rounded-full',
    'transition-colors',
    // Interactive states
    !disabled && 'hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    variant === 'outline' && !disabled && 'hover:bg-gray-200',
    // Disabled
    disabled && 'cursor-not-allowed'
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <span className={chipStyles}>
      <span className="truncate max-w-[120px]">{tag}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          onKeyDown={handleRemoveKeyDown}
          disabled={disabled}
          className={removeButtonStyles}
          aria-label={`Remove tag ${tag}`}
          tabIndex={disabled ? -1 : 0}
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

export default TagChip;
