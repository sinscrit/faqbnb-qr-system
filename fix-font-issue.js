const fs = require('fs');
const path = require('path');

async function fixFontIssue() {
  console.log('🔧 Fixing font issue in PDF module...');
  
  try {
    // The issue might be that PDFKit in Next.js environment can't find fonts
    // Let's modify the PDF module to explicitly set the font path
    
    const pdfModulePath = path.join(__dirname, 'src', 'lib', 'pdf_generator_module.js');
    let content = fs.readFileSync(pdfModulePath, 'utf8');
    
    console.log('📂 Reading PDF module...');
    
    // Look for the font setup section
    const fontSetupStart = content.indexOf('// Simple font setup - no overrides');
    
    if (fontSetupStart !== -1) {
      console.log('🔍 Found font setup section');
      
      // Replace the simple font setup with explicit font path configuration
      const fontSetupEnd = content.indexOf('\n', content.indexOf('console.log(\'🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete\');', fontSetupStart));
      
      if (fontSetupEnd !== -1) {
        const beforeSetup = content.substring(0, fontSetupStart);
        const afterSetup = content.substring(fontSetupEnd);
        
        const newFontSetup = `    // Fix font loading issue - explicit font path setup
    const fontDataPath = path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data');
    console.log('🔤 FONT_FIX: Setting PDFKit font data path:', fontDataPath);
    
    // Ensure PDFKit can find fonts
    if (fs.existsSync(fontDataPath)) {
      process.env.PDFKIT_DATA_PATH = fontDataPath;
      console.log('🔤 FONT_FIX: PDFKIT_DATA_PATH set to:', process.env.PDFKIT_DATA_PATH);
    }
    
    // Test font loading before proceeding
    try {
      doc.font('Helvetica');
      doc.fontSize(12);
      console.log('🔤 FONT_FIX: Helvetica font loaded successfully');
    } catch (fontError) {
      console.error('🔤 FONT_FIX: Font loading failed:', fontError.message);
      // Try alternative font loading
      try {
        const helveticaPath = path.join(fontDataPath, 'Helvetica.afm');
        if (fs.existsSync(helveticaPath)) {
          console.log('🔤 FONT_FIX: Attempting manual font registration');
          // Don't register, just ensure the path is accessible
          doc.font('Helvetica'); // Try again after setting path
          console.log('🔤 FONT_FIX: Manual font loading successful');
        }
      } catch (manualError) {
        console.error('🔤 FONT_FIX: Manual font loading also failed:', manualError.message);
      }
    }
    console.log('🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete');`;
        
        content = beforeSetup + newFontSetup + afterSetup;
        
        console.log('✅ Updated font setup with explicit path configuration');
      }
    } else {
      console.log('❌ Could not find font setup section to modify');
      return { success: false, error: 'Font setup section not found' };
    }
    
    // Also ensure the required imports are at the top
    if (!content.includes('const fs = require(\'fs\');')) {
      // Add fs import after the existing requires
      const requireSection = content.indexOf('const path = require(\'path\');');
      if (requireSection !== -1) {
        const endOfLine = content.indexOf('\n', requireSection);
        const beforeRequire = content.substring(0, endOfLine);
        const afterRequire = content.substring(endOfLine);
        content = beforeRequire + '\nconst fs = require(\'fs\');' + afterRequire;
        console.log('✅ Added fs require statement');
      }
    }
    
    // Write the updated content
    fs.writeFileSync(pdfModulePath, content);
    console.log('💾 Updated PDF module with font fixes');
    
    // Test the fixed module
    console.log('\n🧪 Testing fixed PDF module...');
    
    // Clear require cache
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
          label: 'FONT FIX TEST LABEL',
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        }
      ]
    };
    
    const pdfBuffer = await pdfModule.generatePDFBuffer(testConfig);
    
    console.log('✅ Font-fixed module test successful:', pdfBuffer.length, 'bytes');
    
    // Save and analyze the test PDF
    const outputPath = path.join(__dirname, 'tmp', 'font-fixed-test.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('💾 Font-fixed test PDF saved to:', outputPath);
    
    // Analyze with proper decompression
    const zlib = require('zlib');
    const pdfContent = pdfBuffer.toString('latin1');
    
    // Look for compressed streams
    const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
    let match;
    let foundLabel = false;
    
    while ((match = streamPattern.exec(pdfContent)) !== null) {
      const streamContent = match[1];
      
      if (streamContent.includes('x\x9c') || streamContent.includes('\x78\x9c')) {
        try {
          const compressed = Buffer.from(streamContent, 'latin1');
          const decompressed = zlib.inflateSync(compressed);
          const decompressedText = decompressed.toString('utf8');
          
          // Look for text operators and hex-encoded text
          if (decompressedText.includes('BT') && decompressedText.includes('TJ')) {
            console.log('🔍 Found text operators in decompressed stream');
            
            // Look for hex-encoded text
            const hexPattern = /<([0-9A-Fa-f]+)>/g;
            let hexMatch;
            
            while ((hexMatch = hexPattern.exec(decompressedText)) !== null) {
              const hexString = hexMatch[1];
              try {
                const decoded = Buffer.from(hexString, 'hex').toString('utf8');
                if (decoded.includes('FONT FIX TEST LABEL')) {
                  foundLabel = true;
                  console.log('✅ FOUND LABEL TEXT IN PDF:', decoded);
                }
              } catch (e) {
                // Skip invalid hex
              }
            }
          }
        } catch (e) {
          // Skip decompression errors
        }
      }
    }
    
    console.log('🔍 Label found in PDF:', foundLabel ? '✅' : '❌');
    
    return { 
      success: true, 
      pdfPath: outputPath, 
      size: pdfBuffer.length, 
      labelFound: foundLabel 
    };
    
  } catch (error) {
    console.error('❌ Font fix failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

fixFontIssue().then(result => {
  console.log('\n📋 Font Fix Result:', result);
  
  if (result.success && result.labelFound) {
    console.log('\n🎉 SUCCESS! Font issue fixed - labels are now working!');
    console.log('🔄 The application should now generate PDFs with visible labels.');
    console.log('💡 The issue was PDFKit not finding font files in the Next.js environment.');
  } else if (result.success && !result.labelFound) {
    console.log('\n⚠️  Font fix applied but labels still not found.');
    console.log('🔍 May need additional font configuration.');
  } else {
    console.log('\n❌ Font fix failed. Manual intervention required.');
  }
}).catch(console.error);

