/**
 * E2E Test Utilities for ItemCreationWorkflow
 *
 * Provides shared utilities for end-to-end testing of the complete
 * workflow flow including navigation helpers, render utilities, and
 * assertion helpers.
 *
 * @module ItemCreationWorkflow/__tests__/e2e/test-utils
 * @see docs/REQ-172-end-to-end-flow-testing-detailed.md
 * @lastModified 2026-01-10 (REQ-172 E2E Flow Testing)
 */

import React from 'react';
import { render, screen, waitFor, type RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';
import { ItemCreationWorkflow } from '../../ItemCreationWorkflow';
import type {
  ItemCreationWorkflowProps,
  WorkflowStep,
  PurposeType,
  ContentType,
} from '../../ItemCreationWorkflow.types';
import { createMockWorkflowProps } from '../helpers/testUtils';
import { createMockItemRecord } from '../helpers/mockFactories';
import type { ItemCaptureProps } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// Constants
// =============================================================================

/**
 * New workflow steps order reflecting Plan-094 and REQ-176 changes.
 * - Removed: content-source-selection (Plan-094)
 * - Added: purpose-selection after specific-item-selection (Plan-094)
 * - Added: media-capture after content-type-selection (REQ-176)
 */
export const NEW_WORKFLOW_STEPS_ORDER: WorkflowStep[] = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'purpose-selection',
  'content-type-selection',
  'media-capture',
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
];

/**
 * Step labels for display verification.
 */
export const NEW_STEP_DISPLAY_LABELS: Record<WorkflowStep, string> = {
  'room-selection': 'Select a Room',
  'item-type-selection': 'What type of item is this?',
  'specific-item-selection': 'What specific item',
  'purpose-selection': "What's the purpose of this content",
  'content-type-selection': 'What content would you like to add',
  'media-capture': 'Capture Content',
  'content-creation': 'Content Creation',
  'preview-save': 'Review',
  'next-action': 'What would you like to do next',
  'session-summary': 'Session Summary',
};

/**
 * Purpose type labels for verification.
 */
export const PURPOSE_TYPE_LABELS: Record<PurposeType, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};

/**
 * Content option labels for the unified content selection.
 */
export const CONTENT_OPTION_LABELS = {
  'record-video': 'Record Video',
  'take-photo': 'Take Photo',
  'write-text': 'Write Text',
  'upload-file': 'Upload File',
  'add-link': 'Add Link',
} as const;

// =============================================================================
// Types
// =============================================================================

export interface E2ERenderResult extends RenderResult {
  user: UserEvent;
  props: ItemCreationWorkflowProps;
}

export interface NavigationOptions {
  room?: string;
  itemType?: string;
  specificItem?: string;
  purpose?: PurposeType;
  contentOption?: string;
}

// =============================================================================
// Render Utilities
// =============================================================================

/**
 * Renders the ItemCreationWorkflow with E2E test configuration.
 * Includes user event setup and mock props.
 *
 * @param propOverrides - Partial props to override defaults
 * @returns Render result with user event instance and props
 */
export const renderWorkflowForE2E = (
  propOverrides?: Partial<ItemCreationWorkflowProps>
): E2ERenderResult => {
  const user = userEvent.setup();
  const props = createMockWorkflowProps(propOverrides);
  const result = render(<ItemCreationWorkflow {...props} />);

  return {
    ...result,
    user,
    props,
  };
};

// =============================================================================
// Wait Utilities
// =============================================================================

/**
 * Waits for a step to be displayed by checking for step-specific text.
 *
 * @param stepOrText - Step identifier or text to wait for
 * @param timeout - Maximum time to wait (default: 5000ms)
 */
export const waitForStep = async (
  stepOrText: WorkflowStep | string | RegExp,
  timeout: number = 5000
): Promise<void> => {
  const text = typeof stepOrText === 'string' && stepOrText in NEW_STEP_DISPLAY_LABELS
    ? new RegExp(NEW_STEP_DISPLAY_LABELS[stepOrText as WorkflowStep], 'i')
    : stepOrText;

  await waitFor(
    () => {
      expect(screen.getByText(text)).toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Waits for the purpose selection step to be displayed.
 */
export const waitForPurposeStep = async (timeout: number = 5000): Promise<void> => {
  await waitFor(
    () => {
      expect(screen.getByText(/What's the purpose of this content/i)).toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Waits for content preview to appear in the preview step.
 *
 * @param timeout - Maximum time to wait
 */
export const waitForContentPreview = async (timeout: number = 5000): Promise<void> => {
  await waitFor(
    () => {
      // Look for content preview indicators
      expect(
        screen.queryByTestId('content-preview') ||
        screen.queryByText(/content/i)
      ).toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Waits for the preview-save step with content displayed.
 */
export const waitForPreviewSaveStep = async (timeout: number = 5000): Promise<void> => {
  await waitFor(
    () => {
      expect(screen.getByText(/Review/i)).toBeInTheDocument();
    },
    { timeout }
  );
};

// =============================================================================
// Navigation Helpers
// =============================================================================

/**
 * Clicks the Continue button.
 */
export const clickContinue = async (user: UserEvent): Promise<void> => {
  const continueBtn = screen.getByRole('button', { name: /continue/i });
  await user.click(continueBtn);
};

/**
 * Clicks the Back button.
 */
export const clickBack = async (user: UserEvent): Promise<void> => {
  const backBtn = screen.getByLabelText('Go back to previous step');
  await user.click(backBtn);
};

/**
 * Selects a room. Room selection auto-advances after click, so no need to
 * manually click Continue. Pass shouldContinue=true only for special cases.
 *
 * @param user - UserEvent instance
 * @param roomLabel - Room label to select (default: 'Kitchen')
 * @param shouldContinue - Whether to click Continue after selection (default: false, step auto-advances)
 */
export const selectRoom = async (
  user: UserEvent,
  roomLabel: string = 'Kitchen',
  shouldContinue: boolean = false
): Promise<void> => {
  await user.click(screen.getByText(roomLabel));
  if (shouldContinue) {
    await clickContinue(user);
  }
};

/**
 * Selects an item type. Item type selection auto-advances after click,
 * so no need to manually click Continue.
 *
 * @param user - UserEvent instance
 * @param itemTypeLabel - Item type label to select (default: 'Appliance')
 * @param shouldContinue - Whether to click Continue after selection (default: false, step auto-advances)
 */
export const selectItemType = async (
  user: UserEvent,
  itemTypeLabel: string = 'Appliance',
  shouldContinue: boolean = false
): Promise<void> => {
  await user.click(screen.getByText(itemTypeLabel));
  if (shouldContinue) {
    await clickContinue(user);
  }
};

/**
 * Selects a specific item. Specific item selection auto-advances after click,
 * so no need to manually click Continue.
 *
 * @param user - UserEvent instance
 * @param itemName - Specific item name to select (default: 'Refrigerator')
 * @param shouldContinue - Whether to click Continue after selection (default: false, step auto-advances)
 */
export const selectSpecificItem = async (
  user: UserEvent,
  itemName: string = 'Refrigerator',
  shouldContinue: boolean = false
): Promise<void> => {
  await user.click(screen.getByText(itemName));
  if (shouldContinue) {
    await clickContinue(user);
  }
};

/**
 * Selects a purpose type. Purpose selection auto-advances after click,
 * so no need to manually click Continue.
 *
 * @param user - UserEvent instance
 * @param purpose - Purpose type to select
 * @param shouldContinue - Whether to click Continue after selection (default: false, step auto-advances)
 */
export const selectPurpose = async (
  user: UserEvent,
  purpose: PurposeType = 'how-to-use',
  shouldContinue: boolean = false
): Promise<void> => {
  const purposeLabel = PURPOSE_TYPE_LABELS[purpose];
  await user.click(screen.getByText(purposeLabel));
  if (shouldContinue) {
    await clickContinue(user);
  }
};

/**
 * Selects a content option. Content type selection auto-advances after click,
 * so no need to manually click Continue.
 *
 * @param user - UserEvent instance
 * @param optionLabel - Content option label to select
 * @param shouldContinue - Whether to click Continue after selection (default: false, step auto-advances)
 */
export const selectContentOption = async (
  user: UserEvent,
  optionLabel: string = 'Record Video',
  shouldContinue: boolean = false
): Promise<void> => {
  await user.click(screen.getByText(optionLabel));
  if (shouldContinue) {
    await clickContinue(user);
  }
};

// =============================================================================
// Navigation Path Helpers
// =============================================================================

/**
 * Navigates from initial state to purpose-selection step.
 *
 * @param user - UserEvent instance
 * @param options - Navigation options for room/itemType/specificItem
 */
export const navigateToPurposeStep = async (
  user: UserEvent,
  options: Partial<NavigationOptions> = {}
): Promise<void> => {
  const {
    room = 'Kitchen',
    itemType = 'Appliance',
    specificItem = 'Refrigerator',
  } = options;

  // Room selection
  await selectRoom(user, room);
  await waitFor(() => expect(screen.getByText(/What type of item/i)).toBeInTheDocument());

  // Item type selection
  await selectItemType(user, itemType);
  await waitFor(() => expect(screen.getByText(/What specific item/i)).toBeInTheDocument());

  // Specific item selection
  await selectSpecificItem(user, specificItem);
  await waitForPurposeStep();
};

/**
 * Navigates from initial state to content-type-selection step.
 *
 * @param user - UserEvent instance
 * @param options - Navigation options
 */
export const navigateToContentTypeStep = async (
  user: UserEvent,
  options: Partial<NavigationOptions> = {}
): Promise<void> => {
  const { purpose = 'how-to-use' } = options;

  await navigateToPurposeStep(user, options);

  // Purpose selection
  await selectPurpose(user, purpose);
  await waitFor(() => expect(screen.getByText(/What content would you like to add/i)).toBeInTheDocument());
};

/**
 * Navigates from initial state to content-creation step.
 *
 * @param user - UserEvent instance
 * @param options - Navigation options
 */
export const navigateToContentCreation = async (
  user: UserEvent,
  options: Partial<NavigationOptions> = {}
): Promise<void> => {
  const { contentOption = 'Record Video' } = options;

  await navigateToContentTypeStep(user, options);

  // Content option selection
  await selectContentOption(user, contentOption);
  await waitFor(() => {
    expect(screen.getByTestId('mock-item-capture')).toBeInTheDocument();
  });
};

/**
 * Navigates from initial state to preview-save step with content captured.
 *
 * @param user - UserEvent instance
 * @param options - Navigation options
 */
export const navigateToPreviewSaveStep = async (
  user: UserEvent,
  options: Partial<NavigationOptions> = {}
): Promise<void> => {
  await navigateToContentCreation(user, options);

  // Complete capture
  await user.click(screen.getByTestId('complete-capture-btn'));
  await waitForPreviewSaveStep();
};

/**
 * Navigates through complete workflow to next-action step.
 *
 * @param user - UserEvent instance
 * @param options - Navigation options
 */
export const navigateToNextActionStep = async (
  user: UserEvent,
  options: Partial<NavigationOptions> = {}
): Promise<void> => {
  await navigateToPreviewSaveStep(user, options);

  // Save the item
  const saveBtn = screen.getByRole('button', { name: /save/i });
  await user.click(saveBtn);

  await waitFor(() => {
    expect(screen.getByText(/What would you like to do next/i)).toBeInTheDocument();
  });
};

/**
 * Completes full workflow and navigates to session-summary.
 *
 * @param user - UserEvent instance
 * @param options - Navigation options
 */
export const navigateToSessionSummary = async (
  user: UserEvent,
  options: Partial<NavigationOptions> = {}
): Promise<void> => {
  await navigateToNextActionStep(user, options);

  // Click "I'm Done"
  await user.click(screen.getByText(/I'm Done/i));

  await waitFor(() => {
    expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
  });
};

// =============================================================================
// Mock Utilities
// =============================================================================

/**
 * Creates a mock file for upload testing.
 *
 * @param type - File type ('video', 'image', 'pdf')
 * @param name - File name
 * @returns Mock File object
 */
export const createMockFile = (
  type: 'video' | 'image' | 'pdf' | 'text' = 'video',
  name?: string
): File => {
  const mimeTypes: Record<string, string> = {
    video: 'video/mp4',
    image: 'image/jpeg',
    pdf: 'application/pdf',
    text: 'text/plain',
  };

  const defaultNames: Record<string, string> = {
    video: 'test-video.mp4',
    image: 'test-image.jpg',
    pdf: 'test-document.pdf',
    text: 'test-text.txt',
  };

  const content = `mock ${type} content`;
  const blob = new Blob([content], { type: mimeTypes[type] });
  return new File([blob], name || defaultNames[type], { type: mimeTypes[type] });
};

/**
 * Creates a mock file upload event.
 *
 * @param files - Array of files to include in the event
 * @returns Mock input change event
 */
export const createMockFileUpload = (files: File[]): { target: { files: FileList } } => {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index],
    ...files.reduce((acc, file, index) => ({ ...acc, [index]: file }), {}),
  } as FileList;

  return {
    target: { files: fileList },
  };
};

// =============================================================================
// Assertion Helpers
// =============================================================================

/**
 * Asserts that an auto-generated title is displayed correctly.
 *
 * @param purpose - The purpose type used
 * @param itemName - The item name used
 */
export const assertAutoGeneratedTitle = (
  purpose: PurposeType,
  itemName: string
): void => {
  const purposeLabel = PURPOSE_TYPE_LABELS[purpose];
  const expectedTitle = `${purposeLabel} - ${itemName}`;
  expect(screen.getByDisplayValue(expectedTitle) || screen.getByText(expectedTitle)).toBeInTheDocument();
};

/**
 * Asserts that the current step matches the expected step.
 *
 * @param step - Expected workflow step
 */
export const assertCurrentStep = async (step: WorkflowStep): Promise<void> => {
  const label = NEW_STEP_DISPLAY_LABELS[step];
  await waitFor(() => {
    expect(screen.getByText(new RegExp(label, 'i'))).toBeInTheDocument();
  });
};

/**
 * Asserts that a purpose is displayed in the preview step.
 *
 * @param purpose - The purpose type to check for
 */
export const assertPurposeInPreview = (purpose: PurposeType): void => {
  const label = PURPOSE_TYPE_LABELS[purpose];
  expect(screen.getByText(label)).toBeInTheDocument();
};

/**
 * Asserts that the specified fields are read-only (not editable).
 *
 * @param fieldLabels - Array of field labels to check
 */
export const assertFieldsReadOnly = (fieldLabels: string[]): void => {
  fieldLabels.forEach(label => {
    const element = screen.getByLabelText(label) || screen.getByText(label);
    if (element.tagName === 'INPUT') {
      expect(element).toHaveAttribute('readonly');
    }
  });
};

/**
 * Asserts content count badge displays correct count.
 *
 * @param expectedCount - Expected content piece count
 */
export const assertContentCount = (expectedCount: number): void => {
  const countText = expectedCount === 1 ? '1 content piece' : `${expectedCount} content pieces`;
  expect(
    screen.queryByText(countText) ||
    screen.queryByText(new RegExp(`${expectedCount}`, 'i'))
  ).toBeInTheDocument();
};

// =============================================================================
// Test Data Generators
// =============================================================================

/**
 * Generates test case data for parameterized tests.
 */
export const generateFlowTestCases = (): Array<{
  room: string;
  itemType: string;
  specificItem: string;
  purpose: PurposeType;
  expectedTitle: string;
}> => [
  {
    room: 'Kitchen',
    itemType: 'Appliance',
    specificItem: 'Refrigerator',
    purpose: 'how-to-clean',
    expectedTitle: 'How to Clean - Refrigerator',
  },
  {
    room: 'Laundry Room',
    itemType: 'Appliance',
    specificItem: 'Washer',
    purpose: 'how-to-use',
    expectedTitle: 'How to Use - Washer',
  },
  {
    room: 'Bedroom',
    itemType: 'Room Item',
    specificItem: 'Closet',
    purpose: 'maintenance',
    expectedTitle: 'Maintenance - Closet',
  },
];

/**
 * Generates purpose type test cases.
 */
export const generatePurposeTestCases = (): Array<{
  purpose: PurposeType;
  expectedLabel: string;
}> => [
  { purpose: 'how-to-use', expectedLabel: 'How to Use' },
  { purpose: 'how-to-clean', expectedLabel: 'How to Clean' },
  { purpose: 'troubleshooting', expectedLabel: 'Troubleshooting' },
  { purpose: 'safety-info', expectedLabel: 'Safety Information' },
  { purpose: 'maintenance', expectedLabel: 'Maintenance' },
  { purpose: 'features', expectedLabel: 'Features & Tips' },
  { purpose: 'other', expectedLabel: 'Other' },
];
