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
 * @lastModified 2026-01-03 (REQ-056 Task 1.1)
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
// Main Component Export (Task 1.3)
// =============================================================================
// export { ItemManager } from './ItemManager';
