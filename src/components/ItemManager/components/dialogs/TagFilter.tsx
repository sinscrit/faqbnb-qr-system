'use client';

/**
 * TagFilter Component
 *
 * Multi-select tag filter with dropdown suggestions and removable chips.
 * Provides search filtering within the dropdown for easy tag discovery.
 *
 * @module ItemManager/components/dialogs/TagFilter
 * @see docs/REQ-065-implement-filterpanel-detailed.md
 * @lastModified 2026-01-22 (REQ-E02-081 - Updated i18n to use items.filters.tags namespace)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the TagFilter component.
 */
export interface TagFilterProps {
  /** Currently selected tag values */
  selectedTags: string[];
  /** All available tags to choose from */
  availableTags: string[];
  /** Callback when selection changes */
  onSelectionChange: (tags: string[]) => void;
  /** Disable all interactions */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Section label text */
  label?: string;
  /** Placeholder text for empty state */
  placeholder?: string;
  /** Message shown when no tags available */
  noTagsMessage?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * TagFilter Component
 *
 * Renders a tag selection interface with:
 * - Selected tags as removable chips
 * - Dropdown with search for adding new tags
 * - Click-outside and keyboard navigation support
 */
export function TagFilter({
  selectedTags,
  availableTags,
  onSelectionChange,
  disabled = false,
  className,
  label,
  placeholder,
  noTagsMessage,
}: TagFilterProps) {
  // REQ-E02-081: i18n translations
  const t = useTranslations('items.filters.tags');

  // Resolve translated strings with prop overrides
  const resolvedLabel = label ?? t('label');
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const resolvedNoTagsMessage = noTagsMessage ?? t('noTags');
  const searchPlaceholder = t('searchPlaceholder');
  const noMatchingMessage = t('noMatching');
  const allSelectedMessage = t('allSelected');
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  /**
   * Filter available tags based on search query and exclude already selected.
   */
  const filteredTags = availableTags.filter(
    (tag) =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Handle click outside to close dropdown.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Focus search input when dropdown opens.
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Add a tag to the selection.
   */
  const handleAddTag = useCallback(
    (tag: string) => {
      if (!selectedTags.includes(tag)) {
        onSelectionChange([...selectedTags, tag]);
      }
      setSearchQuery('');
      setIsOpen(false);
    },
    [selectedTags, onSelectionChange]
  );

  /**
   * Remove a tag from the selection.
   */
  const handleRemoveTag = useCallback(
    (tag: string) => {
      onSelectionChange(selectedTags.filter((t) => t !== tag));
    },
    [selectedTags, onSelectionChange]
  );

  /**
   * Handle keyboard events in the search input.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      } else if (e.key === 'Enter' && filteredTags.length > 0) {
        e.preventDefault();
        handleAddTag(filteredTags[0]);
      }
    },
    [filteredTags, handleAddTag]
  );

  /**
   * Toggle dropdown visibility.
   */
  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [disabled, isOpen]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      {/* Section Label */}
      <p className="text-sm font-medium text-gray-700">{resolvedLabel}</p>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                className={cn(
                  'p-0.5 hover:bg-blue-200 rounded-full transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
                aria-label={t('removeTag', { tag })}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Tags Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
            'min-h-[44px]', // Touch target
            'border border-gray-300 bg-white hover:bg-gray-50',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            'touch-manipulation [-webkit-tap-highlight-color:transparent]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Plus className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">{resolvedPlaceholder}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 ml-auto transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            className={cn(
              'absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200',
              'max-h-60 overflow-hidden'
            )}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-md',
                  'border border-gray-200 focus:border-blue-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              />
            </div>

            {/* Tag List */}
            <div className="max-h-44 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  {searchQuery
                    ? noMatchingMessage
                    : availableTags.length === 0
                    ? resolvedNoTagsMessage
                    : allSelectedMessage}
                </div>
              ) : (
                filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => handleAddTag(tag)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                      'min-h-[44px]', // Touch target
                      'hover:bg-blue-50 focus:bg-blue-50 transition-colors',
                      'focus:outline-none'
                    )}
                  >
                    <Plus className="h-4 w-4 text-gray-400" />
                    {tag}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TagFilter;
