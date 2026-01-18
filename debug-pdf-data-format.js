const fs = require('fs');
const path = require('path');

async function debugPDFDataFormat() {
  console.log('🔍 Debugging PDF data format issue...');
  
  try {
    // Import the PDF generator module directly
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    console.log('📋 Testing different data formats...');
    
    // Test 1: Working format (like the standalone test)
    console.log('\n🧪 Test 1: Working format (base64 string)');
    const workingQRCodes = [
      {
        id: 'test-1',
        label: 'Working Format Test',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      }
    ];
    
    const workingConfig = {
      paperSize: 'A4',
      margin: 'standard',
      qrCodeCount: 1,
      qrCodesPerRow: 1,
      qrCodeSize: 'medium',
      showCutlines: true,
      showLabels: true,
      debug: false,
      qrCodes: workingQRCodes
    };
    
    try {
      const workingPDF = await pdfModule.generatePDFBuffer(workingConfig);
      console.log('✅ Working format: SUCCESS -', workingPDF.length, 'bytes');
      
      // Save for comparison
      fs.writeFileSync(path.join(__dirname, 'tmp', 'debug-working-format.pdf'), workingPDF);
    } catch (error) {
      console.log('❌ Working format: FAILED -', error.message);
    }
    
    // Test 2: Application format (what might be sent by the app)
    console.log('\n🧪 Test 2: Application format (potential issue)');
    
    // Simulate what the application might be sending
    const qrcode = require('qrcode');
    const qrBuffer = await qrcode.toBuffer('Test QR Content', { type: 'png' });
    
    const appQRCodes = [
      {
        id: 'test-2',
        label: 'App Format Test',
        imageData: qrBuffer // This might be the problem - Buffer instead of string
      }
    ];
    
    const appConfig = {
      paperSize: 'A4',
      margin: 'standard',
      qrCodeCount: 1,
      qrCodesPerRow: 1,
      qrCodeSize: 'medium',
      showCutlines: true,
      showLabels: true,
      debug: false,
      qrCodes: appQRCodes
    };
    
    try {
      const appPDF = await pdfModule.generatePDFBuffer(appConfig);
      console.log('✅ App format: SUCCESS -', appPDF.length, 'bytes');
      
      // Save for comparison
      fs.writeFileSync(path.join(__dirname, 'tmp', 'debug-app-format.pdf'), appPDF);
    } catch (error) {
      console.log('❌ App format: FAILED -', error.message);
      console.log('🔍 This confirms the data format issue!');
    }
    
    // Test 3: Fixed application format (convert Buffer to base64 string)
    console.log('\n🧪 Test 3: Fixed application format (Buffer converted to base64)');
    
    const fixedQRCodes = [
      {
        id: 'test-3',
        label: 'Fixed Format Test',
        imageData: `data:image/png;base64,${qrBuffer.toString('base64')}`
      }
    ];
    
    const fixedConfig = {
      paperSize: 'A4',
      margin: 'standard',
      qrCodeCount: 1,
      qrCodesPerRow: 1,
      qrCodeSize: 'medium',
      showCutlines: true,
      showLabels: true,
      debug: false,
      qrCodes: fixedQRCodes
    };
    
    try {
      const fixedPDF = await pdfModule.generatePDFBuffer(fixedConfig);
      console.log('✅ Fixed format: SUCCESS -', fixedPDF.length, 'bytes');
      
      // Save for comparison
      fs.writeFileSync(path.join(__dirname, 'tmp', 'debug-fixed-format.pdf'), fixedPDF);
      
      // Analyze this PDF to see if labels are working
      const pdfContent = fixedPDF.toString('latin1');
      const hasLabel = pdfContent.includes('Fixed Format Test');
      console.log('🔍 Contains label text:', hasLabel ? '✅' : '❌');
      
    } catch (error) {
      console.log('❌ Fixed format: FAILED -', error.message);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('If Test 1 and Test 3 work but Test 2 fails, then the issue is:');
    console.log('The application is sending Buffer objects instead of base64 strings');
    console.log('The fix is to convert Buffers to base64 strings before sending to PDF module');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

debugPDFDataFormat().catch(console.error);

