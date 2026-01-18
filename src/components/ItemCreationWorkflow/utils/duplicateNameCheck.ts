/**
 * Duplicate Name Detection Utilities
 *
 * Provides functions for detecting duplicate or similar item names
 * within a session to warn users before creating items with
 * confusingly similar names.
 *
 * @module ItemCreationWorkflow/utils/duplicateNameCheck
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05
 */

// =============================================================================
// Type Definitions
// =============================================================================

export interface DuplicateCheckResult {
  /** Whether an exact or similar match was found */
  isDuplicate: boolean;
  /** Names that matched (exact or similar) */
  matchingNames: string[];
  /** Type of match found */
  matchType: 'exact' | 'similar' | 'none';
  /** Similarity score for similar matches (0-1), only present for similar matches */
  similarity?: number;
}

// =============================================================================
// Internal Helper Functions
// =============================================================================

/**
 * Normalizes a string for comparison by:
 * - Converting to lowercase
 * - Trimming whitespace
 * - Removing extra spaces
 */
function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Checks if two names are similar based on various heuristics:
 * - One contains the other
 * - Numbered variants (e.g., "Kitchen - Stove" vs "Kitchen - Stove 2")
 * - Very similar with minor differences
 *
 * @param a - First normalized name
 * @param b - Second normalized name
 * @returns true if names are considered similar
 */
function isSimilar(a: string, b: string): boolean {
  // Skip empty comparisons
  if (!a || !b) return false;

  // Check if one contains the other (but not if they're very short)
  if (a.length > 3 && b.length > 3) {
    if (a.includes(b) || b.includes(a)) return true;
  }

  // Check for numbered variants (e.g., "Kitchen - Stove" vs "Kitchen - Stove 2")
  // Matches patterns like " 2", " 3", "(2)", "(3)" at the end
  const numPattern = /\s*[\(\[]?\d+[\)\]]?\s*$/;
  const aBase = a.replace(numPattern, '').trim();
  const bBase = b.replace(numPattern, '').trim();
  if (aBase && bBase && aBase === bBase) return true;

  // Check for common prefixes (if both are reasonably long)
  if (a.length >= 10 && b.length >= 10) {
    const minLength = Math.min(a.length, b.length);
    const prefixLength = Math.floor(minLength * 0.8);
    if (a.substring(0, prefixLength) === b.substring(0, prefixLength)) {
      return true;
    }
  }

  return false;
}

// =============================================================================
// Main Export Functions
// =============================================================================

/**
 * Checks if a name matches or is similar to existing names.
 *
 * @param name - The name to check
 * @param existingNames - Array of existing item names
 * @returns Result indicating if duplicates were found
 *
 * @example
 * const result = checkDuplicateName('Kitchen - Stove', ['kitchen - stove', 'Bathroom - Sink']);
 * // result: { isDuplicate: true, matchingNames: ['kitchen - stove'], matchType: 'exact' }
 *
 * @example
 * const result = checkDuplicateName('Kitchen - Stove 2', ['Kitchen - Stove']);
 * // result: { isDuplicate: true, matchingNames: ['Kitchen - Stove'], matchType: 'similar' }
 */
export function checkDuplicateName(
  name: string,
  existingNames: string[]
): DuplicateCheckResult {
  // Handle empty inputs
  if (!name || !name.trim() || existingNames.length === 0) {
    return { isDuplicate: false, matchingNames: [], matchType: 'none' };
  }

  const normalizedName = normalizeString(name);
  const exactMatches: string[] = [];
  const similarMatches: string[] = [];

  for (const existing of existingNames) {
    if (!existing || !existing.trim()) continue;

    const normalizedExisting = normalizeString(existing);

    // Exact match (case-insensitive)
    if (normalizedName === normalizedExisting) {
      exactMatches.push(existing);
      continue;
    }

    // Similar match
    if (isSimilar(normalizedName, normalizedExisting)) {
      similarMatches.push(existing);
    }
  }

  // Return exact matches first (higher priority)
  if (exactMatches.length > 0) {
    return {
      isDuplicate: true,
      matchingNames: exactMatches,
      matchType: 'exact',
    };
  }

  // Return similar matches
  if (similarMatches.length > 0) {
    return {
      isDuplicate: true,
      matchingNames: similarMatches,
      matchType: 'similar',
    };
  }

  return { isDuplicate: false, matchingNames: [], matchType: 'none' };
}

/**
 * Checks if a name has an exact duplicate (case-insensitive).
 *
 * @param name - The name to check
 * @param existingNames - Array of existing item names
 * @returns true if an exact match exists
 */
export function hasExactDuplicate(name: string, existingNames: string[]): boolean {
  if (!name || !name.trim() || existingNames.length === 0) return false;

  const normalizedName = normalizeString(name);
  return existingNames.some(
    (existing) => existing && normalizeString(existing) === normalizedName
  );
}

/**
 * Suggests a unique name by appending a number if the name already exists.
 *
 * @param baseName - The base name to make unique
 * @param existingNames - Array of existing item names
 * @returns A unique name with appended number if necessary
 *
 * @example
 * suggestUniqueName('Kitchen - Stove', ['Kitchen - Stove'])
 * // returns 'Kitchen - Stove 2'
 *
 * suggestUniqueName('Kitchen - Stove', ['Kitchen - Stove', 'Kitchen - Stove 2'])
 * // returns 'Kitchen - Stove 3'
 */
export function suggestUniqueName(baseName: string, existingNames: string[]): string {
  if (!baseName || !baseName.trim()) return baseName;

  const trimmedName = baseName.trim();

  // If no duplicate, return as-is
  if (!hasExactDuplicate(trimmedName, existingNames)) {
    return trimmedName;
  }

  // Find the next available number
  let counter = 2;
  while (hasExactDuplicate(`${trimmedName} ${counter}`, existingNames)) {
    counter++;
    // Safety limit
    if (counter > 100) break;
  }

  return `${trimmedName} ${counter}`;
}
