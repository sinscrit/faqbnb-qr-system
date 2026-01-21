/**
 * Retry Failed Translations API Endpoint
 *
 * POST /api/translations/retry
 *
 * Allows property owners to manually retry failed translation jobs
 * for specific content entities and languages.
 *
 * Part of REQ-E03-022: Create Retry Failed Translations Endpoint
 * Epic: L10N Epic 3 - Dynamic Content Translation
 * Phase: 4 - Translation Status & Management APIs
 *
 * Created: 2026-01-21
 * Last Modified: 2026-01-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';
import type {
  EntityType,
  SupportedLanguage,
} from '@/lib/job-queue/translation-jobs.types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Request body for retry failed translations endpoint
 */
interface RetryTranslationRequest {
  entityType: EntityType;
  entityId: string;
  languages?: SupportedLanguage[];
}

/**
 * Per-language breakdown in response
 */
interface LanguageRetryCount {
  language: SupportedLanguage;
  count: number;
}

/**
 * Response payload for successful retry operation
 */
interface RetryTranslationResponse {
  success: boolean;
  data?: {
    jobsRequeued: number;
    affectedLanguages: SupportedLanguage[];
    perLanguageCounts: LanguageRetryCount[];
    timestamp: string;
    entityType: EntityType;
    entityId: string;
  };
  error?: string;
  code?: string;
}

/**
 * Error codes for retry endpoint
 */
const RETRY_ERROR_CODES = {
  INVALID_ENTITY_TYPE: 'INVALID_ENTITY_TYPE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// ============================================================================
// Constants
// ============================================================================

const VALID_ENTITY_TYPES: EntityType[] = ['item', 'article', 'link', 'tag'];
const VALID_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates the request body for retry endpoint
 */
function validateRequestBody(body: unknown): {
  valid: boolean;
  data?: RetryTranslationRequest;
  error?: { message: string; code: string };
} {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: { message: 'Request body is required', code: RETRY_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  const { entityType, entityId, languages } = body as Record<string, unknown>;

  // Validate entityType
  if (!entityType || typeof entityType !== 'string') {
    return {
      valid: false,
      error: { message: 'entityType is required', code: RETRY_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  if (!VALID_ENTITY_TYPES.includes(entityType as EntityType)) {
    return {
      valid: false,
      error: {
        message: `Invalid entity type: ${entityType}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
        code: RETRY_ERROR_CODES.INVALID_ENTITY_TYPE,
      },
    };
  }

  // Validate entityId
  if (!entityId || typeof entityId !== 'string') {
    return {
      valid: false,
      error: { message: 'entityId is required', code: RETRY_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  // Validate UUID format (except for tags which may use string keys)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (entityType !== 'tag' && !uuidRegex.test(entityId)) {
    return {
      valid: false,
      error: { message: 'entityId must be a valid UUID', code: RETRY_ERROR_CODES.VALIDATION_ERROR },
    };
  }

  // Validate languages array if provided
  let validatedLanguages: SupportedLanguage[] | undefined;
  if (languages !== undefined) {
    if (!Array.isArray(languages)) {
      return {
        valid: false,
        error: { message: 'languages must be an array', code: RETRY_ERROR_CODES.VALIDATION_ERROR },
      };
    }

    // Filter to only valid languages (silently ignore invalid ones per spec)
    validatedLanguages = languages.filter(
      (lang): lang is SupportedLanguage =>
        typeof lang === 'string' && VALID_LANGUAGES.includes(lang as SupportedLanguage)
    );
  }

  return {
    valid: true,
    data: {
      entityType: entityType as EntityType,
      entityId: entityId as string,
      languages: validatedLanguages,
    },
  };
}

/**
 * Validates that an entity exists in the database
 */
async function validateEntityExists(
  entityType: EntityType,
  entityId: string
): Promise<{ exists: boolean; error?: string }> {
  try {
    switch (entityType) {
      case 'item': {
        const { data, error } = await supabaseAdmin
          .from('items')
          .select('id')
          .eq('id', entityId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return { exists: false };
          return { exists: false, error: error.message };
        }
        return { exists: !!data };
      }

      case 'article': {
        const { data, error } = await supabaseAdmin
          .from('item_articles')
          .select('id')
          .eq('id', entityId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return { exists: false };
          return { exists: false, error: error.message };
        }
        return { exists: !!data };
      }

      case 'link': {
        const { data, error } = await supabaseAdmin
          .from('item_links')
          .select('id')
          .eq('id', entityId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return { exists: false };
          return { exists: false, error: error.message };
        }
        return { exists: !!data };
      }

      case 'tag': {
        // Tags: check if any jobs or translations exist for this tag key
        const { data: tagJobs, error: tagJobsError } = await supabaseAdmin
          .from('translation_jobs')
          .select('id')
          .eq('entity_type', 'tag')
          .eq('entity_id', entityId)
          .limit(1);

        if (tagJobsError) {
          return { exists: false, error: tagJobsError.message };
        }

        if (tagJobs && tagJobs.length > 0) {
          return { exists: true };
        }

        // Also check tag_translations table
        const { data: tagTranslations, error: ttError } = await supabaseAdmin
          .from('tag_translations')
          .select('id')
          .eq('tag_key', entityId)
          .limit(1);

        if (ttError) {
          return { exists: false, error: ttError.message };
        }

        return { exists: !!(tagTranslations && tagTranslations.length > 0) };
      }

      default:
        return { exists: false, error: 'Unsupported entity type' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { exists: false, error: message };
  }
}

/**
 * Queries for failed translation jobs matching the criteria
 */
/**
 * Simplified job info for internal use - only what we need for reset operations
 */
interface FailedJobInfo {
  id: string;
  targetLanguage: SupportedLanguage;
}

async function getFailedJobs(
  entityType: EntityType,
  entityId: string,
  languages?: SupportedLanguage[]
): Promise<{ jobs: FailedJobInfo[]; error?: string }> {
  try {
    let query = supabaseAdmin
      .from('translation_jobs')
      .select('id, target_language')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('status', 'failed');

    if (languages && languages.length > 0) {
      query = query.in('target_language', languages);
    }

    const { data, error } = await query;

    if (error) {
      console.error('RETRY_TRANSLATIONS: Failed to query jobs', error);
      return { jobs: [], error: error.message };
    }

    const jobs: FailedJobInfo[] = (data || []).map((row) => ({
      id: row.id,
      targetLanguage: row.target_language as SupportedLanguage,
    }));

    console.log('RETRY_TRANSLATIONS: Found failed jobs', {
      entityType,
      entityId,
      count: jobs.length,
      languages: languages ?? 'all',
    });

    return { jobs };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('RETRY_TRANSLATIONS: Exception querying jobs', error);
    return { jobs: [], error: message };
  }
}

/**
 * Resets failed jobs to queued status
 */
async function resetFailedJobs(jobs: FailedJobInfo[]): Promise<{
  success: boolean;
  jobsReset: number;
  affectedLanguages: SupportedLanguage[];
  perLanguageCounts: LanguageRetryCount[];
  error?: string;
}> {
  if (jobs.length === 0) {
    return {
      success: true,
      jobsReset: 0,
      affectedLanguages: [],
      perLanguageCounts: [],
    };
  }

  try {
    const jobIds = jobs.map((job) => job.id);

    console.log('RETRY_TRANSLATIONS: Resetting jobs', {
      count: jobIds.length,
      ids: jobIds,
    });

    const { data, error } = await supabaseAdmin
      .from('translation_jobs')
      .update({
        status: 'queued',
        attempts: 0,
        error_message: null,
        locked_by: null,
        locked_at: null,
        started_at: null,
      })
      .in('id', jobIds)
      .eq('status', 'failed') // Guard against race conditions
      .select('id, target_language');

    if (error) {
      console.error('RETRY_TRANSLATIONS: Failed to reset jobs', error);
      return {
        success: false,
        jobsReset: 0,
        affectedLanguages: [],
        perLanguageCounts: [],
        error: error.message,
      };
    }

    const resetJobs = data || [];
    const languageCounts = new Map<SupportedLanguage, number>();

    for (const job of resetJobs) {
      const lang = job.target_language as SupportedLanguage;
      languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
    }

    const affectedLanguages = Array.from(languageCounts.keys());
    const perLanguageCounts: LanguageRetryCount[] = Array.from(languageCounts.entries()).map(
      ([language, count]) => ({ language, count })
    );

    console.log('RETRY_TRANSLATIONS: Jobs reset successfully', {
      jobsReset: resetJobs.length,
      affectedLanguages,
    });

    return {
      success: true,
      jobsReset: resetJobs.length,
      affectedLanguages,
      perLanguageCounts,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('RETRY_TRANSLATIONS: Exception resetting jobs', error);
    return {
      success: false,
      jobsReset: 0,
      affectedLanguages: [],
      perLanguageCounts: [],
      error: message,
    };
  }
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * POST /api/translations/retry
 *
 * Retry failed translation jobs for a specific entity.
 *
 * Request Body:
 *   - entityType: 'item' | 'article' | 'link' | 'tag' (required)
 *   - entityId: UUID of the entity (required)
 *   - languages: Array of language codes to retry (optional)
 *
 * Response:
 *   - success: boolean
 *   - data: { jobsRequeued, affectedLanguages, perLanguageCounts, timestamp, entityType, entityId }
 *   - error: string (on failure)
 *   - code: string error code (on failure)
 */
export async function POST(request: NextRequest): Promise<NextResponse<RetryTranslationResponse>> {
  const timestamp = new Date().toISOString();

  try {
    console.log('RETRY_TRANSLATIONS: Request received', { timestamp });

    // 1. Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('RETRY_TRANSLATIONS: Authentication failed');
      return authResult.error;
    }

    const user = authResult.user;
    console.log('RETRY_TRANSLATIONS: User authenticated', { userId: user.id, email: user.email });

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: RETRY_ERROR_CODES.VALIDATION_ERROR,
        },
        { status: 400 }
      );
    }

    const validation = validateRequestBody(body);
    if (!validation.valid || !validation.data) {
      console.log('RETRY_TRANSLATIONS: Validation failed', validation.error);
      return NextResponse.json(
        {
          success: false,
          error: validation.error?.message || 'Validation failed',
          code: validation.error?.code || RETRY_ERROR_CODES.VALIDATION_ERROR,
        },
        { status: 400 }
      );
    }

    const { entityType, entityId, languages } = validation.data;
    console.log('RETRY_TRANSLATIONS: Request validated', { entityType, entityId, languages });

    // 3. Validate entity exists
    const entityCheck = await validateEntityExists(entityType, entityId);
    if (!entityCheck.exists) {
      console.log('RETRY_TRANSLATIONS: Entity not found', { entityType, entityId });
      return NextResponse.json(
        {
          success: false,
          error: `${entityType} with ID ${entityId} not found`,
          code: RETRY_ERROR_CODES.NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // 4. Query for failed jobs
    const failedJobsResult = await getFailedJobs(entityType, entityId, languages);
    if (failedJobsResult.error) {
      console.error('RETRY_TRANSLATIONS: Failed to query jobs', failedJobsResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to query translation jobs',
          code: RETRY_ERROR_CODES.DATABASE_ERROR,
        },
        { status: 500 }
      );
    }

    // 5. Reset failed jobs to queued
    const resetResult = await resetFailedJobs(failedJobsResult.jobs);
    if (!resetResult.success) {
      console.error('RETRY_TRANSLATIONS: Failed to reset jobs', resetResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to reset translation jobs',
          code: RETRY_ERROR_CODES.DATABASE_ERROR,
        },
        { status: 500 }
      );
    }

    // 6. Return success response
    const response: RetryTranslationResponse = {
      success: true,
      data: {
        jobsRequeued: resetResult.jobsReset,
        affectedLanguages: resetResult.affectedLanguages,
        perLanguageCounts: resetResult.perLanguageCounts,
        timestamp,
        entityType,
        entityId,
      },
    };

    console.log('RETRY_TRANSLATIONS: Request completed successfully', {
      jobsRequeued: resetResult.jobsReset,
      affectedLanguages: resetResult.affectedLanguages,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('RETRY_TRANSLATIONS: Unexpected error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: RETRY_ERROR_CODES.DATABASE_ERROR,
      },
      { status: 500 }
    );
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
