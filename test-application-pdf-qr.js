const { chromium } = require('playwright');
const fs = require('fs');

async function testApplicationPDFGeneration() {
    console.log('🏠 Testing QR code PDF generation from within the application...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Navigate to the main application
        console.log('📱 Navigating to application dashboard...');
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
        
        // Check if we need to authenticate first
        const loginButton = await page.locator('button:has-text("Sign in"), button:has-text("Login"), a:has-text("Sign in"), a:has-text("Login")').first();
        if (await loginButton.count() > 0) {
            console.log('🔑 Authentication required - logging in...');
            
            // Find email and password fields
            const emailField = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
            const passwordField = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password"]').first();
            
            if (await emailField.count() === 0 || await passwordField.count() === 0) {
                console.log('❌ Could not find email/password fields');
                return { error: 'Authentication fields not found' };
            }
            
            // Fill in credentials
            await emailField.fill('sinscrit@gmail.com');
            await passwordField.fill('Teknowiz1!');
            
            // Click login button
            await loginButton.click();
            await page.waitForLoadState('networkidle');
            
            console.log('✅ Authentication completed');
        }
        
        // Take screenshot of dashboard
        await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
        console.log('📸 Dashboard screenshot saved');
        
        // Look for properties
        console.log('🏢 Looking for properties...');
        const propertyLinks = await page.locator('a[href*="/dashboard/properties/"]').all();
        
        if (propertyLinks.length === 0) {
            console.log('❌ No properties found after authentication. Let me check what\'s on the page...');
            console.log('Page title:', await page.title());
            console.log('Current URL:', page.url());
            return { error: 'No properties found on dashboard' };
        }
        
        console.log(`🏢 Found ${propertyLinks.length} properties`);
        
        // Click on the first property
        console.log('🔗 Clicking on first property...');
        await propertyLinks[0].click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of property page
        await page.screenshot({ path: 'property-page-screenshot.png', fullPage: true });
        console.log('📸 Property page screenshot saved');
        
        // Look for the "Print QR Codes" button
        console.log('🖨️ Looking for Print QR Codes button...');
        const printQRButton = await page.locator('button:has-text("Print QR Codes"), button:has-text("Print QR"), button[title*="QR"], button[aria-label*="QR"]').first();
        
        if (await printQRButton.count() === 0) {
            console.log('❌ Print QR Codes button not found. Checking page content...');
            const buttons = await page.locator('button').all();
            console.log(`Found ${buttons.length} buttons on page:`);
            for (let i = 0; i < Math.min(buttons.length, 10); i++) {
                const text = await buttons[i].textContent();
                console.log(`  - Button ${i}: "${text}"`);
            }
            return { error: 'Print QR Codes button not found' };
        }
        
        console.log('✅ Found Print QR Codes button');
        
        // Click the Print QR Codes button
        console.log('🖨️ Clicking Print QR Codes button...');
        await printQRButton.click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of QR print page
        await page.screenshot({ path: 'qr-print-page-screenshot.png', fullPage: true });
        console.log('📸 QR print page screenshot saved');
        
        // Wait for QR codes to load and check if they exist
        console.log('⏳ Waiting for QR codes to generate...');
        await page.waitForTimeout(3000);
        
        // Look for QR code images
        const qrImages = await page.locator('.qr-code-image, img[src*="data:image/png;base64"]').all();
        console.log(`🎯 Found ${qrImages.length} QR code images`);
        
        if (qrImages.length === 0) {
            console.log('❌ No QR codes found on print page');
            return { error: 'No QR codes found on print page' };
        }
        
        // Verify QR code data URLs are valid
        console.log('🔍 Verifying QR code data...');
        for (let i = 0; i < Math.min(qrImages.length, 3); i++) {
            const src = await qrImages[i].getAttribute('src');
            if (src) {
                console.log(`  QR ${i+1}: ${src.substring(0, 50)}... (${src.length} chars)`);
                if (!src.startsWith('data:image/png;base64,')) {
                    console.log(`  ⚠️ QR ${i+1} has invalid data URL format`);
                }
            } else {
                console.log(`  ❌ QR ${i+1} has no src attribute`);
            }
        }
        
        // Look for PDF export button
        console.log('📄 Looking for PDF export button...');
        const pdfButton = await page.locator('button:has-text("Export PDF"), button:has-text("PDF"), button:has-text("Export"), button[title*="PDF"]').first();
        
        if (await pdfButton.count() === 0) {
            console.log('❌ PDF export button not found');
            const buttons = await page.locator('button').all();
            console.log(`Found ${buttons.length} buttons on QR print page:`);
            for (let i = 0; i < Math.min(buttons.length, 10); i++) {
                const text = await buttons[i].textContent();
                console.log(`  - Button ${i}: "${text}"`);
            }
            return { error: 'PDF export button not found' };
        }
        
        console.log('✅ Found PDF export button');
        
        // Set up network monitoring for API calls
        page.on('response', response => {
            if (response.url().includes('/api/admin/generate-pdf')) {
                console.log(`📡 PDF API Response: ${response.status()} ${response.statusText()}`);
                response.text().then(text => {
                    console.log(`📄 PDF API Response body: ${text.substring(0, 200)}...`);
                }).catch(() => {});
            }
        });
        
        page.on('request', request => {
            if (request.url().includes('/api/admin/generate-pdf')) {
                console.log(`📡 PDF API Request: ${request.method()} ${request.url()}`);
                console.log(`📄 PDF API Request body: ${request.postData()?.substring(0, 200)}...`);
            }
        });
        
        // Set up download handler
        const downloadPromise = page.waitForDownload();
        
        // Click PDF export button
        console.log('📄 Clicking PDF export button...');
        await pdfButton.click();
        
        // Wait for download
        console.log('⏳ Waiting for PDF download...');
        const download = await downloadPromise;
        
        // Save the downloaded PDF
        const pdfPath = 'application-generated-qr.pdf';
        await download.saveAs(pdfPath);
        console.log(`📁 PDF saved as: ${pdfPath}`);
        
        // Verify PDF file exists and has content
        const stats = fs.statSync(pdfPath);
        console.log(`📊 PDF file size: ${stats.size} bytes`);
        
        if (stats.size < 1000) {
            console.log('⚠️ PDF file is suspiciously small - might be empty or corrupted');
            return { error: 'PDF file too small', size: stats.size };
        }
        
        console.log('🎉 SUCCESS: PDF generated from application with QR codes!');
        
        // Keep browser open for manual verification
        console.log('🔍 Browser kept open for manual PDF verification...');
        console.log(`📁 Check the generated PDF: ${pdfPath}`);
        console.log('❓ Press Ctrl+C when you\'ve verified the PDF content');
        
        // Wait indefinitely for manual verification
        await page.waitForTimeout(300000); // 5 minutes max
        
        return { 
            success: true, 
            pdfPath,
            qrCount: qrImages.length,
            fileSize: stats.size 
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { error: error.message };
    } finally {
        // Don't close browser automatically - let user verify PDF
        // await browser.close();
    }
}

// Run the test
testApplicationPDFGeneration().then(result => {
    console.log('\n🎉 Application PDF QR Test Summary:');
    if (result.success) {
        console.log('✅ PDF successfully generated from application');
        console.log(`✅ QR codes found: ${result.qrCount}`);
        console.log(`✅ PDF file size: ${result.fileSize} bytes`);
        console.log(`✅ PDF location: ${result.pdfPath}`);
    } else if (result.needsAuth) {
        console.log('🔑 Authentication required to access dashboard');
    } else {
        console.log(`❌ Test failed: ${result.error}`);
    }
}).catch(console.error);
