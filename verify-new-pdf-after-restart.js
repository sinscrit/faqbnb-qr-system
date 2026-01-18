const fs = require('fs');
const path = require('path');

async function verifyNewPDFAfterRestart() {
  console.log('🔍 Verifying the new PDF generated after server restart...');
  
  const newPdfPath = path.join(__dirname, '.playwright-mcp', 'QR-Codes-2025-09-13T22-34-25.pdf');
  
  if (!fs.existsSync(newPdfPath)) {
    console.log('❌ New PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(newPdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  console.log('🔍 New PDF Analysis (After Server Restart):');
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
  
  // Check font sizes
  const fontRefs = pdfContent.match(/\/Helvetica ([\d.]+) Tf/g) || [];
  if (fontRefs.length > 0) {
    const fontSizes = fontRefs.map(ref => {
      const match = ref.match(/([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    });
    const avgSize = fontSizes.reduce((sum, size) => sum + size, 0) / fontSizes.length;
    console.log('   📏 Average font size:', avgSize.toFixed(1), 'pt');
  }
  
  // Check for QR code images
  const imageObjects = pdfContent.match(/\/Type \/XObject/g) || [];
  console.log('   🖼️ Image objects found:', imageObjects.length);
  
  // Summary
  console.log('\n📋 FINAL VERIFICATION SUMMARY:');
  console.log(`   ✅ Labels found: ${labelsFound}/${expectedLabels.length}`);
  console.log(`   ✅ Text objects: ${textObjects.length}`);
  console.log(`   ✅ Image objects: ${imageObjects.length}`);
  console.log(`   ✅ File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
  
  if (labelsFound === expectedLabels.length && textObjects.length >= 11 && imageObjects.length >= 11) {
    console.log('\n🎉 SUCCESS: PDF contains both QR codes AND labels after server restart!');
    console.log('   ✅ All 11 labels are present');
    console.log('   ✅ Text rendering is working');
    console.log('   ✅ Image rendering is working');
    console.log('   ✅ PDF generation is fully functional');
  } else {
    console.log('\n⚠️ PARTIAL SUCCESS: Some elements may be missing');
  }
}

verifyNewPDFAfterRestart().catch(console.error);

