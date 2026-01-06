// src/components/SimpleDashboard/PropertySection.tsx
// REQ-130: PropertySection Component for Dashboard 2
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { ChevronRight, Home, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';

/**
 * Props for PropertyRow sub-component
 */
interface PropertyRowProps {
  /** Property data to display */
  property: Property;
  /** Callback when row is clicked */
  onClick: (property: Property) => void;
}

/**
 * Individual property row with click interaction
 * Displays property nickname and chevron icon
 */
function PropertyRow({ property, onClick }: PropertyRowProps) {
  const handleClick = () => onClick(property);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(property);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="w-full flex items-center justify-between p-4 bg-white border-b border-[#DDDDDD] last:border-b-0 hover:bg-[#F7F7F7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-inset"
      aria-label={`Edit property: ${property.nickname}`}
    >
      <span className="text-[#222222] font-medium">
        {property.nickname}
      </span>
      <ChevronRight className="w-5 h-5 text-[#717171]" />
    </button>
  );
}

/**
 * Loading skeleton for PropertySection
 * Shows shimmer animation while property data loads
 */
function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header skeleton */}
      <div className="p-4 border-b border-[#DDDDDD]">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Property row skeletons */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border-b border-[#DDDDDD] last:border-b-0"
        >
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}

      {/* Add button skeleton */}
      <div className="p-4">
        <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Empty state when user has no properties
 * Displays friendly message and encourages adding first property
 */
function EmptyState() {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Home className="w-6 h-6 text-[#717171]" />
      </div>
      <p className="text-[#222222] font-medium mb-1">No properties yet</p>
      <p className="text-[#717171] text-sm">
        Add your first property to get started
      </p>
    </div>
  );
}

/**
 * Props for the main PropertySection component
 */
export interface PropertySectionProps {
  /** Optional callback when property is selected for editing */
  onPropertyEdit?: (property: Property) => void;
  /** Optional callback when add property is clicked */
  onAddProperty?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Property section for Dashboard 2 displaying user's properties
 *
 * Features:
 * - Dynamic heading ("My Property" vs "My Properties")
 * - Clickable property rows with edit navigation
 * - "Add New Property" button
 * - Loading skeleton state
 * - Empty state for new users
 * - Full keyboard accessibility
 *
 * @param onPropertyEdit - Callback when property row is clicked
 * @param onAddProperty - Callback when Add button is clicked
 * @param className - Optional additional CSS classes
 */
export function PropertySection({
  onPropertyEdit,
  onAddProperty,
  className = '',
}: PropertySectionProps) {
  const { userProperties, loading } = useAuth();

  // Dynamic heading based on property count
  const headingText = userProperties?.length === 1 ? 'My Property' : 'My Properties';

  // Handle property row click
  const handlePropertyClick = (property: Property) => {
    if (onPropertyEdit) {
      onPropertyEdit(property);
    } else {
      // Placeholder: Log warning until edit modal is implemented (Task 4.2)
      console.warn('[PropertySection] onPropertyEdit not provided. Property:', property.id);
    }
  };

  // Handle add property button click
  const handleAddClick = () => {
    if (onAddProperty) {
      onAddProperty();
    } else {
      // Placeholder: Log warning until add modal is implemented (Task 4.3)
      console.warn('[PropertySection] onAddProperty not provided');
    }
  };

  // Show loading skeleton
  if (loading) {
    return <LoadingSkeleton />;
  }

  const hasProperties = userProperties && userProperties.length > 0;

  return (
    <section
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}
      aria-labelledby="property-section-heading"
    >
      {/* Section Header */}
      <h2
        id="property-section-heading"
        className="text-lg font-semibold text-[#222222] p-4 border-b border-[#DDDDDD]"
      >
        {headingText}
      </h2>

      {/* Property List or Empty State */}
      {hasProperties ? (
        <div role="list" aria-label="Your properties">
          {userProperties.map((property) => (
            <PropertyRow
              key={property.id}
              property={property}
              onClick={handlePropertyClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Add Property Button */}
      <div className="p-4 border-t border-[#DDDDDD]">
        <button
          type="button"
          onClick={handleAddClick}
          className="w-full flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-lg font-medium text-base bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
          aria-label="Add a new property"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Property</span>
        </button>
      </div>
    </section>
  );
}
