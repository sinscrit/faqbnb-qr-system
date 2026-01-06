// src/app/dashboard2/print/page.tsx
// REQ-127: Print Property Selector Page - Multi-property user property selection
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Building, QrCode, Loader2, Home } from 'lucide-react';
import { Property } from '@/types';

/**
 * Loading spinner component with Airbnb styling
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
        <p className="text-[#717171] text-lg">Loading properties...</p>
      </div>
    </div>
  );
}

/**
 * Empty state component when user has no properties
 */
function EmptyState({ onNavigateToCreate }: { onNavigateToCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="bg-[#F7F7F7] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Building className="w-10 h-10 text-[#717171]" />
      </div>
      <h2 className="text-2xl font-bold text-[#222222] mb-2">
        No Properties Yet
      </h2>
      <p className="text-[#717171] text-lg mb-6 max-w-md">
        You don&apos;t have any properties yet. Add a property to start creating QR codes.
      </p>
      <button
        onClick={onNavigateToCreate}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white rounded-lg font-medium hover:scale-[1.02] hover:brightness-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
        aria-label="Add a new property"
      >
        Add a Property
      </button>
    </div>
  );
}

/**
 * Property card component for grid display
 */
function PropertyCard({
  property,
  onClick
}: {
  property: Property;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm border border-[#DDDDDD] p-6 hover:border-[#FF385C] hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
      aria-label={`Select ${property.nickname} to print QR codes`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-[#F7F7F7] rounded-lg p-3">
          <Building className="w-6 h-6 text-[#717171]" />
        </div>
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
        </div>
        <div className="flex-shrink-0">
          <QrCode className="w-5 h-5 text-[#717171]" />
        </div>
      </div>
    </button>
  );
}

/**
 * Property grid component
 */
function PropertyGrid({
  properties,
  onSelectProperty
}: {
  properties: Property[];
  onSelectProperty: (propertyId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={() => onSelectProperty(property.id)}
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
 */
export default function PrintPropertySelectorPage() {
  const router = useRouter();
  const { userProperties, loading } = useAuth();

  // Handle single property case - redirect directly to print flow
  useEffect(() => {
    if (!loading && userProperties && userProperties.length === 1) {
      router.replace(`/dashboard2/print/${userProperties[0].id}`);
    }
  }, [userProperties, loading, router]);

  // Handle navigation
  const handleBack = () => {
    router.push('/dashboard2');
  };

  const handleSelectProperty = (propertyId: string) => {
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
  if (!userProperties || userProperties.length === 0) {
    return (
      <div>
        <PageHeader onBack={handleBack} />
        <EmptyState onNavigateToCreate={handleNavigateToCreate} />
      </div>
    );
  }

  // Single property - handled by useEffect redirect
  if (userProperties.length === 1) {
    return <LoadingSpinner />;
  }

  // Property selection grid
  return (
    <div className="space-y-6">
      <PageHeader onBack={handleBack} />
      <PropertyGrid
        properties={userProperties}
        onSelectProperty={handleSelectProperty}
      />
    </div>
  );
}
