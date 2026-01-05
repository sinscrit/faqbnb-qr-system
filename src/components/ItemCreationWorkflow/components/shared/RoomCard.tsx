'use client';

/**
 * RoomCard Component
 *
 * Selectable card for room type selection in Step 1 of the workflow.
 * Displays room icon and label with selection states.
 *
 * @module ItemCreationWorkflow/components/shared/RoomCard
 * @see docs/REQ-097-basic-shared-components-overview.md
 * @see docs/REQ-114-accessibility-mobile-optimization-overview.md
 * @lastModified 2026-01-05 (REQ-114 Accessibility - Keyboard Navigation)
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
  ChefHat,
  Shirt,
  Bed,
  ShowerHead,
  Sofa,
  Car,
  TreePine,
  Info,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import type { RoomType } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface RoomCardProps {
  /** Room type identifier */
  room: RoomType;
  /** Human-readable room label */
  label: string;
  /** Lucide icon name for the room */
  icon: string;
  /** Whether this room is currently selected */
  isSelected: boolean;
  /** Whether this room is disabled (previously used in session) */
  isDisabled?: boolean;
  /** Called when room is selected */
  onSelect: (room: RoomType) => void;
  /** REQ-114: Tab index for roving tabindex pattern */
  tabIndex?: number;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Icon Mapping Utility
// =============================================================================

/**
 * Maps string icon names to Lucide icon components.
 */
const ROOM_ICON_MAP: Record<string, LucideIcon> = {
  'chef-hat': ChefHat,
  shirt: Shirt,
  bed: Bed,
  'shower-head': ShowerHead,
  sofa: Sofa,
  car: Car,
  tree: TreePine,
  info: Info,
  'map-pin': MapPin,
};

/**
 * Gets the Lucide icon component for a given icon name.
 * Falls back to MapPin for unknown icons.
 */
function getRoomIcon(iconName: string): LucideIcon {
  return ROOM_ICON_MAP[iconName] || MapPin;
}

// =============================================================================
// Main Component
// =============================================================================

export const RoomCard = forwardRef<HTMLButtonElement, RoomCardProps>(function RoomCard(
  {
    room,
    label,
    icon,
    isSelected,
    isDisabled = false,
    onSelect,
    tabIndex,
    className,
  },
  ref
) {
  const Icon = getRoomIcon(icon);

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(room);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
      e.preventDefault();
      onSelect(room);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      className={cn(
        // Layout - centered content, square aspect on mobile
        'flex flex-col items-center justify-center',
        'w-full aspect-square sm:aspect-auto rounded-xl border-2',
        // Touch targets - exceed WCAG 2.5.5 minimum
        'min-h-[100px] p-4 sm:min-h-[120px] sm:p-6',
        // Touch optimization
        'touch-manipulation select-none',
        // Transitions
        'transition-all duration-200',
        'motion-reduce:transition-none motion-reduce:transform-none',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        // Selection states
        isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : isDisabled
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-95 motion-reduce:active:scale-100',
        className
      )}
    >
      {/* Icon */}
      <Icon
        className={cn(
          'w-8 h-8 sm:w-10 sm:h-10 mb-2',
          isSelected ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-500'
        )}
        aria-hidden="true"
      />

      {/* Label */}
      <span
        className={cn(
          'text-sm sm:text-base font-medium text-center',
          isSelected ? 'text-blue-700' : isDisabled ? 'text-gray-400' : 'text-gray-700'
        )}
      >
        {label}
      </span>
    </button>
  );
});

export default RoomCard;
