/**
 * Item Utility Functions
 *
 * Helper functions for item management including
 * cascading deletion and media cleanup.
 *
 * REQ-142: Enhanced Item Management
 * @created 2026-01-08
 */

import { ItemWithDetails, ItemLink } from '@/types';

/**
 * Count media files associated with an item
 * Media files are links of type 'image' or stored in Supabase storage
 * @param item - Item to check
 * @returns Number of media files
 */
export function countItemMedia(item: ItemWithDetails): number {
  if (!item.links || item.links.length === 0) return 0;

  // Count image links and any links pointing to Supabase storage
  return item.links.filter(link =>
    link.link_type === 'image' ||
    link.url?.includes('supabase.co/storage')
  ).length;
}

/**
 * Get item links count
 * @param item - Item to check
 * @returns Number of links
 */
export function getItemLinksCount(item: ItemWithDetails): number {
  return item.links?.length || 0;
}

/**
 * Check if item has associated content that will be deleted
 * @param item - Item to check
 * @returns true if item has links or media
 */
export function hasAssociatedContent(item: ItemWithDetails): boolean {
  return getItemLinksCount(item) > 0 || countItemMedia(item) > 0;
}

/**
 * Format item for deletion confirmation
 * Enriches item with media count for delete dialog
 * @param item - Item to format
 * @returns Item with mediaCount property
 */
export function formatItemForDeletion(item: ItemWithDetails): ItemWithDetails {
  return {
    ...item,
    mediaCount: countItemMedia(item),
  };
}

/**
 * Extract media URLs from item links
 * Used for storage cleanup after deletion
 * @param item - Item to extract media from
 * @returns Array of media URLs
 */
export function extractMediaUrls(item: ItemWithDetails): string[] {
  if (!item.links) return [];

  return item.links
    .filter(link =>
      link.link_type === 'image' ||
      link.url?.includes('supabase.co/storage')
    )
    .map(link => link.url);
}

/**
 * Parse Supabase storage path from URL
 * @param url - Full Supabase storage URL
 * @returns Storage path or null if not a storage URL
 */
export function parseStoragePath(url: string): string | null {
  if (!url.includes('supabase.co/storage')) return null;

  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/(.+)/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
}
