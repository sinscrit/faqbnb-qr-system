/**
 * Translation Configuration
 * Part of REQ-E03-026: Set Up Railway Cron Job
 *
 * Centralized configuration for translation job processing,
 * cron scheduling, and service authentication.
 *
 * @module lib/config/translation-config
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

// ===========================================================================
// Types
// ===========================================================================

/**
 * Translation processing mode
 * - responsive: 1-minute interval, batch size 10
 * - cost_optimized: 5-minute interval, batch size 50
 */
export type TranslationMode = 'responsive' | 'cost_optimized';

/**
 * Translation configuration interface
 */
export interface TranslationConfig {
  /** Processing mode (responsive | cost_optimized) */
  mode: TranslationMode;
  /** Number of jobs to process per cron cycle */
  batchSize: number;
  /** Whether cron-triggered processing is enabled */
  cronEnabled: boolean;
  /** Service token for cron authentication (if configured) */
  serviceToken: string | undefined;
  /** Whether service token is configured and valid */
  hasServiceToken: boolean;
}

// ===========================================================================
// Configuration
// ===========================================================================

/**
 * Get current translation configuration from environment variables
 *
 * @returns TranslationConfig object with validated settings
 */
export function getTranslationConfig(): TranslationConfig {
  const mode = parseMode(process.env.TRANSLATION_MODE);
  const serviceToken = process.env.TRANSLATION_SERVICE_TOKEN;

  return {
    mode,
    batchSize: parseBatchSize(process.env.TRANSLATION_BATCH_SIZE, mode),
    cronEnabled: process.env.TRANSLATION_CRON_ENABLED !== 'false',
    serviceToken,
    hasServiceToken: !!(serviceToken && serviceToken.length >= 32),
  };
}

/**
 * Parse and validate translation mode
 */
function parseMode(value: string | undefined): TranslationMode {
  if (value === 'cost_optimized') {
    return 'cost_optimized';
  }
  return 'responsive'; // Default
}

/**
 * Parse batch size with mode-aware defaults
 */
function parseBatchSize(value: string | undefined, mode: TranslationMode): number {
  if (value) {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
      return parsed;
    }
  }
  // Mode-aware defaults
  return mode === 'cost_optimized' ? 50 : 10;
}

// ===========================================================================
// Singleton Export (for convenience)
// ===========================================================================

/**
 * Translation configuration singleton
 * Note: Values are read at first access, so environment variables
 * should be set before this is used.
 */
export const translationConfig = getTranslationConfig();
