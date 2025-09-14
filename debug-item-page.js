const { chromium } = require('playwright');

async function debugItemPage() {
  console.log('🔍 DEBUGGING: Item Creation Page Structure');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    console.log(`  🖥️  ${msg.text()}`);
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
    
    console.log('\n📦 STEP 2: Navigate to Item Creation');
    await page.goto('http://localhost:3000/dashboard/items/new');
    await page.waitForTimeout(4000);
    
    console.log('\n🔍 STEP 3: Analyze Page Structure');
    const title = await page.title();
    console.log(`   📋 Page Title: ${title}`);
    
    // Check if page loaded correctly
    const bodyText = await page.locator('body').textContent();
    console.log(`   📄 Page contains text: ${bodyText.substring(0, 200)}...`);
    
    // Check for loading states
    const loadingElements = await page.locator('.animate-spin, [data-testid="loading"]').count();
    console.log(`   ⏳ Loading elements: ${loadingElements}`);
    
    // Check for error messages
    const errorElements = await page.locator('.bg-red-50, .text-red-700, .text-red-600').count();
    console.log(`   ❌ Error elements: ${errorElements}`);
    
    // Check for form elements
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const textareas = await page.locator('textarea').count();
    const selects = await page.locator('select').count();
    const buttons = await page.locator('button').count();
    
    console.log(`   📝 Form elements:`)
    console.log(`      - Forms: ${forms}`);
    console.log(`      - Inputs: ${inputs}`);
    console.log(`      - Textareas: ${textareas}`);
    console.log(`      - Selects: ${selects}`);
    console.log(`      - Buttons: ${buttons}`);
    
    // List all input names if any exist
    if (inputs > 0) {
      console.log(`   📋 Input field names:`);
      const inputElements = await page.locator('input').all();
      for (let i = 0; i < inputElements.length; i++) {
        const name = await inputElements[i].getAttribute('name');
        const type = await inputElements[i].getAttribute('type');
        const placeholder = await inputElements[i].getAttribute('placeholder');
        console.log(`      - Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
      }
    }
    
    // Check for specific text content
    const hasCreateText = await page.locator('text="Create New Item"').count();
    const hasPropertyText = await page.locator('text="Property"').count();
    const hasNameText = await page.locator('text="Name"').count();
    
    console.log(`   🔍 Content check:`);
    console.log(`      - "Create New Item" text: ${hasCreateText}`);
    console.log(`      - "Property" text: ${hasPropertyText}`);
    console.log(`      - "Name" text: ${hasNameText}`);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-item-page.png', fullPage: true });
    console.log(`   📸 Screenshot saved: debug-item-page.png`);
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('\n❌ DEBUG ERROR:', error.message);
  } finally {
    await browser.close();
    console.log('\n🔚 Debug complete.');
  }
}

debugItemPage().catch(console.error);

