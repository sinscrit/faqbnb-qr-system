/**
 * Core PDF Generation Utilities for REQ-013
 * Professional PDF QR Code Printing System with Vector Cutlines
 * 
 * This module provides foundation utilities for PDF document creation and management
 * with mathematical precision required for professional printing.
 */

import { PDFDocument, PageSizes, rgb, PDFPage, PDFImage } from 'pdf-lib';
import { convertQRCodeForPDF, validateQRForPDFEmbedding, getQRImageFormat } from './qrcode-utils';

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
      rotate: options.rotation ? { type: 'degrees', angle: options.rotation } : undefined
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
  try {
    if (!page || !doc) {
      throw new PDFGenerationError('Both PDF page and document are required');
    }

    // Validate and convert QR code data
    if (!validateQRForPDFEmbedding(qrDataUrl)) {
      throw new PDFGenerationError('Invalid QR code data URL for PDF embedding');
    }

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
      if (aspectRatio > 1) {
        finalHeight = finalSize / aspectRatio;
      } else {
        finalWidth = finalSize * aspectRatio;
      }
    }

    // Draw the QR code on the specific page
    page.drawImage(embeddedImage, {
      x: x,
      y: y,
      width: finalWidth,
      height: finalHeight,
      opacity: options.opacity || 1.0,
      rotate: options.rotation ? { type: 'degrees', angle: options.rotation } : undefined
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