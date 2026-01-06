// src/components/SimpleDashboard/index.ts
// REQ-124: StatisticsCards Component
// REQ-126: ActionButtons Component
// REQ-130: PropertySection Component
// REQ-131: PropertyEditModal Component
// REQ-132: AddPropertyModal Component
// REQ-136: Progressive UI Components
// REQ-137: EmptyStateCard Component
// Created: 2026-01-06 17:00:00 UTC
// Last Modified: 2026-01-06

// Core dashboard components
export { StatisticsCards } from './StatisticsCards';
export type { StatisticsCardsProps } from './StatisticsCards';

export { ActionButtons } from './ActionButtons';
export type { ActionButtonsProps } from './ActionButtons';

export { PropertySection } from './PropertySection';
export type { PropertySectionProps } from './PropertySection';

export { PropertyEditModal } from './PropertyEditModal';
export type { PropertyEditModalProps } from './PropertyEditModal';

export { AddPropertyModal } from './AddPropertyModal';
export type { AddPropertyModalProps } from './AddPropertyModal';

// REQ-136: Progressive UI Components
export { ProgressivePropertySection } from './ProgressivePropertySection';
export type { ProgressivePropertySectionProps } from './ProgressivePropertySection';

export { ProgressiveStatisticsSection } from './ProgressiveStatisticsSection';
export type { ProgressiveStatisticsSectionProps } from './ProgressiveStatisticsSection';

export { PropertySearchBar } from './PropertySearchBar';
export type { PropertySearchBarProps } from './PropertySearchBar';

export { PortfolioSummary } from './PortfolioSummary';
export type { PortfolioSummaryProps } from './PortfolioSummary';

export { PropertyGroupingControl } from './PropertyGroupingControl';
export type { PropertyGroupingControlProps, GroupingOption } from './PropertyGroupingControl';

export { BulkOperationsToolbar } from './BulkOperationsToolbar';
export type { BulkOperationsToolbarProps } from './BulkOperationsToolbar';

export { AdvancedDashboardTools } from './AdvancedDashboardTools';
export type { AdvancedDashboardToolsProps } from './AdvancedDashboardTools';

export { DashboardSettingsPopover } from './DashboardSettingsPopover';
export type { DashboardSettingsPopoverProps } from './DashboardSettingsPopover';

// REQ-137: Empty State Components
export { EmptyStateCard } from './EmptyStateCard';
export type { EmptyStateCardProps } from './EmptyStateCard';
