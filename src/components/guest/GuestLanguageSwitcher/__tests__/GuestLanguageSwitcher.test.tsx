/**
 * @fileoverview Unit tests for GuestLanguageSwitcher component
 *
 * Tests for:
 * - Basic rendering with current language display
 * - Dropdown interaction (open/close, all languages displayed)
 * - Language selection and callback invocation
 * - Cookie persistence with setGuestLanguageCookie
 * - Error handling for cookie failures
 * - Visual state indicators (checkmarks, grayed out)
 * - Keyboard navigation (via Radix UI)
 *
 * @since Epic 4 - Guest Experience
 * Last Modified: 2026-01-23 14:50
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Define SupportedLanguage locally to avoid importing from files that trigger Supabase
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

// Mock @/types/l10n to avoid triggering Supabase through LocaleContext chain
// Note: vi.mock is hoisted, so we must define mock data inline
vi.mock('@/types/l10n', () => ({
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  ],
}));

// Mock setGuestLanguageCookie to avoid side effects
vi.mock('@/lib/i18n/guest-language', () => ({
  setGuestLanguageCookie: vi.fn(),
}));

// Import the component AFTER mocks are set up
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';

// Import the mocked function for assertions
import { setGuestLanguageCookie } from '@/lib/i18n/guest-language';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Default props for rendering the component
 */
const defaultProps = {
  currentLanguage: 'en' as SupportedLanguage,
  availableLanguages: ['en', 'fr', 'es'] as SupportedLanguage[],
  onLanguageChange: vi.fn(),
};

/**
 * Helper to render component with merged props
 */
function renderComponent(props: Partial<typeof defaultProps> = {}) {
  return render(<GuestLanguageSwitcher {...defaultProps} {...props} />);
}

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('GuestLanguageSwitcher - Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button with current language', () => {
    renderComponent({ currentLanguage: 'en' });

    const trigger = screen.getByRole('button', { name: /select language/i });
    expect(trigger).toBeInTheDocument();
  });

  it('displays current language flag and native name in trigger', () => {
    renderComponent({ currentLanguage: 'fr' });

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('🇫🇷');
    expect(trigger).toHaveTextContent('Français');
  });

  it('displays English flag and name when current language is English', () => {
    renderComponent({ currentLanguage: 'en' });

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveTextContent('🇬🇧');
    expect(trigger).toHaveTextContent('English');
  });

  it('applies custom className prop to trigger button', () => {
    renderComponent({ className: 'ml-auto custom-class' });

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('ml-auto');
    expect(trigger).toHaveClass('custom-class');
  });

  it('renders with aria-label for accessibility', () => {
    renderComponent();

    const trigger = screen.getByRole('button', { name: /select language/i });
    expect(trigger).toHaveAttribute('aria-label', 'Select language');
  });
});

// =============================================================================
// Dropdown Interaction Tests
// =============================================================================

describe('GuestLanguageSwitcher - Dropdown Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens dropdown when trigger button clicked', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Check that menu items are visible
    expect(screen.getByText('Français')).toBeVisible();
    expect(screen.getByText('Español')).toBeVisible();
  });

  it('displays all 6 supported languages in dropdown', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Check all 6 languages are displayed in menu items
    // Use getAllByRole to get menu items and check their content
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBe(6);

    // Check that each language is present by looking at menu item text content
    const menuTexts = menuItems.map((item) => item.textContent);
    expect(menuTexts.some((text) => text?.includes('English'))).toBe(true);
    expect(menuTexts.some((text) => text?.includes('Français'))).toBe(true);
    expect(menuTexts.some((text) => text?.includes('Español'))).toBe(true);
    expect(menuTexts.some((text) => text?.includes('Deutsch'))).toBe(true);
    expect(menuTexts.some((text) => text?.includes('Nederlands'))).toBe(true);
    expect(menuTexts.some((text) => text?.includes('Italiano'))).toBe(true);
  });

  it('closes dropdown after language selection', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Select French
    const frenchOption = screen.getByText('Français');
    await userEvent.click(frenchOption);

    // Dropdown should close - no menu items should be in the document
    await waitFor(() => {
      expect(screen.queryAllByRole('menuitem').length).toBe(0);
    });
  });
});

// =============================================================================
// Language Selection and Callback Tests
// =============================================================================

describe('GuestLanguageSwitcher - Language Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onLanguageChange callback when language selected', async () => {
    const onLanguageChange = vi.fn();
    renderComponent({ onLanguageChange });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    const frenchOption = screen.getByText('Français');
    await userEvent.click(frenchOption);

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
  });

  it('calls onLanguageChange with correct language code', async () => {
    const onLanguageChange = vi.fn();
    renderComponent({ onLanguageChange });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    const spanishOption = screen.getByText('Español');
    await userEvent.click(spanishOption);

    expect(onLanguageChange).toHaveBeenCalledWith('es');
  });

  it('can select unavailable language (for fallback viewing)', async () => {
    const onLanguageChange = vi.fn();
    renderComponent({
      onLanguageChange,
      availableLanguages: ['en', 'fr'], // German is NOT available
    });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    const germanOption = screen.getByText('Deutsch');
    await userEvent.click(germanOption);

    // Should still call callback with 'de' even though it's unavailable
    expect(onLanguageChange).toHaveBeenCalledWith('de');
  });

  it('selecting same language still calls callback', async () => {
    const onLanguageChange = vi.fn();
    renderComponent({ onLanguageChange, currentLanguage: 'en' });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Find English in the menu items (there's also "English" in trigger)
    const menuItems = screen.getAllByRole('menuitem');
    const englishMenuItem = menuItems.find((item) =>
      item.textContent?.includes('English')
    );
    expect(englishMenuItem).toBeTruthy();
    await userEvent.click(englishMenuItem!);

    expect(onLanguageChange).toHaveBeenCalledWith('en');
  });
});

// =============================================================================
// Cookie Persistence Tests
// =============================================================================

describe('GuestLanguageSwitcher - Cookie Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setGuestLanguageCookie with selected language', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    const frenchOption = screen.getByText('Français');
    await userEvent.click(frenchOption);

    expect(setGuestLanguageCookie).toHaveBeenCalledWith('fr');
  });

  it('handles cookie setting failure gracefully', async () => {
    // Mock setGuestLanguageCookie to throw an error
    vi.mocked(setGuestLanguageCookie).mockImplementationOnce(() => {
      throw new Error('Cookie blocked by privacy settings');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onLanguageChange = vi.fn();
    renderComponent({ onLanguageChange });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    const frenchOption = screen.getByText('Français');
    await userEvent.click(frenchOption);

    // Callback should still be called despite cookie error
    expect(onLanguageChange).toHaveBeenCalledWith('fr');

    // Warning should be logged
    expect(consoleSpy).toHaveBeenCalledWith(
      '[GuestLanguageSwitcher] Failed to set cookie:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

// =============================================================================
// Visual State Indicator Tests
// =============================================================================

describe('GuestLanguageSwitcher - Visual State Indicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows checkmark icon for available languages', async () => {
    renderComponent({ availableLanguages: ['en', 'fr'] });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // There should be checkmarks in the dropdown
    // Looking for SVG elements with check icon characteristics
    const checkIcons = document.querySelectorAll('.text-green-600');
    expect(checkIcons.length).toBe(2);
  });

  it('applies grayed out styling to unavailable languages', async () => {
    renderComponent({ availableLanguages: ['en'] }); // Only English available

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // French should be grayed out (text-gray-400 and italic)
    const frenchItem = screen.getByText('Français').closest('[role="menuitem"]');
    expect(frenchItem).toHaveClass('text-gray-400');
    expect(frenchItem).toHaveClass('italic');
  });

  it('unavailable languages are still clickable (not disabled)', async () => {
    const onLanguageChange = vi.fn();
    renderComponent({
      onLanguageChange,
      availableLanguages: ['en'], // Only English available
    });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Click on unavailable French option
    const frenchOption = screen.getByText('Français');
    await userEvent.click(frenchOption);

    // Should still trigger callback
    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });

  it('highlights current language with selected styling', async () => {
    renderComponent({ currentLanguage: 'fr', availableLanguages: ['en', 'fr'] });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // French should have selected styling (bg-blue-50, text-blue-900, font-semibold)
    // Find via menu items to avoid duplicate text issue
    const menuItems = screen.getAllByRole('menuitem');
    const frenchItem = menuItems.find((item) =>
      item.textContent?.includes('Français')
    );
    expect(frenchItem).toHaveClass('bg-blue-50');
    expect(frenchItem).toHaveClass('text-blue-900');
    expect(frenchItem).toHaveClass('font-semibold');
  });

  it('flag emojis have reduced opacity for unavailable languages', async () => {
    renderComponent({ availableLanguages: ['en'] }); // Only English available

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Find the French flag span and check for opacity class
    // The flag is in a span with text-xl class
    const flagSpans = document.querySelectorAll('.text-xl');

    // Filter to find the French flag (🇫🇷)
    const frenchFlag = Array.from(flagSpans).find(
      (span) => span.textContent === '🇫🇷'
    );
    expect(frenchFlag).toHaveClass('opacity-50');
  });
});

// =============================================================================
// Keyboard Navigation Tests
// =============================================================================

describe('GuestLanguageSwitcher - Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens dropdown when Enter key pressed on trigger', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    // Dropdown should be open
    expect(screen.getByText('Français')).toBeVisible();
  });

  it('opens dropdown when Space key pressed on trigger', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    trigger.focus();
    await userEvent.keyboard(' ');

    // Dropdown should be open
    expect(screen.getByText('Français')).toBeVisible();
  });

  it('closes dropdown when Escape key pressed', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Verify dropdown is open
    expect(screen.getAllByRole('menuitem').length).toBe(6);

    // Press Escape
    await userEvent.keyboard('{Escape}');

    // Dropdown should close - no menu items should be in the document
    await waitFor(() => {
      expect(screen.queryAllByRole('menuitem').length).toBe(0);
    });
  });

  it('arrow down key moves focus to next language option', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Press arrow down to move through options
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');

    // Focus should have moved (Radix handles this internally)
    // The focused item gets data-highlighted attribute
    const focusedItem = document.querySelector('[data-highlighted]');
    expect(focusedItem).toBeTruthy();
  });

  it('Enter key selects focused language option', async () => {
    const onLanguageChange = vi.fn();
    renderComponent({ onLanguageChange });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Navigate to French and select with Enter
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    // Should have selected a language
    expect(onLanguageChange).toHaveBeenCalled();
  });
});

// =============================================================================
// Touch Target Size Tests
// =============================================================================

describe('GuestLanguageSwitcher - Touch Targets', () => {
  it('menu items have minimum 48px height for touch targets', async () => {
    renderComponent();

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    const menuItems = screen.getAllByRole('menuitem');

    // Check that all menu items have the min-h-[48px] class
    menuItems.forEach((item) => {
      expect(item).toHaveClass('min-h-[48px]');
    });
  });
});

// =============================================================================
// All Supported Languages Tests
// =============================================================================

describe('GuestLanguageSwitcher - All Supported Languages', () => {
  it('correctly displays each supported language as current', async () => {
    const languages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
    const expectedDisplay = [
      { code: 'en', flag: '🇬🇧', name: 'English' },
      { code: 'fr', flag: '🇫🇷', name: 'Français' },
      { code: 'es', flag: '🇪🇸', name: 'Español' },
      { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
      { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
      { code: 'it', flag: '🇮🇹', name: 'Italiano' },
    ];

    for (const expected of expectedDisplay) {
      const { unmount } = renderComponent({
        currentLanguage: expected.code as SupportedLanguage,
        availableLanguages: languages,
      });

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveTextContent(expected.flag);
      expect(trigger).toHaveTextContent(expected.name);

      unmount();
    }
  });
});
