# REQ-E02-072: Update Media Handling Components for Article Editor - Implementation Overview

**Document Created:** 2026-01-20 17:45:00 UTC
**Last Modified:** 2026-01-20 17:45:00 UTC
**Request ID:** REQ-E02-072
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.3
**Size:** M (Medium)
**Priority:** P1 - High

---

## 1. Executive Summary

This task involves updating all media handling components to replace hardcoded English strings with the next-intl translation system. The media handling components include FileUploadStep, MediaEditorStep, MediaThumbnail, MediaGallery, and the MediaManagement component family (MediaManagementSection, AddMediaLinkForm, MediaLinkItem, MediaLinkList, DeleteMediaConfirmDialog). This enables users to upload, manage, and display media with fully localized interface elements including drag-and-drop zones, file type restrictions, upload progress, preview controls, error messages, and accessibility labels.

---

## 2. Current State Analysis

### 2.1 Components Requiring Localization

| Component | Location | Estimated Strings | Complexity |
|-----------|----------|-------------------|------------|
| **FileUploadStep** | `/src/components/ItemCapture/components/steps/FileUploadStep.tsx` | ~35 | Medium |
| **MediaEditorStep** | `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | ~25 | Medium |
| **MediaThumbnail** | `/src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | ~8 | Low |
| **MediaGallery** | `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | ~30 | Medium |
| **MediaManagementSection** | `/src/components/MediaManagement/MediaManagementSection.tsx` | ~10 | Low |
| **AddMediaLinkForm** | `/src/components/MediaManagement/AddMediaLinkForm.tsx` | ~18 | Low |
| **MediaLinkItem** | `/src/components/MediaManagement/MediaLinkItem.tsx` | ~15 | Low |
| **DeleteMediaConfirmDialog** | `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | ~12 | Low |
| **Total** | | **~153** | |

### 2.2 Hardcoded Strings Identified

#### FileUploadStep.tsx (Line References)
- Line 186: `"{pageCount} {pageCount === 1 ? 'page' : 'pages'}"` - PDF page count
- Line 198: `"Password protected"` - PDF warning
- Line 201: `"File may be damaged"` - Corrupt PDF warning
- Line 217: `"Remove {file.name}"` - Remove button aria-label
- Line 349: `"{rejectedFiles.length} file{s} couldn't be added"` - Rejection count
- Line 356: `"Dismiss"` - Dismiss button
- Line 391: `"{fileCount}/{maxFiles} files"` - File count
- Line 392: `"{formatFileSize(totalSize)} / {formatFileSize(maxTotalSize)}"` - Size progress
- Line 409: `"Upload size progress"` - Progress aria-label
- Line 596: `"Upload Files"` - Header
- Line 598: `"Drag and drop files or click to select"` - Subtitle
- Line 656: `"Drop files here"` - Drag valid text
- Line 658: `"Invalid file type"` - Drag invalid text
- Line 663: `"Add more files"` - Add more text
- Line 668: `"Drag files here or click to browse"` - Default text
- Line 671: `"Supports images, videos, and PDF files"` - Format hint
- Line 674: `"Max {maxFiles} files, {formatFileSize(maxFileSize)} each"` - Limits
- Line 707: `"{files.length} files uploaded"` - Screen reader announcement
- Line 718: `"Back"` - Back button
- Line 730: `"Continue"` - Continue button

#### MediaEditorStep.tsx (Line References)
- Line 79: `"Loading editor"` - Loading aria-label
- Line 294: `"Trim"`, `"Crop"`, `"Rotation"`, `"Edit"` - Edit type labels
- Line 384: `"Editing {type} {index} of {total}"` - Progress text
- Line 389: `"Step: {phase}"` - Image phase text (`"Crop"`, `"Rotate"`)
- Line 405: `"Unable to process edit"` - Error title
- Line 412: `"Dismiss"` - Dismiss link
- Line 416: `"Skip this item"` - Skip link
- Line 441: `"Cancel"` - Cancel button
- Line 455: `"Skip {editType}"` - Skip button
- Line 468: `"Apply {editType}"` - Apply button
- Line 475: `"Now editing {type} {index} of {total}"` - Screen reader announcement

#### MediaThumbnail.tsx (Line References)
- Line 141: `"{pageCount} {pageCount === 1 ? 'page' : 'pages'}"` - PDF page count
- Line 174: `"Delete media"` - Delete button aria-label

#### MediaGallery.tsx (Line References)
- Lines 81-94: `MEDIA_TYPE_CONFIG` labels (`"Video"`, `"Photo"`, `"PDF"`)
- Line 181: `"View {type} {filename}"` - Thumbnail aria-label
- Line 682-683: `"{pageCount} {pageCount === 1 ? 'page' : 'pages'}"` - PDF page count
- Lines 696-703: `"Video"`, `"Image"` - Fallback labels
- Line 751: `"No media to display"` - Empty state
- Line 783: `"Exit full screen"` - Button aria-label
- Line 812-829: `"Previous media"`, `"Next media"` - Navigation aria-labels
- Line 844: `"Media thumbnails"` - Thumbnails aria-label
- Line 880: `"Media gallery, {count} items"` - Gallery aria-label
- Line 908: `"Enter full screen"` - Button aria-label
- Lines 939-958: `"Previous media"`, `"Next media"` - Navigation aria-labels
- Line 987: `"Media thumbnails"` - Thumbnails aria-label

#### MediaManagementSection.tsx (Line References)
- Line 135: `"Media & Links"` - Section header
- Line 142: `"Add Link"` - Add button
- Line 151: `"No media links yet"` - Empty state
- Line 157: `"Add your first link"` - Empty state action

#### AddMediaLinkForm.tsx (Line References)
- Line 76: `"Please enter a valid URL"` - URL validation error
- Line 131: `"Title"` - Field label (with required marker)
- Line 139: `"e.g., Product Manual"` - Title placeholder
- Line 147: `"URL"` - Field label (with required marker)
- Line 158: `"https://..."` - URL placeholder
- Line 169: `"Type"` - Field label
- Line 183: `"Type is auto-detected from URL but can be changed"` - Helper text
- Line 191: `"Thumbnail URL (optional)"` - Field label
- Line 200: `"https://..."` - Thumbnail placeholder
- Line 209: `"+ Add custom thumbnail"` - Toggle link
- Line 221: `"Cancel"` - Cancel button
- Line 231: `"Add Link"` - Submit button

#### MediaLinkItem.tsx (Line References)
- Line 163: `"Drag to reorder"` - Drag handle aria-label
- Line 185: `"Edit link"` - Edit button aria-label
- Line 193: `"Delete link"` - Delete button aria-label
- Line 208: `"Title"` - Field label
- Line 214: `"Enter title"` - Placeholder
- Line 220: `"URL"` - Field label
- Line 226: `"https://..."` - Placeholder
- Line 232: `"Type"` - Field label
- Line 251: `"Cancel"` - Cancel button
- Line 261: `"Save"` - Save button

#### DeleteMediaConfirmDialog.tsx (Line References)
- Lines 44-55: `getTypeLabel()` function returns `"YouTube Video"`, `"PDF Document"`, `"Image"`, `"Web Link"`
- Line 104: `"Delete {typeLabel}?"` - Dialog title
- Line 122: `"This action cannot be undone."` - Warning message
- Line 136: `"Cancel"` - Cancel button
- Line 153: `"Delete"` - Delete button

---

## 3. Implementation Approach

### 3.1 Translation Namespace Structure

All media handling strings will be added to the `articles` namespace within the existing `/messages/en.json` structure, extending the `articles.media` section:

```json
{
  "articles": {
    "media": {
      "upload": {
        "title": "Upload Files",
        "subtitle": "Drag and drop files or click to select",
        "dropHere": "Drop files here",
        "invalidType": "Invalid file type",
        "addMore": "Add more files",
        "dragOrClick": "Drag files here or click to browse",
        "supportedFormats": "Supports images, videos, and PDF files",
        "limits": "Max {maxFiles} files, {maxSize} each",
        "filesUploaded": "{count, plural, one {# file uploaded} other {# files uploaded}}",
        "fileCount": "{current}/{max} files",
        "sizeProgress": "Upload size progress",
        "back": "Back",
        "continue": "Continue"
      },
      "rejection": {
        "count": "{count, plural, one {# file couldn't be added} other {# files couldn't be added}}",
        "dismiss": "Dismiss"
      },
      "pdf": {
        "pageCount": "{count, plural, one {# page} other {# pages}}",
        "passwordProtected": "Password protected",
        "corrupted": "File may be damaged"
      },
      "removeFile": "Remove {name}",
      "editor": {
        "loadingEditor": "Loading editor",
        "editTypes": {
          "trim": "Trim",
          "crop": "Crop",
          "rotation": "Rotation",
          "edit": "Edit"
        },
        "progress": "Editing {type} {current} of {total}",
        "phase": "Step: {phase}",
        "phases": {
          "crop": "Crop",
          "rotate": "Rotate"
        },
        "error": {
          "title": "Unable to process edit",
          "dismiss": "Dismiss",
          "skipItem": "Skip this item"
        },
        "actions": {
          "cancel": "Cancel",
          "skip": "Skip {type}",
          "apply": "Apply {type}"
        },
        "announcement": "Now editing {type} {current} of {total}"
      },
      "thumbnail": {
        "deletMedia": "Delete media"
      },
      "gallery": {
        "types": {
          "video": "Video",
          "photo": "Photo",
          "pdf": "PDF",
          "image": "Image"
        },
        "viewItem": "View {type} {filename}",
        "noMedia": "No media to display",
        "fullScreen": {
          "enter": "Enter full screen",
          "exit": "Exit full screen"
        },
        "navigation": {
          "previous": "Previous media",
          "next": "Next media"
        },
        "thumbnails": "Media thumbnails",
        "ariaLabel": "Media gallery, {count, plural, one {# item} other {# items}}"
      },
      "links": {
        "sectionTitle": "Media & Links",
        "addLink": "Add Link",
        "emptyState": {
          "title": "No media links yet",
          "action": "Add your first link"
        },
        "form": {
          "titleLabel": "Title",
          "titlePlaceholder": "e.g., Product Manual",
          "urlLabel": "URL",
          "urlPlaceholder": "https://...",
          "urlInvalid": "Please enter a valid URL",
          "typeLabel": "Type",
          "typeHelp": "Type is auto-detected from URL but can be changed",
          "thumbnailLabel": "Thumbnail URL (optional)",
          "addThumbnail": "+ Add custom thumbnail",
          "cancel": "Cancel",
          "addLink": "Add Link"
        },
        "item": {
          "dragToReorder": "Drag to reorder",
          "editLink": "Edit link",
          "deleteLink": "Delete link",
          "enterTitle": "Enter title",
          "save": "Save"
        },
        "deleteDialog": {
          "title": "Delete {type}?",
          "types": {
            "youtube": "YouTube Video",
            "pdf": "PDF Document",
            "image": "Image",
            "text": "Web Link"
          },
          "warning": "This action cannot be undone.",
          "cancel": "Cancel",
          "delete": "Delete"
        }
      }
    }
  }
}
```

### 3.2 Component Update Pattern

Each component will be updated following this pattern:

```tsx
// Before (hardcoded string)
<p className="text-gray-600">No media links yet</p>
<button>Add your first link</button>

// After (translated)
import { useTranslations } from 'next-intl';

function MediaManagementSection() {
  const t = useTranslations('articles.media.links');

  return (
    <>
      <p className="text-gray-600">{t('emptyState.title')}</p>
      <button>{t('emptyState.action')}</button>
    </>
  );
}
```

### 3.3 Implementation Order

1. **Add translation keys to `/messages/en.json`** - Add all keys under the `articles.media` namespace
2. **Update FileUploadStep** - Largest component with drag-drop UI and file states
3. **Update MediaEditorStep** - Edit phase labels and progress indicators
4. **Update MediaThumbnail** - Small component with accessibility labels
5. **Update MediaGallery** - Gallery navigation and type labels
6. **Update MediaManagementSection** - Section header and empty state
7. **Update AddMediaLinkForm** - Form labels and validation messages
8. **Update MediaLinkItem** - Edit form and action labels
9. **Update DeleteMediaConfirmDialog** - Confirmation dialog strings
10. **Generate translations for 5 non-English languages**

---

## 4. Authorized Files and Functions for Modification

### 4.1 Translation Files

| File | Modification Type | Description |
|------|-------------------|-------------|
| `/messages/en.json` | MODIFY | Add `articles.media` namespace with all upload, editor, gallery, and links subnamespaces |
| `/messages/fr.json` | MODIFY | Add French translations for all new keys |
| `/messages/es.json` | MODIFY | Add Spanish translations for all new keys |
| `/messages/de.json` | MODIFY | Add German translations for all new keys |
| `/messages/nl.json` | MODIFY | Add Dutch translations for all new keys |
| `/messages/it.json` | MODIFY | Add Italian translations for all new keys |

### 4.2 Component Files

| File | Functions/Sections to Modify |
|------|------------------------------|
| `/src/components/ItemCapture/components/steps/FileUploadStep.tsx` | `PDFFileCard` (line 135-222), `ErrorDisplay` (line 310-372), `UploadProgress` (line 384-416), `FileUploadStep` main render (line 591-736) |
| `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | `EditorLoadingPlaceholder` (line 74-87), `getEditTypeLabel` (line 293-298), main render sections (line 380-477) |
| `/src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | PDF page count display (line 140-141), delete button aria-label (line 174) |
| `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | `MEDIA_TYPE_CONFIG` (line 76-95), `GalleryThumbnail` (line 146-228), `renderMediaItem` (line 548-737), empty state (line 742-754), navigation buttons, aria-labels throughout |
| `/src/components/MediaManagement/MediaManagementSection.tsx` | Section header (line 135), add button (line 140-143), empty state (line 148-159) |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | URL validation error (line 76), all form labels (lines 129-234), submit button |
| `/src/components/MediaManagement/MediaLinkItem.tsx` | Drag handle aria-label (line 163), action button labels (lines 185, 193), edit form labels (lines 208, 220, 232), save/cancel buttons |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | `getTypeLabel` function (line 44-55), dialog title (line 104), warning (line 122), buttons (lines 136, 153) |

### 4.3 Functions Requiring Modification (Detailed)

#### FileUploadStep.tsx
- `PDFFileCard` (lines 135-222): Add translations for page count display with pluralization, password protected warning, corrupt file warning, remove button aria-label
- `ErrorDisplay` (lines 310-372): Add translations for rejection count with pluralization, dismiss button
- `UploadProgress` (lines 384-416): Add translations for file count, size text, progress aria-label
- `FileUploadStep` main render (lines 591-736): Add translations for header, subtitle, drag states, format hints, limits, screen reader announcements, navigation buttons

#### MediaEditorStep.tsx
- `EditorLoadingPlaceholder` (lines 74-87): Add translation for loading aria-label
- `getEditTypeLabel` (lines 293-298): Convert to use translations for edit type names
- Main render (lines 380-477): Add translations for progress text, phase indicators, error messages, action buttons, screen reader announcements

#### MediaThumbnail.tsx
- PDF section (lines 136-144): Add translation for page count with pluralization
- Delete button (lines 159-177): Add translation for delete button aria-label

#### MediaGallery.tsx
- `MEDIA_TYPE_CONFIG` (lines 76-95): Convert labels to use translations
- `GalleryThumbnail` (lines 146-228): Add translation for view item aria-label with interpolation
- `renderMediaItem` (lines 548-737): Add translations for fallback type labels, page count displays
- Empty state (lines 742-754): Add translation for empty message
- Navigation buttons: Add translations for all aria-labels
- Gallery container: Add translation for gallery aria-label with item count

#### MediaManagementSection.tsx
- Header section (line 135): Add translation for section title
- Add button (lines 140-143): Add translation for button text
- Empty state (lines 148-159): Add translations for empty title and action

#### AddMediaLinkForm.tsx
- URL validation (lines 69-80): Add translation for validation error message
- Form fields (lines 129-213): Add translations for all labels, placeholders, helper text
- Action buttons (lines 217-234): Add translations for cancel and submit buttons

#### MediaLinkItem.tsx
- View mode (lines 149-199): Add translations for drag handle aria-label, edit/delete button aria-labels
- Edit mode (lines 203-265): Add translations for field labels, placeholders, action buttons

#### DeleteMediaConfirmDialog.tsx
- `getTypeLabel` (lines 44-55): Convert to use translations for type names
- Dialog content (lines 99-157): Add translations for title with interpolation, warning message, action buttons

---

## 5. Dependencies

### 5.1 Epic 1 Dependencies (Must Be Complete)

| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package installed | `package.json` | Required |
| IntlProvider configured | `/src/app/layout.tsx` | Required |
| Translation files exist | `/messages/*.json` | Required |
| `useTranslations` hook available | `next-intl` | Required |

### 5.2 Cross-Task Dependencies

| Dependency | Task | Description |
|------------|------|-------------|
| Common namespace exists | 2H.1 | May reuse `common.cancel`, `common.save`, `common.delete` etc. |
| Error namespace exists | 2J.1 | May reuse `errors.uploadFailed`, `errors.invalidFormat` |
| Articles namespace structure | 2E.1 | The `articles` namespace should be created first |

### 5.3 Related Components

| Component | Task | Relationship |
|-----------|------|--------------|
| ImageCropper | 2E.2 (REQ-E02-071) | Shares editing UI patterns |
| ImageRotator | 2E.2 (REQ-E02-071) | Shares editing UI patterns |
| VideoTrimmer | 2E.2 (REQ-E02-071) | Shares editing UI patterns |

---

## 6. Testing Requirements

### 6.1 Unit Tests

- Verify all hardcoded strings are replaced with translation function calls
- Test that translation keys exist and return expected values
- Test pluralization for page counts and file counts
- Test interpolation variables are correctly passed (e.g., `{count}`, `{type}`, `{name}`)

### 6.2 Integration Tests

- Test file upload workflow in all 6 languages
- Verify drag-and-drop messages display correctly
- Test media editor flow with translated phase labels
- Test media gallery navigation and accessibility labels
- Test media link management in all languages

### 6.3 Visual Testing

- Check text truncation in buttons and labels for longer translations (especially German)
- Verify layout integrity with text expansion
- Test mobile responsiveness with translated strings
- Verify drag-and-drop zones display correctly with translated content

### 6.4 Accessibility Testing

- Verify screen reader announcements are properly translated
- Test keyboard navigation with translated aria-labels
- Confirm all interactive elements have translated accessible names
- Test focus management during modal dialogs with translated content

---

## 7. Acceptance Criteria (From Request)

- [ ] Media upload button labels and instructions are replaced with translation hooks from the articles namespace
- [ ] Drag-and-drop zone displays translated messages (drag files here, drop to upload, supported formats)
- [ ] File type restriction messages show in the selected language (accepted formats: JPG, PNG, MP4, etc.)
- [ ] File size limit messages are translated and use appropriate formatting for the locale
- [ ] Upload progress indicators display translated status text (uploading, processing, complete)
- [ ] Media preview components show translated controls (zoom, rotate, remove, replace, edit)
- [ ] Image alt text field labels and placeholders are fully translated
- [ ] Caption and description field labels appear in the correct language
- [ ] Media library browser interface (if applicable) uses localized column headers and filters
- [ ] Error messages for failed uploads display in the selected language with clear troubleshooting guidance
- [ ] Error messages for invalid file types or sizes are translated and user-friendly
- [ ] Network error messages during upload are localized appropriately
- [ ] Loading state messages during media processing appear in the correct language
- [ ] Success confirmation messages after successful uploads are translated
- [ ] Media deletion confirmation dialogs use localized text (Are you sure you want to delete this image?)
- [ ] Tooltips on media control buttons (crop, resize, optimize) are fully translated
- [ ] ARIA labels and accessibility attributes for media components use translated strings
- [ ] Empty state messages in media library or upload area are localized
- [ ] Keyboard shortcut hints for media controls (if displayed) are translated appropriately
- [ ] No hardcoded English strings appear in any media handling component
- [ ] Translation keys follow established naming conventions in the articles namespace
- [ ] Media components properly handle language switching without breaking upload state or requiring page reload

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Text overflow in drag-drop zones | Medium | Low | Test with German, ensure text wraps appropriately |
| Missing translation keys at runtime | Low | High | Build-time validation, console warnings in dev |
| Pluralization complexity | Medium | Low | Use ICU format with `{count, plural, one {...} other {...}}` |
| Upload state lost on language switch | Low | High | Ensure translations don't trigger component remounts |
| Screen reader announcement issues | Low | Medium | Manual testing with VoiceOver/NVDA |
| File size formatting differences | Medium | Low | Use localized number formatting via Intl API |

---

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 1 hour |
| Update FileUploadStep | 1.5 hours |
| Update MediaEditorStep | 1 hour |
| Update MediaThumbnail | 30 minutes |
| Update MediaGallery | 1.5 hours |
| Update MediaManagementSection | 30 minutes |
| Update AddMediaLinkForm | 45 minutes |
| Update MediaLinkItem | 45 minutes |
| Update DeleteMediaConfirmDialog | 30 minutes |
| Generate 5 language translations | 1-2 hours |
| Testing and verification | 1.5 hours |
| **Total** | **~10-12 hours** |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Request REQ-E02-071](/docs/REQ-E02-071-update-editor-components-overview.md) - Editor components (related task)
- [Request REQ-E02-070](/docs/gen_requests_epic2.md) - Articles namespace structure (prerequisite)
