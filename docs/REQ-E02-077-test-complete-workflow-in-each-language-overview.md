# Implementation Overview: REQ-E02-077 - Test Complete Item Creation Workflow in Each Supported Language

**Document Created:** 2026-01-20 23:55:00 UTC
**Last Modified:** 2026-01-20 23:55:00 UTC

**Request ID:** REQ-E02-077
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.14
**Size:** L (Large)
**Priority:** P1

---

## 1. Summary

Perform comprehensive end-to-end testing of the complete item creation workflow in each of the six supported languages (English, Spanish, French, German, Dutch, Italian) to verify that all internationalized workflow components function correctly, display appropriate translations, and complete successfully without untranslated strings, translation key placeholders, or functionality breaks. This quality assurance task validates the cumulative work of Tasks 2C.1-2C.13, ensuring the localization investment delivers value for international users completing the critical item creation journey.

The Item Creation Workflow is the largest sub-epic in Epic 2 with 86+ component files and approximately 500 translation strings. Testing must cover all 10 workflow steps from room selection through session summary across all 6 languages.

---

## 2. Current State Analysis

### 2.1 Workflow Components to Test

Based on the ItemCreationWorkflow component inventory from Tasks 2C.1-2C.13:

| Component | Location | Test Scope |
|-----------|----------|------------|
| ItemCreationWorkflow | `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main orchestrator, step transitions |
| RoomSelectionStep | `.../steps/RoomSelectionStep.tsx` | Room labels, search, selection UI |
| ItemTypeStep | `.../steps/ItemTypeStep.tsx` | Item type categories, labels |
| SpecificItemStep | `.../steps/SpecificItemStep.tsx` | Specific item selection, search |
| PurposeStep | `.../steps/PurposeStep.tsx` | Purpose options, descriptions |
| ContentTypeStep | `.../steps/ContentTypeStep.tsx` | Content type options, guidance |
| MediaCaptureStep | `.../steps/MediaCaptureStep.tsx` | Camera controls, instructions, feedback |
| ContentCreationStep | `.../steps/ContentCreationStep.tsx` | Content editing interface |
| PreviewSaveStep | `.../steps/PreviewSaveStep.tsx` | Form fields, validation, action buttons |
| NextActionStep | `.../steps/NextActionStep.tsx` | Next action options |
| SessionSummaryStep | `.../steps/SessionSummaryStep.tsx` | Summary labels, counts, navigation |
| WorkflowHeader | `.../shared/WorkflowHeader.tsx` | Step indicator, navigation buttons |
| ConfirmExitDialog | `.../shared/ConfirmExitDialog.tsx` | Exit confirmation messages |
| RemoveItemDialog | `.../shared/RemoveItemDialog.tsx` | Item removal confirmation |
| EmptySessionDialog | `.../shared/EmptySessionDialog.tsx` | Empty session warning |
| PDFExportDialog | `.../shared/PDFExportDialog.tsx` | Print/export options |
| MediaCaptureAdapters | `.../steps/adapters/*.tsx` | Video, Photo, File, Text, URL adapters |

### 2.2 Supported Languages

From `/src/lib/i18n/config.ts`:

| Code | Language | Native Name | Flag |
|------|----------|-------------|------|
| en | English | English | 🇬🇧 |
| fr | French | Français | 🇫🇷 |
| es | Spanish | Español | 🇪🇸 |
| de | German | Deutsch | 🇩🇪 |
| nl | Dutch | Nederlands | 🇳🇱 |
| it | Italian | Italiano | 🇮🇹 |

### 2.3 Workflow Steps to Test

The Item Creation Workflow consists of the following steps in order:

1. **Room Selection Step** (`room-selection`)
   - Select a room from predefined list or create custom room
   - Search functionality
   - Room cards with labels

2. **Item Type Selection Step** (`item-type-selection`)
   - Choose item category (Appliance, Furniture, etc.)
   - Item type cards with labels and descriptions

3. **Specific Item Selection Step** (`specific-item-selection`)
   - Select or enter specific item name
   - Suggestions list
   - Custom item name input

4. **Purpose Selection Step** (`purpose-selection`)
   - Select purpose type (How to Use, Troubleshooting, etc.)
   - Purpose cards with labels and descriptions

5. **Content Type Selection Step** (`content-type-selection`)
   - Choose content type (Video, Photo, Text, File, URL)
   - Content type cards with guidance text

6. **Media Capture Step** (`media-capture`)
   - Camera interface for video/photo
   - Capture controls and instructions
   - Retake/use buttons
   - Camera permission messages

7. **Content Creation Step** (`content-creation`)
   - Text editor interface
   - File upload interface
   - URL input interface
   - Save/cancel buttons

8. **Preview & Save Step** (`preview-save`)
   - Item name editor
   - Description field
   - Tags editor
   - Content preview with reordering
   - Save button and validation

9. **Next Action Step** (`next-action`)
   - "Create Another Item" option
   - "I'm Done" option
   - Session summary preview

10. **Session Summary Step** (`session-summary`)
    - Session completion message
    - Item count summary
    - Print QR codes option
    - View items option
    - Done button

### 2.4 Translation Namespace

From the implementation plan, the workflow translations use the `workflow` namespace in `/messages/*.json`:

```json
{
  "workflow": {
    "header": { ... },
    "steps": {
      "roomSelection": { ... },
      "itemType": { ... },
      "specificItem": { ... },
      "purpose": { ... },
      "contentType": { ... },
      "mediaCapture": { ... },
      "preview": { ... },
      "sessionSummary": { ... }
    },
    "dialogs": { ... },
    "content": { ... },
    "validation": { ... }
  }
}
```

### 2.5 Translation Files Location

| File | Status | Notes |
|------|--------|-------|
| `/messages/en.json` | Source | English (reference) |
| `/messages/fr.json` | Generated | Task 2C.13 completed |
| `/messages/es.json` | Generated | Task 2C.13 completed |
| `/messages/de.json` | Generated | Task 2C.13 completed |
| `/messages/nl.json` | Generated | Task 2C.13 completed |
| `/messages/it.json` | Generated | Task 2C.13 completed |

---

## 3. Technical Approach

### 3.1 Test Environment Setup

Tests should be executable against the local development server with language switching capability:

```bash
# Start development server
npm run dev

# Access application with language parameter or cookie
# Option 1: Set FAQBNB_LANG cookie
# Option 2: Use language switcher component
# Option 3: Browser Accept-Language header
```

### 3.2 Language Switching Methods

Per `/src/lib/i18n/config.ts`:

1. **Cookie-based**: Set `FAQBNB_LANG` cookie to desired locale code
2. **Browser headers**: Configure browser's Accept-Language header
3. **UI switcher**: Use any exposed language selector component

```javascript
// Set language via cookie in browser console
document.cookie = 'FAQBNB_LANG=es; path=/; max-age=31536000';
// Then refresh page
```

### 3.3 Test Categories

#### 3.3.1 Visual Verification Tests
- All step titles display in correct language
- All labels and descriptions display in correct language
- No translation keys visible (e.g., `workflow.steps.roomSelection.title`)
- No English fallback text in non-English locales
- Text fits within UI containers without overflow

#### 3.3.2 Functional Verification Tests
- Step navigation works correctly in all languages
- Forms submit correctly in all languages
- Validation messages appear in correct language
- Error messages display in correct language
- Success flows complete in all languages
- Item creation saves correctly

#### 3.3.3 Interpolation Tests
- Variable substitution works (`{count}`, `{itemName}`, etc.)
- Pluralization displays correctly (e.g., "1 item" vs "3 items")
- Dynamic content integrates with translations

#### 3.3.4 Responsive Tests
- Mobile viewport displays correctly
- Desktop viewport displays correctly
- Text wrapping handles longer translations (especially German)

#### 3.3.5 State Management Tests
- Language switching mid-workflow maintains state
- Back navigation displays correct language
- Content previews display correctly

---

## 4. Implementation Tasks

### Task 1: Test Environment Preparation
- Verify development server runs successfully
- Confirm all translation files are in place
- Verify workflow namespace exists in all language files
- Verify language switching mechanism works
- Document test browser configuration per language

### Task 2: Room Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Navigate to item creation workflow
- Verify "Select a Room" title displays correctly
- Verify subtitle text displays correctly
- Verify room search placeholder text
- Verify all predefined room labels (Kitchen, Bedroom, etc.)
- Verify "Add Room" / "Custom Room" option text
- Verify step indicator shows correct labels
- Test room selection auto-advances to next step

### Task 3: Item Type Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What type of item?" title displays correctly
- Verify subtitle text displays correctly
- Verify item type labels (Appliance, Furniture, Electronic, etc.)
- Verify item type descriptions/tooltips
- Test item type selection auto-advances

### Task 4: Specific Item Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "Which specific item?" title displays correctly
- Verify subtitle text displays correctly
- Verify search placeholder text
- Verify "Suggestions" section label
- Verify specific item suggestions display correctly
- Verify "Use custom name" option text
- Test specific item selection auto-advances

### Task 5: Purpose Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What's the purpose?" title displays correctly
- Verify subtitle text displays correctly
- Verify all purpose labels:
  - How to Use
  - How to Clean
  - Troubleshooting
  - Safety Information
  - Maintenance
  - Features & Tips
  - Other
- Verify purpose descriptions
- Test purpose selection auto-advances

### Task 6: Content Type Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "How do you want to add content?" title
- Verify subtitle text displays correctly
- Verify content type options:
  - Record Video
  - Take Photo
  - Upload File
  - Write Text
  - Add Link
- Verify content type descriptions/guidance
- Test content type selection transitions

### Task 7: Media Capture Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "Capture Content" title
- Verify camera permission request messages
- Verify camera permission fallback text
- Verify "Take Photo" / "Record Video" button labels
- Verify "Retake" button text
- Verify "Use This" / "Continue" button text
- Verify recording/capture instructions
- Test capture completion advances to preview

### Task 8: Content Creation Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test text editor adapter:
  - Verify editor placeholder text
  - Verify save/cancel buttons
- Test file upload adapter:
  - Verify upload instructions
  - Verify file type labels
  - Verify error messages for invalid files
- Test URL input adapter:
  - Verify URL input placeholder
  - Verify validation messages
- Test content completion advances correctly

### Task 9: Preview & Save Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "Review & Save" title
- Verify subtitle text
- Verify "Item Name" field label and placeholder
- Verify "Description" field label
- Verify "Tags" section label
- Verify content preview section labels
- Verify "Add More Content" button text
- Verify "Reorder Content" instructions
- Verify content count badge ("X pieces of content")
- Verify "Save Item" button text
- Verify "Saving..." loading state
- Test validation messages for required fields
- Test successful save advances to next action

### Task 10: Next Action Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What would you like to do next?" title
- Verify "Create Another Item" option text
- Verify "I'm Done" option text
- Test "Create Another Item" returns to room selection
- Test "I'm Done" advances to session summary

### Task 11: Session Summary Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "Session Complete!" title
- Verify subtitle with item count pluralization:
  - "You created 1 item"
  - "You created 3 items"
- Verify "Print QR Codes" option text
- Verify "View Items" option text
- Verify "Create Another Item" option text
- Verify "Done" button text
- Test navigation options work correctly

### Task 12: Dialog Components Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test Confirm Exit Dialog:
  - Verify "Exit Item Creation?" title
  - Verify unsaved changes message
  - Verify "Stay" button text
  - Verify "Exit" button text
- Test Remove Item Dialog:
  - Verify "Remove Item?" title
  - Verify confirmation message
  - Verify cancel/confirm buttons
- Test Empty Session Dialog:
  - Verify "No Items Added" title
  - Verify instructional message
- Test PDF Export Dialog:
  - Verify export options labels
  - Verify action buttons

### Task 13: Shared Components Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test WorkflowHeader:
  - Verify "Step X of Y" display
  - Verify "Exit" button text
  - Verify back navigation aria-label
- Test Toast Notifications:
  - Verify success messages
  - Verify error messages
- Test Loading States:
  - Verify loading indicators have correct text
- Test Empty States:
  - Verify empty state messages

### Task 14: Back Navigation Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test navigating back from each step
- Verify previous step displays in correct language
- Verify selected values are preserved
- Verify workflow state is maintained
- Test back from preview preserves content

### Task 15: Error State Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test validation errors:
  - "Item name is required"
  - "At least one content piece is required"
  - "Please select a room"
- Test network error messages
- Test camera permission denied messages
- Test file upload error messages
- Verify error interpolation works correctly

### Task 16: Mobile Responsiveness Testing
For each language:
- Test complete workflow on mobile viewport (375px width)
- Verify no text truncation in step titles
- Verify buttons remain usable
- Verify form inputs are accessible
- Test touch interactions

### Task 17: Edge Case Testing
- Test very long German translations for UI overflow
- Test special characters (accents, umlauts) render correctly
- Test language switching mid-workflow preserves state
- Test page refresh maintains language preference
- Test multiple items in session with pluralization

### Task 18: Documentation and Reporting
- Document any issues found
- Document any untranslated strings discovered
- Document any layout issues per language
- Create test results summary
- Report any regressions or bugs
- Screenshot key workflow steps per language (optional)

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Potentially Modify (Bug Fixes Only)

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/en.json` | English translations | Fix missing keys only |
| `/messages/fr.json` | French translations | Fix translation issues |
| `/messages/es.json` | Spanish translations | Fix translation issues |
| `/messages/de.json` | German translations | Fix translation issues |
| `/messages/nl.json` | Dutch translations | Fix translation issues |
| `/messages/it.json` | Italian translations | Fix translation issues |

### 5.2 Files to Test (Read Only for Testing)

**Main Workflow Components:**

| File | Test Purpose |
|------|--------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main orchestrator |
| `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Room selection |
| `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Item type selection |
| `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Specific item selection |
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Purpose selection |
| `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Content type selection |
| `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx` | Media capture |
| `/src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | Content creation |
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Preview and save |
| `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Next action |
| `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Session summary |

**Adapter Components:**

| File | Test Purpose |
|------|--------------|
| `/src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx` | Video capture |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx` | Photo capture |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx` | File upload |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx` | Text editing |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx` | URL input |

**Shared Components:**

| File | Test Purpose |
|------|--------------|
| `/src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx` | Header navigation |
| `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Exit confirmation |
| `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx` | Remove confirmation |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Empty session |
| `/src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | PDF export |
| `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | Progress indicator |
| `/src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx` | Room cards |
| `/src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx` | Item type cards |
| `/src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | Suggestion items |
| `/src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx` | Session items |
| `/src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Print options |
| `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | QR generation |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Content pieces |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | Content preview |
| `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | Name editor |
| `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | Tags editor |
| `/src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx` | Camera fallback |
| `/src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx` | Network errors |
| `/src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | Session recovery |
| `/src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx` | Item context |

**Configuration Files:**

| File | Test Purpose |
|------|--------------|
| `/src/lib/i18n/config.ts` | Language configuration |
| `/src/lib/i18n/language-detection.ts` | Language detection |

### 5.3 Test Artifacts to Create

| File | Purpose |
|------|---------|
| Test results log (manual) | Document test outcomes |
| Issue list (if any) | Track discovered problems |
| Screenshot evidence (optional) | Visual verification per language |

### 5.4 Files NOT to Modify

- TypeScript component source code (unless bug requires fix)
- Database migrations
- API routes
- Build configuration
- Test infrastructure
- Workflow state management logic

---

## 6. Dependencies

### 6.1 Required Completions Before This Task

| Task | Status | Notes |
|------|--------|-------|
| 2C.1: Create workflow namespace structure | Must be Complete | Namespace exists in en.json |
| 2C.2: Update main ItemCreationWorkflow | Must be Complete | Component uses translations |
| 2C.3: Update RoomSelectionStep | Must be Complete | Component uses translations |
| 2C.4: Update ItemTypeStep | Must be Complete | Component uses translations |
| 2C.5: Update SpecificItemStep | Must be Complete | Component uses translations |
| 2C.6: Update PurposeStep | Must be Complete | Component uses translations |
| 2C.7: Update ContentTypeStep | Must be Complete | Component uses translations |
| 2C.8: Update MediaCaptureStep and adapters | Must be Complete | Components use translations |
| 2C.9: Update PreviewSaveStep | Must be Complete | Component uses translations |
| 2C.10: Update SessionSummaryStep | Must be Complete | Component uses translations |
| 2C.11: Update all shared components | Must be Complete | 25+ components use translations |
| 2C.12: Update all dialog components | Must be Complete | Dialogs use translations |
| 2C.13: Generate translations | Must be Complete | All 5 non-English files populated |
| Epic 1: i18n Foundation | Must be Complete | Translation infrastructure operational |

### 6.2 External Dependencies

| Dependency | Purpose |
|------------|---------|
| Development server | Running application for testing |
| Browser DevTools | Language/cookie manipulation |
| Camera access | Media capture step testing |
| Test property/room data | Full workflow testing |
| Network conditions | Error state testing |

---

## 7. Acceptance Criteria

### 7.1 Room Selection Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] "Select a Room" title displays correctly in all languages
- [ ] Room labels display in correct language
- [ ] Search placeholder displays in correct language
- [ ] Custom room option displays in correct language
- [ ] Room selection auto-advances to next step

### 7.2 Item Type Selection Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] Step title displays correctly in all languages
- [ ] Item type labels display in correct language
- [ ] Item type descriptions display correctly
- [ ] Selection auto-advances to next step

### 7.3 Specific Item Selection Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] Step title displays correctly in all languages
- [ ] Search placeholder displays in correct language
- [ ] Suggestion labels display correctly
- [ ] Custom name option displays correctly
- [ ] Selection auto-advances to next step

### 7.4 Purpose Selection Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] Step title displays correctly in all languages
- [ ] All 7 purpose options display in correct language
- [ ] Purpose descriptions display correctly
- [ ] Selection auto-advances to next step

### 7.5 Content Type Selection Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] Step title displays correctly in all languages
- [ ] All 5 content type options display in correct language
- [ ] Content type guidance displays correctly
- [ ] Selection transitions to appropriate capture/input step

### 7.6 Media Capture Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] Camera controls display in correct language
- [ ] Permission request messages display correctly
- [ ] Permission fallback displays correctly
- [ ] Capture/retake buttons display in correct language
- [ ] Capture completion advances to preview

### 7.7 Content Creation Step Criteria
- [ ] Text editor placeholder displays correctly
- [ ] File upload instructions display correctly
- [ ] URL input placeholder displays correctly
- [ ] Validation messages display in correct language
- [ ] Save/cancel buttons display correctly

### 7.8 Preview & Save Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] Step title displays correctly
- [ ] Form field labels display correctly
- [ ] Content preview labels display correctly
- [ ] Content count uses correct pluralization
- [ ] Validation messages display in correct language
- [ ] Save button and loading state display correctly

### 7.9 Next Action Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] Step title displays correctly
- [ ] "Create Another Item" option displays correctly
- [ ] "I'm Done" option displays correctly
- [ ] Navigation options function correctly

### 7.10 Session Summary Step Criteria
- [ ] Step loads in all six languages without errors
- [ ] "Session Complete!" title displays correctly
- [ ] Item count displays with correct pluralization
- [ ] Print/view/create options display correctly
- [ ] "Done" button displays correctly

### 7.11 Dialog Criteria
- [ ] Confirm Exit Dialog displays correctly in all languages
- [ ] Remove Item Dialog displays correctly in all languages
- [ ] Empty Session Dialog displays correctly in all languages
- [ ] PDF Export Dialog displays correctly in all languages

### 7.12 Visual Criteria
- [ ] No translation keys visible (e.g., `workflow.steps.roomSelection.title`)
- [ ] No English text visible in non-English locales (except brand names)
- [ ] Text fits within UI containers in all languages
- [ ] German translations (typically longer) do not cause overflow
- [ ] Special characters (accents, umlauts) render correctly

### 7.13 Functional Criteria
- [ ] Complete workflow succeeds in all languages
- [ ] Back navigation works correctly in all languages
- [ ] Item is saved successfully in all languages
- [ ] Session state maintains across language switch
- [ ] Multiple items can be created in session

### 7.14 Pluralization Criteria
- [ ] "1 item" displays correctly (singular)
- [ ] "X items" displays correctly (plural)
- [ ] "1 content piece" displays correctly (singular)
- [ ] "X content pieces" displays correctly (plural)

### 7.15 Responsive Criteria
- [ ] Workflow displays correctly on mobile (375px)
- [ ] All steps are usable on mobile
- [ ] No horizontal scrolling required
- [ ] Touch interactions work correctly

---

## 8. Testing Checklist

### 8.1 English (en) - Baseline

#### Complete Flow Test
- [ ] Navigate to item creation workflow
- [ ] Verify room selection step UI
- [ ] Select room, verify auto-advance
- [ ] Verify item type selection step UI
- [ ] Select item type, verify auto-advance
- [ ] Verify specific item selection step UI
- [ ] Select specific item, verify auto-advance
- [ ] Verify purpose selection step UI
- [ ] Select purpose, verify auto-advance
- [ ] Verify content type selection step UI
- [ ] Select "Write Text" option
- [ ] Verify text editor interface
- [ ] Enter text content, save
- [ ] Verify preview step UI
- [ ] Verify item name field
- [ ] Verify content preview
- [ ] Click "Save Item"
- [ ] Verify next action step UI
- [ ] Click "I'm Done"
- [ ] Verify session summary UI
- [ ] Verify item count message

#### Dialog Tests
- [ ] Trigger exit confirmation
- [ ] Verify dialog text
- [ ] Cancel and stay in workflow

### 8.2 Spanish (es)

#### Complete Flow Test
- [ ] Set language to Spanish (cookie: `FAQBNB_LANG=es`)
- [ ] Navigate to item creation workflow
- [ ] Verify "Seleccionar una habitación" or equivalent
- [ ] Complete room selection
- [ ] Verify "¿Qué tipo de artículo?" or equivalent
- [ ] Complete item type selection
- [ ] Verify specific item step in Spanish
- [ ] Complete specific item selection
- [ ] Verify purpose step in Spanish
- [ ] Complete purpose selection
- [ ] Verify content type step in Spanish
- [ ] Select content type
- [ ] Complete content creation
- [ ] Verify preview step in Spanish
- [ ] Save item
- [ ] Verify next action step in Spanish
- [ ] Complete workflow
- [ ] Verify session summary in Spanish
- [ ] Verify pluralization works (1 artículo, X artículos)

### 8.3 French (fr)

#### Complete Flow Test
- [ ] Set language to French
- [ ] Navigate to item creation workflow
- [ ] Verify "Sélectionner une pièce" or equivalent
- [ ] Complete full workflow
- [ ] Verify all steps display in French
- [ ] Verify validation messages in French
- [ ] Verify success messages in French
- [ ] Verify pluralization works (1 article, X articles)

### 8.4 German (de)

#### Complete Flow Test
- [ ] Set language to German
- [ ] Navigate to item creation workflow
- [ ] Verify "Raum auswählen" or equivalent
- [ ] Complete full workflow
- [ ] Verify all steps display in German
- [ ] **Verify no text overflow** (German text is longer)
- [ ] Verify validation messages in German
- [ ] Verify success messages in German
- [ ] Verify pluralization works (1 Artikel, X Artikel)

### 8.5 Dutch (nl)

#### Complete Flow Test
- [ ] Set language to Dutch
- [ ] Navigate to item creation workflow
- [ ] Verify "Selecteer een kamer" or equivalent
- [ ] Complete full workflow
- [ ] Verify all steps display in Dutch
- [ ] Verify validation messages in Dutch
- [ ] Verify success messages in Dutch
- [ ] Verify pluralization works (1 item, X items)

### 8.6 Italian (it)

#### Complete Flow Test
- [ ] Set language to Italian
- [ ] Navigate to item creation workflow
- [ ] Verify "Seleziona una stanza" or equivalent
- [ ] Complete full workflow
- [ ] Verify all steps display in Italian
- [ ] Verify validation messages in Italian
- [ ] Verify success messages in Italian
- [ ] Verify pluralization works (1 articolo, X articoli)

### 8.7 Cross-Language Tests

- [ ] Language switching preserves workflow state
- [ ] No console errors about missing translation keys
- [ ] No visible `{variable}` placeholders in any language
- [ ] Back navigation shows correct language
- [ ] Created items appear correctly in item list

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys discovered | Medium | Medium | Document and fix in translation files |
| Translation quality issues found | Medium | Low | Note for later review, don't block |
| Layout breaks in German | Medium | Medium | Document, may require CSS adjustments |
| Camera permission handling varies | Medium | Low | Test multiple browsers |
| Test environment inconsistency | Low | Medium | Document browser/environment setup |
| False positives from caching | Medium | Low | Clear cache between language tests |
| Mobile-specific issues | Medium | Medium | Test on actual mobile viewport |
| State loss on language switch | Low | High | Document if occurs, report as bug |
| Pluralization errors | Medium | Medium | Test both singular and plural cases |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Test environment preparation | 15 minutes |
| Room selection step testing (6 languages) | 30 minutes |
| Item type step testing (6 languages) | 20 minutes |
| Specific item step testing (6 languages) | 20 minutes |
| Purpose step testing (6 languages) | 25 minutes |
| Content type step testing (6 languages) | 25 minutes |
| Media capture step testing (6 languages) | 30 minutes |
| Content creation step testing (6 languages) | 30 minutes |
| Preview & save step testing (6 languages) | 35 minutes |
| Next action step testing (6 languages) | 15 minutes |
| Session summary step testing (6 languages) | 20 minutes |
| Dialog testing (6 languages) | 30 minutes |
| Shared components testing (6 languages) | 25 minutes |
| Back navigation testing | 20 minutes |
| Error state testing (6 languages) | 30 minutes |
| Mobile responsiveness testing | 30 minutes |
| Edge case testing | 25 minutes |
| Documentation and reporting | 25 minutes |
| **Total** | **~7.5 hours** |

---

## 11. Test Data Requirements

### 11.1 Test Accounts

| Purpose | Notes |
|---------|-------|
| Valid user account | Authenticated user with property access |
| Test property | Property with rooms configured |

### 11.2 Browser Configuration

For each language test:

```javascript
// Set language via cookie
document.cookie = 'FAQBNB_LANG=de; path=/; max-age=31536000';
// Then refresh page

// Or modify Accept-Language header in DevTools Network conditions
```

### 11.3 Test Content

| Type | Notes |
|------|-------|
| Sample video | Short video for capture test |
| Sample image | Image for photo capture test |
| Sample file | PDF or document for upload test |
| Sample URL | Valid URL for link input test |
| Sample text | Text content for editor test |

---

## 12. Bug Reporting Template

If issues are discovered during testing, document them as follows:

```markdown
## Bug: [Brief Description]

**Language:** [en/es/fr/de/nl/it]
**Workflow Step:** [Room Selection/Item Type/etc.]
**Component:** [Step component name]
**Severity:** [Critical/High/Medium/Low]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshot
[If applicable]

### Translation Key
[If missing translation, specify the key]
```

---

## 13. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2C section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-077
- [REQ-E02-056: Create Workflow Namespace](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-057: Update Main ItemCreationWorkflow](/docs/REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
- [REQ-E02-058: Update RoomSelectionStep](/docs/REQ-E02-058-update-roomselectionstep-overview.md)
- [REQ-E02-059: Update ItemTypeStep](/docs/REQ-E02-059-update-itemtypestep-overview.md)
- [REQ-E02-060: Update SpecificItemStep](/docs/REQ-E02-060-update-specificitemstep-overview.md)
- [REQ-E02-061: Update PurposeStep](/docs/REQ-E02-061-update-purposestep-overview.md)
- [REQ-E02-062: Update ContentTypeStep](/docs/REQ-E02-062-update-contenttypestep-overview.md)
- [REQ-E02-063: Update MediaCaptureStep](/docs/REQ-E02-063-update-mediacapturestep-and-adapters-overview.md)
- [REQ-E02-064: Update PreviewSaveStep](/docs/REQ-E02-064-update-previewsavestep-overview.md)
- [REQ-E02-065: Update SessionSummaryStep](/docs/REQ-E02-065-update-sessionsummarystep-overview.md)
- [REQ-E02-066: Update Shared Components](/docs/REQ-E02-066-update-all-shared-components-25-files-overview.md)
- [REQ-E02-067: Update Dialog Components](/docs/REQ-E02-067-update-all-dialog-components-overview.md)
- [REQ-E02-068: Generate Translations](/docs/REQ-E02-068-generate-translations-for-5-non-english-languages-overview.md)
- [Existing E2E Test Utilities](/src/components/ItemCreationWorkflow/__tests__/e2e/test-utils.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow*
