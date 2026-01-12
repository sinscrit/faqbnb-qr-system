/**
 * ItemCreationWorkflow Step Components - Barrel Export
 *
 * This module exports all step components for the Item Creation Workflow.
 * Steps are rendered by the main ItemCreationWorkflow component based on
 * the current workflow state.
 *
 * ## Step Flow (Updated REQ-201)
 *
 * ### User-Visible Steps (1-8, shown in progress indicator)
 * ```
 * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
 * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
 * 3. SpecificItemStep       - Select/name specific item with suggestions
 * 4. PurposeStep            - Select content purpose (how-to-use, troubleshooting, etc.)
 * 5. ContentTypeStep        - Select unified content option (5 choices)
 * 6. MediaCaptureStep       - Route to appropriate capture UI
 * 7. ContentCreationStep    - Create/upload content (legacy - use MediaCaptureStep)
 * 8. PreviewSaveStep        - Preview and save the item (FINAL numbered step)
 * ```
 *
 * ### Post-Workflow Screens (no step counter)
 * ```
 * - WhatsNextStep           - 4-option decision menu (REQ-201, replaces NextActionStep)
 * - NextActionStep          - DEPRECATED, kept for compatibility
 * - SessionSummaryStep      - Review all items and print QR codes
 * ```
 *
 * NOTE: ContentSourceStep removed per REQ-162 - content options consolidated
 *       into ContentTypeStep. Component file retained for reference only.
 *
 * ## Skip Conditions
 * - ItemTypeStep skips if "General" room selected
 *
 * @example Importing step components (for testing/custom workflows)
 * ```tsx
 * import {
 *   RoomSelectionStep,
 *   SessionSummaryStep,
 *   WhatsNextStep,
 * } from '@/components/ItemCreationWorkflow/components/steps';
 * ```
 *
 * @module ItemCreationWorkflow/components/steps
 * @see useWorkflowState for navigation logic
 * @see README.md for complete workflow documentation
 * @lastModified 2026-01-12 (REQ-201 WhatsNextStep integration)
 */

// =============================================================================
// Selection Steps (Steps 1-3)
// =============================================================================
/**
 * Initial selection steps for room, item type, and specific item.
 * These steps narrow down what item the user is creating.
 */
export { RoomSelectionStep } from './RoomSelectionStep';
export type { RoomSelectionStepProps } from './RoomSelectionStep';

export { ItemTypeStep } from './ItemTypeStep';
export type { ItemTypeStepProps } from './ItemTypeStep';

export { SpecificItemStep } from './SpecificItemStep';
export type { SpecificItemStepProps } from './SpecificItemStep';

// =============================================================================
// Purpose Selection Step (Step 4 - NEW)
// =============================================================================
/**
 * Purpose selection for item content.
 * Determines the intent of the content being created.
 */
export { PurposeStep } from './PurposeStep';
export type { PurposeStepProps } from './PurposeStep';

// =============================================================================
// Content Selection Step (Step 5)
// =============================================================================
/**
 * Content type selection step.
 * Determines what type of content user will create/upload.
 * Note: ContentSourceStep removed in REQ-160 - component file retained for potential reuse
 */
export { ContentTypeStep } from './ContentTypeStep';
export type { ContentTypeStepProps } from './ContentTypeStep';

// =============================================================================
// Media Capture Step (Step 6 - NEW)
// =============================================================================
/**
 * Media capture routing step.
 * Routes to appropriate adapter based on content type and source.
 * NEW in REQ-176 to provide direct routing to capture components.
 */
export { default as MediaCaptureStep } from './MediaCaptureStep';
export type { MediaCaptureStepProps } from './MediaCaptureStep';

// =============================================================================
// Content Creation Steps (Steps 7-8)
// =============================================================================
/**
 * Content creation and preview steps.
 * ContentCreationStep DEPRECATED - use MediaCaptureStep instead (kept for compatibility).
 */
export { ContentCreationStep } from './ContentCreationStep';
export type { ContentCreationStepProps } from './ContentCreationStep';

export { PreviewSaveStep } from './PreviewSaveStep';
export type { PreviewSaveStepProps } from './PreviewSaveStep';

// =============================================================================
// Session Flow Steps (Step 8)
// =============================================================================
/**
 * Decision point for what to do next after saving an item.
 * Options: add more content, create new item, or finish session.
 * @deprecated Use WhatsNextStep for the post-workflow menu
 */
export { NextActionStep } from './NextActionStep';
export type { NextActionStepProps } from './NextActionStep';

// =============================================================================
// Post-Workflow Menu (Phase 2 ITEM-03, REQ-201)
// =============================================================================
/**
 * Post-save decision menu with 4 action options.
 * Re-exported from ItemCapture for consistency.
 * Replaces NextActionStep for the post-save flow.
 *
 * Options:
 * 1. Edit Instructions - Navigate to edit the article just created
 * 2. Add New Instructions - Create different instructions for same item
 * 3. Create New Item - Start fresh with a different item
 * 4. Done - Exit the workflow completely
 *
 * @see REQ-201 for requirements
 * @see Plan-109 Phase 2 for implementation context
 */
export { WhatsNextStep, type WhatsNextStepProps } from '@/components/ItemCapture/components/steps/WhatsNextStep';

// =============================================================================
// Summary Steps (Step 9)
// =============================================================================
/**
 * Final step for reviewing session and printing QR codes.
 * Displays all items created and provides print/export options.
 */
export { SessionSummaryStep } from './SessionSummaryStep';
export type { SessionSummaryStepProps } from './SessionSummaryStep';
