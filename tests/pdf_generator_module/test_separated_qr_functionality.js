const { generateSinglePDF, generateQRCodeBuffer } = require('../../src/lib/pdf_generator_module');

async function testSeparatedQRFunctionality() {
  console.log('🔗 Testing Separated QR Code Functionality\n');
  console.log('📋 QR codes are generated OUTSIDE the PDF function and passed as imageData\n');
  
  // Test 1: Generate QR codes first, then pass to PDF function
  console.log('📄 Test 1: Pre-generated QR codes passed to PDF function');
  
  try {
    // Step 1: Generate QR codes outside the PDF function
    console.log('  🔄 Step 1: Generating QR codes separately...');
    const wifiQR = await generateQRCodeBuffer("WIFI:T:WPA;S:HotelGuest;P:SecurePass123;;", 200);
    const menuQR = await generateQRCodeBuffer("https://hotel.com/menu", 200);
    const conciergeQR = await generateQRCodeBuffer("https://hotel.com/concierge", 200);
    const checkoutQR = await generateQRCodeBuffer("https://hotel.com/checkout", 200);
    
    if (wifiQR) {
      console.log(`    ✅ WiFi QR: ${wifiQR.length} bytes`);
    } else {
      console.log(`    ⚠️  WiFi QR: Using placeholder (qrcode library not available)`);
    }
    
    if (menuQR) {
      console.log(`    ✅ Menu QR: ${menuQR.length} bytes`);
    } else {
      console.log(`    ⚠️  Menu QR: Using placeholder (qrcode library not available)`);
    }
    
    console.log(`    ✅ Generated ${[wifiQR, menuQR, conciergeQR, checkoutQR].filter(Boolean).length} QR codes`);
    
    // Step 2: Pass pre-generated QR codes to PDF function
    console.log('  🔄 Step 2: Creating PDF with pre-generated QR codes...');
    const pdfConfig = {
      paperSize: "A4",
      margin: "standard", 
      title: "Hotel Room 205 - QR Codes (Separated)",
      qrCodeCount: 4,
      qrCodesPerRow: 2,
      qrCodeSize: "medium",
      showCutlines: true,
      debug: false,
      qrCodes: [
        { 
          id: "wifi", 
          label: "WiFi Access", 
          imageData: wifiQR  // Pre-generated QR code Buffer
        },
        { 
          id: "menu", 
          label: "Digital Menu", 
          imageData: menuQR  // Pre-generated QR code Buffer
        },
        { 
          id: "concierge", 
          label: "Concierge Service", 
          imageData: conciergeQR  // Pre-generated QR code Buffer
        },
        { 
          id: "checkout", 
          label: "Express Check-out", 
          imageData: checkoutQR  // Pre-generated QR code Buffer
        }
      ]
    };
    
    const result1 = await generateSinglePDF(pdfConfig, {
      type: 'file',
      path: 'tmp',
      name: 'separated-qr-codes.pdf'
    });
    
    if (result1.success) {
      console.log(`  ✅ Generated PDF: ${result1.outputPath}`);
      console.log(`  📝 Features: Pre-generated QR codes + Title + Professional layout`);
    } else {
      console.log(`  ❌ Error: ${result1.error}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
  }
  
  // Test 2: Mix of pre-generated QR codes and placeholders
  console.log('\n📄 Test 2: Mixed QR codes (some pre-generated, some placeholders)');
  
  try {
    // Generate only some QR codes
    const wifiQR2 = await generateQRCodeBuffer("WIFI:T:WPA;S:OfficeGuest;P:Welcome2024;;", 200);
    const contactQR = await generateQRCodeBuffer("tel:+1-555-123-4567", 200);
    
    const mixedConfig = {
      paperSize: "A4",
      title: "Office Equipment - Mixed QR Types",
      qrCodeCount: 4,
      qrCodesPerRow: 2,
      qrCodeSize: "medium", 
      qrCodes: [
        { 
          id: "wifi", 
          label: "Office WiFi", 
          imageData: wifiQR2  // Pre-generated QR code
        },
        { 
          id: "placeholder1", 
          label: "Manual Entry", 
          imageData: null  // Will show placeholder
        },
        { 
          id: "contact", 
          label: "Emergency Contact", 
          imageData: contactQR  // Pre-generated QR code
        },
        { 
          id: "placeholder2", 
          label: "Future Use", 
          imageData: null  // Will show placeholder
        }
      ]
    };
    
    const result2 = await generateSinglePDF(mixedConfig, {
      type: 'file',
      path: 'tmp',
      name: 'mixed-qr-codes.pdf'
    });
    
    if (result2.success) {
      console.log(`  ✅ Generated mixed PDF: ${result2.outputPath}`);
      console.log(`  📝 Features: Real QR codes + Placeholders + Title`);
    } else {
      console.log(`  ❌ Error: ${result2.error}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
  }
  
  // Test 3: All placeholders (no pre-generated QR codes)
  console.log('\n📄 Test 3: All placeholders (backward compatibility)');
  
  try {
    const placeholderConfig = {
      paperSize: "A4",
      title: "Placeholder QR Codes",
      qrCodeCount: 4,
      qrCodesPerRow: 2,
      qrCodes: [
        { id: "qr-1", label: "Placeholder 1", imageData: null },
        { id: "qr-2", label: "Placeholder 2", imageData: null },
        { id: "qr-3", label: "Placeholder 3", imageData: null },
        { id: "qr-4", label: "Placeholder 4", imageData: null }
      ]
    };
    
    const result3 = await generateSinglePDF(placeholderConfig, {
      type: 'file',
      path: 'tmp',
      name: 'placeholder-qr-codes.pdf'
    });
    
    if (result3.success) {
      console.log(`  ✅ Generated placeholder PDF: ${result3.outputPath}`);
      console.log(`  📝 Features: All placeholders + Title (backward compatible)`);
    } else {
      console.log(`  ❌ Error: ${result3.error}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Exception: ${error.message}`);
  }
  
  console.log('\n🎉 Separated QR functionality tests completed!');
  console.log('📁 Check tmp/ directory for generated PDFs\n');
  
  console.log('📋 Architecture Summary:');
  console.log('  ✅ QR codes are generated OUTSIDE the PDF function');
  console.log('  ✅ PDF function accepts pre-generated QR imageData (Buffer)');
  console.log('  ✅ Graceful fallback to placeholders when imageData is null');
  console.log('  ✅ Separation of concerns: QR generation vs PDF layout');
  console.log('  ✅ Flexibility: calling function controls QR generation');
  console.log('  ✅ Backward compatibility maintained');
  
  console.log('\n💡 Usage Pattern:');
  console.log('  1. Calling function generates QR codes using generateQRCodeBuffer()');
  console.log('  2. Calling function passes QR code Buffers in qrCodes[].imageData');
  console.log('  3. PDF function uses pre-generated QR codes or shows placeholders');
}

// Run the test
if (require.main === module) {
  testSeparatedQRFunctionality().catch(console.error);
}

module.exports = { testSeparatedQRFunctionality };