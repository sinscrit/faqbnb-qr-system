# REQ-E02-052: Update All SimpleDashboard Components for Internationalization

**Document Type:** Implementation Breakdown
**Created:** 2026-01-20 20:30 UTC
**Last Modified:** 2026-01-20 20:30 UTC
**Request ID:** REQ-E02-052
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.4
**Size:** L (Large)
**Priority:** High

---

## Overview

This document provides the implementation breakdown for updating all SimpleDashboard components to use internationalized strings from the `dashboard` translation namespace. The SimpleDashboard folder contains 16 component files that collectively provide the simplified dashboard interface, including statistics cards, property management, empty states, modals, search, and advanced tools.

### Components Inventory

The SimpleDashboard folder contains 16 components requiring i18n updates:

| Component | File | Estimated Strings | Complexity |
|-----------|------|-------------------|------------|
| StatisticsCards | `StatisticsCards.tsx` | ~20 | Medium |
| EmptyStateCard | `EmptyStateCard.tsx` | ~5 | Low |
| PropertySection | `PropertySection.tsx` | ~25 | Medium |
| ActionButtons | `ActionButtons.tsx` | ~15 | Low |
| PropertyEditModal | `PropertyEditModal.tsx` | ~45 | High |
| AddPropertyModal | `AddPropertyModal.tsx` | ~45 | High |
| LoadingIndicator | `LoadingIndicator.tsx` | ~3 | Low |
| PortfolioSummary | `PortfolioSummary.tsx` | ~15 | Medium |
| PropertySearchBar | `PropertySearchBar.tsx` | ~5 | Low |
| PropertyGroupingControl | `PropertyGroupingControl.tsx` | ~8 | Low |
| BulkOperationsToolbar | `BulkOperationsToolbar.tsx` | ~12 | Low |
| AdvancedDashboardTools | `AdvancedDashboardTools.tsx` | ~5 | Low |
| DashboardSettingsPopover | `DashboardSettingsPopover.tsx` | ~15 | Medium |
| ProgressivePropertySection | `ProgressivePropertySection.tsx` | ~5 | Low |
| ProgressiveStatisticsSection | `ProgressiveStatisticsSection.tsx` | ~3 | Low |
| SkeletonBase | `skeletons/SkeletonBase.tsx` | ~3 | Low |

**Total Estimated Strings:** ~225 strings

---

## Dependencies

### Epic 1 Foundation (Required)
- next-intl package installed and configured
- `useTranslations` hook available from `next-intl`
- IntlProvider wrapper in root layout
- `/messages/en.json` with `dashboard` namespace structure

### Existing Translation Infrastructure
The `/messages/en.json` file already has a basic `dashboard` namespace that will need to be expanded significantly.

---

## Current State Analysis

### Hardcoded Strings Identified

**StatisticsCards.tsx:**
- `"Items"`, `"Rooms"`, `"Tags"` - card labels (line 177-197)
- `"(all properties)"` - property context label (line 245)
- `"Start adding new QR Code items and create guides/instructions"` - empty state title (line 218)
- `"New QR Code Item"` - empty state CTA (line 220)
- `"Loading statistics"` - skeleton aria label (line 120)
- `"View {label}: {value}"` - aria label pattern (line 91)

**EmptyStateCard.tsx:**
- Dynamic strings passed via props (title, description, actionLabel)
- Component itself is a presentation wrapper
- May need t() function passed as props or wrapper pattern

**PropertySection.tsx:**
- `"My Property"` / `"My Properties"` - dynamic heading (line 256)
- `"{count} item"` / `"{count} items"` - pluralization (line 67, 192)
- `"{count} room"` / `"{count} rooms"` - pluralization (line 71, 196)
- `"Let's add your property"` - empty state title (line 129)
- `"A property is where your items live..."` - empty state description (line 130)
- `"Add Property"` - button label (line 131)
- `"Add New Property"` - button label (line 342)
- `"Edit property: {name}"` - aria label (line 54, 175)
- `"Loading properties"` - skeleton label (line 89)
- `"Your properties"` - list aria label (line 316)
- `"Add a new property"` - button aria label (line 339)

**ActionButtons.tsx:**
- `"New QR Code Item"` - button label (line 159)
- `"View QR Code Items"` - button label (line 167)
- `"Print QR Code"` - button label (line 175)
- `"Create a new QR code item"` - aria label (line 163)
- `"View all your items"` - aria label (line 171)
- `"Print QR codes for your items"` - aria label (line 179)

**PropertyEditModal.tsx:**
- `"Edit Property"` - modal title (line 396)
- `"Edit the details of your property..."` - screen reader description (line 399)
- `"Property Name"`, `"Address Line 1"`, `"Address Line 2"`, `"City"`, `"State/Province"`, `"Postal Code"`, `"Country"` - field labels
- `"e.g., Beach House"`, `"Street address"`, `"Apt, suite, unit..."`, `"City"`, `"State or Province"`, `"ZIP / Postal code"` - placeholders
- `"Property name is required"`, `"Property name must be 100 characters or less"` - validation errors
- `"Failed to update property"` - API error message
- `"Cancel"`, `"Save Changes"`, `"Saving..."` - button labels
- `"Close modal"` - aria label
- `"Saving property changes..."` - screen reader announcement
- `"Select country..."` - country dropdown default
- Country names in COUNTRIES array (25 countries)

**AddPropertyModal.tsx:**
- `"Add New Property"` - modal title (line 372)
- `"Create a new property..."` - screen reader description (line 374)
- Same field labels and placeholders as PropertyEditModal
- `"Creating property..."` - screen reader announcement
- `"Create Property"`, `"Creating..."` - button labels
- Same validation error messages

**LoadingIndicator.tsx:**
- `"Loading"` - default aria label (line 63)

**PortfolioSummary.tsx:**
- `"Portfolio Overview"` - header (line 122)
- `"Total Properties"`, `"Total Items"`, `"Avg Items/Property"` - stat labels (lines 128-140)
- `"You have {rooms} room(s) across {count} propert(ies)"` - insight text (line 148)
- `"Loading portfolio summary"` - skeleton label (line 32)
- `"Portfolio summary"` - region aria label (line 115)

**PropertySearchBar.tsx:**
- `"Search properties..."` - default placeholder (line 62)
- `"Search properties"` - aria label (line 114)
- `"Clear search"` - button aria label (line 123)

**PropertyGroupingControl.tsx:**
- `"Group by"` - label (line 69)
- `"No Grouping"`, `"By Location"`, `"By Item Count"` - options (lines 33-35)
- `"Property grouping option"` - aria label (line 79)

**BulkOperationsToolbar.tsx:**
- `"Select all"` / `"All selected"` - checkbox label (lines 85-86)
- `"Deselect all properties"` / `"Select all properties"` - aria labels (line 78)
- `"{count} selected"` - selection count (line 94)
- `"Clear selection"` - button aria label (line 100)
- `"Print Selected"` - button label (line 119)
- `"Print {count} selected properties"` - button aria label (line 117)
- `"Bulk operations"` - toolbar aria label (line 71)

**AdvancedDashboardTools.tsx:**
- `"Advanced Tools"` - section heading (lines 96, 114)

**DashboardSettingsPopover.tsx:**
- `"Dashboard settings"` - button aria label (line 149)
- `"Dashboard Settings"` - popover title (line 166)
- `"Close settings"` - button aria label (line 173)
- `"Show Advanced Tools"` - toggle label (line 185)
- `"Always show grouping and bulk operations"` - toggle description (line 186)
- `"Show Portfolio Summary"` - toggle label (line 192)
- `"Always show portfolio overview card"` - toggle description (line 193)
- `"These settings override automatic UI adaptation..."` - footer hint (lines 199-200)

**ProgressivePropertySection.tsx:**
- `"Search properties..."` - search placeholder (line 81)
- `"No properties found"` - search results (line 88)
- `"{count} property/properties found"` - search results (lines 89-90)

**ProgressiveStatisticsSection.tsx:**
- `"Use the property selector to compare statistics..."` - hint text (line 80)

**SkeletonBase.tsx:**
- `"Loading content"` - default label (line 31)
- `"{label}, please wait..."` - screen reader text (line 45)

---

## Implementation Plan

### Task 1: Expand dashboard namespace in en.json

Add all SimpleDashboard-specific translation keys to the `dashboard` namespace in `/messages/en.json`.

**New keys to add:**
```json
{
  "dashboard": {
    "stats": {
      "items": "Items",
      "rooms": "Rooms",
      "tags": "Tags",
      "allProperties": "(all properties)",
      "loadingStats": "Loading statistics",
      "viewLabel": "View {label}: {value}"
    },
    "empty": {
      "title": "Start adding new QR Code items and create guides/instructions",
      "action": "New QR Code Item",
      "propertyTitle": "Let's add your property",
      "propertyDescription": "A property is where your items live - like a vacation rental or home.",
      "addProperty": "Add Property"
    },
    "property": {
      "singular": "My Property",
      "plural": "My Properties",
      "itemCount": "{count, plural, =0 {0 items} one {# item} other {# items}}",
      "roomCount": "{count, plural, =0 {0 rooms} one {# room} other {# rooms}}",
      "addNew": "Add New Property",
      "editAriaLabel": "Edit property: {name}",
      "addAriaLabel": "Add a new property",
      "loadingProperties": "Loading properties",
      "listAriaLabel": "Your properties"
    },
    "actions": {
      "newQrCodeItem": "New QR Code Item",
      "viewQrCodeItems": "View QR Code Items",
      "printQrCode": "Print QR Code",
      "createItemAriaLabel": "Create a new QR code item",
      "viewItemsAriaLabel": "View all your items",
      "printAriaLabel": "Print QR codes for your items"
    },
    "modal": {
      "editProperty": "Edit Property",
      "editPropertyDescription": "Edit the details of your property including name and address information.",
      "addProperty": "Add New Property",
      "addPropertyDescription": "Create a new property by entering the name and address information.",
      "closeModal": "Close modal",
      "savingProperty": "Saving property changes...",
      "creatingProperty": "Creating property..."
    },
    "form": {
      "propertyName": "Property Name",
      "propertyNamePlaceholder": "e.g., Beach House",
      "addressLine1": "Address Line 1",
      "addressLine1Placeholder": "Street address",
      "addressLine2": "Address Line 2",
      "addressLine2Placeholder": "Apt, suite, unit, etc. (optional)",
      "city": "City",
      "cityPlaceholder": "City",
      "stateProvince": "State/Province",
      "stateProvincePlaceholder": "State or Province",
      "postalCode": "Postal Code",
      "postalCodePlaceholder": "ZIP / Postal code",
      "country": "Country",
      "selectCountry": "Select country..."
    },
    "validation": {
      "propertyNameRequired": "Property name is required",
      "propertyNameMaxLength": "Property name must be 100 characters or less",
      "addressMaxLength": "Address must be 200 characters or less",
      "cityMaxLength": "City must be 100 characters or less",
      "stateMaxLength": "State/Province must be 100 characters or less",
      "postalCodeMaxLength": "Postal code must be 20 characters or less",
      "invalidCountry": "Please select a valid country"
    },
    "buttons": {
      "cancel": "Cancel",
      "saveChanges": "Save Changes",
      "saving": "Saving...",
      "createProperty": "Create Property",
      "creating": "Creating..."
    },
    "errors": {
      "updateFailed": "Failed to update property",
      "createFailed": "Failed to create property"
    },
    "portfolio": {
      "title": "Portfolio Overview",
      "totalProperties": "Total Properties",
      "totalItems": "Total Items",
      "avgItemsPerProperty": "Avg Items/Property",
      "insight": "You have {roomCount, plural, one {# room} other {# rooms}} across {propertyCount, plural, one {# property} other {# properties}}",
      "loadingSummary": "Loading portfolio summary",
      "ariaLabel": "Portfolio summary"
    },
    "search": {
      "placeholder": "Search properties...",
      "ariaLabel": "Search properties",
      "clearAriaLabel": "Clear search",
      "noResults": "No properties found",
      "resultCount": "{count, plural, one {# property} other {# properties}} found"
    },
    "grouping": {
      "label": "Group by",
      "noGrouping": "No Grouping",
      "byLocation": "By Location",
      "byItemCount": "By Item Count",
      "ariaLabel": "Property grouping option"
    },
    "bulk": {
      "selectAll": "Select all",
      "allSelected": "All selected",
      "selectAllAriaLabel": "Select all properties",
      "deselectAllAriaLabel": "Deselect all properties",
      "selectedCount": "{count} selected",
      "clearSelectionAriaLabel": "Clear selection",
      "printSelected": "Print Selected",
      "printAriaLabel": "Print {count} selected properties",
      "toolbarAriaLabel": "Bulk operations"
    },
    "advancedTools": {
      "title": "Advanced Tools"
    },
    "settings": {
      "title": "Dashboard Settings",
      "buttonAriaLabel": "Dashboard settings",
      "closeAriaLabel": "Close settings",
      "showAdvancedTools": "Show Advanced Tools",
      "showAdvancedToolsDescription": "Always show grouping and bulk operations",
      "showPortfolioSummary": "Show Portfolio Summary",
      "showPortfolioSummaryDescription": "Always show portfolio overview card",
      "overrideHint": "These settings override automatic UI adaptation based on your property count."
    },
    "loading": {
      "default": "Loading",
      "content": "Loading content",
      "pleaseWait": "{label}, please wait..."
    },
    "hints": {
      "compareStats": "Use the property selector to compare statistics across your properties."
    }
  }
}
```

### Task 2: Update StatisticsCards component

**File:** `src/components/SimpleDashboard/StatisticsCards.tsx`

**Modifications:**
1. Add `import { useTranslations } from 'next-intl';`
2. Add `const t = useTranslations('dashboard');` in component body
3. Replace hardcoded labels in `cardConfigs` with `t('stats.items')`, `t('stats.rooms')`, `t('stats.tags')`
4. Replace `"(all properties)"` with `t('stats.allProperties')`
5. Replace empty state strings with translation keys
6. Update LoadingSkeleton to use `t('stats.loadingStats')`
7. Update aria-label with interpolation

### Task 3: Update PropertySection component

**File:** `src/components/SimpleDashboard/PropertySection.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update dynamic heading to use `t('property.singular')` / `t('property.plural')`
3. Update item/room counts to use ICU pluralization format
4. Update PropertyEmptyState to use translation keys
5. Update button labels and aria-labels
6. Update LoadingSkeleton label

### Task 4: Update ActionButtons component

**File:** `src/components/SimpleDashboard/ActionButtons.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update all button labels in `buttonConfigs`
3. Update all aria-labels

### Task 5: Update PropertyEditModal component

**File:** `src/components/SimpleDashboard/PropertyEditModal.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update modal title and description
3. Update all field labels and placeholders
4. Update validation error messages
5. Update button labels
6. Update aria-labels and screen reader announcements
7. Consider country name translations (may defer to later task)

### Task 6: Update AddPropertyModal component

**File:** `src/components/SimpleDashboard/AddPropertyModal.tsx`

**Modifications:**
Same pattern as PropertyEditModal with create-specific labels.

### Task 7: Update LoadingIndicator component

**File:** `src/components/SimpleDashboard/LoadingIndicator.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update default `label` prop to use translation key
3. Component consumers may pass translated labels

### Task 8: Update PortfolioSummary component

**File:** `src/components/SimpleDashboard/PortfolioSummary.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update header text, stat labels, insight text
3. Use ICU pluralization for insight text
4. Update skeleton and aria-labels

### Task 9: Update PropertySearchBar component

**File:** `src/components/SimpleDashboard/PropertySearchBar.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update placeholder and aria-labels
3. Note: placeholder prop may need to remain dynamic for consumer override

### Task 10: Update PropertyGroupingControl component

**File:** `src/components/SimpleDashboard/PropertyGroupingControl.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update "Group by" label
3. Update `GROUPING_OPTIONS` labels
4. Update aria-label

### Task 11: Update BulkOperationsToolbar component

**File:** `src/components/SimpleDashboard/BulkOperationsToolbar.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update all checkbox labels, selection count, button labels
3. Update all aria-labels with interpolation

### Task 12: Update AdvancedDashboardTools component

**File:** `src/components/SimpleDashboard/AdvancedDashboardTools.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update "Advanced Tools" heading

### Task 13: Update DashboardSettingsPopover component

**File:** `src/components/SimpleDashboard/DashboardSettingsPopover.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update popover title, toggle labels, descriptions
3. Update footer hint text
4. Update all aria-labels

### Task 14: Update ProgressivePropertySection component

**File:** `src/components/SimpleDashboard/ProgressivePropertySection.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update search placeholder
3. Update search results text with pluralization

### Task 15: Update ProgressiveStatisticsSection component

**File:** `src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update comparison hint text

### Task 16: Update SkeletonBase component

**File:** `src/components/SimpleDashboard/skeletons/SkeletonBase.tsx`

**Modifications:**
1. Add `useTranslations` import and hook
2. Update default label
3. Update "please wait" pattern

### Task 17: Generate translations for other languages

After all English keys are finalized, generate translations for:
- French (fr.json)
- Spanish (es.json)
- German (de.json)
- Dutch (nl.json)
- Italian (it.json)

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Scope of Changes |
|-----------|------------------|
| `/messages/en.json` | Add/expand `dashboard` namespace with ~100 new keys |
| `/messages/fr.json` | Add corresponding French translations |
| `/messages/es.json` | Add corresponding Spanish translations |
| `/messages/de.json` | Add corresponding German translations |
| `/messages/nl.json` | Add corresponding Dutch translations |
| `/messages/it.json` | Add corresponding Italian translations |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Add i18n, update ~8 strings |
| `/src/components/SimpleDashboard/EmptyStateCard.tsx` | Add i18n, update ~3 strings |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Add i18n, update ~15 strings |
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Add i18n, update ~6 strings |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Add i18n, update ~30 strings |
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Add i18n, update ~30 strings |
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | Add i18n, update ~2 strings |
| `/src/components/SimpleDashboard/PortfolioSummary.tsx` | Add i18n, update ~8 strings |
| `/src/components/SimpleDashboard/PropertySearchBar.tsx` | Add i18n, update ~3 strings |
| `/src/components/SimpleDashboard/PropertyGroupingControl.tsx` | Add i18n, update ~5 strings |
| `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx` | Add i18n, update ~8 strings |
| `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` | Add i18n, update ~2 strings |
| `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | Add i18n, update ~10 strings |
| `/src/components/SimpleDashboard/ProgressivePropertySection.tsx` | Add i18n, update ~3 strings |
| `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx` | Add i18n, update ~2 strings |
| `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | Add i18n, update ~2 strings |

### Functions/Sections to Modify

**StatisticsCards.tsx:**
- `StatCard` component - aria-label
- `LoadingSkeleton` function - aria label
- `StatisticsCards` function - cardConfigs, propertyContext, empty state

**PropertySection.tsx:**
- `PropertyRow` function - item/room counts, aria-label
- `LoadingSkeleton` function - aria label
- `PropertyEmptyState` function - title, description, actionLabel
- `SinglePropertyCard` function - item/room counts, aria-label
- `PropertySection` function - headingText, button label/aria-label

**ActionButtons.tsx:**
- `buttonConfigs` array - labels and ariaLabels

**PropertyEditModal.tsx:**
- `COUNTRIES` array - labels (may defer)
- `validateForm` function - error messages
- `PropertyEditModal` function - all UI strings
- `renderTextField` helper - labels and placeholders

**AddPropertyModal.tsx:**
- Same pattern as PropertyEditModal

**PortfolioSummary.tsx:**
- `LoadingSkeleton` function - aria label
- `SummaryStat` component - label
- `PortfolioSummary` function - all stat labels and insight text

**PropertySearchBar.tsx:**
- `PropertySearchBar` function - placeholder, aria-labels

**PropertyGroupingControl.tsx:**
- `GROUPING_OPTIONS` array - labels
- `PropertyGroupingControl` function - label, aria-label

**BulkOperationsToolbar.tsx:**
- `BulkOperationsToolbar` function - all labels and aria-labels

**DashboardSettingsPopover.tsx:**
- `ToggleSwitch` component - label, description display
- `DashboardSettingsPopover` function - all UI text and aria-labels

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Namespace | `dashboard` | Matches established pattern in Plan-111 |
| Hook placement | Component function body | Standard next-intl pattern for client components |
| Pluralization | ICU format | Required for item/room counts |
| Country names | Defer translation | Country dropdown is a separate concern, may be handled by browser/Intl API |
| Props with strings | Keep flexible | EmptyStateCard receives translated strings from parent |

---

## Testing Requirements

### Manual Testing
- [ ] Verify all strings display correctly in English
- [ ] Switch language and verify translations appear
- [ ] Test long German translations don't break layouts
- [ ] Test RTL languages if supported in future
- [ ] Verify pluralization works (0, 1, 2+ items/rooms)
- [ ] Test empty states display correct translations
- [ ] Test modals display all translated content
- [ ] Verify loading states have correct aria-labels

### Automated Testing
- [ ] Update existing SimpleDashboard tests to mock `useTranslations`
- [ ] Add translation key coverage tests
- [ ] Verify no hardcoded strings remain

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys at runtime | Medium | High | Use TypeScript for key checking, fallback to English |
| German translations break layouts | Medium | Medium | Design with 40% text expansion buffer |
| Country name translation complexity | High | Low | Defer to Intl.DisplayNames API or later task |
| Performance impact from many t() calls | Low | Low | next-intl is optimized for this pattern |

---

## Acceptance Criteria Checklist

From REQ-E02-052:
- [ ] ActionButtons component: All button labels replaced with translation key references
- [ ] AddPropertyModal component: All strings replaced with translation key references
- [ ] AdvancedDashboardTools component: All strings replaced with translation key references
- [ ] BulkOperationsToolbar component: All strings replaced with translation key references
- [ ] DashboardSettingsPopover component: All strings replaced with translation key references
- [ ] EmptyStateCard component: All strings replaced with translation key references
- [ ] LoadingIndicator component: Default label uses translation
- [ ] PortfolioSummary component: All strings replaced with translation key references
- [ ] ProgressivePropertySection component: All strings replaced with translation key references
- [ ] ProgressiveStatisticsSection component: All strings replaced with translation key references
- [ ] PropertyEditModal component: All strings replaced with translation key references
- [ ] PropertyGroupingControl component: All strings replaced with translation key references
- [ ] PropertySearchBar component: All strings replaced with translation key references
- [ ] PropertySection component: All strings replaced with translation key references
- [ ] StatisticsCards component: All strings replaced with translation key references
- [ ] Skeleton components: All text content uses translation key references
- [ ] All components use useTranslations hook from next-intl with appropriate namespace
- [ ] Dynamic content properly uses variable interpolation for counts, names, dates
- [ ] Pluralization handled correctly for all count-based strings
- [ ] Date, time, and number formatting respects user's locale preferences
- [ ] All components remain fully functional with no layout breaks
- [ ] Long translations in languages like German do not break component layouts
- [ ] No translation key placeholders or untranslated strings visible
- [ ] All accessibility labels (aria-label, aria-description) replaced with translated strings
- [ ] TypeScript types updated if component props or interfaces change
- [ ] All components properly handle missing translations with graceful fallbacks
- [ ] Tooltips and help text display in the correct language
- [ ] Modal dialogs display fully translated content
- [ ] Validation error messages display in the correct language
- [ ] Success and confirmation messages display in the correct language

---

## References

- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-052
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
