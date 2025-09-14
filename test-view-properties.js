const { chromium } = require('playwright');

async function testViewProperties() {
  console.log('👁️ TESTING: View Properties Functionality');
  console.log('=' .repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('PROPERTIES') || 
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
    console.log('\n🔐 STEP 1: Authenticate User');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'raphajunk@outlook.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    if (!page.url().includes('/dashboard')) {
      throw new Error('Authentication failed');
    }
    console.log('   ✅ User authenticated successfully');
    
    console.log('\n🏠 STEP 2: Navigate to Properties List');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Current URL: ${page.url()}`);
    
    // Check if properties page loads
    const pageTitle = await page.title();
    console.log(`   📋 Page Title: ${pageTitle}`);
    
    // Check for loading states
    const loadingElements = await page.locator('.animate-spin, [data-testid="loading"]').count();
    console.log(`   ⏳ Loading elements: ${loadingElements}`);
    
    // Check for error messages
    const errorElements = await page.locator('.bg-red-50, .text-red-700').count();
    console.log(`   ❌ Error elements: ${errorElements}`);
    
    if (errorElements > 0) {
      const errorText = await page.locator('.bg-red-50, .text-red-700').textContent();
      console.log(`   ❌ Error message: ${errorText}`);
    }
    
    // Check for access denied
    const accessDenied = await page.locator('text="Access Denied"').count();
    if (accessDenied > 0) {
      console.log('   ❌ Access denied to properties page');
      const deniedText = await page.locator('text="Access Denied"').textContent();
      console.log(`   📄 Access denied message: ${deniedText}`);
      return;
    }
    
    console.log('\n📊 STEP 3: Analyze Properties List Interface');
    
    // Check for main page elements
    const hasPropertiesTitle = await page.locator('text="Properties Management"').count();
    const hasAddButton = await page.locator('text="Add Property"').count();
    const hasBackButton = await page.locator('text="Back to Dashboard"').count();
    
    console.log(`   📋 Page Interface:`);
    console.log(`      - "Properties Management" title: ${hasPropertiesTitle}`);
    console.log(`      - "Add Property" button: ${hasAddButton}`);
    console.log(`      - "Back to Dashboard" button: ${hasBackButton}`);
    
    // Look for properties table/list
    const tables = await page.locator('table').count();
    const propertyCards = await page.locator('.property-card, [data-testid*="property"]').count();
    const propertyRows = await page.locator('tr').count();
    
    console.log(`   📊 Properties Display:`);
    console.log(`      - Tables: ${tables}`);
    console.log(`      - Property cards: ${propertyCards}`);
    console.log(`      - Table rows: ${propertyRows}`);
    
    // Count actual property entries
    let propertiesFound = 0;
    let propertyDetails = [];
    
    if (tables > 0) {
      // Table format
      const rows = await page.locator('tbody tr').all();
      propertiesFound = rows.length;
      
      console.log(`   🏠 Found ${propertiesFound} properties in table format`);
      
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        try {
          const cells = await rows[i].locator('td').all();
          if (cells.length > 0) {
            const firstCellText = await cells[0].textContent();
            propertyDetails.push(firstCellText?.trim() || `Property ${i + 1}`);
          }
        } catch (e) {
          // Continue if we can't read the cell
        }
      }
    } else if (propertyCards > 0) {
      // Card format
      propertiesFound = propertyCards;
      console.log(`   🏠 Found ${propertiesFound} properties in card format`);
    }
    
    if (propertyDetails.length > 0) {
      console.log(`   📋 Property samples:`);
      propertyDetails.forEach((detail, index) => {
        console.log(`      - Property ${index + 1}: ${detail}`);
      });
    }
    
    console.log('\n🔍 STEP 4: Test Property Detail View');
    
    if (propertiesFound > 0) {
      // Try to click on first property to view details
      try {
        // Look for clickable property links
        const propertyLinks = await page.locator('a[href*="/dashboard/properties/"]').all();
        
        if (propertyLinks.length > 0) {
          console.log(`   🔗 Found ${propertyLinks.length} property detail links`);
          
          const firstLink = propertyLinks[0];
          const linkHref = await firstLink.getAttribute('href');
          console.log(`   🖱️ Clicking property link: ${linkHref}`);
          
          await firstLink.click();
          await page.waitForTimeout(3000);
          
          const detailUrl = page.url();
          console.log(`   📍 Navigated to: ${detailUrl}`);
          
          if (detailUrl.includes('/dashboard/properties/') && !detailUrl.includes('/new')) {
            console.log('   🎉 Successfully opened property detail page!');
            
            // Check property detail content
            const detailTitle = await page.title();
            console.log(`   📋 Property detail title: ${detailTitle}`);
            
            // Look for property information
            const hasPropertyName = await page.locator('h1, h2, h3').count();
            const hasPropertyInfo = await page.locator('p, div').count();
            
            console.log(`   📊 Property Detail Content:`);
            console.log(`      - Headings: ${hasPropertyName}`);
            console.log(`      - Content sections: ${hasPropertyInfo}`);
            
            // Look for edit/delete buttons if available
            const hasEditButton = await page.locator('text="Edit", button:has-text("Edit")').count();
            const hasDeleteButton = await page.locator('text="Delete", button:has-text("Delete")').count();
            
            console.log(`   🛠️ Property Actions:`);
            console.log(`      - Edit button: ${hasEditButton}`);
            console.log(`      - Delete button: ${hasDeleteButton}`);
            
          } else {
            console.log('   ⚠️ Did not navigate to property detail page correctly');
          }
        } else {
          console.log('   ⚠️ No clickable property links found');
        }
      } catch (e) {
        console.log(`   ⚠️ Could not test property detail view: ${e.message}`);
      }
    } else {
      console.log('   ℹ️ No properties found to test detail view');
    }
    
    console.log('\n🏠 STEP 5: Test Quick Access from Dashboard');
    
    // Go back to dashboard and test quick access
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    // Look for property quick access buttons
    const managePropertiesButton = page.locator('text="Manage Properties"');
    const myPropertiesButton = page.locator('text="🏠My Properties"');
    const propertiesLink = page.locator('a[href*="/dashboard/properties"]');
    
    const hasManageProperties = await managePropertiesButton.isVisible();
    const hasMyProperties = await myPropertiesButton.isVisible();
    const hasPropertiesLink = await propertiesLink.count();
    
    console.log(`   📱 Dashboard Quick Access:`);
    console.log(`      - "Manage Properties" button: ${hasManageProperties ? '✅ Available' : '❌ Missing'}`);
    console.log(`      - "🏠My Properties" button: ${hasMyProperties ? '✅ Available' : '❌ Missing'}`);
    console.log(`      - Properties links: ${hasPropertiesLink}`);
    
    // Test quick access navigation
    if (hasManageProperties) {
      await managePropertiesButton.click();
      await page.waitForTimeout(2000);
      if (page.url().includes('/dashboard/properties')) {
        console.log('   ✅ "Manage Properties" quick access works');
      }
    } else if (hasMyProperties) {
      await myPropertiesButton.click();
      await page.waitForTimeout(2000);
      if (page.url().includes('/dashboard/properties')) {
        console.log('   ✅ "🏠My Properties" quick access works');
      }
    }
    
    console.log('\n📸 STEP 6: Save Screenshots');
    
    // Take screenshots for verification
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'properties-list-view.png', fullPage: true });
    console.log('   📸 Properties list screenshot saved');
    
    console.log('\n🎯 VIEW PROPERTIES TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Authentication: WORKING`);
    console.log(`✅ Properties page access: ${accessDenied === 0 ? 'WORKING' : 'BLOCKED'}`);
    console.log(`✅ Properties list display: ${propertiesFound > 0 ? 'WORKING' : 'NO DATA'}`);
    console.log(`✅ Property detail navigation: ${propertyLinks?.length > 0 ? 'WORKING' : 'NEEDS TESTING'}`);
    console.log(`✅ Dashboard quick access: ${hasManageProperties || hasMyProperties ? 'WORKING' : 'MISSING'}`);
    console.log('=' .repeat(80));
    
    console.log(`📊 Properties found: ${propertiesFound}`);
    if (propertyDetails.length > 0) {
      console.log(`📋 Sample properties: ${propertyDetails.slice(0, 3).join(', ')}`);
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ VIEW PROPERTIES TEST ERROR:', error.message);
    await page.screenshot({ path: 'view-properties-error.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 View properties test complete.');
  }
}

testViewProperties().catch(console.error);

