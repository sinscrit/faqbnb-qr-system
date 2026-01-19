# REQ-367: Update All SimpleDashboard Components for Internationalization

**Document Type**: Technical Implementation Breakdown (Tech Lead Overview)
**Created**: 2026-01-19
**Last Modified**: 2026-01-19 18:30 UTC
**Request Reference**: docs/gen_requests_epic2.md - Request #367
**Implementation Plan Reference**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic**: 2B - Dashboard & Navigation
**Task ID**: 2B.4
**Size**: L (Large)
**Priority**: P1 - High

---

## Summary

Update all SimpleDashboard components to use next-intl's translation system, replacing hardcoded English strings with translated content. This task encompasses 15+ component files that form the core dashboard experience. All visible text including labels, buttons, headings, tooltips, placeholders, error messages, and accessibility attributes must be internationalized.

---

## Dependencies

### Prerequisites (Must be completed first)
- **Epic 1 Foundation** - next-intl installed and configured
- **Task 2B.1** - `dashboard` namespace structure created in `/messages/en.json`
- **Task 2H** (Sub-Epic 2H) - Common namespace for shared strings (actions, status, validation)

### Related Tasks
- **Task 2B.2** - Update `/src/app/dashboard2/page.tsx` (dashboard page uses SimpleDashboard components)
- **Task 2B.3** - Update `/src/app/dashboard2/layout.tsx`

---

## Technical Context

### Existing Stack
- **Framework**: Next.js 15.5.9 with App Router
- **Language**: TypeScript 5.x (strict mode)
- **i18n Framework**: next-intl (installed in Epic 1)
- **UI Library**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS 4.x

### Translation Hook Pattern
All SimpleDashboard components are client components (`'use client'`) and should use `useTranslations` from next-intl:

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('dashboard');
  // or for common strings:
  const tCommon = useTranslations('common');

  return <button>{t('actions.newItem')}</button>;
}
```

---

## String Inventory

### Estimated String Counts by Component

| Component | File | Est. Strings | Categories |
|-----------|------|--------------|------------|
| StatisticsCards | `StatisticsCards.tsx` | ~20 | Labels, empty state, property context |
| PropertySection | `PropertySection.tsx` | ~25 | Headings, counts, empty state, buttons |
| ActionButtons | `ActionButtons.tsx` | ~10 | Button labels, aria-labels |
| EmptyStateCard | `EmptyStateCard.tsx` | ~5 | Title, description (dynamic via props) |
| PropertyEditModal | `PropertyEditModal.tsx` | ~50 | Form labels, placeholders, validation, buttons |
| AddPropertyModal | `AddPropertyModal.tsx` | ~50 | Form labels, placeholders, validation, buttons |
| LoadingIndicator | `LoadingIndicator.tsx` | ~3 | Loading label (default prop) |
| PortfolioSummary | `PortfolioSummary.tsx` | ~12 | Labels, counts, insights text |
| DashboardSettingsPopover | `DashboardSettingsPopover.tsx` | ~10 | Settings labels, descriptions |
| AdvancedDashboardTools | `AdvancedDashboardTools.tsx` | ~5 | Section heading |
| BulkOperationsToolbar | `BulkOperationsToolbar.tsx` | ~10 | Button labels, selection status |
| PropertyGroupingControl | `PropertyGroupingControl.tsx` | ~6 | Dropdown label, options |
| PropertySearchBar | `PropertySearchBar.tsx` | ~4 | Placeholder, aria-labels |
| ProgressivePropertySection | `ProgressivePropertySection.tsx` | ~5 | Loading states |
| ProgressiveStatisticsSection | `ProgressiveStatisticsSection.tsx` | ~5 | Loading states |
| Skeleton components | `skeletons/*.tsx` | ~5 | Accessibility labels |

**Total Estimated**: ~225 strings

---

## Translation Keys Structure

### Namespace: `dashboard`

```json
{
  "dashboard": {
    "stats": {
      "items": "Items",
      "rooms": "Rooms",
      "tags": "Tags",
      "loading": "Loading statistics",
      "allProperties": "(all properties)",
      "viewLabel": "View {label}: {value}"
    },
    "property": {
      "heading": "My Properties",
      "headingSingular": "My Property",
      "emptyTitle": "Let's add your property",
      "emptyDescription": "A property is where your items live - like a vacation rental or home.",
      "addProperty": "Add Property",
      "addNewProperty": "Add New Property",
      "editProperty": "Edit property: {name}",
      "itemCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "roomCount": "{count, plural, =0 {No rooms} one {# room} other {# rooms}}",
      "loading": "Loading properties"
    },
    "empty": {
      "title": "Start adding new QR Code items and create guides/instructions",
      "action": "New QR Code Item"
    },
    "actions": {
      "newQRCodeItem": "New QR Code Item",
      "viewQRCodeItems": "View QR Code Items",
      "printQRCode": "Print QR Code",
      "createNewItem": "Create a new QR code item",
      "viewAllItems": "View all your items",
      "printCodes": "Print QR codes for your items"
    },
    "settings": {
      "title": "Dashboard Settings",
      "showAdvancedTools": "Show Advanced Tools",
      "advancedToolsDescription": "Always show grouping and bulk operations",
      "showPortfolioSummary": "Show Portfolio Summary",
      "portfolioDescription": "Always show portfolio overview card",
      "overrideHint": "These settings override automatic UI adaptation based on your property count.",
      "close": "Close settings"
    },
    "advanced": {
      "title": "Advanced Tools"
    },
    "bulk": {
      "selectAll": "Select all",
      "allSelected": "All selected",
      "selected": "{count} selected",
      "clearSelection": "Clear selection",
      "printSelected": "Print Selected",
      "printSelectedAria": "Print {count} selected properties",
      "selectAllAria": "Select all properties",
      "deselectAllAria": "Deselect all properties"
    },
    "grouping": {
      "label": "Group by",
      "none": "No Grouping",
      "location": "By Location",
      "itemCount": "By Item Count"
    },
    "search": {
      "placeholder": "Search properties...",
      "clearSearch": "Clear search",
      "searchAria": "Search properties"
    },
    "portfolio": {
      "title": "Portfolio Overview",
      "totalProperties": "Total Properties",
      "totalItems": "Total Items",
      "avgItemsPerProperty": "Avg Items/Property",
      "insightText": "You have {rooms} {rooms, plural, one {room} other {rooms}} across {properties} {properties, plural, one {property} other {properties}}",
      "loading": "Loading portfolio summary"
    }
  }
}
```

### Namespace: `properties` (for modals)

```json
{
  "properties": {
    "modal": {
      "editTitle": "Edit Property",
      "editDescription": "Edit the details of your property including name and address information.",
      "addTitle": "Add New Property",
      "addDescription": "Create a new property by entering the name and address information.",
      "closeModal": "Close modal",
      "saving": "Saving...",
      "creating": "Creating...",
      "savingProperty": "Saving property",
      "creatingProperty": "Creating property",
      "saveChanges": "Save Changes",
      "createProperty": "Create Property"
    },
    "form": {
      "propertyName": "Property Name",
      "propertyNamePlaceholder": "e.g., Beach House",
      "propertyNameRequired": "Property name is required",
      "propertyNameMaxLength": "Property name must be 100 characters or less",
      "addressLine1": "Address Line 1",
      "addressLine1Placeholder": "Street address",
      "addressLine1MaxLength": "Address must be 200 characters or less",
      "addressLine2": "Address Line 2",
      "addressLine2Placeholder": "Apt, suite, unit, etc. (optional)",
      "city": "City",
      "cityPlaceholder": "City",
      "cityMaxLength": "City must be 100 characters or less",
      "state": "State/Province",
      "statePlaceholder": "State or Province",
      "stateMaxLength": "State/Province must be 100 characters or less",
      "postalCode": "Postal Code",
      "postalCodePlaceholder": "ZIP / Postal code",
      "postalCodeMaxLength": "Postal code must be 20 characters or less",
      "country": "Country",
      "selectCountry": "Select country...",
      "invalidCountry": "Please select a valid country"
    },
    "errors": {
      "updateFailed": "Failed to update property",
      "createFailed": "Failed to create property"
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Primary Component Files

| # | File Path | Functions/Exports to Modify | Modification Type |
|---|-----------|---------------------------|-------------------|
| 1 | `/src/components/SimpleDashboard/StatisticsCards.tsx` | `StatisticsCards`, `StatCard`, `LoadingSkeleton` | Add useTranslations, replace strings |
| 2 | `/src/components/SimpleDashboard/PropertySection.tsx` | `PropertySection`, `PropertyRow`, `SinglePropertyCard`, `PropertyEmptyState`, `LoadingSkeleton` | Add useTranslations, replace strings, update pluralization |
| 3 | `/src/components/SimpleDashboard/ActionButtons.tsx` | `ActionButtons`, `ActionButton`, `buttonConfigs` array | Add useTranslations, translate labels/aria-labels |
| 4 | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | `EmptyStateCard` (props remain strings, caller passes translated) | Update aria-label composition |
| 5 | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | `PropertyEditModal`, `validateForm`, `COUNTRIES`, `renderTextField` | Add useTranslations, translate all form/modal strings |
| 6 | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | `AddPropertyModal`, `validateForm`, `COUNTRIES`, `renderTextField` | Add useTranslations, translate all form/modal strings |
| 7 | `/src/components/SimpleDashboard/LoadingIndicator.tsx` | `LoadingIndicator` (default label prop) | Update default prop value reference |
| 8 | `/src/components/SimpleDashboard/PortfolioSummary.tsx` | `PortfolioSummary`, `SummaryStat`, `LoadingSkeleton` | Add useTranslations, replace all strings |
| 9 | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | `DashboardSettingsPopover`, `ToggleSwitch` | Add useTranslations, replace all strings |
| 10 | `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` | `AdvancedDashboardTools` | Add useTranslations, replace heading |
| 11 | `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx` | `BulkOperationsToolbar` | Add useTranslations, replace strings/aria-labels |
| 12 | `/src/components/SimpleDashboard/PropertyGroupingControl.tsx` | `PropertyGroupingControl`, `GROUPING_OPTIONS` array | Add useTranslations, translate options |
| 13 | `/src/components/SimpleDashboard/PropertySearchBar.tsx` | `PropertySearchBar` | Add useTranslations, translate placeholder/aria |
| 14 | `/src/components/SimpleDashboard/ProgressivePropertySection.tsx` | `ProgressivePropertySection` | Add useTranslations for loading states |
| 15 | `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx` | `ProgressiveStatisticsSection` | Add useTranslations for loading states |

### Skeleton Components

| # | File Path | Functions to Modify | Modification Type |
|---|-----------|-------------------|-------------------|
| 16 | `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | `SkeletonBase` | Verify label prop usage |
| 17 | `/src/components/SimpleDashboard/skeletons/SkeletonText.tsx` | (if contains text) | Update as needed |
| 18 | `/src/components/SimpleDashboard/skeletons/SkeletonCard.tsx` | (if contains text) | Update as needed |

### Translation Files

| # | File Path | Keys to Add | Notes |
|---|-----------|------------|-------|
| 19 | `/messages/en.json` | `dashboard.*` namespace expansion | Add all keys from structure above |
| 20 | `/messages/fr.json` | `dashboard.*` | Generate translations |
| 21 | `/messages/es.json` | `dashboard.*` | Generate translations |
| 22 | `/messages/de.json` | `dashboard.*` | Generate translations |
| 23 | `/messages/nl.json` | `dashboard.*` | Generate translations |
| 24 | `/messages/it.json` | `dashboard.*` | Generate translations |

---

## Implementation Tasks

### Task 1: Add Translation Keys to Message Files (Priority: First)
**Estimated Effort**: 1 story point

1. Add `dashboard.stats.*` keys to `/messages/en.json`
2. Add `dashboard.property.*` keys including pluralization patterns
3. Add `dashboard.empty.*` keys
4. Add `dashboard.actions.*` keys with aria-label variants
5. Add `dashboard.settings.*` keys
6. Add `dashboard.advanced.*` keys
7. Add `dashboard.bulk.*` keys with dynamic placeholders
8. Add `dashboard.grouping.*` keys
9. Add `dashboard.search.*` keys
10. Add `dashboard.portfolio.*` keys with pluralization
11. Add `properties.modal.*` keys for modal components
12. Add `properties.form.*` keys for form fields
13. Add `properties.errors.*` keys for error messages

### Task 2: Update StatisticsCards Component
**Estimated Effort**: 1 story point
**File**: `/src/components/SimpleDashboard/StatisticsCards.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.stats')`
3. Update `cardConfigs` array to use translation keys for `label`
4. Update `StatCard` aria-label to use `t('viewLabel', { label, value })`
5. Update `LoadingSkeleton` SkeletonBase label prop
6. Update empty state EmptyStateCard title/action to use translated strings
7. Update property context display text `(all properties)` and property name display

### Task 3: Update PropertySection Component
**Estimated Effort**: 2 story points
**File**: `/src/components/SimpleDashboard/PropertySection.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.property')`
3. Update `headingText` to use `t('heading')` / `t('headingSingular')`
4. Update `PropertyRow` aria-label with translation
5. Update `PropertyRow` item/room counts with ICU pluralization
6. Update `SinglePropertyCard` aria-label and counts
7. Update `PropertyEmptyState` title/description/actionLabel
8. Update `LoadingSkeleton` SkeletonBase label
9. Update "Add New Property" button text

### Task 4: Update ActionButtons Component
**Estimated Effort**: 1 story point
**File**: `/src/components/SimpleDashboard/ActionButtons.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.actions')`
3. Update `buttonConfigs` array - translate `label` and `ariaLabel` properties
4. Move string definitions inside component to access `t()`

### Task 5: Update EmptyStateCard Component
**Estimated Effort**: 0.5 story points
**File**: `/src/components/SimpleDashboard/EmptyStateCard.tsx`

1. Note: This component receives translated strings via props
2. Update aria-label composition if needed
3. Ensure no hardcoded strings in component itself

### Task 6: Update PropertyEditModal Component
**Estimated Effort**: 2 story points
**File**: `/src/components/SimpleDashboard/PropertyEditModal.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('properties')`
3. Translate modal title "Edit Property"
4. Translate all form field labels in `renderTextField` helper
5. Translate all placeholder texts
6. Translate validation error messages in `validateForm` function
7. Translate country dropdown - note: country names should use `Intl.DisplayNames` or remain in original language
8. Translate buttons: "Cancel", "Save Changes", "Saving..."
9. Translate screen reader announcements
10. Translate general error message handling

### Task 7: Update AddPropertyModal Component
**Estimated Effort**: 2 story points
**File**: `/src/components/SimpleDashboard/AddPropertyModal.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('properties')`
3. Translate modal title "Add New Property"
4. Translate all form field labels
5. Translate all placeholder texts
6. Translate validation error messages
7. Translate buttons: "Cancel", "Create Property", "Creating..."
8. Translate screen reader announcements

### Task 8: Update LoadingIndicator Component
**Estimated Effort**: 0.5 story points
**File**: `/src/components/SimpleDashboard/LoadingIndicator.tsx`

1. Note: Default label prop is "Loading"
2. Consider making default use common translation key
3. Alternative: Leave as-is, callers pass translated label

### Task 9: Update PortfolioSummary Component
**Estimated Effort**: 1 story point
**File**: `/src/components/SimpleDashboard/PortfolioSummary.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.portfolio')`
3. Translate "Portfolio Overview" heading
4. Translate stat labels: "Total Properties", "Total Items", "Avg Items/Property"
5. Translate insight text with pluralization
6. Update `LoadingSkeleton` label

### Task 10: Update DashboardSettingsPopover Component
**Estimated Effort**: 1 story point
**File**: `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.settings')`
3. Translate "Dashboard Settings" heading
4. Translate toggle labels and descriptions
5. Translate footer hint text
6. Translate aria-labels

### Task 11: Update AdvancedDashboardTools Component
**Estimated Effort**: 0.5 story points
**File**: `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.advanced')`
3. Translate "Advanced Tools" heading

### Task 12: Update BulkOperationsToolbar Component
**Estimated Effort**: 1 story point
**File**: `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.bulk')`
3. Translate checkbox labels: "Select all", "All selected"
4. Translate selection count display with dynamic count
5. Translate "Print Selected" button
6. Translate all aria-labels with dynamic values

### Task 13: Update PropertyGroupingControl Component
**Estimated Effort**: 0.5 story points
**File**: `/src/components/SimpleDashboard/PropertyGroupingControl.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.grouping')`
3. Translate "Group by" label
4. Translate `GROUPING_OPTIONS` labels - move inside component

### Task 14: Update PropertySearchBar Component
**Estimated Effort**: 0.5 story points
**File**: `/src/components/SimpleDashboard/PropertySearchBar.tsx`

1. Import `useTranslations` from `next-intl`
2. Initialize `const t = useTranslations('dashboard.search')`
3. Translate default placeholder prop
4. Translate aria-labels

### Task 15: Update Progressive Components
**Estimated Effort**: 0.5 story points
**Files**: `ProgressivePropertySection.tsx`, `ProgressiveStatisticsSection.tsx`

1. Import `useTranslations` from `next-intl`
2. Update any hardcoded loading/status text

### Task 16: Generate Translations for Non-English Languages
**Estimated Effort**: 1 story point

1. Generate French translations for all new keys
2. Generate Spanish translations for all new keys
3. Generate German translations for all new keys
4. Generate Dutch translations for all new keys
5. Generate Italian translations for all new keys
6. Verify pluralization patterns work across all languages

### Task 17: Testing and Verification
**Estimated Effort**: 1 story point

1. Verify TypeScript compilation succeeds
2. Test dashboard in all 6 languages
3. Verify no layout breaks with longer translated text
4. Verify pluralization works correctly
5. Verify dynamic values interpolate correctly
6. Verify accessibility: screen reader announcements correct
7. Test language switching while on dashboard

---

## Implementation Patterns

### Pattern 1: Static Labels
```tsx
// Before
<span>Items</span>

// After
const t = useTranslations('dashboard.stats');
<span>{t('items')}</span>
```

### Pattern 2: Dynamic Values
```tsx
// Before
<span>{count} selected</span>

// After
<span>{t('selected', { count })}</span>

// messages/en.json
{ "selected": "{count} selected" }
```

### Pattern 3: Pluralization (ICU Format)
```tsx
// Before
{itemCount} {itemCount === 1 ? 'item' : 'items'}

// After
{t('itemCount', { count: itemCount })}

// messages/en.json
{ "itemCount": "{count, plural, =0 {No items} one {# item} other {# items}}" }
```

### Pattern 4: Aria Labels with Context
```tsx
// Before
aria-label={`View ${config.label}: ${value}`}

// After
aria-label={t('viewLabel', { label: t(config.labelKey), value })}
```

### Pattern 5: Constant Arrays (Move Inside Component)
```tsx
// Before
const GROUPING_OPTIONS = [
  { value: 'none', label: 'No Grouping' },
  // ...
];

function Component() { ... }

// After
function Component() {
  const t = useTranslations('dashboard.grouping');

  const GROUPING_OPTIONS = [
    { value: 'none', label: t('none') },
    { value: 'location', label: t('location') },
    { value: 'itemCount', label: t('itemCount') },
  ];

  // ...
}
```

---

## Edge Cases and Considerations

### 1. Country Names in Modals
Country names in `PropertyEditModal` and `AddPropertyModal` should either:
- Use `Intl.DisplayNames` API to get localized country names
- Remain in their native/English form as they are proper nouns
- Use a dedicated country name translation file

**Recommendation**: Use `Intl.DisplayNames` for proper locale-aware country names.

### 2. Number Formatting
Statistics and counts should use `Intl.NumberFormat` for locale-appropriate formatting (e.g., thousands separators).

### 3. EmptyStateCard Props
The `EmptyStateCard` component accepts `title`, `description`, and `actionLabel` as string props. Callers (parent components) should pass already-translated strings.

### 4. Default Props
Components like `LoadingIndicator` and `PropertySearchBar` have default string props. These should either:
- Use a common translation key as default
- Document that callers should pass translated values
- Keep English default with documentation note

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys at runtime | Medium | Low | Use TypeScript for key completion, add runtime fallback |
| Layout breaks with long German text | Medium | Medium | Test all languages, use flexible layouts |
| Pluralization errors | Low | Medium | Test with 0, 1, and multiple counts |
| Breaking changes to component props | Low | High | Keep prop interfaces stable, translations internal |

---

## Acceptance Criteria

- [ ] All 15+ SimpleDashboard component files import and use `useTranslations`
- [ ] All user-facing text strings replaced with translation function calls
- [ ] All aria-labels and accessibility text internationalized
- [ ] Pluralization uses ICU format for counts (items, rooms, properties, selected)
- [ ] Dynamic values use interpolation syntax
- [ ] All 6 language files contain complete SimpleDashboard keys
- [ ] TypeScript compilation succeeds with no errors
- [ ] Components render correctly in all supported languages
- [ ] No console warnings for missing translation keys
- [ ] Language switching updates all text immediately
- [ ] Form validation messages display in user's language
- [ ] Modal titles and content fully translated
- [ ] Screen readers announce elements correctly in all languages

---

## References

- [Epic 2 Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2B (Dashboard & Navigation) - Task 2B.4*
