/**
 * URL Manager Utility
 *
 * Centralized management for object URLs created via URL.createObjectURL().
 * Provides automatic tracking and cleanup to prevent memory leaks.
 *
 * @module ItemCapture/utils/urlManager
 * @see docs/REQ-054-performance-optimization-detailed.md
 * @lastModified 2025-12-31 (REQ-054 Task 4)
 */

/**
 * Global URL registry for tracking all created object URLs.
 * Maps URL strings to their metadata for debugging and cleanup.
 */
interface URLEntry {
  url: string;
  source: string;
  createdAt: number;
  revoked: boolean;
}

/**
 * Registry tracking all created URLs.
 */
const urlRegistry = new Map<string, URLEntry>();

/**
 * Debug mode flag - when true, logs URL creation/revocation.
 */
let debugMode = false;

/**
 * Enable or disable debug logging for URL operations.
 */
export function setURLManagerDebug(enabled: boolean): void {
  debugMode = enabled;
}

/**
 * Create an object URL from a Blob or File with automatic tracking.
 *
 * @param blob - The Blob or File to create a URL for
 * @param source - Optional identifier for debugging (e.g., component name)
 * @returns The created object URL string
 *
 * @example
 * ```ts
 * const url = createTrackedURL(imageBlob, 'PhotoCaptureStep');
 * // Later: cleanup automatically tracks this URL
 * ```
 */
export function createTrackedURL(blob: Blob | File, source = 'unknown'): string {
  const url = URL.createObjectURL(blob);

  const entry: URLEntry = {
    url,
    source,
    createdAt: Date.now(),
    revoked: false,
  };

  urlRegistry.set(url, entry);

  if (debugMode) {
    console.log(`[URLManager] Created URL from ${source}:`, url.substring(0, 50) + '...');
    console.log(`[URLManager] Active URLs: ${getActiveURLCount()}`);
  }

  return url;
}

/**
 * Revoke a single object URL and remove it from tracking.
 *
 * @param url - The object URL to revoke
 *
 * @example
 * ```ts
 * revokeTrackedURL(thumbnailUrl);
 * ```
 */
export function revokeTrackedURL(url: string | null | undefined): void {
  if (!url) return;

  const entry = urlRegistry.get(url);

  if (entry && !entry.revoked) {
    URL.revokeObjectURL(url);
    entry.revoked = true;
    urlRegistry.delete(url);

    if (debugMode) {
      console.log(`[URLManager] Revoked URL from ${entry.source}:`, url.substring(0, 50) + '...');
      console.log(`[URLManager] Active URLs: ${getActiveURLCount()}`);
    }
  } else if (!entry) {
    // URL wasn't tracked, still try to revoke it
    URL.revokeObjectURL(url);
    if (debugMode) {
      console.log(`[URLManager] Revoked untracked URL:`, url.substring(0, 50) + '...');
    }
  }
}

/**
 * Revoke multiple object URLs.
 *
 * @param urls - Array of URLs to revoke
 *
 * @example
 * ```ts
 * revokeTrackedURLs([url1, url2, url3]);
 * ```
 */
export function revokeTrackedURLs(urls: (string | null | undefined)[]): void {
  urls.forEach((url) => revokeTrackedURL(url));
}

/**
 * Revoke all URLs created by a specific source.
 *
 * @param source - The source identifier to match
 *
 * @example
 * ```ts
 * revokeURLsBySource('PhotoCaptureStep');
 * ```
 */
export function revokeURLsBySource(source: string): void {
  const urlsToRevoke: string[] = [];

  urlRegistry.forEach((entry, url) => {
    if (entry.source === source && !entry.revoked) {
      urlsToRevoke.push(url);
    }
  });

  urlsToRevoke.forEach((url) => revokeTrackedURL(url));

  if (debugMode && urlsToRevoke.length > 0) {
    console.log(`[URLManager] Revoked ${urlsToRevoke.length} URLs from source: ${source}`);
  }
}

/**
 * Revoke all tracked object URLs.
 * Use with caution - typically called on full component cleanup.
 *
 * @example
 * ```ts
 * // In cleanup effect
 * revokeAllTrackedURLs();
 * ```
 */
export function revokeAllTrackedURLs(): void {
  const count = getActiveURLCount();

  urlRegistry.forEach((entry, url) => {
    if (!entry.revoked) {
      URL.revokeObjectURL(url);
      entry.revoked = true;
    }
  });

  urlRegistry.clear();

  if (debugMode) {
    console.log(`[URLManager] Revoked all ${count} tracked URLs`);
  }
}

/**
 * Get the count of currently active (non-revoked) URLs.
 *
 * @returns Number of active URLs
 */
export function getActiveURLCount(): number {
  let count = 0;
  urlRegistry.forEach((entry) => {
    if (!entry.revoked) count++;
  });
  return count;
}

/**
 * Get debug information about tracked URLs.
 * Useful for memory profiling and debugging.
 *
 * @returns Array of URL entry information
 */
export function getURLRegistryDebugInfo(): Array<{
  url: string;
  source: string;
  ageMs: number;
  revoked: boolean;
}> {
  const now = Date.now();
  const info: Array<{
    url: string;
    source: string;
    ageMs: number;
    revoked: boolean;
  }> = [];

  urlRegistry.forEach((entry) => {
    info.push({
      url: entry.url.substring(0, 50) + '...',
      source: entry.source,
      ageMs: now - entry.createdAt,
      revoked: entry.revoked,
    });
  });

  return info;
}

/**
 * Clean up stale URLs that have been active for longer than the specified duration.
 * Useful for catching leaked URLs in long-running sessions.
 *
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns Number of stale URLs revoked
 */
export function cleanupStaleURLs(maxAgeMs = 5 * 60 * 1000): number {
  const now = Date.now();
  const staleUrls: string[] = [];

  urlRegistry.forEach((entry, url) => {
    if (!entry.revoked && now - entry.createdAt > maxAgeMs) {
      staleUrls.push(url);
    }
  });

  staleUrls.forEach((url) => {
    const entry = urlRegistry.get(url);
    if (entry && debugMode) {
      console.warn(
        `[URLManager] Cleaning up stale URL from ${entry.source}, age: ${Math.round((now - entry.createdAt) / 1000)}s`
      );
    }
    revokeTrackedURL(url);
  });

  return staleUrls.length;
}

// =============================================================================
// React Hook for scoped URL management
// =============================================================================

/**
 * Creates a scoped URL manager for use within a React component.
 * All URLs created through this manager will be automatically revoked
 * when cleanup() is called.
 *
 * @param source - Source identifier for debugging
 * @returns Object with create, revoke, and cleanup methods
 *
 * @example
 * ```ts
 * const urlManager = createScopedURLManager('MyComponent');
 *
 * // In component
 * const url = urlManager.create(blob);
 *
 * // On unmount
 * urlManager.cleanup();
 * ```
 */
export function createScopedURLManager(source: string) {
  const localUrls = new Set<string>();

  return {
    /**
     * Create a tracked URL within this scope.
     */
    create(blob: Blob | File): string {
      const url = createTrackedURL(blob, source);
      localUrls.add(url);
      return url;
    },

    /**
     * Revoke a specific URL from this scope.
     */
    revoke(url: string | null | undefined): void {
      if (url) {
        revokeTrackedURL(url);
        localUrls.delete(url);
      }
    },

    /**
     * Revoke all URLs created in this scope.
     */
    cleanup(): void {
      localUrls.forEach((url) => revokeTrackedURL(url));
      localUrls.clear();

      if (debugMode) {
        console.log(`[URLManager] Cleaned up scope: ${source}`);
      }
    },

    /**
     * Get count of active URLs in this scope.
     */
    getCount(): number {
      return localUrls.size;
    },
  };
}

export default {
  createTrackedURL,
  revokeTrackedURL,
  revokeTrackedURLs,
  revokeURLsBySource,
  revokeAllTrackedURLs,
  getActiveURLCount,
  getURLRegistryDebugInfo,
  cleanupStaleURLs,
  createScopedURLManager,
  setURLManagerDebug,
};
