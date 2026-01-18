const { chromium } = require('playwright');

async function testItemCreationFix() {
  console.log('📦 TESTING: Item Creation Process');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enhanced console logging for API calls
  page.on('console', msg => {
    if (msg.text().includes('📦 ITEM_CREATE') || 
        msg.text().includes('API request') ||
        msg.text().includes('ERROR') ||
        msg.text().includes('SUCCESS')) {
      console.log(`  🖥️  ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.error(`❌ PAGE ERROR: ${error.message}`);
  });
  
  try {
    console.log('\n🔐 STEP 1: Authenticate');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'raphajunk@outlook.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('   ✅ Authenticated');
    
    console.log('\n📦 STEP 2: Navigate to Item Creation');
    await page.goto('http://localhost:3000/dashboard/items/new');
    await page.waitForTimeout(3000);
    
    console.log('   ✅ Item creation page loaded');
    
    console.log('\n📝 STEP 3: Fill Item Form');
    const testItemName = `Fixed Test Item ${Date.now()}`;
    
    // Fill item name
    await page.fill('input[name="name"]', testItemName);
    console.log(`   ✅ Item name: ${testItemName}`);
    
    // Fill description
    await page.fill('textarea[name="description"]', 'Test item with validation fix');
    console.log('   ✅ Description filled');
    
    // Select property (should have properties available from previous test)
    const propertySelect = page.locator('select[name="propertyId"]');
    const propertyOptions = await propertySelect.locator('option').count();
    
    if (propertyOptions > 1) {
      await propertySelect.selectOption({ index: 1 }); // Select first non-empty option
      const selectedValue = await propertySelect.inputValue();
      console.log(`   ✅ Property selected: ${selectedValue}`);
    } else {
      console.log('   ⚠️  No properties available');
    }
    
    // Fill optional URL
    await page.fill('input[name="url"]', 'https://example.com/test-item');
    console.log('   ✅ URL filled');
    
    console.log('\n🚀 STEP 4: Submit Item');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    console.log('\n📊 STEP 5: Check Result');
    const currentUrl = page.url();
    console.log(`   📍 Current URL: ${currentUrl}`);
    
    // Check for success or error messages
    const errorMessage = await page.locator('.bg-red-50, .text-red-700').textContent().catch(() => null);
    const successMessage = await page.locator('.bg-green-100, .text-green-600').textContent().catch(() => null);
    
    if (errorMessage) {
      console.log(`   ❌ Error message: ${errorMessage}`);
    }
    
    if (successMessage) {
      console.log(`   ✅ Success message: ${successMessage}`);
    }
    
    if (currentUrl.includes('/dashboard/items/') && !currentUrl.includes('/new')) {
      console.log('   🎉 SUCCESS: Redirected to item detail page!');
    } else if (currentUrl.includes('/dashboard/items') && !currentUrl.includes('/new')) {
      console.log('   🎉 SUCCESS: Redirected to items list!');
    } else if (currentUrl.includes('/new')) {
      console.log('   ⚠️  Still on creation page - check for errors');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'item-creation-test.png' });
    console.log('   📸 Screenshot saved');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    await page.screenshot({ path: 'item-creation-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 Item creation test complete.');
  }
}

testItemCreationFix().catch(console.error);

