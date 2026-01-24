/**
 * @fileoverview Translation Test Fixtures for ItemDisplay Content Display Tests
 *
 * Provides mock data for items in various translation states to test the
 * guest-facing content display scenarios including translated content,
 * original content fallback, and partial translations.
 *
 * @module tests/fixtures/translationFixtures
 * @see REQ-E04-023 - Test content display scenarios
 * @created 2026-01-23
 * @modified 2026-01-23
 */

import type { ItemResponse, GuestTranslationMeta, SupportedLanguage } from '@/types';

// =============================================================================
// Section 1: Fully Translated Item Fixtures (French)
// =============================================================================

/**
 * Fully translated item fixture with complete French translation.
 * Used to test display of translated content in all fields.
 *
 * @description
 * This fixture represents an item that has been fully translated to French.
 * All translatable fields (name, description, article titles/descriptions,
 * link titles) contain French text while originalTitle fields contain English.
 */
export const fullyTranslatedItem: ItemResponse['data'] = {
  id: 'item-001',
  publicId: 'wifi-guide-001',
  name: 'Guide Wifi',
  description: 'Instructions pour se connecter au wifi',
  qrCodeUrl: 'https://example.com/qr/wifi-guide-001.png',
  links: [
    {
      id: 'link-001',
      title: 'Page de connexion routeur',
      originalTitle: 'Router login page',
      linkType: 'text',
      url: 'https://192.168.1.1',
      displayOrder: 0,
    },
    {
      id: 'link-002',
      title: 'Tutoriel vidéo WiFi',
      originalTitle: 'WiFi video tutorial',
      linkType: 'youtube',
      url: 'https://youtube.com/watch?v=abc123',
      thumbnailUrl: 'https://img.youtube.com/vi/abc123/default.jpg',
      displayOrder: 1,
    },
  ],
  articles: [
    {
      id: 'article-001',
      purpose: 'how-to-use',
      title: 'Comment se connecter',
      originalTitle: 'How to connect',
      description: 'Étape 1: Ouvrez les paramètres wifi de votre appareil',
      originalDescription: 'Step 1: Open wifi settings on your device',
      displayOrder: 0,
      links: [
        {
          id: 'link-003',
          title: 'Guide réseau',
          originalTitle: 'Network guide',
          linkType: 'pdf',
          url: 'https://example.com/network-guide.pdf',
          displayOrder: 0,
        },
      ],
    },
  ],
};

/**
 * Translation metadata for fully translated item (French).
 * Indicates content is translated from English to French.
 */
export const fullyTranslatedMeta: GuestTranslationMeta = {
  requestedLanguage: 'fr',
  displayLanguage: 'fr',
  availableLanguages: ['en', 'fr', 'es'],
  isTranslated: true,
  originalLanguage: 'en',
};

// =============================================================================
// Section 2: Untranslated Item Fixtures (Original English)
// =============================================================================

/**
 * Item fixture with no translation available (showing original English).
 * Used to test fallback display when requested translation is unavailable.
 *
 * @description
 * This fixture represents an item where the requested translation (German)
 * is not available, so the original English content is displayed instead.
 */
export const untranslatedItem: ItemResponse['data'] = {
  id: 'item-002',
  publicId: 'wifi-guide-002',
  name: 'Wifi Guide',
  description: 'Instructions for connecting to wifi',
  qrCodeUrl: 'https://example.com/qr/wifi-guide-002.png',
  links: [
    {
      id: 'link-101',
      title: 'Router login page',
      linkType: 'text',
      url: 'https://192.168.1.1',
      displayOrder: 0,
    },
  ],
  articles: [
    {
      id: 'article-101',
      purpose: 'how-to-use',
      title: 'How to connect',
      description: 'Step 1: Open wifi settings on your device',
      displayOrder: 0,
      links: [],
    },
  ],
};

/**
 * Translation metadata when requested translation is unavailable.
 * User requested German but it's not available, showing English fallback.
 */
export const missingTranslationMeta: GuestTranslationMeta = {
  requestedLanguage: 'de',
  displayLanguage: 'en',
  availableLanguages: ['en'],
  isTranslated: false,
  originalLanguage: 'en',
};

// =============================================================================
// Section 3: Partially Translated Item Fixtures (Spanish)
// =============================================================================

/**
 * Item fixture with partial Spanish translation.
 * Some fields are translated (name, link title), others are not (description).
 *
 * @description
 * This fixture tests the scenario where translation is partial - some content
 * is translated while other content remains in the original language. This
 * can happen when translations are in progress or incomplete.
 */
export const partiallyTranslatedItem: ItemResponse['data'] = {
  id: 'item-003',
  publicId: 'wifi-guide-003',
  name: 'Guía Wifi',
  // Description NOT translated - still in English
  description: 'Instructions for connecting to wifi',
  qrCodeUrl: 'https://example.com/qr/wifi-guide-003.png',
  links: [
    {
      id: 'link-201',
      title: 'Página de inicio del router',
      originalTitle: 'Router login page',
      linkType: 'text',
      url: 'https://192.168.1.1',
      displayOrder: 0,
    },
    {
      id: 'link-202',
      // This link NOT translated - still in English
      title: 'WiFi video tutorial',
      linkType: 'youtube',
      url: 'https://youtube.com/watch?v=def456',
      displayOrder: 1,
    },
  ],
  articles: [
    {
      id: 'article-201',
      purpose: 'how-to-use',
      title: 'Cómo conectarse',
      originalTitle: 'How to connect',
      // Description NOT translated
      description: 'Step 1: Open wifi settings on your device',
      displayOrder: 0,
      links: [],
    },
  ],
};

/**
 * Translation metadata for partially translated item (Spanish).
 * Indicates content is translated but may be incomplete.
 */
export const partialTranslationMeta: GuestTranslationMeta = {
  requestedLanguage: 'es',
  displayLanguage: 'es',
  availableLanguages: ['en', 'es'],
  isTranslated: true,
  originalLanguage: 'en',
};

// =============================================================================
// Section 4: Spanish Translated Item Fixtures (for language switching tests)
// =============================================================================

/**
 * Fully translated item fixture with Spanish translation.
 * Used for testing language switching scenarios.
 */
export const spanishTranslatedItem: ItemResponse['data'] = {
  id: 'item-001', // Same item as fullyTranslatedItem
  publicId: 'wifi-guide-001',
  name: 'Guía de Wifi',
  description: 'Instrucciones para conectarse al wifi',
  qrCodeUrl: 'https://example.com/qr/wifi-guide-001.png',
  links: [
    {
      id: 'link-001',
      title: 'Página de inicio de sesión del router',
      originalTitle: 'Router login page',
      linkType: 'text',
      url: 'https://192.168.1.1',
      displayOrder: 0,
    },
  ],
  articles: [
    {
      id: 'article-001',
      purpose: 'how-to-use',
      title: 'Cómo conectarse',
      originalTitle: 'How to connect',
      description: 'Paso 1: Abra la configuración de wifi de su dispositivo',
      originalDescription: 'Step 1: Open wifi settings on your device',
      displayOrder: 0,
      links: [],
    },
  ],
};

/**
 * Translation metadata for Spanish translation.
 */
export const spanishTranslationMeta: GuestTranslationMeta = {
  requestedLanguage: 'es',
  displayLanguage: 'es',
  availableLanguages: ['en', 'fr', 'es'],
  isTranslated: true,
  originalLanguage: 'en',
};

// =============================================================================
// Section 5: Helper Functions for Test Data
// =============================================================================

/**
 * Creates a custom translation meta object for testing specific scenarios.
 *
 * @param overrides - Partial GuestTranslationMeta to override defaults
 * @returns Complete GuestTranslationMeta object
 */
export function createTranslationMeta(
  overrides: Partial<GuestTranslationMeta>
): GuestTranslationMeta {
  return {
    requestedLanguage: 'en',
    displayLanguage: 'en',
    availableLanguages: ['en'],
    isTranslated: false,
    originalLanguage: 'en',
    ...overrides,
  };
}

/**
 * Creates a minimal item fixture for specific test scenarios.
 *
 * @param overrides - Partial item data to override defaults
 * @returns Complete ItemResponse['data'] object
 */
export function createItemFixture(
  overrides: Partial<ItemResponse['data']>
): ItemResponse['data'] {
  return {
    id: 'test-item',
    publicId: 'test-001',
    name: 'Test Item',
    description: 'Test description',
    links: [],
    ...overrides,
  };
}

// =============================================================================
// Section 6: Type Exports
// =============================================================================

export type { ItemResponse, GuestTranslationMeta, SupportedLanguage };
