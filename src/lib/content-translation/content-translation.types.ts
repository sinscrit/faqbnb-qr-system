/**
 * Content Translation Module Type Definitions
 * Part of REQ-E03-001: Create Content Translation Module Structure
 *
 * This module defines TypeScript interfaces and types for content translation
 * operations, including translation triggers, queuing, and status tracking.
 *
 * @module content-translation/types
 * @created 2026-01-20
 */

// ============================================================================
// Imports from Epic 1 Infrastructure
// ============================================================================

import type { SupportedLanguage, TranslationContext } from '@/lib/translation-service';

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Entity types that support content translation.
 * Maps to the *_translations database tables.
 *
 * - item: Items with name and description fields
 * - article: Articles with title and description fields
 * - link: Links with title field only (URLs are not translated)
 * - tag: Tags with a single translatable value
 */
export type EntityType = 'item' | 'article' | 'link' | 'tag';

/**
 * What triggered the translation request.
 * Affects job priority in the queue.
 *
 * - create: Content was newly created (higher priority)
 * - update: Existing content was modified (standard priority)
 */
export type TranslationTrigger = 'create' | 'update';

// ============================================================================
// Content Definition Interfaces
// ============================================================================

/**
 * Individual field that needs translation.
 * Represents a single translatable text field with its context.
 */
export interface TranslatableField {
  /**
   * Name of the field in the database.
   * Examples: 'name', 'description', 'title'
   */
  fieldName: string;

  /**
   * Current value to translate.
   * Must be non-empty string for translation to proceed.
   */
  value: string;

  /**
   * Context information for better translation quality.
   * Uses TranslationContext from Epic 1 translation-service.
   */
  context: TranslationContext;

  /**
   * Maximum character length for translated text.
   * AI will attempt to keep translations within this limit.
   * Optional - omit if no length restriction.
   */
  maxLength?: number;
}

/**
 * Content to be translated, with all necessary fields and context.
 * This is the primary input structure for the translation orchestrator.
 */
export interface ContentToTranslate {
  /**
   * Type of entity being translated.
   * Determines which database table stores the translation.
   */
  entityType: EntityType;

  /**
   * UUID of the entity to translate.
   * Used to link translations back to the source entity.
   */
  entityId: string;

  /**
   * Source language of the original content.
   * Translation will be performed FROM this language TO target languages.
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Array of fields to translate.
   * Each field includes its value and translation context.
   */
  fields: TranslatableField[];
}

// ============================================================================
// Queue Operation Interfaces
// ============================================================================

/**
 * Options for queuing content translations.
 * Input for the queueContentTranslations function (Task 1.2).
 */
export interface QueueTranslationOptions {
  /**
   * Content to translate with all fields and context.
   */
  content: ContentToTranslate;

  /**
   * What triggered this translation request.
   * Affects job priority: 'create' = higher priority.
   */
  trigger: TranslationTrigger;

  /**
   * Languages to skip when queuing translations.
   * Useful if certain languages already have translations.
   * Optional - defaults to translating to all other supported languages.
   */
  excludeLanguages?: SupportedLanguage[];

  /**
   * Custom priority override for the translation jobs.
   * Higher numbers = more urgent processing.
   * Optional - defaults to priority based on trigger type.
   * Default priorities: create = 100, update = 50
   */
  priority?: number;
}

/**
 * Result of queuing translation jobs.
 * Returned by queueContentTranslations function.
 */
export interface QueueTranslationResult {
  /**
   * Whether the queuing operation succeeded.
   * true if at least one job was queued successfully.
   */
  success: boolean;

  /**
   * UUIDs of created translation jobs.
   * Can be used to track job progress.
   */
  jobIds: string[];

  /**
   * Languages that were successfully queued for translation.
   * Excludes source language and any excluded languages.
   */
  queuedLanguages: SupportedLanguage[];

  /**
   * Error message if the operation failed.
   * Present when success is false.
   */
  error?: string;
}

// ============================================================================
// Translation Status Interfaces
// ============================================================================

/**
 * Translation status for a specific language.
 * Tracks the state of a single language translation for an entity.
 */
export interface LanguageTranslationStatus {
  /**
   * Current status of the translation.
   * - pending: Translation queued but not yet processed
   * - completed: Translation finished successfully (auto-generated)
   * - failed: Translation failed after all retry attempts
   * - manual: Translation was manually edited by a user
   */
  status: 'pending' | 'completed' | 'failed' | 'manual';

  /**
   * ISO 8601 timestamp when translation was completed.
   * Present for 'completed' and 'manual' statuses.
   */
  translatedAt?: string;

  /**
   * UUID of user who reviewed/edited the translation.
   * Present only for 'manual' status.
   */
  reviewedBy?: string;

  /**
   * Error message if translation failed.
   * Present only for 'failed' status.
   */
  error?: string;
}

/**
 * Complete translation status for an entity.
 * Used by status API endpoints (Task 4.1).
 */
export interface TranslationStatusResult {
  /**
   * UUID of the entity.
   */
  entityId: string;

  /**
   * Type of entity (item, article, link, tag).
   */
  entityType: EntityType;

  /**
   * Source language of the original content.
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Overall status across all target languages.
   * - complete: All translations are completed or manual
   * - partial: Some translations completed, some pending or failed
   * - pending: All translations are pending
   * - failed: All translations have failed
   */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';

  /**
   * Per-language translation status.
   * Keys are language codes, values are status details.
   */
  translations: Record<SupportedLanguage, LanguageTranslationStatus>;
}

/**
 * Extended status for UI display.
 * Includes convenience arrays for filtering and display.
 * Used by frontend components in Epic 5.
 */
export interface EntityTranslationStatus {
  /**
   * UUID of the entity.
   */
  entityId: string;

  /**
   * Type of entity.
   */
  entityType: EntityType;

  /**
   * Source language of original content.
   */
  sourceLanguage: SupportedLanguage;

  /**
   * Overall status summary.
   */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed';

  /**
   * Per-language translation status.
   * Uses string keys for JSON serialization compatibility.
   */
  translations: {
    [language: string]: {
      status: 'pending' | 'completed' | 'failed' | 'manual';
      translatedAt?: string;
      reviewedBy?: string;
    }
  };

  /**
   * Language codes that are still pending translation.
   * Convenience array for UI filtering.
   */
  pendingLanguages: string[];

  /**
   * Language codes with completed translations.
   * Convenience array for UI display.
   */
  completedLanguages: string[];

  /**
   * Language codes with failed translations.
   * Convenience array for retry functionality.
   */
  failedLanguages: string[];
}

// ============================================================================
// Translation Context Templates
// ============================================================================

/**
 * Pre-defined translation contexts for optimal translation quality.
 * Use these when triggering translations for specific content types.
 *
 * These contexts provide domain-specific guidance to the AI translation
 * provider, resulting in more accurate and natural translations.
 *
 * @see Plan-111-L10N-Epic3-Dynamic-Content-Translation.md Appendix A
 */
export const TRANSLATION_CONTEXTS = {
  /**
   * Context for item name translations.
   * Items are household appliances/objects in vacation rentals.
   */
  item_name: {
    contentType: 'item_name' as const,
    domainContext: 'property_rental_appliances',
    tone: 'concise' as const,
  },

  /**
   * Context for item description translations.
   * Descriptions explain how to use/find items.
   */
  item_description: {
    contentType: 'item_description' as const,
    domainContext: 'property_rental_appliances',
    tone: 'friendly' as const,
  },

  /**
   * Context for article title translations.
   * Article titles are instruction headers.
   */
  article_title: {
    contentType: 'article_title' as const,
    domainContext: 'property_rental_instructions',
    tone: 'concise' as const,
  },

  /**
   * Context for article description translations.
   * Article descriptions contain instruction content.
   */
  article_description: {
    contentType: 'article_description' as const,
    domainContext: 'property_rental_instructions',
    tone: 'friendly' as const,
  },

  /**
   * Context for link title translations.
   * Link titles describe embedded media (videos, PDFs).
   */
  link_title: {
    contentType: 'link_title' as const,
    domainContext: 'property_rental_media',
    tone: 'concise' as const,
  },

  /**
   * Context for tag translations.
   * Tags are category labels for filtering items.
   */
  tag: {
    contentType: 'tag' as const,
    domainContext: 'property_rental_categorization',
    tone: 'concise' as const,
  },
} as const;

/**
 * Type for translation context template keys.
 * Use this for type-safe access to TRANSLATION_CONTEXTS.
 */
export type TranslationContextKey = keyof typeof TRANSLATION_CONTEXTS;
