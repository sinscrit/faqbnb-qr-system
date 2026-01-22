'use client';

/**
 * PurposeStep Component
 *
 * Step 4 of ItemCreationWorkflow - Purpose/Intent selection.
 * Allows users to select the purpose for their content (e.g., how-to-use,
 * how-to-clean, troubleshooting). This selection drives automatic title
 * generation for the article.
 *
 * Features:
 * - Grid layout of purpose options with icons
 * - Keyboard navigation (arrow keys, Enter/Space to select)
 * - Auto-advance on selection (with visual feedback delay)
 * - Screen reader announcements for selection
 *
 * @module ItemCreationWorkflow/components/steps/PurposeStep
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Phase 2
 * @see generateArticleTitle() for title generation
 * @created 2026-01-09 (Plan-094 Phase 2)
 * @lastModified 2026-01-22 (REQ-E02-061 i18n Integration)
 */

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { PURPOSE_TYPES } from '../../utils/constants';
import type { PurposeType } from '../../ItemCreationWorkflow.types';
import { createKeyboardNavigator } from '../../utils/accessibility';

// =============================================================================
// Translation Key Mapping
// =============================================================================

/**
 * Maps hyphenated purpose types to camelCase translation keys.
 * E.g., 'how-to-use' -> 'howToUse', 'safety-info' -> 'safetyInfo'
 */
const PURPOSE_TYPE_TO_KEY: Record<PurposeType, string> = {
  'how-to-use': 'howToUse',
  'how-to-clean': 'howToClean',
  'troubleshooting': 'troubleshooting',
  'safety-info': 'safetyInfo',
  'maintenance': 'maintenance',
  'features': 'features',
  'other': 'other',
};

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
  // i18n hooks for translations (REQ-E02-061)
  const t = useTranslations('workflow.steps.purpose');
  const tPurposes = useTranslations('workflow.constants.purposes');
  const tNav = useTranslations('workflow.navigation');

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
          {t('title')}
        </h2>
        <p className="text-base text-[#717171]">
          {t('subtitle')}
        </p>
      </div>

      {/* Purpose cards */}
      <div
        role="radiogroup"
        aria-label={t('ariaLabel')}
        aria-describedby="purpose-help"
        className="flex flex-col gap-4"
        onKeyDown={handleListKeyDown}
      >
        {PURPOSE_TYPES.map((type, index) => {
          const Icon = PURPOSE_ICONS[type];
          const isSelected = currentPurpose === type;
          const purposeKey = PURPOSE_TYPE_TO_KEY[type];

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
                  {tPurposes(`${purposeKey}.label`)}
                </span>
                <span
                  id={`${type}-description`}
                  className={cn(
                    'block mt-1 text-sm',
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  {tPurposes(`${purposeKey}.description`)}
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

export default PurposeStep;
