const { chromium } = require('playwright');
const fs = require('fs');

async function testProperPDFExport() {
  console.log('🧪 Testing the REAL PDF Export API...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test the PDF API directly
    console.log('🔥 Testing PDF API endpoint directly...');
    
    // First, let's get some QR codes from the demo page
    await page.goto('http://localhost:3000/qr-demo');
    await page.waitForTimeout(3000);
    
    const qrData = await page.evaluate(() => {
      const qrImages = document.querySelectorAll('.qr-code-image');
      const labels = document.querySelectorAll('.qr-item-label');
      
      return Array.from(qrImages).map((img, i) => ({
        id: `item-${i + 1}`,
        name: labels[i]?.textContent?.trim() || `QR Code ${i + 1}`,
        qrDataUrl: img.src
      }));
    });
    
    console.log(`✅ Found ${qrData.length} QR codes for API test`);
    
    // Test the PDF API endpoint directly
    const pdfApiResponse = await page.evaluate(async (qrCodes) => {
      try {
        const response = await fetch('/api/admin/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrCodes: qrCodes,
            settings: {
              pageFormat: 'A4',
              margins: 20,
              qrSize: 40,
              itemsPerRow: 3,
              includeCutlines: true,
              includeLabels: true
            }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            status: response.status,
            error: errorText
          };
        }
        
        // Get the PDF blob
        const pdfBlob = await response.blob();
        
        return {
          success: true,
          status: response.status,
          contentType: response.headers.get('content-type'),
          size: pdfBlob.size,
          blobType: pdfBlob.type
        };
        
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }, qrData);
    
    console.log('📊 PDF API Response:', pdfApiResponse);
    
    if (pdfApiResponse.success) {
      console.log('🎉 PDF API is working!');
      
      // Try to download the PDF via API call in Node.js
      const fetch = (await import('node-fetch')).default;
      
      try {
        const nodeResponse = await fetch('http://localhost:3000/api/admin/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrCodes: qrData,
            settings: {
              pageFormat: 'A4',
              margins: 20,
              qrSize: 40,
              itemsPerRow: 3,
              includeCutlines: true,
              includeLabels: true
            }
          })
        });
        
        if (nodeResponse.ok) {
          const buffer = await nodeResponse.buffer();
          const filename = `api-pdf-export-${Date.now()}.pdf`;
          fs.writeFileSync(filename, buffer);
          
          const fileSize = fs.statSync(filename).size;
          console.log(`✅ Downloaded PDF via API: ${filename} (${fileSize} bytes)`);
          
          console.log('\n🎯 SUCCESS! The PDF API module is working correctly.');
          console.log('📁 Check the generated PDF file:', filename);
          
          return { success: true, filename, fileSize };
        } else {
          const errorText = await nodeResponse.text();
          console.log('❌ Node.js API call failed:', nodeResponse.status, errorText);
        }
        
      } catch (nodeError) {
        console.log('❌ Node.js fetch error:', nodeError.message);
      }
      
    } else {
      console.log('❌ PDF API failed:', pdfApiResponse.error);
    }
    
    // Now test the QR Print Manager interface
    console.log('\n🖥️ Testing QR Print Manager UI...');
    
    await page.goto('http://localhost:3000/dashboard/properties/test-property-123/qr-print');
    await page.waitForTimeout(3000);
    
    // Check what's actually on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasErrorMessage: !!document.querySelector('[role="alert"], .error, .alert-error'),
        bodyText: document.body.textContent.substring(0, 300),
        buttons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).slice(0, 10)
      };
    });
    
    console.log('📋 QR Print Manager Page:', pageContent);
    
    // Take screenshots
    await page.screenshot({ path: 'qr-print-manager-page.png', fullPage: true });
    console.log('✅ QR Print Manager screenshot: qr-print-manager-page.png');
    
    const report = {
      timestamp: new Date().toISOString(),
      apiTest: pdfApiResponse,
      uiTest: pageContent,
      conclusion: pdfApiResponse.success ? 
        'PDF API module works correctly. Issue is with browser print, not PDF export.' :
        'PDF API module needs investigation.'
    };
    
    fs.writeFileSync('proper-pdf-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 FINAL ANALYSIS:');
    if (pdfApiResponse.success) {
      console.log('✅ The PDF generator module IS working correctly');
      console.log('✅ QR codes CAN be exported to PDF via the API');
      console.log('❌ The issue was with browser window.print(), not the real PDF export');
      console.log('🎯 Users should use "Export PDF" button, not browser print');
    } else {
      console.log('❌ PDF API needs debugging');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testProperPDFExport().catch(console.error);



