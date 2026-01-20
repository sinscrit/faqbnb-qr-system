# Implementation Breakdown: REQ-E04-024 - Test Content Display Scenarios

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

## Summary

Comprehensive validation testing of the guest content display system to ensure translated content displays correctly, original content fallback works reliably, the "View Original" toggle functions instantly, and the language switcher properly updates all visible content. This testing task validates the end-to-end guest experience for multilingual content viewing.

---

## Current State Analysis

### Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| ItemDisplay Component | `/src/components/ItemDisplay.tsx` | Exists - needs translation integration |
| Guest Item Page | `/src/app/item/[publicId]/page.tsx` | Exists - needs translation support |
| Test Configuration | `/vitest.config.ts`, `/vitest.setup.ts` | Configured with Vitest |
| i18n Configuration | `/src/lib/i18n/config.ts` | Exists |
| Language Detection | `/src/lib/i18n/language-detection.ts` | Exists |
| Test Helpers Pattern | `/src/components/ItemCreationWorkflow/__tests__/helpers/` | Pattern established |

### Testing Framework Details

- **Test Runner:** Vitest
- **Testing Library:** @testing-library/react
- **User Interaction:** @testing-library/user-event
- **Accessibility Testing:** vitest-axe
- **Assertions:** jest-dom matchers

### Dependencies from Previous Tasks

| Dependency | Expected Location | Required For |
|------------|-------------------|--------------|
| GuestLanguageSwitcher | `/src/components/guest/GuestLanguageSwitcher/` | Language switching tests |
| TranslationBanner | `/src/components/guest/TranslationBanner/` | Translation indicator tests |
| MissingTranslationBanner | `/src/components/guest/MissingTranslationBanner/` | Fallback indicator tests |
| ViewOriginalToggle | `/src/components/guest/ViewOriginalToggle/` | Toggle behavior tests |
| useGuestLanguage hook | `/src/hooks/useGuestLanguage.ts` | State management tests |
| Translation fetch utilities | `/src/lib/translations/fetch-translations.ts` | Content retrieval tests |
| Translation utility helpers | `/src/lib/translations/translation-utils.ts` | Merge/display logic tests |

---

## Test Scenario Breakdown

### Category 1: Translated Content Display

**Objective:** Verify that translated content displays correctly when a translation is available.

| Test Case ID | Description | Expected Behavior |
|--------------|-------------|-------------------|
| TC-1.1 | Translated item title displays correctly | Item title shows translated version when translation available |
| TC-1.2 | Translated item description displays correctly | Description shows translated version when available |
| TC-1.3 | All article content displays translated versions | Each article title and description shows translated content |
| TC-1.4 | All link titles display translated versions | LinkCard components show translated titles |
| TC-1.5 | All tag names display translated versions | Tags render with translated display values |
| TC-1.6 | Translation metadata indicates correct state | `isTranslated: true` and proper source language shown |

### Category 2: Original Content Fallback

**Objective:** Verify that original content displays correctly when no translation exists.

| Test Case ID | Description | Expected Behavior |
|--------------|-------------|-------------------|
| TC-2.1 | Original item title displays when no translation | Item title shows original without errors |
| TC-2.2 | Original description displays completely | Full description visible without truncation |
| TC-2.3 | Original articles display without missing content | All article content visible and intact |
| TC-2.4 | Original link titles display correctly | All links show original titles |
| TC-2.5 | Original tag names display correctly | Tags show original key/value pairs |
| TC-2.6 | MissingTranslationBanner appears | Banner indicates requested vs. displayed language |
| TC-2.7 | Banner message identifies both languages | "French translation not available. Showing content in English." |

### Category 3: View Original Toggle

**Objective:** Verify that the toggle between translated and original content works instantly.

| Test Case ID | Description | Expected Behavior |
|--------------|-------------|-------------------|
| TC-3.1 | Toggle switches from translated to original | Content immediately shows original version |
| TC-3.2 | Toggle action completes in <200ms | No perceptible delay, no loading spinner |
| TC-3.3 | All content fields update simultaneously | Title, description, articles, links, tags all switch |
| TC-3.4 | Toggle back restores translated content | Re-clicking shows translation again |
| TC-3.5 | Toggle state persists during multiple switches | Rapid toggling maintains correct state |
| TC-3.6 | No network requests on toggle | Content switch is purely client-side |
| TC-3.7 | Toggle button label updates correctly | Shows "View in original (English)" ↔ "View translation" |

### Category 4: Language Switcher Content Updates

**Objective:** Verify that the language switcher properly updates all content.

| Test Case ID | Description | Expected Behavior |
|--------------|-------------|-------------------|
| TC-4.1 | Language selection updates all visible content | Entire page reflects new language choice |
| TC-4.2 | Language switch triggers translation fetch | API call made for new language translations |
| TC-4.3 | TranslationBanner shows correct source language | Banner text updates to reflect new translation source |
| TC-4.4 | Switching to untranslated language shows banner | MissingTranslationBanner appears appropriately |
| TC-4.5 | Language selection persists to cookie | Cookie `FAQBNB_GUEST_LANG` updated |
| TC-4.6 | Subsequent page loads honor persisted language | Refresh shows content in stored language |

### Category 5: Partial Translation Handling

**Objective:** Verify correct behavior when only some fields are translated.

| Test Case ID | Description | Expected Behavior |
|--------------|-------------|-------------------|
| TC-5.1 | Partial translations show mixed content | Translated fields + original fallbacks displayed |
| TC-5.2 | No content gaps or blank fields | Every field shows either translated or original |
| TC-5.3 | Partial state reflected in metadata | Translation status indicates partial completion |

### Category 6: UI/UX Quality

**Objective:** Verify professional display quality across scenarios.

| Test Case ID | Description | Expected Behavior |
|--------------|-------------|-------------------|
| TC-6.1 | No content flashing during language switch | Smooth transition without flicker |
| TC-6.2 | No layout shifts during content swap | Page dimensions stable during updates |
| TC-6.3 | Desktop viewport displays correctly | All components properly sized and positioned |
| TC-6.4 | Mobile viewport displays correctly | Responsive design adapts appropriately |
| TC-6.5 | Loading states appear when fetching | Skeleton or spinner during API calls |

---

## Implementation Tasks

### Task 1: Create Test Helper Infrastructure

**Files to Create:**
- `/src/components/guest/__tests__/helpers/testUtils.ts`
- `/src/components/guest/__tests__/helpers/mockFactories.ts`
- `/src/components/guest/__tests__/helpers/index.ts`

**Scope:**
- Render utilities with provider wrappers
- Mock data factories for items, articles, links, tags
- Translation metadata mock factories
- Timing utilities for performance assertions

### Task 2: Create ItemDisplay Translation Tests

**File:** `/src/components/ItemDisplay/__tests__/ItemDisplay.translation.test.tsx`

**Test Groups:**
- Translated content rendering (TC-1.1 through TC-1.6)
- Original content fallback (TC-2.1 through TC-2.7)
- Toggle behavior (TC-3.1 through TC-3.7)

### Task 3: Create Guest Component Integration Tests

**File:** `/src/components/guest/__tests__/GuestComponents.integration.test.tsx`

**Test Groups:**
- Language switcher interactions (TC-4.1 through TC-4.6)
- Banner component display logic
- Component coordination

### Task 4: Create Content Display E2E Tests

**File:** `/src/components/guest/__tests__/ContentDisplay.e2e.test.tsx`

**Test Groups:**
- Full guest flow scenarios
- Partial translation handling (TC-5.1 through TC-5.3)
- UI quality validation (TC-6.1 through TC-6.5)

### Task 5: Create Performance Tests

**File:** `/src/components/guest/__tests__/ContentDisplay.perf.test.tsx`

**Test Groups:**
- Toggle response time measurement
- Language switch latency
- Render performance

### Task 6: Document Test Results

**File:** `/docs/test-results/REQ-E04-024-content-display-test-results.md`

**Scope:**
- Test execution summary
- Pass/fail status for each scenario
- Screenshots of identified issues
- Performance metrics

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/guest/__tests__/helpers/testUtils.ts` | Test render utilities and providers |
| `/src/components/guest/__tests__/helpers/mockFactories.ts` | Mock data generation functions |
| `/src/components/guest/__tests__/helpers/index.ts` | Barrel exports for test helpers |
| `/src/components/ItemDisplay/__tests__/ItemDisplay.translation.test.tsx` | Translation display tests |
| `/src/components/guest/__tests__/GuestComponents.integration.test.tsx` | Component integration tests |
| `/src/components/guest/__tests__/ContentDisplay.e2e.test.tsx` | End-to-end display tests |
| `/src/components/guest/__tests__/ContentDisplay.perf.test.tsx` | Performance validation tests |
| `/docs/test-results/REQ-E04-024-content-display-test-results.md` | Test results documentation |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemDisplay.tsx` | Component under test |
| `/src/app/item/[publicId]/page.tsx` | Page component under test |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Language switcher component |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Translation banner component |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Missing translation banner |
| `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx` | Toggle component |
| `/src/hooks/useGuestLanguage.ts` | Language state hook |
| `/src/lib/translations/fetch-translations.ts` | Translation fetch utilities |
| `/src/lib/translations/translation-utils.ts` | Translation helpers |
| `/src/types/l10n.ts` | Localization types |
| `/vitest.config.ts` | Test configuration |
| `/vitest.setup.ts` | Test setup |

---

## Technical Specifications

### Mock Data Structures

```typescript
// Mock Item with Translation
interface MockTranslatedItem {
  id: string;
  publicId: string;
  name: string;                    // Translated
  description: string | null;      // Translated
  originalName: string;            // Original
  originalDescription: string;     // Original
  sourceLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  isTranslated: boolean;
}

// Mock Translation Metadata
interface MockTranslationMeta {
  requestedLanguage: SupportedLanguage;
  displayLanguage: SupportedLanguage;
  sourceLanguage: SupportedLanguage;
  availableTranslations: SupportedLanguage[];
  isShowingTranslation: boolean;
}
```

### Test Utility Functions

```typescript
// Render with translation context
export const renderWithTranslation = (
  ui: React.ReactElement,
  options?: {
    translationMeta?: Partial<TranslationMeta>;
    initialLanguage?: SupportedLanguage;
  }
) => {
  // Implementation wraps component with necessary providers
};

// Create mock translated item
export const createMockTranslatedItem = (
  overrides?: Partial<MockTranslatedItem>
): MockTranslatedItem => ({
  id: crypto.randomUUID(),
  publicId: `item-${Date.now()}`,
  name: 'Nombre del Artículo',         // Spanish
  description: 'Descripción en español',
  originalName: 'Item Name',            // English
  originalDescription: 'English description',
  sourceLanguage: 'en',
  displayLanguage: 'es',
  isTranslated: true,
  ...overrides,
});

// Create mock translation metadata
export const createMockTranslationMeta = (
  overrides?: Partial<MockTranslationMeta>
): MockTranslationMeta => ({
  requestedLanguage: 'es',
  displayLanguage: 'es',
  sourceLanguage: 'en',
  availableTranslations: ['es', 'fr', 'de'],
  isShowingTranslation: true,
  ...overrides,
});

// Performance timing utility
export const measureToggleTime = async (
  toggleAction: () => Promise<void>
): Promise<number> => {
  const start = performance.now();
  await toggleAction();
  return performance.now() - start;
};
```

### Test Assertions

```typescript
// Content display assertions
expect(screen.getByText('Nombre del Artículo')).toBeInTheDocument();
expect(screen.queryByText('Item Name')).not.toBeInTheDocument();

// Banner assertions
expect(screen.getByRole('status')).toHaveTextContent('Translated from English');

// Toggle timing assertions
const toggleTime = await measureToggleTime(async () => {
  await user.click(screen.getByRole('button', { name: /view original/i }));
});
expect(toggleTime).toBeLessThan(200);

// No network request assertions
expect(mockFetch).not.toHaveBeenCalled();
```

---

## Test Execution Plan

### Phase 1: Unit Tests
1. Run translation display tests for ItemDisplay
2. Run banner component tests
3. Run toggle component tests

### Phase 2: Integration Tests
1. Run language switcher integration tests
2. Run content update flow tests
3. Run cookie persistence tests

### Phase 3: E2E Tests
1. Run full guest flow tests
2. Run partial translation tests
3. Run responsive design tests

### Phase 4: Performance Tests
1. Run toggle timing tests
2. Run language switch latency tests
3. Record metrics

### Phase 5: Documentation
1. Compile test results
2. Document any failures with reproduction steps
3. Capture screenshots of issues
4. Record performance metrics

---

## Acceptance Criteria

### Test Coverage Requirements
- [ ] All 28 test cases documented and implemented
- [ ] Each test case has clear pass/fail criteria
- [ ] Test results documented with execution evidence

### Quality Requirements
- [ ] Toggle action completes in under 200 milliseconds
- [ ] No content flashing or layout shifts observed
- [ ] All content fields update correctly during language/toggle switches
- [ ] Mobile and desktop viewports tested

### Documentation Requirements
- [ ] Test results file created with pass/fail status
- [ ] Any identified issues documented with:
  - Reproduction steps
  - Expected vs. actual behavior
  - Severity assessment
  - Screenshots where applicable

---

## Dependencies

### Blocking Dependencies
| Dependency | Source | Status |
|------------|--------|--------|
| Guest UI Components | REQ-E04-008 through REQ-E04-012 | Required |
| useGuestLanguage hook | REQ-E04-014 | Required |
| Translation fetch utilities | REQ-E04-004 | Required |
| Translation utility helpers | REQ-E04-007 | Required |
| Updated ItemDisplay | REQ-E04-017 | Required |

### Non-Blocking Dependencies
| Dependency | Source | Impact |
|------------|--------|--------|
| Language detection tests | REQ-E04-023 | Run before but not blocking |
| Middleware updates | REQ-E04-020 | E2E tests may need adjustment |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Guest components not yet implemented | Medium | High | Create mock implementations for testing |
| Performance threshold not met | Low | Medium | Profile and optimize toggle logic |
| Flaky tests due to timing | Medium | Low | Use proper async/await and waitFor patterns |
| Mock data diverges from actual | Low | Medium | Base mocks on actual type definitions |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Test cases passing | 100% (28/28) |
| Toggle response time | < 200ms |
| Language switch latency | < 500ms (including API) |
| Content flashing incidents | 0 |
| Layout shift incidents | 0 |

---

## References

- **Request Document:** `/docs/gen_requests_epic4.md` - Request #24
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Test Configuration:** `/vitest.config.ts`
- **Test Setup:** `/vitest.setup.ts`
- **Existing Test Patterns:** `/src/components/ItemCreationWorkflow/__tests__/helpers/`

---

## Notes

- Tests should be runnable in isolation without requiring a running server
- Mock all external dependencies (Supabase, APIs)
- Use established test helper patterns from existing codebase
- Performance tests should run multiple iterations for accuracy
- Document any discovered issues that may require fixes in dependent components
