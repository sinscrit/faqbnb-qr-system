/**
 * ItemCreationWorkflow Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the ItemCreationWorkflow
 * component. These types define the component's props, configuration options,
 * output data structures, and internal state management.
 *
 * @module ItemCreationWorkflow/types
 * @see docs/prd/Plan-093-Item-Creation-Workflow.md
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration options for ItemCreationWorkflow behavior.
 * All properties are optional with sensible defaults.
 */
export interface WorkflowConfig {
  /** Maximum items allowed per session (default: 50) */
  maxItemsPerSession?: number;

  /** Enable URL preview with metadata fetching (default: true) */
  enableUrlPreview?: boolean;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Main component props for ItemCreationWorkflow.
 */
export interface ItemCreationWorkflowProps {
  /** Called when user completes session (with or without printing) */
  onSessionComplete: (session: CompletedSession) => void;

  /** Called when user exits mid-session (before completing any items) */
  onSessionExit: (session: PartialSession) => void;

  /** Called when user requests PDF generation */
  onGeneratePDF: (items: SessionItem[], scope: PrintScope) => Promise<Blob>;

  /** Called when user requests direct print */
  onPrintDirect: (items: SessionItem[], scope: PrintScope) => Promise<void>;

  /** Called to fetch existing items for display in summary */
  onFetchExistingItems: () => Promise<SessionItem[]>;

  /** Called to persist a new item to database */
  onSaveItem: (item: SessionItem) => Promise<{ id: string; qrCodeUrl: string }>;

  /** Optional: Pre-populate with existing session (resume) */
  initialSession?: WorkflowSession;

  /** Optional: Configuration overrides */
  config?: WorkflowConfig;

  /** Optional: CSS class name for the root element */
  className?: string;
}

// =============================================================================
// Domain Types
// =============================================================================

/**
 * Room categories for item organization.
 * Based on PRD Appendix A specifications.
 */
export type RoomType =
  | 'kitchen'
  | 'laundry'
  | 'bedroom'
  | 'bathroom'
  | 'living-room'
  | 'garage'
  | 'outdoor'
  | 'general'
  | 'other';

/**
 * Item type categories within a room.
 */
export type ItemType = 'appliance' | 'room-item' | 'general-info';

/**
 * Content type categories for item content.
 */
export type ContentType = 'video' | 'photo' | 'pdf' | 'text' | 'url';

// =============================================================================
// Session Types
// =============================================================================

/**
 * Workflow step identifiers for navigation state machine.
 */
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'content-source-selection'
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';

/**
 * Complete workflow session state.
 * Tracks the entire session including all items created.
 */
export interface WorkflowSession {
  /** Unique session identifier (UUID) */
  id: string;

  /** When the session was started */
  startedAt: Date;

  /** Current position in the workflow */
  currentStep: WorkflowStep;

  /** Items created during this session */
  items: SessionItem[];

  /** Item currently being created (null when not in item creation flow) */
  currentItem: CurrentItemState | null;
}

/**
 * State for the item currently being created.
 * Progressively filled as user moves through steps.
 */
export interface CurrentItemState {
  /** Selected room for this item */
  room: RoomType;

  /** Selected item type category */
  itemType: ItemType;

  /** Specific item name from suggestions or custom input */
  specificItem: string;

  /** Display name for the item (auto-generated or user-edited) */
  itemName: string;

  /** Content source choice: existing upload or create new */
  contentSource: 'existing' | 'create-new';

  /** Selected content type (null until chosen) */
  contentType: ContentType | null;

  /** Content pieces added to this item */
  content: ContentPiece[];
}

/**
 * A completed item within the session.
 * Contains all data needed for display and persistence.
 */
export interface SessionItem {
  /** Unique item identifier (UUID) */
  id: string;

  /** Display name for the item */
  name: string;

  /** Room where the item is located */
  room: RoomType;

  /** Item type category */
  itemType: ItemType;

  /** All content pieces attached to this item */
  content: ContentPiece[];

  /** When the item was created */
  createdAt: Date;

  /** Generated QR code URL (populated after save) */
  qrCodeUrl?: string;
}

/**
 * Content data varies by content type.
 * This union type handles all possible content payloads.
 */
export type ContentData =
  | { type: 'video'; file: File | Blob; duration?: number }
  | { type: 'photo'; file: File | Blob }
  | { type: 'pdf'; file: File | Blob; pageCount?: number }
  | { type: 'text'; text: string }
  | { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string };

/**
 * Individual content piece within an item.
 * Items can have multiple content pieces of different types.
 */
export interface ContentPiece {
  /** Unique identifier for this content piece (UUID) */
  id: string;

  /** Type of content */
  type: ContentType;

  /** Type-specific content data */
  data: ContentData;

  /** Display order within the item (0-indexed) */
  order: number;

  /** Generated thumbnail for preview display */
  thumbnail?: Blob;
}

// =============================================================================
// Output Types (Public API)
// =============================================================================

/**
 * Returned via onSessionComplete callback when workflow finishes successfully.
 * Contains all session data for parent component handling.
 */
export interface CompletedSession {
  /** Session identifier */
  id: string;

  /** Items created during this session */
  newItems: SessionItem[];

  /** Previously existing items (fetched for comparison/printing) */
  existingItems: SessionItem[];

  /** When the session was completed */
  completedAt: Date;

  /** Action taken for printing QR codes */
  printAction: 'pdf' | 'direct' | 'skipped';

  /** Scope of items included in print action */
  printScope?: PrintScope;
}

/**
 * Returned via onSessionExit callback when user exits mid-session.
 * Captures session state for potential resume or analytics.
 */
export interface PartialSession {
  /** Session identifier */
  id: string;

  /** When the session was started */
  startedAt: Date;

  /** Step where user exited */
  currentStep: WorkflowStep;

  /** Items created before exit (may be empty) */
  items: SessionItem[];

  /** When the user exited */
  exitedAt: Date;
}

/**
 * Print scope selection for QR code generation.
 * Determines which items to include in PDF or direct print.
 */
export type PrintScope =
  | { type: 'all' }
  | { type: 'new-only' }
  | { type: 'selected'; itemIds: string[] };

// =============================================================================
// Internal State Types (for component development)
// =============================================================================

/**
 * Complete internal state for the ItemCreationWorkflow component.
 * Managed by useWorkflowState hook reducer.
 */
export interface WorkflowState {
  // Navigation
  /** Current workflow step */
  currentStep: WorkflowStep;

  /** History of steps for back navigation */
  stepHistory: WorkflowStep[];

  /** Whether user can navigate back */
  canGoBack: boolean;

  // Session data
  /** Complete session state */
  session: WorkflowSession;

  /** Item currently being created */
  currentItem: CurrentItemState | null;

  // UI state
  /** Whether a submission is in progress */
  isSubmitting: boolean;

  /** Whether there are unsaved changes */
  isDirty: boolean;

  // Error state
  /** Field-level validation errors */
  errors: Record<string, string>;

  /** Submission-level error message */
  submitError: string | null;
}

/**
 * All actions that can be dispatched to modify workflow state.
 * Uses discriminated union pattern for type-safe action handling.
 */
export type WorkflowAction =
  // Navigation actions
  | { type: 'GO_TO_STEP'; payload: WorkflowStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

  // Room/Item selection actions
  | { type: 'SELECT_ROOM'; payload: RoomType }
  | { type: 'SELECT_ITEM_TYPE'; payload: ItemType }
  | { type: 'SELECT_SPECIFIC_ITEM'; payload: string }
  | { type: 'SET_ITEM_NAME'; payload: string }

  // Content actions
  | { type: 'SELECT_CONTENT_SOURCE'; payload: 'existing' | 'create-new' }
  | { type: 'SELECT_CONTENT_TYPE'; payload: ContentType }
  | { type: 'ADD_CONTENT_PIECE'; payload: ContentPiece }
  | { type: 'REMOVE_CONTENT_PIECE'; payload: string }
  | { type: 'REORDER_CONTENT'; payload: { fromIndex: number; toIndex: number } }

  // Session management actions
  | { type: 'SAVE_ITEM'; payload: SessionItem }
  | { type: 'START_NEW_ITEM' }
  | { type: 'COMPLETE_SESSION' }

  // Error handling actions
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }

  // Submission actions
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SUBMIT_ERROR'; payload: string }

  // Reset
  | { type: 'RESET' };
