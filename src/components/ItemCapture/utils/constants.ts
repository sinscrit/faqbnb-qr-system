/**
 * ItemCapture Constants
 *
 * This file contains all constant values used by the ItemCapture component,
 * including preset locations, appliance types, suggested tags, and validation constraints.
 *
 * @module ItemCapture/utils/constants
 * @lastModified 2026-01-05 (REQ-092 Task 3)
 */

import type { ApplianceType } from '../ItemCapture.types';

// =============================================================================
// Preset Locations
// =============================================================================

/**
 * Common room names for property items.
 * Used in the MetadataStep room dropdown.
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

// =============================================================================
// Text Editor Constraints (Task 3.4 / REQ-044)
// =============================================================================

/**
 * Constraints for the TextEditorStep component.
 * Controls character limits, warning thresholds, and UI behavior.
 */
export const TEXT_EDITOR_CONSTRAINTS = {
  /** Maximum character count */
  maxLength: 5000,
  /** Character count at which to show warning (yellow) */
  warningThreshold: 4500,
  /** Debounce delay in milliseconds for auto-save */
  autoSaveDelay: 500,
  /** Minimum textarea height in pixels */
  minHeight: 200,
} as const;

/**
 * Markdown format definitions for the toolbar.
 * Each format has a prefix/suffix to wrap selected text or insert at cursor.
 */
export const MARKDOWN_FORMATS = {
  bold: { prefix: '**', suffix: '**', label: 'Bold', shortcut: 'Ctrl+B' },
  italic: { prefix: '*', suffix: '*', label: 'Italic', shortcut: 'Ctrl+I' },
  heading1: { prefix: '# ', suffix: '', label: 'Heading 1', shortcut: '' },
  heading2: { prefix: '## ', suffix: '', label: 'Heading 2', shortcut: '' },
  heading3: { prefix: '### ', suffix: '', label: 'Heading 3', shortcut: '' },
  bulletList: { prefix: '- ', suffix: '', label: 'Bullet List', shortcut: '' },
  numberedList: { prefix: '1. ', suffix: '', label: 'Numbered List', shortcut: '' },
  link: { prefix: '[', suffix: '](url)', label: 'Link', shortcut: 'Ctrl+K' },
} as const;

/**
 * Type for markdown format keys.
 */
export type MarkdownFormatKey = keyof typeof MARKDOWN_FORMATS;

// =============================================================================
// Capture Constraints (REQ-052)
// =============================================================================

/**
 * Validation constraints for capture operations.
 * These limits are enforced by the validation layer to ensure content
 * meets quality and size requirements.
 *
 * @lastModified 2025-12-31 (REQ-052 Task 1)
 */
export const CAPTURE_CONSTRAINTS = {
  video: {
    /** Maximum video duration in seconds */
    maxDuration: 120, // 2 minutes
    /** Maximum video file size in bytes */
    maxFileSize: 104857600, // 100 MB
  },
  image: {
    /** Maximum image file size in bytes */
    maxFileSize: 20971520, // 20 MB
    /** Maximum number of images per item */
    maxCount: 10,
  },
  pdf: {
    /** Maximum PDF file size in bytes */
    maxFileSize: 52428800, // 50 MB
    /** Maximum number of pages per PDF */
    maxPages: 50,
  },
  text: {
    /** Maximum instructions text length in characters */
    maxLength: 5000,
  },
  total: {
    /** Maximum total file size in bytes for all media in an item */
    maxSize: 209715200, // 200 MB
  },
  title: {
    /** Maximum title length in characters */
    maxLength: 200,
  },
} as const;

// =============================================================================
// URL/Link Constraints (REQ-092)
// =============================================================================

/**
 * Constraints for URL/Link items.
 * Used for validation in the URL input step.
 *
 * @lastModified 2026-01-05 (REQ-092 Task 3)
 */
export const URL_CONSTRAINTS = {
  /** Maximum URL length in characters */
  maxUrlLength: 2048,
  /** Maximum custom title length */
  maxTitleLength: 200,
  /** Allowed URL protocols */
  allowedProtocols: ['http:', 'https:'] as const,
  /** Blocked URL protocols for security */
  blockedProtocols: ['javascript:', 'data:', 'file:', 'vbscript:'] as const,
  /** Timeout for metadata fetching in milliseconds */
  fetchTimeout: 10000,
  /** Maximum number of URL items per item record */
  maxUrls: 20,
} as const;

/**
 * YouTube thumbnail quality options.
 * Maps to the standard YouTube thumbnail URL patterns.
 *
 * @lastModified 2026-01-05 (REQ-092 Task 3)
 */
export const YOUTUBE_THUMBNAIL_QUALITIES = {
  default: 'default', // 120x90
  medium: 'mqdefault', // 320x180
  high: 'hqdefault', // 480x360
  standard: 'sddefault', // 640x480
  maxres: 'maxresdefault', // 1280x720
} as const;

// =============================================================================
// Supported File Formats (REQ-052)
// =============================================================================

/**
 * Supported MIME types for each media category.
 * Used for file validation and upload filtering.
 *
 * @lastModified 2025-12-31 (REQ-052 Task 1)
 */
export const SUPPORTED_FORMATS = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const,
  video: ['video/mp4', 'video/webm', 'video/quicktime'] as const,
  pdf: ['application/pdf'] as const,
} as const;

/**
 * Type for supported image MIME types.
 */
export type SupportedImageFormat = typeof SUPPORTED_FORMATS.image[number];

/**
 * Type for supported video MIME types.
 */
export type SupportedVideoFormat = typeof SUPPORTED_FORMATS.video[number];

/**
 * Type for supported PDF MIME types.
 */
export type SupportedPDFFormat = typeof SUPPORTED_FORMATS.pdf[number];
