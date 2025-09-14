const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function analyzeAppPDFProperly() {
  console.log('🔍 Properly analyzing application-generated PDF...');
  
  try {
    // Analyze the latest PDF from the application
    const appPdfPath = path.join(__dirname, 'tmp', 'LATEST-APP-PDF.pdf');
    
    if (!fs.existsSync(appPdfPath)) {
      throw new Error('Application PDF not found at: ' + appPdfPath);
    }
    
    const pdfBuffer = fs.readFileSync(appPdfPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('📊 Application PDF Analysis:');
    console.log('   File size:', pdfBuffer.length, 'bytes');
    console.log('   Has PDF header:', pdfContent.startsWith('%PDF-') ? '✅' : '❌');
    
    // Look for compressed streams
    const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
    let streamMatches = [];
    let match;
    
    while ((match = streamPattern.exec(pdfContent)) !== null) {
      streamMatches.push(match[1]);
    }
    
    console.log('   Stream objects found:', streamMatches.length);
    
    let foundLabels = [];
    let foundQRContent = false;
    
    for (let i = 0; i < streamMatches.length; i++) {
      const streamContent = streamMatches[i];
      
      // Check if it's compressed
      if (streamContent.includes('x\x9c') || streamContent.includes('\x78\x9c')) {
        try {
          const compressed = Buffer.from(streamContent, 'latin1');
          const decompressed = zlib.inflateSync(compressed);
          const decompressedText = decompressed.toString('utf8');
          
          console.log(`\n🔍 Stream ${i + 1} (decompressed, first 200 chars):`);
          console.log(decompressedText.substring(0, 200));
          
          // Look for text operators
          const hasTextOperators = decompressedText.includes('BT') && decompressedText.includes('ET');
          const hasTJOperator = decompressedText.includes('TJ');
          
          console.log(`   📝 Has text operators (BT/ET): ${hasTextOperators ? '✅' : '❌'}`);
          console.log(`   📝 Has TJ operator: ${hasTJOperator ? '✅' : '❌'}`);
          
          if (hasTextOperators && hasTJOperator) {
            // Extract hex-encoded text
            const hexPattern = /<([0-9A-Fa-f]+)>/g;
            let hexMatch;
            
            while ((hexMatch = hexPattern.exec(decompressedText)) !== null) {
              const hexString = hexMatch[1];
              try {
                const decoded = Buffer.from(hexString, 'hex').toString('utf8');
                console.log(`   📝 Decoded text: "${decoded}"`);
                
                // Check if this looks like a label (not just spaces or single characters)
                if (decoded.length > 2 && decoded.trim().length > 0 && !decoded.match(/^[\s\d.]+$/)) {
                  foundLabels.push(decoded);
                }
              } catch (e) {
                // Skip invalid hex
              }
            }
          }
          
          // Look for QR-related content
          if (decompressedText.includes('/Image') || decompressedText.includes('PNG') || decompressedText.includes('IDAT')) {
            foundQRContent = true;
            console.log(`   🖼️  Contains image content (likely QR codes)`);
          }
          
        } catch (error) {
          console.log(`   ❌ Failed to decompress stream ${i + 1}:`, error.message);
        }
      }
    }
    
    console.log('\n📋 ANALYSIS SUMMARY:');
    console.log('   🖼️  QR codes found:', foundQRContent ? '✅' : '❌');
    console.log('   📝 Labels found:', foundLabels.length);
    
    if (foundLabels.length > 0) {
      console.log('   📝 Label texts:');
      foundLabels.forEach((label, index) => {
        console.log(`      ${index + 1}. "${label}"`);
      });
    }
    
    return {
      success: true,
      fileSize: pdfBuffer.length,
      streamCount: streamMatches.length,
      hasQRContent: foundQRContent,
      labelCount: foundLabels.length,
      labels: foundLabels
    };
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testApplicationPDFGeneration() {
  console.log('\n🧪 Testing application PDF generation with Playwright...');
  
  // This would require Playwright to generate a fresh PDF
  // For now, let's analyze what we have
  
  return { message: 'Use Playwright to generate a fresh PDF for testing' };
}

async function runPDFAnalysis() {
  console.log('🔍 Running Proper PDF Analysis...\n');
  
  const analysisResult = await analyzeAppPDFProperly();
  console.log('\n📋 Analysis Result:', analysisResult);
  
  if (analysisResult.success) {
    if (analysisResult.hasQRContent && analysisResult.labelCount > 0) {
      console.log('\n🎉 SUCCESS! Both QR codes and labels are present in the PDF!');
      console.log('✅ The PDF generation is working correctly.');
      console.log('📝 Labels found:', analysisResult.labels.join(', '));
      console.log('\n💡 The issue was in our analysis method, not the PDF generation.');
      console.log('🔍 PDFs use compression and hex encoding, which our simple searches missed.');
    } else if (analysisResult.hasQRContent && analysisResult.labelCount === 0) {
      console.log('\n⚠️  QR codes are present but no labels found.');
      console.log('🔍 This suggests labels might not be rendering or are in a different format.');
    } else {
      console.log('\n❌ Neither QR codes nor labels found in the PDF.');
      console.log('🔍 This suggests a fundamental issue with PDF generation.');
    }
  }
}

runPDFAnalysis().catch(console.error);

