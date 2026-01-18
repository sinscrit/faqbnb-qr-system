# REQ-105: Content Creation Step - Implementation Breakdown

**Generated:** 2026-01-05 12:30:00 UTC
**Last Modified:** 2026-01-05 12:30:00 UTC
**Request Reference:** docs/gen_requests.md - Request #105
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 4, Task 4.1)

---

## Overview

This document provides a comprehensive implementation breakdown for the Content Creation Step component (`ContentCreationStep.tsx`). This is Step 6 of the Item Creation Workflow and serves as the critical bridge between the workflow's configuration steps (1-5) and the preview/save step (7).

The ContentCreationStep wraps the existing `ItemCapture` component, configuring it based on the user's prior workflow selections (content type, content source) and transforming its output (`ItemRecord`) into the workflow's `ContentPiece` format.

---

## Technical Context

### Phase & Task Location

| Attribute | Value |
|-----------|-------|
| **Phase** | 4 - Content Creation & Preview (6-7) |
| **Task ID** | 4.1 |
| **Effort Estimate** | 1.5 days |
| **Dependencies** | Phase 1-3 complete, ItemCapture component functional |
| **Successor** | Task 4.2 - PreviewSaveStep |

### Relevant Codebase Patterns

| Pattern | Location | Description |
|---------|----------|-------------|
| Step Component Structure | `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Props interface, layout, Continue button pattern |
| ItemCapture Integration | `src/components/ItemCapture/ItemCapture.tsx` | `onComplete(record: ItemRecord)`, `onCancel()`, `config` prop |
| State Management | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `addContentPiece()`, `goToStep()`, `state.currentItem` |
| Type Definitions | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `ContentPiece`, `ContentType`, `ContentData` |
| ItemCapture Types | `src/components/ItemCapture/ItemCapture.types.ts` | `ItemRecord`, `MediaItem`, `ItemCaptureConfig` |

---

## Scope of Work

### Primary Objective

Create a wrapper component that:
1. Renders ItemCapture with configuration derived from workflow state
2. Maps the selected `contentType` to appropriate `allowedMediaTypes`
3. Transforms `ItemRecord` output to `ContentPiece` format
4. Dispatches content to workflow state and navigates to preview-save step
5. Handles cancel navigation back to content-type-selection step

### What This Task DOES NOT Include

- Changes to ItemCapture component (already complete)
- Preview/save functionality (Task 4.2)
- Multi-content item support (Phase 5)
- QR code generation (Phase 6)

---

## Detailed Requirements

### 1. Component Structure

```typescript
// Props Interface
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

### 2. ContentType to MediaTypes Mapping

The component must map workflow `ContentType` to `ItemCaptureConfig.allowedMediaTypes`:

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
      // Text uses ItemCapture's text editor, no media types needed
      return [];
    case 'url':
      // URL uses ItemCapture's URL input, no media types needed
      return [];
    default:
      return ['video', 'image', 'pdf'];
  }
}
```

### 3. ItemRecord to ContentPiece Transformation

Transform ItemCapture output to workflow format:

```typescript
function transformRecordToContentPiece(
  record: ItemRecord,
  contentType: ContentType
): ContentPiece {
  const id = crypto.randomUUID();
  const order = 0; // First piece in this creation step

  let data: ContentData;

  switch (contentType) {
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
    case 'photo': {
      const imageMedia = record.media.find(m => m.type === 'image');
      if (!imageMedia) throw new Error('No photo found in record');
      data = { type: 'photo', file: imageMedia.file };
      break;
    }
    case 'pdf': {
      const pdfMedia = record.media.find(m => m.type === 'pdf');
      if (!pdfMedia) throw new Error('No PDF found in record');
      data = {
        type: 'pdf',
        file: pdfMedia.file,
        pageCount: pdfMedia.metadata.pageCount,
      };
      break;
    }
    case 'text': {
      data = { type: 'text', text: record.instructions || '' };
      break;
    }
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
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }

  // Get thumbnail from first media item if available
  const thumbnail = record.media[0]?.thumbnail;

  return {
    id,
    type: contentType,
    data,
    order,
    thumbnail,
  };
}
```

### 4. ItemCapture Configuration

Build configuration based on workflow state:

```typescript
function buildItemCaptureConfig(
  contentType: ContentType,
  contentSource: 'existing' | 'create-new'
): ItemCaptureConfig {
  return {
    allowedMediaTypes: mapContentTypeToMediaTypes(contentType),
    maxVideoDuration: 120, // 2 minutes
    maxFileSize: 100 * 1024 * 1024, // 100MB
    debug: process.env.NODE_ENV === 'development',
    // Note: contentSource affects UI behavior within ItemCapture
    // 'existing' = upload/paste mode, 'create-new' = capture/record mode
  };
}
```

### 5. Component Implementation Pattern

```typescript
'use client';

export function ContentCreationStep({
  currentContentType,
  currentContentSource,
  currentItem,
  onAddContent,
  onNext,
  onCancel,
  className,
}: ContentCreationStepProps) {
  // Build ItemCapture configuration
  const config = useMemo(
    () => buildItemCaptureConfig(currentContentType, currentContentSource),
    [currentContentType, currentContentSource]
  );

  // Handle ItemCapture completion
  const handleComplete = useCallback(
    (record: ItemRecord) => {
      try {
        const contentPiece = transformRecordToContentPiece(record, currentContentType);
        onAddContent(contentPiece);
        onNext();
      } catch (error) {
        console.error('Failed to transform ItemRecord:', error);
        // Error handling - could show toast/alert
      }
    },
    [currentContentType, onAddContent, onNext]
  );

  // Handle cancel - return to content type selection
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <div className={cn('flex flex-col flex-1', className)}>
      <ItemCapture
        config={config}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
```

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | Main component implementation |

### Files to MODIFY

| File | Changes Required |
|------|------------------|
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Add export for ContentCreationStep |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Import ContentCreationStep, replace StepPlaceholder |

### Files to READ (Reference Only)

| File | Purpose |
|------|---------|
| `src/components/ItemCapture/ItemCapture.tsx` | Understand onComplete/onCancel interface |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord, MediaItem, ItemCaptureConfig types |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ContentPiece, ContentType, ContentData types |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | addContentPiece action, state structure |
| `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx` | Step component patterns |

---

## Integration Points

### ItemCreationWorkflow.tsx Integration

Replace the StepPlaceholder with ContentCreationStep:

```typescript
// In renderCurrentStep() switch statement
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

### Step Barrel Export Update

```typescript
// In steps/index.ts
export { ContentCreationStep } from './ContentCreationStep';
export type { ContentCreationStepProps } from './ContentCreationStep';
```

---

## Implementation Tasks

### Task 4.1.1: Create ContentCreationStep Component [0.5 days]

- [ ] Create `ContentCreationStep.tsx` with proper file header and documentation
- [ ] Define `ContentCreationStepProps` interface
- [ ] Implement `mapContentTypeToMediaTypes()` utility function
- [ ] Implement `buildItemCaptureConfig()` utility function
- [ ] Render ItemCapture with computed configuration

### Task 4.1.2: Implement Transform Logic [0.5 days]

- [ ] Implement `transformRecordToContentPiece()` function
- [ ] Handle all content types: video, photo, pdf, text, url
- [ ] Extract thumbnail from media items where available
- [ ] Handle edge cases and error conditions

### Task 4.1.3: Integrate with Workflow [0.25 days]

- [ ] Update barrel export in `steps/index.ts`
- [ ] Replace StepPlaceholder in `ItemCreationWorkflow.tsx`
- [ ] Pass required props from workflow state
- [ ] Connect navigation callbacks (onNext → preview-save, onCancel → content-type-selection)

### Task 4.1.4: Testing and Validation [0.25 days]

- [ ] Test video content type flow (record and upload)
- [ ] Test photo content type flow (capture and upload)
- [ ] Test PDF content type flow (upload)
- [ ] Test text content type flow (write)
- [ ] Test URL content type flow (paste)
- [ ] Verify cancel navigation returns to content-type-selection
- [ ] Verify content piece appears in workflow state after completion

---

## Acceptance Criteria

From REQ-105:

- [x] Content creation step displays when user advances from content source selection
- [ ] Content capture interface adapts based on item type, specific item, and content source selections
- [ ] Captured content is transformed into the expected format for subsequent workflow steps
- [ ] Cancel action returns user to previous step without data loss
- [ ] Content validation occurs before allowing progression to next step

### Additional Technical Criteria

- [ ] ItemCapture receives configuration matching selected content type
- [ ] ContentPiece is correctly structured per `ContentPiece` interface
- [ ] Workflow state reflects added content after completion
- [ ] Component follows existing step component patterns (layout, styling)
- [ ] No console errors or warnings during normal operation

---

## Error Handling

### Expected Error Scenarios

| Scenario | Handling |
|----------|----------|
| ItemCapture onComplete returns malformed record | Log error, show user-friendly message, do not navigate |
| Missing expected media type in record | Throw descriptive error, caught by try/catch in handleComplete |
| URL content type but no URL in record | Throw error with specific message |
| User cancels mid-capture | Call onCancel(), workflow handles navigation |

### Error Recovery

- Errors during transformation do NOT lose user's captured content (ItemCapture state persists)
- User can retry or cancel from error state
- Development mode logs detailed errors for debugging

---

## Dependencies

### Required Before Implementation

1. **ItemCapture Component** - Must be fully functional with all content types
2. **Workflow Steps 1-5** - Must be able to navigate to content-creation step
3. **useWorkflowState hook** - Must expose `addContentPiece` action

### External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| React | 18.x | useCallback, useMemo hooks |
| ItemCapture | (internal) | Content capture functionality |
| cn (clsx/tailwind-merge) | (internal) | Class name utilities |

---

## Testing Strategy

### Unit Tests

```typescript
describe('ContentCreationStep', () => {
  describe('mapContentTypeToMediaTypes', () => {
    it('returns [video] for video content type', () => { ... });
    it('returns [image] for photo content type', () => { ... });
    it('returns [pdf] for pdf content type', () => { ... });
    it('returns [] for text content type', () => { ... });
    it('returns [] for url content type', () => { ... });
  });

  describe('transformRecordToContentPiece', () => {
    it('transforms video record correctly', () => { ... });
    it('transforms photo record correctly', () => { ... });
    it('transforms text record correctly', () => { ... });
    it('throws for missing media in record', () => { ... });
  });

  describe('Component', () => {
    it('renders ItemCapture with correct config', () => { ... });
    it('calls onAddContent and onNext on completion', () => { ... });
    it('calls onCancel when ItemCapture cancel triggered', () => { ... });
  });
});
```

### Integration Tests

- Verify full workflow from content-type-selection → content-creation → preview-save
- Verify content piece appears in workflow state
- Verify back navigation works from content-creation step

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemCapture output format mismatch | Low | High | Reference ItemCapture.types.ts directly, add defensive checks |
| Content source not properly affecting capture mode | Medium | Medium | Verify ItemCapture handles this via config or separate props |
| Thumbnail not generated for some content types | Medium | Low | Make thumbnail optional in ContentPiece, handle gracefully |
| Performance with large video files | Low | Medium | ItemCapture handles this internally; no additional handling needed |

---

## References

- [Implementation Plan: Item Creation Workflow](../prd/Plan-093-Item-Creation-Workflow.md)
- [PRD: Item Creation Workflow](../prd/PRD_Item_Creation_Workflow.md)
- [ItemCapture Implementation](../../src/components/ItemCapture/ItemCapture.tsx)
- [ItemCapture Types](../../src/components/ItemCapture/ItemCapture.types.ts)
- [Workflow Types](../../src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)

---

*Implementation Breakdown generated on 2026-01-05 for REQ-105: Content Creation Step*
