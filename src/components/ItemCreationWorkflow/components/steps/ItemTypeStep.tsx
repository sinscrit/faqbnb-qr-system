'use client';

/**
 * ItemTypeStep Component
 *
 * Step 2 of the item creation workflow.
 * Displays three item type options for user selection.
 * Auto-skipped when room is "General" (handled by state machine).
 *
 * @module ItemCreationWorkflow/components/steps/ItemTypeStep
 * @see docs/REQ-099-item-type-selection-step-overview.md
 * @see docs/REQ-114-accessibility-mobile-optimization-overview.md
 * @lastModified 2026-01-22 (REQ-E02-059 i18n Integration)
 */

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ItemTypeCard, ITEM_TYPE_ICONS } from '../shared';
import { ITEM_TYPES } from '../../utils/constants';
import type { ItemType } from '../../ItemCreationWorkflow.types';
import { createKeyboardNavigator } from '../../utils/accessibility';

// =============================================================================
// Type Definitions
// =============================================================================

export interface ItemTypeStepProps {
  /** Current selected item type from state */
  currentItemType: ItemType | null;
  /** Handler to select an item type */
  onSelectItemType: (itemType: ItemType) => void;
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

/**
 * Helper to convert hyphenated item type to camelCase translation key
 * e.g., 'room-item' -> 'roomItem', 'general-info' -> 'generalInfo'
 */
function getItemTypeTranslationKey(type: string): string {
  const keyMap: Record<string, string> = {
    'room-item': 'roomItem',
    'general-info': 'generalInfo',
  };
  return keyMap[type] || type;
}

export function ItemTypeStep({
  currentItemType,
  onSelectItemType,
  onNext,
  canNext,
  className,
}: ItemTypeStepProps) {
  // i18n hooks for translations (REQ-E02-059)
  const t = useTranslations('workflow.steps.itemType');
  const tItemTypes = useTranslations('workflow.constants.itemTypes');
  const tNav = useTranslations('workflow.navigation');

  // REQ-114: Refs for keyboard navigation (roving tabindex)
  const [activeIndex, setActiveIndex] = useState(() =>
    currentItemType ? ITEM_TYPES.indexOf(currentItemType as ItemType) : 0
  );
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-advance when an item type is selected
  const handleItemTypeSelect = useCallback((itemType: ItemType) => {
    onSelectItemType(itemType);
    // Auto-advance after a brief visual feedback delay
    setTimeout(() => {
      onNext();
    }, 150);
  }, [onSelectItemType, onNext]);

  // Handle Continue button click
  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  // REQ-114: Keyboard navigation handler for item type cards (vertical list)
  const handleListKeyDown = useCallback((event: React.KeyboardEvent) => {
    const validRefs = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (validRefs.length === 0) return;

    const handleNav = createKeyboardNavigator({
      items: validRefs,
      orientation: 'vertical',
      loop: true,
      onSelect: (index) => {
        handleItemTypeSelect(ITEM_TYPES[index] as ItemType);
      },
      onFocusChange: (index) => {
        setActiveIndex(index);
      },
    });

    handleNav(event);
  }, [handleItemTypeSelect]);

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          {t('title')}
        </h2>
        <p className="text-base text-[#717171]">
          {t('subtitle')}
        </p>
      </div>

      {/* Item type cards */}
      <div
        role="radiogroup"
        aria-label={t('ariaLabel')}
        aria-describedby="item-type-help"
        className="flex flex-col gap-4"
        onKeyDown={handleListKeyDown}
      >
        {ITEM_TYPES.map((type, index) => {
          const typeKey = getItemTypeTranslationKey(type);
          return (
            <ItemTypeCard
              key={type}
              ref={(el) => { itemRefs.current[index] = el; }}
              itemType={type}
              label={tItemTypes(`${typeKey}.label`)}
              description={tItemTypes(`${typeKey}.description`)}
              icon={ITEM_TYPE_ICONS[type]}
              isSelected={currentItemType === type}
              onSelect={handleItemTypeSelect}
              tabIndex={index === activeIndex ? 0 : -1}
            />
          );
        })}
      </div>
      <p id="item-type-help" className="sr-only">
        {t('ariaHelp')}
      </p>

      {/* Continue button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canNext}
          className={cn(
            'w-full py-4 rounded-lg font-semibold text-lg',
            'transition-colors duration-150 motion-reduce:transition-none',
            'min-h-[56px]', // Touch target height
            canNext
              ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F] active:bg-[#D70466]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-disabled={!canNext}
        >
          {tNav('continue')}
        </button>
      </div>
    </div>
  );
}

export default ItemTypeStep;
