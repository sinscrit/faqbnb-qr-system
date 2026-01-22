# REQ-E05-022: Create ManualEditWarningDialog Component - Detailed Task Breakdown

**Created**: 2026-01-22 23:46
**Status**: PENDING
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 5 - Manual Edit Preservation
**Task**: 5.1 - Create ManualEditWarningDialog component
**Size**: M (6-8 hours)

---

## Reference Documents

- **Overview**: `/docs/REQ-E05-022-create-manualeditwarningdialog-component-overview.md`
- **Requirements**: `/docs/gen_requests_epic5.md` (lines 3455-3650)
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

# Lint
npm run lint
```

---

## Overview

Create a warning dialog component that protects property owners from accidentally losing manually edited translations when updating source content. The dialog displays affected languages and provides two clear options: (1) Keep manual edits - preserve translations and mark them as stale, or (2) Re-translate all - overwrite manual edits with fresh machine translations. The component follows the existing ConfirmDeleteDialog pattern but uses amber/yellow warning colors instead of red error colors.

**Key Requirements:**
- Modal dialog following ConfirmDeleteDialog pattern (not Radix Dialog)
- Amber/yellow warning theme (not red error theme)
- Lists affected languages with manual translations
- Three buttons: Keep Manual (blue, primary), Re-translate All (red, destructive), Cancel (gray, neutral)
- Vertical button stacking for better mobile experience
- Full keyboard navigation and accessibility
- Internationalization for 6 languages: en, es, fr, de, it, nl
- Loading states for async operations
- Conditional rendering based on isOpen and language list

---

## Task Breakdown

### Task 1: Create component directory structure
**Estimated effort**: 0.1 hours

- [ ] **1.1** Create directory `/src/components/TranslationManagement/` if it doesn't already exist
- [ ] **1.2** Create subdirectory `/src/components/TranslationManagement/ManualEditWarning/`
- [ ] **1.3** Verify directory structure follows project conventions
- [ ] **1.4** Create placeholder files to confirm directory creation

---

### Task 2: Create ManualEditWarningDialog component file with basic structure
**Estimated effort**: 0.5 hours

- [ ] **2.1** Create file `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`
- [ ] **2.2** Add 'use client' directive at the top of the file
- [ ] **2.3** Add JSDoc file header comment with component description
- [ ] **2.4** Include creation date: 2026-01-22
- [ ] **2.5** Reference REQ-E05-022 and overview document in JSDoc
- [ ] **2.6** Add example usage in JSDoc comment
- [ ] **2.7** Import React if needed for types
- [ ] **2.8** Set up basic component export skeleton

---

### Task 3: Import required dependencies
**Estimated effort**: 0.2 hours

- [ ] **3.1** Import `AlertTriangle`, `Loader2`, `Languages` icons from 'lucide-react'
- [ ] **3.2** Import `useTranslations` from 'next-intl'
- [ ] **3.3** Import `cn` utility from '@/lib/utils'
- [ ] **3.4** Verify all imports resolve correctly with `npm run typecheck`
- [ ] **3.5** Add any additional React imports if needed (useState, useCallback, etc.)

---

### Task 4: Define TypeScript types and constants
**Estimated effort**: 0.5 hours

- [ ] **4.1** Define `ManualEditWarningDialogProps` interface with all required props
- [ ] **4.2** Add `isOpen: boolean` prop
- [ ] **4.3** Add `manuallyEditedLanguages: string[]` prop
- [ ] **4.4** Add `onKeepManual: () => void` callback prop
- [ ] **4.5** Add `onOverwrite: () => void` callback prop
- [ ] **4.6** Add `onCancel: () => void` callback prop
- [ ] **4.7** Add `loading?: boolean` optional prop (note: may be changed to union type later)
- [ ] **4.8** Add `entityType?: 'item' | 'article'` optional prop
- [ ] **4.9** Add `className?: string` optional prop
- [ ] **4.10** Add JSDoc comments to all props explaining their purpose
- [ ] **4.11** Define `LANGUAGE_DISPLAY_NAMES` constant mapping language codes to display names
- [ ] **4.12** Add mappings: es=Spanish, fr=French, de=German, it=Italian, nl=Dutch
- [ ] **4.13** Define `MAX_VISIBLE_LANGUAGES` constant with value 6
- [ ] **4.14** Export `ManualEditWarningDialogProps` interface
- [ ] **4.15** Run `npm run typecheck` to verify types are correct

---

### Task 5: Implement component function signature and conditional rendering
**Estimated effort**: 0.3 hours

- [ ] **5.1** Create function component with destructured props
- [ ] **5.2** Set default values: `loading = false`, `entityType = 'item'`
- [ ] **5.3** Initialize `useTranslations('translation.manualEditWarning')` hook as `t`
- [ ] **5.4** Add conditional return: if `!isOpen`, return null
- [ ] **5.5** Add conditional return: if `manuallyEditedLanguages.length === 0`, return null
- [ ] **5.6** Verify both conditions must be met for dialog to render
- [ ] **5.7** Add comment explaining conditional rendering logic

---

### Task 6: Implement keyboard event handler
**Estimated effort**: 0.2 hours

- [ ] **6.1** Create `handleKeyDown` function accepting `React.KeyboardEvent`
- [ ] **6.2** Check if key is 'Escape'
- [ ] **6.3** Check if NOT loading (don't close during loading)
- [ ] **6.4** Call `e.preventDefault()` to prevent default behavior
- [ ] **6.5** Call `onCancel()` callback
- [ ] **6.6** Test Escape key functionality manually

---

### Task 7: Implement backdrop click handler
**Estimated effort**: 0.2 hours

- [ ] **7.1** Create `handleBackdropClick` function accepting `React.MouseEvent`
- [ ] **7.2** Check if `e.target === e.currentTarget` (clicked backdrop, not inner content)
- [ ] **7.3** Check if NOT loading (don't close during loading)
- [ ] **7.4** Call `onCancel()` callback
- [ ] **7.5** Test backdrop click functionality manually

---

### Task 8: Create dialog backdrop and container structure
**Estimated effort**: 0.5 hours

- [ ] **8.1** Create outer div with fixed positioning: `fixed inset-0`
- [ ] **8.2** Add backdrop styling: `bg-black bg-opacity-50`
- [ ] **8.3** Add centering: `flex items-center justify-center`
- [ ] **8.4** Add z-index: `z-50` to appear above other content
- [ ] **8.5** Attach `onClick={handleBackdropClick}` handler
- [ ] **8.6** Attach `onKeyDown={handleKeyDown}` handler
- [ ] **8.7** Add ARIA attribute: `role="alertdialog"`
- [ ] **8.8** Add ARIA attribute: `aria-modal="true"`
- [ ] **8.9** Add ARIA attribute: `aria-labelledby="manual-edit-warning-title"`
- [ ] **8.10** Add ARIA attribute: `aria-describedby="manual-edit-warning-description"`
- [ ] **8.11** Create inner div for dialog content with white background
- [ ] **8.12** Add border radius: `rounded-lg`
- [ ] **8.13** Add shadow: `shadow-xl`
- [ ] **8.14** Add max width: `max-w-md w-full mx-4`
- [ ] **8.15** Add entrance animation: `animate-in fade-in zoom-in-95 duration-200`
- [ ] **8.16** Apply `cn()` utility with className prop for customization
- [ ] **8.17** Attach `onClick={(e) => e.stopPropagation()}` to inner div to prevent backdrop click

---

### Task 9: Implement dialog header with warning icon
**Estimated effort**: 0.5 hours

- [ ] **9.1** Create header div with flex layout: `flex items-start gap-4`
- [ ] **9.2** Add padding: `p-6 pb-4`
- [ ] **9.3** Create icon container div with fixed width: `w-12 h-12`
- [ ] **9.4** Add flex centering to icon container: `flex items-center justify-center`
- [ ] **9.5** Add circular shape: `rounded-full`
- [ ] **9.6** Add AMBER background: `bg-amber-100` (NOT red)
- [ ] **9.7** Add AlertTriangle icon with size: `w-6 h-6`
- [ ] **9.8** Add AMBER color to icon: `text-amber-600` (NOT red)
- [ ] **9.9** Add `aria-hidden="true"` to icon (decorative only)
- [ ] **9.10** Create text container with flex: `flex-1`
- [ ] **9.11** Create h3 heading with id: `id="manual-edit-warning-title"`
- [ ] **9.12** Add heading styling: `text-lg font-semibold text-gray-900`
- [ ] **9.13** Add title text: `{t('title')}`
- [ ] **9.14** Create description paragraph with id: `id="manual-edit-warning-description"`
- [ ] **9.15** Add description styling: `mt-2 text-sm text-gray-600`
- [ ] **9.16** Add description text: `{t('description')}`
- [ ] **9.17** Verify amber/yellow color scheme (not red)

---

### Task 10: Implement language list display section
**Estimated effort**: 1 hour

- [ ] **10.1** Create container div for language list with padding: `px-6 pb-4`
- [ ] **10.2** Create label div with margin: `mb-2`
- [ ] **10.3** Add label text: `{t('affectedLanguages')}` with styling `text-sm font-medium text-gray-700`
- [ ] **10.4** Create scrollable container with AMBER background: `bg-amber-50` (matches warning theme)
- [ ] **10.5** Add AMBER border: `border border-amber-200`
- [ ] **10.6** Add border radius: `rounded-lg`
- [ ] **10.7** Add padding: `p-4`
- [ ] **10.8** Add max height and scroll: `max-h-48 overflow-y-auto`
- [ ] **10.9** Create unordered list with spacing: `space-y-2`
- [ ] **10.10** Add ARIA label to list: `aria-label={t('languageListLabel')}`
- [ ] **10.11** Map over `manuallyEditedLanguages` array
- [ ] **10.12** Create list item for each language with key: `key={lang}`
- [ ] **10.13** Add flex layout to list item: `flex items-center gap-2`
- [ ] **10.14** Add text styling: `text-sm text-gray-700`
- [ ] **10.15** Add Languages icon with size: `w-4 h-4`
- [ ] **10.16** Add AMBER color to icon: `text-amber-600`
- [ ] **10.17** Add flex-shrink to icon: `flex-shrink-0`
- [ ] **10.18** Add `aria-hidden="true"` to icon
- [ ] **10.19** Display language name using mapping: `LANGUAGE_DISPLAY_NAMES[lang]`
- [ ] **10.20** Add fallback for unmapped languages: `|| lang.toUpperCase()`
- [ ] **10.21** Add font weight to language name: `font-medium`
- [ ] **10.22** Test with 1 language, 5 languages, and 10+ languages to verify scroll

---

### Task 11: Implement options description cards
**Estimated effort**: 0.5 hours

- [ ] **11.1** Create container div for options with padding: `px-6 pb-4`
- [ ] **11.2** Add vertical spacing: `space-y-3`
- [ ] **11.3** Create first card for "Keep Manual" option
- [ ] **11.4** Add BLUE border and background: `border-blue-200 bg-blue-50` (safe option)
- [ ] **11.5** Add border radius and padding: `rounded-lg p-3`
- [ ] **11.6** Create h4 heading with styling: `text-sm font-semibold text-blue-900 mb-1`
- [ ] **11.7** Add option title: `{t('keepManualOption')}`
- [ ] **11.8** Create description paragraph with styling: `text-xs text-blue-700`
- [ ] **11.9** Add description text: `{t('keepManualDescription')}`
- [ ] **11.10** Create second card for "Re-translate" option
- [ ] **11.11** Add RED border and background: `border-red-200 bg-red-50` (destructive option)
- [ ] **11.12** Add border radius and padding: `rounded-lg p-3`
- [ ] **11.13** Create h4 heading with styling: `text-sm font-semibold text-red-900 mb-1`
- [ ] **11.14** Add option title: `{t('retranslateOption')}`
- [ ] **11.15** Create description paragraph with styling: `text-xs text-red-700`
- [ ] **11.16** Add warning text: `{t('retranslateWarning')}`

---

### Task 12: Implement action buttons with vertical layout
**Estimated effort**: 1.5 hours

- [ ] **12.1** Create container div for buttons with vertical layout: `flex flex-col gap-3`
- [ ] **12.2** Add padding: `p-6 pt-4`
- [ ] **12.3** Add top border separator: `border-t border-gray-100`
- [ ] **12.4** Create first button: "Keep Manual Edits" (PRIMARY ACTION)
- [ ] **12.5** Set button type: `type="button"`
- [ ] **12.6** Attach onClick handler: `onClick={onKeepManual}`
- [ ] **12.7** Add disabled state: `disabled={loading}`
- [ ] **12.8** Add full width: `w-full`
- [ ] **12.9** Add padding: `px-4 py-2.5`
- [ ] **12.10** Add text styling: `text-sm font-medium`
- [ ] **12.11** Add border radius: `rounded-lg`
- [ ] **12.12** Add BLUE background: `bg-blue-600 text-white` (primary action)
- [ ] **12.13** Add hover state: `hover:bg-blue-700`
- [ ] **12.14** Add active state: `active:bg-blue-800`
- [ ] **12.15** Add transition: `transition-colors duration-150`
- [ ] **12.16** Add focus styles: `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`
- [ ] **12.17** Add disabled styles: `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] **12.18** Add flex layout for icon and text: `inline-flex items-center justify-center gap-2`
- [ ] **12.19** Add conditional rendering: if loading, show Loader2 icon with spin animation
- [ ] **12.20** Add loading text: `{t('processing')}`
- [ ] **12.21** If not loading, show Languages icon with size `w-4 h-4` and `aria-hidden="true"`
- [ ] **12.22** Add button text: `{t('keepManualOption')}`
- [ ] **12.23** Create second button: "Re-translate All" (DESTRUCTIVE ACTION)
- [ ] **12.24** Use same structure as first button
- [ ] **12.25** Attach onClick handler: `onClick={onOverwrite}`
- [ ] **12.26** Add RED background: `bg-red-600 text-white` (destructive action)
- [ ] **12.27** Add hover state: `hover:bg-red-700`
- [ ] **12.28** Add active state: `active:bg-red-800`
- [ ] **12.29** Add focus styles: `focus-visible:ring-red-500`
- [ ] **12.30** Add conditional rendering: if loading, show Loader2 icon with spin animation
- [ ] **12.31** If not loading, show AlertTriangle icon instead of Languages
- [ ] **12.32** Add button text: `{t('retranslateOption')}`
- [ ] **12.33** Create third button: "Cancel" (NEUTRAL ACTION)
- [ ] **12.34** Use same structure as other buttons
- [ ] **12.35** Attach onClick handler: `onClick={onCancel}`
- [ ] **12.36** Add GRAY background: `bg-gray-100 text-gray-700` (neutral action)
- [ ] **12.37** Add hover state: `hover:bg-gray-200`
- [ ] **12.38** Add active state: `active:bg-gray-300`
- [ ] **12.39** Add focus styles: `focus-visible:ring-gray-500`
- [ ] **12.40** Add button text: `{t('cancel')}` (no icon, no loading state)
- [ ] **12.41** Verify vertical stacking order: Keep Manual (top), Re-translate (middle), Cancel (bottom)
- [ ] **12.42** Verify all buttons are full width for consistent appearance
- [ ] **12.43** Apply `cn()` utility to all button className attributes

---

### Task 13: Add English translation keys to messages/en.json
**Estimated effort**: 0.5 hours

- [ ] **13.1** Open file `/messages/en.json`
- [ ] **13.2** Locate or create `translation` namespace (verify it's singular, not plural)
- [ ] **13.3** Create `manualEditWarning` object under `translation`
- [ ] **13.4** Add key `"title": "Manual Translations Affected"`
- [ ] **13.5** Add key `"description": "You have manually edited translations in the following languages. Updating the source content will affect these translations."`
- [ ] **13.6** Add key `"affectedLanguages": "Affected languages:"`
- [ ] **13.7** Add key `"languageListLabel": "List of languages with manual translations"`
- [ ] **13.8** Add key `"keepManualOption": "Keep manual edits"`
- [ ] **13.9** Add key `"keepManualDescription": "Update source content only. Manual translations will be marked as potentially stale."`
- [ ] **13.10** Add key `"retranslateOption": "Re-translate all"`
- [ ] **13.11** Add key `"retranslateWarning": "This will overwrite your manual edits permanently."`
- [ ] **13.12** Add key `"cancel": "Cancel"`
- [ ] **13.13** Add key `"processing": "Processing..."`
- [ ] **13.14** Create `languages` object under `manualEditWarning`
- [ ] **13.15** Add key `"es": "Spanish"`
- [ ] **13.16** Add key `"fr": "French"`
- [ ] **13.17** Add key `"de": "German"`
- [ ] **13.18** Add key `"it": "Italian"`
- [ ] **13.19** Add key `"nl": "Dutch"`
- [ ] **13.20** Verify JSON syntax is valid (no missing commas, quotes, or brackets)
- [ ] **13.21** Run `npm run build` to verify no JSON parsing errors

---

### Task 14: Add Spanish translation keys to messages/es.json
**Estimated effort**: 0.3 hours

- [ ] **14.1** Open file `/messages/es.json`
- [ ] **14.2** Locate or create `translation.manualEditWarning` namespace
- [ ] **14.3** Add key `"title": "Traducciones manuales afectadas"`
- [ ] **14.4** Add key `"description": "Has editado manualmente traducciones en los siguientes idiomas. Actualizar el contenido original afectará estas traducciones."`
- [ ] **14.5** Add key `"affectedLanguages": "Idiomas afectados:"`
- [ ] **14.6** Add key `"languageListLabel": "Lista de idiomas con traducciones manuales"`
- [ ] **14.7** Add key `"keepManualOption": "Mantener ediciones manuales"`
- [ ] **14.8** Add key `"keepManualDescription": "Actualizar solo el contenido original. Las traducciones manuales se marcarán como potencialmente desactualizadas."`
- [ ] **14.9** Add key `"retranslateOption": "Retraducir todo"`
- [ ] **14.10** Add key `"retranslateWarning": "Esto sobrescribirá permanentemente tus ediciones manuales."`
- [ ] **14.11** Add key `"cancel": "Cancelar"`
- [ ] **14.12** Add key `"processing": "Procesando..."`
- [ ] **14.13** Add language names: es=Español, fr=Francés, de=Alemán, it=Italiano, nl=Neerlandés
- [ ] **14.14** Verify JSON syntax is valid

---

### Task 15: Add French translation keys to messages/fr.json
**Estimated effort**: 0.3 hours

- [ ] **15.1** Open file `/messages/fr.json`
- [ ] **15.2** Locate or create `translation.manualEditWarning` namespace
- [ ] **15.3** Add key `"title": "Traductions manuelles affectées"`
- [ ] **15.4** Add key `"description": "Vous avez modifié manuellement les traductions dans les langues suivantes. La mise à jour du contenu source affectera ces traductions."`
- [ ] **15.5** Add key `"affectedLanguages": "Langues affectées :"`
- [ ] **15.6** Add key `"languageListLabel": "Liste des langues avec traductions manuelles"`
- [ ] **15.7** Add key `"keepManualOption": "Conserver les modifications manuelles"`
- [ ] **15.8** Add key `"keepManualDescription": "Mettre à jour uniquement le contenu source. Les traductions manuelles seront marquées comme potentiellement obsolètes."`
- [ ] **15.9** Add key `"retranslateOption": "Tout retraduire"`
- [ ] **15.10** Add key `"retranslateWarning": "Cela écrasera définitivement vos modifications manuelles."`
- [ ] **15.11** Add key `"cancel": "Annuler"`
- [ ] **15.12** Add key `"processing": "Traitement..."`
- [ ] **15.13** Add language names: es=Espagnol, fr=Français, de=Allemand, it=Italien, nl=Néerlandais
- [ ] **15.14** Verify JSON syntax is valid

---

### Task 16: Add German translation keys to messages/de.json
**Estimated effort**: 0.3 hours

- [ ] **16.1** Open file `/messages/de.json`
- [ ] **16.2** Locate or create `translation.manualEditWarning` namespace
- [ ] **16.3** Add key `"title": "Manuelle Übersetzungen betroffen"`
- [ ] **16.4** Add key `"description": "Sie haben Übersetzungen in den folgenden Sprachen manuell bearbeitet. Die Aktualisierung des Quellinhalts wird diese Übersetzungen beeinflussen."`
- [ ] **16.5** Add key `"affectedLanguages": "Betroffene Sprachen:"`
- [ ] **16.6** Add key `"languageListLabel": "Liste der Sprachen mit manuellen Übersetzungen"`
- [ ] **16.7** Add key `"keepManualOption": "Manuelle Bearbeitungen behalten"`
- [ ] **16.8** Add key `"keepManualDescription": "Nur den Quellinhalt aktualisieren. Manuelle Übersetzungen werden als möglicherweise veraltet markiert."`
- [ ] **16.9** Add key `"retranslateOption": "Alles neu übersetzen"`
- [ ] **16.10** Add key `"retranslateWarning": "Dies überschreibt Ihre manuellen Bearbeitungen dauerhaft."`
- [ ] **16.11** Add key `"cancel": "Abbrechen"`
- [ ] **16.12** Add key `"processing": "Verarbeitung..."`
- [ ] **16.13** Add language names: es=Spanisch, fr=Französisch, de=Deutsch, it=Italienisch, nl=Niederländisch
- [ ] **16.14** Verify JSON syntax is valid and umlaut characters are properly encoded

---

### Task 17: Add Italian translation keys to messages/it.json
**Estimated effort**: 0.3 hours

- [ ] **17.1** Open file `/messages/it.json`
- [ ] **17.2** Locate or create `translation.manualEditWarning` namespace
- [ ] **17.3** Add key `"title": "Traduzioni manuali interessate"`
- [ ] **17.4** Add key `"description": "Hai modificato manualmente le traduzioni nelle seguenti lingue. L'aggiornamento del contenuto sorgente influenzerà queste traduzioni."`
- [ ] **17.5** Add key `"affectedLanguages": "Lingue interessate:"`
- [ ] **17.6** Add key `"languageListLabel": "Elenco delle lingue con traduzioni manuali"`
- [ ] **17.7** Add key `"keepManualOption": "Mantieni modifiche manuali"`
- [ ] **17.8** Add key `"keepManualDescription": "Aggiorna solo il contenuto sorgente. Le traduzioni manuali saranno contrassegnate come potenzialmente obsolete."`
- [ ] **17.9** Add key `"retranslateOption": "Ritraduci tutto"`
- [ ] **17.10** Add key `"retranslateWarning": "Questo sovrascriverà permanentemente le tue modifiche manuali."`
- [ ] **17.11** Add key `"cancel": "Annulla"`
- [ ] **17.12** Add key `"processing": "Elaborazione..."`
- [ ] **17.13** Add language names: es=Spagnolo, fr=Francese, de=Tedesco, it=Italiano, nl=Olandese
- [ ] **17.14** Verify JSON syntax is valid

---

### Task 18: Add Dutch translation keys to messages/nl.json
**Estimated effort**: 0.3 hours

- [ ] **18.1** Open file `/messages/nl.json`
- [ ] **18.2** Locate or create `translation.manualEditWarning` namespace
- [ ] **18.3** Add key `"title": "Handmatige vertalingen beïnvloed"`
- [ ] **18.4** Add key `"description": "Je hebt vertalingen in de volgende talen handmatig bewerkt. Het bijwerken van de broninhoud zal deze vertalingen beïnvloeden."`
- [ ] **18.5** Add key `"affectedLanguages": "Beïnvloede talen:"`
- [ ] **18.6** Add key `"languageListLabel": "Lijst van talen met handmatige vertalingen"`
- [ ] **18.7** Add key `"keepManualOption": "Handmatige bewerkingen behouden"`
- [ ] **18.8** Add key `"keepManualDescription": "Alleen de broninhoud bijwerken. Handmatige vertalingen worden gemarkeerd als mogelijk verouderd."`
- [ ] **18.9** Add key `"retranslateOption": "Alles opnieuw vertalen"`
- [ ] **18.10** Add key `"retranslateWarning": "Dit overschrijft je handmatige bewerkingen permanent."`
- [ ] **18.11** Add key `"cancel": "Annuleren"`
- [ ] **18.12** Add key `"processing": "Verwerken..."`
- [ ] **18.13** Add language names: es=Spaans, fr=Frans, de=Duits, it=Italiaans, nl=Nederlands
- [ ] **18.14** Verify JSON syntax is valid

---

### Task 19: Create barrel export index.ts file
**Estimated effort**: 0.1 hours

- [ ] **19.1** Create file `/src/components/TranslationManagement/ManualEditWarning/index.ts`
- [ ] **19.2** Add JSDoc header comment describing the module
- [ ] **19.3** Reference REQ-E05-022 in JSDoc
- [ ] **19.4** Add creation date: 2026-01-22
- [ ] **19.5** Export component: `export { ManualEditWarningDialog } from './ManualEditWarningDialog';`
- [ ] **19.6** Export type: `export type { ManualEditWarningDialogProps } from './ManualEditWarningDialog';`
- [ ] **19.7** Verify exports work by attempting import in a test file or build

---

### Task 20: Verify TypeScript compilation
**Estimated effort**: 0.2 hours

- [ ] **20.1** Run `npm run typecheck` from project root
- [ ] **20.2** Verify zero TypeScript errors in ManualEditWarningDialog.tsx
- [ ] **20.3** Verify zero TypeScript errors in index.ts
- [ ] **20.4** Fix any type errors related to props interface
- [ ] **20.5** Fix any type errors related to imports
- [ ] **20.6** Fix any type errors related to event handlers
- [ ] **20.7** Verify no `any` types are used (strict mode compliance)
- [ ] **20.8** Run `npm run typecheck` again and confirm zero errors

---

### Task 21: Test dialog rendering and conditional logic
**Estimated effort**: 0.5 hours

- [ ] **21.1** Start development server with `npm run dev`
- [ ] **21.2** Create a test page that imports and renders ManualEditWarningDialog
- [ ] **21.3** Test with `isOpen={false}` - verify dialog does NOT render
- [ ] **21.4** Test with `isOpen={true}` and `manuallyEditedLanguages={[]}` - verify dialog does NOT render
- [ ] **21.5** Test with `isOpen={true}` and `manuallyEditedLanguages={['fr']}` - verify dialog DOES render
- [ ] **21.6** Verify backdrop appears (semi-transparent black overlay)
- [ ] **21.7** Verify dialog appears centered with white background
- [ ] **21.8** Verify entrance animation plays (fade-in and zoom-in)
- [ ] **21.9** Verify no console errors during rendering

---

### Task 22: Test visual styling and warning theme
**Estimated effort**: 0.3 hours

- [ ] **22.1** Verify warning icon has AMBER background (bg-amber-100), not red
- [ ] **22.2** Verify warning icon is AMBER colored (text-amber-600), not red
- [ ] **22.3** Verify language list container has AMBER background (bg-amber-50)
- [ ] **22.4** Verify language list has AMBER border (border-amber-200)
- [ ] **22.5** Verify language icons are AMBER colored (text-amber-600)
- [ ] **22.6** Verify "Keep Manual" card has BLUE background (bg-blue-50)
- [ ] **22.7** Verify "Re-translate" card has RED background (bg-red-50)
- [ ] **22.8** Verify "Keep Manual" button has BLUE background (bg-blue-600)
- [ ] **22.9** Verify "Re-translate" button has RED background (bg-red-600)
- [ ] **22.10** Verify "Cancel" button has GRAY background (bg-gray-100)
- [ ] **22.11** Compare with ConfirmDeleteDialog to ensure consistent structure but different colors

---

### Task 23: Test language list display
**Estimated effort**: 0.5 hours

- [ ] **23.1** Test with single language: `['fr']` - verify displays "French"
- [ ] **23.2** Test with all 5 target languages: `['es', 'fr', 'de', 'it', 'nl']` - verify all display correctly
- [ ] **23.3** Test with unknown language: `['pt']` - verify displays "PT" as fallback
- [ ] **23.4** Test with 10 languages to verify scroll appears (max-h-48 overflow-y-auto)
- [ ] **23.5** Verify Languages icon appears next to each language name
- [ ] **23.6** Verify language names use correct mapping (Spanish, French, German, Italian, Dutch)
- [ ] **23.7** Verify list has proper spacing between items

---

### Task 24: Test button interactions and callbacks
**Estimated effort**: 0.5 hours

- [ ] **24.1** Test "Keep Manual" button click calls `onKeepManual` callback
- [ ] **24.2** Test "Re-translate All" button click calls `onOverwrite` callback
- [ ] **24.3** Test "Cancel" button click calls `onCancel` callback
- [ ] **24.4** Verify buttons are clickable and responsive
- [ ] **24.5** Verify button hover states work (color changes on hover)
- [ ] **24.6** Verify button active states work (color changes on click)
- [ ] **24.7** Test multiple rapid clicks - verify callbacks fire correctly

---

### Task 25: Test loading states
**Estimated effort**: 0.5 hours

- [ ] **25.1** Test with `loading={true}` - verify all buttons are disabled
- [ ] **25.2** Verify "Keep Manual" button shows Loader2 spinner when loading
- [ ] **25.3** Verify "Re-translate" button shows Loader2 spinner when loading
- [ ] **25.4** Verify spinner has spin animation (animate-spin class)
- [ ] **25.5** Verify loading text displays: "Processing..."
- [ ] **25.6** Verify button clicks do nothing when disabled
- [ ] **25.7** Test with `loading={false}` - verify buttons are enabled again
- [ ] **25.8** Verify icons (Languages, AlertTriangle) display when not loading

---

### Task 26: Test keyboard navigation
**Estimated effort**: 0.5 hours

- [ ] **26.1** Open dialog and press Escape key - verify `onCancel` is called
- [ ] **26.2** Set `loading={true}` and press Escape - verify nothing happens (Escape disabled during loading)
- [ ] **26.3** Press Tab key repeatedly - verify focus cycles through three buttons
- [ ] **26.4** Verify focus order: Keep Manual → Re-translate → Cancel → (back to Keep Manual)
- [ ] **26.5** Verify focus-visible ring appears on focused button
- [ ] **26.6** Press Enter on focused "Keep Manual" button - verify `onKeepManual` is called
- [ ] **26.7** Press Enter on focused "Re-translate" button - verify `onOverwrite` is called
- [ ] **26.8** Press Enter on focused "Cancel" button - verify `onCancel` is called

---

### Task 27: Test backdrop behavior
**Estimated effort**: 0.3 hours

- [ ] **27.1** Click on backdrop (outside dialog) - verify `onCancel` is called
- [ ] **27.2** Click inside dialog content - verify dialog stays open
- [ ] **27.3** Set `loading={true}` and click backdrop - verify nothing happens (backdrop disabled during loading)
- [ ] **27.4** Verify backdrop has semi-transparent appearance (bg-opacity-50)
- [ ] **27.5** Verify clicking rapidly on backdrop doesn't cause issues

---

### Task 28: Test accessibility with ARIA attributes
**Estimated effort**: 0.5 hours

- [ ] **28.1** Inspect dialog in browser DevTools - verify `role="alertdialog"`
- [ ] **28.2** Verify `aria-modal="true"` is present
- [ ] **28.3** Verify title has `id="manual-edit-warning-title"`
- [ ] **28.4** Verify `aria-labelledby` matches title id
- [ ] **28.5** Verify description has `id="manual-edit-warning-description"`
- [ ] **28.6** Verify `aria-describedby` matches description id
- [ ] **28.7** Test with screen reader (VoiceOver on macOS or NVDA on Windows) if available
- [ ] **28.8** Verify screen reader announces "Alert dialog"
- [ ] **28.9** Verify screen reader reads title and description
- [ ] **28.10** Verify screen reader announces button labels correctly
- [ ] **28.11** Verify icons have `aria-hidden="true"` (decorative only)

---

### Task 29: Test internationalization for all languages
**Estimated effort**: 0.5 hours

- [ ] **29.1** Set locale to English (en) - verify all text displays in English
- [ ] **29.2** Verify title: "Manual Translations Affected"
- [ ] **29.3** Verify button labels: "Keep manual edits", "Re-translate all", "Cancel"
- [ ] **29.4** Set locale to Spanish (es) - verify all text displays in Spanish
- [ ] **29.5** Verify title: "Traducciones manuales afectadas"
- [ ] **29.6** Set locale to French (fr) - verify all text displays in French
- [ ] **29.7** Verify title: "Traductions manuelles affectées"
- [ ] **29.8** Set locale to German (de) - verify all text displays in German
- [ ] **29.9** Verify title: "Manuelle Übersetzungen betroffen"
- [ ] **29.10** Set locale to Italian (it) - verify all text displays in Italian
- [ ] **29.11** Verify title: "Traduzioni manuali interessate"
- [ ] **29.12** Set locale to Dutch (nl) - verify all text displays in Dutch
- [ ] **29.13** Verify title: "Handmatige vertalingen beïnvloed"
- [ ] **29.14** Verify no missing translation keys in any locale

---

### Task 30: Test responsive design and mobile layout
**Estimated effort**: 0.3 hours

- [ ] **30.1** Open browser DevTools responsive mode
- [ ] **30.2** Set viewport to iPhone SE (375px width)
- [ ] **30.3** Verify dialog is not cut off on small screen
- [ ] **30.4** Verify buttons stack vertically (flex-col)
- [ ] **30.5** Verify button text doesn't wrap awkwardly
- [ ] **30.6** Verify touch targets are at least 44px tall (py-2.5 should provide this)
- [ ] **30.7** Set viewport to iPad (768px width)
- [ ] **30.8** Verify dialog appearance is appropriate for tablet
- [ ] **30.9** Set viewport to desktop (1440px width)
- [ ] **30.10** Verify dialog doesn't appear too large (max-w-md constraint)
- [ ] **30.11** Test on actual mobile device if available

---

### Task 31: Test edge cases and error scenarios
**Estimated effort**: 0.3 hours

- [ ] **31.1** Test with empty `manuallyEditedLanguages={[]}` - verify no render
- [ ] **31.2** Test with single language - verify singular language display
- [ ] **31.3** Test with very long language list (15+ languages) - verify scroll works
- [ ] **31.4** Test with invalid language code (not in mapping) - verify uppercase fallback
- [ ] **31.5** Test rapid open/close cycles - verify no memory leaks or performance issues
- [ ] **31.6** Test with `entityType='article'` - verify dialog works (prop currently unused but accepted)
- [ ] **31.7** Test with custom className prop - verify additional classes are applied
- [ ] **31.8** Test with all callbacks as undefined - verify no crashes (though not recommended usage)

---

### Task 32: Perform production build test
**Estimated effort**: 0.2 hours

- [ ] **32.1** Run `npm run build` from project root
- [ ] **32.2** Verify build completes successfully without errors
- [ ] **32.3** Verify no build warnings related to ManualEditWarningDialog component
- [ ] **32.4** Verify no build warnings related to translation files
- [ ] **32.5** Check build output for bundle size impact
- [ ] **32.6** Start production server with `npm start`
- [ ] **32.7** Test dialog functionality in production mode
- [ ] **32.8** Verify no console errors in production build

---

### Task 33: Code quality and linting verification
**Estimated effort**: 0.2 hours

- [ ] **33.1** Run `npm run lint` from project root
- [ ] **33.2** Fix any ESLint warnings or errors in ManualEditWarningDialog.tsx
- [ ] **33.3** Fix any ESLint warnings or errors in index.ts
- [ ] **33.4** Verify no unused imports
- [ ] **33.5** Verify no unused variables
- [ ] **33.6** Verify consistent code formatting
- [ ] **33.7** Run `npm run lint` again and confirm zero warnings/errors

---

### Task 34: Final documentation and cleanup
**Estimated effort**: 0.2 hours

- [ ] **34.1** Review JSDoc comments for completeness
- [ ] **34.2** Verify all props are documented with clear descriptions
- [ ] **34.3** Verify example usage in JSDoc is accurate
- [ ] **34.4** Remove any debugging code or console.log statements
- [ ] **34.5** Remove any commented-out code
- [ ] **34.6** Verify file header includes correct date and references
- [ ] **34.7** Verify barrel export (index.ts) has proper documentation
- [ ] **34.8** Create a brief summary of testing results
- [ ] **34.9** Document any known limitations or edge cases
- [ ] **34.10** Mark task as complete when all verification passes

---

## Completion Checklist

- [ ] Component file created: `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`
- [ ] Barrel export created: `/src/components/TranslationManagement/ManualEditWarning/index.ts`
- [ ] All TypeScript types defined: `ManualEditWarningDialogProps`, `LANGUAGE_DISPLAY_NAMES`
- [ ] Component uses amber/yellow warning theme (NOT red error theme)
- [ ] Buttons use vertical stacking layout (flex-col)
- [ ] Button order: Keep Manual (blue, top), Re-translate (red, middle), Cancel (gray, bottom)
- [ ] Conditional rendering checks both `isOpen` and `manuallyEditedLanguages.length`
- [ ] Language list displays with scrolling for 6+ languages
- [ ] All three buttons have correct callbacks and styling
- [ ] Loading states disable all interactions (buttons, backdrop, Escape)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Backdrop click closes dialog (when not loading)
- [ ] ARIA attributes correct: role, aria-modal, aria-labelledby, aria-describedby
- [ ] Translation keys added to `/messages/en.json`
- [ ] Translation keys added to `/messages/es.json`
- [ ] Translation keys added to `/messages/fr.json`
- [ ] Translation keys added to `/messages/de.json`
- [ ] Translation keys added to `/messages/it.json`
- [ ] Translation keys added to `/messages/nl.json`
- [ ] All 6 locales tested and display correctly
- [ ] TypeScript compilation passes (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] No console errors or warnings
- [ ] Component follows ConfirmDeleteDialog pattern
- [ ] Responsive design tested on mobile, tablet, desktop
- [ ] Accessibility tested with screen reader (if available)
- [ ] Documentation complete with JSDoc comments
- [ ] All edge cases tested (empty list, unknown languages, etc.)

---

**Document Last Modified**: 2026-01-22 23:46

---

**END OF DOCUMENT**
