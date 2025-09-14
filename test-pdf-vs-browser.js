const { chromium } = require('playwright');
const fs = require('fs');

async function testPDFvsBrowser() {
  console.log('🔍 Testing PDF vs Browser rendering...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Loading QR demo page...');
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    // Check QR codes in browser
    console.log('🖥️ Checking QR codes in browser...');
    const browserQRs = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      return Array.from(qrImages).map((img, i) => ({
        index: i + 1,
        src: img.src ? img.src.substring(0, 50) + '...' : 'NO_SRC',
        srcLength: img.src ? img.src.length : 0,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        visible: img.offsetWidth > 0 && img.offsetHeight > 0
      }));
    });
    
    console.log(`Found ${browserQRs.length} QR codes in browser:`);
    browserQRs.forEach(qr => {
      console.log(`  ${qr.index}. ${qr.naturalWidth}x${qr.naturalHeight} (${qr.srcLength} chars) visible: ${qr.visible}`);
    });
    
    // Test 1: Generate PDF with current setup
    console.log('\n📄 Test 1: Generate PDF with current print CSS...');
    await page.emulateMedia({ media: 'print' });
    
    const pdf1 = await page.pdf({
      path: 'test-current-pdf.pdf',
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false
    });
    
    const pdf1Size = fs.statSync('test-current-pdf.pdf').size;
    console.log(`Current PDF size: ${pdf1Size} bytes`);
    
    // Test 2: Generate PDF in screen mode (no print CSS)
    console.log('\n📄 Test 2: Generate PDF in screen mode...');
    await page.emulateMedia({ media: 'screen' });
    
    const pdf2 = await page.pdf({
      path: 'test-screen-pdf.pdf',
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false
    });
    
    const pdf2Size = fs.statSync('test-screen-pdf.pdf').size;
    console.log(`Screen PDF size: ${pdf2Size} bytes`);
    
    // Test 3: Override print CSS temporarily
    console.log('\n📄 Test 3: Override print CSS...');
    await page.emulateMedia({ media: 'print' });
    
    // Inject CSS to override our print styles
    await page.addStyleTag({
      content: `
        @media print {
          /* Force everything to be visible */
          * {
            visibility: visible !important;
            display: block !important;
            opacity: 1 !important;
          }
          
          /* Specifically ensure QR codes are visible */
          .qr-code-image {
            width: 100px !important;
            height: 100px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            border: 2px solid red !important;
            margin: 10px !important;
          }
          
          /* Make sure containers are visible */
          .qr-print-preview,
          .qr-grid,
          .qr-item,
          .qr-container,
          .qr-code-container {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Grid layout */
          .qr-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }
      `
    });
    
    const pdf3 = await page.pdf({
      path: 'test-override-pdf.pdf',
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false
    });
    
    const pdf3Size = fs.statSync('test-override-pdf.pdf').size;
    console.log(`Override PDF size: ${pdf3Size} bytes`);
    
    // Test 4: Check what's actually in print mode
    console.log('\n🔍 Test 4: Analyze print mode content...');
    const printContent = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      const allElements = document.querySelectorAll('*');
      
      let visibleElements = 0;
      let hiddenElements = 0;
      
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          visibleElements++;
        } else {
          hiddenElements++;
        }
      });
      
      return {
        qrImagesFound: qrImages.length,
        qrImages: Array.from(qrImages).map(img => ({
          display: window.getComputedStyle(img).display,
          visibility: window.getComputedStyle(img).visibility,
          opacity: window.getComputedStyle(img).opacity,
          width: window.getComputedStyle(img).width,
          height: window.getComputedStyle(img).height
        })),
        totalElements: allElements.length,
        visibleElements,
        hiddenElements
      };
    });
    
    console.log('Print mode analysis:');
    console.log(`  QR images found: ${printContent.qrImagesFound}`);
    console.log(`  Total elements: ${printContent.totalElements}`);
    console.log(`  Visible elements: ${printContent.visibleElements}`);
    console.log(`  Hidden elements: ${printContent.hiddenElements}`);
    
    printContent.qrImages.forEach((qr, i) => {
      console.log(`  QR ${i+1}: display:${qr.display} visibility:${qr.visibility} opacity:${qr.opacity} ${qr.width}x${qr.height}`);
    });
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      browserQRs: browserQRs,
      pdfSizes: {
        current: pdf1Size,
        screen: pdf2Size,
        override: pdf3Size
      },
      printModeAnalysis: printContent
    };
    
    fs.writeFileSync('pdf-vs-browser-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 SUMMARY:');
    console.log(`Browser QR codes: ${browserQRs.length} (${browserQRs.filter(q => q.visible).length} visible)`);
    console.log(`PDF sizes: Current=${pdf1Size}b, Screen=${pdf2Size}b, Override=${pdf3Size}b`);
    console.log(`Print mode QR images: ${printContent.qrImagesFound} found`);
    
    // Determine if PDFs likely have content
    const hasContent = Math.max(pdf1Size, pdf2Size, pdf3Size) > 50000; // 50KB threshold
    console.log(`\n${hasContent ? '✅' : '❌'} PDFs likely contain content: ${hasContent}`);
    
    return hasContent;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testPDFvsBrowser().then(success => {
  console.log(`\n🏆 Result: PDF generation ${success ? 'working' : 'broken'}`);
  process.exit(success ? 0 : 1);
}).catch(console.error);



