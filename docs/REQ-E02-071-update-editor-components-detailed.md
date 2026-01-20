# REQ-E02-071: Update Editor Components - Detailed Task Breakdown

**Document Created:** 2026-01-20 18:15:00 UTC
**Last Modified:** 2026-01-20 18:15:00 UTC
**Request ID:** REQ-E02-071
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.2
**Overview Document:** [REQ-E02-071-update-editor-components-overview.md](./REQ-E02-071-update-editor-components-overview.md)

---

## Document Purpose

This document provides granular, implementation-ready tasks for updating all article editor components to use the next-intl translation system. Each task is scoped to approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before starting implementation, verify these prerequisites from Epic 1:

- [ ] next-intl package installed in `package.json`
- [ ] IntlProvider configured in `/src/app/layout.tsx`
- [ ] Translation files exist in `/messages/*.json` (en, fr, es, de, nl, it)
- [ ] `useTranslations` hook working in client components
- [ ] `articles` namespace exists in `/messages/en.json` (created by Task 2E.1)

---

## Task Summary

| Task ID | Title | Size | Dependencies |
|---------|-------|------|--------------|
| 2E.2.1 | Add articles.editor and articles.markdown keys to en.json | S | 2E.1 |
| 2E.2.2 | Add articles.imageCropper keys to en.json | S | 2E.2.1 |
| 2E.2.3 | Add articles.imageRotator keys to en.json | S | 2E.2.1 |
| 2E.2.4 | Add articles.videoTrimmer keys to en.json | S | 2E.2.1 |
| 2E.2.5 | Add articles.addContent keys to en.json | S | 2E.2.1 |
| 2E.2.6 | Add articles.contentSection and articles.context keys to en.json | S | 2E.2.1 |
| 2E.2.7 | Add articles.tags keys to en.json | S | 2E.2.1 |
| 2E.2.8 | Update MarkdownEditor - CharacterCounter component | S | 2E.2.1 |
| 2E.2.9 | Update MarkdownEditor - Tab switcher and toolbar | M | 2E.2.8 |
| 2E.2.10 | Update MarkdownEditor - Main editor and preview | M | 2E.2.9 |
| 2E.2.11 | Update ImageCropper - Aspect ratio options | S | 2E.2.2 |
| 2E.2.12 | Update ImageCropper - States and buttons | M | 2E.2.11 |
| 2E.2.13 | Update ImageRotator component | M | 2E.2.3 |
| 2E.2.14 | Update VideoTrimmer - Error states and loading | S | 2E.2.4 |
| 2E.2.15 | Update VideoTrimmer - Controls and buttons | M | 2E.2.14 |
| 2E.2.16 | Update InstructionEditor main component | M | 2E.2.1 |
| 2E.2.17 | Update AddContentModal - Modal title and type selection | M | 2E.2.5 |
| 2E.2.18 | Update AddContentModal - Form fields and buttons | M | 2E.2.17 |
| 2E.2.19 | Update ContentEditSection - Drag announcements | S | 2E.2.6 |
| 2E.2.20 | Update ContentEditSection - Header and dialogs | M | 2E.2.19 |
| 2E.2.21 | Update ReadOnlyContextSection component | S | 2E.2.6 |
| 2E.2.22 | Update TagsEditor component | S | 2E.2.7 |
| 2E.2.23 | Generate French translations for articles namespace | S | 2E.2.1-2E.2.7 |
| 2E.2.24 | Generate Spanish translations for articles namespace | S | 2E.2.1-2E.2.7 |
| 2E.2.25 | Generate German translations for articles namespace | S | 2E.2.1-2E.2.7 |
| 2E.2.26 | Generate Dutch translations for articles namespace | S | 2E.2.1-2E.2.7 |
| 2E.2.27 | Generate Italian translations for articles namespace | S | 2E.2.1-2E.2.7 |
| 2E.2.28 | Verify and test all editor components | M | All above |

---

## Detailed Task Specifications

### Task 2E.2.1: Add articles.editor and articles.markdown keys to en.json

**Size:** S (Small)
**File:** `/messages/en.json`
**Dependencies:** Task 2E.1 (articles namespace structure must exist)

#### Description
Add the `editor` and `markdown` sub-namespaces under `articles` namespace with all translation keys for the main editor and markdown editor components.

#### Implementation Steps

1. Open `/messages/en.json`
2. Locate the `articles` namespace (should exist from Task 2E.1)
3. Add the following keys under `articles`:

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
      "characterCount": "{current, number} / {max, number} characters",
      "characterLimitExceeded": "Content exceeds the maximum character limit. Please shorten your text.",
      "previewLabel": "Preview",
      "previewEmpty": "Start typing to see a preview of your formatted content..."
    }
  }
}
```

#### Acceptance Criteria
- [ ] `articles.editor` namespace added with all 7 keys
- [ ] `articles.markdown` namespace added with all sub-sections (tabs, toolbar)
- [ ] JSON is valid (no syntax errors)
- [ ] Pluralization/interpolation uses ICU format (`{current, number}`)

#### Verification Command
```bash
# Validate JSON syntax
cat messages/en.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
```

---

### Task 2E.2.2: Add articles.imageCropper keys to en.json

**Size:** S (Small)
**File:** `/messages/en.json`
**Dependencies:** Task 2E.2.1

#### Description
Add translation keys for the ImageCropper component under the articles namespace.

#### Implementation Steps

1. Open `/messages/en.json`
2. Add the following under `articles`:

```json
{
  "articles": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] `articles.imageCropper` namespace added with all 14 keys
- [ ] `aspectRatios` sub-namespace contains 4 ratio labels
- [ ] JSON is valid

---

### Task 2E.2.3: Add articles.imageRotator keys to en.json

**Size:** S (Small)
**File:** `/messages/en.json`
**Dependencies:** Task 2E.2.1

#### Description
Add translation keys for the ImageRotator component under the articles namespace.

#### Implementation Steps

1. Open `/messages/en.json`
2. Add the following under `articles`:

```json
{
  "articles": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] `articles.imageRotator` namespace added with all keys
- [ ] `keyboardHelp` sub-namespace contains keyboard shortcut hints
- [ ] Interpolation uses `{degrees}` variable
- [ ] JSON is valid

---

### Task 2E.2.4: Add articles.videoTrimmer keys to en.json

**Size:** S (Small)
**File:** `/messages/en.json`
**Dependencies:** Task 2E.2.1

#### Description
Add translation keys for the VideoTrimmer component under the articles namespace.

#### Implementation Steps

1. Open `/messages/en.json`
2. Add the following under `articles`:

```json
{
  "articles": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] `articles.videoTrimmer` namespace added with all 17 keys
- [ ] Interpolation uses `{time}` and `{percent}` variables for trimming message
- [ ] JSON is valid

---

### Task 2E.2.5: Add articles.addContent keys to en.json

**Size:** S (Small)
**File:** `/messages/en.json`
**Dependencies:** Task 2E.2.1

#### Description
Add translation keys for the AddContentModal component under the articles namespace.

#### Implementation Steps

1. Open `/messages/en.json`
2. Add the following under `articles`:

```json
{
  "articles": {
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
        "characterCount": "{count, number} / {max, number} characters"
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] `articles.addContent` namespace added with all sub-sections
- [ ] `types`, `textForm`, `urlForm`, `fileForm`, `actions` sub-namespaces complete
- [ ] Interpolation variables properly formatted
- [ ] JSON is valid

---

### Task 2E.2.6: Add articles.contentSection and articles.context keys to en.json

**Size:** S (Small)
**File:** `/messages/en.json`
**Dependencies:** Task 2E.2.1

#### Description
Add translation keys for ContentEditSection and ReadOnlyContextSection components.

#### Implementation Steps

1. Open `/messages/en.json`
2. Add the following under `articles`:

```json
{
  "articles": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] `articles.contentSection` namespace added with announcements sub-section
- [ ] `articles.context` namespace added with itemTypes
- [ ] Pluralization uses ICU format for `pieceCount`
- [ ] Drag-drop announcements use proper interpolation variables
- [ ] JSON is valid

---

### Task 2E.2.7: Add articles.tags keys to en.json

**Size:** S (Small)
**File:** `/messages/en.json`
**Dependencies:** Task 2E.2.1

#### Description
Add translation keys for the TagsEditor component under the articles namespace.

#### Implementation Steps

1. Open `/messages/en.json`
2. Add the following under `articles`:

```json
{
  "articles": {
    "tags": {
      "removeTag": "Remove {label} tag",
      "addTag": "Add Tag",
      "addTagAria": "Add tag",
      "availableTags": "Available tags",
      "count": "{current, number} / {max, number}"
    }
  }
}
```

#### Acceptance Criteria
- [ ] `articles.tags` namespace added with all 5 keys
- [ ] `removeTag` uses `{label}` interpolation for dynamic tag names
- [ ] `count` uses ICU number formatting
- [ ] JSON is valid

---

### Task 2E.2.8: Update MarkdownEditor - CharacterCounter component

**Size:** S (Small)
**File:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx`
**Dependencies:** Task 2E.2.1

#### Description
Update the CharacterCounter sub-component to use translated character count string.

#### Implementation Steps

1. Add import at top of file:
```tsx
import { useTranslations } from 'next-intl';
```

2. Modify CharacterCounter function to accept translations:
```tsx
interface CharacterCounterProps {
  current: number;
  max: number;
  warning: number;
}

function CharacterCounter({ current, max, warning }: CharacterCounterProps) {
  const t = useTranslations('articles.markdown');
  const percentage = (current / max) * 100;
  const isWarning = current >= warning;
  const isError = current > max;

  return (
    <div className="flex items-center justify-between text-sm mt-2">
      <span
        className={cn(
          'tabular-nums',
          isError && 'text-red-600 font-medium',
          isWarning && !isError && 'text-yellow-600',
          !isWarning && 'text-gray-500'
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {t('characterCount', { current, max })}
      </span>
      {/* ... rest of progress bar unchanged */}
    </div>
  );
}
```

3. Replace line ~89:
   - **Before:** `{current.toLocaleString()} / {max.toLocaleString()} characters`
   - **After:** `{t('characterCount', { current, max })}`

#### Acceptance Criteria
- [ ] `useTranslations` hook imported from next-intl
- [ ] CharacterCounter uses `t('characterCount', { current, max })` instead of hardcoded string
- [ ] Component renders correctly with translation
- [ ] Build passes with no TypeScript errors

#### Verification
```bash
npm run build
# Check that build passes
```

---

### Task 2E.2.9: Update MarkdownEditor - Tab switcher and toolbar

**Size:** M (Medium)
**File:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx`
**Dependencies:** Task 2E.2.8

#### Description
Update the MobileTabSwitcher and MarkdownToolbar sub-components to use translated strings.

#### Implementation Steps

1. Update MobileTabSwitcher (around lines 123-168):
```tsx
function MobileTabSwitcher({
  activeTab,
  onTabChange
}: {
  activeTab: 'editor' | 'preview';
  onTabChange: (tab: 'editor' | 'preview') => void;
}) {
  const t = useTranslations('articles.markdown.tabs');

  return (
    <div className="flex border-b border-gray-200 mb-2 md:hidden">
      <button
        onClick={() => onTabChange('editor')}
        className={cn(/* ... */)}
      >
        <Edit3 className="w-4 h-4 mr-2" />
        {t('editor')}
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={cn(/* ... */)}
      >
        <Eye className="w-4 h-4 mr-2" />
        {t('preview')}
      </button>
    </div>
  );
}
```

2. Update TOOLBAR_BUTTONS array to be a function that accepts translations:
```tsx
function getToolbarButtons(t: (key: string) => string) {
  return [
    { format: 'bold' as MarkdownFormatKey, icon: Bold, label: t('toolbar.bold') },
    { format: 'italic' as MarkdownFormatKey, icon: Italic, label: t('toolbar.italic') },
    { format: 'heading1' as MarkdownFormatKey, icon: Heading1, label: t('toolbar.heading1') },
    { format: 'heading2' as MarkdownFormatKey, icon: Heading2, label: t('toolbar.heading2') },
    { format: 'heading3' as MarkdownFormatKey, icon: Heading3, label: t('toolbar.heading3') },
    { format: 'bulletList' as MarkdownFormatKey, icon: List, label: t('toolbar.bulletList') },
    { format: 'numberedList' as MarkdownFormatKey, icon: ListOrdered, label: t('toolbar.numberedList') },
    { format: 'link' as MarkdownFormatKey, icon: LinkIcon, label: t('toolbar.link') },
  ];
}
```

3. Update MarkdownToolbar component:
```tsx
function MarkdownToolbar({ onFormat, disabled }: MarkdownToolbarProps) {
  const t = useTranslations('articles.markdown');
  const buttons = getToolbarButtons(t);

  return (
    <div
      className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg"
      role="toolbar"
      aria-label={t('toolbar.ariaLabel')}
    >
      {buttons.map((button) => (
        <button
          key={button.format}
          onClick={() => onFormat(button.format)}
          disabled={disabled}
          aria-label={button.label}
          // ... rest unchanged
        >
          <button.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
```

#### Files Modified
- Lines ~146, ~164: "Editor", "Preview" tab labels
- Lines ~181-188: Toolbar button aria-labels
- Line ~205: Toolbar aria-label

#### Acceptance Criteria
- [ ] Tab labels use `t('tabs.editor')` and `t('tabs.preview')`
- [ ] Toolbar aria-label uses `t('toolbar.ariaLabel')`
- [ ] All 8 toolbar button labels are translated
- [ ] No hardcoded English strings remain in these sections
- [ ] Build passes

---

### Task 2E.2.10: Update MarkdownEditor - Main editor and preview

**Size:** M (Medium)
**File:** `/src/components/ItemCapture/editors/MarkdownEditor.tsx`
**Dependencies:** Task 2E.2.9

#### Description
Update the main MarkdownEditor component render section to use translations for placeholder, aria-label, error message, and preview section.

#### Implementation Steps

1. In the main MarkdownEditor component, add translation hook:
```tsx
export function MarkdownEditor({
  value,
  onChange,
  maxLength = TEXT_EDITOR_CONSTRAINTS.maxLength,
  warningThreshold = TEXT_EDITOR_CONSTRAINTS.warningThreshold,
  placeholder,
  disabled = false,
  minHeight = 200,
  className,
  ariaLabel,
  ariaDescribedBy,
}: MarkdownEditorProps) {
  const t = useTranslations('articles.markdown');
  // ... rest of component
```

2. Update textarea placeholder (around line 239):
   - **Before:** `placeholder || "Write your content here using markdown formatting..."`
   - **After:** `placeholder || t('placeholder')`

3. Update textarea aria-label (around line 243):
   - **Before:** `ariaLabel || "Markdown editor"`
   - **After:** `ariaLabel || t('ariaLabel')`

4. Update error message (around lines 396-398):
   - **Before:** `"Content exceeds the maximum character limit. Please shorten your text."`
   - **After:** `{t('characterLimitExceeded')}`

5. Update preview header (around line 416):
   - **Before:** `"Preview"`
   - **After:** `{t('previewLabel')}`

6. Update empty preview message (around line 438):
   - **Before:** `"Start typing to see a preview of your formatted content..."`
   - **After:** `{t('previewEmpty')}`

#### Acceptance Criteria
- [ ] Default placeholder uses translation
- [ ] Default aria-label uses translation
- [ ] Character limit exceeded error is translated
- [ ] Preview section header is translated
- [ ] Empty preview message is translated
- [ ] Props still allow override of placeholder and ariaLabel
- [ ] Build passes

---

### Task 2E.2.11: Update ImageCropper - Aspect ratio options

**Size:** S (Small)
**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Dependencies:** Task 2E.2.2

#### Description
Update the ASPECT_RATIO_OPTIONS array to use translated labels.

#### Implementation Steps

1. Add import at top of file:
```tsx
import { useTranslations } from 'next-intl';
```

2. Convert ASPECT_RATIO_OPTIONS from constant array to a function:
```tsx
// Remove this static array:
// const ASPECT_RATIO_OPTIONS = [
//   { label: 'Free', value: undefined },
//   { label: '1:1', value: 1 },
//   { label: '4:3', value: 4/3 },
//   { label: '16:9', value: 16/9 },
// ];

// Replace with function that takes translations:
function getAspectRatioOptions(t: (key: string) => string) {
  return [
    { label: t('aspectRatios.free'), value: undefined },
    { label: t('aspectRatios.square'), value: 1 },
    { label: t('aspectRatios.standard'), value: 4/3 },
    { label: t('aspectRatios.widescreen'), value: 16/9 },
  ];
}
```

3. In the component, call the function with translations:
```tsx
export default function ImageCropper({ /* props */ }) {
  const t = useTranslations('articles.imageCropper');
  const aspectRatioOptions = getAspectRatioOptions(t);
  // ... use aspectRatioOptions in render
}
```

#### Acceptance Criteria
- [ ] `useTranslations` hook imported
- [ ] Aspect ratio labels use translations
- [ ] Labels display correctly: "Free", "1:1", "4:3", "16:9"
- [ ] Build passes

---

### Task 2E.2.12: Update ImageCropper - States and buttons

**Size:** M (Medium)
**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Dependencies:** Task 2E.2.11

#### Description
Update all remaining hardcoded strings in ImageCropper including loading states, error messages, and action buttons.

#### Implementation Steps

1. Update handleImageError function (around line 166):
```tsx
const handleImageError = () => {
  setError(t('loadFailed'));
};
```

2. Update large image warning (around lines 366-368):
   - **Before:** `"Large image detected. Output may be scaled down for compatibility."`
   - **After:** `{t('largeImageWarning')}`

3. Update loading state (around line 400):
   - **Before:** `"Loading image..."`
   - **After:** `{t('loading')}`

4. Update processing state (around line 410):
   - **Before:** `"Applying crop..."`
   - **After:** `{t('processing')}`

5. Update preview section (around lines 432-453):
   - Alt text: `t('cropPreviewAlt')`
   - Label: `t('preview')`
   - Generating: `t('previewGenerating')`
   - Select: `t('previewSelect')`

6. Update error dismiss button (around line 466):
   - **Before:** `aria-label="Dismiss error"`
   - **After:** `aria-label={t('dismissError')}`

7. Update action buttons (around lines 486-498):
   - Apply: `{isProcessing ? t('applying') : t('applyCrop')}`
   - Cancel: `{t('cancel')}`

#### Acceptance Criteria
- [ ] All error messages use translations
- [ ] Loading and processing states translated
- [ ] Preview section labels translated
- [ ] Action buttons translated
- [ ] Aria-labels translated
- [ ] Build passes

---

### Task 2E.2.13: Update ImageRotator component

**Size:** M (Medium)
**File:** `/src/components/ItemCapture/editors/ImageRotator.tsx`
**Dependencies:** Task 2E.2.3

#### Description
Update all hardcoded strings in ImageRotator component.

#### Implementation Steps

1. Add import:
```tsx
import { useTranslations } from 'next-intl';
```

2. Add hook in component:
```tsx
export default function ImageRotator({ /* props */ }) {
  const t = useTranslations('articles.imageRotator');
  // ...
}
```

3. Update getRotationAnnouncement (around lines 328-330):
```tsx
const getRotationAnnouncement = useCallback((degrees: number) => {
  return t('rotationAnnouncement', { degrees });
}, [t]);
```

4. Update processing announcement (around line 355):
   - **Before:** `"Processing rotation..."`
   - **After:** `t('processingAnnouncement')`

5. Update loading state (around line 371):
   - **Before:** `"Loading image..."`
   - **After:** `{t('loading')}`

6. Update processing state (around line 381):
   - **Before:** `"Applying rotation..."`
   - **After:** `{t('processing')}`

7. Update rotation control buttons (around lines 433-447):
   - Left: `aria-label={t('rotateLeft')}`
   - Right: `aria-label={t('rotateRight')}`

8. Update status text (around lines 463-466):
   - Rotation: `{t('currentRotation', { degrees: rotation })}`
   - Modified: `{t('modified')}`

9. Update keyboard help (around lines 471-479):
```tsx
<span>{t('keyboardHelp.label')}</span>
<kbd>←→</kbd> {t('keyboardHelp.arrows')}
<kbd>Esc</kbd> {t('keyboardHelp.escape')}
<kbd>Enter</kbd> {t('keyboardHelp.apply')}
```

10. Update action buttons (around lines 496-510):
    - Apply: `{isApplying ? t('applying') : t('applyRotation')}`
    - Cancel: `{t('cancel')}`
    - Try Again: `{t('tryAgain')}`

#### Acceptance Criteria
- [ ] All screen reader announcements translated
- [ ] Loading/processing states translated
- [ ] Rotation controls and status translated
- [ ] Keyboard help text translated
- [ ] Action buttons translated
- [ ] Build passes

---

### Task 2E.2.14: Update VideoTrimmer - Error states and loading

**Size:** S (Small)
**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Dependencies:** Task 2E.2.4

#### Description
Update error handling and loading states in VideoTrimmer component.

#### Implementation Steps

1. Add import:
```tsx
import { useTranslations } from 'next-intl';
```

2. Add hook in component:
```tsx
export default function VideoTrimmer({ /* props */ }) {
  const t = useTranslations('articles.videoTrimmer');
  // ...
}
```

3. Update handleError (around lines 195-198):
```tsx
const handleError = () => {
  setError(t('loadFailed'));
};
```

4. Update playback error (around line 229):
   - **Before:** `"Unable to play video. Please try again."`
   - **After:** `t('playbackFailed')`

5. Update error display (around lines 507-519):
   - Error heading: `{t('error')}`
   - Try again button: `{t('tryAgain')}`

6. Update loading state (around line 543):
   - **Before:** `"Loading video..."`
   - **After:** `{t('loading')}`

#### Acceptance Criteria
- [ ] Error messages use translations
- [ ] Loading state uses translation
- [ ] Try again button translated
- [ ] Build passes

---

### Task 2E.2.15: Update VideoTrimmer - Controls and buttons

**Size:** M (Medium)
**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Dependencies:** Task 2E.2.14

#### Description
Update trim controls, playback controls, and action buttons in VideoTrimmer.

#### Implementation Steps

1. Update trim point markers (around lines 601, 635):
   - Start: `aria-label={t('startMarker')}`
   - End: `aria-label={t('endMarker')}`

2. Update duration labels (around lines 664-676):
   - Selection: `{t('selection')}`
   - Duration: `{t('duration')}`
   - Current: `{t('current')}`

3. Update trim reduction message (around lines 682-683):
```tsx
{t('trimming', { time: formatTime(trimDuration), percent: reductionPercent })}
```

4. Update playback controls (around lines 700-731):
   - Skip to start: `aria-label={t('skipToStart')}`
   - Skip to end: `aria-label={t('skipToEnd')}`
   - Play: `aria-label={t('play')}`
   - Pause: `aria-label={t('pause')}`

5. Update action buttons (around lines 750-766):
   - Cancel: `{t('cancel')}`
   - Apply: `{t('applyTrim')}`

#### Acceptance Criteria
- [ ] All trim point markers have translated aria-labels
- [ ] Duration labels translated
- [ ] Trim reduction message uses interpolation
- [ ] Playback control aria-labels translated
- [ ] Action buttons translated
- [ ] Build passes

---

### Task 2E.2.16: Update InstructionEditor main component

**Size:** M (Medium)
**File:** `/src/components/InstructionEditor/InstructionEditor.tsx`
**Dependencies:** Task 2E.2.1

#### Description
Update the main InstructionEditor component with translations for labels, placeholders, and confirmation dialog.

#### Implementation Steps

1. Add import:
```tsx
import { useTranslations } from 'next-intl';
```

2. Add hook in component:
```tsx
export function InstructionEditor({
  articleData,
  onSave,
  onCancel,
  isSaving = false,
}: InstructionEditorProps) {
  const t = useTranslations('articles.editor');
  // ...
}
```

3. Update handleCancel confirmation (around line 150):
```tsx
const handleCancel = useCallback(() => {
  if (isDirty) {
    const confirmLeave = window.confirm(t('unsavedChangesConfirm'));
    if (!confirmLeave) return;
  }
  onCancel();
}, [isDirty, onCancel, t]);
```

4. Update Article Title label (around line 176):
   - **Before:** `"Article Title"`
   - **After:** `{t('title')}`

5. Update Article Title placeholder (around line 197):
   - **Before:** `"Enter article title"`
   - **After:** `placeholder={t('titlePlaceholder')}`

6. Update Tags label (around line 204):
   - **Before:** `"Tags"`
   - **After:** `{t('tagsLabel')}`

7. Update Cancel button (around line 241):
   - Use `common.cancel` from common namespace or `{t('cancel')}` if added to editor namespace

8. Update Save button (around line 258):
```tsx
{isSaving ? t('savingChanges') : t('saveChanges')}
```

#### Acceptance Criteria
- [ ] Article Title label and placeholder translated
- [ ] Tags label translated
- [ ] Unsaved changes confirmation dialog translated
- [ ] Save button states translated
- [ ] Cancel button uses translation
- [ ] Build passes

---

### Task 2E.2.17: Update AddContentModal - Modal title and type selection

**Size:** M (Medium)
**File:** `/src/components/InstructionEditor/components/AddContentModal.tsx`
**Dependencies:** Task 2E.2.5

#### Description
Update the AddContentModal component's modal title and content type selection buttons.

#### Implementation Steps

1. Add import:
```tsx
import { useTranslations } from 'next-intl';
```

2. Add hook in component:
```tsx
export function AddContentModal({ /* props */ }) {
  const t = useTranslations('articles.addContent');
  // ...
}
```

3. Update modal title (around line 148):
```tsx
<DialogTitle>
  {isEditing ? t('createTitle') : t('modalTitle')}
</DialogTitle>
```

4. Update content type buttons (around lines 171-192):
```tsx
// Write Text button
<button ...>
  <FileText className="..." />
  <span>{t('types.text')}</span>
</button>

// Add Link button
<button ...>
  <Link className="..." />
  <span>{t('types.link')}</span>
</button>

// Upload File button
<button ...>
  <Upload className="..." />
  <span>{t('types.file')}</span>
  <span className="text-xs text-gray-500">{t('types.fileDescription')}</span>
</button>
```

#### Acceptance Criteria
- [ ] Modal title uses correct translation based on mode
- [ ] All content type labels translated
- [ ] File upload description translated
- [ ] Build passes

---

### Task 2E.2.18: Update AddContentModal - Form fields and buttons

**Size:** M (Medium)
**File:** `/src/components/InstructionEditor/components/AddContentModal.tsx`
**Dependencies:** Task 2E.2.17

#### Description
Update form field labels, placeholders, and action buttons in AddContentModal.

#### Implementation Steps

1. Update text form (around lines 200-225):
```tsx
// Title label
<label>{t('textForm.titleLabel')}</label>
<input placeholder={t('textForm.titlePlaceholder')} />

// Content label
<label>{t('textForm.contentLabel')}</label>
<textarea placeholder={t('textForm.contentPlaceholder')} />

// Character count
<span>{t('textForm.characterCount', { count, max: 5000 })}</span>
```

2. Update URL form (around lines 235-257):
```tsx
// URL label
<label>{t('urlForm.urlLabel')}</label>
<input placeholder={t('urlForm.urlPlaceholder')} />

// Title label
<label>{t('urlForm.titleLabel')}</label>
<input placeholder={t('urlForm.titlePlaceholder')} />
```

3. Update file form (around lines 267-279):
```tsx
// File label
<label>{t('fileForm.label')}</label>

// Selected file info
<span>{t('fileForm.selected', { name: file.name, size: fileSizeMB })}</span>
```

4. Update action buttons (around lines 295-317):
```tsx
// Back button
<button>{t('actions.back')}</button>

// Cancel button
<button>{t('actions.cancel')}</button>

// Submit button
<button>{t('actions.addContent')}</button>
```

#### Acceptance Criteria
- [ ] All form labels and placeholders translated
- [ ] Character count uses interpolation
- [ ] File selected message uses interpolation
- [ ] All action buttons translated
- [ ] Build passes

---

### Task 2E.2.19: Update ContentEditSection - Drag announcements

**Size:** S (Small)
**File:** `/src/components/InstructionEditor/components/ContentEditSection.tsx`
**Dependencies:** Task 2E.2.6

#### Description
Update the drag-and-drop screen reader announcements in ContentEditSection.

#### Implementation Steps

1. Add import:
```tsx
import { useTranslations } from 'next-intl';
```

2. Add hook in component:
```tsx
export function ContentEditSection({ /* props */ }) {
  const t = useTranslations('articles.contentSection');
  // ...
}
```

3. Update announcements object (around lines 154-180):
```tsx
const announcements = useMemo(() => ({
  onDragStart: ({ active }) => {
    const item = content.find(c => c.id === active.id);
    const position = content.findIndex(c => c.id === active.id) + 1;
    return t('announcements.pickedUp', {
      type: item?.type || 'content',
      position,
      total: content.length
    });
  },
  onDragOver: ({ over }) => {
    if (over) {
      const position = content.findIndex(c => c.id === over.id) + 1;
      return t('announcements.over', { position });
    }
    return '';
  },
  onDragEnd: ({ active, over }) => {
    if (over && active.id !== over.id) {
      const item = content.find(c => c.id === active.id);
      const position = content.findIndex(c => c.id === over.id) + 1;
      return t('announcements.dropped', {
        type: item?.type || 'content',
        position,
        total: content.length
      });
    }
    return t('announcements.unchanged');
  },
  onDragCancel: () => t('announcements.cancelled'),
}), [content, t]);
```

#### Acceptance Criteria
- [ ] All drag-drop announcements use translations
- [ ] Interpolation variables passed correctly (type, position, total)
- [ ] Cancelled announcement translated
- [ ] Build passes

---

### Task 2E.2.20: Update ContentEditSection - Header and dialogs

**Size:** M (Medium)
**File:** `/src/components/InstructionEditor/components/ContentEditSection.tsx`
**Dependencies:** Task 2E.2.19

#### Description
Update section header, piece count, and removal confirmation dialog in ContentEditSection.

#### Implementation Steps

1. Update section header (around lines 212-214):
```tsx
<h3 className="text-lg font-medium">
  {t('title')} {t('pieceCount', { count: content.length })}
</h3>
```

2. Update drag-to-reorder aria-label (around line 237):
```tsx
<div aria-label={t('dragToReorder')}>
```

3. Update Add Content button (around line 269):
```tsx
<button>
  <Plus className="..." />
  {t('addContent')}
</button>
```

4. Update removal confirmation dialog (around lines 285-300):
```tsx
<AlertDialog>
  <AlertDialogTitle>{t('removeConfirmTitle')}</AlertDialogTitle>
  <AlertDialogDescription>
    {t('removeConfirmMessage')}
  </AlertDialogDescription>
  <AlertDialogAction>{t('remove')}</AlertDialogAction>
  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
</AlertDialog>
```

#### Acceptance Criteria
- [ ] Section title translated
- [ ] Piece count uses ICU pluralization
- [ ] Drag-to-reorder aria-label translated
- [ ] Add Content button translated
- [ ] Removal dialog title, message, and buttons translated
- [ ] Build passes

---

### Task 2E.2.21: Update ReadOnlyContextSection component

**Size:** S (Small)
**File:** `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx`
**Dependencies:** Task 2E.2.6

#### Description
Update ReadOnlyContextSection component to use translations for field labels and item type values.

#### Implementation Steps

1. Add import:
```tsx
import { useTranslations } from 'next-intl';
```

2. Add hook in component:
```tsx
export function ReadOnlyContextSection({ item }: Props) {
  const t = useTranslations('articles.context');
  // ...
}
```

3. Update extractItemTypeFromTags function (around lines 13-18):
```tsx
function extractItemTypeFromTags(tags: string[], t: (key: string) => string): string {
  if (tags.includes('appliance')) return t('itemTypes.appliance');
  if (tags.includes('room-item')) return t('itemTypes.roomItem');
  return t('itemTypes.generalInfo');
}
```

4. Update page header (around line 33):
```tsx
// Note: This may use the editor namespace
const tEditor = useTranslations('articles.editor');
<h2>{tEditor('pageHeader', { title: item.name })}</h2>
```

5. Update field labels (around lines 41-58):
```tsx
// Room label
<dt>{t('room')}</dt>
<dd>{item.roomName}</dd>

// Item Type label
<dt>{t('itemType')}</dt>
<dd>{extractItemTypeFromTags(item.tags, t)}</dd>

// Item Name label
<dt>{t('itemName')}</dt>
<dd>{item.name}</dd>
```

#### Acceptance Criteria
- [ ] Page header uses interpolation with item title
- [ ] Room, Item Type, Item Name labels translated
- [ ] Item type values (Appliance, Room Item, General Info) translated
- [ ] Build passes

---

### Task 2E.2.22: Update TagsEditor component

**Size:** S (Small)
**File:** `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`
**Dependencies:** Task 2E.2.7

#### Description
Update TagsEditor component with translations for tag management UI.

#### Implementation Steps

1. Add import:
```tsx
import { useTranslations } from 'next-intl';
```

2. In TagChip sub-component (around lines 68-96):
```tsx
function TagChip({ tag, onRemove }: TagChipProps) {
  const t = useTranslations('articles.tags');

  return (
    <span className="...">
      {tag.label}
      <button
        onClick={() => onRemove(tag.id)}
        aria-label={t('removeTag', { label: tag.label })}
      >
        <X className="..." />
      </button>
    </span>
  );
}
```

3. In TagsEditor main component (around lines 105-233):
```tsx
export function TagsEditor({ tags, availableTags, onChange, maxTags = 10 }: Props) {
  const t = useTranslations('articles.tags');

  // Update tag count display (around line 167)
  <span>{t('count', { current: tags.length, max: maxTags })}</span>

  // Update Add Tag button (around lines 185-188)
  <button aria-label={t('addTagAria')}>
    <Plus className="..." />
    {t('addTag')}
  </button>

  // Update dropdown aria-label (around line 209)
  <div aria-label={t('availableTags')}>
```

#### Acceptance Criteria
- [ ] Remove tag button has translated aria-label with tag name
- [ ] Tag count display uses ICU number formatting
- [ ] Add Tag button and aria-label translated
- [ ] Available tags dropdown aria-label translated
- [ ] Build passes

---

### Task 2E.2.23: Generate French translations for articles namespace

**Size:** S (Small)
**File:** `/messages/fr.json`
**Dependencies:** Tasks 2E.2.1-2E.2.7

#### Description
Generate French translations for all keys added to the articles namespace.

#### Implementation Steps

1. Open `/messages/fr.json`
2. Add French translations for all `articles` namespace keys

Example key translations:
```json
{
  "articles": {
    "editor": {
      "title": "Titre de l'article",
      "titlePlaceholder": "Entrez le titre de l'article",
      "tagsLabel": "Étiquettes",
      "pageHeader": "Guide de modification pour : {title}",
      "savingChanges": "Enregistrement...",
      "saveChanges": "Enregistrer les modifications",
      "unsavedChangesConfirm": "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir annuler ?"
    },
    "markdown": {
      "tabs": {
        "editor": "Éditeur",
        "preview": "Aperçu"
      },
      "toolbar": {
        "ariaLabel": "Mise en forme du texte",
        "bold": "Gras (Ctrl+B)",
        "italic": "Italique (Ctrl+I)",
        "heading1": "Titre 1",
        "heading2": "Titre 2",
        "heading3": "Titre 3",
        "bulletList": "Liste à puces",
        "numberedList": "Liste numérotée",
        "link": "Insérer un lien (Ctrl+K)"
      },
      "placeholder": "Écrivez votre contenu ici en utilisant le formatage markdown...",
      "ariaLabel": "Éditeur markdown",
      "characterCount": "{current, number} / {max, number} caractères",
      "characterLimitExceeded": "Le contenu dépasse la limite de caractères. Veuillez raccourcir votre texte.",
      "previewLabel": "Aperçu",
      "previewEmpty": "Commencez à taper pour voir un aperçu de votre contenu formaté..."
    }
  }
}
```

#### Acceptance Criteria
- [ ] All `articles` namespace keys have French translations
- [ ] Pluralization uses ICU format correctly
- [ ] Interpolation variables preserved (`{title}`, `{current}`, etc.)
- [ ] JSON is valid
- [ ] Translations are contextually appropriate

---

### Task 2E.2.24: Generate Spanish translations for articles namespace

**Size:** S (Small)
**File:** `/messages/es.json`
**Dependencies:** Tasks 2E.2.1-2E.2.7

#### Description
Generate Spanish translations for all keys added to the articles namespace.

#### Implementation Steps
Same process as Task 2E.2.23, but for Spanish.

Example key translations:
```json
{
  "articles": {
    "editor": {
      "title": "Título del artículo",
      "titlePlaceholder": "Ingrese el título del artículo",
      "tagsLabel": "Etiquetas",
      "pageHeader": "Editando guía para: {title}",
      "savingChanges": "Guardando...",
      "saveChanges": "Guardar cambios",
      "unsavedChangesConfirm": "Tiene cambios sin guardar. ¿Está seguro de que desea cancelar?"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All `articles` namespace keys have Spanish translations
- [ ] JSON is valid
- [ ] Translations are contextually appropriate

---

### Task 2E.2.25: Generate German translations for articles namespace

**Size:** S (Small)
**File:** `/messages/de.json`
**Dependencies:** Tasks 2E.2.1-2E.2.7

#### Description
Generate German translations for all keys added to the articles namespace.

#### Implementation Steps
Same process as Task 2E.2.23, but for German.

Example key translations:
```json
{
  "articles": {
    "editor": {
      "title": "Artikeltitel",
      "titlePlaceholder": "Artikeltitel eingeben",
      "tagsLabel": "Tags",
      "pageHeader": "Anleitung bearbeiten für: {title}",
      "savingChanges": "Speichern...",
      "saveChanges": "Änderungen speichern",
      "unsavedChangesConfirm": "Sie haben ungespeicherte Änderungen. Sind Sie sicher, dass Sie abbrechen möchten?"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All `articles` namespace keys have German translations
- [ ] JSON is valid
- [ ] Translations are contextually appropriate

---

### Task 2E.2.26: Generate Dutch translations for articles namespace

**Size:** S (Small)
**File:** `/messages/nl.json`
**Dependencies:** Tasks 2E.2.1-2E.2.7

#### Description
Generate Dutch translations for all keys added to the articles namespace.

#### Implementation Steps
Same process as Task 2E.2.23, but for Dutch.

Example key translations:
```json
{
  "articles": {
    "editor": {
      "title": "Artikeltitel",
      "titlePlaceholder": "Voer artikeltitel in",
      "tagsLabel": "Tags",
      "pageHeader": "Handleiding bewerken voor: {title}",
      "savingChanges": "Opslaan...",
      "saveChanges": "Wijzigingen opslaan",
      "unsavedChangesConfirm": "U heeft niet-opgeslagen wijzigingen. Weet u zeker dat u wilt annuleren?"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All `articles` namespace keys have Dutch translations
- [ ] JSON is valid
- [ ] Translations are contextually appropriate

---

### Task 2E.2.27: Generate Italian translations for articles namespace

**Size:** S (Small)
**File:** `/messages/it.json`
**Dependencies:** Tasks 2E.2.1-2E.2.7

#### Description
Generate Italian translations for all keys added to the articles namespace.

#### Implementation Steps
Same process as Task 2E.2.23, but for Italian.

Example key translations:
```json
{
  "articles": {
    "editor": {
      "title": "Titolo dell'articolo",
      "titlePlaceholder": "Inserisci il titolo dell'articolo",
      "tagsLabel": "Tag",
      "pageHeader": "Modifica guida per: {title}",
      "savingChanges": "Salvataggio...",
      "saveChanges": "Salva modifiche",
      "unsavedChangesConfirm": "Hai modifiche non salvate. Sei sicuro di voler annullare?"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All `articles` namespace keys have Italian translations
- [ ] JSON is valid
- [ ] Translations are contextually appropriate

---

### Task 2E.2.28: Verify and test all editor components

**Size:** M (Medium)
**Dependencies:** All previous tasks

#### Description
Comprehensive verification that all editor components render correctly with translations in all 6 languages.

#### Implementation Steps

1. **Build verification:**
```bash
npm run build
```
Ensure no TypeScript errors related to translations.

2. **Visual verification checklist:**
   - [ ] MarkdownEditor displays translated tabs, toolbar, placeholder, character count
   - [ ] ImageCropper displays translated aspect ratios, loading states, buttons
   - [ ] ImageRotator displays translated controls, announcements, buttons
   - [ ] VideoTrimmer displays translated loading, controls, buttons
   - [ ] InstructionEditor displays translated labels, placeholders, buttons
   - [ ] AddContentModal displays translated types, forms, buttons
   - [ ] ContentEditSection displays translated header, announcements, dialogs
   - [ ] ReadOnlyContextSection displays translated labels and values
   - [ ] TagsEditor displays translated count, buttons, aria-labels

3. **Language switching test:**
   - Switch app to each of the 6 languages
   - Verify no English fallback strings appear
   - Verify layout doesn't break with longer German/French text

4. **Accessibility verification:**
   - Test with screen reader (VoiceOver/NVDA)
   - Verify drag-drop announcements are properly translated
   - Verify all buttons have translated aria-labels

5. **Console check:**
   - Open browser console
   - Verify no missing translation key warnings

#### Acceptance Criteria
- [ ] Build passes without errors
- [ ] All components render in all 6 languages
- [ ] No English fallback strings when using non-English locales
- [ ] No missing translation key warnings in console
- [ ] Screen reader announcements work in all languages
- [ ] Layout is acceptable in all languages (no major overflow issues)

---

## Implementation Notes

### Translation Pattern Reference

```tsx
// Client component pattern
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace.section');
  return <button>{t('key')}</button>;
}

// With interpolation
{t('greeting', { name: 'John' })}

// With pluralization (ICU format)
{t('items', { count: 5 })}
// Translation: "{count, plural, one {# item} other {# items}}"
```

### Common Mistakes to Avoid

1. **Don't concatenate translated strings:**
   ```tsx
   // ❌ Wrong
   {t('hello') + ' ' + name}

   // ✅ Correct
   {t('helloName', { name })}
   ```

2. **Don't split sentences across translations:**
   ```tsx
   // ❌ Wrong
   {t('part1')} {value} {t('part2')}

   // ✅ Correct
   {t('fullSentence', { value })}
   ```

3. **Don't forget aria-labels:**
   ```tsx
   // ❌ Wrong
   <button aria-label="Close">

   // ✅ Correct
   <button aria-label={t('close')}>
   ```

---

## Files Modified Summary

| File | Tasks |
|------|-------|
| `/messages/en.json` | 2E.2.1-2E.2.7 |
| `/messages/fr.json` | 2E.2.23 |
| `/messages/es.json` | 2E.2.24 |
| `/messages/de.json` | 2E.2.25 |
| `/messages/nl.json` | 2E.2.26 |
| `/messages/it.json` | 2E.2.27 |
| `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | 2E.2.8-2E.2.10 |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | 2E.2.11-2E.2.12 |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | 2E.2.13 |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | 2E.2.14-2E.2.15 |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | 2E.2.16 |
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | 2E.2.17-2E.2.18 |
| `/src/components/InstructionEditor/components/ContentEditSection.tsx` | 2E.2.19-2E.2.20 |
| `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | 2E.2.21 |
| `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | 2E.2.22 |

---

## References

- [Overview Document](./REQ-E02-071-update-editor-components-overview.md)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
