/**
 * Test Helpers Index
 *
 * Barrel export file for all test helper functions and utilities.
 *
 * @module ItemCreationWorkflow/__tests__/helpers
 * @lastModified 2026-01-10 (REQ-171 Update Tests)
 */

// Mock factories
export {
  createMockSessionItem,
  createMockContentData,
  createMockContentPiece,
  createMockWorkflowSession,
  createMockCurrentItemState,
  createMockCurrentItemWithPurpose,
  createMockContentPreviewProps,
  createMockWorkflowState,
  createMockMediaMetadata,
  createMockMediaItem,
  createMockItemRecord,
  createMockSessionItems,
  createMockSessionItemWithContent,
  createMockWorkflowStateAtStep,
} from './mockFactories';

// Test utilities
export {
  renderWithProviders,
  createMockWorkflowProps,
  waitForStepTransition,
  simulateStepNavigation,
  createMockQRGenerationHook,
  createMockSessionQRGenerationHook,
  TEST_ROOMS,
  TEST_ITEM_TYPES,
  TEST_CONTENT_TYPES,
  PURPOSE_TYPES,
  PURPOSE_LABELS,
  WORKFLOW_STEPS_ORDER,
  STEP_DISPLAY_LABELS,
} from './testUtils';
