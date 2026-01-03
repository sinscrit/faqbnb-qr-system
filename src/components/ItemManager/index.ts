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
 * @lastModified 2026-01-03 (REQ-059 Task 12 - Added ItemRow component export)
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
