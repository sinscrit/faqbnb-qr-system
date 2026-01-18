const fs = require('fs');

console.log('🔍 CHECKING APPLICATION-GENERATED PDF CONTENT');
console.log('==============================================');

try {
  // Read the PDF file
  const pdfPath = './app-generated-qr-test.pdf';
  const pdfBuffer = fs.readFileSync(pdfPath);
  
  console.log('📄 PDF File Analysis:');
  console.log(`   Size: ${pdfBuffer.length} bytes`);
  console.log(`   First 100 bytes: ${pdfBuffer.slice(0, 100).toString()}`);
  
  // Convert to string to check for content
  const pdfString = pdfBuffer.toString();
  
  // Check for PDF structure
  console.log('\n🔍 PDF Structure Check:');
  console.log(`   Has PDF header: ${pdfString.includes('%PDF')}`);
  console.log(`   Has EOF marker: ${pdfString.includes('%%EOF')}`);
  
  // Check for image content (QR codes would be embedded as images)
  console.log('\n🖼️ Image Content Check:');
  console.log(`   Contains /Image: ${pdfString.includes('/Image')}`);
  console.log(`   Contains /XObject: ${pdfString.includes('/XObject')}`);
  console.log(`   Contains PNG data: ${pdfString.includes('PNG')}`);
  console.log(`   Contains JPEG data: ${pdfString.includes('JFIF')}`);
  
  // Check for text content (labels)
  console.log('\n📝 Text Content Check:');
  console.log(`   Contains text objects: ${pdfString.includes('/Text')}`);
  console.log(`   Contains fonts: ${pdfString.includes('/Font')}`);
  
  // Look for specific item names that should be in the PDF
  const itemNames = ['Full Guide', 'Dishwasher', 'Samsung', 'Nest'];
  console.log('\n🏷️ Item Label Check:');
  itemNames.forEach(name => {
    console.log(`   Contains "${name}": ${pdfString.includes(name)}`);
  });
  
  console.log('\n📊 Summary:');
  if (pdfBuffer.length < 1000) {
    console.log('❌ PDF is very small - likely empty or minimal content');
  } else {
    console.log('✅ PDF has substantial content');
  }
  
} catch (error) {
  console.error('❌ Error reading PDF:', error.message);
}

