/**
 * AssetPanel Component Barrel Export
 *
 * @module ItemManager/components/AssetPanel
 * @lastModified 2026-01-03 (REQ-085 - Added AssetRemoveConfirmDialog export)
 */

export { AssetPanel, default } from './AssetPanel';
export { AssetItem } from './AssetItem';
export { AssetDropZone } from './AssetDropZone';
export { SortableAssetList } from './SortableAssetList';
export { AssetRemoveConfirmDialog } from './AssetRemoveConfirmDialog';
export type {
  AssetPanelProps,
  AssetItemProps,
  SortableAssetListProps,
  SortableAssetItemProps,
  DragHandleProps,
} from '../../ItemManager.types';
export type { AssetDropZoneProps } from './AssetDropZone';
export type { AssetRemoveConfirmDialogProps } from './AssetRemoveConfirmDialog';
