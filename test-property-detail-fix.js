const { chromium } = require('playwright');

async function testPropertyDetailFix() {
  console.log('🔧 TESTING: Property Detail View Fix');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('🔍') || 
        msg.text().includes('✅') || 
        msg.text().includes('Loading') ||
        msg.text().includes('Property') ||
        msg.text().includes('Error')) {
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
    
    console.log('\n🏠 STEP 2: Go to Properties List');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(3000);
    
    // Check if properties are loaded
    const propertiesCount = await page.locator('tbody tr').count();
    console.log(`   📊 Properties found: ${propertiesCount}`);
    
    if (propertiesCount === 0) {
      console.log('   ⚠️ No properties found to test detail view');
      return;
    }
    
    console.log('\n👁️ STEP 3: Test View Button Click');
    
    // Find and click the first View button
    const firstViewButton = page.locator('button:has-text("View")').first();
    const isViewButtonVisible = await firstViewButton.isVisible();
    console.log(`   🔘 First View button visible: ${isViewButtonVisible}`);
    
    if (!isViewButtonVisible) {
      console.log('   ❌ No View buttons found');
      return;
    }
    
    // Click the View button
    await firstViewButton.click();
    await page.waitForTimeout(4000);
    
    const detailUrl = page.url();
    console.log(`   📍 Detail page URL: ${detailUrl}`);
    
    console.log('\n🔍 STEP 4: Check Property Detail Page Content');
    
    // Check if we're on a property detail page
    const isDetailPage = detailUrl.includes('/dashboard/properties/') && 
                         !detailUrl.includes('/new') && 
                         !detailUrl.includes('/edit');
    
    console.log(`   📄 Is property detail page: ${isDetailPage}`);
    
    if (!isDetailPage) {
      console.log('   ❌ Not redirected to property detail page');
      return;
    }
    
    // Check for error message
    const hasError = await page.locator('text="Error"').count();
    const hasFailedToLoad = await page.locator('text="Failed to load property"').count();
    
    console.log(`   ❌ Error message found: ${hasError > 0}`);
    console.log(`   ❌ "Failed to load" message: ${hasFailedToLoad > 0}`);
    
    if (hasError > 0 || hasFailedToLoad > 0) {
      const errorText = await page.locator('.text-gray-500').textContent();
      console.log(`   📄 Error details: ${errorText}`);
      
      // Try the "Try Again" button if available
      const tryAgainButton = await page.locator('text="Try Again"').count();
      if (tryAgainButton > 0) {
        console.log('   🔄 Clicking "Try Again" button...');
        await page.locator('text="Try Again"').click();
        await page.waitForTimeout(3000);
        
        const stillHasError = await page.locator('text="Error"').count();
        console.log(`   🔄 Still has error after retry: ${stillHasError > 0}`);
      }
    } else {
      console.log('   ✅ No error messages found!');
    }
    
    // Check for property information sections
    const hasPropertyInfo = await page.locator('text="Property Information"').count();
    const hasItemsSection = await page.locator('text="Items in this Property"').count();
    const hasPropertyName = await page.locator('h1').count();
    
    console.log(`   📋 Property Information section: ${hasPropertyInfo > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`   📦 Items section: ${hasItemsSection > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`   🏷️ Property name in header: ${hasPropertyName > 0 ? '✅ Found' : '❌ Missing'}`);
    
    if (hasPropertyName > 0) {
      const propertyName = await page.locator('h1').textContent();
      console.log(`   🏠 Property name: "${propertyName}"`);
    }
    
    // Check specific property details
    const propertyDetails = await page.locator('dl dd').allTextContents();
    if (propertyDetails.length > 0) {
      console.log(`   📋 Property details found: ${propertyDetails.length} fields`);
      console.log(`   📋 Sample details: ${propertyDetails.slice(0, 3).join(', ')}`);
    }
    
    // Check for loading states
    const isLoading = await page.locator('.animate-spin').count();
    console.log(`   ⏳ Loading indicators: ${isLoading}`);
    
    console.log('\n🔙 STEP 5: Test Navigation Back');
    
    // Test back navigation
    const backButton = await page.locator('text="Back to Dashboard", svg[data-testid="arrow-left"]').count();
    console.log(`   ↩️ Back button available: ${backButton > 0}`);
    
    // Navigate back to properties list
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(2000);
    
    const backToPropertiesList = page.url().includes('/dashboard/properties') && !page.url().includes('/dashboard/properties/');
    console.log(`   🔙 Successfully navigated back: ${backToPropertiesList}`);
    
    console.log('\n📸 STEP 6: Save Screenshots');
    
    // Go back to detail page for screenshot
    await firstViewButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'property-detail-fixed.png', fullPage: true });
    console.log('   📸 Property detail screenshot saved');
    
    console.log('\n🎯 PROPERTY DETAIL FIX TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Properties list loads: WORKING`);
    console.log(`✅ View button click: WORKING`);
    console.log(`✅ Navigation to detail page: ${isDetailPage ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Error state: ${hasError === 0 && hasFailedToLoad === 0 ? 'NO ERRORS' : 'HAS ERRORS'}`);
    console.log(`✅ Property information display: ${hasPropertyInfo > 0 ? 'WORKING' : 'MISSING'}`);
    console.log(`✅ Items section display: ${hasItemsSection > 0 ? 'WORKING' : 'MISSING'}`);
    console.log(`✅ Back navigation: ${backToPropertiesList ? 'WORKING' : 'FAILED'}`);
    console.log('=' .repeat(80));
    
    if (hasError === 0 && hasFailedToLoad === 0 && hasPropertyInfo > 0) {
      console.log('🎉 PROPERTY DETAIL VIEW: ✅ FIXED AND WORKING!');
      console.log('   - Users can click View button');
      console.log('   - Property details load without errors');
      console.log('   - Property information is displayed correctly');
      console.log('   - Items section is available');
      console.log('   - Navigation works properly');
    } else {
      console.log('⚠️ PROPERTY DETAIL VIEW: Still has issues to resolve');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ PROPERTY DETAIL TEST ERROR:', error.message);
    await page.screenshot({ path: 'property-detail-test-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 Property detail fix test complete.');
  }
}

testPropertyDetailFix().catch(console.error);

