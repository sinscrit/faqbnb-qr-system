# Implementation Overview: REQ-E02-069 - Test Complete Item Creation Workflow in All Languages

**Document Created:** 2026-01-20 10:15:00 UTC
**Last Modified:** 2026-01-20 10:15:00 UTC

**Request ID:** REQ-E02-069
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.14
**Size:** L (Large)
**Priority:** P1

---

## 1. Summary

Perform comprehensive end-to-end testing of the complete item creation workflow across all six supported languages (English, Spanish, French, German, Dutch, Italian) to verify that all internationalized workflow components function correctly, display appropriate translations throughout all steps, and complete successfully without untranslated strings, translation key placeholders, or functional regressions. This quality assurance task validates the cumulative work of Tasks 2C.1-2C.13, ensuring property owners from diverse regions experience a fully localized item creation journey.

---

## 2. Current State Analysis

### 2.1 Workflow Components to Test

Based on the workflow component inventory from Tasks 2C.1-2C.13:

#### 2.1.1 Main Workflow Component

| Component | Location | Test Scope |
|-----------|----------|------------|
| ItemCreationWorkflow | `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Workflow header, step navigation, progress indicators |

#### 2.1.2 Step Components (8 Steps)

| Step | Component | Location | Estimated Strings |
|------|-----------|----------|-------------------|
| 1 | RoomSelectionStep | `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | ~40 |
| 2 | ItemTypeStep | `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | ~40 |
| 3 | SpecificItemStep | `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | ~30 |
| 4 | PurposeStep | `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | ~35 |
| 5 | ContentTypeStep | `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | ~40 |
| 6 | MediaCaptureStep | `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx` | ~45 |
| 7 | PreviewSaveStep (ContentCreationStep) | `/src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | ~50 |
| 8 | SessionSummaryStep | `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | ~40 |
| - | NextActionStep | `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | ~25 |

#### 2.1.3 Adapter Components (5 Adapters)

| Adapter | Location | Test Scope |
|---------|----------|------------|
| VideoCaptureAdapter | `/src/components/ItemCreationWorkflow/components/steps/adapters/VideoCaptureAdapter.tsx` | Video recording UI strings |
| PhotoCaptureAdapter | `/src/components/ItemCreationWorkflow/components/steps/adapters/PhotoCaptureAdapter.tsx` | Photo capture UI strings |
| FileUploadAdapter | `/src/components/ItemCreationWorkflow/components/steps/adapters/FileUploadAdapter.tsx` | File upload UI strings |
| TextEditorAdapter | `/src/components/ItemCreationWorkflow/components/steps/adapters/TextEditorAdapter.tsx` | Text editor UI strings |
| UrlInputAdapter | `/src/components/ItemCreationWorkflow/components/steps/adapters/UrlInputAdapter.tsx` | URL input UI strings |

#### 2.1.4 Shared Components (25+ Files)

| Component | Location | Test Scope |
|-----------|----------|------------|
| CameraPermissionFallback | `.../shared/CameraPermissionFallback.tsx` | Permission request text |
| ConfirmExitDialog | `.../shared/ConfirmExitDialog.tsx` | Exit confirmation dialog |
| ContentPieceCard | `.../shared/ContentPieceCard.tsx` | Content preview cards |
| ContentPreview | `.../shared/ContentPreview.tsx` | Content preview display |
| DuplicateNameWarning | `.../shared/DuplicateNameWarning.tsx` | Duplicate name alerts |
| EmptySessionDialog | `.../shared/EmptySessionDialog.tsx` | Empty session warning |
| ItemContextDisplay | `.../shared/ItemContextDisplay.tsx` | Item context info |
| ItemNameEditor | `.../shared/ItemNameEditor.tsx` | Item name editing |
| ItemTypeCard | `.../shared/ItemTypeCard.tsx` | Item type selection |
| NetworkErrorIndicator | `.../shared/NetworkErrorIndicator.tsx` | Network error messages |
| PDFExportDialog | `.../shared/PDFExportDialog.tsx` | PDF export options |
| PrintOptionsPanel | `.../shared/PrintOptionsPanel.tsx` | Print configuration |
| QRGenerationProgress | `.../shared/QRGenerationProgress.tsx` | QR generation status |
| RemoveItemDialog | `.../shared/RemoveItemDialog.tsx` | Item removal confirmation |
| RoomCard | `.../shared/RoomCard.tsx` | Room selection cards |
| SessionItemCard | `.../shared/SessionItemCard.tsx` | Session item display |
| SessionProgressBar | `.../shared/SessionProgressBar.tsx` | Progress indicators |
| SessionRecoveryBanner | `.../shared/SessionRecoveryBanner.tsx` | Session recovery UI |
| SortableContentPieceCard | `.../shared/SortableContentPieceCard.tsx` | Sortable content cards |
| SuggestionButton | `.../shared/SuggestionButton.tsx` | Suggestion buttons |
| TagsEditor | `.../shared/TagsEditor.tsx` | Tag editing interface |
| TruncatedText | `.../shared/TruncatedText.tsx` | Text truncation display |
| WorkflowHeader | `.../shared/WorkflowHeader.tsx` | Header navigation |

### 2.2 Supported Languages

From `/src/lib/i18n/config.ts`:

| Code | Language | Native Name | Flag |
|------|----------|-------------|------|
| en | English | English | GB |
| fr | French | Francais | FR |
| es | Spanish | Espanol | ES |
| de | German | Deutsch | DE |
| nl | Dutch | Nederlands | NL |
| it | Italian | Italiano | IT |

### 2.3 Translation Files Location

| File | Status | Notes |
|------|--------|-------|
| `/messages/en.json` | Source | English (reference) - `workflow` namespace |
| `/messages/fr.json` | Generated | Task 2C.13 completed |
| `/messages/es.json` | Generated | Task 2C.13 completed |
| `/messages/de.json` | Generated | Task 2C.13 completed |
| `/messages/nl.json` | Generated | Task 2C.13 completed |
| `/messages/it.json` | Generated | Task 2C.13 completed |

### 2.4 Workflow Namespace Structure

Per the implementation plan, the `workflow` namespace should include:

```json
{
  "workflow": {
    "header": { },
    "steps": {
      "roomSelection": { },
      "itemType": { },
      "specificItem": { },
      "purpose": { },
      "contentType": { },
      "mediaCapture": { },
      "preview": { },
      "sessionSummary": { }
    },
    "dialogs": { },
    "content": { },
    "validation": { }
  }
}
```

---

## 3. Workflow Steps to Test

### 3.1 Complete Workflow Path

The item creation workflow consists of the following steps:

1. **Room Selection** (`room-selection`)
   - Select a room (Kitchen, Bedroom, Bathroom, etc.)
   - "Other" option with custom room input

2. **Item Type Selection** (`item-type-selection`)
   - Select item category (Appliance, Room Item, General Info)

3. **Specific Item Selection** (`specific-item-selection`)
   - Select or enter specific item name
   - Auto-generated suggestions based on room/type

4. **Purpose Selection** (`purpose-selection`)
   - Select purpose (How to Use, Troubleshooting, Maintenance, etc.)

5. **Content Type Selection** (`content-type-selection`)
   - Select content type (Video, Photo, Text, Upload, Link)

6. **Media Capture/Content Creation** (`media-capture` / `content-creation`)
   - Capture or create content based on selected type

7. **Preview & Save** (`preview-save`)
   - Review item details
   - Edit name/tags if needed
   - Save item

8. **Next Action** (`next-action`)
   - Add more content
   - Tag new item
   - Finish session

9. **Session Summary** (`session-summary`)
   - Review all created items
   - Print options
   - Finish workflow

---

## 4. Technical Approach

### 4.1 Test Environment Setup

```bash
# Start development server
npm run dev

# Access application with language switching
# Option 1: Set FAQBNB_LANG cookie
# Option 2: Use language switcher component (if available)
# Option 3: Browser Accept-Language header
```

### 4.2 Language Switching Methods

Per `/src/lib/i18n/config.ts`:

```typescript
// Cookie-based language switching
const LOCALE_COOKIE_NAME = 'FAQBNB_LANG';

// Set language via browser DevTools console
document.cookie = 'FAQBNB_LANG=es; path=/; max-age=31536000';
// Refresh page to apply
```

### 4.3 Test Categories

#### 4.3.1 Visual Verification Tests
- All text displays in correct language
- No translation keys visible (e.g., `workflow.steps.roomSelection.title`)
- No English fallback text in non-English locales
- Text fits within UI containers without overflow
- Icons and graphics remain consistent

#### 4.3.2 Functional Verification Tests
- Step navigation works correctly in all languages
- Form submissions process correctly
- Validation messages appear in correct language
- Success/error flows complete in all languages
- Back navigation preserves state

#### 4.3.3 Interpolation Tests
- Variable substitution works (`{count}`, `{current}`, `{total}`)
- Pluralization displays correctly (items, pieces)
- Dynamic content integrates with translations
- Room/item names display correctly in context

#### 4.3.4 Responsive Tests
- Mobile viewport displays correctly
- Desktop viewport displays correctly
- Text wrapping handles longer translations (especially German)
- Touch interactions work on mobile

---

## 5. Implementation Tasks

### Task 1: Test Environment Preparation
- Verify development server runs successfully
- Confirm all translation files are in place
- Verify workflow `namespace` exists in all language files
- Document language switching mechanism
- Set up test property with rooms

### Task 2: Room Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Navigate to workflow start
- Verify "Select a Room" title displays in correct language
- Verify all room options display in correct language
  - Kitchen, Bathroom, Bedroom, Living Room, Laundry Room
  - Garage, Outdoor/Patio, General/Whole Property, Other
- Verify "Other" custom room input placeholder
- Verify Continue button text
- Test selection and navigation to next step

### Task 3: Item Type Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What type of item is this?" title
- Verify item type options:
  - Appliance
  - Room Item
  - General Info
- Verify descriptions/subtitles for each option
- Test selection and navigation

### Task 4: Specific Item Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What specific item?" title
- Verify suggestion buttons display in correct language
  - Kitchen: Refrigerator, Dishwasher, Oven, etc.
  - Laundry: Washer, Dryer, etc.
- Verify custom item input placeholder
- Verify auto-generated item name format
- Test selection and navigation

### Task 5: Purpose Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What's the purpose?" title
- Verify purpose options:
  - How to Use
  - How to Clean
  - Troubleshooting
  - Safety Information
  - Maintenance
  - Features & Tips
  - Other
- Test selection and navigation

### Task 6: Content Type Selection Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What content would you like to add?" title
- Verify content type options:
  - Record Video
  - Take Photo
  - Write Text
  - Upload File
  - Add Link
- Verify option descriptions
- Test selection and navigation

### Task 7: Media Capture Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test Video capture adapter:
  - Verify camera permission messages
  - Verify recording controls text
  - Verify "Retake" and "Use This" buttons
- Test Photo capture adapter:
  - Verify camera controls
  - Verify capture confirmation buttons
- Test File upload adapter:
  - Verify "Drag and drop" text
  - Verify "Browse files" button
  - Verify file type/size messages
- Test Text editor adapter:
  - Verify placeholder text
  - Verify formatting toolbar labels
- Test URL input adapter:
  - Verify input placeholder
  - Verify preview loading states

### Task 8: Preview & Save Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "Review" / "Preview" title
- Verify item name editor labels
- Verify tags editor labels
- Verify content piece display
  - Content count: "{count} piece(s) of content"
  - "Drag to reorder" text
- Verify "Save" button text
- Verify "Add More Content" button text
- Test saving item

### Task 9: Next Action Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "What would you like to do next?" title
- Verify action options:
  - "Add More Content" (to current item)
  - "Tag New Item" (start new item)
  - "I'm Done" (finish session)
- Verify session item count display
- Test each action path

### Task 10: Session Summary Step Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Verify "Session Summary" / "Session Complete!" title
- Verify item count: "You created {count} item(s)"
- Verify item cards display correctly
- Verify print options panel:
  - "Print QR Codes"
  - Size options
  - Layout options
- Verify "Finish" button text
- Verify "Create Another Item" option
- Test print and finish flows

### Task 11: Dialog Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test Confirm Exit Dialog:
  - Verify "Exit Item Creation?" title
  - Verify "You have unsaved changes" message
  - Verify "Stay" / "Exit" buttons
- Test Remove Item Dialog:
  - Verify confirmation message
  - Verify "Remove" / "Cancel" buttons
- Test Empty Session Dialog:
  - Verify "No Items Added" title
  - Verify instruction message
- Test Camera Permission Fallback:
  - Verify permission request text
  - Verify retry button

### Task 12: Error State Testing - All Languages
For each language (en, es, fr, de, nl, it):
- Test network error messages
- Test validation error messages:
  - "Item name is required"
  - "At least one content piece is required"
  - "Please select a room"
- Test camera/media errors
- Test QR generation errors
- Test save failures

### Task 13: Mobile Responsiveness Testing
For each language:
- Test workflow on mobile viewport (375px width)
- Verify no text truncation in step titles
- Verify buttons remain usable
- Verify dialogs display correctly
- Test touch interactions for content reordering
- Verify progress bar displays correctly

### Task 14: Edge Case Testing
- Test very long German translations for UI overflow
- Test special characters (accents, umlauts) render correctly
- Test language switching mid-workflow preserves state
- Test session persistence across language changes
- Test "Other" room/item custom inputs in each language
- Test multi-item workflow (2+ items per session)

### Task 15: Documentation and Reporting
- Document any issues found
- Document any untranslated strings discovered
- Document any layout issues per language
- Create test results summary
- Report any regressions or bugs

---

## 6. Authorized Files and Functions for Modification

### 6.1 Files to Potentially Modify (Bug Fixes Only)

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/en.json` | English translations | Fix missing keys only |
| `/messages/fr.json` | French translations | Fix translation issues |
| `/messages/es.json` | Spanish translations | Fix translation issues |
| `/messages/de.json` | German translations | Fix translation issues |
| `/messages/nl.json` | Dutch translations | Fix translation issues |
| `/messages/it.json` | Italian translations | Fix translation issues |

### 6.2 Files to Test (Read Only for Testing)

| File | Test Purpose |
|------|--------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main workflow component |
| `/src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx` | Room selection |
| `/src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx` | Item type selection |
| `/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Specific item selection |
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Purpose selection |
| `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Content type selection |
| `/src/components/ItemCreationWorkflow/components/steps/MediaCaptureStep.tsx` | Media capture |
| `/src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | Content creation |
| `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Session summary |
| `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Next action selection |
| `/src/components/ItemCreationWorkflow/components/steps/adapters/*.tsx` | All adapter components |
| `/src/components/ItemCreationWorkflow/components/shared/*.tsx` | All shared components |
| `/src/lib/i18n/config.ts` | Language configuration |

### 6.3 Test Artifacts to Create

| File | Purpose |
|------|---------|
| Test results log (manual) | Document test outcomes |
| Issue list (if any) | Track discovered problems |
| Screenshot evidence (optional) | Visual verification |

### 6.4 Files NOT to Modify

- TypeScript component source code (unless bug requires fix)
- Database migrations
- API routes
- Build configuration
- Test infrastructure

---

## 7. Dependencies

### 7.1 Required Completions Before This Task

| Task | Status | Notes |
|------|--------|-------|
| 2C.1: Create workflow namespace structure | Must be Complete | Namespace exists in en.json |
| 2C.2: Update main ItemCreationWorkflow | Must be Complete | Component uses translations |
| 2C.3: Update RoomSelectionStep | Must be Complete | Component uses translations |
| 2C.4: Update ItemTypeStep | Must be Complete | Component uses translations |
| 2C.5: Update SpecificItemStep | Must be Complete | Component uses translations |
| 2C.6: Update PurposeStep | Must be Complete | Component uses translations |
| 2C.7: Update ContentTypeStep | Must be Complete | Component uses translations |
| 2C.8: Update MediaCaptureStep and adapters | Must be Complete | Component uses translations |
| 2C.9: Update PreviewSaveStep | Must be Complete | Component uses translations |
| 2C.10: Update SessionSummaryStep | Must be Complete | Component uses translations |
| 2C.11: Update all shared components | Must be Complete | All 25+ files updated |
| 2C.12: Update all dialog components | Must be Complete | Dialogs use translations |
| 2C.13: Generate translations | Must be Complete | All 5 non-English files populated |
| Epic 1: i18n Foundation | Must be Complete | Translation infrastructure operational |

### 7.2 External Dependencies

| Dependency | Purpose |
|------------|---------|
| Development server | Running application for testing |
| Browser DevTools | Language/cookie manipulation |
| Test property data | Rooms and property setup |
| Camera/microphone access | Media capture testing |
| Network conditions | Error state testing |

---

## 8. Acceptance Criteria

### 8.1 Room Selection Step Criteria
- [ ] Room selection step loads in all six languages without errors
- [ ] "Select a Room" title displays in correct language
- [ ] All room options (Kitchen, Bedroom, etc.) display in correct language
- [ ] "Other" room custom input works with translated placeholder
- [ ] Continue button displays in correct language
- [ ] Step navigation functions correctly

### 8.2 Item Type Selection Step Criteria
- [ ] "What type of item?" title displays in correct language
- [ ] Appliance, Room Item, General Info options translate correctly
- [ ] Option descriptions display in correct language
- [ ] Selection and navigation work correctly

### 8.3 Specific Item Selection Step Criteria
- [ ] Step title displays in correct language
- [ ] Suggestion buttons display translated item names
- [ ] Custom item input placeholder translates
- [ ] Auto-generated item name format works correctly

### 8.4 Purpose Selection Step Criteria
- [ ] Step title displays in correct language
- [ ] All purpose options (How to Use, Troubleshooting, etc.) translate
- [ ] Purpose descriptions display correctly
- [ ] Selection works and advances workflow

### 8.5 Content Type Selection Step Criteria
- [ ] Step title displays in correct language
- [ ] All content options (Video, Photo, Text, etc.) translate
- [ ] Option descriptions translate correctly
- [ ] Selection leads to correct capture/creation step

### 8.6 Media Capture Step Criteria
- [ ] Camera permission messages display in correct language
- [ ] Recording/capture controls translate correctly
- [ ] "Retake" and "Use This" buttons translate
- [ ] Error messages display in correct language
- [ ] All adapter-specific text translates

### 8.7 Preview & Save Step Criteria
- [ ] Step title displays in correct language
- [ ] Item name editor labels translate
- [ ] Tags editor labels translate
- [ ] Content count displays with correct pluralization
- [ ] "Save" and "Add More Content" buttons translate
- [ ] Drag-to-reorder text translates

### 8.8 Next Action Step Criteria
- [ ] Step title displays in correct language
- [ ] All action options translate correctly
- [ ] Session item count displays with correct pluralization
- [ ] All action paths function correctly

### 8.9 Session Summary Step Criteria
- [ ] Step title displays in correct language
- [ ] Item count with pluralization displays correctly
- [ ] Print options panel translates completely
- [ ] "Finish" and "Create Another" options translate
- [ ] QR code generation status messages translate

### 8.10 Dialog Criteria
- [ ] Confirm Exit Dialog translates completely
- [ ] Remove Item Dialog translates completely
- [ ] Empty Session Dialog translates completely
- [ ] Camera Permission Fallback translates completely
- [ ] All dialog buttons translate correctly

### 8.11 Validation Message Criteria
- [ ] "Item name is required" displays in correct language
- [ ] "At least one content piece is required" translates
- [ ] "Please select a room" translates
- [ ] All validation interpolation works correctly

### 8.12 Visual Criteria
- [ ] No translation keys visible in any language
- [ ] No English text visible in non-English locales
- [ ] Text fits within UI containers in all languages
- [ ] German translations (typically longer) do not cause overflow
- [ ] Special characters (accents, umlauts) render correctly
- [ ] Icons remain consistent across languages

### 8.13 Functional Criteria
- [ ] Complete workflow flow works in all languages
- [ ] Multi-item sessions work correctly
- [ ] Session persistence works across language changes
- [ ] Print flow works in all languages
- [ ] Navigation (back/forward) works correctly

### 8.14 Responsive Criteria
- [ ] Workflow displays correctly on mobile (375px)
- [ ] All steps usable on mobile
- [ ] Dialogs display correctly on mobile
- [ ] No horizontal scrolling required

---

## 9. Testing Checklist

### 9.1 English (en) - Baseline

#### Complete Workflow Flow
- [ ] Start workflow from dashboard
- [ ] Verify "Select a Room" step
- [ ] Select "Kitchen" room
- [ ] Verify "What type of item is this?" step
- [ ] Select "Appliance"
- [ ] Verify "What specific item?" step
- [ ] Select "Refrigerator"
- [ ] Verify "What's the purpose?" step
- [ ] Select "How to Use"
- [ ] Verify "What content would you like to add?" step
- [ ] Select "Record Video"
- [ ] Verify media capture step
- [ ] Complete capture
- [ ] Verify preview step with "Kitchen - Refrigerator" name
- [ ] Save item
- [ ] Verify next action options
- [ ] Select "I'm Done"
- [ ] Verify session summary
- [ ] Verify "1 item" count
- [ ] Click "Finish"

### 9.2 Spanish (es)

#### Complete Workflow Flow
- [ ] Set language to Spanish
- [ ] Start workflow
- [ ] Verify "Seleccionar habitacion" or equivalent
- [ ] Navigate through all steps in Spanish
- [ ] Verify all text is in Spanish
- [ ] Complete full workflow
- [ ] Verify no English text visible

### 9.3 French (fr)

#### Complete Workflow Flow
- [ ] Set language to French
- [ ] Start workflow
- [ ] Verify "Selectionner une piece" or equivalent
- [ ] Navigate through all steps in French
- [ ] Verify all text is in French
- [ ] Complete full workflow
- [ ] Verify no English text visible

### 9.4 German (de)

#### Complete Workflow Flow
- [ ] Set language to German
- [ ] Start workflow
- [ ] Verify "Raum auswahlen" or equivalent
- [ ] Navigate through all steps in German
- [ ] **Verify no text overflow** (German is typically 30% longer)
- [ ] Complete full workflow
- [ ] Verify no English text visible

### 9.5 Dutch (nl)

#### Complete Workflow Flow
- [ ] Set language to Dutch
- [ ] Start workflow
- [ ] Verify "Selecteer een kamer" or equivalent
- [ ] Navigate through all steps in Dutch
- [ ] Verify all text is in Dutch
- [ ] Complete full workflow
- [ ] Verify no English text visible

### 9.6 Italian (it)

#### Complete Workflow Flow
- [ ] Set language to Italian
- [ ] Start workflow
- [ ] Verify "Seleziona una stanza" or equivalent
- [ ] Navigate through all steps in Italian
- [ ] Verify all text is in Italian
- [ ] Complete full workflow
- [ ] Verify no English text visible

### 9.7 Cross-Language Tests

- [ ] Language switching preserves workflow state
- [ ] No console errors about missing translation keys
- [ ] No visible `{variable}` placeholders in any language
- [ ] Brand names remain consistent
- [ ] Item/room names display correctly across languages
- [ ] Multi-item workflow (create 2+ items) works in all languages

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys discovered | Medium | Medium | Document and fix in translation files |
| Translation quality issues found | Medium | Low | Note for later review, don't block |
| Layout breaks in specific languages | Medium | Medium | Document, may require CSS adjustments |
| Media capture fails during testing | Low | Medium | Use alternate content type for that test |
| Session persistence issues | Low | High | Test recovery flow separately |
| False positives from caching | Medium | Low | Clear cache between language tests |
| Mobile-specific issues | Medium | Medium | Test on actual mobile viewport |
| German text overflow | High | Medium | Document specific locations for CSS fixes |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Test environment preparation | 20 minutes |
| Room selection testing (6 languages) | 30 minutes |
| Item type selection testing (6 languages) | 20 minutes |
| Specific item selection testing (6 languages) | 25 minutes |
| Purpose selection testing (6 languages) | 20 minutes |
| Content type selection testing (6 languages) | 25 minutes |
| Media capture testing (6 languages) | 45 minutes |
| Preview & save testing (6 languages) | 30 minutes |
| Next action testing (6 languages) | 15 minutes |
| Session summary testing (6 languages) | 30 minutes |
| Dialog testing (6 languages) | 30 minutes |
| Error state testing (6 languages) | 25 minutes |
| Mobile responsiveness testing | 30 minutes |
| Edge case testing | 25 minutes |
| Documentation and reporting | 20 minutes |
| **Total** | **~6.5 hours** |

---

## 12. Test Data Requirements

### 12.1 Test Property Setup

| Requirement | Details |
|-------------|---------|
| Test property | Property with rooms defined |
| Room types | At least 3-4 rooms for testing |
| Existing items | Optional, for duplicate name testing |

### 12.2 Browser Configuration

For each language test:

```javascript
// Set language via cookie
document.cookie = 'FAQBNB_LANG=de; path=/; max-age=31536000';
// Then refresh page

// Clear for next language
document.cookie = 'FAQBNB_LANG=; path=/; max-age=0';
```

### 12.3 Device/Viewport Requirements

| Device Type | Viewport | Purpose |
|-------------|----------|---------|
| Desktop | 1920x1080 | Standard testing |
| Tablet | 768x1024 | Responsive testing |
| Mobile | 375x667 | Mobile layout testing |

---

## 13. Bug Reporting Template

If issues are discovered during testing, document them as follows:

```markdown
## Bug: [Brief Description]

**Language:** [en/es/fr/de/nl/it]
**Workflow Step:** [room-selection/item-type/etc.]
**Component:** [ComponentName]
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

### Translation Key (if missing)
[e.g., workflow.steps.roomSelection.title]

### Suggested Fix
[If obvious]
```

---

## 14. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2C section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-069
- [REQ-E02-056: Create Workflow Namespace](/docs/REQ-E02-056-create-workflow-namespace-structure-overview.md)
- [REQ-E02-057: Update Main Workflow](/docs/REQ-E02-057-update-main-itemcreationworkflow-component-overview.md)
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
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Existing Integration Tests](/src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx)
- [E2E Test Utilities](/src/components/ItemCreationWorkflow/__tests__/e2e/test-utils.tsx)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow*
