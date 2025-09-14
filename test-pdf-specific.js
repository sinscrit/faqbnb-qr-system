const { chromium } = require('playwright');
const fs = require('fs');

async function testPDFSpecifically() {
  console.log('🔍 Testing PDF generation specifically...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Loading QR demo page...');
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    // Check QR codes exist
    const qrCount = await page.evaluate(() => {
      return document.querySelectorAll('.qr-code-image').length;
    });
    console.log(`Found ${qrCount} QR codes`);
    
    if (qrCount === 0) {
      console.log('❌ No QR codes found, cannot test PDF');
      return false;
    }
    
    // Test 1: Simple PDF without print media
    console.log('\n📄 Test 1: PDF without print media...');
    await page.emulateMedia({ media: 'screen' });
    const pdf1 = await page.pdf({
      path: 'test-pdf-screen.pdf',
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false
    });
    console.log(`Screen PDF size: ${fs.statSync('test-pdf-screen.pdf').size} bytes`);
    
    // Test 2: PDF with print media but no CSS
    console.log('\n📄 Test 2: PDF with print media, no custom CSS...');
    await page.emulateMedia({ media: 'print' });
    
    // Temporarily disable our print CSS
    await page.addStyleTag({
      content: `
        @media print {
          /* Override our print CSS temporarily */
          * { 
            visibility: visible !important; 
            display: unset !important; 
          }
          .qr-code-image { 
            width: 100px !important; 
            height: 100px !important; 
            visibility: visible !important;
            display: block !important;
          }
        }
      `
    });
    
    const pdf2 = await page.pdf({
      path: 'test-pdf-override.pdf',
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false
    });
    console.log(`Override PDF size: ${fs.statSync('test-pdf-override.pdf').size} bytes`);
    
    // Test 3: PDF with minimal HTML
    console.log('\n📄 Test 3: Testing with minimal HTML...');
    
    // Get QR data URLs
    const qrData = await page.evaluate(() => {
      const images = document.querySelectorAll('.qr-code-image');
      return Array.from(images).map(img => ({
        src: img.src,
        alt: img.alt
      }));
    });
    
    // Create minimal test page
    const minimalHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @media print {
            body { margin: 20px; }
            .qr-item { 
              display: inline-block; 
              margin: 10px; 
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-image { 
              width: 100px; 
              height: 100px; 
              border: 1px solid black;
            }
            .qr-label { 
              font-size: 12px; 
              margin-top: 5px; 
            }
          }
        </style>
      </head>
      <body>
        <h1>QR Code Test</h1>
        ${qrData.map((qr, i) => `
          <div class="qr-item">
            <img src="${qr.src}" alt="${qr.alt}" class="qr-image">
            <div class="qr-label">${qr.alt}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    await page.setContent(minimalHtml);
    await page.waitForTimeout(1000);
    
    const pdf3 = await page.pdf({
      path: 'test-pdf-minimal.pdf',
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false
    });
    console.log(`Minimal PDF size: ${fs.statSync('test-pdf-minimal.pdf').size} bytes`);
    
    // Test 4: Check if images are actually loading
    console.log('\n🔍 Test 4: Checking image loading...');
    const imageStatus = await page.evaluate(() => {
      const images = document.querySelectorAll('.qr-image');
      return Array.from(images).map(img => ({
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        src: img.src ? img.src.substring(0, 50) + '...' : 'NO_SRC'
      }));
    });
    
    console.log('Image loading status:');
    imageStatus.forEach((status, i) => {
      console.log(`  ${i + 1}. Complete: ${status.complete}, Size: ${status.naturalWidth}x${status.naturalHeight}`);
    });
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      testResults: {
        qrCodesFound: qrCount,
        pdfSizes: {
          screen: fs.statSync('test-pdf-screen.pdf').size,
          override: fs.statSync('test-pdf-override.pdf').size,
          minimal: fs.statSync('test-pdf-minimal.pdf').size
        },
        imageLoadingStatus: imageStatus
      }
    };
    
    fs.writeFileSync('pdf-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 PDF Test Summary:');
    console.log(`QR codes found: ${qrCount}`);
    console.log(`Screen PDF: ${report.testResults.pdfSizes.screen} bytes`);
    console.log(`Override PDF: ${report.testResults.pdfSizes.override} bytes`);
    console.log(`Minimal PDF: ${report.testResults.pdfSizes.minimal} bytes`);
    
    const largestPdf = Math.max(...Object.values(report.testResults.pdfSizes));
    console.log(`\n${largestPdf > 10000 ? '✅' : '❌'} Largest PDF: ${largestPdf} bytes`);
    
    return largestPdf > 10000; // Consider success if any PDF is larger than 10KB
    
  } catch (error) {
    console.error('❌ PDF test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testPDFSpecifically().then(success => {
  console.log(`\n🏆 PDF Test Result: ${success ? 'SUCCESS' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}).catch(console.error);
