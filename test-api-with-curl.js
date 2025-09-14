const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testAPIWithCurl() {
  console.log('🔍 Testing PDF API with curl...');
  
  const testData = {
    qrCodes: [
      {
        id: 'test-item-1',
        name: 'Test Label 1',
        qrDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      }
    ],
    settings: {
      pageFormat: 'A4',
      margins: 10,
      qrSize: 40,
      itemsPerRow: 3,
      includeCutlines: true,
      includeLabels: true
    }
  };
  
  // Write test data to a temporary file
  const dataFile = path.join(__dirname, 'tmp', 'test-api-data.json');
  fs.writeFileSync(dataFile, JSON.stringify(testData, null, 2));
  
  console.log('📤 Test data written to:', dataFile);
  console.log('📤 Calling API with curl...');
  
  return new Promise((resolve, reject) => {
    const outputFile = path.join(__dirname, 'tmp', 'api-curl-test.pdf');
    
    const curl = spawn('curl', [
      '-X', 'POST',
      '-H', 'Content-Type: application/json',
      '-d', `@${dataFile}`,
      '-o', outputFile,
      '-w', '%{http_code}',
      'http://localhost:3000/api/admin/generate-pdf'
    ]);
    
    let output = '';
    let error = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    curl.on('close', (code) => {
      console.log('📥 Curl exit code:', code);
      console.log('📥 HTTP status:', output.trim());
      
      if (error) {
        console.log('📥 Curl error:', error);
      }
      
      // Check if PDF was created
      if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile);
        console.log('✅ PDF created:', outputFile);
        console.log('📊 PDF size:', stats.size, 'bytes');
        
        if (stats.size > 100) {
          resolve({ success: true, pdfPath: outputFile, size: stats.size, httpStatus: output.trim() });
        } else {
          // File is too small, probably an error message
          const content = fs.readFileSync(outputFile, 'utf8');
          console.log('❌ PDF too small, content:', content);
          resolve({ success: false, error: 'PDF too small', content, httpStatus: output.trim() });
        }
      } else {
        resolve({ success: false, error: 'No PDF file created', httpStatus: output.trim() });
      }
    });
  });
}

testAPIWithCurl().then(result => {
  console.log('\n📋 API Test Result:', result);
  
  if (result.success) {
    console.log('\n🔍 Now analyzing the generated PDF...');
    
    // Analyze the PDF content
    const pdfPath = result.pdfPath;
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfContent = pdfBuffer.toString('latin1');
    
    console.log('📄 PDF analysis:');
    console.log('   File size:', pdfBuffer.length, 'bytes');
    console.log('   Starts with PDF header:', pdfContent.startsWith('%PDF-') ? '✅' : '❌');
    console.log('   Contains "Test Label 1":', pdfContent.includes('Test Label 1') ? '✅' : '❌');
    
    // Look for text blocks
    const textBlocks = pdfContent.match(/BT[\s\S]*?ET/g) || [];
    console.log('   Text blocks found:', textBlocks.length);
    
    if (textBlocks.length > 0) {
      console.log('   📝 First text block preview:');
      console.log('   ', textBlocks[0].substring(0, 200));
    }
  }
}).catch(console.error);

