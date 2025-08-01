import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LinkType, QRPrintSettings } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLinkTypeIcon(linkType: LinkType): string {
  switch (linkType) {
    case 'youtube':
      return '🎥';
    case 'pdf':
      return '📄';
    case 'image':
      return '🖼️';
    case 'text':
      return '🔗';
    default:
      return '📎';
  }
}

export function getLinkTypeColor(linkType: LinkType): string {
  switch (linkType) {
    case 'youtube':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pdf':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'image':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'text':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getYoutubeThumbnail(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Download a blob as a file with the specified filename
 * @param blob - The blob data to download
 * @param filename - The filename for the downloaded file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body temporarily to trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download blob:', error);
    throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format a date for printing purposes
 * @param date - Date string or Date object
 * @returns Formatted date string suitable for printing
 */
export function formatPrintableDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting printable date:', error);
    return 'Invalid Date';
  }
}

/**
 * Validate QR print settings
 * @param settings - Print settings to validate
 * @returns True if settings are valid
 */
export function validatePrintSettings(settings: QRPrintSettings): boolean {
  try {
    // Validate QR size
    const validSizes = ['small', 'medium', 'large'] as const;
    if (!validSizes.includes(settings.qrSize)) {
      console.error('Invalid QR size: must be small, medium, or large');
      return false;
    }
    
    // Validate items per row
    const validItemsPerRow = [2, 3, 4, 6] as const;
    if (!validItemsPerRow.includes(settings.itemsPerRow)) {
      console.error('Invalid items per row: must be 2, 3, 4, or 6');
      return false;
    }
    
    // Validate showLabels is boolean
    if (typeof settings.showLabels !== 'boolean') {
      console.error('Invalid showLabels: must be boolean');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating print settings:', error);
    return false;
  }
}

/**
 * Get CSS class names for QR size
 * @param size - QR code size
 * @returns CSS class string for the size
 */
export function getQRSizeClass(size: 'small' | 'medium' | 'large'): string {
  switch (size) {
    case 'small':
      return 'w-24 h-24'; // 6rem = 96px ≈ 144px at print DPI
    case 'medium':
      return 'w-32 h-32'; // 8rem = 128px ≈ 216px at print DPI
    case 'large':
      return 'w-40 h-40'; // 10rem = 160px ≈ 288px at print DPI
    default:
      return 'w-32 h-32';
  }
}

/**
 * Get grid columns class for items per row setting
 * @param itemsPerRow - Number of items per row
 * @returns CSS grid columns class
 */
export function getGridColumnsClass(itemsPerRow: 2 | 3 | 4 | 6): string {
  switch (itemsPerRow) {
    case 2:
      return 'grid-cols-2';
    case 3:
      return 'grid-cols-3';
    case 4:
      return 'grid-cols-4';
    case 6:
      return 'grid-cols-6';
    default:
      return 'grid-cols-3';
  }
}

/**
 * Calculate estimated print pages for given items and settings
 * @param itemCount - Number of items to print
 * @param itemsPerRow - Items per row setting
 * @param itemsPerPage - Optional items per page (default: calculated based on layout)
 * @returns Estimated number of pages
 */
export function calculatePrintPages(
  itemCount: number, 
  itemsPerRow: 2 | 3 | 4 | 6,
  itemsPerPage?: number
): number {
  try {
    if (itemCount <= 0) return 0;
    
    // Estimate rows per page based on QR size and page height
    // Assuming standard 8.5x11" page with margins
    const estimatedRowsPerPage = itemsPerPage ? Math.floor(itemsPerPage / itemsPerRow) : 
      itemsPerRow === 2 ? 8 :  // 2 cols = larger QR codes = fewer rows
      itemsPerRow === 3 ? 10 : // 3 cols = medium QR codes
      itemsPerRow === 4 ? 12 : // 4 cols = smaller QR codes
      14; // 6 cols = smallest QR codes
    
    const totalItemsPerPage = estimatedRowsPerPage * itemsPerRow;
    
    return Math.ceil(itemCount / totalItemsPerPage);
  } catch (error) {
    console.error('Error calculating print pages:', error);
    return 1;
  }
}

