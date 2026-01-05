# REQ-116: Integration Testing for Item Creation Workflow - Detailed Task Breakdown

**Document Created**: 2026-01-05 13:22:00 UTC
**Last Modified**: 2026-01-05 14:42:00 UTC
**Request ID**: REQ-116
**Type**: ENHANCEMENT
**Size**: L (Large)
**Phase**: 8 - Testing & Documentation
**Task ID**: 8.2
**Overview Document**: docs/REQ-116-integration-tests-overview.md
**Status**: COMPLETED

---

## Implementation Summary

All 17 tasks have been implemented. The integration test suite includes:

### Files Created:
- `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` - Mock factory functions
- `src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts` - Test utilities
- `src/components/ItemCreationWorkflow/__tests__/helpers/index.ts` - Barrel exports
- `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx` - Main integration tests (39 tests)
- `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` - ItemCapture integration tests (13 tests)
- `src/components/ItemCreationWorkflow/__tests__/QRGeneration.integration.test.tsx` - QR generation tests (15 tests)

### Configuration Updated:
- `vitest.config.ts` - Added React plugin for proper JSX transformation

### Test Coverage:
- Room Selection Integration (7 tests)
- Item Type Selection Integration (4 tests)
- Specific Item Selection Integration (4 tests)
- Content Source Selection Integration (3 tests)
- Content Type Selection Integration (3 tests)
- Preview & Save Integration (3 tests)
- Next Action Integration (4 tests)
- Session Summary Integration (3 tests)
- Cross-Step Data Persistence (3 tests)
- Error Handling Integration (2 tests)
- Complete Workflow Flow (3 tests)
- ItemCapture Configuration Mapping (5 tests)
- ItemCapture Content Transformation (4 tests)
- ItemCapture Error Handling (4 tests)
- QR Generation Batch Tests (3 tests)
- QR Generation Progress/Success (3 tests)
- QR Generation Error/Retry (4 tests)

---

## 1. Document Purpose

This document provides granular, actionable tasks for implementing integration tests for the Item Creation Workflow component. Each task is designed to be ≤1 story point (a few hours of focused work) and follows the established patterns from ItemCapture integration tests.

---

## 2. Authorized Files and Functions for Modification

### 2.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx` | Main integration test file |
| `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` | ItemCapture integration tests |
| `src/components/ItemCreationWorkflow/__tests__/QRGeneration.integration.test.tsx` | QR code generation integration tests |
| `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` | Shared test mock factories |
| `src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts` | Shared test utility functions |

### 2.2 Configuration Files (May Update)

| File Path | Potential Modification |
|-----------|----------------------|
| `vitest.config.ts` | Ensure coverage includes integration test files |
| `vitest.setup.ts` | Add integration test specific setup if needed |

---

## 3. Task Breakdown

### Task 1: Create Test Helper Mock Factories
**File**: `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts`
**Story Points**: 0.5
**Dependencies**: None

#### 1.1 Implementation Steps

1. **Create the helpers directory structure**
   - Create `src/components/ItemCreationWorkflow/__tests__/helpers/` directory
   - Create `mockFactories.ts` file with proper module documentation header

2. **Implement createMockSessionItem factory**
   ```typescript
   export const createMockSessionItem = (overrides?: Partial<SessionItem>): SessionItem => ({
     id: crypto.randomUUID(),
     name: 'Test Item',
     room: 'kitchen',
     itemType: 'appliance',
     content: [],
     createdAt: new Date(),
     qrCodeUrl: undefined,
     ...overrides,
   });
   ```

3. **Implement createMockContentPiece factory**
   - Accept `type` parameter for content type variation
   - Support all ContentType values: 'video', 'photo', 'pdf', 'text', 'url'
   - Generate appropriate ContentData based on type

4. **Implement createMockWorkflowSession factory**
   - Include id, startedAt, currentStep, items, currentItem fields
   - Support overrides for all fields

5. **Implement createMockWorkflowState factory**
   - Include full WorkflowState structure
   - Use createMockWorkflowSession for session field
   - Support overrides for navigation, UI, and error state

6. **Implement createMockItemRecord factory**
   - Accept type parameter: 'video' | 'image' | 'pdf'
   - Return ItemRecord compatible with ItemCapture output
   - Include proper media array with metadata

7. **Implement createMockCurrentItemState factory**
   - All fields from CurrentItemState interface
   - Sensible defaults for room, itemType, content, etc.

8. **Export all factories from barrel file**
   - Create `src/components/ItemCreationWorkflow/__tests__/helpers/index.ts`

#### 1.2 Verification Steps

- [ ] All factory functions are properly typed with TypeScript
- [ ] Factories compile without errors: `npx tsc --noEmit`
- [ ] Factories are exported from index.ts barrel file
- [ ] Each factory produces valid instances of its target type
- [ ] Overrides parameter works correctly for all factories

---

### Task 2: Create Test Utility Functions
**File**: `src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts`
**Story Points**: 0.5
**Dependencies**: Task 1

#### 2.1 Implementation Steps

1. **Create testUtils.ts file**
   - Add proper module documentation header
   - Import necessary testing library dependencies

2. **Implement renderWithProviders utility**
   ```typescript
   export const renderWithProviders = (
     ui: React.ReactElement,
     options?: RenderOptions
   ) => {
     return render(ui, { ...options });
   };
   ```

3. **Implement createMockWorkflowProps utility**
   - Return complete ItemCreationWorkflowProps with jest.fn() mocks
   - Include all callback props with sensible mock implementations
   - Support overrides parameter

4. **Implement waitForStepTransition utility**
   ```typescript
   export const waitForStepTransition = async (
     stepText: string
   ): Promise<void> => {
     await waitFor(() => {
       expect(screen.getByText(stepText)).toBeInTheDocument();
     });
   };
   ```

5. **Implement simulateStepNavigation utility**
   - Accept user event instance and array of actions
   - Execute navigation steps in sequence
   - Wait for transitions between steps

6. **Define test constants**
   ```typescript
   export const TEST_ROOMS = ['kitchen', 'laundry', 'bedroom'] as const;
   export const TEST_ITEM_TYPES = ['appliance', 'room-item', 'general-info'] as const;
   export const TEST_CONTENT_TYPES = ['video', 'photo', 'pdf', 'text', 'url'] as const;
   export const WORKFLOW_STEPS_ORDER: WorkflowStep[] = [
     'room-selection', 'item-type-selection', 'specific-item-selection',
     'content-source-selection', 'content-type-selection', 'content-creation',
     'preview-save', 'next-action', 'session-summary',
   ];
   ```

7. **Update helpers/index.ts to export testUtils**

#### 2.2 Verification Steps

- [ ] All utility functions are properly typed
- [ ] Utilities compile without errors: `npx tsc --noEmit`
- [ ] Utilities are exported from index.ts
- [ ] createMockWorkflowProps returns valid props object
- [ ] waitForStepTransition handles async correctly

---

### Task 3: Create Main Integration Test File - Setup and Room Selection Tests
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 1
**Dependencies**: Tasks 1, 2

#### 3.1 Implementation Steps

1. **Create test file with proper structure**
   - Add module documentation header with lastModified date
   - Import testing libraries: `@testing-library/react`, `@testing-library/user-event`
   - Import mock factories and test utilities
   - Import component under test

2. **Set up mocks for external dependencies**
   ```typescript
   // Mock ItemCapture component
   jest.mock('@/components/ItemCapture', () => ({
     ItemCapture: ({ onComplete, onCancel, config }: ItemCaptureProps) => (
       <div data-testid="mock-item-capture">
         <div data-testid="config">{JSON.stringify(config)}</div>
         <button onClick={() => onComplete(createMockItemRecord('video'))}>
           Complete Capture
         </button>
         <button onClick={onCancel}>Cancel</button>
       </div>
     ),
   }));

   // Mock useQRCodeGeneration hook
   jest.mock('@/hooks/useQRCodeGeneration', () => ({
     useQRCodeGeneration: jest.fn(() => ({
       qrCodes: new Map(),
       isGenerating: false,
       progress: 0,
       error: null,
       failedItems: new Set(),
       generateQRCodes: jest.fn().mockResolvedValue(undefined),
       retryFailedItems: jest.fn().mockResolvedValue(undefined),
       clearQRCache: jest.fn(),
       getStats: jest.fn().mockReturnValue({ total: 0, completed: 0, failed: 0, remaining: 0 }),
     })),
   }));
   ```

3. **Set up beforeEach/afterEach hooks**
   - Clear all mocks before each test
   - Use fake timers if needed

4. **Implement Room Selection Integration test suite**
   ```typescript
   describe('Room Selection Integration', () => {
     it('renders room selection as initial step', async () => {...});
     it('selecting a room updates currentItem.room', async () => {...});
     it('selecting "Other" room shows custom input field', async () => {...});
     it('room selection navigates to item-type-selection step', async () => {...});
     it('selecting "General" room skips item-type-selection', async () => {...});
     it('back navigation from item-type-selection returns to room-selection', async () => {...});
   });
   ```

5. **Implement each test case with proper assertions**
   - Use userEvent for interactions
   - Use waitFor for async assertions
   - Assert both UI changes and state updates

#### 3.2 Verification Steps

- [ ] Test file compiles without errors
- [ ] All room selection tests pass: `npm test -- ItemCreationWorkflow.integration`
- [ ] Tests use proper async/await patterns
- [ ] Mocks are properly cleaned up between tests
- [ ] Coverage includes room selection step component

---

### Task 4: Complete Workflow Flow Tests - Item Type and Specific Item Steps
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 1
**Dependencies**: Task 3

#### 4.1 Implementation Steps

1. **Implement Item Type Selection Integration test suite**
   ```typescript
   describe('Item Type Selection Integration', () => {
     it('displays three item type options', async () => {...});
     it('selecting item type updates currentItem.itemType', async () => {...});
     it('navigates to specific-item-selection after type selected', async () => {...});
     it('back navigation returns to room-selection', async () => {...});
   });
   ```

2. **Implement Specific Item Selection Integration test suite**
   ```typescript
   describe('Specific Item Selection Integration', () => {
     it('displays suggestions based on room and item type', async () => {...});
     it('selecting suggestion updates specificItem and auto-generates name', async () => {...});
     it('custom item name entry works correctly', async () => {...});
     it('item name follows "Room - Item" format', async () => {...});
     it('navigates to content-source-selection after item selected', async () => {...});
   });
   ```

3. **Implement each test with room/itemType prerequisites**
   - Navigate to the step under test first
   - Use helper functions for common navigation paths
   - Verify state transitions

#### 4.2 Verification Steps

- [ ] All item type selection tests pass
- [ ] All specific item selection tests pass
- [ ] Auto-generated item names follow expected format
- [ ] Suggestion matrix integration works correctly
- [ ] Navigation between steps works bidirectionally

---

### Task 5: Complete Workflow Flow Tests - Content Selection Steps
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Task 4

#### 5.1 Implementation Steps

1. **Implement Content Source Selection Integration test suite**
   ```typescript
   describe('Content Source Selection Integration', () => {
     it('displays two content source options', async () => {...});
     it('selecting "I have content" updates contentSource to existing', async () => {...});
     it('selecting "Create now" updates contentSource to create-new', async () => {...});
     it('navigates to content-type-selection after selection', async () => {...});
   });
   ```

2. **Implement Content Type Selection Integration test suite**
   ```typescript
   describe('Content Type Selection Integration', () => {
     it('displays content type options based on source', async () => {...});
     it('selecting content type updates currentItem.contentType', async () => {...});
     it('navigates to content-creation step after selection', async () => {...});
     it.each([
       ['video', ['video']],
       ['photo', ['image']],
       ['pdf', ['pdf']],
     ])('content type %s maps to correct media types', async (type, expected) => {...});
   });
   ```

3. **Test content type filtering based on content source**
   - "I have content": Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
   - "Create now": Record Video, Take Photo, Write Text

#### 5.2 Verification Steps

- [ ] Content source tests pass
- [ ] Content type tests pass
- [ ] Content type options change based on source selection
- [ ] Navigation to content-creation step works

---

### Task 6: Preview Save and Next Action Step Tests
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Task 5

#### 6.1 Implementation Steps

1. **Implement Preview & Save Integration test suite**
   ```typescript
   describe('Preview & Save Integration', () => {
     it('displays content piece preview', async () => {...});
     it('shows item name prominently with edit option', async () => {...});
     it('editing item name updates currentItem.itemName', async () => {...});
     it('save item adds item to session.items', async () => {...});
     it('retake/replace option navigates back to content-creation', async () => {...});
     it('navigates to next-action after save', async () => {...});
   });
   ```

2. **Implement Next Action Integration test suite**
   ```typescript
   describe('Next Action Integration', () => {
     it('displays three action options', async () => {...});
     it('"Add More to Item" navigates to content-source-selection', async () => {...});
     it('"Tag New Item" resets workflow to room-selection', async () => {...});
     it('"I\'m Done" navigates to session-summary', async () => {...});
     it('displays session progress indicator', async () => {...});
   });
   ```

3. **Test multi-item session flow**
   - Create one item
   - Select "Tag New Item"
   - Create second item
   - Select "I'm Done"
   - Verify both items in session summary

#### 6.2 Verification Steps

- [ ] Preview save tests pass
- [ ] Next action tests pass
- [ ] Item save updates session.items correctly
- [ ] Multi-item flow works end-to-end
- [ ] Session progress updates correctly

---

### Task 7: Session Summary Step Tests
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Task 6

#### 7.1 Implementation Steps

1. **Implement Session Summary Integration test suite**
   ```typescript
   describe('Session Summary Integration', () => {
     it('displays new session items list', async () => {...});
     it('shows collapsible section for existing items', async () => {...});
     it('edit option on item navigates back for editing', async () => {...});
     it('remove option removes item from session', async () => {...});
     it('displays print options panel', async () => {...});
     it('onSessionComplete called with correct session data', async () => {...});
   });
   ```

2. **Test session completion flow**
   - Verify CompletedSession structure
   - Test different print action choices
   - Verify cleanup after completion

#### 7.2 Verification Steps

- [ ] Session summary displays all created items
- [ ] Edit and remove functionality works
- [ ] Print options panel renders correctly
- [ ] onSessionComplete callback receives correct data

---

### Task 8: ItemCapture Integration Tests - Configuration Mapping
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Tasks 1, 2

#### 8.1 Implementation Steps

1. **Create ItemCapture.integration.test.tsx file**
   - Add module documentation header
   - Import testing libraries and helpers
   - Set up appropriate mocks

2. **Implement Configuration Mapping test suite**
   ```typescript
   describe('ItemCapture Configuration', () => {
     it.each([
       ['video', { allowedMediaTypes: ['video'] }],
       ['photo', { allowedMediaTypes: ['image'] }],
       ['pdf', { allowedMediaTypes: ['pdf'] }],
       ['text', { allowedMediaTypes: [] }],
       ['url', { allowedMediaTypes: [] }],
     ])('maps %s contentType to correct config', async (contentType, expectedConfig) => {
       // Navigate to content-creation step with contentType set
       // Verify ItemCapture receives correct config
     });

     it('passes maxVideoDuration config', async () => {...});
     it('passes maxFileSize config', async () => {...});
   });
   ```

3. **Test config based on content source**
   - "existing" vs "create-new" configuration differences

#### 8.2 Verification Steps

- [ ] Test file compiles without errors
- [ ] All configuration mapping tests pass
- [ ] Config values match expected for each content type
- [ ] Config is properly passed to ItemCapture component

---

### Task 9: ItemCapture Integration Tests - Content Transformation
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Task 8

#### 9.1 Implementation Steps

1. **Implement Content Transformation test suite**
   ```typescript
   describe('Content Transformation', () => {
     it('transforms video ItemRecord to ContentPiece correctly', async () => {
       const mockRecord = createMockItemRecord('video');
       // Trigger onComplete with mockRecord
       // Assert onAddContent called with correct ContentPiece
       // Verify video data extracted: file, duration
     });

     it('transforms photo ItemRecord to ContentPiece correctly', async () => {...});
     it('transforms PDF ItemRecord to ContentPiece correctly', async () => {...});
     it('transforms text content correctly', async () => {...});
     it('transforms URL content with metadata correctly', async () => {...});
     it('extracts thumbnail when available', async () => {...});
   });
   ```

2. **Test onComplete flow**
   - Verify onAddContent is called with transformed piece
   - Verify onNext is called after content added

3. **Test onCancel flow**
   - Verify cancel navigates back
   - Verify no partial data saved on cancel

#### 9.2 Verification Steps

- [ ] All transformation tests pass
- [ ] ContentPiece structure matches type definition
- [ ] Media data extracted correctly for each type
- [ ] onComplete and onCancel flows work correctly

---

### Task 10: ItemCapture Integration Tests - Error Handling
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Task 9

#### 10.1 Implementation Steps

1. **Implement Error Handling test suite**
   ```typescript
   describe('ItemCapture Error Handling', () => {
     it('handles missing media type in ItemRecord gracefully', async () => {
       const invalidRecord = { ...createMockItemRecord('video'), media: [] };
       // Trigger onComplete with invalid record
       // Assert error is caught, not propagated
       // Verify workflow remains functional
     });

     it('handles transformation error without corrupting state', async () => {...});
     it('logs error to console on transformation failure', async () => {...});
     it('allows retry after error', async () => {...});
   });
   ```

2. **Test error recovery paths**
   - Verify user can retry capture after error
   - Verify workflow state is not corrupted by errors

#### 10.2 Verification Steps

- [ ] Error handling tests pass
- [ ] Errors are caught and logged
- [ ] Workflow remains stable after errors
- [ ] User can retry after failure

---

### Task 11: QR Generation Integration Tests - Batch Generation
**File**: `src/components/ItemCreationWorkflow/__tests__/QRGeneration.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Tasks 1, 2

#### 11.1 Implementation Steps

1. **Create QRGeneration.integration.test.tsx file**
   - Add module documentation header
   - Import testing libraries and helpers
   - Set up mocks for useQRCodeGeneration hook

2. **Implement controllable mock for useQRCodeGeneration**
   ```typescript
   const createMockQRGenerationHook = (overrides = {}) => ({
     qrCodes: new Map(),
     isGenerating: false,
     progress: 0,
     error: null,
     failedItems: new Set(),
     generateQRCodes: jest.fn().mockResolvedValue(undefined),
     retryFailedItems: jest.fn().mockResolvedValue(undefined),
     clearQRCache: jest.fn(),
     getStats: jest.fn().mockReturnValue({ total: 0, completed: 0, failed: 0, remaining: 0 }),
     ...overrides,
   });
   ```

3. **Implement Batch QR Generation test suite**
   ```typescript
   describe('Batch QR Generation', () => {
     it('generates QR codes when entering session-summary', async () => {
       // Create items, navigate to session-summary
       // Assert generateForItems called with session items
     });

     it('skips items that already have qrCodeUrl', async () => {
       const items = [
         createMockSessionItem({ id: 'item-1', qrCodeUrl: 'existing-url' }),
         createMockSessionItem({ id: 'item-2' }),
       ];
       // Assert only item-2 passed to generateForItems
     });

     it('passes correct items to generateForItems', async () => {...});
   });
   ```

#### 11.2 Verification Steps

- [ ] Test file compiles without errors
- [ ] Batch generation tests pass
- [ ] Items with existing QR codes are skipped
- [ ] generateForItems receives correct item list

---

### Task 12: QR Generation Integration Tests - Progress and Success
**File**: `src/components/ItemCreationWorkflow/__tests__/QRGeneration.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Task 11

#### 12.1 Implementation Steps

1. **Implement QR Generation Progress test suite**
   ```typescript
   describe('QR Generation Progress', () => {
     it('displays progress percentage during generation', async () => {
       const mockHook = createMockQRGenerationHook({
         isGenerating: true,
         progress: 50,
       });
       // Assert progress UI displays 50%
     });

     it('updates itemStatuses during generation', async () => {...});
     it('shows QRGenerationProgress component', async () => {...});
   });
   ```

2. **Implement QR Generation Success test suite**
   ```typescript
   describe('QR Generation Success', () => {
     it('updates session items with qrCodeUrl after generation', async () => {
       const mockHook = createMockQRGenerationHook({
         qrCodes: new Map([['item-1', 'data:image/png;base64,...']]),
       });
       // Assert UPDATE_ITEMS_QR_CODES action dispatched
       // Assert session items have qrCodeUrl set
     });

     it('qrCodes map is populated correctly', async () => {...});
   });
   ```

#### 12.2 Verification Steps

- [ ] Progress display tests pass
- [ ] QR codes are assigned to session items
- [ ] State updates correctly after generation completes

---

### Task 13: QR Generation Integration Tests - Error and Retry
**File**: `src/components/ItemCreationWorkflow/__tests__/QRGeneration.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Task 12

#### 13.1 Implementation Steps

1. **Implement QR Generation Failure test suite**
   ```typescript
   describe('QR Generation Failure', () => {
     it('displays error message when generation fails', async () => {
       const mockHook = createMockQRGenerationHook({
         error: 'Network error occurred',
         failedItems: new Set(['item-1']),
       });
       // Assert error message displayed
     });

     it('shows retry button for failed items', async () => {...});
     it('failedItemIds set is populated correctly', async () => {...});
   });
   ```

2. **Implement Error Recovery test suite**
   ```typescript
   describe('Error Recovery', () => {
     it('retry button calls retryFailed with failed items', async () => {
       // Click retry button
       // Assert retryFailed called with correct items
     });

     it('retries only failed items, not completed ones', async () => {...});
     it('cancel button aborts generation', async () => {...});
   });
   ```

#### 13.2 Verification Steps

- [ ] Failure handling tests pass
- [ ] Retry functionality works correctly
- [ ] Cancel aborts generation
- [ ] Error UI displays appropriately

---

### Task 14: Cross-Step Data Persistence Tests
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Tasks 3-7

#### 14.1 Implementation Steps

1. **Add to existing ItemCreationWorkflow.integration.test.tsx**

2. **Implement State Persistence test suite**
   ```typescript
   describe('Cross-Step Data Persistence', () => {
     it('room selection persists through all subsequent steps', async () => {
       // Select room, navigate through steps, verify room value preserved
     });

     it('itemType selection persists through content steps', async () => {...});
     it('specificItem and itemName persist to preview', async () => {...});
     it('content pieces persist through preview and save', async () => {...});
   });
   ```

3. **Implement Session Persistence (localStorage) test suite**
   ```typescript
   describe('Session Persistence', () => {
     const mockLocalStorage = (() => {
       let store: Record<string, string> = {};
       return {
         getItem: (key: string) => store[key] ?? null,
         setItem: (key: string, value: string) => { store[key] = value; },
         removeItem: (key: string) => { delete store[key]; },
         clear: () => { store = {}; },
       };
     })();

     beforeEach(() => {
       Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
       mockLocalStorage.clear();
     });

     it('session auto-saves on state changes', async () => {...});
     it('session recovery works on component remount', async () => {...});
     it('cleanup removes session on completion', async () => {...});
   });
   ```

#### 14.2 Verification Steps

- [ ] Data persistence tests pass
- [ ] State values preserved across step transitions
- [ ] localStorage integration works correctly
- [ ] Session recovery restores complete state

---

### Task 15: Error Handling Integration Tests
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: Tasks 3-7

#### 15.1 Implementation Steps

1. **Add to existing ItemCreationWorkflow.integration.test.tsx**

2. **Implement Component Error Propagation test suite**
   ```typescript
   describe('Error Handling Integration', () => {
     it('ItemCapture error does not corrupt workflow state', async () => {
       // Mock ItemCapture to throw error
       // Verify workflow state remains valid
       // Verify user can continue
     });

     it('QR generation error does not prevent session completion', async () => {
       // Mock QR generation failure
       // Verify user can still complete session
     });

     it('network errors display appropriate UI feedback', async () => {...});
   });
   ```

3. **Implement Recovery Paths test suite**
   ```typescript
   describe('Recovery Paths', () => {
     it('user can retry failed operations', async () => {...});
     it('user can skip failed optional operations', async () => {...});
     it('workflow remains functional after errors', async () => {...});
   });
   ```

#### 15.2 Verification Steps

- [ ] Error handling tests pass
- [ ] Errors don't corrupt workflow state
- [ ] User can recover from errors
- [ ] Session completion works despite errors

---

### Task 16: Complete Workflow End-to-End Test
**File**: `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx`
**Story Points**: 0.5
**Dependencies**: All previous tasks

#### 16.1 Implementation Steps

1. **Implement Complete Workflow Flow test suite**
   ```typescript
   describe('Complete Workflow Flow', () => {
     it('completes full workflow from room selection to session summary', async () => {
       const user = userEvent.setup();
       const props = createMockWorkflowProps();
       render(<ItemCreationWorkflow {...props} />);

       // Step 1: Room Selection
       await user.click(screen.getByText('Kitchen'));
       await waitForStepTransition('Item Type');

       // Step 2: Item Type Selection
       await user.click(screen.getByText('Appliance'));
       await waitForStepTransition('Specific Item');

       // Step 3: Specific Item Selection
       await user.click(screen.getByText('Refrigerator'));
       await waitForStepTransition('Content Source');

       // Step 4: Content Source
       await user.click(screen.getByText('Create now'));
       await waitForStepTransition('Content Type');

       // Step 5: Content Type
       await user.click(screen.getByText('Video'));
       await waitForStepTransition('mock-item-capture');

       // Step 6: Content Creation (mock)
       await user.click(screen.getByText('Complete Capture'));
       await waitForStepTransition('Preview');

       // Step 7: Preview & Save
       await user.click(screen.getByText('Save Item'));
       await waitForStepTransition('Next Action');

       // Step 8: Next Action
       await user.click(screen.getByText("I'm Done"));
       await waitForStepTransition('Session Summary');

       // Verify final state
       expect(props.onSessionComplete).not.toHaveBeenCalled(); // Not yet
       // Click complete/done button
       await user.click(screen.getByText('Complete Session'));
       expect(props.onSessionComplete).toHaveBeenCalled();
     });

     it('handles multi-item session correctly', async () => {...});
     it('handles back navigation at each step correctly', async () => {...});
   });
   ```

#### 16.2 Verification Steps

- [ ] End-to-end workflow test passes
- [ ] All step transitions work correctly
- [ ] Session completion callback receives correct data
- [ ] Multi-item flow works correctly
- [ ] Back navigation works at each step

---

### Task 17: Verify Test Coverage and CI Integration
**Story Points**: 0.5
**Dependencies**: All previous tasks

#### 17.1 Implementation Steps

1. **Run full test suite and verify coverage**
   ```bash
   npm test -- --coverage
   ```

2. **Review coverage report**
   - Verify integration-tested flows exceed 80% coverage
   - Identify any gaps in test coverage

3. **Run flakiness check**
   ```bash
   for i in {1..10}; do npm test -- ItemCreationWorkflow; done
   ```

4. **Verify test execution time**
   - Ensure total test time is under 60 seconds

5. **Update vitest.config.ts if needed**
   - Ensure integration test files are included in coverage
   - Add any necessary configuration for CI

6. **Document any findings or adjustments needed**

#### 17.2 Verification Steps

- [ ] All integration tests pass
- [ ] Code coverage exceeds 80% for tested flows
- [ ] Tests execute in under 60 seconds
- [ ] No flaky tests after 10 consecutive runs
- [ ] Tests run successfully in CI environment (if available)
- [ ] All acceptance criteria from REQ-116 validated by tests

---

## 4. Acceptance Criteria Verification Matrix

| Acceptance Criteria | Test Coverage |
|---------------------|---------------|
| Complete workflow flow tests verify users can progress from initial step through final save | Task 16: Complete Workflow End-to-End Test |
| ItemCapture integration tests confirm media capture, preview, and editing features work | Tasks 8-10: ItemCapture Integration Tests |
| QR code generation integration tests verify codes are created and handle failures | Tasks 11-13: QR Generation Integration Tests |
| Cross-step data persistence tests confirm information persists across steps | Task 14: Cross-Step Data Persistence Tests |
| Session recovery tests validate pausing and resuming maintains state integrity | Task 14: Session Persistence (localStorage) suite |
| Error handling tests demonstrate failures provide feedback without corruption | Task 15: Error Handling Integration Tests |
| All integration tests run successfully in CI environment | Task 17: CI Integration verification |

---

## 5. Dependencies Summary

```
Task 1 (Mock Factories)
    └─► Task 2 (Test Utils)
            └─► Task 3 (Room Selection Tests)
                    └─► Task 4 (Item Type/Specific Tests)
                            └─► Task 5 (Content Selection Tests)
                                    └─► Task 6 (Preview/Next Action Tests)
                                            └─► Task 7 (Session Summary Tests)
                                                    └─► Task 16 (E2E Test)

Task 1 ─► Task 8 (ItemCapture Config) ─► Task 9 (Transformation) ─► Task 10 (Errors)

Task 1 ─► Task 11 (QR Batch) ─► Task 12 (Progress/Success) ─► Task 13 (Error/Retry)

Tasks 3-7 ─► Task 14 (Data Persistence)
Tasks 3-7 ─► Task 15 (Error Handling)

All Tasks ─► Task 17 (Coverage/CI)
```

---

## 6. Estimated Total Effort

| Task | Story Points |
|------|--------------|
| Task 1: Mock Factories | 0.5 |
| Task 2: Test Utilities | 0.5 |
| Task 3: Room Selection Tests | 1.0 |
| Task 4: Item Type/Specific Item Tests | 1.0 |
| Task 5: Content Selection Tests | 0.5 |
| Task 6: Preview/Next Action Tests | 0.5 |
| Task 7: Session Summary Tests | 0.5 |
| Task 8: ItemCapture Config Tests | 0.5 |
| Task 9: ItemCapture Transformation Tests | 0.5 |
| Task 10: ItemCapture Error Tests | 0.5 |
| Task 11: QR Batch Generation Tests | 0.5 |
| Task 12: QR Progress/Success Tests | 0.5 |
| Task 13: QR Error/Retry Tests | 0.5 |
| Task 14: Cross-Step Persistence Tests | 0.5 |
| Task 15: Error Handling Tests | 0.5 |
| Task 16: End-to-End Test | 0.5 |
| Task 17: Coverage/CI Verification | 0.5 |
| **Total** | **9.0 story points** |

---

## 7. References

- **Overview Document**: `docs/REQ-116-integration-tests-overview.md`
- **Implementation Plan**: `docs/prd/Plan-093-Item-Creation-Workflow.md`
- **Request Definition**: `docs/gen_requests.md` - REQ-116
- **Existing Integration Test Pattern**: `src/components/ItemCapture/__tests__/VideoCaptureStep.integration.test.tsx`
- **Component Types**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Workflow State Hook**: `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **QR Generation Hook**: `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`
- **Vitest Config**: `vitest.config.ts`

---

*Document generated: 2026-01-05 13:22:00 UTC*
