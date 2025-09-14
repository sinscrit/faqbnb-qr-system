const fs = require('fs');
const path = require('path');

// Fix the text rendering in the PDF module by simplifying the font handling
function fixTextRendering() {
  console.log('🔧 Fixing text rendering in PDF module...');
  
  const pdfModulePath = path.join(__dirname, 'src', 'lib', 'pdf_generator_module.js');
  let content = fs.readFileSync(pdfModulePath, 'utf8');
  
  // Find the font override section and replace it with a much simpler approach
  const fontOverrideStart = content.indexOf('// Override widthOfString method with font bypass');
  const fontOverrideEnd = content.indexOf('console.log(\'🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete\');');
  
  if (fontOverrideStart === -1 || fontOverrideEnd === -1) {
    console.log('❌ Could not find font override section');
    return;
  }
  
  const newFontHandling = `      // Simplified font handling - use PDFKit's native methods
      try {
        doc.font('Helvetica');
        console.log('🔍 FONT_SIMPLE: Using Helvetica font');
      } catch (error) {
        console.log('🔍 FONT_SIMPLE: Font setting failed, using default');
      }
      
      `;
  
  // Replace the complex font override section with simple font setting
  const beforeOverride = content.substring(0, fontOverrideStart);
  const afterOverride = content.substring(fontOverrideEnd);
  
  const newContent = beforeOverride + newFontHandling + afterOverride;
  
  // Write the fixed content back
  fs.writeFileSync(pdfModulePath, newContent);
  
  console.log('✅ Fixed text rendering in PDF module');
  console.log('📝 Removed complex font overrides and replaced with simple Helvetica font setting');
}

fixTextRendering();

