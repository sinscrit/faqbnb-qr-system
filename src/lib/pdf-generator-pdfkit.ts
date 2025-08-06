import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

// Types matching your working example
export interface PDFKitExportSettings {
  pageFormat: 'A4' | 'Letter' | 'A3' | 'A5';
  margins: number; // in mm
  qrSize: number; // in mm  
  itemsPerRow: number;
  includeCutlines: boolean;
  includeLabels: boolean;
}

export interface QRCodeItem {
  id: string;
  name: string;
  qrDataUrl: string; // base64 data URL
}

export interface PDFKitGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  pageCount?: number;
  qrCodeCount?: number;
  processingTime?: number;
  error?: string;
}

// Helper functions from your working example
function convertToPoints(value: number): number {
  // Convert mm to points (1mm = 2.835 points)
  return value * 2.835;
}

function getPaperSize(size: string): [number, number] {
  const sizes: Record<string, [number, number]> = {
    'A0': [2383.94, 3370.39],
    'A1': [1683.78, 2383.94], 
    'A2': [1190.55, 1683.78],
    'A3': [841.89, 1190.55],
    'A4': [595.28, 841.89],
    'A5': [419.53, 595.28],
    'A6': [297.64, 419.53],
    'Letter': [612, 792],
    'Legal': [612, 1008],
    'Tabloid': [792, 1224],
    'Ledger': [1224, 792]
  };
  
  return sizes[size] || sizes['A4'];
}

function getMarginSize(marginMm: number, paperSize: [number, number]): number {
  return convertToPoints(marginMm);
}

/**
 * Generate PDF using pdfkit with exact coordinate system from pdf_generator_fixed3.js
 * Uses top-left origin (0,0) with Y increasing downward - exactly like your working example
 */
/**
 * Download a PDF buffer as a file
 */
export function downloadPDFBlob(buffer: Buffer, filename: string = 'qr-codes.pdf'): void {
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert PDF buffer to blob
 */
export function convertPDFToBlob(buffer: Buffer): Blob {
  return new Blob([buffer], { type: 'application/pdf' });
}

export async function generatePDFWithPDFKit(
  qrCodes: QRCodeItem[],
  settings: PDFKitExportSettings,
  onProgress?: (progress: { step: string; percentage: number }) => void
): Promise<PDFKitGenerationResult> {
  const startTime = Date.now();
  
  try {
    onProgress?.({ step: 'Initializing PDF generation', percentage: 0 });
    
    // Get paper dimensions - EXACT same logic as your working file
    const paperSize = getPaperSize(settings.pageFormat);
    const [pageWidth, pageHeight] = paperSize;
    
    // Calculate margin - EXACT same logic as your working file
    const margin = getMarginSize(settings.margins, paperSize);
    
    // Calculate grid dimensions - EXACT same logic as your working file (lines 105-111)
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);
    const gridCols = settings.itemsPerRow; // EXACT same as line 108: gridCols = finalConfig.qrCodesPerRow
    const gridRows = Math.ceil(qrCodes.length / gridCols); // EXACT same as line 109
    const cellWidth = contentWidth / gridCols; // EXACT same as line 110
    const cellHeight = contentHeight / gridRows; // EXACT same as line 111
    
    // Calculate QR code size - EXACT same logic as your working file
    const qrSizePoints = convertToPoints(settings.qrSize);
    const labelHeight = 25; // EXACT same as line 116
    
    onProgress?.({ step: 'Creating PDF document', percentage: 10 });
    
    // Create PDF document - EXACT same as your working file (lines 125-128)
    const doc = new PDFDocument({
      size: [pageWidth, pageHeight],
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    
    // Collect PDF data
    const buffers: Buffer[] = [];
    doc.on('data', (buffer) => buffers.push(buffer));
    
    onProgress?.({ step: 'Adding page elements', percentage: 20 });
    
    // Add page border for reference - EXACT same as your working file (lines 135-137)
    doc.rect(0, 0, pageWidth, pageHeight)
       .stroke('#000000');
    
    // Add margin guides - EXACT same as your working file (lines 139-143)
    if (margin > 0) {
      doc.rect(margin, margin, contentWidth, contentHeight)
         .stroke('#CCCCCC');
    }
    
    onProgress?.({ step: 'Generating QR codes', percentage: 30 });
    
    // Generate QR codes - EXACT same loop logic as your working file (lines 148-182)
    for (let i = 0; i < qrCodes.length; i++) {
      const row = Math.floor(i / gridCols); // EXACT same as line 149
      const col = i % gridCols; // EXACT same as line 150
      const qrItem = qrCodes[i];
      
      // Calculate cell position - EXACT same as your working file (lines 154-155)
      const cellX = margin + (col * cellWidth);
      const cellY = margin + (row * cellHeight);
      
      // Center QR code within cell - EXACT same as your working file (lines 158-159)
      const qrX = cellX + (cellWidth - qrSizePoints) / 2;
      const qrY = cellY + (cellHeight - qrSizePoints - labelHeight) / 2;
      
      // Ensure QR code fits within bounds - EXACT same as your working file (line 162)
      const adjustedQrY = Math.max(cellY + 10, Math.min(qrY, cellY + cellHeight - qrSizePoints - labelHeight - 10));
      
      // Draw QR code (we'll use the actual QR image instead of placeholder)
      if (qrItem.qrDataUrl) {
        try {
          // Convert base64 data URL to buffer
          const base64Data = qrItem.qrDataUrl.replace(/^data:image\/png;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          
          // Draw the actual QR code image - positioned exactly like your working file
          doc.image(imageBuffer, qrX, adjustedQrY, {
            width: qrSizePoints,
            height: qrSizePoints
          });
        } catch (imageError) {
          // Fallback to placeholder rectangle if image fails - EXACT same as your working file (lines 165-166)
          doc.rect(qrX, adjustedQrY, qrSizePoints, qrSizePoints)
             .fillAndStroke('#E0E0E0', '#000000');
        }
      } else {
        // Placeholder rectangle - EXACT same as your working file (lines 165-166)
        doc.rect(qrX, adjustedQrY, qrSizePoints, qrSizePoints)
           .fillAndStroke('#E0E0E0', '#000000');
      }
      
      // Add label below QR code if enabled - EXACT same logic as your working file (lines 173-181)
      if (settings.includeLabels) {
        doc.fontSize(Math.max(6, qrSizePoints * 0.06))
           .fillColor('#000000');
        
        const labelWidth = doc.widthOfString(qrItem.name);
        const labelX = qrX + (qrSizePoints - labelWidth) / 2;
        const labelY = adjustedQrY + qrSizePoints + 8;
        
        doc.text(qrItem.name, labelX, labelY);
      }
      
      // Update progress
      const progressPercent = 30 + (i / qrCodes.length) * 40;
      onProgress?.({ step: 'Embedding QR codes', percentage: Math.round(progressPercent) });
    }
    
    // Add cutlines if enabled - EXACT same logic as your working file (lines 184-230)
    if (settings.includeCutlines) {
      onProgress?.({ step: 'Adding cutlines', percentage: 80 });
      
      // Add grid cutlines (dashed) - EXACT same as lines 187-207
      doc.dash(3, { space: 2 });
      
      // Vertical cutlines - EXACT same as lines 190-195
      for (let col = 1; col < gridCols; col++) {
        const x = margin + (col * cellWidth);
        doc.moveTo(x, margin)
           .lineTo(x, pageHeight - margin)
           .stroke('#999999');
      }
      
      // Horizontal cutlines - EXACT same as lines 197-203
      for (let row = 1; row < gridRows; row++) {
        const y = margin + (row * cellHeight);
        doc.moveTo(margin, y)
           .lineTo(pageWidth - margin, y)
           .stroke('#999999');
      }
      
      // Reset dash pattern for solid lines - EXACT same as line 206
      doc.undash();
      
      // Add outer cutlines (solid red lines for cutting) - EXACT same as lines 208-230
      if (margin > 0) {
        // Top horizontal
        doc.moveTo(margin, margin)
           .lineTo(pageWidth - margin, margin)
           .stroke('#FF0000');
        
        // Bottom horizontal
        doc.moveTo(margin, pageHeight - margin)
           .lineTo(pageWidth - margin, pageHeight - margin)
           .stroke('#FF0000');
        
        // Left vertical
        doc.moveTo(margin, margin)
           .lineTo(margin, pageHeight - margin)
           .stroke('#FF0000');
        
        // Right vertical
        doc.moveTo(pageWidth - margin, margin)
           .lineTo(pageWidth - margin, pageHeight - margin)
           .stroke('#FF0000');
      }
    }
    
    onProgress?.({ step: 'Finalizing PDF', percentage: 95 });
    
    // Finalize PDF - EXACT same as your working file (line 235)
    doc.end();
    
    // Wait for PDF generation to complete
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        const processingTime = Date.now() - startTime;
        
        onProgress?.({ step: 'Complete', percentage: 100 });
        
        resolve({
          success: true,
          pdfBuffer,
          pageCount: 1,
          qrCodeCount: qrCodes.length,
          processingTime
        });
      });
    });
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}