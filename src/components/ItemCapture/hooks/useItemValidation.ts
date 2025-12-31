'use client';

/**
 * useItemValidation Hook
 *
 * A React hook that provides real-time validation state management for
 * the ItemCapture component. Memoizes validation results and provides
 * utility methods for size calculations and field validation.
 *
 * @module ItemCapture/hooks/useItemValidation
 * @see docs/REQ-052-create-validation-layer-detailed.md
 * @lastModified 2025-12-31 (REQ-052 Task 12)
 */

import { useMemo, useCallback } from 'react';
import type { MediaItem, ItemMetadata } from '../ItemCapture.types';
import {
  validateItemCapture,
  validateTitle,
  validateContentRequirement,
  validateTextLength,
  formatFileSize,
  calculateTotalSize,
  calculateRemainingSize,
  type ValidationResult,
  type ItemCaptureValidation,
} from '../utils/validation';
import { CAPTURE_CONSTRAINTS } from '../utils/constants';

// =============================================================================
// Types
// =============================================================================

/**
 * Fields that can be individually validated.
 */
export type ValidatableField = 'title' | 'location' | 'tags' | 'applianceType';

/**
 * Return type for the useItemValidation hook.
 */
export interface UseItemValidationReturn {
  /** Complete validation result object */
  validation: ItemCaptureValidation;
  /** Overall validation state - false if any blocking error exists */
  isValid: boolean;
  /** Blocking errors that prevent submission */
  errors: Record<string, string>;
  /** Non-blocking warnings */
  warnings: Record<string, string>;
  /** Validate a specific field */
  validateField: (field: ValidatableField, value: string) => ValidationResult;
  /** Run full validation (same as validation property) */
  validateAll: () => ItemCaptureValidation;
  /** Calculate total size of all media items in bytes */
  calculateTotalSize: () => number;
  /** Calculate remaining upload capacity in bytes */
  getRemainingSize: () => number;
  /** Format bytes to human-readable string */
  formatSize: (bytes: number) => string;
  /** Maximum allowed total size in bytes */
  maxTotalSize: number;
  /** Whether content exists (media or text) */
  hasContent: boolean;
  /** Whether media items exist */
  hasMedia: boolean;
  /** Whether text instructions exist */
  hasText: boolean;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Custom hook for real-time validation of ItemCapture data.
 *
 * Features:
 * - Memoized validation results for performance
 * - Updates automatically when inputs change
 * - Provides utility methods for size calculations
 * - Separates blocking errors from non-blocking warnings
 *
 * @param metadata - Item metadata including title, location, tags
 * @param mediaItems - Array of media items to validate
 * @param instructions - Text instructions to validate
 * @returns Validation state and utility functions
 *
 * @example
 * ```tsx
 * const {
 *   isValid,
 *   errors,
 *   warnings,
 *   calculateTotalSize,
 *   getRemainingSize,
 *   formatSize,
 * } = useItemValidation(metadata, mediaItems, instructions);
 *
 * // Display validation state
 * if (!isValid) {
 *   Object.values(errors).map(error => <p key={error}>{error}</p>);
 * }
 *
 * // Display size info
 * const total = calculateTotalSize();
 * const remaining = getRemainingSize();
 * console.log(`Used: ${formatSize(total)}, Remaining: ${formatSize(remaining)}`);
 * ```
 */
export function useItemValidation(
  metadata: ItemMetadata,
  mediaItems: MediaItem[],
  instructions: string
): UseItemValidationReturn {
  // ==========================================================================
  // Memoized Validation Result
  // ==========================================================================

  /**
   * Run full validation and memoize the result.
   * Only re-runs when any of the inputs change.
   */
  const validation = useMemo((): ItemCaptureValidation => {
    return validateItemCapture(metadata, mediaItems, instructions);
  }, [metadata, mediaItems, instructions]);

  // ==========================================================================
  // Derived Values
  // ==========================================================================

  const isValid = validation.isValid;
  const errors = validation.errors;
  const warnings = validation.warnings;
  const hasContent = validation.content.hasContent;
  const hasMedia = validation.content.hasMedia;
  const hasText = validation.content.hasText;
  const maxTotalSize = CAPTURE_CONSTRAINTS.total.maxSize;

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Validate a specific field.
   * Useful for showing real-time validation feedback on blur.
   */
  const validateField = useCallback(
    (field: ValidatableField, value: string): ValidationResult => {
      switch (field) {
        case 'title':
          return validateTitle(value);
        case 'location':
          // Location is optional, always valid
          return { isValid: true };
        case 'tags':
          // Tags are optional, always valid
          return { isValid: true };
        case 'applianceType':
          // Appliance type is optional, always valid
          return { isValid: true };
        default:
          return { isValid: true };
      }
    },
    []
  );

  /**
   * Run full validation explicitly.
   * Usually not needed since validation is memoized, but provided for
   * cases where you need to trigger validation imperatively.
   */
  const validateAll = useCallback((): ItemCaptureValidation => {
    return validateItemCapture(metadata, mediaItems, instructions);
  }, [metadata, mediaItems, instructions]);

  /**
   * Calculate total size of all media items.
   */
  const calculateTotalSizeFn = useCallback((): number => {
    return calculateTotalSize(mediaItems);
  }, [mediaItems]);

  /**
   * Calculate remaining upload capacity.
   */
  const getRemainingSize = useCallback((): number => {
    return calculateRemainingSize(mediaItems);
  }, [mediaItems]);

  /**
   * Format bytes to human-readable string.
   * Re-exported for convenience.
   */
  const formatSize = useCallback((bytes: number): string => {
    return formatFileSize(bytes);
  }, []);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    validation,
    isValid,
    errors,
    warnings,
    validateField,
    validateAll,
    calculateTotalSize: calculateTotalSizeFn,
    getRemainingSize,
    formatSize,
    maxTotalSize,
    hasContent,
    hasMedia,
    hasText,
  };
}

export default useItemValidation;
