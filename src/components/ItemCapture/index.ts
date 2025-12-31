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
// Wizard Navigation Components (Task 1.3)
// =============================================================================

export { CaptureWizard } from './components/CaptureWizard';
export type { CaptureWizardProps } from './components/CaptureWizard';

export { StepNavigation } from './components/shared/StepNavigation';
export type { StepNavigationProps } from './components/shared/StepNavigation';

export { ProgressIndicator, getCurrentStageIndex, PROGRESS_STAGES, STEP_TO_STAGE_INDEX } from './components/shared/ProgressIndicator';
export type { ProgressIndicatorProps, StepDefinition } from './components/shared/ProgressIndicator';

// =============================================================================
// Main Component Export
// =============================================================================

// TODO: Add main component export in later task
// export { ItemCapture } from './ItemCapture';
