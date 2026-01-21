# REQ-E02-006: Extract Empty State Messages - Detailed Task Breakdown

*Generated: 2026-01-20 17:15:00 UTC*
*Last Modified: 2026-01-20 17:15:00 UTC*

## Document References

| Document | Path |
|----------|------|
| Overview | `docs/REQ-E02-006-extract-empty-state-messages-overview.md` |
| Request | `docs/gen_requests_epic2.md` (Request #6) |
| Implementation Plan | `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` |
| Epic | Localization Epic 2 - Static UI Translation |
| Sub-Epic | 2H - Common & Shared Components |
| Task ID | 2H.6 |

---

## Summary

This task extracts ~80 hardcoded empty state messages from ~20+ component locations and replaces them with localized translation references using the `common.emptyStates` namespace. Empty states are critical UX elements that provide feedback when lists, grids, or content areas have no data.

---

## Prerequisites

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Epic 1 Complete | Required | next-intl foundation must be in place |
| REQ-E02-001 Complete | Required | Common namespace structure must exist |
| `/messages/en.json` exists | Required | Base translation file |
| `useTranslations` hook available | Required | From next-intl |

---

## Task Breakdown

### TASK-001: Create Empty States Namespace Structure

**Priority:** High (Blocker)
**Estimated Points:** 1
**File:** `/messages/en.json`

#### Description
Add the `common.emptyStates` namespace to the English translation file with all categorized empty state strings.

#### Implementation Steps

1. Open `/messages/en.json`
2. Locate the existing `common` namespace (created by REQ-E02-001)
3. Add the `emptyStates` sub-namespace with all categories:
   - `generic` - Reusable across contexts
   - `items` - Item-related empty states
   - `guides` - Guide/instruction empty states
   - `properties` - Property-related empty states
   - `dashboard` - Dashboard-specific empty states
   - `resources` - Resource/content empty states
   - `qrCodes` - QR code generation empty states
   - `analytics` - Analytics data empty states
   - `session` - Workflow session empty states
   - `accessRequests` - Admin access request empty states
   - `cta` - Call-to-action buttons

#### Code to Add

```json
{
  "common": {
    "emptyStates": {
      "generic": {
        "noData": "No data available",
        "noResults": "No results found",
        "noResultsSearch": "No results match your search",
        "noResultsFilter": "No results match your filters",
        "tryAdjusting": "Try adjusting your search or filters"
      },
      "items": {
        "title": "No items yet",
        "description": "Create your first item to get started",
        "descriptionAlt": "Get started by creating your first item",
        "noItemsFound": "No items found",
        "noItemsSearchMatch": "No items match your search for \"{searchTerm}\"",
        "noItemsAvailable": "No items available",
        "noItemsForProperty": "There are no items to display for this property.",
        "noItemsProperty": "No items"
      },
      "guides": {
        "title": "No guides yet",
        "titleNotFound": "No guides found",
        "description": "Create items and add guide articles to get started. Guides help guests understand how things work.",
        "descriptionItem": "Guides for this item will appear here",
        "noGuides": "No guides.",
        "noGuidesAvailable": "No guides available",
        "noGuidesProvided": "No guides provided.",
        "noGuidesAdded": "No guides added."
      },
      "properties": {
        "title": "No properties yet",
        "titleNotFound": "No Properties Found",
        "titleAdd": "Let's add your property",
        "description": "A property is where your items live - like a vacation rental or home.",
        "descriptionCreate": "Get started by creating your first property.",
        "descriptionSearchNoMatch": "No properties match your search criteria.",
        "noPropertiesAvailable": "No properties available",
        "noPropertiesFound": "No properties found"
      },
      "dashboard": {
        "welcome": {
          "title": "Welcome to FAQBNB!",
          "description": "Get started by adding your first property. Then you can create QR codes to help guests find what they need."
        },
        "noContent": {
          "title": "Start adding new QR Code items and create guides/instructions",
          "description": "Create your first item to get started"
        }
      },
      "resources": {
        "title": "No Resources Available",
        "description": "No resources available for this item."
      },
      "qrCodes": {
        "title": "No QR codes generated yet",
        "noCodesForExport": "No QR codes available for PDF export.",
        "generateFirst": "No QR codes available for PDF export. Please generate QR codes first."
      },
      "analytics": {
        "noEngagement": "No engagement data available",
        "noDailyViews": "No daily view data available",
        "noReactions": "No reactions data available",
        "noReactionsYet": "No reactions yet",
        "noAnalyticsData": "No analytics data available"
      },
      "session": {
        "title": "No Items Added",
        "description": "No items added yet. Add items or exit session?",
        "descriptionAlt": "You haven't created any items in this session yet. Start by adding your first item.",
        "addItems": "Add Items",
        "addFirstItem": "Add First Item",
        "exitSession": "Exit Session"
      },
      "accessRequests": {
        "title": "No access requests found",
        "description": "No access requests have been submitted yet"
      },
      "locations": {
        "noLocationsAvailable": "No locations available"
      },
      "tags": {
        "noTagsAvailable": "No tags available"
      },
      "cta": {
        "createItem": "Create Item",
        "createFirstItem": "Create Your First Item",
        "newQRCodeItem": "New QR Code Item",
        "addProperty": "Add Property",
        "createGuide": "Create Guide",
        "clearFilters": "Clear Filters"
      }
    }
  }
}
```

#### Verification
- [x] All categories are present in the namespace ---implemented:Added emptyStates namespace with all 13 categories (generic, items, guides, properties, dashboard, resources, qrCodes, analytics, session, accessRequests, locations, tags, cta) to en.json---
- [x] JSON is valid (no syntax errors) -unit tested-
- [x] Keys follow camelCase convention
- [x] ICU format used for interpolation (`{searchTerm}`)

---

### TASK-002: Add Empty States Namespace to Other Language Files

**Priority:** High (Blocker)
**Estimated Points:** 1
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

#### Description
Add the same `common.emptyStates` namespace structure to all non-English language files with English placeholders (actual translations will be generated in Task 2H.10).

#### Implementation Steps

1. Copy the `common.emptyStates` object from `en.json`
2. Paste into each language file within the `common` namespace
3. Verify JSON validity

#### Verification
- [x] All 5 language files have identical key structure to en.json ---implemented:Added emptyStates namespace with all 13 categories to fr.json, es.json, de.json, nl.json, it.json---
- [x] JSON is valid in all files -unit tested-
- [x] No missing keys in any file

---

### TASK-003: Update ItemManager EmptyState Component

**Priority:** High
**Estimated Points:** 1
**File:** `/src/components/ItemManager/components/shared/EmptyState.tsx`
**Lines to Modify:** 23-24, 47-53

#### Description
Update the reusable EmptyState component to use translations for default title and description values.

#### Current Code (Lines 23-24)
```typescript
const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';
```

#### Updated Code
```typescript
import { useTranslations } from 'next-intl';

// Remove DEFAULT_TITLE and DEFAULT_DESCRIPTION constants

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const tEmpty = useTranslations('common.emptyStates');

  const effectiveTitle = title ?? tEmpty('items.title');
  const effectiveDescription = description ?? tEmpty('items.description');

  return (
    <div
      role="status"
      aria-label={`${effectiveTitle}. ${effectiveDescription}`}
      className={cn('text-center py-12', className)}
    >
      {/* Icon container - decorative */}
      <div className="text-gray-400 mb-4 flex justify-center" aria-hidden="true">
        {icon ?? <Package className="w-12 h-12" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {effectiveTitle}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {effectiveDescription}
      </p>

      {/* Optional action CTA */}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
```

#### Verification
- [x] `useTranslations` imported from 'next-intl' ---implemented:Added useTranslations import, removed DEFAULT constants, added tEmpty hook and effectiveTitle/effectiveDescription variables with null coalescing---
- [x] DEFAULT constants removed
- [x] Null coalescing used for props
- [x] ARIA label uses translated strings
- [x] Component renders correctly with default translation -unit tested-

---

### TASK-004: Update Dashboard2 Page Empty State

**Priority:** High
**Estimated Points:** 1
**File:** `/src/app/dashboard2/page.tsx`
**Lines to Modify:** Around line 175+ (EmptyStateCard usage)

#### Description
Update the dashboard page's welcome empty state for new users to use translations.

#### Implementation Steps

1. Add `useTranslations` import
2. Create translation instance: `const tEmpty = useTranslations('common.emptyStates');`
3. Update EmptyStateCard props to use translation calls

#### Code Pattern
```typescript
import { useTranslations } from 'next-intl';

// Inside component:
const tEmpty = useTranslations('common.emptyStates');

// Replace EmptyStateCard usage:
<EmptyStateCard
  icon={Home}
  title={tEmpty('dashboard.welcome.title')}
  description={tEmpty('dashboard.welcome.description')}
  actionLabel={tEmpty('cta.addProperty')}
  onAction={handleCreateProperty}
  variant="welcome"
/>
```

#### Verification
- [x] Welcome empty state displays translated text ---implemented:Added tEmpty and tActions hooks, replaced hardcoded EmptyStateCard title/description/actionLabel with translation calls---
- [x] CTA button text is translated
- [x] No console warnings about missing keys -unit tested-

---

### TASK-005: Update SimpleDashboard StatisticsCards

**Priority:** High
**Estimated Points:** 1
**File:** `/src/components/SimpleDashboard/StatisticsCards.tsx`

#### Description
Update the statistics cards empty state messages to use translations.

#### Implementation Steps

1. Add `useTranslations` import
2. Replace hardcoded empty state text with translation calls

#### Verification
- [x] Empty state title uses translation ---implemented:Added tEmpty and tActions hooks, replaced hardcoded title with tEmpty('dashboard.noContent.title') and actionLabel with tActions('newQrCodeItem')---
- [x] Component builds without errors -unit tested-

---

### TASK-006: Update SimpleDashboard PropertySection

**Priority:** High
**Estimated Points:** 1
**File:** `/src/components/SimpleDashboard/PropertySection.tsx`
**Reference:** Line 117 comment about REQ-137 empty state

#### Description
Update the property section's empty state when user has no properties.

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

<EmptyStateCard
  icon={Home}
  title={tEmpty('properties.titleAdd')}
  description={tEmpty('properties.description')}
  actionLabel={tEmpty('cta.addProperty')}
  onAction={handleCreateProperty}
/>
```

#### Verification
- [x] "Let's add your property" text translated ---implemented:Added tEmpty and tActions hooks to PropertyEmptyState, replaced title/description/actionLabel with translation calls---
- [x] Property description translated
- [x] "Add Property" button text translated -unit tested-

---

### TASK-007: Update ItemManager Configuration Labels

**Priority:** High
**Estimated Points:** 2
**File:** `/src/components/ItemManager/ItemManager.tsx`
**Lines to Modify:** 57-58, 591

#### Description
Update the ItemManager's default configuration labels and inline empty state messages.

#### Current Code (Lines 57-58)
```typescript
emptyStateTitle: 'No items yet',
// Line 591: "Try adjusting your search or filters"
```

#### Implementation Steps

1. Add `useTranslations` import
2. Replace hardcoded config labels
3. Update the "no results" description text

#### Verification
- [x] Default config uses translated empty state title ---implemented:Added useTranslations hook, updated no results EmptyState to use tEmpty('generic.noResults') and tEmpty('generic.tryAdjusting')---
- [x] "Try adjusting your search or filters" is translated
- [x] Component functions correctly with translations -unit tested-

---

### TASK-008: Update ItemsManagement Component

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemsManagement.tsx`
**Lines to Modify:** 116-117, 284

#### Description
Update the ItemsManagement component's default props and search empty state.

#### Current Code
```typescript
// Line 116-117
emptyStateTitle = 'No items yet',
// Line 284
{searchTerm ? 'No items found' : emptyStateTitle}
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

// In render:
{searchTerm ? tEmpty('items.noItemsFound') : tEmpty('items.title')}
```

#### Verification
- [x] Default empty state title translated ---implemented:Added useTranslations hook, created effectiveEmptyTitle/effectiveEmptyDescription with null coalescing, replaced searchTerm messages with tEmpty calls---
- [x] Search "No items found" text translated
- [x] Conditional logic preserved -unit tested-

---

### TASK-009: Update ItemSelectionList Component

**Priority:** Medium
**Estimated Points:** 2
**File:** `/src/components/ItemSelectionList.tsx`
**Lines to Modify:** 203-204, 228-229

#### Description
Update multiple empty state variations in the item selection list.

#### Current Code
```typescript
// Lines 203-204
<p className="text-lg font-medium mb-2">No items found</p>
// Note: Search match message uses interpolation

// Lines 228-229
<p className="text-lg font-medium mb-2">No items available</p>
<p>There are no items to display for this property.</p>
```

#### Implementation Steps

1. Add `useTranslations` import
2. Replace "No items found" with `tEmpty('items.noItemsFound')`
3. Replace search match message with ICU interpolation: `tEmpty('items.noItemsSearchMatch', { searchTerm })`
4. Replace "No items available" with `tEmpty('items.noItemsAvailable')`
5. Replace property-specific message with `tEmpty('items.noItemsForProperty')`

#### Verification
- [x] All 4 empty state variations translated ---implemented:Added useTranslations hook, replaced 'No items found', 'No items match your search...', 'No items available', and 'There are no items...' with tEmpty calls including ICU interpolation---
- [x] Search term interpolation works correctly
- [x] No hardcoded text remains -unit tested-

---

### TASK-010: Update Dashboard Items Page

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard/items/page.tsx`
**Lines to Modify:** 331-332

#### Description
Update the items page empty state props.

#### Current Code (Line 331-332)
```typescript
emptyStateTitle="No items yet"
```

#### Implementation Steps

1. Add `useTranslations` import
2. Replace prop with: `emptyStateTitle={tEmpty('items.title')}`

#### Verification
- [x] Items page empty state translated ---implemented:Dashboard2 items page uses ItemManager which inherits translations. Legacy /dashboard/items/ not modified per CRITICAL PATH WARNING---
- [x] Component builds without errors -unit tested-

---

### TASK-011: Update GuideGrid Component

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/InstructionsTable/GuideGrid.tsx`
**Lines to Modify:** 100-101

#### Description
Update the guide grid's empty state when no guides are found.

#### Current Code (Lines 100-101)
```typescript
<p className="text-lg font-medium text-gray-900">No guides found</p>
<p className="text-sm mt-1">Try adjusting your search or filters</p>
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

<p className="text-lg font-medium text-gray-900">{tEmpty('guides.titleNotFound')}</p>
<p className="text-sm mt-1">{tEmpty('generic.tryAdjusting')}</p>
```

#### Verification
- [x] "No guides found" text translated ---implemented:Added useTranslations hook, replaced hardcoded 'No guides found' with tEmpty('guides.titleNotFound') and 'Try adjusting...' with tEmpty('generic.tryAdjusting')---
- [x] "Try adjusting..." text uses generic namespace for reuse
- [x] Styling preserved -unit tested-

---

### TASK-012: Update Instructions Page Empty State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard2/instructions/page.tsx`
**Lines to Modify:** 289-292

#### Description
Update the instructions page empty state when user has no guides.

#### Current Code (Lines 289-292)
```typescript
<h2 className="text-2xl font-bold text-gray-900 mb-3">No guides yet</h2>
// Description about creating items and adding guides
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

<h2 className="text-2xl font-bold text-gray-900 mb-3">{tEmpty('guides.title')}</h2>
<p>{tEmpty('guides.description')}</p>
```

#### Verification
- [x] "No guides yet" heading translated ---implemented:Added tEmpty and tActions hooks, replaced 'No guides yet' with tEmpty('guides.title'), description with tEmpty('guides.description'), and CTA with tEmpty('cta.createFirstItem')---
- [x] Description text translated
- [x] Layout preserved -unit tested-

---

### TASK-013: Update ItemInstructionsList Empty State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemEditForm/ItemInstructionsList.tsx`
**Lines to Modify:** 87

#### Description
Update the empty state when an item has no guides.

#### Current Code (Line 87)
```typescript
<p className="text-gray-500 font-medium">No guides yet</p>
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
<p className="text-gray-500 font-medium">{tEmpty('guides.title')}</p>
```

#### Verification
- [x] Item instructions empty state translated ---implemented:Added useTranslations hook, replaced 'No guides yet' with tEmpty('guides.title') and description with tEmpty('guides.descriptionItem')--- -unit tested-

---

### TASK-014: Update PropertySelector Empty State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/PropertySelector.tsx`
**Lines to Modify:** 295

#### Description
Update the property selector's empty state.

#### Current Code (Line 295)
```typescript
No properties available
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
{tEmpty('properties.noPropertiesAvailable')}
```

#### Verification
- [x] Selector empty state translated ---implemented:Added useTranslations hook, replaced 'No properties available' with tEmpty('properties.noPropertiesAvailable')--- -unit tested-

---

### TASK-015: Update PropertiesManagement Empty States

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/PropertiesManagement.tsx`
**Lines to Modify:** 319, 321

#### Description
Update the properties management empty states including search-no-match variation.

#### Current Code (Lines 319-321)
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-1">No Properties Found</h3>
{searchQuery ? 'No properties match your search criteria.' : 'Get started by creating your first property.'}
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

<h3 className="text-lg font-medium text-gray-900 mb-1">{tEmpty('properties.titleNotFound')}</h3>
<p>{searchQuery ? tEmpty('properties.descriptionSearchNoMatch') : tEmpty('properties.descriptionCreate')}</p>
```

#### Verification
- [x] Title translated ---implemented:Added useTranslations hook, replaced 'No Properties Found' with tEmpty('properties.titleNotFound') and conditional descriptions with tEmpty calls---
- [x] Both conditional description variations translated
- [x] Search logic preserved -unit tested-

---

### TASK-016: Update PropertyDropdown Empty State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/dashboard/PropertyDropdown.tsx`
**Lines to Modify:** 187

#### Description
Update the property dropdown's empty state.

#### Current Code (Line 187)
```typescript
No properties found
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
{tEmpty('properties.noPropertiesFound')}
```

#### Verification
- [x] Dropdown empty state translated ---implemented:Added useTranslations hook, replaced 'No properties found' with tEmpty('properties.noPropertiesFound')--- -unit tested-

---

### TASK-017: Update Print Page Empty State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/app/dashboard2/print/page.tsx`
**Lines to Modify:** 45

#### Description
Update the print page's "No Properties Yet" empty state.

#### Current Code (Line 45)
```typescript
No Properties Yet
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
{tEmpty('properties.title')}
```

#### Verification
- [ ] Print page empty state translated

---

### TASK-018: Update Analytics Page Empty States

**Priority:** Medium
**Estimated Points:** 2
**File:** `/src/app/dashboard/analytics/page.tsx`
**Lines to Modify:** 519, 591, 608

#### Description
Update all analytics page empty states for different data types.

#### Current Code
```typescript
// Line 519
<p>No engagement data available</p>
// Line 591
No daily view data available
// Line 608
No reactions data available
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

// Line 519
<p>{tEmpty('analytics.noEngagement')}</p>
// Line 591
{tEmpty('analytics.noDailyViews')}
// Line 608
{tEmpty('analytics.noReactions')}
```

#### Verification
- [ ] All 3 analytics empty states translated
- [ ] Conditional rendering preserved

---

### TASK-019: Update AnalyticsManagement Empty States

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/AnalyticsManagement.tsx`
**Lines to Modify:** 365, 437, 454

#### Description
Update the analytics management component's empty states (similar to analytics page).

#### Current Code
```typescript
// Line 365
<p>No engagement data available</p>
// Line 437
No daily view data available
// Line 454
No reactions data available
```

#### Verification
- [ ] All empty states translated
- [ ] Same keys used as analytics page for consistency

---

### TASK-020: Update ReactionAnalytics Empty State

**Priority:** Low
**Estimated Points:** 1
**File:** `/src/components/ReactionAnalytics.tsx`

#### Description
Update the reaction analytics "No reactions yet" empty state.

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
{tEmpty('analytics.noReactionsYet')}
```

#### Verification
- [ ] Empty state translated

---

### TASK-021: Update EmptySessionDialog

**Priority:** Medium
**Estimated Points:** 2
**File:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`

#### Description
Update the workflow's empty session dialog with translations for title, description, and buttons.

#### Implementation Steps

1. Add `useTranslations` import
2. Replace:
   - "No Items Added" -> `tEmpty('session.title')`
   - "No items added yet. Add items or exit session?" -> `tEmpty('session.description')`
   - "Add Items" -> `tEmpty('session.addItems')`
   - "Exit Session" -> `tEmpty('session.exitSession')`

#### Verification
- [ ] Dialog title translated
- [ ] Dialog message translated
- [ ] Both button labels translated

---

### TASK-022: Update SessionSummaryStep Empty State

**Priority:** Medium
**Estimated Points:** 1
**File:** `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
**Lines to Modify:** 81

#### Description
Update the session summary's empty state when no items have been created.

#### Current Code (Line 81)
```typescript
No items yet
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
{tEmpty('items.title')}
```

#### Verification
- [ ] Session summary empty state translated

---

### TASK-023: Update ItemDisplay Empty State

**Priority:** Low
**Estimated Points:** 1
**File:** `/src/components/ItemDisplay.tsx`
**Lines to Modify:** 239

#### Description
Update the item display's "no resources" empty state.

#### Current Code (Line 239)
```typescript
<p className="text-gray-500">No resources available for this item.</p>
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
<p className="text-gray-500">{tEmpty('resources.description')}</p>
```

#### Verification
- [ ] Resources empty state translated

---

### TASK-024: Update QRCodePrintManager Empty States

**Priority:** Low
**Estimated Points:** 1
**File:** `/src/components/QRCodePrintManager.tsx`
**Lines to Modify:** 324, 440

#### Description
Update the QR code print manager's empty state messages.

#### Current Code
```typescript
// Line 324
setLastError({ message: 'No QR codes available for PDF export. Please generate QR codes first.', isRetryable: false });
// Line 440
setLastError({ message: 'No QR codes available for PDF export.', isRetryable: false });
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

setLastError({ message: tEmpty('qrCodes.generateFirst'), isRetryable: false });
setLastError({ message: tEmpty('qrCodes.noCodesForExport'), isRetryable: false });
```

#### Verification
- [ ] Both QR code empty states translated

---

### TASK-025: Update InstructionsTable Empty State

**Priority:** Low
**Estimated Points:** 1
**File:** `/src/components/InstructionsTable/InstructionsTable.tsx`
**Lines to Modify:** 331

#### Description
Update the instructions table "No guides available" message.

#### Current Code (Line 331)
```typescript
No guides available
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
{tEmpty('guides.noGuidesAvailable')}
```

#### Verification
- [ ] Table empty state translated

---

### TASK-026: Update ItemRow ARIA Label

**Priority:** Low
**Estimated Points:** 1
**File:** `/src/components/ItemManager/components/ItemRow.tsx`
**Lines to Modify:** 347

#### Description
Update the item row's ARIA label "No guides." text.

#### Current Code (Line 347)
```typescript
${articlesCount !== undefined && articlesCount > 0 ? `${articlesCount} guides.` : 'No guides.'}
```

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');
${articlesCount !== undefined && articlesCount > 0 ? `${articlesCount} guides.` : tEmpty('guides.noGuides')}
```

#### Verification
- [ ] ARIA label uses translated text
- [ ] Screen readers announce translated content

---

### TASK-027: Update AccessRequestTable Empty State

**Priority:** Low
**Estimated Points:** 1
**File:** `/src/components/AccessRequestTable.tsx`

#### Description
Update the access request table's empty state messages.

#### Code Pattern
```typescript
const tEmpty = useTranslations('common.emptyStates');

// Empty state title
{tEmpty('accessRequests.title')}
// Empty state description
{tEmpty('accessRequests.description')}
```

#### Verification
- [ ] Access request empty states translated

---

### TASK-028: Update Filter Components Empty States

**Priority:** Low
**Estimated Points:** 1
**Files:**
- `/src/components/ItemManager/components/dialogs/LocationFilter.tsx` (Line 64)
- `/src/components/ItemManager/components/dialogs/TagFilter.tsx` (Line 64)

#### Description
Update the filter dialog "No locations/tags available" messages.

#### Implementation Steps

1. Add translations to both filter components
2. Replace default prop values with translation calls

#### Verification
- [ ] Location filter empty state translated
- [ ] Tag filter empty state translated

---

### TASK-029: Update Remaining Misc Components

**Priority:** Low
**Estimated Points:** 1
**Files to Check:**
- `/src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx` (Line 90)
- `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` (Line 114)
- `/src/components/ItemCapture/components/steps/ReviewStep.tsx` (Line 636)
- `/src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` (Lines 197, 518)

#### Description
Update any remaining empty state messages in miscellaneous components.

#### Verification
- [ ] All identified components updated
- [ ] No hardcoded empty state text remains

---

### TASK-030: Final Verification and Build Test

**Priority:** High (Gating)
**Estimated Points:** 1

#### Description
Run build verification and comprehensive testing to ensure all empty states work correctly.

#### Verification Steps

1. **Build Check**
   ```bash
   npm run build
   ```
   - [ ] Build completes without errors
   - [ ] No TypeScript errors related to translations

2. **Missing Key Check**
   - [ ] No console warnings about missing translation keys

3. **Visual Verification**
   - [ ] Test empty states in multiple components
   - [ ] Verify ARIA labels use translated content
   - [ ] Confirm ICU interpolation works (search term)

4. **Language Switch Test**
   - [ ] Empty states display translated text when locale changes

---

## Task Summary Table

| Task ID | Description | Priority | Points | File(s) |
|---------|-------------|----------|--------|---------|
| TASK-001 | Create emptyStates namespace in en.json | High | 1 | /messages/en.json |
| TASK-002 | Add namespace to other language files | High | 1 | /messages/*.json |
| TASK-003 | Update ItemManager EmptyState component | High | 1 | EmptyState.tsx |
| TASK-004 | Update Dashboard2 page empty state | High | 1 | dashboard2/page.tsx |
| TASK-005 | Update StatisticsCards empty state | High | 1 | StatisticsCards.tsx |
| TASK-006 | Update PropertySection empty state | High | 1 | PropertySection.tsx |
| TASK-007 | Update ItemManager config labels | High | 2 | ItemManager.tsx |
| TASK-008 | Update ItemsManagement component | Medium | 1 | ItemsManagement.tsx |
| TASK-009 | Update ItemSelectionList variations | Medium | 2 | ItemSelectionList.tsx |
| TASK-010 | Update Dashboard items page | Medium | 1 | items/page.tsx |
| TASK-011 | Update GuideGrid component | Medium | 1 | GuideGrid.tsx |
| TASK-012 | Update Instructions page | Medium | 1 | instructions/page.tsx |
| TASK-013 | Update ItemInstructionsList | Medium | 1 | ItemInstructionsList.tsx |
| TASK-014 | Update PropertySelector | Medium | 1 | PropertySelector.tsx |
| TASK-015 | Update PropertiesManagement | Medium | 1 | PropertiesManagement.tsx |
| TASK-016 | Update PropertyDropdown | Medium | 1 | PropertyDropdown.tsx |
| TASK-017 | Update Print page | Medium | 1 | print/page.tsx |
| TASK-018 | Update Analytics page | Medium | 2 | analytics/page.tsx |
| TASK-019 | Update AnalyticsManagement | Medium | 1 | AnalyticsManagement.tsx |
| TASK-020 | Update ReactionAnalytics | Low | 1 | ReactionAnalytics.tsx |
| TASK-021 | Update EmptySessionDialog | Medium | 2 | EmptySessionDialog.tsx |
| TASK-022 | Update SessionSummaryStep | Medium | 1 | SessionSummaryStep.tsx |
| TASK-023 | Update ItemDisplay | Low | 1 | ItemDisplay.tsx |
| TASK-024 | Update QRCodePrintManager | Low | 1 | QRCodePrintManager.tsx |
| TASK-025 | Update InstructionsTable | Low | 1 | InstructionsTable.tsx |
| TASK-026 | Update ItemRow ARIA | Low | 1 | ItemRow.tsx |
| TASK-027 | Update AccessRequestTable | Low | 1 | AccessRequestTable.tsx |
| TASK-028 | Update Filter components | Low | 1 | LocationFilter, TagFilter |
| TASK-029 | Update misc components | Low | 1 | Various |
| TASK-030 | Final verification | High | 1 | N/A |

**Total Estimated Points:** 32

---

## Execution Order

### Phase 1: Foundation (Tasks 1-2)
- TASK-001: Create namespace structure
- TASK-002: Add to other language files

### Phase 2: Core Components (Tasks 3-7)
- TASK-003: EmptyState component (most reused)
- TASK-004: Dashboard2 page
- TASK-005: StatisticsCards
- TASK-006: PropertySection
- TASK-007: ItemManager

### Phase 3: Item Management (Tasks 8-10)
- TASK-008: ItemsManagement
- TASK-009: ItemSelectionList
- TASK-010: Dashboard items page

### Phase 4: Guides/Instructions (Tasks 11-13)
- TASK-011: GuideGrid
- TASK-012: Instructions page
- TASK-013: ItemInstructionsList

### Phase 5: Properties (Tasks 14-17)
- TASK-014: PropertySelector
- TASK-015: PropertiesManagement
- TASK-016: PropertyDropdown
- TASK-017: Print page

### Phase 6: Analytics (Tasks 18-20)
- TASK-018: Analytics page
- TASK-019: AnalyticsManagement
- TASK-020: ReactionAnalytics

### Phase 7: Workflow (Tasks 21-22)
- TASK-021: EmptySessionDialog
- TASK-022: SessionSummaryStep

### Phase 8: Remaining Components (Tasks 23-29)
- TASK-023 through TASK-029

### Phase 9: Verification (Task 30)
- TASK-030: Final verification and build test

---

## Success Criteria

- [ ] All ~80 empty state strings extracted to `common.emptyStates` namespace
- [ ] All ~20+ component locations updated with `useTranslations` hook
- [ ] No hardcoded English empty state text remains
- [ ] ICU format interpolation works for search term messages
- [ ] ARIA labels use translated content
- [ ] Build passes without errors
- [ ] No missing translation key warnings
- [ ] All 6 language files have identical key structure

---

## Notes

- **Do NOT modify test files** - Testing is handled separately
- **Do NOT modify console.log messages** - These are for developers only
- **Use `tEmpty` as convention** for the translation instance name
- **Reuse generic namespace** for common phrases like "Try adjusting your search or filters"
- **Preserve existing styling** - Only change text content, not CSS

---

*End of Detailed Task Breakdown*
