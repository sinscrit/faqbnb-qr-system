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
 * - Minimum 44px touch target for remove button on mobile
 *
 * @module ItemManager/components/shared/TagChip
 * @lastModified 2026-01-22 (REQ-E02-079 Task 2) - Added i18n for remove aria-label
 */

import React from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('items');

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
    // 44px touch target on mobile, 24px on desktop
    'min-w-[44px] min-h-[44px] md:min-w-[24px] md:min-h-[24px]',
    '-mr-1',
    'rounded-full',
    'transition-colors',
    'touch-manipulation [-webkit-tap-highlight-color:transparent]',
    // Interactive states
    !disabled && 'hover:bg-blue-200 active:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    variant === 'outline' && !disabled && 'hover:bg-gray-200 active:bg-gray-300',
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
          aria-label={t('inline.tags.remove', { tag })}
          tabIndex={disabled ? -1 : 0}
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

export default TagChip;
