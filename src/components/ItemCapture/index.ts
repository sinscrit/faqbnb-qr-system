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
 * @lastModified 2025-12-31 (REQ-044)
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
// Media Capture Types (REQ-036)
// =============================================================================

export type {
  PermissionStatus,
  MediaCaptureErrorCode,
  MediaCaptureError,
  BrowserCapabilities,
  UseMediaCaptureOptions,
  UseMediaCaptureReturn,
  FacingMode,
  CameraPreviewProps,
} from './ItemCapture.types';

// =============================================================================
// File Upload Types (REQ-041)
// =============================================================================

export type {
  FileCategory,
  FileRejectionCode,
  ValidatedFile,
  FileRejection,
  FileUploadError,
  FileValidationResult,
  UseFileUploadOptions,
  UseFileUploadReturn,
  DropZoneProps,
  InputProps,
} from './ItemCapture.types';

// =============================================================================
// PDF Thumbnail Types (REQ-043)
// =============================================================================

export type {
  PDFThumbnailError,
  PDFThumbnailResult,
} from './ItemCapture.types';

export {
  PDF_CONSTRAINTS,
  PDF_ERROR_MESSAGES,
  type PDFErrorCode,
} from './utils/pdfConstants';

// =============================================================================
// Hooks Export
// =============================================================================

export {
  useItemCaptureState,
  type UseItemCaptureStateReturn,
} from './hooks';

export { useMediaCapture } from './hooks';

export { useFileUpload } from './hooks';

export { usePDFThumbnail, type PDFThumbnailState } from './hooks';

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
// Step Components (Task 1.4, 1.5)
// =============================================================================

export { MetadataStep, validateMetadata } from './components/steps/MetadataStep';
export type { MetadataStepProps } from './components/steps/MetadataStep';

export { ContentTypeStep } from './components/steps/ContentTypeStep';
export type { ContentTypeStepProps, ContentType } from './components/steps/ContentTypeStep';

export { VideoCaptureStep } from './components/steps/VideoCaptureStep';
export type { VideoCaptureStepProps } from './components/steps/VideoCaptureStep';

export { PhotoCaptureStep } from './components/steps/PhotoCaptureStep';
export type { PhotoCaptureStepProps } from './components/steps/PhotoCaptureStep';

export { FileUploadStep } from './components/steps/FileUploadStep';
export type { FileUploadStepProps } from './components/steps/FileUploadStep';

export { TextEditorStep } from './components/steps/TextEditorStep';
export type { TextEditorStepProps } from './components/steps/TextEditorStep';

// =============================================================================
// Editor Components (REQ-045)
// =============================================================================

export { MarkdownEditor } from './editors/MarkdownEditor';
export type { MarkdownEditorProps } from './editors/MarkdownEditor';

// =============================================================================
// Shared Components (REQ-037, REQ-043)
// =============================================================================

export { CameraPreview } from './components/shared/CameraPreview';

export { PDFPlaceholder } from './components/shared/PDFPlaceholder';
export type { PDFPlaceholderProps } from './components/shared/PDFPlaceholder';

export { PageCountBadge } from './components/shared/PageCountBadge';
export type { PageCountBadgeProps } from './components/shared/PageCountBadge';

// =============================================================================
// Constants Export
// =============================================================================

export {
  PRESET_LOCATIONS,
  APPLIANCE_TYPES,
  SUGGESTED_TAGS,
  METADATA_CONSTRAINTS,
  THUMBNAIL_SIZE,
  THUMBNAIL_DEFAULTS,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
  THUMBNAIL_TIMEOUT,
  VIDEO_SEEK_TIME,
  TEXT_EDITOR_CONSTRAINTS,
  MARKDOWN_FORMATS,
} from './utils/constants';
export type { PresetLocation, SuggestedTag, MarkdownFormatKey } from './utils/constants';

// =============================================================================
// Thumbnail Generation Utilities (REQ-040)
// =============================================================================

/**
 * Thumbnail generation utilities are designed to be lazy-loaded.
 * For optimal bundle size, use dynamic import:
 *
 * @example
 * const { generateThumbnail } = await import('@/components/ItemCapture/utils/thumbnailGenerator');
 * const thumbnail = await generateThumbnail(file);
 */
export {
  generateThumbnail,
  generateImageThumbnail,
  generateVideoThumbnail,
} from './utils/thumbnailGenerator';
export type { ThumbnailOptions } from './utils/thumbnailGenerator';

/**
 * PDF thumbnail generation utilities are designed to be lazy-loaded.
 * For optimal bundle size, use dynamic import:
 *
 * @example
 * const { generatePDFThumbnailWithMetadata } = await import('@/components/ItemCapture/utils/pdfThumbnailGenerator');
 * const result = await generatePDFThumbnailWithMetadata(pdfFile);
 */
export {
  generatePDFThumbnailWithMetadata,
  generatePDFThumbnail,
  getPDFPageCount,
} from './utils/pdfThumbnailGenerator';

// =============================================================================
// Main Component Export
// =============================================================================

// TODO: Add main component export in later task
// export { ItemCapture } from './ItemCapture';
