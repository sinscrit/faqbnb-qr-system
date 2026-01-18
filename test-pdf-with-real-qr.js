const { chromium } = require('playwright');
const fs = require('fs');

async function testPDFWithRealQR() {
  console.log('🔥 Testing PDF module with REAL QR codes from app...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Get real QR codes from the demo page
    console.log('📱 Getting real QR codes from demo page...');
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    const realQRData = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      const labels = document.querySelectorAll('.qr-item-label');
      
      return Array.from(qrImages).slice(0, 3).map((img, i) => ({
        id: `real-qr-${i + 1}`,
        label: labels[i]?.textContent?.trim() || `Real QR Code ${i + 1}`,
        imageData: img.src // This should be a proper data URL
      }));
    });
    
    console.log(`✅ Extracted ${realQRData.length} real QR codes`);
    console.log('📊 QR Data sample:', {
      firstQRLength: realQRData[0]?.imageData?.length,
      firstQRStart: realQRData[0]?.imageData?.substring(0, 80) + '...',
      firstLabel: realQRData[0]?.label
    });
    
    // Now test PDF generation with real QR codes
    console.log('\n🔧 Testing PDF module with real QR codes...');
    
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    const config = {
      title: "FAQBNB Real QR Codes Test",
      paperSize: "A4",
      margin: "standard",
      qrCodeCount: realQRData.length,
      qrCodesPerRow: 3,
      qrCodeSize: "medium",
      showCutlines: true,
      showLabels: true,
      layoutMode: "fixed_boxes",
      qrCodes: realQRData
    };
    
    console.log('⚙️ Generating PDF with real QR codes...');
    
    const pdfBuffer = await pdfModule.generatePDFBuffer(config);
    
    if (Buffer.isBuffer(pdfBuffer)) {
      const filename = `real-qr-pdf-${Date.now()}.pdf`;
      fs.writeFileSync(filename, pdfBuffer);
      const fileSize = fs.statSync(filename).size;
      
      console.log(`✅ REAL QR PDF generated successfully!`);
      console.log(`📁 File: ${filename}`);
      console.log(`📊 Size: ${fileSize} bytes`);
      
      if (fileSize > 10000) {
        console.log('🎉 PDF has substantial content - QR codes should be visible!');
      } else {
        console.log('⚠️ PDF is still small - checking QR embedding...');
      }
      
      // Also save one QR as standalone image for verification
      if (realQRData[0]?.imageData) {
        try {
          const base64Data = realQRData[0].imageData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync('extracted-real-qr.png', buffer);
          console.log('✅ Extracted QR image: extracted-real-qr.png');
        } catch (extractError) {
          console.log('⚠️ Could not extract QR image:', extractError.message);
        }
      }
      
      console.log('\n🎯 CRITICAL TEST:');
      console.log(`📄 Please check: ${filename}`);
      console.log('🔍 Are QR codes visible in this PDF?');
      
      return { success: true, filename, fileSize };
      
    } else {
      console.log('❌ PDF Buffer generation failed');
      return { success: false };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testPDFWithRealQR().then((result) => {
  console.log('\n📊 FINAL RESULT:', result);
  if (result.success) {
    console.log('\n🎉 SUCCESS! Real QR codes have been processed by the PDF module.');
    console.log('📄 Check the generated PDF file to verify QR codes are visible.');
    console.log('💡 If QR codes are visible, the PDF export system works correctly!');
  }
}).catch(console.error);



