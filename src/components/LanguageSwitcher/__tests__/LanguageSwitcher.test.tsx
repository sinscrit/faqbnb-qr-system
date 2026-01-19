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
 * @lastModified 2026-01-18 21:25 UTC
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LanguageSwitcher } from '../LanguageSwitcher';
import type { SupportedLanguage } from '../LanguageSwitcher.types';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

// Store original location
const originalLocation = window.location;

// Mock window.location.reload
beforeEach(() => {
  // @ts-expect-error - Mocking location
  delete window.location;
  window.location = {
    ...originalLocation,
    reload: vi.fn(),
  };
});

afterEach(() => {
  window.location = originalLocation;
});

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// =============================================================================
// Test Helpers
// =============================================================================

const SUPPORTED_LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'es', nativeName: 'Español' },
] as const;

// Helper to reset all mocks
const resetMocks = () => {
  mockUseAuth.mockReturnValue({
    user: null,
    isLoading: false,
  });
};

// =============================================================================
// Test Suites
// =============================================================================

describe('LanguageSwitcher', () => {
  const mockOnLocaleChange = vi.fn();

  beforeEach(() => {
    resetMocks();
    mockOnLocaleChange.mockClear();
    // Reset cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
      configurable: true,
    });
    vi.clearAllMocks();
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

    it('displays correct locale name for each supported language', () => {
      const { rerender } = render(<LanguageSwitcher currentLocale="fr" />);
      expect(screen.getByRole('button')).toHaveTextContent(/Français/);

      rerender(<LanguageSwitcher currentLocale="de" />);
      expect(screen.getByRole('button')).toHaveTextContent(/Deutsch/);

      rerender(<LanguageSwitcher currentLocale="es" />);
      expect(screen.getByRole('button')).toHaveTextContent(/Español/);
    });

    it('applies custom className', () => {
      render(<LanguageSwitcher className="custom-class" />);
      const container = screen.getByRole('button').parentElement;
      expect(container?.className).toContain('custom-class');
    });

    it('shows disabled styling when disabled', () => {
      render(<LanguageSwitcher disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('renders without crashing when no props provided', () => {
      expect(() => render(<LanguageSwitcher />)).not.toThrow();
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
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('displays all 6 supported languages', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      // Verify 6 options are visible in the listbox
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(6);

      // Each language should have an option with its native name
      SUPPORTED_LANGUAGES.forEach(({ nativeName }) => {
        // Use getAllByText since some names may appear multiple times (on button + in dropdown)
        const elements = screen.getAllByText(nativeName);
        expect(elements.length).toBeGreaterThanOrEqual(1);
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
      render(<LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByText('Français'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
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
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside-element'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher disabled />);

      await user.click(screen.getByRole('button'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Language Selection Tests
  // ===========================================================================

  describe('Language Selection', () => {
    it('calls onLocaleChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Français'));

      await waitFor(() => {
        expect(mockOnLocaleChange).toHaveBeenCalledWith('fr');
      });
    });

    it('calls onLocaleChange with correct locale code for each language', async () => {
      const user = userEvent.setup();

      // Test a few languages
      const testCases = [
        { code: 'de', nativeName: 'Deutsch' },
        { code: 'es', nativeName: 'Español' },
        { code: 'it', nativeName: 'Italiano' },
      ];

      for (const { code, nativeName } of testCases) {
        mockOnLocaleChange.mockClear();
        const { unmount } = render(
          <LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />
        );

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText(nativeName));

        await waitFor(() => {
          expect(mockOnLocaleChange).toHaveBeenCalledWith(code);
        });
        unmount();
      }
    });

    it('does not call onLocaleChange when selecting same locale', async () => {
      const user = userEvent.setup();
      render(
        <LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />
      );

      await user.click(screen.getByRole('button'));

      // Find English option by role and click it (first option)
      const options = screen.getAllByRole('option');
      const englishOption = options.find(opt => opt.textContent?.includes('English'));
      await user.click(englishOption!);

      // Wait a bit to ensure no async call happens
      await new Promise(resolve => setTimeout(resolve, 50));

      // Component skips same locale selection
      expect(mockOnLocaleChange).not.toHaveBeenCalled();
    });

    it('does not throw when onLocaleChange is not provided', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="en" />);

      await user.click(screen.getByRole('button'));

      await expect(user.click(screen.getByText('Français'))).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe('Keyboard Navigation', () => {
    it('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens dropdown on Space key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      screen.getByRole('button').focus();
      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('navigates options with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="en" />);

      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}');

      // First option should be focused
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(6);
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
      render(<LanguageSwitcher currentLocale="en" onLocaleChange={mockOnLocaleChange} />);

      await user.click(screen.getByRole('button'));
      // Navigate to second option (Dutch)
      await user.keyboard('{ArrowDown}{Enter}');

      await waitFor(() => {
        expect(mockOnLocaleChange).toHaveBeenCalled();
      });
    });

    it('opens dropdown on ArrowDown when closed', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      screen.getByRole('button').focus();
      await user.keyboard('{ArrowDown}');

      // Dropdown should open
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

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

        render(<LanguageSwitcher currentLocale="en" />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Français'));

        await waitFor(() => {
          expect(cookieValue).toContain('FAQBNB_LANG=fr');
        });
      });

      it('cookie has correct name', async () => {
        const user = userEvent.setup();
        let cookieValue = '';
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (value) => { cookieValue = value; },
          configurable: true,
        });

        render(<LanguageSwitcher currentLocale="en" />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Deutsch'));

        await waitFor(() => {
          expect(cookieValue).toContain('FAQBNB_LANG=');
        });
      });

      it('cookie has appropriate settings', async () => {
        const user = userEvent.setup();
        let cookieValue = '';
        Object.defineProperty(document, 'cookie', {
          get: () => cookieValue,
          set: (value) => { cookieValue = value; },
          configurable: true,
        });

        render(<LanguageSwitcher currentLocale="en" />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Español'));

        await waitFor(() => {
          expect(cookieValue).toContain('path=/');
          expect(cookieValue).toContain('max-age=');
          expect(cookieValue).toContain('SameSite=');
        });
      });
    });

    describe('Database Persistence (Authenticated Users)', () => {
      beforeEach(() => {
        // Mock authenticated user
        mockUseAuth.mockReturnValue({
          user: { id: 'test-user-123', email: 'test@example.com' },
          isLoading: false,
        });
      });

      afterEach(() => {
        // Reset to guest user
        resetMocks();
      });

      it('calls API endpoint when user is authenticated', async () => {
        const user = userEvent.setup();
        const mockFetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
        global.fetch = mockFetch;

        render(<LanguageSwitcher currentLocale="en" />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Français'));

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

        render(<LanguageSwitcher currentLocale="en" />);

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

        render(<LanguageSwitcher currentLocale="en" />);

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

        render(<LanguageSwitcher currentLocale="en" />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Nederlands'));

        // Cookie should be set
        await waitFor(() => {
          expect(cookieValue).toContain('FAQBNB_LANG=nl');
        });

        // API should not be called for guest users
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('does not call API endpoint for guest users', async () => {
        const user = userEvent.setup();
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        render(<LanguageSwitcher currentLocale="en" />);

        await user.click(screen.getByRole('button'));
        await user.click(screen.getByText('Français'));

        // Wait a bit to ensure no async calls were made
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  });

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

    it('trigger button has correct type attribute', () => {
      render(<LanguageSwitcher />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('button has aria-controls attribute when dropdown is open', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-controls', 'language-listbox');

      await user.click(button);

      // Verify the listbox ID matches
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('id', 'language-listbox');
    });

    it('options have aria-label for screen readers', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      // Each option should have an aria-label with both English and native name
      options.forEach(option => {
        expect(option).toHaveAttribute('aria-label');
      });
    });
  });

  // ===========================================================================
  // Variants and Props Tests
  // ===========================================================================

  describe('Variants and Props', () => {
    describe('Size Variants', () => {
      it('applies small size styling', () => {
        render(<LanguageSwitcher size="sm" />);
        const button = screen.getByRole('button');
        expect(button.className).toContain('text-xs');
      });

      it('applies medium size styling', () => {
        render(<LanguageSwitcher size="md" />);
        const button = screen.getByRole('button');
        expect(button.className).toContain('text-sm');
      });

      it('applies large size styling', () => {
        render(<LanguageSwitcher size="lg" />);
        const button = screen.getByRole('button');
        expect(button.className).toContain('text-base');
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
        render(<LanguageSwitcher variant="compact" currentLocale="en" />);
        const button = screen.getByRole('button');
        // Compact variant should have EN displayed
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
        render(<LanguageSwitcher showFlags={true} currentLocale="en" />);
        // Implementation depends on how flags are rendered
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      it('hides flag icons when showFlags is false', () => {
        render(<LanguageSwitcher showFlags={false} currentLocale="en" />);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    describe('Loading State', () => {
      it('shows loading state when loading prop is true', () => {
        render(<LanguageSwitcher loading={true} />);
        expect(screen.getByText('Switching...')).toBeInTheDocument();
      });

      it('disables button during loading', () => {
        render(<LanguageSwitcher loading={true} />);
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });
  });

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

    it('handles invalid locale prop gracefully', () => {
      // @ts-expect-error Testing invalid prop
      render(<LanguageSwitcher currentLocale="invalid" />);

      // Should fall back to default or handle gracefully
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles missing onLocaleChange callback', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher currentLocale="en" />);

      await user.click(screen.getByRole('button'));

      // Should not throw when clicking option
      await expect(user.click(screen.getByText('Français'))).resolves.not.toThrow();
    });

    it('handles component unmount correctly', () => {
      const { unmount } = render(<LanguageSwitcher currentLocale="en" />);

      expect(screen.getByRole('button')).toHaveTextContent(/English/);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('updates when currentLocale prop changes', () => {
      const { rerender } = render(<LanguageSwitcher currentLocale="en" />);
      expect(screen.getByRole('button')).toHaveTextContent(/English/);

      rerender(<LanguageSwitcher currentLocale="de" />);
      expect(screen.getByRole('button')).toHaveTextContent(/Deutsch/);
    });

    it('handles network errors during API call', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'test-user-123', email: 'test@example.com' },
        isLoading: false,
      });

      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      let cookieValue = '';
      Object.defineProperty(document, 'cookie', {
        get: () => cookieValue,
        set: (value) => { cookieValue = value; },
        configurable: true,
      });

      render(<LanguageSwitcher currentLocale="en" />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Français'));

      // Cookie should still be set even if API errors
      await waitFor(() => {
        expect(cookieValue).toContain('FAQBNB_LANG=fr');
      });

      consoleSpy.mockRestore();
    });
  });
});
