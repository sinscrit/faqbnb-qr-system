/**
 * SearchInput Component
 *
 * A responsive search input with debounced updates, clear button,
 * and keyboard shortcuts. Designed for the ItemManager toolbar.
 *
 * @module ItemManager/components/SearchInput
 * @see docs/prd/item-capture-manager-implementation-plan.md (Phase 2, Task 2.3)
 * @lastModified 2026-01-04 (REQ-064 - Initial implementation)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce, DEFAULT_DEBOUNCE_MS } from '../hooks/useDebounce';

// ============================================================================
// Types
// ============================================================================

export interface SearchInputProps {
  /** Current search query value (controlled) */
  value: string;
  /** Callback when search query changes (after debounce) */
  onChange: (query: string) => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the input element */
  inputClassName?: string;
  /** ID for the input element (for form labels) */
  id?: string;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  /** Callback when input is focused */
  onFocus?: () => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search items...',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  disabled = false,
  className,
  inputClassName,
  id,
  autoFocus = false,
  onFocus,
  onBlur,
}: SearchInputProps) {
  // Internal state for immediate UI feedback
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the local value
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Track if we need to emit changes (to avoid loops)
  const isInitialMount = useRef(true);

  // Sync external value to local state when prop changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Emit debounced changes to parent
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only emit if debounced value differs from external value
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  // Handle input change with immediate local update
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  // Clear the search input (Task 2.3.4)
  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange(''); // Immediate clear (bypass debounce)
    inputRef.current?.focus();
  }, [onChange]);

  // Handle keyboard shortcuts (Task 2.3.5)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (localValue) {
        // Clear if there's content
        handleClear();
      } else {
        // Blur if already empty
        inputRef.current?.blur();
      }
    }
  }, [localValue, handleClear]);

  const hasValue = localValue.length > 0;

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2",
          "w-5 h-5 text-gray-400",
          "pointer-events-none",
          disabled && "opacity-50"
        )}
        aria-hidden="true"
      />

      {/* Input Field */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          // Base styles
          "w-full text-sm bg-white",
          // Spacing for icons - 48px min height for touch targets on mobile
          "pl-10",
          hasValue && !disabled ? "pr-10" : "pr-4",
          "min-h-[48px] md:min-h-0 md:py-2",
          // Border and rounding
          "border border-gray-300 rounded-lg",
          // Placeholder
          "placeholder:text-gray-400",
          // Transitions
          "transition-colors duration-150",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          // Disabled state
          disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
          // Custom class
          inputClassName
        )}
        role="searchbox"
        aria-label={placeholder}
      />

      {/* Clear Button - only visible when has value and not disabled (Task 2.3.4) */}
      {hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          tabIndex={-1} // Skip in tab order, accessible via Escape key
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1.5 rounded-md",
            "text-gray-400 hover:text-gray-600",
            "hover:bg-gray-100",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            // Touch target - at least 24x24px with padding
            "min-w-[28px] min-h-[28px]"
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// Default export for compatibility
export default SearchInput;
