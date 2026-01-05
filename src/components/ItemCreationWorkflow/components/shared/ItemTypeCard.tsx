'use client';

/**
 * ItemTypeCard Component
 *
 * Selectable card for item type selection in Step 2 of the workflow.
 * Displays item type icon, label, and description in horizontal layout.
 * Supports keyboard navigation with roving tabindex pattern.
 *
 * @example
 * ```tsx
 * <ItemTypeCard
 *   itemType="appliance"
 *   label="Appliance"
 *   description="Stove, refrigerator, washer, etc."
 *   icon={Zap}
 *   isSelected={selectedType === 'appliance'}
 *   onSelect={selectItemType}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ItemTypeCard
 * @see ItemTypeStep for usage context
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Package, Info, Check, type LucideIcon } from 'lucide-react';
import type { ItemType } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface ItemTypeCardProps {
  /** Item type identifier */
  itemType: ItemType;
  /** Human-readable item type label */
  label: string;
  /** Description/examples for this item type */
  description: string;
  /** Lucide icon component for the item type */
  icon: LucideIcon;
  /** Whether this item type is currently selected */
  isSelected: boolean;
  /** Called when item type is selected */
  onSelect: (itemType: ItemType) => void;
  /** REQ-114: Tab index for roving tabindex pattern */
  tabIndex?: number;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Icon Mapping Export
// =============================================================================

/**
 * Default icon mapping for item types.
 * Exported for convenience when using ItemTypeCard.
 */
export const ITEM_TYPE_ICONS: Record<ItemType, LucideIcon> = {
  appliance: Zap,
  'room-item': Package,
  'general-info': Info,
};

// =============================================================================
// Main Component
// =============================================================================

export const ItemTypeCard = forwardRef<HTMLButtonElement, ItemTypeCardProps>(function ItemTypeCard(
  {
    itemType,
    label,
    description,
    icon: Icon,
    isSelected,
    onSelect,
    tabIndex,
    className,
  },
  ref
) {
  const handleClick = () => {
    onSelect(itemType);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(itemType);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-describedby={`${itemType}-description`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      className={cn(
        // Layout - horizontal with icon left, text right
        'flex items-center gap-4',
        'w-full rounded-xl border-2',
        // Sizing - larger than RoomCard to accommodate description
        'min-h-[120px] p-4 sm:min-h-[140px] sm:p-6',
        // Touch optimization
        'touch-manipulation select-none',
        // Transitions
        'transition-all duration-200',
        'motion-reduce:transition-none motion-reduce:transform-none',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        // Selection states
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] motion-reduce:active:scale-100',
        className
      )}
    >
      {/* Icon Section */}
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14',
          'flex items-center justify-center',
          'rounded-lg',
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        )}
      >
        <Icon
          className={cn(
            'w-6 h-6 sm:w-7 sm:h-7',
            isSelected ? 'text-blue-600' : 'text-gray-500'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Text Content Section */}
      <div className="flex-1 text-left">
        <span
          className={cn(
            'block text-base sm:text-lg font-semibold',
            isSelected ? 'text-blue-700' : 'text-gray-900'
          )}
        >
          {label}
        </span>
        <span
          id={`${itemType}-description`}
          className={cn(
            'block mt-1 text-sm',
            isSelected ? 'text-blue-600' : 'text-gray-500'
          )}
        >
          {description}
        </span>
      </div>

      {/* Checkmark indicator for selected state */}
      {isSelected && (
        <div className="flex-shrink-0">
          <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
        </div>
      )}
    </button>
  );
});

export default ItemTypeCard;
