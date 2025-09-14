const fs = require('fs');
const path = require('path');

async function verifyAfterRestart() {
  console.log('🔍 Verifying label positioning after server restart...');
  
  const newPdfPath = path.join(__dirname, 'tmp', 'QR-Codes-AFTER-SERVER-RESTART.pdf');
  
  if (!fs.existsSync(newPdfPath)) {
    console.log('❌ New PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(newPdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  console.log('🔍 PDF Analysis After Server Restart:');
  console.log('   📊 File size:', pdfBuffer.length, 'bytes');
  
  // Check for the "Full Guide" label
  const hasFullGuide = pdfContent.includes('Full Guide');
  console.log('   📝 Contains "Full Guide" label:', hasFullGuide ? '✅' : '❌');
  
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
  
  // Compare with previous positioning
  const oldY = 671.8225; // Y coordinate from before fix (first label)
  const newY = labelPositions.length > 0 ? labelPositions[0].y : null;
  
  console.log('\n🔍 Position comparison:');
  console.log('   Before fix (Y coordinate):', oldY);
  console.log('   After restart (Y coordinate):', newY);
  
  if (newY !== null) {
    if (newY < oldY) {
      console.log('   ✅ Label moved DOWN (lower Y coordinate) - FIX IS WORKING!');
      console.log(`   📏 Difference: ${(oldY - newY).toFixed(1)} points lower`);
    } else if (newY === oldY) {
      console.log('   ❌ Label at same position - fix not applied yet');
    } else {
      console.log('   ❌ Label moved UP - unexpected behavior');
    }
  }
  
  // Check for QR code images
  const imageObjects = pdfContent.match(/\/Type\s+\/XObject/g) || [];
  console.log('\n🖼️ Image objects found:', imageObjects.length);
  
  // Check page dimensions
  const pageMatch = pdfContent.match(/\/MediaBox\s+\[[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\]/);
  if (pageMatch) {
    console.log('📏 Page size:', `${pageMatch[1]} x ${pageMatch[2]} points`);
  }
  
  // Summary
  console.log('\n📋 Summary:');
  console.log(`   ✅ Label present: ${hasFullGuide ? 'YES' : 'NO'}`);
  console.log(`   ✅ Text objects: ${textObjects.length}`);
  console.log(`   ✅ Image objects: ${imageObjects.length}`);
  console.log(`   ✅ File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
  
  if (hasFullGuide && newY !== null && newY < oldY) {
    console.log('\n🎉 SUCCESS: Label positioning fix is working!');
    console.log('📁 File location: tmp/QR-Codes-AFTER-SERVER-RESTART.pdf');
  } else if (hasFullGuide && newY === oldY) {
    console.log('\n⚠️ Label is present but positioning fix not yet applied');
  } else {
    console.log('\n❌ Issue with label generation or positioning');
  }
}

verifyAfterRestart().catch(console.error);

