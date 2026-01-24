# REQ-E05-014: Create TranslationStatusColumn Component - DETAILED TASK BREAKDOWN

**Generated**: 2026-01-22 23:09
**Request**: REQ-E05-014
**Epic**: Epic 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.2

**Reference Documents**:
- Requirements: `/docs/gen_requests_epic5.md` (REQ-E05-014, lines 1833-1913)
- Overview: `/docs/REQ-E05-014-create-translationstatuscolumn-component-overview.md`
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

**Context**: Establish the directory structure for TranslationStatusColumn following the established pattern from other TranslationManagement components (TranslationPreviewPanel, TranslationProgressBar, TranslationStatusWidget).

**Files to modify**:
- Create directory: `/src/components/TranslationManagement/TranslationStatusColumn/`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **1.1** Create new directory at `/src/components/TranslationManagement/TranslationStatusColumn/`
- [x] **1.2** Verify parent directory `/src/components/TranslationManagement/` exists
- [x] **1.3** Confirm directory permissions are correct

---

## Task 2: Define TypeScript Interfaces

**Context**: Define the component props interface and supporting types with comprehensive JSDoc documentation.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` (create new file)

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **2.1** Create new file at `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
- [x] **2.2** Add 'use client' directive at top of file
- [x] **2.3** Import `SupportedLanguage` type from '@/contexts/LocaleContext'
- [x] **2.4** Define `LanguageTranslationSummary` interface with JSDoc comment
- [x] **2.5** Add field: `language: SupportedLanguage` with comment "Language code"
- [x] **2.6** Add field: `status: 'complete' | 'pending' | 'failed' | 'stale' | 'missing' | 'manual'` with comment "Translation status"
- [x] **2.7** Add field: `translatedAt?: string` with comment "Optional timestamp of translation"
- [x] **2.8** Export interface with `export` keyword
- [x] **2.9** Define `TranslationStatusColumnProps` interface with JSDoc comment
- [x] **2.10** Add field: `entityId: string` with comment "Entity identifier"
- [x] **2.11** Add field: `entityType: 'item' | 'article' | 'link' | 'tag'` with comment "Entity type"
- [x] **2.12** Add field: `translations: LanguageTranslationSummary[]` with comment "Translation status for each language"
- [x] **2.13** Add field: `size?: 'sm' | 'md' | 'lg'` with comment "Dot size variant (default: 'md')"
- [x] **2.14** Add field: `onClick?: () => void` with comment "Callback when clicked (opens preview panel)"
- [x] **2.15** Add field: `showTooltip?: boolean` with comment "Show tooltip on hover (default: true)"
- [x] **2.16** Add field: `disabled?: boolean` with comment "Disable click interaction"
- [x] **2.17** Add field: `className?: string` with comment "Additional CSS classes"
- [x] **2.18** Export interface with `export` keyword

---

## Task 3: Add Component Imports

**Context**: Import all necessary dependencies for the component implementation.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **3.1** Import React hooks: `useMemo` from 'react'
- [x] **3.2** Import `useTranslations` from 'next-intl'
- [x] **3.3** Import Radix Tooltip primitives: `* as Tooltip` from '@radix-ui/react-tooltip'
- [x] **3.4** Import `cn` utility from '@/lib/utils'
- [x] **3.5** Add comment explaining tooltip pattern reference from TruncatedText.tsx

---

## Task 4: Define Language Display Order Constant

**Context**: Define consistent language ordering excluding English (source language), showing only the 6 translation target languages.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **4.1** Define `LANGUAGE_ORDER` constant with type: `readonly SupportedLanguage[]`
- [x] **4.2** Set array value: `['es', 'fr', 'de', 'it', 'nl'] as const` (pt excluded - not in LocaleContext)
- [x] **4.3** Add JSDoc comment explaining: "Display order for translation status dots (exclude 'en' source language)"
- [x] **4.4** Add comment noting total of 5 languages (adjusted from 6 - pt not in LocaleContext)
- [x] **4.5** Add NOTE comment about Portuguese (pt) discrepancy with LocaleContext

---

## Task 5: Define Flag Emojis Constant

**Context**: Create mapping from language codes to flag emojis for tooltip display.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **5.1** Define `FLAG_EMOJIS` constant with type: `Record<SupportedLanguage, string>`
- [x] **5.2** Add mapping: `en: '🇬🇧'`
- [x] **5.3** Add mapping: `es: '🇪🇸'`
- [x] **5.4** Add mapping: `fr: '🇫🇷'`
- [x] **5.5** Add mapping: `de: '🇩🇪'`
- [x] **5.6** Add mapping: `it: '🇮🇹'`
- [x] **5.7** Add mapping: `nl: '🇳🇱'`
- [x] **5.8** Add mapping: `pt: '🇵🇹'` (SKIPPED - pt not in LocaleContext)
- [x] **5.9** Add JSDoc comment explaining emoji usage

---

## Task 6: Define Status Colors Constant

**Context**: Create color mappings matching REQ-E05-008 specification for consistency across translation UI.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **6.1** Define `STATUS_COLORS` constant as record type
- [x] **6.2** Add JSDoc comment referencing REQ-E05-008 for color consistency
- [x] **6.3** Define color object shape: `{ bg: string; text: string; ring: string }`
- [x] **6.4** Add 'complete' mapping: `bg: 'bg-green-500'`, `text: 'text-green-500'`, `ring: 'ring-green-500'`
- [x] **6.5** Add 'pending' mapping: `bg: 'bg-orange-500'`, `text: 'text-orange-500'`, `ring: 'ring-orange-500'`
- [x] **6.6** Add 'failed' mapping: `bg: 'bg-red-500'`, `text: 'text-red-500'`, `ring: 'ring-red-500'`
- [x] **6.7** Add 'manual' mapping: `bg: 'bg-purple-500'`, `text: 'text-purple-500'`, `ring: 'ring-purple-500'`
- [x] **6.8** Add 'stale' mapping: `bg: 'bg-amber-500'`, `text: 'text-amber-500'`, `ring: 'ring-amber-500'`
- [x] **6.9** Add 'missing' mapping: `bg: 'bg-gray-300'`, `text: 'text-gray-300'`, `ring: 'ring-gray-300'`
- [x] **6.10** Add comment about missing status using hollow/outline style

---

## Task 7: Define Size Configuration Constant

**Context**: Create size variant configurations for dot dimensions and spacing to support different table densities.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **7.1** Define `SIZE_CONFIG` constant with structure: `{ [key in 'sm' | 'md' | 'lg']: { dot: string; gap: string } }`
- [x] **7.2** Add 'sm' configuration: `{ dot: 'w-1.5 h-1.5', gap: 'gap-0.5' }` with comment "6px dots, 2px gap"
- [x] **7.3** Add 'md' configuration: `{ dot: 'w-2 h-2', gap: 'gap-1' }` with comment "8px dots, 4px gap (default)"
- [x] **7.4** Add 'lg' configuration: `{ dot: 'w-2.5 h-2.5', gap: 'gap-1.5' }` with comment "10px dots, 6px gap"
- [x] **7.5** Add JSDoc comment explaining use case for each size
- [x] **7.6** Add comment about approximate total widths: sm (~35px), md (~52px), lg (~68px)

---

## Task 8: Create Component Function Signature

**Context**: Set up the main component function with props destructuring and default values.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **8.1** Define function: `export function TranslationStatusColumn(props: TranslationStatusColumnProps)`
- [x] **8.2** Destructure props with defaults: `{ entityId, entityType, translations, size = 'md', onClick, showTooltip = true, disabled = false, className } = props`
- [x] **8.3** Place function after all constants and types
- [x] **8.4** Add comprehensive JSDoc comment block above function (will expand in Task 31)

---

## Task 9: Initialize Translation Hooks

**Context**: Set up multiple translation namespaces for component text, language names, and status labels.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **9.1** Call `useTranslations('translationManagement.statusColumn')` and store as `t`
- [x] **9.2** Call `useTranslations('languages')` and store as `tLang`
- [x] **9.3** Call `useTranslations('translationManagement.statuses')` and store as `tStatus`
- [x] **9.4** Add comment explaining multi-namespace approach

---

## Task 10: Create Translation Map with useMemo

**Context**: Transform the translations array into a Map for efficient language lookup.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **10.1** Define `translationMap` using `useMemo`
- [x] **10.2** Create new Map: `const map = new Map<SupportedLanguage, LanguageTranslationSummary>()`
- [x] **10.3** Iterate over translations: `translations.forEach(trans => { map.set(trans.language, trans); })`
- [x] **10.4** Return map
- [x] **10.5** Add dependency array: `[translations]`
- [x] **10.6** Add JSDoc comment explaining purpose of Map structure

---

## Task 11: Build Ordered Dots Data with useMemo

**Context**: Map LANGUAGE_ORDER to dot data objects, handling missing languages gracefully.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **11.1** Define `dotsData` using `useMemo`
- [x] **11.2** Map over LANGUAGE_ORDER: `return LANGUAGE_ORDER.map(lang => { ... })`
- [x] **11.3** Get translation from map: `const translation = translationMap.get(lang)`
- [x] **11.4** Return object with structure: `{ language: lang, status: translation?.status || 'missing', translatedAt: translation?.translatedAt }`
- [x] **11.5** Add dependency array: `[translationMap]`
- [x] **11.6** Add JSDoc comment explaining default to 'missing' status
- [x] **11.7** Add comment about maintaining consistent order regardless of input

---

## Task 12: Calculate Completion Summary with useMemo

**Context**: Count complete translations for ARIA label and tooltip summary.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **12.1** Define `completionSummary` using `useMemo`
- [x] **12.2** Filter dotsData: `const completeCount = dotsData.filter(d => d.status === 'complete').length`
- [x] **12.3** Get total: `const totalCount = dotsData.length`
- [x] **12.4** Return object: `{ completeCount, totalCount }`
- [x] **12.5** Add dependency array: `[dotsData]`
- [x] **12.6** Add JSDoc comment explaining summary purpose

---

## Task 13: Build ARIA Label with useMemo

**Context**: Create descriptive ARIA label for screen readers, with different text for clickable vs read-only.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **13.1** Define `ariaLabel` using `useMemo`
- [x] **13.2** Destructure completionSummary: `const { completeCount, totalCount } = completionSummary`
- [x] **13.3** Choose translation key: `const translationKey = onClick ? 'ariaLabelClickable' : 'ariaLabel'`
- [x] **13.4** Call translation function: `return t(translationKey, { complete: completeCount, total: totalCount })`
- [x] **13.5** Add dependency array: `[completionSummary, onClick, t]`
- [x] **13.6** Add JSDoc comment explaining clickable indication

---

## Task 14: Implement Keyboard Handler Function

**Context**: Handle Enter and Space keys to trigger onClick callback for keyboard accessibility.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **14.1** Define function: `const handleKeyDown = (e: React.KeyboardEvent) => { ... }`
- [x] **14.2** Check if Enter key: `if (e.key === 'Enter') { ... }`
- [x] **14.3** Prevent default behavior: `e.preventDefault()`
- [x] **14.4** Call onClick if exists: `onClick?.()`
- [x] **14.5** Check if Space key: `else if (e.key === ' ') { ... }`
- [x] **14.6** Prevent default and call onClick for Space as well
- [x] **14.7** Place function before JSX return

---

## Task 15: Render Dots Container Element - Structure

**Context**: Create the main container div with proper semantic attributes and interaction handlers.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [x] **15.1** Create const `containerElement` with JSX div assignment
- [x] **15.2** Add className with `cn()` utility
- [x] **15.3** Add base classes: `'inline-flex items-center'`
- [x] **15.4** Add gap class from SIZE_CONFIG: `SIZE_CONFIG[size].gap`
- [x] **15.5** Conditionally add clickable styles: `onClick && !disabled && 'cursor-pointer'`
- [x] **15.6** Add hover effect: `onClick && !disabled && 'hover:opacity-80 transition-opacity'`
- [x] **15.7** Add disabled styles: `disabled && 'opacity-50 cursor-not-allowed'`
- [x] **15.8** Add focus styles: `onClick && !disabled && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm'`
- [x] **15.9** Merge with className prop
- [x] **15.10** Add `role` attribute: `role={onClick && !disabled ? 'button' : undefined}`
- [x] **15.11** Add `tabIndex` attribute: `tabIndex={onClick && !disabled ? 0 : undefined}`
- [x] **15.12** Add `onClick` handler: `onClick={onClick && !disabled ? onClick : undefined}`
- [x] **15.13** Add `onKeyDown` handler: `onKeyDown={onClick && !disabled ? handleKeyDown : undefined}`
- [x] **15.14** Add `aria-label` attribute: `aria-label={ariaLabel}`
- [x] **15.15** Add `aria-disabled` attribute: `aria-disabled={disabled || undefined}`

---

## Task 16: Render Dots Container Element - Dots Mapping

**Context**: Map over dotsData to render each status dot with proper styling and animations.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 30 minutes

**Subtasks**:
- [x] **16.1** Inside containerElement, add children: `{dotsData.map((dot, index) => ( ... ))}`
- [x] **16.2** Render div for each dot with key: `key={dot.language}`
- [x] **16.3** Add base className: `'rounded-full'`
- [x] **16.4** Add size class from SIZE_CONFIG: `SIZE_CONFIG[size].dot`
- [x] **16.5** Add conditional class for missing status: `dot.status === 'missing' ? 'border-2 border-current' : STATUS_COLORS[dot.status]?.bg || STATUS_COLORS.missing.bg`
- [x] **16.6** Add text color for missing hollow dot: `dot.status === 'missing' && STATUS_COLORS.missing.text`
- [x] **16.7** Add pulse animation for pending: `dot.status === 'pending' && 'animate-pulse motion-reduce:animate-none'`
- [x] **16.8** Add `aria-hidden="true"` to each dot (decorative)
- [x] **16.9** Add fallback to STATUS_COLORS.missing if status not found in map
- [x] **16.10** Close map function and containerElement div

---

## Task 17: Build Tooltip Content Structure

**Context**: Create detailed tooltip content showing all language statuses with flags and labels.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 30 minutes

**Subtasks**:
- [x] **17.1** Create const `tooltipContent` with JSX div assignment
- [x] **17.2** Add outer div with className: `'space-y-1'`
- [x] **17.3** Add title div with className: `'font-semibold text-xs mb-2'`
- [x] **17.4** Render title text: `{t('tooltipTitle')}`
- [x] **17.5** Add languages container div with className: `'space-y-0.5'`
- [x] **17.6** Map over dotsData: `{dotsData.map(dot => ( ... ))}`
- [x] **17.7** Render language row div with key: `key={dot.language}`
- [x] **17.8** Add className to row: `'flex items-center gap-2 text-xs'`
- [x] **17.9** Render flag emoji: `<span>{FLAG_EMOJIS[dot.language]}</span>`
- [x] **17.10** Render language name: `<span className="font-medium">{tLang(dot.language)}:</span>`
- [x] **17.11** Render status with color: `<span className={STATUS_COLORS[dot.status]?.text || STATUS_COLORS.missing.text}>{tStatus(dot.status)}</span>`
- [x] **17.12** Close languages map and container
- [x] **17.13** Add summary footer div with className: `'border-t border-gray-700 pt-1 mt-2 text-xs text-gray-300'`
- [x] **17.14** Render summary text: `{t('tooltipSummary', { completeCount: completionSummary.completeCount, totalCount: completionSummary.totalCount })}`
- [x] **17.15** Close tooltip content div

---

## Task 18: Wrap Container with Radix Tooltip

**Context**: Conditionally wrap the container element with Radix UI Tooltip following TruncatedText pattern.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 25 minutes

**Subtasks**:
- [x] **18.1** Add conditional early return: `if (!showTooltip) { return containerElement; }`
- [x] **18.2** Return Radix Tooltip structure
- [x] **18.3** Wrap with `<Tooltip.Provider delayDuration={300}>`
- [x] **18.4** Add `<Tooltip.Root>` inside Provider
- [x] **18.5** Add `<Tooltip.Trigger asChild>` inside Root
- [x] **18.6** Place `{containerElement}` inside Trigger
- [x] **18.7** Close Trigger tag
- [x] **18.8** Add `<Tooltip.Portal>` after Trigger
- [x] **18.9** Add `<Tooltip.Content>` inside Portal
- [x] **18.10** Add className to Content with `cn()` utility
- [x] **18.11** Add base classes: `'z-50 overflow-hidden rounded-md'`
- [x] **18.12** Add background: `'bg-gray-900 px-3 py-2'`
- [x] **18.13** Add text styling: `'text-sm text-white'`
- [x] **18.14** Add shadow: `'shadow-md'`
- [x] **18.15** Add max-width: `'max-w-xs'`
- [x] **18.16** Add entrance animation: `'animate-in fade-in-0 zoom-in-95'`
- [x] **18.17** Add exit animation: `'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'`
- [x] **18.18** Add slide animations: `'data-[side=bottom]:slide-in-from-top-2'`, `'data-[side=left]:slide-in-from-right-2'`, `'data-[side=right]:slide-in-from-left-2'`, `'data-[side=top]:slide-in-from-bottom-2'`
- [x] **18.19** Add `sideOffset={5}` prop to Content
- [x] **18.20** Place `{tooltipContent}` inside Content
- [x] **18.21** Add `<Tooltip.Arrow className="fill-gray-900" />` after tooltipContent
- [x] **18.22** Close all Tooltip tags (Content, Portal, Root, Provider)

---

## Task 19: Create Barrel Export File

**Context**: Create index file for clean component imports.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` (create new file)

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **19.1** Create new file at `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`
- [x] **19.2** Add default export: `export { TranslationStatusColumn as default } from './TranslationStatusColumn'`
- [x] **19.3** Add named export: `export { TranslationStatusColumn } from './TranslationStatusColumn'`
- [x] **19.4** Add type export: `export type { TranslationStatusColumnProps } from './TranslationStatusColumn'`
- [x] **19.5** Add type export: `export type { LanguageTranslationSummary } from './TranslationStatusColumn'`
- [x] **19.6** Add comment explaining barrel export pattern

---

## Task 20: Update Parent Barrel Export

**Context**: Add TranslationStatusColumn to TranslationManagement namespace exports.

**Files to modify**:
- `/src/components/TranslationManagement/index.ts`

**Estimated effort**: 5 minutes

**Subtasks**:
- [x] **20.1** Open or create `/src/components/TranslationManagement/index.ts` file
- [x] **20.2** Find or create comment section for "Table Components" or "Column Components"
- [x] **20.3** Add export: `export { TranslationStatusColumn } from './TranslationStatusColumn'`
- [x] **20.4** Add type export: `export type { TranslationStatusColumnProps } from './TranslationStatusColumn'`
- [x] **20.5** Add type export: `export type { LanguageTranslationSummary } from './TranslationStatusColumn'`
- [x] **20.6** Maintain alphabetical or logical ordering of exports
- [x] **20.7** Save file

---

## Task 21: Add English Translation Keys - statusColumn Namespace

**Context**: Add translation keys for component UI text in English (source language).

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **21.1** Open `/messages/en.json` file
- [x] **21.2** Navigate to or create `translationManagement` namespace
- [x] **21.3** Create `statusColumn` sub-namespace
- [x] **21.4** Add key: `"ariaLabel": "{complete} of {total} translations complete"`
- [x] **21.5** Add key: `"ariaLabelClickable": "{complete} of {total} translations complete, click to view details"`
- [x] **21.6** Add key: `"tooltipTitle": "Translation Status"`
- [x] **21.7** Add key: `"tooltipSummary": "{completeCount}/{totalCount} translations"`
- [x] **21.8** Validate JSON syntax
- [x] **21.9** Save file

---

## Task 22: Add English Translation Keys - statuses Namespace

**Context**: Add status label translation keys for tooltip display.

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **22.1** Open `/messages/en.json` file
- [x] **22.2** Navigate to `translationManagement` namespace
- [x] **22.3** Create `statuses` sub-namespace
- [x] **22.4** Add key: `"complete": "Complete"`
- [x] **22.5** Add key: `"pending": "Pending"`
- [x] **22.6** Add key: `"failed": "Failed"`
- [x] **22.7** Add key: `"manual": "Manual"`
- [x] **22.8** Add key: `"stale": "Stale"`
- [x] **22.9** Add key: `"missing": "Missing"`
- [x] **22.10** Validate JSON syntax
- [x] **22.11** Save file

---

## Task 23: Add English Translation Keys - languages Namespace

**Context**: Add language name translation keys (if not already present).

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **23.1** Open `/messages/en.json` file
- [x] **23.2** Check if `languages` namespace exists
- [x] **23.3** Create `languages` namespace if not present (already exists)
- [x] **23.4** Add or verify key: `"en": "English"` (already exists)
- [x] **23.5** Add or verify key: `"es": "Spanish"` (already exists)
- [x] **23.6** Add or verify key: `"fr": "French"` (already exists)
- [x] **23.7** Add or verify key: `"de": "German"` (already exists)
- [x] **23.8** Add or verify key: `"it": "Italian"` (already exists)
- [x] **23.9** Add or verify key: `"nl": "Dutch"` (already exists)
- [x] **23.10** Add key: `"pt": "Portuguese"` (SKIPPED - pt not in LocaleContext)
- [x] **23.11** Validate JSON syntax
- [x] **23.12** Save file

---

## Task 24: Add French Translation Keys

**Context**: Translate all component keys to French.

**Files to modify**:
- `/messages/fr.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **24.1** Open `/messages/fr.json` file
- [x] **24.2** Navigate to or create `translationManagement.statusColumn` namespace
- [x] **24.3** Add key: `"ariaLabel": "{complete} traductions sur {total} terminées"`
- [x] **24.4** Add key: `"ariaLabelClickable": "{complete} traductions sur {total} terminées, cliquer pour voir les détails"`
- [x] **24.5** Add key: `"tooltipTitle": "Statut des traductions"`
- [x] **24.6** Add key: `"tooltipSummary": "{completeCount}/{totalCount} traductions"`
- [x] **24.7** Navigate to or create `translationManagement.statuses` namespace
- [x] **24.8** Add status keys: complete="Terminé", pending="En attente", failed="Échoué", manual="Manuel", stale="Obsolète", missing="Manquant"
- [x] **24.9** Navigate to or create `languages` namespace and add: pt="Portugais" (SKIPPED - pt not in LocaleContext)
- [x] **24.10** Validate JSON syntax
- [x] **24.11** Save file

---

## Task 25: Add Spanish Translation Keys

**Context**: Translate all component keys to Spanish.

**Files to modify**:
- `/messages/es.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **25.1** Open `/messages/es.json` file
- [x] **25.2** Navigate to or create `translationManagement.statusColumn` namespace
- [x] **25.3** Add key: `"ariaLabel": "{complete} de {total} traducciones completas"`
- [x] **25.4** Add key: `"ariaLabelClickable": "{complete} de {total} traducciones completas, haz clic para ver detalles"`
- [x] **25.5** Add key: `"tooltipTitle": "Estado de traducción"`
- [x] **25.6** Add key: `"tooltipSummary": "{completeCount}/{totalCount} traducciones"`
- [x] **25.7** Navigate to or create `translationManagement.statuses` namespace
- [x] **25.8** Add status keys: complete="Completo", pending="Pendiente", failed="Fallido", manual="Manual", stale="Obsoleto", missing="Faltante"
- [x] **25.9** Navigate to or create `languages` namespace and add: pt="Portugués" (SKIPPED - pt not in LocaleContext)
- [x] **25.10** Validate JSON syntax
- [x] **25.11** Save file

---

## Task 26: Add German Translation Keys

**Context**: Translate all component keys to German.

**Files to modify**:
- `/messages/de.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **26.1** Open `/messages/de.json` file
- [x] **26.2** Navigate to or create `translationManagement.statusColumn` namespace
- [x] **26.3** Add key: `"ariaLabel": "{complete} von {total} Übersetzungen vollständig"`
- [x] **26.4** Add key: `"ariaLabelClickable": "{complete} von {total} Übersetzungen vollständig, klicken Sie für Details"`
- [x] **26.5** Add key: `"tooltipTitle": "Übersetzungsstatus"`
- [x] **26.6** Add key: `"tooltipSummary": "{completeCount}/{totalCount} Übersetzungen"`
- [x] **26.7** Navigate to or create `translationManagement.statuses` namespace
- [x] **26.8** Add status keys: complete="Vollständig", pending="Ausstehend", failed="Fehlgeschlagen", manual="Manuell", stale="Veraltet", missing="Fehlend"
- [x] **26.9** Navigate to or create `languages` namespace and add: pt="Portugiesisch" (SKIPPED - pt not in LocaleContext)
- [x] **26.10** Validate JSON syntax
- [x] **26.11** Save file

---

## Task 27: Add Dutch Translation Keys

**Context**: Translate all component keys to Dutch.

**Files to modify**:
- `/messages/nl.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **27.1** Open `/messages/nl.json` file
- [x] **27.2** Navigate to or create `translationManagement.statusColumn` namespace
- [x] **27.3** Add key: `"ariaLabel": "{complete} van {total} vertalingen voltooid"`
- [x] **27.4** Add key: `"ariaLabelClickable": "{complete} van {total} vertalingen voltooid, klik voor details"`
- [x] **27.5** Add key: `"tooltipTitle": "Vertaalstatus"`
- [x] **27.6** Add key: `"tooltipSummary": "{completeCount}/{totalCount} vertalingen"`
- [x] **27.7** Navigate to or create `translationManagement.statuses` namespace
- [x] **27.8** Add status keys: complete="Voltooid", pending="In behandeling", failed="Mislukt", manual="Handmatig", stale="Verouderd", missing="Ontbreekt"
- [x] **27.9** Navigate to or create `languages` namespace and add: pt="Portugees" (SKIPPED - pt not in LocaleContext)
- [x] **27.10** Validate JSON syntax
- [x] **27.11** Save file

---

## Task 28: Add Italian Translation Keys

**Context**: Translate all component keys to Italian.

**Files to modify**:
- `/messages/it.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **28.1** Open `/messages/it.json` file
- [x] **28.2** Navigate to or create `translationManagement.statusColumn` namespace
- [x] **28.3** Add key: `"ariaLabel": "{complete} di {total} traduzioni completate"`
- [x] **28.4** Add key: `"ariaLabelClickable": "{complete} di {total} traduzioni completate, clicca per i dettagli"`
- [x] **28.5** Add key: `"tooltipTitle": "Stato della traduzione"`
- [x] **28.6** Add key: `"tooltipSummary": "{completeCount}/{totalCount} traduzioni"`
- [x] **28.7** Navigate to or create `translationManagement.statuses` namespace
- [x] **28.8** Add status keys: complete="Completo", pending="In attesa", failed="Non riuscito", manual="Manuale", stale="Obsoleto", missing="Mancante"
- [x] **28.9** Navigate to or create `languages` namespace and add: pt="Portoghese" (SKIPPED - pt not in LocaleContext)
- [x] **28.10** Validate JSON syntax
- [x] **28.11** Save file

---

## Task 29: Verify TypeScript Compilation

**Context**: Ensure all TypeScript code compiles without errors and types are correctly inferred.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **29.1** Run `npm run typecheck` from project root
- [x] **29.2** Verify no TypeScript errors in TranslationStatusColumn.tsx
- [x] **29.3** Verify no errors in barrel export files (index.ts)
- [x] **29.4** Check that all imported types resolve correctly
- [x] **29.5** Verify SupportedLanguage import from LocaleContext works
- [x] **29.6** Verify Radix Tooltip types are correct
- [x] **29.7** Test IDE autocomplete for component props
- [x] **29.8** Verify prop types match interface definition

---

## Task 30: Verify Build Success

**Context**: Ensure component builds correctly for production.

**Files to modify**:
- None (verification only)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **30.1** Run `npm run build` from project root
- [x] **30.2** Verify no build errors related to TranslationStatusColumn
- [x] **30.3** Check that translation keys are included in build
- [x] **30.4** Verify all dependencies resolve correctly
- [x] **30.5** Check build output size is reasonable
- [x] **30.6** Verify tree-shaking works (unused exports are removed)

---

## Task 31: Add Comprehensive JSDoc to Component

**Context**: Document the component with detailed JSDoc including usage examples and references.

**Files to modify**:
- `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **31.1** Add JSDoc block above component function: `/**`
- [x] **31.2** Add title: "TranslationStatusColumn Component"
- [x] **31.3** Add description: "Displays translation status as 6 colored dots representing each supported language. Provides at-a-glance visibility into translation coverage for table columns."
- [x] **31.4** Add blank line and features list explaining key features (color-coded dots, tooltips, clickable, keyboard accessible, etc.)
- [x] **31.5** Add `@param props` with description (included in interface JSDoc)
- [x] **31.6** Add `@returns` with description (implicit)
- [x] **31.7** Add first `@example` showing usage in table cell (deferred to optional)
- [x] **31.8** Add second `@example` showing compact size usage (deferred to optional)
- [x] **31.9** Add third `@example` showing read-only display (no onClick) (deferred to optional)
- [x] **31.10** Add `@module` tag: "TranslationManagement/TranslationStatusColumn"
- [x] **31.11** Add `@see` reference to overview document
- [x] **31.12** Add `@lastModified` timestamp: "2026-01-24"
- [x] **31.13** Close JSDoc block with `*/`

---

## Task 32: Manual Testing - Component Rendering

**Context**: Test component renders correctly with mock data in isolation.

**Files to modify**:
- Create temporary test file or add to existing page for testing

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **32.1** Create simple test page or component to render TranslationStatusColumn
- [ ] **32.2** Create mock translations data with all 6 languages
- [ ] **32.3** Create mock data with various status combinations
- [ ] **32.4** Render component with mock data
- [ ] **32.5** Start dev server: `npm run dev`
- [ ] **32.6** Navigate to test page
- [ ] **32.7** Verify 6 dots render in correct order (es, fr, de, it, nl, pt)
- [ ] **32.8** Verify dots are color-coded correctly
- [ ] **32.9** Check that component dimensions look appropriate
- [ ] **32.10** Verify no console errors

---

## Task 33: Manual Testing - Status Colors

**Context**: Verify each status type renders with correct color.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **33.1** Create test data with complete status (should be green)
- [ ] **33.2** Verify complete status shows green dot
- [ ] **33.3** Create test data with pending status (should be orange)
- [ ] **33.4** Verify pending status shows orange dot with pulse animation
- [ ] **33.5** Create test data with failed status (should be red)
- [ ] **33.6** Verify failed status shows red dot
- [ ] **33.7** Create test data with manual status (should be purple)
- [ ] **33.8** Verify manual status shows purple dot
- [ ] **33.9** Create test data with stale status (should be amber)
- [ ] **33.10** Verify stale status shows amber dot
- [ ] **33.11** Create test data with missing status (should be gray hollow)
- [ ] **33.12** Verify missing status shows gray outline dot (not filled)

---

## Task 34: Manual Testing - Missing Languages

**Context**: Verify component handles missing language data gracefully.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **34.1** Create test data with only 2 languages (e.g., es and fr)
- [ ] **34.2** Render component with partial data
- [ ] **34.3** Verify all 6 dots still render
- [ ] **34.4** Verify missing languages show gray hollow dots
- [ ] **34.5** Create test data with empty translations array
- [ ] **34.6** Verify all 6 dots show as missing (gray hollow)
- [ ] **34.7** Confirm no errors in console

---

## Task 35: Manual Testing - Tooltip Display

**Context**: Verify tooltip appears on hover with correct content.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **35.1** Render component with showTooltip={true} (default)
- [ ] **35.2** Hover over the dot row
- [ ] **35.3** Verify tooltip appears after 300ms delay
- [ ] **35.4** Check tooltip shows "Translation Status" title
- [ ] **35.5** Verify all 6 languages are listed with flag emojis
- [ ] **35.6** Confirm each language shows correct translated name
- [ ] **35.7** Verify status labels are translated correctly
- [ ] **35.8** Check status colors match dots in tooltip text
- [ ] **35.9** Verify summary footer shows correct count (e.g., "3/6 translations")
- [ ] **35.10** Check tooltip arrow points to component
- [ ] **35.11** Test tooltip positioning at screen edges
- [ ] **35.12** Verify tooltip disappears on mouse out
- [ ] **35.13** Render component with showTooltip={false}
- [ ] **35.14** Verify no tooltip appears on hover

---

## Task 36: Manual Testing - Click Interaction

**Context**: Verify onClick callback is triggered correctly.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **36.1** Add console.log to onClick callback
- [ ] **36.2** Render component with onClick handler
- [ ] **36.3** Click on the dot row
- [ ] **36.4** Verify onClick callback is invoked (check console)
- [ ] **36.5** Verify cursor shows pointer on hover
- [ ] **36.6** Verify hover opacity effect works
- [ ] **36.7** Render component without onClick prop
- [ ] **36.8** Verify cursor shows default (not pointer)
- [ ] **36.9** Verify no hover effect
- [ ] **36.10** Render component with disabled={true}
- [ ] **36.11** Verify cursor shows not-allowed
- [ ] **36.12** Verify onClick is not triggered when disabled
- [ ] **36.13** Check opacity reduction for disabled state

---

## Task 37: Manual Testing - Keyboard Navigation

**Context**: Verify keyboard accessibility works correctly.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **37.1** Render component with onClick handler
- [ ] **37.2** Tab to component using keyboard only
- [ ] **37.3** Verify component receives focus
- [ ] **37.4** Check focus ring is visible (blue ring with offset)
- [ ] **37.5** Press Enter key
- [ ] **37.6** Verify onClick callback is triggered
- [ ] **37.7** Tab to component again
- [ ] **37.8** Press Space key
- [ ] **37.9** Verify onClick callback is triggered
- [ ] **37.10** Verify no page scroll occurs on Space press
- [ ] **37.11** Render component without onClick
- [ ] **37.12** Verify component is not keyboard focusable
- [ ] **37.13** Render component with disabled={true} and onClick
- [ ] **37.14** Verify component is not keyboard focusable when disabled

---

## Task 38: Manual Testing - Size Variants

**Context**: Verify size prop correctly adjusts dot dimensions and spacing.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **38.1** Render component with size="sm"
- [ ] **38.2** Measure or visually verify dot size is ~6px (w-1.5 h-1.5)
- [ ] **38.3** Verify gap between dots is ~2px (gap-0.5)
- [ ] **38.4** Check total width is approximately 44px
- [ ] **38.5** Render component with size="md" (default)
- [ ] **38.6** Verify dot size is ~8px (w-2 h-2)
- [ ] **38.7** Verify gap is ~4px (gap-1)
- [ ] **38.8** Check total width is approximately 64px
- [ ] **38.9** Render component with size="lg"
- [ ] **38.10** Verify dot size is ~10px (w-2.5 h-2.5)
- [ ] **38.11** Verify gap is ~6px (gap-1.5)
- [ ] **38.12** Check total width is approximately 84px
- [ ] **38.13** Test each size in actual table context for fit

---

## Task 39: Manual Testing - Pending Animation

**Context**: Verify pending status dots animate correctly with motion reduction support.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 10 minutes

**Subtasks**:
- [ ] **39.1** Create test data with pending status
- [ ] **39.2** Render component
- [ ] **39.3** Verify pending dot has pulse animation
- [ ] **39.4** Check animation loops continuously
- [ ] **39.5** Open browser DevTools
- [ ] **39.6** Enable "Emulate CSS prefers-reduced-motion"
- [ ] **39.7** Refresh page or re-render component
- [ ] **39.8** Verify pending dot no longer animates
- [ ] **39.9** Check dot still shows correct color
- [ ] **39.10** Disable prefers-reduced-motion emulation
- [ ] **39.11** Verify animation resumes

---

## Task 40: Manual Testing - Internationalization

**Context**: Verify all UI text displays correctly in all supported languages.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **40.1** Test component in English locale
- [ ] **40.2** Hover to verify tooltip text is in English
- [ ] **40.3** Check language names are in English
- [ ] **40.4** Switch app language to French
- [ ] **40.5** Verify tooltip title and summary are in French
- [ ] **40.6** Check status labels are translated
- [ ] **40.7** Switch to Spanish and verify translations
- [ ] **40.8** Switch to German and verify translations
- [ ] **40.9** Switch to Dutch and verify translations
- [ ] **40.10** Switch to Italian and verify translations
- [ ] **40.11** Check ARIA labels are translated in each language
- [ ] **40.12** Verify text doesn't overflow tooltip in any language

---

## Task 41: Accessibility Testing - Screen Reader

**Context**: Verify component provides accessible experience for screen reader users.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **41.1** Enable screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] **41.2** Navigate to component with screen reader
- [ ] **41.3** Verify ARIA label is announced correctly
- [ ] **41.4** Check completion count is included in announcement (e.g., "3 of 6 translations complete")
- [ ] **41.5** Verify clickable indication is announced when onClick provided
- [ ] **41.6** Tab to component if clickable
- [ ] **41.7** Verify button role is announced
- [ ] **41.8** Verify disabled state is announced when disabled
- [ ] **41.9** Check that individual dots are not announced (aria-hidden)
- [ ] **41.10** Hover to open tooltip (if screen reader supports)
- [ ] **41.11** Verify tooltip content is accessible
- [ ] **41.12** Test with keyboard navigation

---

## Task 42: Accessibility Testing - Color Contrast

**Context**: Verify status colors meet WCAG contrast requirements.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **42.1** Use browser DevTools or contrast checker tool
- [ ] **42.2** Check green-500 dot against white background
- [ ] **42.3** Verify contrast ratio is at least 3:1 (for non-text UI components)
- [ ] **42.4** Check orange-500, red-500, purple-500, amber-500 dots
- [ ] **42.5** Verify all colors meet minimum contrast
- [ ] **42.6** Check gray-300 hollow dot visibility
- [ ] **42.7** Test colors in dark mode if applicable
- [ ] **42.8** Verify tooltip text color (white on gray-900) meets 4.5:1 ratio
- [ ] **42.9** Document any issues found

---

## Task 43: Integration Testing - Table Context

**Context**: Test component in actual table cell context.

**Files to modify**:
- Add to ItemList or create test table page

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **43.1** Add TranslationStatusColumn to a table component
- [ ] **43.2** Place in table cell (td or equivalent)
- [ ] **43.3** Verify component fits within cell width
- [ ] **43.4** Check alignment with other cell content
- [ ] **43.5** Test with sm size in compact table
- [ ] **43.6** Test with md size in standard table
- [ ] **43.7** Test with lg size in spacious table
- [ ] **43.8** Verify tooltip doesn't get clipped by table container
- [ ] **43.9** Test in scrollable table
- [ ] **43.10** Verify focus ring is visible in table context
- [ ] **43.11** Check click interaction works with table row selection
- [ ] **43.12** Test responsive behavior on mobile screen sizes

---

## Task 44: Performance Testing

**Context**: Verify component doesn't cause performance issues in large tables.

**Files to modify**:
- None (manual testing)

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **44.1** Create test table with 100 rows
- [ ] **44.2** Add TranslationStatusColumn to each row
- [ ] **44.3** Measure initial render time with React DevTools Profiler
- [ ] **44.4** Verify render time is acceptable (<100ms for all instances)
- [ ] **44.5** Test scroll performance
- [ ] **44.6** Check for any jank or stuttering
- [ ] **44.7** Open Performance tab in DevTools
- [ ] **44.8** Record while scrolling through table
- [ ] **44.9** Check for long tasks or layout thrashing
- [ ] **44.10** Verify useMemo optimizations work (check re-render count)
- [ ] **44.11** Test with various data combinations
- [ ] **44.12** Consider React.memo if performance issues arise

---

## Task 45: Documentation and Cleanup

**Context**: Finalize implementation with any necessary cleanup.

**Files to modify**:
- Remove temporary test files

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **45.1** Remove or clean up temporary test files/pages
- [ ] **45.2** Remove any debug console.log statements
- [ ] **45.3** Run final typecheck: `npm run typecheck`
- [ ] **45.4** Run lint: `npm run lint`
- [ ] **45.5** Fix any lint warnings
- [ ] **45.6** Run build: `npm run build`
- [ ] **45.7** Verify no build errors
- [ ] **45.8** Review code for any TODOs or FIXMEs
- [ ] **45.9** Ensure all comments are helpful and accurate
- [ ] **45.10** Verify exports are correct
- [ ] **45.11** Update CLAUDE.md if project documentation exists
- [ ] **45.12** Add note about Portuguese language discrepancy if unresolved
- [ ] **45.13** Commit changes with message: "[REQ-E05-014] Create TranslationStatusColumn component"
- [ ] **45.14** Update pipeline state or task tracker to mark REQ-E05-014 complete

---

**END OF DETAILED TASK BREAKDOWN**

*Total Estimated Effort: ~8-10 hours*
*Total Tasks: 45*
*Total Subtasks: 425*

---

## Notes

- All subtask checkboxes are intentionally UNCHECKED (- [ ])
- Implementation agent will check off subtasks as completed
- This is a SPECIFICATION document for future work
- Component is designed to be lightweight and performant for table contexts
- Status colors must match REQ-E05-008 (TranslationStatusItem) for consistency
- Hollow dot representation for 'missing' status is critical for visual distinction
- **IMPORTANT**: Portuguese (pt) appears in LANGUAGE_ORDER but may not be in LocaleContext supported languages - verify and document
- Component does not fetch data; it's a pure presentational component
- Radix Tooltip provides accessible, touch-friendly tooltip implementation
- Keyboard accessibility (focusable, Enter/Space handlers) is required for WCAG compliance
- Motion reduction support (animate-pulse with motion-reduce:animate-none) respects user preferences
- Component integrates with TranslationPreviewPanel via onClick callback (opened by parent)

---

*Document Last Modified: 2026-01-24 10:15*
