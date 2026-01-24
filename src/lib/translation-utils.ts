/**
 * Translation Utility Functions
 *
 * Provides utility functions for translation status detection, including:
 * - Stale translation detection (when source content has changed)
 * - Grace period handling for minor edits
 * - Human-readable time difference formatting
 *
 * @module lib/translation-utils
 * @see docs/REQ-E05-023-implement-stale-translation-indicator-overview.md
 * @created 2026-01-24
 * @lastModified 2026-01-24 (REQ-E05-023)
 *
 * @example
 * import { isTranslationStale, getTimeDifference } from '@/lib/translation-utils';
 *
 * // Check if a translation is stale
 * const stale = isTranslationStale(
 *   translation.sourceVersionAt,  // When translation was based on source
 *   item.updatedAt                // Current source update time
 * );
 *
 * // Get human-readable time difference
 * const diff = getTimeDifference(
 *   translation.sourceVersionAt,
 *   item.updatedAt
 * ); // "3 hours ago"
 */

// =============================================================================
// Types
// =============================================================================

/** Valid timestamp input types for stale detection functions */
type TimestampInput = Date | string | null | undefined;

// =============================================================================
// Stale Detection Functions
// =============================================================================

/**
 * Determines if a translation is stale (outdated) based on timestamp comparison.
 *
 * A translation is considered stale when the source content (`sourceUpdatedAt`)
 * has been modified AFTER the translation was generated (`sourceVersionAt`).
 *
 * @param sourceVersionAt - Timestamp when the translation was based on source content
 * @param sourceUpdatedAt - Current timestamp of the source content
 * @returns `true` if translation is stale, `false` otherwise or if timestamps are invalid
 *
 * @example
 * // Translation is stale - source was updated after translation
 * isTranslationStale('2026-01-20T10:00:00Z', '2026-01-21T15:00:00Z'); // true
 *
 * @example
 * // Translation is current - source hasn't changed since translation
 * isTranslationStale('2026-01-21T15:00:00Z', '2026-01-20T10:00:00Z'); // false
 *
 * @example
 * // Cannot determine staleness - missing timestamp
 * isTranslationStale(null, '2026-01-21T15:00:00Z'); // false
 */
export function isTranslationStale(
  sourceVersionAt: TimestampInput,
  sourceUpdatedAt: TimestampInput
): boolean {
  // Cannot determine staleness if either timestamp is missing
  if (sourceVersionAt == null || sourceUpdatedAt == null) {
    return false;
  }

  try {
    // Convert to timestamps for comparison
    const versionTime = new Date(sourceVersionAt).getTime();
    const sourceTime = new Date(sourceUpdatedAt).getTime();

    // Check for invalid dates (NaN)
    if (isNaN(versionTime) || isNaN(sourceTime)) {
      return false;
    }

    // Translation is stale if source was updated after the translation was created
    return sourceTime > versionTime;
  } catch (error) {
    // Log error and return false for safety
    console.error('[translation-utils] Error in isTranslationStale:', error);
    return false;
  }
}

/**
 * Determines if a translation is stale with a grace period buffer.
 *
 * Similar to `isTranslationStale`, but allows for a grace period (in minutes)
 * before marking a translation as stale. This is useful for handling rapid
 * consecutive edits where small delays shouldn't trigger stale warnings.
 *
 * @param sourceVersionAt - Timestamp when the translation was based on source content
 * @param sourceUpdatedAt - Current timestamp of the source content
 * @param graceMinutes - Grace period in minutes before considering stale (default: 5)
 * @returns `true` if translation is stale beyond grace period, `false` otherwise
 *
 * @note This function is reserved for future use and not used in the initial implementation.
 *
 * @example
 * // Source updated 10 minutes after translation - stale beyond 5 min grace
 * isTranslationStaleWithGrace(
 *   '2026-01-21T10:00:00Z',
 *   '2026-01-21T10:10:00Z',
 *   5
 * ); // true
 *
 * @example
 * // Source updated 3 minutes after translation - within 5 min grace
 * isTranslationStaleWithGrace(
 *   '2026-01-21T10:00:00Z',
 *   '2026-01-21T10:03:00Z',
 *   5
 * ); // false
 */
export function isTranslationStaleWithGrace(
  sourceVersionAt: TimestampInput,
  sourceUpdatedAt: TimestampInput,
  graceMinutes: number = 5
): boolean {
  // Cannot determine staleness if either timestamp is missing
  if (sourceVersionAt == null || sourceUpdatedAt == null) {
    return false;
  }

  try {
    // Convert to timestamps for comparison
    const versionTime = new Date(sourceVersionAt).getTime();
    const sourceTime = new Date(sourceUpdatedAt).getTime();

    // Check for invalid dates (NaN)
    if (isNaN(versionTime) || isNaN(sourceTime)) {
      return false;
    }

    // Calculate grace period in milliseconds
    const graceMs = graceMinutes * 60 * 1000;

    // Translation is stale if source was updated beyond the grace period
    return sourceTime > versionTime + graceMs;
  } catch (error) {
    // Log error and return false for safety
    console.error('[translation-utils] Error in isTranslationStaleWithGrace:', error);
    return false;
  }
}

// =============================================================================
// Time Difference Formatting
// =============================================================================

/**
 * Calculates and formats the time difference between two dates as a human-readable string.
 *
 * Used for tooltips to show how long ago the source content was modified relative
 * to when the translation was created.
 *
 * @param olderDate - The earlier date (typically sourceVersionAt)
 * @param newerDate - The later date (typically sourceUpdatedAt)
 * @returns Human-readable time difference string, or 'unknown' if dates are invalid
 *
 * @example
 * getTimeDifference('2026-01-20T10:00:00Z', '2026-01-21T10:00:00Z'); // "1 day ago"
 * getTimeDifference('2026-01-21T08:00:00Z', '2026-01-21T15:30:00Z'); // "7 hours ago"
 * getTimeDifference('2026-01-21T15:00:00Z', '2026-01-21T15:30:00Z'); // "30 minutes ago"
 * getTimeDifference('2026-01-21T15:29:00Z', '2026-01-21T15:30:00Z'); // "just now"
 */
export function getTimeDifference(
  olderDate: TimestampInput,
  newerDate: TimestampInput
): string {
  try {
    // Handle null/undefined inputs
    if (olderDate == null || newerDate == null) {
      return 'unknown';
    }

    // Convert to timestamps
    const olderTime = new Date(olderDate).getTime();
    const newerTime = new Date(newerDate).getTime();

    // Check for invalid dates
    if (isNaN(olderTime) || isNaN(newerTime)) {
      return 'unknown';
    }

    // Calculate difference in milliseconds
    const diffMs = newerTime - olderTime;

    // Handle negative difference (shouldn't happen in normal use)
    if (diffMs < 0) {
      return 'unknown';
    }

    // Calculate time units
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Return formatted string with proper singular/plural handling
    if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }

    if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    if (minutes > 0) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }

    return 'just now';
  } catch (error) {
    console.error('[translation-utils] Error in getTimeDifference:', error);
    return 'unknown';
  }
}
