# REQ-376: Update PurposeStep Component - Detailed Task Breakdown

**Document Created:** 2026-01-19 22:15 UTC
**Last Modified:** 2026-01-19 22:15 UTC
**Source Overview:** REQ-376-update-purposestep-overview.md
**Request Reference:** gen_requests_epic2.md (REQ-376)
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.6
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P2

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for internationalizing the PurposeStep component. The component currently contains 20+ hardcoded English strings that must be converted to use the `useTranslations` hook from `next-intl`. This breakdown enables autonomous implementation by AI coding agents or junior developers.

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
    "purposes": {},
    "accessibility": {},
    "buttons": {}
  }
}
```

#### 1.2 Add PurposeStep-specific translation keys

Add the following keys within the `workflow` namespace:

```json
{
  "workflow": {
    "steps": {
      "purpose": {
        "title": "What's the purpose of this content?",
        "subtitle": "Choose what you want to help guests with"
      }
    },
    "purposes": {
      "howToUse": {
        "label": "How to Use",
        "description": "Operating instructions and controls"
      },
      "howToClean": {
        "label": "How to Clean",
        "description": "Cleaning and care instructions"
      },
      "troubleshooting": {
        "label": "Troubleshooting",
        "description": "Common issues and fixes"
      },
      "safetyInfo": {
        "label": "Safety Information",
        "description": "Safety warnings and precautions"
      },
      "maintenance": {
        "label": "Maintenance",
        "description": "Regular maintenance tasks"
      },
      "features": {
        "label": "Features & Tips",
        "description": "Special features and tips"
      },
      "other": {
        "label": "Other",
        "description": "General information"
      }
    },
    "accessibility": {
      "purposeStep": {
        "ariaLabel": "Select content purpose",
        "keyboardHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select."
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
- [ ] All 20 keys are present:
  - 2 step header keys (title, subtitle)
  - 14 purpose keys (7 purposes × 2 fields each)
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
      "purpose": {
        "title": "Quel est l'objectif de ce contenu ?",
        "subtitle": "Choisissez comment vous souhaitez aider les invités"
      }
    },
    "purposes": {
      "howToUse": {
        "label": "Comment utiliser",
        "description": "Instructions d'utilisation et commandes"
      },
      "howToClean": {
        "label": "Comment nettoyer",
        "description": "Instructions de nettoyage et d'entretien"
      },
      "troubleshooting": {
        "label": "Dépannage",
        "description": "Problèmes courants et solutions"
      },
      "safetyInfo": {
        "label": "Informations de sécurité",
        "description": "Avertissements et précautions de sécurité"
      },
      "maintenance": {
        "label": "Maintenance",
        "description": "Tâches de maintenance régulières"
      },
      "features": {
        "label": "Fonctionnalités et astuces",
        "description": "Fonctionnalités spéciales et conseils"
      },
      "other": {
        "label": "Autre",
        "description": "Informations générales"
      }
    },
    "accessibility": {
      "purposeStep": {
        "ariaLabel": "Sélectionnez l'objectif du contenu",
        "keyboardHelp": "Utilisez les touches fléchées haut et bas pour naviguer. Appuyez sur Entrée ou Espace pour sélectionner."
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
      "purpose": {
        "title": "¿Cuál es el propósito de este contenido?",
        "subtitle": "Elige cómo quieres ayudar a los huéspedes"
      }
    },
    "purposes": {
      "howToUse": {
        "label": "Cómo usar",
        "description": "Instrucciones de funcionamiento y controles"
      },
      "howToClean": {
        "label": "Cómo limpiar",
        "description": "Instrucciones de limpieza y cuidado"
      },
      "troubleshooting": {
        "label": "Solución de problemas",
        "description": "Problemas comunes y soluciones"
      },
      "safetyInfo": {
        "label": "Información de seguridad",
        "description": "Advertencias y precauciones de seguridad"
      },
      "maintenance": {
        "label": "Mantenimiento",
        "description": "Tareas de mantenimiento regulares"
      },
      "features": {
        "label": "Características y consejos",
        "description": "Características especiales y consejos"
      },
      "other": {
        "label": "Otro",
        "description": "Información general"
      }
    },
    "accessibility": {
      "purposeStep": {
        "ariaLabel": "Selecciona el propósito del contenido",
        "keyboardHelp": "Usa las teclas de flecha arriba y abajo para navegar. Presiona Enter o Espacio para seleccionar."
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
      "purpose": {
        "title": "Was ist der Zweck dieses Inhalts?",
        "subtitle": "Wählen Sie, wie Sie Gästen helfen möchten"
      }
    },
    "purposes": {
      "howToUse": {
        "label": "Bedienungsanleitung",
        "description": "Bedienungsanleitungen und Steuerungen"
      },
      "howToClean": {
        "label": "Reinigungsanleitung",
        "description": "Reinigungs- und Pflegeanleitungen"
      },
      "troubleshooting": {
        "label": "Fehlerbehebung",
        "description": "Häufige Probleme und Lösungen"
      },
      "safetyInfo": {
        "label": "Sicherheitsinformationen",
        "description": "Sicherheitswarnungen und Vorsichtsmaßnahmen"
      },
      "maintenance": {
        "label": "Wartung",
        "description": "Regelmäßige Wartungsaufgaben"
      },
      "features": {
        "label": "Funktionen & Tipps",
        "description": "Besondere Funktionen und Tipps"
      },
      "other": {
        "label": "Sonstiges",
        "description": "Allgemeine Informationen"
      }
    },
    "accessibility": {
      "purposeStep": {
        "ariaLabel": "Inhaltszweck auswählen",
        "keyboardHelp": "Verwenden Sie die Pfeiltasten nach oben und unten zum Navigieren. Drücken Sie Enter oder Leertaste zum Auswählen."
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
      "purpose": {
        "title": "Wat is het doel van deze inhoud?",
        "subtitle": "Kies hoe je gasten wilt helpen"
      }
    },
    "purposes": {
      "howToUse": {
        "label": "Gebruiksaanwijzing",
        "description": "Bedieningsinstructies en bediening"
      },
      "howToClean": {
        "label": "Schoonmaakinstructies",
        "description": "Schoonmaak- en onderhoudsinstructies"
      },
      "troubleshooting": {
        "label": "Probleemoplossing",
        "description": "Veelvoorkomende problemen en oplossingen"
      },
      "safetyInfo": {
        "label": "Veiligheidsinformatie",
        "description": "Veiligheidswaarschuwingen en voorzorgsmaatregelen"
      },
      "maintenance": {
        "label": "Onderhoud",
        "description": "Regelmatige onderhoudstaken"
      },
      "features": {
        "label": "Functies & Tips",
        "description": "Speciale functies en tips"
      },
      "other": {
        "label": "Overig",
        "description": "Algemene informatie"
      }
    },
    "accessibility": {
      "purposeStep": {
        "ariaLabel": "Selecteer inhoudsdoel",
        "keyboardHelp": "Gebruik de pijltoetsen omhoog en omlaag om te navigeren. Druk op Enter of Spatie om te selecteren."
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
      "purpose": {
        "title": "Qual è lo scopo di questo contenuto?",
        "subtitle": "Scegli come vuoi aiutare gli ospiti"
      }
    },
    "purposes": {
      "howToUse": {
        "label": "Come usare",
        "description": "Istruzioni operative e comandi"
      },
      "howToClean": {
        "label": "Come pulire",
        "description": "Istruzioni per la pulizia e la cura"
      },
      "troubleshooting": {
        "label": "Risoluzione problemi",
        "description": "Problemi comuni e soluzioni"
      },
      "safetyInfo": {
        "label": "Informazioni sulla sicurezza",
        "description": "Avvertenze e precauzioni di sicurezza"
      },
      "maintenance": {
        "label": "Manutenzione",
        "description": "Attività di manutenzione regolari"
      },
      "features": {
        "label": "Funzionalità e suggerimenti",
        "description": "Funzionalità speciali e suggerimenti"
      },
      "other": {
        "label": "Altro",
        "description": "Informazioni generali"
      }
    },
    "accessibility": {
      "purposeStep": {
        "ariaLabel": "Seleziona lo scopo del contenuto",
        "keyboardHelp": "Usa i tasti freccia su e giù per navigare. Premi Invio o Spazio per selezionare."
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

### Task 3: Create Purpose Type to Translation Key Mapping

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
**Dependencies:** None (can be done in parallel with Task 1)

#### 3.1 Add mapping constant

Add the following constant after the existing imports and before the component definition (around line 40):

```typescript
/**
 * Maps internal purpose type constants (kebab-case) to translation keys (camelCase).
 * Required because PURPOSE_TYPES use kebab-case while JSON keys use camelCase.
 */
const PURPOSE_TYPE_TO_KEY: Record<PurposeType, string> = {
  'how-to-use': 'howToUse',
  'how-to-clean': 'howToClean',
  'troubleshooting': 'troubleshooting',
  'safety-info': 'safetyInfo',
  'maintenance': 'maintenance',
  'features': 'features',
  'other': 'other',
};
```

#### 3.2 Verification

- [ ] Mapping includes all 7 purpose types from `PURPOSE_TYPES`
- [ ] Key names match exactly with translation file keys
- [ ] TypeScript compiles without errors

---

### Task 4: Update PurposeStep Component Imports

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
**Dependencies:** Task 3

#### 4.1 Add useTranslations import

Modify the existing imports at the top of the file. Add after the React imports (around line 24):

```typescript
import { useTranslations } from 'next-intl';
```

#### 4.2 Keep existing constant imports

Keep the import for `PURPOSE_TYPES` but note that `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` will no longer be used for display:

**Current (line 37):**
```typescript
import { PURPOSE_TYPES, PURPOSE_LABELS, PURPOSE_DESCRIPTIONS } from '../../utils/constants';
```

**Updated:**
```typescript
import { PURPOSE_TYPES } from '../../utils/constants';
// Note: PURPOSE_LABELS and PURPOSE_DESCRIPTIONS are kept in constants.ts
// for backward compatibility but are no longer used in this component
```

#### 4.3 Verification

- [ ] `useTranslations` is imported from 'next-intl'
- [ ] `PURPOSE_TYPES` import is retained
- [ ] TypeScript compiles without errors

---

### Task 5: Initialize Translation Hook in Component

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
**Dependencies:** Task 4

#### 5.1 Add translation hook initialization

Inside the `PurposeStep` function (around line 86), add the translation hook initialization right after the opening of the function:

**Location:** After line 85 (component function signature)

```typescript
export function PurposeStep({
  currentPurpose,
  onSelectPurpose,
  onNext,
  canNext,
  className,
}: PurposeStepProps) {
  // Initialize translations for workflow namespace
  const t = useTranslations('workflow');

  // ... rest of component
```

#### 5.2 Add helper functions for purpose translations

Add these helper functions after the translation hook initialization:

```typescript
  // Helper functions to get translated purpose labels and descriptions
  const getPurposeLabel = (type: PurposeType) =>
    t(`purposes.${PURPOSE_TYPE_TO_KEY[type]}.label`);
  const getPurposeDescription = (type: PurposeType) =>
    t(`purposes.${PURPOSE_TYPE_TO_KEY[type]}.description`);
```

#### 5.3 Verification

- [ ] `useTranslations('workflow')` is called inside the component
- [ ] Helper functions are defined before JSX return
- [ ] TypeScript compiles without errors

---

### Task 6: Replace Hardcoded Header Strings

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
**Dependencies:** Task 5

#### 6.1 Replace step title

**Location:** Around line 132-134

**Before:**
```tsx
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  What&apos;s the purpose of this content?
</h2>
```

**After:**
```tsx
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  {t('steps.purpose.title')}
</h2>
```

#### 6.2 Replace step subtitle

**Location:** Around line 135-137

**Before:**
```tsx
<p className="text-base text-[#717171]">
  Choose what you want to help guests with
</p>
```

**After:**
```tsx
<p className="text-base text-[#717171]">
  {t('steps.purpose.subtitle')}
</p>
```

#### 6.3 Verification

- [ ] No hardcoded heading text remains
- [ ] No hardcoded subtitle text remains
- [ ] Component renders without errors

---

### Task 7: Replace Hardcoded ARIA Labels

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
**Dependencies:** Task 5

#### 7.1 Replace radiogroup aria-label

**Location:** Around line 143

**Before:**
```tsx
<div
  role="radiogroup"
  aria-label="Select content purpose"
  aria-describedby="purpose-help"
  className="flex flex-col gap-4"
  onKeyDown={handleListKeyDown}
>
```

**After:**
```tsx
<div
  role="radiogroup"
  aria-label={t('accessibility.purposeStep.ariaLabel')}
  aria-describedby="purpose-help"
  className="flex flex-col gap-4"
  onKeyDown={handleListKeyDown}
>
```

#### 7.2 Replace screen reader help text

**Location:** Around line 230-232

**Before:**
```tsx
<p id="purpose-help" className="sr-only">
  Use up and down arrow keys to navigate. Press Enter or Space to select.
</p>
```

**After:**
```tsx
<p id="purpose-help" className="sr-only">
  {t('accessibility.purposeStep.keyboardHelp')}
</p>
```

#### 7.3 Verification

- [ ] ARIA label uses translation
- [ ] Screen reader text uses translation
- [ ] Accessibility attributes are intact

---

### Task 8: Replace Purpose Labels and Descriptions

**Estimated Effort:** 1 story point
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
**Dependencies:** Task 5

#### 8.1 Replace PURPOSE_LABELS usage

**Location:** Around line 206-208

**Before:**
```tsx
<span
  className={cn(
    'block text-base sm:text-lg font-semibold',
    isSelected ? 'text-blue-700' : 'text-gray-900'
  )}
>
  {PURPOSE_LABELS[type]}
</span>
```

**After:**
```tsx
<span
  className={cn(
    'block text-base sm:text-lg font-semibold',
    isSelected ? 'text-blue-700' : 'text-gray-900'
  )}
>
  {getPurposeLabel(type as PurposeType)}
</span>
```

#### 8.2 Replace PURPOSE_DESCRIPTIONS usage

**Location:** Around line 215-217

**Before:**
```tsx
<span
  id={`${type}-description`}
  className={cn(
    'block mt-1 text-sm',
    isSelected ? 'text-blue-600' : 'text-gray-500'
  )}
>
  {PURPOSE_DESCRIPTIONS[type]}
</span>
```

**After:**
```tsx
<span
  id={`${type}-description`}
  className={cn(
    'block mt-1 text-sm',
    isSelected ? 'text-blue-600' : 'text-gray-500'
  )}
>
  {getPurposeDescription(type as PurposeType)}
</span>
```

#### 8.3 Verification

- [ ] All 7 purpose labels use translation function
- [ ] All 7 purpose descriptions use translation function
- [ ] No direct references to `PURPOSE_LABELS[type]` remain in JSX
- [ ] No direct references to `PURPOSE_DESCRIPTIONS[type]` remain in JSX

---

### Task 9: Replace Continue Button Text

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx`
**Dependencies:** Task 5

#### 9.1 Replace button text

**Location:** Around line 250

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
**File:** `/src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx`
**Dependencies:** Tasks 1-9

#### 10.1 Add translation mock

Add at the top of the test file, after the imports:

```typescript
// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'steps.purpose.title': "What's the purpose of this content?",
      'steps.purpose.subtitle': 'Choose what you want to help guests with',
      'purposes.howToUse.label': 'How to Use',
      'purposes.howToUse.description': 'Operating instructions and controls',
      'purposes.howToClean.label': 'How to Clean',
      'purposes.howToClean.description': 'Cleaning and care instructions',
      'purposes.troubleshooting.label': 'Troubleshooting',
      'purposes.troubleshooting.description': 'Common issues and fixes',
      'purposes.safetyInfo.label': 'Safety Information',
      'purposes.safetyInfo.description': 'Safety warnings and precautions',
      'purposes.maintenance.label': 'Maintenance',
      'purposes.maintenance.description': 'Regular maintenance tasks',
      'purposes.features.label': 'Features & Tips',
      'purposes.features.description': 'Special features and tips',
      'purposes.other.label': 'Other',
      'purposes.other.description': 'General information',
      'accessibility.purposeStep.ariaLabel': 'Select content purpose',
      'accessibility.purposeStep.keyboardHelp': 'Use up and down arrow keys to navigate. Press Enter or Space to select.',
      'buttons.continue': 'Continue',
    };
    return translations[key] || key;
  },
}));
```

#### 10.2 Update test assertions if needed

Most tests should continue to work with the mock returning the same English strings. If any tests fail due to text matching, update them to use the mocked translation values.

#### 10.3 Verification

- [ ] All existing tests pass with translation mock
- [ ] Mock covers all translation keys used in component
- [ ] No test relies on direct reference to `PURPOSE_LABELS` or `PURPOSE_DESCRIPTIONS` constants

---

### Task 11: Update Accessibility Tests (if applicable)

**Estimated Effort:** 0.5 story points
**File:** `/src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.a11y.test.tsx`
**Dependencies:** Task 10

#### 11.1 Add same translation mock

Add the same `vi.mock('next-intl', ...)` block as in Task 10.

#### 11.2 Verify accessibility tests pass

Run accessibility tests and verify all pass with the translation mock in place.

#### 11.3 Verification

- [ ] All accessibility tests pass
- [ ] ARIA attributes render with translated strings
- [ ] Screen reader announcements test correctly

---

### Task 12: Build Verification

**Estimated Effort:** 0.5 story points
**Files:** All modified files
**Dependencies:** All previous tasks

#### 12.1 Run TypeScript compilation

```bash
npm run type-check
# or
npx tsc --noEmit
```

#### 12.2 Run linting

```bash
npm run lint
```

#### 12.3 Run full test suite

```bash
npm test
```

#### 12.4 Run build

```bash
npm run build
```

#### 12.5 Verification

- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors
- [ ] All tests pass
- [ ] Build completes successfully

---

### Task 13: Visual QA Validation

**Estimated Effort:** 1 story point
**Files:** N/A (manual testing)
**Dependencies:** Task 12

#### 13.1 Test in English (en)

1. Navigate to the PurposeStep in the item creation workflow
2. Verify all 7 purpose options display correctly
3. Verify heading and subtitle display correctly
4. Verify Continue button displays "Continue"
5. Test keyboard navigation (arrow keys, Enter/Space)
6. Check console for missing translation warnings

#### 13.2 Test in French (fr)

1. Switch language to French
2. Repeat all checks from 13.1
3. Verify no text truncation or overflow
4. Check card heights remain consistent

#### 13.3 Test in German (de)

1. Switch language to German
2. Pay special attention to longer German translations
3. Verify no layout breaks with longer text
4. Verify card alignment and spacing

#### 13.4 Test in Spanish (es), Dutch (nl), Italian (it)

1. Repeat basic checks in each language
2. Verify no missing translations
3. Check layout consistency

#### 13.5 Cross-browser testing

1. Test in Chrome
2. Test in Firefox
3. Test in Safari (if available)

#### 13.6 Responsive testing

1. Test on mobile viewport (375px)
2. Test on tablet viewport (768px)
3. Test on desktop viewport (1024px+)

#### 13.7 Verification Checklist

- [ ] All 6 languages display without errors
- [ ] No missing translation warnings in console
- [ ] No layout breaks in any language
- [ ] Purpose card heights are consistent across languages
- [ ] Icon alignment is consistent regardless of text length
- [ ] Checkmark indicator displays correctly for selected state
- [ ] Keyboard navigation works in all languages
- [ ] Auto-advance on selection works correctly
- [ ] Touch targets meet minimum size requirements

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
- [ ] Task 3: Created PURPOSE_TYPE_TO_KEY mapping
- [ ] Task 4: Added useTranslations import
- [ ] Task 5: Initialized translation hook with helper functions
- [ ] Task 6: Replaced header strings (title, subtitle)
- [ ] Task 7: Replaced ARIA labels and screen reader text
- [ ] Task 8: Replaced purpose labels and descriptions
- [ ] Task 9: Replaced Continue button text

### Testing
- [ ] Task 10: Updated unit tests with translation mock
- [ ] Task 11: Updated accessibility tests with translation mock
- [ ] Task 12: Build verification passed

### QA
- [ ] Task 13: Visual QA validation complete

---

## Files Modified Summary

| File | Change Type | Lines Changed (Est.) |
|------|-------------|---------------------|
| `/messages/en.json` | Add keys | +30 lines |
| `/messages/fr.json` | Add keys | +30 lines |
| `/messages/es.json` | Add keys | +30 lines |
| `/messages/de.json` | Add keys | +30 lines |
| `/messages/nl.json` | Add keys | +30 lines |
| `/messages/it.json` | Add keys | +30 lines |
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Modify | ~25 lines |
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.test.tsx` | Modify | ~30 lines |
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PurposeStep.a11y.test.tsx` | Modify | ~30 lines |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementing Task |
|---------------------|-------------------|
| Component imports useTranslations hook | Task 4 |
| Workflow namespace loaded correctly | Task 5 |
| Heading uses translation key | Task 6.1 |
| Subtitle uses translation key | Task 6.2 |
| All 7 purpose labels use translation keys | Task 8.1 |
| All 7 purpose descriptions use translation keys | Task 8.2 |
| Continue button uses translation key | Task 9 |
| ARIA label uses translated string | Task 7.1 |
| Screen reader help uses translated string | Task 7.2 |
| No hardcoded English strings remain | Tasks 6-9 |
| Keyboard navigation works in all languages | Task 13.1-13.4 |
| Auto-advance works correctly | Task 13.1 |
| Selection state uses internal constants | Maintained (no change) |
| No layout breaks in any language | Task 13 |
| All tests pass | Tasks 10-12 |
| No missing translation warnings | Task 13 |

---

## Notes

### Backward Compatibility

The `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS` constants in `/src/components/ItemCreationWorkflow/utils/constants.ts` should NOT be deleted. They may be used by:
- `generateArticleTitle()` function for automatic title generation
- Other components that haven't been internationalized yet

### Translation Key Naming Convention

- Internal purpose types use kebab-case: `how-to-use`, `safety-info`
- Translation keys use camelCase: `howToUse`, `safetyInfo`
- The `PURPOSE_TYPE_TO_KEY` mapping handles this conversion

### Test Strategy

The translation mock returns English strings to ensure existing test assertions continue to work. Tests that specifically verify translation functionality should be added as part of Epic 2's QA tasks.

---

**Document Version:** 1.0
**Ready for Implementation:** Yes
