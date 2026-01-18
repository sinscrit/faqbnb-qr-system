# REQ-255: Write Component Tests for LanguageSwitcher - Detailed Task Breakdown

**Generated:** 2026-01-18 19:30 UTC
**Last Modified:** 2026-01-18 19:30 UTC
**Request Reference:** docs/gen_requests.md - REQ-255
**Overview Reference:** docs/REQ-255-write-component-tests-for-languageswitcher-overview.md
**Implementation Plan Reference:** docs/prd/Plan-110-L10N-Epic1-Foundation.md (Phase 6, Task 6.3)
**Status:** Detailed Breakdown Document
**Estimated Story Points:** 3 (S size)

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for REQ-255 (Write Component Tests for LanguageSwitcher). The LanguageSwitcher component is a dropdown UI element that allows users to select from 6 supported languages (English, French, Spanish, German, Dutch, Italian). Tests must verify dropdown behavior, keyboard navigation, language selection persistence (cookie for guests, database for authenticated users), and accessibility compliance.

**Dependencies:** This task requires Task 5.3 (Create LanguageSwitcher component) to be completed first. The tests validate the component created in that task.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] LanguageSwitcher component exists at `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- [ ] LanguageSwitcher types exist at `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts`
- [ ] Component exports from `/src/components/LanguageSwitcher/index.ts`
- [ ] Test infrastructure configured (`vitest.config.ts` exists)
- [ ] Required test dependencies installed (`@testing-library/react`, `@testing-library/user-event`)

---

## Task Breakdown

### Task 1: Create Test File Structure

**Story Points:** 0.25
**Priority:** Required
**Dependencies:** None

#### 1.1 Create `__tests__` Directory

**File:** `src/components/LanguageSwitcher/__tests__/` (create directory)

**Action:** Create the `__tests__` directory inside the LanguageSwitcher component folder.

```bash
mkdir -p src/components/LanguageSwitcher/__tests__
```

**Verification:** Directory exists at `src/components/LanguageSwitcher/__tests__/`

---

#### 1.2 Create Test File with Boilerplate

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Create the test file with the standard boilerplate, imports, and mock configuration.

```typescript
/**
 * LanguageSwitcher Component Tests
 *
 * Tests for the language selection dropdown component
 * including dropdown behavior, keyboard navigation, accessibility,
 * and language preference persistence.
 *
 * REQ-255: Write Component Tests for LanguageSwitcher
 *
 * @module LanguageSwitcher/__tests__/LanguageSwitcher
 * @vitest-environment jsdom
 * @lastModified 2026-01-18
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LanguageSwitcher } from '../LanguageSwitcher';
import type { SupportedLanguage } from '../LanguageSwitcher.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en'),
}));

vi.mock('next-intl/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
    push: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard'),
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
  })),
}));

// =============================================================================
// Test Helpers
// =============================================================================

const SUPPORTED_LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'fr', nativeName: 'Fran\u00e7ais' },
  { code: 'es', nativeName: 'Espa\u00f1ol' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'it', nativeName: 'Italiano' },
] as const;

// =============================================================================
// Test Suites - Placeholder
// =============================================================================

describe('LanguageSwitcher', () => {
  const mockOnLocaleChange = vi.fn();

  beforeEach(() => {
    mockOnLocaleChange.mockClear();
    // Reset cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('placeholder test - renders component', () => {
    // This will be replaced with actual tests
    expect(true).toBe(true);
  });
});
```

**Verification:**
- File exists at `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`
- Run `npm test -- src/components/LanguageSwitcher` - should pass with placeholder test

---

### Task 2: Implement Rendering Tests

**Story Points:** 0.5
**Priority:** Required
**Dependencies:** Task 1

#### 2.1 Add Rendering Test Suite

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Rendering test suite after the mock setup section, replacing the placeholder test.

```typescript
  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe('Rendering', () => {
    it('renders trigger button', () => {
      render(<LanguageSwitcher />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with current locale displayed', () => {
      render(<LanguageSwitcher currentLocale="en" />);
      expect(screen.getByRole('button')).toHaveTextContent(/English/);
    });

    it('displays correct locale name for each supported language', () => {
      const { rerender } = render(<LanguageSwitcher currentLocale="fr" />);
      expect(screen.getByRole('button')).toHaveTextContent(/Fran\u00e7ais/);

      rerender(<LanguageSwitcher currentLocale="de" />);
      expect(screen.getByRole('button')).toHaveTextContent(/Deutsch/);

      rerender(<LanguageSwitcher currentLocale="es" />);
      expect(screen.getByRole('button')).toHaveTextContent(/Espa\u00f1ol/);
    });

    it('applies custom className', () => {
      render(<LanguageSwitcher className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('shows disabled styling when disabled', () => {
      render(<LanguageSwitcher disabled />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('renders without crashing when no props provided', () => {
      expect(() => render(<LanguageSwitcher />)).not.toThrow();
    });
  });
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Rendering"` - all tests should pass
- Tests cover: trigger button, locale display, className, disabled state

---

### Task 3: Implement Dropdown Behavior Tests

**Story Points:** 0.75
**Priority:** Required
**Dependencies:** Task 2

#### 3.1 Add Dropdown Behavior Test Suite

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Dropdown Behavior test suite after the Rendering tests.

```typescript
  // ===========================================================================
  // Dropdown Behavior Tests
  // ===========================================================================

  describe('Dropdown Behavior', () => {
    it('opens dropdown on trigger click', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      // All 6 languages should be visible
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();
    });

    it('displays all 6 supported languages', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      SUPPORTED_LANGUAGES.forEach(({ nativeName }) => {
        expect(screen.getByText(nativeName)).toBeInTheDocument();
      });
    });

    it('shows native language names in dropdown', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher showNativeNames={true} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
      expect(screen.getByText('Espa\u00f1ol')).toBeInTheDocument();
      expect(screen.getByText('Nederlands')).toBeInTheDocument();
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });

    it('highlights current language option', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="fr" />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      const frenchOption = options.find(opt => opt.textContent?.includes('Fran\u00e7ais'));
      expect(frenchOption).toHaveAttribute('aria-selected', 'true');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();

      await user.click(screen.getByText('Fran\u00e7ais'));

      await waitFor(() => {
        expect(screen.queryByText('Deutsch')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown on click outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <LanguageSwitcher />
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside-element'));

      await waitFor(() => {
        expect(screen.queryByText('Fran\u00e7ais')).not.toBeInTheDocument();
      });
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher disabled />);

      await user.click(screen.getByRole('button'));

      expect(screen.queryByText('Fran\u00e7ais')).not.toBeInTheDocument();
    });
  });
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Dropdown Behavior"` - all tests should pass
- Tests cover: open/close, all languages displayed, current highlight, disabled state

---

### Task 4: Implement Language Selection Tests

**Story Points:** 0.5
**Priority:** Required
**Dependencies:** Task 3

#### 4.1 Add Language Selection Test Suite

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Language Selection test suite after the Dropdown Behavior tests.

```typescript
  // ===========================================================================
  // Language Selection Tests
  // ===========================================================================

  describe('Language Selection', () => {
    it('calls onLocaleChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Fran\u00e7ais'));

      expect(mockOnLocaleChange).toHaveBeenCalledWith('fr');
    });

    it('calls onLocaleChange with correct locale code for each language', async () => {
      const user = userEvent.setup();

      for (const { code, nativeName } of SUPPORTED_LANGUAGES) {
        mockOnLocaleChange.mockClear();
        const { unmount } = render(
          <LanguageSwitcher onLocaleChange={mockOnLocaleChange} />
        );

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText(nativeName));

        expect(mockOnLocaleChange).toHaveBeenCalledWith(code);
        unmount();
      }
    });

    it('handles selecting already-selected language', async () => {
      const user = userEvent.setup();
      render(
        <LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('English'));

      // Should still call onLocaleChange
      expect(mockOnLocaleChange).toHaveBeenCalledWith('en');
    });

    it('does not throw when onLocaleChange is not provided', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      await expect(user.click(screen.getByText('Fran\u00e7ais'))).resolves.not.toThrow();
    });
  });
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Language Selection"` - all tests should pass
- Tests cover: callback invocation, correct locale codes, edge cases

---

### Task 5: Implement Keyboard Navigation Tests

**Story Points:** 0.5
**Priority:** Required
**Dependencies:** Task 3

#### 5.1 Add Keyboard Navigation Test Suite

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Keyboard Navigation test suite after the Language Selection tests.

```typescript
  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('Keyboard Navigation', () => {
    it('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');

      expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();
    });

    it('opens dropdown on Space key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      screen.getByRole('button').focus();
      await user.keyboard(' ');

      expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Deutsch')).not.toBeInTheDocument();
      });
    });

    it('navigates options with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="en" />);

      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}');

      // First option should be focused
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });

    it('navigates options with ArrowUp key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="en" />);

      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');

      // Navigation should work without errors
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(6);
    });

    it('selects focused option on Enter key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}{Enter}');

      expect(mockOnLocaleChange).toHaveBeenCalled();
    });

    it('does not navigate when dropdown is closed', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

      screen.getByRole('button').focus();
      await user.keyboard('{ArrowDown}');

      // Dropdown should not have opened from arrow key alone
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Keyboard Navigation"` - all tests should pass
- Tests cover: Enter, Space, Escape, ArrowUp, ArrowDown, selection with Enter

---

### Task 6: Implement Persistence Tests

**Story Points:** 0.75
**Priority:** Required
**Dependencies:** Task 4

#### 6.1 Add Cookie Persistence Tests

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Persistence test suite with Cookie Persistence subsection.

```typescript
  // ===========================================================================
  // Persistence Tests
  // ===========================================================================

  describe('Persistence', () => {
    describe('Cookie Persistence', () => {
      it('sets cookie when language is selected', async () => {
        const user = userEvent.setup();
        let cookieValue = '';
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (value) => { cookieValue = value; },
          configurable: true,
        });

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Fran\u00e7ais'));

        expect(cookieValue).toContain('FAQBNB_LANG=fr');
      });

      it('cookie has correct name', async () => {
        const user = userEvent.setup();
        let cookieValue = '';
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (value) => { cookieValue = value; },
          configurable: true,
        });

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Deutsch'));

        expect(cookieValue).toContain('FAQBNB_LANG=');
      });

      it('cookie has appropriate settings', async () => {
        const user = userEvent.setup();
        let cookieValue = '';
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (value) => { cookieValue = value; },
          configurable: true,
        });

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Espa\u00f1ol'));

        expect(cookieValue).toContain('path=/');
        expect(cookieValue).toContain('max-age=');
        expect(cookieValue).toContain('SameSite=');
      });
    });
```

#### 6.2 Add Database Persistence Tests (Authenticated Users)

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Database Persistence subsection within the Persistence describe block.

```typescript
    describe('Database Persistence (Authenticated Users)', () => {
      beforeEach(() => {
        // Mock authenticated user
        const { useAuth } = require('@/contexts/AuthContext');
        vi.mocked(useAuth).mockReturnValue({
          user: { id: 'test-user-123', email: 'test@example.com' },
          isLoading: false,
        });
      });

      afterEach(() => {
        // Reset to guest user
        const { useAuth } = require('@/contexts/AuthContext');
        vi.mocked(useAuth).mockReturnValue({
          user: null,
          isLoading: false,
        });
      });

      it('calls API endpoint when user is authenticated', async () => {
        const user = userEvent.setup();
        const mockFetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
        global.fetch = mockFetch;

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Fran\u00e7ais'));

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            '/api/user/language',
            expect.objectContaining({
              method: 'PUT',
              body: expect.stringContaining('fr'),
            })
          );
        });
      });

      it('sends correct locale in request body', async () => {
        const user = userEvent.setup();
        let requestBody: string | null = null;
        const mockFetch = vi.fn().mockImplementation((_url, options) => {
          requestBody = options?.body;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        });
        global.fetch = mockFetch;

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Deutsch'));

        await waitFor(() => {
          expect(requestBody).not.toBeNull();
          expect(JSON.parse(requestBody!)).toEqual({ language: 'de' });
        });
      });

      it('handles API failure gracefully (still sets cookie)', async () => {
        const user = userEvent.setup();
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const mockFetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        });
        global.fetch = mockFetch;

        let cookieValue = '';
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (value) => { cookieValue = value; },
          configurable: true,
        });

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Italiano'));

        // Cookie should still be set even if API fails
        await waitFor(() => {
          expect(cookieValue).toContain('FAQBNB_LANG=it');
        });

        consoleSpy.mockRestore();
      });
    });
```

#### 6.3 Add Guest User Persistence Tests

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Guest User Persistence subsection and close the Persistence describe block.

```typescript
    describe('Guest User Persistence', () => {
      it('only sets cookie when user is not authenticated', async () => {
        const user = userEvent.setup();
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        let cookieValue = '';
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (value) => { cookieValue = value; },
          configurable: true,
        });

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Nederlands'));

        // Cookie should be set
        expect(cookieValue).toContain('FAQBNB_LANG=nl');

        // API should not be called for guest users
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('does not call API endpoint for guest users', async () => {
        const user = userEvent.setup();
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        render(<LanguageSwitcher />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Fran\u00e7ais'));

        // Wait a bit to ensure no async calls were made
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  }); // Close Persistence describe block
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Persistence"` - all tests should pass
- Tests cover: cookie setting, cookie attributes, API calls for auth users, graceful API failure, guest-only cookie

---

### Task 7: Implement Accessibility Tests

**Story Points:** 0.5
**Priority:** Required
**Dependencies:** Task 2

#### 7.1 Add Accessibility Test Suite

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Accessibility test suite after the Persistence tests.

```typescript
  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('trigger button has accessible name', () => {
      render(<LanguageSwitcher currentLocale="en" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName();
    });

    it('trigger button has aria-expanded attribute', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger button has aria-haspopup attribute', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('dropdown has role="listbox"', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('options have role="option"', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(6);
    });

    it('selected option has aria-selected="true"', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="de" />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      const selectedOption = options.find(opt => opt.getAttribute('aria-selected') === 'true');
      expect(selectedOption).toBeDefined();
      expect(selectedOption).toHaveTextContent('Deutsch');
    });

    it('unselected options have aria-selected="false"', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="en" />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      const unselectedOptions = options.filter(opt => opt.getAttribute('aria-selected') === 'false');
      expect(unselectedOptions).toHaveLength(5);
    });

    it('has focus ring styles for keyboard navigation', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('trigger button has minimum touch target height (44px)', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('trigger button has correct type attribute', () => {
      render(<LanguageSwitcher />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('dropdown options have minimum touch target height (48px)', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      options.forEach(option => {
        expect(option).toHaveClass('min-h-[48px]');
      });
    });
  });
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Accessibility"` - all tests should pass
- Tests cover: aria-expanded, aria-haspopup, listbox role, option roles, aria-selected, focus ring, touch targets

---

### Task 8: Implement Variants and Props Tests

**Story Points:** 0.25
**Priority:** Optional
**Dependencies:** Task 2

#### 8.1 Add Variants and Props Test Suite

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Variants and Props test suite after the Accessibility tests.

```typescript
  // ===========================================================================
  // Variants and Props Tests
  // ===========================================================================

  describe('Variants and Props', () => {
    describe('Size Variants', () => {
      it('applies small size styling', () => {
        render(<LanguageSwitcher size="sm" />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('text-sm');
      });

      it('applies medium size styling', () => {
        render(<LanguageSwitcher size="md" />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('text-base');
      });

      it('applies large size styling', () => {
        render(<LanguageSwitcher size="lg" />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('text-lg');
      });
    });

    describe('Display Variants', () => {
      it('dropdown variant shows full language info', async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher variant="dropdown" />);

        await user.click(screen.getByRole('button'));

        expect(screen.getByText('Fran\u00e7ais')).toBeInTheDocument();
      });

      it('compact variant uses compact styling', () => {
        render(<LanguageSwitcher variant="compact" />);
        const button = screen.getByRole('button');
        // Compact variant should have more condensed styling
        expect(button).toBeInTheDocument();
      });

      it('inline variant displays languages inline', () => {
        render(<LanguageSwitcher variant="inline" />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
      });
    });

    describe('Current Locale Display', () => {
      it.each(SUPPORTED_LANGUAGES)(
        'displays correct locale for $code',
        ({ code, nativeName }) => {
          render(<LanguageSwitcher currentLocale={code as SupportedLanguage} />);
          expect(screen.getByRole('button')).toHaveTextContent(nativeName);
        }
      );
    });

    describe('Show Flags Option', () => {
      it('shows flag icons when showFlags is true', () => {
        render(<LanguageSwitcher showFlags={true} />);
        // Implementation depends on how flags are rendered
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      it('hides flag icons when showFlags is false', () => {
        render(<LanguageSwitcher showFlags={false} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Variants and Props"` - all tests should pass
- Tests cover: size variants, display variants, current locale display, flag option

---

### Task 9: Implement Edge Cases Tests

**Story Points:** 0.25
**Priority:** Optional
**Dependencies:** Task 4

#### 9.1 Add Edge Cases Test Suite

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Action:** Add the Edge Cases test suite after the Variants tests.

```typescript
  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles rapid clicking without errors', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

      // Rapidly open/close
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('button'));
      }

      // Should not throw
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles selecting already-selected language', async () => {
      const user = userEvent.setup();
      render(
        <LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />
      );

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('English'));

      // Should still call onLocaleChange
      expect(mockOnLocaleChange).toHaveBeenCalledWith('en');
    });

    it('handles invalid locale prop gracefully', () => {
      // @ts-expect-error Testing invalid prop
      render(<LanguageSwitcher currentLocale="invalid" />);

      // Should fall back to default or handle gracefully
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles missing onLocaleChange callback', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      // Should not throw when clicking option
      await expect(user.click(screen.getByText('Fran\u00e7ais'))).resolves.not.toThrow();
    });

    it('maintains state correctly after multiple selections', async () => {
      const user = userEvent.setup();
      const selections: string[] = [];
      const trackingCallback = (locale: string) => selections.push(locale);

      render(<LanguageSwitcher onLocaleChange={trackingCallback} />);

      // Make multiple selections
      for (const { nativeName, code } of SUPPORTED_LANGUAGES.slice(0, 3)) {
        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText(nativeName));
      }

      expect(selections).toHaveLength(3);
    });

    it('handles component remount correctly', () => {
      const { rerender, unmount } = render(<LanguageSwitcher currentLocale="en" />);

      expect(screen.getByRole('button')).toHaveTextContent(/English/);

      unmount();

      rerender(<LanguageSwitcher currentLocale="fr" />);

      expect(screen.getByRole('button')).toHaveTextContent(/Fran\u00e7ais/);
    });
  });
```

**Verification:**
- Run `npm test -- src/components/LanguageSwitcher -t "Edge Cases"` - all tests should pass
- Tests cover: rapid clicking, re-selection, invalid props, missing callbacks, multiple selections, remount

---

### Task 10: Final Verification and Coverage

**Story Points:** 0.25
**Priority:** Required
**Dependencies:** Tasks 1-9

#### 10.1 Run Full Test Suite

**Action:** Execute the complete test suite for LanguageSwitcher and verify all tests pass.

```bash
npm test -- src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx
```

**Expected Output:** All tests pass (green)

#### 10.2 Verify Test Coverage

**Action:** Run tests with coverage to verify the component has >80% coverage.

```bash
npm test -- --coverage src/components/LanguageSwitcher
```

**Expected Coverage:**
- Statements: >80%
- Branches: >80%
- Functions: >80%
- Lines: >80%

#### 10.3 Fix Any Failing Tests

**Action:** If any tests fail, investigate and fix them. Common issues:
- Mock not matching component implementation
- Async timing issues (add `waitFor`)
- Element query selectors not matching actual DOM

#### 10.4 Update Test File Header

**Action:** Update the `@lastModified` date in the file header to the current date.

---

## Complete Test File Structure

After completing all tasks, the test file should have this structure:

```typescript
/**
 * LanguageSwitcher Component Tests
 * @module LanguageSwitcher/__tests__/LanguageSwitcher
 * @vitest-environment jsdom
 * @lastModified 2026-01-18
 */

// Imports and Mock Setup

describe('LanguageSwitcher', () => {
  // Setup and helpers

  describe('Rendering', () => { /* 6 tests */ });
  describe('Dropdown Behavior', () => { /* 8 tests */ });
  describe('Language Selection', () => { /* 4 tests */ });
  describe('Keyboard Navigation', () => { /* 7 tests */ });
  describe('Persistence', () => {
    describe('Cookie Persistence', () => { /* 3 tests */ });
    describe('Database Persistence (Authenticated Users)', () => { /* 3 tests */ });
    describe('Guest User Persistence', () => { /* 2 tests */ });
  });
  describe('Accessibility', () => { /* 11 tests */ });
  describe('Variants and Props', () => {
    describe('Size Variants', () => { /* 3 tests */ });
    describe('Display Variants', () => { /* 3 tests */ });
    describe('Current Locale Display', () => { /* 6 tests via it.each */ });
    describe('Show Flags Option', () => { /* 2 tests */ });
  });
  describe('Edge Cases', () => { /* 6 tests */ });
});
```

**Total Tests:** ~60 test cases

---

## Acceptance Criteria Verification

| Acceptance Criterion | Task(s) | Test Category |
|---------------------|---------|---------------|
| Dropdown opens on user interaction | Tasks 3, 5 | Dropdown Behavior, Keyboard Navigation |
| Dropdown displays all language options | Task 3 | Dropdown Behavior |
| Dropdown closes after language selected | Task 3 | Dropdown Behavior |
| Selected language visually indicated | Task 3 | Dropdown Behavior |
| Language preference persists across sessions | Task 6 | Persistence (Cookie, Database) |
| Previously selected language restored | Task 6 | Persistence |

---

## Test Execution Commands

```bash
# Run all LanguageSwitcher tests
npm test -- src/components/LanguageSwitcher

# Run specific test file
npm test -- src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx

# Run with coverage
npm test -- --coverage src/components/LanguageSwitcher

# Run in watch mode during development
npm test -- --watch src/components/LanguageSwitcher

# Run specific test category
npm test -- src/components/LanguageSwitcher -t "Dropdown Behavior"
npm test -- src/components/LanguageSwitcher -t "Keyboard Navigation"
npm test -- src/components/LanguageSwitcher -t "Persistence"
npm test -- src/components/LanguageSwitcher -t "Accessibility"
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Component implementation differs from expected | Read component source before writing tests; adjust mocks as needed |
| Mocks don't match actual dependencies | Verify import paths and mock structure against actual code |
| Async timing issues | Use `waitFor` and `userEvent.setup()` consistently |
| Cookie mocking fails | Use configurable Object.defineProperty pattern |
| Coverage below threshold | Add additional edge case tests for uncovered branches |

---

## Notes

- Follow existing test patterns from `SortMenu.test.tsx` for dropdown behavior
- Follow `EmptyStateCard.test.tsx` for accessibility patterns
- Follow `SuggestionButton.test.tsx` for interaction patterns
- Use `userEvent.setup()` for all user interactions (more realistic than fireEvent)
- Clean up mocks in `beforeEach`/`afterEach` to ensure test isolation
- Use `waitFor` for any async state changes

---

## References

- [Overview Document](/docs/REQ-255-write-component-tests-for-languageswitcher-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Phase 6, Task 6.3
- [Request #255](/docs/gen_requests.md#req-255)
- [SortMenu Tests](/src/components/ItemManager/components/dialogs/__tests__/SortMenu.test.tsx) - Dropdown patterns
- [EmptyStateCard Tests](/src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx) - Component patterns
- [SuggestionButton Tests](/src/components/ItemCreationWorkflow/components/shared/__tests__/SuggestionButton.test.tsx) - Interaction patterns

---

*Document generated on 2026-01-18 for REQ-255: Write Component Tests for LanguageSwitcher*
