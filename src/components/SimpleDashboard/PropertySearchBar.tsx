// src/components/SimpleDashboard/PropertySearchBar.tsx
// REQ-136: Property Search Bar Component for Dashboard
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Props for PropertySearchBar component
 */
export interface PropertySearchBarProps {
  /** Callback when search query changes (debounced) */
  onSearch: (query: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

/**
 * Custom hook for debouncing a value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Search input for property filtering
 * Visible at 'many' tier (16+ properties)
 *
 * Features:
 * - Search icon prefix
 * - Debounced onChange handler (default 300ms)
 * - Clear button when input has value
 * - Keyboard accessible
 * - Airbnb Design Language System styling
 *
 * @param onSearch - Callback when search query changes
 * @param placeholder - Placeholder text (default: "Search properties...")
 * @param className - Optional additional CSS classes
 * @param debounceMs - Debounce delay in ms (default: 300)
 */
export function PropertySearchBar({
  onSearch,
  placeholder = 'Search properties...',
  className = '',
  debounceMs = 300,
}: PropertySearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search value
  const debouncedValue = useDebounce(inputValue, debounceMs);

  // Call onSearch when debounced value changes
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  // Handle clear button click
  const handleClear = useCallback(() => {
    setInputValue('');
    // Focus back to input after clearing
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear on Escape
    if (e.key === 'Escape') {
      setInputValue('');
      inputRef.current?.blur();
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-5 h-5 text-[#717171]" />
      </div>

      {/* Search input */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[48px] pl-10 pr-10 py-3 text-base text-[#222222] placeholder-[#717171] bg-white border border-[#DDDDDD] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent"
        aria-label="Search properties"
      />

      {/* Clear button - only show when value exists */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#F7F7F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]"
          aria-label="Clear search"
        >
          <X className="w-4 h-4 text-[#717171]" />
        </button>
      )}
    </div>
  );
}

export default PropertySearchBar;
