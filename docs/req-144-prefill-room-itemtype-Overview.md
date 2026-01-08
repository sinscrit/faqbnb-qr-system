# Implementation Overview: Pre-fill Room and Item Type in Item Details Form

## Header
| Field | Value |
|-------|-------|
| Request Reference | #144 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-08 14:30 |
| Breakdown Created | 2026-01-08 16:50:15 CET |
| T-shirt Size | S |
| Estimated Effort | 4-6 hours |

## Goals

Pre-fill the Room and Item Type dropdown fields in the MetadataStep component (Item Details form) of ItemCapture with values previously selected in the ItemCreationWorkflow's RoomSelectionStep and ItemTypeStep, eliminating redundant data entry while preserving the ability to override selections.

### Assumptions & Clarifications

- The ItemCapture component is embedded within ItemCreationWorkflow via ContentCreationStep
- RoomSelectionStep selections use `RoomType` from `ItemCreationWorkflow.types.ts` (e.g., 'kitchen', 'living-room')
- MetadataStep uses `PRESET_LOCATIONS` strings from `ItemCapture/utils/constants.ts` (e.g., 'Kitchen', 'Living Room')
- A mapping/translation layer is needed between the two room formats
- ItemTypeStep uses `ItemType` ('appliance', 'room-item', 'general-info')
- MetadataStep uses `ApplianceType` from ItemCapture which is a different, more specific type
- The pre-fill should set initial values but allow users to change them at any time

## Implementation Plan

### Step 1: Extend ItemCaptureProps to Accept Pre-fill Values

- **Description**: Add optional `initialRoom` and `initialItemType` props to `ItemCaptureProps` interface to allow parent components to pass pre-selected values
- **Rationale**: This maintains backward compatibility - ItemCapture can be used standalone without pre-fill, or with pre-fill when embedded in ItemCreationWorkflow
- **Estimated Effort**: S (30 minutes)

### Step 2: Create Room Type Mapping Utility

- **Description**: Create a mapping function to translate `RoomType` values from ItemCreationWorkflow format (kebab-case IDs) to `PRESET_LOCATIONS` format (human-readable strings)
- **Rationale**: The two systems use different formats for room identification. A dedicated mapping utility keeps the translation logic centralized and testable
- **Estimated Effort**: S (1 hour)

### Step 3: Create Item Type to Appliance Type Mapping Utility

- **Description**: Create a mapping function to translate `ItemType` from ItemCreationWorkflow to `ApplianceType` in ItemCapture, or handle it as a separate category indicator
- **Rationale**: ItemType is a broad category (appliance, room-item, general-info) while ApplianceType is specific (washer, dryer, etc.). Need to decide mapping strategy
- **Estimated Effort**: S (45 minutes)

### Step 4: Update useItemCaptureState to Support Initial Values

- **Description**: Modify `createInitialState` function in `useItemCaptureState.ts` to accept optional initial values for `location` and `applianceType` fields in metadata
- **Rationale**: The state initialization must respect pre-fill values while maintaining existing behavior when none are provided
- **Estimated Effort**: S (45 minutes)

### Step 5: Update ItemCapture Component to Pass Initial Values

- **Description**: Modify ItemCapture component to extract initial values from props and pass them to the state hook initialization
- **Rationale**: The main component is the entry point where props are received and need to flow into state management
- **Estimated Effort**: S (30 minutes)

### Step 6: Update ContentCreationStep to Pass Workflow State

- **Description**: Modify ContentCreationStep in ItemCreationWorkflow to pass `currentItem.room` and `currentItem.itemType` to ItemCapture as initial values
- **Rationale**: ContentCreationStep is the integration point where workflow state needs to be mapped to ItemCapture props
- **Estimated Effort**: S (45 minutes)

### Step 7: Update MetadataStep Sync Logic

- **Description**: Ensure MetadataStep's `locationSearchTerm` state syncs with initial `metadata.location` value on mount, not just on external changes
- **Rationale**: The current sync useEffect only triggers on metadata.location changes; it may not initialize correctly on first render with pre-filled values
- **Estimated Effort**: S (30 minutes)

### Step 8: Add Unit Tests for Mapping Functions

- **Description**: Create unit tests for room type and item type mapping utilities
- **Rationale**: Mapping logic is critical for correct behavior; thorough testing prevents regressions
- **Estimated Effort**: S (1 hour)

### Step 9: Add Integration Test for Pre-fill Flow

- **Description**: Create integration test that verifies values selected in RoomSelectionStep and ItemTypeStep appear pre-filled in MetadataStep
- **Rationale**: End-to-end validation ensures the complete flow works correctly
- **Estimated Effort**: S (1 hour)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Step 1: ItemCapture Props Extension
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/ItemCapture.types.ts` | `ItemCaptureProps` interface | Modify |

### Step 2: Room Type Mapping
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/utils/roomMapping.ts` | -- | Create |

### Step 3: Item Type Mapping
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/utils/itemTypeMapping.ts` | -- | Create |

### Step 4: State Hook Update
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | `createInitialState()` | Modify |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | `useItemCaptureState()` | Modify |

### Step 5: ItemCapture Component Update
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/ItemCapture.tsx` | `ItemCapture()` | Modify |

### Step 6: ContentCreationStep Integration
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | `ContentCreationStep()` | Modify |

### Step 7: MetadataStep Sync
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | `MetadataStep()` | Modify |

### Step 8: Unit Tests
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCapture/utils/__tests__/roomMapping.test.ts` | -- | Create |
| `src/components/ItemCapture/utils/__tests__/itemTypeMapping.test.ts` | -- | Create |

### Step 9: Integration Test
| File | Target | Type |
|------|--------|------|
| `src/components/ItemCreationWorkflow/__tests__/ItemCapture.integration.test.tsx` | -- | Modify |

## Dependencies

### Internal Dependencies
- REQ-105 (Content Creation Step) - ContentCreationStep must be complete
- REQ-097 (Room Selection Step) - RoomSelectionStep must be complete
- REQ-099 (Item Type Selection Step) - ItemTypeStep must be complete

### External Dependencies
- None - This is a UI state flow change with no external API dependencies

## Risks and Considerations

### Potential Side Effects

1. **Standalone ItemCapture Usage**: If ItemCapture is used outside of ItemCreationWorkflow (e.g., on a direct edit page), it should still work without pre-fill values. The props must be optional with sensible defaults.

2. **Room Type Mismatch**: The mapping between ItemCreationWorkflow's room types and ItemCapture's preset locations may not be 1:1. Some workflow rooms may not have an exact match in PRESET_LOCATIONS.

3. **Item Type to Appliance Type**: The `ItemType` in workflow is a broad category, while `ApplianceType` is specific. This mapping may need user confirmation or could pre-select a category but leave specific type empty.

4. **State Persistence**: If a user navigates back from MetadataStep and changes their room/item type selection, then returns, the MetadataStep should reflect the updated selection, not cache old pre-fill values.

5. **Custom Room Names**: When workflow uses "other" room type, the user may have entered a custom room name in RoomSelectionStep. This custom name should be passed through.

### Testing Requirements

- Unit tests for all mapping functions with edge cases
- Integration test verifying pre-fill works when navigating from workflow
- Regression test ensuring standalone ItemCapture still works without pre-fill props
- Test backward navigation scenario: change room -> return to MetadataStep -> verify updated room
- Test custom room name propagation

### Open Questions

- [ ] Should the "Item Type" dropdown in MetadataStep show the broad category (appliance/room-item/general-info) or attempt to pre-select a specific appliance type?
- [ ] If workflow room is "other" with custom text, should that custom text be passed to ItemCapture's location field?
- [ ] Should there be visual indication that Room/Item Type were pre-filled from earlier selections?

## Out of Scope

Per the original request, the following are explicitly out of scope:

- Changes to RoomSelectionStep or ItemTypeStep UI
- Adding new room types or item types
- Persisting pre-fill state across browser sessions
- Automatic sync when user changes room/item type after reaching MetadataStep (only initial pre-fill)
- Changes to the ReviewStep or submission flow

---
*Document generated: 2026-01-08 16:50:15 CET*
