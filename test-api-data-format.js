const fetch = require('node-fetch');

async function testAPIDataFormat() {
  console.log('🔍 Testing PDF API data format...');
  
  try {
    // Create test data in the same format the application would send
    const testQRCodes = [
      {
        id: 'test-item-1',
        name: 'Test Label 1',
        qrDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      }
    ];
    
    const testSettings = {
      pageFormat: 'A4',
      margins: 10,
      qrSize: 40,
      itemsPerRow: 3,
      includeCutlines: true,
      includeLabels: true
    };
    
    console.log('📤 Sending test data to PDF API...');
    console.log('QR Codes:', JSON.stringify(testQRCodes, null, 2));
    console.log('Settings:', JSON.stringify(testSettings, null, 2));
    
    const response = await fetch('http://localhost:3000/api/admin/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This might be needed
      },
      body: JSON.stringify({
        qrCodes: testQRCodes,
        settings: testSettings
      })
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        console.log('✅ PDF response received');
        
        // Save the PDF for analysis
        const pdfBuffer = await response.buffer();
        const fs = require('fs');
        const path = require('path');
        const outputPath = path.join(__dirname, 'tmp', 'api-test-direct.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log('💾 PDF saved to:', outputPath);
        console.log('📊 PDF size:', pdfBuffer.length, 'bytes');
        
        return { success: true, pdfPath: outputPath, size: pdfBuffer.length };
      } else {
        const text = await response.text();
        console.log('📄 Response text:', text);
        return { success: false, error: 'Not a PDF response', response: text };
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testAPIDataFormat().then(result => {
  console.log('\n📋 Test Result:', result);
}).catch(console.error);

