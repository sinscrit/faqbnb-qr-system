const fs = require('fs');
const path = require('path');

async function checkNewPDFLabels() {
  console.log('🔍 Checking the newly generated PDF for labels...');
  
  const newPdfPath = path.join(__dirname, '.playwright-mcp', 'QR-Codes-2025-09-13T22-26-45.pdf');
  
  if (!fs.existsSync(newPdfPath)) {
    console.log('❌ New PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(newPdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  console.log('🔍 New PDF Analysis:');
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
    'Samsung 65\" QLED Smart TV',
    'Bosch 800 Series Dishwasher',
    'Keurig K-Elite Coffee Maker',
    'Samsung WF45T6000AW Washing Machine'
  ];
  
  console.log('🔍 Label presence check:');
  expectedLabels.forEach((label, index) => {
    const isPresent = pdfContent.includes(label);
    console.log(`   ${isPresent ? '✅' : '❌'} ${index + 1}: "${label}"`);
  });
  
  // Count text objects
  const textObjects = pdfContent.match(/BT[\s\S]*?ET/g) || [];
  console.log('   📝 Text objects found:', textObjects.length);
  
  // Check font sizes
  const fontRefs = pdfContent.match(/\/Helvetica ([\d.]+) Tf/g) || [];
  console.log('   🔤 Font references:', fontRefs.length);
  
  if (fontRefs.length > 0) {
    const fontSizes = fontRefs.map(ref => {
      const match = ref.match(/([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    });
    const avgSize = fontSizes.reduce((sum, size) => sum + size, 0) / fontSizes.length;
    console.log('   📏 Average font size:', avgSize.toFixed(1), 'pt');
  }
  
  // Check if this PDF has the same content as the previous one
  const oldPdfPath = path.join(__dirname, '.playwright-mcp', 'QR-Codes-2025-09-13T22-25-23.pdf');
  if (fs.existsSync(oldPdfPath)) {
    const oldPdfBuffer = fs.readFileSync(oldPdfPath);
    const sameSize = pdfBuffer.length === oldPdfBuffer.length;
    console.log('   🔄 Same size as previous PDF:', sameSize);
    
    if (sameSize) {
      const sameContent = pdfBuffer.equals(oldPdfBuffer);
      console.log('   🔄 Identical content to previous PDF:', sameContent);
    }
  }
  
  // Summary
  const labelsFound = expectedLabels.filter(label => pdfContent.includes(label)).length;
  console.log('\n📊 Summary:');
  console.log(`   ✅ Labels found: ${labelsFound}/${expectedLabels.length}`);
  console.log(`   📝 Text objects: ${textObjects.length}`);
  console.log(`   📄 File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
  
  if (labelsFound === expectedLabels.length) {
    console.log('\n🎉 SUCCESS: All labels are present in the PDF!');
  } else {
    console.log('\n❌ ISSUE: Some labels are missing from the PDF');
  }
}

checkNewPDFLabels().catch(console.error);
