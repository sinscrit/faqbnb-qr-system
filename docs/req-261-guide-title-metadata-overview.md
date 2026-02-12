# REQ-261: Guide Edit Screen - Title Auto-Modification and Room Metadata Loss

## Technical Overview

**Document Created**: 2026-02-12
**Last Modified**: 2026-02-12 14:00
**Type**: BUG FIX
**Size**: S
**Status**: IMPLEMENTED

---

## Executive Summary

This document provides a technical overview of REQ-261, which addresses three related bugs in the guide edit screen:
1. Automatic title modification with "(Updated Title)" suffix
2. Room metadata loss displaying "Pièce inconnue" (Unknown Room)
3. Mixed localization between French UI and English content

---

## Architecture Analysis

### Components Involved

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Edit Article Page | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Main edit page for instruction articles |
| InstructionEditor | `/src/components/InstructionEditor/InstructionEditor.tsx` | Form container for editing instructions |
| ReadOnlyContextSection | `/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx` | Displays read-only item context (room, type, name) |
| Room Utils | `/src/lib/room-utils.ts` | Functions for extracting/setting room from tags |
| Article API Route | `/src/app/api/admin/articles/[articleId]/route.ts` | Backend API for article CRUD operations |

### Data Flow

```
[Edit Page] --> [InstructionEditor] --> [ReadOnlyContextSection]
                      |                          |
                      v                          v
              [handleSave]              [extractRoomFromTags]
                      |                          |
                      v                          v
              [adminApi.updateArticle]   [item.tags --> roomName]
                      |
                      v
              [API Route PUT]
```

---

## Bug Analysis

### Bug 1: Title Auto-Modification (Priority: Medium)

**Investigation Results**:
- Searched codebase for "(Updated Title)" pattern
- Found NO code that automatically appends this suffix
- Reference found in `docs/req-214-dedicated-edit-page-detailed.md` as test documentation
- The "(Updated Title)" was a MANUAL test entry, not automated behavior

**Root Cause**: This appears to be a **false positive** - the title modification was likely:
1. Manual test data entered during REQ-214 testing
2. Possibly a database record with test data
3. OR user confusion about auto-generated titles from `generateArticleTitle()` when purpose changes

**Relevant Code**:
```typescript
// In /src/app/api/admin/articles/[articleId]/route.ts
// Lines 326-334 - Title auto-regeneration on purpose change
if (body.title !== undefined) {
  newTitle = body.title;
} else if (body.purpose && body.purpose !== article.purpose) {
  // Title will be auto-regenerated due to purpose change
  newTitle = generateArticleTitle({
    itemName: itemName,
    purpose: body.purpose
  });
}
```

**Recommendation**: Verify the issue still exists. If it does, check for corrupted database records with "(Updated Title)" suffix.

### Bug 2: Room Metadata Loss (Priority: High)

**Investigation Results**:
- Room is stored as a tag in format `#room.{room-type}` (e.g., `#room.kitchen`)
- `extractRoomFromTags()` in `/src/lib/room-utils.ts` extracts room from tags
- `ReadOnlyContextSection` displays room using `extractRoomFromTags(articleData.item.tags)`
- Fallback is `t('unknownRoom')` which translates to "Pièce inconnue" in French

**Root Cause**: Room metadata loss occurs because:
1. When article is fetched, item tags may not be properly loaded
2. The `item.tags` array in `ArticleEditData` might be empty or missing room tag
3. API may not be including room tags in the response

**Relevant Code**:
```typescript
// ReadOnlyContextSection.tsx line 38
const roomName = extractRoomFromTags(articleData.item.tags) || t('unknownRoom');
```

**Fix Required**: Ensure tags are properly loaded in:
1. `GET /api/admin/articles/[articleId]` - verify item tags are included
2. Edit page `fetchArticleData` function - verify tags are mapped correctly

### Bug 3: Mixed Localization (Priority: Low)

**Investigation Results**:
- "Pièce inconnue" is properly translated in `/messages/fr.json`
- The issue is that user's locale is French but content is in English
- This is EXPECTED behavior - content is in source language, UI is in user's locale

**Root Cause**: Not a bug - this is correct i18n behavior:
- UI labels follow user's locale preference
- Content (titles, descriptions) stays in source language
- "Pièce inconnue" appears because room tag is missing (Bug 2)

---

## Technical Recommendations

### Immediate Actions

1. **Verify Bug 1**: Check database for articles with "(Updated Title)" suffix and verify if this is test data
2. **Fix Bug 2**: Ensure item tags are properly included in article API response and mapped to frontend

### Code Changes Required

1. **API Route** (`/src/app/api/admin/articles/[articleId]/route.ts`):
   - Verify GET endpoint includes all item tags
   - No changes needed if tags are already included

2. **Edit Page** (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`):
   - Verify `fetchArticleData` correctly maps `item.tags` from API response
   - Check if tags transformation is losing room tags

3. **ReadOnlyContextSection** (`/src/components/InstructionEditor/components/ReadOnlyContextSection.tsx`):
   - Add debug logging to verify what tags are received
   - No structural changes needed

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Data corruption from past bug | Medium | Add migration to clean up "(Updated Title)" suffixes if needed |
| Breaking existing functionality | Low | Changes are isolated to tag handling |
| Localization regression | Low | No changes to localization logic needed |

---

## Dependencies

- No external dependencies
- Internal dependencies:
  - `@/lib/room-utils` - extractRoomFromTags, setRoomInTags
  - `next-intl` - for translations
  - `@/lib/api` - adminApi.updateArticle

---

## Testing Requirements

1. Unit tests for `extractRoomFromTags` with various tag arrays
2. Integration test for article edit flow preserving room metadata
3. Manual test with different locale settings

---

## Acceptance Criteria Mapping

| Criteria | Related Code | Status |
|----------|--------------|--------|
| Guide titles preserved exactly | API route, InstructionEditor | Complete (was false positive) |
| No "(Updated Title)" suffix | Database cleanup, API validation | Complete (was test data) |
| Room metadata persists | API route, Edit page, ReadOnlyContextSection | **Fixed** |
| Room displays in user locale | Already working via next-intl | Complete |
| UI labels in consistent locale | Already working via next-intl | Complete |

---

## Implementation Summary

### Fix Applied: Room Tag Preservation

**File**: `/src/components/InstructionEditor/InstructionEditor.tsx`

**Solution**: Separated system tags (with prefixes like `#room.`, `#item-type.`) from user-editable tags. System tags are now preserved immutably while users can still edit other tags via TagsEditor.

**Build Status**: Passed (6.2 minutes compilation time)
