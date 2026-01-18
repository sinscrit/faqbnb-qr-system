const fs = require('fs');
const path = require('path');

async function decodePDFHexContent() {
  console.log('🔍 Decoding PDF hex content to find text...');
  
  try {
    const pdfPath = path.join(__dirname, 'tmp', 'minimal-text-test.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error('Minimal test PDF not found');
    }
    
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('📊 PDF file size:', pdfBuffer.length, 'bytes');
    
    // Look for different text patterns
    console.log('\n🔍 Searching for text patterns...');
    
    // 1. Look for hex-encoded text
    const hexTextPattern = /<([0-9A-Fa-f\s]+)>/g;
    let match;
    let hexBlocks = [];
    
    while ((match = hexTextPattern.exec(pdfContent)) !== null) {
      hexBlocks.push(match[1]);
    }
    
    console.log('📝 Found', hexBlocks.length, 'hex-encoded blocks');
    
    for (let i = 0; i < hexBlocks.length; i++) {
      const hexContent = hexBlocks[i].replace(/\s/g, '');
      console.log(`\n🔍 Hex block ${i + 1}:`, hexContent.substring(0, 50) + '...');
      
      if (hexContent.length > 0) {
        try {
          // Try different decoding methods
          
          // Method 1: Direct hex to UTF-8
          const decoded1 = Buffer.from(hexContent, 'hex').toString('utf8');
          console.log('   📝 UTF-8 decode:', decoded1.substring(0, 50));
          
          // Method 2: Hex to ASCII
          const decoded2 = Buffer.from(hexContent, 'hex').toString('ascii');
          console.log('   📝 ASCII decode:', decoded2.substring(0, 50));
          
          // Method 3: Hex to Latin1
          const decoded3 = Buffer.from(hexContent, 'hex').toString('latin1');
          console.log('   📝 Latin1 decode:', decoded3.substring(0, 50));
          
          // Check if any contain our test text
          const testTexts = ['Simple Text Test', 'Manual Position Test', 'Positioned Text'];
          for (const testText of testTexts) {
            if (decoded1.includes(testText) || decoded2.includes(testText) || decoded3.includes(testText)) {
              console.log('   ✅ FOUND TEST TEXT:', testText);
            }
          }
          
        } catch (error) {
          console.log('   ❌ Decode error:', error.message);
        }
      }
    }
    
    // 2. Look for text in different formats
    console.log('\n🔍 Searching for other text formats...');
    
    // Look for parentheses-enclosed text (another PDF text format)
    const parenTextPattern = /\(([^)]+)\)/g;
    let parenMatches = [];
    while ((match = parenTextPattern.exec(pdfContent)) !== null) {
      parenMatches.push(match[1]);
    }
    
    console.log('📝 Found', parenMatches.length, 'parentheses-enclosed text blocks');
    for (let i = 0; i < Math.min(parenMatches.length, 5); i++) {
      console.log(`   📝 Paren block ${i + 1}:`, parenMatches[i]);
    }
    
    // 3. Look for stream objects that might contain compressed text
    console.log('\n🔍 Searching for stream objects...');
    
    const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
    let streamMatches = [];
    while ((match = streamPattern.exec(pdfContent)) !== null) {
      streamMatches.push(match[1]);
    }
    
    console.log('📝 Found', streamMatches.length, 'stream objects');
    
    for (let i = 0; i < Math.min(streamMatches.length, 3); i++) {
      const streamContent = streamMatches[i];
      console.log(`\n🔍 Stream ${i + 1} (first 100 chars):`, streamContent.substring(0, 100));
      
      // Check if it looks like compressed content
      if (streamContent.includes('x\x9c') || streamContent.includes('\x78\x9c')) {
        console.log('   🗜️  Appears to be compressed (zlib/deflate)');
        
        try {
          const zlib = require('zlib');
          const compressed = Buffer.from(streamContent, 'latin1');
          const decompressed = zlib.inflateSync(compressed);
          const decompressedText = decompressed.toString('utf8');
          
          console.log('   📝 Decompressed content:', decompressedText.substring(0, 200));
          
          // Check for our test text in decompressed content
          const testTexts = ['Simple Text Test', 'Manual Position Test', 'Positioned Text'];
          for (const testText of testTexts) {
            if (decompressedText.includes(testText)) {
              console.log('   ✅ FOUND TEST TEXT IN COMPRESSED STREAM:', testText);
            }
          }
          
        } catch (error) {
          console.log('   ❌ Decompression failed:', error.message);
        }
      }
    }
    
    // 4. Raw search for our test strings
    console.log('\n🔍 Raw search for test strings...');
    const testTexts = ['Simple Text Test', 'Manual Position Test', 'Positioned Text', 'Font Size Text'];
    
    for (const testText of testTexts) {
      const found = pdfContent.includes(testText);
      console.log(`   📝 "${testText}":`, found ? '✅ FOUND' : '❌ Not found');
    }
    
    return { success: true, hexBlocks: hexBlocks.length, streamObjects: streamMatches.length };
    
  } catch (error) {
    console.error('❌ Decode failed:', error.message);
    return { success: false, error: error.message };
  }
}

decodePDFHexContent().then(result => {
  console.log('\n📋 Decode Result:', result);
  
  if (result.success) {
    console.log('\n💡 NEXT STEPS:');
    console.log('1. If text was found in compressed streams, PDFKit is working but using compression');
    console.log('2. If text was found in hex blocks, PDFKit is using hex encoding');
    console.log('3. If no text found anywhere, there\'s a fundamental PDFKit issue');
    console.log('4. Compare with a working PDF to understand the difference');
  }
}).catch(console.error);

