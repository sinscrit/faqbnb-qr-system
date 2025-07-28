'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Item } from '@/types';
import { generateBatchQRCodes, clearQRCache as clearUtilCache, generateQRCodeWithCache } from '@/lib/qrcode-utils';

/**
 * Hook interface for QR code generation
 */
interface UseQRCodeGenerationOptions {
  /** Batch size for processing items (default: 5) */
  batchSize?: number;
  /** Base URL for QR code generation (default: window.location.origin) */
  baseUrl?: string;
  /** Enable automatic retry on failure (default: true) */
  enableRetry?: boolean;
  /** Maximum retry attempts per item (default: 2) */
  maxRetries?: number;
}

/**
 * Hook return interface
 */
interface UseQRCodeGenerationReturn {
  /** Map of generated QR codes (itemId -> dataUrl) */
  qrCodes: Map<string, string>;
  /** Overall loading state */
  isGenerating: boolean;
  /** Current progress (0-100) */
  progress: number;
  /** Current error message, if any */
  error: string | null;
  /** Items that failed to generate QR codes */
  failedItems: Set<string>;
  /** Generate QR codes for given items */
  generateQRCodes: (items: Item[]) => Promise<void>;
  /** Retry failed QR codes */
  retryFailedItems: (items: Item[]) => Promise<void>;
  /** Clear all generated QR codes and reset state */
  clearQRCache: () => void;
  /** Get completion statistics */
  getStats: () => {
    total: number;
    completed: number;
    failed: number;
    remaining: number;
  };
}

/**
 * Individual item generation state
 */
interface ItemGenerationState {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}

/**
 * Custom hook for QR code generation with batch processing and state management
 */
export function useQRCodeGeneration(options: UseQRCodeGenerationOptions = {}): UseQRCodeGenerationReturn {
  const {
    batchSize = 5,
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://faqbnb.com',
    enableRetry = true,
    maxRetries = 2
  } = options;

  // State management
  const [qrCodes, setQRCodes] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const [itemStates, setItemStates] = useState<Map<string, ItemGenerationState>>(new Map());
  
  // Refs for controlling generation
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Update progress based on item states
   */
  const updateProgress = useCallback((states: Map<string, ItemGenerationState>) => {
    const total = states.size;
    if (total === 0) {
      setProgress(0);
      return;
    }
    
    const completed = Array.from(states.values()).filter(
      state => state.status === 'completed' || state.status === 'failed'
    ).length;
    
    const newProgress = Math.round((completed / total) * 100);
    setProgress(newProgress);
  }, []);

  /**
   * Generate QR code for a single item
   */
  const generateSingleQRCode = useCallback(async (
    item: Item,
    retryCount: number = 0
  ): Promise<{ success: boolean; dataUrl?: string; error?: string }> => {
    try {
      const qrUrl = `${baseUrl}/item/${item.public_id}`;
      console.log(`Generating QR code for ${item.name} (${qrUrl})`);
      
      const dataUrl = await generateQRCodeWithCache(qrUrl, item.id);
      
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        throw new Error('Invalid QR code data URL generated');
      }
      
      return { success: true, dataUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to generate QR code for ${item.name}:`, errorMessage);
      
      return { 
        success: false, 
        error: `Failed to generate QR code: ${errorMessage}` 
      };
    }
  }, [baseUrl]);

  /**
   * Process a batch of items
   */
  const processBatch = useCallback(async (
    items: Item[],
    states: Map<string, ItemGenerationState>
  ): Promise<Map<string, ItemGenerationState>> => {
    const updatedStates = new Map(states);
    const batchPromises = items.map(async (item) => {
      const currentState = updatedStates.get(item.id);
      if (!currentState || currentState.status !== 'generating') {
        return;
      }

      const result = await generateSingleQRCode(item, currentState.retryCount);
      
      if (isUnmountedRef.current) {
        return; // Component unmounted, stop processing
      }

      if (result.success && result.dataUrl) {
        // Success
        updatedStates.set(item.id, {
          ...currentState,
          status: 'completed'
        });
        
        setQRCodes(prev => new Map(prev).set(item.id, result.dataUrl!));
      } else {
        // Failure
        const canRetry = enableRetry && currentState.retryCount < maxRetries;
        
        updatedStates.set(item.id, {
          ...currentState,
          status: canRetry ? 'pending' : 'failed',
          retryCount: currentState.retryCount + 1,
          error: result.error
        });
        
        if (!canRetry) {
          setFailedItems(prev => new Set(prev).add(item.id));
        }
      }
    });

    await Promise.allSettled(batchPromises);
    return updatedStates;
  }, [generateSingleQRCode, enableRetry, maxRetries]);

  /**
   * Main QR code generation function
   */
  const generateQRCodes = useCallback(async (items: Item[]): Promise<void> => {
    if (items.length === 0) {
      return;
    }

    // Abort any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset state
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setFailedItems(new Set());

    // Initialize item states
    const initialStates = new Map<string, ItemGenerationState>();
    items.forEach(item => {
      initialStates.set(item.id, {
        id: item.id,
        status: 'pending',
        retryCount: 0
      });
    });
    setItemStates(initialStates);

    try {
      let currentStates = new Map(initialStates);
      
      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        if (abortControllerRef.current?.signal.aborted || isUnmountedRef.current) {
          break;
        }

        const batch = items.slice(i, i + batchSize);
        
        // Mark batch items as generating
        batch.forEach(item => {
          const state = currentStates.get(item.id);
          if (state && state.status === 'pending') {
            currentStates.set(item.id, {
              ...state,
              status: 'generating'
            });
          }
        });
        
        setItemStates(new Map(currentStates));
        
        // Process the batch
        currentStates = await processBatch(batch, currentStates);
        setItemStates(new Map(currentStates));
        updateProgress(currentStates);
        
        // Small delay between batches to prevent UI blocking
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Handle retry logic for failed items
      if (enableRetry) {
        const retryItems = items.filter(item => {
          const state = currentStates.get(item.id);
          return state && state.status === 'pending' && state.retryCount > 0;
        });

        if (retryItems.length > 0) {
          console.log(`Retrying ${retryItems.length} failed items...`);
          await generateQRCodes(retryItems);
          return;
        }
      }

      // Final statistics
      const completed = Array.from(currentStates.values()).filter(s => s.status === 'completed').length;
      const failed = Array.from(currentStates.values()).filter(s => s.status === 'failed').length;
      
      console.log(`QR generation completed: ${completed} successful, ${failed} failed`);
      
      if (failed > 0) {
        setError(`Failed to generate ${failed} QR code${failed > 1 ? 's' : ''}. You can retry these items.`);
      }

    } catch (error) {
      console.error('QR code generation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error during QR code generation');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [batchSize, processBatch, updateProgress, enableRetry]);

  /**
   * Retry failed items
   */
  const retryFailedItems = useCallback(async (items: Item[]): Promise<void> => {
    const failedItemsToRetry = items.filter(item => failedItems.has(item.id));
    
    if (failedItemsToRetry.length === 0) {
      return;
    }

    // Clear failed state for retry items
    setFailedItems(prev => {
      const updated = new Set(prev);
      failedItemsToRetry.forEach(item => updated.delete(item.id));
      return updated;
    });

    await generateQRCodes(failedItemsToRetry);
  }, [failedItems, generateQRCodes]);

  /**
   * Clear QR cache and reset all state
   */
  const clearQRCache = useCallback(() => {
    // Clear utility cache
    clearUtilCache();
    
    // Reset all state
    setQRCodes(new Map());
    setIsGenerating(false);
    setProgress(0);
    setError(null);
    setFailedItems(new Set());
    setItemStates(new Map());
    
    // Abort any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    console.log('QR code cache cleared');
  }, []);

  /**
   * Get generation statistics
   */
  const getStats = useCallback(() => {
    const total = itemStates.size;
    const completed = Array.from(itemStates.values()).filter(s => s.status === 'completed').length;
    const failed = failedItems.size;
    const remaining = total - completed - failed;
    
    return {
      total,
      completed,
      failed,
      remaining
    };
  }, [itemStates, failedItems]);

  return {
    qrCodes,
    isGenerating,
    progress,
    error,
    failedItems,
    generateQRCodes,
    retryFailedItems,
    clearQRCache,
    getStats
  };
} 