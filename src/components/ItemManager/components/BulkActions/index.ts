/**
 * BulkActions Components Barrel Export
 *
 * Exports all bulk action-related components for the ItemManager.
 *
 * @module ItemManager/components/BulkActions
 * @see docs/REQ-070-build-bulkactionsbar-component-overview.md
 * @see docs/REQ-072-implement-bulktagdialog-detailed.md
 * @see docs/REQ-073-implement-bulkmovedialog-detailed.md
 * @lastModified 2026-01-04 (REQ-070 - Added BulkActionsBar export)
 */

export { BulkActionsBar } from './BulkActionsBar';
export type { BulkActionsBarProps } from './BulkActionsBar';

export { BulkTagDialog } from './BulkTagDialog';
export type { BulkTagDialogProps } from './BulkTagDialog';

export { BulkMoveDialog } from './BulkMoveDialog';
export type { BulkMoveDialogProps, Property as BulkMoveProperty } from './BulkMoveDialog';
