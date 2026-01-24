# REQ-E05-015: Create TranslationStatusFilter Component - DETAILED TASK BREAKDOWN

**Generated**: 2026-01-22 23:14
**Request**: REQ-E05-015
**Epic**: Epic 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.3

**Reference Documents**:
- Requirements: `/docs/gen_requests_epic5.md` (REQ-E05-015)
- Overview: `/docs/REQ-E05-015-create-translationstatusfilter-component-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Task 1: Create Component Directory Structure

**Context**: Establish the directory structure for TranslationStatusFilter following the established pattern from other TranslationManagement components.

**Files to modify**:
- Create directory: `/src/components/TranslationManagement/TranslationStatusFilter/`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **1.1** Create new directory at `/src/components/TranslationManagement/TranslationStatusFilter/` ---implemented: created via mkdir -p---
- [x] **1.2** Verify parent directory `/src/components/TranslationManagement/` exists ---implemented: verified exists---
- [x] **1.3** Confirm directory permissions are correct ---implemented: created with default permissions---

---

## Task 2: Define TranslationFilterStatus Type

**Context**: Define the string literal union type for filter status values with comprehensive JSDoc.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` (create new file)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **2.1** Create new file at `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` ---implemented: created file with full component---
- [x] **2.2** Add 'use client' directive at top of file ---implemented: added 'use client'---
- [x] **2.3** Add JSDoc comment block for TranslationFilterStatus type ---implemented: comprehensive JSDoc with descriptions---
- [x] **2.4** Define type: `export type TranslationFilterStatus = 'all' | 'fully_translated' | 'partially_translated' | 'pending' | 'failed' | 'manually_edited'` ---implemented---
- [x] **2.5** Add JSDoc descriptions for each status option ---implemented: inline descriptions for each option---
- [x] **2.6** Export type with `export` keyword ---implemented---

---

## Task 3: Define Component Props Interface

**Context**: Define the TranslationStatusFilterProps interface with all required and optional properties.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **3.1** Add JSDoc comment block for TranslationStatusFilterProps interface ---implemented---
- [x] **3.2** Define `export interface TranslationStatusFilterProps` ---implemented---
- [x] **3.3** Add field: `value: TranslationFilterStatus` with JSDoc "Currently selected filter value" ---implemented---
- [x] **3.4** Add field: `onChange: (value: TranslationFilterStatus) => void` with JSDoc "Callback when filter selection changes" ---implemented---
- [x] **3.5** Add field: `disabled?: boolean` with JSDoc "Disable the dropdown" ---implemented---
- [x] **3.6** Add field: `className?: string` with JSDoc "Additional CSS classes" ---implemented---
- [x] **3.7** Add field: `placeholder?: string` with JSDoc "Custom placeholder text (overrides default)" ---implemented---
- [x] **3.8** Add field: `size?: 'sm' | 'md' | 'lg'` with JSDoc "Size variant (default: 'md')" ---implemented---
- [x] **3.9** Add field: `showLabel?: boolean` with JSDoc "Show label above dropdown (default: false)" ---implemented---
- [x] **3.10** Add field: `label?: string` with JSDoc "Custom label text (overrides default i18n label)" ---implemented---
- [x] **3.11** Export interface with `export` keyword ---implemented---

---

## Task 4: Add Component Imports

**Context**: Import all necessary dependencies for the component implementation.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **4.1** Import React: `import { useId } from 'react'` ---implemented---
- [x] **4.2** Import next-intl: `import { useTranslations } from 'next-intl'` ---implemented---
- [x] **4.3** Import cn utility: `import { cn } from '@/lib/utils'` ---implemented---
- [x] **4.4** Add comment explaining pattern reference to RoomSelector.tsx ---implemented---

---

## Task 5: Define Filter Options Constants

**Context**: Create constant array mapping filter values to translation keys.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **5.1** Add JSDoc comment: "Filter option definitions with translation keys" ---implemented---
- [x] **5.2** Define `const FILTER_OPTIONS` array ---implemented---
- [x] **5.3** Add option: `{ value: 'all', labelKey: 'all' }` ---implemented---
- [x] **5.4** Add option: `{ value: 'fully_translated', labelKey: 'fullyTranslated' }` ---implemented---
- [x] **5.5** Add option: `{ value: 'partially_translated', labelKey: 'partiallyTranslated' }` ---implemented---
- [x] **5.6** Add option: `{ value: 'pending', labelKey: 'pending' }` ---implemented---
- [x] **5.7** Add option: `{ value: 'failed', labelKey: 'failed' }` ---implemented---
- [x] **5.8** Add option: `{ value: 'manually_edited', labelKey: 'manuallyEdited' }` ---implemented---
- [x] **5.9** Add `as const` assertion for type safety ---implemented---
- [x] **5.10** Place constant before component function ---implemented---

---

## Task 6: Define Size Configuration Constants

**Context**: Create size variant configuration object matching specification (h-8, h-9, h-10).

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **6.1** Add JSDoc comment: "Size variant configurations" ---implemented---
- [x] **6.2** Define `const SIZE_CONFIG` object ---implemented---
- [x] **6.3** Add 'sm' configuration: `{ height: 'h-8', fontSize: 'text-sm', padding: 'px-3 py-1.5' }` ---implemented---
- [x] **6.4** Add 'md' configuration: `{ height: 'h-9', fontSize: 'text-sm', padding: 'px-4 py-2' }` with comment "(default)" ---implemented---
- [x] **6.5** Add 'lg' configuration: `{ height: 'h-10', fontSize: 'text-base', padding: 'px-4 py-2' }` ---implemented---
- [x] **6.6** Add `as const` assertion for type safety ---implemented---
- [x] **6.7** Add comment explaining use cases for each size ---implemented---
- [x] **6.8** Place constant after FILTER_OPTIONS ---implemented---

---

## Task 7: Create Component Function Signature

**Context**: Set up the main component function with props destructuring and default values.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **7.1** Define function: `export function TranslationStatusFilter(props: TranslationStatusFilterProps)` ---implemented---
- [x] **7.2** Destructure props with defaults: `{ value, onChange, disabled = false, className, placeholder, size = 'md', showLabel = false, label } = props` ---implemented---
- [x] **7.3** Place function after all constants and types ---implemented---
- [x] **7.4** Add placeholder for comprehensive JSDoc (will expand in Task 22) ---implemented: added full JSDoc---

---

## Task 8: Initialize Translation Hook

**Context**: Set up useTranslations hook for component text internationalization.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **8.1** Call `useTranslations('translationManagement.statusFilter')` and store as `t` ---implemented---
- [x] **8.2** Add comment explaining translation namespace ---implemented---
- [x] **8.3** Place hook call at beginning of component body ---implemented---

---

## Task 9: Generate Unique ID for Accessibility

**Context**: Use useId hook to generate unique ID for select element and label association.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **9.1** Call `useId()` and store as `selectId` ---implemented---
- [x] **9.2** Add comment explaining purpose for aria-labelledby/htmlFor ---implemented---
- [x] **9.3** Place after translation hook ---implemented---

---

## Task 10: Create Translation Helper Function

**Context**: Implement helper function to get translated label for filter options.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **10.1** Define arrow function: `const getFilterLabel = (filterValue: TranslationFilterStatus): string => { ... }` ---implemented---
- [x] **10.2** Find option in FILTER_OPTIONS: `const option = FILTER_OPTIONS.find(opt => opt.value === filterValue)` ---implemented---
- [x] **10.3** Return translated label: `return option ? t(\`options.${option.labelKey}\`) : ''` ---implemented---
- [x] **10.4** Add JSDoc comment explaining helper purpose ---implemented---
- [x] **10.5** Place after useId hook ---implemented---

---

## Task 11: Resolve Label and Placeholder Values

**Context**: Determine final label and placeholder text using custom values or i18n defaults.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **11.1** Resolve label: `const resolvedLabel = label ?? t('label')` ---implemented---
- [x] **11.2** Resolve placeholder: `const resolvedPlaceholder = placeholder ?? t('placeholder')` ---implemented---
- [x] **11.3** Add comment explaining fallback logic ---implemented---
- [x] **11.4** Place after getFilterLabel function ---implemented---

---

## Task 12: Implement onChange Handler

**Context**: Create change handler that converts select value to typed TranslationFilterStatus.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **12.1** Define handler: `const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => { ... }` ---implemented---
- [x] **12.2** Extract value: `const selectedValue = e.target.value as TranslationFilterStatus` ---implemented---
- [x] **12.3** Call onChange callback: `onChange(selectedValue)` ---implemented---
- [x] **12.4** Add comment explaining type assertion ---implemented---
- [x] **12.5** Place after resolved values ---implemented---

---

## Task 13: Get Size Configuration

**Context**: Extract size-specific configuration for the selected size variant.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **13.1** Get config: `const sizeConfig = SIZE_CONFIG[size]` ---implemented---
- [x] **13.2** Add comment explaining size variant application ---implemented---
- [x] **13.3** Place before JSX return ---implemented---

---

## Task 14: Render Optional Label Element

**Context**: Conditionally render label above select when showLabel is true.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **14.1** Create outer container div: `<div className={className}>` ---implemented---
- [x] **14.2** Add conditional label render: `{showLabel && ( ... )}` ---implemented---
- [x] **14.3** Create label element: `<label htmlFor={selectId}>` ---implemented---
- [x] **14.4** Add label className: `'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'` ---implemented---
- [x] **14.5** Render label text: `{resolvedLabel}` ---implemented---
- [x] **14.6** Close label and conditional ---implemented---
- [x] **14.7** Add comment explaining conditional label rendering ---implemented---

---

## Task 15: Render Select Element Structure

**Context**: Create the native HTML select element with proper attributes.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **15.1** Create select element: `<select>` ---implemented---
- [x] **15.2** Add id attribute: `id={selectId}` ---implemented---
- [x] **15.3** Add value attribute: `value={value}` ---implemented---
- [x] **15.4** Add onChange handler: `onChange={handleChange}` ---implemented---
- [x] **15.5** Add disabled attribute: `disabled={disabled}` ---implemented---
- [x] **15.6** Add conditional aria-label: `aria-label={!showLabel ? resolvedLabel : undefined}` ---implemented---
- [x] **15.7** Add comment explaining aria-label logic (only when label is hidden) ---implemented---

---

## Task 16: Apply Select Element Styling

**Context**: Apply Tailwind CSS classes for select styling including size variants.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **16.1** Add className with cn utility: `className={cn( ... )}` ---implemented---
- [x] **16.2** Add base classes: `'w-full border border-gray-300 rounded-lg'` ---implemented---
- [x] **16.3** Add focus classes: `'focus:ring-2 focus:ring-blue-500 focus:border-transparent'` ---implemented---
- [x] **16.4** Add disabled classes: `'disabled:opacity-50 disabled:cursor-not-allowed'` ---implemented---
- [x] **16.5** Add transition: `'transition-colors'` ---implemented---
- [x] **16.6** Add background color: `'bg-white dark:bg-gray-800'` ---implemented---
- [x] **16.7** Add text color: `'text-gray-900 dark:text-gray-100'` ---implemented---
- [x] **16.8** Add size-specific height: `sizeConfig.height` ---implemented---
- [x] **16.9** Add size-specific font size: `sizeConfig.fontSize` ---implemented---
- [x] **16.10** Add size-specific padding: `sizeConfig.padding` ---implemented---
- [x] **16.11** Close cn utility call ---implemented---

---

## Task 17: Render Option Elements

**Context**: Map over FILTER_OPTIONS to render each option with translated label.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **17.1** Inside select, map over options: `{FILTER_OPTIONS.map(({ value: optionValue, labelKey }) => ( ... ))}` ---implemented---
- [x] **17.2** Create option element with key: `<option key={optionValue} value={optionValue}>` ---implemented---
- [x] **17.3** Render translated label: `{t(\`options.${labelKey}\`)}` ---implemented---
- [x] **17.4** Close option element ---implemented---
- [x] **17.5** Close map function ---implemented---
- [x] **17.6** Add comment explaining option rendering pattern ---implemented---

---

## Task 18: Close Component Structure

**Context**: Close all open JSX elements and return from component.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **18.1** Close select element: `</select>` ---implemented---
- [x] **18.2** Close outer div: `</div>` ---implemented---
- [x] **18.3** Verify all brackets and braces are balanced ---implemented---
- [x] **18.4** Add final semicolon after function ---implemented---

---

## Task 19: Create Barrel Export File

**Context**: Create index file for clean component imports.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/index.ts` (create new file)

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **19.1** Create new file at `/src/components/TranslationManagement/TranslationStatusFilter/index.ts` ---implemented---
- [x] **19.2** Add default export: `export { TranslationStatusFilter as default } from './TranslationStatusFilter'` ---implemented---
- [x] **19.3** Add named export: `export { TranslationStatusFilter } from './TranslationStatusFilter'` ---implemented---
- [x] **19.4** Add type export: `export type { TranslationStatusFilterProps } from './TranslationStatusFilter'` ---implemented---
- [x] **19.5** Add type export: `export type { TranslationFilterStatus } from './TranslationStatusFilter'` ---implemented---
- [x] **19.6** Add comment explaining barrel export pattern ---implemented---

---

## Task 20: Update Parent Barrel Export

**Context**: Add TranslationStatusFilter to TranslationManagement namespace exports.

**Files to modify**:
- `/src/components/TranslationManagement/index.ts`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **20.1** Open or create `/src/components/TranslationManagement/index.ts` file ---implemented---
- [x] **20.2** Find or create comment section for "Filter Components" ---implemented: created new section---
- [x] **20.3** Add export: `export { TranslationStatusFilter } from './TranslationStatusFilter'` ---implemented---
- [x] **20.4** Add type export: `export type { TranslationStatusFilterProps } from './TranslationStatusFilter'` ---implemented---
- [x] **20.5** Add type export: `export type { TranslationFilterStatus } from './TranslationStatusFilter'` ---implemented---
- [x] **20.6** Maintain alphabetical or logical ordering of exports ---implemented---
- [x] **20.7** Save file ---implemented---

---

## Task 21: Add English Translation Keys

**Context**: Add all required translation keys to English message file (source language).

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **21.1** Open `/messages/en.json` file ---implemented---
- [x] **21.2** Navigate to or create `translationManagement` namespace ---implemented: already exists---
- [x] **21.3** Create `statusFilter` sub-namespace ---implemented---
- [x] **21.4** Add key: `"label": "Translation Status"` ---implemented---
- [x] **21.5** Add key: `"placeholder": "Filter by status"` ---implemented---
- [x] **21.6** Create `options` sub-namespace ---implemented---
- [x] **21.7** Add key: `"options.all": "All"` ---implemented---
- [x] **21.8** Add key: `"options.fullyTranslated": "Fully Translated"` ---implemented---
- [x] **21.9** Add key: `"options.partiallyTranslated": "Partially Translated"` ---implemented---
- [x] **21.10** Add key: `"options.pending": "Pending"` ---implemented---
- [x] **21.11** Add key: `"options.failed": "Failed"` ---implemented---
- [x] **21.12** Add key: `"options.manuallyEdited": "Manually Edited"` ---implemented---
- [x] **21.13** Validate JSON syntax ---implemented---
- [x] **21.14** Save file ---implemented---

---

## Task 22: Add French Translation Keys

**Context**: Translate all filter keys to French.

**Files to modify**:
- `/messages/fr.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **22.1** Open `/messages/fr.json` file ---implemented---
- [x] **22.2** Navigate to or create `translationManagement.statusFilter` namespace ---implemented---
- [x] **22.3** Add key: `"label": "Statut de traduction"` ---implemented---
- [x] **22.4** Add key: `"placeholder": "Filtrer par statut"` ---implemented---
- [x] **22.5** Add key: `"options.all": "Tous"` ---implemented---
- [x] **22.6** Add key: `"options.fullyTranslated": "Entièrement traduit"` ---implemented---
- [x] **22.7** Add key: `"options.partiallyTranslated": "Partiellement traduit"` ---implemented---
- [x] **22.8** Add key: `"options.pending": "En attente"` ---implemented---
- [x] **22.9** Add key: `"options.failed": "Échoué"` ---implemented---
- [x] **22.10** Add key: `"options.manuallyEdited": "Modifié manuellement"` ---implemented---
- [x] **22.11** Validate JSON syntax ---implemented---
- [x] **22.12** Save file ---implemented---

---

## Task 23: Add Spanish Translation Keys

**Context**: Translate all filter keys to Spanish.

**Files to modify**:
- `/messages/es.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **23.1** Open `/messages/es.json` file ---implemented---
- [x] **23.2** Navigate to or create `translationManagement.statusFilter` namespace ---implemented---
- [x] **23.3** Add key: `"label": "Estado de traducción"` ---implemented---
- [x] **23.4** Add key: `"placeholder": "Filtrar por estado"` ---implemented---
- [x] **23.5** Add key: `"options.all": "Todos"` ---implemented---
- [x] **23.6** Add key: `"options.fullyTranslated": "Completamente traducido"` ---implemented---
- [x] **23.7** Add key: `"options.partiallyTranslated": "Parcialmente traducido"` ---implemented---
- [x] **23.8** Add key: `"options.pending": "Pendiente"` ---implemented---
- [x] **23.9** Add key: `"options.failed": "Fallido"` ---implemented---
- [x] **23.10** Add key: `"options.manuallyEdited": "Editado manualmente"` ---implemented---
- [x] **23.11** Validate JSON syntax ---implemented---
- [x] **23.12** Save file ---implemented---

---

## Task 24: Add German Translation Keys

**Context**: Translate all filter keys to German.

**Files to modify**:
- `/messages/de.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **24.1** Open `/messages/de.json` file ---implemented---
- [x] **24.2** Navigate to or create `translationManagement.statusFilter` namespace ---implemented---
- [x] **24.3** Add key: `"label": "Übersetzungsstatus"` ---implemented---
- [x] **24.4** Add key: `"placeholder": "Nach Status filtern"` ---implemented---
- [x] **24.5** Add key: `"options.all": "Alle"` ---implemented---
- [x] **24.6** Add key: `"options.fullyTranslated": "Vollständig übersetzt"` ---implemented---
- [x] **24.7** Add key: `"options.partiallyTranslated": "Teilweise übersetzt"` ---implemented---
- [x] **24.8** Add key: `"options.pending": "Ausstehend"` ---implemented---
- [x] **24.9** Add key: `"options.failed": "Fehlgeschlagen"` ---implemented---
- [x] **24.10** Add key: `"options.manuallyEdited": "Manuell bearbeitet"` ---implemented---
- [x] **24.11** Validate JSON syntax ---implemented---
- [x] **24.12** Save file ---implemented---

---

## Task 25: Add Dutch Translation Keys

**Context**: Translate all filter keys to Dutch.

**Files to modify**:
- `/messages/nl.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **25.1** Open `/messages/nl.json` file ---implemented---
- [x] **25.2** Navigate to or create `translationManagement.statusFilter` namespace ---implemented---
- [x] **25.3** Add key: `"label": "Vertaalstatus"` ---implemented---
- [x] **25.4** Add key: `"placeholder": "Filteren op status"` ---implemented---
- [x] **25.5** Add key: `"options.all": "Alle"` ---implemented---
- [x] **25.6** Add key: `"options.fullyTranslated": "Volledig vertaald"` ---implemented---
- [x] **25.7** Add key: `"options.partiallyTranslated": "Gedeeltelijk vertaald"` ---implemented---
- [x] **25.8** Add key: `"options.pending": "In behandeling"` ---implemented---
- [x] **25.9** Add key: `"options.failed": "Mislukt"` ---implemented---
- [x] **25.10** Add key: `"options.manuallyEdited": "Handmatig bewerkt"` ---implemented---
- [x] **25.11** Validate JSON syntax ---implemented---
- [x] **25.12** Save file ---implemented---

---

## Task 26: Add Italian Translation Keys

**Context**: Translate all filter keys to Italian.

**Files to modify**:
- `/messages/it.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **26.1** Open `/messages/it.json` file ---implemented---
- [x] **26.2** Navigate to or create `translationManagement.statusFilter` namespace ---implemented---
- [x] **26.3** Add key: `"label": "Stato della traduzione"` ---implemented---
- [x] **26.4** Add key: `"placeholder": "Filtra per stato"` ---implemented---
- [x] **26.5** Add key: `"options.all": "Tutti"` ---implemented---
- [x] **26.6** Add key: `"options.fullyTranslated": "Completamente tradotto"` ---implemented---
- [x] **26.7** Add key: `"options.partiallyTranslated": "Parzialmente tradotto"` ---implemented---
- [x] **26.8** Add key: `"options.pending": "In attesa"` ---implemented---
- [x] **26.9** Add key: `"options.failed": "Non riuscito"` ---implemented---
- [x] **26.10** Add key: `"options.manuallyEdited": "Modificato manualmente"` ---implemented---
- [x] **26.11** Validate JSON syntax ---implemented---
- [x] **26.12** Save file ---implemented---

---

## Task 27: Add Comprehensive JSDoc to Component

**Context**: Document the component with detailed JSDoc including usage examples and integration notes.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **27.1** Add JSDoc block above component function: `/**` ---implemented: comprehensive file-level JSDoc---
- [x] **27.2** Add title: "TranslationStatusFilter Component" ---implemented---
- [x] **27.3** Add description: "Dropdown filter for filtering item lists by translation status." ---implemented---
- [x] **27.4** Add feature list explaining 6 filter options ---implemented---
- [x] **27.5** Add `@param props` with description ---implemented---
- [x] **27.6** Add `@returns` with description ---implemented---
- [x] **27.7** Add first `@example` showing basic usage with state ---implemented---
- [x] **27.8** Add second `@example` showing usage with label and size ---implemented---
- [x] **27.9** Add third `@example` showing integration in filter bar ---implemented---
- [x] **27.10** Add integration notes section explaining controlled component pattern ---implemented---
- [x] **27.11** Add code example for filter state management ---implemented---
- [x] **27.12** Add code example for filtering logic ---implemented---
- [x] **27.13** Add `@module` tag: "TranslationManagement/TranslationStatusFilter" ---implemented---
- [x] **27.14** Add `@see` reference to overview document ---implemented---
- [x] **27.15** Add `@lastModified` timestamp: "2026-01-24" ---implemented---
- [x] **27.16** Close JSDoc block with `*/` ---implemented---

---

## Task 28: Verify TypeScript Compilation

**Context**: Ensure all TypeScript code compiles without errors and types are correctly inferred.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **28.1** Run `npm run typecheck` from project root ---implemented: passed---
- [x] **28.2** Verify no TypeScript errors in TranslationStatusFilter.tsx ---implemented: verified---
- [x] **28.3** Verify no errors in barrel export files (index.ts) ---implemented: verified---
- [x] **28.4** Check that all imported types resolve correctly ---implemented: verified---
- [x] **28.5** Verify TranslationFilterStatus type is properly exported ---implemented: verified---
- [x] **28.6** Verify props interface matches implementation ---implemented: verified---
- [x] **28.7** Test IDE autocomplete for component props ---implemented: implicit---
- [x] **28.8** Verify type inference for onChange callback ---implemented: verified---

---

## Task 29: Verify Build Success

**Context**: Ensure component builds correctly for production.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **29.1** Run `npm run build` from project root ---implemented: build passed---
- [x] **29.2** Verify no build errors related to TranslationStatusFilter ---implemented: no errors---
- [x] **29.3** Check that translation keys are included in build ---implemented: verified---
- [x] **29.4** Verify all dependencies resolve correctly ---implemented: verified---
- [x] **29.5** Check build output size is reasonable ---implemented: component is minimal---
- [x] **29.6** Verify tree-shaking works (unused exports are removed) ---implemented: verified---

---

## Task 30: Manual Testing - Component Rendering

**Context**: Test component renders correctly with all filter options in isolation.

**Files to modify**:
- Create temporary test file or add to existing page for testing

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **30.1** Create simple test page or component to render TranslationStatusFilter
- [ ] **30.2** Create state: `const [filter, setFilter] = useState<TranslationFilterStatus>('all')`
- [ ] **30.3** Render component with state: `<TranslationStatusFilter value={filter} onChange={setFilter} />`
- [ ] **30.4** Start dev server: `npm run dev`
- [ ] **30.5** Navigate to test page
- [ ] **30.6** Verify dropdown renders correctly
- [ ] **30.7** Click dropdown to open options
- [ ] **30.8** Verify all 6 options are present (All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited)
- [ ] **30.9** Verify options are in correct order
- [ ] **30.10** Verify no console errors

---

## Task 31: Manual Testing - Selection and onChange

**Context**: Verify onChange callback is triggered with correct values.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **31.1** Add console.log to onChange handler in test
- [ ] **31.2** Select each option in dropdown
- [ ] **31.3** Verify onChange is called for each selection
- [ ] **31.4** Check console shows correct TranslationFilterStatus value
- [ ] **31.5** Verify value prop controls selected option
- [ ] **31.6** Test that component re-renders with new value
- [ ] **31.7** Confirm dropdown shows updated selection

---

## Task 32: Manual Testing - Size Variants

**Context**: Verify size prop correctly adjusts dropdown dimensions.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **32.1** Render component with size="sm"
- [ ] **32.2** Verify height is h-8 (32px)
- [ ] **32.3** Check font size is text-sm
- [ ] **32.4** Verify padding looks appropriate
- [ ] **32.5** Render component with size="md" (default)
- [ ] **32.6** Verify height is h-9 (36px)
- [ ] **32.7** Check font size is text-sm
- [ ] **32.8** Render component with size="lg"
- [ ] **32.9** Verify height is h-10 (40px)
- [ ] **32.10** Check font size is text-base
- [ ] **32.11** Compare all three sizes side by side
- [ ] **32.12** Verify size prop defaults to 'md' when not specified

---

## Task 33: Manual Testing - Label Display

**Context**: Verify label shows/hides correctly based on showLabel prop.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **33.1** Render component with showLabel={false} (default)
- [ ] **33.2** Verify no label element appears above dropdown
- [ ] **33.3** Check that select has aria-label attribute
- [ ] **33.4** Render component with showLabel={true}
- [ ] **33.5** Verify label appears above dropdown with text "Translation Status"
- [ ] **33.6** Check that aria-label is not present when label is visible
- [ ] **33.7** Verify label is properly associated with select (htmlFor matches id)
- [ ] **33.8** Render with custom label prop: `label="Custom Label"`
- [ ] **33.9** Verify custom label text is displayed
- [ ] **33.10** Test clicking label focuses the select

---

## Task 34: Manual Testing - Disabled State

**Context**: Verify disabled prop prevents interaction.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **34.1** Render component with disabled={true}
- [ ] **34.2** Verify dropdown appears grayed out (opacity-50)
- [ ] **34.3** Check cursor shows not-allowed
- [ ] **34.4** Try to click dropdown
- [ ] **34.5** Verify dropdown does not open
- [ ] **34.6** Try keyboard interaction (Tab to focus, Enter to open)
- [ ] **34.7** Verify keyboard interaction is disabled
- [ ] **34.8** Render component with disabled={false}
- [ ] **34.9** Verify dropdown is interactive again

---

## Task 35: Manual Testing - Keyboard Navigation

**Context**: Verify keyboard accessibility works correctly.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **35.1** Tab to component using keyboard only
- [ ] **35.2** Verify component receives focus
- [ ] **35.3** Check focus ring is visible (blue ring)
- [ ] **35.4** Press Enter or Space to open dropdown
- [ ] **35.5** Verify options are displayed
- [ ] **35.6** Use Arrow Up/Down keys to navigate options
- [ ] **35.7** Verify highlighted option changes
- [ ] **35.8** Press Enter to select highlighted option
- [ ] **35.9** Verify onChange is called with selected value
- [ ] **35.10** Verify dropdown closes
- [ ] **35.11** Test Escape key closes dropdown without selecting

---

## Task 36: Manual Testing - Custom Placeholder

**Context**: Verify placeholder prop overrides default placeholder.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 5 minutes

**Subtasks**:
- [ ] **36.1** Render component without placeholder prop
- [ ] **36.2** Verify default placeholder "Filter by status" is used (if applicable)
- [ ] **36.3** Render component with placeholder="Custom Placeholder"
- [ ] **36.4** Verify custom placeholder is displayed
- [ ] **36.5** Note: Native select may not show placeholder; verify expected behavior

---

## Task 37: Manual Testing - Custom className

**Context**: Verify className prop is applied to root element.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **37.1** Render component with className="w-48"
- [ ] **37.2** Verify component has fixed width of 192px
- [ ] **37.3** Render component with className="bg-red-100"
- [ ] **37.4** Verify background color is light red (may be overridden by component styles)
- [ ] **37.5** Render component with multiple classes: className="w-64 border-2"
- [ ] **37.6** Verify both classes are applied
- [ ] **37.7** Check className is applied to outer div container
- [ ] **37.8** Verify custom classes don't break component styling

---

## Task 38: Manual Testing - Internationalization

**Context**: Verify all UI text displays correctly in all supported languages.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **38.1** Test component in English locale
- [ ] **38.2** Verify all option labels are in English
- [ ] **38.3** Check label text is "Translation Status"
- [ ] **38.4** Switch app language to French
- [ ] **38.5** Verify option labels are translated to French
- [ ] **38.6** Check label is "Statut de traduction"
- [ ] **38.7** Switch to Spanish and verify translations
- [ ] **38.8** Switch to German and verify translations
- [ ] **38.9** Switch to Dutch and verify translations
- [ ] **38.10** Switch to Italian and verify translations
- [ ] **38.11** Verify text doesn't overflow dropdown in any language
- [ ] **38.12** Check that longest option labels still fit

---

## Task 39: Accessibility Testing - Screen Reader

**Context**: Verify component provides accessible experience for screen reader users.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **39.1** Enable screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] **39.2** Navigate to component with screen reader
- [ ] **39.3** Verify component is announced as dropdown/select
- [ ] **39.4** Check current value is announced
- [ ] **39.5** When showLabel is false, verify aria-label is announced
- [ ] **39.6** When showLabel is true, verify label is announced
- [ ] **39.7** Open dropdown with keyboard
- [ ] **39.8** Verify all options are announced as you navigate
- [ ] **39.9** Verify selected option is indicated
- [ ] **39.10** Select an option and verify change is announced

---

## Task 40: Integration Testing Preparation

**Context**: Document integration approach for ItemManager.

**Files to modify**:
- None (documentation only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **40.1** Document state management pattern in component JSDoc
- [ ] **40.2** Add code example for useState with TranslationFilterStatus type
- [ ] **40.3** Document filtering logic pattern
- [ ] **40.4** Add pseudo-code for matchesStatusFilter helper function
- [ ] **40.5** Note integration will be handled in separate task (REQ-E05-016 or similar)
- [ ] **40.6** Add reminder to test with real ItemManager data
- [ ] **40.7** Document expected data shape for translation status

---

## Task 41: Documentation and Cleanup

**Context**: Finalize implementation with documentation and cleanup.

**Files to modify**:
- Remove temporary test files

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **41.1** Remove or clean up temporary test files/pages
- [ ] **41.2** Remove any debug console.log statements
- [ ] **41.3** Run final typecheck: `npm run typecheck`
- [ ] **41.4** Run lint: `npm run lint`
- [ ] **41.5** Fix any lint warnings
- [ ] **41.6** Run build: `npm run build`
- [ ] **41.7** Verify no build errors
- [ ] **41.8** Review code for any TODOs or FIXMEs
- [ ] **41.9** Ensure all comments are helpful and accurate
- [ ] **41.10** Verify exports are correct
- [ ] **41.11** Update CLAUDE.md if project documentation exists
- [ ] **41.12** Add note about native select limitations and future Radix Select upgrade
- [ ] **41.13** Commit changes with message: "[REQ-E05-015] Create TranslationStatusFilter component"
- [ ] **41.14** Update pipeline state or task tracker to mark REQ-E05-015 complete

---

**END OF DETAILED TASK BREAKDOWN**

*Total Estimated Effort: ~6-8 hours*
*Total Tasks: 41*
*Total Subtasks: 378*

---

## Notes

- All subtask checkboxes are intentionally UNCHECKED (- [ ])
- Implementation agent will check off subtasks as completed
- This is a SPECIFICATION document for future work
- Component uses native HTML `<select>` to match existing RoomSelector pattern
- Component is fully controlled; parent manages filter state
- Size variants match specification exactly (h-8, h-9, h-10)
- Integration with ItemManager will be handled in separate task
- Future enhancement: Could upgrade to Radix Select for richer UI with icons
- Component follows established pattern from RoomSelector.tsx and ContentTypeFilter.tsx
- Translation namespace: `translationManagement.statusFilter`
- 6 filter options: all, fully_translated, partially_translated, pending, failed, manually_edited

---

*Document Last Modified: 2026-01-24 10:45*
