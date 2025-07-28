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
  status: 'pending' | 'generating' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

/**
 * Custom hook for QR code generation with advanced features
 */
export function useQRCodeGeneration(options: UseQRCodeGenerationOptions = {}): UseQRCodeGenerationReturn {
  const {
    batchSize = 5,
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://faqbnb.com',
    enableRetry = true,
    maxRetries = 2
  } = options;

  // Main state
  const [qrCodes, setQRCodes] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const [itemStates, setItemStates] = useState<Map<string, ItemGenerationState>>(new Map());

  // BUG FIX: Enhanced refs for better lifecycle management
  const isUnmountedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeGenerationRef = useRef<Promise<void> | null>(null);
  const batchQueueRef = useRef<Item[]>([]);
  const processingBatchRef = useRef(false);

  // BUG FIX: Memory leak prevention with proper cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      
      // Abort any ongoing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Wait for active generation to complete before cleanup
      if (activeGenerationRef.current) {
        activeGenerationRef.current.finally(() => {
          clearUtilCache();
        });
      } else {
        clearUtilCache();
      }
      
      // Clear batch queue
      batchQueueRef.current = [];
      processingBatchRef.current = false;
    };
  }, []);

  /**
   * BUG FIX: Enhanced progress calculation with safety checks
   */
  const updateProgress = useCallback((states: Map<string, ItemGenerationState>) => {
    if (isUnmountedRef.current) return;
    
    const total = states.size;
    if (total === 0) {
      setProgress(0);
      return;
    }
    
    const completed = Array.from(states.values()).filter(
      state => state.status === 'completed' || state.status === 'failed'
    ).length;
    
    const newProgress = Math.round((completed / total) * 100);
    
    // BUG FIX: Prevent progress from going backwards
    setProgress(prev => Math.max(prev, newProgress));
  }, []);

  /**
   * BUG FIX: Enhanced single QR code generation with better error handling
   */
  const generateSingleQRCode = useCallback(async (
    item: Item,
    retryCount: number = 0,
    signal?: AbortSignal
  ): Promise<{ success: boolean; dataUrl?: string; error?: string }> => {
    try {
      // BUG FIX: Check for abort signal before starting
      if (signal?.aborted) {
        throw new Error('Generation aborted');
      }
      
      const qrUrl = `${baseUrl}/item/${item.public_id}`;
      console.log(`Generating QR code for ${item.name} (attempt ${retryCount + 1})`);
      
      // BUG FIX: Add timeout for individual generation
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('QR generation timeout'));
        }, 10000); // 10 second timeout
        
        signal?.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Generation aborted'));
        });
      });
      
      const generationPromise = generateQRCodeWithCache(qrUrl, item.id);
      const dataUrl = await Promise.race([generationPromise, timeoutPromise]);
      
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        throw new Error('Invalid QR code data URL generated');
      }
      
      return { success: true, dataUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // BUG FIX: Don't log aborted operations as errors
      if (!errorMessage.includes('abort')) {
        console.error(`Failed to generate QR code for ${item.name}:`, errorMessage);
      }
      
      return { 
        success: false, 
        error: `Failed to generate QR code: ${errorMessage}` 
      };
    }
  }, [baseUrl]);

  /**
   * BUG FIX: Enhanced batch processing with race condition prevention
   */
  const processBatch = useCallback(async (
    items: Item[],
    states: Map<string, ItemGenerationState>,
    signal?: AbortSignal
  ): Promise<Map<string, ItemGenerationState>> => {
    if (isUnmountedRef.current || signal?.aborted) {
      return states;
    }

    const updatedStates = new Map(states);
    
    // BUG FIX: Process items sequentially within batch to prevent race conditions
    for (const item of items) {
      if (isUnmountedRef.current || signal?.aborted) {
        break;
      }
      
      const currentState = updatedStates.get(item.id);
      if (!currentState || currentState.status !== 'generating') {
        continue;
      }

      const startTime = Date.now();
      updatedStates.set(item.id, {
        ...currentState,
        startTime
      });

      const result = await generateSingleQRCode(item, currentState.retryCount, signal);
      
      if (isUnmountedRef.current || signal?.aborted) {
        break;
      }

      const endTime = Date.now();

      if (result.success && result.dataUrl) {
        // Success
        updatedStates.set(item.id, {
          ...currentState,
          status: 'completed',
          startTime,
          endTime
        });
        
        // BUG FIX: Update QR codes state safely
        setQRCodes(prev => {
          if (isUnmountedRef.current) return prev;
          const newMap = new Map(prev);
          newMap.set(item.id, result.dataUrl!);
          return newMap;
        });
      } else {
        // Failure
        const canRetry = enableRetry && currentState.retryCount < maxRetries;
        
        updatedStates.set(item.id, {
          ...currentState,
          status: canRetry ? 'pending' : 'failed',
          retryCount: currentState.retryCount + 1,
          error: result.error,
          startTime,
          endTime
        });
        
        if (!canRetry) {
          // BUG FIX: Update failed items state safely
          setFailedItems(prev => {
            if (isUnmountedRef.current) return prev;
            const newSet = new Set(prev);
            newSet.add(item.id);
            return newSet;
          });
        }
      }
    }

    return updatedStates;
  }, [generateSingleQRCode, enableRetry, maxRetries]);

  /**
   * BUG FIX: Enhanced main QR code generation function with better state management
   */
  const generateQRCodes = useCallback(async (items: Item[]): Promise<void> => {
    if (items.length === 0 || isUnmountedRef.current) {
      return;
    }

    // BUG FIX: Prevent concurrent generations
    if (processingBatchRef.current) {
      // Add items to queue instead of starting new generation
      batchQueueRef.current.push(...items);
      return;
    }

    processingBatchRef.current = true;

    // Abort any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setIsGenerating(true);
      setError(null);
      setProgress(0);

      // BUG FIX: Initialize item states properly
      const initialStates = new Map<string, ItemGenerationState>();
      items.forEach(item => {
        initialStates.set(item.id, {
          status: 'pending',
          retryCount: 0
        });
      });
      
      setItemStates(initialStates);
      
      let currentStates = initialStates;
      let remainingItems = [...items];

      // BUG FIX: Process in batches with proper retry mechanism
      while (remainingItems.length > 0 && !isUnmountedRef.current && !signal.aborted) {
        // Get items that are pending or need retry
        const itemsToProcess = remainingItems.filter(item => {
          const state = currentStates.get(item.id);
          return state && (state.status === 'pending');
        }).slice(0, batchSize);

        if (itemsToProcess.length === 0) {
          break;
        }

        // Mark items as generating
        itemsToProcess.forEach(item => {
          const currentState = currentStates.get(item.id);
          if (currentState) {
            currentStates.set(item.id, {
              ...currentState,
              status: 'generating'
            });
          }
        });

        // Update states
        setItemStates(new Map(currentStates));
        updateProgress(currentStates);

        // Process batch
        const newStates = await processBatch(itemsToProcess, currentStates, signal);
        
        if (isUnmountedRef.current || signal.aborted) {
          break;
        }

        currentStates = newStates;
        setItemStates(new Map(currentStates));
        updateProgress(currentStates);

        // Remove completed and failed items from remaining items
        remainingItems = remainingItems.filter(item => {
          const state = currentStates.get(item.id);
          return state && (state.status === 'pending');
        });

        // BUG FIX: Add delay between batches to prevent overwhelming
        if (remainingItems.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // BUG FIX: Process any queued items
      if (batchQueueRef.current.length > 0 && !isUnmountedRef.current) {
        const queuedItems = [...batchQueueRef.current];
        batchQueueRef.current = [];
        
        // Reset processing flag temporarily to allow recursive call
        processingBatchRef.current = false;
        await generateQRCodes(queuedItems);
        return; // Exit early as the recursive call will handle cleanup
      }

    } catch (error) {
      if (!isUnmountedRef.current && !String(error).includes('abort')) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`QR generation failed: ${errorMessage}`);
        console.error('QR generation error:', error);
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsGenerating(false);
        processingBatchRef.current = false;
      }
      
      // Store the active generation promise
      activeGenerationRef.current = null;
    }
  }, [batchSize, updateProgress, processBatch]);

  // Set the active generation promise
  useEffect(() => {
    if (isGenerating && !activeGenerationRef.current) {
      activeGenerationRef.current = Promise.resolve();
    }
  }, [isGenerating]);

  /**
   * BUG FIX: Enhanced retry mechanism with better state management
   */
  const retryFailedItems = useCallback(async (items: Item[]): Promise<void> => {
    if (isUnmountedRef.current) return;
    
    const failedItemsToRetry = items.filter(item => failedItems.has(item.id));
    
    if (failedItemsToRetry.length === 0) {
      return;
    }

    // BUG FIX: Clear failed items before retry
    setFailedItems(prev => {
      const updated = new Set(prev);
      failedItemsToRetry.forEach(item => updated.delete(item.id));
      return updated;
    });

    // BUG FIX: Reset item states for retry
    setItemStates(prev => {
      const updated = new Map(prev);
      failedItemsToRetry.forEach(item => {
        updated.set(item.id, {
          status: 'pending',
          retryCount: 0
        });
      });
      return updated;
    });

    await generateQRCodes(failedItemsToRetry);
  }, [failedItems, generateQRCodes]);

  /**
   * BUG FIX: Enhanced cache management with proper cleanup
   */
  const clearQRCache = useCallback(() => {
    // Abort any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear utility cache
    clearUtilCache();
    
    // BUG FIX: Reset all state atomically to prevent inconsistencies
    setQRCodes(new Map());
    setIsGenerating(false);
    setProgress(0);
    setError(null);
    setFailedItems(new Set());
    setItemStates(new Map());
    
    // Clear refs
    activeGenerationRef.current = null;
    batchQueueRef.current = [];
    processingBatchRef.current = false;
    
    console.log('QR code cache cleared');
  }, []);

  /**
   * BUG FIX: Enhanced statistics with safety checks
   */
  const getStats = useCallback(() => {
    const total = itemStates.size;
    const completed = Array.from(itemStates.values()).filter(s => s.status === 'completed').length;
    const failed = failedItems.size;
    const remaining = Math.max(0, total - completed - failed);
    
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