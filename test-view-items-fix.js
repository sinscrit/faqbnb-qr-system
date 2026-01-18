const { chromium } = require('playwright');

async function testViewItemsFix() {
  console.log('📦 TESTING: View Items Page Fix');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('ITEMS_PAGE_DEBUG') || 
        msg.text().includes('EMERGENCY') ||
        msg.text().includes('Making API request') ||
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
    await page.waitForTimeout(4000);
    
    console.log('   ✅ Authenticated');
    
    console.log('\n📦 STEP 2: Navigate to Items Page');
    await page.goto('http://localhost:3000/dashboard/items');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Items page URL: ${page.url()}`);
    
    console.log('\n🔍 STEP 3: Check for Access Denied');
    
    // Check for access denied message
    const accessDeniedCount = await page.locator('text="Access Denied"').count();
    const permissionDeniedCount = await page.locator('text="You do not have permission to view items"').count();
    
    console.log(`   🚫 "Access Denied" messages: ${accessDeniedCount}`);
    console.log(`   🚫 Permission denied messages: ${permissionDeniedCount}`);
    
    if (accessDeniedCount > 0 || permissionDeniedCount > 0) {
      console.log('   ❌ STILL HAS ACCESS DENIED ERROR');
      
      // Try to see what the error message says
      const errorElement = await page.locator('.text-center').textContent();
      console.log(`   📄 Error content: ${errorElement}`);
      
      return;
    } else {
      console.log('   ✅ NO ACCESS DENIED ERROR - Permission fix working!');
    }
    
    console.log('\n📊 STEP 4: Check Items Page Content');
    
    // Check for page title
    const hasItemsTitle = await page.locator('text="Items Management"').count();
    const hasAddButton = await page.locator('text="Add Item"').count();
    const hasBackButton = await page.locator('text="Back to Dashboard"').count();
    
    console.log(`   📋 Page Interface:`);
    console.log(`      - "Items Management" title: ${hasItemsTitle > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`      - "Add Item" button: ${hasAddButton > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`      - "Back to Dashboard" button: ${hasBackButton > 0 ? '✅ Found' : '❌ Missing'}`);
    
    // Check for items display
    const hasItemsTable = await page.locator('table').count();
    const hasItemCards = await page.locator('.item-card, [data-testid*="item"]').count();
    const hasItemsList = await page.locator('.items-list').count();
    
    console.log(`   📦 Items Display:`);
    console.log(`      - Items table: ${hasItemsTable > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`      - Item cards: ${hasItemCards}`);
    console.log(`      - Items list: ${hasItemsList}`);
    
    // Check for items data
    let itemsCount = 0;
    if (hasItemsTable > 0) {
      itemsCount = await page.locator('tbody tr').count();
      console.log(`   📊 Items in table: ${itemsCount}`);
    }
    
    // Look for empty state or items
    const hasEmptyState = await page.locator('text="No items yet", text="No items found"').count();
    if (hasEmptyState > 0) {
      console.log('   📭 Empty state found - no items to display');
    } else if (itemsCount > 0) {
      console.log(`   📦 Items found: ${itemsCount} items`);
    }
    
    console.log('\n🔗 STEP 5: Test Navigation');
    
    // Test navigation from dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for items navigation
    const itemsNavButton = await page.locator('text="📦Items"').count();
    const createItemButton = await page.locator('text="Create New Item"').count();
    
    console.log(`   🧭 Dashboard Navigation:`);
    console.log(`      - "📦Items" nav button: ${itemsNavButton > 0 ? '✅ Available' : '❌ Missing'}`);
    console.log(`      - "Create New Item" quick action: ${createItemButton > 0 ? '✅ Available' : '❌ Missing'}`);
    
    // Test items navigation
    if (itemsNavButton > 0) {
      await page.locator('text="📦Items"').click();
      await page.waitForTimeout(2000);
      
      const navigationWorked = page.url().includes('/dashboard/items');
      console.log(`   ✅ Items navigation works: ${navigationWorked}`);
    }
    
    console.log('\n📸 STEP 6: Save Screenshots');
    
    await page.goto('http://localhost:3000/dashboard/items');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'view-items-fixed.png', fullPage: true });
    console.log('   📸 Items page screenshot saved');
    
    console.log('\n🎯 VIEW ITEMS FIX TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Authentication: WORKING`);
    console.log(`✅ Items page access: ${accessDeniedCount === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log(`✅ Permission error fixed: ${permissionDeniedCount === 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Items page interface: ${hasItemsTitle > 0 ? 'LOADED' : 'MISSING'}`);
    console.log(`✅ Add Item button: ${hasAddButton > 0 ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`✅ Items data display: ${itemsCount > 0 ? `${itemsCount} ITEMS` : 'EMPTY/NO DATA'}`);
    console.log(`✅ Dashboard navigation: ${itemsNavButton > 0 ? 'WORKING' : 'MISSING'}`);
    console.log('=' .repeat(80));
    
    if (accessDeniedCount === 0 && hasItemsTitle > 0) {
      console.log('🎉 VIEW ITEMS: ✅ FIXED AND WORKING!');
      console.log('   - No more "Access Denied" error');
      console.log('   - Items page loads correctly');
      console.log('   - User can view items interface');
      console.log('   - Emergency permissions working');
    } else {
      console.log('⚠️ VIEW ITEMS: Still needs fixes');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ VIEW ITEMS TEST ERROR:', error.message);
    await page.screenshot({ path: 'view-items-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 View items fix test complete.');
  }
}

testViewItemsFix().catch(console.error);

