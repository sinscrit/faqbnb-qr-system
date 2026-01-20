# REQ-E02-049: Create Dashboard Namespace Structure - Detailed Task Breakdown

**Document Created:** 2026-01-20 18:15 UTC
**Last Modified:** 2026-01-20 18:15 UTC
**Overview Document:** docs/REQ-E02-049-create-dashboard-namespace-structure-overview.md
**Request Reference:** docs/gen_requests_epic2.md - Request #49
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.1
**Estimated Size:** S (Small)
**Status:** Ready for Implementation

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for creating the comprehensive `dashboard` namespace structure in the FAQBNB localization system. The current `/messages/en.json` contains a flat `dashboard` namespace with only ~18 strings. This task expands it to ~65-70 strings organized into logical sub-namespaces covering navigation, statistics, actions, settings, loading states, empty states, and metadata.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (next-intl installed, IntlProvider configured)
- [ ] Translation files exist at `/messages/{en,fr,es,de,nl,it}.json`
- [ ] Current `dashboard` namespace in `/messages/en.json` is backed up or version-controlled
- [ ] Developer has read the Overview document (REQ-E02-049-...-overview.md)

---

## Task Breakdown

### Task 1: Audit Current Dashboard Namespace (15 min)

**Objective:** Document the current state and identify what needs to change.

**Steps:**

1.1. Open `/messages/en.json` and locate the `dashboard` namespace (lines ~57-75)

1.2. Document the current 18 keys:
```
dashboard.title
dashboard.welcome
dashboard.properties
dashboard.items
dashboard.analytics
dashboard.settings
dashboard.recentActivity
dashboard.quickActions
dashboard.totalProperties
dashboard.totalItems
dashboard.totalScans
dashboard.activeUsers
dashboard.overview
dashboard.createProperty
dashboard.createItem
dashboard.viewAll
dashboard.noActivity
```

1.3. Compare with actual strings found in dashboard components:
- `/src/app/dashboard2/layout.tsx`: ~10 hardcoded strings
- `/src/components/SimpleDashboard/StatisticsCards.tsx`: ~8 hardcoded strings
- Other SimpleDashboard components: ~40+ hardcoded strings

1.4. Note any keys that will be preserved, modified, or removed

**Acceptance Criteria:**
- [ ] Current keys documented
- [ ] Gap analysis complete between existing keys and component strings

---

### Task 2: Expand English Dashboard Namespace (30 min)

**Objective:** Replace the flat `dashboard` namespace with a comprehensive hierarchical structure.

**File to Modify:** `/messages/en.json`

**Steps:**

2.1. Open `/messages/en.json`

2.2. Replace the entire `dashboard` section (lines ~57-75) with the following expanded structure:

```json
"dashboard": {
  "title": "Dashboard",
  "welcome": "Welcome back, {name}!",
  "overview": "Overview",
  "nav": {
    "dashboard": "Dashboard",
    "items": "Items",
    "guides": "Guides",
    "properties": "Properties",
    "rooms": "Rooms",
    "tags": "Tags",
    "instructions": "Instructions",
    "analytics": "Analytics",
    "settings": "Settings",
    "help": "Help",
    "create": "Create",
    "print": "Print",
    "mobile": {
      "dashboard": "D/B",
      "items": "Items",
      "guides": "Guide",
      "properties": "Prop."
    }
  },
  "header": {
    "logo": "FAQBNB",
    "logoAlt": "FAQBNB Logo",
    "logout": "Logout",
    "logoutAriaLabel": "Sign out of your account"
  },
  "loading": {
    "dashboard": "Loading dashboard...",
    "redirecting": "Redirecting to login...",
    "generic": "Loading...",
    "statistics": "Loading statistics"
  },
  "stats": {
    "items": "Items",
    "itemsCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
    "rooms": "Rooms",
    "roomsCount": "{count, plural, =0 {No rooms} one {# room} other {# rooms}}",
    "tags": "Tags",
    "tagsCount": "{count, plural, =0 {No tags} one {# tag} other {# tags}}",
    "properties": "Properties",
    "propertiesCount": "{count, plural, =0 {No properties} one {# property} other {# properties}}",
    "allProperties": "(all properties)",
    "totalProperties": "Total Properties",
    "totalItems": "Total Items",
    "totalScans": "Total Scans",
    "activeUsers": "Active Users",
    "viewAriaLabel": "View {label}: {count}"
  },
  "actions": {
    "newItem": "New QR Code Item",
    "viewItems": "View QR Code Items",
    "printQR": "Print QR Code",
    "addProperty": "Add Property",
    "createProperty": "Create Property",
    "createItem": "Create Item",
    "viewAll": "View All",
    "quickActions": "Quick Actions",
    "ariaLabels": {
      "newItem": "Create a new QR code item",
      "viewItems": "View all your items",
      "printQR": "Print QR codes for your items",
      "addProperty": "Add a new property"
    }
  },
  "empty": {
    "title": "Start adding new QR Code items and create guides/instructions",
    "description": "Create your first item to get started",
    "newUserWelcome": "Welcome to FAQBNB!",
    "newUserDescription": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
    "newUserAction": "Add Your First Property",
    "noActivity": "No recent activity",
    "recentActivity": "Recent Activity"
  },
  "property": {
    "selectProperty": "Select Property",
    "allProperties": "All Properties",
    "allPropertiesShort": "All",
    "noProperties": "No properties found",
    "propertyList": "Property list",
    "switchProperty": "Switch property"
  },
  "settings": {
    "title": "Dashboard Settings",
    "advancedTools": {
      "label": "Show Advanced Tools",
      "description": "Always show grouping and bulk operations"
    },
    "portfolioView": {
      "label": "Show Portfolio Summary",
      "description": "Always show portfolio overview card"
    },
    "footer": "These settings override automatic UI adaptation based on your property count.",
    "close": "Close settings",
    "closeAriaLabel": "Close dashboard settings"
  },
  "messages": {
    "propertyCreated": "Property created successfully",
    "propertyUpdated": "Property updated successfully",
    "propertyDeleted": "Property deleted successfully",
    "itemCreated": "Item created successfully"
  },
  "meta": {
    "title": "Dashboard",
    "description": "Manage your QR code items and properties"
  }
}
```

2.3. Ensure the JSON remains valid (no trailing commas, proper nesting)

2.4. Save the file

**Acceptance Criteria:**
- [ ] `dashboard` namespace expanded to ~65-70 keys
- [ ] JSON syntax is valid (no parse errors)
- [ ] All sub-namespaces created: nav, header, loading, stats, actions, empty, property, settings, messages, meta
- [ ] ICU pluralization patterns included for count-based strings
- [ ] Variable interpolation patterns defined (`{name}`, `{count}`, `{label}`)

---

### Task 3: Replicate Structure to French Translation File (10 min)

**Objective:** Add the identical key structure to `/messages/fr.json` with English placeholder values.

**File to Modify:** `/messages/fr.json`

**Steps:**

3.1. Open `/messages/fr.json`

3.2. Locate the existing `dashboard` section

3.3. Replace with the same expanded structure from Task 2 (English values as placeholders)

3.4. Save the file

**Note:** Actual French translations will be generated in Task 2B.7 (Generate translations for 5 non-English languages). For now, use English strings as placeholders to maintain key structure consistency.

**Acceptance Criteria:**
- [ ] `/messages/fr.json` has identical key structure to `/messages/en.json`
- [ ] JSON syntax is valid

---

### Task 4: Replicate Structure to Spanish Translation File (10 min)

**Objective:** Add the identical key structure to `/messages/es.json`.

**File to Modify:** `/messages/es.json`

**Steps:**

4.1. Open `/messages/es.json`

4.2. Locate the existing `dashboard` section

4.3. Replace with the expanded structure from Task 2 (English values as placeholders)

4.4. Save the file

**Acceptance Criteria:**
- [ ] `/messages/es.json` has identical key structure to `/messages/en.json`
- [ ] JSON syntax is valid

---

### Task 5: Replicate Structure to German Translation File (10 min)

**Objective:** Add the identical key structure to `/messages/de.json`.

**File to Modify:** `/messages/de.json`

**Steps:**

5.1. Open `/messages/de.json`

5.2. Locate the existing `dashboard` section

5.3. Replace with the expanded structure from Task 2 (English values as placeholders)

5.4. Save the file

**Acceptance Criteria:**
- [ ] `/messages/de.json` has identical key structure to `/messages/en.json`
- [ ] JSON syntax is valid

---

### Task 6: Replicate Structure to Dutch Translation File (10 min)

**Objective:** Add the identical key structure to `/messages/nl.json`.

**File to Modify:** `/messages/nl.json`

**Steps:**

6.1. Open `/messages/nl.json`

6.2. Locate the existing `dashboard` section

6.3. Replace with the expanded structure from Task 2 (English values as placeholders)

6.4. Save the file

**Acceptance Criteria:**
- [ ] `/messages/nl.json` has identical key structure to `/messages/en.json`
- [ ] JSON syntax is valid

---

### Task 7: Replicate Structure to Italian Translation File (10 min)

**Objective:** Add the identical key structure to `/messages/it.json`.

**File to Modify:** `/messages/it.json`

**Steps:**

7.1. Open `/messages/it.json`

7.2. Locate the existing `dashboard` section

7.3. Replace with the expanded structure from Task 2 (English values as placeholders)

7.4. Save the file

**Acceptance Criteria:**
- [ ] `/messages/it.json` has identical key structure to `/messages/en.json`
- [ ] JSON syntax is valid

---

### Task 8: Validate JSON Syntax Across All Files (10 min)

**Objective:** Ensure all 6 translation files have valid JSON syntax.

**Steps:**

8.1. Run JSON validation on each file:
```bash
# Using Node.js to validate JSON
node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/es.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/de.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/nl.json'))"
node -e "JSON.parse(require('fs').readFileSync('messages/it.json'))"
```

8.2. Fix any JSON syntax errors (missing commas, extra commas, unclosed braces)

8.3. Alternatively, use an IDE JSON linter or online validator

**Acceptance Criteria:**
- [ ] All 6 translation files pass JSON.parse() without errors
- [ ] No syntax errors reported by linter

---

### Task 9: Validate Key Consistency Across Languages (15 min)

**Objective:** Ensure all 6 translation files have identical key structures.

**Steps:**

9.1. Create a simple validation script or use manual comparison:
```javascript
// Quick validation script (optional)
const en = require('./messages/en.json');
const fr = require('./messages/fr.json');

function getKeys(obj, prefix = '') {
  return Object.keys(obj).flatMap(key => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof obj[key] === 'object' && obj[key] !== null
      ? getKeys(obj[key], path)
      : [path];
  });
}

const enDashboardKeys = getKeys(en.dashboard, 'dashboard');
const frDashboardKeys = getKeys(fr.dashboard, 'dashboard');

console.log('EN keys:', enDashboardKeys.length);
console.log('FR keys:', frDashboardKeys.length);
console.log('Missing in FR:', enDashboardKeys.filter(k => !frDashboardKeys.includes(k)));
```

9.2. Verify all 6 files have the same dashboard keys

9.3. Document any discrepancies and fix them

**Acceptance Criteria:**
- [ ] All 6 translation files have identical key structures in `dashboard` namespace
- [ ] Key count matches across all files (~65-70 keys)

---

### Task 10: Build Verification (10 min)

**Objective:** Verify the application builds successfully with the new translation structure.

**Steps:**

10.1. Run the build command:
```bash
npm run build
```

10.2. Check for any errors related to:
- JSON parsing failures
- Missing translation keys
- Invalid ICU patterns

10.3. If errors occur, identify and fix the root cause

10.4. Verify development server starts:
```bash
npm run dev
```

10.5. Navigate to `/dashboard2` and verify no translation-related errors in console

**Acceptance Criteria:**
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts successfully
- [ ] No translation errors in browser console on dashboard pages

---

### Task 11: Test ICU Patterns (15 min)

**Objective:** Verify ICU pluralization patterns work correctly.

**Steps:**

11.1. Create a temporary test in a dashboard component or use browser console:
```typescript
// Test in a component or via console
import { useTranslations } from 'next-intl';

const t = useTranslations('dashboard.stats');

// Test pluralization
console.log(t('itemsCount', { count: 0 }));  // Expected: "No items"
console.log(t('itemsCount', { count: 1 }));  // Expected: "1 item"
console.log(t('itemsCount', { count: 5 }));  // Expected: "5 items"

// Test variable interpolation
const tWelcome = useTranslations('dashboard');
console.log(tWelcome('welcome', { name: 'John' })); // Expected: "Welcome back, John!"
```

11.2. Verify pluralization works for:
- `dashboard.stats.itemsCount`
- `dashboard.stats.roomsCount`
- `dashboard.stats.tagsCount`
- `dashboard.stats.propertiesCount`

11.3. Verify interpolation works for:
- `dashboard.welcome` with `{name}`
- `dashboard.stats.viewAriaLabel` with `{label}` and `{count}`

**Acceptance Criteria:**
- [ ] Pluralization returns correct forms for 0, 1, and 5+ counts
- [ ] Variable interpolation replaces placeholders correctly

---

### Task 12: Document Completion (5 min)

**Objective:** Update task status and document completion.

**Steps:**

12.1. Mark all acceptance criteria as complete in this document

12.2. Update the request status in `docs/gen_requests_epic2.md` if applicable

12.3. Commit changes with appropriate message:
```bash
git add messages/en.json messages/fr.json messages/es.json messages/de.json messages/nl.json messages/it.json
git commit -m "feat(l10n): Expand dashboard namespace structure for Epic 2

- Expand dashboard namespace from ~18 to ~65-70 translation keys
- Add sub-namespaces: nav, header, loading, stats, actions, empty, property, settings, messages, meta
- Include ICU pluralization for count-based strings
- Add variable interpolation patterns for dynamic content
- Replicate structure to all 6 language files

REQ-E02-049 / Task 2B.1"
```

**Acceptance Criteria:**
- [ ] Document updated with completion status
- [ ] Changes committed to version control

---

## Files Modified Summary

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/messages/en.json` | EXPAND | Expand `dashboard` namespace from ~18 to ~65-70 keys |
| `/messages/fr.json` | EXPAND | Add expanded `dashboard` structure (English placeholders) |
| `/messages/es.json` | EXPAND | Add expanded `dashboard` structure (English placeholders) |
| `/messages/de.json` | EXPAND | Add expanded `dashboard` structure (English placeholders) |
| `/messages/nl.json` | EXPAND | Add expanded `dashboard` structure (English placeholders) |
| `/messages/it.json` | EXPAND | Add expanded `dashboard` structure (English placeholders) |

---

## Namespace Structure Reference

### Final Key Hierarchy

```
dashboard
├── title
├── welcome
├── overview
├── nav
│   ├── dashboard
│   ├── items
│   ├── guides
│   ├── properties
│   ├── rooms
│   ├── tags
│   ├── instructions
│   ├── analytics
│   ├── settings
│   ├── help
│   ├── create
│   ├── print
│   └── mobile
│       ├── dashboard
│       ├── items
│       ├── guides
│       └── properties
├── header
│   ├── logo
│   ├── logoAlt
│   ├── logout
│   └── logoutAriaLabel
├── loading
│   ├── dashboard
│   ├── redirecting
│   ├── generic
│   └── statistics
├── stats
│   ├── items
│   ├── itemsCount (ICU plural)
│   ├── rooms
│   ├── roomsCount (ICU plural)
│   ├── tags
│   ├── tagsCount (ICU plural)
│   ├── properties
│   ├── propertiesCount (ICU plural)
│   ├── allProperties
│   ├── totalProperties
│   ├── totalItems
│   ├── totalScans
│   ├── activeUsers
│   └── viewAriaLabel (interpolation)
├── actions
│   ├── newItem
│   ├── viewItems
│   ├── printQR
│   ├── addProperty
│   ├── createProperty
│   ├── createItem
│   ├── viewAll
│   ├── quickActions
│   └── ariaLabels
│       ├── newItem
│       ├── viewItems
│       ├── printQR
│       └── addProperty
├── empty
│   ├── title
│   ├── description
│   ├── newUserWelcome
│   ├── newUserDescription
│   ├── newUserAction
│   ├── noActivity
│   └── recentActivity
├── property
│   ├── selectProperty
│   ├── allProperties
│   ├── allPropertiesShort
│   ├── noProperties
│   ├── propertyList
│   └── switchProperty
├── settings
│   ├── title
│   ├── advancedTools
│   │   ├── label
│   │   └── description
│   ├── portfolioView
│   │   ├── label
│   │   └── description
│   ├── footer
│   ├── close
│   └── closeAriaLabel
├── messages
│   ├── propertyCreated
│   ├── propertyUpdated
│   ├── propertyDeleted
│   └── itemCreated
└── meta
    ├── title
    └── description
```

**Total Keys:** ~68

---

## Usage Examples for Future Tasks

### Client Component Usage (Tasks 2B.2-2B.6)

```typescript
'use client';
import { useTranslations } from 'next-intl';

function DashboardHeader({ userName }: { userName: string }) {
  const t = useTranslations('dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome', { name: userName })}</p>
    </div>
  );
}
```

### Navigation Component Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function NavigationItem({ isMobile }: { isMobile: boolean }) {
  const t = useTranslations('dashboard.nav');

  return (
    <span>
      {isMobile ? t('mobile.dashboard') : t('dashboard')}
    </span>
  );
}
```

### Statistics with Pluralization

```typescript
'use client';
import { useTranslations } from 'next-intl';

function StatCard({ count }: { count: number }) {
  const t = useTranslations('dashboard.stats');

  return (
    <div>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-sm">{t('items')}</span>
      {/* Or with full pluralization: */}
      <span>{t('itemsCount', { count })}</span>
    </div>
  );
}
```

---

## Dependencies and Downstream Tasks

### This Task Enables:

| Task ID | Title | How This Task Enables It |
|---------|-------|--------------------------|
| 2B.2 | Update dashboard2/page.tsx | Uses `dashboard.*` keys |
| 2B.3 | Update dashboard2/layout.tsx | Uses `dashboard.nav.*`, `dashboard.header.*`, `dashboard.loading.*` |
| 2B.4 | Update SimpleDashboard components | Uses `dashboard.stats.*`, `dashboard.actions.*`, `dashboard.empty.*` |
| 2B.5 | Update navigation/sidebar | Uses `dashboard.nav.*`, `dashboard.property.*` |
| 2B.6 | Update page metadata | Uses `dashboard.meta.*` |
| 2B.7 | Generate translations | Translates all keys created here |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Broken existing code referencing old keys | Old keys preserved in new structure (e.g., `dashboard.title` unchanged) |
| JSON syntax errors | Task 8 validates all files |
| Key inconsistency across languages | Task 9 ensures consistency |
| Build failures | Task 10 verifies build |
| ICU pattern errors | Task 11 tests pluralization |

---

## Completion Checklist

- [ ] Task 1: Audit current dashboard namespace
- [ ] Task 2: Expand English dashboard namespace
- [ ] Task 3: Replicate to French
- [ ] Task 4: Replicate to Spanish
- [ ] Task 5: Replicate to German
- [ ] Task 6: Replicate to Dutch
- [ ] Task 7: Replicate to Italian
- [ ] Task 8: Validate JSON syntax
- [ ] Task 9: Validate key consistency
- [ ] Task 10: Build verification
- [ ] Task 11: Test ICU patterns
- [ ] Task 12: Document completion

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2B: Dashboard & Navigation*
*Task 2B.1: Create Dashboard Namespace Structure*
