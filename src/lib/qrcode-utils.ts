/**
 * Print-specific CSS for QR Code Printing System
 * Request #011 - QR Code Printing System for Properties
 * Purpose: Optimize QR code layouts for physical printing
 * 
 * BUG FIX: Enhanced CSS for Task 16 - CSS Print Layout Bug Fixes
 * - Fixed CSS syntax validation errors
 * - Improved cross-browser compatibility
 * - Enhanced page break optimization
 * - Improved print quality
 * 
 * BUG FIX: Task 17 - Cross-Browser Compatibility Bug Fixes
 * - Safari canvas implementation compatibility
 * - Mobile device support enhancements
 * - Additional vendor prefix support
 */

import QRCode from 'qrcode';
import { QRCodeOptions, QRCacheEntry, QRPrintSettings } from '../types/qrcode';

// QR Code cache for browser storage
const qrCodeCache = new Map<string, QRCacheEntry>();

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

// BUG FIX: Optimize garbage collection interval for memory management
const GC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let gcTimer: NodeJS.Timeout | null = null;

// BUG FIX: Task 17 - Browser detection for Safari-specific handling
const isSafari = typeof window !== 'undefined' && 
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const isIOS = typeof window !== 'undefined' && 
  /iPad|iPhone|iPod/.test(navigator.userAgent);

const isMobile = typeof window !== 'undefined' && 
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  width: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

/**
 * BUG FIX: Enhanced automatic garbage collection for QR cache
 */
function startGarbageCollection() {
  if (gcTimer) return;
  
  gcTimer = setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of qrCodeCache.entries()) {
      if (entry.expiresAt < now) {
        qrCodeCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired QR codes from cache`);
    }
    
    // BUG FIX: Force garbage collection when cache is large
    if (qrCodeCache.size > 100) {
      // Keep only the most recent 50 entries
      const entries = Array.from(qrCodeCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      qrCodeCache.clear();
      entries.slice(0, 50).forEach(([key, value]) => {
        qrCodeCache.set(key, value);
      });
      
      console.log(`🧹 Reduced cache size from ${entries.length} to ${qrCodeCache.size} entries`);
    }
  }, GC_INTERVAL_MS);
}

/**
 * BUG FIX: Stop garbage collection timer
 */
function stopGarbageCollection() {
  if (gcTimer) {
    clearInterval(gcTimer);
    gcTimer = null;
  }
}

/**
 * BUG FIX: Task 17 - Safari-specific canvas workaround
 * Safari has specific canvas implementation quirks that need special handling
 */
function createSafariCompatibleCanvas(width: number, height: number): HTMLCanvasElement | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    // BUG FIX: Safari canvas context validation
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Safari canvas context creation failed, falling back to default');
      return null;
    }
    
    // BUG FIX: Safari-specific canvas settings
    if (isSafari) {
      ctx.imageSmoothingEnabled = false;
      // Safari-specific image smoothing properties
      if ('webkitImageSmoothingEnabled' in ctx) {
        (ctx as any).webkitImageSmoothingEnabled = false;
      }
      if ('mozImageSmoothingEnabled' in ctx) {
        (ctx as any).mozImageSmoothingEnabled = false;
      }
    }
    
    return canvas;
  } catch (error) {
    console.error('Safari canvas creation failed:', error);
    return null;
  }
}

/**
 * BUG FIX: Task 17 - Enhanced QR code generation with Safari compatibility
 * @param url - The URL to encode in the QR code
 * @param options - Optional QR code generation options
 * @returns Promise resolving to data URL string
 */
export async function generateQRCode(
  url: string,
  options?: Partial<QRCodeOptions>
): Promise<string> {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided for QR code generation');
    }

  const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
  
  try {
    // BUG FIX: Safari-specific QR generation options
    const qrOptions: any = {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      // BUG FIX: Optimize for performance
      rendererOpts: {
        quality: 0.8 // Reduce quality slightly for better performance
      }
    };
    
    // BUG FIX: Task 17 - Safari-specific canvas handling
    if (isSafari && typeof window !== 'undefined') {
      const canvas = createSafariCompatibleCanvas(mergedOptions.width, mergedOptions.width);
      if (canvas) {
        qrOptions.rendererOpts = {
          ...qrOptions.rendererOpts,
          // Use our Safari-compatible canvas
          canvas: canvas
        };
      }
    }
    
    // BUG FIX: iOS-specific adjustments
    if (isIOS) {
      // iOS Safari has memory constraints, reduce quality if needed
      qrOptions.rendererOpts.quality = Math.min(qrOptions.rendererOpts.quality, 0.7);
    }
    
    const dataUrl: string = await new Promise((resolve, reject) => {
      QRCode.toDataURL(url, qrOptions, (err: Error | null | undefined, dataUrl: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(dataUrl);
        }
      });
    });
    
    // BUG FIX: Validate data URL format across browsers
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      throw new Error('Invalid QR code data URL generated - browser compatibility issue');
    }

    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    
    // BUG FIX: Task 17 - Fallback for Safari/mobile issues
    if (isSafari || isMobile) {
      try {
        console.log('Attempting Safari/mobile fallback QR generation...');
        // Fallback with reduced settings for Safari/mobile
        const fallbackOptions = {
          width: Math.min(mergedOptions.width, 200),
          margin: mergedOptions.margin,
          color: mergedOptions.color,
          rendererOpts: { quality: 0.6 }
        };
        
        const fallbackDataUrl: string = await new Promise((resolve, reject) => {
          QRCode.toDataURL(url, fallbackOptions, (err: Error | null | undefined, dataUrl: string) => {
            if (err) {
              reject(err);
            } else {
              resolve(dataUrl);
            }
          });
        });
        console.log('Safari/mobile fallback QR generation successful');
        return fallbackDataUrl;
      } catch (fallbackError) {
        console.error('Safari/mobile fallback also failed:', fallbackError);
        throw new Error(`QR generation failed on Safari/mobile: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
    }
    
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get QR code data URL with size-specific options
 * @param url - The URL to encode
 * @param size - Size preset (small, medium, large)
 * @returns Promise resolving to data URL string
 */
export async function getQRCodeDataURL(
  url: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): Promise<string> {
  const sizeMap = {
    small: 144,   // 1 inch at 144 DPI
    medium: 216,  // 1.5 inches at 144 DPI
    large: 288    // 2 inches at 144 DPI
  };

  // BUG FIX: Task 17 - Mobile-responsive size adjustments
  let targetSize = sizeMap[size];
  if (isMobile && targetSize > 216) {
    // Reduce size on mobile devices for better performance
    targetSize = 216;
    console.log('Reduced QR size for mobile device performance');
  }

  return generateQRCode(url, {
    width: targetSize,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

/**
 * Cache QR code data URL
 * @param itemId - Unique identifier for the item
 * @param dataUrl - Generated QR code data URL
 */
export function cacheQRCode(itemId: string, dataUrl: string): void {
    const now = Date.now();
  qrCodeCache.set(itemId, {
      dataUrl,
      timestamp: now,
    expiresAt: now + CACHE_EXPIRATION_MS
  });
  
  // Start garbage collection if not already running
  startGarbageCollection();
}

/**
 * Retrieve cached QR code data URL
 * @param itemId - Unique identifier for the item
 * @returns Cached data URL or null if not found/expired
 */
export function getCachedQRCode(itemId: string): string | null {
  const entry = qrCodeCache.get(itemId);
    
  if (!entry) {
      return null;
    }
    
  // Check if entry has expired
  if (entry.expiresAt < Date.now()) {
      qrCodeCache.delete(itemId);
      return null;
    }
    
  return entry.dataUrl;
}

/**
 * Clear QR code cache and stop garbage collection
 */
export function clearQRCache(): void {
    qrCodeCache.clear();
  stopGarbageCollection();
  console.log('QR code cache cleared');
}

/**
 * Validate QR code options
 * @param options - QR code options to validate
 * @returns true if valid, false otherwise
 */
export function validateQROptions(options: QRCodeOptions): boolean {
  try {
    return (
      typeof options.width === 'number' && options.width > 0 &&
      typeof options.margin === 'number' && options.margin >= 0 &&
      typeof options.color.dark === 'string' &&
      typeof options.color.light === 'string'
    );
  } catch {
    return false;
  }
}

/**
 * Generate QR code with caching support
 * @param url - The URL to encode
 * @param itemId - Optional item ID for caching
 * @param options - QR code generation options
 * @returns Promise resolving to data URL string
 */
export async function generateQRCodeWithCache(
  url: string,
  itemId?: string,
  options?: Partial<QRCodeOptions>
): Promise<string> {
  try {
    // Check cache first if itemId provided
    if (itemId) {
      const cachedQR = getCachedQRCode(itemId);
      if (cachedQR) {
        return cachedQR;
      }
    }
    
    // Generate new QR code
    const dataUrl = await generateQRCode(url, options);
    
    // Cache the result if itemId provided
    if (itemId) {
      cacheQRCode(itemId, dataUrl);
    }
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code with cache:', error);
    throw error;
  }
}

/**
 * BUG FIX: Enhanced batch QR code generation with performance optimizations
 * @param items - Array of items with URLs to generate QR codes for
 * @param onProgress - Progress callback function
 * @param options - QR code generation options
 * @returns Promise resolving to map of item IDs to data URLs
 */
export async function generateBatchQRCodes(
  items: Array<{ id: string; url: string }>,
  onProgress?: (completed: number, total: number) => void,
  options?: Partial<QRCodeOptions>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const total = items.length;
  let completed = 0;
  
  try {
    // BUG FIX: Optimize batch size based on total items for better performance
    let batchSize = total > 50 ? 3 : total > 20 ? 4 : 5;
    
    // BUG FIX: Task 17 - Mobile-specific batch size optimization
    if (isMobile) {
      batchSize = Math.min(batchSize, 2); // Smaller batches on mobile
      console.log('Reduced batch size for mobile device');
    }
    
    // BUG FIX: Safari-specific batch size optimization
    if (isSafari) {
      batchSize = Math.min(batchSize, 3); // Smaller batches for Safari
      console.log('Reduced batch size for Safari compatibility');
    }
    
    console.log(`🚀 Processing ${total} QR codes in batches of ${batchSize} (Browser: ${isSafari ? 'Safari' : isMobile ? 'Mobile' : 'Desktop'})`);
    
    // BUG FIX: Use requestAnimationFrame for better UI responsiveness
    const processBatchWithFrame = (batch: Array<{ id: string; url: string }>) => {
      return new Promise<void>((resolve) => {
        // BUG FIX: Task 17 - Use setTimeout fallback for older browsers
        const frameFunction = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : 
          (callback: FrameRequestCallback) => setTimeout(callback, 16);
        
        frameFunction(async () => {
      const batchPromises = batch.map(async (item) => {
        try {
          const dataUrl = await generateQRCodeWithCache(item.url, item.id, options);
          results.set(item.id, dataUrl);
          completed++;
          
          if (onProgress) {
            onProgress(completed, total);
          }
        } catch (error) {
          console.error(`❌ Failed to generate QR code for item ${item.id} (URL: ${item.url}):`, error);
          // Don't stop the entire batch for one failure
        }
      });
      
      await Promise.all(batchPromises);
          resolve();
        });
      });
    };
    
    // Process in optimized batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await processBatchWithFrame(batch);
      
      // BUG FIX: Adaptive delay based on batch size and total items
      if (i + batchSize < items.length) {
        let delay = total > 50 ? 150 : total > 20 ? 100 : 50;
        
        // BUG FIX: Task 17 - Longer delays for Safari/mobile
        if (isSafari || isMobile) {
          delay = Math.max(delay, 200); // Minimum 200ms delay for Safari/mobile
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // BUG FIX: Memory optimization - trigger garbage collection for large batches
    if (total > 20) {
      console.log('🧹 Triggering garbage collection for large batch');
      // Allow browser to clean up
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Generated ${results.size} QR codes successfully`);
    return results;
  } catch (error) {
    console.error('Batch QR code generation failed:', error);
    throw error;
  }
} 