/**
 * @fileoverview ItemDisplay Component - Edge Case Tests
 *
 * Tests for unusual or error scenarios in the ItemDisplay component,
 * including partial translations, null handling, and extreme content.
 *
 * @module tests/ItemDisplay.edgecases
 * @see REQ-E04-024 - Test edge cases
 * @created 2026-01-23
 * @modified 2026-01-23
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ItemDisplay from '../ItemDisplay';

// Import edge case fixtures
import {
  partiallyTranslatedContent,
  createEdgeCaseItem,
  createEdgeCaseTranslationMeta,
} from '../../lib/i18n/__tests__/fixtures/edgeCaseFixtures';

// =============================================================================
// Mocks
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

// Mock next/navigation
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
    setLanguage: vi.fn(),
    toggleOriginal: vi.fn(),
    isLoading: mockLanguageState.isLoading,
    availableLanguages: mockLanguageState.availableLanguages,
    setAvailableLanguages: vi.fn(),
  }),
}));

// =============================================================================
// Test Suite
// =============================================================================

describe('ItemDisplay - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock state to defaults
    mockLanguageState = {
      currentLanguage: 'fr',
      showOriginal: false,
      isLoading: false,
      availableLanguages: ['en', 'fr', 'es'],
    };

    // Mock localStorage
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

  // ===========================================================================
  // Task 8.1: Test Component with Only Title Translated
  // ===========================================================================

  describe('Partial Translation Rendering', () => {
    it('displays item with only title translated', () => {
      const item = createEdgeCaseItem({
        name: partiallyTranslatedContent.onlyTitle.name,
        description: partiallyTranslatedContent.onlyTitle.description,
      });

      const translationMeta = createEdgeCaseTranslationMeta({
        isTranslated: true,
        requestedLanguage: 'fr',
      });

      render(
        <ItemDisplay
          item={item}
          translationMeta={translationMeta}
        />
      );

      // Verify translated title appears
      expect(screen.getByText('Guide Wifi')).toBeInTheDocument();

      // Verify original description appears
      expect(screen.getByText('Instructions for connecting to wifi')).toBeInTheDocument();
    });

    // ===========================================================================
    // Task 8.2: Test Component with Mixed Translated/Untranslated Links
    // ===========================================================================

    it('displays item with mixed translated/untranslated links', () => {
      const item = createEdgeCaseItem({
        name: 'Test Item',
        description: 'Test description',
        links: partiallyTranslatedContent.mixedLinks,
        articles: [],
      });

      const translationMeta = createEdgeCaseTranslationMeta({
        isTranslated: true,
        requestedLanguage: 'fr',
      });

      render(
        <ItemDisplay
          item={item}
          translationMeta={translationMeta}
        />
      );

      // Verify translated link appears
      expect(screen.getByText('Page de connexion routeur')).toBeInTheDocument();

      // Verify untranslated link appears
      expect(screen.getByText('Support documentation')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Task 8.3: Test Component with Empty Translation Metadata
  // ===========================================================================

  describe('Missing or Empty Props', () => {
    it('handles empty translation metadata gracefully', () => {
      const item = createEdgeCaseItem({
        name: 'Basic Item',
        description: 'Basic description',
      });

      // Render with ONLY item prop (no translationMeta)
      expect(() => {
        render(<ItemDisplay item={item} />);
      }).not.toThrow();

      // Verify component renders basic content
      expect(screen.getByText('Basic Item')).toBeInTheDocument();
    });

    // ===========================================================================
    // Task 8.4: Test Component with Null/Undefined Fields
    // ===========================================================================

    it('handles null/undefined fields in item', () => {
      const item = createEdgeCaseItem({
        name: 'Test Item with Nulls',
        description: null as unknown as string,
        links: undefined as unknown as [],
        articles: null as unknown as [],
      });

      // Should not crash
      expect(() => {
        render(<ItemDisplay item={item} />);
      }).not.toThrow();
    });
  });

  // ===========================================================================
  // Task 8.5: Test Component with Very Long Content
  // ===========================================================================

  describe('Extreme Content', () => {
    it('handles very long translated content', () => {
      const longText = 'A'.repeat(10000);
      const item = createEdgeCaseItem({
        name: 'Long Content Test',
        description: longText,
      });

      const translationMeta = createEdgeCaseTranslationMeta();

      render(
        <ItemDisplay
          item={item}
          translationMeta={translationMeta}
        />
      );

      // Verify long text appears
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    // ===========================================================================
    // Task 8.6: Test Component with Special Characters
    // ===========================================================================

    it('handles special characters in translated content', () => {
      const specialChars = '<>&"\'`';
      const item = createEdgeCaseItem({
        name: `Test ${specialChars}`,
        description: 'Description with special chars',
      });

      const translationMeta = createEdgeCaseTranslationMeta();

      render(
        <ItemDisplay
          item={item}
          translationMeta={translationMeta}
        />
      );

      // Verify special characters appear as text (not interpreted as HTML)
      expect(screen.getByText(`Test ${specialChars}`)).toBeInTheDocument();
    });
  });
});
