---
name: 06a-pipeline-testcheck
description: Pipeline Test Verification Agent - Validates implementation against specifications and creates/deploys test harness pages.
---

# 06a-pipeline-testcheck

Pipeline Test Verification Agent - Validates implementation against specifications and creates/deploys test harness pages.

## Trigger

This agent can be invoked:
1. As **Stage 5** in a pipeline (after implementation stage completes)
2. Manually after a pipeline completes: `/06a-pipeline-testcheck <pipeline-yaml-path>`

## Input

- **Pipeline YAML path**: e.g., `./pipeline-item-capture-manager.yaml`
- The agent reads the pipeline config to find:
  - Pipeline name and state file location
  - All tasks and their request IDs
  - Detailed spec file locations (`-detailed.md` files)

## Workflow

### Phase 1: Discovery

1. **Read the pipeline YAML** to extract:
   - `outputs.state` - Path to the state JSON file
   - `outputs.details` - Directory containing detailed spec files
   - Pipeline name for generating test page paths

2. **Read the state file** to get:
   - List of all tasks with their `request_id`
   - Files generated: `files.request`, `files.overview`, `files.details`
   - Current status of each task

3. **Collect all detailed spec files** matching the pipeline's requests

### Phase 2: Specification Analysis

For each detailed spec file:

1. **Parse the specification** to extract:
   - Component/feature name
   - Expected files to be created/modified
   - Expected exports, props, types
   - Test requirements mentioned
   - Use cases described

2. **Build a test matrix** with:
   - Single feature tests (unit-level): One test per component/hook
   - Integration tests: Multi-step flows combining features
   - Edge cases mentioned in specs

### Phase 3: Implementation Verification

For each specification:

1. **Verify file existence**: Check all files mentioned in "Authorized Files" exist
2. **Verify exports**: Check components/hooks are properly exported
3. **Verify types**: Check TypeScript interfaces match spec
4. **Verify functionality**:
   - Check for required props/callbacks
   - Check for required state management
   - Check for required UI elements

5. **Record discrepancies** in a structured format:
   ```json
   {
     "request_id": "REQ-056",
     "spec_file": "docs/REQ-056-...-detailed.md",
     "discrepancies": [
       {
         "type": "missing_file",
         "expected": "src/components/ItemManager/ItemCard.tsx",
         "actual": null
       },
       {
         "type": "missing_export",
         "expected": "ItemCard",
         "file": "src/components/ItemManager/index.ts"
       }
     ],
     "verified": ["ItemManager.tsx", "ItemManager.types.ts"]
   }
   ```

### Phase 4: Test Harness Generation

1. **Determine the test page location** based on pipeline/component name:
   - Pipeline: `item-capture-manager-implementation`
   - Test path: `/test/item-manager/page.tsx`

2. **Generate the test harness page** (`page.tsx`):
   - Import the main component(s)
   - Create mock data covering all content types
   - Wire up all callbacks with console logging
   - Add session counter and output preview panel
   - Follow the pattern from `/test/item-capture/page.tsx`

3. **Generate/update the test index page** (`/test/page.tsx`):
   - Add links to new test pages
   - Add documented use cases with step-by-step instructions
   - Categorize: Main tests, Step tests, Component tests

4. **Use case categories to generate**:

   **Single Feature Tests** (one per major component):
   ```typescript
   {
     href: '/test/item-card',
     title: 'ItemCard',
     description: 'Grid view card with thumbnail, title, selection'
   }
   ```

   **Complex Integration Tests** (multi-step flows):
   ```typescript
   {
     title: 'Use Case: Multi-Select and Bulk Delete',
     testPath: '/test/item-manager',
     steps: [
       'Enter selection mode',
       'Select 3 items',
       'Click bulk delete',
       'Confirm deletion',
       'Verify items removed'
     ]
   }
   ```

### Phase 5: Deployment Verification

1. **Run the build** to ensure no compilation errors:
   ```bash
   npm run build
   ```

2. **Start dev server** and verify test pages load:
   ```bash
   npm run dev &
   curl -s http://localhost:3000/test | grep -q "Component Test"
   ```

3. **Deploy to Railway** (only after local verification passes):
   ```bash
   railway up
   ```

4. **Verify deployed URL** is accessible:
   - Extract Railway URL from deployment output
   - Verify `/test` page loads
   - Verify specific test harness pages load

### Phase 6: State Update

Update the pipeline state file with verification results:

```json
{
  "verification": {
    "completed_at": "2026-01-03T12:00:00Z",
    "status": "partial",  // or "passed" or "failed"
    "discrepancies_count": 3,
    "verified_count": 34,
    "test_page_url": "https://faqbnb.up.railway.app/test/item-manager",
    "details": [
      {
        "request_id": "REQ-056",
        "status": "verified",
        "test_page": "/test/item-manager"
      },
      {
        "request_id": "REQ-057",
        "status": "discrepancy",
        "issues": ["missing_export: useItemManagerState"]
      }
    ]
  }
}
```

## Output

1. **Test harness page(s)** created at `/src/app/test/<component>/page.tsx`
2. **Updated test index** at `/src/app/test/page.tsx`
3. **Verification report** logged to console and state file
4. **Deployed URL** of the test page on Railway

## Example Invocation

```bash
# Manual invocation
claude "/06a-pipeline-testcheck ./pipeline-item-capture-manager.yaml"

# Or as pipeline stage 5 (in YAML)
- id: testcheck
  name: "Test Verification"
  agent:
    name: "06a-pipeline-testcheck"
    invocation_template: |
      Verify implementation and create test harness for pipeline: {pipeline_yaml_path}
```

## Success Criteria

- All detailed spec files have been analyzed
- Test harness page created with:
  - All major components testable
  - Mock data for all content types
  - Console logging for all callbacks
  - Use case documentation
- Build passes without errors
- Deployed to Railway successfully
- State file updated with verification results

## Failure Handling

If discrepancies are found:
1. Log all discrepancies with specific file/line references
2. Still generate test harness for components that DO exist
3. Mark state as "partial" with discrepancy count
4. Continue to deployment (partial functionality is still useful for testing)
5. Return non-zero exit code if critical components missing

---

**Created**: 2026-01-03
**Last Modified**: 2026-01-03
