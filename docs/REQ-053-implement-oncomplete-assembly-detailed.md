# REQ-053: Implement onComplete Assembly - Detailed Task Breakdown

**Document Created:** 2025-12-31T23:45:00
**Last Modified:** 2025-12-31T19:30:00
**Overview Reference:** `/docs/REQ-053-implement-oncomplete-assembly-overview.md`
**Request Reference:** `/docs/gen_requests.md` - Request #053
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.4
**Status:** COMPLETED

---

## Implementation Summary

All required tasks have been implemented:

| Task | Status | Notes |
|------|--------|-------|
| Task 1: UUID Generation Utility | ✅ Completed | `utils/generateUUID.ts` with native crypto + fallback |
| Task 2: Content Type Determination | ✅ Completed | `determineContentType()` in `utils/assembleItemRecord.ts` |
| Task 3: Assembly Function Core | ✅ Completed | `assembleItemRecord()` pure function |
| Task 4: Submission State | ✅ Completed | `submitError`, `SUBMIT`, `SUBMIT_SUCCESS`, `SUBMIT_ERROR` actions |
| Task 5: handleSubmit | ✅ Completed | In `ItemCapture.tsx` with validation + assembly |
| Task 6: Wire ReviewStep | ✅ Already Complete | `onSubmit` prop wired to submit button |
| Task 7: Export Assembly | ✅ Completed | Exported from `index.ts` barrel file |
| Task 11: Integration Test | ✅ Completed | Test harness at `/test/item-capture` |

**Test Page:** `/test/item-capture` - Interactive test harness to verify UUID generation, content type detection, and assembly function

---

## Executive Summary

This document breaks down REQ-053 (Final Item Record Assembly and Submission Handler) into granular, actionable tasks. Each task is ≤1 story point (a few hours of focused work) and includes specific acceptance criteria and verification steps.

The onComplete assembly transforms internal wizard state into the external `ItemRecord` contract when the user submits from the ReviewStep.

---

## Authorized Files for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/generateUUID.ts` | UUID v4 generation utility |
| `src/components/ItemCapture/utils/assembleItemRecord.ts` | Pure assembly function |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/ItemCapture.tsx` | Add handleSubmit with assembly and onComplete call |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Add SUBMIT, SUBMIT_SUCCESS, SUBMIT_ERROR, RESET actions; add isSubmitting state |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Wire submit button to trigger onSubmit prop |
| `src/components/ItemCapture/index.ts` | Export assembleItemRecord if needed externally |

### Files for Reference (Read-Only)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/components/ItemForm.tsx:9-14` | UUID generation pattern |
| `src/components/ItemForm.tsx:106-131` | Form submission pattern |
| `src/components/ItemCapture/ItemCapture.types.ts` | ItemRecord, MediaItem interfaces |

---

## Task Breakdown

### Task 1: Create UUID Generation Utility

**File:** `src/components/ItemCapture/utils/generateUUID.ts`

**Description:** Create a utility function to generate RFC 4122 compliant UUID v4 strings with native crypto API support and fallback for older browsers.

**Acceptance Criteria:**
- [x] Function `generateUUID()` returns a valid UUID v4 string
- [x] Uses native `crypto.randomUUID()` when available
- [x] Falls back to Math.random() implementation for older browsers
- [x] Function `isValidUUID(id: string)` validates UUID v4 format
- [x] Follows existing pattern from `src/components/ItemForm.tsx:9-14`
- [x] File includes `'use client'` directive

**Implementation Details:**
```typescript
// src/components/ItemCapture/utils/generateUUID.ts
'use client';

/**
 * Generate a random UUID v4 following RFC 4122
 * Uses native crypto.randomUUID() when available, with fallback
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
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

export default generateUUID;
```

**Verification Steps:**
1. Run TypeScript compilation: `npx tsc --noEmit`
2. Verify function returns valid UUID format
3. Verify `isValidUUID()` correctly validates the generated UUIDs
4. Test in browser console that crypto.randomUUID is used when available

**Estimated Effort:** 0.5 story points

---

### Task 2: Create Content Type Determination Logic

**File:** `src/components/ItemCapture/utils/assembleItemRecord.ts`

**Description:** Implement the `determineContentType()` helper function that analyzes media items and instructions to determine the appropriate content type.

**Acceptance Criteria:**
- [ ] Returns `'media'` when only video/image content exists (no text, no PDF)
- [ ] Returns `'text-only'` when only text instructions exist (no media)
- [ ] Returns `'pdf-only'` when only PDF files exist (no other media, no text)
- [ ] Returns `'mixed'` when multiple content types are combined
- [ ] Handles empty arrays correctly
- [ ] Follows the priority logic defined in the overview document

**Implementation Details:**
```typescript
/**
 * Determine the contentType based on captured content
 */
function determineContentType(
  mediaItems: Array<{ type: 'video' | 'image' | 'pdf' }>,
  instructions: string | undefined
): 'media' | 'text-only' | 'pdf-only' | 'mixed' {
  const hasMedia = mediaItems.some(item => item.type === 'video' || item.type === 'image');
  const hasPDF = mediaItems.some(item => item.type === 'pdf');
  const hasText = instructions && instructions.trim().length > 0;

  if (hasMedia && (hasPDF || hasText)) return 'mixed';
  if (hasMedia) return 'media';
  if (hasPDF && !hasText) return 'pdf-only';
  if (hasText && !hasPDF) return 'text-only';
  if (hasPDF || hasText) return 'mixed';
  return 'media'; // Fallback
}
```

**Test Cases:**

| Media Items | Instructions | Expected Output |
|-------------|--------------|-----------------|
| `[{type: 'video'}]` | `undefined` | `'media'` |
| `[{type: 'image'}, {type: 'image'}]` | `undefined` | `'media'` |
| `[{type: 'video'}]` | `"How to use..."` | `'mixed'` |
| `[{type: 'pdf'}]` | `undefined` | `'pdf-only'` |
| `[{type: 'pdf'}]` | `"Instructions"` | `'mixed'` |
| `[]` | `"Text only content"` | `'text-only'` |
| `[{type: 'image'}, {type: 'pdf'}]` | `undefined` | `'mixed'` |

**Verification Steps:**
1. Create unit test file with all test cases from table
2. Run tests: `npm test` (if test infrastructure exists) or manual verification
3. Verify all edge cases return expected values

**Estimated Effort:** 0.5 story points

---

### Task 3: Implement Assembly Function Core

**File:** `src/components/ItemCapture/utils/assembleItemRecord.ts`

**Description:** Create the main `assembleItemRecord()` pure function that transforms internal wizard state into the external `ItemRecord` contract.

**Acceptance Criteria:**
- [ ] Generates new UUID for the item record
- [ ] Generates new UUIDs for each media item (when `regenerateIds: true`)
- [ ] Preserves existing media item IDs when `regenerateIds: false`
- [ ] Sets `createdAt` timestamp to current time (or provided timestamp)
- [ ] Trims whitespace from title, location, and instructions
- [ ] Filters out empty tags
- [ ] Only includes optional fields when they have values
- [ ] Returns complete `ItemRecord` matching the interface in implementation plan
- [ ] Pure function with no side effects

**Implementation Details:**
```typescript
// src/components/ItemCapture/utils/assembleItemRecord.ts
'use client';

import { generateUUID } from './generateUUID';
import type { ItemRecord, MediaItem, ApplianceType, MediaMetadata } from '../ItemCapture.types';

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

export function assembleItemRecord(
  state: InternalState,
  options: AssemblyOptions = {}
): ItemRecord {
  const { regenerateIds = true, timestamp = new Date() } = options;

  const itemId = generateUUID();

  const transformedMedia: MediaItem[] = state.mediaItems.map((item, index) => ({
    id: regenerateIds ? generateUUID() : item.id,
    type: item.type,
    file: item.file,
    thumbnail: item.thumbnail,
    order: index,
    metadata: { ...item.metadata },
  }));

  const contentType = determineContentType(state.mediaItems, state.instructions);

  const record: ItemRecord = {
    id: itemId,
    title: state.metadata.title.trim(),
    contentType,
    media: transformedMedia,
    createdAt: timestamp,
  };

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

**Verification Steps:**
1. TypeScript compilation passes with no errors
2. Manual test: create mock state and verify output structure
3. Verify UUIDs are generated for item and media items
4. Verify optional fields are omitted when empty
5. Verify media items preserve correct order (0-indexed)

**Estimated Effort:** 1 story point

---

### Task 4: Add Submission State to useItemCaptureState

**File:** `src/components/ItemCapture/hooks/useItemCaptureState.ts`

**Description:** Extend the state machine with submission-related state and actions.

**Acceptance Criteria:**
- [ ] Add `isSubmitting: boolean` to state interface
- [ ] Add `submitError: string | null` to state interface
- [ ] Add `SUBMIT` action type that sets `isSubmitting: true`
- [ ] Add `SUBMIT_SUCCESS` action type that resets state to initial values
- [ ] Add `SUBMIT_ERROR` action type with error message payload
- [ ] Add `RESET` action type for manual reset
- [ ] Create `getInitialState()` function for consistent state initialization
- [ ] Ensure `SUBMIT_ERROR` preserves current state (allows retry)

**Implementation Details:**

Add to state interface:
```typescript
interface ItemCaptureState {
  // ... existing fields
  isSubmitting: boolean;
  submitError: string | null;
}
```

Add action types:
```typescript
type ItemCaptureAction =
  | // ... existing actions
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };
```

Add reducer cases:
```typescript
case 'SUBMIT':
  return { ...state, isSubmitting: true, submitError: null };

case 'SUBMIT_SUCCESS':
  return getInitialState();

case 'SUBMIT_ERROR':
  return { ...state, isSubmitting: false, submitError: action.payload };

case 'RESET':
  return getInitialState();
```

Add initial state function:
```typescript
function getInitialState(): ItemCaptureState {
  return {
    currentStep: 'metadata',
    metadata: { title: '', location: undefined, tags: [], applianceType: undefined },
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

**Verification Steps:**
1. TypeScript compilation passes
2. Verify dispatch({ type: 'SUBMIT' }) sets isSubmitting to true
3. Verify dispatch({ type: 'SUBMIT_SUCCESS' }) resets all state
4. Verify dispatch({ type: 'SUBMIT_ERROR', payload: 'error' }) preserves state
5. Verify getInitialState() returns consistent structure

**Estimated Effort:** 0.5 story points

---

### Task 5: Implement handleSubmit in ItemCapture.tsx

**File:** `src/components/ItemCapture/ItemCapture.tsx`

**Description:** Add the main submission handler that validates, assembles, emits, and resets.

**Acceptance Criteria:**
- [ ] Validates data using validation layer before assembly (if validation exists)
- [ ] Sets errors and returns early if validation fails
- [ ] Dispatches `SUBMIT` action before starting assembly
- [ ] Calls `assembleItemRecord()` with current state
- [ ] Calls `onComplete(record)` with assembled ItemRecord
- [ ] Dispatches `SUBMIT_SUCCESS` after successful emission
- [ ] Catches errors and dispatches `SUBMIT_ERROR` with message
- [ ] Logs debug output when `config.debug` is enabled
- [ ] Uses `useCallback` with proper dependencies

**Implementation Details:**
```typescript
import { assembleItemRecord } from './utils/assembleItemRecord';
import { validateItemCapture } from './utils/validation'; // if exists

const handleSubmit = useCallback(() => {
  // Optional validation check
  if (typeof validateItemCapture === 'function') {
    const validation = validateItemCapture(
      state.metadata,
      state.mediaItems,
      state.instructions
    );
    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, error]) => {
        dispatch({ type: 'SET_ERROR', payload: { field, message: error as string } });
      });
      return;
    }
  }

  dispatch({ type: 'SUBMIT' });

  try {
    const record = assembleItemRecord({
      metadata: state.metadata,
      mediaItems: state.mediaItems,
      instructions: state.instructions,
    });

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

    onComplete(record);
    dispatch({ type: 'SUBMIT_SUCCESS' });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assemble record';
    dispatch({ type: 'SUBMIT_ERROR', payload: message });
    if (config?.debug) {
      console.error('ItemCapture assembly error:', error);
    }
  }
}, [state, dispatch, onComplete, config?.debug]);
```

**Verification Steps:**
1. TypeScript compilation passes
2. Verify handleSubmit is called when submit action occurs
3. Verify onComplete receives valid ItemRecord structure
4. Verify state resets after successful submission
5. Verify error handling preserves state on failure
6. Verify debug logging outputs expected format

**Estimated Effort:** 1 story point

---

### Task 6: Wire ReviewStep Submit Button

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Description:** Connect the ReviewStep submit button to the submission handler via props.

**Acceptance Criteria:**
- [ ] Add `onSubmit: () => void` prop to ReviewStep
- [ ] Add `isSubmitting?: boolean` prop to control button state
- [ ] Submit button calls `onSubmit` when clicked
- [ ] Submit button is disabled when `isSubmitting` is true
- [ ] Submit button shows loading state when `isSubmitting` is true
- [ ] Submit button is disabled when validation fails (if validation exists)
- [ ] Accessible button with proper aria attributes

**Implementation Details:**
```typescript
interface ReviewStepProps {
  // ... existing props
  onSubmit: () => void;
  isSubmitting?: boolean;
}

function ReviewStep({
  metadata,
  mediaItems,
  instructions,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ReviewStepProps) {

  return (
    <div>
      {/* ... review content ... */}

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className={cn(
          'inline-flex items-center px-6 py-2 rounded-lg',
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
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

**Verification Steps:**
1. TypeScript compilation passes
2. Verify button triggers onSubmit prop when clicked
3. Verify button shows loading spinner when isSubmitting is true
4. Verify button is disabled during submission
5. Verify screen reader announces button state changes

**Estimated Effort:** 0.5 story points

---

### Task 7: Export Assembly Function (Optional)

**File:** `src/components/ItemCapture/index.ts`

**Description:** Export the assembly function if it may be useful for external testing or integration.

**Acceptance Criteria:**
- [ ] Add `assembleItemRecord` to barrel exports
- [ ] Add type exports for `InternalState` and `AssemblyOptions` if needed
- [ ] Maintain existing exports unchanged

**Implementation Details:**
```typescript
// src/components/ItemCapture/index.ts
export { default as ItemCapture } from './ItemCapture';
export type { ItemCaptureProps, ItemRecord, MediaItem } from './ItemCapture.types';

// Optional: export for testing/external use
export { assembleItemRecord } from './utils/assembleItemRecord';
export { generateUUID, isValidUUID } from './utils/generateUUID';
```

**Verification Steps:**
1. Verify imports work from `@/components/ItemCapture`
2. Verify existing exports still function correctly

**Estimated Effort:** 0.25 story points

---

### Task 8: Unit Tests for UUID Generation

**File:** `src/components/ItemCapture/utils/__tests__/generateUUID.test.ts` (or equivalent)

**Description:** Create unit tests for the UUID generation utility.

**Acceptance Criteria:**
- [ ] Test that `generateUUID()` returns valid UUID v4 format
- [ ] Test that multiple calls return unique values
- [ ] Test that `isValidUUID()` returns true for valid UUIDs
- [ ] Test that `isValidUUID()` returns false for invalid strings
- [ ] Test fallback behavior when crypto.randomUUID is unavailable

**Test Cases:**
```typescript
describe('generateUUID', () => {
  it('returns a valid UUID v4 format', () => {
    const uuid = generateUUID();
    expect(isValidUUID(uuid)).toBe(true);
  });

  it('generates unique IDs on each call', () => {
    const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
    expect(uuids.size).toBe(100);
  });
});

describe('isValidUUID', () => {
  it('returns true for valid UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('returns false for invalid strings', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('550e8400-e29b-31d4-a716-446655440000')).toBe(false); // v3, not v4
  });
});
```

**Verification Steps:**
1. Tests pass: `npm test generateUUID` (or equivalent)
2. All edge cases covered

**Estimated Effort:** 0.5 story points

---

### Task 9: Unit Tests for Assembly Function

**File:** `src/components/ItemCapture/utils/__tests__/assembleItemRecord.test.ts` (or equivalent)

**Description:** Create unit tests for the assembly function.

**Acceptance Criteria:**
- [ ] Test that output has valid item UUID
- [ ] Test that output has correct contentType for various inputs
- [ ] Test that all media items have UUIDs when regenerateIds is true
- [ ] Test that media items preserve original IDs when regenerateIds is false
- [ ] Test that optional fields are omitted when empty
- [ ] Test that whitespace is trimmed from strings
- [ ] Test that empty tags are filtered out
- [ ] Test that createdAt is set correctly

**Test Cases:**
```typescript
describe('assembleItemRecord', () => {
  const mockState = {
    metadata: {
      title: '  Test Item  ',
      location: 'Kitchen',
      tags: ['tag1', '', 'tag2'],
      applianceType: 'washer' as const,
    },
    mediaItems: [{
      id: 'temp-id-1',
      type: 'video' as const,
      file: new Blob(['test'], { type: 'video/webm' }),
      order: 0,
      metadata: { mimeType: 'video/webm', fileSize: 4, source: 'capture' as const },
    }],
    instructions: '  Instructions here  ',
  };

  it('generates valid item UUID', () => {
    const record = assembleItemRecord(mockState);
    expect(isValidUUID(record.id)).toBe(true);
  });

  it('trims whitespace from title', () => {
    const record = assembleItemRecord(mockState);
    expect(record.title).toBe('Test Item');
  });

  it('filters empty tags', () => {
    const record = assembleItemRecord(mockState);
    expect(record.tags).toEqual(['tag1', 'tag2']);
  });

  it('regenerates media IDs by default', () => {
    const record = assembleItemRecord(mockState);
    expect(record.media[0].id).not.toBe('temp-id-1');
    expect(isValidUUID(record.media[0].id)).toBe(true);
  });

  it('preserves media IDs when regenerateIds is false', () => {
    const record = assembleItemRecord(mockState, { regenerateIds: false });
    expect(record.media[0].id).toBe('temp-id-1');
  });
});
```

**Verification Steps:**
1. Tests pass: `npm test assembleItemRecord` (or equivalent)
2. All scenarios from overview document covered

**Estimated Effort:** 1 story point

---

### Task 10: Unit Tests for Content Type Determination

**File:** `src/components/ItemCapture/utils/__tests__/assembleItemRecord.test.ts` (or equivalent)

**Description:** Create unit tests for the content type determination logic.

**Acceptance Criteria:**
- [ ] Test all content type combinations from the overview document table
- [ ] Test edge cases (empty arrays, whitespace-only text)

**Test Cases:**
```typescript
describe('determineContentType (via assembleItemRecord)', () => {
  const createState = (
    mediaTypes: Array<'video' | 'image' | 'pdf'>,
    instructions: string
  ) => ({
    metadata: { title: 'Test' },
    mediaItems: mediaTypes.map((type, i) => ({
      id: `id-${i}`,
      type,
      file: new Blob([]),
      order: i,
      metadata: { mimeType: 'test', fileSize: 0, source: 'capture' as const },
    })),
    instructions,
  });

  it('returns "media" for video only', () => {
    const record = assembleItemRecord(createState(['video'], ''));
    expect(record.contentType).toBe('media');
  });

  it('returns "media" for images only', () => {
    const record = assembleItemRecord(createState(['image', 'image'], ''));
    expect(record.contentType).toBe('media');
  });

  it('returns "mixed" for video with text', () => {
    const record = assembleItemRecord(createState(['video'], 'Instructions'));
    expect(record.contentType).toBe('mixed');
  });

  it('returns "pdf-only" for PDF without text', () => {
    const record = assembleItemRecord(createState(['pdf'], ''));
    expect(record.contentType).toBe('pdf-only');
  });

  it('returns "text-only" for text without media', () => {
    const record = assembleItemRecord(createState([], 'Instructions'));
    expect(record.contentType).toBe('text-only');
  });

  it('returns "mixed" for media with PDF', () => {
    const record = assembleItemRecord(createState(['image', 'pdf'], ''));
    expect(record.contentType).toBe('mixed');
  });
});
```

**Verification Steps:**
1. Tests pass for all content type combinations
2. Edge cases handled correctly

**Estimated Effort:** 0.5 story points

---

### Task 11: Integration Test - Full Submission Flow

**File:** Manual test or test harness at `/src/app/test/item-capture/page.tsx`

**Description:** Verify the complete submission flow from ReviewStep through onComplete callback.

**Acceptance Criteria:**
- [ ] Submit button triggers handleSubmit
- [ ] handleSubmit calls assembleItemRecord with correct state
- [ ] onComplete callback receives valid ItemRecord
- [ ] ItemRecord has all required fields populated correctly
- [ ] Wizard state resets after successful submission
- [ ] Error handling works when assembly fails
- [ ] Debug logging outputs expected format when enabled

**Manual Test Script:**
1. Navigate to test harness page
2. Complete wizard flow to ReviewStep
3. Click Submit button
4. Verify console output shows ItemRecord structure
5. Verify ItemRecord contains:
   - Valid UUID for `id`
   - Correct `title` (trimmed)
   - Correct `contentType` based on captured content
   - Valid UUIDs for all media items
   - Correct `createdAt` timestamp
   - Optional fields only present when provided
6. Verify wizard resets to initial step after submission

**Verification Steps:**
1. Run test harness in browser
2. Complete full flow with various content combinations
3. Verify console output matches expected ItemRecord structure
4. Verify no errors in browser console
5. Verify memory cleanup (no blob URL leaks)

**Estimated Effort:** 1 story point

---

### Task 12: Cross-Browser Testing

**Description:** Verify submission and assembly works across target browsers.

**Acceptance Criteria:**
- [ ] Works on Chrome (desktop)
- [ ] Works on Firefox (desktop)
- [ ] Works on Safari (desktop)
- [ ] Works on Chrome (Android)
- [ ] Works on Safari (iOS)
- [ ] UUID generation works in all browsers
- [ ] Date objects serialize correctly in all browsers

**Test Matrix:**

| Browser | UUID Gen | Assembly | Submit | Reset |
|---------|----------|----------|--------|-------|
| Chrome Desktop | | | | |
| Firefox Desktop | | | | |
| Safari Desktop | | | | |
| Chrome Android | | | | |
| Safari iOS | | | | |

**Verification Steps:**
1. Test each browser from matrix
2. Complete full submission flow
3. Verify console output is correct
4. Mark each cell as pass/fail

**Estimated Effort:** 1 story point

---

## Task Summary Table

| Task # | Title | Files | Effort | Dependencies |
|--------|-------|-------|--------|--------------|
| 1 | Create UUID Generation Utility | `generateUUID.ts` | 0.5 | None |
| 2 | Create Content Type Determination | `assembleItemRecord.ts` | 0.5 | None |
| 3 | Implement Assembly Function Core | `assembleItemRecord.ts` | 1.0 | Tasks 1, 2 |
| 4 | Add Submission State | `useItemCaptureState.ts` | 0.5 | None |
| 5 | Implement handleSubmit | `ItemCapture.tsx` | 1.0 | Tasks 3, 4 |
| 6 | Wire ReviewStep Submit Button | `ReviewStep.tsx` | 0.5 | Task 5 |
| 7 | Export Assembly Function | `index.ts` | 0.25 | Task 3 |
| 8 | Unit Tests - UUID | `__tests__/generateUUID.test.ts` | 0.5 | Task 1 |
| 9 | Unit Tests - Assembly | `__tests__/assembleItemRecord.test.ts` | 1.0 | Task 3 |
| 10 | Unit Tests - Content Type | `__tests__/assembleItemRecord.test.ts` | 0.5 | Task 2 |
| 11 | Integration Test - Full Flow | Manual / test harness | 1.0 | Tasks 1-6 |
| 12 | Cross-Browser Testing | N/A | 1.0 | Task 11 |

**Total Effort:** ~8.25 story points

---

## Implementation Order

Recommended sequence for implementation:

```
Phase A: Utilities (Parallel)
├── Task 1: UUID Generation Utility
├── Task 2: Content Type Determination
└── Task 4: Submission State

Phase B: Core Assembly
├── Task 3: Assembly Function Core (needs 1, 2)
└── Task 7: Export Assembly Function (needs 3)

Phase C: Integration
├── Task 5: handleSubmit (needs 3, 4)
└── Task 6: ReviewStep Wiring (needs 5)

Phase D: Testing (Parallel)
├── Task 8: UUID Tests (needs 1)
├── Task 9: Assembly Tests (needs 3)
├── Task 10: Content Type Tests (needs 2)
├── Task 11: Integration Test (needs 1-6)
└── Task 12: Cross-Browser Testing (needs 11)
```

---

## Dependencies on Other Tasks

| Prerequisite | Required For | Notes |
|--------------|--------------|-------|
| Task 5.1 (ReviewStep) | Task 6 | ReviewStep must exist to wire submit button |
| Task 5.3 (Validation Layer) | Task 5 | Validation runs before assembly (optional) |
| Phase 1 (Foundation) | All Tasks | Types and state machine must exist |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Types not yet defined | Check `ItemCapture.types.ts` exists; create minimal types if needed |
| useItemCaptureState structure differs | Adapt Task 4 to match existing reducer pattern |
| ReviewStep not implemented | Task 6 can be deferred; handleSubmit can be tested directly |
| Validation layer not implemented | Task 5 includes fallback when validation doesn't exist |

---

## Acceptance Criteria Mapping

From Request #053:

| Criterion | Task(s) |
|-----------|---------|
| All metadata fields collected into final record | Task 3 |
| All content data included in final record | Task 3 |
| Unique identifier generated for item record | Tasks 1, 3 |
| Each media file receives unique identifier | Tasks 1, 3 |
| Content type set automatically | Tasks 2, 3 |
| Creation timestamp added | Task 3 |
| Completed record emitted via callback | Task 5 |
| Wizard state reset after emission | Tasks 4, 5 |
| Record structure matches expected format | Tasks 3, 9 |

---

## References

- [REQ-053 Overview](/docs/REQ-053-implement-oncomplete-assembly-overview.md)
- [Implementation Plan - Phase 5](/docs/prd/item-capture-implementation-plan.md)
- [Request #053](/docs/gen_requests.md)
- [ItemForm.tsx - UUID Pattern](/src/components/ItemForm.tsx)
