# Create TranslationStatusItem Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:46
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #8)
- Overview: docs/REQ-E05-008-create-translationstatusitem-component-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create Component File and Setup Imports

**Context:** Following the pattern from AssetItem.tsx (src/components/ItemManager/components/AssetManager/AssetItem.tsx, lines 1-24), create a new component file for TranslationStatusItem that will display a single language's translation status as a row within the TranslationPreviewPanel. The component needs React hooks, i18n support, icons, utilities, and type definitions.

**Files to modify:**
- Create: `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **1.1** Create the component file: `touch src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- [ ] **1.2** Open the file and add `'use client';` directive at the top
- [ ] **1.3** Add JSDoc module header comment describing the component: "TranslationStatusItem Component - Displays translation status for a single language as a row in the preview panel. Shows flag emoji, language name, status icon, preview text, and action buttons."
- [ ] **1.4** Add JSDoc tags: `@module TranslationManagement/TranslationPreviewPanel/TranslationStatusItem`, `@see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`, `@created 2026-01-22`, `@requestReference REQ-E05-008`
- [ ] **1.5** Import React hook: `import { useMemo } from 'react';`
- [ ] **1.6** Import next-intl: `import { useTranslations } from 'next-intl';`
- [ ] **1.7** Import Lucide icons: `import { Check, Clock, AlertCircle, X, Pencil, AlertTriangle, Circle, Loader2, Eye } from 'lucide-react';`
- [ ] **1.8** Import utility function: `import { cn } from '@/lib/utils';`
- [ ] **1.9** Import type from parent module: `import type { SupportedLanguage } from '@/components/TranslationManagement/TranslationManagement.types';`

---

## 2. Define Component Props Interface

**Context:** Create the TypeScript interface that defines all props the component accepts. This establishes the component's API contract and enables type-safe usage. Based on overview lines 188-201 and the TranslationStatusItemProps pattern.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Add section comment: `// =============================================================================` followed by `// Component Props Interface` followed by `// =============================================================================`
- [ ] **2.2** Define TranslationStatusItemProps interface with these fields: `language` (SupportedLanguage), `status` ('pending' | 'processing' | 'completed' | 'failed' | 'manual' | 'stale' | 'missing'), `previewText` (string or null/undefined), `lastUpdated` (string or null/undefined - ISO timestamp), `isSelected` (optional boolean), `disabled` (optional boolean with default false), `onEdit` (optional function accepting language parameter), `onRetranslate` (optional function accepting language parameter), `onRetry` (optional function accepting language parameter), `onPreview` (optional function accepting language parameter), `onSelectionChange` (optional function accepting language and selected boolean parameters), `className` (optional string)
- [ ] **2.3** Add JSDoc comment for the interface explaining the purpose of key props: language (which language this row represents), status (current translation status), previewText (first 30 chars of translated content), onSelectionChange (when provided, shows checkbox for bulk selection)
- [ ] **2.4** Add prop validation comments: disabled grays out the row and prevents interactions, isSelected controls checkbox state when onSelectionChange is provided

---

## 3. Define Flag Emoji and Status Configuration Constants

**Context:** Create constants that map language codes to flag emojis and translation statuses to their visual representation (icon, colors). Based on overview lines 72-131 and the PRD UI specifications (lines 799-807).

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Add section comment: `// =============================================================================` followed by `// Constants` followed by `// =============================================================================`
- [ ] **3.2** Define FLAG_EMOJIS constant: `const FLAG_EMOJIS: Record<string, string> = { en: '🇺🇸', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪', nl: '🇳🇱', it: '🇮🇹' } as const;`
- [ ] **3.3** Add JSDoc comment for FLAG_EMOJIS: "Maps language codes to flag emoji representations."
- [ ] **3.4** Define STATUS_CONFIG constant with entries for each status: completed, pending, processing, failed, manual, stale, missing
- [ ] **3.5** For 'completed' status: `{ icon: Check, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }`
- [ ] **3.6** For 'pending' status: `{ icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }`
- [ ] **3.7** For 'processing' status: `{ icon: Loader2, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', animate: 'animate-spin' }`
- [ ] **3.8** For 'failed' status: `{ icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }`
- [ ] **3.9** For 'manual' status: `{ icon: Pencil, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }`
- [ ] **3.10** For 'stale' status: `{ icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }`
- [ ] **3.11** For 'missing' status: `{ icon: Circle, color: 'text-gray-400', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }`
- [ ] **3.12** Add JSDoc comment for STATUS_CONFIG: "Visual configuration for each translation status including icon component, text color, background color, and border color."

---

## 4. Define Helper Functions

**Context:** Create utility functions for text truncation and determining which action buttons to show based on status. These functions encapsulate business logic and keep the component render function clean. Based on overview lines 134-179.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Add section comment: `// =============================================================================` followed by `// Helper Functions` followed by `// =============================================================================`
- [ ] **4.2** Create truncatePreview function: `function truncatePreview(text: string | null | undefined, maxLength: number = 30): string { if (!text) return ''; if (text.length <= maxLength) return text; return text.substring(0, maxLength) + '...'; }`
- [ ] **4.3** Add JSDoc for truncatePreview: "Truncates preview text to specified length with ellipsis. Returns empty string if text is null/undefined."
- [ ] **4.4** Define ActionButtonConfig interface: `interface ActionButtonConfig { showEdit: boolean; showRetranslate: boolean; showRetry: boolean; showTranslate: boolean; }`
- [ ] **4.5** Create getActionButtons function with signature: `function getActionButtons(status: string): ActionButtonConfig`
- [ ] **4.6** Implement switch statement for status: 'completed' returns showEdit=true, showRetranslate=true, others false
- [ ] **4.7** Case 'manual': returns showEdit=true, showRetranslate=true, others false
- [ ] **4.8** Case 'stale': returns showEdit=true, showRetranslate=true, others false
- [ ] **4.9** Case 'failed': returns showEdit=true, showRetry=true, showRetranslate=false, showTranslate=false
- [ ] **4.10** Case 'missing': returns showTranslate=true, all others false
- [ ] **4.11** Case 'pending', 'processing', and default: return all false (no action buttons shown)
- [ ] **4.12** Add JSDoc for getActionButtons: "Determines which action buttons should be displayed based on the translation status."

---

## 5. Implement Main Component Function and Setup

**Context:** Create the main component function export with props destructuring, translation hooks, and computed values using useMemo. Following the pattern from AssetItem.tsx (lines 154-180).

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Add section comment: `// =============================================================================` followed by `// Component` followed by `// =============================================================================`
- [ ] **5.2** Create function export: `export function TranslationStatusItem(props: TranslationStatusItemProps) {`
- [ ] **5.3** Destructure props: `const { language, status, previewText, lastUpdated, isSelected = false, disabled = false, onEdit, onRetranslate, onRetry, onPreview, onSelectionChange, className } = props;`
- [ ] **5.4** Initialize translation hooks: `const t = useTranslations('translation.statusItem');` and `const tLang = useTranslations('languages');`
- [ ] **5.5** Get status configuration: `const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.missing;`
- [ ] **5.6** Extract status icon: `const StatusIcon = statusConfig.icon;`
- [ ] **5.7** Get flag emoji: `const flagEmoji = FLAG_EMOJIS[language] || '🏳️';`
- [ ] **5.8** Get localized language name: `const languageName = tLang(language);`
- [ ] **5.9** Compute action buttons with useMemo: `const actionButtons = useMemo(() => getActionButtons(status), [status]);`
- [ ] **5.10** Compute truncated preview with useMemo: `const truncatedPreview = useMemo(() => truncatePreview(previewText, 30), [previewText]);`
- [ ] **5.11** Compute if text is truncated: `const isTruncated = previewText ? previewText.length > 30 : false;`

---

## 6. Implement Event Handlers

**Context:** Create callback functions for checkbox change and row click events. These handlers coordinate with parent component callbacks and manage user interactions.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Add section comment: `// Event Handlers`
- [ ] **6.2** Create handleCheckboxChange function: `const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (disabled) return; e.stopPropagation(); // Prevent row click onSelectionChange?.(language, e.target.checked); };`
- [ ] **6.3** Create handleRowClick function: `const handleRowClick = () => { if (disabled || !onPreview) return; onPreview(language); };`
- [ ] **6.4** Create handleEditClick function: `const handleEditClick = (e: React.MouseEvent) => { if (disabled) return; e.stopPropagation(); onEdit?.(language); };`
- [ ] **6.5** Create handleRetranslateClick function: `const handleRetranslateClick = (e: React.MouseEvent) => { if (disabled) return; e.stopPropagation(); onRetranslate?.(language); };`
- [ ] **6.6** Create handleRetryClick function: `const handleRetryClick = (e: React.MouseEvent) => { if (disabled) return; e.stopPropagation(); onRetry?.(language); };`
- [ ] **6.7** Add JSDoc comments explaining each handler's purpose and stopPropagation behavior

---

## 7. Implement Root Container Element

**Context:** Create the main row container div with responsive styling, hover effects, and conditional classes based on disabled/clickable state. Following AssetItem.tsx pattern (lines 280-295).

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Add return statement with opening div
- [ ] **7.2** Apply className using cn utility: `className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all duration-200', !disabled && onPreview && 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer', disabled && 'opacity-60 cursor-not-allowed', 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900', className)}`
- [ ] **7.3** Add onClick handler: `onClick={handleRowClick}`
- [ ] **7.4** Add role attribute: `role="listitem"`
- [ ] **7.5** Add aria-label attribute: `aria-label={t('rowLabel', { language: languageName, status: t(`status.${status}`) })}`
- [ ] **7.6** Add aria-disabled attribute when disabled: `aria-disabled={disabled}`
- [ ] **7.7** Add data-testid for testing: `data-testid={`translation-status-${language}`}`

---

## 8. Implement Checkbox Section

**Context:** Add the optional checkbox for bulk selection that appears on the left when onSelectionChange prop is provided. The checkbox should be styled consistently with project patterns and support keyboard interaction.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Inside root div, add conditional checkbox section: `{onSelectionChange && ( <div className="shrink-0"> ... </div> )}`
- [ ] **8.2** Add input element with type="checkbox"
- [ ] **8.3** Set checked attribute: `checked={isSelected}`
- [ ] **8.4** Set onChange handler: `onChange={handleCheckboxChange}`
- [ ] **8.5** Set disabled attribute: `disabled={disabled}`
- [ ] **8.6** Apply classes: `className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"`
- [ ] **8.7** Add aria-label: `aria-label={t('selectLanguage', { language: languageName })}`
- [ ] **8.8** Add onClick with stopPropagation: `onClick={(e) => e.stopPropagation()}`

---

## 9. Implement Flag and Language Name Section

**Context:** Display the flag emoji and localized language name with proper spacing and typography. This section provides primary identification for the row.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** After checkbox section, add flag and language container: `<div className="flex items-center gap-2 min-w-[120px]">`
- [ ] **9.2** Add flag emoji span: `<span className="text-2xl" role="img" aria-label={t('flagFor', { language: languageName })}> {flagEmoji} </span>`
- [ ] **9.3** Add language name span: `<span className="text-sm font-medium text-gray-900 dark:text-white"> {languageName} </span>`
- [ ] **9.4** Close container div

---

## 10. Implement Status Icon Section

**Context:** Display the status icon with appropriate color coding and animation (for processing state). The icon visually indicates the current translation state at a glance.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** After language section, add status icon container: `<div className={cn('flex items-center justify-center w-8 h-8 rounded-full', statusConfig.bgColor)}>`
- [ ] **10.2** Render StatusIcon component: `<StatusIcon className={cn('h-4 w-4', statusConfig.color, statusConfig.animate)} aria-hidden="true" />`
- [ ] **10.3** Close container div
- [ ] **10.4** Add screen reader status text after icon: `<span className="sr-only">{t(`status.${status}`)}</span>`

---

## 11. Implement Preview Text Section

**Context:** Display the truncated preview text of the translated content with tooltip support for full text when truncated. This gives users a glimpse of the translation quality without opening the full editor.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** After status section, add preview text container: `<div className="flex-1 min-w-0">`
- [ ] **11.2** Add conditional rendering for preview text: `{previewText && ( <p className={cn('text-sm truncate', disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300')} title={isTruncated ? previewText : undefined} > {truncatedPreview} </p> )}`
- [ ] **11.3** Add placeholder for missing preview: `{!previewText && ( <p className="text-sm text-gray-400 dark:text-gray-500 italic"> {t('noPreview')} </p> )}`
- [ ] **11.4** Close container div

---

## 12. Implement Action Buttons Section

**Context:** Add the action buttons that appear on the right side of the row. Button visibility is controlled by the actionButtons computed value based on translation status. Following the button pattern from AssetItem.tsx.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** After preview text, add action buttons container: `<div className="flex items-center gap-2 shrink-0">`
- [ ] **12.2** Add Edit button (conditional): `{actionButtons.showEdit && onEdit && ( <button onClick={handleEditClick} disabled={disabled} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('editTranslation', { language: languageName })} title={t('edit')} > <Pencil className="h-4 w-4" /> </button> )}`
- [ ] **12.3** Add Re-translate button (conditional): `{actionButtons.showRetranslate && onRetranslate && ( <button onClick={handleRetranslateClick} disabled={disabled} className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('retranslate', { language: languageName })} title={t('retranslate')} > <Eye className="h-4 w-4" /> </button> )}`
- [ ] **12.4** Add Retry button (conditional): `{actionButtons.showRetry && onRetry && ( <button onClick={handleRetryClick} disabled={disabled} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('retry', { language: languageName })} title={t('retry')} > <AlertCircle className="h-4 w-4" /> </button> )}`
- [ ] **12.5** Add Translate button for missing status (conditional): `{actionButtons.showTranslate && onRetranslate && ( <button onClick={handleRetranslateClick} disabled={disabled} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('translate', { language: languageName })} > {t('translate')} </button> )}`
- [ ] **12.6** Close action buttons container div
- [ ] **12.7** Close root container div and component function

---

## 13. Add Translation Keys to English Locale

**Context:** Define all i18n translation keys needed for the component UI in messages/en.json. Following the pattern from existing translation namespaces and the keys identified in overview lines 203-205.

**Files to modify:**
- `messages/en.json`

**Estimated effort:** 1 story point

- [ ] **13.1** Open messages/en.json
- [ ] **13.2** Locate or create "translation" root object
- [ ] **13.3** Add "statusItem" namespace under "translation"
- [ ] **13.4** Add key "rowLabel" with value "Translation for {language}: {status}"
- [ ] **13.5** Add key "selectLanguage" with value "Select {language}"
- [ ] **13.6** Add key "flagFor" with value "Flag for {language}"
- [ ] **13.7** Add key "noPreview" with value "No preview available"
- [ ] **13.8** Add key "edit" with value "Edit"
- [ ] **13.9** Add key "editTranslation" with value "Edit {language} translation"
- [ ] **13.10** Add key "retranslate" with value "Re-translate"
- [ ] **13.11** Add key "retry" with value "Retry"
- [ ] **13.12** Add key "translate" with value "Translate"
- [ ] **13.13** Add nested "status" object with keys: pending="Pending", processing="Processing", completed="Completed", failed="Failed", manual="Manually edited", stale="Stale", missing="Not translated"
- [ ] **13.14** Add "languages" root object if not exists
- [ ] **13.15** Under "languages", add keys: en="English", fr="French", es="Spanish", de="German", nl="Dutch", it="Italian"
- [ ] **13.16** Verify JSON syntax is valid

---

## 14. Add Translation Keys to Other Locale Files

**Context:** Add the same translation keys to all other supported language locale files with appropriate translations. These translations localize the component UI itself.

**Files to modify:**
- `messages/fr.json`
- `messages/es.json`
- `messages/de.json`
- `messages/nl.json`
- `messages/it.json`

**Estimated effort:** 1 story point

- [ ] **14.1** Open messages/fr.json and add "translation.statusItem" keys in French: rowLabel="Traduction pour {language}: {status}", selectLanguage="Sélectionner {language}", flagFor="Drapeau pour {language}", noPreview="Aucun aperçu disponible", edit="Modifier", editTranslation="Modifier la traduction {language}", retranslate="Retraduire", retry="Réessayer", translate="Traduire", status.pending="En attente", status.processing="En cours", status.completed="Terminé", status.failed="Échec", status.manual="Modifié manuellement", status.stale="Obsolète", status.missing="Non traduit"
- [ ] **14.2** Add French language names under "languages": en="Anglais", fr="Français", es="Espagnol", de="Allemand", nl="Néerlandais", it="Italien"
- [ ] **14.3** Open messages/es.json and add Spanish translations: rowLabel="Traducción para {language}: {status}", selectLanguage="Seleccionar {language}", flagFor="Bandera de {language}", noPreview="Vista previa no disponible", edit="Editar", editTranslation="Editar traducción {language}", retranslate="Retraducir", retry="Reintentar", translate="Traducir", status keys, language names
- [ ] **14.4** Open messages/de.json and add German translations: rowLabel="Übersetzung für {language}: {status}", selectLanguage="{language} auswählen", flagFor="Flagge für {language}", noPreview="Keine Vorschau verfügbar", edit="Bearbeiten", editTranslation="{language} Übersetzung bearbeiten", retranslate="Neu übersetzen", retry="Wiederholen", translate="Übersetzen", status keys, language names
- [ ] **14.5** Open messages/nl.json and add Dutch translations: rowLabel="Vertaling voor {language}: {status}", selectLanguage="{language} selecteren", flagFor="Vlag voor {language}", noPreview="Geen voorbeeld beschikbaar", edit="Bewerken", editTranslation="{language} vertaling bewerken", retranslate="Opnieuw vertalen", retry="Opnieuw proberen", translate="Vertalen", status keys, language names
- [ ] **14.6** Open messages/it.json and add Italian translations: rowLabel="Traduzione per {language}: {status}", selectLanguage="Seleziona {language}", flagFor="Bandiera per {language}", noPreview="Anteprima non disponibile", edit="Modifica", editTranslation="Modifica traduzione {language}", retranslate="Ritradurre", retry="Riprova", translate="Traduci", status keys, language names
- [ ] **14.7** Verify all JSON files have valid syntax

---

## 15. Update TranslationPreviewPanel to Use TranslationStatusItem

**Context:** Replace the placeholder translation row div in TranslationPreviewPanel.tsx (created in REQ-E05-007, task 11.7) with the new TranslationStatusItem component. This integrates the new component into the panel.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [ ] **15.1** Open TranslationPreviewPanel.tsx
- [ ] **15.2** Add import at top: `import { TranslationStatusItem } from './TranslationStatusItem';`
- [ ] **15.3** Locate the translations list map function (task 11.7 from REQ-E05-007)
- [ ] **15.4** Replace the placeholder div with: `<TranslationStatusItem key={trans.language} language={trans.language} status={trans.status} previewText={trans.content?.title || trans.content?.name || trans.content?.description} lastUpdated={trans.translatedAt} onEdit={handleEdit} onRetranslate={handleRetranslate} onRetry={handleRetry} disabled={panelState.isLoading} />`
- [ ] **15.5** Remove the placeholder div and TODO comment
- [ ] **15.6** Save the file

---

## 16. Update Panel Index Export

**Context:** Add TranslationStatusItem to the barrel export file so it can be imported from the parent module. Update the index.ts to export the new component.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Estimated effort:** 1 story point

- [ ] **16.1** Open src/components/TranslationManagement/TranslationPreviewPanel/index.ts
- [ ] **16.2** Locate the commented export placeholder for TranslationStatusItem (added in REQ-E05-007, task 16.5)
- [ ] **16.3** Uncomment or add the export: `export { TranslationStatusItem } from './TranslationStatusItem';`
- [ ] **16.4** Verify exports are in logical order (TranslationPreviewPanel, SourceContentSection, TranslationStatusItem)
- [ ] **16.5** Save the file

---

## 17. Run TypeScript Type Check

**Context:** Verify that all TypeScript types are correct, imports resolve properly, and there are no type errors introduced by the new component.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [ ] **17.1** Run `npx tsc --noEmit` from project root
- [ ] **17.2** Review output for any errors mentioning "TranslationStatusItem"
- [ ] **17.3** If type errors exist, identify the file and line number
- [ ] **17.4** Common issues to check: missing imports, incorrect prop types, invalid JSX syntax, type mismatches in handlers
- [ ] **17.5** Fix any identified type errors
- [ ] **17.6** Re-run `npx tsc --noEmit` after each fix
- [ ] **17.7** Document any pre-existing errors unrelated to this component (acceptable per CLAUDE.md)

---

## 18. Test Component Rendering and Visual States

**Context:** Manually test the component to verify it renders correctly for all translation statuses and visual states. This ensures the component displays properly before integration testing.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **18.1** Create a temporary test page rendering TranslationStatusItem with different status values
- [ ] **18.2** Start dev server: `npm run dev`
- [ ] **18.3** Test 'completed' status: verify green check icon, green background, preview text visible, Edit and Re-translate buttons show
- [ ] **18.4** Test 'pending' status: verify orange clock icon, orange background, no action buttons
- [ ] **18.5** Test 'processing' status: verify blue spinning loader icon, blue background, no action buttons
- [ ] **18.6** Test 'failed' status: verify red alert icon, red background, Edit and Retry buttons show
- [ ] **18.7** Test 'manual' status: verify purple pencil icon, purple background, Edit and Re-translate buttons show
- [ ] **18.8** Test 'stale' status: verify yellow warning icon, yellow background, Edit and Re-translate buttons show
- [ ] **18.9** Test 'missing' status: verify gray circle icon, gray background, "Translate" button shows
- [ ] **18.10** Test with no preview text: verify "No preview available" placeholder shows
- [ ] **18.11** Test with long preview text (>30 chars): verify text is truncated with "..." and full text appears in tooltip on hover
- [ ] **18.12** Test disabled state: verify row is grayed out and buttons are disabled
- [ ] **18.13** Test with checkbox (provide onSelectionChange): verify checkbox appears on left side

---

## 19. Test Interactions and Event Handlers

**Context:** Test all interactive elements to ensure click handlers work correctly and events propagate (or stop propagating) as expected.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **19.1** Test row click: click on empty area of row, verify onPreview callback is called with correct language
- [ ] **19.2** Test Edit button: click Edit button, verify onEdit callback is called and row click does not trigger
- [ ] **19.3** Test Re-translate button: click Re-translate button, verify onRetranslate callback is called and row click does not trigger
- [ ] **19.4** Test Retry button (failed status): click Retry button, verify onRetry callback is called
- [ ] **19.5** Test Translate button (missing status): click Translate button, verify onRetranslate callback is called
- [ ] **19.6** Test checkbox change: click checkbox, verify onSelectionChange callback is called with correct language and checked state
- [ ] **19.7** Verify clicking checkbox does not trigger row click
- [ ] **19.8** Test disabled state: click all interactive elements when disabled=true, verify no callbacks fire
- [ ] **19.9** Test keyboard navigation: tab through elements, verify focus indicators are visible
- [ ] **19.10** Test button hover states: hover over each button, verify background color changes appropriately

---

## 20. Test Accessibility Features

**Context:** Verify that the component meets accessibility requirements: ARIA attributes, keyboard navigation, screen reader compatibility, and color contrast.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **20.1** Use browser DevTools to inspect row element, verify role="listitem" attribute
- [ ] **20.2** Verify aria-label on row includes language name and status
- [ ] **20.3** Verify aria-disabled on row when disabled=true
- [ ] **20.4** Inspect checkbox, verify aria-label describes purpose
- [ ] **20.5** Inspect each button, verify aria-label provides context (includes language name)
- [ ] **20.6** Verify status icon has aria-hidden="true" (visual only)
- [ ] **20.7** Verify screen reader text with sr-only class announces status
- [ ] **20.8** Test with keyboard: tab to row, press Enter, verify onPreview is called
- [ ] **20.9** Tab to Edit button, press Enter, verify onEdit is called
- [ ] **20.10** Tab to checkbox, press Space, verify selection toggles
- [ ] **20.11** Test with screen reader (VoiceOver/NVDA), verify all information is announced clearly
- [ ] **20.12** Check color contrast for all text/icon combinations, verify meets WCAG AA standards (4.5:1 minimum)
- [ ] **20.13** Test in high contrast mode, verify all elements remain visible and distinguishable

---

## 21. Test Dark Mode Support

**Context:** Verify that the component displays correctly in dark mode with appropriate color adjustments for background, text, and borders.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **21.1** Enable dark mode (add 'dark' class to html element or use system preference)
- [ ] **21.2** Verify row background is dark (dark:bg-gray-900)
- [ ] **21.3** Verify text colors are light (dark:text-white for language name, dark:text-gray-300 for preview)
- [ ] **21.4** Verify border is visible in dark mode (dark:border-gray-700)
- [ ] **21.5** Verify hover state has appropriate dark background (dark:hover:bg-gray-800/50)
- [ ] **21.6** Verify status icons remain visible with correct colors in dark mode
- [ ] **21.7** Verify button hover states work in dark mode
- [ ] **21.8** Verify disabled state is distinguishable in dark mode
- [ ] **21.9** Test checkbox visibility and contrast in dark mode
- [ ] **21.10** Verify "No preview" placeholder text is visible in dark mode (dark:text-gray-500)

---

## 22. Test Responsive Behavior

**Context:** Verify the component layout adapts properly to different screen sizes, with text truncation and button visibility working correctly on mobile and desktop.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **22.1** Test on mobile viewport (320px width): verify all sections are visible
- [ ] **22.2** Verify preview text truncates appropriately on narrow screens
- [ ] **22.3** Verify action buttons remain accessible (not cut off)
- [ ] **22.4** Verify checkbox is appropriately sized for touch targets (at least 44x44px clickable area)
- [ ] **22.5** Test on tablet viewport (768px): verify comfortable spacing
- [ ] **22.6** Test on desktop viewport (1024px+): verify row doesn't stretch awkwardly
- [ ] **22.7** Test with very long language names: verify layout doesn't break
- [ ] **22.8** Test flag emoji rendering across different browsers/OS (some may render differently)
- [ ] **22.9** Verify touch interactions work smoothly on mobile devices

---

## 23. Integration Test with TranslationPreviewPanel

**Context:** Test the TranslationStatusItem component within the TranslationPreviewPanel to verify integration is seamless and data flows correctly between parent and child.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **23.1** Open TranslationPreviewPanel with real or mock translation data
- [ ] **23.2** Verify all language rows render using TranslationStatusItem component
- [ ] **23.3** Verify each row displays correct language name and flag
- [ ] **23.4** Verify status icons match the status from API data
- [ ] **23.5** Verify preview text from API displays correctly in each row
- [ ] **23.6** Click Edit button on a row: verify TranslationEditor opens (when implemented)
- [ ] **23.7** Click Re-translate on a row: verify re-translate API is called
- [ ] **23.8** Verify rows update when API data changes (e.g., status changes from pending to completed)
- [ ] **23.9** Verify disabled state is applied to all rows when panel is loading
- [ ] **23.10** Test scrolling through multiple language rows: verify performance is smooth

---

## 24. Document Component Usage

**Context:** Add comprehensive JSDoc comments and usage examples to help future developers understand how to use the component correctly.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Estimated effort:** 1 story point

- [ ] **24.1** At the top of the file, add a comprehensive usage example in JSDoc showing typical props
- [ ] **24.2** Include example showing all required props: language, status, onEdit, onRetranslate
- [ ] **24.3** Include example showing optional props: previewText, isSelected, onSelectionChange, disabled
- [ ] **24.4** Add code example showing how to handle callbacks in parent component
- [ ] **24.5** Document the relationship between status and visible action buttons
- [ ] **24.6** Add example showing bulk selection pattern with checkbox
- [ ] **24.7** Add notes about accessibility features (ARIA labels, keyboard support)
- [ ] **24.8** Add notes about when to use disabled state (e.g., during API operations)

---

## Summary

This task creates the TranslationStatusItem component, a reusable row component for displaying individual language translation status. The component provides:

**Core Functionality:**
- Visual representation of translation status with color-coded icons
- Flag emoji and localized language name display
- Preview text truncation with tooltip for full content
- Conditional action buttons based on status (Edit, Re-translate, Retry, Translate)
- Optional checkbox for bulk selection operations
- Row click for preview navigation

**Visual Design:**
- Status-specific color coding: green (completed), orange (pending/stale), red (failed), purple (manual), gray (missing), blue (processing)
- Animated spinner for processing state
- Hover effects for interactive states
- Dark mode support with appropriate color adjustments

**Accessibility:**
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus indicators on interactive elements
- Screen reader announcements for status changes
- WCAG AA color contrast compliance

**Key Files Created:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` - Main component (~350-400 lines)
- Translation keys in all 6 locale files (en, fr, es, de, nl, it)

**Critical Dependencies:**
- REQ-E05-006 (TranslationManagement types) - provides type definitions
- REQ-E05-007 (TranslationPreviewPanel) - parent component that renders this item
- next-intl framework - provides translation hooks
- Lucide React - provides icons
- Tailwind CSS - provides styling

**Blocks:**
- TranslationProgressBar integration (Task 2.4) - uses same status data
- TranslationEditor integration (Task 2.5) - triggered by Edit button
- Full TranslationPreviewPanel functionality - requires this component for complete display
- Translation management page (Task 4.3) - may reuse this component in table views

**Future Enhancements** (out of scope):
- Drag-and-drop reordering support
- Inline editing without modal
- Status change animations/transitions
- Batch action progress indicators

---

*Document generated: 2026-01-22 22:46*
