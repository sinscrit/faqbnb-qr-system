/**
 * ItemCapture Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the ItemCapture
 * component. These types define the component's props, configuration options,
 * output data structures, and internal state management.
 *
 * @module ItemCapture/types
 * @see docs/prd/item-capture-implementation-plan.md
 * @lastModified 2025-12-31 (REQ-043 Task 3.3.2)
 */

import type { PDFErrorCode } from './utils/pdfConstants';

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration options for ItemCapture behavior.
 * All properties are optional with sensible defaults.
 */
export interface ItemCaptureConfig {
  /** Maximum video recording duration in seconds (default: 120) */
  maxVideoDuration?: number;

  /** Maximum file size in bytes per file (default: 104857600 = 100MB) */
  maxFileSize?: number;

  /** Maximum total size in bytes for all media (default: 209715200 = 200MB) */
  maxTotalSize?: number;

  /** Allowed media types (default: all supported types) */
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];

  /** Maximum photos per item (default: 10) */
  maxPhotos?: number;

  /** Maximum markdown character count (default: 5000) */
  maxTextLength?: number;

  /** Preferred video resolution (default: { width: 1920, height: 1080 }) */
  videoResolution?: { width: number; height: number };

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Main component props for ItemCapture.
 */
export interface ItemCaptureProps {
  /** Called when user successfully submits the item record */
  onComplete: (record: ItemRecord) => void;

  /** Called when user cancels/abandons the capture flow */
  onCancel: () => void;

  /** Optional configuration overrides */
  config?: ItemCaptureConfig;

  /** Optional CSS class name for the root element */
  className?: string;
}

// =============================================================================
// Output Types (Public API)
// =============================================================================

/**
 * Appliance type categories for item classification.
 */
export type ApplianceType =
  | 'washer'
  | 'dryer'
  | 'dishwasher'
  | 'oven'
  | 'microwave'
  | 'refrigerator'
  | 'hvac'
  | 'water_heater'
  | 'garbage_disposal'
  | 'security_system'
  | 'smart_home'
  | 'entertainment'
  | 'pool_spa'
  | 'garage'
  | 'other';

/**
 * Type-specific metadata for media items.
 */
export interface MediaMetadata {
  /** Video duration in seconds (video only) */
  duration?: number;

  /** Image/video dimensions */
  dimensions?: { width: number; height: number };

  /** Original filename if uploaded */
  originalFilename?: string;

  /** PDF page count (PDF only) */
  pageCount?: number;

  /** MIME type of the file */
  mimeType: string;

  /** File size in bytes */
  fileSize: number;

  /** Whether file was captured or uploaded */
  source: 'capture' | 'upload';

  /** Editing operations applied */
  edits?: {
    cropped?: boolean;
    rotated?: number; // degrees
    trimStart?: number; // seconds
    trimEnd?: number; // seconds
  };
}

/**
 * Individual media item within an ItemRecord.
 */
export interface MediaItem {
  /** Local UUID for this media item */
  id: string;

  /** Type of media */
  type: 'video' | 'image' | 'pdf';

  /** The actual file/blob data */
  file: File | Blob;

  /** Generated thumbnail (for preview purposes) */
  thumbnail?: Blob;

  /** Display order (0-indexed) */
  order: number;

  /** Type-specific metadata */
  metadata: MediaMetadata;
}

/**
 * The structured output returned via onComplete callback.
 * This is the primary data structure consumed by parent components.
 */
export interface ItemRecord {
  /** Local UUID generated for this item */
  id: string;

  /** User-provided title (required) */
  title: string;

  /** Optional location within property (e.g., "Kitchen", "Master Bathroom") */
  location?: string;

  /** Optional tags for categorization */
  tags?: string[];

  /** Optional appliance type from predefined list */
  applianceType?: ApplianceType;

  /** Type of content combination */
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';

  /** Array of captured/uploaded media items */
  media: MediaItem[];

  /** Optional markdown-formatted instructions */
  instructions?: string;

  /** Timestamp of record creation */
  createdAt: Date;
}

// =============================================================================
// Internal State Types (for component development)
// =============================================================================

/**
 * Wizard step identifiers for navigation state machine.
 */
export type WizardStep =
  | 'metadata'
  | 'content-type'
  | 'capture-video'
  | 'capture-photo'
  | 'upload-file'
  | 'write-text'
  | 'edit-media'
  | 'add-more'
  | 'review';

/**
 * Internal metadata state interface for form handling.
 */
export interface ItemMetadata {
  /** User-provided title */
  title: string;

  /** Optional location within property */
  location?: string;

  /** Optional tags for categorization */
  tags?: string[];

  /** Optional appliance type */
  applianceType?: ApplianceType;
}

/**
 * Complete state object managed by useItemCaptureState hook.
 * Single source of truth for all wizard data.
 */
export interface ItemCaptureState {
  // Navigation
  /** Current wizard step */
  currentStep: WizardStep;

  /** Step history for back navigation */
  stepHistory: WizardStep[];

  // Data
  /** Item metadata from MetadataStep */
  metadata: ItemMetadata;

  /** Collection of captured/uploaded media */
  mediaItems: MediaItem[];

  /** Markdown instructions text */
  instructions: string;

  // Validation
  /** Field-level validation errors */
  errors: Record<string, string>;

  // Resource states
  /** Whether video recording is in progress */
  isRecording: boolean;

  /** Whether camera is currently active */
  isCameraActive: boolean;

  // UI state
  /** Whether form is currently submitting */
  isSubmitting: boolean;

  /** Track unsaved changes */
  isDirty: boolean;
}

/**
 * All actions that can be dispatched to modify ItemCapture state.
 * Uses discriminated union pattern for type safety.
 */
export type ItemCaptureAction =
  // Metadata actions
  | { type: 'SET_METADATA'; payload: Partial<ItemMetadata> }

  // Media actions
  | { type: 'ADD_MEDIA'; payload: MediaItem }
  | { type: 'REMOVE_MEDIA'; payload: string } // by id
  | { type: 'UPDATE_MEDIA'; payload: { id: string; updates: Partial<MediaItem> } }
  | { type: 'REORDER_MEDIA'; payload: { fromIndex: number; toIndex: number } }

  // Instructions
  | { type: 'SET_INSTRUCTIONS'; payload: string }

  // Navigation
  | { type: 'GO_TO_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

  // Errors
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string } // field name
  | { type: 'CLEAR_ALL_ERRORS' }

  // Resource states
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ACTIVATE_CAMERA' }
  | { type: 'DEACTIVATE_CAMERA' }

  // Submission
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET' };

// =============================================================================
// Media Capture Types (REQ-036)
// =============================================================================

/**
 * Permission status for camera/microphone access.
 * Mirrors the Permissions API states with additional handling for unsupported browsers.
 */
export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';

/**
 * Error codes for media capture operations.
 * Each code maps to a specific user-actionable error scenario.
 */
export type MediaCaptureErrorCode =
  | 'PERMISSION_DENIED'
  | 'PERMISSION_DISMISSED'
  | 'NO_DEVICE_FOUND'
  | 'DEVICE_IN_USE'
  | 'BROWSER_NOT_SUPPORTED'
  | 'STREAM_ERROR'
  | 'RECORDING_ERROR'
  | 'CONSTRAINT_ERROR'
  | 'CAPTURE_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Structured error type for media capture operations.
 * Provides user-friendly messages and recovery guidance.
 */
export interface MediaCaptureError {
  /** Error code for programmatic handling */
  code: MediaCaptureErrorCode;
  /** User-friendly error message */
  message: string;
  /** Actionable guidance for the user */
  action: string;
  /** Whether the error can be resolved by retrying */
  recoverable: boolean;
  /** Original error for debugging purposes */
  originalError?: Error;
}

/**
 * Browser capability detection results.
 * Used to determine which features are available before attempting media operations.
 */
export interface BrowserCapabilities {
  /** Whether all required APIs are available */
  isSupported: boolean;
  /** navigator.mediaDevices availability */
  hasMediaDevices: boolean;
  /** getUserMedia availability */
  hasGetUserMedia: boolean;
  /** MediaRecorder availability */
  hasMediaRecorder: boolean;
  /** enumerateDevices availability */
  hasEnumerateDevices: boolean;
  /** Human-readable reason when not supported */
  unsupportedReason?: string;
}

/**
 * Configuration options for useMediaCapture hook.
 */
export interface UseMediaCaptureOptions {
  /** Preferred video resolution (default: { width: 1920, height: 1080 }) */
  resolution?: { width: number; height: number };
  /** Preferred frame rate (default: 30) */
  frameRate?: number;
  /** Initial facing mode preference (default: 'environment') */
  facingMode?: 'user' | 'environment';
  /** Whether to include audio in video recording (default: true) */
  includeAudio?: boolean;
  /** Photo capture format (default: 'image/jpeg') */
  photoFormat?: 'image/jpeg' | 'image/png';
  /** Photo capture quality 0-1 (default: 0.92) */
  photoQuality?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Camera facing mode as detected from stream.
 */
export type FacingMode = 'user' | 'environment' | 'unknown';

/**
 * Return type for useMediaCapture hook.
 * Provides all state and actions for camera/recording operations.
 */
export interface UseMediaCaptureReturn {
  // State
  /** Browser capability detection result */
  capabilities: BrowserCapabilities;
  /** Current permission status */
  permissionStatus: PermissionStatus;
  /** Available camera devices */
  devices: MediaDeviceInfo[];
  /** Currently selected device ID */
  selectedDeviceId: string | null;
  /** Active media stream */
  stream: MediaStream | null;
  /** Whether camera is currently active */
  isCameraActive: boolean;
  /** Whether video recording is in progress */
  isRecording: boolean;
  /** Current recording duration in seconds */
  recordingTime: number;
  /** Current facing mode (front/back camera) */
  facingMode: FacingMode;
  /** Current error state */
  error: MediaCaptureError | null;

  // Actions
  /** Request camera/microphone permission */
  requestPermission: () => Promise<boolean>;
  /** Refresh available camera devices list */
  refreshDevices: () => Promise<void>;
  /** Start camera stream */
  startCamera: (deviceId?: string) => Promise<boolean>;
  /** Stop camera stream and release resources */
  stopCamera: () => void;
  /** Switch to a different camera device */
  switchCamera: (deviceId: string) => Promise<boolean>;
  /** Toggle between front and back camera */
  toggleFacingMode: () => Promise<boolean>;
  /** Start video recording */
  startRecording: () => Promise<boolean>;
  /** Stop video recording and return the recorded Blob */
  stopRecording: () => Promise<Blob | null>;
  /** Capture a photo from current stream */
  capturePhoto: () => Promise<Blob | null>;
  /** Clear current error state */
  clearError: () => void;
  /** Perform full cleanup of all resources */
  cleanup: () => void;
}

// =============================================================================
// CameraPreview Types (REQ-037)
// =============================================================================

/**
 * Props for the CameraPreview component.
 * Displays live camera feed with loading, error, and mirror mode states.
 * @lastModified 2025-12-31 (REQ-037)
 */
export interface CameraPreviewProps {
  /** Media stream from useMediaCapture hook (null when inactive) */
  stream: MediaStream | null;

  /** Whether the camera is currently loading/initializing */
  isLoading: boolean;

  /** Error object from useMediaCapture (null when no error) */
  error: MediaCaptureError | null;

  /** Whether to mirror the video preview (for front-facing camera) */
  isMirrored: boolean;

  /** Callback to toggle mirror mode */
  onMirrorToggle?: () => void;

  /** Detected facing mode from useMediaCapture */
  facingMode?: 'user' | 'environment' | 'unknown';

  /** Optional aspect ratio (default: 16/9) */
  aspectRatio?: number;

  /** Optional additional CSS classes */
  className?: string;

  /** Whether the component is in a compact mode (e.g., thumbnail preview) */
  compact?: boolean;

  /** Callback when user wants to retry after error */
  onRetry?: () => void;

  /** Callback when user wants to open settings (permission denied) */
  onOpenSettings?: () => void;
}

// =============================================================================
// File Upload Types (REQ-041)
// =============================================================================

/**
 * File category for uploaded files based on MIME type.
 */
export type FileCategory = 'image' | 'video' | 'pdf' | 'other';

/**
 * Error codes for file rejection during upload.
 * Each code maps to a specific validation failure.
 */
export type FileRejectionCode =
  | 'FILE_TYPE_NOT_ALLOWED'
  | 'FILE_TOO_LARGE'
  | 'TOTAL_SIZE_EXCEEDED'
  | 'MAX_FILES_EXCEEDED'
  | 'EMPTY_FILE'
  | 'VALIDATION_ERROR';

/**
 * A validated file with metadata extracted during upload.
 */
export interface ValidatedFile {
  /** Unique UUID for this file */
  id: string;
  /** Original File object */
  file: File;
  /** Validated MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Original filename */
  name: string;
  /** Lowercase file extension */
  extension: string;
  /** File category based on MIME type */
  category: FileCategory;
  /** Object URL for preview (for images/videos) */
  previewUrl?: string;
  /** Timestamp when file was added */
  addedAt: Date;
}

/**
 * Information about a rejected file including error details.
 */
export interface FileRejection {
  /** Original File object that was rejected */
  file: File;
  /** Error code identifying the rejection reason */
  code: FileRejectionCode;
  /** User-friendly error message */
  message: string;
  /** Suggested action to resolve the issue */
  action: string;
}

/**
 * Hook-level error for file upload operations.
 */
export interface FileUploadError {
  /** Error code for programmatic handling */
  code: FileRejectionCode | 'UNKNOWN_ERROR';
  /** User-friendly error message */
  message: string;
  /** Suggested action for recovery */
  action: string;
}

/**
 * Result of validating a single file.
 */
export interface FileValidationResult {
  /** Whether the file passed validation */
  valid: boolean;
  /** Rejection details if invalid */
  rejection?: FileRejection;
  /** Validated file metadata if valid */
  validatedFile?: Omit<ValidatedFile, 'id' | 'previewUrl' | 'addedAt'>;
}

/**
 * Configuration options for useFileUpload hook.
 */
export interface UseFileUploadOptions {
  /** Array of allowed MIME types (e.g., ['image/*', 'video/mp4']) */
  allowedMimeTypes?: string[];
  /** Maximum file size in bytes per file */
  maxFileSize?: number;
  /** Maximum total size in bytes for all files */
  maxTotalSize?: number;
  /** Allow multiple file selection (default: true) */
  multiple?: boolean;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Accept attribute for file input (overrides allowedMimeTypes) */
  accept?: string;
  /** Callback when files are successfully added */
  onFilesAdded?: (files: ValidatedFile[]) => void;
  /** Callback when files are rejected */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Props returned by getDropZoneProps for spreading on drop zone element.
 */
export interface DropZoneProps {
  /** Drag enter handler */
  onDragEnter: (e: React.DragEvent) => void;
  /** Drag over handler */
  onDragOver: (e: React.DragEvent) => void;
  /** Drag leave handler */
  onDragLeave: (e: React.DragEvent) => void;
  /** Drop handler */
  onDrop: (e: React.DragEvent) => void;
  /** Click handler to open file picker */
  onClick: () => void;
  /** Keyboard handler for accessibility */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Role attribute for accessibility */
  role: 'button';
  /** Tab index for keyboard navigation */
  tabIndex: number;
  /** Aria label for screen readers */
  'aria-label': string;
}

/**
 * Props returned by getInputProps for spreading on hidden file input.
 */
export interface InputProps {
  /** Input type */
  type: 'file';
  /** Ref for the input element */
  ref: React.RefObject<HTMLInputElement>;
  /** Change handler for file selection */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Accept attribute for file type filtering */
  accept: string;
  /** Whether multiple files can be selected */
  multiple: boolean;
  /** Hidden styling */
  style: { display: 'none' };
  /** Hidden from accessibility tree */
  'aria-hidden': true;
}

/**
 * Return type for useFileUpload hook.
 * Provides all state and actions for file upload operations.
 */
export interface UseFileUploadReturn {
  // State
  /** Array of validated files that have been added */
  files: ValidatedFile[];
  /** Array of files that were rejected during last operation */
  rejectedFiles: FileRejection[];
  /** Total size in bytes of all added files */
  totalSize: number;
  /** Whether there are any files */
  hasFiles: boolean;
  /** Whether a drag operation is currently over the drop zone */
  isDragActive: boolean;
  /** Whether dragged files appear to be valid types */
  isDragValid: boolean;
  /** Current error state */
  error: FileUploadError | null;

  // Actions
  /** Open the native file picker dialog */
  openFilePicker: () => void;
  /** Remove a file by index or ID */
  removeFile: (indexOrId: number | string) => void;
  /** Remove all files and reset state */
  clearFiles: () => void;
  /** Clear current error state */
  clearError: () => void;
  /** Validate a file without adding it */
  validateFile: (file: File) => FileValidationResult;

  // Props factories
  /** Get props to spread on drop zone element */
  getDropZoneProps: () => DropZoneProps;
  /** Get props to spread on hidden file input */
  getInputProps: () => InputProps;
}

// =============================================================================
// PDF Thumbnail Types (REQ-043)
// =============================================================================

/**
 * Structured error type for PDF thumbnail generation failures.
 * Provides error classification and user-friendly messaging.
 */
export interface PDFThumbnailError {
  /** Error code for programmatic handling */
  code: PDFErrorCode;
  /** Technical error message for debugging */
  message: string;
  /** User-friendly message suitable for display */
  userMessage: string;
}

/**
 * Result of PDF thumbnail generation operation.
 * Contains the thumbnail blob, page count, and error/status information.
 */
export interface PDFThumbnailResult {
  /** Generated thumbnail blob (null if generation failed) */
  thumbnail: Blob | null;
  /** Number of pages in the PDF */
  pageCount: number;
  /** Error details if thumbnail generation failed */
  error?: PDFThumbnailError;
  /** Whether the PDF is password-protected */
  isPasswordProtected: boolean;
  /** Whether the PDF is corrupted or malformed */
  isCorrupt: boolean;
}

// =============================================================================
// useMediaEditor Types (REQ-046)
// =============================================================================

/**
 * Configuration options for useMediaEditor hook.
 * @lastModified 2025-12-31 (REQ-046)
 */
export interface UseMediaEditorOptions {
  /** Maximum number of concurrent edit sessions (default: 5) */
  maxConcurrentEdits?: number;
  /** Whether to auto-generate previews on edit changes (default: true) */
  autoGeneratePreview?: boolean;
  /** Preview quality for images (0-1, default: 0.8) */
  previewQuality?: number;
  /** Maximum preview dimensions (default: { width: 800, height: 800 }) */
  maxPreviewSize?: { width: number; height: number };
  /** Callback when edit state changes */
  onEditStateChange?: (mediaId: string, state: MediaEditState) => void;
  /** Callback when edits are confirmed */
  onEditsConfirmed?: (mediaId: string, result: EditConfirmationResult) => void;
  /** Callback when edits are cancelled */
  onEditsCancelled?: (mediaId: string) => void;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Current edit state for a media item.
 * Tracks all non-destructive edit operations.
 */
export interface MediaEditState {
  /** ID of the media item being edited */
  mediaId: string;
  /** Reference to original media (preserved until confirmation) */
  originalMedia: MediaItem;
  /** Crop descriptor if crop is applied */
  crop: CropDescriptor | null;
  /** Rotation in 90-degree increments */
  rotation: RotationDegrees;
  /** Trim descriptor for video (null for images) */
  trim: TrimDescriptor | null;
  /** Generated preview URL (Object URL) */
  previewUrl: string | null;
  /** Whether preview generation is in progress */
  isGeneratingPreview: boolean;
  /** Whether any edits have been made */
  isDirty: boolean;
  /** When editing session started */
  startedAt: Date;
  /** When last edit was made */
  lastModifiedAt: Date;
}

/**
 * Descriptor for crop operation (percentages 0-100).
 * Using percentages allows consistent behavior across different image sizes.
 */
export interface CropDescriptor {
  /** X offset from left edge (0-100) */
  x: number;
  /** Y offset from top edge (0-100) */
  y: number;
  /** Width of crop area (0-100) */
  width: number;
  /** Height of crop area (0-100) */
  height: number;
  /** Optional aspect ratio constraint */
  aspectRatio?: number;
}

/**
 * Rotation in 90-degree increments.
 * Limited to these values for consistent behavior.
 */
export type RotationDegrees = 0 | 90 | 180 | 270;

/**
 * Descriptor for video trim operation.
 * Times are in seconds.
 */
export interface TrimDescriptor {
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds */
  endTime: number;
  /** Original video duration for reference */
  originalDuration: number;
}

/**
 * Types of edits supported by the media editor.
 */
export type EditType = 'crop' | 'rotation' | 'trim';

/**
 * Result of confirming edits.
 * Contains the edited blob (for images) and metadata about applied edits.
 */
export interface EditConfirmationResult {
  /** Whether confirmation succeeded */
  success: boolean;
  /** Edited blob (for images; undefined for videos in V1) */
  editedBlob?: Blob;
  /** Updated metadata reflecting edits */
  editedMetadata: MediaMetadata;
  /** Summary of all edits that were applied */
  appliedEdits: EditSummary;
  /** Error message if confirmation failed */
  error?: string;
}

/**
 * Summary of edits applied to a media item.
 */
export interface EditSummary {
  /** Whether crop was applied */
  cropped: boolean;
  /** Rotation applied (0 means no rotation) */
  rotated: RotationDegrees;
  /** Trim applied (null if no trim) */
  trimmed: TrimDescriptor | null;
  /** Total count of edit operations */
  editCount: number;
}

/**
 * Error codes for editor operations.
 */
export type MediaEditorErrorCode =
  | 'PREVIEW_GENERATION_FAILED'
  | 'CONFIRM_FAILED'
  | 'INVALID_CROP_BOUNDS'
  | 'INVALID_TRIM_POINTS'
  | 'MAX_SESSIONS_EXCEEDED'
  | 'SESSION_NOT_FOUND'
  | 'UNSUPPORTED_MEDIA_TYPE';

/**
 * Structured error for editor operations.
 * Provides user-friendly messages and recovery guidance.
 */
export interface MediaEditorError {
  /** Error code for programmatic handling */
  code: MediaEditorErrorCode;
  /** User-friendly error message */
  message: string;
  /** Actionable guidance for the user */
  action: string;
  /** Whether the error can be resolved by retrying */
  recoverable: boolean;
}

/**
 * Return type for useMediaEditor hook.
 * Provides all state and actions for non-destructive media editing.
 */
export interface UseMediaEditorReturn {
  // Edit State
  /** Map of all active edit sessions */
  editSessions: Map<string, MediaEditState>;
  /** Get edit state for a specific media item */
  getEditState: (mediaId: string) => MediaEditState | null;
  /** Check if a specific media item has pending (unsaved) edits */
  hasPendingEdits: (mediaId: string) => boolean;
  /** Get list of all media IDs with pending edits */
  getPendingEditIds: () => string[];
  /** Whether any media items have pending edits */
  hasAnyPendingEdits: boolean;

  // Edit Actions
  /** Start an editing session for a media item */
  startEditing: (mediaId: string, originalMedia: MediaItem) => void;
  /** Set crop for a media item */
  setCrop: (mediaId: string, crop: CropDescriptor | null) => void;
  /** Set rotation for a media item */
  setRotation: (mediaId: string, degrees: RotationDegrees) => void;
  /** Set trim for a video item */
  setTrim: (mediaId: string, trim: TrimDescriptor | null) => void;
  /** Reset a specific edit type to default */
  resetEdit: (mediaId: string, editType: EditType) => void;
  /** Reset all edits for a media item */
  resetAllEdits: (mediaId: string) => void;

  // Preview Generation
  /** Get or generate preview for current edits */
  getEditPreview: (mediaId: string) => Promise<string | null>;
  /** Check if preview is currently being generated */
  isGeneratingPreview: (mediaId: string) => boolean;
  /** Force regeneration of preview */
  regeneratePreview: (mediaId: string) => Promise<void>;

  // Confirmation / Cancellation
  /** Apply edits and produce final result */
  confirmEdits: (mediaId: string) => Promise<EditConfirmationResult>;
  /** Cancel all edits and restore original */
  cancelEdits: (mediaId: string) => void;
  /** End editing session (use after confirmation or cancellation) */
  endEditing: (mediaId: string) => void;

  // Utility
  /** Get summary of edits for a media item */
  getEditSummary: (mediaId: string) => EditSummary | null;
  /** Check if a specific edit type has been applied */
  hasEdit: (mediaId: string, editType: EditType) => boolean;
  /** Clear all edit sessions and free resources */
  clearAllSessions: () => void;

  // Error State
  /** Get current error for a media item */
  getError: (mediaId: string) => MediaEditorError | null;
  /** Clear error for a media item */
  clearError: (mediaId: string) => void;
}
