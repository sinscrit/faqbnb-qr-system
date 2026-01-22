# REQ-E02-010: Update Property Pages for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-010
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task Reference:** 2F.4
**Priority:** High
**Size:** S (Small)

**Created:** 2026-01-22 19:51
**Last Modified:** 2026-01-22 19:51

---

## Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-010 (Task 2F.4) |
| Source File | docs/gen_requests.md (Request #10) |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 19:51 |
| T-shirt Size | S (Small) |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## Summary

This document provides the implementation breakdown for updating the Properties page (`src/app/dashboard2/properties/page.tsx`) to use the new `properties` namespace for translations. The page currently uses `common.notifications` namespace (line 26) and has several hardcoded strings that need to be migrated to the unified `properties` namespace created in Task 2F.1.

**Current State:**
- **PropertiesPage** (135 lines) - Main page component at `/dashboard2/properties`
- Uses `common.notifications` for success messages (lines 53, 76)
- Hardcoded page title and subtitle (lines 93-96)
- Hardcoded login prompt (line 84)
- Relies on PropertySection component which already uses `dashboard` namespace

**Dependencies:**
- PropertySection component (already internationalized with `dashboard` namespace)
- PropertyEditModal and AddPropertyModal (being updated in Task 2F.3)

The implementation plan specifies ~50 strings for property pages. Investigation shows the PropertiesPage itself has ~6-8 hardcoded strings, while PropertySection (used by the page) already has internationalization using `dashboard.property.*` keys.

**Key Finding:** PropertiesPage has minimal hardcoded strings. Most display logic is delegated to PropertySection, which already uses the `dashboard` namespace. This task primarily involves migrating the page-level strings (title, subtitle, login prompt) and success notifications to the `properties` namespace.

---

## Goals

### Functional Requirements

1. Migrate PropertiesPage hardcoded strings to `properties` namespace
2. Update page title and subtitle (lines 93-96)
3. Update login prompt message (line 84)
4. Migrate success notifications from `common.notifications` to `properties.notifications`
5. Ensure PropertySection component continues to work (already internationalized)
6. Maintain success message banner functionality
7. Preserve all accessibility features (role="status", aria-live="polite")

### Assumptions & Clarifications

- Task 2F.1 (Create `properties` namespace structure) has been completed
- The `properties` namespace exists in all 6 language files with required keys
- PropertiesPage is a client component using `useTranslations` hook
- PropertySection component already uses `dashboard.property.*` namespace (will not be modified in this task)
- **Design decision:** Keep PropertySection using `dashboard.property.*` namespace for now
  - PropertySection is shared across multiple dashboard pages
  - Migrating PropertySection requires broader impact analysis
  - Focus this task on PropertiesPage-specific strings only
- Page layout, routing, and component composition should not be modified
- Success message timing and animation should remain unchanged

---

## Requirements Analysis

### Current Implementation Analysis

**File:** `src/app/dashboard2/properties/page.tsx` (135 lines)

**Current Translation Usage (line 26):**
```typescript
const tNotifications = useTranslations('common.notifications');
```

**Hardcoded Strings Found:**

| Line | String | Category | New Key |
|------|--------|----------|---------|
| 84 | "Please log in to view properties." | Login prompt | `properties.list.loginRequired` |
| 93 | "My Properties" | Page title | `properties.title` |
| 94-96 | "Manage your properties and their settings" | Page subtitle | `properties.subtitle` |

**Translation Keys Used:**

| Current Key | Line(s) | New Key | Category |
|-------------|---------|---------|----------|
| `tNotifications('success.propertyUpdated')` | 53 | `properties.notifications.propertyUpdated` | Success message |
| `tNotifications('success.propertyCreated')` | 76 | `properties.notifications.propertyCreated` | Success message |

**PropertySection Component Usage (lines 112-116):**
- Already internationalized with `dashboard.property.*` namespace
- Uses keys like: `property.editAriaLabel`, `property.itemCount`, `property.roomCount`, `property.singular`, `property.plural`, `property.emptyTitle`, `property.emptyDescription`, `property.loadingProperties`, `property.listAriaLabel`, `property.addAriaLabel`
- Also uses `buttons.addProperty`, `buttons.addNewProperty`
- **No changes needed** - PropertySection will continue using `dashboard` namespace

### Component Structure

```
PropertiesPage (page.tsx)
├── Header Section
│   ├── Title: "My Properties" (hardcoded line 93)
│   └── Subtitle: "Manage your properties and their settings" (hardcoded lines 94-96)
├── Success Message Banner (lines 100-109)
│   └── Uses successMessage state populated by tNotifications
├── PropertySection (lines 112-116)
│   └── Already uses dashboard.property.* namespace
├── PropertyEditModal (lines 119-124)
│   └── Being updated in Task 2F.3
└── AddPropertyModal (lines 127-131)
    └── Being updated in Task 2F.3
```

---

## Technical Approach

### Migration Strategy

The migration will focus on PropertiesPage-specific strings only:

1. **Add translation hook for properties namespace** (after line 26):
   - Add `const t = useTranslations('properties')`
   - Keep existing `tNotifications` for now, will be replaced

2. **Update page title and subtitle** (lines 93-96):
   - Replace hardcoded "My Properties" with `t('title')`
   - Replace hardcoded subtitle with `t('subtitle')`

3. **Update login prompt** (line 84):
   - Replace hardcoded "Please log in to view properties." with `t('list.loginRequired')`

4. **Update success notifications** (lines 53, 76):
   - Replace `tNotifications('success.propertyUpdated')` with `t('notifications.propertyUpdated')`
   - Replace `tNotifications('success.propertyCreated')` with `t('notifications.propertyCreated')`
   - Remove `tNotifications` hook declaration (line 26)

5. **Keep PropertySection unchanged**:
   - PropertySection already uses `dashboard.property.*` namespace
   - No modifications needed in this task
   - Future consideration: Migrate PropertySection to `properties` namespace in separate task

### Translation Key Mapping

| Current | New | Notes |
|---------|-----|-------|
| Hardcoded "My Properties" | `properties.title` | Page title |
| Hardcoded "Manage your properties..." | `properties.subtitle` | Page description |
| Hardcoded "Please log in..." | `properties.list.loginRequired` | Auth guard message |
| `common.notifications.success.propertyUpdated` | `properties.notifications.propertyUpdated` | Success message |
| `common.notifications.success.propertyCreated` | `properties.notifications.propertyCreated` | Success message |

---

## Implementation Tasks

### Task 1: Update translation hooks in PropertiesPage (Priority: High)

**Description:** Add `properties` namespace translation hook and update success notification references.

**File:** `/src/app/dashboard2/properties/page.tsx`

**Changes Required:**

**Line 26** - Replace:
```typescript
const tNotifications = useTranslations('common.notifications');
```

**With:**
```typescript
const t = useTranslations('properties');
```

**Rationale:** Consolidate into single `properties` namespace hook. Success notification keys will be accessed via `t('notifications.propertyUpdated')` instead of `tNotifications('success.propertyUpdated')`.

**Acceptance Criteria:**
- [ ] Translation hook uses `properties` namespace
- [ ] TypeScript compilation succeeds

---

### Task 2: Update page title and subtitle (Priority: High)

**Description:** Replace hardcoded page title and subtitle with translation keys.

**File:** `/src/app/dashboard2/properties/page.tsx`

**Changes Required:**

**Lines 93-96** - Replace:
```typescript
<div>
  <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
  <p className="text-gray-600 mt-1">
    Manage your properties and their settings
  </p>
</div>
```

**With:**
```typescript
<div>
  <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
  <p className="text-gray-600 mt-1">
    {t('subtitle')}
  </p>
</div>
```

**Expected Keys in `properties`:**
- `title`: "My Properties"
- `subtitle`: "Manage your properties and their settings"

**Acceptance Criteria:**
- [ ] Page title displays from translation key
- [ ] Page subtitle displays from translation key
- [ ] H1 heading semantics preserved
- [ ] Styling unchanged

---

### Task 3: Update login prompt message (Priority: High)

**Description:** Replace hardcoded login prompt with translation key.

**File:** `/src/app/dashboard2/properties/page.tsx`

**Changes Required:**

**Line 84** - Replace:
```typescript
<p className="text-gray-600">Please log in to view properties.</p>
```

**With:**
```typescript
<p className="text-gray-600">{t('list.loginRequired')}</p>
```

**Expected Key in `properties.list`:**
- `loginRequired`: "Please log in to view properties."

**Note:** This auth guard also exists in PropertiesPage layout (line 93 in REQ-E02-085 doc). Verify both use same translation key.

**Acceptance Criteria:**
- [ ] Login prompt displays from translation key
- [ ] Message shown when user is not authenticated
- [ ] Styling unchanged

---

### Task 4: Update success notification messages (Priority: High)

**Description:** Migrate success notifications from `common.notifications` to `properties.notifications` namespace.

**File:** `/src/app/dashboard2/properties/page.tsx`

**Changes Required:**

**Line 53** - Replace:
```typescript
setSuccessMessage(tNotifications('success.propertyUpdated'));
```

**With:**
```typescript
setSuccessMessage(t('notifications.propertyUpdated'));
```

**Line 76** - Replace:
```typescript
setSuccessMessage(tNotifications('success.propertyCreated'));
```

**With:**
```typescript
setSuccessMessage(t('notifications.propertyCreated'));
```

**Expected Keys in `properties.notifications`:**
- `propertyUpdated`: "Property updated successfully"
- `propertyCreated`: "Property created successfully"

**Acceptance Criteria:**
- [ ] Success message displays after property edit
- [ ] Success message displays after property creation
- [ ] Messages use `properties.notifications.*` keys
- [ ] Banner animation and timing unchanged (3 second display)
- [ ] Accessibility preserved (role="status", aria-live="polite")

---

### Task 5: Add file modification header comment (Priority: Medium)

**Description:** Add modification tracking comment to document i18n update.

**File:** `/src/app/dashboard2/properties/page.tsx`

**Changes Required:**

**After line 10** - Add:
```typescript
 * @lastModified 2026-01-22 19:51 - REQ-E02-010: Updated for i18n with properties namespace
```

**Update line 11 to:**
```typescript
 * @created 2026-01-08
 * @lastModified 2026-01-22 19:51 - REQ-E02-010: Updated for i18n with properties namespace
 */
```

**Acceptance Criteria:**
- [ ] @lastModified comment added with correct date and request ID
- [ ] Comment follows established documentation pattern

---

### Task 6: Verify PropertySection compatibility (Priority: High)

**Description:** Ensure PropertySection component (which uses `dashboard.property.*` namespace) continues to work correctly with the updated page.

**Investigation Required:**

PropertySection currently uses these `dashboard` namespace keys:
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

**Design Decision:**
Keep PropertySection using `dashboard.property.*` namespace because:
1. PropertySection is shared across multiple dashboard pages (not just properties page)
2. Migrating PropertySection requires broader impact analysis
3. `dashboard.property.*` keys already exist and work correctly
4. Separates concerns: page-level strings vs. component-level strings

**Future Consideration:**
- Create separate task to migrate PropertySection to `properties.*` namespace
- Would require updating all pages that use PropertySection
- Consider if PropertySection should have its own namespace or use `properties`

**Acceptance Criteria:**
- [ ] PropertySection renders correctly on PropertiesPage
- [ ] Property list displays with item/room counts
- [ ] Empty state displays when no properties exist
- [ ] Add property button works
- [ ] Property edit navigation works
- [ ] No console errors for missing translation keys from PropertySection

---

### Task 7: Test page functionality and verify translations (Priority: High)

**Description:** Verify PropertiesPage works correctly with new `properties` namespace.

**Testing Steps:**

**Page Load:**
1. Navigate to `/dashboard2/properties`
2. Verify page title displays: "My Properties"
3. Verify subtitle displays: "Manage your properties and their settings"

**Property List:**
1. Verify properties display correctly (via PropertySection)
2. Verify item and room counts display
3. Verify empty state displays when no properties exist

**Property Creation:**
1. Click "Add Property" button
2. Fill out AddPropertyModal
3. Submit new property
4. Verify success message displays: "Property created successfully"
5. Verify message disappears after 3 seconds

**Property Editing:**
1. Click property row to edit
2. Modify property in PropertyEditModal
3. Save changes
4. Verify success message displays: "Property updated successfully"
5. Verify message disappears after 3 seconds

**Login Guard:**
1. Log out (if possible)
2. Navigate to `/dashboard2/properties`
3. Verify login prompt displays: "Please log in to view properties."

**Acceptance Criteria:**
- [ ] All page strings display in English (en.json)
- [ ] Page title and subtitle correct
- [ ] Login prompt displays when not authenticated
- [ ] Success messages display after create/edit
- [ ] PropertySection displays correctly
- [ ] No console errors for missing translation keys
- [ ] TypeScript compilation succeeds

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Page Updates

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/src/app/dashboard2/properties/page.tsx` | Line 10-11 | Modify | Add @lastModified comment |
| `/src/app/dashboard2/properties/page.tsx` | Line 26 | Modify | Replace `common.notifications` with `properties` namespace |
| `/src/app/dashboard2/properties/page.tsx` | Line 53 | Modify | Update success notification key |
| `/src/app/dashboard2/properties/page.tsx` | Line 76 | Modify | Update success notification key |
| `/src/app/dashboard2/properties/page.tsx` | Line 84 | Modify | Replace hardcoded login prompt |
| `/src/app/dashboard2/properties/page.tsx` | Lines 93-96 | Modify | Replace hardcoded title and subtitle |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Verify translation keys exist | Lines 3219-3327 for `properties` namespace |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Verify component compatibility | Uses `dashboard.property.*` namespace, no changes |
| `/src/app/dashboard2/properties/layout.tsx` | Check metadata translations | Already uses `metadata.dashboard.properties` |

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **Epic 1 Foundation** | Framework | Complete | next-intl setup, useTranslations hook |
| **REQ-E02-085** (Task 2F.1) | Translation Keys | Required | `properties` namespace structure in all 6 language files |
| **REQ-E02-009** (Task 2F.3) | Modal Updates | In Progress | PropertyEditModal and AddPropertyModal use `properties` namespace |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-090** (Task 2F.6) | PropertiesPage strings ready for translation generation |

### Parallel Safety

- **Files touched**: 1 file (`page.tsx`)
- **Conflicts with**: None - PropertiesPage is isolated
- **Safe to parallelize with**:
  - REQ-E02-008 (Task 2F.2 - PropertyForm) - different files
  - REQ-E02-089 (Task 2F.5 - PropertySelector) - different files

**Note:** Task 2F.3 (property modals) should complete first since PropertiesPage uses those modals.

### External Dependencies

- `next-intl` package (from Epic 1)
- PropertySection component (already internationalized)
- PropertyEditModal and AddPropertyModal (being updated in Task 2F.3)

---

## Risks and Considerations

### Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| PropertySection breaks | High | PropertySection already internationalized, verify compatibility in Task 6 |
| Success messages don't display | Medium | Test notification flow thoroughly after migration |
| Login prompt missing | Medium | Verify auth guard logic unchanged |
| Title/subtitle styling breaks | Low | Keep className attributes unchanged |

### Testing Requirements

- **Visual Testing**:
  - Verify page title and subtitle display correctly
  - Test success message banner animation and timing
  - Verify login prompt displays when not authenticated
  - Test PropertySection display (list, empty state, counts)
- **Functional Testing**:
  - Test property creation flow with success message
  - Test property editing flow with success message
  - Verify PropertySection interactions still work
  - Test auth guard redirect when not logged in
- **Integration Testing**:
  - Test full property management workflow (view, add, edit)
  - Verify modal integration (PropertyEditModal, AddPropertyModal)
- **Browser Testing**: Test in actual application with live translation files
- **Language Testing**: Verify works with all 6 supported languages (en, fr, es, de, nl, it)

### Open Questions

- [ ] Should PropertySection be migrated to `properties` namespace in this task or separate task?
  - **Recommendation:** Separate task - PropertySection is shared component
  - **This task:** Focus on PropertiesPage-specific strings only
- [ ] Should success notification keys be under `properties.notifications.*` or reuse `common.notifications.*`?
  - **Recommendation:** Use `properties.notifications.*` for namespace consistency
  - **Already defined in Task 2F.1:** Keys exist in `properties.notifications`
- [ ] Are there other pages that use PropertySection that need similar updates?
  - **Investigation Required:** Search for PropertySection usage across dashboard
  - **Action:** Document findings for future tasks

---

## Out of Scope

- Migrating PropertySection component to `properties` namespace (separate task)
- Updating other pages that use PropertySection component
- Modifying page layout, routing, or URL structure
- Changing PropertySection behavior or styling
- Adding new fields or features to property management
- Modifying modal components (handled by Task 2F.3)
- Actual translations to other languages (handled by Task 2F.6)
- Updating success message timing or animation
- Changing auth guard logic or redirect behavior
- Migrating dashboard-wide components to `properties` namespace

---

## Verification Checklist

### Pre-Implementation
- [ ] REQ-E02-085 (Task 2F.1) completed - `properties` namespace exists
- [ ] REQ-E02-009 (Task 2F.3) completed - Modals use `properties` namespace
- [ ] Reviewed PropertiesPage current implementation
- [ ] Identified all hardcoded strings
- [ ] Verified translation keys exist in `properties` namespace

### Implementation
- [ ] Translation hook updated to use `properties` namespace
- [ ] Page title migrated to translation key
- [ ] Page subtitle migrated to translation key
- [ ] Login prompt migrated to translation key
- [ ] Success notifications migrated to `properties.notifications.*`
- [ ] @lastModified comment added

### Post-Implementation
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] No console errors for missing translation keys
- [ ] Page title displays correctly
- [ ] Page subtitle displays correctly
- [ ] Login prompt displays when not authenticated
- [ ] Success message displays after property creation
- [ ] Success message displays after property edit
- [ ] Success message disappears after 3 seconds
- [ ] PropertySection displays correctly
- [ ] Property list shows item/room counts
- [ ] Empty state displays when no properties
- [ ] Add property button works
- [ ] Property edit navigation works
- [ ] Ready for translation generation (Task 2F.6)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **Modal Updates:** `/docs/REQ-E02-009-update-property-modals-overview.md` (Task 2F.3)
- **PropertiesPage:** `/src/app/dashboard2/properties/page.tsx`
- **PropertySection:** `/src/components/SimpleDashboard/PropertySection.tsx` (uses `dashboard.property.*`)
- **Translation Files:** `/messages/en.json` (lines 3219-3327 for `properties`, lines 905-1104 for `dashboard`)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated: 2026-01-22 19:51*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
