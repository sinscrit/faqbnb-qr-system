# REQ-372: Update Main ItemCreationWorkflow Component - Detailed Task Breakdown

**Last Modified:** 2026-01-19 19:15:00 UTC
**Document Type:** Detailed Task Breakdown
**Epic:** Epic 2 - Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.2
**Size:** L (Large)
**Priority:** P1 - High
**Overview Document:** [REQ-372-update-main-itemcreationworkflow-component-overview.md](./REQ-372-update-main-itemcreationworkflow-component-overview.md)

---

## Executive Summary

This document provides granular, actionable tasks for internationalizing the `ItemCreationWorkflow.tsx` component. The component is ~814 lines and serves as the primary orchestrator for the multi-step item creation workflow. All hardcoded English strings must be replaced with translation keys from the `workflow` namespace using next-intl's `useTranslations` hook.

**Estimated Total Effort:** 5-9 hours across 8 tasks

---

## Prerequisites Checklist

Before starting implementation, verify the following are complete:

- [ ] Epic 1 Foundation complete (next-intl installed and configured)
- [ ] IntlProvider wrapping the application in `/src/app/layout.tsx`
- [ ] Translation files exist at `/messages/*.json` (en, fr, es, de, nl, it)
- [ ] Task 2C.1 complete (workflow namespace structure created in translation files)
- [ ] Branch created from latest main: `git checkout -b feat/l10n-req-372-workflow-component`

---

## Task Breakdown

### Task 1: Add useTranslations Import and Hook Initialization

**Story Points:** 1
**Estimated Time:** 15 minutes
**Dependencies:** None (first task)

#### 1.1 Description

Add the `useTranslations` hook import and initialize it within the `ItemCreationWorkflow` component to access the `workflow` namespace translations.

#### 1.2 Implementation Steps

1. **Open file:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

2. **Add import statement** after existing imports (around line 37):
   ```typescript
   import { useTranslations } from 'next-intl';
   ```

3. **Initialize hook** inside the `ItemCreationWorkflow` function, after the destructured props and before the `useWorkflowState` call (around line 132):
   ```typescript
   // i18n translations for workflow namespace
   const t = useTranslations('workflow');
   ```

#### 1.3 Files Modified

| File | Line Numbers | Change Type |
|------|--------------|-------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~37 | Add import |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~132 | Add hook initialization |

#### 1.4 Verification

- [ ] No TypeScript compilation errors
- [ ] Component renders without errors
- [ ] `t` function is accessible throughout component scope

---

### Task 2: Add Workflow Namespace Translation Keys to English File

**Story Points:** 2
**Estimated Time:** 45 minutes
**Dependencies:** None (can run in parallel with Task 1)

#### 2.1 Description

Add all required translation keys for the `ItemCreationWorkflow` component to `/messages/en.json` under the `workflow` namespace.

#### 2.2 Implementation Steps

1. **Open file:** `/messages/en.json`

2. **Add workflow namespace** with all required keys (add after the `language` section):

```json
{
  "workflow": {
    "header": {
      "step": "Step {current} of {total}",
      "back": "Go back to previous step",
      "exit": "Exit workflow"
    },
    "skipLink": "Skip to main content",
    "placeholder": {
      "title": "{stepName}",
      "description": "Step component placeholder - Implementation coming in later phases",
      "continueButton": "Continue (Test)"
    },
    "status": {
      "generatingPdf": "Generating PDF...",
      "sendingToPrinter": "Sending to printer..."
    },
    "steps": {
      "roomSelection": "Select a room",
      "itemTypeSelection": "Choose item type",
      "specificItemSelection": "Name your item",
      "purposeSelection": "Select purpose",
      "contentTypeSelection": "Choose content type",
      "mediaCapture": "Capture content",
      "contentCreation": "Create content",
      "previewSave": "Preview and save",
      "nextAction": "Choose next action",
      "sessionSummary": "Session summary"
    },
    "announcements": {
      "stepProgress": "Step {current} of {total}: {stepName}"
    },
    "recovery": {
      "title": "Session Recovery",
      "itemsFound": "{count, plural, one {# item} other {# items}} found",
      "contentNeedingReUpload": "{count, plural, one {# item needs} other {# items need}} re-upload",
      "continueButton": "Continue Session",
      "startFreshButton": "Start Fresh",
      "dismissButton": "Dismiss"
    },
    "dialogs": {
      "confirmExit": {
        "title": "Exit Item Creation?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageItems": "You have {count} {count, plural, one {item} other {items}} in this session. Are you sure you want to exit?",
        "stayButton": "Stay",
        "exitButton": "Exit"
      }
    },
    "print": {
      "processing": "Processing...",
      "generatingPdf": "Generating PDF...",
      "sendingToPrinter": "Sending to printer..."
    },
    "debug": {
      "editNotImplemented": "Edit item not yet implemented",
      "nextActionNoItem": "next-action reached without saved item, redirecting to session-summary",
      "editInstructions": "Edit instructions requested for",
      "qrCodesGenerated": "QR codes generated"
    }
  }
}
```

#### 2.3 Files Modified

| File | Change Type |
|------|-------------|
| `/messages/en.json` | Add workflow namespace |

#### 2.4 Verification

- [ ] JSON is valid (no syntax errors)
- [ ] All keys follow `namespace.component.element.variant` pattern
- [ ] ICU message format used correctly for pluralization
- [ ] Variable interpolation syntax is correct (`{variable}`)

---

### Task 3: Update StepPlaceholder Component with Translations

**Story Points:** 1
**Estimated Time:** 20 minutes
**Dependencies:** Tasks 1, 2

#### 3.1 Description

Update the internal `StepPlaceholder` component to receive and use translations via props.

#### 3.2 Implementation Steps

1. **Update interface** (around line 68-72):
   ```typescript
   interface StepPlaceholderProps {
     step: string;
     onNext?: () => void;
     canNext?: boolean;
     t: ReturnType<typeof useTranslations<'workflow'>>;
   }
   ```

2. **Update function signature and usage** (around line 74-111):
   ```typescript
   function StepPlaceholder({ step, onNext, canNext, t }: StepPlaceholderProps) {
     // Format step name for display
     const formattedStepName = step
       .split('-')
       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
       .join(' ');

     return (
       <div className="flex flex-col items-center justify-center flex-1 p-8">
         <div className="text-center">
           <h2 className="text-2xl font-semibold text-[#222222] mb-2">
             {formattedStepName}
           </h2>
           <p className="text-[#717171] mb-8">
             {t('placeholder.description')}
           </p>

           {/* Temporary navigation for testing */}
           {onNext && (
             <button
               type="button"
               onClick={onNext}
               disabled={!canNext}
               className={cn(
                 "px-6 py-3 rounded-lg font-medium text-white",
                 "transition-colors duration-150",
                 canNext
                   ? "bg-[#FF385C] hover:bg-[#E31C5F]"
                   : "bg-gray-300 cursor-not-allowed"
               )}
             >
               {t('placeholder.continueButton')}
             </button>
           )}
         </div>
       </div>
     );
   }
   ```

3. **Update StepPlaceholder call in renderCurrentStep** (around line 728):
   ```typescript
   return <StepPlaceholder step={state.currentStep} {...commonProps} t={t} />;
   ```

#### 3.3 Files Modified

| File | Line Numbers | Change Type |
|------|--------------|-------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~68-72 | Update interface |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~74-111 | Update component |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~728 | Update call site |

#### 3.4 Verification

- [ ] StepPlaceholder renders without errors
- [ ] Description text uses translation key
- [ ] Continue button label uses translation key

---

### Task 4: Update Skip Link with Translation

**Story Points:** 1
**Estimated Time:** 10 minutes
**Dependencies:** Tasks 1, 2

#### 4.1 Description

Replace the hardcoded "Skip to main content" text with a translation key.

#### 4.2 Implementation Steps

1. **Locate skip link** in the JSX return (around line 735-745)

2. **Replace hardcoded text**:

   **Before:**
   ```tsx
   <a
     href="#main-content"
     className={cn(
       'sr-only focus:not-sr-only',
       'absolute top-4 left-4 z-50',
       'px-4 py-2 bg-[#FF385C] text-white rounded-lg',
       'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]'
     )}
   >
     Skip to main content
   </a>
   ```

   **After:**
   ```tsx
   <a
     href="#main-content"
     className={cn(
       'sr-only focus:not-sr-only',
       'absolute top-4 left-4 z-50',
       'px-4 py-2 bg-[#FF385C] text-white rounded-lg',
       'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]'
     )}
   >
     {t('skipLink')}
   </a>
   ```

#### 4.3 Files Modified

| File | Line Numbers | Change Type |
|------|--------------|-------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~743-744 | Replace text |

#### 4.4 Verification

- [ ] Skip link renders translated text
- [ ] Skip link is still visually hidden (sr-only) but focusable

---

### Task 5: Update Print Status Messages with Translations

**Story Points:** 1
**Estimated Time:** 15 minutes
**Dependencies:** Tasks 1, 2

#### 5.1 Description

Replace hardcoded print status messages ("Generating PDF...", "Sending to printer...") with translation keys.

#### 5.2 Implementation Steps

1. **Update handleGeneratePDFFromPanel** (around line 445):

   **Before:**
   ```typescript
   setPrintStatus('Generating PDF...');
   ```

   **After:**
   ```typescript
   setPrintStatus(t('status.generatingPdf'));
   ```

2. **Update handlePrintDirectFromPanel** (around line 472):

   **Before:**
   ```typescript
   setPrintStatus('Sending to printer...');
   ```

   **After:**
   ```typescript
   setPrintStatus(t('status.sendingToPrinter'));
   ```

#### 5.3 Files Modified

| File | Line Numbers | Change Type |
|------|--------------|-------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~445 | Replace string |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~472 | Replace string |

#### 5.4 Verification

- [ ] Print status displays translated "Generating PDF..." text
- [ ] Print status displays translated "Sending to printer..." text

---

### Task 6: Create Translated Step Names and Update Accessibility Announcements

**Story Points:** 2
**Estimated Time:** 45 minutes
**Dependencies:** Tasks 1, 2

#### 6.1 Description

Create a memoized map of translated step names and update the accessibility announcement effect to use translations.

#### 6.2 Implementation Steps

1. **Add useMemo import** if not already present (around line 37):
   ```typescript
   import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
   ```
   (Note: `useMemo` is already imported in the current code)

2. **Create translatedStepNames map** after the `t` hook initialization (around line 134):
   ```typescript
   // Translated step names for accessibility announcements
   const translatedStepNames = useMemo(() => ({
     'room-selection': t('steps.roomSelection'),
     'item-type-selection': t('steps.itemTypeSelection'),
     'specific-item-selection': t('steps.specificItemSelection'),
     'purpose-selection': t('steps.purposeSelection'),
     'content-type-selection': t('steps.contentTypeSelection'),
     'media-capture': t('steps.mediaCapture'),
     'content-creation': t('steps.contentCreation'),
     'preview-save': t('steps.previewSave'),
     'next-action': t('steps.nextAction'),
     'session-summary': t('steps.sessionSummary'),
   }), [t]);
   ```

3. **Update the announcement effect** (around line 221-251):

   **Before:**
   ```typescript
   useEffect(() => {
     // Only announce if step actually changed
     if (previousStepRef.current !== state.currentStep) {
       const stepName = STEP_NAMES[state.currentStep] || state.currentStep;

       // Only announce step numbers for user-visible steps
       // Post-workflow screens don't get step number announcements
       if (!isPostWorkflow) {
         const announcement = getStepAnnouncement(displayStepIndex + 1, displayTotalSteps, stepName);
         announce(announcement);
       } else {
         // For post-workflow, just announce the screen name
         announce(stepName);
       }
       // ... rest of effect
     }
   }, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce]);
   ```

   **After:**
   ```typescript
   useEffect(() => {
     // Only announce if step actually changed
     if (previousStepRef.current !== state.currentStep) {
       const stepName = translatedStepNames[state.currentStep as keyof typeof translatedStepNames] || state.currentStep;

       // Only announce step numbers for user-visible steps
       // Post-workflow screens don't get step number announcements
       if (!isPostWorkflow) {
         const announcement = t('announcements.stepProgress', {
           current: displayStepIndex + 1,
           total: displayTotalSteps,
           stepName
         });
         announce(announcement);
       } else {
         // For post-workflow, just announce the screen name
         announce(stepName);
       }

       // Focus main content area for keyboard navigation
       if (mainContentRef.current) {
         // Find the first heading in the step content and focus it
         const heading = mainContentRef.current.querySelector('h2, h3, [role="heading"]');
         if (heading && heading instanceof HTMLElement) {
           // Make heading focusable if it isn't already
           if (!heading.hasAttribute('tabindex')) {
             heading.setAttribute('tabindex', '-1');
           }
           heading.focus();
         }
       }

       previousStepRef.current = state.currentStep;
     }
   }, [state.currentStep, displayStepIndex, displayTotalSteps, isPostWorkflow, announce, translatedStepNames, t]);
   ```

4. **Remove unused import** from accessibility.ts if `STEP_NAMES` is no longer needed elsewhere in this file (around line 56):

   **Before:**
   ```typescript
   import { useAnnounce, STEP_NAMES, getStepAnnouncement } from './utils/accessibility';
   ```

   **After:**
   ```typescript
   import { useAnnounce } from './utils/accessibility';
   ```

   Note: Only remove `STEP_NAMES` and `getStepAnnouncement` if they're no longer used anywhere in the component after this refactor.

#### 6.3 Files Modified

| File | Line Numbers | Change Type |
|------|--------------|-------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~134 | Add memoized translations |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~221-251 | Update effect |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | ~56 | Potentially update import |

#### 6.4 Verification

- [ ] Screen reader announces steps with translated text
- [ ] Announcement format: "Step X of Y: [translated step name]"
- [ ] Post-workflow screens announce only the translated name (no step number)
- [ ] Language switching updates announcements immediately

---

### Task 7: Add Translations to All Non-English Language Files

**Story Points:** 2
**Estimated Time:** 60 minutes
**Dependencies:** Task 2

#### 7.1 Description

Add translated versions of all workflow namespace keys to French, Spanish, German, Dutch, and Italian translation files.

#### 7.2 Implementation Steps

1. **Open and update each language file** with the workflow namespace:

**French (`/messages/fr.json`):**
```json
{
  "workflow": {
    "header": {
      "step": "Etape {current} sur {total}",
      "back": "Retourner a l'etape precedente",
      "exit": "Quitter le flux"
    },
    "skipLink": "Passer au contenu principal",
    "placeholder": {
      "title": "{stepName}",
      "description": "Composant d'etape temporaire - Implementation dans les phases suivantes",
      "continueButton": "Continuer (Test)"
    },
    "status": {
      "generatingPdf": "Generation du PDF...",
      "sendingToPrinter": "Envoi a l'imprimante..."
    },
    "steps": {
      "roomSelection": "Selectionner une piece",
      "itemTypeSelection": "Choisir le type d'article",
      "specificItemSelection": "Nommer votre article",
      "purposeSelection": "Selectionner l'objectif",
      "contentTypeSelection": "Choisir le type de contenu",
      "mediaCapture": "Capturer le contenu",
      "contentCreation": "Creer le contenu",
      "previewSave": "Apercu et sauvegarde",
      "nextAction": "Choisir la prochaine action",
      "sessionSummary": "Resume de la session"
    },
    "announcements": {
      "stepProgress": "Etape {current} sur {total}: {stepName}"
    }
  }
}
```

**Spanish (`/messages/es.json`):**
```json
{
  "workflow": {
    "header": {
      "step": "Paso {current} de {total}",
      "back": "Volver al paso anterior",
      "exit": "Salir del flujo"
    },
    "skipLink": "Saltar al contenido principal",
    "placeholder": {
      "title": "{stepName}",
      "description": "Componente de paso temporal - Implementacion en fases posteriores",
      "continueButton": "Continuar (Prueba)"
    },
    "status": {
      "generatingPdf": "Generando PDF...",
      "sendingToPrinter": "Enviando a la impresora..."
    },
    "steps": {
      "roomSelection": "Seleccionar una habitacion",
      "itemTypeSelection": "Elegir tipo de articulo",
      "specificItemSelection": "Nombrar tu articulo",
      "purposeSelection": "Seleccionar proposito",
      "contentTypeSelection": "Elegir tipo de contenido",
      "mediaCapture": "Capturar contenido",
      "contentCreation": "Crear contenido",
      "previewSave": "Vista previa y guardar",
      "nextAction": "Elegir siguiente accion",
      "sessionSummary": "Resumen de la sesion"
    },
    "announcements": {
      "stepProgress": "Paso {current} de {total}: {stepName}"
    }
  }
}
```

**German (`/messages/de.json`):**
```json
{
  "workflow": {
    "header": {
      "step": "Schritt {current} von {total}",
      "back": "Zuruck zum vorherigen Schritt",
      "exit": "Workflow beenden"
    },
    "skipLink": "Zum Hauptinhalt springen",
    "placeholder": {
      "title": "{stepName}",
      "description": "Temporarer Schritt-Platzhalter - Implementierung in spateren Phasen",
      "continueButton": "Weiter (Test)"
    },
    "status": {
      "generatingPdf": "PDF wird erstellt...",
      "sendingToPrinter": "An Drucker senden..."
    },
    "steps": {
      "roomSelection": "Raum auswahlen",
      "itemTypeSelection": "Artikeltyp wahlen",
      "specificItemSelection": "Artikel benennen",
      "purposeSelection": "Zweck auswahlen",
      "contentTypeSelection": "Inhaltstyp wahlen",
      "mediaCapture": "Inhalt aufnehmen",
      "contentCreation": "Inhalt erstellen",
      "previewSave": "Vorschau und speichern",
      "nextAction": "Nachste Aktion wahlen",
      "sessionSummary": "Sitzungszusammenfassung"
    },
    "announcements": {
      "stepProgress": "Schritt {current} von {total}: {stepName}"
    }
  }
}
```

**Dutch (`/messages/nl.json`):**
```json
{
  "workflow": {
    "header": {
      "step": "Stap {current} van {total}",
      "back": "Terug naar vorige stap",
      "exit": "Workflow verlaten"
    },
    "skipLink": "Ga naar hoofdinhoud",
    "placeholder": {
      "title": "{stepName}",
      "description": "Tijdelijke stap placeholder - Implementatie in latere fases",
      "continueButton": "Doorgaan (Test)"
    },
    "status": {
      "generatingPdf": "PDF genereren...",
      "sendingToPrinter": "Verzenden naar printer..."
    },
    "steps": {
      "roomSelection": "Selecteer een kamer",
      "itemTypeSelection": "Kies artikeltype",
      "specificItemSelection": "Benoem je artikel",
      "purposeSelection": "Selecteer doel",
      "contentTypeSelection": "Kies inhoudstype",
      "mediaCapture": "Vastleggen inhoud",
      "contentCreation": "Inhoud maken",
      "previewSave": "Voorbeeld en opslaan",
      "nextAction": "Kies volgende actie",
      "sessionSummary": "Sessie samenvatting"
    },
    "announcements": {
      "stepProgress": "Stap {current} van {total}: {stepName}"
    }
  }
}
```

**Italian (`/messages/it.json`):**
```json
{
  "workflow": {
    "header": {
      "step": "Passo {current} di {total}",
      "back": "Torna al passo precedente",
      "exit": "Esci dal flusso"
    },
    "skipLink": "Vai al contenuto principale",
    "placeholder": {
      "title": "{stepName}",
      "description": "Componente passo temporaneo - Implementazione nelle fasi successive",
      "continueButton": "Continua (Test)"
    },
    "status": {
      "generatingPdf": "Generazione PDF...",
      "sendingToPrinter": "Invio alla stampante..."
    },
    "steps": {
      "roomSelection": "Seleziona una stanza",
      "itemTypeSelection": "Scegli il tipo di articolo",
      "specificItemSelection": "Nomina il tuo articolo",
      "purposeSelection": "Seleziona lo scopo",
      "contentTypeSelection": "Scegli il tipo di contenuto",
      "mediaCapture": "Cattura contenuto",
      "contentCreation": "Crea contenuto",
      "previewSave": "Anteprima e salva",
      "nextAction": "Scegli la prossima azione",
      "sessionSummary": "Riepilogo sessione"
    },
    "announcements": {
      "stepProgress": "Passo {current} di {total}: {stepName}"
    }
  }
}
```

#### 7.3 Files Modified

| File | Change Type |
|------|-------------|
| `/messages/fr.json` | Add workflow namespace |
| `/messages/es.json` | Add workflow namespace |
| `/messages/de.json` | Add workflow namespace |
| `/messages/nl.json` | Add workflow namespace |
| `/messages/it.json` | Add workflow namespace |

#### 7.4 Verification

- [ ] All JSON files are valid (no syntax errors)
- [ ] Key structures match exactly across all 6 files
- [ ] Translations are contextually appropriate
- [ ] Variable interpolation syntax preserved (`{current}`, `{total}`, `{stepName}`)
- [ ] ICU pluralization format preserved where used

---

### Task 8: Testing and Verification

**Story Points:** 2
**Estimated Time:** 60-90 minutes
**Dependencies:** Tasks 1-7

#### 8.1 Description

Comprehensive testing to verify all translations work correctly across all supported languages.

#### 8.2 Implementation Steps

##### 8.2.1 Build Verification

```bash
# Run TypeScript compilation
npm run build

# Check for any type errors
npm run type-check
```

##### 8.2.2 Console Warning Check

1. Start the development server: `npm run dev`
2. Navigate to the Item Creation Workflow
3. Open browser DevTools Console
4. Verify NO warnings like:
   - "Missing translation for key: workflow...."
   - "Invalid message format..."

##### 8.2.3 Visual Verification (All Languages)

For each language (en, fr, es, de, nl, it):

1. Change language preference
2. Navigate to Item Creation Workflow
3. Verify the following display correctly:
   - [ ] Skip link text (focus the skip link by pressing Tab)
   - [ ] StepPlaceholder description (if rendered)
   - [ ] StepPlaceholder continue button text
   - [ ] Print status messages during print flow
   - [ ] Step announcements (check via screen reader or ARIA live region)

##### 8.2.4 Screen Reader Testing

1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate through workflow steps
3. Verify announcements are in the correct language:
   - "Step 1 of 8: [translated step name]"
   - Post-workflow screens announce just the name

##### 8.2.5 Layout Verification

Check that longer translations (especially German and Dutch) don't break layouts:

- [ ] Skip link fits when focused
- [ ] StepPlaceholder text doesn't overflow
- [ ] Print status messages fit within status area

#### 8.3 Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| T1 | Open workflow in English | All text displays in English |
| T2 | Open workflow in French | All text displays in French |
| T3 | Open workflow in Spanish | All text displays in Spanish |
| T4 | Open workflow in German | All text displays in German |
| T5 | Open workflow in Dutch | All text displays in Dutch |
| T6 | Open workflow in Italian | All text displays in Italian |
| T7 | Navigate through all 8 steps | Announcements made for each step |
| T8 | Switch language mid-workflow | All visible text updates immediately |
| T9 | Print flow - generate PDF | Status shows "Generating PDF..." in current language |
| T10 | Print flow - direct print | Status shows "Sending to printer..." in current language |
| T11 | Tab to skip link | Skip link displays translated text |
| T12 | Check console for warnings | No missing translation warnings |

#### 8.4 Verification Checklist

- [ ] TypeScript builds without errors
- [ ] No console warnings for missing translations
- [ ] All 6 languages display correctly
- [ ] Screen reader announcements work in all languages
- [ ] Layout remains intact with longer translations
- [ ] Language switching works correctly mid-workflow

---

## Files Summary

### Files to Create

None.

### Files to Modify

| File | Primary Changes |
|------|-----------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add useTranslations, update StepPlaceholder, skip link, print status, announcements |
| `/messages/en.json` | Add workflow namespace |
| `/messages/fr.json` | Add workflow namespace (French) |
| `/messages/es.json` | Add workflow namespace (Spanish) |
| `/messages/de.json` | Add workflow namespace (German) |
| `/messages/nl.json` | Add workflow namespace (Dutch) |
| `/messages/it.json` | Add workflow namespace (Italian) |

### Files Out of Scope

These files are covered by other tasks:

| File | Covered By Task |
|------|-----------------|
| `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Task 2C.11 |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Task 2C.12 |
| `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Task 2C.11 |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Task 2C.11 |
| `/src/components/ItemCreationWorkflow/utils/accessibility.ts` (STEP_NAMES) | Task 2C.11 or separate accessibility task |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Task 2C.1 |

---

## Acceptance Criteria Checklist

From the original REQ-372 requirements:

- [ ] The ItemCreationWorkflow component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] All step title strings use translation keys from the workflow.steps subsection
- [ ] Progress indicators showing item counts use translated strings with dynamic number interpolation
- [ ] All navigation button labels use workflow.buttons translation keys
- [ ] Session status messages use workflow.messages translation keys
- [ ] No hardcoded English strings remain in the component's JSX or logic
- [ ] Dynamic content properly uses next-intl's plural rules and variable substitution
- [ ] The component functions identically in all six supported languages
- [ ] Changing language preference mid-workflow updates all visible text without disrupting state
- [ ] All ARIA labels and accessibility attributes use translated strings
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] Console shows no missing translation warnings when workflow is viewed in English
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] Manual testing confirms workflow completion in all six languages produces correct results

---

## Rollback Plan

If critical issues are discovered after deployment:

1. Revert the commit: `git revert <commit-hash>`
2. The component will fall back to the previous hardcoded English strings
3. Translation files can remain in place (unused keys don't cause issues)

---

## References

- [Overview Document: REQ-372-update-main-itemcreationworkflow-component-overview.md](./REQ-372-update-main-itemcreationworkflow-component-overview.md)
- [Implementation Plan: Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request #372 in gen_requests_epic2.md](./gen_requests_epic2.md)
- [next-intl Documentation: Client Components](https://next-intl-docs.vercel.app/docs/environments/server-client-components)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Source Component: /src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx](../src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx)

---

*Document generated for FAQBNB Localization Epic 2 - Task 2C.2*
*Last Updated: 2026-01-19 19:15:00 UTC*
