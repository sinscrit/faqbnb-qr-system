const { chromium } = require('playwright');

async function debugAuthFlow() {
    console.log('🔍 Debugging authentication flow...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000 
    });
    
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Start at root
        console.log('📱 Navigating to root...');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        console.log('Root URL:', page.url());
        console.log('Root title:', await page.title());
        
        // Take screenshot
        await page.screenshot({ path: 'debug-root.png', fullPage: true });
        
        // Check what's on the page
        const buttons = await page.locator('button').all();
        console.log(`Found ${buttons.length} buttons:`);
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            console.log(`  Button ${i}: "${text}"`);
        }
        
        const links = await page.locator('a').all();
        console.log(`Found ${links.length} links:`);
        for (let i = 0; i < Math.min(links.length, 10); i++) {
            const text = await links[i].textContent();
            const href = await links[i].getAttribute('href');
            console.log(`  Link ${i}: "${text}" -> ${href}`);
        }
        
        // Try to navigate to dashboard directly
        console.log('\n📱 Trying to navigate to dashboard directly...');
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
        console.log('Dashboard URL:', page.url());
        console.log('Dashboard title:', await page.title());
        
        // Check if we're redirected to login
        if (page.url().includes('/login')) {
            console.log('🔑 Redirected to login page');
            
            // Look for form fields
            const emailField = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"], input[id*="email"]').first();
            const passwordField = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password"], input[id*="password"]').first();
            const submitButton = await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), input[type="submit"]').first();
            
            console.log(`Email field found: ${await emailField.count() > 0}`);
            console.log(`Password field found: ${await passwordField.count() > 0}`);
            console.log(`Submit button found: ${await submitButton.count() > 0}`);
            
            if (await emailField.count() > 0 && await passwordField.count() > 0 && await submitButton.count() > 0) {
                console.log('✅ All login fields found, attempting login...');
                
                await emailField.fill('sinscrit@gmail.com');
                await passwordField.fill('Teknowiz1!');
                
                // Take screenshot before submit
                await page.screenshot({ path: 'debug-before-login.png', fullPage: true });
                
                await submitButton.click();
                await page.waitForLoadState('networkidle');
                
                console.log('After login URL:', page.url());
                console.log('After login title:', await page.title());
                
                // Take screenshot after login
                await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
                
                // Check if login was successful
                if (page.url().includes('/dashboard')) {
                    console.log('✅ Login successful - now on dashboard');
                    
                    // Look for properties
                    const propertyLinks = await page.locator('a[href*="/properties/"], a:has-text("Property"), .property-card, [data-testid*="property"]').all();
                    console.log(`Found ${propertyLinks.length} property-related elements`);
                    
                    // Check page content
                    const pageText = await page.textContent('body');
                    console.log('Page contains "property":', pageText.toLowerCase().includes('property'));
                    console.log('Page contains "QR":', pageText.toLowerCase().includes('qr'));
                    
                } else {
                    console.log('❌ Login failed - still on:', page.url());
                    
                    // Check for error messages
                    const errorMessages = await page.locator('.error, .alert-error, [role="alert"], .text-red').all();
                    console.log(`Found ${errorMessages.length} error messages:`);
                    for (let i = 0; i < errorMessages.length; i++) {
                        const text = await errorMessages[i].textContent();
                        console.log(`  Error ${i}: "${text}"`);
                    }
                }
            } else {
                console.log('❌ Login form incomplete');
            }
        } else {
            console.log('✅ Already authenticated or no auth required');
        }
        
        // Keep browser open for manual inspection
        console.log('\n🔍 Browser kept open for manual inspection...');
        console.log('Press Ctrl+C when done inspecting');
        await page.waitForTimeout(60000);
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        // Don't close automatically
        // await browser.close();
    }
}

debugAuthFlow().catch(console.error);


