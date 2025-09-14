const { chromium } = require('playwright');
const fs = require('fs');

async function generateFinalProof() {
  console.log('🎯 FINAL QR PRINT PROOF GENERATION');
  console.log('This test will provide definitive proof of QR printing status');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    console.log('\n📱 Loading QR Demo page...');
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    // Check QR codes in screen mode
    console.log('🔍 Analyzing QR codes in SCREEN mode...');
    await page.emulateMedia({ media: 'screen' });
    
    const screenAnalysis = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('img[src*="data:image"], .qr-code-image');
      const results = Array.from(qrImages).map((img, i) => {
        const rect = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);
        return {
          index: i + 1,
          alt: img.alt || 'No alt',
          src: img.src ? 'HAS_DATA_URL' : 'NO_SRC',
          srcLength: img.src ? img.src.length : 0,
          className: img.className,
          visibility: style.visibility,
          display: style.display,
          width: style.width,
          height: style.height,
          rect: {
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
          }
        };
      });
      
      return {
        mode: 'SCREEN',
        total: qrImages.length,
        details: results
      };
    });
    
    console.log(`📊 SCREEN MODE: Found ${screenAnalysis.total} QR codes`);
    screenAnalysis.details.forEach(qr => {
      console.log(`  QR ${qr.index}: ${qr.alt} - ${qr.src} (${qr.visibility}/${qr.display}) ${qr.width}x${qr.height}`);
    });
    
    // Capture screen version
    await page.screenshot({ 
      path: 'final-proof-screen.png', 
      fullPage: true 
    });
    
    // Check QR codes in print mode
    console.log('\n🖨️ Analyzing QR codes in PRINT mode...');
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(1000);
    
    const printAnalysis = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('img[src*="data:image"], .qr-code-image');
      const results = Array.from(qrImages).map((img, i) => {
        const rect = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);
        return {
          index: i + 1,
          alt: img.alt || 'No alt',
          src: img.src ? 'HAS_DATA_URL' : 'NO_SRC',
          srcLength: img.src ? img.src.length : 0,
          className: img.className,
          visibility: style.visibility,
          display: style.display,
          width: style.width,
          height: style.height,
          rect: {
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
          }
        };
      });
      
      const visibleCount = results.filter(qr => 
        qr.visibility !== 'hidden' && 
        qr.display !== 'none' && 
        qr.rect.visible
      ).length;
      
      return {
        mode: 'PRINT',
        total: qrImages.length,
        visibleInPrint: visibleCount,
        details: results
      };
    });
    
    console.log(`📊 PRINT MODE: ${printAnalysis.visibleInPrint}/${printAnalysis.total} QR codes visible`);
    printAnalysis.details.forEach(qr => {
      const visible = qr.visibility !== 'hidden' && qr.display !== 'none' && qr.rect.visible;
      console.log(`  QR ${qr.index}: ${qr.alt} - ${visible ? '✅ VISIBLE' : '❌ HIDDEN'} (${qr.visibility}/${qr.display})`);
    });
    
    // Capture print version
    await page.screenshot({ 
      path: 'final-proof-print.png', 
      fullPage: true 
    });
    
    // Generate actual PDF proof
    console.log('\n📄 Generating PDF proof...');
    await page.pdf({
      path: 'final-proof.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });
    
    // Generate comprehensive report
    const proofReport = {
      timestamp: new Date().toISOString(),
      testType: 'FINAL_QR_PRINT_PROOF',
      url: 'http://localhost:3000/qr-demo',
      screenAnalysis: screenAnalysis,
      printAnalysis: printAnalysis,
      verdict: {
        qrCodesFound: printAnalysis.total > 0,
        qrCodesVisibleInPrint: printAnalysis.visibleInPrint > 0,
        status: printAnalysis.visibleInPrint > 0 ? 'QR_CODES_PRINT_SUCCESSFULLY' : 'QR_CODES_DO_NOT_PRINT',
        evidence: [
          'final-proof-screen.png',
          'final-proof-print.png', 
          'final-proof.pdf'
        ]
      }
    };
    
    fs.writeFileSync('final-proof-report.json', JSON.stringify(proofReport, null, 2));
    
    console.log('\n🎯 FINAL PROOF VERDICT:');
    console.log(`Status: ${proofReport.verdict.status}`);
    console.log(`QR Codes Found: ${proofReport.verdict.qrCodesFound}`);
    console.log(`QR Codes Print: ${proofReport.verdict.qrCodesVisibleInPrint}`);
    
    console.log('\n📁 PROOF EVIDENCE FILES:');
    proofReport.verdict.evidence.forEach(file => {
      const exists = fs.existsSync(file);
      const size = exists ? fs.statSync(file).size : 0;
      console.log(`  ${exists ? '✅' : '❌'} ${file} (${size} bytes)`);
    });
    
    if (printAnalysis.visibleInPrint > 0) {
      console.log('\n🎉 SUCCESS: QR codes ARE visible in print mode');
      console.log('The print CSS fix is working correctly');
    } else {
      console.log('\n❌ ISSUE: QR codes are NOT visible in print mode');
      console.log('Additional CSS fixes needed');
    }
    
    return printAnalysis.visibleInPrint > 0;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'final-proof-error.png', fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

generateFinalProof().then(success => {
  console.log(`\n🏆 FINAL RESULT: ${success ? 'QR PRINT VERIFICATION PASSED' : 'QR PRINT VERIFICATION FAILED'}`);
  process.exit(success ? 0 : 1);
}).catch(console.error);



