/**
 * PDF QR Code Generator Module
 * 
 * A reusable Node.js module for generating professional PDF layouts with embedded QR codes.
 * Perfect for creating printable QR code sheets for hospitality, office management, inventory tracking, and more.
 * 
 * Features:
 * - Multiple Layout Modes: Adaptive grid layout and fixed box positioning
 * - Flexible Paper Sizes: A0-A6, Letter, Legal, Tabloid, Ledger
 * - Custom Margins: Predefined (none, thin, standard, large) or custom measurements
 * - QR Code Sizing: Predefined sizes or custom dimensions in cm, mm, or inches
 * - Actual QR Code Embedding: Real QR codes embedded in PDF (not just placeholders)
 * - Professional Cutlines: Vector cutlines for precise cutting
 * - Debug Mode: Visual guides for development and layout debugging
 * - Multiple Output Formats: File save, Buffer for web responses
 * 
 * @author PDF Generator Module
 * @version 2.0.0
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Pre-configure PDFKit font paths for Next.js production environment
const originalDataPath = PDFDocument.prototype.dataPath;
if (!originalDataPath) {
  // Set data path for font files
  const projectRoot = process.cwd();
  const publicFontsPath = path.join(projectRoot, 'public', 'fonts');
  const pdfkitFontsPath = path.join(projectRoot, 'node_modules', 'pdfkit', 'js', 'data');
  
  let fontsPath;
  if (fs.existsSync(publicFontsPath)) {
    fontsPath = publicFontsPath;
    console.log('🔍 FONT_INIT_DEBUG: Using public fonts directory:', fontsPath);
  } else if (fs.existsSync(pdfkitFontsPath)) {
    fontsPath = pdfkitFontsPath;
    console.log('🔍 FONT_INIT_DEBUG: Using PDFKit fonts directory:', fontsPath);
  } else {
    // Fallback - try to find fonts in node_modules
    const fallbackPath = path.join(__dirname, '..', '..', 'node_modules', 'pdfkit', 'js', 'data');
    if (fs.existsSync(fallbackPath)) {
      fontsPath = fallbackPath;
      console.log('🔍 FONT_INIT_DEBUG: Using fallback fonts directory:', fontsPath);
    }
  }
  
  if (fontsPath) {
    // Monkey patch PDFKit to use our font path
    const originalRequire = require;
    const Module = require('module');
    const originalRequireResolve = Module._resolveFilename;
    
    Module._resolveFilename = function(request, parent, isMain) {
      if (request.includes('pdfkit/js/data/') && request.endsWith('.afm')) {
        const fontFile = path.basename(request);
        const newPath = path.join(fontsPath, fontFile);
        if (fs.existsSync(newPath)) {
          console.log(`🔍 FONT_RESOLVE_DEBUG: Redirecting ${request} to ${newPath}`);
          return newPath;
        }
      }
      return originalRequireResolve.call(this, request, parent, isMain);
    };
  }
}

// QR Code generation - using qrcode library if available, fallback to placeholder
let QRCode;
try {
  QRCode = require('qrcode');
} catch (error) {
  console.warn('QRCode library not found. Install with: npm install qrcode');
  console.warn('Using placeholder rectangles instead of actual QR codes.');
  QRCode = null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert various units to PDF points (72 points = 1 inch)
 * @param {string|number} value - Value with unit (e.g., "1cm", "1in", "1mm") or number
 * @returns {number} Value in points
 * @example
 * convertToPoints("2.5cm") // Returns 70.87
 * convertToPoints("1in")   // Returns 72
 * convertToPoints(100)     // Returns 100
 */
function convertToPoints(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (value.endsWith('cm')) {
      return parseFloat(value) * 28.35; // 1cm = 28.35 points
    } else if (value.endsWith('in')) {
      return parseFloat(value) * 72; // 1in = 72 points
    } else if (value.endsWith('mm')) {
      return parseFloat(value) * 2.835; // 1mm = 2.835 points
    }
  }
  return parseFloat(value) || 0;
}

/**
 * Get paper size dimensions in points
 * @param {string} size - Paper size name (A0-A6, Letter, Legal, Tabloid, Ledger)
 * @returns {number[]} [width, height] in points
 * @example
 * getPaperSize("A4")     // Returns [595.28, 841.89]
 * getPaperSize("Letter") // Returns [612, 792]
 */
function getPaperSize(size) {
  const sizes = {
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

/**
 * Calculate margin size in points based on margin type and paper size
 * @param {string} marginType - Margin type ('none', 'thin', 'standard', 'large') or custom value
 * @param {number[]} paperSize - Paper dimensions [width, height] in points
 * @returns {number} Margin size in points
 * @example
 * getMarginSize("standard", [595, 842]) // Returns ~29.8 (5% of min dimension)
 * getMarginSize("2cm", [595, 842])      // Returns 56.7
 */
function getMarginSize(marginType, paperSize) {
  const [width, height] = paperSize;
  const minDimension = Math.min(width, height);
  
  switch (marginType) {
    case 'none': return 0;
    case 'thin': return minDimension * 0.02; // 2% of min dimension
    case 'standard': return minDimension * 0.05; // 5% of min dimension
    case 'large': return minDimension * 0.08; // 8% of min dimension
    default: return convertToPoints(marginType);
  }
}

/**
 * Calculate QR code size in points based on size type and available space
 * @param {string} sizeType - Size type ('small', 'medium', 'large') or custom value
 * @param {number} availableSpace - Available space for scaling in points
 * @returns {number} QR code size in points
 * @example
 * getQRCodeSize("medium", 200) // Returns 100 (50% of available space)
 * getQRCodeSize("3cm", 200)    // Returns 85.05 (3cm in points)
 */
function getQRCodeSize(sizeType, availableSpace) {
  switch (sizeType) {
    case 'small': return availableSpace * 0.3;
    case 'medium': return availableSpace * 0.5;
    case 'large': return availableSpace * 0.7;
    default: return convertToPoints(sizeType);
  }
}

/**
 * Generate QR code as PNG buffer (external helper function - not used in PDF generation)
 * This function is provided as a utility for generating QR codes before passing to PDF functions
 * @param {string} data - Data to encode in QR code
 * @param {number} size - Size in pixels for the QR code
 * @returns {Promise<Buffer|null>} QR code as PNG buffer, or null if generation fails
 * @example
 * const qrBuffer = await generateQRCodeBuffer("https://example.com", 200);
 * // Then pass qrBuffer to PDF function in qrCode.imageData
 */
async function generateQRCodeBuffer(data, size = 200) {
  if (!QRCode) {
    return null; // QRCode library not available
  }
  
  try {
    // Generate QR code as PNG buffer
    const buffer = await QRCode.toBuffer(data, {
      type: 'png',
      width: size,
      margin: 1,
      color: {
        dark: '#000000',  // QR code color
        light: '#FFFFFF' // Background color
      }
    });
    return buffer;
  } catch (error) {
    console.error('Failed to generate QR code:', error.message);
    return null;
  }
}

// ============================================================================
// CORE PDF GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate a single PDF with QR code layout (internal function)
 * @private
 * @param {Object} config - Configuration object for the PDF
 * @param {string} config.paperSize - Paper size ('A4', 'Letter', etc.)
 * @param {string} config.margin - Margin size ('none', 'thin', 'standard', 'large', or custom)
 * @param {number} config.qrCodeCount - Number of QR codes to generate
 * @param {number} config.qrCodesPerRow - QR codes per row
 * @param {string} config.qrCodeSize - QR code size ('small', 'medium', 'large', or custom)
 * @param {string|null} config.qrBoxMargin - Box margin for fixed layout (null = adaptive grid)
 * @param {boolean} config.showCutlines - Show cutting guides
 * @param {boolean} config.debug - Show visual debug guides (borders, margin boxes)
 * @param {Array} config.qrCodes - Array of QR code data objects
 * @param {string} outputPath - Full path where to save the PDF
 * @returns {Promise<string>} Resolves with the output path on success
 */
function generatePDF(config, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      /**
       * Default configuration values for PDF generation
       * These values are used when properties are not specified in the config
       */
      const defaults = {
        paperSize: 'A4',        // Paper size: A0, A1, A2, A3, A4, A5, A6, Letter, Legal, Tabloid, Ledger
        margin: 'standard',     // Margin: 'none', 'thin', 'standard', 'large', or custom (e.g., '2cm', '1in')
        qrCodeCount: 4,         // Number of QR codes to generate
        qrCodesPerRow: 2,       // Number of QR codes per row
        qrCodeSize: 'medium',   // QR code size: 'small', 'medium', 'large', or custom (e.g., '3cm', '1.5in')
        qrBoxMargin: null,      // Box margin for fixed layout: null = adaptive grid, value = fixed box layout
        showCutlines: true,     // Show cutting guides: true = show cutlines for cutting, false = hide cutlines
        debug: false,           // Debug mode: false = clean output, true = show visual debug guides
        title: null,            // Optional title to display at top of PDF
        qrCodes: [              // Default QR code data array - accepts pre-generated QR code images
          { id: 'qr-1', label: 'QR Code 1', imageData: null },  // imageData: Buffer or base64 string
          { id: 'qr-2', label: 'QR Code 2', imageData: null },
          { id: 'qr-3', label: 'QR Code 3', imageData: null },
          { id: 'qr-4', label: 'QR Code 4', imageData: null }
        ]
      };
      
      const finalConfig = { ...defaults, ...config };
      
      // Get paper dimensions
      const paperSize = getPaperSize(finalConfig.paperSize);
      const [pageWidth, pageHeight] = paperSize;
      
      // Calculate margin
      const margin = getMarginSize(finalConfig.margin, paperSize);
      
      // Calculate content dimensions for all layouts
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      // Determine layout mode
      const useFixedBoxes = finalConfig.qrBoxMargin !== null;
      let cellWidth, cellHeight, qrSize;
      const labelHeight = 25;
      
      if (useFixedBoxes) {
        // Fixed box layout: boxes positioned from upper-left with fixed margins
        const boxMargin = convertToPoints(finalConfig.qrBoxMargin);
        
        // Calculate QR code size first
        qrSize = getQRCodeSize(finalConfig.qrCodeSize, 200); // Use 200pts as reference for fixed sizing
        
        // Calculate box dimensions (QR + label + internal padding)
        const boxPadding = 20; // Internal padding within each box
        cellWidth = qrSize + (2 * boxPadding);
        cellHeight = qrSize + labelHeight + (2 * boxPadding);
        
        // Store box margin for positioning calculations
        finalConfig._boxMargin = boxMargin;
      } else {
        // Adaptive grid layout (original behavior)
        const gridCols = finalConfig.qrCodesPerRow;
        const gridRows = Math.ceil(finalConfig.qrCodeCount / gridCols);
        cellWidth = contentWidth / gridCols;
        cellHeight = contentHeight / gridRows;
        
        // Calculate QR code size based on available cell space
        const maxCellDimension = Math.min(cellWidth, cellHeight);
        qrSize = getQRCodeSize(finalConfig.qrCodeSize, maxCellDimension * 0.8);
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Create PDF document
      const doc = new PDFDocument({
        size: [pageWidth, pageHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });
      
      // Create output file stream
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);
      
      // Add page border for reference (only in debug mode)
      if (finalConfig.debug) {
        doc.rect(0, 0, pageWidth, pageHeight)
           .stroke('#000000');
      }
      
      // Add margin guides (only if margin > 0 and debug mode)
      if (margin > 0 && finalConfig.debug) {
        doc.rect(margin, margin, contentWidth, contentHeight)
           .stroke('#CCCCCC');
      }
      
      // Generate QR codes
      const qrCodesToGenerate = finalConfig.qrCodes.slice(0, finalConfig.qrCodeCount);
      
      for (let i = 0; i < qrCodesToGenerate.length; i++) {
        const row = Math.floor(i / finalConfig.qrCodesPerRow);
        const col = i % finalConfig.qrCodesPerRow;
        const qrData = qrCodesToGenerate[i];
        
        let cellX, cellY, qrX, qrY;
        
        if (useFixedBoxes) {
          // Fixed box positioning from upper-left
          const boxMargin = finalConfig._boxMargin;
          cellX = margin + boxMargin + (col * (cellWidth + boxMargin));
          cellY = margin + boxMargin + (row * (cellHeight + boxMargin));
          
          // Center QR code within the fixed-size box
          qrX = cellX + (cellWidth - qrSize) / 2;
          qrY = cellY + (cellHeight - qrSize - labelHeight) / 2;
        } else {
          // Adaptive grid positioning (original behavior)
          cellX = margin + (col * cellWidth);
          cellY = margin + (row * cellHeight);
          
          // Center QR code within cell
          qrX = cellX + (cellWidth - qrSize) / 2;
          qrY = cellY + (cellHeight - qrSize - labelHeight) / 2;
          
          // Ensure QR code fits within bounds
          qrY = Math.max(cellY + 10, Math.min(qrY, cellY + cellHeight - qrSize - labelHeight - 10));
        }
        
        // Draw QR code (pre-generated image or placeholder)
        if (qrData.imageData) {
          // Use pre-generated QR code image
          doc.image(qrData.imageData, qrX, qrY, { width: qrSize, height: qrSize });
        } else {
          // Draw placeholder rectangle
          doc.rect(qrX, qrY, qrSize, qrSize)
             .fillAndStroke('#E0E0E0', '#000000');
          
          // Add QR code ID text (top-left of QR code placeholder)
          doc.fontSize(Math.max(8, qrSize * 0.08))
             .fillColor('#000000')
             .text(qrData.id, qrX + 5, qrY + 5);
        }
        
        // Add label below QR code (centered)
        doc.fontSize(Math.max(6, qrSize * 0.06))
           .fillColor('#000000');
        
        const labelWidth = doc.widthOfString(qrData.label);
        const labelX = qrX + (qrSize - labelWidth) / 2;
        const labelY = qrY + qrSize + 8;
        
        doc.text(qrData.label, labelX, labelY);
        
        // Draw box outline for fixed box layout (optional visual aid, only in debug mode)
        if (useFixedBoxes && finalConfig.showCutlines && finalConfig.debug) {
          doc.rect(cellX, cellY, cellWidth, cellHeight)
             .stroke('#CCCCCC');
        }
      }
      
      // Add cutlines if enabled
      if (finalConfig.showCutlines) {
        if (useFixedBoxes) {
          // For fixed box layout, draw cutlines around individual boxes
          const boxMargin = finalConfig._boxMargin;
          
          for (let i = 0; i < qrCodesToGenerate.length; i++) {
            const row = Math.floor(i / finalConfig.qrCodesPerRow);
            const col = i % finalConfig.qrCodesPerRow;
            
            const cellX = margin + boxMargin + (col * (cellWidth + boxMargin));
            const cellY = margin + boxMargin + (row * (cellHeight + boxMargin));
            
            // Draw dashed cutlines around each box
            doc.dash(3, { space: 2 });
            doc.rect(cellX - boxMargin/2, cellY - boxMargin/2, 
                    cellWidth + boxMargin, cellHeight + boxMargin)
               .stroke('#FF0000');
            doc.undash();
          }
        } else {
          // Original adaptive grid cutlines
          const gridCols = finalConfig.qrCodesPerRow;
          const gridRows = Math.ceil(finalConfig.qrCodeCount / gridCols);
          const adaptiveCellWidth = contentWidth / gridCols;
          const adaptiveCellHeight = contentHeight / gridRows;
          
          // Add grid cutlines (dashed)
          doc.dash(3, { space: 2 });
          
          // Vertical cutlines
          for (let col = 1; col < gridCols; col++) {
            const x = margin + (col * adaptiveCellWidth);
            doc.moveTo(x, margin)
               .lineTo(x, pageHeight - margin)
               .stroke('#999999');
          }
          
          // Horizontal cutlines
          for (let row = 1; row < gridRows; row++) {
            const y = margin + (row * adaptiveCellHeight);
            doc.moveTo(margin, y)
               .lineTo(pageWidth - margin, y)
               .stroke('#999999');
          }
          
          // Reset dash pattern for solid lines
          doc.undash();
        }
        
        // Add outer cutlines (solid red lines for cutting) - both layouts
        // Show when cutlines are enabled and there are margins
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
      
      // Note: doc.info metadata not supported in this PDFKit version
      
      // Finalize PDF
      doc.end();
      
      // Wait for the write stream to finish
      writeStream.on('finish', () => {
        resolve(outputPath);
      });
      
      writeStream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Generate multiple PDFs from JSON string configuration
 * 
 * @param {string} jsonString - JSON string containing array of PDF configurations
 * @param {Object} [pdfOutput] - PDF output configuration (same as generateSinglePDF)
 * @returns {Promise<Array<Object>>} Array of generation results
 * 
 * @example
 * const jsonConfig = JSON.stringify([
 *   {
 *     paperSize: "A4",
 *     qrCodeCount: 4,
 *     qrCodesPerRow: 2,
 *     outputFileName: "sheet1.pdf",
 *     qrCodes: [
 *       { id: "qr-1", label: "WiFi Password" },
 *       { id: "qr-2", label: "Guest Guide" }
 *     ]
 *   }
 * ]);
 * 
 * const results = await generatePDFsFromJSON(jsonConfig, 'output');
 * results.forEach(result => {
 *   if (result.success) {
 *     console.log(`Generated: ${result.outputPath}`);
 *   } else {
 *     console.error(`Error: ${result.error}`);
 *   }
 * });
 */
async function generatePDFsFromJSON(jsonString, pdfOutput = null) {
  try {
    let configs;
    
    try {
      configs = JSON.parse(jsonString);
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }
    
    // Ensure configs is an array
    if (!Array.isArray(configs)) {
      configs = [configs]; // Convert single config to array
    }
    
    if (configs.length === 0) {
      throw new Error('Configuration array is empty');
    }
    
    // Process each configuration
    const results = [];
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      
      // Create individual pdfOutput for each config
      let individualPdfOutput = pdfOutput;
      if (!individualPdfOutput) {
        individualPdfOutput = {
          type: 'file',
          path: 'tmp',
          name: config.outputFileName || `qr-sheet-${i + 1}.pdf`
        };
      } else if (individualPdfOutput.type === 'file' && individualPdfOutput.name && individualPdfOutput.name.includes('*')) {
        // Handle wildcard naming for multiple files
        individualPdfOutput = {
          ...individualPdfOutput,
          name: individualPdfOutput.name.replace('*', `${Math.floor(Date.now() / 1000)}-${i + 1}`)
        };
      }
      
      try {
        const result = await generateSinglePDF(config, individualPdfOutput);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          type: individualPdfOutput?.type || 'unknown',
          error: error.message,
          config: config
        });
      }
    }
    
    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate a single PDF from a configuration object
 * 
 * @param {Object} config - PDF configuration object
 * @param {string} [config.paperSize='A4'] - Paper size (A0-A6, Letter, Legal, Tabloid, Ledger)
 * @param {string} [config.margin='standard'] - Margin ('none', 'thin', 'standard', 'large', or custom like '2cm')
 * @param {number} [config.qrCodeCount=4] - Number of QR codes to generate
 * @param {number} [config.qrCodesPerRow=2] - QR codes per row
 * @param {string} [config.qrCodeSize='medium'] - QR code size ('small', 'medium', 'large', or custom like '3cm')
 * @param {string|null} [config.qrBoxMargin=null] - Box margin for fixed layout (null = adaptive grid)
 * @param {boolean} [config.showCutlines=true] - Show cutting guides
 * @param {boolean} [config.debug=false] - Show visual debug guides (borders, margin boxes)
 * @param {Array} [config.qrCodes] - Array of QR code data objects {id, label}
 * @param {Object} [pdfOutput] - PDF output configuration
 * @param {string} [pdfOutput.type='file'] - Output type: 'file' or 'blob'
 * @param {string} [pdfOutput.path] - Full file path (required for type='file')
 * @param {string} [pdfOutput.name] - Filename or pattern with * for epoch (e.g., 'qr-codes*.pdf')
 * @returns {Promise<Object>} Generation result object
 * 
 * @example
 * // Generate PDF as file with specific path
 * const result = await generateSinglePDF({
 *   paperSize: "A4",
 *   qrCodeCount: 4,
 *   qrCodes: [
 *     { id: "wifi", label: "WiFi Password" },
 *     { id: "guide", label: "Guest Guide" }
 *   ]
 * }, {
 *   type: 'file',
 *   path: '/Users/myuser/Documents',
 *   name: 'qr-codes.pdf'
 * });
 * 
 * // Generate PDF with wildcard naming (epoch-based unique name)
 * const wildcardResult = await generateSinglePDF({
 *   paperSize: "A4",
 *   qrCodeCount: 2
 * }, {
 *   type: 'file',
 *   path: './output',
 *   name: 'qr-codes-*.pdf'  // * will be replaced with Unix epoch
 * });
 * 
 * // Generate PDF as blob/buffer
 * const blobResult = await generateSinglePDF({
 *   paperSize: "A4",
 *   qrCodeCount: 4
 * }, {
 *   type: 'blob'
 * });
 * 
 * if (blobResult.success) {
 *   console.log(`PDF blob size: ${blobResult.size} bytes`);
 *   // Use blobResult.data as Buffer
 * }
 * 
 * // Default behavior (backward compatibility)
 * const defaultResult = await generateSinglePDF({
 *   paperSize: "A4",
 *   outputFileName: "my-qr-codes.pdf"
 * }); // Saves to tmp/ directory
 */
async function generateSinglePDF(config, pdfOutput = null) {
  try {
    // Set default pdfOutput if not provided
    if (!pdfOutput) {
      pdfOutput = {
        type: 'file',
        path: 'tmp',
        name: config.outputFileName || `qr-sheet-${Date.now()}.pdf`
      };
    }
    
    // Validate pdfOutput configuration
    if (!pdfOutput.type) {
      pdfOutput.type = 'file';
    }
    
    if (pdfOutput.type === 'blob') {
      // Generate PDF as blob/buffer
      const pdfBuffer = await generatePDFBuffer(config);
      return {
        success: true,
        type: 'blob',
        data: pdfBuffer,
        size: pdfBuffer.length,
        config: config
      };
    } else if (pdfOutput.type === 'file') {
      // Generate PDF as file
      let outputPath;
      
      if (pdfOutput.path) {
        // Full path provided
        if (pdfOutput.name) {
          // Process name pattern with * for epoch
          let fileName = pdfOutput.name;
          if (fileName.includes('*')) {
            const epoch = Math.floor(Date.now() / 1000); // Unix epoch in seconds
            fileName = fileName.replace('*', epoch.toString());
          }
          outputPath = path.join(pdfOutput.path, fileName);
        } else {
          // Use path as full file path
          outputPath = pdfOutput.path;
        }
      } else {
        // Fallback to default behavior
        const fileName = pdfOutput.name || config.outputFileName || `qr-sheet-${Date.now()}.pdf`;
        outputPath = path.join('tmp', fileName);
      }
      
      await generatePDF(config, outputPath);
      return {
        success: true,
        type: 'file',
        outputPath: outputPath,
        config: config
      };
    } else {
      throw new Error(`Invalid pdfOutput.type: '${pdfOutput.type}'. Must be 'file' or 'blob'.`);
    }
  } catch (error) {
    return {
      success: false,
      type: pdfOutput?.type || 'unknown',
      error: error.message,
      config: config
    };
  }
}

/**
 * Generate PDF and return as Buffer (for web applications)
 * 
 * Perfect for Express.js endpoints that need to return PDF data directly to the client.
 * 
 * @param {Object} config - PDF configuration object (same as generateSinglePDF)
 * @param {string} [config.paperSize='A4'] - Paper size (A0-A6, Letter, Legal, Tabloid, Ledger)
 * @param {string} [config.margin='standard'] - Margin ('none', 'thin', 'standard', 'large', or custom)
 * @param {number} [config.qrCodeCount=4] - Number of QR codes to generate
 * @param {number} [config.qrCodesPerRow=2] - QR codes per row
 * @param {string} [config.qrCodeSize='medium'] - QR code size ('small', 'medium', 'large', or custom)
 * @param {string|null} [config.qrBoxMargin=null] - Box margin for fixed layout (null = adaptive grid)
 * @param {boolean} [config.showCutlines=true] - Show cutting guides
 * @param {boolean} [config.debug=false] - Show visual debug guides
 * @param {Array} [config.qrCodes] - Array of QR code data objects {id, label}
 * @returns {Promise<Buffer>} PDF as Buffer
 * 
 * @example
 * // Express.js endpoint
 * app.post('/api/generate-qr-pdf', async (req, res) => {
 *   try {
 *     const pdfBuffer = await generatePDFBuffer(req.body);
 *     
 *     res.setHeader('Content-Type', 'application/pdf');
 *     res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');
 *     res.send(pdfBuffer);
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * // Direct usage
 * const buffer = await generatePDFBuffer({
 *   paperSize: "A4",
 *   qrCodeCount: 2,
 *   qrCodes: [
 *     { id: "test1", label: "Test QR 1" },
 *     { id: "test2", label: "Test QR 2" }
 *   ]
 * });
 * 
 * console.log(`PDF buffer size: ${buffer.length} bytes`);
 */
function generatePDFBuffer(config) {
  return new Promise((resolve, reject) => {
    try {
      // Set default values for missing properties
      const defaults = {
        paperSize: 'A4',
        margin: 'standard',
        qrCodeCount: 4,
        qrCodesPerRow: 2,
        qrCodeSize: 'medium',
        qrBoxMargin: null,
        showCutlines: true,
        debug: false, // If false, hide visual debug guides (borders, margin boxes)
        qrCodes: [
          { id: 'qr-1', label: 'QR Code 1', imageData: null },
          { id: 'qr-2', label: 'QR Code 2', imageData: null },
          { id: 'qr-3', label: 'QR Code 3', imageData: null },
          { id: 'qr-4', label: 'QR Code 4', imageData: null }
        ]
      };
      
      const finalConfig = { ...defaults, ...config };
      
      // Get paper dimensions
      const paperSize = getPaperSize(finalConfig.paperSize);
      const [pageWidth, pageHeight] = paperSize;
      
      // Calculate margin
      const margin = getMarginSize(finalConfig.margin, paperSize);
      
      // Calculate content dimensions for all layouts
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      // Determine layout mode
      const useFixedBoxes = finalConfig.qrBoxMargin !== null;
      let cellWidth, cellHeight, qrSize;
      const labelHeight = 25;
      
      if (useFixedBoxes) {
        const boxMargin = convertToPoints(finalConfig.qrBoxMargin);
        qrSize = getQRCodeSize(finalConfig.qrCodeSize, 200);
        const boxPadding = 20;
        cellWidth = qrSize + (2 * boxPadding);
        cellHeight = qrSize + labelHeight + (2 * boxPadding);
        finalConfig._boxMargin = boxMargin;
      } else {
        const gridCols = finalConfig.qrCodesPerRow;
        const gridRows = Math.ceil(finalConfig.qrCodeCount / gridCols);
        cellWidth = contentWidth / gridCols;
        cellHeight = contentHeight / gridRows;
        const maxCellDimension = Math.min(cellWidth, cellHeight);
        qrSize = getQRCodeSize(finalConfig.qrCodeSize, maxCellDimension * 0.8);
      }
      
      // Create PDF document with comprehensive error handling for Next.js
      let doc;
      
      try {
        console.log('🔍 PDF_CREATE_DEBUG: Attempting to create PDFDocument...');
        doc = new PDFDocument({
          size: [pageWidth, pageHeight],
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          bufferPages: true,
          autoFirstPage: true,
          font: null // Disable default font loading
        });
        console.log('🔍 PDF_CREATE_DEBUG: PDFDocument created successfully');
      } catch (createError) {
        console.log('🔍 PDF_CREATE_ERROR: Failed to create PDFDocument:', createError.message);
        
        // Try alternative approach with minimal configuration
        try {
          console.log('🔍 PDF_CREATE_DEBUG: Trying minimal configuration...');
          doc = new PDFDocument({
            size: [pageWidth, pageHeight],
            autoFirstPage: false
          });
          doc.addPage();
          console.log('🔍 PDF_CREATE_DEBUG: Minimal PDFDocument created successfully');
        } catch (fallbackError) {
          console.log('🔍 PDF_CREATE_ERROR: Fallback PDFDocument creation failed:', fallbackError.message);
          throw new Error(`Cannot create PDF document: ${createError.message}`);
        }
      }
      
      // Comprehensive font method overrides
      console.log('🔍 PDF_OVERRIDE_DEBUG: Setting up font method overrides...');
      
      // Override widthOfString with robust fallback
      const originalWidthOfString = doc.widthOfString;
      doc.widthOfString = function(text, options) {
        try {
          return originalWidthOfString.call(this, text, options);
        } catch (error) {
          console.log('🔍 FONT_FALLBACK: widthOfString failed, using approximation for:', text);
          const fontSize = this._fontSize || (options && options.size) || 12;
          // More accurate character width estimation for better label centering
          const avgCharWidth = fontSize * 0.5; // Adjusted from 0.6 to 0.5 for better accuracy
          return Math.max((text || '').length * avgCharWidth, 0);
        }
      };
      
      // Override text method with font error handling
      const originalText = doc.text;
      doc.text = function(text, x, y, options) {
        try {
          return originalText.call(this, text, x, y, options);
        } catch (error) {
          console.log('🔍 FONT_FALLBACK: text method failed, using basic drawing for:', text);
          // Simple fallback - just draw text without font metrics
          this.save();
          this.fontSize(this._fontSize || 12);
          return originalText.call(this, text || '', x, y, { ...options, lineBreak: false });
        }
      };
      
      // Override fontSize to handle font loading errors
      const originalFontSize = doc.fontSize;
      doc.fontSize = function(size) {
        try {
          return originalFontSize.call(this, size);
        } catch (error) {
          console.log('🔍 FONT_FALLBACK: fontSize failed, storing size manually');
          this._fontSize = size;
          return this;
        }
      };
      
      console.log('🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete');
      
      // Collect PDF data in chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      // Add page border for reference (only in debug mode)
      if (finalConfig.debug) {
        doc.rect(0, 0, pageWidth, pageHeight)
           .stroke('#000000');
      }
      
      // Add margin guides (only if margin > 0 and debug mode)
      if (margin > 0 && finalConfig.debug) {
        doc.rect(margin, margin, contentWidth, contentHeight)
           .stroke('#CCCCCC');
      }
      
      // Generate QR codes (same logic as file version)
      const qrCodesToGenerate = finalConfig.qrCodes.slice(0, finalConfig.qrCodeCount);
      
      for (let i = 0; i < qrCodesToGenerate.length; i++) {
        const row = Math.floor(i / finalConfig.qrCodesPerRow);
        const col = i % finalConfig.qrCodesPerRow;
        const qrData = qrCodesToGenerate[i];
        
        let cellX, cellY, qrX, qrY;
        
        if (useFixedBoxes) {
          const boxMargin = finalConfig._boxMargin;
          cellX = margin + boxMargin + (col * (cellWidth + boxMargin));
          cellY = margin + boxMargin + (row * (cellHeight + boxMargin));
          qrX = cellX + (cellWidth - qrSize) / 2;
          qrY = cellY + (cellHeight - qrSize - labelHeight) / 2;
        } else {
          cellX = margin + (col * cellWidth);
          cellY = margin + (row * cellHeight);
          qrX = cellX + (cellWidth - qrSize) / 2;
          qrY = cellY + (cellHeight - qrSize - labelHeight) / 2;
          qrY = Math.max(cellY + 10, Math.min(qrY, cellY + cellHeight - qrSize - labelHeight - 10));
        }
        
        // Draw QR code (pre-generated image or placeholder)
        if (qrData.imageData) {
          // Use pre-generated QR code image
          doc.image(qrData.imageData, qrX, qrY, { width: qrSize, height: qrSize });
        } else {
          // Draw placeholder rectangle
          doc.rect(qrX, qrY, qrSize, qrSize)
             .fillAndStroke('#E0E0E0', '#000000');
          
          // Add QR code ID text (top-left of QR code placeholder)
          doc.fontSize(Math.max(8, qrSize * 0.08))
             .fillColor('#000000')
             .text(qrData.id, qrX + 5, qrY + 5);
        }
        
        // Add label below QR code (centered)
        const fontSize = Math.max(8, qrSize * 0.08); // Increased minimum font size for better visibility
        doc.fontSize(fontSize)
           .fillColor('#000000');
        
        const labelText = qrData.label || qrData.name || `Item ${i + 1}`;
        const labelWidth = doc.widthOfString(labelText);
        const labelX = qrX + (qrSize - labelWidth) / 2;
        const labelY = qrY + qrSize + 10; // Increased spacing for better readability
        
        console.log(`🔍 LABEL_DEBUG: Rendering "${labelText}" at (${labelX}, ${labelY}) with fontSize ${fontSize}`);
        doc.text(labelText, labelX, labelY);
        
        if (useFixedBoxes && finalConfig.showCutlines && finalConfig.debug) {
          doc.rect(cellX, cellY, cellWidth, cellHeight)
             .stroke('#CCCCCC');
        }
      }
      
      // Add cutlines if enabled
      if (finalConfig.showCutlines) {
        if (useFixedBoxes) {
          // For fixed box layout, draw cutlines around individual boxes
          const boxMargin = finalConfig._boxMargin;
          
          for (let i = 0; i < qrCodesToGenerate.length; i++) {
            const row = Math.floor(i / finalConfig.qrCodesPerRow);
            const col = i % finalConfig.qrCodesPerRow;
            
            const cellX = margin + boxMargin + (col * (cellWidth + boxMargin));
            const cellY = margin + boxMargin + (row * (cellHeight + boxMargin));
            
            // Draw dashed cutlines around each box
            doc.dash(3, { space: 2 });
            doc.rect(cellX - boxMargin/2, cellY - boxMargin/2, 
                    cellWidth + boxMargin, cellHeight + boxMargin)
               .stroke('#FF0000');
            doc.undash();
          }
        } else {
          // Original adaptive grid cutlines
          const gridCols = finalConfig.qrCodesPerRow;
          const gridRows = Math.ceil(finalConfig.qrCodeCount / gridCols);
          const adaptiveCellWidth = contentWidth / gridCols;
          const adaptiveCellHeight = contentHeight / gridRows;
          
          // Add grid cutlines (dashed)
          doc.dash(3, { space: 2 });
          
          // Vertical cutlines
          for (let col = 1; col < gridCols; col++) {
            const x = margin + (col * adaptiveCellWidth);
            doc.moveTo(x, margin)
               .lineTo(x, pageHeight - margin)
               .stroke('#999999');
          }
          
          // Horizontal cutlines
          for (let row = 1; row < gridRows; row++) {
            const y = margin + (row * adaptiveCellHeight);
            doc.moveTo(margin, y)
               .lineTo(pageWidth - margin, y)
               .stroke('#999999');
          }
          
          // Reset dash pattern for solid lines
          doc.undash();
        }
        
        // Add outer cutlines (solid red lines for cutting) - both layouts
        // Show when cutlines are enabled and there are margins
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
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Module exports for PDF QR Code Generator
 * 
 * Main Functions:
 * - generatePDFsFromJSON: Generate multiple PDFs from JSON string
 * - generateSinglePDF: Generate single PDF from config object  
 * - generatePDFBuffer: Generate PDF as Buffer for web responses
 * 
 * Helper Functions:
 * - convertToPoints: Convert units to PDF points
 * - getPaperSize: Get paper dimensions
 * - getMarginSize: Calculate margin size
 * - getQRCodeSize: Calculate QR code size
 * 
 * @example
 * const { generateSinglePDF, generatePDFBuffer } = require('./pdf_generator_module');
 * 
 * // Generate and save PDF
 * const result = await generateSinglePDF({
 *   paperSize: "A4",
 *   qrCodeCount: 4,
 *   outputFileName: "my-qr-codes.pdf"
 * }, 'output');
 * 
 * // Generate PDF buffer for web response
 * const buffer = await generatePDFBuffer({
 *   paperSize: "A4", 
 *   qrCodeCount: 2
 * });
 */
module.exports = {
  generatePDFsFromJSON,
  generateSinglePDF,
  generatePDFBuffer,
  generateQRCodeBuffer,  // Export QR generation helper function
  convertToPoints,
  getPaperSize,
  getMarginSize,
  getQRCodeSize
};