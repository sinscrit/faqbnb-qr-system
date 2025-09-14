const { chromium } = require('playwright');
const fs = require('fs');

async function testRealQRGeneration() {
  console.log('🔍 Testing REAL QR code generation and visibility...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test with actual QR generation using qrcode library
    console.log('📱 Creating test page with REAL QR codes...');
    
    await page.goto('data:text/html,<!DOCTYPE html><html><head><title>Real QR Test</title><script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script><style>body{font-family:Arial;padding:20px}.qr-container{display:inline-block;margin:10px;text-align:center}img{border:1px solid #ccc}</style></head><body><h1>Real QR Code Test</h1><div id="qr-area"></div><script>async function generateRealQRs(){const container=document.getElementById("qr-area");const testUrls=["https://example.com/item1","https://example.com/item2","https://example.com/item3"];for(let i=0;i<testUrls.length;i++){try{const canvas=document.createElement("canvas");await QRCode.toCanvas(canvas,testUrls[i],{width:200,margin:2});const img=new Image();img.src=canvas.toDataURL();img.className="qr-code-image";img.alt=`QR Code ${i+1}`;const div=document.createElement("div");div.className="qr-container";div.innerHTML=`<p>QR Code ${i+1}</p>`;div.appendChild(img);container.appendChild(div);}catch(e){console.error("QR generation failed:",e);}}}generateRealQRs();</script></body></html>');
    
    await page.waitForTimeout(3000);
    
    // Check if QR codes were actually generated
    const qrAnalysis = await page.evaluate(() => {
      const images = document.querySelectorAll('img.qr-code-image');
      const canvases = document.querySelectorAll('canvas');
      
      return {
        imageCount: images.length,
        canvasCount: canvases.length,
        images: Array.from(images).map((img, i) => ({
          index: i + 1,
          src: img.src ? 'HAS_SRC' : 'NO_SRC',
          srcLength: img.src ? img.src.length : 0,
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        })),
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log('📊 Real QR Generation Analysis:');
    console.log(`Images found: ${qrAnalysis.imageCount}`);
    console.log(`Canvases found: ${qrAnalysis.canvasCount}`);
    console.log('Page text:', qrAnalysis.bodyText);
    
    qrAnalysis.images.forEach(img => {
      console.log(`  QR ${img.index}: ${img.src} (${img.srcLength} chars) ${img.naturalWidth}x${img.naturalHeight} complete:${img.complete}`);
    });
    
    // Take screenshot to capture what's actually visible
    await page.screenshot({ 
      path: 'real-qr-test.png',
      fullPage: true 
    });
    
    // Test print behavior
    console.log('\n🖨️ Testing print behavior...');
    await page.addStyleTag({
      content: `
        @media print {
          body { margin: 0; padding: 20px; }
          .qr-container { 
            display: inline-block !important; 
            margin: 10px !important;
            page-break-inside: avoid;
          }
          img.qr-code-image { 
            display: block !important; 
            width: 150px !important; 
            height: 150px !important;
          }
        }
      `
    });
    
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ 
      path: 'real-qr-test-print.png',
      fullPage: true 
    });
    
    // Generate PDF
    await page.pdf({
      path: 'real-qr-test.pdf',
      format: 'A4',
      printBackground: true
    });
    
    const printAnalysis = await page.evaluate(() => {
      const images = document.querySelectorAll('img.qr-code-image');
      return {
        printMode: true,
        imageCount: images.length,
        visibleImages: Array.from(images).filter(img => {
          const style = window.getComputedStyle(img);
          const rect = img.getBoundingClientRect();
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 rect.width > 0 && rect.height > 0;
        }).length
      };
    });
    
    console.log(`Print mode: ${printAnalysis.visibleImages}/${printAnalysis.imageCount} QR codes visible`);
    
    // Create comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'REAL_QR_GENERATION_TEST',
      results: {
        qrGeneration: qrAnalysis,
        printVisibility: printAnalysis,
        filesGenerated: ['real-qr-test.png', 'real-qr-test-print.png', 'real-qr-test.pdf']
      },
      verdict: qrAnalysis.imageCount > 0 && printAnalysis.visibleImages > 0 ? 'QR_CODES_WORK' : 'QR_CODES_BROKEN'
    };
    
    fs.writeFileSync('real-qr-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n🎯 REAL QR TEST VERDICT:');
    console.log(`QR Generation: ${qrAnalysis.imageCount > 0 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Print Visibility: ${printAnalysis.visibleImages > 0 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Overall: ${report.verdict}`);
    
    console.log('\n📁 Evidence files created:');
    report.results.filesGenerated.forEach(file => {
      const exists = fs.existsSync(file);
      const size = exists ? fs.statSync(file).size : 0;
      console.log(`  ${exists ? '✅' : '❌'} ${file} (${size} bytes)`);
    });
    
    return report.verdict === 'QR_CODES_WORK';
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testRealQRGeneration().then(success => {
  console.log(`\n🏆 FINAL RESULT: ${success ? 'QR CODES ACTUALLY WORK' : 'QR CODES DO NOT WORK'}`);
  process.exit(success ? 0 : 1);
}).catch(console.error);



