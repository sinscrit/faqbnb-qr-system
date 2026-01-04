/**
 * ItemManager Component - Public Exports
 *
 * This barrel file provides the public API for the ItemManager component.
 * Import from '@/components/ItemManager' for clean, predictable imports.
 *
 * @example
 * import { ItemManagerProps, ItemRecord, FilterState } from '@/components/ItemManager';
 *
 * @module ItemManager
 * @lastModified 2026-01-04 (REQ-061 - Added EmptyState and LoadingState exports)
 */

// =============================================================================
// Public Types (for consumer use)
// =============================================================================

export type {
  // Configuration
  ItemManagerProps,
  ItemManagerConfig,
  ItemManagerLabels,
  ItemManagerClassNames,

  // Data Models
  ItemRecordExtended,
  Property,
  FilterState,
  SortOption,
  ItemActions,

  // Render Props
  ToolbarRenderProps,
  ConfirmDialogProps,

  // Component Props
  ItemCardProps,
  ItemRowProps,
  ItemGridProps,
  ItemListProps,
  ViewModeToggleProps,
  ItemPreviewModalProps,
  // Empty and Loading State Types (REQ-061)
  EmptyStateProps,
  LoadingStateProps,
  // Asset Management Types (REQ-080)
  AssetManagementErrorCode,
  AssetManagementError,
  PendingAsset,
  AssetManagementState,
  AssetManagementAction,
  UseAssetManagementOptions,
  UseAssetManagementReturn,
} from './ItemManager.types';

// =============================================================================
// Internal Types (for component development)
// =============================================================================

export type {
  ItemManagerState,
  ItemManagerAction,
} from './ItemManager.types';

// =============================================================================
// Re-exported Types from ItemCapture (for convenience)
// =============================================================================

/**
 * Re-export shared types from ItemCapture for convenience.
 * This allows consumers to import all needed types from a single location.
 */
export type {
  ItemRecord,
  MediaItem,
  MediaMetadata,
  ApplianceType,
} from '@/components/ItemCapture';

// =============================================================================
// Hook Exports (REQ-057 Task 1.2)
// =============================================================================

export { useItemManagerState } from './hooks/useItemManagerState';
export type { UseItemManagerStateReturn } from './hooks/useItemManagerState';

// Also export the utilities for testing
export { createInitialState, itemManagerReducer } from './hooks/useItemManagerState';

// =============================================================================
// useAssetManagement Hook Export (REQ-080)
// =============================================================================

export { useAssetManagement, useAssetManagementDefault } from './hooks';

// Also export utility functions for testing
export {
  createAssetManagementInitialState,
  getFileCategory,
  validateAssetFile,
  createPendingAsset,
  assetManagementReducer,
} from './hooks';

// =============================================================================
// Main Component Export (REQ-057 Task 1.3)
// =============================================================================

export { ItemManager } from './ItemManager';
export { default as ItemManagerDefault } from './ItemManager';

// =============================================================================
// ItemCard Component Export (REQ-058)
// =============================================================================

export { ItemCard } from './components/ItemCard';
export { default as ItemCardDefault } from './components/ItemCard';

// =============================================================================
// ItemRow Component Export (REQ-059)
// =============================================================================

export { ItemRow } from './components/ItemRow';
export { default as ItemRowDefault } from './components/ItemRow';

// =============================================================================
// Grid and List View Component Exports (REQ-060)
// =============================================================================

export { ItemGrid } from './components/ItemGrid';
export { default as ItemGridDefault } from './components/ItemGrid';

export { ItemList } from './components/ItemList';
export { default as ItemListDefault } from './components/ItemList';

export { ViewModeToggle } from './components/shared/ViewModeToggle';
export { default as ViewModeToggleDefault } from './components/shared/ViewModeToggle';

// =============================================================================
// Empty and Loading State Component Exports (REQ-061)
// =============================================================================

export { EmptyState } from './components/shared/EmptyState';
export { default as EmptyStateDefault } from './components/shared/EmptyState';

export { LoadingState } from './components/shared/LoadingState';
export { default as LoadingStateDefault } from './components/shared/LoadingState';

// =============================================================================
// ItemPreviewModal Component Export (REQ-074)
// =============================================================================

export { ItemPreviewModal } from './components/ItemPreview';
export { ItemPreviewModalDefault } from './components/ItemPreview';

// =============================================================================
// InstructionsViewer Component Export (REQ-078)
// =============================================================================

export { InstructionsViewer, InstructionsViewerDefault } from './components/ItemPreview';
export type { InstructionsViewerProps } from './components/ItemPreview';

// =============================================================================
// AssetPanel Component Export (REQ-081)
// =============================================================================

export { AssetPanel } from './components/AssetPanel';
export { default as AssetPanelDefault } from './components/AssetPanel';
export type { AssetPanelProps } from './components';

// =============================================================================
// AssetItem Component Export (REQ-082)
// =============================================================================

export { AssetItem } from './components/AssetPanel';
export type { AssetItemProps } from './ItemManager.types';

// =============================================================================
// SortableAssetList Component Export (REQ-084)
// =============================================================================

export { SortableAssetList } from './components/AssetPanel';
export type {
  SortableAssetListProps,
  SortableAssetItemProps,
  DragHandleProps,
} from './ItemManager.types';

// =============================================================================
// AssetRemoveConfirmDialog Component Export (REQ-085)
// =============================================================================

export { AssetRemoveConfirmDialog } from './components/AssetPanel';
export type { AssetRemoveConfirmDialogProps } from './components/AssetPanel';

// =============================================================================
// InlineEdit Component Export (REQ-086)
// =============================================================================

export { InlineEdit } from './components/shared/InlineEdit';
export { default as InlineEditDefault } from './components/shared/InlineEdit';
export type { InlineEditProps, InlineEditState } from './components/shared/InlineEdit';
