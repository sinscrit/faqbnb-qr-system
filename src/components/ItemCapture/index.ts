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
 * @lastModified 2025-12-31 (REQ-052 - Added validation utilities and useItemValidation hook)
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
// useMediaEditor Types (REQ-046)
// =============================================================================

export type {
  UseMediaEditorOptions,
  UseMediaEditorReturn,
  MediaEditState,
  CropDescriptor,
  RotationDegrees,
  TrimDescriptor,
  EditType,
  EditSummary,
  EditConfirmationResult,
  MediaEditorError,
  MediaEditorErrorCode,
} from './ItemCapture.types';

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

export { useMediaEditor } from './hooks';

export { useItemValidation, type UseItemValidationReturn, type ValidatableField } from './hooks';

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

export { MediaEditorStep } from './components/steps/MediaEditorStep';
export type { MediaEditorStepProps, ImageEditPhase } from './components/steps/MediaEditorStep';

export { ReviewStep } from './components/steps/ReviewStep';
export type { ReviewStepProps } from './components/steps/ReviewStep';

// =============================================================================
// Editor Components (REQ-045, REQ-047, REQ-048, REQ-050)
// =============================================================================

export { MarkdownEditor } from './editors/MarkdownEditor';
export type { MarkdownEditorProps } from './editors/MarkdownEditor';

/**
 * ImageCropper component is lazy-loaded only when user enters edit mode.
 * For optimal bundle size, use dynamic import:
 *
 * @example
 * const ImageCropper = dynamic(() => import('./editors/ImageCropper'), { ssr: false });
 */
export { default as ImageCropper } from './editors/ImageCropper';
export type { ImageCropperProps, AspectRatioPreset } from './editors/ImageCropper';

/**
 * ImageRotator component is lazy-loaded only when user enters edit mode.
 * For optimal bundle size, use dynamic import:
 *
 * @example
 * const ImageRotator = dynamic(() => import('./editors/ImageRotator'), { ssr: false });
 */
export { default as ImageRotator } from './editors/ImageRotator';
export type { ImageRotatorProps } from './editors/ImageRotator';

/**
 * VideoTrimmer component (V1 Simplified) - lazy-loaded for video editing.
 * This component captures trim markers as metadata only - actual video
 * encoding is deferred to the server at upload time.
 *
 * For optimal bundle size, use dynamic import:
 *
 * @example
 * const VideoTrimmer = dynamic(() => import('./editors/VideoTrimmer'), { ssr: false });
 */
export { default as VideoTrimmer } from './editors/VideoTrimmer';
export type { VideoTrimmerProps, TrimDescriptor as VideoTrimDescriptor } from './editors/VideoTrimmer';

// Trim utilities
export {
  formatTime,
  parseTime,
  validateTrim,
  timeToPercent,
  percentToTime,
  clampMarkerPosition,
} from './editors/trimUtils';
export type { TrimValidation } from './editors/trimUtils';

// Rotation utilities
export {
  rotateImage,
  calculateNextRotation,
  degreesToRadians,
  ROTATION_ERROR_MESSAGES,
} from './editors/rotationUtils';
export type { RotationDegrees as RotationDegreesUtil } from './editors/rotationUtils';

// =============================================================================
// Shared Components (REQ-037, REQ-043, REQ-051)
// =============================================================================

export { CameraPreview } from './components/shared/CameraPreview';

export { PDFPlaceholder } from './components/shared/PDFPlaceholder';
export type { PDFPlaceholderProps } from './components/shared/PDFPlaceholder';

export { PageCountBadge } from './components/shared/PageCountBadge';
export type { PageCountBadgeProps } from './components/shared/PageCountBadge';

export { MediaThumbnail } from './components/shared/MediaThumbnail';
export type { MediaThumbnailProps } from './components/shared/MediaThumbnail';

export { ValidationMessage, ValidationMessageList } from './components/shared/ValidationMessage';
export type { ValidationMessageProps, ValidationMessageType, ValidationMessageListProps } from './components/shared/ValidationMessage';

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
  CAPTURE_CONSTRAINTS,
  SUPPORTED_FORMATS,
} from './utils/constants';
export type {
  PresetLocation,
  SuggestedTag,
  MarkdownFormatKey,
  SupportedImageFormat,
  SupportedVideoFormat,
  SupportedPDFFormat,
} from './utils/constants';

// =============================================================================
// Validation Utilities (REQ-052)
// =============================================================================

export {
  formatFileSize,
  parseFileSize,
  validateTitle,
  validateContentRequirement,
  validateFileSize,
  validateTotalSize,
  validateTextLength,
  validateImageCount,
  validateMimeType,
  validateItemCapture,
  getMediaTypeFromMime,
  calculateRemainingSize,
  calculateTotalSize,
  wouldExceedTotalSize,
} from './utils/validation';
export type {
  ValidationResult,
  FileSizeValidationResult,
  TotalSizeValidationResult,
  ItemCaptureValidation,
} from './utils/validation';

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
// Assembly Utilities (REQ-053)
// =============================================================================

export { generateUUID, isValidUUID } from './utils/generateUUID';
export {
  assembleItemRecord,
  determineContentType,
  type InternalMediaItem,
  type InternalState,
  type AssemblyOptions,
} from './utils/assembleItemRecord';

// =============================================================================
// Main Component Export
// =============================================================================

export { ItemCapture } from './ItemCapture';
export type { ItemCaptureProps } from './ItemCapture.types';
