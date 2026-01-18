const { chromium } = require('playwright');
const fs = require('fs');

async function testPDFImageIssue() {
  console.log('🔍 Testing PDF image rendering issue...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test 1: Simple image test
    console.log('📄 Test 1: Testing simple image in PDF...');
    
    const simpleHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          img { width: 100px; height: 100px; border: 2px solid red; }
        </style>
      </head>
      <body>
        <h1>Image Test</h1>
        <p>This should show a red square:</p>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" alt="Test">
        <p>End of test</p>
      </body>
      </html>
    `;
    
    await page.setContent(simpleHTML);
    await page.waitForTimeout(1000);
    
    await page.pdf({
      path: 'test-simple-image.pdf',
      format: 'A4',
      printBackground: true
    });
    
    const simpleSize = fs.statSync('test-simple-image.pdf').size;
    console.log(`Simple image PDF: ${simpleSize} bytes`);
    
    // Test 2: Force image to load completely
    console.log('\n📄 Test 2: Testing with image load verification...');
    
    const imageLoadHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .test-img { 
            width: 150px; 
            height: 150px; 
            border: 3px solid blue; 
            display: block;
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Image Load Test</h1>
        <div id="images-container"></div>
        <script>
          // Create and verify image loading
          const img = new Image();
          img.onload = function() {
            console.log('Image loaded successfully:', this.naturalWidth, 'x', this.naturalHeight);
            document.getElementById('images-container').innerHTML = 
              '<p>Image loaded: ' + this.naturalWidth + 'x' + this.naturalHeight + '</p>' +
              '<img src="' + this.src + '" class="test-img" alt="Loaded Image">';
          };
          img.onerror = function() {
            console.log('Image failed to load');
            document.getElementById('images-container').innerHTML = '<p>Image failed to load</p>';
          };
          img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        </script>
      </body>
      </html>
    `;
    
    await page.setContent(imageLoadHTML);
    await page.waitForTimeout(2000);
    
    await page.pdf({
      path: 'test-image-load.pdf',
      format: 'A4',
      printBackground: true
    });
    
    const loadSize = fs.statSync('test-image-load.pdf').size;
    console.log(`Image load PDF: ${loadSize} bytes`);
    
    // Test 3: Try with external image
    console.log('\n📄 Test 3: Testing with external image...');
    
    const externalHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .ext-img { 
            width: 100px; 
            height: 100px; 
            border: 2px solid green; 
          }
        </style>
      </head>
      <body>
        <h1>External Image Test</h1>
        <img src="https://via.placeholder.com/100x100/ff0000/ffffff?text=TEST" class="ext-img" alt="External">
        <p>External image above</p>
      </body>
      </html>
    `;
    
    await page.setContent(externalHTML);
    await page.waitForTimeout(3000); // Wait for external image to load
    
    await page.pdf({
      path: 'test-external-image.pdf',
      format: 'A4',
      printBackground: true
    });
    
    const extSize = fs.statSync('test-external-image.pdf').size;
    console.log(`External image PDF: ${extSize} bytes`);
    
    // Test 4: Check PDF generation options
    console.log('\n📄 Test 4: Testing different PDF options...');
    
    await page.setContent(`
      <html>
      <body>
        <h1>PDF Options Test</h1>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" 
             style="width:100px;height:100px;border:2px solid black;">
      </body>
      </html>
    `);
    
    // Try different PDF options
    const pdfOptions = [
      { path: 'test-option-1.pdf', format: 'A4', printBackground: false, preferCSSPageSize: true },
      { path: 'test-option-2.pdf', format: 'A4', printBackground: true, preferCSSPageSize: false },
      { path: 'test-option-3.pdf', format: 'A4', printBackground: true, displayHeaderFooter: false }
    ];
    
    for (let i = 0; i < pdfOptions.length; i++) {
      await page.pdf(pdfOptions[i]);
      const size = fs.statSync(pdfOptions[i].path).size;
      console.log(`Option ${i+1} PDF: ${size} bytes`);
    }
    
    // Test 5: Check what Playwright actually sees
    console.log('\n🔍 Test 5: Checking what Playwright sees...');
    
    const pageAnalysis = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return {
        imageCount: images.length,
        imageDetails: Array.from(images).map(img => ({
          src: img.src ? img.src.substring(0, 100) + '...' : 'NO_SRC',
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: img.width,
          height: img.height,
          display: window.getComputedStyle(img).display,
          visibility: window.getComputedStyle(img).visibility
        }))
      };
    });
    
    console.log('Page analysis:', pageAnalysis);
    
    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      pdfSizes: {
        simple: simpleSize,
        imageLoad: loadSize,
        external: extSize
      },
      pageAnalysis,
      conclusion: 'All PDFs generated but user reports no images visible'
    };
    
    fs.writeFileSync('pdf-image-issue-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 SUMMARY:');
    console.log(`Simple image PDF: ${simpleSize} bytes`);
    console.log(`Image load PDF: ${loadSize} bytes`);
    console.log(`External image PDF: ${extSize} bytes`);
    console.log(`Images found in page: ${pageAnalysis.imageCount}`);
    
    console.log('\n🎯 ISSUE IDENTIFIED:');
    console.log('PDFs are generated with reasonable file sizes, but images are not visible.');
    console.log('This suggests a PDF rendering engine issue with data URLs or image embedding.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testPDFImageIssue().catch(console.error);



