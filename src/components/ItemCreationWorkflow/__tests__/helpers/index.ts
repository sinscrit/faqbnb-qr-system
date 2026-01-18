/**
 * Test Helpers Index
 *
 * Barrel export file for all test helper functions and utilities.
 *
 * @module ItemCreationWorkflow/__tests__/helpers
 * @lastModified 2026-01-10 (REQ-174 Accessibility Audit)
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
  getStepHistory,
} from './mockFactories';

// Test utilities
export {
  renderWithProviders,
  createMockWorkflowProps,
  waitForStepTransition,
  waitForLoadingToFinish,
  simulateStepNavigation,
  createMockQRGenerationHook,
  createMockSessionQRGenerationHook,
  navigateToRoomSelection,
  navigateToItemTypeSelection,
  navigateToSpecificItemSelection,
  navigateToPurposeSelection,
  navigateToContentSourceSelection,
  navigateToContentTypeSelection,
  navigateToContentCreation,
  waitForPurposeStep,
  assertTextInDocument,
  assertCurrentStep,
  assertStepNumber,
  TEST_ROOMS,
  TEST_ITEM_TYPES,
  TEST_CONTENT_TYPES,
  PURPOSE_TYPES,
  PURPOSE_LABELS,
  WORKFLOW_STEPS_ORDER,
  STEP_DISPLAY_LABELS,
} from './testUtils';

// Accessibility test utilities
export {
  checkA11y,
  getA11yViolations,
  verifyAriaAttributes,
  hasAriaRole,
  verifyAriaDescribedBy,
  simulateKeyboardNavigation,
  getTabOrder,
  hasFocusIndicator,
  verifyAllFocusIndicators,
  getLiveRegionContents,
  waitForAnnouncement,
  verifyHeadingHierarchy,
  hasVisibleText,
  type AxeConfig,
  type KeyboardNavigationResult,
} from './a11yTestUtils';
