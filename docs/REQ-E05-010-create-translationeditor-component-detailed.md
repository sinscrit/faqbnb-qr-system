# Create TranslationEditor Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:53
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #10)
- Overview: docs/REQ-E05-010-create-translationeditor-component-overview.md
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

## 1. Create Component Directory and File Structure

**Context:** Following the established pattern for Epic 5 components and the structure used in PropertyEditModal.tsx (src/components/ItemManager/components/PropertyEditModal.tsx), create a new directory for the TranslationEditor component. This component will be a modal dialog for editing translation content with side-by-side original and translation fields.

**Files to modify:**
- Create: `src/components/TranslationManagement/TranslationEditor/` (new directory)
- Create: `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- Create: `src/components/TranslationManagement/TranslationEditor/index.ts`

**Estimated effort:** 1 story point

- [ ] **1.1** Create the TranslationEditor directory: `mkdir -p src/components/TranslationManagement/TranslationEditor`
- [ ] **1.2** Create the main component file: `touch src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- [ ] **1.3** Create the barrel export file: `touch src/components/TranslationManagement/TranslationEditor/index.ts`
- [ ] **1.4** Verify files were created: `ls -la src/components/TranslationManagement/TranslationEditor/`
- [ ] **1.5** Confirm directory structure matches plan: should contain TranslationEditor.tsx and index.ts

---

## 2. Set Up Main Component File Header and Imports

**Context:** Following the pattern from PropertyEditModal.tsx (lines 1-35), create a comprehensive file header with JSDoc module documentation and import all necessary dependencies including Radix Dialog components, React hooks, i18n, icons, and utilities.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Open TranslationEditor.tsx and add `'use client';` directive at the top
- [ ] **2.2** Add JSDoc module header comment describing the component: "TranslationEditor Component - Modal dialog for editing translation content with side-by-side layout showing original source alongside editable translation fields."
- [ ] **2.3** Add JSDoc tags: `@module TranslationManagement/TranslationEditor`, `@see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`, `@created 2026-01-22`, `@requestReference REQ-E05-010`
- [ ] **2.4** Import React hooks: `import { useState, useCallback, useEffect } from 'react';`
- [ ] **2.5** Import next-intl: `import { useTranslations } from 'next-intl';`
- [ ] **2.6** Import Radix Dialog components: `import * as Dialog from '@radix-ui/react-dialog';`
- [ ] **2.7** Import Lucide icons: `import { X, Loader2, Save, AlertTriangle } from 'lucide-react';`
- [ ] **2.8** Import utility function: `import { cn } from '@/lib/utils';`
- [ ] **2.9** Import types: `import type { SupportedLanguage } from '@/components/TranslationManagement/TranslationManagement.types';`

---

## 3. Define Component Props and State Interfaces

**Context:** Create TypeScript interfaces for component props and internal state management. Based on overview lines 68-111, define the data structures needed for the editor including fields for source content, translation content, and editor state.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Add section comment: `// =============================================================================` followed by `// Type Definitions` followed by `// =============================================================================`
- [ ] **3.2** Define TranslationFieldContent interface: `interface TranslationFieldContent { fieldName: string; fieldLabel: string; value: string; maxLength?: number; }`
- [ ] **3.3** Add JSDoc for TranslationFieldContent: "Represents a single translatable field with its configuration and value."
- [ ] **3.4** Define TranslationEditorProps interface: `interface TranslationEditorProps { isOpen: boolean; onClose: () => void; entityId: string; entityType: 'item' | 'article' | 'link' | 'tag'; language: SupportedLanguage; sourceContent: TranslationFieldContent[]; initialTranslation: TranslationFieldContent[]; onSave: (content: TranslationFieldContent[]) => Promise<void>; isLoading?: boolean; className?: string; }`
- [ ] **3.5** Add JSDoc for TranslationEditorProps explaining key props: isOpen (controls modal visibility), sourceContent (original content for reference), initialTranslation (starting translation values), onSave (callback with edited content)
- [ ] **3.6** Define EditorState interface: `interface EditorState { fields: TranslationFieldContent[]; isDirty: boolean; isSubmitting: boolean; error: string | null; }`
- [ ] **3.7** Add JSDoc for EditorState: "Internal state for tracking field values, dirty state, and save status."

---

## 4. Create CharacterCounter Subcomponent

**Context:** Build a reusable character counter component with color-coded warnings based on character count thresholds. Following the pattern from TextEditorStep.tsx (lines 146-195), implement the visual feedback system for character limits.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Add section comment: `// =============================================================================` followed by `// CharacterCounter Subcomponent` followed by `// =============================================================================`
- [ ] **4.2** Define CharacterCounterProps interface: `interface CharacterCounterProps { current: number; max: number; warningThreshold?: number; }`
- [ ] **4.3** Create CharacterCounter function component: `function CharacterCounter({ current, max, warningThreshold = 0.8 }: CharacterCounterProps) {`
- [ ] **4.4** Initialize translation hook: `const t = useTranslations('translation.editor');`
- [ ] **4.5** Calculate thresholds: `const warningPoint = max * warningThreshold;`, `const isNearLimit = current >= warningPoint && current < max;`, `const isAtLimit = current === max;`, `const isOverLimit = current > max;`
- [ ] **4.6** Return JSX with conditional styling: `<div className="flex items-center justify-between text-xs mt-1"> <span className={cn('tabular-nums', isOverLimit && 'text-red-600 font-medium', isAtLimit && 'text-green-600 font-medium', isNearLimit && 'text-amber-600 font-medium', !isNearLimit && !isAtLimit && !isOverLimit && 'text-gray-500')} aria-live="polite"> {current}/{max} </span> {isAtLimit && <span className="text-green-600">✓</span>} {(isNearLimit || isOverLimit) && <span className={cn(isOverLimit ? 'text-red-600' : 'text-amber-600')}>⚠</span>} </div>`
- [ ] **4.7** Close component function
- [ ] **4.8** Add JSDoc comment above component explaining color-coded states: gray (<80%), amber (80-99%), green (at limit), red (over limit)

---

## 5. Create TranslationFieldPair Subcomponent

**Context:** Build a subcomponent that displays a single translatable field with original content on the left and editable translation on the right. This component handles textarea rendering, auto-resize, and character counting.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Add section comment: `// =============================================================================` followed by `// TranslationFieldPair Subcomponent` followed by `// =============================================================================`
- [ ] **5.2** Define TranslationFieldPairProps interface: `interface TranslationFieldPairProps { field: TranslationFieldContent; originalValue: string; translationValue: string; onChange: (value: string) => void; disabled?: boolean; className?: string; }`
- [ ] **5.3** Create TranslationFieldPair function component: `function TranslationFieldPair({ field, originalValue, translationValue, onChange, disabled = false, className }: TranslationFieldPairProps) {`
- [ ] **5.4** Initialize translation hook: `const t = useTranslations('translation.editor');`
- [ ] **5.5** Return JSX with grid layout: `<div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}> ... </div>`
- [ ] **5.6** Add original field section (left): `<div className="space-y-2"> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300"> {t('original')} - {field.fieldLabel} </label> <textarea value={originalValue} readOnly disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none min-h-[80px]" rows={3} /> </div>`
- [ ] **5.7** Add translation field section (right): `<div className="space-y-2"> <label htmlFor={`translation-${field.fieldName}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300"> {t('translation')} - {field.fieldLabel} </label> <textarea id={`translation-${field.fieldName}`} value={translationValue} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[80px]" rows={3} maxLength={field.maxLength} /> {field.maxLength && <CharacterCounter current={translationValue.length} max={field.maxLength} />} </div>`
- [ ] **5.8** Close component function

---

## 6. Implement Main Component Structure and State Management

**Context:** Create the main TranslationEditor component function with props destructuring, state initialization, and dirty state tracking logic. Following the pattern from PropertyEditModal.tsx (lines 181-250) and InstructionEditor.tsx (lines 105-159).

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Add section comment: `// =============================================================================` followed by `// Main Component` followed by `// =============================================================================`
- [ ] **6.2** Export main component function: `export function TranslationEditor(props: TranslationEditorProps) {`
- [ ] **6.3** Destructure props: `const { isOpen, onClose, entityId, entityType, language, sourceContent, initialTranslation, onSave, isLoading = false, className } = props;`
- [ ] **6.4** Initialize translation hook: `const t = useTranslations('translation.editor');`
- [ ] **6.5** Initialize editor state: `const [editorState, setEditorState] = useState<EditorState>({ fields: initialTranslation, isDirty: false, isSubmitting: false, error: null });`
- [ ] **6.6** Create effect to reset state when modal opens: `useEffect(() => { if (isOpen) { setEditorState({ fields: initialTranslation, isDirty: false, isSubmitting: false, error: null }); } }, [isOpen, initialTranslation]);`
- [ ] **6.7** Create isDirty check function: `const checkIsDirty = useCallback((currentFields: TranslationFieldContent[]) => { return currentFields.some((field, index) => field.value !== initialTranslation[index]?.value); }, [initialTranslation]);`

---

## 7. Implement Field Change Handler

**Context:** Create the handler function that updates field values and recalculates the dirty state when users edit translation fields.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Add section comment: `// Event Handlers`
- [ ] **7.2** Create handleFieldChange function: `const handleFieldChange = useCallback((fieldName: string, value: string) => { setEditorState((prev) => { const updatedFields = prev.fields.map((field) => field.fieldName === fieldName ? { ...field, value } : field ); return { ...prev, fields: updatedFields, isDirty: checkIsDirty(updatedFields), error: null }; }); }, [checkIsDirty]);`
- [ ] **7.3** Add JSDoc comment explaining: "Updates a specific field value and recalculates dirty state."

---

## 8. Implement Save Handler

**Context:** Create the save handler that calls the parent's onSave callback, handles loading states, and manages errors. Following the pattern from PropertyEditModal.tsx (lines 398-445).

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Create handleSave function: `const handleSave = useCallback(async () => { if (!editorState.isDirty || editorState.isSubmitting) return; setEditorState((prev) => ({ ...prev, isSubmitting: true, error: null })); try { await onSave(editorState.fields); onClose(); } catch (err) { setEditorState((prev) => ({ ...prev, isSubmitting: false, error: err instanceof Error ? err.message : t('saveFailed') })); } }, [editorState.isDirty, editorState.isSubmitting, editorState.fields, onSave, onClose, t]);`
- [ ] **8.2** Add JSDoc comment: "Saves translation changes by calling parent callback. Handles loading and error states."

---

## 9. Implement Close Handler with Unsaved Changes Prompt

**Context:** Create the close handler that prompts users to confirm when closing with unsaved changes. Following the pattern from InstructionEditor.tsx (lines 147-159) using window.confirm.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **9.1** Create handleClose function: `const handleClose = useCallback(() => { if (editorState.isDirty) { const confirmClose = window.confirm(t('unsavedChangesPrompt')); if (!confirmClose) return; } onClose(); }, [editorState.isDirty, onClose, t]);`
- [ ] **9.2** Add JSDoc comment: "Closes the modal with confirmation prompt if there are unsaved changes."

---

## 10. Implement Dialog Container with Overlay

**Context:** Create the Radix Dialog structure with overlay backdrop and proper ARIA attributes. Following the pattern from PropertyEditModal.tsx (lines 492-535).

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Add return statement with Dialog.Root: `return ( <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}> ... </Dialog.Root> );`
- [ ] **10.2** Add Dialog.Portal: `<Dialog.Portal> ... </Dialog.Portal>`
- [ ] **10.3** Add Dialog.Overlay: `<Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />`
- [ ] **10.4** Add Dialog.Content container: `<Dialog.Content className={cn('fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]', 'w-full max-w-4xl max-h-[90vh] overflow-hidden', 'bg-white dark:bg-gray-900 rounded-lg shadow-xl', 'data-[state=open]:animate-in data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', 'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', 'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]', 'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]', className)}> ... </Dialog.Content>`
- [ ] **10.5** Close Dialog.Portal and Dialog.Root

---

## 11. Implement Dialog Header with Title and Close Button

**Context:** Add the header section with entity information, language flag, and close button. Following the PropertyEditModal header pattern (lines 536-565).

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** Inside Dialog.Content, add header: `<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">`
- [ ] **11.2** Add title section: `<div className="flex flex-col"> <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white"> {t('editTranslation')} </Dialog.Title> <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mt-1"> {t('editingFor')} {language.toUpperCase()} </Dialog.Description> </div>`
- [ ] **11.3** Add close button: `<Dialog.Close asChild> <button onClick={handleClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label={t('close')} > <X className="h-5 w-5 text-gray-500" /> </button> </Dialog.Close>`
- [ ] **11.4** Close header div

---

## 12. Implement Scrollable Content Area with Field Pairs

**Context:** Create the main scrollable content area that renders all TranslationFieldPair components. This section displays original and translation fields side-by-side.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** After header, add content area: `<div className="overflow-y-auto px-6 py-4 space-y-6 max-h-[calc(90vh-200px)]">`
- [ ] **12.2** Add error message display (conditional): `{editorState.error && ( <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"> <div className="flex items-start"> <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" /> <div className="flex-1"> <h4 className="text-sm font-medium text-red-800 dark:text-red-200">{t('saveError')}</h4> <p className="text-sm text-red-700 dark:text-red-300 mt-1">{editorState.error}</p> </div> </div> </div> )}`
- [ ] **12.3** Map over fields to render TranslationFieldPair components: `{editorState.fields.map((field, index) => { const originalField = sourceContent.find((f) => f.fieldName === field.fieldName); return ( <TranslationFieldPair key={field.fieldName} field={field} originalValue={originalField?.value || ''} translationValue={field.value} onChange={(value) => handleFieldChange(field.fieldName, value)} disabled={editorState.isSubmitting || isLoading} /> ); })}`
- [ ] **12.4** Close content area div

---

## 13. Implement Dialog Footer with Action Buttons

**Context:** Add the footer section with Cancel and Save buttons. Save button should be disabled when not dirty or submitting, and show loading spinner during save.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **13.1** After content area, add footer: `<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">`
- [ ] **13.2** Add Cancel button: `<button onClick={handleClose} disabled={editorState.isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" > {t('cancel')} </button>`
- [ ] **13.3** Add Save button: `<button onClick={handleSave} disabled={!editorState.isDirty || editorState.isSubmitting || isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" > {(editorState.isSubmitting || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />} <Save className="h-4 w-4" /> {(editorState.isSubmitting || isLoading) ? t('saving') : t('save')} </button>`
- [ ] **13.4** Close footer div
- [ ] **13.5** Close Dialog.Content, Dialog.Portal, and Dialog.Root
- [ ] **13.6** Close component function

---

## 14. Add Translation Keys to English Locale

**Context:** Define all i18n translation keys needed for the component UI in messages/en.json. Following the pattern from existing translation namespaces.

**Files to modify:**
- `messages/en.json`

**Estimated effort:** 1 story point

- [ ] **14.1** Open messages/en.json
- [ ] **14.2** Locate or create "translation" root object
- [ ] **14.3** Add "editor" namespace under "translation"
- [ ] **14.4** Add key "editTranslation" with value "Edit Translation"
- [ ] **14.5** Add key "editingFor" with value "Editing translation for"
- [ ] **14.6** Add key "original" with value "Original"
- [ ] **14.7** Add key "translation" with value "Translation"
- [ ] **14.8** Add key "cancel" with value "Cancel"
- [ ] **14.9** Add key "save" with value "Save"
- [ ] **14.10** Add key "saving" with value "Saving..."
- [ ] **14.11** Add key "saveError" with value "Error Saving Translation"
- [ ] **14.12** Add key "saveFailed" with value "Failed to save translation. Please try again."
- [ ] **14.13** Add key "unsavedChangesPrompt" with value "You have unsaved changes. Are you sure you want to close?"
- [ ] **14.14** Add key "close" with value "Close"
- [ ] **14.15** Verify JSON syntax is valid

---

## 15. Add Translation Keys to Other Locale Files

**Context:** Add the same translation keys to all other supported language locale files with appropriate translations.

**Files to modify:**
- `messages/fr.json`
- `messages/es.json`
- `messages/de.json`
- `messages/nl.json`
- `messages/it.json`

**Estimated effort:** 1 story point

- [ ] **15.1** Open messages/fr.json and add "translation.editor" keys in French: editTranslation="Modifier la traduction", editingFor="Modification de la traduction pour", original="Original", translation="Traduction", cancel="Annuler", save="Enregistrer", saving="Enregistrement...", saveError="Erreur d'enregistrement de la traduction", saveFailed="Échec de l'enregistrement de la traduction. Veuillez réessayer.", unsavedChangesPrompt="Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir fermer ?", close="Fermer"
- [ ] **15.2** Open messages/es.json and add Spanish translations: editTranslation="Editar traducción", editingFor="Editando traducción para", original="Original", translation="Traducción", cancel="Cancelar", save="Guardar", saving="Guardando...", saveError="Error al guardar la traducción", saveFailed="Error al guardar la traducción. Inténtalo de nuevo.", unsavedChangesPrompt="Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar?", close="Cerrar"
- [ ] **15.3** Open messages/de.json and add German translations: editTranslation="Übersetzung bearbeiten", editingFor="Übersetzung bearbeiten für", original="Original", translation="Übersetzung", cancel="Abbrechen", save="Speichern", saving="Speichern...", saveError="Fehler beim Speichern der Übersetzung", saveFailed="Fehler beim Speichern der Übersetzung. Bitte versuchen Sie es erneut.", unsavedChangesPrompt="Sie haben nicht gespeicherte Änderungen. Möchten Sie wirklich schließen?", close="Schließen"
- [ ] **15.4** Open messages/nl.json and add Dutch translations: editTranslation="Vertaling bewerken", editingFor="Vertaling bewerken voor", original="Origineel", translation="Vertaling", cancel="Annuleren", save="Opslaan", saving="Opslaan...", saveError="Fout bij opslaan vertaling", saveFailed="Kan vertaling niet opslaan. Probeer het opnieuw.", unsavedChangesPrompt="Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt sluiten?", close="Sluiten"
- [ ] **15.5** Open messages/it.json and add Italian translations: editTranslation="Modifica traduzione", editingFor="Modifica traduzione per", original="Originale", translation="Traduzione", cancel="Annulla", save="Salva", saving="Salvataggio...", saveError="Errore nel salvataggio della traduzione", saveFailed="Impossibile salvare la traduzione. Riprova.", unsavedChangesPrompt="Hai modifiche non salvate. Sei sicuro di voler chiudere?", close="Chiudi"
- [ ] **15.6** Verify all JSON files have valid syntax

---

## 16. Create Barrel Export File

**Context:** Create the index.ts file that exports the editor component for clean imports from other modules.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/index.ts`

**Estimated effort:** 1 story point

- [ ] **16.1** Open src/components/TranslationManagement/TranslationEditor/index.ts
- [ ] **16.2** Add JSDoc comment: "TranslationEditor Module Exports"
- [ ] **16.3** Add export for main component: `export { TranslationEditor } from './TranslationEditor';`
- [ ] **16.4** Add type export: `export type { TranslationEditorProps } from './TranslationEditor';`

---

## 17. Update Main TranslationManagement Index Export

**Context:** Add the TranslationEditor component to the main TranslationManagement module exports to make it available for import throughout the application.

**Files to modify:**
- `src/components/TranslationManagement/index.ts`

**Estimated effort:** 1 story point

- [ ] **17.1** Open src/components/TranslationManagement/index.ts
- [ ] **17.2** Locate the component exports section
- [ ] **17.3** Add export statement: `export { TranslationEditor } from './TranslationEditor';`
- [ ] **17.4** Add type export: `export type { TranslationEditorProps } from './TranslationEditor';`
- [ ] **17.5** Verify exports don't conflict with existing exports
- [ ] **17.6** Save the file

---

## 18. Run TypeScript Type Check

**Context:** Verify that all TypeScript types are correct, imports resolve properly, and there are no type errors introduced by the new component.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [ ] **18.1** Run `npx tsc --noEmit` from project root
- [ ] **18.2** Review output for any errors mentioning "TranslationEditor"
- [ ] **18.3** If type errors exist, identify the file and line number
- [ ] **18.4** Common issues to check: missing imports, incorrect prop types, Radix Dialog type mismatches, callback type signatures
- [ ] **18.5** Fix any identified type errors
- [ ] **18.6** Re-run `npx tsc --noEmit` after each fix
- [ ] **18.7** Document any pre-existing errors unrelated to this component (acceptable per CLAUDE.md)

---

## 19. Test Component Rendering and Layout

**Context:** Manually test the component to verify the modal opens correctly, displays fields properly, and has the correct side-by-side layout.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **19.1** Create a temporary test page rendering TranslationEditor with mock data
- [ ] **19.2** Start dev server: `npm run dev`
- [ ] **19.3** Verify modal opens when isOpen=true with smooth animation
- [ ] **19.4** Verify overlay backdrop appears with semi-transparent black
- [ ] **19.5** Verify modal is centered on screen
- [ ] **19.6** Verify header displays with correct title and language code
- [ ] **19.7** Verify close button (X icon) appears in top-right corner
- [ ] **19.8** Verify side-by-side layout: original fields on left, translation fields on right
- [ ] **19.9** Test with multiple fields (title, description, instructions): verify all render correctly
- [ ] **19.10** Verify original fields are read-only with gray background
- [ ] **19.11** Verify translation fields are editable with white background
- [ ] **19.12** Test on mobile viewport: verify layout stacks vertically (original above translation)
- [ ] **19.13** Test on tablet/desktop: verify side-by-side layout (grid-cols-2)

---

## 20. Test Character Counter Functionality

**Context:** Verify that character counters display correctly with proper color-coding based on character count thresholds.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **20.1** Open editor with fields that have maxLength defined
- [ ] **20.2** Type a few characters: verify counter shows gray color (e.g., "5/100")
- [ ] **20.3** Type until ~85% of limit: verify counter turns amber with warning icon (e.g., "85/100 ⚠")
- [ ] **20.4** Type until exactly at limit: verify counter turns green with checkmark (e.g., "100/100 ✓")
- [ ] **20.5** Try to type more characters: verify maxLength attribute prevents typing beyond limit
- [ ] **20.6** Test with field without maxLength: verify no character counter appears
- [ ] **20.7** Verify counter uses tabular-nums class for proper alignment
- [ ] **20.8** Verify aria-live="polite" announces count changes to screen readers
- [ ] **20.9** Test counter in dark mode: verify colors remain visible and readable

---

## 21. Test Dirty State Tracking and Save Button

**Context:** Verify that the component correctly tracks whether fields have been modified and enables/disables the Save button accordingly.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **21.1** Open editor with initial translation values
- [ ] **21.2** Verify Save button is disabled initially (no changes)
- [ ] **21.3** Edit a translation field: verify Save button becomes enabled
- [ ] **21.4** Revert the edit back to original value: verify Save button becomes disabled again
- [ ] **21.5** Edit multiple fields: verify Save button remains enabled
- [ ] **21.6** Clear a field that had content: verify Save button is enabled (counts as change)
- [ ] **21.7** Verify isDirty state is recalculated on every keystroke
- [ ] **21.8** Verify Save button shows correct label ("Save" vs "Saving...")
- [ ] **21.9** Verify Save button is disabled during save operation (isSubmitting)

---

## 22. Test Save Operation and Error Handling

**Context:** Test the save functionality including success cases, loading states, and error handling.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **22.1** Make changes to translation fields and click Save
- [ ] **22.2** Verify onSave callback is called with updated field values
- [ ] **22.3** Verify Save button shows spinner and "Saving..." text during operation
- [ ] **22.4** Verify all fields become disabled during save (disabled prop)
- [ ] **22.5** On successful save: verify modal closes automatically
- [ ] **22.6** Simulate save error (reject promise in onSave): verify error message displays
- [ ] **22.7** Verify error message appears in red banner at top of content area
- [ ] **22.8** Verify error message includes AlertTriangle icon
- [ ] **22.9** Verify fields remain editable after error (not closed)
- [ ] **22.10** Verify user can retry save after fixing the issue
- [ ] **22.11** Verify error clears when user makes new edits

---

## 23. Test Unsaved Changes Prompt

**Context:** Verify that closing the modal with unsaved changes prompts the user for confirmation using window.confirm.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **23.1** Open editor and make changes to a field
- [ ] **23.2** Click the X close button: verify window.confirm prompt appears
- [ ] **23.3** Verify prompt message matches "unsavedChangesPrompt" translation key
- [ ] **23.4** Click Cancel on prompt: verify modal stays open with edits preserved
- [ ] **23.5** Click OK on prompt: verify modal closes and edits are discarded
- [ ] **23.6** Test clicking overlay backdrop with unsaved changes: verify same confirmation prompt
- [ ] **23.7** Test pressing ESC key with unsaved changes: verify same confirmation prompt
- [ ] **23.8** Open editor, make no changes, click close: verify no prompt (closes immediately)
- [ ] **23.9** Open editor, make changes, save successfully: verify modal closes without prompt

---

## 24. Test Keyboard Accessibility and Focus Management

**Context:** Verify that the component meets accessibility requirements including focus management, keyboard navigation, and ARIA attributes.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **24.1** Open modal: verify focus automatically moves to first translation textarea
- [ ] **24.2** Press TAB: verify focus moves through fields in logical order (title → description → instructions → buttons)
- [ ] **24.3** Verify focus stays trapped within modal (doesn't move to background content)
- [ ] **24.4** Press SHIFT+TAB: verify reverse tab order works correctly
- [ ] **24.5** Press ESC key: verify modal closes (with confirmation if dirty)
- [ ] **24.6** Test with screen reader: verify Dialog.Title is announced as modal title
- [ ] **24.7** Verify Dialog.Description provides context about language being edited
- [ ] **24.8** Verify all buttons have accessible labels (text or aria-label)
- [ ] **24.9** Verify textareas have associated labels (htmlFor matching id)
- [ ] **24.10** Verify character counters have aria-live for dynamic updates
- [ ] **24.11** Verify close button has aria-label explaining its purpose
- [ ] **24.12** Check color contrast for all text meets WCAG AA standards

---

## 25. Test Responsive Behavior and Dark Mode

**Context:** Verify the component displays correctly across different screen sizes and in dark mode.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **25.1** Test on mobile viewport (320px): verify modal is full-width with padding
- [ ] **25.2** Verify field pairs stack vertically on mobile (original above translation)
- [ ] **25.3** Verify modal is scrollable on small screens without content being cut off
- [ ] **25.4** Test on tablet viewport (768px): verify side-by-side layout activates (md:grid-cols-2)
- [ ] **25.5** Test on desktop viewport (1024px+): verify modal max-width is 4xl (896px)
- [ ] **25.6** Verify modal doesn't exceed 90vh height with max-h-[90vh]
- [ ] **25.7** Enable dark mode: verify modal background is dark (dark:bg-gray-900)
- [ ] **25.8** Verify text colors invert appropriately for dark mode
- [ ] **25.9** Verify borders are visible in dark mode (dark:border-gray-700)
- [ ] **25.10** Verify textareas have correct dark mode styling (dark:bg-gray-900)
- [ ] **25.11** Verify buttons have proper dark mode hover states
- [ ] **25.12** Verify character counters remain legible in dark mode

---

## 26. Integration Test with TranslationStatusItem

**Context:** Test triggering the TranslationEditor from TranslationStatusItem's Edit button to verify the integration flow works correctly.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **26.1** Open TranslationPreviewPanel with translations
- [ ] **26.2** Click Edit button on a TranslationStatusItem row
- [ ] **26.3** Verify TranslationEditor opens with correct language
- [ ] **26.4** Verify source content matches the original entity content
- [ ] **26.5** Verify initial translation values match current translation data
- [ ] **26.6** Edit translation fields and click Save
- [ ] **26.7** Verify onSave callback updates translation via API
- [ ] **26.8** Verify TranslationPreviewPanel refreshes to show updated translation
- [ ] **26.9** Verify status changes to 'manual' after editing (if tracked)
- [ ] **26.10** Test editing multiple languages in sequence: verify each opens with correct data

---

## 27. Performance and Edge Case Testing

**Context:** Test edge cases, unusual inputs, and performance to ensure the component handles all scenarios gracefully.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **27.1** Test with empty source content: verify read-only fields show empty
- [ ] **27.2** Test with empty initial translation: verify editable fields start empty
- [ ] **27.3** Test with very long content (2000+ chars): verify textareas remain responsive
- [ ] **27.4** Test rapid typing: verify character counter updates smoothly
- [ ] **27.5** Test with fields that have no maxLength: verify they work without character counter
- [ ] **27.6** Test with single field only (e.g., just title): verify layout works correctly
- [ ] **27.7** Test opening/closing modal rapidly: verify no memory leaks or stuck states
- [ ] **27.8** Test with special characters (emoji, accents, unicode): verify they display correctly
- [ ] **27.9** Test copy/paste large content: verify it works within maxLength constraints
- [ ] **27.10** Verify component unmounts cleanly when modal closes (no lingering effects)

---

## 28. Document Component Usage

**Context:** Add comprehensive JSDoc comments and usage examples to help future developers understand how to use the component correctly.

**Files to modify:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`

**Estimated effort:** 1 story point

- [ ] **28.1** At the top of the file, add a comprehensive usage example in JSDoc showing typical integration
- [ ] **28.2** Include example showing how to construct sourceContent array from entity data
- [ ] **28.3** Include example showing how to construct initialTranslation array from translation data
- [ ] **28.4** Add code example showing onSave callback implementation with API call
- [ ] **28.5** Document the field structure expected in TranslationFieldContent
- [ ] **28.6** Add notes about dirty state tracking and unsaved changes confirmation
- [ ] **28.7** Add notes about character limits and how they're enforced
- [ ] **28.8** Document accessibility features (focus trap, keyboard navigation, ARIA)
- [ ] **28.9** Add example showing integration with TranslationStatusItem Edit button

---

## Summary

This task creates the TranslationEditor component, a modal dialog for editing translation content with side-by-side comparison. The component provides:

**Core Functionality:**
- Radix Dialog modal with overlay and animations
- Side-by-side layout: original (left) vs translation (right)
- Auto-resizing textareas for multiple fields (title, description, instructions)
- Character counters with color-coded warnings (gray, amber, green, red)
- Dirty state tracking with unsaved changes confirmation
- Save operation with loading states and error handling

**Visual Design:**
- Responsive layout: stacks vertically on mobile, side-by-side on desktop
- Color-coded character limits matching threshold rules
- Loading spinner during save operations
- Error messages with AlertTriangle icon
- Dark mode support with appropriate color adjustments

**Accessibility:**
- ARIA Dialog role with title and description
- Focus trap within modal
- Keyboard navigation (Tab, Shift+Tab, ESC)
- Screen reader announcements for character count changes
- Accessible labels for all form fields

**Key Files Created:**
- `src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` - Main component (~600-700 lines including subcomponents)
- `src/components/TranslationManagement/TranslationEditor/index.ts` - Barrel exports
- Translation keys in all 6 locale files (en, fr, es, de, nl, it)

**Critical Dependencies:**
- REQ-E05-006 (TranslationManagement types) - provides type definitions
- REQ-E05-008 (TranslationStatusItem) - triggers this editor via Edit button
- REQ-E05-002 (Update Translation API) - called by onSave callback
- Radix Dialog - provides modal foundation
- next-intl - provides translation hooks

**Blocks:**
- Full TranslationPreviewPanel integration - Edit button needs this component
- TranslationStatusWidget integration - may use similar editing flow
- Manual translation workflow completion - this is the editing interface

**Future Enhancements** (out of scope):
- Diff highlighting between original and translation
- Scroll sync between original and translation textareas
- Auto-save draft feature
- Translation suggestions from AI
- Inline validation rules (beyond character count)

---

*Document generated: 2026-01-22 22:53*
