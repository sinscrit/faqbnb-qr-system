'use client';

/**
 * RoomSelectionStep Component
 *
 * Step 1 of the item creation workflow.
 * Displays a grid of room options for user selection.
 *
 * @module ItemCreationWorkflow/components/steps/RoomSelectionStep
 * @see docs/REQ-098-room-selection-step-overview.md
 * @lastModified 2026-01-05
 */

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RoomCard } from '../shared';
import { ROOM_TYPES, ROOM_LABELS, ROOM_ICONS } from '../../utils/constants';
import type { RoomType } from '../../ItemCreationWorkflow.types';

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

  // Handle custom room name changes
  const handleCustomRoomNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomRoomName(e.target.value);
    },
    []
  );

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
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {ROOM_TYPES.map((room) => (
          <RoomCard
            key={room}
            room={room}
            label={ROOM_LABELS[room]}
            icon={ROOM_ICONS[room]}
            isSelected={currentRoom === room}
            onSelect={onSelectRoom}
          />
        ))}
      </div>

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
              'transition-colors duration-150',
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
            'transition-colors duration-150',
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
