const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function checkJSONTestPDF() {
  console.log('🔍 Checking the JSON test PDF...');
  
  try {
    const pdfPath = path.join(__dirname, 'tmp', 'json-config-test-1757804613-1.pdf');
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
        
        // Check for text content in decompressed stream
        const hasTestLabels = decompressed.includes('Test Item') || decompressed.includes('Sample QR');
        const hasBT = decompressedContent.includes('BT');
        const hasET = decompressedContent.includes('ET');
        const hasTj = decompressedContent.includes('Tj');
        const hasTJ = decompressedContent.includes('TJ');
        
        console.log('   Analysis:');
        console.log('     Contains test labels:', hasTestLabels ? '✅' : '❌');
        console.log('     Contains BT (begin text):', hasBT ? '✅' : '❌');
        console.log('     Contains ET (end text):', hasET ? '✅' : '❌');
        console.log('     Contains Tj (show text):', hasTj ? '✅' : '❌');
        console.log('     Contains TJ (show text array):', hasTJ ? '✅' : '❌');
        
        if (hasTestLabels) {
          console.log('   🎉 FOUND TEST LABELS! They are properly encoded.');
        } else if (hasTJ || hasTj) {
          console.log('   🔍 Text operators found. Checking for hex-encoded text...');
          
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
          
          if (fullDecodedText.includes('Test Item') || fullDecodedText.includes('Sample QR')) {
            console.log('   🎉 FOUND TEST LABELS! They were hex-encoded but decoded successfully.');
          } else {
            console.log('   ❌ Test labels not found in decoded text');
          }
        } else {
          console.log('   ❌ No text operators found - labels might not be rendered at all');
        }
        
        // Show a preview of the content for debugging
        if (decompressedContent.length > 0) {
          console.log('   📄 Content preview (first 500 chars):');
          console.log('   ---START---');
          console.log(decompressedContent.substring(0, 500));
          console.log('   ---END---');
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
          console.log(streamContent.substring(0, 200));
          console.log('---END---');
        }
      }
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
    console.log(`   Content streams: ${streamIndex}`);
    console.log('   This PDF should be opened to visually verify labels are visible');
    
  } catch (error) {
    console.error('❌ Error checking PDF:', error);
    console.error('Stack trace:', error.stack);
  }
}

checkJSONTestPDF().catch(console.error);

