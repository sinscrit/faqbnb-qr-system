/**
 * Shared Components - Public Exports
 *
 * This barrel file provides exports for shared components used across
 * the ItemCapture wizard.
 *
 * @module ItemCapture/components/shared
 * @lastModified 2025-12-31 (REQ-052 - Added ValidationMessage)
 */

export { CameraPreview } from './CameraPreview';
export type { CameraPreviewProps } from './CameraPreview';

export { ProgressIndicator, getCurrentStageIndex, PROGRESS_STAGES, STEP_TO_STAGE_INDEX } from './ProgressIndicator';
export type { ProgressIndicatorProps, StepDefinition } from './ProgressIndicator';

export { StepNavigation } from './StepNavigation';
export type { StepNavigationProps } from './StepNavigation';

export { PDFPlaceholder } from './PDFPlaceholder';
export type { PDFPlaceholderProps } from './PDFPlaceholder';

export { PageCountBadge } from './PageCountBadge';
export type { PageCountBadgeProps } from './PageCountBadge';

export { MediaThumbnail } from './MediaThumbnail';
export type { MediaThumbnailProps } from './MediaThumbnail';

export { ValidationMessage, ValidationMessageList } from './ValidationMessage';
export type { ValidationMessageProps, ValidationMessageType, ValidationMessageListProps } from './ValidationMessage';
