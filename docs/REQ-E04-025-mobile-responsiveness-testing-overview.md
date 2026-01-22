# Implementation Breakdown: REQ-E04-025 Mobile Responsiveness Testing

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E04-025 |
| **Title** | Mobile Responsiveness Testing |
| **Type** | TESTING |
| **Size** | S (2-3 hours) |
| **Epic** | L10N Epic 4 - Guest Experience |
| **Status** | PENDING |
| **Created** | 2026-01-22 19:59 |
| **Modified** | 2026-01-22 19:59 |

## Goals

Create comprehensive tests and verify mobile responsiveness for all guest-facing localization components. Ensure the language switcher, translation banners, and toggle buttons work well on small screens and are touch-friendly. All components must provide accessible touch targets (minimum 44x44px) and display correctly on mobile devices ranging from 320px to 768px width.

## Implementation Plan

### 1. **Create Mobile Test Fixture Helpers**

**File**: `/src/components/__tests__/fixtures/mobileTestHelpers.ts` (NEW)

Create reusable test utilities for mobile viewport testing:

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Standard mobile breakpoints
export const MOBILE_BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
} as const;

/**
 * Simulates a mobile viewport by setting window.innerWidth and firing resize event
 */
export function setMobileViewport(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

/**
 * Renders a component with mobile viewport simulation
 */
export function renderWithMobileViewport(
  ui: ReactElement,
  width: number = MOBILE_BREAKPOINTS.medium,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  setMobileViewport(width);
  return render(ui, options);
}

/**
 * Checks if an element meets minimum touch target size (44x44px)
 */
export function isTouchTargetAccessible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
}

/**
 * Gets computed styles for responsive checks
 */
export function getResponsiveStyles(element: HTMLElement) {
  return {
    display: window.getComputedStyle(element).display,
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    fontSize: window.getComputedStyle(element).fontSize,
    padding: window.getComputedStyle(element).padding,
  };
}

/**
 * Simulates touch interaction (useful for dropdown testing)
 */
export function simulateTouch(element: HTMLElement): void {
  const touchEvent = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [new Touch({
      identifier: 0,
      target: element,
      clientX: 0,
      clientY: 0,
    })],
  });
  element.dispatchEvent(touchEvent);
}
```

**Test Coverage**: Helper utilities for viewport simulation, touch target validation, and responsive style checking.

---

### 2. **Create GuestLanguageSwitcher Mobile Tests**

**File**: `/src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx` (NEW)

Test the language switcher dropdown on mobile:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
import {
  renderWithMobileViewport,
  isTouchTargetAccessible,
  MOBILE_BREAKPOINTS,
  setMobileViewport,
} from './fixtures/mobileTestHelpers';

describe('GuestLanguageSwitcher - Mobile Responsiveness', () => {
  const mockOnLanguageChange = vi.fn();
  const availableLanguages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

  beforeEach(() => {
    mockOnLanguageChange.mockClear();
  });

  afterEach(() => {
    // Reset viewport
    setMobileViewport(1024);
  });

  describe('Small Mobile (320px)', () => {
    it('renders correctly at 320px width', () => {
      renderWithMobileViewport(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableLanguages={availableLanguages}
          onLanguageChange={mockOnLanguageChange}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const trigger = screen.getByRole('button', { name: /language/i });
      expect(trigger).toBeInTheDocument();
    });

    it('trigger button meets touch target size requirements', () => {
      renderWithMobileViewport(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableLanguages={availableLanguages}
          onLanguageChange={mockOnLanguageChange}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const trigger = screen.getByRole('button', { name: /language/i });
      expect(isTouchTargetAccessible(trigger)).toBe(true);
    });
  });

  describe('Medium Mobile (375px)', () => {
    it('dropdown opens correctly on mobile', async () => {
      const user = userEvent.setup();

      renderWithMobileViewport(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableLanguages={availableLanguages}
          onLanguageChange={mockOnLanguageChange}
        />,
        MOBILE_BREAKPOINTS.medium
      );

      const trigger = screen.getByRole('button', { name: /language/i });
      await user.click(trigger);

      // Dropdown should be open
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('all language options meet touch target requirements', async () => {
      const user = userEvent.setup();

      renderWithMobileViewport(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableLanguages={availableLanguages}
          onLanguageChange={mockOnLanguageChange}
        />,
        MOBILE_BREAKPOINTS.medium
      );

      const trigger = screen.getByRole('button', { name: /language/i });
      await user.click(trigger);

      const menuItems = screen.getAllByRole('menuitem');

      // Each menu item should meet 44x44px minimum
      menuItems.forEach(item => {
        expect(isTouchTargetAccessible(item)).toBe(true);
      });
    });

    it('dropdown closes when selecting a language', async () => {
      const user = userEvent.setup();

      renderWithMobileViewport(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableLanguages={availableLanguages}
          onLanguageChange={mockOnLanguageChange}
        />,
        MOBILE_BREAKPOINTS.medium
      );

      const trigger = screen.getByRole('button', { name: /language/i });
      await user.click(trigger);

      const frenchOption = screen.getByRole('menuitem', { name: /français/i });
      await user.click(frenchOption);

      expect(mockOnLanguageChange).toHaveBeenCalledWith('fr');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Tablet (768px)', () => {
    it('maintains functionality at tablet width', async () => {
      const user = userEvent.setup();

      renderWithMobileViewport(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableLanguages={availableLanguages}
          onLanguageChange={mockOnLanguageChange}
        />,
        MOBILE_BREAKPOINTS.tablet
      );

      const trigger = screen.getByRole('button', { name: /language/i });
      await user.click(trigger);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getAllByRole('menuitem')).toHaveLength(6);
    });
  });

  describe('Dropdown Positioning', () => {
    it('dropdown does not extend beyond viewport on small screens', async () => {
      const user = userEvent.setup();

      renderWithMobileViewport(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableLanguages={availableLanguages}
          onLanguageChange={mockOnLanguageChange}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const trigger = screen.getByRole('button', { name: /language/i });
      await user.click(trigger);

      const menu = screen.getByRole('menu');
      const menuRect = menu.getBoundingClientRect();

      // Menu should not extend beyond viewport
      expect(menuRect.right).toBeLessThanOrEqual(window.innerWidth);
      expect(menuRect.left).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Text Legibility', () => {
    it('text remains readable at all mobile sizes', () => {
      [MOBILE_BREAKPOINTS.small, MOBILE_BREAKPOINTS.medium, MOBILE_BREAKPOINTS.tablet].forEach(width => {
        const { rerender } = renderWithMobileViewport(
          <GuestLanguageSwitcher
            currentLanguage="en"
            availableLanguages={availableLanguages}
            onLanguageChange={mockOnLanguageChange}
          />,
          width
        );

        const trigger = screen.getByRole('button', { name: /language/i });
        const fontSize = window.getComputedStyle(trigger).fontSize;
        const fontSizeNum = parseInt(fontSize, 10);

        // Font size should be at least 14px for legibility
        expect(fontSizeNum).toBeGreaterThanOrEqual(14);
      });
    });
  });
});
```

---

### 3. **Create Banner Components Mobile Tests**

**File**: `/src/components/__tests__/TranslationBanners.mobile.test.tsx` (NEW)

Test banner components on mobile screens:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { TranslationBanner } from '@/components/guest/TranslationBanner';
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner';
import {
  renderWithMobileViewport,
  MOBILE_BREAKPOINTS,
  setMobileViewport,
} from './fixtures/mobileTestHelpers';

describe('Translation Banners - Mobile Responsiveness', () => {
  afterEach(() => {
    setMobileViewport(1024);
  });

  describe('TranslationBanner', () => {
    it('renders without obscuring content on small mobile', () => {
      renderWithMobileViewport(
        <>
          <TranslationBanner
            sourceLanguage="en"
            onViewOriginal={() => {}}
          />
          <div data-testid="main-content">Main content here</div>
        </>,
        MOBILE_BREAKPOINTS.small
      );

      const banner = screen.getByText(/translated from/i).closest('div');
      const content = screen.getByTestId('main-content');

      expect(banner).toBeInTheDocument();
      expect(content).toBeInTheDocument();

      // Banner should not have absolute positioning that covers content
      const bannerStyles = window.getComputedStyle(banner!);
      expect(bannerStyles.position).not.toBe('absolute');
    });

    it('view original link is touch-friendly', () => {
      renderWithMobileViewport(
        <TranslationBanner
          sourceLanguage="en"
          onViewOriginal={() => {}}
        />,
        MOBILE_BREAKPOINTS.medium
      );

      const viewOriginalLink = screen.getByText(/view original/i);
      const rect = viewOriginalLink.getBoundingClientRect();

      // Link should have adequate padding for touch
      expect(rect.height).toBeGreaterThanOrEqual(40);
    });

    it('text wraps correctly on narrow screens', () => {
      renderWithMobileViewport(
        <TranslationBanner
          sourceLanguage="en"
          onViewOriginal={() => {}}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const banner = screen.getByText(/translated from/i).closest('div');
      const bannerWidth = banner!.getBoundingClientRect().width;

      // Banner should not overflow viewport
      expect(bannerWidth).toBeLessThanOrEqual(MOBILE_BREAKPOINTS.small);
    });

    it('maintains visibility in portrait orientation', () => {
      renderWithMobileViewport(
        <TranslationBanner
          sourceLanguage="en"
          onViewOriginal={() => {}}
        />,
        MOBILE_BREAKPOINTS.medium
      );

      const banner = screen.getByText(/translated from/i);
      expect(banner).toBeVisible();
    });
  });

  describe('MissingTranslationBanner', () => {
    it('renders without obscuring content on small mobile', () => {
      renderWithMobileViewport(
        <>
          <MissingTranslationBanner
            requestedLanguage="fr"
            fallbackLanguage="en"
          />
          <div data-testid="main-content">Main content here</div>
        </>,
        MOBILE_BREAKPOINTS.small
      );

      const banner = screen.getByText(/translation not available/i).closest('div');
      const content = screen.getByTestId('main-content');

      expect(banner).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });

    it('message text is readable at mobile sizes', () => {
      renderWithMobileViewport(
        <MissingTranslationBanner
          requestedLanguage="fr"
          fallbackLanguage="en"
        />,
        MOBILE_BREAKPOINTS.small
      );

      const bannerText = screen.getByText(/translation not available/i);
      const fontSize = window.getComputedStyle(bannerText).fontSize;
      const fontSizeNum = parseInt(fontSize, 10);

      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    });

    it('adapts to narrow viewport without horizontal scroll', () => {
      renderWithMobileViewport(
        <MissingTranslationBanner
          requestedLanguage="fr"
          fallbackLanguage="en"
        />,
        MOBILE_BREAKPOINTS.small
      );

      const banner = screen.getByText(/translation not available/i).closest('div');
      const bannerWidth = banner!.getBoundingClientRect().width;

      expect(bannerWidth).toBeLessThanOrEqual(MOBILE_BREAKPOINTS.small);
    });
  });

  describe('Multiple Banners Stacking', () => {
    it('both banners display without overlapping on mobile', () => {
      renderWithMobileViewport(
        <>
          <TranslationBanner
            sourceLanguage="en"
            onViewOriginal={() => {}}
          />
          <MissingTranslationBanner
            requestedLanguage="fr"
            fallbackLanguage="en"
          />
          <div data-testid="main-content">Main content here</div>
        </>,
        MOBILE_BREAKPOINTS.medium
      );

      const translationBanner = screen.getByText(/translated from/i).closest('div');
      const missingBanner = screen.getByText(/translation not available/i).closest('div');
      const content = screen.getByTestId('main-content');

      expect(translationBanner).toBeInTheDocument();
      expect(missingBanner).toBeInTheDocument();
      expect(content).toBeInTheDocument();

      // Banners should stack vertically, not overlap
      const tb = translationBanner!.getBoundingClientRect();
      const mb = missingBanner!.getBoundingClientRect();

      // One should be above the other (not overlapping)
      expect(tb.bottom <= mb.top || mb.bottom <= tb.top).toBe(true);
    });
  });
});
```

---

### 4. **Create Toggle and Indicator Mobile Tests**

**File**: `/src/components/__tests__/ViewControls.mobile.test.tsx` (NEW)

Test ViewOriginalToggle and LanguageIndicator on mobile:

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewOriginalToggle } from '@/components/guest/ViewOriginalToggle';
import { LanguageIndicator } from '@/components/guest/LanguageIndicator';
import {
  renderWithMobileViewport,
  isTouchTargetAccessible,
  MOBILE_BREAKPOINTS,
  setMobileViewport,
} from './fixtures/mobileTestHelpers';

describe('View Controls - Mobile Responsiveness', () => {
  afterEach(() => {
    setMobileViewport(1024);
  });

  describe('ViewOriginalToggle', () => {
    const mockOnToggle = vi.fn();

    it('button meets touch target requirements on mobile', () => {
      renderWithMobileViewport(
        <ViewOriginalToggle
          isViewingOriginal={false}
          originalLanguage="en"
          onToggle={mockOnToggle}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const button = screen.getByRole('button', { name: /view in original/i });
      expect(isTouchTargetAccessible(button)).toBe(true);
    });

    it('button text remains readable on small screens', () => {
      renderWithMobileViewport(
        <ViewOriginalToggle
          isViewingOriginal={false}
          originalLanguage="en"
          onToggle={mockOnToggle}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const button = screen.getByRole('button', { name: /view in original/i });
      const fontSize = window.getComputedStyle(button).fontSize;
      const fontSizeNum = parseInt(fontSize, 10);

      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    });

    it('button is easily tappable with touch input', async () => {
      const user = userEvent.setup();

      renderWithMobileViewport(
        <ViewOriginalToggle
          isViewingOriginal={false}
          originalLanguage="en"
          onToggle={mockOnToggle}
        />,
        MOBILE_BREAKPOINTS.medium
      );

      const button = screen.getByRole('button', { name: /view in original/i });
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('icon scales appropriately on mobile', () => {
      renderWithMobileViewport(
        <ViewOriginalToggle
          isViewingOriginal={false}
          originalLanguage="en"
          onToggle={mockOnToggle}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const button = screen.getByRole('button', { name: /view in original/i });
      const icon = button.querySelector('svg');

      expect(icon).toBeInTheDocument();

      if (icon) {
        const iconSize = icon.getBoundingClientRect();
        // Icon should be visible but not oversized
        expect(iconSize.width).toBeGreaterThanOrEqual(16);
        expect(iconSize.width).toBeLessThanOrEqual(32);
      }
    });

    it('button reflows correctly in narrow containers', () => {
      renderWithMobileViewport(
        <div style={{ width: '280px', padding: '20px' }}>
          <ViewOriginalToggle
            isViewingOriginal={false}
            originalLanguage="en"
            onToggle={mockOnToggle}
          />
        </div>,
        MOBILE_BREAKPOINTS.small
      );

      const button = screen.getByRole('button', { name: /view in original/i });
      const buttonWidth = button.getBoundingClientRect().width;

      // Button should not overflow its container
      expect(buttonWidth).toBeLessThanOrEqual(280);
    });
  });

  describe('LanguageIndicator', () => {
    it('displays flag and text on small mobile screens', () => {
      renderWithMobileViewport(
        <LanguageIndicator
          currentLanguage="fr"
          sourceLanguage="en"
          showTranslatedFrom={true}
        />,
        MOBILE_BREAKPOINTS.small
      );

      expect(screen.getByText(/fr/i)).toBeInTheDocument();
    });

    it('remains readable at all mobile breakpoints', () => {
      [MOBILE_BREAKPOINTS.small, MOBILE_BREAKPOINTS.medium, MOBILE_BREAKPOINTS.tablet].forEach(width => {
        renderWithMobileViewport(
          <LanguageIndicator
            currentLanguage="fr"
            sourceLanguage="en"
            showTranslatedFrom={true}
          />,
          width
        );

        const indicator = screen.getByText(/fr/i);
        const fontSize = window.getComputedStyle(indicator).fontSize;
        const fontSizeNum = parseInt(fontSize, 10);

        expect(fontSizeNum).toBeGreaterThanOrEqual(12);
      });
    });

    it('clickable indicator meets touch target requirements', () => {
      const mockOnClick = vi.fn();

      renderWithMobileViewport(
        <LanguageIndicator
          currentLanguage="fr"
          sourceLanguage="en"
          onClick={mockOnClick}
        />,
        MOBILE_BREAKPOINTS.medium
      );

      const indicator = screen.getByText(/fr/i).closest('button') || screen.getByText(/fr/i).parentElement!;

      if (indicator.tagName === 'BUTTON') {
        expect(isTouchTargetAccessible(indicator as HTMLElement)).toBe(true);
      }
    });

    it('subtitle text wraps appropriately on narrow screens', () => {
      renderWithMobileViewport(
        <LanguageIndicator
          currentLanguage="fr"
          sourceLanguage="en"
          showTranslatedFrom={true}
        />,
        MOBILE_BREAKPOINTS.small
      );

      const indicator = screen.getByText(/fr/i).closest('div');
      const indicatorWidth = indicator!.getBoundingClientRect().width;

      expect(indicatorWidth).toBeLessThanOrEqual(MOBILE_BREAKPOINTS.small);
    });
  });
});
```

---

### 5. **Create Integration Mobile Tests**

**File**: `/src/components/__tests__/ItemDisplay.mobile.integration.test.tsx` (NEW)

Test the complete ItemDisplay component on mobile:

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemDisplay } from '@/components/ItemDisplay';
import { setMobileViewport, MOBILE_BREAKPOINTS } from './fixtures/mobileTestHelpers';
import type { Item, TranslationMeta } from '@/types';

describe('ItemDisplay - Mobile Integration', () => {
  const mockItem: Item = {
    id: 'item-1',
    publicId: 'abc123',
    name: 'Guide Wifi',
    originalName: 'Wifi Guide',
    description: 'Instructions pour se connecter',
    originalDescription: 'Instructions for connecting',
    sourceLanguage: 'en',
    links: [],
    articles: [],
    tags: [],
  };

  const mockTranslationMeta: TranslationMeta = {
    requestedLanguage: 'fr',
    displayLanguage: 'fr',
    originalLanguage: 'en',
    availableLanguages: ['en', 'fr', 'es'],
    isTranslated: true,
  };

  afterEach(() => {
    setMobileViewport(1024);
  });

  it('renders complete layout on small mobile screen', () => {
    setMobileViewport(MOBILE_BREAKPOINTS.small);

    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    // All key components should be present
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
    expect(screen.getByText(/translated from/i)).toBeInTheDocument();
  });

  it('components stack vertically without overlapping', () => {
    setMobileViewport(MOBILE_BREAKPOINTS.medium);

    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    const banner = screen.getByText(/translated from/i).closest('div');
    const content = screen.getByText('Guide Wifi').closest('div');

    const bannerRect = banner!.getBoundingClientRect();
    const contentRect = content!.getBoundingClientRect();

    // Banner should be above content
    expect(bannerRect.bottom).toBeLessThanOrEqual(contentRect.top);
  });

  it('language switcher is accessible at top of viewport', async () => {
    const user = userEvent.setup();
    setMobileViewport(MOBILE_BREAKPOINTS.medium);

    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    const languageSwitcher = screen.getByRole('button', { name: /language/i });

    // Should be in visible area
    const rect = languageSwitcher.getBoundingClientRect();
    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.top).toBeLessThan(200); // Near top of page
  });

  it('main content is not obscured by fixed elements', () => {
    setMobileViewport(MOBILE_BREAKPOINTS.medium);

    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    const mainContent = screen.getByText('Guide Wifi');
    expect(mainContent).toBeVisible();

    // Content should be within viewport
    const rect = mainContent.getBoundingClientRect();
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  });

  it('all interactive elements are touch-friendly', async () => {
    const user = userEvent.setup();
    setMobileViewport(MOBILE_BREAKPOINTS.medium);

    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    // Language switcher
    const languageSwitcher = screen.getByRole('button', { name: /language/i });
    await user.click(languageSwitcher);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // View original link
    const viewOriginalLink = screen.getByText(/view original/i);
    await user.click(viewOriginalLink);

    // All clicks should work without issues on mobile
  });

  it('page scrolls correctly with banners visible', () => {
    setMobileViewport(MOBILE_BREAKPOINTS.medium);

    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    // Simulate scroll
    window.scrollY = 100;
    window.dispatchEvent(new Event('scroll'));

    // Banners should remain accessible
    const banner = screen.getByText(/translated from/i);
    expect(banner).toBeInTheDocument();
  });

  it('maintains usability in portrait orientation', () => {
    setMobileViewport(MOBILE_BREAKPOINTS.medium);

    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    // All key UI elements should be present
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
    expect(screen.getByText(/translated from/i)).toBeInTheDocument();

    // Page should not have horizontal overflow
    const body = document.body;
    expect(body.scrollWidth).toBeLessThanOrEqual(MOBILE_BREAKPOINTS.medium + 20); // Small margin for padding
  });
});
```

---

## Authorized Files and Functions for Modification

### New Test Files (CREATE)

| File | Purpose |
|------|---------|
| `/src/components/__tests__/fixtures/mobileTestHelpers.ts` | Mobile test utilities and viewport helpers |
| `/src/components/__tests__/GuestLanguageSwitcher.mobile.test.tsx` | Mobile tests for language switcher |
| `/src/components/__tests__/TranslationBanners.mobile.test.tsx` | Mobile tests for banner components |
| `/src/components/__tests__/ViewControls.mobile.test.tsx` | Mobile tests for toggle and indicator |
| `/src/components/__tests__/ItemDisplay.mobile.integration.test.tsx` | Integration tests for mobile layout |

### No Existing Files Modified

This task only creates new test files. No existing component files are modified.

---

## Dependencies

### Depends On

- **REQ-E04-008**: GuestLanguageSwitcher component must exist
- **REQ-E04-009**: TranslationBanner component must exist
- **REQ-E04-010**: MissingTranslationBanner component must exist
- **REQ-E04-011**: ViewOriginalToggle component must exist
- **REQ-E04-012**: LanguageIndicator component must exist
- **REQ-E04-017**: ItemDisplay component with translation support must exist

### Blocks

- None (testing task doesn't block other implementation)

### Parallel Safety

- **SAFE**: Can be implemented in parallel with REQ-E04-026 (Performance Validation)
- **SAFE**: Does not conflict with any other testing tasks

---

## Testing Strategy

### Unit Tests

All test files created by this task ARE the unit tests. Each component is tested in isolation with mocked dependencies.

**Key Test Patterns**:

```typescript
// Viewport simulation
setMobileViewport(320);

// Touch target validation
expect(isTouchTargetAccessible(element)).toBe(true);

// Text legibility
const fontSize = parseInt(window.getComputedStyle(element).fontSize, 10);
expect(fontSize).toBeGreaterThanOrEqual(14);

// Dropdown positioning
expect(menuRect.right).toBeLessThanOrEqual(window.innerWidth);
```

### Integration Tests

The `ItemDisplay.mobile.integration.test.tsx` file provides integration testing across multiple components in a mobile context.

### Manual Testing Checklist

**Testing on Real Devices**:

- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPhone 12/13 (medium screen)
- [ ] Test on iPad Mini (tablet)
- [ ] Test on Android phone (various sizes)
- [ ] Verify landscape orientation
- [ ] Test with device font size increased
- [ ] Test with device zoom at 200%
- [ ] Verify smooth scrolling with banners
- [ ] Confirm dropdowns don't extend off screen
- [ ] Validate all touch targets work reliably

**Browser DevTools Testing**:

- [ ] Test responsive mode in Chrome DevTools
- [ ] Test responsive mode in Firefox DevTools
- [ ] Test responsive mode in Safari Web Inspector
- [ ] Verify component reflow at various breakpoints
- [ ] Check for horizontal scroll issues

---

## Risks and Considerations

### Risk: Test Environment Limitations

**Issue**: JSDOM test environment may not perfectly simulate mobile viewport behavior.

**Mitigation**:
- Supplement automated tests with manual device testing
- Use real device testing for final validation
- Document any discrepancies between test and real behavior

### Risk: Touch Event Simulation

**Issue**: Simulating touch events in tests may not match real touch behavior.

**Mitigation**:
- Focus on size/spacing validation in tests
- Rely on Radix UI's built-in touch support
- Validate with real devices during manual testing

### Risk: CSS Media Query Behavior

**Issue**: Tests may not trigger actual CSS media queries.

**Mitigation**:
- Use window.matchMedia mocking if needed
- Test computed styles rather than class names
- Validate responsive CSS manually

### Risk: Browser-Specific Issues

**Issue**: Mobile Safari may behave differently than Chrome mobile.

**Mitigation**:
- Test on multiple browsers during manual testing
- Use standard CSS and avoid browser-specific hacks
- Document any browser-specific workarounds needed

---

## Out of Scope

1. **Performance testing on mobile devices** - Covered by REQ-E04-026
2. **Accessibility testing** - Covered by component creation tasks
3. **Cross-browser compatibility testing** - Manual QA responsibility
4. **Visual regression testing** - Not part of this task scope
5. **E2E testing on real devices** - Out of scope for unit/integration tests
6. **Testing in landscape orientation edge cases** - Basic support only
7. **Testing with device-specific features** - Focus on standard mobile web

---

## Implementation Notes

### Touch Target Guidelines

All interactive elements must meet **WCAG 2.5.5 Target Size** guidelines:
- Minimum 44x44 CSS pixels for touch targets
- Adequate spacing between adjacent targets
- Consider larger targets (48x48px) for critical actions

### Viewport Testing Strategy

Test at three key breakpoints:
- **320px**: Small mobile (iPhone SE)
- **375px**: Medium mobile (iPhone 12/13)
- **768px**: Tablet/large mobile

### Text Legibility Standards

- **Body text**: Minimum 14px font size
- **Small text**: Minimum 12px font size
- **Interactive text**: Minimum 14px font size
- **Line height**: At least 1.5 for body text

### Responsive Design Validation

Check for these common issues:
- Horizontal scrolling (overflow-x)
- Content cut off at viewport edges
- Overlapping elements
- Tiny unreadable text
- Dropdowns extending off-screen
- Fixed elements obscuring content

---

## Verification Checklist

- [ ] All test files created and passing
- [ ] Mobile test helpers implemented
- [ ] GuestLanguageSwitcher mobile tests complete (100% coverage)
- [ ] TranslationBanner mobile tests complete
- [ ] MissingTranslationBanner mobile tests complete
- [ ] ViewOriginalToggle mobile tests complete
- [ ] LanguageIndicator mobile tests complete
- [ ] Integration tests validate complete mobile layout
- [ ] All touch targets validated as >= 44x44px
- [ ] Text legibility validated at all breakpoints
- [ ] Dropdown positioning validated
- [ ] Manual device testing completed
- [ ] All tests pass in CI pipeline
- [ ] No regressions in desktop view tests
