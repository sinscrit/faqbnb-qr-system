const fs = require('fs');
const path = require('path');

async function debugLabelPositioning() {
  console.log('🔍 Debugging label positioning in the PDF...');
  
  const pdfPath = path.join(__dirname, 'tmp', 'QR-Codes-2025-09-13T22-34-25.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  console.log('🔍 Detailed Text Positioning Analysis:');
  
  // Extract all text blocks with positioning
  const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
  console.log(`📝 Found ${textBlocks.length} text blocks`);
  
  textBlocks.forEach((block, index) => {
    console.log(`\n--- Text Block ${index + 1} ---`);
    
    // Extract font and size
    const fontMatch = block.match(/\/([A-Za-z]+) ([\d.]+) Tf/);
    if (fontMatch) {
      console.log(`🔤 Font: ${fontMatch[1]} ${fontMatch[2]}pt`);
    }
    
    // Extract positioning commands
    const positionCommands = block.match(/[\d.-]+ [\d.-]+ Td/g) || [];
    positionCommands.forEach(cmd => {
      console.log(`📍 Position: ${cmd}`);
    });
    
    // Extract text content
    const textMatches = block.match(/\((.*?)\) Tj/g) || [];
    textMatches.forEach(text => {
      const content = text.match(/\((.*?)\)/)[1];
      console.log(`📄 Text: "${content}"`);
    });
    
    // Check for color settings
    const colorMatch = block.match(/([\d.]+) ([\d.]+) ([\d.]+) rg/);
    if (colorMatch) {
      console.log(`🎨 Color: RGB(${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]})`);
    }
  });
  
  // Check page dimensions
  const pageMatch = pdfContent.match(/\/MediaBox \[[\d.-]+ [\d.-]+ ([\d.-]+) ([\d.-]+)\]/);
  if (pageMatch) {
    console.log(`\n📏 Page size: ${pageMatch[1]} x ${pageMatch[2]} points`);
  }
  
  // Look for potential issues
  console.log('\n🔍 Potential Issues:');
  
  // Check if text is positioned outside page bounds
  const positions = [];
  textBlocks.forEach(block => {
    const posMatches = block.match(/([\d.-]+) ([\d.-]+) Td/g) || [];
    posMatches.forEach(pos => {
      const coords = pos.match(/([\d.-]+) ([\d.-]+)/);
      if (coords) {
        positions.push({
          x: parseFloat(coords[1]),
          y: parseFloat(coords[2])
        });
      }
    });
  });
  
  if (positions.length > 0) {
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));
    console.log(`   Y coordinates range: ${minY} to ${maxY}`);
    
    if (minY < 0) {
      console.log('   ⚠️ Some text positioned below page bottom (negative Y)');
    }
    if (maxY > 800) {
      console.log('   ⚠️ Some text positioned above page top');
    }
  }
  
  // Check for white text (invisible)
  const whiteTextBlocks = textBlocks.filter(block => 
    block.includes('1 1 1 rg') || block.includes('1.0 1.0 1.0 rg')
  );
  if (whiteTextBlocks.length > 0) {
    console.log(`   ⚠️ Found ${whiteTextBlocks.length} text blocks with white color (invisible)`);
  }
  
  // Check for very small font sizes
  const smallFonts = textBlocks.filter(block => {
    const fontMatch = block.match(/\/[A-Za-z]+ ([\d.]+) Tf/);
    return fontMatch && parseFloat(fontMatch[1]) < 6;
  });
  if (smallFonts.length > 0) {
    console.log(`   ⚠️ Found ${smallFonts.length} text blocks with very small fonts (< 6pt)`);
  }
}

debugLabelPositioning().catch(console.error);

