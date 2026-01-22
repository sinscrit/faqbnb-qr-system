# REQ-E02-070: Create `articles` Namespace Structure

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-070
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task Reference:** 2E.1
**Priority:** High
**Size:** S (Small)

**Created:** 2026-01-22 15:59
**Last Modified:** 2026-01-22 15:59

---

## 1. Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-070 (Task 2E.1) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | 2026-01-17 |
| Breakdown Created | 2026-01-22 15:59 |
| T-shirt Size | S (Small) |
| Estimated Effort | 2-4 hours |
| Status | PENDING |

---

## 2. Summary

This document provides the implementation breakdown for creating the `articles` namespace structure in the translation files. This is the foundation task for Sub-Epic 2E (Article & Content Management), which will enable translation of approximately 300 UI strings across article editor components, media handling utilities, and instructions pages.

The `articles` namespace will contain translation keys for:
- Article/instruction editor UI
- Media handling and upload components
- Image cropping and video trimming utilities
- Instructions list and edit pages
- Purpose/category labels

---

## 3. Goals

### 3.1 Functional Requirements

1. Create a comprehensive `articles` namespace in `/messages/en.json`
2. Define translation key structure covering all article/content management UI strings
3. Organize keys logically by component area (editor, media, crop, video, purposes)
4. Include all user-visible strings with ICU message format support where needed
5. Ensure consistency with existing namespace patterns (common, items, workflow)

### 3.2 Assumptions & Clarifications

- The `articles` namespace will be a top-level key in the translation files
- Some article-related components currently use keys from `common.*` or `media.*` namespaces - these should remain in their current locations for shared functionality
- Purpose labels overlap with `items.edit.purposes` - coordinate to avoid duplication
- Editor formatting labels align with `common.actions` patterns
- Media upload strings exist in `media.*` namespace - `articles` will contain article-specific media strings

---

## 4. Requirements Analysis

### 4.1 Source Components Analysis

Based on codebase investigation, the following components will use the `articles` namespace:

| Component | Location | Current i18n Status |
|-----------|----------|---------------------|
| MarkdownEditor | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Hardcoded strings |
| ImageCropper | `/src/components/ItemCapture/editors/ImageCropper.tsx` | Uses `common.loading` only |
| VideoTrimmer | `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Uses `common.loading` only |
| ImageRotator | `/src/components/ItemCapture/editors/ImageRotator.tsx` | Uses `common.loading` only |
| InstructionEditor | `/src/components/InstructionEditor/InstructionEditor.tsx` | Partial i18n |
| ContentEditSection | `/src/components/InstructionEditor/components/ContentEditSection.tsx` | Partial i18n |
| AddContentModal | `/src/components/InstructionEditor/components/AddContentModal.tsx` | Partial i18n |
| InstructionsPage | `/src/app/dashboard2/instructions/page.tsx` | Uses `common.*` namespaces |
| EditArticlePage | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Hardcoded strings |
| InstructionsTable | `/src/components/InstructionsTable/InstructionsTable.tsx` | Uses `common.emptyStates` |
| GuideGrid | `/src/components/InstructionsTable/GuideGrid.tsx` | Uses `common.emptyStates` |
| GuideToolbar | `/src/components/InstructionsTable/GuideToolbar.tsx` | Unknown |
| GuideCard | `/src/components/InstructionsTable/GuideCard.tsx` | Unknown |

### 4.2 String Inventory

Estimated ~300 translation keys organized as follows:

| Category | Estimated Keys | Description |
|----------|---------------|-------------|
| `articles.title/subtitle` | ~5 | Page-level labels |
| `articles.editor.*` | ~50 | Editor UI, toolbar, formatting |
| `articles.media.*` | ~30 | Upload, drag-drop, file handling |
| `articles.crop.*` | ~20 | Image cropping controls |
| `articles.video.*` | ~20 | Video trimming controls |
| `articles.purposes.*` | ~15 | Content purpose/category labels |
| `articles.list.*` | ~40 | Instructions list page |
| `articles.edit.*` | ~40 | Edit page labels |
| `articles.grid.*` | ~20 | Grid view components |
| `articles.table.*` | ~30 | Table view components |
| `articles.empty.*` | ~15 | Empty states |
| `articles.validation.*` | ~15 | Validation messages |

---

## 5. Technical Approach

### 5.1 Namespace Structure

```json
{
  "articles": {
    "title": "Instructions",
    "subtitle": "Manage content and instructions",
    "pageTitle": "All Guides",

    "editor": {
      "title": "Edit Content",
      "preview": "Preview",
      "edit": "Edit",
      "placeholder": "Write your instructions here...",
      "formatting": {
        "bold": "Bold",
        "italic": "Italic",
        "heading1": "Heading 1",
        "heading2": "Heading 2",
        "heading3": "Heading 3",
        "list": "Bullet List",
        "orderedList": "Numbered List",
        "link": "Insert Link"
      },
      "tabs": {
        "edit": "Edit",
        "preview": "Preview"
      },
      "characterCount": "{current, number} / {max, number} characters",
      "characterWarning": "Approaching character limit",
      "characterError": "Character limit exceeded"
    },

    "media": {
      "upload": "Upload Media",
      "dragDrop": "Drag and drop files here",
      "or": "or",
      "browse": "Browse files",
      "supportedFormats": "Supported formats: {formats}",
      "maxSize": "Maximum file size: {size}MB",
      "uploading": "Uploading...",
      "uploadComplete": "Upload complete",
      "uploadFailed": "Upload failed"
    },

    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "freeform": "Freeform",
      "square": "Square (1:1)",
      "landscape": "Landscape (16:9)",
      "portrait": "Portrait (9:16)",
      "standard": "Standard (4:3)",
      "apply": "Apply Crop",
      "reset": "Reset",
      "cancel": "Cancel",
      "zoom": "Zoom",
      "rotate": "Rotate"
    },

    "video": {
      "title": "Trim Video",
      "startTime": "Start Time",
      "endTime": "End Time",
      "duration": "Duration: {duration}",
      "apply": "Apply Trim",
      "reset": "Reset",
      "cancel": "Cancel",
      "preview": "Preview",
      "playing": "Playing",
      "paused": "Paused"
    },

    "purposes": {
      "howToUse": "How to Use",
      "troubleshooting": "Troubleshooting",
      "howToClean": "How to Clean",
      "safetyInfo": "Safety Information",
      "maintenance": "Maintenance",
      "features": "Features",
      "warranty": "Warranty & Support",
      "other": "Other"
    },

    "list": {
      "title": "Instructions",
      "subtitle": "Manage your guides and instructions",
      "count": "{count, plural, =0 {No guides} one {# guide} other {# guides}}",
      "createNew": "Create New Guide",
      "search": {
        "placeholder": "Search guides...",
        "noResults": "No guides found matching your search",
        "clear": "Clear search"
      },
      "columns": {
        "title": "Title",
        "item": "Item",
        "room": "Room",
        "purpose": "Purpose",
        "created": "Created",
        "updated": "Updated",
        "actions": "Actions"
      },
      "sort": {
        "label": "Sort by",
        "newestFirst": "Newest First",
        "oldestFirst": "Oldest First",
        "titleAZ": "Title A-Z",
        "titleZA": "Title Z-A",
        "itemAZ": "Item A-Z",
        "recentlyModified": "Recently Modified"
      }
    },

    "edit": {
      "pageTitle": "Edit Guide",
      "backToList": "Back to Guides",
      "loading": "Loading guide...",
      "notFound": "Guide not found",
      "loadError": "Failed to load guide",
      "saveSuccess": "Guide saved successfully",
      "saveFailed": "Failed to save guide",
      "form": {
        "titleLabel": "Title",
        "titlePlaceholder": "Enter a title for this guide",
        "descriptionLabel": "Description",
        "descriptionPlaceholder": "Brief description (optional)",
        "purposeLabel": "Purpose",
        "purposePlaceholder": "Select purpose"
      },
      "buttons": {
        "save": "Save Guide",
        "saving": "Saving...",
        "cancel": "Cancel",
        "delete": "Delete Guide"
      },
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?"
    },

    "grid": {
      "ariaLabel": "Guides grid",
      "viewItem": "View guide details",
      "editItem": "Edit guide",
      "deleteItem": "Delete guide"
    },

    "table": {
      "ariaLabel": "Guides table",
      "selectRow": "Select this guide",
      "actions": "Actions",
      "noGuides": "No guides to display"
    },

    "empty": {
      "title": "No guides yet",
      "description": "Create your first guide to help guests with instructions for your items.",
      "action": "Create Guide",
      "noResults": {
        "title": "No guides found",
        "description": "Try adjusting your search or filters"
      }
    },

    "validation": {
      "titleRequired": "Title is required",
      "titleTooLong": "Title must be less than {max} characters",
      "contentTooLong": "Content exceeds maximum length of {max} characters",
      "purposeRequired": "Please select a purpose",
      "invalidMediaType": "This file type is not supported",
      "fileTooLarge": "File size exceeds {max}MB limit"
    },

    "delete": {
      "title": "Delete Guide",
      "message": "Are you sure you want to delete \"{title}\"? This action cannot be undone.",
      "confirm": "Delete",
      "cancel": "Cancel",
      "success": "Guide deleted successfully",
      "failed": "Failed to delete guide"
    }
  }
}
```

### 5.2 Key Naming Convention

Following established project patterns:
- `{namespace}.{area}.{element}.{variant?}`
- Use camelCase for key names
- Use descriptive names that indicate UI context
- Include `aria*` prefixes for accessibility labels

---

## 6. Implementation Tasks

### Task 1: Define `articles` namespace structure in en.json (Priority: High)

**Description:** Add the complete `articles` namespace to `/messages/en.json` with all translation keys for article/content management UI.

**Details:**
- Add top-level `"articles"` key
- Include all sub-namespaces: editor, media, crop, video, purposes, list, edit, grid, table, empty, validation, delete
- Use ICU message format for plurals and interpolation
- Ensure keys align with component prop names where applicable

**Acceptance Criteria:**
- [ ] `articles` namespace added to en.json
- [ ] All ~300 keys defined with English source strings
- [ ] ICU plural syntax used for count messages
- [ ] Variable interpolation syntax correct (`{variableName}`)
- [ ] JSON structure valid

---

### Task 2: Coordinate with existing namespaces (Priority: High)

**Description:** Review existing namespaces for potential duplication and determine which keys belong in `articles` vs shared namespaces.

**Details:**
- Review `media.*` namespace - keep shared media strings there
- Review `common.emptyStates.*` - keep generic empty states there
- Review `items.edit.purposes.*` - determine if `articles.purposes` should reference these
- Document namespace boundaries

**Acceptance Criteria:**
- [ ] Namespace boundaries documented
- [ ] No duplicate keys across namespaces
- [ ] Shared functionality uses appropriate shared namespace

---

### Task 3: Validate JSON structure (Priority: High)

**Description:** Validate that the updated en.json file is valid JSON and follows project conventions.

**Details:**
- Run JSON linting/validation
- Verify key structure consistency
- Check for trailing commas or syntax errors

**Acceptance Criteria:**
- [ ] en.json passes JSON validation
- [ ] No syntax errors
- [ ] Consistent key naming throughout

---

### Task 4: Add placeholder translations to other language files (Priority: Medium)

**Description:** Copy the `articles` namespace structure to all 5 non-English translation files with English placeholder text.

**Files to Update:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Details:**
- Copy exact key structure from en.json
- Use English strings as placeholders (will be translated in Task 2E.6)
- Ensure all 6 files have identical key structure

**Acceptance Criteria:**
- [ ] `articles` namespace added to all 6 language files
- [ ] Key structure identical across all files
- [ ] All files pass JSON validation

---

## 7. Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### 7.1 Translation Files (Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/messages/en.json` | `articles` namespace | Modify | Add new namespace |
| `/messages/fr.json` | `articles` namespace | Modify | Add placeholder keys |
| `/messages/es.json` | `articles` namespace | Modify | Add placeholder keys |
| `/messages/de.json` | `articles` namespace | Modify | Add placeholder keys |
| `/messages/nl.json` | `articles` namespace | Modify | Add placeholder keys |
| `/messages/it.json` | `articles` namespace | Modify | Add placeholder keys |

### 7.2 Reference Files (Read-Only)

| File | Purpose |
|------|---------|
| `/src/components/ItemCapture/editors/*.tsx` | String extraction reference |
| `/src/components/InstructionEditor/**/*.tsx` | String extraction reference |
| `/src/components/InstructionsTable/**/*.tsx` | String extraction reference |
| `/src/app/dashboard2/instructions/**/*.tsx` | String extraction reference |
| `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md` | Namespace structure reference |

---

## 8. Dependencies

### 8.1 Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup, IntlProvider | Complete |
| Sub-Epic 2H | Common namespace (shared strings) | Complete |
| REQ-E02-079 | `media.*` namespace established | Complete |

### 8.2 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-071** (Task 2E.2) | `articles.editor.*` keys for editor components |
| **REQ-E02-072** (Task 2E.3) | `articles.media.*` keys for media handling |
| **REQ-E02-073** (Task 2E.4) | `articles.crop.*`, `articles.video.*` keys |
| **REQ-E02-074** (Task 2E.5) | `articles.list.*`, `articles.edit.*` keys |
| **REQ-E02-075** (Task 2E.6) | Namespace structure for translation generation |

### 8.3 Parallel Safety

- **Files touched**: `/messages/*.json` (all 6 translation files)
- **Conflicts with**: Any other Epic 2 namespace creation tasks running concurrently
- **Safe to parallelize with**: Component update tasks in other Sub-Epics (they read, not write, translation files)

### 8.4 External Dependencies

- None - uses existing next-intl framework from Epic 1

---

## 9. Risks and Considerations

### 9.1 Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large JSON file manipulation | Medium | Use careful editing, validate after changes |
| Key naming inconsistency | Low | Follow established patterns, code review |
| Duplicate keys with existing namespaces | Medium | Audit existing namespaces first |

### 9.2 Testing Requirements

- JSON validation after all edits
- Verify TypeScript compilation succeeds
- Spot-check key availability with `useTranslations('articles')` in dev environment

### 9.3 Open Questions

- [ ] Should `articles.purposes.*` duplicate or reference `items.edit.purposes.*`?
- [ ] Are there additional crop/trim controls not listed in the plan?
- [ ] Should toolbar formatting labels be in `articles.editor.formatting` or reference `common.actions`?

---

## 10. Out of Scope

- **Component updates** - covered by Tasks 2E.2 through 2E.5
- **Actual translations** - covered by Task 2E.6
- **Dynamic content translation** - covered by Epic 3
- **Email templates** - covered by Sub-Epic 2I
- **Modifying component code** - this task only creates translation keys

---

## 11. Verification Checklist

### Pre-Implementation
- [ ] Review existing `media.*` namespace for overlap
- [ ] Review `common.emptyStates.*` for overlap
- [ ] Confirm Epic 1 foundation is complete

### Implementation
- [ ] `articles` namespace added to en.json with ~300 keys
- [ ] Namespace structure matches plan specification
- [ ] ICU syntax correct for plurals and interpolation
- [ ] JSON validates without errors

### Post-Implementation
- [ ] All 6 language files have identical key structure
- [ ] TypeScript compilation succeeds
- [ ] Build completes without errors
- [ ] Downstream tasks (2E.2-2E.6) can proceed

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Epic 1 Foundation:** `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated: 2026-01-22 15:59*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
