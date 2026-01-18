# REQ-116: Integration Testing for Item Creation Workflow - Technical Implementation Overview

**Document Date**: 2026-01-05 15:30 UTC
**Request ID**: REQ-116
**Type**: ENHANCEMENT
**Size**: L (Large)
**Phase**: 8 - Testing & Documentation
**Task ID**: 8.2

---

## 1. Executive Summary

This document provides a comprehensive technical breakdown for implementing integration tests for the Item Creation Workflow component. The tests will verify end-to-end functionality across the complete workflow flow, ItemCapture component integration, and QR code generation integration, ensuring all components work together seamlessly within the user journey.

---

## 2. Request Reference

### From `docs/gen_requests.md` - REQ-116

**Summary**: The system shall provide comprehensive integration tests that verify the complete item creation workflow operates correctly end-to-end, including seamless integration between all workflow steps, media capture functionality, and QR code generation.

### Acceptance Criteria

- [ ] Complete workflow flow tests verify users can progress from initial step through final save with all intermediate steps functioning correctly
- [ ] ItemCapture integration tests confirm media capture, preview, and editing features work within the workflow context
- [ ] QR code generation integration tests verify codes are created successfully for items and handle generation failures appropriately
- [ ] Cross-step data persistence tests confirm information entered in one step is correctly available in subsequent steps
- [ ] Session recovery tests validate that pausing and resuming the workflow at any step maintains complete state integrity
- [ ] Error handling tests demonstrate that failures in one component provide appropriate feedback without corrupting the entire workflow
- [ ] All integration tests run successfully in a continuous integration environment

---

## 3. Implementation Plan Reference

**Source**: `docs/prd/Plan-093-Item-Creation-Workflow.md`

### Relevant Sections

- **Phase 8: Testing & Documentation** - Task 8.2: Integration Tests [0.5 days]
  - [ ] Test complete workflow flow
  - [ ] Test ItemCapture integration
  - [ ] Test QR code generation integration

### Component Architecture (from Plan)

```
ItemCreationWorkflow/
├── __tests__/
│   └── ItemCreationWorkflow.test.tsx        # Existing basic tests
├── components/
│   ├── steps/
│   │   ├── RoomSelectionStep.tsx            # Step 1
│   │   ├── ItemTypeStep.tsx                 # Step 2
│   │   ├── SpecificItemStep.tsx             # Step 3
│   │   ├── ContentSourceStep.tsx            # Step 4
│   │   ├── ContentTypeStep.tsx              # Step 5
│   │   ├── ContentCreationStep.tsx          # Step 6 (ItemCapture integration)
│   │   ├── PreviewSaveStep.tsx              # Step 7
│   │   ├── NextActionStep.tsx               # Step 8
│   │   └── SessionSummaryStep.tsx           # Step 9 (QR generation)
│   └── shared/
│       └── ... shared components
└── hooks/
    ├── useWorkflowState.ts                  # Core state machine
    ├── useSessionPersistence.ts             # LocalStorage recovery
    ├── useSessionQRGeneration.ts            # QR code adapter hook
    └── ...
```

---

## 4. Existing Patterns Analysis

### 4.1 Integration Test Patterns in Codebase

**Reference Files**:
- `src/components/ItemCapture/__tests__/VideoCaptureStep.integration.test.tsx`
- `src/components/ItemCapture/components/steps/__tests__/MediaEditorStep.integration.test.tsx`
- `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.test.tsx`

**Key Patterns Identified**:

1. **Mock Setup Pattern**: Use jest.mock() for external dependencies (hooks, dynamic imports)
2. **Helper Factory Functions**: Create mock data with `createMockState()`, `createMockSessionItem()`
3. **Async Flow Testing**: Use `act()`, `waitFor()`, and `userEvent` for user interaction simulation
4. **Grouped Test Suites**: Organize tests by feature area (wizard integration, full capture flow, cancel flow)

### 4.2 State Management Pattern

**From `useWorkflowState.ts`**:
- Uses React useReducer pattern with discriminated union actions
- Actions include navigation, selection, content management, session management
- State includes: currentStep, stepHistory, session, currentItem, errors, isSubmitting

### 4.3 ItemCapture Integration Pattern

**From `ContentCreationStep.tsx`**:
```tsx
<ItemCapture
  config={{
    allowedMediaTypes: mapContentTypeToMediaTypes(contentType),
    maxVideoDuration: 120,
    maxFileSize: 100 * 1024 * 1024,
  }}
  onComplete={(record) => {
    const contentPiece = transformRecordToContentPiece(record, contentType);
    onAddContent(contentPiece);
    onNext();
  }}
  onCancel={() => onCancel()}
/>
```

### 4.4 QR Code Generation Pattern

**From `useSessionQRGeneration.ts`**:
- Adapts SessionItem[] to Item-compatible format
- Filters items that already have qrCodeUrl
- Provides generateForItems(), retryFailed(), cancel() methods
- Exposes progress, error, itemStatuses state

---

## 5. Authorized Files and Functions for Modification

### 5.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/__tests__/ItemCreationWorkflow.integration.test.tsx` | Main integration test file |
| `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` | ItemCapture integration tests |
| `src/components/ItemCreationWorkflow/__tests__/QRGeneration.integration.test.tsx` | QR code generation integration tests |
| `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` | Shared test mock factories |
| `src/components/ItemCreationWorkflow/__tests__/helpers/testUtils.ts` | Shared test utility functions |

### 5.2 Existing Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|------------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main component under test |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State machine logic |
| `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts` | Session persistence logic |
| `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | QR generation adapter |
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | ItemCapture integration |
| `src/components/ItemCapture/index.ts` | ItemCapture exports |
| `src/hooks/useQRCodeGeneration.ts` | Core QR generation hook |

### 5.3 Configuration Files (May Need Update)

| File Path | Potential Modification |
|-----------|----------------------|
| `vitest.config.ts` | Ensure coverage includes integration test files |
| `vitest.setup.ts` | Add integration test specific setup if needed |

---

## 6. Task Breakdown

### Task 6.1: Test Infrastructure Setup [0.5 story points]

**Create test helper files**:
- `mockFactories.ts`: Factory functions for creating test data
- `testUtils.ts`: Utility functions for common test operations

**Mock Factories Required**:
```typescript
// mockFactories.ts
export const createMockSessionItem = (overrides?: Partial<SessionItem>): SessionItem => {...}
export const createMockContentPiece = (type: ContentType): ContentPiece => {...}
export const createMockWorkflowSession = (overrides?: Partial<WorkflowSession>): WorkflowSession => {...}
export const createMockWorkflowState = (overrides?: Partial<WorkflowState>): WorkflowState => {...}
export const createMockItemRecord = (type: 'video' | 'image' | 'pdf'): ItemRecord => {...}
```

**Test Utilities Required**:
```typescript
// testUtils.ts
export const renderWithProviders = (ui: React.ReactElement, options?: RenderOptions) => {...}
export const createMockWorkflowProps = (overrides?: Partial<ItemCreationWorkflowProps>): ItemCreationWorkflowProps => {...}
export const waitForStepTransition = async (step: WorkflowStep) => {...}
export const simulateStepNavigation = async (user: ReturnType<typeof userEvent.setup>, steps: WorkflowStep[]) => {...}
```

### Task 6.2: Complete Workflow Flow Tests [1 story point]

**File**: `ItemCreationWorkflow.integration.test.tsx`

**Test Suites**:

1. **Complete Workflow Navigation**
   - Test progression from room-selection through session-summary
   - Test each step transition fires correct actions
   - Test data persists across step transitions

2. **Room Selection Integration**
   - Test room selection updates currentItem.room
   - Test "Other" room with custom input
   - Test navigation to item-type-selection step

3. **Item Type Selection Integration**
   - Test item type selection updates currentItem.itemType
   - Test auto-skip when "General" room selected
   - Test suggestions matrix integration

4. **Specific Item Selection Integration**
   - Test suggestion selection
   - Test custom item name entry
   - Test item name auto-generation ("Room - Item")

5. **Content Flow Integration**
   - Test content source selection
   - Test content type selection based on source
   - Test ContentCreationStep receives correct config

6. **Preview & Save Integration**
   - Test content piece display
   - Test item name editing
   - Test save item action updates session.items

7. **Next Action Integration**
   - Test "Add More to Item" flow
   - Test "Tag New Item" restarts workflow
   - Test "I'm Done" navigates to session-summary

8. **Session Summary Integration**
   - Test new items display
   - Test existing items fetch
   - Test print options panel integration

**Sample Test Structure**:
```typescript
describe('ItemCreationWorkflow Integration', () => {
  describe('Complete Workflow Flow', () => {
    it('completes full workflow from room selection to session summary', async () => {
      const user = userEvent.setup();
      render(<ItemCreationWorkflow {...createMockWorkflowProps()} />);

      // Step 1: Room Selection
      await user.click(screen.getByText('Kitchen'));
      await waitFor(() => expect(screen.getByText('Item Type')).toBeInTheDocument());

      // Step 2: Item Type Selection
      await user.click(screen.getByText('Appliance'));
      // ... continue through all steps
    });

    it('maintains state across step transitions', async () => {...});
    it('handles back navigation correctly', async () => {...});
  });
});
```

### Task 6.3: ItemCapture Integration Tests [1 story point]

**File**: `ItemCapture.integration.test.tsx`

**Mock Requirements**:
- Mock ItemCapture component with controllable completion
- Mock camera/media APIs
- Mock file upload handlers

**Test Suites**:

1. **ItemCapture Configuration**
   - Test config passed based on contentType (video/photo/pdf/text/url)
   - Test allowedMediaTypes mapping
   - Test maxVideoDuration and maxFileSize passed

2. **ItemCapture onComplete Flow**
   - Test ItemRecord transformation to ContentPiece
   - Test video content extraction
   - Test photo content extraction
   - Test PDF content extraction
   - Test text content extraction
   - Test URL content extraction

3. **ItemCapture onCancel Flow**
   - Test cancel navigates back to content-type-selection
   - Test partial data is not saved on cancel

4. **Error Handling**
   - Test missing media type in ItemRecord
   - Test transformation error handling
   - Test graceful degradation

**Sample Test Structure**:
```typescript
describe('ItemCapture Integration', () => {
  describe('Content Transformation', () => {
    it('transforms video ItemRecord to ContentPiece correctly', async () => {
      const mockRecord: ItemRecord = createMockItemRecord('video');
      const onAddContent = jest.fn();
      const onNext = jest.fn();

      // Render ContentCreationStep with mocked ItemCapture
      // Trigger onComplete with mockRecord
      // Assert onAddContent called with correct ContentPiece
      // Assert onNext called
    });
  });

  describe('Configuration Mapping', () => {
    it.each([
      ['video', ['video']],
      ['photo', ['image']],
      ['pdf', ['pdf']],
      ['text', []],
      ['url', []],
    ])('maps %s contentType to allowedMediaTypes: %s', (contentType, expectedTypes) => {
      // Test config mapping
    });
  });
});
```

### Task 6.4: QR Code Generation Integration Tests [1 story point]

**File**: `QRGeneration.integration.test.tsx`

**Mock Requirements**:
- Mock `useQRCodeGeneration` hook
- Mock QR code generation utilities
- Control progress and error states

**Test Suites**:

1. **QR Generation Trigger**
   - Test QR generation starts when entering session-summary
   - Test correct items passed to generateForItems
   - Test items with existing qrCodeUrl are skipped

2. **QR Generation Progress**
   - Test progress percentage updates
   - Test itemStatuses map reflects generation state
   - Test UI displays QRGenerationProgress component

3. **QR Generation Success**
   - Test qrCodes map populated correctly
   - Test UPDATE_ITEMS_QR_CODES action dispatched
   - Test session items updated with qrCodeUrl

4. **QR Generation Failure**
   - Test failedItemIds set populated
   - Test error message displayed
   - Test retry functionality works

5. **QR Generation Cancel**
   - Test cancel aborts generation
   - Test UI returns to stable state

6. **PDF Export Integration**
   - Test onGeneratePDF called with correct items and scope
   - Test print scope options (all, new-only, selected)
   - Test PDF generation error handling

**Sample Test Structure**:
```typescript
describe('QR Generation Integration', () => {
  describe('Batch QR Generation', () => {
    it('generates QR codes for all new session items', async () => {
      const mockQRHook = createMockQRGenerationHook({
        isGenerating: false,
        progress: 0,
        qrCodes: new Map(),
      });

      mockedUseQRCodeGeneration.mockReturnValue(mockQRHook);

      const sessionItems = [
        createMockSessionItem({ id: 'item-1' }),
        createMockSessionItem({ id: 'item-2' }),
      ];

      // Navigate to session-summary step
      // Assert generateForItems called with sessionItems
    });

    it('skips items that already have qrCodeUrl', async () => {
      const sessionItems = [
        createMockSessionItem({ id: 'item-1', qrCodeUrl: 'existing-url' }),
        createMockSessionItem({ id: 'item-2' }),
      ];

      // Assert only item-2 passed to generateForItems
    });
  });

  describe('Error Recovery', () => {
    it('displays retry button when generation fails', async () => {...});
    it('retries only failed items', async () => {...});
  });
});
```

### Task 6.5: Cross-Step Data Persistence Tests [0.5 story points]

**Add to**: `ItemCreationWorkflow.integration.test.tsx`

**Test Suites**:

1. **State Persistence Across Steps**
   - Test room selection persists through all subsequent steps
   - Test itemType selection persists
   - Test specificItem and itemName persist
   - Test content pieces persist through preview and save

2. **Session Persistence (localStorage)**
   - Test session auto-saves on state changes
   - Test session recovery on component remount
   - Test cleanup on session complete

### Task 6.6: Error Handling Integration Tests [0.5 story points]

**Add to**: `ItemCreationWorkflow.integration.test.tsx`

**Test Suites**:

1. **Component Error Propagation**
   - Test ItemCapture error doesn't corrupt workflow state
   - Test QR generation error doesn't prevent session completion
   - Test network errors display appropriate UI feedback

2. **Recovery Paths**
   - Test user can retry failed operations
   - Test user can skip failed optional operations
   - Test workflow remains functional after errors

---

## 7. Technical Implementation Details

### 7.1 Testing Framework Configuration

**Vitest Config** (`vitest.config.ts`):
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      include: [
        'src/components/ItemCreationWorkflow/**/*.ts',
        'src/components/ItemCreationWorkflow/**/*.tsx',
      ],
    },
  },
});
```

### 7.2 Required Mocks

**ItemCapture Mock**:
```typescript
jest.mock('@/components/ItemCapture', () => ({
  ItemCapture: ({ onComplete, onCancel, config }: ItemCaptureProps) => (
    <div data-testid="mock-item-capture">
      <div data-testid="config">{JSON.stringify(config)}</div>
      <button onClick={() => onComplete(createMockItemRecord('video'))}>
        Complete
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));
```

**QR Generation Mock**:
```typescript
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

**Session Persistence Mock**:
```typescript
// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
```

### 7.3 Test Data Constants

```typescript
// Test fixture constants
export const TEST_ROOMS = ['kitchen', 'laundry', 'bedroom'] as const;
export const TEST_ITEM_TYPES = ['appliance', 'room-item', 'general-info'] as const;
export const TEST_CONTENT_TYPES = ['video', 'photo', 'pdf', 'text', 'url'] as const;

export const WORKFLOW_STEPS_ORDER: WorkflowStep[] = [
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
```

---

## 8. Dependencies

### 8.1 Internal Dependencies

| Component | Import Path | Usage |
|-----------|-------------|-------|
| ItemCreationWorkflow | `@/components/ItemCreationWorkflow` | Main component under test |
| ItemCapture | `@/components/ItemCapture` | Media capture integration |
| useQRCodeGeneration | `@/hooks/useQRCodeGeneration` | QR code generation |
| useSessionPersistence | `./hooks/useSessionPersistence` | Session storage |
| useWorkflowState | `./hooks/useWorkflowState` | State machine |

### 8.2 Testing Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^2.0.0 | Test runner |
| @testing-library/react | ^14.0.0 | React testing utilities |
| @testing-library/user-event | ^14.0.0 | User interaction simulation |
| jsdom | ^22.0.0 | DOM environment |

---

## 9. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex mock setup | Medium | Medium | Create reusable mock factories early |
| Flaky async tests | Medium | High | Use proper waitFor patterns, avoid arbitrary delays |
| ItemCapture mock divergence | Low | Medium | Keep mock aligned with actual component interface |
| Test isolation issues | Medium | Medium | Reset all mocks and state in beforeEach |
| Coverage gaps | Low | Medium | Write tests incrementally, verify coverage after each suite |

---

## 10. Estimated Effort

| Task | Story Points | Estimated Hours |
|------|--------------|-----------------|
| Test Infrastructure Setup | 0.5 | 2 |
| Complete Workflow Flow Tests | 1.0 | 4 |
| ItemCapture Integration Tests | 1.0 | 4 |
| QR Generation Integration Tests | 1.0 | 4 |
| Cross-Step Data Persistence Tests | 0.5 | 2 |
| Error Handling Integration Tests | 0.5 | 2 |
| **Total** | **4.5** | **18 hours** |

---

## 11. Success Criteria

1. All integration tests pass in CI environment
2. Code coverage for integration-tested flows exceeds 80%
3. Tests execute in under 60 seconds total
4. No flaky tests after 10 consecutive runs
5. All acceptance criteria from REQ-116 are validated by tests

---

## 12. References

- **Implementation Plan**: `docs/prd/Plan-093-Item-Creation-Workflow.md`
- **Request Definition**: `docs/gen_requests.md` - REQ-116
- **Existing Integration Tests**:
  - `src/components/ItemCapture/__tests__/VideoCaptureStep.integration.test.tsx`
  - `src/components/ItemCapture/components/steps/__tests__/MediaEditorStep.integration.test.tsx`
- **Component Under Test**: `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- **QR Generation Hook**: `src/hooks/useQRCodeGeneration.ts`
- **Session QR Adapter**: `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`

---

*Document generated: 2026-01-05 15:30 UTC*
