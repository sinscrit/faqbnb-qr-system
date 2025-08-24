import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generatePDFBuffer } from '@/lib/pdf_generator_module.js';

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
    console.log('🔍 PDF_IMPORT_DEBUG: generatePDFBuffer type:', typeof generatePDFBuffer);
    console.log('🔍 PDF_IMPORT_DEBUG: generatePDFBuffer available:', !!generatePDFBuffer);
    
    // Check if font file exists
    const fs = require('fs');
    const path = require('path');
    const fontPath = path.join(process.cwd(), '.next/server/app/api/admin/generate-pdf/data/Helvetica.afm');
    console.log('🔍 DEBUG: Looking for font at:', fontPath);
    console.log('🔍 DEBUG: Font file exists:', fs.existsSync(fontPath));
    
    // Fix font paths for PDFKit in Next.js production environment
    const originalCwd = process.cwd();
    const projectRoot = process.cwd();
    
    // Set up font paths for PDFKit
    const fontsPath = path.join(projectRoot, 'public', 'fonts');
    const pdfkitDataPath = path.join(projectRoot, 'node_modules', 'pdfkit', 'js', 'data');
    
    console.log('🔍 FONT_PATH_DEBUG: Project root:', projectRoot);
    console.log('🔍 FONT_PATH_DEBUG: Fonts path:', fontsPath);
    console.log('🔍 FONT_PATH_DEBUG: PDFKit data path:', pdfkitDataPath);
    console.log('🔍 FONT_PATH_DEBUG: Public fonts exist:', fs.existsSync(fontsPath));
    console.log('🔍 FONT_PATH_DEBUG: PDFKit fonts exist:', fs.existsSync(pdfkitDataPath));
    
    // Temporarily modify PDFKit font search paths
    if (process.env.NODE_ENV === 'production') {
      // In production, use our copied fonts
      process.env.PDFKIT_DATA_PATH = fontsPath;
    }
    
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
    console.log('🔍 PDF_QR_DEBUG: Input QR codes:', JSON.stringify(qrCodes, null, 2));
    const moduleQRCodes = qrCodes.map((qr, index) => {
      // Enhanced validation with comprehensive fallbacks
      const qrAny = qr as any; // Type assertion for accessing potential properties
      const safeId = qr.id || qrAny.publicId || qrAny.itemId || `unknown-item-${index}`;
      const safeLabel = qr.name || qrAny.title || qrAny.label || qrAny.displayName || `QR Code ${index + 1}`;
      const safeImageData = qr.qrDataUrl || qrAny.imageData || '';
      
      console.log(`🔍 PDF_QR_ENHANCED_DEBUG: Processing QR code ${index}:`, {
        originalId: qr.id,
        originalName: qr.name,
        originalTitle: qrAny.title,
        originalLabel: qrAny.label,
        safeId,
        safeLabel,
        safeLabelType: typeof safeLabel,
        safeLabelLength: safeLabel?.length,
        hasImageData: !!safeImageData,
        imageDataLength: safeImageData?.length
      });
      
      // Validate that we have all required fields
      if (!safeId || !safeLabel || !safeImageData) {
        console.error(`🔍 PDF_QR_VALIDATION_ERROR: Missing required fields for QR code ${index}:`, {
          safeId: !!safeId,
          safeLabel: !!safeLabel,
          safeImageData: !!safeImageData
        });
      }
      
      return {
        id: safeId,
        label: safeLabel,
        imageData: safeImageData
      };
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `QR-Codes-${timestamp}.pdf`;

    // Create configuration for the PDF generator module
    const moduleConfig = {
      paperSize: settings.pageFormat,
      margin: margin, // This is the key change: use fixed margins as requested
      qrCodeCount: qrCodes.length,
      qrCodesPerRow: settings.itemsPerRow || 3, // Default to 3 if not provided
      qrCodeSize: qrCodeSize,
      showCutlines: settings.includeCutlines,
      includeCutlines: settings.includeCutlines, // Add alternative parameter name for cutlines
      showLabels: settings.includeLabels,        // Add label support - primary parameter
      includeLabels: settings.includeLabels,     // Add alternative parameter name for labels
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
      includeCutlines: moduleConfig.includeCutlines,
      showLabels: moduleConfig.showLabels,
      includeLabels: moduleConfig.includeLabels,
      labelsFromInput: settings.includeLabels,
      cutlinesFromInput: settings.includeCutlines
    });
    
    // Debug font path resolution in web context
    console.log('🔍 WEB_FONT_DEBUG: Current working directory:', process.cwd());
    console.log('🔍 WEB_FONT_DEBUG: Font path env:', process.env.PDFKIT_FONT_PATH);
    const fontDir = path.join(process.cwd(), 'public/fonts');
    console.log('🔍 WEB_FONT_DEBUG: Font directory path:', fontDir);
    console.log('🔍 WEB_FONT_DEBUG: Font directory exists:', fs.existsSync(fontDir));
    if (fs.existsSync(fontDir)) {
      console.log('🔍 WEB_FONT_DEBUG: Font files:', fs.readdirSync(fontDir));
    }

    console.log('🔍 PDF_WEBPACK_DEBUG: Starting PDF generation with webpack configuration');
    
    // Generate PDF using the module with enhanced error handling
    console.log('🔍 PDF_CALL_DEBUG: About to call generatePDFBuffer with config:', JSON.stringify(moduleConfig, null, 2));
    
    let pdfBuffer;
    try {
      // Validate moduleConfig before passing to PDF generator
      if (!moduleConfig.qrCodes || moduleConfig.qrCodes.length === 0) {
        throw new Error('No QR codes provided to PDF generator');
      }
      
      // Check each QR code for required properties
      for (let i = 0; i < moduleConfig.qrCodes.length; i++) {
        const qr = moduleConfig.qrCodes[i];
        if (!qr.label || typeof qr.label !== 'string') {
          console.error(`🔍 PDF_VALIDATION_ERROR: QR code ${i} has invalid label:`, qr.label);
          throw new Error(`QR code ${i} has invalid label: ${qr.label}`);
        }
        if (!qr.id || typeof qr.id !== 'string') {
          console.error(`🔍 PDF_VALIDATION_ERROR: QR code ${i} has invalid id:`, qr.id);
          throw new Error(`QR code ${i} has invalid id: ${qr.id}`);
        }
        if (!qr.imageData || typeof qr.imageData !== 'string') {
          console.error(`🔍 PDF_VALIDATION_ERROR: QR code ${i} has invalid imageData:`, qr.imageData?.length || 'missing');
          throw new Error(`QR code ${i} has invalid imageData`);
        }
      }
      
      console.log('🔍 PDF_VALIDATION_SUCCESS: All QR codes validated successfully');
      pdfBuffer = await generatePDFBuffer(moduleConfig);
      console.log('🔍 PDF_CALL_DEBUG: PDF generation completed, buffer size:', pdfBuffer?.length);
      
    } catch (pdfError: any) {
      console.error('🔍 PDF_GENERATION_ERROR: =================================');
      console.error('🔍 PDF_GENERATION_ERROR: DETAILED ERROR ANALYSIS');
      console.error('🔍 PDF_GENERATION_ERROR: =================================');
      console.error('🔍 PDF_GENERATION_ERROR: Error message:', pdfError?.message || 'Unknown error');
      console.error('🔍 PDF_GENERATION_ERROR: Error name:', pdfError?.name || 'Unknown name');
      console.error('🔍 PDF_GENERATION_ERROR: Error constructor:', pdfError?.constructor?.name || 'Unknown constructor');
      console.error('🔍 PDF_GENERATION_ERROR: Error type:', typeof pdfError);
      
      // Analyze the stack trace for specific clues
      if (pdfError?.stack) {
        console.error('🔍 PDF_GENERATION_ERROR: Full stack trace:');
        const stackLines = pdfError.stack.split('\n');
        stackLines.forEach((line, index) => {
          console.error(`🔍 PDF_GENERATION_ERROR: Stack[${index}]: ${line.trim()}`);
        });
        
        // Look for specific patterns that indicate the problem
        const criticalLines = stackLines.filter(line => 
          line.includes('pdf_generator_module') || 
          line.includes('pdfkit') || 
          line.includes('constructor') ||
          line.includes('widthOfString') ||
          line.includes('new ')
        );
        
        if (criticalLines.length > 0) {
          console.error('🔍 PDF_GENERATION_ERROR: Critical stack lines:');
          criticalLines.forEach((line, index) => {
            console.error(`🔍 PDF_GENERATION_ERROR: Critical[${index}]: ${line.trim()}`);
          });
        }
      }
      
      // Test specific hypotheses about the error
      console.error('🔍 PDF_GENERATION_ERROR: HYPOTHESIS TESTING:');
      
      // Hypothesis 1: PDFKit constructor issue
      try {
        const PDFDocument = require('pdfkit');
        const testDoc = new PDFDocument();
        console.error('🔍 PDF_GENERATION_ERROR: PDFKit constructor test: SUCCESS');
        testDoc.end();
      } catch (constructorError) {
        console.error('🔍 PDF_GENERATION_ERROR: PDFKit constructor test: FAILED -', constructorError.message);
      }
      
      // Hypothesis 2: Font loading issue
      try {
        const PDFDocument = require('pdfkit');
        const testDoc = new PDFDocument();
        const testWidth = testDoc.widthOfString('test');
        console.error('🔍 PDF_GENERATION_ERROR: Font width test: SUCCESS -', testWidth);
        testDoc.end();
      } catch (fontError) {
        console.error('🔍 PDF_GENERATION_ERROR: Font width test: FAILED -', fontError.message);
      }
      
      console.error('🔍 PDF_GENERATION_ERROR: Module config analysis:', {
        qrCodeCount: moduleConfig.qrCodeCount,
        qrCodesLength: moduleConfig.qrCodes?.length,
        qrCodesValid: moduleConfig.qrCodes?.every(qr => qr.label && qr.id && qr.imageData),
        paperSize: moduleConfig.paperSize,
        hasMargin: !!moduleConfig.margin,
        qrCodeSize: moduleConfig.qrCodeSize
      });
      
      console.error('🔍 PDF_GENERATION_ERROR: =================================');
      
      return NextResponse.json(
        { 
          success: false, 
          error: `PDF generation failed: ${pdfError?.message || 'Unknown error'}`,
          details: {
            qrCodeCount: moduleConfig.qrCodeCount,
            hasQRCodes: !!moduleConfig.qrCodes,
            qrCodesLength: moduleConfig.qrCodes?.length
          }
        },
        { status: 500 }
      );
    }
    
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
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}