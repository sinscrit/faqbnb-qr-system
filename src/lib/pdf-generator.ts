/**
 * Core PDF Generation Utilities for REQ-013
 * Professional PDF QR Code Printing System with Vector Cutlines
 * 
 * This module provides foundation utilities for PDF document creation and management
 * with mathematical precision required for professional printing.
 */

import { PDFDocument, PageSizes, rgb, PDFPage } from 'pdf-lib';

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