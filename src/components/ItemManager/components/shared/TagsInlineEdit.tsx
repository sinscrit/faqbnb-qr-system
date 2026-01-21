'use client';

/**
 * TagsInlineEdit Component
 *
 * An inline tag editing component that allows users to add, remove, and
 * manage tags directly within the ItemCard and ItemRow components.
 *
 * Features:
 * - Click-to-edit behavior with display/editing/saving states
 * - Add tags via Enter key, comma, or clicking suggestions
 * - Remove tags via X button or Backspace on empty input
 * - Autocomplete suggestions from existing tags
 * - Keyboard navigation for suggestions (Arrow keys, Enter, Escape)
 * - Click-outside to save, Escape to cancel
 * - Loading state during save operations
 * - Error handling with visual feedback
 * - Full accessibility compliance (ARIA, keyboard-only operation)
 * - Event propagation control to prevent parent actions
 *
 * @module ItemManager/components/shared/TagsInlineEdit
 * @lastModified 2026-01-03 (REQ-088 Tasks 2-6)
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
} from 'react';
import { Plus, Tag, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TagChip } from './TagChip';
import { METADATA_CONSTRAINTS, SUGGESTED_TAGS } from '@/components/ItemCapture/utils/constants';

// =============================================================================
// Types
// =============================================================================

/**
 * State machine for TagsInlineEdit component
 */
export type TagsInlineEditState = 'display' | 'editing' | 'saving';

/**
 * Props for the TagsInlineEdit component
 */
export interface TagsInlineEditProps {
  /** Current array of tags */
  tags: string[];
  /** Async callback when tags are saved */
  onSave: (newTags: string[]) => Promise<void>;
  /** Optional callback when editing is cancelled */
  onCancel?: () => void;
  /** Existing tags from other items for suggestions */
  existingTags?: string[];
  /** Maximum number of tags allowed (default: 10) */
  maxTags?: number;
  /** Maximum length per tag (default: 30) */
  maxTagLength?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text when no tags */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for the component */
  ariaLabel?: string;
}

// =============================================================================
// Component
// =============================================================================

export function TagsInlineEdit({
  tags,
  onSave,
  onCancel,
  existingTags = [],
  maxTags = METADATA_CONSTRAINTS.maxTags,
  maxTagLength = METADATA_CONSTRAINTS.tag.maxLength,
  disabled = false,
  placeholder = 'Add tags...',
  className,
  ariaLabel,
}: TagsInlineEditProps) {
  const tLoading = useTranslations('common.loading');

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(false);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [status, setStatus] = useState<TagsInlineEditState>('display');
  const [editTags, setEditTags] = useState<string[]>(tags);
  const [originalTags, setOriginalTags] = useState<string[]>(tags);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  // ---------------------------------------------------------------------------
  // IDs for accessibility
  // ---------------------------------------------------------------------------

  const componentId = useId();
  const suggestionsId = `${componentId}-suggestions`;
  const inputId = `${componentId}-input`;
  const errorId = `${componentId}-error`;
  const liveRegionId = `${componentId}-live`;

  // ---------------------------------------------------------------------------
  // Sync tags prop changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (status === 'display') {
      setEditTags(tags);
    }
  }, [tags, status]);

  // ---------------------------------------------------------------------------
  // Auto-focus input when entering edit mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (status === 'editing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  // ---------------------------------------------------------------------------
  // Click-outside detection
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        status === 'editing' &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    if (status === 'editing') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [status, editTags, originalTags]);

  // ---------------------------------------------------------------------------
  // Computed: Filtered Suggestions
  // ---------------------------------------------------------------------------

  const filteredSuggestions = useMemo(() => {
    // Combine suggested tags and existing tags
    const allSuggestions = new Set([...SUGGESTED_TAGS, ...existingTags]);
    const currentTagsLower = new Set(editTags.map(t => t.toLowerCase()));

    // Filter out tags already selected
    let suggestions = Array.from(allSuggestions).filter(
      tag => !currentTagsLower.has(tag.toLowerCase())
    );

    // Filter by input if provided
    if (inputValue.trim()) {
      const searchLower = inputValue.toLowerCase();
      suggestions = suggestions.filter(tag =>
        tag.toLowerCase().includes(searchLower)
      );
    }

    // Sort alphabetically and limit to 10
    return suggestions
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .slice(0, 10);
  }, [existingTags, editTags, inputValue]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validateTag = useCallback((tag: string): string | null => {
    const trimmed = tag.trim();

    // Check for empty
    if (!trimmed) {
      return 'Tag cannot be empty';
    }

    // Check length
    if (trimmed.length > maxTagLength) {
      return `Tag must be ${maxTagLength} characters or less`;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = editTags.some(
      t => t.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      return 'Tag already exists';
    }

    // Check max count
    if (editTags.length >= maxTags) {
      return `Maximum ${maxTags} tags allowed`;
    }

    return null;
  }, [editTags, maxTagLength, maxTags]);

  // ---------------------------------------------------------------------------
  // Enter Edit Mode
  // ---------------------------------------------------------------------------

  const enterEditMode = useCallback(() => {
    if (disabled) return;

    setStatus('editing');
    setEditTags(tags);
    setOriginalTags(tags);
    setInputValue('');
    setErrorMessage(null);
    setShowSuggestions(true);
    setFocusedSuggestionIndex(-1);
  }, [disabled, tags]);

  // ---------------------------------------------------------------------------
  // Add Tag
  // ---------------------------------------------------------------------------

  const handleAddTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    const error = validateTag(trimmed);

    if (error) {
      setErrorMessage(error);
      // Clear error after a short delay
      setTimeout(() => setErrorMessage(null), 2000);
      return false;
    }

    setEditTags(prev => [...prev, trimmed]);
    setInputValue('');
    setErrorMessage(null);
    setFocusedSuggestionIndex(-1);
    return true;
  }, [validateTag]);

  // ---------------------------------------------------------------------------
  // Remove Tag
  // ---------------------------------------------------------------------------

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setEditTags(prev => prev.filter(t => t !== tagToRemove));
    // Keep focus on input
    inputRef.current?.focus();
  }, []);

  // ---------------------------------------------------------------------------
  // Handle Save
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    // Prevent double-save
    if (isSavingRef.current || status === 'saving') return;

    // Add any pending input as tag before saving
    if (inputValue.trim()) {
      const success = handleAddTag(inputValue);
      if (!success) {
        return; // Don't save if pending tag is invalid
      }
    }

    // Check if tags actually changed
    const originalSet = new Set(originalTags);
    const editSet = new Set(editTags);
    const hasChanges =
      originalTags.length !== editTags.length ||
      originalTags.some(t => !editSet.has(t)) ||
      editTags.some(t => !originalSet.has(t));

    if (!hasChanges) {
      setStatus('display');
      setShowSuggestions(false);
      return;
    }

    isSavingRef.current = true;
    setStatus('saving');

    try {
      await onSave(editTags);
      setOriginalTags(editTags);
      setStatus('display');
      setErrorMessage(null);
      setShowSuggestions(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save tags';
      setErrorMessage(message);
      setStatus('editing');
    } finally {
      isSavingRef.current = false;
    }
  }, [editTags, originalTags, inputValue, onSave, handleAddTag, status]);

  // ---------------------------------------------------------------------------
  // Handle Cancel
  // ---------------------------------------------------------------------------

  const handleCancel = useCallback(() => {
    setEditTags(originalTags);
    setInputValue('');
    setErrorMessage(null);
    setStatus('display');
    setShowSuggestions(false);
    onCancel?.();
  }, [originalTags, onCancel]);

  // ---------------------------------------------------------------------------
  // Input Change Handler
  // ---------------------------------------------------------------------------

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setErrorMessage(null);
    setShowSuggestions(true);
    setFocusedSuggestionIndex(-1);
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------------------

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape - cancel editing
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
      return;
    }

    // Tab - add current input if any, then let natural tab happen (will trigger blur/save)
    if (e.key === 'Tab') {
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
      // Don't prevent default - let tab proceed naturally
      return;
    }

    // Arrow down - navigate suggestions
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
        setFocusedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    // Arrow up - navigate suggestions
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
        setFocusedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
      return;
    }

    // Enter - add focused suggestion or current input
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && filteredSuggestions[focusedSuggestionIndex]) {
        handleAddTag(filteredSuggestions[focusedSuggestionIndex]);
      } else if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
      return;
    }

    // Comma - add current input as tag
    if (e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
      return;
    }

    // Backspace on empty input - remove last tag
    if (e.key === 'Backspace' && !inputValue && editTags.length > 0) {
      e.preventDefault();
      const lastTag = editTags[editTags.length - 1];
      handleRemoveTag(lastTag);
      return;
    }
  }, [
    inputValue,
    editTags,
    filteredSuggestions,
    focusedSuggestionIndex,
    handleAddTag,
    handleRemoveTag,
    handleCancel,
  ]);

  // ---------------------------------------------------------------------------
  // Input Focus Handler
  // ---------------------------------------------------------------------------

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Suggestion Click Handler
  // ---------------------------------------------------------------------------

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleAddTag(suggestion);
    inputRef.current?.focus();
  }, [handleAddTag]);

  // ---------------------------------------------------------------------------
  // Display Click Handler
  // ---------------------------------------------------------------------------

  const handleDisplayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    enterEditMode();
  }, [enterEditMode]);

  // ---------------------------------------------------------------------------
  // Display Keyboard Handler
  // ---------------------------------------------------------------------------

  const handleDisplayKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      enterEditMode();
    }
  }, [enterEditMode]);

  // ---------------------------------------------------------------------------
  // Container Click Handler (for event propagation control)
  // ---------------------------------------------------------------------------

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  const hasError = !!errorMessage;
  const isAtMaxTags = editTags.length >= maxTags;
  const displayTags = status === 'display' ? tags : editTags;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const containerStyles = cn(
    'relative',
    className
  );

  const displayStyles = cn(
    'cursor-pointer rounded-lg px-2 py-1.5 min-h-[40px]',
    'hover:bg-gray-100 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    'group flex flex-wrap items-center gap-1.5',
    disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
  );

  const editContainerStyles = cn(
    'rounded-lg border-2 px-2 py-1.5 min-h-[40px]',
    'flex flex-wrap items-center gap-1.5',
    'transition-colors',
    hasError
      ? 'border-red-300 bg-red-50'
      : 'border-blue-500 bg-white'
  );

  const inputStyles = cn(
    'flex-1 min-w-[80px] outline-none bg-transparent text-sm',
    'placeholder:text-gray-400',
    isAtMaxTags && 'cursor-not-allowed'
  );

  const suggestionsStyles = cn(
    'absolute z-50 left-0 right-0 mt-1',
    'bg-white border border-gray-200 rounded-lg shadow-lg',
    'max-h-[200px] overflow-y-auto'
  );

  // ---------------------------------------------------------------------------
  // Render Display Mode
  // ---------------------------------------------------------------------------

  if (status === 'display') {
    return (
      <div
        ref={containerRef}
        className={containerStyles}
        onClick={handleContainerClick}
      >
        <button
          type="button"
          onClick={handleDisplayClick}
          onKeyDown={handleDisplayKeyDown}
          disabled={disabled}
          aria-label={ariaLabel || 'Edit tags'}
          className={displayStyles}
        >
          {displayTags.length > 0 ? (
            <>
              {displayTags.slice(0, 3).map((tag) => (
                <TagChip key={tag} tag={tag} variant="outline" />
              ))}
              {displayTags.length > 3 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{displayTags.length - 3} more
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-gray-400 italic">
              <Tag className="w-4 h-4" aria-hidden="true" />
              {placeholder}
            </span>
          )}
          <Plus
            className={cn(
              'w-4 h-4 text-gray-400 flex-shrink-0 ml-auto',
              'opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity',
              disabled && 'hidden'
            )}
            aria-hidden="true"
          />
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Saving State
  // ---------------------------------------------------------------------------

  if (status === 'saving') {
    return (
      <div
        ref={containerRef}
        className={containerStyles}
        onClick={handleContainerClick}
      >
        <div className={cn(editContainerStyles, 'opacity-75')}>
          {editTags.map((tag) => (
            <TagChip key={tag} tag={tag} variant="default" disabled />
          ))}
          <div className="flex items-center gap-1 text-gray-400 ml-auto">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span className="text-xs">{tLoading('status.saving')}</span>
          </div>
        </div>
        <span id={liveRegionId} className="sr-only" aria-live="polite">
          {tLoading('status.saving')}
        </span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Editing State
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className={containerStyles}
      onClick={handleContainerClick}
      role="group"
      aria-label={ariaLabel || 'Edit tags'}
    >
      <div className={editContainerStyles}>
        {/* Existing Tags as Removable Chips */}
        {editTags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            variant="default"
            removable
            onRemove={() => handleRemoveTag(tag)}
          />
        ))}

        {/* Input Field */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          placeholder={isAtMaxTags ? 'Max tags reached' : 'Type to add...'}
          disabled={isAtMaxTags}
          maxLength={maxTagLength}
          className={inputStyles}
          aria-label="Add new tag"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && filteredSuggestions.length > 0}
          aria-controls={suggestionsId}
          aria-activedescendant={
            focusedSuggestionIndex >= 0
              ? `${suggestionsId}-${focusedSuggestionIndex}`
              : undefined
          }
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? errorId : undefined}
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && !isAtMaxTags && (
        <ul
          id={suggestionsId}
          role="listbox"
          aria-label="Tag suggestions"
          className={suggestionsStyles}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`${suggestionsId}-${index}`}
              role="option"
              aria-selected={focusedSuggestionIndex === index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 cursor-pointer text-sm',
                'hover:bg-gray-50 transition-colors',
                'min-h-[44px]', // Touch target
                focusedSuggestionIndex === index && 'bg-blue-50 text-blue-800'
              )}
            >
              <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* Error Message */}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 mt-1 text-xs text-red-600"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      {/* Screen reader live region for announcements */}
      <span id={liveRegionId} className="sr-only" aria-live="polite">
        {hasError && errorMessage}
        {editTags.length} tags selected
      </span>
    </div>
  );
}

export default TagsInlineEdit;
