const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function checkNewTextPDF() {
  console.log('🔍 Checking the newly generated text-only PDF...');
  
  try {
    const pdfPath = path.join(__dirname, 'tmp', 'text-only-test.pdf');
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
        const hasVisibleText = decompressedContent.includes('VISIBLE TEXT TEST');
        const hasBT = decompressedContent.includes('BT');
        const hasET = decompressedContent.includes('ET');
        const hasTj = decompressedContent.includes('Tj');
        const hasTJ = decompressedContent.includes('TJ');
        
        console.log('   Analysis:');
        console.log('     Contains "VISIBLE TEXT TEST":', hasVisibleText ? '✅' : '❌');
        console.log('     Contains BT (begin text):', hasBT ? '✅' : '❌');
        console.log('     Contains ET (end text):', hasET ? '✅' : '❌');
        console.log('     Contains Tj (show text):', hasTj ? '✅' : '❌');
        console.log('     Contains TJ (show text array):', hasTJ ? '✅' : '❌');
        
        if (hasVisibleText) {
          console.log('   🎉 FOUND THE TEXT! It\'s properly encoded as plain text.');
        } else if (hasTJ) {
          console.log('   🔍 Text is hex-encoded with TJ operator. Decoding...');
          
          // Try to decode hex values in TJ commands
          const hexPattern = /<([0-9A-Fa-f]+)>/g;
          let hexMatch;
          const decodedTexts = [];
          
          while ((hexMatch = hexPattern.exec(decompressedContent)) !== null) {
            const hexValue = hexMatch[1];
            try {
              const decodedText = Buffer.from(hexValue, 'hex').toString('utf8');
              decodedTexts.push(decodedText);
              console.log(`     Hex "${hexValue}" decodes to: "${decodedText}"`);
            } catch (decodeError) {
              console.log(`     Failed to decode hex "${hexValue}"`);
            }
          }
          
          const fullDecodedText = decodedTexts.join('');
          console.log(`     Full decoded text: "${fullDecodedText}"`);
          
          if (fullDecodedText.includes('VISIBLE TEXT TEST')) {
            console.log('   🎉 FOUND THE TEXT! It was hex-encoded but decoded successfully.');
          }
        }
        
      } catch (decompressError) {
        console.log('   ❌ Decompression failed:', decompressError.message);
      }
    }
    
    if (streamIndex === 0) {
      console.log('❌ No FlateDecode streams found in PDF');
      
      // Check for uncompressed streams
      const uncompressedPattern = /stream([\s\S]*?)endstream/g;
      let uncompressedMatch;
      
      while ((uncompressedMatch = uncompressedPattern.exec(pdfContent)) !== null) {
        const streamContent = uncompressedMatch[1].trim();
        if (streamContent.length > 10) {
          console.log('\nFound uncompressed stream:');
          console.log('---START---');
          console.log(streamContent);
          console.log('---END---');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking PDF:', error);
    console.error('Stack trace:', error.stack);
  }
}

checkNewTextPDF().catch(console.error);

