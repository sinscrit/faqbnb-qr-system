'use client';

/**
 * SuggestionButton Component
 *
 * Clickable button for item suggestions in SpecificItemStep.
 * Supports selected, unselected, and created (grayed out) states.
 * Already-created items are visually distinguished but still clickable.
 *
 * @example
 * ```tsx
 * <SuggestionButton
 *   label="Stove/Oven"
 *   isSelected={selectedItem === 'Stove/Oven'}
 *   isCreated={createdSuggestions.has('Stove/Oven')}
 *   onSelect={handleSelectSuggestion}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/SuggestionButton
 * @see SpecificItemStep for usage context
 * @see useSuggestions for suggestion tracking
 * @lastModified 2026-01-22 (REQ-E02-066 i18n translations)
 */

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface SuggestionButtonProps {
  /** The suggestion text to display */
  label: string;
  /** Whether this suggestion is currently selected */
  isSelected: boolean;
  /** Whether this suggestion has been created (shows grayed out) */
  isCreated: boolean;
  /** Called when suggestion is clicked */
  onSelect: (label: string) => void;
  /** Optional CSS class name */
  className?: string;
}

export function SuggestionButton({
  label,
  isSelected,
  isCreated,
  onSelect,
  className,
}: SuggestionButtonProps) {
  // REQ-E02-066: Translation hook for suggestion button
  const t = useTranslations('workflow.shared.cards.suggestion');

  const handleClick = () => {
    if (!isCreated) {
      onSelect(label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isCreated) {
      e.preventDefault();
      onSelect(label);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isCreated}
      disabled={isCreated}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base layout
        'flex items-center justify-between gap-2',
        'px-4 py-3 rounded-lg border-2',
        // Touch targets (48px minimum)
        'min-h-[48px]',
        // Touch optimization
        'touch-manipulation select-none',
        // Transitions
        'transition-all duration-150',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        // State-based styling
        isCreated
          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          : isSelected
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-[#222222] hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]',
        className
      )}
    >
      <span className="text-sm font-medium">{label}</span>

      {/* Status indicator */}
      {isCreated ? (
        <span className="text-xs text-gray-400">{t('created')}</span>
      ) : isSelected ? (
        <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
      ) : null}
    </button>
  );
}

export default SuggestionButton;
