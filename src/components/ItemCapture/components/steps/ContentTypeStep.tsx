'use client';

/**
 * ContentTypeStep Component
 *
 * Presents users with four content creation options: Video, Photo, Text, Upload.
 * Uses large, accessible, touch-friendly buttons with Lucide React icons.
 *
 * @module ItemCapture/components/steps/ContentTypeStep
 * @see docs/REQ-035-implement-contenttypestep-detailed.md
 * @lastModified 2025-12-31 (REQ-035)
 */

import React from 'react';
import { Video, Camera, FileText, Upload, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Available content types for item capture.
 */
export type ContentType = 'video' | 'photo' | 'text' | 'upload';

/**
 * Props for ContentTypeStep component.
 */
export interface ContentTypeStepProps {
  /** Currently selected content type, null if none selected */
  selectedType: ContentType | null;
  /** Callback when a content type is selected */
  onSelect: (type: ContentType) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Configuration for each content type option.
 */
interface ContentTypeOption {
  type: ContentType;
  icon: LucideIcon;
  label: string;
  description: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Content type options configuration.
 * Defines icon, label, and description for each option.
 */
const CONTENT_OPTIONS: ContentTypeOption[] = [
  {
    type: 'video',
    icon: Video,
    label: 'Record Video',
    description: 'Capture video instructions',
  },
  {
    type: 'photo',
    icon: Camera,
    label: 'Take Photo',
    description: 'Capture photos',
  },
  {
    type: 'text',
    icon: FileText,
    label: 'Write Text',
    description: 'Create written instructions',
  },
  {
    type: 'upload',
    icon: Upload,
    label: 'Upload File',
    description: 'Upload existing media',
  },
] as const;

// =============================================================================
// Component
// =============================================================================

/**
 * ContentTypeStep presents content type selection with large, accessible buttons.
 *
 * Features:
 * - Four content type options: Video, Photo, Text, Upload
 * - Responsive 2-column (mobile) / 4-column (desktop) grid
 * - Touch-friendly targets (100px+ height)
 * - Full keyboard navigation support
 * - ARIA radiogroup pattern for accessibility
 * - Visual selection feedback with color changes
 *
 * @example
 * ```tsx
 * <ContentTypeStep
 *   selectedType={selectedType}
 *   onSelect={(type) => handleContentTypeSelect(type)}
 * />
 * ```
 */
export function ContentTypeStep({
  selectedType,
  onSelect,
  className,
}: ContentTypeStepProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Choose Content Type
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Select how you want to create content for this item
        </p>
      </div>

      {/* Content Type Grid */}
      <div
        role="radiogroup"
        aria-label="Content type selection"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {CONTENT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;

          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.label}: ${option.description}`}
              onClick={() => onSelect(option.type)}
              className={cn(
                // Layout
                'flex flex-col items-center justify-center',
                'w-full aspect-square rounded-xl border-2',
                // Touch targets (WCAG 2.5.5 - minimum 44x44px, we exceed with 100px+)
                'min-h-[100px] p-4 sm:min-h-[120px] sm:p-6',
                // Touch optimization
                'touch-manipulation select-none',
                // Transitions
                'transition-all duration-200',
                // Focus states
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                // Selection state styling
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-95'
              )}
            >
              {/* Icon */}
              <Icon
                className={cn(
                  'w-8 h-8 sm:w-10 sm:h-10 mb-2',
                  isSelected ? 'text-blue-600' : 'text-gray-500'
                )}
                aria-hidden="true"
              />
              {/* Label */}
              <span
                className={cn(
                  'text-sm sm:text-base font-medium text-center',
                  isSelected ? 'text-blue-700' : 'text-gray-700'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Tip */}
      <p className="text-center text-sm text-gray-500">
        Tip: You can add more content after your first selection
      </p>
    </div>
  );
}

export default ContentTypeStep;
