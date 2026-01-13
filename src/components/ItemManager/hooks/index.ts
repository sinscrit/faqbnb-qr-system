/**
 * ItemManager hooks barrel export
 *
 * @module ItemManager/hooks
 * @lastModified 2026-01-05 (REQ-091 - Added useItemAnalytics hook)
 */

// =============================================================================
// useIsMobile Hook (REQ-089)
// =============================================================================

export { useIsMobile } from './useIsMobile';
export { default as useIsMobileDefault } from './useIsMobile';
export type { UseIsMobileOptions } from './useIsMobile';

// =============================================================================
// useItemManagerState Hook (REQ-057)
// =============================================================================

export { useItemManagerState, createInitialState as createItemManagerInitialState, itemManagerReducer } from './useItemManagerState';
export type { UseItemManagerStateReturn } from './useItemManagerState';

// =============================================================================
// useAssetManagement Hook (REQ-080)
// =============================================================================

export { useAssetManagement } from './useAssetManagement';
export { default as useAssetManagementDefault } from './useAssetManagement';

// Utility functions (for testing and advanced use)
export {
  createInitialState as createAssetManagementInitialState,
  getFileCategory,
  validateAssetFile,
  createPendingAsset,
  assetManagementReducer,
} from './useAssetManagement';

// =============================================================================
// useItemSearch Hook (REQ-062)
// =============================================================================

export { useItemSearch } from './useItemSearch';
export { default as useItemSearchDefault } from './useItemSearch';

// =============================================================================
// useDebounce Hook (REQ-064)
// =============================================================================

export { useDebounce, DEFAULT_DEBOUNCE_MS } from './useDebounce';
export { default as useDebounceDefault } from './useDebounce';

// =============================================================================
// useItemSelection Hook (REQ-068)
// =============================================================================

export { useItemSelection } from './useItemSelection';
export { default as useItemSelectionDefault } from './useItemSelection';
export type {
  UseItemSelectionOptions,
  UseItemSelectionReturn,
} from './useItemSelection';

// =============================================================================
// useLongPress Hook (REQ-069)
// =============================================================================

export { useLongPress } from './useLongPress';
export { default as useLongPressDefault } from './useLongPress';
export type {
  UseLongPressOptions,
  UseLongPressReturn,
} from './useLongPress';

// =============================================================================
// useItemAnalytics Hook (REQ-091)
// =============================================================================

export { useItemAnalytics } from './useItemAnalytics';
export { default as useItemAnalyticsDefault } from './useItemAnalytics';
export type {
  ItemAnalyticsData,
  UseItemAnalyticsOptions,
  UseItemAnalyticsReturn,
} from './useItemAnalytics';

// =============================================================================
// useColumnVisibility Hook (REQ-218)
// =============================================================================

export { useColumnVisibility } from './useColumnVisibility';
export { default as useColumnVisibilityDefault } from './useColumnVisibility';
export type {
  ColumnVisibilityState,
  UseColumnVisibilityReturn,
} from './useColumnVisibility';
