import { test as setup, expect } from 'playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Wait for login form to be ready
  await page.waitForSelector('#email', { timeout: 30000 });

  // Fill in credentials
  await page.fill('#email', 'raphajunk@outlook.com');
  await page.fill('#password', 'Teknowiz1!');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard (can go to /dashboard2 or /admin)
  await page.waitForURL(/\/(dashboard2|admin)/, { timeout: 30000 });

  // Save auth state
  await page.context().storageState({ path: authFile });
});
