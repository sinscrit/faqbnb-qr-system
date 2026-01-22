// src/components/SimpleDashboard/ProgressivePropertySection.tsx
// REQ-136: Progressive Property Section Wrapper
// Created: 2026-01-06
// Last Modified: 2026-01-22 08:00:00 UTC - REQ-E02-052: Updated to dashboard namespace

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import { useDashboardTier } from '@/hooks/useDashboardTier';
import { PropertySection } from './PropertySection';
import { PropertySearchBar } from './PropertySearchBar';

/**
 * Props for ProgressivePropertySection component
 */
export interface ProgressivePropertySectionProps {
  /** Optional callback when property is selected for editing */
  onPropertyEdit?: (property: Property) => void;
  /** Optional callback when add property is clicked */
  onAddProperty?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Progressive Property Section wrapper component
 * Combines PropertySection with tier-specific enhancements
 *
 * Features:
 * - Uses useDashboardTier hook to determine tier
 * - Shows search bar for 'many' tier (16+ properties)
 * - Passes tier to PropertySection for tier-aware rendering
 * - Handles search filtering of properties locally
 *
 * @param onPropertyEdit - Callback when property is selected for editing
 * @param onAddProperty - Callback when add property is clicked
 * @param className - Optional additional CSS classes
 */
export function ProgressivePropertySection({
  onPropertyEdit,
  onAddProperty,
  className = '',
}: ProgressivePropertySectionProps) {
  const t = useTranslations('dashboard');
  const { userProperties } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Get tier configuration based on property count
  const tierConfig = useDashboardTier(userProperties?.length ?? 0);

  // Handle search callback
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Filter properties based on search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim() || !userProperties) {
      return userProperties;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    return userProperties.filter((property) =>
      property.nickname.toLowerCase().includes(normalizedQuery)
    );
  }, [userProperties, searchQuery]);

  // Handle property edit with filtered properties
  const handlePropertyEdit = useCallback((property: Property) => {
    onPropertyEdit?.(property);
  }, [onPropertyEdit]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* REQ-136: Search bar - only show for 'many' tier (16+ properties) */}
      {tierConfig.showSearchBar && (
        <PropertySearchBar
          onSearch={handleSearch}
        />
      )}

      {/* REQ-136: Search results count - show when filtering */}
      {tierConfig.showSearchBar && searchQuery && filteredProperties && (
        <p className="text-sm text-[#717171]">
          {filteredProperties.length === 0
            ? t('search.noResults')
            : t('search.resultCount', { count: filteredProperties.length })}
        </p>
      )}

      {/* Property Section with tier-aware rendering */}
      <PropertySection
        tier={tierConfig.tier}
        onPropertyEdit={handlePropertyEdit}
        onAddProperty={onAddProperty}
      />
    </div>
  );
}

export default ProgressivePropertySection;
