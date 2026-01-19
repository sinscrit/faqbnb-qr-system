# REQ-373: Update RoomSelectionStep Component for Internationalization - Detailed Task Breakdown

**Last Modified:** 2026-01-19 16:45 UTC
**Document Type:** Detailed Implementation Tasks
**Epic:** Epic 2: Static UI Localization
**Phase:** Phase 2C (Item Creation Workflow)
**Task:** 2C.3 - Update RoomSelectionStep component
**Request Size:** M (Medium)
**Overview Document:** REQ-373-update-roomselectionstep-overview.md
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This document provides granular, actionable tasks for internationalizing the `RoomSelectionStep` component. Each task is designed to be approximately 1 story point and can be executed independently where dependencies allow. The component is Step 1 of the Item Creation Workflow and must support all 6 languages (en, fr, es, de, nl, it).

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (`next-intl` installed and configured)
- [ ] Translation files exist in `/messages/` for all 6 locales
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] Existing `workflow` namespace structure (if any) is understood
- [ ] Component renders correctly in current state

---

## Task Breakdown

### Task 1: Verify/Create Workflow Namespace Structure in en.json

**Priority:** High (Prerequisite)
**Estimated Effort:** 15 minutes
**Story Points:** 1

**Description:**
Check if the `workflow` namespace exists in `/messages/en.json`. If it doesn't exist, create the base structure. If it exists partially, extend it with the `steps.roomSelection` keys.

**Acceptance Criteria:**
- [ ] `/messages/en.json` contains `workflow` namespace
- [ ] `workflow.steps.roomSelection` sub-namespace exists
- [ ] `workflow.rooms` sub-namespace exists
- [ ] `workflow.forms.customRoom` sub-namespace exists
- [ ] `workflow.buttons` sub-namespace exists (or reuse `common` if appropriate)

**Files to Modify:**
| File | Action |
|------|--------|
| `/messages/en.json` | Add workflow namespace structure |

**Implementation Details:**

Add the following structure to `/messages/en.json`:

```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Select a Room",
        "description": "Choose where this item is located in your property",
        "ariaLabel": "Select a room for your item",
        "keyboardHelp": "Use arrow keys to navigate between rooms. Press Enter or Space to select."
      }
    },
    "rooms": {
      "kitchen": "Kitchen",
      "laundry": "Laundry Room",
      "bedroom": "Bedroom",
      "bathroom": "Bathroom",
      "livingRoom": "Living Room",
      "garage": "Garage",
      "outdoor": "Outdoor/Patio",
      "general": "General/Whole Property",
      "other": "Other"
    },
    "forms": {
      "customRoom": {
        "label": "Enter room name",
        "placeholder": "e.g., Home Office, Wine Cellar, Mudroom",
        "maxLength": "Maximum {max} characters"
      }
    },
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

**Notes:**
- Room key `living-room` maps to `livingRoom` in JSON (camelCase for JSON keys)
- Use ICU message format for `maxLength` with `{max}` interpolation variable
- Consider if `workflow.buttons.continue` should reuse `common.next` or stay workflow-specific

---

### Task 2: Add useTranslations Import and Hook Initialization

**Priority:** High
**Estimated Effort:** 10 minutes
**Story Points:** 0.5

**Description:**
Import the `useTranslations` hook from `next-intl` and initialize it with the `workflow` namespace at the top of the component function body.

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized: `const t = useTranslations('workflow');`
- [ ] Component still renders without errors
- [ ] No TypeScript errors introduced

**Files to Modify:**
| File | Location | Change |
|------|----------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Line 26 (imports) | Add `import { useTranslations } from 'next-intl';` |
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Line 62 (inside function) | Add `const t = useTranslations('workflow');` |

**Code Change:**

```typescript
// At imports (around line 26)
import { useTranslations } from 'next-intl';

// Inside RoomSelectionStep function (line 62, after props destructuring)
export function RoomSelectionStep({
  currentRoom,
  onSelectRoom,
  onNext,
  canNext,
  className,
}: RoomSelectionStepProps) {
  const t = useTranslations('workflow');
  // ... rest of component
```

---

### Task 3: Create Room Type to Translation Key Helper Function

**Priority:** High
**Estimated Effort:** 15 minutes
**Story Points:** 1

**Description:**
Create a helper function to map hyphenated room type identifiers (e.g., `living-room`) to camelCase translation keys (e.g., `livingRoom`). This function ensures consistent key mapping throughout the component.

**Acceptance Criteria:**
- [ ] Helper function `getRoomTranslationKey` created
- [ ] Function handles all 9 room types correctly
- [ ] Function returns input unchanged if no mapping exists (fallback)
- [ ] Function is type-safe with TypeScript

**Files to Modify:**
| File | Location | Change |
|------|----------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Before component (after imports) | Add helper function |

**Code Change:**

```typescript
// Add after imports, before component definition

/**
 * Maps room type identifiers to translation keys.
 * Handles hyphenated room types (e.g., 'living-room' -> 'livingRoom').
 */
const getRoomTranslationKey = (room: string): string => {
  const keyMap: Record<string, string> = {
    'kitchen': 'kitchen',
    'laundry': 'laundry',
    'bedroom': 'bedroom',
    'bathroom': 'bathroom',
    'living-room': 'livingRoom',
    'garage': 'garage',
    'outdoor': 'outdoor',
    'general': 'general',
    'other': 'other',
  };
  return keyMap[room] || room;
};
```

**Notes:**
- This could alternatively be placed in `utils/constants.ts` for reuse, but keeping it local reduces coupling
- The fallback (`|| room`) ensures graceful handling of unknown room types

---

### Task 4: Replace Step Header Hardcoded Strings

**Priority:** High
**Estimated Effort:** 10 minutes
**Story Points:** 0.5

**Description:**
Replace the hardcoded step heading ("Select a Room") and description text with translation function calls.

**Acceptance Criteria:**
- [ ] Heading uses `t('steps.roomSelection.title')`
- [ ] Description uses `t('steps.roomSelection.description')`
- [ ] Visual appearance unchanged in English
- [ ] Text displays correctly in browser

**Files to Modify:**
| File | Lines | Change |
|------|-------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 141-146 | Replace hardcoded strings |

**Before (Lines 140-147):**
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    Select a Room
  </h2>
  <p className="text-base text-[#717171]">
    Choose where this item is located in your property
  </p>
</div>
```

**After:**
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-semibold text-[#222222] mb-2">
    {t('steps.roomSelection.title')}
  </h2>
  <p className="text-base text-[#717171]">
    {t('steps.roomSelection.description')}
  </p>
</div>
```

---

### Task 5: Replace Radiogroup ARIA Label

**Priority:** High
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

**Description:**
Replace the hardcoded ARIA label on the room grid radiogroup with a translated string for accessibility.

**Acceptance Criteria:**
- [ ] `aria-label` uses `t('steps.roomSelection.ariaLabel')`
- [ ] Accessibility tree shows translated label
- [ ] Screen readers announce correct label

**Files to Modify:**
| File | Line | Change |
|------|------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 152 | Replace aria-label |

**Before (Line 150-156):**
```tsx
<div
  role="radiogroup"
  aria-label="Select a room for your item"
  aria-describedby="room-selection-help"
  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
  onKeyDown={handleGridKeyDown}
>
```

**After:**
```tsx
<div
  role="radiogroup"
  aria-label={t('steps.roomSelection.ariaLabel')}
  aria-describedby="room-selection-help"
  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
  onKeyDown={handleGridKeyDown}
>
```

---

### Task 6: Replace Room Labels with Translated Values

**Priority:** High
**Estimated Effort:** 15 minutes
**Story Points:** 1

**Description:**
Replace the `ROOM_LABELS[room]` constant lookup with translated room labels using the `t()` function and the helper created in Task 3.

**Acceptance Criteria:**
- [ ] RoomCard receives translated label instead of constant lookup
- [ ] All 9 room labels display correctly in English
- [ ] No runtime errors when rendering room grid
- [ ] RoomCard component unchanged (receives label as prop)

**Files to Modify:**
| File | Lines | Change |
|------|-------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 157-168 | Replace label prop value |

**Before (Lines 157-168):**
```tsx
{ROOM_TYPES.map((room, index) => (
  <RoomCard
    key={room}
    ref={(el) => { roomRefs.current[index] = el; }}
    room={room}
    label={ROOM_LABELS[room]}
    icon={ROOM_ICONS[room]}
    isSelected={currentRoom === room}
    onSelect={handleRoomSelect}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**After:**
```tsx
{ROOM_TYPES.map((room, index) => (
  <RoomCard
    key={room}
    ref={(el) => { roomRefs.current[index] = el; }}
    room={room}
    label={t(`rooms.${getRoomTranslationKey(room)}`)}
    icon={ROOM_ICONS[room]}
    isSelected={currentRoom === room}
    onSelect={handleRoomSelect}
    tabIndex={index === activeIndex ? 0 : -1}
  />
))}
```

**Notes:**
- The `ROOM_LABELS` import can be removed if no longer used elsewhere in the file
- `ROOM_ICONS` remains unchanged as icons are language-independent

---

### Task 7: Replace Screen Reader Help Text

**Priority:** Medium
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

**Description:**
Replace the hardcoded screen reader help text with a translated string.

**Acceptance Criteria:**
- [ ] Screen reader help uses `t('steps.roomSelection.keyboardHelp')`
- [ ] Text remains in `sr-only` class for visual hiding
- [ ] Screen readers can access the help text

**Files to Modify:**
| File | Lines | Change |
|------|-------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 170-172 | Replace text content |

**Before (Lines 170-172):**
```tsx
<p id="room-selection-help" className="sr-only">
  Use arrow keys to navigate between rooms. Press Enter or Space to select.
</p>
```

**After:**
```tsx
<p id="room-selection-help" className="sr-only">
  {t('steps.roomSelection.keyboardHelp')}
</p>
```

---

### Task 8: Replace Custom Room Input Label

**Priority:** High
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

**Description:**
Replace the hardcoded label for the custom room name input field.

**Acceptance Criteria:**
- [ ] Label uses `t('forms.customRoom.label')`
- [ ] Label-input association maintained via `htmlFor`
- [ ] Label displays correctly when "Other" is selected

**Files to Modify:**
| File | Lines | Change |
|------|-------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 177-181 | Replace label text |

**Before (Lines 176-182):**
```tsx
<label
  htmlFor="custom-room-input"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  Enter room name
</label>
```

**After:**
```tsx
<label
  htmlFor="custom-room-input"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  {t('forms.customRoom.label')}
</label>
```

---

### Task 9: Replace Custom Room Input Placeholder

**Priority:** High
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

**Description:**
Replace the hardcoded placeholder text for the custom room name input with translated text.

**Acceptance Criteria:**
- [ ] Placeholder uses `t('forms.customRoom.placeholder')`
- [ ] Placeholder displays locale-appropriate examples
- [ ] Input field functions correctly

**Files to Modify:**
| File | Line | Change |
|------|------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 188 | Replace placeholder attribute |

**Before (Line 188):**
```tsx
placeholder="e.g., Home Office, Wine Cellar, Mudroom"
```

**After:**
```tsx
placeholder={t('forms.customRoom.placeholder')}
```

---

### Task 10: Replace Character Limit Hint with Interpolation

**Priority:** High
**Estimated Effort:** 10 minutes
**Story Points:** 0.5

**Description:**
Replace the hardcoded character limit hint with a translated string using ICU message format interpolation for the max value.

**Acceptance Criteria:**
- [ ] Hint uses `t('forms.customRoom.maxLength', { max: 50 })`
- [ ] ICU interpolation works correctly
- [ ] "50" appears in the translated string
- [ ] Hint displays correctly below input

**Files to Modify:**
| File | Lines | Change |
|------|-------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 200-202 | Replace text with interpolated translation |

**Before (Lines 200-202):**
```tsx
<p id="custom-room-hint" className="mt-1 text-sm text-[#717171]">
  Maximum 50 characters
</p>
```

**After:**
```tsx
<p id="custom-room-hint" className="mt-1 text-sm text-[#717171]">
  {t('forms.customRoom.maxLength', { max: 50 })}
</p>
```

---

### Task 11: Replace Continue Button Text

**Priority:** High
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

**Description:**
Replace the hardcoded "Continue" button text with a translated string.

**Acceptance Criteria:**
- [ ] Button uses `t('buttons.continue')`
- [ ] Button styling unchanged
- [ ] Button enabled/disabled states work correctly

**Files to Modify:**
| File | Line | Change |
|------|------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 222 | Replace button text |

**Before (Line 222):**
```tsx
>
  Continue
</button>
```

**After:**
```tsx
>
  {t('buttons.continue')}
</button>
```

---

### Task 12: Clean Up Unused ROOM_LABELS Import (Optional)

**Priority:** Low
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

**Description:**
If `ROOM_LABELS` is no longer used in the component after Task 6, remove it from the import statement to keep the code clean.

**Acceptance Criteria:**
- [ ] `ROOM_LABELS` removed from import if unused
- [ ] No TypeScript errors
- [ ] Import statement only includes used constants

**Files to Modify:**
| File | Line | Change |
|------|------|--------|
| `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | 29 | Remove ROOM_LABELS from import |

**Before (Line 29):**
```typescript
import { ROOM_TYPES, ROOM_LABELS, ROOM_ICONS } from '../../utils/constants';
```

**After:**
```typescript
import { ROOM_TYPES, ROOM_ICONS } from '../../utils/constants';
```

**Notes:**
- Only remove if `ROOM_LABELS` is not used elsewhere in the file
- The constant remains available in `constants.ts` for other components

---

### Task 13: Add Translations to French (fr.json)

**Priority:** Medium
**Estimated Effort:** 10 minutes
**Story Points:** 1

**Description:**
Add French translations for all RoomSelectionStep strings to `/messages/fr.json`.

**Acceptance Criteria:**
- [ ] All keys from Task 1 have French translations
- [ ] Translations are contextually appropriate
- [ ] ICU interpolation syntax preserved (e.g., `{max}`)

**Files to Modify:**
| File | Action |
|------|--------|
| `/messages/fr.json` | Add workflow namespace with French translations |

**Translation Content:**

```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Sélectionner une pièce",
        "description": "Choisissez où cet article se trouve dans votre propriété",
        "ariaLabel": "Sélectionner une pièce pour votre article",
        "keyboardHelp": "Utilisez les touches fléchées pour naviguer entre les pièces. Appuyez sur Entrée ou Espace pour sélectionner."
      }
    },
    "rooms": {
      "kitchen": "Cuisine",
      "laundry": "Buanderie",
      "bedroom": "Chambre",
      "bathroom": "Salle de bain",
      "livingRoom": "Salon",
      "garage": "Garage",
      "outdoor": "Extérieur/Terrasse",
      "general": "Général/Propriété entière",
      "other": "Autre"
    },
    "forms": {
      "customRoom": {
        "label": "Entrez le nom de la pièce",
        "placeholder": "ex., Bureau, Cave à vin, Entrée",
        "maxLength": "Maximum {max} caractères"
      }
    },
    "buttons": {
      "continue": "Continuer"
    }
  }
}
```

---

### Task 14: Add Translations to Spanish (es.json)

**Priority:** Medium
**Estimated Effort:** 10 minutes
**Story Points:** 1

**Description:**
Add Spanish translations for all RoomSelectionStep strings to `/messages/es.json`.

**Acceptance Criteria:**
- [ ] All keys from Task 1 have Spanish translations
- [ ] Translations are contextually appropriate
- [ ] ICU interpolation syntax preserved

**Files to Modify:**
| File | Action |
|------|--------|
| `/messages/es.json` | Add workflow namespace with Spanish translations |

**Translation Content:**

```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Seleccionar una habitación",
        "description": "Elige dónde se encuentra este artículo en tu propiedad",
        "ariaLabel": "Seleccionar una habitación para tu artículo",
        "keyboardHelp": "Usa las teclas de flecha para navegar entre habitaciones. Presiona Enter o Espacio para seleccionar."
      }
    },
    "rooms": {
      "kitchen": "Cocina",
      "laundry": "Lavandería",
      "bedroom": "Dormitorio",
      "bathroom": "Baño",
      "livingRoom": "Sala de estar",
      "garage": "Garaje",
      "outdoor": "Exterior/Patio",
      "general": "General/Propiedad completa",
      "other": "Otro"
    },
    "forms": {
      "customRoom": {
        "label": "Ingresa el nombre de la habitación",
        "placeholder": "ej., Oficina en casa, Bodega, Recibidor",
        "maxLength": "Máximo {max} caracteres"
      }
    },
    "buttons": {
      "continue": "Continuar"
    }
  }
}
```

---

### Task 15: Add Translations to German (de.json)

**Priority:** Medium
**Estimated Effort:** 10 minutes
**Story Points:** 1

**Description:**
Add German translations for all RoomSelectionStep strings to `/messages/de.json`.

**Acceptance Criteria:**
- [ ] All keys from Task 1 have German translations
- [ ] Translations are contextually appropriate
- [ ] ICU interpolation syntax preserved
- [ ] Longer German text doesn't break layout (verify in Task 20)

**Files to Modify:**
| File | Action |
|------|--------|
| `/messages/de.json` | Add workflow namespace with German translations |

**Translation Content:**

```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Raum auswählen",
        "description": "Wählen Sie, wo sich dieser Artikel in Ihrer Immobilie befindet",
        "ariaLabel": "Wählen Sie einen Raum für Ihren Artikel",
        "keyboardHelp": "Verwenden Sie die Pfeiltasten, um zwischen Räumen zu navigieren. Drücken Sie Eingabe oder Leertaste zum Auswählen."
      }
    },
    "rooms": {
      "kitchen": "Küche",
      "laundry": "Waschküche",
      "bedroom": "Schlafzimmer",
      "bathroom": "Badezimmer",
      "livingRoom": "Wohnzimmer",
      "garage": "Garage",
      "outdoor": "Außenbereich/Terrasse",
      "general": "Allgemein/Gesamtes Objekt",
      "other": "Andere"
    },
    "forms": {
      "customRoom": {
        "label": "Raumname eingeben",
        "placeholder": "z.B., Homeoffice, Weinkeller, Diele",
        "maxLength": "Maximal {max} Zeichen"
      }
    },
    "buttons": {
      "continue": "Weiter"
    }
  }
}
```

---

### Task 16: Add Translations to Dutch (nl.json)

**Priority:** Medium
**Estimated Effort:** 10 minutes
**Story Points:** 1

**Description:**
Add Dutch translations for all RoomSelectionStep strings to `/messages/nl.json`.

**Acceptance Criteria:**
- [ ] All keys from Task 1 have Dutch translations
- [ ] Translations are contextually appropriate
- [ ] ICU interpolation syntax preserved

**Files to Modify:**
| File | Action |
|------|--------|
| `/messages/nl.json` | Add workflow namespace with Dutch translations |

**Translation Content:**

```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Selecteer een kamer",
        "description": "Kies waar dit item zich bevindt in uw woning",
        "ariaLabel": "Selecteer een kamer voor uw item",
        "keyboardHelp": "Gebruik de pijltjestoetsen om tussen kamers te navigeren. Druk op Enter of Spatie om te selecteren."
      }
    },
    "rooms": {
      "kitchen": "Keuken",
      "laundry": "Wasruimte",
      "bedroom": "Slaapkamer",
      "bathroom": "Badkamer",
      "livingRoom": "Woonkamer",
      "garage": "Garage",
      "outdoor": "Buiten/Terras",
      "general": "Algemeen/Gehele woning",
      "other": "Anders"
    },
    "forms": {
      "customRoom": {
        "label": "Voer kamernaam in",
        "placeholder": "bijv., Thuiskantoor, Wijnkelder, Hal",
        "maxLength": "Maximaal {max} tekens"
      }
    },
    "buttons": {
      "continue": "Doorgaan"
    }
  }
}
```

---

### Task 17: Add Translations to Italian (it.json)

**Priority:** Medium
**Estimated Effort:** 10 minutes
**Story Points:** 1

**Description:**
Add Italian translations for all RoomSelectionStep strings to `/messages/it.json`.

**Acceptance Criteria:**
- [ ] All keys from Task 1 have Italian translations
- [ ] Translations are contextually appropriate
- [ ] ICU interpolation syntax preserved

**Files to Modify:**
| File | Action |
|------|--------|
| `/messages/it.json` | Add workflow namespace with Italian translations |

**Translation Content:**

```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Seleziona una stanza",
        "description": "Scegli dove si trova questo articolo nella tua proprietà",
        "ariaLabel": "Seleziona una stanza per il tuo articolo",
        "keyboardHelp": "Usa i tasti freccia per navigare tra le stanze. Premi Invio o Spazio per selezionare."
      }
    },
    "rooms": {
      "kitchen": "Cucina",
      "laundry": "Lavanderia",
      "bedroom": "Camera da letto",
      "bathroom": "Bagno",
      "livingRoom": "Soggiorno",
      "garage": "Garage",
      "outdoor": "Esterno/Patio",
      "general": "Generale/Intera proprietà",
      "other": "Altro"
    },
    "forms": {
      "customRoom": {
        "label": "Inserisci il nome della stanza",
        "placeholder": "es., Ufficio, Cantina, Ingresso",
        "maxLength": "Massimo {max} caratteri"
      }
    },
    "buttons": {
      "continue": "Continua"
    }
  }
}
```

---

### Task 18: Update Unit Tests for Translation Compatibility

**Priority:** Medium
**Estimated Effort:** 30 minutes
**Story Points:** 2

**Description:**
Update the test file to properly mock `next-intl` and adjust assertions that rely on specific English strings. Tests should verify behavior rather than exact text content where appropriate.

**Acceptance Criteria:**
- [ ] `next-intl` properly mocked in test setup
- [ ] Tests that check for specific text updated or made translation-agnostic
- [ ] All existing tests pass
- [ ] No new test failures introduced
- [ ] Mock returns realistic English translations for verification

**Files to Modify:**
| File | Action |
|------|--------|
| `src/components/ItemCreationWorkflow/components/steps/__tests__/RoomSelectionStep.test.tsx` | Add mock, update assertions |

**Implementation Details:**

Add mock at the top of the test file:

```typescript
// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'steps.roomSelection.title': 'Select a Room',
        'steps.roomSelection.description': 'Choose where this item is located in your property',
        'steps.roomSelection.ariaLabel': 'Select a room for your item',
        'steps.roomSelection.keyboardHelp': 'Use arrow keys to navigate between rooms. Press Enter or Space to select.',
        'rooms.kitchen': 'Kitchen',
        'rooms.laundry': 'Laundry Room',
        'rooms.bedroom': 'Bedroom',
        'rooms.bathroom': 'Bathroom',
        'rooms.livingRoom': 'Living Room',
        'rooms.garage': 'Garage',
        'rooms.outdoor': 'Outdoor/Patio',
        'rooms.general': 'General/Whole Property',
        'rooms.other': 'Other',
        'forms.customRoom.label': 'Enter room name',
        'forms.customRoom.placeholder': 'e.g., Home Office, Wine Cellar, Mudroom',
        'forms.customRoom.maxLength': `Maximum ${params?.max || 50} characters`,
        'buttons.continue': 'Continue',
      };
      return translations[key] || key;
    };
  },
}));
```

**Tests that may need adjustment:**
- Line 29-33: `renders step title "Select a Room"` - Should still pass with mock
- Line 36-41: `renders step description` - Should still pass with mock
- Line 49-59: `renders room labels correctly` - Should still pass with mock
- Line 143-149: `has placeholder text in custom input` - Should still pass with mock
- Line 158-161: `shows character limit hint` - Should still pass with mock
- Lines 250-255: `has aria-label on radiogroup` - Update to check for translated string

---

### Task 19: Run Build and Verify No TypeScript Errors

**Priority:** High
**Estimated Effort:** 10 minutes
**Story Points:** 0.5

**Description:**
Run the TypeScript build to ensure no type errors were introduced during the internationalization changes.

**Acceptance Criteria:**
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors in RoomSelectionStep.tsx
- [ ] No type errors in translation function calls
- [ ] No warnings related to i18n in console

**Commands to Run:**
```bash
npm run build
# or
npx tsc --noEmit
```

---

### Task 20: Visual Testing in All 6 Languages

**Priority:** Medium
**Estimated Effort:** 20 minutes
**Story Points:** 1

**Description:**
Manually test the component in all 6 languages to verify:
1. All strings display correctly
2. No layout breaks with longer text (especially German)
3. Grid maintains proper alignment
4. Custom input displays correctly in all locales

**Acceptance Criteria:**
- [ ] English (en) displays correctly
- [ ] French (fr) displays correctly
- [ ] Spanish (es) displays correctly
- [ ] German (de) displays correctly - verify no text overflow
- [ ] Dutch (nl) displays correctly
- [ ] Italian (it) displays correctly
- [ ] Room grid maintains 2/3/4 column layout across breakpoints
- [ ] Custom room input placeholder doesn't overflow
- [ ] Continue button text fits within button bounds

**Testing Steps:**
1. Start development server: `npm run dev`
2. Navigate to Item Creation Workflow
3. Test step 1 (Room Selection) in each locale:
   - Change locale via language switcher or URL parameter
   - Verify heading and description
   - Verify all 9 room labels
   - Select "Other" and verify custom input UI
   - Check responsive behavior at mobile/tablet/desktop widths

---

### Task 21: Verify Keyboard Navigation Still Works

**Priority:** Medium
**Estimated Effort:** 10 minutes
**Story Points:** 0.5

**Description:**
Verify that keyboard navigation (arrow keys, Enter, Space) continues to work correctly after the i18n changes.

**Acceptance Criteria:**
- [ ] Arrow keys navigate between room cards
- [ ] Enter/Space selects the focused room
- [ ] Tab key moves focus as expected
- [ ] Screen reader announces room names correctly
- [ ] Roving tabindex pattern still functional

**Testing Steps:**
1. Focus on the room grid
2. Use arrow keys to move between rooms
3. Press Enter or Space to select
4. Verify selection is made correctly
5. Test with screen reader if available

---

### Task 22: Verify Auto-Advance Behavior

**Priority:** Medium
**Estimated Effort:** 5 minutes
**Story Points:** 0.5

**Description:**
Confirm that the auto-advance behavior (automatically proceeding to next step after room selection) still works correctly.

**Acceptance Criteria:**
- [ ] Selecting any room (except "Other") auto-advances after 150ms delay
- [ ] Selecting "Other" does NOT auto-advance
- [ ] Custom room name entry + Continue button works
- [ ] State is correctly passed to next step

**Testing Steps:**
1. Click on "Kitchen" - should auto-advance to step 2
2. Go back, click on "Other" - should NOT auto-advance
3. Enter custom room name, click Continue - should advance

---

### Task 23: Run Full Test Suite

**Priority:** High
**Estimated Effort:** 15 minutes
**Story Points:** 1

**Description:**
Run the complete test suite to ensure no regressions were introduced by the i18n changes.

**Acceptance Criteria:**
- [ ] All RoomSelectionStep tests pass
- [ ] No other test failures caused by changes
- [ ] Test coverage maintained or improved

**Commands to Run:**
```bash
npm run test
# or specifically
npm run test -- RoomSelectionStep
```

---

## Implementation Order Summary

Execute tasks in this order for optimal workflow:

### Phase 1: Foundation (Tasks 1-3)
1. Task 1: Verify/Create Workflow Namespace Structure
2. Task 2: Add useTranslations Import
3. Task 3: Create Room Type Helper Function

### Phase 2: String Replacement (Tasks 4-11)
4. Task 4: Replace Step Header Strings
5. Task 5: Replace Radiogroup ARIA Label
6. Task 6: Replace Room Labels
7. Task 7: Replace Screen Reader Help Text
8. Task 8: Replace Custom Room Input Label
9. Task 9: Replace Custom Room Input Placeholder
10. Task 10: Replace Character Limit Hint
11. Task 11: Replace Continue Button Text

### Phase 3: Cleanup (Task 12)
12. Task 12: Clean Up Unused Import

### Phase 4: Translations (Tasks 13-17)
13. Task 13: French Translations
14. Task 14: Spanish Translations
15. Task 15: German Translations
16. Task 16: Dutch Translations
17. Task 17: Italian Translations

### Phase 5: Testing & Validation (Tasks 18-23)
18. Task 18: Update Unit Tests
19. Task 19: Run Build
20. Task 20: Visual Testing
21. Task 21: Verify Keyboard Navigation
22. Task 22: Verify Auto-Advance
23. Task 23: Run Full Test Suite

---

## Final Checklist

Before marking REQ-373 as complete, verify:

- [ ] RoomSelectionStep imports `useTranslations` from `next-intl`
- [ ] Workflow namespace loaded using `useTranslations('workflow')`
- [ ] Step heading uses `workflow.steps.roomSelection.title`
- [ ] Step description uses `workflow.steps.roomSelection.description`
- [ ] All 9 room labels use `workflow.rooms.*` translation keys
- [ ] Custom room input label uses translated string
- [ ] Custom room placeholder uses locale-appropriate examples
- [ ] Character limit hint uses interpolated translation with `{max}` variable
- [ ] Continue button uses `workflow.buttons.continue`
- [ ] ARIA label uses `workflow.steps.roomSelection.ariaLabel`
- [ ] Screen reader help text uses `workflow.steps.roomSelection.keyboardHelp`
- [ ] No hardcoded English strings remain in component JSX
- [ ] Component displays correctly in all 6 languages without layout breaks
- [ ] Keyboard navigation continues to work correctly
- [ ] Auto-advance logic unchanged
- [ ] Custom room name validation unchanged
- [ ] Console shows no missing translation warnings in English
- [ ] Tests pass or are updated appropriately
- [ ] Build succeeds with no TypeScript errors

---

## Total Effort Summary

| Category | Task Count | Story Points |
|----------|------------|--------------|
| Foundation | 3 | 2.5 |
| String Replacement | 8 | 4 |
| Cleanup | 1 | 0.5 |
| Translations | 5 | 5 |
| Testing | 6 | 5.5 |
| **Total** | **23** | **~17.5** |

**Estimated Duration:** ~2 hours for experienced developer

---

## References

- [Overview Document: REQ-373-update-roomselectionstep-overview.md](/docs/REQ-373-update-roomselectionstep-overview.md)
- [Implementation Plan: Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Component Source: RoomSelectionStep.tsx](/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx)
- [Test File: RoomSelectionStep.test.tsx](/src/components/ItemCreationWorkflow/components/steps/__tests__/RoomSelectionStep.test.tsx)
- [Constants: constants.ts](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2C.3 - Update RoomSelectionStep Component*
