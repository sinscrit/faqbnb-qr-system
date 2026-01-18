# REQ-255: Write Component Tests for LanguageSwitcher - Implementation Overview

**Generated:** 2026-01-18 19:00 UTC
**Last Modified:** 2026-01-18 19:00 UTC
**Request Reference:** docs/gen_requests.md - Request #255
**Implementation Plan Reference:** docs/prd/Plan-110-L10N-Epic1-Foundation.md (Phase 6, Task 6.3)
**Status:** Overview Document

---

## Executive Summary

This document provides the implementation breakdown for Task 6.3 (Component Tests for LanguageSwitcher) from the L10N Epic 1 Foundation implementation plan. The task establishes comprehensive component test coverage for the LanguageSwitcher component, focusing on dropdown behavior, keyboard navigation, accessibility, and language preference persistence.

**Note:** This testing task depends on Phase 5 (Language Switching Infrastructure) being completed, specifically Task 5.3 (Create LanguageSwitcher component). The tests should be implemented alongside or immediately after the LanguageSwitcher component is created.

---

## Technical Context

### Current Test Infrastructure

| Technology | Details |
|------------|---------|
| **Test Framework** | Vitest (primary), Jest API compatibility |
| **DOM Environment** | jsdom (`@vitest-environment jsdom`) |
| **Component Testing** | @testing-library/react, render, screen, fireEvent |
| **User Interaction** | @testing-library/user-event for realistic events |
| **Mocking** | vi.mock(), vi.fn(), vi.mocked() |
| **Async Testing** | waitFor, findBy queries |
| **Coverage** | v8 provider via @vitest/coverage-v8 |

### Existing Test Patterns (Reference)

| Pattern | Example Location | Description |
|---------|------------------|-------------|
| **Dropdown Testing** | `src/components/ItemManager/components/dialogs/__tests__/SortMenu.test.tsx` | Opening/closing, option selection, keyboard navigation |
| **Component Tests** | `src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx` | Props rendering, variants, accessibility |
| **Interaction Tests** | `src/components/ItemCreationWorkflow/components/shared/__tests__/SuggestionButton.test.tsx` | Click handlers, keyboard events, disabled states |
| **Hook Tests** | `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test.ts` | Persistence, state changes, mocking |
| **Timer/Async Tests** | `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` | waitFor, fake timers, async operations |

### Target Files to Test

| File Path | Purpose |
|-----------|---------|
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Main component with dropdown UI and locale selection |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | TypeScript interfaces (reference only) |

### Dependencies to Mock

| Dependency | Purpose |
|------------|---------|
| `next-intl` | Mock `useLocale` and `useRouter` for locale detection and navigation |
| `AuthContext` | Mock user authentication state for persistence tests |
| `document.cookie` | Mock cookie operations for preference persistence |
| `fetch` | Mock API calls for database persistence |

---

## Authorized Files and Functions for Modification

### Test Files (CREATE/WRITE)

| File Path | Purpose |
|-----------|---------|
| `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx` | Main component tests for dropdown behavior and persistence |

### Source Files (READ ONLY - for reference during test writing)

| File Path | Purpose |
|-----------|---------|
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Component implementation |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Type definitions |
| `/src/components/LanguageSwitcher/index.ts` | Module exports |

### Reference Test Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/dialogs/__tests__/SortMenu.test.tsx` | Dropdown testing patterns |
| `src/components/SimpleDashboard/__tests__/EmptyStateCard.test.tsx` | Component testing patterns |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/SuggestionButton.test.tsx` | Interaction testing patterns |

### Configuration Files (READ ONLY)

| File Path | Purpose |
|-----------|---------|
| `/vitest.config.ts` | Test configuration - may need coverage path updates |

---

## Implementation Tasks

### Task 1: Create Test File Structure

**Action:** Create `__tests__` directory and test file for LanguageSwitcher

```
/src/components/LanguageSwitcher/
├── __tests__/
│   └── LanguageSwitcher.test.tsx
├── index.ts
├── LanguageSwitcher.tsx
└── LanguageSwitcher.types.ts
```

---

### Task 2: Test Dropdown Behavior

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Test Categories:**

```typescript
describe('LanguageSwitcher')
  describe('Dropdown Behavior')
    - renders trigger button with current locale
    - opens dropdown on trigger click
    - displays all 6 supported languages
    - shows native language names (Français, Deutsch, etc.)
    - highlights current language option
    - closes dropdown after selection
    - closes dropdown on click outside
    - does not open when disabled
  describe('Language Selection')
    - calls onLocaleChange when option is selected
    - updates displayed language after selection
    - handles all supported locale codes
```

**Key Test Patterns:**

```typescript
/**
 * LanguageSwitcher Component Tests
 *
 * Tests for the language selection dropdown component
 * including dropdown behavior, keyboard navigation, and persistence.
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
  { code: 'fr', nativeName: 'Français' },
  { code: 'es', nativeName: 'Español' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'it', nativeName: 'Italiano' },
];

// =============================================================================
// Test Suites
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

    it('applies custom className', () => {
      render(<LanguageSwitcher className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('shows disabled styling when disabled', () => {
      render(<LanguageSwitcher disabled />);
      expect(screen.getByRole('button')).toHaveClass('opacity-50');
      expect(screen.getByRole('button')).toHaveClass('cursor-not-allowed');
    });
  });

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
      expect(screen.getByText('Français')).toBeInTheDocument();
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

      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('Nederlands')).toBeInTheDocument();
      expect(screen.getByText('Italiano')).toBeInTheDocument();
    });

    it('highlights current language option', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="fr" />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      const frenchOption = options.find(opt => opt.textContent?.includes('Français'));
      expect(frenchOption).toHaveAttribute('aria-selected', 'true');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Français')).toBeInTheDocument();

      await user.click(screen.getByText('Français'));

      await waitFor(() => {
        expect(screen.queryByText('Deutsch')).not.toBeInTheDocument();
      });
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher disabled />);

      await user.click(screen.getByRole('button'));

      expect(screen.queryByText('Français')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Selection Tests
  // ===========================================================================

  describe('Language Selection', () => {
    it('calls onLocaleChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Français'));

      expect(mockOnLocaleChange).toHaveBeenCalledWith('fr');
    });

    it('handles all supported locale codes', async () => {
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
  });
});
```

---

### Task 3: Test Keyboard Navigation

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Test Categories:**

```typescript
describe('Keyboard Navigation')
  - opens dropdown on Enter key
  - opens dropdown on Space key
  - closes dropdown on Escape key
  - navigates options with ArrowDown key
  - navigates options with ArrowUp key
  - selects focused option on Enter key
  - wraps around at end of list (optional)
  - focuses first option when dropdown opens
```

**Key Test Patterns:**

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

      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    it('opens dropdown on Space key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      screen.getByRole('button').focus();
      await user.keyboard(' ');

      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Français')).toBeInTheDocument();

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

      // Navigation should work
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
  });
```

---

### Task 4: Test Persistence Behavior

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Test Categories:**

```typescript
describe('Persistence')
  describe('Cookie Persistence')
    - sets cookie when language is selected
    - cookie has correct name (FAQBNB_LANG)
    - cookie has correct value (locale code)
    - cookie has appropriate max-age
  describe('Database Persistence (Authenticated Users)')
    - calls API endpoint when user is authenticated
    - sends correct locale in request body
    - handles API failure gracefully (still sets cookie)
  describe('Guest User Persistence')
    - only sets cookie when user is not authenticated
    - does not call API endpoint
```

**Key Test Patterns:**

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
        await user.click(screen.getByText('Français'));

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
        await user.click(screen.getByText('Español'));

        expect(cookieValue).toContain('path=/');
        expect(cookieValue).toContain('max-age=');
        expect(cookieValue).toContain('SameSite=');
      });
    });

    describe('Database Persistence (Authenticated Users)', () => {
      beforeEach(() => {
        // Mock authenticated user
        vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
          user: { id: 'test-user-123', email: 'test@example.com' },
          isLoading: false,
        });
      });

      afterEach(() => {
        // Reset to guest user
        vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
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
        await user.click(screen.getByText('Français'));

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/user/language',
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('fr'),
          })
        );
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

        expect(requestBody).not.toBeNull();
        expect(JSON.parse(requestBody!)).toEqual({ language: 'de' });
      });

      it('handles API failure gracefully', async () => {
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
    });
  });
```

---

### Task 5: Test Accessibility

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Test Categories:**

```typescript
describe('Accessibility')
  - trigger button has accessible name
  - trigger button has aria-expanded attribute
  - trigger button has aria-haspopup attribute
  - dropdown has role="listbox"
  - options have role="option"
  - selected option has aria-selected="true"
  - focus ring is visible on keyboard navigation
  - meets minimum touch target size (44px)
```

**Key Test Patterns:**

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

    it('has focus ring styles for keyboard navigation', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('trigger button has minimum touch target height', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('trigger button has correct type attribute', () => {
      render(<LanguageSwitcher />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });
```

---

### Task 6: Test Variants and Props

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Test Categories:**

```typescript
describe('Variants and Props')
  describe('Size Variants')
    - renders small size correctly
    - renders medium size correctly
    - renders large size correctly
  describe('Display Variants')
    - dropdown variant shows full language info
    - compact variant shows abbreviated display
  describe('Current Locale Display')
    - displays correct locale for each supported language
```

**Key Test Patterns:**

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

        expect(screen.getByText('Français')).toBeInTheDocument();
      });

      it('compact variant uses compact styling', () => {
        render(<LanguageSwitcher variant="compact" />);
        const button = screen.getByRole('button');
        // Compact variant should have more condensed styling
        expect(button).toBeInTheDocument();
      });
    });

    describe('Current Locale Display', () => {
      it.each(SUPPORTED_LANGUAGES)(
        'displays correct locale for $code',
        async ({ code, nativeName }) => {
          render(<LanguageSwitcher currentLocale={code as SupportedLanguage} />);
          expect(screen.getByRole('button')).toHaveTextContent(nativeName);
        }
      );
    });
  });
```

---

### Task 7: Test Edge Cases

**File:** `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx`

**Test Categories:**

```typescript
describe('Edge Cases')
  - handles rapid clicking without errors
  - handles selecting already-selected language
  - handles invalid locale prop gracefully
  - renders correctly during loading state
  - handles click outside with nested elements
```

**Key Test Patterns:**

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
      render(<LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />);

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
      await expect(user.click(screen.getByText('Français'))).resolves.not.toThrow();
    });
  });
```

---

## Acceptance Criteria Verification

| Criterion | Test File | Coverage |
|-----------|-----------|----------|
| Dropdown opens on click | LanguageSwitcher.test.tsx | Dropdown Behavior tests |
| All 6 languages displayed | LanguageSwitcher.test.tsx | `displays all 6 supported languages` |
| Native names shown | LanguageSwitcher.test.tsx | `shows native language names` |
| Selection changes language | LanguageSwitcher.test.tsx | Language Selection tests |
| Dropdown closes after selection | LanguageSwitcher.test.tsx | `closes dropdown after selection` |
| Keyboard navigation works | LanguageSwitcher.test.tsx | Keyboard Navigation tests |
| Cookie persistence for guests | LanguageSwitcher.test.tsx | Cookie Persistence tests |
| Database persistence for auth users | LanguageSwitcher.test.tsx | Database Persistence tests |
| Accessible with ARIA attributes | LanguageSwitcher.test.tsx | Accessibility tests |
| All test cases pass consistently | All tests | Deterministic mocking |
| Test coverage exceeds 80% | LanguageSwitcher.test.tsx | Comprehensive test categories |

---

## Test Execution

### Running Tests

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
```

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| vitest | Test framework (already installed) |
| @testing-library/react | Component rendering and queries (already installed) |
| @testing-library/user-event | Realistic user interactions (already installed) |
| vi.mock / vi.fn | Mocking utilities (built into vitest) |

---

## Implementation Order

1. **Task 1:** Create test file structure
2. **Task 2:** Test Dropdown Behavior - Core functionality
3. **Task 5:** Test Accessibility - Important for component quality
4. **Task 3:** Test Keyboard Navigation - User experience
5. **Task 4:** Test Persistence - Integration with storage
6. **Task 6:** Test Variants and Props - Configuration options
7. **Task 7:** Test Edge Cases - Robustness

**Rationale:** Start with core dropdown behavior which is the most critical functionality, then accessibility (required for production), then keyboard navigation, followed by persistence tests which require more complex mocking.

---

## Mock Configuration Details

### next-intl Mocking

```typescript
// Mock at the top of the test file
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
```

### AuthContext Mocking

```typescript
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null, // null for guest, { id: '...' } for authenticated
    isLoading: false,
  })),
}));
```

### Cookie Mocking

```typescript
// For testing cookie writes
let cookieValue = '';
Object.defineProperty(document, 'cookie', {
  get: () => cookieValue,
  set: (value) => { cookieValue = value; },
  configurable: true,
});
```

---

## Notes

- All tests should clean up mocks in `beforeEach`/`afterEach` to ensure isolation
- Use `userEvent.setup()` for more realistic user interaction simulation
- Mock external dependencies (next-intl, AuthContext) at the module level
- Use `waitFor` for async state changes after selections
- Follow existing test patterns from SortMenu.test.tsx for dropdown behavior
- Follow SuggestionButton.test.tsx for interaction patterns

---

## References

- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md) - Phase 6, Task 6.3
- [Request #255](/docs/gen_requests.md#req-255) - Write Component Tests for LanguageSwitcher
- [LanguageSwitcher Overview](/docs/REQ-248-create-languageswitcher-component-overview.md) - Component specification
- [SortMenu Tests](/src/components/ItemManager/components/dialogs/__tests__/SortMenu.test.tsx) - Dropdown testing patterns
- [Vitest Documentation](https://vitest.dev/) - Test framework reference
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/) - React testing utilities

---

*Document generated on 2026-01-18 for REQ-255: Write Component Tests for LanguageSwitcher*
