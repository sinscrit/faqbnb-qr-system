# REQ-358: Test Content Display Scenarios for Translated Guest Experience - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 7 - Testing & Polish
**Task ID:** 7.2
**Overview Document:** REQ-358-test-content-display-scenarios-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic4-Guest-Experience.md

---

## 1. Executive Summary

This document provides granular, actionable tasks for validating content display scenarios in the guest-facing translation experience. The testing encompasses four key areas: translated content display, original content fallback, View Original toggle functionality, and language switcher updates. Each task is scoped to approximately 1 story point for efficient implementation.

---

## 2. Prerequisites Checklist

Before beginning these tasks, verify the following dependencies are complete:

| Prerequisite | Location | Verification Command |
|--------------|----------|---------------------|
| GuestLanguageSwitcher component | `/src/components/guest/GuestLanguageSwitcher/` | `ls -la src/components/guest/GuestLanguageSwitcher/` |
| TranslationBanner component | `/src/components/guest/TranslationBanner/` | `ls -la src/components/guest/TranslationBanner/` |
| MissingTranslationBanner component | `/src/components/guest/MissingTranslationBanner/` | `ls -la src/components/guest/MissingTranslationBanner/` |
| ViewOriginalToggle component | `/src/components/guest/ViewOriginalToggle/` | `ls -la src/components/guest/ViewOriginalToggle/` |
| useGuestLanguage hook | `/src/hooks/useGuestLanguage.ts` | `cat src/hooks/useGuestLanguage.ts` |
| Guest item page updated | `/src/app/item/[publicId]/page.tsx` | Review for translation props |
| ItemDisplay with translation support | `/src/components/ItemDisplay.tsx` | Review for guest component integration |
| Test data seeded | Database | Run SQL query to verify translations exist |

### Verify Test Data Exists

```sql
-- Check translation tables have test data
SELECT
  'item_translations' as table_name,
  COUNT(*) as count,
  COUNT(DISTINCT language) as languages
FROM item_translations
WHERE translation_status = 'completed'
UNION ALL
SELECT 'article_translations', COUNT(*), COUNT(DISTINCT language)
FROM article_translations
WHERE translation_status = 'completed'
UNION ALL
SELECT 'link_translations', COUNT(*), COUNT(DISTINCT language)
FROM link_translations
WHERE translation_status = 'completed';
```

---

## 3. Task Breakdown

### TASK 358.1: Create Test Documentation Structure

**Objective:** Set up the testing documentation framework and test result templates.

**Story Points:** 1

#### Steps:

1. **Create testing directory if not exists**
   ```bash
   mkdir -p docs/testing/results
   ```

2. **Create test protocol document**
   - File: `/docs/testing/L10N-Content-Display-Test-Protocol.md`
   - Content structure:
     - Test environment setup instructions
     - Test data requirements
     - Test scenario matrix
     - Execution checklist
     - Sign-off section

3. **Create test results template**
   - File: `/docs/testing/results/L10N-Content-Display-Test-Results.md`
   - Content structure:
     - Execution date
     - Tester name
     - Environment details
     - Results table with Pass/Fail/Blocked columns
     - Issues found section
     - Screenshots section (links)

#### Acceptance Criteria:
- [ ] `/docs/testing/` directory exists
- [ ] Test protocol document created with all test cases listed
- [ ] Test results template ready for execution
- [ ] Document includes links to related REQs and overview

#### Files to Create:
| File | Purpose |
|------|---------|
| `/docs/testing/L10N-Content-Display-Test-Protocol.md` | Detailed test execution guide |
| `/docs/testing/results/L10N-Content-Display-Test-Results.md` | Results template |

---

### TASK 358.2: Write ViewOriginalToggle Component Unit Tests

**Objective:** Create comprehensive unit tests for the ViewOriginalToggle component.

**Story Points:** 1

#### Steps:

1. **Create test file**
   - File: `/src/components/guest/__tests__/ViewOriginalToggle.test.tsx`

2. **Implement test cases**

```typescript
// /src/components/guest/__tests__/ViewOriginalToggle.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewOriginalToggle } from '../ViewOriginalToggle';

describe('ViewOriginalToggle', () => {
  const defaultProps = {
    isShowingOriginal: false,
    sourceLanguage: 'en' as const,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toggle button', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show "View Original" text when showing translation', () => {
      render(<ViewOriginalToggle {...defaultProps} isShowingOriginal={false} />);
      expect(screen.getByText(/view original/i)).toBeInTheDocument();
    });

    it('should show "View Translation" text when showing original', () => {
      render(<ViewOriginalToggle {...defaultProps} isShowingOriginal={true} />);
      expect(screen.getByText(/view translation/i)).toBeInTheDocument();
    });

    it('should display source language name correctly', () => {
      render(<ViewOriginalToggle {...defaultProps} sourceLanguage="fr" />);
      expect(screen.getByText(/french/i)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<ViewOriginalToggle {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('should call onToggle when clicked', async () => {
      const onToggle = vi.fn();
      render(<ViewOriginalToggle {...defaultProps} onToggle={onToggle} />);

      await userEvent.click(screen.getByRole('button'));
      expect(onToggle).toHaveBeenCalledOnce();
    });

    it('should call onToggle when pressing Enter', async () => {
      const onToggle = vi.fn();
      render(<ViewOriginalToggle {...defaultProps} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');
      expect(onToggle).toHaveBeenCalledOnce();
    });

    it('should call onToggle when pressing Space', async () => {
      const onToggle = vi.fn();
      render(<ViewOriginalToggle {...defaultProps} onToggle={onToggle} />);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard(' ');
      expect(onToggle).toHaveBeenCalledOnce();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      render(<ViewOriginalToggle {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have aria-pressed attribute', () => {
      const { rerender } = render(
        <ViewOriginalToggle {...defaultProps} isShowingOriginal={false} />
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

      rerender(<ViewOriginalToggle {...defaultProps} isShowingOriginal={true} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('All Supported Languages', () => {
    const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

    languages.forEach((lang) => {
      it(`should display correct name for ${lang}`, () => {
        render(<ViewOriginalToggle {...defaultProps} sourceLanguage={lang} />);
        // Verify button renders without error for each language
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });
});
```

3. **Run tests and verify passing**
   ```bash
   npm run test -- ViewOriginalToggle
   ```

#### Acceptance Criteria:
- [ ] Test file created at specified location
- [ ] All rendering tests pass
- [ ] All interaction tests pass
- [ ] All accessibility tests pass
- [ ] All language tests pass
- [ ] Test coverage > 90% for component

#### Files to Create:
| File | Purpose |
|------|---------|
| `/src/components/guest/__tests__/ViewOriginalToggle.test.tsx` | Component unit tests |

---

### TASK 358.3: Write TranslationBanner Component Unit Tests

**Objective:** Create comprehensive unit tests for the TranslationBanner component.

**Story Points:** 1

#### Steps:

1. **Create test file**
   - File: `/src/components/guest/__tests__/TranslationBanner.test.tsx`

2. **Implement test cases**

```typescript
// /src/components/guest/__tests__/TranslationBanner.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationBanner } from '../TranslationBanner';

describe('TranslationBanner', () => {
  const defaultProps = {
    sourceLanguage: 'en' as const,
    displayLanguage: 'fr' as const,
    onViewOriginal: vi.fn(),
    isShowingOriginal: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render banner with correct background color', () => {
      const { container } = render(<TranslationBanner {...defaultProps} />);
      // Check for light blue background (#E3F2FD or equivalent Tailwind class)
      expect(container.firstChild).toHaveClass('bg-blue-50');
    });

    it('should display "Translated from" text with source language', () => {
      render(<TranslationBanner {...defaultProps} sourceLanguage="en" />);
      expect(screen.getByText(/translated from english/i)).toBeInTheDocument();
    });

    it('should render globe icon', () => {
      render(<TranslationBanner {...defaultProps} />);
      // Check for icon presence (by test-id or svg role)
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
    });

    it('should render "View original" link', () => {
      render(<TranslationBanner {...defaultProps} />);
      expect(screen.getByText(/view original/i)).toBeInTheDocument();
    });

    it('should hide when showing original content', () => {
      const { container } = render(
        <TranslationBanner {...defaultProps} isShowingOriginal={true} />
      );
      // Banner should not be visible or should show different state
      expect(container.firstChild).toHaveClass('hidden');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TranslationBanner {...defaultProps} className="my-custom-class" />
      );
      expect(container.firstChild).toHaveClass('my-custom-class');
    });
  });

  describe('Interactions', () => {
    it('should call onViewOriginal when link is clicked', async () => {
      const onViewOriginal = vi.fn();
      render(<TranslationBanner {...defaultProps} onViewOriginal={onViewOriginal} />);

      await userEvent.click(screen.getByText(/view original/i));
      expect(onViewOriginal).toHaveBeenCalledOnce();
    });
  });

  describe('Language Combinations', () => {
    const sourceLanguages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;
    const displayLanguages = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

    sourceLanguages.forEach((source) => {
      displayLanguages
        .filter((display) => display !== source)
        .forEach((display) => {
          it(`should render correctly for ${source} → ${display}`, () => {
            render(
              <TranslationBanner
                {...defaultProps}
                sourceLanguage={source}
                displayLanguage={display}
              />
            );
            expect(screen.getByRole('banner') || screen.getByTestId('translation-banner')).toBeInTheDocument();
          });
        });
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes', () => {
      render(<TranslationBanner {...defaultProps} />);
      const banner = screen.getByRole('banner') || screen.getByTestId('translation-banner');
      expect(banner).toHaveAttribute('aria-live', 'polite');
    });

    it('should have clickable link that is keyboard accessible', async () => {
      const onViewOriginal = vi.fn();
      render(<TranslationBanner {...defaultProps} onViewOriginal={onViewOriginal} />);

      const link = screen.getByText(/view original/i);
      link.focus();
      await userEvent.keyboard('{Enter}');
      expect(onViewOriginal).toHaveBeenCalled();
    });
  });
});
```

3. **Run tests and verify passing**
   ```bash
   npm run test -- TranslationBanner
   ```

#### Acceptance Criteria:
- [ ] Test file created at specified location
- [ ] All rendering tests pass
- [ ] All interaction tests pass
- [ ] All language combination tests pass
- [ ] All accessibility tests pass
- [ ] Test coverage > 90% for component

#### Files to Create:
| File | Purpose |
|------|---------|
| `/src/components/guest/__tests__/TranslationBanner.test.tsx` | Component unit tests |

---

### TASK 358.4: Write useGuestLanguage Hook Integration Tests

**Objective:** Create comprehensive tests for the useGuestLanguage hook.

**Story Points:** 1

#### Steps:

1. **Create test file**
   - File: `/src/hooks/__tests__/useGuestLanguage.test.ts`

2. **Implement test cases**

```typescript
// /src/hooks/__tests__/useGuestLanguage.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuestLanguage } from '../useGuestLanguage';

// Mock document.cookie
const mockCookie = {
  value: '',
};

Object.defineProperty(document, 'cookie', {
  get: () => mockCookie.value,
  set: (v: string) => {
    mockCookie.value = v;
  },
});

describe('useGuestLanguage', () => {
  const defaultOptions = {
    initialLanguage: 'fr' as const,
    sourceLanguage: 'en' as const,
    availableTranslations: ['fr', 'de', 'es'] as const,
  };

  beforeEach(() => {
    // Clear cookies
    mockCookie.value = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return initial language from options', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));
      expect(result.current.currentLanguage).toBe('fr');
    });

    it('should default showOriginal to false', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));
      expect(result.current.showOriginal).toBe(false);
    });

    it('should set displayLanguage equal to currentLanguage initially', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));
      expect(result.current.displayLanguage).toBe('fr');
    });
  });

  describe('Toggle Original', () => {
    it('should toggle showOriginal from false to true', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.toggleOriginal();
      });

      expect(result.current.showOriginal).toBe(true);
    });

    it('should toggle showOriginal back to false', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.toggleOriginal();
      });
      act(() => {
        result.current.toggleOriginal();
      });

      expect(result.current.showOriginal).toBe(false);
    });

    it('should update displayLanguage to source when showing original', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.toggleOriginal();
      });

      expect(result.current.displayLanguage).toBe('en');
    });

    it('should update displayLanguage back to current when not showing original', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.toggleOriginal();
      });
      act(() => {
        result.current.toggleOriginal();
      });

      expect(result.current.displayLanguage).toBe('fr');
    });
  });

  describe('Set Language', () => {
    it('should change currentLanguage', () => {
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

    it('should update displayLanguage to new language', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.setLanguage('de');
      });

      expect(result.current.displayLanguage).toBe('de');
    });

    it('should persist language to cookie', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.setLanguage('de');
      });

      expect(mockCookie.value).toContain('FAQBNB_GUEST_LANG=de');
    });
  });

  describe('Has Translation', () => {
    it('should return true for available translations', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.hasTranslation('fr')).toBe(true);
      expect(result.current.hasTranslation('de')).toBe(true);
      expect(result.current.hasTranslation('es')).toBe(true);
    });

    it('should return false for unavailable translations', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      expect(result.current.hasTranslation('it')).toBe(false);
      expect(result.current.hasTranslation('nl')).toBe(false);
    });

    it('should return true for source language', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));
      expect(result.current.hasTranslation('en')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggle calls', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.toggleOriginal();
        result.current.toggleOriginal();
        result.current.toggleOriginal();
      });

      expect(result.current.showOriginal).toBe(true);
    });

    it('should handle setting same language twice', () => {
      const { result } = renderHook(() => useGuestLanguage(defaultOptions));

      act(() => {
        result.current.setLanguage('de');
        result.current.setLanguage('de');
      });

      expect(result.current.currentLanguage).toBe('de');
    });

    it('should handle empty availableTranslations', () => {
      const { result } = renderHook(() =>
        useGuestLanguage({
          ...defaultOptions,
          availableTranslations: [],
        })
      );

      expect(result.current.hasTranslation('fr')).toBe(false);
    });
  });
});
```

3. **Run tests and verify passing**
   ```bash
   npm run test -- useGuestLanguage
   ```

#### Acceptance Criteria:
- [ ] Test file created at specified location
- [ ] All initialization tests pass
- [ ] All toggle tests pass
- [ ] All language change tests pass
- [ ] All hasTranslation tests pass
- [ ] All edge case tests pass
- [ ] Test coverage > 90% for hook

#### Files to Create:
| File | Purpose |
|------|---------|
| `/src/hooks/__tests__/useGuestLanguage.test.ts` | Hook integration tests |

---

### TASK 358.5: Execute Manual E2E Test - Translated Content Display

**Objective:** Verify translated content displays correctly across all content types.

**Story Points:** 1

#### Test Environment Setup:

```markdown
**Prerequisites:**
- Environment URL: https://faqbnb-staging.up.railway.app
- Test item publicId: [OBTAIN_FROM_DATABASE]
- Translations required:
  - French (fr): Complete translation of item, articles, links
  - German (de): Complete translation of item, articles, links
- Browser: Chrome/Firefox (latest)
- Clear all cookies before starting
```

#### Test Cases to Execute:

##### TC-358-5A: Full Translation Display (French)

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Clear all cookies | Cookies cleared | |
| 2 | Navigate to `/item/[publicId]?lang=fr` | Page loads | |
| 3 | Check item name | Displays in French | |
| 4 | Check item description | Displays in French | |
| 5 | Check article titles | Display in French | |
| 6 | Check article descriptions | Display in French | |
| 7 | Check link titles | Display in French | |
| 8 | Check TranslationBanner | Shows "Translated from English" | |
| 9 | Check language switcher | French is selected | |

##### TC-358-5B: Full Translation Display (German)

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/item/[publicId]?lang=de` | Page loads | |
| 2 | Check item name | Displays in German | |
| 3 | Check item description | Displays in German | |
| 4 | Check all articles | Display in German | |
| 5 | Check all links | Display in German | |
| 6 | Check TranslationBanner | Shows "Translated from English" | |

##### TC-358-5C: All Content Types Verification

| Content Type | Field | Expected Language | Verified |
|--------------|-------|-------------------|----------|
| Item | name | French | |
| Item | description | French | |
| Article 1 | title | French | |
| Article 1 | description | French | |
| Article 2 | title | French | |
| Article 2 | description | French | |
| Link 1 | title | French | |
| Link 2 | title | French | |
| Tag 1 | displayValue | French (if translated) | |

#### Acceptance Criteria:
- [ ] TC-358-5A all steps pass
- [ ] TC-358-5B all steps pass
- [ ] TC-358-5C all content types verified
- [ ] No console errors during testing
- [ ] Results documented in test results file

#### Files to Modify:
| File | Purpose |
|------|---------|
| `/docs/testing/results/L10N-Content-Display-Test-Results.md` | Record test results |

---

### TASK 358.6: Execute Manual E2E Test - Original Content Fallback

**Objective:** Verify original content displays gracefully when translations are missing.

**Story Points:** 1

#### Test Cases to Execute:

##### TC-358-6A: No Translation Available (Italian)

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Clear all cookies | Cookies cleared | |
| 2 | Navigate to `/item/[publicId]?lang=it` | Page loads | |
| 3 | Check item content | Displays in English (original) | |
| 4 | Check for MissingTranslationBanner | Banner shows "Italian translation not available" | |
| 5 | Check all content | No blank areas or errors | |
| 6 | Check language switcher | Italian selected (possibly grayed) | |
| 7 | Open browser console | No JavaScript errors | |

##### TC-358-6B: Translation Failed State

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to item with failed translation | Page loads | |
| 2 | Request failed translation language | Original content shown | |
| 3 | Check UI | No error messages visible to user | |
| 4 | Verify graceful fallback | Content readable and complete | |

##### TC-358-6C: Source Language Selection (English)

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/item/[publicId]?lang=en` | Page loads | |
| 2 | Check content | Displays in English | |
| 3 | Check for TranslationBanner | No banner shown | |
| 4 | Check "View Original" toggle | Hidden or disabled | |

##### TC-358-6D: Error Handling Verification

| Check | Expected Result | Pass/Fail |
|-------|-----------------|-----------|
| Console errors | None | |
| Network errors (404, 500) | None | |
| Blank content areas | None | |
| Stuck loading spinners | None | |
| Broken layouts | None | |

#### Acceptance Criteria:
- [ ] TC-358-6A all steps pass
- [ ] TC-358-6B all steps pass
- [ ] TC-358-6C all steps pass
- [ ] TC-358-6D all checks pass
- [ ] No JavaScript errors in any test case
- [ ] Results documented in test results file

#### Files to Modify:
| File | Purpose |
|------|---------|
| `/docs/testing/results/L10N-Content-Display-Test-Results.md` | Record test results |

---

### TASK 358.7: Execute Manual E2E Test - View Original Toggle

**Objective:** Verify the View Original toggle provides instant switching between translated and original content.

**Story Points:** 1

#### Test Cases to Execute:

##### TC-358-7A: Toggle to Original Content

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/item/[publicId]?lang=fr` | French content shown | |
| 2 | Verify toggle visible | "View Original" button shown | |
| 3 | Click "View Original" | Content switches instantly | |
| 4 | Verify URL | No page reload (URL same) | |
| 5 | Check all content | All content now in English | |
| 6 | Check toggle text | Now shows "View Translation" | |
| 7 | Check TranslationBanner | Updated or hidden | |

##### TC-358-7B: Toggle Back to Translation

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Starting from original (after TC-7A) | English content shown | |
| 2 | Click "View Translation" | Content switches instantly | |
| 3 | Verify all content | All content back in French | |
| 4 | Check toggle text | Now shows "View Original" | |

##### TC-358-7C: Toggle State Persistence (Navigation)

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to item with French | French content shown | |
| 2 | Click "View Original" | Switches to English | |
| 3 | Scroll down to articles | Toggle state maintained | |
| 4 | Scroll back to top | Still showing original | |
| 5 | Return to top of page | Original content still shown | |

##### TC-358-7D: Toggle When Translation Missing

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/item/[publicId]?lang=it` | Original shown | |
| 2 | Check toggle state | Disabled/hidden or showing original | |
| 3 | Attempt to click toggle (if visible) | No change occurs | |
| 4 | Content remains | Original content unchanged | |

##### TC-358-7E: Rapid Toggle Stress Test

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to translated content | French shown | |
| 2 | Click toggle 5 times rapidly | UI remains stable | |
| 3 | Final state | Matches expected (odd=original, even=translated) | |
| 4 | Check for UI glitches | None visible | |
| 5 | Check console | No errors | |

##### TC-358-7F: Toggle Accessibility

| Check | Expected Result | Pass/Fail |
|-------|-----------------|-----------|
| Keyboard navigation (Tab) | Toggle receives focus | |
| Enter key activation | Toggle activates | |
| Screen reader announcement | Appropriate ARIA attributes | |
| Focus visible | Clear focus indicator | |

#### Acceptance Criteria:
- [ ] TC-358-7A all steps pass
- [ ] TC-358-7B all steps pass
- [ ] TC-358-7C all steps pass
- [ ] TC-358-7D all steps pass
- [ ] TC-358-7E all steps pass
- [ ] TC-358-7F all checks pass
- [ ] Toggle switches content in < 100ms
- [ ] Results documented in test results file

#### Files to Modify:
| File | Purpose |
|------|---------|
| `/docs/testing/results/L10N-Content-Display-Test-Results.md` | Record test results |

---

### TASK 358.8: Execute Manual E2E Test - Language Switcher Updates

**Objective:** Verify the language switcher dynamically updates all content when language is changed.

**Story Points:** 1

#### Test Cases to Execute:

##### TC-358-8A: Switch to Available Language

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `/item/[publicId]` | Default language shown | |
| 2 | Open language switcher | All 6 languages visible | |
| 3 | Verify available indicators | French, German show checkmarks/available | |
| 4 | Select "Français" (French) | All content updates to French | |
| 5 | Verify TranslationBanner | Appears with correct text | |
| 6 | Verify View Original toggle | Appears | |
| 7 | Verify no page reload | Scroll position maintained | |

##### TC-358-8B: Switch to Unavailable Language

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Open language switcher | All languages visible | |
| 2 | Note Italian (no translation) | May be grayed but selectable | |
| 3 | Select "Italiano" | Content shows in English | |
| 4 | Verify MissingTranslationBanner | Shows appropriate message | |
| 5 | Verify View Original toggle | Disabled or hidden | |

##### TC-358-8C: Switch Back to Original Language

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | From French translation | French content shown | |
| 2 | Open language switcher | English available | |
| 3 | Select "English" | Content shows in English | |
| 4 | Verify TranslationBanner | Not shown | |
| 5 | Verify View Original toggle | Not shown | |

##### TC-358-8D: Rapid Language Switching

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to item page | Page loaded | |
| 2 | Switch: en → fr → de → es → en | Each change applies | |
| 3 | Final state | English content shown | |
| 4 | Check for stuck states | None | |
| 5 | Check console | No errors | |

##### TC-358-8E: Language Switch with Toggle Active

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to French translation | French shown | |
| 2 | Click "View Original" | English shown via toggle | |
| 3 | Open language switcher | Can still switch | |
| 4 | Select German | German content shown | |
| 5 | Toggle state | Reset to showing translation | |
| 6 | View Original toggle | Available again | |

##### TC-358-8F: Cookie Persistence

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Switch language to French | French shown | |
| 2 | Open DevTools > Application > Cookies | Find FAQBNB_GUEST_LANG | |
| 3 | Verify cookie value | "fr" | |
| 4 | Refresh page | French still shown | |
| 5 | Navigate to different item | French preference maintained | |

##### TC-358-8G: Content Update Completeness

| Content Element | Updates on Language Switch | Verified |
|-----------------|---------------------------|----------|
| Item name | Yes | |
| Item description | Yes | |
| All article titles | Yes | |
| All article descriptions | Yes | |
| All link titles | Yes | |
| TranslationBanner text | Yes | |
| Language switcher selection | Yes | |

#### Acceptance Criteria:
- [ ] TC-358-8A all steps pass
- [ ] TC-358-8B all steps pass
- [ ] TC-358-8C all steps pass
- [ ] TC-358-8D all steps pass
- [ ] TC-358-8E all steps pass
- [ ] TC-358-8F all steps pass
- [ ] TC-358-8G all elements update correctly
- [ ] Language switch completes in < 200ms
- [ ] Results documented in test results file

#### Files to Modify:
| File | Purpose |
|------|---------|
| `/docs/testing/results/L10N-Content-Display-Test-Results.md` | Record test results |

---

### TASK 358.9: Execute Edge Case and Performance Tests

**Objective:** Validate edge cases and verify performance meets requirements.

**Story Points:** 1

#### Edge Case Test Cases:

##### TC-358-9A: Partial Translation

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to item with partial Spanish translation | Page loads | |
| 2 | Check translated fields | Spanish where available | |
| 3 | Check untranslated fields | English (original) | |
| 4 | Verify no visual inconsistencies | Smooth mixed content | |
| 5 | Check banner | May indicate mixed state | |

##### TC-358-9B: Empty Translation Fields

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | If translation record exists but field empty | Original shown for that field | |
| 2 | No blank content | Content always displayed | |
| 3 | No errors | Graceful handling | |

##### TC-358-9C: Malformed Language Parameter

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to `?lang=xyz` | Page loads | |
| 2 | Content shown | Fallback to original | |
| 3 | No error page | Graceful handling | |

##### TC-358-9D: Multiple Items/Articles Display

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | View item with 3+ articles | All display correctly | |
| 2 | Switch language | All update together | |
| 3 | Toggle View Original | All switch simultaneously | |

#### Performance Test Cases:

##### TC-358-9E: Performance Metrics

| Metric | Target | Measured | Pass/Fail |
|--------|--------|----------|-----------|
| Language detection | < 10ms | | |
| Content toggle (View Original) | < 100ms | | |
| Language switch | < 200ms | | |
| Initial page load with translation | < 500ms (after DNS) | | |

##### TC-358-9F: Performance Measurement Steps

| Step | Action | How to Measure |
|------|--------|----------------|
| 1 | Open DevTools > Performance | Start recording |
| 2 | Click View Original toggle | Note time for content swap |
| 3 | Open DevTools > Network | Clear, then switch language |
| 4 | Measure API response time | Note timing in Network tab |
| 5 | Verify no visible delay | Subjective assessment |

#### Mobile Responsiveness Tests:

##### TC-358-9G: Mobile Device Testing

| Check | Device/Viewport | Expected Result | Pass/Fail |
|-------|-----------------|-----------------|-----------|
| Language switcher | 375px width | Accessible, not clipped | |
| Translation banner | 375px width | Text readable, wraps properly | |
| View Original toggle | 375px width | Tap target adequate (44x44px min) | |
| Content layout | 375px width | No horizontal scroll | |

#### Acceptance Criteria:
- [ ] TC-358-9A all steps pass
- [ ] TC-358-9B graceful empty field handling
- [ ] TC-358-9C malformed parameter handled
- [ ] TC-358-9D multiple items work correctly
- [ ] TC-358-9E all performance metrics met
- [ ] TC-358-9G mobile tests pass
- [ ] Results documented in test results file

#### Files to Modify:
| File | Purpose |
|------|---------|
| `/docs/testing/results/L10N-Content-Display-Test-Results.md` | Record test results |

---

### TASK 358.10: Create Final Test Summary and Sign-off

**Objective:** Compile all test results, document issues found, and prepare sign-off.

**Story Points:** 1

#### Steps:

1. **Compile Test Results**
   - Gather all Pass/Fail results from Tasks 358.5-358.9
   - Calculate pass rate percentage
   - List all failed test cases

2. **Document Issues Found**
   - Create issue entries for any failures
   - Categorize by severity (Critical/High/Medium/Low)
   - Include reproduction steps

3. **Create Test Summary Report**
   - File: `/docs/testing/results/REQ-358-Final-Summary.md`
   - Include:
     - Overall pass/fail statistics
     - Coverage summary
     - Issues table
     - Screenshots (if applicable)
     - Sign-off section

4. **Update Overview Document**
   - Add testing completion status to REQ-358 overview
   - Reference final summary report

#### Test Summary Template:

```markdown
# REQ-358: Test Content Display Scenarios - Final Summary

**Execution Date:** [DATE]
**Executed By:** [NAME]
**Environment:** https://faqbnb-staging.up.railway.app

## Summary Statistics

| Category | Total Tests | Passed | Failed | Blocked |
|----------|-------------|--------|--------|---------|
| Translated Content Display | X | X | X | X |
| Original Content Fallback | X | X | X | X |
| View Original Toggle | X | X | X | X |
| Language Switcher Updates | X | X | X | X |
| Edge Cases | X | X | X | X |
| Performance | X | X | X | X |
| **Total** | **XX** | **XX** | **XX** | **XX** |

**Overall Pass Rate:** XX%

## Issues Found

| Issue ID | Severity | Summary | Test Case | Status |
|----------|----------|---------|-----------|--------|
| | | | | |

## Acceptance Criteria Status

- [x] Translated content displays correctly when translation exists
- [x] All translatable fields show translated versions consistently
- [x] Original content displays properly when no translation exists
- [x] Missing translations do not cause errors
- [x] "View Original" toggle switches instantly
- [x] Toggle state persists during navigation
- [x] Toggle works when translation missing
- [x] Language switcher updates all content
- [x] Content update without page reload
- [x] Language change applies to all elements
- [x] Switching to unavailable language handled gracefully
- [x] All content types tested
- [x] Edge cases validated
- [x] Performance validated
- [x] Test scenarios documented

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Tester | | | |
| Developer | | | |
| Product Owner | | | |
```

#### Acceptance Criteria:
- [ ] All test results compiled
- [ ] Issues documented and categorized
- [ ] Final summary report created
- [ ] Pass rate meets minimum threshold (>95%)
- [ ] Sign-off sections completed
- [ ] Overview document updated

#### Files to Create:
| File | Purpose |
|------|---------|
| `/docs/testing/results/REQ-358-Final-Summary.md` | Final test summary and sign-off |

#### Files to Modify:
| File | Purpose |
|------|---------|
| `/docs/REQ-358-test-content-display-scenarios-overview.md` | Add testing completion status |

---

## 4. Task Summary

| Task ID | Title | Story Points | Dependencies |
|---------|-------|--------------|--------------|
| 358.1 | Create Test Documentation Structure | 1 | None |
| 358.2 | Write ViewOriginalToggle Component Unit Tests | 1 | ViewOriginalToggle component exists |
| 358.3 | Write TranslationBanner Component Unit Tests | 1 | TranslationBanner component exists |
| 358.4 | Write useGuestLanguage Hook Integration Tests | 1 | useGuestLanguage hook exists |
| 358.5 | Execute Manual E2E Test - Translated Content Display | 1 | 358.1, Components integrated |
| 358.6 | Execute Manual E2E Test - Original Content Fallback | 1 | 358.1, Components integrated |
| 358.7 | Execute Manual E2E Test - View Original Toggle | 1 | 358.1, Components integrated |
| 358.8 | Execute Manual E2E Test - Language Switcher Updates | 1 | 358.1, Components integrated |
| 358.9 | Execute Edge Case and Performance Tests | 1 | 358.5-358.8 |
| 358.10 | Create Final Test Summary and Sign-off | 1 | 358.2-358.9 |

**Total Story Points:** 10

---

## 5. Acceptance Criteria Mapping

| Requirement | Task(s) |
|-------------|---------|
| Translated content displays correctly | 358.5 |
| All translatable fields show translated versions | 358.5 |
| Original content displays properly when no translation | 358.6 |
| Missing translations do not cause errors | 358.6 |
| "View Original" toggle switches instantly | 358.2, 358.7 |
| Toggle state persists during navigation | 358.7 |
| Toggle works when translation missing | 358.7 |
| Language switcher updates all content | 358.8 |
| Content update without page reload | 358.7, 358.8 |
| Language change applies to all elements | 358.8 |
| Switching to unavailable language handled | 358.8 |
| All content types tested | 358.5, 358.9 |
| Edge cases validated | 358.9 |
| Performance validated | 358.9 |
| Test scenarios documented | 358.1, 358.10 |

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Components not yet implemented | Verify prerequisites before starting |
| No test data in database | Seed translations before testing |
| Staging environment unavailable | Test on local development |
| Flaky tests due to timing | Add appropriate waits/retries |
| Incomplete coverage | Use checklist to verify all scenarios |

---

## 7. References

- Overview Document: `/docs/REQ-358-test-content-display-scenarios-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-358)
- Related REQs: REQ-345-350 (Guest Components), REQ-352 (Guest Item Page Update), REQ-357 (Language Detection Tests)

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 7: Testing & Polish*
*Last Modified: 2026-01-19*
