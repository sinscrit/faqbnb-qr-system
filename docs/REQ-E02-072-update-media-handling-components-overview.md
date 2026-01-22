# REQ-E02-072: Update Media Handling Components for i18n

**Document Type:** Implementation Breakdown (Overview)
**Request ID:** REQ-E02-072
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task Reference:** 2E.3
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-22 17:08
**Last Modified:** 2026-01-22 17:08

---

## 1. Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-072 (Task 2E.3) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | 2026-01-17 |
| Breakdown Created | 2026-01-22 17:08 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 4-6 hours |
| Status | PENDING |

---

## 2. Summary

This document provides the implementation breakdown for updating media handling components to use the `media.*` and `articles.media.*` namespace translations. These components include MediaGallery, AssetPanel with its sub-components (AssetDropZone, AssetItem, SortableAssetList, AssetRemoveConfirmDialog), and related media management utilities.

The media handling components contain approximately 90-110 hardcoded UI strings that need to be replaced with translation function calls.

---

## 3. Goals

### 3.1 Functional Requirements

1. Replace all hardcoded strings in MediaGallery with translation calls
2. Replace all hardcoded strings in AssetPanel component family
3. Replace all hardcoded strings in AssetDropZone
4. Replace all hardcoded strings in AssetItem
5. Replace all hardcoded strings in SortableAssetList
6. Replace all hardcoded strings in AssetRemoveConfirmDialog
7. Use `useTranslations` hook from next-intl for client components
8. Maintain existing functionality while adding i18n support

### 3.2 Assumptions & Clarifications

- `media.*` namespace already exists (established in earlier Epic 2 tasks)
- `articles.media.*` namespace keys available from Task 2E.1
- Components will continue to use client-side rendering
- Translation functions use established patterns from Sub-Epic 2D (Item Management)
- Asset type labels, file formats, and error messages must be translated
- Accessibility labels (aria-*) must also be translated

---

## 4. Requirements Analysis

### 4.1 Components to Update

| Component | File | Hardcoded Strings | Current i18n Status |
|-----------|------|-------------------|---------------------|
| MediaGallery | `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | ~30 | Partial - uses `useTranslations` |
| AssetPanel | `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | ~20 | Partial - uses `media.assetPanel` |
| AssetDropZone | `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx` | ~20 | Partial - uses `media.dropZone` |
| AssetItem | `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | ~15 | Partial - uses `media.assetItem` |
| SortableAssetList | `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx` | ~10 | Unknown |
| AssetRemoveConfirmDialog | `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | ~10 | Unknown |

### 4.2 String Inventory by Component

#### MediaGallery (~30 strings)
- Media type badges: "Video", "Photo", "PDF", "Link"
- Navigation: Previous/Next buttons
- Full-screen toggle
- Thumbnail navigation
- Duration display for videos
- Page count for PDFs
- Empty state messages
- Accessibility labels for navigation and media items

#### AssetPanel (~20 strings)
- **Current status:** Already uses `useTranslations('media.assetPanel')` and `useTranslations('common.actions')`
- Panel title, instructions
- Commit/discard buttons
- Status messages
- Close button
- Empty state

#### AssetDropZone (~20 strings)
- **Current status:** Already uses `useTranslations('media.dropZone')` and `useTranslations('common.actions')`
- Drag-and-drop instructions
- File type labels ("Images", "Videos", "PDFs")
- File size limits
- Error messages
- Browse button label

#### AssetItem (~15 strings)
- **Current status:** Already uses `useTranslations('media.assetItem')` and `useTranslations('common.actions')`
- Remove/restore buttons
- Status indicators
- Asset type labels
- Duration/metadata display

#### SortableAssetList (~10 strings)
- Drag-and-drop accessibility announcements
- Reorder instructions
- Empty state messages

#### AssetRemoveConfirmDialog (~10 strings)
- Dialog title
- Confirmation message
- Button labels (Cancel, Remove)

---

## 5. Technical Approach

### 5.1 Translation Pattern

The media handling components already use a consistent pattern from the Item Management i18n implementation (REQ-E02-079):

```typescript
// Existing pattern (already implemented)
import { useTranslations } from 'next-intl';

function AssetDropZone() {
  const t = useTranslations('media.dropZone');
  const tCommon = useTranslations('common.actions');

  return (
    <>
      <p>{t('instructions')}</p>
      <button>{tCommon('browse')}</button>
    </>
  );
}
```

### 5.2 Translation Keys Structure

Based on investigation, the `media.*` namespace already exists:

```json
{
  "media": {
    "assetPanel": {
      "title": "Manage Assets",
      "instructions": "Add, remove, or reorder media files",
      "commit": "Save Changes",
      "discard": "Discard Changes",
      "empty": "No assets yet"
    },
    "dropZone": {
      "instructions": "Drag and drop files here",
      "browse": "Browse files",
      "types": {
        "images": "Images",
        "videos": "Videos",
        "pdfs": "PDFs"
      },
      "maxSize": "Max file size: {size}MB",
      "error": {
        "fileType": "Unsupported file type",
        "fileSize": "File too large",
        "maxFiles": "Maximum files exceeded"
      }
    },
    "assetItem": {
      "remove": "Remove",
      "restore": "Restore",
      "pending": "Pending",
      "markedForRemoval": "Marked for removal"
    },
    "gallery": {
      "previous": "Previous",
      "next": "Next",
      "fullScreen": "Full screen",
      "exitFullScreen": "Exit full screen",
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF",
        "link": "Link"
      },
      "duration": "Duration: {duration}",
      "pages": "{count, plural, one {# page} other {# pages}}"
    }
  }
}
```

---

## 6. Implementation Tasks

### Task 1: Audit existing media namespace keys (Priority: High)

**Description:** Review the existing `media.*` namespace in `/messages/en.json` to identify which keys already exist and which need to be added.

**Changes Required:**
1. Read `/messages/en.json` and locate `media` namespace
2. Compare against component string requirements
3. Document missing keys that need to be added

**Acceptance Criteria:**
- [ ] Complete inventory of existing `media.*` keys
- [ ] List of missing keys identified
- [ ] Coordinate with Task 2E.1 for any `articles.media.*` keys

---

### Task 2: Update MediaGallery component (Priority: High)

**Description:** Replace any remaining hardcoded strings in MediaGallery with translation calls.

**File:** `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`

**Investigation Notes:**
- Already uses `useTranslations` at line 22
- MEDIA_TYPE_CONFIG at lines 78-103 uses `labelKey` pattern
- Need to verify if all strings are properly translated

**Changes Required:**
1. Verify `useTranslations('media.gallery')` is properly implemented
2. Check MEDIA_TYPE_CONFIG labels are using translation keys
3. Update navigation button labels
4. Update full-screen toggle labels
5. Update accessibility announcements

**Acceptance Criteria:**
- [ ] All hardcoded strings replaced
- [ ] Media type badges use translations
- [ ] Navigation controls use translations
- [ ] Accessibility labels translated
- [ ] Component renders correctly

---

### Task 3: Verify AssetPanel i18n implementation (Priority: High)

**Description:** Verify that AssetPanel's existing i18n implementation is complete and uses correct translation keys.

**File:** `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`

**Investigation Notes:**
- Already uses `useTranslations('media.assetPanel')` at line 57
- Already uses `useTranslations('common.actions')` at line 58
- Implementation appears complete from REQ-E02-079

**Changes Required:**
1. Verify all UI strings use translation calls
2. Check commit/discard button labels
3. Verify error messages use translations
4. Check empty state messages

**Acceptance Criteria:**
- [ ] All strings verified to use translations
- [ ] No hardcoded strings remain
- [ ] Component renders correctly with translations

---

### Task 4: Verify AssetDropZone i18n implementation (Priority: High)

**Description:** Verify that AssetDropZone's existing i18n implementation is complete and uses correct translation keys.

**File:** `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`

**Investigation Notes:**
- Already uses `useTranslations('media.dropZone')` at line 115
- Already uses `useTranslations('common.actions')` at line 116
- Uses `supportedTypesLabel` computed from translation keys at lines 176-182
- Implementation appears complete from REQ-E02-079

**Changes Required:**
1. Verify all UI strings use translation calls
2. Check file type labels use translations
3. Verify error messages use translations
4. Check drag-and-drop instructions

**Acceptance Criteria:**
- [ ] All strings verified to use translations
- [ ] File type labels use translation keys
- [ ] Error messages use translations
- [ ] No hardcoded strings remain

---

### Task 5: Verify AssetItem i18n implementation (Priority: High)

**Description:** Verify that AssetItem's existing i18n implementation is complete and uses correct translation keys.

**File:** `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx`

**Investigation Notes:**
- Already uses `useTranslations('media.assetItem')` at line 96
- Already uses `useTranslations('common.actions')` at line 97
- Implementation appears complete from REQ-E02-079

**Changes Required:**
1. Verify all UI strings use translation calls
2. Check button labels (remove, restore)
3. Verify status indicators use translations
4. Check accessibility labels

**Acceptance Criteria:**
- [ ] All strings verified to use translations
- [ ] Button labels use translations
- [ ] Status indicators use translations
- [ ] No hardcoded strings remain

---

### Task 6: Update SortableAssetList component (Priority: High)

**Description:** Add i18n support to SortableAssetList for drag-and-drop accessibility announcements.

**File:** `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`

**Changes Required:**
1. Add `useTranslations('media.assetList')` hook
2. Update accessibility announcements for drag-and-drop
3. Update any empty state messages
4. Update reorder instructions

**Acceptance Criteria:**
- [ ] i18n hooks added
- [ ] Accessibility announcements use translations
- [ ] Empty state messages use translations
- [ ] Component renders correctly

---

### Task 7: Update AssetRemoveConfirmDialog component (Priority: High)

**Description:** Add i18n support to AssetRemoveConfirmDialog.

**File:** `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`

**Changes Required:**
1. Add `useTranslations('media.removeDialog')` hook
2. Update dialog title
3. Update confirmation message
4. Update button labels (Cancel, Remove)

**Acceptance Criteria:**
- [ ] i18n hooks added
- [ ] Dialog title uses translation
- [ ] Confirmation message uses translation
- [ ] Button labels use translations

---

### Task 8: Add missing translation keys to en.json (Priority: High)

**Description:** Add any missing translation keys identified during the audit to `/messages/en.json`.

**File:** `/messages/en.json`

**Changes Required:**
1. Add missing keys to `media` namespace
2. Ensure consistency with existing patterns
3. Use ICU format for plurals and interpolation

**Acceptance Criteria:**
- [ ] All missing keys added
- [ ] Keys follow naming conventions
- [ ] ICU syntax correct
- [ ] JSON validates

---

## 7. Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### 7.1 Media Components (Modify/Verify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | Full component | Modify | Update remaining hardcoded strings |
| `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Full component | Verify | Confirm i18n complete |
| `/src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx` | Full component | Verify | Confirm i18n complete |
| `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | Full component | Verify | Confirm i18n complete |
| `/src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx` | Full component | Modify | Add i18n hooks |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Full component | Modify | Add i18n hooks |

### 7.2 Translation Files (Modify)

| File | Target | Type | Notes |
|------|--------|------|-------|
| `/messages/en.json` | `media` namespace | Modify | Add missing keys |

---

## 8. Dependencies

### 8.1 Depends On (Completed First)

| Request | Dependency Type | Status |
|---------|-----------------|--------|
| Epic 1 Foundation | next-intl setup, useTranslations hook | Complete |
| **REQ-E02-079** (Sub-Epic 2D) | `media.*` namespace established | Complete |
| **REQ-E02-070** (Task 2E.1) | `articles.media.*` keys if needed | Must complete first |

### 8.2 Blocks (Requires This First)

| Request | What This Provides |
|---------|-------------------|
| **REQ-E02-075** (Task 2E.6) | Media component strings ready for translation generation |

### 8.3 Parallel Safety

- **Files touched**: 6 component files in `/src/components/ItemManager/`, 1 translation file
- **Conflicts with**: None - media components are isolated
- **Safe to parallelize with**: Tasks 2E.2, 2E.4, 2E.5 (different component sets)

### 8.4 External Dependencies

- `next-intl` package (from Epic 1)

---

## 9. Risks and Considerations

### 9.1 Potential Side Effects

| Risk | Impact | Mitigation |
|------|--------|------------|
| AssetPanel components already i18n'd | Low | Verify implementation, minimal changes needed |
| Missing translation keys | Medium | Audit first, add keys before component updates |
| Media type label consistency | Low | Ensure labels match across all components |

### 9.2 Testing Requirements

- Manual testing of MediaGallery navigation
- Test drag-and-drop functionality in AssetPanel
- Verify file upload with various media types
- Test AssetDropZone with drag-and-drop
- Test AssetRemoveConfirmDialog
- Verify accessibility announcements with screen reader

### 9.3 Open Questions

- [ ] Are all media type labels in MediaGallery using translation keys?
- [ ] Should SortableAssetList use `media.assetList` or `media.assetPanel` namespace?
- [ ] Are there additional error messages in file upload that need translation?

---

## 10. Out of Scope

- Creating new translation keys (namespace structure from Task 2E.1)
- Actual translations to other languages (handled by Task 2E.6)
- ImageCropper/VideoTrimmer updates (handled by Task 2E.4)
- Instructions pages (handled by Task 2E.5)
- Editor components (handled by Task 2E.2)
- PhotoViewer/PDFViewer components (likely already handled)

---

## 11. Verification Checklist

### Pre-Implementation
- [ ] Audit `media.*` namespace keys in en.json
- [ ] Identify missing keys
- [ ] Verify AssetPanel family already has i18n from REQ-E02-079

### Implementation
- [ ] MediaGallery strings replaced
- [ ] AssetPanel i18n verified complete
- [ ] AssetDropZone i18n verified complete
- [ ] AssetItem i18n verified complete
- [ ] SortableAssetList i18n added
- [ ] AssetRemoveConfirmDialog i18n added
- [ ] Missing keys added to en.json

### Post-Implementation
- [ ] TypeScript compilation succeeds
- [ ] Build completes without errors
- [ ] All components render correctly with translations
- [ ] Drag-and-drop functionality works
- [ ] File upload works correctly
- [ ] Add `@lastModified` comment with REQ-E02-072

---

## 12. References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **Namespace Task:** `/docs/REQ-E02-070-create-articles-namespace-structure-overview.md`
- **Item Management i18n (REQ-E02-079):** Reference for AssetPanel family pattern
- **next-intl Docs:** https://next-intl-docs.vercel.app/docs/usage/messages

---

*Document generated: 2026-01-22 17:08*
*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
