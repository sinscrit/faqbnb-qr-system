import QRCode from 'qrcode';
import { QRCodeOptions, QRCacheEntry, QRPrintSettings } from '../types/qrcode';

// QR Code cache for browser storage
const qrCodeCache = new Map<string, QRCacheEntry>();

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  width: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

/**
 * Generate QR code as data URL string
 * @param url - The URL to encode in the QR code
 * @param options - Optional QR code generation options
 * @returns Promise resolving to data URL string
 */
export async function generateQRCode(
  url: string,
  options?: Partial<QRCodeOptions>
): Promise<string> {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided for QR code generation');
    }

    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    const dataUrl = await QRCode.toDataURL(url, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: 'M', // Medium error correction
    });

    return dataUrl;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code with predefined size settings
 * @param url - The URL to encode in the QR code
 * @param size - Predefined size option
 * @returns Promise resolving to data URL string
 */
export async function getQRCodeDataURL(
  url: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): Promise<string> {
  const sizeMap = {
    small: 144,   // 1 inch at 144 DPI
    medium: 216,  // 1.5 inches at 144 DPI
    large: 288,   // 2 inches at 144 DPI
  };

  const options: Partial<QRCodeOptions> = {
    width: sizeMap[size],
    margin: 2,
  };

  return generateQRCode(url, options);
}

/**
 * Cache QR code data URL for later retrieval
 * @param itemId - Unique identifier for the item
 * @param dataUrl - Generated QR code data URL
 */
export function cacheQRCode(itemId: string, dataUrl: string): void {
  try {
    const now = Date.now();
    const cacheEntry: QRCacheEntry = {
      dataUrl,
      timestamp: now,
      expiresAt: now + CACHE_EXPIRATION_MS,
    };
    
    qrCodeCache.set(itemId, cacheEntry);
    
    // Clean up expired entries periodically
    if (qrCodeCache.size > 100) {
      clearExpiredCache();
    }
  } catch (error) {
    console.error('Failed to cache QR code:', error);
  }
}

/**
 * Retrieve cached QR code data URL
 * @param itemId - Unique identifier for the item
 * @returns Cached data URL or null if not found/expired
 */
export function getCachedQRCode(itemId: string): string | null {
  try {
    const cacheEntry = qrCodeCache.get(itemId);
    
    if (!cacheEntry) {
      return null;
    }
    
    // Check if cache entry has expired
    if (Date.now() > cacheEntry.expiresAt) {
      qrCodeCache.delete(itemId);
      return null;
    }
    
    return cacheEntry.dataUrl;
  } catch (error) {
    console.error('Failed to retrieve cached QR code:', error);
    return null;
  }
}

/**
 * Clear all QR code cache entries
 */
export function clearQRCache(): void {
  try {
    qrCodeCache.clear();
    console.log('QR code cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear QR cache:', error);
  }
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache(): void {
  const now = Date.now();
  for (const [itemId, entry] of qrCodeCache.entries()) {
    if (now > entry.expiresAt) {
      qrCodeCache.delete(itemId);
    }
  }
}

/**
 * Validate QR code options
 * @param options - QR code options to validate
 * @returns True if options are valid
 */
export function validateQROptions(options: QRCodeOptions): boolean {
  try {
    // Validate width
    if (!options.width || options.width < 50 || options.width > 1000) {
      console.error('Invalid QR width: must be between 50 and 1000 pixels');
      return false;
    }
    
    // Validate margin
    if (options.margin < 0 || options.margin > 10) {
      console.error('Invalid QR margin: must be between 0 and 10');
      return false;
    }
    
    // Validate colors
    if (!options.color || !options.color.dark || !options.color.light) {
      console.error('Invalid QR colors: both dark and light colors required');
      return false;
    }
    
    // Validate color format (basic hex validation)
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!colorRegex.test(options.color.dark) || !colorRegex.test(options.color.light)) {
      console.error('Invalid QR colors: must be valid hex colors');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating QR options:', error);
    return false;
  }
}

/**
 * Generate QR code with caching and enhanced error handling
 * @param url - The URL to encode in the QR code
 * @param itemId - Optional item ID for caching
 * @param options - Optional QR code generation options
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
 * Generate multiple QR codes in batch with progress tracking
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
    // Process in batches of 5 to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const dataUrl = await generateQRCodeWithCache(item.url, item.id, options);
          results.set(item.id, dataUrl);
          completed++;
          
          if (onProgress) {
            onProgress(completed, total);
          }
        } catch (error) {
          console.error(`Failed to generate QR code for item ${item.id}:`, error);
          // Don't stop the entire batch for one failure
        }
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches to prevent UI blocking
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch QR code generation failed:', error);
    throw error;
  }
} 