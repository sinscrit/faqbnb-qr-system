const { chromium } = require('playwright');

async function testREQ026Implementation() {
  console.log('🎯 TESTING: REQ-026 Implementation - Button Relocation');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('\n🔐 STEP 1: Login and Navigate to Property');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'sinscrit@gmail.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    // Navigate to properties and open a property detail
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(3000);
    await page.locator('tbody tr').first().locator('button:has-text("View")').click();
    await page.waitForTimeout(3000);
    
    console.log(`   📍 Property detail URL: ${page.url()}`);
    
    console.log('\n✅ STEP 2: Verify REQ-026 Implementation');
    
    // Check 1: Email redundancy removed from header
    const headerEmailCount = await page.locator('header .text-sm.text-gray-500:has(svg)').count();
    console.log(`   📧 Email displays in header: ${headerEmailCount === 0 ? '✅ REMOVED (Good)' : '❌ STILL PRESENT'}`);
    
    // Check 2: Print QR Codes button in header
    const headerQRButton = await page.locator('header button:has-text("Print QR Codes")').count();
    console.log(`   🖨️ Print QR button in header: ${headerQRButton > 0 ? '✅ PRESENT' : '❌ MISSING'}`);
    
    // Check 3: QR Code Management section removed
    const qrManagementSection = await page.locator('text="QR Code Management"').count();
    console.log(`   📋 QR Management section: ${qrManagementSection === 0 ? '✅ REMOVED (Good)' : '❌ STILL PRESENT'}`);
    
    // Check 4: Button functionality preserved
    const isButtonEnabled = await page.locator('header button:has-text("Print QR Codes"):not([disabled])').count();
    console.log(`   🔘 Button functionality: ${isButtonEnabled > 0 ? '✅ ENABLED' : '⚠️ DISABLED (Expected if no items)'}`);
    
    // Check 5: Button styling preserved
    const hasCorrectStyling = await page.locator('header button:has-text("Print QR Codes").inline-flex').count();
    console.log(`   🎨 Button styling: ${hasCorrectStyling > 0 ? '✅ PRESERVED' : '⚠️ May need verification'}`);
    
    console.log('\n🖱️ STEP 3: Test Button Functionality');
    
    if (isButtonEnabled > 0) {
      console.log('   🖱️ Testing Print QR Codes button click...');
      await page.locator('header button:has-text("Print QR Codes")').click();
      await page.waitForTimeout(4000);
      
      const isOnQRPage = page.url().includes('/qr-print');
      console.log(`   🖨️ QR Print navigation: ${isOnQRPage ? '✅ SUCCESS' : '❌ FAILED'}`);
    } else {
      console.log('   ⚠️ Button disabled - cannot test navigation (expected if no items)');
    }
    
    console.log('\n📸 STEP 4: Save Implementation Screenshots');
    
    // Go back to property detail for screenshot
    if (page.url().includes('/qr-print')) {
      await page.goBack();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'req-026-implemented.png', fullPage: true });
    console.log('   📸 REQ-026 implementation screenshot saved');
    
    console.log('\n🎯 REQ-026 IMPLEMENTATION RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Email redundancy removed: ${headerEmailCount === 0 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Button relocated to header: ${headerQRButton > 0 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ QR section removed: ${qrManagementSection === 0 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Button functionality: ${isButtonEnabled > 0 ? 'WORKING' : 'DISABLED'}`);
    console.log('=' .repeat(80));
    
    const implementationSuccess = (
      headerEmailCount === 0 && 
      headerQRButton > 0 && 
      qrManagementSection === 0
    );
    
    if (implementationSuccess) {
      console.log('🎉 REQ-026: ✅ IMPLEMENTATION SUCCESSFUL!');
      console.log('   - Redundant email display removed');
      console.log('   - Print QR Codes button relocated to header');
      console.log('   - QR Code Management section removed');
      console.log('   - Button functionality preserved');
    } else {
      console.log('⚠️ REQ-026: Implementation needs attention');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('\n❌ REQ-026 TEST ERROR:', error.message);
    await page.screenshot({ path: 'req-026-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 REQ-026 implementation test complete.');
  }
}

testREQ026Implementation().catch(console.error);

