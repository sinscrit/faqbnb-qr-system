const { chromium } = require('playwright');

async function testPropertyCreationFix() {
  console.log('🔧 TESTING: Property Creation API Fix');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enhanced console logging for API calls
  page.on('console', msg => {
    if (msg.text().includes('🏠 PROPERTY_CREATE') || 
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
    
    console.log('\n🏠 STEP 2: Navigate to Property Creation');
    await page.goto('http://localhost:3000/dashboard/properties/new');
    await page.waitForTimeout(3000);
    
    console.log('   ✅ Property creation page loaded');
    
    console.log('\n📝 STEP 3: Fill Property Form');
    const testPropertyName = `Fixed Test Property ${Date.now()}`;
    
    // Fill property name
    await page.fill('input[name="nickname"]', testPropertyName);
    console.log(`   ✅ Property name: ${testPropertyName}`);
    
    // Fill description
    await page.fill('textarea[name="description"]', 'Test property with validation fix');
    console.log('   ✅ Description filled');
    
    // Select property type (should be auto-selected, but let's make sure)
    const propertyTypeSelect = page.locator('select[name="propertyType"]');
    const propertyTypeOptions = await propertyTypeSelect.locator('option').count();
    
    if (propertyTypeOptions > 1) {
      await propertyTypeSelect.selectOption({ index: 1 }); // Select first non-empty option
      const selectedValue = await propertyTypeSelect.inputValue();
      console.log(`   ✅ Property type selected: ${selectedValue}`);
    } else {
      console.log('   ⚠️  No property types available');
    }
    
    // Fill optional address fields
    await page.fill('input[name="address"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="state"]', 'TS');
    await page.fill('input[name="zipCode"]', '12345');
    console.log('   ✅ Address fields filled');
    
    console.log('\n🚀 STEP 4: Submit Property');
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
    
    if (currentUrl.includes('/dashboard/properties/') && !currentUrl.includes('/new')) {
      console.log('   🎉 SUCCESS: Redirected to property detail page!');
    } else if (currentUrl.includes('/dashboard/properties') && !currentUrl.includes('/new')) {
      console.log('   🎉 SUCCESS: Redirected to properties list!');
    } else if (currentUrl.includes('/new')) {
      console.log('   ⚠️  Still on creation page - check for errors');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'property-creation-test.png' });
    console.log('   📸 Screenshot saved');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    await page.screenshot({ path: 'property-creation-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 Property creation test complete.');
  }
}

testPropertyCreationFix().catch(console.error);

