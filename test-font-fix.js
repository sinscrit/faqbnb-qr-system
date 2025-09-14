const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function testFontFix() {
  console.log('🧪 Testing font fix...');
  
  try {
    // Clear require cache to get the updated module
    delete require.cache[require.resolve('./src/lib/pdf_generator_module.js')];
    
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    const testConfig = {
      paperSize: 'A4',
      margin: '0.5cm',
      qrCodeCount: 1,
      qrCodesPerRow: 1,
      qrCodeSize: '40mm',
      showCutlines: true,
      includeCutlines: true,
      showLabels: true,
      includeLabels: true,
      debug: false,
      qrCodes: [
        {
          id: 'font-fix-test',
          label: 'FONT FIX SUCCESS',
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        }
      ]
    };
    
    console.log('📤 Generating PDF with font fix...');
    const pdfBuffer = await pdfModule.generatePDFBuffer(testConfig);
    
    console.log('✅ PDF generated successfully:', pdfBuffer.length, 'bytes');
    
    // Save the test PDF
    const outputPath = path.join(__dirname, 'tmp', 'font-fix-success.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('💾 Font-fix test PDF saved to:', outputPath);
    
    // Analyze the PDF with proper decompression
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('🔍 Analyzing PDF for text content...');
    
    // Look for compressed streams
    const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
    let match;
    let foundLabel = false;
    let foundTextOperators = false;
    
    while ((match = streamPattern.exec(pdfContent)) !== null) {
      const streamContent = match[1];
      
      if (streamContent.includes('x\x9c') || streamContent.includes('\x78\x9c')) {
        try {
          const compressed = Buffer.from(streamContent, 'latin1');
          const decompressed = zlib.inflateSync(compressed);
          const decompressedText = decompressed.toString('utf8');
          
          // Check for text operators
          if (decompressed.includes('BT') && decompressed.includes('ET')) {
            foundTextOperators = true;
            console.log('✅ Found text operators (BT/ET) in PDF');
          }
          
          if (decompressed.includes('TJ')) {
            console.log('✅ Found TJ text operator in PDF');
          }
          
          // Look for hex-encoded text
          const hexPattern = /<([0-9A-Fa-f]+)>/g;
          let hexMatch;
          
          while ((hexMatch = hexPattern.exec(decompressedText)) !== null) {
            const hexString = hexMatch[1];
            try {
              const decoded = Buffer.from(hexString, 'hex').toString('utf8');
              console.log('📝 Decoded text from PDF:', `"${decoded}"`);
              
              if (decoded.includes('FONT FIX SUCCESS')) {
                foundLabel = true;
                console.log('🎉 FOUND LABEL TEXT IN PDF!');
              }
            } catch (e) {
              // Skip invalid hex
            }
          }
        } catch (e) {
          // Skip decompression errors
        }
      }
    }
    
    console.log('\n📋 FONT FIX TEST RESULTS:');
    console.log('   PDF generated:', '✅');
    console.log('   Text operators found:', foundTextOperators ? '✅' : '❌');
    console.log('   Label text found:', foundLabel ? '✅' : '❌');
    
    return { 
      success: true, 
      pdfPath: outputPath, 
      size: pdfBuffer.length, 
      hasTextOperators: foundTextOperators,
      labelFound: foundLabel 
    };
    
  } catch (error) {
    console.error('❌ Font fix test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

testFontFix().then(result => {
  console.log('\n📋 Final Result:', result);
  
  if (result.success && result.labelFound) {
    console.log('\n🎉 FONT FIX SUCCESSFUL!');
    console.log('✅ Labels are now working in the PDF module.');
    console.log('🔄 The application should now generate PDFs with visible labels.');
    console.log('\n💡 Next step: Test with the application to confirm end-to-end functionality.');
  } else if (result.success && result.hasTextOperators && !result.labelFound) {
    console.log('\n⚠️  Font fix partially successful.');
    console.log('✅ Text operators are present but specific label not found.');
    console.log('🔍 Text rendering is working, may need to check label content.');
  } else if (result.success && !result.hasTextOperators) {
    console.log('\n❌ Font fix did not resolve the issue.');
    console.log('🔍 No text operators found - font loading still failing.');
  } else {
    console.log('\n❌ Font fix test failed completely.');
  }
}).catch(console.error);

