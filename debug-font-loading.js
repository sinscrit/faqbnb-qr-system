const fs = require('fs');
const path = require('path');

async function debugFontLoading() {
  console.log('🔍 Debugging font loading issues...');
  
  try {
    // Check font directories and permissions
    const projectRoot = process.cwd();
    const publicFontsPath = path.join(projectRoot, 'public', 'fonts');
    const pdfkitDataPath = path.join(projectRoot, 'node_modules', 'pdfkit', 'js', 'data');
    
    console.log('📂 Font Directory Analysis:');
    console.log('   Project root:', projectRoot);
    console.log('   Public fonts path:', publicFontsPath);
    console.log('   PDFKit data path:', pdfkitDataPath);
    
    // Check if directories exist
    console.log('\n📁 Directory Existence:');
    console.log('   Public fonts exists:', fs.existsSync(publicFontsPath));
    console.log('   PDFKit data exists:', fs.existsSync(pdfkitDataPath));
    
    // List contents of font directories
    if (fs.existsSync(publicFontsPath)) {
      const publicFonts = fs.readdirSync(publicFontsPath);
      console.log('   Public fonts contents:', publicFonts);
    }
    
    if (fs.existsSync(pdfkitDataPath)) {
      const pdfkitFonts = fs.readdirSync(pdfkitDataPath);
      console.log('   PDFKit data contents:', pdfkitFonts.slice(0, 10), '...'); // First 10 files
    }
    
    // Check for specific font files PDFKit needs
    const requiredFonts = [
      'Helvetica.afm',
      'Helvetica-Bold.afm', 
      'Times-Roman.afm',
      'Courier.afm'
    ];
    
    console.log('\n🔤 Required Font Files:');
    for (const font of requiredFonts) {
      const publicPath = path.join(publicFontsPath, font);
      const pdfkitPath = path.join(pdfkitDataPath, font);
      
      console.log(`   ${font}:`);
      console.log(`      In public/fonts: ${fs.existsSync(publicPath) ? '✅' : '❌'}`);
      console.log(`      In pdfkit/data: ${fs.existsSync(pdfkitPath) ? '✅' : '❌'}`);
      
      // Check file permissions if it exists
      if (fs.existsSync(pdfkitPath)) {
        try {
          const stats = fs.statSync(pdfkitPath);
          console.log(`      Size: ${stats.size} bytes`);
          console.log(`      Readable: ${fs.constants.R_OK & fs.accessSync(pdfkitPath, fs.constants.R_OK) ? '✅' : '❌'}`);
        } catch (e) {
          console.log(`      Permission error: ${e.message}`);
        }
      }
    }
    
    // Test PDFKit font loading directly
    console.log('\n🧪 Testing PDFKit Font Loading:');
    
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Test different font loading methods
    console.log('   Testing font methods:');
    
    try {
      doc.font('Helvetica');
      console.log('   ✅ doc.font("Helvetica") - SUCCESS');
    } catch (error) {
      console.log('   ❌ doc.font("Helvetica") - FAILED:', error.message);
    }
    
    try {
      doc.font('Times-Roman');
      console.log('   ✅ doc.font("Times-Roman") - SUCCESS');
    } catch (error) {
      console.log('   ❌ doc.font("Times-Roman") - FAILED:', error.message);
    }
    
    try {
      doc.font('Courier');
      console.log('   ✅ doc.font("Courier") - SUCCESS');
    } catch (error) {
      console.log('   ❌ doc.font("Courier") - FAILED:', error.message);
    }
    
    // Test with explicit font path
    const helveticaPath = path.join(pdfkitDataPath, 'Helvetica.afm');
    if (fs.existsSync(helveticaPath)) {
      try {
        doc.font(helveticaPath);
        console.log('   ✅ doc.font(explicit path) - SUCCESS');
      } catch (error) {
        console.log('   ❌ doc.font(explicit path) - FAILED:', error.message);
      }
    }
    
    // Check environment variables that might affect font loading
    console.log('\n🌍 Environment Variables:');
    console.log('   PDFKIT_FONT_PATH:', process.env.PDFKIT_FONT_PATH || 'not set');
    console.log('   PDFKIT_DATA_PATH:', process.env.PDFKIT_DATA_PATH || 'not set');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Font debug failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

async function testSimpleFontPDF() {
  console.log('\n🧪 Testing Simple Font PDF Generation...');
  
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    const outputPath = path.join(__dirname, 'tmp', 'font-test.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    
    // Try to render text with different approaches
    console.log('📝 Attempting text rendering...');
    
    // Method 1: Default font
    try {
      doc.fontSize(12);
      doc.text('Default Font Test', 100, 100);
      console.log('   ✅ Default font text added');
    } catch (error) {
      console.log('   ❌ Default font failed:', error.message);
    }
    
    // Method 2: Explicit Helvetica
    try {
      doc.font('Helvetica').fontSize(14);
      doc.text('Helvetica Font Test', 100, 150);
      console.log('   ✅ Helvetica font text added');
    } catch (error) {
      console.log('   ❌ Helvetica font failed:', error.message);
    }
    
    // Method 3: Force font registration
    try {
      // This is what the PDF module might be doing wrong
      doc.registerFont('TestHelvetica', path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data', 'Helvetica.afm'));
      doc.font('TestHelvetica').fontSize(16);
      doc.text('Registered Font Test', 100, 200);
      console.log('   ✅ Registered font text added');
    } catch (error) {
      console.log('   ❌ Registered font failed:', error.message);
    }
    
    doc.end();
    
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    console.log('✅ Font test PDF created:', outputPath);
    
    // Analyze the result
    const pdfBuffer = fs.readFileSync(outputPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('📊 Font Test PDF Analysis:');
    console.log('   File size:', pdfBuffer.length, 'bytes');
    console.log('   Contains "Default Font Test":', pdfContent.includes('Default Font Test') ? '✅' : '❌');
    console.log('   Contains "Helvetica Font Test":', pdfContent.includes('Helvetica Font Test') ? '✅' : '❌');
    console.log('   Contains "Registered Font Test":', pdfContent.includes('Registered Font Test') ? '✅' : '❌');
    
    return { success: true, pdfPath: outputPath };
    
  } catch (error) {
    console.error('❌ Font test PDF failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runFontDiagnostics() {
  console.log('🔍 Running Font Diagnostics...\n');
  
  const debugResult = await debugFontLoading();
  console.log('\n📋 Font Debug Result:', debugResult);
  
  const testResult = await testSimpleFontPDF();
  console.log('\n📋 Font Test Result:', testResult);
  
  console.log('\n💡 FONT DIAGNOSIS:');
  console.log('If font files are missing or have permission issues, that explains why labels don\'t appear.');
  console.log('The PDF module can draw lines (cutlines) but can\'t render text without proper fonts.');
}

runFontDiagnostics().catch(console.error);

