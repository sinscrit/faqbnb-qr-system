/**
 * ItemCreationWorkflow Shared Components - Barrel Export
 *
 * This module exports reusable UI components used across the workflow steps.
 * Components are organized by functional category:
 *
 * - **Layout**: WorkflowHeader, ConfirmExitDialog, SessionProgressBar
 * - **Selection**: RoomCard, ItemTypeCard, SuggestionButton, ItemNameEditor
 * - **Content**: ContentPieceCard, SortableContentPieceCard, ContentPreview
 * - **Summary**: SessionItemCard, RemoveItemDialog, PrintOptionsPanel, PDFExportDialog
 * - **Error Handling**: NetworkErrorIndicator, CameraPermissionFallback, SessionRecoveryBanner
 *
 * Most components are used internally by step components, but can be imported
 * for custom workflow implementations or testing.
 *
 * @example Importing shared components
 * ```tsx
 * import {
 *   WorkflowHeader,
 *   RoomCard,
 *   SessionItemCard,
 * } from '@/components/ItemCreationWorkflow/components/shared';
 * ```
 *
 * @module ItemCreationWorkflow/components/shared
 * @see README.md for complete component documentation
 * @lastModified 2026-01-10 (Plan-094, REQ-175, REQ-177 Tags)
 */

// =============================================================================
// Layout Components
// =============================================================================
/**
 * Layout components for workflow navigation and progress display.
 * Used at the top of each workflow step for consistent UX.
 */
export { WorkflowHeader } from './WorkflowHeader';
export type { WorkflowHeaderProps } from './WorkflowHeader';

export { ConfirmExitDialog } from './ConfirmExitDialog';
export type { ConfirmExitDialogProps } from './ConfirmExitDialog';

export { SessionProgressBar } from './SessionProgressBar';
export type { SessionProgressBarProps } from './SessionProgressBar';

// =============================================================================
// Selection Components
// =============================================================================
/**
 * Selection UI components for room, item type, and item name input.
 * Touch-friendly with minimum 48px touch targets.
 */
export { RoomCard } from './RoomCard';
export type { RoomCardProps } from './RoomCard';

export { ItemTypeCard, ITEM_TYPE_ICONS } from './ItemTypeCard';
export type { ItemTypeCardProps } from './ItemTypeCard';

export { SuggestionButton } from './SuggestionButton';
export type { SuggestionButtonProps } from './SuggestionButton';

export { ItemNameEditor } from './ItemNameEditor';
export type { ItemNameEditorProps } from './ItemNameEditor';

// =============================================================================
// Tags Components (REQ-177)
// =============================================================================
/**
 * Tag management components for item categorization.
 * Used in PreviewSaveStep for displaying and editing auto-generated tags.
 */
export { TagsEditor } from './TagsEditor';
export type { TagsEditorProps } from './TagsEditor';

// =============================================================================
// Content Components
// =============================================================================
/**
 * Content preview and management components.
 * Used in PreviewSaveStep for displaying and reordering content pieces.
 */
export { ContentPieceCard } from './ContentPieceCard';
export type { ContentPieceCardProps } from './ContentPieceCard';

export { SortableContentPieceCard } from './SortableContentPieceCard';
export type { SortableContentPieceCardProps } from './SortableContentPieceCard';

export { ContentPreview, SIZE_CONFIG as CONTENT_PREVIEW_SIZE_CONFIG, TYPE_CONFIG as CONTENT_PREVIEW_TYPE_CONFIG } from './ContentPreview';
export type { ContentPreviewProps, ContentPreviewSize } from './ContentPreview';

// =============================================================================
// Summary Components
// =============================================================================
/**
 * Session summary and print configuration components.
 * Used in SessionSummaryStep for reviewing items and QR code printing.
 */
export { SessionItemCard } from './SessionItemCard';
export type { SessionItemCardProps } from './SessionItemCard';

export { RemoveItemDialog } from './RemoveItemDialog';
export type { RemoveItemDialogProps } from './RemoveItemDialog';

export { PrintOptionsPanel } from './PrintOptionsPanel';
export type { PrintOptionsPanelProps } from './PrintOptionsPanel';

export { QRGenerationProgress } from './QRGenerationProgress';
export type {
  QRGenerationProgressProps,
  QRProgressItem,
  QRProgressItemStatus,
} from './QRGenerationProgress';

// =============================================================================
// PDF Export Components
// =============================================================================
/**
 * PDF export configuration dialog.
 * Allows customizing paper size, labels, and other export options.
 */
export { PDFExportDialog } from './PDFExportDialog';
export type { PDFExportDialogProps } from './PDFExportDialog';

// =============================================================================
// Error Handling Components
// =============================================================================
/**
 * Error state display and recovery components.
 * Handle network errors, permission issues, and session recovery.
 */
export { NetworkErrorIndicator } from './NetworkErrorIndicator';
export type { NetworkErrorIndicatorProps } from './NetworkErrorIndicator';

export { CameraPermissionFallback } from './CameraPermissionFallback';
export type { CameraPermissionFallbackProps } from './CameraPermissionFallback';

export { SessionRecoveryBanner } from './SessionRecoveryBanner';
export type { SessionRecoveryBannerProps } from './SessionRecoveryBanner';

export { TruncatedText } from './TruncatedText';
export type { TruncatedTextProps } from './TruncatedText';

export { EmptySessionDialog } from './EmptySessionDialog';
export type { EmptySessionDialogProps } from './EmptySessionDialog';

export { DuplicateNameWarning } from './DuplicateNameWarning';
export type { DuplicateNameWarningProps } from './DuplicateNameWarning';

// =============================================================================
// Edit Mode Components (REQ-213)
// =============================================================================
/**
 * Components for edit mode functionality.
 * Display read-only item context when editing existing instructions.
 */
export { ItemContextDisplay } from './ItemContextDisplay';
export type { ItemContextDisplayProps } from './ItemContextDisplay';
