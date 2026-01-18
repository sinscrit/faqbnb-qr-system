# REQ-326: Test Content Display Scenarios for Translations - Implementation Overview

**Document Created:** 2026-01-18 10:30 UTC
**Last Modified:** 2026-01-18 10:30 UTC
**Request ID:** REQ-326
**Phase:** 7 - Testing & Polish
**Task ID:** 7.2
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Summary

Create comprehensive test coverage for the translation content display system to verify that translated content displays correctly, original content appears when translations are unavailable, "View Original" toggle operates instantly without data refetching, and language switcher selection updates content appropriately. This test suite ensures reliable and predictable content rendering behavior across all guest-facing translation scenarios.

---

## 2. Background & Context

### Current State
- `ItemDisplay.tsx` component exists at `/src/components/ItemDisplay.tsx` rendering guest-facing item content
- `LinkCard.tsx` component exists at `/src/components/LinkCard.tsx` for rendering resource links
- Guest item page exists at `/src/app/item/[publicId]/page.tsx` serving translated content
- No systematic test coverage exists for translation content display scenarios
- Testing infrastructure uses Vitest with React Testing Library (configured in `/vitest.config.ts`)

### Dependencies
- **REQ-320:** ItemDisplay component updates for translation support (translationMeta, availableLanguages props)
- **REQ-321:** LinkCard component translation support (translatedTitle, showOriginal props)
- **REQ-317:** `useGuestLanguage` hook for client-side language state management
- **REQ-312:** TranslationBanner component for indicating translated content
- **REQ-313:** MissingTranslationBanner component for unavailable translations
- **REQ-314:** ViewOriginalToggle component for switching between original and translated content
- **Task 2.4:** Translation utility helpers (mergeTranslation, getDisplayLanguage)

### Business Value
- Ensures the guest-facing translation experience functions flawlessly across all real-world scenarios
- Validates that translation investments deliver actual value through proper content rendering
- Creates confidence that partial translations enhance rather than degrade the user experience
- Reduces support burden by catching content display edge cases before they reach production users

---

## 3. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Test translated content displays in place of original content when complete translation exists | Must |
| FR-2 | Test all translated text fields (name, description, article titles, link titles) render correctly | Must |
| FR-3 | Test untranslated fields display original content when translation is partial | Must |
| FR-4 | Test mixed content displays without visual gaps, errors, or inconsistent formatting | Must |
| FR-5 | Test all content displays in original language when no translation exists for requested language | Must |
| FR-6 | Test "View Original" toggle switches from translated to original content instantly | Must |
| FR-7 | Test toggle operation does not trigger network requests or data refetching | Must |
| FR-8 | Test toggle operation updates only displayed content state without full component re-render | Must |
| FR-9 | Test toggling back to translated view restores translated content without refetching | Must |
| FR-10 | Test language switcher selection updates displayed content to show new language translation | Must |
| FR-11 | Test switching to language without translation shows original content with appropriate banner | Must |
| FR-12 | Test switching between multiple languages shows correct content for each | Must |
| FR-13 | Test link titles update to translated versions when translations exist | Should |
| FR-14 | Test link titles fall back to original when link translations unavailable | Should |
| FR-15 | Test TranslationBanner appears correctly when viewing translated content | Must |
| FR-16 | Test MissingTranslationBanner appears when requested language is unavailable | Must |
| FR-17 | Test banner messages show correct source and target language names | Must |

### Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | Tests must run in under 60 seconds total | Must |
| NFR-2 | Tests must use project's established Vitest and React Testing Library patterns | Must |
| NFR-3 | Tests must provide clear failure messages for debugging | Should |
| NFR-4 | Test coverage must include all six supported languages | Must |
| NFR-5 | Tests must cover all content types (items, articles, links) | Must |
| NFR-6 | Visual regression tests should verify translated content maintains proper layout | Should |

---

## 4. Technical Design

### 4.1 Test File Locations

**Primary Test Files:**
- `/src/components/__tests__/ItemDisplay.translation.test.tsx` - Translation display unit tests
- `/src/components/__tests__/ItemDisplay.integration.test.tsx` - Integration tests with translation flow
- `/src/components/__tests__/LinkCard.translation.test.tsx` - LinkCard translation tests

### 4.2 Testing Framework

The project uses **Vitest** with the following configuration:
- **Config file:** `/vitest.config.ts`
- **Setup file:** `/vitest.setup.ts`
- **Global imports:** `describe`, `it`, `expect`, `vi` (mocking)
- **Test environment:** jsdom
- **React Testing Library:** `@testing-library/react`, `@testing-library/user-event`
- **Accessibility Testing:** `vitest-axe`

### 4.3 Mock Strategy

#### Translation Data Mocking

```typescript
// Mock item with translations
function createMockTranslatedItem(options: {
  sourceLanguage?: SupportedLanguage
  targetLanguage?: SupportedLanguage
  translationStatus?: 'complete' | 'partial' | 'missing'
}): TranslatedItem {
  const { sourceLanguage = 'en', targetLanguage = 'fr', translationStatus = 'complete' } = options

  const originalItem = {
    id: 'test-item-id',
    publicId: 'test-123',
    name: 'Original Item Name',
    description: 'Original item description text.',
  }

  if (translationStatus === 'missing') {
    return {
      ...originalItem,
      displayLanguage: sourceLanguage,
      sourceLanguage,
      isTranslated: false,
    }
  }

  return {
    ...originalItem,
    name: translationStatus === 'complete' ? 'Nom de l\'article traduit' : originalItem.name,
    description: 'Description de l\'article traduit.',
    displayLanguage: targetLanguage,
    sourceLanguage,
    isTranslated: true,
    originalName: originalItem.name,
    originalDescription: originalItem.description,
  }
}
```

#### useGuestLanguage Hook Mocking

```typescript
const mockUseGuestLanguage = {
  currentLanguage: 'fr' as SupportedLanguage,
  showOriginal: false,
  displayLanguage: 'fr' as SupportedLanguage,
  setLanguage: vi.fn(),
  toggleOriginal: vi.fn(),
  hasTranslation: vi.fn(() => true),
}

vi.mock('@/hooks/useGuestLanguage', () => ({
  useGuestLanguage: () => mockUseGuestLanguage,
}))
```

#### Network Request Spying

```typescript
// Spy on fetch to ensure no network requests during toggle
const fetchSpy = vi.spyOn(global, 'fetch')

// Assert no fetch calls during toggle operation
expect(fetchSpy).not.toHaveBeenCalled()
```

### 4.4 Test Categories

```
1. Complete Translation Display Tests
   - All fields display in target language
   - Original content replaced by translation
   - Translation metadata correctly passed

2. Partial Translation Display Tests
   - Translated fields show translation
   - Untranslated fields show original
   - No visual gaps or layout issues

3. Missing Translation Display Tests
   - All content shows in original language
   - MissingTranslationBanner appears
   - Language preference still honored

4. View Original Toggle Tests
   - Toggle switches content instantly
   - No network requests triggered
   - Toggle state persists correctly
   - Can toggle back to translation

5. Language Switcher Tests
   - Switcher updates content correctly
   - Handles language with no translation
   - Handles language with partial translation
   - Multiple language switches work correctly

6. Banner Display Tests
   - TranslationBanner shows for translated content
   - MissingTranslationBanner shows when unavailable
   - Banner text includes correct language names
   - View Original action works from banner

7. LinkCard Translation Tests
   - Translated link titles display correctly
   - Original titles show when no translation
   - Toggle affects link titles
   - Multiple links with mixed translation status

8. Edge Case Tests
   - Empty translation fields
   - Very long translations (German)
   - Special characters in translations
   - RTL content (if supported)
```

### 4.5 Constants for Testing

```typescript
// Supported Languages for Testing
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const
const DEFAULT_LANGUAGE = 'en'

// Mock Translation Content
const MOCK_TRANSLATIONS = {
  en: { name: 'Kitchen Steamer', description: 'How to use the kitchen steamer.' },
  fr: { name: 'Cuiseur vapeur', description: 'Comment utiliser le cuiseur vapeur.' },
  es: { name: 'Vaporera de cocina', description: 'Cómo usar la vaporera de cocina.' },
  de: { name: 'Küchendampfgarer', description: 'So verwenden Sie den Küchendampfgarer.' },
  nl: { name: 'Keuken stomer', description: 'Hoe de keukenstomer te gebruiken.' },
  it: { name: 'Vaporiera da cucina', description: 'Come usare la vaporiera da cucina.' },
}

// Mock Link Translations
const MOCK_LINK_TRANSLATIONS = {
  en: { title: 'Video Tutorial' },
  fr: { title: 'Tutoriel vidéo' },
  es: { title: 'Tutorial en video' },
  de: { title: 'Video-Anleitung' },
  nl: { title: 'Video tutorial' },
  it: { title: 'Tutorial video' },
}
```

---

## 5. Implementation Tasks

### Task 1: Create Test File Structure and Mock Utilities
**Estimated Size:** S

Create test files with mock utilities and helper functions.

**Acceptance Criteria:**
- [ ] Create `/src/components/__tests__/ItemDisplay.translation.test.tsx`
- [ ] Create `/src/components/__tests__/LinkCard.translation.test.tsx`
- [ ] Implement `createMockTranslatedItem` helper function
- [ ] Implement `createMockTranslatedArticle` helper function
- [ ] Implement `createMockTranslatedLink` helper function
- [ ] Implement `createMockTranslationMeta` helper function
- [ ] Add mock constants for translated content in all six languages
- [ ] Implement `renderItemDisplayWithTranslation` test utility
- [ ] Verify files pass TypeScript compilation

---

### Task 2: Implement Complete Translation Display Tests
**Estimated Size:** S

Create tests verifying complete translation display behavior.

**Acceptance Criteria:**
- [ ] Test translated item name displays instead of original
- [ ] Test translated item description displays instead of original
- [ ] Test translated article titles display instead of original
- [ ] Test translated article descriptions display instead of original
- [ ] Test all six supported languages render correctly
- [ ] Test translation metadata (sourceLanguage, displayLanguage) is correctly used
- [ ] Test isTranslated flag is true when translation is complete

---

### Task 3: Implement Partial Translation Display Tests
**Estimated Size:** M

Create tests verifying partial translation display behavior.

**Acceptance Criteria:**
- [ ] Test translated fields show translation when available
- [ ] Test untranslated fields show original content
- [ ] Test mixed content displays without visual gaps
- [ ] Test layout remains consistent with mixed content
- [ ] Test isTranslated is true even when translation is partial
- [ ] Test partial translations for each content type (item, article, link)
- [ ] Test scenarios where only name is translated but not description

---

### Task 4: Implement Missing Translation Display Tests
**Estimated Size:** S

Create tests verifying behavior when no translation exists.

**Acceptance Criteria:**
- [ ] Test all content displays in original language when no translation exists
- [ ] Test isTranslated flag is false when no translation
- [ ] Test displayLanguage equals sourceLanguage when no translation
- [ ] Test component renders without errors when translation data is null
- [ ] Test behavior when requested language is not in availableTranslations array

---

### Task 5: Implement View Original Toggle Tests
**Estimated Size:** M

Create tests verifying View Original toggle behavior.

**Acceptance Criteria:**
- [ ] Test clicking "View Original" shows original content
- [ ] Test toggle operation is instant (no loading state)
- [ ] Test no fetch/network calls are made during toggle
- [ ] Test toggle only updates content state, not full re-render
- [ ] Test clicking "View translation" after toggle restores translated content
- [ ] Test toggle state is reflected in UI (button label changes)
- [ ] Test toggle works correctly with partial translations
- [ ] Test toggle preserves scroll position

---

### Task 6: Implement Language Switcher Content Update Tests
**Estimated Size:** M

Create tests verifying language switcher affects content display.

**Acceptance Criteria:**
- [ ] Test selecting new language updates item content to new translation
- [ ] Test selecting new language updates article content
- [ ] Test selecting new language updates link titles
- [ ] Test selecting language with no translation shows original with MissingTranslationBanner
- [ ] Test multiple consecutive language switches work correctly
- [ ] Test switching from translated to original language shows original content
- [ ] Test language switcher callback (onLanguageChange) is called with correct language code

---

### Task 7: Implement Banner Display Tests
**Estimated Size:** S

Create tests verifying translation banners appear correctly.

**Acceptance Criteria:**
- [ ] Test TranslationBanner renders when showing translated content
- [ ] Test TranslationBanner shows correct source language name (not code)
- [ ] Test TranslationBanner "View original" action triggers toggleOriginal
- [ ] Test MissingTranslationBanner renders when translation unavailable
- [ ] Test MissingTranslationBanner shows both requested and displayed language names
- [ ] Test banner is NOT shown when viewing original content
- [ ] Test banner updates when language changes
- [ ] Test banner disappears when toggling to original view

---

### Task 8: Implement LinkCard Translation Tests
**Estimated Size:** S

Create tests verifying LinkCard translation display.

**Acceptance Criteria:**
- [ ] Test LinkCard displays translated title when translatedTitle prop provided
- [ ] Test LinkCard displays original title when translatedTitle is null/undefined
- [ ] Test LinkCard displays original title when showOriginal is true
- [ ] Test multiple LinkCards with mixed translation status render correctly
- [ ] Test LinkCard title updates when showOriginal prop changes
- [ ] Test LinkCard maintains other functionality (onClick, icons) with translation props

---

### Task 9: Implement Edge Case and Error Handling Tests
**Estimated Size:** S

Create tests for edge cases and error conditions.

**Acceptance Criteria:**
- [ ] Test handling of null translation object
- [ ] Test handling of undefined translation fields
- [ ] Test handling of empty string translations (should show original)
- [ ] Test very long translations (German typically longest) don't break layout
- [ ] Test special characters in translations render correctly (accents, umlauts)
- [ ] Test HTML entities in translations are properly escaped
- [ ] Test component gracefully handles malformed translationMeta
- [ ] Test component works when availableTranslations is empty array

---

### Task 10: Implement Integration Tests
**Estimated Size:** M

Create integration tests for complete translation flow.

**Acceptance Criteria:**
- [ ] Test complete flow: page load → translation displayed → toggle → switch language
- [ ] Test user journey: arrive with lang param → see translated content → toggle original → toggle back
- [ ] Test user journey: arrive without translation → see banner → select available language
- [ ] Test integration between ItemDisplay, LinkCard, and banners
- [ ] Test integration with useGuestLanguage hook in realistic scenario
- [ ] Test accessibility of translated content (proper lang attributes if applicable)

---

## 6. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/__tests__/ItemDisplay.translation.test.tsx` | Unit tests for ItemDisplay translation features |
| `/src/components/__tests__/LinkCard.translation.test.tsx` | Unit tests for LinkCard translation features |
| `/src/components/__tests__/ItemDisplay.integration.test.tsx` | Integration tests for translation flow |
| `/src/components/__tests__/__mocks__/translationTestData.ts` | Mock data factory for translation tests |

### Files to Read (Dependencies)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemDisplay.tsx` | Component being tested |
| `/src/components/LinkCard.tsx` | Component being tested |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Banner component for translated content |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Banner for missing translations |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Toggle component |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Language switcher component |
| `/src/hooks/useGuestLanguage.ts` | Hook for language state management |
| `/src/types/l10n.ts` | Type definitions for translations |
| `/src/types/index.ts` | Type definitions for ItemDisplayProps |
| `/vitest.config.ts` | Test configuration reference |
| `/vitest.setup.ts` | Test setup and global mocks |

### Components/Functions to Test

| Component/Function | Location | Test Coverage |
|--------------------|----------|---------------|
| `ItemDisplay` | `/src/components/ItemDisplay.tsx` | Translation display, toggle behavior, banner integration |
| `LinkCard` | `/src/components/LinkCard.tsx` | Translated title display, showOriginal prop behavior |
| `TranslationBanner` | `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Render conditions, correct language names |
| `MissingTranslationBanner` | `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Render conditions, message formatting |
| `ViewOriginalToggle` | `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Click handler, label changes |
| `useGuestLanguage` | `/src/hooks/useGuestLanguage.ts` | State updates, toggle functionality |

---

## 7. Dependencies

### Import Dependencies

```typescript
// Testing framework
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Components to test
import ItemDisplay from '@/components/ItemDisplay'
import LinkCard from '@/components/LinkCard'
import { TranslationBanner } from '@/components/guest/TranslationBanner'
import { MissingTranslationBanner } from '@/components/guest/MissingTranslationBanner'
import { ViewOriginalToggle } from '@/components/guest/ViewOriginalToggle'
import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher'

// Hooks
import { useGuestLanguage } from '@/hooks/useGuestLanguage'

// Types
import type { ItemDisplayProps, LinkCardProps } from '@/types'
import type { SupportedLanguage, TranslatedItem, TranslationMeta } from '@/types/l10n'
```

### Depends On (Tasks)

| Task | Description | Status |
|------|-------------|--------|
| REQ-320 (Task 5.2) | Update ItemDisplay component for translation support | Required |
| REQ-321 (Task 5.3) | Update LinkCard component for translation support | Required |
| REQ-317 (Task 4.1) | Create useGuestLanguage hook | Required |
| REQ-312 (Task 3.2) | Create TranslationBanner component | Required |
| REQ-313 (Task 3.3) | Create MissingTranslationBanner component | Required |
| REQ-314 (Task 3.4) | Create ViewOriginalToggle component | Required |
| REQ-311 (Task 3.1) | Create GuestLanguageSwitcher component | Required |
| REQ-325 (Task 7.1) | Test language detection scenarios (for mock patterns) | Helpful |

### Blocks (Tasks)

| Task | Description |
|------|-------------|
| Task 7.3 | Test edge cases (builds on content display tests) |
| Task 7.4 | Mobile responsiveness testing |
| Task 7.5 | Performance validation |

---

## 8. Test Specifications

### 8.1 Test Suite: ItemDisplay Translation Display

```typescript
describe('ItemDisplay Translation Display', () => {
  describe('Complete Translation', () => {
    it('displays translated item name instead of original')
    it('displays translated item description instead of original')
    it('displays translated article titles when available')
    it('displays translated article descriptions when available')
    it('renders complete translation for each of six supported languages')
    it('sets isTranslated to true in translationMeta')
  })

  describe('Partial Translation', () => {
    it('displays translated name with original description when description not translated')
    it('displays original name with translated description when name not translated')
    it('handles article with translated title but untranslated description')
    it('maintains consistent layout with mixed translated/original content')
    it('does not show visual gaps for untranslated fields')
  })

  describe('Missing Translation', () => {
    it('displays all content in original language when no translation exists')
    it('displays content in source language when requested language unavailable')
    it('does not throw error when translation data is null')
    it('does not throw error when translationMeta is missing')
    it('sets isTranslated to false when no translation available')
  })
})
```

### 8.2 Test Suite: View Original Toggle

```typescript
describe('View Original Toggle', () => {
  describe('Toggle Behavior', () => {
    it('switches from translated to original content when toggled')
    it('switches from original back to translated when toggled again')
    it('updates content instantly without loading state')
    it('does not trigger fetch/network request when toggling')
    it('only updates content state, not full component re-render')
    it('preserves scroll position when toggling')
  })

  describe('Toggle State Reflection', () => {
    it('shows "View in original (English)" button when viewing translation')
    it('shows "View translation" button when viewing original')
    it('includes correct source language name in button label')
    it('calls toggleOriginal from useGuestLanguage hook')
  })

  describe('Toggle with Partial Translations', () => {
    it('shows fully original content when toggled, even for partial translation')
    it('restores partial translation when toggling back')
  })
})
```

### 8.3 Test Suite: Language Switcher Content Updates

```typescript
describe('Language Switcher Content Updates', () => {
  describe('Switching to Language with Translation', () => {
    it('updates item content to selected language translation')
    it('updates article content to selected language translation')
    it('updates link titles to selected language translation')
    it('calls onLanguageChange with correct language code')
    it('updates cookie preference via useGuestLanguage hook')
  })

  describe('Switching to Language without Translation', () => {
    it('shows original content when switching to untranslated language')
    it('displays MissingTranslationBanner with correct message')
    it('includes both requested and displayed language in banner')
  })

  describe('Multiple Language Switches', () => {
    it('handles switching from fr to de correctly')
    it('handles switching from de back to en correctly')
    it('handles rapid consecutive language switches')
    it('correctly updates content for each language in sequence')
  })
})
```

### 8.4 Test Suite: Banner Display

```typescript
describe('Banner Display', () => {
  describe('TranslationBanner', () => {
    it('renders when isTranslated is true and showOriginal is false')
    it('displays source language name (not code) in message')
    it('shows "Translated from [Language]" text format')
    it('includes "View original" action link')
    it('calls toggleOriginal when View original clicked')
    it('does not render when showOriginal is true')
    it('does not render when isTranslated is false')
  })

  describe('MissingTranslationBanner', () => {
    it('renders when requested language differs from displayed language')
    it('shows "[Requested] translation not available. Showing content in [Source]."')
    it('uses full language names (French, not fr)')
    it('does not render when translation is available')
    it('does not render when viewing source language content')
  })
})
```

### 8.5 Test Suite: LinkCard Translation

```typescript
describe('LinkCard Translation', () => {
  describe('Translated Title Display', () => {
    it('displays translatedTitle when provided and showOriginal is false')
    it('displays original title when translatedTitle is null')
    it('displays original title when translatedTitle is undefined')
    it('displays original title when showOriginal is true')
  })

  describe('Title Toggle Behavior', () => {
    it('updates to original title when showOriginal changes to true')
    it('updates to translated title when showOriginal changes to false')
    it('does not re-fetch data when toggling')
  })

  describe('Mixed Translation Status', () => {
    it('handles grid of links with some translated, some not')
    it('each link independently respects its translation status')
    it('all links respond to showOriginal prop uniformly')
  })
})
```

---

## 9. Test Data Matrices

### 9.1 Translation Display Test Cases

| Test ID | Source Lang | Display Lang | Translation Status | Expected Content |
|---------|-------------|--------------|-------------------|------------------|
| TD-1 | en | fr | complete | French translation for all fields |
| TD-2 | en | es | complete | Spanish translation for all fields |
| TD-3 | en | de | partial (name only) | German name, English description |
| TD-4 | en | nl | missing | English original with MissingTranslationBanner |
| TD-5 | fr | en | complete | English translation |
| TD-6 | en | it | partial (description only) | English name, Italian description |

### 9.2 Toggle Behavior Test Cases

| Test ID | Initial State | Action | Expected Result |
|---------|---------------|--------|-----------------|
| TOG-1 | Showing French translation | Click "View Original" | English original displayed |
| TOG-2 | Showing English original | Click "View translation" | French translation displayed |
| TOG-3 | Showing partial translation | Click "View Original" | Full English original |
| TOG-4 | Showing English original | Toggle twice | French translation restored |
| TOG-5 | Any translation state | Toggle | No fetch() calls made |

### 9.3 Language Switch Test Cases

| Test ID | Current Lang | Switch To | Has Translation | Expected Result |
|---------|--------------|-----------|-----------------|-----------------|
| LS-1 | en | fr | Yes | French content, TranslationBanner |
| LS-2 | fr | de | Yes | German content, TranslationBanner |
| LS-3 | de | nl | No | English original, MissingTranslationBanner |
| LS-4 | en | es | Partial | Spanish partial, TranslationBanner |
| LS-5 | fr | en | N/A (source) | English original, no banner |

### 9.4 Banner Display Test Cases

| Test ID | isTranslated | showOriginal | requestedLang | displayLang | TranslationBanner | MissingBanner |
|---------|--------------|--------------|---------------|-------------|-------------------|---------------|
| BNR-1 | true | false | fr | fr | Shown | Hidden |
| BNR-2 | true | true | fr | en | Hidden | Hidden |
| BNR-3 | false | false | nl | en | Hidden | Shown |
| BNR-4 | false | false | en | en | Hidden | Hidden |
| BNR-5 | true | false | de | de | Shown | Hidden |

---

## 10. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Test execution time | Use mocks to avoid real network/API calls |
| Component re-render testing | Use React Testing Library's rerender utility |
| Memory leaks in tests | Proper cleanup in afterEach hooks |
| Toggle performance | Spy on fetch to verify no network calls |

**Target Performance:** All tests complete in under 60 seconds

---

## 11. Edge Cases to Cover

| Edge Case | Test Scenario | Expected Behavior |
|-----------|---------------|-------------------|
| Empty translation string | `translatedTitle = ''` | Shows original title |
| Whitespace-only translation | `translatedTitle = '   '` | Shows original title |
| Very long German text | 150+ character translation | Text truncates/wraps properly |
| Special characters | `name = "Küchendampfgarer"` | Renders correctly with umlaut |
| Accented characters | `name = "Cuiseur à vapeur"` | Renders correctly with accent |
| HTML in translation | `name = "<script>alert(1)</script>"` | HTML escaped, not executed |
| Null translationMeta | Component receives null | Renders original content |
| Empty availableTranslations | `availableTranslations = []` | Shows original, MissingBanner |
| Same source and display lang | `sourceLanguage = displayLanguage` | No banner shown |

---

## 12. Code Example

```typescript
// /src/components/__tests__/ItemDisplay.translation.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ItemDisplay from '../ItemDisplay'
import type { SupportedLanguage, TranslationMeta } from '@/types/l10n'

// Mock useGuestLanguage hook
const mockToggleOriginal = vi.fn()
const mockSetLanguage = vi.fn()

let mockShowOriginal = false

vi.mock('@/hooks/useGuestLanguage', () => ({
  useGuestLanguage: () => ({
    currentLanguage: 'fr' as SupportedLanguage,
    showOriginal: mockShowOriginal,
    displayLanguage: mockShowOriginal ? 'en' : 'fr',
    setLanguage: mockSetLanguage,
    toggleOriginal: mockToggleOriginal,
    hasTranslation: vi.fn((lang: string) => ['en', 'fr', 'es', 'de'].includes(lang)),
  }),
}))

// Mock data factories
function createMockItem(options: {
  withTranslation?: boolean
  partial?: boolean
} = {}) {
  const base = {
    id: 'test-item-123',
    publicId: 'steamer-001',
    name: 'Kitchen Steamer',
    description: 'How to use the kitchen steamer.',
    links: [
      { id: 'link-1', title: 'Video Tutorial', linkType: 'youtube', url: 'https://youtube.com/watch?v=abc', thumbnailUrl: null },
    ],
  }

  if (!options.withTranslation) {
    return base
  }

  return {
    ...base,
    name: options.partial ? base.name : 'Cuiseur vapeur',
    description: 'Comment utiliser le cuiseur vapeur.',
    originalName: base.name,
    originalDescription: base.description,
  }
}

function createMockTranslationMeta(options: {
  isTranslated?: boolean
  sourceLanguage?: SupportedLanguage
  displayLanguage?: SupportedLanguage
} = {}): TranslationMeta {
  return {
    requestedLanguage: options.displayLanguage ?? 'fr',
    displayLanguage: options.displayLanguage ?? 'fr',
    sourceLanguage: options.sourceLanguage ?? 'en',
    availableTranslations: ['en', 'fr', 'es', 'de'] as SupportedLanguage[],
    isShowingTranslation: options.isTranslated ?? true,
  }
}

describe('ItemDisplay Translation Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockShowOriginal = false
  })

  describe('Complete Translation', () => {
    it('displays translated item name instead of original', () => {
      const item = createMockItem({ withTranslation: true })
      const translationMeta = createMockTranslationMeta({ isTranslated: true })

      render(
        <ItemDisplay
          item={item}
          translationMeta={translationMeta}
        />
      )

      expect(screen.getByRole('heading', { name: /cuiseur vapeur/i })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /kitchen steamer/i })).not.toBeInTheDocument()
    })

    it('displays translated description instead of original', () => {
      const item = createMockItem({ withTranslation: true })
      const translationMeta = createMockTranslationMeta({ isTranslated: true })

      render(
        <ItemDisplay
          item={item}
          translationMeta={translationMeta}
        />
      )

      expect(screen.getByText(/comment utiliser le cuiseur vapeur/i)).toBeInTheDocument()
      expect(screen.queryByText(/how to use the kitchen steamer/i)).not.toBeInTheDocument()
    })
  })

  describe('Missing Translation', () => {
    it('displays all content in original language when no translation exists', () => {
      const item = createMockItem({ withTranslation: false })
      const translationMeta = createMockTranslationMeta({
        isTranslated: false,
        displayLanguage: 'en',
      })

      render(
        <ItemDisplay
          item={item}
          translationMeta={translationMeta}
        />
      )

      expect(screen.getByRole('heading', { name: /kitchen steamer/i })).toBeInTheDocument()
      expect(screen.getByText(/how to use the kitchen steamer/i)).toBeInTheDocument()
    })
  })
})

describe('View Original Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not trigger fetch when toggling', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
    const item = createMockItem({ withTranslation: true })
    const translationMeta = createMockTranslationMeta({ isTranslated: true })

    render(
      <ItemDisplay
        item={item}
        translationMeta={translationMeta}
      />
    )

    // Find and click the View Original toggle
    const toggleButton = screen.getByRole('button', { name: /view.*original/i })
    await userEvent.click(toggleButton)

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(mockToggleOriginal).toHaveBeenCalledTimes(1)

    fetchSpy.mockRestore()
  })

  it('switches content when showOriginal changes', () => {
    const item = createMockItem({ withTranslation: true })
    const translationMeta = createMockTranslationMeta({ isTranslated: true })

    const { rerender } = render(
      <ItemDisplay
        item={item}
        translationMeta={translationMeta}
      />
    )

    // Initially shows French
    expect(screen.getByRole('heading', { name: /cuiseur vapeur/i })).toBeInTheDocument()

    // Simulate toggle state change
    mockShowOriginal = true
    rerender(
      <ItemDisplay
        item={item}
        translationMeta={translationMeta}
      />
    )

    // Now shows English
    expect(screen.getByRole('heading', { name: /kitchen steamer/i })).toBeInTheDocument()
  })
})

describe('Banner Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockShowOriginal = false
  })

  it('shows TranslationBanner when viewing translated content', () => {
    const item = createMockItem({ withTranslation: true })
    const translationMeta = createMockTranslationMeta({ isTranslated: true })

    render(
      <ItemDisplay
        item={item}
        translationMeta={translationMeta}
      />
    )

    expect(screen.getByText(/translated from english/i)).toBeInTheDocument()
  })

  it('shows MissingTranslationBanner when translation unavailable', () => {
    const item = createMockItem({ withTranslation: false })
    const translationMeta = createMockTranslationMeta({
      isTranslated: false,
      displayLanguage: 'en',
    })

    // Mock hook to indicate Dutch was requested but unavailable
    vi.mocked(useGuestLanguage).mockReturnValueOnce({
      currentLanguage: 'nl',
      showOriginal: false,
      displayLanguage: 'en',
      setLanguage: mockSetLanguage,
      toggleOriginal: mockToggleOriginal,
      hasTranslation: vi.fn(() => false),
    })

    render(
      <ItemDisplay
        item={item}
        translationMeta={{
          ...translationMeta,
          requestedLanguage: 'nl',
        }}
      />
    )

    expect(screen.getByText(/dutch translation not available/i)).toBeInTheDocument()
    expect(screen.getByText(/showing content in english/i)).toBeInTheDocument()
  })
})
```

```typescript
// /src/components/__tests__/LinkCard.translation.test.tsx

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LinkCard from '../LinkCard'

describe('LinkCard Translation', () => {
  const defaultProps = {
    title: 'Video Tutorial',
    linkType: 'youtube' as const,
    url: 'https://youtube.com/watch?v=abc123',
    thumbnailUrl: null,
    onClick: vi.fn(),
  }

  describe('Translated Title Display', () => {
    it('displays translatedTitle when provided and showOriginal is false', () => {
      render(
        <LinkCard
          {...defaultProps}
          translatedTitle="Tutoriel vidéo"
          showOriginal={false}
        />
      )

      expect(screen.getByText('Tutoriel vidéo')).toBeInTheDocument()
      expect(screen.queryByText('Video Tutorial')).not.toBeInTheDocument()
    })

    it('displays original title when translatedTitle is null', () => {
      render(
        <LinkCard
          {...defaultProps}
          translatedTitle={null}
          showOriginal={false}
        />
      )

      expect(screen.getByText('Video Tutorial')).toBeInTheDocument()
    })

    it('displays original title when showOriginal is true', () => {
      render(
        <LinkCard
          {...defaultProps}
          translatedTitle="Tutoriel vidéo"
          showOriginal={true}
        />
      )

      expect(screen.getByText('Video Tutorial')).toBeInTheDocument()
      expect(screen.queryByText('Tutoriel vidéo')).not.toBeInTheDocument()
    })
  })

  describe('Title Toggle Behavior', () => {
    it('updates display when showOriginal prop changes', () => {
      const { rerender } = render(
        <LinkCard
          {...defaultProps}
          translatedTitle="Tutoriel vidéo"
          showOriginal={false}
        />
      )

      expect(screen.getByText('Tutoriel vidéo')).toBeInTheDocument()

      rerender(
        <LinkCard
          {...defaultProps}
          translatedTitle="Tutoriel vidéo"
          showOriginal={true}
        />
      )

      expect(screen.getByText('Video Tutorial')).toBeInTheDocument()
    })
  })
})
```

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemDisplay component not updated with translation props | Medium | High | Verify REQ-320 completion before starting tests |
| LinkCard component not updated with translation props | Medium | High | Verify REQ-321 completion before starting tests |
| useGuestLanguage hook not implemented | Medium | High | Verify REQ-317 completion; create mock as fallback |
| Guest components (banners) not created | Medium | High | Verify REQ-312, REQ-313, REQ-314 completion |
| Test mocking complexity | Medium | Medium | Use established patterns from REQ-325 tests |
| Visual regression testing requires additional setup | Low | Low | Mark visual tests as optional/future enhancement |

---

## 14. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Definition:** `/docs/gen_requests_epic4.md` - REQ-326
- **Related Test Spec:** REQ-325 (language detection tests - use as pattern reference)
- **ItemDisplay Component:** `/src/components/ItemDisplay.tsx`
- **LinkCard Component:** `/src/components/LinkCard.tsx`
- **Vitest Configuration:** `/vitest.config.ts`
- **Vitest Setup:** `/vitest.setup.ts`
- **Example Test Pattern:** `/src/components/__tests__/QRCodeLabelDisplay.test.tsx`
- **E2E Test Utils Pattern:** `/src/components/ItemCreationWorkflow/__tests__/e2e/test-utils.tsx`

---

## 15. Checklist for Implementation

- [ ] Verify `/src/components/ItemDisplay.tsx` has translation props (REQ-320)
- [ ] Verify `/src/components/LinkCard.tsx` has translation props (REQ-321)
- [ ] Verify `/src/hooks/useGuestLanguage.ts` exists (REQ-317)
- [ ] Verify guest components exist (TranslationBanner, MissingTranslationBanner, ViewOriginalToggle)
- [ ] Create `/src/components/__tests__/ItemDisplay.translation.test.tsx`
- [ ] Create `/src/components/__tests__/LinkCard.translation.test.tsx`
- [ ] Create `/src/components/__tests__/__mocks__/translationTestData.ts`
- [ ] Implement mock helper functions (createMockTranslatedItem, etc.)
- [ ] Implement complete translation display tests
- [ ] Implement partial translation display tests
- [ ] Implement missing translation display tests
- [ ] Implement View Original toggle tests
- [ ] Implement language switcher content update tests
- [ ] Implement banner display tests
- [ ] Implement LinkCard translation tests
- [ ] Implement edge case tests
- [ ] Implement integration tests
- [ ] Run full test suite with `npm run test`
- [ ] Verify all tests pass
- [ ] Verify test execution time is under 60 seconds
- [ ] Review test coverage for completeness

---

*Document generated for FAQBNB L10N Epic 4 - Phase 7, Task 7.2*
