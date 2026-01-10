/**
 * ItemCreationWorkflow Step Components - Barrel Export
 *
 * This module exports all step components for the Item Creation Workflow.
 * Steps are rendered by the main ItemCreationWorkflow component based on
 * the current workflow state.
 *
 * ## Step Flow
 * ```
 * 1. RoomSelectionStep      - Select room (kitchen, bedroom, etc.)
 * 2. ItemTypeStep           - Select category (appliance, room-item, general-info)
 * 3. SpecificItemStep       - Select/name specific item with suggestions
 * 4. PurposeStep            - Select content purpose (how-to-use, troubleshooting, etc.)
 * 5. ContentSourceStep      - Choose existing content or create new
 * 6. ContentTypeStep        - Select content type (video, photo, pdf, etc.)
 * 7. ContentCreationStep    - Create/upload content (delegates to ItemCapture)
 * 8. PreviewSaveStep        - Preview and save the item
 * 9. NextActionStep         - Add more content, new item, or finish
 * 10. SessionSummaryStep    - Review all items and print QR codes
 * ```
 *
 * ## Skip Conditions
 * - ItemTypeStep skips if "General" room selected
 * - Some steps may skip based on content source selection
 *
 * @example Importing step components (for testing/custom workflows)
 * ```tsx
 * import {
 *   RoomSelectionStep,
 *   SessionSummaryStep,
 * } from '@/components/ItemCreationWorkflow/components/steps';
 * ```
 *
 * @module ItemCreationWorkflow/components/steps
 * @see useWorkflowState for navigation logic
 * @see README.md for complete workflow documentation
 * @lastModified 2026-01-10 (REQ-157 PurposeStep Component)
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
// Content Selection Steps (Steps 5-6)
// =============================================================================
/**
 * Content source and type selection steps.
 * Determine whether user has content or will create it, and what type.
 */
export { ContentSourceStep } from './ContentSourceStep';
export type { ContentSourceStepProps } from './ContentSourceStep';

export { ContentTypeStep } from './ContentTypeStep';
export type { ContentTypeStepProps } from './ContentTypeStep';

// =============================================================================
// Content Creation Steps (Steps 7-8)
// =============================================================================
/**
 * Content creation and preview steps.
 * ContentCreationStep delegates to ItemCapture for actual capture/upload.
 */
export { ContentCreationStep } from './ContentCreationStep';
export type { ContentCreationStepProps } from './ContentCreationStep';

export { PreviewSaveStep } from './PreviewSaveStep';
export type { PreviewSaveStepProps } from './PreviewSaveStep';

// =============================================================================
// Session Flow Steps (Step 9)
// =============================================================================
/**
 * Decision point for what to do next after saving an item.
 * Options: add more content, create new item, or finish session.
 */
export { NextActionStep } from './NextActionStep';
export type { NextActionStepProps } from './NextActionStep';

// =============================================================================
// Summary Steps (Step 10)
// =============================================================================
/**
 * Final step for reviewing session and printing QR codes.
 * Displays all items created and provides print/export options.
 */
export { SessionSummaryStep } from './SessionSummaryStep';
export type { SessionSummaryStepProps } from './SessionSummaryStep';
