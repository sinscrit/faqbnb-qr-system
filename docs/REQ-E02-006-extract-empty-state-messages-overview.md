# REQ-E02-006: Extract Empty State Messages - Implementation Overview

*Generated: 2026-01-20 16:48:00 UTC*
*Last Modified: 2026-01-20 16:48:00 UTC*

## Reference

- **Request**: REQ-E02-006 (Extract Empty State Messages)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2H (Common & Shared Components)
- **Task ID**: 2H.6
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-001 (Common Namespace Structure - must be completed first)

## Summary

Extract all hardcoded empty state messages displayed when lists, grids, or content areas have no data. Replace them with references to localized translation keys. This task affects approximately 20+ locations across various components where empty state titles, descriptions, and call-to-action prompts are displayed. The estimated ~80 distinct empty state strings need to be migrated to the i18n `common.emptyStates` namespace.

## Goals

1. Identify and catalog all empty state components and messages across the codebase (~20 locations)
2. Extract all hardcoded empty state strings to the `common.emptyStates` namespace
3. Replace hardcoded strings with `useTranslations()` hook references
4. Implement proper ICU message format for dynamic content with variable interpolation
5. Ensure empty states display translated text based on user's language preference
6. Maintain accessibility features (ARIA roles, live regions) with translated content
7. Follow consistent naming conventions for translation keys

## Context from Implementation Plan

### Existing Infrastructure (Epic 1 Foundation)

The localization foundation from Epic 1 is already in place:

| Component | Location | Status |
|-----------|----------|--------|
| next-intl package | `package.json` | Installed (v4.7.0) |
| i18n config | `/src/lib/i18n/config.ts` | Configured |
| IntlProvider | `/src/app/layout.tsx` | Integrated |
| Translation files | `/messages/*.json` | 6 languages (en, fr, es, de, nl, it) |
| useTranslations hook | next-intl | Available |
| Language detection | `/src/lib/i18n/language-detection.ts` | Configured |

### Existing Common Namespace (from REQ-E02-001)

After REQ-E02-001 completion, `/messages/en.json` will contain a base `common` namespace. This task adds the `emptyStates` sub-namespace.

### Estimated Scope

- **Files to modify**: ~20 component/page files
- **Distinct strings**: ~80 empty state messages
- **New translation keys needed**: ~80
- **Strings with interpolation**: ~5 (requiring ICU format)
- **Categories**: General, Items, Guides, Properties, Analytics, Search Results

## Current Empty State Patterns in Codebase

### Pattern Analysis

The codebase uses three primary patterns for displaying empty states:

#### Pattern 1: Reusable EmptyStateCard Component

A reusable component with variant-based styling used in SimpleDashboard:

```tsx
// Current: src/components/SimpleDashboard/EmptyStateCard.tsx
<EmptyStateCard
  icon={Home}
  title="Let's add your property"
  description="A property is where your items live - like a vacation rental or home."
  actionLabel="Add Property"
  onAction={handleCreateProperty}
  variant="subtle"
/>
```

**Locations using this pattern:**
- `/src/app/dashboard2/page.tsx` - Welcome/new user empty state
- `/src/components/SimpleDashboard/StatisticsCards.tsx` - No items/rooms empty state
- `/src/components/SimpleDashboard/PropertySection.tsx` - No properties empty state

#### Pattern 2: Reusable EmptyState Component (ItemManager)

A component used within ItemManager with customizable title and description:

```tsx
// Current: src/components/ItemManager/components/shared/EmptyState.tsx
const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';

<EmptyState
  title={DEFAULT_TITLE}
  description={DEFAULT_DESCRIPTION}
  icon={<Package className="w-12 h-12" />}
  action={<button>Create Item</button>}
/>
```

**Locations using this pattern:**
- `/src/components/ItemManager/ItemManager.tsx` - Item list empty state
- `/src/app/dashboard/items/page.tsx` - Items page empty state

#### Pattern 3: Inline Empty State Markup

Empty states rendered directly in component JSX:

```tsx
// Current: src/components/InstructionsTable/GuideGrid.tsx
{guides.length === 0 && (
  <div role="status" aria-live="polite">
    <p className="text-lg font-medium text-gray-900">No guides found</p>
    <p className="text-sm mt-1">Try adjusting your search or filters</p>
  </div>
)}
```

**Locations using this pattern:**
- `/src/components/InstructionsTable/GuideGrid.tsx` - No guides found
- `/src/app/dashboard2/instructions/page.tsx` - No guides yet
- `/src/components/ItemSelectionList.tsx` - No items found/available
- `/src/components/ItemsManagement.tsx` - No items states
- `/src/components/PropertySelector.tsx` - No properties available
- `/src/components/QRCodePrintManager.tsx` - No QR codes generated
- And many more...

#### Pattern 4: EmptySessionDialog (Workflow)

A dialog component for empty session handling:

```tsx
// Current: src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx
<h2>No Items Added</h2>
<p>No items added yet. Add items or exit session?</p>
<button>Add Items</button>
<button>Exit Session</button>
```

**Location:** `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`

### Current Empty State Message Inventory

#### Items Empty States (~25 strings)

| Location | Message |
|----------|---------|
| `/src/components/ItemManager/components/shared/EmptyState.tsx:23` | "No items yet" (default title) |
| `/src/components/ItemManager/components/shared/EmptyState.tsx:24` | "Create your first item to get started" (default description) |
| `/src/components/ItemManager/ItemManager.tsx:57` | "No items yet" (config label) |
| `/src/components/ItemManager/ItemManager.tsx:58` | "Create your first item to get started" (config label) |
| `/src/components/ItemManager/ItemManager.tsx:591` | "Try adjusting your search or filters" (no results description) |
| `/src/app/dashboard/items/page.tsx:331` | "No items yet" |
| `/src/app/dashboard/items/page.tsx:332` | "Get started by creating your first item" |
| `/src/components/ItemsManagement.tsx:116` | "No items yet" |
| `/src/components/ItemsManagement.tsx:117` | "Get started by creating your first item" |
| `/src/components/ItemsManagement.tsx:284` | "No items found" (search result) |
| `/src/components/ItemSelectionList.tsx:203` | "No items found" |
| `/src/components/ItemSelectionList.tsx:204` | "No items match your search for \"{searchTerm}\"" |
| `/src/components/ItemSelectionList.tsx:228` | "No items available" |
| `/src/components/ItemSelectionList.tsx:229` | "There are no items to display for this property." |
| `/src/app/dashboard/properties/[propertyId]/page.tsx:353` | "No items" |

#### Guides/Instructions Empty States (~10 strings)

| Location | Message |
|----------|---------|
| `/src/components/InstructionsTable/GuideGrid.tsx:100` | "No guides found" |
| `/src/components/InstructionsTable/GuideGrid.tsx:101` | "Try adjusting your search or filters" |
| `/src/app/dashboard2/instructions/page.tsx:289` | "No guides yet" |
| `/src/app/dashboard2/instructions/page.tsx:291-292` | "Create items and add guide articles to get started. Guides help guests..." |
| `/src/components/ItemEditForm/ItemInstructionsList.tsx:87` | "No guides yet" |
| `/src/components/ItemManager/components/ItemRow.tsx:347` | "No guides." (in aria-label) |

#### Properties Empty States (~10 strings)

| Location | Message |
|----------|---------|
| `/src/components/SimpleDashboard/PropertySection.tsx` | "Let's add your property" |
| `/src/components/SimpleDashboard/PropertySection.tsx` | "A property is where your items live - like a vacation rental or home." |
| `/src/app/dashboard2/print/page.tsx:45` | "No Properties Yet" |
| `/src/components/PropertySelector.tsx:295` | "No properties available" |
| `/src/components/PropertiesManagement.tsx:319` | "No Properties Found" |
| `/src/components/PropertiesManagement.tsx:321` | "No properties match your search criteria." |
| `/src/components/PropertiesManagement.tsx:321` | "Get started by creating your first property." |
| `/src/components/dashboard/PropertyDropdown.tsx:187` | "No properties found" |

#### Dashboard/General Empty States (~15 strings)

| Location | Message |
|----------|---------|
| `/src/app/dashboard2/page.tsx:175` | "Get started by adding your first property. Then you can create QR codes to help guests find what they need." |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | "Start adding new QR Code items and create guides/instructions" |
| `/src/components/ItemDisplay.tsx:239` | "No resources available for this item." |
| `/src/components/ItemDisplay-static.tsx:89` | "No Resources Available" |
| `/src/components/QRCodePrintManager.tsx:585` | "No QR codes generated yet" |
| `/src/components/QRCodePrintManager.tsx:324` | "No QR codes available for PDF export. Please generate QR codes first." |

#### Analytics Empty States (~8 strings)

| Location | Message |
|----------|---------|
| `/src/app/dashboard/analytics/page.tsx:519` | "No engagement data available" |
| `/src/app/dashboard/analytics/page.tsx:591` | "No daily view data available" |
| `/src/app/dashboard/analytics/page.tsx:608` | "No reactions data available" |
| `/src/components/AnalyticsManagement.tsx:365` | "No engagement data available" |
| `/src/components/AnalyticsManagement.tsx:437` | "No daily view data available" |
| `/src/components/AnalyticsManagement.tsx:454` | "No reactions data available" |
| `/src/components/ReactionAnalytics.tsx:94` | "No reactions yet" |

#### Workflow/Session Empty States (~5 strings)

| Location | Message |
|----------|---------|
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx:150` | "No Items Added" |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx:158` | "No items added yet. Add items or exit session?" |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx:179` | "Add Items" |
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx:198` | "Exit Session" |
| SessionSummaryStep (inline) | "No items yet" / "You haven't created any items in this session yet. Start by adding your first item." |

#### Access Requests Empty States (~5 strings)

| Location | Message |
|----------|---------|
| `/src/app/admin/system/back-office/page.tsx:473` | "No access requests found" |
| `/src/components/AccessRequestTable.tsx:565` | "No access requests found" |
| `/src/components/AccessRequestTable.tsx:568` | "Try adjusting your search or filters" |
| `/src/components/AccessRequestTable.tsx:569` | "No access requests have been submitted yet" |

## Translation Namespace Structure

### Namespace: `common.emptyStates`

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
        "noGuides": "No guides."
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
        "noReactionsYet": "No reactions yet"
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
      "cta": {
        "createItem": "Create Item",
        "createFirstItem": "Create Your First Item",
        "newQRCodeItem": "New QR Code Item",
        "addProperty": "Add Property",
        "createGuide": "Create Guide"
      }
    }
  }
}
```

## Implementation Order

### Step 1: Create Empty States Namespace (Priority: High)

Add the `common.emptyStates` namespace to `/messages/en.json` with all categorized empty state strings.

### Step 2: Update Reusable Empty State Components (Priority: High)

These are the foundation components used across the application:

1. **`/src/components/SimpleDashboard/EmptyStateCard.tsx`** - Update to accept translation keys
2. **`/src/components/ItemManager/components/shared/EmptyState.tsx`** - Replace DEFAULT_TITLE and DEFAULT_DESCRIPTION constants

### Step 3: Update Dashboard Pages (Priority: High)

3. **`/src/app/dashboard2/page.tsx`** - Welcome empty state
4. **`/src/components/SimpleDashboard/StatisticsCards.tsx`** - Statistics empty state
5. **`/src/components/SimpleDashboard/PropertySection.tsx`** - Property empty state

### Step 4: Update Item Management Components (Priority: High)

6. **`/src/components/ItemManager/ItemManager.tsx`** - Config labels and inline empty states
7. **`/src/components/ItemsManagement.tsx`** - Props defaults and search empty state
8. **`/src/components/ItemSelectionList.tsx`** - Multiple empty state variations
9. **`/src/app/dashboard/items/page.tsx`** - Items page empty state

### Step 5: Update Guide/Instructions Components (Priority: Medium)

10. **`/src/components/InstructionsTable/GuideGrid.tsx`** - Guide grid empty state
11. **`/src/app/dashboard2/instructions/page.tsx`** - Instructions page empty state
12. **`/src/components/ItemEditForm/ItemInstructionsList.tsx`** - Item instructions empty state

### Step 6: Update Property Components (Priority: Medium)

13. **`/src/components/PropertySelector.tsx`** - Selector empty state
14. **`/src/components/PropertiesManagement.tsx`** - Management empty states
15. **`/src/components/dashboard/PropertyDropdown.tsx`** - Dropdown empty state
16. **`/src/app/dashboard2/print/page.tsx`** - Print page empty state

### Step 7: Update Analytics Components (Priority: Medium)

17. **`/src/app/dashboard/analytics/page.tsx`** - Analytics page empty states
18. **`/src/components/AnalyticsManagement.tsx`** - Management empty states
19. **`/src/components/ReactionAnalytics.tsx`** - Reaction analytics empty state

### Step 8: Update Workflow Components (Priority: Medium)

20. **`/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`** - Session dialog
21. **`/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`** - Session summary empty state

### Step 9: Update Utility/Misc Components (Priority: Lower)

22. **`/src/components/ItemDisplay.tsx`** - Item display empty state
23. **`/src/components/QRCodePrintManager.tsx`** - QR code empty states
24. **`/src/components/AccessRequestTable.tsx`** - Access request empty state

## Authorized Files and Functions for Modification

### Translation Files to Modify

#### `/messages/en.json`

- **Purpose**: English translation source file
- **Modification**:
  - Add `common.emptyStates` namespace with all sub-categories
  - Implement ICU format for messages with variable interpolation (e.g., search terms)

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification**: Add same keys as en.json (with English placeholders initially)
- **Note**: Actual translations generated in separate task (2H.10)

### Component Files to Modify

#### Reusable Empty State Components

| File | Modifications |
|------|---------------|
| `/src/components/SimpleDashboard/EmptyStateCard.tsx` | This component receives `title` and `description` as props - no changes needed to the component itself, but callers will pass translated strings |
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | Add `useTranslations('common.emptyStates')` hook; replace `DEFAULT_TITLE` and `DEFAULT_DESCRIPTION` with `t('items.title')` and `t('items.description')` |

#### Dashboard Components

| File | Modifications |
|------|---------------|
| `/src/app/dashboard2/page.tsx` | Add `useTranslations('common.emptyStates')` hook; replace EmptyStateCard props with translation calls: `title={t('dashboard.welcome.title')}`, `description={t('dashboard.welcome.description')}` |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Add `useTranslations('common.emptyStates')` hook; replace EmptyStateCard title with `t('dashboard.noContent.title')` |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Add `useTranslations('common.emptyStates')` hook; replace EmptyStateCard props with `t('properties.titleAdd')` and `t('properties.description')` |

#### Item Management Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemManager/ItemManager.tsx` | Add `useTranslations('common.emptyStates')` hook; update default config labels to use `t('items.title')`, `t('items.description')`, `t('generic.tryAdjusting')` |
| `/src/components/ItemsManagement.tsx` | Add `useTranslations('common.emptyStates')` hook; replace default prop values and inline "No items found" text |
| `/src/components/ItemSelectionList.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No items found", search match message, "No items available", and property-specific message |
| `/src/app/dashboard/items/page.tsx` | Add `useTranslations('common.emptyStates')` hook; replace `emptyStateTitle` and `emptyStateDescription` props |

#### Guide/Instructions Components

| File | Modifications |
|------|---------------|
| `/src/components/InstructionsTable/GuideGrid.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No guides found" with `t('guides.titleNotFound')` and "Try adjusting..." with `t('generic.tryAdjusting')` |
| `/src/app/dashboard2/instructions/page.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No guides yet" and description text |
| `/src/components/ItemEditForm/ItemInstructionsList.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No guides yet" and description |

#### Property Components

| File | Modifications |
|------|---------------|
| `/src/components/PropertySelector.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No properties available" |
| `/src/components/PropertiesManagement.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No Properties Found" and description variations |
| `/src/components/dashboard/PropertyDropdown.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No properties found" |
| `/src/app/dashboard2/print/page.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No Properties Yet" |

#### Analytics Components

| File | Modifications |
|------|---------------|
| `/src/app/dashboard/analytics/page.tsx` | Add `useTranslations('common.emptyStates')` hook; replace all "No X data available" messages |
| `/src/components/AnalyticsManagement.tsx` | Add `useTranslations('common.emptyStates')` hook; replace analytics empty state messages |
| `/src/components/ReactionAnalytics.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No reactions yet" |

#### Workflow Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No Items Added", description, "Add Items", and "Exit Session" |
| `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | Add `useTranslations('common.emptyStates')` hook; replace inline empty session state text |

#### Utility Components

| File | Modifications |
|------|---------------|
| `/src/components/ItemDisplay.tsx` | Add `useTranslations('common.emptyStates')` hook; replace "No resources available for this item." |
| `/src/components/QRCodePrintManager.tsx` | Add `useTranslations('common.emptyStates')` hook; replace QR code empty state messages |
| `/src/components/AccessRequestTable.tsx` | Add `useTranslations('common.emptyStates')` hook; replace access request empty state messages |

### Files NOT to Modify

- Console.log messages (for developers only, not user-facing)
- Test files (`__tests__/*.tsx`, `/src/app/test/**`) - Testing handled separately
- API route files (`/src/app/api/*`) - Server-side, different translation approach
- Comments and documentation strings
- ARIA labels that duplicate visible text (these should use the translated visible text)

## Technical Specifications

### Import Pattern

Every component with empty states must import the useTranslations hook:

```typescript
'use client';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const tEmpty = useTranslations('common.emptyStates');

  // Empty state title
  return <h3>{tEmpty('items.title')}</h3>;
}
```

### Variable Interpolation Pattern (ICU Format)

For messages with dynamic values:

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "noItemsSearchMatch": "No items match your search for \"{searchTerm}\""
      }
    }
  }
}
```

```typescript
tEmpty('items.noItemsSearchMatch', { searchTerm: debouncedSearchTerm })
```

### Reusable Component Update Pattern

For EmptyState component in ItemManager:

```tsx
// Before
const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';

export function EmptyState({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  ...
}: EmptyStateProps) {
  // ...
}

// After
import { useTranslations } from 'next-intl';

export function EmptyState({
  title,
  description,
  ...
}: EmptyStateProps) {
  const tEmpty = useTranslations('common.emptyStates');

  const effectiveTitle = title ?? tEmpty('items.title');
  const effectiveDescription = description ?? tEmpty('items.description');

  return (
    <div role="status" aria-label={`${effectiveTitle}. ${effectiveDescription}`}>
      <h3>{effectiveTitle}</h3>
      <p>{effectiveDescription}</p>
    </div>
  );
}
```

### EmptyStateCard Usage Pattern

For components using EmptyStateCard (which already accepts props):

```tsx
// Before
<EmptyStateCard
  icon={Home}
  title="Let's add your property"
  description="A property is where your items live - like a vacation rental or home."
  actionLabel="Add Property"
  onAction={handleCreateProperty}
/>

// After
const tEmpty = useTranslations('common.emptyStates');

<EmptyStateCard
  icon={Home}
  title={tEmpty('properties.titleAdd')}
  description={tEmpty('properties.description')}
  actionLabel={tEmpty('cta.addProperty')}
  onAction={handleCreateProperty}
/>
```

### ARIA Accessibility Pattern

Ensure translated content works with accessibility:

```tsx
<div
  role="status"
  aria-label={`${tEmpty('items.title')}. ${tEmpty('items.description')}`}
  aria-live="polite"
>
  <h3>{tEmpty('items.title')}</h3>
  <p>{tEmpty('items.description')}</p>
</div>
```

## Translation Key Naming Convention

Following Plan-111 convention:
```
common.emptyStates.{category}.{variant}
```

### Categories:
- `generic` - Reusable across contexts (noData, noResults)
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

### Rules:
- Use camelCase for multi-word keys: `noItemsFound`, `tryAdjusting`
- Use `title` for primary heading text
- Use `description` for supporting descriptive text
- Use variant suffixes when needed: `titleNotFound`, `descriptionAlt`
- Use `cta` namespace for button labels

### Examples:
| Message | Translation Key |
|---------|-----------------|
| "No items yet" | `common.emptyStates.items.title` |
| "Create your first item to get started" | `common.emptyStates.items.description` |
| "No guides found" | `common.emptyStates.guides.titleNotFound` |
| "Try adjusting your search or filters" | `common.emptyStates.generic.tryAdjusting` |
| "No items match your search for \"{term}\"" | `common.emptyStates.items.noItemsSearchMatch` |
| "Add Property" | `common.emptyStates.cta.addProperty` |

## Success Validation Checklist

### Code Validation
- [ ] All ~20 empty state locations have been identified and updated
- [ ] Each updated component imports `useTranslations` from 'next-intl'
- [ ] No hardcoded English empty state text remains in modified components
- [ ] All dynamic messages use ICU format interpolation
- [ ] ARIA labels and live regions use translated content

### Translation File Validation
- [ ] `/messages/en.json` contains complete `common.emptyStates` namespace
- [ ] All 6 language files have identical key structures
- [ ] ICU message formats are syntactically correct
- [ ] No duplicate keys within namespaces

### Functional Validation
- [ ] Application builds without errors: `npm run build`
- [ ] Empty state titles display correct translated text
- [ ] Empty state descriptions display correct translated text
- [ ] Call-to-action buttons display correct translated text
- [ ] Variable interpolation works correctly (search terms)
- [ ] Empty states display translated text when locale is changed
- [ ] No console warnings about missing translation keys

### Accessibility Validation
- [ ] ARIA labels include translated content
- [ ] Screen readers correctly announce empty state content
- [ ] role="status" maintains proper behavior
- [ ] Focus management still works correctly

## Dependencies

### Required (Already Completed)
- Epic 1: next-intl foundation must be in place
- REQ-E02-001: Common Namespace Structure must be complete

### Related Tasks
- Task 2H.10: Will generate translations for non-English languages
- Task 2H.7 (Loading States): Some overlap with loading/empty state patterns

## Risk Assessment

- **Risk Level**: Low-Medium
- **Rationale**:
  - Many locations use consistent patterns (EmptyStateCard, EmptyState)
  - String replacement is straightforward in most cases
  - Some components have multiple empty state variations
  - ICU format needed only for ~5 strings

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing empty state locations | Medium | Low | Use grep patterns to find all empty state components |
| Longer translated text breaking layouts | Low | Medium | Test layouts in languages with longer text (German) |
| Default prop value handling | Medium | Low | Use null coalescing for defaults in components |
| ARIA label consistency | Low | Low | Ensure aria-labels use same translation calls as visible text |

## Search Patterns for Discovery

Use these patterns to find all empty state locations:

```bash
# Find EmptyState/EmptyStateCard component usage
grep -rn "EmptyState\|EmptyStateCard" --include="*.tsx" src/

# Find "no items" patterns
grep -rn "No items\|no items" --include="*.tsx" src/ | grep -v test | grep -v console

# Find "no results" patterns
grep -rn "No results\|no results\|No .* found" --include="*.tsx" src/ | grep -v test

# Find empty state containers
grep -rn "role=\"status\"\|aria-live=\"polite\"" --include="*.tsx" src/

# Find "yet" patterns (common in empty states)
grep -rn "yet\"\|yet'" --include="*.tsx" src/ | grep -i "no \|haven't"

# Find "Try adjusting" patterns
grep -rn "Try adjusting\|try adjusting" --include="*.tsx" src/

# Find "Get started" patterns
grep -rn "Get started\|get started\|Create your first" --include="*.tsx" src/
```

## Notes

### Reference Implementation

The EmptyStateCard component provides a good pattern for how to use translations:

```typescript
// /src/app/dashboard2/page.tsx - Reference implementation
'use client';
import { useTranslations } from 'next-intl';
import { EmptyStateCard } from '@/components/SimpleDashboard/EmptyStateCard';
import { Home } from 'lucide-react';

export default function Dashboard2Page() {
  const tEmpty = useTranslations('common.emptyStates');

  return (
    <EmptyStateCard
      icon={Home}
      title={tEmpty('properties.titleAdd')}
      description={tEmpty('properties.description')}
      actionLabel={tEmpty('cta.addProperty')}
      onAction={handleCreateProperty}
      variant="subtle"
    />
  );
}
```

### Coordination with Other Tasks

- **Task 2H.1 (Common Namespace)**: Creates base structure; this task adds emptyStates sub-namespace
- **Task 2H.7 (Loading States)**: Loading states are distinct but may appear alongside empty states
- **Task 2H.2 (Button Labels)**: CTA buttons in empty states should use `common.emptyStates.cta` for consistency

### Empty State Deduplication Strategy

Many empty state messages are similar. Use this approach:
- `generic` namespace for truly reusable phrases ("Try adjusting your search or filters")
- Category-specific namespaces for context-specific messages
- Allow components to use specific keys, fallback to generic

### Estimated Effort

Based on Plan-111, this task is estimated at ~80 strings across ~20 locations. This represents approximately 10% of Sub-Epic 2H's overall ~800 strings. Due to the consistent patterns used, this M-sized task should take approximately 1 day.

---

*End of Implementation Overview*
