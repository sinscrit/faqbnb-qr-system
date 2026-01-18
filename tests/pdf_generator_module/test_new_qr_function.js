const { generatePDF } = require('./pdf_generator_with_qr');

async function testNewQRFunction() {
  console.log('🧪 Testing New QR Function with Embedding\n');
  
  const config = {
    paperSize: "A4",
    margin: "standard",
    qrCodeCount: 4,
    qrCodesPerRow: 2,
    qrCodeSize: "medium",
    showCutlines: true,
    debug: false,
    title: "Hotel Room 101 - QR Codes",
    qrCodes: [
      { 
        id: "wifi", 
        label: "WiFi Password", 
        data: "WIFI:T:WPA;S:HotelGuest;P:password123;H:false;;"
      },
      { 
        id: "menu", 
        label: "Room Service Menu", 
        data: "https://hotel.com/room-service"
      },
      { 
        id: "checkout", 
        label: "Check-out Instructions", 
        data: "https://hotel.com/checkout"
      },
      { 
        id: "emergency", 
        label: "Emergency Contact", 
        data: "tel:+1-555-911-0000"
      }
    ]
  };
  
  try {
    const outputPath = await generatePDF(config, 'tmp/test-embedded-qr.pdf');
    console.log(`✅ Generated PDF with embedded QR codes: ${outputPath}`);
    
    // Test without title
    const configNoTitle = { ...config, title: null };
    const outputPath2 = await generatePDF(configNoTitle, 'tmp/test-embedded-qr-no-title.pdf');
    console.log(`✅ Generated PDF without title: ${outputPath2}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

testNewQRFunction();