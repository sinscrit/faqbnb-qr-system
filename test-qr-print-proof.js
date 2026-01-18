const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generatePrintProof() {
  console.log('🔍 Starting QR Print Verification with Playwright...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test 1: Load the validation test page
    console.log('📄 Loading QR print test page...');
    const testPagePath = path.resolve(__dirname, 'qr-print-validation-test.html');
    await page.goto(`file://${testPagePath}`);
    
    // Wait for QR codes to be generated
    await page.waitForTimeout(2000);
    
    // Test 2: Screenshot the screen version
    console.log('📸 Capturing screen version...');
    await page.screenshot({ 
      path: 'qr-print-proof-screen.png',
      fullPage: true 
    });
    console.log('✅ Screen screenshot saved: qr-print-proof-screen.png');
    
    // Test 3: Emulate print media and capture
    console.log('🖨️ Testing print media emulation...');
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ 
      path: 'qr-print-proof-print-emulation.png',
      fullPage: true 
    });
    console.log('✅ Print emulation screenshot saved: qr-print-proof-print-emulation.png');
    
    // Test 4: Generate actual PDF
    console.log('📄 Generating actual PDF...');
    const pdf = await page.pdf({
      path: 'qr-print-proof-actual.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });
    console.log('✅ PDF generated: qr-print-proof-actual.pdf');
    
    // Test 5: Check QR code visibility in DOM
    console.log('🔍 Checking QR code visibility in print mode...');
    const qrVisibility = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      const results = Array.from(qrImages).map((img, index) => {
        const style = window.getComputedStyle(img);
        const rect = img.getBoundingClientRect();
        return {
          index: index + 1,
          src: img.src ? 'DATA_URL_PRESENT' : 'NO_SRC',
          srcLength: img.src ? img.src.length : 0,
          visibility: style.visibility,
          display: style.display,
          width: style.width,
          height: style.height,
          boundingBox: {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left
          },
          alt: img.alt
        };
      });
      return {
        totalQRCodes: qrImages.length,
        qrDetails: results
      };
    });
    
    console.log('📊 QR Code Visibility Analysis:');
    console.log(`Total QR codes found: ${qrVisibility.totalQRCodes}`);
    qrVisibility.qrDetails.forEach(qr => {
      console.log(`QR ${qr.index}: ${qr.alt}`);
      console.log(`  - Visibility: ${qr.visibility}`);
      console.log(`  - Display: ${qr.display}`);
      console.log(`  - Size: ${qr.width} x ${qr.height}`);
      console.log(`  - Bounding Box: ${qr.boundingBox.width}x${qr.boundingBox.height}`);
      console.log(`  - Data URL: ${qr.src} (${qr.srcLength} chars)`);
    });
    
    // Test 6: Test with the actual app (if running)
    console.log('🌐 Testing actual app QR print page...');
    try {
      await page.goto('http://localhost:3000/dashboard/properties/d3d4df29-3a10-47b0-8813-5ef26544982b/qr-print', { 
        timeout: 10000 
      });
      
      // Wait for QR codes to load
      await page.waitForSelector('.qr-code-image', { timeout: 15000 });
      
      // Screenshot the actual app
      await page.emulateMedia({ media: 'screen' });
      await page.screenshot({ 
        path: 'qr-print-proof-app-screen.png',
        fullPage: true 
      });
      
      // Print mode screenshot
      await page.emulateMedia({ media: 'print' });
      await page.screenshot({ 
        path: 'qr-print-proof-app-print.png',
        fullPage: true 
      });
      
      // Generate PDF from actual app
      const appPdf = await page.pdf({
        path: 'qr-print-proof-app-actual.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
      });
      
      console.log('✅ App screenshots and PDF generated');
      
      // Check QR visibility in actual app
      const appQrVisibility = await page.evaluate(() => {
        const qrImages = document.querySelectorAll('.qr-code-image');
        return {
          total: qrImages.length,
          visible: Array.from(qrImages).filter(img => {
            const style = window.getComputedStyle(img);
            return style.visibility !== 'hidden' && style.display !== 'none';
          }).length
        };
      });
      
      console.log(`📊 App QR Analysis: ${appQrVisibility.visible}/${appQrVisibility.total} QR codes visible in print mode`);
      
    } catch (appError) {
      console.log('⚠️ Could not test actual app (not running?):', appError.message);
    }
    
    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      testResults: {
        testPageScreenshot: 'qr-print-proof-screen.png',
        printEmulationScreenshot: 'qr-print-proof-print-emulation.png',
        testPagePDF: 'qr-print-proof-actual.pdf',
        qrCodeAnalysis: qrVisibility
      },
      filesGenerated: [
        'qr-print-proof-screen.png',
        'qr-print-proof-print-emulation.png', 
        'qr-print-proof-actual.pdf'
      ]
    };
    
    fs.writeFileSync('qr-print-proof-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n🎯 PROOF GENERATED:');
    console.log('📁 Files created for verification:');
    report.filesGenerated.forEach(file => {
      const exists = fs.existsSync(file);
      const size = exists ? fs.statSync(file).size : 0;
      console.log(`  ${exists ? '✅' : '❌'} ${file} (${size} bytes)`);
    });
    
    console.log('\n📋 To verify QR codes actually print:');
    console.log('1. Open qr-print-proof-actual.pdf - QR codes should be visible');
    console.log('2. Compare qr-print-proof-screen.png vs qr-print-proof-print-emulation.png');
    console.log('3. Check qr-print-proof-report.json for detailed analysis');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  generatePrintProof().catch(console.error);
}

module.exports = { generatePrintProof };



