'use client';

/**
 * UUID Generation Utilities
 *
 * Provides RFC 4122 compliant UUID v4 generation with native crypto API support
 * and fallback for older browsers.
 *
 * @module ItemCapture/utils/generateUUID
 * @see docs/REQ-053-implement-oncomplete-assembly-detailed.md
 * @lastModified 2025-12-31 (REQ-053 Task 1)
 */

/**
 * Generate a random UUID v4 following RFC 4122.
 * Uses native crypto.randomUUID() when available, with fallback for older browsers.
 *
 * @returns A valid UUID v4 string in format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *
 * @example
 * const id = generateUUID();
 * // Returns something like: "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID() when available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for older browsers using Math.random()
  // This produces a valid UUID v4 format but with less cryptographic randomness
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * UUID v4 validation regex pattern.
 * Validates the format: 8-4-4-4-12 hexadecimal characters
 * with version 4 in the third segment (4xxx) and variant in the fourth segment (8/9/a/b)
 */
const UUID_V4_REGEX =
  /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$/;

/**
 * Validate that a string is a valid UUID v4 format.
 *
 * @param id - The string to validate
 * @returns True if the string matches UUID v4 format, false otherwise
 *
 * @example
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 * isValidUUID('not-a-uuid'); // false
 * isValidUUID(''); // false
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return UUID_V4_REGEX.test(id);
}

export default generateUUID;
