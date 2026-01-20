# Implementation Breakdown: REQ-E02-070 - Create Articles Namespace Structure

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-070
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.1
**Estimated Strings:** ~300

---

## Overview

This document provides the implementation breakdown for creating the `articles` namespace structure in the messages file. The articles namespace will organize all translation keys for article creation, editing, management, and display throughout the FAQBNB application.

The Article & Content Management system consists of:
- Instructions/Guides list page with table and grid views
- Article edit page with markdown editor
- Media editing components (image cropper, video trimmer)
- Content viewers and galleries
- Asset panel for managing attachments

Related Components:
- `/src/app/dashboard2/instructions/page.tsx` - Instructions list page
- `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` - Article edit page
- `/src/components/InstructionsTable/` - Guide list components
- `/src/components/ItemCapture/editors/` - Markdown, image, video editors
- `/src/components/ItemManager/components/AssetPanel/` - Asset management

---

## Dependencies

### Prerequisites (Epic 1 Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Required |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/en.json` | Complete (base structure exists) |
| useTranslations hook | next-intl | Available |
| getTranslations | next-intl/server | Available |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, items, errors, language namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization

---

## Technical Context

### Current State Analysis

#### Instructions Table Components
| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| InstructionsTable | `/src/components/InstructionsTable/InstructionsTable.tsx` | ~25 |
| GuideToolbar | `/src/components/InstructionsTable/GuideToolbar.tsx` | ~15 |
| GuideGrid | `/src/components/InstructionsTable/GuideGrid.tsx` | ~10 |
| GuideCard | `/src/components/InstructionsTable/GuideCard.tsx` | ~10 |
| GuideColumnSettingsPopup | `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx` | ~10 |

#### Instructions Pages
| Page | Location | Estimated Strings |
|------|----------|-------------------|
| Instructions List | `/src/app/dashboard2/instructions/page.tsx` | ~40 |
| Article Edit | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | ~30 |

#### Editor Components
| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| MarkdownEditor | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | ~40 |
| ImageCropper | `/src/components/ItemCapture/editors/ImageCropper.tsx` | ~25 |
| VideoTrimmer | `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | ~25 |
| ImageRotator | `/src/components/ItemCapture/editors/ImageRotator.tsx` | ~10 |

#### Asset Panel Components
| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| AssetPanel | `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | ~25 |
| AssetDropZone | `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx` | ~15 |
| AssetItem | `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | ~10 |
| AssetRemoveConfirmDialog | `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | ~10 |
| SortableAssetList | `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx` | ~5 |

#### Content Viewer Components
| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| MediaGallery | `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | ~15 |
| InstructionsViewer | `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` | ~10 |
| VideoPlayer | `/src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx` | ~10 |
| PhotoViewer | `/src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx` | ~5 |
| PDFViewer | `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx` | ~5 |

---

## Namespace Structure Design

The `articles` namespace will be organized into logical sub-sections:

```json
{
  "articles": {
    "title": "",           // Page title
    "subtitle": "",        // Page subtitle
    "list": { },           // List/table view strings
    "grid": { },           // Grid view strings
    "card": { },           // Article card strings
    "toolbar": { },        // Toolbar UI strings
    "columns": { },        // Table column headers
    "sort": { },           // Sort options
    "filters": { },        // Filter options
    "editor": { },         // Markdown editor strings
    "media": { },          // Media upload/handling
    "crop": { },           // Image cropper strings
    "video": { },          // Video trimmer strings
    "rotate": { },         // Image rotator strings
    "assets": { },         // Asset panel strings
    "viewer": { },         // Content viewer strings
    "purposes": { },       // Purpose type labels
    "status": { },         // Status indicators
    "actions": { },        // Action buttons
    "empty": { },          // Empty states
    "loading": { },        // Loading states
    "validation": { },     // Validation messages
    "success": { },        // Success messages
    "errors": { }          // Error messages
  }
}
```

---

## Implementation Tasks

### Task 1: Create Base Namespace Structure
**Priority:** Critical
**Estimate:** 1 story point

Create the `articles` namespace skeleton in `/messages/en.json` with all required sub-sections.

**Acceptance Criteria:**
- [ ] Articles namespace added to en.json at root level
- [ ] All sub-sections created (list, grid, editor, media, crop, video, assets, viewer, purposes, etc.)
- [ ] Structure follows existing patterns in the messages file
- [ ] JSON validates without syntax errors

### Task 2: Add Page Title and Navigation Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for page titles and navigation.

**Keys to add:**
```json
{
  "articles": {
    "title": "Guides",
    "subtitle": "Manage guide articles for your items",
    "pageTitle": "Instructions",
    "breadcrumb": {
      "dashboard": "Dashboard",
      "guides": "Guides",
      "edit": "Edit Guide"
    }
  }
}
```

### Task 3: Add List View Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for the instructions list/table view.

**Keys to add:**
```json
{
  "articles": {
    "list": {
      "title": "Guides",
      "noGuides": "No guides available",
      "noResults": "No guides match your search or filters",
      "showingResults": "Showing {count} {count, plural, one {guide} other {guides}}"
    },
    "columns": {
      "title": "Title",
      "item": "Item",
      "room": "Room",
      "property": "Property",
      "purpose": "Purpose",
      "created": "Created",
      "updated": "Updated",
      "actions": "Actions"
    },
    "sort": {
      "label": "Sort by",
      "titleAsc": "Title (A-Z)",
      "titleDesc": "Title (Z-A)",
      "itemAsc": "Item (A-Z)",
      "itemDesc": "Item (Z-A)",
      "purposeAsc": "Purpose (A-Z)",
      "purposeDesc": "Purpose (Z-A)",
      "createdAsc": "Oldest First",
      "createdDesc": "Newest First",
      "ascending": "Ascending",
      "descending": "Descending"
    }
  }
}
```

### Task 4: Add Toolbar and Filter Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for the guide toolbar and filters.

**Keys to add:**
```json
{
  "articles": {
    "toolbar": {
      "search": "Search guides...",
      "searchPlaceholder": "Search by title, item, or room...",
      "viewMode": "View Mode",
      "gridView": "Grid View",
      "listView": "List View",
      "columnSettings": "Column Settings",
      "showColumns": "Show Columns"
    },
    "filters": {
      "label": "Filters",
      "purpose": "Purpose",
      "room": "Room",
      "property": "Property",
      "allPurposes": "All Purposes",
      "allRooms": "All Rooms",
      "allProperties": "All Properties",
      "clearFilters": "Clear Filters",
      "activeFilters": "{count} active {count, plural, one {filter} other {filters}}"
    }
  }
}
```

### Task 5: Add Grid and Card Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for grid view and article cards.

**Keys to add:**
```json
{
  "articles": {
    "grid": {
      "noGuides": "No guides to display",
      "loadMore": "Load More"
    },
    "card": {
      "item": "Item",
      "room": "Room",
      "purpose": "Purpose",
      "created": "Created {date}",
      "updated": "Updated {date}",
      "untitled": "Untitled",
      "noRoom": "No room",
      "viewGuide": "View Guide",
      "editGuide": "Edit Guide"
    }
  }
}
```

### Task 6: Add Editor Keys
**Priority:** High
**Estimate:** 1 story point

Add keys for the markdown editor component.

**Keys to add:**
```json
{
  "articles": {
    "editor": {
      "title": "Edit Content",
      "tabs": {
        "editor": "Editor",
        "preview": "Preview"
      },
      "toolbar": {
        "label": "Text formatting",
        "bold": "Bold",
        "boldShortcut": "Bold (Ctrl+B)",
        "italic": "Italic",
        "italicShortcut": "Italic (Ctrl+I)",
        "heading1": "Heading 1",
        "heading2": "Heading 2",
        "heading3": "Heading 3",
        "bulletList": "Bullet List",
        "numberedList": "Numbered List",
        "link": "Insert Link",
        "linkShortcut": "Insert Link (Ctrl+K)"
      },
      "placeholder": "Write your content here using markdown formatting...",
      "previewPlaceholder": "Start typing to see a preview of your formatted content...",
      "characterCount": "{current} / {max} characters",
      "characterLimitWarning": "Content exceeds the maximum character limit. Please shorten your text.",
      "ariaLabel": "Markdown editor",
      "viewModeLabel": "Editor view mode"
    }
  }
}
```

### Task 7: Add Media Upload Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for media upload functionality.

**Keys to add:**
```json
{
  "articles": {
    "media": {
      "upload": "Upload Media",
      "dragDrop": "Drag and drop files here",
      "or": "or",
      "browse": "Browse files",
      "browseFiles": "Choose files",
      "supportedFormats": "Supported formats: {formats}",
      "maxSize": "Maximum file size: {size}MB",
      "uploading": "Uploading...",
      "uploadProgress": "Uploading {percent}%",
      "uploadComplete": "Upload complete",
      "uploadFailed": "Upload failed",
      "processing": "Processing...",
      "dragActive": "Drop files here",
      "invalidFileType": "Invalid file type. Allowed: {types}",
      "fileTooLarge": "File size exceeds {max}MB limit"
    }
  }
}
```

### Task 8: Add Image Cropper Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for the image cropper component.

**Keys to add:**
```json
{
  "articles": {
    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "free": "Free",
      "square": "Square",
      "standard": "Standard",
      "widescreen": "Widescreen",
      "custom": "Custom",
      "preview": "Preview:",
      "previewGenerating": "Generating...",
      "previewPlaceholder": "Select area to preview",
      "applyCrop": "Apply Crop",
      "applying": "Applying...",
      "cancel": "Cancel",
      "reset": "Reset",
      "loadingImage": "Loading image...",
      "applyingCrop": "Applying crop...",
      "largeImageWarning": "Large image detected. Output may be scaled down for compatibility.",
      "loadError": "Failed to load image. Please try again.",
      "cropError": "Crop operation failed"
    }
  }
}
```

### Task 9: Add Video Trimmer Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for the video trimmer component.

**Keys to add:**
```json
{
  "articles": {
    "video": {
      "title": "Trim Video",
      "startTime": "Start Time",
      "endTime": "End Time",
      "duration": "Duration: {duration}",
      "trimDuration": "Trim Duration: {duration}",
      "maxDuration": "Maximum duration: {max}",
      "preview": "Preview",
      "playPreview": "Play Preview",
      "pausePreview": "Pause Preview",
      "applyTrim": "Apply Trim",
      "applying": "Applying...",
      "cancel": "Cancel",
      "reset": "Reset to Original",
      "processing": "Processing video...",
      "loadingVideo": "Loading video...",
      "trimError": "Trim operation failed"
    }
  }
}
```

### Task 10: Add Image Rotator Keys
**Priority:** Medium
**Estimate:** 0.25 story points

Add keys for image rotation functionality.

**Keys to add:**
```json
{
  "articles": {
    "rotate": {
      "title": "Rotate Image",
      "rotateLeft": "Rotate Left",
      "rotateRight": "Rotate Right",
      "flip": "Flip",
      "flipHorizontal": "Flip Horizontal",
      "flipVertical": "Flip Vertical",
      "apply": "Apply",
      "cancel": "Cancel",
      "reset": "Reset"
    }
  }
}
```

### Task 11: Add Asset Panel Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for the asset panel component.

**Keys to add:**
```json
{
  "articles": {
    "assets": {
      "title": "Assets",
      "subtitle": "Manage attached files",
      "addAsset": "Add Asset",
      "dropZone": {
        "title": "Drop files here",
        "subtitle": "or click to browse",
        "active": "Drop to upload",
        "formats": "Images, PDFs, and videos accepted"
      },
      "item": {
        "preview": "Preview",
        "download": "Download",
        "remove": "Remove",
        "moveUp": "Move Up",
        "moveDown": "Move Down",
        "reorder": "Drag to reorder"
      },
      "removeConfirm": {
        "title": "Remove Asset?",
        "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
        "cancel": "Cancel",
        "remove": "Remove"
      },
      "empty": {
        "title": "No assets",
        "description": "Add images, PDFs, or videos to this guide"
      },
      "count": "{count, plural, one {# asset} other {# assets}}"
    }
  }
}
```

### Task 12: Add Content Viewer Keys
**Priority:** Medium
**Estimate:** 0.5 story points

Add keys for content viewer components.

**Keys to add:**
```json
{
  "articles": {
    "viewer": {
      "gallery": {
        "title": "Gallery",
        "previous": "Previous",
        "next": "Next",
        "close": "Close",
        "imageOf": "Image {current} of {total}",
        "fullscreen": "View Fullscreen",
        "exitFullscreen": "Exit Fullscreen"
      },
      "video": {
        "play": "Play",
        "pause": "Pause",
        "mute": "Mute",
        "unmute": "Unmute",
        "fullscreen": "Fullscreen",
        "loading": "Loading video...",
        "error": "Error loading video"
      },
      "photo": {
        "zoom": "Zoom",
        "zoomIn": "Zoom In",
        "zoomOut": "Zoom Out",
        "resetZoom": "Reset Zoom",
        "loading": "Loading image...",
        "error": "Error loading image"
      },
      "pdf": {
        "page": "Page {current} of {total}",
        "previousPage": "Previous Page",
        "nextPage": "Next Page",
        "download": "Download PDF",
        "loading": "Loading PDF...",
        "error": "Error loading PDF"
      },
      "instructions": {
        "title": "Instructions",
        "noContent": "No instructions available"
      }
    }
  }
}
```

### Task 13: Add Purpose Labels
**Priority:** High
**Estimate:** 0.5 story points

Add translation keys for purpose types.

**Keys to add:**
```json
{
  "articles": {
    "purposes": {
      "howToUse": "How to Use",
      "howToClean": "How to Clean",
      "troubleshooting": "Troubleshooting",
      "safetyInfo": "Safety Information",
      "maintenance": "Maintenance",
      "features": "Features & Tips",
      "warranty": "Warranty & Support",
      "other": "Other"
    }
  }
}
```

### Task 14: Add Status and Action Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for status indicators and actions.

**Keys to add:**
```json
{
  "articles": {
    "status": {
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived",
      "scheduled": "Scheduled",
      "underReview": "Under Review"
    },
    "actions": {
      "create": "Create Guide",
      "edit": "Edit",
      "delete": "Delete",
      "duplicate": "Duplicate",
      "archive": "Archive",
      "restore": "Restore",
      "publish": "Publish",
      "unpublish": "Unpublish",
      "save": "Save",
      "saveChanges": "Save Changes",
      "cancel": "Cancel",
      "discard": "Discard Changes",
      "preview": "Preview",
      "view": "View",
      "print": "Print",
      "share": "Share"
    }
  }
}
```

### Task 15: Add Empty and Loading State Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for empty states and loading states.

**Keys to add:**
```json
{
  "articles": {
    "empty": {
      "title": "No guides yet",
      "description": "Create items and add guide articles to get started. Guides help guests understand how to use items in your property.",
      "noResults": "No guides match your filters",
      "noResultsDescription": "Try adjusting your search or filters",
      "createFirst": "Create Your First Item",
      "learnMore": "Learn More"
    },
    "loading": {
      "guides": "Loading guides...",
      "guide": "Loading guide...",
      "saving": "Saving...",
      "publishing": "Publishing...",
      "deleting": "Deleting..."
    }
  }
}
```

### Task 16: Add Validation and Error Keys
**Priority:** Medium
**Estimate:** 0.5 story points

Add keys for validation messages and errors.

**Keys to add:**
```json
{
  "articles": {
    "validation": {
      "titleRequired": "Guide title is required",
      "titleTooLong": "Title must be less than 200 characters",
      "contentRequired": "Content is required",
      "contentTooLong": "Content exceeds maximum length",
      "invalidPurpose": "Please select a valid purpose"
    },
    "errors": {
      "loadFailed": "Failed to load guide",
      "saveFailed": "Failed to save guide",
      "deleteFailed": "Failed to delete guide",
      "uploadFailed": "Failed to upload file",
      "notFound": "Guide not found",
      "unauthorized": "You are not authorized to edit this guide"
    },
    "success": {
      "saved": "Guide saved successfully",
      "updated": "Guide updated successfully",
      "deleted": "Guide deleted successfully",
      "published": "Guide published successfully",
      "duplicated": "Guide duplicated successfully"
    }
  }
}
```

### Task 17: Add Authentication and Access Keys
**Priority:** Medium
**Estimate:** 0.25 story points

Add keys for authentication-related messages.

**Keys to add:**
```json
{
  "articles": {
    "auth": {
      "required": "Authentication Required",
      "loginPrompt": "Please log in to access guides.",
      "goToLogin": "Go to Login"
    },
    "error": {
      "title": "Error Loading Guides",
      "retry": "Retry"
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Primary File to Modify
| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/en.json` | Add articles namespace structure | Add new namespace |

### Files to Reference (Read-Only for Structure Analysis)
| File | Purpose |
|------|---------|
| `/src/app/dashboard2/instructions/page.tsx` | Instructions list page strings |
| `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Article edit page strings |
| `/src/components/InstructionsTable/InstructionsTable.tsx` | Table component strings |
| `/src/components/InstructionsTable/GuideToolbar.tsx` | Toolbar component strings |
| `/src/components/InstructionsTable/GuideGrid.tsx` | Grid view strings |
| `/src/components/InstructionsTable/GuideCard.tsx` | Card component strings |
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Markdown editor strings |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Image cropper strings |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Video trimmer strings |
| `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Asset panel strings |

### Files for Future Tasks (Component Updates in 2E.2-2E.6)
These files will be modified in subsequent tasks to use the translation keys:

| Category | Files |
|----------|-------|
| Instruction Pages | `instructions/page.tsx`, `instructions/[articleId]/edit/page.tsx` |
| Table Components | `InstructionsTable.tsx`, `GuideToolbar.tsx`, `GuideGrid.tsx`, `GuideCard.tsx`, `GuideColumnSettingsPopup.tsx` |
| Editor Components | `MarkdownEditor.tsx`, `ImageCropper.tsx`, `VideoTrimmer.tsx`, `ImageRotator.tsx` |
| Asset Components | `AssetPanel.tsx`, `AssetDropZone.tsx`, `AssetItem.tsx`, `AssetRemoveConfirmDialog.tsx`, `SortableAssetList.tsx` |
| Viewer Components | `MediaGallery.tsx`, `InstructionsViewer.tsx`, `VideoPlayer.tsx`, `PhotoViewer.tsx`, `PDFViewer.tsx` |

---

## Verification Steps

1. **JSON Validation**
   - Run `cat /messages/en.json | python -m json.tool` to verify valid JSON
   - Ensure no duplicate keys exist

2. **Structure Verification**
   - Verify all sub-namespaces are created
   - Confirm key naming follows `{namespace}.{area}.{element}` convention

3. **Completeness Check**
   - Cross-reference with component strings
   - Ensure all identified strings have corresponding keys

4. **Build Verification**
   - Run `npm run build` to ensure no build errors
   - Verify the application starts without i18n errors

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered later | Medium | Low | Iterative addition; namespace structure allows easy extension |
| Key naming inconsistency | Low | Medium | Follow established patterns; review during implementation |
| JSON syntax errors | Low | High | Validate JSON after each change |
| Overlap with items namespace | Low | Low | Articles focuses on guides/content; items focuses on QR items |

---

## Notes for Implementation

1. **Key Naming Convention**
   - Use camelCase for keys: `articles.editor.toolbar.bold`
   - Group related keys under descriptive parents
   - Use plural form for collections: `purposes`, `columns`

2. **ICU Message Format**
   - Use `{count, plural, one {# guide} other {# guides}}` for pluralization
   - Use `{name}` for simple interpolation
   - Use `{date}` for date placeholders

3. **Distinction from Items Namespace**
   - `items` namespace: QR code items, item management, item cards
   - `articles` namespace: Guides/instructions, content editing, media handling

4. **Coordination with Other Tasks**
   - Tasks 2E.2-2E.5 will update components to use these keys
   - Task 2E.6 will generate translations for 5 non-English languages

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-070)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
