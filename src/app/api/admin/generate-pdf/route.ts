import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import fs from 'fs';
import path from 'path';
// Dynamic import for PDF generator to handle build environment differences
let generatePDFBuffer: (config: any) => Promise<Buffer>;

const loadPDFGenerator = async () => {
  try {
    const pdfModule = await import('@/lib/pdf_generator_module.js');
    generatePDFBuffer = pdfModule.generatePDFBuffer;
  } catch (error) {
    console.warn('PDF generator module not available:', error);
    // Fallback implementation
    generatePDFBuffer = async (config: any) => {
      // Return a minimal PDF buffer as fallback
      return Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(PDF Generation Unavailable) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000200 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n284\n%%EOF', 'utf8');
    };
  }
};

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


// 🔤 FONT_FIX_STRATEGY: Comprehensive font setup for API route
const setupFontsForAPI = () => {
  console.log('🔤 FONT_API_DEBUG: === API FONT SETUP START ===');
  console.log('🔤 FONT_API_DEBUG: API route starting, cwd:', process.cwd());
  console.log('🔤 FONT_API_DEBUG: __dirname:', __dirname);
  
  // Strategy 1A: Set font path using absolute path from project root
  const projectRoot = process.cwd();
  const fontDataPath = path.join(projectRoot, 'node_modules', 'pdfkit', 'js', 'data');
  
  console.log('🔤 FONT_PATH_DEBUG: Calculated font path:', fontDataPath);
  console.log('🔤 FONT_PATH_DEBUG: Font directory exists:', fs.existsSync(fontDataPath));
  
  if (fs.existsSync(fontDataPath)) {
    // Strategy 1B: Check font file permissions in API context
    const helveticaPath = path.join(fontDataPath, 'Helvetica.afm');
    console.log('🔤 FONT_PERM_DEBUG: Helvetica path:', helveticaPath);
    console.log('🔤 FONT_PERM_DEBUG: Helvetica exists:', fs.existsSync(helveticaPath));
    
    if (fs.existsSync(helveticaPath)) {
      try {
        const stats = fs.statSync(helveticaPath);
        console.log('🔤 FONT_PERM_DEBUG: Font file stats:', {
          size: stats.size,
          mode: stats.mode.toString(8),
          uid: stats.uid,
          gid: stats.gid
        });
        
        // Test read access
        fs.accessSync(helveticaPath, fs.constants.R_OK);
        console.log('🔤 FONT_PERM_DEBUG: Font file is readable ✅');
      } catch (permError) {
        const errorMessage = permError instanceof Error ? permError.message : String(permError);
        console.error('🔤 FONT_PERM_DEBUG: Font permission error:', errorMessage);
      }
    }
    
    // Strategy 1C: Set environment variable BEFORE any PDFKit imports
    console.log('🔤 FONT_ENV_DEBUG: PDFKIT_DATA_PATH before:', process.env.PDFKIT_DATA_PATH);
    process.env.PDFKIT_DATA_PATH = fontDataPath;
    console.log('🔤 FONT_ENV_DEBUG: PDFKIT_DATA_PATH after:', process.env.PDFKIT_DATA_PATH);
    
    // Strategy 1D: Clear PDFKit from require cache to force reinitialization
    const pdfkitCacheKeys = Object.keys(require.cache).filter(key => 
      key.includes('pdfkit') || key.includes('PDFDocument')
    );
    console.log('🔤 FONT_CACHE_DEBUG: PDFKit cache keys found:', pdfkitCacheKeys.length);
    
    pdfkitCacheKeys.forEach(key => {
      console.log('🔤 FONT_CACHE_DEBUG: Clearing cache for:', key);
      delete require.cache[key];
    });
    
    console.log('🔤 FONT_API_DEBUG: === API FONT SETUP COMPLETE ===');
    return true;
  } else {
    console.error('🔤 FONT_API_DEBUG: Font directory not found!');
    return false;
  }
};

// Execute font setup immediately when API route loads
setupFontsForAPI();

export async function POST(request: NextRequest) {
  try {
    // Load PDF generator module dynamically
    await loadPDFGenerator();

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
        stackLines.forEach((line: string, index: number) => {
          console.error(`🔍 PDF_GENERATION_ERROR: Stack[${index}]: ${line.trim()}`);
        });
        
        // Look for specific patterns that indicate the problem
        const criticalLines = stackLines.filter((line: string) => 
          line.includes('pdf_generator_module') || 
          line.includes('pdfkit') || 
          line.includes('constructor') ||
          line.includes('widthOfString') ||
          line.includes('new ')
        );
        
        if (criticalLines.length > 0) {
          console.error('🔍 PDF_GENERATION_ERROR: Critical stack lines:');
          criticalLines.forEach((line: string, index: number) => {
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
        const errorMessage = constructorError instanceof Error ? constructorError.message : String(constructorError);
        console.error('🔍 PDF_GENERATION_ERROR: PDFKit constructor test: FAILED -', errorMessage);
      }
      
      // Hypothesis 2: Font loading issue
      try {
        const PDFDocument = require('pdfkit');
        const testDoc = new PDFDocument();
        const testWidth = testDoc.widthOfString('test');
        console.error('🔍 PDF_GENERATION_ERROR: Font width test: SUCCESS -', testWidth);
        testDoc.end();
      } catch (fontError) {
        const errorMessage = fontError instanceof Error ? fontError.message : String(fontError);
        console.error('🔍 PDF_GENERATION_ERROR: Font width test: FAILED -', errorMessage);
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
    const pdfBody = new Uint8Array(pdfBuffer);
    return new NextResponse(pdfBody, {
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
