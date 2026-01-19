# REQ-375: Update SpecificItemStep Component - Detailed Task Breakdown

**Document Created:** 2026-01-19 21:45 UTC
**Last Modified:** 2026-01-19 21:45 UTC
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.5
**Type:** ENHANCEMENT
**Size:** L (Large)
**Priority:** P2
**Source Overview:** REQ-375-update-specificitemstep-overview.md
**Source Request:** gen_requests_epic2.md (Request #375)

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for internationalizing the SpecificItemStep component (Step 3 of item creation workflow) and its three shared sub-components: SuggestionButton, ItemNameEditor, and DuplicateNameWarning. The component currently contains 15+ hardcoded English strings across 4 files that must be replaced with next-intl translation function calls.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed, IntlProvider configured)
- [ ] Translation files exist at `/messages/*.json` for all 6 languages
- [ ] `useTranslations` hook is available from 'next-intl'
- [ ] LogoutButton.tsx pattern verified as working reference
- [ ] Workflow namespace exists or will be created in en.json

---

## Task Breakdown

### Task 1: Add Translation Keys to /messages/en.json

**File:** `/messages/en.json`
**Estimated Effort:** 1 story point
**Dependencies:** None

#### 1.1 Add workflow.steps.specificItem Namespace

Add the following keys under the `workflow` namespace (create if not exists):

```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "What specific item?",
        "subtitle": "Select from suggestions or enter a custom item for {roomLabel}",
        "suggestionsLabel": "Suggestions",
        "otherOption": "Other...",
        "customItemLabel": "Enter custom item name",
        "itemNameLabel": "Enter item name",
        "customItemPlaceholder": "e.g., Coffee Maker, Smart Thermostat",
        "ariaLabel": "Select a specific item"
      }
    },
    "shared": {
      "suggestionButton": {
        "createdStatus": "Created"
      },
      "itemNameEditor": {
        "label": "Item Name",
        "hint": "This name will appear on the QR code label"
      },
      "duplicateWarning": {
        "exactMatch": "Exact name already exists",
        "similarMatch": "Similar name already used",
        "moreItems": "+{count} more..."
      }
    },
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

#### Acceptance Criteria for Task 1:
- [ ] `workflow.steps.specificItem` namespace added with 8 keys
- [ ] `workflow.shared.suggestionButton` namespace added with 1 key
- [ ] `workflow.shared.itemNameEditor` namespace added with 2 keys
- [ ] `workflow.shared.duplicateWarning` namespace added with 3 keys
- [ ] `workflow.buttons.continue` key added (may already exist)
- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] Keys follow established naming convention (camelCase)

---

### Task 2: Update SpecificItemStep Component

**File:** `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
**Estimated Effort:** 2 story points
**Dependencies:** Task 1

#### 2.1 Add Import Statement

**Location:** Line 16 (after existing imports)

Add:
```typescript
import { useTranslations } from 'next-intl';
```

#### 2.2 Initialize Translation Hooks

**Location:** Line 59-61 (inside component function, after destructuring props)

Add after the existing state declarations:
```typescript
// i18n translations
const t = useTranslations('workflow.steps.specificItem');
const tButtons = useTranslations('workflow.buttons');
```

#### 2.3 Replace Hardcoded Strings

| Line | Current String | Replacement |
|------|---------------|-------------|
| 136 | `"What specific item?"` | `{t('title')}` |
| 139 | `"Select from suggestions or enter a custom item for {roomLabel}"` | `{t('subtitle', { roomLabel })}` |
| 147 | `"Suggestions"` | `{t('suggestionsLabel')}` |
| 151 | `aria-label="Select a specific item"` | `aria-label={t('ariaLabel')}` |
| 165 | `label="Other..."` | `label={t('otherOption')}` |
| 181 | `{hasSuggestions ? 'Enter custom item name' : 'Enter item name'}` | `{hasSuggestions ? t('customItemLabel') : t('itemNameLabel')}` |
| 188 | `placeholder="e.g., Coffee Maker, Smart Thermostat"` | `placeholder={t('customItemPlaceholder')}` |
| 242 | `"Continue"` | `{tButtons('continue')}` |

#### Detailed Code Changes:

**Lines 135-141 (Step header):**
```typescript
// Before:
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  What specific item?
</h2>
<p className="text-base text-[#717171]">
  Select from suggestions or enter a custom item for {roomLabel}
</p>

// After:
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  {t('title')}
</h2>
<p className="text-base text-[#717171]">
  {t('subtitle', { roomLabel })}
</p>
```

**Line 147 (Suggestions label):**
```typescript
// Before:
<h3 className="text-sm font-medium text-[#717171] mb-3 uppercase tracking-wide">
  Suggestions
</h3>

// After:
<h3 className="text-sm font-medium text-[#717171] mb-3 uppercase tracking-wide">
  {t('suggestionsLabel')}
</h3>
```

**Lines 149-152 (Aria label):**
```typescript
// Before:
<div
  role="radiogroup"
  aria-label="Select a specific item"
  className="grid grid-cols-2 gap-3 sm:grid-cols-3"
>

// After:
<div
  role="radiogroup"
  aria-label={t('ariaLabel')}
  className="grid grid-cols-2 gap-3 sm:grid-cols-3"
>
```

**Lines 164-169 (Other option):**
```typescript
// Before:
<SuggestionButton
  label="Other..."
  isSelected={isCustomMode}
  isCreated={false}
  onSelect={handleOtherClick}
/>

// After:
<SuggestionButton
  label={t('otherOption')}
  isSelected={isCustomMode}
  isCreated={false}
  onSelect={handleOtherClick}
/>
```

**Lines 177-181 (Custom item label):**
```typescript
// Before:
<label
  htmlFor="custom-item-input"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  {hasSuggestions ? 'Enter custom item name' : 'Enter item name'}
</label>

// After:
<label
  htmlFor="custom-item-input"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  {hasSuggestions ? t('customItemLabel') : t('itemNameLabel')}
</label>
```

**Line 188 (Placeholder):**
```typescript
// Before:
placeholder="e.g., Coffee Maker, Smart Thermostat"

// After:
placeholder={t('customItemPlaceholder')}
```

**Lines 241-243 (Continue button):**
```typescript
// Before:
<button ...>
  Continue
</button>

// After:
<button ...>
  {tButtons('continue')}
</button>
```

#### Acceptance Criteria for Task 2:
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Translation hooks initialized inside component
- [ ] Step title uses `t('title')`
- [ ] Step subtitle uses `t('subtitle', { roomLabel })` with interpolation
- [ ] Suggestions label uses `t('suggestionsLabel')`
- [ ] "Other..." button uses `t('otherOption')`
- [ ] Custom item label conditionally uses `t('customItemLabel')` or `t('itemNameLabel')`
- [ ] Placeholder uses `t('customItemPlaceholder')`
- [ ] Continue button uses `tButtons('continue')`
- [ ] Aria-label uses `t('ariaLabel')`
- [ ] No hardcoded English strings remain in JSX
- [ ] Component compiles without TypeScript errors
- [ ] Component renders correctly in development

---

### Task 3: Update SuggestionButton Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1

#### 3.1 Add Import Statement

**Location:** Line 26 (after cn import)

Add:
```typescript
import { useTranslations } from 'next-intl';
```

#### 3.2 Initialize Translation Hook

**Location:** Line 49 (inside component function, before handleClick)

Add:
```typescript
const t = useTranslations('workflow.shared.suggestionButton');
```

#### 3.3 Replace Hardcoded String

**Line 96:**
```typescript
// Before:
<span className="text-xs text-gray-400">Created</span>

// After:
<span className="text-xs text-gray-400">{t('createdStatus')}</span>
```

#### Acceptance Criteria for Task 3:
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Translation hook initialized with 'workflow.shared.suggestionButton'
- [ ] "Created" status text uses `t('createdStatus')`
- [ ] Component compiles without TypeScript errors
- [ ] Created state displays translated text correctly

---

### Task 4: Update ItemNameEditor Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1

#### 4.1 Add Import Statement

**Location:** Line 25 (after useCallback import)

Add:
```typescript
import { useTranslations } from 'next-intl';
```

#### 4.2 Initialize Translation Hook

**Location:** Line 52 (inside component function, before handleChange)

Add:
```typescript
const t = useTranslations('workflow.shared.itemNameEditor');
```

#### 4.3 Replace Hardcoded Strings

**Line 69:**
```typescript
// Before:
<label ...>
  <Pencil className="w-4 h-4 text-[#717171]" aria-hidden="true" />
  Item Name
</label>

// After:
<label ...>
  <Pencil className="w-4 h-4 text-[#717171]" aria-hidden="true" />
  {t('label')}
</label>
```

**Lines 107-109:**
```typescript
// Before:
<p id="item-name-hint" className="text-[10px] text-[#999999]">
  This name will appear on the QR code label
</p>

// After:
<p id="item-name-hint" className="text-[10px] text-[#999999]">
  {t('hint')}
</p>
```

#### Acceptance Criteria for Task 4:
- [ ] `useTranslations` imported from 'next-intl'
- [ ] Translation hook initialized with 'workflow.shared.itemNameEditor'
- [ ] "Item Name" label uses `t('label')`
- [ ] Hint text uses `t('hint')`
- [ ] Character count display remains unchanged (numeric, no translation needed)
- [ ] Component compiles without TypeScript errors
- [ ] Label and hint display translated text correctly

---

### Task 5: Update DuplicateNameWarning Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1

#### 5.1 Add Import Statement

**Location:** Line 14 (after AlertTriangle import)

Add:
```typescript
import { useTranslations } from 'next-intl';
```

#### 5.2 Remove MESSAGES Constant

**Location:** Lines 37-40

Remove:
```typescript
const MESSAGES = {
  exact: 'Exact name already exists',
  similar: 'Similar name already used',
} as const;
```

#### 5.3 Initialize Translation Hook

**Location:** Line 56 (inside component function, first line)

Add:
```typescript
const t = useTranslations('workflow.shared.duplicateWarning');
```

#### 5.4 Replace Message Access

**Line 56 (old) -> after hook initialization:**
```typescript
// Before:
const message = MESSAGES[matchType];

// After:
const message = matchType === 'exact' ? t('exactMatch') : t('similarMatch');
```

#### 5.5 Replace "more..." Text

**Line 99 (inline variant):**
```typescript
// Before:
<li className="text-gray-400">
  +{matchingNames.length - 3} more...
</li>

// After:
<li className="text-gray-400">
  {t('moreItems', { count: matchingNames.length - 3 })}
</li>
```

**Line 136 (block variant):**
```typescript
// Before:
<li className="text-amber-600">
  +{matchingNames.length - 3} more...
</li>

// After:
<li className="text-amber-600">
  {t('moreItems', { count: matchingNames.length - 3 })}
</li>
```

#### 5.6 Update Aria Label

**Line 72:**
```typescript
// Before:
aria-label={`Warning: ${message}`}

// After (message variable already translated):
aria-label={`Warning: ${message}`}
// Note: This still works because 'message' now contains translated text
```

#### Acceptance Criteria for Task 5:
- [ ] `useTranslations` imported from 'next-intl'
- [ ] MESSAGES constant removed
- [ ] Translation hook initialized with 'workflow.shared.duplicateWarning'
- [ ] Exact match message uses `t('exactMatch')`
- [ ] Similar match message uses `t('similarMatch')`
- [ ] "+N more..." text uses `t('moreItems', { count })` with interpolation
- [ ] Both inline and block variants updated
- [ ] Component compiles without TypeScript errors
- [ ] Warning messages display translated text correctly

---

### Task 6: Generate Translations for 5 Non-English Languages

**Files:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Estimated Effort:** 2 story points
**Dependencies:** Task 1

#### Translation Content:

**French (fr.json):**
```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "Quel article specifique ?",
        "subtitle": "Selectionnez parmi les suggestions ou entrez un article personnalise pour {roomLabel}",
        "suggestionsLabel": "Suggestions",
        "otherOption": "Autre...",
        "customItemLabel": "Entrez le nom de l'article personnalise",
        "itemNameLabel": "Entrez le nom de l'article",
        "customItemPlaceholder": "ex. Cafetiere, Thermostat intelligent",
        "ariaLabel": "Selectionnez un article specifique"
      }
    },
    "shared": {
      "suggestionButton": {
        "createdStatus": "Cree"
      },
      "itemNameEditor": {
        "label": "Nom de l'article",
        "hint": "Ce nom apparaitra sur l'etiquette du code QR"
      },
      "duplicateWarning": {
        "exactMatch": "Ce nom existe deja",
        "similarMatch": "Un nom similaire est deja utilise",
        "moreItems": "+{count} de plus..."
      }
    },
    "buttons": {
      "continue": "Continuer"
    }
  }
}
```

**Spanish (es.json):**
```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "Que articulo especifico?",
        "subtitle": "Selecciona de las sugerencias o ingresa un articulo personalizado para {roomLabel}",
        "suggestionsLabel": "Sugerencias",
        "otherOption": "Otro...",
        "customItemLabel": "Ingresa el nombre del articulo personalizado",
        "itemNameLabel": "Ingresa el nombre del articulo",
        "customItemPlaceholder": "ej. Cafetera, Termostato inteligente",
        "ariaLabel": "Selecciona un articulo especifico"
      }
    },
    "shared": {
      "suggestionButton": {
        "createdStatus": "Creado"
      },
      "itemNameEditor": {
        "label": "Nombre del articulo",
        "hint": "Este nombre aparecera en la etiqueta del codigo QR"
      },
      "duplicateWarning": {
        "exactMatch": "Este nombre ya existe",
        "similarMatch": "Ya se uso un nombre similar",
        "moreItems": "+{count} mas..."
      }
    },
    "buttons": {
      "continue": "Continuar"
    }
  }
}
```

**German (de.json):**
```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "Welcher spezifische Artikel?",
        "subtitle": "Wahlen Sie aus Vorschlagen oder geben Sie einen benutzerdefinierten Artikel fur {roomLabel} ein",
        "suggestionsLabel": "Vorschlage",
        "otherOption": "Andere...",
        "customItemLabel": "Benutzerdefinierten Artikelnamen eingeben",
        "itemNameLabel": "Artikelnamen eingeben",
        "customItemPlaceholder": "z.B. Kaffeemaschine, Intelligenter Thermostat",
        "ariaLabel": "Wahlen Sie einen spezifischen Artikel"
      }
    },
    "shared": {
      "suggestionButton": {
        "createdStatus": "Erstellt"
      },
      "itemNameEditor": {
        "label": "Artikelname",
        "hint": "Dieser Name erscheint auf dem QR-Code-Etikett"
      },
      "duplicateWarning": {
        "exactMatch": "Dieser Name existiert bereits",
        "similarMatch": "Ein ahnlicher Name wird bereits verwendet",
        "moreItems": "+{count} weitere..."
      }
    },
    "buttons": {
      "continue": "Weiter"
    }
  }
}
```

**Dutch (nl.json):**
```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "Welk specifiek item?",
        "subtitle": "Selecteer uit suggesties of voer een aangepast item in voor {roomLabel}",
        "suggestionsLabel": "Suggesties",
        "otherOption": "Andere...",
        "customItemLabel": "Voer aangepaste itemnaam in",
        "itemNameLabel": "Voer itemnaam in",
        "customItemPlaceholder": "bijv. Koffiezetapparaat, Slimme thermostaat",
        "ariaLabel": "Selecteer een specifiek item"
      }
    },
    "shared": {
      "suggestionButton": {
        "createdStatus": "Aangemaakt"
      },
      "itemNameEditor": {
        "label": "Itemnaam",
        "hint": "Deze naam verschijnt op het QR-code label"
      },
      "duplicateWarning": {
        "exactMatch": "Deze naam bestaat al",
        "similarMatch": "Een vergelijkbare naam is al in gebruik",
        "moreItems": "+{count} meer..."
      }
    },
    "buttons": {
      "continue": "Doorgaan"
    }
  }
}
```

**Italian (it.json):**
```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "Quale articolo specifico?",
        "subtitle": "Seleziona dai suggerimenti o inserisci un articolo personalizzato per {roomLabel}",
        "suggestionsLabel": "Suggerimenti",
        "otherOption": "Altro...",
        "customItemLabel": "Inserisci il nome dell'articolo personalizzato",
        "itemNameLabel": "Inserisci il nome dell'articolo",
        "customItemPlaceholder": "es. Macchina del caffe, Termostato intelligente",
        "ariaLabel": "Seleziona un articolo specifico"
      }
    },
    "shared": {
      "suggestionButton": {
        "createdStatus": "Creato"
      },
      "itemNameEditor": {
        "label": "Nome articolo",
        "hint": "Questo nome apparira sull'etichetta del codice QR"
      },
      "duplicateWarning": {
        "exactMatch": "Questo nome esiste gia",
        "similarMatch": "Un nome simile e gia in uso",
        "moreItems": "+{count} altri..."
      }
    },
    "buttons": {
      "continue": "Continua"
    }
  }
}
```

#### Acceptance Criteria for Task 6:
- [ ] All 5 non-English language files updated
- [ ] All translation keys match en.json structure exactly
- [ ] Variable interpolation placeholders preserved (`{roomLabel}`, `{count}`)
- [ ] JSON syntax valid in all files
- [ ] Translations are contextually appropriate (not literal word-for-word)
- [ ] No missing keys compared to en.json

---

### Task 7: Update Unit Tests (If Exists)

**File:** `/src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx` (if exists)
**Estimated Effort:** 1 story point
**Dependencies:** Tasks 2-5

#### 7.1 Add Translation Mock

At the top of the test file, add:

```typescript
// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      'workflow.steps.specificItem': {
        title: 'What specific item?',
        subtitle: 'Select from suggestions or enter a custom item for {roomLabel}',
        suggestionsLabel: 'Suggestions',
        otherOption: 'Other...',
        customItemLabel: 'Enter custom item name',
        itemNameLabel: 'Enter item name',
        customItemPlaceholder: 'e.g., Coffee Maker, Smart Thermostat',
        ariaLabel: 'Select a specific item',
      },
      'workflow.buttons': {
        continue: 'Continue',
      },
      'workflow.shared.suggestionButton': {
        createdStatus: 'Created',
      },
      'workflow.shared.itemNameEditor': {
        label: 'Item Name',
        hint: 'This name will appear on the QR code label',
      },
      'workflow.shared.duplicateWarning': {
        exactMatch: 'Exact name already exists',
        similarMatch: 'Similar name already used',
        moreItems: '+{count} more...',
      },
    };

    return (key: string, params?: Record<string, unknown>) => {
      const nsTranslations = translations[namespace] || {};
      let text = nsTranslations[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    };
  },
}));
```

#### 7.2 Update Test Assertions

If tests check for specific text content, update them to look for translated strings or mock return values.

#### Acceptance Criteria for Task 7:
- [ ] Translation mock added to test file
- [ ] All existing tests pass with mock in place
- [ ] Mock handles interpolation for `{roomLabel}` and `{count}`
- [ ] No console warnings about missing translations during tests

---

### Task 8: Visual QA Validation

**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1-6

#### 8.1 Test Matrix

| Language | Viewport | Test Items |
|----------|----------|------------|
| English (en) | Desktop (1280px) | All strings display correctly |
| English (en) | Mobile (375px) | No text overflow, buttons fit |
| French (fr) | Desktop (1280px) | Longer strings don't break layout |
| French (fr) | Mobile (375px) | Responsive behavior intact |
| Spanish (es) | Desktop (1280px) | All strings display correctly |
| German (de) | Desktop (1280px) | Long compound words fit |
| German (de) | Mobile (375px) | Critical: button text fits |
| Dutch (nl) | Desktop (1280px) | All strings display correctly |
| Italian (it) | Desktop (1280px) | All strings display correctly |

#### 8.2 Specific Visual Checks

- [ ] Step header title displays in selected language
- [ ] Subtitle with roomLabel interpolation shows correctly
- [ ] "Suggestions" section label displays in selected language
- [ ] "Other..." button label displays and fits
- [ ] Custom item input labels display correctly
- [ ] Placeholder text displays in input field
- [ ] "Continue" button text fits within button bounds
- [ ] "Created" status badge on SuggestionButton displays correctly
- [ ] "Item Name" label in ItemNameEditor displays correctly
- [ ] Hint text below input displays correctly
- [ ] Duplicate warning messages display correctly (both exact and similar)
- [ ] "+N more..." overflow indicator shows with correct count

#### 8.3 Console Verification

- [ ] No missing translation key warnings in console
- [ ] No TypeScript errors related to translations
- [ ] No runtime errors when switching languages

#### Acceptance Criteria for Task 8:
- [ ] All 6 languages tested on desktop viewport
- [ ] All 6 languages tested on mobile viewport
- [ ] No layout breaks detected
- [ ] No text overflow issues
- [ ] Continue button accommodates longest translation (German: "Weiter")
- [ ] Console shows no translation warnings

---

## Implementation Order

Execute tasks in this sequence for optimal results:

1. **Task 1** - Add translation keys (foundation)
2. **Tasks 2-5** - Update components (can be parallelized)
3. **Task 6** - Generate non-English translations
4. **Task 7** - Update unit tests
5. **Task 8** - Visual QA validation

---

## Files Modified Summary

| File | Change Type | Lines Changed (Est.) |
|------|-------------|---------------------|
| `/messages/en.json` | Add keys | +25 lines |
| `/messages/fr.json` | Add keys | +25 lines |
| `/messages/es.json` | Add keys | +25 lines |
| `/messages/de.json` | Add keys | +25 lines |
| `/messages/nl.json` | Add keys | +25 lines |
| `/messages/it.json` | Add keys | +25 lines |
| `SpecificItemStep.tsx` | Modify | ~15 lines |
| `SuggestionButton.tsx` | Modify | ~5 lines |
| `ItemNameEditor.tsx` | Modify | ~6 lines |
| `DuplicateNameWarning.tsx` | Modify | ~10 lines |
| `SpecificItemStep.test.tsx` | Modify (if exists) | ~30 lines |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| German text overflow in buttons | Use flexible button widths with min-width; test specifically |
| Translation key typos | Use TypeScript checking; verify against en.json |
| Shared components breaking other consumers | Test all step components that use these shared components |
| Missing interpolation variables | Test with actual data; check console for warnings |
| Test mock complexity | Use simple mock pattern; copy from working tests |

---

## Verification Checklist

After completing all tasks, verify:

- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts without errors
- [ ] Navigate to SpecificItemStep in workflow
- [ ] All text displays in English (default)
- [ ] Switch language to French - all text updates
- [ ] Switch language to Spanish - all text updates
- [ ] Switch language to German - all text updates, no overflow
- [ ] Switch language to Dutch - all text updates
- [ ] Switch language to Italian - all text updates
- [ ] Select a suggestion - "Created" status displays correctly when re-viewing
- [ ] Click "Other..." - label and placeholder display correctly
- [ ] Enter custom name - ItemNameEditor label and hint display correctly
- [ ] Trigger duplicate warning - warning message displays correctly
- [ ] Console shows no translation-related warnings
- [ ] Run existing tests - all pass

---

## Related Documents

- Overview: `/docs/REQ-375-update-specificitemstep-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Working Example: `/src/components/LogoutButton.tsx`
- i18n Config: `/src/lib/i18n/config.ts`

---

## Notes

### Character Count Display
The ItemNameEditor component shows a character count in the format `{count}/{maxLength}`. This numeric display uses universal formatting and does not require translation.

### ROOM_LABELS Consideration
The `ROOM_LABELS` constant imported from `constants.ts` is out of scope for this task. Room label translation is covered by Task 2C.11 in the broader implementation plan.

### Aria Labels
The aria-label `"Select a specific item"` must be translated for full accessibility compliance. This is included in the translation keys.

### Interpolation Syntax
next-intl uses `{variableName}` syntax for interpolation. Ensure all translators preserve these placeholders exactly as written.
