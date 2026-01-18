const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function testDecompressPDF() {
  console.log('🔍 Attempting to decompress PDF content streams...');
  
  try {
    const pdfPath = path.join(__dirname, 'tmp', 'debug-pdfkit.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('📄 PDF loaded, size:', pdfBuffer.length, 'bytes');
    
    // Find content streams with FlateDecode filter
    const streamPattern = /<<[\s\S]*?\/Filter\s+\/FlateDecode[\s\S]*?>>[\s\S]*?stream([\s\S]*?)endstream/g;
    let match;
    let streamIndex = 0;
    
    while ((match = streamPattern.exec(pdfContent)) !== null) {
      streamIndex++;
      console.log(`\n🔧 Processing content stream ${streamIndex}:`);
      
      try {
        // Extract the compressed data
        const compressedData = match[1].trim();
        console.log('   Compressed data length:', compressedData.length, 'characters');
        
        // Convert from latin1 string to buffer
        const compressedBuffer = Buffer.from(compressedData, 'latin1');
        console.log('   Compressed buffer length:', compressedBuffer.length, 'bytes');
        
        // Decompress using zlib
        const decompressed = zlib.inflateSync(compressedBuffer);
        const decompressedContent = decompressed.toString('utf8');
        
        console.log('   Decompressed content length:', decompressedContent.length, 'characters');
        console.log('   Decompressed content:');
        console.log('   ---START---');
        console.log(decompressedContent);
        console.log('   ---END---');
        
        // Check for text content in decompressed stream
        const hasText = decompressedContent.includes('DEBUG TEXT TEST');
        const hasBT = decompressedContent.includes('BT');
        const hasET = decompressedContent.includes('ET');
        const hasTj = decompressedContent.includes('Tj');
        
        console.log('   Analysis:');
        console.log('     Contains "DEBUG TEXT TEST":', hasText ? '✅' : '❌');
        console.log('     Contains BT (begin text):', hasBT ? '✅' : '❌');
        console.log('     Contains ET (end text):', hasET ? '✅' : '❌');
        console.log('     Contains Tj (show text):', hasTj ? '✅' : '❌');
        
        if (hasText) {
          console.log('   🎉 FOUND THE TEXT! It was compressed in the PDF stream.');
        }
        
      } catch (decompressError) {
        console.log('   ❌ Decompression failed:', decompressError.message);
      }
    }
    
    if (streamIndex === 0) {
      console.log('❌ No FlateDecode streams found in PDF');
    }
    
    // Also try to find any uncompressed streams
    console.log('\n🔍 Looking for uncompressed streams...');
    const uncompressedPattern = /stream([\s\S]*?)endstream/g;
    let uncompressedMatch;
    let uncompressedIndex = 0;
    
    while ((uncompressedMatch = uncompressedPattern.exec(pdfContent)) !== null) {
      const streamContent = uncompressedMatch[1].trim();
      if (streamContent.length > 10 && !streamContent.includes('FlateDecode')) {
        uncompressedIndex++;
        console.log(`\nUncompressed stream ${uncompressedIndex}:`);
        console.log('---START---');
        console.log(streamContent);
        console.log('---END---');
      }
    }
    
  } catch (error) {
    console.error('❌ Error decompressing PDF:', error);
    console.error('Stack trace:', error.stack);
  }
}

testDecompressPDF().catch(console.error);

