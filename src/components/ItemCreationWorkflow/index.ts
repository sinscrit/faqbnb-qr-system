/**
 * ItemCreationWorkflow Component - Public Exports
 *
 * This barrel file provides the public API for the ItemCreationWorkflow component.
 * Import from '@/components/ItemCreationWorkflow' for clean, predictable imports.
 *
 * @example
 * import {
 *   ItemCreationWorkflow,
 *   ItemCreationWorkflowProps,
 *   WorkflowSession,
 *   RoomType,
 *   ROOM_TYPES,
 *   getSuggestions,
 * } from '@/components/ItemCreationWorkflow';
 *
 * @module ItemCreationWorkflow
 * @lastModified 2026-01-05 (REQ-095 Task 1.3)
 */

// =============================================================================
// Public Types (for consumer use)
// =============================================================================

export type {
  // Configuration
  ItemCreationWorkflowProps,
  WorkflowConfig,

  // Domain types
  RoomType,
  ItemType,
  ContentType,

  // Session types
  WorkflowSession,
  WorkflowStep,
  CurrentItemState,
  SessionItem,
  ContentPiece,
  ContentData,

  // Output types
  CompletedSession,
  PartialSession,
  PrintScope,
} from './ItemCreationWorkflow.types';

// =============================================================================
// Internal Types (for component development)
// =============================================================================

export type {
  WorkflowState,
  WorkflowAction,
} from './ItemCreationWorkflow.types';

// =============================================================================
// Constants Export
// =============================================================================

export {
  // Room configuration
  ROOM_TYPES,
  ROOM_LABELS,
  ROOM_ICONS,

  // Item type configuration
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_DESCRIPTIONS,

  // Content type configuration
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  CONTENT_SOURCE_OPTIONS,

  // Workflow configuration
  WORKFLOW_CONFIG_DEFAULTS,
  WORKFLOW_STEPS,

  // UI constants
  TOUCH_TARGET_MIN_SIZE,
  PROGRESS_WEIGHTS,
} from './utils/constants';

export type {
  RoomTypeConst,
  ItemTypeConst,
  ContentTypeConst,
  WorkflowStepConst,
} from './utils/constants';

// =============================================================================
// Suggestion Matrix Export
// =============================================================================

export {
  SUGGESTION_MATRIX,
  getSuggestions,
  hasSuggestions,
  getAllSuggestionsForType,
  getAllSuggestions,
} from './utils/suggestionMatrix';

// =============================================================================
// Hooks Export
// =============================================================================

// Task 1.2: useWorkflowState - Core state machine hook (REQ-094)
export { useWorkflowState } from './hooks';
export type { UseWorkflowStateReturn } from './hooks';

// Task 1.4: useSessionPersistence
// export { useSessionPersistence } from './hooks';

// Task 2.3: useSuggestions
// export { useSuggestions } from './hooks';

// Task 3.3: useUrlPreview
// export { useUrlPreview } from './hooks';

// =============================================================================
// Components Export
// =============================================================================

// Task 1.3: Main component
export { ItemCreationWorkflow } from './ItemCreationWorkflow';

// Task 1.3: WorkflowHeader
export { WorkflowHeader } from './components/shared/WorkflowHeader';
export type { WorkflowHeaderProps } from './components/shared/WorkflowHeader';

// Task 1.3: ConfirmExitDialog
export { ConfirmExitDialog } from './components/shared/ConfirmExitDialog';
export type { ConfirmExitDialogProps } from './components/shared/ConfirmExitDialog';

// Task 1.5: SessionProgressBar
export { SessionProgressBar } from './components/shared/SessionProgressBar';
export type { SessionProgressBarProps } from './components/shared/SessionProgressBar';

// Task 1.5: RoomCard
export { RoomCard } from './components/shared/RoomCard';
export type { RoomCardProps } from './components/shared/RoomCard';

// Task 1.5: ItemTypeCard
export { ItemTypeCard, ITEM_TYPE_ICONS } from './components/shared/ItemTypeCard';
export type { ItemTypeCardProps } from './components/shared/ItemTypeCard';
