# REQ-055: Developer Test Harness for Item Capture Wizard - Detailed Task Breakdown

**Document Created:** 2025-12-31T18:45:00
**Last Modified:** 2025-12-31T18:45:00
**Request Reference:** `/docs/gen_requests.md` (REQ-055)
**Overview Document:** `/docs/REQ-055-create-test-harness-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.6
**Status:** Ready for Implementation

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating a developer test harness page at `/test/item-capture`. The test harness enables isolated testing of the ItemCapture wizard, console output inspection, and network isolation verification without requiring integration into the main application.

**Total Tasks:** 8
**Estimated Effort:** ~3-4 hours focused work
**Dependencies:** Task 5.4 (onComplete Assembly) must be complete

---

## Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/app/test/item-capture/page.tsx` | Main test harness page component |

### Files to REFERENCE (Read-Only)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/app/test/bundle-test/page.tsx` | Existing test page structure and styling |
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions for props and output |
| `src/components/ItemCapture/index.ts` | Public export for importing component |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCapture/**/*` | Test harness must not modify component logic |
| `src/app/layout.tsx` | No changes needed for test route |
| Any API routes under `src/app/api/**` | Zero network interaction by design |

---

## Task Breakdown

### Task 1: Create test page directory structure

**Objective:** Create the directory structure for the test harness page following Next.js App Router conventions.

**Story Points:** 0.25 (15 minutes)

**Steps:**
1. Create directory `src/app/test/item-capture/`
2. Verify the directory is created in the correct location alongside `src/app/test/bundle-test/`

**Files to Create:**
- `src/app/test/item-capture/` (directory only)

**Verification:**
- [ ] Directory exists at `src/app/test/item-capture/`
- [ ] Directory structure matches existing `src/app/test/bundle-test/` pattern

**Dependencies:** None

---

### Task 2: Create base page component with 'use client' directive

**Objective:** Create the initial page.tsx file with proper client-side rendering setup and basic page structure.

**Story Points:** 0.5 (30 minutes)

**Steps:**
1. Create `src/app/test/item-capture/page.tsx`
2. Add `'use client'` directive at the top (required for useState, useCallback, and browser APIs)
3. Import React hooks: `useState`, `useCallback`
4. Create default export function `TestItemCapturePage`
5. Add basic page structure with header and main content area
6. Apply styling consistent with `bundle-test/page.tsx` (Tailwind classes)

**Code Structure:**
```typescript
'use client';

import { useState, useCallback } from 'react';

export default function TestItemCapturePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header section */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        {/* Header content */}
      </header>

      {/* Main content */}
      <main className="p-4">
        {/* ItemCapture will render here */}
      </main>
    </div>
  );
}
```

**Files to Create:**
- `src/app/test/item-capture/page.tsx`

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Page loads at `http://localhost:3000/test/item-capture`
- [ ] Basic structure renders without JavaScript errors

**Dependencies:** Task 1

---

### Task 3: Implement JSON replacer for non-serializable types

**Objective:** Create a reusable JSON replacer function that converts Blob, File, and Date objects to human-readable string representations for console output.

**Story Points:** 0.5 (30 minutes)

**Steps:**
1. Add `useCallback` hook for `jsonReplacer` function
2. Handle `Blob` type: return `[Blob: {size} bytes, {type}]`
3. Handle `File` type: return `[File: {name}, {size} bytes, {type}]`
4. Handle `Date` type: return ISO string via `toISOString()`
5. Return unchanged value for all other types

**Implementation Details:**
```typescript
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
```

**Files to Modify:**
- `src/app/test/item-capture/page.tsx`

**Verification:**
- [ ] Replacer correctly handles Blob objects
- [ ] Replacer correctly handles File objects with filename
- [ ] Replacer correctly converts Date to ISO string format
- [ ] Replacer passes through primitive types unchanged

**Dependencies:** Task 2

---

### Task 4: Implement handleComplete callback with console output

**Objective:** Create the callback function that logs structured ItemRecord data to the browser console with clear formatting.

**Story Points:** 0.5 (30 minutes)

**Steps:**
1. Import `ItemRecord` type from `@/components/ItemCapture`
2. Add `lastOutput` state: `useState<string | null>(null)`
3. Add `sessionCount` state: `useState(0)`
4. Create `handleComplete` callback with `useCallback` hook
5. Generate timestamp using `new Date().toISOString()`
6. Format record using `JSON.stringify(record, jsonReplacer, 2)`
7. Output to console with separator lines and timestamp header
8. Update `lastOutput` and increment `sessionCount` states

**Console Output Format:**
```
==================================================
=== ITEM CAPTURE OUTPUT [2025-12-31T15:30:45.123Z] ===
==================================================
{
  // formatted JSON here
}
==================================================
```

**Files to Modify:**
- `src/app/test/item-capture/page.tsx`

**Verification:**
- [ ] Console output includes separator lines (50 '=' characters)
- [ ] Console output includes ISO timestamp
- [ ] JSON is formatted with 2-space indentation
- [ ] Blob/File/Date types are rendered as descriptive strings
- [ ] `sessionCount` increments on each complete

**Dependencies:** Task 3

---

### Task 5: Implement handleCancel callback with console logging

**Objective:** Create the callback function that logs cancellation events to the browser console.

**Story Points:** 0.25 (15 minutes)

**Steps:**
1. Create `handleCancel` callback with `useCallback` hook
2. Generate timestamp using `new Date().toISOString()`
3. Output cancel message to console with separator lines
4. Set `lastOutput` state to `null` to clear any previous output display

**Console Output Format:**
```
==================================================
=== ITEM CAPTURE CANCELLED [2025-12-31T15:30:45.123Z] ===
==================================================
```

**Files to Modify:**
- `src/app/test/item-capture/page.tsx`

**Verification:**
- [ ] Cancel message logged with separator lines
- [ ] Cancel message includes ISO timestamp
- [ ] `lastOutput` state is cleared on cancel

**Dependencies:** Task 2

---

### Task 6: Integrate ItemCapture component with callbacks

**Objective:** Import and render the ItemCapture component with the configured callbacks and debug-enabled configuration.

**Story Points:** 0.5 (30 minutes)

**Steps:**
1. Add import statement: `import { ItemCapture, ItemRecord } from '@/components/ItemCapture'`
2. Render ItemCapture component inside main content area
3. Pass `onComplete={handleComplete}` prop
4. Pass `onCancel={handleCancel}` prop
5. Pass `config` prop with debug mode enabled and sensible defaults:
   - `debug: true`
   - `maxVideoDuration: 120`
   - `maxPhotos: 10`
6. Wrap ItemCapture in a max-width container for consistent layout

**Implementation:**
```tsx
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
```

**Files to Modify:**
- `src/app/test/item-capture/page.tsx`

**Verification:**
- [ ] ItemCapture component renders without errors
- [ ] Completing wizard triggers handleComplete callback
- [ ] Cancelling wizard triggers handleCancel callback
- [ ] Debug mode is active (verbose logging in console from component)

**Dependencies:** Tasks 4, 5

---

### Task 7: Add header with session counter and DevTools reminder

**Objective:** Create an informative header that displays session statistics and reminds developers to check the Network tab for isolation verification.

**Story Points:** 0.5 (30 minutes)

**Steps:**
1. Create header section with white background and bottom border
2. Add page title: "ItemCapture Test Harness"
3. Add subtitle: "Development & debugging environment"
4. Display session counter: "Sessions completed: {sessionCount}"
5. Add DevTools reminder: "Open DevTools → Network to verify zero requests"
6. Apply responsive layout (flex with justify-between)
7. Use appropriate typography (font sizes, colors, weights)

**Styling Requirements:**
- Header background: white (`bg-white`)
- Border: bottom only, gray-200 (`border-b border-gray-200`)
- Padding: `px-4 py-3`
- Max-width container: `max-w-4xl mx-auto`
- Title: `text-xl font-bold text-gray-900`
- Subtitle: `text-sm text-gray-500`
- Session count: `text-sm text-gray-600` with `font-mono font-bold` for number
- DevTools reminder: `text-xs text-gray-400`

**Files to Modify:**
- `src/app/test/item-capture/page.tsx`

**Verification:**
- [ ] Header displays title and subtitle
- [ ] Session counter shows current count (starts at 0)
- [ ] Session counter updates when wizard completes
- [ ] DevTools reminder is visible
- [ ] Layout is responsive on mobile and desktop

**Dependencies:** Task 4 (needs sessionCount state)

---

### Task 8: Add optional output preview panel

**Objective:** Create a dismissible panel that displays the last onComplete output at the bottom of the screen for quick visual inspection.

**Story Points:** 0.5 (30 minutes)

**Steps:**
1. Create conditionally rendered panel (only when `lastOutput` is not null)
2. Position panel fixed at bottom of viewport
3. Style with dark background and green monospace text (terminal aesthetic)
4. Add scrollable content area with max height
5. Add "Dismiss" button to clear the panel
6. Display label: "Last onComplete output (also logged to console):"
7. Render `lastOutput` in preformatted text element

**Styling Requirements:**
- Position: fixed bottom (`fixed bottom-0 left-0 right-0`)
- Background: dark gray (`bg-gray-900`)
- Text color: green (`text-green-400`)
- Padding: `p-4`
- Max height: `max-h-48`
- Overflow: `overflow-auto`
- Label: `text-xs font-mono text-gray-400`
- Dismiss button: `text-xs text-gray-500 hover:text-gray-300`
- Output text: `text-xs font-mono whitespace-pre-wrap`

**Implementation:**
```tsx
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
```

**Files to Modify:**
- `src/app/test/item-capture/page.tsx`

**Verification:**
- [ ] Panel does not appear when `lastOutput` is null
- [ ] Panel appears at bottom of screen after wizard completion
- [ ] Panel is scrollable when content exceeds max height
- [ ] Dismiss button clears the panel
- [ ] JSON output is formatted with proper indentation
- [ ] Panel does not interfere with ItemCapture component interaction

**Dependencies:** Task 4 (needs lastOutput state)

---

## Complete File Reference

After completing all tasks, the final file structure will be:

```
src/app/test/item-capture/
└── page.tsx    # Complete test harness page (~100-120 lines)
```

---

## Testing Checklist

### Functional Verification

- [ ] Navigate to `/test/item-capture` without login
- [ ] Page loads without JavaScript errors
- [ ] ItemCapture component renders correctly
- [ ] Complete full video capture flow → verify console output
- [ ] Complete full photo capture flow → verify console output
- [ ] Complete file upload flow → verify console output
- [ ] Complete text-only flow → verify console output
- [ ] Complete mixed content flow → verify console output
- [ ] Cancel at various wizard steps → verify cancel message logged
- [ ] Session counter increments on each successful completion
- [ ] Output preview panel appears after completion
- [ ] Dismiss button clears preview panel

### Console Output Verification

- [ ] Output includes separator lines (50 '=' characters)
- [ ] Output includes ISO timestamp
- [ ] Output includes formatted JSON with 2-space indentation
- [ ] Blob objects display as `[Blob: X bytes, type]`
- [ ] File objects display as `[File: name, X bytes, type]`
- [ ] Date objects display as ISO strings
- [ ] All ItemRecord fields present: id, title, location, tags, applianceType, contentType, media, instructions, createdAt

### Network Isolation Verification

1. Open browser DevTools → Network tab
2. Enable "Preserve log" checkbox
3. Filter to "Fetch/XHR" requests only
4. Navigate to `/test/item-capture`
5. Complete entire wizard workflow
6. Verify Network tab shows **zero** Fetch/XHR requests
7. Only static asset requests (JS chunks) are acceptable

### Cross-Browser Testing

- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Desktop (macOS)
- [ ] Chrome Android
- [ ] Safari iOS

---

## Acceptance Criteria Mapping

| Requirement from REQ-055 | Task | Verification Method |
|--------------------------|------|---------------------|
| Test page accessible at designated route | Task 1, 2 | Navigate to `/test/item-capture` |
| Completing wizard triggers console output | Task 4 | Check browser DevTools Console |
| Console output includes all expected fields | Task 3, 4 | Verify JSON structure in console |
| Browser network monitor shows zero requests | Task 6 | Check DevTools Network tab |
| Test page accessible without authentication | Task 2 | Navigate directly without login |
| Console output clearly formatted | Task 4 | Verify separators, timestamp, indentation |

---

## Implementation Notes

### Pattern Consistency

- Follow `bundle-test/page.tsx` patterns for test page structure
- Use Tailwind CSS classes consistent with existing codebase
- Apply `'use client'` directive as required for browser API usage

### Error Handling

- If ItemCapture component is not yet complete, the page will show import errors
- The test harness itself does not require error boundaries (errors surface in console via debug mode)
- Invalid ItemRecord structure will be visible in console output for debugging

### Future Enhancements (V2 - Not in Scope)

- UI controls to modify config options dynamically
- Reset button to clear wizard state without page reload
- Memory usage display for performance monitoring
- Multiple capture session comparison

---

## References

- [Overview Document](/docs/REQ-055-create-test-harness-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 5, Task 5.6
- [Bundle Test Page](/src/app/test/bundle-test/page.tsx) - Existing test page pattern
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts) - Props and output interfaces
- [Chrome DevTools Console](https://developer.chrome.com/docs/devtools/console/)
- [Chrome DevTools Network](https://developer.chrome.com/docs/devtools/network/)
