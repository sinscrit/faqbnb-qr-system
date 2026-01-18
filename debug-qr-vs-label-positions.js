const fs = require('fs');
const path = require('path');

async function debugQRvsLabelPositions() {
  console.log('🔍 Debugging QR code vs Label positioning...');
  
  const pdfPath = path.join(__dirname, 'tmp', 'QR-Codes-2025-09-13T22-34-25.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ PDF file not found');
    return;
  }
  
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfContent = pdfBuffer.toString('latin1');
  
  // Extract image objects (QR codes) and their positions
  console.log('🔍 QR Code Image Analysis:');
  
  // Look for image transformation matrices
  const imageMatches = pdfContent.match(/q\s+([\d.-]+)\s+0\s+0\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm[\s\S]*?\/Im\d+\s+Do[\s\S]*?Q/g) || [];
  
  console.log(`📷 Found ${imageMatches.length} image objects`);
  
  const qrPositions = [];
  imageMatches.forEach((match, index) => {
    const matrixMatch = match.match(/q\s+([\d.-]+)\s+0\s+0\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+cm/);
    if (matrixMatch) {
      const width = parseFloat(matrixMatch[1]);
      const height = parseFloat(matrixMatch[2]);
      const x = parseFloat(matrixMatch[3]);
      const y = parseFloat(matrixMatch[4]);
      
      qrPositions.push({ index, x, y, width, height });
      console.log(`   QR ${index + 1}: Position (${x}, ${y}), Size ${width}x${height}`);
    }
  });
  
  // Extract text positions
  console.log('\n📝 Label Text Analysis:');
  const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
  
  const labelPositions = [];
  textBlocks.forEach((block, index) => {
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
  
  // Compare positions
  console.log('\n🔍 Position Comparison:');
  
  if (qrPositions.length > 0 && labelPositions.length > 0) {
    // Group by rows based on Y coordinates
    const qrRows = {};
    const labelRows = {};
    
    qrPositions.forEach(qr => {
      const rowKey = Math.round(qr.y / 100) * 100; // Group by ~100pt intervals
      if (!qrRows[rowKey]) qrRows[rowKey] = [];
      qrRows[rowKey].push(qr);
    });
    
    labelPositions.forEach(label => {
      const rowKey = Math.round(label.y / 100) * 100;
      if (!labelRows[rowKey]) labelRows[rowKey] = [];
      labelRows[rowKey].push(label);
    });
    
    console.log('QR Rows:', Object.keys(qrRows).map(k => `Y~${k}`));
    console.log('Label Rows:', Object.keys(labelRows).map(k => `Y~${k}`));
    
    // Check if labels are positioned below QR codes
    const qrYs = qrPositions.map(qr => qr.y).sort((a, b) => b - a); // Descending
    const labelYs = labelPositions.map(label => label.y).sort((a, b) => b - a); // Descending
    
    console.log('\nY Coordinate Analysis:');
    console.log('QR Y positions (top to bottom):', qrYs);
    console.log('Label Y positions (top to bottom):', labelYs);
    
    // Check if labels are being clipped by page boundaries
    const pageHeight = 841.89; // A4 height in points
    const margin = 28.35; // 10mm in points
    const printableBottom = margin;
    const printableTop = pageHeight - margin;
    
    console.log(`\nPage boundaries: ${printableBottom} to ${printableTop}`);
    
    const clippedLabels = labelPositions.filter(label => 
      label.y < printableBottom || label.y > printableTop
    );
    
    if (clippedLabels.length > 0) {
      console.log('⚠️ Labels outside printable area:');
      clippedLabels.forEach(label => {
        console.log(`   "${label.text}" at Y=${label.y} (${label.y < printableBottom ? 'below' : 'above'} printable area)`);
      });
    } else {
      console.log('✅ All labels within printable area');
    }
    
    // Check if labels are positioned too close to QR codes (overlapping)
    console.log('\n🔍 Overlap Analysis:');
    qrPositions.forEach((qr, qrIndex) => {
      const qrBottom = qr.y; // In PDF coordinates, Y=0 is at bottom
      const expectedLabelY = qrBottom - 10; // Labels should be 10 points below QR bottom
      
      const nearbyLabels = labelPositions.filter(label => 
        Math.abs(label.y - expectedLabelY) < 50 && // Within 50 points vertically
        Math.abs(label.x - (qr.x + qr.width/2)) < qr.width // Within QR width horizontally
      );
      
      console.log(`QR ${qrIndex + 1} (Y=${qr.y}): Expected label at Y=${expectedLabelY}, Found ${nearbyLabels.length} nearby labels`);
      nearbyLabels.forEach(label => {
        console.log(`   - "${label.text}" at Y=${label.y} (diff: ${Math.abs(label.y - expectedLabelY)})`);
      });
    });
  }
}

debugQRvsLabelPositions().catch(console.error);

