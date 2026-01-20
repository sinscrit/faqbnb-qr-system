# Implementation Overview: REQ-E02-010 - Update Property Pages with Localized Strings

**Document Created:** 2026-01-20 19:45:00 UTC
**Last Modified:** 2026-01-20 19:45:00 UTC

**Request ID:** REQ-E02-010
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.4
**Size:** L (Large)
**Priority:** P2

---

## 1. Summary

Update all property-related pages including property listing pages, property detail pages, property management pages, and property creation/edit pages to use localized translation references instead of hardcoded English strings. This task covers approximately 10-12 page files with an estimated 150+ unique strings across page titles, section headings, table headers, column labels, status indicators, action links, navigation breadcrumbs, metadata labels, empty state messages, and instructional content.

---

## 2. Current State Analysis

### 2.1 Property Page Inventory

| File | Location | Component Type | Est. Strings |
|------|----------|----------------|--------------|
| **My Properties Page** | `/src/app/dashboard2/properties/page.tsx` | Client Component | ~15 |
| **Dashboard Properties List** | `/src/app/dashboard/properties/page.tsx` | Client Component | ~40 |
| **Property Detail (dashboard)** | `/src/app/dashboard/properties/[propertyId]/page.tsx` | Client Component | ~45 |
| **Property Detail (admin)** | `/src/app/admin/properties/[propertyId]/page.tsx` | Client Component | ~55 |
| **Property Edit Page** | `/src/app/admin/properties/[propertyId]/edit/page.tsx` | Client Component | ~25 |
| **Property New Page** | `/src/app/admin/properties/new/page.tsx` | Client Component | ~25 |
| **QR Print Page** | `/src/app/admin/properties/[propertyId]/qr-print/page.tsx` | Client Component | ~15 |
| **Admin Properties Redirect** | `/src/app/admin/properties/page.tsx` | Client Component | ~3 |
| **PropertySection** | `/src/components/SimpleDashboard/PropertySection.tsx` | Client Component | ~25 |
| **PropertiesManagement** | `/src/components/PropertiesManagement.tsx` | Client Component | ~60 |

**Total Estimated Strings:** ~308 unique strings

### 2.2 String Categories by Page

#### 2.2.1 My Properties Page (`/src/app/dashboard2/properties/page.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Page Title | "My Properties" | 91 | `properties.pages.myProperties.title` |
| Page Description | "Manage your properties and their settings" | 93 | `properties.pages.myProperties.description` |
| Auth Message | "Please log in to view properties." | 82 | `properties.pages.auth.loginRequired` |
| Success Toast | "Property updated successfully" | 51 | `properties.notifications.updateSuccess` |
| Success Toast | "Property created successfully" | 74 | `properties.notifications.createSuccess` |

#### 2.2.2 Dashboard Properties List (`/src/app/dashboard/properties/page.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Loading | "Loading properties management..." | 203 | `properties.pages.loading` |
| Auth Title | "Authentication Required" | 213 | `properties.pages.auth.title` |
| Auth Message | "Please log in to access properties management." | 214 | `properties.pages.auth.message` |
| Auth Button | "Go to Login" | 218 | `common.goToLogin` |
| Access Denied | "Access Denied" | 228 | `properties.pages.accessDenied.title` |
| Access Denied Msg | "You do not have permission to view properties." | 229 | `properties.pages.accessDenied.message` |
| Back to Dashboard | "Back to Dashboard" | 233 | `common.backToDashboard` |
| Page Title | "Properties Management" | 248 | `properties.pages.management.title` |
| Page Description | "Manage your properties" | 250 | `properties.pages.management.description` |
| Back Button | "← Back to Dashboard" | 262 | `common.backToDashboard` |
| Add Button | "Add Property" | 271 | `properties.actions.add` |

#### 2.2.3 Property Detail Page (dashboard) (`/src/app/dashboard/properties/[propertyId]/page.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Error Title | "Invalid Property ID" | 31 | `properties.errors.invalidId.title` |
| Error Message | "No property ID provided in the URL." | 32 | `properties.errors.invalidId.message` |
| Back Button | "Back to Dashboard" | 37 | `common.backToDashboard` |
| Error Title | "Error" | 230 | `common.error` |
| Try Again | "Try Again" | 236 | `common.tryAgain` |
| Loading | "Loading property..." | 210 | `properties.pages.loadingProperty` |
| Page Subtitle | "Property Details" | 273 | `properties.pages.detail.subtitle` |
| Print QR | "Print QR Codes" | 282 | `properties.actions.printQR` |
| Loading... | "Loading..." | 282 | `common.loading` |
| Section Title | "Property Information" | 294 | `properties.pages.detail.information` |
| Label: Name | "Name" | 297 | `properties.labels.name` |
| Label: Address | "Address" | 300 | `properties.labels.address` |
| No Address | "No address provided" | 301 | `properties.labels.noAddress` |
| Label: Type | "Property Type" | 305 | `properties.labels.type` |
| Unknown Type | "Unknown type" | 307 | `properties.labels.unknownType` |
| Label: ID | "Property ID" | 312 | `properties.labels.id` |
| Label: Created | "Created" | 316 | `common.created` |
| Label: Updated | "Last Updated" | 322 | `common.lastUpdated` |
| Section Title | "Items in this Property" | 338 | `properties.pages.detail.itemsSection` |
| Loading Items | "Loading items..." | 349 | `properties.pages.detail.loadingItems` |
| No Items Title | "No items" | 353 | `properties.pages.detail.noItems.title` |
| No Items Msg | "This property doesn't have any items yet." | 355 | `properties.pages.detail.noItems.message` |
| Added Label | "Added:" | 376 | `common.added` |
| Updated Label | "Updated:" | 378 | `common.updated` |

#### 2.2.4 Property Detail Page (admin) (`/src/app/admin/properties/[propertyId]/page.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Error Title | "Invalid Property ID" | 32 | `properties.errors.invalidId.title` |
| Error Message | "No property ID provided in the URL." | 33 | `properties.errors.invalidId.message` |
| Back Button | "Back to Properties" | 38 | `properties.actions.backToList` |
| Breadcrumb: Admin | "Admin" | 224 | `common.admin` |
| Breadcrumb: Properties | "Properties" | 237 | `properties.title` |
| Breadcrumb: Details | "Property Details" | 246 | `properties.pages.detail.breadcrumb` |
| Error Title | "Error Loading Property" | 259 | `properties.errors.loading.title` |
| Try Again | "Try Again" | 266 | `common.tryAgain` |
| Page Subtitle | "Property Details" | 326 | `properties.pages.detail.subtitle` |
| Edit Button | "Edit Property" | 337 | `properties.actions.edit` |
| Back Button | "Back to Properties" | 346 | `properties.actions.backToList` |
| Section Title | "Property Information" | 355 | `properties.pages.detail.information` |
| Section Subtitle | "Detailed information about this property." | 358 | `properties.pages.detail.informationDesc` |
| Label: Nickname | "Property Nickname" | 367 | `properties.labels.nickname` |
| Label: Type | "Property Type" | 372 | `properties.labels.type` |
| Label: ID | "Property ID" | 382 | `properties.labels.id` |
| Label: Owner | "Owner" | 389 | `properties.labels.owner` |
| Label: Account | "Account ID" | 402 | `properties.labels.accountId` |
| Label: Created | "Created" | 410 | `common.created` |
| Label: Updated | "Last Updated" | 417 | `common.lastUpdated` |
| Label: Address | "Address" | 425 | `properties.labels.address` |
| Section Title | "Quick Actions" | 437 | `properties.pages.detail.quickActions` |
| Edit Property | "Edit Property" | 450 | `properties.actions.edit` |
| View Items | "View Items" | 460 | `properties.actions.viewItems` |
| Print QR | "Print QR Codes" | 471 | `properties.actions.printQR` |

#### 2.2.5 Property Edit/New Pages (`edit/page.tsx`, `new/page.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Breadcrumb: Admin | "Admin" | Various | `common.admin` |
| Breadcrumb: Properties | "Properties" | Various | `properties.title` |
| Breadcrumb: Edit | "Edit Property" | Various | `properties.pages.edit.breadcrumb` |
| Breadcrumb: New | "New Property" | Various | `properties.pages.new.breadcrumb` |
| Error Title | "Error Loading Property" | Various | `properties.errors.loading.title` |
| Error Title | "Error Loading Data" | Various | `properties.errors.loadingData.title` |
| Data Not Available | "Data Not Available" | Various | `properties.errors.dataNotAvailable.title` |
| Property Not Loaded | "Property data could not be loaded." | Various | `properties.errors.propertyNotLoaded` |
| Types Not Available | "Property types are not available." | Various | `properties.errors.typesNotAvailable` |
| Setup Required | "Setup Required" | Various | `properties.errors.setupRequired.title` |
| Setup Message | "No property types are available. Please contact your administrator to set up property types before creating properties." | Various | `properties.errors.setupRequired.message` |
| Back Button | "Back to Properties" | Various | `properties.actions.backToList` |
| Try Again | "Try Again" | Various | `common.tryAgain` |
| Page Title: Edit | "Edit Property" | 335 | `properties.pages.edit.title` |
| Page Subtitle: Edit | "Modify the details of \"{name}\"" | 337 | `properties.pages.edit.subtitle` |
| Page Title: Create | "Create New Property" | 300 | `properties.pages.new.title` |
| Page Subtitle: Create | "Add a new property to {target}" | 302 | `properties.pages.new.subtitle` |
| Target: System | "the system" | 302 | `properties.pages.new.targetSystem` |
| Target: Account | "your account" | 302 | `properties.pages.new.targetAccount` |

#### 2.2.6 QR Print Page (`qr-print/page.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Error Title | "Error Loading QR Print" | 128 | `properties.qrPrint.error.title` |
| Close Window | "Close Window" | 133 | `common.closeWindow` |
| Page Title | "🖨️ QR Code Print Manager" | 145 | `properties.qrPrint.title` |
| Page Description | "Generate and print QR codes for property items" | 148 | `properties.qrPrint.description` |
| Pre-loaded Note | " - Items pre-loaded from main window" | 150 | `properties.qrPrint.preloaded` |

#### 2.2.7 PropertySection Component (`PropertySection.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Heading Singular | "My Property" | 256 | `properties.section.headingSingular` |
| Heading Plural | "My Properties" | 256 | `properties.section.headingPlural` |
| Item Count | "{count} item" / "{count} items" | 67, 192 | `properties.section.itemCount` (pluralized) |
| Room Count | "{count} room" / "{count} rooms" | 71, 196 | `properties.section.roomCount` (pluralized) |
| Empty Title | "Let's add your property" | 129 | `properties.section.empty.title` |
| Empty Description | "A property is where your items live - like a vacation rental or home." | 130 | `properties.section.empty.description` |
| Add Button | "Add Property" | 131 | `properties.actions.add` |
| Add New Button | "Add New Property" | 342 | `properties.actions.addNew` |
| Aria: Edit | "Edit property: {name}" | 55, 175 | `properties.section.aria.editProperty` |
| Aria: Add | "Add a new property" | 339 | `properties.section.aria.addProperty` |
| Loading Label | "Loading properties" | 89 | `properties.section.loading` |

#### 2.2.8 PropertiesManagement Component (`PropertiesManagement.tsx`)

| Category | String | Line | Translation Key |
|----------|--------|------|-----------------|
| Error Title | "Error Loading Properties" | 187 | `properties.errors.loading.title` |
| Try Again | "Try Again" | 194 | `common.tryAgain` |
| Warning Title | "Limited Permissions" | 213 | `properties.permissions.limited.title` |
| Cannot Manage | "Cannot manage properties." | 215 | `properties.permissions.cannotManage` |
| Cannot Edit | "Cannot edit properties." | 216 | `properties.permissions.cannotEdit` |
| Cannot Delete | "Cannot delete properties." | 217 | `properties.permissions.cannotDelete` |
| Search Label | "Search Properties" | 230 | `properties.search.label` |
| Search Placeholder | "Search by name, address, type, or owner..." | 239 | `properties.search.placeholder` |
| Filter: Type Label | "Filter by Type" | 248 | `properties.filters.typeLabel` |
| Filter: All Types | "All Types" | 258 | `properties.filters.allTypes` |
| Filter: Owner Label | "Filter by Owner" | 277 | `properties.filters.ownerLabel` |
| Filter: All Owners | "All Owners" | 287 | `properties.filters.allOwners` |
| Results Summary | "Showing {count} of {total} properties" | 307 | `properties.search.results` |
| Results Matching | " matching \"{query}\"" | 308 | `properties.search.matching` |
| No Results Title | "No Properties Found" | 319 | `properties.search.noResults.title` |
| No Results Search | "No properties match your search criteria." | 321 | `properties.search.noResults.searchMessage` |
| No Results Empty | "Get started by creating your first property." | 321 | `properties.search.noResults.emptyMessage` |
| Table: Property | "Property" | 338 | `properties.table.property` |
| Table: Type | "Type" | 341 | `properties.table.type` |
| Table: Address | "Address" | 344 | `properties.table.address` |
| Table: Owner | "Owner" | 348 | `properties.table.owner` |
| Table: Created | "Created" | 352 | `properties.table.created` |
| Table: Actions | "Actions" | 355 | `properties.table.actions` |
| Unknown Type | "Unknown" | 374 | `common.unknown` |
| No Address | "No address provided" | 379 | `properties.labels.noAddress` |
| Action: View | "View" | 399 | `common.view` |
| Action: Edit | "Edit" | 407 | `common.edit` |
| Action: Delete | "Delete" | 415 | `common.delete` |
| Mobile: Address | "Address:" | 453 | `properties.labels.address` |
| Mobile: Owner | "Owner:" | 462 | `properties.labels.owner` |
| Mobile: Created | "Created:" | 469 | `properties.labels.created` |
| Pagination | "Page {current} of {total}" | 518 | `common.pagination.page` |
| Previous | "Previous" | 526 | `common.pagination.previous` |
| Next | "Next" | 531 | `common.pagination.next` |
| Delete Modal Title | "Delete Property" | 544 | `properties.modals.delete.title` |
| Delete Confirm | "Are you sure you want to delete the property \"{name}\"? This action cannot be undone." | 546 | `properties.modals.delete.message` |
| Cancel | "Cancel" | 554 | `common.cancel` |
| Delete Button | "Delete" | 561 | `common.delete` |
| Deleting | "Deleting..." | 562 | `common.deleting` |

---

## 3. Technical Approach

### 3.1 Translation Pattern

Following the established pattern from Epic 1:

```typescript
// For Client Components
'use client';
import { useTranslations } from 'next-intl';

export default function PropertiesPage() {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');

  return (
    <h1>{t('pages.myProperties.title')}</h1>
  );
}
```

### 3.2 Namespace Structure

Add to `/messages/en.json` under the `properties` namespace:

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
    },
    "labels": {
      "name": "Name",
      "nickname": "Property Nickname",
      "type": "Property Type",
      "address": "Address",
      "noAddress": "No address provided",
      "unknownType": "Unknown type",
      "id": "Property ID",
      "owner": "Owner",
      "accountId": "Account ID"
    },
    "actions": {
      "add": "Add Property",
      "addNew": "Add New Property",
      "edit": "Edit Property",
      "delete": "Delete Property",
      "view": "View Property",
      "viewItems": "View Items",
      "printQR": "Print QR Codes",
      "backToList": "Back to Properties"
    },
    "notifications": {
      "createSuccess": "Property created successfully",
      "updateSuccess": "Property updated successfully",
      "deleteSuccess": "Property deleted successfully"
    },
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
    },
    "permissions": {
      "limited": {
        "title": "Limited Permissions"
      },
      "cannotManage": "Cannot manage properties.",
      "cannotEdit": "Cannot edit properties.",
      "cannotDelete": "Cannot delete properties."
    },
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
    },
    "table": {
      "property": "Property",
      "type": "Type",
      "address": "Address",
      "owner": "Owner",
      "created": "Created",
      "actions": "Actions"
    },
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
    },
    "modals": {
      "delete": {
        "title": "Delete Property",
        "message": "Are you sure you want to delete the property \"{name}\"? This action cannot be undone."
      }
    },
    "qrPrint": {
      "title": "🖨️ QR Code Print Manager",
      "description": "Generate and print QR codes for property items",
      "preloaded": " - Items pre-loaded from main window",
      "error": {
        "title": "Error Loading QR Print"
      }
    }
  }
}
```

### 3.3 Pluralization Patterns (ICU Format)

```typescript
// Item count
t('section.itemCount', { count: itemCount })
// "1 item" or "5 items"

// Room count
t('section.roomCount', { count: roomCount })
// "1 room" or "3 rooms"
```

### 3.4 Variable Interpolation

```typescript
// Property name in delete confirmation
t('modals.delete.message', { name: property.nickname })

// Edit page subtitle
t('pages.edit.subtitle', { name: property.nickname })

// Search results
t('search.results', { count: filteredCount, total: totalCount })
```

### 3.5 Reusing Common Translations

The following strings should use the existing `common` namespace:
- "Cancel", "Delete", "Edit", "View" -> `tCommon('cancel')`, etc.
- "Try Again" -> `tCommon('tryAgain')`
- "Loading..." -> `tCommon('loading')`
- "Back to Dashboard" -> `tCommon('backToDashboard')`
- "Created", "Last Updated" -> `tCommon('created')`, `tCommon('lastUpdated')`
- Pagination controls -> `tCommon('pagination.*')`
- "Admin" -> `tCommon('admin')`
- "Unknown" -> `tCommon('unknown')`

---

## 4. Implementation Tasks

### Task 1: Add Translation Keys to Messages File
- Add `properties.pages` namespace to `/messages/en.json`
- Add `properties.labels`, `properties.actions`, `properties.errors` sections
- Add `properties.search`, `properties.filters`, `properties.table` sections
- Add `properties.section`, `properties.modals`, `properties.qrPrint` sections
- Ensure all 6 language files are updated with the same structure

### Task 2: Update My Properties Page (`/src/app/dashboard2/properties/page.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace page title, description, auth messages, success toasts
- Verify page renders correctly in all supported languages

### Task 3: Update Dashboard Properties List (`/src/app/dashboard/properties/page.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace loading state, auth messages, access denied messages
- Replace page header title and description
- Replace button labels

### Task 4: Update Property Detail Page - Dashboard (`/src/app/dashboard/properties/[propertyId]/page.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace error states, loading states
- Replace all section headings and labels
- Replace item section content and empty states
- Replace action buttons

### Task 5: Update Property Detail Page - Admin (`/src/app/admin/properties/[propertyId]/page.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace breadcrumb navigation text
- Replace error states, loading states
- Replace all section headings and labels
- Replace quick actions section
- Replace action buttons

### Task 6: Update Property Edit Page (`/src/app/admin/properties/[propertyId]/edit/page.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace breadcrumb navigation text
- Replace error states and messages
- Replace page header title and subtitle with interpolation

### Task 7: Update Property New Page (`/src/app/admin/properties/new/page.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace breadcrumb navigation text
- Replace error states and messages
- Replace page header title and subtitle with dynamic target

### Task 8: Update QR Print Page (`/src/app/admin/properties/[propertyId]/qr-print/page.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace page title and description
- Replace error messages and button labels

### Task 9: Update PropertySection Component (`PropertySection.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace heading (singular/plural)
- Replace item/room counts with pluralization
- Replace empty state messages
- Replace button labels and aria-labels

### Task 10: Update PropertiesManagement Component (`PropertiesManagement.tsx`)
- Import `useTranslations` from 'next-intl'
- Replace error states and permission warnings
- Replace search/filter labels and placeholders
- Replace table headers and cell content
- Replace pagination controls
- Replace delete modal content
- Replace all action buttons

### Task 11: Verify Build and Functionality
- Run TypeScript compilation to ensure no type errors
- Run build to verify no missing translation keys
- Test all pages in create, view, and edit modes
- Verify pluralization displays correctly
- Test all error states display correctly

### Task 12: Generate Translations for Non-English Languages
- Generate French translations
- Generate Spanish translations
- Generate German translations
- Generate Dutch translations
- Generate Italian translations

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/app/dashboard2/properties/page.tsx` | My Properties page | Add imports, replace hardcoded strings |
| `/src/app/dashboard/properties/page.tsx` | Dashboard Properties list | Add imports, replace hardcoded strings |
| `/src/app/dashboard/properties/[propertyId]/page.tsx` | Property detail (dashboard) | Add imports, replace hardcoded strings |
| `/src/app/admin/properties/[propertyId]/page.tsx` | Property detail (admin) | Add imports, replace hardcoded strings |
| `/src/app/admin/properties/[propertyId]/edit/page.tsx` | Property edit page | Add imports, replace hardcoded strings |
| `/src/app/admin/properties/new/page.tsx` | Property new page | Add imports, replace hardcoded strings |
| `/src/app/admin/properties/[propertyId]/qr-print/page.tsx` | QR print page | Add imports, replace hardcoded strings |
| `/src/app/admin/properties/page.tsx` | Admin redirect | Add imports, replace redirect message |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Property section component | Add imports, replace hardcoded strings |
| `/src/components/PropertiesManagement.tsx` | Properties management | Add imports, replace hardcoded strings |
| `/messages/en.json` | English translations | Add `properties` namespace content |
| `/messages/fr.json` | French translations | Add `properties` namespace content |
| `/messages/es.json` | Spanish translations | Add `properties` namespace content |
| `/messages/de.json` | German translations | Add `properties` namespace content |
| `/messages/nl.json` | Dutch translations | Add `properties` namespace content |
| `/messages/it.json` | Italian translations | Add `properties` namespace content |

### 5.2 Authorized Modifications by Component

#### `/src/app/dashboard2/properties/page.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-22 | Add `useTranslations` import |
| Component function start | 24-26 | Add translation hook initialization |
| Auth check JSX | 79-85 | Replace auth message string |
| Page title JSX | 90-95 | Replace title and description strings |
| Success banner | 98-107 | Use translation for success message |
| `handlePropertySave` | 47-54 | Replace success message string |
| `handlePropertyAdded` | 67-77 | Replace success message string |

#### `/src/app/dashboard/properties/page.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-12 | Add `useTranslations` import |
| Component function start | 13-35 | Add translation hook initialization |
| Loading state JSX | 198-207 | Replace loading message |
| Auth check JSX | 210-223 | Replace auth messages |
| Access denied JSX | 225-240 | Replace access denied messages |
| Page header JSX | 243-276 | Replace titles and button labels |

#### `/src/app/dashboard/properties/[propertyId]/page.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-9 | Add `useTranslations` import |
| Component function start | 11-18 | Add translation hook initialization |
| Invalid ID error JSX | 20-47 | Replace error messages |
| Loading state JSX | 205-216 | Replace loading message |
| Error state JSX | 218-252 | Replace error messages |
| Header JSX | 254-286 | Replace page title and action labels |
| Property info section | 288-329 | Replace all labels |
| Items section | 331-385 | Replace section title, empty state, labels |

#### `/src/app/admin/properties/[propertyId]/page.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-12 | Add `useTranslations` import |
| Component function start | 13-18 | Add translation hook initialization |
| Invalid ID JSX | 20-46 | Replace error messages |
| Loading state JSX | 191-211 | No text changes (visual only) |
| Error state JSX | 213-280 | Replace breadcrumbs, error messages |
| Main content JSX | 282-479 | Replace all labels and buttons |

#### `/src/app/admin/properties/[propertyId]/edit/page.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-17 | Add `useTranslations` import |
| Component function start | 19-31 | Add translation hook initialization |
| Loading state JSX | 152-175 | No text changes (visual only) |
| Error state JSX | 177-237 | Replace breadcrumbs, error messages |
| Data unavailable JSX | 239-293 | Replace messages |
| Page header JSX | 332-349 | Replace title and subtitle |

#### `/src/app/admin/properties/new/page.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-8 | Add `useTranslations` import |
| Component function start | 10-18 | Add translation hook initialization |
| Loading state JSX | 117-140 | No text changes (visual only) |
| Error state JSX | 142-202 | Replace breadcrumbs, error messages |
| Setup required JSX | 204-258 | Replace messages |
| Page header JSX | 298-304 | Replace title and subtitle with interpolation |

#### `/src/app/admin/properties/[propertyId]/qr-print/page.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-7 | Add `useTranslations` import |
| Component function start | 17-24 | Add translation hook initialization |
| Error state JSX | 123-139 | Replace error title and button |
| Page header JSX | 141-165 | Replace title and description |

#### `/src/components/SimpleDashboard/PropertySection.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-17 | Add `useTranslations` import |
| PropertyRow function | 39-80 | Add translation hook, replace aria-label, item/room counts |
| SinglePropertyCard function | 160-208 | Add translation hook, replace aria-label, item/room counts |
| PropertyEmptyState function | 125-136 | Add translation hook, replace strings |
| PropertySection function | 241-347 | Add translation hook, replace heading and button |

#### `/src/components/PropertiesManagement.tsx`
| Section | Lines | Modification |
|---------|-------|--------------|
| Import statements | 1-5 | Add `useTranslations` import |
| Component function start | 36-63 | Add translation hook initialization |
| Loading state JSX | 168-181 | No text changes (visual only) |
| Error state JSX | 183-199 | Replace error title and button |
| Permission warning JSX | 207-222 | Replace warning messages |
| Search/filter section | 224-311 | Replace labels and placeholders |
| No results JSX | 314-328 | Replace empty state messages |
| Table headers | 335-358 | Replace header text |
| Table cells | 360-426 | Replace "Unknown", "No address", action labels |
| Mobile cards | 428-510 | Replace labels |
| Pagination JSX | 514-537 | Replace pagination text |
| Delete modal JSX | 539-568 | Replace modal content |

### 5.3 Files NOT to Modify

- `/src/types/index.ts` - No type changes needed
- `/src/contexts/AuthContext.tsx` - No changes needed
- `/src/hooks/*.ts` - No changes needed
- API routes - No changes needed
- Database migrations - No changes needed
- `/src/components/PropertyForm.tsx` - Covered in separate task (REQ-E02-008)
- `/src/components/SimpleDashboard/PropertyEditModal.tsx` - Covered in separate task (REQ-E02-009)
- `/src/components/SimpleDashboard/AddPropertyModal.tsx` - Covered in separate task (REQ-E02-009)

---

## 6. Dependencies

### 6.1 Epic 1 Dependencies (Must be Complete)

| Dependency | Status | Notes |
|------------|--------|-------|
| next-intl package installed | Required | Package must be in `package.json` |
| IntlProvider in layout.tsx | Required | Provider must wrap application |
| Messages files exist | Required | All 6 language files must exist |
| `useTranslations` hook working | Required | Must be functional in client components |

### 6.2 Related Epic 2 Tasks

| Task | Relationship | Notes |
|------|--------------|-------|
| 2F.1: Create properties namespace | Prerequisite | Namespace structure should exist first |
| 2F.2: Update PropertyForm | Parallel | PropertyForm used by edit/new pages |
| 2F.3: Update property modals | Parallel | Modals used by property pages |
| 2H: Common & Shared | Prerequisite | Uses common namespace strings |

---

## 7. Acceptance Criteria

- [ ] All hardcoded strings in property pages are replaced with translation function calls
- [ ] Translation keys are added to all 6 language files under `properties` namespace
- [ ] Page titles display correctly using translations
- [ ] All breadcrumb navigation displays translated text
- [ ] All section headings display translated text
- [ ] All table headers and column labels display translated text
- [ ] All form labels and placeholders display translated text
- [ ] All error messages display translated text
- [ ] All empty state messages display translated text
- [ ] All action buttons display translated text
- [ ] Pluralization works correctly for item/room counts
- [ ] Variable interpolation works correctly (property names, counts)
- [ ] Delete confirmation modal displays translated text
- [ ] Pagination controls display translated text
- [ ] Search/filter labels display translated text
- [ ] All pages render correctly in all 6 supported languages without layout issues
- [ ] Page metadata (document titles) updates to match the user's language preference
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] No hardcoded English text remains in any property page component

---

## 8. Testing Checklist

### 8.1 Functional Testing
- [ ] My Properties page displays all labels correctly
- [ ] Dashboard Properties list displays all labels correctly
- [ ] Property detail page (dashboard) displays all labels correctly
- [ ] Property detail page (admin) displays all labels correctly
- [ ] Property edit page displays all labels correctly
- [ ] Property new page displays all labels correctly
- [ ] QR print page displays all labels correctly
- [ ] PropertySection component displays all labels correctly
- [ ] PropertiesManagement component displays all labels correctly
- [ ] Breadcrumb navigation works in all languages
- [ ] Delete modal shows correct translated message
- [ ] Pagination displays correctly
- [ ] Search/filter labels display correctly
- [ ] Empty states display correct messages
- [ ] Error states display correct messages

### 8.2 Language Testing
- [ ] Test in English (en) - source language
- [ ] Test in French (fr)
- [ ] Test in Spanish (es)
- [ ] Test in German (de)
- [ ] Test in Dutch (nl)
- [ ] Test in Italian (it)

### 8.3 Visual Regression
- [ ] No text overflow in page titles
- [ ] No text overflow in table headers
- [ ] No text overflow in buttons
- [ ] No text overflow in labels
- [ ] Buttons accommodate longer translated text
- [ ] Table columns accommodate longer translated text
- [ ] Layout remains consistent across languages
- [ ] Mobile view maintains correct layout

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation key at runtime | Low | Medium | Build-time check, fallback to English |
| Text overflow in other languages | Medium | Low | Test with German (typically longest) |
| Translation hook not available | Low | High | Verify Epic 1 foundation complete |
| Breaking existing functionality | Low | Medium | Comprehensive testing after changes |
| Large number of files to update | Medium | Low | Systematic approach, one file at a time |
| Inconsistent translation keys | Medium | Medium | Follow established naming conventions |
| Layout breaks with longer text | Medium | Low | Design with 40% text expansion in mind |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 30 minutes |
| Update dashboard2/properties page | 15 minutes |
| Update dashboard/properties page | 25 minutes |
| Update dashboard property detail page | 30 minutes |
| Update admin property detail page | 35 minutes |
| Update admin edit page | 20 minutes |
| Update admin new page | 20 minutes |
| Update QR print page | 15 minutes |
| Update PropertySection component | 25 minutes |
| Update PropertiesManagement component | 40 minutes |
| Copy translations to other 5 languages | 30 minutes |
| Testing and verification | 45 minutes |
| **Total** | **~5.5 hours** |

---

## 11. Code Examples

### 11.1 Before (Current State) - PropertySection

```tsx
// Current hardcoded strings
<span className="flex items-center gap-1">
  <Package className="w-3.5 h-3.5" />
  {itemCount} {itemCount === 1 ? 'item' : 'items'}
</span>

const headingText = userProperties?.length === 1 ? 'My Property' : 'My Properties';
```

### 11.2 After (Translated) - PropertySection

```tsx
import { useTranslations } from 'next-intl';

function PropertyRow({ property, onClick, itemCount = 0, roomCount = 0 }) {
  const t = useTranslations('properties.section');

  return (
    <button aria-label={t('aria.editProperty', { name: property.nickname })}>
      <span className="flex items-center gap-1">
        <Package className="w-3.5 h-3.5" />
        {t('itemCount', { count: itemCount })}
      </span>
    </button>
  );
}

function PropertySection() {
  const t = useTranslations('properties.section');

  const headingText = userProperties?.length === 1
    ? t('headingSingular')
    : t('headingPlural');

  // ...
}
```

### 11.3 Before (Current State) - PropertiesManagement

```tsx
<h3 className="text-lg font-medium text-gray-900 mb-1">No Properties Found</h3>
<p className="text-gray-600 mb-4">
  {searchQuery ? 'No properties match your search criteria.' : 'Get started by creating your first property.'}
</p>
```

### 11.4 After (Translated) - PropertiesManagement

```tsx
import { useTranslations } from 'next-intl';

function PropertiesManagement({ /* props */ }) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');

  return (
    <>
      <h3>{t('search.noResults.title')}</h3>
      <p>
        {searchQuery
          ? t('search.noResults.searchMessage')
          : t('search.noResults.emptyMessage')}
      </p>
    </>
  );
}
```

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-010
- [Related Task: REQ-E02-008 PropertyForm](/docs/REQ-E02-008-update-propertyform-overview.md)
- [Related Task: REQ-E02-009 Property Modals](/docs/REQ-E02-009-update-property-modals-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
