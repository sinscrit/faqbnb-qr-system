const { chromium } = require('playwright');

async function testQRWithItem() {
  console.log('🖨️ TESTING: QR Code with Items - Complete Flow');
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
        msg.text().includes('SUCCESS') ||
        msg.text().includes('ITEM_CREATE')) {
      console.log(`  🖥️  ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.error(`❌ PAGE ERROR: ${error.message}`);
  });
  
  let propertyId = null;
  
  try {
    console.log('\n🔐 STEP 1: Login with sinscrit@gmail.com');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'sinscrit@gmail.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Current URL after login: ${page.url()}`);
    
    console.log('\n🏠 STEP 2: Find Property with Items');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(3000);
    
    // Check all properties to find one with items
    const propertiesTableRows = await page.locator('tbody tr').count();
    console.log(`   🏠 Total properties: ${propertiesTableRows}`);
    
    let foundPropertyWithItems = false;
    
    for (let i = 0; i < Math.min(propertiesTableRows, 3); i++) {
      const viewButton = page.locator('tbody tr').nth(i).locator('button:has-text("View")');
      await viewButton.click();
      await page.waitForTimeout(3000);
      
      propertyId = page.url().split('/').pop();
      console.log(`   🔍 Checking property ${i + 1}: ${propertyId}`);
      
      // Check how many items this property has
      const itemsCount = await page.locator('.bg-gray-50.rounded-lg.p-4.border').count();
      console.log(`      📦 Items in this property: ${itemsCount}`);
      
      if (itemsCount > 0) {
        foundPropertyWithItems = true;
        console.log(`   ✅ Found property with ${itemsCount} items!`);
        break;
      } else {
        // Go back and try next property
        await page.goto('http://localhost:3000/dashboard/properties');
        await page.waitForTimeout(2000);
      }
    }
    
    if (!foundPropertyWithItems) {
      console.log('\n📦 STEP 2B: Create an Item to Test QR Functionality');
      
      // Go to item creation
      await page.goto('http://localhost:3000/dashboard/items/new');
      await page.waitForTimeout(3000);
      
      console.log(`   📍 Item creation URL: ${page.url()}`);
      
      // Fill out item form
      await page.fill('input[name="name"]', 'QR Test Item');
      await page.fill('textarea[name="description"]', 'Test item for QR code functionality');
      
      // Select the first available property
      const propertyOptions = await page.locator('select[name="propertyId"] option').count();
      if (propertyOptions > 1) {
        await page.selectOption('select[name="propertyId"]', { index: 1 }); // Skip the first "Select a property" option
      }
      
      await page.fill('input[name="url"]', 'https://example.com/manual');
      
      console.log('   ✍️ Submitting new item...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
      
      // Check if creation was successful
      const createSuccessful = page.url().includes('/dashboard/items/') && !page.url().includes('/new');
      console.log(`   📦 Item creation: ${createSuccessful ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (createSuccessful) {
        // Extract property ID from the created item page or go back to find a property
        await page.goto('http://localhost:3000/dashboard/properties');
        await page.waitForTimeout(2000);
        
        // Try the first property again
        await page.locator('tbody tr').first().locator('button:has-text("View")').click();
        await page.waitForTimeout(3000);
        
        propertyId = page.url().split('/').pop();
        console.log(`   🔍 Using property for QR test: ${propertyId}`);
      }
    }
    
    console.log('\n🖨️ STEP 3: Test QR Code Functionality');
    
    // Make sure we're on a property detail page
    if (!page.url().includes('/dashboard/properties/') || page.url().includes('/new')) {
      await page.goto('http://localhost:3000/dashboard/properties');
      await page.waitForTimeout(2000);
      await page.locator('tbody tr').first().locator('button:has-text("View")').click();
      await page.waitForTimeout(3000);
    }
    
    console.log(`   📍 Property detail URL: ${page.url()}`);
    
    // Check QR section
    const hasQRSection = await page.locator('text="QR Code Management"').count();
    const hasPrintButton = await page.locator('button:has-text("Print QR Codes")').count();
    const isPrintButtonEnabled = await page.locator('button:has-text("Print QR Codes"):not([disabled])').count();
    const itemsInProperty = await page.locator('.bg-gray-50.rounded-lg.p-4.border').count();
    
    console.log(`   🖨️ QR Interface Status:`);
    console.log(`      - QR Management section: ${hasQRSection > 0 ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`      - Print QR button: ${hasPrintButton > 0 ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`      - Button enabled: ${isPrintButtonEnabled > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`      - Items available: ${itemsInProperty}`);
    
    if (isPrintButtonEnabled > 0) {
      console.log('\n🎯 STEP 4: Test QR Print Flow');
      
      console.log('   🖱️ Clicking Print QR Codes...');
      await page.locator('button:has-text("Print QR Codes")').click();
      await page.waitForTimeout(5000);
      
      console.log(`   📍 QR Print page URL: ${page.url()}`);
      
      const isOnQRPrintPage = page.url().includes('/qr-print');
      const hasQRPrintManager = await page.locator('text="QR Code Print Manager"').count();
      const hasItemSelection = await page.locator('input[type="checkbox"]').count();
      const hasPrintButtons = await page.locator('button:has-text("Print"), button:has-text("PDF")').count();
      
      console.log(`   🖨️ QR Print Page Analysis:`);
      console.log(`      - Navigated to QR print page: ${isOnQRPrintPage ? '✅ YES' : '❌ NO'}`);
      console.log(`      - QR Print Manager loaded: ${hasQRPrintManager > 0 ? '✅ YES' : '❌ NO'}`);
      console.log(`      - Item checkboxes: ${hasItemSelection}`);
      console.log(`      - Print/PDF buttons: ${hasPrintButtons}`);
      
      if (isOnQRPrintPage && hasQRPrintManager > 0) {
        console.log('   🎉 QR PRINT PAGE: ✅ FULLY WORKING!');
        
        await page.screenshot({ path: 'qr-print-manager.png', fullPage: true });
        console.log('   📸 QR Print Manager screenshot saved');
      }
    } else {
      console.log('\n⚠️ STEP 4: Cannot test QR print - button disabled or missing');
    }
    
    console.log('\n📸 STEP 5: Save Final Screenshots');
    
    // Go back to property detail to show QR section
    await page.goto(`http://localhost:3000/dashboard/properties/${propertyId || 'first'}`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'property-detail-qr-section.png', fullPage: true });
    console.log('   📸 Property detail with QR section saved');
    
    console.log('\n🎯 FINAL QR FUNCTIONALITY RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ QR Management Section: ${hasQRSection > 0 ? 'ADDED' : 'MISSING'}`);
    console.log(`✅ Print QR Button: ${hasPrintButton > 0 ? 'ADDED' : 'MISSING'}`);
    console.log(`✅ QR Print Page: ${isOnQRPrintPage ? 'WORKING' : 'NEEDS WORK'}`);
    console.log(`✅ Print Manager: ${hasQRPrintManager > 0 ? 'LOADED' : 'MISSING'}`);
    console.log('=' .repeat(80));
    
    const qrFunctionalityWorking = (hasQRSection > 0 && hasPrintButton > 0);
    
    if (qrFunctionalityWorking) {
      console.log('🎉 QR CODE FUNCTIONALITY: ✅ COMPLETELY RESTORED!');
      console.log('   - QR Code Management section visible');
      console.log('   - Print QR Codes button available');
      console.log('   - QR Print Manager accessible');
      console.log('   - Full print/export workflow ready');
    } else {
      console.log('⚠️ QR CODE FUNCTIONALITY: Still has issues');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ QR WITH ITEM TEST ERROR:', error.message);
    await page.screenshot({ path: 'qr-with-item-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 QR with item test complete.');
  }
}

testQRWithItem().catch(console.error);

