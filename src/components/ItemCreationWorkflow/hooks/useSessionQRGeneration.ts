'use client';

/**
 * useSessionQRGeneration - QR code generation for session items
 *
 * Generates QR codes for Items created in the current session.
 *
 * ## IMPORTANT: QR Code Semantics (REQ-211)
 *
 * QR codes represent **physical Items**, NOT individual Articles.
 *
 * Key principles:
 * - Each physical Item gets exactly ONE QR code
 * - The QR URL points to the Item landing page: `/item/{itemId}`
 * - Multiple Articles can exist per Item; they share the same QR code
 * - QR labels should show the physical item name (e.g., "Cabinets"),
 *   NOT the article title (e.g., "How to Clean")
 * - When new Articles are added to an Item, the QR code remains unchanged
 *
 * This design ensures QR codes are stable and don't need regeneration
 * when content is added or modified.
 *
 * ## Features
 * - Batch generation with configurable batch size
 * - Progress tracking per item and overall
 * - Retry mechanism for failed items
 * - Cancellation support for long operations
 *
 * @example Generating QR codes for session
 * ```tsx
 * const {
 *   generateForItems,
 *   isGenerating,
 *   progress,
 *   stats,
 *   qrCodes,
 * } = useSessionQRGeneration({ batchSize: 5 });
 *
 * const handlePrint = async () => {
 *   await generateForItems(session.items);
 *   // qrCodes map contains item.id -> QR data URL
 *   // Each QR encodes: /item/{itemId}
 * };
 * ```
 *
 * @module ItemCreationWorkflow/hooks/useSessionQRGeneration
 * @see QRGenerationProgress for progress UI
 * @see useQRCodeGeneration for underlying implementation
 * @see docs/REQ-211-update-qr-code-generation-overview.md
 * @lastModified 2026-01-12 (REQ-211 QR Code Semantics Documentation)
 */

import { useCallback, useMemo } from 'react';
import { useQRCodeGeneration } from '@/hooks/useQRCodeGeneration';
import type { SessionItem } from '../ItemCreationWorkflow.types';
import type { Item } from '@/types';

// =============================================================================
// Type Definitions (Task 4.1)
// =============================================================================

/**
 * Options for configuring the useSessionQRGeneration hook.
 */
export interface UseSessionQRGenerationOptions {
  /** Batch size for processing items (default: 5) */
  batchSize?: number;
  /** Base URL for QR code generation (default: window.location.origin) */
  baseUrl?: string;
}

/**
 * Status of QR code generation for an individual item.
 */
export type QRItemStatus = 'pending' | 'generating' | 'completed' | 'failed';

/**
 * Statistics about the QR code generation progress.
 */
export interface QRGenerationStats {
  /** Total number of items to generate QR codes for */
  total: number;
  /** Number of items that have been successfully generated */
  completed: number;
  /** Number of items that failed to generate */
  failed: number;
  /** Number of items remaining to be processed */
  remaining: number;
}

/**
 * Return type for the useSessionQRGeneration hook.
 */
export interface UseSessionQRGenerationReturn {
  /** Map of item IDs to generated QR code data URLs */
  qrCodes: Map<string, string>;
  /** Whether QR generation is currently in progress */
  isGenerating: boolean;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Statistics about generation progress */
  stats: QRGenerationStats;
  /** Current error message, if any */
  error: string | null;
  /** Set of item IDs that failed to generate */
  failedItemIds: Set<string>;
  /** Map of item IDs to their current generation status */
  itemStatuses: Map<string, QRItemStatus>;
  /** Generate QR codes for given session items */
  generateForItems: (items: SessionItem[]) => Promise<void>;
  /** Retry failed items */
  retryFailed: (items: SessionItem[]) => Promise<void>;
  /** Cancel ongoing generation */
  cancel: () => void;
  /** Clear all generated QR codes and reset state */
  clear: () => void;
}

// =============================================================================
// Core Implementation (Task 4.2)
// =============================================================================

/**
 * Custom hook that adapts SessionItem[] to the useQRCodeGeneration hook.
 * Transforms session items into the format expected by the underlying hook
 * and provides a simplified API for QR code generation within the workflow.
 *
 * @param options - Configuration options for QR generation
 * @returns Hook return with QR generation methods and state
 */
export function useSessionQRGeneration(
  options: UseSessionQRGenerationOptions = {}
): UseSessionQRGenerationReturn {
  const { batchSize = 5, baseUrl } = options;

  // Initialize the underlying useQRCodeGeneration hook
  const qrHook = useQRCodeGeneration({
    batchSize,
    baseUrl,
    enableRetry: true,
    maxRetries: 2,
  });

  /**
   * Transform SessionItem[] to Item-compatible format.
   * Maps session items to the structure expected by useQRCodeGeneration.
   */
  const transformSessionItems = useCallback((items: SessionItem[]): Item[] => {
    return items.map(item => ({
      id: item.id,
      publicId: item.id, // Use item.id as publicId for QR URL generation
      name: item.name,
      description: null,
      qrCodeUrl: item.qrCodeUrl || null,
      qrCodeUploadedAt: null,
      propertyId: '',
      tags: item.tags || [],
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.createdAt.toISOString(),
    }));
  }, []);

  /**
   * Generate QR codes for given session items.
   * Filters out items that already have qrCodeUrl and transforms the rest.
   */
  const generateForItems = useCallback(async (items: SessionItem[]): Promise<void> => {
    // Filter out items that already have QR codes
    const itemsNeedingQR = items.filter(item => !item.qrCodeUrl);

    if (itemsNeedingQR.length === 0) {
      return;
    }

    // Transform to Item format and generate
    const transformedItems = transformSessionItems(itemsNeedingQR);
    await qrHook.generateQRCodes(transformedItems);
  }, [transformSessionItems, qrHook]);

  /**
   * Retry failed items only.
   * Filters the provided items to those that failed and retries them.
   */
  const retryFailed = useCallback(async (items: SessionItem[]): Promise<void> => {
    // Filter to only failed items
    const failedItemsList = items.filter(item => qrHook.failedItems.has(item.id));

    if (failedItemsList.length === 0) {
      return;
    }

    // Transform and retry
    const transformedItems = transformSessionItems(failedItemsList);
    await qrHook.retryFailedItems(transformedItems);
  }, [transformSessionItems, qrHook]);

  /**
   * Cancel ongoing generation.
   * Clears the QR cache which aborts any pending operations.
   */
  const cancel = useCallback((): void => {
    qrHook.clearQRCache();
  }, [qrHook]);

  /**
   * Clear all generated QR codes and reset state.
   */
  const clear = useCallback((): void => {
    qrHook.clearQRCache();
  }, [qrHook]);

  /**
   * Get statistics about the current generation progress.
   */
  const stats = useMemo((): QRGenerationStats => {
    return qrHook.getStats();
  }, [qrHook]);

  /**
   * Derive item statuses from the underlying hook state.
   * Creates a map of item IDs to their current generation status.
   */
  const itemStatuses = useMemo((): Map<string, QRItemStatus> => {
    const statuses = new Map<string, QRItemStatus>();

    // Items with QR codes are completed
    for (const itemId of qrHook.qrCodes.keys()) {
      statuses.set(itemId, 'completed');
    }

    // Failed items
    for (const itemId of qrHook.failedItems) {
      statuses.set(itemId, 'failed');
    }

    // Items that are being generated (isGenerating true but not completed/failed)
    // are marked as generating. Others are pending.
    // Note: The underlying hook doesn't expose per-item generating state,
    // so we approximate: if generating and not completed/failed, it's pending

    return statuses;
  }, [qrHook.qrCodes, qrHook.failedItems]);

  return {
    qrCodes: qrHook.qrCodes,
    isGenerating: qrHook.isGenerating,
    progress: qrHook.progress,
    stats,
    error: qrHook.error,
    failedItemIds: qrHook.failedItems,
    itemStatuses,
    generateForItems,
    retryFailed,
    cancel,
    clear,
  };
}

export default useSessionQRGeneration;
