import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

// Import CommonJS module
const { generatePDFBuffer } = require('@/lib/pdf_generator_module.js');

// Types
interface QRCodeItem {
  id: string;
  name: string;
  qrDataUrl: string; // base64 data URL
}

interface PDFGenerationRequest {
  qrCodes: QRCodeItem[];
  settings: {
    pageFormat: 'A4' | 'Letter' | 'A3' | 'A5';
    margins: number; // in mm
    qrSize: number; // in mm  
    itemsPerRow: number;
    includeCutlines: boolean;
    includeLabels: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 PDF Generation API called - Using PDF Generator Module');
    console.log('🔍 DEBUG: Current working directory:', process.cwd());
    console.log('🔍 DEBUG: __dirname:', __dirname);
    
    // Check if font file exists
    const fs = require('fs');
    const path = require('path');
    const fontPath = path.join(process.cwd(), '.next/server/app/api/admin/generate-pdf/data/Helvetica.afm');
    console.log('🔍 DEBUG: Looking for font at:', fontPath);
    console.log('🔍 DEBUG: Font file exists:', fs.existsSync(fontPath));
    
    // Ensure we're in the correct working directory for PDFKit fonts
    const originalCwd = process.cwd();
    const projectRoot = process.cwd();
    process.chdir(projectRoot);
    
    // Validate authentication and admin role
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      // Restore working directory before returning
      process.chdir(originalCwd);
      return authResult.error;
    }

    const body: PDFGenerationRequest = await request.json();
    const { qrCodes, settings } = body;

    if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'QR codes array is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Generating PDF with ${qrCodes.length} QR codes using PDF Generator Module`);
    
    // Determine appropriate margin based on paper size as requested:
    // - 0.5cm for international paper sizes (A0-A6)
    // - 0.25in for American paper sizes (Letter, Legal, Tabloid, Ledger)
    const isAmericanPaperSize = ['Letter', 'Legal', 'Tabloid', 'Ledger'].includes(settings.pageFormat);
    const margin = isAmericanPaperSize ? '0.25in' : '0.5cm';
    
    console.log('📏 Margin Selection:', {
      pageFormat: settings.pageFormat,
      isAmericanPaperSize,
      selectedMargin: margin,
      originalMarginMm: settings.margins
    });

    // Convert QR size from millimeters to appropriate format for module
    const qrCodeSize = `${settings.qrSize}mm`;

    // Convert QR codes to the format expected by the PDF generator module
    const moduleQRCodes = qrCodes.map(qr => ({
      id: qr.id,
      label: qr.name,
      imageData: qr.qrDataUrl // Pass the base64 data URL directly
    }));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `QR-Codes-${timestamp}.pdf`;

    // Create configuration for the PDF generator module
    const moduleConfig = {
      paperSize: settings.pageFormat,
      margin: margin, // This is the key change: use fixed margins as requested
      qrCodeCount: qrCodes.length,
      qrCodesPerRow: settings.itemsPerRow,
      qrCodeSize: qrCodeSize,
      showCutlines: settings.includeCutlines,
      debug: false, // Production mode - no visual debug guides
      outputFileName: filename,
      qrCodes: moduleQRCodes
    };

    console.log('🔧 PDF Module Configuration:', {
      paperSize: moduleConfig.paperSize,
      margin: moduleConfig.margin,
      qrCodeCount: moduleConfig.qrCodeCount,
      qrCodesPerRow: moduleConfig.qrCodesPerRow,
      qrCodeSize: moduleConfig.qrCodeSize,
      showCutlines: moduleConfig.showCutlines,
      includeLabels: moduleQRCodes.length > 0 ? 'Yes (via labels)' : 'No'
    });

    // Generate PDF using the module
    const pdfBuffer = await generatePDFBuffer(moduleConfig);
    
    console.log('✅ PDF generation completed using PDF Generator Module:', {
      bufferSize: pdfBuffer.length,
      qrCodeCount: qrCodes.length,
      marginUsed: margin,
      pageFormat: settings.pageFormat
    });
    
    // Restore working directory before sending response
    process.chdir(originalCwd);

    // Return PDF as blob response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
    
  } catch (error) {
    console.error('PDF API error:', error);
    
    // Restore working directory in case of error too
    try {
      process.chdir(originalCwd);
    } catch {
      // Ignore errors restoring directory
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}