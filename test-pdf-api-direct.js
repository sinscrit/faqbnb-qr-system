const QRCode = require('qrcode');

async function testPDFAPIDirect() {
  console.log('🔍 TESTING PDF API DIRECTLY');
  console.log('===============================');
  
  try {
    // Step 1: Generate sample QR codes like the application does
    console.log('📍 Step 1: Generating sample QR codes...');
    
    const sampleItems = [
      { id: 'test-item-1', name: 'Test Item 1', url: 'https://faqbnb.com/item/test-item-1' },
      { id: 'test-item-2', name: 'Test Item 2', url: 'https://faqbnb.com/item/test-item-2' }
    ];
    
    const qrCodesArray = [];
    
    for (const item of sampleItems) {
      console.log(`🔍 Generating QR for: ${item.name}`);
      const qrDataUrl = await QRCode.toDataURL(item.url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log(`🔍 QR generated for ${item.name}:`, {
        id: item.id,
        name: item.name,
        qrDataUrlLength: qrDataUrl.length,
        qrDataUrlPrefix: qrDataUrl.substring(0, 50)
      });
      
      qrCodesArray.push({
        id: item.id,
        name: item.name,
        qrDataUrl: qrDataUrl
      });
    }
    
    // Step 2: Prepare the request payload exactly like the application
    console.log('📍 Step 2: Preparing request payload...');
    
    const requestPayload = {
      qrCodes: qrCodesArray,
      settings: {
        pageFormat: 'A4',
        margins: 10,
        qrSize: 40,
        itemsPerRow: 3,
        includeCutlines: true,
        includeLabels: true
      }
    };
    
    console.log('🔍 REQUEST_PAYLOAD:', JSON.stringify(requestPayload, null, 2));
    
    // Step 3: Make the API call
    console.log('📍 Step 3: Making API call...');
    
    const response = await fetch('http://localhost:3000/api/admin/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail without proper authentication, but we can see the error
      },
      body: JSON.stringify(requestPayload)
    });
    
    console.log('🔍 API_RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const blob = await response.blob();
      console.log('✅ PDF generated successfully:', {
        size: blob.size,
        type: blob.type
      });
      
      // Save the PDF for inspection
      const buffer = Buffer.from(await blob.arrayBuffer());
      require('fs').writeFileSync('test-api-direct.pdf', buffer);
      console.log('📄 PDF saved as: test-api-direct.pdf');
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Error Response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('🔍 PARSED_ERROR:', errorJson);
      } catch (e) {
        console.log('🔍 RAW_ERROR_TEXT:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPDFAPIDirect().catch(console.error);

