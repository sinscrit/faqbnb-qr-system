const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function testFreshPDF() {
  console.log('🔍 Testing fresh PDFKit without any overrides...');
  
  try {
    // Create a completely fresh PDF document
    const doc = new PDFDocument();
    
    // Create output path
    const outputPath = path.join(__dirname, 'tmp', 'fresh-pdf-test.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    
    console.log('📄 Created fresh PDF document');
    
    // Try to set font
    try {
      doc.font('Helvetica');
      console.log('✅ Font set to Helvetica');
    } catch (fontError) {
      console.log('❌ Font setting failed:', fontError.message);
    }
    
    // Try to set font size
    try {
      doc.fontSize(12);
      console.log('✅ Font size set to 12');
    } catch (sizeError) {
      console.log('❌ Font size setting failed:', sizeError.message);
    }
    
    // Try to render text
    try {
      doc.text('FRESH PDF TEST - THIS SHOULD BE VISIBLE', 100, 100);
      console.log('✅ Text rendered successfully');
    } catch (textError) {
      console.log('❌ Text rendering failed:', textError.message);
    }
    
    // Try to add another text at different position
    try {
      doc.text('SECOND LINE OF TEXT', 100, 150);
      console.log('✅ Second text rendered successfully');
    } catch (textError2) {
      console.log('❌ Second text rendering failed:', textError2.message);
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    console.log('✅ Fresh PDF generated:', outputPath);
    
    // Check the PDF content
    const pdfBuffer = fs.readFileSync(outputPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
    console.log('🔍 Contains "FRESH PDF TEST":', pdfContent.includes('FRESH PDF TEST') ? '✅' : '❌');
    console.log('🔍 Contains "SECOND LINE":', pdfContent.includes('SECOND LINE') ? '✅' : '❌');
    
    // Check text blocks
    const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('📝 Text blocks found:', textBlocks.length);
    
    textBlocks.forEach((block, index) => {
      console.log(`\nText Block ${index + 1}:`);
      console.log(block);
    });
    
    if (textBlocks.length > 0) {
      console.log('\n🎉 SUCCESS: Fresh PDFKit works! The issue is with the font overrides in the module.');
    } else {
      console.log('\n❌ PROBLEM: Even fresh PDFKit is not working. There might be a PDFKit installation issue.');
    }
    
  } catch (error) {
    console.error('❌ Error creating fresh PDF:', error);
    console.error('Stack trace:', error.stack);
  }
}

testFreshPDF().catch(console.error);

