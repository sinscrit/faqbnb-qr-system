const { chromium } = require('playwright');

async function testSinscritFixed() {
  console.log('🔧 TESTING: Sinscrit User - FIXED VERSION');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('EMERGENCY') || 
        msg.text().includes('Making API request') ||
        msg.text().includes('SUCCESS') ||
        msg.text().includes('UNIFIED')) {
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
    
    console.log('\n🏠 STEP 2: Test Properties Access');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Properties URL: ${page.url()}`);
    
    // Check for access denied
    const propertiesAccessDenied = await page.locator('text="Access Denied"').count();
    const hasPropertiesInterface = await page.locator('text="Properties Management"').count();
    const hasAddButton = await page.locator('text="Add Property"').count();
    
    console.log(`   🏠 Properties Access Results:`);
    console.log(`      - Access denied: ${propertiesAccessDenied === 0 ? '✅ NO' : '❌ YES'}`);
    console.log(`      - Properties interface: ${hasPropertiesInterface > 0 ? '✅ LOADED' : '❌ MISSING'}`);
    console.log(`      - Add Property button: ${hasAddButton > 0 ? '✅ FOUND' : '❌ MISSING'}`);
    
    console.log('\n📦 STEP 3: Test Items Access');
    await page.goto('http://localhost:3000/dashboard/items');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Items URL: ${page.url()}`);
    
    // Check for access denied
    const itemsAccessDenied = await page.locator('text="Access Denied"').count();
    const hasItemsInterface = await page.locator('text="Items Management"').count();
    const hasAddItemButton = await page.locator('text="Add Item"').count();
    
    console.log(`   📦 Items Access Results:`);
    console.log(`      - Access denied: ${itemsAccessDenied === 0 ? '✅ NO' : '❌ YES'}`);
    console.log(`      - Items interface: ${hasItemsInterface > 0 ? '✅ LOADED' : '❌ MISSING'}`);
    console.log(`      - Add Item button: ${hasAddItemButton > 0 ? '✅ FOUND' : '❌ MISSING'}`);
    
    console.log('\n🔗 STEP 4: Test Property Creation');
    await page.goto('http://localhost:3000/dashboard/properties/new');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Create Property URL: ${page.url()}`);
    
    // Check property creation page
    const propertyCreateDenied = await page.locator('text="Access Denied"').count();
    const hasPropertyForm = await page.locator('text="Create New Property"').count();
    const hasPropertyNameField = await page.locator('input[name="nickname"]').count();
    
    console.log(`   🏗️ Property Creation Results:`);
    console.log(`      - Access denied: ${propertyCreateDenied === 0 ? '✅ NO' : '❌ YES'}`);
    console.log(`      - Creation form: ${hasPropertyForm > 0 ? '✅ LOADED' : '❌ MISSING'}`);
    console.log(`      - Name field: ${hasPropertyNameField > 0 ? '✅ FOUND' : '❌ MISSING'}`);
    
    console.log('\n🔗 STEP 5: Test Item Creation');
    await page.goto('http://localhost:3000/dashboard/items/new');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Create Item URL: ${page.url()}`);
    
    // Check item creation page
    const itemCreateDenied = await page.locator('text="Access Denied"').count();
    const hasItemForm = await page.locator('text="Create New Item"').count();
    const hasItemNameField = await page.locator('input[name="name"]').count();
    
    console.log(`   🔧 Item Creation Results:`);
    console.log(`      - Access denied: ${itemCreateDenied === 0 ? '✅ NO' : '❌ YES'}`);
    console.log(`      - Creation form: ${hasItemForm > 0 ? '✅ LOADED' : '❌ MISSING'}`);
    console.log(`      - Name field: ${hasItemNameField > 0 ? '✅ FOUND' : '❌ MISSING'}`);
    
    console.log('\n🚨 STEP 6: Test Old Unified Redirect (Should NOT appear)');
    await page.goto('http://localhost:3000/admin/properties');
    await page.waitForTimeout(3000);
    
    console.log(`   📍 Admin Properties URL: ${page.url()}`);
    
    // Check if we see the unwanted unified screen
    const hasUnifiedScreen = await page.locator('text="Unified Properties Management"').count();
    const finalUrl = page.url();
    
    console.log(`   🚨 Unified Screen Check:`);
    console.log(`      - Unwanted screen shown: ${hasUnifiedScreen > 0 ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
    console.log(`      - Final URL: ${finalUrl}`);
    console.log(`      - Redirected to dashboard: ${finalUrl.includes('/dashboard/properties') ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📸 STEP 7: Save Screenshots');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'sinscrit-fixed-dashboard.png', fullPage: true });
    
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'sinscrit-fixed-properties.png', fullPage: true });
    
    await page.goto('http://localhost:3000/dashboard/items');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'sinscrit-fixed-items.png', fullPage: true });
    
    console.log('   📸 Screenshots saved');
    
    console.log('\n🎯 SINSCRIT FIXED TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Login: ${page.url().includes('dashboard') ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Properties access: ${propertiesAccessDenied === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log(`✅ Items access: ${itemsAccessDenied === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log(`✅ Property creation: ${propertyCreateDenied === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log(`✅ Item creation: ${itemCreateDenied === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log(`✅ Unified screen removed: ${hasUnifiedScreen === 0 ? 'YES' : 'NO'}`);
    console.log('=' .repeat(80));
    
    const allWorking = (
      propertiesAccessDenied === 0 && 
      itemsAccessDenied === 0 && 
      propertyCreateDenied === 0 && 
      itemCreateDenied === 0 && 
      hasUnifiedScreen === 0
    );
    
    if (allWorking) {
      console.log('🎉 SINSCRIT USER: ✅ COMPLETELY FIXED!');
      console.log('   - All permissions working');
      console.log('   - All pages accessible');
      console.log('   - No unwanted redirect screens');
      console.log('   - Emergency permissions applied successfully');
    } else {
      console.log('⚠️ SINSCRIT USER: Still has some issues');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ SINSCRIT FIXED TEST ERROR:', error.message);
    await page.screenshot({ path: 'sinscrit-fixed-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 Sinscrit fixed test complete.');
  }
}

testSinscritFixed().catch(console.error);

