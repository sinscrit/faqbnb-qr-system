/**
 * Polling Utilities for E2E Tests
 *
 * Provides wait/poll helpers for asynchronous operations in E2E tests.
 *
 * @module content-translation/__tests__/e2e/helpers/polling-utils
 * @lastModified 2026-01-21
 */

import { getTableRecords } from '@/lib/job-queue/__tests__/helpers/mockSupabase';
import { TABLE_NAMES } from '@/lib/job-queue/__tests__/helpers/constants';
import type { TranslationJob, EntityType } from '@/lib/job-queue/translation-jobs.types';

/**
 * Polling configuration options
 */
export interface PollingOptions {
  /** Maximum time to wait in milliseconds (default: 5000) */
  maxWaitMs: number;
  /** Interval between polls in milliseconds (default: 100) */
  intervalMs: number;
  /** Callback for progress updates */
  onProgress?: (attempt: number, elapsed: number) => void;
}

const DEFAULT_OPTIONS: PollingOptions = {
  maxWaitMs: 5000,
  intervalMs: 100,
};

/**
 * Translation status summary interface
 */
export interface TranslationStatusSummary {
  entityId: string;
  entityType: EntityType;
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';
  completedLanguages: string[];
  pendingLanguages: string[];
  failedLanguages: string[];
  totalJobs: number;
}

/**
 * Wait for all translation jobs for an entity to complete.
 *
 * @returns true if all jobs completed, false if timeout or jobs failed
 */
export async function waitForJobsToComplete(
  entityId: string,
  entityType: EntityType,
  options?: Partial<PollingOptions>
): Promise<boolean> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < opts.maxWaitMs) {
    attempt++;
    const elapsed = Date.now() - startTime;

    if (opts.onProgress) {
      opts.onProgress(attempt, elapsed);
    }

    const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
    const entityJobs = jobs.filter(
      j => j.entityId === entityId && j.entityType === entityType
    );

    if (entityJobs.length === 0) {
      // No jobs found, wait and retry
      await sleep(opts.intervalMs);
      continue;
    }

    const allComplete = entityJobs.every(
      j => j.status === 'completed' || j.status === 'failed'
    );

    if (allComplete) {
      return entityJobs.every(j => j.status === 'completed');
    }

    await sleep(opts.intervalMs);
  }

  return false; // Timeout
}

/**
 * Wait for translation status to reach expected state.
 *
 * @returns The status result or null if timeout
 */
export async function waitForTranslationStatus(
  entityId: string,
  entityType: EntityType,
  expectedStatus: 'complete' | 'partial' | 'pending' | 'failed',
  options?: Partial<PollingOptions>
): Promise<TranslationStatusSummary | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < opts.maxWaitMs) {
    attempt++;
    const elapsed = Date.now() - startTime;

    if (opts.onProgress) {
      opts.onProgress(attempt, elapsed);
    }

    const status = calculateTranslationStatus(entityId, entityType);

    if (status.overallStatus === expectedStatus) {
      return status;
    }

    await sleep(opts.intervalMs);
  }

  return null; // Timeout
}

/**
 * Generic condition polling utility.
 *
 * @returns true if condition met, false if timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean> | boolean,
  options?: Partial<PollingOptions>
): Promise<boolean> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < opts.maxWaitMs) {
    attempt++;

    if (opts.onProgress) {
      opts.onProgress(attempt, Date.now() - startTime);
    }

    const result = await condition();
    if (result) {
      return true;
    }

    await sleep(opts.intervalMs);
  }

  return false; // Timeout
}

/**
 * Calculate translation status from mock database.
 */
function calculateTranslationStatus(
  entityId: string,
  entityType: EntityType
): TranslationStatusSummary {
  const jobs = getTableRecords<TranslationJob>(TABLE_NAMES.TRANSLATION_JOBS);
  const entityJobs = jobs.filter(
    j => j.entityId === entityId && j.entityType === entityType
  );

  const completedLanguages = entityJobs
    .filter(j => j.status === 'completed')
    .map(j => j.targetLanguage);

  const pendingLanguages = entityJobs
    .filter(j => j.status === 'queued' || j.status === 'processing')
    .map(j => j.targetLanguage);

  const failedLanguages = entityJobs
    .filter(j => j.status === 'failed')
    .map(j => j.targetLanguage);

  let overallStatus: 'complete' | 'partial' | 'pending' | 'failed';

  if (failedLanguages.length > 0 && pendingLanguages.length === 0) {
    overallStatus = completedLanguages.length > 0 ? 'partial' : 'failed';
  } else if (pendingLanguages.length > 0) {
    overallStatus = completedLanguages.length > 0 ? 'partial' : 'pending';
  } else if (completedLanguages.length > 0) {
    overallStatus = 'complete';
  } else {
    overallStatus = 'pending';
  }

  return {
    entityId,
    entityType,
    overallStatus,
    completedLanguages,
    pendingLanguages,
    failedLanguages,
    totalJobs: entityJobs.length,
  };
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
