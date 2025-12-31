/**
 * ItemCapture Component - Public Exports
 *
 * This barrel file provides the public API for the ItemCapture component.
 * Import from '@/components/ItemCapture' for clean, predictable imports.
 *
 * @example
 * import { ItemCapture, ItemCaptureProps, ItemRecord } from '@/components/ItemCapture';
 *
 * @module ItemCapture
 * @lastModified 2025-12-31 (REQ-032)
 */

// =============================================================================
// Public Types (for consumer use)
// =============================================================================

export type {
  // Configuration
  ItemCaptureConfig,
  ItemCaptureProps,

  // Output types
  ItemRecord,
  MediaItem,
  MediaMetadata,
  ApplianceType,
} from './ItemCapture.types';

// =============================================================================
// Internal Types (for component development and testing)
// =============================================================================

export type {
  WizardStep,
  ItemMetadata,
  ItemCaptureState,
  ItemCaptureAction,
} from './ItemCapture.types';

// =============================================================================
// Hooks Export
// =============================================================================

export {
  useItemCaptureState,
  type UseItemCaptureStateReturn,
} from './hooks';

// =============================================================================
// Main Component Export
// =============================================================================

// TODO: Add main component export in later task
// export { ItemCapture } from './ItemCapture';
