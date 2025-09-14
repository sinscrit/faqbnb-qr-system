const { chromium } = require('playwright');

async function debugQRGeneration() {
  console.log('🔍 Debugging QR code generation step by step...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test with the actual QR demo page but with debugging
    console.log('📱 Loading QR demo page with debugging...');
    await page.goto('http://localhost:3000/qr-demo');
    
    // Inject debugging into the page
    await page.addScriptTag({
      content: `
        console.log('=== QR DEBUG: Page loaded ===');
        
        // Override console methods to capture logs
        const originalLog = console.log;
        const originalError = console.error;
        window.debugLogs = [];
        
        console.log = (...args) => {
          window.debugLogs.push({type: 'log', args: args.map(String)});
          originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
          window.debugLogs.push({type: 'error', args: args.map(String)});
          originalError.apply(console, args);
        };
        
        // Check for QR code library
        if (typeof QRCode !== 'undefined') {
          console.log('QRCode library is available:', typeof QRCode);
        } else {
          console.error('QRCode library is NOT available');
        }
        
        // Monitor DOM changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.tagName === 'IMG') {
                  console.log('IMG element added:', {
                    src: node.src ? node.src.substring(0, 50) + '...' : 'NO_SRC',
                    className: node.className,
                    alt: node.alt
                  });
                }
              });
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        console.log('=== QR DEBUG: Monitoring started ===');
      `
    });
    
    // Wait for component to load and any QR generation to happen
    await page.waitForTimeout(5000);
    
    // Check what happened
    const debugInfo = await page.evaluate(() => {
      return {
        debugLogs: window.debugLogs || [],
        qrImages: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src ? img.src.substring(0, 100) + '...' : 'NO_SRC',
          className: img.className,
          alt: img.alt,
          width: img.width,
          height: img.height,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        })),
        errors: Array.from(document.querySelectorAll('.error, [class*="error"]')).map(el => el.textContent),
        qrCodeElements: Array.from(document.querySelectorAll('[class*="qr"]')).length,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('\n📊 DEBUG RESULTS:');
    console.log('Debug logs captured:', debugInfo.debugLogs.length);
    debugInfo.debugLogs.forEach((log, i) => {
      console.log(`  ${i + 1}. [${log.type}] ${log.args.join(' ')}`);
    });
    
    console.log('\nImages found:', debugInfo.qrImages.length);
    debugInfo.qrImages.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.alt || 'No alt'} - ${img.src} (${img.naturalWidth}x${img.naturalHeight})`);
    });
    
    console.log('\nQR-related elements:', debugInfo.qrCodeElements);
    console.log('Errors found:', debugInfo.errors.length);
    if (debugInfo.errors.length > 0) {
      debugInfo.errors.forEach(error => console.log('  Error:', error));
    }
    
    console.log('\nPage text preview:', debugInfo.bodyText);
    
    // Try to manually trigger QR generation
    console.log('\n🔧 Attempting manual QR generation...');
    
    const manualQRResult = await page.evaluate(async () => {
      try {
        // Check if we're in the QRCodePrintPreview component
        const qrPreview = document.querySelector('.qr-print-preview');
        if (!qrPreview) {
          return { error: 'QR print preview component not found' };
        }
        
        // Check if QRCode library is available globally
        if (typeof window.QRCode === 'undefined') {
          return { error: 'QRCode library not available globally' };
        }
        
        // Try to generate a simple QR code manually
        const testUrl = 'https://example.com/test';
        const canvas = document.createElement('canvas');
        
        await new Promise((resolve, reject) => {
          window.QRCode.toCanvas(canvas, testUrl, { width: 200 }, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        
        const dataUrl = canvas.toDataURL();
        return {
          success: true,
          dataUrlLength: dataUrl.length,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        };
        
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('Manual QR generation result:', manualQRResult);
    
    await page.screenshot({ path: 'debug-qr-page.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugQRGeneration().catch(console.error);



