// src/components/SimpleDashboard/AdvancedDashboardTools.tsx
// REQ-136: Advanced Dashboard Tools Container
// Created: 2026-01-06
// Last Modified: 2026-01-22 08:00:00 UTC - REQ-E02-052: Internationalized all UI strings

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardTier } from '@/hooks/useDashboardTier';
import { PropertyGroupingControl, GroupingOption } from './PropertyGroupingControl';
import { BulkOperationsToolbar } from './BulkOperationsToolbar';

/**
 * Props for AdvancedDashboardTools component
 */
export interface AdvancedDashboardToolsProps {
  /** Array of currently selected property IDs */
  selectedPropertyIds: string[];
  /** Callback when Select All is clicked */
  onSelectAll: () => void;
  /** Callback when Deselect All is clicked */
  onDeselectAll: () => void;
  /** Callback when Print Selected is clicked */
  onPrintSelected: () => void;
  /** Callback when grouping option changes */
  onGroupChange: (option: GroupingOption) => void;
  /** Current grouping option */
  currentGrouping: GroupingOption;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Advanced Dashboard Tools container component
 * Houses grouping controls and bulk operations
 *
 * Features:
 * - Conditional rendering based on tier:
 *   - 'single'/'few' tier: Nothing rendered
 *   - 'multiple' tier: Grouping control only
 *   - 'many' tier: Grouping control + bulk operations
 * - Collapsible section with heading "Advanced Tools"
 * - Mobile responsive: Show as collapsible on small screens
 *
 * @param selectedPropertyIds - Array of selected property IDs
 * @param onSelectAll - Callback for Select All action
 * @param onDeselectAll - Callback for Deselect All action
 * @param onPrintSelected - Callback for Print Selected action
 * @param onGroupChange - Callback when grouping changes
 * @param currentGrouping - Current grouping option
 * @param className - Optional additional CSS classes
 */
export function AdvancedDashboardTools({
  selectedPropertyIds,
  onSelectAll,
  onDeselectAll,
  onPrintSelected,
  onGroupChange,
  currentGrouping,
  className = '',
}: AdvancedDashboardToolsProps) {
  const { userProperties } = useAuth();
  const propertyCount = userProperties?.length ?? 0;
  const t = useTranslations('dashboard');

  // Get tier configuration
  const tierConfig = useDashboardTier(propertyCount);

  // Collapsible state for mobile
  const [isExpanded, setIsExpanded] = useState(true);

  // Don't render anything for single/few tiers
  if (!tierConfig.showGroupingControls && !tierConfig.showBulkOperations) {
    return null;
  }

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <section
      className={`transition-all duration-300 ${className}`}
      aria-labelledby="advanced-tools-heading"
    >
      {/* Section Header - Collapsible on mobile */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm mb-4 sm:hidden hover:bg-[#F7F7F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]"
        aria-expanded={isExpanded}
        aria-controls="advanced-tools-content"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#717171]" />
          <span
            id="advanced-tools-heading"
            className="text-lg font-semibold text-[#222222]"
          >
            {t('advancedTools.title')}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#717171]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#717171]" />
        )}
      </button>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-[#717171]" />
        <h2
          id="advanced-tools-heading-desktop"
          className="text-lg font-semibold text-[#222222]"
        >
          {t('advancedTools.title')}
        </h2>
      </div>

      {/* Tools Content */}
      <div
        id="advanced-tools-content"
        className={`space-y-4 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 sm:max-h-[1000px] sm:opacity-100'
        }`}
      >
        {/* Grouping Control - Show for multiple+ tiers */}
        {tierConfig.showGroupingControls && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <PropertyGroupingControl
              value={currentGrouping}
              onGroupChange={onGroupChange}
              className="max-w-xs"
            />
          </div>
        )}

        {/* Bulk Operations - Show for many tier only */}
        {tierConfig.showBulkOperations && (
          <BulkOperationsToolbar
            selectedCount={selectedPropertyIds.length}
            totalCount={propertyCount}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
            onPrintSelected={onPrintSelected}
          />
        )}
      </div>
    </section>
  );
}

export default AdvancedDashboardTools;
