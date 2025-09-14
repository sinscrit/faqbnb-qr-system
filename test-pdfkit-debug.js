const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function testPDFKitDebug() {
  console.log('🔍 Deep debugging PDFKit text rendering...');
  
  try {
    // Create a PDF document with debug logging
    const doc = new PDFDocument();
    
    // Create output path
    const outputPath = path.join(__dirname, 'tmp', 'debug-pdfkit.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    
    console.log('📄 Created PDF document');
    console.log('📊 Initial PDF state:');
    console.log('   - Page count:', doc._pageBuffer.length);
    console.log('   - Current page:', doc.page ? 'exists' : 'null');
    
    // Try to inspect the document state before adding text
    if (doc.page) {
      console.log('   - Page dimensions:', doc.page.width, 'x', doc.page.height);
      console.log('   - Page margins:', doc.page.margins);
    }
    
    // Add text with detailed logging
    console.log('\n🔤 Adding text with detailed logging:');
    
    try {
      console.log('   - Before text: doc._ctm =', doc._ctm);
      console.log('   - Before text: doc.x =', doc.x, 'doc.y =', doc.y);
      
      // Try the most basic text addition
      const result = doc.text('DEBUG TEXT TEST', 100, 100);
      
      console.log('   - After text: result =', result === doc ? 'returned doc' : 'returned something else');
      console.log('   - After text: doc.x =', doc.x, 'doc.y =', doc.y);
      
      // Check if there's any content in the page buffer
      if (doc.page && doc.page.content) {
        console.log('   - Page content length:', doc.page.content.length);
        console.log('   - Page content (first 200 chars):', doc.page.content.toString().substring(0, 200));
      }
      
    } catch (textError) {
      console.log('❌ Text addition failed:', textError.message);
      console.log('   Stack:', textError.stack);
    }
    
    // Try to manually inspect the PDF generation process
    console.log('\n🔧 Manual PDF inspection:');
    
    // Check if we can access the internal PDF generation
    if (doc._write) {
      console.log('   - doc._write method exists');
      try {
        doc._write('% Manual comment test');
        console.log('   - Manual write succeeded');
      } catch (writeError) {
        console.log('   - Manual write failed:', writeError.message);
      }
    } else {
      console.log('   - doc._write method does not exist');
    }
    
    // Check the document's internal state
    console.log('   - doc._ended:', doc._ended);
    console.log('   - doc._root:', doc._root ? 'exists' : 'null');
    console.log('   - doc._info:', doc._info ? 'exists' : 'null');
    
    // Try adding a simple shape to see if graphics work
    try {
      doc.rect(50, 50, 100, 50).stroke();
      console.log('   - Rectangle added successfully');
    } catch (rectError) {
      console.log('   - Rectangle failed:', rectError.message);
    }
    
    // Finalize the PDF
    console.log('\n📝 Finalizing PDF...');
    doc.end();
    
    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log('   - Stream finished');
        resolve();
      });
      stream.on('error', (error) => {
        console.log('   - Stream error:', error.message);
        reject(error);
      });
    });
    
    console.log('✅ Debug PDF generated:', outputPath);
    
    // Detailed analysis of the generated PDF
    const pdfBuffer = fs.readFileSync(outputPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('\n📊 Detailed PDF Analysis:');
    console.log('   File size:', pdfBuffer.length, 'bytes');
    console.log('   Starts with PDF header:', pdfContent.startsWith('%PDF-') ? '✅' : '❌');
    console.log('   Ends with EOF:', pdfContent.includes('%%EOF') ? '✅' : '❌');
    
    // Look for PDF objects
    const objects = pdfContent.match(/\d+ \d+ obj/g) || [];
    console.log('   PDF objects found:', objects.length);
    
    // Look for page objects
    const pageObjects = pdfContent.match(/\/Type \/Page/g) || [];
    console.log('   Page objects found:', pageObjects.length);
    
    // Look for content streams
    const contentStreams = pdfContent.match(/\/Length \d+/g) || [];
    console.log('   Content streams found:', contentStreams.length);
    
    // Look for any text-related content
    const textContent = pdfContent.match(/BT|ET|Tf|Tj|TJ/g) || [];
    console.log('   Text operators found:', textContent.length);
    if (textContent.length > 0) {
      console.log('   Text operators:', textContent);
    }
    
    // Look for the specific text we added
    console.log('   Contains "DEBUG TEXT TEST":', pdfContent.includes('DEBUG TEXT TEST') ? '✅' : '❌');
    
    // Look for graphics content (rectangle)
    const graphicsContent = pdfContent.match(/re|S|f|stroke|fill/g) || [];
    console.log('   Graphics operators found:', graphicsContent.length);
    
    // Show first 500 characters of PDF content for inspection
    console.log('\n📄 PDF Content Preview (first 500 chars):');
    console.log(pdfContent.substring(0, 500));
    
    if (textContent.length === 0 && graphicsContent.length === 0) {
      console.log('\n❌ CRITICAL: No text or graphics operators found in PDF!');
      console.log('   This suggests PDFKit is not writing content to the PDF stream.');
      console.log('   Possible causes:');
      console.log('   1. PDFKit version compatibility issue');
      console.log('   2. Node.js version compatibility issue'); 
      console.log('   3. Corrupted PDFKit installation');
      console.log('   4. Missing dependencies');
    }
    
  } catch (error) {
    console.error('❌ Error in PDFKit debug test:', error);
    console.error('Stack trace:', error.stack);
  }
}

testPDFKitDebug().catch(console.error);

