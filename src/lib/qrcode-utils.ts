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
import { getQRDomain } from './config';

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

// ================================
// PDF Integration Functions - REQ-013
// ================================

/**
 * Custom error class for QR code PDF conversion failures
 */
export class QRCodePDFConversionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(`QRCodePDFConversionError: ${message}`);
    this.name = 'QRCodePDFConversionError';
  }
}

/**
 * Converts base64 QR code data URL to binary data suitable for PDF embedding
 * 
 * @param dataUrl - Base64 data URL from QR code generation (e.g., "data:image/png;base64,...")
 * @returns Binary data as Uint8Array for PDF embedding
 * @throws QRCodePDFConversionError if conversion fails
 */
export function convertQRCodeForPDF(dataUrl: string): Uint8Array {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new QRCodePDFConversionError('Data URL is required and must be a string');
  }

  if (!dataUrl.startsWith('data:image/')) {
    throw new QRCodePDFConversionError('Invalid data URL format - must start with "data:image/"');
  }

  try {
    // Extract the base64 portion from the data URL
    const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (!base64Match || !base64Match[1]) {
      throw new QRCodePDFConversionError('Invalid base64 data URL format');
    }

    const base64Data = base64Match[1];
    
    // Convert base64 to binary
    if (typeof window !== 'undefined' && window.atob) {
      // Browser environment
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      // Node.js environment
      const buffer = Buffer.from(base64Data, 'base64');
      return new Uint8Array(buffer);
    }
  } catch (error) {
    throw new QRCodePDFConversionError(
      'Failed to convert base64 data URL to binary',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Optimizes QR code for print quality by regenerating at target size
 * 
 * @param dataUrl - Original QR code data URL
 * @param targetSize - Target size in pixels for optimal print quality
 * @returns Optimized QR code data URL
 * @throws QRCodePDFConversionError if optimization fails
 */
export async function optimizeQRForPrint(dataUrl: string, targetSize: number): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new QRCodePDFConversionError('Data URL is required for optimization');
  }

  if (!Number.isInteger(targetSize) || targetSize < 64 || targetSize > 2048) {
    throw new QRCodePDFConversionError('Target size must be an integer between 64 and 2048 pixels');
  }

  try {
    // Extract the original URL from QR code data (we'll need to regenerate)
    // For now, we'll optimize the existing image by resizing
    
    // Validate the input data URL first
    if (!validateQRForPDFEmbedding(dataUrl)) {
      throw new QRCodePDFConversionError('Input QR code failed validation for PDF embedding');
    }

    // Create high-quality print-optimized options
    const printOptions: Partial<QRCodeOptions> = {
      width: targetSize,
      margin: Math.max(2, Math.floor(targetSize / 32)), // Scale margin with size
      color: {
        dark: '#000000',  // Pure black for printing
        light: '#FFFFFF', // Pure white for printing
      },
    };

    // If we can extract the URL from the QR code, regenerate it
    // For now, we'll return an optimized version using canvas resize
    if (typeof window !== 'undefined') {
      return optimizeQRImageWithCanvas(dataUrl, targetSize);
    } else {
      // In Node.js environment, return the original with validation
      console.warn('QR optimization in Node.js environment - returning validated original');
      return dataUrl;
    }
  } catch (error) {
    throw new QRCodePDFConversionError(
      'Failed to optimize QR code for print',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Optimizes QR code image using canvas resizing for better print quality
 * 
 * @param dataUrl - Original QR code data URL
 * @param targetSize - Target size in pixels
 * @returns Optimized QR code data URL
 */
function optimizeQRImageWithCanvas(dataUrl: string, targetSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas for high-quality resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Disable image smoothing for crisp QR codes
        ctx.imageSmoothingEnabled = false;
        
        // Draw the image scaled to target size
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        
        // Convert to high-quality PNG
        const optimizedDataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(optimizedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load QR code image for optimization'));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Validates QR code data URL for PDF embedding compatibility
 * 
 * @param dataUrl - QR code data URL to validate
 * @returns True if QR code is valid for PDF embedding, false otherwise
 */
export function validateQRForPDFEmbedding(dataUrl: string): boolean {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return false;
  }

  try {
    // Check data URL format
    if (!dataUrl.startsWith('data:image/')) {
      return false;
    }

    // Check for supported image formats for PDF embedding
    const supportedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
    const formatMatch = dataUrl.match(/^data:(image\/[^;]+);base64,/);
    if (!formatMatch || !supportedFormats.includes(formatMatch[1])) {
      return false;
    }

    // Validate base64 data portion
    const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (!base64Match || !base64Match[1]) {
      return false;
    }

    const base64Data = base64Match[1];
    
    // Basic base64 validation
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      return false;
    }

    // Check minimum size (base64 data should be substantial for a valid QR code)
    if (base64Data.length < 100) {
      return false;
    }

    // Try to convert to binary to ensure it's valid
    try {
      convertQRCodeForPDF(dataUrl);
    } catch {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Gets image format from data URL
 * 
 * @param dataUrl - QR code data URL
 * @returns Image format ('png', 'jpeg', etc.) or null if invalid
 */
export function getQRImageFormat(dataUrl: string): string | null {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return null;
  }

  const formatMatch = dataUrl.match(/^data:image\/([^;]+);base64,/);
  return formatMatch ? formatMatch[1] : null;
}

/**
 * Gets image dimensions from QR code data URL (if possible)
 * 
 * @param dataUrl - QR code data URL
 * @returns Promise resolving to { width, height } or null if cannot determine
 */
export function getQRImageDimensions(dataUrl: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      resolve(null);
    };
    
    img.src = dataUrl;
  });
}

/**
 * Creates optimized QR code specifically for PDF printing
 * 
 * @param url - URL to encode in QR code
 * @param printSizeMm - Target print size in millimeters
 * @param dpi - Target DPI for printing (default: 300)
 * @returns Promise resolving to print-optimized QR code data URL
 */
export async function generateQRCodeForPDF(
  url: string,
  printSizeMm: number = 40,
  dpi: number = 300
): Promise<string> {
  if (!url || typeof url !== 'string') {
    throw new QRCodePDFConversionError('URL is required for QR code generation');
  }

  if (!Number.isFinite(printSizeMm) || printSizeMm <= 0) {
    throw new QRCodePDFConversionError('Print size must be a positive number');
  }

  if (!Number.isInteger(dpi) || dpi < 72 || dpi > 600) {
    throw new QRCodePDFConversionError('DPI must be an integer between 72 and 600');
  }

  try {
    // Calculate pixel size based on print size and DPI
    const printSizeInches = printSizeMm / 25.4; // Convert mm to inches
    const pixelSize = Math.round(printSizeInches * dpi);
    
    // Ensure minimum size for readability
    const finalPixelSize = Math.max(pixelSize, 128);

    // Generate QR code with print-optimized settings
    const printOptions: Partial<QRCodeOptions> = {
      width: finalPixelSize,
      margin: 2, // Minimal margin for printing
      color: {
        dark: '#000000',  // Pure black
        light: '#FFFFFF', // Pure white
      },
    };

    const dataUrl = await generateQRCode(url, printOptions);
    
    // Validate the generated QR code
    if (!validateQRForPDFEmbedding(dataUrl)) {
      throw new QRCodePDFConversionError('Generated QR code failed PDF embedding validation');
    }

    return dataUrl;
  } catch (error) {
    throw new QRCodePDFConversionError(
      'Failed to generate QR code for PDF',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Build QR code URL for an item using configured domain
 * Part of REQ-016: Domain Configuration for QR Links
 * @param publicId Public ID of the item
 * @returns Full URL for the QR code
 */
export function buildQRUrl(publicId: string): string {
  const domain = getQRDomain();
  return `${domain}/item/${publicId}`;
} 