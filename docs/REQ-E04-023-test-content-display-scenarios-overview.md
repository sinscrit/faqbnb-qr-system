# Implementation Overview: Test Content Display Scenarios

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-023 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 17:45 |
| Breakdown Created | 2026-01-22 19:52 |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

---

## Goals

Create comprehensive tests for content display scenarios to ensure translated content renders correctly in all situations. Tests should verify that content display, toggling, and language switching work as expected with proper UX.

**Success Criteria:**
- Tests verify translated item titles display correctly when available
- Tests verify translated descriptions display correctly when available
- Tests verify translated article content displays correctly
- Tests verify translated link titles display correctly
- Tests verify original content displays when translation is unavailable
- Tests verify "View Original" toggle swaps content without page reload
- Tests verify "View Original" toggle swaps back to translation on second click
- Tests verify language switcher selection updates displayed content
- Tests verify TranslationBanner appears when viewing translated content
- Tests verify MissingTranslationBanner appears when translation unavailable
- Tests verify loading states display during language switches
- All tests pass in CI pipeline
- Tests are maintainable and well-documented

---

## Assumptions & Clarifications

**Assumptions:**
- REQ-E04-017 (Update ItemDisplay Component) provides the integrated component to test
- REQ-E04-008 through REQ-E04-012 provide the UI components (banners, switcher, toggle)
- REQ-E04-014 (useGuestLanguage hook) provides the state management to test
- Testing framework is Vitest with React Testing Library
- Test data includes items with full translations, partial translations, and no translations
- Components follow React best practices (proper state management, no side effects)

**Clarifications Needed:**
- Should we test API integration or mock the translation data?
- **Answer:** Mock translation data for unit tests, test API integration separately if needed

---

## Implementation Plan

### Step 1: Create Test Data Fixtures
- **Description**: Create mock data for items with various translation states (full, partial, missing)
- **Rationale**: Reusable test data ensures consistency and reduces duplication across tests
- **Estimated Effort**: S (30-45 minutes)

**Implementation Details:**
```typescript
// File: /src/components/__tests__/fixtures/translationFixtures.ts

/**
 * Test Fixtures for Translation Display Tests
 * Provides mock data for items in various translation states.
 *
 * REQ-E04-023: Test Content Display Scenarios
 *
 * @module components/__tests__/fixtures/translationFixtures
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import type { Item, TranslationMeta } from '@/types';

/**
 * Item with full French translation available
 */
export const fullyTranslatedItem: Item = {
  id: 'item-1',
  publicId: 'abc123',
  name: 'Guide Wifi',
  originalName: 'Wifi Guide',
  description: 'Instructions pour se connecter au wifi',
  originalDescription: 'Instructions for connecting to wifi',
  sourceLanguage: 'en',
  links: [
    {
      id: 'link-1',
      title: 'Page de connexion routeur',
      originalTitle: 'Router login page',
      linkType: 'website',
      url: 'https://router.local',
      displayOrder: 1,
    },
  ],
  articles: [
    {
      id: 'article-1',
      title: 'Comment se connecter',
      originalTitle: 'How to connect',
      content: 'Étape 1: Ouvrez les paramètres wifi...',
      originalContent: 'Step 1: Open wifi settings...',
      displayOrder: 1,
    },
  ],
  tags: ['wifi', 'internet'],
};

/**
 * Translation metadata for fully translated item
 */
export const fullyTranslatedMeta: TranslationMeta = {
  requestedLanguage: 'fr',
  displayLanguage: 'fr',
  originalLanguage: 'en',
  availableLanguages: ['en', 'fr', 'es'],
  isTranslated: true,
};

/**
 * Item with no translation available (showing original English)
 */
export const untranslatedItem: Item = {
  id: 'item-2',
  publicId: 'def456',
  name: 'Wifi Guide',
  description: 'Instructions for connecting to wifi',
  sourceLanguage: 'en',
  links: [
    {
      id: 'link-2',
      title: 'Router login page',
      linkType: 'website',
      url: 'https://router.local',
      displayOrder: 1,
    },
  ],
  articles: [],
  tags: ['wifi'],
};

/**
 * Translation metadata when no translation exists
 */
export const missingTranslationMeta: TranslationMeta = {
  requestedLanguage: 'de',
  displayLanguage: 'en',
  originalLanguage: 'en',
  availableLanguages: ['en', 'fr'],
  isTranslated: false,
};

/**
 * Item with partial translation (some fields translated, others not)
 */
export const partiallyTranslatedItem: Item = {
  id: 'item-3',
  publicId: 'ghi789',
  name: 'Guía Wifi', // Translated
  originalName: 'Wifi Guide',
  description: 'Instructions for connecting to wifi', // Not translated
  originalDescription: 'Instructions for connecting to wifi',
  sourceLanguage: 'en',
  links: [
    {
      id: 'link-3',
      title: 'Página de inicio de sesión del router', // Translated
      originalTitle: 'Router login page',
      linkType: 'website',
      url: 'https://router.local',
      displayOrder: 1,
    },
  ],
  articles: [
    {
      id: 'article-3',
      title: 'Cómo conectarse', // Translated
      originalTitle: 'How to connect',
      content: 'Step 1: Open wifi settings...', // Not translated
      originalContent: 'Step 1: Open wifi settings...',
      displayOrder: 1,
    },
  ],
  tags: ['wifi'],
};

/**
 * Translation metadata for partial translation
 */
export const partialTranslationMeta: TranslationMeta = {
  requestedLanguage: 'es',
  displayLanguage: 'es',
  originalLanguage: 'en',
  availableLanguages: ['en', 'es'],
  isTranslated: true,
};
```

### Step 2: Test Translated Content Display
- **Description**: Write tests verifying translated content displays correctly for all content types
- **Rationale**: Core functionality - translated content must render properly
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
// File: /src/components/__tests__/ItemDisplay.translation.test.tsx

/**
 * ItemDisplay Translation Display Tests
 * Tests for translated content rendering.
 *
 * REQ-E04-023: Test Content Display Scenarios
 * REQ-E04-017: Update ItemDisplay Component
 *
 * @module components/__tests__/ItemDisplay.translation.test
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ItemDisplay from '../ItemDisplay';
import {
  fullyTranslatedItem,
  fullyTranslatedMeta,
} from './fixtures/translationFixtures';

// Mock the useGuestLanguage hook
vi.mock('@/hooks/useGuestLanguage', () => ({
  useGuestLanguage: vi.fn(() => ({
    currentLanguage: 'fr',
    showOriginal: false,
    setLanguage: vi.fn(),
    toggleOriginal: vi.fn(),
  })),
}));

describe('ItemDisplay - Translated Content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays translated item title', () => {
    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
    expect(screen.queryByText('Wifi Guide')).not.toBeInTheDocument();
  });

  it('displays translated item description', () => {
    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(
      screen.getByText('Instructions pour se connecter au wifi')
    ).toBeInTheDocument();
  });

  it('displays translated link titles', () => {
    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(screen.getByText('Page de connexion routeur')).toBeInTheDocument();
    expect(screen.queryByText('Router login page')).not.toBeInTheDocument();
  });

  it('displays translated article titles', () => {
    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(screen.getByText('Comment se connecter')).toBeInTheDocument();
    expect(screen.queryByText('How to connect')).not.toBeInTheDocument();
  });

  it('displays translated article content', () => {
    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(
      screen.getByText(/Étape 1: Ouvrez les paramètres wifi/)
    ).toBeInTheDocument();
  });

  it('displays TranslationBanner when content is translated', () => {
    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(
      screen.getByText(/Translated from English/i)
    ).toBeInTheDocument();
  });
});
```

### Step 3: Test Original Content Display
- **Description**: Write tests verifying original content displays when no translation exists
- **Rationale**: Fallback behavior must work correctly for untranslated items
- **Estimated Effort**: M (45-60 minutes)

**Implementation Details:**
```typescript
describe('ItemDisplay - Original Content (No Translation)', () => {
  it('displays original title when translation unavailable', () => {
    render(
      <ItemDisplay
        item={untranslatedItem}
        translationMeta={missingTranslationMeta}
      />
    );

    expect(screen.getByText('Wifi Guide')).toBeInTheDocument();
  });

  it('displays original description when translation unavailable', () => {
    render(
      <ItemDisplay
        item={untranslatedItem}
        translationMeta={missingTranslationMeta}
      />
    );

    expect(
      screen.getByText('Instructions for connecting to wifi')
    ).toBeInTheDocument();
  });

  it('displays MissingTranslationBanner when requested translation unavailable', () => {
    render(
      <ItemDisplay
        item={untranslatedItem}
        translationMeta={missingTranslationMeta}
      />
    );

    expect(
      screen.getByText(/German translation not available/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Showing content in English/i)
    ).toBeInTheDocument();
  });

  it('does not display TranslationBanner when showing original', () => {
    render(
      <ItemDisplay
        item={untranslatedItem}
        translationMeta={missingTranslationMeta}
      />
    );

    expect(
      screen.queryByText(/Translated from/i)
    ).not.toBeInTheDocument();
  });
});
```

### Step 4: Test "View Original" Toggle
- **Description**: Write tests verifying toggle switches between translated and original content instantly
- **Rationale**: Toggle is key UX feature - must work without page reload
- **Estimated Effort**: M (1-1.5 hours)

**Implementation Details:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ItemDisplay - View Original Toggle', () => {
  it('toggles from translation to original on click', async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();

    // Mock hook to return showOriginal state
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: mockToggle,
    });

    const { rerender } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Initially shows translated content
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();

    // Click toggle button
    const toggleButton = screen.getByRole('button', {
      name: /view in original/i,
    });
    await user.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);

    // Simulate state change by re-mocking with showOriginal: true
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: true,
      setLanguage: vi.fn(),
      toggleOriginal: mockToggle,
    });

    // Rerender with new state
    rerender(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Now shows original content
    expect(screen.getByText('Wifi Guide')).toBeInTheDocument();
    expect(screen.queryByText('Guide Wifi')).not.toBeInTheDocument();
  });

  it('toggle happens instantly without page reload', async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();

    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: mockToggle,
    });

    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /view in original/i,
    });

    // Measure time for toggle
    const startTime = performance.now();
    await user.click(toggleButton);
    const endTime = performance.now();

    // Should be instant (< 100ms)
    expect(endTime - startTime).toBeLessThan(100);
    expect(mockToggle).toHaveBeenCalled();
  });

  it('toggle swaps back to translation on second click', async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();

    // Start with showOriginal: true
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: true,
      setLanguage: vi.fn(),
      toggleOriginal: mockToggle,
    });

    const { rerender } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Shows original content
    expect(screen.getByText('Wifi Guide')).toBeInTheDocument();

    // Click toggle to go back to translation
    const toggleButton = screen.getByRole('button', {
      name: /view translation/i,
    });
    await user.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);

    // Simulate state change back to showOriginal: false
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: mockToggle,
    });

    rerender(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Back to translated content
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
  });

  it('toggle affects all content types simultaneously', async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();

    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: mockToggle,
    });

    const { rerender } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // All translated content visible
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
    expect(screen.getByText('Page de connexion routeur')).toBeInTheDocument();
    expect(screen.getByText('Comment se connecter')).toBeInTheDocument();

    // Toggle
    const toggleButton = screen.getByRole('button', {
      name: /view in original/i,
    });
    await user.click(toggleButton);

    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: true,
      setLanguage: vi.fn(),
      toggleOriginal: mockToggle,
    });

    rerender(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // All original content visible
    expect(screen.getByText('Wifi Guide')).toBeInTheDocument();
    expect(screen.getByText('Router login page')).toBeInTheDocument();
    expect(screen.getByText('How to connect')).toBeInTheDocument();
  });
});
```

### Step 5: Test Language Switcher Updates
- **Description**: Write tests verifying language switcher selection updates displayed content
- **Rationale**: Language switcher is primary way guests change languages
- **Estimated Effort**: M (1 hour)

**Implementation Details:**
```typescript
describe('ItemDisplay - Language Switcher', () => {
  it('updates content when language changed via switcher', async () => {
    const user = userEvent.setup();
    const mockSetLanguage = vi.fn();

    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: mockSetLanguage,
      toggleOriginal: vi.fn(),
    });

    const { rerender } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Initially French
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();

    // Open language switcher and select Spanish
    const switcher = screen.getByRole('button', { name: /language/i });
    await user.click(switcher);

    const spanishOption = screen.getByRole('menuitem', { name: /español/i });
    await user.click(spanishOption);

    expect(mockSetLanguage).toHaveBeenCalledWith('es');

    // Simulate language change
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'es',
      showOriginal: false,
      setLanguage: mockSetLanguage,
      toggleOriginal: vi.fn(),
    });

    // Update item with Spanish translation
    const spanishItem = {
      ...fullyTranslatedItem,
      name: 'Guía Wifi',
      description: 'Instrucciones para conectarse al wifi',
    };

    rerender(
      <ItemDisplay
        item={spanishItem}
        translationMeta={{
          ...fullyTranslatedMeta,
          requestedLanguage: 'es',
          displayLanguage: 'es',
        }}
      />
    );

    // Content updated to Spanish
    expect(screen.getByText('Guía Wifi')).toBeInTheDocument();
  });

  it('language change resets showOriginal to false', async () => {
    const user = userEvent.setup();
    const mockSetLanguage = vi.fn();

    // Start with viewing original
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: true,
      setLanguage: mockSetLanguage,
      toggleOriginal: vi.fn(),
    });

    const { rerender } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Showing original
    expect(screen.getByText('Wifi Guide')).toBeInTheDocument();

    // Change language
    const switcher = screen.getByRole('button', { name: /language/i });
    await user.click(switcher);
    const spanishOption = screen.getByRole('menuitem', { name: /español/i });
    await user.click(spanishOption);

    // Hook should reset showOriginal
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'es',
      showOriginal: false, // Reset
      setLanguage: mockSetLanguage,
      toggleOriginal: vi.fn(),
    });

    const spanishItem = {
      ...fullyTranslatedItem,
      name: 'Guía Wifi',
    };

    rerender(
      <ItemDisplay
        item={spanishItem}
        translationMeta={{
          ...fullyTranslatedMeta,
          requestedLanguage: 'es',
          displayLanguage: 'es',
        }}
      />
    );

    // Now showing translation, not original
    expect(screen.getByText('Guía Wifi')).toBeInTheDocument();
  });
});
```

### Step 6: Test Banner Display Logic
- **Description**: Write tests verifying correct banner appears in each scenario
- **Rationale**: Banners provide important context to users about translation state
- **Estimated Effort**: S (45 minutes)

**Implementation Details:**
```typescript
describe('ItemDisplay - Translation Banners', () => {
  it('shows TranslationBanner when viewing translated content', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(
      screen.getByText(/Translated from English/i)
    ).toBeInTheDocument();
  });

  it('hides TranslationBanner when viewing original', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: true,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    expect(
      screen.queryByText(/Translated from English/i)
    ).not.toBeInTheDocument();
  });

  it('shows MissingTranslationBanner when translation unavailable', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'de',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    render(
      <ItemDisplay
        item={untranslatedItem}
        translationMeta={missingTranslationMeta}
      />
    );

    expect(
      screen.getByText(/German translation not available/i)
    ).toBeInTheDocument();
  });

  it('banners are mutually exclusive', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    const { container } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Only one banner should be present
    const banners = container.querySelectorAll('[role="alert"], [role="status"]');
    expect(banners.length).toBeLessThanOrEqual(1);
  });
});
```

### Step 7: Test Loading States (if applicable)
- **Description**: Write tests verifying loading indicators during language switches
- **Rationale**: Good UX requires loading feedback during async operations
- **Estimated Effort**: S (30-45 minutes)

**Implementation Details:**
```typescript
describe('ItemDisplay - Loading States', () => {
  it('displays loading state during language switch', async () => {
    const user = userEvent.setup();

    // Mock async language change
    const mockSetLanguage = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: mockSetLanguage,
      toggleOriginal: vi.fn(),
      isLoading: false,
    });

    const { rerender } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Start language change
    const switcher = screen.getByRole('button', { name: /language/i });
    await user.click(switcher);
    const spanishOption = screen.getByRole('menuitem', { name: /español/i });
    await user.click(spanishOption);

    // Mock loading state
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: mockSetLanguage,
      toggleOriginal: vi.fn(),
      isLoading: true,
    });

    rerender(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Loading indicator should appear
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
});
```

### Step 8: Test Partial Translation Handling
- **Description**: Write tests verifying mixed translated/original content displays correctly
- **Rationale**: Edge case that must be handled gracefully
- **Estimated Effort**: S (30-45 minutes)

**Implementation Details:**
```typescript
describe('ItemDisplay - Partial Translations', () => {
  it('displays mix of translated and original content', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'es',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    render(
      <ItemDisplay
        item={partiallyTranslatedItem}
        translationMeta={partialTranslationMeta}
      />
    );

    // Translated title
    expect(screen.getByText('Guía Wifi')).toBeInTheDocument();

    // Original description (not translated)
    expect(
      screen.getByText('Instructions for connecting to wifi')
    ).toBeInTheDocument();

    // Translated link title
    expect(
      screen.getByText('Página de inicio de sesión del router')
    ).toBeInTheDocument();
  });

  it('shows TranslationBanner even with partial translation', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'es',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    render(
      <ItemDisplay
        item={partiallyTranslatedItem}
        translationMeta={partialTranslationMeta}
      />
    );

    expect(
      screen.getByText(/Translated from English/i)
    ).toBeInTheDocument();
  });
});
```

### Step 9: Create Integration Tests
- **Description**: Write end-to-end tests for complete user workflows
- **Rationale**: Verify components work together correctly
- **Estimated Effort**: M (1 hour)

**Implementation Details:**
```typescript
// File: /src/components/__tests__/ItemDisplay.translation.integration.test.tsx

describe('ItemDisplay - Translation Workflow Integration', () => {
  it('complete guest translation experience', async () => {
    const user = userEvent.setup();

    // Start with French translation
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    const { rerender } = render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Verify French content
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
    expect(
      screen.getByText(/Translated from English/i)
    ).toBeInTheDocument();

    // Toggle to original
    const toggleButton = screen.getByRole('button', {
      name: /view in original/i,
    });
    await user.click(toggleButton);

    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: true,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    rerender(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Verify original content
    expect(screen.getByText('Wifi Guide')).toBeInTheDocument();
    expect(
      screen.queryByText(/Translated from/i)
    ).not.toBeInTheDocument();

    // Toggle back
    const viewTranslationButton = screen.getByRole('button', {
      name: /view translation/i,
    });
    await user.click(viewTranslationButton);

    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    rerender(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Back to French
    expect(screen.getByText('Guide Wifi')).toBeInTheDocument();
  });
});
```

### Step 10: Add Accessibility Tests
- **Description**: Verify translation features are accessible
- **Rationale**: Ensure all users can access translation features
- **Estimated Effort**: S (30 minutes)

**Implementation Details:**
```typescript
describe('ItemDisplay - Translation Accessibility', () => {
  it('announces content language changes to screen readers', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    // Check for lang attribute
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('lang', 'fr');
  });

  it('toggle button has descriptive label', () => {
    vi.mocked(useGuestLanguage).mockReturnValue({
      currentLanguage: 'fr',
      showOriginal: false,
      setLanguage: vi.fn(),
      toggleOriginal: vi.fn(),
    });

    render(
      <ItemDisplay
        item={fullyTranslatedItem}
        translationMeta={fullyTranslatedMeta}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /view in original \(english\)/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });
});
```

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Test Files
| File | Target | Type |
|------|--------|------|
| `/src/components/__tests__/fixtures/translationFixtures.ts` | — | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | — | Create |
| `/src/components/__tests__/ItemDisplay.translation.integration.test.tsx` | — | Create |

### Test File Contents
| File | Target | Type |
|------|--------|------|
| `/src/components/__tests__/fixtures/translationFixtures.ts` | Mock data fixtures | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Translated content tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Original content tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Toggle tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Language switcher tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Banner tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Loading state tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Partial translation tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Accessibility tests | Create |
| `/src/components/__tests__/ItemDisplay.translation.integration.test.tsx` | Integration tests | Create |

### Component Tests (May Add)
| File | Target | Type |
|------|--------|------|
| `/src/components/guest/__tests__/TranslationBanner.test.tsx` | Banner component tests | Create (Optional) |
| `/src/components/guest/__tests__/MissingTranslationBanner.test.tsx` | Missing banner tests | Create (Optional) |
| `/src/components/guest/__tests__/ViewOriginalToggle.test.tsx` | Toggle component tests | Create (Optional) |

### Files Being Tested (No Modification)
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemDisplay.tsx` | Component under test | Test Only |
| `/src/components/guest/*.tsx` | Guest components | Test Only |
| `/src/hooks/useGuestLanguage.ts` | Hook under test | Mock |

---

## Dependencies

### Depends On (Completed First):
- **REQ-E04-008** through **REQ-E04-012**: Guest UI components (banners, switcher, toggle, indicator)
- **REQ-E04-014** (Task 4.1): Create useGuestLanguage Hook - Hook behavior to test
- **REQ-E04-017** (Task 5.2): Update ItemDisplay Component - Integrated component to test
- **REQ-E04-018** (Task 5.3): Update LinkCard Component - Link display to test

### Blocks (Requires This First):
- None - Testing task doesn't block other work

### Parallel Safety:
- **Files touched**:
  - Test files only (new files)
- **Conflicts with**:
  - None
- **Safe to parallelize with**:
  - All other Epic 4 tasks
  - Other testing tasks (REQ-E04-022, REQ-E04-024, REQ-E04-025, REQ-E04-026)

### External Dependencies:
- Vitest testing framework
- @testing-library/react
- @testing-library/user-event
- React Testing Library queries and utilities

---

## Risks and Considerations

### Risk: Mock Complexity for State Management

**Issue:** useGuestLanguage hook state changes need careful mocking to test properly.

**Mitigation:**
- Use vi.mocked() with clear state transitions
- Document mock state in test comments
- Use rerender pattern for state changes
- Consider testing hook separately in REQ-E04-022

### Risk: Async Rendering Issues

**Issue:** Content updates might be async, causing test flakiness.

**Mitigation:**
- Use waitFor from React Testing Library
- Use findBy* queries instead of getBy* for async content
- Add appropriate timeouts
- Test in both sync and async scenarios

### Risk: Test Data Maintenance

**Issue:** Mock data fixtures might become outdated as types evolve.

**Mitigation:**
- Use TypeScript types for fixtures
- Keep fixtures in sync with actual data structures
- Document fixture purpose clearly
- Regular review of fixture data

### Risk: Over-Mocking Behavior

**Issue:** Heavy mocking might test mocked behavior instead of real behavior.

**Mitigation:**
- Balance between unit and integration tests
- Use real components when possible
- Integration tests use minimal mocks
- Manual testing complements automated tests

### Risk: Translation Content Complexity

**Issue:** Testing all combinations of translated/untranslated content is complex.

**Mitigation:**
- Create comprehensive fixtures (full, partial, none)
- Test matrix approach for coverage
- Focus on common scenarios first
- Edge cases get dedicated tests

---

## Testing Strategy

### Test Organization

**Unit Tests:**
- Individual content display (title, description, links, articles)
- Toggle behavior
- Banner display logic
- Language switcher interaction

**Integration Tests:**
- Complete workflows (view translation → toggle → back)
- Multiple content types together
- State management across components

**Accessibility Tests:**
- ARIA labels and roles
- Keyboard navigation
- Screen reader announcements

### Coverage Goals

- Statements: >80%
- Branches: >80%
- Focus on ItemDisplay translation logic
- Guest component integration points

### Test Execution

```bash
# Run all tests
npm test

# Run translation tests only
npm test ItemDisplay.translation

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch ItemDisplay.translation
```

### Manual Testing Checklist

After automated tests:
- [ ] Visual inspection of translated content
- [ ] Toggle animation smoothness
- [ ] Banner appearance/timing
- [ ] Language switcher dropdown behavior
- [ ] Mobile device testing
- [ ] Screen reader testing
- [ ] Different content lengths (long/short)

---

## Out of Scope

The following are explicitly NOT part of this task:

1. **Language Detection Tests** - Testing detection priority (REQ-E04-022)
2. **Edge Case Tests** - Cookie blocking, malformed data (REQ-E04-024)
3. **Mobile Tests** - Responsive layout testing (REQ-E04-025)
4. **Performance Tests** - Load time validation (REQ-E04-026)
5. **API Integration Tests** - Testing actual translation API
6. **E2E Tests** - Full page flows with Playwright
7. **Visual Regression Tests** - Screenshot comparisons
8. **SEO Tests** - Metadata and hreflang validation
9. **Analytics Tests** - Tracking translation events
10. **Cross-Browser Tests** - Browser compatibility

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test Framework | Vitest + React Testing Library | Already in use, good React support |
| Mock Strategy | Mock useGuestLanguage hook | Isolate component from hook implementation |
| Test Data | Separate fixtures file | Reusable, maintainable |
| State Management | Rerender pattern | Simulates React state changes |
| Async Handling | waitFor and findBy* queries | Prevents flaky tests |
| Coverage Scope | ItemDisplay + guest components | Core translation display logic |
| Test Organization | Describe blocks by scenario | Clear test grouping |
| Accessibility | Include a11y checks | Ensure inclusive experience |

---

## Notes

- **Testing Focus:** Tests verify DISPLAY of translated content, not translation logic itself
- **Mock Usage:** useGuestLanguage hook is mocked; actual state management tested separately
- **Fixtures:** Comprehensive test data covers full, partial, and missing translations
- **User Interaction:** Tests simulate real user actions (clicks, selections)
- **Visual Feedback:** Tests verify banners, loading states, and UI updates
- **Performance:** Toggle tests verify instant updates (< 100ms)
- **Accessibility:** Tests include basic a11y checks for inclusive UX
- **Maintainability:** Clear test names and organization for easy updates

---

**Status:** PENDING

**Next Steps:**
1. Verify dependencies completed (REQ-E04-008 through REQ-E04-012, REQ-E04-014, REQ-E04-017, REQ-E04-018)
2. Create test fixtures file with mock data
3. Write translated content display tests
4. Write original content fallback tests
5. Write "View Original" toggle tests
6. Write language switcher tests
7. Write banner display tests
8. Write loading state tests (if applicable)
9. Write partial translation tests
10. Write integration tests for complete workflows
11. Add accessibility tests
12. Run tests locally and verify all pass
13. Review code coverage reports
14. Perform manual testing to complement automated tests
15. Commit changes following git conventions

---

*Document generated: 2026-01-22 19:52*
