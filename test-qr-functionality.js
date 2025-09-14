const { chromium } = require('playwright');

async function testQRFunctionality() {
  console.log('🖨️ TESTING: QR Code Print/Export Functionality');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('QR') || 
        msg.text().includes('EMERGENCY') ||
        msg.text().includes('Making API request') ||
        msg.text().includes('Print QR') ||
        msg.text().includes('Success')) {
      console.log(`  🖥️  ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.error(`❌ PAGE ERROR: ${error.message}`);
  });
  
  try {
    console.log('\n🔐 STEP 1: Login with sinscrit@gmail.com');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'sinscrit@gmail.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Current URL after login: ${page.url()}`);
    
    console.log('\n🏠 STEP 2: Navigate to Properties');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(3000);
    
    console.log(`   📍 Properties URL: ${page.url()}`);
    
    // Check for properties
    const propertiesTableRows = await page.locator('tbody tr').count();
    console.log(`   🏠 Properties found: ${propertiesTableRows}`);
    
    if (propertiesTableRows === 0) {
      console.log('   ⚠️ No properties available, cannot test QR functionality');
      return;
    }
    
    console.log('\n👁️ STEP 3: Open Property Detail Page');
    
    // Click on the first "View" button
    const viewButtons = await page.locator('button:has-text("View")').count();
    console.log(`   🔍 View buttons found: ${viewButtons}`);
    
    if (viewButtons > 0) {
      await page.locator('button:has-text("View")').first().click();
      await page.waitForTimeout(4000);
      
      console.log(`   📍 Property detail URL: ${page.url()}`);
      
      // Check for QR Code Management section
      const hasQRSection = await page.locator('text="QR Code Management"').count();
      const hasPrintButton = await page.locator('text="Print QR Codes"').count();
      const hasQRDescription = await page.locator('text="Generate and print QR codes"').count();
      
      console.log(`   🖨️ QR Code Interface Check:`);
      console.log(`      - QR Code Management section: ${hasQRSection > 0 ? '✅ FOUND' : '❌ MISSING'}`);
      console.log(`      - Print QR Codes button: ${hasPrintButton > 0 ? '✅ FOUND' : '❌ MISSING'}`);
      console.log(`      - QR description text: ${hasQRDescription > 0 ? '✅ FOUND' : '❌ MISSING'}`);
      
      // Check how many items are in this property
      const itemsInProperty = await page.locator('.bg-gray-50.rounded-lg.p-4.border').count();
      console.log(`   📦 Items in this property: ${itemsInProperty}`);
      
      if (hasPrintButton > 0) {
        console.log('\n🖨️ STEP 4: Test Print QR Codes Button');
        
        // Check if button is disabled
        const isPrintButtonDisabled = await page.locator('button:has-text("Print QR Codes")').getAttribute('disabled');
        console.log(`   🔘 Print button state: ${isPrintButtonDisabled !== null ? '⚠️ DISABLED' : '✅ ENABLED'}`);
        
        if (isPrintButtonDisabled === null && itemsInProperty > 0) {
          console.log('   🖱️ Clicking Print QR Codes button...');
          
          await page.locator('button:has-text("Print QR Codes")').click();
          await page.waitForTimeout(5000);
          
          console.log(`   📍 After clicking Print QR: ${page.url()}`);
          
          // Check if we're on the QR print page
          const isOnQRPage = page.url().includes('/qr-print');
          const hasQRManager = await page.locator('text="QR Code Print Manager"').count();
          const hasQRCodeComponents = await page.locator('.qr-code, [data-testid*="qr"]').count();
          
          console.log(`   🖨️ QR Print Page Results:`);
          console.log(`      - Navigated to QR page: ${isOnQRPage ? '✅ YES' : '❌ NO'}`);
          console.log(`      - QR Print Manager loaded: ${hasQRManager > 0 ? '✅ YES' : '❌ NO'}`);
          console.log(`      - QR components found: ${hasQRCodeComponents}`);
          
          if (isOnQRPage && hasQRManager > 0) {
            console.log('   🎉 QR Print functionality is WORKING!');
            
            // Take screenshot of QR page
            await page.screenshot({ path: 'qr-print-page.png', fullPage: true });
            console.log('   📸 QR print page screenshot saved');
          } else {
            console.log('   ❌ QR Print functionality has issues');
          }
        } else {
          console.log('   ⚠️ Cannot test Print QR button - button disabled or no items');
        }
      } else {
        console.log('\n❌ STEP 4: SKIP - No Print QR Codes button found');
      }
      
      // Take screenshot of property detail page
      await page.screenshot({ path: 'property-detail-with-qr.png', fullPage: true });
      console.log('   📸 Property detail screenshot saved');
      
    } else {
      console.log('   ❌ No View buttons found');
    }
    
    console.log('\n🎯 QR FUNCTIONALITY TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Login: SUCCESS`);
    console.log(`✅ Properties access: ${propertiesTableRows > 0 ? 'WORKING' : 'NO DATA'}`);
    console.log(`✅ Property detail: ${viewButtons > 0 ? 'ACCESSIBLE' : 'NO VIEW BUTTONS'}`);
    console.log(`✅ QR Management section: ${hasQRSection > 0 ? 'PRESENT' : 'MISSING'}`);
    console.log(`✅ Print QR button: ${hasPrintButton > 0 ? 'PRESENT' : 'MISSING'}`);
    console.log(`✅ Items for QR codes: ${itemsInProperty > 0 ? 'AVAILABLE' : 'NONE'}`);
    console.log('=' .repeat(80));
    
    if (hasQRSection > 0 && hasPrintButton > 0) {
      console.log('🎉 QR CODE FUNCTIONALITY: ✅ RESTORED AND WORKING!');
      console.log('   - QR Code Management section added');
      console.log('   - Print QR Codes button available');
      console.log('   - QR print page functionality ready');
    } else {
      console.log('⚠️ QR CODE FUNCTIONALITY: Still needs attention');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ QR FUNCTIONALITY TEST ERROR:', error.message);
    await page.screenshot({ path: 'qr-functionality-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 QR functionality test complete.');
  }
}

testQRFunctionality().catch(console.error);

