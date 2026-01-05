/**
 * Mock Factories for ItemCreationWorkflow Integration Tests
 *
 * Provides factory functions to create mock instances of all workflow types
 * for consistent and maintainable test data generation.
 *
 * @module ItemCreationWorkflow/__tests__/helpers/mockFactories
 * @lastModified 2026-01-05 (REQ-116 Integration Tests)
 */

import type {
  SessionItem,
  ContentPiece,
  ContentData,
  ContentType,
  WorkflowSession,
  WorkflowState,
  CurrentItemState,
  RoomType,
  ItemType,
  WorkflowStep,
} from '../../ItemCreationWorkflow.types';

import type { ItemRecord, MediaItem, MediaMetadata } from '@/components/ItemCapture/ItemCapture.types';

// =============================================================================
// SessionItem Factory
// =============================================================================

/**
 * Creates a mock SessionItem with sensible defaults.
 * All properties can be overridden via the overrides parameter.
 *
 * @param overrides - Partial SessionItem to override defaults
 * @returns A complete SessionItem instance
 */
export const createMockSessionItem = (
  overrides?: Partial<SessionItem>
): SessionItem => ({
  id: crypto.randomUUID(),
  name: 'Test Item',
  room: 'kitchen',
  itemType: 'appliance',
  content: [],
  createdAt: new Date(),
  qrCodeUrl: undefined,
  ...overrides,
});

// =============================================================================
// ContentPiece Factory
// =============================================================================

/**
 * Creates mock ContentData based on content type.
 *
 * @param type - The content type to create data for
 * @returns Type-appropriate ContentData
 */
export const createMockContentData = (type: ContentType): ContentData => {
  switch (type) {
    case 'video':
      return {
        type: 'video',
        file: new Blob(['mock video content'], { type: 'video/mp4' }),
        duration: 30,
      };
    case 'photo':
      return {
        type: 'photo',
        file: new Blob(['mock photo content'], { type: 'image/jpeg' }),
      };
    case 'pdf':
      return {
        type: 'pdf',
        file: new Blob(['mock pdf content'], { type: 'application/pdf' }),
        pageCount: 3,
      };
    case 'text':
      return {
        type: 'text',
        text: 'Mock text instructions for the item.',
      };
    case 'url':
      return {
        type: 'url',
        url: 'https://example.com/instructions',
        title: 'Example Instructions',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        faviconUrl: 'https://example.com/favicon.ico',
      };
    default:
      return {
        type: 'text',
        text: 'Default text content',
      };
  }
};

/**
 * Creates a mock ContentPiece with the specified type.
 *
 * @param type - The content type (default: 'video')
 * @param overrides - Partial ContentPiece to override defaults
 * @returns A complete ContentPiece instance
 */
export const createMockContentPiece = (
  type: ContentType = 'video',
  overrides?: Partial<ContentPiece>
): ContentPiece => ({
  id: crypto.randomUUID(),
  type,
  data: createMockContentData(type),
  order: 0,
  thumbnail: undefined,
  ...overrides,
});

// =============================================================================
// WorkflowSession Factory
// =============================================================================

/**
 * Creates a mock WorkflowSession with sensible defaults.
 *
 * @param overrides - Partial WorkflowSession to override defaults
 * @returns A complete WorkflowSession instance
 */
export const createMockWorkflowSession = (
  overrides?: Partial<WorkflowSession>
): WorkflowSession => ({
  id: crypto.randomUUID(),
  startedAt: new Date(),
  currentStep: 'room-selection',
  items: [],
  currentItem: null,
  ...overrides,
});

// =============================================================================
// CurrentItemState Factory
// =============================================================================

/**
 * Creates a mock CurrentItemState with sensible defaults.
 *
 * @param overrides - Partial CurrentItemState to override defaults
 * @returns A complete CurrentItemState instance
 */
export const createMockCurrentItemState = (
  overrides?: Partial<CurrentItemState>
): CurrentItemState => ({
  room: 'kitchen',
  itemType: 'appliance',
  specificItem: 'Refrigerator',
  itemName: 'Kitchen - Refrigerator',
  contentSource: 'existing',
  contentType: null,
  content: [],
  ...overrides,
});

// =============================================================================
// WorkflowState Factory
// =============================================================================

/**
 * Creates a mock WorkflowState with sensible defaults.
 * Uses createMockWorkflowSession for the session field.
 *
 * @param overrides - Partial WorkflowState to override defaults
 * @returns A complete WorkflowState instance
 */
export const createMockWorkflowState = (
  overrides?: Partial<WorkflowState>
): WorkflowState => {
  const session = overrides?.session ?? createMockWorkflowSession();
  const currentStep = overrides?.currentStep ?? session.currentStep;

  return {
    currentStep,
    stepHistory: [],
    canGoBack: false,
    session,
    currentItem: null,
    isSubmitting: false,
    isDirty: false,
    errors: {},
    submitError: null,
    ...overrides,
  };
};

// =============================================================================
// ItemRecord Factory (for ItemCapture integration)
// =============================================================================

/**
 * Creates mock MediaMetadata for ItemCapture media items.
 *
 * @param type - The media type
 * @param overrides - Partial MediaMetadata to override defaults
 * @returns MediaMetadata instance
 */
export const createMockMediaMetadata = (
  type: 'video' | 'image' | 'pdf',
  overrides?: Partial<MediaMetadata>
): MediaMetadata => {
  const baseMetadata: MediaMetadata = {
    mimeType: type === 'video' ? 'video/mp4' : type === 'image' ? 'image/jpeg' : 'application/pdf',
    fileSize: 1024 * 1024, // 1MB
    source: 'capture',
  };

  if (type === 'video') {
    baseMetadata.duration = 30;
    baseMetadata.dimensions = { width: 1920, height: 1080 };
  } else if (type === 'image') {
    baseMetadata.dimensions = { width: 1920, height: 1080 };
  } else if (type === 'pdf') {
    baseMetadata.pageCount = 3;
  }

  return {
    ...baseMetadata,
    ...overrides,
  };
};

/**
 * Creates a mock MediaItem for ItemCapture output.
 *
 * @param type - The media type ('video', 'image', 'pdf')
 * @param overrides - Partial MediaItem to override defaults
 * @returns MediaItem instance
 */
export const createMockMediaItem = (
  type: 'video' | 'image' | 'pdf' = 'video',
  overrides?: Partial<MediaItem>
): MediaItem => ({
  id: crypto.randomUUID(),
  type,
  file: new Blob(['mock content'], {
    type: type === 'video' ? 'video/mp4' : type === 'image' ? 'image/jpeg' : 'application/pdf',
  }),
  thumbnail: new Blob(['mock thumbnail'], { type: 'image/jpeg' }),
  order: 0,
  metadata: createMockMediaMetadata(type),
  ...overrides,
});

/**
 * Creates a mock ItemRecord matching ItemCapture output structure.
 *
 * @param type - The primary media type ('video', 'image', 'pdf')
 * @param overrides - Partial ItemRecord to override defaults
 * @returns ItemRecord instance compatible with ItemCapture output
 */
export const createMockItemRecord = (
  type: 'video' | 'image' | 'pdf' = 'video',
  overrides?: Partial<ItemRecord>
): ItemRecord => ({
  id: crypto.randomUUID(),
  title: 'Test Item',
  location: 'Kitchen',
  tags: ['appliance', 'important'],
  applianceType: 'refrigerator',
  contentType: type === 'video' ? 'media' : type === 'image' ? 'media' : 'pdf-only',
  media: [createMockMediaItem(type)],
  instructions: '',
  createdAt: new Date(),
  ...overrides,
});

// =============================================================================
// Utility Factories
// =============================================================================

/**
 * Creates multiple mock SessionItems at once.
 *
 * @param count - Number of items to create
 * @param baseOverrides - Overrides to apply to all items
 * @returns Array of SessionItems
 */
export const createMockSessionItems = (
  count: number,
  baseOverrides?: Partial<SessionItem>
): SessionItem[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockSessionItem({
      name: `Test Item ${index + 1}`,
      ...baseOverrides,
    })
  );
};

/**
 * Creates a mock SessionItem with content pieces.
 *
 * @param contentTypes - Array of content types to create pieces for
 * @param overrides - Partial SessionItem to override defaults
 * @returns SessionItem with content pieces
 */
export const createMockSessionItemWithContent = (
  contentTypes: ContentType[] = ['video'],
  overrides?: Partial<SessionItem>
): SessionItem => {
  const content = contentTypes.map((type, index) =>
    createMockContentPiece(type, { order: index })
  );

  return createMockSessionItem({
    content,
    ...overrides,
  });
};

/**
 * Creates a mock WorkflowState at a specific step.
 *
 * @param step - The workflow step to position at
 * @param withCurrentItem - Whether to include a currentItem
 * @returns WorkflowState positioned at the specified step
 */
export const createMockWorkflowStateAtStep = (
  step: WorkflowStep,
  withCurrentItem: boolean = false
): WorkflowState => {
  const stepHistory = getStepHistory(step);
  const currentItem = withCurrentItem ? createMockCurrentItemState() : null;

  return createMockWorkflowState({
    currentStep: step,
    stepHistory,
    canGoBack: stepHistory.length > 0,
    currentItem,
    session: createMockWorkflowSession({
      currentStep: step,
      currentItem,
    }),
  });
};

/**
 * Helper to generate step history for a given step.
 */
const getStepHistory = (targetStep: WorkflowStep): WorkflowStep[] => {
  const stepOrder: WorkflowStep[] = [
    'room-selection',
    'item-type-selection',
    'specific-item-selection',
    'content-source-selection',
    'content-type-selection',
    'content-creation',
    'preview-save',
    'next-action',
    'session-summary',
  ];

  const targetIndex = stepOrder.indexOf(targetStep);
  if (targetIndex <= 0) return [];

  return stepOrder.slice(0, targetIndex);
};
