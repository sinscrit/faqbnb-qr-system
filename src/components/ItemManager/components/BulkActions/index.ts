/**
 * BulkActions Components Barrel Export
 *
 * Exports all bulk action-related components for the ItemManager.
 *
 * @module ItemManager/components/BulkActions
 * @see docs/REQ-072-implement-bulktagdialog-detailed.md
 * @see docs/REQ-073-implement-bulkmovedialog-detailed.md
 * @lastModified 2026-01-03 (REQ-073 Task 3.6.6 - Added BulkMoveDialog export)
 */

export { BulkTagDialog } from './BulkTagDialog';
export type { BulkTagDialogProps } from './BulkTagDialog';

export { BulkMoveDialog } from './BulkMoveDialog';
export type { BulkMoveDialogProps, Property as BulkMoveProperty } from './BulkMoveDialog';
