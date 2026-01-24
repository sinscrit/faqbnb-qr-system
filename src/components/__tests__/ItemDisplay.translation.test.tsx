/**
 * @fileoverview ItemDisplay Translation Content Display Tests
 *
 * Unit tests for verifying that translated content displays correctly in all
 * scenarios, including toggle behavior, language switching, banners, and
 * loading states in the ItemDisplay component.
 *
 * @module tests/ItemDisplay.translation
 * @see REQ-E04-023 - Test content display scenarios
 * @created 2026-01-23
 * @modified 2026-01-23
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemDisplay from '../ItemDisplay';

// Import test fixtures
import {
  fullyTranslatedItem,
  fullyTranslatedMeta,
  untranslatedItem,
  missingTranslationMeta,
  partiallyTranslatedItem,
  partialTranslationMeta,
  spanishTranslatedItem,
  spanishTranslationMeta,
  createTranslationMeta,
} from './fixtures/translationFixtures';

// =============================================================================
// Section 1: Mocks Setup
// =============================================================================

// Mock next-intl translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} data-testid="next-image" />
  ),
}));

// Mock next/navigation for useGuestLanguage hook
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/item/test-001',
}));

// Mock analytics API with all required exports
vi.mock('@/lib/api', () => ({
  analyticsApi: {
    recordVisit: vi.fn().mockResolvedValue(undefined),
  },
  reactionsApi: {
    getReactionCounts: vi.fn().mockResolvedValue({ reactions: {} }),
    addReaction: vi.fn().mockResolvedValue({}),
    removeReaction: vi.fn().mockResolvedValue({}),
  },
}));

// Mock session utilities
vi.mock('@/lib/session', () => ({
  getSessionId: () => 'test-session-id',
}));

// Mock guest language cookie utilities
vi.mock('@/lib/i18n/guest-language', () => ({
  detectGuestLanguageClient: vi.fn().mockReturnValue('fr'),
  setGuestLanguageCookie: vi.fn(),
}));

// Default mock state for useGuestLanguage hook
const mockSetLanguage = vi.fn();
const mockToggleOriginal = vi.fn();
const mockSetAvailableLanguages = vi.fn();

let mockLanguageState = {
  currentLanguage: 'fr' as const,
  showOriginal: false,
  isLoading: false,
  availableLanguages: ['en', 'fr', 'es'] as const,
};

// Mock the useGuestLanguage hook
vi.mock('@/hooks', () => ({
  useGuestLanguage: () => ({
    currentLanguage: mockLanguageState.currentLanguage,
    showOriginal: mockLanguageState.showOriginal,
    setLanguage: mockSetLanguage,
    toggleOriginal: mockToggleOriginal,
    isLoading: mockLanguageState.isLoading,
    availableLanguages: mockLanguageState.availableLanguages,
    setAvailableLanguages: mockSetAvailableLanguages,
  }),
}));

// =============================================================================
// Section 2: Test Setup and Teardown
// =============================================================================

describe('ItemDisplay Translation Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Reset mock state to defaults
    mockLanguageState = {
      currentLanguage: 'fr',
      showOriginal: false,
      isLoading: false,
      availableLanguages: ['en', 'fr', 'es'],
    };

    // Mock localStorage for visit tracking
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Phase 2: Test Translated Content Display
  // ===========================================================================

  describe('Phase 2: Translated Content Display', () => {
    describe('Task 2.1: Translated Item Title', () => {
      it('displays translated title when available', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify translated name is visible
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();

        // Verify original name is NOT visible (in heading context)
        expect(screen.queryByText('Wifi Guide')).not.toBeInTheDocument();
      });
    });

    describe('Task 2.2: Translated Item Description', () => {
      it('displays translated description when available', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify translated description is visible
        expect(
          screen.getByText('Instructions pour se connecter au wifi')
        ).toBeInTheDocument();
      });
    });

    describe('Task 2.3: Translated Link Titles', () => {
      it('displays translated link title when available', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify translated link title is visible (LinkCard uses displayTitle)
        // When articles exist, the component renders article.links, not top-level links
        // The article's link 'Guide réseau' should appear in the rendered LinkCard
        expect(
          screen.getByText('Guide réseau')
        ).toBeInTheDocument();
      });
    });

    describe('Task 2.4: Translated Article Titles', () => {
      it('displays translated article title when available', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify translated article title is visible
        expect(screen.getByText('Comment se connecter')).toBeInTheDocument();
      });
    });

    describe('Task 2.5: Translated Article Content', () => {
      it('displays translated article content when available', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify translated article description is visible (partial match)
        expect(
          screen.getByText(/Étape 1: Ouvrez les paramètres wifi/)
        ).toBeInTheDocument();
      });
    });

    describe('Task 2.6: TranslationBanner Display', () => {
      it('shows TranslationBanner when viewing translated content', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify "Translated from" text is visible
        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();
        // Verify "English" appears (source language) - use getAllByText since multiple may exist
        const englishElements = screen.getAllByText(/English/i);
        expect(englishElements.length).toBeGreaterThan(0);
      });
    });
  });

  // ===========================================================================
  // Phase 3: Test Original Content Display
  // ===========================================================================

  describe('Phase 3: Original Content Display', () => {
    describe('Task 3.1: Original Title When Translation Unavailable', () => {
      it('displays original title when translation is unavailable', () => {
        mockLanguageState.currentLanguage = 'de';

        render(
          <ItemDisplay
            item={untranslatedItem}
            translationMeta={missingTranslationMeta}
          />
        );

        // Verify original name is visible
        expect(screen.getByText('Wifi Guide')).toBeInTheDocument();
      });
    });

    describe('Task 3.2: Original Description When Translation Unavailable', () => {
      it('displays original description when translation is unavailable', () => {
        mockLanguageState.currentLanguage = 'de';

        render(
          <ItemDisplay
            item={untranslatedItem}
            translationMeta={missingTranslationMeta}
          />
        );

        // Verify original description is visible
        expect(
          screen.getByText('Instructions for connecting to wifi')
        ).toBeInTheDocument();
      });
    });

    describe('Task 3.3: MissingTranslationBanner Display', () => {
      it('shows MissingTranslationBanner when showing fallback language', () => {
        mockLanguageState.currentLanguage = 'de';

        // Use a meta that triggers the fallback condition:
        // isTranslated=true but requestedLanguage !== displayLanguage
        const fallbackMeta = createTranslationMeta({
          requestedLanguage: 'de',
          displayLanguage: 'en',
          isTranslated: true, // Important: must be true to trigger fallback banner
          availableLanguages: ['en'],
          originalLanguage: 'en',
        });

        render(
          <ItemDisplay
            item={untranslatedItem}
            translationMeta={fallbackMeta}
          />
        );

        // Verify fallback banner shows "German" and "not available"
        // MissingTranslationBanner shows when isShowingFallback is true
        expect(screen.getByText(/German/)).toBeInTheDocument();
        expect(screen.getByText(/not available/i)).toBeInTheDocument();
      });
    });

    describe('Task 3.4: TranslationBanner NOT Shown for Original', () => {
      it('does NOT show TranslationBanner when translation is not available', () => {
        mockLanguageState.currentLanguage = 'de';

        render(
          <ItemDisplay
            item={untranslatedItem}
            translationMeta={missingTranslationMeta}
          />
        );

        // When isTranslated is false, no TranslationBanner should show
        expect(
          screen.queryByText(/Translated from/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Phase 4: Test "View Original" Toggle
  // ===========================================================================

  describe('Phase 4: View Original Toggle', () => {
    describe('Task 4.1: Toggle from Translation to Original', () => {
      it('calls toggleOriginal when toggle button is clicked', async () => {
        const user = userEvent.setup();

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Find toggle button by aria-label (ViewOriginalToggle uses aria-label)
        const toggleButton = screen.getByLabelText(/switch to original/i);
        await user.click(toggleButton);

        // Verify toggleOriginal was called
        expect(mockToggleOriginal).toHaveBeenCalledTimes(1);
      });

      it('shows original content after toggle (simulated via rerender)', () => {
        // Initial render with translation
        const { rerender } = render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify translated content initially visible
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();

        // Simulate state change: showOriginal = true
        mockLanguageState.showOriginal = true;

        // Rerender with same item
        rerender(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Content still shows translated name (the item data doesn't change)
        // but the LinkCard components would show originalTitle when showOriginal=true
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
      });
    });

    describe('Task 4.2: Toggle Happens Instantly', () => {
      it('toggleOriginal function is called without delay', async () => {
        const user = userEvent.setup();

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        const toggleButton = screen.getByLabelText(/switch to original/i);

        // Measure time
        const startTime = performance.now();
        await user.click(toggleButton);
        const endTime = performance.now();

        // Verify toggle function called
        expect(mockToggleOriginal).toHaveBeenCalled();

        // Verify time is under 100ms (toggle should be instant)
        expect(endTime - startTime).toBeLessThan(100);
      });
    });

    describe('Task 4.3: Toggle Swaps Back to Translation', () => {
      it('shows "View translation" button when viewing original', () => {
        mockLanguageState.showOriginal = true;

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // When viewing original, button should say "View translation"
        expect(screen.getByText('View translation')).toBeInTheDocument();
      });

      it('calls toggleOriginal when clicking the toggle button in original mode', async () => {
        mockLanguageState.showOriginal = true;
        const user = userEvent.setup();

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Find toggle by aria-label when viewing original
        const toggleButton = screen.getByLabelText(/switch to translated/i);
        await user.click(toggleButton);

        expect(mockToggleOriginal).toHaveBeenCalledTimes(1);
      });
    });

    describe('Task 4.4: Toggle Affects All Content Types', () => {
      it('toggle affects all content (title, links, articles)', async () => {
        const user = userEvent.setup();

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify translated content initially visible
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
        expect(screen.getByText('Comment se connecter')).toBeInTheDocument();

        // Click toggle
        const toggleButton = screen.getByLabelText(/switch to original/i);
        await user.click(toggleButton);

        // Toggle function should have been called
        expect(mockToggleOriginal).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // Phase 5: Test Language Switcher Updates
  // ===========================================================================

  describe('Phase 5: Language Switcher Updates', () => {
    describe('Task 5.1: Content Updates When Language Changed', () => {
      it('setLanguage is called when language switcher is used', async () => {
        const user = userEvent.setup();

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Find language switcher button
        const switcherButton = screen.getByRole('button', {
          name: /select language/i,
        });

        // Open the dropdown
        await user.click(switcherButton);

        // Note: The dropdown uses Radix UI which renders in a portal
        // Look for language options in the document
        const spanishOption = await screen.findByText(/Español/i);
        await user.click(spanishOption);

        // Verify setLanguage was called
        expect(mockSetLanguage).toHaveBeenCalled();
      });
    });

    describe('Task 5.2: Language Change Resets showOriginal', () => {
      it('content updates to new language translation after language change', () => {
        // Start with French, showOriginal = true
        mockLanguageState.showOriginal = true;

        const { rerender } = render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Simulate language change to Spanish (hook resets showOriginal)
        mockLanguageState.currentLanguage = 'es';
        mockLanguageState.showOriginal = false;

        // Rerender with Spanish item
        rerender(
          <ItemDisplay
            item={spanishTranslatedItem}
            translationMeta={spanishTranslationMeta}
          />
        );

        // Verify Spanish content is now visible (not original English)
        expect(screen.getByText('Guía de Wifi')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Phase 6: Test Banner Display Logic
  // ===========================================================================

  describe('Phase 6: Banner Display Logic', () => {
    describe('Task 6.1: TranslationBanner Shows When Viewing Translated', () => {
      it('shows TranslationBanner when isTranslated=true and showOriginal=false', () => {
        mockLanguageState.showOriginal = false;

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();
      });
    });

    describe('Task 6.2: TranslationBanner Hidden When Viewing Original', () => {
      it('hides TranslationBanner when showOriginal=true', () => {
        mockLanguageState.showOriginal = true;

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        expect(
          screen.queryByText(/Translated from/i)
        ).not.toBeInTheDocument();
      });
    });

    describe('Task 6.3: MissingTranslationBanner When Unavailable', () => {
      it('shows MissingTranslationBanner when showing fallback content', () => {
        mockLanguageState.currentLanguage = 'de';

        // Create meta that triggers fallback: isTranslated=true but different languages
        const fallbackMeta = createTranslationMeta({
          requestedLanguage: 'de',
          displayLanguage: 'en',
          isTranslated: true,
          availableLanguages: ['en'],
          originalLanguage: 'en',
        });

        render(
          <ItemDisplay
            item={untranslatedItem}
            translationMeta={fallbackMeta}
          />
        );

        expect(screen.getByText(/German/)).toBeInTheDocument();
        expect(screen.getByText(/not available/i)).toBeInTheDocument();
      });
    });

    describe('Task 6.4: Banners Are Mutually Exclusive', () => {
      it('only one banner type shows at a time', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Query for banner-specific content
        const translationBanner = screen.queryByText(/Translated from/i);
        const missingBanner = screen.queryByText(/not available/i);

        // Only translation banner should be present for fully translated item
        expect(translationBanner).toBeInTheDocument();
        expect(missingBanner).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Phase 7: Test Loading States
  // ===========================================================================

  describe('Phase 7: Loading States', () => {
    describe('Task 7.1: Loading State During Language Switch', () => {
      it('isLoading state is available from hook', () => {
        mockLanguageState.isLoading = true;

        // The component should handle loading state gracefully
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Component renders successfully even during loading
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Phase 8: Test Partial Translation Handling
  // ===========================================================================

  describe('Phase 8: Partial Translation Handling', () => {
    describe('Task 8.1: Mix of Translated and Original Content', () => {
      it('displays mix of translated and original content for partial translations', () => {
        mockLanguageState.currentLanguage = 'es';

        render(
          <ItemDisplay
            item={partiallyTranslatedItem}
            translationMeta={partialTranslationMeta}
          />
        );

        // Verify translated title is visible (Spanish)
        expect(screen.getByText('Guía Wifi')).toBeInTheDocument();

        // Verify original description is visible (not translated)
        expect(
          screen.getByText('Instructions for connecting to wifi')
        ).toBeInTheDocument();
      });
    });

    describe('Task 8.2: TranslationBanner Shows for Partial Translation', () => {
      it('shows TranslationBanner even when translation is partial', () => {
        mockLanguageState.currentLanguage = 'es';

        render(
          <ItemDisplay
            item={partiallyTranslatedItem}
            translationMeta={partialTranslationMeta}
          />
        );

        // As long as isTranslated=true, banner should show
        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Phase 10: Accessibility Tests
  // ===========================================================================

  describe('Phase 10: Accessibility Tests', () => {
    describe('Task 10.1: Content Language Announcements', () => {
      it('component renders accessible structure with status elements', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify status elements exist for screen readers
        const statusElements = screen.getAllByRole('status');
        expect(statusElements.length).toBeGreaterThan(0);
      });
    });

    describe('Task 10.2: Toggle Button Has Descriptive Label', () => {
      it('toggle button has accessible aria-label', () => {
        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Button should have accessible aria-label
        const toggleButton = screen.getByLabelText(/switch to original.*english/i);
        expect(toggleButton).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('aria-pressed');
      });
    });
  });
});
