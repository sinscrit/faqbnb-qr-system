/**
 * Translation Job Queue Types
 * Part of REQ-243: Translation Job Queue Module
 *
 * This file defines all TypeScript types for the translation job queue,
 * including supported languages, entity types, job status, and interfaces
 * for job operations.
 */

/** Supported languages for translation - ISO 639-1 codes */
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/** Types of content entities that can be translated */
export type EntityType = 'article' | 'item' | 'link' | 'tag';

/** Possible states for a translation job */
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Represents a translation job in the queue
 * Maps to the translation_jobs database table
 */
export interface TranslationJob {
  id: string;
  entityType: EntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  status: JobStatus;
  attempts: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}

/**
 * Parameters for creating a single translation job
 */
export interface CreateJobParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}

/**
 * Parameters for creating translation jobs for multiple target languages
 */
export interface CreateBatchJobsParams {
  entityType: EntityType;
  entityId: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
}

/**
 * Parameters for updating a job's status and related fields
 */
export interface JobUpdateParams {
  status?: JobStatus;
  attempts?: number;
  errorMessage?: string | null;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Options for fetching and locking the next available job
 */
export interface FetchJobOptions {
  workerId: string;
  lockTimeoutMinutes?: number;
}

/**
 * Generic result type for job queue operations
 * Provides consistent error handling across all functions
 */
export interface JobQueueResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
