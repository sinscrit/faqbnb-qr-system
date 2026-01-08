'use client';

/**
 * RoomSelectionStep Component - Step 1 of the workflow
 *
 * Displays a responsive grid of room options for user selection.
 * Features keyboard navigation with roving tabindex and automatic
 * next step progression on selection.
 *
 * @example
 * ```tsx
 * <RoomSelectionStep
 *   currentRoom={state.currentItem?.room ?? null}
 *   onSelectRoom={(room) => {
 *     selectRoom(room);
 *     nextStep();
 *   }}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/steps/RoomSelectionStep
 * @see RoomCard for individual room selection UI
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RoomCard } from '../shared';
import { ROOM_TYPES, ROOM_LABELS, ROOM_ICONS } from '../../utils/constants';
import type { RoomType } from '../../ItemCreationWorkflow.types';
import { createKeyboardNavigator } from '../../utils/accessibility';

// =============================================================================
// Type Definitions
// =============================================================================

export interface RoomSelectionStepProps {
  /** Current selected room type from state */
  currentRoom: RoomType | null;
  /** Handler to select a room */
  onSelectRoom: (room: RoomType) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function RoomSelectionStep({
  currentRoom,
  onSelectRoom,
  onNext,
  canNext,
  className,
}: RoomSelectionStepProps) {
  // Local state for custom room name when "Other" is selected
  const [customRoomName, setCustomRoomName] = useState('');

  // REQ-114: Refs for keyboard navigation (roving tabindex)
  const [activeIndex, setActiveIndex] = useState(() =>
    currentRoom ? ROOM_TYPES.indexOf(currentRoom as RoomType) : 0
  );
  const roomRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle custom room name changes
  const handleCustomRoomNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomRoomName(e.target.value);
    },
    []
  );

  // Auto-advance when a room is selected (except "other" which needs custom input)
  const handleRoomSelect = useCallback((room: RoomType) => {
    onSelectRoom(room);
    // Auto-advance for non-"other" rooms after a brief visual feedback delay
    if (room !== 'other') {
      setTimeout(() => {
        onNext();
      }, 150);
    }
  }, [onSelectRoom, onNext]);

  // Compute validation state
  const isValidSelection = useMemo(() => {
    if (!currentRoom) return false;
    if (currentRoom === 'other') {
      return customRoomName.trim().length > 0;
    }
    return true;
  }, [currentRoom, customRoomName]);

  // Handle Continue button click
  const handleContinue = useCallback(() => {
    if (isValidSelection) {
      onNext();
    }
  }, [isValidSelection, onNext]);

  // REQ-114: Keyboard navigation handler for room grid
  // Uses a 2-column layout on mobile, 3 on tablet, 4 on desktop
  // For simplicity, we'll use a fixed 4-column approach and let it adapt
  const handleGridKeyDown = useCallback((event: React.KeyboardEvent) => {
    const validRefs = roomRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (validRefs.length === 0) return;

    // Dynamically determine columns based on viewport width
    // This is a simplified approach - actual column count depends on CSS grid
    const getColumns = () => {
      if (typeof window === 'undefined') return 4;
      if (window.innerWidth < 640) return 2;  // sm breakpoint
      if (window.innerWidth < 1024) return 3; // lg breakpoint
      return 4;
    };

    const handleNav = createKeyboardNavigator({
      items: validRefs,
      orientation: 'grid',
      columns: getColumns(),
      loop: true,
      onSelect: (index) => {
        handleRoomSelect(ROOM_TYPES[index] as RoomType);
      },
      onFocusChange: (index) => {
        setActiveIndex(index);
      },
    });

    handleNav(event);
  }, [handleRoomSelect]);

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          Select a Room
        </h2>
        <p className="text-base text-[#717171]">
          Choose where this item is located in your property
        </p>
      </div>

      {/* Room grid */}
      <div
        role="radiogroup"
        aria-label="Select a room for your item"
        aria-describedby="room-selection-help"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        onKeyDown={handleGridKeyDown}
      >
        {ROOM_TYPES.map((room, index) => (
          <RoomCard
            key={room}
            ref={(el) => { roomRefs.current[index] = el; }}
            room={room}
            label={ROOM_LABELS[room]}
            icon={ROOM_ICONS[room]}
            isSelected={currentRoom === room}
            onSelect={handleRoomSelect}
            tabIndex={index === activeIndex ? 0 : -1}
          />
        ))}
      </div>
      <p id="room-selection-help" className="sr-only">
        Use arrow keys to navigate between rooms. Press Enter or Space to select.
      </p>

      {/* Custom room input for "Other" option */}
      {currentRoom === 'other' && (
        <div className="mt-6">
          <label
            htmlFor="custom-room-input"
            className="block text-sm font-medium text-[#222222] mb-2"
          >
            Enter room name
          </label>
          <input
            id="custom-room-input"
            type="text"
            value={customRoomName}
            onChange={handleCustomRoomNameChange}
            placeholder="e.g., Home Office, Wine Cellar, Mudroom"
            maxLength={50}
            className={cn(
              'w-full px-4 py-3 border-2 rounded-lg',
              'text-base text-[#222222] placeholder:text-[#717171]',
              'transition-colors duration-150 motion-reduce:transition-none',
              'focus:outline-none focus:border-[#222222]',
              'border-gray-200'
            )}
            aria-required="true"
            aria-describedby="custom-room-hint"
          />
          <p id="custom-room-hint" className="mt-1 text-sm text-[#717171]">
            Maximum 50 characters
          </p>
        </div>
      )}

      {/* Continue button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isValidSelection}
          className={cn(
            'w-full py-4 rounded-lg font-semibold text-lg',
            'transition-colors duration-150 motion-reduce:transition-none',
            'min-h-[56px]', // Touch target height
            isValidSelection
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-disabled={!isValidSelection}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default RoomSelectionStep;
