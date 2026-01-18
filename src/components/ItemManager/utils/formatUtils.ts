/**
 * Format Utility Functions for ItemManager
 *
 * Provides utility functions for formatting asset display information
 * including duration, file names, and display names.
 *
 * @module ItemManager/utils/formatUtils
 * @lastModified 2026-01-03 (REQ-082 Task 1)
 */

import type { MediaItem } from '@/components/ItemCapture';
import type { PendingAsset } from '../ItemManager.types';

/**
 * Format video duration from seconds to readable string.
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1:30", "1:01:01")
 *
 * @example
 * formatDuration(90)    // "1:30"
 * formatDuration(3661)  // "1:01:01"
 * formatDuration(0)     // "0:00"
 * formatDuration(-5)    // "0:00"
 */
export function formatDuration(seconds: number): string {
  // Handle invalid inputs
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get display name for an asset.
 *
 * Returns the original filename if available in metadata,
 * otherwise falls back to a type-based name.
 *
 * @param asset - MediaItem or PendingAsset
 * @returns Display name string
 *
 * @example
 * getAssetDisplayName({ type: 'video', metadata: { originalFilename: 'demo.mp4' } })
 * // Returns: "demo.mp4"
 *
 * getAssetDisplayName({ type: 'image', metadata: {} })
 * // Returns: "Image asset"
 */
export function getAssetDisplayName(asset: MediaItem | PendingAsset): string {
  // Check for originalFilename in metadata
  if (asset.metadata?.originalFilename) {
    return asset.metadata.originalFilename;
  }

  // For pending assets, try to get name from file
  if ('file' in asset && asset.file instanceof File) {
    return asset.file.name;
  }

  // Fallback based on type
  const typeLabels: Record<string, string> = {
    video: 'Video asset',
    image: 'Image asset',
    pdf: 'PDF asset',
  };

  return typeLabels[asset.type] || 'Media asset';
}

/**
 * Format file size for display.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "256 KB")
 *
 * @example
 * formatFileSize(1048576)  // "1.0 MB"
 * formatFileSize(512000)   // "500.0 KB"
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
