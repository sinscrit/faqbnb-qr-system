const { chromium } = require('playwright');
const fs = require('fs');

async function testPDFExportAPI() {
  console.log('🧪 Testing PDF Export API vs Browser Print...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to QR demo page
    console.log('📱 Going to QR demo page...');
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    // Take screenshot of QR codes in browser
    await page.screenshot({ path: 'qr-demo-browser.png', fullPage: true });
    console.log('✅ Browser screenshot saved: qr-demo-browser.png');
    
    // Check if QR codes are actually generated
    const qrStatus = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      return {
        count: qrImages.length,
        firstQRSrc: qrImages[0]?.src ? qrImages[0].src.substring(0, 100) + '...' : 'NO_SRC',
        allImagesComplete: Array.from(qrImages).every(img => img.complete),
        allImagesLoaded: Array.from(qrImages).every(img => img.naturalWidth > 0)
      };
    });
    
    console.log('📊 QR Code Status:', qrStatus);
    
    // Navigate to actual QR print manager
    console.log('\n🔄 Testing actual QR Print Manager...');
    await page.goto('http://localhost:3000/dashboard/properties/test-property-123/qr-print');
    await page.waitForTimeout(5000);
    
    // Check if we can see the QR Print Manager interface
    const printManagerStatus = await page.evaluate(() => {
      const selectStep = document.querySelector('[data-step="select"]');
      const configureStep = document.querySelector('[data-step="configure"]');
      const previewStep = document.querySelector('[data-step="preview"]');
      const pdfExportButton = document.querySelector('button:has-text("Export PDF")') || 
                              document.querySelector('button[title*="PDF"]') ||
                              document.querySelector('button:contains("📄")');
      
      return {
        hasSelectStep: !!selectStep,
        hasConfigureStep: !!configureStep,
        hasPreviewStep: !!previewStep,
        hasPDFExportButton: !!pdfExportButton,
        currentURL: window.location.href,
        bodyContent: document.body.textContent.substring(0, 200) + '...'
      };
    });
    
    console.log('📋 Print Manager Status:', printManagerStatus);
    
    // Try to find and click through the QR generation workflow
    try {
      // Look for items to select
      const selectAllButton = await page.locator('button:has-text("Select All"), button:has-text("select all")').first();
      if (await selectAllButton.isVisible({ timeout: 2000 })) {
        console.log('🔘 Clicking Select All...');
        await selectAllButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Look for Continue/Next button
      const continueButton = await page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      if (await continueButton.isVisible({ timeout: 2000 })) {
        console.log('➡️ Clicking Continue...');
        await continueButton.click();
        await page.waitForTimeout(2000);
      }
      
      // Look for Generate button
      const generateButton = await page.locator('button:has-text("Generate"), button:has-text("Generate QR Codes")').first();
      if (await generateButton.isVisible({ timeout: 2000 })) {
        console.log('⚡ Clicking Generate QR Codes...');
        await generateButton.click();
        await page.waitForTimeout(5000); // Wait for QR generation
      }
      
      // Look for PDF Export button
      const pdfExportButton = await page.locator('button:has-text("Export PDF"), button:has-text("📄")').first();
      if (await pdfExportButton.isVisible({ timeout: 2000 })) {
        console.log('📄 Found PDF Export button!');
        
        // Set up response listener for PDF download
        const downloadPromise = page.waitForDownload();
        
        await pdfExportButton.click();
        await page.waitForTimeout(1000);
        
        // Handle PDF export modal if it appears
        const exportButton = await page.locator('button:has-text("Export"), button:has-text("Generate PDF")').first();
        if (await exportButton.isVisible({ timeout: 3000 })) {
          console.log('📋 PDF Export modal detected, clicking Export...');
          await exportButton.click();
          
          try {
            const download = await downloadPromise;
            console.log('✅ PDF Export successful!');
            const filename = `api-generated-${Date.now()}.pdf`;
            await download.saveAs(filename);
            
            const fileSize = fs.statSync(filename).size;
            console.log(`📊 API-generated PDF: ${filename} (${fileSize} bytes)`);
            
            return { success: true, filename, fileSize };
          } catch (downloadError) {
            console.log('⚠️ No download detected, checking for other responses...');
          }
        }
      } else {
        console.log('❌ PDF Export button not found');
      }
      
    } catch (workflowError) {
      console.log('⚠️ Could not complete full workflow:', workflowError.message);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'qr-print-manager-final.png', fullPage: true });
    console.log('✅ Final screenshot saved: qr-print-manager-final.png');
    
    // Compare with browser print
    console.log('\n🔍 Comparing browser print vs API export...');
    
    const comparison = {
      timestamp: new Date().toISOString(),
      qrDemoStatus: qrStatus,
      printManagerStatus: printManagerStatus,
      conclusion: 'API PDF export should use the professional PDF generator module'
    };
    
    fs.writeFileSync('pdf-export-comparison.json', JSON.stringify(comparison, null, 2));
    
    console.log('\n📊 RESULTS:');
    console.log('- QR codes in browser:', qrStatus.count, 'found,', qrStatus.allImagesLoaded ? 'loaded' : 'not loaded');
    console.log('- Print manager found:', printManagerStatus.hasSelectStep ? 'Yes' : 'No');
    console.log('- PDF export should work via API, not browser print');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testPDFExportAPI().catch(console.error);



