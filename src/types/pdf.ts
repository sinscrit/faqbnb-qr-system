/**
 * PDF Type Definitions for REQ-013
 * Professional PDF QR Code Printing System with Vector Cutlines
 * 
 * This module defines comprehensive TypeScript interfaces for PDF-related
 * functionality, providing type safety and clear contracts for all PDF
 * generation operations.
 */

import { RGB } from 'pdf-lib';
import { QRPrintSettings } from './qrcode';

// ================================
// Core PDF Configuration Types
// ================================

/**
 * Supported PDF page formats
 */
export type PDFPageFormat = 'A4' | 'Letter';

/**
 * Measurement unit types for coordinate system
 */
export type MeasurementUnit = 'mm' | 'pt' | 'px' | 'in';

/**
 * Coordinate system configuration for PDF measurements
 */
export interface CoordinateSystem {
  /** Primary unit for measurements */
  primaryUnit: MeasurementUnit;
  /** DPI for pixel-based calculations */
  dpi: number;
  /** Precision for floating-point calculations (decimal places) */
  precision: number;
}

/**
 * PDF export settings extending QR print settings with PDF-specific options
 */
export interface PDFExportSettings extends QRPrintSettings {
  /** Page format (A4 or Letter) */
  pageFormat: PDFPageFormat;
  /** Margin size in millimeters */
  margins: number;
  /** QR code size in millimeters */
  qrSize: number;
  /** Whether to include cutlines in the PDF */
  includeCutlines: boolean;
  /** Whether to include item labels in the PDF */
  includeLabels: boolean;
  /** Number of columns per page (calculated from layout) */
  columns?: number;
  /** Number of rows per page (calculated from layout) */
  rows?: number;
  /** Total items per page (calculated from layout) */
  itemsPerPage?: number;
}

// ================================
// Page and Layout Types
// ================================

/**
 * PDF page dimensions in points
 */
export interface PageDimensions {
  /** Page width in points */
  width: number;
  /** Page height in points */
  height: number;
}

/**
 * Usable area within page margins
 */
export interface UsableArea {
  /** Usable width in points */
  width: number;
  /** Usable height in points */
  height: number;
  /** Left margin in points */
  leftMargin: number;
  /** Right margin in points */
  rightMargin: number;
  /** Top margin in points */
  topMargin: number;
  /** Bottom margin in points */
  bottomMargin: number;
}

/**
 * Margin configuration for all sides of a page
 */
export interface PageMargins {
  /** Top margin in points */
  top: number;
  /** Right margin in points */
  right: number;
  /** Bottom margin in points */
  bottom: number;
  /** Left margin in points */
  left: number;
}

/**
 * Complete grid layout configuration for QR code positioning
 */
export interface GridLayout {
  /** Page width in points */
  pageWidth: number;
  /** Page height in points */
  pageHeight: number;
  /** Usable width (page width minus margins) in points */
  usableWidth: number;
  /** Usable height (page height minus margins) in points */
  usableHeight: number;
  /** QR code size in points */
  qrSize: number;
  /** Number of columns in the grid */
  columns: number;
  /** Number of rows in the grid */
  rows: number;
  /** Maximum items per page */
  itemsPerPage: number;
  /** Page margins configuration */
  margins: PageMargins;
}

/**
 * Position of a specific cell in the grid
 */
export interface CellPosition {
  /** X coordinate in points */
  x: number;
  /** Y coordinate in points */
  y: number;
  /** Row index (0-based) */
  row: number;
  /** Column index (0-based) */
  col: number;
}

/**
 * Coordinate point with X and Y values
 */
export interface CoordinatePoint {
  /** X coordinate in points */
  x: number;
  /** Y coordinate in points */
  y: number;
}

// ================================
// Cutline and Drawing Types
// ================================

/**
 * Dash pattern configuration for line drawing
 */
export interface DashPattern {
  /** Array of numbers representing dash pattern (e.g., [4, 4] for 4pt on/4pt off) */
  pattern: number[];
  /** Phase offset for the dash pattern */
  phase: number;
}

/**
 * Line drawing options for cutlines
 */
export interface LineOptions {
  /** Stroke width in points (0.5-1pt recommended) */
  strokeWidth: number;
  /** Line color (RGB object) */
  color: RGB;
  /** Dash pattern configuration */
  dashPattern?: DashPattern;
}

/**
 * Grid boundaries containing line coordinates
 */
export interface GridBoundaries {
  /** Array of X coordinates for vertical column lines */
  columnLines: number[];
  /** Array of Y coordinates for horizontal row lines */
  rowLines: number[];
}

/**
 * Options for cutline grid generation
 */
export interface CutlineGridOptions {
  /** Line drawing options (stroke width, color, dash pattern) */
  lineOptions?: LineOptions;
  /** Whether to draw border lines around the entire grid */
  drawBorder?: boolean;
  /** Whether to extend lines to page margins */
  extendToMargins?: boolean;
  /** Number of actual items on this page (for partial pages) */
  actualItemCount?: number;
}

/**
 * Options for multi-page cutline generation
 */
export interface MultiPageCutlineOptions extends CutlineGridOptions {
  /** Total number of items across all pages */
  totalItemCount?: number;
  /** Items per page (derived from layout if not specified) */
  itemsPerPage?: number;
}

// ================================
// Multi-Page Document Types
// ================================

/**
 * Information about a specific page in a multi-page document
 */
export interface PageInfo {
  /** Page number (1-based) */
  pageNumber: number;
  /** Total number of pages in document */
  totalPages: number;
  /** Number of items on this specific page */
  itemsOnPage: number;
  /** Starting item index for this page (0-based) */
  startItemIndex: number;
  /** Ending item index for this page (0-based, inclusive) */
  endItemIndex: number;
  /** Whether this is a partial page (fewer items than full capacity) */
  isPartialPage: boolean;
}

/**
 * Document structure information for multi-page PDFs
 */
export interface DocumentStructure {
  /** Total number of items across all pages */
  totalItems: number;
  /** Items per page capacity */
  itemsPerPage: number;
  /** Total number of pages required */
  totalPages: number;
  /** Array of page information for each page */
  pages: PageInfo[];
}

// ================================
// QR Code Integration Types
// ================================

/**
 * QR code format options for PDF embedding
 */
export type QRCodeFormat = 'PNG' | 'JPEG' | 'SVG';

/**
 * QR code image data for PDF embedding
 */
export interface QRCodeImageData {
  /** Image data as base64 string or binary data */
  data: string | Uint8Array;
  /** Image format */
  format: QRCodeFormat;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
}

/**
 * QR code positioning information within PDF
 */
export interface QRCodePlacement {
  /** QR code image data */
  imageData: QRCodeImageData;
  /** Position within the grid */
  position: CellPosition;
  /** Optional label text */
  label?: string;
  /** Label position relative to QR code */
  labelPosition?: 'above' | 'below' | 'left' | 'right';
}

/**
 * Complete QR code layout for a single page
 */
export interface QRCodePageLayout {
  /** Page information */
  pageInfo: PageInfo;
  /** Grid layout configuration */
  gridLayout: GridLayout;
  /** Array of QR code placements on this page */
  qrPlacements: QRCodePlacement[];
  /** Grid boundaries for cutlines */
  gridBoundaries: GridBoundaries;
}

// ================================
// Validation and Error Types
// ================================

/**
 * Result of coordinate validation operations
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * PDF generation error with context
 */
export interface PDFGenerationError {
  /** Error message */
  message: string;
  /** Error code for programmatic handling */
  code: string;
  /** Additional context about the error */
  context?: Record<string, unknown>;
  /** Original error if this wraps another error */
  cause?: Error;
}

/**
 * Result of PDF generation operation
 */
export interface PDFGenerationResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Generated PDF as binary data */
  pdfData?: Uint8Array;
  /** Error information if generation failed */
  error?: PDFGenerationError;
  /** Generation metadata */
  metadata?: {
    /** Total pages generated */
    totalPages: number;
    /** Total items processed */
    totalItems: number;
    /** Generation time in milliseconds */
    generationTime: number;
    /** PDF file size in bytes */
    fileSize: number;
  };
}

// ================================
// Utility Types
// ================================

/**
 * Deep partial type for optional configuration
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required fields from a type
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional fields from a type
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ================================
// Constants and Defaults
// ================================

/**
 * Standard page formats with dimensions in points
 */
export const PAGE_FORMATS: Record<PDFPageFormat, PageDimensions> = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 }
} as const;

/**
 * Default PDF export settings
 */
export const DEFAULT_PDF_EXPORT_SETTINGS: PDFExportSettings = {
  // QRPrintSettings defaults
  qrSize: 'medium',
  itemsPerRow: 4,
  showLabels: true,
  
  // PDF-specific defaults
  pageFormat: 'A4',
  includeCutlines: true,
  includeBorder: true,
  marginSize: 20, // 20mm margins
  qrSizeMm: 40, // 40mm QR codes
  extendLinesToMargins: true,
  pdfTitle: 'QR Code Print Sheet',
  pdfCreator: 'FAQBNB QR Code System'
} as const;

/**
 * Default coordinate system configuration
 */
export const DEFAULT_COORDINATE_SYSTEM: CoordinateSystem = {
  primaryUnit: 'pt',
  dpi: 72,
  precision: 6
} as const;

/**
 * Default cutline line options
 */
export const DEFAULT_CUTLINE_OPTIONS: LineOptions = {
  strokeWidth: 0.75,
  color: { red: 0.6, green: 0.6, blue: 0.6 }, // #999999 gray
  dashPattern: { pattern: [4, 4], phase: 0 }
} as const;