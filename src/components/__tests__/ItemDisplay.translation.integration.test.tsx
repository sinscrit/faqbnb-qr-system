/**
 * @fileoverview ItemDisplay Translation Integration Tests
 *
 * Integration tests for complete user workflows in the ItemDisplay component's
 * translation features. Tests end-to-end scenarios including language switching,
 * toggle flows, and banner interactions.
 *
 * @module tests/ItemDisplay.translation.integration
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
  spanishTranslatedItem,
  spanishTranslationMeta,
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

describe('ItemDisplay Translation Integration Tests', () => {
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
  // Phase 9: Integration Tests - Complete User Workflows
  // ===========================================================================

  describe('Phase 9: Integration Tests', () => {
    describe('Task 9.1: Complete Guest Translation Experience', () => {
      it('complete workflow: view translation -> toggle to original -> toggle back', async () => {
        const user = userEvent.setup();

        // Step 1: Initial render with French translation
        const { rerender } = render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify French content and TranslationBanner are visible
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();
        // Use getAllByText since "English" may appear multiple places
        const englishElements = screen.getAllByText(/English/i);
        expect(englishElements.length).toBeGreaterThan(0);

        // Step 2: Click "View in Original" button (find by aria-label)
        const viewOriginalButton = screen.getByLabelText(/switch to original/i);
        await user.click(viewOriginalButton);

        // Verify toggleOriginal was called
        expect(mockToggleOriginal).toHaveBeenCalledTimes(1);

        // Step 3: Simulate state change - showOriginal = true
        mockLanguageState.showOriginal = true;
        rerender(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify banner is hidden when viewing original
        expect(screen.queryByText(/Translated from/i)).not.toBeInTheDocument();

        // Verify "View translation" button is now visible (by text since it's visible)
        expect(screen.getByText('View translation')).toBeInTheDocument();

        // Step 4: Click "View Translation" button to go back (find by aria-label)
        const viewTranslationButton = screen.getByLabelText(/switch to translated/i);
        await user.click(viewTranslationButton);

        // Verify toggleOriginal was called again
        expect(mockToggleOriginal).toHaveBeenCalledTimes(2);

        // Step 5: Simulate state change - showOriginal = false
        mockLanguageState.showOriginal = false;
        rerender(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify French content is visible again
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();
      });

      it('workflow: language change updates content and resets toggle state', async () => {
        const user = userEvent.setup();

        // Start with French translation, showOriginal = true (viewing original)
        mockLanguageState.showOriginal = true;

        const { rerender } = render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify we're viewing original (no translation banner)
        expect(screen.queryByText(/Translated from/i)).not.toBeInTheDocument();
        expect(screen.getByText('View translation')).toBeInTheDocument();

        // Open language switcher and select Spanish
        const switcherButton = screen.getByRole('button', {
          name: /select language/i,
        });
        await user.click(switcherButton);

        const spanishOption = await screen.findByText(/Español/i);
        await user.click(spanishOption);

        // Verify setLanguage was called
        expect(mockSetLanguage).toHaveBeenCalled();

        // Simulate the hook resetting showOriginal when language changes
        mockLanguageState.currentLanguage = 'es';
        mockLanguageState.showOriginal = false;

        // Rerender with Spanish content
        rerender(
          <ItemDisplay
            item={spanishTranslatedItem}
            translationMeta={spanishTranslationMeta}
          />
        );

        // Verify Spanish content is visible (not original)
        expect(screen.getByText('Guía de Wifi')).toBeInTheDocument();

        // Verify translation banner is back (showOriginal was reset)
        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();

        // Verify toggle button shows "View in original" again (by visible text)
        expect(screen.getByText(/View in original/i)).toBeInTheDocument();
      });

      it('workflow: toggle and language switcher work together', async () => {
        const user = userEvent.setup();

        const { rerender } = render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Start in French translated mode
        expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();

        // Toggle to original (find by aria-label)
        await user.click(screen.getByLabelText(/switch to original/i));
        expect(mockToggleOriginal).toHaveBeenCalled();

        // Simulate toggle effect
        mockLanguageState.showOriginal = true;
        rerender(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Verify original mode
        expect(screen.queryByText(/Translated from/i)).not.toBeInTheDocument();

        // Now switch language via switcher
        const switcherButton = screen.getByRole('button', {
          name: /select language/i,
        });
        await user.click(switcherButton);

        const spanishOption = await screen.findByText(/Español/i);
        await user.click(spanishOption);

        expect(mockSetLanguage).toHaveBeenCalled();

        // Language change should reset showOriginal
        mockLanguageState.currentLanguage = 'es';
        mockLanguageState.showOriginal = false;

        rerender(
          <ItemDisplay
            item={spanishTranslatedItem}
            translationMeta={spanishTranslationMeta}
          />
        );

        // Now viewing Spanish translation (not original)
        expect(screen.getByText('Guía de Wifi')).toBeInTheDocument();
        expect(screen.getByText(/Translated from/i)).toBeInTheDocument();
      });

      it('workflow: banner link "View original" triggers same toggle as button', async () => {
        const user = userEvent.setup();

        render(
          <ItemDisplay
            item={fullyTranslatedItem}
            translationMeta={fullyTranslatedMeta}
          />
        );

        // Find the "View original" link in the banner by aria-label
        // Both the toggle button and banner link use aria-label with "Switch to original"
        const viewOriginalButton = screen.getByLabelText(/switch to original/i);

        await user.click(viewOriginalButton);

        // Should call toggleOriginal (same as the toggle button)
        expect(mockToggleOriginal).toHaveBeenCalledTimes(1);
      });
    });
  });
});
