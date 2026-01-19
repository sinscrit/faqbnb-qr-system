# REQ-374: Update ItemTypeStep Component for Internationalization - Detailed Task Breakdown

**Last Modified:** 2026-01-19 19:30 UTC
**Document Type:** Detailed Implementation Specification
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task:** 2C.4 - Update ItemTypeStep
**Request Size:** M (Medium)
**Parent Document:** [REQ-374-update-itemtypestep-overview.md](./REQ-374-update-itemtypestep-overview.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Pre-Implementation Checklist](#2-pre-implementation-checklist)
3. [Task Breakdown](#3-task-breakdown)
4. [Implementation Details](#4-implementation-details)
5. [Translation Keys Specification](#5-translation-keys-specification)
6. [Test Updates](#6-test-updates)
7. [Validation Checklist](#7-validation-checklist)
8. [Risk Mitigation](#8-risk-mitigation)

---

## 1. Executive Summary

This document provides granular, step-by-step implementation tasks for internationalizing the `ItemTypeStep` component. The component is Step 2 of the Item Creation Workflow and displays three item type options (Appliance, Room Item, General Info) for user selection.

**Current State:** Component displays hardcoded English strings for headings, descriptions, item type labels, accessibility text, and navigation buttons.

**Target State:** All user-facing strings use `useTranslations` hook from `next-intl`, enabling display in 6 supported languages.

**Files to Modify:**
| File | Change Type |
|------|-------------|
| `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Component update |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx` | Test update |
| `messages/en.json` | Add translation keys |
| `messages/fr.json` | Add French translations |
| `messages/es.json` | Add Spanish translations |
| `messages/de.json` | Add German translations |
| `messages/nl.json` | Add Dutch translations |
| `messages/it.json` | Add Italian translations |

---

## 2. Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation complete (`next-intl` installed and configured)
- [ ] `useTranslations` hook available from `next-intl`
- [ ] Translation files exist at `/messages/*.json`
- [ ] Component can be rendered locally for testing
- [ ] Test suite passes before changes: `npm test -- ItemTypeStep`

---

## 3. Task Breakdown

### Task 3.1: Add Translation Keys to English Message File

**File:** `messages/en.json`
**Effort:** ~15 minutes
**Priority:** High (Prerequisite for all other tasks)

#### 3.1.1 Check if workflow namespace exists

Read `messages/en.json` and verify if `workflow` namespace exists. If not, create it.

#### 3.1.2 Add workflow.steps.itemType keys

Add the following keys under `workflow.steps.itemType`:

```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "What type of item is this?",
        "description": "Choose the category that best describes your item",
        "ariaLabel": "Select item type",
        "keyboardHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select."
      }
    }
  }
}
```

#### 3.1.3 Add workflow.itemTypes keys

Add the following keys under `workflow.itemTypes`:

```json
{
  "workflow": {
    "itemTypes": {
      "appliance": {
        "label": "Appliance",
        "description": "Washer, dryer, stove, refrigerator, etc."
      },
      "roomItem": {
        "label": "Room Item",
        "description": "Pantry, cabinets, closet, sink, etc."
      },
      "generalInfo": {
        "label": "General Info",
        "description": "Trash schedule, WiFi info, house rules, etc."
      }
    }
  }
}
```

**Note:** Item type keys use camelCase (`roomItem`, `generalInfo`) to match JSON key conventions, even though the actual item type values use hyphenated format (`room-item`, `general-info`).

#### 3.1.4 Add workflow.buttons keys (if not already present)

Check if `workflow.buttons.continue` exists. If not, add:

```json
{
  "workflow": {
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `workflow.steps.itemType.title` key exists with value "What type of item is this?"
- [ ] `workflow.steps.itemType.description` key exists
- [ ] `workflow.steps.itemType.ariaLabel` key exists
- [ ] `workflow.steps.itemType.keyboardHelp` key exists
- [ ] `workflow.itemTypes.appliance.label` and `.description` keys exist
- [ ] `workflow.itemTypes.roomItem.label` and `.description` keys exist
- [ ] `workflow.itemTypes.generalInfo.label` and `.description` keys exist
- [ ] `workflow.buttons.continue` key exists
- [ ] JSON file is valid (no syntax errors)

---

### Task 3.2: Update ItemTypeStep Component Imports

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~5 minutes
**Priority:** High

#### 3.2.1 Add useTranslations import

At the top of the file, after existing imports, add:

```typescript
import { useTranslations } from 'next-intl';
```

**Location:** After line 21 (after the `createKeyboardNavigator` import)

**Acceptance Criteria:**
- [ ] `useTranslations` is imported from 'next-intl'
- [ ] Import statement follows project conventions (alphabetical or grouped)
- [ ] No TypeScript errors on import

---

### Task 3.3: Initialize Translation Hook in Component

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~5 minutes
**Priority:** High

#### 3.3.1 Add translation hook initialization

Inside the `ItemTypeStep` function, before the `useState` call (around line 52), add:

```typescript
// Load workflow translations
const t = useTranslations('workflow');
```

**Acceptance Criteria:**
- [ ] `t` function is available in component scope
- [ ] Hook is called at the top level of the component (React hook rules)
- [ ] No runtime errors when component mounts

---

### Task 3.4: Create Item Type Translation Key Helper

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~10 minutes
**Priority:** High

#### 3.4.1 Add helper function for item type key mapping

Since item type values use hyphenated format (`room-item`, `general-info`) but JSON keys use camelCase, add a helper function inside the component or as a local constant:

```typescript
/**
 * Maps item type identifiers to translation key format.
 * Item types use hyphenated format, but translation keys use camelCase.
 */
const getItemTypeTranslationKey = (itemType: string): string => {
  const keyMap: Record<string, string> = {
    'appliance': 'appliance',
    'room-item': 'roomItem',
    'general-info': 'generalInfo',
  };
  return keyMap[itemType] || itemType;
};
```

**Location:** Inside the component function, after the `t` initialization, or as a module-level constant if preferred.

**Acceptance Criteria:**
- [ ] Helper function correctly maps 'appliance' to 'appliance'
- [ ] Helper function correctly maps 'room-item' to 'roomItem'
- [ ] Helper function correctly maps 'general-info' to 'generalInfo'
- [ ] Function handles unknown types gracefully (returns input)

---

### Task 3.5: Replace Hardcoded Step Header Strings

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~5 minutes
**Priority:** High

#### 3.5.1 Replace heading text (line 97-98)

**Before:**
```tsx
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  What type of item is this?
</h2>
```

**After:**
```tsx
<h2 className="text-2xl font-semibold text-[#222222] mb-2">
  {t('steps.itemType.title')}
</h2>
```

#### 3.5.2 Replace description text (line 100-102)

**Before:**
```tsx
<p className="text-base text-[#717171]">
  Choose the category that best describes your item
</p>
```

**After:**
```tsx
<p className="text-base text-[#717171]">
  {t('steps.itemType.description')}
</p>
```

**Acceptance Criteria:**
- [ ] Heading displays translated text in all languages
- [ ] Description displays translated text in all languages
- [ ] No hardcoded English text remains in header section
- [ ] Layout unchanged (spacing, styling preserved)

---

### Task 3.6: Replace ARIA Label and Accessibility Strings

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~5 minutes
**Priority:** High

#### 3.6.1 Replace radiogroup aria-label (line 108)

**Before:**
```tsx
<div
  role="radiogroup"
  aria-label="Select item type"
```

**After:**
```tsx
<div
  role="radiogroup"
  aria-label={t('steps.itemType.ariaLabel')}
```

#### 3.6.2 Replace screen reader help text (lines 127-129)

**Before:**
```tsx
<p id="item-type-help" className="sr-only">
  Use up and down arrow keys to navigate. Press Enter or Space to select.
</p>
```

**After:**
```tsx
<p id="item-type-help" className="sr-only">
  {t('steps.itemType.keyboardHelp')}
</p>
```

**Acceptance Criteria:**
- [ ] ARIA label uses translated string
- [ ] Screen reader help text uses translated string
- [ ] Accessibility remains functional (screen readers announce correctly)
- [ ] `aria-describedby` reference still points to correct element

---

### Task 3.7: Replace Item Type Labels and Descriptions

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~15 minutes
**Priority:** High

#### 3.7.1 Update ItemTypeCard props in map loop (lines 113-125)

**Before:**
```tsx
{ITEM_TYPES.map((type, index) => (
  <ItemTypeCard
    key={type}
    ref={(el) => { itemRefs.current[index] = el; }}
    itemType={type}
    label={ITEM_TYPE_LABELS[type]}
    description={ITEM_TYPE_DESCRIPTIONS[type]}
    icon={ITEM_TYPE_ICONS[type]}
    isSelected={currentItemType === type}
    onSelect={handleItemTypeSelect}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**After:**
```tsx
{ITEM_TYPES.map((type, index) => {
  const translationKey = getItemTypeTranslationKey(type);
  return (
    <ItemTypeCard
      key={type}
      ref={(el) => { itemRefs.current[index] = el; }}
      itemType={type}
      label={t(`itemTypes.${translationKey}.label`)}
      description={t(`itemTypes.${translationKey}.description`)}
      icon={ITEM_TYPE_ICONS[type]}
      isSelected={currentItemType === type}
      onSelect={handleItemTypeSelect}
      tabIndex={index === activeIndex ? 0 : -1}
    />
  );
})}
```

**Acceptance Criteria:**
- [ ] All three item type labels display translated text
- [ ] All three item type descriptions display translated text
- [ ] Card selection functionality unchanged
- [ ] Icons remain correctly associated with each type
- [ ] Keyboard navigation still works

---

### Task 3.8: Replace Continue Button Label

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~5 minutes
**Priority:** High

#### 3.8.1 Replace button text (line 147)

**Before:**
```tsx
<button
  type="button"
  onClick={handleContinue}
  disabled={!canNext}
  className={cn(/* ... */)}
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
  className={cn(/* ... */)}
  aria-disabled={!canNext}
>
  {t('buttons.continue')}
</button>
```

**Acceptance Criteria:**
- [ ] Continue button displays translated text
- [ ] Button functionality unchanged (click, disabled state)
- [ ] Button styling unchanged

---

### Task 3.9: Remove Unused Imports (Optional Cleanup)

**File:** `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`
**Effort:** ~5 minutes
**Priority:** Low

#### 3.9.1 Review and remove `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` imports

If these constants are no longer used in this file after the changes, remove them from the import statement:

**Before (line 19):**
```typescript
import { ITEM_TYPES, ITEM_TYPE_LABELS, ITEM_TYPE_DESCRIPTIONS } from '../../utils/constants';
```

**After:**
```typescript
import { ITEM_TYPES } from '../../utils/constants';
```

**Note:** Only remove if no other code in the file references these constants. The constants remain in `constants.ts` for potential use elsewhere or as fallback.

**Acceptance Criteria:**
- [ ] No unused imports remain in file
- [ ] TypeScript compilation succeeds
- [ ] No runtime errors

---

### Task 3.10: Update Test File - Add next-intl Mock

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx`
**Effort:** ~15 minutes
**Priority:** Medium

#### 3.10.1 Add next-intl mock at top of test file

Add the following mock before the test suite:

```typescript
// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string) => {
      const translations: Record<string, string> = {
        'steps.itemType.title': 'What type of item is this?',
        'steps.itemType.description': 'Choose the category that best describes your item',
        'steps.itemType.ariaLabel': 'Select item type',
        'steps.itemType.keyboardHelp': 'Use up and down arrow keys to navigate. Press Enter or Space to select.',
        'itemTypes.appliance.label': 'Appliance',
        'itemTypes.appliance.description': 'Washer, dryer, stove, refrigerator, etc.',
        'itemTypes.roomItem.label': 'Room Item',
        'itemTypes.roomItem.description': 'Pantry, cabinets, closet, sink, etc.',
        'itemTypes.generalInfo.label': 'General Info',
        'itemTypes.generalInfo.description': 'Trash schedule, WiFi info, house rules, etc.',
        'buttons.continue': 'Continue',
      };
      return translations[key] || key;
    };
  },
}));
```

**Location:** After imports, before `describe('ItemTypeStep', ...)` block

**Acceptance Criteria:**
- [ ] Mock provides all required translation keys
- [ ] Mock returns actual English text (tests verify behavior, not translation keys)
- [ ] All existing tests pass with mock in place

---

### Task 3.11: Verify and Update Test Assertions

**File:** `src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx`
**Effort:** ~10 minutes
**Priority:** Medium

#### 3.11.1 Review all text-based assertions

Since the mock returns English text, most assertions should still work. Verify these tests:

- `it('renders step title "What type of item is this?"', ...)` - Should pass
- `it('renders step description', ...)` - Should pass
- `it('renders item type labels correctly', ...)` - Should pass
- `it('renders item type descriptions', ...)` - Should pass
- `it('renders Continue button', ...)` - Should pass

#### 3.11.2 Update any failing assertions

If any tests fail due to exact string matching changes, update them to match the mock's output.

**Acceptance Criteria:**
- [ ] All 34 existing tests pass
- [ ] No test changes required beyond adding mock (if mock is correct)
- [ ] Test coverage remains at current level

---

### Task 3.12: Generate Non-English Translations

**File:** `messages/fr.json`, `messages/es.json`, `messages/de.json`, `messages/nl.json`, `messages/it.json`
**Effort:** ~20 minutes
**Priority:** Medium

#### 3.12.1 Add French translations to messages/fr.json

```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "Quel type d'article est-ce ?",
        "description": "Choisissez la categorie qui decrit le mieux votre article",
        "ariaLabel": "Selectionner le type d'article",
        "keyboardHelp": "Utilisez les fleches haut et bas pour naviguer. Appuyez sur Entree ou Espace pour selectionner."
      }
    },
    "itemTypes": {
      "appliance": {
        "label": "Appareil electromenager",
        "description": "Lave-linge, seche-linge, cuisiniere, refrigerateur, etc."
      },
      "roomItem": {
        "label": "Element de piece",
        "description": "Garde-manger, placards, penderie, evier, etc."
      },
      "generalInfo": {
        "label": "Informations generales",
        "description": "Horaires des poubelles, infos WiFi, reglement interieur, etc."
      }
    },
    "buttons": {
      "continue": "Continuer"
    }
  }
}
```

#### 3.12.2 Add Spanish translations to messages/es.json

```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "Que tipo de articulo es este?",
        "description": "Elige la categoria que mejor describe tu articulo",
        "ariaLabel": "Seleccionar tipo de articulo",
        "keyboardHelp": "Usa las teclas de flecha arriba y abajo para navegar. Presiona Enter o Espacio para seleccionar."
      }
    },
    "itemTypes": {
      "appliance": {
        "label": "Electrodomestico",
        "description": "Lavadora, secadora, estufa, refrigerador, etc."
      },
      "roomItem": {
        "label": "Elemento de habitacion",
        "description": "Despensa, gabinetes, armario, fregadero, etc."
      },
      "generalInfo": {
        "label": "Informacion general",
        "description": "Horario de basura, info WiFi, reglas de la casa, etc."
      }
    },
    "buttons": {
      "continue": "Continuar"
    }
  }
}
```

#### 3.12.3 Add German translations to messages/de.json

```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "Um welche Art von Gegenstand handelt es sich?",
        "description": "Wahlen Sie die Kategorie, die Ihren Gegenstand am besten beschreibt",
        "ariaLabel": "Gegenstandstyp auswahlen",
        "keyboardHelp": "Verwenden Sie die Pfeiltasten nach oben und unten zur Navigation. Drucken Sie Enter oder Leertaste zur Auswahl."
      }
    },
    "itemTypes": {
      "appliance": {
        "label": "Hausgerat",
        "description": "Waschmaschine, Trockner, Herd, Kuhlschrank usw."
      },
      "roomItem": {
        "label": "Raumgegenstand",
        "description": "Speisekammer, Schranke, Kleiderschrank, Spule usw."
      },
      "generalInfo": {
        "label": "Allgemeine Informationen",
        "description": "Mullabfuhrplan, WLAN-Info, Hausregeln usw."
      }
    },
    "buttons": {
      "continue": "Weiter"
    }
  }
}
```

#### 3.12.4 Add Dutch translations to messages/nl.json

```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "Wat voor type item is dit?",
        "description": "Kies de categorie die uw item het beste beschrijft",
        "ariaLabel": "Selecteer itemtype",
        "keyboardHelp": "Gebruik de pijltjestoetsen omhoog en omlaag om te navigeren. Druk op Enter of Spatie om te selecteren."
      }
    },
    "itemTypes": {
      "appliance": {
        "label": "Apparaat",
        "description": "Wasmachine, droger, fornuis, koelkast, enz."
      },
      "roomItem": {
        "label": "Kameritem",
        "description": "Voorraadkast, kasten, kledingkast, gootsteen, enz."
      },
      "generalInfo": {
        "label": "Algemene informatie",
        "description": "Afvalschema, WiFi-info, huisregels, enz."
      }
    },
    "buttons": {
      "continue": "Doorgaan"
    }
  }
}
```

#### 3.12.5 Add Italian translations to messages/it.json

```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "Che tipo di articolo e questo?",
        "description": "Scegli la categoria che descrive meglio il tuo articolo",
        "ariaLabel": "Seleziona il tipo di articolo",
        "keyboardHelp": "Usa i tasti freccia su e giu per navigare. Premi Invio o Spazio per selezionare."
      }
    },
    "itemTypes": {
      "appliance": {
        "label": "Elettrodomestico",
        "description": "Lavatrice, asciugatrice, fornello, frigorifero, ecc."
      },
      "roomItem": {
        "label": "Elemento della stanza",
        "description": "Dispensa, armadi, guardaroba, lavandino, ecc."
      },
      "generalInfo": {
        "label": "Informazioni generali",
        "description": "Orari raccolta rifiuti, info WiFi, regole della casa, ecc."
      }
    },
    "buttons": {
      "continue": "Continua"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 5 non-English language files updated
- [ ] All JSON files valid (no syntax errors)
- [ ] Translation keys match English file structure exactly
- [ ] Translations are contextually appropriate

---

### Task 3.13: Visual and Layout Testing

**Effort:** ~20 minutes
**Priority:** Medium

#### 3.13.1 Test in English (baseline)

1. Start development server: `npm run dev`
2. Navigate to Item Creation Workflow
3. Reach Step 2 (Item Type selection)
4. Verify all text displays correctly
5. Verify keyboard navigation works
6. Verify card selection works
7. Verify Continue button functions

#### 3.13.2 Test in German (longest text likely)

1. Change language to German
2. Navigate to Item Type step
3. Check for text overflow in item type cards
4. Verify card heights are consistent
5. Verify icon alignment is maintained
6. Check Continue button text fits

#### 3.13.3 Test in all other languages

Repeat visual inspection for French, Spanish, Dutch, and Italian.

#### 3.13.4 Test responsive layouts

1. Test on mobile viewport (375px width)
2. Test on tablet viewport (768px width)
3. Test on desktop viewport (1024px+ width)
4. Verify no layout breaks at any size

**Acceptance Criteria:**
- [ ] Component displays correctly in all 6 languages
- [ ] No text overflow or truncation
- [ ] Card heights remain consistent
- [ ] Icon alignment preserved
- [ ] Layout works on mobile, tablet, and desktop
- [ ] Keyboard navigation functional in all languages

---

## 4. Implementation Details

### 4.1 Final Component Code Reference

After all tasks complete, the key sections of `ItemTypeStep.tsx` should look like:

```typescript
// Imports (add useTranslations)
import { useTranslations } from 'next-intl';
import { ITEM_TYPES } from '../../utils/constants';
// ... other imports

// Inside component
export function ItemTypeStep({ /* props */ }: ItemTypeStepProps) {
  const t = useTranslations('workflow');

  const getItemTypeTranslationKey = (itemType: string): string => {
    const keyMap: Record<string, string> = {
      'appliance': 'appliance',
      'room-item': 'roomItem',
      'general-info': 'generalInfo',
    };
    return keyMap[itemType] || itemType;
  };

  // ... useState, handlers

  return (
    <div className={cn('flex flex-col flex-1 p-6', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#222222] mb-2">
          {t('steps.itemType.title')}
        </h2>
        <p className="text-base text-[#717171]">
          {t('steps.itemType.description')}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={t('steps.itemType.ariaLabel')}
        aria-describedby="item-type-help"
        className="flex flex-col gap-4"
        onKeyDown={handleListKeyDown}
      >
        {ITEM_TYPES.map((type, index) => {
          const translationKey = getItemTypeTranslationKey(type);
          return (
            <ItemTypeCard
              key={type}
              ref={(el) => { itemRefs.current[index] = el; }}
              itemType={type}
              label={t(`itemTypes.${translationKey}.label`)}
              description={t(`itemTypes.${translationKey}.description`)}
              icon={ITEM_TYPE_ICONS[type]}
              isSelected={currentItemType === type}
              onSelect={handleItemTypeSelect}
              tabIndex={index === activeIndex ? 0 : -1}
            />
          );
        })}
      </div>
      <p id="item-type-help" className="sr-only">
        {t('steps.itemType.keyboardHelp')}
      </p>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canNext}
          className={cn(/* ... */)}
          aria-disabled={!canNext}
        >
          {t('buttons.continue')}
        </button>
      </div>
    </div>
  );
}
```

### 4.2 Backward Compatibility

The constants `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS` remain in `constants.ts` for:
- Other components that may use them
- Fallback scenarios
- Debugging purposes

They can be deprecated in a future cleanup task once all components are migrated.

---

## 5. Translation Keys Specification

### 5.1 Complete Key List

| Key | English Value | Purpose |
|-----|---------------|---------|
| `workflow.steps.itemType.title` | What type of item is this? | Step heading |
| `workflow.steps.itemType.description` | Choose the category that best describes your item | Step subtitle |
| `workflow.steps.itemType.ariaLabel` | Select item type | Radiogroup ARIA label |
| `workflow.steps.itemType.keyboardHelp` | Use up and down arrow keys to navigate. Press Enter or Space to select. | Screen reader instructions |
| `workflow.itemTypes.appliance.label` | Appliance | Card title |
| `workflow.itemTypes.appliance.description` | Washer, dryer, stove, refrigerator, etc. | Card description |
| `workflow.itemTypes.roomItem.label` | Room Item | Card title |
| `workflow.itemTypes.roomItem.description` | Pantry, cabinets, closet, sink, etc. | Card description |
| `workflow.itemTypes.generalInfo.label` | General Info | Card title |
| `workflow.itemTypes.generalInfo.description` | Trash schedule, WiFi info, house rules, etc. | Card description |
| `workflow.buttons.continue` | Continue | Button label |

### 5.2 Key Naming Rationale

- **Namespace:** `workflow` - Groups all Item Creation Workflow translations
- **Path:** `steps.itemType` - Identifies this specific step within the workflow
- **itemTypes camelCase:** Avoids JSON key issues with hyphens (`room-item` -> `roomItem`)

---

## 6. Test Updates

### 6.1 Mock Implementation

The test mock should provide all translations to maintain test behavior:

```typescript
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'steps.itemType.title': 'What type of item is this?',
      'steps.itemType.description': 'Choose the category that best describes your item',
      'steps.itemType.ariaLabel': 'Select item type',
      'steps.itemType.keyboardHelp': 'Use up and down arrow keys to navigate. Press Enter or Space to select.',
      'itemTypes.appliance.label': 'Appliance',
      'itemTypes.appliance.description': 'Washer, dryer, stove, refrigerator, etc.',
      'itemTypes.roomItem.label': 'Room Item',
      'itemTypes.roomItem.description': 'Pantry, cabinets, closet, sink, etc.',
      'itemTypes.generalInfo.label': 'General Info',
      'itemTypes.generalInfo.description': 'Trash schedule, WiFi info, house rules, etc.',
      'buttons.continue': 'Continue',
    };
    return translations[key] || key;
  },
}));
```

### 6.2 Tests That Verify Translation Integration

Consider adding these optional tests:

```typescript
describe('Internationalization', () => {
  it('uses translation hook for step title', () => {
    render(<ItemTypeStep {...defaultProps} />);
    // Verify heading renders from translation
    expect(screen.getByRole('heading', { name: /what type of item/i })).toBeInTheDocument();
  });

  it('uses translated labels for item types', () => {
    render(<ItemTypeStep {...defaultProps} />);
    expect(screen.getByText('Appliance')).toBeInTheDocument();
    expect(screen.getByText('Room Item')).toBeInTheDocument();
    expect(screen.getByText('General Info')).toBeInTheDocument();
  });
});
```

---

## 7. Validation Checklist

### 7.1 Pre-Merge Checklist

- [ ] All translation keys added to `messages/en.json`
- [ ] Component imports `useTranslations` from `next-intl`
- [ ] Component uses `t()` for all user-facing strings
- [ ] No hardcoded English strings remain in JSX
- [ ] Test file includes `next-intl` mock
- [ ] All 34 existing tests pass
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] Console shows no missing translation warnings
- [ ] Component renders correctly in English

### 7.2 Language Testing Checklist

For each language (en, fr, es, de, nl, it):

- [ ] Step title displays correctly
- [ ] Step description displays correctly
- [ ] All 3 item type labels display correctly
- [ ] All 3 item type descriptions display correctly
- [ ] Continue button displays correctly
- [ ] No layout breaks or text overflow
- [ ] Keyboard navigation works
- [ ] Selection state management works
- [ ] Auto-advance on selection works

### 7.3 Accessibility Checklist

- [ ] ARIA label is translated and announced by screen readers
- [ ] Keyboard help text is translated
- [ ] Focus management unchanged
- [ ] Tab order preserved
- [ ] `aria-describedby` still connects correctly

---

## 8. Risk Mitigation

### 8.1 Identified Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| German text causes card overflow | Medium | Test with German locale; cards use flexible layout |
| Translation key typos | Low | Use constants/types where possible; test coverage |
| Missing mock in tests causes failures | Low | Add mock as first step of test file update |
| Hook called conditionally | Low | Place `useTranslations` at component top level |
| Runtime errors from missing keys | Low | next-intl returns key name as fallback |

### 8.2 Rollback Plan

If issues arise:

1. Revert component changes (restore hardcoded strings)
2. Keep translation files (no harm in extra keys)
3. Remove `useTranslations` import
4. Revert test mock

---

## References

- [Overview Document](/docs/REQ-374-update-itemtypestep-overview.md)
- [Request Definition](/docs/gen_requests_epic2.md#REQ-374)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Component Source](/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx)
- [Test File](/src/components/ItemCreationWorkflow/components/steps/__tests__/ItemTypeStep.test.tsx)
- [Constants File](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2C.4 - Update ItemTypeStep Component*
