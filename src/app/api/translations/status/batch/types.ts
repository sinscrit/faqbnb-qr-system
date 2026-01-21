/**
 * Batch Translation Status Types
 * Part of REQ-E03-024: Create Batch Status Endpoint for List Views
 *
 * Type definitions for the batch status endpoint request and response structures.
 *
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Valid entity types for translation status queries
 */
export type EntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * Specification for a single entity in a batch request
 */
export interface EntitySpecification {
  /** Type of entity to query status for */
  entityType: EntityType;
  /** Unique identifier of the entity */
  entityId: string;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request body for batch status endpoint
 */
export interface BatchStatusRequest {
  /** Array of entity specifications to query (max 100) */
  entities: EntitySpecification[];
}

// ============================================================================
// Status Types
// ============================================================================

/**
 * Possible status values for an entity's translation state
 */
export type EntityStatus =
  | 'not_found'
  | 'error'
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'not_started'
  | 'has_failures';

/**
 * Summary of translation status for a single entity
 */
export interface EntityStatusSummary {
  /** Type of entity this status refers to */
  entityType: EntityType;
  /** Unique identifier of the entity */
  entityId: string;
  /** Overall translation status */
  status: EntityStatus;
  /** Percentage of target languages completed (0-100) */
  completionPercentage?: number;
  /** Languages that have completed translations */
  availableLanguages?: SupportedLanguage[];
  /** Number of translations currently pending (queued/processing) */
  pendingCount?: number;
  /** Number of translations that have failed */
  failedCount?: number;
  /** Error message if status is 'error' */
  errorMessage?: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Metadata about the batch request processing
 */
export interface BatchStatusMeta {
  /** Number of entities requested */
  requested: number;
  /** Number of entities returned (same as requested) */
  returned: number;
  /** Time taken to process the request in milliseconds */
  processingTimeMs: number;
}

/**
 * Response body for batch status endpoint
 */
export interface BatchStatusResponse {
  /** Whether the request was processed successfully */
  success: boolean;
  /** Array of status summaries (same order as request) */
  data?: EntityStatusSummary[];
  /** Error message if success is false */
  error?: string;
  /** Metadata about the request processing */
  meta?: BatchStatusMeta;
}
