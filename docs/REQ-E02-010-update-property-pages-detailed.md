# REQ-E02-010: Update Property Pages for i18n - Detailed Implementation Tasks

**Generated:** 2026-01-22 19:54
**Reference Documents:**
- Requirements: `/docs/gen_requests_epic2.md` - REQ-E02-010
- Overview: `/docs/REQ-E02-010-update-property-pages-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npm run typecheck` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## Overview

This document provides granular, implementation-ready tasks for updating the Properties page (`src/app/dashboard2/properties/page.tsx`) to use the unified `properties` namespace for translations. The page currently uses the `common.notifications` namespace and has several hardcoded strings that will be migrated to the `properties` namespace created in Task 2F.1 (REQ-E02-085).

**Current State:**
- **File:** `src/app/dashboard2/properties/page.tsx` (135 lines)
- **Component Type:** Client component (Next.js 15 App Router page)
- **Current Namespace:** `common.notifications` (line 26)
- **Hardcoded Strings:** 3 hardcoded strings (title, subtitle, login prompt)
- **Translation Keys Used:** 2 success notification keys

**Migration Scope:**
- Replace 1 translation hook (`common.notifications` → `properties`)
- Migrate 3 hardcoded strings to translation keys
- Update 2 success notification key references
- Add @lastModified comment

**Prerequisite:** REQ-E02-085 (Task 2F.1) must be completed - the `properties` namespace structure must exist in all 6 language files.

---

## 1. Update Translation Hook Declaration

**Context:** Replace the `common.notifications` translation hook with unified `properties` namespace hook.
**Files to modify:** `/src/app/dashboard2/properties/page.tsx`
**Estimated effort:** 0.25 story points

- [x] **1.1** Locate the translation hook declaration at line 26 ---implemented: Located at line 26
- [x] **1.2** Replace `const tNotifications = useTranslations('common.notifications');` with `const t = useTranslations('properties');` ---implemented: Changed namespace from common.notifications to properties
- [x] **1.3** Verify the import statement `import { useTranslations } from 'next-intl';` remains unchanged ---implemented: Verified at line 14, unchanged
- [x] **1.4** Run TypeScript type check: `npm run typecheck` to verify hook declaration is valid ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

---

## 2. Update Page Title and Subtitle

**Context:** Replace hardcoded page title and subtitle with translation keys.
**Files to modify:** `/src/app/dashboard2/properties/page.tsx`
**Estimated effort:** 0.5 story points

- [x] **2.1** Locate the page title at line 93 ---implemented: Found at line 93
- [x] **2.2** Replace the hardcoded string `"My Properties"` with `{t('title')}` ---implemented: Replaced with t('title')
- [x] **2.3** Locate the page subtitle at lines 94-96 ---implemented: Found at lines 94-96
- [x] **2.4** Replace the hardcoded string `"Manage your properties and their settings"` with `{t('subtitle')}` ---implemented: Replaced with t('subtitle')
- [x] **2.5** Verify the translation keys exist in `/messages/en.json` at `properties.title` and `properties.subtitle` ---implemented: Keys exist from REQ-E02-085
- [x] **2.6** Verify the h1 element and className attributes remain unchanged ---implemented: Verified h1 element unchanged
- [x] **2.7** Verify the p element and className attributes remain unchanged ---implemented: Verified p element unchanged
- [x] **2.8** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

**Expected Result:**
```typescript
<div>
  <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
  <p className="text-gray-600 mt-1">
    {t('subtitle')}
  </p>
</div>
```

---

## 3. Update Login Prompt Message

**Context:** Replace hardcoded login prompt with translation key.
**Files to modify:** `/src/app/dashboard2/properties/page.tsx`
**Estimated effort:** 0.25 story points

- [x] **3.1** Locate the login prompt at line 84 ---implemented: Found at line 84
- [x] **3.2** Replace the hardcoded string `"Please log in to view properties."` with `{t('list.loginRequired')}` ---implemented: Replaced with t('list.loginRequired')
- [x] **3.3** Verify the translation key exists in `/messages/en.json` at `properties.list.loginRequired` ---implemented: Key exists from REQ-E02-085
- [x] **3.4** Verify the p element and className attributes remain unchanged ---implemented: Verified p element unchanged
- [x] **3.5** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

**Expected Result:**
```typescript
<p className="text-gray-600">{t('list.loginRequired')}</p>
```

---

## 4. Update Property Updated Success Notification

**Context:** Migrate property updated success notification from `common.notifications` to `properties.notifications` namespace.
**Files to modify:** `/src/app/dashboard2/properties/page.tsx`
**Estimated effort:** 0.25 story points

- [x] **4.1** Locate the property updated success message at line 53 ---implemented: Found at line 53
- [x] **4.2** Replace `setSuccessMessage(tNotifications('success.propertyUpdated'));` with `setSuccessMessage(t('notifications.propertyUpdated'));` ---implemented: Updated to use properties.notifications.propertyUpdated
- [x] **4.3** Verify the translation key exists in `/messages/en.json` at `properties.notifications.propertyUpdated` ---implemented: Key exists from REQ-E02-085
- [x] **4.4** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

---

## 5. Update Property Created Success Notification

**Context:** Migrate property created success notification from `common.notifications` to `properties.notifications` namespace.
**Files to modify:** `/src/app/dashboard2/properties/page.tsx`
**Estimated effort:** 0.25 story points

- [x] **5.1** Locate the property created success message at line 76 ---implemented: Found at line 76
- [x] **5.2** Replace `setSuccessMessage(tNotifications('success.propertyCreated'));` with `setSuccessMessage(t('notifications.propertyCreated'));` ---implemented: Updated to use properties.notifications.propertyCreated
- [x] **5.3** Verify the translation key exists in `/messages/en.json` at `properties.notifications.propertyCreated` ---implemented: Key exists from REQ-E02-085
- [x] **5.4** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)

---

## 6. Add @lastModified Comment

**Context:** Add modification tracking comment to document i18n update.
**Files to modify:** `/src/app/dashboard2/properties/page.tsx`
**Estimated effort:** 0.25 story points

- [x] **6.1** Locate the existing file header comment around lines 10-11 ---implemented: Found header comment at lines 3-11
- [x] **6.2** Add or update the @lastModified line with: `* @lastModified 2026-01-22 - REQ-E02-010: Updated for i18n with properties namespace` ---implemented: Added @lastModified line with REQ-E02-010
- [x] **6.3** Verify the comment follows the established JSDoc format ---implemented: Verified JSDoc format
- [x] **6.4** Verify the @created date remains unchanged (if present) ---implemented: @created 2026-01-08 unchanged

**Expected Result:**
```typescript
/**
 * Properties page for Dashboard 2
 * @created 2026-01-08
 * @lastModified 2026-01-22 - REQ-E02-010: Updated for i18n with properties namespace
 */
```

---

## 7. Verify PropertySection Component Compatibility

**Context:** Ensure PropertySection component (which uses `dashboard.property.*` namespace) continues to work correctly with the updated page.
**Estimated effort:** 0.5 story points

- [x] **7.1** Read `/src/components/SimpleDashboard/PropertySection.tsx` to understand current implementation ---implemented: Read component, uses dashboard namespace at line 253
- [x] **7.2** Verify PropertySection uses `dashboard.property.*` namespace ---implemented: Verified uses dashboard namespace throughout
- [x] **7.3** Confirm PropertySection is NOT being modified in this task ---implemented: Confirmed - PropertySection unchanged
- [x] **7.4** Verify PropertySection usage at lines 112-116 in page.tsx remains unchanged ---implemented: Verified PropertySection component usage unchanged
- [x] **7.5** Document that PropertySection continues using `dashboard.property.*` namespace ---implemented: PropertySection continues using dashboard namespace as designed
- [x] **7.6** Note in comments that PropertySection migration is out of scope for this task ---implemented: Documented as out of scope - shared component requiring broader analysis

**PropertySection Translation Keys (for reference only):**
- `dashboard.property.editAriaLabel`
- `dashboard.property.itemCount`
- `dashboard.property.roomCount`
- `dashboard.property.singular`
- `dashboard.property.plural`
- `dashboard.property.emptyTitle`
- `dashboard.property.emptyDescription`
- `dashboard.property.loadingProperties`
- `dashboard.property.listAriaLabel`
- `dashboard.property.addAriaLabel`
- `dashboard.buttons.addProperty`
- `dashboard.buttons.addNewProperty`

**Design Decision:** PropertySection remains unchanged because it's a shared component used across multiple dashboard pages. Migrating it requires broader impact analysis and is out of scope for this task.

---

## 8. Run Full Verification Suite

**Context:** Validate all changes and ensure the page works correctly.
**Estimated effort:** 0.5 story points

- [x] **8.1** Run TypeScript type check: `npm run typecheck` ---implemented: Type check passed ---ts-check: passed (0 errors, baseline: 0)
- [x] **8.2** Verify no TypeScript errors related to translation keys ---implemented: No translation key type errors found
- [x] **8.3** Run lint check: `npm run lint` ---implemented: Included in build output, no new errors
- [x] **8.4** Verify no new linting errors introduced ---implemented: Only pre-existing lint warnings in unrelated files (test files, admin pages, API routes)
- [x] **8.5** Run build: `npm run build` ---implemented: Build succeeded, compiled in 89s ---build: passed (89s)
- [x] **8.6** Verify build succeeds without errors ---implemented: Compilation successful, no build errors
- [x] **8.7** Count total translation keys migrated (should be 5 keys) ---implemented: 5 keys confirmed (title, subtitle, list.loginRequired, notifications.propertyUpdated, notifications.propertyCreated)
- [x] **8.8** Verify the translation hook uses `properties` namespace (no references to `common.notifications` remain) ---implemented: Grep search confirmed no references to common.notifications remain
- [x] **8.9** Document any issues or deviations from the specification ---implemented: Tasks 4 & 5 completed earlier than scheduled to resolve type errors from Task 1, maintaining working state

**Expected Results:**
- TypeScript: 0 errors ✓
- Build: Success ✓
- Translation keys migrated: 5 (title, subtitle, loginRequired, propertyUpdated, propertyCreated) ✓

**Deviation Notes:**
- Tasks 4 and 5 were completed immediately after Task 1 (instead of sequential order) to resolve type errors introduced by renaming the translation hook variable. This was necessary to maintain a working state and allow type checking to pass after Task 1.

---

## 9. Manual Testing (Optional but Recommended)

**Context:** Test the page in the browser to verify functionality.
**Estimated effort:** 0.5 story points

### Page Load Testing

- [ ] **9.1** Navigate to `/dashboard2/properties`
- [ ] **9.2** Verify page title displays "My Properties"
- [ ] **9.3** Verify page subtitle displays "Manage your properties and their settings"
- [ ] **9.4** Verify no console errors for missing translation keys

### Property List Testing

- [ ] **9.5** Verify PropertySection displays correctly (via dashboard.property.* namespace)
- [ ] **9.6** Verify property list shows with item and room counts
- [ ] **9.7** Verify empty state displays when no properties exist

### Property Creation Testing

- [ ] **9.8** Click "Add Property" button
- [ ] **9.9** Fill out AddPropertyModal (should use properties namespace from Task 2F.3)
- [ ] **9.10** Submit new property
- [ ] **9.11** Verify success message displays: "Property created successfully"
- [ ] **9.12** Verify success message has role="status" and aria-live="polite" attributes
- [ ] **9.13** Verify message disappears after 3 seconds

### Property Editing Testing

- [ ] **9.14** Click a property row to edit
- [ ] **9.15** Modify property in PropertyEditModal (should use properties namespace from Task 2F.3)
- [ ] **9.16** Save changes
- [ ] **9.17** Verify success message displays: "Property updated successfully"
- [ ] **9.18** Verify message disappears after 3 seconds

### Authentication Testing

- [ ] **9.19** If possible, test the login guard by logging out
- [ ] **9.20** Navigate to `/dashboard2/properties` while logged out
- [ ] **9.21** Verify login prompt displays: "Please log in to view properties."

---

## Authorized Files for Modification

### Page Updates

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/src/app/dashboard2/properties/page.tsx` | Lines 10-11 | Modify | Add/update @lastModified comment |
| `/src/app/dashboard2/properties/page.tsx` | Line 26 | Modify | Replace translation hook namespace |
| `/src/app/dashboard2/properties/page.tsx` | Line 53 | Modify | Update property updated notification key |
| `/src/app/dashboard2/properties/page.tsx` | Line 76 | Modify | Update property created notification key |
| `/src/app/dashboard2/properties/page.tsx` | Line 84 | Modify | Replace hardcoded login prompt |
| `/src/app/dashboard2/properties/page.tsx` | Lines 93-96 | Modify | Replace hardcoded title and subtitle |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Verify translation keys exist | Lines 3219-3400+ for `properties` namespace |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Verify component compatibility | Uses `dashboard.property.*`, no changes in this task |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Reference modal integration | Being updated in Task 2F.3 (REQ-E02-009) |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Reference modal integration | Being updated in Task 2F.3 (REQ-E02-009) |

---

## Translation Key Mapping Reference

This table documents the complete migration from old namespaces to new `properties` namespace:

| Old Value/Key | Type | New Key | Namespace | Line(s) |
|---------------|------|---------|-----------|---------|
| Hardcoded "My Properties" | String | `title` | properties | 93 |
| Hardcoded "Manage your properties and their settings" | String | `subtitle` | properties | 94-96 |
| Hardcoded "Please log in to view properties." | String | `list.loginRequired` | properties | 84 |
| `common.notifications.success.propertyUpdated` | Key | `notifications.propertyUpdated` | properties | 53 |
| `common.notifications.success.propertyCreated` | Key | `notifications.propertyCreated` | properties | 76 |

**Total Keys Migrated:** 5 keys

---

## Expected Translation Keys in `properties` Namespace

After this implementation, the PropertiesPage will use these keys from the `properties` namespace:

### properties (root level - 2 keys)
- `title`: "My Properties"
- `subtitle`: "Manage your properties and their settings"

### properties.list (1 key)
- `loginRequired`: "Please log in to view properties."

### properties.notifications (2 keys)
- `propertyUpdated`: "Property updated successfully"
- `propertyCreated`: "Property created successfully"

**Total Keys Used:** 5 keys

**Note:** PropertySection component uses additional keys from `dashboard.property.*` namespace but is not being modified in this task.

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **Epic 1 Foundation** | Framework | Complete | next-intl setup, useTranslations hook |
| **REQ-E02-085** (Task 2F.1) | Translation Keys | **REQUIRED** | `properties` namespace structure in all 6 language files |
| **REQ-E02-009** (Task 2F.3) | Modal Integration | Recommended | PropertyEditModal and AddPropertyModal use `properties` namespace |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-090** (Task 2F.6) | PropertiesPage strings ready for translation generation |

### Parallel Safety

- **Files touched:** 1 file (page.tsx)
- **Conflicts with:** None - PropertiesPage is isolated
- **Safe to parallelize with:**
  - REQ-E02-008 (Task 2F.2 - PropertyForm) - different files
  - REQ-E02-089 (Task 2F.5 - PropertySelector) - different files

**Note:** Task 2F.3 (property modals) should ideally complete first since PropertiesPage uses those modals, but they operate independently.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PropertySection breaks | Low | High | PropertySection already internationalized, verify compatibility in Task 7 |
| Success messages don't display | Low | Medium | Test notification flow thoroughly after migration |
| Login prompt missing | Low | Medium | Verify auth guard logic unchanged, only string replaced |
| Title/subtitle styling breaks | Low | Low | Keep className attributes unchanged |
| Translation keys missing | Low | High | Verify all keys exist in properties namespace before starting |

---

## Testing Strategy

### TypeScript Verification
- [ ] Run `npm run typecheck` - 0 errors expected
- [ ] Verify no errors related to translation key types
- [ ] Verify translation hook has correct type inference

### Build Verification
- [ ] Run `npm run build` - build succeeds
- [ ] No warnings about missing translation keys
- [ ] No console errors in development mode

### Manual Testing (if accessible)
1. **Page Display:**
   - Navigate to properties page
   - Verify title and subtitle in English
   - Verify page layout unchanged

2. **Property Management:**
   - Create new property
   - Verify success message displays
   - Edit existing property
   - Verify success message displays
   - Verify PropertySection displays correctly

3. **Authentication:**
   - Test login guard if possible
   - Verify login prompt displays

---

## Open Questions

1. **PropertySection Migration:**
   - **Question:** Should PropertySection be migrated to `properties` namespace?
   - **Current State:** Uses `dashboard.property.*` namespace
   - **Recommendation:** Separate task - PropertySection is shared across dashboard pages
   - **Resolution:** Out of scope for this task

2. **Success Message Duration:**
   - **Question:** Is 3-second display duration appropriate for all languages?
   - **Current State:** Hardcoded 3000ms timeout
   - **Recommendation:** Keep unchanged, may need adjustment after translation
   - **Resolution:** To be evaluated in Task 2F.6 (translation testing)

3. **Other PropertySection Usage:**
   - **Question:** Are there other pages using PropertySection that need similar updates?
   - **Action:** Document for future reference
   - **Resolution:** Out of scope for this task

---

## Out of Scope

- Migrating PropertySection component to `properties` namespace (separate task needed)
- Updating other pages that use PropertySection component
- Modifying page layout, routing, or URL structure
- Changing PropertySection behavior or styling
- Adding new fields or features to property management
- Modifying PropertyEditModal or AddPropertyModal (handled by Task 2F.3)
- Actual translations to non-English languages (handled by Task 2F.6)
- Updating success message timing or animation logic
- Changing authentication guard logic or redirect behavior
- Migrating dashboard-wide components or layout
- Creating new translation keys beyond those specified
- Unit test updates (if tests exist, update separately)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Overview Document:** `/docs/REQ-E02-010-update-property-pages-overview.md`
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **Modal Updates:** `/docs/REQ-E02-009-update-property-modals-overview.md` (Task 2F.3)
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-010
- **PropertiesPage:** `/src/app/dashboard2/properties/page.tsx`
- **PropertySection:** `/src/components/SimpleDashboard/PropertySection.tsx`
- **Translation Files:** `/messages/en.json` (properties namespace lines 3219-3400+)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
*Task ID: 2F.4 - Update property pages for i18n*
*Last Modified: 2026-01-22 19:54*
