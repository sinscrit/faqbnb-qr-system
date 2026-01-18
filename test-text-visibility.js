const fs = require('fs');
const path = require('path');

async function testTextVisibility() {
  console.log('🔍 Testing text visibility with minimal PDF...');
  
  try {
    // Import the PDF generator module
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    // Create a test with ONLY text, no QR code or cutlines
    const testQRCodes = [{
      id: 'text-only-test',
      label: 'VISIBLE TEXT TEST',
      imageData: null // No image to avoid any overlap issues
    }];
    
    const testConfig = {
      paperSize: 'A4',
      margin: '10mm',
      qrCodeCount: 1,
      qrCodesPerRow: 1,
      qrCodeSize: '40mm',
      showCutlines: false, // Disable cutlines
      includeCutlines: false,
      showLabels: true,
      includeLabels: true,
      debug: false, // Disable debug graphics
      outputFileName: 'text-only-test.pdf',
      qrCodes: testQRCodes
    };
    
    console.log('🔄 Generating text-only PDF...');
    
    // Generate PDF
    const pdfBuffer = await pdfModule.generatePDFBuffer(testConfig);
    
    // Save to tmp folder
    const outputPath = path.join(__dirname, 'tmp', 'text-only-test.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ Text-only PDF generated:', outputPath);
    console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
    
    // Now let's create another test with a simple manual PDF to compare
    console.log('\n🔄 Creating manual PDF for comparison...');
    
    // Create a simple manual PDF with just text
    const manualPDFContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 595.28 841.89]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 85
>>
stream
BT
/F1 12 Tf
100 700 Td
(MANUAL TEST - THIS SHOULD BE VISIBLE) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000410 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
497
%%EOF`;
    
    const manualPdfPath = path.join(__dirname, 'tmp', 'manual-text-test.pdf');
    fs.writeFileSync(manualPdfPath, manualPDFContent);
    
    console.log('✅ Manual PDF generated:', manualPdfPath);
    
    // Analyze both PDFs
    console.log('\n📊 Comparing PDFs:');
    
    const textOnlyContent = fs.readFileSync(outputPath).toString('latin1');
    const manualContent = fs.readFileSync(manualPdfPath).toString('latin1');
    
    console.log('Text-only PDF contains "VISIBLE TEXT TEST":', textOnlyContent.includes('VISIBLE TEXT TEST') ? '✅' : '❌');
    console.log('Manual PDF contains "MANUAL TEST":', manualContent.includes('MANUAL TEST') ? '✅' : '❌');
    
    // Check text blocks in generated PDF
    const textBlocks = textOnlyContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('\nGenerated PDF text blocks:', textBlocks.length);
    
    textBlocks.forEach((block, index) => {
      console.log(`\nText Block ${index + 1}:`);
      console.log(block);
    });
    
    // Check text blocks in manual PDF
    const manualTextBlocks = manualContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('\nManual PDF text blocks:', manualTextBlocks.length);
    
    manualTextBlocks.forEach((block, index) => {
      console.log(`\nManual Text Block ${index + 1}:`);
      console.log(block);
    });
    
    console.log('\n🔍 Analysis:');
    console.log('Both PDFs should now be available for visual comparison.');
    console.log('If the manual PDF shows text but the generated one doesn\'t,');
    console.log('then there\'s an issue with the PDF generation library or font handling.');
    
  } catch (error) {
    console.error('❌ Error in text visibility test:', error);
    console.error('Stack trace:', error.stack);
  }
}

testTextVisibility().catch(console.error);

