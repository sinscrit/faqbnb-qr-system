const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function testFontLoading() {
  console.log('🔍 Testing font loading in PDFKit...');
  
  try {
    // Create a fresh PDF document
    const doc = new PDFDocument();
    
    // Create output path
    const outputPath = path.join(__dirname, 'tmp', 'font-test.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    
    console.log('📄 Created PDF document');
    
    // Test different font approaches
    console.log('\n🔤 Testing different fonts:');
    
    // Test 1: No font setting (use default)
    try {
      doc.text('DEFAULT FONT TEST', 50, 50);
      console.log('✅ Default font text added');
    } catch (error) {
      console.log('❌ Default font failed:', error.message);
    }
    
    // Test 2: Try Helvetica explicitly
    try {
      doc.font('Helvetica').fontSize(14).text('HELVETICA FONT TEST', 50, 100);
      console.log('✅ Helvetica font text added');
    } catch (error) {
      console.log('❌ Helvetica font failed:', error.message);
    }
    
    // Test 3: Try Times-Roman
    try {
      doc.font('Times-Roman').fontSize(14).text('TIMES-ROMAN FONT TEST', 50, 150);
      console.log('✅ Times-Roman font text added');
    } catch (error) {
      console.log('❌ Times-Roman font failed:', error.message);
    }
    
    // Test 4: Try Courier
    try {
      doc.font('Courier').fontSize(14).text('COURIER FONT TEST', 50, 200);
      console.log('✅ Courier font text added');
    } catch (error) {
      console.log('❌ Courier font failed:', error.message);
    }
    
    // Test 5: Try with explicit font registration
    try {
      // Check if we can register a font manually
      console.log('\n🔧 Attempting manual font registration...');
      
      // Try to use a system font path (this might not work in all environments)
      const systemFontPaths = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/Arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
      ];
      
      let fontRegistered = false;
      for (const fontPath of systemFontPaths) {
        if (fs.existsSync(fontPath)) {
          try {
            doc.registerFont('SystemFont', fontPath);
            doc.font('SystemFont').fontSize(14).text('SYSTEM FONT TEST', 50, 250);
            console.log('✅ System font registered and used:', fontPath);
            fontRegistered = true;
            break;
          } catch (fontError) {
            console.log('❌ System font registration failed:', fontPath, fontError.message);
          }
        }
      }
      
      if (!fontRegistered) {
        console.log('❌ No system fonts found or registered');
      }
      
    } catch (error) {
      console.log('❌ Font registration failed:', error.message);
    }
    
    // Test 6: Try with fillColor and strokeColor
    try {
      doc.fillColor('red').strokeColor('blue').fontSize(16).text('COLORED TEXT TEST', 50, 300);
      console.log('✅ Colored text added');
    } catch (error) {
      console.log('❌ Colored text failed:', error.message);
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    console.log('\n✅ Font test PDF generated:', outputPath);
    
    // Analyze the PDF content
    const pdfBuffer = fs.readFileSync(outputPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('\n📊 Analysis:');
    console.log('   File size:', pdfBuffer.length, 'bytes');
    
    // Check for different text strings
    const testStrings = [
      'DEFAULT FONT TEST',
      'HELVETICA FONT TEST', 
      'TIMES-ROMAN FONT TEST',
      'COURIER FONT TEST',
      'SYSTEM FONT TEST',
      'COLORED TEXT TEST'
    ];
    
    testStrings.forEach(testString => {
      const found = pdfContent.includes(testString);
      console.log(`   "${testString}": ${found ? '✅' : '❌'}`);
    });
    
    // Check text blocks
    const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('   Text blocks found:', textBlocks.length);
    
    if (textBlocks.length > 0) {
      console.log('\n📝 Text blocks:');
      textBlocks.forEach((block, index) => {
        console.log(`Block ${index + 1}:`, block.replace(/\n/g, ' '));
      });
    }
    
    // Check for font references
    const fontRefs = pdfContent.match(/\/[A-Za-z-]+ \d+ Tf/g) || [];
    console.log('   Font references:', fontRefs);
    
    if (textBlocks.length === 0) {
      console.log('\n🔍 Debugging: No text blocks found. Checking PDF structure...');
      
      // Look for any text-related PDF objects
      const textObjects = pdfContent.match(/\([^)]*\) Tj/g) || [];
      console.log('   Text objects (Tj commands):', textObjects.length);
      
      if (textObjects.length > 0) {
        console.log('   Text objects found:', textObjects);
        console.log('   🤔 Text objects exist but not in proper BT/ET blocks');
      }
    }
    
  } catch (error) {
    console.error('❌ Error in font loading test:', error);
    console.error('Stack trace:', error.stack);
  }
}

testFontLoading().catch(console.error);

