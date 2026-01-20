# REQ-E02-072: Update Media Handling Components for Article Editor - Detailed Task Breakdown

**Document Created:** 2026-01-20 18:30:00 UTC
**Last Modified:** 2026-01-20 18:30:00 UTC
**Request ID:** REQ-E02-072
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.3
**Overview Document:** REQ-E02-072-update-media-handling-components-overview.md
**Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Executive Summary

This detailed task breakdown transforms the implementation overview for REQ-E02-072 into granular, actionable tasks that can be executed sequentially. The scope covers updating 8 media handling components (~153 strings) to use the next-intl translation system, ensuring all upload, editing, gallery, and link management interfaces are fully localized across 6 supported languages.

---

## Task Inventory

| Task # | Description | Complexity | Estimate |
|--------|-------------|------------|----------|
| 1 | Add translation keys to `/messages/en.json` for articles.media namespace | Medium | 45 min |
| 2 | Update FileUploadStep - PDFFileCard subcomponent | Low | 20 min |
| 3 | Update FileUploadStep - ErrorDisplay subcomponent | Low | 15 min |
| 4 | Update FileUploadStep - UploadProgress subcomponent | Low | 15 min |
| 5 | Update FileUploadStep - Main component render | Medium | 30 min |
| 6 | Update MediaEditorStep - EditorLoadingPlaceholder | Low | 10 min |
| 7 | Update MediaEditorStep - getEditTypeLabel and phase labels | Low | 15 min |
| 8 | Update MediaEditorStep - Main component render | Medium | 25 min |
| 9 | Update MediaThumbnail component | Low | 15 min |
| 10 | Update MediaGallery - MEDIA_TYPE_CONFIG and GalleryThumbnail | Medium | 20 min |
| 11 | Update MediaGallery - Main render and navigation | Medium | 25 min |
| 12 | Update MediaManagementSection component | Low | 15 min |
| 13 | Update AddMediaLinkForm component | Low | 20 min |
| 14 | Update MediaLinkItem component | Low | 20 min |
| 15 | Update DeleteMediaConfirmDialog component | Low | 15 min |
| 16 | Generate French translations | Low | 15 min |
| 17 | Generate Spanish translations | Low | 15 min |
| 18 | Generate German translations | Low | 15 min |
| 19 | Generate Dutch translations | Low | 15 min |
| 20 | Generate Italian translations | Low | 15 min |
| 21 | Build verification and testing | Medium | 30 min |

**Total Estimated Time:** ~6-7 hours

---

## Detailed Task Specifications

### Task 1: Add Translation Keys to `/messages/en.json`

**Objective:** Create the complete `articles.media` namespace structure with all required translation keys.

**File to Modify:** `/messages/en.json`

**Location:** Add under the `articles` namespace (create if not exists)

**Translation Keys to Add:**

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
        "deleteMedia": "Delete media"
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

**Verification:**
- [ ] All keys follow the `namespace.component.element.variant` pattern
- [ ] Pluralization uses ICU format `{count, plural, one {...} other {...}}`
- [ ] Variable interpolation uses `{variableName}` syntax
- [ ] No duplicate keys exist
- [ ] JSON is valid (no syntax errors)

---

### Task 2: Update FileUploadStep - PDFFileCard Subcomponent

**Objective:** Localize the PDFFileCard subcomponent for PDF file previews.

**File:** `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Lines to Modify:** 135-222 (PDFFileCard function)

**Changes Required:**

1. **Add import at top of file:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook inside PDFFileCard function:**
```tsx
const t = useTranslations('articles.media');
```

3. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 186 | `{pageCount} {pageCount === 1 ? 'page' : 'pages'}` | `{t('pdf.pageCount', { count: pageCount })}` |
| 198 | `"Password protected"` | `{t('pdf.passwordProtected')}` |
| 201 | `"File may be damaged"` | `{t('pdf.corrupted')}` |
| 217 | `Remove {file.name}` (aria-label) | `{t('removeFile', { name: file.name })}` |

**Verification:**
- [ ] PDFFileCard receives translations hook
- [ ] Page count uses pluralization correctly
- [ ] All strings replaced with translation calls

---

### Task 3: Update FileUploadStep - ErrorDisplay Subcomponent

**Objective:** Localize the error display for rejected files.

**File:** `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Lines to Modify:** 310-372 (ErrorDisplay function)

**Changes Required:**

1. **Add hook inside ErrorDisplay function:**
```tsx
const t = useTranslations('articles.media.rejection');
```

2. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 349 | `{rejectedFiles.length} file{s} couldn't be added` | `{t('count', { count: rejectedFiles.length })}` |
| 356 | `"Dismiss"` | `{t('dismiss')}` |

**Verification:**
- [ ] Rejection count uses pluralization
- [ ] Dismiss button is translated

---

### Task 4: Update FileUploadStep - UploadProgress Subcomponent

**Objective:** Localize the upload progress indicator.

**File:** `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Lines to Modify:** 384-416 (UploadProgress function)

**Changes Required:**

1. **Add hook inside UploadProgress function:**
```tsx
const t = useTranslations('articles.media.upload');
```

2. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 391 | `{fileCount}/{maxFiles} files` | `{t('fileCount', { current: fileCount, max: maxFiles })}` |
| 409 | `"Upload size progress"` (aria-label) | `{t('sizeProgress')}` |

**Note:** The file size formatting (`formatFileSize`) should remain as-is since it already provides locale-appropriate sizing.

**Verification:**
- [ ] File count display uses interpolation
- [ ] Progress bar aria-label is translated

---

### Task 5: Update FileUploadStep - Main Component Render

**Objective:** Localize the main upload interface including drag-drop zone and navigation.

**File:** `/src/components/ItemCapture/components/steps/FileUploadStep.tsx`

**Lines to Modify:** 591-736 (main render function)

**Changes Required:**

1. **Add hook at start of FileUploadStep function:**
```tsx
const t = useTranslations('articles.media.upload');
```

2. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 596 | `"Upload Files"` | `{t('title')}` |
| 598 | `"Drag and drop files or click to select"` | `{t('subtitle')}` |
| 656 | `"Drop files here"` | `{t('dropHere')}` |
| 658 | `"Invalid file type"` | `{t('invalidType')}` |
| 663 | `"Add more files"` | `{t('addMore')}` |
| 668 | `"Drag files here or click to browse"` | `{t('dragOrClick')}` |
| 671 | `"Supports images, videos, and PDF files"` | `{t('supportedFormats')}` |
| 674 | `Max {maxFiles} files, {formatFileSize(maxFileSize)} each` | `{t('limits', { maxFiles, maxSize: formatFileSize(maxFileSize) })}` |
| 707 | `{files.length} files uploaded` (aria-live) | `{t('filesUploaded', { count: files.length })}` |
| 718 | `"Back"` | `{t('back')}` |
| 730 | `"Continue"` | `{t('continue')}` |

**Verification:**
- [ ] All drag states have translated messages
- [ ] Screen reader announcement uses pluralization
- [ ] Navigation buttons are translated

---

### Task 6: Update MediaEditorStep - EditorLoadingPlaceholder

**Objective:** Localize the loading placeholder for lazy-loaded editors.

**File:** `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx`

**Lines to Modify:** 74-87 (EditorLoadingPlaceholder function)

**Changes Required:**

1. **Add import at top of file:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook inside EditorLoadingPlaceholder:**
```tsx
const t = useTranslations('articles.media.editor');
```

3. **Replace hardcoded string:**

| Line | Current | Replace With |
|------|---------|--------------|
| 79 | `aria-label="Loading editor"` | `aria-label={t('loadingEditor')}` |

**Verification:**
- [ ] Loading aria-label is translated

---

### Task 7: Update MediaEditorStep - getEditTypeLabel and Phase Labels

**Objective:** Localize edit type labels and phase indicators.

**File:** `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx`

**Lines to Modify:** 293-298

**Changes Required:**

1. **Convert getEditTypeLabel to use translations:**

The current implementation:
```tsx
function getEditTypeLabel(type: string): string {
  const labels = { trim: 'Trim', crop: 'Crop', rotation: 'Rotation', edit: 'Edit' };
  return labels[type] || type;
}
```

**New implementation approach:**
Since this is a pure function, we need to refactor to accept translations. Create a hook-based approach:

```tsx
function useEditTypeLabel() {
  const t = useTranslations('articles.media.editor.editTypes');
  return (type: string): string => {
    return t(type as any) || type;
  };
}
```

2. **Replace phase labels at lines 389:**

| Line | Current | Replace With |
|------|---------|--------------|
| 389 | `Step: Crop` / `Step: Rotate` | `{t('phase', { phase: t('phases.crop') })}` |

**Verification:**
- [ ] Edit type labels are translated
- [ ] Phase indicator is translated

---

### Task 8: Update MediaEditorStep - Main Component Render

**Objective:** Localize the main editor UI including progress, errors, and actions.

**File:** `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx`

**Lines to Modify:** 380-477 (main render sections)

**Changes Required:**

1. **Add hook at start of component:**
```tsx
const t = useTranslations('articles.media.editor');
```

2. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 384 | `Editing {type} {index} of {total}` | `{t('progress', { type: editTypeLabel, current: currentMediaIndex + 1, total: editableItems.length })}` |
| 405 | `"Unable to process edit"` | `{t('error.title')}` |
| 412 | `"Dismiss"` | `{t('error.dismiss')}` |
| 416 | `"Skip this item"` | `{t('error.skipItem')}` |
| 441 | `"Cancel"` | `{t('actions.cancel')}` |
| 455 | `Skip {editType}` | `{t('actions.skip', { type: editTypeLabel })}` |
| 468 | `Apply {editType}` | `{t('actions.apply', { type: editTypeLabel })}` |
| 475 | `Now editing {type} {index} of {total}` (aria-live) | `{t('announcement', { type: editTypeLabel, current: currentMediaIndex + 1, total: editableItems.length })}` |

**Verification:**
- [ ] Progress text uses interpolation
- [ ] Error messages are translated
- [ ] Action buttons use dynamic type labels
- [ ] Screen reader announcement is translated

---

### Task 9: Update MediaThumbnail Component

**Objective:** Localize the media thumbnail display with accessibility labels.

**File:** `/src/components/ItemCapture/components/shared/MediaThumbnail.tsx`

**Lines to Modify:** 136-177

**Changes Required:**

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook at start of component:**
```tsx
const t = useTranslations('articles.media');
```

3. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 141 | `{media.metadata.pageCount} {... === 1 ? 'page' : 'pages'}` | `{t('pdf.pageCount', { count: media.metadata.pageCount })}` |
| 174 | `aria-label="Delete media"` | `aria-label={t('thumbnail.deleteMedia')}` |

**Verification:**
- [ ] PDF page count uses pluralization
- [ ] Delete button aria-label is translated

---

### Task 10: Update MediaGallery - MEDIA_TYPE_CONFIG and GalleryThumbnail

**Objective:** Localize media type labels and thumbnail accessibility.

**File:** `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`

**Lines to Modify:** 76-228

**Changes Required:**

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Refactor MEDIA_TYPE_CONFIG to use translations:**

The config is currently a constant. Since it contains translatable labels, we need to create a hook:

```tsx
function useMediaTypeConfig() {
  const t = useTranslations('articles.media.gallery.types');
  return {
    video: {
      Icon: Play,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      label: t('video'),
    },
    image: {
      Icon: ImageIcon,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      label: t('photo'),
    },
    pdf: {
      Icon: FileText,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      label: t('pdf'),
    },
  };
}
```

3. **Update GalleryThumbnail (lines 146-228):**

| Line | Current | Replace With |
|------|---------|--------------|
| 181 | `aria-label={View ${item.type} ${item.metadata.originalFilename}}` | `aria-label={t('gallery.viewItem', { type: config[item.type].label, filename: item.metadata.originalFilename })}` |

**Verification:**
- [ ] Media type labels are translated
- [ ] Thumbnail aria-label uses interpolation

---

### Task 11: Update MediaGallery - Main Render and Navigation

**Objective:** Localize gallery navigation, empty state, and full-screen controls.

**File:** `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`

**Lines to Modify:** 548-987

**Changes Required:**

1. **Add hook at start of MediaGallery component:**
```tsx
const t = useTranslations('articles.media.gallery');
```

2. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 682-683 | `{pageCount} page(s)` | `{t('pdf.pageCount', { count: pageCount })}` (use parent t) |
| 696-703 | `"Video"`, `"Image"` | `{t('types.video')}`, `{t('types.image')}` |
| 751 | `"No media to display"` | `{t('noMedia')}` |
| 783 | `aria-label="Exit full screen"` | `aria-label={t('fullScreen.exit')}` |
| 812-829 | `"Previous media"`, `"Next media"` | `{t('navigation.previous')}`, `{t('navigation.next')}` |
| 844 | `aria-label="Media thumbnails"` | `aria-label={t('thumbnails')}` |
| 880 | `Media gallery, {count} items` | `{t('ariaLabel', { count: mediaItems.length })}` |
| 908 | `aria-label="Enter full screen"` | `aria-label={t('fullScreen.enter')}` |
| 939-958 | `"Previous media"`, `"Next media"` | `{t('navigation.previous')}`, `{t('navigation.next')}` |
| 987 | `aria-label="Media thumbnails"` | `aria-label={t('thumbnails')}` |

**Verification:**
- [ ] Empty state is translated
- [ ] Full-screen buttons have translated labels
- [ ] Navigation buttons are translated
- [ ] Gallery aria-label uses pluralization

---

### Task 12: Update MediaManagementSection Component

**Objective:** Localize the media links section header and empty state.

**File:** `/src/components/MediaManagement/MediaManagementSection.tsx`

**Lines to Modify:** 131-160

**Changes Required:**

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook at start of component:**
```tsx
const t = useTranslations('articles.media.links');
```

3. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 135 | `"Media & Links"` | `{t('sectionTitle')}` |
| 142 | `"Add Link"` | `{t('addLink')}` |
| 151 | `"No media links yet"` | `{t('emptyState.title')}` |
| 157 | `"Add your first link"` | `{t('emptyState.action')}` |

**Verification:**
- [ ] Section title is translated
- [ ] Add button is translated
- [ ] Empty state is fully translated

---

### Task 13: Update AddMediaLinkForm Component

**Objective:** Localize the add link form including labels, placeholders, and validation.

**File:** `/src/components/MediaManagement/AddMediaLinkForm.tsx`

**Lines to Modify:** 76, 129-234

**Changes Required:**

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook at start of component:**
```tsx
const t = useTranslations('articles.media.links.form');
```

3. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 76 | `'Please enter a valid URL'` | `t('urlInvalid')` |
| 131 | `"Title"` (label) | `{t('titleLabel')}` |
| 139 | `"e.g., Product Manual"` | `{t('titlePlaceholder')}` |
| 147 | `"URL"` (label) | `{t('urlLabel')}` |
| 158 | `"https://..."` | `{t('urlPlaceholder')}` |
| 169 | `"Type"` | `{t('typeLabel')}` |
| 183 | `"Type is auto-detected from URL but can be changed"` | `{t('typeHelp')}` |
| 191 | `"Thumbnail URL (optional)"` | `{t('thumbnailLabel')}` |
| 200 | `"https://..."` | `{t('urlPlaceholder')}` |
| 209 | `"+ Add custom thumbnail"` | `{t('addThumbnail')}` |
| 221 | `"Cancel"` | `{t('cancel')}` |
| 231 | `"Add Link"` | `{t('addLink')}` |

**Note:** The `<span className="text-red-500">*</span>` for required field markers should remain as-is.

**Verification:**
- [ ] All form labels are translated
- [ ] All placeholders are translated
- [ ] Validation error is translated
- [ ] Helper text is translated
- [ ] Action buttons are translated

---

### Task 14: Update MediaLinkItem Component

**Objective:** Localize the media link item view and edit modes.

**File:** `/src/components/MediaManagement/MediaLinkItem.tsx`

**Lines to Modify:** 163-265

**Changes Required:**

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook at start of component:**
```tsx
const t = useTranslations('articles.media.links');
```

3. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 163 | `aria-label="Drag to reorder"` | `aria-label={t('item.dragToReorder')}` |
| 185 | `aria-label="Edit link"` | `aria-label={t('item.editLink')}` |
| 193 | `aria-label="Delete link"` | `aria-label={t('item.deleteLink')}` |
| 208 | `"Title"` (label in edit mode) | `{t('form.titleLabel')}` |
| 214 | `"Enter title"` | `{t('item.enterTitle')}` |
| 220 | `"URL"` (label in edit mode) | `{t('form.urlLabel')}` |
| 226 | `"https://..."` | `{t('form.urlPlaceholder')}` |
| 232 | `"Type"` (label in edit mode) | `{t('form.typeLabel')}` |
| 251 | `"Cancel"` | `{t('form.cancel')}` |
| 261 | `"Save"` | `{t('item.save')}` |

**Verification:**
- [ ] Drag handle aria-label is translated
- [ ] Edit/delete button aria-labels are translated
- [ ] Edit mode form labels are translated
- [ ] Action buttons in edit mode are translated

---

### Task 15: Update DeleteMediaConfirmDialog Component

**Objective:** Localize the delete confirmation dialog.

**File:** `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`

**Lines to Modify:** 44-157

**Changes Required:**

1. **Add import:**
```tsx
import { useTranslations } from 'next-intl';
```

2. **Add hook at start of component:**
```tsx
const t = useTranslations('articles.media.links.deleteDialog');
```

3. **Refactor getTypeLabel function:**

```tsx
function useTypeLabel() {
  const t = useTranslations('articles.media.links.deleteDialog.types');
  return (linkType: string): string => {
    const key = linkType as 'youtube' | 'pdf' | 'image' | 'text';
    return t(key) || t('text');
  };
}
```

4. **Replace hardcoded strings:**

| Line | Current | Replace With |
|------|---------|--------------|
| 104 | `Delete {getTypeLabel(link.linkType)}?` | `{t('title', { type: typeLabel })}` |
| 122 | `"This action cannot be undone."` | `{t('warning')}` |
| 136 | `"Cancel"` | `{t('cancel')}` |
| 153 | `"Delete"` | `{t('delete')}` |

**Verification:**
- [ ] Dialog title uses translated type label
- [ ] Warning message is translated
- [ ] Action buttons are translated

---

### Task 16-20: Generate Translations for Non-English Languages

**Objective:** Create translations for French, Spanish, German, Dutch, and Italian.

**Files to Modify:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Process for Each Language:**

1. Copy the `articles.media` structure from `en.json`
2. Translate each string while:
   - Preserving `{variable}` interpolation placeholders
   - Preserving ICU pluralization format
   - Maintaining JSON structure integrity

**French Translation Sample (`fr.json`):**
```json
{
  "articles": {
    "media": {
      "upload": {
        "title": "Téléverser des fichiers",
        "subtitle": "Glissez-déposez des fichiers ou cliquez pour sélectionner",
        "dropHere": "Déposez les fichiers ici",
        "invalidType": "Type de fichier invalide",
        "addMore": "Ajouter plus de fichiers",
        "dragOrClick": "Glissez des fichiers ici ou cliquez pour parcourir",
        "supportedFormats": "Formats pris en charge : images, vidéos et fichiers PDF",
        "limits": "Max {maxFiles} fichiers, {maxSize} chacun",
        "filesUploaded": "{count, plural, one {# fichier téléversé} other {# fichiers téléversés}}",
        "fileCount": "{current}/{max} fichiers",
        "sizeProgress": "Progression de la taille du téléversement",
        "back": "Retour",
        "continue": "Continuer"
      },
      "rejection": {
        "count": "{count, plural, one {# fichier n'a pas pu être ajouté} other {# fichiers n'ont pas pu être ajoutés}}",
        "dismiss": "Ignorer"
      },
      "pdf": {
        "pageCount": "{count, plural, one {# page} other {# pages}}",
        "passwordProtected": "Protégé par mot de passe",
        "corrupted": "Le fichier peut être endommagé"
      },
      "removeFile": "Supprimer {name}",
      "links": {
        "sectionTitle": "Médias et liens",
        "addLink": "Ajouter un lien",
        "emptyState": {
          "title": "Aucun lien média pour l'instant",
          "action": "Ajoutez votre premier lien"
        },
        "deleteDialog": {
          "title": "Supprimer {type} ?",
          "types": {
            "youtube": "Vidéo YouTube",
            "pdf": "Document PDF",
            "image": "Image",
            "text": "Lien web"
          },
          "warning": "Cette action ne peut pas être annulée.",
          "cancel": "Annuler",
          "delete": "Supprimer"
        }
      }
    }
  }
}
```

**Note:** Complete translations for all keys should be provided for each language. Consider text expansion (German can be 30-40% longer than English).

**Verification per language:**
- [ ] All keys from en.json exist in language file
- [ ] Placeholders preserved correctly
- [ ] Pluralization rules appropriate for language
- [ ] JSON validates without errors

---

### Task 21: Build Verification and Testing

**Objective:** Verify the implementation works correctly across all components.

**Steps:**

1. **Build Check:**
```bash
npm run build
```
Verify no TypeScript or build errors related to translations.

2. **Visual Testing:**
- Navigate to file upload interface
- Test drag-drop zone messages
- Verify PDF page count displays
- Test media editor with translated phase labels
- Test media gallery navigation
- Test media link management CRUD operations
- Test delete confirmation dialog

3. **Language Switching Test:**
- Switch between all 6 languages
- Verify no English fallback strings appear
- Check layout integrity with longer translations

4. **Accessibility Testing:**
- Use screen reader to verify aria-labels
- Verify keyboard navigation still works
- Check focus management in dialogs

5. **Console Check:**
- No missing translation key warnings
- No React key warnings related to translations

**Verification Checklist:**
- [ ] Build passes without errors
- [ ] All components render with translations
- [ ] No English strings visible in non-English locales
- [ ] Pluralization works correctly
- [ ] Variable interpolation works correctly
- [ ] Screen reader announces translated content
- [ ] Upload state survives language switch

---

## Dependencies

### Prerequisites (Must Be Complete)

| Dependency | Source | Verification |
|------------|--------|--------------|
| next-intl installed | Epic 1 | `npm list next-intl` |
| IntlProvider configured | Epic 1 | Check `/src/app/layout.tsx` |
| Base translation files exist | Epic 1 | Check `/messages/*.json` |
| Articles namespace created | Task 2E.1 (REQ-E02-070) | Check `/messages/en.json` for `articles` key |

### Related Tasks

| Task | Relationship |
|------|--------------|
| REQ-E02-071 (Editor components) | Shares editing UI patterns |
| REQ-E02-001 (Common namespace) | May reuse `common.cancel`, `common.save` |
| REQ-E02-032 (Errors namespace) | May reuse error message patterns |

---

## Acceptance Criteria Verification

After completing all tasks, verify the following acceptance criteria from the original request:

- [ ] Media upload button labels and instructions use translation hooks
- [ ] Drag-and-drop zone displays translated messages
- [ ] File type restriction messages show in selected language
- [ ] File size limit messages are translated with locale formatting
- [ ] Upload progress indicators display translated status text
- [ ] Media preview components show translated controls
- [ ] Error messages for failed uploads display in selected language
- [ ] Error messages for invalid file types are translated
- [ ] Loading state messages appear in correct language
- [ ] Media deletion confirmation dialogs use localized text
- [ ] ARIA labels for media components use translated strings
- [ ] Empty state messages in media areas are localized
- [ ] No hardcoded English strings in any media component
- [ ] Translation keys follow established naming conventions
- [ ] Components handle language switching without breaking state

---

## Risk Mitigation Notes

| Risk | Mitigation Strategy |
|------|---------------------|
| Text overflow in drag-drop zones | Test with German (longest translations); ensure text wraps |
| Missing translation keys at runtime | Check console for warnings; use fallback to key name |
| Upload state lost on language switch | Translations don't trigger component remounts; use refs for state |
| Pluralization complexity | Test edge cases: 0, 1, 2, 5, 21 (different rules per language) |

---

## File Change Summary

### Files to Create
None - all translations added to existing files

### Files to Modify

| File | Type | Changes |
|------|------|---------|
| `/messages/en.json` | Translation | Add ~153 keys under `articles.media` |
| `/messages/fr.json` | Translation | Add French translations |
| `/messages/es.json` | Translation | Add Spanish translations |
| `/messages/de.json` | Translation | Add German translations |
| `/messages/nl.json` | Translation | Add Dutch translations |
| `/messages/it.json` | Translation | Add Italian translations |
| `/src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Component | Add useTranslations, replace ~35 strings |
| `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | Component | Add useTranslations, replace ~25 strings |
| `/src/components/ItemCapture/components/shared/MediaThumbnail.tsx` | Component | Add useTranslations, replace ~8 strings |
| `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | Component | Add useTranslations, replace ~30 strings |
| `/src/components/MediaManagement/MediaManagementSection.tsx` | Component | Add useTranslations, replace ~10 strings |
| `/src/components/MediaManagement/AddMediaLinkForm.tsx` | Component | Add useTranslations, replace ~18 strings |
| `/src/components/MediaManagement/MediaLinkItem.tsx` | Component | Add useTranslations, replace ~15 strings |
| `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx` | Component | Add useTranslations, replace ~12 strings |

---

## References

- [Overview Document](/docs/REQ-E02-072-update-media-handling-components-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md) - REQ-E02-072
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
