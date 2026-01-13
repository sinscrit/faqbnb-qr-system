// Test Google Login Script
// Created: 2026-01-13
import { chromium } from 'playwright';

async function testGoogleLogin() {
  console.log('Starting Google login test...');

  const browser = await chromium.launch({
    headless: false,  // Show browser for visual debugging
    slowMo: 500       // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Enable console logging from the page
  page.on('console', msg => console.log('Browser console:', msg.text()));

  try {
    // Step 1: Navigate to login page
    console.log('\n1. Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the login page
    await page.screenshot({
      path: '.playwright-mcp/google-login-test-step1.png',
      fullPage: true
    });
    console.log('Screenshot saved: google-login-test-step1.png');

    // Step 2: Find the Google OAuth button
    console.log('\n2. Looking for Google OAuth button...');
    const googleButton = await page.locator('button:has-text("Continue with Google")');
    const buttonVisible = await googleButton.isVisible();
    console.log('Google OAuth button visible:', buttonVisible);

    if (!buttonVisible) {
      console.error('ERROR: Google OAuth button not found on the page!');
      await browser.close();
      return;
    }

    // Step 3: Click the Google OAuth button
    console.log('\n3. Clicking Google OAuth button...');

    // Listen for any navigation or popup
    const popupPromise = page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);

    await googleButton.click();

    // Wait a bit for navigation or popup
    await page.waitForTimeout(3000);

    // Check if we got a popup
    const popup = await popupPromise;

    if (popup) {
      console.log('\n4. Popup detected - Google OAuth flow opened in popup');
      console.log('Popup URL:', popup.url());
      await popup.screenshot({
        path: '.playwright-mcp/google-login-test-popup.png',
        fullPage: true
      });
    } else {
      // Check current URL
      console.log('\n4. No popup - checking current page URL...');
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      // Take screenshot of wherever we ended up
      await page.screenshot({
        path: '.playwright-mcp/google-login-test-step2.png',
        fullPage: true
      });
      console.log('Screenshot saved: google-login-test-step2.png');

      // Check if we're on Google's OAuth page
      if (currentUrl.includes('accounts.google.com')) {
        console.log('SUCCESS: Redirected to Google OAuth page');
      } else if (currentUrl.includes('error')) {
        console.error('ERROR: OAuth flow resulted in error');
        console.log('Page content contains error');
      } else if (currentUrl === 'http://localhost:3000/login') {
        console.log('Still on login page - checking for errors...');

        // Check for error messages
        const errorMessage = await page.locator('.text-red-800, .text-red-700, .text-red-600').first().textContent().catch(() => null);
        if (errorMessage) {
          console.error('Error message on page:', errorMessage);
        }

        // Check for loading state
        const loadingText = await page.locator('text=Connecting to Google').isVisible().catch(() => false);
        if (loadingText) {
          console.log('OAuth is loading...');
          await page.waitForTimeout(5000);
          console.log('URL after waiting:', page.url());
        }
      }
    }

    // Wait a bit more to see where we end up
    console.log('\n5. Waiting for final state...');
    await page.waitForTimeout(5000);

    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);

    // Final screenshot
    await page.screenshot({
      path: '.playwright-mcp/google-login-test-final.png',
      fullPage: true
    });
    console.log('Screenshot saved: google-login-test-final.png');

    // Keep browser open for manual inspection
    console.log('\n=== Test complete - browser will close in 30 seconds ===');
    console.log('You can manually inspect the browser window.');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\nTest error:', error.message);
    await page.screenshot({
      path: '.playwright-mcp/google-login-test-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

testGoogleLogin();
