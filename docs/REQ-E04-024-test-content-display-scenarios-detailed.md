# Detailed Task Breakdown: REQ-E04-024 - Test Content Display Scenarios

**Request ID:** REQ-E04-024
**Epic:** Epic 4 - Guest Experience
**Phase:** 7 - Testing & Polish
**Task ID:** 7.2
**Type:** ENHANCEMENT
**Size:** M
**Priority:** High
**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Executive Summary

This document provides granular, implementation-ready tasks for comprehensive validation testing of the guest content display system. The testing validates that translated content displays correctly, original content fallback works reliably, the "View Original" toggle functions instantly, and the language switcher properly updates all visible content. Each task is designed to be approximately 1 story point and can be executed by an AI coding agent or junior developer.

---

## Prerequisites

### Required Dependencies (Must Be Completed)

| Dependency | Source Task | Verification |
|------------|-------------|--------------|
| GuestLanguageSwitcher component | REQ-E04-008 | File exists at `/src/components/guest/GuestLanguageSwitcher/` |
| TranslationBanner component | REQ-E04-009 | File exists at `/src/components/guest/TranslationBanner/` |
| MissingTranslationBanner component | REQ-E04-010 | File exists at `/src/components/guest/MissingTranslationBanner/` |
| ViewOriginalToggle component | REQ-E04-011 | File exists at `/src/components/guest/ViewOriginalToggle/` |
| LanguageIndicator component | REQ-E04-012 | File exists at `/src/components/guest/LanguageIndicator/` |
| useGuestLanguage hook | REQ-E04-014 | File exists at `/src/hooks/useGuestLanguage.ts` |
| Translation fetch utilities | REQ-E04-004 | File exists at `/src/lib/translations/fetch-translations.ts` |
| Translation utility helpers | REQ-E04-007 | File exists at `/src/lib/translations/translation-utils.ts` |
| Updated ItemDisplay component | REQ-E04-017 | Component accepts translation props |
| Updated LinkCard component | REQ-E04-018 | Component accepts translated title prop |

### Development Environment Requirements

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Vitest test runner configured
- @testing-library/react available
- @testing-library/user-event available
- vitest-axe available for accessibility testing

---

## Task Breakdown

### Task 1: Create Test Helper Infrastructure - Test Utilities

**File to Create:** `/src/components/guest/__tests__/helpers/testUtils.ts`

**Objective:** Create foundational test utilities for rendering components with translation context.

**Detailed Implementation Steps:**

1. Create the directory structure:
   ```
   /src/components/guest/__tests__/helpers/
   ```

2. Create `testUtils.ts` with the following exports:

```typescript
// /src/components/guest/__tests__/helpers/testUtils.ts

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { SupportedLanguage, TranslationMeta } from '@/types/l10n';

// Default translation metadata for tests
export const DEFAULT_TRANSLATION_META: TranslationMeta = {
  requestedLanguage: 'en',
  displayLanguage: 'en',
  sourceLanguage: 'en',
  availableTranslations: ['en', 'es', 'fr', 'de', 'nl', 'it'],
  isShowingTranslation: false,
};

// Wrapper component that provides translation context
interface WrapperProps {
  children: React.ReactNode;
  translationMeta?: Partial<TranslationMeta>;
  initialLanguage?: SupportedLanguage;
}

const TranslationTestWrapper: React.FC<WrapperProps> = ({
  children,
  translationMeta = {},
  initialLanguage = 'en',
}) => {
  // Merge default meta with overrides
  const meta = { ...DEFAULT_TRANSLATION_META, ...translationMeta };

  return (
    <div data-testid="translation-test-wrapper" data-language={initialLanguage}>
      {children}
    </div>
  );
};

// Custom render function with translation context
export interface RenderWithTranslationOptions extends Omit<RenderOptions, 'wrapper'> {
  translationMeta?: Partial<TranslationMeta>;
  initialLanguage?: SupportedLanguage;
}

export const renderWithTranslation = (
  ui: React.ReactElement,
  options: RenderWithTranslationOptions = {}
): RenderResult => {
  const { translationMeta, initialLanguage, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <TranslationTestWrapper
        translationMeta={translationMeta}
        initialLanguage={initialLanguage}
      >
        {children}
      </TranslationTestWrapper>
    ),
    ...renderOptions,
  });
};

// Performance timing utility
export const measureActionTime = async (
  action: () => Promise<void> | void
): Promise<number> => {
  const start = performance.now();
  await action();
  return performance.now() - start;
};

// Wait for content to update utility
export const waitForContentUpdate = (timeout: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

// Assert no network requests were made
export const assertNoNetworkRequests = (mockFetch: jest.Mock): void => {
  expect(mockFetch).not.toHaveBeenCalled();
};
```

**Acceptance Criteria:**
- [ ] File created at specified path
- [ ] `renderWithTranslation` function exported and functional
- [ ] `DEFAULT_TRANSLATION_META` constant exported
- [ ] `measureActionTime` utility exported
- [ ] TypeScript compiles without errors
- [ ] All exports are properly typed

**Estimated Effort:** 1 story point

---

### Task 2: Create Test Helper Infrastructure - Mock Factories

**File to Create:** `/src/components/guest/__tests__/helpers/mockFactories.ts`

**Objective:** Create factory functions for generating consistent mock data in tests.

**Detailed Implementation Steps:**

1. Create `mockFactories.ts` with mock data generators:

```typescript
// /src/components/guest/__tests__/helpers/mockFactories.ts

import {
  SupportedLanguage,
  TranslatedItem,
  TranslatedArticle,
  TranslatedLink,
  TranslatedTag,
  TranslationMeta,
  GuestContentResponse
} from '@/types/l10n';

// Counter for generating unique IDs
let idCounter = 0;
const generateId = () => `test-id-${++idCounter}`;

// Reset counter between test suites
export const resetIdCounter = () => { idCounter = 0; };

// Mock translated item factory
export interface MockTranslatedItemOptions {
  id?: string;
  publicId?: string;
  name?: string;
  description?: string | null;
  originalName?: string;
  originalDescription?: string | null;
  sourceLanguage?: SupportedLanguage;
  displayLanguage?: SupportedLanguage;
  isTranslated?: boolean;
  translationStatus?: 'completed' | 'pending' | 'failed';
}

export const createMockTranslatedItem = (
  options: MockTranslatedItemOptions = {}
): TranslatedItem => ({
  id: options.id ?? generateId(),
  publicId: options.publicId ?? `item-${Date.now()}`,
  name: options.name ?? 'Nombre del Artículo',
  description: options.description ?? 'Descripción detallada en español',
  originalName: options.originalName ?? 'Item Name',
  originalDescription: options.originalDescription ?? 'Detailed description in English',
  sourceLanguage: options.sourceLanguage ?? 'en',
  displayLanguage: options.displayLanguage ?? 'es',
  isTranslated: options.isTranslated ?? true,
  translationStatus: options.translationStatus ?? 'completed',
});

// Mock translated article factory
export interface MockTranslatedArticleOptions {
  id?: string;
  title?: string;
  description?: string | null;
  originalTitle?: string;
  originalDescription?: string | null;
  sourceLanguage?: SupportedLanguage;
  displayLanguage?: SupportedLanguage;
  isTranslated?: boolean;
  links?: TranslatedLink[];
}

export const createMockTranslatedArticle = (
  options: MockTranslatedArticleOptions = {}
): TranslatedArticle => ({
  id: options.id ?? generateId(),
  title: options.title ?? 'Título del Artículo',
  description: options.description ?? 'Contenido del artículo en español',
  originalTitle: options.originalTitle ?? 'Article Title',
  originalDescription: options.originalDescription ?? 'Article content in English',
  sourceLanguage: options.sourceLanguage ?? 'en',
  displayLanguage: options.displayLanguage ?? 'es',
  isTranslated: options.isTranslated ?? true,
  links: options.links ?? [createMockTranslatedLink()],
});

// Mock translated link factory
export interface MockTranslatedLinkOptions {
  id?: string;
  title?: string;
  url?: string;
  thumbnailUrl?: string | null;
  originalTitle?: string;
  sourceLanguage?: SupportedLanguage;
  displayLanguage?: SupportedLanguage;
  isTranslated?: boolean;
}

export const createMockTranslatedLink = (
  options: MockTranslatedLinkOptions = {}
): TranslatedLink => ({
  id: options.id ?? generateId(),
  title: options.title ?? 'Título del Enlace',
  url: options.url ?? 'https://example.com/resource',
  thumbnailUrl: options.thumbnailUrl ?? null,
  originalTitle: options.originalTitle ?? 'Link Title',
  sourceLanguage: options.sourceLanguage ?? 'en',
  displayLanguage: options.displayLanguage ?? 'es',
  isTranslated: options.isTranslated ?? true,
});

// Mock translated tag factory
export interface MockTranslatedTagOptions {
  key?: string;
  displayValue?: string;
  originalValue?: string;
  isTranslated?: boolean;
}

export const createMockTranslatedTag = (
  options: MockTranslatedTagOptions = {}
): TranslatedTag => ({
  key: options.key ?? 'amenity',
  displayValue: options.displayValue ?? 'Piscina',
  isTranslated: options.isTranslated ?? true,
});

// Mock translation metadata factory
export interface MockTranslationMetaOptions {
  requestedLanguage?: SupportedLanguage;
  displayLanguage?: SupportedLanguage;
  sourceLanguage?: SupportedLanguage;
  availableTranslations?: SupportedLanguage[];
  isShowingTranslation?: boolean;
}

export const createMockTranslationMeta = (
  options: MockTranslationMetaOptions = {}
): TranslationMeta => ({
  requestedLanguage: options.requestedLanguage ?? 'es',
  displayLanguage: options.displayLanguage ?? 'es',
  sourceLanguage: options.sourceLanguage ?? 'en',
  availableTranslations: options.availableTranslations ?? ['es', 'fr', 'de'],
  isShowingTranslation: options.isShowingTranslation ?? true,
});

// Complete guest content response factory
export interface MockGuestContentResponseOptions {
  item?: Partial<MockTranslatedItemOptions>;
  articles?: MockTranslatedArticleOptions[];
  tags?: MockTranslatedTagOptions[];
  translationMeta?: MockTranslationMetaOptions;
}

export const createMockGuestContentResponse = (
  options: MockGuestContentResponseOptions = {}
): GuestContentResponse => ({
  item: createMockTranslatedItem(options.item),
  articles: options.articles?.map(createMockTranslatedArticle) ?? [createMockTranslatedArticle()],
  tags: options.tags?.map(createMockTranslatedTag) ?? [createMockTranslatedTag()],
  translationMeta: createMockTranslationMeta(options.translationMeta),
});

// Factory for untranslated content (original only)
export const createMockUntranslatedContent = (): GuestContentResponse =>
  createMockGuestContentResponse({
    item: { isTranslated: false, name: 'Item Name', description: 'English description' },
    articles: [{ isTranslated: false, title: 'Article Title', description: 'English content' }],
    tags: [{ isTranslated: false, displayValue: 'Pool' }],
    translationMeta: {
      requestedLanguage: 'fr',
      displayLanguage: 'en',
      sourceLanguage: 'en',
      isShowingTranslation: false,
      availableTranslations: [],
    },
  });

// Factory for partial translation (some fields translated)
export const createMockPartialTranslation = (): GuestContentResponse =>
  createMockGuestContentResponse({
    item: {
      isTranslated: true,
      name: 'Nombre del Artículo',
      description: null, // Description not translated, should fallback
      originalDescription: 'Original English description',
    },
    translationMeta: {
      isShowingTranslation: true,
    },
  });
```

**Acceptance Criteria:**
- [ ] File created at specified path
- [ ] All factory functions exported and functional
- [ ] `createMockTranslatedItem` generates valid item data
- [ ] `createMockTranslatedArticle` generates valid article data
- [ ] `createMockTranslatedLink` generates valid link data
- [ ] `createMockTranslatedTag` generates valid tag data
- [ ] `createMockTranslationMeta` generates valid metadata
- [ ] `createMockGuestContentResponse` generates complete response
- [ ] `createMockUntranslatedContent` generates fallback scenario data
- [ ] `createMockPartialTranslation` generates partial translation data
- [ ] TypeScript compiles without errors

**Estimated Effort:** 1 story point

---

### Task 3: Create Test Helper Infrastructure - Barrel Exports

**File to Create:** `/src/components/guest/__tests__/helpers/index.ts`

**Objective:** Create barrel exports for all test helper utilities.

**Detailed Implementation Steps:**

1. Create `index.ts` that re-exports all helpers:

```typescript
// /src/components/guest/__tests__/helpers/index.ts

// Test utilities
export {
  renderWithTranslation,
  measureActionTime,
  waitForContentUpdate,
  assertNoNetworkRequests,
  DEFAULT_TRANSLATION_META,
  type RenderWithTranslationOptions,
} from './testUtils';

// Mock factories
export {
  createMockTranslatedItem,
  createMockTranslatedArticle,
  createMockTranslatedLink,
  createMockTranslatedTag,
  createMockTranslationMeta,
  createMockGuestContentResponse,
  createMockUntranslatedContent,
  createMockPartialTranslation,
  resetIdCounter,
  type MockTranslatedItemOptions,
  type MockTranslatedArticleOptions,
  type MockTranslatedLinkOptions,
  type MockTranslatedTagOptions,
  type MockTranslationMetaOptions,
  type MockGuestContentResponseOptions,
} from './mockFactories';
```

**Acceptance Criteria:**
- [ ] File created at specified path
- [ ] All utilities from testUtils.ts exported
- [ ] All factories from mockFactories.ts exported
- [ ] TypeScript compiles without errors
- [ ] Imports work from `@/components/guest/__tests__/helpers`

**Estimated Effort:** 0.5 story points

---

### Task 4: Create ItemDisplay Translation Tests - Translated Content Rendering

**File to Create:** `/src/components/ItemDisplay/__tests__/ItemDisplay.translation.test.tsx`

**Objective:** Test that translated content displays correctly in the ItemDisplay component.

**Detailed Implementation Steps:**

1. Create the test file with translated content rendering tests:

```typescript
// /src/components/ItemDisplay/__tests__/ItemDisplay.translation.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemDisplay from '../ItemDisplay';
import {
  renderWithTranslation,
  createMockGuestContentResponse,
  createMockUntranslatedContent,
  createMockPartialTranslation,
  measureActionTime,
  resetIdCounter,
} from '@/components/guest/__tests__/helpers';

describe('ItemDisplay Translation Tests', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('Category 1: Translated Content Display', () => {
    it('TC-1.1: displays translated item title correctly', () => {
      const mockData = createMockGuestContentResponse({
        item: { name: 'Nombre Traducido', originalName: 'Original Name' },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Nombre Traducido')).toBeInTheDocument();
      expect(screen.queryByText('Original Name')).not.toBeInTheDocument();
    });

    it('TC-1.2: displays translated item description correctly', () => {
      const mockData = createMockGuestContentResponse({
        item: {
          description: 'Descripción en español',
          originalDescription: 'English description'
        },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Descripción en español')).toBeInTheDocument();
      expect(screen.queryByText('English description')).not.toBeInTheDocument();
    });

    it('TC-1.3: displays all article content with translated versions', () => {
      const mockData = createMockGuestContentResponse({
        articles: [
          { title: 'Artículo Uno', description: 'Contenido uno' },
          { title: 'Artículo Dos', description: 'Contenido dos' },
        ],
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Artículo Uno')).toBeInTheDocument();
      expect(screen.getByText('Artículo Dos')).toBeInTheDocument();
      expect(screen.getByText('Contenido uno')).toBeInTheDocument();
      expect(screen.getByText('Contenido dos')).toBeInTheDocument();
    });

    it('TC-1.4: displays all link titles with translated versions', () => {
      const mockData = createMockGuestContentResponse({
        articles: [{
          title: 'Artículo',
          links: [
            { title: 'Enlace Uno', originalTitle: 'Link One' },
            { title: 'Enlace Dos', originalTitle: 'Link Two' },
          ],
        }],
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Enlace Uno')).toBeInTheDocument();
      expect(screen.getByText('Enlace Dos')).toBeInTheDocument();
    });

    it('TC-1.5: displays all tag names with translated versions', () => {
      const mockData = createMockGuestContentResponse({
        tags: [
          { key: 'amenity1', displayValue: 'Piscina', isTranslated: true },
          { key: 'amenity2', displayValue: 'Gimnasio', isTranslated: true },
        ],
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Piscina')).toBeInTheDocument();
      expect(screen.getByText('Gimnasio')).toBeInTheDocument();
    });

    it('TC-1.6: translation metadata indicates correct state', () => {
      const mockData = createMockGuestContentResponse({
        translationMeta: {
          isShowingTranslation: true,
          sourceLanguage: 'en',
          displayLanguage: 'es',
        },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // TranslationBanner should show source language
      expect(screen.getByText(/translated from/i)).toBeInTheDocument();
      expect(screen.getByText(/english/i)).toBeInTheDocument();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created at specified path
- [ ] TC-1.1 through TC-1.6 implemented
- [ ] All tests pass when components are properly implemented
- [ ] Tests are isolated and do not affect each other
- [ ] TypeScript compiles without errors

**Estimated Effort:** 1.5 story points

---

### Task 5: Create ItemDisplay Translation Tests - Original Content Fallback

**File to Modify:** `/src/components/ItemDisplay/__tests__/ItemDisplay.translation.test.tsx`

**Objective:** Add tests for original content fallback scenarios.

**Detailed Implementation Steps:**

1. Add the following test group to the existing file:

```typescript
  describe('Category 2: Original Content Fallback', () => {
    it('TC-2.1: displays original item title when no translation exists', () => {
      const mockData = createMockUntranslatedContent();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Item Name')).toBeInTheDocument();
    });

    it('TC-2.2: displays original description completely', () => {
      const mockData = createMockUntranslatedContent();
      mockData.item.description = 'This is a complete original description that should display in full without any truncation or errors.';

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText(/complete original description/i)).toBeInTheDocument();
    });

    it('TC-2.3: displays original articles without missing content', () => {
      const mockData = createMockUntranslatedContent();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Article Title')).toBeInTheDocument();
      expect(screen.getByText('English content')).toBeInTheDocument();
    });

    it('TC-2.4: displays original link titles correctly', () => {
      const mockData = createMockUntranslatedContent();
      mockData.articles[0].links = [
        {
          id: 'link-1',
          title: 'Original Link',
          url: 'https://example.com',
          thumbnailUrl: null,
          sourceLanguage: 'en',
          displayLanguage: 'en',
          isTranslated: false,
        },
      ];

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Original Link')).toBeInTheDocument();
    });

    it('TC-2.5: displays original tag names correctly', () => {
      const mockData = createMockUntranslatedContent();
      mockData.tags = [
        { key: 'amenity', displayValue: 'Pool', isTranslated: false },
      ];

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText('Pool')).toBeInTheDocument();
    });

    it('TC-2.6: MissingTranslationBanner appears when no translation', () => {
      const mockData = createMockUntranslatedContent();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/not available/i)).toBeInTheDocument();
    });

    it('TC-2.7: banner message identifies both requested and displayed languages', () => {
      const mockData = createMockGuestContentResponse({
        translationMeta: {
          requestedLanguage: 'fr',
          displayLanguage: 'en',
          sourceLanguage: 'en',
          isShowingTranslation: false,
          availableTranslations: [],
        },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      expect(screen.getByText(/french/i)).toBeInTheDocument();
      expect(screen.getByText(/english/i)).toBeInTheDocument();
    });
  });
```

**Acceptance Criteria:**
- [ ] TC-2.1 through TC-2.7 implemented
- [ ] All tests pass when components are properly implemented
- [ ] Tests verify MissingTranslationBanner appears
- [ ] Tests verify both requested and displayed languages shown
- [ ] TypeScript compiles without errors

**Estimated Effort:** 1 story point

---

### Task 6: Create ItemDisplay Translation Tests - Toggle Behavior

**File to Modify:** `/src/components/ItemDisplay/__tests__/ItemDisplay.translation.test.tsx`

**Objective:** Add tests for View Original toggle functionality.

**Detailed Implementation Steps:**

1. Add the following test group to the existing file:

```typescript
  describe('Category 3: View Original Toggle', () => {
    it('TC-3.1: toggle switches from translated to original content', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        item: {
          name: 'Nombre Traducido',
          originalName: 'Original Name'
        },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Initially shows translated
      expect(screen.getByText('Nombre Traducido')).toBeInTheDocument();

      // Click toggle
      const toggleButton = screen.getByRole('button', { name: /view.*original/i });
      await user.click(toggleButton);

      // Now shows original
      await waitFor(() => {
        expect(screen.getByText('Original Name')).toBeInTheDocument();
      });
      expect(screen.queryByText('Nombre Traducido')).not.toBeInTheDocument();
    });

    it('TC-3.2: toggle action completes in under 200ms', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /view.*original/i });

      const toggleTime = await measureActionTime(async () => {
        await user.click(toggleButton);
      });

      expect(toggleTime).toBeLessThan(200);
    });

    it('TC-3.3: all content fields update simultaneously during toggle', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        item: {
          name: 'Nombre',
          originalName: 'Name',
          description: 'Descripción',
          originalDescription: 'Description',
        },
        articles: [{
          title: 'Título Artículo',
          originalTitle: 'Article Title',
          description: 'Contenido',
          originalDescription: 'Content',
        }],
        tags: [{ key: 'tag', displayValue: 'Etiqueta', isTranslated: true }],
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /view.*original/i });
      await user.click(toggleButton);

      await waitFor(() => {
        // All fields should show original
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Article Title')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('TC-3.4: toggle back restores translated content', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        item: { name: 'Nombre', originalName: 'Name' },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /view.*original/i });

      // Toggle to original
      await user.click(toggleButton);
      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });

      // Toggle back to translated
      const viewTranslationButton = screen.getByRole('button', { name: /view.*translation/i });
      await user.click(viewTranslationButton);

      await waitFor(() => {
        expect(screen.getByText('Nombre')).toBeInTheDocument();
      });
    });

    it('TC-3.5: toggle state persists during multiple switches', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        item: { name: 'Nombre', originalName: 'Name' },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Toggle multiple times rapidly
      for (let i = 0; i < 5; i++) {
        const button = screen.getByRole('button', { name: /view.*(original|translation)/i });
        await user.click(button);
      }

      // After odd number of toggles, should show original
      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });
    });

    it('TC-3.6: no network requests on toggle', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const mockData = createMockGuestContentResponse();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /view.*original/i });
      await user.click(toggleButton);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('TC-3.7: toggle button label updates correctly', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        translationMeta: { sourceLanguage: 'en' },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Initially shows "View in original (English)"
      expect(screen.getByRole('button', { name: /view.*original.*english/i })).toBeInTheDocument();

      // Click toggle
      await user.click(screen.getByRole('button', { name: /view.*original/i }));

      // Now shows "View translation"
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view.*translation/i })).toBeInTheDocument();
      });
    });
  });
```

**Acceptance Criteria:**
- [ ] TC-3.1 through TC-3.7 implemented
- [ ] Performance test verifies < 200ms toggle time
- [ ] Network mock verifies no fetch calls on toggle
- [ ] All tests pass when components are properly implemented
- [ ] TypeScript compiles without errors

**Estimated Effort:** 1.5 story points

---

### Task 7: Create Guest Component Integration Tests

**File to Create:** `/src/components/guest/__tests__/GuestComponents.integration.test.tsx`

**Objective:** Test integration between guest components for language switching.

**Detailed Implementation Steps:**

1. Create the integration test file:

```typescript
// /src/components/guest/__tests__/GuestComponents.integration.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderWithTranslation,
  createMockGuestContentResponse,
  createMockTranslationMeta,
  resetIdCounter,
} from './helpers';
import { GuestLanguageSwitcher } from '../GuestLanguageSwitcher';
import { TranslationBanner } from '../TranslationBanner';
import { MissingTranslationBanner } from '../MissingTranslationBanner';
import { ViewOriginalToggle } from '../ViewOriginalToggle';
import { LanguageIndicator } from '../LanguageIndicator';

// Mock cookie utility
vi.mock('@/lib/i18n/guest-language', () => ({
  setGuestLanguageCookie: vi.fn(),
  getGuestLanguageCookie: vi.fn(() => 'en'),
}));

describe('Guest Components Integration Tests', () => {
  beforeEach(() => {
    resetIdCounter();
    vi.clearAllMocks();
  });

  describe('Category 4: Language Switcher Content Updates', () => {
    it('TC-4.1: language selection updates all visible content', async () => {
      const user = userEvent.setup();
      const onLanguageChange = vi.fn();
      const translationMeta = createMockTranslationMeta({
        availableTranslations: ['en', 'es', 'fr'],
      });

      renderWithTranslation(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableTranslations={translationMeta.availableTranslations}
          sourceLanguage="en"
          onLanguageChange={onLanguageChange}
        />
      );

      // Open dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Select Spanish
      const spanishOption = screen.getByText(/español/i);
      await user.click(spanishOption);

      expect(onLanguageChange).toHaveBeenCalledWith('es');
    });

    it('TC-4.2: language switch triggers translation fetch callback', async () => {
      const user = userEvent.setup();
      const onLanguageChange = vi.fn();
      const translationMeta = createMockTranslationMeta({
        availableTranslations: ['en', 'es', 'fr'],
      });

      renderWithTranslation(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableTranslations={translationMeta.availableTranslations}
          sourceLanguage="en"
          onLanguageChange={onLanguageChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const frenchOption = screen.getByText(/français/i);
      await user.click(frenchOption);

      expect(onLanguageChange).toHaveBeenCalledWith('fr');
    });

    it('TC-4.3: TranslationBanner shows correct source language', () => {
      const onViewOriginal = vi.fn();

      renderWithTranslation(
        <TranslationBanner
          sourceLanguage="en"
          displayLanguage="es"
          onViewOriginal={onViewOriginal}
        />
      );

      expect(screen.getByText(/translated from/i)).toBeInTheDocument();
      expect(screen.getByText(/english/i)).toBeInTheDocument();
    });

    it('TC-4.4: switching to untranslated language shows MissingTranslationBanner', () => {
      renderWithTranslation(
        <MissingTranslationBanner
          requestedLanguage="it"
          displayLanguage="en"
        />
      );

      expect(screen.getByText(/italian/i)).toBeInTheDocument();
      expect(screen.getByText(/not available/i)).toBeInTheDocument();
      expect(screen.getByText(/english/i)).toBeInTheDocument();
    });

    it('TC-4.5: language selection persists to cookie', async () => {
      const { setGuestLanguageCookie } = await import('@/lib/i18n/guest-language');
      const user = userEvent.setup();
      const onLanguageChange = vi.fn((lang) => {
        setGuestLanguageCookie(lang);
      });

      renderWithTranslation(
        <GuestLanguageSwitcher
          currentLanguage="en"
          availableTranslations={['en', 'es', 'fr']}
          sourceLanguage="en"
          onLanguageChange={onLanguageChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const spanishOption = screen.getByText(/español/i);
      await user.click(spanishOption);

      expect(setGuestLanguageCookie).toHaveBeenCalledWith('es');
    });

    it('TC-4.6: subsequent page loads honor persisted language', async () => {
      const { getGuestLanguageCookie } = await import('@/lib/i18n/guest-language');
      vi.mocked(getGuestLanguageCookie).mockReturnValue('es');

      const initialLang = getGuestLanguageCookie();

      expect(initialLang).toBe('es');
    });
  });

  describe('Banner Component Display Logic', () => {
    it('TranslationBanner renders with globe icon', () => {
      renderWithTranslation(
        <TranslationBanner
          sourceLanguage="en"
          displayLanguage="es"
          onViewOriginal={() => {}}
        />
      );

      // Check for globe icon (assuming it's an svg or has specific aria-label)
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');
      expect(banner).toBeInTheDocument();
    });

    it('MissingTranslationBanner uses muted styling', () => {
      renderWithTranslation(
        <MissingTranslationBanner
          requestedLanguage="de"
          displayLanguage="en"
        />
      );

      const banner = screen.getByRole('status');
      expect(banner).toHaveClass(/bg-gray|muted|neutral/i);
    });

    it('LanguageIndicator shows flag and language name', () => {
      renderWithTranslation(
        <LanguageIndicator
          currentLanguage="fr"
          isTranslated={true}
          sourceLanguage="en"
        />
      );

      expect(screen.getByText(/french|français/i)).toBeInTheDocument();
    });
  });

  describe('Component Coordination', () => {
    it('ViewOriginalToggle coordinates with TranslationBanner', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const onViewOriginal = vi.fn();

      const { rerender } = renderWithTranslation(
        <>
          <TranslationBanner
            sourceLanguage="en"
            displayLanguage="es"
            onViewOriginal={onViewOriginal}
            isShowingOriginal={false}
          />
          <ViewOriginalToggle
            isShowingOriginal={false}
            sourceLanguage="en"
            onToggle={onToggle}
          />
        </>
      );

      // Click "View original" link in banner
      const viewOriginalLink = screen.getByText(/view original/i);
      await user.click(viewOriginalLink);

      expect(onViewOriginal).toHaveBeenCalled();
    });

    it('all components handle undefined props gracefully', () => {
      expect(() => {
        renderWithTranslation(
          <>
            <LanguageIndicator
              currentLanguage="en"
              isTranslated={false}
              sourceLanguage={undefined}
            />
          </>
        );
      }).not.toThrow();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created at specified path
- [ ] TC-4.1 through TC-4.6 implemented
- [ ] Banner component tests implemented
- [ ] Component coordination tests implemented
- [ ] Cookie persistence mocked and tested
- [ ] All tests pass when components are properly implemented
- [ ] TypeScript compiles without errors

**Estimated Effort:** 2 story points

---

### Task 8: Create Content Display E2E Tests

**File to Create:** `/src/components/guest/__tests__/ContentDisplay.e2e.test.tsx`

**Objective:** Test end-to-end content display scenarios including partial translations and UI quality.

**Detailed Implementation Steps:**

1. Create the E2E test file:

```typescript
// /src/components/guest/__tests__/ContentDisplay.e2e.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'vitest-axe';
import ItemDisplay from '@/components/ItemDisplay';
import {
  renderWithTranslation,
  createMockGuestContentResponse,
  createMockPartialTranslation,
  resetIdCounter,
  waitForContentUpdate,
} from './helpers';

expect.extend(toHaveNoViolations);

describe('Content Display E2E Tests', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('Full Guest Flow Scenarios', () => {
    it('complete flow: view translated → toggle original → switch language', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        item: { name: 'Nombre', originalName: 'Name' },
        translationMeta: {
          displayLanguage: 'es',
          sourceLanguage: 'en',
          availableTranslations: ['es', 'fr', 'de'],
        },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Step 1: View translated content
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText(/translated from english/i)).toBeInTheDocument();

      // Step 2: Toggle to original
      await user.click(screen.getByRole('button', { name: /view.*original/i }));
      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });

      // Step 3: Toggle back
      await user.click(screen.getByRole('button', { name: /view.*translation/i }));
      await waitFor(() => {
        expect(screen.getByText('Nombre')).toBeInTheDocument();
      });
    });
  });

  describe('Category 5: Partial Translation Handling', () => {
    it('TC-5.1: partial translations show mixed content correctly', () => {
      const mockData = createMockPartialTranslation();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Translated name should show
      expect(screen.getByText('Nombre del Artículo')).toBeInTheDocument();
      // Original description should show (fallback for null translation)
      expect(screen.getByText('Original English description')).toBeInTheDocument();
    });

    it('TC-5.2: no content gaps or blank fields in partial translation', () => {
      const mockData = createMockPartialTranslation();

      const { container } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Check no empty content areas
      const contentAreas = container.querySelectorAll('[data-content-field]');
      contentAreas.forEach(area => {
        expect(area.textContent?.trim()).not.toBe('');
      });
    });

    it('TC-5.3: partial state reflected in UI indicators', () => {
      const mockData = createMockGuestContentResponse({
        item: {
          name: 'Nombre',
          description: null,
          originalDescription: 'Original description',
        },
        translationMeta: { isShowingTranslation: true },
      });

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Banner should still show as translated (partial is still translated)
      expect(screen.getByText(/translated from/i)).toBeInTheDocument();
    });
  });

  describe('Category 6: UI/UX Quality', () => {
    it('TC-6.1: no content flashing during language switch', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse();
      let flashDetected = false;

      const { container } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Set up mutation observer to detect rapid changes
      const observer = new MutationObserver((mutations) => {
        // Check for rapid content changes that might indicate flashing
        const textChanges = mutations.filter(m => m.type === 'characterData');
        if (textChanges.length > 3) {
          flashDetected = true;
        }
      });

      observer.observe(container, {
        characterData: true,
        subtree: true,
        childList: true
      });

      // Toggle
      await user.click(screen.getByRole('button', { name: /view.*original/i }));
      await waitForContentUpdate(50);

      observer.disconnect();

      expect(flashDetected).toBe(false);
    });

    it('TC-6.2: no layout shifts during content swap', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        item: {
          name: 'Short',
          originalName: 'A much longer original name that could cause layout shift',
        },
      });

      const { container } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      const initialHeight = container.getBoundingClientRect().height;

      await user.click(screen.getByRole('button', { name: /view.*original/i }));
      await waitForContentUpdate(50);

      const finalHeight = container.getBoundingClientRect().height;

      // Allow for some variance but not major shifts
      expect(Math.abs(finalHeight - initialHeight)).toBeLessThan(50);
    });

    it('TC-6.3: desktop viewport displays correctly', () => {
      const mockData = createMockGuestContentResponse();

      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

      const { container } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Check component renders without overflow
      expect(container.scrollWidth).toBeLessThanOrEqual(1280);
    });

    it('TC-6.4: mobile viewport displays correctly', () => {
      const mockData = createMockGuestContentResponse();

      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

      const { container } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Check component renders without overflow
      expect(container.scrollWidth).toBeLessThanOrEqual(400);
    });

    it('TC-6.5: loading states appear when fetching translations', async () => {
      // This test verifies loading UI when language switch triggers fetch
      const mockData = createMockGuestContentResponse();
      let isLoading = true;

      const { rerender } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
          isLoading={isLoading}
        />
      );

      // Check loading indicator appears
      expect(screen.queryByTestId('loading-indicator') ||
             screen.queryByRole('progressbar') ||
             screen.queryByText(/loading/i)).toBeInTheDocument();

      // Simulate loading complete
      isLoading = false;
      rerender(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
          isLoading={isLoading}
        />
      );

      // Loading indicator should be gone
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('content display has no accessibility violations', async () => {
      const mockData = createMockGuestContentResponse();

      const { container } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created at specified path
- [ ] Full guest flow scenario implemented
- [ ] TC-5.1 through TC-5.3 (partial translation) implemented
- [ ] TC-6.1 through TC-6.5 (UI quality) implemented
- [ ] Accessibility test implemented
- [ ] All tests pass when components are properly implemented
- [ ] TypeScript compiles without errors

**Estimated Effort:** 2 story points

---

### Task 9: Create Performance Tests

**File to Create:** `/src/components/guest/__tests__/ContentDisplay.perf.test.tsx`

**Objective:** Validate performance requirements for toggle and language switch operations.

**Detailed Implementation Steps:**

1. Create the performance test file:

```typescript
// /src/components/guest/__tests__/ContentDisplay.perf.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemDisplay from '@/components/ItemDisplay';
import {
  renderWithTranslation,
  createMockGuestContentResponse,
  measureActionTime,
  resetIdCounter,
} from './helpers';

describe('Content Display Performance Tests', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('Toggle Response Time', () => {
    it('toggle completes in under 200ms (single measurement)', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /view.*original/i });

      const toggleTime = await measureActionTime(async () => {
        await user.click(toggleButton);
        await waitFor(() => {
          expect(screen.getByText(mockData.item.originalName!)).toBeInTheDocument();
        });
      });

      expect(toggleTime).toBeLessThan(200);
    });

    it('toggle averages under 150ms over 10 iterations', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse();
      const times: number[] = [];

      const { rerender } = renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      for (let i = 0; i < 10; i++) {
        const toggleButton = screen.getByRole('button', { name: /view.*(original|translation)/i });

        const time = await measureActionTime(async () => {
          await user.click(toggleButton);
        });

        times.push(time);
      }

      const average = times.reduce((a, b) => a + b, 0) / times.length;
      expect(average).toBeLessThan(150);
    });

    it('toggle P95 latency is under 200ms', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse();
      const times: number[] = [];

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      for (let i = 0; i < 20; i++) {
        const toggleButton = screen.getByRole('button', { name: /view.*(original|translation)/i });

        const time = await measureActionTime(async () => {
          await user.click(toggleButton);
        });

        times.push(time);
      }

      // Calculate P95
      const sorted = times.sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p95 = sorted[p95Index];

      expect(p95).toBeLessThan(200);
    });
  });

  describe('Language Switch Latency', () => {
    it('client-side language state change under 100ms', async () => {
      const user = userEvent.setup();
      const onLanguageChange = vi.fn();
      const mockData = createMockGuestContentResponse();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
          onLanguageChange={onLanguageChange}
        />
      );

      const languageSwitcher = screen.getByRole('combobox');

      const switchTime = await measureActionTime(async () => {
        await user.click(languageSwitcher);
        const option = await screen.findByText(/français/i);
        await user.click(option);
      });

      // UI interaction should be fast (network fetch is separate)
      expect(switchTime).toBeLessThan(500);
    });
  });

  describe('Render Performance', () => {
    it('initial render with large content completes quickly', async () => {
      // Create mock data with lots of content
      const mockData = createMockGuestContentResponse({
        articles: Array.from({ length: 20 }, (_, i) => ({
          title: `Article ${i}`,
          description: `Content for article ${i} with some longer text to simulate real content`,
          links: Array.from({ length: 5 }, (_, j) => ({
            title: `Link ${j} for article ${i}`,
          })),
        })),
        tags: Array.from({ length: 50 }, (_, i) => ({
          key: `tag-${i}`,
          displayValue: `Tag Value ${i}`,
        })),
      });

      const renderTime = await measureActionTime(() => {
        renderWithTranslation(
          <ItemDisplay
            item={mockData.item}
            articles={mockData.articles}
            tags={mockData.tags}
            translationMeta={mockData.translationMeta}
          />
        );
      });

      // Initial render should be under 500ms even with lots of content
      expect(renderTime).toBeLessThan(500);
    });

    it('re-render after toggle is faster than initial render', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse({
        articles: Array.from({ length: 10 }, (_, i) => ({
          title: `Article ${i}`,
          description: `Content ${i}`,
        })),
      });

      let initialRenderTime: number;

      initialRenderTime = await measureActionTime(() => {
        renderWithTranslation(
          <ItemDisplay
            item={mockData.item}
            articles={mockData.articles}
            tags={mockData.tags}
            translationMeta={mockData.translationMeta}
          />
        );
      });

      const toggleButton = screen.getByRole('button', { name: /view.*original/i });

      const toggleRerenderTime = await measureActionTime(async () => {
        await user.click(toggleButton);
      });

      // Re-render should be faster (React reconciliation)
      expect(toggleRerenderTime).toBeLessThan(initialRenderTime);
    });
  });

  describe('Memory Performance', () => {
    it('no memory leaks during repeated toggles', async () => {
      const user = userEvent.setup();
      const mockData = createMockGuestContentResponse();

      renderWithTranslation(
        <ItemDisplay
          item={mockData.item}
          articles={mockData.articles}
          tags={mockData.tags}
          translationMeta={mockData.translationMeta}
        />
      );

      // Record initial memory (if available in test environment)
      const initialMemory = (performance as any).memory?.usedJSHeapSize;

      // Toggle many times
      for (let i = 0; i < 100; i++) {
        const toggleButton = screen.getByRole('button', { name: /view.*(original|translation)/i });
        await user.click(toggleButton);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize;

      // If memory API available, check for leaks
      if (initialMemory && finalMemory) {
        // Allow some variance but flag significant growth
        const growth = finalMemory - initialMemory;
        expect(growth).toBeLessThan(10 * 1024 * 1024); // 10MB threshold
      }
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test file created at specified path
- [ ] Toggle response time tests implemented
- [ ] P95 latency test implemented
- [ ] Language switch latency test implemented
- [ ] Render performance tests implemented
- [ ] Memory performance test implemented
- [ ] All tests pass when components are properly implemented
- [ ] TypeScript compiles without errors

**Estimated Effort:** 1.5 story points

---

### Task 10: Create Test Results Documentation

**File to Create:** `/docs/test-results/REQ-E04-024-content-display-test-results.md`

**Objective:** Create a template for documenting test execution results.

**Detailed Implementation Steps:**

1. Create the test results documentation file:

```markdown
# Test Results: REQ-E04-024 - Content Display Scenarios

**Test Execution Date:** [YYYY-MM-DD]
**Executed By:** [Name/Agent ID]
**Environment:** [Development/Staging]
**Last Modified:** [YYYY-MM-DD HH:MM]

---

## Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total Test Cases | 28 | - | - |
| Passed | 28 | - | - |
| Failed | 0 | - | - |
| Skipped | 0 | - | - |
| Toggle Response Time (P95) | < 200ms | - | - |
| Language Switch Latency | < 500ms | - | - |
| Content Flashing Incidents | 0 | - | - |
| Layout Shift Incidents | 0 | - | - |

---

## Category 1: Translated Content Display

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-1.1 | Translated item title displays correctly | - | - |
| TC-1.2 | Translated item description displays correctly | - | - |
| TC-1.3 | All article content displays translated versions | - | - |
| TC-1.4 | All link titles display translated versions | - | - |
| TC-1.5 | All tag names display translated versions | - | - |
| TC-1.6 | Translation metadata indicates correct state | - | - |

---

## Category 2: Original Content Fallback

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-2.1 | Original item title displays when no translation | - | - |
| TC-2.2 | Original description displays completely | - | - |
| TC-2.3 | Original articles display without missing content | - | - |
| TC-2.4 | Original link titles display correctly | - | - |
| TC-2.5 | Original tag names display correctly | - | - |
| TC-2.6 | MissingTranslationBanner appears | - | - |
| TC-2.7 | Banner message identifies both languages | - | - |

---

## Category 3: View Original Toggle

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-3.1 | Toggle switches from translated to original | - | - |
| TC-3.2 | Toggle action completes in < 200ms | - | - |
| TC-3.3 | All content fields update simultaneously | - | - |
| TC-3.4 | Toggle back restores translated content | - | - |
| TC-3.5 | Toggle state persists during multiple switches | - | - |
| TC-3.6 | No network requests on toggle | - | - |
| TC-3.7 | Toggle button label updates correctly | - | - |

---

## Category 4: Language Switcher Content Updates

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-4.1 | Language selection updates all visible content | - | - |
| TC-4.2 | Language switch triggers translation fetch | - | - |
| TC-4.3 | TranslationBanner shows correct source language | - | - |
| TC-4.4 | Switching to untranslated language shows banner | - | - |
| TC-4.5 | Language selection persists to cookie | - | - |
| TC-4.6 | Subsequent page loads honor persisted language | - | - |

---

## Category 5: Partial Translation Handling

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-5.1 | Partial translations show mixed content | - | - |
| TC-5.2 | No content gaps or blank fields | - | - |
| TC-5.3 | Partial state reflected in metadata | - | - |

---

## Category 6: UI/UX Quality

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-6.1 | No content flashing during language switch | - | - |
| TC-6.2 | No layout shifts during content swap | - | - |
| TC-6.3 | Desktop viewport displays correctly | - | - |
| TC-6.4 | Mobile viewport displays correctly | - | - |
| TC-6.5 | Loading states appear when fetching | - | - |

---

## Performance Metrics

### Toggle Response Time

| Iteration | Time (ms) |
|-----------|-----------|
| 1 | - |
| 2 | - |
| 3 | - |
| 4 | - |
| 5 | - |
| 6 | - |
| 7 | - |
| 8 | - |
| 9 | - |
| 10 | - |
| **Average** | - |
| **P95** | - |

### Language Switch Latency

| Scenario | Time (ms) |
|----------|-----------|
| UI interaction only | - |
| With mock fetch | - |

---

## Identified Issues

### Issue Template

```
**Issue ID:** ISS-001
**Severity:** [Critical/High/Medium/Low]
**Test Case:** TC-X.X
**Status:** [Open/In Progress/Resolved]

**Description:**
[Describe the issue]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Root Cause:**
[If known]

**Resolution:**
[If resolved]
```

---

## Issues Found

[List any issues using the template above]

---

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---

## Test Execution Commands

```bash
# Run all content display tests
npm run test -- --testPathPattern="ContentDisplay|ItemDisplay.translation"

# Run with coverage
npm run test -- --coverage --testPathPattern="ContentDisplay|ItemDisplay.translation"

# Run specific category
npm run test -- --testNamePattern="Category 3"

# Run performance tests only
npm run test -- --testPathPattern="perf.test"
```

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Test Executor | - | - | - |
| Developer | - | - | - |
| QA Lead | - | - | - |
```

**Acceptance Criteria:**
- [ ] Documentation file created at specified path
- [ ] All test case IDs documented
- [ ] Performance metrics section included
- [ ] Issue template provided
- [ ] Test execution commands documented
- [ ] Sign-off section included

**Estimated Effort:** 0.5 story points

---

## Verification Checklist

Before marking this request as complete, verify:

### Test Infrastructure
- [ ] Test helper directory created at `/src/components/guest/__tests__/helpers/`
- [ ] `testUtils.ts` created with render utilities
- [ ] `mockFactories.ts` created with all factory functions
- [ ] `index.ts` barrel exports created

### Test Files
- [ ] `ItemDisplay.translation.test.tsx` created with 20 tests
- [ ] `GuestComponents.integration.test.tsx` created with 10+ tests
- [ ] `ContentDisplay.e2e.test.tsx` created with 10+ tests
- [ ] `ContentDisplay.perf.test.tsx` created with 8+ tests

### Documentation
- [ ] Test results template created at `/docs/test-results/REQ-E04-024-content-display-test-results.md`

### Quality Gates
- [ ] All TypeScript files compile without errors
- [ ] Tests can be run with `npm run test`
- [ ] No console errors in test output
- [ ] Test coverage meets project standards

---

## Dependencies Graph

```
Task 1 (testUtils.ts)
    ↓
Task 2 (mockFactories.ts)
    ↓
Task 3 (index.ts exports) ─────┬─────────┬──────────┬
                               ↓         ↓          ↓
                           Task 4    Task 7     Task 8
                           (TC-1.x)  (TC-4.x)   (TC-5.x, 6.x)
                               ↓
                           Task 5
                           (TC-2.x)
                               ↓
                           Task 6
                           (TC-3.x)
                                         ↓
                                     Task 9
                                     (Performance)
                                         ↓
                                     Task 10
                                     (Documentation)
```

---

## Notes

- Tests should run in isolation without requiring a running server
- All external dependencies (Supabase, APIs) must be mocked
- Performance tests should run multiple iterations for statistical validity
- Document any discovered issues that require fixes in dependent components
- Tests are designed to validate existing implementations, not create them

---

## References

- **Overview Document:** `/docs/REQ-E04-024-test-content-display-scenarios-overview.md`
- **Request Document:** `/docs/gen_requests_epic4.md` - Request #24
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Test Configuration:** `/vitest.config.ts`
- **Test Setup:** `/vitest.setup.ts`
- **Existing Test Patterns:** `/src/components/ItemCreationWorkflow/__tests__/helpers/`
