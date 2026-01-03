/**
 * ItemManager hooks barrel export
 *
 * @module ItemManager/hooks
 * @lastModified 2026-01-03 (REQ-089 - Added useIsMobile)
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
