# REQ-E02-052: Update All SimpleDashboard Components - Detailed Task Breakdown

**Document Type:** Detailed Implementation Guide
**Created:** 2026-01-20 21:15 UTC
**Last Modified:** 2026-01-20 21:15 UTC
**Request ID:** REQ-E02-052
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.4
**Size:** L (Large)
**Priority:** High
**Overview Document:** [REQ-E02-052-overview.md](./REQ-E02-052-update-all-simpledashboard-components-overview.md)

---

## Executive Summary

This detailed breakdown transforms the overview document into granular, actionable 1-story-point tasks for updating all 16 SimpleDashboard components to use internationalized strings. Each task is designed to be independently executable by an AI coding agent or junior developer, with explicit file paths, code patterns, and verification steps.

**Total Components:** 16
**Total Estimated Strings:** ~225
**Total Tasks:** 20

---

## Prerequisites Checklist

Before starting any task, verify:

- [ ] Epic 1 foundation complete: `next-intl` package installed
- [ ] `useTranslations` hook importable from `next-intl`
- [ ] `/messages/en.json` exists with basic `dashboard` namespace
- [ ] IntlProvider wrapper configured in `/src/app/layout.tsx`
- [ ] Build passes: `npm run build` completes without errors

---

## Task Index

| Task # | Title | File(s) | Est. Points | Depends On |
|--------|-------|---------|-------------|------------|
| T1 | Expand dashboard namespace in en.json | `/messages/en.json` | 2 | None |
| T2 | Update StatisticsCards component | `StatisticsCards.tsx` | 1 | T1 |
| T3 | Update EmptyStateCard component | `EmptyStateCard.tsx` | 1 | T1 |
| T4 | Update PropertySection component | `PropertySection.tsx` | 2 | T1 |
| T5 | Update ActionButtons component | `ActionButtons.tsx` | 1 | T1 |
| T6 | Update PropertyEditModal component | `PropertyEditModal.tsx` | 2 | T1 |
| T7 | Update AddPropertyModal component | `AddPropertyModal.tsx` | 2 | T1 |
| T8 | Update LoadingIndicator component | `LoadingIndicator.tsx` | 1 | T1 |
| T9 | Update PortfolioSummary component | `PortfolioSummary.tsx` | 1 | T1 |
| T10 | Update PropertySearchBar component | `PropertySearchBar.tsx` | 1 | T1 |
| T11 | Update PropertyGroupingControl component | `PropertyGroupingControl.tsx` | 1 | T1 |
| T12 | Update BulkOperationsToolbar component | `BulkOperationsToolbar.tsx` | 1 | T1 |
| T13 | Update AdvancedDashboardTools component | `AdvancedDashboardTools.tsx` | 1 | T1 |
| T14 | Update DashboardSettingsPopover component | `DashboardSettingsPopover.tsx` | 1 | T1 |
| T15 | Update ProgressivePropertySection component | `ProgressivePropertySection.tsx` | 1 | T1 |
| T16 | Update ProgressiveStatisticsSection component | `ProgressiveStatisticsSection.tsx` | 1 | T1 |
| T17 | Update SkeletonBase component | `skeletons/SkeletonBase.tsx` | 1 | T1 |
| T18 | Generate French translations | `/messages/fr.json` | 1 | T1-T17 |
| T19 | Generate remaining language translations | `/messages/{es,de,nl,it}.json` | 2 | T1-T17 |
| T20 | Update component tests | `__tests__/*.test.tsx` | 1 | T2-T17 |

---

## Task T1: Expand Dashboard Namespace in en.json

**Priority:** CRITICAL - Must complete first
**File:** `/messages/en.json`
**Estimated Points:** 2

### Objective
Add all SimpleDashboard-specific translation keys to the `dashboard` namespace in the English translation file.

### Pre-Conditions
- File `/messages/en.json` exists
- File has a basic structure (may have partial `dashboard` namespace)

### Implementation Steps

1. **Open file** `/messages/en.json`

2. **Locate or create** the `dashboard` key in the root object

3. **Add/merge** the following structure into the `dashboard` namespace:

```json
{
  "dashboard": {
    "stats": {
      "items": "Items",
      "rooms": "Rooms",
      "tags": "Tags",
      "allProperties": "(all properties)",
      "loadingStats": "Loading statistics",
      "viewLabel": "View {label}: {value}",
      "emptyTitle": "Start adding new QR Code items and create guides/instructions",
      "emptyAction": "New QR Code Item"
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
      "listAriaLabel": "Your properties",
      "emptyTitle": "Let's add your property",
      "emptyDescription": "A property is where your items live - like a vacation rental or home.",
      "addProperty": "Add Property"
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

### Verification Steps

1. **Syntax check:** Run `npm run build` - should complete without JSON parse errors
2. **Key completeness:** Verify all sub-namespaces exist: `stats`, `property`, `actions`, `modal`, `form`, `validation`, `buttons`, `errors`, `portfolio`, `search`, `grouping`, `bulk`, `advancedTools`, `settings`, `loading`, `hints`
3. **ICU syntax:** Verify pluralization patterns compile (no syntax errors in build)

### Acceptance Criteria
- [ ] All translation keys from implementation plan added to en.json
- [ ] JSON is valid (no syntax errors)
- [ ] Build completes successfully
- [ ] No duplicate keys within namespace

---

## Task T2: Update StatisticsCards Component

**File:** `/src/components/SimpleDashboard/StatisticsCards.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Objective
Replace all hardcoded English strings with translation function calls using the `dashboard` namespace.

### Strings to Replace

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| ~177 | `'Items'` | `t('stats.items')` |
| ~186 | `'Rooms'` | `t('stats.rooms')` |
| ~195 | `'Tags'` | `t('stats.tags')` |
| ~245 | `'(all properties)'` | `t('stats.allProperties')` |
| ~90 | `View ${config.label}: ${value}` | `t('stats.viewLabel', { label, value })` |
| ~120 | `"Loading statistics"` | `t('stats.loadingStats')` |
| ~218 | `"Start adding new QR Code items..."` | `t('stats.emptyTitle')` |
| ~220 | `"New QR Code Item"` | `t('stats.emptyAction')` |

### Implementation Steps

1. **Add import** at top of file (after existing imports):
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside `StatisticsCards` function (first line of function body):
```typescript
const t = useTranslations('dashboard');
```

3. **Update cardConfigs array** (around line 174-199):
```typescript
// Before:
{ key: 'itemCount', label: 'Items', ... }
// After:
{ key: 'itemCount', label: t('stats.items'), ... }
```

4. **Update StatCard aria-label** (around line 90):
```typescript
// Before:
aria-label={`View ${config.label}: ${value}`}
// After:
aria-label={t('stats.viewLabel', { label: config.label, value: String(value) })}
```

5. **Update LoadingSkeleton** (around line 120):
```typescript
// Before:
<SkeletonBase label="Loading statistics">
// After:
<SkeletonBase label={t('stats.loadingStats')}>
```

6. **Update EmptyStateCard call** (around line 216-224):
```typescript
// Before:
title="Start adding new QR Code items and create guides/instructions"
actionLabel="New QR Code Item"
// After:
title={t('stats.emptyTitle')}
actionLabel={t('stats.emptyAction')}
```

### Verification Steps

1. Run `npm run build` - no TypeScript errors
2. Navigate to dashboard in dev mode
3. Verify statistics cards display correctly
4. Verify empty state (if applicable) displays correctly
5. Check aria-labels in browser DevTools

### Acceptance Criteria
- [ ] Import statement added
- [ ] useTranslations hook added with 'dashboard' namespace
- [ ] All 8 string replacements made
- [ ] Build passes
- [ ] UI renders correctly

---

## Task T3: Update EmptyStateCard Component

**File:** `/src/components/SimpleDashboard/EmptyStateCard.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Objective
EmptyStateCard is a presentation component that receives strings via props. Ensure it properly handles translated strings passed from parent components.

### Analysis
This component receives `title`, `description`, and `actionLabel` as props. No internal hardcoded strings need translation. Parent components (StatisticsCards, PropertySection) pass translated strings.

### Implementation Steps

1. **Verify component signature** - No changes needed if props are already typed as `string`

2. **Document i18n pattern** - Add comment at top of file:
```typescript
/**
 * EmptyStateCard Component
 *
 * i18n Note: This is a presentation component. All user-facing text
 * (title, description, actionLabel) should be translated by parent
 * components before passing as props.
 */
```

3. **Optional enhancement** - If aria-labels exist within component, translate them

### Verification Steps

1. Verify component works when parent passes translated strings
2. Test with empty/undefined description (should not break)

### Acceptance Criteria
- [ ] Component accepts translated strings from parents
- [ ] No runtime errors when used with translations
- [ ] Documentation comment added

---

## Task T4: Update PropertySection Component

**File:** `/src/components/SimpleDashboard/PropertySection.tsx`
**Estimated Points:** 2
**Depends On:** T1

### Objective
Replace all hardcoded English strings with translation function calls, including pluralization for item/room counts.

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| PropertyRow aria-label | `Edit property: ${property.nickname}` | `t('property.editAriaLabel', { name })` |
| PropertyRow item count | `${itemCount} ${itemCount === 1 ? 'item' : 'items'}` | `t('property.itemCount', { count: itemCount })` |
| PropertyRow room count | `${roomCount} ${roomCount === 1 ? 'room' : 'rooms'}` | `t('property.roomCount', { count: roomCount })` |
| LoadingSkeleton | `"Loading properties"` | `t('property.loadingProperties')` |
| PropertyEmptyState | `"Let's add your property"` | `t('property.emptyTitle')` |
| PropertyEmptyState | `"A property is where your items live..."` | `t('property.emptyDescription')` |
| PropertyEmptyState | `'Add Property'` | `t('property.addProperty')` |
| headingText | `'My Property'` / `'My Properties'` | `t('property.singular')` / `t('property.plural')` |
| list aria-label | `"Your properties"` | `t('property.listAriaLabel')` |
| Add button aria-label | `"Add a new property"` | `t('property.addAriaLabel')` |
| Add button label | `"Add New Property"` | `t('property.addNew')` |

### Implementation Steps

1. **Add import**:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** in main component and sub-components that need translations:
```typescript
// In PropertySection function
const t = useTranslations('dashboard');
```

3. **Update headingText** (around line 256):
```typescript
// Before:
const headingText = userProperties?.length === 1 ? 'My Property' : 'My Properties';
// After:
const headingText = userProperties?.length === 1 ? t('property.singular') : t('property.plural');
```

4. **Update PropertyRow** - Need to pass `t` or call hook:
```typescript
// Option A: Pass t as prop
interface PropertyRowProps {
  // ... existing props
  t: ReturnType<typeof useTranslations>;
}

// Option B: Call hook inside (if component is separate)
const t = useTranslations('dashboard');
```

5. **Update item/room counts in PropertyRow** (around lines 67, 71):
```typescript
// Before:
{itemCount} {itemCount === 1 ? 'item' : 'items'}
// After:
{t('property.itemCount', { count: itemCount })}
```

6. **Update PropertyEmptyState** (around lines 129-131):
```typescript
// Before:
title="Let's add your property"
description="A property is where your items live - like a vacation rental or home."
actionLabel={onAddProperty ? 'Add Property' : undefined}
// After:
title={t('property.emptyTitle')}
description={t('property.emptyDescription')}
actionLabel={onAddProperty ? t('property.addProperty') : undefined}
```

7. **Update LoadingSkeleton** (around line 89):
```typescript
<SkeletonBase label={t('property.loadingProperties')}>
```

8. **Update list aria-label** (around line 316):
```typescript
// Before:
<div role="list" aria-label="Your properties">
// After:
<div role="list" aria-label={t('property.listAriaLabel')}>
```

9. **Update Add button** (around lines 339, 342):
```typescript
// Before:
aria-label="Add a new property"
<span>Add New Property</span>
// After:
aria-label={t('property.addAriaLabel')}
<span>{t('property.addNew')}</span>
```

### Verification Steps

1. Run `npm run build`
2. Test with 0 properties (empty state)
3. Test with 1 property (singular heading, single card view)
4. Test with 2+ properties (plural heading, list view)
5. Verify item counts: 0 items, 1 item, 5 items
6. Verify room counts: 0 rooms, 1 room, 3 rooms

### Acceptance Criteria
- [ ] All strings replaced with translation calls
- [ ] Pluralization works for item/room counts
- [ ] Empty state displays translated text
- [ ] Build passes
- [ ] UI renders correctly in all states

---

## Task T5: Update ActionButtons Component

**File:** `/src/components/SimpleDashboard/ActionButtons.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Objective
Replace hardcoded button labels and aria-labels with translation function calls.

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| buttonConfigs[0].label | `'New QR Code Item'` | `t('actions.newQrCodeItem')` |
| buttonConfigs[0].ariaLabel | `'Create a new QR code item'` | `t('actions.createItemAriaLabel')` |
| buttonConfigs[1].label | `'View QR Code Items'` | `t('actions.viewQrCodeItems')` |
| buttonConfigs[1].ariaLabel | `'View all your items'` | `t('actions.viewItemsAriaLabel')` |
| buttonConfigs[2].label | `'Print QR Code'` | `t('actions.printQrCode')` |
| buttonConfigs[2].ariaLabel | `'Print QR codes for your items'` | `t('actions.printAriaLabel')` |

### Implementation Steps

1. **Add import**:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** at start of ActionButtons function:
```typescript
const t = useTranslations('dashboard');
```

3. **Update buttonConfigs** (around lines 156-181):
```typescript
const buttonConfigs: ActionButtonConfig[] = [
  {
    key: 'create',
    label: t('actions.newQrCodeItem'),
    icon: PlusCircle,
    variant: 'primary',
    onClick: onCreateClick || (() => router.push('/dashboard2/create')),
    ariaLabel: t('actions.createItemAriaLabel'),
  },
  {
    key: 'view',
    label: t('actions.viewQrCodeItems'),
    icon: Package,
    variant: 'secondary',
    onClick: onViewClick || (() => router.push('/dashboard2/items')),
    ariaLabel: t('actions.viewItemsAriaLabel'),
  },
  {
    key: 'print',
    label: t('actions.printQrCode'),
    icon: QrCode,
    variant: 'secondary',
    onClick: handlePrintQRCode,
    ariaLabel: t('actions.printAriaLabel'),
  },
];
```

### Verification Steps

1. Run `npm run build`
2. Navigate to dashboard
3. Verify all three buttons display correct labels
4. Inspect aria-labels in DevTools

### Acceptance Criteria
- [ ] Import and hook added
- [ ] All 6 strings replaced
- [ ] Build passes
- [ ] Buttons render correctly

---

## Task T6: Update PropertyEditModal Component

**File:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Estimated Points:** 2
**Depends On:** T1

### Objective
Replace all hardcoded strings in the property edit modal including title, field labels, placeholders, validation messages, and button labels.

### Strings to Replace

| Category | Strings |
|----------|---------|
| Modal title | "Edit Property" |
| Modal description | "Edit the details of your property..." |
| Field labels | "Property Name", "Address Line 1", "Address Line 2", "City", "State/Province", "Postal Code", "Country" |
| Placeholders | "e.g., Beach House", "Street address", "Apt, suite, unit...", etc. |
| Validation errors | "Property name is required", "Property name must be 100 characters or less", etc. |
| Buttons | "Cancel", "Save Changes", "Saving..." |
| Aria labels | "Close modal", "Saving property changes..." |
| Country dropdown | "Select country..." |

### Implementation Steps

1. **Add import**:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook**:
```typescript
const t = useTranslations('dashboard');
```

3. **Update validateForm function** (around lines 115-157):
```typescript
const validateForm = (data: PropertyEditFormData, t: ReturnType<typeof useTranslations>): PropertyEditValidationErrors => {
  const errors: PropertyEditValidationErrors = {};

  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = t('validation.propertyNameRequired');
  } else if (trimmedName.length > 100) {
    errors.name = t('validation.propertyNameMaxLength');
  }
  // ... continue for other fields
};
```

4. **Update COUNTRIES array first item** (around line 20):
```typescript
// Note: Country names could use Intl.DisplayNames API for full i18n
// For now, just translate the placeholder
{ code: '', label: t('form.selectCountry') }  // This needs to be inside component
```

5. **Update modal title and description** (around lines 396-399):
```typescript
<Dialog.Title ...>
  {t('modal.editProperty')}
</Dialog.Title>
<Dialog.Description ...>
  {t('modal.editPropertyDescription')}
</Dialog.Description>
```

6. **Update field labels in renderTextField calls** (around lines 441-476):
```typescript
{renderTextField('name', t('form.propertyName'), formData.name, {
  required: true,
  maxLength: 100,
  placeholder: t('form.propertyNamePlaceholder'),
})}
// ... continue for all fields
```

7. **Update buttons** (around lines 516-555):
```typescript
// Cancel button
<span>{t('buttons.cancel')}</span>

// Save button
{isSubmitting ? (
  <>
    <LoadingIndicator ... />
    <span>{t('buttons.saving')}</span>
  </>
) : (
  <span>{t('buttons.saveChanges')}</span>
)}
```

8. **Update screen reader announcements** (around line 424):
```typescript
{isSubmitting && t('modal.savingProperty')}
```

9. **Update close button aria-label** (around line 413):
```typescript
aria-label={t('modal.closeModal')}
```

### Verification Steps

1. Run `npm run build`
2. Open property edit modal
3. Verify all labels display correctly
4. Test validation - submit with empty name
5. Verify error messages display correctly
6. Verify saving state shows correct text

### Acceptance Criteria
- [ ] All ~30 strings replaced
- [ ] Validation messages translate correctly
- [ ] Modal renders correctly
- [ ] Build passes

---

## Task T7: Update AddPropertyModal Component

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Estimated Points:** 2
**Depends On:** T1

### Objective
Update AddPropertyModal with same pattern as PropertyEditModal, using create-specific translation keys.

### Implementation Pattern
Follow same pattern as Task T6, but use:
- `t('modal.addProperty')` for title
- `t('modal.addPropertyDescription')` for description
- `t('buttons.createProperty')` for submit button
- `t('buttons.creating')` for loading state
- `t('modal.creatingProperty')` for screen reader
- `t('errors.createFailed')` for error messages

### Implementation Steps

1. **Add import and hook** (same as T6)

2. **Update modal title/description**:
```typescript
<Dialog.Title>
  {t('modal.addProperty')}
</Dialog.Title>
<Dialog.Description>
  {t('modal.addPropertyDescription')}
</Dialog.Description>
```

3. **Update form field labels/placeholders** (same keys as PropertyEditModal)

4. **Update submit button**:
```typescript
{isSubmitting ? (
  <>
    <LoadingIndicator ... />
    <span>{t('buttons.creating')}</span>
  </>
) : (
  <span>{t('buttons.createProperty')}</span>
)}
```

5. **Update screen reader announcement**:
```typescript
{isSubmitting && t('modal.creatingProperty')}
```

6. **Update error handling**:
```typescript
setErrors({
  general: error instanceof Error ? error.message : t('errors.createFailed'),
});
```

### Verification Steps

1. Run `npm run build`
2. Open add property modal
3. Verify all text displays correctly
4. Test form submission flow

### Acceptance Criteria
- [ ] All strings replaced
- [ ] Build passes
- [ ] Modal functions correctly

---

## Task T8: Update LoadingIndicator Component

**File:** `/src/components/SimpleDashboard/LoadingIndicator.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Objective
Update the default aria-label for the loading indicator.

### Implementation Steps

1. **Add import**:
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook**:
```typescript
const t = useTranslations('dashboard');
```

3. **Update default label** (around line 63):
```typescript
// Before:
label = 'Loading'
// After:
label = t('loading.default')
```

**Note:** Since this component accepts a `label` prop, parent components can pass translated labels. The default is the fallback.

### Verification Steps

1. Run `npm run build`
2. Verify loading indicators show correct aria-labels

### Acceptance Criteria
- [ ] Default label translated
- [ ] Component still accepts custom labels via props
- [ ] Build passes

---

## Task T9: Update PortfolioSummary Component

**File:** `/src/components/SimpleDashboard/PortfolioSummary.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Header | `"Portfolio Overview"` | `t('portfolio.title')` |
| Stat label | `"Total Properties"` | `t('portfolio.totalProperties')` |
| Stat label | `"Total Items"` | `t('portfolio.totalItems')` |
| Stat label | `"Avg Items/Property"` | `t('portfolio.avgItemsPerProperty')` |
| Insight text | `"You have {rooms} room(s) across {count} propert(ies)"` | `t('portfolio.insight', { roomCount, propertyCount })` |
| Skeleton label | `"Loading portfolio summary"` | `t('portfolio.loadingSummary')` |
| Region aria-label | `"Portfolio summary"` | `t('portfolio.ariaLabel')` |

### Implementation Steps

1. **Add import and hook**

2. **Update header**:
```typescript
<h3 className="...">{t('portfolio.title')}</h3>
```

3. **Update stat labels**:
```typescript
<SummaryStat label={t('portfolio.totalProperties')} value={totalProperties} />
<SummaryStat label={t('portfolio.totalItems')} value={totalItems} />
<SummaryStat label={t('portfolio.avgItemsPerProperty')} value={avgItems} />
```

4. **Update insight text** with ICU pluralization:
```typescript
<p className="...">{t('portfolio.insight', { roomCount: totalRooms, propertyCount: totalProperties })}</p>
```

5. **Update skeleton and region labels**

### Verification Steps

1. Run `npm run build`
2. Navigate to dashboard with multiple properties
3. Verify portfolio summary displays correctly

### Acceptance Criteria
- [ ] All strings replaced
- [ ] Pluralization works in insight text
- [ ] Build passes

---

## Task T10: Update PropertySearchBar Component

**File:** `/src/components/SimpleDashboard/PropertySearchBar.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Placeholder | `"Search properties..."` | `t('search.placeholder')` |
| Aria-label | `"Search properties"` | `t('search.ariaLabel')` |
| Clear button | `"Clear search"` | `t('search.clearAriaLabel')` |

### Implementation Steps

1. **Add import and hook**

2. **Update placeholder and aria-labels**:
```typescript
<input
  placeholder={t('search.placeholder')}
  aria-label={t('search.ariaLabel')}
  ...
/>
<button
  aria-label={t('search.clearAriaLabel')}
  ...
/>
```

### Acceptance Criteria
- [ ] All 3 strings replaced
- [ ] Build passes

---

## Task T11: Update PropertyGroupingControl Component

**File:** `/src/components/SimpleDashboard/PropertyGroupingControl.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Label | `"Group by"` | `t('grouping.label')` |
| Option | `"No Grouping"` | `t('grouping.noGrouping')` |
| Option | `"By Location"` | `t('grouping.byLocation')` |
| Option | `"By Item Count"` | `t('grouping.byItemCount')` |
| Aria-label | `"Property grouping option"` | `t('grouping.ariaLabel')` |

### Implementation Steps

1. **Add import and hook**

2. **Update GROUPING_OPTIONS**:
```typescript
const GROUPING_OPTIONS = [
  { value: 'none', label: t('grouping.noGrouping') },
  { value: 'location', label: t('grouping.byLocation') },
  { value: 'itemCount', label: t('grouping.byItemCount') },
];
```

3. **Update label and aria-label**

### Acceptance Criteria
- [ ] All 5 strings replaced
- [ ] Build passes

---

## Task T12: Update BulkOperationsToolbar Component

**File:** `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Checkbox label | `"Select all"` / `"All selected"` | `t('bulk.selectAll')` / `t('bulk.allSelected')` |
| Checkbox aria | `"Select all properties"` / `"Deselect all properties"` | `t('bulk.selectAllAriaLabel')` / `t('bulk.deselectAllAriaLabel')` |
| Count display | `"{count} selected"` | `t('bulk.selectedCount', { count })` |
| Clear button | `"Clear selection"` | `t('bulk.clearSelectionAriaLabel')` |
| Print button | `"Print Selected"` | `t('bulk.printSelected')` |
| Print aria | `"Print {count} selected properties"` | `t('bulk.printAriaLabel', { count })` |
| Toolbar aria | `"Bulk operations"` | `t('bulk.toolbarAriaLabel')` |

### Implementation Steps

1. **Add import and hook**

2. **Update all string references with translation calls**

### Acceptance Criteria
- [ ] All 8+ strings replaced
- [ ] Interpolation works for count displays
- [ ] Build passes

---

## Task T13: Update AdvancedDashboardTools Component

**File:** `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Heading | `"Advanced Tools"` | `t('advancedTools.title')` |

### Implementation Steps

1. **Add import and hook**

2. **Update heading**:
```typescript
<h3 className="...">{t('advancedTools.title')}</h3>
```

### Acceptance Criteria
- [ ] String replaced
- [ ] Build passes

---

## Task T14: Update DashboardSettingsPopover Component

**File:** `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Button aria | `"Dashboard settings"` | `t('settings.buttonAriaLabel')` |
| Popover title | `"Dashboard Settings"` | `t('settings.title')` |
| Close aria | `"Close settings"` | `t('settings.closeAriaLabel')` |
| Toggle label | `"Show Advanced Tools"` | `t('settings.showAdvancedTools')` |
| Toggle desc | `"Always show grouping and bulk operations"` | `t('settings.showAdvancedToolsDescription')` |
| Toggle label | `"Show Portfolio Summary"` | `t('settings.showPortfolioSummary')` |
| Toggle desc | `"Always show portfolio overview card"` | `t('settings.showPortfolioSummaryDescription')` |
| Hint | `"These settings override..."` | `t('settings.overrideHint')` |

### Implementation Steps

1. **Add import and hook**

2. **Update ToggleSwitch calls** (around lines 181-194):
```typescript
<ToggleSwitch
  id="forceAdvancedTools"
  checked={preferences.forceAdvancedTools}
  onChange={handleAdvancedToolsChange}
  label={t('settings.showAdvancedTools')}
  description={t('settings.showAdvancedToolsDescription')}
/>
<ToggleSwitch
  id="forcePortfolioView"
  checked={preferences.forcePortfolioView}
  onChange={handlePortfolioViewChange}
  label={t('settings.showPortfolioSummary')}
  description={t('settings.showPortfolioSummaryDescription')}
/>
```

3. **Update other strings**

### Acceptance Criteria
- [ ] All 10 strings replaced
- [ ] Build passes
- [ ] Popover renders correctly

---

## Task T15: Update ProgressivePropertySection Component

**File:** `/src/components/SimpleDashboard/ProgressivePropertySection.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Search placeholder | `"Search properties..."` | `t('search.placeholder')` |
| No results | `"No properties found"` | `t('search.noResults')` |
| Result count | `"{count} property/properties found"` | `t('search.resultCount', { count })` |

### Implementation Steps

1. **Add import and hook**

2. **Update strings**

### Acceptance Criteria
- [ ] All 3 strings replaced
- [ ] Pluralization works
- [ ] Build passes

---

## Task T16: Update ProgressiveStatisticsSection Component

**File:** `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Hint text | `"Use the property selector to compare statistics..."` | `t('hints.compareStats')` |

### Implementation Steps

1. **Add import and hook**

2. **Update hint text**

### Acceptance Criteria
- [ ] String replaced
- [ ] Build passes

---

## Task T17: Update SkeletonBase Component

**File:** `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx`
**Estimated Points:** 1
**Depends On:** T1

### Strings to Replace

| Location | Current String | Translation Key |
|----------|----------------|-----------------|
| Default label | `"Loading content"` | `t('loading.content')` |
| Screen reader pattern | `"{label}, please wait..."` | `t('loading.pleaseWait', { label })` |

### Implementation Steps

1. **Add import and hook**

2. **Update default label and screen reader text**

### Acceptance Criteria
- [ ] Strings replaced
- [ ] Build passes

---

## Task T18: Generate French Translations

**File:** `/messages/fr.json`
**Estimated Points:** 1
**Depends On:** T1-T17

### Objective
Add French translations for all dashboard namespace keys.

### Implementation Steps

1. **Copy dashboard namespace structure from en.json**

2. **Translate all values to French**:

```json
{
  "dashboard": {
    "stats": {
      "items": "Éléments",
      "rooms": "Pièces",
      "tags": "Étiquettes",
      "allProperties": "(toutes les propriétés)",
      "loadingStats": "Chargement des statistiques",
      "viewLabel": "Voir {label}: {value}",
      "emptyTitle": "Commencez à ajouter des éléments QR Code et créez des guides",
      "emptyAction": "Nouvel élément QR Code"
    },
    "property": {
      "singular": "Ma propriété",
      "plural": "Mes propriétés",
      "itemCount": "{count, plural, =0 {0 éléments} one {# élément} other {# éléments}}",
      "roomCount": "{count, plural, =0 {0 pièces} one {# pièce} other {# pièces}}",
      "addNew": "Ajouter une nouvelle propriété",
      "editAriaLabel": "Modifier la propriété: {name}",
      "addAriaLabel": "Ajouter une nouvelle propriété",
      "loadingProperties": "Chargement des propriétés",
      "listAriaLabel": "Vos propriétés",
      "emptyTitle": "Ajoutons votre propriété",
      "emptyDescription": "Une propriété est l'endroit où vivent vos éléments - comme une location de vacances ou une maison.",
      "addProperty": "Ajouter une propriété"
    }
    // ... continue for all keys
  }
}
```

### Verification Steps

1. Run `npm run build`
2. Switch language to French
3. Verify dashboard displays French text

### Acceptance Criteria
- [ ] All dashboard keys translated to French
- [ ] JSON is valid
- [ ] Pluralization patterns use correct French forms
- [ ] Build passes

---

## Task T19: Generate Remaining Language Translations

**Files:** `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimated Points:** 2
**Depends On:** T18

### Objective
Add translations for Spanish, German, Dutch, and Italian.

### Implementation Steps

1. For each language file, add the `dashboard` namespace with appropriate translations

2. **Key considerations by language:**
   - **German (de):** Watch for longer text that may affect layouts
   - **Spanish (es):** Ensure proper accent characters
   - **Dutch (nl):** Similar structure to German
   - **Italian (it):** Ensure proper accent characters

### Verification Steps

1. Run `npm run build`
2. Test each language in dev mode

### Acceptance Criteria
- [ ] All 4 language files updated
- [ ] All keys present in each file
- [ ] Build passes for all languages

---

## Task T20: Update Component Tests

**Files:** `/src/components/SimpleDashboard/__tests__/*.test.tsx`
**Estimated Points:** 1
**Depends On:** T2-T17

### Objective
Update existing tests to mock the `useTranslations` hook and verify translated content.

### Implementation Steps

1. **Add mock for next-intl** in test setup or individual test files:
```typescript
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
```

2. **Update assertions** that check for specific text to use translation keys or the mock return value

3. **Add test for translation key usage** (optional):
```typescript
it('uses translation keys for button labels', () => {
  render(<ActionButtons />);
  expect(screen.getByRole('button', { name: /actions\.newQrCodeItem/i })).toBeInTheDocument();
});
```

### Verification Steps

1. Run `npm run test` - all tests should pass
2. Verify no tests are skipped due to missing translations

### Acceptance Criteria
- [ ] All existing tests pass with translations
- [ ] Mock properly set up
- [ ] No hardcoded string assertions that break with translations

---

## Testing Checklist

### Manual Testing

For each language (en, fr, es, de, nl, it):

- [ ] Dashboard loads without errors
- [ ] Statistics cards display correct labels
- [ ] Property section heading shows singular/plural correctly
- [ ] Item counts show proper pluralization (0, 1, 5 items)
- [ ] Room counts show proper pluralization (0, 1, 3 rooms)
- [ ] Empty states display correct messages
- [ ] Action buttons show correct labels
- [ ] Property edit modal displays all translations
- [ ] Add property modal displays all translations
- [ ] Validation errors display in correct language
- [ ] Settings popover displays all translations
- [ ] Portfolio summary displays correct labels
- [ ] Search bar shows correct placeholder
- [ ] All aria-labels are translated (inspect with DevTools)

### Layout Testing

- [ ] German translations don't break layouts (40% longer text)
- [ ] Button text doesn't overflow
- [ ] Modal content fits within boundaries
- [ ] Card layouts remain intact

### Automated Testing

- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] No TypeScript errors
- [ ] No missing translation key warnings in console

---

## Rollback Plan

If issues are discovered after deployment:

1. **Quick fix:** Revert translation file changes in `/messages/*.json`
2. **Component fix:** Revert specific component to use hardcoded strings
3. **Full rollback:** Revert all changes via git

---

## References

- [Overview Document](./REQ-E02-052-update-all-simpledashboard-components-overview.md)
- [Implementation Plan: Epic 2](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](./gen_requests_epic2.md) - REQ-E02-052
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task ID: 2B.4 - Update all SimpleDashboard components*
