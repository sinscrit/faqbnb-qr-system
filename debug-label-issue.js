const fs = require('fs');
const path = require('path');

async function debugLabelIssue() {
  console.log('🔍 Debugging label rendering issue...');
  
  // Check the generated PDF for text content
  const pdfPath = path.join(__dirname, '.playwright-mcp', 'QR-Codes-2025-09-13T22-25-23.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  console.log('🔍 PDF Content Analysis:');
  console.log('   📊 File size:', pdfBuffer.length, 'bytes');
  
  // Look for text objects in PDF
  const textObjects = pdfContent.match(/BT[\s\S]*?ET/g) || [];
  console.log('   📝 Text objects found:', textObjects.length);
  
  // Look for specific text content
  const hasFullGuide = pdfContent.includes('Full Guide');
  const hasTrashCleaning = pdfContent.includes('Trash & Cleaning');
  const hasTVLivingRoom = pdfContent.includes('TV-Living Room');
  const hasDishwasher = pdfContent.includes('Dishwasher');
  const hasWashingMachine = pdfContent.includes('Washing Machine');
  
  console.log('🔍 Label Content Check:');
  console.log('   ✅ "Full Guide":', hasFullGuide);
  console.log('   ✅ "Trash & Cleaning":', hasTrashCleaning);
  console.log('   ✅ "TV-Living Room":', hasTVLivingRoom);
  console.log('   ✅ "Dishwasher":', hasDishwasher);
  console.log('   ✅ "Washing Machine":', hasWashingMachine);
  
  // Look for font references
  const fontRefs = pdfContent.match(/\/[A-Za-z]+ \d+ Tf/g) || [];
  console.log('   🔤 Font references:', fontRefs);
  
  // Look for text positioning commands
  const textPositions = pdfContent.match(/\d+\.?\d* \d+\.?\d* Td/g) || [];
  console.log('   📍 Text positions:', textPositions.length);
  
  // Look for actual text content in parentheses
  const textContent = pdfContent.match(/\([^)]+\) Tj/g) || [];
  console.log('   📄 Text content found:', textContent.length);
  
  if (textContent.length > 0) {
    console.log('   📄 Sample text content:');
    textContent.slice(0, 10).forEach((text, i) => {
      console.log(`      ${i + 1}: ${text}`);
    });
  }
  
  // Check for Helvetica font (our fallback font)
  const hasHelvetica = pdfContent.includes('Helvetica');
  console.log('   🔤 Uses Helvetica font:', hasHelvetica);
  
  // Look for our debug messages in the content
  const hasDebugMarkers = pdfContent.includes('FONT_DIRECT') || pdfContent.includes('LABEL_DEBUG');
  console.log('   🐛 Contains debug markers:', hasDebugMarkers);
  
  if (textObjects.length === 0 && textContent.length === 0) {
    console.log('❌ NO TEXT FOUND IN PDF - Labels are not being rendered!');
  } else if (textContent.length > 0) {
    console.log('✅ Text content found - Labels should be visible');
  } else {
    console.log('⚠️  Text objects found but no readable content - Font rendering issue');
  }
}

debugLabelIssue().catch(console.error);

