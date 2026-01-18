const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function fixPDFImages() {
  console.log('🔧 Creating PDF-compatible image solution...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Get QR data from the demo page
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    // Extract QR data URLs
    const qrData = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      return Array.from(qrImages).map((img, i) => ({
        index: i + 1,
        alt: img.alt,
        src: img.src
      }));
    });
    
    console.log(`Found ${qrData.length} QR codes to convert`);
    
    // Create temp directory for images
    const tempDir = path.join(__dirname, 'temp-qr-images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Convert data URLs to actual image files
    const imageFiles = [];
    for (let i = 0; i < qrData.length; i++) {
      const qr = qrData[i];
      if (qr.src && qr.src.startsWith('data:image/')) {
        try {
          const base64Data = qr.src.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `qr-${i + 1}.png`;
          const filepath = path.join(tempDir, filename);
          
          fs.writeFileSync(filepath, buffer);
          imageFiles.push({
            ...qr,
            localPath: filepath,
            filename: filename
          });
          console.log(`✅ Saved QR ${i + 1} as ${filename}`);
        } catch (error) {
          console.log(`❌ Failed to save QR ${i + 1}:`, error.message);
        }
      }
    }
    
    // Create HTML with local file references
    const workingHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            margin: 20mm; 
            font-family: Arial, sans-serif; 
          }
          .qr-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 15mm; 
          }
          .qr-item { 
            text-align: center; 
            page-break-inside: avoid; 
          }
          .qr-image { 
            width: 30mm; 
            height: 30mm; 
            border: 1px solid black; 
            display: block; 
            margin: 0 auto 5mm auto;
          }
          .qr-label { 
            font-size: 10pt; 
            color: black; 
            word-wrap: break-word;
            max-width: 35mm;
          }
          @media print {
            .qr-image { 
              width: 30mm !important; 
              height: 30mm !important; 
              border: 1px solid black !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>QR Codes (File-based)</h1>
        <div class="qr-grid">
          ${imageFiles.map(qr => `
            <div class="qr-item">
              <img src="file://${qr.localPath}" class="qr-image" alt="${qr.alt}">
              <div class="qr-label">${qr.alt}</div>
            </div>
          `).join('')}
        </div>
        <p>Generated ${imageFiles.length} QR codes from local files</p>
      </body>
      </html>
    `;
    
    // Save the working HTML
    fs.writeFileSync('working-qr-test.html', workingHTML);
    console.log('✅ Created working-qr-test.html');
    
    // Test with file-based images
    await page.setContent(workingHTML);
    await page.waitForTimeout(2000);
    
    // Generate PDF with file-based images
    await page.pdf({
      path: 'working-qr-test.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
    });
    
    const workingSize = fs.statSync('working-qr-test.pdf').size;
    console.log(`Working PDF size: ${workingSize} bytes`);
    
    // Alternative approach: Create an HTTP server to serve images
    console.log('\n🌐 Testing HTTP-served images...');
    
    // Simple HTTP server approach
    const httpHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .qr-item { margin: 10px; text-align: center; }
          .qr-image { width: 100px; height: 100px; border: 1px solid red; }
        </style>
      </head>
      <body>
        <h1>HTTP Served QR Test</h1>
        ${Array.from({length: 3}, (_, i) => `
          <div class="qr-item">
            <img src="https://via.placeholder.com/100x100/000000/ffffff?text=QR${i+1}" class="qr-image" alt="QR ${i+1}">
            <p>QR Code ${i+1}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    await page.setContent(httpHTML);
    await page.waitForTimeout(3000); // Wait for external images
    
    await page.pdf({
      path: 'http-served-test.pdf',
      format: 'A4',
      printBackground: true
    });
    
    const httpSize = fs.statSync('http-served-test.pdf').size;
    console.log(`HTTP served PDF size: ${httpSize} bytes`);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      issue: 'Playwright PDF generation does not render data URL images',
      solution: 'Convert data URLs to local files or HTTP-served images',
      results: {
        qrCodesFound: qrData.length,
        imageFilesCreated: imageFiles.length,
        workingPDFSize: workingSize,
        httpPDFSize: httpSize
      },
      files: {
        tempDirectory: tempDir,
        workingHTML: 'working-qr-test.html',
        workingPDF: 'working-qr-test.pdf',
        httpPDF: 'http-served-test.pdf'
      }
    };
    
    fs.writeFileSync('pdf-fix-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 FIX RESULTS:');
    console.log(`QR codes processed: ${qrData.length}`);
    console.log(`Image files created: ${imageFiles.length}`);
    console.log(`Working PDF: ${workingSize} bytes`);
    console.log(`HTTP PDF: ${httpSize} bytes`);
    
    console.log('\n📁 FILES CREATED:');
    console.log('- temp-qr-images/ (directory with QR PNG files)');
    console.log('- working-qr-test.html (uses local files)');
    console.log('- working-qr-test.pdf (should show QR codes)');
    console.log('- http-served-test.pdf (external image test)');
    
    console.log('\n🎯 NEXT STEP:');
    console.log('Check if working-qr-test.pdf shows QR codes!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await browser.close();
  }
}

fixPDFImages().catch(console.error);



