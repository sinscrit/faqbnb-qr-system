# REQ-262: Media Type Mismatch in Content Editor - Technical Overview

**Last Modified**: 2026-02-12 10:30 (System Time)

## Summary

This document provides a technical overview of the media type mismatch bug in the content editor, where photo content appears as text blocks instead of displaying correct media type icons and previews.

## Problem Statement

When a user adds a photo via the "Add Content" modal, saves the content, and views it later, it displays as a text block ("T Texte") instead of showing the photo preview with the correct media type indicator (photo icon).

## Root Cause Analysis

After investigating the codebase, the root cause is a **type system inconsistency** between different layers of the application:

### 1. Global TypeScript Type Mismatch

**File**: `/src/types/index.ts`

```typescript
export type LinkType = 'youtube' | 'pdf' | 'image' | 'text';
```

This type definition is **missing** `'video'` and `'url'` types that are used throughout the application.

### 2. Frontend Internal Types

**File**: `/src/components/InstructionEditor/InstructionEditor.types.ts`

```typescript
// ArticleLinkData - uses expanded type set
linkType: 'youtube' | 'pdf' | 'image' | 'text' | 'video' | 'url';

// ContentPieceState - uses frontend naming convention
type: 'video' | 'photo' | 'pdf' | 'text' | 'url';
```

### 3. Mapping Functions

**File**: `/src/components/InstructionEditor/InstructionEditor.tsx`

The mapping functions exist to convert between API types and frontend types:

```typescript
// API -> Frontend
function mapLinkTypeToContentType(linkType: string): ContentPieceState['type'] {
  case 'image': return 'photo';
  case 'video': return 'video';
  // etc.
}

// Frontend -> API
function mapContentTypeToLinkType(contentType: ContentPieceState['type']): string {
  case 'photo': return 'image';
  case 'video': return 'video';
  // etc.
}
```

### 4. Data Flow Issues

The issue manifests in multiple places:

1. **AddContentModal.tsx**: When adding photo content, uses `type: 'photo'`
2. **InstructionEditor.tsx**: `handleSave` calls `mapContentTypeToLinkType` converting `'photo'` -> `'image'`
3. **API route**: Saves `link_type: 'image'` to database
4. **GET API**: Returns `link_type: 'image'`
5. **Edit Page**: `fetchArticleData` reads `link.link_type`
6. **InstructionEditor**: `transformLinksToContentState` calls `mapLinkTypeToContentType('image')` -> `'photo'`
7. **ContentEditSection**: `toContentPiece` creates display data

The bug can occur if:
- The type conversion is not applied correctly at any step
- The fallback case returns incorrect type (defaulting to `'url'` or `'text'`)

### 5. Specific Issue Found

In the `mapLinkTypeToContentType` function, the default case returns `'url'`:

```typescript
function mapLinkTypeToContentType(linkType: string): ContentPieceState['type'] {
  switch (linkType) {
    case 'youtube':
    case 'video':
      return 'video';
    case 'image':
      return 'photo';
    case 'pdf':
      return 'pdf';
    case 'text':
      return 'text';
    default:
      return 'url';  // Fallback
  }
}
```

If an unexpected value is passed, it will not display as photo.

## Files Involved

| File | Role |
|------|------|
| `/src/types/index.ts` | Global type definitions (missing types) |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Type mapping functions, data transformation |
| `/src/components/InstructionEditor/InstructionEditor.types.ts` | Local type definitions |
| `/src/components/InstructionEditor/components/AddContentModal.tsx` | Content creation |
| `/src/components/InstructionEditor/components/ContentEditSection.tsx` | Content display transformation |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Content card rendering |
| `/src/app/api/admin/articles/[articleId]/route.ts` | API endpoint for article CRUD |

## Solution Approach

1. **Update global LinkType**: Add missing types `'video'` and `'url'`
2. **Verify mapping functions**: Ensure bi-directional mapping is complete and correct
3. **Add logging**: Add debug logging to trace type transformations
4. **Test all content types**: Verify each type (photo, video, pdf, text, url) saves and displays correctly

## Impact

- **User Impact**: Users cannot visually distinguish content types in the content list
- **Workflow Impact**: Content management becomes confusing, may lead to accidental deletion/modification
- **Data Integrity**: No data loss, but display issues affect UX

## Related Requirements

- REQ-214: Dedicated Single-Page Edit Experience
- REQ-213: Edit Instruction Flow
- REQ-146: Upload API Endpoint

## Next Steps

See `req-262-media-type-mismatch-detailed.md` for implementation tasks.
