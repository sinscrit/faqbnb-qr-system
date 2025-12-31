/**
 * Shared Components - Public Exports
 *
 * This barrel file provides exports for shared components used across
 * the ItemCapture wizard.
 *
 * @module ItemCapture/components/shared
 * @lastModified 2025-12-31 (REQ-037)
 */

export { CameraPreview } from './CameraPreview';
export type { CameraPreviewProps } from './CameraPreview';

export { ProgressIndicator, getCurrentStageIndex, PROGRESS_STAGES, STEP_TO_STAGE_INDEX } from './ProgressIndicator';
export type { ProgressIndicatorProps, StepDefinition } from './ProgressIndicator';

export { StepNavigation } from './StepNavigation';
export type { StepNavigationProps } from './StepNavigation';
