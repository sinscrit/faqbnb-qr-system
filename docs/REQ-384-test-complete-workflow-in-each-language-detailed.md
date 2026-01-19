# REQ-384: Test Complete Item Creation Workflow in Each Language - Detailed Task Breakdown

**Document Generated:** 2026-01-19 10:30 UTC
**Last Modified:** 2026-01-19 10:30 UTC
**Implementation Status:** Ready for Testing
**Request Reference:** REQ-384 (Complete Workflow E2E Localization Testing)
**Overview Document:** [REQ-384-test-complete-workflow-in-each-language-overview.md](/docs/REQ-384-test-complete-workflow-in-each-language-overview.md)
**Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.14

---

## Executive Summary

This document provides actionable, granular test tasks for validating the complete Item Creation Workflow across all 6 supported languages (English, French, Spanish, German, Dutch, Italian). Each task is scoped to approximately 1 story point and includes specific test scenarios, expected results, and documentation requirements.

This is the **final validation task** for Sub-Epic 2C, ensuring the workflow delivers a production-ready localized experience before marking the sub-epic as complete.

### Testing Scope

| Scope Element | Details |
|---------------|---------|
| Languages | 6 (en, fr, es, de, nl, it) |
| Workflow Steps | 8-10 (room selection → session summary) |
| Component Files | 86+ workflow components |
| Estimated Strings | ~500 in workflow namespace |
| Test Matrix Size | 60+ test cases (10 steps × 6 languages) |

### Acceptance Criteria Summary (from REQ-384)

- [ ] Complete workflow tested in English (en) from start to finish
- [ ] Complete workflow tested in French (fr) from start to finish
- [ ] Complete workflow tested in Spanish (es) from start to finish
- [ ] Complete workflow tested in German (de) from start to finish
- [ ] Complete workflow tested in Dutch (nl) from start to finish
- [ ] Complete workflow tested in Italian (it) from start to finish
- [ ] All step transitions display correct language-specific content
- [ ] All buttons and navigation elements show translated labels
- [ ] All form labels, placeholders, and validation messages appear in selected language
- [ ] All dialog boxes and confirmation messages display correct translations
- [ ] All error messages and toast notifications appear in selected language
- [ ] No untranslated strings or fallback keys appear in any language
- [ ] No text overflow or truncation issues in any language
- [ ] Special characters and diacritics render correctly in all languages
- [ ] Workflow state persists correctly when switching languages mid-flow

---

## Pre-Test Checklist

Before starting test execution, verify:

### Environment Prerequisites

- [ ] Staging deployment is current (check `/api/version`)
- [ ] Test user account exists and can log in
- [ ] All translation files are deployed (`/messages/*.json`)
- [ ] LanguageSwitcher component is accessible in navigation

### Dependency Verification

| REQ | Description | Status |
|-----|-------------|--------|
| REQ-371 | Create workflow namespace structure | Must be ✓ |
| REQ-372 | Update main ItemCreationWorkflow component | Must be ✓ |
| REQ-373 | Update RoomSelectionStep | Must be ✓ |
| REQ-374 | Update ItemTypeStep | Must be ✓ |
| REQ-375 | Update SpecificItemStep | Must be ✓ |
| REQ-376 | Update PurposeStep | Must be ✓ |
| REQ-377 | Update ContentTypeStep | Must be ✓ |
| REQ-378 | Update MediaCaptureStep and adapters | Must be ✓ |
| REQ-379 | Update PreviewSaveStep | Must be ✓ |
| REQ-380 | Update SessionSummaryStep | Must be ✓ |
| REQ-381 | Update all shared components | Must be ✓ |
| REQ-382 | Update all dialog components | Must be ✓ |
| REQ-383 | Generate translations for 5 non-English languages | Must be ✓ |

### Verification Commands

```bash
# Check staging version
curl https://faqbnb-staging.up.railway.app/api/version

# Verify translation files exist locally
ls -la messages/*.json

# Check workflow namespace exists in English file
grep -c '"workflow"' messages/en.json
# Expected: 1 (indicating namespace exists)
```

---

## Task 1: Test Environment Setup and Validation

**Story Points:** 0.5
**Dependencies:** All REQ-371 through REQ-383 complete
**Estimated Duration:** 30 minutes

### Objective

Prepare the testing environment, verify staging deployment, and confirm LanguageSwitcher functionality.

### Test Steps

1. **Verify Staging Deployment**
   - Navigate to: `https://faqbnb-staging.up.railway.app`
   - Check version endpoint: `https://faqbnb-staging.up.railway.app/api/version`
   - Expected: Latest version deployed

2. **Create/Verify Test Account**
   - Log in with test user credentials
   - Verify successful authentication
   - Expected: Dashboard loads without errors

3. **Verify LanguageSwitcher Access**
   - Locate LanguageSwitcher in navigation/header
   - Open dropdown
   - Expected: All 6 languages visible and selectable

4. **Clear Browser State**
   - Clear cookies related to language preference
   - Clear local storage
   - Expected: Fresh state for testing

### Verification Checklist

- [ ] **V1.1:** Staging environment accessible at https://faqbnb-staging.up.railway.app
- [ ] **V1.2:** Test user can log in successfully
- [ ] **V1.3:** LanguageSwitcher dropdown visible and functional in navigation
- [ ] **V1.4:** All 6 languages available in dropdown
- [ ] **V1.5:** Language selection changes UI content

### Browser Console Commands

```javascript
// Check current language cookie
document.cookie.split(';').find(c => c.includes('FAQBNB_LANG'))

// Check for translation-related errors in console
// Look for: "Missing translation: ..."
```

---

## Task 2: Create Test Matrix and Documentation

**Story Points:** 0.5
**Dependencies:** Task 1 complete
**Estimated Duration:** 30 minutes

### Objective

Create a structured test matrix template and establish documentation format for tracking test results.

### Deliverable Files

Create the following documentation files:

#### 2.1 Test Results Matrix Template

**File:** `/docs/testing/results/L10N-Epic2-Workflow-Test-Results.md`

```markdown
# L10N Epic 2 - Workflow Test Results

**Test Date:** [DATE]
**Tester:** [NAME]
**Version:** [VERSION]

## Test Matrix

| Step | EN | FR | ES | DE | NL | IT | Notes |
|------|:--:|:--:|:--:|:--:|:--:|:--:|-------|
| RoomSelectionStep | - | - | - | - | - | - | |
| ItemTypeStep | - | - | - | - | - | - | |
| SpecificItemStep | - | - | - | - | - | - | |
| PurposeStep | - | - | - | - | - | - | |
| ContentTypeStep | - | - | - | - | - | - | |
| MediaCaptureStep | - | - | - | - | - | - | |
| PreviewSaveStep | - | - | - | - | - | - | |
| SessionSummaryStep | - | - | - | - | - | - | |
| WhatsNextStep | - | - | - | - | - | - | |
| WorkflowHeader | - | - | - | - | - | - | |
| Dialogs | - | - | - | - | - | - | |

**Legend:**
- ✓ = Pass
- ✗ = Fail (see defects)
- ⚠ = Warning (minor issue)
- - = Not tested

## Summary

- **Total Test Cases:** 66 (11 steps × 6 languages)
- **Passed:**
- **Failed:**
- **Warnings:**

## Issues Found

| ID | Language | Step | Issue | Severity | Status |
|----|----------|------|-------|----------|--------|
| | | | | | |
```

#### 2.2 Defect Report Template

**File:** `/docs/testing/results/L10N-Epic2-Workflow-Defects.md` (create if issues found)

```markdown
# L10N Epic 2 - Workflow Defect Report

## Defect: [DEFECT_ID]

**Severity:** Critical / High / Medium / Low
**Language:** [LANGUAGE_CODE]
**Step:** [WORKFLOW_STEP]
**Component:** [COMPONENT_FILE]

### Description
[Detailed description of the issue]

### Steps to Reproduce
1.
2.
3.

### Expected Result
[What should happen]

### Actual Result
[What actually happened]

### Screenshot
[If applicable]

### Translation Key (if applicable)
`workflow.xxx.yyy`

### Suggested Fix
[If known]
```

### Verification Checklist

- [ ] **V2.1:** Test results file created at `/docs/testing/results/`
- [ ] **V2.2:** Defect template ready for use
- [ ] **V2.3:** Test matrix covers all workflow steps
- [ ] **V2.4:** All 6 languages represented in matrix

---

## Task 3: Test English (en) - Baseline

**Story Points:** 1
**Dependencies:** Tasks 1-2 complete
**Estimated Duration:** 45 minutes

### Objective

Execute complete workflow in English to establish baseline functionality and verify all strings are properly connected to the translation system.

### Test Scenario

1. Log in with test account
2. Ensure language is set to English (en)
3. Navigate to Item Creation Workflow (New QR Code Item)
4. Complete workflow through all steps

### Step-by-Step Test Cases

#### TC3.1: RoomSelectionStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step title | "Select a Room" or similar | [ ] |
| Subtitle/description | English text | [ ] |
| Room list labels | English room names | [ ] |
| Search placeholder | English placeholder text | [ ] |
| "Add Room" button | "Add Room" or "Create Room" | [ ] |
| Continue button | "Continue" or "Next" | [ ] |

#### TC3.2: ItemTypeStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step title | "What type of item?" or similar | [ ] |
| Category labels | English (Appliance, Furniture, etc.) | [ ] |
| Item type descriptions | English text | [ ] |

#### TC3.3: SpecificItemStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step title | "Which specific item?" or similar | [ ] |
| Search placeholder | English placeholder | [ ] |
| Suggestions label | "Suggestions" or similar | [ ] |
| Custom name option | English text | [ ] |

#### TC3.4: PurposeStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step title | "What's the purpose?" or similar | [ ] |
| Purpose options | How to Use, Troubleshooting, etc. | [ ] |
| Descriptions | English text | [ ] |

#### TC3.5: ContentTypeStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step title | "How do you want to add content?" or similar | [ ] |
| Content type options | Take Photo, Record Video, etc. | [ ] |
| Option descriptions | English text | [ ] |

#### TC3.6: MediaCaptureStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Capture instructions | English text | [ ] |
| Button labels | "Take Photo", "Retake", "Use This" | [ ] |
| Permission messages | English (if triggered) | [ ] |

#### TC3.7: PreviewSaveStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step title | "Review & Save" or similar | [ ] |
| Field labels | Item Name, Description, Tags, etc. | [ ] |
| Save button | "Save Item" or "Save" | [ ] |
| Saving state | "Saving..." | [ ] |

#### TC3.8: SessionSummaryStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Title | "Session Complete!" or similar | [ ] |
| Summary text | English count/summary | [ ] |
| Action buttons | Print, Create Another, Done | [ ] |

#### TC3.9: WorkflowHeader (Cross-Step)

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step counter | "Step 1 of 8" format | [ ] |
| Back button | "Back" | [ ] |
| Exit button | "Exit" | [ ] |
| Progress bar | Functional | [ ] |

#### TC3.10: Dialogs

| Test | Expected Result | Status |
|------|-----------------|--------|
| ConfirmExitDialog | Title and message in English | [ ] |
| Any validation dialogs | English messages | [ ] |

### Verification Checklist

- [ ] **V3.1:** All step titles display in English
- [ ] **V3.2:** All button labels display in English
- [ ] **V3.3:** All form labels and placeholders display in English
- [ ] **V3.4:** Navigation (Back/Exit) shows English text
- [ ] **V3.5:** Dialogs show English text
- [ ] **V3.6:** No translation keys visible (e.g., `workflow.steps.roomSelection.title`)
- [ ] **V3.7:** Progress bar and step indicator work correctly
- [ ] **V3.8:** Workflow completes successfully

### Record Results

Document in test matrix: `/docs/testing/results/L10N-Epic2-Workflow-Test-Results.md`

---

## Task 4: Test French (fr)

**Story Points:** 1
**Dependencies:** Task 3 complete
**Estimated Duration:** 45 minutes

### Objective

Execute complete workflow in French and validate all translations.

### Test Scenario

1. Switch language to French via LanguageSwitcher
2. Verify page reloads/updates with French content
3. Navigate to Item Creation Workflow
4. Execute complete workflow flow
5. Document any untranslated strings or issues

### Expected Translations Reference

| English | French |
|---------|--------|
| Select a Room | Sélectionner une pièce |
| Continue | Continuer |
| Back | Retour |
| Save | Enregistrer |
| Step X of Y | Étape X sur Y |
| Bedroom | Chambre |
| Kitchen | Cuisine |
| Living Room | Salon |
| Bathroom | Salle de bain |

### Step-by-Step Test Cases

#### TC4.1: RoomSelectionStep

| Test | Expected Result | Status |
|------|-----------------|--------|
| Step title | "Sélectionner une pièce" or similar | [ ] |
| Room names | Chambre, Cuisine, Salon, etc. | [ ] |
| Continue button | "Continuer" | [ ] |

#### TC4.2-TC4.10: Remaining Steps

(Follow same pattern as Task 3, verifying French translations)

### Special Attention Areas

- [ ] **French accented characters:** é, è, ê, ç, à, ù render correctly
- [ ] **Text length:** French text ~10-15% longer than English - check for overflow
- [ ] **Gender agreement:** Correct article usage (le/la/les)

### Verification Checklist

- [ ] **V4.1:** Step titles translated to French
- [ ] **V4.2:** Button labels: "Continuer", "Retour", "Enregistrer"
- [ ] **V4.3:** Room names translated (Chambre, Cuisine, Salon, etc.)
- [ ] **V4.4:** Special characters render correctly (é, è, ê, ç, etc.)
- [ ] **V4.5:** No translation keys visible
- [ ] **V4.6:** No text overflow or truncation
- [ ] **V4.7:** Dialogs fully translated

### Record Results

Document in test matrix with language column "FR"

---

## Task 5: Test Spanish (es)

**Story Points:** 1
**Dependencies:** Task 3 complete
**Estimated Duration:** 45 minutes

### Objective

Execute complete workflow in Spanish and validate all translations.

### Test Scenario

1. Switch language to Spanish via LanguageSwitcher
2. Navigate to Item Creation Workflow
3. Execute complete workflow flow
4. Document any issues

### Expected Translations Reference

| English | Spanish |
|---------|---------|
| Select a Room | Seleccionar una habitación |
| Continue | Continuar |
| Back | Volver |
| Save | Guardar |
| Bedroom | Dormitorio |
| Kitchen | Cocina |
| Living Room | Salón |

### Special Attention Areas

- [ ] **Spanish accented characters:** ñ, á, é, í, ó, ú, ü render correctly
- [ ] **Inverted punctuation:** ¿, ¡ if used in questions/exclamations

### Verification Checklist

- [ ] **V5.1:** Step titles translated: "Seleccionar una habitación", etc.
- [ ] **V5.2:** Button labels: "Continuar", "Volver", "Guardar"
- [ ] **V5.3:** Room names translated (Dormitorio, Cocina, Salón, etc.)
- [ ] **V5.4:** Special characters render correctly (ñ, á, é, í, ó, ú, ü)
- [ ] **V5.5:** No untranslated strings
- [ ] **V5.6:** No translation keys visible

### Record Results

Document in test matrix with language column "ES"

---

## Task 6: Test German (de) - Critical Text Overflow Check

**Story Points:** 1
**Dependencies:** Task 3 complete
**Estimated Duration:** 60 minutes

### Objective

Execute complete workflow in German with **special attention to text overflow** issues. German typically has 20-30% longer text than English.

### Test Scenario

1. Switch language to German via LanguageSwitcher
2. Navigate to Item Creation Workflow
3. Execute complete workflow flow
4. **CRITICAL:** Check for text overflow/truncation at every step

### Expected Translations Reference

| English | German |
|---------|--------|
| Select a Room | Zimmer auswählen |
| Continue | Weiter |
| Back | Zurück |
| Save | Speichern |
| Bedroom | Schlafzimmer |
| Kitchen | Küche |
| Living Room | Wohnzimmer |
| Laundry | Waschküche |

### Critical Overflow Check Points

| Component | German Text | Check |
|-----------|-------------|-------|
| RoomCard | "Schlafzimmer" | [ ] Fits without truncation |
| RoomCard | "Waschküche" | [ ] Fits without truncation |
| Primary buttons | "Weiter" | [ ] Fits in button width |
| Step headers | Full German titles | [ ] No horizontal overflow |
| Dialog buttons | "Abbrechen", "Bestätigen" | [ ] Fit in dialog width |
| Form labels | German labels | [ ] Fit in form layout |

### Special Attention Areas

- [ ] **German umlauts:** ä, ö, ü, ß render correctly
- [ ] **Compound words:** Long compound nouns fit in UI elements
- [ ] **Button width:** Check buttons don't get pushed off-screen
- [ ] **Card layouts:** Check cards accommodate longer text

### Verification Checklist

- [ ] **V6.1:** Step titles translated: "Zimmer auswählen", etc.
- [ ] **V6.2:** Button labels: "Weiter", "Zurück", "Speichern"
- [ ] **V6.3:** Room names translated (Schlafzimmer, Küche, Wohnzimmer, etc.)
- [ ] **V6.4:** Special characters render correctly (ä, ö, ü, ß)
- [ ] **V6.5:** **No text overflow or clipping on buttons**
- [ ] **V6.6:** **No text overflow in step headers**
- [ ] **V6.7:** **Dialogs accommodate longer German text**
- [ ] **V6.8:** RoomCard component accommodates "Waschküche" without truncation
- [ ] **V6.9:** Form labels and placeholders fit within containers

### Record Results

Document in test matrix with language column "DE"
**Flag any overflow issues as HIGH priority defects**

---

## Task 7: Test Dutch (nl)

**Story Points:** 1
**Dependencies:** Task 3 complete
**Estimated Duration:** 45 minutes

### Objective

Execute complete workflow in Dutch and validate all translations. Dutch can also have compound words requiring overflow attention.

### Test Scenario

1. Switch language to Dutch via LanguageSwitcher
2. Navigate to Item Creation Workflow
3. Execute complete workflow flow
4. Check for text overflow (Dutch can also have long compound words)

### Expected Translations Reference

| English | Dutch |
|---------|-------|
| Select a Room | Selecteer een kamer |
| Continue | Doorgaan |
| Back | Terug |
| Save | Opslaan |
| Bedroom | Slaapkamer |
| Kitchen | Keuken |
| Living Room | Woonkamer |

### Verification Checklist

- [ ] **V7.1:** Step titles translated: "Selecteer een kamer", etc.
- [ ] **V7.2:** Button labels: "Doorgaan", "Terug", "Opslaan"
- [ ] **V7.3:** Room names translated (Slaapkamer, Keuken, Woonkamer, etc.)
- [ ] **V7.4:** No untranslated strings
- [ ] **V7.5:** Check for text overflow (Dutch can have longer compound words)
- [ ] **V7.6:** No translation keys visible

### Record Results

Document in test matrix with language column "NL"

---

## Task 8: Test Italian (it)

**Story Points:** 1
**Dependencies:** Task 3 complete
**Estimated Duration:** 45 minutes

### Objective

Execute complete workflow in Italian and validate all translations.

### Test Scenario

1. Switch language to Italian via LanguageSwitcher
2. Navigate to Item Creation Workflow
3. Execute complete workflow flow

### Expected Translations Reference

| English | Italian |
|---------|---------|
| Select a Room | Seleziona una stanza |
| Continue | Continua |
| Back | Indietro |
| Save | Salva |
| Bedroom | Camera da letto |
| Kitchen | Cucina |
| Living Room | Soggiorno |

### Special Attention Areas

- [ ] **Italian accented characters:** à, è, é, ì, ò, ù render correctly

### Verification Checklist

- [ ] **V8.1:** Step titles translated: "Seleziona una stanza", etc.
- [ ] **V8.2:** Button labels: "Continua", "Indietro", "Salva"
- [ ] **V8.3:** Room names translated (Camera da letto, Cucina, Soggiorno, etc.)
- [ ] **V8.4:** Special characters render correctly (à, è, é, ì, ò, ù)
- [ ] **V8.5:** No untranslated strings
- [ ] **V8.6:** No translation keys visible

### Record Results

Document in test matrix with language column "IT"

---

## Task 9: Cross-Step Validation

**Story Points:** 1
**Dependencies:** Tasks 3-8 complete
**Estimated Duration:** 60 minutes

### Objective

Validate cross-cutting concerns that span multiple steps and languages.

### Test Scenarios

#### 9.1 Navigation Elements

| Test | Languages | Expected | Status |
|------|-----------|----------|--------|
| WorkflowHeader Back button | All 6 | Works and shows translated label | [ ] |
| WorkflowHeader Exit button | All 6 | Triggers confirmation dialog in correct language | [ ] |
| Progress bar | All 6 | Updates correctly regardless of language | [ ] |
| Step counter format | All 6 | Shows correct format (e.g., "Étape 2 sur 8" in French) | [ ] |

#### 9.2 Dialogs

| Dialog | Languages | Test | Status |
|--------|-----------|------|--------|
| ConfirmExitDialog | All 6 | Title, message, buttons translated | [ ] |
| RemoveItemDialog | All 6 | Title, message, buttons translated | [ ] |
| EmptySessionDialog | All 6 | Title, message, buttons translated | [ ] |
| PDFExportDialog | All 6 | All text translated | [ ] |

#### 9.3 Shared Components

| Component | Languages | Test | Status |
|-----------|-----------|------|--------|
| SessionProgressBar | All 6 | Text and labels translated | [ ] |
| RoomCard | All 6 | Labels and actions translated | [ ] |
| ItemTypeCard | All 6 | Labels and descriptions translated | [ ] |
| ContentPieceCard | All 6 | Text and actions translated | [ ] |
| TagsEditor | All 6 | Labels and placeholders translated | [ ] |
| ItemNameEditor | All 6 | Labels and placeholders translated | [ ] |

### Verification Checklist

- [ ] **V9.1:** Navigation elements work correctly in all languages
- [ ] **V9.2:** All dialog types display in selected language
- [ ] **V9.3:** Shared components show correct translations
- [ ] **V9.4:** No component shows mixed languages

---

## Task 10: Edge Cases and Error Scenarios

**Story Points:** 1
**Dependencies:** Task 9 complete
**Estimated Duration:** 60 minutes

### Objective

Test error handling and edge cases in multiple languages.

### Test Scenarios

#### 10.1 Form Validation Errors

| Test | Languages | How to Trigger | Expected |
|------|-----------|----------------|----------|
| Required field error | FR, DE | Leave item name empty | Translated error message |
| Character limit warning | ES, IT | Exceed max length | Translated warning |
| Invalid input | All 6 | Enter invalid data | Translated error |

#### 10.2 Empty States

| Test | Languages | How to Trigger | Expected |
|------|-----------|----------------|----------|
| No rooms found | FR, DE | Search with no results | Translated "No rooms found" |
| Empty session | ES, IT | Try to save empty session | Translated empty state message |

#### 10.3 Loading States

| Test | Languages | Where | Expected |
|------|-----------|-------|----------|
| Saving indicator | All 6 | PreviewSaveStep | "Saving..." in correct language |
| Loading rooms | All 6 | RoomSelectionStep | Translated loading text |

#### 10.4 Camera/Media Permission

| Test | Languages | How to Trigger | Expected |
|------|-----------|----------------|----------|
| Camera permission request | FR, DE | Go to MediaCaptureStep | Translated permission messages |
| Permission denied | ES, IT | Deny camera access | Translated fallback/error |

### Verification Checklist

- [ ] **V10.1:** Validation errors appear in selected language
- [ ] **V10.2:** Empty state messages translated
- [ ] **V10.3:** Loading states show translated text
- [ ] **V10.4:** Camera permission messages translated
- [ ] **V10.5:** Error recovery messages translated

---

## Task 11: Language Switching Mid-Flow

**Story Points:** 0.5
**Dependencies:** Task 3 complete
**Estimated Duration:** 30 minutes

### Objective

Test that switching languages while in the middle of the workflow preserves state and updates UI correctly.

### Test Scenario

1. Start workflow in English
2. Progress to step 3 (SpecificItemStep)
3. Enter some data (select a room, select item type)
4. Switch language to French via LanguageSwitcher
5. Verify behavior

### Expected Results

| Aspect | Expected | Status |
|--------|----------|--------|
| UI Language | Updates to French immediately | [ ] |
| Workflow Step | Remains on step 3 | [ ] |
| Selected Room | Persists (not lost) | [ ] |
| Selected Item Type | Persists (not lost) | [ ] |
| Back Navigation | Works, shows previous steps in French | [ ] |
| Forward Navigation | Works normally | [ ] |

### Additional Tests

| Test | Expected | Status |
|------|----------|--------|
| Switch FR → DE at step 5 | State persists, UI updates to German | [ ] |
| Switch DE → EN at step 7 | State persists, UI updates to English | [ ] |
| Complete workflow after switching | Saves successfully | [ ] |

### Verification Checklist

- [ ] **V11.1:** UI updates to new language without losing workflow state
- [ ] **V11.2:** Previously entered data persists
- [ ] **V11.3:** Current step displays correctly in new language
- [ ] **V11.4:** Backward navigation works correctly
- [ ] **V11.5:** Forward navigation works correctly
- [ ] **V11.6:** Workflow can complete successfully after language switch

---

## Task 12: Mobile Responsiveness Testing

**Story Points:** 0.5
**Dependencies:** Task 6 complete (German most critical for overflow)
**Estimated Duration:** 30 minutes

### Objective

Test workflow localization on mobile viewports, with special attention to German (longest text).

### Test Setup

1. Set browser viewport to 375px width (iPhone SE)
2. Test primarily in German (longest text)
3. Navigate through complete workflow

### Test Cases

| Test | Viewport | Language | Expected | Status |
|------|----------|----------|----------|--------|
| Touch targets | 375px | DE | Appropriately sized (min 44px) | [ ] |
| Text overflow | 375px | DE | No horizontal overflow | [ ] |
| Button visibility | 375px | DE | Fully visible and readable | [ ] |
| Step headers | 375px | DE | Wrap appropriately if needed | [ ] |
| LanguageSwitcher | 375px | All | Accessible on mobile | [ ] |
| Dialog layout | 375px | DE | Content fits without scroll | [ ] |

### Additional Viewports (Optional)

| Device | Width | Test Focus |
|--------|-------|------------|
| iPad Mini | 768px | Tablet layout |
| iPhone 12 | 390px | Modern phone |
| Android | 360px | Smaller Android |

### Verification Checklist

- [ ] **V12.1:** Touch targets remain appropriately sized
- [ ] **V12.2:** Text does not overflow horizontally
- [ ] **V12.3:** Buttons remain fully visible and readable
- [ ] **V12.4:** Step headers wrap appropriately if needed
- [ ] **V12.5:** LanguageSwitcher is accessible on mobile

---

## Task 13: Documentation and Issue Reporting

**Story Points:** 0.5
**Dependencies:** Tasks 3-12 complete
**Estimated Duration:** 60 minutes

### Objective

Document all test results, create defect reports for any issues found, and produce a summary report.

### Deliverables

#### 13.1 Complete Test Results Matrix

Update `/docs/testing/results/L10N-Epic2-Workflow-Test-Results.md` with:

- All test case results (Pass/Fail/Warning)
- Notes for each language
- Summary statistics

#### 13.2 Defect Reports (if issues found)

For each issue, create entry in `/docs/testing/results/L10N-Epic2-Workflow-Defects.md`:

- Unique defect ID
- Severity (Critical/High/Medium/Low)
- Language affected
- Step/component affected
- Description with reproduction steps
- Screenshot (if applicable)
- Translation key (if applicable)

#### 13.3 Summary Report

Add to test results file:

```markdown
## Test Summary

### Overall Results
- **Test Date:** [DATE]
- **Tester:** [NAME]
- **Version Tested:** [VERSION]

### Pass/Fail Summary
| Language | Passed | Failed | Warnings | Total |
|----------|--------|--------|----------|-------|
| EN | | | | 11 |
| FR | | | | 11 |
| ES | | | | 11 |
| DE | | | | 11 |
| NL | | | | 11 |
| IT | | | | 11 |
| **Total** | | | | **66** |

### Critical Issues
[List any blocking issues]

### Recommendations
[Any recommendations for fixes or improvements]

### Sign-off
- [ ] All critical issues resolved
- [ ] All high-priority issues resolved or documented
- [ ] Ready for production deployment
```

### Issue Categories to Document

| Category | Examples |
|----------|----------|
| Missing translations | Keys visible instead of text |
| Incorrect translations | Wrong meaning or context |
| Text overflow/truncation | Text cut off in UI elements |
| Layout breaks | Elements pushed off-screen |
| Character encoding | Accents showing as ? or garbled |
| Pluralization errors | "1 items" instead of "1 item" |
| Functional issues | Features broken in certain languages |

### Verification Checklist

- [ ] **V13.1:** Test results matrix completed for all 66 test cases
- [ ] **V13.2:** All issues documented with required fields
- [ ] **V13.3:** Summary report includes pass/fail statistics
- [ ] **V13.4:** Recommendations provided for any issues found
- [ ] **V13.5:** Sign-off checklist completed

---

## Authorized Files for Monitoring

This is a **testing task** - no code modifications should be required. Monitor the following files during testing:

### Translation Files (Monitor for Issues)

| File | Purpose |
|------|---------|
| `/messages/en.json` | English translations - workflow namespace |
| `/messages/fr.json` | French translations - workflow namespace |
| `/messages/es.json` | Spanish translations - workflow namespace |
| `/messages/de.json` | German translations - workflow namespace |
| `/messages/nl.json` | Dutch translations - workflow namespace |
| `/messages/it.json` | Italian translations - workflow namespace |

### Component Files (Monitor for Behavior)

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main orchestrator |
| `/src/components/ItemCreationWorkflow/components/steps/*.tsx` | All step components |
| `/src/components/ItemCreationWorkflow/components/shared/*.tsx` | All shared components |
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Language selection |

### Test Documentation Files (Create/Modify)

| File | Purpose |
|------|---------|
| `/docs/testing/results/L10N-Epic2-Workflow-Test-Results.md` | Test results |
| `/docs/testing/results/L10N-Epic2-Workflow-Defects.md` | Defect reports (if needed) |

---

## Testing Tools and Utilities

### Browser Developer Tools

| Tool | Purpose |
|------|---------|
| Application > Cookies | Verify `FAQBNB_LANG` cookie |
| Console | Check for missing translation warnings |
| Network | Monitor API responses |
| Responsive Design Mode | Test mobile viewports |

### Verification Commands

```bash
# Check current locale cookie in browser console
document.cookie.split(';').find(c => c.includes('FAQBNB_LANG'))

# Check for translation warnings in console
# Look for: "Missing translation: ..."
```

### Database Verification (Optional)

```sql
-- Verify user language preference
SELECT preferred_language FROM users WHERE email = '[test_email]';
```

---

## Common Issues Reference

| Issue Type | Example | Language Most Affected | Severity |
|------------|---------|------------------------|----------|
| Text overflow | "Waschküche" truncated | German, Dutch | High |
| Missing translation | `workflow.steps.title` displayed | All | Critical |
| Character encoding | "Français" shows as "Fran?ais" | French, Spanish | Medium |
| Pluralization | "1 items" instead of "1 item" | All | Medium |
| Layout break | Button pushed off-screen | German, Dutch | High |
| Hardcoded string | "Save" appearing in French UI | All | High |
| Incorrect interpolation | "{count} élément" missing value | All | High |

---

## Estimated Effort Summary

| Task | Duration | Story Points |
|------|----------|--------------|
| Task 1: Environment Setup | 30 min | 0.5 |
| Task 2: Create Test Matrix | 30 min | 0.5 |
| Task 3: Test English (Baseline) | 45 min | 1 |
| Task 4: Test French | 45 min | 1 |
| Task 5: Test Spanish | 45 min | 1 |
| Task 6: Test German (Overflow Focus) | 60 min | 1 |
| Task 7: Test Dutch | 45 min | 1 |
| Task 8: Test Italian | 45 min | 1 |
| Task 9: Cross-Step Validation | 60 min | 1 |
| Task 10: Edge Cases & Errors | 60 min | 1 |
| Task 11: Language Switching Mid-Flow | 30 min | 0.5 |
| Task 12: Mobile Responsiveness | 30 min | 0.5 |
| Task 13: Documentation & Reporting | 60 min | 0.5 |
| **Total** | **~9 hours** | **10** |

**Note:** Add 1-2 hours buffer for issue investigation and fix verification.

---

## Success Criteria Checklist

### Functional Criteria

- [ ] Complete workflow tested in English (en) from start to finish
- [ ] Complete workflow tested in French (fr) from start to finish
- [ ] Complete workflow tested in Spanish (es) from start to finish
- [ ] Complete workflow tested in German (de) from start to finish
- [ ] Complete workflow tested in Dutch (nl) from start to finish
- [ ] Complete workflow tested in Italian (it) from start to finish

### Translation Criteria

- [ ] All step transitions display correct language-specific content
- [ ] All buttons and navigation elements show translated labels
- [ ] All form labels, placeholders, and validation messages appear in selected language
- [ ] All dialog boxes and confirmation messages display correct translations
- [ ] All error messages and toast notifications appear in selected language
- [ ] No untranslated strings or fallback keys appear in any language

### Visual Criteria

- [ ] No text overflow or truncation issues in any language
- [ ] Special characters and diacritics render correctly in all languages
- [ ] Layout remains intact in all languages

### State Management Criteria

- [ ] Workflow state persists correctly when switching languages mid-flow
- [ ] Language preference persists across page reloads

---

## Dependencies

### Required Before This Task

| Dependency | Task ID | Status |
|------------|---------|--------|
| Workflow namespace structure | REQ-371 | Must be ✓ |
| Main ItemCreationWorkflow updated | REQ-372 | Must be ✓ |
| RoomSelectionStep updated | REQ-373 | Must be ✓ |
| ItemTypeStep updated | REQ-374 | Must be ✓ |
| SpecificItemStep updated | REQ-375 | Must be ✓ |
| PurposeStep updated | REQ-376 | Must be ✓ |
| ContentTypeStep updated | REQ-377 | Must be ✓ |
| MediaCaptureStep updated | REQ-378 | Must be ✓ |
| PreviewSaveStep updated | REQ-379 | Must be ✓ |
| SessionSummaryStep updated | REQ-380 | Must be ✓ |
| Shared components updated | REQ-381 | Must be ✓ |
| Dialog components updated | REQ-382 | Must be ✓ |
| Translations generated | REQ-383 | Must be ✓ |
| Staging deployment | - | Must be ✓ |

### Tasks That This Blocks

| Task | Description |
|------|-------------|
| Sub-Epic 2C Completion | This task must pass for 2C sign-off |
| Epic 2 Phase Completion | 2C is prerequisite for Epic 2 milestone |

---

## Related Documentation

- **PRD:** `/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Test Protocol:** `/docs/testing/L10N-E2E-Test-Protocol.md`
- **Results Template:** `/docs/testing/L10N-E2E-Test-Results-Template.md`
- **Defect Template:** `/docs/testing/L10N-E2E-Defect-Report-Template.md`
- **Overview Document:** `/docs/REQ-384-test-complete-workflow-in-each-language-overview.md`

---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Tester | | | Pending |
| Reviewer | | | Pending |
| QA Lead | | | Pending |
| Sub-Epic 2C Complete | | | Pending |

---

*Document created for REQ-384: Test Complete Item Creation Workflow in Each Language*
*Part of Epic 2 - Static UI Translation, Sub-Epic 2C - Item Creation Workflow*
*Task 2C.14 - Final Validation*
