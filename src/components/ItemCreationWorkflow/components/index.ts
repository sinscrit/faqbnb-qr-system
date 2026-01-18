/**
 * ItemCreationWorkflow Components - Barrel Export
 *
 * This module exports all components for the ItemCreationWorkflow.
 *
 * - **Steps**: Step components for each workflow phase (9 total)
 * - **Shared**: Reusable UI components used across steps
 *
 * For most use cases, import from the main module instead:
 * ```tsx
 * import { ItemCreationWorkflow } from '@/components/ItemCreationWorkflow';
 * ```
 *
 * @example Importing specific components
 * ```tsx
 * import {
 *   RoomSelectionStep,
 *   SessionSummaryStep,
 *   WorkflowHeader,
 *   SessionItemCard,
 * } from '@/components/ItemCreationWorkflow/components';
 * ```
 *
 * @module ItemCreationWorkflow/components
 * @see steps/index.ts for step components
 * @see shared/index.ts for shared components
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

// =============================================================================
// Step Components
// =============================================================================
/**
 * Workflow step components (RoomSelectionStep through SessionSummaryStep)
 */
export * from './steps';

// =============================================================================
// Shared Components
// =============================================================================
/**
 * Reusable UI components (WorkflowHeader, RoomCard, SessionItemCard, etc.)
 */
export * from './shared';
