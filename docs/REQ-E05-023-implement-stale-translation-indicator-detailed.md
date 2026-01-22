# REQ-E05-023: Implement Stale Translation Indicator - Detailed Task Breakdown

**Created**: 2026-01-22 23:50
**Status**: PENDING
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 5 - Manual Edit Preservation
**Task**: 5.2 - Implement stale translation indicator
**Size**: M (8-10 hours)

---

## Reference Documents

- **Overview**: `/docs/REQ-E05-023-implement-stale-translation-indicator-overview.md`
- **Requirements**: `/docs/gen_requests_epic5.md` (lines 3668-3840)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Build & Test Commands

```bash
# Type check (MUST pass before commit)
npm run typecheck

# Run development server
npm run dev

# Build for production (MUST succeed)
npm run build

# Run tests
npm test

# Lint
npm run lint
```

---

## Overview

Enhance the TranslationStatusItem component to visually indicate when manual translations have become stale (outdated) due to source content changes. Implement timestamp comparison logic to detect when source content (`sourceUpdatedAt`) has been modified after a translation was generated (`sourceVersionAt`). Display amber/yellow warning styling, a "Stale" status badge, and an "Update Translation" action button for stale manual translations.

**Key Requirements:**
- Create `/src/lib/translation-utils.ts` with stale detection functions
- Extend TranslationStatusItemProps with timestamp and callback props
- Implement amber/yellow warning styling (border, background, icon)
- Add StatusBadge showing "Outdated" with AlertTriangle icon for stale translations
- Add "Update Translation" button with loading state
- Internationalization for 6 languages: en, es, fr, de, it, nl
- Dark mode support for all colors
- Only manual translations show prominent stale warnings

---

## Task Breakdown

### Task 1: Create translation utilities module file
**Estimated effort**: 0.2 hours

- [ ] **1.1** Create directory `/src/lib/` if it doesn't already exist
- [ ] **1.2** Create file `/src/lib/translation-utils.ts`
- [ ] **1.3** Add JSDoc file header comment describing the module purpose
- [ ] **1.4** Add creation date: 2026-01-22
- [ ] **1.5** Reference REQ-E05-023 in file header
- [ ] **1.6** Add module exports placeholder

---

### Task 2: Implement isTranslationStale utility function
**Estimated effort**: 0.5 hours

- [ ] **2.1** Create `isTranslationStale` function accepting two timestamp parameters
- [ ] **2.2** Add parameter types: `sourceVersionAt: Date | string | null | undefined`
- [ ] **2.3** Add parameter types: `sourceUpdatedAt: Date | string | null | undefined`
- [ ] **2.4** Add return type: `boolean`
- [ ] **2.5** Add JSDoc comment explaining staleness detection logic
- [ ] **2.6** Check if both parameters are null/undefined - return false if either is missing
- [ ] **2.7** Wrap logic in try-catch block for error safety
- [ ] **2.8** Convert `sourceVersionAt` to timestamp using `new Date().getTime()`
- [ ] **2.9** Convert `sourceUpdatedAt` to timestamp using `new Date().getTime()`
- [ ] **2.10** Check if either timestamp is NaN (invalid date) - return false
- [ ] **2.11** Compare timestamps: return `sourceTime > versionTime`
- [ ] **2.12** In catch block, log error to console and return false
- [ ] **2.13** Export function: `export function isTranslationStale(...)`
- [ ] **2.14** Verify function handles Date objects correctly
- [ ] **2.15** Verify function handles ISO 8601 string dates correctly

---

### Task 3: Implement isTranslationStaleWithGrace utility function
**Estimated effort**: 0.3 hours

- [ ] **3.1** Create `isTranslationStaleWithGrace` function with three parameters
- [ ] **3.2** Add parameter: `sourceVersionAt: Date | string | null | undefined`
- [ ] **3.3** Add parameter: `sourceUpdatedAt: Date | string | null | undefined`
- [ ] **3.4** Add parameter with default: `graceMinutes: number = 5`
- [ ] **3.5** Add return type: `boolean`
- [ ] **3.6** Add JSDoc comment explaining grace period purpose
- [ ] **3.7** Check if both timestamps are null/undefined - return false
- [ ] **3.8** Wrap logic in try-catch block
- [ ] **3.9** Convert timestamps to milliseconds
- [ ] **3.10** Calculate grace period in milliseconds: `graceMinutes * 60 * 1000`
- [ ] **3.11** Check if either timestamp is NaN - return false
- [ ] **3.12** Compare with grace: return `sourceTime > (versionTime + graceMs)`
- [ ] **3.13** In catch block, log error and return false
- [ ] **3.14** Export function
- [ ] **3.15** Add note: This function is for future use, not used in initial implementation

---

### Task 4: Implement getTimeDifference helper function
**Estimated effort**: 0.3 hours

- [ ] **4.1** Create `getTimeDifference` function accepting two Date/string parameters
- [ ] **4.2** Add return type: `string`
- [ ] **4.3** Add JSDoc comment explaining purpose (human-readable time difference)
- [ ] **4.4** Wrap logic in try-catch block
- [ ] **4.5** Convert both dates to timestamps
- [ ] **4.6** Calculate difference in milliseconds: `newer - older`
- [ ] **4.7** Calculate minutes: `Math.floor(diffMs / (1000 * 60))`
- [ ] **4.8** Calculate hours: `Math.floor(diffMs / (1000 * 60 * 60))`
- [ ] **4.9** Calculate days: `Math.floor(diffMs / (1000 * 60 * 60 * 24))`
- [ ] **4.10** Return formatted string: "X days ago" if days > 0
- [ ] **4.11** Return formatted string: "X hours ago" if hours > 0
- [ ] **4.12** Return formatted string: "X minutes ago" if minutes > 0
- [ ] **4.13** Return "just now" if less than 1 minute
- [ ] **4.14** Handle plural vs singular: "1 day" vs "2 days"
- [ ] **4.15** In catch block, return 'unknown'
- [ ] **4.16** Export function

---

### Task 5: Create or locate TranslationStatusItem component file
**Estimated effort**: 0.2 hours

- [ ] **5.1** Check if directory `/src/components/TranslationManagement/TranslationPreviewPanel/` exists
- [ ] **5.2** Create directory structure if it doesn't exist
- [ ] **5.3** Check if file `TranslationStatusItem.tsx` exists in that directory
- [ ] **5.4** If file doesn't exist, create it with 'use client' directive
- [ ] **5.5** If file exists, read it to understand current structure
- [ ] **5.6** Add JSDoc file header if creating new file
- [ ] **5.7** Reference REQ-E05-023 in file header

---

### Task 6: Update or create TranslationStatusItemProps interface
**Estimated effort**: 0.3 hours

- [ ] **6.1** Locate or create `TranslationStatusItemProps` interface
- [ ] **6.2** Ensure existing props: `language: string`
- [ ] **6.3** Ensure existing props: `status: 'complete' | 'pending' | 'missing' | 'manual' | 'auto'`
- [ ] **6.4** Ensure existing props: `lastUpdated?: Date | string`
- [ ] **6.5** Ensure existing props: `onEdit?: () => void`
- [ ] **6.6** Add new prop: `sourceVersionAt?: Date | string | null`
- [ ] **6.7** Add JSDoc: "Timestamp when translation was based on source content"
- [ ] **6.8** Add new prop: `sourceUpdatedAt?: Date | string | null`
- [ ] **6.9** Add JSDoc: "Current timestamp of source content"
- [ ] **6.10** Add new prop: `onUpdateTranslation?: () => void`
- [ ] **6.11** Add JSDoc: "Callback when Update Translation button clicked"
- [ ] **6.12** Add new prop: `isUpdating?: boolean`
- [ ] **6.13** Add JSDoc: "Whether translation is currently being updated"
- [ ] **6.14** Add new prop: `className?: string`
- [ ] **6.15** Export interface
- [ ] **6.16** Run `npm run typecheck` to verify types

---

### Task 7: Import required dependencies in component
**Estimated effort**: 0.2 hours

- [ ] **7.1** Import icons from lucide-react: `AlertTriangle, Check, Clock, Edit, Languages, Loader2, RefreshCw`
- [ ] **7.2** Import `useTranslations` from 'next-intl'
- [ ] **7.3** Import `cn` from '@/lib/utils'
- [ ] **7.4** Import `isTranslationStale` from '@/lib/translation-utils'
- [ ] **7.5** Import React if needed for types
- [ ] **7.6** Verify all imports resolve correctly

---

### Task 8: Implement main TranslationStatusItem component structure
**Estimated effort**: 1.5 hours

- [ ] **8.1** Create or update function component with destructured props
- [ ] **8.2** Set default value for `isUpdating = false`
- [ ] **8.3** Initialize `useTranslations('translation.statusItem')` as `t`
- [ ] **8.4** Calculate `isStale` using: `status === 'manual' && isTranslationStale(sourceVersionAt, sourceUpdatedAt)`
- [ ] **8.5** Create container div with flex layout: `flex items-center justify-between`
- [ ] **8.6** Add padding and border radius: `p-3 rounded-lg border`
- [ ] **8.7** Add conditional styling with `cn()` utility
- [ ] **8.8** If `isStale`, apply amber styling: `border-amber-400 bg-amber-50`
- [ ] **8.9** Add dark mode variant for stale: `dark:bg-amber-950/20`
- [ ] **8.10** If NOT `isStale`, apply normal styling: `border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800`
- [ ] **8.11** Add transition: `transition-colors`
- [ ] **8.12** Apply custom `className` prop via `cn()`
- [ ] **8.13** Add ARIA attributes: `role="region"`
- [ ] **8.14** Add ARIA label: `aria-label={t('ariaLabel', { language })}`

---

### Task 9: Implement left side content (language and status)
**Estimated effort**: 0.5 hours

- [ ] **9.1** Create left side div: `flex items-center gap-3`
- [ ] **9.2** Create icon container with flex-shrink-0
- [ ] **9.3** Add Languages icon with size: `w-5 h-5`
- [ ] **9.4** Add icon color: `text-gray-600 dark:text-gray-400`
- [ ] **9.5** Create text container div
- [ ] **9.6** Add language name paragraph with font-medium
- [ ] **9.7** Use translation for language name: `t('languages.{language}')`
- [ ] **9.8** Add fallback: display uppercase language code if translation missing
- [ ] **9.9** Add color: `text-gray-900 dark:text-gray-100`
- [ ] **9.10** Render StatusBadge component passing `status` and `isStale` props

---

### Task 10: Implement StatusBadge sub-component
**Estimated effort**: 1 hour

- [ ] **10.1** Create `StatusBadge` interface with `status` and `isStale` props
- [ ] **10.2** Create function component `StatusBadge`
- [ ] **10.3** Initialize translations: `useTranslations('translation.statusItem')`
- [ ] **10.4** Add early return for stale state (highest priority)
- [ ] **10.5** If `isStale`, return span with AlertTriangle icon
- [ ] **10.6** Stale badge styling: `inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400`
- [ ] **10.7** Stale badge text: `{t('stale')}`
- [ ] **10.8** Add switch statement for normal status cases
- [ ] **10.9** Case 'complete': Check icon, green color, text `t('complete')`
- [ ] **10.10** Case 'pending': Clock icon, blue color, text `t('pending')`
- [ ] **10.11** Case 'missing': no icon (em dash), gray color, text `t('missing')`
- [ ] **10.12** Case 'manual': Edit icon, indigo color, text `t('manual')`
- [ ] **10.13** Case 'auto': RefreshCw icon, gray color, text `t('auto')`
- [ ] **10.14** Add `aria-hidden="true"` to all icons
- [ ] **10.15** All badge spans use same structure: `inline-flex items-center gap-1 text-sm`
- [ ] **10.16** Verify icon sizes are consistent: `w-3.5 h-3.5`

---

### Task 11: Implement right side actions (warning icon and buttons)
**Estimated effort**: 1 hour

- [ ] **11.1** Create right side div: `flex items-center gap-2`
- [ ] **11.2** Add conditional render: if `isStale`, show StaleWarningIcon
- [ ] **11.3** Add conditional render: if `isStale && onUpdateTranslation`, show Update button
- [ ] **11.4** Create Update Translation button element
- [ ] **11.5** Set button type: `type="button"`
- [ ] **11.6** Attach onClick: `onClick={onUpdateTranslation}`
- [ ] **11.7** Add disabled state: `disabled={isUpdating}`
- [ ] **11.8** Apply button styling: `inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md`
- [ ] **11.9** Add amber background: `bg-amber-100 text-amber-700 hover:bg-amber-200`
- [ ] **11.10** Add dark mode: `dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800`
- [ ] **11.11** Add disabled styling: `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] **11.12** Add focus styles: `focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2`
- [ ] **11.13** Add transition: `transition-all duration-200`
- [ ] **11.14** Add ARIA label: `aria-label={t('updateTranslationAriaLabel', { language })}`
- [ ] **11.15** Add conditional content: if `isUpdating`, show Loader2 icon with spin
- [ ] **11.16** Loading text: `{t('updating')}`
- [ ] **11.17** If not updating, show RefreshCw icon
- [ ] **11.18** Normal text: `{t('updateTranslation')}`
- [ ] **11.19** Add conditional render: if `onEdit`, show Edit button
- [ ] **11.20** Create Edit button with same structure but gray colors
- [ ] **11.21** Edit button: `text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600`
- [ ] **11.22** Edit button icon: Edit icon from lucide-react
- [ ] **11.23** Edit button text: `{t('edit')}` with responsive hide: `hidden sm:inline`

---

### Task 12: Implement StaleWarningIcon sub-component
**Estimated effort**: 0.3 hours

- [ ] **12.1** Create `StaleWarningIcon` function component (no props)
- [ ] **12.2** Initialize translations: `useTranslations('translation.statusItem')`
- [ ] **12.3** Create container div with circular shape: `p-1.5 rounded-full`
- [ ] **12.4** Add amber background: `bg-amber-100 dark:bg-amber-900`
- [ ] **12.5** Add tooltip: `title={t('staleTooltip')}`
- [ ] **12.6** Add ARIA attributes: `role="img"` and `aria-label={t('staleAriaLabel')}`
- [ ] **12.7** Add AlertTriangle icon with size: `w-4 h-4`
- [ ] **12.8** Add amber color: `text-amber-600 dark:text-amber-400`

---

### Task 13: Add English translation keys to messages/en.json
**Estimated effort**: 0.5 hours

- [ ] **13.1** Open file `/messages/en.json`
- [ ] **13.2** Locate or create `translation.statusItem` namespace
- [ ] **13.3** Add key `"ariaLabel": "{language} translation status"`
- [ ] **13.4** Add key `"stale": "Outdated"`
- [ ] **13.5** Add key `"staleTooltip": "Source content has changed since this translation was last updated"`
- [ ] **13.6** Add key `"staleAriaLabel": "Translation is outdated"`
- [ ] **13.7** Add key `"updateTranslation": "Update Translation"`
- [ ] **13.8** Add key `"updateTranslationAriaLabel": "Update {language} translation"`
- [ ] **13.9** Add key `"updating": "Updating..."`
- [ ] **13.10** Add key `"edit": "Edit"`
- [ ] **13.11** Add key `"editAriaLabel": "Edit {language} translation"`
- [ ] **13.12** Add key `"complete": "Complete"`
- [ ] **13.13** Add key `"pending": "Pending"`
- [ ] **13.14** Add key `"missing": "Missing"`
- [ ] **13.15** Add key `"manual": "Manual"`
- [ ] **13.16** Add key `"auto": "Auto"`
- [ ] **13.17** Create `languages` sub-object
- [ ] **13.18** Add `"es": "Spanish"`
- [ ] **13.19** Add `"fr": "French"`
- [ ] **13.20** Add `"de": "German"`
- [ ] **13.21** Add `"it": "Italian"`
- [ ] **13.22** Add `"nl": "Dutch"`
- [ ] **13.23** Verify JSON syntax is valid
- [ ] **13.24** Run `npm run build` to verify no JSON parsing errors

---

### Task 14: Add Spanish translation keys to messages/es.json
**Estimated effort**: 0.3 hours

- [ ] **14.1** Open file `/messages/es.json`
- [ ] **14.2** Locate or create `translation.statusItem` namespace
- [ ] **14.3** Add key `"ariaLabel": "Estado de traducción de {language}"`
- [ ] **14.4** Add key `"stale": "Desactualizada"`
- [ ] **14.5** Add key `"staleTooltip": "El contenido de origen ha cambiado desde la última actualización de esta traducción"`
- [ ] **14.6** Add key `"staleAriaLabel": "La traducción está desactualizada"`
- [ ] **14.7** Add key `"updateTranslation": "Actualizar traducción"`
- [ ] **14.8** Add key `"updateTranslationAriaLabel": "Actualizar traducción de {language}"`
- [ ] **14.9** Add key `"updating": "Actualizando..."`
- [ ] **14.10** Add key `"edit": "Editar"`
- [ ] **14.11** Add key `"editAriaLabel": "Editar traducción de {language}"`
- [ ] **14.12** Add status keys: complete=Completa, pending=Pendiente, missing=Faltante, manual=Manual, auto=Auto
- [ ] **14.13** Add language names: es=Español, fr=Francés, de=Alemán, it=Italiano, nl=Neerlandés
- [ ] **14.14** Verify JSON syntax is valid

---

### Task 15: Add French translation keys to messages/fr.json
**Estimated effort**: 0.3 hours

- [ ] **15.1** Open file `/messages/fr.json`
- [ ] **15.2** Locate or create `translation.statusItem` namespace
- [ ] **15.3** Add key `"ariaLabel": "Statut de traduction {language}"`
- [ ] **15.4** Add key `"stale": "Obsolète"`
- [ ] **15.5** Add key `"staleTooltip": "Le contenu source a changé depuis la dernière mise à jour de cette traduction"`
- [ ] **15.6** Add key `"staleAriaLabel": "La traduction est obsolète"`
- [ ] **15.7** Add key `"updateTranslation": "Mettre à jour la traduction"`
- [ ] **15.8** Add key `"updateTranslationAriaLabel": "Mettre à jour la traduction {language}"`
- [ ] **15.9** Add key `"updating": "Mise à jour..."`
- [ ] **15.10** Add key `"edit": "Modifier"`
- [ ] **15.11** Add key `"editAriaLabel": "Modifier la traduction {language}"`
- [ ] **15.12** Add status keys: complete=Terminée, pending=En attente, missing=Manquante, manual=Manuel, auto=Auto
- [ ] **15.13** Add language names: es=Espagnol, fr=Français, de=Allemand, it=Italien, nl=Néerlandais
- [ ] **15.14** Verify JSON syntax is valid

---

### Task 16: Add German translation keys to messages/de.json
**Estimated effort**: 0.3 hours

- [ ] **16.1** Open file `/messages/de.json`
- [ ] **16.2** Locate or create `translation.statusItem` namespace
- [ ] **16.3** Add key `"ariaLabel": "Übersetzungsstatus {language}"`
- [ ] **16.4** Add key `"stale": "Veraltet"`
- [ ] **16.5** Add key `"staleTooltip": "Der Quellinhalt hat sich seit der letzten Aktualisierung dieser Übersetzung geändert"`
- [ ] **16.6** Add key `"staleAriaLabel": "Die Übersetzung ist veraltet"`
- [ ] **16.7** Add key `"updateTranslation": "Übersetzung aktualisieren"`
- [ ] **16.8** Add key `"updateTranslationAriaLabel": "Übersetzung {language} aktualisieren"`
- [ ] **16.9** Add key `"updating": "Aktualisierung..."`
- [ ] **16.10** Add key `"edit": "Bearbeiten"`
- [ ] **16.11** Add key `"editAriaLabel": "Übersetzung {language} bearbeiten"`
- [ ] **16.12** Add status keys: complete=Vollständig, pending=Ausstehend, missing=Fehlend, manual=Manuell, auto=Auto
- [ ] **16.13** Add language names: es=Spanisch, fr=Französisch, de=Deutsch, it=Italienisch, nl=Niederländisch
- [ ] **16.14** Verify JSON syntax is valid

---

### Task 17: Add Italian translation keys to messages/it.json
**Estimated effort**: 0.3 hours

- [ ] **17.1** Open file `/messages/it.json`
- [ ] **17.2** Locate or create `translation.statusItem` namespace
- [ ] **17.3** Add key `"ariaLabel": "Stato traduzione {language}"`
- [ ] **17.4** Add key `"stale": "Obsoleta"`
- [ ] **17.5** Add key `"staleTooltip": "Il contenuto di origine è cambiato dall'ultimo aggiornamento di questa traduzione"`
- [ ] **17.6** Add key `"staleAriaLabel": "La traduzione è obsoleta"`
- [ ] **17.7** Add key `"updateTranslation": "Aggiorna traduzione"`
- [ ] **17.8** Add key `"updateTranslationAriaLabel": "Aggiorna traduzione {language}"`
- [ ] **17.9** Add key `"updating": "Aggiornamento..."`
- [ ] **17.10** Add key `"edit": "Modifica"`
- [ ] **17.11** Add key `"editAriaLabel": "Modifica traduzione {language}"`
- [ ] **17.12** Add status keys: complete=Completa, pending=In sospeso, missing=Mancante, manual=Manuale, auto=Auto
- [ ] **17.13** Add language names: es=Spagnolo, fr=Francese, de=Tedesco, it=Italiano, nl=Olandese
- [ ] **17.14** Verify JSON syntax is valid

---

### Task 18: Add Dutch translation keys to messages/nl.json
**Estimated effort**: 0.3 hours

- [ ] **18.1** Open file `/messages/nl.json`
- [ ] **18.2** Locate or create `translation.statusItem` namespace
- [ ] **18.3** Add key `"ariaLabel": "Vertaalstatus {language}"`
- [ ] **18.4** Add key `"stale": "Verouderd"`
- [ ] **18.5** Add key `"staleTooltip": "De broninhoud is gewijzigd sinds deze vertaling voor het laatst is bijgewerkt"`
- [ ] **18.6** Add key `"staleAriaLabel": "De vertaling is verouderd"`
- [ ] **18.7** Add key `"updateTranslation": "Vertaling bijwerken"`
- [ ] **18.8** Add key `"updateTranslationAriaLabel": "Vertaling {language} bijwerken"`
- [ ] **18.9** Add key `"updating": "Bijwerken..."`
- [ ] **18.10** Add key `"edit": "Bewerken"`
- [ ] **18.11** Add key `"editAriaLabel": "Vertaling {language} bewerken"`
- [ ] **18.12** Add status keys: complete=Voltooid, pending=In behandeling, missing=Ontbreekt, manual=Handmatig, auto=Auto
- [ ] **18.13** Add language names: es=Spaans, fr=Frans, de=Duits, it=Italiaans, nl=Nederlands
- [ ] **18.14** Verify JSON syntax is valid

---

### Task 19: Create or update barrel export file
**Estimated effort**: 0.1 hours

- [ ] **19.1** Check if `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` exists
- [ ] **19.2** Create file if it doesn't exist
- [ ] **19.3** Add JSDoc header comment describing the module
- [ ] **19.4** Add creation date: 2026-01-22
- [ ] **19.5** Export TranslationStatusItem component: `export { TranslationStatusItem } from './TranslationStatusItem';`
- [ ] **19.6** Export type: `export type { TranslationStatusItemProps } from './TranslationStatusItem';`
- [ ] **19.7** Verify exports work with test import

---

### Task 20: Create shared types file (optional but recommended)
**Estimated effort**: 0.2 hours

- [ ] **20.1** Create file `/src/components/TranslationManagement/TranslationManagement.types.ts` if it doesn't exist
- [ ] **20.2** Add JSDoc file header
- [ ] **20.3** Define `TranslationStatus` type: `'complete' | 'pending' | 'missing' | 'manual' | 'auto'`
- [ ] **20.4** Define `SupportedLanguage` type: `'es' | 'fr' | 'de' | 'it' | 'nl'`
- [ ] **20.5** Define `LanguageTranslationStatus` interface with language, status, lastUpdated, sourceVersionAt, isStale properties
- [ ] **20.6** Add JSDoc comments to all type definitions
- [ ] **20.7** Export all types

---

### Task 21: Verify TypeScript compilation
**Estimated effort**: 0.2 hours

- [ ] **21.1** Run `npm run typecheck` from project root
- [ ] **21.2** Verify zero errors in translation-utils.ts
- [ ] **21.3** Verify zero errors in TranslationStatusItem.tsx
- [ ] **21.4** Fix any type errors related to Date | string union types
- [ ] **21.5** Fix any type errors related to props interface
- [ ] **21.6** Fix any type errors related to conditional rendering
- [ ] **21.7** Verify no `any` types are used
- [ ] **21.8** Run `npm run typecheck` again and confirm zero errors

---

### Task 22: Write unit tests for translation utilities
**Estimated effort**: 1 hour

- [ ] **22.1** Create directory `/src/lib/__tests__/` if it doesn't exist
- [ ] **22.2** Create file `/src/lib/__tests__/translation-utils.test.ts`
- [ ] **22.3** Import test functions: `isTranslationStale`, `isTranslationStaleWithGrace`
- [ ] **22.4** Create test suite: `describe('translation-utils', ...)`
- [ ] **22.5** Test case: returns false when both timestamps are null
- [ ] **22.6** Test case: returns false when sourceVersionAt is null
- [ ] **22.7** Test case: returns false when sourceUpdatedAt is null
- [ ] **22.8** Test case: returns true when source updated after translation
- [ ] **22.9** Test case: returns false when translation is current
- [ ] **22.10** Test case: handles ISO string dates correctly
- [ ] **22.11** Test case: returns false for invalid dates
- [ ] **22.12** Test case: handles Date objects correctly
- [ ] **22.13** Test grace period: returns false within grace period
- [ ] **22.14** Test grace period: returns true beyond grace period
- [ ] **22.15** Run tests: `npm test`
- [ ] **22.16** Verify all tests pass

---

### Task 23: Test stale detection logic
**Estimated effort**: 0.5 hours

- [ ] **23.1** Create test page that imports TranslationStatusItem
- [ ] **23.2** Test with `sourceVersionAt` older than `sourceUpdatedAt` - verify stale styling appears
- [ ] **23.3** Test with `sourceVersionAt` newer than `sourceUpdatedAt` - verify normal styling
- [ ] **23.4** Test with equal timestamps - verify normal styling
- [ ] **23.5** Test with null `sourceVersionAt` - verify normal styling (cannot determine staleness)
- [ ] **23.6** Test with null `sourceUpdatedAt` - verify normal styling
- [ ] **23.7** Test with both null - verify normal styling
- [ ] **23.8** Test with invalid date strings - verify no crash, normal styling
- [ ] **23.9** Test with Date objects vs ISO strings - verify both work correctly
- [ ] **23.10** Verify stale detection only applies when `status='manual'`

---

### Task 24: Test visual styling and amber theme
**Estimated effort**: 0.5 hours

- [ ] **24.1** Verify stale translation has amber border: `border-amber-400`
- [ ] **24.2** Verify stale translation has amber background: `bg-amber-50`
- [ ] **24.3** Verify dark mode amber background: `dark:bg-amber-950/20`
- [ ] **24.4** Verify normal translation has gray border: `border-gray-200`
- [ ] **24.5** Verify normal translation has white background: `bg-white`
- [ ] **24.6** Verify dark mode for normal: `dark:border-gray-700 dark:bg-gray-800`
- [ ] **24.7** Verify StatusBadge shows amber "Outdated" text for stale
- [ ] **24.8** Verify StatusBadge shows AlertTriangle icon for stale
- [ ] **24.9** Verify amber colors match ManualEditWarningDialog theme
- [ ] **24.10** Verify transition-colors works smoothly

---

### Task 25: Test StatusBadge display for all states
**Estimated effort**: 0.5 hours

- [ ] **25.1** Test stale override: verify "Outdated" with AlertTriangle icon, amber color
- [ ] **25.2** Test complete status: verify "Complete" with Check icon, green color
- [ ] **25.3** Test pending status: verify "Pending" with Clock icon, blue color
- [ ] **25.4** Test missing status: verify "Missing" with em dash, gray color
- [ ] **25.5** Test manual status: verify "Manual" with Edit icon, indigo color
- [ ] **25.6** Test auto status: verify "Auto" with RefreshCw icon, gray color
- [ ] **25.7** Verify stale takes precedence over manual status
- [ ] **25.8** Verify icon sizes are consistent: `w-3.5 h-3.5`
- [ ] **25.9** Verify all icons have `aria-hidden="true"`

---

### Task 26: Test Update Translation button
**Estimated effort**: 0.5 hours

- [ ] **26.1** Verify button only appears when `isStale={true}`
- [ ] **26.2** Verify button only appears when `onUpdateTranslation` prop provided
- [ ] **26.3** Verify button does NOT appear for non-stale translations
- [ ] **26.4** Verify button shows "Update Translation" text with RefreshCw icon
- [ ] **26.5** Verify button has amber colors: `bg-amber-100 text-amber-700`
- [ ] **26.6** Verify button hover state: `hover:bg-amber-200`
- [ ] **26.7** Verify dark mode colors: `dark:bg-amber-900 dark:text-amber-100`
- [ ] **26.8** Verify button calls `onUpdateTranslation` callback when clicked
- [ ] **26.9** Verify button is disabled when `isUpdating={true}`
- [ ] **26.10** Verify loading state shows Loader2 icon with spin animation
- [ ] **26.11** Verify loading state shows "Updating..." text
- [ ] **26.12** Verify button has proper ARIA label with language name

---

### Task 27: Test StaleWarningIcon component
**Estimated effort**: 0.3 hours

- [ ] **27.1** Verify icon only appears for stale translations
- [ ] **27.2** Verify icon has circular amber background: `rounded-full bg-amber-100`
- [ ] **27.3** Verify dark mode: `dark:bg-amber-900`
- [ ] **27.4** Verify AlertTriangle icon is amber colored: `text-amber-600 dark:text-amber-400`
- [ ] **27.5** Verify tooltip appears on hover showing `staleTooltip` text
- [ ] **27.6** Verify ARIA label is present for screen readers
- [ ] **27.7** Verify role="img" attribute is present

---

### Task 28: Test Edit button functionality
**Estimated effort**: 0.3 hours

- [ ] **28.1** Verify Edit button appears when `onEdit` prop provided
- [ ] **28.2** Verify Edit button calls `onEdit` callback when clicked
- [ ] **28.3** Verify button has gray colors: `bg-gray-100 text-gray-700`
- [ ] **28.4** Verify dark mode: `dark:bg-gray-700 dark:text-gray-200`
- [ ] **28.5** Verify Edit icon appears
- [ ] **28.6** Verify button text is hidden on mobile: `hidden sm:inline`
- [ ] **28.7** Verify proper ARIA label with language name

---

### Task 29: Test internationalization for all languages
**Estimated effort**: 0.5 hours

- [ ] **29.1** Set locale to English (en) - verify all text displays correctly
- [ ] **29.2** Verify status labels: Outdated, Complete, Pending, Missing, Manual, Auto
- [ ] **29.3** Set locale to Spanish (es) - verify Spanish translations
- [ ] **29.4** Verify "Desactualizada", "Actualizar traducción"
- [ ] **29.5** Set locale to French (fr) - verify French translations
- [ ] **29.6** Verify "Obsolète", "Mettre à jour la traduction"
- [ ] **29.7** Set locale to German (de) - verify German translations
- [ ] **29.8** Verify "Veraltet", "Übersetzung aktualisieren"
- [ ] **29.9** Set locale to Italian (it) - verify Italian translations
- [ ] **29.10** Verify "Obsoleta", "Aggiorna traduzione"
- [ ] **29.11** Set locale to Dutch (nl) - verify Dutch translations
- [ ] **29.12** Verify "Verouderd", "Vertaling bijwerken"
- [ ] **29.13** Verify language display names translate correctly in each locale

---

### Task 30: Test accessibility features
**Estimated effort**: 0.5 hours

- [ ] **30.1** Verify component has `role="region"` attribute
- [ ] **30.2** Verify ARIA label includes language name
- [ ] **30.3** Test keyboard navigation: Tab to Update button
- [ ] **30.4** Test keyboard navigation: Tab to Edit button
- [ ] **30.5** Test Enter key activates focused button
- [ ] **30.6** Verify focus-visible ring appears on buttons
- [ ] **30.7** Test with screen reader (VoiceOver or NVDA) if available
- [ ] **30.8** Verify screen reader announces stale status
- [ ] **30.9** Verify screen reader announces button labels
- [ ] **30.10** Verify tooltip is keyboard accessible (focus on icon)

---

### Task 31: Test dark mode styling
**Estimated effort**: 0.3 hours

- [ ] **31.1** Switch to dark mode
- [ ] **31.2** Verify stale background: `dark:bg-amber-950/20`
- [ ] **31.3** Verify normal background: `dark:bg-gray-800`
- [ ] **31.4** Verify stale badge color: `dark:text-amber-400`
- [ ] **31.5** Verify Update button dark mode: `dark:bg-amber-900 dark:text-amber-100`
- [ ] **31.6** Verify Edit button dark mode: `dark:bg-gray-700 dark:text-gray-200`
- [ ] **31.7** Verify icon colors in dark mode
- [ ] **31.8** Verify sufficient contrast in dark mode (WCAG AA)
- [ ] **31.9** Verify stale warning icon dark mode: `dark:bg-amber-900`

---

### Task 32: Test responsive design
**Estimated effort**: 0.3 hours

- [ ] **32.1** Test on mobile viewport (375px width)
- [ ] **32.2** Verify Edit button text is hidden: `hidden sm:inline`
- [ ] **32.3** Verify Edit icon still visible on mobile
- [ ] **32.4** Verify buttons don't wrap awkwardly
- [ ] **32.5** Verify component fits within viewport
- [ ] **32.6** Test on tablet viewport (768px width)
- [ ] **32.7** Verify Edit button text appears: `sm:inline`
- [ ] **32.8** Test on desktop viewport (1440px width)
- [ ] **32.9** Verify layout looks balanced

---

### Task 33: Test edge cases
**Estimated effort**: 0.3 hours

- [ ] **33.1** Test with unknown language code - verify uppercase fallback displays
- [ ] **33.2** Test with missing optional props - verify no crashes
- [ ] **33.3** Test with `status='auto'` and stale timestamps - verify NO stale styling (only manual shows stale)
- [ ] **33.4** Test with very old timestamps (years ago) - verify works correctly
- [ ] **33.5** Test with future timestamps (edge case) - verify no crash
- [ ] **33.6** Test rapid prop changes - verify no memory leaks
- [ ] **33.7** Test with custom className prop - verify additional classes applied

---

### Task 34: Perform production build test
**Estimated effort**: 0.2 hours

- [ ] **34.1** Run `npm run build` from project root
- [ ] **34.2** Verify build succeeds without errors
- [ ] **34.3** Verify no build warnings related to TranslationStatusItem
- [ ] **34.4** Verify no build warnings related to translation-utils
- [ ] **34.5** Check bundle size impact
- [ ] **34.6** Start production server: `npm start`
- [ ] **34.7** Test component functionality in production mode
- [ ] **34.8** Verify no console errors in production

---

### Task 35: Code quality and linting
**Estimated effort**: 0.2 hours

- [ ] **35.1** Run `npm run lint` from project root
- [ ] **35.2** Fix any ESLint warnings in translation-utils.ts
- [ ] **35.3** Fix any ESLint warnings in TranslationStatusItem.tsx
- [ ] **35.4** Verify no unused imports
- [ ] **35.5** Verify no unused variables
- [ ] **35.6** Verify consistent code formatting
- [ ] **35.7** Run `npm run lint` again and confirm zero warnings

---

### Task 36: Final documentation and cleanup
**Estimated effort**: 0.2 hours

- [ ] **36.1** Review JSDoc comments for completeness
- [ ] **36.2** Verify all functions have clear descriptions
- [ ] **36.3** Verify all props have JSDoc comments
- [ ] **36.4** Remove any debugging code or console.log statements
- [ ] **36.5** Remove any commented-out code
- [ ] **36.6** Verify file headers include correct date and references
- [ ] **36.7** Create brief summary of implementation
- [ ] **36.8** Document any known limitations
- [ ] **36.9** Mark task as complete when all verification passes

---

## Completion Checklist

- [ ] File created: `/src/lib/translation-utils.ts` with 3 utility functions
- [ ] Function `isTranslationStale` implemented with error handling
- [ ] Function `isTranslationStaleWithGrace` implemented (for future use)
- [ ] Function `getTimeDifference` implemented for tooltips
- [ ] File created/updated: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- [ ] TranslationStatusItemProps interface extended with 4 new props
- [ ] Component uses `status === 'manual'` check before applying stale detection
- [ ] Amber/yellow styling applied for stale translations (border, background)
- [ ] StatusBadge sub-component shows "Outdated" with AlertTriangle for stale
- [ ] StaleWarningIcon sub-component displays amber warning icon with tooltip
- [ ] Update Translation button appears only for stale translations with callback
- [ ] Button shows loading state with Loader2 spinner when `isUpdating={true}`
- [ ] Edit button functionality preserved
- [ ] Translation keys added to `/messages/en.json`
- [ ] Translation keys added to `/messages/es.json`
- [ ] Translation keys added to `/messages/fr.json`
- [ ] Translation keys added to `/messages/de.json`
- [ ] Translation keys added to `/messages/it.json`
- [ ] Translation keys added to `/messages/nl.json`
- [ ] Barrel export created/updated: index.ts
- [ ] Shared types file created (optional): TranslationManagement.types.ts
- [ ] Unit tests written and passing for utility functions
- [ ] TypeScript compilation passes (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] All 6 locales tested and display correctly
- [ ] Dark mode styling works for all colors
- [ ] Responsive design tested (mobile hides Edit text)
- [ ] Accessibility tested (ARIA labels, keyboard navigation)
- [ ] No console errors or warnings
- [ ] Documentation complete with JSDoc comments

---

**Document Last Modified**: 2026-01-22 23:50

---

**END OF DOCUMENT**
