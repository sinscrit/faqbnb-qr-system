/**
 * ItemCreationWorkflow Hooks - Barrel Export
 *
 * @module ItemCreationWorkflow/hooks
 * @lastModified 2026-01-05 (REQ-096 Task 1.4)
 */

// =============================================================================
// State Management Hooks
// =============================================================================

// Task 1.2: useWorkflowState - Core state machine hook
export { useWorkflowState } from './useWorkflowState';
export type { UseWorkflowStateReturn } from './useWorkflowState';

// =============================================================================
// Persistence Hooks
// =============================================================================

// Task 1.4: useSessionPersistence - Session persistence hook
export { useSessionPersistence } from './useSessionPersistence';
export type {
  UseSessionPersistenceOptions,
  UseSessionPersistenceReturn,
} from './useSessionPersistence';

// =============================================================================
// Data Hooks
// =============================================================================

// Task 2.3: useSuggestions - Dynamic suggestions hook
export { useSuggestions } from './useSuggestions';
export type {
  UseSuggestionsOptions,
  UseSuggestionsReturn,
} from './useSuggestions';

// Task 3.3: useUrlPreview - URL preview fetching hook
export { useUrlPreview } from './useUrlPreview';
export type {
  UseUrlPreviewOptions,
  UrlPreviewStatus,
  UseUrlPreviewReturn,
} from './useUrlPreview';
