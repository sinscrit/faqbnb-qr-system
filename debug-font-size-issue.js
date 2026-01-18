const fs = require('fs');
const path = require('path');

async function debugFontSizeIssue() {
  console.log('🔍 Debugging font size issue in PDF...');
  
  const pdfPath = path.join(__dirname, '.playwright-mcp', 'QR-Codes-2025-09-13T22-25-23.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  // Look for all font references in the PDF
  const allFontRefs = pdfContent.match(/\/[A-Za-z]+ [\d.]+\s+Tf/g) || [];
  console.log('🔍 All font references found:', allFontRefs);
  
  // Look for text blocks with more context
  const btEtBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
  
  console.log('🔍 Detailed text block analysis:');
  btEtBlocks.forEach((block, index) => {
    console.log(`\n--- Text Block ${index + 1} ---`);
    console.log(block);
    console.log('--- End Block ---\n');
  });
  
  // Check if font size is being set before text positioning
  const hasProperFontSequence = btEtBlocks.some(block => {
    const lines = block.split('\n');
    let hasFontSet = false;
    let hasTextPositioning = false;
    let hasTextContent = false;
    
    for (const line of lines) {
      if (line.includes('Tf')) hasFontSet = true;
      if (line.includes('Td')) hasTextPositioning = true;
      if (line.includes('Tj')) hasTextContent = true;
    }
    
    return hasFontSet && hasTextPositioning && hasTextContent;
  });
  
  console.log('🔍 Font sequence analysis:');
  console.log('   ✅ Proper font sequence (Tf -> Td -> Tj):', hasProperFontSequence);
  
  // Look for specific font size patterns
  const fontSizePattern = /\/Helvetica\s+([\d.]+)\s+Tf/g;
  let match;
  const fontSizes = [];
  
  while ((match = fontSizePattern.exec(pdfContent)) !== null) {
    fontSizes.push(parseFloat(match[1]));
  }
  
  console.log('🔍 Extracted font sizes:', fontSizes);
  
  if (fontSizes.length > 0) {
    const avgSize = fontSizes.reduce((sum, size) => sum + size, 0) / fontSizes.length;
    const minSize = Math.min(...fontSizes);
    const maxSize = Math.max(...fontSizes);
    
    console.log('🔍 Font size statistics:');
    console.log('   📊 Average:', avgSize.toFixed(1));
    console.log('   📏 Min:', minSize);
    console.log('   📏 Max:', maxSize);
    
    if (minSize < 6) {
      console.log('⚠️  WARNING: Font size too small (< 6pt) - text may not be visible!');
    } else if (minSize < 8) {
      console.log('⚠️  WARNING: Font size very small (< 8pt) - text may be hard to read!');
    } else {
      console.log('✅ Font sizes appear reasonable for visibility');
    }
  } else {
    console.log('❌ NO FONT SIZES FOUND - This could be the problem!');
  }
  
  // Check for color settings
  const hasTextColor = pdfContent.includes('rg') || pdfContent.includes('RG');
  console.log('🔍 Text color settings found:', hasTextColor);
  
  // Look for graphics state issues
  const hasGraphicsState = pdfContent.includes('q') && pdfContent.includes('Q');
  console.log('🔍 Graphics state management found:', hasGraphicsState);
}

debugFontSizeIssue().catch(console.error);

