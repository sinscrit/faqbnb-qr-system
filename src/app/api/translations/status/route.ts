/**
 * Translation Status API Endpoint
 * Part of REQ-E05-001: Create Translation Status API Endpoint
 *
 * GET /api/translations/status
 *
 * Provides aggregated translation status data for owner management dashboards.
 * Returns summary counts and item-level translation status for all entities
 * accessible to the authenticated user.
 *
 * Query Parameters:
 * - entityType: Filter by entity type ('item', 'article', 'link', 'tag')
 * - entityId: Filter by specific entity ID
 * - status: Filter by translation status ('pending', 'processing', 'completed', 'failed', 'manual')
 * - propertyId: Filter by property ID
 *
 * Response:
 * {
 *   success: boolean,
 *   summary: { total, complete, pending, failed, manual },
 *   items: [{ entityType, entityId, name, sourceLanguage, translations: {...} }],
 *   error?: string
 * }
 *
 * @created 2026-01-23
 * @lastModified 2026-01-23 16:50
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type {
  TranslationStatusResponse,
  TranslationStatusSummary,
  ItemTranslationStatus,
  EntityRecord,
  TranslationRecord,
  JobRecord,
  LanguageStatusDetail,
  EntityType,
  TranslationStatus,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Target languages for translation (excludes source language 'en') */
const TARGET_LANGUAGES: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];

/** Valid entity types for filtering */
const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;

/** Valid translation status values for filtering */
const VALID_STATUS_VALUES = ['pending', 'processing', 'completed', 'failed', 'manual'] as const;

// ============================================================================
// Helper Functions: Property Access
// ============================================================================

/**
 * Gets accessible property IDs for a user.
 * Validates property access through account_users → accounts → properties chain.
 *
 * @param userId - Authenticated user ID
 * @param propertyId - Optional specific property ID to validate
 * @param supabase - Authenticated Supabase client
 * @returns Property IDs or error response
 */
async function getAccessiblePropertyIds(
  userId: string,
  propertyId: string | null,
  supabase: typeof supabaseAdmin
): Promise<{ propertyIds: string[] | null; error?: NextResponse }> {
  try {
    if (propertyId) {
      // Validate access to specific property via account_users → accounts → properties
      const { data: accessCheck, error: accessError } = await supabase
        .from('account_users')
        .select(`
          account_id,
          accounts!inner(
            id,
            properties!inner(id)
          )
        `)
        .eq('user_id', userId)
        .eq('accounts.properties.id', propertyId)
        .limit(1);

      if (accessError) {
        console.error('TRANSLATION_STATUS: Property access check error:', accessError);
        return {
          propertyIds: null,
          error: NextResponse.json(
            { success: false, error: 'Failed to validate property access' },
            { status: 500 }
          ),
        };
      }

      if (!accessCheck || accessCheck.length === 0) {
        console.log('TRANSLATION_STATUS: Access denied to property:', propertyId);
        return {
          propertyIds: null,
          error: NextResponse.json(
            { success: false, error: 'Access denied to requested property' },
            { status: 403 }
          ),
        };
      }

      return { propertyIds: [propertyId] };
    }

    // Get all properties user has access to
    const { data: userAccounts, error: accountsError } = await supabase
      .from('account_users')
      .select(`
        account_id,
        accounts!inner(
          id,
          properties(id)
        )
      `)
      .eq('user_id', userId);

    if (accountsError) {
      console.error('TRANSLATION_STATUS: Account query error:', accountsError);
      return {
        propertyIds: null,
        error: NextResponse.json(
          { success: false, error: 'Failed to fetch user accounts' },
          { status: 500 }
        ),
      };
    }

    if (!userAccounts || userAccounts.length === 0) {
      console.log('TRANSLATION_STATUS: No property access for user:', userId);
      return {
        propertyIds: null,
        error: NextResponse.json(
          { success: false, error: 'No property access found for user' },
          { status: 403 }
        ),
      };
    }

    // Extract all property IDs from nested structure
    const propertyIds: string[] = [];
    for (const accountUser of userAccounts) {
      const accounts = accountUser.accounts as unknown as { properties: { id: string }[] };
      if (accounts?.properties) {
        for (const property of accounts.properties) {
          if (property.id && !propertyIds.includes(property.id)) {
            propertyIds.push(property.id);
          }
        }
      }
    }

    if (propertyIds.length === 0) {
      return {
        propertyIds: null,
        error: NextResponse.json(
          { success: false, error: 'No property access found for user' },
          { status: 403 }
        ),
      };
    }

    return { propertyIds };
  } catch (error) {
    console.error('TRANSLATION_STATUS: Property access error:', error);
    return {
      propertyIds: null,
      error: NextResponse.json(
        { success: false, error: 'Failed to validate property access' },
        { status: 500 }
      ),
    };
  }
}

// ============================================================================
// Helper Functions: Database Queries
// ============================================================================

/**
 * Fetches entities by type filtered by property IDs.
 *
 * @param entityType - Type of entity to fetch
 * @param entityId - Optional specific entity ID
 * @param propertyIds - Array of accessible property IDs
 * @returns Array of entity records
 */
async function fetchEntitiesByType(
  entityType: string,
  entityId: string | null,
  propertyIds: string[]
): Promise<EntityRecord[]> {
  try {
    let query;
    const selectFields = 'id, source_language, property_id, updated_at';

    switch (entityType) {
      case 'item': {
        let itemQuery = supabaseAdmin
          .from('items')
          .select('id, source_language, property_id, updated_at, name')
          .in('property_id', propertyIds);
        if (entityId) itemQuery = itemQuery.eq('id', entityId);

        const { data: itemData, error: itemError } = await itemQuery;
        if (itemError) {
          console.error('TRANSLATION_STATUS: Error fetching items:', itemError);
          return [];
        }

        return (itemData || []).map((row) => ({
          id: row.id,
          name: row.name,
          sourceLanguage: (row.source_language || 'en') as SupportedLanguage,
          propertyId: row.property_id,
          updatedAt: row.updated_at || new Date().toISOString(),
        }));
      }
      case 'article': {
        // Articles link to items, which have property_id
        let articleQuery = supabaseAdmin
          .from('item_articles')
          .select('id, title, source_language, updated_at, item_id')
          .not('item_id', 'is', null);
        if (entityId) articleQuery = articleQuery.eq('id', entityId);

        const { data: articleData, error: articleError } = await articleQuery;
        if (articleError) {
          console.error('TRANSLATION_STATUS: Error fetching articles:', articleError);
          return [];
        }

        // Filter by property via items
        const itemIds = (articleData || []).map((a) => a.item_id).filter((id): id is string => id !== null);
        if (itemIds.length === 0) return [];

        const { data: itemsForArticles } = await supabaseAdmin
          .from('items')
          .select('id, property_id')
          .in('id', itemIds)
          .in('property_id', propertyIds);

        const validItemIds = new Set((itemsForArticles || []).map((i) => i.id));

        return (articleData || [])
          .filter((row) => row.item_id && validItemIds.has(row.item_id))
          .map((row) => ({
            id: row.id,
            name: row.title || row.id,
            sourceLanguage: (row.source_language || 'en') as SupportedLanguage,
            propertyId: '', // Property is via item
            updatedAt: row.updated_at || new Date().toISOString(),
          }));
      }
      case 'link': {
        // Links link to items, which have property_id
        let linkQuery = supabaseAdmin
          .from('item_links')
          .select('id, title, source_language, item_id')
          .not('item_id', 'is', null);
        if (entityId) linkQuery = linkQuery.eq('id', entityId);

        const { data: linkData, error: linkError } = await linkQuery;
        if (linkError) {
          console.error('TRANSLATION_STATUS: Error fetching links:', linkError);
          return [];
        }

        // Filter by property via items
        const linkItemIds = (linkData || []).map((l) => l.item_id).filter((id): id is string => id !== null);
        if (linkItemIds.length === 0) return [];

        const { data: itemsForLinks } = await supabaseAdmin
          .from('items')
          .select('id, property_id')
          .in('id', linkItemIds)
          .in('property_id', propertyIds);

        const validLinkItemIds = new Set((itemsForLinks || []).map((i) => i.id));

        return (linkData || [])
          .filter((row) => row.item_id && validLinkItemIds.has(row.item_id))
          .map((row) => ({
            id: row.id,
            name: row.title || row.id,
            sourceLanguage: (row.source_language || 'en') as SupportedLanguage,
            propertyId: '', // Property is via item
            updatedAt: new Date().toISOString(), // item_links doesn't have updated_at
          }));
      }
      case 'tag': {
        // Tags are global, but we filter by items in accessible properties
        // For now, return all tags associated with items in accessible properties
        const { data: itemTags } = await supabaseAdmin
          .from('items')
          .select('tags')
          .in('property_id', propertyIds);

        // Extract unique tags from items
        const uniqueTags = new Set<string>();
        for (const item of itemTags || []) {
          if (Array.isArray(item.tags)) {
            for (const tag of item.tags) {
              if (typeof tag === 'string') {
                uniqueTags.add(tag);
              }
            }
          }
        }

        // Return tags as entity records
        return Array.from(uniqueTags).map((tag) => ({
          id: tag,
          name: tag,
          sourceLanguage: 'en' as SupportedLanguage,
          propertyId: propertyIds[0], // Tags are global
          updatedAt: new Date().toISOString(),
        }));
      }
      default:
        return [];
    }
  } catch (error) {
    console.error(`TRANSLATION_STATUS: fetchEntitiesByType error:`, error);
    return [];
  }
}

/**
 * Fetches translations for a list of entity IDs.
 *
 * @param entityType - Type of entity
 * @param entityIds - Array of entity IDs
 * @returns Array of translation records
 */
async function fetchTranslationsForEntities(
  entityType: string,
  entityIds: string[]
): Promise<TranslationRecord[]> {
  if (entityIds.length === 0) return [];

  try {
    switch (entityType) {
      case 'item': {
        const { data, error } = await supabaseAdmin
          .from('item_translations')
          .select('item_id, language, translation_status, translated_at')
          .in('item_id', entityIds);

        if (error) {
          console.error('TRANSLATION_STATUS: Error fetching item translations:', error);
          return [];
        }

        return (data || []).map((row) => ({
          entityId: row.item_id,
          language: row.language as SupportedLanguage,
          translationStatus: (row.translation_status || 'completed') as TranslationStatus,
          translatedAt: row.translated_at || undefined,
          reviewedBy: undefined, // item_translations doesn't have reviewed_by
        }));
      }
      case 'article': {
        const { data, error } = await supabaseAdmin
          .from('article_translations')
          .select('article_id, language, translation_status, translated_at, reviewed_by')
          .in('article_id', entityIds);

        if (error) {
          console.error('TRANSLATION_STATUS: Error fetching article translations:', error);
          return [];
        }

        return (data || []).map((row) => ({
          entityId: row.article_id,
          language: row.language as SupportedLanguage,
          translationStatus: (row.translation_status || 'completed') as TranslationStatus,
          translatedAt: row.translated_at || undefined,
          reviewedBy: row.reviewed_by || undefined,
        }));
      }
      case 'link': {
        const { data, error } = await supabaseAdmin
          .from('link_translations')
          .select('link_id, language, translation_status, translated_at')
          .in('link_id', entityIds);

        if (error) {
          console.error('TRANSLATION_STATUS: Error fetching link translations:', error);
          return [];
        }

        return (data || []).map((row) => ({
          entityId: row.link_id,
          language: row.language as SupportedLanguage,
          translationStatus: (row.translation_status || 'completed') as TranslationStatus,
          translatedAt: row.translated_at || undefined,
          reviewedBy: undefined,
        }));
      }
      case 'tag': {
        const { data, error } = await supabaseAdmin
          .from('tag_translations')
          .select('tag_key, language')
          .in('tag_key', entityIds);

        if (error) {
          console.error('TRANSLATION_STATUS: Error fetching tag translations:', error);
          return [];
        }

        return (data || []).map((row) => ({
          entityId: row.tag_key,
          language: row.language as SupportedLanguage,
          translationStatus: 'completed' as TranslationStatus, // Tags don't have status
          translatedAt: undefined,
          reviewedBy: undefined,
        }));
      }
      default:
        return [];
    }
  } catch (error) {
    console.error(`TRANSLATION_STATUS: fetchTranslationsForEntities error:`, error);
    return [];
  }
}

/**
 * Fetches pending translation jobs for a list of entity IDs.
 *
 * @param entityType - Type of entity
 * @param entityIds - Array of entity IDs
 * @returns Array of job records
 */
async function fetchPendingJobsForEntities(
  entityType: string,
  entityIds: string[]
): Promise<JobRecord[]> {
  if (entityIds.length === 0) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .select('entity_id, target_language, status, created_at')
      .eq('entity_type', entityType)
      .in('entity_id', entityIds)
      .in('status', ['queued', 'processing']);

    if (error) {
      console.error(`TRANSLATION_STATUS: Error fetching jobs for ${entityType}:`, error);
      return [];
    }

    return (data || []).map((row) => ({
      entityId: row.entity_id,
      targetLanguage: row.target_language as SupportedLanguage,
      status: row.status as 'queued' | 'processing',
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error(`TRANSLATION_STATUS: fetchPendingJobsForEntities error:`, error);
    return [];
  }
}

// ============================================================================
// Helper Functions: Aggregation
// ============================================================================

/**
 * Calculates summary counts from item statuses.
 * Counts all expected translations (items × target languages).
 *
 * @param items - Array of item translation statuses
 * @returns Summary counts object
 */
function calculateSummary(
  items: ItemTranslationStatus[]
): TranslationStatusSummary {
  let complete = 0;
  let partial = 0;
  let pending = 0;
  let failed = 0;
  let manual = 0;
  let stale = 0;

  for (const item of items) {
    let itemComplete = 0;
    let itemTotal = 0;

    for (const lang of TARGET_LANGUAGES) {
      const status = item.translations[lang];
      if (!status) continue;

      itemTotal++;

      switch (status.status) {
        case 'completed':
          itemComplete++;
          complete++;
          if (status.isStale) {
            stale++;
          }
          break;
        case 'manual':
          itemComplete++;
          manual++;
          if (status.isStale) {
            stale++;
          }
          break;
        case 'failed':
          failed++;
          break;
        case 'pending':
        case 'processing':
          pending++;
          break;
      }
    }

    // Determine if item is partial (some but not all languages complete)
    if (itemComplete > 0 && itemComplete < itemTotal) {
      partial++;
    }
  }

  // Calculate total translations (all items × all target languages)
  const total = items.length * TARGET_LANGUAGES.length;

  return {
    total,
    complete,
    partial,
    pending,
    failed,
    manual,
    stale,
  };
}

/**
 * Builds item-level status from entity, translations, and jobs.
 *
 * @param entity - Entity record
 * @param entityType - Type of entity
 * @param translations - Translations for this entity
 * @param jobs - Jobs for this entity
 * @returns Item translation status object
 */
function buildItemStatus(
  entity: EntityRecord,
  entityType: EntityType,
  translations: TranslationRecord[],
  jobs: JobRecord[]
): ItemTranslationStatus {
  const translationMap: Partial<Record<SupportedLanguage, LanguageStatusDetail>> = {};

  for (const lang of TARGET_LANGUAGES) {
    // Find translation for this language
    const translation = translations.find((t) => t.language === lang);
    // Find job for this language
    const job = jobs.find((j) => j.targetLanguage === lang);

    if (translation) {
      const detail: LanguageStatusDetail = {
        status: translation.translationStatus,
      };

      if (translation.translatedAt) {
        detail.translatedAt = translation.translatedAt;
        // Check if translation is stale
        if (entity.updatedAt && new Date(entity.updatedAt) > new Date(translation.translatedAt)) {
          detail.isStale = true;
        }
      }

      if (translation.reviewedBy) {
        detail.reviewedBy = translation.reviewedBy;
      }

      translationMap[lang] = detail;
    } else if (job) {
      // Has pending job
      translationMap[lang] = { status: 'pending' };
    } else {
      // No translation or job - needs translation
      translationMap[lang] = { status: 'pending' };
    }
  }

  return {
    entityType,
    entityId: entity.id,
    name: entity.name,
    sourceLanguage: entity.sourceLanguage,
    translations: translationMap,
  };
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * GET /api/translations/status
 *
 * Returns aggregated translation status for all entities accessible to the user.
 *
 * @param request - Next.js request object with query parameters
 * @returns JSON response with summary and item-level status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('TRANSLATION_STATUS: Request received', {
      timestamp: new Date().toISOString(),
    });

    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('TRANSLATION_STATUS: Authentication failed');
      return authResult.error;
    }

    console.log('TRANSLATION_STATUS: User authenticated', {
      userId: authResult.user.id,
      email: authResult.user.email,
    });

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');

    // Validate entityType if provided
    if (entityType && !VALID_ENTITY_TYPES.includes(entityType as (typeof VALID_ENTITY_TYPES)[number])) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
          summary: { total: 0, complete: 0, pending: 0, failed: 0, manual: 0 },
          items: [],
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUS_VALUES.includes(status as (typeof VALID_STATUS_VALUES)[number])) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUS_VALUES.join(', ')}`,
          summary: { total: 0, complete: 0, pending: 0, failed: 0, manual: 0 },
          items: [],
        },
        { status: 400 }
      );
    }

    console.log('TRANSLATION_STATUS: Query params validated', {
      entityType,
      entityId,
      status,
      propertyId,
    });

    // 3. Get accessible property IDs
    const propertyResult = await getAccessiblePropertyIds(
      authResult.user.id,
      propertyId,
      authResult.supabase as unknown as typeof supabaseAdmin
    );

    if (propertyResult.error) {
      return propertyResult.error;
    }

    const accessiblePropertyIds = propertyResult.propertyIds!;
    console.log('TRANSLATION_STATUS: Property access validated', {
      propertyCount: accessiblePropertyIds.length,
    });

    // 4. Determine which entity types to query
    const typesToQuery = entityType
      ? [entityType as EntityType]
      : (['item', 'article', 'link'] as EntityType[]); // Exclude 'tag' by default for performance

    // 5. Fetch entities, translations, and jobs for each type
    const allItems: ItemTranslationStatus[] = [];
    const allTranslations: TranslationRecord[] = [];
    const allJobs: JobRecord[] = [];

    for (const type of typesToQuery) {
      // Fetch entities
      const entities = await fetchEntitiesByType(type, entityId, accessiblePropertyIds);

      if (entities.length === 0) continue;

      const entityIds = entities.map((e) => e.id);

      // Fetch translations and jobs in parallel
      const [translations, jobs] = await Promise.all([
        fetchTranslationsForEntities(type, entityIds),
        fetchPendingJobsForEntities(type, entityIds),
      ]);

      allTranslations.push(...translations);
      allJobs.push(...jobs);

      // Build item status for each entity
      for (const entity of entities) {
        const entityTranslations = translations.filter((t) => t.entityId === entity.id);
        const entityJobs = jobs.filter((j) => j.entityId === entity.id);
        allItems.push(buildItemStatus(entity, type, entityTranslations, entityJobs));
      }
    }

    console.log('TRANSLATION_STATUS: Data fetched', {
      itemCount: allItems.length,
      translationCount: allTranslations.length,
      jobCount: allJobs.length,
    });

    // 6. Apply status filter if provided
    let filteredItems = allItems;
    if (status) {
      filteredItems = allItems.filter((item) => {
        return Object.values(item.translations).some(
          (detail) => detail && detail.status === status
        );
      });
    }

    // 7. Calculate summary from filtered items
    const summary = calculateSummary(filteredItems);

    console.log('TRANSLATION_STATUS: Response constructed', {
      summary,
      itemCount: filteredItems.length,
    });

    // 8. Return response
    return NextResponse.json(
      {
        success: true,
        summary,
        items: filteredItems,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('TRANSLATION_STATUS: Unexpected error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        summary: { total: 0, complete: 0, pending: 0, failed: 0, manual: 0 },
        items: [],
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
