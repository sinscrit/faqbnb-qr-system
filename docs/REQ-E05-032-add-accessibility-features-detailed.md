# Add Accessibility Features - Detailed Implementation Tasks

**Generated:** 2026-01-23 13:00
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #32)
- Overview: docs/REQ-E05-032-add-accessibility-features-overview.md
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

## 1. Create TranslationStatusAnnouncer Component

**Context:** Create a reusable ARIA live region component for announcing status changes to screen readers. This component will be invisible on screen but provide critical feedback to users relying on assistive technologies.

**Files to create:**
- `/src/components/TranslationManagement/TranslationStatusAnnouncer.tsx` (NEW)

**Estimated effort:** 1 story point

- [ ] **1.1** Create new file `/src/components/TranslationManagement/TranslationStatusAnnouncer.tsx`
- [ ] **1.2** Add imports: `useState`, `useEffect` from React, `useTranslations` from next-intl
- [ ] **1.3** Define TranslationStatusAnnouncerProps interface with fields: `status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'manual'`, `language?: string`, `message?: string`, `politeness?: 'polite' | 'assertive'`
- [ ] **1.4** Create TranslationStatusAnnouncer function component
- [ ] **1.5** Call useTranslations with namespace `'translationManagement.announcements'`
- [ ] **1.6** Add state for announcement: `const [announcement, setAnnouncement] = useState('')`
- [ ] **1.7** Implement useEffect that updates announcement based on status and language props
- [ ] **1.8** Create status-to-announcement mapping object using t() calls for each status
- [ ] **1.9** If message prop is provided, use it directly; otherwise generate from status and language
- [ ] **1.10** Return null if announcement is empty (nothing to announce)
- [ ] **1.11** Return div with `role="status"`, `aria-live={politeness}`, `aria-atomic="true"`, `className="sr-only"`
- [ ] **1.12** Add JSDoc comment explaining usage with example
- [ ] **1.13** Export TranslationStatusAnnouncer component
- [ ] **1.14** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 2. Update TranslationStatusBadge with ARIA Labels

**Context:** Add descriptive aria-label attributes to all status badges to provide context for screen reader users. Without these labels, screen reader users only hear "badge" without understanding what the status means.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationStatusBadge.tsx`

**Estimated effort:** 1 story point

- [ ] **2.1** Read current `/src/components/TranslationManagement/TranslationStatusBadge.tsx` implementation
- [ ] **2.2** Import useTranslations from next-intl if not already imported
- [ ] **2.3** Call useTranslations with namespace `'translationManagement.status'`
- [ ] **2.4** Update config object for each status to include ariaLabel field
- [ ] **2.5** For pending status: `ariaLabel: language ? t('ariaLabels.pending', { language }) : t('pending')`
- [ ] **2.6** For in_progress status: `ariaLabel: language ? t('ariaLabels.inProgress', { language }) : t('inProgress')`
- [ ] **2.7** For completed status: `ariaLabel: language ? t('ariaLabels.completed', { language }) : t('completed')`
- [ ] **2.8** For failed status: `ariaLabel: language ? t('ariaLabels.failed', { language }) : t('failed')`
- [ ] **2.9** For manual status: `ariaLabel: language ? t('ariaLabels.manual', { language }) : t('manual')`
- [ ] **2.10** Add aria-label prop to Badge component: `aria-label={config.ariaLabel}`
- [ ] **2.11** Add aria-hidden="true" to Icon component to prevent double-announcement
- [ ] **2.12** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 3. Add Keyboard Navigation to TranslationPreviewPanel

**Context:** Enhance preview panel with keyboard accessibility including focus management, logical tab order, and semantic HTML structure. Ensure panel can be operated entirely with keyboard.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

**Estimated effort:** 1 story point

- [ ] **3.1** Read current TranslationPreviewPanel implementation
- [ ] **3.2** Add imports: `useRef`, `useEffect` from React
- [ ] **3.3** Import TranslationStatusAnnouncer component
- [ ] **3.4** Create panelRef: `const panelRef = useRef<HTMLDivElement>(null)`
- [ ] **3.5** Call useTranslations with namespace `'translationManagement.preview'`
- [ ] **3.6** Implement useEffect to focus panel when isOpen becomes true
- [ ] **3.7** Add keyboard event handler useEffect that listens for ESC key to close panel
- [ ] **3.8** Add optional keyboard shortcut: 'r' key to refresh status (only when focus is within panel)
- [ ] **3.9** Update root div with ref={panelRef}, role="region", aria-label from t('ariaLabels.panel'), tabIndex={-1}
- [ ] **3.10** Add aria-describedby pointing to description element ID
- [ ] **3.11** Create sr-only paragraph with ID for aria-describedby containing panel description
- [ ] **3.12** Wrap language list in div with role="list" and aria-labelledby
- [ ] **3.13** Add role="listitem" to each language row
- [ ] **3.14** Add aria-label to all action buttons (retry, edit, retranslate) with language context
- [ ] **3.15** Set aria-hidden="true" on all icons to prevent double-announcement
- [ ] **3.16** Add TranslationStatusAnnouncer component at end of panel for status announcements
- [ ] **3.17** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 4. Add Focus Management to TranslationEditForm

**Context:** Implement proper modal focus management: focus first input on open, trap focus within modal, return focus to trigger element on close. This is critical for keyboard users.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationEditForm/TranslationEditForm.tsx`

**Estimated effort:** 1 story point

- [ ] **4.1** Read current TranslationEditForm implementation
- [ ] **4.2** Add imports: `useRef`, `useEffect` from React
- [ ] **4.3** Import TranslationStatusAnnouncer component
- [ ] **4.4** Create firstInputRef: `const firstInputRef = useRef<HTMLInputElement>(null)`
- [ ] **4.5** Create triggerElementRef: `const triggerElementRef = useRef<HTMLElement | null>(null)`
- [ ] **4.6** Implement useEffect to store currently focused element (trigger) when modal opens
- [ ] **4.7** Implement useEffect to focus first input when modal opens (with 100ms delay for rendering)
- [ ] **4.8** Create handleClose function that calls onClose and returns focus to trigger element
- [ ] **4.9** Update Dialog component with onOpenChange={handleClose}
- [ ] **4.10** Add aria-labelledby and aria-describedby to DialogContent
- [ ] **4.11** Create sr-only description paragraph for modal with ID matching aria-describedby
- [ ] **4.12** Add ref={firstInputRef} to first form input (title field)
- [ ] **4.13** Add proper label htmlFor attributes to all form fields
- [ ] **4.14** Add aria-required="true" to required fields
- [ ] **4.15** Add aria-invalid and aria-describedby for field validation errors
- [ ] **4.16** Wrap error messages in elements with role="alert" for immediate announcement
- [ ] **4.17** Add aria-label to save button with language context
- [ ] **4.18** Add TranslationStatusAnnouncer for save operation feedback
- [ ] **4.19** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 5. Add Semantic Table Markup to TranslationStatusTable

**Context:** Add proper table semantics (th scope, caption, aria-labels) and descriptive aria-labels to action buttons. Semantic tables help screen readers navigate data effectively.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationStatusTable/TranslationStatusTable.tsx`

**Estimated effort:** 1 story point

- [ ] **5.1** Read current TranslationStatusTable implementation
- [ ] **5.2** Import TranslationStatusAnnouncer component
- [ ] **5.3** Call useTranslations with namespace `'translationManagement.statusTable'`
- [ ] **5.4** Wrap table in div with role="region" and aria-labelledby
- [ ] **5.5** Add h3 heading with ID for aria-labelledby
- [ ] **5.6** Add role="table" to table element
- [ ] **5.7** Add caption element with sr-only class and ID for aria-describedby
- [ ] **5.8** Add scope="col" to all th elements in thead
- [ ] **5.9** Add scope="row" to first cell (item name) in each tbody row
- [ ] **5.10** Add sr-only text for "Actions" column header
- [ ] **5.11** Add aria-label to "View" button: t('actions.ariaLabels.view', { item: item.name })
- [ ] **5.12** Add aria-label to "Re-translate All" button with item context
- [ ] **5.13** Add sr-only screen reader text for status counts: "{completed} of {total} translations completed"
- [ ] **5.14** Set aria-hidden="true" on visual status count to prevent double-announcement
- [ ] **5.15** Add empty state with role="status" and aria-live="polite"
- [ ] **5.16** Add TranslationStatusAnnouncer for bulk operation feedback
- [ ] **5.17** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 6. Add Radiogroup Semantics to TranslationLanguageSelector

**Context:** Use ARIA radiogroup pattern for language selection to provide proper semantics and keyboard navigation (arrow keys) for screen reader users.

**Files to modify:**
- `/src/components/TranslationManagement/TranslationLanguageSelector/TranslationLanguageSelector.tsx`

**Estimated effort:** 1 story point

- [ ] **6.1** Read current TranslationLanguageSelector implementation
- [ ] **6.2** Import localeMetadata from @/lib/i18n/config
- [ ] **6.3** Call useTranslations with namespace `'translationManagement.languageSelector'`
- [ ] **6.4** Wrap component in div with role="group" and aria-labelledby
- [ ] **6.5** Add h4 heading with ID for aria-labelledby
- [ ] **6.6** Add paragraph with ID for description
- [ ] **6.7** Wrap language buttons in div with role="radiogroup", aria-labelledby, aria-describedby
- [ ] **6.8** Update each button with role="radio" and aria-checked={isSelected}
- [ ] **6.9** Add aria-disabled={isDisabled} to disabled buttons
- [ ] **6.10** Add aria-label to each button: t('ariaLabels.languageOption', { language, status })
- [ ] **6.11** Set aria-hidden="true" on flag emoji (decorative)
- [ ] **6.12** Add sr-only selected indicator text when language is selected
- [ ] **6.13** Add ARIA live region that announces selected language change
- [ ] **6.14** Use role="status" and aria-live="polite" for selection announcement
- [ ] **6.15** Run `npx tsc --noEmit` to verify no TypeScript errors

---

## 7. Create Accessibility CSS Styles

**Context:** Create custom CSS for visible focus indicators that meet WCAG 2.1 Level AA contrast requirements (3:1 minimum). Focus indicators must be visible for keyboard users but hidden for mouse users.

**Files to create:**
- `/src/styles/accessibility.css` (NEW)

**Estimated effort:** 1 story point

- [ ] **7.1** Create directory `/src/styles/` if it doesn't exist
- [ ] **7.2** Create new file `accessibility.css` in styles directory
- [ ] **7.3** Add CSS comment header: "Custom focus styles for translation management components"
- [ ] **7.4** Define focus-visible styles for buttons in translation-preview-panel class
- [ ] **7.5** Define focus-visible styles for inputs/textareas in translation-edit-form class
- [ ] **7.6** Define focus-visible styles for buttons in translation-status-table class
- [ ] **7.7** Use outline: 2px solid hsl(var(--ring)), outline-offset: 2px for all focus styles
- [ ] **7.8** Add focus-visible styles for translation-status-badge with box-shadow
- [ ] **7.9** Add focus-within styles for listitem containers in preview panel
- [ ] **7.10** Add rule to remove default outline for :focus:not(:focus-visible) (mouse clicks)
- [ ] **7.11** Add high contrast mode media query with 3px outline width
- [ ] **7.12** Add prefers-reduced-motion media query to disable spin animations
- [ ] **7.13** Verify all selectors use specific class names (not global element selectors)
- [ ] **7.14** Verify outline color uses CSS variable for theme compatibility

---

## 8. Integrate Accessibility CSS into Dashboard Layout

**Context:** Import the accessibility.css file into the dashboard layout so focus styles are applied across all translation management pages.

**Files to modify:**
- `/src/app/dashboard2/layout.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Read current `/src/app/dashboard2/layout.tsx` file
- [ ] **8.2** Add import statement at top: `import '@/styles/accessibility.css';`
- [ ] **8.3** Verify import is after global styles import (if exists) to ensure correct cascade order
- [ ] **8.4** Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] **8.5** Run `npm run build` to verify CSS is bundled correctly
- [ ] **8.6** Check build output for accessibility.css inclusion

---

## 9. Add Translation Keys for English Locale

**Context:** Add comprehensive ARIA labels, descriptions, and announcements to English locale file. These keys provide context for screen readers in all translation management components.

**Files to modify:**
- `/messages/en.json`

**Estimated effort:** 1 story point

- [ ] **9.1** Open `/messages/en.json` file
- [ ] **9.2** Locate or create `translationManagement` namespace object
- [ ] **9.3** Create `status.ariaLabels` sub-object with keys: pending, inProgress, completed, failed, manual (each with {language} placeholder)
- [ ] **9.4** Create `preview.ariaLabels` sub-object with keys: panel, close, refresh
- [ ] **9.5** Add `preview.description` key for panel description
- [ ] **9.6** Create `preview.keyboardShortcuts` sub-object with label and description
- [ ] **9.7** Create `editForm.ariaLabels` sub-object with keys for title, content
- [ ] **9.8** Add `editForm.description` key for modal description
- [ ] **9.9** Create `editForm.fields.ariaLabels` sub-object for form field labels
- [ ] **9.10** Create `actions.ariaLabels` sub-object with keys: retry, retranslate, edit, view, retranslateAll, refresh, close
- [ ] **9.11** Create `statusTable.ariaLabels` sub-object for table-specific labels
- [ ] **9.12** Add `statusTable.description` and `statusTable.status.summary` keys
- [ ] **9.13** Create `languageSelector` sub-object with label, description, ariaLabels, announcements
- [ ] **9.14** Create `announcements` sub-object with keys for all status types
- [ ] **9.15** Verify all keys use {language}, {entity}, {item} placeholders appropriately
- [ ] **9.16** Verify JSON syntax is valid (no trailing commas)
- [ ] **9.17** Run `npm run build` to verify translations load correctly

---

## 10. Add Translation Keys for Spanish Locale

**Context:** Add Spanish translations for all accessibility-related keys following the same structure as English.

**Files to modify:**
- `/messages/es.json`

**Estimated effort:** 1 story point

- [ ] **10.1** Open `/messages/es.json` file
- [ ] **10.2** Locate or create `translationManagement` namespace object
- [ ] **10.3** Add `status.ariaLabels` with Spanish translations: "Traducción pendiente para {language}", etc.
- [ ] **10.4** Add `preview.ariaLabels` with Spanish translations: "Panel de vista previa de traducción para {entity}", "Cerrar vista previa", "Actualizar estado"
- [ ] **10.5** Add `preview.description`: "Vista previa y gestión de traducciones para todos los idiomas"
- [ ] **10.6** Add `preview.keyboardShortcuts.description`: "Presione R para actualizar, Escape para cerrar"
- [ ] **10.7** Add `editForm` translations with proper Spanish grammar
- [ ] **10.8** Add `actions.ariaLabels` translations using Spanish verbs (Reintentar, Ver, Editar, etc.)
- [ ] **10.9** Add `statusTable` translations
- [ ] **10.10** Add `languageSelector` translations with proper Spanish for "selected"/"not selected"
- [ ] **10.11** Add `announcements` translations using Spanish perfect tense: "La traducción para {language} se ha completado"
- [ ] **10.12** Verify all placeholder syntax is preserved: {language}, {entity}, {item}
- [ ] **10.13** Verify JSON syntax is valid
- [ ] **10.14** Run `npm run build` to verify Spanish translations load correctly

---

## 11. Add Translation Keys for French Locale

**Context:** Add French translations for all accessibility-related keys following the same structure.

**Files to modify:**
- `/messages/fr.json`

**Estimated effort:** 1 story point

- [ ] **11.1** Open `/messages/fr.json` file
- [ ] **11.2** Locate or create `translationManagement` namespace object
- [ ] **11.3** Add `status.ariaLabels` with French translations: "Traduction en attente pour {language}", etc.
- [ ] **11.4** Add `preview.ariaLabels`: "Panneau de prévisualisation des traductions pour {entity}", "Fermer", "Actualiser"
- [ ] **11.5** Add `preview.description`: "Prévisualiser et gérer les traductions pour toutes les langues"
- [ ] **11.6** Add `preview.keyboardShortcuts.description`: "Appuyez sur R pour actualiser, Échap pour fermer"
- [ ] **11.7** Add `editForm` translations using French formal language
- [ ] **11.8** Add `actions.ariaLabels` with French infinitive verbs: Réessayer, Voir, Modifier, etc.
- [ ] **11.9** Add `statusTable` translations
- [ ] **11.10** Add `languageSelector` translations
- [ ] **11.11** Add `announcements` with passé composé: "La traduction pour {language} a été complétée"
- [ ] **11.12** Verify placeholder syntax is preserved
- [ ] **11.13** Verify JSON syntax is valid
- [ ] **11.14** Run `npm run build` to verify French translations load correctly

---

## 12. Add Translation Keys for German Locale

**Context:** Add German translations for all accessibility-related keys following the same structure.

**Files to modify:**
- `/messages/de.json`

**Estimated effort:** 1 story point

- [ ] **12.1** Open `/messages/de.json` file
- [ ] **12.2** Locate or create `translationManagement` namespace object
- [ ] **12.3** Add `status.ariaLabels` with German translations: "Übersetzung ausstehend für {language}", etc.
- [ ] **12.4** Add `preview.ariaLabels`: "Übersetzungsvorschau-Panel für {entity}", "Schließen", "Aktualisieren"
- [ ] **12.5** Add `preview.description`: "Übersetzungen für alle Sprachen anzeigen und verwalten"
- [ ] **12.6** Add `preview.keyboardShortcuts.description`: "Drücken Sie R zum Aktualisieren, Escape zum Schließen"
- [ ] **12.7** Add `editForm` translations using German compound nouns where appropriate
- [ ] **12.8** Add `actions.ariaLabels` with German verbs: Wiederholen, Anzeigen, Bearbeiten, etc.
- [ ] **12.9** Add `statusTable` translations
- [ ] **12.10** Add `languageSelector` translations
- [ ] **12.11** Add `announcements` with German perfect tense: "Die Übersetzung für {language} wurde abgeschlossen"
- [ ] **12.12** Verify placeholder syntax is preserved
- [ ] **12.13** Verify JSON syntax is valid
- [ ] **12.14** Run `npm run build` to verify German translations load correctly

---

## 13. Add Translation Keys for Italian Locale

**Context:** Add Italian translations for all accessibility-related keys following the same structure.

**Files to modify:**
- `/messages/it.json`

**Estimated effort:** 1 story point

- [ ] **13.1** Open `/messages/it.json` file
- [ ] **13.2** Locate or create `translationManagement` namespace object
- [ ] **13.3** Add `status.ariaLabels` with Italian translations: "Traduzione in sospeso per {language}", etc.
- [ ] **13.4** Add `preview.ariaLabels`: "Pannello di anteprima traduzione per {entity}", "Chiudi", "Aggiorna"
- [ ] **13.5** Add `preview.description`: "Visualizza e gestisci le traduzioni per tutte le lingue"
- [ ] **13.6** Add `preview.keyboardShortcuts.description`: "Premi R per aggiornare, Esc per chiudere"
- [ ] **13.7** Add `editForm` translations using Italian formal language
- [ ] **13.8** Add `actions.ariaLabels` with Italian verbs: Riprova, Visualizza, Modifica, etc.
- [ ] **13.9** Add `statusTable` translations
- [ ] **13.10** Add `languageSelector` translations
- [ ] **13.11** Add `announcements` with passato prossimo: "La traduzione per {language} è stata completata"
- [ ] **13.12** Verify placeholder syntax is preserved
- [ ] **13.13** Verify JSON syntax is valid
- [ ] **13.14** Run `npm run build` to verify Italian translations load correctly

---

## 14. Add Translation Keys for Dutch Locale

**Context:** Add Dutch translations for all accessibility-related keys following the same structure.

**Files to modify:**
- `/messages/nl.json`

**Estimated effort:** 1 story point

- [ ] **14.1** Open `/messages/nl.json` file
- [ ] **14.2** Locate or create `translationManagement` namespace object
- [ ] **14.3** Add `status.ariaLabels` with Dutch translations: "Vertaling in behandeling voor {language}", etc.
- [ ] **14.4** Add `preview.ariaLabels`: "Vertalingsvoorbeeld paneel voor {entity}", "Sluiten", "Vernieuwen"
- [ ] **14.5** Add `preview.description`: "Vertalingen voor alle talen bekijken en beheren"
- [ ] **14.6** Add `preview.keyboardShortcuts.description`: "Druk op R om te vernieuwen, Escape om te sluiten"
- [ ] **14.7** Add `editForm` translations using Dutch formal language
- [ ] **14.8** Add `actions.ariaLabels` with Dutch verbs: Opnieuw proberen, Bekijken, Bewerken, etc.
- [ ] **14.9** Add `statusTable` translations
- [ ] **14.10** Add `languageSelector` translations
- [ ] **14.11** Add `announcements` with Dutch perfect tense: "De vertaling voor {language} is voltooid"
- [ ] **14.12** Verify placeholder syntax is preserved
- [ ] **14.13** Verify JSON syntax is valid
- [ ] **14.14** Run `npm run build` to verify Dutch translations load correctly

---

## 15. Manual Test: Screen Reader Announcements

**Context:** Manually test that ARIA live regions announce status changes correctly using actual screen reader software.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **15.1** Install NVDA screen reader (Windows) or enable VoiceOver (macOS)
- [ ] **15.2** Navigate to translation preview panel
- [ ] **15.3** Trigger a translation operation (re-translate)
- [ ] **15.4** Verify screen reader announces "Translation in progress for [language]"
- [ ] **15.5** Wait for translation to complete
- [ ] **15.6** Verify screen reader announces "Translation completed for [language]"
- [ ] **15.7** Trigger a failed translation (simulate error)
- [ ] **15.8** Verify screen reader announces "Translation failed for [language]" with assertive politeness
- [ ] **15.9** Test in edit form: save translation and verify save status is announced
- [ ] **15.10** Test language selector: select language and verify selection is announced
- [ ] **15.11** Verify announcements don't interrupt user mid-sentence (polite announcements)
- [ ] **15.12** Verify error announcements interrupt appropriately (assertive announcements)

---

## 16. Manual Test: Keyboard Navigation

**Context:** Manually test that all translation management components can be fully operated with keyboard only (no mouse).

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **16.1** Navigate to translation preview panel using only keyboard
- [ ] **16.2** Press Tab to move through all interactive elements in logical order
- [ ] **16.3** Verify tab order follows visual reading order (left-to-right, top-to-bottom)
- [ ] **16.4** Press Shift+Tab to navigate backwards and verify reverse order works
- [ ] **16.5** Press Enter or Space on buttons and verify they activate
- [ ] **16.6** Press ESC key and verify panel closes
- [ ] **16.7** Verify focus returns to trigger element after closing panel
- [ ] **16.8** Open edit modal, verify focus moves to first input field
- [ ] **16.9** Tab through modal fields, verify focus stays trapped within modal
- [ ] **16.10** Press ESC to close modal, verify focus returns to trigger button
- [ ] **16.11** Test keyboard shortcut: press 'r' in panel and verify status refreshes
- [ ] **16.12** Navigate through status table using Tab key
- [ ] **16.13** Test language selector with arrow keys (if radiogroup navigation implemented)

---

## 17. Manual Test: Focus Indicators

**Context:** Manually verify that all focusable elements display visible focus indicators when navigated with keyboard.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **17.1** Navigate to translation preview panel using Tab key
- [ ] **17.2** Verify all buttons show 2px outline with offset when focused
- [ ] **17.3** Verify outline color contrasts with background (minimum 3:1 ratio)
- [ ] **17.4** Verify outline is visible in both light and dark themes (if applicable)
- [ ] **17.5** Click button with mouse and verify focus indicator does NOT appear
- [ ] **17.6** Tab to button with keyboard and verify focus indicator DOES appear (:focus-visible)
- [ ] **17.7** Test form inputs: verify 2px ring appears on focus
- [ ] **17.8** Test language selector buttons: verify focus indicator appears
- [ ] **17.9** Test status badges: verify focus indicator appears (if badges are focusable)
- [ ] **17.10** Enable Windows High Contrast Mode and verify focus indicators remain visible
- [ ] **17.11** Test at 200% zoom level and verify focus indicators don't break layout
- [ ] **17.12** Verify focus indicators have border-radius matching component style

---

## 18. Manual Test: ARIA Labels and Context

**Context:** Manually verify that all ARIA labels provide appropriate context using a screen reader.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **18.1** Enable screen reader (NVDA or VoiceOver)
- [ ] **18.2** Navigate to status badge and verify announcement includes language context
- [ ] **18.3** Verify badge announces "Translation completed for French" (not just "Completed")
- [ ] **18.4** Navigate to retry button and verify it announces "Retry translation for Spanish"
- [ ] **18.5** Navigate to edit button and verify it announces "Edit French translation for item [name]"
- [ ] **18.6** Open translation preview panel and verify region label is announced
- [ ] **18.7** Navigate through language list and verify each item is announced with status
- [ ] **18.8** Open edit modal and verify modal title and description are announced
- [ ] **18.9** Navigate to form fields and verify field labels include language context
- [ ] **18.10** Navigate through status table and verify column headers are announced
- [ ] **18.11** Verify table row headers (item names) are announced when navigating cells
- [ ] **18.12** Verify all icon-only buttons have descriptive aria-labels

---

## 19. Manual Test: Modal Focus Management

**Context:** Manually test that modal dialogs properly manage focus on open and close.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **19.1** Click "Edit" button to open translation edit modal
- [ ] **19.2** Verify focus immediately moves to first input field (title)
- [ ] **19.3** Tab through all form fields and verify focus stays within modal
- [ ] **19.4** Try to Tab out of modal and verify focus wraps back to beginning (focus trap)
- [ ] **19.5** Press ESC key to close modal
- [ ] **19.6** Verify focus returns to the "Edit" button that opened the modal
- [ ] **19.7** Open modal again, click outside modal to close
- [ ] **19.8** Verify focus returns to trigger button
- [ ] **19.9** Open modal, click "Cancel" button
- [ ] **19.10** Verify focus returns to trigger button
- [ ] **19.11** Open modal, fill in fields, click "Save"
- [ ] **19.12** Verify focus handling after successful save (returns to trigger or shows confirmation)

---

## 20. Automated Test: Run Axe-Core Accessibility Audit

**Context:** Run automated accessibility testing using axe-core to detect WCAG violations in translation management components.

**Files to verify:** All translation management pages

**Estimated effort:** 1 story point

- [ ] **20.1** Install axe-core browser extension or @axe-core/react dev dependency
- [ ] **20.2** Navigate to translation preview panel page
- [ ] **20.3** Run axe-core audit and capture results
- [ ] **20.4** Verify no critical violations (color contrast, missing labels, etc.)
- [ ] **20.5** Address any serious violations found
- [ ] **20.6** Navigate to translation edit form modal
- [ ] **20.7** Run axe-core audit on modal
- [ ] **20.8** Verify no violations related to form labels or focus management
- [ ] **20.9** Navigate to translation status table
- [ ] **20.10** Run axe-core audit on table
- [ ] **20.11** Verify no violations related to table semantics
- [ ] **20.12** Document any acceptable violations with justification
- [ ] **20.13** Create summary report of accessibility audit results

---

## 21. Manual Test: i18n Verification for ARIA Labels

**Context:** Verify that all ARIA labels translate correctly in all 6 supported locales.

**Files to verify:** N/A (manual testing)

**Estimated effort:** 1 story point

- [ ] **21.1** Set UI language to English and inspect ARIA labels in browser DevTools
- [ ] **21.2** Verify status badge aria-label shows "Translation completed for French"
- [ ] **21.3** Switch to Spanish and verify badge shows "Traducción completada para French"
- [ ] **21.4** Verify all button aria-labels translate to Spanish
- [ ] **21.5** Switch to French and verify all ARIA labels translate correctly
- [ ] **21.6** Switch to German and verify ARIA labels use proper German grammar
- [ ] **21.7** Switch to Italian and verify ARIA labels translate correctly
- [ ] **21.8** Switch to Dutch and verify ARIA labels translate correctly
- [ ] **21.9** For each language, trigger status announcement and verify it translates
- [ ] **21.10** Check browser console for any missing translation key warnings
- [ ] **21.11** Verify placeholder values ({language}, {entity}) are replaced correctly in all locales
- [ ] **21.12** Document any translation issues or missing keys

---

## 22. Run Full Type Check

**Context:** Verify that all TypeScript types are correct across all modified accessibility files.

**Files to verify:** All modified TypeScript files

**Estimated effort:** 1 story point

- [ ] **22.1** Run `npx tsc --noEmit` from project root
- [ ] **22.2** Verify no errors in TranslationStatusAnnouncer.tsx
- [ ] **22.3** Verify no errors in TranslationStatusBadge.tsx
- [ ] **22.4** Verify no errors in TranslationPreviewPanel.tsx
- [ ] **22.5** Verify no errors in TranslationEditForm.tsx
- [ ] **22.6** Verify no errors in TranslationStatusTable.tsx
- [ ] **22.7** Verify no errors in TranslationLanguageSelector.tsx
- [ ] **22.8** Fix any type mismatches related to ARIA props (aria-label, aria-describedby, etc.)
- [ ] **22.9** Fix any type issues with useRef hooks
- [ ] **22.10** Verify all event handler types are correct (KeyboardEvent, FocusEvent)
- [ ] **22.11** Run `npx tsc --noEmit` again and verify 0 errors

---

## 23. Run ESLint with Accessibility Plugin

**Context:** Run ESLint with jsx-a11y plugin to catch common accessibility issues in JSX.

**Files to verify:** All modified files

**Estimated effort:** 1 story point

- [ ] **23.1** Run `npm run lint` from project root
- [ ] **23.2** Review any a11y warnings in TranslationStatusBadge.tsx
- [ ] **23.3** Review any a11y warnings in TranslationPreviewPanel.tsx
- [ ] **23.4** Review any a11y warnings in TranslationEditForm.tsx
- [ ] **23.5** Fix missing label warnings (ensure all form inputs have labels)
- [ ] **23.6** Fix missing aria-label warnings on icon-only buttons
- [ ] **23.7** Fix any role attribute warnings (verify roles are valid ARIA roles)
- [ ] **23.8** Fix any aria-* attribute warnings (verify ARIA attributes are valid)
- [ ] **23.9** Address any keyboard accessibility warnings
- [ ] **23.10** Run `npm run lint` again and verify all a11y warnings are resolved

---

## 24. Run All Tests and Build

**Context:** Run the full test suite and production build to ensure no regressions and all new code works correctly.

**Files to verify:** Build output and test results

**Estimated effort:** 1 story point

- [ ] **24.1** Run `npm test` to execute all tests
- [ ] **24.2** Verify all existing tests continue to pass
- [ ] **24.3** Verify no console errors or warnings during test execution
- [ ] **24.4** Run `npm run build` to create production build
- [ ] **24.5** Verify build completes without errors
- [ ] **24.6** Check for build warnings related to accessibility imports
- [ ] **24.7** Verify accessibility.css is included in build output
- [ ] **24.8** Verify all translation JSON files load correctly in build
- [ ] **24.9** Run `npm start` to test production build locally
- [ ] **24.10** Navigate to translation pages and verify focus indicators work in production
- [ ] **24.11** Test with screen reader in production build
- [ ] **24.12** Stop production server after verification

---

## 25. Create Accessibility Testing Documentation

**Context:** Document all accessibility testing performed and create a checklist for future testing.

**Files to create:**
- `/docs/accessibility-testing-checklist.md` (NEW)

**Estimated effort:** 1 story point

- [ ] **25.1** Create new file `/docs/accessibility-testing-checklist.md`
- [ ] **25.2** Add header with title "Translation Management Accessibility Testing Checklist"
- [ ] **25.3** Add section "Automated Testing" with axe-core audit steps
- [ ] **25.4** Add section "Screen Reader Testing" with NVDA/VoiceOver test scenarios
- [ ] **25.5** Add section "Keyboard Navigation Testing" with keyboard-only navigation scenarios
- [ ] **25.6** Add section "Focus Management Testing" with modal focus test scenarios
- [ ] **25.7** Add section "ARIA Label Verification" with screen reader context tests
- [ ] **25.8** Add section "Focus Indicator Verification" with visual focus tests
- [ ] **25.9** Add section "i18n Accessibility" with multi-locale ARIA label tests
- [ ] **25.10** Add section "Known Issues" for documenting any acceptable violations
- [ ] **25.11** Add section "Testing Tools" listing NVDA, VoiceOver, axe-core, etc.
- [ ] **25.12** Add last tested date and tester name fields
- [ ] **25.13** Commit documentation to repository

---

## Status: PENDING

**Last Modified:** 2026-01-23 13:00

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-007**: TranslationPreviewPanel Component (must exist before adding accessibility)
- **REQ-E05-008**: TranslationEditForm Component (must exist before adding focus management)
- **REQ-E05-009**: TranslationStatusTable Component (must exist before adding table semantics)
- **REQ-E05-010**: TranslationLanguageSelector Component (must exist before adding radiogroup semantics)
- **REQ-E05-030**: Loading States and Error Handling (loading indicators need ARIA attributes)

### Blocks (Requires This First)
- None (this is a polish/enhancement task that doesn't block other features)

### Parallel Safety
- **Files modified**: 1 new component, 1 new CSS file, 5 TranslationManagement components, 6 locale files, dashboard layout
- **Conflicts with**: Any task modifying the same TranslationManagement components or locale files
- **Safe to parallelize with**: Backend API tasks, other UI pages (items/articles editors)

---

## Authorized Files for Modification

### New Files to Create
1. `/src/components/TranslationManagement/TranslationStatusAnnouncer.tsx` - ARIA live region component
2. `/src/styles/accessibility.css` - Custom focus styles
3. `/docs/accessibility-testing-checklist.md` - Testing documentation

### Existing Files to Modify
1. `/src/components/TranslationManagement/TranslationStatusBadge.tsx` - Add ARIA labels
2. `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` - Add keyboard nav
3. `/src/components/TranslationManagement/TranslationEditForm/TranslationEditForm.tsx` - Add focus management
4. `/src/components/TranslationManagement/TranslationStatusTable/TranslationStatusTable.tsx` - Add table semantics
5. `/src/components/TranslationManagement/TranslationLanguageSelector/TranslationLanguageSelector.tsx` - Add radiogroup
6. `/src/app/dashboard2/layout.tsx` - Import accessibility.css
7. `/messages/en.json` - Add translationManagement ARIA labels
8. `/messages/es.json` - Add translationManagement ARIA labels
9. `/messages/fr.json` - Add translationManagement ARIA labels
10. `/messages/de.json` - Add translationManagement ARIA labels
11. `/messages/it.json` - Add translationManagement ARIA labels
12. `/messages/nl.json` - Add translationManagement ARIA labels

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ TranslationStatusAnnouncer component created for ARIA live announcements
2. ✅ All status badges have descriptive aria-label with language context
3. ✅ Icons set to aria-hidden="true" to prevent double-announcement
4. ✅ TranslationPreviewPanel uses role="region" and role="list" semantics
5. ✅ Panel supports keyboard navigation (Tab, Shift+Tab, ESC)
6. ✅ Panel has optional keyboard shortcut ('r' for refresh)
7. ✅ TranslationEditForm focuses first input on modal open
8. ✅ Modal properly traps focus within dialog
9. ✅ Modal returns focus to trigger element on close
10. ✅ All form fields have proper labels with htmlFor attributes
11. ✅ Form validation errors use role="alert" for immediate announcement
12. ✅ TranslationStatusTable uses semantic table markup (th scope, caption)
13. ✅ Table action buttons have descriptive aria-labels with item context
14. ✅ TranslationLanguageSelector uses role="radiogroup" pattern
15. ✅ Language buttons use role="radio" with aria-checked
16. ✅ Language selection changes are announced via ARIA live region
17. ✅ Focus indicators visible on all focusable elements (2px outline)
18. ✅ Focus indicators use :focus-visible (keyboard only, not mouse)
19. ✅ Focus indicators meet 3:1 contrast ratio (WCAG 2.1 AA)
20. ✅ High contrast mode support added
21. ✅ Reduced motion support added (disable animations)
22. ✅ All ARIA labels translated in all 6 locales
23. ✅ Placeholder interpolation works correctly ({language}, {entity}, {item})
24. ✅ Axe-core audit passes with no critical violations
25. ✅ Screen reader testing confirms announcements work (NVDA/VoiceOver)
26. ✅ Keyboard navigation works for all components
27. ✅ No TypeScript compilation errors
28. ✅ No ESLint a11y warnings
29. ✅ Production build succeeds
30. ✅ Accessibility testing documentation created

---

**Document Status**: PENDING
**Last Modified**: 2026-01-23 13:00
