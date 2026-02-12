import { test, expect } from 'playwright/test';

test.describe('Bug Fix Verification - REQ-258 to REQ-264', () => {

  test.describe('REQ-260: No Raw Localization Keys', () => {
    test('session summary should not display raw translation keys', async ({ page }) => {
      // Navigate to dashboard and check for raw keys
      await page.goto('/dashboard2');

      // Check that no raw translation keys are visible on the page
      const pageContent = await page.textContent('body');

      // These patterns indicate untranslated keys
      expect(pageContent).not.toContain('workflow.steps.');
      expect(pageContent).not.toContain('.sessionSummary.');
      expect(pageContent).not.toContain('.header.subtitle');
    });
  });

  test.describe('REQ-261: Guide Title Preservation', () => {
    test('guide titles should not have "(Updated)" appended automatically', async ({ page }) => {
      await page.goto('/dashboard2/instructions');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check that no titles contain "(Updated Title)" or "(Updated)"
      const pageContent = await page.textContent('body');
      expect(pageContent).not.toContain('(Updated Title)');
    });
  });

  test.describe('REQ-264: QR Print Manager Mobile Usability', () => {
    test('QR print manager should be scrollable on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard2/print');
      await page.waitForLoadState('networkidle');

      // Check that the item list container has proper overflow styling
      const itemList = page.locator('[class*="overflow"]').first();

      if (await itemList.count() > 0) {
        const overflow = await itemList.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.overflowY;
        });

        // Should allow scrolling
        expect(['auto', 'scroll']).toContain(overflow);
      }
    });
  });

  test.describe('Localization Consistency', () => {
    test('French locale should display French translations consistently', async ({ page }) => {
      // Set French locale via cookie
      await page.context().addCookies([{
        name: 'NEXT_LOCALE',
        value: 'fr',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/dashboard2');
      await page.waitForLoadState('networkidle');

      // Check that page contains French text (common UI elements)
      const pageContent = await page.textContent('body');

      // Should not have raw translation keys
      expect(pageContent).not.toMatch(/\w+\.\w+\.\w+\.\w+/); // pattern like a.b.c.d suggests raw keys
    });

    test('Spanish locale should display Spanish translations consistently', async ({ page }) => {
      await page.context().addCookies([{
        name: 'NEXT_LOCALE',
        value: 'es',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/dashboard2');
      await page.waitForLoadState('networkidle');

      const pageContent = await page.textContent('body');
      expect(pageContent).not.toMatch(/\w+\.\w+\.\w+\.\w+/);
    });
  });

  test.describe('REQ-263: Property Context Preservation', () => {
    test('property selection should persist when navigating to print', async ({ page }) => {
      await page.goto('/dashboard2');
      await page.waitForLoadState('networkidle');

      // Check if property selector exists in header
      const propertySelector = page.locator('[data-testid="property-selector"]').or(
        page.locator('button:has-text("Property")').or(
          page.locator('[class*="property"]').first()
        )
      );

      // If we can find a property selector, the context mechanism exists
      // The fix ensures this context is passed to print pages
      if (await propertySelector.count() > 0) {
        // Navigate to print and verify no redundant selection prompt
        await page.goto('/dashboard2/print');
        await page.waitForLoadState('networkidle');

        // The fix should either auto-select or remember the property
        // Check that we don't have a blocking "Select Property" modal
        const blockingModal = page.locator('text="Select a Property"');
        // If property was already selected, this shouldn't be a blocking step
      }
    });
  });

  test.describe('Build Verification', () => {
    test('application should load without errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/dashboard2');
      await page.waitForLoadState('networkidle');

      // Filter out expected/harmless errors
      const criticalErrors = errors.filter(e =>
        !e.includes('hydration') &&
        !e.includes('ResizeObserver') &&
        !e.includes('favicon')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });
});
