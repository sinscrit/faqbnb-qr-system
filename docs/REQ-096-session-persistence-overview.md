# REQ-096: Session Persistence for Workflow State - Implementation Overview

**Generated:** 2026-01-05 19:30:00 UTC
**Last Modified:** 2026-01-05 19:30:00 UTC
**Request Reference:** REQ-096 in docs/gen_requests.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md
**Phase:** 1 - Foundation & Core Infrastructure
**Task ID:** 1.4

---

## Summary

This document provides an implementation breakdown for the `useSessionPersistence` hook and associated utilities that automatically save workflow state to localStorage and restore it when users return to the application. This enables users to safely navigate away from or close the application without losing their progress, and resume from where they left off.

---

## Related Request

**REQ-096: Session Persistence for Workflow State**

- **Type:** NEW FEATURE
- **Size:** M
- **Date:** 2026-01-05

### Key Requirements (from gen_requests.md)
- Workflow state is automatically saved to browser storage whenever state changes occur
- When a user returns to the application, their previous workflow state is automatically restored
- Users can continue from their last step without re-entering previously completed information
- When a workflow is marked as complete, the saved state is removed from browser storage
- Multiple workflow sessions can be managed independently without conflicts

---

## Technical Context

### Existing Patterns to Follow

The implementation must follow established patterns from the codebase:

| Pattern | Location | Key Elements to Adopt |
|---------|----------|----------------------|
| Session Management | `src/lib/session.ts` | localStorage availability check, session ID generation, expiration handling, JSON serialization/deserialization |
| View Mode Persistence | `src/components/ItemManager/hooks/useItemManagerState.ts:256-274` | useEffect for restore on mount, sessionStorage save on change |
| State Machine | `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | WorkflowState structure, reducer pattern, dispatch integration |
| Type Definitions | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | WorkflowState, WorkflowSession, CurrentItemState, SessionItem types |

### Key Insights from Existing Patterns

From `src/lib/session.ts` (lines 46-62):
```typescript
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

From `src/components/ItemManager/hooks/useItemManagerState.ts` (lines 258-265):
```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored === 'grid' || stored === 'list') {
      dispatch({ type: 'SET_VIEW_MODE', payload: stored });
    }
  }
}, []);
```

---

## Architecture

### Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                    ItemCreationWorkflow Component                     │    │
│   │                                                                       │    │
│   │   ┌───────────────────┐         ┌───────────────────┐                │    │
│   │   │  useWorkflowState │<------->│useSessionPersistence│               │    │
│   │   │                   │  state  │                    │                │    │
│   │   │  state            │-------->│  Auto-save on      │                │    │
│   │   │  dispatch         │         │  state change      │                │    │
│   │   │  actions...       │         │                    │                │    │
│   │   └───────────────────┘         │  Restore on        │                │    │
│   │          ▲                      │  component mount   │                │    │
│   │          │                      │                    │                │    │
│   │          │ restored state       │  Cleanup on        │                │    │
│   │          │                      │  session complete  │                │    │
│   │          └──────────────────────┴────────────────────┘                │    │
│   │                                          │                            │    │
│   └──────────────────────────────────────────│────────────────────────────┘    │
│                                              │                                  │
│                                              ▼                                  │
│   ┌──────────────────────────────────────────────────────────────────────┐    │
│   │                      sessionStorage.ts (Utils)                        │    │
│   ├──────────────────────────────────────────────────────────────────────┤    │
│   │                                                                       │    │
│   │   isLocalStorageAvailable()   saveWorkflowState()                    │    │
│   │   serializeState()            loadWorkflowState()                    │    │
│   │   deserializeState()          clearWorkflowState()                   │    │
│   │   getStorageKey()             getActiveSessionIds()                  │    │
│   │                                                                       │    │
│   └──────────────────────────────────────────────────────────────────────┘    │
│                                              │                                  │
│                                              ▼                                  │
│   ┌──────────────────────────────────────────────────────────────────────┐    │
│   │                          localStorage                                 │    │
│   ├──────────────────────────────────────────────────────────────────────┤    │
│   │   Key: 'faqbnb_workflow_{sessionId}'                                  │    │
│   │   Value: { state: SerializedWorkflowState, savedAt: timestamp }       │    │
│   └──────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
State Change in useWorkflowState
              │
              ▼
    useSessionPersistence (useEffect)
              │
              ├── Debounce (500ms)
              │
              ▼
    serializeState() ─────────────────────┐
              │                            │
              ▼                            │
    saveWorkflowState()                    │
              │                            │
              ▼                            │
    localStorage.setItem()                 │
                                           │
                                           │
    Component Mount                        │
              │                            │
              ▼                            │
    loadWorkflowState()                    │
              │                            │
              ▼                            │
    deserializeState() <───────────────────┘
              │
              ▼
    Dispatch RESTORE_SESSION action (or pass to initialSession prop)
```

### Serialization Considerations

The `WorkflowState` contains types that cannot be directly JSON serialized:

| Field | Type | Serialization Strategy |
|-------|------|----------------------|
| `session.startedAt` | `Date` | Convert to ISO string |
| `session.items[].createdAt` | `Date` | Convert to ISO string |
| `currentItem.content[].data` | `ContentData` (may contain `File`/`Blob`) | Skip serialization for binary data; mark as "needs re-upload" |
| `currentItem.content[].thumbnail` | `Blob` | Skip serialization |

---

## Implementation Tasks

### Task 1.4.1: Create sessionStorage.ts Utility File

**Description:** Create utility functions for localStorage operations with proper error handling and availability checks.

**Pattern Reference:** `src/lib/session.ts:46-62` for isLocalStorageAvailable pattern

**File:** `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Implementation:**

```typescript
/**
 * Session Storage Utilities for ItemCreationWorkflow
 *
 * Provides localStorage persistence for workflow state with:
 * - Availability checking for SSR and private browsing
 * - Session-scoped storage keys for multi-session support
 * - Safe serialization/deserialization with error handling
 *
 * @module ItemCreationWorkflow/utils/sessionStorage
 * @lastModified 2026-01-05 (REQ-096 Task 1.4)
 */

import type { WorkflowState, WorkflowSession } from '../ItemCreationWorkflow.types';

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY_PREFIX = 'faqbnb_workflow_';
const STORAGE_INDEX_KEY = 'faqbnb_workflow_sessions';
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// =============================================================================
// Serialized Types
// =============================================================================

/**
 * Serialized version of WorkflowState for localStorage.
 * Dates are stored as ISO strings, binary data is marked as stale.
 */
export interface SerializedWorkflowState {
  currentStep: WorkflowState['currentStep'];
  stepHistory: WorkflowState['stepHistory'];
  canGoBack: boolean;
  session: SerializedWorkflowSession;
  currentItem: SerializedCurrentItemState | null;
  isDirty: boolean;
  errors: Record<string, string>;
  // Note: isSubmitting and submitError are not persisted
}

interface SerializedWorkflowSession {
  id: string;
  startedAt: string; // ISO date string
  currentStep: string;
  items: SerializedSessionItem[];
  currentItem: SerializedCurrentItemState | null;
}

interface SerializedSessionItem {
  id: string;
  name: string;
  room: string;
  itemType: string;
  content: SerializedContentPiece[];
  createdAt: string; // ISO date string
  qrCodeUrl?: string;
}

interface SerializedCurrentItemState {
  room: string;
  itemType: string;
  specificItem: string;
  itemName: string;
  contentSource: 'existing' | 'create-new';
  contentType: string | null;
  content: SerializedContentPiece[];
  hasUnserializableContent?: boolean; // Flag if binary data was skipped
}

interface SerializedContentPiece {
  id: string;
  type: string;
  data: SerializedContentData;
  order: number;
  // thumbnail is not persisted
}

type SerializedContentData =
  | { type: 'text'; text: string }
  | { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string }
  | { type: 'video' | 'photo' | 'pdf'; needsReUpload: true }; // Binary data cannot be serialized

interface StoredSession {
  state: SerializedWorkflowState;
  savedAt: number; // Timestamp
}

// =============================================================================
// Availability Check
// =============================================================================

/**
 * Checks if localStorage is available (handles SSR and private browsing).
 */
export function isLocalStorageAvailable(): boolean {
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

// =============================================================================
// Storage Key Management
// =============================================================================

/**
 * Generates the storage key for a specific session.
 */
export function getStorageKey(sessionId: string): string {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

// =============================================================================
// Serialization
// =============================================================================

/**
 * Serializes WorkflowState for localStorage storage.
 * Converts Dates to ISO strings and marks binary content as needing re-upload.
 */
export function serializeState(state: WorkflowState): SerializedWorkflowState {
  return {
    currentStep: state.currentStep,
    stepHistory: state.stepHistory,
    canGoBack: state.canGoBack,
    session: {
      id: state.session.id,
      startedAt: state.session.startedAt.toISOString(),
      currentStep: state.session.currentStep,
      items: state.session.items.map(item => ({
        id: item.id,
        name: item.name,
        room: item.room,
        itemType: item.itemType,
        content: serializeContentPieces(item.content),
        createdAt: item.createdAt.toISOString(),
        qrCodeUrl: item.qrCodeUrl,
      })),
      currentItem: state.session.currentItem
        ? serializeCurrentItem(state.session.currentItem)
        : null,
    },
    currentItem: state.currentItem
      ? serializeCurrentItem(state.currentItem)
      : null,
    isDirty: state.isDirty,
    errors: state.errors,
  };
}

function serializeCurrentItem(item: WorkflowState['currentItem']): SerializedCurrentItemState | null {
  if (!item) return null;

  const serializedContent = serializeContentPieces(item.content);
  const hasUnserializableContent = item.content.some(
    c => c.data.type === 'video' || c.data.type === 'photo' || c.data.type === 'pdf'
  );

  return {
    room: item.room,
    itemType: item.itemType,
    specificItem: item.specificItem,
    itemName: item.itemName,
    contentSource: item.contentSource,
    contentType: item.contentType,
    content: serializedContent,
    hasUnserializableContent,
  };
}

function serializeContentPieces(content: ContentPiece[]): SerializedContentPiece[] {
  return content.map(piece => ({
    id: piece.id,
    type: piece.type,
    data: serializeContentData(piece.data),
    order: piece.order,
  }));
}

function serializeContentData(data: ContentData): SerializedContentData {
  if (data.type === 'text') {
    return { type: 'text', text: data.text };
  }
  if (data.type === 'url') {
    return {
      type: 'url',
      url: data.url,
      title: data.title,
      thumbnailUrl: data.thumbnailUrl,
      faviconUrl: data.faviconUrl,
    };
  }
  // Binary content (video, photo, pdf) cannot be serialized
  return { type: data.type, needsReUpload: true };
}

// =============================================================================
// Deserialization
// =============================================================================

/**
 * Deserializes stored state back to WorkflowState.
 * Converts ISO strings back to Dates.
 */
export function deserializeState(stored: SerializedWorkflowState): Partial<WorkflowState> {
  return {
    currentStep: stored.currentStep,
    stepHistory: stored.stepHistory,
    canGoBack: stored.canGoBack,
    session: {
      id: stored.session.id,
      startedAt: new Date(stored.session.startedAt),
      currentStep: stored.session.currentStep as WorkflowState['currentStep'],
      items: stored.session.items.map(item => ({
        ...item,
        room: item.room as RoomType,
        itemType: item.itemType as ItemType,
        content: deserializeContentPieces(item.content),
        createdAt: new Date(item.createdAt),
      })),
      currentItem: stored.session.currentItem
        ? deserializeCurrentItem(stored.session.currentItem)
        : null,
    },
    currentItem: stored.currentItem
      ? deserializeCurrentItem(stored.currentItem)
      : null,
    isDirty: stored.isDirty,
    errors: stored.errors,
    isSubmitting: false,
    submitError: null,
  };
}

function deserializeCurrentItem(item: SerializedCurrentItemState): CurrentItemState {
  return {
    room: item.room as RoomType,
    itemType: item.itemType as ItemType,
    specificItem: item.specificItem,
    itemName: item.itemName,
    contentSource: item.contentSource,
    contentType: item.contentType as ContentType | null,
    content: deserializeContentPieces(item.content),
  };
}

function deserializeContentPieces(content: SerializedContentPiece[]): ContentPiece[] {
  return content.map(piece => ({
    id: piece.id,
    type: piece.type as ContentType,
    data: deserializeContentData(piece.data) as ContentData,
    order: piece.order,
    // thumbnail is not restored - will need to be regenerated
  }));
}

function deserializeContentData(data: SerializedContentData): ContentData {
  if (data.type === 'text') {
    return { type: 'text', text: data.text };
  }
  if (data.type === 'url') {
    return {
      type: 'url',
      url: data.url,
      title: data.title,
      thumbnailUrl: data.thumbnailUrl,
      faviconUrl: data.faviconUrl,
    };
  }
  // Binary content marked as needing re-upload - return placeholder
  return { type: data.type, file: new Blob([]), needsReUpload: true } as any;
}

// =============================================================================
// Storage Operations
// =============================================================================

/**
 * Saves workflow state to localStorage.
 */
export function saveWorkflowState(state: WorkflowState): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot save workflow state: localStorage not available');
    return false;
  }

  try {
    const serialized = serializeState(state);
    const stored: StoredSession = {
      state: serialized,
      savedAt: Date.now(),
    };

    const key = getStorageKey(state.session.id);
    window.localStorage.setItem(key, JSON.stringify(stored));

    // Update session index
    updateSessionIndex(state.session.id);

    return true;
  } catch (error) {
    console.error('Failed to save workflow state:', error);
    return false;
  }
}

/**
 * Loads workflow state from localStorage by session ID.
 * Returns null if not found, expired, or invalid.
 */
export function loadWorkflowState(sessionId: string): Partial<WorkflowState> | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const key = getStorageKey(sessionId);
    const stored = window.localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    const parsed: StoredSession = JSON.parse(stored);

    // Check if session has expired
    if (Date.now() - parsed.savedAt > MAX_SESSION_AGE_MS) {
      console.info('Workflow session expired, clearing');
      clearWorkflowState(sessionId);
      return null;
    }

    return deserializeState(parsed.state);
  } catch (error) {
    console.error('Failed to load workflow state:', error);
    clearWorkflowState(sessionId);
    return null;
  }
}

/**
 * Loads the most recent workflow session.
 * Returns null if no sessions found or all expired.
 */
export function loadMostRecentWorkflowState(): Partial<WorkflowState> | null {
  const sessionIds = getActiveSessionIds();

  if (sessionIds.length === 0) {
    return null;
  }

  // Sessions are sorted by most recent, try each one
  for (const sessionId of sessionIds) {
    const state = loadWorkflowState(sessionId);
    if (state) {
      return state;
    }
  }

  return null;
}

/**
 * Clears workflow state from localStorage by session ID.
 */
export function clearWorkflowState(sessionId: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const key = getStorageKey(sessionId);
    window.localStorage.removeItem(key);
    removeFromSessionIndex(sessionId);
  } catch (error) {
    console.error('Failed to clear workflow state:', error);
  }
}

/**
 * Clears all workflow states from localStorage.
 */
export function clearAllWorkflowStates(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const sessionIds = getActiveSessionIds();
    for (const sessionId of sessionIds) {
      const key = getStorageKey(sessionId);
      window.localStorage.removeItem(key);
    }
    window.localStorage.removeItem(STORAGE_INDEX_KEY);
  } catch (error) {
    console.error('Failed to clear all workflow states:', error);
  }
}

// =============================================================================
// Session Index Management
// =============================================================================

/**
 * Gets list of active session IDs, sorted by most recent first.
 */
export function getActiveSessionIds(): string[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_INDEX_KEY);
    if (!stored) {
      return [];
    }

    const sessions: { id: string; savedAt: number }[] = JSON.parse(stored);

    // Filter out expired sessions
    const now = Date.now();
    const active = sessions.filter(s => now - s.savedAt < MAX_SESSION_AGE_MS);

    // Sort by most recent
    active.sort((a, b) => b.savedAt - a.savedAt);

    return active.map(s => s.id);
  } catch (error) {
    console.error('Failed to get active session IDs:', error);
    return [];
  }
}

/**
 * Updates the session index with a session ID.
 */
function updateSessionIndex(sessionId: string): void {
  try {
    const stored = window.localStorage.getItem(STORAGE_INDEX_KEY);
    const sessions: { id: string; savedAt: number }[] = stored ? JSON.parse(stored) : [];

    // Remove existing entry for this session
    const filtered = sessions.filter(s => s.id !== sessionId);

    // Add to front with current timestamp
    filtered.unshift({ id: sessionId, savedAt: Date.now() });

    // Limit to 10 sessions max
    const limited = filtered.slice(0, 10);

    window.localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to update session index:', error);
  }
}

/**
 * Removes a session ID from the index.
 */
function removeFromSessionIndex(sessionId: string): void {
  try {
    const stored = window.localStorage.getItem(STORAGE_INDEX_KEY);
    if (!stored) return;

    const sessions: { id: string; savedAt: number }[] = JSON.parse(stored);
    const filtered = sessions.filter(s => s.id !== sessionId);

    window.localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from session index:', error);
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Checks if there is a recoverable workflow session.
 */
export function hasRecoverableSession(): boolean {
  return getActiveSessionIds().length > 0;
}

/**
 * Gets the count of content pieces that need re-upload after restore.
 */
export function getContentNeedingReUpload(state: Partial<WorkflowState>): number {
  let count = 0;

  if (state.currentItem?.content) {
    count += state.currentItem.content.filter(
      (c: any) => c.data?.needsReUpload
    ).length;
  }

  if (state.session?.items) {
    for (const item of state.session.items) {
      count += item.content.filter((c: any) => c.data?.needsReUpload).length;
    }
  }

  return count;
}
```

**Acceptance Criteria:**
- [ ] isLocalStorageAvailable() handles SSR and private browsing
- [ ] Serialization converts Dates to ISO strings
- [ ] Binary content (File/Blob) is marked as needing re-upload
- [ ] Deserialization restores Dates from ISO strings
- [ ] Session expiration is enforced (24 hours)
- [ ] Multiple sessions can be tracked via session index

---

### Task 1.4.2: Create useSessionPersistence Hook

**Description:** Create the hook that integrates with useWorkflowState to provide auto-save on state changes and session recovery on mount.

**Pattern Reference:** `src/components/ItemManager/hooks/useItemManagerState.ts:258-274` for useEffect restore pattern

**File:** `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`

**Implementation:**

```typescript
'use client';

/**
 * useSessionPersistence - Auto-save and restore workflow state
 *
 * This hook provides persistence for ItemCreationWorkflow sessions:
 * - Auto-saves state to localStorage on changes (debounced)
 * - Restores previous session on component mount
 * - Cleans up on session completion
 *
 * @module ItemCreationWorkflow/hooks/useSessionPersistence
 * @see docs/REQ-096-session-persistence-overview.md
 * @lastModified 2026-01-05 (REQ-096 Task 1.4)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WorkflowState } from '../ItemCreationWorkflow.types';
import {
  saveWorkflowState,
  loadWorkflowState,
  loadMostRecentWorkflowState,
  clearWorkflowState,
  hasRecoverableSession,
  getContentNeedingReUpload,
  isLocalStorageAvailable,
} from '../utils/sessionStorage';

// =============================================================================
// Constants
// =============================================================================

const AUTO_SAVE_DEBOUNCE_MS = 500;

// =============================================================================
// Types
// =============================================================================

export interface UseSessionPersistenceOptions {
  /** Enable/disable auto-save (default: true) */
  enabled?: boolean;

  /** Custom debounce interval in ms (default: 500) */
  debounceMs?: number;

  /** Callback when session is restored */
  onSessionRestored?: (state: Partial<WorkflowState>, needsReUpload: number) => void;

  /** Callback when no session to restore */
  onNoSession?: () => void;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

export interface UseSessionPersistenceReturn {
  /** Whether localStorage is available */
  isStorageAvailable: boolean;

  /** Whether a previous session was restored */
  wasRestored: boolean;

  /** Number of content pieces needing re-upload after restore */
  contentNeedingReUpload: number;

  /** Force save current state immediately */
  saveNow: () => void;

  /** Clear current session from storage */
  clearSession: () => void;

  /** Check if there's a session to recover */
  checkForRecoverableSession: () => boolean;

  /** Try to restore the most recent session */
  restoreMostRecentSession: () => Partial<WorkflowState> | null;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for persisting workflow state to localStorage.
 *
 * @param state - Current workflow state from useWorkflowState
 * @param options - Configuration options
 * @returns Persistence state and control functions
 *
 * @example
 * const { state } = useWorkflowState();
 * const { wasRestored, saveNow, clearSession } = useSessionPersistence(state, {
 *   onSessionRestored: (restoredState) => {
 *     // Apply restored state
 *   }
 * });
 */
export function useSessionPersistence(
  state: WorkflowState,
  options: UseSessionPersistenceOptions = {}
): UseSessionPersistenceReturn {
  const {
    enabled = true,
    debounceMs = AUTO_SAVE_DEBOUNCE_MS,
    onSessionRestored,
    onNoSession,
    debug = false,
  } = options;

  // Track if we've restored a session
  const [wasRestored, setWasRestored] = useState(false);
  const [contentNeedingReUpload, setContentNeedingReUpload] = useState(0);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Track previous session ID to detect changes
  const prevSessionIdRef = useRef<string | null>(null);

  // Storage availability (computed once)
  const isStorageAvailable = isLocalStorageAvailable();

  // =========================================================================
  // Debug logging helper
  // =========================================================================
  const log = useCallback(
    (...args: unknown[]) => {
      if (debug) {
        console.log('[useSessionPersistence]', ...args);
      }
    },
    [debug]
  );

  // =========================================================================
  // Save function
  // =========================================================================
  const saveNow = useCallback(() => {
    if (!enabled || !isStorageAvailable) {
      return;
    }

    // Don't save if on session-summary (session is complete)
    if (state.currentStep === 'session-summary') {
      log('Skipping save - session is complete');
      return;
    }

    const success = saveWorkflowState(state);
    log('Saved state:', success, 'sessionId:', state.session.id);
  }, [enabled, isStorageAvailable, state, log]);

  // =========================================================================
  // Auto-save on state changes (debounced)
  // =========================================================================
  useEffect(() => {
    if (!enabled || !isStorageAvailable) {
      return;
    }

    // Skip save during session-summary (session complete)
    if (state.currentStep === 'session-summary') {
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Schedule save
    debounceRef.current = setTimeout(() => {
      saveNow();
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state, enabled, isStorageAvailable, debounceMs, saveNow]);

  // =========================================================================
  // Clear session from storage
  // =========================================================================
  const clearSession = useCallback(() => {
    if (!isStorageAvailable) {
      return;
    }

    clearWorkflowState(state.session.id);
    log('Cleared session:', state.session.id);
  }, [isStorageAvailable, state.session.id, log]);

  // =========================================================================
  // Cleanup on session completion
  // =========================================================================
  useEffect(() => {
    if (state.currentStep === 'session-summary') {
      log('Session complete - clearing storage');
      clearSession();
    }
  }, [state.currentStep, clearSession, log]);

  // =========================================================================
  // Check for recoverable session
  // =========================================================================
  const checkForRecoverableSession = useCallback(() => {
    return hasRecoverableSession();
  }, []);

  // =========================================================================
  // Restore most recent session
  // =========================================================================
  const restoreMostRecentSession = useCallback(() => {
    if (!isStorageAvailable) {
      return null;
    }

    const restored = loadMostRecentWorkflowState();

    if (restored) {
      const needsReUpload = getContentNeedingReUpload(restored);
      setWasRestored(true);
      setContentNeedingReUpload(needsReUpload);
      log('Restored session:', restored.session?.id, 'needs re-upload:', needsReUpload);
      onSessionRestored?.(restored, needsReUpload);
      return restored;
    }

    log('No session to restore');
    onNoSession?.();
    return null;
  }, [isStorageAvailable, onSessionRestored, onNoSession, log]);

  // =========================================================================
  // Session ID change detection
  // =========================================================================
  useEffect(() => {
    if (prevSessionIdRef.current && prevSessionIdRef.current !== state.session.id) {
      // Session ID changed - clear old session
      log('Session ID changed from', prevSessionIdRef.current, 'to', state.session.id);
      clearWorkflowState(prevSessionIdRef.current);
    }
    prevSessionIdRef.current = state.session.id;
  }, [state.session.id, log]);

  return {
    isStorageAvailable,
    wasRestored,
    contentNeedingReUpload,
    saveNow,
    clearSession,
    checkForRecoverableSession,
    restoreMostRecentSession,
  };
}

export default useSessionPersistence;
```

**Acceptance Criteria:**
- [ ] Auto-saves state on changes with 500ms debounce
- [ ] Provides restoreMostRecentSession for recovering previous session
- [ ] Clears storage when session reaches 'session-summary' step
- [ ] Handles session ID changes correctly
- [ ] Provides wasRestored and contentNeedingReUpload state
- [ ] Debug mode available for development

---

### Task 1.4.3: Update Barrel Exports

**Description:** Export the new hook and utilities from the appropriate barrel files.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/hooks/index.ts`
- `src/components/ItemCreationWorkflow/utils/index.ts`

**Implementation:**

```typescript
// hooks/index.ts - Add to existing exports:
export { useSessionPersistence } from './useSessionPersistence';
export type { UseSessionPersistenceOptions, UseSessionPersistenceReturn } from './useSessionPersistence';

// utils/index.ts - Add to existing exports:
export * from './sessionStorage';
```

**Acceptance Criteria:**
- [ ] useSessionPersistence exported from hooks/index.ts
- [ ] Type exports included
- [ ] sessionStorage utilities exported from utils/index.ts

---

### Task 1.4.4: Integration with Main Workflow Component

**Description:** Document how useSessionPersistence should be integrated with the main ItemCreationWorkflow component (for use by Task 1.3 - Main Workflow Component).

**Integration Pattern:**

```typescript
// In ItemCreationWorkflow.tsx

function ItemCreationWorkflow(props: ItemCreationWorkflowProps) {
  const { initialSession, onSessionComplete, ...rest } = props;

  // Initialize workflow state
  const workflowState = useWorkflowState();
  const { state, reset } = workflowState;

  // Set up session persistence
  const {
    wasRestored,
    contentNeedingReUpload,
    checkForRecoverableSession,
    restoreMostRecentSession,
    clearSession,
  } = useSessionPersistence(state, {
    enabled: !initialSession, // Disable if initial session provided via props
    debug: props.config?.debug,
    onSessionRestored: (restored, needsReUpload) => {
      // The parent can handle this via initialSession prop instead
      // Or we could dispatch a RESTORE_SESSION action
    },
  });

  // Handle session recovery on mount
  useEffect(() => {
    if (initialSession) {
      // Use provided initial session
      return;
    }

    if (checkForRecoverableSession()) {
      const restored = restoreMostRecentSession();
      if (restored) {
        // Apply restored state - this could be done via:
        // 1. Passing restored state to useWorkflowState initial state
        // 2. Adding a RESTORE_STATE action to the reducer
        // 3. Showing a "Resume session?" dialog to user
      }
    }
  }, []);

  // Clear session on complete
  const handleSessionComplete = useCallback((session: CompletedSession) => {
    clearSession();
    onSessionComplete(session);
  }, [clearSession, onSessionComplete]);

  // Rest of component...
}
```

**Note:** The actual integration will be implemented in Task 1.3 (Main Workflow Component). This task provides the persistence infrastructure.

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/utils/sessionStorage.ts` | LocalStorage utilities for state serialization, persistence, and recovery |
| `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts` | Hook for auto-save and session recovery |

### Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Add export for useSessionPersistence and types (line 21 - uncomment and update) |
| `src/components/ItemCreationWorkflow/utils/index.ts` | Add export for sessionStorage utilities (line 15 - uncomment) |

### Files to Read (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `src/lib/session.ts` | Pattern reference for localStorage handling |
| `src/components/ItemManager/hooks/useItemManagerState.ts:256-274` | Pattern reference for persistence in hooks |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State structure to persist |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions for serialization |

---

## Dependencies

### Internal Dependencies
- `ItemCreationWorkflow.types.ts` - WorkflowState, WorkflowSession, CurrentItemState, SessionItem, ContentPiece, ContentData
- `hooks/useWorkflowState.ts` - State structure to persist (depends on Task 1.2)

### External Dependencies
- React hooks: `useEffect`, `useRef`, `useCallback`, `useState`
- Browser API: `localStorage`, `JSON.stringify`, `JSON.parse`

### Task Dependencies
- **Depends on:** Task 1.2 (useWorkflowState) - COMPLETED
- **Blocks:** None (provides infrastructure for optional session recovery)
- **Related:** Task 1.3 (Main Workflow Component) will integrate this hook

---

## Testing Strategy

### Unit Tests Required

```typescript
// src/components/ItemCreationWorkflow/utils/__tests__/sessionStorage.test.ts

describe('sessionStorage utilities', () => {
  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is available');
    it('returns false during SSR (window undefined)');
    it('returns false when localStorage throws');
  });

  describe('serializeState', () => {
    it('converts Date objects to ISO strings');
    it('marks binary content as needing re-upload');
    it('preserves text content data');
    it('preserves URL content data');
  });

  describe('deserializeState', () => {
    it('converts ISO strings back to Date objects');
    it('restores RoomType and ItemType enums');
    it('sets isSubmitting and submitError to default values');
  });

  describe('saveWorkflowState', () => {
    it('saves serialized state to localStorage');
    it('updates session index');
    it('returns false when localStorage unavailable');
  });

  describe('loadWorkflowState', () => {
    it('loads and deserializes state from localStorage');
    it('returns null for expired sessions');
    it('clears invalid sessions from storage');
  });

  describe('session index', () => {
    it('tracks multiple sessions');
    it('limits to 10 sessions max');
    it('orders by most recent first');
  });
});

// src/components/ItemCreationWorkflow/hooks/__tests__/useSessionPersistence.test.ts

describe('useSessionPersistence', () => {
  describe('auto-save', () => {
    it('saves state after debounce interval');
    it('does not save when disabled');
    it('does not save on session-summary step');
    it('debounces rapid state changes');
  });

  describe('session recovery', () => {
    it('restoreMostRecentSession returns restored state');
    it('calls onSessionRestored callback with state');
    it('reports content needing re-upload count');
    it('returns null when no sessions to recover');
  });

  describe('session cleanup', () => {
    it('clears session when reaching session-summary');
    it('clears old session when session ID changes');
  });
});
```

---

## Acceptance Criteria Summary

- [ ] sessionStorage.ts utility file created with all helper functions
- [ ] isLocalStorageAvailable handles SSR and private browsing correctly
- [ ] State serialization converts Dates to ISO strings
- [ ] Binary content (File/Blob) marked as needing re-upload
- [ ] Session expiration enforced at 24 hours
- [ ] Multiple sessions tracked via session index (max 10)
- [ ] useSessionPersistence hook auto-saves on state changes (500ms debounce)
- [ ] Session recovery available via restoreMostRecentSession
- [ ] Session cleared from storage when completing workflow
- [ ] Hook returns wasRestored and contentNeedingReUpload state
- [ ] Barrel exports updated in hooks/index.ts and utils/index.ts
- [ ] Code follows established patterns from src/lib/session.ts

---

## Edge Cases and Error Handling

| Scenario | Handling |
|----------|----------|
| localStorage unavailable (SSR) | Return early, don't throw |
| localStorage unavailable (private browsing) | Return false from availability check |
| JSON parse error on load | Catch, log, clear corrupted data, return null |
| localStorage quota exceeded | Catch error, log warning, return false |
| Session expired (>24 hours) | Clear and return null |
| Binary content in state | Mark as needsReUpload flag |
| Session ID changes during workflow | Clear old session, save new one |
| Component unmounts during save | Debounce handles cleanup via useEffect return |

---

## References

- [Implementation Plan: Item Creation Workflow](docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Session Management Utility](src/lib/session.ts)
- [ItemManager State Hook](src/components/ItemManager/hooks/useItemManagerState.ts)
- [ItemCreationWorkflow Types](src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts)
- [useWorkflowState Hook](src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts)

---

*Implementation Overview generated on 2026-01-05 for REQ-096: Session Persistence for Workflow State*
