# REQ-105: Content Creation Step - Detailed Task Breakdown

**Generated:** 2026-01-05 13:15:00 UTC
**Last Modified:** 2026-01-05 15:38:00 UTC
**Status:** ✅ COMPLETED
**Request Reference:** docs/gen_requests.md - Request #105
**Overview Document:** docs/REQ-105-content-creation-step-overview.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 4, Task 4.1)

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the Content Creation Step component (`ContentCreationStep.tsx`). This is Step 6 of the Item Creation Workflow, serving as the bridge between workflow configuration steps (1-5) and the preview/save step (7).

The implementation wraps the existing `ItemCapture` component, configures it based on workflow state, and transforms its output (`ItemRecord`) into the workflow's `ContentPiece` format.

**Estimated Total Effort:** 1.5 days (approximately 12 hours)

---

## Prerequisites Checklist

Before starting implementation, verify:

- [x] ItemCapture component is fully functional (`src/components/ItemCapture/ItemCapture.tsx`)
- [x] Workflow steps 1-5 are complete and navigable
- [x] `useWorkflowState` hook exposes `addContentPiece` action
- [x] `ContentPiece` and related types are defined in `ItemCreationWorkflow.types.ts`

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | Main component implementation |

### Files to MODIFY

| File | Changes Required | Lines Affected |
|------|------------------|----------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Add export for ContentCreationStep | ~lines 40-43 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import ContentCreationStep, replace StepPlaceholder | ~lines 19, 205-206 |

### Files to READ (Reference Only)

| File | Purpose |
|------|---------|
| `src/components/ItemCapture/ItemCapture.tsx` | Understand onComplete/onCancel interface |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord, MediaItem, ItemCaptureConfig types |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ContentPiece, ContentType, ContentData types |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | addContentPiece action, state structure |
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Step component patterns |

---

## Task Breakdown

### Task 4.1.1: Create Component File Structure and Props Interface

**Story Points:** 0.5 (approximately 2-3 hours)
**Dependencies:** None
**Output:** `ContentCreationStep.tsx` with file header, imports, and props interface

#### Subtasks

##### 4.1.1.1: Create ContentCreationStep.tsx with file header
**Time Estimate:** 15 minutes

**Steps:**
1. Create new file at `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`
2. Add `'use client';` directive
3. Add file header with:
   - Module description
   - Module path reference
   - See reference to REQ-105 overview document
   - Last modified timestamp

**Verification:**
- [ ] File exists at correct location
- [ ] `'use client'` is first line
- [ ] Header matches established pattern (see ContentSourceStep.tsx)

**Code Pattern:**
```typescript
'use client';

/**
 * ContentCreationStep Component
 *
 * Step 6 of the item creation workflow.
 * Wraps ItemCapture component and transforms its output to ContentPiece format.
 *
 * @module ItemCreationWorkflow/components/steps/ContentCreationStep
 * @see docs/REQ-105-content-creation-step-overview.md
 * @lastModified 2026-01-05
 */
```

##### 4.1.1.2: Add required imports
**Time Estimate:** 10 minutes

**Steps:**
1. Import React hooks: `useCallback`, `useMemo`
2. Import `cn` utility from `@/lib/utils`
3. Import `ItemCapture` component from `@/components/ItemCapture`
4. Import required types from relative paths:
   - From `../../ItemCreationWorkflow.types`: `ContentType`, `ContentPiece`, `ContentData`, `CurrentItemState`
   - From `@/components/ItemCapture/ItemCapture.types`: `ItemRecord`, `MediaItem`, `ItemCaptureConfig`

**Verification:**
- [ ] All imports resolve without TypeScript errors
- [ ] No unused imports

##### 4.1.1.3: Define ContentCreationStepProps interface
**Time Estimate:** 20 minutes

**Steps:**
1. Create props interface following existing step patterns
2. Include all required props as specified in overview:
   - `currentContentType: ContentType`
   - `currentContentSource: 'existing' | 'create-new'`
   - `currentItem: CurrentItemState`
   - `onAddContent: (piece: ContentPiece) => void`
   - `onNext: () => void`
   - `onCancel: () => void`
   - `className?: string`
3. Add JSDoc comments for each prop

**Verification:**
- [ ] Interface compiles without errors
- [ ] All props have JSDoc documentation
- [ ] Export the interface

**Expected Code:**
```typescript
export interface ContentCreationStepProps {
  /** Current content type selection from workflow state */
  currentContentType: ContentType;
  /** Current content source from workflow state */
  currentContentSource: 'existing' | 'create-new';
  /** Current item state for context (room, itemType, specificItem, itemName) */
  currentItem: CurrentItemState;
  /** Handler to add content piece to workflow state */
  onAddContent: (piece: ContentPiece) => void;
  /** Handler to navigate to next step (preview-save) */
  onNext: () => void;
  /** Handler to navigate back (cancel) */
  onCancel: () => void;
  /** Optional CSS class */
  className?: string;
}
```

---

### Task 4.1.2: Implement Utility Functions

**Story Points:** 0.5 (approximately 2-3 hours)
**Dependencies:** Task 4.1.1
**Output:** Helper functions for content type mapping and configuration building

#### Subtasks

##### 4.1.2.1: Implement mapContentTypeToMediaTypes function
**Time Estimate:** 30 minutes

**Steps:**
1. Create function that maps workflow `ContentType` to `ItemCaptureConfig.allowedMediaTypes`
2. Handle all five content types: video, photo, pdf, text, url
3. Return empty array for text and url (they don't use media types)
4. Include fallback default case returning all types

**Verification:**
- [ ] Function handles all ContentType values
- [ ] Returns correct array for each type
- [ ] TypeScript types are correct

**Expected Code:**
```typescript
function mapContentTypeToMediaTypes(
  contentType: ContentType
): ('video' | 'image' | 'pdf')[] {
  switch (contentType) {
    case 'video':
      return ['video'];
    case 'photo':
      return ['image'];
    case 'pdf':
      return ['pdf'];
    case 'text':
      return [];
    case 'url':
      return [];
    default:
      return ['video', 'image', 'pdf'];
  }
}
```

**Test Cases:**
| Input | Expected Output |
|-------|-----------------|
| `'video'` | `['video']` |
| `'photo'` | `['image']` |
| `'pdf'` | `['pdf']` |
| `'text'` | `[]` |
| `'url'` | `[]` |

##### 4.1.2.2: Implement buildItemCaptureConfig function
**Time Estimate:** 25 minutes

**Steps:**
1. Create function accepting `contentType` and `contentSource` parameters
2. Return `ItemCaptureConfig` object with:
   - `allowedMediaTypes` from mapContentTypeToMediaTypes
   - `maxVideoDuration: 120` (2 minutes)
   - `maxFileSize: 100 * 1024 * 1024` (100MB)
   - `debug: process.env.NODE_ENV === 'development'`

**Verification:**
- [ ] Function returns valid ItemCaptureConfig
- [ ] Config values match requirements
- [ ] TypeScript types are correct

**Expected Code:**
```typescript
function buildItemCaptureConfig(
  contentType: ContentType,
  contentSource: 'existing' | 'create-new'
): ItemCaptureConfig {
  return {
    allowedMediaTypes: mapContentTypeToMediaTypes(contentType),
    maxVideoDuration: 120,
    maxFileSize: 100 * 1024 * 1024,
    debug: process.env.NODE_ENV === 'development',
  };
}
```

---

### Task 4.1.3: Implement Transform Logic

**Story Points:** 0.5 (approximately 2-3 hours)
**Dependencies:** Task 4.1.1
**Output:** transformRecordToContentPiece function with full type handling

#### Subtasks

##### 4.1.3.1: Implement transformRecordToContentPiece base structure
**Time Estimate:** 20 minutes

**Steps:**
1. Create function accepting `record: ItemRecord` and `contentType: ContentType`
2. Return type should be `ContentPiece`
3. Generate unique ID using `crypto.randomUUID()`
4. Set order to 0 (first piece in this creation step)
5. Extract thumbnail from first media item if available

**Verification:**
- [ ] Function signature is correct
- [ ] UUID generation works
- [ ] Basic structure returns valid ContentPiece shape

##### 4.1.3.2: Implement video content transformation
**Time Estimate:** 15 minutes

**Steps:**
1. Add case for `'video'` content type
2. Find video media item using `record.media.find(m => m.type === 'video')`
3. Throw descriptive error if no video found
4. Create `ContentData` with type, file, and duration from metadata

**Expected Code:**
```typescript
case 'video': {
  const videoMedia = record.media.find(m => m.type === 'video');
  if (!videoMedia) throw new Error('No video found in record');
  data = {
    type: 'video',
    file: videoMedia.file,
    duration: videoMedia.metadata.duration,
  };
  break;
}
```

##### 4.1.3.3: Implement photo content transformation
**Time Estimate:** 10 minutes

**Steps:**
1. Add case for `'photo'` content type
2. Find image media item using `record.media.find(m => m.type === 'image')`
3. Throw descriptive error if no photo found
4. Create `ContentData` with type and file

##### 4.1.3.4: Implement PDF content transformation
**Time Estimate:** 15 minutes

**Steps:**
1. Add case for `'pdf'` content type
2. Find PDF media item using `record.media.find(m => m.type === 'pdf')`
3. Throw descriptive error if no PDF found
4. Create `ContentData` with type, file, and pageCount from metadata

##### 4.1.3.5: Implement text content transformation
**Time Estimate:** 10 minutes

**Steps:**
1. Add case for `'text'` content type
2. Use `record.instructions` for text content
3. Default to empty string if instructions is undefined

**Expected Code:**
```typescript
case 'text': {
  data = { type: 'text', text: record.instructions || '' };
  break;
}
```

##### 4.1.3.6: Implement URL content transformation
**Time Estimate:** 20 minutes

**Steps:**
1. Add case for `'url'` content type
2. Find URL media item using `record.media.find(m => m.type === 'url')`
3. Throw descriptive error if no URL found
4. Create `ContentData` with type, url, title, thumbnailUrl, and faviconUrl from metadata

**Expected Code:**
```typescript
case 'url': {
  const urlMedia = record.media.find(m => m.type === 'url');
  if (!urlMedia) throw new Error('No URL found in record');
  data = {
    type: 'url',
    url: urlMedia.metadata.url || '',
    title: urlMedia.metadata.pageTitle,
    thumbnailUrl: urlMedia.metadata.thumbnailUrl,
    faviconUrl: urlMedia.metadata.faviconUrl,
  };
  break;
}
```

##### 4.1.3.7: Add error handling and default case
**Time Estimate:** 10 minutes

**Steps:**
1. Add default case that throws error with unknown content type
2. Ensure all code paths return valid ContentPiece
3. Add try/catch guidance comment for consumer

**Verification:**
- [ ] All five content types handled
- [ ] Each case throws descriptive error when required data missing
- [ ] Default case throws for unknown types
- [ ] Function returns complete ContentPiece object

---

### Task 4.1.4: Implement Main Component

**Story Points:** 0.5 (approximately 2-3 hours)
**Dependencies:** Tasks 4.1.1, 4.1.2, 4.1.3
**Output:** Complete ContentCreationStep component with event handlers

#### Subtasks

##### 4.1.4.1: Create component function signature
**Time Estimate:** 10 minutes

**Steps:**
1. Export named function `ContentCreationStep`
2. Destructure all props from `ContentCreationStepProps`
3. Add type annotation for function

##### 4.1.4.2: Implement config computation with useMemo
**Time Estimate:** 15 minutes

**Steps:**
1. Use `useMemo` to compute ItemCapture configuration
2. Dependencies: `currentContentType`, `currentContentSource`
3. Call `buildItemCaptureConfig` inside memo

**Expected Code:**
```typescript
const config = useMemo(
  () => buildItemCaptureConfig(currentContentType, currentContentSource),
  [currentContentType, currentContentSource]
);
```

##### 4.1.4.3: Implement handleComplete callback
**Time Estimate:** 25 minutes

**Steps:**
1. Use `useCallback` for stable reference
2. Accept `record: ItemRecord` parameter
3. Wrap transformation in try/catch
4. On success: call `onAddContent` with transformed piece, then call `onNext`
5. On error: log to console (error handling - don't navigate)
6. Dependencies: `currentContentType`, `onAddContent`, `onNext`

**Expected Code:**
```typescript
const handleComplete = useCallback(
  (record: ItemRecord) => {
    try {
      const contentPiece = transformRecordToContentPiece(record, currentContentType);
      onAddContent(contentPiece);
      onNext();
    } catch (error) {
      console.error('Failed to transform ItemRecord:', error);
      // Error handling - could show toast/alert in future enhancement
    }
  },
  [currentContentType, onAddContent, onNext]
);
```

##### 4.1.4.4: Implement handleCancel callback
**Time Estimate:** 10 minutes

**Steps:**
1. Use `useCallback` for stable reference
2. Simply call `onCancel` prop
3. Dependencies: `onCancel`

##### 4.1.4.5: Implement component render
**Time Estimate:** 20 minutes

**Steps:**
1. Return wrapper div with flex layout
2. Apply `cn()` for className merging
3. Render `ItemCapture` with:
   - `config` prop from useMemo
   - `onComplete` = `handleComplete`
   - `onCancel` = `handleCancel`

**Expected Code:**
```typescript
return (
  <div className={cn('flex flex-col flex-1', className)}>
    <ItemCapture
      config={config}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  </div>
);
```

##### 4.1.4.6: Add default export
**Time Estimate:** 5 minutes

**Steps:**
1. Add `export default ContentCreationStep;` at end of file

**Verification:**
- [ ] Component renders without errors
- [ ] All handlers are memoized appropriately
- [ ] Props are correctly passed to ItemCapture
- [ ] Component follows established patterns (ContentSourceStep.tsx)

---

### Task 4.1.5: Update Barrel Export

**Story Points:** 0.25 (approximately 1 hour)
**Dependencies:** Task 4.1.4
**Output:** Updated index.ts with ContentCreationStep export

#### Subtasks

##### 4.1.5.1: Uncomment and update export in steps/index.ts
**Time Estimate:** 10 minutes

**File:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

**Steps:**
1. Locate commented export lines (~40-43)
2. Uncomment the export statement
3. Verify the path matches actual file location

**Changes:**
```typescript
// Before (lines 40-43):
// Task 4.1: ContentCreationStep
// export { ContentCreationStep } from './ContentCreationStep';
// export type { ContentCreationStepProps } from './ContentCreationStep';

// After:
// Task 4.1: ContentCreationStep
export { ContentCreationStep } from './ContentCreationStep';
export type { ContentCreationStepProps } from './ContentCreationStep';
```

**Verification:**
- [ ] Export statement is uncommented
- [ ] Import path is correct
- [ ] Type export is included
- [ ] File compiles without errors

---

### Task 4.1.6: Integrate with ItemCreationWorkflow

**Story Points:** 0.25 (approximately 1 hour)
**Dependencies:** Task 4.1.5
**Output:** ContentCreationStep rendered in workflow

#### Subtasks

##### 4.1.6.1: Add ContentCreationStep to imports
**Time Estimate:** 10 minutes

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Steps:**
1. Locate step imports (line 19)
2. Add `ContentCreationStep` to the import statement

**Changes:**
```typescript
// Before (line 19):
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep } from './components/steps';

// After:
import { RoomSelectionStep, ItemTypeStep, SpecificItemStep, ContentSourceStep, ContentTypeStep, ContentCreationStep } from './components/steps';
```

##### 4.1.6.2: Import addContentPiece from useWorkflowState
**Time Estimate:** 10 minutes

**Steps:**
1. Locate useWorkflowState destructuring (~lines 91-108)
2. Add `addContentPiece` to destructured values

**Changes:**
```typescript
// Add to the destructuring:
addContentPiece,
```

##### 4.1.6.3: Replace StepPlaceholder with ContentCreationStep
**Time Estimate:** 20 minutes

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Steps:**
1. Locate `case 'content-creation':` in renderCurrentStep (~line 205-206)
2. Replace StepPlaceholder with ContentCreationStep
3. Pass required props from workflow state

**Changes:**
```typescript
// Before (lines 205-206):
case 'content-creation':
  return <StepPlaceholder step="content-creation" {...commonProps} />;

// After:
case 'content-creation':
  return (
    <ContentCreationStep
      currentContentType={state.currentItem?.contentType ?? 'video'}
      currentContentSource={state.currentItem?.contentSource ?? 'existing'}
      currentItem={state.currentItem!}
      onAddContent={addContentPiece}
      onNext={() => goToStep('preview-save')}
      onCancel={() => goToStep('content-type-selection')}
    />
  );
```

**Verification:**
- [ ] Import statement updated correctly
- [ ] addContentPiece is destructured from hook
- [ ] ContentCreationStep case replaces StepPlaceholder
- [ ] All props are correctly mapped
- [ ] File compiles without errors

---

### Task 4.1.7: Manual Testing and Validation

**Story Points:** 0.25 (approximately 1-2 hours)
**Dependencies:** Task 4.1.6
**Output:** Verified working implementation

#### Subtasks

##### 4.1.7.1: Test video content type flow
**Time Estimate:** 15 minutes

**Steps:**
1. Start development server: `npm run dev`
2. Navigate to ItemCreationWorkflow
3. Complete steps 1-5, selecting "video" content type
4. Verify ItemCapture renders with video configuration
5. Record or upload a video
6. Verify navigation to preview-save step
7. Check browser console for errors

**Verification:**
- [ ] ItemCapture renders correctly
- [ ] Video recording/upload works
- [ ] Navigation proceeds to preview-save
- [ ] No console errors

##### 4.1.7.2: Test photo content type flow
**Time Estimate:** 15 minutes

**Steps:**
1. Repeat flow selecting "photo" content type
2. Verify ItemCapture shows photo capture options
3. Capture or upload a photo
4. Verify content piece is created

**Verification:**
- [ ] Photo capture interface renders
- [ ] Photo capture/upload works
- [ ] Content piece created correctly

##### 4.1.7.3: Test PDF content type flow
**Time Estimate:** 10 minutes

**Steps:**
1. Repeat flow selecting "pdf" content type
2. Verify ItemCapture shows PDF upload
3. Upload a PDF file
4. Verify page count is captured

**Verification:**
- [ ] PDF upload interface renders
- [ ] PDF upload works
- [ ] Page count metadata captured

##### 4.1.7.4: Test text content type flow
**Time Estimate:** 10 minutes

**Steps:**
1. Repeat flow selecting "text" content type
2. Verify text editor renders
3. Enter text instructions
4. Verify content piece is created with text

**Verification:**
- [ ] Text editor renders
- [ ] Text is captured correctly
- [ ] Content piece has text data

##### 4.1.7.5: Test URL content type flow
**Time Estimate:** 15 minutes

**Steps:**
1. Repeat flow selecting "url" content type
2. Verify URL input renders
3. Enter a valid URL (e.g., YouTube link)
4. Verify metadata is fetched
5. Verify content piece includes URL data

**Verification:**
- [ ] URL input renders
- [ ] URL preview fetches metadata
- [ ] Content piece has URL data with metadata

##### 4.1.7.6: Test cancel navigation
**Time Estimate:** 10 minutes

**Steps:**
1. Start content creation step
2. Click cancel/back
3. Verify return to content-type-selection step
4. Verify no data loss (previous selections preserved)

**Verification:**
- [ ] Cancel navigates to content-type-selection
- [ ] Previous step data is preserved
- [ ] No console errors

##### 4.1.7.7: Verify content piece in workflow state
**Time Estimate:** 10 minutes

**Steps:**
1. Complete a full content creation flow
2. Use React DevTools or debug logging to inspect workflow state
3. Verify ContentPiece structure matches expected format
4. Verify ID is unique UUID
5. Verify order is set correctly

**Verification:**
- [ ] ContentPiece appears in currentItem.content
- [ ] All fields populated correctly
- [ ] Thumbnail present (if applicable)

---

## Acceptance Criteria Verification

From REQ-105 and Overview Document:

| Criterion | Test Method | Pass/Fail |
|-----------|-------------|-----------|
| Content creation step displays when user advances from content source selection | Navigate through workflow | [ ] |
| Content capture interface adapts based on item type, specific item, and content source selections | Test with different content types | [ ] |
| Captured content is transformed into the expected format for subsequent workflow steps | Inspect ContentPiece structure | [ ] |
| Cancel action returns user to previous step without data loss | Test cancel behavior | [ ] |
| Content validation occurs before allowing progression to next step | Test with incomplete content | [ ] |
| ItemCapture receives configuration matching selected content type | Check config prop | [ ] |
| ContentPiece is correctly structured per interface | Verify type compliance | [ ] |
| Workflow state reflects added content after completion | Check state.currentItem.content | [ ] |
| Component follows existing step component patterns | Code review | [ ] |
| No console errors or warnings during normal operation | Check browser console | [ ] |

---

## Error Handling Matrix

| Error Scenario | Detection | Recovery | User Feedback |
|----------------|-----------|----------|---------------|
| ItemCapture returns malformed record | try/catch in handleComplete | Log error, stay on step | Console error (future: toast) |
| Missing expected media type in record | switch case throws | catch block handles | Console error with details |
| URL content type but no URL in record | switch case throws | catch block handles | Console error with specific message |
| User cancels mid-capture | onCancel callback fired | Navigate back | Step change only |
| ItemCapture config error | TypeScript compilation | Fix config | N/A (compile-time) |

---

## Rollback Plan

If issues are discovered after implementation:

1. **Revert barrel export:**
   - Comment out export lines in `steps/index.ts`

2. **Revert workflow integration:**
   - Replace ContentCreationStep with StepPlaceholder in `ItemCreationWorkflow.tsx`
   - Remove import and addContentPiece usage

3. **Component file:**
   - Can remain in place (commented exports prevent usage)
   - Or delete if fundamental issues discovered

---

## References

- [Implementation Plan: Item Creation Workflow](../prd/Plan-093-Item-Creation-Workflow.md)
- [PRD: Item Creation Workflow](../prd/PRD_Item_Creation_Workflow.md)
- [Overview Document: REQ-105](./REQ-105-content-creation-step-overview.md)
- [ItemCapture Implementation](../src/components/ItemCapture/ItemCapture.tsx)
- [ItemCapture Types](../src/components/ItemCapture/ItemCapture.types.ts)
- [Workflow Types](../src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)
- [ContentSourceStep Pattern Reference](../src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx)

---

## Document History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-05 13:15:00 UTC | 1.0 | Initial creation | Claude Agent |
| 2026-01-05 15:38:00 UTC | 2.0 | Implementation completed | Claude Agent |

---

## Implementation Summary

**Completed:** 2026-01-05 15:38:00 UTC

### Files Created
- `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`

### Files Modified
- `src/components/ItemCreationWorkflow/components/steps/index.ts` - Added exports
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` - Integrated ContentCreationStep

### Implementation Notes
- Component successfully wraps ItemCapture with workflow-specific configuration
- Utility functions: `mapContentTypeToMediaTypes`, `buildItemCaptureConfig`
- Transform function: `transformRecordToContentPiece` handles all 5 content types
- Memoized handlers for optimal performance
- Build verification passed with no TypeScript errors

---

*Detailed Task Breakdown generated on 2026-01-05 for REQ-105: Content Creation Step*
