const fs = require('fs');
const path = require('path');

async function fixPDFLabelRendering() {
  console.log('🔧 Fixing PDF label rendering issue...');
  
  try {
    const pdfModulePath = path.join(__dirname, 'src', 'lib', 'pdf_generator_module.js');
    console.log('📂 Reading PDF module from:', pdfModulePath);
    
    let content = fs.readFileSync(pdfModulePath, 'utf8');
    
    // The issue is likely in the text rendering section
    // Let me find and fix the text rendering code
    
    console.log('🔍 Looking for text rendering issues...');
    
    // Check if there are any font override issues that might be preventing text rendering
    const hasOverrides = content.includes('PDF_OVERRIDE_DEBUG: Font method overrides complete');
    console.log('🔍 Has font overrides:', hasOverrides);
    
    if (hasOverrides) {
      console.log('🔧 Removing problematic font overrides...');
      
      // Find the font override section and replace it with simple font setup
      const overrideStart = content.indexOf('console.log(\'🔍 PDF_OVERRIDE_DEBUG: Setting up font method overrides...\');');
      const overrideEnd = content.indexOf('console.log(\'🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete\');');
      
      if (overrideStart !== -1 && overrideEnd !== -1) {
        const endOfLine = content.indexOf('\n', overrideEnd);
        
        const beforeOverrides = content.substring(0, overrideStart);
        const afterOverrides = content.substring(endOfLine + 1);
        
        // Replace with simple font setup
        const simpleSetup = `    // Simple font setup - no overrides
    doc.font('Helvetica');
    doc.fontSize(12);
    console.log('🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete');`;
        
        content = beforeOverrides + simpleSetup + '\n' + afterOverrides;
        
        console.log('✅ Removed font overrides and replaced with simple setup');
      }
    }
    
    // Also check for any text rendering that might be skipped
    // Look for the label rendering section and ensure it's working properly
    
    // Find the label rendering section
    const labelSectionStart = content.indexOf('// Render labels if enabled');
    if (labelSectionStart !== -1) {
      console.log('🔍 Found label rendering section');
      
      // Extract the label rendering section for analysis
      const labelSectionEnd = content.indexOf('// End of label rendering', labelSectionStart);
      if (labelSectionEnd !== -1) {
        const labelSection = content.substring(labelSectionStart, labelSectionEnd);
        console.log('📝 Current label rendering logic length:', labelSection.length, 'characters');
        
        // Check if there are any conditions that might prevent label rendering
        const hasLabelConditions = labelSection.includes('shouldRenderLabels');
        console.log('🔍 Has label conditions:', hasLabelConditions);
      }
    }
    
    // Write the fixed content back
    fs.writeFileSync(pdfModulePath, content);
    console.log('💾 Updated PDF module with fixes');
    
    // Now test the fixed module
    console.log('\n🧪 Testing fixed PDF module...');
    
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
          id: 'test-fix',
          label: 'FIXED LABEL TEST',
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        }
      ]
    };
    
    const pdfBuffer = await pdfModule.generatePDFBuffer(testConfig);
    
    console.log('✅ Fixed module test successful:', pdfBuffer.length, 'bytes');
    
    // Save the test PDF
    const outputPath = path.join(__dirname, 'tmp', 'fixed-label-test.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('💾 Fixed test PDF saved to:', outputPath);
    
    // Analyze the PDF content
    const pdfContent = pdfBuffer.toString('latin1');
    const hasLabel = pdfContent.includes('FIXED LABEL TEST');
    console.log('🔍 Contains label text:', hasLabel ? '✅' : '❌');
    
    // Look for text rendering operators in the PDF
    const hasTextOperators = pdfContent.includes('BT') && pdfContent.includes('ET');
    console.log('🔍 Has text operators (BT/ET):', hasTextOperators ? '✅' : '❌');
    
    // Look for TJ operator (text showing)
    const hasTJOperator = pdfContent.includes('TJ');
    console.log('🔍 Has TJ text operator:', hasTJOperator ? '✅' : '❌');
    
    if (!hasLabel && hasTextOperators) {
      console.log('⚠️  Text operators found but label text not visible - checking hex encoding...');
      
      // Look for hex-encoded text
      const hexTextPattern = /<[0-9A-Fa-f\s]+>/g;
      const hexMatches = pdfContent.match(hexTextPattern);
      if (hexMatches) {
        console.log('🔍 Found hex-encoded text blocks:', hexMatches.length);
        console.log('📝 First hex block:', hexMatches[0]?.substring(0, 100));
        
        // Try to decode the hex
        try {
          const hexContent = hexMatches[0].replace(/[<>\s]/g, '');
          const decoded = Buffer.from(hexContent, 'hex').toString('utf8');
          console.log('🔍 Decoded hex content:', decoded);
          
          if (decoded.includes('FIXED LABEL TEST')) {
            console.log('✅ Label text found in hex-encoded form!');
            return { success: true, pdfPath: outputPath, size: pdfBuffer.length, hasLabel: true, encoding: 'hex' };
          }
        } catch (e) {
          console.log('❌ Failed to decode hex content:', e.message);
        }
      }
    }
    
    return { 
      success: true, 
      pdfPath: outputPath, 
      size: pdfBuffer.length, 
      hasLabel, 
      hasTextOperators, 
      hasTJOperator 
    };
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

fixPDFLabelRendering().then(result => {
  console.log('\n📋 Fix Result:', result);
  
  if (result.success && result.hasLabel) {
    console.log('\n🎉 SUCCESS! Labels are now working in the PDF module.');
    console.log('🔄 Next step: Test with the application to ensure it works end-to-end.');
  } else if (result.success && !result.hasLabel) {
    console.log('\n⚠️  Module runs but labels still not visible.');
    console.log('🔍 This indicates a deeper PDFKit text rendering issue.');
    console.log('💡 May need to investigate PDFKit font loading or text positioning.');
  } else {
    console.log('\n❌ Fix failed. Manual intervention required.');
  }
}).catch(console.error);

