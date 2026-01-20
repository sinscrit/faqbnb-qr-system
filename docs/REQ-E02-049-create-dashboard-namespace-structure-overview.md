# REQ-E02-049: Create Dashboard Namespace Structure for Translations - Implementation Breakdown

**Document Created:** 2026-01-20 17:40 UTC
**Last Modified:** 2026-01-20 17:45 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #49
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.1
**Estimated Size:** S (Small)

---

## 1. Overview

### 1.1 Summary

Create a comprehensive `dashboard` namespace structure in the translation files (`/messages/en.json` and corresponding files for other languages) to support multi-language dashboard experiences. This task establishes the translation key hierarchy for all dashboard-related UI strings including navigation elements, sidebar labels, metric displays, widget content, status indicators, empty states, and page metadata.

### 1.2 Current State Analysis

The existing `messages/en.json` file has a basic `dashboard` namespace with minimal keys (~18 strings):

```json
"dashboard": {
  "title": "Dashboard",
  "welcome": "Welcome back",
  "properties": "Properties",
  "items": "Items",
  "analytics": "Analytics",
  "settings": "Settings",
  "recentActivity": "Recent Activity",
  "quickActions": "Quick Actions",
  "totalProperties": "Total Properties",
  "totalItems": "Total Items",
  "totalScans": "Total Scans",
  "activeUsers": "Active Users",
  "overview": "Overview",
  "createProperty": "Create Property",
  "createItem": "Create Item",
  "viewAll": "View All",
  "noActivity": "No recent activity"
}
```

This current flat structure covers only ~18 strings and lacks the comprehensive hierarchical organization needed for full dashboard internationalization.

### 1.3 Target State

A fully comprehensive `dashboard` namespace structure covering approximately 65-70 strings organized into logical sub-namespaces:

- `dashboard.nav.*` - Navigation menu items (Desktop and mobile labels)
- `dashboard.header.*` - Header elements (logo, logout)
- `dashboard.loading.*` - Loading states
- `dashboard.stats.*` - Statistics cards and metric displays
- `dashboard.actions.*` - Quick action buttons and CTAs
- `dashboard.empty.*` - Empty states and welcome messages
- `dashboard.property.*` - Property selection and context
- `dashboard.settings.*` - Dashboard settings popover
- `dashboard.messages.*` - Toast and status messages
- `dashboard.meta.*` - Page titles and metadata

---

## 2. Analysis of Dashboard Components

### 2.1 Components Requiring Translation

| Component | File Path | Estimated Strings |
|-----------|-----------|-------------------|
| Dashboard2 page | `/src/app/dashboard2/page.tsx` | ~15 |
| Dashboard2 layout | `/src/app/dashboard2/layout.tsx` | ~25 |
| StatisticsCards | `/src/components/SimpleDashboard/StatisticsCards.tsx` | ~12 |
| ActionButtons | `/src/components/SimpleDashboard/ActionButtons.tsx` | ~10 |
| EmptyStateCard | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | ~8 |
| DashboardSettingsPopover | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | ~12 |
| LoadingIndicator | `/src/components/SimpleDashboard/LoadingIndicator.tsx` | ~3 |
| AdvancedDashboardTools | `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` | ~8 |
| PropertySection | `/src/components/SimpleDashboard/PropertySection.tsx` | ~10 |
| PortfolioSummary | `/src/components/SimpleDashboard/PortfolioSummary.tsx` | ~6 |
| PropertyDropdown | `/src/components/dashboard/PropertyDropdown.tsx` | ~8 |

**Total Estimated Strings:** ~65-70 unique keys

### 2.2 String Categories Identified

Based on component analysis:

1. **Navigation Labels**
   - "Dashboard", "Items", "Guides", "Properties"
   - Mobile abbreviated labels: "D/B", "Items", "Guide", "Prop."
   - "FAQBNB" (logo text)

2. **Header Elements**
   - "Logout"
   - "FAQBNB Logo" (alt text)

3. **Welcome Messages**
   - "Welcome back, {name}!"
   - "Create and manage your QR code items"

4. **Statistics & Metrics**
   - "Items", "Rooms", "Tags"
   - Pluralized counts: "{count, plural, =0 {No items} one {# item} other {# items}}"
   - "(all properties)"
   - "Loading statistics"

5. **Action Buttons**
   - "New QR Code Item"
   - "View QR Code Items"
   - "Print QR Code"
   - ARIA labels for accessibility

6. **Empty States**
   - "Welcome to FAQBNB!"
   - "Get started by adding your first property..."
   - "Start adding new QR Code items and create guides/instructions"
   - "Add Your First Property"

7. **Property Selector**
   - "Select Property"
   - "All Properties"
   - "No properties found"

8. **Settings Popover**
   - "Dashboard Settings"
   - "Show Advanced Tools" / "Always show grouping and bulk operations"
   - "Show Portfolio Summary" / "Always show portfolio overview card"
   - "Close settings"
   - Footer explanation text

9. **Loading States**
   - "Loading dashboard..."
   - "Redirecting to login..."
   - "Loading..."

10. **Status Messages**
    - "Property created successfully"

---

## 3. Implementation Tasks

### Task 3.1: Expand Dashboard Namespace in English Translation File

**Objective:** Create the comprehensive `dashboard` namespace structure in `/messages/en.json`

**Detailed Actions:**

1. Open `/messages/en.json`
2. Replace the existing minimal `dashboard` section with the expanded structure
3. Organize keys following the `{namespace}.{section}.{element}` convention
4. Ensure all strings use semantic naming that indicates context and purpose
5. Include ICU pluralization for count-based strings
6. Add interpolation placeholders where needed

**Proposed Namespace Structure:**

```json
{
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
      "logout": "Logout"
    },
    "loading": {
      "dashboard": "Loading dashboard...",
      "redirecting": "Redirecting to login...",
      "generic": "Loading..."
    },
    "stats": {
      "items": "Items",
      "itemsCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "rooms": "Rooms",
      "roomsCount": "{count, plural, =0 {No rooms} one {# room} other {# rooms}}",
      "tags": "Tags",
      "tagsCount": "{count, plural, =0 {No tags} one {# tag} other {# tags}}",
      "properties": "Properties",
      "allProperties": "(all properties)",
      "loadingStats": "Loading statistics",
      "totalProperties": "Total Properties",
      "totalItems": "Total Items",
      "totalScans": "Total Scans",
      "activeUsers": "Active Users"
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
        "printQR": "Print QR codes for your items"
      }
    },
    "empty": {
      "title": "Start adding new QR Code items and create guides/instructions",
      "description": "Create your first item to get started",
      "newUserWelcome": "Welcome to FAQBNB!",
      "newUserDescription": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
      "newUserAction": "Add Your First Property",
      "noActivity": "No recent activity"
    },
    "property": {
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "allPropertiesShort": "All",
      "noProperties": "No properties found",
      "propertyList": "Property list"
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
      "close": "Close settings"
    },
    "messages": {
      "propertyCreated": "Property created successfully"
    },
    "meta": {
      "title": "Dashboard",
      "description": "Manage your QR code items and properties"
    }
  }
}
```

### Task 3.2: Replicate Structure for Other Language Files

**Objective:** Create the same `dashboard` namespace structure in all 5 non-English translation files

**Files to Update:**
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

**Action:** Copy the English structure with placeholder translations that maintain the same keys. Actual translations will be generated in subsequent tasks (Task 2B.7).

### Task 3.3: Validate Namespace Structure

**Objective:** Ensure the namespace structure is valid JSON and follows established patterns

**Validation Checks:**
1. JSON syntax validation
2. No duplicate keys
3. Consistent key naming convention
4. All interpolation variables use `{varName}` format
5. ICU pluralization patterns are correct
6. Structure matches other namespaces (common, auth, items, errors)

---

## 4. Authorized Files and Functions for Modification

### 4.1 Primary Files for Modification

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/messages/en.json` | EXPAND | Expand existing `dashboard` namespace with comprehensive categorized structure |
| `/messages/fr.json` | EXPAND | Add expanded `dashboard` namespace (structure only, translations in Task 2B.7) |
| `/messages/es.json` | EXPAND | Add expanded `dashboard` namespace (structure only, translations in Task 2B.7) |
| `/messages/de.json` | EXPAND | Add expanded `dashboard` namespace (structure only, translations in Task 2B.7) |
| `/messages/nl.json` | EXPAND | Add expanded `dashboard` namespace (structure only, translations in Task 2B.7) |
| `/messages/it.json` | EXPAND | Add expanded `dashboard` namespace (structure only, translations in Task 2B.7) |

### 4.2 Scope Boundaries

**In Scope:**
- Creating/expanding the `dashboard` namespace in translation files
- Organizing keys into logical sub-namespaces
- Adding interpolation placeholders where needed (e.g., `{name}`, `{count}`)
- Adding ICU pluralization patterns where applicable
- Ensuring hierarchical structure supports all dashboard component strings

**Out of Scope (to be done in subsequent tasks):**
- Updating React components to use translation keys (Tasks 2B.2 - 2B.6)
- Generating professional translations (Task 2B.7)
- TypeScript type updates (if needed, separate task)

---

## 5. Dependencies

### 5.1 Prerequisites

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 Complete | Blocking | Assumed Complete | next-intl setup, IntlProvider, translation infrastructure |
| Translation file structure | Reference | Exists | `/messages/*.json` files already exist with 6 languages |
| Common namespace | Reference | Exists | Can reference patterns from `common` namespace |

### 5.2 Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 2B.2 | Update dashboard2/page.tsx | Uses keys created here |
| 2B.3 | Update dashboard2/layout.tsx | Uses keys created here |
| 2B.4 | Update SimpleDashboard components | Uses keys created here |
| 2B.5 | Update navigation/sidebar components | Uses keys created here |
| 2B.6 | Update page metadata | Uses keys created here |
| 2B.7 | Generate translations | Translates strings created here |

---

## 6. Acceptance Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| Dashboard namespace structure created in English base translation file | Check `dashboard.*` keys exist in `/messages/en.json` |
| Navigation section includes keys for main menu items | Check `dashboard.nav.*` and `dashboard.nav.mobile.*` keys exist |
| Metrics section includes keys for dashboard statistics | Check `dashboard.stats.*` keys exist including pluralization |
| Actions section includes keys for common dashboard actions | Check `dashboard.actions.*` keys exist |
| Status indicators section includes keys for various states | Check `dashboard.loading.*` and `dashboard.messages.*` keys exist |
| Empty states section includes keys | Check `dashboard.empty.*` keys exist |
| Page titles and metadata keys included | Check `dashboard.meta.*` keys exist |
| Namespace structure is hierarchical and semantic | Review key organization and naming |
| Structure supports pluralization for count-based strings | Verify ICU format in `dashboard.stats.*Count` keys |
| Variable interpolation patterns defined | Verify `{variable}` placeholders in `dashboard.welcome` and others |
| All 6 language files have identical key structures | Compare keys across all `/messages/*.json` files |

---

## 7. Testing Approach

### 7.1 Static Validation

1. **JSON Syntax Check:** Run `JSON.parse()` on each translation file
2. **Key Consistency Check:** Verify all 6 language files have identical key structures
3. **Interpolation Check:** Verify `{varName}` placeholders are consistent across files
4. **ICU Format Check:** Validate pluralization patterns follow ICU specification

### 7.2 Manual Review

1. Review English text for completeness against source components
2. Verify key naming follows `{namespace}.{section}.{element}` pattern
3. Confirm no hardcoded strings remain unaccounted for
4. Cross-reference with implementation plan Sub-Epic 2B requirements

### 7.3 Integration Validation

1. Application builds without errors: `npm run build`
2. Sample usage works: `useTranslations('dashboard.nav')` returns correct strings
3. ICU patterns work: `t('stats.itemsCount', { count: 5 })` returns "5 items"
4. Variable interpolation works: `t('welcome', { name: 'John' })` returns "Welcome back, John!"

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered later | Medium | Low | Namespace structure is extensible; keys can be added |
| Key naming inconsistencies | Low | Medium | Follow patterns from auth namespace, document conventions |
| JSON syntax errors | Low | High | Validate JSON before committing |
| Interpolation variable mismatches | Low | Medium | Review all `{variable}` patterns for consistency |
| Pluralization format errors | Low | Medium | Test ICU patterns with different count values |
| Component breakage from path changes | Medium | Medium | Update components in subsequent tasks (2B.2-2B.6) |

---

## 9. Implementation Notes

### 9.1 Key Naming Conventions

- Use camelCase for all keys
- Group related keys under common prefixes
- Use descriptive names: `newItem` not `btn1`
- Include context in names: `mobile.dashboard` for mobile-specific labels
- Use consistent suffixes: `*Label`, `*Description`, `*Alt`, `*Aria`

### 9.2 Interpolation Variables

Current interpolation patterns identified:
- `{name}` - for welcome message personalization
- `{count}` - for statistics pluralization

### 9.3 Pluralization Patterns

ICU format examples for dashboard:
```json
"itemsCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
"roomsCount": "{count, plural, =0 {No rooms} one {# room} other {# rooms}}",
"tagsCount": "{count, plural, =0 {No tags} one {# tag} other {# tags}}"
```

### 9.4 Mobile vs Desktop Labels

The dashboard navigation uses different labels for desktop and mobile viewports:
- Desktop: Full labels (e.g., "Dashboard", "Properties")
- Mobile: Abbreviated labels (e.g., "D/B", "Prop.")

These are stored in separate sub-namespace:
```json
"nav": {
  "dashboard": "Dashboard",
  "mobile": {
    "dashboard": "D/B"
  }
}
```

---

## 10. Usage Patterns

### Client Component Usage

```typescript
'use client';
import { useTranslations } from 'next-intl';

function DashboardHeader() {
  const t = useTranslations('dashboard');
  const firstName = 'John';

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome', { name: firstName })}</p>
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

### Statistics Component Usage with Pluralization

```typescript
'use client';
import { useTranslations } from 'next-intl';

function StatCard({ count }: { count: number }) {
  const t = useTranslations('dashboard.stats');

  return (
    <div>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-sm">{t('items')}</span>
      {/* Or with pluralization: */}
      <span>{t('itemsCount', { count })}</span>
    </div>
  );
}
```

---

## 11. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Auth Namespace Structure (REQ-E02-039)](/docs/REQ-E02-039-create-auth-namespace-structure-overview.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2B: Dashboard & Navigation*
