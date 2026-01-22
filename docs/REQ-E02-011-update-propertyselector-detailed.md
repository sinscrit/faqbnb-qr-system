# REQ-E02-011: Update PropertySelector Component with Localized Strings - Detailed Specification

**Document Created**: 2026-01-22 10:45:00
**Last Modified**: 2026-01-22 20:15:00
**Request ID**: REQ-E02-011
**Epic**: Epic 2 - Localization (L10N)
**Sub-Epic**: 2F - Property Management
**Task**: 2F.5
**Type**: ENHANCEMENT
**Size**: S
**Estimated Effort**: 6 story points

---

## Reference Documents

- **Source Request**: `/docs/gen_requests_epic2.md#REQ-E02-011`
- **Overview Document**: `/docs/REQ-E02-011-update-propertyselector-overview.md`
- **Properties Namespace Spec**: `/docs/REQ-E02-085-create-properties-namespace-structure-detailed.md`
- **Component File**: `/src/components/PropertySelector.tsx` (325 lines)
- **Translation File**: `/messages/en.json` (properties.selector namespace, lines 3239-3248)

---

## CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT

1. **DO NOT mark any task as completed in this document**
   - All checkboxes MUST remain `- [ ]` (unchecked)
   - The QA validation agent will verify completion
   - Marking tasks complete will cause pipeline tracking errors

2. **Subtask ID Format**
   - Use `**X.Y**` format (e.g., `**1.1**`, `**2.3**`)
   - This format enables automated progress tracking
   - Do not use alternative formats like `X.Y.` or `Task X.Y`

3. **Build & Test Workflow**
   - Run typecheck after each numbered task: `npm run typecheck`
   - Fix any TypeScript errors before proceeding to next task
   - Run full test suite after completing all tasks: `npm test`
   - Run final build verification: `npm run build`

4. **Translation Key Verification**
   - All translation keys referenced in code MUST exist in `/messages/en.json`
   - Verify key paths match the namespace structure exactly
   - Test that `useTranslations('properties.selector')` hook works correctly

5. **Component Testing**
   - Manually verify component renders in browser
   - Test dropdown functionality (open/close, selection)
   - Test keyboard navigation (arrow keys, enter, escape)
   - Verify all text displays correctly with translations
   - Test loading and empty states

---

## Overview

This task updates the PropertySelector component (`/src/components/PropertySelector.tsx`) to replace all hardcoded English strings with translation references from the `properties.selector` namespace. The component is currently using:
- Line 47: `useTranslations('common.emptyStates')` for empty state only
- Lines 45, 145, 147, 165, 168, 199, 239: Hardcoded English strings
- Lines 194, 218: Hardcoded aria-label attributes

The `properties.selector` namespace already exists in `/messages/en.json` (lines 3239-3247) with 8 translation keys created by Task 2F.1.

### Current vs Target State

**Current State**:
```typescript
// Line 45: Hardcoded placeholder prop default
placeholder = 'All Properties'

// Line 47: Uses common.emptyStates namespace
const tEmpty = useTranslations('common.emptyStates');

// Line 165: Hardcoded filter label
<span>Property Filter</span>

// Line 168: Hardcoded filter description
Filter analytics data by property

// Line 194: Hardcoded aria-label
aria-label="Select property for analytics filtering"

// Line 199: Hardcoded loading text
{loading ? 'Loading properties...' : getSelectedPropertyDisplay()}

// Line 239: Uses placeholder prop (defaults to 'All Properties')
<span>{placeholder}</span>

// Line 297: Uses common.emptyStates namespace
{tEmpty('properties.noPropertiesAvailable')}

// Line 309: Hardcoded loading text
<span>Loading properties...</span>
```

**Target State**:
```typescript
// Update hook to properties.selector namespace
const t = useTranslations('properties.selector');

// Use translation for filter label
<span>{t('filterLabel')}</span>

// Use translation for filter description
{t('filterDescription')}

// Use translation for aria-label
aria-label={t('filterAriaLabel')}

// Use translation for loading text
{loading ? t('loading') : getSelectedPropertyDisplay()}

// Use translation for "All Properties" option
<span>{t('allProperties')}</span>

// Use translation for empty state
{t('noPropertiesAvailable')}

// Use translation for loading text in dropdown
<span>{t('loading')}</span>
```

### Available Translation Keys

From `/messages/en.json` lines 3239-3247 (properties.selector namespace):

| Translation Key | English Value | Usage in Component |
|----------------|---------------|-------------------|
| `selectProperty` | "Select Property" | Not currently used (reserved for future) |
| `allProperties` | "All Properties" | Line 239 (option label), Line 45 (placeholder default) |
| `unassigned` | "Unassigned" | Not currently used (reserved for future) |
| `filterLabel` | "Property Filter" | Line 165 (header label) |
| `filterDescription` | "Filter analytics data by property" | Line 168 (helper text) |
| `filterAriaLabel` | "Select property for analytics filtering" | Line 194 (button aria-label) |
| `loading` | "Loading properties..." | Line 199 (button text), Line 309 (dropdown text) |
| `noPropertiesAvailable` | "No properties available" | Line 297 (empty state) |

### Migration Scope

**Total Strings to Migrate**: 7 unique hardcoded strings
- 1 prop default value (placeholder)
- 5 component text strings
- 1 aria-label attribute
- 1 namespace change (common.emptyStates → properties.selector)

**Lines to Modify**: ~12 lines
- Line 3: Update last modified comment
- Line 45: Remove hardcoded default for `placeholder` prop
- Line 47: Change namespace from `common.emptyStates` to `properties.selector`
- Lines 145, 147: Update `getSelectedPropertyDisplay()` to use translation fallback
- Lines 165, 168, 194, 199, 239, 297, 309: Replace hardcoded strings with `t()` calls

**Files to Modify**: 1 file
- `/src/components/PropertySelector.tsx`

---

## Build & Test Commands

After completing each numbered task, verify your changes:

```bash
# Type check (run after EACH task)
npm run typecheck

# Run tests (run after ALL tasks complete)
npm test

# Build verification (run after ALL tasks complete)
npm run build

# Lint check (run after ALL tasks complete)
npm run lint
```

**Expected outcomes**:
- `npm run typecheck`: Should pass with no TypeScript errors related to PropertySelector
- `npm test`: All existing tests should continue to pass
- `npm run build`: Should build successfully without errors
- `npm run lint`: Should pass with no new linting errors

---

## Task Breakdown

### Task 1: Update Translation Hook (1 story point)

**Context**: The component currently uses `useTranslations('common.emptyStates')` (line 47) for a single empty state key. We need to change the namespace to `properties.selector` to access all PropertySelector-specific translation keys.

**Files to Modify**:
- `/src/components/PropertySelector.tsx`

**Estimated Effort**: 1 story point (simple hook update)

**Subtasks**:
- [ ] **1.1** Locate line 3 with the last modified comment
- [ ] **1.2** Update the @lastModified comment to: `// Last Modified: 2026-01-22 - REQ-E02-011: Updated for i18n with properties.selector namespace`
- [ ] **1.3** Update line 47 from `const tEmpty = useTranslations('common.emptyStates');` to `const t = useTranslations('properties.selector');`
- [ ] **1.4** Run `npm run typecheck` to verify no TypeScript errors
- [ ] **1.5** Verify the component still compiles without errors

**Acceptance Criteria**:
- Translation hook uses `properties.selector` namespace
- Variable is named `t` (not `tEmpty`)
- Last modified comment updated with current date and request ID
- TypeScript compilation succeeds

---

### Task 2: Update Filter Label and Description (1 story point)

**Context**: The component has hardcoded strings for the filter label (line 165: "Property Filter") and description (line 168: "Filter analytics data by property"). These need to be replaced with translation keys.

**Files to Modify**:
- `/src/components/PropertySelector.tsx`

**Estimated Effort**: 1 story point (2 simple string replacements)

**Subtasks**:
- [ ] **2.1** Locate line 165 with the hardcoded label `<span>Property Filter</span>`
- [ ] **2.2** Replace line 165 with `<span>{t('filterLabel')}</span>`
- [ ] **2.3** Locate lines 167-169 with the hardcoded description text
- [ ] **2.4** Replace lines 167-169: change the `<p>` content from `Filter analytics data by property` to `{t('filterDescription')}`
- [ ] **2.5** Verify the JSX structure remains intact (opening/closing tags, className attributes)
- [ ] **2.6** Run `npm run typecheck` to verify no errors

**Acceptance Criteria**:
- Line 165 uses `t('filterLabel')`
- Description paragraph uses `t('filterDescription')`
- Component structure and styling remain unchanged
- TypeScript compilation succeeds

---

### Task 3: Update Button Aria-Label (1 story point)

**Context**: The button has a hardcoded aria-label attribute (line 194: "Select property for analytics filtering") for accessibility. This should use a translation key.

**Files to Modify**:
- `/src/components/PropertySelector.tsx`

**Estimated Effort**: 1 story point (single attribute update)

**Subtasks**:
- [ ] **3.1** Locate line 194 with `aria-label="Select property for analytics filtering"`
- [ ] **3.2** Replace the hardcoded string with translation reference: change to `aria-label={t('filterAriaLabel')}`
- [ ] **3.3** Verify curly braces are used correctly for JSX expression (not quotes)
- [ ] **3.4** Run `npm run typecheck` to verify no errors

**Acceptance Criteria**:
- Button aria-label uses `t('filterAriaLabel')`
- Accessibility attribute is properly formatted as JSX expression
- TypeScript compilation succeeds

---

### Task 4: Update Loading Text in Button (1 story point)

**Context**: The button display text (line 199) uses a hardcoded loading message: `'Loading properties...'`. This should use the `loading` translation key.

**Files to Modify**:
- `/src/components/PropertySelector.tsx`

**Estimated Effort**: 1 story point (ternary expression update)

**Subtasks**:
- [ ] **4.1** Locate line 199 with the ternary expression: `{loading ? 'Loading properties...' : getSelectedPropertyDisplay()}`
- [ ] **4.2** Replace the hardcoded string with translation: change to `{loading ? t('loading') : getSelectedPropertyDisplay()}`
- [ ] **4.3** Verify the ternary logic remains correct (no change to condition or else branch)
- [ ] **4.4** Run `npm run typecheck` to verify no errors

**Acceptance Criteria**:
- Loading text uses `t('loading')`
- Ternary expression logic unchanged
- TypeScript compilation succeeds

---

### Task 5: Update Placeholder Display Logic (1 story point)

**Context**: The component has a hardcoded default value for the `placeholder` prop (line 45: `'All Properties'`). The `getSelectedPropertyDisplay()` function (lines 143-155) and the dropdown "All Properties" option (line 239) both use this placeholder. We need to maintain backward compatibility while providing a translated default.

**Files to Modify**:
- `/src/components/PropertySelector.tsx`

**Estimated Effort**: 1 story point (update function and dropdown option)

**Subtasks**:
- [ ] **5.1** Locate line 45 with `placeholder = 'All Properties'`
- [ ] **5.2** Remove the hardcoded default: change to just `placeholder` (no equals sign or value)
- [ ] **5.3** Locate the `getSelectedPropertyDisplay()` function at lines 143-155
- [ ] **5.4** Update line 145 to use fallback: change `if (!selectedPropertyId) return placeholder;` to `if (!selectedPropertyId) return placeholder || t('allProperties');`
- [ ] **5.5** Update line 147 to use fallback: change `if (!selectedProperty) return placeholder;` to `if (!selectedProperty) return placeholder || t('allProperties');`
- [ ] **5.6** Locate line 239 with `<span>{placeholder}</span>` in the dropdown
- [ ] **5.7** Update line 239 to use fallback: change to `<span>{placeholder || t('allProperties')}</span>`
- [ ] **5.8** Run `npm run typecheck` to verify no errors

**Acceptance Criteria**:
- `placeholder` prop has no hardcoded default value
- `getSelectedPropertyDisplay()` returns translation when placeholder is not provided
- "All Properties" option in dropdown uses translation when placeholder is not provided
- Custom placeholder prop from parent components still works (backward compatible)
- TypeScript compilation succeeds

---

### Task 6: Update Empty State Message (1 story point)

**Context**: The empty state message (line 297) currently uses `tEmpty('properties.noPropertiesAvailable')` from the `common.emptyStates` namespace. This key path is incorrect and should use the new `t` hook with just the key name.

**Files to Modify**:
- `/src/components/PropertySelector.tsx`

**Estimated Effort**: 1 story point (namespace correction)

**Subtasks**:
- [ ] **6.1** Locate line 297 with `{tEmpty('properties.noPropertiesAvailable')}`
- [ ] **6.2** Replace with correct namespace reference: change to `{t('noPropertiesAvailable')}`
- [ ] **6.3** Note: The key is just `'noPropertiesAvailable'` since we're already using the `properties.selector` namespace
- [ ] **6.4** Run `npm run typecheck` to verify no errors

**Acceptance Criteria**:
- Empty state uses `t('noPropertiesAvailable')`
- No reference to `tEmpty` variable (which no longer exists)
- Translation key path is correct relative to namespace
- TypeScript compilation succeeds

---

### Task 7: Update Loading Text in Dropdown (1 story point)

**Context**: The loading state dropdown (line 309) has hardcoded text: "Loading properties...". This should use the same `loading` translation key.

**Files to Modify**:
- `/src/components/PropertySelector.tsx`

**Estimated Effort**: 1 story point (simple string replacement)

**Subtasks**:
- [ ] **7.1** Locate line 309 with `<span>Loading properties...</span>`
- [ ] **7.2** Replace hardcoded string with translation: change to `<span>{t('loading')}</span>`
- [ ] **7.3** Verify the surrounding JSX structure (flex container, spinner icon) remains unchanged
- [ ] **7.4** Run `npm run typecheck` to verify no errors

**Acceptance Criteria**:
- Loading dropdown text uses `t('loading')`
- Spinner animation and layout unchanged
- TypeScript compilation succeeds

---

### Task 8: Verify Component Functionality (Non-Coding Verification)

**Context**: After all translation updates, verify the component renders and functions correctly with the new translation references.

**Estimated Effort**: Not a numbered task - verification step

**Verification Steps**:
1. Start development server: `npm run dev`
2. Navigate to a page that uses PropertySelector component
3. Verify filter label displays "Property Filter"
4. Verify filter description displays "Filter analytics data by property"
5. Click the dropdown button to open options
6. Verify "All Properties" option displays correctly
7. Verify individual property options display correctly
8. Test keyboard navigation (Arrow Up/Down, Enter, Escape)
9. Verify loading state shows "Loading properties..." if triggered
10. Verify empty state shows "No properties available" when properties array is empty
11. Test screen reader accessibility (button aria-label should be announced)

**Expected Behavior**:
- All visible text comes from translations (no hardcoded English)
- Component appearance and styling unchanged
- All interactions work as before (dropdowns, selection, keyboard nav)
- No console errors or warnings
- Screen readers announce proper labels

---

### Task 9: Run Full Test Suite and Build (Non-Coding Verification)

**Context**: Final verification that all changes integrate correctly and don't break existing functionality.

**Estimated Effort**: Not a numbered task - verification step

**Verification Steps**:
1. Run full type check: `npm run typecheck`
2. Run all tests: `npm test`
3. Run production build: `npm run build`
4. Run linter: `npm run lint`

**Expected Outcomes**:
- `npm run typecheck`: ✓ No TypeScript errors
- `npm test`: ✓ All tests pass
- `npm run build`: ✓ Build completes successfully
- `npm run lint`: ✓ No new linting errors

**If Any Command Fails**:
1. Review error messages carefully
2. Fix TypeScript errors related to translation keys or hook usage
3. Fix any test failures (likely related to missing translation mocks)
4. Fix build errors if any imports or exports are broken
5. Re-run failing command until it passes

---

## Authorized Files for Modification

This task authorizes modification of the following files:

1. `/src/components/PropertySelector.tsx`
   - **Lines to modify**: 45, 47, 165, 168, 194, 199, 239, 297, 309
   - **Purpose**: Update translation hook, replace hardcoded strings with translation references
   - **Restrictions**: Do not modify component logic, styling, or accessibility features beyond translation updates

**Read-Only Files** (for reference, do not modify):

1. `/messages/en.json`
   - Reference lines 3239-3247 for `properties.selector` namespace keys
   - Do not modify translation file in this task

2. `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
   - Non-English translations already exist from Task 2F.1
   - Do not modify in this task

---

## Translation Key Reference

### Properties Selector Namespace (`properties.selector`)

All keys are defined in `/messages/en.json` lines 3239-3247:

```json
"selector": {
  "selectProperty": "Select Property",
  "allProperties": "All Properties",
  "unassigned": "Unassigned",
  "filterLabel": "Property Filter",
  "filterDescription": "Filter analytics data by property",
  "filterAriaLabel": "Select property for analytics filtering",
  "loading": "Loading properties...",
  "noPropertiesAvailable": "No properties available"
}
```

### Key Usage Map

| Line | Current Text | Translation Key | New Code |
|------|-------------|-----------------|----------|
| 3 | Last modified comment | N/A | Add REQ-E02-011 reference |
| 45 | `placeholder = 'All Properties'` | `allProperties` | `placeholder` (no default) |
| 47 | `const tEmpty = useTranslations(...)` | N/A | `const t = useTranslations('properties.selector')` |
| 145 | `return placeholder;` | `allProperties` | `return placeholder \|\| t('allProperties');` |
| 147 | `return placeholder;` | `allProperties` | `return placeholder \|\| t('allProperties');` |
| 165 | `Property Filter` | `filterLabel` | `{t('filterLabel')}` |
| 168 | `Filter analytics data by property` | `filterDescription` | `{t('filterDescription')}` |
| 194 | `Select property for analytics filtering` | `filterAriaLabel` | `{t('filterAriaLabel')}` |
| 199 | `Loading properties...` | `loading` | `{t('loading')}` |
| 239 | `{placeholder}` | `allProperties` | `{placeholder \|\| t('allProperties')}` |
| 297 | `properties.noPropertiesAvailable` | `noPropertiesAvailable` | `{t('noPropertiesAvailable')}` |
| 309 | `Loading properties...` | `loading` | `{t('loading')}` |

---

## Dependencies

### Prerequisites
- ✅ **Task 2F.1 (REQ-E02-085)**: Properties namespace structure created - COMPLETED
- ✅ **Translation keys exist**: All required keys exist in en.json

### Blocks
- 🔶 **Task 2F.6 (REQ-E02-090)**: Generate translations for properties namespace (5 languages) - This task should ideally wait until all property component updates are complete

### Parallel Safety
- ✅ **Can run in parallel** with other component update tasks (2F.2, 2F.3, 2F.4) as they modify different files
- ✅ **Independent of** translation generation task (uses existing en.json keys)

---

## Risk Assessment

### Risk 1: Missing Translation Keys
**Likelihood**: Very Low
**Impact**: High (component would crash with missing key error)
**Mitigation**: All keys verified to exist in en.json lines 3239-3247. Task 2F.1 already created all necessary keys.

### Risk 2: Component Behavior Changes
**Likelihood**: Low
**Impact**: Medium (users might notice different default behavior)
**Mitigation**:
- Use `placeholder || t('allProperties')` pattern to maintain backward compatibility
- Component logic remains unchanged, only text strings updated
- Thorough manual testing before deployment

### Risk 3: Accessibility Regression
**Likelihood**: Very Low
**Impact**: High (screen reader users affected)
**Mitigation**:
- aria-label attribute updated but remains present
- Test with screen readers after implementation
- No changes to ARIA roles or keyboard navigation

### Risk 4: TypeScript Errors
**Likelihood**: Very Low
**Impact**: Low (build fails, easy to fix)
**Mitigation**:
- Run `npm run typecheck` after each task
- Translation hook typing is well-established in codebase
- Follow exact patterns from other migrated components

---

## Testing Strategy

### Manual Testing

**Test Case 1: Component Renders with Translations**
- **Setup**: Open any page using PropertySelector
- **Action**: Observe component rendering
- **Expected**: All text displays from translation keys, no hardcoded English visible

**Test Case 2: Dropdown Functionality**
- **Setup**: Component rendered with multiple properties
- **Action**: Click dropdown button, select different properties
- **Expected**: Dropdown opens/closes correctly, selections work, "All Properties" option displays translated text

**Test Case 3: Loading State**
- **Setup**: Trigger loading state (mock or real API call)
- **Action**: Observe button and dropdown during loading
- **Expected**: "Loading properties..." text displays from translation

**Test Case 4: Empty State**
- **Setup**: Pass empty properties array to component
- **Action**: Open dropdown
- **Expected**: "No properties available" message displays from translation

**Test Case 5: Keyboard Navigation**
- **Setup**: Component rendered and focused
- **Action**: Use arrow keys, enter, escape to navigate
- **Expected**: All keyboard interactions work as before, no regressions

**Test Case 6: Custom Placeholder**
- **Setup**: Pass custom `placeholder="Select a property"` prop
- **Action**: Observe "All Properties" option label
- **Expected**: Custom placeholder text is used instead of translated default

**Test Case 7: Screen Reader Accessibility**
- **Setup**: Use screen reader (NVDA, JAWS, or VoiceOver)
- **Action**: Tab to dropdown button
- **Expected**: Screen reader announces "Select property for analytics filtering" from aria-label

### Automated Testing

**Type Checking**:
```bash
npm run typecheck
```
- Should pass with no errors related to PropertySelector
- Verifies translation hook types are correct

**Unit/Integration Tests**:
```bash
npm test
```
- Existing tests should continue to pass
- If tests mock translations, ensure they mock `properties.selector` namespace

**Build Verification**:
```bash
npm run build
```
- Should complete successfully
- Verifies no runtime import/export issues

**Lint Check**:
```bash
npm run lint
```
- Should pass with no new errors
- Verifies code style compliance

### Test Data Requirements

**Properties Array**:
```typescript
const testProperties = [
  {
    id: '1',
    nickname: 'Beach House',
    property_types: { display_name: 'House' },
    users: { email: 'owner@example.com' }
  },
  {
    id: '2',
    nickname: 'Downtown Apartment',
    property_types: { display_name: 'Apartment' }
  }
];
```

**Empty State**:
```typescript
const emptyProperties = [];
```

**Loading State**:
```typescript
loading={true}
```

---

## Rollback Plan

If this task causes issues in production:

1. **Immediate Rollback**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Identify Issue**:
   - Check browser console for errors
   - Review server logs for missing translation key errors
   - Test component functionality manually

3. **Hotfix if Needed**:
   - If specific key is missing: Add key to en.json and redeploy
   - If component broken: Revert commit and debug offline
   - If translation incorrect: Update translation value in en.json

4. **Post-Rollback**:
   - Document issue in this spec
   - Fix locally and re-test thoroughly
   - Re-deploy when confirmed working

---

## Success Criteria

This task is considered complete when:

1. ✅ All 7 numbered tasks completed
2. ✅ Translation hook updated to `properties.selector` namespace
3. ✅ All 7 hardcoded strings replaced with translation references
4. ✅ `placeholder` prop default removed, fallback pattern implemented
5. ✅ Component renders correctly with all translated text
6. ✅ TypeScript compilation succeeds (`npm run typecheck`)
7. ✅ All tests pass (`npm test`)
8. ✅ Production build succeeds (`npm run build`)
9. ✅ Linting passes (`npm run lint`)
10. ✅ Manual testing confirms no regressions
11. ✅ Accessibility features work correctly (keyboard nav, screen readers)
12. ✅ Loading and empty states display properly
13. ✅ No hardcoded English strings remain in PropertySelector component

---

## Notes

- **Component Usage**: PropertySelector is used throughout the application for filtering analytics and selecting properties in various contexts
- **Backward Compatibility**: The `placeholder || t('allProperties')` pattern ensures custom placeholders still work while providing a translated default
- **Accessibility**: All ARIA attributes and keyboard navigation remain unchanged, only text content is translated
- **Styling**: No CSS or styling changes in this task, purely translation migration
- **Future Work**: Task 2F.6 will generate translations for all 5 non-English languages

---

## Document Status

- [x] Specification complete
- [ ] Implementation complete (to be updated by implementing agent)
- [ ] QA validation complete (to be updated by QA agent)
- [ ] Deployed to production (to be updated after deployment)
