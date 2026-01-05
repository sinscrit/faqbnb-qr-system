/**
 * ItemCreationWorkflow Shared Components - Barrel Export
 *
 * @module ItemCreationWorkflow/components/shared
 * @lastModified 2026-01-05 (REQ-113 Error Handling & Edge Cases)
 */

// =============================================================================
// Layout Components (Phase 1)
// =============================================================================

// Task 1.3: WorkflowHeader
export { WorkflowHeader } from './WorkflowHeader';
export type { WorkflowHeaderProps } from './WorkflowHeader';

// Task 1.3: ConfirmExitDialog
export { ConfirmExitDialog } from './ConfirmExitDialog';
export type { ConfirmExitDialogProps } from './ConfirmExitDialog';

// Task 1.5: SessionProgressBar
export { SessionProgressBar } from './SessionProgressBar';
export type { SessionProgressBarProps } from './SessionProgressBar';

// =============================================================================
// Selection Components (Phase 1 & 2)
// =============================================================================

// Task 1.5: RoomCard
export { RoomCard } from './RoomCard';
export type { RoomCardProps } from './RoomCard';

// Task 1.5: ItemTypeCard
export { ItemTypeCard, ITEM_TYPE_ICONS } from './ItemTypeCard';
export type { ItemTypeCardProps } from './ItemTypeCard';

// Task 2.3: SuggestionButton
export { SuggestionButton } from './SuggestionButton';
export type { SuggestionButtonProps } from './SuggestionButton';

// Task 2.3: ItemNameEditor
export { ItemNameEditor } from './ItemNameEditor';
export type { ItemNameEditorProps } from './ItemNameEditor';

// =============================================================================
// Content Components (Phase 4 & Phase 5)
// =============================================================================

// Task 4.2: ContentPieceCard
export { ContentPieceCard } from './ContentPieceCard';
export type { ContentPieceCardProps } from './ContentPieceCard';

// Task 5.2 (REQ-108): SortableContentPieceCard
export { SortableContentPieceCard } from './SortableContentPieceCard';
export type { SortableContentPieceCardProps } from './SortableContentPieceCard';

// =============================================================================
// Summary Components (Phase 6)
// =============================================================================

// Task 6.1: SessionItemCard
export { SessionItemCard } from './SessionItemCard';
export type { SessionItemCardProps } from './SessionItemCard';

// Task 6.1: RemoveItemDialog
export { RemoveItemDialog } from './RemoveItemDialog';
export type { RemoveItemDialogProps } from './RemoveItemDialog';

// Task 6.2: PrintOptionsPanel
export { PrintOptionsPanel } from './PrintOptionsPanel';
export type { PrintOptionsPanelProps } from './PrintOptionsPanel';

// Task 6.3: QRGenerationProgress - QR generation progress UI
export { QRGenerationProgress } from './QRGenerationProgress';
export type {
  QRGenerationProgressProps,
  QRProgressItem,
  QRProgressItemStatus,
} from './QRGenerationProgress';

// =============================================================================
// PDF Export Components (Task 6.4)
// =============================================================================

// Task 6.4.3: PDFExportDialog
export { PDFExportDialog } from './PDFExportDialog';
export type { PDFExportDialogProps } from './PDFExportDialog';

// =============================================================================
// Error Handling Components (Phase 7 - REQ-113)
// =============================================================================

// Task 7.1.2: NetworkErrorIndicator
export { NetworkErrorIndicator } from './NetworkErrorIndicator';
export type { NetworkErrorIndicatorProps } from './NetworkErrorIndicator';

// Task 7.1.3: CameraPermissionFallback
export { CameraPermissionFallback } from './CameraPermissionFallback';
export type { CameraPermissionFallbackProps } from './CameraPermissionFallback';

// Task 7.1.4: SessionRecoveryBanner
export { SessionRecoveryBanner } from './SessionRecoveryBanner';
export type { SessionRecoveryBannerProps } from './SessionRecoveryBanner';

// Task 7.1.5: TruncatedText
export { TruncatedText } from './TruncatedText';
export type { TruncatedTextProps } from './TruncatedText';

// Task 7.1.6: EmptySessionDialog
export { EmptySessionDialog } from './EmptySessionDialog';
export type { EmptySessionDialogProps } from './EmptySessionDialog';

// Task 7.1.7: DuplicateNameWarning
export { DuplicateNameWarning } from './DuplicateNameWarning';
export type { DuplicateNameWarningProps } from './DuplicateNameWarning';
