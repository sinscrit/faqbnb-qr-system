# REQ-E02-071: Update Editor Components for Article Management - Implementation Overview

**Document Created:** 2026-01-20 17:30:00 UTC
**Last Modified:** 2026-01-20 17:30:00 UTC
**Request ID:** REQ-E02-071
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.2
**Size:** L (Large)
**Priority:** P1 - High

---

## 1. Executive Summary

This task involves updating all article editor components to replace hardcoded English strings with the next-intl translation system. The editor components include the main InstructionEditor, MarkdownEditor with formatting toolbar, ImageCropper, ImageRotator, VideoTrimmer, TagsEditor, and all supporting modal/section components. This enables content creators to manage articles in their preferred language with a fully localized editing experience.

---

## 2. Current State Analysis

### 2.1 Components Requiring Localization

| Component | Location | Estimated Strings | Complexity |
|-----------|----------|-------------------|------------|
| **MarkdownEditor** | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | ~25 | Medium |
| **ImageCropper** | `/src/components/ItemCapture/editors/ImageCropper.tsx` | ~20 | Medium |
| **ImageRotator** | `/src/components/ItemCapture/editors/ImageRotator.tsx` | ~18 | Medium |
| **VideoTrimmer** | `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | ~22 | Medium |
| **InstructionEditor** | `/src/components/InstructionEditor/InstructionEditor.tsx` | ~15 | Low |
| **AddContentModal** | `/src/components/InstructionEditor/components/AddContentModal.tsx` | ~25 | Medium |
| **ContentEditSection** | `/src/components/InstructionEditor/components/ContentEditSection.tsx` | ~12 | Low |
| **ReadOnlyContextSection** | `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | ~8 | Low |
| **TagsEditor** | `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | ~8 | Low |
| **Total** | | **~153** | |

### 2.2 Hardcoded Strings Identified

#### MarkdownEditor.tsx (Line References)
- Line 89: `"{current.toLocaleString()} / {max.toLocaleString()} characters"` - Character counter
- Line 146: `"Editor"` - Tab label
- Line 164: `"Preview"` - Tab label
- Lines 181-188: Toolbar aria-labels (`"Bold (Ctrl+B)"`, `"Italic (Ctrl+I)"`, etc.)
- Line 205: `"Text formatting"` - Toolbar aria-label
- Line 239: `"Write your content here using markdown formatting..."` - Default placeholder
- Line 243: `"Markdown editor"` - Default aria-label
- Lines 396-398: `"Content exceeds the maximum character limit. Please shorten your text."` - Error message
- Line 416: `"Preview"` - Preview header label
- Line 438: `"Start typing to see a preview of your formatted content..."` - Empty preview message

#### ImageCropper.tsx (Line References)
- Lines 80-85: Aspect ratio labels (`"Free"`, `"1:1"`, `"4:3"`, `"16:9"`)
- Line 166: `"Failed to load image. Please try again."` - Error message
- Line 366-368: `"Large image detected. Output may be scaled down for compatibility."` - Warning
- Line 400: `"Loading image..."` - Loading state
- Line 410: `"Applying crop..."` - Processing state
- Line 432: `"Crop preview"` - Alt text
- Line 442: `"Preview:"` - Label
- Lines 451-453: `"Generating..."` / `"Select area to preview"` - Preview messages
- Line 486: `"Apply Crop"` / `"Applying..."` - Button label
- Line 498: `"Cancel"` - Button label
- Line 466: `"Dismiss error"` - Aria-label

#### ImageRotator.tsx (Line References)
- Line 329: `"Image rotated to {currentRotation} degrees"` - Screen reader announcement
- Line 355: `"Processing rotation..."` - Processing announcement
- Line 371: `"Loading image..."` - Loading state
- Line 381: `"Applying rotation..."` - Processing state
- Line 433: `"Rotate image left 90 degrees"` - Aria-label
- Line 447: `"Rotate image right 90 degrees"` - Aria-label
- Line 463-466: `"Current rotation: {rotation}°"` / `"(modified)"` - Status text
- Lines 471-479: Keyboard shortcut help text
- Line 496: `"Apply Rotation"` / `"Applying..."` - Button label
- Line 510: `"Cancel"` - Button label
- Line 421: `"Try Again"` - Retry button

#### VideoTrimmer.tsx (Line References)
- Line 196: `"Failed to load video. Please check the file and try again."` - Error message
- Line 229: `"Unable to play video. Please try again."` - Playback error
- Line 507: `"Error"` - Error heading
- Line 517-519: `"Try again"` - Retry button
- Line 543: `"Loading video..."` - Loading state
- Line 601: `"Start trim point"` - Aria-label
- Line 635: `"End trim point"` - Aria-label
- Line 664-671: Duration display labels (`"Selection:"`, `"Duration:"`)
- Line 676: `"Current:"` - Current time label
- Line 682-683: Trim reduction message
- Lines 700-731: Playback control aria-labels (`"Skip to start marker"`, `"Pause"`, `"Play trimmed region"`, `"Skip to end marker"`)
- Line 750: `"Cancel"` - Button label
- Line 766: `"Apply Trim"` - Button label

#### InstructionEditor.tsx (Line References)
- Line 150: `"You have unsaved changes. Are you sure you want to cancel?"` - Confirmation dialog
- Line 176: `"Article Title"` - Label
- Line 197: `"Enter article title"` - Placeholder
- Line 204: `"Tags"` - Label
- Line 241: `"Cancel"` - Button label
- Line 258: `"Saving..."` / `"Save Changes"` - Button label

#### AddContentModal.tsx (Line References)
- Line 148: `"Add Content"` / `"Create Content"` - Modal title
- Line 171: `"Write Text"` - Type label
- Line 180: `"Add Link"` - Type label
- Lines 190-192: `"Upload File"` / `"Video, Image, PDF"` - Type label and description
- Lines 200-208: Form labels (`"Title (Optional)"`, `"Enter a title for this content"`)
- Line 214: `"Text Content *"` - Label
- Line 221: `"Enter your text content here..."` - Placeholder
- Line 225: `"{count} / 5000 characters"` - Character counter
- Lines 235-257: URL form labels and placeholders
- Lines 267-279: File upload labels and selected file info
- Line 295: `"Back"` - Button label
- Line 303: `"Cancel"` - Button label
- Line 317: `"Add Content"` - Submit button

#### ContentEditSection.tsx (Line References)
- Line 156-159: Drag announcements (`"Picked up {type} content..."`)
- Line 165: `"Over position {position}"` - Drag announcement
- Lines 169-175: Drag end announcements
- Line 178: `"Drag cancelled. Content returned to original position."` - Announcement
- Lines 212-214: `"Content"` / `"({count} piece{s})"` - Section header
- Line 237: `"Content pieces - drag to reorder"` - Aria-label
- Line 269: `"Add Content"` - Button label
- Lines 285-300: Removal confirmation dialog strings

#### ReadOnlyContextSection.tsx (Line References)
- Line 33: `"Editing Guide For: {title}"` - Page header
- Lines 41-42: `"Room"` - Field label
- Lines 49-50: `"Item Type"` - Field label
- Lines 57-58: `"Item Name"` - Field label
- Lines 14-17: Default item type values (`"Appliance"`, `"Room Item"`, `"General Info"`)

#### TagsEditor.tsx (Line References)
- Line 84: `"Remove {label} tag"` - Aria-label
- Line 167: `"{count} / {max}"` - Tag count display
- Line 185: `"Add tag"` - Button aria-label
- Line 188: `"Add Tag"` - Button label
- Line 209: `"Available tags"` - Dropdown aria-label

---

## 3. Implementation Approach

### 3.1 Translation Namespace Structure

All editor strings will be added to the `articles` namespace within the existing `/messages/en.json` structure:

```json
{
  "articles": {
    "editor": {
      "title": "Article Title",
      "titlePlaceholder": "Enter article title",
      "tagsLabel": "Tags",
      "pageHeader": "Editing Guide For: {title}",
      "savingChanges": "Saving...",
      "saveChanges": "Save Changes",
      "unsavedChangesConfirm": "You have unsaved changes. Are you sure you want to cancel?"
    },
    "markdown": {
      "tabs": {
        "editor": "Editor",
        "preview": "Preview"
      },
      "toolbar": {
        "ariaLabel": "Text formatting",
        "bold": "Bold (Ctrl+B)",
        "italic": "Italic (Ctrl+I)",
        "heading1": "Heading 1",
        "heading2": "Heading 2",
        "heading3": "Heading 3",
        "bulletList": "Bullet List",
        "numberedList": "Numbered List",
        "link": "Insert Link (Ctrl+K)"
      },
      "placeholder": "Write your content here using markdown formatting...",
      "ariaLabel": "Markdown editor",
      "characterCount": "{current} / {max} characters",
      "characterLimitExceeded": "Content exceeds the maximum character limit. Please shorten your text.",
      "previewEmpty": "Start typing to see a preview of your formatted content..."
    },
    "imageCropper": {
      "aspectRatios": {
        "free": "Free",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Loading image...",
      "processing": "Applying crop...",
      "preview": "Preview:",
      "previewGenerating": "Generating...",
      "previewSelect": "Select area to preview",
      "applyCrop": "Apply Crop",
      "applying": "Applying...",
      "cancel": "Cancel",
      "dismissError": "Dismiss error",
      "loadFailed": "Failed to load image. Please try again.",
      "largeImageWarning": "Large image detected. Output may be scaled down for compatibility.",
      "cropPreviewAlt": "Crop preview"
    },
    "imageRotator": {
      "ariaLabel": "Image rotation editor",
      "loading": "Loading image...",
      "processing": "Applying rotation...",
      "rotateLeft": "Rotate image left 90 degrees",
      "rotateRight": "Rotate image right 90 degrees",
      "currentRotation": "Current rotation: {degrees}°",
      "modified": "(modified)",
      "applyRotation": "Apply Rotation",
      "applying": "Applying...",
      "cancel": "Cancel",
      "tryAgain": "Try Again",
      "rotationAnnouncement": "Image rotated to {degrees} degrees",
      "processingAnnouncement": "Processing rotation...",
      "keyboardHelp": {
        "label": "Keyboard:",
        "arrows": "to rotate,",
        "escape": "to cancel,",
        "apply": "to apply"
      }
    },
    "videoTrimmer": {
      "loading": "Loading video...",
      "error": "Error",
      "tryAgain": "Try again",
      "loadFailed": "Failed to load video. Please check the file and try again.",
      "playbackFailed": "Unable to play video. Please try again.",
      "selection": "Selection:",
      "duration": "Duration:",
      "current": "Current:",
      "trimming": "Trimming {time} ({percent}% reduction)",
      "startMarker": "Start trim point",
      "endMarker": "End trim point",
      "skipToStart": "Skip to start marker",
      "skipToEnd": "Skip to end marker",
      "play": "Play trimmed region",
      "pause": "Pause",
      "applyTrim": "Apply Trim",
      "cancel": "Cancel"
    },
    "addContent": {
      "modalTitle": "Add Content",
      "createTitle": "Create Content",
      "types": {
        "text": "Write Text",
        "link": "Add Link",
        "file": "Upload File",
        "fileDescription": "Video, Image, PDF"
      },
      "textForm": {
        "titleLabel": "Title (Optional)",
        "titlePlaceholder": "Enter a title for this content",
        "contentLabel": "Text Content *",
        "contentPlaceholder": "Enter your text content here...",
        "characterCount": "{count} / {max} characters"
      },
      "urlForm": {
        "urlLabel": "URL *",
        "urlPlaceholder": "https://example.com",
        "titleLabel": "Link Title (Optional)",
        "titlePlaceholder": "Enter a title for this link"
      },
      "fileForm": {
        "label": "Select File *",
        "selected": "Selected: {name} ({size} MB)"
      },
      "actions": {
        "back": "Back",
        "cancel": "Cancel",
        "addContent": "Add Content"
      }
    },
    "contentSection": {
      "title": "Content",
      "pieceCount": "({count} {count, plural, one {piece} other {pieces}})",
      "dragToReorder": "Content pieces - drag to reorder",
      "addContent": "Add Content",
      "removeConfirmTitle": "Remove Last Content?",
      "removeConfirmMessage": "This is the only piece of content. Removing it will leave this guide empty. Are you sure you want to remove it?",
      "remove": "Remove",
      "cancel": "Cancel",
      "announcements": {
        "pickedUp": "Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move.",
        "over": "Over position {position}",
        "dropped": "Dropped {type} content. New position: {position} of {total}",
        "unchanged": "Position unchanged.",
        "cancelled": "Drag cancelled. Content returned to original position."
      }
    },
    "context": {
      "room": "Room",
      "itemType": "Item Type",
      "itemName": "Item Name",
      "itemTypes": {
        "appliance": "Appliance",
        "roomItem": "Room Item",
        "generalInfo": "General Info"
      }
    },
    "tags": {
      "removeTag": "Remove {label} tag",
      "addTag": "Add Tag",
      "addTagAria": "Add tag",
      "availableTags": "Available tags",
      "count": "{current} / {max}"
    }
  }
}
```

### 3.2 Component Update Pattern

Each component will be updated following this pattern:

```tsx
// Before (hardcoded string)
<button aria-label="Bold (Ctrl+B)">
  <Bold />
</button>

// After (translated)
import { useTranslations } from 'next-intl';

function MarkdownToolbar() {
  const t = useTranslations('articles.markdown.toolbar');

  return (
    <button aria-label={t('bold')}>
      <Bold />
    </button>
  );
}
```

### 3.3 Implementation Order

1. **Add translation keys to `/messages/en.json`** - Add all keys under the `articles` namespace
2. **Update MarkdownEditor** - Largest editor with most UI strings
3. **Update ImageCropper** - Aspect ratio labels and states
4. **Update ImageRotator** - Rotation controls and announcements
5. **Update VideoTrimmer** - Trim controls and duration displays
6. **Update InstructionEditor** - Main editor container
7. **Update AddContentModal** - Content type selection modal
8. **Update ContentEditSection** - Drag-drop and confirmation dialogs
9. **Update ReadOnlyContextSection** - Metadata labels
10. **Update TagsEditor** - Tag management strings
11. **Generate translations for 5 non-English languages**

---

## 4. Authorized Files and Functions for Modification

### 4.1 Translation Files

| File | Modification Type | Description |
|------|-------------------|-------------|
| `/messages/en.json` | MODIFY | Add `articles.editor`, `articles.markdown`, `articles.imageCropper`, `articles.imageRotator`, `articles.videoTrimmer`, `articles.addContent`, `articles.contentSection`, `articles.context`, `articles.tags` namespaces |
| `/messages/fr.json` | MODIFY | Add French translations for all new keys |
| `/messages/es.json` | MODIFY | Add Spanish translations for all new keys |
| `/messages/de.json` | MODIFY | Add German translations for all new keys |
| `/messages/nl.json` | MODIFY | Add Dutch translations for all new keys |
| `/messages/it.json` | MODIFY | Add Italian translations for all new keys |

### 4.2 Component Files

| File | Functions/Sections to Modify |
|------|------------------------------|
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | `CharacterCounter`, `MobileTabSwitcher`, `MarkdownToolbar`, `MarkdownEditor` (main component), `TOOLBAR_BUTTONS` array |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | `ASPECT_RATIO_OPTIONS` array, `onImageLoad`, `handleImageError`, `default export` (render sections) |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | `getRotationAnnouncement`, `default export` (render sections) |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | `handleError`, `handleLoadedMetadata`, `default export` (render sections), `announcements` |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | `handleCancel` (confirm message), render sections (labels, buttons) |
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | `AddContentModal` (modal title, type labels, form labels, buttons) |
| `/src/components/InstructionEditor/components/ContentEditSection.tsx` | `announcements` object, `ContentEditSection` (section header, buttons, dialog) |
| `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | `extractItemTypeFromTags`, `ReadOnlyContextSection` (labels) |
| `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | `TagChip`, `TagsEditor` (labels, aria-labels) |

### 4.3 Functions Requiring Modification (Detailed)

#### MarkdownEditor.tsx
- `CharacterCounter` (lines 72-112): Add translation for character count display
- `MobileTabSwitcher` (lines 123-168): Add translations for "Editor" and "Preview" tab labels
- `TOOLBAR_BUTTONS` array (lines 180-189): Convert aria-labels to dynamic translations
- `MarkdownToolbar` (lines 196-228): Add toolbar aria-label translation
- `MarkdownEditor` (lines 234-446): Add translations for placeholder, aria-label, error message, preview label, empty preview message

#### ImageCropper.tsx
- `ASPECT_RATIO_OPTIONS` array (lines 80-85): Convert labels to use translations
- `handleImageError` (lines 163-166): Translate error message
- Render sections (lines 356-502): Add translations for warning, loading, processing, preview, buttons

#### ImageRotator.tsx
- `getRotationAnnouncement` (lines 328-330): Translate with interpolation
- Render sections (lines 336-513): Add translations for all states, buttons, keyboard help

#### VideoTrimmer.tsx
- `handleError` (lines 195-198): Translate error message
- Render sections (lines 495-780): Add translations for all UI elements, announcements, buttons

#### InstructionEditor.tsx
- `handleCancel` (lines 148-154): Translate confirmation message
- Render sections (lines 165-271): Add translations for labels, placeholders, buttons

#### AddContentModal.tsx
- Render sections (lines 131-324): Add translations for modal title, type selection, form fields, buttons

#### ContentEditSection.tsx
- `announcements` object (lines 154-180): Translate all drag-drop announcements with interpolation
- Render sections (lines 206-311): Add translations for header, buttons, confirmation dialog

#### ReadOnlyContextSection.tsx
- `extractItemTypeFromTags` (lines 13-18): Return translated item type names
- Render sections (lines 29-65): Add translations for page header and field labels

#### TagsEditor.tsx
- `TagChip` (lines 68-96): Translate remove button aria-label
- `TagsEditor` (lines 105-233): Add translations for count display, add button, dropdown aria-label

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
| Common namespace exists | 2H.1 | May reuse `common.cancel`, `common.save` etc. |
| Error namespace exists | 2J.1 | May reuse `errors.uploadFailed`, `errors.fileTooLarge` |

---

## 6. Testing Requirements

### 6.1 Unit Tests

- Verify all hardcoded strings are replaced with translation function calls
- Test that translation keys exist and return expected values
- Test interpolation variables are correctly passed (e.g., `{count}`, `{degrees}`)

### 6.2 Integration Tests

- Test editor functionality in all 6 languages
- Verify no English fallback strings appear when using non-English locales
- Test keyboard shortcuts still work with translated aria-labels

### 6.3 Visual Testing

- Check text truncation in buttons and labels for longer translations
- Verify layout integrity with German/French (typically longer text)
- Test mobile responsiveness with translated strings

### 6.4 Accessibility Testing

- Verify screen reader announcements are properly translated
- Test keyboard navigation with translated aria-labels
- Confirm all interactive elements have translated accessible names

---

## 7. Acceptance Criteria (From Request)

- [ ] Article editor component replaces all hardcoded strings with translation hooks from the articles namespace
- [ ] Rich text editor toolbar buttons (bold, italic, underline, lists, headings, links, etc.) display translated labels
- [ ] Text formatting controls (font size, alignment, color, styles) use localized strings
- [ ] Media insertion UI (image upload, video embed, link attachment) displays in the selected language
- [ ] Article metadata fields (title, description, tags, category, author) show translated labels and placeholders
- [ ] Draft/publish status controls and buttons appear in the correct language
- [ ] Editor toolbar tooltips and help text are fully translated
- [ ] Preview mode toggle and related controls use localized strings
- [ ] Content type selectors display options in the selected language
- [ ] All editor-related modal dialogs (insert link, upload image, discard changes) use translated text
- [ ] Form validation messages within the editor context appear in the correct language
- [ ] Auto-save indicators and status messages display in the selected language
- [ ] Word count, character count, or other editor metrics use localized formatting and labels
- [ ] Keyboard shortcut hints are translated appropriately
- [ ] No English fallback strings appear when testing in non-English languages
- [ ] Translation keys follow established naming conventions in the articles namespace
- [ ] Editor components properly handle language switching without requiring page reload

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Text overflow in toolbar buttons | Medium | Low | Test with German (longest typical translations), allow text wrapping |
| Missing translation keys at runtime | Low | High | Build-time validation, console warnings in dev |
| Screen reader announcement issues | Low | Medium | Manual testing with VoiceOver/NVDA |
| Keyboard shortcuts with translated labels | Low | Low | Shortcuts are key-based, not label-based |
| Character counter formatting differences | Medium | Low | Use localized number formatting |

---

## 9. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 1-2 hours |
| Update MarkdownEditor | 1-2 hours |
| Update ImageCropper | 1 hour |
| Update ImageRotator | 1 hour |
| Update VideoTrimmer | 1-2 hours |
| Update InstructionEditor | 30 minutes |
| Update AddContentModal | 1 hour |
| Update ContentEditSection | 1 hour |
| Update ReadOnlyContextSection | 30 minutes |
| Update TagsEditor | 30 minutes |
| Generate 5 language translations | 1-2 hours |
| Testing and verification | 2 hours |
| **Total** | **~12-15 hours** |

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Request REQ-E02-070](/docs/gen_requests_epic2.md) - Articles namespace structure (prerequisite)
