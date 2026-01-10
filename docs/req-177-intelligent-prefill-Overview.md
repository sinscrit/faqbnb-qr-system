# Implementation Overview: Intelligent Pre-filling of Item Details Based on Workflow Choices

## Header
| Field | Value |
|-------|-------|
| Request Reference | #177 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-10 12:15 |
| Breakdown Created | 2026-01-10 12:39:23 CET |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

## Goals

1. **Pre-fill Item Name** - Automatically generate an article title from the user's workflow selections (purpose + specific item), reducing or eliminating manual typing
2. **Pre-fill Article Purpose** - Pre-select the purpose field based on the purpose chosen in the PurposeStep (Step 4)
3. **Auto-select Tags** - Automatically derive and select relevant tags based on logical mappings from item type, room category, and purpose
4. **Zero-typing UX** - In simple/basic workflow paths, enable users to review pre-filled values and confirm without typing anything

### Assumptions & Clarifications

- **Tags field does not currently exist**: The `CurrentItemState` and `SessionItem` types do not include a `tags` field. This feature will need to add tags as a new field to the data model.
- **Tags are client-side only (initially)**: Tags will be stored in the session/item state but not persisted to the database initially. Database schema extension is out of scope for this request.
- **Purpose is already being pre-filled**: The `SELECT_PURPOSE` action in `useWorkflowState.ts` already calls `generateArticleTitle()` to auto-generate the item name. This feature enhances that by ensuring the PreviewSaveStep displays these values correctly and adds the tags functionality.
- **REQ-176 is complete**: The media capture step exists and properly routes to PreviewSaveStep with workflow state intact.

## Implementation Plan

### Step 1: Add Tags Type and Constants
- **Description**: Define tag types, available tags list, and tag label mappings in the constants file. Create a mapping matrix that determines which tags to auto-select based on room, item type, and purpose combinations.
- **Rationale**: Tags need to be defined as constants before they can be used in state and components. The mapping matrix centralizes the auto-selection logic.
- **Estimated Effort**: S (1 hour)

### Step 2: Extend CurrentItemState and SessionItem Types
- **Description**: Add a `tags: string[]` field to `CurrentItemState` and `SessionItem` interfaces in the types file.
- **Rationale**: The data model must support tags before any pre-filling or display logic can be implemented.
- **Estimated Effort**: S (30 minutes)

### Step 3: Add Tags Auto-Selection to Workflow Reducer
- **Description**: Modify the `SELECT_PURPOSE` action handler (and potentially `SELECT_ROOM` and `SELECT_ITEM_TYPE`) in the workflow reducer to automatically generate tags based on the tag mapping matrix.
- **Rationale**: Tags should be computed at the same point where other derived values (like itemName) are computed, ensuring consistency.
- **Estimated Effort**: M (1-1.5 hours)

### Step 4: Create Tags Display/Edit Component
- **Description**: Create a new `TagsEditor` component that displays pre-selected tags as chips/badges with the ability to remove or add additional tags.
- **Rationale**: The UI needs a dedicated component to display and allow editing of auto-selected tags.
- **Estimated Effort**: M (1.5 hours)

### Step 5: Integrate Tags into PreviewSaveStep
- **Description**: Add the TagsEditor component to the ItemDetailsSection of PreviewSaveStep. Pass the tags from currentItem and wire up change handlers.
- **Rationale**: The PreviewSaveStep is the "Item Details form" mentioned in the requirement where pre-filled values should be displayed.
- **Estimated Effort**: S (45 minutes)

### Step 6: Add Tags Handling to Save Flow
- **Description**: Ensure tags are included when saving the item in the handleSaveItem callback and that they propagate to the SessionItem.
- **Rationale**: Pre-filled tags must be persisted with the item for the feature to be complete.
- **Estimated Effort**: S (30 minutes)

### Step 7: Write Tests
- **Description**: Add unit tests for tag mapping logic, reducer actions, and component integration tests for TagsEditor and updated PreviewSaveStep.
- **Rationale**: Tests ensure the feature works correctly and catches regressions.
- **Estimated Effort**: M (1-1.5 hours)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Step 1: Tag Constants and Mapping
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | `AVAILABLE_TAGS` (new constant) | Create |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | `TAG_LABELS` (new constant) | Create |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | `TagTypeConst` (new type) | Create |
| `/src/components/ItemCreationWorkflow/utils/tagMapper.ts` | — | Create |

### Step 2: Type Extensions
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `CurrentItemState` interface | Modify |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `SessionItem` interface | Modify |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | `WorkflowAction` type | Modify |

### Step 3: Reducer Updates
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `SELECT_PURPOSE` case handler | Modify |
| `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `SELECT_ROOM` case handler | Modify |
| `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `SELECT_ITEM_TYPE` case handler | Modify |
| `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts` | `createInitialState()` function | Modify |

### Step 4: TagsEditor Component
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | — | Create |
| `/src/components/ItemCreationWorkflow/components/shared/index.ts` | Export TagsEditor | Modify |

### Step 5: PreviewSaveStep Integration
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | `ItemDetailsSection` component | Modify |
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | imports section | Modify |

### Step 6: Save Flow
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | `handleSaveItem` function | Modify |

### Step 7: Tests
| File | Target | Type |
|------|--------|------|
| `/src/components/ItemCreationWorkflow/utils/__tests__/tagMapper.test.ts` | — | Create |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/TagsEditor.test.tsx` | — | Create |
| `/src/components/ItemCreationWorkflow/hooks/__tests__/useWorkflowState.test.ts` | tag-related test cases | Modify |
| `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx` | tag display tests | Modify |

## Dependencies

### Internal Dependencies
- **REQ-176** (Complete): Media capture step must exist and properly route to PreviewSaveStep with workflow state intact
- Existing infrastructure:
  - `generateArticleTitle()` in `/src/components/ItemCreationWorkflow/utils/titleGenerator.ts`
  - Constants system in `/src/components/ItemCreationWorkflow/utils/constants.ts`
  - Workflow reducer in `/src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

### External Dependencies
- None - this is a client-side enhancement that doesn't require API changes

## Risks and Considerations

### Potential Side Effects
- **Existing tests may fail**: Changes to `CurrentItemState` interface will require updates to test fixtures in multiple test files that create mock current items
- **Session persistence**: If workflow state is persisted to localStorage (REQ-113), ensure tags are properly serialized/deserialized
- **Add More to Item flow**: The `ADD_MORE_TO_ITEM` action reconstructs `CurrentItemState` from `SessionItem` - must preserve tags

### Testing Requirements
- **Tag mapping matrix**: Test all combinations of room + item type + purpose to verify correct tags are generated
- **Edge cases**: Test when purpose is null, when room is "other", when itemType is "general-info"
- **User editing**: Test that users can add/remove tags after auto-selection
- **Zero-typing flow**: Integration test verifying Kitchen > Appliance > How-to-use > Photo flow requires no manual typing

### Open Questions
- [ ] Should tags be displayed in the SessionSummaryStep for each item?
- [ ] Should tags be visible on the success overlay after save?
- [ ] Should tag changes trigger the "unsaved changes" warning if user navigates away?
- [ ] Future: Will tags need to be persisted to the database? (Deferred to separate request)

## Out of Scope

Per the original request, the following are explicitly out of scope:

1. **Database schema changes** - Tags are client-side only for this implementation
2. **API modifications** - No backend changes for tag persistence
3. **Tags in guest-facing item view** - Tags are for internal organization only
4. **AI-generated tag suggestions** - Tags come from deterministic mappings only
5. **Tag search/filtering** - No search functionality for tags in this request
6. **Tag management UI** - No admin interface for defining available tags

## Tag Mapping Matrix (Reference)

This matrix defines which tags are auto-selected based on workflow choices:

| Room | Item Type | Purpose | Auto-Selected Tags |
|------|-----------|---------|-------------------|
| kitchen | appliance | how-to-use | `kitchen`, `appliance`, `instructions` |
| kitchen | appliance | how-to-clean | `kitchen`, `appliance`, `cleaning` |
| kitchen | appliance | troubleshooting | `kitchen`, `appliance`, `troubleshooting` |
| kitchen | appliance | safety-info | `kitchen`, `appliance`, `safety` |
| kitchen | appliance | maintenance | `kitchen`, `appliance`, `maintenance` |
| kitchen | appliance | features | `kitchen`, `appliance`, `features` |
| laundry | appliance | how-to-use | `laundry`, `appliance`, `instructions` |
| ... | ... | ... | ... |
| general | general-info | other | `general`, `info` |

**Note**: The full matrix will be implemented in `/src/components/ItemCreationWorkflow/utils/tagMapper.ts` following a pattern-based approach rather than exhaustive enumeration.

---
*Document generated: 2026-01-10 12:39:23 CET*
