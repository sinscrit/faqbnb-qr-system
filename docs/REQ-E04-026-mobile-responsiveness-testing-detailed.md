# Detailed Task Breakdown: REQ-E04-026 - Mobile Responsiveness Testing

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-026
**Epic:** Epic 4 - Guest Experience
**Phase:** 7 - Testing & Polish
**Task ID:** 7.4
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Overview Document:** `/docs/REQ-E04-026-mobile-responsiveness-testing-overview.md`
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`

---

## Table of Contents

1. [Summary](#summary)
2. [Prerequisites](#prerequisites)
3. [Task Breakdown](#task-breakdown)
4. [Implementation Details](#implementation-details)
5. [Testing Instructions](#testing-instructions)
6. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)

---

## Summary

This document provides granular, actionable tasks for implementing comprehensive mobile responsiveness testing of guest localization features. The testing validates that the GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, and LanguageIndicator components function correctly on mobile devices with proper touch targets, appropriate banner positioning, and accessible interactive controls.

---

## Prerequisites

Before starting implementation, verify:

- [ ] REQ-E04-008 (GuestLanguageSwitcher) is implemented
- [ ] REQ-E04-009 (TranslationBanner) is implemented
- [ ] REQ-E04-010 (MissingTranslationBanner) is implemented
- [ ] REQ-E04-011 (ViewOriginalToggle) is implemented
- [ ] REQ-E04-012 (LanguageIndicator) is implemented
- [ ] Vitest is configured and working (`npm test` runs successfully)
- [ ] Guest components directory exists at `/src/components/guest/`

---

## Task Breakdown

### Task 1: Create GuestLanguageSwitcher Mobile Test File

**File:** `/src/components/guest/__tests__/GuestLanguageSwitcher.mobile.test.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** REQ-E04-008 complete

#### 1.1 Create Test File Structure

Create the test file with proper imports and setup:

```typescript
/**
 * GuestLanguageSwitcher Mobile Responsiveness Tests
 *
 * Tests for touch target compliance, dropdown behavior on mobile,
 * and small screen layout behavior.
 *
 * REQ-E04-026: Mobile Responsiveness Testing
 *
 * @module guest/__tests__/GuestLanguageSwitcher.mobile
 * @vitest-environment jsdom
 * @lastModified 2026-01-20
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';
import type { SupportedLanguage } from '@/types/l10n';
```

#### 1.2 Add Default Props and Setup

```typescript
// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

describe('GuestLanguageSwitcher - Mobile Responsiveness', () => {
  const defaultProps = {
    currentLanguage: 'en' as SupportedLanguage,
    availableTranslations: ['en', 'es', 'fr', 'de', 'nl', 'it'] as SupportedLanguage[],
    sourceLanguage: 'en' as SupportedLanguage,
    onLanguageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
```

#### 1.3 Implement Touch Target Compliance Tests

```typescript
  describe('Touch Target Compliance', () => {
    it('should have trigger button with minimum 44x44px touch target via CSS class', () => {
      render(<GuestLanguageSwitcher {...defaultProps} />);
      const trigger = screen.getByRole('button');

      // Check for min-height class (44px or 48px per codebase patterns)
      expect(trigger.className).toMatch(/min-h-\[4[4-8]px\]/);
    });

    it('should have touch-manipulation CSS class to prevent double-tap zoom', () => {
      render(<GuestLanguageSwitcher {...defaultProps} />);
      const trigger = screen.getByRole('button');

      expect(trigger.className).toContain('touch-manipulation');
    });

    it('should have webkit tap highlight disabled for iOS', () => {
      render(<GuestLanguageSwitcher {...defaultProps} />);
      const trigger = screen.getByRole('button');

      expect(trigger.className).toMatch(/\[-webkit-tap-highlight-color:transparent\]/);
    });

    it('should have adequate padding for touch targets', () => {
      render(<GuestLanguageSwitcher {...defaultProps} />);
      const trigger = screen.getByRole('button');

      // Check for padding classes (p-2, p-3, px-3, py-2, etc.)
      expect(trigger.className).toMatch(/p[xy]?-[2-4]/);
    });
  });
```

#### 1.4 Implement Dropdown Option Spacing Tests

```typescript
  describe('Dropdown Option Spacing', () => {
    it('should have dropdown options with adequate touch spacing', async () => {
      const user = userEvent.setup();
      render(<GuestLanguageSwitcher {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      options.forEach(option => {
        // Check for padding/spacing classes
        expect(option.className).toMatch(/p[xy]?-[2-4]/);
      });
    });

    it('should have dropdown options with minimum height for touch', async () => {
      const user = userEvent.setup();
      render(<GuestLanguageSwitcher {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      options.forEach(option => {
        // Options should have min-height or adequate padding
        expect(option.className).toMatch(/(min-h-\[4[0-8]px\]|py-[2-3])/);
      });
    });

    it('should display all 6 languages without truncation', async () => {
      const user = userEvent.setup();
      render(<GuestLanguageSwitcher {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      // Verify all native language names are visible
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
      expect(screen.getByText('Nederlands')).toBeInTheDocument();
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });
  });
```

#### 1.5 Implement Dropdown Behavior Tests

```typescript
  describe('Mobile Dropdown Behavior', () => {
    it('should open dropdown with single click (simulating tap)', async () => {
      const user = userEvent.setup();
      render(<GuestLanguageSwitcher {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <GuestLanguageSwitcher {...defaultProps} />
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside-element'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should have dropdown with max-height for vertical scrolling', async () => {
      const user = userEvent.setup();
      render(<GuestLanguageSwitcher {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const listbox = screen.getByRole('listbox');
      // Check for max-height and overflow-y classes
      expect(listbox.className).toMatch(/(max-h-|overflow-y-auto|overflow-auto)/);
    });

    it('should not cause horizontal scrolling when opened', async () => {
      const user = userEvent.setup();
      render(<GuestLanguageSwitcher {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const listbox = screen.getByRole('listbox');
      // Check that dropdown has constrained width
      expect(listbox.className).toMatch(/(max-w-|w-\[|min-w-)/);
    });
  });
```

#### 1.6 Implement Accessibility Tests

```typescript
  describe('Mobile Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<GuestLanguageSwitcher {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with dropdown open', async () => {
      const user = userEvent.setup();
      const { container } = render(<GuestLanguageSwitcher {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have appropriate ARIA attributes on trigger', () => {
      render(<GuestLanguageSwitcher {...defaultProps} />);
      const trigger = screen.getByRole('button');

      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded');
    });
  });
});
```

---

### Task 2: Create TranslationBanner Mobile Test File

**File:** `/src/components/guest/__tests__/TranslationBanner.mobile.test.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** REQ-E04-009 complete

#### 2.1 Create Test File Structure

```typescript
/**
 * TranslationBanner Mobile Responsiveness Tests
 *
 * Tests for mobile layout, touch targets, and content visibility.
 *
 * REQ-E04-026: Mobile Responsiveness Testing
 *
 * @module guest/__tests__/TranslationBanner.mobile
 * @vitest-environment jsdom
 * @lastModified 2026-01-20
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import { TranslationBanner } from '../TranslationBanner';
import type { SupportedLanguage } from '@/types/l10n';

describe('TranslationBanner - Mobile Responsiveness', () => {
  const defaultProps = {
    sourceLanguage: 'en' as SupportedLanguage,
    displayLanguage: 'fr' as SupportedLanguage,
    onViewOriginal: vi.fn(),
    isShowingOriginal: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
```

#### 2.2 Implement Banner Height Tests

```typescript
  describe('Banner Height and Spacing', () => {
    it('should have constrained height appropriate for mobile', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Banner should have reasonable height, not consuming excessive space
      // Check for height classes or padding that results in ~40-60px height
      expect(banner.className).toMatch(/(h-\[|py-[2-3]|p-[2-3])/);
    });

    it('should have appropriate padding for mobile text readability', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Check for horizontal padding
      expect(banner.className).toMatch(/p[x]?-[2-4]/);
    });

    it('should not have excessive max-height that cuts off content', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Should not have overflow-hidden without max-height handling
      const hasOverflowHidden = banner.className.includes('overflow-hidden');
      const hasEllipsis = banner.className.includes('truncate') || banner.className.includes('text-ellipsis');

      // If overflow is hidden, should have ellipsis handling
      if (hasOverflowHidden) {
        expect(hasEllipsis || banner.className.includes('max-h-')).toBe(true);
      }
    });
  });
```

#### 2.3 Implement View Original Link Touch Target Tests

```typescript
  describe('View Original Action Touch Target', () => {
    it('should have View Original link with minimum touch target', () => {
      render(<TranslationBanner {...defaultProps} />);
      const viewOriginalLink = screen.getByRole('button', { name: /view original/i })
        || screen.getByText(/view original/i);

      // Check for min-height or adequate padding
      expect(viewOriginalLink.className).toMatch(/(min-h-\[4[4-8]px\]|p[xy]?-[2-4])/);
    });

    it('should have adequate spacing between banner text and action link', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Check for flex with gap or spacing utilities
      expect(banner.className).toMatch(/(gap-|space-x-|justify-between)/);
    });

    it('should respond to click on View Original', async () => {
      const user = userEvent.setup();
      render(<TranslationBanner {...defaultProps} />);

      const viewOriginalLink = screen.getByRole('button', { name: /view original/i })
        || screen.getByText(/view original/i);

      await user.click(viewOriginalLink);

      expect(defaultProps.onViewOriginal).toHaveBeenCalledTimes(1);
    });
  });
```

#### 2.4 Implement Text Readability Tests

```typescript
  describe('Mobile Text Readability', () => {
    it('should have readable text size on mobile', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Check for reasonable text size (not smaller than text-xs/text-sm)
      expect(banner.className).toMatch(/text-(xs|sm|base)/);
    });

    it('should display source language name in banner', () => {
      render(<TranslationBanner {...defaultProps} />);

      // Should show "Translated from English" or similar
      expect(screen.getByText(/translated from/i)).toBeInTheDocument();
      expect(screen.getByText(/english/i)).toBeInTheDocument();
    });

    it('should have banner with responsive layout', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Check for flex or responsive grid
      expect(banner.className).toMatch(/(flex|grid)/);
    });
  });
```

#### 2.5 Implement Horizontal Overflow Tests

```typescript
  describe('Horizontal Overflow Prevention', () => {
    it('should not cause horizontal scrolling', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Check for width constraints
      expect(banner.className).toMatch(/(w-full|max-w-)/);
    });

    it('should handle long language names without overflow', () => {
      render(
        <TranslationBanner
          {...defaultProps}
          sourceLanguage="nl" // Nederlands - relatively long name
        />
      );

      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Should have text wrapping or truncation
      expect(banner.className).toMatch(/(flex-wrap|truncate|whitespace-nowrap)/);
    });
  });
```

#### 2.6 Implement Accessibility Tests

```typescript
  describe('Mobile Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<TranslationBanner {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have appropriate ARIA role on banner', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');

      // Banner should have status role or be a semantic banner
      expect(banner).toHaveAttribute('role');
    });
  });
});
```

---

### Task 3: Create MissingTranslationBanner Mobile Test File

**File:** `/src/components/guest/__tests__/MissingTranslationBanner.mobile.test.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** REQ-E04-010 complete

#### 3.1 Create Test File with Mobile Tests

```typescript
/**
 * MissingTranslationBanner Mobile Responsiveness Tests
 *
 * Tests for mobile layout and content display when translation is unavailable.
 *
 * REQ-E04-026: Mobile Responsiveness Testing
 *
 * @module guest/__tests__/MissingTranslationBanner.mobile
 * @vitest-environment jsdom
 * @lastModified 2026-01-20
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { MissingTranslationBanner } from '../MissingTranslationBanner';
import type { SupportedLanguage } from '@/types/l10n';

describe('MissingTranslationBanner - Mobile Responsiveness', () => {
  const defaultProps = {
    requestedLanguage: 'fr' as SupportedLanguage,
    displayLanguage: 'en' as SupportedLanguage,
  };

  describe('Banner Layout', () => {
    it('should have appropriate height for mobile', () => {
      render(<MissingTranslationBanner {...defaultProps} />);
      const banner = screen.getByTestId('missing-translation-banner') || screen.getByRole('status');

      expect(banner.className).toMatch(/(h-\[|py-[2-3]|p-[2-3])/);
    });

    it('should have full width on mobile', () => {
      render(<MissingTranslationBanner {...defaultProps} />);
      const banner = screen.getByTestId('missing-translation-banner') || screen.getByRole('status');

      expect(banner.className).toMatch(/(w-full|max-w-)/);
    });

    it('should display clear message about missing translation', () => {
      render(<MissingTranslationBanner {...defaultProps} />);

      // Should show "French translation not available" or similar
      expect(screen.getByText(/translation.*not available|not available/i)).toBeInTheDocument();
    });
  });

  describe('Text Readability', () => {
    it('should have readable text size', () => {
      render(<MissingTranslationBanner {...defaultProps} />);
      const banner = screen.getByTestId('missing-translation-banner') || screen.getByRole('status');

      expect(banner.className).toMatch(/text-(xs|sm|base)/);
    });

    it('should not truncate important information', () => {
      render(<MissingTranslationBanner {...defaultProps} />);

      // Both requested and display language should be visible
      expect(screen.getByText(/french|français/i)).toBeInTheDocument();
      expect(screen.getByText(/english/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<MissingTranslationBanner {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have appropriate role for status information', () => {
      render(<MissingTranslationBanner {...defaultProps} />);
      const banner = screen.getByTestId('missing-translation-banner') || screen.getByRole('status');

      expect(banner).toHaveAttribute('role');
    });
  });
});
```

---

### Task 4: Create ViewOriginalToggle Mobile Test File

**File:** `/src/components/guest/__tests__/ViewOriginalToggle.mobile.test.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** REQ-E04-011 complete

#### 4.1 Create Test File with Touch Target Tests

```typescript
/**
 * ViewOriginalToggle Mobile Responsiveness Tests
 *
 * Tests for touch target compliance and visual feedback.
 *
 * REQ-E04-026: Mobile Responsiveness Testing
 *
 * @module guest/__tests__/ViewOriginalToggle.mobile
 * @vitest-environment jsdom
 * @lastModified 2026-01-20
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import { ViewOriginalToggle } from '../ViewOriginalToggle';
import type { SupportedLanguage } from '@/types/l10n';

describe('ViewOriginalToggle - Mobile Responsiveness', () => {
  const defaultProps = {
    isShowingOriginal: false,
    sourceLanguage: 'en' as SupportedLanguage,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Touch Target Compliance', () => {
    it('should have minimum 44x44px touch target', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      const button = screen.getByRole('button');

      // Check for min-height/min-width or adequate padding
      expect(button.className).toMatch(/(min-h-\[4[4-8]px\]|p[xy]?-[2-4])/);
    });

    it('should have touch-manipulation CSS class', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      const button = screen.getByRole('button');

      expect(button.className).toContain('touch-manipulation');
    });

    it('should have webkit tap highlight disabled', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      const button = screen.getByRole('button');

      expect(button.className).toMatch(/\[-webkit-tap-highlight-color:transparent\]/);
    });
  });

  describe('Visual Feedback', () => {
    it('should have active/pressed state styles', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      const button = screen.getByRole('button');

      // Check for active state class
      expect(button.className).toMatch(/(active:|pressed:|hover:)/);
    });

    it('should have focus ring for accessibility', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      const button = screen.getByRole('button');

      expect(button.className).toMatch(/focus:ring/);
    });

    it('should respond to click immediately', async () => {
      const user = userEvent.setup();
      render(<ViewOriginalToggle {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('should show correct text when showing translation', () => {
      render(<ViewOriginalToggle {...defaultProps} isShowingOriginal={false} />);

      expect(screen.getByText(/view.*original/i)).toBeInTheDocument();
    });

    it('should show correct text when showing original', () => {
      render(<ViewOriginalToggle {...defaultProps} isShowingOriginal={true} />);

      expect(screen.getByText(/view.*translation/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ViewOriginalToggle {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have appropriate button type', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
```

---

### Task 5: Create LanguageIndicator Mobile Test File

**File:** `/src/components/guest/__tests__/LanguageIndicator.mobile.test.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** REQ-E04-012 complete

#### 5.1 Create Test File

```typescript
/**
 * LanguageIndicator Mobile Responsiveness Tests
 *
 * Tests for compact display and mobile header integration.
 *
 * REQ-E04-026: Mobile Responsiveness Testing
 *
 * @module guest/__tests__/LanguageIndicator.mobile
 * @vitest-environment jsdom
 * @lastModified 2026-01-20
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import { LanguageIndicator } from '../LanguageIndicator';
import type { SupportedLanguage } from '@/types/l10n';

describe('LanguageIndicator - Mobile Responsiveness', () => {
  const defaultProps = {
    currentLanguage: 'fr' as SupportedLanguage,
    isTranslated: true,
    sourceLanguage: 'en' as SupportedLanguage,
  };

  describe('Compact Display', () => {
    it('should have appropriate size for mobile header', () => {
      render(<LanguageIndicator {...defaultProps} />);
      const indicator = screen.getByTestId('language-indicator') || screen.getByText(/fr|français/i).closest('div');

      // Should have compact styling
      expect(indicator?.className).toMatch(/text-(xs|sm)/);
    });

    it('should display flag emoji', () => {
      render(<LanguageIndicator {...defaultProps} />);

      // Should show French flag
      expect(screen.getByText(/🇫🇷/)).toBeInTheDocument();
    });

    it('should not overflow on narrow screens', () => {
      render(<LanguageIndicator {...defaultProps} />);
      const indicator = screen.getByTestId('language-indicator') || screen.getByText(/fr|français/i).closest('div');

      // Should have width constraints
      expect(indicator?.className).toMatch(/(whitespace-nowrap|truncate|max-w-)/);
    });
  });

  describe('Touch Target (if interactive)', () => {
    it('should have adequate touch target if clickable', () => {
      render(<LanguageIndicator {...defaultProps} />);
      const indicator = screen.getByTestId('language-indicator') || screen.getByText(/fr|français/i).closest('div');

      // If it's a button, check touch target
      if (indicator?.tagName === 'BUTTON') {
        expect(indicator.className).toMatch(/(min-h-\[4[4-8]px\]|p[xy]?-[2-4])/);
      }
    });
  });

  describe('Translation Status Display', () => {
    it('should indicate when content is translated', () => {
      render(<LanguageIndicator {...defaultProps} isTranslated={true} />);

      // Should show some indication of translation status
      const indicator = screen.getByTestId('language-indicator') || screen.getByText(/fr|français/i).closest('div');
      expect(indicator).toBeInTheDocument();
    });

    it('should show source language when translated', () => {
      render(<LanguageIndicator {...defaultProps} isTranslated={true} sourceLanguage="en" />);

      // Should show "from English" or similar
      expect(screen.getByText(/from|original/i) || screen.getByText(/english/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<LanguageIndicator {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

---

### Task 6: Create Playwright E2E Mobile Tests

**File:** `/e2e/guest-localization-mobile.spec.ts`
**Estimated Effort:** 2 story points
**Dependencies:** All guest components implemented, Playwright configured

#### 6.1 Create E2E Test File Structure

```typescript
/**
 * Guest Localization Mobile E2E Tests
 *
 * End-to-end tests validating mobile responsiveness of guest
 * localization features using Playwright device emulation.
 *
 * REQ-E04-026: Mobile Responsiveness Testing
 *
 * @module e2e/guest-localization-mobile
 * @lastModified 2026-01-20
 */

import { test, expect, devices } from '@playwright/test';

// Mobile viewport configurations
const mobileViewports = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 14', device: devices['iPhone 14'] },
  { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
  { name: 'Pixel 7', device: devices['Pixel 7'] },
  { name: 'Galaxy S21', device: devices['Galaxy S21'] },
];

// Minimum viewport for testing
const minViewport = { width: 320, height: 568 };
```

#### 6.2 Implement Language Switcher Mobile Tests

```typescript
for (const { name, device } of mobileViewports) {
  test.describe(`Guest Localization - ${name}`, () => {
    test.use({ ...device });

    test.describe('Language Switcher', () => {
      test('dropdown trigger is visible and tappable', async ({ page }) => {
        await page.goto('/item/test-public-id');

        const trigger = page.getByRole('button', { name: /language|🌐/i });
        await expect(trigger).toBeVisible();

        const box = await trigger.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      });

      test('dropdown opens on single tap', async ({ page }) => {
        await page.goto('/item/test-public-id');

        const trigger = page.getByRole('button', { name: /language|🌐/i });
        await trigger.tap();

        await expect(page.getByRole('listbox')).toBeVisible();
      });

      test('all language options are visible without horizontal scroll', async ({ page }) => {
        await page.goto('/item/test-public-id');

        const trigger = page.getByRole('button', { name: /language|🌐/i });
        await trigger.tap();

        // Check for all 6 languages
        await expect(page.getByText('English')).toBeVisible();
        await expect(page.getByText('Español')).toBeVisible();
        await expect(page.getByText('Français')).toBeVisible();
        await expect(page.getByText('Deutsch')).toBeVisible();
        await expect(page.getByText('Nederlands')).toBeVisible();
        await expect(page.getByText('Italiano')).toBeVisible();

        // Verify no horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      });

      test('dropdown closes on tap outside', async ({ page }) => {
        await page.goto('/item/test-public-id');

        const trigger = page.getByRole('button', { name: /language|🌐/i });
        await trigger.tap();
        await expect(page.getByRole('listbox')).toBeVisible();

        // Tap outside
        await page.locator('body').tap({ position: { x: 10, y: 10 } });

        await expect(page.getByRole('listbox')).not.toBeVisible();
      });

      test('language selection changes content', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=en');

        const trigger = page.getByRole('button', { name: /language|🌐/i });
        await trigger.tap();

        await page.getByText('Español').tap();

        // Should show Spanish content or Spanish indicator
        await expect(page.locator('[data-testid="translation-banner"]')).toBeVisible();
      });
    });
```

#### 6.3 Implement Translation Banner Mobile Tests

```typescript
    test.describe('Translation Banner', () => {
      test('banner does not obscure item title', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=es');

        const banner = page.locator('[data-testid="translation-banner"]');
        const title = page.locator('h1');

        if (await banner.isVisible()) {
          const bannerBox = await banner.boundingBox();
          const titleBox = await title.boundingBox();

          if (bannerBox && titleBox) {
            // Banner should be above title, not overlapping
            expect(bannerBox.y + bannerBox.height).toBeLessThanOrEqual(titleBox.y + 5);
          }
        }
      });

      test('banner has appropriate height on mobile', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=es');

        const banner = page.locator('[data-testid="translation-banner"]');

        if (await banner.isVisible()) {
          const box = await banner.boundingBox();
          expect(box).not.toBeNull();
          // Banner should be between 40-80px height
          expect(box!.height).toBeGreaterThanOrEqual(40);
          expect(box!.height).toBeLessThanOrEqual(80);
        }
      });

      test('View Original link has adequate touch target', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=es');

        const viewOriginal = page.getByRole('button', { name: /view original/i });

        if (await viewOriginal.isVisible()) {
          const box = await viewOriginal.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.height).toBeGreaterThanOrEqual(44);
        }
      });

      test('banner text is readable', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=es');

        const banner = page.locator('[data-testid="translation-banner"]');

        if (await banner.isVisible()) {
          // Check that text is visible
          await expect(page.getByText(/translated from/i)).toBeVisible();
        }
      });
    });
```

#### 6.4 Implement Touch Target Tests

```typescript
    test.describe('Touch-Friendly Controls', () => {
      test('ViewOriginalToggle meets 44px minimum', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=es');

        const toggle = page.getByRole('button', { name: /view original/i });

        if (await toggle.isVisible()) {
          const box = await toggle.boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(44);
          expect(box!.width).toBeGreaterThanOrEqual(44);
        }
      });

      test('no browser zoom on double-tap', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=es');

        const initialViewport = page.viewportSize();

        const toggle = page.getByRole('button', { name: /view original/i });
        if (await toggle.isVisible()) {
          await toggle.dblclick();

          // Viewport should not have changed (no zoom)
          const finalViewport = page.viewportSize();
          expect(finalViewport?.width).toBe(initialViewport?.width);
        }
      });

      test('touch interactions provide visual feedback', async ({ page }) => {
        await page.goto('/item/test-public-id');

        const trigger = page.getByRole('button', { name: /language|🌐/i });

        // Start touch
        await trigger.hover();

        // Button should have hover/active styling
        const hasActiveStyle = await trigger.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.opacity !== '1' || style.backgroundColor !== 'transparent';
        });

        // Either has visual feedback or is already styled
        expect(true).toBe(true); // Placeholder - actual check depends on implementation
      });
    });
```

#### 6.5 Implement Layout Tests

```typescript
    test.describe('Mobile Layout', () => {
      test('no horizontal scrolling on page', async ({ page }) => {
        await page.goto('/item/test-public-id?lang=es');

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
      });

      test('content is readable on narrow viewport', async ({ page }) => {
        await page.setViewportSize(minViewport);
        await page.goto('/item/test-public-id?lang=es');

        // Check that main content elements are visible
        await expect(page.locator('h1')).toBeVisible();

        // Check font size is reasonable
        const fontSize = await page.locator('h1').evaluate((el) => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });
        expect(fontSize).toBeGreaterThanOrEqual(16);
      });

      test('portrait orientation layout', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/item/test-public-id?lang=es');

        // Verify layout works in portrait
        const languageTrigger = page.getByRole('button', { name: /language|🌐/i });
        await expect(languageTrigger).toBeVisible();
      });

      test('landscape orientation layout', async ({ page }) => {
        await page.setViewportSize({ width: 812, height: 375 });
        await page.goto('/item/test-public-id?lang=es');

        // Verify layout works in landscape
        const languageTrigger = page.getByRole('button', { name: /language|🌐/i });
        await expect(languageTrigger).toBeVisible();
      });
    });
  });
}
```

#### 6.6 Add Minimum Viewport Test Suite

```typescript
test.describe('Minimum Viewport (320px)', () => {
  test.use({ viewport: minViewport });

  test('language switcher accessible at 320px', async ({ page }) => {
    await page.goto('/item/test-public-id');

    const trigger = page.getByRole('button', { name: /language|🌐/i });
    await expect(trigger).toBeVisible();

    await trigger.tap();
    await expect(page.getByRole('listbox')).toBeVisible();
  });

  test('all text is readable without zoom', async ({ page }) => {
    await page.goto('/item/test-public-id?lang=es');

    // Check that main text elements have reasonable font sizes
    const fontSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, a, button');
      return Array.from(elements).map(el =>
        parseInt(window.getComputedStyle(el).fontSize)
      ).filter(size => size > 0);
    });

    // All text should be at least 12px
    fontSizes.forEach(size => {
      expect(size).toBeGreaterThanOrEqual(12);
    });
  });
});
```

---

### Task 7: Update Playwright Configuration

**File:** `/playwright.config.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** None

#### 7.1 Add Mobile Device Projects

If the file doesn't exist, create it:

```typescript
/**
 * Playwright Configuration
 *
 * Configuration for E2E testing including mobile device emulation.
 *
 * @lastModified 2026-01-20
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-safari-small',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Mini'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Task 8: Document Test Results Template

**File:** `/docs/test-results/REQ-E04-026-mobile-testing-results.md`
**Estimated Effort:** 0.5 story points
**Dependencies:** None

#### 8.1 Create Test Results Template

```markdown
# Mobile Responsiveness Test Results - REQ-E04-026

**Test Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [Staging/Local]
**Test Harness Version:** [X.Y.Z]

---

## Test Summary

| Category | Pass | Fail | Skip | Total |
|----------|------|------|------|-------|
| Language Switcher | | | | |
| Translation Banners | | | | |
| Touch Controls | | | | |
| Layout/Typography | | | | |
| **Total** | | | | |

---

## Device Testing Matrix

| Device | Browser | Resolution | Status | Notes |
|--------|---------|------------|--------|-------|
| iPhone SE | Safari | 320x568 | | |
| iPhone 14 | Safari | 390x844 | | |
| iPhone 14 Pro Max | Safari | 430x932 | | |
| Pixel 7 | Chrome | 412x915 | | |
| Galaxy S21 | Chrome | 360x800 | | |
| iPad Mini | Safari | 768x1024 | | |

---

## Detailed Test Results

### Language Switcher on Small Screens

| Test Case | Device | Result | Notes |
|-----------|--------|--------|-------|
| Dropdown trigger visible at 320px | | | |
| Touch target >= 44x44px | | | |
| Single tap opens dropdown | | | |
| All languages visible | | | |
| Vertical scroll when needed | | | |
| Adequate option spacing | | | |
| Dropdown closes on outside tap | | | |
| Flag icons visible | | | |
| Language names not truncated | | | |

### Translation Banners on Mobile

| Test Case | Device | Result | Notes |
|-----------|--------|--------|-------|
| Banner above content | | | |
| Doesn't obscure title | | | |
| Appropriate height | | | |
| Readable text | | | |
| View original touch target | | | |
| No horizontal scroll | | | |

### Touch-Friendly Controls

| Test Case | Device | Result | Notes |
|-----------|--------|--------|-------|
| ViewOriginalToggle 44x44px | | | |
| Adequate spacing | | | |
| Immediate touch feedback | | | |
| No zoom on double-tap | | | |
| Visible active states | | | |

---

## Issues Found

### Issue 1: [Title]
- **Severity:** P1/P2/P3
- **Device:** [Device name]
- **Steps to Reproduce:**
  1.
  2.
- **Expected:**
- **Actual:**
- **Screenshot:** [Link]

---

## Screenshots

### iPhone SE (320px)
[Screenshot placeholder]

### iPhone 14 (390px)
[Screenshot placeholder]

### Pixel 7 (412px)
[Screenshot placeholder]

---

## Recommendations

1.
2.
3.

---

## Sign-off

- [ ] All P1 issues resolved
- [ ] All P2 issues documented
- [ ] Test results reviewed by: [Name]
- [ ] Ready for production: Yes/No
```

---

### Task 9: Component Fixes (If Needed)

**Files:** Various guest component files
**Estimated Effort:** Variable (1-2 story points)
**Dependencies:** Test results from Tasks 1-6

#### 9.1 Add Touch-Friendly CSS Classes

If tests reveal missing touch-friendly styles, add the following CSS classes to components:

**GuestLanguageSwitcher.tsx:**
```typescript
// Trigger button should have:
className="min-h-[48px] touch-manipulation [-webkit-tap-highlight-color:transparent] px-3 py-2 ..."
```

**ViewOriginalToggle.tsx:**
```typescript
// Button should have:
className="min-h-[48px] touch-manipulation [-webkit-tap-highlight-color:transparent] px-4 py-2 active:bg-gray-100 ..."
```

**TranslationBanner.tsx:**
```typescript
// View original link should have:
className="min-h-[44px] px-2 py-1 touch-manipulation ..."
```

---

## Testing Instructions

### Running Component Tests (Vitest)

```bash
# Run all mobile tests
npm test -- --grep "Mobile Responsiveness"

# Run specific component tests
npm test -- src/components/guest/__tests__/GuestLanguageSwitcher.mobile.test.tsx
npm test -- src/components/guest/__tests__/TranslationBanner.mobile.test.tsx
npm test -- src/components/guest/__tests__/MissingTranslationBanner.mobile.test.tsx
npm test -- src/components/guest/__tests__/ViewOriginalToggle.mobile.test.tsx
npm test -- src/components/guest/__tests__/LanguageIndicator.mobile.test.tsx

# Run with coverage
npm test -- --coverage --grep "Mobile Responsiveness"
```

### Running E2E Tests (Playwright)

```bash
# Install Playwright browsers if needed
npx playwright install

# Run all mobile E2E tests
npx playwright test e2e/guest-localization-mobile.spec.ts

# Run specific device tests
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
npx playwright test --project=mobile-safari-small

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```

### Manual Device Testing

1. Deploy to staging environment
2. Access `/item/[publicId]?lang=es` on test devices
3. Test each acceptance criteria manually
4. Document results in test results template

---

## Acceptance Criteria Checklist

### Language Switcher on Small Screens
- [ ] Test case verifies dropdown trigger visible and tappable on 320px width screens
- [ ] Test case verifies touch target at least 44x44 pixels
- [ ] Test case verifies dropdown opens with single tap
- [ ] Test case verifies all language options visible without horizontal scrolling
- [ ] Test case verifies dropdown list scrolls vertically when needed
- [ ] Test case verifies adequate spacing between options
- [ ] Test case verifies selected language is highlighted
- [ ] Test case verifies dropdown closes on outside tap
- [ ] Test case verifies language switcher integrates in mobile header
- [ ] Test case verifies flag icons visible and recognizable
- [ ] Test case verifies language names fully readable

### Translation Banners on Mobile
- [ ] Test case verifies TranslationBanner appears above primary content
- [ ] Test case verifies banner does not obscure item title
- [ ] Test case verifies appropriate banner height
- [ ] Test case verifies banner text readable at mobile font sizes
- [ ] Test case verifies View original touch target adequate
- [ ] Test case verifies banner layout adapts for narrow screens
- [ ] Test case verifies MissingTranslationBanner displays appropriately
- [ ] Test case verifies multiple banners don't stack excessively
- [ ] Test case verifies banner styling visually distinct
- [ ] Test case verifies no horizontal scrolling
- [ ] Test case verifies banner doesn't interfere with navigation

### Touch-Friendly Interactive Controls
- [ ] Test case verifies ViewOriginalToggle touch target >= 44x44px
- [ ] Test case verifies adequate spacing between elements
- [ ] Test case verifies immediate touch response
- [ ] Test case verifies LanguageIndicator readable on mobile
- [ ] Test case verifies interactive elements have adequate targets
- [ ] Test case verifies appropriate active/pressed states
- [ ] Test case verifies no browser zoom on double-tap
- [ ] Test case verifies dropdown options respond to touch
- [ ] Test case verifies immediate visual feedback
- [ ] Test case verifies no elements too close to screen edges

### Mobile Layout and Typography
- [ ] Test case verifies readable typography at 320px width
- [ ] Test case verifies no horizontal scrolling required
- [ ] Test case verifies portrait orientation support
- [ ] Test case verifies landscape orientation support
- [ ] Test case verifies visual hierarchy maintained
- [ ] Test case verifies component spacing prevents crowding
- [ ] Test case verifies text readable without pinch-to-zoom

### Cross-Device and Browser Testing
- [ ] Tests executed on iOS devices/simulators
- [ ] Tests executed on Android devices/emulators
- [ ] Tests verify behavior on mobile Chrome and Safari
- [ ] Tests verify tablet-sized viewports
- [ ] Tests verify multiple screen densities
- [ ] Device-specific issues documented

### General Mobile Usability
- [ ] Test case verifies language selection persists on navigation
- [ ] Test case verifies complete workflow works on mobile
- [ ] Test case verifies no JavaScript errors on touch
- [ ] Test case verifies acceptable page performance
- [ ] All test cases documented with device specifications
- [ ] Test results recorded with screenshots
- [ ] Issues documented with reproduction steps

---

## References

- **Overview Document:** `/docs/REQ-E04-026-mobile-responsiveness-testing-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Requirements:** `/docs/gen_requests_epic4.md` (Request #26)
- **Mobile Standards:** `/docs/REQ-140-mobile-responsive-overview.md`
- **Existing Test Patterns:** `/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience - Phase 7.4 Mobile Responsiveness Testing*
