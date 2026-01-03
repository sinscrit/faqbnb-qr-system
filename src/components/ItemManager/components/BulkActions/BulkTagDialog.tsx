'use client';

/**
 * BulkTagDialog Component
 *
 * Modal dialog for adding or removing tags from multiple selected items.
 * Provides tag input with autocomplete for add mode and checkbox list for remove mode.
 *
 * @module ItemManager/components/BulkActions/BulkTagDialog
 * @see docs/REQ-072-implement-bulktagdialog-detailed.md
 * @lastModified 2026-01-03 (REQ-072 Task 3.5.1 - Initial implementation)
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useId,
} from 'react';
import { X, Tag, Minus, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRecord } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Constants
// =============================================================================

const MAX_PREVIEW_ITEMS = 5;
const MAX_TAG_LENGTH = 30;
const MAX_TAGS_TO_ADD = 10;
const MAX_SUGGESTIONS = 8;

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the BulkTagDialog component.
 */
export interface BulkTagDialogProps {
  /** Dialog mode - determines add or remove operation */
  mode: 'add' | 'remove';
  /** Array of selected items to apply tag operation to */
  selectedItems: ItemRecord[];
  /** All existing tags in the system for autocomplete suggestions */
  existingTags: string[];
  /** Callback when tags are confirmed */
  onConfirm: (tags: string[]) => void;
  /** Callback when dialog is cancelled/closed */
  onCancel: () => void;
  /** Loading state during operation */
  loading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for the internal ItemPreviewList component.
 */
interface ItemPreviewListProps {
  items: ItemRecord[];
  maxDisplay?: number;
}

// =============================================================================
// Internal Components
// =============================================================================

/**
 * ItemPreviewList - Shows affected items preview
 */
function ItemPreviewList({ items, maxDisplay = MAX_PREVIEW_ITEMS }: ItemPreviewListProps) {
  const displayItems = items.slice(0, maxDisplay);
  const remainingCount = items.length - maxDisplay;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Items to be updated:</p>
      <ul className="max-h-32 overflow-y-auto space-y-1">
        {displayItems.map((item) => (
          <li key={item.id} className="flex items-center text-sm text-gray-600">
            <span className="mr-2 text-gray-400">•</span>
            <span className="truncate">{item.title}</span>
          </li>
        ))}
      </ul>
      {remainingCount > 0 && (
        <p className="text-sm text-gray-500 italic mt-1">
          (and {remainingCount} more...)
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * BulkTagDialog Component
 *
 * Modal dialog for bulk tag operations on selected items.
 * Supports both adding new tags and removing existing tags.
 */
export function BulkTagDialog({
  mode,
  selectedItems,
  existingTags,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: BulkTagDialogProps) {
  // ---------------------------------------------------------------------------
  // IDs for accessibility
  // ---------------------------------------------------------------------------
  const uniqueId = useId();
  const titleId = `bulk-tag-title-${uniqueId}`;

  // ---------------------------------------------------------------------------
  // Add Mode State
  // ---------------------------------------------------------------------------
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Remove Mode State
  // ---------------------------------------------------------------------------
  const [tagsToRemove, setTagsToRemove] = useState<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, loading]);

  // Focus input on mount for add mode
  useEffect(() => {
    if (mode === 'add' && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [mode]);

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  // Filtered suggestions for add mode
  const filteredSuggestions = useMemo(() => {
    const lowerInput = tagInputValue.toLowerCase();
    return existingTags
      .filter((tag) => {
        const lowerTag = tag.toLowerCase();
        return (
          !tagsToAdd.some((t) => t.toLowerCase() === lowerTag) &&
          lowerTag.includes(lowerInput)
        );
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [existingTags, tagsToAdd, tagInputValue]);

  // All tags on selected items (for remove mode)
  const allTagsOnSelectedItems = useMemo(() => {
    const tagMap = new Map<string, number>();
    selectedItems.forEach((item) => {
      (item.tags || []).forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [selectedItems]);

  // Confirm button disabled state
  const confirmDisabled =
    mode === 'add' ? tagsToAdd.length === 0 : tagsToRemove.size === 0;

  // ---------------------------------------------------------------------------
  // Add Mode Handlers
  // ---------------------------------------------------------------------------

  const handleAddTag = useCallback(
    (tagToAdd?: string) => {
      const tag = (tagToAdd || tagInputValue).trim();
      if (!tag) return;

      // Check for case-insensitive duplicates
      if (tagsToAdd.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        setTagInputValue('');
        return;
      }

      // Check max tags limit
      if (tagsToAdd.length >= MAX_TAGS_TO_ADD) {
        return;
      }

      // Check max length
      if (tag.length > MAX_TAG_LENGTH) {
        return;
      }

      setTagsToAdd((prev) => [...prev, tag]);
      setTagInputValue('');
      tagInputRef.current?.focus();
    },
    [tagInputValue, tagsToAdd]
  );

  const handleRemoveTagFromList = useCallback((tagToRemove: string) => {
    setTagsToAdd((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && tagInputValue.trim()) {
        e.preventDefault();
        handleAddTag();
      } else if (e.key === 'Backspace' && !tagInputValue && tagsToAdd.length > 0) {
        // Remove last tag when backspace on empty input
        setTagsToAdd((prev) => prev.slice(0, -1));
      }
    },
    [tagInputValue, tagsToAdd, handleAddTag]
  );

  // ---------------------------------------------------------------------------
  // Remove Mode Handler
  // ---------------------------------------------------------------------------

  const handleToggleTagForRemoval = useCallback((tag: string) => {
    setTagsToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Confirm Handler
  // ---------------------------------------------------------------------------

  const handleConfirmClick = useCallback(() => {
    const tags = mode === 'add' ? tagsToAdd : Array.from(tagsToRemove);
    onConfirm(tags);
  }, [mode, tagsToAdd, tagsToRemove, onConfirm]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const itemCount = selectedItems.length;
  const tagCount = mode === 'add' ? tagsToAdd.length : tagsToRemove.size;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden',
          'flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {mode === 'add' ? (
              <div className="p-2 bg-blue-100 rounded-full">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
            ) : (
              <div className="p-2 bg-orange-100 rounded-full">
                <Minus className="h-5 w-5 text-orange-600" />
              </div>
            )}
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Add Tags' : 'Remove Tags'} from {itemCount} Item
              {itemCount !== 1 ? 's' : ''}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'p-2 rounded-full hover:bg-gray-100 transition-colors',
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'add' ? (
            <>
              {/* Add Mode: Tag Input with Pills */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Enter tags to add:
                </label>
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-2 p-2 border rounded-lg',
                    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
                  )}
                >
                  {/* Tag Pills */}
                  {tagsToAdd.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTagFromList(tag)}
                        className="p-0.5 hover:bg-blue-200 rounded-full"
                        aria-label={`Remove ${tag} tag`}
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  {/* Input Field */}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder={
                      tagsToAdd.length === 0
                        ? 'Type a tag and press Enter...'
                        : tagsToAdd.length >= MAX_TAGS_TO_ADD
                        ? `Max ${MAX_TAGS_TO_ADD} tags`
                        : ''
                    }
                    disabled={loading || tagsToAdd.length >= MAX_TAGS_TO_ADD}
                    className={cn(
                      'flex-1 min-w-[120px] outline-none text-sm',
                      'placeholder-gray-400',
                      loading && 'cursor-not-allowed'
                    )}
                    maxLength={MAX_TAG_LENGTH}
                  />
                </div>

                {/* Tag Suggestions */}
                {filteredSuggestions.length > 0 && tagsToAdd.length < MAX_TAGS_TO_ADD && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredSuggestions.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleAddTag(tag)}
                          disabled={loading}
                          className={cn(
                            'px-3 py-1 border rounded-full text-sm',
                            'hover:bg-gray-100 hover:border-gray-400 transition-colors',
                            loading && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Remove Mode: Checkbox List */}
              {allTagsOnSelectedItems.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No tags found on selected items.
                </p>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select tags to remove:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTagsOnSelectedItems.map(({ tag, count }) => {
                      const isSelected = tagsToRemove.has(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => handleToggleTagForRemoval(tag)}
                          disabled={loading}
                          className={cn(
                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
                            isSelected
                              ? 'bg-red-100 text-red-800 border-2 border-red-300'
                              : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200',
                            loading && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {/* Custom checkbox indicator */}
                          <span
                            className={cn(
                              'w-4 h-4 rounded flex items-center justify-center',
                              isSelected
                                ? 'bg-red-500'
                                : 'border border-gray-400'
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </span>
                          <span>{tag}</span>
                          <span className="text-xs opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Items Preview */}
          <ItemPreviewList items={selectedItems} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-white border border-gray-300 text-gray-700',
              'hover:bg-gray-50 transition-colors',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={loading || confirmDisabled}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium text-white',
              'flex items-center gap-2 transition-colors',
              mode === 'add'
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300',
              (loading || confirmDisabled) && 'cursor-not-allowed'
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'add' ? 'Add' : 'Remove'} {tagCount} Tag{tagCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkTagDialog;
