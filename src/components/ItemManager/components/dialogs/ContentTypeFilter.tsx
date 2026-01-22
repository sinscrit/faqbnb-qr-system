'use client';

/**
 * ContentTypeFilter Component
 *
 * Checkbox/chip group component for filtering items by content type.
 * Supports multi-selection with visual checkmark indicators.
 *
 * @module ItemManager/components/dialogs/ContentTypeFilter
 * @see docs/REQ-065-implement-filterpanel-detailed.md
 * @lastModified 2026-01-22 (REQ-E02-081 - Updated i18n to use items.filters.contentType namespace)
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Constants
// =============================================================================

/**
 * Available content type filter options with translation keys.
 * Labels are resolved at render time using items.filters.contentType namespace.
 */
const CONTENT_TYPE_OPTIONS_BASE = [
  { value: 'video', labelKey: 'video', icon: '🎥' },
  { value: 'image', labelKey: 'photo', icon: '📷' },
  { value: 'pdf', labelKey: 'pdf', icon: '📄' },
  { value: 'text-only', labelKey: 'textOnly', icon: '📝' },
  { value: 'mixed', labelKey: 'mixed', icon: '📦' },
] as const;

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the ContentTypeFilter component.
 */
export interface ContentTypeFilterProps {
  /** Currently selected content type values */
  selectedTypes: string[];
  /** Callback when selection changes */
  onSelectionChange: (types: string[]) => void;
  /** Disable all interactions */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Section label text */
  label?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * ContentTypeFilter Component
 *
 * Renders a group of toggleable chips for filtering items by content type.
 * Multiple types can be selected simultaneously.
 */
export function ContentTypeFilter({
  selectedTypes,
  onSelectionChange,
  disabled = false,
  className,
  label,
}: ContentTypeFilterProps) {
  // REQ-E02-081: i18n translations
  const t = useTranslations('items.filters.contentType');

  // Build translated content type options
  const contentTypeOptions = useMemo(() =>
    CONTENT_TYPE_OPTIONS_BASE.map((opt) => ({
      value: opt.value,
      label: t(opt.labelKey),
      icon: opt.icon,
    })),
    [t]
  );

  // Use provided label or translation
  const sectionLabel = label ?? t('label');

  /**
   * Handle toggling a content type selection.
   */
  const handleToggle = (type: string) => {
    if (disabled) return;

    const isSelected = selectedTypes.includes(type);
    const updated = isSelected
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];

    onSelectionChange(updated);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Section Label */}
      <p className="text-sm font-medium text-gray-700">{sectionLabel}</p>

      {/* Content Type Chips */}
      <div
        role="group"
        aria-label={sectionLabel}
        className="flex flex-wrap gap-2"
      >
        {contentTypeOptions.map(({ value, label: typeLabel, icon }) => {
          const isSelected = selectedTypes.includes(value);

          return (
            <button
              key={value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => handleToggle(value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors',
                'min-h-[44px]', // Touch target
                'touch-manipulation [-webkit-tap-highlight-color:transparent]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                isSelected
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Checkbox Indicator */}
              <span
                className={cn(
                  'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected
                    ? 'bg-blue-500'
                    : 'border border-gray-400 bg-white'
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </span>

              {/* Icon and Label */}
              <span className="flex items-center gap-1">
                <span aria-hidden="true">{icon}</span>
                <span>{typeLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ContentTypeFilter;
