'use client';

/**
 * InlineEdit Component
 *
 * A reusable click-to-edit text field with keyboard navigation,
 * loading states, and error handling.
 *
 * Features:
 * - Display mode with click-to-edit trigger
 * - Edit mode with auto-focus input
 * - Keyboard navigation (Enter to save, Escape to cancel)
 * - Loading state with spinner during save
 * - Error state with validation messages
 * - Blur-to-save behavior
 * - Full accessibility compliance (ARIA, keyboard-only operation)
 *
 * @module ItemManager/components/shared/InlineEdit
 * @lastModified 2026-01-03 (REQ-089 - Mobile touch target optimization)
 */

import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
import { Loader2, AlertCircle, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * State machine for InlineEdit component
 */
export type InlineEditState = 'display' | 'editing' | 'saving' | 'error';

/**
 * Props for the InlineEdit component
 */
export interface InlineEditProps {
  /** Current text value */
  value: string;

  /** Save callback - called with new value on save */
  onSave: (newValue: string) => Promise<void>;

  /** Optional cancel callback - called when user cancels edit */
  onCancel?: () => void;

  /** Placeholder text shown when value is empty */
  placeholder?: string;

  /** Disabled state - prevents interaction */
  disabled?: boolean;

  /** Maximum character length */
  maxLength?: number;

  /** Minimum character length */
  minLength?: number;

  /** Custom validation function - returns error message or null */
  validate?: (value: string) => string | null;

  /** Container CSS classes */
  className?: string;

  /** Display mode CSS classes */
  displayClassName?: string;

  /** Input field CSS classes */
  inputClassName?: string;

  /** Accessible label for the field */
  ariaLabel?: string;

  /** Trim whitespace before save (default: true) */
  trimOnSave?: boolean;

  /** Input type (default: 'text') */
  inputType?: 'text' | 'email' | 'url';

  /** Allow saving empty values (default: false) */
  allowEmpty?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function InlineEdit({
  value,
  onSave,
  onCancel,
  placeholder = 'Click to edit...',
  disabled = false,
  maxLength,
  minLength,
  validate,
  className,
  displayClassName,
  inputClassName,
  ariaLabel,
  trimOnSave = true,
  inputType = 'text',
  allowEmpty = false,
}: InlineEditProps) {
  const tLoading = useTranslations('common.loading');

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLButtonElement>(null);
  const isSavingRef = useRef(false);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [status, setStatus] = useState<InlineEditState>('display');
  const [editValue, setEditValue] = useState(value);
  const [originalValue, setOriginalValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // IDs for accessibility
  // ---------------------------------------------------------------------------

  const componentId = useId();
  const errorId = `${componentId}-error`;
  const inputId = `${componentId}-input`;

  // ---------------------------------------------------------------------------
  // Sync value prop changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (status === 'display') {
      setEditValue(value);
    }
  }, [value, status]);

  // ---------------------------------------------------------------------------
  // Auto-focus input when entering edit mode
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (status === 'editing' && inputRef.current) {
      inputRef.current.focus();
      // Position cursor at end of text
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [status]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validateValue = useCallback((valueToValidate: string): string | null => {
    const trimmed = trimOnSave ? valueToValidate.trim() : valueToValidate;

    // Empty check
    if (!allowEmpty && !trimmed) {
      return 'Value cannot be empty';
    }

    // Min length
    if (minLength && trimmed.length < minLength) {
      return `Minimum ${minLength} characters required`;
    }

    // Max length (belt and suspenders - input already enforces)
    if (maxLength && trimmed.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`;
    }

    // Custom validation
    if (validate) {
      return validate(trimmed);
    }

    return null;
  }, [trimOnSave, allowEmpty, minLength, maxLength, validate]);

  // ---------------------------------------------------------------------------
  // Enter Edit Mode
  // ---------------------------------------------------------------------------

  const enterEditMode = useCallback(() => {
    if (disabled) return;

    setStatus('editing');
    setEditValue(value);
    setOriginalValue(value);
    setErrorMessage(null);
  }, [disabled, value]);

  // ---------------------------------------------------------------------------
  // Cancel Edit
  // ---------------------------------------------------------------------------

  const handleCancel = useCallback(() => {
    setEditValue(originalValue);
    setStatus('display');
    setErrorMessage(null);
    onCancel?.();
    // Return focus to display element
    setTimeout(() => displayRef.current?.focus(), 0);
  }, [originalValue, onCancel]);

  // ---------------------------------------------------------------------------
  // Save Logic
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    // Prevent double-save
    if (isSavingRef.current) return;

    const trimmed = trimOnSave ? editValue.trim() : editValue;

    // Skip save if value unchanged
    if (trimmed === value) {
      setStatus('display');
      setTimeout(() => displayRef.current?.focus(), 0);
      return;
    }

    // Validate
    const validationError = validateValue(editValue);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      return;
    }

    // Start saving
    isSavingRef.current = true;

    try {
      setStatus('saving');
      await onSave(trimmed);
      setStatus('display');
      setErrorMessage(null);
      setTimeout(() => displayRef.current?.focus(), 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      setErrorMessage(message);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [editValue, value, trimOnSave, validateValue, onSave]);

  // ---------------------------------------------------------------------------
  // Input Change Handler
  // ---------------------------------------------------------------------------

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    // Clear error when user starts typing after error
    if (status === 'error') {
      setStatus('editing');
      setErrorMessage(null);
    }
  }, [status]);

  // ---------------------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------------------

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  }, [handleCancel, handleSave]);

  // ---------------------------------------------------------------------------
  // Display Mode Keyboard Handler
  // ---------------------------------------------------------------------------

  const handleDisplayKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enterEditMode();
    }
  }, [enterEditMode]);

  // ---------------------------------------------------------------------------
  // Blur Handler
  // ---------------------------------------------------------------------------

  const handleBlur = useCallback(() => {
    // Don't save if already saving or in error state needing attention
    if (status === 'editing' && !isSavingRef.current) {
      handleSave();
    }
  }, [status, handleSave]);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  const hasError = (status === 'error') && errorMessage;
  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const containerStyles = cn(
    'relative',
    className
  );

  const displayStyles = cn(
    'cursor-pointer rounded px-2 py-1',
    'hover:bg-gray-100 active:bg-gray-200 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    'group inline-flex items-center gap-1.5 w-full text-left',
    // 48px minimum touch target on mobile, 40px on desktop
    'min-h-[48px] md:min-h-[40px]',
    'touch-manipulation [-webkit-tap-highlight-color:transparent]',
    disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
    isPlaceholder && 'text-gray-400 italic',
    displayClassName
  );

  const inputStyles = cn(
    'w-full px-3 py-2 border rounded-lg transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    // 48px minimum touch target on mobile, 40px on desktop
    'min-h-[48px] md:min-h-[40px]',
    hasError
      ? 'border-red-300 bg-red-50 focus:ring-red-500'
      : 'border-gray-300 hover:border-gray-400',
    inputClassName
  );

  const loadingInputStyles = cn(
    inputStyles,
    'opacity-75 cursor-not-allowed bg-gray-50 pr-10'
  );

  // ---------------------------------------------------------------------------
  // Render Display Mode
  // ---------------------------------------------------------------------------

  if (status === 'display') {
    return (
      <div className={containerStyles}>
        <button
          ref={displayRef}
          type="button"
          onClick={enterEditMode}
          onKeyDown={handleDisplayKeyDown}
          disabled={disabled}
          aria-label={`${ariaLabel || 'Text field'}, click to edit`}
          className={displayStyles}
        >
          <span className="flex-1 truncate">{displayValue}</span>
          <Pencil
            className={cn(
              'w-4 h-4 text-gray-400 flex-shrink-0',
              'opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity',
              disabled && 'hidden'
            )}
            aria-hidden="true"
          />
        </button>
        {/* Screen reader announcement for saved state */}
        <span className="sr-only" aria-live="polite">
          {value && `Current value: ${value}`}
        </span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Saving State
  // ---------------------------------------------------------------------------

  if (status === 'saving') {
    return (
      <div className={containerStyles}>
        <div className="relative">
          <input
            type={inputType}
            value={editValue}
            disabled
            aria-label={ariaLabel || 'Editable text field'}
            className={loadingInputStyles}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" aria-hidden="true" />
          </div>
        </div>
        <span className="sr-only" aria-live="polite">{tLoading('status.saving')}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Editing / Error State
  // ---------------------------------------------------------------------------

  return (
    <div className={containerStyles}>
      <input
        ref={inputRef}
        id={inputId}
        type={inputType}
        value={editValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={ariaLabel || 'Editable text field'}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? errorId : undefined}
        aria-errormessage={hasError ? errorId : undefined}
        className={inputStyles}
      />

      {/* Error Message */}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 mt-1 text-sm text-red-600"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      {/* Screen reader status announcements */}
      <span className="sr-only" aria-live="polite">
        {status === 'error' && errorMessage}
      </span>
    </div>
  );
}

export default InlineEdit;
