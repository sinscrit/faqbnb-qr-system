/**
 * Translation Status API Endpoint
 * Part of REQ-E03-021: Create Translation Status API Endpoint
 * Epic 3 - Dynamic Content Translation
 *
 * Returns comprehensive translation status for any content entity
 * (item, article, link, tag). Combines job processing status with
 * stored translation records to enable UI components to display
 * accurate translation status badges and progress indicators.
 *
 * @route GET /api/translations/status/[entityType]/[entityId]
 * @created 2026-01-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getEntityTranslationStatus,
  type StatusTranslationStatusResult,
  type LanguageStatus,
} from '@/lib/content-translation';
import type { EntityType } from '@/lib/content-translation';

// ============================================================================
// Constants
// ============================================================================

const VALID_ENTITY_TYPES = ['item', 'article', 'link', 'tag'] as const;

const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify that an entity exists in the database
 * Routes to the appropriate table based on entity type
 */
async function verifyEntityExists(
  entityType: EntityType,
  entityId: string
): Promise<{ exists: boolean; sourceLanguage?: string }> {
  try {
    switch (entityType) {
      case 'item': {
        const { data, error } = await supabase
          .from('items')
          .select('id, source_language')
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return { exists: false };
        }
        return {
          exists: true,
          sourceLanguage: data.source_language || 'en',
        };
      }

      case 'article': {
        const { data, error } = await supabase
          .from('item_articles')
          .select('id, source_language')
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return { exists: false };
        }
        return {
          exists: true,
          sourceLanguage: data.source_language || 'en',
        };
      }

      case 'link': {
        const { data, error } = await supabase
          .from('item_links')
          .select('id, source_language')
          .eq('id', entityId)
          .single();

        if (error || !data) {
          return { exists: false };
        }
        return {
          exists: true,
          sourceLanguage: data.source_language || 'en',
        };
      }

      case 'tag': {
        // For tags, check tag_translations table (tag_key is a string, not UUID)
        const { data, error } = await supabase
          .from('tag_translations')
          .select('tag_key, language')
          .eq('tag_key', entityId)
          .limit(1);

        return { exists: !error && data && data.length > 0, sourceLanguage: 'en' };
      }

      default:
        return { exists: false };
    }
  } catch (err) {
    console.error('Error verifying entity exists:', err);
    return { exists: false };
  }
}

/**
 * Map internal status result to API response format
 * Converts the detailed status from getEntityTranslationStatus to the API format
 */
function mapStatusToApiResponse(
  statusResult: StatusTranslationStatusResult
): TranslationStatusApiData {
  // Map overallStatus from internal format to API format
  const overallStatusMap: Record<string, TranslationOverallStatus> = {
    'complete': 'fully_translated',
    'partial': 'partially_translated',
    'pending': 'pending',
    'failed': 'has_failures',
  };

  // Build language status map with proper format
  const languages: Record<string, LanguageStatusData> = {};
  const completedLanguages: string[] = [];
  const pendingLanguages: string[] = [];
  const failedLanguages: string[] = [];

  for (const [lang, langStatus] of Object.entries(statusResult.byLanguage)) {
    if (!langStatus) continue;

    // Map internal status to API status
    const internalStatus = langStatus.status as LanguageStatus;
    const apiStatus: TranslationLanguageStatus =
      internalStatus === 'manual' ? 'completed' :
      internalStatus === 'processing' ? 'processing' :
      internalStatus as TranslationLanguageStatus;

    languages[lang] = {
      status: apiStatus,
      translatedAt: langStatus.translatedAt,
      error: langStatus.lastError,
    };

    // Categorize by status
    if (internalStatus === 'completed' || internalStatus === 'manual') {
      completedLanguages.push(lang);
    } else if (internalStatus === 'failed') {
      failedLanguages.push(lang);
    } else if (internalStatus === 'pending' || internalStatus === 'processing') {
      pendingLanguages.push(lang);
    }
  }

  // Handle not_started case for overallStatus
  const hasAnyActivity = Object.values(statusResult.byLanguage).some(
    langStatus => langStatus && langStatus.status !== 'not_started'
  );

  let overallStatus: TranslationOverallStatus;
  if (!hasAnyActivity && statusResult.completedCount === 0) {
    overallStatus = 'not_started';
  } else {
    overallStatus = overallStatusMap[statusResult.overallStatus] || 'not_started';
  }

  return {
    entityId: statusResult.entityId,
    entityType: statusResult.entityType as TranslationEntityType,
    sourceLanguage: statusResult.sourceLanguage || 'en',
    overallStatus,
    completionPercentage: statusResult.completionPercentage,
    lastUpdated: statusResult.lastUpdatedAt || null,
    languages,
    completedLanguages,
    pendingLanguages,
    failedLanguages,
  };
}

/**
 * Generate appropriate cache headers based on translation status
 */
function getCacheHeaders(statusData: TranslationStatusApiData): HeadersInit {
  if (statusData.overallStatus === 'fully_translated') {
    // Cache fully translated content for 60 seconds
    return {
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
      'ETag': `"${statusData.lastUpdated || Date.now()}"`,
      'Last-Modified': statusData.lastUpdated || new Date().toISOString(),
    };
  }

  // No caching for incomplete translations
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

// ============================================================================
// Type Definitions (API-specific)
// ============================================================================

type TranslationEntityType = 'item' | 'article' | 'link' | 'tag';

type TranslationLanguageStatus =
  | 'not_started'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

type TranslationOverallStatus =
  | 'fully_translated'
  | 'partially_translated'
  | 'pending'
  | 'not_started'
  | 'has_failures';

interface LanguageStatusData {
  status: TranslationLanguageStatus;
  translatedAt?: string;
  error?: string;
}

interface TranslationStatusApiData {
  entityId: string;
  entityType: TranslationEntityType;
  sourceLanguage: string;
  overallStatus: TranslationOverallStatus;
  completionPercentage: number;
  lastUpdated: string | null;
  languages: Record<string, LanguageStatusData>;
  completedLanguages: string[];
  pendingLanguages: string[];
  failedLanguages: string[];
}

// ============================================================================
// Route Handler
// ============================================================================

/**
 * GET /api/translations/status/[entityType]/[entityId]
 *
 * Returns comprehensive translation status for the specified entity.
 *
 * @param entityType - Type of entity: item, article, link, or tag
 * @param entityId - UUID of the entity (or tag_key for tags)
 *
 * @returns 200 with translation status data
 * @returns 400 for invalid parameters
 * @returns 404 if entity not found
 * @returns 500 for internal errors
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const { entityType, entityId } = await params;

    // 1. Validate entityType
    if (!VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity type. Must be one of: item, article, link, tag' },
        { status: 400 }
      );
    }

    // 2. Validate entityId format (UUID for most entities, string for tags)
    if (entityType !== 'tag' && !UUID_REGEX.test(entityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entityId format' },
        { status: 400 }
      );
    }

    // 3. Verify entity exists
    const entityCheck = await verifyEntityExists(entityType as EntityType, entityId);
    if (!entityCheck.exists) {
      return NextResponse.json(
        { success: false, error: 'Entity not found' },
        { status: 404 }
      );
    }

    // 4. Get translation status using REQ-E03-006 utility
    const statusResult = await getEntityTranslationStatus(
      entityType as EntityType,
      entityId
    );

    if (!statusResult.success || !statusResult.data) {
      return NextResponse.json(
        { success: false, error: statusResult.error || 'Failed to get translation status' },
        { status: 500 }
      );
    }

    // 5. Map to API response format
    const apiData = mapStatusToApiResponse(statusResult.data);

    // 6. Determine cache headers
    const cacheHeaders = getCacheHeaders(apiData);

    // 7. Add CORS headers for cross-origin requests
    const headers = {
      ...cacheHeaders,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 8. Return response
    return NextResponse.json(
      { success: true, data: apiData },
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Translation status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
