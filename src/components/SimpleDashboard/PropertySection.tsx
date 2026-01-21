// src/components/SimpleDashboard/PropertySection.tsx
// REQ-130: PropertySection Component for Dashboard 2
// REQ-136: Added tier-aware rendering and SinglePropertyCard
// REQ-137: Updated EmptyState with friendly messaging and CTA
// REQ-140: Added min-h-[48px] to PropertyRow for touch target compliance
// Created: 2026-01-06
// Last Modified: 2026-01-11 - Added item counts display

'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, Home, Plus, Pencil, Package, DoorOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import { DashboardTier } from '@/hooks/useDashboardTier';
import { EmptyStateCard } from './EmptyStateCard';
import { SkeletonBase } from './skeletons';
import { usePropertyItemCounts } from '@/hooks/usePropertyItemCounts';

/**
 * Props for PropertyRow sub-component
 */
interface PropertyRowProps {
  /** Property data to display */
  property: Property;
  /** Callback when row is clicked */
  onClick: (property: Property) => void;
  /** Number of items in this property */
  itemCount?: number;
  /** Number of unique rooms in this property */
  roomCount?: number;
  /** Whether counts are loading */
  countsLoading?: boolean;
}

/**
 * Individual property row with click interaction
 * Displays property nickname, item count, room count, and chevron icon
 */
function PropertyRow({ property, onClick, itemCount = 0, roomCount = 0, countsLoading = false }: PropertyRowProps) {
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
      className="w-full flex items-center justify-between min-h-[48px] p-4 bg-white border-b border-[#DDDDDD] last:border-b-0 hover:bg-[#F7F7F7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-inset"
      aria-label={`Edit property: ${property.nickname}`}
    >
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[#222222] font-medium">
          {property.nickname}
        </span>
        <div className="flex items-center gap-3 text-sm text-[#717171]">
          {countsLoading ? (
            <span className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="flex items-center gap-1">
                <DoorOpen className="w-3.5 h-3.5" />
                {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
              </span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-[#717171]" />
    </button>
  );
}

/**
 * Loading skeleton for PropertySection
 * Shows shimmer animation while property data loads
 * REQ-138: Wrapped with SkeletonBase for accessibility
 */
function LoadingSkeleton() {
  return (
    <SkeletonBase label="Loading properties">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header skeleton */}
        <div className="p-4 border-b border-[#DDDDDD]">
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>

        {/* Property row skeletons */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border-b border-[#DDDDDD] last:border-b-0"
          >
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-5 w-5 bg-gray-200 rounded" />
          </div>
        ))}

        {/* Add button skeleton */}
        <div className="p-4">
          <div className="h-12 w-full bg-gray-200 rounded-lg" />
        </div>
      </div>
    </SkeletonBase>
  );
}

/**
 * REQ-137: Empty state when user has no properties
 * Uses EmptyStateCard with friendly Airbnb-style messaging
 */
interface PropertyEmptyStateProps {
  /** Callback when CTA is clicked */
  onAddProperty?: () => void;
}

function PropertyEmptyState({ onAddProperty }: PropertyEmptyStateProps) {
  const tEmpty = useTranslations('common.emptyStates');
  const tActions = useTranslations('common.actions');

  return (
    <EmptyStateCard
      icon={Home}
      title={tEmpty('properties.titleAdd')}
      description={tEmpty('properties.description')}
      actionLabel={onAddProperty ? tActions('addProperty') : undefined}
      onAction={onAddProperty}
      variant="subtle"
    />
  );
}

/**
 * REQ-136: Props for SinglePropertyCard sub-component
 * Used when tier is 'single' for a more compact, focused display
 */
interface SinglePropertyCardProps {
  /** Property data to display */
  property: Property;
  /** Callback when card is clicked */
  onClick: (property: Property) => void;
  /** Number of items in this property */
  itemCount?: number;
  /** Number of unique rooms in this property */
  roomCount?: number;
  /** Whether counts are loading */
  countsLoading?: boolean;
}

/**
 * REQ-136: Compact single-property card for 'single' tier
 * Shows property prominently with edit icon instead of chevron
 * Designed for users with only one property - no list styling
 */
function SinglePropertyCard({ property, onClick, itemCount = 0, roomCount = 0, countsLoading = false }: SinglePropertyCardProps) {
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
      className="w-full flex items-center justify-between min-h-[48px] p-4 bg-white hover:bg-[#F7F7F7] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-inset rounded-lg"
      aria-label={`Edit property: ${property.nickname}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#FFEEEF] rounded-lg flex items-center justify-center">
          <Home className="w-5 h-5 text-[#FF385C]" />
        </div>
        <div className="text-left">
          <span className="text-[#222222] font-medium block">
            {property.nickname}
          </span>
          <div className="flex items-center gap-3 text-sm text-[#717171]">
            {countsLoading ? (
              <span className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5" />
                  {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-2 rounded-full hover:bg-[#F0F0F0] transition-colors">
        <Pencil className="w-5 h-5 text-[#717171]" />
      </div>
    </button>
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
  /** REQ-136: Optional tier for tier-aware rendering */
  tier?: DashboardTier;
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
 * - REQ-136: Tier-aware rendering (compact card for single tier)
 *
 * @param onPropertyEdit - Callback when property row is clicked
 * @param onAddProperty - Callback when Add button is clicked
 * @param tier - Optional dashboard tier for tier-aware rendering
 * @param className - Optional additional CSS classes
 */
export function PropertySection({
  onPropertyEdit,
  onAddProperty,
  tier,
  className = '',
}: PropertySectionProps) {
  const { userProperties, loading } = useAuth();

  // Get property IDs for fetching item and room counts
  const propertyIds = userProperties?.map(p => p.id) || [];

  // Fetch item counts and room counts for all properties
  const { itemCounts, roomCounts, loading: countsLoading } = usePropertyItemCounts(propertyIds);

  // Dynamic heading based on property count
  const headingText = userProperties?.length === 1 ? 'My Property' : 'My Properties';

  // REQ-136: Determine if we should use single property compact view
  const useSingleView = tier === 'single' && userProperties?.length === 1;

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

      {/* REQ-136: Property List, Single Card, or Empty State */}
      {hasProperties ? (
        useSingleView ? (
          // Single tier: Compact card view
          <div className="p-4">
            <SinglePropertyCard
              property={userProperties[0]}
              onClick={handlePropertyClick}
              itemCount={itemCounts[userProperties[0].id] || 0}
              roomCount={roomCounts[userProperties[0].id] || 0}
              countsLoading={countsLoading}
            />
          </div>
        ) : (
          // Other tiers: List view
          <div role="list" aria-label="Your properties">
            {userProperties.map((property) => (
              <PropertyRow
                key={property.id}
                property={property}
                onClick={handlePropertyClick}
                itemCount={itemCounts[property.id] || 0}
                roomCount={roomCounts[property.id] || 0}
                countsLoading={countsLoading}
              />
            ))}
          </div>
        )
      ) : (
        <PropertyEmptyState onAddProperty={onAddProperty} />
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
