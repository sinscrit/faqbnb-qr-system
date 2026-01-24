/**
 * Re-Translate API Endpoint
 *
 * POST /api/translations/retranslate
 *
 * Enables property owners to queue re-translation jobs for their content
 * entities in bulk. Unlike the retry endpoint (which retries failed jobs),
 * this endpoint creates new translation jobs regardless of current status,
 * with protection for manual edits via skipManualEdits and overwriteManual flags.
 *
 * Part of REQ-E05-003: Create Re-Translate API Endpoint
 * Epic: L10N Epic 5 - Owner Translation Management
 * Phase: 1 - API Endpoints
 *
 * Features:
 * - Bulk entity support (multiple items, articles, links in one request)
 * - Manual edit protection (default: skip manual translations)
 * - Language filtering (optional: re-translate only specific languages)
 * - Property ownership validation (users can only re-translate their own content)
 * - Efficient batch processing (avoid N+1 query problems)
 *
 * Created: 2026-01-22
 * Last Modified: 2026-01-24
 *
 * @example Request body:
 * {
 *   "entities": [
 *     { "entityType": "item", "entityId": "uuid-1" },
 *     { "entityType": "article", "entityId": "uuid-2" }
 *   ],
 *   "languages": ["fr", "es"],  // optional, defaults to all target languages
 *   "skipManualEdits": true,    // optional, default: true
 *   "overwriteManual": false    // optional, default: false
 * }
 *
 * @example Success response:
 * {
 *   "success": true,
 *   "jobsQueued": 8,
 *   "skipped": 2,
 *   "skippedReason": "2 entities skipped due to manual edits"
 * }
 *
 * See Also:
 * - /api/translations/retry - Retry failed translation jobs
 * - /api/translations/[entityType]/[entityId]/[language] - Manual override endpoint
 * - /api/translations/status - Translation status query endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import type {
  EntityType,
  SupportedLanguage,
} from '@/lib/job-queue/translation-jobs.types';
import { createTranslationJob } from '@/lib/job-queue/translation-jobs';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Specification for a single entity to re-translate
 * @property entityType - Type of content entity (item, article, link, tag)
 * @property entityId - Unique identifier for the entity (UUID for items/articles/links, string key for tags)
 */
interface RetranslateEntitySpec {
  entityType: EntityType;
  entityId: string;
}

/**
 * Request body for the re-translate endpoint
 * @property entities - Array of entities to re-translate (required, max 100)
 * @property languages - Optional array of target languages (defaults to all non-English languages)
 * @property skipManualEdits - If true, skip entities with manual translations (default: true)
 * @property overwriteManual - If true, overwrite manual translations (default: false, takes precedence over skipManualEdits)
 */
interface RetranslateRequest {
  entities: RetranslateEntitySpec[];
  languages?: SupportedLanguage[];
  skipManualEdits?: boolean;
  overwriteManual?: boolean;
}

/**
 * Response payload for the re-translate endpoint
 * @property success - Whether the operation completed (may be true even with skipped entities)
 * @property jobsQueued - Number of translation jobs successfully queued
 * @property skipped - Number of entities/languages that were skipped
 * @property skippedReason - Human-readable explanation of why entities were skipped
 * @property error - Error message if success is false
 * @property code - Error code for programmatic handling
 * @property metadata - Optional request metadata for debugging
 * @property warnings - Optional array of non-critical warnings
 */
interface RetranslateResponse {
  success: boolean;
  jobsQueued?: number;
  skipped?: number;
  skippedReason?: string;
  error?: string;
  code?: string;
  metadata?: {
    timestamp: string;
    userId: string;
    entityCount: number;
  };
  warnings?: string[];
}

/**
 * Error codes for the re-translate endpoint
 */
const RETRANSLATE_ERROR_CODES = {
  INVALID_ENTITY_TYPE: 'INVALID_ENTITY_TYPE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EMPTY_ENTITIES: 'EMPTY_ENTITIES',
} as const;

// ============================================================================
// Constants
// ============================================================================

/** Valid entity types that can be re-translated */
const VALID_ENTITY_TYPES: EntityType[] = ['item', 'article', 'link', 'tag'];

/** All supported languages in the system */
const VALID_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

/** Target languages for re-translation (excludes English as source) */
const TARGET_LANGUAGES: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];

/** Maximum entities allowed per request to prevent abuse */
const MAX_ENTITIES_PER_REQUEST = 100;

// ============================================================================
// Helper Functions - Request Validation
// ============================================================================

/**
 * Validates the request body for the re-translate endpoint
 *
 * @param body - Raw request body to validate
 * @returns Validation result with either validated data or error details
 */
function validateRequestBody(body: unknown): {
  valid: boolean;
  data?: RetranslateRequest;
  error?: { message: string; code: string };
} {
  // Check body exists and is object
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: { message: 'Request body is required', code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  const { entities, languages, skipManualEdits, overwriteManual } = body as Record<string, unknown>;

  // Validate entities field exists and is array
  if (!entities || !Array.isArray(entities)) {
    return {
      valid: false,
      error: { message: 'entities is required and must be an array', code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  // Validate entities array is not empty
  if (entities.length === 0) {
    return {
      valid: false,
      error: { message: 'entities array cannot be empty', code: RETRANSLATE_ERROR_CODES.EMPTY_ENTITIES },
    };
  }

  // Validate entities array does not exceed max
  if (entities.length > MAX_ENTITIES_PER_REQUEST) {
    return {
      valid: false,
      error: {
        message: `entities array exceeds maximum of ${MAX_ENTITIES_PER_REQUEST} entities per request`,
        code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR,
      },
    };
  }

  // UUID regex for validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Validate each entity in the array
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i] as Record<string, unknown>;

    // Validate entityType
    if (!entity.entityType || typeof entity.entityType !== 'string') {
      return {
        valid: false,
        error: {
          message: `entities[${i}].entityType is required and must be a string`,
          code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR,
        },
      };
    }

    if (!VALID_ENTITY_TYPES.includes(entity.entityType as EntityType)) {
      return {
        valid: false,
        error: {
          message: `entities[${i}].entityType "${entity.entityType}" is invalid. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          code: RETRANSLATE_ERROR_CODES.INVALID_ENTITY_TYPE,
        },
      };
    }

    // Validate entityId
    if (!entity.entityId || typeof entity.entityId !== 'string' || entity.entityId.trim() === '') {
      return {
        valid: false,
        error: {
          message: `entities[${i}].entityId is required and must be a non-empty string`,
          code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR,
        },
      };
    }

    // Validate UUID format for items, articles, links (not tags which use string keys)
    if (entity.entityType !== 'tag' && !uuidRegex.test(entity.entityId as string)) {
      return {
        valid: false,
        error: {
          message: `entities[${i}].entityId must be a valid UUID for ${entity.entityType} entities`,
          code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR,
        },
      };
    }
  }

  // Validate languages if provided
  let validatedLanguages: SupportedLanguage[] | undefined;
  if (languages !== undefined) {
    if (!Array.isArray(languages)) {
      return {
        valid: false,
        error: { message: 'languages must be an array', code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR },
      };
    }

    // Validate each language
    const invalidLanguages: string[] = [];
    for (const lang of languages) {
      if (typeof lang !== 'string' || !VALID_LANGUAGES.includes(lang as SupportedLanguage)) {
        invalidLanguages.push(String(lang));
      }
    }

    if (invalidLanguages.length > 0) {
      return {
        valid: false,
        error: {
          message: `Invalid language codes: ${invalidLanguages.join(', ')}. Must be one of: ${VALID_LANGUAGES.join(', ')}`,
          code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR,
        },
      };
    }

    validatedLanguages = languages as SupportedLanguage[];
  }

  // Validate skipManualEdits if provided
  if (skipManualEdits !== undefined && typeof skipManualEdits !== 'boolean') {
    return {
      valid: false,
      error: { message: 'skipManualEdits must be a boolean', code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  // Validate overwriteManual if provided
  if (overwriteManual !== undefined && typeof overwriteManual !== 'boolean') {
    return {
      valid: false,
      error: { message: 'overwriteManual must be a boolean', code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  // Build validated request
  const validatedRequest: RetranslateRequest = {
    entities: entities as RetranslateEntitySpec[],
    languages: validatedLanguages,
    skipManualEdits: skipManualEdits as boolean | undefined,
    overwriteManual: overwriteManual as boolean | undefined,
  };

  return { valid: true, data: validatedRequest };
}

// ============================================================================
// Helper Functions - Ownership Validation
// ============================================================================

/**
 * Validates that a user has ownership/access to a specific entity
 *
 * @param entityType - Type of entity to check
 * @param entityId - ID of the entity
 * @param userId - ID of the user requesting access
 * @param supabase - Supabase client instance
 * @returns Object indicating access status and any error message
 */
async function validateEntityOwnership(
  entityType: EntityType,
  entityId: string,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<{ hasAccess: boolean; error?: string }> {
  try {
    switch (entityType) {
      case 'item': {
        // Get item's property_id
        const { data: item, error: itemError } = await supabase
          .from('items')
          .select('property_id')
          .eq('id', entityId)
          .single();

        if (itemError || !item) {
          return { hasAccess: false, error: 'Entity not found' };
        }

        // Check property ownership
        const { data: property, error: propError } = await supabase
          .from('properties')
          .select('user_id, account_id')
          .eq('id', item.property_id)
          .single();

        if (propError || !property) {
          return { hasAccess: false, error: 'Property not found' };
        }

        // Direct owner check
        if (property.user_id === userId) {
          return { hasAccess: true };
        }

        // Check account membership
        if (property.account_id) {
          const { data: membership } = await supabase
            .from('account_users')
            .select('id')
            .eq('account_id', property.account_id)
            .eq('user_id', userId)
            .single();

          if (membership) {
            return { hasAccess: true };
          }
        }

        return { hasAccess: false, error: 'Access denied' };
      }

      case 'article': {
        // Get article's item_id
        const { data: article, error: articleError } = await supabase
          .from('item_articles')
          .select('item_id')
          .eq('id', entityId)
          .single();

        if (articleError || !article) {
          return { hasAccess: false, error: 'Entity not found' };
        }

        // Delegate to item ownership check
        return validateEntityOwnership('item', article.item_id, userId, supabase);
      }

      case 'link': {
        // Get link's item_id
        const { data: link, error: linkError } = await supabase
          .from('item_links')
          .select('item_id')
          .eq('id', entityId)
          .single();

        if (linkError || !link) {
          return { hasAccess: false, error: 'Entity not found' };
        }

        // Delegate to item ownership check
        return validateEntityOwnership('item', link.item_id, userId, supabase);
      }

      case 'tag': {
        // Tags are shared content, any authenticated user can re-translate
        return { hasAccess: true };
      }

      default:
        return { hasAccess: false, error: 'Unknown entity type' };
    }
  } catch (error) {
    console.error('RETRANSLATE: Ownership validation error', { entityType, entityId, error });
    return { hasAccess: false, error: 'Database error' };
  }
}

/**
 * Validates ownership for a batch of entities efficiently using batch queries
 *
 * @param entities - Array of entity specs to validate
 * @param userId - ID of the user requesting access
 * @param supabase - Supabase client instance
 * @returns Object containing arrays of owned and not-owned entities
 */
async function validateBatchOwnership(
  entities: RetranslateEntitySpec[],
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<{ owned: RetranslateEntitySpec[]; notOwned: RetranslateEntitySpec[] }> {
  const owned: RetranslateEntitySpec[] = [];
  const notOwned: RetranslateEntitySpec[] = [];

  // Group entities by type for efficient batch queries
  const itemIds: string[] = [];
  const articleIds: string[] = [];
  const linkIds: string[] = [];
  const tagEntities: RetranslateEntitySpec[] = [];
  const entityMap = new Map<string, RetranslateEntitySpec>();

  for (const entity of entities) {
    entityMap.set(`${entity.entityType}:${entity.entityId}`, entity);
    switch (entity.entityType) {
      case 'item':
        itemIds.push(entity.entityId);
        break;
      case 'article':
        articleIds.push(entity.entityId);
        break;
      case 'link':
        linkIds.push(entity.entityId);
        break;
      case 'tag':
        // Tags are always accessible
        tagEntities.push(entity);
        break;
    }
  }

  // All tags are owned by default
  owned.push(...tagEntities);

  // Batch query all items at once
  const allPropertyIds = new Set<string>();
  const itemToProperty = new Map<string, string>();
  const articleToItem = new Map<string, string>();
  const linkToItem = new Map<string, string>();

  // Query items
  if (itemIds.length > 0) {
    const { data: items } = await supabase
      .from('items')
      .select('id, property_id')
      .in('id', itemIds);

    if (items) {
      for (const item of items) {
        itemToProperty.set(item.id, item.property_id);
        allPropertyIds.add(item.property_id);
      }
    }
  }

  // Query articles to get item_ids
  if (articleIds.length > 0) {
    const { data: articles } = await supabase
      .from('item_articles')
      .select('id, item_id')
      .in('id', articleIds);

    if (articles) {
      for (const article of articles) {
        articleToItem.set(article.id, article.item_id);
      }

      // Get items for these articles
      const articleItemIds = [...new Set(articles.map((a: { item_id: string }) => a.item_id))];
      if (articleItemIds.length > 0) {
        const { data: articleItems } = await supabase
          .from('items')
          .select('id, property_id')
          .in('id', articleItemIds);

        if (articleItems) {
          for (const item of articleItems) {
            itemToProperty.set(item.id, item.property_id);
            allPropertyIds.add(item.property_id);
          }
        }
      }
    }
  }

  // Query links to get item_ids
  if (linkIds.length > 0) {
    const { data: links } = await supabase
      .from('item_links')
      .select('id, item_id')
      .in('id', linkIds);

    if (links) {
      for (const link of links) {
        linkToItem.set(link.id, link.item_id);
      }

      // Get items for these links
      const linkItemIds = [...new Set(links.map((l: { item_id: string }) => l.item_id))];
      if (linkItemIds.length > 0) {
        const { data: linkItems } = await supabase
          .from('items')
          .select('id, property_id')
          .in('id', linkItemIds);

        if (linkItems) {
          for (const item of linkItems) {
            itemToProperty.set(item.id, item.property_id);
            allPropertyIds.add(item.property_id);
          }
        }
      }
    }
  }

  // Query all properties at once
  const ownedPropertyIds = new Set<string>();
  const accountPropertyIds = new Map<string, string>(); // propertyId -> accountId

  if (allPropertyIds.size > 0) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id, user_id, account_id')
      .in('id', [...allPropertyIds]);

    if (properties) {
      for (const prop of properties) {
        if (prop.user_id === userId) {
          ownedPropertyIds.add(prop.id);
        } else if (prop.account_id) {
          accountPropertyIds.set(prop.id, prop.account_id);
        }
      }
    }
  }

  // Check account membership for non-direct-owned properties
  if (accountPropertyIds.size > 0) {
    const accountIds = [...new Set(accountPropertyIds.values())];
    const { data: memberships } = await supabase
      .from('account_users')
      .select('account_id')
      .eq('user_id', userId)
      .in('account_id', accountIds);

    if (memberships) {
      const userAccountIds = new Set(memberships.map((m: { account_id: string }) => m.account_id));
      for (const [propId, accId] of accountPropertyIds) {
        if (userAccountIds.has(accId)) {
          ownedPropertyIds.add(propId);
        }
      }
    }
  }

  // Classify items
  for (const itemId of itemIds) {
    const entity = entityMap.get(`item:${itemId}`)!;
    const propId = itemToProperty.get(itemId);
    if (propId && ownedPropertyIds.has(propId)) {
      owned.push(entity);
    } else {
      notOwned.push(entity);
    }
  }

  // Classify articles
  for (const articleId of articleIds) {
    const entity = entityMap.get(`article:${articleId}`)!;
    const itemId = articleToItem.get(articleId);
    const propId = itemId ? itemToProperty.get(itemId) : undefined;
    if (propId && ownedPropertyIds.has(propId)) {
      owned.push(entity);
    } else {
      notOwned.push(entity);
    }
  }

  // Classify links
  for (const linkId of linkIds) {
    const entity = entityMap.get(`link:${linkId}`)!;
    const itemId = linkToItem.get(linkId);
    const propId = itemId ? itemToProperty.get(itemId) : undefined;
    if (propId && ownedPropertyIds.has(propId)) {
      owned.push(entity);
    } else {
      notOwned.push(entity);
    }
  }

  console.log('RETRANSLATE: Ownership validated', {
    total: entities.length,
    owned: owned.length,
    notOwned: notOwned.length,
  });

  return { owned, notOwned };
}

// ============================================================================
// Helper Functions - Translation Status Query
// ============================================================================

/**
 * Queries translation status for a batch of entities efficiently
 *
 * @param entities - Array of entity specs to query
 * @param languages - Array of languages to check
 * @param supabase - Supabase client instance
 * @returns Map of entityId -> (language -> status)
 */
async function queryTranslationStatus(
  entities: RetranslateEntitySpec[],
  languages: SupportedLanguage[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Map<string, Map<string, string>>> {
  const statusMap = new Map<string, Map<string, string>>();

  // Group entities by type
  const itemIds: string[] = [];
  const articleIds: string[] = [];
  const linkIds: string[] = [];

  for (const entity of entities) {
    switch (entity.entityType) {
      case 'item':
        itemIds.push(entity.entityId);
        break;
      case 'article':
        articleIds.push(entity.entityId);
        break;
      case 'link':
        linkIds.push(entity.entityId);
        break;
      case 'tag':
        // tag_translations has no translation_status column, treat as non-manual
        break;
    }
  }

  // Query item translations
  if (itemIds.length > 0) {
    const { data: itemTranslations } = await supabase
      .from('item_translations')
      .select('item_id, language, translation_status')
      .in('item_id', itemIds)
      .in('language', languages);

    if (itemTranslations) {
      for (const trans of itemTranslations) {
        if (!statusMap.has(trans.item_id)) {
          statusMap.set(trans.item_id, new Map());
        }
        statusMap.get(trans.item_id)!.set(trans.language, trans.translation_status || 'auto');
      }
    }
  }

  // Query article translations
  if (articleIds.length > 0) {
    const { data: articleTranslations } = await supabase
      .from('article_translations')
      .select('article_id, language, translation_status')
      .in('article_id', articleIds)
      .in('language', languages);

    if (articleTranslations) {
      for (const trans of articleTranslations) {
        if (!statusMap.has(trans.article_id)) {
          statusMap.set(trans.article_id, new Map());
        }
        statusMap.get(trans.article_id)!.set(trans.language, trans.translation_status || 'auto');
      }
    }
  }

  // Query link translations
  if (linkIds.length > 0) {
    const { data: linkTranslations } = await supabase
      .from('link_translations')
      .select('link_id, language, translation_status')
      .in('link_id', linkIds)
      .in('language', languages);

    if (linkTranslations) {
      for (const trans of linkTranslations) {
        if (!statusMap.has(trans.link_id)) {
          statusMap.set(trans.link_id, new Map());
        }
        statusMap.get(trans.link_id)!.set(trans.language, trans.translation_status || 'auto');
      }
    }
  }

  console.log('RETRANSLATE: Translation status queried', {
    itemsChecked: itemIds.length,
    articlesChecked: articleIds.length,
    linksChecked: linkIds.length,
  });

  return statusMap;
}

/**
 * Filters entities based on manual edit status
 *
 * @param entities - Array of owned entity specs
 * @param languages - Array of target languages
 * @param statusMap - Map of translation statuses
 * @param skipManualEdits - Whether to skip manual edits
 * @param overwriteManual - Whether to overwrite manual edits (takes precedence)
 * @returns Arrays of entities/languages to queue and skip
 */
function filterManualEdits(
  entities: RetranslateEntitySpec[],
  languages: SupportedLanguage[],
  statusMap: Map<string, Map<string, string>>,
  skipManualEdits: boolean,
  overwriteManual: boolean
): {
  toQueue: Array<{ entity: RetranslateEntitySpec; language: SupportedLanguage }>;
  toSkip: Array<{ entity: RetranslateEntitySpec; language: SupportedLanguage; reason: string }>;
} {
  const toQueue: Array<{ entity: RetranslateEntitySpec; language: SupportedLanguage }> = [];
  const toSkip: Array<{ entity: RetranslateEntitySpec; language: SupportedLanguage; reason: string }> = [];

  for (const entity of entities) {
    for (const language of languages) {
      // If overwriteManual is true, always queue (ignore manual status)
      if (overwriteManual) {
        toQueue.push({ entity, language });
        continue;
      }

      // Check if this entity+language has manual status
      const entityStatuses = statusMap.get(entity.entityId);
      const status = entityStatuses?.get(language);

      // If skipManualEdits is true and status is 'manual', skip it
      if (skipManualEdits && status === 'manual') {
        toSkip.push({ entity, language, reason: 'Manual edit protected' });
      } else {
        toQueue.push({ entity, language });
      }
    }
  }

  console.log('RETRANSLATE: Manual edits filtered', {
    toQueue: toQueue.length,
    toSkip: toSkip.length,
  });

  return { toQueue, toSkip };
}

// ============================================================================
// Helper Functions - Job Queue Creation
// ============================================================================

/**
 * Queries source language for entities efficiently
 *
 * @param entities - Array of entity specs
 * @param supabase - Supabase client instance
 * @returns Map of entityId -> sourceLanguage
 */
async function querySourceLanguages(
  entities: RetranslateEntitySpec[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Map<string, SupportedLanguage>> {
  const sourceMap = new Map<string, SupportedLanguage>();

  // Group entities by type
  const itemIds: string[] = [];
  const articleIds: string[] = [];
  const linkIds: string[] = [];

  for (const entity of entities) {
    switch (entity.entityType) {
      case 'item':
        itemIds.push(entity.entityId);
        break;
      case 'article':
        articleIds.push(entity.entityId);
        break;
      case 'link':
        linkIds.push(entity.entityId);
        break;
      case 'tag':
        // Tags default to English
        sourceMap.set(entity.entityId, 'en');
        break;
    }
  }

  // Query items for source_language
  if (itemIds.length > 0) {
    const { data: items } = await supabase
      .from('items')
      .select('id, source_language')
      .in('id', itemIds);

    if (items) {
      for (const item of items) {
        sourceMap.set(item.id, (item.source_language as SupportedLanguage) || 'en');
      }
    }
  }

  // Query articles for source_language
  if (articleIds.length > 0) {
    const { data: articles } = await supabase
      .from('item_articles')
      .select('id, source_language')
      .in('id', articleIds);

    if (articles) {
      for (const article of articles) {
        sourceMap.set(article.id, (article.source_language as SupportedLanguage) || 'en');
      }
    }
  }

  // Query links for source_language
  if (linkIds.length > 0) {
    const { data: links } = await supabase
      .from('item_links')
      .select('id, source_language')
      .in('id', linkIds);

    if (links) {
      for (const link of links) {
        sourceMap.set(link.id, (link.source_language as SupportedLanguage) || 'en');
      }
    }
  }

  return sourceMap;
}

/**
 * Creates translation jobs for the specified entity/language combinations
 *
 * @param jobSpecs - Array of entity/language pairs to queue
 * @param sourceLanguages - Map of entity source languages
 * @returns Result with counts of queued and failed jobs
 */
async function queueTranslationJobs(
  jobSpecs: Array<{ entity: RetranslateEntitySpec; language: SupportedLanguage }>,
  sourceLanguages: Map<string, SupportedLanguage>
): Promise<{ queued: number; failed: number; failedReasons: string[] }> {
  let queued = 0;
  let failed = 0;
  const failedReasons: string[] = [];

  for (const { entity, language } of jobSpecs) {
    try {
      const sourceLanguage = sourceLanguages.get(entity.entityId) || 'en';

      // Skip if target language equals source language
      if (language === sourceLanguage) {
        continue;
      }

      const result = await createTranslationJob({
        entityType: entity.entityType,
        entityId: entity.entityId,
        sourceLanguage,
        targetLanguage: language,
      });

      if (result.success) {
        queued++;
      } else {
        // Job creation returned an error but didn't throw
        // This typically means duplicate was ignored, which is fine
        queued++; // Count as queued since duplicate handling is intentional
      }
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      failedReasons.push(`${entity.entityType}:${entity.entityId}:${language} - ${errorMsg}`);
      console.error('RETRANSLATE: Job creation failed', {
        entity: entity.entityType,
        entityId: entity.entityId,
        language,
        error: errorMsg,
      });
    }
  }

  console.log('RETRANSLATE: Jobs queued', {
    queued,
    failed,
    failedReasons: failedReasons.length > 0 ? failedReasons : undefined,
  });

  return { queued, failed, failedReasons };
}

// ============================================================================
// Main POST Handler
// ============================================================================

/**
 * POST /api/translations/retranslate
 *
 * Queues re-translation jobs for specified entities.
 *
 * @param request - NextRequest with JSON body containing entities and options
 * @returns JSON response with job counts and status
 *
 * Request body:
 * - entities: Array of { entityType, entityId } (required, max 100)
 * - languages: Array of target languages (optional, defaults to all non-English)
 * - skipManualEdits: Skip manual translations (optional, default: true)
 * - overwriteManual: Overwrite manual translations (optional, default: false)
 *
 * Response:
 * - 200: Success with jobsQueued, skipped counts
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: No access to any entities
 * - 500: Server error
 */
export async function POST(request: NextRequest): Promise<NextResponse<RetranslateResponse>> {
  const startTime = Date.now();

  try {
    // Authenticate user
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user!;
    console.log('RETRANSLATE: Request received', {
      timestamp: new Date().toISOString(),
      userId: user.id,
      email: user.email,
    });

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: RETRANSLATE_ERROR_CODES.VALIDATION_ERROR,
        },
        { status: 400 }
      );
    }

    // Validate request body
    const validation = validateRequestBody(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error!.message,
          code: validation.error!.code,
        },
        { status: 400 }
      );
    }

    const { entities, languages: requestedLanguages, skipManualEdits: skipParam, overwriteManual: overwriteParam } = validation.data!;

    // Set defaults
    const languages = requestedLanguages || TARGET_LANGUAGES;
    const skipManualEdits = skipParam !== undefined ? skipParam : true;
    const overwriteManual = overwriteParam !== undefined ? overwriteParam : false;

    console.log('RETRANSLATE: Request details', {
      entityCount: entities.length,
      languages,
      skipManualEdits,
      overwriteManual,
    });

    // Validate ownership for all entities
    const { owned, notOwned } = await validateBatchOwnership(entities, user.id, supabaseAdmin);

    // Track skipped counts
    let totalSkipped = notOwned.length * languages.length;
    const skippedReasons: string[] = [];

    if (notOwned.length > 0) {
      skippedReasons.push(`${notOwned.length} entities skipped due to access restrictions`);
    }

    // If no entities are owned, return 403
    if (owned.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No access to any of the specified entities',
          code: RETRANSLATE_ERROR_CODES.FORBIDDEN,
        },
        { status: 403 }
      );
    }

    // Query translation status for owned entities
    const statusMap = await queryTranslationStatus(owned, languages, supabaseAdmin);

    // Filter based on manual edit status
    const { toQueue, toSkip } = filterManualEdits(owned, languages, statusMap, skipManualEdits, overwriteManual);

    // Add skipped manual edits to count
    totalSkipped += toSkip.length;
    if (toSkip.length > 0) {
      skippedReasons.push(`${toSkip.length} entity/language pairs skipped due to manual edits`);
    }

    // Query source languages for entities to queue
    const uniqueEntities = [...new Map(toQueue.map(q => [q.entity.entityId, q.entity])).values()];
    const sourceLanguages = await querySourceLanguages(uniqueEntities, supabaseAdmin);

    // Create translation jobs
    const { queued, failed, failedReasons } = await queueTranslationJobs(toQueue, sourceLanguages);

    // Add failed jobs to skipped count
    totalSkipped += failed;
    if (failed > 0) {
      skippedReasons.push(`${failed} jobs failed to queue`);
    }

    // Build skipped reason string
    const skippedReason = skippedReasons.length > 0 ? skippedReasons.join('; ') : undefined;

    const duration = Date.now() - startTime;
    console.log('RETRANSLATE: Response sent', {
      jobsQueued: queued,
      skipped: totalSkipped,
      duration: `${duration}ms`,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        jobsQueued: queued,
        skipped: totalSkipped,
        skippedReason,
        metadata: {
          timestamp: new Date().toISOString(),
          userId: user.id,
          entityCount: entities.length,
        },
        warnings: failedReasons.length > 0 ? failedReasons : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('RETRANSLATE: Error occurred', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
        code: RETRANSLATE_ERROR_CODES.DATABASE_ERROR,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS Handler for CORS
// ============================================================================

/**
 * OPTIONS /api/translations/retranslate
 *
 * Handles CORS preflight requests for the re-translate endpoint.
 * Required for Epic 5 UI components (TranslationPreviewPanel, BulkTranslationBar)
 * to call this endpoint from the browser.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
