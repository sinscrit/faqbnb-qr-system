// TypeScript declarations for pdf_generator_module.js

export interface QRCodeData {
  id: string;
  label: string;
  imageData?: Buffer | string | null; // Pre-generated QR code image (Buffer or base64 string)
}

export interface PDFConfig {
  paperSize?: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'Letter' | 'Legal' | 'Tabloid' | 'Ledger';
  margin?: 'none' | 'thin' | 'standard' | 'large' | string;
  qrCodeCount?: number;
  qrCodesPerRow?: number;
  qrCodeSize?: 'small' | 'medium' | 'large' | string;
  qrBoxMargin?: string | null; // If null, use adaptive grid layout; if specified, use fixed box layout
  showCutlines?: boolean;
  debug?: boolean; // If false, hide visual debug guides (borders, margin boxes)
  title?: string; // Optional title to display at top of PDF
  outputFileName?: string; // Deprecated: use pdfOutput parameter instead
  qrCodes?: QRCodeData[];
}

export interface PDFOutputConfig {
  type: 'file' | 'blob';
  path?: string; // Directory path or full file path (required for type='file')
  name?: string; // Filename or pattern with * for epoch (e.g., 'qr-codes*.pdf')
}

export interface PDFGenerationResult {
  success: boolean;
  type: 'file' | 'blob';
  outputPath?: string; // Only present for type='file'
  data?: Buffer; // Only present for type='blob'
  size?: number; // Only present for type='blob'
  error?: string;
  config: PDFConfig;
}

/**
 * Generate PDFs from JSON string configuration
 * @param jsonString - JSON string containing array of configurations
 * @param pdfOutput - PDF output configuration
 * @returns Array of generation results
 */
export function generatePDFsFromJSON(
  jsonString: string, 
  pdfOutput?: PDFOutputConfig
): Promise<PDFGenerationResult[]>;

/**
 * Generate a single PDF from a configuration object
 * @param config - Configuration object
 * @param pdfOutput - PDF output configuration
 * @returns Generation result
 */
export function generateSinglePDF(
  config: PDFConfig, 
  pdfOutput?: PDFOutputConfig
): Promise<PDFGenerationResult>;

/**
 * Generate PDF and return as Buffer (for web applications)
 * @param config - Configuration object
 * @returns PDF as Buffer
 */
export function generatePDFBuffer(config: PDFConfig): Promise<Buffer>;

/**
 * Generate QR code as PNG buffer (external helper function)
 * @param data - Data to encode in QR code
 * @param size - Size in pixels for the QR code
 * @returns QR code as PNG buffer, or null if generation fails
 */
export function generateQRCodeBuffer(data: string, size?: number): Promise<Buffer | null>;

/**
 * Convert various units to points
 * @param value - Value with unit (e.g., "1cm", "1in", "1mm") or number
 * @returns Value in points
 */
export function convertToPoints(value: string | number): number;

/**
 * Get paper size in points
 * @param size - Paper size name
 * @returns [width, height] in points
 */
export function getPaperSize(size: string): [number, number];

/**
 * Get margin size in points
 * @param marginType - Margin type or custom value
 * @param paperSize - Paper dimensions [width, height]
 * @returns Margin size in points
 */
export function getMarginSize(marginType: string, paperSize: [number, number]): number;

/**
 * Get QR code size in points
 * @param sizeType - Size type or custom value
 * @param availableSpace - Available space for scaling
 * @returns QR code size in points
 */
export function getQRCodeSize(sizeType: string, availableSpace: number): number;