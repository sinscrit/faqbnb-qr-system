const { chromium } = require('playwright');
const fs = require('fs');

async function testQRPDFFocused() {
    console.log('🎯 Focused QR PDF test with proper authentication...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Step 1: Go directly to login page
        console.log('🔑 Going to login page...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'step1-login-page.png', fullPage: true });
        
        // Step 2: Fill in credentials and login
        console.log('📝 Filling in credentials...');
        await page.fill('input[type="email"], input[name="email"]', 'sinscrit@gmail.com');
        await page.fill('input[type="password"], input[name="password"]', 'Teknowiz1!');
        
        console.log('🔐 Submitting login...');
        await page.click('button[type="submit"], button:has-text("Sign in")');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Login completed. Current URL:', page.url());
        await page.screenshot({ path: 'step2-after-login.png', fullPage: true });
        
        // Step 3: Navigate to dashboard
        console.log('📊 Navigating to dashboard...');
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
        console.log('Dashboard URL:', page.url());
        await page.screenshot({ path: 'step3-dashboard.png', fullPage: true });
        
        // Step 4: Look for properties and navigate to one
        console.log('🏢 Looking for properties...');
        
        // Wait a bit for properties to load
        await page.waitForTimeout(2000);
        
        // Try multiple selectors for property links
        const propertySelectors = [
            'a[href*="/properties/"]',
            'a[href*="/dashboard/properties/"]', 
            '[data-testid="property-link"]',
            '.property-card a',
            'a:has-text("Property")',
            'a:has-text("property")'
        ];
        
        let propertyLink = null;
        for (const selector of propertySelectors) {
            const links = await page.locator(selector).all();
            if (links.length > 0) {
                console.log(`✅ Found ${links.length} properties using selector: ${selector}`);
                propertyLink = links[0];
                break;
            }
        }
        
        if (!propertyLink) {
            // Check what's actually on the dashboard
            console.log('❓ No properties found. Checking dashboard content...');
            const allLinks = await page.locator('a').all();
            console.log(`Found ${allLinks.length} total links on dashboard:`);
            for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
                const text = await allLinks[i].textContent();
                const href = await allLinks[i].getAttribute('href');
                console.log(`  Link ${i}: "${text}" -> ${href}`);
            }
            
            // Let's try to create a property or use demo data
            console.log('🔧 Trying to find demo or test data...');
            const demoLink = await page.locator('a:has-text("demo"), a:has-text("Demo"), a[href*="demo"]').first();
            if (await demoLink.count() > 0) {
                console.log('🎭 Found demo link, using that...');
                await demoLink.click();
                await page.waitForLoadState('networkidle');
            } else {
                return { error: 'No properties or demo data found on dashboard' };
            }
        } else {
            console.log('🔗 Clicking on property...');
            await propertyLink.click();
            await page.waitForLoadState('networkidle');
        }
        
        await page.screenshot({ path: 'step4-property-page.png', fullPage: true });
        console.log('Property page URL:', page.url());
        
        // Step 5: Look for Print QR Codes button
        console.log('🖨️ Looking for Print QR Codes button...');
        const qrButtonSelectors = [
            'button:has-text("Print QR Codes")',
            'button:has-text("QR Codes")',
            'button:has-text("Print QR")',
            '[data-testid="print-qr-button"]',
            'button[title*="QR"]',
            'button[aria-label*="QR"]'
        ];
        
        let qrButton = null;
        for (const selector of qrButtonSelectors) {
            const button = await page.locator(selector).first();
            if (await button.count() > 0) {
                console.log(`✅ Found QR button using selector: ${selector}`);
                qrButton = button;
                break;
            }
        }
        
        if (!qrButton) {
            console.log('❓ Print QR button not found. Checking all buttons...');
            const allButtons = await page.locator('button').all();
            console.log(`Found ${allButtons.length} buttons:`);
            for (let i = 0; i < allButtons.length; i++) {
                const text = await allButtons[i].textContent();
                console.log(`  Button ${i}: "${text}"`);
            }
            return { error: 'Print QR Codes button not found' };
        }
        
        // Step 6: Click Print QR Codes button
        console.log('🖨️ Clicking Print QR Codes button...');
        await qrButton.click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ path: 'step5-qr-print-page.png', fullPage: true });
        console.log('QR Print page URL:', page.url());
        
        // Step 7: Wait for QR codes to load and verify they're visible
        console.log('⏳ Waiting for QR codes to load...');
        await page.waitForTimeout(3000);
        
        const qrImages = await page.locator('.qr-code-image, img[src*="data:image/png;base64"]').all();
        console.log(`🎯 Found ${qrImages.length} QR code images`);
        
        if (qrImages.length === 0) {
            return { error: 'No QR codes found on print page' };
        }
        
        // Step 8: Test PDF export
        console.log('📄 Looking for PDF export button...');
        const pdfButton = await page.locator('button:has-text("Export PDF"), button:has-text("PDF"), button:has-text("Export")').first();
        
        if (await pdfButton.count() === 0) {
            return { error: 'PDF export button not found' };
        }
        
        // Monitor network requests
        const apiRequests = [];
        page.on('request', request => {
            if (request.url().includes('/api/')) {
                apiRequests.push({
                    url: request.url(),
                    method: request.method(),
                    postData: request.postData()
                });
                console.log(`📡 API Request: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('/api/')) {
                console.log(`📡 API Response: ${response.status()} ${response.url()}`);
            }
        });
        
        // Set up download handler
        const downloadPromise = page.waitForDownload();
        
        console.log('📄 Clicking PDF export button...');
        await pdfButton.click();
        
        // Wait for download
        console.log('⏳ Waiting for PDF download...');
        const download = await downloadPromise;
        
        // Save the downloaded PDF
        const pdfPath = 'test-qr-export.pdf';
        await download.saveAs(pdfPath);
        console.log(`📁 PDF saved as: ${pdfPath}`);
        
        // Check PDF file
        const stats = fs.statSync(pdfPath);
        console.log(`📊 PDF file size: ${stats.size} bytes`);
        
        console.log('\n🎉 SUCCESS! QR PDF test completed');
        console.log(`✅ QR codes found: ${qrImages.length}`);
        console.log(`✅ PDF generated: ${pdfPath} (${stats.size} bytes)`);
        console.log(`✅ API requests made: ${apiRequests.length}`);
        
        // Keep browser open for manual verification
        console.log('\n🔍 Browser kept open for manual PDF verification...');
        console.log('📋 Please check the PDF file manually to confirm QR codes are visible');
        console.log('❓ Press Ctrl+C when done verifying');
        
        await page.waitForTimeout(120000); // 2 minutes
        
        return { 
            success: true, 
            qrCount: qrImages.length,
            pdfPath,
            fileSize: stats.size,
            apiRequests
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { error: error.message };
    }
}

testQRPDFFocused().catch(console.error);


