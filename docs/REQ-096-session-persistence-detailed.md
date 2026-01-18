# REQ-096: Session Persistence for Workflow State - Detailed Task Breakdown

**Generated:** 2026-01-05 19:45:00 UTC
**Last Modified:** 2026-01-05 03:17:00 UTC (Implementation Complete)
**Overview Document:** docs/REQ-096-session-persistence-overview.md
**Request Reference:** REQ-096 in docs/gen_requests.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md
**Phase:** 1 - Foundation & Core Infrastructure
**Task ID:** 1.4

---

## Executive Summary

This document provides granular, actionable implementation tasks for the session persistence feature (REQ-096). Each task is scoped to approximately 1 story point (a few hours of focused work) and includes verification steps.

The implementation creates a `useSessionPersistence` hook and supporting utilities that:
- Auto-save workflow state to localStorage on changes (debounced)
- Restore previous session on component mount
- Handle session expiration (24 hours)
- Support multiple independent sessions
- Clean up storage when workflow completes

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/utils/sessionStorage.ts` | LocalStorage utilities for state serialization, persistence, and recovery |
| `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts` | Hook for auto-save and session recovery |
| `src/components/ItemCreationWorkflow/utils/__tests__/sessionStorage.test.ts` | Unit tests for storage utilities |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test.ts` | Unit tests for persistence hook |

### Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Add export for useSessionPersistence and types (line 21 - uncomment) |
| `src/components/ItemCreationWorkflow/utils/index.ts` | Add export for sessionStorage utilities (line 15 - uncomment) |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/session.ts` | Pattern reference for localStorage handling |
| `src/components/ItemManager/hooks/useItemManagerState.ts:256-274` | Pattern reference for persistence in hooks |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State structure to persist |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for serialization |

---

## Task Breakdown

### Task 1: Create Storage Constants and Serialized Type Definitions

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Create the sessionStorage.ts file with constants and serialized type definitions. These types mirror the WorkflowState but with JSON-safe representations (Dates as ISO strings, binary data marked as needing re-upload).

**Implementation Steps:**

1. Create the file at `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`
2. Add file header comment with module documentation
3. Define constants:
   - `STORAGE_KEY_PREFIX = 'faqbnb_workflow_'`
   - `STORAGE_INDEX_KEY = 'faqbnb_workflow_sessions'`
   - `MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000` (24 hours)
4. Define serialized type interfaces:
   - `SerializedWorkflowState` - mirrors WorkflowState with string dates
   - `SerializedWorkflowSession` - session with ISO date strings
   - `SerializedSessionItem` - item with ISO createdAt
   - `SerializedCurrentItemState` - with hasUnserializableContent flag
   - `SerializedContentPiece` - without thumbnail
   - `SerializedContentData` - text/url preserved, binary marked as needsReUpload
   - `StoredSession` - wrapper with savedAt timestamp
5. Import types from `../ItemCreationWorkflow.types`

**Verification Steps:**
- [ ] File compiles without TypeScript errors
- [ ] All serialized types align with WorkflowState structure
- [ ] Constants are exported

**Code Pattern Reference:**
```typescript
// From src/lib/session.ts
const SESSION_EXPIRY_HOURS = 24;
const SESSION_EXPIRY_MS = SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
```

---

### Task 2: Implement isLocalStorageAvailable Function

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Add the `isLocalStorageAvailable` function that safely checks for localStorage availability, handling SSR (window undefined) and private browsing mode (localStorage throws).

**Implementation Steps:**

1. Add `isLocalStorageAvailable()` function after constants
2. Handle SSR case: check `typeof window === 'undefined'`
3. Handle missing localStorage: check `!window.localStorage`
4. Test availability with write/read/delete cycle
5. Use test key `'__faqbnb_localStorage_test__'`
6. Return false and log warning if any check fails
7. Export the function

**Verification Steps:**
- [ ] Function returns false when window is undefined (test in Node environment)
- [ ] Function returns true in normal browser context
- [ ] Function returns false when localStorage throws (private mode simulation)
- [ ] Console warning logged on failure

**Code Pattern Reference:**
```typescript
// From src/lib/session.ts:47-62
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__faqbnb_localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
}
```

---

### Task 3: Implement getStorageKey Utility

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Add a simple utility function to generate consistent storage keys for workflow sessions.

**Implementation Steps:**

1. Add `getStorageKey(sessionId: string): string` function
2. Return `${STORAGE_KEY_PREFIX}${sessionId}`
3. Export the function

**Verification Steps:**
- [ ] `getStorageKey('abc-123')` returns `'faqbnb_workflow_abc-123'`
- [ ] Function is exported

---

### Task 4: Implement State Serialization Functions

**Story Points:** 1
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement the serialization functions that convert WorkflowState to JSON-safe format. Dates become ISO strings, File/Blob content is marked as needing re-upload.

**Implementation Steps:**

1. Add `serializeState(state: WorkflowState): SerializedWorkflowState` function
2. Convert `state.session.startedAt` to ISO string
3. Map `state.session.items` with serialized content and dates
4. Serialize `state.session.currentItem` if present
5. Serialize `state.currentItem` if present
6. Add helper `serializeCurrentItem(item: CurrentItemState): SerializedCurrentItemState`
   - Set `hasUnserializableContent` flag if any binary content
7. Add helper `serializeContentPieces(content: ContentPiece[]): SerializedContentPiece[]`
   - Exclude `thumbnail` property
8. Add helper `serializeContentData(data: ContentData): SerializedContentData`
   - Preserve text content: `{ type: 'text', text: data.text }`
   - Preserve URL content: `{ type: 'url', url, title?, thumbnailUrl?, faviconUrl? }`
   - Mark binary content: `{ type: data.type, needsReUpload: true }`
9. Export `serializeState`

**Verification Steps:**
- [ ] Date objects converted to ISO strings
- [ ] Text content preserved exactly
- [ ] URL content preserved with all metadata
- [ ] Video/Photo/PDF content marked with `needsReUpload: true`
- [ ] `thumbnail` property excluded from ContentPiece
- [ ] `isSubmitting` and `submitError` not included (transient state)

---

### Task 5: Implement State Deserialization Functions

**Story Points:** 1
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement deserialization functions that convert stored JSON back to WorkflowState. ISO strings become Dates, and binary content placeholders are restored.

**Implementation Steps:**

1. Add `deserializeState(stored: SerializedWorkflowState): Partial<WorkflowState>` function
2. Convert `stored.session.startedAt` to Date object
3. Map `stored.session.items` with deserialized content and dates
4. Deserialize `stored.session.currentItem` if present
5. Deserialize `stored.currentItem` if present
6. Set defaults: `isSubmitting: false`, `submitError: null`
7. Add helper `deserializeCurrentItem(item: SerializedCurrentItemState): CurrentItemState`
8. Add helper `deserializeContentPieces(content: SerializedContentPiece[]): ContentPiece[]`
   - Note: `thumbnail` not restored (will need regeneration)
9. Add helper `deserializeContentData(data: SerializedContentData): ContentData`
   - Restore text content as-is
   - Restore URL content as-is
   - For binary: return `{ type, file: new Blob([]), needsReUpload: true }`
10. Export `deserializeState`

**Verification Steps:**
- [ ] ISO strings converted back to Date objects
- [ ] Text and URL content restored exactly
- [ ] Binary content has placeholder Blob with `needsReUpload` flag
- [ ] `isSubmitting` and `submitError` set to safe defaults
- [ ] RoomType and ItemType enums properly cast

---

### Task 6: Implement saveWorkflowState Function

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement the function that saves serialized workflow state to localStorage with error handling.

**Implementation Steps:**

1. Add `saveWorkflowState(state: WorkflowState): boolean` function
2. Check localStorage availability; return false if unavailable
3. Serialize state using `serializeState()`
4. Create `StoredSession` object with `state` and `savedAt: Date.now()`
5. Generate key using `getStorageKey(state.session.id)`
6. Write to localStorage with `JSON.stringify()`
7. Call `updateSessionIndex(state.session.id)` (to be implemented)
8. Return true on success
9. Catch errors, log, and return false
10. Export the function

**Verification Steps:**
- [ ] State saved to correct key in localStorage
- [ ] `savedAt` timestamp included
- [ ] Returns true on success
- [ ] Returns false when localStorage unavailable
- [ ] Returns false on JSON serialization error (circular ref, etc.)
- [ ] Error logged on failure

---

### Task 7: Implement loadWorkflowState Function

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement the function that loads and validates a workflow session by ID, enforcing expiration.

**Implementation Steps:**

1. Add `loadWorkflowState(sessionId: string): Partial<WorkflowState> | null` function
2. Check localStorage availability; return null if unavailable
3. Generate key using `getStorageKey(sessionId)`
4. Read from localStorage
5. Return null if key not found
6. Parse JSON to `StoredSession`
7. Check expiration: `Date.now() - parsed.savedAt > MAX_SESSION_AGE_MS`
8. If expired: log info, call `clearWorkflowState(sessionId)`, return null
9. Deserialize state using `deserializeState()`
10. Return deserialized state
11. On parse error: log, clear corrupted data, return null
12. Export the function

**Verification Steps:**
- [ ] Returns null when localStorage unavailable
- [ ] Returns null when key not found
- [ ] Returns null for expired sessions (>24 hours)
- [ ] Expired sessions are cleared from storage
- [ ] Corrupted JSON data is cleared
- [ ] Valid session is properly deserialized

---

### Task 8: Implement loadMostRecentWorkflowState Function

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement the function that loads the most recently saved workflow session without requiring a specific session ID.

**Implementation Steps:**

1. Add `loadMostRecentWorkflowState(): Partial<WorkflowState> | null` function
2. Call `getActiveSessionIds()` to get sorted session IDs
3. Return null if no active sessions
4. Iterate through session IDs (most recent first)
5. Try to load each session using `loadWorkflowState()`
6. Return first successfully loaded state
7. Return null if all sessions expired/invalid
8. Export the function

**Verification Steps:**
- [ ] Returns null when no sessions exist
- [ ] Returns most recent valid session
- [ ] Skips expired sessions and tries next
- [ ] Cleans up expired sessions during iteration

---

### Task 9: Implement clearWorkflowState Function

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement the function that removes a specific session from localStorage.

**Implementation Steps:**

1. Add `clearWorkflowState(sessionId: string): void` function
2. Check localStorage availability; return if unavailable
3. Generate key using `getStorageKey(sessionId)`
4. Remove from localStorage using `window.localStorage.removeItem(key)`
5. Call `removeFromSessionIndex(sessionId)` (to be implemented)
6. Catch and log any errors
7. Export the function

**Verification Steps:**
- [ ] Session removed from localStorage
- [ ] Session removed from index
- [ ] No error when session doesn't exist
- [ ] Graceful handling when localStorage unavailable

---

### Task 10: Implement clearAllWorkflowStates Function

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement the function that removes all workflow sessions from localStorage.

**Implementation Steps:**

1. Add `clearAllWorkflowStates(): void` function
2. Check localStorage availability; return if unavailable
3. Get all session IDs using `getActiveSessionIds()`
4. Iterate and remove each using `getStorageKey(id)` + `removeItem`
5. Remove the index key `STORAGE_INDEX_KEY`
6. Catch and log any errors
7. Export the function

**Verification Steps:**
- [ ] All workflow sessions removed
- [ ] Index key removed
- [ ] No error when no sessions exist
- [ ] Graceful handling when localStorage unavailable

---

### Task 11: Implement Session Index Management Functions

**Story Points:** 0.75
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Implement functions to manage the session index that tracks all active session IDs.

**Implementation Steps:**

1. Add `getActiveSessionIds(): string[]` function
   - Check localStorage availability; return empty array if unavailable
   - Read `STORAGE_INDEX_KEY` from localStorage
   - Parse JSON to `Array<{ id: string; savedAt: number }>`
   - Filter out expired sessions (`now - savedAt > MAX_SESSION_AGE_MS`)
   - Sort by `savedAt` descending (most recent first)
   - Return array of `id` strings

2. Add private `updateSessionIndex(sessionId: string): void` function
   - Read current index
   - Filter out existing entry for this sessionId
   - Unshift new entry `{ id: sessionId, savedAt: Date.now() }`
   - Limit to 10 sessions (slice first 10)
   - Write back to storage

3. Add private `removeFromSessionIndex(sessionId: string): void` function
   - Read current index
   - Filter out entry for sessionId
   - Write back to storage

4. Export `getActiveSessionIds`

**Verification Steps:**
- [ ] `getActiveSessionIds` returns empty array when no sessions
- [ ] `getActiveSessionIds` filters expired sessions
- [ ] `getActiveSessionIds` returns most recent first
- [ ] `updateSessionIndex` adds new sessions to front
- [ ] `updateSessionIndex` limits to 10 sessions
- [ ] `removeFromSessionIndex` removes specified session
- [ ] Index persists between page loads

---

### Task 12: Implement Utility Helper Functions

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Description:**
Add utility functions for checking recoverable sessions and counting content needing re-upload.

**Implementation Steps:**

1. Add `hasRecoverableSession(): boolean` function
   - Return `getActiveSessionIds().length > 0`

2. Add `getContentNeedingReUpload(state: Partial<WorkflowState>): number` function
   - Initialize count = 0
   - Check `state.currentItem?.content` for items with `data?.needsReUpload`
   - Check `state.session?.items` and each item's content
   - Return total count

3. Export both functions

**Verification Steps:**
- [ ] `hasRecoverableSession` returns false when no sessions
- [ ] `hasRecoverableSession` returns true when sessions exist
- [ ] `getContentNeedingReUpload` correctly counts binary content pieces

---

### Task 13: Create useSessionPersistence Hook Structure

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Description:**
Create the hook file with type definitions, constants, and the basic hook signature.

**Implementation Steps:**

1. Create file at `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`
2. Add `'use client'` directive
3. Add file header comment with module documentation
4. Add constant `AUTO_SAVE_DEBOUNCE_MS = 500`
5. Define `UseSessionPersistenceOptions` interface:
   - `enabled?: boolean` (default true)
   - `debounceMs?: number` (default 500)
   - `onSessionRestored?: (state, needsReUpload) => void`
   - `onNoSession?: () => void`
   - `debug?: boolean` (default false)
6. Define `UseSessionPersistenceReturn` interface:
   - `isStorageAvailable: boolean`
   - `wasRestored: boolean`
   - `contentNeedingReUpload: number`
   - `saveNow: () => void`
   - `clearSession: () => void`
   - `checkForRecoverableSession: () => boolean`
   - `restoreMostRecentSession: () => Partial<WorkflowState> | null`
7. Create hook function signature
8. Import necessary React hooks and storage utilities
9. Export hook and types

**Verification Steps:**
- [ ] File compiles without errors
- [ ] Types exported correctly
- [ ] Hook function signature matches return type

---

### Task 14: Implement useSessionPersistence Core State

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Description:**
Implement the core state management within the hook.

**Implementation Steps:**

1. Add parameters: `state: WorkflowState`, `options: UseSessionPersistenceOptions = {}`
2. Destructure options with defaults:
   - `enabled = true`
   - `debounceMs = AUTO_SAVE_DEBOUNCE_MS`
   - `onSessionRestored`
   - `onNoSession`
   - `debug = false`
3. Add state hooks:
   - `const [wasRestored, setWasRestored] = useState(false)`
   - `const [contentNeedingReUpload, setContentNeedingReUpload] = useState(0)`
4. Add refs:
   - `const debounceRef = useRef<NodeJS.Timeout | null>(null)`
   - `const prevSessionIdRef = useRef<string | null>(null)`
5. Compute `isStorageAvailable` once: `isLocalStorageAvailable()`
6. Add debug logging helper:
   ```typescript
   const log = useCallback((...args: unknown[]) => {
     if (debug) console.log('[useSessionPersistence]', ...args);
   }, [debug]);
   ```

**Verification Steps:**
- [ ] State initialized correctly
- [ ] Options destructured with defaults
- [ ] Debug logging conditional on debug flag

---

### Task 15: Implement saveNow and Auto-Save Logic

**Story Points:** 0.75
**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Description:**
Implement the immediate save function and the auto-save effect with debouncing.

**Implementation Steps:**

1. Add `saveNow` callback:
   - Check if enabled and storage available; return early if not
   - Check if `state.currentStep === 'session-summary'`; skip save if complete
   - Call `saveWorkflowState(state)`
   - Log result if debug enabled
   - Wrap in useCallback with dependencies: `[enabled, isStorageAvailable, state, log]`

2. Add auto-save useEffect:
   - Skip if not enabled or storage unavailable
   - Skip if `state.currentStep === 'session-summary'`
   - Clear previous debounce timeout if exists
   - Set new timeout: `debounceRef.current = setTimeout(() => saveNow(), debounceMs)`
   - Return cleanup function that clears timeout
   - Dependencies: `[state, enabled, isStorageAvailable, debounceMs, saveNow]`

**Verification Steps:**
- [ ] `saveNow` saves immediately when called
- [ ] Auto-save triggers after debounce interval
- [ ] Rapid state changes only result in single save (debounce working)
- [ ] No save on session-summary step
- [ ] No save when disabled
- [ ] Cleanup clears pending timeout

---

### Task 16: Implement clearSession and Session Completion Logic

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Description:**
Implement session cleanup functions and automatic cleanup on session completion.

**Implementation Steps:**

1. Add `clearSession` callback:
   - Check storage available; return early if not
   - Call `clearWorkflowState(state.session.id)`
   - Log action if debug enabled
   - Dependencies: `[isStorageAvailable, state.session.id, log]`

2. Add completion cleanup useEffect:
   - Watch `state.currentStep`
   - If equals `'session-summary'`, call `clearSession()`
   - Log "Session complete - clearing storage"
   - Dependencies: `[state.currentStep, clearSession, log]`

**Verification Steps:**
- [ ] `clearSession` removes session from localStorage
- [ ] Session automatically cleared when reaching session-summary
- [ ] Storage cleared even if user doesn't call clearSession manually

---

### Task 17: Implement Session Recovery Functions

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Description:**
Implement functions for checking and restoring previous sessions.

**Implementation Steps:**

1. Add `checkForRecoverableSession` callback:
   - Return `hasRecoverableSession()`
   - Dependencies: `[]` (no dependencies, uses stable utility)

2. Add `restoreMostRecentSession` callback:
   - Check storage available; return null if not
   - Call `loadMostRecentWorkflowState()`
   - If restored:
     - Calculate `needsReUpload` using `getContentNeedingReUpload(restored)`
     - Set `wasRestored` state to true
     - Set `contentNeedingReUpload` state
     - Log restore info if debug
     - Call `onSessionRestored?.(restored, needsReUpload)`
     - Return restored state
   - If not restored:
     - Log "No session to restore"
     - Call `onNoSession?.()`
     - Return null
   - Dependencies: `[isStorageAvailable, onSessionRestored, onNoSession, log]`

**Verification Steps:**
- [ ] `checkForRecoverableSession` returns correct boolean
- [ ] `restoreMostRecentSession` returns restored state
- [ ] `wasRestored` state updated on restore
- [ ] `contentNeedingReUpload` count accurate
- [ ] Callbacks invoked appropriately

---

### Task 18: Implement Session ID Change Detection

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Description:**
Detect when the session ID changes and clean up the old session.

**Implementation Steps:**

1. Add session ID tracking useEffect:
   - Check if `prevSessionIdRef.current` exists AND differs from `state.session.id`
   - If changed: log and call `clearWorkflowState(prevSessionIdRef.current)`
   - Update `prevSessionIdRef.current = state.session.id`
   - Dependencies: `[state.session.id, log]`

**Verification Steps:**
- [ ] Old session cleared when new session started
- [ ] No clear on initial render (ref is null)
- [ ] Ref updated after each render

---

### Task 19: Complete Hook Return Object

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Description:**
Assemble and return the complete hook interface.

**Implementation Steps:**

1. Return object matching `UseSessionPersistenceReturn`:
   ```typescript
   return {
     isStorageAvailable,
     wasRestored,
     contentNeedingReUpload,
     saveNow,
     clearSession,
     checkForRecoverableSession,
     restoreMostRecentSession,
   };
   ```
2. Add default export for hook

**Verification Steps:**
- [ ] All return properties present
- [ ] Types match interface definition
- [ ] Hook can be imported and used

---

### Task 20: Update Barrel Exports - Hooks

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/hooks/index.ts`

**Description:**
Export the new useSessionPersistence hook and types from the hooks barrel file.

**Implementation Steps:**

1. Open `src/components/ItemCreationWorkflow/hooks/index.ts`
2. Uncomment line 21 (placeholder export)
3. Replace with actual exports:
   ```typescript
   export { useSessionPersistence } from './useSessionPersistence';
   export type {
     UseSessionPersistenceOptions,
     UseSessionPersistenceReturn,
   } from './useSessionPersistence';
   ```
4. Update lastModified comment to reflect REQ-096

**Verification Steps:**
- [ ] Hook exported from hooks/index.ts
- [ ] Types exported from hooks/index.ts
- [ ] No TypeScript errors in barrel file
- [ ] Import works: `import { useSessionPersistence } from './hooks'`

---

### Task 21: Update Barrel Exports - Utils

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/utils/index.ts`

**Description:**
Export the sessionStorage utilities from the utils barrel file.

**Implementation Steps:**

1. Open `src/components/ItemCreationWorkflow/utils/index.ts`
2. Uncomment line 15 (placeholder export)
3. Update to: `export * from './sessionStorage';`
4. Update lastModified comment to reflect REQ-096

**Verification Steps:**
- [ ] Utilities exported from utils/index.ts
- [ ] No TypeScript errors in barrel file
- [ ] Import works: `import { saveWorkflowState } from './utils'`

---

### Task 22: Create Unit Tests for Storage Utilities

**Story Points:** 1
**File:** `src/components/ItemCreationWorkflow/utils/__tests__/sessionStorage.test.ts`

**Description:**
Create comprehensive unit tests for the sessionStorage utilities.

**Implementation Steps:**

1. Create test file at `src/components/ItemCreationWorkflow/utils/__tests__/sessionStorage.test.ts`
2. Add test suites:

```typescript
describe('sessionStorage utilities', () => {
  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is available');
    it('returns false during SSR (window undefined)');
    it('returns false when localStorage throws');
  });

  describe('getStorageKey', () => {
    it('generates correct key format');
  });

  describe('serializeState', () => {
    it('converts Date objects to ISO strings');
    it('marks binary content as needing re-upload');
    it('preserves text content data');
    it('preserves URL content data with all metadata');
    it('sets hasUnserializableContent flag for binary content');
    it('excludes thumbnail from content pieces');
  });

  describe('deserializeState', () => {
    it('converts ISO strings back to Date objects');
    it('restores RoomType and ItemType enums');
    it('sets isSubmitting and submitError to default values');
    it('creates placeholder Blob for binary content');
    it('sets needsReUpload flag on binary content');
  });

  describe('saveWorkflowState', () => {
    it('saves serialized state to localStorage');
    it('includes savedAt timestamp');
    it('updates session index');
    it('returns true on success');
    it('returns false when localStorage unavailable');
  });

  describe('loadWorkflowState', () => {
    it('loads and deserializes state from localStorage');
    it('returns null for expired sessions');
    it('clears expired sessions from storage');
    it('returns null when key not found');
    it('clears invalid JSON from storage');
  });

  describe('loadMostRecentWorkflowState', () => {
    it('returns most recent valid session');
    it('skips expired sessions');
    it('returns null when no sessions exist');
  });

  describe('clearWorkflowState', () => {
    it('removes session from localStorage');
    it('removes session from index');
    it('handles non-existent session gracefully');
  });

  describe('session index', () => {
    it('tracks multiple sessions');
    it('limits to 10 sessions max');
    it('orders by most recent first');
    it('filters expired sessions');
  });

  describe('utility functions', () => {
    it('hasRecoverableSession returns false when no sessions');
    it('hasRecoverableSession returns true when sessions exist');
    it('getContentNeedingReUpload counts binary content correctly');
  });
});
```

3. Mock localStorage for tests
4. Create helper factory functions for test data

**Verification Steps:**
- [ ] All tests pass
- [ ] Coverage includes happy path and error cases
- [ ] localStorage mocked appropriately
- [ ] Tests run in CI environment

---

### Task 23: Create Unit Tests for useSessionPersistence Hook

**Story Points:** 1
**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test.ts`

**Description:**
Create comprehensive unit tests for the useSessionPersistence hook.

**Implementation Steps:**

1. Create test file at `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test.ts`
2. Import `@testing-library/react` for hook testing
3. Add test suites:

```typescript
describe('useSessionPersistence', () => {
  describe('initialization', () => {
    it('returns isStorageAvailable correctly');
    it('initializes wasRestored as false');
    it('initializes contentNeedingReUpload as 0');
  });

  describe('auto-save', () => {
    it('saves state after debounce interval');
    it('does not save when disabled');
    it('does not save on session-summary step');
    it('debounces rapid state changes');
    it('clears pending save on unmount');
  });

  describe('saveNow', () => {
    it('saves immediately when called');
    it('does not save when storage unavailable');
    it('does not save on session-summary step');
  });

  describe('session recovery', () => {
    it('checkForRecoverableSession returns correct value');
    it('restoreMostRecentSession returns restored state');
    it('calls onSessionRestored callback with state');
    it('reports content needing re-upload count');
    it('returns null when no sessions to recover');
    it('calls onNoSession callback when no sessions');
    it('sets wasRestored state on successful restore');
  });

  describe('clearSession', () => {
    it('clears current session from storage');
    it('handles storage unavailable gracefully');
  });

  describe('session completion', () => {
    it('clears session when reaching session-summary');
  });

  describe('session ID changes', () => {
    it('clears old session when session ID changes');
    it('does not clear on initial render');
  });

  describe('debug mode', () => {
    it('logs actions when debug is true');
    it('does not log when debug is false');
  });
});
```

4. Mock storage utilities for isolated hook testing
5. Use `renderHook` from testing library

**Verification Steps:**
- [ ] All tests pass
- [ ] Hook behavior tested in isolation
- [ ] Debounce timing tested with fake timers
- [ ] Cleanup tested on unmount

---

### Task 24: Build Verification and Integration Check

**Story Points:** 0.5

**Description:**
Verify that all implemented code compiles correctly and integrates with the existing codebase.

**Implementation Steps:**

1. Run TypeScript compiler: `npx tsc --noEmit`
2. Verify no errors in new files
3. Run the build: `npm run build`
4. Verify no build errors
5. Run the test suite: `npm test`
6. Verify all new tests pass
7. Test manual import in a temporary file:
   ```typescript
   import { useSessionPersistence } from '@/components/ItemCreationWorkflow/hooks';
   import { saveWorkflowState, loadWorkflowState } from '@/components/ItemCreationWorkflow/utils';
   ```

**Verification Steps:**
- [ ] TypeScript compilation passes
- [ ] Build succeeds without warnings
- [ ] All tests pass
- [ ] Imports resolve correctly
- [ ] No circular dependency issues

---

## Dependency Graph

```
Task 1 (Types & Constants)
    │
    ├── Task 2 (isLocalStorageAvailable)
    │
    ├── Task 3 (getStorageKey)
    │
    ├── Task 4 (Serialization) ──┐
    │                            │
    ├── Task 5 (Deserialization)─┤
    │                            │
    ├── Task 6 (saveWorkflowState)
    │       │
    │       └── Task 11 (Session Index) ◄──┐
    │                                      │
    ├── Task 7 (loadWorkflowState) ────────┤
    │       │                              │
    │       └── Task 9 (clearWorkflowState)┘
    │
    ├── Task 8 (loadMostRecentWorkflowState)
    │
    ├── Task 10 (clearAllWorkflowStates)
    │
    └── Task 12 (Utility Helpers)
            │
            └────────────────────────────────┐
                                             │
Task 13 (Hook Structure) ◄───────────────────┘
    │
    ├── Task 14 (Core State)
    │
    ├── Task 15 (saveNow & Auto-Save)
    │
    ├── Task 16 (clearSession & Completion)
    │
    ├── Task 17 (Session Recovery)
    │
    ├── Task 18 (Session ID Detection)
    │
    └── Task 19 (Return Object)
            │
            ├── Task 20 (Export Hooks)
            │
            └── Task 21 (Export Utils)
                    │
                    ├── Task 22 (Storage Tests)
                    │
                    ├── Task 23 (Hook Tests)
                    │
                    └── Task 24 (Build Verification)
```

---

## Acceptance Criteria Summary

From REQ-096 in gen_requests.md:

- [x] **AC1:** Workflow state is automatically saved to browser storage whenever state changes occur
  - Implemented in: Task 15 (auto-save with debounce) - `useSessionPersistence.ts:120-143`

- [x] **AC2:** When a user returns to the application, their previous workflow state is automatically restored
  - Implemented in: Task 8, Task 17 (loadMostRecentWorkflowState, restoreMostRecentSession) - `sessionStorage.ts:336-354`, `useSessionPersistence.ts:164-187`

- [x] **AC3:** Users can continue from their last step without re-entering previously completed information
  - Implemented in: Task 5, Task 17 (deserialization preserves all step data) - `sessionStorage.ts:220-265`

- [x] **AC4:** When a workflow is marked as complete, the saved state is removed from browser storage
  - Implemented in: Task 16 (automatic cleanup on session-summary step) - `useSessionPersistence.ts:157-162`

- [x] **AC5:** Multiple workflow sessions can be managed independently without conflicts
  - Implemented in: Task 3, Task 11 (unique keys per session, session index) - `sessionStorage.ts:148-153`, `sessionStorage.ts:267-307`

---

## Technical Acceptance Criteria

From the overview document:

- [x] `isLocalStorageAvailable()` handles SSR and private browsing - `sessionStorage.ts:125-141`
- [x] Serialization converts Dates to ISO strings - `sessionStorage.ts:195-218`
- [x] Binary content (File/Blob) is marked as needing re-upload - `sessionStorage.ts:157-172`
- [x] Deserialization restores Dates from ISO strings - `sessionStorage.ts:220-265`
- [x] Session expiration is enforced (24 hours) - `sessionStorage.ts:318-332`
- [x] Multiple sessions can be tracked via session index (max 10) - `sessionStorage.ts:280-293`
- [x] `useSessionPersistence` hook auto-saves on state changes (500ms debounce) - `useSessionPersistence.ts:120-143`
- [x] Session recovery available via `restoreMostRecentSession` - `useSessionPersistence.ts:164-187`
- [x] Session cleared from storage when completing workflow - `useSessionPersistence.ts:157-162`
- [x] Hook returns `wasRestored` and `contentNeedingReUpload` state - `useSessionPersistence.ts:195-202`
- [x] Barrel exports updated in `hooks/index.ts` and `utils/index.ts` - Complete
- [x] Code follows established patterns from `src/lib/session.ts` - Used same localStorage check pattern

---

## Edge Cases and Error Handling

| Scenario | Handling | Task |
|----------|----------|------|
| localStorage unavailable (SSR) | Return early, don't throw | Task 2 |
| localStorage unavailable (private browsing) | Return false from availability check | Task 2 |
| JSON parse error on load | Catch, log, clear corrupted data, return null | Task 7 |
| localStorage quota exceeded | Catch error, log warning, return false | Task 6 |
| Session expired (>24 hours) | Clear and return null | Task 7 |
| Binary content in state | Mark as needsReUpload flag | Task 4 |
| Session ID changes during workflow | Clear old session, save new one | Task 18 |
| Component unmounts during save | Debounce handles cleanup via useEffect return | Task 15 |

---

## Estimated Total Effort

| Task Range | Description | Story Points |
|------------|-------------|--------------|
| Tasks 1-3 | Constants, types, availability | 1.25 |
| Tasks 4-5 | Serialization/Deserialization | 2.0 |
| Tasks 6-10 | Storage CRUD operations | 2.0 |
| Tasks 11-12 | Index management, utilities | 1.0 |
| Tasks 13-19 | useSessionPersistence hook | 3.0 |
| Tasks 20-21 | Barrel exports | 0.5 |
| Tasks 22-24 | Testing and verification | 2.5 |
| **Total** | | **12.25** |

**Recommended timeline:** 2-3 focused work sessions

---

## References

- [Overview Document](docs/REQ-096-session-persistence-overview.md)
- [Implementation Plan: Item Creation Workflow](docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Session Management Utility](src/lib/session.ts)
- [ItemManager State Hook](src/components/ItemManager/hooks/useItemManagerState.ts)
- [ItemCreationWorkflow Types](src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)
- [useWorkflowState Hook](src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)

---

---

## Implementation Summary

**Completed:** 2026-01-05 03:17:00 UTC

### Files Created

| File | Lines | Description |
|------|-------|-------------|
| `src/components/ItemCreationWorkflow/utils/sessionStorage.ts` | ~400 | LocalStorage utilities including serialization, CRUD operations, and session index management |
| `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts` | ~210 | React hook for auto-save, session recovery, and cleanup |
| `src/components/ItemCreationWorkflow/utils/__tests__/sessionStorage.test.ts` | ~450 | Comprehensive unit tests for storage utilities |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test.ts` | ~350 | Comprehensive unit tests for persistence hook |

### Files Modified

| File | Change |
|------|--------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Added exports for `useSessionPersistence` and types |
| `src/components/ItemCreationWorkflow/utils/index.ts` | Added export for sessionStorage utilities |

### Key Implementation Notes

1. **Serialization Strategy:** All `Date` objects are serialized to ISO strings. Binary content (File/Blob) is marked with `needsReUpload: true` flag since it cannot be serialized.

2. **Session Index:** Maintains an index of active sessions with timestamps, limited to 10 sessions max, sorted by most recent.

3. **Debounced Auto-Save:** Uses 500ms debounce to prevent excessive writes during rapid state changes.

4. **Automatic Cleanup:** Sessions are automatically cleared when the workflow reaches `session-summary` step or when session ID changes.

5. **Error Handling:** All localStorage operations are wrapped in try/catch blocks with appropriate logging.

### Build Verification

- TypeScript compilation: PASSED
- Next.js build: PASSED
- All files import correctly

---

*Detailed Task Breakdown generated on 2026-01-05 for REQ-096: Session Persistence for Workflow State*
*Implementation completed on 2026-01-05 03:17:00 UTC*
