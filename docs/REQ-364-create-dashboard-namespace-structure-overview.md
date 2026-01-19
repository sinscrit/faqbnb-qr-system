# REQ-364: Create Dashboard Namespace Structure in Translation Files

**Document Created:** 2026-01-19 14:45:00 UTC
**Last Modified:** 2026-01-19 14:45:00 UTC
**Document Type:** Implementation Overview
**Request Type:** NEW FEATURE
**Size Estimate:** S (Small)
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.1
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## 1. Summary

Create a dedicated `dashboard` namespace structure within all six translation files (en, fr, es, de, nl, it) to organize UI strings specific to the dashboard interface. This namespace will serve as the foundation for translating dashboard page titles, navigation elements, statistics labels, empty states, welcome messages, action buttons, settings, and bulk operations.

This task is a foundational prerequisite for all subsequent dashboard component translation tasks in Sub-Epic 2B (Tasks 2B.2 through 2B.7).

---

## 2. Current State Analysis

### 2.1 Existing Translation Structure

The `/messages/en.json` file already contains a basic `dashboard` namespace with 17 keys:

```json
{
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
}
```

### 2.2 Dashboard Components Requiring Translation

Based on codebase analysis, the following components contain hardcoded strings that need coverage:

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| Dashboard2 page | `/src/app/dashboard2/page.tsx` | ~30 |
| Dashboard2 layout | `/src/app/dashboard2/layout.tsx` | ~20 |
| StatisticsCards | `/src/components/SimpleDashboard/StatisticsCards.tsx` | ~15 |
| ActionButtons | `/src/components/SimpleDashboard/ActionButtons.tsx` | ~12 |
| EmptyStateCard | `/src/components/SimpleDashboard/EmptyStateCard.tsx` | ~10 |
| AdvancedDashboardTools | `/src/components/SimpleDashboard/AdvancedDashboardTools.tsx` | ~8 |
| DashboardSettingsPopover | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | ~15 |
| BulkOperationsToolbar | `/src/components/SimpleDashboard/BulkOperationsToolbar.tsx` | ~10 |
| PortfolioSummary | `/src/components/SimpleDashboard/PortfolioSummary.tsx` | ~12 |
| PropertyGroupingControl | `/src/components/SimpleDashboard/PropertyGroupingControl.tsx` | ~6 |
| LoadingIndicator | `/src/components/SimpleDashboard/LoadingIndicator.tsx` | ~5 |
| PropertySection | `/src/components/SimpleDashboard/PropertySection.tsx` | ~15 |

**Total estimated strings:** ~158 (to be organized in logical subsections)

### 2.3 Identified Hardcoded Strings (Sample)

From component analysis:

**Dashboard page (`page.tsx`):**
- "Welcome to FAQBNB!"
- "Get started by adding your first property..."
- "Property created successfully"
- "Welcome back, {firstName}!"
- "Create and manage your QR code items"

**Navigation (`layout.tsx`):**
- "Dashboard", "Items", "Guides", "Properties"
- "D/B", "Items", "Guide", "Prop." (mobile labels)
- "Loading dashboard..."
- "Redirecting to login..."
- "Loading..."
- "Logout"

**Statistics (`StatisticsCards.tsx`):**
- "Items", "Rooms", "Tags"
- "(all properties)"
- "Loading statistics"
- "Start adding new QR Code items and create guides/instructions"

**Actions (`ActionButtons.tsx`):**
- "New QR Code Item"
- "View QR Code Items"
- "Print QR Code"
- ARIA labels: "Create a new QR code item", "View all your items", etc.

**Settings (`DashboardSettingsPopover.tsx`):**
- "Dashboard Settings"
- "Show Advanced Tools"
- "Always show grouping and bulk operations"
- "Show Portfolio Summary"
- "Always show portfolio overview card"
- "These settings override automatic UI adaptation..."

**Bulk Operations (`BulkOperationsToolbar.tsx`):**
- "All selected", "Select all"
- "{count} selected"
- "Print Selected"
- "Clear selection"

**Portfolio (`PortfolioSummary.tsx`):**
- "Portfolio Overview"
- "Total Properties", "Total Items", "Avg Items/Property"
- "You have {rooms} room(s) across {properties} property(ies)"

**Grouping (`PropertyGroupingControl.tsx`):**
- "Group by"
- "No Grouping", "By Location", "By Item Count"

---

## 3. Expected Behavior

### 3.1 Namespace Structure Design

The enhanced `dashboard` namespace will be organized into logical subsections:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "Create and manage your QR code items",

    "welcome": {
      "greeting": "Welcome back, {name}!",
      "newUser": {
        "title": "Welcome to FAQBNB!",
        "description": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
        "action": "Add Your First Property"
      }
    },

    "nav": {
      "dashboard": "Dashboard",
      "items": "Items",
      "guides": "Guides",
      "properties": "Properties",
      "mobile": {
        "dashboard": "D/B",
        "items": "Items",
        "guides": "Guide",
        "properties": "Prop."
      }
    },

    "stats": {
      "items": "Items",
      "rooms": "Rooms",
      "tags": "Tags",
      "allProperties": "(all properties)",
      "loading": "Loading statistics"
    },

    "actions": {
      "newItem": "New QR Code Item",
      "viewItems": "View QR Code Items",
      "printQR": "Print QR Code",
      "createProperty": "Create Property",
      "viewAll": "View All",
      "aria": {
        "createItem": "Create a new QR code item",
        "viewItems": "View all your items",
        "printQR": "Print QR codes for your items"
      }
    },

    "emptyStates": {
      "noItems": {
        "title": "Start adding new QR Code items and create guides/instructions",
        "description": "",
        "action": "New QR Code Item"
      },
      "noProperties": {
        "title": "No properties yet",
        "description": "Add your first property to get started",
        "action": "Add Property"
      }
    },

    "status": {
      "loading": "Loading...",
      "loadingDashboard": "Loading dashboard...",
      "redirecting": "Redirecting to login...",
      "success": {
        "propertyCreated": "Property created successfully"
      }
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
      "hint": "These settings override automatic UI adaptation based on your property count.",
      "close": "Close settings"
    },

    "advanced": {
      "title": "Advanced Tools",
      "groupBy": {
        "label": "Group by",
        "none": "No Grouping",
        "location": "By Location",
        "itemCount": "By Item Count"
      }
    },

    "bulk": {
      "selectAll": "Select all",
      "allSelected": "All selected",
      "selected": "{count} selected",
      "printSelected": "Print Selected",
      "clearSelection": "Clear selection",
      "aria": {
        "selectAll": "Select all properties",
        "deselectAll": "Deselect all properties",
        "printSelected": "Print {count} selected properties"
      }
    },

    "portfolio": {
      "title": "Portfolio Overview",
      "totalProperties": "Total Properties",
      "totalItems": "Total Items",
      "avgItemsPerProperty": "Avg Items/Property",
      "insight": "You have {rooms, plural, one {# room} other {# rooms}} across {properties, plural, one {# property} other {# properties}}",
      "loading": "Loading portfolio summary"
    },

    "auth": {
      "logout": "Logout"
    }
  }
}
```

### 3.2 Translation Key Conventions

Following established patterns from the implementation plan:
- Hierarchical nesting for logical grouping
- ICU message format for pluralization: `{count, plural, one {# item} other {# items}}`
- Variable interpolation with curly braces: `{name}`, `{count}`
- Dedicated `aria` sub-objects for accessibility labels
- Descriptive, lowercase camelCase keys

### 3.3 Non-English Files

All five non-English translation files will receive the identical namespace structure with:
- English placeholder text initially (to be translated in subsequent tasks)
- Identical key structure for type-safety and consistency

---

## 4. Implementation Tasks

### Task 1: Expand English Dashboard Namespace
**File:** `/messages/en.json`
**Actions:**
1. Restructure existing flat `dashboard` keys into nested subsections
2. Add all missing keys identified from component analysis
3. Use ICU format for pluralized strings
4. Include ARIA label keys

### Task 2: Replicate Structure to Non-English Files
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Actions:**
1. Add identical `dashboard` namespace structure to each file
2. Use English text as placeholders (translation in Task 2B.7)
3. Ensure JSON syntax validity

### Task 3: Validate TypeScript Compatibility
**Actions:**
1. Run TypeScript compilation to verify no type errors
2. Verify next-intl can resolve the new namespace keys
3. Test build succeeds with `npm run build`

### Task 4: Document Namespace Structure
**Actions:**
1. Add inline comments in the implementation or README explaining subsection purposes
2. Create guidance notes for developers adding new dashboard strings

---

## 5. Authorized Files and Functions for Modification

### 5.1 Translation Files (MODIFY)

| File Path | Modification Type |
|-----------|-------------------|
| `/messages/en.json` | Expand `dashboard` namespace with nested structure |
| `/messages/fr.json` | Add `dashboard` namespace (English placeholders) |
| `/messages/es.json` | Add `dashboard` namespace (English placeholders) |
| `/messages/de.json` | Add `dashboard` namespace (English placeholders) |
| `/messages/nl.json` | Add `dashboard` namespace (English placeholders) |
| `/messages/it.json` | Add `dashboard` namespace (English placeholders) |

### 5.2 Files NOT to Modify

The following files should **NOT** be modified in this task (they will be updated in subsequent tasks):

- `/src/app/dashboard2/page.tsx` - Component translation in Task 2B.2
- `/src/app/dashboard2/layout.tsx` - Component translation in Task 2B.3
- `/src/components/SimpleDashboard/*.tsx` - Component translations in Tasks 2B.4-2B.6
- `/src/lib/i18n/config.ts` - Already configured in Epic 1
- `/src/types/index.ts` - No changes needed

---

## 6. Technical Considerations

### 6.1 Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| next-intl package | ✅ Installed | Available in Epic 1 |
| i18n config | ✅ Complete | `/src/lib/i18n/config.ts` |
| Translation file structure | ✅ Exists | Needs expansion |

### 6.2 Backward Compatibility

- Existing keys in `dashboard` namespace must be preserved or mapped to new structure
- Any components currently using `dashboard.title` etc. will continue working

### 6.3 Key Migration Mapping

| Old Key | New Key |
|---------|---------|
| `dashboard.title` | `dashboard.title` (unchanged) |
| `dashboard.welcome` | `dashboard.welcome.greeting` |
| `dashboard.properties` | `dashboard.nav.properties` |
| `dashboard.items` | `dashboard.nav.items` or `dashboard.stats.items` |
| `dashboard.settings` | `dashboard.nav.settings` or `dashboard.settings.title` |
| `dashboard.quickActions` | `dashboard.actions.quickActions` |
| `dashboard.viewAll` | `dashboard.actions.viewAll` |
| `dashboard.noActivity` | `dashboard.emptyStates.noActivity.title` |

---

## 7. Acceptance Criteria Checklist

- [ ] All six translation files contain a `dashboard` namespace at the root level
- [ ] The `dashboard` namespace includes logical subsections: `welcome`, `nav`, `stats`, `actions`, `emptyStates`, `status`, `settings`, `advanced`, `bulk`, `portfolio`, `auth`
- [ ] Each subsection contains initial translation keys for current dashboard UI elements
- [ ] English translation file defines all dashboard keys with clear, descriptive text
- [ ] All five non-English translation files contain matching namespace structure
- [ ] Non-English files contain English placeholder text for subsequent translation
- [ ] Translation key naming follows established conventions (camelCase, hierarchical)
- [ ] Subsection organization is logical and intuitive for developers
- [ ] JSON syntax remains valid in all translation files
- [ ] TypeScript compilation succeeds with no errors
- [ ] Build completes successfully (`npm run build`)
- [ ] Existing translation functionality continues without regression
- [ ] Namespace structure accommodates foreseeable dashboard expansion

---

## 8. Estimated Effort

| Task | Estimate |
|------|----------|
| Expand English namespace | 1 hour |
| Replicate to non-English files | 30 minutes |
| Validate TypeScript/Build | 15 minutes |
| Documentation | 15 minutes |
| **Total** | **~2 hours** |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing dashboard translations | Low | Medium | Preserve backward-compatible key paths |
| JSON syntax errors | Low | High | Validate with JSON linter before commit |
| Missing keys discovered later | Medium | Low | Design flexible structure for expansion |
| Type errors from namespace changes | Low | Medium | Run TypeScript check before completion |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
