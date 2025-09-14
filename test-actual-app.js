const { chromium } = require('playwright');
const fs = require('fs');

async function testActualApp() {
  console.log('🔍 Testing actual FAQBNB app QR printing...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the main app
    console.log('📱 Loading dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    // Try to navigate directly to QR print page
    console.log('🎯 Navigating to QR print page...');
    const qrPrintUrl = 'http://localhost:3000/dashboard/properties/d3d4df29-3a10-47b0-8813-5ef26544982b/qr-print';
    await page.goto(qrPrintUrl);
    
    // Wait longer for QR codes to generate
    console.log('⏳ Waiting for QR codes to generate...');
    await page.waitForTimeout(10000);
    
    // Check if QR codes are present
    const qrCount = await page.evaluate(() => {
      return document.querySelectorAll('.qr-code-image').length;
    });
    
    console.log(`📊 Found ${qrCount} QR codes`);
    
    if (qrCount > 0) {
      // Screen version
      console.log('📸 Capturing screen version...');
      await page.emulateMedia({ media: 'screen' });
      await page.screenshot({ 
        path: 'app-qr-screen.png',
        fullPage: true 
      });
      
      // Print version
      console.log('🖨️ Capturing print version...');
      await page.emulateMedia({ media: 'print' });
      await page.screenshot({ 
        path: 'app-qr-print.png',
        fullPage: true 
      });
      
      // Generate PDF
      console.log('📄 Generating PDF...');
      const pdf = await page.pdf({
        path: 'app-qr-actual.pdf',
        format: 'A4',
        printBackground: true
      });
      
      // Check QR visibility in print mode
      const printVisibility = await page.evaluate(() => {
        const qrImages = document.querySelectorAll('.qr-code-image');
        const visible = Array.from(qrImages).filter(img => {
          const style = window.getComputedStyle(img);
          return style.visibility !== 'hidden' && style.display !== 'none';
        });
        return {
          total: qrImages.length,
          visible: visible.length,
          details: Array.from(qrImages).map(img => ({
            src: img.src ? 'HAS_SRC' : 'NO_SRC',
            visibility: window.getComputedStyle(img).visibility,
            display: window.getComputedStyle(img).display
          }))
        };
      });
      
      console.log('🎯 PROOF RESULTS:');
      console.log(`Total QR codes: ${printVisibility.total}`);
      console.log(`Visible in print mode: ${printVisibility.visible}`);
      console.log('QR Details:', printVisibility.details);
      
      // Save report
      const report = {
        timestamp: new Date().toISOString(),
        url: qrPrintUrl,
        qrAnalysis: printVisibility,
        filesGenerated: ['app-qr-screen.png', 'app-qr-print.png', 'app-qr-actual.pdf']
      };
      
      fs.writeFileSync('app-test-report.json', JSON.stringify(report, null, 2));
      
      console.log('\n📁 PROOF FILES GENERATED:');
      report.filesGenerated.forEach(file => {
        const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
        console.log(`  ✅ ${file} (${size} bytes)`);
      });
      
    } else {
      console.log('❌ No QR codes found on the page');
      
      // Capture page anyway to see what's there
      await page.screenshot({ path: 'app-no-qr-debug.png', fullPage: true });
      
      // Check page content
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body.innerText.substring(0, 500),
          qrElements: document.querySelectorAll('[class*="qr"]').length,
          allImages: document.querySelectorAll('img').length
        };
      });
      
      console.log('🔍 Page analysis:', pageContent);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testActualApp().catch(console.error);



