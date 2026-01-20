# REQ-E02-016: Update Preferences Components with Localized Strings - Detailed Implementation

**Document Type:** Detailed Task Breakdown
**Request ID:** REQ-E02-016
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2G (Settings & Account)
**Task ID:** 2G.4
**Size:** M (Medium)
**Priority:** P1

---

## Document Purpose

This document provides a detailed, step-by-step implementation guide for updating all preference components with localized strings. Each task is designed to be approximately 1 story point (15-30 minutes of focused work) and can be executed independently by a developer or AI coding agent.

---

## Prerequisites

Before starting implementation, ensure:

1. **Epic 1 i18n Foundation is Complete:**
   - `next-intl` package is installed
   - `IntlProvider` is configured in app layout
   - `/messages/en.json` exists with base structure

2. **Task 2G.1 (REQ-E02-013) is Complete:**
   - `settings` namespace exists in `/messages/en.json`
   - Basic `settings.preferences` sub-namespace structure is in place

3. **Development Environment:**
   - Access to all source files listed below
   - Ability to run `npm run dev` for testing
   - Access to translation generation tools (Claude/OpenAI)

---

## Component Inventory

| # | Component | File Path | Type | Est. Strings | Complexity |
|---|-----------|-----------|------|--------------|------------|
| 1 | DashboardSettingsPopover | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | Client | 8 | Low |
| 2 | LanguageSwitcher | `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Client | 4 | Medium |
| 3 | useLanguagePreference | `/src/hooks/useLanguagePreference.ts` | Hook | 2 | Low |
| 4 | useDashboardPreferences | `/src/hooks/useDashboardPreferences.ts` | Hook | 0 | N/A |
| 5 | LocaleContext | `/src/contexts/LocaleContext.tsx` | Context | 0 | N/A |

**Total Strings to Extract:** ~14 user-facing strings

---

## Task Breakdown

### Phase 1: Translation Keys Setup (Tasks 1-2)

---

#### Task 1: Add `settings.preferences.dashboard` Namespace Keys

**File to Modify:** `/messages/en.json`
**Estimated Time:** 10 minutes
**Dependencies:** None

**Objective:** Add all translation keys needed for the DashboardSettingsPopover component.

**Step-by-Step Instructions:**

1. Open `/messages/en.json`

2. Locate the `"language"` section (currently at the end of the file around line 121)

3. **Before** the closing `}` of the file, add a new `"settings"` namespace with the preferences structure:

```json
,
  "settings": {
    "preferences": {
      "title": "Preferences",
      "subtitle": "Customize your experience",

      "dashboard": {
        "title": "Dashboard Settings",
        "ariaLabel": "Dashboard settings",
        "closeButton": "Close settings",
        "toggleAdvancedTools": "Show Advanced Tools",
        "toggleAdvancedToolsDesc": "Always show grouping and bulk operations",
        "togglePortfolioView": "Show Portfolio Summary",
        "togglePortfolioViewDesc": "Always show portfolio overview card",
        "footerHint": "These settings override automatic UI adaptation based on your property count."
      },

      "language": {
        "title": "Language",
        "description": "Choose your preferred language",
        "selectPlaceholder": "Select Language",
        "switching": "Switching...",
        "currentLanguageAria": "Select language. Current language: {language}",
        "optionsAria": "Language options",
        "invalidLanguage": "Invalid language: {language}",
        "saveFailed": "Failed to save language preference",
        "changeFailed": "Failed to change language",
        "unsupportedLocale": "Unsupported locale: {locale}",
        "changeSuccess": "Language changed successfully"
      }
    }
  }
```

4. **Verify JSON validity** - The complete file should have valid JSON syntax

**Acceptance Criteria:**
- [ ] JSON file parses without errors
- [ ] `settings.preferences.dashboard` namespace contains all 8 keys
- [ ] `settings.preferences.language` namespace contains all 11 keys
- [ ] No syntax errors when running `npm run dev`

**Verification Command:**
```bash
# Verify JSON is valid
node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))"
```

---

#### Task 2: Verify Existing Language Namespace Keys

**File to Review:** `/messages/en.json`
**Estimated Time:** 5 minutes
**Dependencies:** Task 1

**Objective:** Ensure the existing `language` namespace has all required keys and doesn't conflict with the new `settings.preferences.language` namespace.

**Step-by-Step Instructions:**

1. Open `/messages/en.json`

2. Review the existing `"language"` section (around lines 121-132):
   ```json
   "language": {
     "select": "Select Language",
     "current": "Current Language",
     "en": "English",
     "fr": "French",
     "es": "Spanish",
     "de": "German",
     "nl": "Dutch",
     "it": "Italian",
     "changeLanguage": "Change Language",
     "languageChanged": "Language changed successfully"
   }
   ```

3. **Keep this namespace** - It provides language names that can be used across the app

4. The new `settings.preferences.language` namespace is specifically for preference-related UI strings, keeping them separate from general language names

**Acceptance Criteria:**
- [ ] Existing `language` namespace remains unchanged
- [ ] Both namespaces exist without conflicts
- [ ] Language codes (`en`, `fr`, `es`, etc.) remain available for language name lookups

---

### Phase 2: Component Updates (Tasks 3-5)

---

#### Task 3: Update DashboardSettingsPopover Component

**File to Modify:** `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`
**Estimated Time:** 20 minutes
**Dependencies:** Task 1

**Objective:** Replace all hardcoded strings with `useTranslations` hook references.

**Step-by-Step Instructions:**

1. Open `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`

2. **Add import** at line 8 (after the existing imports):
   ```typescript
   import { useTranslations } from 'next-intl';
   ```

3. **Add translation hook** inside `DashboardSettingsPopover` function, after line 84 (before `const [isOpen, setIsOpen]`):
   ```typescript
   const t = useTranslations('settings.preferences.dashboard');
   ```

4. **Replace string at line 149** - Change:
   ```typescript
   aria-label="Dashboard settings"
   ```
   To:
   ```typescript
   aria-label={t('ariaLabel')}
   ```

5. **Replace string at line 162** - Change:
   ```typescript
   aria-label="Dashboard settings"
   ```
   To:
   ```typescript
   aria-label={t('ariaLabel')}
   ```

6. **Replace string at lines 166-167** - Change:
   ```typescript
   <h3 className="text-base font-semibold text-[#222222]">
     Dashboard Settings
   </h3>
   ```
   To:
   ```typescript
   <h3 className="text-base font-semibold text-[#222222]">
     {t('title')}
   </h3>
   ```

7. **Replace string at line 173** - Change:
   ```typescript
   aria-label="Close settings"
   ```
   To:
   ```typescript
   aria-label={t('closeButton')}
   ```

8. **Replace strings at lines 185-186** - Change:
   ```typescript
   label="Show Advanced Tools"
   description="Always show grouping and bulk operations"
   ```
   To:
   ```typescript
   label={t('toggleAdvancedTools')}
   description={t('toggleAdvancedToolsDesc')}
   ```

9. **Replace strings at lines 191-193** - Change:
   ```typescript
   label="Show Portfolio Summary"
   description="Always show portfolio overview card"
   ```
   To:
   ```typescript
   label={t('togglePortfolioView')}
   description={t('togglePortfolioViewDesc')}
   ```

10. **Replace string at lines 199-200** - Change:
    ```typescript
    <p className="text-xs text-[#717171]">
      These settings override automatic UI adaptation based on your property count.
    </p>
    ```
    To:
    ```typescript
    <p className="text-xs text-[#717171]">
      {t('footerHint')}
    </p>
    ```

**Final Component Structure (key parts):**
```typescript
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPreferences } from '@/hooks/useDashboardPreferences';

// ... (interfaces remain unchanged)

export function DashboardSettingsPopover({
  preferences,
  onPreferenceChange,
  className = '',
}: DashboardSettingsPopoverProps) {
  const t = useTranslations('settings.preferences.dashboard');
  const [isOpen, setIsOpen] = useState(false);
  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] No hardcoded English strings remain in the component
- [ ] Component renders without errors
- [ ] All text displays correctly (should show English text from translation file)
- [ ] Toggle functionality works correctly
- [ ] Popover opens and closes properly
- [ ] TypeScript compiles without errors

**Verification Steps:**
```bash
# Run type check
npm run type-check

# Start dev server and visually verify
npm run dev
# Navigate to dashboard and test the settings popover
```

---

#### Task 4: Update LanguageSwitcher Component

**File to Modify:** `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
**Estimated Time:** 20 minutes
**Dependencies:** Task 1

**Objective:** Replace hardcoded strings with `useTranslations` hook references.

**Step-by-Step Instructions:**

1. Open `/src/components/LanguageSwitcher/LanguageSwitcher.tsx`

2. **Add import** at line 8 (after the existing imports):
   ```typescript
   import { useTranslations } from 'next-intl';
   ```

3. **Add translation hook** inside `LanguageSwitcher` function, after line 42 (after the props destructuring):
   ```typescript
   const t = useTranslations('settings.preferences.language');
   ```

4. **Update `getDisplayText` function** (lines 288-300) - Change:
   ```typescript
   const getDisplayText = () => {
     if (!currentLocaleData) return 'Select Language';
     // ... rest of function
   };
   ```
   To:
   ```typescript
   const getDisplayText = () => {
     if (!currentLocaleData) return t('selectPlaceholder');
     // ... rest of function
   };
   ```

5. **Replace string at line 334** - Change:
   ```typescript
   aria-label={`Select language. Current language: ${currentLocaleData?.name || 'English'}`}
   ```
   To:
   ```typescript
   aria-label={t('currentLanguageAria', { language: currentLocaleData?.name || 'English' })}
   ```

6. **Replace string at lines 340-343** - Change:
   ```typescript
   {isLoading ? (
     <span className="flex items-center space-x-2">
       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF385C]"></div>
       <span>Switching...</span>
     </span>
   ) : (
   ```
   To:
   ```typescript
   {isLoading ? (
     <span className="flex items-center space-x-2">
       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF385C]"></div>
       <span>{t('switching')}</span>
     </span>
   ) : (
   ```

7. **Replace string at line 370** - Change:
   ```typescript
   aria-label="Language options"
   ```
   To:
   ```typescript
   aria-label={t('optionsAria')}
   ```

**Note on Language Names:** The `SUPPORTED_LOCALES` array in `constants.ts` contains native language names (e.g., "Deutsch", "Francais") which should remain untranslated as they are displayed in their native form. This is standard UX practice for language selectors.

**Acceptance Criteria:**
- [ ] No hardcoded English UI strings remain (language names are intentional)
- [ ] Component renders without errors
- [ ] Loading state shows translated "Switching..." text
- [ ] Dropdown aria-labels are translated
- [ ] Language selection functionality works correctly
- [ ] TypeScript compiles without errors

**Verification Steps:**
```bash
# Run type check
npm run type-check

# Start dev server and visually verify
npm run dev
# Test the language switcher component
```

---

#### Task 5: Document Hook Translation Approach

**Files to Review (No Code Changes):**
- `/src/hooks/useLanguagePreference.ts`
- `/src/hooks/useDashboardPreferences.ts`
- `/src/contexts/LocaleContext.tsx`

**Estimated Time:** 10 minutes
**Dependencies:** None

**Objective:** Document the translation approach for hooks and contexts.

**Analysis of Each File:**

1. **`useLanguagePreference.ts`** (lines 260, 286, 310):
   - Contains error messages like `"Invalid language: ${newLanguage}"` and `"Failed to save language preference"`
   - These are primarily for development/debugging (logged to console)
   - **Recommendation:** Keep as-is. Error messages are returned via `error` state and can be translated at the component level that displays them

2. **`useDashboardPreferences.ts`** (lines 66, 82):
   - Contains only console.warn messages: `"[useDashboardPreferences] Failed to parse stored preferences:"` and `"[useDashboardPreferences] Failed to save preferences:"`
   - **Recommendation:** No changes needed - these are developer-facing console logs, not user-facing text

3. **`LocaleContext.tsx`** (various lines):
   - Contains console.log/console.warn/console.error messages for debugging
   - Contains one thrown error: `"useLocale must be used within a LocaleProvider"` (line 394)
   - **Recommendation:** No changes needed - all strings are developer-facing

**Translation Approach for Error Messages:**

If a component needs to display an error from `useLanguagePreference`, it should translate the error key at the component level:

```typescript
// Example usage in a component
const { error } = useLanguagePreference();
const t = useTranslations('settings.preferences.language');

// Display translated error
{error && (
  <p className="text-red-500">
    {error.includes('Invalid language')
      ? t('invalidLanguage', { language: error.split(': ')[1] })
      : t('saveFailed')}
  </p>
)}
```

**Acceptance Criteria:**
- [ ] Documented why hooks don't need direct translation
- [ ] Documented pattern for handling hook errors at component level
- [ ] No unnecessary changes to working hook code

---

### Phase 3: Translation Generation (Tasks 6-7)

---

#### Task 6: Generate Translations for Non-English Languages

**Files to Modify:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Estimated Time:** 30 minutes
**Dependencies:** Tasks 1-2

**Objective:** Generate complete translations for the `settings.preferences` namespace in all 5 non-English languages.

**Step-by-Step Instructions:**

1. Open each language file and add the `settings.preferences` namespace

2. **French (`/messages/fr.json`):**
```json
  "settings": {
    "preferences": {
      "title": "Preferences",
      "subtitle": "Personnalisez votre experience",

      "dashboard": {
        "title": "Parametres du tableau de bord",
        "ariaLabel": "Parametres du tableau de bord",
        "closeButton": "Fermer les parametres",
        "toggleAdvancedTools": "Afficher les outils avances",
        "toggleAdvancedToolsDesc": "Toujours afficher le regroupement et les operations en masse",
        "togglePortfolioView": "Afficher le resume du portfolio",
        "togglePortfolioViewDesc": "Toujours afficher la carte d'apercu du portfolio",
        "footerHint": "Ces parametres remplacent l'adaptation automatique de l'interface en fonction du nombre de proprietes."
      },

      "language": {
        "title": "Langue",
        "description": "Choisissez votre langue preferee",
        "selectPlaceholder": "Selectionner la langue",
        "switching": "Changement...",
        "currentLanguageAria": "Selectionner la langue. Langue actuelle : {language}",
        "optionsAria": "Options de langue",
        "invalidLanguage": "Langue invalide : {language}",
        "saveFailed": "Echec de l'enregistrement de la preference de langue",
        "changeFailed": "Echec du changement de langue",
        "unsupportedLocale": "Langue non prise en charge : {locale}",
        "changeSuccess": "Langue modifiee avec succes"
      }
    }
  }
```

3. **Spanish (`/messages/es.json`):**
```json
  "settings": {
    "preferences": {
      "title": "Preferencias",
      "subtitle": "Personaliza tu experiencia",

      "dashboard": {
        "title": "Configuracion del panel",
        "ariaLabel": "Configuracion del panel",
        "closeButton": "Cerrar configuracion",
        "toggleAdvancedTools": "Mostrar herramientas avanzadas",
        "toggleAdvancedToolsDesc": "Siempre mostrar agrupacion y operaciones masivas",
        "togglePortfolioView": "Mostrar resumen del portafolio",
        "togglePortfolioViewDesc": "Siempre mostrar tarjeta de vista general del portafolio",
        "footerHint": "Estas configuraciones anulan la adaptacion automatica de la interfaz segun el numero de propiedades."
      },

      "language": {
        "title": "Idioma",
        "description": "Elige tu idioma preferido",
        "selectPlaceholder": "Seleccionar idioma",
        "switching": "Cambiando...",
        "currentLanguageAria": "Seleccionar idioma. Idioma actual: {language}",
        "optionsAria": "Opciones de idioma",
        "invalidLanguage": "Idioma invalido: {language}",
        "saveFailed": "Error al guardar la preferencia de idioma",
        "changeFailed": "Error al cambiar el idioma",
        "unsupportedLocale": "Idioma no compatible: {locale}",
        "changeSuccess": "Idioma cambiado correctamente"
      }
    }
  }
```

4. **German (`/messages/de.json`):**
```json
  "settings": {
    "preferences": {
      "title": "Einstellungen",
      "subtitle": "Passen Sie Ihre Erfahrung an",

      "dashboard": {
        "title": "Dashboard-Einstellungen",
        "ariaLabel": "Dashboard-Einstellungen",
        "closeButton": "Einstellungen schliessen",
        "toggleAdvancedTools": "Erweiterte Werkzeuge anzeigen",
        "toggleAdvancedToolsDesc": "Gruppierung und Massenoperationen immer anzeigen",
        "togglePortfolioView": "Portfolio-Ubersicht anzeigen",
        "togglePortfolioViewDesc": "Portfolio-Ubersichtskarte immer anzeigen",
        "footerHint": "Diese Einstellungen uberschreiben die automatische UI-Anpassung basierend auf der Anzahl Ihrer Immobilien."
      },

      "language": {
        "title": "Sprache",
        "description": "Wahlen Sie Ihre bevorzugte Sprache",
        "selectPlaceholder": "Sprache auswahlen",
        "switching": "Wechseln...",
        "currentLanguageAria": "Sprache auswahlen. Aktuelle Sprache: {language}",
        "optionsAria": "Sprachoptionen",
        "invalidLanguage": "Ungultige Sprache: {language}",
        "saveFailed": "Spracheinstellung konnte nicht gespeichert werden",
        "changeFailed": "Sprache konnte nicht geandert werden",
        "unsupportedLocale": "Nicht unterstutzte Sprache: {locale}",
        "changeSuccess": "Sprache erfolgreich geandert"
      }
    }
  }
```

5. **Dutch (`/messages/nl.json`):**
```json
  "settings": {
    "preferences": {
      "title": "Voorkeuren",
      "subtitle": "Pas uw ervaring aan",

      "dashboard": {
        "title": "Dashboard-instellingen",
        "ariaLabel": "Dashboard-instellingen",
        "closeButton": "Instellingen sluiten",
        "toggleAdvancedTools": "Geavanceerde hulpmiddelen tonen",
        "toggleAdvancedToolsDesc": "Groepering en bulkbewerkingen altijd tonen",
        "togglePortfolioView": "Portfolio-overzicht tonen",
        "togglePortfolioViewDesc": "Portfolio-overzichtskaart altijd tonen",
        "footerHint": "Deze instellingen overschrijven de automatische UI-aanpassing op basis van uw aantal eigendommen."
      },

      "language": {
        "title": "Taal",
        "description": "Kies uw voorkeurstaal",
        "selectPlaceholder": "Selecteer taal",
        "switching": "Wisselen...",
        "currentLanguageAria": "Selecteer taal. Huidige taal: {language}",
        "optionsAria": "Taalopties",
        "invalidLanguage": "Ongeldige taal: {language}",
        "saveFailed": "Taalvoorkeur kon niet worden opgeslagen",
        "changeFailed": "Taal kon niet worden gewijzigd",
        "unsupportedLocale": "Niet-ondersteunde taal: {locale}",
        "changeSuccess": "Taal succesvol gewijzigd"
      }
    }
  }
```

6. **Italian (`/messages/it.json`):**
```json
  "settings": {
    "preferences": {
      "title": "Preferenze",
      "subtitle": "Personalizza la tua esperienza",

      "dashboard": {
        "title": "Impostazioni dashboard",
        "ariaLabel": "Impostazioni dashboard",
        "closeButton": "Chiudi impostazioni",
        "toggleAdvancedTools": "Mostra strumenti avanzati",
        "toggleAdvancedToolsDesc": "Mostra sempre raggruppamento e operazioni in blocco",
        "togglePortfolioView": "Mostra riepilogo portfolio",
        "togglePortfolioViewDesc": "Mostra sempre la scheda panoramica del portfolio",
        "footerHint": "Queste impostazioni sovrascrivono l'adattamento automatico dell'interfaccia in base al numero di proprieta."
      },

      "language": {
        "title": "Lingua",
        "description": "Scegli la tua lingua preferita",
        "selectPlaceholder": "Seleziona lingua",
        "switching": "Cambio...",
        "currentLanguageAria": "Seleziona lingua. Lingua attuale: {language}",
        "optionsAria": "Opzioni lingua",
        "invalidLanguage": "Lingua non valida: {language}",
        "saveFailed": "Impossibile salvare la preferenza della lingua",
        "changeFailed": "Impossibile cambiare la lingua",
        "unsupportedLocale": "Lingua non supportata: {locale}",
        "changeSuccess": "Lingua cambiata con successo"
      }
    }
  }
```

**Acceptance Criteria:**
- [ ] All 5 language files have complete `settings.preferences` namespace
- [ ] All JSON files parse without errors
- [ ] Interpolation variables (`{language}`, `{locale}`) are preserved exactly
- [ ] Translations maintain semantic accuracy

**Verification Command:**
```bash
# Verify all JSON files are valid
for file in messages/*.json; do
  echo "Checking $file..."
  node -e "JSON.parse(require('fs').readFileSync('$file'))"
done
```

---

#### Task 7: Verify Translation Key Completeness

**Files to Check:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Estimated Time:** 10 minutes
**Dependencies:** Task 6

**Objective:** Ensure all language files have identical key structures in the `settings.preferences` namespace.

**Verification Script:**
```javascript
// Create this as scripts/verify-preferences-translations.js
const fs = require('fs');
const path = require('path');

const languages = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const messagesDir = path.join(__dirname, '../messages');

function getKeys(obj, prefix = '') {
  return Object.keys(obj).flatMap(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return getKeys(obj[key], fullKey);
    }
    return fullKey;
  });
}

const allKeys = {};

languages.forEach(lang => {
  const filePath = path.join(messagesDir, `${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (content.settings?.preferences) {
    allKeys[lang] = getKeys(content.settings.preferences, 'settings.preferences');
  } else {
    console.error(`Missing settings.preferences in ${lang}.json`);
    allKeys[lang] = [];
  }
});

// Compare with English (source of truth)
const enKeys = new Set(allKeys['en'] || []);

languages.filter(l => l !== 'en').forEach(lang => {
  const langKeys = new Set(allKeys[lang] || []);

  const missingInLang = [...enKeys].filter(k => !langKeys.has(k));
  const extraInLang = [...langKeys].filter(k => !enKeys.has(k));

  if (missingInLang.length > 0) {
    console.error(`Missing in ${lang}.json:`, missingInLang);
  }
  if (extraInLang.length > 0) {
    console.warn(`Extra in ${lang}.json:`, extraInLang);
  }
  if (missingInLang.length === 0 && extraInLang.length === 0) {
    console.log(`${lang}.json: OK - all keys match`);
  }
});

console.log('\nTotal keys in settings.preferences namespace:', enKeys.size);
```

**Run Command:**
```bash
node scripts/verify-preferences-translations.js
```

**Acceptance Criteria:**
- [ ] All 6 language files have identical key count
- [ ] No missing keys in any language file
- [ ] No extra keys in any language file
- [ ] Script outputs "OK" for all languages

---

### Phase 4: Testing & Verification (Tasks 8-10)

---

#### Task 8: Test DashboardSettingsPopover in All Languages

**Estimated Time:** 15 minutes
**Dependencies:** Tasks 3, 6

**Objective:** Verify the DashboardSettingsPopover displays correctly in all 6 supported languages.

**Test Procedure:**

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard (requires authentication)

3. **For each language (en, fr, es, de, nl, it):**

   a. Change the language using the LanguageSwitcher (or set cookie manually in DevTools)

   b. Click the settings gear icon in the dashboard header

   c. **Verify these elements are translated:**
      - [ ] Popover title "Dashboard Settings"
      - [ ] "Show Advanced Tools" toggle label
      - [ ] "Always show grouping and bulk operations" description
      - [ ] "Show Portfolio Summary" toggle label
      - [ ] "Always show portfolio overview card" description
      - [ ] Footer hint text

   d. **Verify functionality:**
      - [ ] Toggle switches work correctly
      - [ ] Popover closes when clicking outside
      - [ ] Popover closes when pressing Escape
      - [ ] Close button (X) works

   e. **Verify layout:**
      - [ ] No text overflow
      - [ ] No truncation of important text
      - [ ] Consistent spacing

**Known Considerations:**
- German translations tend to be ~30% longer than English
- French translations may require more horizontal space
- Check for text wrapping in descriptions

**Acceptance Criteria:**
- [ ] All 8 strings are translated in all 6 languages
- [ ] No layout breaks in any language
- [ ] All functionality works regardless of language

---

#### Task 9: Test LanguageSwitcher in All Languages

**Estimated Time:** 15 minutes
**Dependencies:** Tasks 4, 6

**Objective:** Verify the LanguageSwitcher displays and functions correctly in all languages.

**Test Procedure:**

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to a page with the LanguageSwitcher

3. **For each language (en, fr, es, de, nl, it):**

   a. With the current language set, verify:
      - [ ] Placeholder text "Select Language" is translated (when no language selected)
      - [ ] Loading state shows translated "Switching..." text

   b. **Test keyboard navigation:**
      - [ ] Arrow keys navigate options
      - [ ] Enter selects an option
      - [ ] Escape closes dropdown

   c. **Test screen reader accessibility:**
      - [ ] Main button has translated aria-label with current language
      - [ ] Options list has translated aria-label "Language options"

   d. **Verify language names remain native:**
      - English = "English"
      - French = "Francais"
      - Spanish = "Espanol"
      - German = "Deutsch"
      - Dutch = "Nederlands"
      - Italian = "Italiano"

4. **Test language switching:**
   - [ ] Page reloads after selecting new language
   - [ ] New language persists after reload
   - [ ] Cookie is set correctly

**Acceptance Criteria:**
- [ ] All 4 UI strings are translated
- [ ] Language names remain in native form
- [ ] Switching between languages works correctly
- [ ] Keyboard navigation works in all languages

---

#### Task 10: Final Verification Checklist

**Estimated Time:** 10 minutes
**Dependencies:** Tasks 8, 9

**Objective:** Complete final verification that all requirements are met.

**Checklist:**

**Code Quality:**
- [ ] No hardcoded English strings remain in modified components
- [ ] All modified files compile without TypeScript errors
- [ ] No console errors in browser DevTools
- [ ] `useTranslations` hook is properly imported and used

**Translation Files:**
- [ ] `/messages/en.json` has all `settings.preferences` keys
- [ ] All 5 non-English language files have matching keys
- [ ] All JSON files are valid (no syntax errors)
- [ ] Interpolation variables are preserved in all languages

**Functionality:**
- [ ] DashboardSettingsPopover toggle switches work correctly
- [ ] DashboardSettingsPopover opens/closes correctly
- [ ] LanguageSwitcher dropdown opens/closes correctly
- [ ] Language selection persists after page reload
- [ ] Preferences save correctly regardless of display language

**Accessibility:**
- [ ] All aria-labels are translated
- [ ] Screen reader testing passes (basic verification)
- [ ] Keyboard navigation works

**Layout & Design:**
- [ ] No text overflow in any language
- [ ] Consistent spacing across languages
- [ ] Popover/dropdown widths accommodate longest translations

---

## Summary

### Files Modified

| File | Type of Change |
|------|----------------|
| `/messages/en.json` | Add `settings.preferences` namespace |
| `/messages/fr.json` | Add `settings.preferences` namespace |
| `/messages/es.json` | Add `settings.preferences` namespace |
| `/messages/de.json` | Add `settings.preferences` namespace |
| `/messages/nl.json` | Add `settings.preferences` namespace |
| `/messages/it.json` | Add `settings.preferences` namespace |
| `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | Add `useTranslations`, replace 8 strings |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Add `useTranslations`, replace 4 strings |

### Files NOT Modified (With Reasoning)

| File | Reason |
|------|--------|
| `/src/hooks/useLanguagePreference.ts` | Only contains console logs and developer-facing error messages |
| `/src/hooks/useDashboardPreferences.ts` | Only contains console warnings (developer-facing) |
| `/src/contexts/LocaleContext.tsx` | Only contains console logs and developer errors |
| `/src/components/LanguageSwitcher/constants.ts` | Contains data/config, language names should remain native |
| `/src/components/LanguageSwitcher/LanguageSwitcher.types.ts` | Type definitions only |

### Total Strings Extracted

| Namespace | Count |
|-----------|-------|
| `settings.preferences.dashboard` | 8 |
| `settings.preferences.language` | 11 |
| **Total** | **19** |

### Effort Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Translation Keys Setup | 2 | 15 min |
| Phase 2: Component Updates | 3 | 50 min |
| Phase 3: Translation Generation | 2 | 40 min |
| Phase 4: Testing & Verification | 3 | 40 min |
| **Total** | **10** | **~2.5 hours** |

---

## References

- [Overview Document: REQ-E02-016](/docs/REQ-E02-016-update-preferences-components-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Tracking: gen_requests_epic2.md](/docs/gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format Reference](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task ID: 2G.4 - Update Preferences Components*
