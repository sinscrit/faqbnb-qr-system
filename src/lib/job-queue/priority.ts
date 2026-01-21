/**
 * Job Priority Utilities
 * Part of REQ-E03-018: Implement Job Prioritization
 *
 * Provides priority calculation for translation jobs based on:
 * - Content recency (new content gets highest priority)
 * - Operation type (updates vs batch imports vs retries)
 *
 * Last Modified: 2026-01-21
 */

/**
 * Priority levels for translation jobs
 * Higher values = more urgent processing
 */
export const PRIORITY_LEVELS = {
  URGENT: 100,    // Recently created content (< 5 minutes)
  HIGH: 50,       // Updated content
  NORMAL: 25,     // Batch imports
  LOW: 10,        // Retry operations
} as const;

/**
 * Type representing valid priority values
 */
export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

/** Threshold in minutes for "recent" content classification */
export const RECENT_CONTENT_THRESHOLD_MINUTES = 5;

/**
 * Options for calculating job priority
 */
export interface PriorityCalculationOptions {
  /** When the content entity was created (ISO string or Date) */
  contentCreatedAt?: string | Date;
  /** When the translation job was created (ISO string or Date) */
  jobCreatedAt?: string | Date;
  /** Number of retry attempts already made */
  retryCount?: number;
  /** Batch import identifier (if from bulk import) */
  batchId?: string | null;
}

/**
 * Parses a date string or Date object to Date
 * Internal helper for date normalization
 */
function parseDate(date: string | Date | undefined, fallback: Date): Date {
  if (!date) return fallback;
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? fallback : parsed;
}

/**
 * Checks if content was created recently (within threshold)
 *
 * @param contentCreatedAt - When the content entity was created
 * @param jobCreatedAt - When the translation job was created
 * @param thresholdMinutes - Minutes threshold for "recent" (default: 5)
 * @returns true if content was created within threshold of job creation
 */
export function isRecentContent(
  contentCreatedAt: Date,
  jobCreatedAt: Date,
  thresholdMinutes: number = RECENT_CONTENT_THRESHOLD_MINUTES
): boolean {
  const diffMs = jobCreatedAt.getTime() - contentCreatedAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  // Content must be created before or at same time as job, and within threshold
  return diffMinutes >= 0 && diffMinutes <= thresholdMinutes;
}

/**
 * Calculate the priority for a translation job
 *
 * Priority rules (evaluated in order):
 * 1. If content created within 5 minutes of job: URGENT (100)
 * 2. If job has batch_id: NORMAL (25)
 * 3. If retry_count > 0: LOW (10)
 * 4. Otherwise: HIGH (50) - assumes content update
 *
 * @param options - Context for priority calculation
 * @returns Numeric priority value (higher = more urgent)
 */
export function calculateJobPriority(options: PriorityCalculationOptions): PriorityLevel {
  const {
    contentCreatedAt,
    jobCreatedAt = new Date(),
    retryCount = 0,
    batchId,
  } = options;

  // Parse job creation date
  const jobDate = parseDate(jobCreatedAt, new Date());

  // Rule 1: Check if this is recently created content (highest priority)
  if (contentCreatedAt) {
    const contentDate = parseDate(contentCreatedAt, jobDate);

    if (isRecentContent(contentDate, jobDate)) {
      return PRIORITY_LEVELS.URGENT;
    }
  }

  // Rule 2: Check if this is a batch import (medium priority)
  if (batchId) {
    return PRIORITY_LEVELS.NORMAL;
  }

  // Rule 3: Check if this is a retry (lowest priority)
  if (retryCount > 0) {
    return PRIORITY_LEVELS.LOW;
  }

  // Rule 4: Default to HIGH priority (assumes content update)
  return PRIORITY_LEVELS.HIGH;
}
