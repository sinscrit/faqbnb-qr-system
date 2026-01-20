# Detailed Task Breakdown: REQ-E02-010 - Update Property Pages with Localized Strings

**Document Created:** 2026-01-20 20:15:00 UTC
**Last Modified:** 2026-01-20 20:15:00 UTC

**Request ID:** REQ-E02-010
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.4
**Size:** L (Large)
**Priority:** P2

**Related Documents:**
- Overview: `/docs/REQ-E02-010-update-property-pages-overview.md`
- Requirements: `/docs/gen_requests_epic2.md` (Request #10)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for updating all property-related pages and components with localized translation references. The implementation covers ~308 unique strings across 10 files, requiring translation key additions to all 6 language files and systematic component updates.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed, IntlProvider configured)
- [ ] `/messages/en.json` exists and is writable
- [ ] All 6 language files exist: `en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
- [ ] `useTranslations` hook from `next-intl` is working in client components
- [ ] Tasks 2F.1 (properties namespace), 2F.2 (PropertyForm), 2F.3 (property modals) are complete or in parallel
- [ ] Common namespace (`common`) exists with shared strings (Task 2H.1)

---

## Task 1: Add Properties Namespace to Messages Files

**Estimated Time:** 30-45 minutes
**Files to Modify:** `/messages/en.json`

### 1.1 Add Properties Pages Namespace

Add the following structure to `/messages/en.json` under the `properties` key:

```json
{
  "properties": {
    "title": "Properties",
    "pages": {
      "myProperties": {
        "title": "My Properties",
        "description": "Manage your properties and their settings"
      },
      "management": {
        "title": "Properties Management",
        "description": "Manage your properties"
      },
      "detail": {
        "breadcrumb": "Property Details",
        "subtitle": "Property Details",
        "information": "Property Information",
        "informationDesc": "Detailed information about this property.",
        "quickActions": "Quick Actions",
        "itemsSection": "Items in this Property",
        "loadingItems": "Loading items...",
        "noItems": {
          "title": "No items",
          "message": "This property doesn't have any items yet."
        }
      },
      "edit": {
        "title": "Edit Property",
        "subtitle": "Modify the details of \"{name}\"",
        "breadcrumb": "Edit Property"
      },
      "new": {
        "title": "Create New Property",
        "subtitle": "Add a new property to {target}",
        "breadcrumb": "New Property",
        "targetSystem": "the system",
        "targetAccount": "your account"
      },
      "loading": "Loading properties management...",
      "loadingProperty": "Loading property...",
      "auth": {
        "title": "Authentication Required",
        "message": "Please log in to access properties management.",
        "loginRequired": "Please log in to view properties."
      },
      "accessDenied": {
        "title": "Access Denied",
        "message": "You do not have permission to view properties."
      }
    }
  }
}
```

**Verification:**
- [ ] JSON is valid (no syntax errors)
- [ ] Keys follow `namespace.component.element.variant` pattern
- [ ] No duplicate keys exist

### 1.2 Add Properties Labels Namespace

```json
{
  "properties": {
    "labels": {
      "name": "Name",
      "nickname": "Property Nickname",
      "type": "Property Type",
      "address": "Address",
      "noAddress": "No address provided",
      "unknownType": "Unknown type",
      "id": "Property ID",
      "owner": "Owner",
      "accountId": "Account ID",
      "created": "Created:"
    }
  }
}
```

### 1.3 Add Properties Actions Namespace

```json
{
  "properties": {
    "actions": {
      "add": "Add Property",
      "addNew": "Add New Property",
      "edit": "Edit Property",
      "delete": "Delete Property",
      "view": "View Property",
      "viewItems": "View Items",
      "printQR": "Print QR Codes",
      "backToList": "Back to Properties"
    }
  }
}
```

### 1.4 Add Properties Notifications Namespace

```json
{
  "properties": {
    "notifications": {
      "createSuccess": "Property created successfully",
      "updateSuccess": "Property updated successfully",
      "deleteSuccess": "Property deleted successfully"
    }
  }
}
```

### 1.5 Add Properties Errors Namespace

```json
{
  "properties": {
    "errors": {
      "invalidId": {
        "title": "Invalid Property ID",
        "message": "No property ID provided in the URL."
      },
      "loading": {
        "title": "Error Loading Property"
      },
      "loadingData": {
        "title": "Error Loading Data"
      },
      "dataNotAvailable": {
        "title": "Data Not Available"
      },
      "propertyNotLoaded": "Property data could not be loaded.",
      "typesNotAvailable": "Property types are not available.",
      "setupRequired": {
        "title": "Setup Required",
        "message": "No property types are available. Please contact your administrator to set up property types before creating properties."
      }
    }
  }
}
```

### 1.6 Add Properties Permissions Namespace

```json
{
  "properties": {
    "permissions": {
      "limited": {
        "title": "Limited Permissions"
      },
      "cannotManage": "Cannot manage properties.",
      "cannotEdit": "Cannot edit properties.",
      "cannotDelete": "Cannot delete properties."
    }
  }
}
```

### 1.7 Add Properties Search and Filters Namespace

```json
{
  "properties": {
    "search": {
      "label": "Search Properties",
      "placeholder": "Search by name, address, type, or owner...",
      "results": "Showing {count} of {total} properties",
      "matching": " matching \"{query}\"",
      "noResults": {
        "title": "No Properties Found",
        "searchMessage": "No properties match your search criteria.",
        "emptyMessage": "Get started by creating your first property."
      }
    },
    "filters": {
      "typeLabel": "Filter by Type",
      "allTypes": "All Types",
      "ownerLabel": "Filter by Owner",
      "allOwners": "All Owners"
    }
  }
}
```

### 1.8 Add Properties Table Namespace

```json
{
  "properties": {
    "table": {
      "property": "Property",
      "type": "Type",
      "address": "Address",
      "owner": "Owner",
      "created": "Created",
      "actions": "Actions"
    }
  }
}
```

### 1.9 Add Properties Section Namespace

```json
{
  "properties": {
    "section": {
      "headingSingular": "My Property",
      "headingPlural": "My Properties",
      "itemCount": "{count, plural, one {# item} other {# items}}",
      "roomCount": "{count, plural, one {# room} other {# rooms}}",
      "loading": "Loading properties",
      "empty": {
        "title": "Let's add your property",
        "description": "A property is where your items live - like a vacation rental or home."
      },
      "aria": {
        "editProperty": "Edit property: {name}",
        "addProperty": "Add a new property"
      }
    }
  }
}
```

### 1.10 Add Properties Modals Namespace

```json
{
  "properties": {
    "modals": {
      "delete": {
        "title": "Delete Property",
        "message": "Are you sure you want to delete the property \"{name}\"? This action cannot be undone."
      }
    }
  }
}
```

### 1.11 Add Properties QR Print Namespace

```json
{
  "properties": {
    "qrPrint": {
      "title": "QR Code Print Manager",
      "description": "Generate and print QR codes for property items",
      "preloaded": " - Items pre-loaded from main window",
      "error": {
        "title": "Error Loading QR Print"
      }
    }
  }
}
```

**Acceptance Criteria for Task 1:**
- [ ] All translation keys added to `/messages/en.json`
- [ ] JSON validates without errors
- [ ] No hardcoded strings remain in namespace definitions

---

## Task 2: Update My Properties Page

**File:** `/src/app/dashboard2/properties/page.tsx`
**Estimated Time:** 15-20 minutes
**String Count:** ~15 strings

### 2.1 Add Import Statement

**Location:** Line 1-23 (import section)

```typescript
// Add to imports
import { useTranslations } from 'next-intl';
```

### 2.2 Add Translation Hook Initialization

**Location:** Inside `PropertiesPage` function, after line 24

```typescript
export default function PropertiesPage() {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  // ... existing code
```

### 2.3 Replace Auth Message

**Location:** Line 82

**Before:**
```tsx
<p className="text-gray-600">Please log in to view properties.</p>
```

**After:**
```tsx
<p className="text-gray-600">{t('pages.auth.loginRequired')}</p>
```

### 2.4 Replace Page Title

**Location:** Line 91

**Before:**
```tsx
<h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
```

**After:**
```tsx
<h1 className="text-2xl font-bold text-gray-900">{t('pages.myProperties.title')}</h1>
```

### 2.5 Replace Page Description

**Location:** Line 92-94

**Before:**
```tsx
<p className="text-gray-600 mt-1">
  Manage your properties and their settings
</p>
```

**After:**
```tsx
<p className="text-gray-600 mt-1">
  {t('pages.myProperties.description')}
</p>
```

### 2.6 Replace Success Messages in Handlers

**Location:** Line 51 (handlePropertySave)

**Before:**
```typescript
setSuccessMessage('Property updated successfully');
```

**After:**
```typescript
setSuccessMessage(t('notifications.updateSuccess'));
```

**Location:** Line 74 (handlePropertyAdded)

**Before:**
```typescript
setSuccessMessage('Property created successfully');
```

**After:**
```typescript
setSuccessMessage(t('notifications.createSuccess'));
```

**Acceptance Criteria for Task 2:**
- [ ] Import statement added
- [ ] Translation hooks initialized
- [ ] All 5 hardcoded strings replaced
- [ ] Page renders correctly with translations
- [ ] No TypeScript errors

---

## Task 3: Update PropertySection Component

**File:** `/src/components/SimpleDashboard/PropertySection.tsx`
**Estimated Time:** 25-30 minutes
**String Count:** ~25 strings

### 3.1 Add Import Statement

**Location:** Line 1-17 (import section)

```typescript
import { useTranslations } from 'next-intl';
```

### 3.2 Update PropertyRow Function

**Location:** Line 39-80

Add translation hook at start of function:
```typescript
function PropertyRow({ property, onClick, itemCount = 0, roomCount = 0, countsLoading = false }: PropertyRowProps) {
  const t = useTranslations('properties.section');
  // ... existing code
```

**Replace aria-label (Line 54):**

**Before:**
```tsx
aria-label={`Edit property: ${property.nickname}`}
```

**After:**
```tsx
aria-label={t('aria.editProperty', { name: property.nickname })}
```

**Replace item count (Line 67):**

**Before:**
```tsx
{itemCount} {itemCount === 1 ? 'item' : 'items'}
```

**After:**
```tsx
{t('itemCount', { count: itemCount })}
```

**Replace room count (Line 71):**

**Before:**
```tsx
{roomCount} {roomCount === 1 ? 'room' : 'rooms'}
```

**After:**
```tsx
{t('roomCount', { count: roomCount })}
```

### 3.3 Update LoadingSkeleton Function

**Location:** Line 87-114

**Replace loading label (Line 89):**

**Before:**
```tsx
<SkeletonBase label="Loading properties">
```

**After:**
```tsx
const t = useTranslations('properties.section');
// ...
<SkeletonBase label={t('loading')}>
```

### 3.4 Update PropertyEmptyState Function

**Location:** Line 125-136

Add translation hook:
```typescript
function PropertyEmptyState({ onAddProperty }: PropertyEmptyStateProps) {
  const t = useTranslations('properties');
  // ...
```

**Replace EmptyStateCard props (Line 127-133):**

**Before:**
```tsx
<EmptyStateCard
  icon={Home}
  title="Let's add your property"
  description="A property is where your items live - like a vacation rental or home."
  actionLabel={onAddProperty ? 'Add Property' : undefined}
  onAction={onAddProperty}
  variant="subtle"
/>
```

**After:**
```tsx
<EmptyStateCard
  icon={Home}
  title={t('section.empty.title')}
  description={t('section.empty.description')}
  actionLabel={onAddProperty ? t('actions.add') : undefined}
  onAction={onAddProperty}
  variant="subtle"
/>
```

### 3.5 Update SinglePropertyCard Function

**Location:** Line 160-208

Add translation hook at start:
```typescript
function SinglePropertyCard({ property, onClick, itemCount = 0, roomCount = 0, countsLoading = false }: SinglePropertyCardProps) {
  const t = useTranslations('properties.section');
  // ...
```

**Replace aria-label (Line 175):**

**Before:**
```tsx
aria-label={`Edit property: ${property.nickname}`}
```

**After:**
```tsx
aria-label={t('aria.editProperty', { name: property.nickname })}
```

**Replace item/room counts (Lines 192, 196):**
Apply same pattern as PropertyRow.

### 3.6 Update Main PropertySection Function

**Location:** Line 241-347

Add translation hook at start:
```typescript
export function PropertySection({
  onPropertyEdit,
  onAddProperty,
  tier,
  className = '',
}: PropertySectionProps) {
  const t = useTranslations('properties');
  const { userProperties, loading } = useAuth();
  // ...
```

**Replace heading text (Line 256):**

**Before:**
```typescript
const headingText = userProperties?.length === 1 ? 'My Property' : 'My Properties';
```

**After:**
```typescript
const headingText = userProperties?.length === 1
  ? t('section.headingSingular')
  : t('section.headingPlural');
```

**Replace Add button text (Line 342):**

**Before:**
```tsx
<span>Add New Property</span>
```

**After:**
```tsx
<span>{t('actions.addNew')}</span>
```

**Replace Add button aria-label (Line 339):**

**Before:**
```tsx
aria-label="Add a new property"
```

**After:**
```tsx
aria-label={t('section.aria.addProperty')}
```

**Acceptance Criteria for Task 3:**
- [ ] All 4 sub-components updated with translation hooks
- [ ] Pluralization works correctly for item/room counts
- [ ] Aria labels include property names via interpolation
- [ ] Empty state displays translated content
- [ ] No TypeScript errors
- [ ] Component renders correctly in all tiers

---

## Task 4: Update PropertiesManagement Component

**File:** `/src/components/PropertiesManagement.tsx`
**Estimated Time:** 40-50 minutes
**String Count:** ~60 strings (largest component)

### 4.1 Add Import Statement

**Location:** Line 1-5 (import section)

```typescript
import { useTranslations } from 'next-intl';
```

### 4.2 Add Translation Hook

**Location:** Line 36-63 (inside component function)

```typescript
export function PropertiesManagement({
  // ... props
}: PropertiesManagementProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  // ... existing state
```

### 4.3 Replace Error State (Lines 183-199)

**Before:**
```tsx
<h3 className="text-lg font-medium text-red-800">Error Loading Properties</h3>
<p className="text-sm text-red-600 mt-1">{error}</p>
<button ...>
  <RefreshCw className="w-4 h-4 mr-2 inline" />
  Try Again
</button>
```

**After:**
```tsx
<h3 className="text-lg font-medium text-red-800">{t('errors.loading.title')}</h3>
<p className="text-sm text-red-600 mt-1">{error}</p>
<button ...>
  <RefreshCw className="w-4 h-4 mr-2 inline" />
  {tCommon('tryAgain')}
</button>
```

### 4.4 Replace Permission Warning (Lines 207-222)

**Before:**
```tsx
<p className="text-sm font-medium">Limited Permissions</p>
<p className="text-sm">
  {!canManage && 'Cannot manage properties. '}
  {!canEdit && 'Cannot edit properties. '}
  {!canDelete && 'Cannot delete properties.'}
</p>
```

**After:**
```tsx
<p className="text-sm font-medium">{t('permissions.limited.title')}</p>
<p className="text-sm">
  {!canManage && t('permissions.cannotManage') + ' '}
  {!canEdit && t('permissions.cannotEdit') + ' '}
  {!canDelete && t('permissions.cannotDelete')}
</p>
```

### 4.5 Replace Search Section (Lines 224-243)

**Before:**
```tsx
<label htmlFor="search" className="...">
  Search Properties
</label>
<input
  ...
  placeholder="Search by name, address, type, or owner..."
/>
```

**After:**
```tsx
<label htmlFor="search" className="...">
  {t('search.label')}
</label>
<input
  ...
  placeholder={t('search.placeholder')}
/>
```

### 4.6 Replace Filter Labels (Lines 247-270)

**Before:**
```tsx
<label htmlFor="propertyType" className="...">
  Filter by Type
</label>
...
<option value="">All Types</option>
```

**After:**
```tsx
<label htmlFor="propertyType" className="...">
  {t('filters.typeLabel')}
</label>
...
<option value="">{t('filters.allTypes')}</option>
```

### 4.7 Replace Owner Filter Labels (Lines 276-287)

**Before:**
```tsx
<label htmlFor="userFilter" className="...">
  Filter by Owner
</label>
...
<option value="">All Owners</option>
```

**After:**
```tsx
<label htmlFor="userFilter" className="...">
  {t('filters.ownerLabel')}
</label>
...
<option value="">{t('filters.allOwners')}</option>
```

### 4.8 Replace Results Summary (Lines 306-309)

**Before:**
```tsx
<p className="text-sm text-gray-600">
  Showing {paginatedProperties.length} of {filteredProperties.length} properties
  {searchQuery && ` matching "${searchQuery}"`}
</p>
```

**After:**
```tsx
<p className="text-sm text-gray-600">
  {t('search.results', { count: paginatedProperties.length, total: filteredProperties.length })}
  {searchQuery && t('search.matching', { query: searchQuery })}
</p>
```

### 4.9 Replace No Results Section (Lines 314-327)

**Before:**
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-1">No Properties Found</h3>
<p className="text-gray-600 mb-4">
  {searchQuery ? 'No properties match your search criteria.' : 'Get started by creating your first property.'}
</p>
```

**After:**
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-1">{t('search.noResults.title')}</h3>
<p className="text-gray-600 mb-4">
  {searchQuery ? t('search.noResults.searchMessage') : t('search.noResults.emptyMessage')}
</p>
```

### 4.10 Replace Table Headers (Lines 336-357)

**Before:**
```tsx
<th ...>Property</th>
<th ...>Type</th>
<th ...>Address</th>
<th ...>Owner</th>
<th ...>Created</th>
<th ...>Actions</th>
```

**After:**
```tsx
<th ...>{t('table.property')}</th>
<th ...>{t('table.type')}</th>
<th ...>{t('table.address')}</th>
<th ...>{t('table.owner')}</th>
<th ...>{t('table.created')}</th>
<th ...>{t('table.actions')}</th>
```

### 4.11 Replace Table Cell Content (Lines 360-426)

**Replace "Unknown" (Line 374):**
```tsx
// Before
{property.property_types?.display_name || 'Unknown'}
// After
{property.property_types?.display_name || tCommon('unknown')}
```

**Replace "No address provided" (Line 379):**
```tsx
// Before
{property.address || 'No address provided'}
// After
{property.address || t('labels.noAddress')}
```

**Replace action buttons (Lines 399, 407, 415):**
```tsx
// Before
View / Edit / Delete
// After
{tCommon('view')} / {tCommon('edit')} / {tCommon('delete')}
```

### 4.12 Replace Mobile Card Labels (Lines 450-475)

**Before:**
```tsx
<span className="text-xs font-medium text-gray-500">Address:</span>
<span className="text-xs font-medium text-gray-500">Owner:</span>
<span className="text-xs font-medium text-gray-500">Created:</span>
```

**After:**
```tsx
<span className="text-xs font-medium text-gray-500">{t('labels.address')}:</span>
<span className="text-xs font-medium text-gray-500">{t('labels.owner')}:</span>
<span className="text-xs font-medium text-gray-500">{t('labels.created')}</span>
```

### 4.13 Replace Pagination (Lines 517-534)

**Before:**
```tsx
<div className="text-sm text-gray-700 mb-2 sm:mb-0">
  Page {currentPage} of {totalPages}
</div>
...
<button ...>Previous</button>
<button ...>Next</button>
```

**After:**
```tsx
<div className="text-sm text-gray-700 mb-2 sm:mb-0">
  {tCommon('pagination.page', { current: currentPage, total: totalPages })}
</div>
...
<button ...>{tCommon('pagination.previous')}</button>
<button ...>{tCommon('pagination.next')}</button>
```

### 4.14 Replace Delete Modal (Lines 540-567)

**Before:**
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-2">Delete Property</h3>
<p className="text-sm text-gray-600 mb-4">
  Are you sure you want to delete the property "{propertyToDelete.nickname}"?
  This action cannot be undone.
</p>
...
<button ...>Cancel</button>
<button ...>{deletingProperty ? 'Deleting...' : 'Delete'}</button>
```

**After:**
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-2">{t('modals.delete.title')}</h3>
<p className="text-sm text-gray-600 mb-4">
  {t('modals.delete.message', { name: propertyToDelete.nickname })}
</p>
...
<button ...>{tCommon('cancel')}</button>
<button ...>{deletingProperty ? tCommon('deleting') : tCommon('delete')}</button>
```

**Acceptance Criteria for Task 4:**
- [ ] All 60+ strings replaced with translation references
- [ ] Error states display translated content
- [ ] Search/filter labels translate correctly
- [ ] Table headers and content translate correctly
- [ ] Mobile card view translates correctly
- [ ] Pagination controls translate correctly
- [ ] Delete modal with interpolation works correctly
- [ ] No TypeScript errors

---

## Task 5: Update Dashboard Properties List Page

**File:** `/src/app/dashboard/properties/page.tsx`
**Estimated Time:** 25-30 minutes
**String Count:** ~40 strings

### 5.1 Add Import and Translation Hook

```typescript
import { useTranslations } from 'next-intl';

// Inside component
const t = useTranslations('properties');
const tCommon = useTranslations('common');
```

### 5.2 Replace Loading State

**Before:**
```tsx
<div>Loading properties management...</div>
```

**After:**
```tsx
<div>{t('pages.loading')}</div>
```

### 5.3 Replace Auth Messages

**Before:**
```tsx
<h2>Authentication Required</h2>
<p>Please log in to access properties management.</p>
<Link ...>Go to Login</Link>
```

**After:**
```tsx
<h2>{t('pages.auth.title')}</h2>
<p>{t('pages.auth.message')}</p>
<Link ...>{tCommon('goToLogin')}</Link>
```

### 5.4 Replace Access Denied Messages

**Before:**
```tsx
<h2>Access Denied</h2>
<p>You do not have permission to view properties.</p>
<Link ...>Back to Dashboard</Link>
```

**After:**
```tsx
<h2>{t('pages.accessDenied.title')}</h2>
<p>{t('pages.accessDenied.message')}</p>
<Link ...>{tCommon('backToDashboard')}</Link>
```

### 5.5 Replace Page Header

**Before:**
```tsx
<h1>Properties Management</h1>
<p>Manage your properties</p>
<Link ...>← Back to Dashboard</Link>
<button ...>Add Property</button>
```

**After:**
```tsx
<h1>{t('pages.management.title')}</h1>
<p>{t('pages.management.description')}</p>
<Link ...>{tCommon('backToDashboard')}</Link>
<button ...>{t('actions.add')}</button>
```

**Acceptance Criteria for Task 5:**
- [ ] Loading state translates correctly
- [ ] Auth messages translate correctly
- [ ] Access denied messages translate correctly
- [ ] Page header elements translate correctly
- [ ] No TypeScript errors

---

## Task 6: Update Property Detail Page (Dashboard)

**File:** `/src/app/dashboard/properties/[propertyId]/page.tsx`
**Estimated Time:** 30-35 minutes
**String Count:** ~45 strings

### 6.1 Add Import and Translation Hook

```typescript
import { useTranslations } from 'next-intl';

// Inside component
const t = useTranslations('properties');
const tCommon = useTranslations('common');
```

### 6.2 Replace Invalid ID Error

**Before:**
```tsx
<h2>Invalid Property ID</h2>
<p>No property ID provided in the URL.</p>
<Link ...>Back to Dashboard</Link>
```

**After:**
```tsx
<h2>{t('errors.invalidId.title')}</h2>
<p>{t('errors.invalidId.message')}</p>
<Link ...>{tCommon('backToDashboard')}</Link>
```

### 6.3 Replace Loading State

**Before:**
```tsx
<div>Loading property...</div>
```

**After:**
```tsx
<div>{t('pages.loadingProperty')}</div>
```

### 6.4 Replace Error State

**Before:**
```tsx
<h2>Error</h2>
<button ...>Try Again</button>
```

**After:**
```tsx
<h2>{tCommon('error')}</h2>
<button ...>{tCommon('tryAgain')}</button>
```

### 6.5 Replace Page Header and Actions

**Before:**
```tsx
<h2>Property Details</h2>
<button ...>Print QR Codes</button>
<button ...>Loading...</button>
```

**After:**
```tsx
<h2>{t('pages.detail.subtitle')}</h2>
<button ...>{t('actions.printQR')}</button>
<button ...>{tCommon('loading')}</button>
```

### 6.6 Replace Property Information Section

**Before:**
```tsx
<h3>Property Information</h3>
<dt>Name</dt>
<dt>Address</dt>
<dd>No address provided</dd>
<dt>Property Type</dt>
<dd>Unknown type</dd>
<dt>Property ID</dt>
<dt>Created</dt>
<dt>Last Updated</dt>
```

**After:**
```tsx
<h3>{t('pages.detail.information')}</h3>
<dt>{t('labels.name')}</dt>
<dt>{t('labels.address')}</dt>
<dd>{t('labels.noAddress')}</dd>
<dt>{t('labels.type')}</dt>
<dd>{t('labels.unknownType')}</dd>
<dt>{t('labels.id')}</dt>
<dt>{tCommon('created')}</dt>
<dt>{tCommon('lastUpdated')}</dt>
```

### 6.7 Replace Items Section

**Before:**
```tsx
<h3>Items in this Property</h3>
<div>Loading items...</div>
<h4>No items</h4>
<p>This property doesn't have any items yet.</p>
<span>Added:</span>
<span>Updated:</span>
```

**After:**
```tsx
<h3>{t('pages.detail.itemsSection')}</h3>
<div>{t('pages.detail.loadingItems')}</div>
<h4>{t('pages.detail.noItems.title')}</h4>
<p>{t('pages.detail.noItems.message')}</p>
<span>{tCommon('added')}:</span>
<span>{tCommon('updated')}:</span>
```

**Acceptance Criteria for Task 6:**
- [ ] All error states translate correctly
- [ ] Loading states translate correctly
- [ ] Property information labels translate correctly
- [ ] Items section translates correctly
- [ ] No TypeScript errors

---

## Task 7: Update Property Detail Page (Admin)

**File:** `/src/app/admin/properties/[propertyId]/page.tsx`
**Estimated Time:** 35-40 minutes
**String Count:** ~55 strings

### 7.1 Add Import and Translation Hook

```typescript
import { useTranslations } from 'next-intl';

// Inside component
const t = useTranslations('properties');
const tCommon = useTranslations('common');
```

### 7.2 Replace Breadcrumb Navigation

**Before:**
```tsx
<span>Admin</span>
<span>Properties</span>
<span>Property Details</span>
```

**After:**
```tsx
<span>{tCommon('admin')}</span>
<span>{t('title')}</span>
<span>{t('pages.detail.breadcrumb')}</span>
```

### 7.3 Replace Error States

**Before:**
```tsx
<h2>Invalid Property ID</h2>
<p>No property ID provided in the URL.</p>
<Link ...>Back to Properties</Link>
<h2>Error Loading Property</h2>
<button ...>Try Again</button>
```

**After:**
```tsx
<h2>{t('errors.invalidId.title')}</h2>
<p>{t('errors.invalidId.message')}</p>
<Link ...>{t('actions.backToList')}</Link>
<h2>{t('errors.loading.title')}</h2>
<button ...>{tCommon('tryAgain')}</button>
```

### 7.4 Replace Page Header

**Before:**
```tsx
<h1>Property Details</h1>
<button ...>Edit Property</button>
<Link ...>Back to Properties</Link>
```

**After:**
```tsx
<h1>{t('pages.detail.subtitle')}</h1>
<button ...>{t('actions.edit')}</button>
<Link ...>{t('actions.backToList')}</Link>
```

### 7.5 Replace Property Information Section

**Before:**
```tsx
<h2>Property Information</h2>
<p>Detailed information about this property.</p>
<dt>Property Nickname</dt>
<dt>Property Type</dt>
<dt>Property ID</dt>
<dt>Owner</dt>
<dt>Account ID</dt>
<dt>Created</dt>
<dt>Last Updated</dt>
<dt>Address</dt>
```

**After:**
```tsx
<h2>{t('pages.detail.information')}</h2>
<p>{t('pages.detail.informationDesc')}</p>
<dt>{t('labels.nickname')}</dt>
<dt>{t('labels.type')}</dt>
<dt>{t('labels.id')}</dt>
<dt>{t('labels.owner')}</dt>
<dt>{t('labels.accountId')}</dt>
<dt>{tCommon('created')}</dt>
<dt>{tCommon('lastUpdated')}</dt>
<dt>{t('labels.address')}</dt>
```

### 7.6 Replace Quick Actions Section

**Before:**
```tsx
<h3>Quick Actions</h3>
<button ...>Edit Property</button>
<button ...>View Items</button>
<button ...>Print QR Codes</button>
```

**After:**
```tsx
<h3>{t('pages.detail.quickActions')}</h3>
<button ...>{t('actions.edit')}</button>
<button ...>{t('actions.viewItems')}</button>
<button ...>{t('actions.printQR')}</button>
```

**Acceptance Criteria for Task 7:**
- [ ] Breadcrumb navigation translates correctly
- [ ] All error states translate correctly
- [ ] Property information labels translate correctly
- [ ] Quick actions translate correctly
- [ ] No TypeScript errors

---

## Task 8: Update Property Edit Page

**File:** `/src/app/admin/properties/[propertyId]/edit/page.tsx`
**Estimated Time:** 20-25 minutes
**String Count:** ~25 strings

### 8.1 Add Import and Translation Hook

```typescript
import { useTranslations } from 'next-intl';

// Inside component
const t = useTranslations('properties');
const tCommon = useTranslations('common');
```

### 8.2 Replace Breadcrumb Navigation

**Before:**
```tsx
<span>Admin</span>
<span>Properties</span>
<span>Edit Property</span>
```

**After:**
```tsx
<span>{tCommon('admin')}</span>
<span>{t('title')}</span>
<span>{t('pages.edit.breadcrumb')}</span>
```

### 8.3 Replace Error States

**Before:**
```tsx
<h2>Error Loading Property</h2>
<h2>Error Loading Data</h2>
<h2>Data Not Available</h2>
<p>Property data could not be loaded.</p>
<p>Property types are not available.</p>
<Link ...>Back to Properties</Link>
<button ...>Try Again</button>
```

**After:**
```tsx
<h2>{t('errors.loading.title')}</h2>
<h2>{t('errors.loadingData.title')}</h2>
<h2>{t('errors.dataNotAvailable.title')}</h2>
<p>{t('errors.propertyNotLoaded')}</p>
<p>{t('errors.typesNotAvailable')}</p>
<Link ...>{t('actions.backToList')}</Link>
<button ...>{tCommon('tryAgain')}</button>
```

### 8.4 Replace Page Header with Interpolation

**Before:**
```tsx
<h1>Edit Property</h1>
<p>Modify the details of "{property.nickname}"</p>
```

**After:**
```tsx
<h1>{t('pages.edit.title')}</h1>
<p>{t('pages.edit.subtitle', { name: property.nickname })}</p>
```

**Acceptance Criteria for Task 8:**
- [ ] Breadcrumb navigation translates correctly
- [ ] Error states translate correctly
- [ ] Page header with interpolation works correctly
- [ ] No TypeScript errors

---

## Task 9: Update Property New Page

**File:** `/src/app/admin/properties/new/page.tsx`
**Estimated Time:** 20-25 minutes
**String Count:** ~25 strings

### 9.1 Add Import and Translation Hook

```typescript
import { useTranslations } from 'next-intl';

// Inside component
const t = useTranslations('properties');
const tCommon = useTranslations('common');
```

### 9.2 Replace Breadcrumb Navigation

**Before:**
```tsx
<span>Admin</span>
<span>Properties</span>
<span>New Property</span>
```

**After:**
```tsx
<span>{tCommon('admin')}</span>
<span>{t('title')}</span>
<span>{t('pages.new.breadcrumb')}</span>
```

### 9.3 Replace Error States

**Before:**
```tsx
<h2>Error Loading Data</h2>
<h2>Setup Required</h2>
<p>No property types are available. Please contact your administrator to set up property types before creating properties.</p>
<Link ...>Back to Properties</Link>
<button ...>Try Again</button>
```

**After:**
```tsx
<h2>{t('errors.loadingData.title')}</h2>
<h2>{t('errors.setupRequired.title')}</h2>
<p>{t('errors.setupRequired.message')}</p>
<Link ...>{t('actions.backToList')}</Link>
<button ...>{tCommon('tryAgain')}</button>
```

### 9.4 Replace Page Header with Dynamic Target

**Before:**
```tsx
<h1>Create New Property</h1>
<p>Add a new property to {isAdmin ? 'the system' : 'your account'}</p>
```

**After:**
```tsx
<h1>{t('pages.new.title')}</h1>
<p>{t('pages.new.subtitle', { target: isAdmin ? t('pages.new.targetSystem') : t('pages.new.targetAccount') })}</p>
```

**Acceptance Criteria for Task 9:**
- [ ] Breadcrumb navigation translates correctly
- [ ] Error states translate correctly
- [ ] Page header with dynamic target works correctly
- [ ] No TypeScript errors

---

## Task 10: Update QR Print Page

**File:** `/src/app/admin/properties/[propertyId]/qr-print/page.tsx`
**Estimated Time:** 15-20 minutes
**String Count:** ~15 strings

### 10.1 Add Import and Translation Hook

```typescript
import { useTranslations } from 'next-intl';

// Inside component
const t = useTranslations('properties');
const tCommon = useTranslations('common');
```

### 10.2 Replace Error State

**Before:**
```tsx
<h2>Error Loading QR Print</h2>
<button ...>Close Window</button>
```

**After:**
```tsx
<h2>{t('qrPrint.error.title')}</h2>
<button ...>{tCommon('closeWindow')}</button>
```

### 10.3 Replace Page Header

**Before:**
```tsx
<h1>QR Code Print Manager</h1>
<p>Generate and print QR codes for property items</p>
<span> - Items pre-loaded from main window</span>
```

**After:**
```tsx
<h1>{t('qrPrint.title')}</h1>
<p>{t('qrPrint.description')}</p>
<span>{t('qrPrint.preloaded')}</span>
```

**Acceptance Criteria for Task 10:**
- [ ] Error state translates correctly
- [ ] Page header translates correctly
- [ ] Pre-loaded indicator translates correctly
- [ ] No TypeScript errors

---

## Task 11: Copy Translations to Other Language Files

**Estimated Time:** 30-45 minutes
**Files to Modify:** `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`

### 11.1 Copy Structure to All Files

Copy the complete `properties` namespace structure from `en.json` to all 5 other language files. Initially, keep English values as placeholders.

### 11.2 Generate French Translations

Replace English values with French translations in `/messages/fr.json`.

**Example translations:**
```json
{
  "properties": {
    "title": "Proprietes",
    "pages": {
      "myProperties": {
        "title": "Mes Proprietes",
        "description": "Gerez vos proprietes et leurs parametres"
      }
    },
    "section": {
      "itemCount": "{count, plural, one {# article} other {# articles}}",
      "roomCount": "{count, plural, one {# piece} other {# pieces}}"
    }
  }
}
```

### 11.3 Generate Spanish Translations

Replace English values with Spanish translations in `/messages/es.json`.

### 11.4 Generate German Translations

Replace English values with German translations in `/messages/de.json`.

### 11.5 Generate Dutch Translations

Replace English values with Dutch translations in `/messages/nl.json`.

### 11.6 Generate Italian Translations

Replace English values with Italian translations in `/messages/it.json`.

**Acceptance Criteria for Task 11:**
- [ ] All 6 language files have identical key structures
- [ ] All translations are contextually appropriate
- [ ] Pluralization rules are correct for each language
- [ ] No missing keys in any language file

---

## Task 12: Verify Build and Test

**Estimated Time:** 45-60 minutes

### 12.1 TypeScript Compilation Check

```bash
npm run type-check
# or
npx tsc --noEmit
```

**Expected:** No type errors related to translation hooks or missing keys.

### 12.2 Build Verification

```bash
npm run build
```

**Expected:** Build completes successfully without errors.

### 12.3 Development Server Test

```bash
npm run dev
```

Navigate to each property page and verify:
- [ ] `/dashboard2/properties` - My Properties page
- [ ] `/dashboard/properties` - Properties Management page
- [ ] `/dashboard/properties/[id]` - Property Detail page (dashboard)
- [ ] `/admin/properties/[id]` - Property Detail page (admin)
- [ ] `/admin/properties/[id]/edit` - Property Edit page
- [ ] `/admin/properties/new` - Property New page
- [ ] `/admin/properties/[id]/qr-print` - QR Print page

### 12.4 Language Switching Test

For each page, test language switching:
1. Switch to French (fr)
2. Verify all strings display in French
3. Repeat for Spanish, German, Dutch, Italian

### 12.5 Pluralization Test

Test item and room counts:
- 0 items/rooms
- 1 item/room
- Multiple items/rooms

Verify correct plural forms in all languages.

### 12.6 Variable Interpolation Test

Test strings with dynamic values:
- Property name in delete confirmation
- Property name in edit page subtitle
- Search results count
- Pagination display

### 12.7 Error State Test

Trigger error states and verify:
- Invalid property ID error displays correctly
- Loading error displays correctly
- Permission warnings display correctly

### 12.8 Empty State Test

Test with:
- No properties (new user)
- No search results

Verify empty state messages display correctly.

**Acceptance Criteria for Task 12:**
- [ ] TypeScript compilation passes
- [ ] Build completes successfully
- [ ] All pages render correctly in English
- [ ] All pages render correctly in all 5 non-English languages
- [ ] Pluralization works correctly
- [ ] Variable interpolation works correctly
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] No console errors or warnings

---

## Final Checklist

### Code Quality
- [ ] No hardcoded English strings remain in property pages
- [ ] All translation keys follow naming convention
- [ ] No unused translation keys
- [ ] TypeScript types are correct

### Translation Coverage
- [ ] All 308 strings extracted
- [ ] All 6 language files complete
- [ ] Pluralization implemented correctly
- [ ] Variable interpolation implemented correctly

### Testing
- [ ] All property pages tested manually
- [ ] All languages tested
- [ ] Edge cases covered (empty states, errors)
- [ ] Mobile responsive view tested

### Documentation
- [ ] Overview document updated with completion status
- [ ] Any issues or deviations documented

---

## Rollback Plan

If issues are encountered:

1. **Translation Key Issues:** Revert changes to `/messages/*.json` files
2. **Component Issues:** Revert individual component files using git
3. **Build Failures:** Check for missing imports or syntax errors

```bash
# Revert all changes to messages files
git checkout -- messages/

# Revert specific component
git checkout -- src/components/PropertiesManagement.tsx
```

---

## References

- Overview Document: `/docs/REQ-E02-010-update-property-pages-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- next-intl Documentation: https://next-intl-docs.vercel.app/
- ICU Message Format: https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
*Task ID: 2F.4 - Update property pages*
