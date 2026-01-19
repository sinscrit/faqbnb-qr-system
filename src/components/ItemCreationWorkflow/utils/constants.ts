/**
 * ItemCreationWorkflow Constants
 *
 * All configuration constants for the ItemCreationWorkflow component:
 * - Room types and labels
 * - Item type categories
 * - Content type options
 * - Purpose type configuration
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
 *   PURPOSE_TYPES,
 *   PURPOSE_LABELS,
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
 * @lastModified 2026-01-10 (Plan-094, REQ-175 Documentation Sync, REQ-177 Tags)
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
// Unified Content Options (REQ-162)
// =============================================================================

/**
 * Interface for unified content options displayed in ContentTypeStep.
 * Consolidates both existing and create-new content types into single grid.
 *
 * @see REQ-162 for consolidation requirements
 * @lastModified 2026-01-10 (REQ-162 Consolidate Content Options)
 */
export interface UnifiedContentOption {
  /** Unique identifier for the option */
  id: string;
  /** Display label for the option */
  label: string;
  /** Optional subtitle text (e.g., supported formats) */
  subtitle?: string;
  /** Icon component name from Lucide React */
  icon: string;
  /** Content type this option creates */
  contentType: ContentTypeConst | 'file-upload';
  /** Content source classification */
  contentSource: 'existing' | 'create-new';
}

/**
 * Unified content options for single-grid selection.
 * All five options are displayed together, eliminating the need
 * for separate ContentSourceStep.
 *
 * Order determines display order in UI grid.
 *
 * @see REQ-162 for consolidation requirements
 * @lastModified 2026-01-10 (REQ-162 Consolidate Content Options)
 */
export const UNIFIED_CONTENT_OPTIONS: UnifiedContentOption[] = [
  {
    id: 'record-video',
    label: 'Record Video',
    icon: 'Video',
    contentType: 'video',
    contentSource: 'create-new',
  },
  {
    id: 'take-photo',
    label: 'Take Photo',
    icon: 'Camera',
    contentType: 'photo',
    contentSource: 'create-new',
  },
  {
    id: 'write-text',
    label: 'Write Text',
    icon: 'PenLine',
    contentType: 'text',
    contentSource: 'create-new',
  },
  {
    id: 'upload-file',
    label: 'Upload File',
    subtitle: 'Video, Image, PDF, Text',
    icon: 'Upload',
    contentType: 'file-upload',
    contentSource: 'existing',
  },
  {
    id: 'add-link',
    label: 'Add Link',
    icon: 'Link',
    contentType: 'url',
    contentSource: 'existing',
  },
];

// =============================================================================
// Purpose Type Configuration (Plan-094)
// =============================================================================

/**
 * Available purpose/intent types for item content.
 *
 * Purpose Types:
 * - how-to-use       - Operating instructions and controls
 * - how-to-clean     - Cleaning and care instructions
 * - troubleshooting  - Common issues and fixes
 * - safety-info      - Safety warnings and precautions
 * - maintenance      - Regular maintenance tasks
 * - features         - Special features and tips
 * - other            - General information
 *
 * @see PurposeStep component for UI implementation
 * @see generateArticleTitle() for title generation using purpose
 * @created 2026-01-09 (Plan-094 Phase 2)
 * @lastModified 2026-01-10 (REQ-175 Documentation Sync)
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
 * Used for display in UI selection components and title generation.
 * Displayed as card titles in PurposeStep.
 *
 * @see generateArticleTitle() - uses labels for title format
 * @lastModified 2026-01-10 (REQ-175 Documentation Sync)
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
 * Displayed as helper text in PurposeStep selection UI cards.
 *
 * @lastModified 2026-01-10 (REQ-175 Documentation Sync)
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
// Tags Configuration (REQ-177)
// =============================================================================

/**
 * Available tags for item categorization.
 * Tags are auto-generated based on room, item type, and purpose selections,
 * and can be manually edited by users in the PreviewSaveStep.
 *
 * Tag Categories:
 * - Room tags: kitchen, laundry, bedroom, bathroom, living-room, garage, outdoor
 * - General tags: general
 * - Item type tags: appliance, room-item
 * - Purpose tags: instructions, cleaning, troubleshooting, safety, maintenance, features, info
 *
 * NOTE: System tag translations are pre-seeded in the database
 * via /database/seeds/20260117_system_tag_translations.sql
 * for all 6 supported languages (en, fr, es, de, nl, it).
 *
 * @see tagMapper.ts for auto-generation logic
 * @see TagsEditor component for UI implementation
 * @see REQ-228 for seed data specification
 * @created 2026-01-10 (REQ-177 Intelligent Pre-filling)
 * @modified 2026-01-18 (REQ-228 L10N seed documentation)
 */
export const AVAILABLE_TAGS = [
  'kitchen',
  'laundry',
  'bedroom',
  'bathroom',
  'living-room',
  'garage',
  'outdoor',
  'general',
  'appliance',
  'room-item',
  'instructions',
  'cleaning',
  'troubleshooting',
  'safety',
  'maintenance',
  'features',
  'info',
] as const;

/**
 * Type for tag values derived from AVAILABLE_TAGS constant.
 */
export type TagTypeConst = (typeof AVAILABLE_TAGS)[number];

/**
 * Human-readable labels for each tag.
 * Used for display in TagsEditor component.
 */
export const TAG_LABELS: Record<TagTypeConst, string> = {
  kitchen: 'Kitchen',
  laundry: 'Laundry',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  'living-room': 'Living Room',
  garage: 'Garage',
  outdoor: 'Outdoor',
  general: 'General',
  appliance: 'Appliance',
  'room-item': 'Room Item',
  instructions: 'Instructions',
  cleaning: 'Cleaning',
  troubleshooting: 'Troubleshooting',
  safety: 'Safety',
  maintenance: 'Maintenance',
  features: 'Features',
  info: 'Info',
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

// =============================================================================
// Workflow Step Separation (REQ-196)
// =============================================================================

/**
 * User-visible workflow steps (for progress indicator).
 * Steps 1-8 are numbered; post-workflow screens are not counted.
 *
 * Step Flow:
 * 1. room-selection        → Select room category
 * 2. item-type-selection   → Select item type (skips if 'general' room)
 * 3. specific-item-selection → Name the specific item
 * 4. purpose-selection     → Select content purpose
 * 5. content-type-selection → Select content format
 * 6. media-capture         → Direct media capture routing
 * 7. content-creation      → Create/upload content (when used)
 * 8. preview-save          → Preview with content, final step
 *
 * @see POST_WORKFLOW_SCREENS for screens after workflow completion
 * @see WORKFLOW_STEPS for complete navigation flow
 * @created 2026-01-12 (REQ-196 Step Count Fix)
 */
export const USER_VISIBLE_STEPS = [
  'room-selection',           // Step 1
  'item-type-selection',      // Step 2
  'specific-item-selection',  // Step 3
  'purpose-selection',        // Step 4
  'content-type-selection',   // Step 5
  'media-capture',            // Step 6
  'content-creation',         // Step 7 (when used)
  'preview-save',             // Step 8 - FINAL user-visible step
] as const;

/**
 * Type for user-visible step values derived from USER_VISIBLE_STEPS constant.
 */
export type UserVisibleStepConst = (typeof USER_VISIBLE_STEPS)[number];

/**
 * Post-workflow screens (no step counter shown).
 * These screens appear after the main workflow is complete.
 * The progress bar should show 100% on these screens.
 *
 * - next-action: User decides what to do next
 * - session-summary: Review all items in session
 *
 * @see USER_VISIBLE_STEPS for numbered workflow steps
 * @created 2026-01-12 (REQ-196 Step Count Fix)
 */
export const POST_WORKFLOW_SCREENS = [
  'next-action',
  'session-summary',
] as const;

/**
 * Type for post-workflow screen values derived from POST_WORKFLOW_SCREENS constant.
 */
export type PostWorkflowScreenConst = (typeof POST_WORKFLOW_SCREENS)[number];

/**
 * Complete navigation flow (internal use).
 * Combines user-visible steps with post-workflow screens.
 *
 * For UI display (step counters, progress bars), use:
 * - USER_VISIBLE_STEPS: Steps 1-8 that are numbered
 * - POST_WORKFLOW_SCREENS: Screens after workflow (no counter)
 *
 * This constant is used internally for:
 * - Navigation state machine
 * - Step transitions
 * - Route validation
 *
 * ## Step Flow (Plan-094 UI/UX Improvements + REQ-176 Media Capture + REQ-196)
 *
 * ```
 * 1. room-selection        → Select room category
 * 2. item-type-selection   → Select item type (skips if 'general' room)
 * 3. specific-item-selection → Name the specific item
 * 4. purpose-selection     → Select content purpose
 * 5. content-type-selection → Select content format (consolidated)
 * 6. media-capture         → Direct media capture routing (REQ-176)
 * 7. content-creation      → Create/upload content (keep for compatibility)
 * 8. preview-save          → Preview with actual content, FINAL numbered step
 * -- Post-workflow (no step counter) --
 * 9. next-action           → Choose next step (simplified: 3 options)
 * 10. session-summary      → Review all items, generate QR codes
 * ```
 *
 * ## Skip Conditions
 * - `item-type-selection`: Skipped when room is 'general'
 *
 * @see USER_VISIBLE_STEPS for numbered steps
 * @see POST_WORKFLOW_SCREENS for post-workflow screens
 * @see Plan-094-UI-UX-Workflow-Improvements.md for implementation details
 * @see STEP_TRANSITIONS in useWorkflowState.ts for navigation logic
 * @see PROGRESS_WEIGHTS for progress calculation
 * @lastModified 2026-01-12 (REQ-196 Step Count Fix)
 */
export const WORKFLOW_STEPS = [
  ...USER_VISIBLE_STEPS,
  ...POST_WORKFLOW_SCREENS,
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
 *
 * REQ-196 Update: Weights recalculated for 8-step workflow.
 * - Progress reaches 100% at preview-save (step 8 of 8)
 * - Post-workflow screens maintain 100% (no regression)
 * - Weights distributed evenly: ~12.5% per step
 * - Rounded to clean numbers for visual consistency
 *
 * @see USER_VISIBLE_STEPS for the 8 user-visible steps
 * @see POST_WORKFLOW_SCREENS for post-workflow screens
 * @lastModified 2026-01-12 (REQ-196 Step Count Fix)
 */
export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 12,           // Step 1 of 8
  'item-type-selection': 25,      // Step 2 of 8
  'specific-item-selection': 37,  // Step 3 of 8
  'purpose-selection': 50,        // Step 4 of 8
  'content-type-selection': 62,   // Step 5 of 8
  'media-capture': 75,            // Step 6 of 8
  'content-creation': 87,         // Step 7 of 8
  'preview-save': 100,            // Step 8 of 8 - FINAL
  'next-action': 100,             // Post-workflow (progress bar hidden or stays at 100%)
  'session-summary': 100,         // Post-workflow (progress bar hidden or stays at 100%)
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
