/**
 * InstructionsTable Component Exports
 * Created: 2026-01-12
 * @lastModified 2026-01-13 (REQ-220 - Added toolbar, grid, and card components)
 */

// Main components
export { InstructionsTable } from './InstructionsTable';
export { GuideToolbar } from './GuideToolbar';
export { GuideGrid } from './GuideGrid';
export { GuideCard } from './GuideCard';
export { GuideColumnSettingsPopup } from './GuideColumnSettingsPopup';

// Hooks
export { useGuideColumnVisibility } from './useGuideColumnVisibility';
export { useGuideSearch } from './hooks/useGuideSearch';

// Types
export type {
  InstructionRow,
  InstructionsTableProps,
  GuideSortOption,
  GuideColumnVisibilityState,
} from './InstructionsTable.types';
export type {
  GuideFilterState,
  UseGuideSearchOptions,
  UseGuideSearchReturn,
} from './hooks/useGuideSearch';
export type { GuideToolbarProps } from './GuideToolbar';
export type { GuideGridProps } from './GuideGrid';
export type { GuideCardProps } from './GuideCard';
