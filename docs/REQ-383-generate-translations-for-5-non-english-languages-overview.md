# REQ-383: Generate Translations for Item Creation Workflow (5 Non-English Languages)

**Document Created:** 2026-01-19 18:30:00 UTC
**Last Modified:** 2026-01-19 18:30:00 UTC
**Document Type:** Implementation Overview
**Request Type:** ENHANCEMENT
**Size Estimate:** M (Medium)
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.13
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## 1. Summary

Generate high-quality translations for all Item Creation Workflow namespace (`workflow`) keys in the English translation file (`/messages/en.json`) into five non-English languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl). This task completes the localization of the largest component set in Epic 2 - the Item Creation Workflow with 86+ files containing approximately 500 unique strings.

This is the final translation task in Sub-Epic 2C, completing translation coverage for all workflow UI strings across rooms, item types, purposes, content types, dialogs, and shared components.

---

## 2. Current State Analysis

### 2.1 Existing Translation Files

All six translation files exist in `/messages/`:
- `en.json` - English (source of truth)
- `de.json` - German
- `es.json` - Spanish
- `fr.json` - French
- `it.json` - Italian
- `nl.json` - Dutch

### 2.2 Current Namespace Structure

The current English translation file contains these namespaces:
- `common` - 35 keys (completed)
- `auth` - 18 keys (completed)
- `dashboard` - 17 keys (completed)
- `items` - 26 keys (completed)
- `errors` - 17 keys (completed)
- `language` - 10 keys (completed)

### 2.3 Workflow Namespace Gap

The `workflow` namespace needs to be created (Task 2C.1) or expanded with comprehensive translations for the Item Creation Workflow. Based on codebase analysis, the workflow components contain approximately 150-180 unique translatable strings across:

**Constants File (`/src/components/ItemCreationWorkflow/utils/constants.ts`):**
- Room labels (9 rooms): Kitchen, Laundry Room, Bedroom, etc.
- Item type labels (3 types): Appliance, Room Item, General Info
- Item type descriptions (3): "Washer, dryer, stove...", etc.
- Content type labels (5): Video, Photo, PDF Document, etc.
- Content source options (8): Record Video, Take Photo, Write Text, etc.
- Purpose labels (7): How to Use, How to Clean, Troubleshooting, etc.
- Purpose descriptions (7): "Operating instructions and controls", etc.
- Tag labels (17): Kitchen, Laundry, Appliance, Instructions, etc.

**Step Components:**
- RoomSelectionStep: ~15 strings (titles, search, empty states)
- ItemTypeStep: ~10 strings (titles, descriptions)
- SpecificItemStep: ~10 strings (search, suggestions)
- PurposeStep: ~15 strings (titles, descriptions)
- ContentTypeStep: ~15 strings (titles, options)
- MediaCaptureStep: ~20 strings (camera, permissions, upload)
- PreviewSaveStep: ~25 strings (preview, editing, saving)
- SessionSummaryStep: ~20 strings (summary, actions, print)

**Dialog Components:**
- ConfirmExitDialog: ~10 strings
- SessionRecoveryBanner: ~8 strings
- EmptySessionDialog: ~5 strings
- RemoveItemDialog: ~5 strings
- PDFExportDialog: ~10 strings

**Shared Components:**
- WorkflowHeader: ~5 strings
- SessionProgressBar: ~3 strings
- ItemNameEditor: ~5 strings
- ItemContextDisplay: ~8 strings
- DuplicateNameWarning: ~4 strings
- NetworkErrorIndicator: ~6 strings
- CameraPermissionFallback: ~8 strings
- ContentPreview: ~5 strings
- PrintOptionsPanel: ~15 strings
- QRGenerationProgress: ~8 strings

### 2.4 Dependencies Status

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-371: Create workflow namespace structure | ⚠️ Required | Must be complete before this task |
| REQ-372-382: Update workflow components | ⚠️ Required | Components must use t() function |
| Translation Service | ✅ Complete | Available at `/src/lib/translation-service/` |
| Claude API Key | ✅ Required | Environment variable `ANTHROPIC_API_KEY` |
| OpenAI API Key | ⚠️ Optional | Fallback provider |

---

## 3. Expected Behavior

### 3.1 Translation Requirements

All workflow namespace keys must have:
- Contextually appropriate translations in each target language
- Consistent terminology with existing translated namespaces
- Natural, culturally appropriate phrasing for UI elements
- Proper handling of pluralization using ICU message format
- Proper handling of variable interpolation (e.g., `{name}`, `{count}`, `{total}`)

### 3.2 Target Languages

| Language Code | Language Name | Native Name |
|---------------|---------------|-------------|
| de | German | Deutsch |
| es | Spanish | Español |
| fr | French | Français |
| it | Italian | Italiano |
| nl | Dutch | Nederlands |

### 3.3 Translation Quality Standards

1. **Accuracy**: Translations convey the same meaning as English source
2. **Fluency**: Text reads naturally to native speakers
3. **Consistency**: Same terms used across the workflow (e.g., "Room" always "Raum" in German)
4. **Context Awareness**: UI-specific terminology (buttons, labels, titles) uses appropriate register
5. **Format Preservation**: ICU placeholders and variables preserved exactly

### 3.4 Translation Context

All translations should be generated with the following context hints:
- **Domain**: Vacation rental property management / QR code item tracking
- **Content Type**: Item creation workflow UI strings (navigation, labels, buttons, status messages)
- **Audience**: Property managers, Airbnb hosts, rental owners
- **Feature Area**: Multi-step wizard for creating QR code items with content

---

## 4. Implementation Tasks

### Task 1: Verify Workflow Namespace Completion
**Prerequisite Check**
**Actions:**
1. Review `/messages/en.json` to confirm the `workflow` namespace from Tasks 2C.1-2C.12 is complete
2. Document the final list of keys requiring translation
3. If previous tasks are incomplete, wait for their completion before proceeding

### Task 2: Extract Workflow Keys for Translation
**Actions:**
1. Parse `/messages/en.json` and extract all `workflow.*` keys
2. Group keys by semantic category for batch processing:
   - Navigation (step titles, progress, buttons)
   - Room selection (labels, search, empty states)
   - Item type selection (types, descriptions)
   - Purpose selection (purposes, descriptions)
   - Content type selection (options, subtitles)
   - Media capture (camera, upload, permissions)
   - Preview/save (preview, edit, validation)
   - Session management (summary, print, actions)
   - Dialogs (confirmation, warnings, errors)
3. Prepare translation batches with appropriate domain context

### Task 3: Generate German (de) Translations
**File:** `/messages/de.json`
**Actions:**
1. Call translation service with source language 'en', target 'de'
2. Use vacation rental / property management context hints
3. Review generated translations for quality and consistency
4. Verify terminology matches existing German translations in other namespaces
5. Update de.json with workflow namespace translations
6. Validate JSON syntax

### Task 4: Generate Spanish (es) Translations
**File:** `/messages/es.json`
**Actions:**
1. Call translation service with source language 'en', target 'es'
2. Use neutral Spanish (not region-specific) for broader compatibility
3. Review generated translations for quality
4. Update es.json with workflow namespace translations
5. Validate JSON syntax

### Task 5: Generate French (fr) Translations
**File:** `/messages/fr.json`
**Actions:**
1. Call translation service with source language 'en', target 'fr'
2. Use formal register appropriate for UI (vous form where applicable)
3. Review generated translations for quality
4. Update fr.json with workflow namespace translations
5. Validate JSON syntax

### Task 6: Generate Italian (it) Translations
**File:** `/messages/it.json`
**Actions:**
1. Call translation service with source language 'en', target 'it'
2. Review generated translations for quality
3. Update it.json with workflow namespace translations
4. Validate JSON syntax

### Task 7: Generate Dutch (nl) Translations
**File:** `/messages/nl.json`
**Actions:**
1. Call translation service with source language 'en', target 'nl'
2. Review generated translations for quality
3. Update nl.json with workflow namespace translations
4. Validate JSON syntax

### Task 8: Validate All Translations
**Actions:**
1. Run TypeScript compilation to verify no type errors
2. Run `npm run build` to verify build succeeds
3. Verify JSON syntax validity for all modified files
4. Check for missing translation warnings in browser console
5. Test workflow UI in each language for correct display

### Task 9: Cross-Language Consistency Check
**Actions:**
1. Compare terminology across all translated namespaces
2. Ensure consistent terminology for:
   - Room names (Kitchen, Bedroom, etc.)
   - Action verbs (Save, Cancel, Continue, etc.)
   - Content types (Video, Photo, etc.)
   - Purpose types (How to Use, Troubleshooting, etc.)
3. Verify navigation labels match across auth, dashboard, and common namespaces

---

## 5. Authorized Files and Functions for Modification

### 5.1 Translation Files (MODIFY)

| File Path | Modification Type | Namespace Affected |
|-----------|-------------------|-------------------|
| `/messages/de.json` | Add/update `workflow` namespace | All workflow.* keys |
| `/messages/es.json` | Add/update `workflow` namespace | All workflow.* keys |
| `/messages/fr.json` | Add/update `workflow` namespace | All workflow.* keys |
| `/messages/it.json` | Add/update `workflow` namespace | All workflow.* keys |
| `/messages/nl.json` | Add/update `workflow` namespace | All workflow.* keys |

### 5.2 Optional Script Files (CREATE if needed)

| File Path | Purpose |
|-----------|---------|
| `/scripts/translate-workflow.ts` | Batch translation script for workflow namespace |
| `/scripts/validate-workflow-translations.ts` | Validation script for translation completeness |

### 5.3 Files NOT to Modify

The following files should **NOT** be modified in this task:

| File Path | Reason |
|-----------|--------|
| `/messages/en.json` | Source of truth - completed in Tasks 2C.1-2C.12 |
| `/src/lib/translation-service/*` | Translation service is already complete |
| `/src/components/ItemCreationWorkflow/**/*.tsx` | Component integration done in Tasks 2C.2-2C.12 |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Constants file - may have hardcoded labels to preserve |
| `/src/lib/i18n/config.ts` | i18n configuration - already complete from Epic 1 |

---

## 6. Workflow Namespace Structure

The expected structure for the `workflow` namespace in translation files:

```json
{
  "workflow": {
    "header": {
      "step": "Step {current} of {total}",
      "exit": "Exit",
      "back": "Back"
    },
    "rooms": {
      "kitchen": "Kitchen",
      "laundry": "Laundry Room",
      "bedroom": "Bedroom",
      "bathroom": "Bathroom",
      "livingRoom": "Living Room",
      "garage": "Garage",
      "outdoor": "Outdoor/Patio",
      "general": "General/Whole Property",
      "other": "Other"
    },
    "itemTypes": {
      "appliance": {
        "label": "Appliance",
        "description": "Washer, dryer, stove, refrigerator, etc."
      },
      "roomItem": {
        "label": "Room Item",
        "description": "Pantry, cabinets, closet, sink, etc."
      },
      "generalInfo": {
        "label": "General Info",
        "description": "Trash schedule, WiFi info, house rules, etc."
      }
    },
    "purposes": {
      "howToUse": {
        "label": "How to Use",
        "description": "Operating instructions and controls"
      },
      "howToClean": {
        "label": "How to Clean",
        "description": "Cleaning and care instructions"
      },
      "troubleshooting": {
        "label": "Troubleshooting",
        "description": "Common issues and fixes"
      },
      "safetyInfo": {
        "label": "Safety Information",
        "description": "Safety warnings and precautions"
      },
      "maintenance": {
        "label": "Maintenance",
        "description": "Regular maintenance tasks"
      },
      "features": {
        "label": "Features & Tips",
        "description": "Special features and tips"
      },
      "other": {
        "label": "Other",
        "description": "General information"
      }
    },
    "contentTypes": {
      "recordVideo": "Record Video",
      "takePhoto": "Take Photo",
      "writeText": "Write Text",
      "uploadFile": "Upload File",
      "uploadFileSubtitle": "Video, Image, PDF, Text",
      "addLink": "Add Link"
    },
    "steps": {
      "roomSelection": {
        "title": "Select a Room",
        "subtitle": "Choose where this item is located",
        "searchPlaceholder": "Search rooms...",
        "noRooms": "No rooms found"
      },
      "itemType": {
        "title": "What type of item?",
        "subtitle": "Select the category that best describes your item"
      },
      "specificItem": {
        "title": "Which specific item?",
        "subtitle": "Choose or enter the exact item name",
        "searchPlaceholder": "Search or type item name...",
        "suggestions": "Suggestions"
      },
      "purpose": {
        "title": "What's the purpose?",
        "subtitle": "Select the main purpose for this content"
      },
      "contentType": {
        "title": "How do you want to add content?",
        "subtitle": "Choose how to provide instructions"
      },
      "mediaCapture": {
        "title": "Capture Content",
        "takePhoto": "Take Photo",
        "recordVideo": "Record Video",
        "retake": "Retake",
        "useThis": "Use This",
        "cameraPermission": "Camera access is required",
        "cameraPermissionDescription": "Please allow camera access to capture photos or videos."
      },
      "preview": {
        "title": "Review & Save",
        "subtitle": "Review your item before saving",
        "itemName": "Item Name",
        "itemNamePlaceholder": "Enter item name",
        "itemNameHint": "This name will appear on the QR code label",
        "description": "Description",
        "tags": "Tags",
        "content": "Content",
        "addMore": "Add More Content",
        "save": "Save Item",
        "saving": "Saving..."
      },
      "sessionSummary": {
        "title": "Session Complete!",
        "subtitle": "You created {count} {count, plural, one {item} other {items}}",
        "noItems": "No items yet",
        "noItemsDescription": "You haven't created any items in this session yet.",
        "addFirstItem": "Add First Item",
        "printOptions": "Print QR Codes",
        "createAnother": "Create Another Item",
        "viewItems": "View Items",
        "done": "Done"
      }
    },
    "dialogs": {
      "confirmExit": {
        "title": "Exit Workflow?",
        "messageWithItems": "You have unsaved changes and {count} item(s) in this session. Are you sure you want to exit?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageItems": "You have created {count} item(s) in this session. Are you sure you want to exit?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "stay": "Stay",
        "exit": "Exit Workflow"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
        "cancel": "Cancel",
        "remove": "Remove"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "No items added yet. Add items or exit session?",
        "addItems": "Add Items",
        "exitSession": "Exit Session"
      },
      "sessionRecovery": {
        "title": "Your previous session has been restored",
        "itemCount": "{count} item(s)",
        "needsReupload": "{count} piece(s) need(s) re-upload",
        "dismiss": "Dismiss notification",
        "continue": "Continue Session",
        "startFresh": "Start Fresh"
      }
    },
    "warnings": {
      "duplicateName": "Exact name already exists",
      "similarName": "Similar name already used",
      "networkError": {
        "title": "Preview unavailable",
        "message": "Unable to load preview due to network connectivity issues.",
        "retrying": "Retrying...",
        "retry": "Try Again",
        "proceed": "Proceed Without Preview"
      },
      "cameraFallback": {
        "title": "Camera access not available",
        "message": "To record a {type}, please allow camera access in your browser settings, or upload an existing {type} from your device.",
        "uploadVideo": "Upload Video",
        "uploadPhoto": "Upload Photo",
        "tryAgain": "Try Camera Again",
        "howToEnable": "How to enable camera access"
      }
    },
    "content": {
      "pieces": "Content Pieces",
      "pieceCount": "{count, plural, one {# piece} other {# pieces}} of content",
      "dragToReorder": "Drag to reorder",
      "remove": "Remove",
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "text": "Text",
        "link": "Link"
      }
    },
    "print": {
      "scope": {
        "all": "All Items",
        "new": "New Items Only",
        "select": "Select Items"
      },
      "status": {
        "ready": "Ready to generate",
        "generating": "Generating...",
        "complete": "Generation complete",
        "failed": "Generation failed"
      },
      "stats": {
        "total": "{total} items",
        "completed": "{completed} generated",
        "failed": "{failed} failed"
      },
      "retry": "Retry"
    },
    "tags": {
      "kitchen": "Kitchen",
      "laundry": "Laundry",
      "bedroom": "Bedroom",
      "bathroom": "Bathroom",
      "livingRoom": "Living Room",
      "garage": "Garage",
      "outdoor": "Outdoor",
      "general": "General",
      "appliance": "Appliance",
      "roomItem": "Room Item",
      "instructions": "Instructions",
      "cleaning": "Cleaning",
      "troubleshooting": "Troubleshooting",
      "safety": "Safety",
      "maintenance": "Maintenance",
      "features": "Features",
      "info": "Info",
      "removeTag": "Remove {label} tag"
    },
    "validation": {
      "nameRequired": "Item name is required",
      "contentRequired": "At least one content piece is required",
      "roomRequired": "Please select a room"
    }
  }
}
```

---

## 7. Technical Considerations

### 7.1 Translation Service Usage

Using the translation service programmatically:

```typescript
import {
  translateToLanguages,
  type SupportedLanguage
} from '@/lib/translation-service';

// Batch translate workflow strings
const result = await translateToLanguages(
  'Select a Room',          // English source text
  'en',                     // Source language
  ['de', 'es', 'fr', 'it', 'nl'], // Target languages
  {
    context: {
      contentType: 'item_name',
      domainContext: 'Item creation workflow for vacation rental property management'
    }
  }
);

// Access translations
console.log(result.translations.de); // "Raum auswählen"
console.log(result.translations.fr); // "Sélectionner une pièce"
```

### 7.2 ICU Message Format Handling

For strings with pluralization or variables, preserve the exact ICU syntax:

**English source:**
```json
{
  "workflow.steps.sessionSummary.subtitle": "You created {count} {count, plural, one {item} other {items}}"
}
```

**Correct German translation:**
```json
{
  "workflow.steps.sessionSummary.subtitle": "Sie haben {count} {count, plural, one {Artikel} other {Artikel}} erstellt"
}
```

**DO NOT translate variable names like `{count}`, `{name}`, `{total}`**

### 7.3 Batch Translation Strategy

For efficiency, translations should be batched by semantic group:

1. **Room labels**: Kitchen, Laundry Room, Bedroom, etc.
2. **Item type labels/descriptions**: Appliance, Room Item, General Info
3. **Purpose labels/descriptions**: How to Use, Troubleshooting, etc.
4. **Content options**: Record Video, Take Photo, Write Text, etc.
5. **Step titles/subtitles**: Select a Room, What type of item?, etc.
6. **Dialog messages**: Exit Workflow?, Remove Item?, etc.
7. **Action buttons**: Save, Cancel, Continue, Retry, etc.
8. **Status messages**: Saving..., Retrying..., etc.
9. **Validation messages**: Item name is required, etc.
10. **Tag labels**: Kitchen, Appliance, Instructions, etc.

### 7.4 API Rate Limiting

The translation service includes rate limiting:
- Claude: 50 requests/minute, 100,000 tokens/minute (configurable)
- OpenAI: 60 requests/minute, 150,000 tokens/minute (configurable)

For ~500 workflow keys across 5 languages (~2,500 translation calls), batch requests with delays are recommended.

---

## 8. Acceptance Criteria Checklist

### 8.1 Translation Completeness
- [ ] German (`de.json`) contains complete `workflow` namespace with all keys from English source
- [ ] Spanish (`es.json`) contains complete `workflow` namespace with all keys from English source
- [ ] French (`fr.json`) contains complete `workflow` namespace with all keys from English source
- [ ] Italian (`it.json`) contains complete `workflow` namespace with all keys from English source
- [ ] Dutch (`nl.json`) contains complete `workflow` namespace with all keys from English source
- [ ] All translation keys match exactly between English source and target language files

### 8.2 Translation Quality
- [ ] Room names are consistently translated across all components
- [ ] Item type labels and descriptions read naturally in each language
- [ ] Purpose labels and descriptions are contextually appropriate
- [ ] Action buttons are concise and action-oriented in each language
- [ ] Dialog messages maintain appropriate tone (polite, clear)
- [ ] No placeholder or machine-translated artifacts remain

### 8.3 Technical Validation
- [ ] JSON syntax is valid in all modified translation files
- [ ] TypeScript compilation succeeds with no errors
- [ ] Build completes successfully (`npm run build`)
- [ ] Browser console shows no missing translation warnings in workflow views
- [ ] All ICU message format placeholders are preserved correctly
- [ ] Variable interpolation works in all languages

### 8.4 User Experience
- [ ] Complete workflow (steps 1-8) displays correctly in all five non-English languages
- [ ] Language switching works seamlessly throughout workflow
- [ ] No layout breaks due to longer text in non-English languages
- [ ] Dialog components display correctly in each language
- [ ] Camera permission messages are clear and helpful

---

## 9. Translation Reference Table

Expected translations for key workflow terms (for quality verification):

### Room Names

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| Kitchen | Küche | Cocina | Cuisine | Cucina | Keuken |
| Laundry Room | Waschküche | Lavandería | Buanderie | Lavanderia | Wasruimte |
| Bedroom | Schlafzimmer | Dormitorio | Chambre | Camera da letto | Slaapkamer |
| Bathroom | Badezimmer | Baño | Salle de bain | Bagno | Badkamer |
| Living Room | Wohnzimmer | Sala de estar | Salon | Soggiorno | Woonkamer |
| Garage | Garage | Garaje | Garage | Garage | Garage |
| Outdoor/Patio | Außenbereich/Terrasse | Exterior/Patio | Extérieur/Terrasse | Esterno/Patio | Buiten/Terras |
| General/Whole Property | Allgemein/Gesamtes Objekt | General/Toda la propiedad | Général/Toute la propriété | Generale/Intera proprietà | Algemeen/Hele eigendom |

### Purpose Types

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| How to Use | Bedienungsanleitung | Cómo usar | Comment utiliser | Come usare | Gebruiksaanwijzing |
| How to Clean | Reinigungsanleitung | Cómo limpiar | Comment nettoyer | Come pulire | Schoonmaakinstructies |
| Troubleshooting | Fehlerbehebung | Solución de problemas | Dépannage | Risoluzione dei problemi | Probleemoplossing |
| Safety Information | Sicherheitshinweise | Información de seguridad | Informations de sécurité | Informazioni sulla sicurezza | Veiligheidsinformatie |
| Maintenance | Wartung | Mantenimiento | Entretien | Manutenzione | Onderhoud |

### Action Buttons

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| Save Item | Artikel speichern | Guardar artículo | Enregistrer l'article | Salva articolo | Item opslaan |
| Continue | Weiter | Continuar | Continuer | Continua | Doorgaan |
| Exit Workflow | Workflow beenden | Salir del asistente | Quitter l'assistant | Esci dal workflow | Wizard afsluiten |
| Take Photo | Foto aufnehmen | Tomar foto | Prendre une photo | Scatta foto | Foto maken |
| Record Video | Video aufnehmen | Grabar video | Enregistrer une vidéo | Registra video | Video opnemen |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Verify workflow namespace completion | 15 minutes |
| Extract and group workflow keys | 30 minutes |
| Generate German translations | 45 minutes |
| Generate Spanish translations | 45 minutes |
| Generate French translations | 45 minutes |
| Generate Italian translations | 45 minutes |
| Generate Dutch translations | 45 minutes |
| Validate all translations | 60 minutes |
| Cross-language consistency check | 45 minutes |
| Visual testing in workflow | 45 minutes |
| **Total** | **~6-7 hours** |

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation service unavailable | Low | High | Use fallback provider (OpenAI if Claude fails) |
| Inconsistent terminology | Medium | Medium | Create glossary, cross-reference existing translations |
| Room/purpose descriptions too long | Medium | Low | Keep translations concise, test in UI |
| ICU format corrupted | Low | High | Validate all pluralization and interpolation |
| Previous tasks (2C.1-2C.12) incomplete | Medium | Critical | Verify task completion before starting |
| Layout breaks in workflow UI | Medium | Medium | Test each language in full workflow flow |
| Technical terms mistranslated | Medium | Medium | Preserve terms like "QR code", "PDF" where appropriate |

---

## 12. Post-Implementation Verification

After completing translations, verify with these manual tests:

1. **Full Workflow Walkthrough**
   - Complete entire Item Creation Workflow in each of the 6 languages
   - Verify all step titles, buttons, and labels display correctly
   - Check room, item type, and purpose selections

2. **Dialog Testing**
   - Trigger exit confirmation dialog
   - Trigger remove item dialog
   - Test session recovery banner
   - Test camera permission fallback

3. **Console Verification**
   - Open browser DevTools
   - Check for missing translation warnings
   - Verify no t() function errors

4. **Language Switching**
   - Start workflow in English
   - Switch language mid-workflow
   - Verify content updates correctly
   - Complete workflow in switched language

5. **Print Flow Testing**
   - Navigate to session summary
   - Test print options panel labels
   - Verify QR generation progress messages

---

## 13. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-371: Create Workflow Namespace Structure](/docs/REQ-371-create-workflow-namespace-structure-overview.md)
- [Translation Service Documentation](/src/lib/translation-service/README.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [ItemCreationWorkflow Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
