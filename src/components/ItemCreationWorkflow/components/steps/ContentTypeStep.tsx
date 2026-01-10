'use client';

/**
 * ContentTypeStep Component
 *
 * Displays unified content options in a single grid.
 * Users select from: Record Video, Take Photo, Write Text,
 * Upload File, or Add Link.
 *
 * Updated in REQ-162 to consolidate content source and content type
 * into a single step, eliminating the need for ContentSourceStep.
 *
 * @module ItemCreationWorkflow/components/steps/ContentTypeStep
 * @see docs/REQ-162-consolidate-content-options-overview.md
 * @see docs/REQ-114-accessibility-mobile-optimization-overview.md
 * @lastModified 2026-01-10 (REQ-162 Consolidate Content Options)
 */

import { useCallback, useRef, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { createKeyboardNavigator } from '../../utils/accessibility';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Type,
  Link,
  Video,
  Camera,
  PenLine,
  Check,
  type LucideIcon,
} from 'lucide-react';
import type { ContentType } from '../../ItemCreationWorkflow.types';
import { UNIFIED_CONTENT_OPTIONS, type UnifiedContentOption } from '../../utils/constants';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Props interface for ContentTypeStep.
 * Updated for REQ-162 unified content options.
 */
export interface ContentTypeStepProps {
  /** Current selected option id (for visual highlight) */
  currentSelection: string | null;
  /** Handler when content option is selected - receives both type and source */
  onSelectContent: (
    contentType: ContentType | 'file-upload',
    contentSource: 'existing' | 'create-new'
  ) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Icon Mapping
// =============================================================================

/**
 * Maps icon name strings to Lucide icon components.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Video,
  Camera,
  PenLine,
  Upload,
  ImageIcon,
  FileText,
  Type,
  Link,
};

/**
 * Gets the icon component for a given icon name.
 * Falls back to Upload icon if name not found.
 */
const getIconComponent = (iconName: string): LucideIcon => {
  return ICON_MAP[iconName] || Upload;
};

// =============================================================================
// ContentTypeCard Inline Component
// =============================================================================

interface ContentTypeCardProps {
  option: {
    type: string;
    label: string;
    subtitle?: string;
    icon: LucideIcon;
  };
  isSelected: boolean;
  onSelect: () => void;
  tabIndex?: number;
}

const ContentTypeCard = forwardRef<HTMLButtonElement, ContentTypeCardProps>(
  function ContentTypeCard({ option, isSelected, onSelect, tabIndex }, ref) {
    const Icon = option.icon;

    const handleClick = () => onSelect();

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={tabIndex}
        className={cn(
          // Layout - horizontal with icon left, label right
          'flex items-center gap-3',
          'w-full rounded-xl border-2',
          // Sizing - compact card
          'min-h-[80px] p-4',
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
            'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12',
            'flex items-center justify-center',
            'rounded-lg',
            isSelected ? 'bg-blue-100' : 'bg-gray-100'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5 sm:w-6 sm:h-6',
              isSelected ? 'text-blue-600' : 'text-gray-500'
            )}
            aria-hidden="true"
          />
        </div>

        {/* Label Section */}
        <div className="flex-1 text-left">
          <span
            className={cn(
              'block text-base sm:text-lg font-medium',
              isSelected ? 'text-blue-700' : 'text-gray-900'
            )}
          >
            {option.label}
          </span>
          {option.subtitle && (
            <span
              className={cn(
                'block text-xs sm:text-sm mt-0.5',
                isSelected ? 'text-blue-500' : 'text-gray-500'
              )}
            >
              {option.subtitle}
            </span>
          )}
        </div>

        {/* Checkmark indicator for selected state */}
        {isSelected && (
          <div className="flex-shrink-0">
            <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </div>
        )}
      </button>
    );
  }
);

// =============================================================================
// Main Component
// =============================================================================

export function ContentTypeStep({
  currentSelection,
  onSelectContent,
  onNext,
  canNext,
  className,
}: ContentTypeStepProps) {
  // Use unified options directly from constants
  const contentOptions = UNIFIED_CONTENT_OPTIONS;

  // REQ-114: Refs for keyboard navigation (roving tabindex)
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!currentSelection) return 0;
    const idx = contentOptions.findIndex(opt => opt.id === currentSelection);
    return idx >= 0 ? idx : 0;
  });
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Updated header text for unified options
  const headerText = 'What content would you like to add?';
  const descriptionText = 'Choose how you want to add information for this item';

  // Handle unified content selection - sets both type and source, then auto-advances
  const handleContentSelect = useCallback((option: UnifiedContentOption) => {
    onSelectContent(option.contentType, option.contentSource);
    // Auto-advance after a brief visual feedback delay
    setTimeout(() => {
      onNext();
    }, 150);
  }, [onSelectContent, onNext]);

  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  // REQ-114: Keyboard navigation handler for content type grid
  const handleGridKeyDown = useCallback((event: React.KeyboardEvent) => {
    const validRefs = cardRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (validRefs.length === 0) return;

    // Use 2 columns on tablet/desktop, 1 on mobile
    const getColumns = () => {
      if (typeof window === 'undefined') return 2;
      return window.innerWidth >= 640 ? 2 : 1;
    };

    const handleNav = createKeyboardNavigator({
      items: validRefs,
      orientation: getColumns() > 1 ? 'grid' : 'vertical',
      columns: getColumns(),
      loop: true,
      onSelect: (index) => {
        handleContentSelect(contentOptions[index]);
      },
      onFocusChange: (index) => {
        setActiveIndex(index);
      },
    });

    handleNav(event);
  }, [handleContentSelect, contentOptions]);

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          {headerText}
        </h2>
        <p className="text-base text-[#717171]">
          {descriptionText}
        </p>
      </div>

      {/* Content type cards grid */}
      <div
        role="radiogroup"
        aria-label="Select content type"
        aria-describedby="content-type-help"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        onKeyDown={handleGridKeyDown}
      >
        {contentOptions.map((option, index) => (
          <ContentTypeCard
            key={option.id}
            ref={(el) => { cardRefs.current[index] = el; }}
            option={{
              type: option.id,
              label: option.label,
              subtitle: option.subtitle,
              icon: getIconComponent(option.icon),
            }}
            isSelected={currentSelection === option.id}
            onSelect={() => handleContentSelect(option)}
            tabIndex={index === activeIndex ? 0 : -1}
          />
        ))}
      </div>
      <p id="content-type-help" className="sr-only">
        Use arrow keys to navigate. Press Enter or Space to select.
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
            'min-h-[56px]',
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

export default ContentTypeStep;
