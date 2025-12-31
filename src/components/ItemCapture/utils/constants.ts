/**
 * ItemCapture Constants
 *
 * This file contains all constant values used by the ItemCapture component,
 * including preset locations, appliance types, suggested tags, and validation constraints.
 *
 * @module ItemCapture/utils/constants
 * @lastModified 2025-12-31 (REQ-034 Task 1)
 */

import type { ApplianceType } from '../ItemCapture.types';

// =============================================================================
// Preset Locations
// =============================================================================

/**
 * Common room/location names for property items.
 * Used in the MetadataStep location dropdown.
 */
export const PRESET_LOCATIONS = [
  'Kitchen',
  'Living Room',
  'Master Bedroom',
  'Guest Bedroom',
  'Master Bathroom',
  'Guest Bathroom',
  'Garage',
  'Laundry Room',
  'Basement',
  'Attic',
  'Outdoor/Patio',
  'Office/Study',
  'Dining Room',
  'Entryway',
  'Other',
] as const;

export type PresetLocation = typeof PRESET_LOCATIONS[number];

// =============================================================================
// Appliance Types
// =============================================================================

/**
 * Appliance type options with display labels.
 * Maps to ApplianceType enum values from ItemCapture.types.ts
 */
export const APPLIANCE_TYPES: { value: ApplianceType; label: string }[] = [
  { value: 'washer', label: 'Washer' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'oven', label: 'Oven/Range' },
  { value: 'microwave', label: 'Microwave' },
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'hvac', label: 'HVAC/Thermostat' },
  { value: 'water_heater', label: 'Water Heater' },
  { value: 'garbage_disposal', label: 'Garbage Disposal' },
  { value: 'security_system', label: 'Security System' },
  { value: 'smart_home', label: 'Smart Home Device' },
  { value: 'entertainment', label: 'Entertainment System' },
  { value: 'pool_spa', label: 'Pool/Spa Equipment' },
  { value: 'garage', label: 'Garage Door Opener' },
  { value: 'other', label: 'Other' },
];

// =============================================================================
// Suggested Tags
// =============================================================================

/**
 * Common instructional tag categories for quick selection.
 * Users can select from these or add custom tags.
 */
export const SUGGESTED_TAGS = [
  'How-to',
  'Troubleshooting',
  'Maintenance',
  'Setup',
  'Safety',
  'Cleaning',
  'Reset',
  'Quick Start',
  'Energy Saving',
  'Emergency',
] as const;

export type SuggestedTag = typeof SUGGESTED_TAGS[number];

// =============================================================================
// Metadata Validation Constraints
// =============================================================================

/**
 * Validation constraints for metadata fields.
 * Used by MetadataStep validation logic.
 */
export const METADATA_CONSTRAINTS = {
  title: {
    minLength: 1,
    maxLength: 100,
  },
  location: {
    maxLength: 50,
  },
  tag: {
    minLength: 1,
    maxLength: 30,
  },
  maxTags: 10,
} as const;

// =============================================================================
// Thumbnail Generation Configuration (Task 2.5 / REQ-040)
// =============================================================================

/**
 * Default thumbnail dimensions in pixels.
 * Used for consistent thumbnail sizing across image and video sources.
 */
export const THUMBNAIL_SIZE = {
  width: 200,
  height: 200,
} as const;

/**
 * Default settings for thumbnail generation.
 */
export const THUMBNAIL_DEFAULTS = {
  /** JPEG quality setting (0-1) */
  quality: 0.8,
  /** Default output format */
  format: 'image/jpeg' as const,
  /** Default fit strategy: 'cover' crops to fill, 'contain' fits within bounds */
  fit: 'cover' as const,
};

/**
 * Supported image MIME types for thumbnail generation.
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/**
 * Supported video MIME types for thumbnail generation.
 */
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

/**
 * Maximum time in milliseconds to wait for thumbnail generation.
 * Used as a timeout for loading images and seeking videos.
 */
export const THUMBNAIL_TIMEOUT = 10000;

/**
 * Default time in seconds to seek into a video for frame extraction.
 * 0.5 seconds provides a frame after video playback has started.
 */
export const VIDEO_SEEK_TIME = 0.5;
