/**
 * Core PDF Generation Utilities for REQ-013
 * Professional PDF QR Code Printing System with Vector Cutlines
 * 
 * This module provides foundation utilities for PDF document creation and management
 * with mathematical precision required for professional printing.
 */

import { PDFDocument, PageSizes, rgb, PDFPage, PDFImage, PDFFont, StandardFonts } from 'pdf-lib';
import { convertQRCodeForPDF, validateQRForPDFEmbedding, getQRImageFormat, generateQRCodeForPDF } from './qrcode-utils';
import { 
  calculateGridLayout, 
  getQRCellPosition, 
  calculateTotalPages, 
  getAllItemPositions,
  getStandardPageLayout,
  convertMillimetersToPoints
} from './pdf-geometry';
import { 
  generateCutlineGrid, 
  addAllPagesCutlines, 
  DEFAULT_CUTLINE_GRID_OPTIONS
} from './pdf-cutlines';
import { PDFExportSettings } from '../types/pdf';

/**
 * Supported page formats for PDF generation
 */
export type PDFPageFormat = 'A4' | 'Letter';

/**
 * Configuration interface for PDF document creation
 */
export interface PDFDocumentConfig {
  pageFormat: PDFPageFormat;
  margins: number; // in millimeters
  title?: string;
  creator?: string;
  subject?: string;
}

/**
 * Error types for PDF generation failures
 */
export class PDFGenerationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'PDFGenerationError';
  }
}

/**
 * Creates a new PDF document with specified page format and margins
 * 
 * @param pageFormat - Either 'A4' or 'Letter' page format
 * @param margins - Margin size in millimeters (default: 10mm)
 * @returns Promise resolving to configured PDFDocument
 * 
 * @example
 * ```typescript
 * const doc = await createPDFDocument('A4', 10);
 * ```
 */
export async function createPDFDocument(
  pageFormat: PDFPageFormat, 
  margins: number = 10
): Promise<PDFDocument> {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Set document metadata
    pdfDoc.setTitle('QR Code Print Sheet');
    pdfDoc.setCreator('FAQBNB QR Code System');
    pdfDoc.setSubject('Professional QR Code Layout with Vector Cutlines');
    pdfDoc.setKeywords(['QR Code', 'Printing', 'Vector Graphics', 'Cutlines']);
    pdfDoc.setProducer('pdf-lib');
    
    // Set creation and modification dates
    const now = new Date();
    pdfDoc.setCreationDate(now);
    pdfDoc.setModificationDate(now);
    
    return pdfDoc;
    
  } catch (error) {
    throw new PDFGenerationError(
      `Failed to create PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Converts PDF document to Blob for download
 * 
 * @param pdfBytes - Generated PDF bytes from PDFDocument.save()
 * @param filename - Desired filename for the download
 * @returns Blob object ready for download
 * 
 * @example
 * ```typescript
 * const pdfBytes = await pdfDoc.save();
 * const blob = convertPDFToBlob(pdfBytes, 'qr-codes.pdf');
 * ```
 */
export function convertPDFToBlob(pdfBytes: Uint8Array, filename: string): Blob {
  try {
    // Validate inputs
    if (!pdfBytes || pdfBytes.length === 0) {
      throw new PDFGenerationError('PDF bytes are empty or invalid');
    }
    
    if (!filename || !filename.trim()) {
      throw new PDFGenerationError('Filename is required');
    }
    
    // Ensure filename has .pdf extension
    const sanitizedFilename = filename.trim();
    const finalFilename = sanitizedFilename.endsWith('.pdf') 
      ? sanitizedFilename 
      : `${sanitizedFilename}.pdf`;
    
    // Create blob with proper MIME type
    const blob = new Blob([pdfBytes], { 
      type: 'application/pdf' 
    });
    
    // Attach filename metadata (some browsers use this)
    Object.defineProperty(blob, 'name', {
      value: finalFilename,
      writable: false
    });
    
    return blob;
    
  } catch (error) {
    throw new PDFGenerationError(
      `Failed to convert PDF to blob: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Triggers browser download of PDF blob
 * 
 * @param blob - PDF blob to download
 * @param filename - Filename for the download
 * 
 * @example
 * ```typescript
 * const blob = convertPDFToBlob(pdfBytes, 'qr-codes.pdf');
 * downloadPDFBlob(blob, 'qr-codes.pdf');
 * ```
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  try {
    // Validate browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new PDFGenerationError('Download functionality only available in browser environment');
    }
    
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    throw new PDFGenerationError(
      `Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Validates PDF document integrity
 * 
 * @param pdfBytes - PDF bytes to validate
 * @returns true if PDF is valid, false otherwise
 */
export function validatePDFIntegrity(pdfBytes: Uint8Array): boolean {
  try {
    // Check minimum size
    if (pdfBytes.length < 100) {
      return false;
    }
    
    // Check PDF header
    const header = new TextDecoder().decode(pdfBytes.slice(0, 8));
    if (!header.startsWith('%PDF-')) {
      return false;
    }
    
    // Check for EOF marker (basic validation)
    const end = new TextDecoder().decode(pdfBytes.slice(-20));
    if (!end.includes('%%EOF')) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    return false;
  }
}

/**
 * Gets page dimensions for different formats in points
 * 
 * @param pageFormat - Page format to get dimensions for
 * @returns Object with width and height in points
 */
export function getPageDimensions(pageFormat: PDFPageFormat): { width: number; height: number } {
  switch (pageFormat) {
    case 'A4':
      return { width: PageSizes.A4[0], height: PageSizes.A4[1] }; // 595.28 × 841.89 points
    case 'Letter':
      return { width: PageSizes.Letter[0], height: PageSizes.Letter[1] }; // 612 × 792 points
    default:
      throw new PDFGenerationError(`Unsupported page format: ${pageFormat}`);
  }
}

/**
 * Creates a new page with specified format and adds it to the document
 * 
 * @param pdfDoc - PDF document to add page to
 * @param pageFormat - Page format for the new page
 * @returns The created PDF page
 */
export function addPDFPage(pdfDoc: PDFDocument, pageFormat: PDFPageFormat): PDFPage {
  try {
    const dimensions = getPageDimensions(pageFormat);
    const page = pdfDoc.addPage([dimensions.width, dimensions.height]);
    return page;
    
  } catch (error) {
    throw new PDFGenerationError(
      `Failed to add page: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

// ================================
// QR Code Embedding Functions - REQ-013
// ================================

/**
 * Options for QR code embedding in PDF
 */
export interface QRCodeEmbedOptions {
  /** QR code size in points (if different from calculated) */
  size?: number;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Opacity (0-1) for the QR code */
  opacity?: number;
  /** Rotation angle in degrees */
  rotation?: number;
}

/**
 * Result of QR code embedding operation
 */
export interface QRCodeEmbedResult {
  /** Whether embedding was successful */
  success: boolean;
  /** Actual position where QR code was placed */
  position: { x: number; y: number };
  /** Actual size of the embedded QR code */
  size: { width: number; height: number };
  /** Error message if embedding failed */
  error?: string;
}

/**
 * Validates QR code embedding parameters
 * 
 * @param page - PDF page to embed QR code on
 * @param x - X coordinate in points
 * @param y - Y coordinate in points  
 * @param size - QR code size in points
 * @throws PDFGenerationError if parameters are invalid
 */
export function validateQRCodeEmbedding(
  page: PDFPage,
  x: number,
  y: number,
  size: number
): void {
  const DEBUG_PREFIX = "🔍 PDF_DEBUG_013:";
  console.log(`${DEBUG_PREFIX} VALIDATE_QR_CODE_EMBEDDING_ENTRY:`, {
    step: 'validateQRCodeEmbedding called',
    hasPage: !!page,
    x, y, size,
    xType: typeof x,
    yType: typeof y,
    sizeType: typeof size,
    sizeIsFinite: Number.isFinite(size),
    sizeIsPositive: size > 0,
    sizeValue: size
  });

  if (!page) {
    throw new PDFGenerationError('PDF page is required for QR code embedding');
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new PDFGenerationError('QR code position coordinates must be finite numbers');
  }

  if (!Number.isFinite(size) || size <= 0) {
    throw new PDFGenerationError('QR code size must be a positive finite number');
  }

  // Check if QR code fits within page bounds
  const pageSize = page.getSize();
  if (x < 0 || y < 0) {
    throw new PDFGenerationError('QR code position cannot be negative');
  }

  if (x + size > pageSize.width) {
    throw new PDFGenerationError(
      `QR code extends beyond page width (${x + size} > ${pageSize.width})`
    );
  }

  if (y + size > pageSize.height) {
    throw new PDFGenerationError(
      `QR code extends beyond page height (${y + size} > ${pageSize.height})`
    );
  }
}

/**
 * Embeds a QR code image into a PDF document at specified coordinates
 * 
 * @param doc - PDF document to embed QR code into
 * @param qrDataUrl - QR code as base64 data URL
 * @param x - X coordinate in points (from bottom-left origin)
 * @param y - Y coordinate in points (from bottom-left origin)
 * @param size - QR code size in points
 * @param options - Additional embedding options
 * @returns Result of the embedding operation
 * 
 * @example
 * ```typescript
 * const result = await addQRCodeToPDF(doc, qrDataUrl, 100, 100, 80);
 * if (result.success) {
 *   console.log('QR code embedded successfully');
 * }
 * ```
 */
export async function addQRCodeToPDF(
  doc: PDFDocument,
  qrDataUrl: string,
  x: number,
  y: number,
  size: number,
  options: QRCodeEmbedOptions = {}
): Promise<QRCodeEmbedResult> {
  try {
    if (!doc) {
      throw new PDFGenerationError('PDF document is required');
    }

    // Validate and convert QR code data
    if (!validateQRForPDFEmbedding(qrDataUrl)) {
      throw new PDFGenerationError('Invalid QR code data URL for PDF embedding');
    }

    const pages = doc.getPages();
    if (pages.length === 0) {
      throw new PDFGenerationError('PDF document has no pages');
    }

    // Use the last page by default
    const page = pages[pages.length - 1];
    
    // Validate embedding parameters
    const finalSize = options.size || size;
    validateQRCodeEmbedding(page, x, y, finalSize);

    // Convert QR code to binary data
    const imageData = convertQRCodeForPDF(qrDataUrl);
    
    // Determine image format and embed accordingly
    const imageFormat = getQRImageFormat(qrDataUrl);
    let embeddedImage: PDFImage;

    if (imageFormat === 'png') {
      embeddedImage = await doc.embedPng(imageData);
    } else if (imageFormat === 'jpeg' || imageFormat === 'jpg') {
      embeddedImage = await doc.embedJpg(imageData);
    } else {
      throw new PDFGenerationError(`Unsupported image format: ${imageFormat}`);
    }

    // Calculate final dimensions
    const aspectRatio = embeddedImage.width / embeddedImage.height;
    let finalWidth = finalSize;
    let finalHeight = finalSize;

    if (options.maintainAspectRatio !== false && aspectRatio !== 1) {
      // For QR codes, we usually want to maintain square aspect ratio
      // but if the image isn't square, maintain its aspect ratio
      if (aspectRatio > 1) {
        finalHeight = finalSize / aspectRatio;
      } else {
        finalWidth = finalSize * aspectRatio;
      }
    }

    // Draw the QR code on the page
    page.drawImage(embeddedImage, {
      x: x,
      y: y,
      width: finalWidth,
      height: finalHeight,
      opacity: options.opacity || 1.0,
      // rotate: options.rotation ? { type: 'degrees', angle: options.rotation } : undefined
    });

    return {
      success: true,
      position: { x, y },
      size: { width: finalWidth, height: finalHeight }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during QR code embedding';
    
    return {
      success: false,
      position: { x, y },
      size: { width: size, height: size },
      error: errorMessage
    };
  }
}

/**
 * Embeds a QR code on a specific page at specified coordinates
 * 
 * @param page - PDF page to embed QR code on
 * @param doc - PDF document (needed for image embedding)
 * @param qrDataUrl - QR code as base64 data URL
 * @param x - X coordinate in points
 * @param y - Y coordinate in points
 * @param size - QR code size in points
 * @param options - Additional embedding options
 * @returns Result of the embedding operation
 */
export async function addQRCodeToPage(
  page: PDFPage,
  doc: PDFDocument,
  qrDataUrl: string,
  x: number,
  y: number,
  size: number,
  options: QRCodeEmbedOptions = {}
): Promise<QRCodeEmbedResult> {
  const DEBUG_PREFIX = "🔍 PDF_DEBUG_013:"; // Define locally in case it's not accessible
  
  // IMMEDIATELY LOG FUNCTION ENTRY TO TRACE CALLS
  console.log(`${DEBUG_PREFIX} ADDQRCODETOPAGE_FUNCTION_ENTRY:`, {
    functionName: 'addQRCodeToPage',
    calledWith: { x, y, size },
    sizeType: typeof size,
    sizeIsUndefined: size === undefined,
    sizeIsNull: size === null,
    sizeIsNaN: isNaN(size),
    sizeIsFinite: Number.isFinite(size),
    stackTrace: new Error().stack?.split('\n').slice(1, 5)
  });
  
  try {
    console.log(`${DEBUG_PREFIX} addQRCodeToPage START:`, {
      hasPage: !!page,
      hasDoc: !!doc,
      x, y, size,
      qrDataUrlValid: !!qrDataUrl,
      qrDataUrlLength: qrDataUrl?.length,
      qrDataUrlStart: qrDataUrl?.substring(0, 30) + '...'
    });

    if (!page || !doc) {
      throw new PDFGenerationError('Both PDF page and document are required');
    }

    // Validate and convert QR code data
    const isValidQR = validateQRForPDFEmbedding(qrDataUrl);
    console.log(`${DEBUG_PREFIX} QR_VALIDATION:`, { isValidQR, qrDataUrl: qrDataUrl?.substring(0, 50) + '...' });
    
    if (!isValidQR) {
      throw new PDFGenerationError('Invalid QR code data URL for PDF embedding');
    }

    console.log(`${DEBUG_PREFIX} ADDQRCODETOPAGE_PARAM_VALIDATION:`, {
      step: 'Inside addQRCodeToPage - checking parameters',
      x, y, size,
      sizeType: typeof size,
      sizeIsNumber: typeof size === 'number',
      sizeIsFinite: Number.isFinite(size),
      sizeIsPositive: size > 0,
      optionsSize: options.size,
      optionsSizeType: typeof options.size
    });

    // Validate embedding parameters
    const finalSize = options.size || size;
    
    console.log(`${DEBUG_PREFIX} ADDQRCODETOPAGE_FINAL_SIZE:`, { 
      step: 'After calculating finalSize',
      originalSize: size, 
      optionsSize: options.size,
      finalSize,
      finalSizeType: typeof finalSize,
      finalSizeIsNumber: typeof finalSize === 'number',
      finalSizeIsFinite: Number.isFinite(finalSize),
      finalSizeIsPositive: finalSize > 0
    });
    
    // DEBUG: Capture page bounds before validation
    const pageSize = page.getSize();
    console.log(`${DEBUG_PREFIX} BOUNDS_CHECK:`, { 
      pageWidth: pageSize.width,
      pageHeight: pageSize.height,
      qrX: x,
      qrY: y,
      qrSize: finalSize,
      wouldExtendWidth: x + finalSize > pageSize.width,
      wouldExtendHeight: y + finalSize > pageSize.height,
      rightEdge: x + finalSize,
      topEdge: y + finalSize
    });
    
    validateQRCodeEmbedding(page, x, y, finalSize);

    // Convert QR code to binary data
    console.log(`${DEBUG_PREFIX} CONVERTING_QR_DATA...`);
    console.log(`${DEBUG_PREFIX} QR_DATA_URL_SAMPLE:`, { 
      fullLength: qrDataUrl.length,
      prefix: qrDataUrl.substring(0, 100),
      containsBase64: qrDataUrl.includes(';base64,'),
      startsWithDataImage: qrDataUrl.startsWith('data:image/')
    });
    
    const imageData = convertQRCodeForPDF(qrDataUrl);
    console.log(`${DEBUG_PREFIX} QR_DATA_CONVERTED:`, { 
      imageDataLength: imageData.length,
      imageDataType: typeof imageData,
      isUint8Array: imageData instanceof Uint8Array,
      firstFewBytes: Array.from(imageData.slice(0, 10))
    });
    
    // Determine image format and embed accordingly
    const imageFormat = getQRImageFormat(qrDataUrl);
    console.log(`${DEBUG_PREFIX} IMAGE_FORMAT:`, { 
      imageFormat,
      detectedFrom: qrDataUrl.substring(0, 50)
    });
    let embeddedImage: PDFImage;

    try {
      if (imageFormat === 'png') {
        console.log(`${DEBUG_PREFIX} EMBEDDING_PNG...`);
        embeddedImage = await doc.embedPng(imageData);
        console.log(`${DEBUG_PREFIX} PNG_EMBED_SUCCESS`);
      } else if (imageFormat === 'jpeg' || imageFormat === 'jpg') {
        console.log(`${DEBUG_PREFIX} EMBEDDING_JPG...`);
        embeddedImage = await doc.embedJpg(imageData);
        console.log(`${DEBUG_PREFIX} JPG_EMBED_SUCCESS`);
      } else {
        throw new PDFGenerationError(`Unsupported image format: ${imageFormat}`);
      }
    } catch (embedError) {
      console.error(`${DEBUG_PREFIX} EMBED_ERROR:`, {
        error: embedError instanceof Error ? embedError.message : embedError,
        imageFormat,
        imageDataLength: imageData.length
      });
      throw embedError;
    }

    console.log(`${DEBUG_PREFIX} IMAGE_EMBEDDED:`, {
      width: embeddedImage.width,
      height: embeddedImage.height
    });

    // Calculate final dimensions
    const aspectRatio = embeddedImage.width / embeddedImage.height;
    let finalWidth = finalSize;
    let finalHeight = finalSize;

    if (options.maintainAspectRatio !== false && aspectRatio !== 1) {
      if (aspectRatio > 1) {
        finalHeight = finalSize / aspectRatio;
      } else {
        finalWidth = finalSize * aspectRatio;
      }
    }

    console.log(`${DEBUG_PREFIX} FINAL_DIMENSIONS:`, {
      finalWidth, finalHeight, aspectRatio, x, y
    });

    // Draw the QR code on the specific page
    console.log(`${DEBUG_PREFIX} DRAWING_IMAGE...`);
    page.drawImage(embeddedImage, {
      x: x,
      y: y,
      width: finalWidth,
      height: finalHeight,
      opacity: options.opacity || 1.0,
      // rotate: options.rotation ? { type: 'degrees', angle: options.rotation } : undefined
    });
    
    console.log(`${DEBUG_PREFIX} IMAGE_DRAWN_SUCCESSFULLY`);

    return {
      success: true,
      position: { x, y },
      size: { width: finalWidth, height: finalHeight }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during QR code embedding';
    
    return {
      success: false,
      position: { x, y },
      size: { width: size, height: size },
      error: errorMessage
    };
  }
}

/**
 * Embeds multiple QR codes on a page at specified positions
 * 
 * @param page - PDF page to embed QR codes on
 * @param doc - PDF document (needed for image embedding)
 * @param qrCodes - Array of QR code placement data
 * @returns Array of embedding results
 */
export async function addMultipleQRCodesToPage(
  page: PDFPage,
  doc: PDFDocument,
  qrCodes: Array<{
    dataUrl: string;
    x: number;
    y: number;
    size: number;
    options?: QRCodeEmbedOptions;
  }>
): Promise<QRCodeEmbedResult[]> {
  if (!page || !doc) {
    throw new PDFGenerationError('Both PDF page and document are required');
  }

  if (!Array.isArray(qrCodes) || qrCodes.length === 0) {
    throw new PDFGenerationError('QR codes array is required and must not be empty');
  }

  const results: QRCodeEmbedResult[] = [];

  // Process QR codes sequentially to avoid concurrent access issues
  for (const qrCode of qrCodes) {
    try {
      const result = await addQRCodeToPage(
        page,
        doc,
        qrCode.dataUrl,
        qrCode.x,
        qrCode.y,
        qrCode.size,
        qrCode.options || {}
      );
      results.push(result);
    } catch (error) {
      // Add failed result but continue with other QR codes
      results.push({
        success: false,
        position: { x: qrCode.x, y: qrCode.y },
        size: { width: qrCode.size, height: qrCode.size },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

/**
 * Gets the optimal QR code size for embedding based on page dimensions
 * 
 * @param page - PDF page to calculate size for
 * @param columns - Number of columns in the grid
 * @param rows - Number of rows in the grid
 * @param marginPercentage - Margin as percentage of page size (0-1)
 * @returns Optimal QR code size in points
 */
export function calculateOptimalQRSize(
  page: PDFPage,
  columns: number,
  rows: number,
  marginPercentage: number = 0.1
): number {
  if (!page) {
    throw new PDFGenerationError('PDF page is required for size calculation');
  }

  if (!Number.isInteger(columns) || columns <= 0) {
    throw new PDFGenerationError('Columns must be a positive integer');
  }

  if (!Number.isInteger(rows) || rows <= 0) {
    throw new PDFGenerationError('Rows must be a positive integer');
  }

  if (marginPercentage < 0 || marginPercentage > 0.5) {
    throw new PDFGenerationError('Margin percentage must be between 0 and 0.5');
  }

  const pageSize = page.getSize();
  const usableWidth = pageSize.width * (1 - 2 * marginPercentage);
  const usableHeight = pageSize.height * (1 - 2 * marginPercentage);

  const maxSizeByWidth = usableWidth / columns;
  const maxSizeByHeight = usableHeight / rows;

  return Math.min(maxSizeByWidth, maxSizeByHeight);
}

// ================================
// Label Positioning Functions - REQ-013
// ================================

/**
 * Position options for QR code labels
 */
export type LabelPosition = 'above' | 'below' | 'left' | 'right' | 'inside-bottom' | 'inside-top';

/**
 * Options for QR code label styling and positioning
 */
export interface QRLabelOptions {
  /** Label position relative to QR code */
  position?: LabelPosition;
  /** Font size in points (auto-calculated if not specified) */
  fontSize?: number;
  /** Text color (default: black) */
  color?: { red: number; green: number; blue: number };
  /** Font family (default: Helvetica) */
  font?: 'Helvetica' | 'TimesRoman' | 'Courier';
  /** Maximum width for text wrapping in points */
  maxWidth?: number;
  /** Line spacing multiplier (default: 1.2) */
  lineSpacing?: number;
  /** Horizontal alignment */
  alignment?: 'left' | 'center' | 'right';
  /** Padding from QR code or cell boundaries in points */
  padding?: number;
}

/**
 * Result of label positioning operation
 */
export interface LabelPositionResult {
  /** Whether positioning was successful */
  success: boolean;
  /** Actual position where label was placed */
  position: { x: number; y: number };
  /** Calculated font size used */
  fontSize: number;
  /** Lines of text that were drawn */
  lines: string[];
  /** Error message if positioning failed */
  error?: string;
}

/**
 * Default label options
 */
export const DEFAULT_LABEL_OPTIONS: QRLabelOptions = {
  position: 'below',
  color: { red: 0, green: 0, blue: 0 }, // Black
  font: 'Helvetica',
  lineSpacing: 1.2,
  alignment: 'center',
  padding: 4
};

/**
 * Calculates optimal font size for label text within given constraints
 * 
 * @param text - Text to size
 * @param maxWidth - Maximum width in points
 * @param maxHeight - Maximum height in points
 * @param font - PDF font object
 * @param minSize - Minimum font size (default: 6)
 * @param maxSize - Maximum font size (default: 14)
 * @returns Optimal font size in points
 */
export function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  font: PDFFont,
  minSize: number = 6,
  maxSize: number = 14
): number {
  if (!text || !font) {
    return minSize;
  }

  if (maxWidth <= 0 || maxHeight <= 0) {
    return minSize;
  }

  // Binary search for optimal font size
  let low = minSize;
  let high = maxSize;
  let optimalSize = minSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const textWidth = font.widthOfTextAtSize(text, mid);
    const textHeight = font.heightAtSize(mid);

    if (textWidth <= maxWidth && textHeight <= maxHeight) {
      optimalSize = mid;
      low = mid + 1; // Try larger size
    } else {
      high = mid - 1; // Try smaller size
    }
  }

  return Math.max(optimalSize, minSize);
}

/**
 * Wraps text to fit within specified width
 * 
 * @param text - Text to wrap
 * @param maxWidth - Maximum width in points
 * @param font - PDF font object
 * @param fontSize - Font size in points
 * @returns Array of text lines
 */
export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): string[] {
  if (!text || !font || maxWidth <= 0 || fontSize <= 0) {
    return [text || ''];
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (lineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word is too long, truncate it
        let truncatedWord = word;
        while (truncatedWord.length > 0) {
          const wordWidth = font.widthOfTextAtSize(truncatedWord + '...', fontSize);
          if (wordWidth <= maxWidth) {
            lines.push(truncatedWord + (truncatedWord.length < word.length ? '...' : ''));
            break;
          }
          truncatedWord = truncatedWord.slice(0, -1);
        }
        currentLine = '';
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

/**
 * Calculates label position coordinates based on QR code position and cell dimensions
 * 
 * @param qrX - QR code X coordinate
 * @param qrY - QR code Y coordinate  
 * @param qrSize - QR code size
 * @param cellWidth - Cell width
 * @param cellHeight - Cell height
 * @param labelPosition - Position relative to QR code
 * @param textWidth - Width of text to position
 * @param textHeight - Height of text to position
 * @param padding - Padding in points
 * @returns Label coordinates
 */
export function calculateLabelPosition(
  qrX: number,
  qrY: number,
  qrSize: number,
  cellWidth: number,
  cellHeight: number,
  labelPosition: LabelPosition,
  textWidth: number,
  textHeight: number,
  padding: number = 4
): { x: number; y: number } {
  const cellCenterX = qrX + (cellWidth / 2);
  const cellCenterY = qrY + (cellHeight / 2);

  switch (labelPosition) {
    case 'above':
      return {
        x: cellCenterX - (textWidth / 2),
        y: qrY + qrSize + padding
      };

    case 'below':
      return {
        x: cellCenterX - (textWidth / 2),
        y: qrY - textHeight - padding
      };

    case 'left':
      return {
        x: qrX - textWidth - padding,
        y: cellCenterY - (textHeight / 2)
      };

    case 'right':
      return {
        x: qrX + qrSize + padding,
        y: cellCenterY - (textHeight / 2)
      };

    case 'inside-bottom':
      return {
        x: cellCenterX - (textWidth / 2),
        y: qrY + padding
      };

    case 'inside-top':
      return {
        x: cellCenterX - (textWidth / 2),
        y: qrY + qrSize - textHeight - padding
      };

    default:
      // Default to below
      return {
        x: cellCenterX - (textWidth / 2),
        y: qrY - textHeight - padding
      };
  }
}

/**
 * Validates label text for PDF embedding
 * 
 * @param text - Text to validate
 * @returns True if text is valid, false otherwise
 */
export function validateLabelText(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check for reasonable length
  if (text.length > 200) {
    return false;
  }

  // Basic Unicode support check
  try {
    // Test if text can be encoded/decoded properly
    const encoded = encodeURIComponent(text);
    const decoded = decodeURIComponent(encoded);
    return decoded === text;
  } catch {
    return false;
  }
}

/**
 * Adds a text label to a PDF page for a QR code item
 * 
 * @param page - PDF page to add label to
 * @param doc - PDF document (needed for font embedding)
 * @param text - Label text
 * @param qrX - QR code X coordinate
 * @param qrY - QR code Y coordinate
 * @param qrSize - QR code size
 * @param cellWidth - Cell width
 * @param cellHeight - Cell height (optional, defaults to cellWidth)
 * @param options - Label styling and positioning options
 * @returns Result of the label positioning operation
 * 
 * @example
 * ```typescript
 * const result = await addQRLabelToPDF(page, doc, 'Item 001', 100, 100, 80, 100);
 * if (result.success) {
 *   console.log(`Label positioned at ${result.position.x}, ${result.position.y}`);
 * }
 * ```
 */
export async function addQRLabelToPDF(
  page: PDFPage,
  doc: PDFDocument,
  text: string,
  qrX: number,
  qrY: number,
  qrSize: number,
  cellWidth: number,
  cellHeight?: number,
  options: QRLabelOptions = {}
): Promise<LabelPositionResult> {
  try {
    if (!page || !doc) {
      throw new PDFGenerationError('Both PDF page and document are required');
    }

    if (!validateLabelText(text)) {
      throw new PDFGenerationError('Invalid label text');
    }

    const finalCellHeight = cellHeight || cellWidth;
    const opts = { ...DEFAULT_LABEL_OPTIONS, ...options };

    // Validate coordinates and dimensions
    if (!Number.isFinite(qrX) || !Number.isFinite(qrY) || !Number.isFinite(qrSize)) {
      throw new PDFGenerationError('QR code position and size must be finite numbers');
    }

    if (!Number.isFinite(cellWidth) || !Number.isFinite(finalCellHeight)) {
      throw new PDFGenerationError('Cell dimensions must be finite numbers');
    }

    if (cellWidth <= 0 || finalCellHeight <= 0 || qrSize <= 0) {
      throw new PDFGenerationError('Cell dimensions and QR size must be positive');
    }

    // Embed font
    let font: PDFFont;
    switch (opts.font) {
      case 'TimesRoman':
        font = await doc.embedFont(StandardFonts.TimesRoman);
        break;
      case 'Courier':
        font = await doc.embedFont(StandardFonts.Courier);
        break;
      default:
        font = await doc.embedFont(StandardFonts.Helvetica);
    }

    // Calculate available space for label
    const padding = opts.padding || 4;
    const availableWidth = opts.maxWidth || (cellWidth - 2 * padding);
    const availableHeight = Math.max(20, finalCellHeight * 0.3); // Reserve 30% of cell height for label

    // Calculate optimal font size
    const fontSize = opts.fontSize || calculateOptimalFontSize(
      text,
      availableWidth,
      availableHeight,
      font,
      6,
      14
    );

    // Wrap text to fit width
    const lines = wrapText(text, availableWidth, font, fontSize);
    
    // Calculate total text dimensions
    const maxLineWidth = Math.max(...lines.map(line => font.widthOfTextAtSize(line, fontSize)));
    const totalTextHeight = lines.length * fontSize * (opts.lineSpacing || 1.2);

    // Calculate label position
    const labelPos = calculateLabelPosition(
      qrX,
      qrY,
      qrSize,
      cellWidth,
      finalCellHeight,
      opts.position || 'below',
      maxLineWidth,
      totalTextHeight,
      padding
    );

    // Check if label fits within page bounds
    const pageSize = page.getSize();
    if (labelPos.x < 0 || labelPos.y < 0 || 
        labelPos.x + maxLineWidth > pageSize.width || 
        labelPos.y + totalTextHeight > pageSize.height) {
      // Try alternative position
      const altPosition: LabelPosition = opts.position === 'above' ? 'below' : 'above';
      const altLabelPos = calculateLabelPosition(
        qrX,
        qrY,
        qrSize,
        cellWidth,
        finalCellHeight,
        altPosition,
        maxLineWidth,
        totalTextHeight,
        padding
      );
      
      if (altLabelPos.x >= 0 && altLabelPos.y >= 0 && 
          altLabelPos.x + maxLineWidth <= pageSize.width && 
          altLabelPos.y + totalTextHeight <= pageSize.height) {
        labelPos.x = altLabelPos.x;
        labelPos.y = altLabelPos.y;
      }
    }

    // Draw each line of text
    const lineHeight = fontSize * (opts.lineSpacing || 1.2);
    const color = opts.color || { red: 0, green: 0, blue: 0 };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineWidth = font.widthOfTextAtSize(line, fontSize);
      
      let lineX = labelPos.x;
      
      // Apply horizontal alignment
      switch (opts.alignment) {
        case 'center':
          lineX = labelPos.x + (maxLineWidth - lineWidth) / 2;
          break;
        case 'right':
          lineX = labelPos.x + maxLineWidth - lineWidth;
          break;
        default:
          // Left alignment (default)
          break;
      }

      const lineY = labelPos.y + totalTextHeight - (i + 1) * lineHeight;

      page.drawText(line, {
        x: lineX,
        y: lineY,
        size: fontSize,
        font: font,
        color: rgb(color.red, color.green, color.blue)
      });
    }

    return {
      success: true,
      position: labelPos,
      fontSize: fontSize,
      lines: lines
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during label positioning';
    
    return {
      success: false,
      position: { x: qrX, y: qrY },
      fontSize: 8,
      lines: [text],
      error: errorMessage
    };
  }
}

/**
 * Adds multiple labels to a page for multiple QR codes
 * 
 * @param page - PDF page to add labels to
 * @param doc - PDF document (needed for font embedding)
 * @param labels - Array of label data
 * @returns Array of label positioning results
 */
export async function addMultipleQRLabelsToPDF(
  page: PDFPage,
  doc: PDFDocument,
  labels: Array<{
    text: string;
    qrX: number;
    qrY: number;
    qrSize: number;
    cellWidth: number;
    cellHeight?: number;
    options?: QRLabelOptions;
  }>
): Promise<LabelPositionResult[]> {
  if (!page || !doc) {
    throw new PDFGenerationError('Both PDF page and document are required');
  }

  if (!Array.isArray(labels) || labels.length === 0) {
    throw new PDFGenerationError('Labels array is required and must not be empty');
  }

  const results: LabelPositionResult[] = [];

  // Process labels sequentially to avoid font conflicts
  for (const label of labels) {
    try {
      const result = await addQRLabelToPDF(
        page,
        doc,
        label.text,
        label.qrX,
        label.qrY,
        label.qrSize,
        label.cellWidth,
        label.cellHeight,
        label.options || {}
      );
      results.push(result);
    } catch (error) {
      // Add failed result but continue with other labels
      results.push({
        success: false,
        position: { x: label.qrX, y: label.qrY },
        fontSize: 8,
        lines: [label.text],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}
// ================================
// Complete PDF Generation Pipeline - REQ-013
// ================================

/**
 * Progress callback for PDF generation
 */
export interface PDFGenerationProgress {
  /** Current step in the generation process */
  step: string;
  /** Percentage completion (0-100) */
  percentage: number;
  /** Current page being processed */
  currentPage?: number;
  /** Total pages to process */
  totalPages?: number;
  /** Number of QR codes processed */
  processedQRCodes?: number;
  /** Total QR codes to process */
  totalQRCodes?: number;
}

/**
 * Complete result of PDF generation
 */
export interface PDFGenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated PDF bytes (if successful) */
  pdfBytes?: Uint8Array;
  /** Number of pages created */
  pageCount: number;
  /** Number of QR codes embedded */
  qrCodeCount: number;
  /** Total processing time in milliseconds */
  processingTime: number;
  /** Error message (if failed) */
  error?: string;
  /** Detailed generation statistics */
  statistics: {
    /** QR codes that were successfully embedded */
    successfulQRCodes: number;
    /** QR codes that failed to embed */
    failedQRCodes: number;
    /** Labels that were successfully positioned */
    successfulLabels: number;
    /** Labels that failed to position */
    failedLabels: number;
    /** Pages with cutlines generated */
    pagesWithCutlines: number;
  };
}

/**
 * Options for PDF generation pipeline
 */
export interface PDFPipelineOptions {
  /** Progress callback function */
  onProgress?: (progress: PDFGenerationProgress) => void;
  /** Whether to include QR code labels */
  includeLabels?: boolean;
  /** Whether to include cutlines */
  includeCutlines?: boolean;
  /** Label positioning options */
  labelOptions?: QRLabelOptions;
  /** Whether to validate all QR codes before generation */
  validateQRCodes?: boolean;
  /** Maximum processing time in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Validates PDF export settings and QR code data
 * 
 * @param qrCodes - Map of item IDs to URLs for QR generation
 * @param settings - PDF export settings
 * @returns Validation result with error details if invalid
 */
export function validatePDFGenerationInput(
  qrCodes: Map<string, string>, 
  settings: PDFExportSettings
): { valid: boolean; error?: string } {
  try {
    // Validate QR codes map
    if (!qrCodes || !(qrCodes instanceof Map)) {
      return { valid: false, error: 'QR codes must be a valid Map' };
    }

    if (qrCodes.size === 0) {
      return { valid: false, error: 'At least one QR code is required' };
    }

    if (qrCodes.size > 1000) {
      return { valid: false, error: 'Maximum 1000 QR codes supported per document' };
    }

    // Validate URLs in QR codes
    for (const [itemId, url] of qrCodes) {
      if (!itemId || typeof itemId !== 'string') {
        return { valid: false, error: 'All item IDs must be non-empty strings' };
      }

      if (!url || typeof url !== 'string') {
        return { valid: false, error: `Invalid URL for item ${itemId}` };
      }

      try {
        new URL(url);
      } catch {
        return { valid: false, error: `Invalid URL format for item ${itemId}: ${url}` };
      }
    }

    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return { valid: false, error: 'PDF export settings are required' };
    }

    if (!settings.pageFormat || !['A4', 'Letter'].includes(settings.pageFormat)) {
      return { valid: false, error: 'Page format must be A4 or Letter' };
    }

    if (!Number.isFinite(settings.margins) || settings.margins < 5 || settings.margins > 50) {
      return { valid: false, error: 'Margins must be between 5 and 50 millimeters' };
    }

    if (!Number.isFinite(settings.qrSize) || settings.qrSize < 20 || settings.qrSize > 100) {
      return { valid: false, error: 'QR size must be between 20 and 100 millimeters' };
    }

    return { valid: true };

  } catch (error) {
    return { 
      valid: false, 
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Complete PDF generation pipeline that orchestrates all components
 * 
 * @param qrCodes - Map of item IDs to URLs for QR generation
 * @param settings - PDF export settings
 * @param options - Additional pipeline options
 * @returns Complete PDF generation result
 * 
 * @example
 * ```typescript
 * const qrCodes = new Map([['item1', 'https://example.com/item1']]);
 * const settings = { pageFormat: 'A4', margins: 10, qrSize: 40, includeCutlines: true, includeLabels: true };
 * const result = await generatePDFFromQRCodes(qrCodes, settings, {
 *   onProgress: (progress) => console.log(`${progress.step}: ${progress.percentage}%`)
 * });
 * ```
 */
export async function generatePDFFromQRCodes(
  qrCodes: Map<string, string>,
  settings: PDFExportSettings,
  options: PDFPipelineOptions = {}
): Promise<PDFGenerationResult> {
  const startTime = Date.now();
  const { onProgress } = options;

  // 🔍 DEBUG: Log function input parameters
  const DEBUG_PREFIX = "🔍 PDF_DEBUG_013:";
  
  // REQ-015 Task 2: Debug QR Size Pipeline - Log received QR size in PDF generator
  console.log(`${DEBUG_PREFIX} QR_SIZE_PIPELINE_PDF_GENERATOR:`, {
    receivedQRSize: settings.qrSize,
    qrSizeType: typeof settings.qrSize,
    settingsQrSizeValue: settings.qrSize
  });
  
  console.log(`${DEBUG_PREFIX} FUNCTION_INPUT:`, {
    qrCodesType: typeof qrCodes,
    qrCodesIsMap: qrCodes instanceof Map,
    qrCodesSize: qrCodes?.size,
    qrCodesKeys: qrCodes instanceof Map ? Array.from(qrCodes.keys()) : 'not_a_map',
    settingsType: typeof settings,
    settings: settings,
    optionsType: typeof options,
    options: options
  });

  try {
    onProgress?.({
      step: 'Validating input',
      percentage: 0
    });

    // Step 1: Validate input
    const validation = validatePDFGenerationInput(qrCodes, settings);
    if (!validation.valid) {
      return {
        success: false,
        pageCount: 0,
        qrCodeCount: 0,
        processingTime: Date.now() - startTime,
        error: validation.error,
        statistics: {
          successfulQRCodes: 0,
          failedQRCodes: qrCodes.size,
          successfulLabels: 0,
          failedLabels: 0,
          pagesWithCutlines: 0
        }
      };
    }

    onProgress?.({
      step: 'Creating PDF document',
      percentage: 5
    });

    // Step 2: Create PDF document
    const doc = await createPDFDocument(settings.pageFormat, settings.margins);

    // Step 3: Calculate layout
    const pageLayout = getStandardPageLayout(settings.pageFormat, settings.margins);
    console.log(`${DEBUG_PREFIX} PAGE_LAYOUT:`, {
      pageLayoutType: typeof pageLayout,
      pageLayout: pageLayout
    });
    
    const layout = calculateGridLayout(
      pageLayout.page.width, 
      pageLayout.page.height, 
      settings.margins, 
      settings.qrSize
    );
    console.log(`${DEBUG_PREFIX} GRID_LAYOUT:`, {
      layoutType: typeof layout,
      layout: layout
    });
    
    console.log(`${DEBUG_PREFIX} BEFORE_CALCULATE_TOTAL_PAGES:`, {
      qrCodesSize: qrCodes.size,
      qrCodesSizeType: typeof qrCodes.size,
      itemsPerPage: layout.itemsPerPage,
      itemsPerPageType: typeof layout.itemsPerPage
    });
    
    const totalPages = calculateTotalPages(qrCodes.size, layout.itemsPerPage);
    console.log(`${DEBUG_PREFIX} TOTAL_PAGES_RESULT:`, {
      totalPages: totalPages,
      totalPagesType: typeof totalPages
    });

    onProgress?.({
      step: 'Calculating layout',
      percentage: 10,
      totalPages: totalPages
    });

    // Step 4: Generate QR codes  
    const qrDataUrls = new Map<string, string>();
    const items = Array.from(qrCodes.entries());
    let processed = 0;

    for (const [itemId, url] of items) {
      try {
        const qrDataUrl = await generateQRCodeForPDF(url, settings.qrSize, 300);
        qrDataUrls.set(itemId, qrDataUrl);
      } catch (error) {
        console.error(`Failed to generate QR code for ${itemId}:`, error);
      }
      
      processed++;
      onProgress?.({
        step: 'Generating QR codes',
        percentage: 10 + Math.round((processed / items.length) * 30),
        processedQRCodes: processed,
        totalQRCodes: items.length
      });
    }

    if (qrDataUrls.size === 0) {
      return {
        success: false,
        pageCount: 0,
        qrCodeCount: 0,
        processingTime: Date.now() - startTime,
        error: 'Failed to generate any QR codes',
        statistics: {
          successfulQRCodes: 0,
          failedQRCodes: qrCodes.size,
          successfulLabels: 0,
          failedLabels: 0,
          pagesWithCutlines: 0
        }
      };
    }

    // Step 5: Create pages
    const pages: PDFPage[] = [];
    for (let i = 0; i < totalPages; i++) {
      const page = addPDFPage(doc, settings.pageFormat);
      pages.push(page);
    }

    onProgress?.({
      step: 'Creating pages',
      percentage: 45,
      totalPages: totalPages
    });

    // Step 6: Embed QR codes and labels
    const stats = { successfulQRCodes: 0, failedQRCodes: 0, successfulLabels: 0, failedLabels: 0 };
    
    console.log(`${DEBUG_PREFIX} BEFORE_GET_ALL_ITEM_POSITIONS:`, {
      layoutType: typeof layout,
      layout: layout,
      qrDataUrlsSize: qrDataUrls.size,
      qrDataUrlsSizeType: typeof qrDataUrls.size,
      correctOrderShouldBe: 'getAllItemPositions(qrDataUrls.size, layout)'
    });
    
    const allPositionsResult = getAllItemPositions(qrDataUrls.size, layout); // FIXED: Correct parameter order!
    
    // OPTION C: Create Map from positions array, mapping itemId to position
    const allPositions = new Map();
    const itemIds = Array.from(qrDataUrls.keys());
    console.log(`${DEBUG_PREFIX} CREATING_POSITION_MAP:`, {
      positionsArrayLength: allPositionsResult.positions.length,
      itemIdsLength: itemIds.length,
      itemIds: itemIds.slice(0, 3), // Show first 3 for debugging
      firstPositions: allPositionsResult.positions.slice(0, 3) // Show first 3 for debugging
    });
    
    itemIds.forEach((itemId, index) => {
      if (index < allPositionsResult.positions.length) {
        allPositions.set(itemId, allPositionsResult.positions[index]);
      } else {
        console.warn(`${DEBUG_PREFIX} Missing position for index ${index}, itemId: ${itemId}`);
      }
    });
    
    console.log(`${DEBUG_PREFIX} POSITION_MAP_CREATED:`, {
      mapSize: allPositions.size,
      expectedSize: itemIds.length,
      mapHasCorrectSize: allPositions.size === itemIds.length
    });
    processed = 0;

    for (const [itemId, qrDataUrl] of qrDataUrls) {
      console.log(`${DEBUG_PREFIX} PROCESSING_QR_CODE:`, {
        itemId: itemId,
        itemIdType: typeof itemId,
        qrDataUrlLength: qrDataUrl ? qrDataUrl.length : 'null',
        mapHasItem: allPositions.has(itemId)
      });
      
      const itemPosition = allPositions.get(itemId);
      console.log(`${DEBUG_PREFIX} ITEM_POSITION_RESULT:`, {
        itemPosition: itemPosition,
        itemPositionType: typeof itemPosition,
        hasPage: itemPosition?.page !== undefined,
        page: itemPosition?.page
      });
      
      if (!itemPosition) {
        console.log(`${DEBUG_PREFIX} FAILED_NO_POSITION:`, { itemId, stats: stats.failedQRCodes });
        stats.failedQRCodes++;
        continue;
      }

      const page = pages[itemPosition.page];
      console.log(`${DEBUG_PREFIX} PAGE_LOOKUP:`, {
        pageIndex: itemPosition.page,
        pageExists: !!page,
        totalPages: pages.length
      });
      
      if (!page) {
        console.log(`${DEBUG_PREFIX} FAILED_NO_PAGE:`, { itemId, pageIndex: itemPosition.page, stats: stats.failedQRCodes });
        stats.failedQRCodes++;
        continue;
      }

      try {
        console.log(`${DEBUG_PREFIX} BEFORE_QR_EMBEDDING:`, {
          itemId: itemId,
          qrDataUrlLength: qrDataUrl ? qrDataUrl.length : 'null',
          qrDataUrlStart: qrDataUrl ? qrDataUrl.substring(0, 50) + '...' : 'null',
          position: { x: itemPosition.x, y: itemPosition.y },
          qrSize: layout.qrSize,
          layoutQrSize: layout.qrSize,
          layoutType: typeof layout.qrSize,
          layoutObjectKeys: Object.keys(layout),
          pageWidth: page.getWidth(),
          pageHeight: page.getHeight()
        });
        
        console.log(`${DEBUG_PREFIX} STEP_A_ENTERING_QR_SIZE_LOGIC:`, { 
          step: 'About to check layout.qrSize',
          layoutQrSize: layout.qrSize,
          layoutQrSizeType: typeof layout.qrSize
        });
        
        // Embed QR code - HARDCODE SIZE AS FALLBACK
        const qrSizeToUse = layout.qrSize || convertMillimetersToPoints(40); // 40mm fallback
        
        console.log(`${DEBUG_PREFIX} STEP_B_QR_SIZE_CALCULATION:`, {
          step: 'After calculating qrSizeToUse',
          layoutQrSize: layout.qrSize,
          layoutQrSizeType: typeof layout.qrSize,
          fallbackSize: convertMillimetersToPoints(40),
          actualSizeUsed: qrSizeToUse,
          qrSizeToUseType: typeof qrSizeToUse,
          layoutKeys: Object.keys(layout).slice(0, 10)
        });
        
        console.log(`${DEBUG_PREFIX} STEP_C_ABOUT_TO_CALL_ADDQRCODETOPAGE:`, {
          step: 'Right before addQRCodeToPage call',
          page: !!page,
          doc: !!doc,
          qrDataUrl: !!qrDataUrl,
          x: itemPosition.x,
          y: itemPosition.y,
          size: qrSizeToUse,
          sizeType: typeof qrSizeToUse
        });
        
        const qrResult = await addQRCodeToPage(
          page, doc, qrDataUrl, itemPosition.x, itemPosition.y, qrSizeToUse, {}
        );
        
        console.log(`${DEBUG_PREFIX} STEP_D_AFTER_ADDQRCODETOPAGE_CALL:`, {
          step: 'Immediately after addQRCodeToPage call',
          qrResult: qrResult,
          success: qrResult?.success,
          error: qrResult?.error
        });
        
        console.log(`${DEBUG_PREFIX} QR_EMBEDDING_RESULT:`, {
          itemId: itemId,
          success: qrResult?.success,
          error: qrResult?.error,
          resultType: typeof qrResult,
          position: qrResult?.position,
          size: qrResult?.size
        });

        if (qrResult.success) {
          stats.successfulQRCodes++;

          // Add label if enabled
          if (options.includeLabels !== false && settings.includeLabels !== false) {
            try {
              const labelResult = await addQRLabelToPDF(
                page, doc, itemId, itemPosition.x, itemPosition.y, 
                layout.qrSize, layout.qrSize, layout.qrSize, options.labelOptions || {}
              );
              if (labelResult.success) {
                stats.successfulLabels++;
              } else {
                stats.failedLabels++;
              }
            } catch {
              stats.failedLabels++;
            }
          }
        } else {
          stats.failedQRCodes++;
        }
      } catch (error) {
        console.log(`${DEBUG_PREFIX} CATCH_BLOCK_ERROR:`, {
          step: 'Exception caught in QR embedding try block',
          error: error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          itemId: itemId
        });
        stats.failedQRCodes++;
      }

      processed++;
      onProgress?.({
        step: 'Embedding QR codes and labels',
        percentage: 45 + Math.round((processed / qrDataUrls.size) * 30),
        processedQRCodes: processed,
        totalQRCodes: qrDataUrls.size
      });
    }

    // Step 7: Add cutlines if enabled
    let pagesWithCutlines = 0;
    if (options.includeCutlines !== false && settings.includeCutlines !== false) {
      onProgress?.({ step: 'Adding cutlines', percentage: 80 });
      try {
        addAllPagesCutlines(doc, layout, qrCodes.size, { ...DEFAULT_CUTLINE_GRID_OPTIONS, drawBorder: true });
        pagesWithCutlines = totalPages;
      } catch (error) {
        console.error('Failed to add cutlines:', error);
      }
    }

    onProgress?.({ step: 'Finalizing PDF', percentage: 90 });

    // Step 8: Generate final PDF
    const pdfBytes = await doc.save();

    onProgress?.({ step: 'Complete', percentage: 100 });

    return {
      success: true,
      pdfBytes: pdfBytes,
      pageCount: totalPages,
      qrCodeCount: qrDataUrls.size,
      processingTime: Date.now() - startTime,
      statistics: {
        successfulQRCodes: stats.successfulQRCodes,
        failedQRCodes: stats.failedQRCodes,
        successfulLabels: stats.successfulLabels,
        failedLabels: stats.failedLabels,
        pagesWithCutlines: pagesWithCutlines
      }
    };

  } catch (error) {
    return {
      success: false,
      pageCount: 0,
      qrCodeCount: 0,
      processingTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error during PDF generation',
      statistics: {
        successfulQRCodes: 0,
        failedQRCodes: qrCodes.size,
        successfulLabels: 0,
        failedLabels: 0,
        pagesWithCutlines: 0
      }
    };
  }
}
