/**
 * Translation Job Processing API Route
 * Part of REQ-E03-025: Create Job Processing API Route
 * Extended by REQ-E03-026: Service Token Authentication for Cron Jobs
 *
 * Administrative endpoint that triggers on-demand translation job processing
 * with configurable batch sizes and returns detailed processing statistics.
 * Supports both admin user authentication and service token authentication
 * for cron job invocations.
 *
 * @module api/admin/process-translations
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { validateAdminAuth } from '@/lib/auth-server';
import { cleanupStaleProcessingJobs } from '@/lib/job-queue/concurrency-control';
import { getJobProcessor } from '@/lib/job-queue/job-processor';
import type { CleanupResult } from '@/lib/job-queue/concurrency-control';
import type { JobProcessingResult } from '@/lib/job-queue/job-processor';

// ===========================================================================
// Type Definitions
// ===========================================================================

/**
 * Request body for POST /api/admin/process-translations
 */
interface ProcessTranslationsRequest {
  /** Number of jobs to process in this batch (default: 10, max: 50) */
  batchSize?: number;
}

/**
 * Processing statistics returned by the endpoint
 */
interface ProcessingStatistics {
  /** Total number of jobs that were attempted */
  totalProcessed: number;
  /** Number of jobs that completed successfully */
  successCount: number;
  /** Number of jobs that failed during processing */
  failureCount: number;
  /** Number of stale jobs recovered before processing */
  staleRecoveryCount: number;
  /** Average processing time per job in milliseconds */
  averageProcessingTimeMs: number;
  /** Array of unique language codes that were processed */
  languagesProcessed: string[];
  /** Breakdown of job counts by entity type */
  entityTypeBreakdown: Record<string, number>;
  /** ISO timestamp when processing started */
  processingStartedAt: string;
  /** ISO timestamp when processing completed */
  processingCompletedAt: string;
}

/**
 * Successful response from the endpoint
 */
interface ProcessTranslationsResponse {
  success: true;
  data: ProcessingStatistics;
  requestedBatchSize: number;
  actualProcessed: number;
  message: string;
}

/**
 * Error response from the endpoint
 */
interface ProcessTranslationsErrorResponse {
  success: false;
  error: string;
  details?: string;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'PROCESSING_ERROR';
}

// ===========================================================================
// Constants
// ===========================================================================

/** Default number of jobs to process when batchSize not provided */
const DEFAULT_BATCH_SIZE = 10;

/** Maximum allowed batch size to prevent resource exhaustion */
const MAX_BATCH_SIZE = 50;

/** Log prefix for consistent logging */
const LOG_PREFIX = '[ProcessTranslations]';

// Suppress unused variable warnings for interfaces used only for type safety
void (undefined as unknown as ProcessTranslationsRequest);

// ===========================================================================
// Service Token Authentication (REQ-E03-026)
// ===========================================================================

/**
 * Validate service token authentication for cron job requests
 *
 * Supports two header formats:
 * - Authorization: Bearer <token>
 * - x-service-token: <token>
 *
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param request - Next.js request object
 * @returns true if valid service token provided, false otherwise
 */
function validateServiceToken(request: NextRequest): boolean {
  const serviceToken = process.env.TRANSLATION_SERVICE_TOKEN;

  // No service token configured - service auth disabled
  if (!serviceToken || serviceToken.length < 32) {
    return false;
  }

  // Check Authorization header (Bearer token format)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.length === serviceToken.length) {
      try {
        return timingSafeEqual(Buffer.from(token), Buffer.from(serviceToken));
      } catch {
        return false;
      }
    }
    return false;
  }

  // Check x-service-token header (alternative format)
  const headerToken = request.headers.get('x-service-token');
  if (headerToken && headerToken.length === serviceToken.length) {
    try {
      return timingSafeEqual(Buffer.from(headerToken), Buffer.from(serviceToken));
    } catch {
      return false;
    }
  }

  return false;
}

// ===========================================================================
// Request Validation
// ===========================================================================

/**
 * Validate and normalize the request body
 *
 * @param body - Raw request body (may be null, undefined, or any type)
 * @returns Validation result with either valid batchSize or error message
 */
function validateRequest(
  body: unknown
): { valid: true; batchSize: number } | { valid: false; error: string } {
  // Default batch size when not provided
  let batchSize = DEFAULT_BATCH_SIZE;

  // Handle empty body (use defaults)
  if (body === null || body === undefined) {
    return { valid: true, batchSize };
  }

  // Ensure body is an object
  if (typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  // Check if batchSize is provided
  if ('batchSize' in body) {
    const requestedSize = (body as { batchSize: unknown }).batchSize;

    // Validate type
    if (typeof requestedSize !== 'number') {
      return { valid: false, error: 'batchSize must be a number' };
    }

    // Validate integer
    if (!Number.isInteger(requestedSize)) {
      return { valid: false, error: 'batchSize must be an integer' };
    }

    // Validate positive
    if (requestedSize < 1) {
      return { valid: false, error: 'batchSize must be a positive integer (minimum: 1)' };
    }

    // Cap at maximum (don't reject, just cap)
    batchSize = Math.min(requestedSize, MAX_BATCH_SIZE);
  }

  return { valid: true, batchSize };
}

// ===========================================================================
// Statistics Aggregation
// ===========================================================================

/**
 * Aggregate job processing results into comprehensive statistics
 *
 * @param results - Array of individual job processing results
 * @param cleanupResult - Result from stale job cleanup operation
 * @param startedAt - ISO timestamp when processing started
 * @param completedAt - ISO timestamp when processing completed
 * @returns Aggregated processing statistics
 */
function aggregateStatistics(
  results: JobProcessingResult[],
  cleanupResult: CleanupResult,
  startedAt: string,
  completedAt: string
): ProcessingStatistics {
  // Initialize aggregation containers
  const languagesSet = new Set<string>();
  const entityTypeCounts: Record<string, number> = {};
  let totalProcessingTimeMs = 0;

  // Process each result
  for (const result of results) {
    // Track unique languages
    languagesSet.add(result.targetLanguage);

    // Count by entity type
    entityTypeCounts[result.entityType] = (entityTypeCounts[result.entityType] || 0) + 1;

    // Sum processing time
    totalProcessingTimeMs += result.processingTimeMs;
  }

  // Calculate averages
  const averageProcessingTimeMs = results.length > 0
    ? Math.round(totalProcessingTimeMs / results.length)
    : 0;

  return {
    totalProcessed: results.length,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
    staleRecoveryCount: cleanupResult.jobsReset,
    averageProcessingTimeMs,
    languagesProcessed: Array.from(languagesSet).sort(),
    entityTypeBreakdown: entityTypeCounts,
    processingStartedAt: startedAt,
    processingCompletedAt: completedAt,
  };
}

// ===========================================================================
// POST Handler
// ===========================================================================

/**
 * POST /api/admin/process-translations
 *
 * Triggers on-demand translation job processing with configurable batch size.
 * Requires admin or sysadmin authentication.
 *
 * @param request - Next.js request object
 * @returns JSON response with processing statistics or error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // =========================================================================
    // Step 1: Validate Authentication (Service Token or Admin User)
    // =========================================================================

    // Check service token first (for cron jobs)
    const isServiceAuth = validateServiceToken(request);
    let authMethod: 'service-token' | 'admin-auth' = 'service-token';
    let requestedBy = 'service-cron';
    let userEmail = 'cron@system';

    if (!isServiceAuth) {
      // Fall back to admin user authentication
      authMethod = 'admin-auth';
      const authResult = await validateAdminAuth(request);

      if (authResult.error) {
        console.warn(`${LOG_PREFIX} Authentication failed`);
        return authResult.error;
      }

      // Verify admin or sysadmin access
      if (!authResult.isAdmin && !authResult.isSysAdmin) {
        console.warn(`${LOG_PREFIX} Access denied for user: ${authResult.user?.email}`);
        return NextResponse.json(
          {
            success: false,
            error: 'Admin access required to trigger translation processing',
            code: 'FORBIDDEN',
          } as ProcessTranslationsErrorResponse,
          { status: 403 }
        );
      }

      requestedBy = authResult.user.id;
      userEmail = authResult.user.email;

      // Log admin auth request for audit trail
      console.info(`${LOG_PREFIX} Processing requested`, {
        authMethod,
        requestedBy,
        userEmail,
        isAdmin: authResult.isAdmin,
        isSysAdmin: authResult.isSysAdmin,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Log service token auth request for audit trail
      console.info(`${LOG_PREFIX} Processing requested via service token`, {
        authMethod,
        timestamp: new Date().toISOString(),
      });
    }

    // =========================================================================
    // Step 2: Parse and Validate Request Body
    // =========================================================================
    let requestBody: unknown = null;

    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        requestBody = await request.json();
      }
    } catch {
      // Empty body or invalid JSON is acceptable - will use defaults
      requestBody = null;
    }

    const validation = validateRequest(requestBody);

    if (!validation.valid) {
      console.warn(`${LOG_PREFIX} Validation failed: ${validation.error}`);
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
        } as ProcessTranslationsErrorResponse,
        { status: 400 }
      );
    }

    const { batchSize } = validation;

    console.info(`${LOG_PREFIX} Batch size: ${batchSize}`, {
      requestedBy,
    });

    // =========================================================================
    // Step 3: Run Stale Job Cleanup
    // =========================================================================
    console.info(`${LOG_PREFIX} Running stale job cleanup...`);

    let cleanupResult: CleanupResult;
    try {
      cleanupResult = await cleanupStaleProcessingJobs();

      if (cleanupResult.jobsReset > 0 || cleanupResult.jobsMarkedFailed > 0) {
        console.info(`${LOG_PREFIX} Stale cleanup completed`, {
          jobsReset: cleanupResult.jobsReset,
          jobsMarkedFailed: cleanupResult.jobsMarkedFailed,
        });
      }
    } catch (cleanupError) {
      // Log but don't fail - cleanup errors shouldn't block processing
      console.error(`${LOG_PREFIX} Stale cleanup failed (continuing):`, cleanupError);
      cleanupResult = {
        staleJobsFound: 0,
        jobsReset: 0,
        jobsMarkedFailed: 0,
        resetJobIds: [],
        failedJobIds: [],
        cleanedAt: new Date().toISOString(),
      };
    }

    // =========================================================================
    // Step 4: Process Translation Jobs
    // =========================================================================
    const processingStartedAt = new Date().toISOString();
    const results: JobProcessingResult[] = [];
    const processor = getJobProcessor();

    console.info(`${LOG_PREFIX} Starting batch processing...`, {
      batchSize,
      requestedBy,
    });

    for (let i = 0; i < batchSize; i++) {
      const result = await processor.processNextJob();

      if (!result) {
        // No more jobs available in queue
        console.info(`${LOG_PREFIX} No more jobs available after processing ${i} jobs`);
        break;
      }

      results.push(result);

      // Log individual job result for debugging
      if (result.success) {
        console.debug(`${LOG_PREFIX} Job ${result.jobId} completed: ${result.entityType}/${result.entityId} -> ${result.targetLanguage}`);
      } else {
        console.warn(`${LOG_PREFIX} Job ${result.jobId} failed: ${result.errorMessage}`);
      }
    }

    const processingCompletedAt = new Date().toISOString();

    // =========================================================================
    // Step 5: Build and Return Response
    // =========================================================================
    const statistics = aggregateStatistics(
      results,
      cleanupResult,
      processingStartedAt,
      processingCompletedAt
    );

    // Log completion summary
    console.info(`${LOG_PREFIX} Processing completed`, {
      authMethod,
      requestedBy,
      totalProcessed: statistics.totalProcessed,
      successCount: statistics.successCount,
      failureCount: statistics.failureCount,
      staleRecoveryCount: statistics.staleRecoveryCount,
      durationMs: Date.now() - startTime,
    });

    // Build message based on results
    let message: string;
    if (results.length === 0) {
      message = 'No translation jobs available for processing';
    } else if (statistics.failureCount === 0) {
      message = `Successfully processed ${statistics.totalProcessed} translation job${statistics.totalProcessed !== 1 ? 's' : ''}`;
    } else {
      message = `Processed ${statistics.totalProcessed} translation job${statistics.totalProcessed !== 1 ? 's' : ''} (${statistics.successCount} succeeded, ${statistics.failureCount} failed)`;
    }

    return NextResponse.json(
      {
        success: true,
        data: statistics,
        requestedBatchSize: batchSize,
        actualProcessed: results.length,
        message,
      } as ProcessTranslationsResponse,
      { status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`${LOG_PREFIX} Processing error:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Translation processing failed',
        details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined,
        code: 'PROCESSING_ERROR',
      } as ProcessTranslationsErrorResponse,
      { status: 500 }
    );
  }
}
