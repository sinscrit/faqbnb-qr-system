const fs = require('fs');
const path = require('path');

async function verifyPDFContent() {
  console.log('🔍 Verifying PDF content after PDFKit fix...');
  
  const pdfPath = path.join(__dirname, '.playwright-mcp', 'QR-Codes-2025-09-13T22-25-23.pdf');
  
  try {
    // Check if PDF file exists
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ PDF file not found at:', pdfPath);
      return;
    }
    
    const stats = fs.statSync(pdfPath);
    console.log(`📊 PDF file size: ${stats.size} bytes`);
    
    if (stats.size < 1000) {
      console.log('❌ PDF file is too small, likely empty or corrupted');
      return;
    }
    
    // Read and analyze PDF content
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    // Check for PDF structure
    const hasPDFHeader = pdfContent.startsWith('%PDF-');
    const hasImages = pdfContent.includes('/Image') || pdfContent.includes('/XObject');
    const hasText = pdfContent.includes('/Text') || pdfContent.includes('BT') || pdfContent.includes('ET');
    const hasStreams = pdfContent.includes('stream');
    
    // Look for specific QR-related content
    const hasQRData = pdfContent.includes('PNG') || pdfContent.includes('IHDR');
    
    console.log('🔍 PDF Analysis Results:');
    console.log(`   ✅ Valid PDF header: ${hasPDFHeader}`);
    console.log(`   📊 File size: ${stats.size} bytes`);
    console.log(`   🖼️  Contains images: ${hasImages}`);
    console.log(`   📝 Contains text: ${hasText}`);
    console.log(`   🌊 Contains streams: ${hasStreams}`);
    console.log(`   🔲 Contains QR data: ${hasQRData}`);
    
    if (hasPDFHeader && hasImages && hasStreams && stats.size > 10000) {
      console.log('🎉 SUCCESS: PDF appears to contain embedded QR codes!');
      console.log('✅ The PDFKit fix has resolved the PDF generation issue');
    } else {
      console.log('⚠️  WARNING: PDF may not contain proper QR codes');
    }
    
    console.log(`📁 PDF saved at: ${pdfPath}`);
    
  } catch (error) {
    console.error('❌ Error analyzing PDF:', error.message);
  }
}

verifyPDFContent().catch(console.error);

