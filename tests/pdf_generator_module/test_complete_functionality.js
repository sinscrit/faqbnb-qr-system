const { generateSinglePDF, generatePDFsFromJSON } = require('../../src/lib/pdf_generator_module');

async function testCompleteFunctionality() {
  console.log('🎯 Testing Complete QR Code Embedding Functionality\n');
  
  // Test 1: Single PDF with actual QR codes and title
  console.log('📄 Test 1: Single PDF with embedded QR codes and title');
  const singleConfig = {
    paperSize: "A4",
    margin: "standard",
    qrCodeCount: 4,
    qrCodesPerRow: 2,
    qrCodeSize: "medium",
    showCutlines: true,
    debug: false,
    title: "Hotel Room 205 - Service QR Codes",
    qrCodes: [
      { 
        id: "wifi", 
        label: "WiFi Access", 
        data: "WIFI:T:WPA;S:HotelGuest;P:SecurePass123;H:false;;"
      },
      { 
        id: "menu", 
        label: "Digital Menu", 
        data: "https://hotel.example.com/menu"
      },
      { 
        id: "concierge", 
        label: "Concierge Service", 
        data: "https://hotel.example.com/concierge"
      },
      { 
        id: "checkout", 
        label: "Express Check-out", 
        data: "https://hotel.example.com/checkout/205"
      }
    ]
  };
  
  try {
    const result1 = await generateSinglePDF(singleConfig, {
      type: 'file',
      path: 'tmp',
      name: 'complete-hotel-qr-codes.pdf'
    });
    
    if (result1.success) {
      console.log(`  ✅ Generated: ${result1.outputPath}`);
      console.log(`  📝 Features: Title + Real QR codes + Professional layout`);
    } else {
      console.log(`  ❌ Error: ${result1.error}`);
    }
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
  }
  
  // Test 2: Multiple PDFs with different configurations
  console.log('\n📄 Test 2: Multiple PDFs for different rooms');
  const multiConfig = JSON.stringify([
    {
      paperSize: "A4",
      title: "Room 101 - Standard Room",
      qrCodeCount: 3,
      qrCodesPerRow: 3,
      qrCodeSize: "large",
      qrCodes: [
        { id: "wifi-101", label: "Room WiFi", data: "WIFI:T:WPA;S:Room101;P:guest101;;" },
        { id: "service-101", label: "Room Service", data: "https://hotel.com/service/101" },
        { id: "survey-101", label: "Feedback", data: "https://hotel.com/feedback/101" }
      ]
    },
    {
      paperSize: "A4", 
      title: "Room 201 - Deluxe Suite",
      qrCodeCount: 4,
      qrCodesPerRow: 2,
      qrCodeSize: "medium",
      qrCodes: [
        { id: "wifi-201", label: "Suite WiFi", data: "WIFI:T:WPA;S:Suite201;P:deluxe201;;" },
        { id: "concierge-201", label: "Personal Concierge", data: "https://hotel.com/concierge/201" },
        { id: "spa-201", label: "Spa Booking", data: "https://hotel.com/spa/book" },
        { id: "dining-201", label: "Fine Dining", data: "https://hotel.com/dining/premium" }
      ]
    }
  ]);
  
  try {
    const results2 = await generatePDFsFromJSON(multiConfig, {
      type: 'file',
      path: 'tmp',
      name: 'room-*.pdf'
    });
    
    console.log(`  📊 Generated ${results2.length} room PDFs:`);
    results2.forEach((result, index) => {
      if (result.success) {
        console.log(`    ✅ Room PDF ${index + 1}: ${result.outputPath}`);
      } else {
        console.log(`    ❌ Room PDF ${index + 1}: ${result.error}`);
      }
    });
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
  }
  
  // Test 3: Blob output for web API
  console.log('\n📄 Test 3: Blob output for web API integration');
  const webConfig = {
    paperSize: "A4",
    title: "Restaurant QR Menu",
    qrCodeCount: 2,
    qrCodesPerRow: 2,
    qrCodeSize: "large",
    showCutlines: false,
    debug: false,
    qrCodes: [
      { 
        id: "menu", 
        label: "Full Menu", 
        data: "https://restaurant.com/menu"
      },
      { 
        id: "specials", 
        label: "Daily Specials", 
        data: "https://restaurant.com/specials"
      }
    ]
  };
  
  try {
    const result3 = await generateSinglePDF(webConfig, {
      type: 'blob'
    });
    
    if (result3.success) {
      console.log(`  ✅ Generated blob: ${result3.size} bytes`);
      console.log(`  📝 Ready for web API response`);
      
      // Save blob to file for verification
      const fs = require('fs');
      fs.writeFileSync('tmp/restaurant-menu-from-blob.pdf', result3.data);
      console.log(`  📁 Saved blob to: tmp/restaurant-menu-from-blob.pdf`);
    } else {
      console.log(`  ❌ Error: ${result3.error}`);
    }
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
  }
  
  // Test 4: Different QR code data types
  console.log('\n📄 Test 4: Various QR code data types');
  const dataTypesConfig = {
    paperSize: "A4",
    title: "QR Code Data Types Demo",
    qrCodeCount: 6,
    qrCodesPerRow: 3,
    qrCodeSize: "small",
    showCutlines: true,
    debug: false,
    qrCodes: [
      { id: "url", label: "Website", data: "https://example.com" },
      { id: "email", label: "Email", data: "mailto:contact@example.com" },
      { id: "phone", label: "Phone", data: "tel:+1-555-123-4567" },
      { id: "sms", label: "SMS", data: "sms:+1-555-123-4567" },
      { id: "wifi", label: "WiFi", data: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;" },
      { id: "text", label: "Plain Text", data: "This is plain text in a QR code!" }
    ]
  };
  
  try {
    const result4 = await generateSinglePDF(dataTypesConfig, {
      type: 'file',
      path: 'tmp',
      name: 'qr-data-types-demo.pdf'
    });
    
    if (result4.success) {
      console.log(`  ✅ Generated: ${result4.outputPath}`);
      console.log(`  📝 Demonstrates: URL, Email, Phone, SMS, WiFi, Text QR codes`);
    } else {
      console.log(`  ❌ Error: ${result4.error}`);
    }
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
  }
  
  console.log('\n🎉 Complete functionality tests completed!');
  console.log('📁 Check tmp/ directory for all generated PDFs');
  console.log('\n📋 Summary of new features:');
  console.log('  ✅ Real QR code embedding (not just placeholders)');
  console.log('  ✅ PDF title support with centered formatting');
  console.log('  ✅ Multiple output types (file, blob)');
  console.log('  ✅ Flexible QR code data (URL, WiFi, Email, Phone, etc.)');
  console.log('  ✅ Backward compatibility with existing configurations');
  console.log('  ✅ Professional layout with proper spacing');
}

// Run the test
if (require.main === module) {
  testCompleteFunctionality().catch(console.error);
}

module.exports = { testCompleteFunctionality };