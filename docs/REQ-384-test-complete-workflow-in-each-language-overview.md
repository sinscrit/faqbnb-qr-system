# REQ-384: Test Complete Item Creation Workflow in Each Language

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-384
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.14
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Status:** Ready for Implementation

---

## 1. Summary

This task validates that the complete Item Creation Workflow functions correctly and displays properly translated content in all 6 supported languages (English, French, Spanish, German, Dutch, Italian). This is the final validation step for Sub-Epic 2C, ensuring the workflow delivers a production-ready localized experience.

---

## 2. Context & Background

### 2.1 Epic 2 Context

Epic 2 focuses on extracting approximately 3,200+ hardcoded UI strings from 275+ React components and translating them to all 6 supported languages. Sub-Epic 2C specifically addresses the Item Creation Workflow, which is the largest component set with:
- 8 step components
- 5 adapter components
- 25+ shared components
- Multiple dialog components
- Estimated ~500 strings

### 2.2 Dependencies from Previous Tasks

This testing task depends on the completion of:

| REQ | Description | Status |
|-----|-------------|--------|
| REQ-371 | Create workflow namespace structure | ✓ |
| REQ-372 | Update main ItemCreationWorkflow component | ✓ |
| REQ-373 | Update RoomSelectionStep | ✓ |
| REQ-374 | Update ItemTypeStep | ✓ |
| REQ-375 | Update SpecificItemStep | ✓ |
| REQ-376 | Update PurposeStep | ✓ |
| REQ-377 | Update ContentTypeStep | ✓ |
| REQ-378 | Update MediaCaptureStep and adapters | ✓ |
| REQ-379 | Update PreviewSaveStep | ✓ |
| REQ-380 | Update SessionSummaryStep | ✓ |
| REQ-381 | Update all shared components | ✓ |
| REQ-382 | Update all dialog components | ✓ |
| REQ-383 | Generate translations for 5 non-English languages | ✓ |

### 2.3 Workflow Structure

The Item Creation Workflow consists of:

**User-visible steps (1-8):**
1. `room-selection` → RoomSelectionStep
2. `item-type-selection` → ItemTypeStep
3. `specific-item-selection` → SpecificItemStep
4. `purpose-selection` → PurposeStep
5. `content-type-selection` → ContentTypeStep
6. `media-capture` → MediaCaptureStep
7. `content-creation` → ContentCreationStep (legacy)
8. `preview-save` → PreviewSaveStep

**Post-workflow screens:**
- `next-action` → WhatsNextStep
- `session-summary` → SessionSummaryStep

---

## 3. Supported Languages

| Code | English Name | Native Name | Flag |
|------|--------------|-------------|------|
| en | English | English | 🇬🇧 |
| fr | French | Français | 🇫🇷 |
| es | Spanish | Español | 🇪🇸 |
| de | German | Deutsch | 🇩🇪 |
| nl | Dutch | Nederlands | 🇳🇱 |
| it | Italian | Italiano | 🇮🇹 |

---

## 4. Implementation Tasks

### Task 1: Test Environment Setup

**Description:** Prepare the testing environment with proper test accounts and verify staging deployment.

**Steps:**
1. Verify staging deployment is current (`/api/version`)
2. Create or verify test user account exists
3. Clear browser cookies/cache before testing
4. Verify LanguageSwitcher component is accessible in navigation

**Acceptance Criteria:**
- [ ] Staging environment accessible at https://faqbnb-staging.up.railway.app
- [ ] Test user can log in successfully
- [ ] LanguageSwitcher dropdown visible and functional in header/navigation
- [ ] All 6 languages available in dropdown

---

### Task 2: Create Test Matrix and Documentation Template

**Description:** Create a structured test matrix documenting all workflow steps × languages combinations.

**Test Matrix Structure:**

| Step | EN | FR | ES | DE | NL | IT |
|------|:--:|:--:|:--:|:--:|:--:|:--:|
| RoomSelectionStep | - | - | - | - | - | - |
| ItemTypeStep | - | - | - | - | - | - |
| SpecificItemStep | - | - | - | - | - | - |
| PurposeStep | - | - | - | - | - | - |
| ContentTypeStep | - | - | - | - | - | - |
| MediaCaptureStep | - | - | - | - | - | - |
| PreviewSaveStep | - | - | - | - | - | - |
| SessionSummaryStep | - | - | - | - | - | - |
| WhatsNextStep | - | - | - | - | - | - |
| WorkflowHeader | - | - | - | - | - | - |
| Dialogs | - | - | - | - | - | - |

**Output File:** `docs/testing/results/L10N-Epic2-Workflow-Test-Results.md`

---

### Task 3: Test English (en) - Baseline

**Description:** Execute complete workflow in English to establish baseline functionality.

**Test Scenario:**
1. Log in with test account
2. Ensure language is set to English
3. Navigate to workflow (New QR Code Item)
4. Complete workflow through all steps:
   - Select a room
   - Select item type
   - Enter specific item name
   - Select purpose
   - Select content type
   - Capture/upload content
   - Review and save
   - View session summary
5. Document all UI text observed

**Validation Points:**
- [ ] WorkflowHeader shows correct step counter (e.g., "Step 1 of 8")
- [ ] All step titles display in English
- [ ] All button labels display in English
- [ ] All form labels and placeholders display in English
- [ ] Navigation (Back/Exit) shows English text
- [ ] Dialogs (ConfirmExitDialog, etc.) show English text
- [ ] Toast notifications appear in English
- [ ] Error messages appear in English (if triggered)
- [ ] Progress bar and step indicator work correctly

---

### Task 4: Test French (fr)

**Description:** Execute complete workflow in French.

**Test Scenario:**
1. Switch language to French via LanguageSwitcher
2. Verify page reloads/updates with French content
3. Navigate to workflow
4. Execute complete workflow flow
5. Document any untranslated strings or issues

**Validation Points:**
- [ ] Step titles translated: "Sélectionner une pièce", etc.
- [ ] Button labels: "Continuer", "Retour", "Enregistrer"
- [ ] Form labels translated
- [ ] Room names translated (Chambre, Cuisine, Salon, etc.)
- [ ] Item types translated
- [ ] Purpose options translated
- [ ] Content type options translated
- [ ] Dialogs fully translated
- [ ] No translation keys visible (e.g., `workflow.steps.roomSelection.title`)
- [ ] Special characters render correctly (é, è, ê, ç, etc.)

---

### Task 5: Test Spanish (es)

**Description:** Execute complete workflow in Spanish.

**Test Scenario:**
1. Switch language to Spanish via LanguageSwitcher
2. Navigate to workflow
3. Execute complete workflow flow

**Validation Points:**
- [ ] Step titles translated: "Seleccionar una habitación", etc.
- [ ] Button labels: "Continuar", "Volver", "Guardar"
- [ ] Room names translated (Dormitorio, Cocina, Salón, etc.)
- [ ] Special characters render correctly (ñ, á, é, í, ó, ú, ü)
- [ ] No untranslated strings
- [ ] No translation keys visible

---

### Task 6: Test German (de)

**Description:** Execute complete workflow in German with special attention to text overflow.

**Test Scenario:**
1. Switch language to German via LanguageSwitcher
2. Navigate to workflow
3. Execute complete workflow flow
4. **CRITICAL:** Check for text overflow/truncation (German has longer words)

**Validation Points:**
- [ ] Step titles translated: "Zimmer auswählen", etc.
- [ ] Button labels: "Weiter", "Zurück", "Speichern"
- [ ] Room names translated (Schlafzimmer, Küche, Wohnzimmer, etc.)
- [ ] Special characters render correctly (ä, ö, ü, ß)
- [ ] **No text overflow or clipping on buttons**
- [ ] **No text overflow in step headers**
- [ ] **Dialogs accommodate longer German text**
- [ ] RoomCard component accommodates "Waschküche" (Laundry) without truncation
- [ ] Form labels and placeholders fit within containers

---

### Task 7: Test Dutch (nl)

**Description:** Execute complete workflow in Dutch.

**Test Scenario:**
1. Switch language to Dutch via LanguageSwitcher
2. Navigate to workflow
3. Execute complete workflow flow

**Validation Points:**
- [ ] Step titles translated: "Selecteer een kamer", etc.
- [ ] Button labels: "Doorgaan", "Terug", "Opslaan"
- [ ] Room names translated (Slaapkamer, Keuken, Woonkamer, etc.)
- [ ] Special characters render correctly (if any)
- [ ] No untranslated strings
- [ ] Check for text overflow (Dutch can also have longer compound words)

---

### Task 8: Test Italian (it)

**Description:** Execute complete workflow in Italian.

**Test Scenario:**
1. Switch language to Italian via LanguageSwitcher
2. Navigate to workflow
3. Execute complete workflow flow

**Validation Points:**
- [ ] Step titles translated: "Seleziona una stanza", etc.
- [ ] Button labels: "Continua", "Indietro", "Salva"
- [ ] Room names translated (Camera da letto, Cucina, Soggiorno, etc.)
- [ ] Special characters render correctly (à, è, é, ì, ò, ù)
- [ ] No untranslated strings
- [ ] No translation keys visible

---

### Task 9: Cross-Step Validation

**Description:** Validate cross-cutting concerns across all steps and languages.

**Test Scenarios:**

**9.1 Navigation Elements:**
- [ ] WorkflowHeader Back button works in all languages
- [ ] WorkflowHeader Exit button triggers confirmation dialog in all languages
- [ ] Progress bar updates correctly regardless of language
- [ ] Step counter displays correctly (e.g., "Étape 2 sur 8" in French)

**9.2 Dialogs:**
- [ ] ConfirmExitDialog displays in selected language
- [ ] RemoveItemDialog displays in selected language
- [ ] EmptySessionDialog displays in selected language
- [ ] PDFExportDialog displays in selected language

**9.3 Shared Components:**
- [ ] SessionProgressBar text translated
- [ ] RoomCard labels translated
- [ ] ItemTypeCard labels translated
- [ ] ContentPieceCard text translated
- [ ] TagsEditor labels translated
- [ ] ItemNameEditor labels and placeholders translated

---

### Task 10: Edge Cases and Error Scenarios

**Description:** Test error handling and edge cases in multiple languages.

**Test Scenarios:**

**10.1 Form Validation Errors:**
- [ ] Required field validation messages appear in selected language
- [ ] Character limit warnings appear in selected language

**10.2 Network Errors:**
- [ ] Network error messages display in selected language (if applicable)
- [ ] Retry button labels translated

**10.3 Empty States:**
- [ ] Empty state messages translated (e.g., "No rooms found")
- [ ] Empty session messages translated

**10.4 Loading States:**
- [ ] Loading indicators show translated text (e.g., "Saving...")

**10.5 Camera/Media Permission:**
- [ ] Camera permission request messages translated
- [ ] CameraPermissionFallback component text translated

---

### Task 11: Language Switching Mid-Flow

**Description:** Test switching languages while in the middle of the workflow.

**Test Scenario:**
1. Start workflow in English
2. Progress to step 3 (SpecificItemStep)
3. Switch language to French via LanguageSwitcher
4. Verify:
   - [ ] UI updates to French without losing workflow state
   - [ ] Previously entered data persists
   - [ ] Current step displays correctly in French
   - [ ] Backward navigation works correctly
   - [ ] Forward navigation works correctly

---

### Task 12: Mobile Responsiveness

**Description:** Test workflow localization on mobile viewports.

**Test Scenario:**
1. Set browser viewport to 375px width (iPhone)
2. Test in German (longest text)
3. Navigate through workflow

**Validation Points:**
- [ ] Touch targets remain appropriately sized
- [ ] Text does not overflow horizontally
- [ ] Buttons remain fully visible and readable
- [ ] Step headers wrap appropriately if needed
- [ ] LanguageSwitcher is accessible on mobile

---

### Task 13: Documentation and Issue Reporting

**Description:** Document test results and create defect reports for any issues found.

**Deliverables:**
1. Complete test results matrix
2. Screenshots for each language/step combination (optional)
3. Defect reports for any issues (using `L10N-E2E-Defect-Report-Template.md`)
4. Summary report with pass/fail status

**Issue Categories to Document:**
- Missing translations (keys visible instead of text)
- Incorrect translations
- Text overflow/truncation
- Layout breaks
- Character encoding issues
- Pluralization errors
- Functional issues related to localization

---

## 5. Authorized Files and Functions for Modification

This is a **testing task** - no code modifications should be required. However, the following files should be **monitored** during testing:

### 5.1 Translation Files (Monitor Only)
| File | Purpose |
|------|---------|
| `/messages/en.json` | English translations - workflow namespace |
| `/messages/fr.json` | French translations - workflow namespace |
| `/messages/es.json` | Spanish translations - workflow namespace |
| `/messages/de.json` | German translations - workflow namespace |
| `/messages/nl.json` | Dutch translations - workflow namespace |
| `/messages/it.json` | Italian translations - workflow namespace |

### 5.2 Component Files (Monitor Only)
| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main orchestrator |
| `/src/components/ItemCreationWorkflow/components/steps/*.tsx` | All step components |
| `/src/components/ItemCreationWorkflow/components/shared/*.tsx` | All shared components |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Language selection |

### 5.3 Test Documentation Files (Create/Modify)
| File | Purpose |
|------|---------|
| `/docs/testing/results/L10N-Epic2-Workflow-Test-Results.md` | Test results |
| `/docs/testing/results/L10N-Epic2-Workflow-Defects.md` | Defect reports (if needed) |

---

## 6. Testing Tools and Utilities

### 6.1 Browser Tools
- **Developer Tools > Application > Cookies** - Verify `FAQBNB_LANG` cookie
- **Developer Tools > Console** - Check for missing translation warnings
- **Developer Tools > Network** - Monitor API responses
- **Responsive Design Mode** - Test mobile viewports

### 6.2 Verification Commands
```bash
# Check current locale cookie in browser console
document.cookie.split(';').find(c => c.includes('FAQBNB_LANG'))

# Check for translation warnings in console
# Look for: "Missing translation: ..."
```

### 6.3 Database Verification (Optional)
```sql
-- Verify user language preference
SELECT preferred_language FROM users WHERE email = '[test_email]';
```

---

## 7. Common Issues to Watch For

| Issue Type | Example | Language Most Affected |
|------------|---------|------------------------|
| Text overflow | "Waschküche" truncated | German, Dutch |
| Missing translation | `workflow.steps.title` displayed | All |
| Character encoding | "Français" shows as "Fran?ais" | French, Spanish |
| Pluralization | "1 items" instead of "1 item" | All |
| Layout break | Button pushed off-screen | German, Dutch |
| Hardcoded string | "Save" appearing in French UI | All |
| Incorrect interpolation | "{count} élément" missing value | All |

---

## 8. Estimated Effort

| Phase | Duration |
|-------|----------|
| Test setup and preparation | 30 minutes |
| Per-language full workflow test (6 × 45 min) | 4.5 hours |
| Edge case and error scenario testing | 1 hour |
| Cross-browser validation (if required) | 1 hour |
| Documentation and issue reporting | 1 hour |
| **Total Estimated** | **8-9 hours** |

---

## 9. Acceptance Criteria

### 9.1 Functional Criteria
- [ ] Complete workflow tested in English (en) from start to finish
- [ ] Complete workflow tested in Spanish (es) from start to finish
- [ ] Complete workflow tested in French (fr) from start to finish
- [ ] Complete workflow tested in German (de) from start to finish
- [ ] Complete workflow tested in Italian (it) from start to finish
- [ ] Complete workflow tested in Dutch (nl) from start to finish

### 9.2 Translation Criteria
- [ ] All step transitions display correct language-specific content
- [ ] All buttons and navigation elements show translated labels
- [ ] All form labels, placeholders, and validation messages appear in selected language
- [ ] All dialog boxes and confirmation messages display correct translations
- [ ] All error messages and toast notifications appear in selected language
- [ ] No untranslated strings or fallback keys appear in any language

### 9.3 Visual Criteria
- [ ] No text overflow or truncation issues in any language
- [ ] Special characters and diacritics render correctly in all languages
- [ ] Layout remains intact in all languages

### 9.4 State Management
- [ ] Workflow state persists correctly when switching languages mid-flow
- [ ] Language preference persists across page reloads

---

## 10. Related Documentation

- **PRD:** `/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Test Protocol:** `/docs/testing/L10N-E2E-Test-Protocol.md`
- **Results Template:** `/docs/testing/L10N-E2E-Test-Results-Template.md`
- **Defect Template:** `/docs/testing/L10N-E2E-Defect-Report-Template.md`
- **Pre-Test Checklist:** `/docs/testing/L10N-Pre-Test-Checklist.md`

---

## 11. Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Tester | | | Pending |
| Reviewer | | | Pending |
| QA Lead | | | Pending |

---

*Document created for REQ-384: Test Complete Item Creation Workflow in Each Language*
*Part of Epic 2 - Static UI Translation, Sub-Epic 2C - Item Creation Workflow*
