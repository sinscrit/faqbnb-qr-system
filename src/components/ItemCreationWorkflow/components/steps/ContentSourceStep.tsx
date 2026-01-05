'use client';

/**
 * ContentSourceStep Component
 *
 * Step 4 of the item creation workflow.
 * Presents two options: upload existing content or create new content.
 * The user's choice filters which content types are available in the next step.
 *
 * @module ItemCreationWorkflow/components/steps/ContentSourceStep
 * @see docs/REQ-102-content-source-step-overview.md
 * @lastModified 2026-01-05
 */

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Camera, Check, type LucideIcon } from 'lucide-react';

// =============================================================================
// Type Definitions
// =============================================================================

type ContentSource = 'existing' | 'create-new';

interface ContentSourceCardData {
  icon: LucideIcon;
  title: string;
  description: string;
  examples: readonly string[];
}

export interface ContentSourceStepProps {
  currentContentSource: ContentSource | null;
  onSelectContentSource: (source: ContentSource) => void;
  onNext: () => void;
  canNext: boolean;
  className?: string;
}

// =============================================================================
// Content Source Card Data
// =============================================================================

const CONTENT_SOURCE_CARDS: Record<ContentSource, ContentSourceCardData> = {
  existing: {
    icon: Upload,
    title: 'I have content',
    description: 'Upload existing videos, photos, PDFs, or paste text and URLs',
    examples: ['Upload Video', 'Upload Photo', 'Upload PDF', 'Paste Text', 'Paste URL'],
  },
  'create-new': {
    icon: Camera,
    title: 'Create now',
    description: 'Record videos, take photos, or write text instructions on the spot',
    examples: ['Record Video', 'Take Photo', 'Write Text'],
  },
};

// =============================================================================
// ContentSourceCard Inline Component
// =============================================================================

function ContentSourceCard({
  source,
  data,
  isSelected,
  onSelect,
}: {
  source: ContentSource;
  data: ContentSourceCardData;
  isSelected: boolean;
  onSelect: (source: ContentSource) => void;
}) {
  const handleClick = () => onSelect(source);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(source);
    }
  };

  const Icon = data.icon;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Layout - horizontal with icon left, text right
        'flex items-start gap-4',
        'w-full rounded-xl border-2',
        // Sizing
        'min-h-[140px] p-4 sm:min-h-[160px] sm:p-6',
        // Touch optimization
        'touch-manipulation select-none',
        // Transitions
        'transition-all duration-200',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        // Selection states
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'
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
          {data.title}
        </span>
        <span
          className={cn(
            'block mt-1 text-sm',
            isSelected ? 'text-blue-600' : 'text-gray-500'
          )}
        >
          {data.description}
        </span>

        {/* Examples chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {data.examples.map((example) => (
            <span
              key={example}
              className={cn(
                'inline-block px-2 py-1 text-xs rounded-full',
                isSelected
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {example}
            </span>
          ))}
        </div>
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

// =============================================================================
// Main Component
// =============================================================================

export function ContentSourceStep({
  currentContentSource,
  onSelectContentSource,
  onNext,
  canNext,
  className,
}: ContentSourceStepProps) {
  const handleContinue = useCallback(() => {
    if (canNext) {
      onNext();
    }
  }, [canNext, onNext]);

  const contentSources: ContentSource[] = ['existing', 'create-new'];

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          How would you like to add content?
        </h2>
        <p className="text-base text-[#717171]">
          Choose whether to upload existing materials or create new content
        </p>
      </div>

      {/* Content source cards */}
      <div
        role="radiogroup"
        aria-label="Select content source"
        className="flex flex-col gap-4"
      >
        {contentSources.map((source) => (
          <ContentSourceCard
            key={source}
            source={source}
            data={CONTENT_SOURCE_CARDS[source]}
            isSelected={currentContentSource === source}
            onSelect={onSelectContentSource}
          />
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canNext}
          className={cn(
            'w-full py-4 rounded-lg font-semibold text-lg',
            'transition-colors duration-150',
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

export default ContentSourceStep;
