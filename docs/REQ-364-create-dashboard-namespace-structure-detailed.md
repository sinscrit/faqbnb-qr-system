# REQ-364: Create Dashboard Namespace Structure - Detailed Task Breakdown

**Document Created:** 2026-01-19 15:30:00 UTC
**Last Modified:** 2026-01-19 15:30:00 UTC
**Document Type:** Detailed Task Breakdown
**Request Type:** NEW FEATURE
**Size Estimate:** S (Small)
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.1

**References:**
- Overview Document: REQ-364-create-dashboard-namespace-structure-overview.md
- Implementation Plan: Plan-111-L10N-Epic2-Static-UI-Translation.md
- Requirements: gen_requests_epic2.md (Request #364)

---

## Executive Summary

This document provides a step-by-step implementation guide for creating a comprehensive `dashboard` namespace structure in all six translation files. The task expands the existing flat `dashboard` namespace in `/messages/en.json` (currently 17 keys) into a well-organized hierarchical structure containing ~158 keys to support all dashboard UI components.

---

## Pre-Implementation Checklist

- [ ] Epic 1 i18n foundation is complete (next-intl installed, IntlProvider configured)
- [ ] All translation files exist: `/messages/{en,fr,es,de,nl,it}.json`
- [ ] i18n configuration is functional at `/src/lib/i18n/config.ts`
- [ ] Build passes with current translation structure (`npm run build`)

---

## Task Breakdown

### Task 1: Analyze Existing Dashboard Namespace Structure
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Document the current state of the `dashboard` namespace to ensure backward compatibility during restructuring.

#### Steps

1.1. Read the current `/messages/en.json` file and document all existing `dashboard` keys:
   - `dashboard.title`
   - `dashboard.welcome`
   - `dashboard.properties`
   - `dashboard.items`
   - `dashboard.analytics`
   - `dashboard.settings`
   - `dashboard.recentActivity`
   - `dashboard.quickActions`
   - `dashboard.totalProperties`
   - `dashboard.totalItems`
   - `dashboard.totalScans`
   - `dashboard.activeUsers`
   - `dashboard.overview`
   - `dashboard.createProperty`
   - `dashboard.createItem`
   - `dashboard.viewAll`
   - `dashboard.noActivity`

1.2. Identify any components currently using these keys by searching the codebase:
   ```
   grep -r "useTranslations.*dashboard" src/
   grep -r "getTranslations.*dashboard" src/
   grep -r "t\(['\"]" src/ | grep dashboard
   ```

1.3. Document which keys need backward-compatible aliases or migrations.

#### Acceptance Criteria
- [ ] All 17 existing dashboard keys are documented
- [ ] Components using existing keys are identified
- [ ] Migration strategy is noted for any breaking changes

---

### Task 2: Design the Enhanced Namespace Structure
**Estimated Effort:** 30 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Create the complete hierarchical namespace structure before implementation.

#### Final Namespace Structure

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
      "loading": "Loading statistics",
      "empty": "Start adding new QR Code items and create guides/instructions"
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
      },
      "noActivity": "No recent activity"
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

    "property": {
      "selectProperty": "Select Property",
      "allProperties": "All Properties",
      "noProperties": "No properties yet",
      "addFirst": "Add your first property",
      "created": "Property created successfully",
      "edit": "Edit Property",
      "delete": "Delete Property"
    },

    "auth": {
      "logout": "Logout"
    },

    "_deprecated": {
      "_comment": "These keys maintain backward compatibility with existing code",
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
}
```

#### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Keep flat `title` at root | Most commonly used, no ambiguity |
| Nest `welcome` object | Separates greeting and new user onboarding |
| Create `nav` subsection | Groups all navigation labels including mobile variants |
| Create `stats` subsection | Groups statistics-related labels |
| Create `actions` subsection | Groups all action button labels |
| Create `aria` sub-objects | Separates accessibility labels for screen readers |
| Use ICU format for plurals | Standard format supported by next-intl |
| Include `_deprecated` section | Maintains backward compatibility during transition |

#### Acceptance Criteria
- [ ] Complete namespace structure is documented
- [ ] All ~158 strings from component analysis are mapped to keys
- [ ] Hierarchical organization is logical and intuitive
- [ ] ICU format is used for pluralized strings
- [ ] ARIA labels have dedicated subsections

---

### Task 3: Update English Translation File (`/messages/en.json`)
**Estimated Effort:** 45 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Replace the existing flat `dashboard` namespace with the new hierarchical structure.

#### Steps

3.1. Open `/messages/en.json`

3.2. **IMPORTANT: Backup first** - Create a mental note or copy of the existing `dashboard` section

3.3. Replace the entire `dashboard` object with the new structure:

**Before:**
```json
"dashboard": {
  "title": "Dashboard",
  "welcome": "Welcome back",
  "properties": "Properties",
  ...17 flat keys...
}
```

**After:**
```json
"dashboard": {
  "title": "Dashboard",
  "subtitle": "Create and manage your QR code items",
  "welcome": {
    "greeting": "Welcome back, {name}!",
    "newUser": { ... }
  },
  "nav": { ... },
  "stats": { ... },
  "actions": { ... },
  "emptyStates": { ... },
  "status": { ... },
  "settings": { ... },
  "advanced": { ... },
  "bulk": { ... },
  "portfolio": { ... },
  "property": { ... },
  "auth": { ... }
}
```

3.4. Validate JSON syntax:
   ```bash
   npx jsonlint messages/en.json
   ```
   Or use IDE JSON validation

3.5. Verify file saves correctly

#### File to Modify

| File | Action |
|------|--------|
| `/messages/en.json` | Replace `dashboard` namespace with expanded structure |

#### Code Change

Location: `/messages/en.json` - `dashboard` object (lines 57-75 approximately)

Replace the existing dashboard object with the complete structure from Task 2.

#### Acceptance Criteria
- [ ] `/messages/en.json` contains the new `dashboard` namespace structure
- [ ] All subsections are present: `title`, `subtitle`, `welcome`, `nav`, `stats`, `actions`, `emptyStates`, `status`, `settings`, `advanced`, `bulk`, `portfolio`, `property`, `auth`
- [ ] JSON syntax is valid (no parse errors)
- [ ] All ICU message format strings are properly formatted
- [ ] Variable interpolation uses `{variableName}` format

---

### Task 4: Update French Translation File (`/messages/fr.json`)
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Add the `dashboard` namespace structure with English placeholder text.

#### Steps

4.1. Open `/messages/fr.json`

4.2. Check if `dashboard` namespace exists; if so, replace it entirely

4.3. Add the same namespace structure as `en.json` with **English placeholder text**

4.4. Validate JSON syntax

#### File to Modify

| File | Action |
|------|--------|
| `/messages/fr.json` | Add/replace `dashboard` namespace (English placeholders) |

#### Note on Placeholder Text
The English text serves as a placeholder until Task 2B.7 generates actual French translations. This ensures:
- TypeScript compilation works
- Runtime doesn't break if a key is accessed
- Structure is identical across all files

#### Acceptance Criteria
- [ ] `/messages/fr.json` contains identical `dashboard` namespace structure
- [ ] All keys match `/messages/en.json` exactly
- [ ] JSON syntax is valid
- [ ] English placeholder text is used throughout

---

### Task 5: Update Spanish Translation File (`/messages/es.json`)
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Add the `dashboard` namespace structure with English placeholder text.

#### Steps

5.1. Open `/messages/es.json`

5.2. Check if `dashboard` namespace exists; if so, replace it entirely

5.3. Add the same namespace structure as `en.json` with **English placeholder text**

5.4. Validate JSON syntax

#### File to Modify

| File | Action |
|------|--------|
| `/messages/es.json` | Add/replace `dashboard` namespace (English placeholders) |

#### Acceptance Criteria
- [ ] `/messages/es.json` contains identical `dashboard` namespace structure
- [ ] All keys match `/messages/en.json` exactly
- [ ] JSON syntax is valid
- [ ] English placeholder text is used throughout

---

### Task 6: Update German Translation File (`/messages/de.json`)
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Add the `dashboard` namespace structure with English placeholder text.

#### Steps

6.1. Open `/messages/de.json`

6.2. Check if `dashboard` namespace exists; if so, replace it entirely

6.3. Add the same namespace structure as `en.json` with **English placeholder text**

6.4. Validate JSON syntax

#### File to Modify

| File | Action |
|------|--------|
| `/messages/de.json` | Add/replace `dashboard` namespace (English placeholders) |

#### Acceptance Criteria
- [ ] `/messages/de.json` contains identical `dashboard` namespace structure
- [ ] All keys match `/messages/en.json` exactly
- [ ] JSON syntax is valid
- [ ] English placeholder text is used throughout

---

### Task 7: Update Dutch Translation File (`/messages/nl.json`)
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Add the `dashboard` namespace structure with English placeholder text.

#### Steps

7.1. Open `/messages/nl.json`

7.2. Check if `dashboard` namespace exists; if so, replace it entirely

7.3. Add the same namespace structure as `en.json` with **English placeholder text**

7.4. Validate JSON syntax

#### File to Modify

| File | Action |
|------|--------|
| `/messages/nl.json` | Add/replace `dashboard` namespace (English placeholders) |

#### Acceptance Criteria
- [ ] `/messages/nl.json` contains identical `dashboard` namespace structure
- [ ] All keys match `/messages/en.json` exactly
- [ ] JSON syntax is valid
- [ ] English placeholder text is used throughout

---

### Task 8: Update Italian Translation File (`/messages/it.json`)
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Add the `dashboard` namespace structure with English placeholder text.

#### Steps

8.1. Open `/messages/it.json`

8.2. Check if `dashboard` namespace exists; if so, replace it entirely

8.3. Add the same namespace structure as `en.json` with **English placeholder text**

8.4. Validate JSON syntax

#### File to Modify

| File | Action |
|------|--------|
| `/messages/it.json` | Add/replace `dashboard` namespace (English placeholders) |

#### Acceptance Criteria
- [ ] `/messages/it.json` contains identical `dashboard` namespace structure
- [ ] All keys match `/messages/en.json` exactly
- [ ] JSON syntax is valid
- [ ] English placeholder text is used throughout

---

### Task 9: Run TypeScript Compilation Check
**Estimated Effort:** 10 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Verify that the translation file changes don't break TypeScript compilation.

#### Steps

9.1. Run TypeScript check:
   ```bash
   npx tsc --noEmit
   ```

9.2. If errors occur related to translation types:
   - Check for mismatched keys between language files
   - Verify JSON syntax in all files
   - Ensure next-intl can parse all namespace structures

9.3. Document any type errors and their resolutions

#### Commands to Run

```bash
# TypeScript check
npx tsc --noEmit

# If using strict i18n types, may need:
npm run typecheck
```

#### Acceptance Criteria
- [ ] TypeScript compilation completes with zero errors
- [ ] No type warnings related to translation namespaces
- [ ] All language files are recognized by the i18n system

---

### Task 10: Run Full Build Verification
**Estimated Effort:** 10 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Ensure the complete application builds successfully with the new translation structure.

#### Steps

10.1. Run the build command:
   ```bash
   npm run build
   ```

10.2. Monitor for any errors related to:
   - Translation file parsing
   - next-intl namespace resolution
   - Missing translation key warnings

10.3. If build fails:
   - Check error messages for specific file/line references
   - Verify JSON syntax in all 6 translation files
   - Ensure consistent key structure across all files

#### Commands to Run

```bash
# Full production build
npm run build

# If build passes, optionally test dev server
npm run dev
```

#### Acceptance Criteria
- [ ] `npm run build` completes successfully
- [ ] No translation-related warnings or errors in build output
- [ ] Application starts correctly after build

---

### Task 11: Verify Namespace Key Consistency
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Confirm all six translation files have identical key structures.

#### Steps

11.1. Create a simple comparison check:
   ```bash
   # Extract all dashboard keys from each file and compare
   jq '.dashboard | paths | join(".")' messages/en.json > /tmp/en_keys.txt
   jq '.dashboard | paths | join(".")' messages/fr.json > /tmp/fr_keys.txt
   diff /tmp/en_keys.txt /tmp/fr_keys.txt
   ```

11.2. Repeat for all language files:
   - Compare `en.json` vs `es.json`
   - Compare `en.json` vs `de.json`
   - Compare `en.json` vs `nl.json`
   - Compare `en.json` vs `it.json`

11.3. Document any discrepancies and fix them

#### Alternative Manual Check
Open all 6 files side by side in IDE and visually verify structure matches.

#### Acceptance Criteria
- [ ] All 6 files have identical `dashboard` namespace key structures
- [ ] No extra or missing keys in any file
- [ ] Nesting depth matches across all files

---

### Task 12: Document the Namespace Structure
**Estimated Effort:** 15 minutes
**Status:** [ ] Not Started / [ ] In Progress / [ ] Complete

#### Objective
Add inline documentation to help developers understand and extend the namespace.

#### Steps

12.1. At the top of `/messages/en.json`, ensure the `_meta` object contains updated version info (if applicable)

12.2. Consider adding comments in the overview document or creating a dedicated `/docs/i18n/dashboard-namespace.md` file explaining:
   - Purpose of each subsection
   - Naming conventions for new keys
   - How to add new dashboard strings

12.3. Update the overview document with final implementation notes

#### Documentation Content

**Subsection Purposes:**
| Subsection | Purpose |
|------------|---------|
| `welcome` | User greeting and new user onboarding messages |
| `nav` | Navigation labels for sidebar/header, including mobile variants |
| `stats` | Statistics card labels and loading states |
| `actions` | Action button labels and ARIA descriptions |
| `emptyStates` | Empty state titles, descriptions, and CTAs |
| `status` | Loading, saving, and success/error status messages |
| `settings` | Dashboard settings popover labels |
| `advanced` | Advanced tools labels (grouping, filtering) |
| `bulk` | Bulk operation toolbar labels |
| `portfolio` | Portfolio summary widget labels |
| `property` | Property selector and property-related messages |
| `auth` | Authentication-related labels (logout) |

#### Acceptance Criteria
- [ ] Namespace structure is documented
- [ ] Developer guidance exists for adding new keys
- [ ] Overview document is updated with final notes

---

## Post-Implementation Verification

### Final Checklist

- [ ] All six translation files (`en.json`, `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`) contain the `dashboard` namespace
- [ ] The `dashboard` namespace includes all required subsections
- [ ] English file contains descriptive English text for all keys
- [ ] Non-English files contain English placeholder text (matching keys)
- [ ] All JSON files have valid syntax
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console warnings about missing translation keys
- [ ] Existing dashboard functionality continues to work

### Regression Testing

After implementation, manually verify:
1. Navigate to `/dashboard2` in the application
2. Check that all visible text renders (even if in English for non-English locales)
3. Verify no missing translation key warnings in browser console
4. Confirm logout and other actions still function

---

## Files Modified Summary

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `/messages/en.json` | MODIFY | Expand `dashboard` namespace from 17 to ~80+ keys with hierarchical structure |
| `/messages/fr.json` | MODIFY | Add `dashboard` namespace with English placeholders |
| `/messages/es.json` | MODIFY | Add `dashboard` namespace with English placeholders |
| `/messages/de.json` | MODIFY | Add `dashboard` namespace with English placeholders |
| `/messages/nl.json` | MODIFY | Add `dashboard` namespace with English placeholders |
| `/messages/it.json` | MODIFY | Add `dashboard` namespace with English placeholders |

---

## Dependencies

### Upstream Dependencies (Required Before This Task)
| Dependency | Task ID | Status |
|------------|---------|--------|
| next-intl installation | Epic 1 | ✅ Complete |
| i18n configuration | REQ-230 | ✅ Complete |
| Translation file structure | REQ-229 | ✅ Complete |

### Downstream Dependencies (Blocked By This Task)
| Task | Task ID | Description |
|------|---------|-------------|
| Update Dashboard page | 2B.2 | Requires `dashboard` namespace to exist |
| Update Dashboard layout | 2B.3 | Requires `dashboard.nav` subsection |
| Update SimpleDashboard components | 2B.4-2B.6 | Requires various `dashboard.*` subsections |
| Generate non-English translations | 2B.7 | Requires namespace structure to be finalized |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing components using old keys | Low | Medium | Maintain backward-compatible keys or search for usages first |
| JSON syntax error breaking build | Low | High | Validate JSON with linter before committing |
| Key structure mismatch between files | Medium | Medium | Use automated comparison script |
| next-intl failing to resolve nested keys | Low | Medium | Test with a simple component before full implementation |

---

## Rollback Plan

If issues are discovered after implementation:

1. **Immediate rollback:** Restore translation files from git:
   ```bash
   git checkout HEAD~1 -- messages/en.json messages/fr.json messages/es.json messages/de.json messages/nl.json messages/it.json
   ```

2. **Partial rollback:** Keep new structure but restore deprecated flat keys at root level for backward compatibility

3. **Investigation:** Check browser console and build logs for specific error messages

---

## Completion Criteria

This task is complete when:

1. ✅ All six translation files contain the expanded `dashboard` namespace
2. ✅ The namespace is hierarchically organized with documented subsections
3. ✅ TypeScript compilation passes
4. ✅ Production build succeeds
5. ✅ No runtime errors when accessing the dashboard
6. ✅ The structure supports all dashboard UI components identified in the overview

---

*Document generated for REQ-364 - Create Dashboard Namespace Structure*
*Epic: L10N Epic 2 - Static UI Translation*
*Sub-Epic: 2B - Dashboard & Navigation*
