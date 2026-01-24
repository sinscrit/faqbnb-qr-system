'use client';

/**
 * TranslationStatusFilter Component
 *
 * Dropdown filter for filtering item lists by translation status.
 * Provides a native HTML select element for filtering content by translation state.
 *
 * Features:
 * - 6 filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
 * - Size variants (sm, md, lg) for different UI contexts
 * - Optional visible label with proper accessibility
 * - Full i18n support via next-intl
 * - Controlled component pattern
 *
 * Integration Notes:
 * This is a controlled component - parent manages filter state:
 * ```tsx
 * const [filter, setFilter] = useState<TranslationFilterStatus>('all');
 * <TranslationStatusFilter value={filter} onChange={setFilter} />
 * ```
 *
 * Filtering logic example:
 * ```tsx
 * const matchesStatusFilter = (item: Item, status: TranslationFilterStatus): boolean => {
 *   if (status === 'all') return true;
 *   // ... check item.translationStatus against filter
 * };
 * const filteredItems = items.filter(item => matchesStatusFilter(item, filter));
 * ```
 *
 * @module TranslationManagement/TranslationStatusFilter
 * @see /docs/REQ-E05-015-create-translationstatusfilter-component-overview.md
 * @lastModified 2026-01-24
 */

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// Pattern reference: Similar to RoomSelector.tsx native select implementation

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Translation filter status options
 *
 * @description
 * - 'all' - Show all items regardless of translation status
 * - 'fully_translated' - Items with all languages translated
 * - 'partially_translated' - Items with some but not all languages translated
 * - 'pending' - Items with translations currently in progress
 * - 'failed' - Items with failed translation attempts
 * - 'manually_edited' - Items with manual translation edits
 */
export type TranslationFilterStatus =
  | 'all'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'failed'
  | 'manually_edited';

/**
 * Props for the TranslationStatusFilter component
 */
export interface TranslationStatusFilterProps {
  /** Currently selected filter value */
  value: TranslationFilterStatus;
  /** Callback when filter selection changes */
  onChange: (value: TranslationFilterStatus) => void;
  /** Disable the dropdown */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom placeholder text (overrides default) */
  placeholder?: string;
  /** Size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Show label above dropdown (default: false) */
  showLabel?: boolean;
  /** Custom label text (overrides default i18n label) */
  label?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Filter option definitions with translation keys
 */
const FILTER_OPTIONS = [
  { value: 'all', labelKey: 'all' },
  { value: 'fully_translated', labelKey: 'fullyTranslated' },
  { value: 'partially_translated', labelKey: 'partiallyTranslated' },
  { value: 'pending', labelKey: 'pending' },
  { value: 'failed', labelKey: 'failed' },
  { value: 'manually_edited', labelKey: 'manuallyEdited' },
] as const;

/**
 * Size variant configurations
 * - sm: Compact size for dense UIs (h-8)
 * - md: Default size for standard UIs (h-9)
 * - lg: Large size for prominent filters (h-10)
 */
const SIZE_CONFIG = {
  sm: { height: 'h-8', fontSize: 'text-sm', padding: 'px-3 py-1.5' },
  md: { height: 'h-9', fontSize: 'text-sm', padding: 'px-4 py-2' }, // default
  lg: { height: 'h-10', fontSize: 'text-base', padding: 'px-4 py-2' },
} as const;

// =============================================================================
// Component
// =============================================================================

/**
 * TranslationStatusFilter Component
 *
 * @param props - Component props
 * @returns Dropdown filter element for translation status filtering
 *
 * @example Basic usage with state
 * ```tsx
 * const [filter, setFilter] = useState<TranslationFilterStatus>('all');
 * <TranslationStatusFilter value={filter} onChange={setFilter} />
 * ```
 *
 * @example With label and size
 * ```tsx
 * <TranslationStatusFilter
 *   value={filter}
 *   onChange={setFilter}
 *   showLabel={true}
 *   size="lg"
 * />
 * ```
 *
 * @example In a filter bar
 * ```tsx
 * <div className="flex gap-4">
 *   <TranslationStatusFilter value={filter} onChange={setFilter} size="sm" />
 *   <SearchInput />
 *   <SortDropdown />
 * </div>
 * ```
 */
export function TranslationStatusFilter(props: TranslationStatusFilterProps) {
  const {
    value,
    onChange,
    disabled = false,
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    placeholder, // Reserved for future Radix Select upgrade
    size = 'md',
    showLabel = false,
    label,
  } = props;

  // Translation namespace: translationManagement.statusFilter
  const t = useTranslations('translationManagement.statusFilter');

  // Generate unique ID for select-label association (accessibility)
  const selectId = useId();

  // Resolve label with i18n fallback
  const resolvedLabel = label ?? t('label');
  // Note: Native select elements don't support placeholder;
  // placeholder prop is reserved for future Radix Select upgrade

  /**
   * Handle select change event
   * Type assertion is safe because option values are constrained to TranslationFilterStatus
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as TranslationFilterStatus;
    onChange(selectedValue);
  };

  // Get size-specific configuration
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className={className}>
      {/* Conditional label rendering */}
      {showLabel && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {resolvedLabel}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        // aria-label only when label is hidden for screen readers
        aria-label={!showLabel ? resolvedLabel : undefined}
        className={cn(
          // Base styles
          'w-full border border-gray-300 rounded-lg',
          // Focus styles
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          // Disabled styles
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Transition
          'transition-colors',
          // Colors
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          // Size-specific styles
          sizeConfig.height,
          sizeConfig.fontSize,
          sizeConfig.padding
        )}
      >
        {/* Render filter options with translated labels */}
        {FILTER_OPTIONS.map(({ value: optionValue, labelKey }) => (
          <option key={optionValue} value={optionValue}>
            {t(`options.${labelKey}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
