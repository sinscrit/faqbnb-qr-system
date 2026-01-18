/**
 * QR Code related type definitions for the FAQBnB QR Printing System
 * Request #011 - QR Code Printing System for Properties
 */

import { Item } from './index';

/**
 * Configuration options for QR code generation
 */
export interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  signal?: AbortSignal;
}

/**
 * User preferences for QR code printing layout
 */
export interface QRPrintSettings {
  qrSize: 'small' | 'medium' | 'large';
  itemsPerRow: 2 | 3 | 4 | 6;
  showLabels: boolean;
}

/**
 * Extended Item interface for QR printing with generated QR code data
 */
export interface QRPrintItem extends Item {
  qrCodeDataUrl?: string;
  isGenerating?: boolean;
  generationError?: string;
}

/**
 * Configuration options for print layout grid
 */
export interface PrintLayoutOptions {
  gridColumns: number;
  itemSpacing: string;
  pageMargins: string;
  qrCodeSize: string;
  labelFontSize: string;
  pageBreakBehavior: 'auto' | 'avoid' | 'always';
}

/**
 * QR generation batch processing state
 */
export interface QRGenerationState {
  isGenerating: boolean;
  completed: number;
  total: number;
  errors: Array<{
    itemId: string;
    error: string;
  }>;
}

/**
 * QR code cache entry
 */
export interface QRCacheEntry {
  dataUrl: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Print job configuration
 */
export interface PrintJobConfig {
  selectedItemIds: string[];
  settings: QRPrintSettings;
  layoutOptions: PrintLayoutOptions;
  propertyId: string;
  totalPages: number;
} 