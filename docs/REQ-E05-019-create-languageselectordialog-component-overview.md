# Implementation Breakdown: Create LanguageSelectorDialog Component (REQ-E05-019)

**Generated:** 2026-01-22 19:54:53 CET
**Status:** PENDING
**Request ID:** REQ-E05-019
**Phase:** 4 - Bulk Operations & Management Page
**Task ID:** 4.2
**Size:** S (Small)
**Epic:** L10N Epic 5 - Owner Translation Management

---

## Overview

This document provides the implementation breakdown for creating the **LanguageSelectorDialog** component - a modal dialog for selecting multiple target languages for bulk translation operations. The dialog provides a checkbox-based interface with language flags, Select All/Deselect All shortcuts, and a smart confirm button that shows the selection count.

**Key Implementation Points:**
- Modal dialog using `@radix-ui/react-dialog` (already installed)
- Checkbox list of 6 supported languages (es, fr, de, it, nl, pt)
- Flag emoji display for visual language identification
- Select All / Deselect All toggle buttons
- Confirm button displays count: "Confirm (3 selected)"
- Confirm button disabled when no languages selected
- Keyboard navigation and screen reader support
- Escape key to cancel, Enter to confirm when enabled

---

## Request Analysis

### From gen_requests_epic5.md (Lines 2812-3060)

**Title:** Create LanguageSelectorDialog component

**Description:**
Modal for selecting languages for bulk re-translate. Checkbox list of languages with Select All / Deselect All functionality.

**Acceptance Criteria:**
1. ✅ Dialog opens with `isOpen` prop
2. ✅ Shows checkbox for each target language (6 languages)
3. ✅ Flag emoji displayed next to each language name
4. ✅ Select All button checks all languages
5. ✅ Deselect All button unchecks all languages
6. ✅ Confirm button shows count (e.g., "Confirm (3 selected)")
7. ✅ Confirm button disabled when selection is empty
8. ✅ Cancel button closes dialog without changes
9. ✅ Dialog closes on confirm, passes selected languages to `onConfirm`
10. ✅ Keyboard accessible (Enter to confirm, Escape to cancel)
11. ✅ Screen reader announces selection count changes
12. ✅ Focus trap within dialog

**Technical Requirements:**
```typescript
interface LanguageSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedLanguages: SupportedLanguage[]) => void;
  initialSelection?: SupportedLanguage[];
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}
```

**Target File:**
`/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`

---

## Technical Context

### Dependencies from Plan-111-L10N-Epic5

**Existing Patterns (Lines 40-53):**
- Modal/Drawer: `ItemPreviewModal.tsx` - Base pattern for modals
- Dialog: `@radix-ui/react-dialog` - Confirmation dialogs
- Inline Edit: `InlineEdit.tsx` - Inline editing pattern
- Tag Chips: `TagChip.tsx` - Status indicators

**Required Dependencies from Epic 1:**
- Translation tables: `article_translations`, `item_translations`, etc.
- Translation service: `/src/lib/translation-service/`
- Language types: `SupportedLanguage` type

### Supported Languages Investigation

From `translation-service.types.ts` (Line 22):
```typescript
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

**Target Languages (excluding 'en' source):**
- `es` - Spanish 🇪🇸
- `fr` - French 🇫🇷
- `de` - German 🇩🇪
- `nl` - Dutch 🇳🇱
- `it` - Italian 🇮🇹
- `pt` - Portuguese 🇵🇹

**NOTE:** There is a language inconsistency discovered across Epic 5 specs:
- `translation-service.types.ts` defines: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'` (6 languages)
- REQ-E05-019 spec mentions: es, fr, de, it, nl, pt (6 languages)
- **Difference:** `it` (Italian) vs `pt` (Portuguese)

**Resolution:** Use the **source of truth** from `translation-service.types.ts`:
```typescript
const TARGET_LANGUAGES: SupportedLanguage[] = ['es', 'fr', 'de', 'nl', 'it'];
```

### Existing Dialog Patterns

**Pattern 1: ConfirmDeleteDialog** (`src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`)
```typescript
// Custom dialog implementation (NOT using Radix Dialog)
// Lines 193-210: Fixed positioning, backdrop, keyboard handling
<div
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  onClick={handleBackdropClick}
  onKeyDown={handleKeyDown}
  role="alertdialog"
  aria-modal="true"
>
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
    {/* Content */}
  </div>
</div>
```

**Pattern 2: BulkMoveDialog** (`src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`)
- Uses custom dialog (NOT Radix)
- Focus trap implementation (Line 25): `useFocusTrap` hook
- Keyboard navigation
- Loading states with spinner

**Pattern 3: BulkTagDialog** (`src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`)
- Uses custom dialog (NOT Radix)
- Checkbox interaction patterns
- Tag chips for visual feedback
- Focus management

**Key Insight:** Despite `@radix-ui/react-dialog` being installed (package.json line 27), existing bulk action dialogs use **custom implementations** with manual focus traps. This suggests we should follow the established pattern rather than introducing Radix Dialog for consistency.

### Package Investigation

From `package.json` (Line 27):
```json
"@radix-ui/react-dialog": "^1.1.14"
```

**Installed Radix packages:**
- `@radix-ui/react-collapsible`: ^1.1.12
- `@radix-ui/react-dialog`: ^1.1.14 ✅
- `@radix-ui/react-dropdown-menu`: ^2.1.15
- `@radix-ui/react-toast`: ^1.2.14
- `@radix-ui/react-tooltip`: ^1.2.8

**NOT installed:**
- `@radix-ui/react-checkbox` ❌
- `@radix-ui/react-select` ❌

---

## Key Technical Decisions

### 5.1 Dialog Implementation: Custom vs Radix

**Decision:** Use **custom dialog implementation** (NOT Radix Dialog)

**Rationale:**
1. **Consistency:** All existing bulk action dialogs (BulkMoveDialog, BulkTagDialog) use custom implementations
2. **Pattern established:** Focus trap hook (`useFocusTrap`) already exists and is used
3. **Zero new dependencies:** Custom approach requires no additional packages
4. **Proven pattern:** Custom dialog works well in production code

**Trade-offs:**
- ✅ Maintains consistency with existing code
- ✅ No new dependencies or bundle size increase
- ✅ Team already familiar with pattern
- ⚠️ More boilerplate than Radix (backdrop, keyboard handling, etc.)
- ⚠️ Must manually implement accessibility features

### 5.2 Checkbox Implementation: Native vs Radix

**Decision:** Use **native HTML checkboxes** with custom styling

**Rationale:**
1. **Package not installed:** `@radix-ui/react-checkbox` is not in package.json
2. **Avoid new dependency:** Native checkboxes work fine for this use case
3. **Simpler implementation:** Less abstraction, easier to style
4. **Pattern precedent:** Other forms in codebase use native inputs

**Implementation:**
```typescript
<input
  type="checkbox"
  id={`lang-${language}`}
  checked={selectedLanguages.includes(language)}
  onChange={() => handleToggleLanguage(language)}
  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  aria-label={t(`languages.${language}`)}
/>
```

### 5.3 Language Flag Display

**Decision:** Use **Unicode emoji flags** (not image assets or icon libraries)

**Rationale:**
1. **Zero dependencies:** Emojis are native Unicode characters
2. **Consistent rendering:** Modern browsers render emoji flags well
3. **Accessibility:** Can be hidden from screen readers with `aria-hidden="true"`
4. **No HTTP requests:** No external assets to load

**Implementation:**
```typescript
const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  nl: '🇳🇱',
  it: '🇮🇹',
  pt: '🇵🇹', // If Portuguese is used
  en: '🇬🇧', // For completeness
};
```

### 5.4 Selection State Management

**Decision:** Use **local React state** with `useState`

**Rationale:**
1. **Simple state:** Array of selected languages
2. **No persistence:** Selection is temporary (modal lifecycle)
3. **No side effects:** State doesn't need to sync with external systems
4. **Performance:** Small array (max 6 items), no optimization needed

**Implementation:**
```typescript
const [selectedLanguages, setSelectedLanguages] = useState<SupportedLanguage[]>(
  initialSelection || []
);
```

### 5.5 Focus Trap Implementation

**Decision:** Use existing **`useFocusTrap` hook** from `a11yUtils`

**Source:** `/src/components/ItemManager/utils/a11yUtils.tsx`

**Rationale:**
1. **Already exists:** Hook is proven and tested
2. **Consistent:** BulkMoveDialog and BulkTagDialog use it
3. **Accessible:** Handles keyboard navigation correctly

**Usage:**
```typescript
import { useFocusTrap } from '../../ItemManager/utils/a11yUtils';

const dialogRef = useRef<HTMLDivElement>(null);
useFocusTrap(dialogRef, isOpen);
```

---

## Implementation Steps

### Phase 1: Component Setup (Steps 1-3)

**Step 1:** Create component file and basic structure
- **File:** `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx`
- **Action:** Create new file with TypeScript strict mode
- **Imports needed:**
  ```typescript
  import React, { useState, useRef, useEffect, useId } from 'react';
  import { X, Check, Globe, Loader2 } from 'lucide-react';
  import { useTranslations } from 'next-intl';
  import { cn } from '@/lib/utils';
  import { useFocusTrap } from '../../ItemManager/utils/a11yUtils';
  import type { SupportedLanguage } from '@/lib/translation-service';
  ```

**Step 2:** Define types and constants
- **Types:**
  ```typescript
  export interface LanguageSelectorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedLanguages: SupportedLanguage[]) => void;
    initialSelection?: SupportedLanguage[];
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    className?: string;
  }
  ```
- **Constants:**
  ```typescript
  // Exclude 'en' (source language) from target languages
  const TARGET_LANGUAGES: SupportedLanguage[] = ['es', 'fr', 'de', 'nl', 'it'];

  const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
    en: '🇬🇧',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    nl: '🇳🇱',
    it: '🇮🇹',
  };
  ```

**Step 3:** Set up component state and refs
- Initialize `selectedLanguages` state with `initialSelection` or empty array
- Create `dialogRef` for focus trap
- Set up `titleId` and `descriptionId` with `useId()` for ARIA

### Phase 2: Dialog Structure (Steps 4-6)

**Step 4:** Implement backdrop and dialog container
- Fixed positioning: `fixed inset-0 z-50`
- Semi-transparent backdrop: `bg-black bg-opacity-50`
- Center content: `flex items-center justify-center`
- Handle backdrop click to close (only when not in initialSelection mode)
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`

**Step 5:** Create dialog header
- Title with icon (Globe icon from lucide-react)
- Close button (X icon) in top-right corner
- Description text explaining the selection purpose
- **Pattern reference:** BulkMoveDialog.tsx header structure

**Step 6:** Implement focus trap and keyboard handlers
- Apply `useFocusTrap(dialogRef, isOpen)`
- `onKeyDown` handler:
  - **Escape:** Call `onClose()` (cancel)
  - **Enter:** Call `handleConfirm()` (if enabled)
- Prevent default browser behavior

### Phase 3: Language Selection UI (Steps 7-10)

**Step 7:** Create language checkbox list
- Map over `TARGET_LANGUAGES` array
- For each language:
  ```typescript
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
    <input
      type="checkbox"
      id={`lang-${language}`}
      checked={selectedLanguages.includes(language)}
      onChange={() => handleToggleLanguage(language)}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      aria-label={t(`languages.${language}`)}
    />
    <label htmlFor={`lang-${language}`} className="flex items-center gap-2 flex-1 cursor-pointer">
      <span className="text-2xl" aria-hidden="true">
        {LANGUAGE_FLAGS[language]}
      </span>
      <span className="text-sm font-medium text-gray-700">
        {t(`languages.${language}`)}
      </span>
    </label>
  </div>
  ```
- **Accessibility:** Each checkbox has `aria-label` with language name

**Step 8:** Implement toggle handlers
- `handleToggleLanguage(language: SupportedLanguage)`:
  ```typescript
  const handleToggleLanguage = (language: SupportedLanguage) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };
  ```
- Announce changes to screen readers using live region

**Step 9:** Create Select All / Deselect All buttons
- **Select All:** Sets `selectedLanguages` to `TARGET_LANGUAGES`
- **Deselect All:** Sets `selectedLanguages` to `[]`
- Button layout:
  ```typescript
  <div className="flex gap-2 mb-4">
    <button
      type="button"
      onClick={handleSelectAll}
      className="text-sm text-blue-600 hover:underline"
    >
      {t('translation.selectAll')}
    </button>
    <span className="text-gray-400">|</span>
    <button
      type="button"
      onClick={handleDeselectAll}
      className="text-sm text-blue-600 hover:underline"
    >
      {t('translation.deselectAll')}
    </button>
  </div>
  ```

**Step 10:** Add selection count live region
- ARIA live region for screen reader announcements
- Updates when `selectedLanguages.length` changes
- Example:
  ```typescript
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  >
    {t('translation.selectedCount', { count: selectedLanguages.length })}
  </div>
  ```

### Phase 4: Action Buttons (Steps 11-13)

**Step 11:** Create Cancel button
- Standard secondary button styling
- Always enabled
- Calls `onClose()` when clicked
- Pattern: BulkTagDialog Cancel button (lines 260-271)

**Step 12:** Create Confirm button with dynamic text
- Primary button styling (blue background)
- **Disabled state:** When `selectedLanguages.length === 0`
- **Button text:** Shows count when languages are selected
  ```typescript
  const confirmButtonText = selectedLanguages.length > 0
    ? confirmText || t('translation.confirmWithCount', { count: selectedLanguages.length })
    : confirmText || t('common.actions.confirm');
  ```
- Example outputs:
  - 0 selected: "Confirm" (disabled)
  - 1 selected: "Confirm (1 selected)"
  - 3 selected: "Confirm (3 selected)"

**Step 13:** Implement confirm handler
- `handleConfirm()`:
  ```typescript
  const handleConfirm = () => {
    if (selectedLanguages.length === 0) return;
    onConfirm(selectedLanguages);
  };
  ```
- Only proceeds if at least one language is selected

### Phase 5: Styling & Polish (Steps 14-15)

**Step 14:** Apply Tailwind styling
- **Dialog container:**
  - `max-w-md w-full mx-4` - Responsive width with margins
  - `bg-white rounded-lg shadow-xl` - Card styling
  - `animate-in fade-in zoom-in-95 duration-200` - Entrance animation
  - `motion-reduce:animate-in motion-reduce:fade-in motion-reduce:duration-100` - Respect motion preferences
- **Checkbox states:**
  - Checked: Blue background (`checked:bg-blue-600`)
  - Focus: Ring (`focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`)
  - Hover: Lighter background on row (`hover:bg-gray-50`)
- **Button states:**
  - Primary (Confirm): `bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`
  - Secondary (Cancel): `bg-gray-100 hover:bg-gray-200`

**Step 15:** Add motion-reduce support
- Respect `prefers-reduced-motion` for all animations
- Fallback to simple fade for users with motion sensitivity
- Example:
  ```css
  animate-in fade-in zoom-in-95 duration-200
  motion-reduce:animate-in motion-reduce:fade-in motion-reduce:duration-100
  ```

### Phase 6: Internationalization (Step 16)

**Step 16:** Add translation keys
- **File:** `/messages/en.json`
- **Namespace:** `translation.languageSelector.*`
- **Keys needed:**
  ```json
  {
    "translation": {
      "languageSelector": {
        "title": "Select Languages",
        "description": "Choose target languages for translation",
        "selectAll": "Select All",
        "deselectAll": "Deselect All",
        "confirmWithCount": "Confirm ({count} selected)",
        "selectedCount": "{count} languages selected",
        "noLanguagesSelected": "No languages selected"
      },
      "languages": {
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "nl": "Dutch",
        "it": "Italian",
        "pt": "Portuguese"
      }
    }
  }
  ```

### Phase 7: Testing & Integration (Step 17)

**Step 17:** Create barrel export
- **File:** `/src/components/TranslationManagement/BulkTranslationBar/index.ts`
- **Update to include:**
  ```typescript
  export { LanguageSelectorDialog } from './LanguageSelectorDialog';
  export type { LanguageSelectorDialogProps } from './LanguageSelectorDialog';
  ```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose | Size Est. |
|-----------|---------|-----------|
| `/src/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog.tsx` | Main component implementation | ~280 lines |

### Files to Modify

| File Path | Lines to Modify | Modification Type | Justification |
|-----------|----------------|-------------------|---------------|
| `/src/components/TranslationManagement/BulkTranslationBar/index.ts` | Add new export | Add 2 lines | Export new component |
| `/messages/en.json` | `translation.languageSelector.*` | Add ~15 lines | i18n strings |

### Functions/Components to Reference (READ ONLY)

| File Path | Reference | Purpose |
|-----------|-----------|---------|
| `/src/components/ItemManager/utils/a11yUtils.tsx` | `useFocusTrap` | Focus trap hook |
| `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | Full component | Dialog pattern reference |
| `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | Full component | Checkbox interaction pattern |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Full component | Custom dialog structure |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type | Type import |

### Dependencies to Import

```typescript
// React
import React, { useState, useRef, useEffect, useId } from 'react';

// Icons
import { X, Check, Globe } from 'lucide-react';

// i18n
import { useTranslations } from 'next-intl';

// Utils
import { cn } from '@/lib/utils';

// Types
import type { SupportedLanguage } from '@/lib/translation-service';

// Hooks
import { useFocusTrap } from '../../ItemManager/utils/a11yUtils';
```

---

## Integration Points

### 1. BulkTranslationBar Component

**File:** `/src/components/TranslationManagement/BulkTranslationBar/BulkTranslationBar.tsx`

**Usage:**
```typescript
import { LanguageSelectorDialog } from './LanguageSelectorDialog';

const [showLanguageDialog, setShowLanguageDialog] = useState(false);
const [selectedLanguages, setSelectedLanguages] = useState<SupportedLanguage[]>([]);

const handleReTranslate = () => {
  setShowLanguageDialog(true);
};

const handleLanguageConfirm = (languages: SupportedLanguage[]) => {
  setSelectedLanguages(languages);
  setShowLanguageDialog(false);
  // Trigger re-translation for selected languages
  triggerReTranslation(selectedItemIds, languages);
};

return (
  <>
    <button onClick={handleReTranslate}>Re-translate</button>

    <LanguageSelectorDialog
      isOpen={showLanguageDialog}
      onClose={() => setShowLanguageDialog(false)}
      onConfirm={handleLanguageConfirm}
      initialSelection={selectedLanguages}
    />
  </>
);
```

### 2. Translation Management Page

**File:** `/src/app/dashboard2/translations/page.tsx`

**Usage:** Can be triggered from individual item actions or bulk operations

---

## Risk Analysis

### Risk 1: Language List Inconsistency
**Severity:** HIGH
**Description:** TypeScript types define `'it'` (Italian), but some specs mention `'pt'` (Portuguese)
**Mitigation:**
- Use `translation-service.types.ts` as source of truth
- Document the decision in code comments
- Flag for team discussion if Portuguese support is required

### Risk 2: Focus Trap Conflicts
**Severity:** MEDIUM
**Description:** Multiple dialogs open simultaneously could conflict with focus management
**Mitigation:**
- Only one dialog should be open at a time
- BulkTranslationBar should manage dialog state to prevent conflicts
- Close other dialogs before opening language selector

### Risk 3: Checkbox State Synchronization
**Severity:** LOW
**Description:** Initial selection might not match current state
**Mitigation:**
- Use `useEffect` to sync initial selection when dialog opens
- Reset state when dialog closes
- Clear implementation:
  ```typescript
  useEffect(() => {
    if (isOpen && initialSelection) {
      setSelectedLanguages(initialSelection);
    }
  }, [isOpen, initialSelection]);
  ```

### Risk 4: Mobile Touch Targets
**Severity:** LOW
**Description:** Checkboxes might be too small on mobile devices
**Mitigation:**
- Entire row is clickable (label wraps content)
- Minimum touch target: 48x48px (following WCAG guidelines)
- Hover states work on desktop, tap states on mobile

### Risk 5: Screen Reader Announcements
**Severity:** MEDIUM
**Description:** Selection changes might not be announced properly
**Mitigation:**
- Use ARIA live region with `role="status"` and `aria-live="polite"`
- Announce count changes: "3 languages selected"
- Test with VoiceOver (macOS) and NVDA (Windows)

---

## Testing Considerations

### Unit Tests (Vitest + Testing Library)

**File:** `LanguageSelectorDialog.test.tsx`

```typescript
describe('LanguageSelectorDialog', () => {
  it('renders when isOpen is true', () => {
    // Test dialog visibility
  });

  it('does not render when isOpen is false', () => {
    // Test conditional rendering
  });

  it('calls onClose when Cancel button is clicked', () => {
    // Test cancel action
  });

  it('calls onConfirm with selected languages', () => {
    // Test confirm action
  });

  it('disables Confirm button when no languages selected', () => {
    // Test disabled state
  });

  it('updates button text with selection count', () => {
    // Test dynamic button text: "Confirm (2 selected)"
  });

  it('selects all languages when Select All is clicked', () => {
    // Test Select All functionality
  });

  it('deselects all languages when Deselect All is clicked', () => {
    // Test Deselect All functionality
  });

  it('toggles individual language selection', () => {
    // Test checkbox interaction
  });

  it('closes dialog on Escape key', () => {
    // Test keyboard interaction
  });

  it('confirms selection on Enter key when enabled', () => {
    // Test keyboard confirmation
  });

  it('initializes with initialSelection prop', () => {
    // Test initial state
  });

  it('announces selection count to screen readers', () => {
    // Test ARIA live region
  });
});
```

### Accessibility Tests

```typescript
describe('LanguageSelectorDialog Accessibility', () => {
  it('has proper ARIA attributes', () => {
    // Test role="dialog", aria-modal, aria-labelledby, aria-describedby
  });

  it('traps focus within dialog', () => {
    // Test focus trap
  });

  it('has accessible checkbox labels', () => {
    // Test aria-label on checkboxes
  });

  it('passes axe accessibility checks', async () => {
    // Run axe-core audit
  });
});
```

### Manual Testing Checklist

- [ ] Dialog opens smoothly with animation
- [ ] Backdrop click closes dialog (if no initial selection)
- [ ] Close button (X) closes dialog
- [ ] All 6 language checkboxes render correctly
- [ ] Flag emojis display properly
- [ ] Select All checks all boxes
- [ ] Deselect All unchecks all boxes
- [ ] Individual checkboxes toggle correctly
- [ ] Confirm button is disabled when no selection
- [ ] Confirm button shows count: "Confirm (3 selected)"
- [ ] Confirm button calls `onConfirm` with correct array
- [ ] Cancel button calls `onClose`
- [ ] Escape key closes dialog
- [ ] Enter key confirms when enabled
- [ ] Tab key cycles through interactive elements
- [ ] Focus returns to trigger element on close
- [ ] Screen reader announces selection changes
- [ ] Works on mobile (touch targets are adequate)
- [ ] Motion-reduce animation works correctly

---

## Performance Considerations

### Optimization Strategies

1. **Minimal Re-renders:**
   - Use `React.memo` if dialog is frequently opened/closed
   - State updates are local (no global context pollution)

2. **Small Data Set:**
   - Maximum 6 checkboxes (TARGET_LANGUAGES)
   - No performance optimization needed for array operations

3. **Lazy Rendering:**
   - Only renders when `isOpen={true}`
   - No DOM nodes created when closed

4. **Animation Performance:**
   - Uses CSS transforms (GPU-accelerated)
   - Respects `prefers-reduced-motion`

**Bundle Size Impact:** ~3-4KB (minified + gzipped)

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Setup | Steps 1-3 | 30 min |
| Phase 2: Dialog Structure | Steps 4-6 | 45 min |
| Phase 3: Language Selection UI | Steps 7-10 | 1 hour |
| Phase 4: Action Buttons | Steps 11-13 | 30 min |
| Phase 5: Styling | Steps 14-15 | 30 min |
| Phase 6: i18n | Step 16 | 15 min |
| Phase 7: Testing | Step 17 | 1 hour |
| **Total** | **17 steps** | **~4.5 hours** |

**Contingency:** +1 hour for unexpected issues (focus trap debugging, mobile testing)

**Final Estimate:** 5-6 hours for full implementation and testing

---

## Dependencies and Blockers

### Required Completions

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | ✅ Completed | Translation tables and types exist |
| Epic 3 Dynamic Translation | ✅ Completed | Translation service APIs available |
| REQ-E05-018 BulkTranslationBar | ⏳ In Progress | This component integrates with BulkTranslationBar |

### External Dependencies

| Dependency | Version | Status |
|------------|---------|--------|
| `@radix-ui/react-dialog` | ^1.1.14 | ✅ Installed (but not used - custom dialog preferred) |
| `lucide-react` | ^0.525.0 | ✅ Installed |
| `next-intl` | ^4.7.0 | ✅ Installed |

**Blockers:** None. All dependencies are available.

---

## Acceptance Criteria Verification

| # | Criterion | Implementation Detail |
|---|-----------|----------------------|
| 1 | Dialog opens with `isOpen` prop | Conditional rendering: `if (!isOpen) return null;` |
| 2 | Shows checkbox for each target language | Maps over `TARGET_LANGUAGES` array (6 languages) |
| 3 | Flag emoji displayed | `LANGUAGE_FLAGS[language]` with `aria-hidden="true"` |
| 4 | Select All button checks all | `setSelectedLanguages(TARGET_LANGUAGES)` |
| 5 | Deselect All button unchecks all | `setSelectedLanguages([])` |
| 6 | Confirm button shows count | `t('confirmWithCount', { count: selectedLanguages.length })` |
| 7 | Confirm disabled when empty | `disabled={selectedLanguages.length === 0}` |
| 8 | Cancel closes without changes | `onClose()` called, state not modified |
| 9 | Confirm passes selected languages | `onConfirm(selectedLanguages)` called |
| 10 | Keyboard accessible | Enter/Escape handlers + focus trap |
| 11 | Screen reader announces count | ARIA live region with `role="status"` |
| 12 | Focus trap active | `useFocusTrap(dialogRef, isOpen)` |

**Status:** All 12 acceptance criteria addressed in implementation plan.

---

## Notes for Agent 03 (Senior Dev - Task Breakdown)

**Implementation Approach:**
- Follow existing custom dialog pattern (BulkMoveDialog, BulkTagDialog) for consistency
- Do NOT use Radix Dialog despite it being installed - team prefers custom implementation
- Use native HTML checkboxes (NOT Radix Checkbox) to avoid new dependencies
- Language source of truth: `translation-service.types.ts` defines 6 languages including 'it' (Italian), NOT 'pt' (Portuguese)
- Flag for discussion: Some specs mention Portuguese, but codebase defines Italian

**Key Code Patterns:**
- Custom dialog: Fixed positioning, backdrop, keyboard handlers, focus trap
- Checkbox toggle: Add/remove from `selectedLanguages` array
- Dynamic button text: Show count when languages selected
- ARIA live region: Announce selection changes to screen readers

**Edge Cases to Handle:**
- Empty selection: Disable confirm button
- Initial selection: Sync with `initialSelection` prop on dialog open
- Keyboard navigation: Enter (confirm), Escape (cancel), Tab (cycle elements)
- Multiple dialogs: Ensure only one dialog open at a time

**Testing Focus:**
- Checkbox interaction and state synchronization
- Button disabled/enabled states
- Dynamic text updates ("Confirm (3 selected)")
- Keyboard navigation (Enter, Escape, Tab)
- Screen reader announcements
- Focus trap behavior

---

## Notes for Agent 04 (Implementation Agent)

**DO:**
- ✅ Follow BulkMoveDialog and BulkTagDialog patterns exactly
- ✅ Use `useFocusTrap` hook from `a11yUtils.tsx`
- ✅ Import `SupportedLanguage` from `translation-service.types.ts`
- ✅ Use native HTML checkboxes with Tailwind styling
- ✅ Add ARIA live region for selection count announcements
- ✅ Respect `prefers-reduced-motion` for animations
- ✅ Make entire label row clickable (not just checkbox)
- ✅ Test keyboard navigation (Tab, Enter, Escape)

**DON'T:**
- ❌ Don't use `@radix-ui/react-dialog` (use custom implementation)
- ❌ Don't install `@radix-ui/react-checkbox` (use native HTML)
- ❌ Don't use Portuguese ('pt') in TARGET_LANGUAGES (use Italian 'it')
- ❌ Don't allow confirm when `selectedLanguages.length === 0`
- ❌ Don't forget to update index.ts barrel export
- ❌ Don't skip motion-reduce animation support

**File Creation Checklist:**
1. Create `LanguageSelectorDialog.tsx` (~280 lines)
2. Update `BulkTranslationBar/index.ts` (add export)
3. Add translation keys to `/messages/en.json`
4. Reference `useFocusTrap` from existing code (DO NOT modify)

---

## Additional Resources

### Reference Documentation

- **Epic 5 Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (Lines 2812-3060)
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **Focus Trap Hook:** `/src/components/ItemManager/utils/a11yUtils.tsx`

### Related Components

- **BulkMoveDialog:** `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`
- **BulkTagDialog:** `/src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- **ConfirmDeleteDialog:** `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`

### External Documentation

- [Radix UI Dialog Docs](https://www.radix-ui.com/docs/primitives/components/dialog) (reference only, not used)
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-01-22 19:54:53 CET | Tech Lead Agent | Initial breakdown created |

---

**END OF DOCUMENT**
