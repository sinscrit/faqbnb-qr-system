'use client';

/**
 * SpecificItemStep Component
 *
 * Step 3 of the item creation workflow.
 * Displays contextual item suggestions and allows custom item entry.
 * Auto-generates item name as "Room - Item" format.
 *
 * @module ItemCreationWorkflow/components/steps/SpecificItemStep
 * @see docs/REQ-100-specific-item-selection-step-overview.md
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05 (REQ-113)
 */

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSuggestions } from '../../hooks';
import { SuggestionButton, ItemNameEditor, DuplicateNameWarning } from '../shared';
import { ROOM_LABELS } from '../../utils/constants';
import { checkDuplicateName } from '../../utils/duplicateNameCheck';
import type { RoomType, ItemType, SessionItem } from '../../ItemCreationWorkflow.types';

export interface SpecificItemStepProps {
  /** Currently selected room */
  currentRoom: RoomType;
  /** Currently selected item type */
  currentItemType: ItemType;
  /** Currently selected specific item (empty string if none) */
  currentSpecificItem: string;
  /** Current item name (auto-generated or user-edited) */
  currentItemName: string;
  /** Items already created in this session (for graying out) */
  existingSessionItems: SessionItem[];
  /** Handler to select a specific item */
  onSelectSpecificItem: (item: string) => void;
  /** Handler to edit the item name */
  onSetItemName: (name: string) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}

export function SpecificItemStep({
  currentRoom,
  currentItemType,
  currentSpecificItem,
  currentItemName,
  existingSessionItems,
  onSelectSpecificItem,
  onSetItemName,
  onNext,
  canNext,
  className,
}: SpecificItemStepProps) {
  // Local state for custom item mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customItemValue, setCustomItemValue] = useState('');

  // Get suggestions for current room + item type
  const { suggestions, isCreated, hasSuggestions } = useSuggestions({
    room: currentRoom,
    itemType: currentItemType,
    existingItems: existingSessionItems,
  });

  // Get existing item names for duplicate checking
  const existingItemNames = useMemo(
    () => existingSessionItems.map((item) => item.name),
    [existingSessionItems]
  );

  // Check for duplicate name
  const duplicateCheck = useMemo(
    () => checkDuplicateName(currentItemName, existingItemNames),
    [currentItemName, existingItemNames]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setIsCustomMode(false);
      setCustomItemValue('');
      onSelectSpecificItem(suggestion);
    },
    [onSelectSpecificItem]
  );

  // Handle "Other" / custom option click
  const handleOtherClick = useCallback(() => {
    setIsCustomMode(true);
    // If there's existing custom value, select it
    if (customItemValue.trim()) {
      onSelectSpecificItem(customItemValue.trim());
    }
  }, [customItemValue, onSelectSpecificItem]);

  // Handle custom item input change
  const handleCustomItemChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCustomItemValue(value);
      if (value.trim()) {
        onSelectSpecificItem(value.trim());
      }
    },
    [onSelectSpecificItem]
  );

  // Handle continue button
  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  // Determine if a suggestion is currently selected (not custom mode)
  const isSuggestionSelected = (suggestion: string) =>
    !isCustomMode && currentSpecificItem === suggestion;

  // Room label for display
  const roomLabel = ROOM_LABELS[currentRoom] || currentRoom;

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          What specific item?
        </h2>
        <p className="text-base text-[#717171]">
          Select from suggestions or enter a custom item for {roomLabel}
        </p>
      </div>

      {/* Suggestions section */}
      {hasSuggestions && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#717171] mb-3 uppercase tracking-wide">
            Suggestions
          </h3>
          <div
            role="radiogroup"
            aria-label="Select a specific item"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {suggestions.map((suggestion) => (
              <SuggestionButton
                key={suggestion}
                label={suggestion}
                isSelected={isSuggestionSelected(suggestion)}
                isCreated={isCreated(suggestion)}
                onSelect={handleSuggestionSelect}
              />
            ))}
            {/* "Other" option */}
            <SuggestionButton
              label="Other..."
              isSelected={isCustomMode}
              isCreated={false}
              onSelect={handleOtherClick}
            />
          </div>
        </div>
      )}

      {/* Custom item input (shown when "Other" selected or no suggestions) */}
      {(isCustomMode || !hasSuggestions) && (
        <div className="mb-6">
          <label
            htmlFor="custom-item-input"
            className="block text-sm font-medium text-[#222222] mb-2"
          >
            {hasSuggestions ? 'Enter custom item name' : 'Enter item name'}
          </label>
          <input
            id="custom-item-input"
            type="text"
            value={customItemValue}
            onChange={handleCustomItemChange}
            placeholder="e.g., Coffee Maker, Smart Thermostat"
            maxLength={50}
            className={cn(
              'w-full px-4 py-3 border-2 rounded-lg',
              'text-base text-[#222222] placeholder:text-[#717171]',
              'transition-colors duration-150',
              'focus:outline-none focus:border-[#222222]',
              'border-gray-200'
            )}
            aria-required="true"
            autoFocus={isCustomMode}
          />
        </div>
      )}

      {/* Item name editor (shows auto-generated name when item selected) */}
      {currentSpecificItem && (
        <div className="mb-6">
          <ItemNameEditor
            value={currentItemName}
            onChange={onSetItemName}
            placeholder="Enter item name"
            maxLength={100}
          />

          {/* Duplicate name warning */}
          {duplicateCheck.isDuplicate && (
            <div className="mt-3">
              <DuplicateNameWarning
                matchingNames={duplicateCheck.matchingNames}
                matchType={duplicateCheck.matchType}
                variant="block"
              />
            </div>
          )}
        </div>
      )}

      {/* Continue button */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canNext}
          className={cn(
            'w-full py-4 rounded-lg font-semibold text-lg',
            'transition-colors duration-150',
            'min-h-[56px]', // Touch target height
            canNext
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-disabled={!canNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default SpecificItemStep;
