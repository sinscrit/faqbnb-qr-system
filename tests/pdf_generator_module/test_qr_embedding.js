// Test script to verify QR code embedding functionality
const { generateSinglePDF } = require('./pdf_generator_module');

async function testQRCodeEmbedding() {
  console.log('📱 Testing QR Code Embedding\n');
  
  // Test configuration with actual QR code data
  const testConfig = {
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
  
  console.log('📋 Testing with configuration:');
  console.log(`   Title: ${testConfig.title}`);
  console.log(`   QR Codes: ${testConfig.qrCodes.length}`);
  testConfig.qrCodes.forEach((qr, index) => {
    console.log(`     ${index + 1}. ${qr.label} (${qr.data.substring(0, 50)}${qr.data.length > 50 ? '...' : ''})`);
  });
  
  try {
    // Test 1: File output with embedded QR codes
    console.log('\n📄 Test 1: File output with embedded QR codes and title');
    const result1 = await generateSinglePDF(testConfig, {
      type: 'file',
      path: 'tmp',
      name: 'embedded-qr-codes.pdf'
    });
    
    if (result1.success) {
      console.log(`  ✅ Generated: ${result1.outputPath}`);
      console.log(`  📝 Type: ${result1.type}`);
    } else {
      console.log(`  ❌ Error: ${result1.error}`);
    }
    
    // Test 2: Blob output
    console.log('\n📄 Test 2: Blob output with embedded QR codes');
    const result2 = await generateSinglePDF(testConfig, {
      type: 'blob'
    });
    
    if (result2.success) {
      console.log(`  ✅ Generated blob: ${result2.size} bytes`);
      console.log(`  📝 Type: ${result2.type}`);
    } else {
      console.log(`  ❌ Error: ${result2.error}`);
    }
    
    // Test 3: Without title
    console.log('\n📄 Test 3: QR codes without title');
    const result3 = await generateSinglePDF({
      ...testConfig,
      title: null
    }, {
      type: 'file',
      path: 'tmp',
      name: 'qr-codes-no-title.pdf'
    });
    
    if (result3.success) {
      console.log(`  ✅ Generated: ${result3.outputPath}`);
      console.log(`  📝 Type: ${result3.type}`);
    } else {
      console.log(`  ❌ Error: ${result3.error}`);
    }
    
  } catch (error) {
    console.error(`❌ Exception: ${error.message}`);
  }
  
  console.log('\n🎉 QR Code embedding tests completed!');
  console.log('📁 Check tmp/ directory for generated PDFs');
  console.log('\n💡 Note: If QRCode library is not installed, placeholders will be used.');
  console.log('   Install with: npm install qrcode');
}

// Run the test
if (require.main === module) {
  testQRCodeEmbedding().catch(console.error);
}

module.exports = { testQRCodeEmbedding };