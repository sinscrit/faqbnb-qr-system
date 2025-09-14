const fs = require('fs');
const path = require('path');

function createCleanPDFModule() {
  console.log('🔧 Creating clean PDF module without font overrides...');
  
  const pdfModulePath = path.join(__dirname, 'src', 'lib', 'pdf_generator_module.js');
  let content = fs.readFileSync(pdfModulePath, 'utf8');
  
  // Find the font override section
  const overrideStart = content.indexOf('console.log(\'🔍 PDF_OVERRIDE_DEBUG: Setting up font method overrides...\');');
  const overrideEnd = content.indexOf('console.log(\'🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete\');');
  
  if (overrideStart === -1 || overrideEnd === -1) {
    console.log('❌ Could not find font override section');
    return;
  }
  
  console.log('📍 Found font override section from position', overrideStart, 'to', overrideEnd);
  
  // Replace the entire font override section with simple font setup
  const beforeOverride = content.substring(0, overrideStart);
  const afterOverride = content.substring(overrideEnd);
  
  const cleanFontHandling = `      // Clean font handling - use PDFKit native methods
      try {
        doc.font('Helvetica');
        doc.fontSize(12);
        console.log('🔍 FONT_CLEAN: Set up Helvetica font');
      } catch (fontError) {
        console.log('🔍 FONT_CLEAN: Font setup failed, using defaults:', fontError.message);
      }
      
      `;
  
  const newContent = beforeOverride + cleanFontHandling + afterOverride;
  
  // Create backup
  const backupPath = pdfModulePath + '.backup';
  fs.writeFileSync(backupPath, content);
  console.log('📄 Created backup:', backupPath);
  
  // Write the clean version
  fs.writeFileSync(pdfModulePath, newContent);
  console.log('✅ Created clean PDF module without font overrides');
  
  return true;
}

createCleanPDFModule();
