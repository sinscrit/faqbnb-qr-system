---
name: 06b-usecase-generator
description: Pipeline Use Case Test Generator Agent - Creates aggregate end-to-end test scenarios based on PRD intent.
---

# 06b-usecase-generator

Pipeline Use Case Test Generator Agent - Creates aggregate end-to-end test scenarios based on PRD intent.

## Trigger

This agent can be invoked:
1. As **Stage 6** in a pipeline (after testcheck stage completes)
2. Manually after implementation: `/06b-usecase-generator <pipeline-yaml-path>`

## Purpose

While individual component tests verify isolated functionality, this agent generates **aggregate use case tests** that:
- Exercise complete user flows end-to-end
- Combine multiple components as intended in the PRD
- Validate the system works as a cohesive whole
- Document expected user journeys with step-by-step instructions

## Input

- **Pipeline YAML path**: e.g., `./pipeline-item-creation-workflow.yaml`
- **PRD/Implementation Plan**: The source document that describes user intent
- **Pipeline State**: Current task completion status and component locations

## Workflow

### Phase 1: Intent Discovery

1. **Read the pipeline config** to locate:
   - `source.path` - The PRD/implementation plan document
   - `outputs.state` - Pipeline state file
   - Pipeline name for test page generation

2. **Parse the PRD/Implementation Plan** to extract:
   - User goals and objectives
   - Expected user journeys/flows
   - Success criteria
   - Edge cases and error scenarios
   - Integration points between components

3. **Identify use case categories**:
   - **Happy path flows**: Standard successful user journeys
   - **Error handling flows**: How the system handles failures
   - **Edge case flows**: Boundary conditions and unusual inputs
   - **Multi-step flows**: Complex journeys spanning multiple components

### Phase 2: Component Mapping

1. **Read the pipeline state** to understand:
   - Which components were implemented
   - Component locations and exports
   - Dependencies between components

2. **Map PRD intent to implemented components**:
   ```
   PRD Goal: "User can create an item with video content"
   Components: RoomSelectionStep → ItemTypeStep → ContentTypeStep → VideoCaptureStep → PreviewSaveStep
   ```

3. **Identify integration points** where components hand off to each other

### Phase 3: Use Case Generation

For each identified use case:

1. **Define the use case structure**:
   ```typescript
   interface UseCase {
     id: string;           // e.g., "UC-001"
     title: string;        // e.g., "Complete Video Item Creation"
     category: 'happy-path' | 'error-handling' | 'edge-case' | 'integration';
     description: string;  // What this tests
     preconditions: string[];
     steps: UseCaseStep[];
     expectedOutcome: string;
     componentsInvolved: string[];
   }

   interface UseCaseStep {
     stepNumber: number;
     action: string;       // What the user does
     component: string;    // Which component handles this
     expectedResult: string;
     testAssertion?: string; // Optional programmatic check
   }
   ```

2. **Generate use cases from PRD sections**:
   - Each "User Story" or "Feature" → 1-3 use cases
   - Each "Error Scenario" → 1 error handling use case
   - Each "Edge Case" mentioned → 1 edge case use case

3. **Prioritize use cases**:
   - P0: Critical happy paths (must work)
   - P1: Common error scenarios
   - P2: Edge cases and advanced flows

### Phase 4: State File Output

**IMPORTANT**: Do NOT directly edit the test harness page. Instead, output use cases to the state file. The pipeline orchestrator will regenerate the test harness with use cases included.

1. **Read the current state file** specified in the pipeline config

2. **Add use cases to state file** under the `usecases` key:
   ```json
   {
     "usecases": {
       "generated_at": "2026-01-05T12:00:00Z",
       "count": 12,
       "categories": {
         "happy-path": 5,
         "error-handling": 3,
         "edge-case": 2,
         "integration": 2
       },
       "items": [
         {
           "id": "UC-HP-001",
           "title": "Complete Video Item Creation Flow",
           "category": "happy-path",
           "priority": "P0",
           "description": "User creates a new item with video content from start to finish",
           "preconditions": ["User is logged in", "Camera permissions granted"],
           "steps": [
             { "step": 1, "action": "Select 'Kitchen' room", "component": "RoomSelectionStep", "expectedResult": "Room selected, proceed to item type" },
             { "step": 2, "action": "Select 'Appliance' type", "component": "ItemTypeStep", "expectedResult": "Type selected, proceed to specific item" },
             { "step": 3, "action": "Choose 'Coffee Machine'", "component": "SpecificItemStep", "expectedResult": "Item name set, proceed to content source" },
             { "step": 4, "action": "Select 'Create Now'", "component": "ContentSourceStep", "expectedResult": "Source selected, proceed to content type" },
             { "step": 5, "action": "Select 'Video'", "component": "ContentTypeStep", "expectedResult": "Type selected, camera activated" },
             { "step": 6, "action": "Record 10-second video", "component": "VideoCaptureStep", "expectedResult": "Video recorded, proceed to preview" },
             { "step": 7, "action": "Review and save", "component": "PreviewSaveStep", "expectedResult": "Item saved successfully" }
           ],
           "expectedOutcome": "Item saved with video content, QR code generated",
           "componentsInvolved": ["RoomSelectionStep", "ItemTypeStep", "SpecificItemStep", "ContentSourceStep", "ContentTypeStep", "VideoCaptureStep", "PreviewSaveStep"]
         }
       ]
     }
   }
   ```

3. **Use case structure**:
   ```typescript
   interface UseCase {
     id: string;           // e.g., "UC-HP-001" (UC-{category abbreviation}-{number})
     title: string;        // Human-readable title
     category: 'happy-path' | 'error-handling' | 'edge-case' | 'integration';
     priority: 'P0' | 'P1' | 'P2';  // P0=critical, P1=important, P2=nice-to-have
     description: string;  // What this use case tests
     preconditions: string[];  // What must be true before starting
     steps: UseCaseStep[];
     expectedOutcome: string;  // Final expected state
     componentsInvolved: string[];  // List of component names
   }

   interface UseCaseStep {
     step: number;
     action: string;       // What the user does
     component: string;    // Which component handles this
     expectedResult: string;  // What should happen after this step
   }
   ```

4. **Save the updated state file** - the orchestrator will detect the usecases and regenerate the test harness

### Phase 5: Summary Output

1. **Log summary to console**:
   ```
   Use Case Generation Complete
   ============================
   Total use cases: 12
   - Happy path: 5
   - Error handling: 3
   - Edge cases: 2
   - Integration: 2

   P0 (Critical): 4
   P1 (Important): 5
   P2 (Nice-to-have): 3

   Use cases saved to state file.
   Orchestrator will regenerate test harness with use cases.
   ```

2. **List generated use cases** with IDs and titles

## Output

1. **State file update** with complete use case definitions in `usecases.items[]`
2. **Console summary** of generated use cases
3. **NO direct edits** to test harness page (orchestrator handles this)

## Example Use Cases by Category

### Happy Path Examples
```typescript
{
  id: 'UC-HP-001',
  title: 'Create Item with Photo Content',
  steps: ['Select room', 'Select type', 'Choose item', 'Take photo', 'Save'],
}
```

### Error Handling Examples
```typescript
{
  id: 'UC-ERR-001',
  title: 'Handle Camera Permission Denied',
  steps: ['Select video content', 'Deny camera permission', 'See fallback UI'],
  expectedOutcome: 'CameraPermissionFallback displayed with retry option',
}
```

### Edge Case Examples
```typescript
{
  id: 'UC-EDGE-001',
  title: 'Session Recovery After Browser Refresh',
  steps: ['Start workflow', 'Complete 3 steps', 'Refresh browser', 'See recovery banner'],
  expectedOutcome: 'Session restored to previous state',
}
```

### Integration Examples
```typescript
{
  id: 'UC-INT-001',
  title: 'Multi-Content Item with PDF and Video',
  steps: ['Create first content (PDF)', 'Add more content (Video)', 'Preview combined item'],
  expectedOutcome: 'Item displays both content pieces with reorder capability',
}
```

## Success Criteria

- [ ] PRD/Implementation plan parsed for user intent
- [ ] At least 1 use case per major PRD feature/story
- [ ] Use cases cover happy path, errors, and edge cases
- [ ] Pipeline test harness updated with use case section
- [ ] Each use case has clear steps and expected outcomes
- [ ] State file updated with use case metadata

## Failure Handling

- If PRD cannot be parsed: Log warning, generate minimal use cases from component names
- If components missing: Note which use cases are blocked
- If test page update fails: Output use cases to console for manual addition

---

**Created**: 2026-01-05
**Last Modified**: 2026-01-05
