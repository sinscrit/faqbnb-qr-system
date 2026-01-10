'use client';

/**
 * PurposeStep Component
 *
 * Step 4 of the item creation workflow.
 * Allows users to select the purpose/intent of their item content.
 * Implements keyboard navigation and accessibility support.
 *
 * @module ItemCreationWorkflow/components/steps/PurposeStep
 * @see docs/REQ-157-create-purposestep-component-overview.md
 * @lastModified 2026-01-10
 */

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  PlayCircle,
  Sparkles,
  Wrench,
  AlertTriangle,
  Settings,
  Star,
  Info,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../utils/constants';
import type { PurposeType } from '../../ItemCreationWorkflow.types';
import { createKeyboardNavigator } from '../../utils/accessibility';

// =============================================================================
// Type Definitions
// =============================================================================

export interface PurposeStepProps {
  /** Currently selected purpose (null if none) */
  currentPurpose: PurposeType | null;
  /** Callback when purpose is selected */
  onSelectPurpose: (purpose: PurposeType) => void;
  /** Callback to proceed to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class */
  className?: string;
}

// =============================================================================
// Icon Mapping
// =============================================================================

/**
 * Maps purpose types to their corresponding Lucide icons.
 */
const PURPOSE_ICONS: Record<PurposeType, LucideIcon> = {
  'how-to-use': PlayCircle,
  'how-to-clean': Sparkles,
  'troubleshooting': Wrench,
  'safety-info': AlertTriangle,
  'maintenance': Settings,
  'features': Star,
  'other': Info,
};

// =============================================================================
// Main Component
// =============================================================================

export function PurposeStep({
  currentPurpose,
  onSelectPurpose,
  onNext,
  canNext,
  className,
}: PurposeStepProps) {
  // State for roving tabindex pattern
  const [activeIndex, setActiveIndex] = useState(() =>
    currentPurpose ? PURPOSE_TYPES.indexOf(currentPurpose as PurposeType) : 0
  );
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-advance when a purpose is selected
  const handlePurposeSelect = useCallback((purpose: PurposeType) => {
    onSelectPurpose(purpose);
    // Auto-advance after a brief visual feedback delay
    setTimeout(() => {
      onNext();
    }, 150);
  }, [onSelectPurpose, onNext]);

  // Handle Continue button click
  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  // Keyboard navigation handler for purpose cards (vertical list)
  const handleListKeyDown = useCallback((event: React.KeyboardEvent) => {
    const validRefs = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (validRefs.length === 0) return;

    const handleNav = createKeyboardNavigator({
      items: validRefs,
      orientation: 'vertical',
      loop: true,
      onSelect: (index) => {
        handlePurposeSelect(PURPOSE_TYPES[index] as PurposeType);
      },
      onFocusChange: (index) => {
        setActiveIndex(index);
      },
    });

    handleNav(event);
  }, [handlePurposeSelect]);

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          What&apos;s the purpose of this content?
        </h2>
        <p className="text-base text-[#717171]">
          Choose what you want to help guests with
        </p>
      </div>

      {/* Purpose cards */}
      <div
        role="radiogroup"
        aria-label="Select content purpose"
        aria-describedby="purpose-help"
        className="flex flex-col gap-4"
        onKeyDown={handleListKeyDown}
      >
        {PURPOSE_TYPES.map((type, index) => {
          const Icon = PURPOSE_ICONS[type];
          const isSelected = currentPurpose === type;

          return (
            <button
              key={type}
              ref={(el) => { itemRefs.current[index] = el; }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`${type}-description`}
              onClick={() => handlePurposeSelect(type as PurposeType)}
              tabIndex={index === activeIndex ? 0 : -1}
              className={cn(
                // Layout - horizontal with icon left, text right
                'flex items-center gap-4',
                'w-full rounded-xl border-2',
                // Sizing - matching ItemTypeCard
                'min-h-[100px] p-4 sm:min-h-[120px] sm:p-5',
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
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] motion-reduce:active:scale-100'
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
                  {PURPOSE_LABELS[type]}
                </span>
                <span
                  id={`${type}-description`}
                  className={cn(
                    'block mt-1 text-sm',
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  {PURPOSE_DESCRIPTIONS[type]}
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
        })}
      </div>
      <p id="purpose-help" className="sr-only">
        Use up and down arrow keys to navigate. Press Enter or Space to select.
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
          Continue
        </button>
      </div>
    </div>
  );
}

export default PurposeStep;
