/**
 * Test Helpers Index
 *
 * Barrel export file for all test helper functions and utilities.
 *
 * @module ItemCreationWorkflow/__tests__/helpers
 * @lastModified 2026-01-05 (REQ-116 Integration Tests)
 */

// Mock factories
export {
  createMockSessionItem,
  createMockContentData,
  createMockContentPiece,
  createMockWorkflowSession,
  createMockCurrentItemState,
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
  WORKFLOW_STEPS_ORDER,
} from './testUtils';
