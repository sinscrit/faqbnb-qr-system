/**
 * Translation Job Monitoring API Endpoint
 * REQ-E03-027: Implement Job Monitoring Endpoint
 *
 * Provides real-time statistics about the translation job queue
 * for administrative monitoring and operational visibility.
 *
 * @module api/admin/translation-jobs
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase';

// ============================================================================
// Type Definitions
// ============================================================================

type ValidEntityType = 'item' | 'article' | 'link' | 'tag';
type ValidJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface EntityTypeStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

interface LanguageStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

interface TimeWindowMetric {
  count: number;
  windowStart: string;
  windowEnd: string;
}

interface JobMonitoringData {
  queuedCount: number;
  processingCount: number;
  completedLastHour: TimeWindowMetric;
  failedLastHour: TimeWindowMetric;
  entityTypeBreakdown: Record<ValidEntityType, EntityTypeStats>;
  languageBreakdown: Record<string, LanguageStats>;
  averageProcessingDurationMs: number | null;
  averageQueueWaitTimeMs: number | null;
  oldestQueuedJobTimestamp: string | null;
  responseTimestamp: string;
}

interface JobMonitoringResponse {
  success: boolean;
  data: JobMonitoringData;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

interface JobMonitoringErrorResponse {
  success: false;
  error: string;
  code: string;
}

// ============================================================================
// Constants
// ============================================================================

const LOG_PREFIX = '[TranslationJobsMonitor]';
const VALID_ENTITY_TYPES: ValidEntityType[] = ['item', 'article', 'link', 'tag'];
const VALID_STATUSES: ValidJobStatus[] = ['queued', 'processing', 'completed', 'failed'];
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'];

// ============================================================================
// GET Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log(`${LOG_PREFIX} Job monitoring endpoint called - validating authentication...`);

    // ========================================================================
    // Authentication & Authorization
    // ========================================================================

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log(`${LOG_PREFIX} Authentication failed`);
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      console.log(`${LOG_PREFIX} Access denied - admin privileges required for user: ${authResult.user?.email}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for job monitoring',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log(`${LOG_PREFIX} Authentication successful for admin: ${authResult.user?.email}`);

    // ========================================================================
    // Query Parameter Validation
    // ========================================================================

    const { searchParams } = new URL(request.url);
    const entityTypeParam = searchParams.get('entityType');
    const statusParam = searchParams.get('status');

    let entityTypeFilter: ValidEntityType | undefined;
    if (entityTypeParam) {
      if (!VALID_ENTITY_TYPES.includes(entityTypeParam as ValidEntityType)) {
        console.log(`${LOG_PREFIX} Invalid entityType parameter: ${entityTypeParam}`);
        return NextResponse.json(
          {
            success: false,
            error: `Invalid entityType. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
            code: 'INVALID_ENTITY_TYPE'
          },
          { status: 400 }
        );
      }
      entityTypeFilter = entityTypeParam as ValidEntityType;
    }

    let statusFilter: ValidJobStatus | undefined;
    if (statusParam) {
      if (!VALID_STATUSES.includes(statusParam as ValidJobStatus)) {
        console.log(`${LOG_PREFIX} Invalid status parameter: ${statusParam}`);
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
            code: 'INVALID_STATUS'
          },
          { status: 400 }
        );
      }
      statusFilter = statusParam as ValidJobStatus;
    }

    console.log(`${LOG_PREFIX} Query parameters:`, { entityTypeFilter, statusFilter });

    // ========================================================================
    // Calculate Time Windows
    // ========================================================================

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const responseTimestamp = now.toISOString();

    // ========================================================================
    // Core Statistics Queries
    // ========================================================================

    // Query 1: Queued job count
    let queuedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued');

    if (entityTypeFilter) {
      queuedQuery = queuedQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: queuedCount, error: queuedError } = await queuedQuery;

    if (queuedError) {
      console.error(`${LOG_PREFIX} Error fetching queued count:`, queuedError);
      throw new Error('Failed to fetch queued job count');
    }

    // Query 2: Processing job count
    let processingQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    if (entityTypeFilter) {
      processingQuery = processingQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: processingCount, error: processingError } = await processingQuery;

    if (processingError) {
      console.error(`${LOG_PREFIX} Error fetching processing count:`, processingError);
      throw new Error('Failed to fetch processing job count');
    }

    // Query 3: Completed jobs in last hour
    let completedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', oneHourAgo.toISOString());

    if (entityTypeFilter) {
      completedQuery = completedQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: completedLastHourCount, error: completedError } = await completedQuery;

    if (completedError) {
      console.error(`${LOG_PREFIX} Error fetching completed count:`, completedError);
      throw new Error('Failed to fetch completed job count');
    }

    // Query 4: Failed jobs in last hour
    let failedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('completed_at', oneHourAgo.toISOString());

    if (entityTypeFilter) {
      failedQuery = failedQuery.eq('entity_type', entityTypeFilter);
    }

    const { count: failedLastHourCount, error: failedError } = await failedQuery;

    if (failedError) {
      console.error(`${LOG_PREFIX} Error fetching failed count:`, failedError);
      throw new Error('Failed to fetch failed job count');
    }

    // Query 5: Oldest queued job timestamp
    let oldestQueuedQuery = supabaseAdmin
      .from('translation_jobs')
      .select('created_at')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (entityTypeFilter) {
      oldestQueuedQuery = oldestQueuedQuery.eq('entity_type', entityTypeFilter);
    }

    const { data: oldestJob, error: oldestError } = await oldestQueuedQuery;

    if (oldestError) {
      console.error(`${LOG_PREFIX} Error fetching oldest queued job:`, oldestError);
      throw new Error('Failed to fetch oldest queued job');
    }

    const oldestQueuedJobTimestamp = oldestJob && oldestJob.length > 0
      ? oldestJob[0].created_at
      : null;

    // ========================================================================
    // Entity Type Breakdown
    // ========================================================================

    const entityTypeBreakdown: Record<ValidEntityType, EntityTypeStats> = {
      item: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
      article: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
      link: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
      tag: { queued: 0, processing: 0, completed: 0, failed: 0, total: 0 },
    };

    const entityTypesToQuery: ValidEntityType[] = entityTypeFilter
      ? [entityTypeFilter]
      : VALID_ENTITY_TYPES;

    for (const entityType of entityTypesToQuery) {
      for (const status of VALID_STATUSES) {
        const { count, error } = await supabaseAdmin
          .from('translation_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', entityType)
          .eq('status', status);

        if (error) {
          console.error(`${LOG_PREFIX} Error fetching ${entityType}/${status} count:`, error);
          continue;
        }

        entityTypeBreakdown[entityType][status] = count || 0;
        entityTypeBreakdown[entityType].total += count || 0;
      }
    }

    // ========================================================================
    // Language Breakdown
    // ========================================================================

    const languageBreakdown: Record<string, LanguageStats> = {};

    for (const lang of SUPPORTED_LANGUAGES) {
      languageBreakdown[lang] = { queued: 0, processing: 0, completed: 0, failed: 0 };
    }

    for (const lang of SUPPORTED_LANGUAGES) {
      for (const status of VALID_STATUSES) {
        let query = supabaseAdmin
          .from('translation_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('target_language', lang)
          .eq('status', status);

        if (entityTypeFilter) {
          query = query.eq('entity_type', entityTypeFilter);
        }

        const { count, error } = await query;

        if (error) {
          console.error(`${LOG_PREFIX} Error fetching ${lang}/${status} count:`, error);
          continue;
        }

        languageBreakdown[lang][status] = count || 0;
      }
    }

    // ========================================================================
    // Performance Metrics (Average Processing Time & Queue Wait)
    // ========================================================================

    let timingQuery = supabaseAdmin
      .from('translation_jobs')
      .select('created_at, started_at, completed_at')
      .eq('status', 'completed')
      .not('started_at', 'is', null)
      .not('completed_at', 'is', null)
      .gte('completed_at', oneHourAgo.toISOString());

    if (entityTypeFilter) {
      timingQuery = timingQuery.eq('entity_type', entityTypeFilter);
    }

    const { data: completedJobs, error: timingError } = await timingQuery;

    if (timingError) {
      console.error(`${LOG_PREFIX} Error fetching timing data:`, timingError);
      throw new Error('Failed to fetch timing data');
    }

    let averageProcessingDurationMs: number | null = null;
    let averageQueueWaitTimeMs: number | null = null;

    if (completedJobs && completedJobs.length > 0) {
      let totalProcessingMs = 0;
      let totalQueueWaitMs = 0;
      let validProcessingCount = 0;
      let validQueueWaitCount = 0;

      for (const job of completedJobs) {
        if (job.started_at && job.completed_at) {
          const startedAt = new Date(job.started_at).getTime();
          const completedAt = new Date(job.completed_at).getTime();
          const processingMs = completedAt - startedAt;
          if (processingMs >= 0) {
            totalProcessingMs += processingMs;
            validProcessingCount++;
          }
        }

        if (job.created_at && job.started_at) {
          const createdAt = new Date(job.created_at).getTime();
          const startedAt = new Date(job.started_at).getTime();
          const waitMs = startedAt - createdAt;
          if (waitMs >= 0) {
            totalQueueWaitMs += waitMs;
            validQueueWaitCount++;
          }
        }
      }

      if (validProcessingCount > 0) {
        averageProcessingDurationMs = Math.round(totalProcessingMs / validProcessingCount);
      }

      if (validQueueWaitCount > 0) {
        averageQueueWaitTimeMs = Math.round(totalQueueWaitMs / validQueueWaitCount);
      }
    }

    // ========================================================================
    // Assemble Response
    // ========================================================================

    const responseData: JobMonitoringData = {
      queuedCount: queuedCount || 0,
      processingCount: processingCount || 0,
      completedLastHour: {
        count: completedLastHourCount || 0,
        windowStart: oneHourAgo.toISOString(),
        windowEnd: responseTimestamp,
      },
      failedLastHour: {
        count: failedLastHourCount || 0,
        windowStart: oneHourAgo.toISOString(),
        windowEnd: responseTimestamp,
      },
      entityTypeBreakdown,
      languageBreakdown,
      averageProcessingDurationMs,
      averageQueueWaitTimeMs,
      oldestQueuedJobTimestamp,
      responseTimestamp,
    };

    const response: JobMonitoringResponse = {
      success: true,
      data: responseData,
      accountContext: {
        accountId: null,
        accountRole: 'admin',
      },
    };

    console.log(`${LOG_PREFIX} Statistics gathered:`, {
      queuedCount: responseData.queuedCount,
      processingCount: responseData.processingCount,
      completedLastHour: responseData.completedLastHour.count,
      failedLastHour: responseData.failedLastHour.count,
      averageProcessingDurationMs: responseData.averageProcessingDurationMs,
      averageQueueWaitTimeMs: responseData.averageQueueWaitTimeMs,
    });

    console.log(`${LOG_PREFIX} Job monitoring completed for admin: ${authResult.user?.email}`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=30',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${LOG_PREFIX} Error fetching job statistics:`, error);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch job monitoring statistics: ${errorMessage}`,
        code: 'QUERY_ERROR',
      } as JobMonitoringErrorResponse,
      { status: 500 }
    );
  }
}
