/**
 * Shared components for ItemManager
 *
 * @module ItemManager/components/shared
 * @lastModified 2026-01-05 (REQ-091 - Added VisitCountBadge, ReactionSummary, EngagementIndicator)
 */

// Components
export { ViewModeToggle } from './ViewModeToggle';
export { EmptyState } from './EmptyState';
export { InlineEdit } from './InlineEdit';
export { TagChip } from './TagChip';
export { TagsInlineEdit } from './TagsInlineEdit';
export { BottomSheet } from './BottomSheet';
export { TouchButton } from './TouchButton';
export { VisitCountBadge } from './VisitCountBadge';
export { ReactionSummary } from './ReactionSummary';
export { EngagementIndicator } from './EngagementIndicator';

// Types
export type { InlineEditProps, InlineEditState } from './InlineEdit';
export type { TagChipProps } from './TagChip';
export type { TagsInlineEditProps, TagsInlineEditState } from './TagsInlineEdit';
export type { BottomSheetProps } from './BottomSheet';
export type { TouchButtonProps } from './TouchButton';
export type { VisitCountBadgeProps } from './VisitCountBadge';
export type { ReactionSummaryProps } from './ReactionSummary';
export type { EngagementIndicatorProps, EngagementLevel, EngagementThresholds } from './EngagementIndicator';
