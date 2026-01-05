'use client';

/**
 * Item Record Assembly Utilities
 *
 * Pure functions for transforming internal wizard state into the external
 * ItemRecord contract when the user submits from the ReviewStep.
 *
 * @module ItemCapture/utils/assembleItemRecord
 * @see docs/REQ-053-implement-oncomplete-assembly-detailed.md
 * @lastModified 2025-12-31 (REQ-053 Tasks 2, 3)
 */

import { generateUUID } from './generateUUID';
import type {
  ItemRecord,
  MediaItem,
  ApplianceType,
  MediaMetadata,
  UrlItem,
} from '../ItemCapture.types';

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Internal media item representation from wizard state.
 * This is the structure used by the wizard internally before assembly.
 */
export interface InternalMediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf' | 'url';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}

/**
 * Internal state representation from the wizard.
 * This is the structure of state accumulated during the capture flow.
 */
export interface InternalState {
  metadata: {
    title: string;
    location?: string;
    tags?: string[];
    applianceType?: ApplianceType;
  };
  mediaItems: InternalMediaItem[];
  urlItems: UrlItem[];
  instructions: string;
}

/**
 * Options for controlling assembly behavior.
 */
export interface AssemblyOptions {
  /**
   * Whether to regenerate UUIDs for media items.
   * When true (default), generates new UUIDs for all media items.
   * When false, preserves existing IDs (useful for re-assembly without ID changes).
   */
  regenerateIds?: boolean;

  /**
   * Override the creation timestamp.
   * When not provided, uses the current time.
   */
  timestamp?: Date;
}

// =============================================================================
// Content Type Determination (Task 2)
// =============================================================================

/**
 * Determine the contentType based on captured content.
 *
 * Logic:
 * - 'media': Only video/image content (no text, no PDF, no URLs)
 * - 'text-only': Only text instructions (no media, no URLs)
 * - 'pdf-only': Only PDF files (no other media, no text, no URLs)
 * - 'url-only': Only URL links (no other media, no text)
 * - 'mixed': Multiple content types combined
 *
 * @param mediaItems - Array of media items to analyze
 * @param urlItems - Array of URL items to analyze
 * @param instructions - Optional text instructions
 * @returns The determined content type
 *
 * @example
 * determineContentType([{type: 'video'}], [], undefined); // 'media'
 * determineContentType([{type: 'pdf'}], [], undefined); // 'pdf-only'
 * determineContentType([], [{...urlItem}], undefined); // 'url-only'
 * determineContentType([{type: 'video'}], [], 'Instructions'); // 'mixed'
 * determineContentType([], [], 'Text only'); // 'text-only'
 */
export function determineContentType(
  mediaItems: Array<{ type: 'video' | 'image' | 'pdf' | 'url' }>,
  urlItems: UrlItem[],
  instructions: string | undefined
): 'media' | 'text-only' | 'pdf-only' | 'url-only' | 'mixed' {
  const hasMedia = mediaItems.some(
    (item) => item.type === 'video' || item.type === 'image'
  );
  const hasPDF = mediaItems.some((item) => item.type === 'pdf');
  const hasUrls = urlItems.length > 0;
  const hasText = instructions && instructions.trim().length > 0;

  // Count content types
  const contentTypes = [hasMedia, hasPDF, hasUrls, hasText].filter(Boolean).length;

  // Mixed if more than one content type
  if (contentTypes > 1) return 'mixed';

  // Single type cases
  if (hasMedia) return 'media';
  if (hasPDF) return 'pdf-only';
  if (hasUrls) return 'url-only';
  if (hasText) return 'text-only';

  // Fallback (empty content - should not happen in valid flow)
  return 'media';
}

// =============================================================================
// Assembly Function (Task 3)
// =============================================================================

/**
 * Assemble an ItemRecord from internal wizard state.
 *
 * This is the main assembly function that transforms the internal state
 * accumulated during the wizard flow into the final ItemRecord structure
 * that is emitted via the onComplete callback.
 *
 * Features:
 * - Generates new UUID for the item record
 * - Generates new UUIDs for each media item (when regenerateIds: true)
 * - Sets createdAt timestamp
 * - Trims whitespace from title, location, and instructions
 * - Filters out empty tags
 * - Only includes optional fields when they have values
 *
 * @param state - The internal wizard state to transform
 * @param options - Assembly options (regenerateIds, timestamp)
 * @returns A complete ItemRecord ready for consumption
 *
 * @example
 * const record = assembleItemRecord({
 *   metadata: { title: 'My Item', location: 'Kitchen' },
 *   mediaItems: [{ id: 'temp-1', type: 'video', file: blob, ... }],
 *   instructions: 'How to use...',
 * });
 */
export function assembleItemRecord(
  state: InternalState,
  options: AssemblyOptions = {}
): ItemRecord {
  const { regenerateIds = true, timestamp = new Date() } = options;

  // Generate new UUID for the item record
  const itemId = generateUUID();

  // Transform media items with proper order and optional ID regeneration
  const transformedMedia: MediaItem[] = state.mediaItems.map((item, index) => ({
    id: regenerateIds ? generateUUID() : item.id,
    type: item.type,
    file: item.file,
    thumbnail: item.thumbnail,
    order: index,
    metadata: { ...item.metadata },
  }));

  // Convert URL items to MediaItem format
  const urlAsMedia: MediaItem[] = state.urlItems.map((urlItem, index) => ({
    id: regenerateIds ? generateUUID() : urlItem.id,
    type: 'url' as const,
    file: new Blob([urlItem.metadata.url], { type: 'text/plain' }),
    order: state.mediaItems.length + index,
    metadata: {
      mimeType: 'text/uri-list',
      fileSize: urlItem.metadata.url.length,
      source: 'upload' as const,
      url: urlItem.metadata.url,
      domain: urlItem.metadata.domain,
      pageTitle: urlItem.metadata.title,
      thumbnailUrl: urlItem.metadata.thumbnailUrl,
      faviconUrl: urlItem.metadata.faviconUrl,
      linkType: urlItem.metadata.linkType,
    },
  }));

  // Combine media and URL items
  const allMedia = [...transformedMedia, ...urlAsMedia];

  // Determine content type based on captured content
  const contentType = determineContentType(
    state.mediaItems,
    state.urlItems,
    state.instructions
  );

  // Build the base record with required fields
  const record: ItemRecord = {
    id: itemId,
    title: state.metadata.title.trim(),
    contentType,
    media: allMedia,
    createdAt: timestamp,
  };

  // Add optional location if provided and non-empty
  if (state.metadata.location?.trim()) {
    record.location = state.metadata.location.trim();
  }

  // Add optional tags if provided and non-empty (filter empty strings)
  if (state.metadata.tags && state.metadata.tags.length > 0) {
    const validTags = state.metadata.tags.filter(
      (tag) => tag && tag.trim().length > 0
    );
    if (validTags.length > 0) {
      record.tags = validTags;
    }
  }

  // Add optional appliance type if provided
  if (state.metadata.applianceType) {
    record.applianceType = state.metadata.applianceType;
  }

  // Add optional instructions if provided and non-empty
  if (state.instructions?.trim()) {
    record.instructions = state.instructions.trim();
  }

  return record;
}

export default assembleItemRecord;
