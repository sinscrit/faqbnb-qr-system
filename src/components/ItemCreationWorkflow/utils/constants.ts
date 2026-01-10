/**
 * ItemCreationWorkflow Constants
 *
 * All configuration constants for the ItemCreationWorkflow component:
 * - Room types and labels
 * - Item type categories
 * - Content type options
 * - Workflow step configuration
 * - UI/UX constants
 *
 * @example Importing constants
 * ```tsx
 * import {
 *   ROOM_TYPES,
 *   ROOM_LABELS,
 *   ITEM_TYPES,
 *   WORKFLOW_STEPS,
 * } from '@/components/ItemCreationWorkflow/utils/constants';
 *
 * const roomOptions = ROOM_TYPES.map(room => ({
 *   value: room,
 *   label: ROOM_LABELS[room],
 * }));
 * ```
 *
 * @module ItemCreationWorkflow/utils/constants
 * @see SUGGESTION_MATRIX for item suggestions per room
 * @lastModified 2026-01-10 (REQ-154 Purpose Selection Step - Plan-094)
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
// Purpose Type Configuration
// =============================================================================

/**
 * Available purpose types for item content.
 * Describes the intent/goal of the content being created.
 * Based on Plan-094 UI/UX Workflow Improvements.
 */
export const PURPOSE_TYPES = [
  'how-to-use',
  'how-to-clean',
  'troubleshooting',
  'safety-info',
  'maintenance',
  'features',
  'other',
] as const;

/**
 * Type for purpose values derived from PURPOSE_TYPES constant.
 */
export type PurposeTypeConst = (typeof PURPOSE_TYPES)[number];

/**
 * Human-readable labels for each purpose type.
 * Displayed as card titles in PurposeStep.
 */
export const PURPOSE_LABELS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};

/**
 * Descriptive text for each purpose type.
 * Displayed as helper text in PurposeStep cards.
 */
export const PURPOSE_DESCRIPTIONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'Operating instructions and controls',
  'how-to-clean': 'Cleaning and care instructions',
  'troubleshooting': 'Common issues and fixes',
  'safety-info': 'Safety warnings and precautions',
  'maintenance': 'Regular maintenance tasks',
  'features': 'Special features and tips',
  'other': 'General information',
};

/**
 * Icon identifiers for each purpose type.
 * Uses Lucide React icon names for consistency.
 */
export const PURPOSE_ICONS: Record<PurposeTypeConst, string> = {
  'how-to-use': 'play-circle',
  'how-to-clean': 'sparkles',
  'troubleshooting': 'wrench',
  'safety-info': 'alert-triangle',
  'maintenance': 'settings',
  'features': 'star',
  'other': 'info',
};

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
 *
 * Updated for Plan-094:
 * - Removed: content-source-selection (redundant)
 * - Added: purpose-selection (new step after specific-item)
 */
export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',        // NEW - replaces content-source-selection
  'content-type-selection',   // Now part of main flow
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
 * Updated for Plan-094 workflow changes.
 */
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 11,
  'item-type-selection': 22,
  'specific-item-selection': 33,
  'purpose-selection': 44,        // NEW
  'content-type-selection': 55,   // Added to main flow
  'content-creation': 66,
  'preview-save': 77,
  'next-action': 88,
  'session-summary': 100,
};

// =============================================================================
// Text Truncation Configuration
// =============================================================================

/** Default maximum length for item names in list displays */
export const DEFAULT_TRUNCATE_LENGTH = 40;

/**
 * Truncates text to specified length with ellipsis.
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: DEFAULT_TRUNCATE_LENGTH)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateWithEllipsis(
  text: string,
  maxLength: number = DEFAULT_TRUNCATE_LENGTH
): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Checks if text would need truncation.
 * @param text - Text to check
 * @param maxLength - Maximum length (default: DEFAULT_TRUNCATE_LENGTH)
 * @returns true if text exceeds maxLength
 */
export function shouldTruncate(
  text: string,
  maxLength: number = DEFAULT_TRUNCATE_LENGTH
): boolean {
  return text?.length > maxLength;
}
