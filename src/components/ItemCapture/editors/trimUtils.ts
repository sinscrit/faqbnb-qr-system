/**
 * Trim Utility Functions
 *
 * Utility functions for video trim operations including time formatting,
 * validation, and position calculations.
 *
 * @module ItemCapture/editors/trimUtils
 * @see docs/REQ-049-implement-videotrimmer-v1-simplified-detailed.md
 * @lastModified 2025-12-31 (REQ-049 Task 1)
 */

// =============================================================================
// Time Formatting
// =============================================================================

/**
 * Format seconds to MM:SS or HH:MM:SS display string
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse MM:SS or HH:MM:SS string to seconds
 * @param timeString - Time string in MM:SS or HH:MM:SS format
 * @returns Time in seconds, or null if invalid
 */
export function parseTime(timeString: string): number | null {
  const parts = timeString.split(':').map(Number);
  if (parts.some(isNaN)) return null;

  if (parts.length === 2) {
    const [mins, secs] = parts;
    return mins * 60 + secs;
  }
  if (parts.length === 3) {
    const [hrs, mins, secs] = parts;
    return hrs * 3600 + mins * 60 + secs;
  }
  return null;
}

// =============================================================================
// Trim Validation
// =============================================================================

export interface TrimValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Validate trim marker positions
 * @param startTime - Start marker position in seconds
 * @param endTime - End marker position in seconds
 * @param duration - Total video duration in seconds
 * @param minDuration - Minimum allowed trim duration (default: 1 second)
 * @returns Validation result with error message if invalid
 */
export function validateTrim(
  startTime: number,
  endTime: number,
  duration: number,
  minDuration: number = 1
): TrimValidation {
  if (startTime < 0) {
    return { isValid: false, error: 'Start time cannot be negative' };
  }
  if (endTime > duration) {
    return { isValid: false, error: 'End time exceeds video duration' };
  }
  if (startTime >= endTime) {
    return { isValid: false, error: 'Start time must be before end time' };
  }
  if (endTime - startTime < minDuration) {
    return {
      isValid: false,
      error: `Minimum trim duration is ${minDuration} second${minDuration !== 1 ? 's' : ''}`,
    };
  }
  return { isValid: true };
}

// =============================================================================
// Position Conversion
// =============================================================================

/**
 * Convert a time in seconds to a percentage of total duration
 * @param time - Time in seconds
 * @param duration - Total duration in seconds
 * @returns Percentage (0-100)
 */
export function timeToPercent(time: number, duration: number): number {
  if (duration <= 0) return 0;
  return Math.min(100, Math.max(0, (time / duration) * 100));
}

/**
 * Convert a percentage to time in seconds
 * @param percent - Percentage (0-100)
 * @param duration - Total duration in seconds
 * @returns Time in seconds
 */
export function percentToTime(percent: number, duration: number): number {
  return Math.min(duration, Math.max(0, (percent / 100) * duration));
}

// =============================================================================
// Marker Position Clamping
// =============================================================================

/**
 * Clamp marker position to valid range while respecting minimum gap
 * @param position - Proposed position in seconds
 * @param otherMarker - Position of the other marker
 * @param isStartMarker - Whether this is the start marker
 * @param duration - Total video duration
 * @param minGap - Minimum gap between markers (default: 1 second)
 * @returns Clamped position in seconds
 */
export function clampMarkerPosition(
  position: number,
  otherMarker: number,
  isStartMarker: boolean,
  duration: number,
  minGap: number = 1
): number {
  let clamped = Math.max(0, Math.min(duration, position));

  if (isStartMarker) {
    clamped = Math.min(clamped, otherMarker - minGap);
  } else {
    clamped = Math.max(clamped, otherMarker + minGap);
  }

  return Math.max(0, Math.min(duration, clamped));
}
