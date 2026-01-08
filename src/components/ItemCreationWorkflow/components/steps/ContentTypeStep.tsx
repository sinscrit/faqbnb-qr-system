'use client';

/**
 * ContentTypeStep Component
 *
 * Step 5 of the item creation workflow.
 * Displays content type options dynamically based on the user's content source selection.
 * For "I have content": Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
 * For "Create now": Record Video, Take Photo, Write Text
 *
 * @module ItemCreationWorkflow/components/steps/ContentTypeStep
 * @see docs/REQ-103-content-type-step-overview.md
 * @see docs/REQ-114-accessibility-mobile-optimization-overview.md
 * @lastModified 2026-01-05 (REQ-114 Accessibility - Keyboard Navigation)
 */

import { useCallback, useMemo, useRef, useState, forwardRef } from 'react';
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

// =============================================================================
// Type Definitions
// =============================================================================

interface ContentTypeOption {
  type: ContentType;
  label: string;
  icon: LucideIcon;
}

export interface ContentTypeStepProps {
  /** Current content source from state (determines available options) */
  currentContentSource: 'existing' | 'create-new';
  /** Current selected content type from state */
  currentContentType: ContentType | null;
  /** Handler to select a content type */
  onSelectContentType: (type: ContentType) => void;
  /** Handler for proceeding to next step */
  onNext: () => void;
  /** Whether next step navigation is allowed */
  canNext: boolean;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Content Type Option Data
// =============================================================================

const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon },
  { type: 'pdf', label: 'Upload PDF', icon: FileText },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];

const CREATE_NEW_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Record Video', icon: Video },
  { type: 'photo', label: 'Take Photo', icon: Camera },
  { type: 'text', label: 'Write Text', icon: PenLine },
];

// =============================================================================
// ContentTypeCard Inline Component
// =============================================================================

interface ContentTypeCardProps {
  option: ContentTypeOption;
  isSelected: boolean;
  onSelect: (type: ContentType) => void;
  tabIndex?: number;
}

const ContentTypeCard = forwardRef<HTMLButtonElement, ContentTypeCardProps>(
  function ContentTypeCard({ option, isSelected, onSelect, tabIndex }, ref) {
    const Icon = option.icon;

    const handleClick = () => onSelect(option.type);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(option.type);
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
        <span
          className={cn(
            'flex-1 text-left text-base sm:text-lg font-medium',
            isSelected ? 'text-blue-700' : 'text-gray-900'
          )}
        >
          {option.label}
        </span>

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
  currentContentSource,
  currentContentType,
  onSelectContentType,
  onNext,
  canNext,
  className,
}: ContentTypeStepProps) {
  // Determine which options to show based on content source
  const contentOptions = useMemo(() => {
    return currentContentSource === 'existing'
      ? EXISTING_CONTENT_OPTIONS
      : CREATE_NEW_OPTIONS;
  }, [currentContentSource]);

  // REQ-114: Refs for keyboard navigation (roving tabindex)
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!currentContentType) return 0;
    const idx = contentOptions.findIndex(opt => opt.type === currentContentType);
    return idx >= 0 ? idx : 0;
  });
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Dynamic header text based on content source
  const headerText = currentContentSource === 'existing'
    ? 'What type of content will you upload?'
    : 'What type of content will you create?';

  const descriptionText = currentContentSource === 'existing'
    ? 'Select the format of your existing content'
    : 'Choose how you want to capture this item';

  // Auto-advance when a content type is selected
  const handleContentTypeSelect = useCallback((type: ContentType) => {
    onSelectContentType(type);
    // Auto-advance after a brief visual feedback delay
    setTimeout(() => {
      onNext();
    }, 150);
  }, [onSelectContentType, onNext]);

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
        handleContentTypeSelect(contentOptions[index].type);
      },
      onFocusChange: (index) => {
        setActiveIndex(index);
      },
    });

    handleNav(event);
  }, [handleContentTypeSelect, contentOptions]);

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
            key={option.type}
            ref={(el) => { cardRefs.current[index] = el; }}
            option={option}
            isSelected={currentContentType === option.type}
            onSelect={handleContentTypeSelect}
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
