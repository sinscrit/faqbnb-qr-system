# REQ-367: Update All SimpleDashboard Components for Internationalization

**Document Type**: Detailed Task Breakdown (Implementation Ready)
**Created**: 2026-01-19 18:45 UTC
**Last Modified**: 2026-01-19 18:45 UTC
**Request Reference**: docs/gen_requests_epic2.md - Request #367
**Overview Document**: docs/REQ-367-update-all-simpledashboard-components-overview.md
**Implementation Plan Reference**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic**: 2B - Dashboard & Navigation
**Task ID**: 2B.4
**Size**: L (Large)
**Priority**: P1 - High

---

## Executive Summary

This document provides granular, implementation-ready tasks for internationalizing all SimpleDashboard components. The scope includes 15 primary component files plus 3 skeleton components, encompassing ~225 translatable strings across statistics cards, property sections, action buttons, modals, settings, bulk operations, search, and grouping controls.

---

## Prerequisites Checklist

Before starting implementation, verify:
- [ ] Epic 1 Foundation complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with base structure
- [ ] `useTranslations` hook from next-intl works in client components
- [ ] Task 2B.1 complete: `dashboard` namespace structure created
- [ ] Task 2H complete: `common` namespace for shared strings (actions, status, validation)

---

## Component Inventory

| # | Component | File | String Count | Complexity |
|---|-----------|------|--------------|------------|
| 1 | StatisticsCards | StatisticsCards.tsx | ~18 | Medium |
| 2 | PropertySection | PropertySection.tsx | ~28 | High |
| 3 | ActionButtons | ActionButtons.tsx | ~12 | Low |
| 4 | EmptyStateCard | EmptyStateCard.tsx | ~3 | Low |
| 5 | PropertyEditModal | PropertyEditModal.tsx | ~48 | High |
| 6 | AddPropertyModal | AddPropertyModal.tsx | ~48 | High |
| 7 | LoadingIndicator | LoadingIndicator.tsx | ~1 | Low |
| 8 | PortfolioSummary | PortfolioSummary.tsx | ~14 | Medium |
| 9 | DashboardSettingsPopover | DashboardSettingsPopover.tsx | ~12 | Medium |
| 10 | AdvancedDashboardTools | AdvancedDashboardTools.tsx | ~4 | Low |
| 11 | BulkOperationsToolbar | BulkOperationsToolbar.tsx | ~12 | Medium |
| 12 | PropertyGroupingControl | PropertyGroupingControl.tsx | ~6 | Low |
| 13 | PropertySearchBar | PropertySearchBar.tsx | ~4 | Low |
| 14 | ProgressivePropertySection | ProgressivePropertySection.tsx | ~6 | Low |
| 15 | ProgressiveStatisticsSection | ProgressiveStatisticsSection.tsx | ~4 | Low |
| 16 | SkeletonBase | skeletons/SkeletonBase.tsx | ~2 | Low |
| 17 | SkeletonText | skeletons/SkeletonText.tsx | ~1 | Low |
| 18 | SkeletonCard | skeletons/SkeletonCard.tsx | ~1 | Low |

**Total Estimated Strings**: ~224

---

## Task Breakdown

### Phase 1: Translation Key Infrastructure (Task 1)

#### Task 1.1: Add Dashboard Stats Translation Keys
**File**: `/messages/en.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

Add the following keys under `dashboard.stats`:

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
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Keys added to `/messages/en.json`
- [ ] Keys added to all 5 non-English language files
- [ ] No duplicate keys created

---

#### Task 1.2: Add Dashboard Property Translation Keys
**File**: `/messages/en.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

Add the following keys under `dashboard.property`:

```json
{
  "dashboard": {
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
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Keys added with ICU pluralization format
- [ ] Plurals tested with counts 0, 1, and 2+

---

#### Task 1.3: Add Dashboard Empty State Keys
**File**: `/messages/en.json`
**Story Points**: 0.25
**Status**: [ ] Not Started

Add the following keys under `dashboard.empty`:

```json
{
  "dashboard": {
    "empty": {
      "title": "Start adding new QR Code items and create guides/instructions",
      "action": "New QR Code Item"
    }
  }
}
```

---

#### Task 1.4: Add Dashboard Actions Keys
**File**: `/messages/en.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

Add the following keys under `dashboard.actions`:

```json
{
  "dashboard": {
    "actions": {
      "newQRCodeItem": "New QR Code Item",
      "viewQRCodeItems": "View QR Code Items",
      "printQRCode": "Print QR Code",
      "createNewItem": "Create a new QR code item",
      "viewAllItems": "View all your items",
      "printCodes": "Print QR codes for your items"
    }
  }
}
```

---

#### Task 1.5: Add Dashboard Settings Keys
**File**: `/messages/en.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

Add the following keys under `dashboard.settings`:

```json
{
  "dashboard": {
    "settings": {
      "title": "Dashboard Settings",
      "showAdvancedTools": "Show Advanced Tools",
      "advancedToolsDescription": "Always show grouping and bulk operations",
      "showPortfolioSummary": "Show Portfolio Summary",
      "portfolioDescription": "Always show portfolio overview card",
      "overrideHint": "These settings override automatic UI adaptation based on your property count.",
      "close": "Close settings"
    }
  }
}
```

---

#### Task 1.6: Add Dashboard Advanced Tools Keys
**File**: `/messages/en.json`
**Story Points**: 0.25
**Status**: [ ] Not Started

Add the following keys under `dashboard.advanced`:

```json
{
  "dashboard": {
    "advanced": {
      "title": "Advanced Tools"
    }
  }
}
```

---

#### Task 1.7: Add Dashboard Bulk Operations Keys
**File**: `/messages/en.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

Add the following keys under `dashboard.bulk`:

```json
{
  "dashboard": {
    "bulk": {
      "selectAll": "Select all",
      "allSelected": "All selected",
      "selected": "{count} selected",
      "clearSelection": "Clear selection",
      "printSelected": "Print Selected",
      "printSelectedAria": "Print {count} selected properties",
      "selectAllAria": "Select all properties",
      "deselectAllAria": "Deselect all properties"
    }
  }
}
```

---

#### Task 1.8: Add Dashboard Grouping Keys
**File**: `/messages/en.json`
**Story Points**: 0.25
**Status**: [ ] Not Started

Add the following keys under `dashboard.grouping`:

```json
{
  "dashboard": {
    "grouping": {
      "label": "Group by",
      "none": "No Grouping",
      "location": "By Location",
      "itemCount": "By Item Count"
    }
  }
}
```

---

#### Task 1.9: Add Dashboard Search Keys
**File**: `/messages/en.json`
**Story Points**: 0.25
**Status**: [ ] Not Started

Add the following keys under `dashboard.search`:

```json
{
  "dashboard": {
    "search": {
      "placeholder": "Search properties...",
      "clearSearch": "Clear search",
      "searchAria": "Search properties",
      "noResults": "No properties found",
      "resultsCount": "{count, plural, one {# property} other {# properties}} found"
    }
  }
}
```

---

#### Task 1.10: Add Dashboard Portfolio Keys
**File**: `/messages/en.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

Add the following keys under `dashboard.portfolio`:

```json
{
  "dashboard": {
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

---

#### Task 1.11: Add Properties Modal Keys
**File**: `/messages/en.json`
**Story Points**: 1
**Status**: [ ] Not Started

Add the following keys under `properties.modal`:

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

### Phase 2: Component Updates

#### Task 2.1: Update StatisticsCards Component
**File**: `/src/components/SimpleDashboard/StatisticsCards.tsx`
**Story Points**: 1
**Status**: [ ] Not Started
**Dependencies**: Tasks 1.1, 1.3

**Implementation Steps**:

1. Add import at top of file:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `StatisticsCards` function, add hook initialization:
```typescript
const t = useTranslations('dashboard.stats');
const tEmpty = useTranslations('dashboard.empty');
```

3. Update `cardConfigs` array - move inside component and use translation keys:
```typescript
const cardConfigs: StatCardConfig[] = [
  {
    key: 'itemCount',
    label: t('items'),
    // ...rest unchanged
  },
  {
    key: 'roomCount',
    label: t('rooms'),
    // ...rest unchanged
  },
  {
    key: 'tagCount',
    label: t('tags'),
    // ...rest unchanged
  }
];
```

4. Update `StatCard` aria-label (line ~90):
```typescript
aria-label={t('viewLabel', { label: config.label, value })}
```

5. Update `LoadingSkeleton` SkeletonBase label (line ~120):
```typescript
<SkeletonBase label={t('loading')}>
```

6. Update empty state EmptyStateCard (line ~217-223):
```typescript
<EmptyStateCard
  icon={Package}
  title={tEmpty('title')}
  description=""
  actionLabel={tEmpty('action')}
  onAction={onCreateItem}
  variant="default"
/>
```

7. Update property context display (line ~245):
```typescript
<span>{t('allProperties')}</span>
```

**Acceptance Criteria**:
- [ ] Import `useTranslations` added
- [ ] Hook initialized with 'dashboard.stats' namespace
- [ ] All 3 stat card labels translated
- [ ] Aria-labels use translation with interpolation
- [ ] Loading skeleton label translated
- [ ] Empty state title and action translated
- [ ] Property context "(all properties)" translated
- [ ] TypeScript compiles without errors

---

#### Task 2.2: Update PropertySection Component
**File**: `/src/components/SimpleDashboard/PropertySection.tsx`
**Story Points**: 2
**Status**: [ ] Not Started
**Dependencies**: Task 1.2

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. In `PropertySection` function, add:
```typescript
const t = useTranslations('dashboard.property');
```

3. Update heading text (line ~256):
```typescript
const headingText = userProperties?.length === 1 ? t('headingSingular') : t('heading');
```

4. Update `PropertyRow` component - pass translations as props or use hook inside:
   - Add `useTranslations` hook inside PropertyRow
   - Update aria-label (line ~54):
   ```typescript
   aria-label={t('editProperty', { name: property.nickname })}
   ```
   - Update item count display (line ~67):
   ```typescript
   {t('itemCount', { count: itemCount })}
   ```
   - Update room count display (line ~71):
   ```typescript
   {t('roomCount', { count: roomCount })}
   ```

5. Update `SinglePropertyCard` similarly:
   - aria-label (line ~175)
   - Item/room counts (lines ~192, ~196)

6. Update `PropertyEmptyState`:
   - title (line ~129): `t('emptyTitle')`
   - description (line ~130): `t('emptyDescription')`
   - actionLabel (line ~131): `t('addProperty')`

7. Update `LoadingSkeleton` label (line ~89):
```typescript
<SkeletonBase label={t('loading')}>
```

8. Update "Add New Property" button text (line ~342):
```typescript
<span>{t('addNewProperty')}</span>
```

**Acceptance Criteria**:
- [ ] Dynamic heading works (singular vs plural)
- [ ] PropertyRow aria-labels translated with property name
- [ ] Item/room counts use ICU pluralization
- [ ] SinglePropertyCard translations work
- [ ] PropertyEmptyState fully translated
- [ ] Loading skeleton label translated
- [ ] Add button text translated

---

#### Task 2.3: Update ActionButtons Component
**File**: `/src/components/SimpleDashboard/ActionButtons.tsx`
**Story Points**: 1
**Status**: [ ] Not Started
**Dependencies**: Task 1.4

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `ActionButtons` function, add:
```typescript
const t = useTranslations('dashboard.actions');
```

3. Move `buttonConfigs` inside component and update:
```typescript
const buttonConfigs: ActionButtonConfig[] = [
  {
    key: 'create',
    label: t('newQRCodeItem'),
    icon: PlusCircle,
    variant: 'primary',
    onClick: onCreateClick || (() => router.push('/dashboard2/create')),
    ariaLabel: t('createNewItem'),
  },
  {
    key: 'view',
    label: t('viewQRCodeItems'),
    icon: Package,
    variant: 'secondary',
    onClick: onViewClick || (() => router.push('/dashboard2/items')),
    ariaLabel: t('viewAllItems'),
  },
  {
    key: 'print',
    label: t('printQRCode'),
    icon: QrCode,
    variant: 'secondary',
    onClick: handlePrintQRCode,
    ariaLabel: t('printCodes'),
  },
];
```

**Acceptance Criteria**:
- [ ] All 3 button labels translated
- [ ] All 3 aria-labels translated
- [ ] buttonConfigs moved inside component to access `t()`

---

#### Task 2.4: Update EmptyStateCard Component
**File**: `/src/components/SimpleDashboard/EmptyStateCard.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started

**Implementation Steps**:

This component receives translated strings via props, so minimal changes needed:

1. Verify no hardcoded strings exist in the component itself
2. aria-label composition (line ~87) already uses props correctly:
```typescript
aria-label={`${title}. ${description}`}
```

**Note**: Callers must pass already-translated strings via `title`, `description`, and `actionLabel` props.

**Acceptance Criteria**:
- [ ] Verified no hardcoded user-facing strings
- [ ] All parent components updated to pass translated props

---

#### Task 2.5: Update PropertyEditModal Component
**File**: `/src/components/SimpleDashboard/PropertyEditModal.tsx`
**Story Points**: 2
**Status**: [ ] Not Started
**Dependencies**: Task 1.11

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `PropertyEditModal` function, add:
```typescript
const t = useTranslations('properties');
```

3. Update validation messages in `validateForm` function:
   - Move validation inside component OR create a function that takes `t` as parameter
   - Update error messages:
   ```typescript
   errors.name = t('form.propertyNameRequired');
   errors.name = t('form.propertyNameMaxLength');
   errors.addressLine1 = t('form.addressLine1MaxLength');
   // ... etc
   errors.country = t('form.invalidCountry');
   ```

4. Update Dialog.Title (line ~396):
```typescript
{t('modal.editTitle')}
```

5. Update Dialog.Description (line ~399):
```typescript
{t('modal.editDescription')}
```

6. Update close button aria-label (line ~413):
```typescript
aria-label={t('modal.closeModal')}
```

7. Update screen reader announcement (line ~424):
```typescript
{isSubmitting && t('modal.savingProperty')}
```

8. Update form field labels - update `renderTextField` calls:
```typescript
{renderTextField('name', t('form.propertyName'), formData.name, {
  required: true,
  maxLength: 100,
  placeholder: t('form.propertyNamePlaceholder'),
})}
```

9. Update Country dropdown:
   - Label (line ~480): `{t('form.country')}`
   - First option "Select country..." (line ~498):
   ```typescript
   { code: '', label: t('form.selectCountry') }
   ```
   **Note**: Consider using `Intl.DisplayNames` for country names in future enhancement

10. Update Cancel button text (line ~529):
```typescript
Cancel → {t('common.cancel')}
```
Or use common namespace.

11. Update Save button text (lines ~549, ~553):
```typescript
<span>{t('modal.saving')}</span>
// OR
<span>{t('modal.saveChanges')}</span>
```

**Acceptance Criteria**:
- [ ] Modal title "Edit Property" translated
- [ ] Modal description translated
- [ ] All form field labels translated
- [ ] All placeholder texts translated
- [ ] All validation error messages translated
- [ ] Cancel and Save button text translated
- [ ] Screen reader announcements translated
- [ ] Close button aria-label translated

---

#### Task 2.6: Update AddPropertyModal Component
**File**: `/src/components/SimpleDashboard/AddPropertyModal.tsx`
**Story Points**: 2
**Status**: [ ] Not Started
**Dependencies**: Task 1.11

**Implementation Steps**:

Same pattern as Task 2.5 but with "Add" variations:

1. Add import and hook initialization

2. Update Dialog.Title (line ~370):
```typescript
{t('modal.addTitle')}
```

3. Update Dialog.Description (line ~374):
```typescript
{t('modal.addDescription')}
```

4. Update screen reader announcement (line ~400):
```typescript
{isSubmitting && t('modal.creatingProperty')}
```

5. Update all form field labels and placeholders (same as Task 2.5)

6. Update Create button text (lines ~526, ~529):
```typescript
<span>{t('modal.creating')}</span>
// OR
<span>{t('modal.createProperty')}</span>
```

**Acceptance Criteria**:
- [ ] Modal title "Add New Property" translated
- [ ] Modal description translated
- [ ] All form fields translated
- [ ] Creating button state text translated
- [ ] Create Property button text translated

---

#### Task 2.7: Update LoadingIndicator Component
**File**: `/src/components/SimpleDashboard/LoadingIndicator.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started

**Implementation Steps**:

The component has a default `label` prop of "Loading". Options:

**Option A (Recommended)**: Keep default, callers pass translated label
- Document that callers should use `t('common.loading')` when calling

**Option B**: Use translation in component
- Note: Component is used across both client and server contexts
- If client-only usage confirmed:
```typescript
import { useTranslations } from 'next-intl';

export function LoadingIndicator({
  size = 'md',
  label, // Make optional, derive from translation
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  const t = useTranslations('common');
  const displayLabel = label ?? t('loading');
  // ...
}
```

**Decision**: Use Option A for simplicity and server component compatibility.

**Acceptance Criteria**:
- [ ] Document that callers should pass translated label
- [ ] Existing callers updated to pass translated label

---

#### Task 2.8: Update PortfolioSummary Component
**File**: `/src/components/SimpleDashboard/PortfolioSummary.tsx`
**Story Points**: 1
**Status**: [ ] Not Started
**Dependencies**: Task 1.10

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `PortfolioSummary` function, add:
```typescript
const t = useTranslations('dashboard.portfolio');
```

3. Update LoadingSkeleton label (line ~32):
```typescript
<SkeletonBase label={t('loading')}>
```

4. Update heading (line ~122):
```typescript
<h2 className="text-xl font-semibold">{t('title')}</h2>
```

5. Update SummaryStat labels (lines ~128-141):
```typescript
<SummaryStat
  value={propertyCount}
  label={t('totalProperties')}
  icon={<Building2 className="w-4 h-4" />}
/>
<SummaryStat
  value={totalItems}
  label={t('totalItems')}
  icon={<Activity className="w-4 h-4" />}
/>
<SummaryStat
  value={avgItemsPerProperty}
  label={t('avgItemsPerProperty')}
  icon={<TrendingUp className="w-4 h-4" />}
/>
```

6. Update insight text (line ~147-149):
```typescript
<p className="text-sm text-white/70">
  {t('insightText', { rooms: totalRooms, properties: propertyCount })}
</p>
```

**Acceptance Criteria**:
- [ ] Heading "Portfolio Overview" translated
- [ ] All 3 stat labels translated
- [ ] Insight text uses ICU pluralization
- [ ] Loading skeleton label translated

---

#### Task 2.9: Update DashboardSettingsPopover Component
**File**: `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx`
**Story Points**: 1
**Status**: [ ] Not Started
**Dependencies**: Task 1.5

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `DashboardSettingsPopover` function, add:
```typescript
const t = useTranslations('dashboard.settings');
```

3. Update button aria-label (line ~149):
```typescript
aria-label={t('title')}
```

4. Update popover aria-label (line ~162):
```typescript
aria-label={t('title')}
```

5. Update header title (line ~166):
```typescript
{t('title')}
```

6. Update close button aria-label (line ~173):
```typescript
aria-label={t('close')}
```

7. Update ToggleSwitch labels (lines ~185-194):
```typescript
<ToggleSwitch
  id="forceAdvancedTools"
  checked={preferences.forceAdvancedTools}
  onChange={handleAdvancedToolsChange}
  label={t('showAdvancedTools')}
  description={t('advancedToolsDescription')}
/>
<ToggleSwitch
  id="forcePortfolioView"
  checked={preferences.forcePortfolioView}
  onChange={handlePortfolioViewChange}
  label={t('showPortfolioSummary')}
  description={t('portfolioDescription')}
/>
```

8. Update footer hint (line ~199-201):
```typescript
<p className="text-xs text-[#717171]">
  {t('overrideHint')}
</p>
```

**Acceptance Criteria**:
- [ ] "Dashboard Settings" heading translated
- [ ] Both toggle labels translated
- [ ] Both toggle descriptions translated
- [ ] Footer hint text translated
- [ ] All aria-labels translated

---

#### Task 2.10: Update AdvancedDashboardTools Component
**File**: `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started
**Dependencies**: Task 1.6

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `AdvancedDashboardTools` function, add:
```typescript
const t = useTranslations('dashboard.advanced');
```

3. Update mobile heading (line ~98-99):
```typescript
<span
  id="advanced-tools-heading"
  className="text-lg font-semibold text-[#222222]"
>
  {t('title')}
</span>
```

4. Update desktop heading (line ~114-116):
```typescript
<h2
  id="advanced-tools-heading-desktop"
  className="text-lg font-semibold text-[#222222]"
>
  {t('title')}
</h2>
```

**Acceptance Criteria**:
- [ ] "Advanced Tools" heading translated (both mobile and desktop)

---

#### Task 2.11: Update BulkOperationsToolbar Component
**File**: `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx`
**Story Points**: 1
**Status**: [ ] Not Started
**Dependencies**: Task 1.7

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `BulkOperationsToolbar` function, add:
```typescript
const t = useTranslations('dashboard.bulk');
```

3. Update checkbox button aria-label (line ~78):
```typescript
aria-label={allSelected ? t('deselectAllAria') : t('selectAllAria')}
```

4. Update checkbox label text (line ~85-87):
```typescript
<span className="text-sm text-[#222222]">
  {allSelected ? t('allSelected') : t('selectAll')}
</span>
```

5. Update selected count display (line ~93-94):
```typescript
<span className="text-sm font-medium text-[#222222]">
  {t('selected', { count: selectedCount })}
</span>
```

6. Update clear selection aria-label (line ~100):
```typescript
aria-label={t('clearSelection')}
```

7. Update Print Selected button (lines ~116, ~119):
```typescript
aria-label={t('printSelectedAria', { count: selectedCount })}
// ...
<span>{t('printSelected')}</span>
```

**Acceptance Criteria**:
- [ ] "Select all" / "All selected" toggle text translated
- [ ] "{count} selected" translated with interpolation
- [ ] "Print Selected" button translated
- [ ] All aria-labels translated with dynamic counts

---

#### Task 2.12: Update PropertyGroupingControl Component
**File**: `/src/components/SimpleDashboard/PropertyGroupingControl.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started
**Dependencies**: Task 1.8

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `PropertyGroupingControl` function, add:
```typescript
const t = useTranslations('dashboard.grouping');
```

3. Move `GROUPING_OPTIONS` inside component:
```typescript
const GROUPING_OPTIONS: { value: GroupingOption; label: string }[] = [
  { value: 'none', label: t('none') },
  { value: 'location', label: t('location') },
  { value: 'itemCount', label: t('itemCount') },
];
```

4. Update label text (line ~69):
```typescript
{t('label')}
```

**Acceptance Criteria**:
- [ ] "Group by" label translated
- [ ] All 3 grouping options translated
- [ ] GROUPING_OPTIONS moved inside component

---

#### Task 2.13: Update PropertySearchBar Component
**File**: `/src/components/SimpleDashboard/PropertySearchBar.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started
**Dependencies**: Task 1.9

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `PropertySearchBar` function, add:
```typescript
const t = useTranslations('dashboard.search');
```

3. Update default placeholder handling:
```typescript
// Option A: Default to translated value
const displayPlaceholder = placeholder || t('placeholder');
```

4. Update input aria-label (line ~114):
```typescript
aria-label={t('searchAria')}
```

5. Update clear button aria-label (line ~123):
```typescript
aria-label={t('clearSearch')}
```

**Acceptance Criteria**:
- [ ] Default placeholder translated
- [ ] Search input aria-label translated
- [ ] Clear button aria-label translated

---

#### Task 2.14: Update ProgressivePropertySection Component
**File**: `/src/components/SimpleDashboard/ProgressivePropertySection.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started
**Dependencies**: Task 1.9

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `ProgressivePropertySection` function, add:
```typescript
const t = useTranslations('dashboard.search');
```

3. Update search bar placeholder (line ~80):
```typescript
<PropertySearchBar
  onSearch={handleSearch}
  placeholder={t('placeholder')}
/>
```

4. Update search results text (lines ~87-91):
```typescript
<p className="text-sm text-[#717171]">
  {filteredProperties.length === 0
    ? t('noResults')
    : t('resultsCount', { count: filteredProperties.length })}
</p>
```

**Acceptance Criteria**:
- [ ] Search placeholder translated
- [ ] "No properties found" translated
- [ ] "{count} properties found" translated with pluralization

---

#### Task 2.15: Update ProgressiveStatisticsSection Component
**File**: `/src/components/SimpleDashboard/ProgressiveStatisticsSection.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started

**Implementation Steps**:

1. Add import:
```typescript
import { useTranslations } from 'next-intl';
```

2. Inside `ProgressiveStatisticsSection` function, add:
```typescript
const t = useTranslations('dashboard');
```

3. Update comparison hint text (line ~79-81):
```typescript
<p className="text-sm text-[#717171]">
  {t('comparisonHint')}
</p>
```

**Note**: Add key `dashboard.comparisonHint` with value:
`"Use the property selector to compare statistics across your properties."`

**Acceptance Criteria**:
- [ ] Comparison hint text translated

---

#### Task 2.16: Update Skeleton Components
**Files**: `/src/components/SimpleDashboard/skeletons/*.tsx`
**Story Points**: 0.5
**Status**: [ ] Not Started

**Implementation Steps**:

For `SkeletonBase.tsx` (line ~36):
- Note: Default label "Loading content" is used as fallback
- Callers should pass translated `label` prop
- No changes needed to component itself

For `SkeletonText.tsx` and `SkeletonCard.tsx`:
- Review for any hardcoded strings
- Update if needed

**Acceptance Criteria**:
- [ ] Verified no hardcoded user-facing strings
- [ ] Document that callers pass translated labels

---

### Phase 3: Translation Generation

#### Task 3.1: Generate French Translations
**File**: `/messages/fr.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

Generate French translations for all new `dashboard.*` and `properties.*` keys.

**Sample translations**:
- "Items" → "Articles"
- "Rooms" → "Pièces"
- "Tags" → "Étiquettes"
- "My Properties" → "Mes propriétés"
- "Add New Property" → "Ajouter une propriété"
- "Portfolio Overview" → "Vue d'ensemble du portfolio"
- "Print Selected" → "Imprimer la sélection"

---

#### Task 3.2: Generate Spanish Translations
**File**: `/messages/es.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

---

#### Task 3.3: Generate German Translations
**File**: `/messages/de.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

---

#### Task 3.4: Generate Dutch Translations
**File**: `/messages/nl.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

---

#### Task 3.5: Generate Italian Translations
**File**: `/messages/it.json`
**Story Points**: 0.5
**Status**: [ ] Not Started

---

### Phase 4: Testing and Verification

#### Task 4.1: TypeScript Compilation Check
**Story Points**: 0.25
**Status**: [ ] Not Started

```bash
npm run build
```

**Acceptance Criteria**:
- [ ] Build completes without TypeScript errors
- [ ] No missing translation key type errors

---

#### Task 4.2: Visual Testing in All Languages
**Story Points**: 1
**Status**: [ ] Not Started

Manual testing checklist:
- [ ] Test dashboard in English (baseline)
- [ ] Test dashboard in French
- [ ] Test dashboard in Spanish
- [ ] Test dashboard in German
- [ ] Test dashboard in Dutch
- [ ] Test dashboard in Italian

For each language:
- [ ] StatisticsCards display correctly
- [ ] PropertySection displays correctly
- [ ] ActionButtons display correctly
- [ ] Settings popover displays correctly
- [ ] Portfolio summary displays correctly
- [ ] Bulk operations toolbar displays correctly
- [ ] Modals open and display correctly
- [ ] No text overflow or layout breaks

---

#### Task 4.3: Pluralization Testing
**Story Points**: 0.5
**Status**: [ ] Not Started

Test pluralization with:
- [ ] 0 items/rooms/properties
- [ ] 1 item/room/property
- [ ] 2+ items/rooms/properties

Verify all languages handle plurals correctly.

---

#### Task 4.4: Dynamic Value Testing
**Story Points**: 0.5
**Status**: [ ] Not Started

Test dynamic interpolation:
- [ ] "{count} selected" shows correct count
- [ ] "Edit property: {name}" shows property name
- [ ] "Print {count} selected properties" shows correct count

---

#### Task 4.5: Accessibility Testing
**Story Points**: 0.5
**Status**: [ ] Not Started

Screen reader testing:
- [ ] All aria-labels announce correctly in each language
- [ ] Loading states announce correctly
- [ ] Modal focus management works

---

#### Task 4.6: Language Switching Testing
**Story Points**: 0.5
**Status**: [ ] Not Started

- [ ] Change language while on dashboard
- [ ] Verify all text updates immediately
- [ ] No page refresh required
- [ ] State preserved during language change

---

## Task Summary

| Phase | Tasks | Story Points |
|-------|-------|--------------|
| Phase 1: Translation Keys | 11 tasks | 5.0 |
| Phase 2: Component Updates | 16 tasks | 13.5 |
| Phase 3: Translation Generation | 5 tasks | 2.5 |
| Phase 4: Testing | 6 tasks | 3.25 |
| **Total** | **38 tasks** | **24.25** |

---

## Implementation Order (Critical Path)

1. **Week 1 - Foundation**
   - Tasks 1.1-1.11: Add all translation keys to en.json
   - Task 2.3: Update ActionButtons (simplest component)
   - Task 2.4: Update EmptyStateCard (minimal changes)

2. **Week 1-2 - Core Components**
   - Task 2.1: Update StatisticsCards
   - Task 2.2: Update PropertySection (complex)
   - Task 2.8: Update PortfolioSummary

3. **Week 2 - Modals**
   - Task 2.5: Update PropertyEditModal
   - Task 2.6: Update AddPropertyModal

4. **Week 2 - Advanced Features**
   - Task 2.9: Update DashboardSettingsPopover
   - Task 2.10: Update AdvancedDashboardTools
   - Task 2.11: Update BulkOperationsToolbar
   - Task 2.12: Update PropertyGroupingControl
   - Task 2.13: Update PropertySearchBar

5. **Week 2 - Progressive Components**
   - Task 2.14: Update ProgressivePropertySection
   - Task 2.15: Update ProgressiveStatisticsSection
   - Task 2.16: Review Skeleton Components

6. **Week 3 - Translations & Testing**
   - Tasks 3.1-3.5: Generate non-English translations
   - Tasks 4.1-4.6: Testing and verification

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing translation keys at runtime | Run TypeScript build before testing |
| Layout breaks with German text | Test early with German translations |
| Modal form validation errors not translated | Validate `validateForm` function updates |
| Pluralization doesn't work | Test with 0, 1, 2+ counts |
| Country names not localized | Document as future enhancement using `Intl.DisplayNames` |

---

## Definition of Done

- [ ] All 18 SimpleDashboard component files updated
- [ ] 224+ strings replaced with translation function calls
- [ ] All aria-labels internationalized
- [ ] Pluralization uses ICU format
- [ ] All 6 language files contain complete keys
- [ ] TypeScript compiles without errors
- [ ] No console warnings for missing keys
- [ ] Language switching updates all text immediately
- [ ] Screen readers announce correctly in all languages

---

## References

- [Overview Document](/docs/REQ-367-update-all-simpledashboard-components-overview.md)
- [Epic 2 Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2B (Dashboard & Navigation) - Task 2B.4*
