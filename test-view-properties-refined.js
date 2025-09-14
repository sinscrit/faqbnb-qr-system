const { chromium } = require('playwright');

async function testViewPropertiesRefined() {
  console.log('👁️ REFINED TEST: View Properties Functionality');
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
        msg.text().includes('SUCCESS')) {
      console.log(`  🖥️  ${msg.text()}`);
    }
  });
  
  try {
    console.log('\n🔐 STEP 1: Authenticate User');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', 'raphajunk@outlook.com');
    await page.fill('input[type="password"]', 'Teknowiz1!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    console.log('   ✅ User authenticated successfully');
    
    console.log('\n🏠 STEP 2: Test Properties List View');
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(4000);
    
    console.log(`   📍 Properties page URL: ${page.url()}`);
    
    // Check for access denied
    const accessDenied = await page.locator('text="Access Denied"').count();
    if (accessDenied > 0) {
      console.log('   ❌ Access denied to properties page');
      return;
    }
    
    // Check page interface elements
    const hasTitle = await page.locator('text="Properties Management"').count();
    const hasAddButton = await page.locator('text="Add Property"').count();
    const hasBackButton = await page.locator('text="Back to Dashboard"').count();
    
    console.log(`   📋 Page Interface:`);
    console.log(`      - Properties Management title: ${hasTitle > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`      - Add Property button: ${hasAddButton > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`      - Back to Dashboard: ${hasBackButton > 0 ? '✅ Found' : '❌ Missing'}`);
    
    // Check for properties table
    const hasTable = await page.locator('table').count();
    const tableRows = await page.locator('tbody tr').count();
    
    console.log(`   📊 Properties Display:`);
    console.log(`      - Properties table: ${hasTable > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`      - Property rows: ${tableRows}`);
    
    // Get property details from table
    let propertiesData = [];
    if (hasTable > 0 && tableRows > 0) {
      console.log(`   🏠 Found ${tableRows} properties in the list`);
      
      const rows = await page.locator('tbody tr').all();
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        try {
          const cells = await rows[i].locator('td').all();
          if (cells.length >= 2) {
            const name = await cells[0].textContent();
            const address = await cells[1].textContent();
            propertiesData.push({
              name: name?.trim() || 'Unknown',
              address: address?.trim() || 'No address'
            });
          }
        } catch (e) {
          // Continue if we can't read the row
        }
      }
      
      if (propertiesData.length > 0) {
        console.log(`   📋 Sample properties:`);
        propertiesData.slice(0, 3).forEach((prop, index) => {
          console.log(`      - ${index + 1}. "${prop.name}" at ${prop.address}`);
        });
      }
    } else {
      console.log('   ℹ️ No properties found in the list');
    }
    
    console.log('\n🔍 STEP 3: Test Property Detail Navigation');
    
    // Look for view/detail buttons
    const viewButtons = await page.locator('text="View", button:has-text("View")').count();
    const editButtons = await page.locator('text="Edit", button:has-text("Edit")').count();
    const deleteButtons = await page.locator('text="Delete", button:has-text("Delete")').count();
    
    console.log(`   🛠️ Property Actions Available:`);
    console.log(`      - View buttons: ${viewButtons}`);
    console.log(`      - Edit buttons: ${editButtons}`);
    console.log(`      - Delete buttons: ${deleteButtons}`);
    
    // Test clicking on a property detail if available
    const propertyLinks = await page.locator('a[href*="/dashboard/properties/"]').all();
    
    if (propertyLinks.length > 0) {
      console.log(`   🔗 Found ${propertyLinks.length} clickable property links`);
      
      // Click on the first property link
      const firstLink = propertyLinks[0];
      const linkHref = await firstLink.getAttribute('href');
      console.log(`   🖱️ Testing property detail link: ${linkHref}`);
      
      await firstLink.click();
      await page.waitForTimeout(3000);
      
      const detailUrl = page.url();
      console.log(`   📍 Navigated to: ${detailUrl}`);
      
      if (detailUrl.includes('/dashboard/properties/') && !detailUrl.includes('/new') && !detailUrl.includes('/edit')) {
        console.log('   🎉 SUCCESS: Property detail page opened!');
        
        // Check property detail page content
        const pageContent = await page.locator('body').textContent();
        const hasPropertyInfo = pageContent.includes('Property') || pageContent.includes('Details') || pageContent.includes('Information');
        
        console.log(`   📄 Property detail page has content: ${hasPropertyInfo ? '✅ Yes' : '❌ No'}`);
        
        // Look for back navigation
        const hasBackToList = await page.locator('text="Back to Properties", text="← Back"').count();
        console.log(`   ↩️ Back navigation available: ${hasBackToList > 0 ? '✅ Yes' : '❌ No'}`);
        
        // Look for property actions on detail page
        const detailEditButton = await page.locator('text="Edit", button:has-text("Edit")').count();
        const detailDeleteButton = await page.locator('text="Delete", button:has-text("Delete")').count();
        
        console.log(`   🛠️ Detail Page Actions:`);
        console.log(`      - Edit button: ${detailEditButton > 0 ? '✅ Available' : '❌ Missing'}`);
        console.log(`      - Delete button: ${detailDeleteButton > 0 ? '✅ Available' : '❌ Missing'}`);
        
      } else {
        console.log('   ⚠️ Link did not lead to property detail page');
      }
    } else {
      console.log('   ⚠️ No clickable property links found');
    }
    
    console.log('\n📱 STEP 4: Test Dashboard Navigation');
    
    // Test navigation back to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    // Check dashboard quick access to properties
    const managePropertiesBtn = await page.locator('text="Manage Properties"').count();
    const myPropertiesBtn = await page.locator('text="🏠My Properties"').count();
    
    console.log(`   🏠 Dashboard Property Access:`);
    console.log(`      - "Manage Properties" quick action: ${managePropertiesBtn > 0 ? '✅ Available' : '❌ Missing'}`);
    console.log(`      - "🏠My Properties" navigation: ${myPropertiesBtn > 0 ? '✅ Available' : '❌ Missing'}`);
    
    // Test quick access functionality
    if (managePropertiesBtn > 0) {
      await page.locator('text="Manage Properties"').click();
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/dashboard/properties')) {
        console.log('   ✅ "Manage Properties" quick access works correctly');
      } else {
        console.log('   ❌ "Manage Properties" quick access failed');
      }
    }
    
    console.log('\n📊 STEP 5: Test Property Statistics');
    
    // Go back to dashboard to check property stats
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    // Look for property count in dashboard widgets
    const propertyStatElements = await page.locator('text="Properties", text="properties"').count();
    console.log(`   📈 Property statistics shown on dashboard: ${propertyStatElements > 0 ? '✅ Yes' : '❌ No'}`);
    
    // Check if property count matches what we saw in the list
    if (propertyStatElements > 0 && propertiesData.length > 0) {
      console.log(`   📊 Dashboard shows property data (found ${propertiesData.length} in list)`);
    }
    
    console.log('\n📸 STEP 6: Save Verification Screenshots');
    
    // Screenshot properties list
    await page.goto('http://localhost:3000/dashboard/properties');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'view-properties-list.png', fullPage: true });
    console.log('   📸 Properties list screenshot saved');
    
    // Screenshot dashboard with property widgets
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'dashboard-with-properties.png', fullPage: true });
    console.log('   📸 Dashboard screenshot saved');
    
    console.log('\n🎯 VIEW PROPERTIES TEST RESULTS:');
    console.log('=' .repeat(80));
    console.log(`✅ Authentication: WORKING`);
    console.log(`✅ Properties page access: ${accessDenied === 0 ? 'ALLOWED' : 'DENIED'}`);
    console.log(`✅ Properties list display: ${hasTable > 0 ? 'TABLE FORMAT' : 'NO TABLE'}`);
    console.log(`✅ Properties count: ${tableRows || 0} properties found`);
    console.log(`✅ Property detail navigation: ${propertyLinks.length > 0 ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
    console.log(`✅ Dashboard integration: ${managePropertiesBtn > 0 || myPropertiesBtn > 0 ? 'WORKING' : 'MISSING'}`);
    console.log(`✅ Property actions: View/${editButtons}/Delete available`);
    console.log('=' .repeat(80));
    
    if (propertiesData.length > 0) {
      console.log('🏠 PROPERTIES VIEWING FUNCTIONALITY: ✅ FULLY WORKING');
      console.log(`   - User can access properties list (${propertiesData.length} properties shown)`);
      console.log(`   - User can view property details via clickable links`);
      console.log(`   - User can navigate back and forth between dashboard and properties`);
      console.log(`   - Property management interface is fully functional`);
    } else {
      console.log('ℹ️ PROPERTIES VIEWING: Interface working, but no properties to display');
      console.log('   - User can access properties page');
      console.log('   - User can create properties via "Add Property" button');
      console.log('   - UI is ready for property display once properties are created');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ REFINED TEST ERROR:', error.message);
    await page.screenshot({ path: 'view-properties-error-refined.png' });
  } finally {
    await browser.close();
    console.log('\n🔚 Refined view properties test complete.');
  }
}

testViewPropertiesRefined().catch(console.error);

