# Detailed Task Breakdown: REQ-E02-011 - Update PropertySelector Component with Localized Strings

**Document Created:** 2026-01-20 21:45:00 UTC
**Last Modified:** 2026-01-20 21:45:00 UTC

**Request ID:** REQ-E02-011
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.5
**Size:** S (Small)
**Priority:** P2
**Overview Document:** [REQ-E02-011-update-propertyselector-overview.md](./REQ-E02-011-update-propertyselector-overview.md)

---

## Executive Summary

This document provides granular, actionable tasks for updating the PropertySelector component (`/src/components/PropertySelector.tsx`) to use localized translation references instead of hardcoded English strings. The component contains approximately 8 unique hardcoded strings that need to be replaced with translation function calls using the `useTranslations` hook from next-intl.

**Total Estimated Tasks:** 15 tasks
**Total Estimated Effort:** ~1 hour

---

## Prerequisites

Before starting implementation, verify the following:

- [ ] Epic 1 foundation is complete (next-intl installed, IntlProvider configured)
- [ ] `/messages/en.json` exists and is properly structured
- [ ] All 6 language files exist (`en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`)
- [ ] `useTranslations` hook is functional in client components
- [ ] Task 2F.1 (Create properties namespace structure) is complete or will be completed as part of this task

---

## Task Breakdown

### Phase 1: Translation Keys Setup

#### Task 1.1: Add `properties.selector` Namespace to `/messages/en.json`

**File:** `/messages/en.json`
**Action:** Add new translation keys under `properties.selector` namespace
**Estimated Time:** 5 minutes

**Steps:**
1. Open `/messages/en.json`
2. Locate or create the `properties` object
3. Add the `selector` sub-namespace with the following keys:

**Translation Keys to Add:**
```json
{
  "properties": {
    "selector": {
      "title": "Property Filter",
      "subtitle": "Filter analytics data by property",
      "allProperties": "All Properties",
      "loading": "Loading properties...",
      "empty": "No properties available",
      "ariaLabel": "Select property for analytics filtering",
      "optionsAriaLabel": "Property options"
    }
  }
}
```

**Verification:**
- [ ] JSON is valid (no syntax errors)
- [ ] All 7 keys are present under `properties.selector`
- [ ] Key naming follows `namespace.component.element` pattern

---

#### Task 1.2: Add Translation Keys to `/messages/fr.json` (French)

**File:** `/messages/fr.json`
**Action:** Add French translations for `properties.selector` namespace
**Estimated Time:** 3 minutes

**Translation Keys to Add:**
```json
{
  "properties": {
    "selector": {
      "title": "Filtre de propriété",
      "subtitle": "Filtrer les données analytiques par propriété",
      "allProperties": "Toutes les propriétés",
      "loading": "Chargement des propriétés...",
      "empty": "Aucune propriété disponible",
      "ariaLabel": "Sélectionner une propriété pour le filtrage analytique",
      "optionsAriaLabel": "Options de propriété"
    }
  }
}
```

**Verification:**
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly

---

#### Task 1.3: Add Translation Keys to `/messages/es.json` (Spanish)

**File:** `/messages/es.json`
**Action:** Add Spanish translations for `properties.selector` namespace
**Estimated Time:** 3 minutes

**Translation Keys to Add:**
```json
{
  "properties": {
    "selector": {
      "title": "Filtro de propiedad",
      "subtitle": "Filtrar datos analíticos por propiedad",
      "allProperties": "Todas las propiedades",
      "loading": "Cargando propiedades...",
      "empty": "No hay propiedades disponibles",
      "ariaLabel": "Seleccionar propiedad para filtrado analítico",
      "optionsAriaLabel": "Opciones de propiedad"
    }
  }
}
```

**Verification:**
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly

---

#### Task 1.4: Add Translation Keys to `/messages/de.json` (German)

**File:** `/messages/de.json`
**Action:** Add German translations for `properties.selector` namespace
**Estimated Time:** 3 minutes

**Translation Keys to Add:**
```json
{
  "properties": {
    "selector": {
      "title": "Immobilienfilter",
      "subtitle": "Analysedaten nach Immobilie filtern",
      "allProperties": "Alle Immobilien",
      "loading": "Immobilien werden geladen...",
      "empty": "Keine Immobilien verfügbar",
      "ariaLabel": "Immobilie für Analysefilterung auswählen",
      "optionsAriaLabel": "Immobilienoptionen"
    }
  }
}
```

**Verification:**
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly

---

#### Task 1.5: Add Translation Keys to `/messages/nl.json` (Dutch)

**File:** `/messages/nl.json`
**Action:** Add Dutch translations for `properties.selector` namespace
**Estimated Time:** 3 minutes

**Translation Keys to Add:**
```json
{
  "properties": {
    "selector": {
      "title": "Eigendomsfilter",
      "subtitle": "Analyseer gegevens filteren op eigendom",
      "allProperties": "Alle eigendommen",
      "loading": "Eigendommen laden...",
      "empty": "Geen eigendommen beschikbaar",
      "ariaLabel": "Selecteer eigendom voor analytische filtering",
      "optionsAriaLabel": "Eigendomsopties"
    }
  }
}
```

**Verification:**
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly

---

#### Task 1.6: Add Translation Keys to `/messages/it.json` (Italian)

**File:** `/messages/it.json`
**Action:** Add Italian translations for `properties.selector` namespace
**Estimated Time:** 3 minutes

**Translation Keys to Add:**
```json
{
  "properties": {
    "selector": {
      "title": "Filtro proprietà",
      "subtitle": "Filtra i dati analitici per proprietà",
      "allProperties": "Tutte le proprietà",
      "loading": "Caricamento proprietà...",
      "empty": "Nessuna proprietà disponibile",
      "ariaLabel": "Seleziona proprietà per il filtraggio analitico",
      "optionsAriaLabel": "Opzioni proprietà"
    }
  }
}
```

**Verification:**
- [ ] JSON is valid
- [ ] Key structure matches `en.json` exactly

---

### Phase 2: Component Update

#### Task 2.1: Add `useTranslations` Import

**File:** `/src/components/PropertySelector.tsx`
**Action:** Add import statement for useTranslations hook
**Line:** 7 (after existing imports)
**Estimated Time:** 1 minute

**Before:**
```typescript
import { useState, useRef, useEffect } from 'react';
import { Building, ChevronDown, Check } from 'lucide-react';
```

**After:**
```typescript
import { useState, useRef, useEffect } from 'react';
import { Building, ChevronDown, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
```

**Verification:**
- [ ] Import statement is syntactically correct
- [ ] No duplicate imports exist

---

#### Task 2.2: Initialize Translation Hook in Component

**File:** `/src/components/PropertySelector.tsx`
**Action:** Add translation hook initialization inside component function
**Line:** ~46 (after props destructuring, before useState hooks)
**Estimated Time:** 2 minutes

**Location:** Inside `PropertySelector` function, after props destructuring

**Code to Add:**
```typescript
// Translation hook
const t = useTranslations('properties.selector');
```

**Placement (after line 45):**
```typescript
}: PropertySelectorProps) {
  // Translation hook
  const t = useTranslations('properties.selector');

  const [isOpen, setIsOpen] = useState(false);
```

**Verification:**
- [ ] Hook is called at the top level of the component (not inside conditionals)
- [ ] Namespace matches the one defined in messages files

---

#### Task 2.3: Replace Header Title "Property Filter"

**File:** `/src/components/PropertySelector.tsx`
**Action:** Replace hardcoded title string with translation function call
**Line:** 163
**Estimated Time:** 1 minute

**Before:**
```tsx
<span>Property Filter</span>
```

**After:**
```tsx
<span>{t('title')}</span>
```

**Verification:**
- [ ] String is completely replaced
- [ ] Translation key matches the one in messages file

---

#### Task 2.4: Replace Header Subtitle

**File:** `/src/components/PropertySelector.tsx`
**Action:** Replace hardcoded subtitle string with translation function call
**Lines:** 165-167
**Estimated Time:** 1 minute

**Before:**
```tsx
<p className="text-xs text-gray-500 mt-1">
  Filter analytics data by property
</p>
```

**After:**
```tsx
<p className="text-xs text-gray-500 mt-1">
  {t('subtitle')}
</p>
```

**Verification:**
- [ ] String is completely replaced
- [ ] Translation key matches the one in messages file

---

#### Task 2.5: Replace Button Loading Text

**File:** `/src/components/PropertySelector.tsx`
**Action:** Replace hardcoded loading string with translation function call
**Line:** 197
**Estimated Time:** 1 minute

**Before:**
```tsx
{loading ? 'Loading properties...' : getSelectedPropertyDisplay()}
```

**After:**
```tsx
{loading ? t('loading') : getSelectedPropertyDisplay()}
```

**Verification:**
- [ ] String is completely replaced
- [ ] Ternary operator logic is preserved

---

#### Task 2.6: Replace Button aria-label

**File:** `/src/components/PropertySelector.tsx`
**Action:** Replace hardcoded aria-label with translation function call
**Line:** 192
**Estimated Time:** 1 minute

**Before:**
```tsx
aria-label="Select property for analytics filtering"
```

**After:**
```tsx
aria-label={t('ariaLabel')}
```

**Verification:**
- [ ] Attribute value is replaced with JSX expression
- [ ] Curly braces are used correctly

---

#### Task 2.7: Replace Dropdown aria-label

**File:** `/src/components/PropertySelector.tsx`
**Action:** Replace hardcoded dropdown aria-label with translation function call
**Line:** 216
**Estimated Time:** 1 minute

**Before:**
```tsx
aria-label="Property options"
```

**After:**
```tsx
aria-label={t('optionsAriaLabel')}
```

**Verification:**
- [ ] Attribute value is replaced with JSX expression
- [ ] Curly braces are used correctly

---

#### Task 2.8: Replace Empty State Message

**File:** `/src/components/PropertySelector.tsx`
**Action:** Replace hardcoded empty state message with translation function call
**Lines:** 294-296
**Estimated Time:** 1 minute

**Before:**
```tsx
{properties.length === 0 && (
  <div className={`${sizeClasses.option} text-gray-500 text-center`}>
    No properties available
  </div>
)}
```

**After:**
```tsx
{properties.length === 0 && (
  <div className={`${sizeClasses.option} text-gray-500 text-center`}>
    {t('empty')}
  </div>
)}
```

**Verification:**
- [ ] String is completely replaced
- [ ] Conditional rendering logic is preserved

---

#### Task 2.9: Replace Loading Dropdown Text

**File:** `/src/components/PropertySelector.tsx`
**Action:** Replace hardcoded loading text in dropdown with translation function call
**Line:** 307
**Estimated Time:** 1 minute

**Before:**
```tsx
<span>Loading properties...</span>
```

**After:**
```tsx
<span>{t('loading')}</span>
```

**Verification:**
- [ ] String is completely replaced
- [ ] Same translation key as Task 2.5 (reusing 'loading' key)

---

#### Task 2.10: Update Placeholder Default Handling

**File:** `/src/components/PropertySelector.tsx`
**Action:** Modify placeholder handling to use translation as default
**Lines:** 44, 143
**Estimated Time:** 3 minutes

**Step 1 - Update Props Default (Line 44):**

**Before:**
```typescript
placeholder = 'All Properties'
```

**After:**
```typescript
placeholder
```

**Step 2 - Update getSelectedPropertyDisplay Function (Lines 142-153):**

**Before:**
```typescript
const getSelectedPropertyDisplay = () => {
  if (!selectedPropertyId) return placeholder;
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  if (!selectedProperty) return placeholder;
```

**After:**
```typescript
const getSelectedPropertyDisplay = () => {
  const displayPlaceholder = placeholder ?? t('allProperties');
  if (!selectedPropertyId) return displayPlaceholder;
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  if (!selectedProperty) return displayPlaceholder;
```

**Step 3 - Update "All Properties" Option Display (Line 237):**

**Before:**
```tsx
<span>{placeholder}</span>
```

**After:**
```tsx
<span>{placeholder ?? t('allProperties')}</span>
```

**Verification:**
- [ ] Placeholder prop is now optional with no default
- [ ] Translation is used as fallback when placeholder is not provided
- [ ] Backward compatibility is maintained (custom placeholder still works)

---

### Phase 3: Verification and Testing

#### Task 3.1: Run TypeScript Compilation

**Action:** Verify no TypeScript errors
**Command:** `npx tsc --noEmit`
**Estimated Time:** 2 minutes

**Verification Checklist:**
- [ ] No type errors in PropertySelector.tsx
- [ ] No missing import errors
- [ ] No type mismatches in translation function calls

---

#### Task 3.2: Run Build

**Action:** Verify build completes successfully
**Command:** `npm run build`
**Estimated Time:** 3 minutes

**Verification Checklist:**
- [ ] Build completes without errors
- [ ] No missing translation key warnings
- [ ] Component compiles correctly

---

#### Task 3.3: Functional Testing

**Action:** Test component functionality across all states
**Estimated Time:** 10 minutes

**Test Cases:**

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Default Variant Render | Load component with `variant="default"` | Header title and subtitle display translated text |
| Compact Variant Render | Load component with `variant="compact"` | No header displayed |
| Loading State (Button) | Set `loading={true}` | Button displays translated loading text |
| Loading State (Dropdown) | Set `loading={true}`, open dropdown | Dropdown displays translated loading message with spinner |
| Empty State | Pass empty `properties` array | Dropdown displays translated empty message |
| All Properties Option | Click dropdown | "All Properties" displays translated text |
| Custom Placeholder | Pass `placeholder="My Custom Text"` | Custom text is displayed instead of translation |
| Keyboard Navigation | Use arrow keys, enter, escape | Correct focus management and selection |
| Screen Reader | Use screen reader to navigate | aria-labels announce translated text |

**Verification Checklist:**
- [ ] All text renders correctly in English
- [ ] Dropdown opens and closes properly
- [ ] Selection works correctly
- [ ] Loading states display translated text
- [ ] Empty state displays translated text
- [ ] Custom placeholder overrides translation
- [ ] Keyboard navigation works

---

#### Task 3.4: Language Switching Test

**Action:** Test component in all 6 supported languages
**Estimated Time:** 5 minutes

**Languages to Test:**
- [ ] English (en) - Source language
- [ ] French (fr)
- [ ] Spanish (es)
- [ ] German (de)
- [ ] Dutch (nl)
- [ ] Italian (it)

**For Each Language, Verify:**
- [ ] Header title displays correctly
- [ ] Subtitle displays correctly
- [ ] "All Properties" option displays correctly
- [ ] Loading text displays correctly
- [ ] Empty state message displays correctly
- [ ] No text overflow or layout issues

---

#### Task 3.5: Visual Regression Check

**Action:** Check for layout issues with longer translated text
**Estimated Time:** 3 minutes

**Check Points:**
- [ ] German text (typically longest) fits within header bounds
- [ ] No text truncation in header title (unless by design)
- [ ] Subtitle text wraps correctly if needed
- [ ] Dropdown options display correctly with translated text
- [ ] No horizontal scrolling introduced

---

## Final Verification Checklist

### Code Quality
- [ ] No hardcoded English strings remain in PropertySelector.tsx
- [ ] All translation keys follow naming convention
- [ ] Import statement is correctly placed
- [ ] Translation hook is initialized correctly
- [ ] No TypeScript errors

### Translation Completeness
- [ ] All 7 translation keys exist in en.json
- [ ] All 7 translation keys exist in fr.json
- [ ] All 7 translation keys exist in es.json
- [ ] All 7 translation keys exist in de.json
- [ ] All 7 translation keys exist in nl.json
- [ ] All 7 translation keys exist in it.json

### Functionality
- [ ] Component renders correctly in all 6 languages
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly
- [ ] "All Properties" option displays correctly
- [ ] Custom placeholder prop still works
- [ ] Keyboard navigation works
- [ ] Screen reader accessibility works

### Build
- [ ] TypeScript compilation passes
- [ ] Build completes successfully
- [ ] No console warnings about missing translations

---

## Files Modified Summary

| File | Modification Type | Changes |
|------|-------------------|---------|
| `/src/components/PropertySelector.tsx` | Update | Add import, initialize hook, replace 8 hardcoded strings |
| `/messages/en.json` | Update | Add `properties.selector` namespace with 7 keys |
| `/messages/fr.json` | Update | Add `properties.selector` namespace with 7 keys |
| `/messages/es.json` | Update | Add `properties.selector` namespace with 7 keys |
| `/messages/de.json` | Update | Add `properties.selector` namespace with 7 keys |
| `/messages/nl.json` | Update | Add `properties.selector` namespace with 7 keys |
| `/messages/it.json` | Update | Add `properties.selector` namespace with 7 keys |

**Total Files Modified:** 7

---

## Rollback Plan

If issues are discovered post-implementation:

1. **Revert Component Changes:**
   ```bash
   git checkout HEAD -- src/components/PropertySelector.tsx
   ```

2. **Revert Message File Changes:**
   - Remove `properties.selector` namespace from all 6 message files
   - Ensure `properties` namespace (if newly created) is also removed if empty

3. **Verify Rollback:**
   - Run `npm run build` to ensure clean build
   - Test component functionality

---

## Notes for Implementer

1. **Backward Compatibility:** The `placeholder` prop behavior is changing from having a default value to being optional with translation fallback. Callers that don't pass `placeholder` will now get the translated default instead of hardcoded "All Properties". This is the intended behavior for localization.

2. **Reusing Translation Keys:** The `loading` key is used in two places (button text and dropdown text). This is intentional to maintain consistency.

3. **Accessibility:** The aria-label translations are critical for screen reader users. Ensure these are accurate and descriptive in all languages.

4. **German Text Length:** German translations are typically 30-40% longer than English. The component already uses truncation (`truncate` class), so this should be handled gracefully.

5. **Testing Priority:** Focus testing on the German translations as they represent the longest text case and are most likely to reveal layout issues.

---

## References

- [Overview Document](./REQ-E02-011-update-propertyselector-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-011
- [next-intl useTranslations Documentation](https://next-intl-docs.vercel.app/docs/usage/messages)
- [PropertySelector Component](/src/components/PropertySelector.tsx)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management, Task 2F.5*
