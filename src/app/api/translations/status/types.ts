/**
 * Translation Status API Types
 * Part of REQ-E05-001: Create Translation Status API Endpoint
 *
 * Type definitions for the translation status endpoint request and response structures.
 * This endpoint provides aggregated translation status data for owner management.
 *
 * @created 2026-01-23
 * @lastModified 2026-01-23 16:45
 */

import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// Re-export for convenience
export type { SupportedLanguage };

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Query parameters for the translation status endpoint.
 * All parameters are optional and used for filtering.
 */
export interface TranslationStatusQueryParams {
  /** Filter by entity type: 'item', 'article', 'link', or 'tag' */
  entityType?: string;
  /** Filter by specific entity ID */
  entityId?: string;
  /** Filter by translation status: 'pending', 'processing', 'completed', 'failed', 'manual' */
  status?: string;
  /** Filter by property ID */
  propertyId?: string;
}

// ============================================================================
// Status Types
// ============================================================================

/**
 * Translation status values for tracking translation lifecycle.
 *
 * - pending: Translation queued but not yet started
 * - processing: Translation currently in progress
 * - completed: Translation finished successfully
 * - failed: Translation failed after all retry attempts
 * - manual: Translation provided manually by user (not auto-generated)
 */
export type TranslationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'manual';

/**
 * Detailed status information for a single language translation.
 * Provides granular information about translation state.
 */
export interface LanguageStatusDetail {
  /** Current status of the translation */
  status: TranslationStatus;
  /** ISO 8601 timestamp when translation was completed */
  translatedAt?: string;
  /** Whether the source content was updated after translation */
  isStale?: boolean;
  /** User ID who reviewed/edited the translation */
  reviewedBy?: string;
}

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Valid entity types for translation status queries.
 */
export type EntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * Translation status for a single translatable entity.
 * Contains the entity metadata and translation status per language.
 */
export interface ItemTranslationStatus {
  /** Type of entity: 'item', 'article', 'link', or 'tag' */
  entityType: EntityType;
  /** Unique identifier of the entity */
  entityId: string;
  /** Display name of the entity */
  name: string;
  /** Source language of the original content */
  sourceLanguage: SupportedLanguage;
  /** Translation status for each target language */
  translations: Partial<Record<SupportedLanguage, LanguageStatusDetail>>;
}

// ============================================================================
// Summary Types
// ============================================================================

/**
 * Aggregated summary of translation status counts.
 * Provides quick overview for dashboard displays.
 */
export interface TranslationStatusSummary {
  /** Total number of translation slots (entities × target languages) */
  total: number;
  /** Number of completed translations */
  complete: number;
  /** Number of pending/processing translations */
  pending: number;
  /** Number of failed translations */
  failed: number;
  /** Number of manual translations */
  manual: number;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response body for the translation status endpoint.
 * Contains summary counts and detailed item-level status.
 */
export interface TranslationStatusResponse {
  /** Whether the request was processed successfully */
  success: boolean;
  /** Aggregated summary of translation counts */
  summary: TranslationStatusSummary;
  /** Array of entities with their translation status */
  items: ItemTranslationStatus[];
  /** Error message if success is false */
  error?: string;
}

// ============================================================================
// Internal Types (for route handler use)
// ============================================================================

/**
 * Entity record from database query.
 * Normalized structure for all entity types.
 */
export interface EntityRecord {
  /** Entity ID */
  id: string;
  /** Display name or title */
  name: string;
  /** Source language code */
  sourceLanguage: SupportedLanguage;
  /** Associated property ID */
  propertyId: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Translation record from database query.
 * Normalized structure across translation tables.
 */
export interface TranslationRecord {
  /** Entity ID this translation belongs to */
  entityId: string;
  /** Target language code */
  language: SupportedLanguage;
  /** Translation status */
  translationStatus: TranslationStatus;
  /** Completion timestamp */
  translatedAt?: string;
  /** Reviewer user ID */
  reviewedBy?: string;
}

/**
 * Job record from translation_jobs table.
 * Represents pending/processing translation work.
 */
export interface JobRecord {
  /** Entity ID */
  entityId: string;
  /** Target language code */
  targetLanguage: SupportedLanguage;
  /** Job status */
  status: 'queued' | 'processing';
  /** Job creation timestamp */
  createdAt: string;
}
