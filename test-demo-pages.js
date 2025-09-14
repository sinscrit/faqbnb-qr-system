const { chromium } = require('playwright');
const fs = require('fs');

async function testDemoPages() {
  console.log('🔍 Testing QR demo pages for actual proof...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const testResults = [];
  
  try {
    // Test qr-demo page
    console.log('\n📱 Testing qr-demo page...');
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    const demoQRCount = await page.evaluate(() => {
      return document.querySelectorAll('.qr-code-image, img[src*="data:image"]').length;
    });
    
    console.log(`📊 QR-Demo page: Found ${demoQRCount} QR codes`);
    
    if (demoQRCount > 0) {
      // Screen capture
      await page.emulateMedia({ media: 'screen' });
      await page.screenshot({ path: 'qr-demo-screen.png', fullPage: true });
      
      // Print capture
      await page.emulateMedia({ media: 'print' });
      await page.screenshot({ path: 'qr-demo-print.png', fullPage: true });
      
      // PDF generation
      await page.pdf({
        path: 'qr-demo-proof.pdf',
        format: 'A4',
        printBackground: true
      });
      
      // Analyze print visibility
      const demoPrintAnalysis = await page.evaluate(() => {
        const qrImages = document.querySelectorAll('.qr-code-image, img[src*="data:image"]');
        return {
          total: qrImages.length,
          visibleInPrint: Array.from(qrImages).filter(img => {
            const style = window.getComputedStyle(img);
            const rect = img.getBoundingClientRect();
            return style.visibility !== 'hidden' && 
                   style.display !== 'none' && 
                   rect.width > 0 && rect.height > 0;
          }).length,
          details: Array.from(qrImages).map((img, i) => ({
            index: i + 1,
            src: img.src ? (img.src.startsWith('data:') ? 'DATA_URL' : 'EXTERNAL') : 'NO_SRC',
            alt: img.alt,
            visibility: window.getComputedStyle(img).visibility,
            display: window.getComputedStyle(img).display,
            width: window.getComputedStyle(img).width,
            height: window.getComputedStyle(img).height
          }))
        };
      });
      
      testResults.push({
        page: 'qr-demo',
        result: 'SUCCESS',
        qrCount: demoPrintAnalysis.total,
        visibleInPrint: demoPrintAnalysis.visibleInPrint,
        analysis: demoPrintAnalysis
      });
      
      console.log(`✅ QR-Demo: ${demoPrintAnalysis.visibleInPrint}/${demoPrintAnalysis.total} QR codes visible in print`);
    } else {
      testResults.push({ page: 'qr-demo', result: 'NO_QR_CODES' });
    }
    
    // Test validation-qr page  
    console.log('\n📱 Testing validation-qr page...');
    await page.goto('http://localhost:3000/validation-qr');
    await page.waitForTimeout(3000);
    
    const validationQRCount = await page.evaluate(() => {
      return document.querySelectorAll('.qr-code-image, img[src*="data:image"]').length;
    });
    
    console.log(`📊 Validation-QR page: Found ${validationQRCount} QR codes`);
    
    if (validationQRCount > 0) {
      // Screen capture
      await page.emulateMedia({ media: 'screen' });
      await page.screenshot({ path: 'validation-qr-screen.png', fullPage: true });
      
      // Print capture
      await page.emulateMedia({ media: 'print' });
      await page.screenshot({ path: 'validation-qr-print.png', fullPage: true });
      
      // PDF generation
      await page.pdf({
        path: 'validation-qr-proof.pdf',
        format: 'A4',
        printBackground: true
      });
      
      // Analyze print visibility
      const validationPrintAnalysis = await page.evaluate(() => {
        const qrImages = document.querySelectorAll('.qr-code-image, img[src*="data:image"]');
        return {
          total: qrImages.length,
          visibleInPrint: Array.from(qrImages).filter(img => {
            const style = window.getComputedStyle(img);
            const rect = img.getBoundingClientRect();
            return style.visibility !== 'hidden' && 
                   style.display !== 'none' && 
                   rect.width > 0 && rect.height > 0;
          }).length,
          details: Array.from(qrImages).map((img, i) => ({
            index: i + 1,
            src: img.src ? (img.src.startsWith('data:') ? 'DATA_URL' : 'EXTERNAL') : 'NO_SRC',
            alt: img.alt,
            visibility: window.getComputedStyle(img).visibility,
            display: window.getComputedStyle(img).display,
            width: window.getComputedStyle(img).width,
            height: window.getComputedStyle(img).height
          }))
        };
      });
      
      testResults.push({
        page: 'validation-qr',
        result: 'SUCCESS',
        qrCount: validationPrintAnalysis.total,
        visibleInPrint: validationPrintAnalysis.visibleInPrint,
        analysis: validationPrintAnalysis
      });
      
      console.log(`✅ Validation-QR: ${validationPrintAnalysis.visibleInPrint}/${validationPrintAnalysis.total} QR codes visible in print`);
    } else {
      testResults.push({ page: 'validation-qr', result: 'NO_QR_CODES' });
    }
    
    // Generate final proof report
    const proofReport = {
      timestamp: new Date().toISOString(),
      testType: 'QR_PRINT_PROOF_VERIFICATION',
      results: testResults,
      proofFiles: [],
      verdict: 'UNKNOWN'
    };
    
    // Collect all generated files
    const possibleFiles = [
      'qr-demo-screen.png',
      'qr-demo-print.png', 
      'qr-demo-proof.pdf',
      'validation-qr-screen.png',
      'validation-qr-print.png',
      'validation-qr-proof.pdf'
    ];
    
    possibleFiles.forEach(file => {
      if (fs.existsSync(file)) {
        proofReport.proofFiles.push({
          filename: file,
          size: fs.statSync(file).size
        });
      }
    });
    
    // Determine verdict
    const successfulTests = testResults.filter(r => r.result === 'SUCCESS' && r.visibleInPrint > 0);
    proofReport.verdict = successfulTests.length > 0 ? 'QR_CODES_PRINT_SUCCESSFULLY' : 'QR_CODES_NOT_PRINTING';
    
    fs.writeFileSync('qr-print-proof-final.json', JSON.stringify(proofReport, null, 2));
    
    console.log('\n🎯 FINAL PROOF RESULTS:');
    console.log(`Verdict: ${proofReport.verdict}`);
    console.log(`Tests with QR codes visible in print: ${successfulTests.length}`);
    
    console.log('\n📁 PROOF FILES GENERATED:');
    proofReport.proofFiles.forEach(file => {
      console.log(`  ✅ ${file.filename} (${file.size} bytes)`);
    });
    
    console.log('\n📊 DETAILED RESULTS:');
    testResults.forEach(test => {
      console.log(`${test.page}: ${test.result}`);
      if (test.analysis) {
        console.log(`  - Total QR codes: ${test.analysis.total}`);
        console.log(`  - Visible in print: ${test.analysis.visibleInPrint}`);
        test.analysis.details.forEach(qr => {
          console.log(`    QR ${qr.index}: ${qr.src} (${qr.visibility}/${qr.display}) ${qr.width}x${qr.height}`);
        });
      }
    });
    
    return proofReport.verdict === 'QR_CODES_PRINT_SUCCESSFULLY';
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

testDemoPages().then(success => {
  console.log(`\n🏆 PROOF VERIFICATION: ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}).catch(console.error);
