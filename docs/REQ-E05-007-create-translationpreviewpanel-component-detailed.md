# Create TranslationPreviewPanel Component - Detailed Implementation Tasks

**Generated:** 2026-01-22 22:41
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #7)
- Overview: docs/REQ-E05-007-create-translationpreviewpanel-component-overview.md
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

## 1. Create Component File Structure

**Context:** Following the established pattern from AssetPanel (src/components/ItemManager/components/AssetPanel/) and the architecture defined in the Implementation Plan (lines 89-151), create the directory structure for TranslationPreviewPanel with separate files for the main panel, source content display, and barrel exports. The TranslationStatusItem and TranslationProgressBar components will be created in separate tasks (REQ-E05-008 and Task 2.4).

**Files to modify:**
- Create: `src/components/TranslationManagement/TranslationPreviewPanel/` (new directory)
- Create: `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- Create: `src/components/TranslationManagement/TranslationPreviewPanel/SourceContentSection.tsx`
- Create: `src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Estimated effort:** 1 story point

- [x] **1.1** Create the TranslationPreviewPanel directory: `mkdir -p src/components/TranslationManagement/TranslationPreviewPanel`
- [x] **1.2** Create the main component file: `touch src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- [x] **1.3** Create the source content section file: `touch src/components/TranslationManagement/TranslationPreviewPanel/SourceContentSection.tsx`
- [x] **1.4** Create the barrel export file: `touch src/components/TranslationManagement/TranslationPreviewPanel/index.ts`
- [x] **1.5** Verify all files were created: `ls -la src/components/TranslationManagement/TranslationPreviewPanel/`
- [x] **1.6** Confirm directory structure matches plan: should contain TranslationPreviewPanel.tsx, SourceContentSection.tsx, and index.ts

---

## 2. Set Up Main Component File Header and Imports

**Context:** Following the pattern from AssetPanel.tsx (lines 1-21), create a comprehensive file header with JSDoc module documentation, request reference, and import all necessary dependencies. The component needs React hooks, next-intl for translations, Lucide icons, utility functions, and type definitions from the TranslationManagement.types.ts file created in REQ-E05-006.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **2.1** Open TranslationPreviewPanel.tsx and add the `'use client';` directive at the top (required for Next.js client components)
- [x] **2.2** Add JSDoc module comment block with description: "A slide-in drawer component for previewing and managing translations. Displays source content and translation status for all supported languages with action buttons."
- [x] **2.3** Add JSDoc tags: `@module TranslationManagement/TranslationPreviewPanel`, `@see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`, `@created 2026-01-22`, `@requestReference REQ-E05-007`
- [x] **2.4** Import React hooks: `import { useCallback, useEffect, useRef, useState } from 'react';`
- [x] **2.5** Import next-intl: `import { useTranslations } from 'next-intl';`
- [x] **2.6** Import Lucide icons: `import { X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';`
- [x] **2.7** Import utility function: `import { cn } from '@/lib/utils';`
- [x] **2.8** Import types from TranslationManagement.types.ts: `import type { TranslationPreviewPanelProps, SupportedLanguage, TranslationFieldContent } from '@/components/TranslationManagement/TranslationManagement.types';`
- [x] **2.9** Add import placeholders for subcomponents (commented out until they exist): `// import { SourceContentSection } from './SourceContentSection';`, `// import { TranslationStatusItem } from './TranslationStatusItem';`, `// import { TranslationProgressBar } from './TranslationProgressBar';`

---

## 3. Define Component Constants and Helper Types

**Context:** Define the supported languages constant and any internal helper types needed for component state. According to the Implementation Plan (line 347) and overview document (lines 751-757), the component supports 5 languages (French, Spanish, German, Dutch, Italian). English is the source language and not displayed in the translations list.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **3.1** Define supported languages constant after imports: `const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];`
- [x] **3.2** Add JSDoc comment above constant: "Supported target languages for translation. English (en) is the source language and not included."
- [x] **3.3** Define internal translation status type: `type TranslationStatusData = { language: SupportedLanguage; status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual'; translatedAt?: string; isStale?: boolean; canEdit: boolean; canRetranslate: boolean; content?: TranslationFieldContent; };`
- [x] **3.4** Add JSDoc for TranslationStatusData: "Internal representation of translation status for a single language with action capabilities."
- [x] **3.5** Define internal component state type: `type PanelState = { translations: TranslationStatusData[]; isLoading: boolean; error: Error | null; sourceContent: TranslationFieldContent | null; sourceLanguage: SupportedLanguage; entityName: string; };`
- [x] **3.6** Add JSDoc for PanelState: "Internal state for the TranslationPreviewPanel component."

---

## 4. Implement Main Component Structure and Props

**Context:** Create the main function component with props destructuring, translation hooks, and refs for accessibility. Following the pattern from AssetPanel.tsx (lines 45-62), set up the component shell with proper TypeScript typing using the TranslationPreviewPanelProps interface from the types file.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **4.1** Create the main function export: `export function TranslationPreviewPanel(props: TranslationPreviewPanelProps) {`
- [x] **4.2** Destructure props: `const { entityId, entityType, sourceLanguage, sourceContent, isOpen, onClose, onTranslationEdited, className } = props;`
- [x] **4.3** Initialize translation hooks: `const t = useTranslations('translation.previewPanel');` and `const tCommon = useTranslations('common.actions');`
- [x] **4.4** Create refs for accessibility: `const panelRef = useRef<HTMLDivElement>(null);` and `const closeButtonRef = useRef<HTMLButtonElement>(null);`
- [x] **4.5** Add comment section separator: "// ---------------------------------------------------------------------------" followed by "// State Management" followed by "// ---------------------------------------------------------------------------"
- [x] **4.6** Initialize component state: `const [panelState, setPanelState] = useState<PanelState>({ translations: [], isLoading: false, error: null, sourceContent: null, sourceLanguage: 'en', entityName: '' });`
- [x] **4.7** Add placeholder return statement: `return null; // TODO: Implement render`

---

## 5. Implement Data Fetching Logic

**Context:** Create the function to fetch translation status data from the API endpoint (GET /api/translations/status) as defined in Implementation Plan lines 250-279. This will be replaced or enhanced by the useTranslationStatus hook in Task 2.6, but for now provide basic fetch functionality to populate the panel.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **5.1** Add section comment: "// ---------------------------------------------------------------------------" followed by "// Data Fetching" followed by "// ---------------------------------------------------------------------------"
- [x] **5.2** Create fetchTranslationData function: `const fetchTranslationData = useCallback(async () => {`, with the callback dependency array `[entityType, entityId]`
- [x] **5.3** Set loading state at start: `setPanelState(prev => ({ ...prev, isLoading: true, error: null }));`
- [x] **5.4** Add try block and fetch call: `const response = await fetch(`/api/translations/status?entityType=${entityType}&entityId=${entityId}`);`
- [x] **5.5** Check response status: `if (!response.ok) { throw new Error(`Failed to fetch: ${response.statusText}`); }`
- [x] **5.6** Parse JSON response: `const data = await response.json();`
- [x] **5.7** Map response to translations array: create TranslationStatusData array from data.items[0].translations (iterate over SUPPORTED_LANGUAGES)
- [x] **5.8** Update state with fetched data: `setPanelState({ translations, isLoading: false, error: null, sourceContent: data.items[0].sourceContent, sourceLanguage: data.items[0].sourceLanguage, entityName: data.items[0].name });`
- [x] **5.9** Add catch block for errors: `catch (err) { setPanelState(prev => ({ ...prev, isLoading: false, error: err instanceof Error ? err : new Error('Unknown error') })); }`
- [x] **5.10** Add finally block: `finally { /* cleanup if needed */ }`
- [x] **5.11** Close the callback function with proper closing braces

---

## 6. Implement Panel Lifecycle Effects

**Context:** Add useEffect hooks to handle panel opening (data fetch trigger), ESC key handling, focus management, and body scroll locking. Following patterns from AssetPanel.tsx (lines 97-150) and ItemPreviewModal.tsx (lines 76-97), implement proper lifecycle management for smooth UX.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **6.1** Add section comment: "// ---------------------------------------------------------------------------" followed by "// Effects" followed by "// ---------------------------------------------------------------------------"
- [x] **6.2** Create effect to fetch data when panel opens: `useEffect(() => { if (isOpen && entityId) { fetchTranslationData(); } }, [isOpen, entityId, fetchTranslationData]);`
- [x] **6.3** Create ESC key handler effect: `useEffect(() => { const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) { onClose(); } }; if (isOpen) { document.addEventListener('keydown', handleEscape); return () => document.removeEventListener('keydown', handleEscape); } }, [isOpen, onClose]);`
- [x] **6.4** Create focus management effect: `useEffect(() => { if (isOpen && closeButtonRef.current) { closeButtonRef.current.focus(); } }, [isOpen]);`
- [x] **6.5** Create body scroll lock effect: `useEffect(() => { if (isOpen) { const scrollY = window.scrollY; document.body.style.overflow = 'hidden'; document.body.style.position = 'fixed'; document.body.style.top = `-${scrollY}px`; document.body.style.width = '100%'; return () => { document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = ''; window.scrollTo(0, scrollY); }; } }, [isOpen]);`

---

## 7. Implement Action Handlers

**Context:** Create callback functions for user actions: re-translate single language, re-translate all languages, edit translation, and retry failed translation. These handlers will call the prop callbacks (onTranslationEdited, etc.) or directly call the translation API endpoints.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **7.1** Add section comment: "// ---------------------------------------------------------------------------" followed by "// Action Handlers" followed by "// ---------------------------------------------------------------------------"
- [x] **7.2** Create handleRetranslate function: `const handleRetranslate = useCallback(async (language: SupportedLanguage) => { try { const response = await fetch('/api/translations/retranslate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entities: [{ type: entityType, id: entityId }], languages: [language] }) }); if (response.ok) { await fetchTranslationData(); } } catch (err) { console.error('Retranslate failed:', err); } }, [entityType, entityId, fetchTranslationData]);`
- [x] **7.3** Create handleRetranslateAll function: `const handleRetranslateAll = useCallback(async () => { try { const response = await fetch('/api/translations/retranslate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entities: [{ type: entityType, id: entityId }], languages: SUPPORTED_LANGUAGES }) }); if (response.ok) { await fetchTranslationData(); } } catch (err) { console.error('Retranslate all failed:', err); } }, [entityType, entityId, fetchTranslationData]);`
- [x] **7.4** Create handleEdit function: `const handleEdit = useCallback((language: SupportedLanguage) => { onTranslationEdited?.(language); }, [onTranslationEdited]);`
- [x] **7.5** Create handleRetry function (same as handleRetranslate): `const handleRetry = handleRetranslate;`

---

## 8. Implement Overlay and Panel Container

**Context:** Create the main JSX structure with overlay backdrop and slide-in panel container. Following the pattern from AssetPanel and the visual specification from the PRD (lines 809-840), implement a fixed-position overlay with backdrop and a transforming panel that slides in from the right.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **8.1** Replace the placeholder return with JSX fragment: `return ( <> ... </> );`
- [x] **8.2** Add overlay backdrop: `{isOpen && ( <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} aria-hidden="true" /> )}`
- [x] **8.3** Create panel container div with ref: `<div ref={panelRef} className={cn( 'fixed top-0 right-0 h-full w-full sm:w-[400px]', 'bg-white dark:bg-gray-900 shadow-xl z-50', 'transform transition-transform duration-300', 'flex flex-col', isOpen ? 'translate-x-0' : 'translate-x-full', className )} role="dialog" aria-modal="true" aria-labelledby="panel-title" >`
- [x] **8.4** Add comment inside panel div: `{/* Panel content will go here */}`
- [x] **8.5** Close panel div and fragment

---

## 9. Implement Panel Header with Title and Close Button

**Context:** Add the header section to the panel with entity name/title and a close button. Following the AssetPanel pattern (similar to lines 180-230 of overview), create a header bar with proper spacing, typography, and close button with icon.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **9.1** Replace the panel content comment with header structure: `{/* Header */} <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">`
- [x] **9.2** Add title heading: `<h2 id="panel-title" className="text-lg font-semibold text-gray-900 dark:text-white"> {panelState.entityName || t('title')} </h2>`
- [x] **9.3** Add close button: `<button ref={closeButtonRef} onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label={tCommon('close')} > <X className="h-5 w-5 text-gray-500" /> </button>`
- [x] **9.4** Close header div
- [x] **9.5** Add subtitle showing translation status: `<div className="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"> {t('statusFor')} {SUPPORTED_LANGUAGES.length} {t('languages')} </div>`

---

## 10. Implement Source Content Display Section

**Context:** Add the source content section that displays the original content for reference. This section will be a separate component (SourceContentSection) but for now, implement it inline until the subcomponent is created. Based on overview lines 244-298.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **10.1** After the subtitle, add source content section: `{/* Source Content */} <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">`
- [x] **10.2** Add section heading: `<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {t('sourceContent')} ({(panelState.sourceLanguage || sourceLanguage).toUpperCase()}) </h3>`
- [x] **10.3** Add content display container: `<div className="space-y-2">`
- [x] **10.4** Add title/name field: `{(panelState.sourceContent?.title || panelState.sourceContent?.name || sourceContent?.title || sourceContent?.name) && ( <div> <span className="text-xs text-gray-500 dark:text-gray-400"> {entityType === 'item' ? t('name') : t('title')}: </span> <p className="text-sm text-gray-900 dark:text-white"> {panelState.sourceContent?.title || panelState.sourceContent?.name || sourceContent?.title || sourceContent?.name} </p> </div> )}`
- [x] **10.5** Add description field: `{(panelState.sourceContent?.description || sourceContent?.description) && ( <div> <span className="text-xs text-gray-500 dark:text-gray-400">{t('description')}:</span> <p className="text-sm text-gray-900 dark:text-white line-clamp-3"> {panelState.sourceContent?.description || sourceContent?.description} </p> </div> )}`
- [x] **10.6** Close content container and source section divs

---

## 11. Implement Translations List Section with Loading/Error States

**Context:** Create the main content area that lists all languages with their translation status. Include conditional rendering for loading, error, and empty states. This section will use the TranslationStatusItem and TranslationProgressBar subcomponents when available.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **11.1** Add translations list container: `{/* Translations List */} <div className="flex-1 overflow-y-auto px-6 py-4">`
- [x] **11.2** Add loading state: `{panelState.isLoading && ( <div className="flex flex-col items-center justify-center py-8"> <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" /> <p className="text-sm text-gray-600 dark:text-gray-400">{t('loadingTranslations')}</p> </div> )}`
- [x] **11.3** Add error state: `{panelState.error && ( <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"> <div className="flex items-start"> <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" /> <div className="flex-1"> <h4 className="text-sm font-medium text-red-800 dark:text-red-200">{t('errorLoading')}</h4> <p className="text-sm text-red-700 dark:text-red-300 mt-1">{panelState.error.message}</p> <button onClick={fetchTranslationData} className="text-sm text-red-600 dark:text-red-400 underline mt-2"> {t('retry')} </button> </div> </div> </div> )}`
- [x] **11.4** Add successful data state section: `{!panelState.isLoading && !panelState.error && panelState.translations.length > 0 && ( <> ... </> )}`
- [x] **11.5** Inside success state, add progress summary comment: `{/* TODO: Add TranslationProgressBar component here */}`
- [x] **11.6** Add translations heading: `<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 mt-4"> {t('translations')} </h3>`
- [x] **11.7** Add placeholder for translations list: `<div className="space-y-2"> {panelState.translations.map((trans) => ( <div key={trans.language} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md"> <div className="flex items-center justify-between"> <span className="text-sm font-medium">{trans.language.toUpperCase()}</span> <span className="text-xs text-gray-500">{trans.status}</span> </div> {/* TODO: Replace with TranslationStatusItem component */} </div> ))} </div>`
- [x] **11.8** Close success state and translations list container divs

---

## 12. Implement Panel Footer with Action Buttons

**Context:** Add the footer section with "Re-translate All" and "Close" buttons. Following the overview lines 395-427, provide bulk actions and clear exit path for users.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [x] **12.1** After translations list container, add footer: `{/* Footer */} <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">`
- [x] **12.2** Add re-translate all button: `<button onClick={handleRetranslateAll} disabled={panelState.isLoading || panelState.translations.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" > <RefreshCw className="h-4 w-4" /> {t('retranslateAll')} </button>`
- [x] **12.3** Add close button: `<button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors" > {tCommon('close')} </button>`
- [x] **12.4** Close footer div
- [x] **12.5** Close panel container div and fragment

---

## 13. Create SourceContentSection Subcomponent

**Context:** Extract the source content display into a separate reusable component. This provides better code organization and makes the component easier to test. Following the overview lines 245-298.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/SourceContentSection.tsx`

**Estimated effort:** 1 story point

- [x] **13.1** Add 'use client' directive at top of SourceContentSection.tsx
- [x] **13.2** Add JSDoc module comment: "SourceContentSection Component - Displays original source content for translation reference"
- [x] **13.3** Import dependencies: `import { useTranslations } from 'next-intl';` and `import type { SupportedLanguage, TranslationFieldContent } from '@/components/TranslationManagement/TranslationManagement.types';`
- [x] **13.4** Define props interface: `interface SourceContentSectionProps { entityType: 'article' | 'item' | 'link'; content: TranslationFieldContent; sourceLanguage: SupportedLanguage; }`
- [x] **13.5** Create component function: `export function SourceContentSection({ entityType, content, sourceLanguage }: SourceContentSectionProps) {`
- [x] **13.6** Initialize translation hook: `const t = useTranslations('translation.previewPanel');`
- [x] **13.7** Return JSX (copy from main component's source content section): the entire source content display structure from step 10
- [x] **13.8** Close component function

---

## 14. Add Translation Keys to English Locale File

**Context:** Define all i18n translation keys needed for the panel UI in the English locale file. Following the pattern from existing translation namespaces in messages/en.json and the keys specified in overview lines 481-501.

**Files to modify:**
- `messages/en.json`

**Estimated effort:** 1 story point

- [x] **14.1** Open messages/en.json
- [x] **14.2** Locate or create the "translation" root key in the JSON structure
- [x] **14.3** Add "previewPanel" namespace object under "translation"
- [x] **14.4** Add key "title" with value "Translation Preview"
- [x] **14.5** Add key "sourceContent" with value "Source Content"
- [x] **14.6** Add key "translations" with value "Translations"
- [x] **14.7** Add key "languages" with value "languages"
- [x] **14.8** Add key "statusFor" with value "Status for"
- [x] **14.9** Add key "loadingTranslations" with value "Loading translation status..."
- [x] **14.10** Add key "errorLoading" with value "Error loading translations"
- [x] **14.11** Add key "retry" with value "Retry"
- [x] **14.12** Add key "retranslateAll" with value "Re-translate All"
- [x] **14.13** Add key "name" with value "Name"
- [x] **14.14** Add key "title" (nested) with value "Title"
- [x] **14.15** Add key "description" with value "Description"
- [x] **14.16** Verify JSON syntax is valid (no trailing commas, proper nesting)

---

## 15. Add Translation Keys to Other Locale Files

**Context:** Add the same translation keys to all other supported language locale files (French, Spanish, German, Dutch, Italian) with appropriate translations. These translations ensure the panel UI itself is localized.

**Files to modify:**
- `messages/fr.json`
- `messages/es.json`
- `messages/de.json`
- `messages/nl.json`
- `messages/it.json`

**Estimated effort:** 1 story point

- [x] **15.1** Open messages/fr.json and add "translation.previewPanel" namespace with French translations: title="Aperçu des traductions", sourceContent="Contenu source", translations="Traductions", languages="langues", statusFor="État pour", loadingTranslations="Chargement de l'état des traductions...", errorLoading="Erreur de chargement des traductions", retry="Réessayer", retranslateAll="Tout retraduire", name="Nom", title="Titre", description="Description"
- [x] **15.2** Open messages/es.json and add Spanish translations: title="Vista previa de traducción", sourceContent="Contenido original", translations="Traducciones", languages="idiomas", statusFor="Estado para", loadingTranslations="Cargando estado de traducción...", errorLoading="Error al cargar traducciones", retry="Reintentar", retranslateAll="Retraducir todo", name="Nombre", title="Título", description="Descripción"
- [x] **15.3** Open messages/de.json and add German translations: title="Übersetzungsvorschau", sourceContent="Quellinhalt", translations="Übersetzungen", languages="Sprachen", statusFor="Status für", loadingTranslations="Übersetzungsstatus wird geladen...", errorLoading="Fehler beim Laden der Übersetzungen", retry="Wiederholen", retranslateAll="Alle neu übersetzen", name="Name", title="Titel", description="Beschreibung"
- [x] **15.4** Open messages/nl.json and add Dutch translations: title="Vertalingsvoorbeeld", sourceContent="Broninhoud", translations="Vertalingen", languages="talen", statusFor="Status voor", loadingTranslations="Vertaalstatus laden...", errorLoading="Fout bij laden vertalingen", retry="Opnieuw proberen", retranslateAll="Alles opnieuw vertalen", name="Naam", title="Titel", description="Beschrijving"
- [x] **15.5** Open messages/it.json and add Italian translations: title="Anteprima traduzione", sourceContent="Contenuto originale", translations="Traduzioni", languages="lingue", statusFor="Stato per", loadingTranslations="Caricamento stato traduzione...", errorLoading="Errore nel caricamento traduzioni", retry="Riprova", retranslateAll="Ritradurre tutto", name="Nome", title="Titolo", description="Descrizione"
- [x] **15.6** Verify all JSON files have valid syntax

---

## 16. Create Barrel Export File

**Context:** Create the index.ts file that exports the panel component and subcomponents for clean imports from other modules. Following the pattern from overview lines 509-518.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Estimated effort:** 1 story point

- [x] **16.1** Open src/components/TranslationManagement/TranslationPreviewPanel/index.ts
- [x] **16.2** Add JSDoc comment: "TranslationPreviewPanel Module Exports"
- [x] **16.3** Add export for main panel: `export { TranslationPreviewPanel } from './TranslationPreviewPanel';`
- [x] **16.4** Add export for source content section: `export { SourceContentSection } from './SourceContentSection';`
- [x] **16.5** Add commented placeholder exports for future subcomponents: `// export { TranslationStatusItem } from './TranslationStatusItem'; // Available in REQ-E05-008`
- [x] **16.6** Add commented placeholder: `// export { TranslationProgressBar } from './TranslationProgressBar'; // Available in Task 2.4`

---

## 17. Update Main TranslationManagement Index Export

**Context:** Add the new TranslationPreviewPanel components to the main TranslationManagement module exports to make them available for import throughout the application.

**Files to modify:**
- `src/components/TranslationManagement/index.ts`

**Estimated effort:** 1 story point

- [x] **17.1** Open src/components/TranslationManagement/index.ts
- [x] **17.2** Locate the component exports section (should have a comment like "// Export components" from REQ-E05-006)
- [x] **17.3** Add export statement: `export { TranslationPreviewPanel, SourceContentSection } from './TranslationPreviewPanel';`
- [x] **17.4** Verify the export doesn't conflict with existing type exports
- [x] **17.5** Save the file

---

## 18. Run TypeScript Type Check

**Context:** Verify that all TypeScript types are correct, imports resolve properly, and there are no type errors introduced by the new component. This catches issues before runtime.

**Files to modify:** None (validation step)

**Estimated effort:** 1 story point

- [x] **18.1** Run `npx tsc --noEmit` from the project root directory
- [x] **18.2** Review output and search for any errors mentioning "TranslationPreviewPanel" or "SourceContentSection"
- [x] **18.3** If type errors exist, identify the file and line number
- [x] **18.4** Common issues to check: missing imports, incorrect type usage, props interface mismatch, invalid JSX syntax
- [x] **18.5** Fix any identified type errors
- [x] **18.6** Re-run `npx tsc --noEmit` after each fix until no TranslationPreviewPanel-related errors remain
- [x] **18.7** Document any pre-existing TypeScript errors unrelated to this component (acceptable per project CLAUDE.md)

---

## 19. Test Component Rendering and Basic Interactions

**Context:** Manually test the component to verify it renders correctly, opens/closes properly, and handles basic interactions. This validation ensures the component works before integration with other features.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **19.1** Create a temporary test page or component that renders TranslationPreviewPanel with isOpen=true and mock props
- [ ] **19.2** Start the development server: `npm run dev`
- [ ] **19.3** Navigate to the test page in a browser
- [ ] **19.4** Verify the panel slides in from the right when isOpen changes from false to true
- [ ] **19.5** Verify the overlay backdrop appears with semi-transparent black color
- [ ] **19.6** Click the close button (X icon) - verify onClose callback is triggered
- [ ] **19.7** Press ESC key - verify panel closes (onClose called)
- [ ] **19.8** Click the overlay backdrop - verify panel closes (onClose called)
- [ ] **19.9** Verify source content section displays correctly with provided content
- [ ] **19.10** Verify loading state shows spinner and message when isLoading=true
- [ ] **19.11** Verify error state shows error message and retry button when error is set
- [ ] **19.12** Verify footer buttons are present and styled correctly
- [ ] **19.13** Test on mobile viewport (resize browser or use device mode) - verify panel is full-width
- [ ] **19.14** Test on desktop viewport - verify panel is 400px width

---

## 20. Test Accessibility Features

**Context:** Verify that the component meets accessibility requirements: focus management, keyboard navigation, ARIA attributes, and screen reader compatibility. Following the requirements from overview lines 521-559.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **20.1** With panel open, verify focus automatically moves to the close button
- [ ] **20.2** Press TAB key - verify focus moves to next focusable element (button or link)
- [ ] **20.3** Continue tabbing through all interactive elements - verify focus stays within the panel (focus trap)
- [ ] **20.4** Press SHIFT+TAB - verify reverse tab order works and focus wraps correctly
- [ ] **20.5** Use browser DevTools to inspect the panel element - verify it has `role="dialog"` attribute
- [ ] **20.6** Verify panel has `aria-modal="true"` attribute
- [ ] **20.7** Verify panel has `aria-labelledby` pointing to the title element's id
- [ ] **20.8** Verify overlay has `aria-hidden="true"` attribute
- [ ] **20.9** Test with a screen reader (VoiceOver, NVDA, or JAWS) - verify it announces "dialog" when opened
- [ ] **20.10** Verify screen reader reads the panel title correctly
- [ ] **20.11** Verify all buttons have accessible labels (either text content or aria-label)
- [ ] **20.12** Check color contrast ratios for text meet WCAG AA standards (minimum 4.5:1 for normal text)

---

## 21. Test Data Fetching and API Integration

**Context:** Verify that the panel correctly fetches translation status data from the API, handles loading states, displays fetched data, and handles API errors gracefully.

**Files to modify:** None (testing step, but may require mock API or test data)

**Estimated effort:** 1 story point

- [ ] **21.1** Ensure the translation status API endpoint (from REQ-E05-001) is available or mock it
- [ ] **21.2** Open panel with a valid entityId and entityType
- [ ] **21.3** Verify loading state appears immediately (spinner and loading message)
- [ ] **21.4** Monitor network tab in DevTools - verify GET request to /api/translations/status with correct query params
- [ ] **21.5** When data loads, verify loading state disappears
- [ ] **21.6** Verify translations array is populated with all 5 languages (fr, es, de, nl, it)
- [ ] **21.7** Verify source content displays the data from API response
- [ ] **21.8** Verify entity name/title shows correctly in panel header
- [ ] **21.9** Test with API returning an error (500 status) - verify error state displays with error message
- [ ] **21.10** Click retry button in error state - verify it re-fetches data
- [ ] **21.11** Test with API returning empty results - verify appropriate empty state handling
- [ ] **21.12** Verify state updates correctly when entityId prop changes while panel is open

---

## 22. Test Re-translate Actions

**Context:** Verify that the re-translate buttons correctly trigger API calls and update the panel state after successful re-translation requests.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **22.1** Ensure the retranslate API endpoint (from REQ-E05-003) is available or mock it
- [ ] **22.2** Open panel with translations loaded
- [ ] **22.3** Click "Re-translate All" button in footer
- [ ] **22.4** Verify POST request to /api/translations/retranslate in network tab
- [ ] **22.5** Verify request body includes entities array with correct entityType and entityId
- [ ] **22.6** Verify request body includes languages array with all 5 languages
- [ ] **22.7** After successful response, verify panel re-fetches translation status (loading state should briefly appear)
- [ ] **22.8** Verify button is disabled during the re-translate operation
- [ ] **22.9** Test with API error response - verify error is handled gracefully (console error logged, user sees feedback)
- [ ] **22.10** Verify "Re-translate All" button is disabled when isLoading=true
- [ ] **22.11** Verify "Re-translate All" button is disabled when translations array is empty

---

## 23. Verify Responsive Layout and Dark Mode

**Context:** Test that the component displays correctly across different screen sizes and in both light and dark color modes. The panel should be full-width on mobile and 400px on desktop, with proper dark mode styling.

**Files to modify:** None (testing step)

**Estimated effort:** 1 story point

- [ ] **23.1** Test on mobile viewport (<640px) - verify panel is full-width
- [ ] **23.2** Test on small desktop viewport (>=640px) - verify panel is 400px width
- [ ] **23.3** Verify slide-in animation is smooth on all screen sizes
- [ ] **23.4** Verify content scrolls properly on mobile when there are many translations
- [ ] **23.5** Test touch interactions on mobile (swipe gestures, tap targets)
- [ ] **23.6** Verify button touch targets are at least 44x44px on mobile (per WCAG guidelines)
- [ ] **23.7** Switch to dark mode (add `dark` class to html element or use system settings)
- [ ] **23.8** Verify panel background changes to dark color (bg-gray-900)
- [ ] **23.9** Verify text colors are appropriate for dark mode (light text on dark background)
- [ ] **23.10** Verify borders are visible in dark mode (use dark gray borders)
- [ ] **23.11** Verify buttons have proper hover states in dark mode
- [ ] **23.12** Verify icons are visible in dark mode
- [ ] **23.13** Check loading spinner color is visible in dark mode
- [ ] **23.14** Verify error message styling works in dark mode

---

## 24. Document Component Usage

**Context:** Add inline code comments and update the SourceContentSection component with usage examples to help future developers understand how to integrate the panel into their components.

**Files to modify:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- `src/components/TranslationManagement/TranslationPreviewPanel/SourceContentSection.tsx`

**Estimated effort:** 1 story point

- [ ] **24.1** At the top of TranslationPreviewPanel.tsx, add a usage example in JSDoc comment block showing how to import and use the component
- [ ] **24.2** Include example showing typical props: entityId, entityType, isOpen, onClose, sourceLanguage, sourceContent
- [ ] **24.3** Add code example showing state management for opening/closing the panel
- [ ] **24.4** Document the expected structure of sourceContent object (which fields for which entityType)
- [ ] **24.5** Add comments explaining the data flow: props -> state -> API fetch -> render
- [ ] **24.6** Document the relationship with TranslationStatusItem and TranslationProgressBar components (to be added later)
- [ ] **24.7** In SourceContentSection.tsx, add usage example showing how to use it standalone if needed
- [ ] **24.8** Add TODO comments marking where TranslationStatusItem and TranslationProgressBar will be integrated

---

## Summary

This task creates the TranslationPreviewPanel component, a slide-in drawer for displaying translation status and managing translations. The component provides:

**Core Functionality:**
- Slide-in panel from right with overlay backdrop
- Source content display for reference
- Translation status list for all 5 supported languages
- Loading, error, and empty states
- Re-translate actions (single language and all languages)
- Close on ESC key, close button click, or overlay click

**Accessibility:**
- Focus management with focus trap
- ARIA attributes (role, aria-modal, aria-labelledby)
- Keyboard navigation support
- Screen reader compatibility

**Responsive Design:**
- Full-width on mobile (<640px)
- 400px width on desktop (>=640px)
- Smooth slide-in animations
- Dark mode support

**Key Files Created:**
- `src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` - Main panel component
- `src/components/TranslationManagement/TranslationPreviewPanel/SourceContentSection.tsx` - Source content subcomponent
- `src/components/TranslationManagement/TranslationPreviewPanel/index.ts` - Barrel exports
- Translation keys in all 6 locale files (en, fr, es, de, nl, it)

**Critical Dependencies:**
- REQ-E05-001 (Translation Status API) - provides data endpoint
- REQ-E05-006 (TranslationManagement types) - provides TypeScript types
- REQ-E05-003 (Re-translate API) - provides action endpoint
- next-intl framework - provides translation hooks
- Tailwind CSS - provides styling

**Blocks:**
- REQ-E05-008 (TranslationStatusItem) - will replace placeholder language rows
- Task 2.4 (TranslationProgressBar) - will add progress visualization
- Task 2.5 (TranslationEditor) - will be triggered by Edit actions
- Task 2.6 (useTranslationStatus hook) - will replace direct API calls
- Task 2.7 (useTranslationRealtime hook) - will add realtime updates
- Tasks 7.1, 7.2 (Editor integrations) - will use this panel

**Future Enhancements** (out of scope):
- Integration with TranslationStatusItem component (REQ-E05-008)
- Integration with TranslationProgressBar component (Task 2.4)
- Realtime updates via useTranslationRealtime hook (Task 2.7)
- Enhanced data fetching via useTranslationStatus hook (Task 2.6)
- Translation editing modal integration (Task 2.5)

---

*Document generated: 2026-01-22 22:41*
