/**
 * ItemCreationWorkflow Constants
 *
 * This file contains all constant values used by the ItemCreationWorkflow component,
 * including room types, item types, content types, and workflow configuration.
 *
 * @module ItemCreationWorkflow/utils/constants
 * @see docs/prd/Plan-093-Item-Creation-Workflow.md
 * @lastModified 2026-01-05 (REQ-108 Multi-Content Item Support)
 */

// =============================================================================
// Room Configuration
// =============================================================================

/**
 * All available room types for item categorization.
 * Order determines display order in UI.
 */
export const ROOM_TYPES = [
  'kitchen',
  'laundry',
  'bedroom',
  'bathroom',
  'living-room',
  'garage',
  'outdoor',
  'general',
  'other',
] as const;

/**
 * Type for room values derived from ROOM_TYPES constant.
 */
export type RoomTypeConst = (typeof ROOM_TYPES)[number];

/**
 * Human-readable labels for each room type.
 * Used for display in UI selection components.
 */
export const ROOM_LABELS: Record<RoomTypeConst, string> = {
  kitchen: 'Kitchen',
  laundry: 'Laundry Room',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  'living-room': 'Living Room',
  garage: 'Garage',
  outdoor: 'Outdoor/Patio',
  general: 'General/Whole Property',
  other: 'Other',
};

/**
 * Icon identifiers for each room type.
 * Uses Lucide React icon names for consistency with project iconography.
 */
export const ROOM_ICONS: Record<RoomTypeConst, string> = {
  kitchen: 'chef-hat',
  laundry: 'shirt',
  bedroom: 'bed',
  bathroom: 'shower-head',
  'living-room': 'sofa',
  garage: 'car',
  outdoor: 'tree',
  general: 'info',
  other: 'map-pin',
};

// =============================================================================
// Item Type Configuration
// =============================================================================

/**
 * Available item type categories.
 */
export const ITEM_TYPES = ['appliance', 'room-item', 'general-info'] as const;

/**
 * Type for item type values derived from ITEM_TYPES constant.
 */
export type ItemTypeConst = (typeof ITEM_TYPES)[number];

/**
 * Human-readable labels for each item type.
 */
export const ITEM_TYPE_LABELS: Record<ItemTypeConst, string> = {
  appliance: 'Appliance',
  'room-item': 'Room Item',
  'general-info': 'General Info',
};

/**
 * Descriptive text for each item type.
 * Displayed as helper text in selection UI.
 */
export const ITEM_TYPE_DESCRIPTIONS: Record<ItemTypeConst, string> = {
  appliance: 'Washer, dryer, stove, refrigerator, etc.',
  'room-item': 'Pantry, cabinets, closet, sink, etc.',
  'general-info': 'Trash schedule, WiFi info, house rules, etc.',
};

// =============================================================================
// Content Type Configuration
// =============================================================================

/**
 * Available content types for item documentation.
 */
export const CONTENT_TYPES = ['video', 'photo', 'pdf', 'text', 'url'] as const;

/**
 * Type for content type values derived from CONTENT_TYPES constant.
 */
export type ContentTypeConst = (typeof CONTENT_TYPES)[number];

/**
 * Human-readable labels for each content type.
 */
export const CONTENT_TYPE_LABELS: Record<ContentTypeConst, string> = {
  video: 'Video',
  photo: 'Photo',
  pdf: 'PDF Document',
  text: 'Text Instructions',
  url: 'Link/URL',
};

/**
 * Content source options with type-specific labels.
 * Maps source choice to available content types and their labels.
 */
export const CONTENT_SOURCE_OPTIONS = {
  existing: {
    video: 'Upload Video',
    photo: 'Upload Photo',
    pdf: 'Upload PDF',
    text: 'Paste Text',
    url: 'Paste URL',
  },
  'create-new': {
    video: 'Record Video',
    photo: 'Take Photo',
    text: 'Write Text',
  },
} as const;

// =============================================================================
// Workflow Configuration
// =============================================================================

/**
 * Default configuration values for the workflow.
 */
export const WORKFLOW_CONFIG_DEFAULTS = {
  /** Maximum number of items per session */
  maxItemsPerSession: 50,
  /** Whether to enable URL preview with metadata fetching */
  enableUrlPreview: true,
  /** Whether to enable debug logging */
  debug: false,
} as const;

/**
 * Maximum number of content pieces allowed per item.
 * Prevents system abuse while accommodating legitimate multi-content use cases.
 */
export const MAX_CONTENT_PIECES = 10;

/**
 * Ordered list of all workflow steps.
 * Used for navigation logic and progress calculation.
 */
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'content-source-selection',
  'content-type-selection',
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;

/**
 * Type for workflow step values derived from WORKFLOW_STEPS constant.
 */
export type WorkflowStepConst = (typeof WORKFLOW_STEPS)[number];

// =============================================================================
// UI Constants
// =============================================================================

/**
 * Minimum touch target size in pixels.
 * Per PRD accessibility requirement for mobile-first design.
 */
export const TOUCH_TARGET_MIN_SIZE = 48;

/**
 * Progress weights for each step.
 * Used to calculate progress bar percentage.
 */
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 10,
  'item-type-selection': 20,
  'specific-item-selection': 30,
  'content-source-selection': 40,
  'content-type-selection': 50,
  'content-creation': 70,
  'preview-save': 85,
  'next-action': 90,
  'session-summary': 100,
};
