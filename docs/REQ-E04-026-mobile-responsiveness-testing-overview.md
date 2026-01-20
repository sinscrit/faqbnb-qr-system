# Implementation Overview: REQ-E04-026 - Mobile Responsiveness Testing

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E04-026
**Epic:** Epic 4 - Guest Experience
**Phase:** 7 - Testing & Polish
**Task ID:** 7.4
**Request Type:** ENHANCEMENT
**Size:** M

---

## Summary

This document outlines the implementation approach for comprehensive mobile responsiveness testing of guest localization features. The testing validates that the GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, and LanguageIndicator components function correctly on mobile devices with proper touch targets, appropriate banner positioning, and accessible interactive controls.

---

## Background & Context

### Current State

Guest localization components have been implemented including:
- **GuestLanguageSwitcher** - Dropdown for language selection
- **TranslationBanner** - Shows "Translated from [Language]" with view original action
- **MissingTranslationBanner** - Displays when requested translation is unavailable
- **ViewOriginalToggle** - Button to switch between translated and original content
- **LanguageIndicator** - Header component showing current display language

These components need systematic mobile responsiveness validation to ensure:
1. Language switcher dropdown is accessible on small screens
2. Translation banners don't obscure critical content
3. All interactive controls meet touch target requirements

### Existing Mobile Patterns in Codebase

The codebase has established mobile responsiveness standards documented in `/docs/REQ-140-mobile-responsive-overview.md`:

| Pattern | Implementation | Reference |
|---------|---------------|-----------|
| **Touch Target Minimum** | 48px height (`min-h-[48px]`) | SortMenu.tsx, ActionButtons.tsx |
| **Mobile Breakpoint** | Tailwind `md:` at 768px (Airbnb uses 744px) | REQ-140 documentation |
| **Touch Manipulation** | `touch-manipulation` CSS class | SortMenu.tsx:154 |
| **iOS Tap Highlight** | `[-webkit-tap-highlight-color:transparent]` | SortMenu.tsx:155 |
| **Responsive Grid** | `grid-cols-1 md:grid-cols-3` | ItemDisplay.tsx |
| **Focus States** | `focus:ring-2 focus:ring-offset-1` | Standard pattern |

### Test Framework Available

- **Vitest v4.0.16** - Unit and component testing
- **Playwright v1.55.0** - End-to-end testing with device emulation
- **@testing-library/react v16.3.1** - Component testing utilities
- **vitest-axe v0.1.0** - Accessibility testing
- **jsdom v27.4.0** - DOM simulation for component tests

---

## Implementation Approach

### Test Categories

#### 1. Language Switcher Mobile Validation

Test the GuestLanguageSwitcher component on small screens to ensure:
- Dropdown trigger visible and tappable at 320px width
- Touch target meets 44x44px iOS guideline minimum
- Dropdown opens with single tap (no double-tap required)
- All language options visible without horizontal scroll
- Vertical scroll available when options exceed viewport
- Adequate spacing between options to prevent mis-taps
- Dropdown closes when tapping outside
- Flag icons and language names remain readable

#### 2. Translation Banner Mobile Validation

Test TranslationBanner and MissingTranslationBanner positioning:
- Banners appear above content without obscuring titles
- Banner height appropriate for mobile (not consuming excessive space)
- Text remains readable at mobile font sizes
- "View original" action link has adequate touch target
- Multiple banners don't stack excessively
- Banners don't cause horizontal scrolling
- Banner persistence doesn't interfere with navigation gestures

#### 3. Touch-Friendly Controls Validation

Test all interactive elements for touch accessibility:
- ViewOriginalToggle button has minimum 44x44px touch target
- Adequate spacing between adjacent interactive elements
- Immediate visual feedback on touch
- No browser zoom triggered by double-tapping controls
- Active/pressed states visible on touch devices

#### 4. Layout and Typography Validation

Verify responsive layout behavior:
- Components maintain readable typography on 320px screens
- No horizontal scrolling required
- Portrait and landscape orientations supported
- Visual hierarchy maintained on small screens
- Component spacing prevents crowding

### Viewport Sizes to Test

| Viewport | Device Example | Classification |
|----------|---------------|----------------|
| 320px | iPhone SE (1st gen) | Minimum mobile |
| 375px | iPhone 12/13/14 | Standard mobile |
| 390px | iPhone 12/13/14 Pro | Standard mobile |
| 414px | iPhone 8 Plus | Large mobile |
| 768px | iPad Mini | Tablet |
| 1024px | iPad Pro 11" | Large tablet |
| 1440px | Desktop | Desktop baseline |

### Browser/Device Coverage

| Platform | Browser | Priority |
|----------|---------|----------|
| iOS | Safari | P1 - Critical |
| iOS | Chrome | P2 - Important |
| Android | Chrome | P1 - Critical |
| Android | Samsung Internet | P3 - Nice to have |

---

## Test Implementation Details

### Test File Location

```
/src/components/guest/__tests__/
├── GuestLanguageSwitcher.mobile.test.tsx
├── TranslationBanner.mobile.test.tsx
├── MissingTranslationBanner.mobile.test.tsx
├── ViewOriginalToggle.mobile.test.tsx
└── LanguageIndicator.mobile.test.tsx

/e2e/
└── guest-localization-mobile.spec.ts
```

### Vitest Component Test Pattern

```typescript
// Example: GuestLanguageSwitcher.mobile.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';
import { axe } from 'vitest-axe';

describe('GuestLanguageSwitcher - Mobile Responsiveness', () => {
  const defaultProps = {
    currentLanguage: 'en' as const,
    availableTranslations: ['en', 'es', 'fr'] as const[],
    sourceLanguage: 'en' as const,
    onLanguageChange: vi.fn(),
  };

  describe('Touch Target Compliance', () => {
    it('should have trigger button with minimum 44x44px touch target', () => {
      render(<GuestLanguageSwitcher {...defaultProps} />);
      const trigger = screen.getByRole('button');
      const styles = getComputedStyle(trigger);
      // Check for min-height class or computed dimensions
      expect(trigger.className).toMatch(/min-h-\[4[4-8]px\]/);
    });

    it('should have adequate spacing between dropdown options', () => {
      render(<GuestLanguageSwitcher {...defaultProps} />);
      // Open dropdown and verify option spacing
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<GuestLanguageSwitcher {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

### Playwright E2E Test Pattern

```typescript
// Example: guest-localization-mobile.spec.ts
import { test, expect, devices } from '@playwright/test';

const mobileViewports = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 14', device: devices['iPhone 14'] },
  { name: 'Pixel 7', device: devices['Pixel 7'] },
];

for (const { name, device } of mobileViewports) {
  test.describe(`Guest Localization - ${name}`, () => {
    test.use({ ...device });

    test('language switcher dropdown opens on tap', async ({ page }) => {
      await page.goto('/item/test-public-id?lang=en');
      const trigger = page.getByRole('button', { name: /language/i });
      await trigger.tap();
      await expect(page.getByRole('listbox')).toBeVisible();
    });

    test('translation banner does not obscure item title', async ({ page }) => {
      await page.goto('/item/test-public-id?lang=es');
      const banner = page.locator('[data-testid="translation-banner"]');
      const title = page.locator('h1');

      const bannerBox = await banner.boundingBox();
      const titleBox = await title.boundingBox();

      // Banner should be above title, not overlapping
      expect(bannerBox.y + bannerBox.height).toBeLessThanOrEqual(titleBox.y);
    });

    test('touch targets meet 44px minimum', async ({ page }) => {
      await page.goto('/item/test-public-id?lang=es');
      const toggle = page.getByRole('button', { name: /view original/i });
      const box = await toggle.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    });
  });
}
```

---

## Acceptance Criteria Mapping

### AC-1: Language Switcher on Small Screens

| Criterion | Test Type | Validation Method |
|-----------|-----------|-------------------|
| Visible at 320px width | E2E | Viewport test |
| 44x44px touch target | Component | CSS class check |
| Single tap opens dropdown | E2E | Tap interaction |
| No horizontal scroll | E2E | Overflow check |
| Vertical scroll when needed | E2E | Scroll behavior |
| Adequate option spacing | Component | Class inspection |
| Dropdown closes on outside tap | E2E | Tap outside |
| Flag icons readable | Visual | Screenshot comparison |
| Language names not truncated | Component | Text content check |

### AC-2: Translation Banners on Mobile

| Criterion | Test Type | Validation Method |
|-----------|-----------|-------------------|
| Appears above primary content | E2E | Bounding box comparison |
| Doesn't obscure item title | E2E | Layout validation |
| Appropriate banner height | Component | CSS inspection |
| Readable text at mobile sizes | Visual | Font size check |
| Adequate "View original" touch target | E2E | Touch target measurement |
| No horizontal scrolling | E2E | Viewport overflow |
| Multiple banners don't stack excessively | E2E | Height measurement |

### AC-3: Touch-Friendly Interactive Controls

| Criterion | Test Type | Validation Method |
|-----------|-----------|-------------------|
| ViewOriginalToggle 44x44px target | E2E | Bounding box |
| Adequate spacing between elements | Component | Margin/padding check |
| Immediate touch feedback | E2E | Active state detection |
| No browser zoom on double-tap | E2E | Viewport unchanged |
| Visible active/pressed states | Component | CSS class presence |

### AC-4: Mobile Layout and Typography

| Criterion | Test Type | Validation Method |
|-----------|-----------|-------------------|
| Readable at 320px | E2E | Font size verification |
| No horizontal scroll | E2E | `overflow-x: hidden` |
| Portrait orientation support | E2E | Orientation change |
| Landscape orientation support | E2E | Orientation change |
| Visual hierarchy maintained | Visual | Screenshot review |

---

## Authorized Files and Functions for Modification

### Test Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/__tests__/GuestLanguageSwitcher.mobile.test.tsx` | Component mobile tests |
| `/src/components/guest/__tests__/TranslationBanner.mobile.test.tsx` | Banner mobile tests |
| `/src/components/guest/__tests__/MissingTranslationBanner.mobile.test.tsx` | Missing banner tests |
| `/src/components/guest/__tests__/ViewOriginalToggle.mobile.test.tsx` | Toggle mobile tests |
| `/src/components/guest/__tests__/LanguageIndicator.mobile.test.tsx` | Indicator mobile tests |
| `/e2e/guest-localization-mobile.spec.ts` | E2E mobile tests |

### Component Files That May Need Adjustment

| File Path | Potential Changes |
|-----------|------------------|
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Add `min-h-[44px]`, `touch-manipulation` if missing |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Add mobile-responsive spacing if needed |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Adjust mobile padding if needed |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Ensure 44px touch target |
| `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx` | Mobile header integration |

### Configuration Files

| File Path | Potential Changes |
|-----------|------------------|
| `/vitest.config.ts` | No changes expected |
| `/playwright.config.ts` | Add mobile device configurations if missing |

---

## Dependencies

### Prerequisites

- REQ-E04-008: GuestLanguageSwitcher component must be implemented
- REQ-E04-009: TranslationBanner component must be implemented
- REQ-E04-010: MissingTranslationBanner component must be implemented
- REQ-E04-011: ViewOriginalToggle component must be implemented
- REQ-E04-012: LanguageIndicator component must be implemented

### Epic Dependencies

- Epic 1 (Foundation) - i18n infrastructure
- Epic 3 (Dynamic Content) - Translation data available

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Components not yet implemented | Medium | High | Run tests after component implementation |
| Inconsistent mobile rendering across browsers | Medium | Medium | Test on actual devices, not just emulators |
| Touch target issues in third-party components | Low | Medium | Wrap Radix UI components with touch-friendly containers |
| Banner height varies with translation length | Medium | Low | Set max-height with ellipsis overflow |

---

## Test Execution Plan

### Phase 1: Component Tests (Vitest)

1. Create mobile test files for each guest component
2. Verify touch target sizing via CSS class inspection
3. Test accessibility with vitest-axe
4. Run with `npm test` or `npx vitest`

### Phase 2: E2E Tests (Playwright)

1. Configure mobile device emulation in playwright.config.ts
2. Create guest-localization-mobile.spec.ts
3. Test actual interactions on emulated devices
4. Run with `npx playwright test --project=mobile`

### Phase 3: Manual Device Testing

1. Test on physical iOS device (Safari)
2. Test on physical Android device (Chrome)
3. Document any device-specific issues
4. Screenshot critical interactions

### Phase 4: Issue Documentation

1. Log any mobile responsiveness issues found
2. Prioritize by severity (P1-P3)
3. Create fix tasks if adjustments needed

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| All component tests pass | 100% | Vitest test results |
| All E2E mobile tests pass | 100% | Playwright test results |
| No accessibility violations | 0 errors | vitest-axe results |
| Touch targets >= 44px | All controls | Automated measurement |
| No horizontal scroll | All viewports | Automated check |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Mobile Responsive Standards:** `/docs/REQ-140-mobile-responsive-overview.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-E04-026)
- **Existing Test Patterns:** `/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`
- **Radix UI Patterns:** `/src/components/ItemManager/components/dialogs/SortMenu.tsx`

---

## Implementation Notes

1. **Touch Target Standard:** Use 44x44px minimum per iOS guidelines (48px preferred per codebase patterns)
2. **CSS Classes to Apply:** `min-h-[48px]`, `touch-manipulation`, `[-webkit-tap-highlight-color:transparent]`
3. **Test Data-Testid Attributes:** Ensure components have `data-testid` for E2E testing
4. **Viewport Meta:** Page should have `width=device-width, initial-scale=1.0` (already present)

---

*Document generated for FAQBNB L10N Epic 4 - Guest Experience - Phase 7.4 Mobile Responsiveness Testing*
