/**
 * Dialogs Components Barrel Export
 *
 * @module ItemManager/components/dialogs
 * @lastModified 2026-01-04 (REQ-071 - Added ConfirmDeleteDialog export)
 */

// Filter Panel Components
export { FilterPanel } from './FilterPanel';
export type { FilterPanelProps, FilterPanelClassNames, FilterPanelLabels } from './FilterPanel';

export { ContentTypeFilter } from './ContentTypeFilter';
export type { ContentTypeFilterProps } from './ContentTypeFilter';

export { TagFilter } from './TagFilter';
export type { TagFilterProps } from './TagFilter';

export { LocationFilter } from './LocationFilter';
export type { LocationFilterProps } from './LocationFilter';

export { PropertyFilter } from './PropertyFilter';
export type { PropertyFilterProps } from './PropertyFilter';

// Sort Menu Component
export { SortMenu } from './SortMenu';
export type { SortMenuProps } from './SortMenu';

// Confirm Delete Dialog (REQ-071)
export { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
export type { ConfirmDeleteDialogProps } from './ConfirmDeleteDialog';

// Export helper functions for testing
export {
  formatItemList,
  getDeleteTitle,
  getDeleteMessage,
  getConfirmButtonText,
} from './ConfirmDeleteDialog';
