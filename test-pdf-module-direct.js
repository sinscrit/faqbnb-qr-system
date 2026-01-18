const fs = require('fs');
const path = require('path');

async function testPDFModuleDirect() {
  console.log('🔍 Testing PDF module directly to debug label visibility...');
  
  try {
    // Import the PDF generator module
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    // Create a simple test case with one QR code and very visible settings
    const testQRCodes = [{
      id: 'test-item-1',
      label: 'TEST LABEL - SHOULD BE VISIBLE',
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
      debug: true, // Enable debug mode
      outputFileName: 'test-direct-module.pdf',
      qrCodes: testQRCodes
    };
    
    console.log('🔄 Generating test PDF with config:', JSON.stringify(testConfig, null, 2));
    
    // Generate PDF
    const pdfBuffer = await pdfModule.generatePDFBuffer(testConfig);
    
    // Save to tmp folder
    const outputPath = path.join(__dirname, 'tmp', 'test-direct-module.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ Test PDF generated:', outputPath);
    console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
    
    // Analyze the generated PDF content
    const pdfContent = pdfBuffer.toString('latin1');
    
    // Check for label text
    const hasTestLabel = pdfContent.includes('TEST LABEL - SHOULD BE VISIBLE');
    console.log('🔍 Contains test label text:', hasTestLabel ? '✅' : '❌');
    
    // Check text positioning with more detail
    const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('📝 Text blocks found:', textBlocks.length);
    
    textBlocks.forEach((block, index) => {
      console.log(`\n--- Text Block ${index + 1} ---`);
      console.log('Raw block:', block);
      
      // Extract font and size
      const fontMatch = block.match(/\/([A-Za-z]+)\s+([\d.]+)\s+Tf/);
      if (fontMatch) {
        console.log(`🔤 Font: ${fontMatch[1]} ${fontMatch[2]}pt`);
      }
      
      // Extract positioning
      const posMatch = block.match(/([\d.-]+)\s+([\d.-]+)\s+Td/);
      if (posMatch) {
        console.log(`📍 Position: X=${posMatch[1]}, Y=${posMatch[2]}`);
      }
      
      // Extract text content
      const textMatch = block.match(/\((.*?)\)\s+Tj/);
      if (textMatch) {
        console.log(`📄 Text: "${textMatch[1]}"`);
      }
      
      // Check for color settings
      const colorMatch = block.match(/([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+rg/);
      if (colorMatch) {
        console.log(`🎨 Color: RGB(${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]})`);
      }
    });
    
    // Check for image objects
    const imageObjects = pdfContent.match(/\/Type\s+\/XObject/g) || [];
    console.log('\n🖼️ Image objects found:', imageObjects.length);
    
    // Look for any potential issues
    console.log('\n🔍 Potential Issues Analysis:');
    
    // Check if text is positioned outside page bounds
    const pageHeight = 841.89; // A4 height in points
    const pageWidth = 595.28; // A4 width in points
    
    textBlocks.forEach((block, index) => {
      const posMatch = block.match(/([\d.-]+)\s+([\d.-]+)\s+Td/);
      if (posMatch) {
        const x = parseFloat(posMatch[1]);
        const y = parseFloat(posMatch[2]);
        
        if (x < 0 || x > pageWidth) {
          console.log(`   ⚠️ Text block ${index + 1} X position (${x}) outside page width (0-${pageWidth})`);
        }
        if (y < 0 || y > pageHeight) {
          console.log(`   ⚠️ Text block ${index + 1} Y position (${y}) outside page height (0-${pageHeight})`);
        }
        if (x >= 0 && x <= pageWidth && y >= 0 && y <= pageHeight) {
          console.log(`   ✅ Text block ${index + 1} position (${x}, ${y}) is within page bounds`);
        }
      }
    });
    
    // Check font size
    textBlocks.forEach((block, index) => {
      const fontMatch = block.match(/\/[A-Za-z]+\s+([\d.]+)\s+Tf/);
      if (fontMatch) {
        const fontSize = parseFloat(fontMatch[1]);
        if (fontSize < 6) {
          console.log(`   ⚠️ Text block ${index + 1} font size (${fontSize}pt) may be too small to see`);
        } else {
          console.log(`   ✅ Text block ${index + 1} font size (${fontSize}pt) should be visible`);
        }
      }
    });
    
    // Check for white text (invisible)
    const hasWhiteText = textBlocks.some(block => 
      block.includes('1 1 1 rg') || block.includes('1.0 1.0 1.0 rg')
    );
    if (hasWhiteText) {
      console.log('   ⚠️ Found white text (invisible on white background)');
    } else {
      console.log('   ✅ No white text detected');
    }
    
    console.log('\n📋 Summary:');
    console.log(`   Label text in PDF: ${hasTestLabel ? 'YES' : 'NO'}`);
    console.log(`   Text blocks: ${textBlocks.length}`);
    console.log(`   Image objects: ${imageObjects.length}`);
    console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
    
    if (hasTestLabel && textBlocks.length > 0) {
      console.log('\n🤔 MYSTERY: Label text is in PDF but not visible. Possible causes:');
      console.log('   1. Text positioned outside visible area');
      console.log('   2. Text color matches background (white on white)');
      console.log('   3. Font size too small');
      console.log('   4. Text overlapped by other elements');
      console.log('   5. PDF viewer rendering issue');
    }
    
  } catch (error) {
    console.error('❌ Error testing PDF module:', error);
    console.error('Stack trace:', error.stack);
  }
}

testPDFModuleDirect().catch(console.error);

