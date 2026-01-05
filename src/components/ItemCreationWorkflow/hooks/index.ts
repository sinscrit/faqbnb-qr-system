/**
 * ItemCreationWorkflow Hooks - Barrel Export
 *
 * This module exports all custom hooks for the ItemCreationWorkflow component.
 * Hooks are organized by functional category:
 *
 * - **State Management**: `useWorkflowState` - Core workflow state machine
 * - **Persistence**: `useSessionPersistence` - Session recovery and draft saving
 * - **Data**: `useSuggestions`, `useUrlPreview` - Dynamic data fetching
 * - **Generation**: `useSessionQRGeneration`, `usePDFGeneration` - Output generation
 *
 * @example Using hooks together
 * ```tsx
 * import {
 *   useWorkflowState,
 *   useSuggestions,
 *   useSessionQRGeneration,
 * } from '@/components/ItemCreationWorkflow/hooks';
 *
 * function MyWorkflow() {
 *   const { state, dispatch } = useWorkflowState();
 *   const { suggestions } = useSuggestions({
 *     room: state.currentItem?.room,
 *     itemType: state.currentItem?.itemType,
 *   });
 *   const { generateQRCodes, isGenerating } = useSessionQRGeneration({
 *     items: state.session.items,
 *   });
 *   // ...
 * }
 * ```
 *
 * @module ItemCreationWorkflow/hooks
 * @see useWorkflowState for core state machine documentation
 * @see README.md for comprehensive usage examples
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

// =============================================================================
// State Management Hooks
// =============================================================================
/**
 * Core state machine for managing the complete workflow lifecycle.
 * Uses useReducer pattern for predictable state transitions.
 */
export { useWorkflowState } from './useWorkflowState';
export type { UseWorkflowStateReturn } from './useWorkflowState';

// =============================================================================
// Persistence Hooks
// =============================================================================
/**
 * Session persistence with auto-save and recovery capabilities.
 * Saves to localStorage with debouncing to minimize storage operations.
 */
export { useSessionPersistence } from './useSessionPersistence';
export type {
  UseSessionPersistenceOptions,
  UseSessionPersistenceReturn,
} from './useSessionPersistence';

// =============================================================================
// Data Hooks
// =============================================================================
/**
 * Dynamic data fetching hooks for suggestions and URL previews.
 * Provide contextual item suggestions and rich link metadata.
 */
export { useSuggestions } from './useSuggestions';
export type {
  UseSuggestionsOptions,
  UseSuggestionsReturn,
} from './useSuggestions';

export { useUrlPreview } from './useUrlPreview';
export type {
  UseUrlPreviewOptions,
  UrlPreviewStatus,
  UseUrlPreviewReturn,
} from './useUrlPreview';

// =============================================================================
// QR Generation Hooks
// =============================================================================
/**
 * Batch QR code generation for session items.
 * Wraps the base QR generation with session-specific progress tracking.
 */
export { useSessionQRGeneration } from './useSessionQRGeneration';
export type {
  UseSessionQRGenerationOptions,
  UseSessionQRGenerationReturn,
  QRItemStatus,
  QRGenerationStats,
} from './useSessionQRGeneration';

// =============================================================================
// PDF Generation Hooks
// =============================================================================
/**
 * PDF export configuration and generation.
 * Manages user preferences and orchestrates PDF creation for QR code sheets.
 */
export { usePDFExportSettings, DEFAULT_PDF_EXPORT_SETTINGS } from './usePDFExportSettings';
export type {
  UsePDFExportSettingsOptions,
  UsePDFExportSettingsReturn,
} from './usePDFExportSettings';

export { usePDFGeneration } from './usePDFGeneration';
export type {
  UsePDFGenerationOptions,
  UsePDFGenerationReturn,
} from './usePDFGeneration';
