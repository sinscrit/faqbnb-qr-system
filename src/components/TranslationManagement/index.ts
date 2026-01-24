/**
 * TranslationManagement Module Exports
 *
 * Barrel export file for the TranslationManagement component family.
 * Provides clean imports for all types and components.
 *
 * @module TranslationManagement
 * @modified 2026-01-24
 */

// Export all types
export * from './TranslationManagement.types';

// =============================================================================
// Components
// =============================================================================
export { TranslationPreviewPanel, SourceContentSection } from './TranslationPreviewPanel';
export type { SourceContentSectionProps } from './TranslationPreviewPanel';
export { TranslationEditor } from './TranslationEditor';
export type { TranslationEditorProps, TranslationFieldContent } from './TranslationEditor';

// =============================================================================
// Widget Components
// =============================================================================
export { TranslationStatusWidget } from './TranslationStatusWidget';
export type { TranslationStatusWidgetProps } from './TranslationStatusWidget';
export { StatusCard } from './TranslationStatusWidget';
export type { StatusCardProps } from './TranslationStatusWidget';

// =============================================================================
// Table/Column Components
// =============================================================================
export { TranslationStatusColumn } from './TranslationStatusColumn';
export type { TranslationStatusColumnProps, LanguageTranslationSummary } from './TranslationStatusColumn';

// =============================================================================
// Filter Components
// =============================================================================
export { TranslationStatusFilter } from './TranslationStatusFilter';
export type { TranslationStatusFilterProps, TranslationFilterStatus } from './TranslationStatusFilter';

// =============================================================================
// Bulk Operations Components (REQ-E05-018)
// =============================================================================
export { BulkTranslationBar } from './BulkTranslationBar';
export type { BulkTranslationBarProps, BulkOperationResult, SupportedLanguage } from './BulkTranslationBar';

// =============================================================================
// Future: Export components (to be implemented in later Epic 5 tasks)
// =============================================================================
// export { TranslationFilterPanel } from './TranslationFilterPanel';
