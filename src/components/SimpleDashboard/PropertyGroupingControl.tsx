// src/components/SimpleDashboard/PropertyGroupingControl.tsx
// REQ-136: Property Grouping Control Component
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { ChevronDown } from 'lucide-react';

/**
 * Grouping options for property organization
 */
export type GroupingOption = 'none' | 'location' | 'itemCount';

/**
 * Props for PropertyGroupingControl component
 */
export interface PropertyGroupingControlProps {
  /** Current grouping option */
  value: GroupingOption;
  /** Callback when grouping option changes */
  onGroupChange: (option: GroupingOption) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Configuration for grouping options
 */
const GROUPING_OPTIONS: { value: GroupingOption; label: string }[] = [
  { value: 'none', label: 'No Grouping' },
  { value: 'location', label: 'By Location' },
  { value: 'itemCount', label: 'By Item Count' },
];

/**
 * Dropdown control for grouping properties
 * Visible at 'multiple'+ tiers (6+ properties)
 *
 * Features:
 * - Three grouping options: None, By Location, By Item Count
 * - Native select element styled with Airbnb DLS
 * - Disabled state support
 * - Full keyboard accessibility
 * - 48px touch target
 *
 * @param value - Current grouping option
 * @param onGroupChange - Callback when option changes
 * @param disabled - Whether control is disabled
 * @param className - Optional additional CSS classes
 */
export function PropertyGroupingControl({
  value,
  onGroupChange,
  disabled = false,
  className = '',
}: PropertyGroupingControlProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onGroupChange(e.target.value as GroupingOption);
  };

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor="property-grouping"
        className="block text-sm font-medium text-[#222222] mb-2"
      >
        Group by
      </label>
      <div className="relative">
        <select
          id="property-grouping"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full min-h-[48px] pl-4 pr-10 py-3 text-base text-[#222222] bg-white border border-[#DDDDDD] rounded-lg appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Property grouping option"
        >
          {GROUPING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-[#717171]" />
        </div>
      </div>
    </div>
  );
}

export default PropertyGroupingControl;
