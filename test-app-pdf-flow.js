const playwright = require('playwright');
const fs = require('fs');

async function testApplicationPDFFlow() {
  console.log('🔍 TESTING APPLICATION PDF FLOW');
  console.log('=====================================');
  
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable request/response logging
  page.on('request', request => {
    if (request.url().includes('/api/admin/generate-pdf')) {
      console.log('🔍 PDF_API_REQUEST:', {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/admin/generate-pdf')) {
      console.log('🔍 PDF_API_RESPONSE:', {
        url: response.url(),
        status: response.status(),
        headers: response.headers()
      });
    }
  });
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('PDF_DEBUG') || msg.text().includes('QR_DEBUG')) {
      console.log('🔍 BROWSER_LOG:', msg.text());
    }
  });
  
  try {
    // Step 1: Navigate to application
    console.log('📍 Step 1: Navigating to application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Step 2: Login
    console.log('📍 Step 2: Logging in...');
    await page.fill('input[type="email"]', 'sinscrit@gmail.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Step 3: Navigate to properties
    console.log('📍 Step 3: Navigating to properties...');
    await page.click('a[href*="/dashboard/properties"]');
    await page.waitForLoadState('networkidle');
    
    // Step 4: Find and click on first property
    console.log('📍 Step 4: Selecting first property...');
    const propertyLinks = await page.locator('a[href*="/dashboard/properties/"]').all();
    if (propertyLinks.length === 0) {
      throw new Error('No properties found');
    }
    
    await propertyLinks[0].click();
    await page.waitForLoadState('networkidle');
    
    // Step 5: Click Print QR Codes button
    console.log('📍 Step 5: Clicking Print QR Codes button...');
    await page.click('button:has-text("Print QR Codes")');
    await page.waitForLoadState('networkidle');
    
    // Step 6: Select items (select all)
    console.log('📍 Step 6: Selecting items...');
    await page.click('button:has-text("Select All")');
    await page.click('button:has-text("Configure Print")');
    await page.waitForTimeout(1000);
    
    // Step 7: Generate QR codes
    console.log('📍 Step 7: Generating QR codes...');
    await page.click('button:has-text("Generate QR Codes")');
    await page.waitForTimeout(5000); // Wait for QR generation
    
    // Step 8: Export PDF and capture the request
    console.log('📍 Step 8: Exporting PDF...');
    
    // Wait for the PDF export button to be available
    await page.waitForSelector('button:has-text("Export PDF")', { timeout: 10000 });
    
    // Click the PDF export button
    await page.click('button:has-text("Export PDF")');
    await page.waitForTimeout(1000);
    
    // Click the actual export button in the modal
    await page.waitForSelector('button:has-text("Export PDF")', { timeout: 5000 });
    const exportButtons = await page.locator('button:has-text("Export PDF")').all();
    if (exportButtons.length > 1) {
      await exportButtons[1].click(); // Click the modal export button
    } else {
      await exportButtons[0].click();
    }
    
    // Wait for the PDF request to complete
    await page.waitForTimeout(5000);
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-app-pdf-flow-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: test-app-pdf-flow-error.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testApplicationPDFFlow().catch(console.error);

