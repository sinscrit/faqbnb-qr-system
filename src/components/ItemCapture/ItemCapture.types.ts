/**
 * ItemCapture Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the ItemCapture
 * component. These types define the component's props, configuration options,
 * output data structures, and internal state management.
 *
 * @module ItemCapture/types
 * @see docs/prd/item-capture-implementation-plan.md
 * @lastModified 2025-12-31 (REQ-032 Task 2-4)
 */

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
