# REQ-358: Test Content Display Scenarios for Translated Guest Experience - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Testing & Polish
**Task ID:** 7.2
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## 1. Summary

This request validates that guest-facing content displays correctly across all translation scenarios. The implementation requires creating comprehensive test cases to verify:

1. **Translated content displays correctly** when translations exist for the selected language
2. **Original content shows gracefully** when no translation is available
3. **"View Original" toggle works instantly** switching between translated and original content without page reload
4. **Language switcher updates content** dynamically when guests change their language preference

### Key Testing Areas:
- Items (name, description)
- Articles (title, description)
- Links (title)
- Tags (display value)
- Translation banners and indicators

---

## 2. Current State Analysis

### Existing Implementation

**Guest Item Page `/src/app/item/[publicId]/page.tsx`**:
- Server component fetching item data via API
- Currently fetches item data without translation support
- Passes item data to ItemDisplay client component
- Metadata generation uses original content (not translated)

**ItemDisplay Component `/src/components/ItemDisplay.tsx`**:
- Client component rendering item content
- Displays item name, description, links, and articles
- No translation props or language state management
- No integration with guest language hook or translation components

**LinkCard Component `/src/components/LinkCard.tsx`**:
- Client component for displaying individual links
- Accepts title, linkType, url, thumbnailUrl props
- No translation support currently implemented

### Gap Analysis

| Component | Current Status | Required for Testing |
|-----------|---------------|---------------------|
| ItemDisplay with translation props | Not implemented | Required |
| TranslationBanner integration | Not implemented | Required |
| MissingTranslationBanner integration | Not implemented | Required |
| ViewOriginalToggle integration | Not implemented | Required |
| GuestLanguageSwitcher integration | Not implemented | Required |
| useGuestLanguage hook usage | Not implemented | Required |
| Translation data flow from server | Not implemented | Required |

### Dependencies from Plan

The following components from the implementation plan are prerequisites:

| Dependency | Location | Status |
|------------|----------|--------|
| GuestLanguageSwitcher | `/src/components/guest/GuestLanguageSwitcher/` | TBD |
| TranslationBanner | `/src/components/guest/TranslationBanner/` | TBD |
| MissingTranslationBanner | `/src/components/guest/MissingTranslationBanner/` | TBD |
| ViewOriginalToggle | `/src/components/guest/ViewOriginalToggle/` | TBD |
| useGuestLanguage hook | `/src/hooks/useGuestLanguage.ts` | TBD |
| Translation fetch utilities | `/src/lib/translations/fetch-translations.ts` | TBD |
| Public item API with translations | `/src/app/api/public/items/[publicId]/route.ts` | TBD |

---

## 3. Test Strategy

### 3.1 Test Approach

Testing will use a combination of:
1. **Manual E2E Tests** - Primary method for validating visual content display
2. **Component Tests** - For toggle and switcher functionality
3. **Integration Tests** - For translation data flow verification

### 3.2 Test Scenarios Matrix

#### Scenario A: Translated Content Display

| Test ID | Scenario | Language | Content State | Expected Result |
|---------|----------|----------|---------------|-----------------|
| T-358-A1 | Full translation exists | French | All fields translated | All content displays in French |
| T-358-A2 | Partial translation | German | Only name translated | Name in German, description in original |
| T-358-A3 | Translation for item but not articles | Spanish | Item translated, articles not | Item in Spanish, articles in original |
| T-358-A4 | Translation pending | Italian | Status = pending | Show original with "translation in progress" indicator |
| T-358-A5 | Multiple items/articles | Dutch | Various states | Each element shows appropriate version |

#### Scenario B: Original Content Fallback

| Test ID | Scenario | Language | Content State | Expected Result |
|---------|----------|----------|---------------|-----------------|
| T-358-B1 | No translation exists | French | No translation record | Original content shown |
| T-358-B2 | Translation failed | German | Status = failed | Original content, no error shown |
| T-358-B3 | Unsupported language selected | Chinese | Not in supported list | Falls back to original |
| T-358-B4 | Empty translation fields | Spanish | Record exists but empty | Original content shown |
| T-358-B5 | Source language selected | English | Source = en, selected = en | Original shown, no banner |

#### Scenario C: View Original Toggle

| Test ID | Scenario | Action | Expected Result |
|---------|----------|--------|-----------------|
| T-358-C1 | Toggle to original | Click toggle | Instant switch to original, no page reload |
| T-358-C2 | Toggle back to translation | Click toggle again | Instant switch to translation |
| T-358-C3 | Toggle state persistence | Navigate within item | Toggle state preserved |
| T-358-C4 | Toggle when no translation | Click toggle | No change (already showing original) |
| T-358-C5 | Toggle with partial translation | Click toggle | All fields switch simultaneously |
| T-358-C6 | Rapid toggling | Click multiple times quickly | Smooth transitions, no glitches |

#### Scenario D: Language Switcher Updates

| Test ID | Scenario | Action | Expected Result |
|---------|----------|--------|-----------------|
| T-358-D1 | Switch to available language | Select French | All content updates to French |
| T-358-D2 | Switch to unavailable language | Select Italian (no translation) | Original content shown with banner |
| T-358-D3 | Switch back to original language | Select English | Original content, no translation banner |
| T-358-D4 | Rapid language switching | Switch between languages | Smooth updates, no broken states |
| T-358-D5 | Switch with toggle active | Toggle on, then switch | Reset toggle, show new language |
| T-358-D6 | Cookie persistence | Switch language, refresh | Same language shown after refresh |

---

## 4. Authorized Files and Functions for Modification

### 4.1 Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/docs/testing/L10N-Content-Display-Test-Protocol.md` | Detailed test protocol for content display scenarios |
| `/docs/testing/results/L10N-Content-Display-Test-Results.md` | Test results template |
| `/src/components/guest/__tests__/ViewOriginalToggle.test.tsx` | Component unit tests |
| `/src/components/guest/__tests__/TranslationBanner.test.tsx` | Component unit tests |
| `/src/hooks/__tests__/useGuestLanguage.test.ts` | Hook integration tests |

### 4.2 Files to MODIFY

| File Path | Changes | Lines Affected |
|-----------|---------|----------------|
| `/src/components/ItemDisplay.tsx` | Add translation props, integrate guest components | ~150 lines |
| `/src/app/item/[publicId]/page.tsx` | Add language detection, fetch translations | ~80 lines |
| `/src/components/LinkCard.tsx` | Add translated title support | ~20 lines |
| `/docs/testing/L10N-E2E-Test-Protocol.md` | Add content display test cases | ~100 lines |

### 4.3 Functions to TEST

```typescript
// useGuestLanguage hook - /src/hooks/useGuestLanguage.ts
function useGuestLanguage(options: UseGuestLanguageOptions): UseGuestLanguageReturn;
// Test: currentLanguage updates correctly
// Test: showOriginal toggles instantly
// Test: displayLanguage reflects toggle state
// Test: setLanguage updates cookie and state

// TranslationBanner - /src/components/guest/TranslationBanner/TranslationBanner.tsx
function TranslationBanner(props: TranslationBannerProps): JSX.Element;
// Test: Shows correct source language
// Test: "View original" click triggers callback
// Test: Hides when showing original

// ViewOriginalToggle - /src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx
function ViewOriginalToggle(props: ViewOriginalToggleProps): JSX.Element;
// Test: Shows correct toggle state
// Test: Click triggers onToggle
// Test: Accessible keyboard navigation

// GuestLanguageSwitcher - /src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx
function GuestLanguageSwitcher(props: GuestLanguageSwitcherProps): JSX.Element;
// Test: Shows all 6 languages
// Test: Indicates available translations
// Test: Selection triggers onLanguageChange
// Test: Current language highlighted
```

### 4.4 Components to VERIFY

```typescript
// ItemDisplay - Modified to accept translation props
interface ItemDisplayProps {
  item: TranslatedItem;
  articles?: TranslatedArticle[];
  tags?: TranslatedTag[];
  translationMeta: {
    requestedLanguage: SupportedLanguage;
    displayLanguage: SupportedLanguage;
    sourceLanguage: SupportedLanguage;
    availableTranslations: SupportedLanguage[];
    isShowingTranslation: boolean;
  };
}

// Verify: Renders translated content when isShowingTranslation = true
// Verify: Renders original content when showOriginal toggle is active
// Verify: Displays TranslationBanner when showing translation
// Verify: Displays MissingTranslationBanner when translation unavailable
// Verify: GuestLanguageSwitcher appears in header
```

---

## 5. Manual E2E Test Protocol

### 5.1 Test Environment Setup

```markdown
**Prerequisites:**
- Staging environment: https://faqbnb-staging.up.railway.app
- Test item with publicId: [TEST_ITEM_PUBLIC_ID]
- Item must have:
  - Translations in French and German (complete)
  - Translation in Spanish (partial - only title)
  - No translation in Italian
  - Multiple articles with varying translation states
- Clear browser cookies before each test scenario
```

### 5.2 Test Cases

#### TC-358-1: Translated Content Displays Correctly

**Priority:** Critical
**Scenario:** Full translation available

**Steps:**
1. Clear all cookies
2. Navigate to `/item/[publicId]?lang=fr`
3. Observe the page content

**Expected Results:**
- [ ] Item name displays in French
- [ ] Item description displays in French
- [ ] Article titles display in French
- [ ] Article descriptions display in French
- [ ] Link titles display in French
- [ ] TranslationBanner shows "Translated from English"
- [ ] Language switcher shows French selected

**Pass/Fail:** ______

---

#### TC-358-2: All Translatable Fields Show Translated Versions

**Priority:** High
**Scenario:** Verify all content types

**Steps:**
1. Navigate to `/item/[publicId]?lang=de` (German)
2. Verify each content element

**Expected Results:**
- [ ] Item name: German translation
- [ ] Item description: German translation
- [ ] Each article title: German translation
- [ ] Each article description: German translation
- [ ] Each link title: German translation
- [ ] Tags: German translations (if applicable)

**Pass/Fail:** ______

---

#### TC-358-3: Original Content Shows When No Translation Exists

**Priority:** Critical
**Scenario:** No translation available

**Steps:**
1. Clear cookies
2. Navigate to `/item/[publicId]?lang=it` (Italian, no translation)
3. Observe content and UI

**Expected Results:**
- [ ] All content displays in original language (English)
- [ ] MissingTranslationBanner shows "Italian translation not available"
- [ ] No error messages or broken UI
- [ ] Language switcher shows Italian selected (grayed)
- [ ] "View Original" toggle is disabled or hidden

**Pass/Fail:** ______

---

#### TC-358-4: Missing Translations Don't Cause Errors

**Priority:** High
**Scenario:** Error handling verification

**Steps:**
1. Navigate to `/item/[publicId]?lang=it`
2. Open browser console
3. Check for JavaScript errors

**Expected Results:**
- [ ] No JavaScript errors in console
- [ ] No blank content areas
- [ ] No loading spinners stuck
- [ ] No network errors (404, 500)
- [ ] Graceful fallback to original content

**Pass/Fail:** ______

---

#### TC-358-5: View Original Toggle Switches Instantly

**Priority:** Critical
**Scenario:** Toggle functionality

**Steps:**
1. Navigate to `/item/[publicId]?lang=fr`
2. Verify French content is shown
3. Click "View Original" toggle
4. Observe the transition

**Expected Results:**
- [ ] Content switches to English instantly
- [ ] No page reload occurs (check URL doesn't change)
- [ ] Toggle button changes to "View Translation"
- [ ] TranslationBanner updates or hides
- [ ] All content types switch simultaneously

**Pass/Fail:** ______

---

#### TC-358-6: Toggle State Persists During Navigation

**Priority:** Medium
**Scenario:** Navigation within item

**Steps:**
1. Navigate to `/item/[publicId]?lang=fr`
2. Click "View Original" toggle
3. Scroll through articles/links
4. Return to top of page

**Expected Results:**
- [ ] Toggle state remains "showing original"
- [ ] All content still shows original language
- [ ] No state reset during scroll

**Pass/Fail:** ______

---

#### TC-358-7: Toggle Works When Translation Missing

**Priority:** Medium
**Scenario:** Toggle with no translation

**Steps:**
1. Navigate to `/item/[publicId]?lang=it` (no translation)
2. Attempt to interact with toggle (if visible)

**Expected Results:**
- [ ] Toggle is disabled, hidden, or non-functional
- [ ] No change occurs when clicked
- [ ] Original content remains displayed
- [ ] No confusing UI states

**Pass/Fail:** ______

---

#### TC-358-8: Language Switcher Updates All Content

**Priority:** Critical
**Scenario:** Language change

**Steps:**
1. Navigate to `/item/[publicId]` (default language)
2. Open language switcher
3. Select "Francais" (French)
4. Observe content update

**Expected Results:**
- [ ] All content updates to French
- [ ] TranslationBanner appears
- [ ] "View Original" toggle appears
- [ ] Update happens without page reload
- [ ] FAQBNB_LANG cookie is set to "fr"

**Pass/Fail:** ______

---

#### TC-358-9: Content Update Without Page Reload

**Priority:** High
**Scenario:** Verify client-side update

**Steps:**
1. Navigate to `/item/[publicId]?lang=en`
2. Note the current scroll position
3. Switch language to French
4. Observe scroll position and page behavior

**Expected Results:**
- [ ] Scroll position maintained
- [ ] No full page refresh (URL stays same except lang param)
- [ ] Smooth content transition
- [ ] No flash of unstyled content

**Pass/Fail:** ______

---

#### TC-358-10: Language Change Applies to All Elements

**Priority:** High
**Scenario:** Comprehensive update

**Steps:**
1. Navigate to `/item/[publicId]?lang=en`
2. Switch to French
3. Check each content area

**Expected Results:**
- [ ] Header/item name updates
- [ ] Description updates
- [ ] All articles update
- [ ] All links update
- [ ] Banner text updates
- [ ] UI elements update (if translated)

**Pass/Fail:** ______

---

#### TC-358-11: Switching to Language Without Translation

**Priority:** High
**Scenario:** Unavailable translation selection

**Steps:**
1. Navigate to `/item/[publicId]?lang=fr` (French translation exists)
2. Switch language to Italian (no translation)

**Expected Results:**
- [ ] Content reverts to original language
- [ ] MissingTranslationBanner appears
- [ ] "Italian not available, showing in English" message
- [ ] No error states or crashes
- [ ] Language switcher shows Italian selected

**Pass/Fail:** ______

---

#### TC-358-12: Test All Content Types

**Priority:** High
**Scenario:** Items, articles, and links

**Steps:**
1. Navigate to item with multiple articles and links
2. Switch to French
3. Verify each content type

**Expected Results:**
- [ ] Item: name and description translated
- [ ] Articles: title and description translated
- [ ] Links: title translated
- [ ] Tags: translated (if applicable)

**Pass/Fail:** ______

---

#### TC-358-13: Edge Case - Partial Translations

**Priority:** Medium
**Scenario:** Mixed translation states

**Steps:**
1. Navigate to `/item/[publicId]?lang=es` (partial translation)
2. Observe mixed content

**Expected Results:**
- [ ] Translated fields show Spanish
- [ ] Untranslated fields show original
- [ ] No visual inconsistencies
- [ ] Clear indication of mixed state (optional)

**Pass/Fail:** ______

---

#### TC-358-14: Edge Case - Rapid Language Switching

**Priority:** Medium
**Scenario:** Stress test

**Steps:**
1. Navigate to item page
2. Rapidly switch between: en → fr → de → es → en
3. Observe behavior

**Expected Results:**
- [ ] Final state matches last selection
- [ ] No race conditions or stuck states
- [ ] UI remains responsive
- [ ] No duplicate API calls

**Pass/Fail:** ______

---

#### TC-358-15: Performance Validation

**Priority:** High
**Scenario:** Response time verification

**Steps:**
1. Navigate to `/item/[publicId]?lang=en`
2. Open browser DevTools → Network tab
3. Switch language to French
4. Measure time to content update

**Expected Results:**
- [ ] Language detection: < 10ms
- [ ] Content toggle (View Original): < 100ms (client-side)
- [ ] Language switch: < 200ms for content update
- [ ] No visible loading delay

**Pass/Fail:** ______

---

#### TC-358-16: Test Scenarios Documentation

**Priority:** Medium
**Scenario:** Documentation verification

**Steps:**
1. Review all test cases above
2. Verify expected outcomes documented
3. Confirm visual outcomes described

**Expected Results:**
- [ ] Each scenario has clear pass/fail criteria
- [ ] Expected visual states documented
- [ ] Edge cases covered
- [ ] Error scenarios included

**Pass/Fail:** ______

---

## 6. Component Test Implementation

### 6.1 ViewOriginalToggle Tests

```typescript
// /src/components/guest/__tests__/ViewOriginalToggle.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewOriginalToggle } from '../ViewOriginalToggle';

describe('ViewOriginalToggle', () => {
  const defaultProps = {
    isShowingOriginal: false,
    sourceLanguage: 'en' as const,
    onToggle: vi.fn(),
  };

  it('should render toggle button', () => {
    render(<ViewOriginalToggle {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show "View Original" when showing translation', () => {
    render(<ViewOriginalToggle {...defaultProps} isShowingOriginal={false} />);
    expect(screen.getByText(/view original/i)).toBeInTheDocument();
  });

  it('should show "View Translation" when showing original', () => {
    render(<ViewOriginalToggle {...defaultProps} isShowingOriginal={true} />);
    expect(screen.getByText(/view translation/i)).toBeInTheDocument();
  });

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<ViewOriginalToggle {...defaultProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('should display source language name', () => {
    render(<ViewOriginalToggle {...defaultProps} sourceLanguage="fr" />);
    expect(screen.getByText(/french/i)).toBeInTheDocument();
  });
});
```

### 6.2 useGuestLanguage Hook Tests

```typescript
// /src/hooks/__tests__/useGuestLanguage.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuestLanguage } from '../useGuestLanguage';

describe('useGuestLanguage', () => {
  const defaultOptions = {
    initialLanguage: 'fr' as const,
    sourceLanguage: 'en' as const,
    availableTranslations: ['fr', 'de', 'es'] as const,
  };

  beforeEach(() => {
    // Clear cookies
    document.cookie = 'FAQBNB_GUEST_LANG=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('should return initial language', () => {
    const { result } = renderHook(() => useGuestLanguage(defaultOptions));
    expect(result.current.currentLanguage).toBe('fr');
  });

  it('should toggle showOriginal', () => {
    const { result } = renderHook(() => useGuestLanguage(defaultOptions));
    expect(result.current.showOriginal).toBe(false);

    act(() => {
      result.current.toggleOriginal();
    });

    expect(result.current.showOriginal).toBe(true);
  });

  it('should update displayLanguage when toggling', () => {
    const { result } = renderHook(() => useGuestLanguage(defaultOptions));
    expect(result.current.displayLanguage).toBe('fr');

    act(() => {
      result.current.toggleOriginal();
    });

    expect(result.current.displayLanguage).toBe('en');
  });

  it('should change language', () => {
    const { result } = renderHook(() => useGuestLanguage(defaultOptions));

    act(() => {
      result.current.setLanguage('de');
    });

    expect(result.current.currentLanguage).toBe('de');
  });

  it('should reset showOriginal when changing language', () => {
    const { result } = renderHook(() => useGuestLanguage(defaultOptions));

    act(() => {
      result.current.toggleOriginal();
    });
    expect(result.current.showOriginal).toBe(true);

    act(() => {
      result.current.setLanguage('de');
    });
    expect(result.current.showOriginal).toBe(false);
  });

  it('should check if translation is available', () => {
    const { result } = renderHook(() => useGuestLanguage(defaultOptions));
    expect(result.current.hasTranslation('fr')).toBe(true);
    expect(result.current.hasTranslation('it')).toBe(false);
  });
});
```

---

## 7. Dependencies

### Required Before Testing

- [ ] Phase 3 Tasks: Guest UI Components (REQ-345 through REQ-350)
- [ ] Phase 4 Tasks: useGuestLanguage hook (REQ-350)
- [ ] Phase 5 Tasks: Update guest item page (REQ-352)
- [ ] Translation tables populated with test data
- [ ] Public item API returning translation data

### Dependencies on Other REQs

| REQ | Description | Required For |
|-----|-------------|--------------|
| REQ-345 | GuestLanguageSwitcher component | All language switch tests |
| REQ-346 | TranslationBanner component | Banner display tests |
| REQ-347 | MissingTranslationBanner component | Missing translation tests |
| REQ-348 | ViewOriginalToggle component | Toggle tests |
| REQ-350 | useGuestLanguage hook | All state management tests |
| REQ-352 | Update guest item page | All E2E tests |
| REQ-357 | Language detection tests | Language cascade tests |

---

## 8. Acceptance Criteria Checklist

- [ ] Translated content displays correctly when translation exists for selected language
- [ ] All translatable fields (descriptions, titles, tags) show translated versions consistently
- [ ] Original content displays properly when no translation exists for selected language
- [ ] Missing translations do not cause errors, blank content, or loading states
- [ ] "View Original" toggle switches between translated and original content instantly
- [ ] Toggle state persists while navigating within the same item or article
- [ ] Toggle works correctly when translation is missing (shows original in both states)
- [ ] Language switcher component updates all visible content when language changes
- [ ] Content update happens without full page reload
- [ ] Language change applies to all translated elements on the page simultaneously
- [ ] Switching to a language without translations shows original content gracefully
- [ ] All test scenarios cover items, articles, and links content types
- [ ] Edge cases validated (partial translations, mixed language content, rapid language switching)
- [ ] Performance remains smooth when toggling or switching languages repeatedly
- [ ] Test scenarios documented with expected visual outcomes and behavior

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Guest components not yet implemented | High | High | Complete Phase 3-5 tasks first |
| Translation data not populated | Medium | High | Seed test data before testing |
| Client-side state management issues | Medium | Medium | Thorough hook testing |
| Performance degradation with many translations | Low | Medium | Optimize data fetching |
| Race conditions in rapid switching | Medium | Low | Debounce language changes |
| Browser cookie blocking | Low | Low | Graceful fallback behavior |

---

## 10. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-358)
- Existing ItemDisplay: `/src/components/ItemDisplay.tsx`
- Existing Guest Item Page: `/src/app/item/[publicId]/page.tsx`
- Existing LinkCard: `/src/components/LinkCard.tsx`
- L10N E2E Test Protocol: `/docs/testing/L10N-E2E-Test-Protocol.md`
- Language Detection Tests: `/docs/REQ-357-test-language-detection-scenarios-overview.md`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 7: Testing & Polish*
