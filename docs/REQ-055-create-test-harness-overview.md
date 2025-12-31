# REQ-055: Developer Test Harness for Item Capture Wizard - Technical Overview

**Document Created:** 2025-12-31T15:00:00
**Last Modified:** 2025-12-31T15:00:00
**Request Reference:** `/docs/gen_requests.md` (REQ-055)
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.6
**Status:** Ready for Implementation

---

## 1. Summary

Create a standalone test page at `/test/item-capture` that allows developers to manually verify the complete ItemCapture wizard flow in isolation. The test harness provides:

1. **Isolated Testing Environment** - Full wizard workflow without main app integration
2. **Console Output Inspection** - Structured logging of `onComplete` callback data
3. **Network Isolation Verification** - Confirm zero network requests during capture process
4. **No Authentication Required** - Accessible directly without login

**Key Responsibility:** This task provides a dedicated development and debugging environment that validates the ItemCapture component's behavior, output structure, and local-only operation before integration into the main application.

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
5.4 onComplete Assembly
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
| Task 5.4 (onComplete Assembly) | Required | onComplete must emit properly formatted ItemRecord |
| Phase 1 (Foundation) | Required | ItemCapture component must exist |
| Phase 2 (Media Capture) | Required | Video/photo capture functional |
| Phase 3 (File Upload & Text) | Required | Upload and markdown functional |
| Phase 4 (Editing Features) | Required | Editing workflow complete |
| Task 5.5 (Performance Optimization) | Parallel | Can develop simultaneously |

### Related Spike Work

| Spike | Status | Relevance |
|-------|--------|-----------|
| REQ-028 (Bundle Analysis) | Complete | Validates lazy loading works correctly |
| REQ-029 (iOS Safari MediaRecorder) | In Progress | Browser-specific capture behavior |

### This Task's Scope

Task 5.6 creates a **development utility page** that:
- Does NOT modify the ItemCapture component itself
- Provides a controlled environment for testing
- Enables visual verification of data output
- Confirms zero backend dependencies

---

## 3. Technical Approach

### 3.1 Page Route Structure

The test harness follows existing test page patterns in the codebase (see `/src/app/test/bundle-test/page.tsx`).

**Route:** `/test/item-capture`
**File:** `/src/app/test/item-capture/page.tsx`

### 3.2 Component Architecture

```
/src/app/test/item-capture/
└── page.tsx                    # Test harness page component
```

The page component will:
1. Import and render the ItemCapture component
2. Provide callback handlers that log to console
3. Display test controls and status indicators
4. Optionally show formatted output for quick inspection

### 3.3 Console Output Strategy

The `onComplete` callback will output structured data to the browser console using a custom replacer function to handle non-serializable types:

**Blob/File Handling:**
```typescript
// Blobs are not JSON serializable - convert to descriptive format
(key, value) => {
  if (value instanceof Blob) {
    return `[Blob: ${value.size} bytes, ${value.type}]`;
  }
  if (value instanceof File) {
    return `[File: ${value.name}, ${value.size} bytes, ${value.type}]`;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}
```

**Console Output Format:**
```
=== ITEM CAPTURE OUTPUT ===
{
  "id": "uuid-here",
  "title": "Washing Machine",
  "location": "Laundry Room",
  "tags": ["appliances", "laundry"],
  "applianceType": "washer",
  "contentType": "mixed",
  "media": [
    {
      "id": "media-uuid",
      "type": "video",
      "file": "[Blob: 15234567 bytes, video/webm]",
      "thumbnail": "[Blob: 45678 bytes, image/png]",
      "order": 0,
      "metadata": {
        "duration": 45,
        "dimensions": { "width": 1920, "height": 1080 },
        "mimeType": "video/webm",
        "fileSize": 15234567,
        "source": "capture"
      }
    }
  ],
  "instructions": "## How to Use\n\n1. Open the lid...",
  "createdAt": "2025-12-31T15:00:00.000Z"
}
```

### 3.4 Network Isolation Verification

The test harness helps developers verify network isolation by:

1. **Visual Reminder** - Instruction text reminding to open Network tab
2. **Timestamp Logging** - Log session start/end times for easy filtering
3. **onComplete Verification** - Confirm callback fires locally without API calls

**Developer Workflow:**
1. Open browser DevTools → Network tab
2. Clear existing requests
3. Navigate to `/test/item-capture`
4. Complete entire wizard flow
5. Verify only static asset requests (JS chunks, if any)
6. Confirm NO API requests to `/api/*` endpoints

### 3.5 Cancel Flow Testing

The `onCancel` callback logs to console, enabling verification of:
- Cancel from any wizard step
- Back button behavior
- Modal dismiss behavior

---

## 4. Files to Create

### 4.1 Test Harness Page

| File Path | Purpose |
|-----------|---------|
| `src/app/test/item-capture/page.tsx` | Main test harness page component |

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Modification Type |
|-----------|-------------------|
| `src/app/test/item-capture/page.tsx` | New file - test harness page |

### Files to REFERENCE (Read-Only Patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/app/test/bundle-test/page.tsx` | Existing test page structure and styling |
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions for props and output |
| `docs/prd/item-capture-implementation-plan.md` | Test harness validation code reference |
| `src/components/ItemCapture/index.ts` | Public export for importing component |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCapture/**/*` | Test harness should not modify component logic |
| `src/app/layout.tsx` | No changes needed for test route |
| Any API routes | Zero network interaction by design |

---

## 6. Implementation Details

### 6.1 Test Harness Page Component

```typescript
// src/app/test/item-capture/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { ItemCapture, ItemRecord } from '@/components/ItemCapture';

export default function TestItemCapturePage() {
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Custom JSON replacer for non-serializable types
  const jsonReplacer = useCallback((key: string, value: unknown): unknown => {
    if (value instanceof Blob) {
      return `[Blob: ${value.size} bytes, ${value.type}]`;
    }
    if (value instanceof File) {
      return `[File: ${(value as File).name}, ${value.size} bytes, ${value.type}]`;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }, []);

  const handleComplete = useCallback((record: ItemRecord) => {
    const timestamp = new Date().toISOString();
    const formatted = JSON.stringify(record, jsonReplacer, 2);

    // Console output
    console.log('='.repeat(50));
    console.log(`=== ITEM CAPTURE OUTPUT [${timestamp}] ===`);
    console.log('='.repeat(50));
    console.log(formatted);
    console.log('='.repeat(50));

    // Update UI state
    setLastOutput(formatted);
    setSessionCount(prev => prev + 1);
  }, [jsonReplacer]);

  const handleCancel = useCallback(() => {
    const timestamp = new Date().toISOString();

    console.log('='.repeat(50));
    console.log(`=== ITEM CAPTURE CANCELLED [${timestamp}] ===`);
    console.log('='.repeat(50));

    setLastOutput(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              ItemCapture Test Harness
            </h1>
            <p className="text-sm text-gray-500">
              Development & debugging environment
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Sessions completed: <span className="font-mono font-bold">{sessionCount}</span>
            </p>
            <p className="text-xs text-gray-400">
              Open DevTools → Network to verify zero requests
            </p>
          </div>
        </div>
      </header>

      {/* ItemCapture Component */}
      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <ItemCapture
            onComplete={handleComplete}
            onCancel={handleCancel}
            config={{
              debug: true,
              maxVideoDuration: 120,
              maxPhotos: 10,
            }}
          />
        </div>
      </main>

      {/* Last Output Preview (Optional) */}
      {lastOutput && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-green-400 p-4 max-h-48 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-400">
              Last onComplete output (also logged to console):
            </span>
            <button
              onClick={() => setLastOutput(null)}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Dismiss
            </button>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {lastOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
```

### 6.2 Key Implementation Notes

**1. 'use client' Directive**
- Required because ItemCapture uses browser APIs (MediaDevices, canvas, etc.)
- Matches existing pattern in `bundle-test/page.tsx`

**2. Debug Mode Enabled**
- `config.debug: true` enables verbose logging inside ItemCapture
- Helpful for tracking state transitions and media operations

**3. Session Counter**
- Tracks multiple capture sessions without page reload
- Useful for memory leak testing (compare with Task 5.5)

**4. Optional Output Preview**
- Shows formatted output at bottom of screen
- Dismissible to focus on next capture session
- Primary inspection still via DevTools console

**5. No Authentication**
- Page accessible at `/test/item-capture` without login
- Located under `/test/` path convention for dev utilities

---

## 7. Acceptance Criteria Mapping

Based on REQ-055 in gen_requests.md:

| Requirement | Implementation |
|-------------|----------------|
| Test page accessible at designated route | `/test/item-capture` path |
| Completing wizard triggers console output | `console.log()` in handleComplete with formatted JSON |
| Console output includes all expected fields | JSON.stringify with custom replacer for Blob/File/Date |
| Browser network monitor shows zero requests | No API calls in component; header reminder to check Network tab |
| Test page accessible without authentication | No auth middleware on `/test/*` routes |
| Console output clearly formatted | Separator lines, timestamp, 2-space indentation |

---

## 8. Testing Approach

### Manual Testing Checklist

- [ ] Navigate to `/test/item-capture` without login
- [ ] Complete full video capture flow → verify console output
- [ ] Complete full photo capture flow → verify console output
- [ ] Complete file upload flow → verify console output
- [ ] Complete text-only flow → verify console output
- [ ] Complete mixed content flow → verify console output
- [ ] Cancel at various steps → verify cancel message logged
- [ ] Open Network tab during full flow → verify zero API requests
- [ ] Complete 5 consecutive sessions → verify session counter increments
- [ ] Verify output includes: id, title, location, tags, applianceType, contentType, media array, instructions, createdAt

### Network Isolation Verification Steps

1. Open DevTools → Network tab
2. Enable "Preserve log" checkbox
3. Filter to "Fetch/XHR" requests only
4. Navigate to `/test/item-capture`
5. Complete entire wizard workflow
6. Check Network tab: should show ZERO Fetch/XHR requests
7. Only static asset requests (JS chunks) are acceptable

### Console Output Verification

1. Open DevTools → Console tab
2. Filter by "ITEM CAPTURE" text
3. Complete wizard
4. Verify output contains:
   - Separator lines
   - Timestamp
   - All ItemRecord fields
   - Blob/File represented as `[Blob: X bytes, type]` format
   - Date represented as ISO string

---

## 9. Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemCapture component not yet complete | Medium | High | Task depends on Phase 1-4 completion; can stub with placeholder |
| Types not exported from ItemCapture | Low | Medium | Ensure index.ts exports ItemRecord type |
| Test route conflicts with production | Low | Low | `/test/*` path convention keeps dev routes isolated |
| Console output too verbose | Low | Low | Use collapsible console.group() if needed |
| Memory leaks visible in harness | Low | Medium | Session counter helps identify; coordinate with Task 5.5 |

---

## 10. Implementation Order

1. **Step 1: Create Directory** (5 min)
   - Create `/src/app/test/item-capture/` directory

2. **Step 2: Create Page Component** (30 min)
   - Create `page.tsx` with basic structure
   - Import ItemCapture component
   - Implement handleComplete with JSON formatting
   - Implement handleCancel with logging

3. **Step 3: Add UI Enhancements** (15 min)
   - Add header with instructions
   - Add session counter
   - Add optional output preview panel

4. **Step 4: Verify Functionality** (30 min)
   - Test all capture flows
   - Verify console output format
   - Verify network isolation
   - Test multiple sessions

---

## 11. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 5.4 | onComplete Assembly | Preceding - ensures ItemRecord format is correct |
| 5.5 | Performance Optimization | Parallel - harness useful for memory testing |
| 5.3 | Validation Layer | Preceding - ensures validation works before testing |
| REQ-028 | Bundle Analysis | Reference - validates lazy loading in test environment |

---

## 12. Open Questions

1. **Output Preview Panel:** Should the on-screen output preview be included, or is console-only sufficient?
   - **Recommendation:** Include for convenience, but make dismissible

2. **Config Controls:** Should the test page include UI controls to modify `config` options?
   - **Recommendation:** Not in V1 - hardcode sensible defaults; add controls in V2 if needed

3. **Reset Button:** Should there be a button to reset the wizard without page reload?
   - **Recommendation:** The component should handle this via Cancel → re-render; no extra button needed

4. **Mobile Testing:** Should the test page be mobile-responsive?
   - **Recommendation:** Yes - ItemCapture is mobile-first, so test page should work on mobile devices

5. **Error Logging:** Should the test page capture and display ItemCapture errors?
   - **Recommendation:** Errors should surface in console via component's debug mode; no extra handling needed

---

## 13. References

- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 5, Task 5.6, Test Harness Validation section
- [Bundle Test Page](/src/app/test/bundle-test/page.tsx) - Existing test page pattern
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - Props and output interfaces
- [Next.js App Router](https://nextjs.org/docs/app) - Route structure
- [Chrome DevTools Console](https://developer.chrome.com/docs/devtools/console/) - Console API reference
- [Chrome DevTools Network](https://developer.chrome.com/docs/devtools/network/) - Network monitoring

---

## Appendix A: Expected ItemRecord Structure

Reference from Implementation Plan:

```typescript
interface ItemRecord {
  id: string;                        // Local UUID
  title: string;                     // Required
  location?: string;                 // e.g., "Kitchen", "Master Bathroom"
  tags?: string[];                   // e.g., ["appliances", "laundry"]
  applianceType?: ApplianceType;     // e.g., "washer", "dryer"
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';
  media: MediaItem[];                // Captured/uploaded media
  instructions?: string;             // Markdown text
  createdAt: Date;                   // Timestamp
}

interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file: File | Blob;
  thumbnail?: Blob;
  order: number;
  metadata: MediaMetadata;
}
```

---

## Appendix B: Console Output Example

```
==================================================
=== ITEM CAPTURE OUTPUT [2025-12-31T15:30:45.123Z] ===
==================================================
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Samsung Front Load Washer",
  "location": "Laundry Room",
  "tags": [
    "appliances",
    "laundry",
    "samsung"
  ],
  "applianceType": "washer",
  "contentType": "mixed",
  "media": [
    {
      "id": "m1-uuid-here",
      "type": "video",
      "file": "[Blob: 15234567 bytes, video/webm]",
      "thumbnail": "[Blob: 45678 bytes, image/png]",
      "order": 0,
      "metadata": {
        "duration": 45.2,
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "mimeType": "video/webm",
        "fileSize": 15234567,
        "source": "capture"
      }
    },
    {
      "id": "m2-uuid-here",
      "type": "image",
      "file": "[Blob: 234567 bytes, image/jpeg]",
      "thumbnail": "[Blob: 12345 bytes, image/png]",
      "order": 1,
      "metadata": {
        "dimensions": {
          "width": 4032,
          "height": 3024
        },
        "mimeType": "image/jpeg",
        "fileSize": 234567,
        "source": "capture",
        "edits": {
          "cropped": true,
          "rotated": 90
        }
      }
    }
  ],
  "instructions": "## How to Use the Washing Machine\n\n1. Open the door\n2. Add clothes...",
  "createdAt": "2025-12-31T15:30:45.123Z"
}
==================================================
```
