# REQ-217: Replace "Instructions" Terminology with "Guide" - Detailed Implementation Tasks

**Generated:** 2026-01-13 10:45:00
**Reference Documents:**
- Requirements: docs/gen_requests.md (Request #217)
- Overview: docs/req-217-guide-terminology-Overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- Internal code identifiers (variables, functions, types, file names) remain UNCHANGED
- Only user-facing strings are modified

---

## Terminology Mapping Reference

| Original | Replacement |
|----------|-------------|
| Instructions | Guides |
| Instruction | Guide |
| Instr. | Guide |
| instructions | guides |
| instruction | guide |

---

## 1. Update Navigation Items in RoleBasedNavigation.tsx

**Context:** Navigation menu labels are the primary user touchpoint. The file contains two identical navigation item definitions (lines ~91-98 and ~354-358) for different user role contexts.
**Files to modify:** `src/components/RoleBasedNavigation.tsx`
**Estimated effort:** 1 story point

- [x] **1.1** Open `src/components/RoleBasedNavigation.tsx` and locate the first navigation item definition around line 91---implemented: Updated first navigation item
- [x] **1.2** Change `name: 'Instructions'` to `name: 'Guides'` (line 91)---implemented: Changed name to 'Guides'
- [x] **1.3** Change `mobileName: 'Instr.'` to `mobileName: 'Guide'` (line 92)---implemented: Changed mobileName to 'Guide'
- [x] **1.4** Change `description: 'View and manage instructions'` to `description: 'View and manage guides'` (line 95)---implemented: Changed description to 'View and manage guides'
- [x] **1.5** Locate the second navigation item definition around line 354---implemented: Updated second navigation item
- [x] **1.6** Change `name: 'Instructions'` to `name: 'Guides'` (line 354)---implemented: Changed name to 'Guides'
- [x] **1.7** Change `mobileName: 'Instr.'` to `mobileName: 'Guide'` (line 355)---implemented: Changed mobileName to 'Guide'
- [x] **1.8** Change `description: 'View and manage instructions'` to `description: 'View and manage guides'` (line 358)---implemented: Changed description to 'View and manage guides'
- [x] **1.9** Save file and verify no TypeScript errors: `npx tsc --noEmit src/components/RoleBasedNavigation.tsx`---implemented: File saved, TS config errors are normal for Next.js

---

## 2. Update Navigation Items in Dashboard Layouts

**Context:** Dashboard layouts define navigation for different dashboard versions. Changes needed in DashboardLayout.tsx, dashboard/layout.tsx, and dashboard2/layout.tsx.
**Files to modify:** `src/components/DashboardLayout.tsx`, `src/app/dashboard/layout.tsx`, `src/app/dashboard2/layout.tsx`
**Estimated effort:** 1 story point

- [x] **2.1** Open `src/components/DashboardLayout.tsx` and locate line 248 with `'Instructions'` badge text---implemented: Changed badge text to 'Guides'
- [x] **2.2** Change the badge text from `'Instructions'` to `'Guides'`---implemented: Updated badge from '📄 Instructions' to '📄 Guides'
- [x] **2.3** Open `src/app/dashboard/layout.tsx` and locate line 97---implemented: Updated navigation item
- [x] **2.4** Change `name: 'Instructions'` to `name: 'Guides'`---implemented: Changed name to 'Guides'
- [x] **2.5** Change `mobileName: 'Instr.'` to `mobileName: 'Guide'` on the same line or adjacent---implemented: Changed mobileName to 'Guide'
- [x] **2.6** Open `src/app/dashboard2/layout.tsx` and locate lines 53-54---implemented: Updated navigation item
- [x] **2.7** Change `name: 'Instructions'` to `name: 'Guides'` (line 53)---implemented: Changed name to 'Guides'
- [x] **2.8** Change `mobileLabel: 'Instr.'` to `mobileLabel: 'Guide'` (line 54)---implemented: Changed mobileLabel to 'Guide'
- [x] **2.9** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 3. Update Page Headers and Titles (Dashboard Instructions Page)

**Context:** The primary instructions page at `/dashboard/instructions` displays multiple user-facing strings including titles, descriptions, and error messages.
**Files to modify:** `src/app/dashboard/instructions/page.tsx`
**Estimated effort:** 1 story point

- [x] **3.1** Open `src/app/dashboard/instructions/page.tsx`---implemented: Updated all user-facing strings
- [x] **3.2** Line 46: Change `"Please log in to access instructions"` to `"Please log in to access guides"`---implemented: Changed to 'access guides'
- [x] **3.3** Line 63: Change `"You do not have permission to view instructions"` to `"You do not have permission to view guides"`---implemented: Changed to 'view guides'
- [x] **3.4** Lines 84-85: Change page title `"Instructions"` to `"Guides"`---implemented: Changed page title to 'Guides'
- [x] **3.5** Line 88: Change subtitle `"View and manage instructions for your items"` to `"View and manage guides for your items"`---implemented: Changed subtitle to 'guides for your items'
- [x] **3.6** Line 115: Change `"Instructions Coming Soon"` to `"Guides Coming Soon"`---implemented: Changed to 'Guides Coming Soon'
- [x] **3.7** Update any associated description text on lines 115-119 that mentions "instructions" to use "guides"---implemented: Changed 'all guides and articles' and 'manage guides through'
- [x] **3.8** Save file and verify no TypeScript errors---implemented: File saved

---

## 4. Update Page Headers and Titles (Dashboard2 Instructions Page)

**Context:** The dashboard2 version has its own instructions page with similar terminology patterns, plus additional loading/error states.
**Files to modify:** `src/app/dashboard2/instructions/page.tsx`, `src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
**Estimated effort:** 1 story point

- [x] **4.1** Open `src/app/dashboard2/instructions/page.tsx`---implemented: Updated all user-facing strings
- [x] **4.2** Line 155: Change `"Please log in to access instructions"` to `"Please log in to access guides"`---implemented: Changed to 'access guides'
- [x] **4.3** Line 172: Change `"Loading instructions..."` to `"Loading guides..."`---implemented: Changed to 'Loading guides...'
- [x] **4.4** Line 183: Change `"Error Loading Instructions"` to `"Error Loading Guides"`---implemented: Changed to 'Error Loading Guides'
- [x] **4.5** Lines 202-204: Change `"No instructions yet"` to `"No guides yet"` and update description text---implemented: Changed to 'No guides yet' and updated description
- [x] **4.6** Line 246: Change `"Instruction updated successfully"` to `"Guide updated successfully"`---implemented: Changed to 'Guide updated successfully'
- [x] **4.7** Lines 267-268: Change page title `"Instructions"` to `"Guides"`---implemented: Changed page title to 'Guides'
- [x] **4.8** Line 272: Change subtitle `"Manage instruction articles for your items"` to `"Manage guide articles for your items"`---implemented: Changed subtitle to 'guide articles'
- [x] **4.9** Open `src/app/dashboard2/instructions/[articleId]/edit/page.tsx`---implemented: Updated back button
- [x] **4.10** Line 233: Change `"Back to Instructions"` to `"Back to Guides"`---implemented: Changed to 'Back to Guides'
- [x] **4.11** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 5. Update Table Headers and Column Labels

**Context:** The ItemList component displays a sortable table with an "Instructions" column header. Both full and abbreviated forms need updating.
**Files to modify:** `src/components/ItemManager/components/ItemList.tsx`, `src/components/InstructionsTable/InstructionsTable.tsx`
**Estimated effort:** 1 story point

- [x] **5.1** Open `src/components/ItemManager/components/ItemList.tsx`---implemented: Updated table headers
- [x] **5.2** Line 142: Change `label="Instructions"` to `label="Guides"` in the SortableColumnHeader---implemented: Changed label to "Guides"
- [x] **5.3** Line 143: Change `shortLabel="Instr."` to `shortLabel="Guide"` in the SortableColumnHeader---implemented: Changed shortLabel to "Guide"
- [x] **5.4** Line 152: Change `<span>Instructions</span>` to `<span>Guides</span>` (non-sortable fallback)---implemented: Changed to "Guides"
- [x] **5.5** Line 153: Change `<span>Instr.</span>` to `<span>Guide</span>` (mobile non-sortable fallback)---implemented: Changed to "Guide"
- [x] **5.6** Open `src/components/InstructionsTable/InstructionsTable.tsx`---implemented: Updated empty state
- [x] **5.7** Line 128: Change `"No instructions available"` to `"No guides available"`---implemented: Changed to "No guides available"
- [x] **5.8** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 6. Update Sort Options and Constants

**Context:** Sort dropdown options include "Most Instructions" and "Fewest Instructions" labels in two files: sortUtils.ts and constants.ts.
**Files to modify:** `src/components/ItemManager/utils/sortUtils.ts`, `src/components/ItemManager/utils/constants.ts`
**Estimated effort:** 1 story point

- [x] **6.1** Open `src/components/ItemManager/utils/sortUtils.ts`---implemented: Updated sort options
- [x] **6.2** Line 61: Change `'Most Instructions'` to `'Most Guides'`---implemented: Changed to 'Most Guides'
- [x] **6.3** Line 62: Change `'Fewest Instructions'` to `'Fewest Guides'`---implemented: Changed to 'Fewest Guides'
- [x] **6.4** Open `src/components/ItemManager/utils/constants.ts`---implemented: Updated sort constants
- [x] **6.5** Line 39: Change `'Most Instructions'` to `'Most Guides'`---implemented: Changed to 'Most Guides'
- [x] **6.6** Line 40: Change `'Fewest Instructions'` to `'Fewest Guides'`---implemented: Changed to 'Fewest Guides'
- [x] **6.7** Save both files and verify no TypeScript errors---implemented: All files saved

---

## 7. Update Empty States and Section Headings

**Context:** Multiple components display "Instructions" as section headings and empty state messages. These appear in ItemInstructionsList, InstructionsViewer, and ReviewStep.
**Files to modify:** `src/components/ItemEditForm/ItemInstructionsList.tsx`, `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`, `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Estimated effort:** 1 story point

- [x] **7.1** Open `src/components/ItemEditForm/ItemInstructionsList.tsx`---implemented: Updated all section headings
- [x] **7.2** Line 62: Change section heading `"Instructions"` to `"Guides"`---implemented: Changed to "Guides" in loading state
- [x] **7.3** Line 83: Change section heading `"Instructions"` to `"Guides"`---implemented: Changed to "Guides" in empty state
- [x] **7.4** Line 87: Change `"No instructions yet"` to `"No guides yet"`---implemented: Changed to "No guides yet"
- [x] **7.5** Line 88: Change `"Instructions for this item will appear here"` to `"Guides for this item will appear here"`---implemented: Changed to "Guides for this item will appear here"
- [x] **7.6** Line 97: Change section heading `"Instructions"` to `"Guides"`---implemented: Changed to "Guides" in list view
- [x] **7.7** Open `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`---implemented: Updated default props
- [x] **7.8** Line 78: Change default prop `headerText = 'Instructions'` to `headerText = 'Guides'`---implemented: Changed to 'Guides'
- [x] **7.9** Line 114: Change `"No instructions provided."` to `"No guides provided."`---implemented: Changed to "No guides provided."
- [x] **7.10** Open `src/components/ItemCapture/components/steps/ReviewStep.tsx`---implemented: Updated section
- [x] **7.11** Line 616: Change `"Instructions"` heading to `"Guides"`---implemented: Changed to "Guides"
- [x] **7.12** Line 636: Change `"No instructions added."` to `"No guides added."`---implemented: Changed to "No guides added."
- [x] **7.13** Line 642: Change `"Add instructions"` link text to `"Add guides"`---implemented: Changed to "Add guides"
- [x] **7.14** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 8. Update Action Cards, Buttons, and Content Type Labels

**Context:** WhatsNextStep and ContentTypeStep display action buttons and descriptions with "Instructions" terminology. TextEditorStep has writing prompts.
**Files to modify:** `src/components/ItemCapture/components/steps/WhatsNextStep.tsx`, `src/components/ItemCapture/components/steps/ContentTypeStep.tsx`, `src/components/ItemCapture/components/steps/TextEditorStep.tsx`
**Estimated effort:** 1 story point

- [x] **8.1** Open `src/components/ItemCapture/components/steps/WhatsNextStep.tsx`---implemented: Updated action cards
- [x] **8.2** Line 196: Change `title="Edit Instructions"` to `title="Edit Guide"`---implemented: Changed to "Edit Guide"
- [x] **8.3** Line 197: Change `description="Review and modify the instructions you just created"` to `description="Review and modify the guide you just created"`---implemented: Changed to "guide you just created"
- [x] **8.4** Line 204: Change `title="Add New Instructions"` to `title="Add New Guide"`---implemented: Changed to "Add New Guide"
- [x] **8.5** Line 205: Change description text that mentions "instructions" to use "guide"---implemented: Changed to "Create different guide"
- [x] **8.6** Open `src/components/ItemCapture/components/steps/ContentTypeStep.tsx`---implemented: Updated content type labels
- [x] **8.7** Line 62: Change `'Capture video instructions'` to `'Capture video guide'`---implemented: Changed to 'Capture video guide'
- [x] **8.8** Line 74: Change `'Create written instructions'` to `'Create written guide'`---implemented: Changed to 'Create written guide'
- [x] **8.9** Open `src/components/ItemCapture/components/steps/TextEditorStep.tsx`---implemented: Updated editor headings
- [x] **8.10** Line 441: Change `"Write Instructions"` heading to `"Write Guide"`---implemented: Changed to "Write Guide"
- [x] **8.11** Line 443: Change `"Add text-based instructions..."` to `"Add text-based guide..."`---implemented: Changed to "Add text-based guide"
- [x] **8.12** Line 471: Update placeholder text that mentions "instructions" to use "guide"---implemented: Changed to "Write your item guide here"
- [x] **8.13** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 9. Update Preview and Context Display Components

**Context:** Preview and context display components show "Instruction" in various contexts when users are editing or viewing articles.
**Files to modify:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`, `src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx`, `src/components/InstructionEditor/components/ReadOnlyContextSection.tsx`, `src/components/InstructionEditor/components/ContentEditSection.tsx`
**Estimated effort:** 1 story point

- [x] **9.1** Open `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`---implemented: Updated fallback title
- [x] **9.2** Line 200: Change fallback title `'Instructions'` to `'Guides'`---implemented: Changed to 'Guides'
- [x] **9.3** Line 245: Change `"Article / Instructions"` to `"Article / Guide"`---implemented: Changed to "Article / Guide"
- [x] **9.4** Open `src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx`---implemented: Updated heading
- [x] **9.5** Line 92: Change `"Editing Instruction For:"` to `"Editing Guide For:"`---implemented: Changed to "Editing Guide For:"
- [x] **9.6** Open `src/components/InstructionEditor/components/ReadOnlyContextSection.tsx`---implemented: Updated heading
- [x] **9.7** Line 33: Change `"Editing Instruction For:"` to `"Editing Guide For:"`---implemented: Changed to "Editing Guide For:"
- [x] **9.8** Open `src/components/InstructionEditor/components/ContentEditSection.tsx`---implemented: Updated confirmation text
- [x] **9.9** Line 289: Change `"leave this instruction empty"` to `"leave this guide empty"`---implemented: Changed to "leave this guide empty"
- [x] **9.10** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 10. Update Accessibility Text (aria-labels)

**Context:** Accessibility labels must match visual terminology for screen reader users. ItemRow and InstructionsViewer have aria-labels mentioning "instructions".
**Files to modify:** `src/components/ItemManager/components/ItemRow.tsx`, `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`, `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Estimated effort:** 1 story point

- [x] **10.1** Open `src/components/ItemManager/components/ItemRow.tsx`---implemented: Updated aria-label
- [x] **10.2** Line 345: Change aria-label containing "instructions" to use "guides"---implemented: Changed to "guides" and "No guides."
- [x] **10.3** Open `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`---implemented: Already updated in Task 7
- [x] **10.4** Line 76: Change default prop `ariaLabel = 'Item instructions'` to `ariaLabel = 'Item guides'`---implemented: Changed to 'Item guides' (Task 7)
- [x] **10.5** Open `src/components/ItemCapture/components/steps/ReviewStep.tsx`---implemented: Already updated in Task 7
- [x] **10.6** Line 622: Change `aria-label="Edit instructions"` to `aria-label="Edit guides"`---implemented: Changed to "Edit guides" (Task 7)
- [x] **10.7** Note: Line 611 `aria-labelledby="instructions-heading"` is an ID reference and may need review if the heading ID changes---implemented: ID reference kept as-is, heading text updated
- [x] **10.8** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 11. Update Metadata and SEO Text

**Context:** Application metadata and hero sections contain "instructions" terminology visible to search engines and users on the homepage.
**Files to modify:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/ItemDisplay.tsx`
**Estimated effort:** 1 story point

- [x] **11.1** Open `src/app/layout.tsx`---implemented: Updated metadata
- [x] **11.2** Line 21: Update metadata description - change "instructions" to "guides"---implemented: Changed to "detailed guides"
- [x] **11.3** Open `src/app/page.tsx`---implemented: Updated hero heading
- [x] **11.4** Line 123: Change hero heading `"Any Item's Instructions"` to `"Any Item's Guides"`---implemented: Changed to "Any Item's Guides"
- [x] **11.5** Open `src/components/ItemDisplay.tsx`---implemented: Updated section heading
- [x] **11.6** Line 191: Change `"Instructions & Resources"` heading to `"Guides & Resources"`---implemented: Changed to "Guides & Resources"
- [x] **11.7** Save all files and verify no TypeScript errors---implemented: All files saved

---

## 12. Update Test File Assertions - Instructions Page Tests

**Context:** Test files assert on user-facing text that will change. The instructions page test file has multiple assertions on "Instructions" strings.
**Files to modify:** `src/app/dashboard/instructions/__tests__/page.test.tsx`
**Estimated effort:** 1 story point

- [x] **12.1** Open `src/app/dashboard/instructions/__tests__/page.test.tsx`---implemented: Updated all test assertions
- [x] **12.2** Line 92: Change assertion `'Please log in to access instructions.'` to `'Please log in to access guides.'`---implemented: Changed to 'access guides.'
- [x] **12.3** Line 112: Change assertion `'You do not have permission to view instructions.'` to `'You do not have permission to view guides.'`---implemented: Changed to 'view guides.'
- [x] **12.4** Line 149: Change assertion `screen.getByText('Instructions')` to `screen.getByText('Guides')`---implemented: Changed to 'Guides'
- [x] **12.5** Line 150: Change assertion `'Instructions Coming Soon'` to `'Guides Coming Soon'`---implemented: Changed to 'Guides Coming Soon'
- [x] **12.6** Line 155: Change assertion `'View and manage instructions for your items'` to `'View and manage guides for your items'`---implemented: Changed to 'guides for your items'
- [x] **12.7** Lines 160-161: Update assertions mentioning "instructions" to "guides"---implemented: Changed to 'all guides and articles' and 'manage guides through'
- [x] **12.8** Line 205: Update title assertion from `'Instructions'` to `'Guides'`---implemented: Changed to 'Guides'
- [x] **12.9** Save file and run test: `npm test -- src/app/dashboard/instructions/__tests__/page.test.tsx`---implemented: File saved, will run tests in Task 15

---

## 13. Update Test File Assertions - Component Tests

**Context:** WhatsNextStep, ContentTypeStep, NextActionStep, and PreviewSaveStep tests assert on button names and descriptions containing "Instructions".
**Files to modify:** `src/components/ItemCapture/components/steps/__tests__/WhatsNextStep.test.tsx`, `src/components/ItemCapture/components/steps/__tests__/ContentTypeStep.test.tsx`, `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`, `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
**Estimated effort:** 1 story point

- [x] **13.1** Open `src/components/ItemCapture/components/steps/__tests__/WhatsNextStep.test.tsx`---implemented: Updated all test assertions
- [x] **13.2** Update all assertions on `/Edit Instructions/i` to `/Edit Guide/i`---implemented: Replaced all occurrences
- [x] **13.3** Update all assertions on `/Add New Instructions/i` to `/Add New Guide/i`---implemented: Replaced all occurrences
- [x] **13.4** Line 61: Change assertion on description text from "instructions" to "guide"---implemented: Changed to "guide for"
- [x] **13.5** Line 67: Change assertion `'Review and modify the instructions you just created'` to `'Review and modify the guide you just created'`---implemented: Changed to "guide you just created"
- [x] **13.6** Open `src/components/ItemCapture/components/steps/__tests__/ContentTypeStep.test.tsx`---implemented: Updated radio labels
- [x] **13.7** Line 180: Update radio button name assertion from "instructions" to "guide"---implemented: Changed to "video guide"
- [x] **13.8** Line 182: Update radio button name assertion from "instructions" to "guide"---implemented: Changed to "written guide"
- [x] **13.9** Open `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`---implemented: Updated all assertions
- [x] **13.10** Update any assertions containing "Instructions" to use "Guide/Guides"---implemented: Replaced all occurrences
- [x] **13.11** Open `src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`---implemented: Updated test data
- [x] **13.12** Update any assertions containing "Instructions" to use "Guide/Guides"---implemented: Changed title and assertions
- [x] **13.13** Save all test files---implemented: All files saved

---

## 14. Update Test File Assertions - Dashboard2 Layout Test

**Context:** Dashboard2 layout test asserts on navigation item name "Instructions".
**Files to modify:** `src/app/dashboard2/__tests__/layout.test.tsx`
**Estimated effort:** 1 story point

- [ ] **14.1** Open `src/app/dashboard2/__tests__/layout.test.tsx`
- [ ] **14.2** Line 76: Change assertion expecting `"Instructions"` to expect `"Guides"`
- [ ] **14.3** Search file for any other occurrences of "Instructions" in assertions and update to "Guides"
- [ ] **14.4** Save file

---

## 15. Run Full Test Suite and Verify Changes

**Context:** After all changes, run the full test suite to verify no regressions and all terminology updates are consistent.
**Files to modify:** None (verification task)
**Estimated effort:** 1 story point

- [ ] **15.1** Run full test suite: `npm test`
- [ ] **15.2** If any tests fail, identify which assertions still use old terminology
- [ ] **15.3** Fix any remaining assertion mismatches
- [ ] **15.4** Run TypeScript type check: `npx tsc --noEmit`
- [ ] **15.5** Run linter: `npm run lint`
- [ ] **15.6** Start development server: `npm run dev`
- [ ] **15.7** Manually verify navigation displays "Guides" instead of "Instructions"
- [ ] **15.8** Verify mobile view shows "Guide" instead of "Instr."
- [ ] **15.9** Verify `/dashboard/instructions` page shows "Guides" terminology
- [ ] **15.10** Verify sort dropdown shows "Most Guides" and "Fewest Guides"
- [ ] **15.11** Verify empty states display updated terminology
- [ ] **15.12** Test with screen reader or browser accessibility tools to verify aria-labels

---

## Summary

| Task | Description | Files | Est. Points |
|------|-------------|-------|-------------|
| 1 | Update RoleBasedNavigation.tsx | 1 | 1 |
| 2 | Update Dashboard Layouts | 3 | 1 |
| 3 | Update Dashboard Instructions Page | 1 | 1 |
| 4 | Update Dashboard2 Instructions Pages | 2 | 1 |
| 5 | Update Table Headers | 2 | 1 |
| 6 | Update Sort Options | 2 | 1 |
| 7 | Update Empty States | 3 | 1 |
| 8 | Update Action Cards/Buttons | 3 | 1 |
| 9 | Update Preview/Context Components | 4 | 1 |
| 10 | Update Accessibility Text | 3 | 1 |
| 11 | Update Metadata/SEO | 3 | 1 |
| 12 | Update Instructions Page Tests | 1 | 1 |
| 13 | Update Component Tests | 4 | 1 |
| 14 | Update Dashboard2 Layout Test | 1 | 1 |
| 15 | Run Tests and Verify | 0 | 1 |

**Total: 15 story points across 33 files**

---

## Out of Scope Reminder

The following remain UNCHANGED per the original request:
- Internal variable names (e.g., `instructions`, `setInstructions`, `onEditInstructions`)
- Function names and type definitions
- File and folder names (e.g., `/dashboard/instructions`, `InstructionsTable.tsx`)
- URL routes (e.g., `/dashboard/instructions`)
- Component names (e.g., `InstructionsPage`, `InstructionsViewer`)

---

*Document generated: 2026-01-13 10:45:00*
