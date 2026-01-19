# REQ-392: Create Articles Namespace Structure - Implementation Overview

**Last Modified:** 2026-01-19 00:00 UTC
**Request ID:** REQ-392
**Type:** NEW FEATURE
**Size:** S (Small)
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.1
**Priority:** Eighth (per Epic 2 recommended order)

---

## 1. Summary

Create a dedicated `articles` namespace structure within all six supported language message files (`en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `nl.json`) to provide a foundation for localizing the article and content management UI. This namespace will contain translation keys for article metadata, list views, form elements, state indicators, actions, and feedback messages.

---

## 2. Current State Analysis

### 2.1 Existing Message File Structure

The current `/messages/en.json` contains these namespaces:
- `common` - General UI actions and labels
- `auth` - Authentication-related strings
- `dashboard` - Dashboard UI strings
- `items` - Item management strings
- `errors` - Error messages
- `language` - Language selection strings

**Missing:** No `articles` namespace exists for article and content management UI strings.

### 2.2 Related Components Requiring Translation

Based on codebase analysis, these components will consume the `articles` namespace:

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| MarkdownEditor | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | ~40 |
| ImageCropper | `/src/components/ItemCapture/editors/ImageCropper.tsx` | ~20 |
| VideoTrimmer | `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | ~25 |
| InstructionsTable | `/src/components/InstructionsTable/InstructionsTable.tsx` | ~30 |
| GuideToolbar | `/src/components/InstructionsTable/GuideToolbar.tsx` | ~20 |
| GuideGrid | `/src/components/InstructionsTable/GuideGrid.tsx` | ~15 |
| GuideCard | `/src/components/InstructionsTable/GuideCard.tsx` | ~10 |
| Instructions page | `/src/app/dashboard2/instructions/page.tsx` | ~50 |
| Instructions edit page | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | ~30 |

**Estimated Total:** ~300 strings (per Implementation Plan)

### 2.3 Existing Translation Pattern

The project uses `next-intl` with this established pattern:

```typescript
// Client components
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace');
  return <span>{t('key')}</span>;
}
```

Reference implementation: `/src/components/LogoutButton.tsx` (lines 7, 26-27, 69)

---

## 3. Implementation Requirements

### 3.1 Namespace Structure

The `articles` namespace must include the following sub-sections as specified in the Implementation Plan:

```json
{
  "articles": {
    "title": "Instructions",
    "subtitle": "Manage content and instructions",
    "editor": {
      "title": "Edit Content",
      "preview": "Preview",
      "edit": "Edit",
      "formatting": {
        "bold": "Bold",
        "italic": "Italic",
        "heading": "Heading",
        "list": "List",
        "link": "Link",
        "image": "Image"
      },
      "placeholder": "Write your instructions here..."
    },
    "media": {
      "upload": "Upload Media",
      "dragDrop": "Drag and drop files here",
      "or": "or",
      "browse": "Browse files",
      "supportedFormats": "Supported formats: {formats}",
      "maxSize": "Maximum file size: {size}MB"
    },
    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "freeform": "Freeform",
      "square": "Square",
      "landscape": "Landscape",
      "portrait": "Portrait",
      "apply": "Apply Crop",
      "reset": "Reset"
    },
    "video": {
      "title": "Trim Video",
      "startTime": "Start Time",
      "endTime": "End Time",
      "duration": "Duration: {duration}",
      "apply": "Apply Trim"
    },
    "purposes": {
      "howToUse": "How to Use",
      "troubleshooting": "Troubleshooting",
      "maintenance": "Maintenance",
      "safety": "Safety Information",
      "warranty": "Warranty & Support",
      "other": "Other"
    },
    "list": {
      "title": "Title",
      "item": "Item",
      "room": "Room",
      "property": "Property",
      "purpose": "Purpose",
      "created": "Created",
      "actions": "Actions",
      "empty": "No guides available",
      "noResults": "No guides match your filters"
    },
    "toolbar": {
      "search": "Search guides...",
      "filter": "Filter",
      "clearFilters": "Clear filters",
      "viewGrid": "Grid view",
      "viewList": "List view",
      "showing": "Showing {count} of {total} guides"
    },
    "card": {
      "edit": "Edit",
      "viewDetails": "View Details",
      "noContent": "No content yet"
    },
    "page": {
      "title": "Guides",
      "subtitle": "Manage guide articles for your items",
      "createFirst": "Create Your First Item",
      "learnMore": "Learn More",
      "loading": "Loading guides...",
      "authRequired": "Authentication Required",
      "authMessage": "Please log in to access guides.",
      "goToLogin": "Go to Login",
      "retry": "Retry",
      "errorTitle": "Error Loading Guides",
      "successMessage": "Guide updated successfully"
    },
    "empty": {
      "title": "No guides yet",
      "description": "Create items and add guide articles to get started. Guides help guests understand how to use items in your property."
    },
    "states": {
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived",
      "scheduled": "Scheduled"
    },
    "actions": {
      "create": "Create Guide",
      "edit": "Edit Guide",
      "delete": "Delete Guide",
      "publish": "Publish",
      "archive": "Archive",
      "duplicate": "Duplicate",
      "preview": "Preview"
    },
    "errors": {
      "loadFailed": "Failed to fetch articles",
      "saveFailed": "Failed to save article",
      "deleteFailed": "Failed to delete article",
      "notFound": "Article not found"
    },
    "loading": {
      "fetching": "Fetching articles...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "uploading": "Uploading media..."
    },
    "validation": {
      "titleRequired": "Article title is required",
      "contentRequired": "Article content is required",
      "maxLength": "Content exceeds the maximum character limit. Please shorten your text."
    }
  }
}
```

### 3.2 Key Naming Convention

Following the established convention from the Implementation Plan:
```
{namespace}.{component/area}.{element}.{variant?}
```

Examples:
- `articles.editor.formatting.bold`
- `articles.list.empty`
- `articles.page.title`

---

## 4. Implementation Tasks

### Task 1: Add Articles Namespace to English Message File
**File:** `/messages/en.json`
**Action:** Add the complete `articles` namespace structure with English translations

### Task 2: Add Articles Namespace to French Message File
**File:** `/messages/fr.json`
**Action:** Add the `articles` namespace with French translations

### Task 3: Add Articles Namespace to Spanish Message File
**File:** `/messages/es.json`
**Action:** Add the `articles` namespace with Spanish translations

### Task 4: Add Articles Namespace to German Message File
**File:** `/messages/de.json`
**Action:** Add the `articles` namespace with German translations

### Task 5: Add Articles Namespace to Dutch Message File
**File:** `/messages/nl.json`
**Action:** Add the `articles` namespace with Dutch translations

### Task 6: Add Articles Namespace to Italian Message File
**File:** `/messages/it.json`
**Action:** Add the `articles` namespace with Italian translations

---

## 5. Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/messages/en.json` | ADD | Add `articles` namespace with English translations |
| `/messages/fr.json` | ADD | Add `articles` namespace with French translations |
| `/messages/es.json` | ADD | Add `articles` namespace with Spanish translations |
| `/messages/de.json` | ADD | Add `articles` namespace with German translations |
| `/messages/nl.json` | ADD | Add `articles` namespace with Dutch translations |
| `/messages/it.json` | ADD | Add `articles` namespace with Italian translations |

### Files NOT to Modify

The following files should NOT be modified as part of this task (they will be updated in subsequent tasks):
- `/src/components/ItemCapture/editors/MarkdownEditor.tsx`
- `/src/components/ItemCapture/editors/ImageCropper.tsx`
- `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
- `/src/components/InstructionsTable/*.tsx`
- `/src/app/dashboard2/instructions/**/*.tsx`

---

## 6. Acceptance Criteria

Based on REQ-392 specification:

- [ ] Articles namespace exists in all six message files (en.json, de.json, es.json, fr.json, it.json, nl.json)
- [ ] Namespace includes keys for article titles, descriptions, and metadata labels
- [ ] Namespace includes article list view labels (column headers, filters, sorting options)
- [ ] Namespace includes article creation and editing form labels and placeholders
- [ ] Namespace includes article state indicators (draft, published, archived, scheduled)
- [ ] Namespace includes article action labels (create, edit, delete, publish, archive, duplicate)
- [ ] Namespace includes empty state messages for when no articles exist
- [ ] Namespace includes loading state messages for article operations
- [ ] Namespace includes error messages specific to article operations
- [ ] English translations are complete and serve as the source for other languages
- [ ] Namespace structure is consistent across all language files
- [ ] Keys follow the project's established naming conventions

---

## 7. Technical Considerations

### 7.1 Variable Interpolation

Several keys require variable interpolation using ICU message format:
- `articles.media.supportedFormats` - `{formats}` placeholder
- `articles.media.maxSize` - `{size}` placeholder
- `articles.video.duration` - `{duration}` placeholder
- `articles.toolbar.showing` - `{count}` and `{total}` placeholders

Usage pattern:
```typescript
t('media.maxSize', { size: 10 })  // "Maximum file size: 10MB"
```

### 7.2 JSON Structure Validation

Ensure proper JSON syntax:
- No trailing commas
- Proper nesting
- Consistent quote usage (double quotes)

### 7.3 Translation Quality

For non-English translations:
- Use context-aware AI translation (Claude/OpenAI as specified in Implementation Plan)
- Maintain consistent terminology across languages
- Preserve variable placeholders exactly as in English source

---

## 8. Dependencies

### 8.1 Prerequisites
- Epic 1 foundation complete (next-intl installed and configured) - **VERIFIED**
- Message files exist for all 6 languages - **VERIFIED**

### 8.2 Dependent Tasks
The following Sub-Epic 2E tasks depend on this namespace being in place:
- Task 2E.2: Update editor components to use translations
- Task 2E.3: Update media handling components
- Task 2E.4: Update crop/trim utilities
- Task 2E.5: Update instructions pages

---

## 9. Testing Verification

After implementation, verify:

1. **Structure Validation:**
   ```bash
   # Validate JSON syntax for all message files
   node -e "require('./messages/en.json')"
   node -e "require('./messages/fr.json')"
   node -e "require('./messages/es.json')"
   node -e "require('./messages/de.json')"
   node -e "require('./messages/nl.json')"
   node -e "require('./messages/it.json')"
   ```

2. **Key Consistency Check:**
   - Compare key structures across all 6 language files
   - Ensure identical key paths exist in all files

3. **Build Verification:**
   ```bash
   npm run build
   ```

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| English namespace creation | 15 min |
| French translations | 10 min |
| Spanish translations | 10 min |
| German translations | 10 min |
| Dutch translations | 10 min |
| Italian translations | 10 min |
| Validation and testing | 10 min |
| **Total** | **~75 min** |

---

## 11. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Existing Translation Pattern](/src/components/LogoutButton.tsx)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
