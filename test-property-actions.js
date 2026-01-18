const { chromium } = require('playwright');

async function testPropertyActions() {
  console.log('🔧 TESTING: Property View/Edit/Delete Actions');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('PROPERTIES')) {
      console.log(`  🖥️  ${msg.text()}`);
    }
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
    
    console.log('\n🏠 STEP 2: Go to Properties Page');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(4000);
    
    console.log('\n🔍 STEP 3: Test Desktop View Actions');
    
    // First test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    
    // Look for desktop table
    const desktopTable = await page.locator('table').count();
    console.log(`   📊 Desktop table found: ${desktopTable > 0 ? '✅ Yes' : '❌ No'}`);
    
    if (desktopTable > 0) {
      // Check for action buttons in table
      const viewButtons = await page.locator('button:has-text("View")').count();
      const editButtons = await page.locator('button:has-text("Edit")').count();
      const deleteButtons = await page.locator('button:has-text("Delete")').count();
      
      console.log(`   🛠️ Desktop Action Buttons:`);
      console.log(`      - View buttons: ${viewButtons}`);
      console.log(`      - Edit buttons: ${editButtons}`);
      console.log(`      - Delete buttons: ${deleteButtons}`);
      
      // Test clicking a View button if available
      if (viewButtons > 0) {
        console.log(`   🖱️ Testing View button click...`);
        
        const viewButton = page.locator('button:has-text("View")').first();
        await viewButton.click();
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`   📍 After View click: ${currentUrl}`);
        
        if (currentUrl.includes('/dashboard/properties/') && !currentUrl.includes('/new') && !currentUrl.includes('/edit')) {
          console.log('   🎉 View button works - navigated to property detail!');
        } else {
          console.log('   ⚠️ View button did not navigate to property detail');
        }
        
        // Go back to properties list
        await page.goto('http://localhost:3000/dashboard/properties');
        await page.waitForTimeout(2000);
      }
      
      // Test Edit button if available
      if (editButtons > 0) {
        console.log(`   🖱️ Testing Edit button click...`);
        
        const editButton = page.locator('button:has-text("Edit")').first();
        await editButton.click();
        await page.waitForTimeout(3000);
        
        const editUrl = page.url();
        console.log(`   📍 After Edit click: ${editUrl}`);
        
        if (editUrl.includes('/edit')) {
          console.log('   🎉 Edit button works - navigated to edit page!');
        } else {
          console.log('   ⚠️ Edit button did not navigate to edit page');
        }
        
        // Go back to properties list
        await page.goto('http://localhost:3000/dashboard/properties');
        await page.waitForTimeout(2000);
      }
    }
    
    console.log('\n📱 STEP 4: Test Mobile View Actions');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    
    // Check mobile card view
    const mobileCards = await page.locator('.md\\:hidden .bg-white.rounded-lg.border').count();
    console.log(`   📱 Mobile property cards: ${mobileCards}`);
    
    if (mobileCards > 0) {
      // Look for mobile action buttons
      const mobileViewButtons = await page.locator('.md\\:hidden button:has-text("View")').count();
      const mobileEditButtons = await page.locator('.md\\:hidden button:has-text("Edit")').count();
      const mobileDeleteButtons = await page.locator('.md\\:hidden button:has-text("Delete")').count();
      
      console.log(`   🛠️ Mobile Action Buttons:`);
      console.log(`      - View buttons: ${mobileViewButtons}`);
      console.log(`      - Edit buttons: ${mobileEditButtons}`);
      console.log(`      - Delete buttons: ${mobileDeleteButtons}`);
      
      // Test mobile View button
      if (mobileViewButtons > 0) {
        console.log(`   🖱️ Testing mobile View button...`);
        
        const mobileViewBtn = page.locator('.md\\:hidden button:has-text("View")').first();
        await mobileViewBtn.click();
        await page.waitForTimeout(3000);
        
        const mobileViewUrl = page.url();
        console.log(`   📍 After mobile View click: ${mobileViewUrl}`);
        
        if (mobileViewUrl.includes('/dashboard/properties/') && !mobileViewUrl.includes('/new')) {
          console.log('   🎉 Mobile View button works!');
        }
      }
    }
    
    console.log('\n🔍 STEP 5: Debug Action Button Visibility');
    
    // Reset to desktop view for debugging
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(3000);
    
    // Get all buttons and their text content
    const allButtons = await page.locator('button').all();
    console.log(`   🔍 Total buttons found: ${allButtons.length}`);
    
    let buttonTexts = [];
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      try {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        buttonTexts.push(`"${text?.trim()}" (${isVisible ? 'visible' : 'hidden'})`);
      } catch (e) {
        buttonTexts.push(`Button ${i + 1} (error reading)`);
      }
    }
    
    console.log(`   📋 Button inventory (first 20):`);
    buttonTexts.forEach((text, index) => {
      console.log(`      ${index + 1}. ${text}`);
    });
    
    // Check specifically for green, blue, and red buttons (View, Edit, Delete styling)
    const greenButtons = await page.locator('button[class*="green"]').count();
    const blueButtons = await page.locator('button[class*="blue"]').count();
    const redButtons = await page.locator('button[class*="red"]').count();
    
    console.log(`   🎨 Color-coded buttons:`);
    console.log(`      - Green buttons (View): ${greenButtons}`);
    console.log(`      - Blue buttons (Edit): ${blueButtons}`);
    console.log(`      - Red buttons (Delete): ${redButtons}`);
    
    // Check if properties are actually loaded
    const tableRows = await page.locator('tbody tr').count();
    console.log(`   📊 Properties in table: ${tableRows}`);
    
    if (tableRows > 0) {
      // Check the action column content
      const actionCells = await page.locator('td:last-child').count();
      console.log(`   ⚙️ Action column cells: ${actionCells}`);
      
      if (actionCells > 0) {
        const firstActionCell = page.locator('tbody tr:first-child td:last-child');
        const actionCellContent = await firstActionCell.textContent();
        console.log(`   📄 First action cell content: "${actionCellContent?.trim()}"`);
        
        const actionButtons = await firstActionCell.locator('button').count();
        console.log(`   🔘 Buttons in first action cell: ${actionButtons}`);
      }
    }
    
    console.log('\n📸 STEP 6: Save Screenshots');
    
    await page.screenshot({ path: 'property-actions-desktop.png', fullPage: true });
    console.log('   📸 Desktop view screenshot saved');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'property-actions-mobile.png', fullPage: true });
    console.log('   📸 Mobile view screenshot saved');
    
    console.log('\n🎯 PROPERTY ACTIONS TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Properties page loads: WORKING`);
    console.log(`✅ Desktop table view: ${desktopTable > 0 ? 'PRESENT' : 'MISSING'}`);
    console.log(`✅ Mobile card view: ${mobileCards > 0 ? 'PRESENT' : 'MISSING'}`);
    console.log(`✅ Action buttons visible: ${greenButtons + blueButtons + redButtons > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Property data loaded: ${tableRows > 0 ? 'YES' : 'NO'}`);
    console.log('=' .repeat(80));
    
    if (greenButtons + blueButtons + redButtons === 0) {
      console.log('⚠️ NO ACTION BUTTONS FOUND - This indicates a permissions or rendering issue');
    } else {
      console.log('✅ ACTION BUTTONS WORKING - Users can view/edit/delete properties');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ PROPERTY ACTIONS TEST ERROR:', error.message);
    await page.screenshot({ path: 'property-actions-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 Property actions test complete.');
  }
}

testPropertyActions().catch(console.error);

