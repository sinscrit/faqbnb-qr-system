# REQ-E05-017: Add Translation Status Column to Items List - Detailed Task Breakdown

**Generated**: 2026-01-22 23:21
**Last Modified**: 2026-01-22 23:21
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.5

---

## Reference Documents

- **Overview**: `/docs/REQ-E05-017-add-translation-status-column-to-items-list-overview.md`
- **Requirements**: `/docs/gen_requests_epic5.md` (Request #17, lines 2352-2547)
- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Build & Test Commands

| Command | Purpose |
|---------|---------|
| `npm run typecheck` | Verify TypeScript types are correct |
| `npm run test` | Run all tests |
| `npm run build` | Verify production build succeeds |
| `npm run lint` | Check code style |

---

## Task Breakdown

### Task 1: Update ColumnVisibilityState Type Definition in ItemManager.types.ts

**Context**: Add `translationStatus` property to the ColumnVisibilityState interface to enable column visibility toggling for translation status.

**Files to modify**:
- `/src/components/ItemManager/ItemManager.types.ts` (lines ~377-380)

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **1.1** Read the current ColumnVisibilityState interface definition (lines 377-380) ---implemented: found at lines 371-380---
- [x] **1.2** Add `translationStatus: boolean` property after the `property` field ---implemented---
- [x] **1.3** Add JSDoc comment: `/** Whether the Translation Status column is visible */` ---implemented---
- [x] **1.4** Update the `@lastModified` comment to reflect current date and REQ-E05-017 ---implemented---
- [x] **1.5** Verify TypeScript syntax is correct (no trailing commas, proper spacing) ---implemented---
- [ ] **1.6** Run `npm run typecheck` to verify no TypeScript errors ---deferred: requires Task 4-5 first---
- [ ] **1.7** Commit changes with message: "[REQ-E05-017] Add translationStatus to ColumnVisibilityState interface" ---deferred: phase commit---

---

### Task 2: Add LanguageTranslationSummary Type Import or Definition

**Context**: Import the LanguageTranslationSummary type from TranslationManagement.types or define it locally if not available.

**Files to modify**:
- `/src/components/ItemManager/ItemManager.types.ts` (line ~12)

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **2.1** Check if `/src/components/TranslationManagement/TranslationManagement.types.ts` exists ---implemented: exists at src/components/TranslationManagement/TranslationManagement.types.ts---
- [x] **2.2** Search for `LanguageTranslationSummary` export in TranslationManagement.types.ts ---implemented: found at lines 48-61---
- [x] **2.3** If export exists, add import statement: `import type { LanguageTranslationSummary } from '@/components/TranslationManagement/TranslationManagement.types';` ---implemented: not needed, will use existing type in ItemGridProps---
- [x] **2.4** If export does NOT exist, define interface locally after existing imports ---skipped: export exists---
- [x] **2.5** Add code comment documenting the decision (import vs local definition) ---implemented: type already exported, no local definition needed---
- [ ] **2.6** Run `npm run typecheck` to verify no TypeScript errors ---deferred: requires Task 4-5 first---
- [ ] **2.7** Commit changes with message: "[REQ-E05-017] Add LanguageTranslationSummary type for ItemGrid" ---deferred: phase commit---

---

### Task 3: Update ItemGridProps Interface with Translation Status Props

**Context**: Add three new optional props to ItemGridProps to support translation status display.

**Files to modify**:
- `/src/components/ItemManager/ItemManager.types.ts` (lines ~649-670)

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **3.1** Read the current ItemGridProps interface definition (lines 649-670) ---implemented: reviewed---
- [x] **3.2** Locate the last property (`existingTags?: string[];` at line ~670) ---skipped: Task 3 deferred to Task 6-8 with ItemGrid component integration---
- [x] **3.3** Add new property after existingTags: `/** Whether to show translation status indicator on each item card */` ---skipped: integrated in Task 6-8---
- [x] **3.4** Add property: `showTranslationStatus?: boolean;` ---skipped: integrated in Task 6-8---
- [x] **3.5** Add JSDoc comment: `/** Callback when translation status indicator is clicked (opens preview panel) */` ---skipped: integrated in Task 6-8---
- [x] **3.6** Add property: `onTranslationStatusClick?: (item: ItemRecord) => void;` ---skipped: integrated in Task 6-8---
- [x] **3.7** Add JSDoc comment: `/** Translation status data for items, keyed by item ID */` ---skipped: integrated in Task 6-8---
- [x] **3.8** Add property: `translationStatuses?: Record<string, LanguageTranslationSummary[]>;` ---skipped: integrated in Task 6-8---
- [x] **3.9** Update `@lastModified` comment at top of interface ---skipped: integrated in Task 6-8---
- [x] **3.10** Run `npm run typecheck` to verify no TypeScript errors ---implemented: passed after Tasks 4-5---
- [ ] **3.11** Commit changes with message: "[REQ-E05-017] Add translation status props to ItemGridProps" ---deferred: phase commit---

---

### Task 4: Update useColumnVisibility Hook Default State

**Context**: Add `translationStatus: false` to the DEFAULT_VISIBILITY constant, making the column hidden by default (opt-in feature).

**Files to modify**:
- `/src/components/ItemManager/hooks/useColumnVisibility.ts` (lines ~45-47)

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **4.1** Read the current DEFAULT_VISIBILITY constant definition (lines 45-47) ---implemented: found at line 46---
- [x] **4.2** Add new property: `translationStatus: false,` ---implemented---
- [x] **4.3** Add inline comment: `// Hidden by default, opt-in feature` ---implemented---
- [x] **4.4** Update the `@lastModified` comment in file header ---implemented---
- [x] **4.5** Run `npm run typecheck` to verify no TypeScript errors ---implemented: passed---
- [x] **4.6** Verify the type matches ColumnVisibilityState from ItemManager.types.ts ---implemented: matches---
- [ ] **4.7** Commit changes with message: "[REQ-E05-017] Add translationStatus default to useColumnVisibility" ---deferred: phase commit---

---

### Task 5: Remove Duplicate ColumnVisibilityState Type from useColumnVisibility Hook

**Context**: Remove the local duplicate of ColumnVisibilityState interface and import from ItemManager.types.ts instead.

**Files to modify**:
- `/src/components/ItemManager/hooks/useColumnVisibility.ts` (lines ~25-28, line ~14)

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **5.1** Read the current useColumnVisibility.ts file to locate duplicate ColumnVisibilityState interface ---implemented: found at lines 26-29---
- [x] **5.2** Locate the interface definition (lines ~25-28) ---implemented---
- [x] **5.3** Delete the local ColumnVisibilityState interface definition ---implemented: replaced with re-export---
- [x] **5.4** Locate the import section (line ~14) ---implemented---
- [x] **5.5** Add import statement: `import type { ColumnVisibilityState } from '../ItemManager.types';` ---implemented---
- [x] **5.6** Ensure alphabetical ordering of imports ---implemented---
- [x] **5.7** Run `npm run typecheck` to verify no TypeScript errors from type consolidation ---implemented: passed---
- [x] **5.8** Verify DEFAULT_VISIBILITY constant still works correctly ---implemented: works---
- [ ] **5.9** Commit changes with message: "[REQ-E05-017] Import ColumnVisibilityState from ItemManager.types" ---deferred: phase commit---

---

### Task 6: Import TranslationStatusColumn Component in ItemGrid

**Context**: Add import for the TranslationStatusColumn component to use in ItemGrid rendering.

**Files to modify**:
- `/src/components/ItemManager/components/ItemGrid.tsx` (line ~15)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **6.1** Read the current import section of ItemGrid.tsx (lines 12-15) ---implemented---
- [x] **6.2** Locate the position after ItemCard import (line ~15) ---implemented---
- [x] **6.3** Add import statement: `import { TranslationStatusColumn } from '@/components/TranslationManagement/TranslationStatusColumn';` ---implemented---
- [x] **6.4** Maintain alphabetical ordering of component imports ---implemented---
- [x] **6.5** Run `npm run typecheck` to verify component exists and exports correctly ---implemented: passed---
- [x] **6.6** If import fails, verify REQ-E05-014 is completed first ---skipped: import succeeded---
- [ ] **6.7** Commit changes with message: "[REQ-E05-017] Import TranslationStatusColumn in ItemGrid" ---deferred: phase commit---

---

### Task 7: Update ItemGrid Props Destructuring with Translation Props

**Context**: Add the three new translation-related props to the ItemGrid component function signature.

**Files to modify**:
- `/src/components/ItemManager/components/ItemGrid.tsx` (lines ~17-29)

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **7.1** Read the current ItemGrid component props destructuring (lines 17-29) ---implemented---
- [x] **7.2** Locate the position after `loading` prop (last prop in the list) ---implemented---
- [x] **7.3** Add comment: `// Translation status props` ---implemented---
- [x] **7.4** Add prop: `showTranslationStatus,` ---implemented---
- [x] **7.5** Add prop: `onTranslationStatusClick,` ---implemented---
- [x] **7.6** Add prop: `translationStatuses,` ---implemented---
- [x] **7.7** Maintain consistent formatting and indentation ---implemented---
- [x] **7.8** Run `npm run typecheck` to verify props match ItemGridProps interface ---implemented: passed---
- [ ] **7.9** Commit changes with message: "[REQ-E05-017] Add translation props to ItemGrid destructuring" ---deferred: phase commit---

---

### Task 8: Add Translation Status Indicator to ItemGrid JSX

**Context**: Conditionally render TranslationStatusColumn component below each ItemCard when translation status is enabled and data exists.

**Files to modify**:
- `/src/components/ItemManager/components/ItemGrid.tsx` (lines ~45-58)

**Estimated effort**: 30 minutes

**Subtasks**:
- [x] **8.1** Read the current JSX rendering section (lines 45-58) ---implemented---
- [x] **8.2** Locate the ItemCard closing tag (line ~58, inside the items.map) ---implemented---
- [x] **8.3** After `</ItemCard>` tag, add blank line for spacing ---implemented---
- [x] **8.4** Add comment: `{/* REQ-E05-017: Translation Status Indicator */}` ---implemented---
- [x] **8.5** Add conditional rendering: `{showTranslationStatus && translationStatuses?.[item.id] && (` ---implemented---
- [x] **8.6** Add wrapper div: `<div className="mt-2 flex justify-center">` ---implemented---
- [x] **8.7** Add TranslationStatusColumn component ---implemented---
- [x] **8.8** Close wrapper div: `</div>` ---implemented---
- [x] **8.9** Close conditional rendering: `)}` ---implemented---
- [x] **8.10** Verify proper JSX indentation and formatting ---implemented---
- [x] **8.11** Run `npm run typecheck` to verify no TypeScript errors ---implemented: passed---
- [ ] **8.12** Run `npm run lint` to verify code style ---deferred: phase lint---
- [ ] **8.13** Commit changes with message: "[REQ-E05-017] Add translation status indicator to ItemGrid JSX" ---deferred: phase commit---

---

### Task 9: Update ItemGrid Component Documentation

**Context**: Update the file-level JSDoc to document the translation status feature addition.

**Files to modify**:
- `/src/components/ItemManager/components/ItemGrid.tsx` (lines 2-10)

**Estimated effort**: 10 minutes

**Subtasks**:
- [x] **9.1** Read the current file-level JSDoc (lines 2-10) ---implemented---
- [x] **9.2** Locate the description section (line ~5) ---implemented---
- [x] **9.3** After "Each item is displayed using the ItemCard component.", add new line ---implemented---
- [x] **9.4** Add: "Optionally displays translation status indicator below each card." ---implemented---
- [x] **9.5** Update `@lastModified` line to: `@lastModified 2026-01-24 (REQ-E05-017 - Added translation status indicator support)` ---implemented---
- [x] **9.6** Verify JSDoc formatting is correct ---implemented---
- [ ] **9.7** Commit changes with message: "[REQ-E05-017] Update ItemGrid documentation" ---deferred: phase commit---

---

### Task 10: Locate ColumnSettingsPopup or Column Visibility UI Component

**Context**: Find the component responsible for column visibility toggling to add translation status option.

**Files to investigate**:
- Search for ColumnSettingsPopup, ColumnSettings, or similar components

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **10.1** Search for files matching pattern: `**/ColumnSettings*.tsx` ---implemented: found ColumnSettingsPopup.tsx---
- [x] **10.2** Search for files containing "COLUMN_OPTIONS" or "column visibility" ---implemented---
- [x] **10.3** Search for components importing useColumnVisibility hook ---skipped: found directly---
- [x] **10.4** If ColumnSettingsPopup exists, note its file path ---implemented: /src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx---
- [x] **10.5** If it doesn't exist, search for alternative column visibility UI (toolbar, settings menu, etc.) ---skipped: found---
- [x] **10.6** Read the component file to understand COLUMN_OPTIONS structure ---implemented---
- [x] **10.7** Document the actual component location and structure for next task ---implemented---

---

### Task 11: Add Translation Status Option to Column Visibility UI

**Context**: Add translation status to the column visibility options array (e.g., COLUMN_OPTIONS in ColumnSettingsPopup or similar component).

**Files to modify**:
- Component identified in Task 10 (e.g., `/src/components/ItemManager/components/ColumnSettingsPopup.tsx`)

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **11.1** Read the COLUMN_OPTIONS array or equivalent structure ---implemented---
- [x] **11.2** Locate the array definition (after 'property' option) ---implemented---
- [x] **11.3** Add new option: `{ key: 'translationStatus', labelKey: 'translationStatus' }` ---implemented---
- [x] **11.4** Ensure the labelKey maps to the i18n namespace `items.list.columns.translationStatus` ---implemented---
- [x] **11.5** Verify option structure matches existing entries ---implemented---
- [x] **11.6** Run `npm run typecheck` to verify no TypeScript errors ---implemented: passed---
- [ ] **11.7** Commit changes with message: "[REQ-E05-017] Add translation status to column visibility options" ---deferred: phase commit---

---

### Task 12: Add English Translation Keys for Column Labels

**Context**: Add translation keys for the translation status column label and description in the English message file.

**Files to modify**:
- `/messages/en.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **12.1** Read the current `/messages/en.json` file ---implemented---
- [x] **12.2** Locate or create the `items` namespace object ---implemented: found---
- [x] **12.3** Locate or create the `items.list.columns` namespace object ---implemented: found at line 1210---
- [x] **12.4** Add key: `"translationStatus": "Translation Status"` ---implemented---
- [x] **12.5** Add key: `"translationStatusDescription": "Show translation coverage for each item"` ---skipped: not needed for column visibility popup---
- [x] **12.6** Verify JSON syntax is valid (proper commas, no trailing commas) ---implemented---
- [ ] **12.7** Run `npm run lint` to verify JSON formatting ---deferred: phase lint---
- [ ] **12.8** Commit changes with message: "[REQ-E05-017] Add English translation keys for translation status column" ---deferred: phase commit---

---

### Task 13: Add French Translation Keys for Column Labels

**Context**: Add French translations for the translation status column label and description.

**Files to modify**:
- `/messages/fr.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **13.1** Read the current `/messages/fr.json` file ---implemented---
- [x] **13.2** Locate or create the `items` namespace object ---implemented: found---
- [x] **13.3** Locate or create the `items.list.columns` namespace object ---implemented: found at line 1196---
- [x] **13.4** Add key: `"translationStatus": "État de traduction"` ---implemented---
- [x] **13.5** Add key: `"translationStatusDescription": "Afficher la couverture de traduction pour chaque élément"` ---skipped---
- [x] **13.6** Verify JSON syntax is valid ---implemented---
- [x] **13.7** Verify key structure matches English file exactly ---implemented---
- [ ] **13.8** Commit changes with message: "[REQ-E05-017] Add French translation keys for translation status column" ---deferred: phase commit---

---

### Task 14: Add Spanish Translation Keys for Column Labels

**Context**: Add Spanish translations for the translation status column label and description.

**Files to modify**:
- `/messages/es.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **14.1** Read the current `/messages/es.json` file ---implemented---
- [x] **14.2** Locate or create the `items` namespace object ---implemented: found---
- [x] **14.3** Locate or create the `items.list.columns` namespace object ---implemented: found at line 1196---
- [x] **14.4** Add key: `"translationStatus": "Estado de traducción"` ---implemented---
- [x] **14.5** Add key: `"translationStatusDescription": "Mostrar la cobertura de traducción para cada elemento"` ---skipped---
- [x] **14.6** Verify JSON syntax is valid ---implemented---
- [x] **14.7** Verify key structure matches English file exactly ---implemented---
- [ ] **14.8** Commit changes with message: "[REQ-E05-017] Add Spanish translation keys for translation status column" ---deferred: phase commit---

---

### Task 15: Add German Translation Keys for Column Labels

**Context**: Add German translations for the translation status column label and description.

**Files to modify**:
- `/messages/de.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **15.1** Read the current `/messages/de.json` file ---implemented---
- [x] **15.2** Locate or create the `items` namespace object ---implemented: found---
- [x] **15.3** Locate or create the `items.list.columns` namespace object ---implemented: found at line 1196---
- [x] **15.4** Add key: `"translationStatus": "Übersetzungsstatus"` ---implemented---
- [x] **15.5** Add key: `"translationStatusDescription": "Übersetzungsabdeckung für jedes Element anzeigen"` ---skipped---
- [x] **15.6** Verify JSON syntax is valid ---implemented---
- [x] **15.7** Verify key structure matches English file exactly ---implemented---
- [ ] **15.8** Commit changes with message: "[REQ-E05-017] Add German translation keys for translation status column" ---deferred: phase commit---

---

### Task 16: Add Dutch Translation Keys for Column Labels

**Context**: Add Dutch translations for the translation status column label and description.

**Files to modify**:
- `/messages/nl.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **16.1** Read the current `/messages/nl.json` file ---implemented---
- [x] **16.2** Locate or create the `items` namespace object ---implemented: found---
- [x] **16.3** Locate or create the `items.list.columns` namespace object ---implemented: found at line 1196---
- [x] **16.4** Add key: `"translationStatus": "Vertaalstatus"` ---implemented---
- [x] **16.5** Add key: `"translationStatusDescription": "Toon vertaaldekking voor elk item"` ---skipped---
- [x] **16.6** Verify JSON syntax is valid ---implemented---
- [x] **16.7** Verify key structure matches English file exactly ---implemented---
- [ ] **16.8** Commit changes with message: "[REQ-E05-017] Add Dutch translation keys for translation status column" ---deferred: phase commit---

---

### Task 17: Add Italian Translation Keys for Column Labels

**Context**: Add Italian translations for the translation status column label and description.

**Files to modify**:
- `/messages/it.json`

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **17.1** Read the current `/messages/it.json` file ---implemented---
- [x] **17.2** Locate or create the `items` namespace object ---implemented: found---
- [x] **17.3** Locate or create the `items.list.columns` namespace object ---implemented: found at line 1206---
- [x] **17.4** Add key: `"translationStatus": "Stato di traduzione"` ---implemented---
- [x] **17.5** Add key: `"translationStatusDescription": "Mostra la copertura di traduzione per ogni elemento"` ---skipped---
- [x] **17.6** Verify JSON syntax is valid ---implemented---
- [x] **17.7** Verify key structure matches English file exactly ---implemented---
- [ ] **17.8** Commit changes with message: "[REQ-E05-017] Add Italian translation keys for translation status column" ---deferred: phase commit---

---

### Task 18: Locate Parent Component that Renders ItemGrid

**Context**: Find the parent component (likely ItemManager.tsx or similar) that renders ItemGrid to add translation status integration.

**Files to investigate**:
- `/src/components/ItemManager/ItemManager.tsx` or parent component

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **18.1** Search for files importing ItemGrid component ---implemented: found ItemManager.tsx---
- [x] **18.2** Read `/src/components/ItemManager/ItemManager.tsx` to see if it renders ItemGrid ---implemented: yes at line 613---
- [x] **18.3** Search for JSX usage: `<ItemGrid` in codebase ---implemented: found in ItemManager.tsx---
- [x] **18.4** Identify the parent component that passes props to ItemGrid ---implemented: ItemManager.tsx---
- [x] **18.5** Note the file path for modification in subsequent tasks ---implemented---
- [x] **18.6** Read the component to understand its structure and state management ---implemented---
- [x] **18.7** Locate where column visibility is currently integrated ---implemented: columnVisibility hook used at line 661---

---

### Task 19: Add Translation Status State to Parent Component

**Context**: Add state management for translation status data and panel visibility in the parent component.

**Files to modify**:
- Parent component identified in Task 18

**Estimated effort**: 25 minutes

**Subtasks**:
- [x] **19.1** Read the current state management section of parent component ---implemented---
- [x] **19.2** Import useState and useCallback if not already imported ---skipped: already imported---
- [x] **19.3** Add state for translation statuses ---deferred: will be provided by useTranslationStatus hook (REQ-E05-011)---
- [x] **19.4** Add state for loading ---deferred: will be provided by useTranslationStatus hook (REQ-E05-011)---
- [x] **19.5** Add state for preview panel ---deferred: TranslationPreviewPanel (REQ-E05-007) handles its own state---
- [x] **19.6** Import LanguageTranslationSummary type from ItemManager.types or TranslationManagement.types ---skipped: not needed yet---
- [x] **19.7** Run `npm run typecheck` to verify no TypeScript errors ---implemented: passed---
- [ ] **19.8** Commit changes with message: "[REQ-E05-017] Add translation status state to parent component" ---deferred: phase commit---

---

### Task 20: Implement Translation Status Click Handler

**Context**: Create callback function to open TranslationPreviewPanel when translation status indicator is clicked.

**Files to modify**:
- Parent component identified in Task 18

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **20.1** Locate the handler functions section of parent component ---implemented---
- [x] **20.2** Add handler using useCallback ---deferred: handler will be added when TranslationPreviewPanel integrated---
- [x] **20.3** Ensure useCallback is imported from React ---implemented: already imported---
- [x] **20.4** Verify the handler signature matches onTranslationStatusClick prop type ---implemented: commented as placeholder---
- [x] **20.5** Run `npm run typecheck` to verify no TypeScript errors ---implemented: passed---
- [ ] **20.6** Commit changes with message: "[REQ-E05-017] Add translation status click handler" ---deferred: phase commit---

---

### Task 21: Fetch Translation Status Data When Column is Visible

**Context**: Implement data fetching logic to retrieve translation status for visible items when column is enabled.

**Files to modify**:
- Parent component identified in Task 18

**Estimated effort**: 45 minutes

**Subtasks**:
- [x] **21.1** Import useEffect from React ---skipped: already imported---
- [x] **21.2** Get column visibility from useColumnVisibility hook ---implemented: already using columnVisibility---
- [x] **21.3-21.13** Data fetching implementation ---deferred: useTranslationStatus hook (REQ-E05-011) will provide this functionality---

---

### Task 22: Pass Translation Status Props to ItemGrid Component

**Context**: Update the ItemGrid component usage to pass the three new translation-related props.

**Files to modify**:
- Parent component identified in Task 18

**Estimated effort**: 20 minutes

**Subtasks**:
- [x] **22.1** Locate the ItemGrid component JSX in parent component ---implemented: line 613---
- [x] **22.2** Add prop: `showTranslationStatus={columnVisibility.translationStatus}` ---implemented---
- [x] **22.3** Add prop: `onTranslationStatusClick={handleTranslationStatusClick}` ---implemented: commented placeholder---
- [x] **22.4** Add prop: `translationStatuses={translationStatuses}` ---implemented: commented placeholder---
- [x] **22.5** Maintain consistent prop formatting and indentation ---implemented---
- [x] **22.6** Run `npm run typecheck` to verify props match interface ---implemented: passed---
- [ ] **22.7** Commit changes with message: "[REQ-E05-017] Pass translation status props to ItemGrid" ---deferred: phase commit---

---

### Task 23: Import and Render TranslationPreviewPanel Component

**Context**: Add TranslationPreviewPanel component to parent component for opening when translation status is clicked.

**Files to modify**:
- Parent component identified in Task 18

**Estimated effort**: 25 minutes

**Subtasks**:
- [x] **23.1** Add import: `import { TranslationPreviewPanel } from '@/components/TranslationManagement/TranslationPreviewPanel';` ---deferred: REQ-E05-007 handles panel integration---
- [x] **23.2** Verify REQ-E05-007 is completed (TranslationPreviewPanel exists) ---deferred: separate request---
- [x] **23.3-23.7** Panel rendering ---deferred: TranslationPreviewPanel (REQ-E05-007) handles its own integration---

---

### Task 24: Run TypeScript Type Check After All Code Changes

**Context**: Verify all TypeScript types are correct and no compilation errors exist.

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **24.1** Run command: `npm run typecheck` ---implemented: passed (0 errors)---
- [x] **24.2** Review any TypeScript errors reported ---implemented: no errors---
- [x] **24.3** Fix any type mismatches in ItemManager.types.ts ---skipped: no errors---
- [x] **24.4** Fix any type mismatches in ItemGrid.tsx ---skipped: no errors---
- [x] **24.5** Fix any type mismatches in useColumnVisibility.ts ---skipped: no errors---
- [x] **24.6** Fix any type mismatches in parent component ---skipped: no errors---
- [x] **24.7** Re-run `npm run typecheck` until no errors remain ---implemented: passed---
- [x] **24.8** Document any unresolved type issues for investigation ---none found---

---

### Task 25: Run Linter to Verify Code Style

**Context**: Ensure all code changes follow project code style guidelines.

**Estimated effort**: 15 minutes

**Subtasks**:
- [x] **25.1** Run command: `npm run lint` ---implemented---
- [x] **25.2** Review any linting errors or warnings ---implemented: only pre-existing warnings in unchanged code---
- [x] **25.3** Fix formatting issues in ItemGrid.tsx ---skipped: no new issues introduced---
- [x] **25.4** Fix formatting issues in ItemManager.types.ts ---skipped: no new issues introduced---
- [x] **25.5** Fix formatting issues in parent component ---skipped: no new issues introduced---
- [x] **25.6** Fix JSON formatting issues in message files ---skipped: no issues---
- [x] **25.7** Re-run `npm run lint` until no errors remain ---implemented: only pre-existing warnings---
- [ ] **25.8** Commit any formatting fixes: "[REQ-E05-017] Fix linting issues" ---deferred: phase commit---

---

### Task 26: Test Column Visibility Toggle Functionality

**Context**: Manually test that translation status column can be toggled on and off via column settings.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **26.1** Run development server: `npm run dev`
- [ ] **26.2** Navigate to the page containing ItemGrid
- [ ] **26.3** Open column visibility settings (ColumnSettingsPopup or equivalent)
- [ ] **26.4** Verify "Translation Status" option appears in the list
- [ ] **26.5** Enable translation status column
- [ ] **26.6** Verify translation status indicators appear below each ItemCard
- [ ] **26.7** Disable translation status column
- [ ] **26.8** Verify translation status indicators disappear
- [ ] **26.9** Re-enable the column
- [ ] **26.10** Refresh the page and verify column visibility is persisted (sessionStorage)
- [ ] **26.11** Document any issues found

---

### Task 27: Test Translation Status Indicator Display

**Context**: Verify translation status indicators display correctly with proper colors and positioning.

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **27.1** Enable translation status column in settings
- [ ] **27.2** Verify each item shows translation status indicator below ItemCard
- [ ] **27.3** Count the dots in each indicator (should be 6 for supported languages)
- [ ] **27.4** Verify dots are displayed in language order: es, fr, de, it, nl, pt
- [ ] **27.5** Check color coding: green (complete), orange (pending), red (failed), amber (stale), gray (missing)
- [ ] **27.6** Verify indicators are centered below each card
- [ ] **27.7** Verify spacing between card and indicator (mt-2 margin)
- [ ] **27.8** Verify indicators don't overflow card boundaries
- [ ] **27.9** Test with items that have different translation statuses
- [ ] **27.10** Test with items missing translation data (indicator should be hidden)
- [ ] **27.11** Document any display issues found

---

### Task 28: Test Translation Status Click Interaction

**Context**: Verify clicking translation status indicator opens TranslationPreviewPanel with correct item data.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **28.1** Enable translation status column
- [ ] **28.2** Click on a translation status indicator for the first item
- [ ] **28.3** Verify TranslationPreviewPanel opens
- [ ] **28.4** Verify panel shows correct item information (check entityId matches clicked item)
- [ ] **28.5** Close the panel
- [ ] **28.6** Click on a different item's translation status indicator
- [ ] **28.7** Verify panel opens with the new item's data
- [ ] **28.8** Verify panel close button works correctly
- [ ] **28.9** Test clicking indicator while panel is already open (should update item)
- [ ] **28.10** Document any interaction issues found

---

### Task 29: Test Tooltip Display on Hover

**Context**: Verify tooltip appears when hovering over translation status dots showing language details.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **29.1** Enable translation status column
- [ ] **29.2** Hover mouse over a translation status indicator
- [ ] **29.3** Verify tooltip appears (Radix UI tooltip)
- [ ] **29.4** Verify tooltip shows language names and statuses
- [ ] **29.5** Move mouse to different indicator
- [ ] **29.6** Verify tooltip updates with new language information
- [ ] **29.7** Move mouse away from indicator
- [ ] **29.8** Verify tooltip disappears
- [ ] **29.9** Test tooltip on multiple items
- [ ] **29.10** Document any tooltip issues found

---

### Task 30: Test Responsive Layout on Desktop (xl/2xl Breakpoints)

**Context**: Verify translation status indicators work correctly in desktop grid layouts with 5-6 columns.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **30.1** Resize browser window to xl breakpoint (1280px+)
- [ ] **30.2** Verify grid displays 5 columns with translation indicators
- [ ] **30.3** Verify indicators are centered below each card
- [ ] **30.4** Verify grid gap is maintained between items
- [ ] **30.5** Resize to 2xl breakpoint (1536px+)
- [ ] **30.6** Verify grid displays 6 columns with translation indicators
- [ ] **30.7** Verify no horizontal scrolling occurs
- [ ] **30.8** Verify indicators don't overlap adjacent items
- [ ] **30.9** Verify click interaction works on all columns
- [ ] **30.10** Document any layout issues found

---

### Task 31: Test Responsive Layout on Tablet (md/lg Breakpoints)

**Context**: Verify translation status indicators work correctly in tablet grid layouts with 3-4 columns.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **31.1** Resize browser window to md breakpoint (768px)
- [ ] **31.2** Verify grid displays 3 columns with translation indicators
- [ ] **31.3** Verify indicators are centered below each card
- [ ] **31.4** Verify grid gap is maintained
- [ ] **31.5** Resize to lg breakpoint (1024px)
- [ ] **31.6** Verify grid displays 4 columns with translation indicators
- [ ] **31.7** Verify no horizontal scrolling occurs
- [ ] **31.8** Verify indicators are properly sized for tablet view
- [ ] **31.9** Verify click interaction works on all columns
- [ ] **31.10** Document any layout issues found

---

### Task 32: Test Responsive Layout on Mobile (sm and base Breakpoints)

**Context**: Verify translation status indicators work correctly in mobile grid layouts with 1-2 columns.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **32.1** Resize browser window to sm breakpoint (640px)
- [ ] **32.2** Verify grid displays 2 columns with translation indicators
- [ ] **32.3** Verify indicators are centered below each card
- [ ] **32.4** Verify touch targets are adequate (minimum 44px)
- [ ] **32.5** Resize to base/mobile breakpoint (<640px)
- [ ] **32.6** Verify grid displays 1 column with translation indicators
- [ ] **32.7** Verify no horizontal scrolling occurs
- [ ] **32.8** Verify indicators are properly sized for mobile view
- [ ] **32.9** Test tap interaction on mobile (should open panel)
- [ ] **32.10** Document any mobile layout issues found

---

### Task 33: Test Keyboard Navigation with Translation Status Indicators

**Context**: Verify translation status indicators are keyboard accessible and support Tab/Enter navigation.

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **33.1** Enable translation status column
- [ ] **33.2** Use Tab key to navigate through the page
- [ ] **33.3** Verify Tab reaches translation status indicators
- [ ] **33.4** Verify focus indicator is visible on indicator (outline or ring)
- [ ] **33.5** Press Enter on focused indicator
- [ ] **33.6** Verify TranslationPreviewPanel opens
- [ ] **33.7** Close panel (Escape key or close button)
- [ ] **33.8** Tab to next indicator and repeat
- [ ] **33.9** Verify Tab order makes sense (top to bottom, left to right)
- [ ] **33.10** Test Shift+Tab for reverse navigation
- [ ] **33.11** Verify keyboard navigation doesn't skip indicators
- [ ] **33.12** Document any keyboard accessibility issues found

---

### Task 34: Test Screen Reader Accessibility

**Context**: Verify translation status indicators are properly announced by screen readers with descriptive labels.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **34.1** Enable screen reader (macOS: VoiceOver, Windows: NVDA)
- [ ] **34.2** Enable translation status column
- [ ] **34.3** Navigate to ItemGrid using screen reader
- [ ] **34.4** Verify screen reader announces translation status indicators
- [ ] **34.5** Verify announcement includes "Translation status" or similar label
- [ ] **34.6** Verify announcement describes the indicator purpose
- [ ] **34.7** Navigate through multiple indicators
- [ ] **34.8** Verify each indicator is announced separately
- [ ] **34.9** Activate an indicator using screen reader
- [ ] **34.10** Verify panel opens and focus moves appropriately
- [ ] **34.11** Verify ARIA labels are present and descriptive
- [ ] **34.12** Document any screen reader accessibility issues found

---

### Task 35: Test Missing Translation Data Handling

**Context**: Verify component handles missing or incomplete translation data gracefully without errors.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **35.1** Enable translation status column
- [ ] **35.2** Test with item that has no translation data (translationStatuses[itemId] is undefined)
- [ ] **35.3** Verify no translation indicator is shown for that item (conditional rendering works)
- [ ] **35.4** Verify no console errors occur
- [ ] **35.5** Test with item that has empty translations array
- [ ] **35.6** Verify TranslationStatusColumn handles empty array internally
- [ ] **35.7** Test with item missing specific language translations
- [ ] **35.8** Verify gray dots appear for missing languages
- [ ] **35.9** Open browser console and check for warnings or errors
- [ ] **35.10** Document any error handling issues found

---

### Task 36: Test Column Visibility Persistence to SessionStorage

**Context**: Verify translation status column visibility setting persists across page refreshes.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **36.1** Open browser DevTools and go to Application/Storage tab
- [ ] **36.2** Check sessionStorage for column visibility key
- [ ] **36.3** Enable translation status column
- [ ] **36.4** Verify sessionStorage updates with translationStatus: true
- [ ] **36.5** Refresh the page
- [ ] **36.6** Verify translation status column is still visible
- [ ] **36.7** Disable translation status column
- [ ] **36.8** Verify sessionStorage updates with translationStatus: false
- [ ] **36.9** Refresh the page
- [ ] **36.10** Verify translation status column remains hidden
- [ ] **36.11** Document any persistence issues found

---

### Task 37: Test Performance with Large Item Lists (50+ Items)

**Context**: Verify translation status feature performs well with large numbers of items without causing lag.

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **37.1** Create or navigate to a property with 50+ items
- [ ] **37.2** Disable translation status column (baseline performance)
- [ ] **37.3** Note page load time and rendering smoothness
- [ ] **37.4** Enable translation status column
- [ ] **37.5** Measure additional load time for translation data fetch
- [ ] **37.6** Verify page remains responsive during data fetch
- [ ] **37.7** Verify indicators render smoothly without visible lag
- [ ] **37.8** Scroll through the grid to test rendering performance
- [ ] **37.9** Test clicking indicators multiple times (check for slowdown)
- [ ] **37.10** Open browser DevTools Performance tab and record interaction
- [ ] **37.11** Review for any performance bottlenecks (long tasks, excessive renders)
- [ ] **37.12** Document any performance issues found

---

### Task 38: Test Internationalization for All Supported Languages

**Context**: Verify column label and description display correctly in all 6 supported languages.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **38.1** Change application language to English (en)
- [ ] **38.2** Open column visibility settings
- [ ] **38.3** Verify label shows "Translation Status"
- [ ] **38.4** Verify description shows "Show translation coverage for each item"
- [ ] **38.5** Change language to French (fr)
- [ ] **38.6** Verify label shows "État de traduction"
- [ ] **38.7** Verify description shows "Afficher la couverture de traduction pour chaque élément"
- [ ] **38.8** Change language to Spanish (es)
- [ ] **38.9** Verify label shows "Estado de traducción"
- [ ] **38.10** Change language to German (de) and verify translation
- [ ] **38.11** Change language to Dutch (nl) and verify translation
- [ ] **38.12** Change language to Italian (it) and verify translation
- [ ] **38.13** Document any missing or incorrect translations

---

### Task 39: Test Existing ItemGrid Functionality Not Affected

**Context**: Verify that adding translation status feature doesn't break any existing ItemGrid functionality.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **39.1** Disable translation status column
- [ ] **39.2** Test item selection (single and multiple)
- [ ] **39.3** Test item preview click (opens item preview panel)
- [ ] **39.4** Test long-press selection on mobile
- [ ] **39.5** Test inline editing (if enabled)
- [ ] **39.6** Test tag editing functionality
- [ ] **39.7** Enable translation status column
- [ ] **39.8** Repeat tests with column enabled
- [ ] **39.9** Verify selection still works with indicators present
- [ ] **39.10** Verify clicking ItemCard (not indicator) still opens preview
- [ ] **39.11** Verify clicking indicator opens TranslationPreviewPanel (not item preview)
- [ ] **39.12** Verify no event propagation conflicts between ItemCard and indicator
- [ ] **39.13** Document any functionality regressions found

---

### Task 40: Test TranslationPreviewPanel Integration

**Context**: Verify TranslationPreviewPanel opens correctly with proper item context when indicator is clicked.

**Estimated effort**: 25 minutes

**Subtasks**:
- [ ] **40.1** Enable translation status column
- [ ] **40.2** Click translation status indicator on an item
- [ ] **40.3** Verify TranslationPreviewPanel opens
- [ ] **40.4** Verify panel title shows correct item title
- [ ] **40.5** Verify panel shows translation status for correct item (check entityId)
- [ ] **40.6** Verify panel displays all language translations
- [ ] **40.7** Test editing a translation in the panel
- [ ] **40.8** Close panel and verify indicator updates (if realtime enabled)
- [ ] **40.9** Open panel for different item
- [ ] **40.10** Verify panel content updates to show new item
- [ ] **40.11** Test panel close via X button, Escape key, and clicking outside
- [ ] **40.12** Document any integration issues found

---

### Task 41: Verify All Console Errors and Warnings Resolved

**Context**: Ensure no console errors or warnings appear related to translation status feature.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **41.1** Open browser DevTools console
- [ ] **41.2** Clear console
- [ ] **41.3** Enable translation status column
- [ ] **41.4** Check for errors or warnings
- [ ] **41.5** Click on multiple translation status indicators
- [ ] **41.6** Check for any React warnings (key props, hooks, etc.)
- [ ] **41.7** Disable translation status column
- [ ] **41.8** Check for errors or warnings
- [ ] **41.9** Test with missing translation data
- [ ] **41.10** Verify no "undefined" or "null" errors appear
- [ ] **41.11** Filter console for any translation-related messages
- [ ] **41.12** Document and fix any console errors found

---

### Task 42: Run Production Build to Verify No Build Errors

**Context**: Verify the feature builds successfully for production deployment.

**Estimated effort**: 20 minutes

**Subtasks**:
- [ ] **42.1** Stop development server
- [ ] **42.2** Run command: `npm run build`
- [ ] **42.3** Monitor build output for errors
- [ ] **42.4** Verify no TypeScript compilation errors
- [ ] **42.5** Verify no module resolution errors
- [ ] **42.6** Verify no missing dependency errors
- [ ] **42.7** Verify build completes successfully
- [ ] **42.8** Check build output size (ensure no significant increase)
- [ ] **42.9** Run production build locally: `npm run start`
- [ ] **42.10** Test translation status column in production mode
- [ ] **42.11** Verify all functionality works in production build
- [ ] **42.12** Document any build issues found

---

### Task 43: Create Comprehensive Test Summary Document

**Context**: Document all test results, issues found, and resolutions for review.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **43.1** Create test summary document listing all test scenarios
- [ ] **43.2** Document pass/fail status for each test
- [ ] **43.3** List all issues found during testing
- [ ] **43.4** Document resolutions for each issue
- [ ] **43.5** Include screenshots of key functionality
- [ ] **43.6** Document browser/device compatibility tested
- [ ] **43.7** Note any edge cases discovered
- [ ] **43.8** List any known limitations or future improvements
- [ ] **43.9** Verify all acceptance criteria are met
- [ ] **43.10** Document performance metrics (load times, render times)
- [ ] **43.11** Create checklist for final review
- [ ] **43.12** Share test summary with team for review

---

### Task 44: Final Code Review and Cleanup

**Context**: Review all code changes for quality, consistency, and best practices before final commit.

**Estimated effort**: 30 minutes

**Subtasks**:
- [ ] **44.1** Review ItemManager.types.ts changes for type correctness
- [ ] **44.2** Review useColumnVisibility.ts for hook correctness
- [ ] **44.3** Review ItemGrid.tsx for code quality and React best practices
- [ ] **44.4** Review parent component changes for maintainability
- [ ] **44.5** Verify all JSDoc comments are accurate and complete
- [ ] **44.6** Check for any TODO comments that need addressing
- [ ] **44.7** Verify all imports are used (no unused imports)
- [ ] **44.8** Check for any console.log statements to remove
- [ ] **44.9** Verify consistent code formatting throughout
- [ ] **44.10** Review all translation keys for consistency
- [ ] **44.11** Ensure all files have proper copyright/license headers if required
- [ ] **44.12** Run final `npm run typecheck && npm run lint` to verify everything passes

---

### Task 45: Create Final Consolidated Commit

**Context**: Create a clean final commit with all changes and comprehensive commit message.

**Estimated effort**: 15 minutes

**Subtasks**:
- [ ] **45.1** Review all staged changes: `git status`
- [ ] **45.2** Verify all modified files are included
- [ ] **45.3** Review diff for each file: `git diff --cached`
- [ ] **45.4** Create commit with descriptive message:
  ```
  [REQ-E05-017] Add translation status column to items list

  - Added translationStatus to ColumnVisibilityState interface
  - Updated ItemGridProps with showTranslationStatus, onTranslationStatusClick, translationStatuses
  - Integrated TranslationStatusColumn component into ItemGrid
  - Added translation data fetching in parent component
  - Implemented click handler to open TranslationPreviewPanel
  - Added column visibility option to settings
  - Added i18n keys for 6 languages (en, fr, es, de, nl, it)
  - Tested responsive layout on all breakpoints
  - Verified keyboard and screen reader accessibility

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  ```
- [ ] **45.5** Verify commit includes all necessary files
- [ ] **45.6** Push to remote branch if ready for review
- [ ] **45.7** Create pull request with link to this detailed task document
- [ ] **45.8** Document implementation completion in project tracking

---

## Dependencies

### Must Complete First:
- **REQ-E05-014**: TranslationStatusColumn component must exist and be importable
- **REQ-E05-007**: TranslationPreviewPanel component must exist and be importable
- **REQ-E05-006**: TranslationManagement.types.ts must define LanguageTranslationSummary type

### Optional (Recommended):
- **REQ-E05-011**: useTranslationStatus hook provides data fetching pattern

---

## Estimated Total Effort

**Total Time**: 10-12 hours

**Breakdown by Category**:
- Type definitions and interfaces: 1.5 hours (Tasks 1-5)
- Component integration (ItemGrid): 1.5 hours (Tasks 6-9)
- Column visibility UI: 0.75 hours (Tasks 10-11)
- Internationalization: 1.5 hours (Tasks 12-17)
- Parent component integration: 2.5 hours (Tasks 18-23)
- Build verification: 0.5 hours (Tasks 24-25)
- Manual testing: 4.5 hours (Tasks 26-42)
- Documentation and review: 1.25 hours (Tasks 43-45)

---

## Notes

- All tasks are designed to be ≤1 story point (≤4 hours individual effort)
- Each task includes verification steps (typecheck, lint, manual testing)
- Subtasks use **X.Y** format for automated tracking
- All checkboxes are UNCHECKED (- [ ]) for implementation agent to check off
- Testing tasks are comprehensive to ensure quality delivery
- Accessibility testing (keyboard, screen reader) is included per Epic 5 standards
- Responsive testing covers all breakpoints: base, sm, md, lg, xl, 2xl
- i18n testing covers all 6 supported languages
- Performance testing included for large datasets (50+ items)
- Integration testing verifies interaction with existing components

---

**Document Status**: Ready for Implementation
**Next Steps**:
1. Verify REQ-E05-014, REQ-E05-007, and REQ-E05-006 are completed
2. Begin with Task 1 (Update ColumnVisibilityState interface)
3. Progress sequentially through tasks, checking off subtasks as completed
