const { chromium } = require('playwright');
const fs = require('fs');

async function checkQRDataURLs() {
  console.log('🔍 Checking QR data URLs...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    // Extract actual QR data URLs
    const qrData = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      return Array.from(qrImages).map((img, i) => ({
        index: i + 1,
        alt: img.alt,
        src: img.src,
        dataLength: img.src ? img.src.length : 0,
        isDataURL: img.src ? img.src.startsWith('data:image/') : false,
        hasBase64: img.src ? img.src.includes('base64,') : false
      }));
    });
    
    console.log('📊 QR Data URL Analysis:');
    qrData.forEach(qr => {
      console.log(`QR ${qr.index}: ${qr.alt}`);
      console.log(`  Length: ${qr.dataLength} chars`);
      console.log(`  Is Data URL: ${qr.isDataURL}`);
      console.log(`  Has Base64: ${qr.hasBase64}`);
      if (qr.src) {
        console.log(`  Preview: ${qr.src.substring(0, 100)}...`);
      }
      console.log('');
    });
    
    // Save first QR data URL to file for inspection
    if (qrData[0] && qrData[0].src) {
      const base64Data = qrData[0].src.split(',')[1];
      if (base64Data) {
        try {
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync('qr-sample.png', buffer);
          console.log('✅ Saved first QR as qr-sample.png for inspection');
        } catch (error) {
          console.log('❌ Failed to decode base64:', error.message);
        }
      }
    }
    
    // Test if these data URLs actually work by creating an image
    const imageTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        const firstQR = document.querySelector('.qr-code-image');
        if (!firstQR || !firstQR.src) {
          resolve({ success: false, error: 'No QR found' });
          return;
        }
        
        const testImg = new Image();
        testImg.onload = () => {
          resolve({ 
            success: true, 
            width: testImg.naturalWidth, 
            height: testImg.naturalHeight 
          });
        };
        testImg.onerror = () => {
          resolve({ success: false, error: 'Image load failed' });
        };
        testImg.src = firstQR.src;
      });
    });
    
    console.log('🖼️ Image Load Test:', imageTest);
    
    // Create minimal test page with just QR codes
    console.log('\n📄 Creating minimal test page...');
    const minimalHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 20px; font-family: Arial; }
          .test-qr { 
            width: 150px; 
            height: 150px; 
            border: 1px solid black; 
            margin: 10px;
            display: inline-block;
          }
          @media print {
            .test-qr { 
              width: 100px !important; 
              height: 100px !important; 
              border: 1px solid black !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>QR Test Page</h1>
        ${qrData.map(qr => `
          <div>
            <p>${qr.alt}</p>
            <img src="${qr.src}" class="test-qr" alt="${qr.alt}">
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    fs.writeFileSync('minimal-qr-test.html', minimalHTML);
    console.log('✅ Created minimal-qr-test.html');
    
    // Test the minimal page
    await page.setContent(minimalHTML);
    await page.waitForTimeout(2000);
    
    await page.pdf({
      path: 'minimal-qr-test.pdf',
      format: 'A4',
      printBackground: true
    });
    
    const minimalPDFSize = fs.statSync('minimal-qr-test.pdf').size;
    console.log(`Minimal PDF size: ${minimalPDFSize} bytes`);
    
    return {
      qrDataValid: qrData.every(qr => qr.isDataURL && qr.hasBase64),
      imageLoadTest: imageTest.success,
      minimalPDFSize
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { qrDataValid: false, imageLoadTest: false, minimalPDFSize: 0 };
  } finally {
    await browser.close();
  }
}

checkQRDataURLs().then(result => {
  console.log('\n🎯 SUMMARY:');
  console.log(`QR data URLs valid: ${result.qrDataValid}`);
  console.log(`Images load correctly: ${result.imageLoadTest}`);
  console.log(`Minimal PDF size: ${result.minimalPDFSize} bytes`);
  
  console.log('\n📁 Files created for inspection:');
  console.log('- qr-sample.png (extracted QR image)');
  console.log('- minimal-qr-test.html (simple test page)');
  console.log('- minimal-qr-test.pdf (PDF with just QR codes)');
  
  process.exit(0);
}).catch(console.error);



