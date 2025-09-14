const fs = require('fs');
const path = require('path');

// Test the PDF module directly with a simple case to see label positioning
async function testLabelPositioningFix() {
  console.log('🔍 Testing PDF module label positioning...');
  
  try {
    // Import the PDF generator module
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    // Create a simple test case with one QR code
    const testQRCodes = [{
      id: 'test-item-1',
      label: 'TEST LABEL',
      imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    }];
    
    const testConfig = {
      paperSize: 'A4',
      margin: '10mm',
      qrCodeCount: 1,
      qrCodesPerRow: 1,
      qrCodeSize: '40mm',
      showCutlines: true,
      includeCutlines: true,
      showLabels: true,
      includeLabels: true,
      debug: true, // Enable debug mode to see positioning
      outputFileName: 'test-label-positioning.pdf',
      qrCodes: testQRCodes
    };
    
    console.log('🔄 Generating test PDF with config:', testConfig);
    
    // Generate PDF
    const pdfBuffer = await pdfModule.generatePDFBuffer(testConfig);
    
    // Save to tmp folder
    const outputPath = path.join(__dirname, 'tmp', 'test-label-positioning.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ Test PDF generated:', outputPath);
    console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
    
    // Analyze the generated PDF
    const pdfContent = pdfBuffer.toString('latin1');
    
    // Check for label text
    const hasTestLabel = pdfContent.includes('TEST LABEL');
    console.log('🔍 Contains "TEST LABEL":', hasTestLabel);
    
    // Check text positioning
    const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('📝 Text blocks found:', textBlocks.length);
    
    textBlocks.forEach((block, index) => {
      if (block.includes('TEST LABEL')) {
        console.log(`\n--- Label Text Block ${index + 1} ---`);
        console.log(block);
        
        // Extract positioning
        const posMatch = block.match(/([\d.-]+)\s+([\d.-]+)\s+Td/);
        if (posMatch) {
          console.log(`📍 Label position: X=${posMatch[1]}, Y=${posMatch[2]}`);
        }
        
        // Extract font size
        const fontMatch = block.match(/\/([A-Za-z]+)\s+([\d.]+)\s+Tf/);
        if (fontMatch) {
          console.log(`🔤 Font: ${fontMatch[1]} ${fontMatch[2]}pt`);
        }
      }
    });
    
    // Check for image objects
    const imageObjects = pdfContent.match(/\/Type\s+\/XObject/g) || [];
    console.log('🖼️ Image objects found:', imageObjects.length);
    
    // Check page dimensions
    const pageMatch = pdfContent.match(/\/MediaBox\s+\[[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\]/);
    if (pageMatch) {
      console.log(`📏 Page size: ${pageMatch[1]} x ${pageMatch[2]} points`);
    }
    
  } catch (error) {
    console.error('❌ Error testing PDF module:', error);
    console.error('Stack trace:', error.stack);
  }
}

testLabelPositioningFix().catch(console.error);

