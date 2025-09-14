const { chromium } = require('playwright');
const fs = require('fs');

async function testValidationPage() {
  console.log('🔍 Testing validation QR page...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test the validation page that was mentioned in docs
    console.log('📱 Loading validation QR page...');
    await page.goto('http://localhost:3000/validation-qr');
    await page.waitForTimeout(5000);
    
    // Check for QR codes
    const qrCount = await page.evaluate(() => {
      return document.querySelectorAll('.qr-code-image, img[alt*="QR"]').length;
    });
    
    console.log(`📊 Found ${qrCount} QR codes on validation page`);
    
    if (qrCount > 0) {
      // Screen version
      console.log('📸 Capturing screen version...');
      await page.emulateMedia({ media: 'screen' });
      await page.screenshot({ 
        path: 'validation-qr-screen.png',
        fullPage: true 
      });
      
      // Print version  
      console.log('🖨️ Capturing print version...');
      await page.emulateMedia({ media: 'print' });
      await page.screenshot({ 
        path: 'validation-qr-print.png',
        fullPage: true 
      });
      
      // Generate PDF
      console.log('📄 Generating PDF...');
      await page.pdf({
        path: 'validation-qr-actual.pdf',
        format: 'A4',
        printBackground: true
      });
      
      // Analyze QR visibility in print mode
      const printAnalysis = await page.evaluate(() => {
        const qrImages = document.querySelectorAll('.qr-code-image, img[alt*="QR"]');
        const analysis = Array.from(qrImages).map((img, i) => {
          const style = window.getComputedStyle(img);
          const rect = img.getBoundingClientRect();
          return {
            index: i + 1,
            alt: img.alt,
            hasSrc: !!img.src,
            srcType: img.src.startsWith('data:') ? 'DATA_URL' : 'EXTERNAL',
            visibility: style.visibility,
            display: style.display,
            width: style.width,
            height: style.height,
            boundingBox: {
              width: rect.width,
              height: rect.height,
              visible: rect.width > 0 && rect.height > 0
            }
          };
        });
        
        return {
          total: qrImages.length,
          visible: analysis.filter(qr => 
            qr.visibility !== 'hidden' && 
            qr.display !== 'none' &&
            qr.boundingBox.visible
          ).length,
          details: analysis
        };
      });
      
      console.log('\n🎯 VALIDATION PAGE PROOF:');
      console.log(`Total QR codes found: ${printAnalysis.total}`);
      console.log(`Visible in print mode: ${printAnalysis.visible}`);
      
      printAnalysis.details.forEach(qr => {
        console.log(`QR ${qr.index}: ${qr.alt || 'No alt text'}`);
        console.log(`  - Source: ${qr.hasSrc ? qr.srcType : 'NO_SRC'}`);
        console.log(`  - Visibility: ${qr.visibility}`);
        console.log(`  - Display: ${qr.display}`);
        console.log(`  - Size: ${qr.width} x ${qr.height}`);
        console.log(`  - Bounding: ${qr.boundingBox.width}x${qr.boundingBox.height} (visible: ${qr.boundingBox.visible})`);
      });
      
      // Save proof report
      const proofReport = {
        timestamp: new Date().toISOString(),
        testType: 'VALIDATION_PAGE_QR_PRINT_PROOF',
        url: 'http://localhost:3000/validation-qr',
        qrAnalysis: printAnalysis,
        proofFiles: [
          'validation-qr-screen.png',
          'validation-qr-print.png', 
          'validation-qr-actual.pdf'
        ]
      };
      
      fs.writeFileSync('validation-proof-report.json', JSON.stringify(proofReport, null, 2));
      
      console.log('\n📁 PROOF FILES:');
      proofReport.proofFiles.forEach(file => {
        const exists = fs.existsSync(file);
        const size = exists ? fs.statSync(file).size : 0;
        console.log(`  ${exists ? '✅' : '❌'} ${file} (${size} bytes)`);
      });
      
      // Final verdict
      const verdict = printAnalysis.visible > 0 ? 'PASS' : 'FAIL';
      console.log(`\n🏆 FINAL VERDICT: ${verdict}`);
      console.log(`QR codes ${printAnalysis.visible > 0 ? 'ARE' : 'ARE NOT'} visible in print mode`);
      
    } else {
      console.log('❌ No QR codes found on validation page');
      
      // Capture for debugging
      await page.screenshot({ path: 'validation-debug.png', fullPage: true });
      
      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        bodyText: document.body.innerText.substring(0, 1000),
        hasQRElements: document.querySelectorAll('[class*="qr"], [id*="qr"]').length > 0,
        totalImages: document.querySelectorAll('img').length,
        errorMessages: Array.from(document.querySelectorAll('.error, .alert, [class*="error"]')).map(el => el.textContent)
      }));
      
      console.log('Page info:', pageInfo);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'validation-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testValidationPage().catch(console.error);



