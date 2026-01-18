/**
 * VideoPlayer Utility Functions
 *
 * Utility functions for time formatting, fullscreen API abstraction,
 * and volume clamping used by the VideoPlayer component.
 *
 * @module ItemManager/components/ItemPreview/videoPlayerUtils
 * @lastModified 2026-01-03 (REQ-076 Task 4.3.1)
 */

// =============================================================================
// Time Formatting
// =============================================================================

/**
 * Format seconds to MM:SS or HH:MM:SS display string
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:23" or "1:02:03")
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// Volume Helpers
// =============================================================================

/**
 * Clamp volume value between 0 and 1
 * @param volume - Volume value to clamp
 * @returns Clamped volume value between 0 and 1
 */
export function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume));
}

// =============================================================================
// Fullscreen API Helpers
// =============================================================================

/**
 * Extended document type for vendor-prefixed fullscreen properties
 */
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
}

/**
 * Extended element type for vendor-prefixed fullscreen methods
 */
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
}

/**
 * Check if fullscreen API is supported in the current browser
 * @returns True if fullscreen is supported
 */
export function isFullscreenSupported(): boolean {
  const doc = document as FullscreenDocument;
  const el = document.documentElement as FullscreenElement;

  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    doc.exitFullscreen ||
    doc.webkitExitFullscreen ||
    doc.mozCancelFullScreen
  );
}

/**
 * Request fullscreen mode for an element
 * Handles vendor prefixes for cross-browser support
 * @param element - The element to make fullscreen
 * @returns Promise that resolves when fullscreen is entered
 */
export async function requestFullscreen(element: HTMLElement): Promise<void> {
  const el = element as FullscreenElement;

  if (el.requestFullscreen) {
    return el.requestFullscreen();
  }
  if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen();
  }
  if (el.mozRequestFullScreen) {
    return el.mozRequestFullScreen();
  }

  throw new Error('Fullscreen API not supported');
}

/**
 * Exit fullscreen mode
 * Handles vendor prefixes for cross-browser support
 * @returns Promise that resolves when fullscreen is exited
 */
export async function exitFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;

  if (doc.exitFullscreen) {
    return doc.exitFullscreen();
  }
  if (doc.webkitExitFullscreen) {
    return doc.webkitExitFullscreen();
  }
  if (doc.mozCancelFullScreen) {
    return doc.mozCancelFullScreen();
  }

  throw new Error('Fullscreen API not supported');
}

/**
 * Get the current fullscreen element
 * Handles vendor prefixes for cross-browser support
 * @returns The current fullscreen element or null if not in fullscreen
 */
export function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;

  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    null
  );
}

/**
 * Check if currently in fullscreen mode
 * @returns True if in fullscreen mode
 */
export function isInFullscreen(): boolean {
  return getFullscreenElement() !== null;
}
