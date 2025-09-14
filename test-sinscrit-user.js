const { chromium } = require('playwright');

async function testSinscritUser() {
  console.log('👤 TESTING: New User - sinscrit@gmail.com');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('DEBUG') || 
        msg.text().includes('EMERGENCY') ||
        msg.text().includes('Making API request') ||
        msg.text().includes('SUCCESS') ||
        msg.text().includes('UNIFIED') ||
        msg.text().includes('REDIRECT')) {
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
    await page.waitForTimeout(5000);
    
    console.log(`   📍 Current URL after login: ${page.url()}`);
    console.log('   ✅ Login attempted');
    
    console.log('\n🏠 STEP 2: Navigate to Dashboard');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    console.log(`   📍 Dashboard URL: ${page.url()}`);
    
    // Check what type of dashboard loads
    const isDashboard = page.url().includes('/dashboard');
    const isAdmin = page.url().includes('/admin');
    const hasAdminText = await page.locator('text="FAQBNB Admin"').count();
    const hasUserText = await page.locator('text="FAQBNB Dashboard"').count();
    
    console.log(`   🎛️  Dashboard Type:`);
    console.log(`      - Is Dashboard URL: ${isDashboard}`);
    console.log(`      - Is Admin URL: ${isAdmin}`);
    console.log(`      - Has Admin header: ${hasAdminText > 0}`);
    console.log(`      - Has User header: ${hasUserText > 0}`);
    
    console.log('\n🏠 STEP 3: Test Properties Navigation');
    
    // Try to go to properties via navigation
    const propertiesNavCount = await page.locator('text="🏠Properties", text="Properties"').count();
    console.log(`   🧭 Properties navigation available: ${propertiesNavCount > 0}`);
    
    if (propertiesNavCount > 0) {
      console.log('   🔗 Clicking Properties navigation...');
      await page.locator('text="🏠Properties", text="Properties"').first().click();
      await page.waitForTimeout(4000);
      
      console.log(`   📍 After Properties click: ${page.url()}`);
      
      // Check for the unwanted "Unified" screen
      const hasUnifiedScreen = await page.locator('text="Unified Properties Management"').count();
      const hasRedirectMessage = await page.locator('text="Properties management has been unified"').count();
      const hasNewLocationLink = await page.locator('text="New Location: /dashboard/properties"').count();
      
      console.log(`   🚨 UNWANTED UNIFIED SCREEN CHECK:`);
      console.log(`      - "Unified Properties Management": ${hasUnifiedScreen > 0 ? '❌ FOUND' : '✅ NOT FOUND'}`);
      console.log(`      - Redirect message: ${hasRedirectMessage > 0 ? '❌ FOUND' : '✅ NOT FOUND'}`);
      console.log(`      - New Location link: ${hasNewLocationLink > 0 ? '❌ FOUND' : '✅ NOT FOUND'}`);
      
      if (hasUnifiedScreen > 0) {
        console.log('   🚨 PROBLEM: Unwanted unified screen is showing!');
        
        // Take screenshot of the problem
        await page.screenshot({ path: 'unwanted-unified-screen.png', fullPage: true });
        console.log('   📸 Screenshot of unwanted screen saved');
        
        // Try to get the link to continue
        if (hasNewLocationLink > 0) {
          console.log('   🔗 Clicking New Location link to continue...');
          await page.locator('text="New Location: /dashboard/properties"').click();
          await page.waitForTimeout(3000);
          console.log(`   📍 After clicking link: ${page.url()}`);
        }
      }
    }
    
    console.log('\n📦 STEP 4: Test Items Navigation');
    
    // Try to navigate to items
    await page.goto('http://localhost:3000/dashboard/items');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Items page URL: ${page.url()}`);
    
    // Check for access denied on items
    const itemsAccessDenied = await page.locator('text="Access Denied"').count();
    const itemsPermissionDenied = await page.locator('text="You do not have permission"').count();
    
    console.log(`   📦 Items Access:`);
    console.log(`      - Access denied messages: ${itemsAccessDenied}`);
    console.log(`      - Permission denied messages: ${itemsPermissionDenied}`);
    
    if (itemsAccessDenied > 0 || itemsPermissionDenied > 0) {
      console.log('   ❌ Items access denied for this user');
    } else {
      console.log('   ✅ Items access granted');
    }
    
    console.log('\n🏠 STEP 5: Test Properties Page Directly');
    
    // Navigate directly to properties page
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Properties page URL: ${page.url()}`);
    
    // Check if we get redirected or see the unwanted screen
    const finalUnifiedCheck = await page.locator('text="Unified Properties Management"').count();
    const propertiesAccessDenied = await page.locator('text="Access Denied"').count();
    const hasPropertiesTable = await page.locator('table').count();
    const hasAddPropertyButton = await page.locator('text="Add Property"').count();
    
    console.log(`   🏠 Properties Page Status:`);
    console.log(`      - Unwanted unified screen: ${finalUnifiedCheck > 0 ? '❌ PRESENT' : '✅ ABSENT'}`);
    console.log(`      - Access denied: ${propertiesAccessDenied > 0 ? '❌ DENIED' : '✅ ALLOWED'}`);
    console.log(`      - Properties table: ${hasPropertiesTable > 0 ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`      - Add Property button: ${hasAddPropertyButton > 0 ? '✅ FOUND' : '❌ MISSING'}`);
    
    console.log('\n📸 STEP 6: Save Screenshots');
    await page.screenshot({ path: 'sinscrit-user-test.png', fullPage: true });
    console.log('   📸 Final screenshot saved');
    
    console.log('\n🎯 SINSCRIT USER TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Login: ${page.url().includes('dashboard') ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Dashboard access: ${isDashboard ? 'WORKING' : 'PROBLEM'}`);
    console.log(`❌ Unwanted unified screen: ${finalUnifiedCheck > 0 ? 'APPEARS' : 'ABSENT'}`);
    console.log(`✅ Properties access: ${propertiesAccessDenied === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log(`✅ Items access: ${itemsAccessDenied === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log('=' .repeat(80));
    
    if (finalUnifiedCheck > 0) {
      console.log('🚨 PROBLEM IDENTIFIED: Unwanted "Unified Properties Management" screen needs to be removed!');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ SINSCRIT USER TEST ERROR:', error.message);
    await page.screenshot({ path: 'sinscrit-user-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 Sinscrit user test complete.');
  }
}

testSinscritUser().catch(console.error);

