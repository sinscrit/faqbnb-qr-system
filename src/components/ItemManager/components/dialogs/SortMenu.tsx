/**
 * SortMenu Component
 *
 * Dropdown menu for selecting item sort order.
 * Uses Radix UI DropdownMenu for accessible, keyboard-navigable menu.
 *
 * @module ItemManager/components/dialogs/SortMenu
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.5)
 * @lastModified 2026-01-04
 */

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortOption } from '../../ItemManager.types';
import { SORT_OPTIONS, type SortOptionItem } from '../../utils/constants';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for SortMenu component.
 */
export interface SortMenuProps {
  /** Currently selected sort option */
  currentSort: SortOption;
  /** Callback when sort option changes */
  onSortChange: (sort: SortOption) => void;
  /** Available sort options (optional, defaults to SORT_OPTIONS) */
  sortOptions?: SortOptionItem[];
  /** Whether the sort menu is disabled */
  disabled?: boolean;
  /** Custom class name for the root element */
  className?: string;
  /** Custom class names for internal elements */
  classNames?: {
    trigger?: string;
    content?: string;
    item?: string;
    activeItem?: string;
  };
  /** Custom labels for i18n */
  labels?: {
    sortLabel?: string;
    sortByLabel?: string;
  };
  /** Alignment of dropdown (default: 'end') */
  align?: 'start' | 'center' | 'end';
  /** Side of trigger to show dropdown (default: 'bottom') */
  side?: 'top' | 'bottom';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Icon component for sort direction indicator.
 */
function SortDirectionIcon({
  direction,
  className,
}: {
  direction?: 'asc' | 'desc' | 'none';
  className?: string;
}) {
  if (direction === 'asc') {
    return <ArrowUp className={className} aria-hidden="true" />;
  }
  if (direction === 'desc') {
    return <ArrowDown className={className} aria-hidden="true" />;
  }
  return null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SortMenu - Dropdown menu for sorting items.
 *
 * Features:
 * - Accessible dropdown using Radix UI
 * - Visual indicator for current sort option
 * - Direction icons for ascending/descending
 * - Mobile-friendly touch targets (min 44px trigger, 48px items)
 * - Keyboard navigation support
 * - Auto-closes after selection
 *
 * @example
 * <SortMenu
 *   currentSort="created-desc"
 *   onSortChange={(sort) => setSortBy(sort)}
 * />
 */
export function SortMenu({
  currentSort,
  onSortChange,
  sortOptions = SORT_OPTIONS,
  disabled = false,
  className,
  classNames,
  labels = {},
  align = 'end',
  side = 'bottom',
}: SortMenuProps) {
  // REQ-E02-079: i18n translations
  const t = useTranslations('items');

  // Merge default labels with translations
  const mergedLabels = {
    sortLabel: t('sort.label'),
    sortByLabel: t('sort.sortBy'),
    ...labels,
  };

  // Helper to translate sort option labels
  const translateOption = (option: SortOptionItem): string => {
    return t(`sort.options.${option.labelKey}`);
  };

  // Get current sort display label
  const currentLabel = useMemo(() => {
    const option = sortOptions.find((o) => o.value === currentSort);
    return option ? translateOption(option) : mergedLabels.sortLabel;
  }, [currentSort, sortOptions, t]);

  return (
    <DropdownMenu.Root>
      {/* Trigger Button */}
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            // Base styles
            'inline-flex items-center gap-2',
            'px-3 py-2 rounded-lg',
            'text-sm font-medium',
            // Border and background
            'border border-gray-300 bg-white',
            'hover:bg-gray-50 hover:border-gray-400',
            // Focus states
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            // Transition
            'transition-colors duration-150',
            // Mobile touch target (44px minimum)
            'min-h-[44px]',
            // Touch optimization
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed',
            // Custom classes
            className,
            classNames?.trigger
          )}
          aria-label={`${mergedLabels.sortByLabel}: ${currentLabel}`}
        >
          <ArrowUpDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <span className="hidden sm:inline text-gray-700">
            {mergedLabels.sortLabel}:
          </span>
          <span className="text-gray-900">{currentLabel}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown Portal */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            // Positioning and sizing
            'z-50 min-w-[220px] max-w-[280px]',
            // Visual styling
            'bg-white rounded-lg shadow-lg',
            'border border-gray-200',
            'py-1',
            // Animation
            'animate-fade-in',
            // Custom class
            classNames?.content
          )}
          align={align}
          side={side}
          sideOffset={4}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {mergedLabels.sortByLabel}
            </p>
          </div>

          {/* Sort Options */}
          <DropdownMenu.RadioGroup
            value={currentSort}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            {sortOptions.map((option) => {
              const isActive = currentSort === option.value;

              return (
                <DropdownMenu.RadioItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    // Layout
                    'relative flex items-center gap-3',
                    'px-3 py-3 min-h-[48px]', // 48px touch target
                    // Typography
                    'text-sm cursor-pointer',
                    // Focus
                    'outline-none',
                    // Transitions
                    'transition-colors duration-100',
                    'focus:bg-gray-50',
                    // Active/inactive states
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50',
                    // Custom classes
                    classNames?.item,
                    isActive && classNames?.activeItem
                  )}
                >
                  {/* Checkmark Indicator */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isActive && (
                      <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    )}
                  </div>

                  {/* Label */}
                  <span className="flex-1">{translateOption(option)}</span>

                  {/* Direction Icon */}
                  <SortDirectionIcon
                    direction={option.icon}
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-blue-500' : 'text-gray-400'
                    )}
                  />
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default SortMenu;
