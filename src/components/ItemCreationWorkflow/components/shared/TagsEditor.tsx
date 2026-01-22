'use client';

/**
 * TagsEditor Component
 *
 * Displays and allows editing of tags for item categorization.
 * Tags are auto-generated based on workflow selections (room, item type, purpose)
 * and can be manually edited by users.
 *
 * Features:
 * - Display selected tags as removable chips
 * - Add tags from dropdown of available options
 * - Tag count badge showing current/max
 * - Keyboard navigation support
 * - Accessibility features (ARIA labels)
 *
 * @example Basic usage
 * ```tsx
 * <TagsEditor
 *   selectedTags={['kitchen', 'appliance', 'instructions']}
 *   onTagsChange={(tags) => console.log('Tags updated:', tags)}
 *   maxTags={10}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/TagsEditor
 * @created 2026-01-10 (REQ-177 Intelligent Pre-filling)
 * @lastModified 2026-01-22 (REQ-E02-066 i18n translations)
 */

import { useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TranslationFn } from '@/types/i18n';
import { cn } from '@/lib/utils';
import { AVAILABLE_TAGS, TAG_LABELS, type TagTypeConst } from '../../utils/constants';

/**
 * Props for the TagsEditor component.
 */
export interface TagsEditorProps {
  /** Currently selected tags */
  selectedTags: string[];
  /** Callback when tags change (add or remove) */
  onTagsChange: (tags: string[]) => void;
  /** Disable editing */
  disabled?: boolean;
  /** Maximum number of tags allowed (default: 10) */
  maxTags?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for individual tag chip.
 */
interface TagChipProps {
  /** Tag identifier */
  tag: string;
  /** Tag display label */
  label: string;
  /** Callback when remove button clicked */
  onRemove: () => void;
  /** Disable remove button */
  disabled?: boolean;
  /** REQ-E02-066: Translation function for i18n */
  t: TranslationFn;
}

/**
 * Individual tag chip with remove button.
 */
const TagChip: React.FC<TagChipProps> = ({ tag, label, onRemove, disabled, t }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full',
        'bg-gray-100 text-gray-700 text-sm',
        'min-h-[32px]',
        !disabled && 'hover:bg-gray-200',
        'transition-colors duration-150'
      )}
    >
      <span>{label}</span>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('removeTagAriaLabel', { tag: label })}
          className={cn(
            'ml-1 rounded-full p-0.5',
            'hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
            'transition-colors duration-150'
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

/**
 * TagsEditor component for displaying and editing tags.
 *
 * Displays selected tags as chips with remove buttons.
 * Allows adding new tags from a dropdown of available options.
 * Shows tag count badge and respects maxTags limit.
 */
export const TagsEditor: React.FC<TagsEditorProps> = ({
  selectedTags,
  onTagsChange,
  disabled = false,
  maxTags = 10,
  className,
}) => {
  // REQ-E02-066: Translation hook for tags editor
  const t = useTranslations('workflow.shared.tagsEditor');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get available tags (not already selected)
  const availableTags = AVAILABLE_TAGS.filter(
    (tag) => !selectedTags.includes(tag)
  );

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
      onTagsChange(newTags);
    },
    [selectedTags, onTagsChange]
  );

  const handleAddTag = useCallback(
    (tagToAdd: string) => {
      if (selectedTags.length < maxTags && !selectedTags.includes(tagToAdd)) {
        onTagsChange([...selectedTags, tagToAdd]);
      }
      setIsDropdownOpen(false);
    },
    [selectedTags, maxTags, onTagsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, tag: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAddTag(tag);
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    },
    [handleAddTag]
  );

  const canAddMore = selectedTags.length < maxTags;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Tag chips display */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            label={TAG_LABELS[tag as TagTypeConst] || tag}
            onRemove={() => handleRemoveTag(tag)}
            disabled={disabled}
            t={t}
          />
        ))}

        {/* Count badge */}
        <div className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500">
          {selectedTags.length} / {maxTags}
        </div>
      </div>

      {/* Add tag dropdown */}
      {!disabled && canAddMore && availableTags.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'border border-gray-300 bg-white text-gray-700 text-sm',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
              'transition-colors duration-150',
              'min-h-[32px]'
            )}
            aria-label={t('addTag')}
            aria-expanded={isDropdownOpen}
          >
            <Plus className="w-4 h-4" />
            <span>{t('addTag')}</span>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* Dropdown content */}
              <div
                className={cn(
                  'absolute left-0 mt-1 z-20',
                  'w-64 max-h-64 overflow-y-auto',
                  'bg-white border border-gray-200 rounded-lg shadow-lg',
                  'py-1'
                )}
                role="menu"
                aria-label={t('availableTags')}
              >
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    onKeyDown={(e) => handleKeyDown(e, tag)}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm text-gray-700',
                      'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                      'transition-colors duration-150'
                    )}
                    role="menuitem"
                  >
                    {TAG_LABELS[tag as TagTypeConst] || tag}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TagsEditor;
