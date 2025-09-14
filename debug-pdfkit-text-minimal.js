const fs = require('fs');
const path = require('path');

async function debugPDFKitTextMinimal() {
  console.log('🔍 Debugging PDFKit text rendering with minimal test...');
  
  try {
    // Import PDFKit directly
    const PDFDocument = require('pdfkit');
    
    console.log('📋 Creating minimal PDF with text...');
    
    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set up output stream
    const outputPath = path.join(__dirname, 'tmp', 'minimal-text-test.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    
    console.log('🔤 Adding text to PDF...');
    
    // Try different text rendering approaches
    doc.fontSize(12);
    doc.font('Helvetica');
    
    // Method 1: Simple text
    console.log('📝 Method 1: Simple text');
    doc.text('Simple Text Test', 100, 100);
    
    // Method 2: Text with explicit positioning
    console.log('📝 Method 2: Explicit positioning');
    doc.text('Positioned Text Test', 100, 150, { width: 200 });
    
    // Method 3: Text with font size
    console.log('📝 Method 3: With font size');
    doc.fontSize(14).text('Font Size Text Test', 100, 200);
    
    // Method 4: Text with color
    console.log('📝 Method 4: With color');
    doc.fillColor('black').text('Colored Text Test', 100, 250);
    
    // Method 5: Manual text positioning (like in the PDF module)
    console.log('📝 Method 5: Manual positioning (like PDF module)');
    const x = 100;
    const y = 300;
    doc.text('Manual Position Test', x, y);
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    console.log('✅ Minimal PDF created:', outputPath);
    
    // Analyze the PDF content
    const pdfBuffer = fs.readFileSync(outputPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('📊 PDF Analysis:');
    console.log('   File size:', pdfBuffer.length, 'bytes');
    console.log('   Has PDF header:', pdfContent.startsWith('%PDF-') ? '✅' : '❌');
    console.log('   Has text operators (BT/ET):', pdfContent.includes('BT') && pdfContent.includes('ET') ? '✅' : '❌');
    console.log('   Has TJ operator:', pdfContent.includes('TJ') ? '✅' : '❌');
    console.log('   Has Tj operator:', pdfContent.includes('Tj') ? '✅' : '❌');
    console.log('   Contains "Simple Text Test":', pdfContent.includes('Simple Text Test') ? '✅' : '❌');
    console.log('   Contains "Manual Position Test":', pdfContent.includes('Manual Position Test') ? '✅' : '❌');
    
    // Look for text blocks
    const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('   Text blocks found:', textBlocks.length);
    
    if (textBlocks.length > 0) {
      console.log('   📝 First text block preview:');
      console.log('   ', textBlocks[0].substring(0, 200));
    }
    
    // Look for hex-encoded text
    const hexTextPattern = /<[0-9A-Fa-f\s]+>/g;
    const hexMatches = pdfContent.match(hexTextPattern);
    if (hexMatches) {
      console.log('   🔍 Hex-encoded text blocks:', hexMatches.length);
      console.log('   📝 First hex block:', hexMatches[0]?.substring(0, 100));
    }
    
    return {
      success: true,
      pdfPath: outputPath,
      size: pdfBuffer.length,
      hasTextOperators: pdfContent.includes('BT') && pdfContent.includes('ET'),
      hasTJOperator: pdfContent.includes('TJ'),
      hasTjOperator: pdfContent.includes('Tj'),
      textBlocks: textBlocks.length,
      hexBlocks: hexMatches ? hexMatches.length : 0
    };
    
  } catch (error) {
    console.error('❌ Minimal test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

async function comparePDFKitVersions() {
  console.log('\n🔍 Checking PDFKit version and configuration...');
  
  try {
    const PDFDocument = require('pdfkit');
    const packagePath = path.join(__dirname, 'node_modules', 'pdfkit', 'package.json');
    
    if (fs.existsSync(packagePath)) {
      const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log('📦 PDFKit version:', packageInfo.version);
    }
    
    // Check PDFKit constructor
    console.log('🔧 PDFKit constructor type:', typeof PDFDocument);
    console.log('🔧 PDFKit is function:', typeof PDFDocument === 'function');
    
    // Try to create a document and check its methods
    const doc = new PDFDocument();
    console.log('📝 Document created successfully');
    console.log('🔧 Has text method:', typeof doc.text === 'function');
    console.log('🔧 Has font method:', typeof doc.font === 'function');
    console.log('🔧 Has fontSize method:', typeof doc.fontSize === 'function');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ PDFKit check failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runMinimalTests() {
  console.log('🧪 Running Minimal PDFKit Text Tests...\n');
  
  // Test 1: Check PDFKit version and methods
  const versionResult = await comparePDFKitVersions();
  console.log('\n📋 Version Check Result:', versionResult);
  
  // Test 2: Minimal text rendering
  const textResult = await debugPDFKitTextMinimal();
  console.log('\n📋 Text Rendering Result:', textResult);
  
  console.log('\n🎯 DIAGNOSIS:');
  if (textResult.success && textResult.hasTextOperators) {
    console.log('✅ PDFKit text rendering works correctly');
    console.log('🔍 The issue must be in the PDF module\'s text rendering logic');
    console.log('💡 Next: Compare working minimal code with PDF module code');
  } else if (textResult.success && !textResult.hasTextOperators) {
    console.log('❌ PDFKit text rendering is not working');
    console.log('🔍 This is a fundamental PDFKit issue');
    console.log('💡 Next: Check PDFKit installation or environment');
  } else {
    console.log('❌ Could not create minimal PDF');
    console.log('🔍 PDFKit installation or import issue');
  }
}

runMinimalTests().catch(console.error);

