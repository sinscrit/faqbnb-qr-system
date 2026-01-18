# REQ-053: Implement onComplete Assembly - Technical Overview

**Document Created:** 2025-12-31T22:30:00
**Last Modified:** 2025-12-31T22:30:00
**Request Reference:** `/docs/gen_requests.md` - Request #053
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.4
**Status:** Ready for Implementation

---

## 1. Summary

Implement the `onComplete` assembly logic that consolidates all captured wizard state into a final `ItemRecord` structure when the user completes the review step. This involves gathering metadata, content, and media into a unified record, generating unique identifiers (UUIDs) for the item and each media file, automatically determining the content type based on what was captured, adding a creation timestamp, and emitting the complete record to the parent component via the `onComplete` callback.

**Key Responsibility:** The onComplete assembly acts as the final data transformation layer, converting internal wizard state into the external `ItemRecord` contract defined in the integration specifications.

---

## 2. Context from Implementation Plan

### Phase 5 Position

```
5.1 ReviewStep ◄────► 5.2 MediaThumbnail
       │                 (can develop together)
       ▼
5.3 Validation Layer
       │
       ▼
5.4 onComplete Assembly   ◄── THIS TASK
       │
  ┌────┴────┐
  ▼         ▼
5.5       5.6
Perf     Test
Opt.    Harness
```

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, ItemRecord interface |
| Task 5.1 (ReviewStep) | Required | Provides the UI "Submit" button that triggers assembly |
| Task 5.3 (Validation Layer) | Required | Ensures data is valid before assembly proceeds |
| Task 5.2 (MediaThumbnail) | Parallel | Independent utility component |

### This Task Enables

Upon completion of the onComplete assembly:
- Complete ItemRecord objects are emitted to parent application
- Each item and media file receives unique UUIDs
- Content type is automatically determined
- Timestamps are correctly applied
- Wizard state is reset for capturing another item
- Phase 5 continues with performance optimization (5.5) and test harness (5.6)

---

## 3. Technical Approach

### 3.1 Assembly Architecture

The onComplete assembly will be implemented as a pure function that transforms internal state into the external `ItemRecord` contract:

```
src/components/ItemCapture/
├── utils/
│   ├── assembleItemRecord.ts      # Pure assembly function (NEW)
│   └── generateUUID.ts            # UUID generation utility (NEW or reuse)
├── hooks/
│   └── useItemCaptureState.ts     # Add SUBMIT action that triggers assembly
└── ItemCapture.tsx                # Calls onComplete with assembled record
```

### 3.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ReviewStep "Submit" Click                    │
│                              │                                   │
│                              ▼                                   │
│                   Validation Layer Check                         │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │ isValid?          │                        │
│                    ▼                   ▼                        │
│                  FALSE               TRUE                       │
│                    │                   │                        │
│           Show Errors              Assembly                     │
│             (stop)                    │                         │
│                                       ▼                         │
│                            ┌─────────────────────┐              │
│                            │ assembleItemRecord() │              │
│                            │                      │              │
│                            │ • Generate item UUID │              │
│                            │ • Generate media UUIDs│             │
│                            │ • Determine contentType│            │
│                            │ • Set createdAt       │             │
│                            │ • Structure record    │             │
│                            └──────────┬───────────┘              │
│                                       │                         │
│                                       ▼                         │
│                            onComplete(itemRecord)               │
│                                       │                         │
│                                       ▼                         │
│                            Reset wizard state                   │
│                            (ready for next item)                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 UUID Generation Strategy

Following the existing codebase pattern from `src/components/ItemForm.tsx:9-14`:

```typescript
/**
 * Generate a random UUID v4 following RFC 4122
 * Matches existing pattern used in ItemForm.tsx
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### 3.4 Content Type Determination Logic

```typescript
/**
 * Determine the contentType based on what content was captured
 */
function determineContentType(
  mediaItems: MediaItem[],
  instructions: string | undefined
): 'media' | 'text-only' | 'pdf-only' | 'mixed' {
  const hasMedia = mediaItems.some(item => item.type === 'video' || item.type === 'image');
  const hasPDF = mediaItems.some(item => item.type === 'pdf');
  const hasText = instructions && instructions.trim().length > 0;

  // Priority order for content type determination:
  if (hasMedia && (hasPDF || hasText)) {
    return 'mixed';
  }
  if (hasMedia) {
    return 'media';
  }
  if (hasPDF && !hasText) {
    return 'pdf-only';
  }
  if (hasText && !hasPDF) {
    return 'text-only';
  }
  if (hasPDF || hasText) {
    return 'mixed';
  }

  // Fallback (shouldn't reach here if validation passed)
  return 'media';
}
```

---

## 4. Output Interface Reference

From the Implementation Plan (`/docs/prd/item-capture-implementation-plan.md`):

```typescript
/**
 * The structured output returned via onComplete callback
 */
export interface ItemRecord {
  /** Local UUID generated for this item */
  id: string;

  /** User-provided title (required) */
  title: string;

  /** Optional location within property (e.g., "Kitchen", "Master Bathroom") */
  location?: string;

  /** Optional tags for categorization */
  tags?: string[];

  /** Optional appliance type from predefined list */
  applianceType?: ApplianceType;

  /** Type of content combination */
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';

  /** Array of captured/uploaded media items */
  media: MediaItem[];

  /** Optional markdown-formatted instructions */
  instructions?: string;

  /** Timestamp of record creation */
  createdAt: Date;
}

/**
 * Individual media item within an ItemRecord
 */
export interface MediaItem {
  /** Local UUID for this media item */
  id: string;

  /** Type of media */
  type: 'video' | 'image' | 'pdf';

  /** The actual file/blob data */
  file: File | Blob;

  /** Generated thumbnail (for preview purposes) */
  thumbnail?: Blob;

  /** Display order (0-indexed) */
  order: number;

  /** Type-specific metadata */
  metadata: MediaMetadata;
}
```

---

## 5. Assembly Function Interface

### 5.1 Input Types

```typescript
/**
 * Internal state structure from useItemCaptureState
 */
interface InternalState {
  metadata: {
    title: string;
    location?: string;
    tags?: string[];
    applianceType?: ApplianceType;
  };
  mediaItems: InternalMediaItem[];
  instructions: string;
}

/**
 * Internal media item (may have temporary IDs)
 */
interface InternalMediaItem {
  id: string;           // May be temporary internal ID
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}
```

### 5.2 Assembly Function Signature

```typescript
/**
 * Assembles the final ItemRecord from internal wizard state
 *
 * @param state - Internal wizard state containing metadata, media, and instructions
 * @param options - Assembly options (regenerateIds, etc.)
 * @returns Complete ItemRecord ready for emission to parent
 */
export function assembleItemRecord(
  state: InternalState,
  options?: {
    regenerateIds?: boolean;  // Generate new UUIDs (default: true)
    timestamp?: Date;         // Override timestamp (default: new Date())
  }
): ItemRecord;
```

### 5.3 Full Implementation

```typescript
import { generateUUID } from './generateUUID';
import type {
  ItemRecord,
  MediaItem,
  ApplianceType,
  MediaMetadata,
} from '../ItemCapture.types';

/**
 * Internal state structure from useItemCaptureState
 */
interface InternalMediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}

interface InternalState {
  metadata: {
    title: string;
    location?: string;
    tags?: string[];
    applianceType?: ApplianceType;
  };
  mediaItems: InternalMediaItem[];
  instructions: string;
}

interface AssemblyOptions {
  regenerateIds?: boolean;
  timestamp?: Date;
}

/**
 * Determine the contentType based on captured content
 */
function determineContentType(
  mediaItems: InternalMediaItem[],
  instructions: string | undefined
): 'media' | 'text-only' | 'pdf-only' | 'mixed' {
  const hasMedia = mediaItems.some(item => item.type === 'video' || item.type === 'image');
  const hasPDF = mediaItems.some(item => item.type === 'pdf');
  const hasText = instructions && instructions.trim().length > 0;

  if (hasMedia && (hasPDF || hasText)) {
    return 'mixed';
  }
  if (hasMedia) {
    return 'media';
  }
  if (hasPDF && !hasText) {
    return 'pdf-only';
  }
  if (hasText && !hasPDF) {
    return 'text-only';
  }
  if (hasPDF || hasText) {
    return 'mixed';
  }

  return 'media';
}

/**
 * Assembles the final ItemRecord from internal wizard state
 */
export function assembleItemRecord(
  state: InternalState,
  options: AssemblyOptions = {}
): ItemRecord {
  const {
    regenerateIds = true,
    timestamp = new Date(),
  } = options;

  // Generate new item UUID
  const itemId = generateUUID();

  // Transform media items with new UUIDs
  const transformedMedia: MediaItem[] = state.mediaItems.map((item, index) => ({
    id: regenerateIds ? generateUUID() : item.id,
    type: item.type,
    file: item.file,
    thumbnail: item.thumbnail,
    order: index, // Ensure order is sequential
    metadata: {
      ...item.metadata,
    },
  }));

  // Determine content type
  const contentType = determineContentType(
    state.mediaItems,
    state.instructions
  );

  // Build the final ItemRecord
  const record: ItemRecord = {
    id: itemId,
    title: state.metadata.title.trim(),
    contentType,
    media: transformedMedia,
    createdAt: timestamp,
  };

  // Add optional fields only if they have values
  if (state.metadata.location?.trim()) {
    record.location = state.metadata.location.trim();
  }

  if (state.metadata.tags && state.metadata.tags.length > 0) {
    record.tags = state.metadata.tags.filter(tag => tag.trim().length > 0);
  }

  if (state.metadata.applianceType) {
    record.applianceType = state.metadata.applianceType;
  }

  if (state.instructions?.trim()) {
    record.instructions = state.instructions.trim();
  }

  return record;
}
```

---

## 6. State Machine Integration

### 6.1 New Action Type

```typescript
// Add to ItemCaptureAction type in useItemCaptureState.ts
type ItemCaptureAction =
  | // ... existing actions
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };
```

### 6.2 Reducer Handling

```typescript
function itemCaptureReducer(
  state: ItemCaptureState,
  action: ItemCaptureAction
): ItemCaptureState {
  switch (action.type) {
    // ... existing cases

    case 'SUBMIT':
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      };

    case 'SUBMIT_SUCCESS':
      // Reset state after successful submission
      return getInitialState();

    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        submitError: action.payload,
      };

    case 'RESET':
      return getInitialState();

    default:
      return state;
  }
}
```

### 6.3 Initial State Function

```typescript
/**
 * Returns the initial state for the ItemCapture wizard
 */
function getInitialState(): ItemCaptureState {
  return {
    currentStep: 'metadata',
    metadata: {
      title: '',
      location: undefined,
      tags: [],
      applianceType: undefined,
    },
    mediaItems: [],
    instructions: '',
    errors: {},
    isRecording: false,
    isCameraActive: false,
    isSubmitting: false,
    submitError: null,
    editTarget: null,
  };
}
```

---

## 7. Integration with ItemCapture.tsx

### 7.1 Submit Handler

```typescript
// Inside ItemCapture.tsx
import { assembleItemRecord } from './utils/assembleItemRecord';
import { validateItemCapture } from './utils/validation';

function ItemCapture({
  onComplete,
  onCancel,
  config,
  className,
}: ItemCaptureProps) {
  const { state, dispatch } = useItemCaptureState();

  const handleSubmit = useCallback(() => {
    // Validate before assembly
    const validation = validateItemCapture(
      state.metadata,
      state.mediaItems,
      state.instructions
    );

    if (!validation.isValid) {
      // Set validation errors (should already be shown)
      Object.entries(validation.errors).forEach(([field, error]) => {
        dispatch({
          type: 'SET_ERROR',
          payload: { field, message: error },
        });
      });
      return;
    }

    // Mark as submitting
    dispatch({ type: 'SUBMIT' });

    try {
      // Assemble the final record
      const record = assembleItemRecord({
        metadata: state.metadata,
        mediaItems: state.mediaItems,
        instructions: state.instructions,
      });

      // Log for debugging if enabled
      if (config?.debug) {
        console.log('=== ITEM CAPTURE OUTPUT ===');
        console.log('ItemRecord:', {
          ...record,
          media: record.media.map(m => ({
            ...m,
            file: `[Blob: ${m.file.size} bytes, ${m.file.type}]`,
            thumbnail: m.thumbnail ? `[Blob: ${m.thumbnail.size} bytes]` : undefined,
          })),
          createdAt: record.createdAt.toISOString(),
        });
      }

      // Emit to parent
      onComplete(record);

      // Reset wizard state for next item
      dispatch({ type: 'SUBMIT_SUCCESS' });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assemble record';
      dispatch({ type: 'SUBMIT_ERROR', payload: message });

      if (config?.debug) {
        console.error('ItemCapture assembly error:', error);
      }
    }
  }, [state, dispatch, onComplete, config?.debug]);

  // ... rest of component
}
```

### 7.2 ReviewStep Integration

```typescript
// Inside ReviewStep.tsx
function ReviewStep({
  metadata,
  mediaItems,
  instructions,
  onSubmit,
  onCancel,
  // ... other props
  isSubmitting = false,
}: ReviewStepProps) {
  // Validation hook
  const { isValid, errors } = useItemValidation(metadata, mediaItems, instructions);

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (isValid) {
      onSubmit();
    }
  }, [isValid, onSubmit]);

  return (
    <div>
      {/* ... review content ... */}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !isValid}
        className={cn(
          'inline-flex items-center px-6 py-2 rounded-lg',
          isValid ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Submit Item
          </>
        )}
      </button>
    </div>
  );
}
```

---

## 8. UUID Generation Utility

### 8.1 Implementation

```typescript
// src/components/ItemCapture/utils/generateUUID.ts

/**
 * Generate a random UUID v4 following RFC 4122
 * Matches existing pattern used in ItemForm.tsx
 *
 * @returns A UUID v4 string (e.g., "8d678bd0-e4f7-495f-b4cd-43756813e23a")
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate that a string is a valid UUID v4 format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$/;
  return uuidRegex.test(id);
}
```

### 8.2 Alternative: crypto.randomUUID()

Modern browsers support the native `crypto.randomUUID()` API:

```typescript
/**
 * Generate a UUID v4 using native crypto API when available
 * Falls back to manual generation for older browsers
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

**Recommendation:** Use the native crypto API with fallback for consistency and security.

---

## 9. Content Type Examples

| Media Items | Instructions | Content Type |
|-------------|--------------|--------------|
| 1 video | None | `media` |
| 3 photos | None | `media` |
| 1 video, 2 photos | None | `media` |
| 1 video | "How to use..." | `mixed` |
| 3 photos | "Instructions..." | `mixed` |
| 1 PDF | None | `pdf-only` |
| 2 PDFs | None | `pdf-only` |
| 1 PDF | "Additional notes" | `mixed` |
| None | "Text instructions" | `text-only` |
| 1 photo, 1 PDF | None | `mixed` |
| 1 video, 1 PDF | "Instructions" | `mixed` |

---

## 10. Acceptance Criteria Mapping

Based on Request #053:

| Acceptance Criterion | Implementation |
|----------------------|----------------|
| Upon submission, all metadata fields are collected into the final record structure | `assembleItemRecord()` extracts title, location, tags, applianceType from state.metadata |
| All content data (text, media files, uploaded files) is included in the final record | `assembleItemRecord()` includes mediaItems array and instructions string |
| A unique identifier is generated for the item record itself | `generateUUID()` called for `record.id` |
| Each media file receives its own unique identifier | `generateUUID()` called for each media item when `regenerateIds: true` |
| The content type field is set automatically based on the primary content provided | `determineContentType()` analyzes media types and instructions |
| A creation timestamp is added to the record using the current date and time | `new Date()` assigned to `record.createdAt` |
| The completed record is emitted to the parent component via callback | `onComplete(record)` called with assembled ItemRecord |
| After emission, the wizard state is reset to initial values | `dispatch({ type: 'SUBMIT_SUCCESS' })` resets via `getInitialState()` |
| The record structure matches the expected format for backend persistence | Output matches `ItemRecord` interface from implementation plan |

---

## 11. Error Handling

### 11.1 Assembly Errors

```typescript
/**
 * Errors that can occur during assembly
 */
export class AssemblyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'AssemblyError';
  }
}

// Error codes
export const ASSEMBLY_ERRORS = {
  MISSING_TITLE: 'MISSING_TITLE',
  INVALID_MEDIA: 'INVALID_MEDIA',
  UUID_GENERATION_FAILED: 'UUID_GENERATION_FAILED',
} as const;
```

### 11.2 Error Recovery

```typescript
const handleSubmit = useCallback(() => {
  dispatch({ type: 'SUBMIT' });

  try {
    const record = assembleItemRecord({
      metadata: state.metadata,
      mediaItems: state.mediaItems,
      instructions: state.instructions,
    });

    onComplete(record);
    dispatch({ type: 'SUBMIT_SUCCESS' });

  } catch (error) {
    // Log error for debugging
    console.error('Assembly failed:', error);

    // Show user-friendly error
    const message = error instanceof AssemblyError
      ? error.message
      : 'Failed to submit item. Please try again.';

    dispatch({ type: 'SUBMIT_ERROR', payload: message });

    // Do NOT reset state - user can retry
  }
}, [state, dispatch, onComplete]);
```

---

## 12. State Reset After Submission

### 12.1 Full Reset

```typescript
function getInitialState(): ItemCaptureState {
  return {
    currentStep: 'metadata',
    metadata: {
      title: '',
      location: undefined,
      tags: [],
      applianceType: undefined,
    },
    mediaItems: [],
    instructions: '',
    errors: {},
    isRecording: false,
    isCameraActive: false,
    isSubmitting: false,
    submitError: null,
    editTarget: null,
  };
}
```

### 12.2 Memory Cleanup

Before resetting, clean up any blob URLs to prevent memory leaks:

```typescript
function cleanupMediaResources(mediaItems: MediaItem[]): void {
  mediaItems.forEach(item => {
    // Revoke thumbnail URLs if they were created
    if (item.thumbnail) {
      // Note: Caller should track and revoke object URLs created from thumbnails
    }
    // Note: File/Blob objects will be garbage collected when no longer referenced
  });
}

// In reducer or cleanup effect
case 'SUBMIT_SUCCESS':
  // Cleanup is handled by the component before this action
  return getInitialState();
```

---

## 13. Component Structure

```
src/components/ItemCapture/
├── utils/
│   ├── assembleItemRecord.ts      # Pure assembly function (NEW)
│   ├── generateUUID.ts            # UUID generation utility (NEW)
│   ├── validation.ts              # Validation functions (existing from 5.3)
│   └── constants.ts               # Constants (existing)
├── hooks/
│   ├── useItemCaptureState.ts     # Add SUBMIT, SUBMIT_SUCCESS, RESET actions
│   └── useItemValidation.ts       # Validation hook (existing from 5.3)
├── components/
│   └── steps/
│       └── ReviewStep.tsx         # Calls onSubmit which triggers assembly
├── ItemCapture.tsx                # Contains handleSubmit with assembly logic
└── ItemCapture.types.ts           # ItemRecord interface (existing)
```

---

## 14. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/assembleItemRecord.ts` | Pure assembly function |
| `src/components/ItemCapture/utils/generateUUID.ts` | UUID generation utility |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/ItemCapture.tsx` | Add handleSubmit with assembly and onComplete call |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Add SUBMIT, SUBMIT_SUCCESS, SUBMIT_ERROR, RESET actions; add isSubmitting state |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Wire up submit button to trigger onSubmit prop |
| `src/components/ItemCapture/index.ts` | Export assembleItemRecord if needed externally |

### Files to REFERENCE (read-only patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemForm.tsx:9-14` | UUID generation pattern |
| `src/components/ItemForm.tsx:106-131` | Form submission pattern with data assembly |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord, MediaItem interfaces |
| `src/components/ItemCapture/utils/validation.ts` | Validation function usage |
| `src/lib/utils.ts` | Utility function patterns |

### Dependencies Required

| Dependency | Version | Notes |
|------------|---------|-------|
| None | - | All required dependencies already installed |

**No new dependencies required.**

---

## 15. Testing Approach

### Unit Tests

1. **assembleItemRecord()**
   - Generates valid UUID for item ID
   - Generates valid UUIDs for all media items
   - Correctly determines contentType for various combinations
   - Includes all metadata fields that have values
   - Excludes optional fields when undefined/empty
   - Creates Date object for createdAt
   - Handles empty media array (text-only)
   - Preserves media order correctly

2. **generateUUID()**
   - Returns valid UUID v4 format
   - Generates unique IDs on each call
   - Works with crypto.randomUUID when available
   - Falls back correctly for older browsers

3. **determineContentType()**
   - Returns 'media' for video/image only
   - Returns 'text-only' for text without media
   - Returns 'pdf-only' for PDFs without text/media
   - Returns 'mixed' for combinations

### Integration Tests

1. Full submission flow from ReviewStep to onComplete callback
2. State reset after successful submission
3. Error handling when assembly fails
4. Validation blocking submission when invalid
5. Memory cleanup of blob URLs on reset

### Manual Testing Checklist

- [ ] Submit button triggers assembly
- [ ] onComplete callback receives valid ItemRecord
- [ ] Item ID is valid UUID format
- [ ] Each media item has unique UUID
- [ ] Content type matches captured content
- [ ] Timestamp reflects submission time
- [ ] Wizard resets after successful submission
- [ ] State preserves on submission error
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers

---

## 16. Implementation Order

1. Create `generateUUID.ts` utility
2. Create `assembleItemRecord.ts` with pure assembly function
3. Create `determineContentType()` helper function
4. Add SUBMIT, SUBMIT_SUCCESS, SUBMIT_ERROR, RESET actions to useItemCaptureState
5. Add isSubmitting, submitError to state interface
6. Implement getInitialState() function
7. Add handleSubmit to ItemCapture.tsx
8. Wire ReviewStep submit button to handleSubmit
9. Add debug logging when config.debug enabled
10. Add memory cleanup before state reset
11. Test all content type combinations
12. Test on target browsers/devices

---

## 17. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 5.1 | ReviewStep | Preceding - provides Submit button that triggers assembly |
| 5.3 | Validation Layer | Preceding - validates before assembly proceeds |
| 5.5 | Performance Optimization | Following - optimizes memory cleanup |
| 5.6 | Test Harness | Following - verifies onComplete output structure |
| 1.2 | useItemCaptureState | Foundation - provides state for assembly |

---

## 18. Performance Considerations

### 18.1 Synchronous Assembly

The assembly function is synchronous and fast:
- UUID generation: ~0.1ms per UUID
- Object creation: ~0.1ms for entire record
- Total: < 1ms for typical item

### 18.2 Memory Efficiency

```typescript
// Media items are passed by reference, not copied
const transformedMedia: MediaItem[] = state.mediaItems.map((item) => ({
  // Only the wrapper object is new; file and thumbnail blobs are referenced
  id: generateUUID(),
  type: item.type,
  file: item.file,          // Same Blob reference
  thumbnail: item.thumbnail, // Same Blob reference
  order: item.order,
  metadata: item.metadata,  // Shallow copy is fine for immutable metadata
}));
```

### 18.3 Cleanup Responsibility

The parent application receiving `onComplete(record)` is responsible for:
- Uploading files to storage
- Persisting record to database
- Cleaning up Blob references when done

---

## 19. Open Questions

1. **UUID Persistence:** Should media item IDs be preserved if user navigates back and forth?
   - **Recommendation:** Regenerate on final assembly for consistency; internal IDs are temporary

2. **Timestamp Precision:** Should createdAt include milliseconds?
   - **Recommendation:** Yes, use `new Date()` which includes milliseconds

3. **Error Retry:** Should failed assembly allow retry without re-entering data?
   - **Recommendation:** Yes - only reset on SUBMIT_SUCCESS, not SUBMIT_ERROR

4. **Callback Timing:** Should onComplete be awaited if it returns a Promise?
   - **Recommendation:** No - fire and forget; parent handles async operations

5. **Multiple Submissions:** Can user submit same item multiple times?
   - **Recommendation:** No - reset state immediately after onComplete call

---

## 20. Component Implementation Skeleton

```typescript
// src/components/ItemCapture/utils/assembleItemRecord.ts
'use client';

import { generateUUID } from './generateUUID';
import type {
  ItemRecord,
  MediaItem,
  MediaMetadata,
  ApplianceType,
} from '../ItemCapture.types';

/**
 * Internal state structure from useItemCaptureState
 */
interface InternalMediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}

interface InternalState {
  metadata: {
    title: string;
    location?: string;
    tags?: string[];
    applianceType?: ApplianceType;
  };
  mediaItems: InternalMediaItem[];
  instructions: string;
}

interface AssemblyOptions {
  regenerateIds?: boolean;
  timestamp?: Date;
}

/**
 * Determine the contentType based on captured content
 */
function determineContentType(
  mediaItems: InternalMediaItem[],
  instructions: string | undefined
): 'media' | 'text-only' | 'pdf-only' | 'mixed' {
  const hasMedia = mediaItems.some(
    item => item.type === 'video' || item.type === 'image'
  );
  const hasPDF = mediaItems.some(item => item.type === 'pdf');
  const hasText = instructions && instructions.trim().length > 0;

  if (hasMedia && (hasPDF || hasText)) {
    return 'mixed';
  }
  if (hasMedia) {
    return 'media';
  }
  if (hasPDF && !hasText) {
    return 'pdf-only';
  }
  if (hasText && !hasPDF) {
    return 'text-only';
  }
  if (hasPDF || hasText) {
    return 'mixed';
  }

  return 'media';
}

/**
 * Assembles the final ItemRecord from internal wizard state
 *
 * @param state - Internal wizard state containing metadata, media, and instructions
 * @param options - Assembly options (regenerateIds, timestamp)
 * @returns Complete ItemRecord ready for emission to parent
 */
export function assembleItemRecord(
  state: InternalState,
  options: AssemblyOptions = {}
): ItemRecord {
  const { regenerateIds = true, timestamp = new Date() } = options;

  // Generate new item UUID
  const itemId = generateUUID();

  // Transform media items with new UUIDs and sequential order
  const transformedMedia: MediaItem[] = state.mediaItems.map((item, index) => ({
    id: regenerateIds ? generateUUID() : item.id,
    type: item.type,
    file: item.file,
    thumbnail: item.thumbnail,
    order: index,
    metadata: { ...item.metadata },
  }));

  // Determine content type
  const contentType = determineContentType(
    state.mediaItems,
    state.instructions
  );

  // Build the final ItemRecord
  const record: ItemRecord = {
    id: itemId,
    title: state.metadata.title.trim(),
    contentType,
    media: transformedMedia,
    createdAt: timestamp,
  };

  // Add optional fields only if they have values
  if (state.metadata.location?.trim()) {
    record.location = state.metadata.location.trim();
  }

  if (state.metadata.tags && state.metadata.tags.length > 0) {
    record.tags = state.metadata.tags.filter(tag => tag.trim().length > 0);
  }

  if (state.metadata.applianceType) {
    record.applianceType = state.metadata.applianceType;
  }

  if (state.instructions?.trim()) {
    record.instructions = state.instructions.trim();
  }

  return record;
}

export default assembleItemRecord;
```

```typescript
// src/components/ItemCapture/utils/generateUUID.ts
'use client';

/**
 * Generate a random UUID v4 following RFC 4122
 * Uses native crypto.randomUUID() when available, with fallback
 *
 * @returns A UUID v4 string (e.g., "8d678bd0-e4f7-495f-b4cd-43756813e23a")
 */
export function generateUUID(): string {
  // Use native crypto API when available (modern browsers)
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers (matches ItemForm.tsx pattern)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate that a string is a valid UUID v4 format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4[a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$/;
  return uuidRegex.test(id);
}

export default generateUUID;
```

---

## 21. Debug Output Example

When `config.debug` is enabled, the console will show:

```javascript
=== ITEM CAPTURE OUTPUT ===
ItemRecord: {
  id: "8d678bd0-e4f7-495f-b4cd-43756813e23a",
  title: "Samsung Washing Machine WF45T6000AW",
  location: "Laundry Room",
  tags: ["appliance", "laundry"],
  applianceType: "washer",
  contentType: "mixed",
  media: [
    {
      id: "a1b2c3d4-e5f6-4789-abcd-ef0123456789",
      type: "video",
      file: "[Blob: 15728640 bytes, video/webm]",
      thumbnail: "[Blob: 12288 bytes]",
      order: 0,
      metadata: {
        duration: 45,
        dimensions: { width: 1920, height: 1080 },
        mimeType: "video/webm",
        fileSize: 15728640,
        source: "capture"
      }
    },
    {
      id: "b2c3d4e5-f6a7-4890-bcde-f01234567890",
      type: "image",
      file: "[Blob: 2097152 bytes, image/jpeg]",
      thumbnail: "[Blob: 8192 bytes]",
      order: 1,
      metadata: {
        dimensions: { width: 4032, height: 3024 },
        mimeType: "image/jpeg",
        fileSize: 2097152,
        source: "capture",
        edits: { rotated: 90 }
      }
    }
  ],
  instructions: "## How to Use\n1. Load clothes...",
  createdAt: "2025-12-31T22:45:30.123Z"
}
```

---

## 22. References

- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 5, Task 5.4
- [Request #053](/docs/gen_requests.md) - Final Item Record Assembly and Submission Handler
- [ReviewStep Overview](/docs/REQ-050-implement-reviewstep-overview.md) - UI that triggers submission
- [Validation Layer Overview](/docs/REQ-052-create-validation-layer-overview.md) - Pre-submission validation
- [ItemForm.tsx](/src/components/ItemForm.tsx) - UUID generation and form submission patterns
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - ItemRecord interface definition

---
