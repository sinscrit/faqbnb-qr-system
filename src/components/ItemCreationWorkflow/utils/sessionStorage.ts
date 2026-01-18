/**
 * Session Storage Utilities for Workflow State Persistence
 *
 * This module provides utilities for persisting workflow state to localStorage,
 * enabling session recovery when users return to the application.
 *
 * Features:
 * - Auto-save workflow state with debouncing
 * - Session recovery with 24-hour expiration
 * - Support for multiple independent sessions
 * - Safe serialization of complex state (Dates, Files)
 * - State structure validation for corrupted data detection
 *
 * @module ItemCreationWorkflow/utils/sessionStorage
 * @see docs/REQ-096-session-persistence-detailed.md
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05 (REQ-113 Task 5.2)
 */

import type {
  WorkflowState,
  WorkflowStep,
  RoomType,
  ItemType,
  ContentType,
  ContentPiece,
  ContentData,
  CurrentItemState,
  SessionItem,
  WorkflowSession,
} from '../ItemCreationWorkflow.types';

// =============================================================================
// Constants
// =============================================================================

/** Prefix for all workflow storage keys */
export const STORAGE_KEY_PREFIX = 'faqbnb_workflow_';

/** Key for the session index that tracks all active sessions */
export const STORAGE_INDEX_KEY = 'faqbnb_workflow_sessions';

/** Maximum age for a session before it expires (24 hours in milliseconds) */
export const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;

/** Maximum number of sessions to track in the index */
const MAX_SESSIONS = 10;

/** Current storage format version - increment when storage structure changes */
export const STORAGE_VERSION = 1;

// =============================================================================
// Serialized Type Definitions
// =============================================================================

/**
 * Serialized content data - text and URL are preserved exactly,
 * binary content (video/photo/pdf) is marked as needing re-upload
 */
export type SerializedContentData =
  | { type: 'text'; text: string }
  | { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string }
  | { type: 'video'; needsReUpload: true; duration?: number }
  | { type: 'photo'; needsReUpload: true }
  | { type: 'pdf'; needsReUpload: true; pageCount?: number };

/**
 * Serialized content piece - excludes thumbnail (binary)
 */
export interface SerializedContentPiece {
  id: string;
  type: ContentType;
  data: SerializedContentData;
  order: number;
  // thumbnail is excluded - will need regeneration
}

/**
 * Serialized current item state
 */
export interface SerializedCurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;
  itemName: string;
  purpose: string | null;  // PurposeType stored as string
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: SerializedContentPiece[];
  /** Flag indicating if any content needs re-upload */
  hasUnserializableContent: boolean;
}

/**
 * Serialized session item - Date as ISO string
 */
export interface SerializedSessionItem {
  id: string;
  name: string;
  room: RoomType;
  itemType: ItemType;
  content: SerializedContentPiece[];
  createdAt: string; // ISO date string
  qrCodeUrl?: string;
}

/**
 * Serialized workflow session - Date as ISO string
 */
export interface SerializedWorkflowSession {
  id: string;
  startedAt: string; // ISO date string
  currentStep: WorkflowStep;
  items: SerializedSessionItem[];
  currentItem: SerializedCurrentItemState | null;
}

/**
 * Serialized workflow state - complete state for localStorage
 */
export interface SerializedWorkflowState {
  currentStep: WorkflowStep;
  stepHistory: WorkflowStep[];
  canGoBack: boolean;
  session: SerializedWorkflowSession;
  currentItem: SerializedCurrentItemState | null;
  // Note: isSubmitting and submitError are not persisted (transient state)
  isDirty: boolean;
  errors: Record<string, string>;
}

/**
 * Wrapper for stored session with timestamp and version
 */
export interface StoredSession {
  /** Storage format version for migration compatibility */
  version: number;
  /** The serialized workflow state */
  state: SerializedWorkflowState;
  /** Unix timestamp when session was saved */
  savedAt: number;
}

/**
 * Entry in the session index
 */
interface SessionIndexEntry {
  id: string;
  savedAt: number;
}

// =============================================================================
// LocalStorage Availability Check
// =============================================================================

/**
 * Checks if localStorage is available and functional.
 * Handles SSR (window undefined) and private browsing mode (localStorage throws).
 *
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    // Test localStorage availability (might be disabled in private mode)
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
// Storage Key Utility
// =============================================================================

/**
 * Generates a consistent storage key for a workflow session.
 *
 * @param sessionId - The session ID
 * @returns The storage key for this session
 */
export function getStorageKey(sessionId: string): string {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

// =============================================================================
// Serialization Functions
// =============================================================================

/**
 * Serializes content data for localStorage storage.
 * Binary content (File/Blob) is marked as needing re-upload.
 *
 * @param data - Content data to serialize
 * @returns Serialized content data
 */
function serializeContentData(data: ContentData): SerializedContentData {
  switch (data.type) {
    case 'text':
      return { type: 'text', text: data.text };
    case 'url':
      return {
        type: 'url',
        url: data.url,
        title: data.title,
        thumbnailUrl: data.thumbnailUrl,
        faviconUrl: data.faviconUrl,
      };
    case 'video':
      return { type: 'video', needsReUpload: true, duration: data.duration };
    case 'photo':
      return { type: 'photo', needsReUpload: true };
    case 'pdf':
      return { type: 'pdf', needsReUpload: true, pageCount: data.pageCount };
  }
}

/**
 * Serializes content pieces, excluding thumbnail (binary).
 *
 * @param content - Array of content pieces
 * @returns Array of serialized content pieces
 */
function serializeContentPieces(content: ContentPiece[]): SerializedContentPiece[] {
  return content.map((piece) => ({
    id: piece.id,
    type: piece.type,
    data: serializeContentData(piece.data),
    order: piece.order,
    // thumbnail is excluded
  }));
}

/**
 * Checks if content has any binary data that cannot be serialized.
 *
 * @param content - Array of content pieces
 * @returns true if any content needs re-upload
 */
function hasUnserializableContent(content: ContentPiece[]): boolean {
  return content.some((piece) => {
    const type = piece.data.type;
    return type === 'video' || type === 'photo' || type === 'pdf';
  });
}

/**
 * Serializes the current item state.
 *
 * @param item - Current item state
 * @returns Serialized current item state
 */
function serializeCurrentItem(item: CurrentItemState): SerializedCurrentItemState {
  return {
    room: item.room,
    itemType: item.itemType,
    specificItem: item.specificItem,
    itemName: item.itemName,
    purpose: item.purpose,
    contentSource: item.contentSource,
    contentType: item.contentType,
    content: serializeContentPieces(item.content),
    hasUnserializableContent: hasUnserializableContent(item.content),
  };
}

/**
 * Serializes a session item, converting Date to ISO string.
 *
 * @param item - Session item to serialize
 * @returns Serialized session item
 */
function serializeSessionItem(item: SessionItem): SerializedSessionItem {
  return {
    id: item.id,
    name: item.name,
    room: item.room,
    itemType: item.itemType,
    content: serializeContentPieces(item.content),
    createdAt: item.createdAt.toISOString(),
    qrCodeUrl: item.qrCodeUrl,
  };
}

/**
 * Serializes complete workflow state for localStorage storage.
 * Converts Dates to ISO strings and marks binary content for re-upload.
 *
 * @param state - Complete workflow state
 * @returns Serialized workflow state safe for JSON.stringify
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
      items: state.session.items.map(serializeSessionItem),
      currentItem: state.session.currentItem
        ? serializeCurrentItem(state.session.currentItem)
        : null,
    },
    currentItem: state.currentItem
      ? serializeCurrentItem(state.currentItem)
      : null,
    isDirty: state.isDirty,
    errors: state.errors,
    // isSubmitting and submitError are not persisted
  };
}

// =============================================================================
// Deserialization Functions
// =============================================================================

/**
 * Deserializes content data from storage.
 * Binary content gets a placeholder Blob with needsReUpload flag.
 *
 * @param data - Serialized content data
 * @returns Deserialized content data
 */
function deserializeContentData(data: SerializedContentData): ContentData & { needsReUpload?: boolean } {
  switch (data.type) {
    case 'text':
      return { type: 'text', text: data.text };
    case 'url':
      return {
        type: 'url',
        url: data.url,
        title: data.title,
        thumbnailUrl: data.thumbnailUrl,
        faviconUrl: data.faviconUrl,
      };
    case 'video':
      return {
        type: 'video',
        file: new Blob([]),
        duration: data.duration,
        needsReUpload: true,
      } as ContentData & { needsReUpload: boolean };
    case 'photo':
      return {
        type: 'photo',
        file: new Blob([]),
        needsReUpload: true,
      } as ContentData & { needsReUpload: boolean };
    case 'pdf':
      return {
        type: 'pdf',
        file: new Blob([]),
        pageCount: data.pageCount,
        needsReUpload: true,
      } as ContentData & { needsReUpload: boolean };
  }
}

/**
 * Deserializes content pieces from storage.
 * Note: thumbnail is not restored - will need regeneration.
 *
 * @param content - Array of serialized content pieces
 * @returns Array of deserialized content pieces
 */
function deserializeContentPieces(content: SerializedContentPiece[]): ContentPiece[] {
  return content.map((piece) => ({
    id: piece.id,
    type: piece.type,
    data: deserializeContentData(piece.data),
    order: piece.order,
    // thumbnail not restored
  }));
}

/**
 * Deserializes the current item state.
 *
 * @param item - Serialized current item state
 * @returns Deserialized current item state
 */
function deserializeCurrentItem(item: SerializedCurrentItemState): CurrentItemState {
  return {
    room: item.room,
    itemType: item.itemType,
    specificItem: item.specificItem,
    itemName: item.itemName,
    purpose: (item.purpose as CurrentItemState['purpose']) ?? null,
    contentSource: item.contentSource,
    contentType: item.contentType,
    content: deserializeContentPieces(item.content),
  };
}

/**
 * Deserializes a session item, converting ISO string to Date.
 *
 * @param item - Serialized session item
 * @returns Deserialized session item
 */
function deserializeSessionItem(item: SerializedSessionItem): SessionItem {
  return {
    id: item.id,
    name: item.name,
    room: item.room,
    itemType: item.itemType,
    content: deserializeContentPieces(item.content),
    createdAt: new Date(item.createdAt),
    qrCodeUrl: item.qrCodeUrl,
  };
}

/**
 * Deserializes workflow state from localStorage storage.
 * Converts ISO strings back to Dates and creates placeholder Blobs for binary content.
 *
 * @param stored - Serialized workflow state
 * @returns Partial workflow state (missing transient state fields)
 */
export function deserializeState(stored: SerializedWorkflowState): Partial<WorkflowState> {
  return {
    currentStep: stored.currentStep,
    stepHistory: stored.stepHistory,
    canGoBack: stored.canGoBack,
    session: {
      id: stored.session.id,
      startedAt: new Date(stored.session.startedAt),
      currentStep: stored.session.currentStep,
      items: stored.session.items.map(deserializeSessionItem),
      currentItem: stored.session.currentItem
        ? deserializeCurrentItem(stored.session.currentItem)
        : null,
    },
    currentItem: stored.currentItem
      ? deserializeCurrentItem(stored.currentItem)
      : null,
    isDirty: stored.isDirty,
    errors: stored.errors,
    // Set safe defaults for transient state
    isSubmitting: false,
    submitError: null,
  };
}

// =============================================================================
// State Validation Functions
// =============================================================================

/**
 * Validates the structure of a deserialized workflow state.
 * Returns true if state has all required fields with correct types.
 *
 * @param state - State object to validate
 * @returns true if valid, false otherwise
 */
export function isValidWorkflowState(state: unknown): state is SerializedWorkflowState {
  if (!state || typeof state !== 'object') return false;

  const s = state as Record<string, unknown>;

  // Check required top-level fields
  if (typeof s.currentStep !== 'string') return false;
  if (!Array.isArray(s.stepHistory)) return false;
  if (typeof s.canGoBack !== 'boolean') return false;
  if (!s.session || typeof s.session !== 'object') return false;

  // Check session fields
  const session = s.session as Record<string, unknown>;
  if (typeof session.id !== 'string') return false;
  if (typeof session.startedAt !== 'string') return false;
  if (!Array.isArray(session.items)) return false;

  // Validate each session item has required fields
  for (const item of session.items) {
    if (!item || typeof item !== 'object') return false;
    const itemObj = item as Record<string, unknown>;
    if (typeof itemObj.id !== 'string') return false;
    if (typeof itemObj.name !== 'string') return false;
    if (typeof itemObj.room !== 'string') return false;
    if (typeof itemObj.itemType !== 'string') return false;
    if (!Array.isArray(itemObj.content)) return false;
  }

  return true;
}

/**
 * Validates a StoredSession wrapper structure.
 *
 * @param stored - The stored session object to validate
 * @returns true if valid, false otherwise
 */
export function isValidStoredSession(stored: unknown): stored is StoredSession {
  if (!stored || typeof stored !== 'object') return false;

  const s = stored as Record<string, unknown>;

  // Check required wrapper fields
  if (typeof s.savedAt !== 'number') return false;
  if (!s.state || typeof s.state !== 'object') return false;

  // Version is optional for backwards compatibility (defaults to 1)
  if (s.version !== undefined && typeof s.version !== 'number') return false;

  // Validate the state inside
  return isValidWorkflowState(s.state);
}

// =============================================================================
// Session Index Management
// =============================================================================

/**
 * Reads the session index from localStorage.
 *
 * @returns Array of session index entries
 */
function readSessionIndex(): SessionIndexEntry[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_INDEX_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SessionIndexEntry[];
  } catch (error) {
    console.warn('Failed to read session index:', error);
    return [];
  }
}

/**
 * Writes the session index to localStorage.
 *
 * @param index - Array of session index entries
 */
function writeSessionIndex(index: SessionIndexEntry[]): void {
  if (!isLocalStorageAvailable()) return;

  try {
    window.localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.warn('Failed to write session index:', error);
  }
}

/**
 * Updates the session index with a new/updated session.
 * Moves the session to the front (most recent) and limits total sessions.
 *
 * @param sessionId - ID of the session to add/update
 */
function updateSessionIndex(sessionId: string): void {
  const index = readSessionIndex();

  // Remove existing entry for this session
  const filtered = index.filter((entry) => entry.id !== sessionId);

  // Add to front with current timestamp
  const updated: SessionIndexEntry[] = [
    { id: sessionId, savedAt: Date.now() },
    ...filtered,
  ].slice(0, MAX_SESSIONS);

  writeSessionIndex(updated);
}

/**
 * Removes a session from the session index.
 *
 * @param sessionId - ID of the session to remove
 */
function removeFromSessionIndex(sessionId: string): void {
  const index = readSessionIndex();
  const filtered = index.filter((entry) => entry.id !== sessionId);
  writeSessionIndex(filtered);
}

/**
 * Gets all active session IDs, filtered by expiration and sorted by most recent.
 *
 * @returns Array of session IDs, most recent first
 */
export function getActiveSessionIds(): string[] {
  const now = Date.now();
  const index = readSessionIndex();

  // Filter out expired sessions
  const active = index.filter(
    (entry) => now - entry.savedAt <= MAX_SESSION_AGE_MS
  );

  // Sort by savedAt descending (most recent first)
  active.sort((a, b) => b.savedAt - a.savedAt);

  return active.map((entry) => entry.id);
}

// =============================================================================
// Storage CRUD Operations
// =============================================================================

/**
 * Saves workflow state to localStorage.
 *
 * @param state - Complete workflow state to save
 * @returns true if saved successfully, false otherwise
 */
export function saveWorkflowState(state: WorkflowState): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const serialized = serializeState(state);
    const stored: StoredSession = {
      version: STORAGE_VERSION,
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
 * Returns null for expired, missing, or invalid sessions.
 *
 * @param sessionId - ID of the session to load
 * @returns Partial workflow state or null if not found/expired/invalid
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

    const parsed = JSON.parse(stored);

    // Validate structure before using
    if (!isValidStoredSession(parsed)) {
      console.warn('Invalid workflow state structure, clearing:', sessionId);
      clearWorkflowState(sessionId);
      return null;
    }

    // Check expiration
    if (Date.now() - parsed.savedAt > MAX_SESSION_AGE_MS) {
      console.info('Session expired, clearing:', sessionId);
      clearWorkflowState(sessionId);
      return null;
    }

    // Check version for future migration support
    const version = parsed.version ?? 1;
    if (version > STORAGE_VERSION) {
      console.warn('Session from newer app version, clearing:', sessionId);
      clearWorkflowState(sessionId);
      return null;
    }

    return deserializeState(parsed.state);
  } catch (error) {
    console.error('Failed to load workflow state:', error);
    // Clear corrupted data
    clearWorkflowState(sessionId);
    return null;
  }
}

/**
 * Loads the most recently saved workflow state.
 *
 * @returns Partial workflow state or null if no valid sessions
 */
export function loadMostRecentWorkflowState(): Partial<WorkflowState> | null {
  const sessionIds = getActiveSessionIds();

  if (sessionIds.length === 0) {
    return null;
  }

  // Try each session, starting with most recent
  for (const sessionId of sessionIds) {
    const state = loadWorkflowState(sessionId);
    if (state) {
      return state;
    }
    // If load failed (expired/invalid), it's already cleaned up
  }

  return null;
}

/**
 * Clears a specific workflow session from localStorage.
 *
 * @param sessionId - ID of the session to clear
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
 * Clears all workflow sessions from localStorage.
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
// Utility Helper Functions
// =============================================================================

/**
 * Checks if there are any recoverable sessions in localStorage.
 *
 * @returns true if at least one recoverable session exists
 */
export function hasRecoverableSession(): boolean {
  return getActiveSessionIds().length > 0;
}

/**
 * Counts the number of content pieces that need re-upload.
 *
 * @param state - Partial workflow state
 * @returns Number of content pieces needing re-upload
 */
export function getContentNeedingReUpload(state: Partial<WorkflowState>): number {
  let count = 0;

  // Check current item content
  if (state.currentItem?.content) {
    for (const piece of state.currentItem.content) {
      const data = piece.data as ContentData & { needsReUpload?: boolean };
      if (data.needsReUpload) {
        count++;
      }
    }
  }

  // Check session items content
  if (state.session?.items) {
    for (const item of state.session.items) {
      for (const piece of item.content) {
        const data = piece.data as ContentData & { needsReUpload?: boolean };
        if (data.needsReUpload) {
          count++;
        }
      }
    }
  }

  return count;
}
