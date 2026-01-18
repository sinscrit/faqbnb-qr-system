# REQ-172: End-to-End Flow Testing - Implementation Overview

**Document Created:** 2026-01-09 21:45 UTC
**Last Modified:** 2026-01-09 21:45 UTC
**Request ID:** REQ-172
**Phase:** 6 - Integration & Polish
**Task ID:** 6.1
**Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This document provides a technical implementation breakdown for comprehensive end-to-end testing of the Item Creation Workflow. The testing validates the complete user journey from room selection through final save, ensuring all UI/UX improvements from Plan-094 integrate correctly and deliver the intended seamless experience.

---

## Request Context

### Original Request (REQ-172)
**Title:** Comprehensive End-to-End Item Creation Workflow Testing
**Type:** ENHANCEMENT
**Size:** M

**Summary:** Perform comprehensive end-to-end testing of the complete item creation workflow to validate all user interactions, data flows, state transitions, and integration points function correctly from start to finish.

### Plan-094 Phase 6.1 Tasks
```
[ ] Test complete flow: Room -> Item Type -> Purpose -> Content Type -> Create -> Review -> Save
    [ ] Verify auto-generated title appears correctly
    [ ] Verify all pre-filled fields display correctly
    [ ] Test "Add More Content" flow
    [ ] Test Cancel with confirmation dialog
```

---

## Technical Context

### Current Workflow Architecture

The ItemCreationWorkflow uses a `useReducer`-based state machine pattern:

**State Shape:**
```typescript
WorkflowState {
  currentStep: WorkflowStep;          // Current step identifier
  stepHistory: WorkflowStep[];        // Navigation history
  session: WorkflowSession;           // All items in session
  currentItem: CurrentItemState;      // Item being created
  isSubmitting: boolean;              // Save operation state
  isDirty: boolean;                   // Unsaved changes flag
  errors: Record<string, string>;     // Validation errors
}
```

**Expected New Flow (from Plan-094):**
```
1. room-selection
2. item-type-selection
3. specific-item-selection
4. purpose-selection           <-- NEW STEP
5. content-type-selection      <-- Consolidated (no content-source step)
6. content-creation
7. preview-save                <-- Redesigned with content preview
8. next-action                 <-- Simplified with Cancel confirmation
9. session-summary
```

### Key Components Under Test

| Component | Location | Test Focus |
|-----------|----------|------------|
| ItemCreationWorkflow | `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Orchestration, step rendering |
| useWorkflowState | `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State transitions, actions |
| PurposeStep | `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | NEW: Purpose selection |
| ContentTypeStep | `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | Consolidated options |
| PreviewSaveStep | `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Content preview, pre-filled fields |
| NextActionStep | `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Cancel confirmation |
| ContentPreview | `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | NEW: Content display |
| titleGenerator | `/src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | NEW: Auto-title generation |

---

## Testing Scope

### Test Categories

#### 1. Complete Flow Navigation Testing
Validate the primary user journey through all workflow steps.

**Test Scenarios:**
- Happy path: Select room → Select item type → Select specific item → Select purpose → Select content type → Create content → Review → Save
- Back navigation at each step
- Step skipping (if applicable, e.g., "general" room type)
- Direct step access via progress bar (if enabled)

#### 2. Auto-Generated Title Testing
Verify the `titleGenerator` utility produces correct titles.

**Test Cases:**
| Purpose | Specific Item | Expected Title |
|---------|---------------|----------------|
| how-to-clean | Fridge | "How to Clean - Fridge" |
| how-to-use | Oven | "How to Use - Oven" |
| troubleshooting | Dishwasher | "Troubleshooting - Dishwasher" |
| safety-info | Stove | "Safety Information - Stove" |
| maintenance | HVAC | "Maintenance - HVAC" |
| features | Smart TV | "Features & Tips - Smart TV" |
| other | Custom Item | "Custom Item" (fallback) |
| null (no purpose) | Fridge | "Fridge" (fallback) |

#### 3. Pre-filled Fields Testing
Verify the PreviewSaveStep displays all selected values correctly.

**Fields to Verify:**
- Title (auto-generated, editable)
- Room (read-only, from room-selection)
- Item Type (read-only, from item-type-selection)
- Purpose (read-only, from purpose-selection)
- Content pieces (actual previews, not placeholders)

#### 4. "Add More Content" Flow Testing
Validate the loop for adding additional content to the same item.

**Test Scenarios:**
- Add video → Review → Add More → Add photo → Review → Save
- Add multiple content types in sequence
- Content count badge updates correctly
- Content order persists after adding more
- Maximum content limit enforcement (if applicable)

#### 5. Cancel with Confirmation Dialog Testing
Verify the Cancel action shows confirmation when content exists.

**Test Scenarios:**
- Cancel with no content added → No dialog, direct exit
- Cancel after uploading content → Confirmation dialog appears
- Cancel after entering text → Confirmation dialog appears
- Cancel after recording video → Confirmation dialog appears
- Confirm cancel → Workflow exits, content discarded
- Cancel cancel (dismiss dialog) → Return to workflow, content preserved

---

## Implementation Tasks

### Task 6.1.1: Create E2E Test Suite Structure
**Priority:** High
**Effort:** 2 hours

Create the test file structure for comprehensive end-to-end testing.

**Files to Create:**
- `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow.test.tsx`
- `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-title-generation.test.tsx`
- `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-add-more-content.test.tsx`
- `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-cancel-confirmation.test.tsx`

**Test Setup Requirements:**
```typescript
// Common test setup
const mockProps = {
  propertyId: 'test-property-id',
  existingItems: [],
  onSessionComplete: jest.fn(),
  onSessionExit: jest.fn(),
};

// Render helper with providers
const renderWorkflow = (props = {}) => {
  return render(
    <ItemCreationWorkflow {...mockProps} {...props} />
  );
};
```

### Task 6.1.2: Implement Complete Flow Navigation Tests
**Priority:** High
**Effort:** 4 hours

**Test Implementation:**
```typescript
describe('Complete Flow Navigation', () => {
  it('should complete full workflow: Room -> Item Type -> Purpose -> Content Type -> Create -> Review -> Save', async () => {
    // 1. Render workflow
    // 2. Select room (Kitchen)
    // 3. Verify step transition to item-type-selection
    // 4. Select item type (Appliance)
    // 5. Verify step transition to specific-item-selection
    // 6. Enter specific item name (Fridge)
    // 7. Verify step transition to purpose-selection
    // 8. Select purpose (how-to-clean)
    // 9. Verify step transition to content-type-selection
    // 10. Select content type (Upload File)
    // 11. Verify step transition to content-creation
    // 12. Upload file
    // 13. Verify step transition to preview-save
    // 14. Verify all fields displayed correctly
    // 15. Click Save
    // 16. Verify onSessionComplete called with correct data
  });

  it('should handle back navigation at each step', async () => {
    // Test back button functionality throughout flow
  });

  it('should skip item-type-selection for "general" room type', async () => {
    // Test special case for general room
  });
});
```

### Task 6.1.3: Implement Title Generation Tests
**Priority:** High
**Effort:** 2 hours

**Test Implementation:**
```typescript
describe('Auto-Generated Title', () => {
  describe('titleGenerator utility', () => {
    it.each([
      ['how-to-clean', 'Fridge', 'How to Clean - Fridge'],
      ['how-to-use', 'Oven', 'How to Use - Oven'],
      ['troubleshooting', 'Dishwasher', 'Troubleshooting - Dishwasher'],
      ['safety-info', 'Stove', 'Safety Information - Stove'],
      ['maintenance', 'HVAC', 'Maintenance - HVAC'],
      ['features', 'Smart TV', 'Features & Tips - Smart TV'],
      ['other', 'Custom Item', 'Custom Item'],
    ])('generates "%s" title for purpose=%s, item=%s', (purpose, item, expected) => {
      expect(generateArticleTitle({ specificItem: item, purpose })).toBe(expected);
    });

    it('falls back to item name when purpose is null', () => {
      expect(generateArticleTitle({ specificItem: 'Fridge', purpose: null })).toBe('Fridge');
    });
  });

  describe('Title display in PreviewSaveStep', () => {
    it('displays auto-generated title based on selections', async () => {
      // Navigate to preview-save step
      // Verify title field shows generated value
    });

    it('allows title editing', async () => {
      // Navigate to preview-save step
      // Click edit on title
      // Change title
      // Verify new title persists
    });
  });
});
```

### Task 6.1.4: Implement Pre-filled Fields Tests
**Priority:** High
**Effort:** 2 hours

**Test Implementation:**
```typescript
describe('Pre-filled Fields in PreviewSaveStep', () => {
  it('displays room selection correctly', async () => {
    // Select "Kitchen" in room-selection
    // Navigate to preview-save
    // Verify "Kitchen" displayed in Room field
  });

  it('displays item type selection correctly', async () => {
    // Select "Appliance" in item-type-selection
    // Navigate to preview-save
    // Verify "Appliance" displayed in Item Type field
  });

  it('displays purpose selection correctly', async () => {
    // Select "how-to-clean" in purpose-selection
    // Navigate to preview-save
    // Verify "How to Clean" displayed in Purpose field
  });

  it('displays actual content previews (not placeholders)', async () => {
    // Upload a video file
    // Navigate to preview-save
    // Verify video thumbnail displayed
    // Verify duration badge if applicable
  });

  it('displays text content preview with truncation', async () => {
    // Enter text content
    // Navigate to preview-save
    // Verify truncated text preview displayed
  });
});
```

### Task 6.1.5: Implement "Add More Content" Flow Tests
**Priority:** Medium
**Effort:** 3 hours

**Test Implementation:**
```typescript
describe('Add More Content Flow', () => {
  it('allows adding multiple content pieces to same item', async () => {
    // Create first content piece (video)
    // Navigate to preview-save
    // Click "Add More Content"
    // Verify returns to content-type-selection
    // Create second content piece (photo)
    // Navigate to preview-save
    // Verify both pieces displayed
  });

  it('updates content count badge when adding more', async () => {
    // Add first piece → verify count = 1
    // Add more → verify count = 2
    // Add more → verify count = 3
  });

  it('preserves content order after adding more', async () => {
    // Add pieces in order: video, photo, text
    // Verify order preserved in preview
  });

  it('enforces maximum content limit', async () => {
    // Add content up to max limit
    // Verify "Add More" option disabled or hidden
  });

  it('maintains item state when navigating back from add more', async () => {
    // Add content
    // Add more
    // Navigate back
    // Verify previous content still present
  });
});
```

### Task 6.1.6: Implement Cancel Confirmation Dialog Tests
**Priority:** High
**Effort:** 2 hours

**Test Implementation:**
```typescript
describe('Cancel with Confirmation Dialog', () => {
  it('exits directly when no content has been added', async () => {
    // Navigate to content-type-selection (no content yet)
    // Click Cancel
    // Verify no dialog shown
    // Verify onSessionExit called
  });

  it('shows confirmation when content has been uploaded', async () => {
    // Upload a file
    // Click Cancel
    // Verify confirmation dialog appears
    // Verify dialog message warns about losing work
  });

  it('shows confirmation when text has been entered', async () => {
    // Enter text content
    // Click Cancel
    // Verify confirmation dialog appears
  });

  it('shows confirmation when recording has been made', async () => {
    // Record video
    // Click Cancel
    // Verify confirmation dialog appears
  });

  it('discards content when cancel is confirmed', async () => {
    // Add content
    // Click Cancel
    // Confirm in dialog
    // Verify content discarded
    // Verify onSessionExit called
  });

  it('preserves content when cancel is dismissed', async () => {
    // Add content
    // Click Cancel
    // Click "Keep Working" in dialog
    // Verify returned to workflow
    // Verify content still present
  });

  it('shows confirmation at multiple workflow stages', async () => {
    // Test cancel from content-creation step
    // Test cancel from preview-save step
    // Test cancel from next-action step
    // All should show confirmation if content exists
  });
});
```

### Task 6.1.7: Implement Integration Tests for State Transitions
**Priority:** Medium
**Effort:** 2 hours

**Test Implementation:**
```typescript
describe('State Transitions', () => {
  it('transitions correctly through new workflow steps', async () => {
    const { getState } = renderWorkflowWithState();

    // Verify initial state
    expect(getState().currentStep).toBe('room-selection');

    // After room selection
    selectRoom('kitchen');
    expect(getState().currentStep).toBe('item-type-selection');

    // After item type selection
    selectItemType('appliance');
    expect(getState().currentStep).toBe('specific-item-selection');

    // After specific item selection
    setSpecificItem('Fridge');
    expect(getState().currentStep).toBe('purpose-selection');

    // After purpose selection
    selectPurpose('how-to-clean');
    expect(getState().currentStep).toBe('content-type-selection');

    // Continue through remaining steps...
  });

  it('updates currentItem state correctly at each step', async () => {
    // Verify currentItem.room after room selection
    // Verify currentItem.itemType after item type selection
    // Verify currentItem.specificItem after specific item
    // Verify currentItem.purpose after purpose selection
    // Verify currentItem.content after content creation
  });
});
```

### Task 6.1.8: Create Manual Test Checklist
**Priority:** Medium
**Effort:** 1 hour

Create a manual testing checklist for scenarios difficult to automate.

**Checklist Items:**
- [ ] Visual inspection of content previews (video thumbnails)
- [ ] Animation smoothness on step transitions
- [ ] Touch interaction on mobile devices
- [ ] Drag-to-reorder content on touch screens
- [ ] Screen reader announcement at each step
- [ ] Focus management after step transitions
- [ ] Print preview includes all content correctly

---

## Authorized Files and Functions for Modification

### Test Files (CREATE)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-complete-flow.test.tsx` | Complete flow navigation tests |
| `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-title-generation.test.tsx` | Title generation tests |
| `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-add-more-content.test.tsx` | Add more content flow tests |
| `/src/components/ItemCreationWorkflow/__tests__/e2e/workflow-cancel-confirmation.test.tsx` | Cancel confirmation tests |
| `/src/components/ItemCreationWorkflow/__tests__/e2e/index.ts` | Test suite exports |
| `/src/components/ItemCreationWorkflow/__tests__/e2e/test-utils.ts` | Shared test utilities |

### Test Files (MODIFY - if needed)

| File Path | Modification |
|-----------|--------------|
| `/src/components/ItemCreationWorkflow/__tests__/workflow.test.tsx` | Add E2E test imports |
| `/src/components/ItemCreationWorkflow/utils/__tests__/titleGenerator.test.ts` | Expand title generation unit tests |

### Source Files (READ ONLY - for test reference)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Component structure |
| `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | State machine logic |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Constants and enums |
| `/src/components/ItemCreationWorkflow/utils/titleGenerator.ts` | Title generation logic |
| `/src/components/ItemCreationWorkflow/components/steps/PurposeStep.tsx` | Purpose step implementation |
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Preview step implementation |
| `/src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Next action step implementation |
| `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | Content preview component |

---

## Dependencies

### Prerequisites (Must Complete First)
- **Phase 1:** Types and Constants (PURPOSE_TYPES, updated state shape)
- **Phase 2:** PurposeStep component created and integrated
- **Phase 3:** ContentSourceStep removed, ContentTypeStep consolidated
- **Phase 4:** Bottom navigation removed from content screens
- **Phase 5:** PreviewSaveStep redesigned with ContentPreview

### Dependent Tasks
- **Task 6.2:** Mobile Responsiveness Testing (uses same test infrastructure)
- **Task 6.3:** Accessibility Audit (extends test utilities)

---

## Testing Infrastructure

### Required Testing Libraries
```json
{
  "@testing-library/react": "^14.x",
  "@testing-library/user-event": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "jest": "^29.x"
}
```

### Mock Setup Requirements

**File Upload Mocks:**
```typescript
const createMockFile = (name: string, type: string, size: number = 1024) => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};
```

**Supabase Client Mocks:**
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      })),
    },
  },
}));
```

---

## Acceptance Criteria Mapping

| Acceptance Criterion | Test Task | Verification Method |
|---------------------|-----------|---------------------|
| Complete workflow tested from room selection through final save | Task 6.1.2 | Automated test |
| Auto-generated title verified for multiple combinations | Task 6.1.3 | Automated test |
| Pre-filled fields confirmed accurate | Task 6.1.4 | Automated test |
| "Add More Content" flow tested | Task 6.1.5 | Automated test |
| Cancel confirmation dialog tested | Task 6.1.6 | Automated test |
| Navigation between steps validated | Task 6.1.2, 6.1.7 | Automated test |
| Error handling verified | Task 6.1.7 | Automated test |
| Session persistence tested | Task 6.1.7 | Automated test |
| Mobile and desktop tested | Task 6.1.8 | Manual checklist |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| New components not yet implemented | High | Blocks testing | Coordinate with Phase 1-5 completion |
| File upload mocking complexity | Medium | Test flakiness | Use robust mock utilities |
| State machine changes | Medium | Test updates needed | Modular test design |
| Async operations timing | Medium | Flaky tests | Use `waitFor` and proper assertions |

---

## Effort Estimate

| Task | Estimate | Confidence |
|------|----------|------------|
| Task 6.1.1: Test suite structure | 2 hours | High |
| Task 6.1.2: Complete flow tests | 4 hours | Medium |
| Task 6.1.3: Title generation tests | 2 hours | High |
| Task 6.1.4: Pre-filled fields tests | 2 hours | High |
| Task 6.1.5: Add more content tests | 3 hours | Medium |
| Task 6.1.6: Cancel confirmation tests | 2 hours | High |
| Task 6.1.7: State transition tests | 2 hours | High |
| Task 6.1.8: Manual test checklist | 1 hour | High |
| **Total** | **18 hours** | Medium-High |

---

## References

- **Request:** `/docs/gen_requests.md` (REQ-172)
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Workflow Types:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **State Machine:** `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- **Existing Tests:** `/src/components/ItemCreationWorkflow/__tests__/`
