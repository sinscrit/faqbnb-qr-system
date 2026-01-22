# REQ-E02-011: Update PropertySelector Component for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-011
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task Reference:** 2F.5
**Priority:** High
**Size:** S (Small)

**Created:** 2026-01-22 20:10
**Last Modified:** 2026-01-22 20:10

---

## Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-011 (Task 2F.5) |
| Source File | docs/gen_requests.md (Request #11) |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 20:10 |
| T-shirt Size | S (Small) |
| Estimated Effort | 1-2 hours |
| Status | PENDING |

---

## Summary

This document provides the implementation breakdown for updating the PropertySelector component (`src/components/PropertySelector.tsx`) to use the new `properties.selector` namespace for translations. The component currently uses `common.emptyStates` namespace (line 47) and has several hardcoded strings that need to be migrated to the unified `properties.selector` namespace created in Task 2F.1.

**Component Overview:**
- **PropertySelector** (325 lines) - Dropdown selector for filtering by property
- Used across analytics and dashboard pages for property-based filtering
- Features: keyboard navigation, admin mode, loading states, empty states
- Currently uses `common.emptyStates` for single key (line 297)
- Has 6 hardcoded strings that need translation

The implementation plan specifies ~20 strings for PropertySelector. Investigation shows the component has ~8 hardcoded strings, with the `properties.selector` namespace already defined in en.json (lines 3239-3248) containing all required keys.

**Key Finding:** PropertySelector has minimal i18n implementation (only 1 key from `common.emptyStates`). The `properties.selector` namespace already exists with all 8 required keys ready for use.

---

## Goals

### Functional Requirements

1. Migrate PropertySelector from `common.emptyStates` to `properties.selector` namespace
2. Replace hardcoded "Property Filter" label (line 165)
3. Replace hardcoded "Filter analytics data by property" description (line 168)
4. Replace hardcoded "Select property for analytics filtering" ARIA label (line 194)
5. Replace hardcoded "Loading properties..." text (lines 199, 309)
6. Replace hardcoded "All Properties" placeholder (line 45, 239)
7. Update empty state message to use `properties.selector.noPropertiesAvailable` (line 297)
8. Maintain all component functionality (keyboard nav, admin mode, loading states)
9. Preserve accessibility features (ARIA labels, roles, keyboard navigation)

### Assumptions & Clarifications

- Task 2F.1 (Create `properties` namespace structure) has been completed
- The `properties.selector` namespace exists in all 6 language files with required keys
- PropertySelector is a client component using `useTranslations` hook
- Component is used across multiple pages for property-based filtering
- **Placeholder prop:** Default value is "All Properties" but can be overridden by parent components
  - Keep `placeholder` prop for flexibility
  - Use translation key as default value instead of hardcoded string
- Admin mode and loading state behavior should not be modified
- Keyboard navigation logic should remain unchanged

---

## Requirements Analysis

### Current Implementation Analysis

**File:** `src/components/PropertySelector.tsx` (325 lines)

**Current Translation Usage (line 47):**
```typescript
const tEmpty = useTranslations('common.emptyStates');
```

**Hardcoded Strings Found:**

| Line | String | Category | New Key |
|------|--------|----------|---------|
| 45 | "All Properties" | Placeholder default | `properties.selector.allProperties` |
| 165 | "Property Filter" | Label | `properties.selector.filterLabel` |
| 168 | "Filter analytics data by property" | Description | `properties.selector.filterDescription` |
| 194 | "Select property for analytics filtering" | ARIA label | `properties.selector.filterAriaLabel` |
| 199 | "Loading properties..." | Loading text | `properties.selector.loading` |
| 239 | {placeholder} (uses prop default "All Properties") | Dropdown option | `properties.selector.allProperties` |
| 309 | "Loading properties..." | Loading dropdown | `properties.selector.loading` |

**Translation Keys Used:**

| Current Key | Line(s) | New Key | Category |
|-------------|---------|---------|----------|
| `tEmpty('properties.noPropertiesAvailable')` | 297 | `properties.selector.noPropertiesAvailable` | Empty state |

**Note:** The current key already uses the correct path (`properties.noPropertiesAvailable`) but accesses it through `common.emptyStates` namespace. This is unusual and suggests the key might exist in multiple namespaces or was recently migrated.

### Component Features

1. **Dropdown Selector:**
   - Shows "All Properties" option (clears filter)
   - Lists individual properties with nicknames
   - Shows property type and owner email (admin mode)
   - Displays checkmark for selected property

2. **Keyboard Navigation:**
   - Arrow keys to navigate options
   - Enter/Space to select
   - Escape to close
   - Tab to exit

3. **States:**
   - Loading state with spinner
   - Empty state when no properties
   - Disabled state
   - Focus states with Airbnb pink highlight

4. **Variants:**
   - `default`: Shows label and description (lines 161-171)
   - `compact`: No label/description, just button

5. **Admin Mode:**
   - Shows user email next to property name
   - Shows owner email in dropdown options

### Translation Keys Available in `properties.selector`

From en.json lines 3239-3248:

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

**Note:** "selectProperty" and "unassigned" keys are not currently used in PropertySelector but exist in the namespace for future use or other components.

---

## Technical Approach

### Migration Strategy

The migration will focus on replacing hardcoded strings and consolidating namespace usage:

1. **Replace translation hook** (line 47):
   - Replace `const tEmpty = useTranslations('common.emptyStates')` with `const t = useTranslations('properties.selector')`

2. **Update placeholder prop default** (line 45):
   - Challenge: Can't use translation hook outside component body
   - Solution: Use translation key for default displayed text, but keep prop as plain string for parent components that want custom text

3. **Update variant label and description** (lines 165, 168):
   - Replace hardcoded strings with translation keys

4. **Update ARIA label** (line 194):
   - Replace hardcoded ARIA label with translation key

5. **Update loading text** (lines 199, 309):
   - Replace both occurrences with translation key

6. **Update dropdown option text** (line 239):
   - Use translation key instead of placeholder prop for "All Properties" display

7. **Update empty state** (line 297):
   - Change from `tEmpty('properties.noPropertiesAvailable')` to `t('noPropertiesAvailable')`

### Translation Key Mapping

| Current | New | Notes |
|---------|-----|-------|
| Hardcoded "Property Filter" | `properties.selector.filterLabel` | Variant label |
| Hardcoded "Filter analytics..." | `properties.selector.filterDescription` | Variant description |
| Hardcoded "Select property..." | `properties.selector.filterAriaLabel` | Button ARIA label |
| Hardcoded "Loading properties..." | `properties.selector.loading` | Loading text (2 places) |
| Hardcoded "All Properties" | `properties.selector.allProperties` | Placeholder/option text |
| `common.emptyStates.properties.noPropertiesAvailable` | `properties.selector.noPropertiesAvailable` | Empty state |

---

## Implementation Tasks

### Task 1: Update translation hook in PropertySelector (Priority: High)

**Description:** Replace `common.emptyStates` namespace with `properties.selector` namespace.

**File:** `/src/components/PropertySelector.tsx`

**Changes Required:**

**Line 3** - Add @lastModified comment:
```typescript
// Last Modified: 2026-01-22 20:10 - REQ-E02-011: Updated for i18n with properties.selector namespace
```

**Line 47** - Replace:
```typescript
const tEmpty = useTranslations('common.emptyStates');
```

**With:**
```typescript
const t = useTranslations('properties.selector');
```

**Rationale:** Consolidate into single `properties.selector` namespace hook for all PropertySelector strings.

**Acceptance Criteria:**
- [ ] Translation hook uses `properties.selector` namespace
- [ ] TypeScript compilation succeeds

---

### Task 2: Update placeholder prop default value (Priority: Medium)

**Description:** Update the default placeholder value to use translated text in the component display.

**File:** `/src/components/PropertySelector.tsx`

**Current Implementation (line 45):**
```typescript
placeholder = 'All Properties'
```

**Challenge:** The `placeholder` prop is used as a string parameter, but we need translated text for display. We can't use translation hooks in parameter defaults.

**Solution:** Keep the prop as-is for API compatibility, but use translation key when displaying:

**Line 145-146** - Modify getSelectedPropertyDisplay():
```typescript
const getSelectedPropertyDisplay = () => {
  if (!selectedPropertyId) return t('allProperties'); // Instead of 'placeholder'
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  if (!selectedProperty) return t('allProperties'); // Instead of 'placeholder'
  // ... rest of function
```

**Line 199** - Update loading fallback:
```typescript
<span className="truncate text-left">
  {loading ? t('loading') : getSelectedPropertyDisplay()}
</span>
```

**Line 239** - Update dropdown "All Properties" option:
```typescript
<span>{t('allProperties')}</span>
```

**Alternative Approach:** Keep `placeholder` prop functional for parent components that want custom text:
```typescript
const getSelectedPropertyDisplay = () => {
  // Use placeholder if provided, otherwise use translation
  const defaultText = placeholder || t('allProperties');
  if (!selectedPropertyId) return defaultText;
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  if (!selectedProperty) return defaultText;
  // ... rest
```

**Recommendation:** Use alternative approach to maintain backward compatibility and allow parent components to override default text.

**Acceptance Criteria:**
- [ ] Default placeholder uses translation key
- [ ] Parent components can still override with custom text via prop
- [ ] "All Properties" displays correctly in button and dropdown
- [ ] TypeScript compilation succeeds

---

### Task 3: Update variant label and description (Priority: High)

**Description:** Replace hardcoded filter label and description in default variant.

**File:** `/src/components/PropertySelector.tsx`

**Changes Required:**

**Lines 165, 168** - Replace:
```typescript
<div className="mb-3">
  <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
    <Building className="w-4 h-4" />
    <span>Property Filter</span>
  </h3>
  <p className="text-xs text-gray-500 mt-1">
    Filter analytics data by property
  </p>
</div>
```

**With:**
```typescript
<div className="mb-3">
  <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
    <Building className="w-4 h-4" />
    <span>{t('filterLabel')}</span>
  </h3>
  <p className="text-xs text-gray-500 mt-1">
    {t('filterDescription')}
  </p>
</div>
```

**Expected Keys in `properties.selector`:**
- `filterLabel`: "Property Filter"
- `filterDescription`: "Filter analytics data by property"

**Acceptance Criteria:**
- [ ] Filter label displays from translation key
- [ ] Filter description displays from translation key
- [ ] Variant display conditional logic unchanged
- [ ] Styling unchanged

---

### Task 4: Update ARIA label for button (Priority: High)

**Description:** Replace hardcoded ARIA label with translation key.

**File:** `/src/components/PropertySelector.tsx`

**Changes Required:**

**Line 194** - Replace:
```typescript
aria-label="Select property for analytics filtering"
```

**With:**
```typescript
aria-label={t('filterAriaLabel')}
```

**Expected Key in `properties.selector`:**
- `filterAriaLabel`: "Select property for analytics filtering"

**Acceptance Criteria:**
- [ ] ARIA label uses translation key
- [ ] Screen readers announce correct label
- [ ] Accessibility testing passes

---

### Task 5: Update loading text (Priority: High)

**Description:** Replace hardcoded loading text with translation key in both locations.

**File:** `/src/components/PropertySelector.tsx`

**Changes Required:**

**Line 199** - Replace:
```typescript
{loading ? 'Loading properties...' : getSelectedPropertyDisplay()}
```

**With:**
```typescript
{loading ? t('loading') : getSelectedPropertyDisplay()}
```

**Line 309** - Replace:
```typescript
<span>Loading properties...</span>
```

**With:**
```typescript
<span>{t('loading')}</span>
```

**Expected Key in `properties.selector`:**
- `loading`: "Loading properties..."

**Acceptance Criteria:**
- [ ] Loading text displays from translation key in button
- [ ] Loading text displays from translation key in dropdown
- [ ] Loading spinner animation unchanged

---

### Task 6: Update empty state message (Priority: High)

**Description:** Update empty state to use new namespace path.

**File:** `/src/components/PropertySelector.tsx`

**Changes Required:**

**Line 297** - Replace:
```typescript
{tEmpty('properties.noPropertiesAvailable')}
```

**With:**
```typescript
{t('noPropertiesAvailable')}
```

**Expected Key in `properties.selector`:**
- `noPropertiesAvailable`: "No properties available"

**Acceptance Criteria:**
- [ ] Empty state message displays from translation key
- [ ] Message shows when properties array is empty
- [ ] Styling unchanged

---

### Task 7: Test PropertySelector functionality (Priority: High)

**Description:** Verify PropertySelector works correctly with new `properties.selector` namespace.

**Testing Steps:**

**Basic Display:**
1. Mount PropertySelector with properties
2. Verify filter label displays: "Property Filter"
3. Verify filter description displays: "Filter analytics data by property"
4. Verify button shows "All Properties" when no selection

**Property Selection:**
1. Click selector button
2. Verify dropdown opens
3. Verify "All Properties" option displays at top
4. Click "All Properties" option
5. Verify button updates to show "All Properties"
6. Select specific property
7. Verify button updates to show property nickname

**Loading State:**
1. Set loading prop to true
2. Verify button shows "Loading properties..."
3. Open dropdown while loading
4. Verify dropdown shows "Loading properties..." with spinner

**Empty State:**
1. Pass empty properties array
2. Open dropdown
3. Verify "No properties available" message displays

**Keyboard Navigation:**
1. Focus selector button
2. Press Enter/Space to open
3. Use arrow keys to navigate options
4. Press Enter to select focused option
5. Verify selection works via keyboard
6. Press Escape to close
7. Verify dropdown closes

**Variants:**
1. Test with variant="default" (shows label and description)
2. Test with variant="compact" (no label/description)
3. Verify both work correctly

**Admin Mode:**
1. Set isAdmin={true}
2. Verify user email displays in options
3. Verify email displays in selected property display

**Acceptance Criteria:**
- [ ] All text displays in English (en.json)
- [ ] Filter label and description correct
- [ ] ARIA label correct
- [ ] Loading text displays in both locations
- [ ] Empty state message correct
- [ ] "All Properties" option works
- [ ] Property selection works
- [ ] Keyboard navigation works
- [ ] No console errors for missing translation keys
- [ ] TypeScript compilation succeeds

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Component Updates

| File | Target | Type | Changes |
|------|--------|------|---------|
| `/src/components/PropertySelector.tsx` | Line 3 | Modify | Add @lastModified comment |
| `/src/components/PropertySelector.tsx` | Line 47 | Modify | Replace `common.emptyStates` with `properties.selector` namespace |
| `/src/components/PropertySelector.tsx` | Lines 145-146, 199, 239 | Modify | Update placeholder display logic to use translation |
| `/src/components/PropertySelector.tsx` | Lines 165, 168 | Modify | Replace hardcoded filter label and description |
| `/src/components/PropertySelector.tsx` | Line 194 | Modify | Replace hardcoded ARIA label |
| `/src/components/PropertySelector.tsx` | Lines 199, 309 | Modify | Replace hardcoded loading text |
| `/src/components/PropertySelector.tsx` | Line 297 | Modify | Update empty state message namespace |

### Investigation Only (No Modifications)

| File | Purpose | Notes |
|------|---------|-------|
| `/messages/en.json` | Verify translation keys exist | Lines 3239-3248 for `properties.selector` namespace |
| `/src/app/dashboard2/analytics/page.tsx` | Check PropertySelector usage | Verify component integration |

---

## Dependencies

### Depends On (Completed First)

| Request | Dependency Type | Status | What It Provides |
|---------|-----------------|--------|------------------|
| **Epic 1 Foundation** | Framework | Complete | next-intl setup, useTranslations hook |
| **REQ-E02-085** (Task 2F.1) | Translation Keys | Required | `properties.selector` namespace in all 6 language files |

### Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-090** (Task 2F.6) | PropertySelector strings ready for translation generation |

### Parallel Safety

- **Files touched**: 1 file (`PropertySelector.tsx`)
- **Conflicts with**: None - PropertySelector is isolated component
- **Safe to parallelize with**:
  - REQ-E02-008 (Task 2F.2 - PropertyForm) - different files
  - REQ-E02-009 (Task 2F.3 - Property modals) - different files
  - REQ-E02-010 (Task 2F.4 - Property pages) - different files

### External Dependencies

- `next-intl` package (from Epic 1)
- `lucide-react` icons (already installed)
- Translation files in `/messages/*.json` (6 languages)

---

## Risks and Considerations

### Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Placeholder prop behavior change | Medium | Maintain backward compatibility with conditional logic |
| Parent components using hardcoded placeholder | Low | Keep prop functional, use translation as default |
| Keyboard navigation breaks | High | Don't modify keyboard event handlers |
| ARIA labels incorrect | Medium | Test with screen readers after changes |
| Empty state not showing | Low | Verify namespace path correct |

### Testing Requirements

- **Visual Testing**:
  - Verify filter label and description display correctly
  - Test loading state displays "Loading properties..."
  - Verify "All Properties" displays correctly
  - Test empty state message
- **Functional Testing**:
  - Test property selection workflow
  - Test keyboard navigation (arrows, enter, escape)
  - Verify focus states
  - Test admin mode display
- **Accessibility Testing**:
  - Test with screen reader (ARIA labels)
  - Verify keyboard-only navigation
  - Test focus management
- **Integration Testing**:
  - Test on analytics page
  - Test on dashboard pages
  - Verify with different property counts (0, 1, many)
- **Browser Testing**: Test in actual application with live translation files
- **Language Testing**: Verify works with all 6 supported languages (en, fr, es, de, nl, it)

### Open Questions

- [ ] Should the `placeholder` prop be deprecated in favor of always using translation?
  - **Recommendation:** No - keep prop for flexibility, but use translation as default
  - **Rationale:** Some parent components might want custom text (e.g., "All Locations" instead of "All Properties")
- [ ] Are "selectProperty" and "unassigned" keys used anywhere?
  - **Investigation Required:** Search codebase for these keys
  - **Action:** Document usage or mark as reserved for future use
- [ ] Should PropertySelector support dynamic placeholder translation key?
  - **Example:** `placeholderKey` prop that accepts translation key instead of hardcoded string
  - **Recommendation:** Out of scope for this task - consider for future enhancement

---

## Out of Scope

- Adding new features to PropertySelector (e.g., multi-select, search)
- Modifying keyboard navigation logic
- Changing component styling or layout
- Adding new translation keys beyond what's defined in Task 2F.1
- Updating parent components that use PropertySelector
- Actual translations to other languages (handled by Task 2F.6)
- Deprecating or removing the `placeholder` prop
- Internationalizing property type display names (separate concern)
- Adding property icons or additional metadata to dropdown

---

## Verification Checklist

### Pre-Implementation
- [ ] REQ-E02-085 (Task 2F.1) completed - `properties.selector` namespace exists
- [ ] Reviewed PropertySelector current implementation
- [ ] Identified all hardcoded strings
- [ ] Verified translation keys exist in `properties.selector` namespace

### Implementation
- [ ] Translation hook updated to use `properties.selector` namespace
- [ ] @lastModified comment added
- [ ] Placeholder display logic updated to use translation
- [ ] Filter label and description migrated
- [ ] ARIA label migrated
- [ ] Loading text migrated (both locations)
- [ ] Empty state message namespace updated

### Post-Implementation
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] No console errors for missing translation keys
- [ ] Filter label displays correctly
- [ ] Filter description displays correctly
- [ ] ARIA label correct (test with screen reader)
- [ ] Loading text displays in button
- [ ] Loading text displays in dropdown
- [ ] Empty state message displays
- [ ] "All Properties" option works
- [ ] Property selection works
- [ ] Keyboard navigation works (arrows, enter, escape, tab)
- [ ] Focus management correct
- [ ] Admin mode displays correctly
- [ ] Both variants work (default, compact)
- [ ] Component works on analytics page
- [ ] Ready for translation generation (Task 2F.6)

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` (lines 1014-1096)
- **Namespace Definition:** `/docs/REQ-E02-085-create-properties-namespace-structure-overview.md`
- **PropertySelector Component:** `/src/components/PropertySelector.tsx`
- **Translation Files:** `/messages/en.json` (lines 3239-3248 for `properties.selector`)
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages
- **Accessibility Guidelines:** https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

---

*Document generated: 2026-01-22 20:10*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
