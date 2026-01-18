const fs = require('fs');
const path = require('path');

async function debugTextPositioning() {
  console.log('🔍 Debugging text positioning in PDF...');
  
  const pdfPath = path.join(__dirname, '.playwright-mcp', 'QR-Codes-2025-09-13T22-25-23.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  // Extract text positioning and content together
  const textBlocks = [];
  const btEtBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
  
  console.log('🔍 Found', btEtBlocks.length, 'text blocks');
  
  btEtBlocks.forEach((block, index) => {
    // Extract font size
    const fontMatch = block.match(/\/Helvetica (\d+) Tf/);
    const fontSize = fontMatch ? parseInt(fontMatch[1]) : 'unknown';
    
    // Extract positioning
    const posMatch = block.match(/([\d.-]+) ([\d.-]+) Td/);
    const x = posMatch ? parseFloat(posMatch[1]) : 'unknown';
    const y = posMatch ? parseFloat(posMatch[2]) : 'unknown';
    
    // Extract text content
    const textMatch = block.match(/\(([^)]+)\) Tj/);
    const text = textMatch ? textMatch[1] : 'unknown';
    
    textBlocks.push({
      index,
      text,
      x,
      y,
      fontSize,
      block: block.trim()
    });
  });
  
  console.log('🔍 Text positioning analysis:');
  textBlocks.forEach(({ index, text, x, y, fontSize }) => {
    console.log(`   ${index + 1}: "${text}" at (${x}, ${y}) size ${fontSize}`);
  });
  
  // Check if Y coordinates are reasonable (PDF coordinate system has origin at bottom-left)
  // For A4 paper (595x842 points), reasonable Y coordinates should be between 0-842
  const reasonableYCoords = textBlocks.filter(block => 
    typeof block.y === 'number' && block.y >= 0 && block.y <= 842
  );
  
  console.log('🔍 Coordinate analysis:');
  console.log('   📊 Total text blocks:', textBlocks.length);
  console.log('   ✅ Blocks with reasonable Y coordinates:', reasonableYCoords.length);
  console.log('   ❌ Blocks with problematic coordinates:', textBlocks.length - reasonableYCoords.length);
  
  // Check for negative or very large coordinates that might be off-page
  const problematicBlocks = textBlocks.filter(block => 
    typeof block.y === 'number' && (block.y < 0 || block.y > 842)
  );
  
  if (problematicBlocks.length > 0) {
    console.log('⚠️  Problematic text positioning found:');
    problematicBlocks.forEach(({ text, x, y }) => {
      console.log(`      "${text}" at (${x}, ${y}) - OFF PAGE!`);
    });
  }
  
  // Check font sizes
  const fontSizes = textBlocks.map(block => block.fontSize).filter(size => typeof size === 'number');
  const avgFontSize = fontSizes.reduce((sum, size) => sum + size, 0) / fontSizes.length;
  const minFontSize = Math.min(...fontSizes);
  const maxFontSize = Math.max(...fontSizes);
  
  console.log('🔍 Font size analysis:');
  console.log('   📊 Average font size:', avgFontSize.toFixed(1));
  console.log('   📏 Min font size:', minFontSize);
  console.log('   📏 Max font size:', maxFontSize);
  
  if (minFontSize < 6) {
    console.log('⚠️  Some text may be too small to be visible (< 6pt)');
  }
  
  // Check if text is positioned below QR codes (which should be around the middle of the page)
  const midPageY = 421; // Half of A4 height
  const textBelowMidPage = textBlocks.filter(block => 
    typeof block.y === 'number' && block.y < midPageY
  );
  
  console.log('🔍 Layout analysis:');
  console.log('   📍 Text blocks below mid-page (likely labels):', textBelowMidPage.length);
  console.log('   📍 Text blocks above mid-page:', textBlocks.length - textBelowMidPage.length);
  
  if (textBelowMidPage.length === 0) {
    console.log('❌ NO TEXT BELOW MID-PAGE - Labels may be positioned incorrectly!');
  }
}

debugTextPositioning().catch(console.error);

