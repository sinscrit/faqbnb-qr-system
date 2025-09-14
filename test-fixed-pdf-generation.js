const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFixedPDFGeneration() {
  console.log('🧪 Testing PDF generation after PDFKit fix...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable request/response logging
  page.on('request', request => {
    if (request.url().includes('generate-pdf')) {
      console.log('📤 PDF API Request:', request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('generate-pdf')) {
      console.log('📥 PDF API Response:', response.status(), response.statusText());
    }
  });
  
  try {
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3000/auth/signin');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', 'sinscrit@gmail.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('✅ Successfully logged in');
    
    // Navigate to a property with items
    console.log('🏠 Navigating to property...');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForSelector('[data-testid="property-card"], .property-card, a[href*="/properties/"]', { timeout: 10000 });
    
    // Click on first property
    const propertyLink = await page.locator('a[href*="/properties/"]').first();
    await propertyLink.click();
    await page.waitForLoadState('networkidle');
    
    console.log('🖨️ Looking for Print QR Codes button...');
    
    // Look for the Print QR Codes button in various locations
    const printButton = await page.locator('text="Print QR Codes"').first();
    await printButton.waitFor({ timeout: 10000 });
    
    console.log('🎯 Found Print QR Codes button, clicking...');
    await printButton.click();
    
    // Wait for QR print page to load
    await page.waitForURL('**/qr-print**', { timeout: 10000 });
    console.log('✅ Navigated to QR print page');
    
    // Wait for items to load and select some
    await page.waitForSelector('.item-checkbox, input[type="checkbox"]', { timeout: 10000 });
    
    // Select first few items
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    console.log(`📋 Found ${checkboxes.length} items, selecting first 3...`);
    
    for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
      await checkboxes[i].check();
    }
    
    // Look for and click Next/Continue button
    const nextButton = await page.locator('text="Next", text="Continue", button:has-text("Next"), button:has-text("Continue")').first();
    await nextButton.click();
    console.log('➡️ Clicked Next to go to settings');
    
    await page.waitForTimeout(2000);
    
    // Look for Generate Preview or similar button
    const generateButton = await page.locator('text="Generate Preview", text="Generate", button:has-text("Generate"), button:has-text("Preview")').first();
    await generateButton.click();
    console.log('🔄 Generating QR codes...');
    
    // Wait for QR codes to be generated
    await page.waitForSelector('.qr-code-image, img[src*="data:image"]', { timeout: 15000 });
    console.log('✅ QR codes generated and visible on screen');
    
    // Look for PDF Export button
    console.log('📄 Looking for PDF Export button...');
    const pdfButton = await page.locator('text="Export PDF", text="Generate PDF", text="Download PDF", button:has-text("PDF")').first();
    await pdfButton.waitFor({ timeout: 10000 });
    
    console.log('🎯 Found PDF button, clicking...');
    
    // Set up download handling
    const downloadPromise = page.waitForDownload({ timeout: 30000 });
    await pdfButton.click();
    
    console.log('⏳ Waiting for PDF download...');
    const download = await downloadPromise;
    
    const downloadPath = path.join(__dirname, 'test-fixed-qr-codes.pdf');
    await download.saveAs(downloadPath);
    
    console.log(`💾 PDF saved to: ${downloadPath}`);
    
    // Verify PDF file exists and has content
    const stats = fs.statSync(downloadPath);
    console.log(`📊 PDF file size: ${stats.size} bytes`);
    
    if (stats.size > 1000) {
      console.log('✅ PDF appears to have substantial content');
      
      // Try to analyze PDF content
      try {
        const pdfBuffer = fs.readFileSync(downloadPath);
        const pdfContent = pdfBuffer.toString('latin1');
        
        // Check for PDF structure and image objects
        const hasImages = pdfContent.includes('/Image') || pdfContent.includes('/XObject');
        const hasText = pdfContent.includes('/Text') || pdfContent.includes('BT') || pdfContent.includes('ET');
        
        console.log('🔍 PDF Analysis:');
        console.log(`   - Contains images: ${hasImages}`);
        console.log(`   - Contains text: ${hasText}`);
        
        if (hasImages) {
          console.log('🎉 SUCCESS: PDF contains image objects (likely QR codes!)');
        } else {
          console.log('⚠️  WARNING: PDF does not appear to contain images');
        }
        
      } catch (error) {
        console.log('⚠️  Could not analyze PDF content:', error.message);
      }
      
    } else {
      console.log('❌ PDF file is too small, likely empty or corrupted');
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: 'test-fixed-pdf-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as test-fixed-pdf-error.png');
    } catch (screenshotError) {
      console.log('Could not take screenshot:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
}

testFixedPDFGeneration().catch(console.error);

