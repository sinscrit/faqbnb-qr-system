/**
 * ItemCreationWorkflow Component - Public Exports
 *
 * This barrel file provides the public API for the ItemCreationWorkflow component.
 * Import from '@/components/ItemCreationWorkflow' for clean, predictable imports.
 *
 * ## Module Organization
 *
 * - **Types**: Configuration, domain, session, and output type definitions
 * - **Constants**: Room types, item types, content types, workflow configuration
 * - **Hooks**: State management, persistence, suggestions, preview, QR/PDF generation
 * - **Components**: Main workflow, step components, shared UI elements
 * - **Utilities**: Suggestion matrix, session storage, accessibility helpers
 *
 * @example Basic Integration
 * ```tsx
 * import { ItemCreationWorkflow, ItemCreationWorkflowProps } from '@/components/ItemCreationWorkflow';
 *
 * function MyPage() {
 *   return (
 *     <ItemCreationWorkflow
 *       onSessionComplete={(session) => console.log('Completed:', session)}
 *       onSessionExit={(partial) => console.log('Exited:', partial)}
 *       onGeneratePDF={async (items, scope) => new Blob()}
 *       onPrintDirect={async () => window.print()}
 *       onFetchExistingItems={async () => []}
 *       onSaveItem={async (item) => ({ id: 'new-id', qrCodeUrl: '/qr/new-id' })}
 *     />
 *   );
 * }
 * ```
 *
 * @example Using Hooks Directly
 * ```tsx
 * import { useWorkflowState, useSuggestions } from '@/components/ItemCreationWorkflow';
 *
 * const { state, dispatch, canGoBack, goBack } = useWorkflowState();
 * const { suggestions } = useSuggestions({ room: 'kitchen', itemType: 'appliance' });
 * ```
 *
 * @example Importing Types
 * ```tsx
 * import type {
 *   WorkflowSession,
 *   SessionItem,
 *   RoomType,
 *   CompletedSession,
 *   PrintScope,
 * } from '@/components/ItemCreationWorkflow';
 * ```
 *
 * @module ItemCreationWorkflow
 * @see README.md for comprehensive usage documentation
 * @see docs/prd/Plan-093-Item-Creation-Workflow.md for implementation details
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

// =============================================================================
// Public Types (for consumer use)
// =============================================================================
/**
 * Public type exports for consumers of the ItemCreationWorkflow component.
 * Import these types to properly type your callback handlers and state management.
 *
 * - **Configuration**: Props and config for the main component
 * - **Domain**: Room, item, and content type identifiers
 * - **Session**: State structures for workflow and items
 * - **Output**: Return types from callbacks
 */
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
/**
 * Internal type exports for extending or testing the ItemCreationWorkflow.
 * Use these when building custom step components or testing state transitions.
 */
export type {
  WorkflowState,
  WorkflowAction,
} from './ItemCreationWorkflow.types';

// =============================================================================
// Constants Export
// =============================================================================
/**
 * Configuration constants for the workflow. Use these for:
 * - Populating room and item type selection UI
 * - Configuring workflow defaults
 * - Accessing human-readable labels and icons
 */
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
/**
 * Dynamic item suggestions based on room and item type combinations.
 * Use `getSuggestions(room, itemType)` to get contextual suggestions,
 * or `hasSuggestions(room, itemType)` to check availability.
 */
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
/**
 * Custom hooks for workflow state management and feature integration.
 *
 * - **useWorkflowState**: Core state machine for navigation and item creation
 * - **useSessionPersistence**: Auto-save to localStorage with recovery
 * - **useSuggestions**: Dynamic item suggestions by room and type
 * - **useUrlPreview**: URL metadata fetching for link previews
 * - **useSessionQRGeneration**: Batch QR code generation
 * - **usePDFExportSettings**: PDF export configuration
 * - **usePDFGeneration**: PDF generation orchestration
 */
export { useWorkflowState } from './hooks';
export type { UseWorkflowStateReturn } from './hooks';

export { useSessionPersistence } from './hooks';
export type {
  UseSessionPersistenceOptions,
  UseSessionPersistenceReturn,
} from './hooks';

export { useSuggestions } from './hooks';
export type { UseSuggestionsOptions, UseSuggestionsReturn } from './hooks';

export { useUrlPreview } from './hooks';
export type {
  UseUrlPreviewOptions,
  UrlPreviewStatus,
  UseUrlPreviewReturn,
} from './hooks';

export { useSessionQRGeneration } from './hooks';
export type {
  UseSessionQRGenerationOptions,
  UseSessionQRGenerationReturn,
  QRItemStatus,
  QRGenerationStats,
} from './hooks';

export { usePDFExportSettings, DEFAULT_PDF_EXPORT_SETTINGS } from './hooks';
export type {
  UsePDFExportSettingsOptions,
  UsePDFExportSettingsReturn,
} from './hooks';

export { usePDFGeneration } from './hooks';
export type { UsePDFGenerationOptions, UsePDFGenerationReturn } from './hooks';

// =============================================================================
// Components Export
// =============================================================================
/**
 * Main workflow component and shared UI components.
 *
 * - **ItemCreationWorkflow**: Main component - renders the complete workflow
 * - **Layout**: WorkflowHeader, ConfirmExitDialog, SessionProgressBar
 * - **Selection**: RoomCard, ItemTypeCard, SuggestionButton, ItemNameEditor
 * - **Content**: ContentPieceCard, SortableContentPieceCard
 * - **Summary**: SessionItemCard, PrintOptionsPanel, PDFExportDialog
 * - **Error Handling**: NetworkErrorIndicator, SessionRecoveryBanner, etc.
 */
export { ItemCreationWorkflow } from './ItemCreationWorkflow';

// Layout components
export { WorkflowHeader } from './components/shared/WorkflowHeader';
export type { WorkflowHeaderProps } from './components/shared/WorkflowHeader';

export { ConfirmExitDialog } from './components/shared/ConfirmExitDialog';
export type { ConfirmExitDialogProps } from './components/shared/ConfirmExitDialog';

export { SessionProgressBar } from './components/shared/SessionProgressBar';
export type { SessionProgressBarProps } from './components/shared/SessionProgressBar';

// Selection components
export { RoomCard } from './components/shared/RoomCard';
export type { RoomCardProps } from './components/shared/RoomCard';

export { ItemTypeCard, ITEM_TYPE_ICONS } from './components/shared/ItemTypeCard';
export type { ItemTypeCardProps } from './components/shared/ItemTypeCard';

export { SuggestionButton } from './components/shared/SuggestionButton';
export type { SuggestionButtonProps } from './components/shared/SuggestionButton';

export { ItemNameEditor } from './components/shared/ItemNameEditor';
export type { ItemNameEditorProps } from './components/shared/ItemNameEditor';

// Content components
export { ContentPieceCard } from './components/shared/ContentPieceCard';
export type { ContentPieceCardProps } from './components/shared/ContentPieceCard';

export { SortableContentPieceCard } from './components/shared/SortableContentPieceCard';
export type { SortableContentPieceCardProps } from './components/shared/SortableContentPieceCard';

// Summary components
export { SessionItemCard } from './components/shared/SessionItemCard';
export type { SessionItemCardProps } from './components/shared/SessionItemCard';

export { RemoveItemDialog } from './components/shared/RemoveItemDialog';
export type { RemoveItemDialogProps } from './components/shared/RemoveItemDialog';

export { PrintOptionsPanel } from './components/shared/PrintOptionsPanel';
export type { PrintOptionsPanelProps } from './components/shared/PrintOptionsPanel';

export { QRGenerationProgress } from './components/shared/QRGenerationProgress';
export type {
  QRGenerationProgressProps,
  QRProgressItem,
  QRProgressItemStatus,
} from './components/shared/QRGenerationProgress';

export { PDFExportDialog } from './components/shared/PDFExportDialog';
export type { PDFExportDialogProps } from './components/shared/PDFExportDialog';

// Error handling components
export { NetworkErrorIndicator } from './components/shared/NetworkErrorIndicator';
export type { NetworkErrorIndicatorProps } from './components/shared/NetworkErrorIndicator';

export { CameraPermissionFallback } from './components/shared/CameraPermissionFallback';
export type { CameraPermissionFallbackProps } from './components/shared/CameraPermissionFallback';

export { SessionRecoveryBanner } from './components/shared/SessionRecoveryBanner';
export type { SessionRecoveryBannerProps } from './components/shared/SessionRecoveryBanner';

export { TruncatedText } from './components/shared/TruncatedText';
export type { TruncatedTextProps } from './components/shared/TruncatedText';

export { EmptySessionDialog } from './components/shared/EmptySessionDialog';
export type { EmptySessionDialogProps } from './components/shared/EmptySessionDialog';

export { DuplicateNameWarning } from './components/shared/DuplicateNameWarning';
export type { DuplicateNameWarningProps } from './components/shared/DuplicateNameWarning';
