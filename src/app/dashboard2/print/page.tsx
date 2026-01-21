// src/app/dashboard2/print/page.tsx
// REQ-127: Print Property Selector Page - Multi-property user property selection
// REQ-135: Print Flow Property Selector Enhancements
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveProperty } from '@/hooks/useActiveProperty';
import { usePropertyItemCounts } from '@/hooks/usePropertyItemCounts';
import { ArrowLeft, Building, QrCode, Loader2, Home, Check } from 'lucide-react';

type PropertySummary = {
  id: string;
  nickname: string;
  address?: string | null;
  thumbnail_url?: string | null;
  property_types?: { display_name?: string | null };
};

/**
 * Loading spinner component with Airbnb styling
 */
function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center min-h-[400px]"
      role="status"
      aria-label="Loading properties"
    >
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
        <p className="text-[#717171] text-lg" aria-live="polite">Loading properties...</p>
      </div>
    </div>
  );
}

/**
 * Empty state component when user has no properties
 */
function EmptyState({ onNavigateToCreate }: { onNavigateToCreate: () => void }) {
  const tEmpty = useTranslations('common.emptyStates');
  const tActions = useTranslations('common.actions');

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="bg-[#F7F7F7] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Building className="w-10 h-10 text-[#717171]" />
      </div>
      <h2 className="text-2xl font-bold text-[#222222] mb-2">
        {tEmpty('properties.title')}
      </h2>
      <p className="text-[#717171] text-lg mb-6 max-w-md">
        {tEmpty('properties.description')}
      </p>
      <button
        onClick={onNavigateToCreate}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white rounded-lg font-medium hover:scale-[1.02] hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
        aria-label="Add a new property"
      >
        {tActions('addProperty')}
      </button>
    </div>
  );
}

/**
 * Property thumbnail component with image/icon fallback
 * REQ-135: Displays property thumbnail with graceful fallback to Building icon
 */
function PropertyThumbnail({
  thumbnailUrl,
  nickname,
  isSelected
}: {
  thumbnailUrl?: string | null;
  nickname: string;
  isSelected: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const showImage = thumbnailUrl && !imageError;
  const iconBgClass = isSelected ? 'bg-[#FFEBEF]' : 'bg-[#F7F7F7]';
  const iconColorClass = isSelected ? 'text-[#FF385C]' : 'text-[#717171]';

  return (
    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
      {showImage ? (
        <>
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className={`w-full h-full ${iconBgClass} animate-pulse`} />
          )}
          {/* Thumbnail image */}
          <img
            src={thumbnailUrl}
            alt={`${nickname} thumbnail`}
            className={`w-full h-full object-cover ${imageLoaded ? '' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </>
      ) : (
        /* Fallback icon */
        <div className={`${iconBgClass} w-full h-full flex items-center justify-center`}>
          <Building className={`w-6 h-6 ${iconColorClass}`} />
        </div>
      )}
    </div>
  );
}

/**
 * Property card component for grid display
 * REQ-135: Enhanced with selected state styling, item count display, and thumbnail support
 */
function PropertyCard({
  property,
  onClick,
  isSelected = false,
  itemCount = 0,
  isLoadingCount = false
}: {
  property: PropertySummary;
  onClick: () => void;
  isSelected?: boolean;
  itemCount?: number;
  isLoadingCount?: boolean;
}) {
  // Build dynamic class names for selected state
  const cardClasses = `
    w-full text-left rounded-xl shadow-sm border p-6
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-[#222222] focus-visible:ring-offset-2
    ${isSelected
      ? 'bg-[#FFF5F5] border-[#FF385C] ring-2 ring-[#FF385C] shadow-md'
      : 'bg-white border-[#DDDDDD] hover:border-[#FF385C] hover:shadow-md'}
  `;

  return (
    <button
      onClick={onClick}
      className={cardClasses}
      aria-label={`Select ${property.nickname} to print QR codes${isSelected ? ' (currently selected)' : ''}`}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-4">
        {/* REQ-135: Property thumbnail with fallback */}
        <PropertyThumbnail
          thumbnailUrl={property.thumbnail_url}
          nickname={property.nickname}
          isSelected={isSelected}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[#222222] truncate">
            {property.nickname}
          </h3>
          {property.property_types?.display_name && (
            <p className="text-sm text-[#717171] mt-1">
              {property.property_types.display_name}
            </p>
          )}
          {property.address && (
            <p className="text-sm text-[#717171] mt-1 truncate">
              {property.address}
            </p>
          )}
          {/* Item count display - REQ-135 */}
          <div className="flex items-center gap-1 text-sm text-[#717171] mt-2">
            {isLoadingCount ? (
              <span className="bg-gray-200 animate-pulse rounded w-16 h-4"></span>
            ) : (
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          {isSelected && (
            <div className="bg-[#FF385C] rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          <QrCode className={`w-5 h-5 ${isSelected ? 'text-[#FF385C]' : 'text-[#717171]'}`} />
        </div>
      </div>
    </button>
  );
}

/**
 * Property grid component
 * REQ-135: Enhanced with active property selection and item counts
 */
function PropertyGrid({
  properties,
  onSelectProperty,
  activePropertyId,
  itemCounts,
  isLoadingCounts
}: {
  properties: PropertySummary[];
  onSelectProperty: (propertyId: string) => void;
  activePropertyId?: string | null;
  itemCounts?: Record<string, number>;
  isLoadingCounts?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      role="list"
      aria-label="Select a property"
    >
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={() => onSelectProperty(property.id)}
          isSelected={property.id === activePropertyId}
          itemCount={itemCounts?.[property.id] || 0}
          isLoadingCount={isLoadingCounts}
        />
      ))}
    </div>
  );
}

/**
 * Page header with back navigation
 */
function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[#222222] hover:text-[#FF385C] transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 rounded-lg p-1 -ml-1"
        aria-label="Go back to dashboard"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-gradient-to-r from-[#E61E4D] to-[#D70466] rounded-lg p-2">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#222222]">
          Select a Property
        </h1>
      </div>
      <p className="text-[#717171] text-lg">
        Choose which property&apos;s QR codes you want to print
      </p>
    </div>
  );
}

/**
 * PrintPropertySelectorPage - Property selection for multi-property users
 *
 * This page is displayed when a user with multiple properties clicks "Print QR Code".
 * Single-property users are routed directly to the print flow via ActionButtons logic.
 *
 * Features:
 * - Displays all user properties in a responsive grid
 * - Follows Airbnb design system styling
 * - Handles loading, empty, and populated states
 * - Full keyboard accessibility and ARIA labels
 * - REQ-135: Pre-selection of previously selected property
 * - REQ-135: Item counts displayed per property
 */
export default function PrintPropertySelectorPage() {
  const router = useRouter();
  const { userProperties, loading } = useAuth();

  const properties: PropertySummary[] = (userProperties || []).map((property) => ({
    id: property.id,
    nickname: property.nickname,
    address: property.address ?? null,
    thumbnail_url: (property as { thumbnail_url?: string | null }).thumbnail_url ?? null,
    property_types: (property as { property_types?: { display_name?: string | null } }).property_types
  }));

  // REQ-135: Get property IDs for active property hook
  const propertyIds = properties.map((property) => property.id);

  // REQ-135: Active property persistence hook
  const { activePropertyId, setActiveProperty } = useActiveProperty(propertyIds);

  // REQ-135: Item counts hook (will be implemented in Task 4)
  const { itemCounts, loading: countsLoading } = usePropertyItemCounts(propertyIds);

  // Handle single property case - redirect directly to print flow
  useEffect(() => {
    if (!loading && properties.length === 1) {
      router.replace(`/dashboard2/print/${properties[0].id}`);
    }
  }, [properties, loading, router]);

  // Handle navigation
  const handleBack = () => {
    router.push('/dashboard2');
  };

  // REQ-135: Update active property before navigation
  const handleSelectProperty = (propertyId: string) => {
    setActiveProperty(propertyId);
    router.push(`/dashboard2/print/${propertyId}`);
  };

  const handleNavigateToCreate = () => {
    // Navigate to property creation - for now, go back to dashboard
    router.push('/dashboard2');
  };

  // Loading state
  if (loading || userProperties === undefined) {
    return <LoadingSpinner />;
  }

  // Empty state - no properties
  if (properties.length === 0) {
    return (
      <div>
        <PageHeader onBack={handleBack} />
        <EmptyState onNavigateToCreate={handleNavigateToCreate} />
      </div>
    );
  }

  // Single property - handled by useEffect redirect
  if (properties.length === 1) {
    return <LoadingSpinner />;
  }

  // Property selection grid
  return (
    <div className="space-y-6">
      <PageHeader onBack={handleBack} />
      <PropertyGrid
        properties={properties}
        onSelectProperty={handleSelectProperty}
        activePropertyId={activePropertyId}
        itemCounts={itemCounts}
        isLoadingCounts={countsLoading}
      />
    </div>
  );
}
