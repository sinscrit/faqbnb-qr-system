# Detailed Task Breakdown: REQ-E02-070 - Create Articles Namespace Structure

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-070
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.1
**Estimated Strings:** ~300
**Story Points:** 2

---

## Overview

This document provides the detailed, actionable task breakdown for creating the `articles` namespace structure in `/messages/en.json`. This namespace will organize all translation keys for article/guide creation, editing, management, and display throughout the FAQBNB application.

### Related Documentation
- **Overview Document:** `/docs/REQ-E02-070-create-articles-namespace-structure-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Requirements:** `/docs/gen_requests_epic2.md` (REQ-E02-070)

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with base structure
- [ ] `useTranslations` hook is available from next-intl
- [ ] `getTranslations` is available from next-intl/server
- [ ] i18n config exists at `/src/lib/i18n/config.ts`

---

## Task Breakdown

### Task 1: Create Base Articles Namespace Structure
**Priority:** Critical | **Estimate:** 0.25 SP | **Type:** Implementation

**Description:**
Create the `articles` namespace skeleton in `/messages/en.json` with all required sub-sections. This establishes the organizational structure for all article-related translation keys.

**File to Modify:**
- `/messages/en.json`

**Implementation Steps:**

1. Open `/messages/en.json`
2. Add the `articles` namespace at the root level (after existing namespaces)
3. Create all required sub-section placeholders

**Code to Add:**
```json
{
  "articles": {
    "title": "Guides",
    "subtitle": "Manage guide articles for your items",
    "pageTitle": "Instructions",
    "list": {},
    "grid": {},
    "card": {},
    "toolbar": {},
    "columns": {},
    "sort": {},
    "filters": {},
    "editor": {},
    "media": {},
    "crop": {},
    "video": {},
    "rotate": {},
    "assets": {},
    "viewer": {},
    "purposes": {},
    "status": {},
    "actions": {},
    "empty": {},
    "loading": {},
    "validation": {},
    "success": {},
    "errors": {},
    "auth": {},
    "breadcrumb": {}
  }
}
```

**Acceptance Criteria:**
- [ ] Articles namespace added to en.json at root level
- [ ] All sub-sections created as empty objects
- [ ] JSON validates without syntax errors (run `cat /messages/en.json | python -m json.tool`)
- [ ] Application builds without errors (`npm run build`)

**Verification Command:**
```bash
cat /messages/en.json | python -m json.tool > /dev/null && echo "JSON is valid"
```

---

### Task 2: Add Page Title and Breadcrumb Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for page titles, subtitles, and breadcrumb navigation.

**File to Modify:**
- `/messages/en.json`

**Implementation Steps:**

1. Locate the `articles` namespace in `/messages/en.json`
2. Update the title, subtitle, and pageTitle keys
3. Add the breadcrumb sub-section with navigation keys

**Code to Add/Update:**
```json
{
  "articles": {
    "title": "Guides",
    "subtitle": "Manage guide articles for your items",
    "pageTitle": "Instructions",
    "breadcrumb": {
      "dashboard": "Dashboard",
      "guides": "Guides",
      "edit": "Edit Guide",
      "create": "Create Guide",
      "view": "View Guide"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Page title keys are defined
- [ ] Breadcrumb navigation keys are complete
- [ ] Keys follow camelCase naming convention

---

### Task 3: Add List View Translation Keys
**Priority:** High | **Estimate:** 0.15 SP | **Type:** Implementation

**Description:**
Add translation keys for the instructions list/table view, including column headers and result messages.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/InstructionsTable/InstructionsTable.tsx`
- `/src/app/dashboard2/instructions/page.tsx`

**Implementation Steps:**

1. Locate the `articles.list` section in `/messages/en.json`
2. Add all list view translation keys
3. Add column header keys in `articles.columns`
4. Add sort option keys in `articles.sort`

**Code to Add:**
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

**Acceptance Criteria:**
- [ ] List view keys include empty state messages
- [ ] Column header keys match table columns
- [ ] Sort options cover all sortable fields
- [ ] Pluralization uses ICU format correctly

---

### Task 4: Add Toolbar and Filter Translation Keys
**Priority:** High | **Estimate:** 0.15 SP | **Type:** Implementation

**Description:**
Add translation keys for the guide toolbar (search, view modes) and filter options.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/InstructionsTable/GuideToolbar.tsx`
- `/src/components/InstructionsTable/GuideColumnSettingsPopup.tsx`

**Implementation Steps:**

1. Locate the `articles.toolbar` section in `/messages/en.json`
2. Add all toolbar translation keys
3. Locate the `articles.filters` section
4. Add all filter translation keys

**Code to Add:**
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
      "showColumns": "Show Columns",
      "resetColumns": "Reset to Default"
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

**Acceptance Criteria:**
- [ ] Search placeholder text is defined
- [ ] View mode toggle labels are defined
- [ ] All filter dropdown options are defined
- [ ] Filter count uses ICU pluralization

---

### Task 5: Add Grid View and Card Translation Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for grid view layout and individual article cards.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/InstructionsTable/GuideGrid.tsx`
- `/src/components/InstructionsTable/GuideCard.tsx`

**Implementation Steps:**

1. Locate the `articles.grid` section in `/messages/en.json`
2. Add grid view translation keys
3. Locate the `articles.card` section
4. Add card component translation keys

**Code to Add:**
```json
{
  "articles": {
    "grid": {
      "noGuides": "No guides to display",
      "loadMore": "Load More",
      "endOfResults": "No more guides to load"
    },
    "card": {
      "item": "Item",
      "room": "Room",
      "purpose": "Purpose",
      "created": "Created {date}",
      "updated": "Updated {date}",
      "untitled": "Untitled",
      "noRoom": "No room",
      "noPurpose": "No purpose",
      "viewGuide": "View Guide",
      "editGuide": "Edit Guide",
      "deleteGuide": "Delete Guide"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Grid view empty state is defined
- [ ] Card metadata labels are defined
- [ ] Date interpolation uses `{date}` placeholder
- [ ] Card action buttons are labeled

---

### Task 6: Add Markdown Editor Translation Keys
**Priority:** High | **Estimate:** 0.2 SP | **Type:** Implementation

**Description:**
Add comprehensive translation keys for the markdown editor component including toolbar buttons, tabs, and accessibility labels.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/ItemCapture/editors/MarkdownEditor.tsx`

**Implementation Steps:**

1. Locate the `articles.editor` section in `/messages/en.json`
2. Add all editor translation keys including nested toolbar section

**Code to Add:**
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
        "underline": "Underline",
        "strikethrough": "Strikethrough",
        "heading1": "Heading 1",
        "heading2": "Heading 2",
        "heading3": "Heading 3",
        "bulletList": "Bullet List",
        "numberedList": "Numbered List",
        "checkList": "Checklist",
        "link": "Insert Link",
        "linkShortcut": "Insert Link (Ctrl+K)",
        "image": "Insert Image",
        "quote": "Block Quote",
        "code": "Code Block",
        "undo": "Undo",
        "redo": "Redo"
      },
      "placeholder": "Write your content here using markdown formatting...",
      "previewPlaceholder": "Start typing to see a preview of your formatted content...",
      "characterCount": "{current} / {max} characters",
      "characterLimitWarning": "Content exceeds the maximum character limit. Please shorten your text.",
      "wordCount": "{count} {count, plural, one {word} other {words}}",
      "ariaLabel": "Markdown editor",
      "viewModeLabel": "Editor view mode",
      "autoSave": "Auto-saved",
      "unsavedChanges": "Unsaved changes"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All toolbar button labels are defined
- [ ] Keyboard shortcut labels are included
- [ ] Character count uses interpolation
- [ ] Word count uses ICU pluralization
- [ ] Accessibility labels (aria-label) are defined

---

### Task 7: Add Media Upload Translation Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for media upload functionality including drag-and-drop, progress, and error states.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`
- Various media upload components

**Implementation Steps:**

1. Locate the `articles.media` section in `/messages/en.json`
2. Add all media upload translation keys

**Code to Add:**
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
      "fileTooLarge": "File size exceeds {max}MB limit",
      "removeFile": "Remove file",
      "replaceFile": "Replace file"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Drag-and-drop states are defined
- [ ] Upload progress uses `{percent}` interpolation
- [ ] File size limit uses `{max}` interpolation
- [ ] Supported formats use `{formats}` interpolation
- [ ] Error messages for invalid files are defined

---

### Task 8: Add Image Cropper Translation Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for the image cropper component including aspect ratio options and action buttons.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/ItemCapture/editors/ImageCropper.tsx`

**Implementation Steps:**

1. Locate the `articles.crop` section in `/messages/en.json`
2. Add all image cropper translation keys

**Code to Add:**
```json
{
  "articles": {
    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "free": "Free",
      "square": "Square (1:1)",
      "standard": "Standard (4:3)",
      "widescreen": "Widescreen (16:9)",
      "portrait": "Portrait (3:4)",
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
      "cropError": "Crop operation failed",
      "zoomIn": "Zoom In",
      "zoomOut": "Zoom Out",
      "rotateLeft": "Rotate Left",
      "rotateRight": "Rotate Right"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All aspect ratio options are labeled
- [ ] Action button labels are defined
- [ ] Loading and error states are defined
- [ ] Zoom and rotate controls are labeled

---

### Task 9: Add Video Trimmer Translation Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for the video trimmer component including timeline controls and duration display.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/ItemCapture/editors/VideoTrimmer.tsx`

**Implementation Steps:**

1. Locate the `articles.video` section in `/messages/en.json`
2. Add all video trimmer translation keys

**Code to Add:**
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
      "trimError": "Trim operation failed",
      "playbackError": "Video playback error",
      "currentTime": "Current: {time}",
      "setStart": "Set Start Point",
      "setEnd": "Set End Point"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Timeline control labels are defined
- [ ] Duration display uses `{duration}` interpolation
- [ ] Play/pause state labels are defined
- [ ] Error states are defined

---

### Task 10: Add Image Rotator Translation Keys
**Priority:** Medium | **Estimate:** 0.05 SP | **Type:** Implementation

**Description:**
Add translation keys for image rotation and flip functionality.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/ItemCapture/editors/ImageRotator.tsx`

**Implementation Steps:**

1. Locate the `articles.rotate` section in `/messages/en.json`
2. Add all image rotator translation keys

**Code to Add:**
```json
{
  "articles": {
    "rotate": {
      "title": "Rotate Image",
      "rotateLeft": "Rotate Left 90°",
      "rotateRight": "Rotate Right 90°",
      "rotate180": "Rotate 180°",
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

**Acceptance Criteria:**
- [ ] Rotation direction labels include degrees
- [ ] Flip options are clearly labeled
- [ ] Action buttons are defined

---

### Task 11: Add Asset Panel Translation Keys
**Priority:** High | **Estimate:** 0.15 SP | **Type:** Implementation

**Description:**
Add translation keys for the asset panel component including drop zone, item actions, and remove confirmation.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
- `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`
- `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
- `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`
- `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Implementation Steps:**

1. Locate the `articles.assets` section in `/messages/en.json`
2. Add all asset panel translation keys including nested sections

**Code to Add:**
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
        "reorder": "Drag to reorder",
        "rename": "Rename",
        "duplicate": "Duplicate"
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
      "count": "{count, plural, =0 {No assets} one {# asset} other {# assets}}",
      "fileSize": "{size}",
      "fileType": {
        "image": "Image",
        "video": "Video",
        "pdf": "PDF",
        "document": "Document",
        "unknown": "File"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Drop zone states are defined
- [ ] Asset item actions are labeled
- [ ] Remove confirmation includes `{name}` interpolation
- [ ] Asset count uses ICU pluralization
- [ ] File type labels are defined

---

### Task 12: Add Content Viewer Translation Keys
**Priority:** Medium | **Estimate:** 0.15 SP | **Type:** Implementation

**Description:**
Add translation keys for content viewer components including gallery, video player, photo viewer, and PDF viewer.

**File to Modify:**
- `/messages/en.json`

**Components These Keys Support:**
- `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
- `/src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`
- `/src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx`
- `/src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx`
- `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`

**Implementation Steps:**

1. Locate the `articles.viewer` section in `/messages/en.json`
2. Add all viewer translation keys with nested sections for each viewer type

**Code to Add:**
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
        "exitFullscreen": "Exit Fullscreen",
        "download": "Download Image",
        "share": "Share"
      },
      "video": {
        "play": "Play",
        "pause": "Pause",
        "mute": "Mute",
        "unmute": "Unmute",
        "fullscreen": "Fullscreen",
        "exitFullscreen": "Exit Fullscreen",
        "loading": "Loading video...",
        "error": "Error loading video",
        "volume": "Volume",
        "playbackSpeed": "Playback Speed",
        "currentTime": "{current} / {total}"
      },
      "photo": {
        "zoom": "Zoom",
        "zoomIn": "Zoom In",
        "zoomOut": "Zoom Out",
        "resetZoom": "Reset Zoom",
        "fitToScreen": "Fit to Screen",
        "actualSize": "Actual Size",
        "loading": "Loading image...",
        "error": "Error loading image"
      },
      "pdf": {
        "page": "Page {current} of {total}",
        "previousPage": "Previous Page",
        "nextPage": "Next Page",
        "firstPage": "First Page",
        "lastPage": "Last Page",
        "goToPage": "Go to Page",
        "download": "Download PDF",
        "print": "Print",
        "loading": "Loading PDF...",
        "error": "Error loading PDF",
        "zoomIn": "Zoom In",
        "zoomOut": "Zoom Out"
      },
      "instructions": {
        "title": "Instructions",
        "noContent": "No instructions available",
        "readMore": "Read More",
        "collapse": "Show Less"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Gallery navigation uses `{current}` and `{total}` interpolation
- [ ] Video player controls are defined
- [ ] PDF pagination uses `{current}` and `{total}` interpolation
- [ ] All viewer types have loading and error states

---

### Task 13: Add Purpose Type Translation Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for article purpose types that categorize the type of content/instruction.

**File to Modify:**
- `/messages/en.json`

**Implementation Steps:**

1. Locate the `articles.purposes` section in `/messages/en.json`
2. Add all purpose type translation keys

**Code to Add:**
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
      "setup": "Setup & Installation",
      "storage": "Storage Instructions",
      "disposal": "Disposal & Recycling",
      "other": "Other",
      "unknown": "Unknown Purpose"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All existing purpose types have translations
- [ ] Purpose labels are concise and clear
- [ ] Unknown/other fallback is defined

---

### Task 14: Add Status and Action Translation Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for article status indicators and action buttons used throughout the article management interface.

**File to Modify:**
- `/messages/en.json`

**Implementation Steps:**

1. Locate the `articles.status` section in `/messages/en.json`
2. Add all status translation keys
3. Locate the `articles.actions` section
4. Add all action button translation keys

**Code to Add:**
```json
{
  "articles": {
    "status": {
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived",
      "scheduled": "Scheduled",
      "underReview": "Under Review",
      "pendingApproval": "Pending Approval"
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
      "saveDraft": "Save Draft",
      "cancel": "Cancel",
      "discard": "Discard Changes",
      "preview": "Preview",
      "view": "View",
      "print": "Print",
      "share": "Share",
      "copyLink": "Copy Link",
      "download": "Download",
      "addContent": "Add Content",
      "removeContent": "Remove Content"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All article statuses have translations
- [ ] Common action buttons are defined
- [ ] Status labels are consistent with UI design

---

### Task 15: Add Empty and Loading State Translation Keys
**Priority:** High | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for empty states (when no data is available) and loading states throughout the article interface.

**File to Modify:**
- `/messages/en.json`

**Implementation Steps:**

1. Locate the `articles.empty` section in `/messages/en.json`
2. Add all empty state translation keys
3. Locate the `articles.loading` section
4. Add all loading state translation keys

**Code to Add:**
```json
{
  "articles": {
    "empty": {
      "title": "No guides yet",
      "description": "Create items and add guide articles to get started. Guides help guests understand how to use items in your property.",
      "noResults": "No guides match your filters",
      "noResultsDescription": "Try adjusting your search or filters",
      "createFirst": "Create Your First Item",
      "learnMore": "Learn More",
      "noContent": "No content added yet",
      "noContentDescription": "Add photos, videos, or written instructions to this guide"
    },
    "loading": {
      "guides": "Loading guides...",
      "guide": "Loading guide...",
      "content": "Loading content...",
      "saving": "Saving...",
      "publishing": "Publishing...",
      "deleting": "Deleting...",
      "uploading": "Uploading...",
      "processing": "Processing...",
      "generating": "Generating preview..."
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Empty states include title and description
- [ ] Empty states provide actionable guidance
- [ ] Loading states cover all async operations
- [ ] Loading messages use present participle (-ing) form

---

### Task 16: Add Validation, Error, and Success Message Keys
**Priority:** Medium | **Estimate:** 0.1 SP | **Type:** Implementation

**Description:**
Add translation keys for form validation messages, error states, and success notifications specific to article management.

**File to Modify:**
- `/messages/en.json`

**Implementation Steps:**

1. Locate the `articles.validation` section in `/messages/en.json`
2. Add all validation translation keys
3. Locate the `articles.errors` section
4. Add all error translation keys
5. Locate the `articles.success` section
6. Add all success translation keys

**Code to Add:**
```json
{
  "articles": {
    "validation": {
      "titleRequired": "Guide title is required",
      "titleTooLong": "Title must be less than 200 characters",
      "contentRequired": "Content is required",
      "contentTooLong": "Content exceeds maximum length of {max} characters",
      "invalidPurpose": "Please select a valid purpose",
      "invalidItem": "Please select a valid item",
      "duplicateTitle": "A guide with this title already exists"
    },
    "errors": {
      "loadFailed": "Failed to load guide",
      "saveFailed": "Failed to save guide",
      "deleteFailed": "Failed to delete guide",
      "publishFailed": "Failed to publish guide",
      "uploadFailed": "Failed to upload file",
      "notFound": "Guide not found",
      "unauthorized": "You are not authorized to edit this guide",
      "networkError": "Network error. Please check your connection and try again."
    },
    "success": {
      "saved": "Guide saved successfully",
      "updated": "Guide updated successfully",
      "deleted": "Guide deleted successfully",
      "published": "Guide published successfully",
      "unpublished": "Guide unpublished successfully",
      "duplicated": "Guide duplicated successfully",
      "archived": "Guide archived successfully",
      "restored": "Guide restored successfully",
      "copied": "Link copied to clipboard"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Validation messages clearly indicate the issue
- [ ] Character limit uses `{max}` interpolation
- [ ] Error messages suggest remediation when possible
- [ ] Success messages confirm the completed action

---

### Task 17: Add Authentication-Related Translation Keys
**Priority:** Medium | **Estimate:** 0.05 SP | **Type:** Implementation

**Description:**
Add translation keys for authentication-related messages specific to article access.

**File to Modify:**
- `/messages/en.json`

**Implementation Steps:**

1. Locate the `articles.auth` section in `/messages/en.json`
2. Add authentication-related translation keys

**Code to Add:**
```json
{
  "articles": {
    "auth": {
      "required": "Authentication Required",
      "loginPrompt": "Please log in to access guides.",
      "goToLogin": "Go to Login",
      "permissionDenied": "You don't have permission to view this guide",
      "sessionExpired": "Your session has expired. Please log in again."
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Authentication required message is defined
- [ ] Login prompt and action are defined
- [ ] Permission denied message is defined

---

### Task 18: Final Validation and Testing
**Priority:** Critical | **Estimate:** 0.15 SP | **Type:** Verification

**Description:**
Validate the complete articles namespace structure, ensure JSON syntax is correct, and verify the application builds successfully.

**Verification Steps:**

1. **JSON Validation:**
   ```bash
   cat /messages/en.json | python -m json.tool > /dev/null && echo "JSON is valid"
   ```

2. **Check for Duplicate Keys:**
   ```bash
   # Use jq to detect duplicates (should output clean JSON)
   cat /messages/en.json | jq '.' > /dev/null && echo "No duplicate keys"
   ```

3. **Build Verification:**
   ```bash
   npm run build
   ```

4. **Development Server Test:**
   ```bash
   npm run dev
   # Navigate to /dashboard2/instructions page
   # Verify no console errors related to missing translations
   ```

5. **Structure Verification Checklist:**
   - [ ] `articles` namespace exists at root level
   - [ ] All 18 sub-sections are present (title, subtitle, list, grid, card, toolbar, columns, sort, filters, editor, media, crop, video, rotate, assets, viewer, purposes, status, actions, empty, loading, validation, errors, success, auth, breadcrumb)
   - [ ] Key naming follows `camelCase` convention
   - [ ] Pluralizations use ICU format (`{count, plural, ...}`)
   - [ ] Interpolations use `{variableName}` format

**Acceptance Criteria:**
- [ ] JSON validates without syntax errors
- [ ] No duplicate keys exist in the namespace
- [ ] Application builds without errors
- [ ] No missing translation warnings in console during development

---

## Complete Namespace Structure

Below is the complete `articles` namespace structure to be added to `/messages/en.json`:

```json
{
  "articles": {
    "title": "Guides",
    "subtitle": "Manage guide articles for your items",
    "pageTitle": "Instructions",
    "breadcrumb": {
      "dashboard": "Dashboard",
      "guides": "Guides",
      "edit": "Edit Guide",
      "create": "Create Guide",
      "view": "View Guide"
    },
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
    },
    "toolbar": {
      "search": "Search guides...",
      "searchPlaceholder": "Search by title, item, or room...",
      "viewMode": "View Mode",
      "gridView": "Grid View",
      "listView": "List View",
      "columnSettings": "Column Settings",
      "showColumns": "Show Columns",
      "resetColumns": "Reset to Default"
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
    },
    "grid": {
      "noGuides": "No guides to display",
      "loadMore": "Load More",
      "endOfResults": "No more guides to load"
    },
    "card": {
      "item": "Item",
      "room": "Room",
      "purpose": "Purpose",
      "created": "Created {date}",
      "updated": "Updated {date}",
      "untitled": "Untitled",
      "noRoom": "No room",
      "noPurpose": "No purpose",
      "viewGuide": "View Guide",
      "editGuide": "Edit Guide",
      "deleteGuide": "Delete Guide"
    },
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
        "underline": "Underline",
        "strikethrough": "Strikethrough",
        "heading1": "Heading 1",
        "heading2": "Heading 2",
        "heading3": "Heading 3",
        "bulletList": "Bullet List",
        "numberedList": "Numbered List",
        "checkList": "Checklist",
        "link": "Insert Link",
        "linkShortcut": "Insert Link (Ctrl+K)",
        "image": "Insert Image",
        "quote": "Block Quote",
        "code": "Code Block",
        "undo": "Undo",
        "redo": "Redo"
      },
      "placeholder": "Write your content here using markdown formatting...",
      "previewPlaceholder": "Start typing to see a preview of your formatted content...",
      "characterCount": "{current} / {max} characters",
      "characterLimitWarning": "Content exceeds the maximum character limit. Please shorten your text.",
      "wordCount": "{count} {count, plural, one {word} other {words}}",
      "ariaLabel": "Markdown editor",
      "viewModeLabel": "Editor view mode",
      "autoSave": "Auto-saved",
      "unsavedChanges": "Unsaved changes"
    },
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
      "fileTooLarge": "File size exceeds {max}MB limit",
      "removeFile": "Remove file",
      "replaceFile": "Replace file"
    },
    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "free": "Free",
      "square": "Square (1:1)",
      "standard": "Standard (4:3)",
      "widescreen": "Widescreen (16:9)",
      "portrait": "Portrait (3:4)",
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
      "cropError": "Crop operation failed",
      "zoomIn": "Zoom In",
      "zoomOut": "Zoom Out",
      "rotateLeft": "Rotate Left",
      "rotateRight": "Rotate Right"
    },
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
      "trimError": "Trim operation failed",
      "playbackError": "Video playback error",
      "currentTime": "Current: {time}",
      "setStart": "Set Start Point",
      "setEnd": "Set End Point"
    },
    "rotate": {
      "title": "Rotate Image",
      "rotateLeft": "Rotate Left 90°",
      "rotateRight": "Rotate Right 90°",
      "rotate180": "Rotate 180°",
      "flip": "Flip",
      "flipHorizontal": "Flip Horizontal",
      "flipVertical": "Flip Vertical",
      "apply": "Apply",
      "cancel": "Cancel",
      "reset": "Reset"
    },
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
        "reorder": "Drag to reorder",
        "rename": "Rename",
        "duplicate": "Duplicate"
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
      "count": "{count, plural, =0 {No assets} one {# asset} other {# assets}}",
      "fileSize": "{size}",
      "fileType": {
        "image": "Image",
        "video": "Video",
        "pdf": "PDF",
        "document": "Document",
        "unknown": "File"
      }
    },
    "viewer": {
      "gallery": {
        "title": "Gallery",
        "previous": "Previous",
        "next": "Next",
        "close": "Close",
        "imageOf": "Image {current} of {total}",
        "fullscreen": "View Fullscreen",
        "exitFullscreen": "Exit Fullscreen",
        "download": "Download Image",
        "share": "Share"
      },
      "video": {
        "play": "Play",
        "pause": "Pause",
        "mute": "Mute",
        "unmute": "Unmute",
        "fullscreen": "Fullscreen",
        "exitFullscreen": "Exit Fullscreen",
        "loading": "Loading video...",
        "error": "Error loading video",
        "volume": "Volume",
        "playbackSpeed": "Playback Speed",
        "currentTime": "{current} / {total}"
      },
      "photo": {
        "zoom": "Zoom",
        "zoomIn": "Zoom In",
        "zoomOut": "Zoom Out",
        "resetZoom": "Reset Zoom",
        "fitToScreen": "Fit to Screen",
        "actualSize": "Actual Size",
        "loading": "Loading image...",
        "error": "Error loading image"
      },
      "pdf": {
        "page": "Page {current} of {total}",
        "previousPage": "Previous Page",
        "nextPage": "Next Page",
        "firstPage": "First Page",
        "lastPage": "Last Page",
        "goToPage": "Go to Page",
        "download": "Download PDF",
        "print": "Print",
        "loading": "Loading PDF...",
        "error": "Error loading PDF",
        "zoomIn": "Zoom In",
        "zoomOut": "Zoom Out"
      },
      "instructions": {
        "title": "Instructions",
        "noContent": "No instructions available",
        "readMore": "Read More",
        "collapse": "Show Less"
      }
    },
    "purposes": {
      "howToUse": "How to Use",
      "howToClean": "How to Clean",
      "troubleshooting": "Troubleshooting",
      "safetyInfo": "Safety Information",
      "maintenance": "Maintenance",
      "features": "Features & Tips",
      "warranty": "Warranty & Support",
      "setup": "Setup & Installation",
      "storage": "Storage Instructions",
      "disposal": "Disposal & Recycling",
      "other": "Other",
      "unknown": "Unknown Purpose"
    },
    "status": {
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived",
      "scheduled": "Scheduled",
      "underReview": "Under Review",
      "pendingApproval": "Pending Approval"
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
      "saveDraft": "Save Draft",
      "cancel": "Cancel",
      "discard": "Discard Changes",
      "preview": "Preview",
      "view": "View",
      "print": "Print",
      "share": "Share",
      "copyLink": "Copy Link",
      "download": "Download",
      "addContent": "Add Content",
      "removeContent": "Remove Content"
    },
    "empty": {
      "title": "No guides yet",
      "description": "Create items and add guide articles to get started. Guides help guests understand how to use items in your property.",
      "noResults": "No guides match your filters",
      "noResultsDescription": "Try adjusting your search or filters",
      "createFirst": "Create Your First Item",
      "learnMore": "Learn More",
      "noContent": "No content added yet",
      "noContentDescription": "Add photos, videos, or written instructions to this guide"
    },
    "loading": {
      "guides": "Loading guides...",
      "guide": "Loading guide...",
      "content": "Loading content...",
      "saving": "Saving...",
      "publishing": "Publishing...",
      "deleting": "Deleting...",
      "uploading": "Uploading...",
      "processing": "Processing...",
      "generating": "Generating preview..."
    },
    "validation": {
      "titleRequired": "Guide title is required",
      "titleTooLong": "Title must be less than 200 characters",
      "contentRequired": "Content is required",
      "contentTooLong": "Content exceeds maximum length of {max} characters",
      "invalidPurpose": "Please select a valid purpose",
      "invalidItem": "Please select a valid item",
      "duplicateTitle": "A guide with this title already exists"
    },
    "errors": {
      "loadFailed": "Failed to load guide",
      "saveFailed": "Failed to save guide",
      "deleteFailed": "Failed to delete guide",
      "publishFailed": "Failed to publish guide",
      "uploadFailed": "Failed to upload file",
      "notFound": "Guide not found",
      "unauthorized": "You are not authorized to edit this guide",
      "networkError": "Network error. Please check your connection and try again."
    },
    "success": {
      "saved": "Guide saved successfully",
      "updated": "Guide updated successfully",
      "deleted": "Guide deleted successfully",
      "published": "Guide published successfully",
      "unpublished": "Guide unpublished successfully",
      "duplicated": "Guide duplicated successfully",
      "archived": "Guide archived successfully",
      "restored": "Guide restored successfully",
      "copied": "Link copied to clipboard"
    },
    "auth": {
      "required": "Authentication Required",
      "loginPrompt": "Please log in to access guides.",
      "goToLogin": "Go to Login",
      "permissionDenied": "You don't have permission to view this guide",
      "sessionExpired": "Your session has expired. Please log in again."
    }
  }
}
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 18 |
| Total Story Points | ~2 SP |
| Priority Distribution | Critical: 2, High: 12, Medium: 4 |
| Estimated Strings | ~300 |
| Files Modified | 1 (`/messages/en.json`) |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| JSON syntax errors | Validate after each task with `python -m json.tool` |
| Missing strings discovered later | Namespace structure allows easy extension |
| Key naming inconsistency | Follow camelCase and established patterns |
| Overlap with items namespace | Articles focuses on guides/content; items focuses on QR items |

---

## References

- [Overview Document](/docs/REQ-E02-070-create-articles-namespace-structure-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Requirements](/docs/gen_requests_epic2.md#REQ-E02-070)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
*Task ID: 2E.1 - Create Articles Namespace Structure*
