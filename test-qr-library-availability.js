const { chromium } = require('playwright');

async function testQRLibraryAvailability() {
  console.log('🔍 Testing QR library availability...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test on the actual QR demo page
    console.log('📱 Loading QR demo page...');
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(2000);
    
    // Check global QR library availability
    const libraryCheck = await page.evaluate(() => {
      return {
        windowQRCode: typeof window.QRCode,
        globalQRCode: typeof QRCode,
        qrcodeModule: typeof qrcode,
        availableLibraries: Object.keys(window).filter(key => 
          key.toLowerCase().includes('qr')
        ),
        imports: document.querySelectorAll('script[src*="qr"]').length,
        moduleErrors: window.qrLibraryError || null
      };
    });
    
    console.log('📊 QR Library Availability Check:');
    console.log(`window.QRCode: ${libraryCheck.windowQRCode}`);
    console.log(`global QRCode: ${libraryCheck.globalQRCode}`);
    console.log(`qrcode module: ${libraryCheck.qrcodeModule}`);
    console.log(`QR-related globals: ${libraryCheck.availableLibraries.join(', ') || 'none'}`);
    console.log(`QR script imports: ${libraryCheck.imports}`);
    
    // Test if we can manually load QR library
    console.log('\n🔧 Attempting to manually load QR library...');
    const manualLoad = await page.evaluate(async () => {
      try {
        // Try to load QR library from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          setTimeout(reject, 5000); // 5 second timeout
        });
        
        return {
          success: true,
          qrCodeAvailable: typeof window.QRCode !== 'undefined'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('Manual load result:', manualLoad);
    
    // If manual load worked, test QR generation
    if (manualLoad.success) {
      console.log('\n✅ Testing QR generation with loaded library...');
      const qrTest = await page.evaluate(async () => {
        try {
          const canvas = document.createElement('canvas');
          await new Promise((resolve, reject) => {
            window.QRCode.toCanvas(canvas, 'https://example.com/test', {
              width: 200,
              margin: 2
            }, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
          
          return {
            success: true,
            dataUrl: canvas.toDataURL(),
            width: canvas.width,
            height: canvas.height
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      console.log('QR generation test:', qrTest.success ? 'SUCCESS' : 'FAILED');
      if (qrTest.success) {
        console.log(`Generated QR: ${qrTest.width}x${qrTest.height} pixels`);
        console.log(`Data URL length: ${qrTest.dataUrl.length} chars`);
      } else {
        console.log('Error:', qrTest.error);
      }
    }
    
    return {
      libraryAvailable: libraryCheck.globalQRCode !== 'undefined' || manualLoad.success,
      canGenerate: manualLoad.success
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { libraryAvailable: false, canGenerate: false };
  } finally {
    await browser.close();
  }
}

testQRLibraryAvailability().then(result => {
  console.log('\n🎯 FINAL RESULT:');
  console.log(`QR Library Available: ${result.libraryAvailable}`);
  console.log(`Can Generate QR Codes: ${result.canGenerate}`);
  process.exit(result.canGenerate ? 0 : 1);
}).catch(console.error);



