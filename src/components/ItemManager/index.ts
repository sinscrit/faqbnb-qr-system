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
 * @lastModified 2026-01-03 (REQ-074 Task 6 - Added ItemPreviewModal export)
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
// ItemPreviewModal Component Export (REQ-074)
// =============================================================================

export { ItemPreviewModal } from './components/ItemPreview';
export { ItemPreviewModalDefault } from './components/ItemPreview';
