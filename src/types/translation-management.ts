/**
 * Translation Management Types
 * Types for manual translation override API
 *
 * Part of REQ-E03-023: Create Manual Translation Override Endpoint
 * Epic: L10N Epic 3 - Dynamic Content Translation
 * Phase: 4 - Translation Status & Management APIs
 *
 * Created: 2026-01-21
 * Last Modified: 2026-01-21
 */

// ============================================================================
// Entity and Field Types
// ============================================================================

/**
 * Valid entity types for translation override operations
 */
export type TranslationEntityType = 'item' | 'article' | 'link' | 'tag';

// ============================================================================
// Request Body Interfaces
// ============================================================================

/**
 * Request body for overriding item translations
 * Items have: name (required), description (optional)
 */
export interface ItemTranslationOverrideRequest {
  /** Translated item name */
  name?: string;
  /** Translated item description */
  description?: string;
}

/**
 * Request body for overriding article translations
 * Articles have: title (required), description (optional)
 */
export interface ArticleTranslationOverrideRequest {
  /** Translated article title */
  title?: string;
  /** Translated article description */
  description?: string;
}

/**
 * Request body for overriding link translations
 * Links have: title (required only)
 */
export interface LinkTranslationOverrideRequest {
  /** Translated link title */
  title?: string;
}

/**
 * Request body for overriding tag translations
 * Tags have: value (translated_value in DB)
 */
export interface TagTranslationOverrideRequest {
  /** Translated tag value */
  value?: string;
}

/**
 * Union type for all possible translation override request bodies
 */
export type TranslationOverrideRequest =
  | ItemTranslationOverrideRequest
  | ArticleTranslationOverrideRequest
  | LinkTranslationOverrideRequest
  | TagTranslationOverrideRequest;

// ============================================================================
// Response Types
// ============================================================================

/**
 * Data returned on successful manual translation override
 */
export interface ManualTranslationResponseData {
  /** ID of the entity that was translated */
  entityId: string;
  /** Type of entity that was translated */
  entityType: TranslationEntityType;
  /** Target language code */
  language: string;
  /** Number of fields that were updated */
  fieldsUpdated: number;
  /** Translation status (always 'manual' for manual overrides) */
  translationStatus: 'manual';
  /** User ID who performed the override */
  reviewedBy: string;
  /** Timestamp of the override */
  updatedAt: string;
}

/**
 * Successful response from manual translation override API
 */
export interface ManualTranslationResponse {
  success: true;
  data: ManualTranslationResponseData;
}

/**
 * Error response from manual translation override API
 */
export interface ManualTranslationErrorResponse {
  success: false;
  error: string;
  code: string;
}

/**
 * Combined response type for the manual translation override API
 */
export type ManualTranslationApiResponse =
  | ManualTranslationResponse
  | ManualTranslationErrorResponse;

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Error codes returned by the manual translation override API
 */
export type ManualTranslationErrorCode =
  | 'INVALID_ENTITY_TYPE'
  | 'INVALID_ENTITY_ID'
  | 'INVALID_LANGUAGE'
  | 'ENTITY_NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_FIELDS'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

// ============================================================================
// Field Definitions
// ============================================================================

/**
 * Translatable fields per entity type
 * Used for validation of request bodies
 */
export const TRANSLATABLE_FIELDS_BY_ENTITY: Record<TranslationEntityType, string[]> = {
  item: ['name', 'description'],
  article: ['title', 'description'],
  link: ['title'],
  tag: ['value'],
};

/**
 * Maximum field lengths for validation
 */
export const MAX_TRANSLATION_FIELD_LENGTHS: Record<string, number> = {
  name: 255,
  title: 255,
  value: 255,
  description: 5000,
};
