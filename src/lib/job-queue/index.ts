/**
 * Translation Job Queue Module
 * Part of REQ-243: Translation Job Queue Module for Background Processing
 *
 * This module provides database-backed job queue functionality for
 * asynchronous translation processing.
 *
 * Usage:
 * ```typescript
 * import { createTranslationJob, fetchAndLockNextJob } from '@/lib/job-queue';
 * ```
 *
 * @module job-queue
 */

// Type exports
export type {
  SupportedLanguage,
  EntityType,
  JobStatus,
  TranslationJob,
  CreateJobParams,
  CreateBatchJobsParams,
  JobUpdateParams,
  FetchJobOptions,
  JobQueueResult,
} from './translation-jobs.types';

// Function exports
export {
  createTranslationJob,
  createBatchTranslationJobs,
  updateJobStatus,
  markJobCompleted,
  markJobFailed,
  fetchAndLockNextJob,
  releaseJobLock,
  getJobsByEntity,
  getJobsByStatus,
  cleanupStaleLocks,
} from './translation-jobs';

// Job processor exports (REQ-244)
export {
  TranslationJobProcessor,
  createJobProcessor,
  getJobProcessor,
  resetJobProcessor,
  startJobProcessor,
  stopJobProcessor,
  fetchEntityContent,
  saveTranslation,
  // Entity-specific processors (REQ-E03-017)
  processTagTranslationJob,
} from './job-processor';

// Job processor types (REQ-244 + REQ-E03-013)
export type {
  JobProcessorConfig,
  JobProcessingResult,
  ProcessingRunResult,
  ProcessorStats,
  EntityContent,
  ArticleContent,
  ItemContent,
  LinkContent,
  TagContent,
  EntityTranslationResult,  // NEW: REQ-E03-013
  EntityProcessorFn,        // NEW: REQ-E03-013
} from './job-processor';

// Concurrency control exports (REQ-245)
export {
  // Stale lock recovery
  cleanupStaleProcessingJobs,
  findStaleProcessingJobs,
  // Lock heartbeat
  refreshJobLock,
  createLockHeartbeat,
  // Duplicate prevention
  checkForDuplicateJob,
  createJobIfNotExists,
  // Lock statistics
  getLockStatistics,
  getStaleLocksCount,
  // Manager
  ConcurrencyControlManager,
  createConcurrencyManager,
  getConcurrencyManager,
  resetConcurrencyManager,
  // Constants
  DEFAULT_LOCK_TIMEOUT_MINUTES,
  DEFAULT_HEARTBEAT_INTERVAL_MS,
  DEFAULT_CLEANUP_INTERVAL_MS,
  DEFAULT_MAX_STALE_RETRIES,
  DEFAULT_CONCURRENCY_CONFIG,
} from './concurrency-control';

// Concurrency control types (REQ-245)
export type {
  ConcurrencyConfig,
  CleanupResult,
  LockStatistics,
  HeartbeatResult,
  DuplicateCheckResult,
} from './concurrency-control';

// Priority utilities (REQ-E03-018)
export {
  PRIORITY_LEVELS,
  RECENT_CONTENT_THRESHOLD_MINUTES,
  calculateJobPriority,
  isRecentContent,
} from './priority';

// Priority types (REQ-E03-018)
export type {
  PriorityLevel,
  PriorityCalculationOptions,
} from './priority';
