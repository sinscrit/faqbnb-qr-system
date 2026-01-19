# REQ-162: Update ContentTypeStep Component - Detailed Task Breakdown

**Document Created:** 2026-01-19 23:45 UTC
**Last Modified:** 2026-01-19 23:45 UTC
**Source Overview:** REQ-162-update-contenttypestep-overview.md
**Request Reference:** gen_requests_epic2.md (Task 2C.7)
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.7
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P2

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for internationalizing the ContentTypeStep component. The component currently contains 15+ hardcoded English strings that must be converted to use the `useTranslations` hook from `next-intl`. This breakdown enables autonomous implementation by AI coding agents or junior developers.

**Strings to Translate:**
- 2 step header strings (title, subtitle)
- 6 content type option strings (5 labels + 1 subtitle)
- 2 accessibility strings (ariaLabel, keyboardHelp)
- 1 button text (Continue)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 i18n foundation is complete (`next-intl` installed, `NextIntlClientProvider` configured)
- [ ] `/messages/en.json` file exists and is accessible
- [ ] REQ-371 (workflow namespace structure) is complete or will be created as part of this task
- [ ] The `workflow` namespace exists in translation files (or will be added)

---

## Task Breakdown

### Task 1: Add Translation Keys to /messages/en.json

**Estimated Effort:** 1 story point
**File:** `/messages/en.json`
**Dependencies:** None

#### 1.1 Add workflow namespace if not exists

Check if `workflow` namespace exists in `/messages/en.json`. If not, add the base structure:

```json
{
  "workflow": {
    "steps": {},
    "contentTypes": {},
    "accessibility": {},
    "buttons": {}
  }
}
```

#### 1.2 Add ContentTypeStep-specific translation keys

Add the following keys within the `workflow` namespace:

```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "What content would you like to add?",
        "subtitle": "Choose how you want to add information for this item"
      }
    },
    "contentTypes": {
      "recordVideo": {
        "label": "Record Video"
      },
      "takePhoto": {
        "label": "Take Photo"
      },
      "writeText": {
        "label": "Write Text"
      },
      "uploadFile": {
        "label": "Upload File",
        "subtitle": "Video, Image, PDF, Text"
      },
      "addLink": {
        "label": "Add Link"
      }
    },
    "accessibility": {
      "contentTypeStep": {
        "ariaLabel": "Select content type",
        "keyboardHelp": "Use arrow keys to navigate. Press Enter or Space to select."
      }
    },
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

#### 1.3 Verification

- [ ] JSON is valid (no syntax errors)
- [ ] All 11 keys are present:
  - 2 step header keys (title, subtitle)
  - 6 content type keys (5 labels + 1 subtitle for uploadFile)
  - 2 accessibility keys (ariaLabel, keyboardHelp)
  - 1 button key (continue)
  - Note: `workflow.buttons.continue` may already exist from prior tasks; verify and reuse if present

---

### Task 2: Add Translation Keys to Non-English Language Files

**Estimated Effort:** 1 story point
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Dependencies:** Task 1

#### 2.1 French translations (/messages/fr.json)

Add to the `workflow` namespace:

```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "Quel contenu souhaitez-vous ajouter ?",
        "subtitle": "Choisissez comment vous souhaitez ajouter des informations pour cet article"
      }
    },
    "contentTypes": {
      "recordVideo": {
        "label": "Enregistrer une vidéo"
      },
      "takePhoto": {
        "label": "Prendre une photo"
      },
      "writeText": {
        "label": "Écrire du texte"
      },
      "uploadFile": {
        "label": "Télécharger un fichier",
        "subtitle": "Vidéo, Image, PDF, Texte"
      },
      "addLink": {
        "label": "Ajouter un lien"
      }
    },
    "accessibility": {
      "contentTypeStep": {
        "ariaLabel": "Sélectionnez le type de contenu",
        "keyboardHelp": "Utilisez les touches fléchées pour naviguer. Appuyez sur Entrée ou Espace pour sélectionner."
      }
    },
    "buttons": {
      "continue": "Continuer"
    }
  }
}
```

#### 2.2 Spanish translations (/messages/es.json)

```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "¿Qué contenido te gustaría agregar?",
        "subtitle": "Elige cómo quieres agregar información para este artículo"
      }
    },
    "contentTypes": {
      "recordVideo": {
        "label": "Grabar video"
      },
      "takePhoto": {
        "label": "Tomar foto"
      },
      "writeText": {
        "label": "Escribir texto"
      },
      "uploadFile": {
        "label": "Subir archivo",
        "subtitle": "Video, Imagen, PDF, Texto"
      },
      "addLink": {
        "label": "Agregar enlace"
      }
    },
    "accessibility": {
      "contentTypeStep": {
        "ariaLabel": "Selecciona el tipo de contenido",
        "keyboardHelp": "Usa las teclas de flecha para navegar. Presiona Enter o Espacio para seleccionar."
      }
    },
    "buttons": {
      "continue": "Continuar"
    }
  }
}
```

#### 2.3 German translations (/messages/de.json)

```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "Welchen Inhalt möchten Sie hinzufügen?",
        "subtitle": "Wählen Sie, wie Sie Informationen für diesen Artikel hinzufügen möchten"
      }
    },
    "contentTypes": {
      "recordVideo": {
        "label": "Video aufnehmen"
      },
      "takePhoto": {
        "label": "Foto aufnehmen"
      },
      "writeText": {
        "label": "Text schreiben"
      },
      "uploadFile": {
        "label": "Datei hochladen",
        "subtitle": "Video, Bild, PDF, Text"
      },
      "addLink": {
        "label": "Link hinzufügen"
      }
    },
    "accessibility": {
      "contentTypeStep": {
        "ariaLabel": "Inhaltstyp auswählen",
        "keyboardHelp": "Verwenden Sie die Pfeiltasten zum Navigieren. Drücken Sie Enter oder Leertaste zum Auswählen."
      }
    },
    "buttons": {
      "continue": "Weiter"
    }
  }
}
```

#### 2.4 Dutch translations (/messages/nl.json)

```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "Welke inhoud wil je toevoegen?",
        "subtitle": "Kies hoe je informatie wilt toevoegen voor dit item"
      }
    },
    "contentTypes": {
      "recordVideo": {
        "label": "Video opnemen"
      },
      "takePhoto": {
        "label": "Foto maken"
      },
      "writeText": {
        "label": "Tekst schrijven"
      },
      "uploadFile": {
        "label": "Bestand uploaden",
        "subtitle": "Video, Afbeelding, PDF, Tekst"
      },
      "addLink": {
        "label": "Link toevoegen"
      }
    },
    "accessibility": {
      "contentTypeStep": {
        "ariaLabel": "Selecteer inhoudstype",
        "keyboardHelp": "Gebruik de pijltoetsen om te navigeren. Druk op Enter of Spatie om te selecteren."
      }
    },
    "buttons": {
      "continue": "Doorgaan"
    }
  }
}
```

#### 2.5 Italian translations (/messages/it.json)

```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "Quale contenuto vorresti aggiungere?",
        "subtitle": "Scegli come vuoi aggiungere informazioni per questo articolo"
      }
    },
    "contentTypes": {
      "recordVideo": {
        "label": "Registra video"
      },
      "takePhoto": {
        "label": "Scatta foto"
      },
      "writeText": {
        "label": "Scrivi testo"
      },
      "uploadFile": {
        "label": "Carica file",
        "subtitle": "Video, Immagine, PDF, Testo"
      },
      "addLink": {
        "label": "Aggiungi link"
      }
    },
    "accessibility": {
      "contentTypeStep": {
        "ariaLabel": "Seleziona il tipo di contenuto",
        "keyboardHelp": "Usa i tasti freccia per navigare. Premi Invio o Spazio per selezionare."
      }
    },
    "buttons": {
      "continue": "Continua"
    }
  }
}
```

#### 2.6 Verification

- [ ] All 5 non-English language files have identical key structures
- [ ] JSON is valid in all files
- [ ] No placeholder text (e.g., "TODO", "TRANSLATE") remains

---

### Task 3: Create Content Option ID to Translation Key Mapping

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Dependencies:** None (can be done in parallel with Task 1)

#### 3.1 Add mapping constant

Add the following constant after the existing imports and before the ICON_MAP definition (around line 67):

```typescript
/**
 * Maps internal content option IDs (kebab-case) to translation keys (camelCase).
 * Required because UNIFIED_CONTENT_OPTIONS use kebab-case while JSON keys use camelCase.
 */
const CONTENT_OPTION_TO_KEY: Record<string, string> = {
  'record-video': 'recordVideo',
  'take-photo': 'takePhoto',
  'write-text': 'writeText',
  'upload-file': 'uploadFile',
  'add-link': 'addLink',
};
```

#### 3.2 Verification

- [ ] Mapping includes all 5 content option IDs from `UNIFIED_CONTENT_OPTIONS`
- [ ] Key names match exactly with translation file keys
- [ ] TypeScript compiles without errors

---

### Task 4: Update ContentTypeStep Component Imports

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Dependencies:** Task 3

#### 4.1 Add useTranslations import

Modify the existing imports at the top of the file. Add after the React imports (around line 25):

```typescript
import { useTranslations } from 'next-intl';
```

#### 4.2 Verification

- [ ] `useTranslations` is imported from 'next-intl'
- [ ] TypeScript compiles without errors

---

### Task 5: Initialize Translation Hook and Helper Functions in Component

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Dependencies:** Task 4

#### 5.1 Add translation hook initialization

Inside the `ContentTypeStep` function (around line 211), add the translation hook initialization right after the opening of the function:

**Location:** After line 211 (component function signature)

```typescript
export function ContentTypeStep({
  currentSelection,
  onSelectContent,
  onNext,
  canNext,
  className,
}: ContentTypeStepProps) {
  // Initialize translations for workflow namespace
  const t = useTranslations('workflow');

  // ... rest of component
```

#### 5.2 Add helper functions for content type translations

Add these helper functions after the translation hook initialization:

```typescript
  // Helper functions to get translated content type labels and subtitles
  const getLabel = (optionId: string) =>
    t(`contentTypes.${CONTENT_OPTION_TO_KEY[optionId]}.label`);

  const getSubtitle = (optionId: string) => {
    // Only 'upload-file' has a subtitle
    if (optionId === 'upload-file') {
      return t('contentTypes.uploadFile.subtitle');
    }
    return undefined;
  };
```

#### 5.3 Remove hardcoded header variables

**Location:** Around lines 223-225

**Before:**
```typescript
  // Updated header text for unified options
  const headerText = 'What content would you like to add?';
  const descriptionText = 'Choose how you want to add information for this item';
```

**After:**
Remove these lines entirely (or comment them out). They will be replaced with direct `t()` calls in the JSX.

#### 5.4 Verification

- [ ] `useTranslations('workflow')` is called inside the component
- [ ] Helper functions `getLabel` and `getSubtitle` are defined before JSX return
- [ ] Hardcoded `headerText` and `descriptionText` variables are removed
- [ ] TypeScript compiles without errors

---

### Task 6: Replace Hardcoded Header Strings

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Dependencies:** Task 5

#### 6.1 Replace step title

**Location:** Around line 273-275

**Before:**
```tsx
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  {headerText}
</h2>
```

**After:**
```tsx
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  {t('steps.contentType.title')}
</h2>
```

#### 6.2 Replace step subtitle

**Location:** Around line 276-278

**Before:**
```tsx
<p className="text-base text-[#717171]">
  {descriptionText}
</p>
```

**After:**
```tsx
<p className="text-base text-[#717171]">
  {t('steps.contentType.subtitle')}
</p>
```

#### 6.3 Verification

- [ ] No hardcoded heading text remains
- [ ] No hardcoded subtitle text remains
- [ ] No references to `headerText` or `descriptionText` variables
- [ ] Component renders without errors

---

### Task 7: Replace Hardcoded ARIA Labels

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Dependencies:** Task 5

#### 7.1 Replace radiogroup aria-label

**Location:** Around line 282-286

**Before:**
```tsx
<div
  role="radiogroup"
  aria-label="Select content type"
  aria-describedby="content-type-help"
  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
  onKeyDown={handleGridKeyDown}
>
```

**After:**
```tsx
<div
  role="radiogroup"
  aria-label={t('accessibility.contentTypeStep.ariaLabel')}
  aria-describedby="content-type-help"
  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
  onKeyDown={handleGridKeyDown}
>
```

#### 7.2 Replace screen reader help text

**Location:** Around line 305-307

**Before:**
```tsx
<p id="content-type-help" className="sr-only">
  Use arrow keys to navigate. Press Enter or Space to select.
</p>
```

**After:**
```tsx
<p id="content-type-help" className="sr-only">
  {t('accessibility.contentTypeStep.keyboardHelp')}
</p>
```

#### 7.3 Verification

- [ ] ARIA label uses translation
- [ ] Screen reader text uses translation
- [ ] Accessibility attributes are intact

---

### Task 8: Replace Content Type Labels and Subtitles

**Estimated Effort:** 1 story point
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Dependencies:** Task 5

#### 8.1 Update option mapping to use translated labels and subtitles

**Location:** Around line 289-303

**Before:**
```tsx
{contentOptions.map((option, index) => (
  <ContentTypeCard
    key={option.id}
    ref={(el) => { cardRefs.current[index] = el; }}
    option={{
      type: option.id,
      label: option.label,
      subtitle: option.subtitle,
      icon: getIconComponent(option.icon),
    }}
    isSelected={currentSelection === option.id}
    onSelect={() => handleContentSelect(option)}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**After:**
```tsx
{contentOptions.map((option, index) => (
  <ContentTypeCard
    key={option.id}
    ref={(el) => { cardRefs.current[index] = el; }}
    option={{
      type: option.id,
      label: getLabel(option.id),
      subtitle: getSubtitle(option.id),
      icon: getIconComponent(option.icon),
    }}
    isSelected={currentSelection === option.id}
    onSelect={() => handleContentSelect(option)}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

#### 8.2 Verification

- [ ] All 5 content type labels use translation function
- [ ] "Upload File" subtitle uses translation function
- [ ] Other options correctly return `undefined` for subtitle
- [ ] No direct references to `option.label` or `option.subtitle` remain in option rendering

---

### Task 9: Replace Continue Button Text

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Dependencies:** Task 5

#### 9.1 Replace button text

**Location:** Around line 324-325

**Before:**
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!canNext}
  className={cn(...)}
  aria-disabled={!canNext}
>
  Continue
</button>
```

**After:**
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!canNext}
  className={cn(...)}
  aria-disabled={!canNext}
>
  {t('buttons.continue')}
</button>
```

#### 9.2 Verification

- [ ] Button text uses translation
- [ ] Button functionality unchanged

---

### Task 10: Update Unit Tests

**Estimated Effort:** 1 story point
**File:** `/src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx`
**Dependencies:** Tasks 1-9

#### 10.1 Add translation mock

Add at the top of the test file, after the imports:

```typescript
// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'steps.contentType.title': 'What content would you like to add?',
      'steps.contentType.subtitle': 'Choose how you want to add information for this item',
      'contentTypes.recordVideo.label': 'Record Video',
      'contentTypes.takePhoto.label': 'Take Photo',
      'contentTypes.writeText.label': 'Write Text',
      'contentTypes.uploadFile.label': 'Upload File',
      'contentTypes.uploadFile.subtitle': 'Video, Image, PDF, Text',
      'contentTypes.addLink.label': 'Add Link',
      'accessibility.contentTypeStep.ariaLabel': 'Select content type',
      'accessibility.contentTypeStep.keyboardHelp': 'Use arrow keys to navigate. Press Enter or Space to select.',
      'buttons.continue': 'Continue',
    };
    return translations[key] || key;
  },
}));
```

#### 10.2 Update test that references UNIFIED_CONTENT_OPTIONS labels

**Location:** Around line 373-379

The test `'matches UNIFIED_CONTENT_OPTIONS from constants'` currently verifies that `option.label` appears in the DOM. Since we now use translations, this test should be updated:

**Before:**
```typescript
it('matches UNIFIED_CONTENT_OPTIONS from constants', () => {
  render(<ContentTypeStep {...defaultProps} />);

  // Verify all options from constants are rendered
  UNIFIED_CONTENT_OPTIONS.forEach((option) => {
    expect(screen.getByText(option.label)).toBeInTheDocument();
  });
});
```

**After:**
```typescript
it('renders all content options with translated labels', () => {
  render(<ContentTypeStep {...defaultProps} />);

  // Verify all options are rendered with their translated labels
  expect(screen.getByText('Record Video')).toBeInTheDocument();
  expect(screen.getByText('Take Photo')).toBeInTheDocument();
  expect(screen.getByText('Write Text')).toBeInTheDocument();
  expect(screen.getByText('Upload File')).toBeInTheDocument();
  expect(screen.getByText('Add Link')).toBeInTheDocument();
});
```

#### 10.3 Update test for options order

**Location:** Around line 381-394

The test `'options are in correct order matching constants'` may need adjustment since it retrieves labels from the DOM:

**Before:**
```typescript
it('options are in correct order matching constants', () => {
  render(<ContentTypeStep {...defaultProps} />);

  const radios = screen.getAllByRole('radio');
  const labels = radios.map((radio) => {
    const labelEl = radio.querySelector('.text-base, .sm\\:text-lg');
    return labelEl?.textContent;
  });

  const expectedOrder = UNIFIED_CONTENT_OPTIONS.map((opt) => opt.label);
  expect(labels).toEqual(expectedOrder);
});
```

**After:**
```typescript
it('options are in correct order', () => {
  render(<ContentTypeStep {...defaultProps} />);

  const radios = screen.getAllByRole('radio');
  const labels = radios.map((radio) => {
    const labelEl = radio.querySelector('.text-base, .sm\\:text-lg');
    return labelEl?.textContent;
  });

  const expectedOrder = ['Record Video', 'Take Photo', 'Write Text', 'Upload File', 'Add Link'];
  expect(labels).toEqual(expectedOrder);
});
```

#### 10.4 Verification

- [ ] All existing tests pass with translation mock
- [ ] Mock covers all translation keys used in component
- [ ] Tests no longer rely on `option.label` from `UNIFIED_CONTENT_OPTIONS` for display text

---

### Task 11: Build Verification

**Estimated Effort:** 0.5 story points
**Files:** All modified files
**Dependencies:** All previous tasks

#### 11.1 Run TypeScript compilation

```bash
npm run type-check
# or
npx tsc --noEmit
```

#### 11.2 Run linting

```bash
npm run lint
```

#### 11.3 Run full test suite

```bash
npm test
```

#### 11.4 Run build

```bash
npm run build
```

#### 11.5 Verification

- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors
- [ ] All tests pass
- [ ] Build completes successfully

---

### Task 12: Visual QA Validation

**Estimated Effort:** 1 story point
**Files:** N/A (manual testing)
**Dependencies:** Task 11

#### 12.1 Test in English (en)

1. Navigate to the ContentTypeStep in the item creation workflow
2. Verify all 5 content type options display correctly:
   - Record Video
   - Take Photo
   - Write Text
   - Upload File (with subtitle "Video, Image, PDF, Text")
   - Add Link
3. Verify heading "What content would you like to add?" displays correctly
4. Verify subtitle "Choose how you want to add information for this item" displays correctly
5. Verify Continue button displays "Continue"
6. Test keyboard navigation (arrow keys, Enter/Space)
7. Check console for missing translation warnings
8. Verify auto-advance works after selection (150ms delay)

#### 12.2 Test in French (fr)

1. Switch language to French
2. Repeat all checks from 12.1
3. Verify no text truncation or overflow
4. Check card heights remain consistent

#### 12.3 Test in German (de)

1. Switch language to German
2. Pay special attention to longer German translations
3. Verify no layout breaks with longer text
4. Verify card alignment and spacing
5. Verify "Upload File" subtitle doesn't overflow

#### 12.4 Test in Spanish (es), Dutch (nl), Italian (it)

1. Repeat basic checks in each language
2. Verify no missing translations
3. Check layout consistency

#### 12.5 Cross-browser testing

1. Test in Chrome
2. Test in Firefox
3. Test in Safari (if available)

#### 12.6 Responsive testing

1. Test on mobile viewport (375px) - should display single column
2. Test on tablet viewport (768px) - should display 2 columns
3. Test on desktop viewport (1024px+) - should display 2 columns
4. Verify card touch targets meet minimum size (48px)

#### 12.7 Verification Checklist

- [ ] All 6 languages display without errors
- [ ] No missing translation warnings in console
- [ ] No layout breaks in any language
- [ ] Content type card heights are consistent across languages
- [ ] Icon alignment is consistent regardless of text length
- [ ] Checkmark indicator displays correctly for selected state
- [ ] Keyboard navigation works in all languages (arrow keys to navigate, Enter/Space to select)
- [ ] Roving tabindex works correctly
- [ ] Auto-advance on selection works correctly (150ms delay)
- [ ] Touch targets meet minimum size requirements (48px)
- [ ] Two-column grid on desktop displays correctly
- [ ] Single-column layout on mobile displays correctly
- [ ] "Upload File" subtitle displays without overflow in all languages

---

## Complete Implementation Checklist

### Translation Files
- [ ] Task 1: Added English translations to `/messages/en.json`
- [ ] Task 2.1: Added French translations to `/messages/fr.json`
- [ ] Task 2.2: Added Spanish translations to `/messages/es.json`
- [ ] Task 2.3: Added German translations to `/messages/de.json`
- [ ] Task 2.4: Added Dutch translations to `/messages/nl.json`
- [ ] Task 2.5: Added Italian translations to `/messages/it.json`

### Component Updates
- [ ] Task 3: Created CONTENT_OPTION_TO_KEY mapping
- [ ] Task 4: Added useTranslations import
- [ ] Task 5: Initialized translation hook with helper functions
- [ ] Task 6: Replaced header strings (title, subtitle)
- [ ] Task 7: Replaced ARIA labels and screen reader text
- [ ] Task 8: Replaced content type labels and subtitles
- [ ] Task 9: Replaced Continue button text

### Testing
- [ ] Task 10: Updated unit tests with translation mock
- [ ] Task 11: Build verification passed

### QA
- [ ] Task 12: Visual QA validation complete

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
| `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Modify | ~30 lines |
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/ContentTypeStep.test.tsx` | Modify | ~35 lines |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementing Task |
|---------------------|-------------------|
| Component imports useTranslations hook | Task 4 |
| Workflow namespace loaded correctly | Task 5 |
| Heading uses translation key `workflow.steps.contentType.title` | Task 6.1 |
| Subtitle uses translation key `workflow.steps.contentType.subtitle` | Task 6.2 |
| "Record Video" label uses `workflow.contentTypes.recordVideo.label` | Task 8 |
| "Take Photo" label uses `workflow.contentTypes.takePhoto.label` | Task 8 |
| "Write Text" label uses `workflow.contentTypes.writeText.label` | Task 8 |
| "Upload File" label uses `workflow.contentTypes.uploadFile.label` | Task 8 |
| "Upload File" subtitle uses `workflow.contentTypes.uploadFile.subtitle` | Task 8 |
| "Add Link" label uses `workflow.contentTypes.addLink.label` | Task 8 |
| Continue button uses translation key | Task 9 |
| ARIA label uses translated string | Task 7.1 |
| Screen reader help uses translated string | Task 7.2 |
| No hardcoded English strings remain | Tasks 6-9 |
| Keyboard navigation works in all languages | Task 12 |
| Auto-advance on selection (150ms delay) works correctly | Task 12 |
| Roving tabindex implementation functions properly across languages | Task 12 |
| Selection state management uses internal constants | Maintained (no change) |
| Content type validation logic functions identically in all languages | Maintained (no change) |
| No layout breaks in any language | Task 12 |
| Two-column grid layout maintains consistent card heights | Task 12 |
| Single-column mobile layout displays correctly | Task 12 |
| Subtitle for "Upload File" displays without overflow | Task 12 |
| All tests pass | Tasks 10-11 |
| No missing translation warnings | Task 12 |
| Checkmark indicator displays consistently | Task 12 |
| Icon positioning remains consistent | Task 12 |
| Hover and focus states work with translated text | Task 12 |

---

## Notes

### Backward Compatibility

The `UNIFIED_CONTENT_OPTIONS` constant in `/src/components/ItemCreationWorkflow/utils/constants.ts` should NOT be modified. The labels and subtitles in the constant array serve as:
1. Fallback values
2. Reference for structural data (id, icon, contentType, contentSource)
3. Documentation of available options

The component now uses translations for display but relies on internal IDs for logic.

### Translation Key Naming Convention

- Internal content option IDs use kebab-case: `record-video`, `upload-file`
- Translation keys use camelCase: `recordVideo`, `uploadFile`
- The `CONTENT_OPTION_TO_KEY` mapping handles this conversion

### Subtitle Handling

Only the "Upload File" option has a subtitle ("Video, Image, PDF, Text"). The `getSubtitle` helper function handles this gracefully:
- Returns the translated subtitle for `upload-file`
- Returns `undefined` for all other options

### Auto-Advance Behavior

The auto-advance behavior (150ms delay after selection) operates on the internal option ID and contentType/contentSource values, not on displayed text. This ensures the behavior remains consistent across all languages.

### Test Strategy

The translation mock returns English strings to ensure existing test assertions continue to work. Tests that specifically verify translation functionality should be added as part of Epic 2's QA tasks.

### UNIFIED_CONTENT_OPTIONS Structure Reference

The current structure in `constants.ts`:
```typescript
export const UNIFIED_CONTENT_OPTIONS: UnifiedContentOption[] = [
  { id: 'record-video', label: 'Record Video', icon: 'Video', contentType: 'video', contentSource: 'create-new' },
  { id: 'take-photo', label: 'Take Photo', icon: 'Camera', contentType: 'photo', contentSource: 'create-new' },
  { id: 'write-text', label: 'Write Text', icon: 'PenLine', contentType: 'text', contentSource: 'create-new' },
  { id: 'upload-file', label: 'Upload File', subtitle: 'Video, Image, PDF, Text', icon: 'Upload', contentType: 'file-upload', contentSource: 'existing' },
  { id: 'add-link', label: 'Add Link', icon: 'Link', contentType: 'url', contentSource: 'existing' },
];
```

---

**Document Version:** 1.0
**Ready for Implementation:** Yes
