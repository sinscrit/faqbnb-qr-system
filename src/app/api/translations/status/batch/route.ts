/**
 * Batch Translation Status API Endpoint
 * Part of REQ-E03-024: Create Batch Status Endpoint for List Views
 *
 * POST /api/translations/status/batch
 *
 * Accepts an array of entity specifications and returns translation status
 * for all entities in a single optimized response, enabling efficient
 * dashboard and list view scenarios without the N+1 query problem.
 *
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type {
  BatchStatusRequest,
  BatchStatusResponse,
  EntitySpecification,
  EntityStatusSummary,
  EntityStatus,
  EntityType,
} from './types';

// ============================================================================
// Constants
// ============================================================================

const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;
const MAX_ENTITIES = 100;
const TARGET_LANGUAGES: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];

/**
 * Mapping of entity types to their translation table configurations
 */
const TRANSLATION_TABLE_CONFIG: Record<EntityType, { table: string; idColumn: string }> = {
  item: { table: 'item_translations', idColumn: 'item_id' },
  article: { table: 'article_translations', idColumn: 'article_id' },
  link: { table: 'link_translations', idColumn: 'link_id' },
  tag: { table: 'tag_translations', idColumn: 'tag_key' },
};

// ============================================================================
// Internal Types
// ============================================================================

/**
 * Job record from translation_jobs table
 */
interface JobRecord {
  entity_id: string;
  target_language: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
}

/**
 * Translation record from translation tables
 */
interface TranslationRecord {
  entity_id: string;
  language: string;
  translation_status: 'pending' | 'completed' | 'failed' | 'manual';
}

/**
 * Result type for batch fetch operations with error tracking
 */
interface BatchFetchResult<T> {
  data: Map<string, T[]>;
  error: boolean;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates the batch request body structure and contents
 * Returns typed entities array or validation error
 */
function validateBatchRequest(
  body: unknown
): { valid: true; entities: EntitySpecification[] } | { valid: false; error: string } {
  // Validate body is an object
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  // Validate entities array exists
  const { entities } = body as { entities?: unknown };
  if (!entities || !Array.isArray(entities)) {
    return { valid: false, error: 'Request body must contain entities array' };
  }

  // Validate entities array is non-empty
  if (entities.length === 0) {
    return { valid: false, error: 'Entities array cannot be empty' };
  }

  // Validate entities array does not exceed limit
  if (entities.length > MAX_ENTITIES) {
    return {
      valid: false,
      error: `Entities array cannot exceed ${MAX_ENTITIES} elements (received ${entities.length})`,
    };
  }

  // Validate each entity in the array
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];

    if (!entity || typeof entity !== 'object') {
      return { valid: false, error: `Invalid entity at index ${i}: must be an object` };
    }

    const { entityType, entityId } = entity as { entityType?: unknown; entityId?: unknown };

    if (!entityType || typeof entityType !== 'string') {
      return { valid: false, error: `Invalid entity at index ${i}: missing or invalid entityType` };
    }

    if (!VALID_ENTITY_TYPES.includes(entityType as (typeof VALID_ENTITY_TYPES)[number])) {
      return {
        valid: false,
        error: `Invalid entity at index ${i}: entityType '${entityType}' is not supported. Valid types: ${VALID_ENTITY_TYPES.join(', ')}`,
      };
    }

    if (!entityId || typeof entityId !== 'string' || entityId.trim() === '') {
      return { valid: false, error: `Invalid entity at index ${i}: missing or invalid entityId` };
    }
  }

  return { valid: true, entities: entities as EntitySpecification[] };
}

// ============================================================================
// Grouping Functions
// ============================================================================

/**
 * Groups entity IDs by their type for efficient batch querying
 */
function groupEntitiesByType(entities: EntitySpecification[]): Map<EntityType, string[]> {
  const grouped = new Map<EntityType, string[]>();

  for (const entity of entities) {
    const existingIds = grouped.get(entity.entityType) || [];
    existingIds.push(entity.entityId);
    grouped.set(entity.entityType, existingIds);
  }

  return grouped;
}

// ============================================================================
// Batch Fetch Functions
// ============================================================================

/**
 * Batch fetches translation jobs for a given entity type
 * Returns map of entityId -> JobRecord[] with error tracking
 */
async function fetchBatchJobStatus(
  entityType: EntityType,
  entityIds: string[]
): Promise<BatchFetchResult<JobRecord>> {
  const result = new Map<string, JobRecord[]>();

  if (entityIds.length === 0) {
    return { data: result, error: false };
  }

  const { data, error } = await supabaseAdmin
    .from('translation_jobs')
    .select('entity_id, target_language, status, error_message, created_at')
    .eq('entity_type', entityType)
    .in('entity_id', entityIds);

  if (error) {
    console.error(`BATCH_STATUS: Error fetching job status for ${entityType}:`, error);
    return { data: result, error: true };
  }

  // Group jobs by entity_id
  for (const job of data || []) {
    const existing = result.get(job.entity_id) || [];
    existing.push(job as JobRecord);
    result.set(job.entity_id, existing);
  }

  return { data: result, error: false };
}

/**
 * Batch fetches stored translations for a given entity type
 * Returns map of entityId -> TranslationRecord[] with error tracking
 */
async function fetchBatchTranslationStatus(
  entityType: EntityType,
  entityIds: string[]
): Promise<BatchFetchResult<TranslationRecord>> {
  const result = new Map<string, TranslationRecord[]>();

  if (entityIds.length === 0) {
    return { data: result, error: false };
  }

  // Query each translation table based on entity type
  // Need to use separate queries due to different column names
  switch (entityType) {
    case 'item': {
      const { data, error } = await supabaseAdmin
        .from('item_translations')
        .select('item_id, language, translation_status')
        .in('item_id', entityIds);

      if (error) {
        console.error(`BATCH_STATUS: Error fetching item_translations:`, error);
        return { data: result, error: true };
      }

      for (const row of data || []) {
        const record: TranslationRecord = {
          entity_id: row.item_id,
          language: row.language,
          translation_status: row.translation_status as TranslationRecord['translation_status'],
        };
        const existing = result.get(row.item_id) || [];
        existing.push(record);
        result.set(row.item_id, existing);
      }
      break;
    }

    case 'article': {
      const { data, error } = await supabaseAdmin
        .from('article_translations')
        .select('article_id, language, translation_status')
        .in('article_id', entityIds);

      if (error) {
        console.error(`BATCH_STATUS: Error fetching article_translations:`, error);
        return { data: result, error: true };
      }

      for (const row of data || []) {
        const record: TranslationRecord = {
          entity_id: row.article_id,
          language: row.language,
          translation_status: row.translation_status as TranslationRecord['translation_status'],
        };
        const existing = result.get(row.article_id) || [];
        existing.push(record);
        result.set(row.article_id, existing);
      }
      break;
    }

    case 'link': {
      const { data, error } = await supabaseAdmin
        .from('link_translations')
        .select('link_id, language, translation_status')
        .in('link_id', entityIds);

      if (error) {
        console.error(`BATCH_STATUS: Error fetching link_translations:`, error);
        return { data: result, error: true };
      }

      for (const row of data || []) {
        const record: TranslationRecord = {
          entity_id: row.link_id,
          language: row.language,
          translation_status: row.translation_status as TranslationRecord['translation_status'],
        };
        const existing = result.get(row.link_id) || [];
        existing.push(record);
        result.set(row.link_id, existing);
      }
      break;
    }

    case 'tag': {
      // tag_translations has translated_value instead of translation_status
      // Treat existence of a record as 'completed'
      const { data, error } = await supabaseAdmin
        .from('tag_translations')
        .select('tag_key, language')
        .in('tag_key', entityIds);

      if (error) {
        console.error(`BATCH_STATUS: Error fetching tag_translations:`, error);
        return { data: result, error: true };
      }

      for (const row of data || []) {
        const record: TranslationRecord = {
          entity_id: row.tag_key,
          language: row.language,
          translation_status: 'completed', // Tags don't have status - treat as completed
        };
        const existing = result.get(row.tag_key) || [];
        existing.push(record);
        result.set(row.tag_key, existing);
      }
      break;
    }
  }

  return { data: result, error: false };
}

// ============================================================================
// Status Aggregation
// ============================================================================

/**
 * Calculates overall status for a single entity from its jobs and translations
 */
function aggregateEntityStatus(
  entityType: EntityType,
  entityId: string,
  jobs: JobRecord[],
  translations: TranslationRecord[]
): EntityStatusSummary {
  // Check for failures first
  const failedJobs = jobs.filter((j) => j.status === 'failed');
  const failedCount = failedJobs.length;

  // Count pending jobs (queued or processing)
  const pendingJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'processing');
  const pendingCount = pendingJobs.length;

  // Count completed translations (completed or manual)
  const completedTranslations = translations.filter(
    (t) => t.translation_status === 'completed' || t.translation_status === 'manual'
  );
  const completedCount = completedTranslations.length;

  // Get available languages (unique)
  const availableLanguages = [
    ...new Set(completedTranslations.map((t) => t.language)),
  ] as SupportedLanguage[];

  // Calculate completion percentage
  const totalTargetLanguages = TARGET_LANGUAGES.length;
  const completionPercentage = Math.round((completedCount / totalTargetLanguages) * 100);

  // Determine overall status based on priority rules:
  // 1. has_failures takes priority
  // 2. fully_translated if all languages complete
  // 3. pending if jobs are queued/processing
  // 4. partially_translated if some complete
  // 5. not_started if nothing exists
  let status: EntityStatus;

  if (failedCount > 0) {
    status = 'has_failures';
  } else if (completedCount >= totalTargetLanguages) {
    status = 'fully_translated';
  } else if (pendingCount > 0) {
    status = 'pending';
  } else if (completedCount > 0) {
    status = 'partially_translated';
  } else {
    status = 'not_started';
  }

  return {
    entityType,
    entityId,
    status,
    completionPercentage,
    availableLanguages,
    pendingCount,
    failedCount,
  };
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * POST /api/translations/status/batch
 *
 * Returns translation status for multiple entities in a single request.
 *
 * Request Body:
 *   - entities: Array of { entityType, entityId } objects (max 100)
 *
 * Response:
 *   - success: boolean
 *   - data: Array of EntityStatusSummary (same order as request)
 *   - meta: { requested, returned, processingTimeMs }
 *   - error: string (on failure)
 */
export async function POST(request: NextRequest): Promise<NextResponse<BatchStatusResponse>> {
  const startTime = Date.now();

  try {
    console.log('BATCH_STATUS: Request received', { timestamp: new Date().toISOString() });

    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('BATCH_STATUS: Authentication failed');
      return authResult.error;
    }

    console.log('BATCH_STATUS: User authenticated', {
      userId: authResult.user.id,
      email: authResult.user.email,
    });

    // 2. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    // 3. Validate request body
    const validationResult = validateBatchRequest(body);
    if (!validationResult.valid) {
      console.log('BATCH_STATUS: Validation failed', { error: validationResult.error });
      return NextResponse.json({ success: false, error: validationResult.error }, { status: 400 });
    }

    const { entities } = validationResult;
    console.log('BATCH_STATUS: Processing batch', { entityCount: entities.length });

    // 4. Group entities by type for batch queries
    const groupedEntities = groupEntitiesByType(entities);

    // 5. Initialize storage for jobs and translations
    const allJobs = new Map<EntityType, Map<string, JobRecord[]>>();
    const allTranslations = new Map<EntityType, Map<string, TranslationRecord[]>>();
    const errorTypes = new Set<EntityType>();

    // 6. Fetch data for each entity type (max 8 queries: 4 types × 2 tables)
    for (const [entityType, entityIds] of groupedEntities) {
      const [jobsResult, translationsResult] = await Promise.all([
        fetchBatchJobStatus(entityType, entityIds),
        fetchBatchTranslationStatus(entityType, entityIds),
      ]);

      if (jobsResult.error || translationsResult.error) {
        errorTypes.add(entityType);
      }

      allJobs.set(entityType, jobsResult.data);
      allTranslations.set(entityType, translationsResult.data);
    }

    // 7. Build response array maintaining input order
    const results: EntityStatusSummary[] = entities.map((entity) => {
      // Check if this entity type had errors
      if (errorTypes.has(entity.entityType)) {
        return {
          entityType: entity.entityType,
          entityId: entity.entityId,
          status: 'error' as EntityStatus,
          errorMessage: 'Database query failed for this entity type',
        };
      }

      const jobsMap = allJobs.get(entity.entityType);
      const translationsMap = allTranslations.get(entity.entityType);

      const jobs = jobsMap?.get(entity.entityId) || [];
      const translations = translationsMap?.get(entity.entityId) || [];

      // If no jobs and no translations exist, entity might not exist or has no translations
      if (jobs.length === 0 && translations.length === 0) {
        return {
          entityType: entity.entityType,
          entityId: entity.entityId,
          status: 'not_found' as EntityStatus,
        };
      }

      return aggregateEntityStatus(entity.entityType, entity.entityId, jobs, translations);
    });

    // 8. Calculate processing time and build response
    const processingTimeMs = Date.now() - startTime;

    console.log('BATCH_STATUS: Request completed', {
      requested: entities.length,
      returned: results.length,
      processingTimeMs,
    });

    return NextResponse.json(
      {
        success: true,
        data: results,
        meta: {
          requested: entities.length,
          returned: results.length,
          processingTimeMs,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('BATCH_STATUS: Unexpected error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
