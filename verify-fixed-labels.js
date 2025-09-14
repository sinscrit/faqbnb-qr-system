const fs = require('fs');
const path = require('path');

async function verifyFixedLabels() {
  console.log('🔍 Verifying the fixed label positioning in the new PDF...');
  
  const newPdfPath = path.join(__dirname, 'tmp', 'QR-Codes-FIXED-LABELS.pdf');
  
  if (!fs.existsSync(newPdfPath)) {
    console.log('❌ New PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(newPdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  console.log('🔍 Fixed PDF Analysis:');
  console.log('   📊 File size:', pdfBuffer.length, 'bytes');
  
  // Check for all expected labels
  const expectedLabels = [
    'Full Guide',
    'Trash & Cleaning',
    'TV-Living Room',
    'Dishwasher',
    'Washing Machine',
    'Induction Stove',
    'Nest Learning Thermostat',
    'Samsung 65" QLED Smart TV',
    'Bosch 800 Series Dishwasher',
    'Keurig K-Elite Coffee Maker',
    'Samsung WF45T6000AW Washing Machine'
  ];
  
  console.log('🔍 Label presence check:');
  let labelsFound = 0;
  expectedLabels.forEach((label, index) => {
    const isPresent = pdfContent.includes(label);
    console.log(`   ${isPresent ? '✅' : '❌'} ${index + 1}: "${label}"`);
    if (isPresent) labelsFound++;
  });
  
  // Count text objects
  const textObjects = pdfContent.match(/BT[\s\S]*?ET/g) || [];
  console.log('   📝 Text objects found:', textObjects.length);
  
  // Analyze text positioning
  console.log('\n📍 Label positioning analysis:');
  const labelPositions = [];
  textObjects.forEach((block, index) => {
    const posMatch = block.match(/([\d.-]+)\s+([\d.-]+)\s+Td/);
    const textMatch = block.match(/\((.*?)\)\s+Tj/);
    
    if (posMatch && textMatch) {
      const x = parseFloat(posMatch[1]);
      const y = parseFloat(posMatch[2]);
      const text = textMatch[1];
      
      labelPositions.push({ index, x, y, text });
      console.log(`   Label ${index + 1}: "${text}" at (${x}, ${y})`);
    }
  });
  
  // Compare with previous positioning (before fix)
  const oldPositions = [671.8225, 468.4375, 265.0525, 61.66750000000013]; // Y coordinates from before fix
  const newYPositions = labelPositions.map(pos => pos.y).sort((a, b) => b - a); // Descending
  
  console.log('\n🔍 Position comparison:');
  console.log('   Before fix (Y coordinates):', oldPositions);
  console.log('   After fix (Y coordinates):', newYPositions);
  
  // Check if labels are now positioned lower (smaller Y values in PDF coordinates)
  const averageOldY = oldPositions.reduce((sum, y) => sum + y, 0) / oldPositions.length;
  const averageNewY = newYPositions.reduce((sum, y) => sum + y, 0) / newYPositions.length;
  
  console.log(`   Average Y before fix: ${averageOldY.toFixed(1)}`);
  console.log(`   Average Y after fix: ${averageNewY.toFixed(1)}`);
  
  if (averageNewY < averageOldY) {
    console.log('   ✅ Labels moved DOWN (lower Y coordinates) - FIX SUCCESSFUL!');
  } else {
    console.log('   ❌ Labels did not move down - fix may not have worked');
  }
  
  // Summary
  console.log('\n📋 Summary:');
  console.log(`   ✅ Labels found: ${labelsFound}/${expectedLabels.length}`);
  console.log(`   ✅ Text objects: ${textObjects.length}`);
  console.log(`   ✅ File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
  
  if (labelsFound === expectedLabels.length) {
    console.log('\n🎉 SUCCESS: All labels are present in the PDF!');
    console.log('📁 File location: tmp/QR-Codes-FIXED-LABELS.pdf');
  } else {
    console.log('\n⚠️ Some labels may be missing from the PDF');
  }
}

verifyFixedLabels().catch(console.error);

